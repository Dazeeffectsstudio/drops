"use client";

import { useEffect, useState } from "react";
import { deletePushSubscriptionAction, savePushSubscriptionAction } from "@/app/push-actions";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

type State = "unsupported" | "loading" | "off" | "on" | "denied";

export function PushNotificationToggle({ vapidPublicKey }: { vapidPublicKey: string | null }) {
  const [state, setState] = useState<State>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) { setState("unsupported"); return; }
    if (Notification.permission === "denied") { setState("denied"); return; }

    navigator.serviceWorker.getRegistration().then(async (registration) => {
      const subscription = await registration?.pushManager.getSubscription();
      setState(subscription ? "on" : "off");
    }).catch(() => setState("off"));
  }, []);

  async function enable() {
    if (!vapidPublicKey) { setError("Les notifications push ne sont pas encore configurées sur ce site."); return; }
    setError(null);
    setState("loading");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") { setState(permission === "denied" ? "denied" : "off"); return; }

      const registration = await navigator.serviceWorker.register("/sw.js");
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
      });
      const json = subscription.toJSON();
      const result = await savePushSubscriptionAction({
        endpoint: json.endpoint as string,
        p256dh: json.keys?.p256dh as string,
        auth: json.keys?.auth as string,
      });
      if (result.error) { setError(result.error); setState("off"); return; }
      setState("on");
    } catch {
      setError("Impossible d'activer les notifications push sur cet appareil.");
      setState("off");
    }
  }

  async function disable() {
    setError(null);
    setState("loading");
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        await deletePushSubscriptionAction(subscription.endpoint);
        await subscription.unsubscribe();
      }
      setState("off");
    } catch {
      setError("Impossible de désactiver les notifications push.");
      setState("off");
    }
  }

  if (state === "unsupported") return <p className="empty-note">Les notifications push ne sont pas prises en charge par ce navigateur.</p>;
  if (state === "denied") return <p className="empty-note">Les notifications sont bloquées dans les réglages de ton navigateur pour ce site.</p>;

  return <div className="push-toggle">
    <p className="empty-note">{state === "on" ? "Les notifications push sont activées sur cet appareil." : "Reçois une notification directement sur cet appareil, même quand DROPS n'est pas ouvert."}</p>
    {error && <p className="auth-error">{error}</p>}
    <button type="button" className="admin-test-button" disabled={state === "loading"} onClick={state === "on" ? disable : enable}>
      {state === "loading" ? "…" : state === "on" ? "DÉSACTIVER LES NOTIFICATIONS PUSH" : "AUTORISER LES NOTIFICATIONS PUSH"}
    </button>
  </div>;
}
