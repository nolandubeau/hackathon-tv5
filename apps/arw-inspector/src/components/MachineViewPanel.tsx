import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { ViewComparison } from '../types';
import { CostComparison } from './CostComparison';
import { formatFileSize, formatNumber } from '../utils/tokenizer';
import './MachineViewPanel.css';

interface MachineViewPanelProps {
  machineViews: Map<string, string>;
  chunks: Map<string, string[]>;
  comparisons: Map<string, ViewComparison>;
  initialSelectedView?: string | null;
  contentEntries?: ContentEntry[];
  baseUrl: string;
}

interface ContentEntry {
  url: string;
  machine_view?: string;
  purpose?: string;
  priority?: 'high' | 'medium' | 'low';
  description?: string;
  metadata?: Record<string, unknown>;
}

type TabType = 'raw' | 'preview' | 'comparison';

export function MachineViewPanel({ machineViews, chunks, comparisons, initialSelectedView, contentEntries, baseUrl }: MachineViewPanelProps) {
  const [selectedView, setSelectedView] = useState<string | null>(
    initialSelectedView || (machineViews.size > 0 ? Array.from(machineViews.keys())[0] : null)
  );
  const [activeTab, setActiveTab] = useState<TabType>('preview');

  // Helper function to build full URL
  const buildFullUrl = (path: string): string => {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
  };

  if (machineViews.size === 0) {
    return (
      <div className="empty-state">
        <p>No content views fetched</p>
        <p className="empty-hint">
          Content views (.llm.md files) are discovered from the <code>content</code> entries in llms.txt that
          specify a <code>machine_view</code> field.
        </p>
      </div>
    );
  }

  const viewContent = selectedView ? machineViews.get(selectedView) || '' : '';
  const viewChunks = selectedView ? chunks.get(selectedView) || [] : [];
  const comparison = selectedView ? comparisons.get(selectedView) : undefined;

  // Find the content entry for this machine view
  const contentEntry = contentEntries?.find(entry => entry.machine_view === selectedView);

  return (
    <div className="machine-view-panel">
      {/* Left Panel: Available Content Views */}
      <div className="view-sidebar">
        <h4 className="sidebar-title">Available Content Views</h4>
        <div className="view-list">
          {Array.from(machineViews.keys()).map((url) => (
            <button
              key={url}
              className={`view-button ${selectedView === url ? 'active' : ''}`}
              onClick={() => setSelectedView(url)}
            >
              <div className="view-button-content">
                <span className="view-url">{url}</span>
                {comparison && selectedView === url && (
                  <span className="view-savings">
                    {comparison.savings.tokenPercent.toFixed(0)}% saved
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Panel: Content View with Tabs */}
      {selectedView && (
        <div className="view-main">
          {/* Content Entry Info Header */}
          {contentEntry && (
            <div className="content-info-header">
              <h3 className="content-title">{contentEntry.url}</h3>
              <div className="content-meta">
                {contentEntry.priority && (
                  <span className={`priority-badge ${contentEntry.priority}`}>
                    {contentEntry.priority}
                  </span>
                )}
                {contentEntry.purpose && (
                  <span className="purpose-badge">{contentEntry.purpose}</span>
                )}
                <span className="meta-separator">•</span>
                <a
                  href={buildFullUrl(contentEntry.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="content-link"
                >
                  HTML ↗
                </a>
                {selectedView && (
                  <>
                    <span className="link-separator">•</span>
                    <a
                      href={buildFullUrl(selectedView)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="content-link"
                    >
                      .llm.md ↗
                    </a>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="tab-nav">
            <button
              className={`tab-button ${activeTab === 'preview' ? 'active' : ''}`}
              onClick={() => setActiveTab('preview')}
            >
              Rendered Preview
            </button>
            <button
              className={`tab-button ${activeTab === 'raw' ? 'active' : ''}`}
              onClick={() => setActiveTab('raw')}
            >
              Raw Markdown
            </button>
            <button
              className={`tab-button ${activeTab === 'comparison' ? 'active' : ''}`}
              onClick={() => setActiveTab('comparison')}
              disabled={!comparison}
            >
              Token Cost Comparison
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {/* Rendered Preview Tab */}
            {activeTab === 'preview' && (
              <div className="tab-pane">
                {/* Chunks Info (if present) */}
                {viewChunks.length > 0 && (
                  <div className="chunks-header">
                    <strong>Content Chunks:</strong>
                    <div className="chunks-list">
                      {viewChunks.map((chunk) => (
                        <span key={chunk} className="chunk-badge">
                          {chunk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="markdown-content">
                  <ReactMarkdown>{viewContent}</ReactMarkdown>
                </div>
              </div>
            )}

            {/* Raw Markdown Tab */}
            {activeTab === 'raw' && (
              <div className="tab-pane">
                {/* Chunks Info (if present) */}
                {viewChunks.length > 0 && (
                  <div className="chunks-header">
                    <strong>Content Chunks:</strong>
                    <div className="chunks-list">
                      {viewChunks.map((chunk) => (
                        <span key={chunk} className="chunk-badge">
                          {chunk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <pre className="raw-markdown">{viewContent}</pre>
              </div>
            )}

            {/* Token Cost Comparison Tab */}
            {activeTab === 'comparison' && comparison && (
              <div className="tab-pane">
                <div className="comparison-content">
                  {/* Comparison Metrics at Top */}
                  <div className="metrics-header-inline">
                    <div className="metric-card">
                      <div className="metric-label">ARW (.llm.md)</div>
                      <div className="metric-value">{formatFileSize(comparison.machineView.size)}</div>
                      <div className="metric-subvalue">
                        {formatNumber(comparison.machineView.lines)} lines • {formatNumber(comparison.machineView.chunks)} chunks • est. {formatNumber(comparison.machineView.estimatedTokens)} tokens
                      </div>
                    </div>
                    <div className="metric-divider">→</div>
                    <div className="metric-card">
                      <div className="metric-label">HTML (Scraped)</div>
                      <div className="metric-value">{formatFileSize(comparison.htmlView.size)}</div>
                      <div className="metric-subvalue">
                        {formatNumber(comparison.htmlView.lines)} lines • est. {formatNumber(comparison.htmlView.estimatedTokens)} tokens
                      </div>
                    </div>
                    <div className="metric-divider">=</div>
                    <div className="metric-card savings-card">
                      <div className="metric-label">Savings</div>
                      <div className="metric-value savings">{comparison.savings.tokenPercent.toFixed(1)}%</div>
                      <div className="metric-subvalue">{formatNumber(comparison.savings.absoluteTokens)} tokens saved</div>
                    </div>
                  </div>

                  <CostComparison comparison={comparison} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
