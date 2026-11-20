/**
 * Carnet de matière vue → panneau des évaluations : paramètre d'URL `?matiere=` (sans aucune
 * dépendance : importé par le panneau ET par le carnet, il ne tire ni l'un ni l'autre).
 *
 * Format : `niveau~chapitre:section,section~chapitre:section` — ex.
 * `/evaluation?matiere=6e-6h~fonctions-logarithmes:definition,proprietes&depuis=2026-10-01&classe=6e%20A`.
 * Le panneau coche ces chapitres et met UN exercice (première variante disponible) sur chaque
 * générateur des sections listées ; `depuis` et `classe` ne servent qu'au message affiché.
 */

export interface MatiereVue {
  levelSlug: string
  chapitres: { slug: string; sections: string[] }[]
}

const SLUG = /^[a-z0-9-]{1,80}$/
const SECTION = /^[A-Za-z0-9_-]{1,80}$/

export function encoderMatiere(m: MatiereVue): string {
  return [m.levelSlug, ...m.chapitres.filter((c) => c.sections.length > 0).map((c) => `${c.slug}:${c.sections.join(',')}`)].join('~')
}

/** Lecture tolérante : tout morceau mal formé est ignoré ; `null` s'il ne reste rien. */
export function decoderMatiere(brut: string | null | undefined): MatiereVue | null {
  if (!brut) return null
  const [niveau, ...morceaux] = brut.split('~')
  if (!niveau || !SLUG.test(niveau)) return null
  const chapitres: MatiereVue['chapitres'] = []
  for (const morceau of morceaux) {
    const [slug, liste] = morceau.split(':')
    if (!slug || !SLUG.test(slug) || !liste) continue
    const sections = [...new Set(liste.split(',').filter((s) => SECTION.test(s)))]
    if (sections.length === 0) continue
    const deja = chapitres.find((c) => c.slug === slug)
    if (deja) deja.sections.push(...sections.filter((s) => !deja.sections.includes(s)))
    else chapitres.push({ slug, sections })
  }
  return chapitres.length > 0 ? { levelSlug: niveau, chapitres } : null
}

/** Lien vers le panneau des évaluations, matière pré-sélectionnée. */
export function urlEvaluationMatiere(m: MatiereVue, depuis: string, classe: string): string {
  const p = new URLSearchParams()
  p.set('matiere', encoderMatiere(m))
  if (depuis) p.set('depuis', depuis)
  if (classe) p.set('classe', classe)
  return `/evaluation?${p.toString()}`
}
