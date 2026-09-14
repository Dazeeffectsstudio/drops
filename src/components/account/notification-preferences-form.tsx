"use client";

import { useActionState } from "react";
import { saveNotificationPreferencesAction, type NotificationPreferencesFormState } from "@/app/account/notifications/actions";
import type { NotificationPreferences } from "@/lib/notification-preferences-repository";

const initialState: NotificationPreferencesFormState = {};

const switches: Array<{ name: keyof NotificationPreferences; label: string; hint: string }> = [
  { name: "newOffers", label: "Nouveaux jeux gratuits", hint: "Toute nouvelle offre correspondant à tes plateformes ci-dessous." },
  { name: "epicGames", label: "Epic Games", hint: "Reçois les nouvelles offres Epic Games." },
  { name: "steam", label: "Steam", hint: "Reçois les nouvelles offres Steam." },
  { name: "twitchDrops", label: "Twitch Drops", hint: "Reçois les nouveaux Twitch Drops." },
  { name: "primeGaming", label: "Prime Gaming", hint: "Reçois les nouvelles offres Prime Gaming." },
  { name: "expiringSoon", label: "Offres qui expirent bientôt", hint: "Pour tes favoris et les offres que tu suis (24h et 2h avant la fin)." },
];

export function NotificationPreferencesForm({ preferences }: { preferences: NotificationPreferences }) {
  const [state, formAction, pending] = useActionState(saveNotificationPreferencesAction, initialState);

  return <form action={formAction} className="notif-prefs-form">
    {switches.map((entry) => <label key={entry.name} className="notif-switch-row">
      <span className="notif-switch-copy"><strong>{entry.label}</strong><small>{entry.hint}</small></span>
      <span className="notif-switch">
        <input type="checkbox" name={entry.name} defaultChecked={preferences[entry.name]} />
        <span className="notif-switch-track" aria-hidden="true"><span className="notif-switch-thumb" /></span>
      </span>
    </label>)}
    {state.error && <p className="auth-error">{state.error}</p>}
    {state.success && <p className="auth-message">Préférences enregistrées.</p>}
    <button type="submit" className="claim-button" disabled={pending}>{pending ? "ENREGISTREMENT…" : "ENREGISTRER"}</button>
  </form>;
}
