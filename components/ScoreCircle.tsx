"use client";

interface ScoreCircleProps {
  score: number;
  label: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-32 h-32",
};

const scoreFontSizes: Record<string, number> = {
  sm: 14,
  md: 20,
  lg: 28,
};

const labelFontSizes: Record<string, number> = {
  sm: 9,
  md: 11,
  lg: 12,
};

function getColor(score: number): string {
  if (score >= 75) return "#1D9E75";
  if (score >= 50) return "#F59E0B";
  return "#EF4444";
}

export default function ScoreCircle({ score, label, size = "md" }: ScoreCircleProps) {
  const color = getColor(score);
  const sizes = {
    sm: { r: 28, cx: 36, cy: 36, viewBox: "0 0 72 72" },
    md: { r: 40, cx: 52, cy: 52, viewBox: "0 0 104 104" },
    lg: { r: 52, cx: 68, cy: 68, viewBox: "0 0 136 136" },
  };
  const s = sizes[size];
  const circumference = 2 * Math.PI * s.r;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={sizeClasses[size]}>
      <svg viewBox={s.viewBox} className="w-full h-full">
        {/* Track */}
        <circle
          cx={s.cx}
          cy={s.cy}
          r={s.r}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="8"
        />
        {/* Progress — rotated so fill starts at 12 o'clock */}
        <circle
          cx={s.cx}
          cy={s.cy}
          r={s.r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90, ${s.cx}, ${s.cy})`}
          className="transition-all duration-700 ease-out"
        />
        {/* Score number */}
        <text
          x="50%"
          y="45%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={scoreFontSizes[size]}
          fontWeight="700"
          fill={color}
        >
          {score}
        </text>
        {/* Label */}
        <text
          x="50%"
          y="65%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={labelFontSizes[size]}
          fill="#6B7280"
        >
          {label}
        </text>
      </svg>
    </div>
  );
}
