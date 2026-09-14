import { getNotificationSubscriptionStats } from "@/lib/notification-subscriptions-repository";
import { supabaseAdmin } from "@/lib/supabase/admin-client";

// Toujours rendue à la demande : contrairement à /admin (offres), cette
// page n'a pas de mutation qui appelle revalidatePath — sans ça, elle
// resterait figée aux données du dernier build (nouveaux comptes invisibles).
export const dynamic = "force-dynamic";

type AdminUserRow = { id: string; email: string | null; createdAt: string; lastSignInAt: string | null };

async function getUsersStats(): Promise<{ total: number; newLast7Days: number; activeLast30Days: number; users: AdminUserRow[] }> {
  if (!supabaseAdmin) return { total: 0, newLast7Days: 0, activeLast30Days: 0, users: [] };
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
  if (error || !data) return { total: 0, newLast7Days: 0, activeLast30Days: 0, users: [] };

  const now = Date.now();
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
  const users: AdminUserRow[] = data.users
    .map((u) => ({ id: u.id, email: u.email ?? null, createdAt: u.created_at, lastSignInAt: u.last_sign_in_at ?? null }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return {
    total: users.length,
    newLast7Days: users.filter((u) => now - new Date(u.createdAt).getTime() < SEVEN_DAYS).length,
    activeLast30Days: users.filter((u) => u.lastSignInAt && now - new Date(u.lastSignInAt).getTime() < THIRTY_DAYS).length,
    users,
  };
}

export default async function AdminUsersPage() {
  const [{ total, newLast7Days, activeLast30Days, users }, notifStats] = await Promise.all([getUsersStats(), getNotificationSubscriptionStats()]);

  return <div className="admin-page">
    <div className="admin-page-heading">
      <div><span className="section-index">TABLEAU DE BORD</span><h1>Les <em>utilisateurs</em></h1></div>
    </div>
    {!supabaseAdmin && <p className="admin-notice">
      Supabase n&apos;est pas configuré côté serveur (SUPABASE_SERVICE_ROLE_KEY manquante) — impossible de lire les comptes.
    </p>}

    <div className="provider-cards-grid">
      <div className="provider-card"><span className="micro-label">COMPTES</span><strong className="admin-stat-value">{total}</strong></div>
      <div className="provider-card"><span className="micro-label">NOUVEAUX (7 JOURS)</span><strong className="admin-stat-value">{newLast7Days}</strong></div>
      <div className="provider-card"><span className="micro-label">ACTIFS (30 JOURS)</span><strong className="admin-stat-value">{activeLast30Days}</strong></div>
      <div className="provider-card"><span className="micro-label">ABONNEMENTS AUX NOTIFICATIONS</span><strong className="admin-stat-value">{notifStats.totalSubscriptions}</strong></div>
    </div>

    {notifStats.mostFollowedPlatforms.length > 0 && <div className="admin-subheading">
      <h2>Plateformes les plus suivies</h2>
      <ul className="notification-list">
        {notifStats.mostFollowedPlatforms.map((entry) => <li key={entry.store} className="notification-row"><span>{entry.store}</span><span className="notification-row-meta">{entry.count}</span></li>)}
      </ul>
    </div>}

    <div className="admin-subheading"><h2>Derniers comptes</h2></div>
    {users.length === 0 ? <div className="empty-state"><span>∅</span><h3>Aucun compte pour l&apos;instant.</h3><p>Les inscriptions apparaîtront ici.</p></div> : <div className="admin-table-wrap">
      <table className="admin-table">
        <thead><tr><th>Email</th><th>Créé le</th><th>Dernière connexion</th></tr></thead>
        <tbody>
          {users.slice(0, 50).map((u) => <tr key={u.id}>
            <td>{u.email ?? "—"}</td>
            <td>{new Intl.DateTimeFormat("fr-BE", { day: "numeric", month: "short", year: "numeric" }).format(new Date(u.createdAt))}</td>
            <td>{u.lastSignInAt ? new Intl.DateTimeFormat("fr-BE", { day: "numeric", month: "short", year: "numeric" }).format(new Date(u.lastSignInAt)) : "Jamais"}</td>
          </tr>)}
        </tbody>
      </table>
    </div>}
  </div>;
}
