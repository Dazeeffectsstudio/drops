export type OfferRow = {
  id: string;
  title: string;
  description: string;
  platform: string;
  store: string;
  category: string;
  image: string;
  original_price: number | null;
  current_price: number;
  starts_at: string | null;
  expires_at: string;
  url: string;
  accent: string;
  featured: boolean;
  trending: boolean;
  is_new: boolean;
  created_at: string;
  updated_at: string;
};

export type OfferInsert = Omit<OfferRow, "created_at" | "updated_at">;
export type OfferUpdate = Partial<OfferInsert>;

export type SyncLogRow = {
  id: string;
  provider: string;
  offers_found: number;
  offers_created: number;
  offers_updated: number;
  offers_expired: number;
  offers_skipped: number;
  status: "success" | "error";
  message: string | null;
  duration_ms: number | null;
  created_at: string;
};

export type SyncLogInsert = Omit<SyncLogRow, "id" | "created_at"> & { created_at?: string };

export type PriceHistoryRow = {
  id: string;
  offer_id: string;
  original_price: number | null;
  current_price: number;
  captured_at: string;
};

export type PriceHistoryInsert = Omit<PriceHistoryRow, "id" | "captured_at">;

export type FavoriteRow = { user_id: string; offer_id: string; created_at: string };
export type FavoriteInsert = Omit<FavoriteRow, "created_at"> & { created_at?: string };

export type UserPreferencesRow = { user_id: string; platforms: string[]; categories: string[]; country: string; updated_at: string };
export type UserPreferencesInsert = Omit<UserPreferencesRow, "updated_at"> & { updated_at?: string };
export type UserPreferencesUpdate = Partial<UserPreferencesInsert>;

export type NotificationSubscriptionRow = {
  id: string;
  user_id: string;
  offer_id: string;
  created_at: string;
  notified_at: string | null;
  read_at: string | null;
};
export type NotificationSubscriptionInsert = Omit<NotificationSubscriptionRow, "id" | "created_at" | "notified_at" | "read_at"> & {
  created_at?: string;
  notified_at?: string | null;
  read_at?: string | null;
};
export type NotificationSubscriptionUpdate = Partial<NotificationSubscriptionInsert>;

export type PushSubscriptionRow = { id: string; user_id: string; endpoint: string; p256dh: string; auth: string; created_at: string };
export type PushSubscriptionInsert = Omit<PushSubscriptionRow, "id" | "created_at">;

export type NotificationLogRow = {
  id: string;
  user_id: string;
  offer_id: string | null;
  type: string;
  provider: string;
  status: string;
  sent_at: string;
  read_at: string | null;
  error_message: string | null;
};
export type NotificationLogInsert = Omit<NotificationLogRow, "id" | "sent_at" | "read_at"> & { sent_at?: string; read_at?: string | null };
export type NotificationLogUpdate = Partial<NotificationLogInsert>;

export type NotificationPreferencesRow = {
  user_id: string;
  notify_new_offers: boolean;
  notify_epic_games: boolean;
  notify_steam: boolean;
  notify_expiring_soon: boolean;
  notify_twitch_drops: boolean;
  notify_prime_gaming: boolean;
  updated_at: string;
};
export type NotificationPreferencesInsert = Omit<NotificationPreferencesRow, "updated_at"> & { updated_at?: string };
export type NotificationPreferencesUpdate = Partial<NotificationPreferencesInsert>;

export type UserBadgeRow = { id: string; user_id: string; badge_key: string; earned_at: string };
export type UserBadgeInsert = Omit<UserBadgeRow, "id" | "earned_at"> & { earned_at?: string };

export type UserStreakRow = { user_id: string; current_streak: number; longest_streak: number; last_visit_date: string | null; updated_at: string };
export type UserStreakInsert = Omit<UserStreakRow, "updated_at"> & { updated_at?: string };
export type UserStreakUpdate = Partial<UserStreakInsert>;

export type ReferralRow = { id: string; referrer_id: string; referred_id: string | null; created_at: string; signed_up_at: string | null; confirmed_at: string | null };
export type ReferralInsert = Omit<ReferralRow, "id" | "created_at" | "confirmed_at"> & { created_at?: string; confirmed_at?: string | null };
export type ReferralUpdate = Partial<ReferralInsert>;

