'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

interface PixelFishProps {
  defaultTrack?: string;
  defaultArtist?: string;
}

type TrackItem = {
  track: string;
  artist: string;
  album?: string;
  songUrl?: string;
  previewUrl?: string | null;
  progressMs?: number;
  durationMs?: number;
};

type SpotifyNowPlaying = TrackItem & {
  configured?: boolean;
  isPlaying?: boolean;
  previewTracks?: TrackItem[];
  tracks?: TrackItem[];
};

const FALLBACK_TRACKS: TrackItem[] = [
  {
    track: 'Buddy Holly',
    artist: 'Weezer',
    album: 'Weezer (Blue Album)',
    songUrl: 'https://open.spotify.com/track/3mwvKOyMmG77zZRunnxp9E',
    previewUrl: null,
  },
  {
    track: 'Island In The Sun',
    artist: 'Weezer',
    album: 'Weezer (Green Album)',
    songUrl: 'https://open.spotify.com/track/2MLHyLy5z5l5YRp7momlgw',
    previewUrl: null,
  },
  {
    track: 'Veridis Quo',
    artist: 'Daft Punk',
    album: 'Discovery',
    songUrl: 'https://open.spotify.com/track/2LD2gT7gwAurzdQDQtILds',
    previewUrl: null,
  },
];

