import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';
const NOW_PLAYING_ENDPOINT =
  'https://api.spotify.com/v1/me/player/currently-playing';
const RECENTLY_PLAYED_ENDPOINT =
  'https://api.spotify.com/v1/me/player/recently-played?limit=1';
const AUTHORIZE_ENDPOINT = 'https://accounts.spotify.com/authorize';

const SCOPES = [
  'user-read-currently-playing',
  'user-read-recently-played',
  'user-top-read',
].join(' ');

const DEMO_TRACKS = [
  {
    track: 'Buddy Holly',
    artist: 'Weezer',
    album: 'Weezer (Blue Album)',
    songUrl: 'https://open.spotify.com/track/3mwvKOyMmG77zZRunnxp9E',
    previewUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/44/78/03/4478034e-ab18-05d7-d191-19bd2a76a63a/mzaf_3248905697310152252.plus.aac.p.m4a',
    progressMs: 0,
    durationMs: 30000,
  },
  {
    track: 'Island In The Sun',
    artist: 'Weezer',
    album: 'Weezer (Green Album)',
    songUrl: 'https://open.spotify.com/track/2MLHyLy5z5l5YRp7momlgw',
    previewUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/52/a6/03/52a6032e-39c0-fd3e-555d-ce683f3d9d31/mzaf_7707796819108024384.plus.aac.p.m4a',
    progressMs: 0,
    durationMs: 30000,
  },
  {
    track: 'Veridis Quo',
    artist: 'Daft Punk',
    album: 'Discovery',
    songUrl: 'https://open.spotify.com/track/2LD2gT7gwAurzdQDQtILds',
    previewUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/e0/cc/c4/e0ccc4af-ad90-59fe-9a7c-9c32d1a3c380/mzaf_2643765405421046671.plus.aac.p.m4a',
    progressMs: 0,
    durationMs: 30000,
  },
];

async function resolveAudioPreview(
  track: string,
  artist: string,
  spotifyPreviewUrl?: string | null
): Promise<string | null> {
  if (spotifyPreviewUrl) return spotifyPreviewUrl;
  try {
    const query = encodeURIComponent(`${track} ${artist}`);
    const res = await fetch(
      `https://itunes.apple.com/search?term=${query}&entity=song&limit=1`,
      { cache: 'no-store' }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      results?: Array<{ previewUrl?: string }>;
    };
    return data.results?.[0]?.previewUrl ?? null;
  } catch {
    return null;
  }
}

function buildDemoPayload() {
  const primary = DEMO_TRACKS[0];
  return {
    configured: false,
    demoMode: true,
    isPlaying: false,
    track: primary.track,
    artist: primary.artist,
    album: primary.album,
    songUrl: primary.songUrl,
    previewUrl: primary.previewUrl,
    progressMs: primary.progressMs,
    durationMs: primary.durationMs,
    demoTracks: DEMO_TRACKS,
  };
}

