interface SeverityBadgeProps {
  severity: string;
}

export default function SeverityBadge({
  severity,
}: SeverityBadgeProps) {
  const normalized = severity.toLowerCase();

  return (
    <span
      className={`severity-badge severity-${normalized}`}
    >
      <span className="severity-dot" />
      {normalized.toUpperCase()}
    </span>
  );
}