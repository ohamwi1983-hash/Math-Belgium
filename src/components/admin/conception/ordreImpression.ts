import { partiesExamen, type ChapitreExamen, type OrganisationExamen } from '../../../entrainement/export/examen'
import { questionsDeSerie, type ElementPlan } from '../../../lib/evaluationLocal'
import { varianteDeCle, type LigneSelection, type Processus } from '../../../lib/evaluationPayload'

/**
 * Liste « Ma feuille / Mon évaluation » DANS L'ORDRE D'IMPRESSION, avant tout tirage : les lignes
 * choisies deviennent des éléments de plan factices (une instance par exercice, graine fixe propre au
 * générateur), numérotés par la règle des documents — `questionsDeSerie` (vrai/faux en UNE question,
 * exercices d'une même ligne et de même consigne regroupés a), b), c)), puis rangement stable par
 * processus (`grouperParProcessus` des documents) ou parties de l'examen (`partiesExamen`). La
 * consigne d'un regroupement dépend de la variante, pas des nombres : la graine fixe suffit (un
 * générateur dont la consigne dépend des nombres peut, à l'impression, former un groupe de plus).
 */

export interface LigneActive {
  ligne: LigneSelection
  /** Indice de la ligne dans la sélection du panneau (identité, pour retirer). */
  index: number
  /** Exercice : variantes comptées (exclues retirées), avec leurs points effectifs. */
  variantes?: { cle: string; nombre: number; points: number }[]
  /** Autres types : nombre de questions et points par question. */
  nombre: number
  points: number
}

export interface EntreeImpression {
  cle: string
  premier: number
  dernier: number
  processus: Processus
  nature: 'exercice' | 'ouverte' | 'vraiFaux'
  /** Lignes du panneau concernées et, pour un exercice, les variantes (clés de `parVariante`). */
  retraits: { index: number; cles?: string[] }[]
  /** Nombre de lignes a), b)… (regroupement, vrai/faux) ou d'exercices réunis (« ×2 »). */
  lettres: number
  repetitions: number
  points: number
  /** Examen : partie ouverte par cette entrée. */
  partie?: { cle: string; romain: string; titre: string }
}

/** Graine fixe par générateur (même consigne d'un rendu à l'autre, clés de cache distinctes). */
function graineDe(generatorId: string): number {
  let h = 2166136261
  for (const c of generatorId) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  return (h >>> 0) % 2147483647 || 1
}

type Brut = { el: ElementPlan; index: number; cle?: string; points: number }

export function ordreImpression(
  actives: LigneActive[],
  cache: Map<string, unknown>,
  examen?: { organisation: OrganisationExamen; chapitres: ChapitreExamen[] },
): EntreeImpression[] {
  const bruts: Brut[] = []
  for (const a of actives) {
    const l = a.ligne
    const base = { processus: l.processus, titreSection: '' }
    if (l.type === 'exercice') {
      for (const v of a.variantes ?? []) {
        for (let k = 0; k < v.nombre; k++) {
          bruts.push({
            el: { ...base, type: 'exercice', generatorId: l.cle ?? '', instances: [{ varianteId: varianteDeCle(v.cle), graine: graineDe(l.cle ?? ''), points: v.points }], ligne: a.index },
            index: a.index,
            cle: v.cle,
            points: v.points,
          })
        }
      }
    } else if (l.type === 'vraiFaux') {
      bruts.push({ el: { ...base, type: 'vraiFaux', pointsParAffirmation: a.points, chapitreSlug: l.chapitreSlug, theme: l.cle ?? '', indices: Array.from({ length: a.nombre }, (_, i) => i) }, index: a.index, points: a.points * a.nombre })
    } else {
      for (let k = 0; k < a.nombre; k++) bruts.push({ el: { ...base, type: 'ouverte', points: a.points, question: { enonce: [], corrige: [] } }, index: a.index, points: a.points })
    }
  }

  // Questions numérotées comme les documents (regroupements compris), avant le rangement.
  const questions = questionsDeSerie(
    bruts.map((b) => b.el),
    cache,
  ).map((q) => {
    const els = q.indices.map((i) => bruts[i])
    const chapitres = [...new Set(els.map((b) => (b.el.type === 'vraiFaux' ? b.el.chapitreSlug : (actives.find((a) => a.index === b.index)?.ligne.chapitreSlug ?? ''))))]
    return { q, els, processus: els[0].el.processus as Processus, chapitres }
  })

  type Q = (typeof questions)[number]
  let ordonnees: { q: Q; partie?: EntreeImpression['partie'] }[]
  if (examen) {
    ordonnees = partiesExamen(questions, (x) => ({ processus: x.processus, chapitres: x.chapitres }), examen.organisation, examen.chapitres).flatMap((p) =>
      p.questions.map((x, i) => ({ q: x.element, partie: i === 0 ? { cle: p.cle, romain: p.romain, titre: p.titre } : undefined })),
    )
  } else {
    ordonnees = ([1, 2, 3] as const).flatMap((p) => questions.filter((x) => x.processus === p).map((q) => ({ q })))
  }

  // Exercices consécutifs non regroupés d'une même ligne : une entrée (« Ex. 3–4 · … ×2 »).
  const entrees: EntreeImpression[] = []
  let numero = 0
  for (const { q, partie } of ordonnees) {
    numero++
    const nature = q.q.nature
    const indexLigne = q.els[0].index
    const precedente = entrees[entrees.length - 1]
    const fusionnable =
      !partie && precedente && precedente.dernier === numero - 1 && !q.q.regroupe && nature !== 'vraiFaux' && precedente.nature === nature && precedente.lettres === 0 && precedente.retraits.length === 1 && precedente.retraits[0].index === indexLigne
    const cles = [...new Set(q.els.map((b) => b.cle).filter((c): c is string => !!c))]
    const points = q.els.reduce((t, b) => t + b.points, 0)
    if (fusionnable) {
      precedente.dernier = numero
      precedente.repetitions++
      precedente.points += points
      const r = precedente.retraits[0]
      if (r.cles) r.cles = [...new Set([...r.cles, ...cles])]
      continue
    }
    const indexes = [...new Set(q.els.map((b) => b.index))]
    entrees.push({
      cle: `${numero}-${indexes.join('.')}`,
      premier: numero,
      dernier: numero,
      processus: q.processus,
      nature,
      retraits: indexes.map((index) => ({ index, ...(nature === 'exercice' ? { cles: [...new Set(q.els.filter((b) => b.index === index).map((b) => b.cle!))] } : {}) })),
      lettres: q.q.regroupe ? q.els.length : nature === 'vraiFaux' ? q.els.reduce((t, b) => t + (b.el.type === 'vraiFaux' ? b.el.indices.length : 0), 0) : 0,
      repetitions: 1,
      points,
      partie,
    })
  }
  return entrees
}
