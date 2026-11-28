import { PuceARendre } from './DevoirsARendre'
import { devoirsARendre } from '../../lib/carnetDevoirs'
import { useId, useMemo, useState, type ReactElement } from 'react'
import { Link } from 'react-router-dom'
import { ajouterJours } from '../../lib/calendrierFwb'
import { dateCourte, dateIso, type Seance } from '../../lib/carnet'
import { construireAgenda } from '../../lib/carnetAgenda'
import { agendaPeriodeHtml } from '../../lib/carnetFiche'
import { generatorLink } from '../../lib/generatorLink'
import { LIBELLE_PAUSE, numerosCreneau, plage, seanceDuCreneau, type CaseHoraire, type Creneau, type GrilleHoraire } from '../../lib/horaire'
import { lundiDe } from '../../lib/carnetAgenda'
import { CarteSeance } from './CarteSeance'
import { couleurClasse, useCarnet } from './contexteCarnet'
import { InvitationHoraire } from './Aujourdhui'
import { grilleSemaine, type CelluleSemaine, type JourSemaine, type RangeeSemaine } from './journeeCarnet'
import { capitale, dateAbregee, heureCourte, ouvrirFiche, resumeSeance, texteReperes, titreSemaine, trierRecentes, useEcranLarge } from './outilsCarnet'
import { Planification } from './Planification'
import { avertissementsInterro, dateCourteJour, evenementsEntre, interrosDuCreneau, motifCourt, predicatSuppression, quiTexte, texteAvertissement, titreEvenement, type Evenement } from '../../lib/agendaEvenements'
import { CarteRemise, IconeType, PuceType } from './AgendaUi'
import { TableauHeuresRestantes, titreChapitre } from './HeuresEffectives'
import { nomEvaluation } from '../../lib/evaluationAnnoncee'

const JOURS = ['Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.']
const JOURS_LONGS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi']

/**
 * « Ma semaine » : la grille de l'horaire (jours × heures, H0 comprise) comme un journal de classe
 * papier. Cases notées colorées par classe (clic : la séance s'ouvre), « à noter » en pointillés
 * (clic : « Noter une séance » pré-rempli), heures libres en pointillés légers, heures sans cours
 * et congés FWB grisés ; navigation d'une semaine à l'autre ; « Imprimer la semaine » (agenda de la
 * semaine). Sur téléphone : un jour à la fois. En dessous : les heures restantes avant le congé.
 */
