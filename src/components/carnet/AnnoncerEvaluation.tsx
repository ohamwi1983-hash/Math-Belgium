import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { RichText } from '../Math'
import { BandeauEspace } from '../compte/BandeauEspace'
import { findChapter, LEVELS } from '../../content/chaptersIndex'
import { dateIso, generateursChapitre, structureChapitre, texteBrut, type Classe, type Seance } from '../../lib/carnet'
import { avertissementsInterro, predicatSuppression, type Evenement } from '../../lib/agendaEvenements'
import { ajouterJours } from '../../lib/calendrierFwb'
import { dateCourteDevoir, htmlAgenda, INTITULE_BILAN, prochainsCours, texteAgenda, type ProchainCours } from '../../lib/carnetDevoirs'
import { creneauxDuJour, type CaseHoraire, type GrilleHoraire } from '../../lib/horaire'
import { erreursAnnonce, etatsEtapes, heureCourteCreneau, nouvelleSeanceSupport, seanceAvecAnnonce, type EtatEtape, type QuoiAnnonce, type SaisieAnnonce } from '../../lib/annonceClasse'
import { lienPlanRevision } from '../../lib/planRevisionStockage'
import { chapitresDansMonOrdre, numeroRepere, ordreCourant } from '../../lib/ordreChapitres'
import { titreCourtChapitre } from '../../entrainement/export/examen'
import { AvertissementsInterro, MessageAgendaInactif } from './AgendaUi'
import { MessageDevoirsInactif } from './FormulaireSeance'
import { donneesTexte, useCarnet } from './contexteCarnet'
import { chapitreParDefaut } from './outilsCarnet'
import { generateursEvaluation, useTableProcessus, type GenerateurEvaluation } from './processusCarnet'
import './annonce.css'

/** État de la page des élèves de la classe (0010) et ce qu'elle publie. */
export interface EtatPageEleves {
  etat: 'publiee' | 'coupee' | 'aucune' | 'inactive'
  interros: boolean
  devoirs: boolean
}

/** Textes copiés pour le journal de classe / Smartschool (copie lancée par le carnet AVANT l'enregistrement). */
export interface TextesAnnonce {
  texte: string
  html: string
}

const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
const jourSemaine = (iso: string) => new Date(`${iso}T12:00:00Z`).getUTCDay()
const ecart = (a: string, b: string) => Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / 864e5)
/** « mardi 2/12 ». */
const jourCourt = (iso: string) => `${JOURS[jourSemaine(iso)]} ${Number(iso.slice(8, 10))}/${Number(iso.slice(5, 7))}`

/** « vue jeudi » (cette semaine), « vue le 12/11 », « commencée le 12/11 », « pas encore vue ». */
function texteEtat(e: EtatEtape | undefined, aujourdhui: string): string {
  if (!e || e.etat === 'pas-vue') return 'pas encore vue'
  const n = ecart(e.date, aujourdhui)
  const quand = n <= 0 ? "aujourd'hui" : n === 1 ? 'hier' : n < 7 ? JOURS[jourSemaine(e.date)] : `le ${Number(e.date.slice(8, 10))}/${Number(e.date.slice(5, 7))}`
  return e.etat === 'vue' ? `vue ${quand}` : `commencée ${quand}`
}

/** « dans 5 jours », « demain ». */
function dans(date: string, aujourdhui: string): string {
  const n = ecart(aujourdhui, date)
  return n <= 0 ? "aujourd'hui" : n === 1 ? 'demain' : `dans ${n} jours`
}

/** « étapes 1, 2, 3 » / « étape 2 ». */
function texteNumeros(numeros: number[]): string {
  return numeros.length === 1 ? `étape ${numeros[0]}` : `étapes ${numeros.join(', ')}`
}

/** Nom d'un générateur de l'évaluation : libellé de la table, sinon titre de la carte du cours, sinon nom du document. */
function libelleGenerateur(g: GenerateurEvaluation, cartes: { id: string; titre: string }[]): string {
  return g.libelle || cartes.find((c) => c.id === g.generatorId)?.titre || g.nom
}

