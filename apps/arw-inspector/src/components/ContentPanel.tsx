import type { ContentEntry } from '../types';
import './ContentPanel.css';

interface ContentPanelProps {
  content: ContentEntry[];
  onViewMachineView?: (url: string) => void;
}

export function ContentPanel({ content, onViewMachineView }: ContentPanelProps) {
  if (content.length === 0) {
    return (
      <div className="empty-state">
        <p>No content entries found in llms.txt</p>
      </div>
    );
  }

  return (
    <div className="content-panel">
      <div className="content-stats">
        <div className="stat">
          <span className="stat-value">{content.length}</span>
          <span className="stat-label">Total Entries</span>
        </div>
        <div className="stat">
          <span className="stat-value">{content.filter((c) => c.machine_view).length}</span>
          <span className="stat-label">With Machine Views</span>
        </div>
        <div className="stat">
          <span className="stat-value">{content.filter((c) => c.priority === 'high').length}</span>
          <span className="stat-label">High Priority</span>
        </div>
      </div>

      <div className="content-list">
        {content.map((entry, i) => (
          <div key={i} className="content-entry">
            <div className="entry-header">
              <div className="entry-url">
                <a href={entry.url} target="_blank" rel="noopener noreferrer">
                  {entry.url}
                </a>
              </div>
              {entry.priority && (
                <span className={`priority-badge ${entry.priority}`}>{entry.priority}</span>
              )}
            </div>

            {entry.description && <p className="entry-description">{entry.description}</p>}

            <div className="entry-meta">
              {entry.purpose && (
                <span className="meta-item">
                  <strong>Purpose:</strong> {entry.purpose}
                </span>
              )}
              {entry.machine_view && (
                <span className="meta-item">
                  <strong>Machine View:</strong>{' '}
                  {onViewMachineView ? (
                    <button
                      className="machine-view-link"
                      onClick={() => onViewMachineView(entry.machine_view!)}
                    >
                      {entry.machine_view} →
                    </button>
                  ) : (
                    <a href={entry.machine_view} target="_blank" rel="noopener noreferrer">
                      {entry.machine_view}
                    </a>
                  )}
                </span>
              )}
            </div>

            {entry.metadata && Object.keys(entry.metadata).length > 0 && (
              <details className="entry-metadata">
                <summary>Metadata</summary>
                <pre>{JSON.stringify(entry.metadata, null, 2)}</pre>
              </details>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
