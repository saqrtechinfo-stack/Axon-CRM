"use client";

import { motion } from "framer-motion";

type FunnelData = {
  name: string;
  value: number;
  color: string;
  isWon?: boolean;
};

// ── Funnel / Pipeline chart ──────────────────────────────────────────────────
export function FunnelChart({ data }: { data: FunnelData[] }) {
  const filtered = data.filter((d) => d.value > 0);
  const maxValue = Math.max(...filtered.map((d) => d.value), 1);
  const total = filtered.reduce((s, d) => s + d.value, 0);

  return (
    <div className="w-full flex flex-col gap-1 py-2">
      {filtered.map((item, index) => {
        const widthPct = (item.value / maxValue) * 100;
        const sharePct = ((item.value / total) * 100).toFixed(1);
        const prev = filtered[index - 1];
        const conversion =
          prev && prev.value > 0
            ? ((item.value / prev.value) * 100).toFixed(0)
            : null;

        return (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: index * 0.07,
              duration: 0.35,
              ease: "easeOut",
            }}
            className="flex flex-col"
          >
            {/* conversion badge between rows */}
            {index !== 0 && conversion && (
              <div className="flex items-center gap-2 my-1 px-1">
                <div className="h-px flex-1 bg-slate-100" />
                <span className="text-[10px] font-mono text-slate-400 font-medium">
                  ↓ {conversion}%
                </span>
                <div className="h-px flex-1 bg-slate-100" />
              </div>
            )}

            {/* row */}
            <div className="group flex items-center gap-3 rounded-xl px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors cursor-default">
              {/* color dot */}
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: item.isWon ? "#10b981" : item.color }}
              />

              {/* label */}
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 w-32 flex-shrink-0">
                {item.name}
              </span>

              {/* bar track */}
              <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${widthPct}%` }}
                  transition={{
                    duration: 0.7,
                    ease: [0.16, 1, 0.3, 1],
                    delay: index * 0.08 + 0.15,
                  }}
                  className="h-full rounded-full"
                  style={{ background: item.isWon ? "#10b981" : item.color }}
                />
              </div>

              {/* share % */}
              <span className="text-[10px] font-mono text-slate-400 w-10 text-right flex-shrink-0">
                {sharePct}%
              </span>

              {/* value */}
              <span
                className="text-[12px] font-bold w-32 text-right flex-shrink-0"
                style={{ color: item.isWon ? "#10b981" : "#1e293b" }}
              >
                AED {item.value.toLocaleString()}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Revenue over time line chart (optional bonus chart) ──────────────────────
type RevenuePoint = { month: string; value: number };

export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data.map((d) => d.value), 1);
  const H = 120;
  const W = 100; // percentage-based, we use viewBox

  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * 100,
    y: H - (d.value / max) * H,
    ...d,
  }));

  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `0,${H} ${polyline} 100,${H}`;

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 100 ${H}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height: 80 }}
      >
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#areaGrad)" />
        <polyline
          points={polyline}
          fill="none"
          stroke="#6366f1"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="1.8"
            fill="#6366f1"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      <div className="flex justify-between mt-1">
        {data.map((d) => (
          <span key={d.month} className="text-[9px] font-mono text-slate-400">
            {d.month}
          </span>
        ))}
      </div>
    </div>
  );
}
