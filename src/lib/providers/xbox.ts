import { buildOffer } from "@/lib/offer-builder";
import { clampDescription, normalizeImageUrl } from "./normalize";
import { cleanTitle, fetchGamerPowerGiveaways, mergeGiveawaysById, parseWorth, resolveExpiry } from "./gamerpower";
import type { OfferProvider } from "./types";

// Provider RÉEL depuis GamerPower.com — même principe que playstation.ts :
// presque uniquement des DLC/codes gratuits côté Xbox, pas de vrais jeux
// complets recensés publiquement. Xbox One et Xbox Series X|S sont deux
// requêtes séparées côté GamerPower, fusionnées par id.
async function fetchOffers() {
  const [xboxOne, xboxSeries] = await Promise.all([fetchGamerPowerGiveaways("xbox-one"), fetchGamerPowerGiveaways("xbox-series-xs")]);
  const payload = mergeGiveawaysById([xboxOne, xboxSeries]);

  const offers = [];
  for (const item of payload) {
    if (item.status !== "Active") continue;
    if (item.type !== "Game" && item.type !== "DLC") continue;
    const expiresAt = resolveExpiry(item.end_date);
    if (!expiresAt) continue;

    offers.push(buildOffer({
      id: `sync-xbox-gp-${item.id}`,
      title: cleanTitle(item.title),
      description: clampDescription(item.description),
      platform: "XBOX",
      store: "Xbox",
      category: item.type === "DLC" ? "DLC" : "JEUX",
      image: normalizeImageUrl(item.image),
      originalPrice: parseWorth(item.worth),
      expiresAt,
      url: item.open_giveaway_url,
      accent: "green",
      trending: item.type === "Game",
    }));
  }

  return offers;
}

export const xboxProvider: OfferProvider = {
  key: "xbox",
  label: "Xbox",
  store: "Xbox",
  mode: "real",
  fetchOffers,
};
