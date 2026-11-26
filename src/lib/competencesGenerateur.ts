/**
 * Compétences (processus) d'un générateur : 1 Connaître, 2 Appliquer, 3 Transférer — mêmes valeurs que le
 * panneau des évaluations (`GENERATEURS_EVALUATION_PILOTE`, processus absent = 2) ; un quiz vrai / faux absent
 * de la table relève de Connaître. Couleurs : jetons `--procN` (`.claude/rules/feuilles-evaluations.md`,
 * « Couleurs des compétences »). Les identifiants de générateurs sont uniques sur tout le site (gen / 5gen /
 * 56gen / 6gen) : la recherche se fait sur l'identifiant seul.
 */
import { GENERATEURS_EVALUATION_PILOTE } from './generateursPilote'

export type Competence = 1 | 2 | 3

export const NOM_COMPETENCE: Record<Competence, string> = { 1: 'Connaître', 2: 'Appliquer', 3: 'Transférer' }

let index: Map<string, Competence[]> | null = null

function table(): Map<string, Competence[]> {
  if (index) return index
  const m = new Map<string, Set<Competence>>()
  for (const g of GENERATEURS_EVALUATION_PILOTE) {
    const s = m.get(g.generatorId) ?? new Set<Competence>()
    s.add((g.processus ?? 2) as Competence)
    m.set(g.generatorId, s)
  }
  index = new Map([...m].map(([id, s]) => [id, [...s].sort()]))
  return index
}

/** Compétences d'un générateur, triées ; `titre` sert à reconnaître un quiz vrai / faux hors table. */
export function competencesGenerateur(generatorId: string, titre = ''): Competence[] {
  const c = table().get(generatorId)
  if (c) return c
  return /quiz|vrai\s*(?:\/|ou)\s*faux/i.test(titre) ? [1] : []
}
