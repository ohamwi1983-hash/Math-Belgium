import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import type { Processus } from '../../../lib/evaluationPayload'
import {
  CLES_REPARTITION,
  CLE_DE_PROCESSUS,
  LIBELLE_CLE,
  PAS_REPARTITION,
  PROCESSUS_DE_CLE,
  ajusterParts,
  fractionsRepartition,
  partageEgal,
  pourcentsEgaux,
  texteCompetences,
  type RepartitionPourcents,
} from '../../../lib/repartitionProcessus'

/**
 * Compétences de « Préparer l'évaluation » — évaluations et feuilles d'exercices du panneau professeur
 * (décision de l'utilisateur, 22/11/2026 : « hyper flexible », une, deux ou trois compétences, sans
 * répartition à respecter ; la répartition mémorisée ne vaut que pour l'examen, `ReglageRepartition`).
 *
 * Le professeur coche les compétences du document (au moins une, les trois par défaut) ; le temps est
 * partagé à parts ÉGALES entre elles (`partageEgal`) ; il peut ajuster avec − / + (total 100 %, une
 * non cochée = 0 %, `ajusterParts`). Réglage du DOCUMENT seulement (état du panneau) : jamais
 * mémorisé, jamais « Enregistrer ». Cocher / décocher remet les parts égales.
 */

export interface ReglageCompetencesDocument {
  /** Compétences cochées (au moins une), ordre 1, 2, 3. */
  cochees: Processus[]
  /** Parts ajustées (pourcentages entiers, somme 100) ; `null` = parts égales exactes. */
  parts: RepartitionPourcents | null
}

export const REGLAGE_COMPETENCES_DEFAUT: ReglageCompetencesDocument = { cochees: [1, 2, 3], parts: null }

/** Fractions (somme 1) lues par `composer.ts` : parts ajustées, sinon partage égal exact. */
export function fractionsCompetences(r: ReglageCompetencesDocument): Record<Processus, number> {
  return r.parts ? fractionsRepartition(r.parts) : partageEgal(r.cochees)
}

/** Pourcentages affichés (entiers, somme 100). */
export function pourcentsCompetences(r: ReglageCompetencesDocument): RepartitionPourcents {
  return r.parts ?? pourcentsEgaux(r.cochees)
}

/** Note de la carte (« ⚙ Compétences ») : rien quand tout est par défaut. */
export function noteCarteCompetences(r: ReglageCompetencesDocument): string | null {
  const morceaux: string[] = []
  if (r.cochees.length < 3) morceaux.push(r.cochees.map((p) => LIBELLE_CLE[CLE_DE_PROCESSUS[p]]).join(' · '))
  if (r.parts) morceaux.push('parts ajustées')
  return morceaux.length ? morceaux.join(' · ') : null
}

/** Description courte : « Connaître, Appliquer et Transférer, parts égales ». */
export function texteReglageCompetences(r: ReglageCompetencesDocument): string {
  return `${texteCompetences(r.cochees)}${r.cochees.length > 1 ? (r.parts ? ', parts ajustées' : ', parts égales') : ''}`
}

