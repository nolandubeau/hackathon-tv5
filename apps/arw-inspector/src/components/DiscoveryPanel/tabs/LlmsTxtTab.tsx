import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './LlmsTxtTab.css';

interface LlmsTxtTabProps {
  rawYaml?: string;
}

export function LlmsTxtTab({ rawYaml }: LlmsTxtTabProps) {
  return (
    <div className="discovery-tab-pane">
      {rawYaml && (
        <section className="discovery-section">
          <h2>llms.txt (YAML)</h2>
          <div className="yaml-display">
            <SyntaxHighlighter
              language="yaml"
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                borderRadius: '8px',
                maxHeight: '600px',
                padding: '1.5rem',
              }}
            >
              {rawYaml}
            </SyntaxHighlighter>
          </div>
        </section>
      )}
    </div>
  );
}
