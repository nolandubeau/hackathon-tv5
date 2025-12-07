import type { InspectionResult } from '../types';
import './Overview.css';

interface OverviewProps {
  result: InspectionResult;
}

export function Overview({ result }: OverviewProps) {
  const { discovery } = result;

  if (!discovery) return null;

  return (
    <div className="overview">
      <section className="overview-section">
        <h2>Site Information</h2>
        <div className="info-grid">
          <div className="info-item">
            <label>Name:</label>
            <span>{discovery.site.name}</span>
          </div>
          <div className="info-item">
            <label>Homepage:</label>
            <a href={discovery.site.homepage} target="_blank" rel="noopener noreferrer">
              {discovery.site.homepage}
            </a>
          </div>
          <div className="info-item">
            <label>Description:</label>
            <span>{discovery.site.description}</span>
          </div>
          {discovery.site.contact && (
            <div className="info-item">
              <label>Contact:</label>
              <span>{discovery.site.contact}</span>
            </div>
          )}
          <div className="info-item">
            <label>ARW Version:</label>
            <span className="version-badge">{discovery.version}</span>
          </div>
        </div>
      </section>

      <section className="overview-section">
        <h2>ARW Capabilities</h2>
        <div className="capabilities-grid">
          <div className="capability-card">
            <div className="capability-icon">📄</div>
            <div className="capability-count">{discovery.content?.length || 0}</div>
            <div className="capability-label">Content Entries</div>
          </div>
          <div className="capability-card">
            <div className="capability-icon">⚡</div>
            <div className="capability-count">{discovery.actions?.length || 0}</div>
            <div className="capability-label">Actions</div>
          </div>
          <div className="capability-card">
            <div className="capability-icon">🔌</div>
            <div className="capability-count">{discovery.protocols?.length || 0}</div>
            <div className="capability-label">Protocols</div>
          </div>
          <div className="capability-card">
            <div className="capability-icon">🔍</div>
            <div className="capability-count">{result.machineViews.size}</div>
            <div className="capability-label">Machine Views</div>
          </div>
        </div>
      </section>

      {discovery.policies && (
        <section className="overview-section">
          <h2>Policy Summary</h2>
          <div className="policy-summary">
            {discovery.policies.training && (
              <div
                className={`policy-badge ${discovery.policies.training.allowed ? 'allowed' : 'restricted'}`}
              >
                Training: {discovery.policies.training.allowed ? '✓ Allowed' : '✗ Not Allowed'}
              </div>
            )}
            {discovery.policies.inference && (
              <div
                className={`policy-badge ${discovery.policies.inference.allowed ? 'allowed' : 'restricted'}`}
              >
                Inference: {discovery.policies.inference.allowed ? '✓ Allowed' : '✗ Not Allowed'}
              </div>
            )}
            {discovery.policies.attribution && (
              <div
                className={`policy-badge ${discovery.policies.attribution.required ? 'required' : 'optional'}`}
              >
                Attribution: {discovery.policies.attribution.required ? '✓ Required' : 'Optional'}
              </div>
            )}
          </div>
        </section>
      )}

      {discovery.protocols && discovery.protocols.length > 0 && (
        <section className="overview-section">
          <h2>Protocol Support</h2>
          <div className="protocols-list">
            {discovery.protocols.map((protocol, i) => (
              <div key={i} className="protocol-item">
                <div className="protocol-type">{protocol.type.toUpperCase()}</div>
                <div>
                  <div className="protocol-name">{protocol.name}</div>
                  <div className="protocol-endpoint">{protocol.endpoint}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {result.rawYaml && (
        <section className="overview-section">
          <h2>llms.txt (YAML)</h2>
          <div className="yaml-display">
            <pre>{result.rawYaml}</pre>
          </div>
        </section>
      )}
    </div>
  );
}
