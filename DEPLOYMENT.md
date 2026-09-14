# Déployer DROPS en production

Guide pas à pas pour mettre DROPS en ligne sur un vrai domaine. Écrit pour
quelqu'un de non-technique — chaque étape dit exactement où cliquer.

## 1. Déployer sur Vercel

Vercel est le service recommandé (créé par l'équipe de Next.js, plan gratuit
suffisant pour démarrer).

1. Crée un compte sur [vercel.com](https://vercel.com) (tu peux te connecter avec GitHub).
2. Mets le code de DROPS sur GitHub s'il n'y est pas déjà (`git push` vers un nouveau dépôt).
3. Sur Vercel, clique **Add New → Project**, choisis ton dépôt GitHub `drops`.
4. Vercel détecte automatiquement Next.js — ne change rien aux réglages de build.
5. Avant de cliquer "Deploy", ouvre la section **Environment Variables** et ajoute toutes les valeurs de ton `.env.local` actuel (voir la liste complète plus bas).
6. Clique **Deploy**. Après 1-2 minutes, ton site est en ligne sur une adresse `https://drops-xxxx.vercel.app`.

### Variables d'environnement à copier dans Vercel

Toutes celles déjà dans ton `.env.local` :
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAILS`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_CONTACT_EMAIL`, `SYNC_SECRET`.

Plus ces nouvelles (V10) :
- **`NEXT_PUBLIC_SITE_URL`** — ton vrai domaine, ex. `https://drops.be` (sans `/` à la fin). **La plus importante** : tant qu'elle est absente, le site reste invisible pour Google.
- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` — voir section 4.
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` ou `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` — optionnel, voir `.env.local.example`.
- `CRON_SECRET` — voir section 5. Peut avoir la même valeur que `SYNC_SECRET`.

## 2. Connecter ton nom de domaine

1. Si tu n'as pas encore de nom de domaine, achète-le chez un registrar (Combell, OVH, Namecheap, Google Domains...).
2. Dans ton projet Vercel, va dans **Settings → Domains**, tape ton domaine (ex. `drops.be`) et clique **Add**.
3. Vercel affiche les enregistrements DNS à créer. En général :
   - Un enregistrement **A** pointant `@` vers `76.76.21.21`, OU
   - Un enregistrement **CNAME** pointant `www` vers `cname.vercel-dns.com`.
   (Vercel indique les valeurs exactes pour ton cas — copie-les telles quelles.)
4. Va chez ton registrar, dans la gestion DNS de ton domaine, et ajoute ces enregistrements.
5. Reviens sur Vercel — la vérification se fait automatiquement (parfois jusqu'à 24-48h selon le registrar, souvent quelques minutes).
6. **HTTPS s'active tout seul** dès que le domaine est vérifié — rien à faire de plus.
7. Sous-domaines (optionnel) : si tu veux `www.drops.be` en plus de `drops.be`, ajoute-le de la même façon dans Settings → Domains — Vercel te proposera de rediriger automatiquement l'un vers l'autre.
8. Une fois le domaine actif, mets à jour `NEXT_PUBLIC_SITE_URL` dans Vercel (Settings → Environment Variables) avec `https://drops.be`, puis redéploie (Deployments → ⋯ → Redeploy).

## 3. Vérifier que tout fonctionne

Une fois en ligne, va sur `https://tondomaine.be/admin/launch-checklist` (connecté avec un compte listé dans `ADMIN_EMAILS`) — cette page indique automatiquement ce qui est prêt et ce qu'il reste à faire.

## 4. Google Search Console

Search Console indique à Google que ton site existe et permet de suivre son indexation.

1. Va sur [search.google.com/search-console](https://search.google.com/search-console).
2. Choisis **Préfixe d'URL**, entre `https://tondomaine.be`.
3. Google propose plusieurs méthodes de vérification — choisis **Balise HTML** (la plus simple ici).
4. Google te donne un code du type `content="abc123..."`. Copie uniquement cette valeur (`abc123...`).
5. Dans Vercel, ajoute la variable d'environnement `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` avec cette valeur, puis redéploie.
6. Reviens sur Search Console et clique **Vérifier**.
7. Une fois vérifié, va dans **Sitemaps** (menu de gauche) et soumets `https://tondomaine.be/sitemap.xml`.

## 5. Cron automatique (synchronisation des offres)

`vercel.json` déclare deux tâches planifiées, réglées sur **une fois par jour** (`/api/sync` à 6h00, `/api/notifications/check-expiring` à 6h10) — c'est la limite du plan Vercel gratuit (Hobby), qui refuse tout cron plus fréquent qu'une fois par jour.

Si un jour tu veux revenir à une synchronisation plus fréquente (toutes les 6h / toutes les 30min comme au départ), deux options :
- **Passer au plan Vercel Pro** (payant), puis remettre `"schedule": "0 */6 * * *"` et `"*/30 * * * *"`.
- **Alternative gratuite** : utiliser GitHub Actions à la place (voir le commentaire dans `src/app/api/sync/route.ts` pour l'exemple de workflow).

Pour que Vercel Cron s'authentifie automatiquement auprès de tes routes, ajoute une variable d'environnement nommée exactement `CRON_SECRET` (Vercel l'envoie tout seul dans l'en-tête `Authorization` de chaque appel cron) — donne-lui la même valeur que `SYNC_SECRET`, ou laisse les deux vides si tu préfères garder les routes ouvertes.

Pour changer la fréquence : modifie les valeurs `"schedule"` dans `vercel.json` ([syntaxe cron ici](https://crontab.guru)), commit, et redéploie.

## 6. Checklist finale

Consulte `/admin/launch-checklist` une fois en ligne — chaque ligne se met à jour automatiquement selon ce qui est réellement configuré.
