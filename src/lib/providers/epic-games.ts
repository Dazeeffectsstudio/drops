import { buildOffer } from "@/lib/offer-builder";
import { clampDescription, normalizeImageUrl, normalizePrice } from "./normalize";
import type { OfferProvider } from "./types";

// Provider RÉEL : interroge le même point d'accès JSON que le site
// epicgames.com utilise lui-même pour afficher ses jeux gratuits
// (endpoint public, sans authentification, non documenté officiellement
// mais stable et largement utilisé par la communauté à cet effet).
const EPIC_FREE_GAMES_URL = "https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?locale=fr-BE&country=BE&allowCountries=BE";

type EpicImage = { type: string; url: string };
type EpicOfferWindow = { startDate: string; endDate: string };
type EpicElement = {
  title: string;
  description: string | null;
  keyImages?: EpicImage[];
  productSlug?: string | null;
  urlSlug?: string | null;
  catalogNs?: { mappings?: { pageSlug: string }[] };
  price?: { totalPrice?: { originalPrice?: number; discountPrice?: number } };
  promotions?: {
    promotionalOffers?: { promotionalOffers?: EpicOfferWindow[] }[];
    upcomingPromotionalOffers?: { promotionalOffers?: EpicOfferWindow[] }[];
  } | null;
};

function resolveSlug(element: EpicElement): string | null {
  const fromMapping = element.catalogNs?.mappings?.[0]?.pageSlug;
  if (fromMapping) return fromMapping;
  if (element.productSlug) return element.productSlug;
  if (element.urlSlug) return element.urlSlug;
  return null;
}

function resolveImage(element: EpicElement): string {
  const wide = element.keyImages?.find((image) => image.type === "OfferImageWide");
  const thumb = element.keyImages?.find((image) => image.type === "Thumbnail");
  return normalizeImageUrl(wide?.url ?? thumb?.url ?? null);
}

async function fetchOffers() {
  const response = await fetch(EPIC_FREE_GAMES_URL, { cache: "no-store" });
  if (!response.ok) throw new Error(`Epic Games API a répondu ${response.status}`);
  const payload = await response.json();
  const elements: EpicElement[] = payload?.data?.Catalog?.searchStore?.elements ?? [];

  const offers = [];

  for (const element of elements) {
    const slug = resolveSlug(element);
    if (!slug) continue;

    const originalPrice = normalizePrice((element.price?.totalPrice?.originalPrice ?? 0) / 100);
    const image = resolveImage(element);
    const description = clampDescription(element.description);
    const url = `https://store.epicgames.com/fr/p/${slug}`;

    // Offre gratuite dès maintenant.
    const activeWindow = element.promotions?.promotionalOffers?.[0]?.promotionalOffers?.[0];
    if (element.price?.totalPrice?.discountPrice === 0 && activeWindow) {
      offers.push(buildOffer({
        id: `sync-epic-games-${slug}`,
        title: element.title,
        description,
        platform: "PC",
        store: "Epic Games",
        category: "JEUX",
        image,
        originalPrice,
        expiresAt: activeWindow.endDate,
        url,
        accent: "lime",
        trending: true,
      }));
      continue;
    }

    // Offre gratuite prochainement (alimente la section "Bientôt gratuits").
    const upcomingWindow = element.promotions?.upcomingPromotionalOffers?.[0]?.promotionalOffers?.[0];
    if (upcomingWindow) {
      offers.push(buildOffer({
        id: `sync-epic-games-upcoming-${slug}`,
        title: element.title,
        description,
        platform: "PC",
        store: "Epic Games",
        category: "JEUX",
        image,
        originalPrice,
        startsAt: upcomingWindow.startDate,
        expiresAt: upcomingWindow.endDate,
        url,
        accent: "lime",
      }));
    }
  }

  return offers;
}

export const epicGamesProvider: OfferProvider = {
  key: "epic-games",
  label: "Epic Games",
  store: "Epic Games",
  mode: "real",
  fetchOffers,
};
