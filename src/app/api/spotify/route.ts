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
    previewUrl: null,
    progressMs: 68000,
    durationMs: 160000,
  },
  {
    track: 'Island In The Sun',
    artist: 'Weezer',
    album: 'Weezer (Green Album)',
    songUrl: 'https://open.spotify.com/track/2MLHyLy5z5l5YRp7momlgw',
    previewUrl: null,
    progressMs: 95000,
    durationMs: 200000,
  },
  {
    track: 'Veridis Quo',
    artist: 'Daft Punk',
    album: 'Discovery',
    songUrl: 'https://open.spotify.com/track/2LD2gT7gwAurzdQDQtILds',
    previewUrl: null,
    progressMs: 142000,
    durationMs: 345000,
  },
];

function buildDemoPayload() {
  const primary = DEMO_TRACKS[0];
  return {
    configured: false,
    demoMode: true,
    isPlaying: true,
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
  refreshToken: string,
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

export async function GET(request: NextRequest) {
  const clientId = process.env.SPOTIFY_CLIENT_ID?.trim();
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET?.trim();
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN?.trim();

  const { searchParams, origin } = request.nextUrl;
  const redirectUri = `${origin}/api/spotify`;

  const isDev = process.env.NODE_ENV === 'development';

  // 1. Fluxo auxiliar para gerar o SPOTIFY_REFRESH_TOKEN (restrito ao modo dev local):
  if (isDev && searchParams.get('login') === '1') {
    if (!clientId) {
      return NextResponse.json(
        {
          error:
            'Adicione SPOTIFY_CLIENT_ID e SPOTIFY_CLIENT_SECRET no arquivo .env.local antes de iniciar o login.',
        },
        { status: 400 },
      );
    }

    const authUrl = new URL(AUTHORIZE_ENDPOINT);
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', SCOPES);
    return NextResponse.redirect(authUrl.toString());
  }

  // 2. Callback OAuth restrito ao modo dev local (retorna JSON seguro):
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

    return NextResponse.json({
      success: Boolean(tokenData.refresh_token),
      instruction: tokenData.refresh_token
        ? 'Copie o valor de refreshToken para SPOTIFY_REFRESH_TOKEN no arquivo .env.local'
        : 'Falha ao gerar token OAuth.',
      refreshToken: tokenData.refresh_token ?? null,
    });
  }

  // 3. Consulta em tempo real da faixa tocando agora ou tocada recentemente:
  if (!clientId || !clientSecret || !refreshToken) {
    return NextResponse.json(buildDemoPayload());
  }

  try {
    const { access_token } = await getAccessToken(
      clientId,
      clientSecret,
      refreshToken,
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
        return NextResponse.json({
          configured: true,
          demoMode: false,
          isPlaying: song.is_playing,
          track: song.item.name,
          artist: song.item.artists.map((a) => a.name).join(', '),
          album: song.item.album.name,
          albumImageUrl: song.item.album.images[0]?.url ?? null,
          songUrl: song.item.external_urls.spotify,
          previewUrl: song.item.preview_url,
          progressMs: song.progress_ms ?? 0,
          durationMs: song.item.duration_ms ?? 1,
        });
      }
    }

    // Fallback: última música reproduzida na conta
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
        return NextResponse.json({
          configured: true,
          demoMode: false,
          isPlaying: false,
          track: lastTrack.name,
          artist: lastTrack.artists.map((a) => a.name).join(', '),
          album: lastTrack.album.name,
          albumImageUrl: lastTrack.album.images[0]?.url ?? null,
          songUrl: lastTrack.external_urls.spotify,
          previewUrl: lastTrack.preview_url,
          progressMs: 0,
          durationMs: lastTrack.duration_ms ?? 160000,
        });
      }
    }

    return NextResponse.json({
      configured: true,
      demoMode: false,
      isPlaying: false,
      track: 'Buddy Holly',
      artist: 'Weezer',
      album: 'Weezer (Blue Album)',
      songUrl: 'https://open.spotify.com/track/3mwvKOyMmG77zZRunnxp9E',
      previewUrl: null,
      progressMs: 68000,
      durationMs: 160000,
    });
  } catch {
    return NextResponse.json(buildDemoPayload(), { status: 200 });
  }
}

