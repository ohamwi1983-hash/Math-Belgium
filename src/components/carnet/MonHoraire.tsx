import { useId, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Classe } from '../../lib/carnet'
import type { DonneesHoraire } from '../../lib/carnetDonnees'
import { ecoleParDefaut, type Ecole } from '../../lib/compteValidation'
import {
  GRILLE_EXEMPLE,
  JOURS_SEMAINE,
  LIBELLE_PAUSE,
  casesHorsGrille,
  chevauchements,
  creneauxSemaine,
  heuresDuMercredi,
  journee,
  libelleCreneau,
  numerosCreneau,
  plage,
  premiereHeure,
  texteJournee,
  type CaseHoraire,
  type GrilleHoraire,
  type SaisieGrille,
} from '../../lib/horaire'
import { GrilleEcole } from './GrilleEcole'
import { useEcranLarge } from './outilsCarnet'

const JOURS_CAPITALE = JOURS_SEMAINE.map((j) => j.charAt(0).toUpperCase() + j.slice(1))

export type SaisieCase = { ecole_id: string; jour: number; heure: number; classe_id: string | null }

/** « Horaire pas encore activé » : 0003 n'est pas appliqué. */
export function MessageHoraireInactif() {
  return (
    <div className="compte-encadre" role="status">
      <p>
        <strong>Horaire pas encore activé.</strong>
      </p>
      <p>
        Colle le fichier <code>supabase/migrations/0003_horaire.sql</code> dans l'éditeur SQL de Supabase (SQL Editor → New query → coller → Run), puis recharge cette page. Le carnet
        fonctionne normalement en attendant, sans horaire.
      </p>
    </div>
  )
}

/**
 * « Mon horaire » : pour chaque école, la grille horaire (une seule source) puis l'horaire de la
 * semaine (jours × heures, une classe de CETTE école par case). Professeur dans deux écoles : un
 * onglet par école, chevauchements signalés, et la semaine complète résumée.
 */
