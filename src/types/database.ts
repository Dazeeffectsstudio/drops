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
        Relationships: [];
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
