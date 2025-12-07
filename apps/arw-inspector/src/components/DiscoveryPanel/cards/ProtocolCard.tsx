import './ProtocolCard.css';

interface Protocol {
  type: string;
  name: string;
  endpoint: string;
  description?: string;
  version?: string;
}

interface ProtocolCardProps {
  protocol: Protocol;
}

export function ProtocolCard({ protocol }: ProtocolCardProps) {
  return (
    <div className="protocol-card">
      <div className="protocol-header">
        <div className="protocol-type">{protocol.type.toUpperCase()}</div>
        <div className="protocol-name">{protocol.name}</div>
      </div>
      <div className="protocol-details">
        <div className="protocol-field">
          <label>Endpoint:</label>
          <a href={protocol.endpoint} target="_blank" rel="noopener noreferrer" className="protocol-link">
            {protocol.endpoint}
          </a>
        </div>
        {protocol.description && (
          <div className="protocol-field">
            <label>Description:</label>
            <span>{protocol.description}</span>
          </div>
        )}
        {protocol.version && (
          <div className="protocol-field">
            <label>Version:</label>
            <span className="version-badge">{protocol.version}</span>
          </div>
        )}
      </div>
    </div>
  );
}
