'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SearchBar } from '@/components/SearchBar';
import { TrendingSection } from '@/components/TrendingSection';
import { RecommendationsSection } from '@/components/RecommendationsSection';
import { AdminWidget } from '@/components/AdminWidget';
import { DynamicHero } from '@/components/home/DynamicHero';
import { VoiceAssistantFAB } from '@/components/VoiceAssistant';
import { useDiscoveryStore } from '@/lib/discovery-store';
import { getRecommendationWithSource } from '@/lib/recommendation-service';
import { useAudio } from '@/hooks/useAudio';
import type { Movie, TVShow } from '@/types/media';
import type { RecommendationSource } from '@/lib/recommendation-service';

export default function HomePage() {
  const {
    profileComplete,
    getGenreScores,
    userName,
  } = useDiscoveryStore();

  const router = useRouter();
  const { playHover, playClick } = useAudio();

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const hasFetchedHero = useRef(false);
  const [heroContent, setHeroContent] = useState<{ content: Movie | TVShow; source: RecommendationSource } | null>(null);
  const [isLoadingHero, setIsLoadingHero] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Only redirect on initial mount if profile truly not complete
  // Don't redirect on every render to allow users to stay on page after refresh
  useEffect(() => {
    // Allow staying on /home even without complete profile
    // User might be browsing without preferences
  }, []);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showProfileMenu]);

  // Get top genres for personalized sections
  const topGenres = getGenreScores();
  const primaryGenres = topGenres.slice(0, 2);

  // Extract TMDB IDs for API filtering
  const primaryGenreIds = primaryGenres.map(g => g.tmdbId).filter(Boolean);

  // Determine if user completed profiling properly
  const hasProfile = profileComplete;

  // Fetch hero recommendation on mount (always show hero)
  useEffect(() => {
    if (!hasFetchedHero.current) {
      hasFetchedHero.current = true;
      setIsLoadingHero(true);
      // Get genres at the time of fetch
      const genresForFetch = getGenreScores().slice(0, 2);
      getRecommendationWithSource(genresForFetch)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle voice search results
  const handleVoiceSearchResult = (query: string) => {
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  // Always show the main app, allow browsing without profile
  return (
    <main className="min-h-screen">
        {/* Admin Widget - Development Only */}
        {process.env.NODE_ENV === 'development' && <AdminWidget />}

        {/* Voice Assistant FAB */}
        <VoiceAssistantFAB onSearchResult={handleVoiceSearchResult} />

        {/* Minimal Floating Header - Only Search & Profile Circle */}
        <div className="fixed top-0 right-0 z-20 p-4 flex items-center gap-3">
          {/* Search Icon */}
          <button
            onClick={() => {
              playClick();
              setShowSearch(!showSearch);
            }}
            onMouseEnter={playHover}
            className="p-2 bg-bg-primary/80 backdrop-blur-sm hover:bg-bg-elevated rounded-full transition-colors shadow-lg border border-border-subtle"
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

          {/* Profile Icon - Opens Menu */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => {
                playClick();
                setShowProfileMenu(!showProfileMenu);
              }}
              onMouseEnter={playHover}
              className="p-2 bg-bg-primary/80 backdrop-blur-sm hover:bg-bg-elevated rounded-full transition-colors shadow-lg border border-border-subtle"
              aria-label="Open profile menu"
            >
              <svg
                className={`w-5 h-5 ${hasProfile ? 'text-accent-cyan' : 'text-yellow-500'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </button>

            {/* Dropdown Menu - Exact AdminWidget HTML */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-[340px] bg-bg-primary/95 backdrop-blur-xl border border-border-subtle rounded-lg shadow-2xl overflow-hidden animate-slide-down">
                {/* Header */}
                <div className="flex justify-between items-center px-4 py-3 bg-bg-elevated">
                  <span className="text-text-secondary text-[0.625rem] uppercase tracking-widest font-medium">
                    Account
                  </span>
                  {userName && (
                    <span className="text-accent-cyan text-xs mono font-medium">
                      {userName}
                    </span>
                  )}
                </div>

                {/* Body */}
                <div className="p-4 max-h-[450px] overflow-y-auto">
                  {/* Tier Badge */}
                  <div className="text-2xl text-accent-cyan text-center py-2 bg-bg-elevated rounded mb-4 mono font-medium">
                    Premium
                  </div>

                  {/* Genre Leaderboard */}
                  <div className="mb-4">
                    <div className="text-text-secondary text-[0.6rem] uppercase tracking-wide mb-2 font-medium">
                      Your Top Preferences
                    </div>
                    <div className="space-y-1">
                      {topGenres.slice(0, 5).map((genre, index) => (
                        <div
                          key={genre.id}
                          className="flex items-center gap-2 py-1.5 border-b border-bg-elevated last:border-0"
                        >
                          <span className="w-5 text-text-secondary font-bold text-xs">
                            {index + 1}
                          </span>
                          <span
                            className="w-2 h-2 rounded-sm"
                            style={{ backgroundColor: genre.color }}
                          />
                          <span className="flex-1 text-sm">{genre.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <div className="border-t border-border-subtle pt-4">
                    <a
                      href="/.well-known/arw-manifest.json"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-2 py-1.5 text-sm text-text-secondary hover:text-accent-cyan transition-colors"
                      onMouseEnter={playHover}
                      onClick={playClick}
                    >
                      ARW Manifest
                    </a>
                    <a
                      href="/llms.txt"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-2 py-1.5 text-sm text-text-secondary hover:text-accent-cyan transition-colors"
                      onMouseEnter={playHover}
                      onClick={playClick}
                    >
                      llms.txt
                    </a>
                    <Link
                      href="/about"
                      className="block px-2 py-1.5 text-sm text-text-secondary hover:text-accent-cyan transition-colors"
                      onMouseEnter={playHover}
                      onClick={playClick}
                    >
                      About
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Collapsible Search Section */}
        {showSearch && (
          <div className="sticky top-0 z-10 bg-bg-primary/95 backdrop-blur-sm border-b border-border-subtle py-6 px-4 animate-slide-down">
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
                    onMouseEnter={playHover}
                    onClick={playClick}
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
          <div className="relative h-[60vh] flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-b from-bg-primary via-bg-elevated/20 to-bg-primary" />
            <div className="relative">
              <div className="w-12 h-12 border-4 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin" />
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
