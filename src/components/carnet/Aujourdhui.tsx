import { useId, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ajouterJours, jourIso } from '../../lib/calendrierFwb'
import { dateCourte, dateIso, dateLongue, progressionClasse, type Classe, type Seance } from '../../lib/carnet'
import { findChapter } from '../../content/chaptersIndex'
import { creneauPropose, creneauxOublies, depuisParDefaut, numerosCreneau, plage, seanceDuCreneau, LIBELLE_PAUSE, type CaseHoraire, type Creneau, type GrilleHoraire } from '../../lib/horaire'
import { ActionsSeance, CarteSeance, PastilleClasse } from './CarteSeance'
import type { Evenement } from '../../lib/agendaEvenements'
import { couleurClasse, useCarnet } from './contexteCarnet'
import { lignesDuJour } from './journeeCarnet'
import { avertissementsInterro, classesConcernees, interrosDuCreneau, motifCourt, predicatSuppression, texteAvertissement, texteBandeau, type CreneauSupprime } from '../../lib/agendaEvenements'
import { BandeauEvenement, IconeType, PuceType, RepereRemise } from './AgendaUi'
import { ResumeHeuresEffectives, titreChapitre } from './HeuresEffectives'
import { capitale, chapitreEnCours, dateAbregee, derniereFois, heureCourte, lireDepuisOubliees, memoriserDepuisOubliees, resumeSeance, texteReperes, trierRecentes } from './outilsCarnet'

const OUBLIEES_VISIBLES = 12

/** Jour de semaine précédent / suivant (les week-ends sont sautés). */
function jourOuvre(date: string, sens: 1 | -1): string {
  let d = ajouterJours(date, sens)
  for (let i = 0; i < 3 && jourIso(d) > 5; i++) d = ajouterJours(d, sens)
  return d
}

export function InvitationHoraire({ actif }: { actif: boolean }) {
  return (
    <div className="compte-encadre carnet-invitation" role="status">
      {actif ? (
        <>
          <p>
            <strong>Remplis ton horaire de la semaine.</strong> Le carnet te montrera alors les heures du jour, proposera la séance du créneau en cours, rappellera les séances
            oubliées et comptera les heures restantes avec chaque classe (congés de la Fédération Wallonie-Bruxelles exclus).
          </p>
          <Link className="compte-bouton" to="/carnet/horaire">
            Remplir mon horaire
          </Link>
        </>
      ) : (
        <p>
          <strong>Horaire pas encore activé</strong> (voir <Link to="/carnet/horaire">Mon horaire</Link>) : en attendant, note tes séances avec « Noter une séance ».
        </p>
      )}
    </div>
  )
}

/**
 * « Aujourd'hui » — page d'accueil du carnet : les heures du jour d'après l'horaire (H0 → H7,
 * récréation, midi), l'heure en cours encadrée, les séances notées cochées (« Copier pour
 * Smartschool » + menu « … »), « Noter la séance » sur les autres ; à côté : séances à rattraper,
 * « Où en sont mes classes » et les raccourcis. Sur téléphone, une carte « Maintenant » en tête.
 */
