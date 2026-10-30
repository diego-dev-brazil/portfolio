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
  demoTracks?: TrackItem[];
  previewTracks?: TrackItem[];
  tracks?: TrackItem[];
};

const FALLBACK_TRACKS: TrackItem[] = [
  {
    track: 'Blackbird - Remastered 2009',
    artist: 'The Beatles',
    album: 'The Beatles (Remastered 2009)',
    songUrl: 'https://open.spotify.com/track/5jgFfDIR6FR0gvlA56Nakr',
    previewUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/d7/a8/7c/d7a87c46-c7c1-ad50-f7df-d69f9e5c7b30/mzaf_2918272753652652091.plus.aac.p.m4a',
  },
  {
    track: 'Ex-Factor',
    artist: 'Ms. Lauryn Hill',
    album: 'The Miseducation of Lauryn Hill',
    songUrl: 'https://open.spotify.com/track/2VjXGuPVVxyhMgER3Uz2Fe',
    previewUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/4a/b1/4d/4ab14d71-f15b-db05-4419-a83e2762bc8d/mzaf_9017806609491706778.plus.aac.p.m4a',
  },
  {
    track: 'As Tortas e as Cucas',
    artist: 'Jupiter Apple',
    album: 'A Sétima Efervescência',
    songUrl: 'https://open.spotify.com/track/3Wao5zMHFYwWiB5LSyPGPy',
    previewUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/bf/ce/5f/bfce5f49-1bbf-37db-d9d4-7075b69b5814/mzaf_255129602188928547.plus.aac.p.m4a',
  },
  {
    track: 'Sober to Death',
    artist: 'Car Seat Headrest',
    album: 'Twin Fantasy',
    songUrl: 'https://open.spotify.com/track/6kOHjAOLz9IvUiRGf72Kec',
    previewUrl:
      'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/0a/bb/43/0abb43b8-9d82-51e1-e7fa-e0013f507ecd/mzaf_4974754928188483521.plus.aac.p.m4a',
  },
];

export function PixelFishSpotify({
  defaultTrack = 'Blackbird - Remastered 2009',
  defaultArtist = 'The Beatles',
}: PixelFishProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [progressWidth, setProgressWidth] = useState(4);
  const [data, setData] = useState<SpotifyNowPlaying>({
    track: defaultTrack,
    artist: defaultArtist,
    songUrl: FALLBACK_TRACKS[0].songUrl,
    previewUrl: FALLBACK_TRACKS[0].previewUrl,
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const shouldAutoPlayNextRef = useRef(false);

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
    } catch {
      // Fallback silencioso para as faixas locais
    }
  }, [defaultArtist, defaultTrack]);

  useEffect(() => {
    void fetchNowPlaying();
    const interval = setInterval(() => void fetchNowPlaying(), 25000);
    return () => clearInterval(interval);
  }, [fetchNowPlaying]);

  const playlist: TrackItem[] = React.useMemo(() => {
    const apiTracks = data.demoTracks ?? data.previewTracks ?? data.tracks;
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
          previewUrl: data.previewUrl ?? FALLBACK_TRACKS[0].previewUrl,
        },
        ...FALLBACK_TRACKS.filter((item) => item.track !== data.track),
      ];
    }
    return FALLBACK_TRACKS;
  }, [data]);

  const activeTrack = playlist[trackIndex % playlist.length] ?? FALLBACK_TRACKS[0];

  // Quando troca de faixa via botão NEXT, toca automaticamente o áudio da nova faixa
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.65;
    if (shouldAutoPlayNextRef.current) {
      shouldAutoPlayNextRef.current = false;
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [activeTrack.previewUrl, trackIndex]);

  const handleTogglePlay = () => {
    const audio = audioRef.current;
    if (!audio) {
      setIsPlaying((prev) => !prev);
      return;
    }

    audio.volume = 0.65;
    if (audio.paused) {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const handleNextTrack = () => {
    shouldAutoPlayNextRef.current = true;
    setProgressWidth(2);
    setTrackIndex((prev) => (prev + 1) % playlist.length);
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const ratio = audio.currentTime / audio.duration;
    setProgressWidth(Math.max(2, Math.min(17, Math.round(ratio * 17))));
  };

  const track = activeTrack.track || defaultTrack;
  const artist = activeTrack.artist || defaultArtist;

  return (
    <div className="pixel-fish-spotify-card">
      {activeTrack.previewUrl && (
        <audio
          ref={audioRef}
          src={activeTrack.previewUrl}
          preload="none"
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            setIsPlaying(false);
            setProgressWidth(17);
          }}
        />
      )}

      {/* Botão no próprio Peixe Pixel Art em Tons de Azul Submarino */}
      <button
        type="button"
        onClick={handleTogglePlay}
        title={isPlaying ? 'Pausar música no peixe' : 'Clique no peixe para tocar a música'}
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

      {/* Metadados da Faixa */}
      <div className="pixel-fish-meta">
        <div className="pixel-fish-status">
          <span
            className={`pixel-fish-dot ${
              isPlaying ? 'pixel-fish-dot--playing' : ''
            }`}
          />
          <button
            type="button"
            onClick={handleTogglePlay}
            className="pixel-fish-play-text-btn"
          >
            {isPlaying
              ? data.configured
                ? 'SPOTIFY LIVE // TOCANDO (PAUSAR)'
                : 'SPOTIFY // TOCANDO ÁUDIO (PAUSAR)'
              : 'SPOTIFY // CLIQUE P/ OUVIR ▶'}
          </button>
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
            title="Próxima faixa com áudio"
          >
            NEXT ▸
          </button>
        </div>
      </div>
    </div>
  );
}
