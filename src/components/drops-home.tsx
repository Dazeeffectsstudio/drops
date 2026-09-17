"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { categories as categoryEntries, platforms as platformEntries } from "@/lib/catalog";
import { useFavorites } from "@/lib/favorites";
import { homeFaq } from "@/lib/seo-content";
import { formatPrice, isOfferActive, isOfferUpcoming, offerExpiresAt, totalFreeValue } from "@/lib/offers";
import type { AuthUser } from "@/lib/auth";
import type { Offer, OfferCategory, OfferStore } from "@/types/offer";
import { AccountNavLink } from "./account-nav-link";
import { BrandHero } from "./brand-hero";
import { ArrowIcon, SearchIcon } from "./icons";
import { InstallPwaButton } from "./install-pwa-button";
import { OfferCard } from "./offer-card";
import { PlatformQuickNav } from "./platform-quicknav";
import { Reveal } from "./reveal";
import { UpcomingSection } from "./upcoming-section";

const stores: Array<OfferStore | "TOUT"> = ["TOUT", ...platformEntries.map((entry) => entry.store)];
const categories: Array<OfferCategory | "TOUT"> = ["TOUT", ...categoryEntries.map((entry) => entry.category)];

type QuickFilter = "TOUT" | "AUJOURDHUI" | "SEMAINE" | "BIENTOT" | "NOUVEAU";
const quickFilters: Array<{ key: QuickFilter; label: string }> = [
  { key: "TOUT", label: "Tout" },
  { key: "AUJOURDHUI", label: "Aujourd'hui" },
  { key: "SEMAINE", label: "Cette semaine" },
  { key: "BIENTOT", label: "Expire bientôt" },
  { key: "NOUVEAU", label: "Nouvelles offres" },
];
const DAY_MS = 24 * 3_600_000;

function matchesQuickFilter(offer: Offer, filter: QuickFilter, now: number): boolean {
  if (filter === "TOUT") return true;
  if (filter === "NOUVEAU") return offer.isNew;
  const remaining = offerExpiresAt(offer) - now;
  if (filter === "AUJOURDHUI") return remaining <= DAY_MS;
  if (filter === "BIENTOT") return remaining <= 2 * DAY_MS;
  if (filter === "SEMAINE") return remaining <= 7 * DAY_MS;
  return true;
}

type Props = { offers: Offer[]; user: AuthUser | null; initialFavorites: string[]; subscribedOfferIds: string[]; unreadCount?: number };

