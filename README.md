# DROPS

**DROPS — DON'T PAY. JUST PLAY.** Les offres sont désormais stockées dans une vraie base de données (Supabase), gérable depuis un tableau de bord d'administration.

## Lancer le site

Sur Windows, double-cliquez sur `lancer-drops.cmd`, puis ouvrez [http://localhost:3000](http://localhost:3000). Gardez la fenêtre noire ouverte pendant l'utilisation ; fermez-la pour arrêter le site.

Si vous préférez un terminal, lancez `node node_modules/next/dist/bin/next dev` depuis ce dossier. Les dépendances sont déjà installées.

## Connecter Supabase (obligatoire pour voir des offres)

Sans configuration, le site s'affiche normalement mais **sans aucune offre** (page d'accueil vide, tableau de bord vide) — c'est volontaire, pas un bug.

1. Crée un compte et un projet sur [supabase.com](https://supabase.com) (gratuit).
2. Dans le projet Supabase, ouvre **SQL Editor** et exécute le contenu de `supabase/migrations/0001_create_offers.sql`, puis celui de `supabase/seed.sql` (ce dernier remet les offres de démonstration d'origine).
3. Dans **Project Settings > API**, récupère : l'URL du projet, la clé `anon public`, et la clé `service_role` (secrète).
4. Copie `.env.local.example` en `.env.local` et colle ces trois valeurs.
5. Relance le site (ferme puis rouvre `lancer-drops.cmd`).

## Tableau de bord d'administration

Accessible sur `/admin` (ex. [http://localhost:3000/admin](http://localhost:3000/admin)). Permet de voir, ajouter, modifier et supprimer des offres. **Non protégé par mot de passe pour l'instant** — voir `src/lib/admin-auth.ts` pour la marche à suivre quand une authentification sera nécessaire.

## Structure

- `src/app` : pages, mise en page, styles et métadonnées (dont `src/app/admin` pour le tableau de bord).
- `src/components` : interface, cartes et icônes.
- `src/lib/offers-repository.ts` : toutes les lectures/écritures d'offres passent par ce fichier (source unique, lit/écrit dans Supabase).
- `src/lib/supabase/` : connexion à Supabase (lecture publique et écriture admin, séparées).
- `supabase/` : schéma SQL (`migrations/`) et données de démonstration (`seed.sql`).
- `src/types/offer.ts` : structure d'une offre côté application ; `src/types/database.ts` : structure côté base de données.
- `src/lib/offers.ts` : prix, compte à rebours et statistique.
- `public/images` : illustrations originales de démonstration.

Les favoris restent enregistrés dans ce navigateur.

Les boutons « RÉCUPÉRER » affichent un message explicatif : aucune offre réelle ni destination externe n'est reliée à cette version.
