import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './FileCard.css';

interface FileCardProps {
  title: string;
  description: string;
  exists: boolean;
  content?: string;
  error?: string;
  url?: string;
  language?: string;
  additionalInfo?: React.ReactNode;
}

export function FileCard({
  title,
  description,
  exists,
  content,
  error,
  url,
  language = 'json',
  additionalInfo,
}: FileCardProps) {
  return (
    <div className="file-card">
      <div className="file-header">
        <h3>{title}</h3>
        {exists ? (
          <span className="status-badge success">✓ Found</span>
        ) : (
          <span className="status-badge error">✗ Not Found</span>
        )}
      </div>
      <p className="file-description">{description}</p>
      {additionalInfo}
      {exists && content && (
        <details className="file-content">
          <summary>View Content</summary>
          <SyntaxHighlighter
            language={language}
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              borderRadius: 0,
              maxHeight: '400px',
              padding: '1.5rem',
            }}
          >
            {content}
          </SyntaxHighlighter>
        </details>
      )}
      {error && <p className="error-text">Error: {error}</p>}
      {url && (
        <a href={url} target="_blank" rel="noopener noreferrer" className="file-link">
          {url} ↗
        </a>
      )}
    </div>
  );
}
