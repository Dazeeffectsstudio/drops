# DROPS

Première version locale de **DROPS — DON'T PAY. JUST PLAY.** Les offres sont fictives et aucun compte ou service externe n'est nécessaire.

## Lancer le site

Sur Windows, double-cliquez sur `lancer-drops.cmd`, puis ouvrez [http://localhost:3000](http://localhost:3000). Gardez la fenêtre noire ouverte pendant l'utilisation ; fermez-la pour arrêter le site.

Si vous préférez un terminal, lancez `node node_modules/next/dist/bin/next dev` depuis ce dossier. Les dépendances sont déjà installées.

## Structure

- `src/app` : page, mise en page, styles et métadonnées.
- `src/components` : interface, cartes et icônes.
- `src/data/offers.ts` : offres fictives facilement remplaçables plus tard.
- `src/types/offer.ts` : structure d'une offre.
- `src/lib/offers.ts` : prix, compte à rebours et statistique.
- `public/images` : illustrations originales de démonstration.

Les favoris restent enregistrés dans ce navigateur. Les expirations de démonstration partent de la première ouverture de l'onglet et se réinitialisent dans une nouvelle session de navigateur.

Les boutons « RÉCUPÉRER » affichent un message explicatif : aucune offre réelle ni destination externe n'est reliée à cette version.
