import { stableFutureDate } from "./dates";
import { normalizePrice } from "./normalize";

// Aide partagée par les providers réels basés sur GamerPower.com (Steam,
// PlayStation, Xbox) — un annuaire public de vraies offres gratuites,
// sans authentification. Voir steam.ts pour le contexte complet.
export type GamerPowerGiveaway = {
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

export async function fetchGamerPowerGiveaways(platformSlug: string): Promise<GamerPowerGiveaway[]> {
  const response = await fetch(`https://www.gamerpower.com/api/giveaways?platform=${platformSlug}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`GamerPower API a répondu ${response.status}`);
  return response.json();
}

export function parseWorth(worth: string): number | null {
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
export function resolveExpiry(endDate: string): string | null {
  if (!endDate || endDate.toUpperCase() === "N/A") return stableFutureDate(14);
  const parsed = new Date(endDate.replace(" ", "T"));
  if (Number.isNaN(parsed.getTime())) return stableFutureDate(14);
  if (parsed.getTime() <= Date.now()) return null;
  return parsed.toISOString();
}

export function cleanTitle(title: string): string {
  return title
    .replace(/\s*\((?:Steam|PC|PS4|PS5|PlayStation ?\d?|Xbox(?: One| Series ?X\|?S?)?)\)\s*/gi, " ")
    .replace(/\s*(?:Steam|PSN|Xbox)?\s*Key\s*Giveaway\s*$/i, "")
    .replace(/\s*Giveaway\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Deux requêtes GamerPower (ex. ps4 + ps5) se recoupent souvent sur les
// mêmes offres cross-plateforme — on fusionne par id pour ne jamais créer
// deux fois la même offre.
export function mergeGiveawaysById(lists: GamerPowerGiveaway[][]): GamerPowerGiveaway[] {
  const byId = new Map<number, GamerPowerGiveaway>();
  for (const list of lists) for (const item of list) byId.set(item.id, item);
  return [...byId.values()];
}
