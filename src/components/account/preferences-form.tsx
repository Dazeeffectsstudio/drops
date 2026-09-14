"use client";

import { useActionState } from "react";
import { savePreferencesAction, type PreferencesFormState } from "@/app/account/actions";
import { categories, platforms } from "@/lib/catalog";
import type { OfferCategory, OfferStore } from "@/types/offer";

const initialState: PreferencesFormState = {};

const countries = [
  { code: "BE", label: "Belgique" },
  { code: "FR", label: "France" },
  { code: "NL", label: "Pays-Bas" },
  { code: "LU", label: "Luxembourg" },
];

export function PreferencesForm({ preferences }: { preferences: { platforms: OfferStore[]; categories: OfferCategory[]; country: string } }) {
  const [state, formAction, pending] = useActionState(savePreferencesAction, initialState);

  return <form action={formAction} className="preferences-form">
    <div className="preferences-group">
      <span className="filter-label">PLATEFORMES FAVORITES</span>
      <div className="preferences-chips">
        {platforms.map((entry) => <label key={entry.store} className="preference-chip">
          <input type="checkbox" name="platforms" value={entry.store} defaultChecked={preferences.platforms.includes(entry.store)} />
          <span>{entry.label}</span>
        </label>)}
      </div>
    </div>
    <div className="preferences-group">
      <span className="filter-label">CATÉGORIES FAVORITES</span>
      <div className="preferences-chips">
        {categories.map((entry) => <label key={entry.category} className="preference-chip">
          <input type="checkbox" name="categories" value={entry.category} defaultChecked={preferences.categories.includes(entry.category)} />
          <span>{entry.label}</span>
        </label>)}
      </div>
    </div>
    <div className="preferences-group">
      <span className="filter-label">PAYS</span>
      <select name="country" defaultValue={preferences.country} className="preferences-select">
        {countries.map((entry) => <option key={entry.code} value={entry.code}>{entry.label}</option>)}
      </select>
    </div>
    {state.error && <p className="auth-error">{state.error}</p>}
    {state.success && <p className="auth-message">Préférences enregistrées.</p>}
    <button type="submit" className="claim-button" disabled={pending}>{pending ? "ENREGISTREMENT…" : "ENREGISTRER MES PRÉFÉRENCES"}</button>
  </form>;
}
