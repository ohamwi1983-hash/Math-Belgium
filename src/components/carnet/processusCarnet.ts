/**
 * Processus Connaître / Appliquer / Transférer des générateurs, pour le texte en rubriques du carnet.
 * La table vit dans `lib/evaluationPayload.ts` (`GENERATEURS_EVALUATION_PILOTE`), qui tire tout le
 * registre des évaluations : elle est chargée À PART, par `import()`, quand le carnet est prêt
 * (`prechargerProcessus`), jamais dans le paquet du carnet. Tant qu'elle n'est pas là, le texte n'a
 * simplement pas de ligne « Processus » (`processusConnus` rend `null`).
 */
import { useEffect, useState } from 'react'
import type { Processus } from '../../lib/carnetDevoirs'

type Table = Map<string, Processus>

/** Générateur du panneau des évaluations (`GENERATEURS_EVALUATION_PILOTE`) : ceux que « Préparer
 * l'évaluation » peut mettre dans l'évaluation, section par section (bloc « Évaluation » du carnet). */
export interface GenerateurEvaluation {
  sectionId: string
  generatorId: string
  /** Libellé explicite de la table, sans le code entre parenthèses ; vide s'il n'y en a pas. */
  libelle: string
  /** Nom du document du générateur (repli quand ni libellé ni carte du cours). */
  nom: string
  processus: Processus
}

let table: Table | null = null
let parChapitre: Map<string, GenerateurEvaluation[]> | null = null
let promesse: Promise<Table> | null = null
const abonnes = new Set<() => void>()

export function prechargerProcessus(): Promise<Table> {
  if (table) return Promise.resolve(table)
  if (!promesse) {
    promesse = import('../../lib/evaluationPayload').then((m) => {
      const t: Table = new Map()
      // Processus absent de la table = 2 (Appliquer), valeur historique (`lignesInitiales` du panneau).
      const c = new Map<string, GenerateurEvaluation[]>()
      for (const g of m.GENERATEURS_EVALUATION_PILOTE) {
        t.set(`${g.chapitreSlug}|${g.generatorId}`, g.processus ?? 2)
        const liste = c.get(g.chapitreSlug) ?? []
        liste.push({ sectionId: g.sectionId, generatorId: g.generatorId, libelle: g.label.replace(/\s*\([^()]*\)\s*$/, '').trim(), nom: m.nomGenerateur(g.generatorId), processus: g.processus ?? 2 })
        c.set(g.chapitreSlug, liste)
      }
      parChapitre = c
      table = t
      abonnes.forEach((f) => f())
      return t
    })
    promesse.catch(() => {
      promesse = null
    })
  }
  return promesse
}

/** Processus d'un générateur d'un chapitre, ou `null` (inconnu de la table, ou table pas encore chargée). */
export function processusConnus(chapitreSlug: string): ((generatorId: string) => Processus | null) | null {
  if (!table) return null
  const t = table
  return (id) => t.get(`${chapitreSlug}|${id}`) ?? null
}

/** Générateurs de l'évaluation d'un chapitre (ordre de la table), ou `null` tant que la table n'est pas
 * chargée. */
export function generateursEvaluation(chapitreSlug: string): GenerateurEvaluation[] | null {
  return parChapitre ? (parChapitre.get(chapitreSlug) ?? []) : null
}

/** Re-rend le composant quand la table arrive. */
export function useTableProcessus(): boolean {
  const [pret, setPret] = useState(table !== null)
  useEffect(() => {
    if (table) {
      setPret(true)
      return
    }
    const f = () => setPret(true)
    abonnes.add(f)
    void prechargerProcessus().catch(() => undefined)
    return () => {
      abonnes.delete(f)
    }
  }, [])
  return pret
}
