import { buildOffer } from "@/lib/offer-builder";
import { clampDescription, normalizeImageUrl } from "./normalize";
import { cleanTitle, fetchGamerPowerGiveaways, mergeGiveawaysById, parseWorth, resolveExpiry } from "./gamerpower";
import type { OfferProvider } from "./types";

// Provider RÉEL depuis GamerPower.com (même source que Steam — voir
// steam.ts pour le contexte). Contrairement à Steam, le PlayStation Store
// n'y a quasiment que des DLC/codes cosmétiques gratuits (skins, points
// in-game...), jamais de vrais jeux complets — c'est réel mais partiel,
// donc on n'affiche que ce que GamerPower recense vraiment, sans faire
// croire à des jeux gratuits qui n'existent pas. PS4 et PS5 sont deux
// requêtes séparées côté GamerPower qui se recoupent souvent (même
// giveaway cross-gen) — fusionnées par id pour éviter les doublons.
async function fetchOffers() {
  const [ps4, ps5] = await Promise.all([fetchGamerPowerGiveaways("ps4"), fetchGamerPowerGiveaways("ps5")]);
  const payload = mergeGiveawaysById([ps4, ps5]);

  const offers = [];
  for (const item of payload) {
    if (item.status !== "Active") continue;
    if (item.type !== "Game" && item.type !== "DLC") continue;
    const expiresAt = resolveExpiry(item.end_date);
    if (!expiresAt) continue;

    offers.push(buildOffer({
      id: `sync-playstation-gp-${item.id}`,
      title: cleanTitle(item.title),
      description: clampDescription(item.description),
      platform: "PLAYSTATION",
      store: "PlayStation",
      category: item.type === "DLC" ? "DLC" : "JEUX",
      image: normalizeImageUrl(item.image),
      originalPrice: parseWorth(item.worth),
      expiresAt,
      url: item.open_giveaway_url,
      accent: "navy",
      trending: item.type === "Game",
    }));
  }

  return offers;
}

export const playstationProvider: OfferProvider = {
  key: "playstation",
  label: "PlayStation",
  store: "PlayStation",
  mode: "real",
  fetchOffers,
};