export function MaSemaine({
  grilles,
  cases,
  seances,
  horaireActif,
  maintenant,
  dureeHeure,
  onNoter,
}: {
  grilles: GrilleHoraire[]
  cases: CaseHoraire[]
  seances: Seance[]
  horaireActif: boolean
  maintenant: Date
  dureeHeure: number
  onNoter: (c: Creneau) => void
}) {
  const id = useId()
  const ctx = useCarnet()
  const large = useEcranLarge()
  const aujourdhui = dateIso(maintenant)
  const minutesMaintenant = maintenant.getHours() * 60 + maintenant.getMinutes()
  const cetteSemaine = lundiDe(aujourdhui)
  const [lundi, setLundi] = useState(cetteSemaine)
  const [jourActif, setJourActif] = useState(() => {
    const i = Math.round((Date.parse(aujourdhui) - Date.parse(cetteSemaine)) / 86_400_000)
    return i >= 0 && i <= 4 ? i : 0
  })
  const vendredi = ajouterJours(lundi, 4)
  const horaireRempli = grilles.some((g) => cases.some((c) => c.ecole_id === g.ecole_id))
  const principale = ctx.ecoles.find((e) => e.par_defaut)?.id
  const agenda = ctx.ctxAgenda
  const grille = useMemo(
    () => grilleSemaine(lundi, grilles, cases, principale, agenda ? { evenements: agenda.evenements, classes: agenda.classes } : undefined),
    [lundi, grilles, cases, principale, agenda],
  )
  const evenementsSemaine = ctx.agenda.actif ? evenementsEntre(ctx.agenda.evenements, lundi, vendredi) : []
  // Bandeau d'un jour : événements sans heure de cours propre (pas les interros posées sur un créneau)
  // et remise des points de ce jour-là.
  const enTeteDuJour = (date: string) => {
    const evs = evenementsSemaine.filter((e) => e.du <= date && date <= e.au && !(e.type === 'interrogation' && !e.journee_entiere))
    const remises = ctx.agenda.actif ? ctx.agenda.periodes.filter((p) => p.remise === date) : []
    // Devoirs à rendre ce jour-là (0007).
    const devoirs = devoirsARendre(seances, date)
    return { evs, remises, devoirs }
  }
  const avecEnTetes = grille.jours.some((j) => {
    const t = enTeteDuJour(j.date)
    return t.evs.length > 0 || t.remises.length > 0 || t.devoirs.length > 0
  })
  const seancesSemaine = seances.filter((s) => s.date_seance >= lundi && s.date_seance <= vendredi)

  // Séances de la semaine qui ne correspondent à aucun créneau : placées dans une case libre de
  // leur numéro d'heure si possible, sinon listées sous la grille.
  const { libresOccupees, horsGrille } = useMemo(() => {
    const libres = new Map<string, Seance>()
    const hors: Seance[] = []
    for (const s of seancesSemaine) {
      const j = grille.jours.find((x) => x.date === s.date_seance)
      if (j && j.creneaux.some((c) => seanceDuCreneau(c, [s]))) continue
      const k = j && s.numero_heure !== null ? grille.rangees.findIndex((r) => r.type === 'heure' && r.numero === s.numero_heure) : -1
      const cle = `${s.date_seance}|${k}`
      if (j && k >= 0 && j.cellules[k]?.type === 'libre' && !libres.has(cle)) libres.set(cle, s)
      else hors.push(s)
    }
    return { libresOccupees: libres, horsGrille: trierRecentes(hors).reverse() }
  }, [seancesSemaine, grille])

  const statut = (c: Creneau, s: Seance | null) =>
    s ? 'note' : c.date === aujourdhui && c.debut <= minutesMaintenant && minutesMaintenant < c.fin ? 'en-cours' : c.date < aujourdhui || (c.date === aujourdhui && c.fin <= minutesMaintenant) ? 'a-noter' : 'a-venir'
  let notees = 0
  let aNoter = 0
  for (const j of grille.jours)
    for (const c of j.creneaux) {
      const st = statut(c, seanceDuCreneau(c, seances))
      if (st === 'note') notees++
      else if (st !== 'a-venir') aNoter++
    }
  notees += libresOccupees.size + horsGrille.length

  function imprimer() {
    const nomsEcoles = new Map(ctx.ecoles.map((e) => [e.id, e.nom]))
    const agenda = construireAgenda({
      seances,
      classes: ctx.classes,
      ecoles: nomsEcoles,
      du: lundi,
      au: vendredi,
      classeId: null,
      format: ctx.format,
      avecGrille: (k) => ctx.grilles.some((g) => g.ecole_id === k.ecole_id),
      dureeHeure: (k) => ctx.grilles.find((g) => g.ecole_id === k.ecole_id)?.duree_heure ?? dureeHeure,
      lienGenerateur: generatorLink,
      parClasse: false,
      aujourdhui,
    })
    if (!agenda.vide) ouvrirFiche(agendaPeriodeHtml(agenda, { remarques: false, liens: true, professeur: ctx.professeur }))
  }

  function contenuEnTete(date: string) {
    const { evs, remises, devoirs } = enTeteDuJour(date)
    if (evs.length === 0 && remises.length === 0 && devoirs.length === 0) return null
    return (
      <div className="agenda-entete-jour">
        {evs.map((e) => (
          <button key={e.id} type="button" className={`agenda-puce-jour agenda-t-${e.type}`} onClick={() => ctx.ouvrirEvenement(e)}>
            <IconeType type={e.type} taille={13} />
            <span>{e.type === 'interrogation' ? `${nomEvaluation(e.intitule)} · ${ctx.classes.find((c) => c.id === e.classe_id)?.nom ?? ''}` : titreEvenement(e)}</span>
          </button>
        ))}
        {remises.map((p) => (
          <span key={p.id} className="agenda-puce-jour agenda-remise-puce">
            <IconeType type="remise" taille={13} />
            <span>
              Remise des points P{p.numero}
              {ctx.ecoles.length > 1 ? ` · ${ctx.ecoles.find((e) => e.id === p.ecole_id)?.nom ?? ''}` : ''}
            </span>
          </span>
        ))}
        {devoirs.map((x) => (
          <PuceARendre key={x.id} seance={x} compacte avecResume={false} />
        ))}
      </div>
    )
  }

  /** Étiquettes des évaluations posées sur ce créneau : chacune est un BOUTON À PART (hors du bouton de la case,
   * jamais un bouton dans un bouton) qui ouvre la fiche de l'évaluation. */
  function lignesInterro(c: Creneau, nomJour: string) {
    const interros = ctx.agenda.actif ? interrosDuCreneau(c, ctx.agenda.evenements) : []
    return interros.map((e) => {
      const av = avertissementsInterro({ date: e.du, ecoleId: c.ecole_id, periodes: ctx.agenda.periodes, evenements: ctx.agenda.evenements, seuil: ctx.agenda.seuil, aujourdhui })
      const nom = nomEvaluation(e.intitule)
      const chap = e.chapitre ? titreChapitre(e.chapitre) : ''
      return (
        <button key={e.id} type="button" className="agenda-etiquette-eval" onClick={() => ctx.ouvrirFiche(e)} aria-label={`${nom}${chap ? ` · ${chap}` : ''}, ${nomJour} : ouvrir la fiche`}>
          <span>
            {nom}
            {chap ? ` · ${chap}` : ''} <span aria-hidden="true">›</span>
          </span>
          {av.map((a) => (
            <span key={a.type} className={`agenda-mini-alerte ${a.type === 'apres' ? 'apres' : 'presse'}`}>
              <IconeType type="attention" taille={12} /> {texteAvertissement(a, e.du).court}
            </span>
          ))}
        </button>
      )
    })
  }

  /** La case et, à côté, les étiquettes de ses évaluations. */
  function avecEtiquettes(c: Creneau, nomJour: string, bouton: ReactElement) {
    const etiquettes = lignesInterro(c, nomJour)
    if (etiquettes.length === 0) return bouton
    return (
      <div className="carnet-case-groupe">
        {bouton}
        {etiquettes}
      </div>
    )
  }

  function contenuCellule(j: JourSemaine, k: number, cel: CelluleSemaine, compact: boolean) {
    const nomJour = `${JOURS_LONGS[j.jour - 1]} ${Number(j.date.slice(8, 10))}`
    if (cel.type === 'supprime') {
      const x = cel.s
      const classe = ctx.classes.find((c) => c.id === x.classe_id)
      const quand = `${numerosCreneau(x)} ${plage(x.debut, x.fin)}`
      return (
        <button
          type="button"
          className="carnet-case-semaine supprime"
          onClick={() => ctx.ouvrirEvenement(x.evenement)}
          aria-label={`${classe?.nom}, ${nomJour}, ${quand} : pas cours — ${motifCourt(x.evenement)}${x.accompagne ? ' (tu accompagnes)' : ''}. Modifier l’événement`}
        >
          <s>{classe?.nom}</s>
          {compact && <span className="carnet-case-quand">{quand}</span>}
          <span className="carnet-case-resume">pas cours{compact ? ` — ${motifCourt(x.evenement)}` : ''}</span>
        </button>
      )
    }
    if (cel.type === 'creneau') {
      const c = cel.c
      const s = seanceDuCreneau(c, seances)
      const st = statut(c, s)
      const classe = ctx.classes.find((x) => x.id === c.classe_id)
      const couleur = couleurClasse(ctx.classes, c.classe_id)
      const quand = `${numerosCreneau(c)} ${plage(c.debut, c.fin)}`
      if (s) {
        const r = resumeSeance(s)
        return avecEtiquettes(
          c,
          nomJour,
          <button type="button" className={`carnet-case-semaine note carnet-c${couleur}`} onClick={() => ctx.voir(s)} aria-label={`${classe?.nom}, ${nomJour}, ${quand} : séance notée, ${r.chapitre} ${r.numeros}. Ouvrir`}>
            <strong>{classe?.nom}</strong>
            {compact && <span className="carnet-case-quand">{quand}</span>}
            <span className="carnet-case-resume">
              {r.chapitre}
              {r.numeros && ` · ${r.numeros}`}
            </span>
          </button>,
        )
      }
      return avecEtiquettes(
        c,
        nomJour,
        <button type="button" className={`carnet-case-semaine ${st} carnet-c${couleur}`} onClick={() => onNoter(c)} aria-label={`${classe?.nom}, ${nomJour}, ${quand} : ${st === 'a-venir' ? 'à venir' : st === 'en-cours' ? 'en cours' : 'à noter'}. Noter la séance`}>
          <strong>{classe?.nom}</strong>
          {compact && <span className="carnet-case-quand">{quand}</span>}
          <span className="carnet-case-resume">{st === 'a-venir' ? 'à venir · noter' : st === 'en-cours' ? 'en cours · Noter' : 'Noter'}</span>
        </button>,
      )
    }
    if (cel.type === 'libre') {
      const s = libresOccupees.get(`${j.date}|${k}`)
      if (!s) return compact ? <span className="carnet-case-vide">Libre</span> : null
      const classe = ctx.classes.find((x) => x.id === s.classe_id)
      const r = resumeSeance(s)
      return (
        <button type="button" className={`carnet-case-semaine note carnet-c${couleurClasse(ctx.classes, s.classe_id)}`} onClick={() => ctx.voir(s)} aria-label={`${classe?.nom}, ${nomJour} : séance notée hors horaire, ${r.chapitre}. Ouvrir`}>
          <strong>{classe?.nom}</strong>
          <span className="carnet-case-resume">
            {r.chapitre}
            {r.numeros && ` · ${r.numeros}`}
          </span>
        </button>
      )
    }
    if (cel.type === 'sans') return <span className="carnet-case-sans">pas de cours</span>
    if (cel.type === 'conge') return <span className="carnet-case-conge">{cel.etat.type === 'ete' ? 'Vacances d’été' : cel.etat.type === 'weekend' ? 'Week-end' : `Congé : ${cel.etat.libelle}`}</span>
    return null
  }

  const etiquetteRangee = (r: RangeeSemaine) =>
    r.type === 'heure' ? (
      <>
        H{r.numero} <span className="carnet-semaine-plage">{heureCourte(r.debut)}<span className="carnet-sr"> à {heureCourte(r.fin)}</span></span>
      </>
    ) : (
      <>
        {LIBELLE_PAUSE[r.p.type]} <span className="carnet-semaine-plage">{heureCourte(r.p.debut)}<span className="carnet-sr"> à {heureCourte(r.p.fin)}</span></span>
      </>
    )

  // Repères de la semaine affichée, seulement s'ils diffèrent de ceux du bandeau (aujourd'hui).
  const reperes = texteReperes(lundi) === texteReperes(aujourdhui) ? '' : texteReperes(lundi)
  const pret = seancesSemaine.length > 0

  return (
    <div className="carnet-vue carnet-vue-semaine">
      <section aria-labelledby={`${id}-titre`} className="carnet-colonne">
        <div className="carnet-vue-tete">
          <div>
            {reperes && <p className="carnet-surtitre">{reperes}</p>}
            <h2 id={`${id}-titre`} className="carnet-titre-vue">
              {titreSemaine(lundi)}
            </h2>
          </div>
          <div className="carnet-nav-periode" role="group" aria-label="Changer de semaine">
            {horaireRempli && (
              <p className="carnet-compte-semaine" role="status">
                <strong className="ok">
                  {notees} notée{notees > 1 ? 's' : ''}
                </strong>{' '}
                · <strong className="a-noter">{aNoter} à noter</strong>
              </p>
            )}
            <button type="button" className="carnet-bouton" aria-label="Semaine précédente" onClick={() => setLundi(ajouterJours(lundi, -7))}>
              <span aria-hidden="true">‹</span>
            </button>
            <button type="button" className="carnet-bouton" disabled={lundi === cetteSemaine} onClick={() => setLundi(cetteSemaine)}>
              Cette semaine
            </button>
            <button type="button" className="carnet-bouton" aria-label="Semaine suivante" onClick={() => setLundi(ajouterJours(lundi, 7))}>
              <span aria-hidden="true">›</span>
            </button>
            {/* « Aujourd'hui » du carnet (heures du jour, à rattraper) : depuis la réorganisation de l'espace
             * professeur, `/carnet` est la vue d'ensemble des classes ; la journée vit sur `/carnet/aujourdhui`. */}
            <Link className="carnet-bouton" to="/carnet/aujourdhui">
              Aujourd'hui en détail
            </Link>
            <button type="button" className="carnet-bouton" disabled={!pret} onClick={imprimer} title={pret ? undefined : 'Aucune séance notée cette semaine'}>
              Imprimer la semaine
            </button>
            <button
              type="button"
              className="carnet-bouton principal agenda-bouton-evenement"
              onClick={() => {
                const d = lundi <= aujourdhui && aujourdhui <= vendredi ? aujourdhui : lundi
                ctx.nouvelEvenement({ du: d, au: d })
              }}
            >
              <span aria-hidden="true">+</span> Événement
            </button>
          </div>
        </div>

        {!horaireRempli ? (
          <InvitationHoraire actif={horaireActif} />
        ) : large ? (
          <div className="carnet-semaine-cadre">
            <table className="carnet-grille-semaine">
              <caption className="carnet-sr">Horaire et séances de la {titreSemaine(lundi).toLowerCase()}</caption>
              <thead>
                <tr>
                  <td />
                  {grille.jours.map((j, i) => (
                    <th key={j.date} scope="col" className={j.date === aujourdhui ? 'aujourdhui' : undefined}>
                      {JOURS[i]} {Number(j.date.slice(8, 10))}
                      {j.date === aujourdhui && <span className="carnet-aujourdhui"> · aujourd’hui</span>}
                    </th>
                  ))}
                </tr>
                {avecEnTetes && (
                  <tr className="agenda-rangee-entetes">
                    <td />
                    {grille.jours.map((j) => (
                      <td key={j.date}>{contenuEnTete(j.date)}</td>
                    ))}
                  </tr>
                )}
              </thead>
              <tbody>
                {grille.rangees.map((r, k) => (
                  <tr key={r.type === 'heure' ? `h${r.numero}` : `p${r.p.apres}`} className={r.type === 'pause' ? 'pause' : undefined}>
                    <th scope="row">{etiquetteRangee(r)}</th>
                    {grille.jours.map((j) => {
                      const cel = j.cellules[k]
                      if (cel === null) return null
                      const span = 'span' in cel ? cel.span : 1
                      return (
                        <td key={j.date} rowSpan={span > 1 ? span : undefined} className={`carnet-td-${cel.type}${cel.type === 'libre' && libresOccupees.has(`${j.date}|${k}`) ? ' occupee' : ''}`}>
                          {contenuCellule(j, k, cel, false)}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <>
            <div className="carnet-jours-onglets" role="tablist" aria-label="Jour">
              {grille.jours.map((j, i) => (
                <button
                  key={j.date}
                  type="button"
                  role="tab"
                  id={`${id}-onglet-${i}`}
                  aria-selected={jourActif === i}
                  aria-controls={`${id}-jour`}
                  className="carnet-jour-onglet"
                  onClick={() => setJourActif(i)}
                >
                  {JOURS[i]}
                  <span>{Number(j.date.slice(8, 10))}</span>
                </button>
              ))}
            </div>
            {(() => {
              const j = grille.jours[jourActif]
              return (
                <div role="tabpanel" id={`${id}-jour`} aria-labelledby={`${id}-onglet-${jourActif}`}>
                  <p className="carnet-jour-titre">
                    {capitale(dateAbregee(j.date))}
                    {j.date === aujourdhui && ' · aujourd’hui'}
                  </p>
                  {contenuEnTete(j.date)}
                  {j.cellules[0]?.type === 'conge' ? (
                    <p className="carnet-case-conge seul">{contenuCellule(j, 0, j.cellules[0], true)}</p>
                  ) : (
                    <ul className="carnet-semaine-jour">
                      {grille.rangees.map((r, k) => {
                        const cel = j.cellules[k]
                        if (cel === null) return null
                        if (cel.type === 'pause')
                          return (
                            <li key={k} className="pause">
                              {etiquetteRangee(r)}
                            </li>
                          )
                        return (
                          <li key={k} className={`carnet-li-${cel.type}`}>
                            <span className="carnet-semaine-heure">{r.type === 'heure' ? etiquetteRangee(r) : null}</span>
                            {contenuCellule(j, k, cel, true)}
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
              )
            })()}
          </>
        )}

        {horsGrille.length > 0 && (
          <section className="carnet-bloc" aria-labelledby={`${id}-hors`}>
            <h3 id={`${id}-hors`}>{horaireRempli ? 'Autres séances notées cette semaine' : 'Séances notées cette semaine'}</h3>
            <ul className="carnet-fil">
              {horsGrille.map((s) => (
                <li key={s.id}>
                  <CarteSeance seance={s} compacte={horaireRempli} titreId={`${id}-s-${s.id}`} />
                </li>
              ))}
            </ul>
          </section>
        )}
        {!horaireRempli && seancesSemaine.length === 0 && <p className="compte-vide">Aucune séance notée du {dateCourte(lundi)} au {dateCourte(vendredi)}.</p>}

        {horaireRempli && (
          <p className="compte-aide carnet-legende">
            Clic sur une case notée : la séance s'ouvre (copier pour Smartschool, fiche, modifier). Clic sur « Noter » : le panneau « Noter une séance » s'ouvre, classe, date et
            heure déjà remplies. Les congés du calendrier de la Fédération Wallonie-Bruxelles grisent les jours concernés.
          </p>
        )}
      </section>

      {ctx.agenda.actif && (
        <aside className="carnet-cote agenda-cote-semaine" aria-label="Agenda de la semaine">
          {horaireRempli && <TableauHeuresRestantes maintenant={maintenant} />}
          {ctx.ecoles.map((e) => (
            <CarteRemise
              key={e.id}
              ecoleId={e.id}
              nomEcole={ctx.ecoles.filter((x) => ctx.agenda.periodes.some((p) => p.ecole_id === x.id)).length > 1 ? e.nom : undefined}
              periodes={ctx.agenda.periodes}
              aujourdhui={aujourdhui}
            />
          ))}
          <section className="carnet-carte agenda-evenements-semaine" aria-labelledby={`${id}-evs`}>
            <h3 id={`${id}-evs`} className="agenda-surtitre">
              Événements de la semaine
            </h3>
            {evenementsSemaine.length === 0 ? (
              <p className="compte-vide">Aucun événement cette semaine.</p>
            ) : (
              <ul>
                {evenementsSemaine.map((e) => (
                  <LigneEvenementSemaine key={e.id} e={e} />
                ))}
              </ul>
            )}
          </section>
        </aside>
      )}

      {horaireRempli && (
        <div id="heures-restantes" className="carnet-restantes-bloc">
          <Planification grilles={grilles} cases={cases} classes={ctx.classes} maintenant={maintenant} supprimee={agenda ? predicatSuppression(agenda) : undefined} />
        </div>
      )}
    </div>
  )
}

/** « Journée pédagogique — lun. 7/12 · toutes les classes », « Interrogation — mer. 9/12 · 5e B · Suites ». */
function LigneEvenementSemaine({ e }: { e: Evenement }) {
  const ctx = useCarnet()
  const noms = quiTexte(e, ctx.classes)
  const quoi = e.type === 'interrogation' ? [nomEvaluation(e.intitule), e.chapitre ? titreChapitre(e.chapitre) : ''].filter(Boolean).join(' · ') : e.intitule.trim()
  return (
    <li>
      <button type="button" className="agenda-a-venir-ligne colonne" onClick={() => ctx.ouvrirEvenement(e)}>
        <PuceType type={e.type} />
        <span>{[e.du === e.au ? dateCourteJour(e.du) : `${dateCourteJour(e.du)} → ${dateCourteJour(e.au)}`, noms, quoi].filter(Boolean).join(' · ')}</span>
      </button>
    </li>
  )
}
