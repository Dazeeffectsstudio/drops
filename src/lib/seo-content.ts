// Texte SEO généré à partir des métadonnées de src/lib/catalog.ts — un seul
// gabarit par type de page (plateforme / catégorie), rempli avec le nom
// réel, pour éviter le contenu dupliqué mot pour mot d'une page à l'autre
// tout en restant simple à maintenir.

export function platformIntro(label: string, description: string): string {
  return `${description} DROPS surveille en continu ${label} pour repérer chaque offre gratuite dès qu'elle apparaît, et t'envoie une notification si tu le souhaites — plus besoin de vérifier toi-même chaque jour.`;
}

export function platformFaq(label: string): Array<{ question: string; answer: string }> {
  return [
    { question: `Comment récupérer une offre ${label} gratuite ?`, answer: `Clique sur "RÉCUPÉRER" sur l'offre qui t'intéresse : tu seras redirigé vers ${label} pour l'ajouter à ton compte avant la fin de l'offre.` },
    { question: `Les offres ${label} sont-elles vraiment gratuites ?`, answer: `Oui — DROPS ne référence que des offres à 0€, sans abonnement caché ni carte bancaire demandée sur notre site.` },
    { question: `Comment être prévenu·e des prochaines offres ${label} ?`, answer: `Crée un compte gratuit et active les notifications pour ${label} dans tes réglages — tu recevras un email dès qu'une nouvelle offre est disponible.` },
  ];
}

export function categoryIntro(label: string, description: string): string {
  return `${description} Cette page est mise à jour automatiquement à chaque nouvelle offre ${label.toLowerCase()} détectée sur les plateformes suivies par DROPS.`;
}

export const homeFaq: Array<{ question: string; answer: string }> = [
  { question: "DROPS est-il vraiment gratuit ?", answer: "Oui, entièrement. DROPS ne vend rien : c'est un annuaire qui repère les offres gratuites publiées par les plateformes officielles (Epic Games, Steam, etc.) et te redirige vers elles." },
  { question: "Comment DROPS trouve-t-il les offres ?", answer: "Une synchronisation automatique interroge régulièrement les sources officielles des plateformes suivies, valide chaque offre, puis la publie sur le site." },
  { question: "Dois-je créer un compte pour utiliser DROPS ?", answer: "Non — tu peux parcourir toutes les offres et les ajouter à tes favoris sans compte. Un compte gratuit permet en plus de synchroniser tes favoris entre appareils et de recevoir des notifications." },
  { question: "DROPS couvre-t-il d'autres pays que la Belgique ?", answer: "Le site cible d'abord la Belgique, mais la plupart des offres référencées sont valables dans toute l'Europe — vérifie toujours la disponibilité sur la plateforme d'origine." },
];

export function categoryFaq(label: string): Array<{ question: string; answer: string }> {
  return [
    { question: `Qu'est-ce qu'une offre "${label}" sur DROPS ?`, answer: `C'est une offre gratuite classée dans la catégorie "${label}" — récupérable sans payer, pour une durée limitée.` },
    { question: `À quelle fréquence les offres "${label}" sont-elles mises à jour ?`, answer: `DROPS synchronise régulièrement ses sources pour ajouter les nouvelles offres "${label}" dès qu'elles sont détectées.` },
  ];
}
