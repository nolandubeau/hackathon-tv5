import { useState } from 'react';
import type { InspectionResult } from '../../types';
import { OverviewTab, WellKnownTab, FilesTab, ProtocolsTab, LlmsTxtTab, PoliciesTab } from './tabs';
import './DiscoveryPanel.base.css';

interface DiscoveryPanelProps {
  result: InspectionResult;
}

type DiscoveryTab = 'overview' | 'well-known' | 'files' | 'protocols' | 'policies' | 'llms-txt';

export function DiscoveryPanel({ result }: DiscoveryPanelProps) {
  const [activeTab, setActiveTab] = useState<DiscoveryTab>('overview');
  const { discovery, discoveryInfo, rawYaml, machineViews } = result;

  if (!discovery) {
    return (
      <div className="discovery-panel">
        <p className="no-discovery">No discovery information available</p>
      </div>
    );
  }

  return (
    <div className="discovery-panel-container">
      {/* Left Sidebar with Tabs */}
      <div className="discovery-sidebar">
        <h4 className="sidebar-title">Discovery Sections</h4>
        <div className="discovery-tab-list">
          <button
            className={`discovery-tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <span className="tab-label">Overview</span>
          </button>
          <button
            className={`discovery-tab-button ${activeTab === 'well-known' ? 'active' : ''}`}
            onClick={() => setActiveTab('well-known')}
          >
            <span className="tab-label">Well-Known Files</span>
          </button>
          <button
            className={`discovery-tab-button ${activeTab === 'files' ? 'active' : ''}`}
            onClick={() => setActiveTab('files')}
          >
            <span className="tab-label">Standard Files</span>
          </button>
          <button
            className={`discovery-tab-button ${activeTab === 'protocols' ? 'active' : ''}`}
            onClick={() => setActiveTab('protocols')}
          >
            <span className="tab-label">Protocols / Interoperability</span>
          </button>
          <button
            className={`discovery-tab-button ${activeTab === 'policies' ? 'active' : ''}`}
            onClick={() => setActiveTab('policies')}
          >
            <span className="tab-label">Policies</span>
          </button>
          <button
            className={`discovery-tab-button ${activeTab === 'llms-txt' ? 'active' : ''}`}
            onClick={() => setActiveTab('llms-txt')}
          >
            <span className="tab-label">llms.txt Source</span>
          </button>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="discovery-content">
        {activeTab === 'overview' && (
          <OverviewTab
            discovery={discovery}
            discoveryInfo={discoveryInfo}
            machineViewsCount={machineViews.size}
          />
        )}
        {activeTab === 'well-known' && <WellKnownTab discoveryInfo={discoveryInfo} />}
        {activeTab === 'files' && <FilesTab discoveryInfo={discoveryInfo} />}
        {activeTab === 'protocols' && <ProtocolsTab discovery={discovery} />}
        {activeTab === 'policies' && <PoliciesTab policies={discovery.policies} />}
        {activeTab === 'llms-txt' && <LlmsTxtTab rawYaml={rawYaml} />}
      </div>
    </div>
  );
}
