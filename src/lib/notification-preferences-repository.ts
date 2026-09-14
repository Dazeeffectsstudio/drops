import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { supabaseAdmin } from "@/lib/supabase/admin-client";

export type NotificationPreferences = {
  newOffers: boolean;
  epicGames: boolean;
  steam: boolean;
  expiringSoon: boolean;
  twitchDrops: boolean;
  primeGaming: boolean;
};

// Tout activé par défaut tant que l'utilisateur n'a pas explicitement
// modifié ses préférences — cohérent avec l'absence de ligne en base pour
// un compte qui vient d'être créé.
export const defaultNotificationPreferences: NotificationPreferences = {
  newOffers: true,
  epicGames: true,
  steam: true,
  expiringSoon: true,
  twitchDrops: true,
  primeGaming: true,
};

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return defaultNotificationPreferences;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return defaultNotificationPreferences;

  const { data } = await supabase.from("notification_preferences").select("*").eq("user_id", user.id).maybeSingle();
  if (!data) return defaultNotificationPreferences;
  return {
    newOffers: data.notify_new_offers,
    epicGames: data.notify_epic_games,
    steam: data.notify_steam,
    expiringSoon: data.notify_expiring_soon,
    twitchDrops: data.notify_twitch_drops,
    primeGaming: data.notify_prime_gaming,
  };
}

export async function saveNotificationPreferences(preferences: NotificationPreferences): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Supabase n'est pas configuré." };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Connecte-toi pour sauvegarder tes préférences." };

  const { error } = await supabase.from("notification_preferences").upsert({
    user_id: user.id,
    notify_new_offers: preferences.newOffers,
    notify_epic_games: preferences.epicGames,
    notify_steam: preferences.steam,
    notify_expiring_soon: preferences.expiringSoon,
    notify_twitch_drops: preferences.twitchDrops,
    notify_prime_gaming: preferences.primeGaming,
    updated_at: new Date().toISOString(),
  });
  return { error: error?.message };
}

export type RecipientPreferences = { userId: string; email: string } & NotificationPreferences;

// Réservé au service de notifications (src/lib/notification-dispatch.ts) :
// combine la liste des comptes (client service_role) avec leurs préférences
// — un compte sans ligne en `notification_preferences` reçoit les valeurs
// par défaut (tout activé), exactement comme dans l'interface /account/notifications.
// Les comptes dont l'email n'est pas encore confirmé (voir Supabase Auth,
// section 1 de la mission V7) sont exclus : on n'envoie pas de contenu
// marketing à une adresse pas encore vérifiée par son propriétaire.
export async function getAllRecipientPreferences(): Promise<RecipientPreferences[]> {
  if (!supabaseAdmin) return [];
  const [{ data: users }, { data: prefs }] = await Promise.all([
    supabaseAdmin.auth.admin.listUsers({ perPage: 1000 }),
    supabaseAdmin.from("notification_preferences").select("*"),
  ]);
  const prefsByUser = new Map((prefs ?? []).map((row) => [row.user_id, row]));

  return (users?.users ?? [])
    .flatMap((entry) => (entry.email && entry.email_confirmed_at ? [{ ...entry, email: entry.email }] : []))
    .map((entry) => {
      const row = prefsByUser.get(entry.id);
      return {
        userId: entry.id,
        email: entry.email,
        newOffers: row?.notify_new_offers ?? defaultNotificationPreferences.newOffers,
        epicGames: row?.notify_epic_games ?? defaultNotificationPreferences.epicGames,
        steam: row?.notify_steam ?? defaultNotificationPreferences.steam,
        expiringSoon: row?.notify_expiring_soon ?? defaultNotificationPreferences.expiringSoon,
        twitchDrops: row?.notify_twitch_drops ?? defaultNotificationPreferences.twitchDrops,
        primeGaming: row?.notify_prime_gaming ?? defaultNotificationPreferences.primeGaming,
      };
    });
}
