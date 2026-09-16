import { buildOffer } from "@/lib/offer-builder";
import { clampDescription, normalizeImageUrl } from "./normalize";
import { cleanTitle, fetchGamerPowerGiveaways, parseWorth, resolveExpiry } from "./gamerpower";
import type { OfferProvider } from "./types";

// Provider RÉEL : Steam lui-même n'a pas d'API publique pour "les jeux
// gratuits/DLC gratuits en ce moment" (toujours vrai, voir la remarque
// historique ci-dessous), mais GamerPower.com en tient un annuaire public
// à jour, sans authentification — https://www.gamerpower.com/api-read.
// On y prend uniquement les entrées Steam en cours ("Active") de type
// "Game" ou "DLC" : ce sont de vraies offres, avec vrai titre, vraie
// image, vrai lien de récupération et vrai prix habituel.
async function fetchOffers() {
  const payload = await fetchGamerPowerGiveaways("steam");

  const offers = [];
  for (const item of payload) {
    if (item.status !== "Active") continue;
    if (item.type !== "Game" && item.type !== "DLC") continue;
    const expiresAt = resolveExpiry(item.end_date);
    if (!expiresAt) continue;

    offers.push(buildOffer({
      id: `sync-steam-gp-${item.id}`,
      title: cleanTitle(item.title),
      description: clampDescription(item.description),
      platform: "PC",
      store: "Steam",
      category: item.type === "DLC" ? "DLC" : "JEUX",
      image: normalizeImageUrl(item.image),
      originalPrice: parseWorth(item.worth),
      expiresAt,
      url: item.open_giveaway_url,
      accent: "blue",
      trending: item.type === "Game",
    }));
  }

  return offers;
}

export const steamProvider: OfferProvider = {
  key: "steam",
  label: "Steam",
  store: "Steam",
  mode: "real",
  fetchOffers,
};
