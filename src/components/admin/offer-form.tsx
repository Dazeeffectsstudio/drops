"use client";

import { useActionState } from "react";
import { saveOfferAction, type OfferFormState } from "@/app/admin/actions";
import { categories, platforms } from "@/lib/catalog";
import type { Offer } from "@/types/offer";

function toDatetimeLocal(iso: string | undefined | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const initialState: OfferFormState = {};

export function OfferForm({ offer }: { offer?: Offer }) {
  const [state, formAction, pending] = useActionState(saveOfferAction, initialState);

  return <form action={formAction} className="admin-form">
    {offer && <input type="hidden" name="id" value={offer.id} />}

    <div className="admin-field">
      <label htmlFor="title">Titre</label>
      <input id="title" name="title" type="text" defaultValue={offer?.title} required maxLength={120} />
    </div>

    <div className="admin-field">
      <label htmlFor="description">Description</label>
      <textarea id="description" name="description" defaultValue={offer?.description} required rows={4} maxLength={600} />
    </div>

    <div className="admin-field-row">
      <div className="admin-field">
        <label htmlFor="store">Plateforme</label>
        <select id="store" name="store" defaultValue={offer?.store ?? platforms[0].store} required>
          {platforms.map((entry) => <option key={entry.store} value={entry.store}>{entry.label}</option>)}
        </select>
      </div>
      <div className="admin-field">
        <label htmlFor="category">Catégorie</label>
        <select id="category" name="category" defaultValue={offer?.category ?? categories[0].category} required>
          {categories.map((entry) => <option key={entry.category} value={entry.category}>{entry.label}</option>)}
        </select>
      </div>
    </div>

    <div className="admin-field">
      <label htmlFor="image">Image (chemin ou URL)</label>
      <input id="image" name="image" type="text" defaultValue={offer?.image} required placeholder="/images/mon-offre.svg" />
    </div>

    <div className="admin-field-row">
      <div className="admin-field">
        <label htmlFor="originalPrice">Ancien prix en € (optionnel)</label>
        <input id="originalPrice" name="originalPrice" type="number" min={0} step="0.01" defaultValue={offer?.originalPrice ?? ""} />
      </div>
      <div className="admin-field">
        <label htmlFor="currentPrice">Prix actuel en €</label>
        <input id="currentPrice" name="currentPrice" type="number" min={0} step="0.01" defaultValue={offer?.currentPrice ?? 0} required />
      </div>
    </div>

    <div className="admin-field-row">
      <div className="admin-field">
        <label htmlFor="startsAt">Date de début (optionnel — pour une offre « bientôt gratuite »)</label>
        <input id="startsAt" name="startsAt" type="datetime-local" defaultValue={toDatetimeLocal(offer?.startsAt)} />
      </div>
      <div className="admin-field">
        <label htmlFor="expiresAt">Date d&apos;expiration</label>
        <input id="expiresAt" name="expiresAt" type="datetime-local" defaultValue={toDatetimeLocal(offer?.expiresAt)} required />
      </div>
    </div>

    <div className="admin-field">
      <label htmlFor="url">Lien</label>
      <input id="url" name="url" type="text" defaultValue={offer?.url} required placeholder="https://…" />
    </div>

    <div className="admin-checkboxes">
      <label><input type="checkbox" name="featured" defaultChecked={offer?.featured} /> Featured (carrousel de la une)</label>
      <label><input type="checkbox" name="trending" defaultChecked={offer?.trending} /> Trending (en tendance)</label>
      <label><input type="checkbox" name="isNew" defaultChecked={offer?.isNew} /> Nouveau</label>
    </div>

    {state.error && <p className="admin-form-error">{state.error}</p>}

    <button type="submit" className="claim-button" disabled={pending}>
      {pending ? "Enregistrement…" : offer ? "Enregistrer les modifications" : "Créer l'offre"}
    </button>
  </form>;
}
