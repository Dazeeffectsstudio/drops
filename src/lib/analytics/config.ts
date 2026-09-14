// Aucune donnée n'est envoyée à quoi que ce soit tant qu'aucune de ces
// variables n'est configurée — voir .env.local.example.
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || null;
export const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || null;

export const isAnalyticsConfigured = Boolean(GA_MEASUREMENT_ID || PLAUSIBLE_DOMAIN);
