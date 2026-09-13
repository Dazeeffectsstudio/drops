"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { offers } from "@/data/offers";
import { useFavorites } from "@/lib/favorites";
import { formatPrice, isOfferActive, offerExpiresAt, totalFreeValue } from "@/lib/offers";
import type { OfferCategory, OfferStore } from "@/types/offer";
import { ArrowIcon, SearchIcon, SparkIcon } from "./icons";
import { OfferCard } from "./offer-card";

const stores: Array<OfferStore | "TOUT"> = ["TOUT", "Steam", "Epic Games", "PlayStation", "Xbox", "Twitch", "Roblox"];
const categories: Array<OfferCategory | "TOUT"> = ["TOUT", "JEUX", "ITEMS", "TWITCH DROPS", "DLC", "WEEK-END GRATUIT"];

export function DropsHome() {
  const [store, setStore] = useState<OfferStore | "TOUT">("TOUT");
  const [category, setCategory] = useState<OfferCategory | "TOUT">("TOUT");
  const [dropsAndItems, setDropsAndItems] = useState(false);
  const [query, setQuery] = useState("");
  const [now, setNow] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const { favorites, toggleFavorite } = useFavorites();

  useEffect(() => {
    const current = Date.now();
    setNow(current);
    const interval = window.setInterval(() => setNow(Date.now()), 30_000);
    const handleScroll = () => setHeaderScrolled(window.scrollY > 16);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => { window.clearInterval(interval); window.removeEventListener("scroll", handleScroll); };
  }, []);

  const availableOffers = useMemo(() => offers.filter((offer) => isOfferActive(offer, now ?? Date.now())), [now]);
  const visibleOffers = useMemo(() => {
    const search = query.trim().toLocaleLowerCase("fr");
    return offers.filter((offer) =>
      (store === "TOUT" || offer.store === store) &&
      (category === "TOUT" || offer.category === category) &&
      (!dropsAndItems || offer.category === "ITEMS" || offer.category === "TWITCH DROPS") &&
      (!search || `${offer.title} ${offer.platform} ${offer.store} ${offer.category}`.toLocaleLowerCase("fr").includes(search)),
    );
  }, [store, category, dropsAndItems, query]);

  const trendingOffers = availableOffers.filter((offer) => offer.trending).slice(0, 4);
  const total = totalFreeValue(availableOffers);
  const games = availableOffers.filter((offer) => offer.category === "JEUX").length;
  const drops = availableOffers.filter((offer) => offer.category === "TWITCH DROPS").length;
  const skins = availableOffers.filter((offer) => offer.category === "ITEMS").length;
  function navigateToOffers(nextCategory: OfferCategory | "TOUT" = "TOUT") {
    setStore("TOUT"); setCategory(nextCategory); setDropsAndItems(false);
    document.getElementById("offres")?.scrollIntoView({ behavior: "smooth" });
  }
  function showDropsAndItems() {
    setStore("TOUT"); setCategory("TOUT"); setDropsAndItems(true);
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
          <Link href="/plateformes">Plateformes</Link>
          <Link href="/categories">Catégories</Link>
          <Link href="/favoris">Favoris{favorites.length > 0 && <b>{favorites.length}</b>}</Link>
        </nav>
        <button type="button" className="header-search" onClick={() => document.getElementById("offer-search")?.focus()} aria-label="Rechercher une offre"><SearchIcon /></button>
      </header>
      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <div className="hero-kicker"><span className="live-dot" /> +12 NOUVELLES OFFRES AUJOURD&apos;HUI <span className="kicker-line" /></div>
            <h1 id="hero-title">DROPS<span>.</span></h1>
            <p className="hero-slogan">DON&apos;T PAY.<br /><em>JUST PLAY.</em></p>
            <p className="hero-description">Tous les jeux, drops et récompenses que tu peux récupérer gratuitement. Sans bruit, seulement les bonnes opportunités.</p>
            <div className="hero-actions"><button type="button" className="hero-button" onClick={() => navigateToOffers()}>VOIR LES DROPS <ArrowIcon className="arrow-icon" /></button><button type="button" className="hero-button hero-button--quiet" onClick={() => document.getElementById("tendance")?.scrollIntoView({ behavior: "smooth" })}>EN TENDANCE <SparkIcon className="arrow-icon" /></button></div>
          </div>
          <div className="hero-visual" aria-hidden="true"><div className="hero-orbit hero-orbit-one" /><div className="hero-orbit hero-orbit-two" /><div className="hero-disc" /><span className="hero-visual-label">PLAY MORE / PAY LESS</span><span className="hero-visual-no">01—04</span></div>
        </section>
        <section className="stats" aria-label="Statistiques des offres disponibles">
          <div className="stats-icon" aria-hidden="true">↗</div><div className="stats-copy"><strong>{formatPrice(total)}</strong><span>DE CONTENU GRATUIT DISPONIBLE AUJOURD&apos;HUI</span></div>
          <div className="stats-grid"><span><b>{availableOffers.length}</b> offres</span><span><b>{games}</b> jeux</span><span><b>{drops}</b> drops</span><span><b>{skins}</b> skins</span></div>
        </section>
        <section id="tendance" className="trending-section" aria-labelledby="trending-title">
          <div className="section-heading"><div><span className="section-index">01 / SÉLECTION</span><h2 id="trending-title">🔥 EN <em>TENDANCE</em></h2></div><p>Les offres les plus regardées<br />en ce moment.</p></div>
          <div className="trending-grid">{trendingOffers.map((offer, index) => <Link href={`/offres/${offer.id}`} key={offer.id} className="trending-card reveal"><span className="trending-rank">0{index + 1}</span><span className="trending-card-image" style={{ backgroundImage: `url(${offer.image})` }} /><span className="trending-card-shade" /><span className="trending-card-content"><span>{offer.store}</span><strong>{offer.title}</strong><small>{offer.category} · GRATUIT</small></span></Link>)}</div>
        </section>
        <section id="offres" className="offers-section" aria-labelledby="offers-title">
          <div className="section-heading"><div><span className="section-index">02 / LES OFFRES</span><h2 id="offers-title"><span className="heading-spark">✳</span> GRATUIT <em>MAINTENANT</em></h2></div><p>Des opportunités à saisir<br />avant qu&apos;elles disparaissent.</p></div>
          <div className="search-row"><SearchIcon /><input id="offer-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un jeu, une plateforme, une catégorie…" aria-label="Rechercher une offre" />{query && <button type="button" onClick={() => setQuery("")} aria-label="Effacer la recherche">×</button>}</div>
          <div className="filters" aria-label="Filtres des offres">
            <div className="filter-group" role="group" aria-label="Plateforme"><span className="filter-label">PLATEFORME</span><div className="filter-options">{stores.map((item) => <button key={item} type="button" className={store === item ? "selected" : ""} onClick={() => setStore(item)} aria-pressed={store === item}>{item}</button>)}</div></div>
            <div className="filter-group" role="group" aria-label="Catégorie"><span className="filter-label">TYPE</span><div className="filter-options">{categories.map((item) => <button key={item} type="button" className={category === item && !dropsAndItems ? "selected" : ""} onClick={() => { setDropsAndItems(false); setCategory(item); }} aria-pressed={category === item && !dropsAndItems}>{item}</button>)}</div></div>
          </div>
          <div className="results-line"><span>{query ? `RÉSULTATS POUR « ${query} »` : dropsAndItems ? "DROPS & ITEMS" : "TOUTES LES OFFRES"}</span><span>{visibleOffers.length.toString().padStart(2, "0")} RÉSULTAT{visibleOffers.length > 1 ? "S" : ""}</span></div>
          {visibleOffers.length > 0 ? <div className="offer-grid">{visibleOffers.map((offer) => <OfferCard key={offer.id} offer={offer} expiresAt={offerExpiresAt(offer)} now={now} favorite={favorites.includes(offer.id)} onFavorite={() => toggleFavorite(offer.id)} onClaim={() => setNotice(`${offer.title} est une offre de démonstration. Aucun lien de récupération n’est encore disponible.`)} />)}</div> : <div className="empty-state"><span>∅</span><h3>Aucune offre ici pour l&apos;instant.</h3><p>Essaie une autre recherche ou retire les filtres.</p><button type="button" onClick={() => { setStore("TOUT"); setCategory("TOUT"); setDropsAndItems(false); setQuery(""); }}>VOIR TOUTES LES OFFRES <ArrowIcon className="arrow-icon" /></button></div>}
        </section>
      </main>
      <footer className="site-footer"><span className="footer-brand">DROPS<span>.</span></span><span>DON&apos;T PAY. JUST PLAY.</span><span>VERSION DÉMO · OFFRES FICTIVES</span></footer>
    </div>
    {notice && <div className="notice" role="status"><p>{notice}</p><button type="button" onClick={() => setNotice(null)} aria-label="Fermer le message">×</button></div>}
  </>;
}
