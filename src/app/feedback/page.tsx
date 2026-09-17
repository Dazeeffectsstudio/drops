import type { Metadata } from "next";
import Link from "next/link";
import { FeedbackForm } from "@/components/feedback-form";

export const metadata: Metadata = { title: "Feedback", description: "Signale un bug, propose une plateforme ou une fonctionnalité pour DROPS." };

export default function FeedbackPage() {
  return <main className="subpage site-shell">
    <header className="subpage-header">
      <Link href="/" className="brand">DROPS<span className="brand-period">.</span></Link>
      <Link href="/" className="back-link">← Retour au site</Link>
    </header>
    <section className="subpage-intro">
      <h1>Aide-nous à <em>améliorer DROPS</em></h1>
      <p>Un bug, une plateforme manquante, une idée ? On lit tout.</p>
    </section>
    <div style={{ maxWidth: 560 }}>
      <FeedbackForm />
    </div>
  </main>;
}
