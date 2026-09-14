// Calcule une date future "stable" : ancrée à 18h et arrondie au jour
// près, pour que deux synchronisations lancées le même jour retombent
// exactement sur la même date d'expiration (donc aucune mise à jour
// inutile n'est détectée). La date avance seulement quand on change de
// jour calendaire — comme le ferait une vraie offre "encore N jours".
export function stableFutureDate(daysFromNow: number): string {
  const date = new Date();
  date.setHours(18, 0, 0, 0);
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString();
}
