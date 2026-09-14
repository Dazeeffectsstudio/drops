"use client";

import { useActionState } from "react";
import { saveBannerAction, type BannerFormState } from "@/app/admin/banner/actions";
import type { BetaBannerData } from "@/lib/beta-banner-repository";

const initialState: BannerFormState = {};

export function BannerForm({ banner }: { banner: BetaBannerData }) {
  const [state, formAction, pending] = useActionState(saveBannerAction, initialState);

  return <form action={formAction} className="admin-form">
    <label className="notif-switch-row" style={{ cursor: "pointer" }}>
      <span className="notif-switch-copy"><strong>Bannière active</strong><small>Visible en haut de toutes les pages du site.</small></span>
      <span className="notif-switch">
        <input type="checkbox" name="enabled" defaultChecked={banner.enabled} />
        <span className="notif-switch-track" aria-hidden="true"><span className="notif-switch-thumb" /></span>
      </span>
    </label>

    <div className="admin-field">
      <label>Texte de la bannière</label>
      <input type="text" name="message" defaultValue={banner.message} placeholder="🚀 DROPS est actuellement en bêta publique." maxLength={200} />
    </div>
    <div className="admin-field-row">
      <div className="admin-field"><label>Lien (optionnel — Discord, formulaire…)</label><input type="url" name="linkUrl" defaultValue={banner.linkUrl ?? ""} placeholder="https://discord.gg/..." /></div>
      <div className="admin-field"><label>Texte du lien</label><input type="text" name="linkLabel" defaultValue={banner.linkLabel ?? ""} placeholder="Rejoindre le Discord" /></div>
    </div>

    {state.error && <p className="admin-form-error">{state.error}</p>}
    {state.success && <p className="auth-message">Bannière enregistrée.</p>}
    <button type="submit" className="claim-button" disabled={pending} style={{ alignSelf: "flex-start" }}>{pending ? "ENREGISTREMENT…" : "ENREGISTRER"}</button>
  </form>;
}