export function DropsHome({ offers, user, initialFavorites, subscribedOfferIds, unreadCount = 0 }: Props) {
  const [store, setStore] = useState<OfferStore | "TOUT">("TOUT");
  const [category, setCategory] = useState<OfferCategory | "TOUT">("TOUT");
  const [dropsAndItems, setDropsAndItems] = useState(false);
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("TOUT");
  const [query, setQuery] = useState("");
  const [now, setNow] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const { favorites, toggleFavorite } = useFavorites(user?.id ?? null, initialFavorites);

  useEffect(() => {
    const current = Date.now();
    setNow(current);
    const interval = window.setInterval(() => setNow(Date.now()), 30_000);
    const handleScroll = () => setHeaderScrolled(window.scrollY > 16);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => { window.clearInterval(interval); window.removeEventListener("scroll", handleScroll); };
  }, []);

  function showClaimNotice(offer: Offer) {
    setNotice(`${offer.title} est une offre de démonstration. Aucun lien de récupération n’est encore disponible.`);
  }

  const availableOffers = useMemo(() => offers.filter((offer) => isOfferActive(offer, now ?? Date.now())), [offers, now]);
  const visibleOffers = useMemo(() => {
    const search = query.trim().toLocaleLowerCase("fr");
    return availableOffers.filter((offer) =>
      (store === "TOUT" || offer.store === store) &&
      (category === "TOUT" || offer.category === category) &&
      (!dropsAndItems || offer.category === "ITEMS" || offer.category === "TWITCH DROPS") &&
      matchesQuickFilter(offer, quickFilter, now ?? Date.now()) &&
      (!search || `${offer.title} ${offer.platform} ${offer.store} ${offer.category}`.toLocaleLowerCase("fr").includes(search)),
    );
  }, [availableOffers, store, category, dropsAndItems, quickFilter, query, now]);

  const searchSuggestions = useMemo(() => {
    const search = query.trim().toLocaleLowerCase("fr");
    if (!search) return [];
    return availableOffers.filter((offer) => offer.title.toLocaleLowerCase("fr").includes(search)).slice(0, 5);
  }, [availableOffers, query]);

  const trendingOffers = availableOffers.filter((offer) => offer.trending).slice(0, 4);
  const featuredOffers = availableOffers.filter((offer) => offer.featured);
  const heroOffers = (featuredOffers.length > 0 ? featuredOffers : trendingOffers.length > 0 ? trendingOffers : availableOffers).slice(0, 4);
  const upcomingOffers = useMemo(() => offers.filter((offer) => isOfferUpcoming(offer, now ?? Date.now())), [offers, now]);
  const total = totalFreeValue(availableOffers);
  function navigateToOffers(nextCategory: OfferCategory | "TOUT" = "TOUT") {
    setStore("TOUT"); setCategory(nextCategory); setDropsAndItems(false); setQuickFilter("TOUT");
    document.getElementById("offres")?.scrollIntoView({ behavior: "smooth" });
  }
  function showDropsAndItems() {
    setStore("TOUT"); setCategory("TOUT"); setDropsAndItems(true); setQuickFilter("TOUT");
    document.getElementById("offres")?.scrollIntoView({ behavior: "smooth" });
  }
  function filterByPlatform(nextStore: OfferStore) {
    setStore(nextStore); setCategory("TOUT"); setDropsAndItems(false); setQuickFilter("TOUT");
    document.getElementById("offres")?.scrollIntoView({ behavior: "smooth" });
  }

  return <>
    <div id="top" className="site-shell">
      <header className={`site-header ${headerScrolled ? "site-header--scrolled" : ""}`}>
        <Link href="/" className="brand" aria-label="DROPS, accueil">DROPS<span className="brand-period">.</span></Link>
        <nav className="main-nav" aria-label="Navigation principale">
          <button type="button" onClick={() => navigateToOffers()}>Gratuit maintenant</button>
          <button type="button" onClick={() => navigateToOffers("JEUX")}>Jeux</button>
          <button type="button" onClick={showDropsAndItems}>Drops &amp; Items</button>
          <Link href="/platforms">Plateformes</Link>
          <Link href="/categories">Catégories</Link>
          <Link href="/calendar">Calendrier</Link>
          <Link href="/community">Communauté</Link>
          <Link href="/favoris">Favoris{favorites.length > 0 && <b>{favorites.length}</b>}</Link>
        </nav>
        <div className="header-actions">
          <InstallPwaButton variant="compact" />
          <button type="button" className="header-search" onClick={() => document.getElementById("offer-search")?.focus()} aria-label="Rechercher une offre"><SearchIcon /></button>
          <AccountNavLink user={user} unreadCount={unreadCount} />
        </div>
      </header>
      <PlatformQuickNav active={store} onSelect={filterByPlatform} />
      <main>
        <BrandHero totalValueLabel={formatPrice(total)} offerCount={availableOffers.length} onCtaClick={() => navigateToOffers()} featuredOffer={heroOffers[0]} />
        <Reveal><section id="tendance" className="trending-section" aria-labelledby="trending-title">
          <div className="section-heading"><div><span className="section-index">SÉLECTION</span><h2 id="trending-title">🔥 EN <em>TENDANCE</em></h2></div><p>Les offres les plus regardées<br />en ce moment.</p></div>
          <div className="trending-grid">{trendingOffers.map((offer, index) => <Link href={`/offres/${offer.id}`} key={offer.id} className="trending-card reveal"><span className="trending-rank">0{index + 1}</span><Image src={offer.image} alt={offer.imageAlt} fill sizes="(max-width: 700px) 50vw, 25vw" className="trending-card-image" /><span className="trending-card-shade" /><span className="trending-card-content"><span>{offer.store}</span><strong>{offer.title}</strong><small>{offer.category} · GRATUIT</small></span></Link>)}</div>
        </section></Reveal>
        <Reveal><section id="offres" className="offers-section" aria-labelledby="offers-title">
          <div className="section-heading"><div><span className="section-index">LE CATALOGUE</span><h2 id="offers-title">GRATUIT <em>MAINTENANT</em></h2></div><p>Des opportunités à saisir<br />avant qu&apos;elles disparaissent.</p></div>
          <div className="search-row-wrap">
            <div className="search-row"><SearchIcon /><input id="offer-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un jeu, une plateforme, une catégorie…" aria-label="Rechercher une offre" autoComplete="off" />{query && <button type="button" onClick={() => setQuery("")} aria-label="Effacer la recherche">×</button>}</div>
            {searchSuggestions.length > 0 && <ul className="search-suggestions" role="listbox">
              {searchSuggestions.map((offer) => <li key={offer.id}><Link href={`/offres/${offer.id}`}><span>{offer.title}</span><small>{offer.store} · {offer.category}</small></Link></li>)}
            </ul>}
          </div>
          <div className="filters" aria-label="Filtres des offres">
            <div className="filter-options filter-options--quick" role="group" aria-label="Filtre rapide">{quickFilters.map((entry) => <button key={entry.key} type="button" className={quickFilter === entry.key ? "selected" : ""} onClick={() => setQuickFilter(entry.key)} aria-pressed={quickFilter === entry.key}>{entry.label}</button>)}</div>
            <div className="filter-selects">
              <select className="filter-select" value={store} onChange={(event) => setStore(event.target.value as OfferStore | "TOUT")} aria-label="Filtrer par plateforme">
                {stores.map((item) => <option key={item} value={item}>{item === "TOUT" ? "Toutes les plateformes" : item}</option>)}
              </select>
              <select className="filter-select" value={dropsAndItems ? "" : category} onChange={(event) => { setDropsAndItems(false); setCategory(event.target.value as OfferCategory | "TOUT"); }} aria-label="Filtrer par catégorie">
                {categories.map((item) => <option key={item} value={item}>{item === "TOUT" ? "Toutes les catégories" : item}</option>)}
              </select>
            </div>
          </div>
          <div className="results-line"><span>{query ? `RÉSULTATS POUR « ${query} »` : dropsAndItems ? "DROPS & ITEMS" : "TOUTES LES OFFRES"}</span><span>{visibleOffers.length.toString().padStart(2, "0")} RÉSULTAT{visibleOffers.length > 1 ? "S" : ""}</span></div>
          {visibleOffers.length > 0 ? <div className="offer-grid">{visibleOffers.map((offer, index) => <OfferCard key={offer.id} offer={offer} expiresAt={offerExpiresAt(offer)} now={now} favorite={favorites.includes(offer.id)} onFavorite={() => toggleFavorite(offer.id)} onClaim={() => showClaimNotice(offer)} featured={index === 0} />)}</div> : <div className="empty-state"><span>∅</span><h3>Aucune offre ici pour l&apos;instant.</h3><p>Essaie une autre recherche ou retire les filtres.</p><button type="button" onClick={() => { setStore("TOUT"); setCategory("TOUT"); setDropsAndItems(false); setQuickFilter("TOUT"); setQuery(""); }}>VOIR TOUTES LES OFFRES <ArrowIcon className="arrow-icon" /></button></div>}
        </section></Reveal>
        <UpcomingSection offers={upcomingOffers} now={now} userId={user?.id ?? null} subscribedOfferIds={subscribedOfferIds} onNotified={setNotice} />
        <Reveal><section className="why-section" aria-labelledby="why-title">
          <div className="section-heading"><div><span className="section-index">POURQUOI DROPS</span><h2 id="why-title">Pourquoi <em>DROPS</em> ?</h2></div></div>
          <div className="why-grid">
            <div className="why-card"><span className="why-icon" aria-hidden="true">✓</span><strong>100% gratuit</strong><p>DROPS ne vend rien et ne demande jamais ta carte bancaire — juste un annuaire des vraies offres gratuites.</p></div>
            <div className="why-card"><span className="why-icon" aria-hidden="true">⚡</span><strong>Synchronisation automatique</strong><p>Les offres sont détectées directement depuis les sources officielles, pas de saisie manuelle qui prend du retard.</p></div>
            <div className="why-card"><span className="why-icon" aria-hidden="true">🔔</span><strong>Notifications sur-mesure</strong><p>Choisis tes plateformes préférées et reçois un email dès qu&apos;une nouvelle offre correspond.</p></div>
            <div className="why-card"><span className="why-icon" aria-hidden="true">🇧🇪</span><strong>Pensé pour la Belgique</strong><p>Prix en euros, fuseau horaire local, et une sélection qui privilégie les offres disponibles chez nous.</p></div>
          </div>
        </section></Reveal>
        <Reveal><section className="faq-section" aria-labelledby="faq-title">
          <span className="section-index">FAQ</span>
          <h2 id="faq-title">Questions <em>fréquentes</em></h2>
          <div className="faq-list">
            {homeFaq.map((entry) => <details key={entry.question} className="faq-item">
              <summary>{entry.question}</summary>
              <p>{entry.answer}</p>
            </details>)}
          </div>
        </section></Reveal>
      </main>
      <footer className="site-footer"><span className="footer-brand">DROPS<span>.</span></span><span>DON&apos;T PAY. JUST PLAY.</span><nav className="footer-links" aria-label="Liens du site"><Link href="/free-games-this-week">Jeux de la semaine</Link><Link href="/community">Communauté</Link><Link href="/feedback">Feedback</Link><Link href="/privacy">Confidentialité</Link><Link href="/terms">Conditions</Link><Link href="/contact">Contact</Link></nav></footer>
    </div>
    {notice && <div className="notice" role="status"><p>{notice}</p><button type="button" onClick={() => setNotice(null)} aria-label="Fermer le message">×</button></div>}
  </>;
}
