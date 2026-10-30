'use client';

import { useState } from 'react';

type SwimmingFish = {
  id: string;
  src: string;
  alt: string;
  top: string;
  size: number;
  duration: number;
  delay: number;
  direction: 'right' | 'left';
  depthOpacity: number;
  bobAmount: number;
  isPuffer?: boolean;
};

const FISH_SWARM: SwimmingFish[] = [
  // Shallow turquoise water fishes
  {
    id: 'clown-shallow',
    src: '/assets/fish/ClownFish.png',
    alt: 'Peixe-palhaço',
    top: '620px',
    size: 46,
    duration: 24,
    delay: -3,
    direction: 'right',
    depthOpacity: 0.95,
    bobAmount: 10,
  },
  {
    id: 'anchovy-1',
    src: '/assets/fish/Anchovy.png',
    alt: 'Anchova',
    top: '680px',
    size: 36,
    duration: 18,
    delay: -7,
    direction: 'left',
    depthOpacity: 0.88,
    bobAmount: 7,
  },
  {
    id: 'anchovy-2',
    src: '/assets/fish/Anchovy.png',
    alt: 'Anchova',
    top: '702px',
    size: 32,
    duration: 18,
    delay: -7.6,
    direction: 'left',
    depthOpacity: 0.82,
    bobAmount: 8,
  },
  {
    id: 'tang-shallow',
    src: '/assets/fish/BlueTang.png',
    alt: 'Cirurgião-patela',
    top: '820px',
    size: 52,
    duration: 29,
    delay: -14,
    direction: 'left',
    depthOpacity: 0.94,
    bobAmount: 14,
  },
  // Mid-reef fishes
  {
    id: 'puffer-mid',
    src: '/assets/fish/PufferFish0.png',
    alt: 'Baiacu',
    top: '1060px',
    size: 58,
    duration: 34,
    delay: -10,
    direction: 'right',
    depthOpacity: 0.95,
    bobAmount: 16,
    isPuffer: true,
  },
  {
    id: 'mackerel-mid',
    src: '/assets/fish/Mackerel.png',
    alt: 'Cavala',
    top: '1250px',
    size: 52,
    duration: 22,
    delay: -5,
    direction: 'left',
    depthOpacity: 0.88,
    bobAmount: 11,
  },
  {
    id: 'bluefish-mid',
    src: '/assets/fish/BlueFish.png',
    alt: 'Marlim-azul',
    top: '1480px',
    size: 98,
    duration: 27,
    delay: -18,
    direction: 'right',
    depthOpacity: 0.9,
    bobAmount: 14,
  },
  {
    id: 'clown-mid',
    src: '/assets/fish/ClownFish.png',
    alt: 'Peixe-palhaço',
    top: '1690px',
    size: 44,
    duration: 30,
    delay: -12,
    direction: 'left',
    depthOpacity: 0.86,
    bobAmount: 12,
  },
  // Deep dark water fishes
  {
    id: 'shark-deep',
    src: '/assets/fish/Shark.png',
    alt: 'Tubarão',
    top: '1920px',
    size: 118,
    duration: 36,
    delay: -8,
    direction: 'left',
    depthOpacity: 0.82,
    bobAmount: 10,
  },
  {
    id: 'sunfish-deep',
    src: '/assets/fish/SunFish.png',
    alt: 'Peixe-lua',
    top: '2180px',
    size: 108,
    duration: 44,
    delay: -22,
    direction: 'right',
    depthOpacity: 0.8,
    bobAmount: 18,
  },
  {
    id: 'stonefish-abyss',
    src: '/assets/fish/StoneFish.png',
    alt: 'Peixe-pedra',
    top: '2420px',
    size: 54,
    duration: 40,
    delay: -16,
    direction: 'right',
    depthOpacity: 0.78,
    bobAmount: 6,
  },
];

const BUBBLES = Array.from({ length: 32 }, (_, index) => {
  const left = ((index * 37) % 96) + 2;
  const size = 5 + ((index * 7) % 14);
  const duration = 10 + ((index * 5) % 14);
  const delay = -((index * 2.9) % 20);
  const drift = index % 2 === 0 ? 18 : -18;
  return { id: `bubble-${index}`, left: `${left}%`, size, duration, delay, drift };
});

export function OceanBackdrop() {
  const [puffed, setPuffed] = useState(false);

  return (
    <div className="ocean-stage" aria-hidden="true">
      {/* Underwater caustic rays starting below the waterline */}
      <div className="ocean-sunbeams" />

      {/* Rising bubbles layer */}
      <div className="bubble-field">
        {BUBBLES.map((bubble) => (
          <span
            key={bubble.id}
            className="ocean-bubble"
            style={
              {
                left: bubble.left,
                width: `${bubble.size}px`,
                height: `${bubble.size}px`,
                animationDuration: `${bubble.duration}s`,
                animationDelay: `${bubble.delay}s`,
                '--bubble-drift': `${bubble.drift}px`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* Swimming pixel-art fishes across shallow, mid, and deep zones */}
      <div className="fish-layer">
        {FISH_SWARM.map((fish) => {
          const imgSrc =
            fish.isPuffer && puffed ? '/assets/fish/PufferFish1.png' : fish.src;
          return (
            <div
              key={fish.id}
              className={`fish-track fish-track--${fish.direction}`}
              style={
                {
                  top: fish.top,
                  animationDuration: `${fish.duration}s`,
                  animationDelay: `${fish.delay}s`,
                  opacity: fish.depthOpacity,
                } as React.CSSProperties
              }
            >
              <div
                className="fish-bob"
                style={
                  {
                    '--bob-distance': `${fish.bobAmount}px`,
                  } as React.CSSProperties
                }
              >
                <img
                  src={imgSrc}
                  alt={fish.alt}
                  width={fish.size}
                  height={fish.size}
                  className={`pixel-sprite fish-sprite${
                    fish.direction === 'left' ? ' fish-sprite--flip' : ''
                  }${fish.isPuffer ? ' fish-sprite--interactive' : ''}`}
                  onMouseEnter={
                    fish.isPuffer ? () => setPuffed(true) : undefined
                  }
                  onMouseLeave={
                    fish.isPuffer ? () => setPuffed(false) : undefined
                  }
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
