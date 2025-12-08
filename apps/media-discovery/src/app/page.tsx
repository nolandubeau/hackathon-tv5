'use client';

import { Suspense, useEffect, useRef, useCallback, useState } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { SearchBar } from '@/components/SearchBar';
import { TrendingSection } from '@/components/TrendingSection';
import { RecommendationsSection } from '@/components/RecommendationsSection';
import { AdminWidget } from '@/components/AdminWidget';
import { DynamicHero } from '@/components/home/DynamicHero';
import { useDiscoveryStore, GENRES } from '@/lib/discovery-store';
import { getRecommendationWithSource } from '@/lib/recommendation-service';
import type { Movie, TVShow } from '@/types/media';
import type { RecommendationSource } from '@/lib/recommendation-service';

export default function HomePage() {
  const {
    currentScreen,
    setScreen,
    isTransitioning,
    setTransitioning,
    profileComplete,
    showProfileMessage,
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
  const [heroContent, setHeroContent] = useState<{ content: Movie | TVShow; source: RecommendationSource } | null>(null);
  const [isLoadingHero, setIsLoadingHero] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

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

  // Fetch hero recommendation when profile is complete
  useEffect(() => {
    if (profileComplete && !heroContent && !isLoadingHero) {
      setIsLoadingHero(true);
      getRecommendationWithSource(primaryGenres)
        .then((result) => {
          if (result) {
            setHeroContent(result);
          }
        })
        .catch((error) => {
          console.error('Error fetching hero recommendation:', error);
        })
        .finally(() => {
          setIsLoadingHero(false);
        });
    }
  }, [profileComplete, primaryGenres, heroContent, isLoadingHero]);

  // If profile is complete, show the main app
  if (profileComplete) {
    return (
      <main className="min-h-screen">
        {/* Admin Widget - Development Only */}
        {process.env.NODE_ENV === 'development' && <AdminWidget />}

        {/* Top Navigation */}
        <nav className="border-b border-border-subtle bg-bg-primary/80 backdrop-blur-sm sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="headline-h3 text-text-primary">AI Media Discovery</div>
            <div className="flex items-center gap-4 md:gap-6 text-sm md:text-base">
              {/* Profile Time Badge */}
              {hasProfile && showProfileMessage && (
                <div className="flex items-center gap-2">
                  <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-accent-cyan/20 border-2 border-accent-cyan/40">
                    <span className="text-accent-cyan font-bold text-sm mono">
                      {totalTime.toFixed(0)}s
                    </span>
                  </div>
                  <span className="hidden md:inline text-text-secondary text-xs">
                    to profile you
                  </span>
                </div>
              )}

              {/* Search Icon */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 hover:bg-bg-elevated rounded-lg transition-colors"
                aria-label="Toggle search"
              >
                <svg
                  className="w-5 h-5 text-text-secondary hover:text-accent-cyan transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>

              <a
                href="/llms.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary hover:text-accent-cyan transition-colors hidden md:inline"
                aria-label="LLM-readable site index"
              >
                llms.txt
              </a>
              <a
                href="/.well-known/arw-manifest.json"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary hover:text-accent-cyan transition-colors hidden md:inline"
                aria-label="ARW machine-readable API manifest"
              >
                ARW Manifest
              </a>
              <Link
                href="/about"
                className="text-text-secondary hover:text-accent-cyan transition-colors hidden md:inline"
              >
                About ARW
              </Link>
            </div>
          </div>
        </nav>

        {/* Collapsible Search Section */}
        {showSearch && (
          <div className="sticky top-[73px] z-10 bg-bg-primary/95 backdrop-blur-sm border-b border-border-subtle py-6 px-4 animate-slide-down">
            <div className="max-w-3xl mx-auto">
              <Suspense fallback={<SearchBarSkeleton />}>
                <SearchBar />
              </Suspense>

              {/* Example Prompts */}
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {[
                  'sci-fi adventure',
                  'romantic comedy',
                  'psychological thriller',
                  'inspiring true story',
                ].map((prompt) => (
                  <Link
                    key={prompt}
                    href={`/search?q=${encodeURIComponent(prompt)}`}
                    className="px-4 py-1.5 text-xs bg-bg-elevated text-text-primary border border-border-subtle rounded-full hover:bg-bg-primary hover:border-accent-cyan transition-all"
                  >
                    {prompt}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Hero Section */}
        {isLoadingHero && (
          <div className="py-20 text-center">
            <div className="inline-block animate-pulse">
              <div className="h-8 w-64 bg-bg-elevated rounded mb-4" />
              <div className="h-4 w-96 bg-bg-elevated rounded" />
            </div>
          </div>
        )}
        {!isLoadingHero && heroContent && (
          <DynamicHero
            content={heroContent.content}
            source={heroContent.source}
            preferences={hasProfile ? primaryGenres : undefined}
          />
        )}

        {/* Profile Completion Message */}
        {!hasProfile && (
          <div className="py-8 px-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-genre-comedy/10 border border-genre-comedy/30 rounded-full">
              <span className="text-genre-comedy text-sm">
                {clickSequence.length === 0
                  ? "You didn't select any genres — showing general recommendations"
                  : "You skipped profiling — recommendations may be less personalized"
                }
              </span>
            </div>
          </div>
        )}

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
          <p className="flex flex-wrap items-center justify-center gap-2">
            Powered by{' '}
            <a href="https://www.themoviedb.org/" className="underline hover:text-accent-cyan">
              TMDB
            </a>{' '}
            &bull; Built with{' '}
            <a href="https://arw.dev" className="underline hover:text-accent-cyan">
              ARW
            </a>
          </p>
        </footer>
      </main>
    );
  }

  // Cold-start discovery flow
  return (
    <main className="min-h-screen">
      {/* Admin Widget - Development Only */}
      {process.env.NODE_ENV === 'development' && <AdminWidget />}

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