export function MonHoraire({
  horaire,
  ecoles,
  classes,
  occupe,
  onEnregistrerGrille,
  onSupprimerGrille,
  onDefinirCase,
}: {
  horaire: DonneesHoraire
  ecoles: Ecole[]
  classes: Classe[]
  occupe: boolean
  onEnregistrerGrille: (ecoleId: string, g: SaisieGrille, existe: boolean, casesARetirer: string[]) => Promise<boolean>
  onSupprimerGrille: (ecoleId: string) => void
  onDefinirCase: (existante: CaseHoraire | undefined, saisie: SaisieCase) => Promise<boolean>
}) {
  // `?ecole=<id>` (lien « Horaire » d'une école de la page Mon profil) : onglet de cette école ;
  // sinon l'école par défaut, comme avant.
  const [params] = useSearchParams()
  const [ecoleId, setEcoleId] = useState<string>(() => {
    const demandee = params.get('ecole')
    return (demandee && ecoles.some((e) => e.id === demandee) ? demandee : null) ?? ecoleParDefaut(ecoles)?.id ?? ecoles[0]?.id ?? ''
  })
  const [edition, setEdition] = useState(false)
  const ecole = ecoles.find((e) => e.id === ecoleId) ?? ecoles[0]
  const grille = horaire.grilles.find((g) => g.ecole_id === ecole?.id)
  const conflits = useMemo(() => chevauchements(horaire.grilles, horaire.cases), [horaire])
  const nomEcole = (id: string) => ecoles.find((e) => e.id === id)?.nom ?? 'École'
  const nomClasse = (id: string) => classes.find((c) => c.id === id)?.nom ?? 'Classe supprimée'
  const plusieursEcoles = horaire.grilles.filter((g) => horaire.cases.some((c) => c.ecole_id === g.ecole_id)).length > 1

  if (!ecole) return null

  return (
    <div className="carnet-mon-horaire">
      {ecoles.length > 1 && (
        <div className="carnet-onglets-classes" role="tablist" aria-label="École">
          {ecoles.map((e) => (
            <button
              key={e.id}
              type="button"
              role="tab"
              aria-selected={e.id === ecole.id}
              className="carnet-puce"
              onClick={() => {
                setEcoleId(e.id)
                setEdition(false)
              }}
            >
              {e.nom}
              <span className="carnet-puce-ecole">{horaire.grilles.some((g) => g.ecole_id === e.id) ? 'grille enregistrée' : 'pas encore de grille'}</span>
            </button>
          ))}
        </div>
      )}

      {conflits.length > 0 && (
        <div className="compte-encadre compte-erreur carnet-conflits" role="alert">
          <p>
            <strong>Chevauchement d'horaires entre tes écoles :</strong>
          </p>
          <ul>
            {conflits.map((c, i) => (
              <li key={i}>
                {JOURS_CAPITALE[c.jour - 1]} : {libelleCreneau(c.a)} à {nomEcole(c.a.ecole_id)} ({nomClasse(c.a.classe_id)}) et {libelleCreneau(c.b)} à {nomEcole(c.b.ecole_id)} (
                {nomClasse(c.b.classe_id)}).
              </li>
            ))}
          </ul>
        </div>
      )}

      {!grille || edition ? (
        <GrilleEcole
          key={`${ecole.id}-${grille ? 'edition' : 'nouvelle'}`}
          ecoleNom={ecole.nom}
          initiale={grille ? { ...grille } : GRILLE_EXEMPLE}
          existe={Boolean(grille)}
          occupe={occupe}
          casesHorsGrille={(g) => casesHorsGrille({ ...g, ecole_id: ecole.id }, horaire.cases)}
          heureZeroDisponible={horaire.heureZero}
          onEnregistrer={async (g) => {
            const hors = casesHorsGrille({ ...g, ecole_id: ecole.id }, horaire.cases).map((c) => c.id)
            if (await onEnregistrerGrille(ecole.id, g, Boolean(grille), hors)) setEdition(false)
          }}
          onAnnuler={grille ? () => setEdition(false) : undefined}
        />
      ) : (
        <div className="carnet-grille-resume">
          <p className="carnet-grille-texte">
            <strong>Grille de {ecole.nom} :</strong> {texteJournee(journee(grille))}
            {' · '}mercredi : {heuresDuMercredi(grille) === 0 ? 'pas de cours' : `H${premiereHeure(grille)} → H${heuresDuMercredi(grille)}`}
          </p>
          <div className="compte-actions">
            <button type="button" className="compte-bouton-secondaire" disabled={occupe} onClick={() => setEdition(true)}>
              Modifier la grille
            </button>
            <button
              type="button"
              className="compte-bouton-secondaire compte-danger"
              disabled={occupe}
              onClick={() => {
                if (window.confirm(`Retirer la grille de ${ecole.nom} et son horaire de la semaine ? Les séances déjà notées sont conservées.`)) onSupprimerGrille(ecole.id)
              }}
            >
              Retirer la grille
            </button>
          </div>
        </div>
      )}

      {grille && !edition && (
        <SemaineEcole
          key={ecole.id}
          ecole={ecole}
          grille={grille}
          cases={horaire.cases.filter((c) => c.ecole_id === ecole.id)}
          classes={classes.filter((c) => c.ecole_id === ecole.id)}
          occupe={occupe}
          onDefinirCase={onDefinirCase}
        />
      )}

      {plusieursEcoles && (
        <details className="carnet-details carnet-semaine-complete">
          <summary>Ma semaine complète (toutes mes écoles)</summary>
          <ul className="carnet-semaine-liste">
            {JOURS_CAPITALE.map((nom, i) => {
              const cr = creneauxSemaine(i + 1, horaire.grilles, horaire.cases)
              return (
                <li key={nom}>
                  <strong>{nom} :</strong>{' '}
                  {cr.length === 0
                    ? 'aucun cours'
                    : cr.map((c, k) => (
                        <span key={k} className="carnet-semaine-item">
                          {numerosCreneau(c)} {plage(c.debut, c.fin)} {nomClasse(c.classe_id)} <span className="carnet-puce-ecole">({nomEcole(c.ecole_id)})</span>
                          {k < cr.length - 1 ? ' · ' : ''}
                        </span>
                      ))}
                </li>
              )
            })}
          </ul>
        </details>
      )}
    </div>
  )
}

