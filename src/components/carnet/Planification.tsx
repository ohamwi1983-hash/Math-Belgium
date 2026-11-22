import { useId, useMemo, useState } from 'react'
import { prochainConge, ajouterJours } from '../../lib/calendrierFwb'
import { dateIso, dateLongue, type Classe } from '../../lib/carnet'
import { heuresRestantes, type CaseHoraire, type GrilleHoraire, type HeureSupprimee } from '../../lib/horaire'

/**
 * Planification : heures de cours restantes avec chaque classe d'ici une date (par défaut : le
 * dernier jour de classe avant le prochain congé FWB). Congés exclus ; une heure double compte pour
 * 2 heures et 1 séance ; aujourd'hui, seulement les heures pas encore commencées.
 */
export function Planification({ grilles, cases, classes, maintenant, supprimee }: { grilles: GrilleHoraire[]; cases: CaseHoraire[]; classes: Classe[]; maintenant: Date; supprimee?: HeureSupprimee }) {
  const id = useId()
  const aujourdhui = dateIso(maintenant)
  const defaut = prochainConge(aujourdhui)?.dernierJourDeClasse ?? ajouterJours(aujourdhui, 28)
  const [jusqua, setJusqua] = useState(defaut)
  const fin = /^\d{4}-\d{2}-\d{2}$/.test(jusqua) && jusqua >= aujourdhui ? jusqua : defaut
  const minutesMaintenant = maintenant.getHours() * 60 + maintenant.getMinutes()
  const resultat = useMemo(() => heuresRestantes({ grilles, cases, aujourdhui, maintenant: minutesMaintenant, jusqua: fin, supprimee }), [grilles, cases, aujourdhui, minutesMaintenant, fin, supprimee])
  const dansHoraire = classes.filter((c) => cases.some((k) => k.classe_id === c.id && grilles.some((g) => g.ecole_id === k.ecole_id))).sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))
  const dateTexte = dateLongue(fin, false)

  return (
    <section className="compte-section" aria-labelledby={`${id}-titre`}>
      <h2 id={`${id}-titre`}>Heures restantes</h2>
      <div className="compte-champ carnet-champ-date">
        <label htmlFor={`${id}-jusqua`}>D'ici le</label>
        <input id={`${id}-jusqua`} type="date" value={jusqua} min={aujourdhui} onChange={(e) => setJusqua(e.target.value)} />
      </div>
      {dansHoraire.length === 0 ? (
        <p className="compte-vide">Remplis ton horaire de la semaine pour voir les heures restantes avec chaque classe.</p>
      ) : (
        <ul className="carnet-restantes">
          {dansHoraire.map((c) => {
            const r = resultat.parClasse.get(c.id)
            const h = r?.heures ?? 0
            return (
              <li key={c.id}>
                {h === 0 ? (
                  <>
                    Plus aucune heure avec <strong>{c.nom}</strong> d'ici le {dateTexte}.
                  </>
                ) : (
                  <>
                    <strong>
                      {h} heure{h > 1 ? 's' : ''}
                    </strong>{' '}
                    avec <strong>{c.nom}</strong> d'ici le {dateTexte}{' '}
                    <span className="compte-compte">
                      ({r?.seances} séance{(r?.seances ?? 0) > 1 ? 's' : ''})
                    </span>
                  </>
                )}
              </li>
            )
          })}
        </ul>
      )}
      {resultat.aConfirmer.length > 0 && (
        <p className="compte-aide carnet-a-confirmer" role="note">
          Calendrier FWB {resultat.aConfirmer.join(', ')} à confirmer : ses congés ne sont pas déduits.
        </p>
      )}
      <p className="compte-aide">
        Week-ends, congés et jours fériés FWB exclus{supprimee ? ', ainsi que les heures supprimées par un événement (sortie, journée pédagogique…)' : ''}. Une heure double compte pour 2 heures et 1 séance. Aujourd’hui : seulement les heures pas encore commencées.
      </p>
    </section>
  )
}
