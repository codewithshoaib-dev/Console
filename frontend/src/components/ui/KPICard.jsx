
import { useId } from "react";

export const COLORS = {
  indigo:  "#818cf8",
  emerald: "#34d399",
  amber:   "#fbbf24",
  rose:    "#fb7185",
  sky:     "#38bdf8",
  violet:  "#a78bfa",
};



export function Sparkline({ values, color = COLORS.indigo, width = 80, height = 32 }) {
  const uid = useId().replace(/:/g, "");
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1; // guard against flat lines
  const pad = height * 0.08;

  const pts = values.map((v, i) => ({
    x: (i / (values.length - 1)) * width,
    y: height - pad - ((v - min) / range) * (height - pad * 2),
  }));

  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const area = `${line} L ${pts.at(-1).x} ${height} L 0 ${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${uid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}



export function KPICard({ label, value, change, positive = true, sparkData, color = COLORS.indigo }) {
  return (
    <div className="bg-card rounded-2xl border border-border p-5">
      <p className="text-xs text-foreground font-semibold mb-3 leading-none">{label}</p>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-2xl font-mono font-bold text-foreground leading-none mb-2.5">{value}</p>
          <span className={`inline-flex items-center gap-1 text-[0.8rem] font-mono px-2 py-0.5 rounded-full ${
            positive ? "bg-success/50" : "bg-destructive/50"
          }`}>
            {positive ? "↑" : "↓"} {change}
          </span>
        </div>
        <Sparkline values={sparkData} color={color} width={88} height={38} />
      </div>
    </div>
  );
}
