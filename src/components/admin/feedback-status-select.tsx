"use client";

import { useTransition } from "react";
import { updateFeedbackStatusAction } from "@/app/admin/feedback/actions";

const statuses = ["new", "reviewed", "resolved"];
const labels: Record<string, string> = { new: "Nouveau", reviewed: "Vu", resolved: "Résolu" };

export function FeedbackStatusSelect({ id, status }: { id: string; status: string }) {
  const [pending, startTransition] = useTransition();

  return <select
    className="preferences-select"
    defaultValue={status}
    disabled={pending}
    onChange={(e) => startTransition(() => { updateFeedbackStatusAction(id, e.target.value); })}
  >
    {statuses.map((s) => <option key={s} value={s}>{labels[s]}</option>)}
  </select>;
}
