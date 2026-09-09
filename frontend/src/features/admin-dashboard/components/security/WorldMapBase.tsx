const CONTINENTS = [
  { cx: 220, cy: 140, rx: 110, ry: 70 }, // North America
  { cx: 300, cy: 300, rx: 55, ry: 90 }, // South America
  { cx: 520, cy: 110, rx: 55, ry: 40 }, // Europe
  { cx: 540, cy: 265, rx: 70, ry: 110 }, // Africa
  { cx: 720, cy: 150, rx: 170, ry: 90 }, // Asia
  { cx: 680, cy: 235, rx: 90, ry: 50 }, // South Asia
  { cx: 860, cy: 330, rx: 60, ry: 35 }, // Australia
]

const LONGITUDE_LINES = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]
const LATITUDE_LINES = [0, 100, 200, 300, 400, 500]

export function WorldMapBase() {
  return (
    <svg viewBox="0 0 1000 500" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <rect x="0" y="0" width="1000" height="500" className="fill-slate-100 dark:fill-slate-800/60" />
      {LONGITUDE_LINES.map((x) => (
        <line key={`v-${x}`} x1={x} y1={0} x2={x} y2={500} className="stroke-slate-200 dark:stroke-slate-700/60" strokeWidth={1} />
      ))}
      {LATITUDE_LINES.map((y) => (
        <line key={`h-${y}`} x1={0} y1={y} x2={1000} y2={y} className="stroke-slate-200 dark:stroke-slate-700/60" strokeWidth={1} />
      ))}
      {CONTINENTS.map((c, index) => (
        <ellipse
          key={index}
          cx={c.cx}
          cy={c.cy}
          rx={c.rx}
          ry={c.ry}
          className="fill-slate-300 dark:fill-slate-600/70"
        />
      ))}
    </svg>
  )
}

export function latLonToPercent(lat: number, lon: number): { left: string; top: string } {
  const x = ((lon + 180) / 360) * 100
  const y = ((90 - lat) / 180) * 100
  return { left: `${x}%`, top: `${y}%` }
}
