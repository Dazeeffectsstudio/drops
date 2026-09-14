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

export type Database = {
  public: {
    Tables: {
      offers: {
        Row: OfferRow;
        Insert: OfferInsert;
        Update: OfferUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
