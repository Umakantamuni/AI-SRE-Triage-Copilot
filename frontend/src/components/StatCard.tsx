import Icon from "./Icon";

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: "incident" | "shield" | "activity" | "triage";
  trend?: string;
  trendType?: "positive" | "negative" | "neutral";
}

export default function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  trendType = "neutral",
}: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <div className="stat-icon">
          <Icon name={icon} size={18} />
        </div>

        {trend && (
          <span className={`stat-trend ${trendType}`}>
            {trend}
          </span>
        )}
      </div>

      <div className="stat-value">
        {value}
      </div>

      <div className="stat-title">
        {title}
      </div>

      <div className="stat-description">
        {description}
      </div>
    </div>
  );
}