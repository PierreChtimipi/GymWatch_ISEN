import './OccupancyGauge.css';

export interface OccupancyGaugeProps {
  current: number;
  max: number;
}

export function OccupancyGauge({ current, max }: OccupancyGaugeProps) {
  const percentage = Math.round((current / max) * 100);
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage < 40) return 'var(--color-success)';
    if (percentage < 70) return 'var(--color-primary)';
    return 'var(--color-danger)';
  };

  const getLabel = () => {
    if (percentage < 40) return 'Calme';
    if (percentage < 70) return 'Modere';
    return 'Pleine';
  };

  return (
    <div className="gauge">
      <div className="gauge-circle">
        <svg viewBox="0 0 120 120" className="gauge-svg">
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="var(--color-gray-light)"
            strokeWidth="8"
          />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke={getColor()}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 60 60)"
            className="gauge-progress"
          />
        </svg>
        <div className="gauge-content">
          <span className="gauge-value" style={{ color: getColor() }}>
            {percentage}%
          </span>
          <span className="gauge-label">{getLabel()}</span>
        </div>
      </div>
      <div className="gauge-info">
        <span className="gauge-count">{current}/{max}</span>
        <span className="gauge-text">personnes</span>
      </div>
    </div>
  );
}
