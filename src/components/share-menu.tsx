"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics/track";

type Props = { url: string; title: string; text?: string };

export function ShareMenu({ url, title, text }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareText = text ?? title;
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(shareText);

  const links = [
    { label: "WhatsApp", href: `https://wa.me/?text=${encodedText}%20${encodedUrl}` },
    { label: "X", href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { label: "Telegram", href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}` },
  ];

  function track(channel: string) {
    trackEvent("share", { channel, url });
  }

  async function copyForDiscord() {
    try {
      await navigator.clipboard.writeText(`${shareText} — ${url}`);
      setCopied(true);
      track("discord_copy");
      window.setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard indisponible : rien à faire de plus */ }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      track("copy_link");
      window.setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard indisponible : rien à faire de plus */ }
  }

  return <div className="share-menu">
    <button type="button" className="admin-test-button" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
      ↗ PARTAGER
    </button>
    {open && <div className="share-menu-dropdown" role="menu">
      {links.map((link) => <a key={link.label} href={link.href} target="_blank" rel="noreferrer" onClick={() => track(link.label.toLowerCase())} role="menuitem">{link.label}</a>)}
      <button type="button" onClick={copyForDiscord} role="menuitem">Copier pour Discord</button>
      <button type="button" onClick={copyLink} role="menuitem">{copied ? "Copié ✓" : "Copier le lien"}</button>
    </div>}
  </div>;
}
