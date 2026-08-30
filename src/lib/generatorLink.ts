/**
 * Convention de lien vers un générateur de plateforme-maths.
 *
 * Le routing réel n'est PAS uniforme entre chantiers (vérifié sur le déploiement, pas supposé) :
 * - 4e   : générateurs à la racine du site        → https://plateforme-maths.vercel.app/{id}
 * - 5e-4h / 6e-6h : générateurs dans un dossier   → https://plateforme-maths.vercel.app/{chantier}/{id}
 *
 * `chantier` vaut toujours la même valeur que `ChapterContent.levelSlug` dans les fichiers de
 * contenu (ex. '4e', '5e-4h') — c'est ICI, et seulement ici, que le cas '4e' est traité
 * différemment, pour que l'authoring des chapitres reste uniforme.
 */
export function generatorLink(chantier: string, generatorId: string): string {
  const base = 'https://plateforme-maths.vercel.app'
  if (chantier === '4e') return `${base}/${generatorId}`
  return `${base}/${chantier}/${generatorId}`
}
