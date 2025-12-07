import type { DiscoveryInfo } from '../../../types';
import { FileCard } from '../cards';
import './WellKnownTab.css';

interface WellKnownTabProps {
  discoveryInfo?: DiscoveryInfo;
}

export function WellKnownTab({ discoveryInfo }: WellKnownTabProps) {
  const { wellKnown } = discoveryInfo || { wellKnown: {} };

  return (
    <div className="discovery-tab-pane">
      <section className="discovery-section">
        <h2>Well-Known Files</h2>
        <div className="well-known-grid">
          {/* ARW Manifest */}
          <FileCard
            title="arw-manifest.json"
            description="Machine-optimized JSON entrypoint for ARW capabilities discovery (RFC 8615)."
            exists={wellKnown.manifest?.exists || false}
            content={wellKnown.manifest?.content}
            error={wellKnown.manifest?.error}
            url={wellKnown.manifest?.url}
            language="json"
          />

          {/* ARW Content Index */}
          <FileCard
            title="arw-content-index.json"
            description="Paginated content index for large sites with extensive content entries."
            exists={wellKnown.contentIndex?.exists || false}
            content={wellKnown.contentIndex?.content}
            error={wellKnown.contentIndex?.error}
            url={wellKnown.contentIndex?.url}
            language="json"
          />

          {/* ARW Policies */}
          <FileCard
            title="arw-policies.json"
            description="Machine-readable usage policies for training, inference, and attribution."
            exists={wellKnown.policies?.exists || false}
            content={wellKnown.policies?.content}
            error={wellKnown.policies?.error}
            url={wellKnown.policies?.url}
            language="json"
          />
        </div>
      </section>
    </div>
  );
}
