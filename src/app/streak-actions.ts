"use server";

import { recordDailyVisit } from "@/lib/streak-repository";

export async function recordDailyVisitAction() {
  return recordDailyVisit();
}
