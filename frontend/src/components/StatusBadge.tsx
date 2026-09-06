interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({
  status,
}: StatusBadgeProps) {
  const normalized = status.toLowerCase();

  return (
    <span
      className={`status-badge status-${normalized}`}
    >
      {normalized.replace("_", " ").toUpperCase()}
    </span>
  );
}