export function Aujourdhui({
  grilles,
  cases,
  seances,
  horaireActif,
  classeActive,
  maintenant,
  onNoter,
  onNoterLibre,
}: {
  grilles: GrilleHoraire[]
  cases: CaseHoraire[]
  seances: Seance[]
  horaireActif: boolean
  classeActive: string | null
  maintenant: Date
  onNoter: (c: Creneau) => void
  onNoterLibre: (classeId?: string, date?: string) => void
}) {
  const id = useId()
  const ctx = useCarnet()
  const { classes, ecoles } = ctx
  const aujourdhui = dateIso(maintenant)
  const minutesMaintenant = maintenant.getHours() * 60 + maintenant.getMinutes()
  const [date, setDate] = useState(aujourdhui)
  const jourValide = /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : aujourdhui
  const horaireRempli = grilles.some((g) => cases.some((c) => c.ecole_id === g.ecole_id))

  const agenda = ctx.ctxAgenda
  const jour = useMemo(() => lignesDuJour(jourValide, grilles, cases, agenda ? { evenements: agenda.evenements, classes: agenda.classes } : undefined), [jourValide, grilles, cases, agenda])
  const evenementsDuJour = ctx.agenda.actif ? ctx.agenda.evenements.filter((e) => e.du <= jourValide && jourValide <= e.au) : []
  const propose = jourValide === aujourdhui ? creneauPropose(jour.creneaux, minutesMaintenant) : null
  const seancesDuJour = seances.filter((s) => s.date_seance === jourValide)
  const horsHoraire = trierRecentes(seancesDuJour.filter((s) => !jour.creneaux.some((c) => seanceDuCreneau(c, [s]) !== null))).reverse()
  const classeDe = (cid: string) => classes.find((c) => c.id === cid)
  const nomEcole = (eid: string) => (ecoles.length > 1 ? ecoles.find((e) => e.id === eid)?.nom : undefined)

  const etat = jour.etat
  const messageJour =
    etat.type === 'weekend'
      ? 'Week-end : pas de cours.'
      : etat.type === 'conge'
        ? `Congé : ${etat.libelle} — pas de cours.`
        : etat.type === 'ete'
          ? 'Vacances d’été : pas de cours.'
          : jour.creneaux.length === 0 && jour.supprimes.length === 0
            ? 'Aucun cours ce jour-là dans ton horaire.'
            : null

  function statut(c: Creneau, s: Seance | null): 'note' | 'en-cours' | 'a-noter' | 'a-venir' {
    if (s) return 'note'
    if (jourValide === aujourdhui && c.debut <= minutesMaintenant && minutesMaintenant < c.fin) return 'en-cours'
    if (jourValide < aujourdhui || (jourValide === aujourdhui && c.fin <= minutesMaintenant)) return 'a-noter'
    return 'a-venir'
  }

  const LIBELLE: Record<string, string> = { 'en-cours': 'En cours', 'a-noter': 'À noter', 'a-venir': 'À venir' }

  function ligneCreneau(c: Creneau) {
    const s = seanceDuCreneau(c, seances)
    const st = statut(c, s)
    const classe = classeDe(c.classe_id)
    const ecole = nomEcole(c.ecole_id)
    const estPropose = propose === c
    const resume = s ? resumeSeance(s) : null
    const avant = s ? null : derniereFois(seances, c.classe_id, c.date, c.heureDebut)
    const details = s ? [s.generateurs.length > 0 ? `${s.generateurs.length} exercice${s.generateurs.length > 1 ? 's' : ''}` : '', s.devoir ? `Devoir : ${s.devoir}` : ''].filter(Boolean).join(' · ') : ''
    const interros = ctx.agenda.actif ? interrosDuCreneau(c, ctx.agenda.evenements) : []
    return (
      <li key={`${c.ecole_id}-${c.heureDebut}`} className={`carnet-heure ${st}${estPropose ? ' propose' : ''}`} aria-current={estPropose && st === 'en-cours' ? 'time' : undefined}>
        <span className="carnet-heure-num">
          {numerosCreneau(c)} <span className="carnet-heure-plage">{heureCourte(c.debut)}</span>
          <span className="carnet-sr"> à {heureCourte(c.fin)}</span>
        </span>
        <PastilleClasse classe={classe} />
        <div className="carnet-heure-texte">
          {resume ? (
            <>
              <span className="carnet-heure-titre">
                {resume.chapitre}
                {resume.sections.length > 0 && <> · {resume.sections.join(', ')}</>}
              </span>
              {details && <span className="carnet-heure-detail">{details}</span>}
            </>
          ) : (
            <span>
              <strong>{LIBELLE[st]}</strong>
              {estPropose && st !== 'en-cours' && <span className="compte-badge carnet-badge-proche">le plus proche</span>}
              {avant && <span className="carnet-heure-detail"> · dernière fois : {avant}</span>}
            </span>
          )}
          {ecole && <span className="carnet-puce-ecole">{ecole}</span>}
          {interros.map((e) => (
            <LigneInterro key={e.id} e={e} ecoleId={c.ecole_id} aujourdhui={aujourdhui} />
          ))}
        </div>
        <div className="carnet-heure-actions">
          {s ? (
            <>
              <span className="carnet-note-ok">✓ Noté</span>
              <ActionsSeance seance={s} avecOuvrir />
            </>
          ) : (
            <button type="button" className={`carnet-bouton${st === 'a-venir' ? '' : ' principal'}`} onClick={() => onNoter(c)}>
              Noter la séance<span className="carnet-sr"> — {classe?.nom}, {numerosCreneau(c)}</span>
            </button>
          )}
        </div>
      </li>
    )
  }

  /** Heure supprimée par un événement : barrée, « Pas cours — théâtre », jamais « Noter ». */
  function ligneSupprimee(x: CreneauSupprime) {
    const classe = classeDe(x.classe_id)
    const concernees = classesConcernees(x.evenement, classes).map((id) => classeDe(id)?.nom ?? '')
    const motif = x.accompagne
      ? `Pas cours — tu accompagnes ${x.evenement.toutes_classes ? 'les classes' : `${concernees.length > 1 ? 'les' : 'la'} ${concernees.join(', ')}`} : ${motifCourt(x.evenement)}`
      : `Pas cours — ${motifCourt(x.evenement)}`
    return (
      <li key={`s-${x.ecole_id}-${x.heureDebut}`} className="carnet-heure supprime">
        <span className="carnet-heure-num">
          {numerosCreneau(x)} <span className="carnet-heure-plage">{heureCourte(x.debut)}</span>
          <span className="carnet-sr"> à {heureCourte(x.fin)}</span>
        </span>
        <div className="carnet-heure-texte">
          <span className="carnet-heure-titre">
            <s>{classe?.nom}</s>
          </span>
          <span className="carnet-heure-detail">{motif}</span>
        </div>
        <div className="carnet-heure-actions">
          <button type="button" className="agenda-puce-bouton" onClick={() => ctx.ouvrirEvenement(x.evenement)} aria-label={`${motif}. Modifier l’événement`}>
            <PuceType type={x.evenement.type} />
          </button>
        </div>
      </li>
    )
  }

  const titre = capitale(dateLongue(jourValide).replace(/ \d{4}$/, ''))
  // Repères du jour affiché, seulement s'ils diffèrent de ceux du bandeau (aujourd'hui) : jamais doublés.
  const reperes = texteReperes(jourValide) === texteReperes(aujourdhui) ? '' : texteReperes(jourValide)
  const sProp = propose ? seanceDuCreneau(propose, seances) : null

  return (
    <div className="carnet-vue carnet-vue-jour">
      <section className="carnet-colonne" aria-labelledby={`${id}-titre`}>
        <div className="carnet-vue-tete">
          <div>
            {reperes && <p className="carnet-surtitre">{reperes}</p>}
            <h2 id={`${id}-titre`} className="carnet-titre-vue">
              {titre}
              {jourValide === aujourdhui && <span className="carnet-sr"> (aujourd’hui)</span>}
            </h2>
          </div>
          <div className="carnet-nav-periode" role="group" aria-label="Changer de jour">
            <button type="button" className="carnet-bouton" aria-label="Jour précédent" onClick={() => setDate(jourOuvre(jourValide, -1))}>
              <span aria-hidden="true">‹</span>
            </button>
            <button type="button" className="carnet-bouton" disabled={jourValide === aujourdhui} onClick={() => setDate(aujourdhui)}>
              Aujourd’hui
            </button>
            <button type="button" className="carnet-bouton" aria-label="Jour suivant" onClick={() => setDate(jourOuvre(jourValide, 1))}>
              <span aria-hidden="true">›</span>
            </button>
            <label className="carnet-date-autre">
              <span className="carnet-sr">Autre jour</span>
              <input type="date" value={jourValide} onChange={(e) => setDate(e.target.value || aujourdhui)} />
            </label>
            <button type="button" className="carnet-bouton principal agenda-bouton-evenement" onClick={() => ctx.nouvelEvenement({ du: jourValide, au: jourValide })}>
              <span aria-hidden="true">+</span> Événement
            </button>
          </div>
        </div>

        {evenementsDuJour.length > 0 && (
          <div className="agenda-bandeaux">
            {evenementsDuJour.map((e) => {
              const t = texteBandeau(e, jourValide, agenda ?? { grilles: [], cases: [], evenements: ctx.agenda.evenements, classes }, titreChapitre)
              return <BandeauEvenement key={e.id} e={e} titre={t.titre} suite={t.suite} onOuvrir={() => ctx.ouvrirEvenement(e)} />
            })}
          </div>
        )}

        {etat.type === 'inconnu' && (
          <p className="compte-aide carnet-a-confirmer" role="note">
            Calendrier FWB {etat.annee} à confirmer : ses congés ne sont pas encore dans le site.
          </p>
        )}

        {!horaireRempli ? (
          <InvitationHoraire actif={horaireActif} />
        ) : (
          <>
            {propose && jourValide === aujourdhui && (
              <section className={`carnet-maintenant${sProp ? ' note' : ''}`} aria-label="Maintenant">
                <p className="carnet-maintenant-tete">
                  {statut(propose, sProp) === 'en-cours' ? 'Maintenant' : 'Le plus proche'} · {numerosCreneau(propose)} {plage(propose.debut, propose.fin)}
                </p>
                <p className="carnet-maintenant-classe">
                  <PastilleClasse classe={classeDe(propose.classe_id)} />
                  <span>
                    {sProp
                      ? `✓ Noté : ${resumeSeance(sProp).chapitre}`
                      : (() => {
                          const a = derniereFois(seances, propose.classe_id, propose.date, propose.heureDebut)
                          return a ? `Dernière fois : ${a}` : 'Première séance notée de cette classe'
                        })()}
                  </span>
                </p>
                {sProp ? (
                  <ActionsSeance seance={sProp} avecOuvrir />
                ) : (
                  <button type="button" className="carnet-bouton principal carnet-bouton-large" onClick={() => onNoter(propose)}>
                    Noter la séance
                  </button>
                )}
              </section>
            )}
            {messageJour && <p className="compte-vide">{messageJour}</p>}
            {jour.lignes.length > 0 && (
              <ol className="carnet-heures" aria-label={`Heures du ${dateLongue(jourValide)}`}>
                {jour.lignes.map((l) =>
                  l.type === 'creneau' ? (
                    ligneCreneau(l.c)
                  ) : l.type === 'supprime' ? (
                    ligneSupprimee(l.s)
                  ) : l.type === 'pause' ? (
                    <li key={`p${l.p.apres}`} className="carnet-heure-pause">
                      {plage(l.p.debut, l.p.fin)} · {LIBELLE_PAUSE[l.p.type].toLowerCase()}
                    </li>
                  ) : (
                    <li key={`l${l.de.numero}`} className="carnet-heure libre">
                      <span className="carnet-heure-num">
                        {l.de.numero === l.a.numero ? `H${l.de.numero}` : `H${l.de.numero}–H${l.a.numero}`} <span className="carnet-heure-plage">{heureCourte(l.de.debut)}</span>
                      </span>
                      <span>Libre</span>
                    </li>
                  ),
                )}
              </ol>
            )}
          </>
        )}

        {ctx.agenda.actif &&
          ecoles
            .filter((e) => ctx.agenda.periodes.some((p) => p.ecole_id === e.id))
            .map((e) => (
              <RepereRemise
                key={e.id}
                ecoleId={e.id}
                nomEcole={ecoles.filter((x) => ctx.agenda.periodes.some((p) => p.ecole_id === x.id)).length > 1 ? e.nom : undefined}
                periodes={ctx.agenda.periodes}
                evenements={ctx.agenda.evenements}
                aujourdhui={aujourdhui}
              />
            ))}
        {horaireRempli && <ResumeHeuresEffectives maintenant={maintenant} />}

        {horsHoraire.length > 0 && (
          <section className="carnet-bloc" aria-labelledby={`${id}-hors`}>
            <h3 id={`${id}-hors`}>{horaireRempli ? 'Autres séances notées ce jour-là' : 'Séances notées ce jour-là'}</h3>
            <ul className="carnet-fil">
              {horsHoraire.map((s) => (
                <li key={s.id}>
                  <CarteSeance seance={s} titreId={`${id}-s-${s.id}`} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {classes.length > 0 && (
          <p className="carnet-action-libre">
            <button type="button" className="carnet-bouton" onClick={() => onNoterLibre(undefined, jourValide)}>
              + Noter une autre séance{jourValide !== aujourdhui ? ` le ${dateCourte(jourValide)}` : ''}
            </button>
          </p>
        )}
      </section>

      <aside className="carnet-cote" aria-label="En un coup d’œil">
        {horaireRempli && <Rattraper grilles={grilles} cases={cases} seances={seances} maintenant={maintenant} onNoter={onNoter} />}
        <OuEnSontMesClasses classes={classes} seances={seances} />
        <section className="carnet-carte" aria-labelledby={`${id}-docs`}>
          <h3 id={`${id}-docs`}>Documents</h3>
          <ul className="carnet-raccourcis">
            <li>
              <Link to="/carnet/agenda">Agenda d’une période (PDF ou Smartschool)</Link>
            </li>
            {(() => {
              const cid = propose?.classe_id ?? classeActive ?? classes[0]?.id
              const k = classes.find((c) => c.id === cid)
              return k ? (
                <li>
                  <Link to={`/carnet/classe/${k.id}#evaluation`}>Évaluation sur la matière vue ({k.nom})</Link>
                </li>
              ) : null
            })()}
            {horaireRempli && (
              <li>
                <Link to="/carnet/semaine#heures-restantes">Heures restantes avant le prochain congé</Link>
              </li>
            )}
          </ul>
        </section>
      </aside>
    </div>
  )
}

/** « À rattraper » : créneaux passés sans séance notée, depuis une date (mémorisée par appareil ;
 * par défaut les 14 derniers jours de classe), congés et week-ends FWB exclus. */
function Rattraper({ grilles, cases, seances, maintenant, onNoter }: { grilles: GrilleHoraire[]; cases: CaseHoraire[]; seances: Seance[]; maintenant: Date; onNoter: (c: Creneau) => void }) {
  const id = useId()
  const { classes, ctxAgenda } = useCarnet()
  const supprimee = useMemo(() => (ctxAgenda ? predicatSuppression(ctxAgenda) : undefined), [ctxAgenda])
  const aujourdhui = dateIso(maintenant)
  const minutesMaintenant = maintenant.getHours() * 60 + maintenant.getMinutes()
  const [depuisChoisi, setDepuisChoisi] = useState<string | null>(() => lireDepuisOubliees())
  const [toutes, setToutes] = useState(false)
  const depuisDefaut = depuisParDefaut(aujourdhui)
  const depuis = depuisChoisi && depuisChoisi <= aujourdhui ? depuisChoisi : depuisDefaut
  const oubliees = useMemo(
    () => creneauxOublies({ grilles, cases, seances, depuis, aujourdhui, maintenant: minutesMaintenant, supprimee }).filter((c) => c.date < aujourdhui || c.fin <= minutesMaintenant),
    [grilles, cases, seances, depuis, aujourdhui, minutesMaintenant, supprimee],
  )
  // Les créneaux d'aujourd'hui sont déjà dans la liste du jour : seulement les jours précédents ici.
  const passees = oubliees.filter((c) => c.date < aujourdhui)
  return (
    <section className="carnet-carte carnet-rattraper" aria-labelledby={`${id}-titre`}>
      <h3 id={`${id}-titre`}>
        À rattraper {passees.length > 0 && <span className="carnet-compteur">{passees.length}</span>}
      </h3>
      <p className={passees.length > 0 ? 'carnet-oubliees-compte' : 'compte-vide'} role="status">
        {passees.length === 0
          ? `Aucun créneau oublié depuis le ${dateCourte(depuis)}.`
          : `${passees.length} créneau${passees.length > 1 ? 'x' : ''} passé${passees.length > 1 ? 's' : ''} sans séance notée depuis le ${dateCourte(depuis)}.`}
      </p>
      {passees.length > 0 && (
        <ul className="carnet-rattraper-liste">
          {(toutes ? passees : passees.slice(0, OUBLIEES_VISIBLES)).map((c) => {
            const k = classes.find((x) => x.id === c.classe_id)
            return (
              <li key={`${c.date}-${c.ecole_id}-${c.heureDebut}`}>
                <PastilleClasse classe={k} petite />
                <span className="carnet-rattraper-quand">
                  {dateAbregee(c.date)} · {numerosCreneau(c)}
                </span>
                <button type="button" className="carnet-bouton" onClick={() => onNoter(c)}>
                  Noter<span className="carnet-sr"> — {k?.nom}, {dateAbregee(c.date)}, {numerosCreneau(c)}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
      {passees.length > OUBLIEES_VISIBLES && (
        <button type="button" className="compte-bouton-lien" onClick={() => setToutes(!toutes)}>
          {toutes ? 'Afficher moins' : `Afficher les ${passees.length}`}
        </button>
      )}
      <details className="carnet-details-discret">
        <summary>Depuis le {dateCourte(depuis)}</summary>
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
              className="carnet-bouton"
              onClick={() => {
                setDepuisChoisi(null)
                memoriserDepuisOubliees(null)
              }}
            >
              14 derniers jours de classe
            </button>
          )}
        </div>
        <p className="compte-aide">Week-ends, congés et jours fériés de la Fédération Wallonie-Bruxelles exclus ; une case ajoutée à l'horaire ne compte qu'à partir du jour de son ajout.</p>
      </details>
    </section>
  )
}

/** « Où en sont mes classes » : pour chaque classe, son chapitre en cours et les sections commencées. */
function OuEnSontMesClasses({ classes, seances }: { classes: Classe[]; seances: Seance[] }) {
  const id = useId()
  const lignes = classes.map((k) => {
    const cle = chapitreEnCours(k.id, seances)
    const [niveau, slug] = cle.split('/')
    const ch = cle ? findChapter(niveau, slug) : undefined
    if (!ch) return { k, ch: null, vues: 0, total: 0 }
    const p = progressionClasse(
      seances.filter((s) => s.classe_id === k.id),
      [ch],
    )[0]
    return { k, ch: p, vues: p.sections.filter((s) => s.vues > 0).length, total: p.sections.length }
  })
  return (
    <section className="carnet-carte" aria-labelledby={`${id}-titre`}>
      <h3 id={`${id}-titre`}>Où en sont mes classes</h3>
      {lignes.length === 0 ? (
        <p className="compte-vide">Aucune classe.</p>
      ) : (
        <ul className="carnet-avancements">
          {lignes.map(({ k, ch, vues, total }) => (
            <li key={k.id}>
              <Link to={`/carnet/classe/${k.id}`} className="carnet-avancement">
                <span className="carnet-avancement-texte">
                  <strong>{k.nom}</strong> · {ch ? ch.titre : 'aucune séance'}
                </span>
                {ch && (
                  <span className="carnet-avancement-compte">
                    {vues} / {total} §
                  </span>
                )}
              </Link>
              {ch && (
                <span className={`carnet-barre-classe carnet-c${couleurClasse(classes, k.id)}`} aria-hidden="true">
                  <span style={{ width: `${Math.round((100 * vues) / Math.max(1, total))}%` }} />
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/** « Interro · Suites » sur le créneau, avec l'avertissement éventuel (« ⚠ 2 jours pour corriger »). */
function LigneInterro({ e, ecoleId, aujourdhui }: { e: Evenement; ecoleId: string; aujourdhui: string }) {
  const ctx = useCarnet()
  const av = avertissementsInterro({ date: e.du, ecoleId, periodes: ctx.agenda.periodes, evenements: ctx.agenda.evenements, seuil: ctx.agenda.seuil, aujourdhui })
  return (
    <span className="agenda-interro-ligne">
      <button type="button" className="agenda-interro" onClick={() => ctx.ouvrirEvenement(e)}>
        <IconeType type="interrogation" taille={13} /> Interro{e.chapitre ? ` · ${titreChapitre(e.chapitre)}` : ''}
        <span className="carnet-sr"> — modifier</span>
      </button>
      {av.map((a) => (
        <span key={a.type} className={`agenda-mini-alerte ${a.type === 'apres' ? 'apres' : 'presse'}`}>
          <IconeType type="attention" taille={13} /> {texteAvertissement(a, e.du).court}
        </span>
      ))}
    </span>
  )
}
