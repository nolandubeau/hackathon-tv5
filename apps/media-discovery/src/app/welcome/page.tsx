'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { useDiscoveryStore, GENRES } from '@/lib/discovery-store';
import { useAudio } from '@/hooks/useAudio';
import titleVariations from '@/data/welcome-titles.json';

export default function DiscoverPage() {
  const router = useRouter();
  const {
    genres,
    clickSequence,
    totalTime,
    updateTotalTime,
    onHoverEnter,
    onHoverLeave,
    onThumbnailClick,
    trackVelocity,
    startTime,
    completeProfile,
    initializeGenres,
    startDiscovery,
    userName,
    profileComplete,
  } = useDiscoveryStore();

  const timerRef = useRef<number | null>(null);
  const lastMousePos = useRef({ x: 0, y: 0, time: 0 });
  const confettiFiredRef = useRef(false);
  const [shuffledGenres, setShuffledGenres] = useState<typeof GENRES>([]);
  const [randomTitle, setRandomTitle] = useState({ title: '', subtitle: '' });
  const { playHover, playClick } = useAudio();

  const showContinueButton = totalTime > 8 || clickSequence.length >= 3;

  // Only redirect if truly blocked, not on every load
  // Allow users to stay on this page even if they refresh
  useEffect(() => {
    // Don't auto-redirect, users can browse preferences even if incomplete
  }, []);

  // Initialize and start discovery on mount
  useEffect(() => {
    initializeGenres();
    startDiscovery();
    setShuffledGenres([...GENRES].sort(() => Math.random() - 0.5));
    // Select random title variation
    const randomIndex = Math.floor(Math.random() * titleVariations.variations.length);
    setRandomTitle(titleVariations.variations[randomIndex]);
  }, [initializeGenres, startDiscovery]);

  // Fire confetti when profile is ready
  useEffect(() => {
    if (showContinueButton && !confettiFiredRef.current) {
      confettiFiredRef.current = true;
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.9 },
        colors: ['#4ECDC4', '#FF6B6B', '#FFE66D', '#A855F7'],
      });
    }
  }, [showContinueButton]);

  // Timer logic
  useEffect(() => {
    if (startTime) {
      const animate = () => {
        const elapsed = (performance.now() - startTime) / 1000;
        updateTotalTime(elapsed);
        timerRef.current = requestAnimationFrame(animate);
      };
      timerRef.current = requestAnimationFrame(animate);

      return () => {
        if (timerRef.current) cancelAnimationFrame(timerRef.current);
      };
    }
  }, [startTime, updateTotalTime]);

  // Mouse velocity tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      const dt = now - lastMousePos.current.time;

      if (dt > 0) {
        const speed = Math.sqrt(dx * dx + dy * dy) / dt * 1000;
        trackVelocity(speed);
      }

      lastMousePos.current = { x: e.clientX, y: e.clientY, time: now };
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [trackVelocity]);

  const handleComplete = () => {
    completeProfile();
    router.push('/home');
  };

  return (
    <main className="min-h-screen bg-black">
      <div className="w-full max-w-[1000px] h-screen flex flex-col px-4 mx-auto">
        {/* Header - fixed at top */}
        <div className="text-center py-6 flex-shrink-0">
          <h1 className="headline-h1 mb-2 text-text-primary">
            {randomTitle.title || 'What catches your eye?'}
          </h1>
          <p className="text-body text-text-secondary">{randomTitle.subtitle || 'Select images that interest you'}</p>
          <div className="mono text-xl text-accent-cyan mt-2">
            {totalTime.toFixed(3)}s
          </div>
        </div>

        {/* Thumbnail Grid - scrollable */}
        <div className="flex-1 overflow-auto scrollbar-hide py-2 pb-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {shuffledGenres.map((genre, index) => {
              const genreData = genres[genre.id];
              const isClicked = genreData?.clickOrder !== null;

              return (
                <div
                  key={genre.id}
                  className="card-hover relative aspect-square overflow-hidden cursor-pointer rounded-lg"
                  style={{
                    borderWidth: '2px',
                    borderStyle: 'solid',
                    borderColor: isClicked ? genre.color : 'transparent',
                    animationDelay: `${index * 50}ms`,
                  }}
                  onMouseEnter={() => {
                    playHover();
                    onHoverEnter(genre.id);
                  }}
                  onMouseLeave={() => onHoverLeave(genre.id)}
                  onClick={() => {
                    playClick();
                    onThumbnailClick(genre.id);
                  }}
                >
                  <img
                    src={genre.src}
                    alt={genre.name}
                    className="w-full h-full object-cover"
                  />
                  {isClicked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="w-16 h-16 flex items-center justify-center rounded-full text-3xl font-bold animate-badge-pop shadow-lg"
                        style={{ backgroundColor: genre.color, color: '#0D1117' }}
                      >
                        {genreData?.clickOrder}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA - fixed at bottom */}
        <div className="flex-shrink-0 pt-2 pb-safe">
          <div className="relative mx-auto max-w-[300px]">
            <button
              className={`btn-primary w-full rounded-lg ${showContinueButton ? 'shadow-lg shadow-accent-cyan/30' : ''
                }`}
              onClick={handleComplete}
            >
              {showContinueButton ? 'Next' : 'Skip'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
