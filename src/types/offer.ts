export type Platform = "PC" | "PLAYSTATION" | "XBOX" | "AUTRES";
export type OfferCategory = "JEUX" | "ITEMS" | "TWITCH DROPS" | "DLC" | "PRIME GAMING" | "WEEK-END GRATUIT";
export type OfferStore = "Steam" | "Epic Games" | "PlayStation" | "Xbox" | "Twitch" | "Roblox" | "Prime Gaming";

export type Offer = {
  id: string;
  title: string;
  eyebrow: string;
  platform: Platform;
  store: OfferStore;
  category: OfferCategory;
  kind: string;
  description: string;
  originalPrice: number | null;
  currentPrice: number;
  startsAt?: string;
  expiresAt: string;
  url: string;
  image: string;
  imageAlt: string;
  accent: string;
  featured: boolean;
  trending: boolean;
  isNew: boolean;
};
