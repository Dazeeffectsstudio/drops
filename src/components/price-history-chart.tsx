import type { PriceHistoryEntry } from "@/lib/price-history-repository";
import { formatPrice } from "@/lib/offers";

type Props = { history: PriceHistoryEntry[]; formatDate: (iso: string) => string };

const WIDTH = 640;
const HEIGHT = 180;
const PAD_X = 28;
const PAD_TOP = 24;
const PAD_BOTTOM = 34;
const PLOT_WIDTH = WIDTH - PAD_X * 2;
const PLOT_HEIGHT = HEIGHT - PAD_TOP - PAD_BOTTOM;

// Graphique volontairement simple (SVG à la main, aucune librairie) : la
// plupart des offres n'ont qu'un ou deux points réels en base (elles passent
// une fois de payantes à gratuites, puis restent gratuites jusqu'à
// expiration) — pas la peine d'une vraie lib de charts pour ça. La ligne en
// pointillés au prix habituel donne le repère visuel ("l'écart économisé"),
// même avec un seul point réel.
export function PriceHistoryChart({ history, formatDate }: Props) {
  if (history.length === 0) return null;
  const maxPrice = Math.max(1, ...history.map((entry) => entry.originalPrice ?? entry.currentPrice));

  function yFor(price: number) {
    return PAD_TOP + PLOT_HEIGHT - (Math.min(price, maxPrice) / maxPrice) * PLOT_HEIGHT;
  }
  function xFor(index: number) {
    return history.length > 1 ? PAD_X + (index / (history.length - 1)) * PLOT_WIDTH : PAD_X + PLOT_WIDTH / 2;
  }

  const points = history.map((entry, index) => ({ x: xFor(index), y: yFor(entry.currentPrice), entry }));
  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");
  const baseline = HEIGHT - PAD_BOTTOM;
  const areaPath = `${linePath} L${points[points.length - 1].x.toFixed(1)},${baseline} L${points[0].x.toFixed(1)},${baseline} Z`;
  const refY = yFor(maxPrice);

  return <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="price-history-chart" role="img" aria-label="Évolution du prix de l'offre dans le temps">
    <line x1={PAD_X} y1={refY} x2={WIDTH - PAD_X} y2={refY} className="price-history-chart-ref" />
    <text x={WIDTH - PAD_X} y={refY - 8} textAnchor="end" className="price-history-chart-ref-label">Prix habituel · {formatPrice(maxPrice)}</text>
    <path d={areaPath} className="price-history-chart-area" />
    <path d={linePath} className="price-history-chart-line" />
    {points.map((point) => <g key={point.entry.id}>
      <circle cx={point.x} cy={point.y} r={4.5} className="price-history-chart-dot" />
      <text x={point.x} y={baseline + 20} textAnchor="middle" className="price-history-chart-label">{formatDate(point.entry.capturedAt)}</text>
      <text x={point.x} y={point.y - 12} textAnchor="middle" className="price-history-chart-price">{point.entry.currentPrice === 0 ? "Gratuit" : formatPrice(point.entry.currentPrice)}</text>
    </g>)}
  </svg>;
}
