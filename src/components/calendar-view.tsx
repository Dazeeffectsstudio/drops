"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { categories as categoryEntries, platforms as platformEntries } from "@/lib/catalog";
import { useFavorites } from "@/lib/favorites";
import type { AuthUser } from "@/lib/auth";
import type { Offer, OfferCategory, OfferStore } from "@/types/offer";

type CalendarEvent = { offer: Offer; kind: "start" | "end" };
type ViewMode = "week" | "month";

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function startOfWeek(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = (d.getDay() + 6) % 7; // 0 = lundi
  d.setDate(d.getDate() - day);
  return d;
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

const stores: Array<OfferStore | "TOUT"> = ["TOUT", ...platformEntries.map((entry) => entry.store)];
const categories: Array<OfferCategory | "TOUT"> = ["TOUT", ...categoryEntries.map((entry) => entry.category)];

// Reprend exactement la structure de la vraie grille (toolbar + 42 cellules)
// pour que le passage au vrai contenu, une fois monté, ne décale rien —
// plutôt qu'un texte "Chargement…" centré qui disparaît d'un coup.
function CalendarSkeleton() {
  return <div className="calendar-view calendar-skeleton" aria-hidden="true">
    <div className="calendar-toolbar">
      <div className="calendar-nav">
        <span className="skeleton-block" style={{ width: 34, height: 34, borderRadius: 8 }} />
        <span className="skeleton-block" style={{ width: 92, height: 34, borderRadius: 8 }} />
        <span className="skeleton-block" style={{ width: 34, height: 34, borderRadius: 8 }} />
        <span className="skeleton-block" style={{ width: 140, height: 15, marginLeft: 6 }} />
      </div>
    </div>
    <div className="calendar-grid">
      {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => <div key={d} className="calendar-weekday">{d}</div>)}
      {Array.from({ length: 42 }, (_, i) => <div key={i} className="calendar-cell">
        <span className="skeleton-block" style={{ width: 16, height: 10 }} />
        {i % 5 === 0 && <span className="skeleton-block" style={{ width: "80%", height: 14, marginTop: 4 }} />}
      </div>)}
    </div>
  </div>;
}

export function CalendarView({ offers, user, initialFavorites }: { offers: Offer[]; user: AuthUser | null; initialFavorites: string[] }) {
  // `mounted` évite tout hydration mismatch : découper des offres par jour
  // calendaire dépend du fuseau horaire du visiteur (voir la note sur
  // Intl.DateTimeFormat dans drops-home.tsx) — on n'affiche donc la grille
  // qu'une fois monté côté client, identique des deux côtés avant ça.
  const [mounted, setMounted] = useState(false);
  const [anchor, setAnchor] = useState<Date | null>(null);
  const [view, setView] = useState<ViewMode>("month");
  const [store, setStore] = useState<OfferStore | "TOUT">("TOUT");
  const [category, setCategory] = useState<OfferCategory | "TOUT">("TOUT");
  const [onlyFollowed, setOnlyFollowed] = useState(false);
  const { favorites } = useFavorites(user?.id ?? null, initialFavorites);

  useEffect(() => { setMounted(true); setAnchor(new Date()); }, []);

  const filteredOffers = useMemo(() => offers.filter((offer) =>
    (store === "TOUT" || offer.store === store) &&
    (category === "TOUT" || offer.category === category) &&
    (!onlyFollowed || favorites.includes(offer.id)),
  ), [offers, store, category, onlyFollowed, favorites]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const offer of filteredOffers) {
      const end = new Date(offer.expiresAt);
      const endKey = dateKey(end);
      map.set(endKey, [...(map.get(endKey) ?? []), { offer, kind: "end" }]);
      if (offer.startsAt) {
        const start = new Date(offer.startsAt);
        const startKey = dateKey(start);
        map.set(startKey, [...(map.get(startKey) ?? []), { offer, kind: "start" }]);
      }
    }
    return map;
  }, [filteredOffers]);

  if (!mounted || !anchor) return <CalendarSkeleton />;

  const days: Date[] = view === "week"
    ? Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(anchor), i))
    : (() => {
        const firstOfMonth = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
        const gridStart = startOfWeek(firstOfMonth);
        return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
      })();

  const today = dateKey(new Date());
  const periodLabel = view === "week"
    ? `Semaine du ${new Intl.DateTimeFormat("fr-BE", { day: "numeric", month: "long" }).format(days[0])}`
    : new Intl.DateTimeFormat("fr-BE", { month: "long", year: "numeric" }).format(anchor);

  function shift(amount: number) {
    setAnchor((current) => {
      const base = current ?? new Date();
      return view === "week" ? addDays(base, amount * 7) : new Date(base.getFullYear(), base.getMonth() + amount, 1);
    });
  }

  return <div className="calendar-view">
    <div className="calendar-toolbar">
      <div className="calendar-nav">
        <button type="button" onClick={() => shift(-1)} aria-label="Période précédente">←</button>
        <button type="button" onClick={() => setAnchor(new Date())} className="admin-test-button">AUJOURD&apos;HUI</button>
        <button type="button" onClick={() => shift(1)} aria-label="Période suivante">→</button>
        <strong className="calendar-period-label">{periodLabel}</strong>
      </div>
      <div className="admin-sync-filters">
        <button type="button" className={view === "week" ? "selected" : ""} onClick={() => setView("week")}>Semaine</button>
        <button type="button" className={view === "month" ? "selected" : ""} onClick={() => setView("month")}>Mois</button>
        {user && <button type="button" className={onlyFollowed ? "selected" : ""} onClick={() => setOnlyFollowed((v) => !v)}>Offres suivies</button>}
      </div>
    </div>
    <div className="filters" aria-label="Filtres du calendrier">
      <div className="filter-group" role="group" aria-label="Plateforme"><span className="filter-label">PLATEFORME</span><div className="filter-options">{stores.map((item) => <button key={item} type="button" className={store === item ? "selected" : ""} onClick={() => setStore(item)}>{item}</button>)}</div></div>
      <div className="filter-group" role="group" aria-label="Catégorie"><span className="filter-label">TYPE</span><div className="filter-options">{categories.map((item) => <button key={item} type="button" className={category === item ? "selected" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div></div>
    </div>

    <div className={`calendar-grid calendar-grid--${view}`}>
      {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => <div key={d} className="calendar-weekday">{d}</div>)}
      {days.map((day) => {
        const key = dateKey(day);
        const events = eventsByDay.get(key) ?? [];
        const isToday = key === today;
        const isOtherMonth = view === "month" && day.getMonth() !== anchor.getMonth();
        return <div key={key} className={`calendar-cell ${isToday ? "calendar-cell--today" : ""} ${isOtherMonth ? "calendar-cell--muted" : ""}`}>
          <span className="calendar-cell-date">{day.getDate()}</span>
          <div className="calendar-cell-events">
            {events.slice(0, 4).map((event, i) => <Link key={i} href={`/offres/${event.offer.id}`} className={`calendar-event calendar-event--${event.offer.accent}`} title={`${event.kind === "start" ? "Début" : "Fin"} : ${event.offer.title}`}>
              <span aria-hidden="true">{event.kind === "start" ? "▶" : "■"}</span> {event.offer.title}
            </Link>)}
            {events.length > 4 && <span className="calendar-event-more">+{events.length - 4}</span>}
          </div>
        </div>;
      })}
    </div>
    {filteredOffers.length === 0 && <div className="empty-state"><span>∅</span><h3>Aucune offre ne correspond à ces filtres.</h3></div>}
  </div>;
}
