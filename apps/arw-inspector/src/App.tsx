import { useState } from 'react';
import type { InspectionResult } from './types';
import { Inspector } from './components/Inspector';
import { UrlInput } from './components/UrlInput';
import { LoadingSpinner } from './components/LoadingSpinner';
import { inspectARW } from './utils/inspector';
import './App.css';

function App() {
  const [targetUrl, setTargetUrl] = useState('');
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

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <h1>ARW Inspector</h1>
            <p className="header-subtitle">Visual explorer for Agent-Ready Web capabilities</p>
          </div>
          <div className="header-right">
            <UrlInput onInspect={handleInspect} disabled={loading} />
          </div>
        </div>
      </header>

      <main className="app-main">
        {error && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {loading && (
          <div className="loading-container">
            <LoadingSpinner />
            <p>Inspecting {targetUrl}...</p>
          </div>
        )}

        {!loading && inspectionResult && (
          <>
            {inspectionResult.usedProxy && (
              <div className="security-warning">
                <div className="warning-header">
                  <strong>Security Notice: CORS Proxy Used</strong>
                </div>
                <div className="warning-content">
                  <p>
                    The inspector used a third-party CORS proxy (allorigins.win) to fetch content because direct access failed.
                    Please be aware:
                  </p>
                  <ul>
                    <li>Your requests are routed through a third-party service</li>
                    <li>URLs and content may be logged by the proxy operator</li>
                    <li>Content integrity cannot be guaranteed</li>
                    <li>Service availability is not guaranteed</li>
                  </ul>
                  <p>
                    <strong>For production use:</strong> Consider self-hosting a CORS proxy or enabling CORS on your server.
                  </p>
                </div>
              </div>
            )}
            <Inspector result={inspectionResult} />
          </>
        )}

        {!loading && !inspectionResult && !error && (
          <div className="welcome">
            <div className="welcome-content">
              <h2>Welcome to ARW Inspector</h2>
              <p>
                Enter a URL above to inspect its Agent-Ready Web capabilities. The inspector will:
              </p>
              <ul>
                <li>Discover and parse llms.txt</li>
                <li>Fetch and display machine views</li>
                <li>Identify content chunks and actions</li>
                <li>Show usage policies</li>
                <li>Validate ARW implementation</li>
              </ul>

              <div className="example-urls">
                <h3>Try these examples:</h3>
                <button
                  className="example-btn"
                  onClick={() => handleInspect('http://localhost:3000')}
                >
                  Basic Blog (localhost:3000)
                </button>
                <button className="example-btn" onClick={() => handleInspect('https://arw.dev')}>
                  ARW Website (arw.dev)
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

    </div>
  );
}

export default App;
