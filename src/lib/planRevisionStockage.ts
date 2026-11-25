import { estJour, type Jour } from './planRevision'

/**
 * Plan de révision gardé dans CE navigateur (`localStorage`, clé versionnée `suivi:plan:v1`) : les
 * réglages choisis par l'élève et les cases cochées. Rien n'est envoyé. Le calcul du plan est dans
 * `planRevision.ts` (pur), l'affichage dans `routes/PlanRevisionPage.tsx`.
 *
 * Point d'accroche pour la page de classe (lot C) : `lienPlanRevision()` construit
 * `/suivi/plan?date=AAAA-MM-JJ&niveau=…&chapitre=…&etapes=id1,id2` — la page ouvre le formulaire
 * prérempli (date de l'interro publiée, étapes annoncées) ; l'élève confirme. Rien n'est remplacé sans
 * son accord.
 */

export interface PlanGarde {
  /** Premier jour du plan. */
  debut: Jour
  interro: Jour
  minutes: number
  jourLibre: number | null
  niveau: string
  /** Étapes choisies : `{slugChapitre}#{idSection}`, dans l'ordre du cours. */
  etapes: string[]
  /** Identifiants des tâches cochées. */
  faites: string[]
}

export const CLE_PLAN = 'suivi:plan:v1'
export const MINUTES_POSSIBLES = [10, 20, 30] as const

export function lirePlan(): PlanGarde | null {
  let v: unknown
  try {
    const brut = window.localStorage.getItem(CLE_PLAN)
    if (!brut) return null
    v = JSON.parse(brut)
  } catch {
    return null
  }
  if (!v || typeof v !== 'object') return null
  const p = v as Partial<PlanGarde>
  if (!estJour(p.debut) || !estJour(p.interro) || typeof p.niveau !== 'string') return null
  const minutes = MINUTES_POSSIBLES.includes(p.minutes as 10) ? (p.minutes as number) : 20
  const jourLibre = typeof p.jourLibre === 'number' && p.jourLibre >= 0 && p.jourLibre <= 6 ? p.jourLibre : null
  const etapes = Array.isArray(p.etapes) ? p.etapes.filter((x): x is string => typeof x === 'string') : []
  const faites = Array.isArray(p.faites) ? p.faites.filter((x): x is string => typeof x === 'string').slice(-2000) : []
  return { debut: p.debut, interro: p.interro, minutes, jourLibre, niveau: p.niveau, etapes, faites }
}

/** `false` si le stockage est indisponible (le plan vaut alors pour la visite seulement). */
export function ecrirePlan(p: PlanGarde): boolean {
  try {
    window.localStorage.setItem(CLE_PLAN, JSON.stringify(p))
    return true
  } catch {
    return false
  }
}

export function effacerPlan(): void {
  try {
    window.localStorage.removeItem(CLE_PLAN)
  } catch {
    // Stockage indisponible : rien n'était gardé.
  }
}

/** Lien vers le plan de révision, prérempli (page de classe, « Mon plan de révision jusqu'au … »). */
export function lienPlanRevision(o: { date?: Jour; niveau?: string; chapitre?: string; etapes?: string[] } = {}): string {
  const q = new URLSearchParams()
  if (o.date) q.set('date', o.date)
  if (o.niveau) q.set('niveau', o.niveau)
  if (o.chapitre) q.set('chapitre', o.chapitre)
  if (o.etapes?.length) q.set('etapes', o.etapes.join(','))
  const s = q.toString()
  return `/suivi/plan${s ? `?${s}` : ''}`
}
