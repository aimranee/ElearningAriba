/* why: pure decorative SVG backdrop for the "Compétences" night wall (brief
   §D-3) — the twelve faint lines and fifteen circles trace an implied
   ecosystem, mirroring flux-achat.tsx's server-component/aria-hidden/no-string
   shape. Sparks reuse the `[data-slot="constellation-spark"]` twinkle rule
   from globals.css so the reduced-motion block can silence them declaratively
   instead of via inline animation-name. */

const LINES = [
  { x1: 120, y1: 140, x2: 330, y2: 90 },
  { x1: 330, y1: 90, x2: 520, y2: 200 },
  { x1: 120, y1: 140, x2: 260, y2: 330 },
  { x1: 260, y1: 330, x2: 520, y2: 200 },
  { x1: 980, y1: 120, x2: 1180, y2: 210 },
  { x1: 1180, y1: 210, x2: 1320, y2: 90 },
  { x1: 1180, y1: 210, x2: 1240, y2: 420 },
  { x1: 1240, y1: 420, x2: 1380, y2: 520 },
  { x1: 90, y1: 640, x2: 240, y2: 760 },
  { x1: 240, y1: 760, x2: 420, y2: 700 },
  { x1: 1060, y1: 780, x2: 1230, y2: 700 },
  { x1: 1230, y1: 700, x2: 1380, y2: 800 },
] as const;

const NODES = [
  { cx: 120, cy: 140, r: 5, big: false },
  { cx: 330, cy: 90, r: 8, big: true },
  { cx: 520, cy: 200, r: 4, big: false },
  { cx: 260, cy: 330, r: 6, big: false },
  { cx: 980, cy: 120, r: 4, big: false },
  { cx: 1180, cy: 210, r: 8, big: true },
  { cx: 1320, cy: 90, r: 5, big: false },
  { cx: 1240, cy: 420, r: 5, big: false },
  { cx: 1380, cy: 520, r: 4, big: false },
  { cx: 90, cy: 640, r: 4, big: false },
  { cx: 240, cy: 760, r: 7, big: true },
  { cx: 420, cy: 700, r: 5, big: false },
  { cx: 1060, cy: 780, r: 4, big: false },
  { cx: 1230, cy: 700, r: 7, big: true },
  { cx: 1380, cy: 800, r: 5, big: false },
] as const;

const SPARKS = [
  { cx: 700, cy: 140, r: 1.6, delay: "0s" },
  { cx: 860, cy: 420, r: 1.4, delay: "-2s" },
  { cx: 560, cy: 820, r: 1.8, delay: "-3.5s" },
  { cx: 1400, cy: 300, r: 1.4, delay: "-1s" },
  { cx: 40, cy: 420, r: 1.5, delay: "-4s" },
] as const;

const LINKS = [
  "M330 90 C 600 40, 900 60, 1180 210",
  "M240 760 C 500 860, 800 840, 1230 700",
] as const;

function Constellation({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={`absolute inset-0 h-full w-full pointer-events-none opacity-60${className ? ` ${className}` : ""}`}
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="constel-link-gradient" x1="0" x2="1">
          <stop offset="0" stopColor="#8b85ff" />
          <stop offset="1" stopColor="#7cd9fa" />
        </linearGradient>
      </defs>
      <g stroke="rgba(255,255,255,.14)" strokeWidth={1}>
        {LINES.map((line, index) => (
          <line key={index} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} />
        ))}
      </g>
      {LINKS.map((d) => (
        <path
          key={d}
          data-slot="constellation-link"
          d={d}
          fill="none"
          stroke="url(#constel-link-gradient)"
          strokeWidth={1.5}
          strokeDasharray="4 8"
          style={{ animation: `dash 6s var(--ease-brand) infinite` }}
        />
      ))}
      {NODES.map((node, index) => (
        <circle
          key={index}
          cx={node.cx}
          cy={node.cy}
          r={node.r}
          fill="var(--night)"
          stroke={node.big ? "var(--azur-soft)" : "rgba(139,133,255,.75)"}
          strokeWidth={1.5}
        />
      ))}
      {SPARKS.map((spark, index) => (
        <circle
          key={index}
          data-slot="constellation-spark"
          cx={spark.cx}
          cy={spark.cy}
          r={spark.r}
          fill="#fff"
          stroke="none"
          style={{ animationDelay: spark.delay }}
        />
      ))}
    </svg>
  );
}

export { Constellation };
