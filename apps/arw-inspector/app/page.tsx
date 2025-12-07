'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { BotIcon, SearchIcon } from 'lucide-react';
import type { InspectionResult } from '../src/types';
import { Inspector } from '../src/components/Inspector';
import { LoadingSpinner } from '../src/components/LoadingSpinner';
import { inspectARW } from '../src/utils/inspector';

// ARW Logo component matching the marketing site exactly
function Logo() {
  return (
    <div className="flex items-center space-x-2">
      <div className="flex size-9 items-center justify-center p-1">
        <div className="flex size-7 items-center justify-center rounded-md border text-primary-foreground bg-primary">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g>
              <path
                d="M7.81815 8.36373L12 0L24 24H15.2809L7.81815 8.36373Z"
                fill="currentColor"
              />
              <path
                d="M4.32142 15.3572L8.44635 24H-1.14809e-06L4.32142 15.3572Z"
                fill="currentColor"
              />
            </g>
          </svg>
        </div>
      </div>
      <span className="font-bold">ARW</span>
    </div>
  );
}

function InspectorPage() {
  const searchParams = useSearchParams();
  const [targetUrl, setTargetUrl] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [inspectionResult, setInspectionResult] = useState<InspectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInspect = async (url: string) => {
    setLoading(true);
    setError(null);
    setTargetUrl(url);

    try {
      const result = await inspectARW(url);
      setInspectionResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to inspect URL');
      setInspectionResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      handleInspect(urlInput.trim());
    }
  };

  // Auto-inspect URL from query parameter
  useEffect(() => {
    const urlParam = searchParams.get('url');
    if (urlParam) {
      setUrlInput(urlParam);
      handleInspect(urlParam);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header matching marketing navbar exactly */}
      <header className="sticky inset-x-0 top-0 z-50 border-b bg-background py-4">
        <div className="container">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-x-9">
              <Link href="/" className="flex items-center gap-2">
                <Logo />
              </Link>
              <div className="hidden md:flex items-center gap-1">
                <span className="text-[15px] text-muted-foreground">Inspector</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* URL Input matching marketing style */}
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="url"
                    placeholder="Enter URL to inspect..."
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    disabled={loading}
                    className="w-64 md:w-80 h-9 rounded-xl border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !urlInput.trim()}
                  className="inline-flex items-center justify-center rounded-xl border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-3 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50"
                >
                  <SearchIcon className="size-4" />
                </button>
              </form>

              {/* llms.txt link */}
              <Link
                href="/llms.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-xl hover:bg-accent hover:text-accent-foreground h-9 w-9 text-muted-foreground transition-colors"
                title="Agent-ready content (llms.txt)"
              >
                <BotIcon className="size-5" />
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {error && (
          <div className="border-b border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900">
            <div className="container py-3">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <LoadingSpinner />
            <p className="text-muted-foreground">Inspecting {targetUrl}...</p>
          </div>
        )}

        {!loading && inspectionResult && (
          <>
            {inspectionResult.usedProxy && (
              <div className="border-b border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900">
                <div className="container py-4">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
                    Security Notice: CORS Proxy Used
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    The inspector used a third-party CORS proxy to fetch content.
                    For production use, consider self-hosting a CORS proxy or enabling CORS on your server.
                  </p>
                </div>
              </div>
            )}
            <Inspector result={inspectionResult} />
          </>
        )}

        {!loading && !inspectionResult && !error && (
          <div className="container py-16">
            <div className="max-w-2xl mx-auto">
              {/* Welcome heading matching docs style */}
              <h1 className="scroll-m-24 text-3xl font-bold tracking-tight mb-4">
                Welcome to ARW Inspector
              </h1>
              <p className="text-base text-muted-foreground mb-8">
                Enter a URL above to inspect its Agent-Ready Web capabilities. The inspector will analyze and validate ARW implementations.
              </p>

              {/* Feature list */}
              <div className="grid gap-4 mb-10">
                <div className="flex items-start gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground">
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Discover and parse llms.txt</p>
                    <p className="text-sm text-muted-foreground">Automatically find and validate your llms.txt manifest</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground">
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Fetch and display machine views</p>
                    <p className="text-sm text-muted-foreground">Preview .llm.md files and structured content</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground">
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Validate ARW implementation</p>
                    <p className="text-sm text-muted-foreground">Check policies, protocols, and compliance</p>
                  </div>
                </div>
              </div>

              {/* Example URLs section */}
              <div className="border-t pt-8">
                <h2 className="text-lg font-semibold mb-4">Try these examples</h2>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      setUrlInput('http://localhost:3000');
                      handleInspect('http://localhost:3000');
                    }}
                    className="inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 text-sm font-medium transition-colors"
                  >
                    Basic Blog (localhost:3000)
                  </button>
                  <button
                    onClick={() => {
                      setUrlInput('https://arw.dev');
                      handleInspect('https://arw.dev');
                    }}
                    className="inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 text-sm font-medium transition-colors"
                  >
                    ARW Website (arw.dev)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <InspectorPage />
    </Suspense>
  );
}
