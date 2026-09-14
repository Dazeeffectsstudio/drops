import { DropsHome } from "@/components/drops-home";
import { getCurrentUser } from "@/lib/auth";
import { getCurrentFavoritesState } from "@/lib/favorites-repository";
import { faqJsonLd } from "@/lib/json-ld";
import { getMyUnreadNotificationCount } from "@/lib/notification-logs-repository";
import { getMySubscribedOfferIds } from "@/lib/notification-subscriptions-repository";
import { getAllOffers } from "@/lib/offers-repository";
import { homeFaq } from "@/lib/seo-content";
import { siteConfig } from "@/lib/site-config";
import { getLastSyncForProvider } from "@/lib/sync-logs-repository";

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  description: siteConfig.description,
  url: siteConfig.url,
};

export default async function Home() {
  const [offers, user, { favorites }, subscribedOfferIds, unreadCount, lastEpicSync] = await Promise.all([
    getAllOffers(),
    getCurrentUser(),
    getCurrentFavoritesState(),
    getMySubscribedOfferIds(),
    getMyUnreadNotificationCount(),
    getLastSyncForProvider("epic-games"),
  ]);
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(homeFaq)) }} />
    <DropsHome
      offers={offers}
      user={user}
      initialFavorites={favorites}
      subscribedOfferIds={subscribedOfferIds}
      unreadCount={unreadCount}
      lastEpicSyncAt={lastEpicSync?.createdAt ?? null}
    />
  </>;
}
