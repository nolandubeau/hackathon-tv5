import type { Action } from '../types';
import './ActionsPanel.css';

interface ActionsPanelProps {
  actions: Action[];
}

export function ActionsPanel({ actions }: ActionsPanelProps) {
  if (actions.length === 0) {
    return (
      <div className="empty-state">
        <p>No actions defined in llms.txt</p>
        <p className="empty-hint">
          Actions enable AI agents to perform operations like adding items to a cart or submitting
          forms.
        </p>
      </div>
    );
  }

  return (
    <div className="actions-panel">
      <div className="actions-header">
        <h3>
          {actions.length} Action{actions.length !== 1 ? 's' : ''} Defined
        </h3>
        <p>OAuth-protected operations that AI agents can discover and request</p>
      </div>

      <div className="actions-list">
        {actions.map((action, i) => (
          <div key={i} className="action-card">
            <div className="action-header">
              <div className="action-name">{action.name}</div>
              <span className={`method-badge ${action.method.toLowerCase()}`}>{action.method}</span>
            </div>

            <div className="action-endpoint">
              <code>{action.endpoint}</code>
            </div>

            {action.description && <p className="action-description">{action.description}</p>}

            <div className="action-details">
              <div className="detail-item">
                <strong>ID:</strong> <code>{action.id}</code>
              </div>
              {action.auth && (
                <div className="detail-item">
                  <strong>Auth:</strong> <span className="auth-badge">{action.auth}</span>
                </div>
              )}
              {action.scopes && action.scopes.length > 0 && (
                <div className="detail-item">
                  <strong>Scopes:</strong>
                  <div className="scopes">
                    {action.scopes.map((scope, j) => (
                      <span key={j} className="scope-badge">
                        {scope}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {action.schema && (
              <details className="action-schema">
                <summary>Request Schema</summary>
                <pre>{JSON.stringify(action.schema, null, 2)}</pre>
              </details>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
