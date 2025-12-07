import type { Policies } from '../types';
import './PoliciesPanel.css';

interface PoliciesPanelProps {
  policies?: Policies;
}

export function PoliciesPanel({ policies }: PoliciesPanelProps) {
  if (!policies) {
    return (
      <div className="empty-state">
        <p>No usage policies defined in llms.txt</p>
        <p className="empty-hint">
          Policies declare how AI agents can use your content and help establish accountability.
        </p>
      </div>
    );
  }

  return (
    <div className="policies-panel">
      <div className="policies-header">
        <h3>Usage Policies</h3>
        <p>Machine-readable terms governing how AI agents may use this site&apos;s content</p>
      </div>

      <div className="policies-grid">
        {policies.training && (
          <div className="policy-card">
            <div className="policy-icon">🎓</div>
            <h4>Training</h4>
            <div
              className={`policy-status ${policies.training.allowed ? 'allowed' : 'restricted'}`}
            >
              {policies.training.allowed ? '✓ Allowed' : '✗ Not Allowed'}
            </div>
            {policies.training.note && <p className="policy-note">{policies.training.note}</p>}
          </div>
        )}

        {policies.inference && (
          <div className="policy-card">
            <div className="policy-icon">🤖</div>
            <h4>Inference</h4>
            <div
              className={`policy-status ${policies.inference.allowed ? 'allowed' : 'restricted'}`}
            >
              {policies.inference.allowed ? '✓ Allowed' : '✗ Not Allowed'}
            </div>
            {policies.inference.restrictions && policies.inference.restrictions.length > 0 && (
              <div className="restrictions">
                <strong>Restrictions:</strong>
                <ul>
                  {policies.inference.restrictions.map((restriction, i) => (
                    <li key={i}>{restriction.replace(/_/g, ' ')}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {policies.attribution && (
          <div className="policy-card">
            <div className="policy-icon">📝</div>
            <h4>Attribution</h4>
            <div
              className={`policy-status ${policies.attribution.required ? 'required' : 'optional'}`}
            >
              {policies.attribution.required ? '✓ Required' : 'Optional'}
            </div>
            {policies.attribution.format && (
              <p className="policy-detail">
                <strong>Format:</strong> {policies.attribution.format}
              </p>
            )}
            {policies.attribution.template && (
              <div className="attribution-template">
                <strong>Template:</strong>
                <code>{policies.attribution.template}</code>
              </div>
            )}
          </div>
        )}

        {policies.rate_limits && (
          <div className="policy-card">
            <div className="policy-icon">⏱️</div>
            <h4>Rate Limits</h4>
            {policies.rate_limits.requests_per_minute && (
              <p className="policy-detail">
                <strong>Requests per minute:</strong> {policies.rate_limits.requests_per_minute}
              </p>
            )}
            {policies.rate_limits.authenticated && (
              <p className="policy-detail">
                <strong>Authenticated:</strong> {policies.rate_limits.authenticated}
              </p>
            )}
            {policies.rate_limits.unauthenticated && (
              <p className="policy-detail">
                <strong>Unauthenticated:</strong> {policies.rate_limits.unauthenticated}
              </p>
            )}
            {policies.rate_limits.note && (
              <p className="policy-note">{policies.rate_limits.note}</p>
            )}
          </div>
        )}
      </div>

      <div className="policies-footer">
        <div className="info-box">
          <strong>Understanding ARW Policies</strong>
          <p>
            Like robots.txt, ARW policies are advisory but provide a standardized way to declare
            usage terms. They establish:
          </p>
          <ul>
            <li>Legal foundation (machine-readable ToS)</li>
            <li>Accountability (identify violators via observability headers)</li>
            <li>Platform leverage (basis for AI company commitments)</li>
            <li>Future enforcement potential</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
