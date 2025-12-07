import type { ARWDiscovery } from '../../../types';
import { ProtocolCard } from '../cards';
import './ProtocolsTab.css';

interface ProtocolsTabProps {
  discovery: ARWDiscovery;
}

export function ProtocolsTab({ discovery }: ProtocolsTabProps) {
  const hasProtocols = discovery.protocols && discovery.protocols.length > 0;

  return (
    <div className="discovery-tab-pane">
      {hasProtocols ? (
        <>
          <section className="discovery-section">
            <h2>Protocol Support</h2>
            <p className="info-text">
              ARW supports multiple interoperability protocols that enable AI agents to interact
              with services through standardized interfaces. These protocols provide consistent
              patterns for authentication, data exchange, and service composition.
            </p>
            <div className="protocols-list">
              {discovery.protocols!.map((protocol, i) => (
                <ProtocolCard key={i} protocol={protocol} />
              ))}
            </div>
          </section>

          <section className="discovery-section">
            <h2>About Protocol Types</h2>
            <div className="protocol-info-grid">
              <div className="protocol-info-card">
                <h3>🔌 MCP (Model Context Protocol)</h3>
                <p>
                  Anthropic&apos;s Model Context Protocol enables AI assistants to connect to external
                  data sources and tools through a standardized interface. MCP provides a unified
                  way to expose context, tools, and resources to language models.
                </p>
                <a
                  href="https://modelcontextprotocol.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="info-link"
                >
                  Learn more about MCP ↗
                </a>
              </div>
              <div className="protocol-info-card">
                <h3>🤖 OpenAPI</h3>
                <p>
                  OpenAPI Specification (formerly Swagger) provides a standard, language-agnostic
                  interface to RESTful APIs. It allows both humans and computers to discover and
                  understand service capabilities without access to source code.
                </p>
                <a
                  href="https://www.openapis.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="info-link"
                >
                  Learn more about OpenAPI ↗
                </a>
              </div>
              <div className="protocol-info-card">
                <h3>🔗 OAuth 2.0</h3>
                <p>
                  OAuth 2.0 is the industry-standard protocol for authorization. It enables
                  applications to obtain limited access to user accounts on an HTTP service,
                  providing secure delegated access without sharing credentials.
                </p>
                <a
                  href="https://oauth.net/2/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="info-link"
                >
                  Learn more about OAuth 2.0 ↗
                </a>
              </div>
              <div className="protocol-info-card">
                <h3>🌐 GraphQL</h3>
                <p>
                  GraphQL is a query language for APIs that gives clients the power to ask for
                  exactly what they need. It provides a complete description of the data in your API
                  and enables powerful developer tools.
                </p>
                <a
                  href="https://graphql.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="info-link"
                >
                  Learn more about GraphQL ↗
                </a>
              </div>
            </div>
          </section>
        </>
      ) : (
        <section className="discovery-section">
          <h2>No Protocols Configured</h2>
          <p className="info-text">
            This site has not declared any interoperability protocols in its ARW manifest. Protocols
            enable AI agents to interact with services through standardized interfaces like MCP,
            OpenAPI, OAuth, or GraphQL.
          </p>
          <div className="protocol-info-grid">
            <div className="protocol-info-card">
              <h3>Why Declare Protocols?</h3>
              <p>
                Declaring protocols in your ARW manifest helps AI agents understand how to interact
                with your services programmatically. This enables:
              </p>
              <ul>
                <li>Standardized authentication flows</li>
                <li>Consistent API access patterns</li>
                <li>Automatic tool generation for AI assistants</li>
                <li>Better service discovery and composition</li>
              </ul>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
