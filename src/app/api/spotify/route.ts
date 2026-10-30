import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';
const NOW_PLAYING_ENDPOINT =
  'https://api.spotify.com/v1/me/player/currently-playing';
const RECENTLY_PLAYED_ENDPOINT =
  'https://api.spotify.com/v1/me/player/recently-played?limit=8';
const AUTHORIZE_ENDPOINT = 'https://accounts.spotify.com/authorize';

const SCOPES = [
  'user-read-currently-playing',
  'user-read-recently-played',
  'user-top-read',
].join(' ');

const DEMO_TRACKS = [
  {
    track: 'Blackbird - Remastered 2009',
    artist: 'The Beatles',
    album: 'The Beatles (Remastered 2009)',
    songUrl: 'https://open.spotify.com/track/5jgFfDIR6FR0gvlA56Nakr',
    previewUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/d7/a8/7c/d7a87c46-c7c1-ad50-f7df-d69f9e5c7b30/mzaf_2918272753652652091.plus.aac.p.m4a',
    progressMs: 0,
    durationMs: 138386,
  },
  {
    track: 'Ex-Factor',
    artist: 'Ms. Lauryn Hill',
    album: 'The Miseducation of Lauryn Hill',
    songUrl: 'https://open.spotify.com/track/2VjXGuPVVxyhMgER3Uz2Fe',
    previewUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/4a/b1/4d/4ab14d71-f15b-db05-4419-a83e2762bc8d/mzaf_9017806609491706778.plus.aac.p.m4a',
    progressMs: 0,
    durationMs: 326533,
  },
  {
    track: 'As Tortas e as Cucas',
    artist: 'Jupiter Apple',
    album: 'A Sétima Efervescência',
    songUrl: 'https://open.spotify.com/track/3Wao5zMHFYwWiB5LSyPGPy',
    previewUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/bf/ce/5f/bfce5f49-1bbf-37db-d9d4-7075b69b5814/mzaf_255129602188928547.plus.aac.p.m4a',
    progressMs: 0,
    durationMs: 277733,
  },
  {
    track: 'Sober to Death',
    artist: 'Car Seat Headrest',
    album: 'Twin Fantasy',
    songUrl: 'https://open.spotify.com/track/6kOHjAOLz9IvUiRGf72Kec',
    previewUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/0a/bb/43/0abb43b8-9d82-51e1-e7fa-e0013f507ecd/mzaf_4974754928188483521.plus.aac.p.m4a',
    progressMs: 0,
    durationMs: 304427,
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

    type SpotifyTrackRaw = {
      name: string;
      artists: Array<{ name: string }>;
      album: { name: string; images: Array<{ url: string }> };
      external_urls: { spotify: string };
      preview_url: string | null;
      duration_ms?: number;
    };

    const [nowPlayingRes, recentRes] = await Promise.all([
      fetch(NOW_PLAYING_ENDPOINT, {
        headers: { Authorization: `Bearer ${access_token}` },
        cache: 'no-store',
      }),
      fetch(RECENTLY_PLAYED_ENDPOINT, {
        headers: { Authorization: `Bearer ${access_token}` },
        cache: 'no-store',
      }),
    ]);

    const recentTracksList: Array<{
      track: string;
      artist: string;
      album: string;
      songUrl: string;
      previewUrl: string | null;
      progressMs: number;
      durationMs: number;
    }> = [];

    if (recentRes.ok) {
      const recentData = (await recentRes.json()) as {
        items?: Array<{ track: SpotifyTrackRaw }>;
      };
      const seen = new Set<string>();
      const uniqueRaw: SpotifyTrackRaw[] = [];
      for (const entry of recentData.items ?? []) {
        if (!entry?.track?.name || seen.has(entry.track.name)) continue;
        seen.add(entry.track.name);
        uniqueRaw.push(entry.track);
        if (uniqueRaw.length >= 4) break;
      }

      const resolvedRecent = await Promise.all(
        uniqueRaw.map(async (t) => {
          const artistName = t.artists.map((a) => a.name).join(', ');
          const previewUrl = await resolveAudioPreview(
            t.name,
            artistName,
            t.preview_url
          );
          return {
            track: t.name,
            artist: artistName,
            album: t.album.name,
            songUrl: t.external_urls.spotify,
            previewUrl,
            progressMs: 0,
            durationMs: t.duration_ms ?? 30000,
          };
        })
      );
      recentTracksList.push(...resolvedRecent);
    }

    if (nowPlayingRes.status === 200) {
      const song = (await nowPlayingRes.json()) as {
        is_playing: boolean;
        progress_ms?: number;
        item?: SpotifyTrackRaw;
      };

      if (song.item) {
        const artistName = song.item.artists.map((a) => a.name).join(', ');
        const previewUrl = await resolveAudioPreview(
          song.item.name,
          artistName,
          song.item.preview_url
        );

        const currentTrackItem = {
          track: song.item.name,
          artist: artistName,
          album: song.item.album.name,
          songUrl: song.item.external_urls.spotify,
          previewUrl,
          progressMs: song.progress_ms ?? 0,
          durationMs: song.item.duration_ms ?? 30000,
        };

        const mergedPlaylist = [
          currentTrackItem,
          ...recentTracksList.filter((r) => r.track !== currentTrackItem.track),
        ];

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
          demoTracks: mergedPlaylist.length > 0 ? mergedPlaylist : DEMO_TRACKS,
        });
      }
    }

    if (recentTracksList.length > 0) {
      const lastTrack = recentTracksList[0];
      return NextResponse.json({
        configured: true,
        demoMode: false,
        isPlaying: false,
        track: lastTrack.track,
        artist: lastTrack.artist,
        album: lastTrack.album,
        albumImageUrl: null,
        songUrl: lastTrack.songUrl,
        previewUrl: lastTrack.previewUrl,
        progressMs: 0,
        durationMs: lastTrack.durationMs,
        demoTracks: recentTracksList,
      });
    }

    return NextResponse.json(buildDemoPayload());
  } catch {
    return NextResponse.json(buildDemoPayload(), { status: 200 });
  }
}
