import { REFERRAL_REWARDS, type ReferralRewardKey } from "@/lib/referral-rewards";

export function ReferralRewardList({ earned, signedUpCount }: { earned: ReferralRewardKey[]; signedUpCount: number }) {
  const earnedSet = new Set(earned);
  const next = REFERRAL_REWARDS.find((reward) => !earnedSet.has(reward.key));

  return <div>
    <div className="badge-grid">
      {REFERRAL_REWARDS.map((reward) => {
        const unlocked = earnedSet.has(reward.key);
        return <div key={reward.key} className={`badge-card ${unlocked ? "badge-card--unlocked" : ""}`} title={reward.description}>
          <span className="badge-icon" aria-hidden="true">{reward.icon}</span>
          <strong>{reward.label}</strong>
          <p>{reward.description}</p>
        </div>;
      })}
    </div>
    {next && <div className="reward-progress">
      <div className="reward-progress-label">
        <span>Prochaine récompense : {next.label}</span>
        <span>{Math.min(signedUpCount, next.threshold)} / {next.threshold}</span>
      </div>
      <div className="reward-progress-bar"><span style={{ width: `${Math.min(100, (signedUpCount / next.threshold) * 100)}%` }} /></div>
    </div>}
  </div>;
}