export function PixelFishSpotify({
  defaultTrack = 'Buddy Holly',
  defaultArtist = 'Weezer',
}: PixelFishProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [trackIndex, setTrackIndex] = useState(0);
  const [progressWidth, setProgressWidth] = useState(7);
  const [data, setData] = useState<SpotifyNowPlaying>({
    track: defaultTrack,
    artist: defaultArtist,
    songUrl: 'https://open.spotify.com/track/3mwvKOyMmG77zZRunnxp9E',
    previewUrl: null,
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchNowPlaying = useCallback(async () => {
    try {
      const res = await fetch('/api/spotify', { cache: 'no-store' });
      if (!res.ok) return;
      const json = (await res.json()) as SpotifyNowPlaying;
      setData((prev) => ({
        ...prev,
        ...json,
        track: json.track || defaultTrack,
        artist: json.artist || defaultArtist,
      }));
      if (typeof json.isPlaying === 'boolean' && json.configured) {
        setIsPlaying(json.isPlaying);
      }
      if (json.progressMs && json.durationMs) {
        setProgressWidth(
          Math.max(3, Math.min(17, Math.round((json.progressMs / json.durationMs) * 17))),
        );
      }
    } catch {
      // Fallback silencioso para o modo preview local
    }
  }, [defaultArtist, defaultTrack]);

  useEffect(() => {
    void fetchNowPlaying();
    const interval = setInterval(() => void fetchNowPlaying(), 20000);
    return () => clearInterval(interval);
  }, [fetchNowPlaying]);

  // Anima a barra de progresso em tempo real enquanto estiver tocando
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setProgressWidth((prev) => (prev >= 17 ? 3 : prev + 1));
    }, 650);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const playlist: TrackItem[] = React.useMemo(() => {
    const apiTracks = data.previewTracks ?? data.tracks;
    if (Array.isArray(apiTracks) && apiTracks.length > 0) {
      return apiTracks;
    }
    if (data.configured && data.track && data.artist) {
      return [
        {
          track: data.track,
          artist: data.artist,
          album: data.album,
          songUrl: data.songUrl,
          previewUrl: data.previewUrl,
        },
        ...FALLBACK_TRACKS.filter((item) => item.track !== data.track),
      ];
    }
    return FALLBACK_TRACKS;
  }, [data]);

  const activeTrack = playlist[trackIndex % playlist.length] ?? FALLBACK_TRACKS[0];

  const handleTogglePlay = () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);

    if (audioRef.current && activeTrack.previewUrl) {
      if (nextState) {
        void audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  };

  const handleNextTrack = () => {
    setTrackIndex((prev) => (prev + 1) % playlist.length);
    setProgressWidth(3);
    setIsPlaying(true);
  };

  const track = activeTrack.track || defaultTrack;
  const artist = activeTrack.artist || defaultArtist;

  return (
    <div className="pixel-fish-spotify-card">
      {activeTrack.previewUrl && (
        <audio
          ref={audioRef}
          src={activeTrack.previewUrl}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* Botão no próprio Peixe Pixel Art em Tons de Azul Submarino */}
      <button
        type="button"
        onClick={handleTogglePlay}
        title={isPlaying ? 'Pausar player no peixe' : 'Tocar player no peixe'}
        aria-pressed={isPlaying}
        className="pixel-fish-btn"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 68 32"
          className="pixel-fish-svg"
          shapeRendering="crispEdges"
        >
          {/* Barbatanas (Azul Oceano & Ciano Bioluminescente) */}
          <path fill="#041E30" d="M22,2 h18 v2 h2 v2 h-22 v-2 h2 z" />
          <path fill="#38BDF8" d="M23,3 h16 v2 h-16 z" />
          <path fill="#0284C7" d="M25,5 h16 v1 h-16 z" />
          <path fill="#041E30" d="M26,26 h10 v2 h-2 v2 h-8 v-2 h2 z" />
          <path fill="#0284C7" d="M27,26 h8 v2 h-6 v1 h-2 z" />

          {/* Contorno e Cauda em Azul Profundo + Ciano */}
          <path
            fill="#041E30"
            d="M8,12 h2 v-2 h4 v-2 h4 v-2 h28 v2 h4 v2 h4 v-2 h4 v-2 h4 v-2 h2 v18 h-2 v-2 h-4 v-2 h-4 v-2 h-4 v2 h-4 v2 h-28 v-2 h-4 v-2 h-4 v-2 h-2 v-4 z"
          />
          <path
            fill="#0284C7"
            d="M54,12 h4 v-2 h4 v-2 h2 v14 h-2 v-2 h-4 v-2 h-4 z"
          />
          <path
            fill="#38BDF8"
            d="M54,13 h4 v-2 h4 v4 h-4 v-1 h-4 z"
          />

          {/* Corpo Azul Submarino Metálico */}
          <path
            fill="#0C4A6E"
            d="M10,12 h4 v-2 h4 v-2 h28 v2 h4 v2 h4 v6 h-4 v2 h-4 v2 h-28 v-2 h-4 v-2 h-4 z"
          />
          <path
            fill="#0369A1"
            d="M18,8 h28 v2 h-28 z M14,10 h4 v2 h-4 z M46,10 h4 v2 h-4 z"
          />
          <path
            fill="#082F49"
            d="M18,21 h28 v1 h-28 z M14,19 h4 v2 h-4 z"
          />

          {/* Headphone Pixelado Azul/Turquesa */}
          <path fill="#7DD3FC" d="M15,6 h3 v4 h-1 v-3 h-2 z" />
          <path fill="#041E30" d="M15,10 h4 v5 h-4 z" />
          <path fill="#22D3EE" d="M16,11 h2 v3 h-2 z" />

          {/* Olho */}
          <path fill="#F0F9FF" d="M11,12 h3 v3 h-3 z" />
          <path fill="#041E30" d="M11,13 h2 v2 h-2 z" />
          <path fill="#FFFFFF" d="M12,12 h1 v1 h-1 z" />

          {/* Visor do Player no Corpinho */}
          <path fill="#020D17" d="M21,10 h28 v10 h-28 z" />
          <path fill="#061928" d="M22,11 h26 v8 h-26 z" />
          <path fill="#0C4A6E" d="M22,11 h26 v1 h-26 z" />

          {/* Ícone Play / Pause dentro da barriga */}
          {isPlaying ? (
            <path fill="#34D399" d="M24,13 h1 v5 h-1 z M26,13 h1 v5 h-1 z" />
          ) : (
            <path
              fill="#38BDF8"
              d="M24,13 h1 v5 h-1 z M25,14 h1 v3 h-1 z M26,15 h1 v1 h-1 z"
            />
          )}

          {/* Barras do Equalizador no Corpinho */}
          <rect
            x="29"
            y={isPlaying ? '13' : '16'}
            width="2"
            height={isPlaying ? '4' : '1'}
            fill="#22D3EE"
            className={isPlaying ? 'eq-bar eq-bar--1' : ''}
          />
          <rect
            x="32"
            y={isPlaying ? '12' : '16'}
            width="2"
            height={isPlaying ? '5' : '1'}
            fill="#34D399"
            className={isPlaying ? 'eq-bar eq-bar--2' : ''}
          />
          <rect
            x="35"
            y={isPlaying ? '14' : '16'}
            width="2"
            height={isPlaying ? '3' : '1'}
            fill="#38BDF8"
            className={isPlaying ? 'eq-bar eq-bar--3' : ''}
          />
          <rect
            x="38"
            y={isPlaying ? '12' : '16'}
            width="2"
            height={isPlaying ? '5' : '1'}
            fill="#34D399"
            className={isPlaying ? 'eq-bar eq-bar--1' : ''}
          />
          <rect
            x="41"
            y={isPlaying ? '13' : '16'}
            width="2"
            height={isPlaying ? '4' : '1'}
            fill="#22D3EE"
            className={isPlaying ? 'eq-bar eq-bar--2' : ''}
          />
          <rect
            x="44"
            y={isPlaying ? '14' : '16'}
            width="2"
            height={isPlaying ? '3' : '1'}
            fill="#0284C7"
            className={isPlaying ? 'eq-bar eq-bar--3' : ''}
          />

          {/* Barra de Progresso Azul Ciano na Base da Barriga */}
          <path fill="#0C4A6E" d="M29,18 h17 v1 h-17 z" />
          <path fill="#38BDF8" d={`M29,18 h${progressWidth} v1 h-${progressWidth} z`} />
          <path fill="#F0F9FF" d={`M${29 + progressWidth},18 h1 v1 h-1 z`} />

          {/* Bolhas de Som */}
          {isPlaying && (
            <>
              <path
                fill="#7DD3FC"
                d="M4,11 h2 v2 h-2 z"
                className="fish-sound-bubble"
              />
              <path
                fill="#34D399"
                d="M6,15 h1 v1 h-1 z"
                className="fish-sound-bubble fish-sound-bubble--delayed"
              />
            </>
          )}
        </svg>
      </button>

      {/* Metadados da Faixa (Estilo Linear / Monospace Submarino) */}
      <div className="pixel-fish-meta">
        <div className="pixel-fish-status">
          <span
            className={`pixel-fish-dot ${
              isPlaying ? 'pixel-fish-dot--playing' : ''
            }`}
          />
          <span>
            {isPlaying
              ? data.configured
                ? 'SPOTIFY LIVE // PLAYING'
                : 'SPOTIFY PREVIEW // PLAYING'
              : 'SPOTIFY // PAUSED'}
          </span>
        </div>
        <div className="pixel-fish-track-row">
          <a
            href={activeTrack.songUrl || 'https://open.spotify.com'}
            target="_blank"
            rel="noreferrer"
            className="pixel-fish-track"
            title="Abrir faixa no Spotify"
          >
            {track} <span>— {artist} ↗</span>
          </a>
          <button
            type="button"
            onClick={handleNextTrack}
            className="pixel-fish-next-btn"
            title="Alternar para a próxima faixa de preview"
          >
            NEXT ▸
          </button>
        </div>
      </div>
    </div>
  );
}