/**
 * « Annoncer une évaluation » / « Donner un devoir » (`/carnet/annoncer?classe=<id>&quoi=devoir&chapitre=<niveau>/<slug>`) :
 * un seul composant, trois étapes sur un écran (maquette « annonce » validée le 27/11/2026) — Quand (prochaines
 * heures de la classe d'après l'horaire, ou une autre date), Sur quoi (chapitre, étapes « vue jeudi » / « pas encore
 * vue », exercices proposés d'après les étapes cochées), Publier (page des élèves, agenda avec rappel J−7 et J−2,
 * texte à copier) ; à droite « Ce que verront tes élèves ». Les écritures sont faites par le carnet
 * (`CarnetPage::annoncer`, tables existantes, voir `lib/annonceClasse.ts`).
 */
export function AnnoncerEvaluation({
  classes,
  seances,
  horaire,
  quoi,
  classeInitiale,
  chapitreInitial,
  pageEleves,
  occupe,
  maintenant,
  onAnnoncer,
}: {
  classes: Classe[]
  seances: Seance[]
  horaire: { grilles: GrilleHoraire[]; cases: CaseHoraire[] } | null
  quoi: QuoiAnnonce
  classeInitiale: string | null
  chapitreInitial: string | null
  pageEleves: (classeId: string) => EtatPageEleves
  occupe: boolean
  maintenant: Date
  onAnnoncer: (a: SaisieAnnonce, o: { textes: TextesAnnonce | null; preparer: boolean }) => void
}) {
  const id = useId()
  const ctx = useCarnet()
  const aujourdhui = dateIso(maintenant)
  const evaluation = quoi === 'evaluation'
  const [classeId, setClasseId] = useState(() => (classes.some((c) => c.id === classeInitiale) ? (classeInitiale as string) : (classes[0]?.id ?? '')))
  const classe = classes.find((c) => c.id === classeId)
  const chapitreDe = (k: string) => {
    const demande = chapitreInitial && k === classeInitiale ? chapitreInitial : ''
    const [n, s] = demande.split('/')
    return n && s && findChapter(n, s) ? demande : chapitreParDefaut(k, classes, seances)
  }
  const [chapitreCle, setChapitreCle] = useState(() => chapitreDe(classeId))
  const [niveau, slug] = chapitreCle.split('/')
  const chapitre = niveau && slug ? findChapter(niveau, slug) : undefined
  const structure = useMemo(() => (chapitre ? structureChapitre(chapitre) : []), [chapitre])
  const etats = useMemo(() => (chapitre && classeId ? etatsEtapes(seances, classeId, chapitre) : new Map<string, EtatEtape>()), [seances, classeId, chapitre])

  // Quand : les trois prochains cours de la classe (horaire, congés FWB, heures supprimées par l'agenda).
  const cours = useMemo<ProchainCours[]>(
    () => (horaire && classeId ? prochainsCours({ classeId, apres: aujourdhui, grilles: horaire.grilles, cases: horaire.cases, evenements: ctx.agenda.actif ? ctx.agenda.evenements : [], classes, n: 3 }) : []),
    [horaire, classeId, aujourdhui, ctx.agenda, classes],
  )
  const cleCours = (c: ProchainCours) => `${c.date}|${c.creneau.heureDebut}-${c.creneau.heureFin}`
  const choixDepart = (liste: ProchainCours[]) => (evaluation ? (liste.find((c) => ecart(aujourdhui, c.date) >= 5) ?? null) : (liste[0] ?? null))
  const [quand, setQuand] = useState<string>(() => {
    const c = choixDepart(cours)
    return c ? cleCours(c) : 'autre'
  })
  const [autreDate, setAutreDate] = useState(() => (evaluation ? ajouterJours(aujourdhui, 7) : ''))
  const [autreHeure, setAutreHeure] = useState('')
  const coursChoisi = cours.find((c) => cleCours(c) === quand)
  const date = coursChoisi ? coursChoisi.date : autreDate
  const heures = coursChoisi ? { debut: coursChoisi.creneau.heureDebut, fin: coursChoisi.creneau.heureFin } : autreHeure ? { debut: Number(autreHeure.split('-')[0]), fin: Number(autreHeure.split('-')[1]) } : null
  // « Autre date » d'une évaluation : les heures de la classe ce jour-là (facultatif).
  const creneauxAutre = useMemo(() => {
    if (!evaluation || !horaire || !classeId || coursChoisi || !/^\d{4}-\d{2}-\d{2}$/.test(autreDate)) return []
    const supprimee = ctx.ctxAgenda ? predicatSuppression(ctx.ctxAgenda) : undefined
    return creneauxDuJour(autreDate, horaire.grilles, horaire.cases.filter((c) => c.classe_id === classeId), { supprimee }).creneaux
  }, [evaluation, horaire, classeId, coursChoisi, autreDate, ctx.ctxAgenda])

  // Sur quoi : étapes vues ou commencées cochées d'office (devoir : la dernière touchée).
  const etapesDepart = (e: Map<string, EtatEtape>) => {
    const touchees = structure.filter((s) => e.get(s.id)?.etat !== 'pas-vue').map((s) => s.id)
    return new Set(evaluation ? touchees : touchees.slice(-1))
  }
  const [etapes, setEtapes] = useState<Set<string>>(() => etapesDepart(etats))
  const [bilan, setBilan] = useState(false)
  const [consigne, setConsigne] = useState('')
  const [copier, setCopier] = useState(false)
  const [tentative, setTentative] = useState(0)
  const racine = useRef<HTMLDivElement>(null)

  // Exercices : évaluation = table du panneau des évaluations (chargée à part), devoir = cartes « S'entraîner ».
  const tablePrete = useTableProcessus()
  const cartes = useMemo(() => (chapitre ? generateursChapitre(chapitre).map((g) => ({ id: g.id, titre: texteBrut(g.titre), sectionId: g.sectionId })) : []), [chapitre])
  const gensEval = useMemo(() => (chapitre && tablePrete ? generateursEvaluation(chapitre.slug) : null), [chapitre, tablePrete])
  const proposes = useMemo(() => {
    const ordre = structure.filter((s) => etapes.has(s.id)).map((s) => s.id)
    if (evaluation) {
      if (!gensEval) return null
      return ordre.flatMap((sid) => gensEval.filter((g) => g.sectionId === sid)).map((g) => ({ id: g.generatorId, titre: texteBrut(libelleGenerateur(g, cartes)) }))
    }
    return ordre.flatMap((sid) => cartes.filter((g) => g.sectionId === sid)).map((g) => ({ id: g.id, titre: g.titre }))
  }, [structure, etapes, evaluation, gensEval, cartes])
  // Évaluation : tous proposés retenus, on garde ceux que le professeur décoche ; devoir : ceux qu'il coche (tous au départ).
  const [decoches, setDecoches] = useState<Set<string>>(() => new Set())
  const retenus = (proposes ?? []).filter((g) => !decoches.has(g.id)).map((g) => g.id)

  function changerClasse(k: string) {
    setClasseId(k)
    const cle = chapitreDe(k)
    setChapitreCle(cle)
    const [n, s] = cle.split('/')
    const c = n && s ? findChapter(n, s) : undefined
    setEtapes(c ? new Set(etapesDeChapitre(c, k)) : new Set())
    setDecoches(new Set())
    setQuand('auto')
  }

  function etapesDeChapitre(c: NonNullable<typeof chapitre>, k: string): string[] {
    const e = etatsEtapes(seances, k, c)
    const touchees = structureChapitre(c).filter((s) => e.get(s.id)?.etat !== 'pas-vue').map((s) => s.id)
    return evaluation ? touchees : touchees.slice(-1)
  }

  function changerChapitre(cle: string) {
    setChapitreCle(cle)
    const [n, s] = cle.split('/')
    const c = n && s ? findChapter(n, s) : undefined
    setEtapes(c ? new Set(etapesDeChapitre(c, classeId)) : new Set())
    setDecoches(new Set())
  }

  // Changement de classe : premier choix de date recalculé quand les cours de la nouvelle classe sont là.
  useEffect(() => {
    if (quand !== 'auto') return
    const c = choixDepart(cours)
    setQuand(c ? cleCours(c) : 'autre')
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seulement après un changement de classe
  }, [quand, cours])

  const saisie: SaisieAnnonce = {
    quoi,
    classeId,
    niveau: chapitre?.levelSlug ?? '',
    chapitre: chapitre?.slug ?? '',
    date: date ?? '',
    heureDebut: evaluation && heures ? heures.debut : null,
    heureFin: evaluation && heures ? heures.fin : null,
    bilan: evaluation && bilan,
    etapes: structure.filter((s) => etapes.has(s.id)).map((s) => s.id),
    // Évaluation : tout retenu = liste vide (règle de 0008 : vide = tous ceux des étapes).
    generateurs: evaluation ? (proposes && retenus.length < proposes.length ? retenus : []) : retenus,
    consigne,
  }
  // Erreurs montrées après une première tentative, puis tenues à jour pendant la correction.
  const erreurs: ReturnType<typeof erreursAnnonce> = tentative > 0 ? erreursAnnonce(saisie, aujourdhui) : {}
  const numerosChoisis = structure.filter((s) => etapes.has(s.id)).map((s) => s.numero)
  const titreChapitre = chapitre ? titreCourtChapitre(chapitre.slug, texteBrut(chapitre.title)) : ''
  const nature = evaluation ? (bilan ? 'Contrôle-bilan' : 'Interro') : 'Devoir'
  const dateValide = /^\d{4}-\d{2}-\d{2}$/.test(saisie.date)
  const avertissements =
    evaluation && classe && ctx.agenda.actif && dateValide
      ? avertissementsInterro({ date: saisie.date, ecoleId: classe.ecole_id, periodes: ctx.agenda.periodes, evenements: ctx.agenda.evenements, seuil: ctx.agenda.seuil, aujourdhui })
      : []
  const page = classeId ? pageEleves(classeId) : { etat: 'inactive' as const, interros: false, devoirs: false }
  const lienPlan =
    evaluation && chapitre && dateValide
      ? lienPlanRevision({ date: saisie.date, niveau: chapitre.levelSlug, chapitre: chapitre.slug, etapes: saisie.etapes, generateurs: retenus, bilan: saisie.bilan })
      : null
  const bloque = evaluation ? !ctx.agenda.actif : false

  // Texte pour le journal de classe / Smartschool : celui du carnet (rubriques du professeur), réduit à l'annonce.
  const textes = useMemo<TextesAnnonce | null>(() => {
    if (!classe || !chapitre || (evaluation && !dateValide)) return null
    const base = nouvelleSeanceSupport(saisie, aujourdhui, maintenant.getHours() * 60 + maintenant.getMinutes(), null)
    const seance: Seance = { ...seanceAvecAnnonce({ ...base, heure_debut: null }, saisie, null), id: '', cree_le: '', modifie_le: '' } as Seance
    const evenement: Evenement | null = evaluation
      ? { id: '', cree_le: '', ecole_id: classe.ecole_id, type: 'interrogation', intitule: saisie.bilan ? INTITULE_BILAN : '', du: saisie.date, au: saisie.date, journee_entiere: saisie.heureDebut === null, heure_debut: saisie.heureDebut, heure_fin: saisie.heureFin, toutes_classes: false, accompagne: false, classe_id: classe.id, chapitre: `${chapitre.levelSlug}/${chapitre.slug}`, classes: [] }
      : null
    const d = { ...donneesTexte(ctx, seance, classe, { evenement }), parties: [], entrainement: [], processus: [], transversales: [], objectif: '', sansVu: true }
    return { texte: texteAgenda(d, ctx.texte.rubriques), html: htmlAgenda(d, ctx.texte.rubriques) }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- recalculé quand la saisie change
  }, [classe, chapitre, JSON.stringify(saisie), ctx.texte.rubriques, ctx.agenda])

  function envoyer(preparer: boolean) {
    const e = erreursAnnonce(saisie, aujourdhui)
    setTentative((n) => n + 1)
    if (Object.keys(e).length > 0 || bloque || !classe || !chapitre) return
    onAnnoncer(saisie, { textes: copier ? textes : null, preparer })
  }

  useEffect(() => {
    if (tentative === 0) return
    racine.current?.querySelector<HTMLElement>('[aria-invalid="true"], .annonce-erreur')?.focus()
  }, [tentative])

  const etape = !dateValide ? 1 : saisie.etapes.length === 0 && evaluation ? 2 : 3
  const niveauxOrdonnes = classe?.niveau ? [...LEVELS.filter((l) => l.slug === classe.niveau), ...LEVELS.filter((l) => l.slug !== classe.niveau)] : LEVELS
  const titre = evaluation ? 'Annoncer une évaluation' : 'Donner un devoir'

  const etapesTete = (
    <ol className="annonce-etapes" aria-label="Étapes">
      {['Quand', 'Sur quoi', 'Publier'].map((t, i) => (
        <li key={t} className={i + 1 === etape ? 'actuelle' : i + 1 < etape ? 'faite' : ''} aria-current={i + 1 === etape ? 'step' : undefined}>
          <span className="annonce-etape-num" aria-hidden="true">
            {i + 1}
          </span>
          {t}
        </li>
      ))}
    </ol>
  )

  return (
    <div className="annonce" ref={racine}>
      <BandeauEspace
        titreId={`${id}-titre`}
        surtitre={classe ? `Mes classes › ${classe.nom}` : 'Mes classes'}
        titre={titre}
        icone={null}
        apresTitre={
          <p className="ep-phrase">
            {evaluation ? 'Trois étapes : le jour, la matière, puis où la publier.' : 'Trois étapes : pour quand, sur quoi, puis où le publier.'}{' '}
            <Link to={`/carnet/annoncer?classe=${encodeURIComponent(classeId)}${evaluation ? '&quoi=devoir' : ''}`} replace>
              {evaluation ? 'Plutôt donner un devoir ›' : 'Plutôt annoncer une évaluation ›'}
            </Link>
          </p>
        }
        fin={etapesTete}
      />

      <div className="annonce-grille">
        <section className="ep-carte annonce-carte" aria-labelledby={`${id}-quand`}>
          {classes.length > 1 && (
            <div className="compte-champ annonce-classe">
              <label htmlFor={`${id}-classe`}>Classe</label>
              <select id={`${id}-classe`} value={classeId} onChange={(e) => changerClasse(e.target.value)}>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nom}
                  </option>
                ))}
              </select>
            </div>
          )}

          <fieldset className="annonce-groupe">
            <legend id={`${id}-quand`} className="annonce-question">
              {evaluation ? 'Quand ?' : 'Pour quand ?'}
            </legend>
            <div className="annonce-puces">
              {cours.map((c) => (
                <label key={cleCours(c)} className={`annonce-puce${quand === cleCours(c) ? ' actif' : ''}`}>
                  <input type="radio" name={`${id}-quand`} className="carnet-sr" checked={quand === cleCours(c)} onChange={() => setQuand(cleCours(c))} />
                  {dateCourteDevoir(c.date)} · {heureCourteCreneau(c.creneau.heureDebut, c.creneau.heureFin)}
                </label>
              ))}
              <label className={`annonce-puce${quand === 'autre' ? ' actif' : ''}`}>
                <input type="radio" name={`${id}-quand`} className="carnet-sr" checked={quand === 'autre'} onChange={() => setQuand('autre')} />
                autre date…
              </label>
            </div>
            <p className="annonce-aide">
              {cours.length > 0
                ? `Proposés d'après ton horaire de la ${classe?.nom ?? 'classe'}.`
                : horaire
                  ? `Pas de cours de la ${classe?.nom ?? 'classe'} dans ton horaire : choisis la date.`
                  : 'Sans horaire rempli, choisis la date.'}
            </p>
            {quand === 'autre' && (
              <div className="annonce-autre">
                <div className="compte-champ">
                  <label htmlFor={`${id}-date`}>{evaluation ? 'Jour de l’évaluation' : 'À rendre le (facultatif)'}</label>
                  <input
                    id={`${id}-date`}
                    type="date"
                    min={ajouterJours(aujourdhui, evaluation ? 1 : 0)}
                    value={autreDate}
                    onChange={(e) => {
                      setAutreDate(e.target.value)
                      setAutreHeure('')
                    }}
                    aria-invalid={erreurs.date ? true : undefined}
                    aria-describedby={erreurs.date ? `${id}-date-err` : undefined}
                  />
                </div>
                {evaluation && creneauxAutre.length > 0 && (
                  <div className="compte-champ">
                    <label htmlFor={`${id}-heure`}>Heure (facultatif)</label>
                    <select id={`${id}-heure`} value={autreHeure} onChange={(e) => setAutreHeure(e.target.value)}>
                      <option value="">— journée —</option>
                      {creneauxAutre.map((c) => (
                        <option key={`${c.heureDebut}-${c.heureFin}`} value={`${c.heureDebut}-${c.heureFin}`}>
                          {heureCourteCreneau(c.heureDebut, c.heureFin)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
            {erreurs.date && (
              <p id={`${id}-date-err`} className="compte-erreur-champ annonce-erreur" tabIndex={-1}>
                {erreurs.date}
              </p>
            )}
            {evaluation && dateValide && avertissements.length > 0 && <AvertissementsInterro avertissements={avertissements} date={saisie.date} />}
          </fieldset>

          <fieldset className="annonce-groupe">
            <legend className="annonce-question">
              Sur quoi&nbsp;?{chapitre && <span className="annonce-question-suite"> — {titreChapitre}</span>}
            </legend>
            {evaluation && (
              <div className="annonce-puces annonce-type" role="radiogroup" aria-label="Type d’évaluation">
                {[false, true].map((b) => (
                  <label key={String(b)} className={`annonce-puce petite${bilan === b ? ' actif' : ''}`}>
                    <input type="radio" name={`${id}-type`} className="carnet-sr" checked={bilan === b} onChange={() => setBilan(b)} />
                    {b ? 'Contrôle-bilan' : 'Interro'}
                  </label>
                ))}
              </div>
            )}
            <div className="compte-champ">
              <label htmlFor={`${id}-chapitre`}>Chapitre</label>
              <select id={`${id}-chapitre`} value={chapitreCle} onChange={(e) => changerChapitre(e.target.value)}>
                <option value="">— choisir —</option>
                {niveauxOrdonnes.map((l) => (
                  <optgroup key={l.slug} label={l.label}>
                    {chapitresDansMonOrdre(l.slug, ordreCourant(), l.chapters).map((c) => (
                      <option key={c.slug} value={`${l.slug}/${c.slug}`}>
                        {numeroRepere(c)}. {texteBrut(c.title)}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            {chapitre && (
              <div className="annonce-etapes-liste" role="group" aria-label={evaluation ? 'Étapes évaluées' : 'Étapes du devoir'} aria-describedby={erreurs.etapes ? `${id}-etapes-err` : undefined}>
                {structure.map((s) => {
                  const e = etats.get(s.id)
                  return (
                    <label key={s.id} className="annonce-case">
                      <input
                        type="checkbox"
                        checked={etapes.has(s.id)}
                        aria-invalid={erreurs.etapes ? true : undefined}
                        onChange={(ev) =>
                          setEtapes((avant) => {
                            const n = new Set(avant)
                            if (ev.target.checked) n.add(s.id)
                            else n.delete(s.id)
                            return n
                          })
                        }
                      />
                      <span>
                        Étape {s.numero} · <RichText text={s.titre} /> <span className={`annonce-etat ${e?.etat ?? 'pas-vue'}`}>{texteEtat(e, aujourdhui)}</span>
                      </span>
                    </label>
                  )
                })}
                {erreurs.etapes && (
                  <p id={`${id}-etapes-err`} className="compte-erreur-champ annonce-erreur" tabIndex={-1}>
                    {erreurs.etapes}
                  </p>
                )}
              </div>
            )}

            {!evaluation && (
              <div className="compte-champ">
                <label htmlFor={`${id}-consigne`}>Consigne</label>
                <textarea id={`${id}-consigne`} rows={3} value={consigne} onChange={(e) => setConsigne(e.target.value)} aria-invalid={erreurs.devoir ? true : undefined} aria-describedby={erreurs.devoir ? `${id}-devoir-err` : `${id}-consigne-aide`} />
                <p id={`${id}-consigne-aide`} className="annonce-aide">
                  Telle quelle sur la page des élèves (par exemple « Exercices 4 et 5 page 32 »).
                </p>
              </div>
            )}
            {chapitre && (
              <div className="annonce-exos">
                <p className="annonce-sous-question">
                  {evaluation ? 'Exercices pour se préparer' : 'Exercices en ligne joints'}
                  <span className="annonce-question-suite"> — proposés d'après les étapes cochées</span>
                </p>
                {proposes === null ? (
                  <p className="annonce-aide">Chargement des exercices de ces étapes…</p>
                ) : proposes.length === 0 ? (
                  <p className="annonce-aide">{saisie.etapes.length === 0 ? 'Coche une étape pour voir ses exercices.' : 'Pas d’exercice en ligne pour ces étapes.'}</p>
                ) : (
                  <div className="annonce-puces">
                    {proposes.map((g) => {
                      const pris = !decoches.has(g.id)
                      return (
                        <button
                          key={g.id}
                          type="button"
                          className={`annonce-puce exo${pris ? ' actif' : ''}`}
                          aria-pressed={pris}
                          onClick={() =>
                            setDecoches((avant) => {
                              const n = new Set(avant)
                              if (pris) n.add(g.id)
                              else n.delete(g.id)
                              return n
                            })
                          }
                        >
                          <span className="annonce-code">{g.id}</span> <RichText text={g.titre} />
                        </button>
                      )
                    })}
                  </div>
                )}
                {erreurs.devoir && (
                  <p id={`${id}-devoir-err`} className="compte-erreur-champ annonce-erreur" tabIndex={-1}>
                    {erreurs.devoir}
                  </p>
                )}
              </div>
            )}
          </fieldset>
        </section>

        <div className="annonce-droite">
          <section className="ep-carte annonce-apercu" aria-labelledby={`${id}-apercu`}>
            <p className="annonce-surtitre" id={`${id}-apercu`}>
              Ce que verront tes élèves
            </p>
            <p className="annonce-apercu-titre">
              {nature}
              {dateValide ? ` ${evaluation ? '' : 'pour le '}${jourCourt(saisie.date)} (${dans(saisie.date, aujourdhui)})` : evaluation ? ' — date à choisir' : ''}
            </p>
            {chapitre && (
              <p className="annonce-apercu-sujet">
                {titreChapitre}
                {numerosChoisis.length > 0 ? ` — ${texteNumeros(numerosChoisis)}` : ''}
              </p>
            )}
            {!evaluation && consigne.trim() && <p className="annonce-apercu-consigne">{consigne.trim()}</p>}
            {!evaluation && retenus.length > 0 && <p className="annonce-apercu-sujet">Exercices en ligne : {retenus.join(', ')}</p>}
            {evaluation && (
              <>
                {lienPlan ? (
                  <a className="ep-bouton principal annonce-faux-bouton" href={lienPlan} target="_blank" rel="noopener noreferrer">
                    Je prépare mon interro <span aria-hidden="true">›</span>
                    <span className="carnet-sr"> (aperçu du plan des élèves, nouvel onglet)</span>
                  </a>
                ) : (
                  <span className="ep-bouton principal annonce-faux-bouton desactive" aria-disabled="true">
                    Je prépare mon interro <span aria-hidden="true">›</span>
                  </span>
                )}
                <p className="annonce-aide">Ouvre leur plan de révision déjà rempli&nbsp;: date, étapes, exercices.</p>
              </>
            )}
          </section>

          <section className="ep-carte annonce-publier" aria-labelledby={`${id}-publier`}>
            <h2 id={`${id}-publier`} className="annonce-question">
              Publier
            </h2>
            <ul className="annonce-canaux">
              <Canal ok={page.etat === 'publiee' && (evaluation ? page.interros : page.devoirs)}>
                {page.etat === 'publiee' ? (
                  (evaluation ? page.interros : page.devoirs) ? (
                    <>Sur la page des élèves de la {classe?.nom} (mise à jour aussitôt)</>
                  ) : (
                    <>
                      La page des élèves de la {classe?.nom} ne montre pas les {evaluation ? 'évaluations' : 'devoirs'} : <Link to={`/carnet/classe/${classeId}/eleves`}>changer ce réglage</Link>
                    </>
                  )
                ) : page.etat === 'inactive' ? (
                  <>Page des élèves pas encore activée (migration 0010)</>
                ) : (
                  <>
                    La {classe?.nom} n'a pas de page des élèves en ce moment : <Link to={`/carnet/classe/${classeId}/eleves`}>créer le code</Link>
                  </>
                )}
              </Canal>
              <Canal ok={evaluation ? ctx.agenda.actif : true}>
                {evaluation ? (ctx.agenda.actif ? 'Dans ton agenda (rappel 7 jours et 2 jours avant, sur ton tableau de bord)' : 'Agenda pas encore activé (migration 0006)') : `Dans ton agenda${dateValide ? ` (« À rendre » le ${dateCourteDevoir(saisie.date)})` : ''}`}
              </Canal>
              <li>
                <label className="annonce-case">
                  <input type="checkbox" checked={copier} onChange={(e) => setCopier(e.target.checked)} disabled={!textes} />
                  <span>Copier le texte pour le journal de classe / Smartschool</span>
                </label>
                {copier && textes && (
                  <details className="annonce-texte">
                    <summary>Voir le texte copié</summary>
                    <pre>{textes.texte}</pre>
                  </details>
                )}
              </li>
            </ul>
            {evaluation && !ctx.agenda.actif && <MessageAgendaInactif compact />}
            {!ctx.devoirs && <MessageDevoirsInactif quoi={evaluation ? 'Les étapes évaluées et les exercices proposés' : 'La date de remise et les exercices joints'} />}
            <div className="annonce-boutons">
              <button type="button" className="ep-bouton principal" disabled={occupe || bloque} onClick={() => envoyer(false)}>
                {evaluation ? 'Annoncer' : 'Donner le devoir'}
              </button>
              {evaluation && (
                <button type="button" className="ep-bouton" disabled={occupe || bloque} onClick={() => envoyer(true)}>
                  Annoncer et préparer l’évaluation <span aria-hidden="true">›</span>
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function Canal({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <li className={`annonce-canal${ok ? ' ok' : ''}`}>
      <span className="annonce-canal-marque" aria-hidden="true">
        {ok ? '✓' : ''}
      </span>
      <span>
        <span className="carnet-sr">{ok ? 'Oui : ' : 'Non : '}</span>
        {children}
      </span>
    </li>
  )
}
