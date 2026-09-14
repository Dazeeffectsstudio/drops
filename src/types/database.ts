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
  status: "success" | "error";
  message: string | null;
  created_at: string;
};

export type SyncLogInsert = Omit<SyncLogRow, "id" | "created_at"> & { created_at?: string };

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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
