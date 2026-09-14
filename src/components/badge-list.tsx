import { BADGES, type BadgeKey } from "@/lib/badges";

export function BadgeList({ earned }: { earned: BadgeKey[] }) {
  const earnedSet = new Set(earned);
  return <div className="badge-grid">
    {BADGES.map((badge) => {
      const unlocked = earnedSet.has(badge.key);
      return <div key={badge.key} className={`badge-card ${unlocked ? "badge-card--unlocked" : ""}`} title={badge.description}>
        <span className="badge-icon" aria-hidden="true">{badge.icon}</span>
        <strong>{badge.label}</strong>
        <p>{badge.description}</p>
      </div>;
    })}
  </div>;
}
