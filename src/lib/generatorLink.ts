import { ENTRAINEMENT_REGISTRY } from '../entrainement/registry'

/**
 * Convention de lien vers un générateur — pendant la fusion progressive de plateforme-maths dans
 * ce dépôt, un générateur est SOIT déjà rapatrié ici (route interne, ex. `/entrainement/4e/gen1`,
 * voir `ENTRAINEMENT_REGISTRY`) SOIT encore hébergé sur plateforme-maths (URL externe,
 * comportement historique) — vérifié ici en premier, avant de retomber sur l'URL externe.
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
export function estGenerateurMigre(chantier: string, generatorId: string): boolean {
  return ENTRAINEMENT_REGISTRY[generatorId]?.chantier === chantier
}

export function generatorLink(chantier: string, generatorId: string): string {
  if (estGenerateurMigre(chantier, generatorId)) return `/entrainement/${chantier}/${generatorId}`
  const base = 'https://plateforme-maths.vercel.app'
  if (chantier === '4e') return `${base}/${generatorId}`
  return `${base}/${chantier}/${generatorId}`
}
