import { Suspense } from 'react';
import Link from 'next/link';
import { SearchBar } from '@/components/SearchBar';
import { TrendingSection } from '@/components/TrendingSection';
import { RecommendationsSection } from '@/components/RecommendationsSection';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center bg-gradient-to-b from-blue-600/10 to-transparent">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          AI Media Discovery
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          Describe what you want to watch in plain English. Our AI understands
          your mood and finds the perfect match.
        </p>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto">
          <Suspense fallback={<SearchBarSkeleton />}>
            <SearchBar />
          </Suspense>
        </div>

        {/* Example Prompts */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {[
            'sci-fi adventure',
            'romantic comedy',
            'psychological thriller',
            'true story',
          ].map((prompt) => (
            <Link
              key={prompt}
              href={`/search?q=${encodeURIComponent(prompt)}`}
              className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {prompt}
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Section */}
      <section className="py-12 px-4 md:px-8">
        <h2 className="text-2xl font-bold mb-6">Trending This Week</h2>
        <Suspense fallback={<ContentSkeleton />}>
          <TrendingSection />
        </Suspense>
      </section>

      {/* Recommendations Section */}
      <section className="py-12 px-4 md:px-8 bg-gray-50 dark:bg-gray-900/50">
        <h2 className="text-2xl font-bold mb-6">Recommended For You</h2>
        <Suspense fallback={<ContentSkeleton />}>
          <RecommendationsSection />
        </Suspense>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center text-gray-500 text-sm">
        <div className="flex flex-col gap-3">
          <p>
            Powered by{' '}
            <a
              href="https://www.themoviedb.org/"
              className="underline hover:text-gray-700 dark:hover:text-gray-300"
            >
              TMDB
            </a>{' '}
            &bull; Built with{' '}
            <a href="https://arw.dev" className="underline hover:text-gray-700 dark:hover:text-gray-300">
              ARW
            </a>
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <a
              href="/llms.txt"
              className="inline-flex items-center gap-1.5 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              aria-label="LLM-readable site index"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
              llms.txt
            </a>
            <a
              href="/llms.md"
              className="inline-flex items-center gap-1.5 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              aria-label="Human-readable AI documentation"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
              AI Docs
            </a>
            <a
              href="/.well-known/arw-manifest.json"
              className="inline-flex items-center gap-1.5 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              aria-label="ARW machine-readable API manifest"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
              </svg>
              API Manifest
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

// Skeleton components
function SearchBarSkeleton() {
  return (
    <div className="h-14 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
  );
}

function ContentSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="aspect-[2/3] bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"
        />
      ))}
    </div>
  );
}
