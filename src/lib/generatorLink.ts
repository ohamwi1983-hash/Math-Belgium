/**
 * Convention de lien vers un générateur — pendant la fusion progressive de plateforme-maths dans
 * ce dépôt (voir conversation du 2026-10-04), un générateur est SOIT déjà rapatrié ici (route
 * interne, ex. `/entrainement/4e/gen1`) SOIT encore hébergé sur plateforme-maths (URL externe,
 * comportement historique). `GENERATEURS_MIGRES` est la liste fermée des générateurs déjà
 * rapatriés — vérifiée ici en premier, avant de retomber sur l'URL externe.
 *
 * Le routing externe n'est PAS uniforme entre chantiers (vérifié sur le déploiement, pas
 * supposé) :
 * - 4e   : générateurs à la racine du site        → https://plateforme-maths.vercel.app/{id}
 * - 5e-4h / 6e-6h : générateurs dans un dossier   → https://plateforme-maths.vercel.app/{chantier}/{id}
 *
 * `chantier` vaut toujours la même valeur que `ChapterContent.levelSlug` dans les fichiers de
 * contenu (ex. '4e', '5e-4h') — c'est ICI, et seulement ici, que le cas '4e' est traité
 * différemment, pour que l'authoring des chapitres reste uniforme.
 */
const GENERATEURS_MIGRES: Record<string, Record<string, string>> = {
  '4e': { gen1: '/entrainement/4e/gen1' },
}

/** `true` si le lien renvoyé par `generatorLink` est une route interne (React Router, même onglet)
 * plutôt qu'une URL externe vers plateforme-maths (nouvel onglet) — voir son usage dans
 * `CarteEntrainement.tsx`. */
export function estGenerateurMigre(chantier: string, generatorId: string): boolean {
  return Boolean(GENERATEURS_MIGRES[chantier]?.[generatorId])
}

export function generatorLink(chantier: string, generatorId: string): string {
  const migre = GENERATEURS_MIGRES[chantier]?.[generatorId]
  if (migre) return migre
  const base = 'https://plateforme-maths.vercel.app'
  if (chantier === '4e') return `${base}/${generatorId}`
  return `${base}/${chantier}/${generatorId}`
}
