import { epicGamesProvider } from "./epic-games";
import { playstationProvider } from "./playstation";
import { primeGamingProvider } from "./prime-gaming";
import { robloxProvider } from "./roblox";
import { steamProvider } from "./steam";
import { twitchProvider } from "./twitch";
import { xboxProvider } from "./xbox";

export type { OfferProvider } from "./types";
export { SYNC_ID_PREFIX } from "./types";

// Registre central des providers. Pour activer/désactiver une plateforme,
// il suffit de retirer/ajouter une ligne ici — aucun autre fichier n'a
// besoin de changer.
export const providers = [
  epicGamesProvider,
  steamProvider,
  twitchProvider,
  primeGamingProvider,
  robloxProvider,
  playstationProvider,
  xboxProvider,
];
