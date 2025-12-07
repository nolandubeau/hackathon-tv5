import { useState } from 'react';
import type { GEOAnalysisResult } from '../types-geo';
import './GEOPanel.css';

interface GEOPanelProps {
  url: string;
  machineViewContent: string | null;
}

export function GEOPanel({ url, machineViewContent }: GEOPanelProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GEOAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [useLLM, setUseLLM] = useState(false);
  const [showAPIKeyInput, setShowAPIKeyInput] = useState(false);
  const [apiKey, setAPIKey] = useState('');

  const handleAnalyze = async () => {
    if (!machineViewContent) {
      setError('No machine view content available. Please select a page with a machine view first.');
      return;
    }

    if (useLLM && !apiKey) {
      setShowAPIKeyInput(true);
      setError('API key required for LLM analysis');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/geo-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: machineViewContent,
          url,
          config: {
            profile: 'ARW-2.2',
            useLLM,
            ...(useLLM && apiKey && {
              llm: {
                provider: 'anthropic',
                model: 'claude-3-5-sonnet-20241022',
                apiKey,
                temperature: 0.3,
                maxTokens: 4096,
              }
            })
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
      setShowAPIKeyInput(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="geo-panel">
      <div className="geo-header">
        <div>
          <h2>GEO Analysis</h2>
          <p className="geo-subtitle">
            Generative Engine Optimization for ARW content
          </p>
        </div>

        <div className="geo-controls">
          <label className="llm-toggle">
            <input
              type="checkbox"
              checked={useLLM}
              onChange={(e) => setUseLLM(e.target.checked)}
              disabled={loading}
            />
            <span>Use LLM Enhancement</span>
          </label>

          <button
            onClick={handleAnalyze}
            disabled={loading || !machineViewContent}
            className="analyze-button"
          >
            {loading ? 'Analyzing...' : 'Analyze GEO'}
          </button>
        </div>
      </div>

      {showAPIKeyInput && (
        <div className="api-key-input">
          <label>
            Anthropic API Key:
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setAPIKey(e.target.value)}
              placeholder="sk-ant-..."
            />
          </label>
          <p className="api-key-note">
            Your API key is only used for this analysis and is not stored.
          </p>
        </div>
      )}

      {error && (
        <div className="geo-error">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {!machineViewContent && !loading && (
        <div className="geo-empty">
          <h3>No Content to Analyze</h3>
          <p>
            Select a page with a machine view from the "Content Views" tab to analyze its GEO optimization.
          </p>
        </div>
      )}

      {result && (
        <div className="geo-results">
          {/* Overall Metrics */}
          <div className="geo-metrics">
            <div className="metric-card">
              <div className="metric-value">{result.overall.score.toFixed(1)}%</div>
              <div className="metric-label">Overall Score</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{result.overall.citations}</div>
              <div className="metric-label">Citations</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{result.overall.statistics}</div>
              <div className="metric-label">Statistics</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{result.overall.quotations}</div>
              <div className="metric-label">Quotations</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{result.overall.entities}</div>
              <div className="metric-label">Entities</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{(result.overall.qualityScore * 100).toFixed(0)}%</div>
              <div className="metric-label">Quality</div>
            </div>
          </div>

          {/* Analysis Details Tabs */}
          <AnalysisDetails result={result} />

          {/* Analysis Info */}
          <div className="geo-info">
            <div className="info-item">
              <strong>Profile:</strong> {result.profile}
            </div>
            <div className="info-item">
              <strong>Domain:</strong> {result.domain}
            </div>
            <div className="info-item">
              <strong>LLM Enhancement:</strong> {result.usedLLM ? 'Yes' : 'No'}
            </div>
            <div className="info-item">
              <strong>Analysis Time:</strong> {result.analysisTime.toFixed(2)}s
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AnalysisDetails({ result }: { result: GEOAnalysisResult }) {
  const [activeTab, setActiveTab] = useState<'citations' | 'statistics' | 'quotations' | 'entities' | 'quality'>('citations');

  return (
    <div className="analysis-details">
      <div className="details-tabs">
        <button
          className={activeTab === 'citations' ? 'active' : ''}
          onClick={() => setActiveTab('citations')}
        >
          Citations ({result.citations.length})
        </button>
        <button
          className={activeTab === 'statistics' ? 'active' : ''}
          onClick={() => setActiveTab('statistics')}
        >
          Statistics ({result.statistics.length})
        </button>
        <button
          className={activeTab === 'quotations' ? 'active' : ''}
          onClick={() => setActiveTab('quotations')}
        >
          Quotations ({result.quotations.length})
        </button>
        <button
          className={activeTab === 'entities' ? 'active' : ''}
          onClick={() => setActiveTab('entities')}
        >
          Entities ({result.entities.length})
        </button>
        <button
          className={activeTab === 'quality' ? 'active' : ''}
          onClick={() => setActiveTab('quality')}
        >
          Quality
        </button>
      </div>

      <div className="details-content">
        {activeTab === 'citations' && (
          <div className="citations-list">
            {result.citations.length === 0 ? (
              <p className="empty-state">No citations found</p>
            ) : (
              result.citations.map((citation) => (
                <div key={citation.id} className="citation-item">
                  <div className="citation-header">
                    <span className="citation-source">{citation.source}</span>
                    <span className={`citation-type ${citation.type}`}>{citation.type}</span>
                  </div>
                  {citation.author && <div className="citation-author">By {citation.author}</div>}
                  {citation.url && (
                    <a href={citation.url} target="_blank" rel="noopener noreferrer" className="citation-url">
                      {citation.url}
                    </a>
                  )}
                  {citation.authority_score !== undefined && (
                    <div className="citation-score">
                      Authority Score: {(citation.authority_score * 100).toFixed(0)}%
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'statistics' && (
          <div className="statistics-list">
            {result.statistics.length === 0 ? (
              <p className="empty-state">No statistics found</p>
            ) : (
              result.statistics.map((stat) => (
                <div key={stat.id} className="statistic-item">
                  <div className="statistic-value">{stat.value}</div>
                  <div className="statistic-context">{stat.context}</div>
                  {stat.source && <div className="statistic-source">Source: {stat.source}</div>}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'quotations' && (
          <div className="quotations-list">
            {result.quotations.length === 0 ? (
              <p className="empty-state">No quotations found</p>
            ) : (
              result.quotations.map((quote) => (
                <div key={quote.id} className="quotation-item">
                  <div className="quotation-text">"{quote.text}"</div>
                  <div className="quotation-speaker">
                    <strong>{quote.speaker.name}</strong>
                    {quote.speaker.title && <span>, {quote.speaker.title}</span>}
                    {quote.speaker.affiliation && <span> at {quote.speaker.affiliation}</span>}
                  </div>
                  {quote.type && <span className={`quotation-type ${quote.type}`}>{quote.type}</span>}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'entities' && (
          <div className="entities-list">
            {result.entities.length === 0 ? (
              <p className="empty-state">No entities found</p>
            ) : (
              result.entities.map((entity) => (
                <div key={entity.id} className="entity-item">
                  <div className="entity-header">
                    <span className="entity-name">{entity.name}</span>
                    <span className={`entity-type ${entity.type}`}>{entity.type}</span>
                  </div>
                  {entity.wikidata_id && (
                    <a
                      href={`https://www.wikidata.org/wiki/${entity.wikidata_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="entity-wikidata"
                    >
                      Wikidata: {entity.wikidata_id}
                    </a>
                  )}
                  {entity.confidence !== undefined && (
                    <div className="entity-confidence">
                      Confidence: {(entity.confidence * 100).toFixed(0)}%
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'quality' && result.quality && (
          <div className="quality-analysis">
            <div className="quality-score-large">
              <div className="score-value">{(result.quality.score * 100).toFixed(0)}%</div>
              <div className="score-label">Content Quality Score</div>
            </div>

            {result.quality.issues.length > 0 && (
              <div className="quality-section">
                <h4>⚠️ Issues Found ({result.quality.issues.length})</h4>
                <ul>
                  {result.quality.issues.map((issue, i) => (
                    <li key={i}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.quality.recommendations.length > 0 && (
              <div className="quality-section">
                <h4>💡 Recommendations ({result.quality.recommendations.length})</h4>
                <ul>
                  {result.quality.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
