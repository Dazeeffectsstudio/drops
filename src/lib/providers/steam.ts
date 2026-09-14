import { buildOffer } from "@/lib/offer-builder";
import { stableFutureDate } from "./dates";
import { clampDescription, normalizeImageUrl, normalizePrice } from "./normalize";
import type { OfferProvider } from "./types";

// Provider RÉEL : Steam lui-même n'a pas d'API publique pour "les jeux
// gratuits/DLC gratuits en ce moment" (toujours vrai, voir la remarque
// historique ci-dessous), mais GamerPower.com en tient un annuaire public
// à jour, sans authentification — https://www.gamerpower.com/api-read.
// On y prend uniquement les entrées Steam en cours ("Active") de type
// "Game" ou "DLC" : ce sont de vraies offres, avec vrai titre, vraie
// image, vrai lien de récupération et vrai prix habituel.
const GAMERPOWER_URL = "https://www.gamerpower.com/api/giveaways?platform=steam";

type GamerPowerGiveaway = {
  id: number;
  title: string;
  worth: string;
  image: string;
  description: string;
  open_giveaway_url: string;
  type: string;
  platforms: string;
  end_date: string;
  status: string;
};

function parseWorth(worth: string): number | null {
  if (!worth || worth.toUpperCase() === "N/A") return null;
  const num = Number(worth.replace(/[^0-9.]/g, ""));
  return normalizePrice(Number.isNaN(num) ? null : num);
}

// GamerPower ne garantit pas toujours une date de fin (beaucoup de codes
// n'ont pas de deadline connue) — dans ce cas on estime une fenêtre de 14
// jours (date stable, voir dates.ts) plutôt que d'écarter une offre par
// ailleurs bien réelle. Une date de fin déjà passée (donnée obsolète côté
// GamerPower, ça arrive) fait rejeter l'entrée entièrement : mieux vaut
// l'ignorer qu'afficher un compte à rebours négatif.
function resolveExpiry(endDate: string): string | null {
  if (!endDate || endDate.toUpperCase() === "N/A") return stableFutureDate(14);
  const parsed = new Date(endDate.replace(" ", "T"));
  if (Number.isNaN(parsed.getTime())) return stableFutureDate(14);
  if (parsed.getTime() <= Date.now()) return null;
  return parsed.toISOString();
}

function cleanTitle(title: string): string {
  return title.replace(/\s*\(Steam\)\s*/gi, " ").replace(/\s*(Steam\s*)?Key\s*Giveaway\s*$/i, "").replace(/\s*Giveaway\s*$/i, "").replace(/\s+/g, " ").trim();
}

async function fetchOffers() {
  const response = await fetch(GAMERPOWER_URL, { cache: "no-store" });
  if (!response.ok) throw new Error(`GamerPower API a répondu ${response.status}`);
  const payload: GamerPowerGiveaway[] = await response.json();

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
      accent: "orange",
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