/** Horaire de la semaine d'UNE école : tableau jours × heures (écran large) ou un jour à la fois. */
function SemaineEcole({
  ecole,
  grille,
  cases,
  classes,
  occupe,
  onDefinirCase,
}: {
  ecole: Ecole
  grille: GrilleHoraire
  cases: CaseHoraire[]
  classes: Classe[]
  occupe: boolean
  onDefinirCase: (existante: CaseHoraire | undefined, saisie: SaisieCase) => Promise<boolean>
}) {
  const id = useId()
  const large = useEcranLarge()
  const [jourActif, setJourActif] = useState(() => {
    const j = new Date().getDay()
    return j >= 1 && j <= 5 ? j : 1
  })
  const jLundi = journee(grille, 1)
  const numerosMercredi = new Set(journee(grille, 3).heures.map((h) => h.numero))
  const caseDe = (jour: number, heure: number) => cases.find((c) => c.jour === jour && c.heure === heure && c.semaine === null)

  if (classes.length === 0) {
    return (
      <p className="compte-encadre" role="status">
        Ajoute d'abord une classe rattachée à <strong>{ecole.nom}</strong> (« Mes classes » → « Ajouter une classe ») pour remplir l'horaire de la semaine.
      </p>
    )
  }

  const choix = (jour: number, heure: number, etiquette: string) => {
    const c = caseDe(jour, heure)
    return (
      <select
        id={`${id}-${jour}-${heure}`}
        className={`carnet-case-horaire${c ? ' remplie' : ''}`}
        aria-label={etiquette}
        value={c?.classe_id ?? ''}
        disabled={occupe}
        onChange={(e) => void onDefinirCase(c, { ecole_id: ecole.id, jour, heure, classe_id: e.target.value || null })}
      >
        <option value="">—</option>
        {classes.map((k) => (
          <option key={k.id} value={k.id}>
            {k.nom}
          </option>
        ))}
        {c && !classes.some((k) => k.id === c.classe_id) && <option value={c.classe_id}>classe inconnue</option>}
      </select>
    )
  }

  return (
    <section className="carnet-semaine-bloc" aria-labelledby={`${id}-titre`}>
      <h3 id={`${id}-titre`}>Semaine — {ecole.nom}</h3>
      <p className="compte-aide">Une classe par heure (« — » : pas de cours). Deux heures qui se suivent avec la même classe forment une heure double : une seule séance à noter.</p>
      {grille.heure_zero && (
        <p className="compte-aide">
          H0 : choisis la classe si l'heure zéro est fixe ; laisse « — » si elle est ponctuelle (elle ne sera jamais comptée comme oubliée, et « Noter une séance » la propose quand même).
        </p>
      )}
      {large ? (
        <table className="carnet-semaine">
          <thead>
            <tr>
              <th scope="col">Heure</th>
              {JOURS_CAPITALE.map((j) => (
                <th key={j} scope="col">
                  {j}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {jLundi.heures.map((h) => {
              const pause = jLundi.pauses.find((p) => p.apres === h.numero)
              return [
                <tr key={`h${h.numero}`}>
                  <th scope="row">
                    H{h.numero}
                    <span className="carnet-semaine-plage">{plage(h.debut, h.fin)}</span>
                  </th>
                  {JOURS_CAPITALE.map((nomJour, i) => {
                    const jour = i + 1
                    if (jour === 3 && !numerosMercredi.has(h.numero))
                      return (
                        <td key={jour} className="carnet-semaine-sans">
                          <span aria-label={`Mercredi H${h.numero} : pas de cours`}>—</span>
                        </td>
                      )
                    return <td key={jour}>{choix(jour, h.numero, `${nomJour} H${h.numero} (${plage(h.debut, h.fin)})`)}</td>
                  })}
                </tr>,
                pause ? (
                  <tr key={`p${h.numero}`} className="carnet-semaine-pause">
                    <td colSpan={6}>
                      {LIBELLE_PAUSE[pause.type]} · {plage(pause.debut, pause.fin)}
                    </td>
                  </tr>
                ) : null,
              ]
            })}
          </tbody>
        </table>
      ) : (
        <>
          <div className="carnet-vues carnet-jours" role="tablist" aria-label="Jour">
            {JOURS_CAPITALE.map((j, i) => (
              <button key={j} type="button" role="tab" aria-selected={jourActif === i + 1} className="carnet-puce" onClick={() => setJourActif(i + 1)}>
                {j}
              </button>
            ))}
          </div>
          {(() => {
            const jj = journee(grille, jourActif)
            if (jj.heures.length === 0) return <p className="compte-vide">Pas de cours le {JOURS_SEMAINE[jourActif - 1]}.</p>
            return (
              <ul className="carnet-jour-liste">
                {jj.heures.map((h) => {
                  const pause = jj.pauses.find((p) => p.apres === h.numero)
                  const etiquette = `${JOURS_CAPITALE[jourActif - 1]} H${h.numero} (${plage(h.debut, h.fin)})`
                  return [
                    <li key={`h${h.numero}`} className="carnet-jour-ligne">
                      <label htmlFor={`${id}-${jourActif}-${h.numero}`}>
                        <strong>H{h.numero}</strong> <span className="carnet-semaine-plage">{plage(h.debut, h.fin)}</span>
                      </label>
                      {choix(jourActif, h.numero, etiquette)}
                    </li>,
                    pause ? (
                      <li key={`p${h.numero}`} className="carnet-jour-pause">
                        {LIBELLE_PAUSE[pause.type]} · {plage(pause.debut, pause.fin)}
                      </li>
                    ) : null,
                  ]
                })}
              </ul>
            )
          })()}
        </>
      )}
    </section>
  )
}