export function ReglageCompetences({
  reglage,
  onChange,
  feuille,
  dureeCible,
  presentes,
  onPreparer,
  onFermer,
}: {
  reglage: ReglageCompetencesDocument
  onChange: (r: ReglageCompetencesDocument) => void
  /** Feuille d'exercices (pas de points) plutôt qu'évaluation. */
  feuille: boolean
  /** Durée visée (minutes), pour l'aide « ≈ m min ». */
  dureeCible: number
  /** Compétences ayant au moins une question composable dans les chapitres. */
  presentes: readonly Processus[]
  onPreparer: () => void
  onFermer: () => void
}) {
  const titre = useRef<HTMLParagraphElement>(null)
  const [rappel, setRappel] = useState(false)
  useEffect(() => {
    titre.current?.focus()
  }, [])
  const surTouche = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      onFermer()
    }
  }
  const pc = pourcentsCompetences(reglage)
  const fractions = fractionsCompetences(reglage)
  const basculer = (p: Processus) => {
    const on = reglage.cochees.includes(p)
    if (on && reglage.cochees.length === 1) {
      setRappel(true)
      return
    }
    setRappel(false)
    const cochees = ([1, 2, 3] as const).filter((q) => (q === p ? !on : reglage.cochees.includes(q)))
    onChange({ cochees, parts: null })
  }
  const absentes = reglage.cochees.filter((p) => !presentes.includes(p))
  const receveuses = reglage.cochees.filter((p) => presentes.includes(p))
  const doc = feuille ? 'cette feuille' : 'cette évaluation'
  return (
    <div className="conc-rep conc-comp" id="conc-comp" role="group" aria-labelledby="conc-comp-titre" onKeyDown={surTouche}>
      <p className="conc-rep-titre" id="conc-comp-titre" ref={titre} tabIndex={-1}>
        Compétences de {doc}
      </p>
      <p className="conc-rep-aide">
        Coche une, deux ou trois compétences. Le temps{feuille ? '' : ' (et donc les points)'} est partagé à parts égales entre elles ; tu peux l’ajuster avec − / +. Une compétence non cochée n’est jamais choisie.
      </p>
      <div className="conc-rep-barre" aria-hidden="true">
        {CLES_REPARTITION.map((c) =>
          pc[c] > 0 ? (
            <span key={c} className={`conc-rep-seg conc-rep-seg-${PROCESSUS_DE_CLE[c]}`} style={{ flexGrow: pc[c] }}>
              {pc[c] >= 12 ? `${pc[c]} %` : ''}
            </span>
          ) : null,
        )}
      </div>
      <ul className="conc-rep-lignes">
        {CLES_REPARTITION.map((c) => {
          const p = PROCESSUS_DE_CLE[c]
          const on = reglage.cochees.includes(p)
          const moins = on ? ajusterParts(pc, c, -PAS_REPARTITION, reglage.cochees) : null
          const plus = on ? ajusterParts(pc, c, PAS_REPARTITION, reglage.cochees) : null
          const absente = on && !presentes.includes(p)
          return (
            <li key={c} className={`conc-rep-ligne${on ? '' : ' conc-comp-off'}`}>
              <label className="conc-comp-coche">
                <input type="checkbox" checked={on} onChange={() => basculer(p)} />
                <span className={`conc-pc conc-pc-${p}`} aria-hidden="true">
                  {p}
                </span>
                <span className="conc-rep-libelle">
                  {LIBELLE_CLE[c]}
                  <span className="conc-rep-min">{!on ? 'non cochée' : absente ? 'aucun exercice ici' : `≈ ${Math.round(dureeCible * fractions[p])} min`}</span>
                </span>
              </label>
              <span className="conc-rep-reglage">
                <button type="button" className="conc-rep-btn" disabled={!moins} aria-label={`Diminuer ${LIBELLE_CLE[c]} de ${PAS_REPARTITION} %`} onClick={() => moins && onChange({ ...reglage, parts: moins })}>
                  −
                </button>
                <span className="conc-rep-valeur">{pc[c]} %</span>
                <button type="button" className="conc-rep-btn" disabled={!plus} aria-label={`Augmenter ${LIBELLE_CLE[c]} de ${PAS_REPARTITION} %`} onClick={() => plus && onChange({ ...reglage, parts: plus })}>
                  +
                </button>
              </span>
            </li>
          )
        })}
      </ul>
      <p className="conc-rep-total" aria-live="polite">
        Total : <b>100 %</b> ✓ {reglage.cochees.length > 1 ? (reglage.parts ? '— parts ajustées' : '— parts égales') : `— tout en ${LIBELLE_CLE[CLE_DE_PROCESSUS[reglage.cochees[0]]]}`}
      </p>
      {absentes.length > 0 && (
        <p className="conc-rep-alerte conc-comp-cede">
          {texteCompetences(absentes)} : aucun exercice dans ces chapitres{feuille ? '' : ' (avec ces réglages)'}
          {receveuses.length > 0 ? ` — ${absentes.length > 1 ? 'leur' : 'son'} temps va à ${texteCompetences(receveuses)}.` : ' : rien à proposer avec ces compétences.'}
        </p>
      )}
      <div className="conc-rep-actions">
        <button type="button" className="conc-bouton conc-bouton-principal" onClick={onPreparer}>
          Préparer avec {reglage.cochees.length === 1 ? texteCompetences(reglage.cochees) : 'ces compétences'}
        </button>
        <button type="button" className="conc-bouton" disabled={!reglage.parts} onClick={() => onChange({ ...reglage, parts: null })}>
          Parts égales
        </button>
        <button type="button" className="conc-bouton conc-bouton-discret" onClick={onFermer}>
          Fermer
        </button>
      </div>
      <div className="conc-rep-etat" role="status">
        {rappel ? <p className="conc-rep-alerte">Garde au moins une compétence.</p> : <p>Réglage de {doc} seulement : il n’est pas mémorisé.</p>}
      </div>
    </div>
  )
}