async function getAccessToken(
  clientId: string,
  clientSecret: string,
  refreshToken: string
) {
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Falha ao renovar token do Spotify: HTTP ${response.status}`);
  }

  return response.json() as Promise<{ access_token: string }>;
}

async function saveRefreshTokenToEnvLocal(refreshToken: string) {
  const envPath = path.join(process.cwd(), '.env.local');
  try {
    let content = '';
    try {
      content = await fs.readFile(envPath, 'utf-8');
    } catch {
      content = '';
    }
    if (/^SPOTIFY_REFRESH_TOKEN=.*$/m.test(content)) {
      content = content.replace(
        /^SPOTIFY_REFRESH_TOKEN=.*$/m,
        `SPOTIFY_REFRESH_TOKEN=${refreshToken}`
      );
    } else {
      content = `${content.trimEnd()}\nSPOTIFY_REFRESH_TOKEN=${refreshToken}\n`;
    }
    await fs.writeFile(envPath, content, 'utf-8');
    return true;
  } catch {
    return false;
  }
}

// Cache em memória para funcionar imediatamente após o callback OAuth sem precisar reiniciar o servidor
let runtimeRefreshToken: string | null = null;

export async function GET(request: NextRequest) {
  const clientId = process.env.SPOTIFY_CLIENT_ID?.trim();
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET?.trim();
  const refreshToken =
    runtimeRefreshToken || process.env.SPOTIFY_REFRESH_TOKEN?.trim();

  const { searchParams, origin } = request.nextUrl;
  const isDev = process.env.NODE_ENV === 'development';
  // No ambiente local, o Spotify exige 127.0.0.1 (e o Next.js 15 converte nextUrl.origin para localhost)
  const redirectUri = isDev
    ? 'http://127.0.0.1:3000/api/spotify'
    : `${origin}/api/spotify`;

  // 1. Fluxo auxiliar para conectar sua conta do Spotify localmente:
  // Acesse http://127.0.0.1:3000/api/spotify?login=1
  if (isDev && searchParams.get('login') === '1') {
    if (!clientId || !clientSecret) {
      return NextResponse.json(
        {
          error:
            'Para conectar sua conta do Spotify, adicione SPOTIFY_CLIENT_ID e SPOTIFY_CLIENT_SECRET no arquivo .env.local e acesse /api/spotify?login=1 novamente.',
          redirectUriToRegisterInSpotifyDashboard: redirectUri,
        },
        { status: 400 }
      );
    }

    const authUrl = new URL(AUTHORIZE_ENDPOINT);
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', SCOPES);
    return NextResponse.redirect(authUrl.toString());
  }

  // 2. Callback OAuth que salva automaticamente o SPOTIFY_REFRESH_TOKEN no .env.local e redireciona para o portfólio:
  const code = searchParams.get('code');
  if (isDev && code && clientId && clientSecret) {
    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const tokenRes = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
      cache: 'no-store',
    });

    const tokenData = (await tokenRes.json()) as {
      refresh_token?: string;
      error?: string;
    };

    if (tokenData.refresh_token) {
      runtimeRefreshToken = tokenData.refresh_token;
      await saveRefreshTokenToEnvLocal(tokenData.refresh_token);
      return NextResponse.redirect('http://127.0.0.1:3000/#projetos');
    }

    return NextResponse.json(
      { success: false, error: 'Falha ao gerar token OAuth do Spotify.' },
      { status: 400 }
    );
  }

  // 3. Consulta em tempo real da faixa tocando agora ou tocada recentemente:
  if (!clientId || !clientSecret || !refreshToken) {
    return NextResponse.json(buildDemoPayload());
  }

  try {
    const { access_token } = await getAccessToken(
      clientId,
      clientSecret,
      refreshToken
    );

    const nowPlayingRes = await fetch(NOW_PLAYING_ENDPOINT, {
      headers: { Authorization: `Bearer ${access_token}` },
      cache: 'no-store',
    });

    if (nowPlayingRes.status === 200) {
      const song = (await nowPlayingRes.json()) as {
        is_playing: boolean;
        progress_ms?: number;
        item?: {
          name: string;
          artists: Array<{ name: string }>;
          album: { name: string; images: Array<{ url: string }> };
          external_urls: { spotify: string };
          preview_url: string | null;
          duration_ms?: number;
        };
      };

      if (song.item) {
        const artistName = song.item.artists.map((a) => a.name).join(', ');
        const previewUrl = await resolveAudioPreview(
          song.item.name,
          artistName,
          song.item.preview_url
        );

        return NextResponse.json({
          configured: true,
          demoMode: false,
          isPlaying: song.is_playing,
          track: song.item.name,
          artist: artistName,
          album: song.item.album.name,
          albumImageUrl: song.item.album.images[0]?.url ?? null,
          songUrl: song.item.external_urls.spotify,
          previewUrl,
          progressMs: song.progress_ms ?? 0,
          durationMs: song.item.duration_ms ?? 30000,
          demoTracks: DEMO_TRACKS,
        });
      }
    }

    // Fallback: última música reproduzida na conta do Spotify
    const recentRes = await fetch(RECENTLY_PLAYED_ENDPOINT, {
      headers: { Authorization: `Bearer ${access_token}` },
      cache: 'no-store',
    });

    if (recentRes.ok) {
      const recentData = (await recentRes.json()) as {
        items?: Array<{
          track: {
            name: string;
            artists: Array<{ name: string }>;
            album: { name: string; images: Array<{ url: string }> };
            external_urls: { spotify: string };
            preview_url: string | null;
            duration_ms?: number;
          };
        }>;
      };
      const lastTrack = recentData.items?.[0]?.track;
      if (lastTrack) {
        const artistName = lastTrack.artists.map((a) => a.name).join(', ');
        const previewUrl = await resolveAudioPreview(
          lastTrack.name,
          artistName,
          lastTrack.preview_url
        );

        return NextResponse.json({
          configured: true,
          demoMode: false,
          isPlaying: false,
          track: lastTrack.name,
          artist: artistName,
          album: lastTrack.album.name,
          albumImageUrl: lastTrack.album.images[0]?.url ?? null,
          songUrl: lastTrack.external_urls.spotify,
          previewUrl,
          progressMs: 0,
          durationMs: lastTrack.duration_ms ?? 30000,
          demoTracks: DEMO_TRACKS,
        });
      }
    }

    return NextResponse.json(buildDemoPayload());
  } catch {
    return NextResponse.json(buildDemoPayload(), { status: 200 });
  }
}
