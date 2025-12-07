import type { DiscoveryInfo } from '../../../types';
import { FileCard } from '../cards';
import './FilesTab.css';

interface FilesTabProps {
  discoveryInfo?: DiscoveryInfo;
}

export function FilesTab({ discoveryInfo }: FilesTabProps) {
  const { robots, sitemap } = discoveryInfo || {};

  return (
    <div className="discovery-tab-pane">
      <section className="discovery-section">
        <h2>robots.txt</h2>
        <FileCard
          title="robots.txt"
          description="Standard crawl rules with optional ARW discovery hints pointing to llms.txt or .well-known files."
          exists={robots?.exists || false}
          content={robots?.content}
          error={robots?.error}
          url={robots?.url}
          language="text"
          additionalInfo={
            robots?.hasArwHints && <div className="status-badge info">Contains ARW Hints</div>
          }
        />
      </section>

      <section className="discovery-section">
        <h2>sitemap.xml</h2>
        <FileCard
          title="sitemap.xml"
          description="Standard web sitemap providing lastmod dates and changefreq for content discovery."
          exists={sitemap?.exists || false}
          content={sitemap?.content}
          error={sitemap?.error}
          url={sitemap?.url}
          language="xml"
          additionalInfo={
            sitemap?.exists &&
            sitemap.entryCount !== undefined && (
              <div className="sitemap-stats">
                <span className="stat-label">URL Entries:</span>
                <span className="stat-value">{sitemap.entryCount}</span>
              </div>
            )
          }
        />
      </section>
    </div>
  );
}
