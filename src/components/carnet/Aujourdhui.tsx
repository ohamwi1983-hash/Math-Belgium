import { useId, useMemo, useState } from 'react'
import { dateCourte, dateIso, dateLongue, type Classe, type Seance } from '../../lib/carnet'
import type { Ecole } from '../../lib/compteValidation'
import { creneauPropose, creneauxDuJour, creneauxOublies, depuisParDefaut, libelleCreneau, seanceDuCreneau, type CaseHoraire, type Creneau, type GrilleHoraire } from '../../lib/horaire'
import { lireDepuisOubliees, memoriserDepuisOubliees } from './outilsCarnet'

function capitale(t: string): string {
  return t.charAt(0).toUpperCase() + t.slice(1)
}

const OUBLIEES_VISIBLES = 12

/**
 * Vue « Aujourd'hui » (ou un autre jour) : les créneaux de l'horaire, chacun avec « Noter la
 * séance » ou « Séance notée ✓ » ; le créneau en cours (ou le plus proche) est mis en avant. En
 * dessous, le rappel des créneaux passés sans séance (congés et jours fériés FWB exclus).
 */
export function Aujourdhui({
  grilles,
  cases,
  seances,
  classes,
  ecoles,
  maintenant,
  onNoter,
  onVoir,
}: {
  grilles: GrilleHoraire[]
  cases: CaseHoraire[]
  seances: Seance[]
  classes: Classe[]
  ecoles: Ecole[]
  maintenant: Date
  onNoter: (c: Creneau) => void
  onVoir: (s: Seance) => void
}) {
  const id = useId()
  const aujourdhui = dateIso(maintenant)
  const minutesMaintenant = maintenant.getHours() * 60 + maintenant.getMinutes()
  const [date, setDate] = useState(aujourdhui)
  const [depuisChoisi, setDepuisChoisi] = useState<string | null>(() => lireDepuisOubliees())
  const [toutes, setToutes] = useState(false)
  const depuisDefaut = depuisParDefaut(aujourdhui)
  const depuis = depuisChoisi && depuisChoisi <= aujourdhui ? depuisChoisi : depuisDefaut

  const jour = useMemo(() => creneauxDuJour(/^\d{4}-\d{2}-\d{2}$/.test(date) ? date : aujourdhui, grilles, cases), [date, aujourdhui, grilles, cases])
  const propose = date === aujourdhui ? creneauPropose(jour.creneaux, minutesMaintenant) : null
  const oubliees = useMemo(
    () => creneauxOublies({ grilles, cases, seances, depuis, aujourdhui, maintenant: minutesMaintenant }),
    [grilles, cases, seances, depuis, aujourdhui, minutesMaintenant],
  )
  const nomClasse = (cid: string) => classes.find((c) => c.id === cid)?.nom ?? 'Classe supprimée'
  const nomEcole = (eid: string) => (ecoles.length > 1 ? ecoles.find((e) => e.id === eid)?.nom : undefined)

  const etat = jour.etat
  const messageJour =
    etat.type === 'weekend'
      ? 'Week-end : pas de cours.'
      : etat.type === 'conge'
        ? `Congé : ${etat.libelle} — pas de cours.`
        : etat.type === 'ete'
          ? 'Vacances d’été : pas de cours.'
          : jour.creneaux.length === 0
            ? 'Aucun cours ce jour-là dans ton horaire.'
            : null

  return (
    <section className="compte-section carnet-aujourdhui" aria-labelledby={`${id}-titre`}>
      <h2 id={`${id}-titre`}>{date === aujourdhui ? 'Aujourd’hui' : 'Créneaux du jour'}</h2>
      <div className="carnet-jour-choix">
        <p className="carnet-date-jour">{capitale(dateLongue(jour.creneaux[0]?.date ?? date))}</p>
        <div className="compte-champ carnet-champ-date">
          <label htmlFor={`${id}-date`}>Autre jour</label>
          <input id={`${id}-date`} type="date" value={date} onChange={(e) => setDate(e.target.value || aujourdhui)} />
        </div>
        {date !== aujourdhui && (
          <button type="button" className="compte-bouton-secondaire" onClick={() => setDate(aujourdhui)}>
            Revenir à aujourd’hui
          </button>
        )}
      </div>
      {etat.type === 'inconnu' && (
        <p className="compte-aide carnet-a-confirmer" role="note">
          Calendrier FWB {etat.annee} à confirmer : ses congés ne sont pas encore dans le site.
        </p>
      )}
      {messageJour && <p className="compte-vide">{messageJour}</p>}
      {jour.creneaux.length > 0 && (
        <ul className="carnet-creneaux">
          {jour.creneaux.map((c) => {
            const s = seanceDuCreneau(c, seances)
            const enCours = propose === c && c.debut <= minutesMaintenant && minutesMaintenant < c.fin
            const ecole = nomEcole(c.ecole_id)
            return (
              <li key={`${c.ecole_id}-${c.heureDebut}`} className={`carnet-creneau${propose === c ? ' propose' : ''}${s ? ' note' : ''}`}>
                <div className="carnet-creneau-texte">
                  <span className="carnet-creneau-horaire">{libelleCreneau(c)}</span>
                  <strong className="carnet-creneau-classe">{nomClasse(c.classe_id)}</strong>
                  {ecole && <span className="carnet-puce-ecole">{ecole}</span>}
                  {propose === c && <span className="compte-badge">{enCours ? 'en cours' : 'le plus proche'}</span>}
                </div>
                {s ? (
                  <button type="button" className="compte-bouton-secondaire carnet-creneau-note" onClick={() => onVoir(s)}>
                    Séance notée ✓
                  </button>
                ) : (
                  <button type="button" className="compte-bouton" onClick={() => onNoter(c)}>
                    Noter la séance
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}

      <div className="carnet-oubliees">
        <h3>Séances à noter</h3>
        <p className={oubliees.length > 0 ? 'carnet-oubliees-compte' : 'compte-vide'} role="status">
          {oubliees.length === 0
            ? `Aucun créneau oublié depuis le ${dateCourte(depuis)}.`
            : `${oubliees.length} créneau${oubliees.length > 1 ? 'x' : ''} passé${oubliees.length > 1 ? 's' : ''} sans séance notée depuis le ${dateCourte(depuis)}.`}
        </p>
        <div className="carnet-jour-choix">
          <div className="compte-champ carnet-champ-date">
            <label htmlFor={`${id}-depuis`}>Depuis le</label>
            <input
              id={`${id}-depuis`}
              type="date"
              value={depuis}
              max={aujourdhui}
              onChange={(e) => {
                const v = e.target.value || null
                setDepuisChoisi(v)
                memoriserDepuisOubliees(v)
              }}
            />
          </div>
          {depuisChoisi && depuisChoisi !== depuisDefaut && (
            <button
              type="button"
              className="compte-bouton-secondaire"
              onClick={() => {
                setDepuisChoisi(null)
                memoriserDepuisOubliees(null)
              }}
            >
              14 derniers jours de classe
            </button>
          )}
        </div>
        {oubliees.length > 0 && (
          <ul className="carnet-creneaux carnet-creneaux-oublies">
            {(toutes ? oubliees : oubliees.slice(0, OUBLIEES_VISIBLES)).map((c) => (
              <li key={`${c.date}-${c.ecole_id}-${c.heureDebut}`} className="carnet-creneau">
                <div className="carnet-creneau-texte">
                  <span className="carnet-creneau-date">{capitale(dateLongue(c.date, true).replace(/ \d{4}$/, ''))}</span>
                  <span className="carnet-creneau-horaire">{libelleCreneau(c)}</span>
                  <strong className="carnet-creneau-classe">{nomClasse(c.classe_id)}</strong>
                </div>
                <button type="button" className="compte-bouton-secondaire" onClick={() => onNoter(c)}>
                  Noter
                </button>
              </li>
            ))}
          </ul>
        )}
        {oubliees.length > OUBLIEES_VISIBLES && (
          <button type="button" className="compte-bouton-lien" onClick={() => setToutes(!toutes)}>
            {toutes ? 'Afficher moins' : `Afficher les ${oubliees.length}`}
          </button>
        )}
        <p className="compte-aide">Week-ends, congés et jours fériés de la Fédération Wallonie-Bruxelles exclus ; une case ajoutée à l'horaire ne compte qu'à partir du jour de son ajout.</p>
      </div>
    </section>
  )
}
