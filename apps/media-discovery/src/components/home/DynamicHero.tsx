'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getPosterUrl, getBackdropUrl } from '@/lib/tmdb';
import type { Movie, TVShow } from '@/types/media';
import type { RecommendationSource } from '@/lib/recommendation-service';
import type { Genre as DiscoveryGenre } from '@/lib/discovery-store';

interface DynamicHeroProps {
  content: Movie | TVShow;
  source: RecommendationSource;
  preferences?: DiscoveryGenre[];
}

export function DynamicHero({ content, source, preferences }: DynamicHeroProps) {
  const [showWatchlistLabel, setShowWatchlistLabel] = useState(false);
  const posterUrl = getPosterUrl(content.posterPath);
  const backdropUrl = getBackdropUrl(content.backdropPath);

  const year = content.releaseDate
    ? new Date(content.releaseDate).getFullYear()
    : null;

  const runtime =
    content.mediaType === 'movie' && content.runtime
      ? `${Math.floor(content.runtime / 60)}h ${content.runtime % 60}m`
      : null;

  const seasons =
    content.mediaType === 'tv' && content.numberOfSeasons
      ? `${content.numberOfSeasons} Season${content.numberOfSeasons > 1 ? 's' : ''}`
      : null;

  // Source badge configuration
  const sourceBadge = {
    ai: {
      text: 'From your conversation',
      bgColor: 'bg-white/20',
      borderColor: 'border-white/40',
      textColor: 'text-white',
    },
    preference: {
      text: 'Based on your taste',
      bgColor: 'bg-white/20',
      borderColor: 'border-white/40',
      textColor: 'text-white',
    },
    trending: {
      text: 'Trending now',
      bgColor: 'bg-white/20',
      borderColor: 'border-white/40',
      textColor: 'text-white',
    },
  }[source.type];

  return (
    <>
      {/* Backdrop Section - Exactly like DetailPage */}
      <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
        {backdropUrl ? (
          <>
            <Image
              src={backdropUrl}
              alt={`${content.title} backdrop`}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            {/* Gradient overlays - Exactly like Backdrop component */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-950/80 via-transparent to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-950" />
        )}
      </div>

      {/* Hero Content - Exactly like DetailHero but with less negative margin */}
      <div className="relative z-10 -mt-32 md:-mt-48 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6 md:gap-10">
            {/* Poster */}
            <div className="flex-shrink-0 w-48 md:w-64 mx-auto md:mx-0">
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                {posterUrl ? (
                  <Image
                    src={posterUrl}
                    alt={content.title}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 768px) 192px, 256px"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                    <svg
                      className="w-16 h-16 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 text-center md:text-left">
              {/* Source Badge */}
              <div className="mb-3">
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1 ${sourceBadge.bgColor} border ${sourceBadge.borderColor} rounded-full text-sm ${sourceBadge.textColor} font-medium`}
                >
                  {sourceBadge.text}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
                {content.title}
              </h1>

              {/* Tagline */}
              {content.mediaType === 'movie' && content.tagline && (
                <p className="text-lg text-gray-400 italic mb-4">
                  {content.tagline}
                </p>
              )}

              {/* Meta info */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm text-gray-400 mb-4">
                {year && <span>{year}</span>}
                {(runtime || seasons) && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-gray-600" />
                    <span>{runtime || seasons}</span>
                  </>
                )}
                {content.voteAverage > 0 && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-gray-600" />
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4 text-yellow-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {content.voteAverage.toFixed(1)}
                    </span>
                  </>
                )}
                {content.status && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-gray-600" />
                    <span className="px-2 py-0.5 bg-gray-800 rounded text-xs">
                      {content.status}
                    </span>
                  </>
                )}
              </div>

              {/* Preference context */}
              {source.type === 'preference' && preferences && preferences.length > 0 && (
                <div className="mb-4">
                  <span className="text-sm text-gray-400">
                    Perfect for {preferences[0].name} fans
                  </span>
                </div>
              )}

              {/* AI reasoning snippet */}
              {source.type === 'ai' && source.conversationSnippet && (
                <p className="text-sm text-gray-400 italic mb-4 max-w-2xl">
                  &ldquo;{source.conversationSnippet}&rdquo;
                </p>
              )}

              {/* Overview */}
              <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
                {content.overview || 'No overview available.'}
              </p>

              {/* Actions */}
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <Link
                  href={`/${content.mediaType}/${content.id}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-accent-cyan hover:bg-accent-cyan/90 text-gray-950 font-medium rounded transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Play Trailer
                </Link>
                <button
                  className="relative inline-flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded transition-all overflow-hidden group"
                  onMouseEnter={() => setShowWatchlistLabel(true)}
                  onMouseLeave={() => setShowWatchlistLabel(false)}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span
                    className={`transition-all duration-300 ${
                      showWatchlistLabel
                        ? 'max-w-[200px] opacity-100'
                        : 'max-w-0 opacity-0'
                    } overflow-hidden whitespace-nowrap`}
                  >
                    Add to Watchlist
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
