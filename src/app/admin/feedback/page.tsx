import type { Metadata } from "next";
import { FeedbackStatusSelect } from "@/components/admin/feedback-status-select";
import { getAllFeedback } from "@/lib/feedback-repository";

export const metadata: Metadata = { title: "Feedback" };
export const dynamic = "force-dynamic";

const typeLabels: Record<string, string> = { bug: "Bug", platform: "Plateforme", feature: "Fonctionnalité" };

export default async function AdminFeedbackPage() {
  const entries = await getAllFeedback();
  const newCount = entries.filter((e) => e.status === "new").length;

  return <div className="admin-page">
    <div className="admin-page-heading">
      <div><span className="section-index">RETOURS</span><h1>Feedback <em>utilisateurs</em></h1></div>
      {newCount > 0 && <span className="admin-status admin-status--orange">{newCount} nouveau{newCount > 1 ? "x" : ""}</span>}
    </div>

    {entries.length === 0 ? <div className="empty-state"><span>∅</span><h3>Aucun retour pour l&apos;instant.</h3><p>Les messages envoyés depuis /feedback apparaîtront ici.</p></div> : <div className="admin-table-wrap">
      <table className="admin-table">
        <thead><tr><th>Date</th><th>Type</th><th>Message</th><th>Utilisateur</th><th>Statut</th></tr></thead>
        <tbody>
          {entries.map((entry) => <tr key={entry.id}>
            <td>{new Intl.DateTimeFormat("fr-BE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(entry.createdAt))}</td>
            <td>{typeLabels[entry.type] ?? entry.type}</td>
            <td className="admin-table-message" style={{ maxWidth: 340 }}>{entry.message}</td>
            <td>{entry.userEmail ?? "Anonyme"}</td>
            <td><FeedbackStatusSelect id={entry.id} status={entry.status} /></td>
          </tr>)}
        </tbody>
      </table>
    </div>}
  </div>;
}
