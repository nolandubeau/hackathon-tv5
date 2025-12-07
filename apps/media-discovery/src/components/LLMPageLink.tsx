'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

/**
 * Component that displays a link to the corresponding .llm.md (machine-readable) version
 * of the current page in the top-right corner.
 */
export function LLMPageLink() {
  const pathname = usePathname();

  // Map pathname to corresponding .llm.md URL
  const getLLMUrl = (path: string): string => {
    // Home page
    if (path === '/') {
      return '/index.llm.md';
    }

    // Search page
    if (path === '/search') {
      return '/search.llm.md';
    }

    // Discover page
    if (path === '/discover') {
      return '/discover.llm.md';
    }

    // Movie detail pages: /movie/123 -> /movie/123.llm.md
    const movieMatch = path.match(/^\/movie\/(\d+)$/);
    if (movieMatch) {
      return `/movie/${movieMatch[1]}.llm.md`;
    }

    // TV detail pages: /tv/123 -> /tv/123.llm.md
    const tvMatch = path.match(/^\/tv\/(\d+)$/);
    if (tvMatch) {
      return `/tv/${tvMatch[1]}.llm.md`;
    }

    // Default: append .llm.md to the current path
    return `${path}.llm.md`;
  };

  const llmUrl = getLLMUrl(pathname);

  return (
    <div className="fixed top-4 right-4 z-50">
      <Link
        href={llmUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/90 hover:bg-blue-700 backdrop-blur-sm text-white text-sm font-medium rounded-lg shadow-lg transition-colors"
        title="View machine-readable version of this page"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
          />
        </svg>
        <span>llm.md</span>
      </Link>
    </div>
  );
}
