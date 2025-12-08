'use client';

import { Suspense, useEffect, useRef, useCallback, useState } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { SearchBar } from '@/components/SearchBar';
import { TrendingSection } from '@/components/TrendingSection';
import { RecommendationsSection } from '@/components/RecommendationsSection';
import { AdminWidget } from '@/components/AdminWidget';
import { useDiscoveryStore, GENRES } from '@/lib/discovery-store';

export default function HomePage() {
  const {
    currentScreen,
    setScreen,
    isTransitioning,
    setTransitioning,
    profileComplete,
    startDiscovery,
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
    getGenreScores,
    initializeGenres,
  } = useDiscoveryStore();

  const timerRef = useRef<number | null>(null);
  const lastMousePos = useRef({ x: 0, y: 0, time: 0 });
  const confettiFiredRef = useRef(false);
  const [shuffledGenres, setShuffledGenres] = useState<typeof GENRES>([]);

  const showContinueButton = totalTime > 8 || clickSequence.length >= 3;

  // Fire confetti when profile is ready
  useEffect(() => {
    if (showContinueButton && currentScreen === 'discovery' && !confettiFiredRef.current) {
      confettiFiredRef.current = true;
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.9 },
        colors: ['#4ECDC4', '#FF6B6B', '#FFE66D', '#A855F7'],
      });
    }
  }, [showContinueButton, currentScreen]);

  // Reset confetti flag when discovery restarts
  useEffect(() => {
    if (currentScreen === 'signin') {
      confettiFiredRef.current = false;
    }
  }, [currentScreen]);

  // Initialize genres on mount
  useEffect(() => {
    initializeGenres();
  }, [initializeGenres]);

  // Shuffle genres when entering discovery screen
  useEffect(() => {
    if (currentScreen === 'discovery') {
      setShuffledGenres([...GENRES].sort(() => Math.random() - 0.5));
    }
  }, [currentScreen]);

  // Timer logic
  useEffect(() => {
    if (currentScreen === 'discovery' && startTime) {
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
  }, [currentScreen, startTime, updateTotalTime]);

  // Mouse velocity tracking
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const now = performance.now();
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    const dt = now - lastMousePos.current.time;

    if (dt > 0) {
      const speed = Math.sqrt(dx * dx + dy * dy) / dt * 1000;
      trackVelocity(speed);
    }

    lastMousePos.current = { x: e.clientX, y: e.clientY, time: now };
  }, [trackVelocity]);

  useEffect(() => {
    if (currentScreen === 'discovery') {
      document.addEventListener('mousemove', handleMouseMove);
      return () => document.removeEventListener('mousemove', handleMouseMove);
    }
  }, [currentScreen, handleMouseMove]);

  // Screen transition
  const goToScreen = (screen: typeof currentScreen) => {
    if (isTransitioning) return;
    setTransitioning(true);

    setTimeout(() => {
      setScreen(screen);
      if (screen === 'discovery') startDiscovery();
      setTimeout(() => setTransitioning(false), 500);
    }, 400);
  };

  // Get top genres for personalized sections
  const topGenres = getGenreScores();
  const primaryGenres = topGenres.slice(0, 2);

  // Extract TMDB IDs for API filtering
  const primaryGenreIds = primaryGenres.map(g => g.tmdbId).filter(Boolean);

  // Determine if user completed profiling properly (8+ sec OR 3+ clicks)
  const hasProfile = !(clickSequence.length === 0 || (totalTime <= 8 && clickSequence.length < 3));

  // If profile is complete, show the main app
  if (profileComplete) {
    return (
      <main className="min-h-screen">
        {/* Admin Widget - Development Only */}
        {process.env.NODE_ENV === 'development' && <AdminWidget />}

        {/* Top Navigation */}
        <nav className="border-b border-border-subtle bg-bg-primary/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="headline-h3 text-text-primary">AI Media Discovery</div>
            <Link
              href="/about"
              className="text-text-secondary hover:text-accent-cyan transition-colors text-sm md:text-base"
            >
              About ARW
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative py-16 md:py-24 px-4 text-center bg-gradient-to-b from-accent-cyan/10 to-transparent">
          {hasProfile && (
            <>
              <h1 className="headline-hero mb-4 text-text-primary">
                Curated for You
              </h1>
              <p className="text-lg md:text-xl text-text-secondary mb-4 max-w-2xl mx-auto">
                Based on your unique viewing style.
              </p>
            </>
          )}
          {/* Time saved badge - only show if user completed profiling */}
          {hasProfile && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-bg-primary border border-border-subtle rounded-full mb-10">
              <span className="text-accent-cyan font-bold mono">{totalTime.toFixed(0)}s</span>
              <span className="text-text-secondary text-sm">to profile you, not 45 minutes</span>
            </div>
          )}

          {/* Disclosure if user skipped or didn't select */}
          {!hasProfile && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-genre-comedy/10 border border-genre-comedy/30 rounded-full mb-10">
              <span className="text-genre-comedy text-sm">
                {clickSequence.length === 0
                  ? "You didn't select any genres — showing general recommendations"
                  : "You skipped profiling — recommendations may be less personalized"
                }
              </span>
            </div>
          )}

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto">
            <Suspense fallback={<SearchBarSkeleton />}>
              <SearchBar />
            </Suspense>
          </div>

          {/* Example Prompts */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {[
              'sci-fi adventure',
              'romantic comedy',
              'psychological thriller',
              'inspiring true story',
            ].map((prompt) => (
              <Link
                key={prompt}
                href={`/search?q=${encodeURIComponent(prompt)}`}
                className="px-5 py-2.5 text-sm bg-bg-elevated text-text-primary border border-border-subtle rounded-full hover:bg-bg-primary hover:border-accent-cyan hover:-translate-y-0.5 transition-all"
              >
                {prompt}
              </Link>
            ))}
          </div>
        </section>

        {hasProfile ? (
          <section className="py-12 px-4 md:px-8">
            <h2 className="headline-h2 mb-2 text-text-primary">
              Perfect for {primaryGenres.map(g => g.name).join(' & ')} Fans
            </h2>
            <p className="text-text-secondary mb-6">Curated based on your taste profile</p>
            <Suspense fallback={<ContentSkeleton />}>
              <TrendingSection genreIds={primaryGenreIds} />
            </Suspense>
          </section>
        ) : (
          <>
            <section className="py-12 px-4 md:px-8">
              <h2 className="headline-h2 mb-2 text-text-primary">Trending Now</h2>
              <p className="text-text-secondary mb-6">Popular picks across all genres</p>
              <Suspense fallback={<ContentSkeleton />}>
                <TrendingSection />
              </Suspense>
            </section>

            <section className="py-12 px-4 md:px-8 bg-bg-primary/50">
              <h2 className="headline-h2 mb-2 text-text-primary">Popular This Week</h2>
              <p className="text-text-secondary mb-6">What everyone is watching</p>
              <Suspense fallback={<ContentSkeleton />}>
                <RecommendationsSection />
              </Suspense>
            </section>

            <section className="py-12 px-4 md:px-8">
              <h2 className="headline-h2 mb-2 text-text-primary">Discover More</h2>
              <p className="text-text-secondary mb-6">Explore the full library</p>
              <Suspense fallback={<ContentSkeleton />}>
                <TrendingSection />
              </Suspense>
            </section>
          </>
        )}

        {/* Footer */}
        <footer className="py-8 px-4 text-center text-text-secondary text-sm border-t border-border-subtle">
          <p className="mb-2">
            <a href="https://london.agentics.org" className="underline hover:text-accent-cyan">
              Agentics Foundation London Team
            </a>{' '}
            &bull; Global Hackathon TV5MONDE
          </p>
          <p className="flex flex-wrap items-center justify-center gap-2 mb-3">
            Powered by{' '}
            <a href="https://www.themoviedb.org/" className="underline hover:text-accent-cyan">
              TMDB
            </a>{' '}
            &bull; Built with{' '}
            <a href="https://arw.dev" className="underline hover:text-accent-cyan">
              ARW
            </a>{' '}
            &bull;{' '}
            <Link href="/about" className="underline hover:text-accent-cyan">
              About
            </Link>
          </p>
          <div className="mt-3 flex items-center justify-center gap-4 flex-wrap">
            <a
              href="/llms.txt"
              className="inline-flex items-center gap-1.5 hover:text-accent-cyan transition-colors"
              aria-label="LLM-readable site index"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
              llms.txt
            </a>
            <a
              href="/llms.md"
              className="inline-flex items-center gap-1.5 hover:text-accent-cyan transition-colors"
              aria-label="Human-readable AI documentation"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
              AI Docs
            </a>
            <a
              href="/.well-known/arw-manifest.json"
              className="inline-flex items-center gap-1.5 hover:text-accent-cyan transition-colors"
              aria-label="ARW machine-readable API manifest"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
              </svg>
              API Manifest
            </a>
          </div>
        </footer>
      </main>
    );
  }

  // Cold-start discovery flow
  return (
    <main className="min-h-screen">
      {/* Admin Widget - Development Only */}
      {process.env.NODE_ENV === 'development' && <AdminWidget />}

      {/* Top Navigation - Discovery Flow */}
      <nav className="absolute top-0 right-0 z-10 p-4">
        <Link
          href="/about"
          className="text-text-secondary hover:text-accent-cyan transition-colors text-sm"
        >
          About ARW
        </Link>
      </nav>

      {/* SCREEN 1: SIGN-IN */}
      <section
        className={`screen ${currentScreen === 'signin' ? 'active' : ''} ${isTransitioning && currentScreen === 'signin' ? 'exiting' : ''
          } ${isTransitioning && currentScreen !== 'signin' ? 'entering' : ''}`}
      >
        <div className="bg-bg-primary border border-border-subtle p-12 w-full max-w-[420px] text-center animate-card-fade-in rounded-lg">
          <h1 className="headline-hero mb-2">
            Discover Your<br />Next Watch
          </h1>
          <p className="text-body mb-8">
            No questionnaires. No endless scrolling.<br />
            Just a few moments of your attention.
          </p>
          <input
            type="email"
            className="input-field mb-4 rounded"
            placeholder="Enter your email"
            disabled
          />
          <button
            className="btn-primary w-full rounded"
            onClick={() => goToScreen('discovery')}
          >
            Start Exploring
          </button>
        </div>
      </section>

      {/* SCREEN 2: DISCOVERY GRID */}
      <section
        className={`screen discovery-screen ${currentScreen === 'discovery' ? 'active' : ''} ${isTransitioning && currentScreen === 'discovery' ? 'entering' : ''
          }`}
      >
        <div className="w-full max-w-[1000px] h-full flex flex-col px-4 mx-auto">

          {/* Header - fixed at top */}
          <div className="text-center py-4 flex-shrink-0">
            <h1 className="headline-h1 mb-2">What catches your eye?</h1>
            <p className="text-body">Select images that interest you</p>
            <div className="mono text-xl text-accent-cyan mt-2">
              {totalTime.toFixed(3)}s
            </div>
          </div>

          {/* Thumbnail Grid - scrollable */}
          <div className="flex-1 overflow-auto scrollbar-hide py-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {shuffledGenres.map((genre, index) => {
                const genreData = genres[genre.id];
                const isClicked = genreData?.clickOrder !== null;

                return (
                  <div
                    key={genre.id}
                    className="card-hover relative aspect-[9/16] overflow-hidden cursor-pointer rounded-lg"
                    style={{
                      borderWidth: '2px',
                      borderStyle: 'solid',
                      borderColor: isClicked ? genre.color : 'transparent',
                      animationDelay: `${index * 50}ms`,
                    }}
                    onMouseEnter={() => onHoverEnter(genre.id)}
                    onMouseLeave={() => onHoverLeave(genre.id)}
                    onClick={() => onThumbnailClick(genre.id)}
                  >
                    <img
                      src={genre.src}
                      alt={genre.name}
                      className="w-full h-full object-cover"
                    />
                    {isClicked && (
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                      >
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
          <div className="flex-shrink-0 py-4 pb-safe">
            <div className="relative mx-auto max-w-[300px]">
              {/* Animated border - only visible when profile ready */}
              {showContinueButton && (
                <div
                  className="absolute -inset-[3px] rounded-lg bg-gradient-to-r from-accent-cyan via-genre-scifi to-accent-cyan bg-[length:200%_100%] animate-gradient-shift"
                />
              )}
              <button
                className={`btn-primary relative w-full rounded ${showContinueButton ? 'shadow-lg shadow-accent-cyan/30' : ''
                  }`}
                onClick={completeProfile}
              >
                {showContinueButton ? 'See My Recommendations' : 'Skip'}
              </button>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}

// Skeleton components
function SearchBarSkeleton() {
  return (
    <div className="h-14 bg-bg-elevated rounded-xl animate-pulse" />
  );
}

function ContentSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="aspect-[2/3] bg-bg-elevated rounded-lg animate-pulse"
        />
      ))}
    </div>
  );
}
