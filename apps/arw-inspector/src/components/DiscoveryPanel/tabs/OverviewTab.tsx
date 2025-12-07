import type { ARWDiscovery, DiscoveryInfo } from '../../../types';
import { CapabilityCard } from '../cards';
import './OverviewTab.css';

interface OverviewTabProps {
  discovery: ARWDiscovery;
  discoveryInfo?: DiscoveryInfo;
  machineViewsCount: number;
}

export function OverviewTab({ discovery, discoveryInfo, machineViewsCount }: OverviewTabProps) {
  const { aiHeaders } = discoveryInfo || { aiHeaders: { found: false, headers: {} } };

  return (
    <div className="discovery-tab-pane">
      {/* Site Information Overview */}
      <section className="discovery-section">
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

      {/* ARW Capabilities Summary */}
      <section className="discovery-section">
        <h2>ARW Capabilities</h2>
        <div className="capabilities-grid">
          <CapabilityCard icon="📄" count={discovery.content?.length || 0} label="Content Entries" />
          <CapabilityCard icon="⚡" count={discovery.actions?.length || 0} label="Actions" />
          <CapabilityCard icon="🔌" count={discovery.protocols?.length || 0} label="Protocols" />
          <CapabilityCard icon="🔍" count={machineViewsCount} label="Content Views" />
        </div>
      </section>

      {/* Policy Summary */}
      {discovery.policies && (
        <section className="discovery-section">
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

      {/* Protocol Support */}
      {discovery.protocols && discovery.protocols.length > 0 && (
        <section className="discovery-section">
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

      {/* AI Agent Headers */}
      <section className="discovery-section">
        <h2>AI Agent Headers</h2>
        {aiHeaders?.found ? (
          <div className="headers-found">
            <div className="status-badge success">✓ AI- Headers Detected</div>
            <div className="headers-list">
              {Object.entries(aiHeaders.headers).map(([key, value]) => (
                <div key={key} className="header-item">
                  <span className="header-key">{key}:</span>
                  <span className="header-value">{value}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="status-badge warning">No AI- Headers Found</div>
        )}
        <p className="info-text">
          AI- headers identify and track AI agent traffic. These headers are sent by the server in
          response to requests from AI agents, providing metadata about agent access patterns.
        </p>
      </section>
    </div>
  );
}
