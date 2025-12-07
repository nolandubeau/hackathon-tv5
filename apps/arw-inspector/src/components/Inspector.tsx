import { useState } from 'react';
import type { InspectionResult } from '../types';
import { ActionsPanel } from './ActionsPanel';
import { MachineViewPanel } from './MachineViewPanel';
import { DiscoveryPanel } from './DiscoveryPanel';
import { GEOPanel } from './GEOPanel';
import './Inspector.css';

interface InspectorProps {
  result: InspectionResult;
}

type Tab = 'discovery' | 'actions' | 'machine-views' | 'geo';

export function Inspector({ result }: InspectorProps) {
  const [activeTab, setActiveTab] = useState<Tab>('discovery');

  if (!result.discovery) {
    return (
      <div className="inspector-error">
        <h2>This site isn't using ARW yet</h2>
        <p>No <code>llms.txt</code> file found at this URL.</p>

        <div className="getting-started">
          <h3>Quick Start Guide</h3>
          <ol>
            <li>
              <strong>Create llms.txt</strong> - Add a <code>/llms.txt</code> file to your site's root
            </li>
            <li>
              <strong>Define your site</strong> - Include name, description, and homepage
            </li>
            <li>
              <strong>List content</strong> - Add URLs to pages with optional machine-readable views
            </li>
            <li>
              <strong>Set policies</strong> - Specify how AI can use your content
            </li>
          </ol>

          <div className="quick-links">
            <a
              href="https://github.com/agent-ready-web/agent-ready-web/blob/main/spec/ARW-v1.0.md"
              target="_blank"
              rel="noopener noreferrer"
              className="link-button"
            >
              View Full Spec
            </a>
            <a
              href="https://github.com/agent-ready-web/agent-ready-web/blob/main/examples/basic-blog/public/llms.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="link-button"
            >
              See Example
            </a>
          </div>
        </div>

        {result.errors.length > 0 && (
          <details className="error-details">
            <summary>Technical Details ({result.errors.length} error{result.errors.length > 1 ? 's' : ''})</summary>
            <ul>
              {result.errors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </details>
        )}
      </div>
    );
  }

  const { discovery, warnings } = result;

  return (
    <div className="inspector">
      {warnings.length > 0 && (
        <div className="warnings-banner">
          <span className="warning-icon">⚠️</span>
          <div>
            <strong>
              {warnings.length} warning{warnings.length > 1 ? 's' : ''}
            </strong>
            <ul>
              {warnings.map((warning, i) => (
                <li key={i}>{warning}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="inspector-tabs">
        <button
          className={`tab ${activeTab === 'discovery' ? 'active' : ''}`}
          onClick={() => setActiveTab('discovery')}
        >
          Discovery
        </button>
        <button
          className={`tab ${activeTab === 'machine-views' ? 'active' : ''}`}
          onClick={() => setActiveTab('machine-views')}
        >
          Content Views ({result.machineViews.size})
        </button>
        <button
          className={`tab ${activeTab === 'geo' ? 'active' : ''}`}
          onClick={() => setActiveTab('geo')}
        >
          GEO Analysis
        </button>
        <button
          className={`tab ${activeTab === 'actions' ? 'active' : ''}`}
          onClick={() => setActiveTab('actions')}
        >
          Actions ({discovery.actions?.length || 0})
        </button>
      </div>

      <div className={`inspector-content ${activeTab === 'discovery' || activeTab === 'machine-views' || activeTab === 'geo' ? 'no-padding' : ''}`}>
        {activeTab === 'discovery' && <DiscoveryPanel result={result} />}
        {activeTab === 'machine-views' && (
          <MachineViewPanel
            machineViews={result.machineViews}
            chunks={result.chunks}
            comparisons={result.comparisons}
            initialSelectedView={null}
            contentEntries={discovery.content}
            baseUrl={result.url}
          />
        )}
        {activeTab === 'geo' && (
          <GEOPanel
            url={result.url}
            machineViewContent={result.machineViews.size > 0 ? Array.from(result.machineViews.values())[0] : null}
          />
        )}
        {activeTab === 'actions' && <ActionsPanel actions={discovery.actions || []} />}
      </div>
    </div>
  );
}
