import type { MetadataRoute } from "next";
import { categories, platforms } from "@/lib/catalog";
import { getAllOffers } from "@/lib/offers-repository";
import { siteConfig } from "@/lib/site-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const offers = await getAllOffers();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: siteConfig.url, changeFrequency: "hourly", priority: 1 },
    { url: `${siteConfig.url}/platforms`, changeFrequency: "daily", priority: 0.8 },
    { url: `${siteConfig.url}/categories`, changeFrequency: "daily", priority: 0.8 },
    { url: `${siteConfig.url}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteConfig.url}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteConfig.url}/contact`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const platformEntries: MetadataRoute.Sitemap = platforms.map((platform) => ({
    url: `${siteConfig.url}/platforms/${platform.slug}`,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${siteConfig.url}/categories/${category.slug}`,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  const offerEntries: MetadataRoute.Sitemap = offers.map((offer) => ({
    url: `${siteConfig.url}/offres/${offer.id}`,
    changeFrequency: "daily",
    priority: 0.6,
  }));

  return [...staticEntries, ...platformEntries, ...categoryEntries, ...offerEntries];
}
