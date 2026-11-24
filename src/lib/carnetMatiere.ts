/**
 * Carnet de matière vue → panneau des évaluations : paramètre d'URL `?matiere=` (sans aucune
 * dépendance : importé par le panneau ET par le carnet, il ne tire ni l'un ni l'autre).
 *
 * Format : `niveau~chapitre:section,section~chapitre:section` — ex.
 * `/evaluation?matiere=6e-6h~fonctions-logarithmes:definition,proprietes&depuis=2026-10-01&classe=6e%20A`.
 * Le panneau coche ces chapitres et met UN exercice (première variante disponible) sur chaque
 * générateur des sections listées ; `depuis` et `classe` ne servent qu'au message affiché.
 *
 * Générateurs choisis (annonce d'une évaluation, carnet) : facultatifs, après les sections et un « | »
 * — `5e-4h~suites:suites-geometriques,convergence|5gen15,5gen16`. Le panneau ne met alors un exercice
 * QUE sur ces générateurs (et « Composer selon la durée » ne pioche que dans eux). Sans « | » : lien
 * d'avant, comportement d'avant (tous les générateurs des sections).
 */

export interface MatiereVue {
  levelSlug: string
  /** `generateurs` : choisis par le professeur parmi ceux des sections (absent ou vide = tous). */
  chapitres: { slug: string; sections: string[]; generateurs?: string[] }[]
}

const SLUG = /^[a-z0-9-]{1,80}$/
const SECTION = /^[A-Za-z0-9_-]{1,80}$/
const GENERATEUR = /^[A-Za-z0-9_-]{1,40}$/

export function encoderMatiere(m: MatiereVue): string {
  const chapitre = (c: MatiereVue['chapitres'][number]) => {
    const gens = (c.generateurs ?? []).filter((g) => GENERATEUR.test(g))
    return `${c.slug}:${c.sections.join(',')}${gens.length > 0 ? `|${gens.join(',')}` : ''}`
  }
  return [m.levelSlug, ...m.chapitres.filter((c) => c.sections.length > 0).map(chapitre)].join('~')
}

/** Lecture tolérante : tout morceau mal formé est ignoré ; `null` s'il ne reste rien. */
export function decoderMatiere(brut: string | null | undefined): MatiereVue | null {
  if (!brut) return null
  const [niveau, ...morceaux] = brut.split('~')
  if (!niveau || !SLUG.test(niveau)) return null
  const chapitres: MatiereVue['chapitres'] = []
  for (const morceau of morceaux) {
    const [slug, reste] = morceau.split(':')
    if (!slug || !SLUG.test(slug) || !reste) continue
    const [liste, listeGens] = reste.split('|')
    const sections = [...new Set((liste ?? '').split(',').filter((s) => SECTION.test(s)))]
    if (sections.length === 0) continue
    const generateurs = [...new Set((listeGens ?? '').split(',').filter((g) => GENERATEUR.test(g)))]
    const deja = chapitres.find((c) => c.slug === slug)
    if (deja) {
      deja.sections.push(...sections.filter((s) => !deja.sections.includes(s)))
      if (generateurs.length > 0) deja.generateurs = [...new Set([...(deja.generateurs ?? []), ...generateurs])]
    } else chapitres.push(generateurs.length > 0 ? { slug, sections, generateurs } : { slug, sections })
  }
  return chapitres.length > 0 ? { levelSlug: niveau, chapitres } : null
}

/** Lien vers le panneau des évaluations, matière pré-sélectionnée. `classeId` (`cid`) : la classe du
 * carnet, pour l'avertissement « date limite du bulletin » (agenda, 0006). */
export function urlEvaluationMatiere(m: MatiereVue, depuis: string, classe: string, classeId?: string): string {
  const p = new URLSearchParams()
  p.set('matiere', encoderMatiere(m))
  if (depuis) p.set('depuis', depuis)
  if (classe) p.set('classe', classe)
  if (classeId) p.set('cid', classeId)
  return `/evaluation?${p.toString()}`
}

/** Page publique d'entraînement de l'élève sur ce chapitre (assistant « Me préparer à l'évaluation ») :
 * `?notions=` coche les sections annoncées, `&exos=` ne garde que ces générateurs dans les exercices
 * tirés (l'élève peut retirer ce filtre). Ids mal formés ignorés ; aucun paramètre si la liste est vide. */
export function urlEntrainementEleve(levelSlug: string, chapitreSlug: string, sections: string[], generateurs: string[] = []): string {
  const notions = sections.filter((s) => SECTION.test(s))
  const exos = generateurs.filter((g) => GENERATEUR.test(g))
  const p = [notions.length > 0 ? `notions=${notions.join(',')}` : '', exos.length > 0 ? `exos=${exos.join(',')}` : ''].filter(Boolean).join('&')
  return `/${levelSlug}/${chapitreSlug}/exercices${p ? `?${p}` : ''}`
}

/** Lecture tolérante d'une liste d'identifiants d'URL (`?notions=a,b`, `?exos=…`) : ids mal formés ignorés. */
export function lireListeUrl(brut: string | null | undefined, sorte: 'section' | 'generateur'): string[] {
  if (!brut) return []
  const motif = sorte === 'section' ? SECTION : GENERATEUR
  return [...new Set(brut.split(',').map((x) => x.trim()).filter((x) => motif.test(x)))]
}