export type ReferralRewardRow = { id: string; referrer_id: string; reward_key: string; unlocked_at: string };
export type ReferralRewardInsert = Omit<ReferralRewardRow, "id" | "unlocked_at"> & { unlocked_at?: string };

export type FeedbackRow = { id: string; type: string; message: string; user_id: string | null; created_at: string; status: string };
export type FeedbackInsert = Omit<FeedbackRow, "id" | "created_at" | "status"> & { created_at?: string; status?: string };
export type FeedbackUpdate = Partial<FeedbackInsert>;

export type BetaBannerRow = { id: string; enabled: boolean; message: string; link_url: string | null; link_label: string | null; updated_at: string };
export type BetaBannerUpdate = Partial<Omit<BetaBannerRow, "id">>;

export type Database = {
  public: {
    Tables: {
      offers: {
        Row: OfferRow;
        Insert: OfferInsert;
        Update: OfferUpdate;
        Relationships: [];
      };
      sync_logs: {
        Row: SyncLogRow;
        Insert: SyncLogInsert;
        Update: Partial<SyncLogInsert>;
        Relationships: [];
      };
      offer_price_history: {
        Row: PriceHistoryRow;
        Insert: PriceHistoryInsert;
        Update: Partial<PriceHistoryInsert>;
        Relationships: [];
      };
      favorites: {
        Row: FavoriteRow;
        Insert: FavoriteInsert;
        Update: Partial<FavoriteInsert>;
        Relationships: [
          {
            foreignKeyName: "favorites_offer_id_fkey";
            columns: ["offer_id"];
            isOneToOne: false;
            referencedRelation: "offers";
            referencedColumns: ["id"];
          },
        ];
      };
      user_preferences: {
        Row: UserPreferencesRow;
        Insert: UserPreferencesInsert;
        Update: UserPreferencesUpdate;
        Relationships: [];
      };
      notification_subscriptions: {
        Row: NotificationSubscriptionRow;
        Insert: NotificationSubscriptionInsert;
        Update: NotificationSubscriptionUpdate;
        Relationships: [
          {
            foreignKeyName: "notification_subscriptions_offer_id_fkey";
            columns: ["offer_id"];
            isOneToOne: false;
            referencedRelation: "offers";
            referencedColumns: ["id"];
          },
        ];
      };
      push_subscriptions: {
        Row: PushSubscriptionRow;
        Insert: PushSubscriptionInsert;
        Update: Partial<PushSubscriptionInsert>;
        Relationships: [];
      };
      notification_logs: {
        Row: NotificationLogRow;
        Insert: NotificationLogInsert;
        Update: NotificationLogUpdate;
        Relationships: [
          {
            foreignKeyName: "notification_logs_offer_id_fkey";
            columns: ["offer_id"];
            isOneToOne: false;
            referencedRelation: "offers";
            referencedColumns: ["id"];
          },
        ];
      };
      notification_preferences: {
        Row: NotificationPreferencesRow;
        Insert: NotificationPreferencesInsert;
        Update: NotificationPreferencesUpdate;
        Relationships: [];
      };
      user_badges: {
        Row: UserBadgeRow;
        Insert: UserBadgeInsert;
        Update: Partial<UserBadgeInsert>;
        Relationships: [];
      };
      user_streaks: {
        Row: UserStreakRow;
        Insert: UserStreakInsert;
        Update: UserStreakUpdate;
        Relationships: [];
      };
      referrals: {
        Row: ReferralRow;
        Insert: ReferralInsert;
        Update: ReferralUpdate;
        Relationships: [];
      };
      referral_rewards: {
        Row: ReferralRewardRow;
        Insert: ReferralRewardInsert;
        Update: Partial<ReferralRewardInsert>;
        Relationships: [];
      };
      feedback: {
        Row: FeedbackRow;
        Insert: FeedbackInsert;
        Update: FeedbackUpdate;
        Relationships: [];
      };
      beta_banner: {
        Row: BetaBannerRow;
        Insert: BetaBannerRow;
        Update: BetaBannerUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
