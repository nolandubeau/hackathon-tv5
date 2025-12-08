import Link from 'next/link';

export const metadata = {
  title: 'About - ARW-Powered Media Discovery',
  description: 'Learn how Agent-Ready Web (ARW) powers intelligent content discovery across our platform, browser extension, and MCP server',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-bg-elevated to-bg-primary">
      {/* Navigation */}
      <nav className="border-b border-border-subtle bg-bg-primary/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link
            href="/home"
            className="inline-flex items-center gap-2 text-text-secondary hover:text-accent-cyan transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Back to Discovery
          </Link>
          <div className="flex items-center gap-4 md:gap-6 text-sm md:text-base">
            <a
              href="/llms.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-accent-cyan transition-colors"
              aria-label="LLM-readable site index"
            >
              llms.txt
            </a>
            <a
              href="/.well-known/arw-manifest.json"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-accent-cyan transition-colors"
              aria-label="ARW machine-readable API manifest"
            >
              ARW Manifest
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="headline-hero mb-6 text-text-primary">
            Agent-Ready Web
          </h1>
          <p className="text-xl md:text-2xl text-text-secondary mb-4 leading-relaxed">
            Making content discovery intelligent, efficient, and accessible to both humans and AI agents
          </p>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-accent-cyan/10 border border-accent-cyan/30 rounded-full">
            <span className="text-accent-cyan font-bold">ARW-Powered Platform</span>
          </div>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Token Efficiency', value: '60-90%', description: 'reduction vs HTML scraping' },
            { label: 'Discovery Speed', value: '5-10x', description: 'faster than traditional' },
            { label: 'Accuracy Rate', value: '95%+', description: 'vs 70-85% HTML parsing' },
            { label: 'ARW Components', value: '3', description: 'integrated systems' },
          ].map((metric) => (
            <div
              key={metric.label}
              className="bg-bg-elevated border border-border-subtle rounded-lg p-6 text-center"
            >
              <div className="text-3xl md:text-4xl font-bold text-accent-cyan mb-2">
                {metric.value}
              </div>
              <div className="text-sm text-text-primary font-medium mb-1">
                {metric.label}
              </div>
              <div className="text-xs text-text-secondary">
                {metric.description}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* The Problem */}
      <section className="py-16 px-4 bg-bg-primary/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="headline-h2 mb-6 text-text-primary">The Challenge</h2>
          <div className="space-y-4 text-text-secondary text-lg">
            <p>
              Traditional content discovery relies on keyword search and manual browsing. Users spend{' '}
              <strong className="text-text-primary">45+ minutes</strong> scrolling through recommendations,
              trying to find content that matches their preferences.
            </p>
            <p>
              AI agents trying to help users face similar challenges: parsing bloated HTML (55KB when 8KB suffices),
              guessing at content structure, and lacking standardized ways to discover and interact with services.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              <div className="bg-bg-elevated border border-border-subtle rounded-lg p-6">
                <div className="text-red-400 mb-2">❌ Traditional Search</div>
                <ul className="text-sm space-y-2">
                  <li>• Keyword-based matching only</li>
                  <li>• No understanding of intent</li>
                  <li>• Endless scrolling required</li>
                  <li>• Static recommendations</li>
                </ul>
              </div>
              <div className="bg-bg-elevated border border-border-subtle rounded-lg p-6">
                <div className="text-red-400 mb-2">❌ Agent Challenges</div>
                <ul className="text-sm space-y-2">
                  <li>• 85% bandwidth waste on HTML</li>
                  <li>• Slow discovery processes</li>
                  <li>• Parsing ambiguity errors</li>
                  <li>• No standardized actions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Solution */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="headline-h2 mb-6 text-text-primary">Our ARW-Powered Solution</h2>
          <p className="text-lg text-text-secondary mb-8">
            We&apos;ve implemented Agent-Ready Web (ARW) across three integrated components to create
            an intelligent, efficient content discovery experience for both humans and AI agents.
          </p>

          <div className="space-y-8">
            {/* Component 1: Media Discovery Platform */}
            <div className="bg-bg-elevated border border-border-subtle rounded-lg p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-accent-cyan/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-accent-cyan">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-text-primary mb-2">Media Discovery Platform</h3>
                  <p className="text-text-secondary mb-4">
                    This web application you&apos;re using right now, powered by ARW for both human and agent access.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <div className="text-sm font-medium text-accent-cyan mb-1">Human Experience</div>
                      <ul className="text-sm text-text-secondary space-y-1">
                        <li>• Natural language search</li>
                        <li>• 8-second behavioral profiling</li>
                        <li>• Real-time personalization</li>
                        <li>• Visual discovery interface</li>
                      </ul>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-accent-cyan mb-1">Agent Access</div>
                      <ul className="text-sm text-text-secondary space-y-1">
                        <li>• Machine views (*.llm.md)</li>
                        <li>• ARW manifest discovery</li>
                        <li>• Structured content chunks</li>
                        <li>• Real-time API access</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Component 2: Chrome Extension */}
            <div className="bg-bg-elevated border border-border-subtle rounded-lg p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-genre-scifi/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-genre-scifi">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 1-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-text-primary mb-2">ARW Chrome Extension</h3>
                  <p className="text-text-secondary mb-4">
                    Browser extension that brings ARW capabilities to any website, with GEO (Generative Engine Optimization) analysis.
                  </p>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium text-genre-scifi mb-1">Discovery Features</div>
                      <ul className="text-sm text-text-secondary space-y-1">
                        <li>• Automatic ARW manifest detection</li>
                        <li>• Protocol support (MCP, ACP, A2A)</li>
                        <li>• Machine view inspection</li>
                        <li>• Content chunk visualization</li>
                      </ul>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-genre-scifi mb-1">GEO Analysis</div>
                      <ul className="text-sm text-text-secondary space-y-1">
                        <li>• Real-time content optimization scoring</li>
                        <li>• Agent-readability metrics</li>
                        <li>• Discovery path analysis</li>
                        <li>• Implementation suggestions</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Component 3: MCP Server */}
            <div className="bg-bg-elevated border border-border-subtle rounded-lg p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-accent-purple/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-accent-purple">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3m3 3a3 3 0 1 0 0 6h13.5a3 3 0 1 0 0-6m-16.5-3a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3m-19.5 0a4.5 4.5 0 0 1 .9-2.7L5.737 5.1a3.375 3.375 0 0 1 2.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 0 1 .9 2.7m0 0a3 3 0 0 1-3 3m0 3h.008v.008h-.008v-.008Zm0-6h.008v.008h-.008v-.008Zm-3 6h.008v.008h-.008v-.008Zm0-6h.008v.008h-.008v-.008Z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-text-primary mb-2">ARW MCP Server</h3>
                  <p className="text-text-secondary mb-4">
                    Model Context Protocol server that provides ARW tools and capabilities to AI assistants like Claude.
                  </p>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium text-accent-purple mb-1">MCP Tools</div>
                      <ul className="text-sm text-text-secondary space-y-1">
                        <li>• <code className="text-xs bg-bg-primary px-1 py-0.5 rounded">arw_discover</code> - Find ARW manifests</li>
                        <li>• <code className="text-xs bg-bg-primary px-1 py-0.5 rounded">arw_fetch_machine_view</code> - Get optimized content</li>
                        <li>• <code className="text-xs bg-bg-primary px-1 py-0.5 rounded">arw_analyze_site</code> - Evaluate implementation</li>
                        <li>• <code className="text-xs bg-bg-primary px-1 py-0.5 rounded">arw_list_actions</code> - Discover operations</li>
                      </ul>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-accent-purple mb-1">Integration Benefits</div>
                      <ul className="text-sm text-text-secondary space-y-1">
                        <li>• Seamless AI assistant access</li>
                        <li>• Efficient content retrieval</li>
                        <li>• Standardized discovery</li>
                        <li>• Action execution support</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-bg-primary/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="headline-h2 mb-6 text-text-primary">How ARW Improves Content Discovery</h2>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-accent-cyan rounded-full flex items-center justify-center text-bg-primary font-bold">
                1
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary mb-2">Efficient Discovery</h3>
                <p className="text-text-secondary">
                  ARW uses RFC 8615 standard <code className="text-xs bg-bg-primary px-1 py-0.5 rounded">/.well-known/arw-manifest.json</code> for
                  instant capability discovery. Instead of crawling entire sites, agents find exactly what they need in seconds.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-accent-cyan rounded-full flex items-center justify-center text-bg-primary font-bold">
                2
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary mb-2">Machine-Optimized Views</h3>
                <p className="text-text-secondary">
                  Each page has a parallel markdown version (<code className="text-xs bg-bg-primary px-1 py-0.5 rounded">*.llm.md</code>) optimized
                  for AI consumption - reducing token usage by 60-90% while improving accuracy to 95%+.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-accent-cyan rounded-full flex items-center justify-center text-bg-primary font-bold">
                3
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary mb-2">Natural Language Understanding</h3>
                <p className="text-text-secondary">
                  Our platform combines vector embeddings with behavioral learning. You can search using natural language like
                  &quot;sci-fi adventure&quot; or &quot;inspiring true story&quot; and get semantically relevant results.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-accent-cyan rounded-full flex items-center justify-center text-bg-primary font-bold">
                4
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary mb-2">Behavioral Profiling</h3>
                <p className="text-text-secondary">
                  Instead of lengthy questionnaires, we learn your preferences through interaction. Just 8 seconds of browsing
                  behavior gives us enough data to personalize recommendations.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-accent-cyan rounded-full flex items-center justify-center text-bg-primary font-bold">
                5
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary mb-2">Real-Time Data</h3>
                <p className="text-text-secondary">
                  Machine views provide real-time information with structured data - no stale caches or parsing errors.
                  Agents get accurate, up-to-date content every time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="headline-h2 mb-6 text-text-primary">The ARW Advantage</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-bg-elevated border border-border-subtle rounded-lg p-6">
              <div className="text-accent-cyan mb-2">For Users</div>
              <ul className="text-sm text-text-secondary space-y-2">
                <li>✓ Find content 5-10x faster</li>
                <li>✓ More accurate recommendations</li>
                <li>✓ Natural language search</li>
                <li>✓ No lengthy questionnaires</li>
                <li>✓ Seamless AI assistant integration</li>
              </ul>
            </div>

            <div className="bg-bg-elevated border border-border-subtle rounded-lg p-6">
              <div className="text-accent-cyan mb-2">For AI Agents</div>
              <ul className="text-sm text-text-secondary space-y-2">
                <li>✓ 60-90% token reduction</li>
                <li>✓ 95%+ accuracy rate</li>
                <li>✓ Instant capability discovery</li>
                <li>✓ Structured, real-time data</li>
                <li>✓ Standardized protocols</li>
              </ul>
            </div>

            <div className="bg-bg-elevated border border-border-subtle rounded-lg p-6">
              <div className="text-accent-cyan mb-2">For Publishers</div>
              <ul className="text-sm text-text-secondary space-y-2">
                <li>✓ Control over AI access</li>
                <li>✓ Proper attribution</li>
                <li>✓ Usage policy declarations</li>
                <li>✓ Better user engagement</li>
                <li>✓ Future-proof platform</li>
              </ul>
            </div>

            <div className="bg-bg-elevated border border-border-subtle rounded-lg p-6">
              <div className="text-accent-cyan mb-2">For Developers</div>
              <ul className="text-sm text-text-secondary space-y-2">
                <li>✓ Open standards (RFC 8615)</li>
                <li>✓ Progressive enhancement</li>
                <li>✓ No breaking changes</li>
                <li>✓ Rich ecosystem tools</li>
                <li>✓ MCP integration ready</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Implementation */}
      <section className="py-16 px-4 bg-bg-primary/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="headline-h2 mb-6 text-text-primary">ARW Implementation Details</h2>

          <div className="space-y-4">
            <div className="bg-bg-elevated border border-border-subtle rounded-lg p-6">
              <h3 className="text-lg font-bold text-text-primary mb-3">Discovery Architecture</h3>
              <div className="space-y-2 text-sm text-text-secondary">
                <p>
                  <code className="text-xs bg-bg-primary px-1 py-0.5 rounded">/.well-known/arw-manifest.json</code> - RFC 8615 standard location
                </p>
                <p>
                  <code className="text-xs bg-bg-primary px-1 py-0.5 rounded">/llms.txt</code> - Human-readable YAML format
                </p>
                <p>
                  <code className="text-xs bg-bg-primary px-1 py-0.5 rounded">/llms.md</code> - AI-friendly documentation
                </p>
                <p>
                  Machine views at <code className="text-xs bg-bg-primary px-1 py-0.5 rounded">*.llm.md</code> for each major page
                </p>
              </div>
            </div>

            <div className="bg-bg-elevated border border-border-subtle rounded-lg p-6">
              <h3 className="text-lg font-bold text-text-primary mb-3">Content Optimization</h3>
              <div className="space-y-2 text-sm text-text-secondary">
                <p>• Structured markdown with semantic chunks</p>
                <p>• Real-time data from TMDB API</p>
                <p>• Vector embeddings for semantic search</p>
                <p>• Behavioral signals for personalization</p>
              </div>
            </div>

            <div className="bg-bg-elevated border border-border-subtle rounded-lg p-6">
              <h3 className="text-lg font-bold text-text-primary mb-3">Protocol Support</h3>
              <div className="space-y-2 text-sm text-text-secondary">
                <p>• MCP (Model Context Protocol) via ARW MCP Server</p>
                <p>• Standard HTTP APIs with JSON responses</p>
                <p>• OAuth 2.0 ready for authenticated actions</p>
                <p>• Progressive enhancement architecture</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="headline-h2 mb-6 text-text-primary">Experience ARW-Powered Discovery</h2>
          <p className="text-lg text-text-secondary mb-8">
            Try our intelligent media discovery platform and see how ARW makes content discovery faster,
            more accurate, and more intuitive.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/home"
              className="btn-primary rounded px-8 py-3"
            >
              Start Discovering
            </Link>
            <a
              href="https://arw.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 bg-bg-elevated text-text-primary border border-border-subtle rounded hover:bg-bg-primary hover:border-accent-cyan transition-all"
            >
              Learn More About ARW
            </a>
          </div>
        </div>
      </section>

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
