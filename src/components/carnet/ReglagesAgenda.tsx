import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { anneeScolaireDe } from '../../lib/calendrierFwb'
import type { Ecole } from '../../lib/compteValidation'
import { dateCourteJour, erreursPeriode, examensApres, periodesDe, PERIODES_MAX, SEUIL_MAX, SEUIL_MIN, texteExamens, type Evenement, type PeriodeBulletin } from '../../lib/agendaEvenements'
import { MessageAgendaInactif } from './AgendaUi'

/**
 * Réglages de l'agenda (maquette « Réglages : périodes du bulletin ») : par école et par année
 * scolaire, la date de remise des points de chaque période (P1 … Pn : ajouter, modifier,
 * supprimer — confirmation dans la page) ; seuil d'avertissement « peu de temps pour corriger » en
 * jours de classe (− / +, 0 à 15). Aucun champ numérique : dates en `type="date"`, seuil en boutons.
 */
export function ReglagesAgenda({
  actif,
  ecoles,
  periodes,
  evenements,
  seuil,
  aujourdhui,
  occupe,
  onAjouter,
  onModifier,
  onSupprimer,
  onSeuil,
}: {
  actif: boolean
  ecoles: Ecole[]
  periodes: PeriodeBulletin[]
  evenements: Evenement[]
  seuil: number
  aujourdhui: string
  occupe: boolean
  onAjouter: (ecoleId: string, annee: string, remise: string) => Promise<boolean>
  onModifier: (p: PeriodeBulletin, remise: string) => Promise<boolean>
  onSupprimer: (p: PeriodeBulletin) => Promise<boolean>
  onSeuil: (seuil: number) => void
}) {
  const id = useId()
  const anneeCourante = anneeScolaireDe(aujourdhui)
  const debut = Number(anneeCourante.slice(0, 4))
  const annees = [anneeCourante, `${debut + 1}-${debut + 2}`]
  const [ecoleId, setEcoleId] = useState(() => ecoles.find((e) => e.par_defaut)?.id ?? ecoles[0]?.id ?? '')
  const [annee, setAnnee] = useState(anneeCourante)
  const [edition, setEdition] = useState<string | null>(null) // id de période, ou 'nouvelle'
  const [valeur, setValeur] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)
  const [aSupprimer, setASupprimer] = useState<PeriodeBulletin | null>(null)
  const annulerRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (aSupprimer) annulerRef.current?.focus()
  }, [aSupprimer])

  if (ecoles.length === 0) return null
  if (!actif) {
    return (
      <section className="carnet-carte agenda-reglages" aria-labelledby={`${id}-titre`}>
        <h3 id={`${id}-titre`}>Périodes du bulletin</h3>
        <MessageAgendaInactif compact />
      </section>
    )
  }

  const ecole = ecoles.find((e) => e.id === ecoleId) ?? ecoles[0]
  const liste = ecole ? periodesDe(periodes, ecole.id, annee) : []

  function ouvrir(cle: string, v: string) {
    setEdition(cle)
    setValeur(v)
    setErreur(null)
    setASupprimer(null)
  }

  async function valider(p: PeriodeBulletin | null) {
    if (!ecole) return
    const e = erreursPeriode(valeur, annee, liste.filter((x) => x.id !== p?.id)).remise
    if (e) {
      setErreur(e)
      return
    }
    const ok = p ? await onModifier(p, valeur) : await onAjouter(ecole.id, annee, valeur)
    if (ok) setEdition(null)
  }

  function clavier(e: KeyboardEvent, p: PeriodeBulletin | null) {
    if (e.key === 'Escape') {
      e.preventDefault()
      setEdition(null)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      void valider(p)
    }
  }

  const champDate = (p: PeriodeBulletin | null) => (
    <div className="agenda-periode-edition" onKeyDown={(e) => clavier(e, p)}>
      <div className="compte-champ carnet-champ-date">
        <label htmlFor={`${id}-date`}>{p ? `Remise des points de la période ${p.numero}` : 'Date de remise des points'}</label>
        <input id={`${id}-date`} type="date" value={valeur} min={`${annee.slice(0, 4)}-08-01`} max={`${annee.slice(5, 9)}-07-31`} autoFocus aria-invalid={erreur ? true : undefined} onChange={(e) => {
          setValeur(e.target.value)
          setErreur(null)
        }} />
      </div>
      {erreur && (
        <p className="compte-erreur-champ" role="alert">
          {erreur}
        </p>
      )}
      <div className="agenda-periode-actions">
        <button type="button" className="carnet-bouton principal" disabled={occupe} onClick={() => void valider(p)}>
          Enregistrer
        </button>
        <button type="button" className="carnet-bouton" onClick={() => setEdition(null)}>
          Annuler
        </button>
        {p && (
          <button type="button" className="compte-bouton-lien agenda-supprimer" disabled={occupe} onClick={() => {
            setEdition(null)
            setASupprimer(p)
          }}>
            Supprimer la période
          </button>
        )}
      </div>
    </div>
  )

  return (
    <>
      <section className="carnet-carte agenda-reglages" aria-labelledby={`${id}-titre`}>
        <p className="agenda-surtitre">
          {ecole?.nom} · {annee}
        </p>
        <h3 id={`${id}-titre`}>Périodes du bulletin</h3>
        {(ecoles.length > 1 || annees.length > 1) && (
          <div className="agenda-reglages-choix">
            {ecoles.length > 1 && (
              <div className="compte-champ">
                <label htmlFor={`${id}-ecole`}>École</label>
                <select id={`${id}-ecole`} value={ecole?.id ?? ''} onChange={(e) => {
                  setEcoleId(e.target.value)
                  setEdition(null)
                }}>
                  {ecoles.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nom}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="compte-champ">
              <label htmlFor={`${id}-annee`}>Année scolaire</label>
              <select id={`${id}-annee`} value={annee} onChange={(e) => {
                setAnnee(e.target.value)
                setEdition(null)
              }}>
                {annees.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
        {liste.length === 0 && edition !== 'nouvelle' && <p className="compte-vide">Aucune période pour {annee} : ajoute la date de remise des points de la période 1.</p>}
        <ol className="agenda-periodes">
          {liste.map((p) => {
            const examens = examensApres(p, evenements)
            return (
              <li key={p.id}>
                {edition === p.id ? (
                  champDate(p)
                ) : (
                  <div className="agenda-periode">
                    <span className="agenda-periode-num" aria-hidden="true">
                      P{p.numero}
                    </span>
                    <span className="agenda-periode-texte">
                      <strong>
                        <span className="carnet-sr">Période {p.numero} : </span>
                        {dateCourteJour(p.remise, true)}
                      </strong>
                      <span>Remise des points{examens ? ` · ${texteExamens(examens)} ensuite` : ''}</span>
                    </span>
                    <button type="button" className="carnet-bouton agenda-crayon" aria-label={`Modifier la période ${p.numero}`} onClick={() => ouvrir(p.id, p.remise)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                        <path d="M4 20l1-4L16 5l3 3L8 19z" />
                      </svg>
                    </button>
                  </div>
                )}
                {aSupprimer?.id === p.id && (
                  <div className="agenda-confirmation" role="alertdialog" aria-labelledby={`${id}-conf`} onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      e.preventDefault()
                      setASupprimer(null)
                    }
                  }}>
                    <p id={`${id}-conf`}>
                      <strong>Supprimer la période {p.numero} ({dateCourteJour(p.remise, true)}) ?</strong> Les périodes suivantes reculent d’un numéro.
                    </p>
                    <div className="agenda-confirmation-actions">
                      <button type="button" className="carnet-bouton" ref={annulerRef} onClick={() => setASupprimer(null)}>
                        Annuler
                      </button>
                      <button type="button" className="carnet-bouton agenda-danger-plein" disabled={occupe} onClick={async () => {
                        if (await onSupprimer(p)) setASupprimer(null)
                      }}>
                        Supprimer
                      </button>
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ol>
        {edition === 'nouvelle' ? (
          champDate(null)
        ) : (
          liste.length < PERIODES_MAX && (
            <button type="button" className="agenda-ajouter" onClick={() => ouvrir('nouvelle', '')}>
              <span aria-hidden="true">+</span> Ajouter une période
            </button>
          )
        )}
      </section>

      <section className="carnet-carte agenda-seuil" aria-labelledby={`${id}-seuil`}>
        <h3 id={`${id}-seuil`}>Avertir si une interro tombe à moins de</h3>
        <div className="agenda-seuil-ligne">
          <div className="agenda-compteur" role="group" aria-label="Seuil en jours de classe">
            <button type="button" aria-label="Un jour de moins" disabled={occupe || seuil <= SEUIL_MIN} onClick={() => onSeuil(seuil - 1)}>
              −
            </button>
            <output aria-live="polite">{seuil}</output>
            <button type="button" aria-label="Un jour de plus" disabled={occupe || seuil >= SEUIL_MAX} onClick={() => onSeuil(seuil + 1)}>
              +
            </button>
          </div>
          <span>jour{seuil > 1 ? 's' : ''} de classe de la remise des points</span>
        </div>
        <p className="compte-aide">Les jours de congé, week-ends et journées sans cours ne comptent pas.</p>
      </section>
    </>
  )
}
