import './CapabilityCard.css';

interface CapabilityCardProps {
  icon: string;
  count: number;
  label: string;
}

export function CapabilityCard({ icon, count, label }: CapabilityCardProps) {
  return (
    <div className="capability-card">
      <div className="capability-icon">{icon}</div>
      <div className="capability-count">{count}</div>
      <div className="capability-label">{label}</div>
    </div>
  );
}
