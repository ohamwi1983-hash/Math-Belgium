import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { RichText } from '../Math'
import { BandeauEspace } from '../compte/BandeauEspace'
import { BlocEvaluation, PastilleCompetence } from '../eleve/BlocEvaluation'
import { findChapter, LEVELS } from '../../content/chaptersIndex'
import { dateIso, generateursChapitre, structureChapitre, texteBrut, type Classe, type Seance } from '../../lib/carnet'
import { avertissementsInterro, predicatSuppression, type Evenement } from '../../lib/agendaEvenements'
import { ajouterJours } from '../../lib/calendrierFwb'
import { dateCourteDevoir, prochainsCours } from '../../lib/carnetDevoirs'
import { creneauxDuJour, type CaseHoraire, type GrilleHoraire } from '../../lib/horaire'
import { erreursAnnonce, etatsEtapes, heureCourteCreneau, type QuoiAnnonce, type SaisieAnnonce } from '../../lib/annonceClasse'
import { chapitresDansMonOrdre, numeroRepere, ordreCourant } from '../../lib/ordreChapitres'
import {
  changementsDevoir,
  changementsEvaluation,
  chapitrePrecedent,
  choixDepuisStockage,
  COMPETENCES,
  contenuDepuisChoix,
  ecartJours,
  erreurNom,
  exercicesDevoir,
  exercicesDuPoint,
  intituleDeNom,
  JOURS_POINTS_PRECEDENT,
  jourLong,
  messageModification,
  messageModificationDevoir,
  NOMS_PROPOSES,
  NOM_COMPETENCE,
  pointVisible,
  quizDuChapitre,
  textesBloc,
  textesDevoir,
  titreCourt,
  texteVu,
  type Changement,
  type ChoixChapitre,
  type Competence,
  type ContenuDevoir,
  type ContenuEval,
  type Moment,
} from '../../lib/evaluationAnnoncee'
import { interroPubliee } from '../../lib/pageClasseContenu'
import { lienPlanRevision } from '../../lib/pageClasse'
import { AvertissementsInterro, MessageAgendaInactif } from './AgendaUi'
import { MessageDevoirsInactif } from './FormulaireSeance'
import { useCarnet } from './contexteCarnet'
import { chapitreEnCours, chapitreParDefaut } from './outilsCarnet'
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

/** Ce que l'écran modifie (rouvert depuis la fiche, « Modifier »). */
export type ModificationAnnonce = { quoi: 'evaluation'; evenement: Evenement; seance: Seance | undefined } | { quoi: 'devoir'; seance: Seance }

const NOMS_JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
const jourSemaine = (iso: string) => new Date(`${iso}T12:00:00Z`).getUTCDay()
const jourCourt = (iso: string) => `${NOMS_JOURS[jourSemaine(iso)]} ${Number(iso.slice(8, 10))}/${Number(iso.slice(5, 7))}`

function dans(date: string, aujourdhui: string): string {
  const n = ecartJours(aujourdhui, date)
  return n <= 0 ? "aujourd'hui" : n === 1 ? 'demain' : `dans ${n} jours`
}

/** Une puce de date : prochain cours, date d'origine (modification) ou « autre date… ». */
interface OptionQuand {
  cle: string
  date: string
  heureDebut: number | null
  heureFin: number | null
}
const cleQuand = (date: string, d: number | null, f: number | null) => `${date}|${d ?? ''}-${f ?? ''}`
const texteOption = (o: OptionQuand) => `${dateCourteDevoir(o.date)} · ${o.heureDebut === null ? 'journée' : heureCourteCreneau(o.heureDebut, o.heureFin)}`

function Marque({ quoi, feminin = false }: { quoi: 'ajoute' | 'retire'; feminin?: boolean }) {
  return <span className={`annonce-marque ${quoi}`}>{quoi === 'ajoute' ? `ajouté${feminin ? 'e' : ''}` : `retiré${feminin ? 'e' : ''}`}</span>
}

/**
 * « Annoncer une évaluation » / « Donner un devoir » (`/carnet/annoncer?classe=<id>&quoi=devoir&chapitre=<niveau>/<slug>`),
 * et leur MODIFICATION (`&modifier=<id>`, depuis la fiche) — maquettes « annonce » (27/11/2026) puis « fiche-eval »
 * version 2 (28/11/2026) : Quand (prochains cours de la classe, ou une autre date), Sur quoi (nom de l'évaluation,
 * compétences, plusieurs chapitres, points du chapitre avec leurs exercices rangés dessous), Publier (aperçu = le bloc
 * EXACT publié aux élèves, `BlocEvaluation`). En modification : ancienne date barrée, marques « ajouté » / « retiré »,
 * récapitulatif « Ce qui va changer », message pour prévenir les élèves. Les écritures sont faites par le carnet
 * (`CarnetPage::annoncer` / `modifierAnnonce`, tables existantes + 0013 facultative, `lib/annonceClasse.ts`).
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
  modification = null,
  competencesActif,
  onAnnoncer,
  onAnnuler,
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
  modification?: ModificationAnnonce | null
  /** 0013 appliquée : les compétences choisies sont gardées. */
  competencesActif: boolean
  onAnnoncer: (a: SaisieAnnonce, o: { textes: TextesAnnonce | null; preparer: boolean; message: string | null }) => void
  onAnnuler?: () => void
}) {
  const id = useId()
  const ctx = useCarnet()
  const aujourdhui = dateIso(maintenant)
  const evaluation = quoi === 'evaluation'
  const modifEval = modification?.quoi === 'evaluation' ? modification : null
  const modifDevoir = modification?.quoi === 'devoir' ? modification : null
  const enModif = modification !== null
  const classeDeModif = modifEval ? modifEval.evenement.classe_id : modifDevoir ? modifDevoir.seance.classe_id : null
  const [classeId, setClasseId] = useState(() => classeDeModif ?? (classes.some((c) => c.id === classeInitiale) ? (classeInitiale as string) : (classes[0]?.id ?? '')))
  const classe = classes.find((c) => c.id === classeId)

  /* --------------------------------------------------------------------------------- quand */
  const cours = useMemo(
    () =>
      horaire && classeId
        ? prochainsCours({ classeId, apres: aujourdhui, grilles: horaire.grilles, cases: horaire.cases, evenements: ctx.agenda.actif ? ctx.agenda.evenements : [], classes, n: enModif ? 5 : 3 })
        : [],
    [horaire, classeId, aujourdhui, ctx.agenda, classes, enModif],
  )
  const origine: Moment | null = modifEval
    ? { date: modifEval.evenement.du, heureDebut: modifEval.evenement.journee_entiere ? null : modifEval.evenement.heure_debut, heureFin: modifEval.evenement.journee_entiere ? null : modifEval.evenement.heure_fin }
    : modifDevoir && modifDevoir.seance.devoir_pour
      ? { date: modifDevoir.seance.devoir_pour, heureDebut: null, heureFin: null }
      : null
  const options = useMemo<OptionQuand[]>(() => {
    const liste: OptionQuand[] = cours.map((c) => ({ cle: cleQuand(c.date, evaluation ? c.creneau.heureDebut : null, evaluation ? c.creneau.heureFin : null), date: c.date, heureDebut: evaluation ? c.creneau.heureDebut : null, heureFin: evaluation ? c.creneau.heureFin : null }))
    if (origine && !liste.some((o) => o.cle === cleQuand(origine.date, origine.heureDebut, origine.heureFin))) liste.push({ cle: cleQuand(origine.date, origine.heureDebut, origine.heureFin), ...origine })
    return liste.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : (a.heureDebut ?? -1) - (b.heureDebut ?? -1)))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- l'origine ne change pas
  }, [cours, evaluation])
  const choixDepart = (liste: OptionQuand[]) => (evaluation ? (liste.find((c) => ecartJours(aujourdhui, c.date) >= 5) ?? null) : (liste[0] ?? null))
  const [quand, setQuand] = useState<string>(() => {
    if (origine) return cleQuand(origine.date, origine.heureDebut, origine.heureFin)
    if (modifDevoir) return 'autre'
    const c = choixDepart(options)
    return c ? c.cle : 'autre'
  })
  const [autreDate, setAutreDate] = useState(() => (evaluation ? ajouterJours(aujourdhui, 7) : ''))
  const [autreHeure, setAutreHeure] = useState('')
  const optionChoisie = options.find((o) => o.cle === quand)
  const date = optionChoisie ? optionChoisie.date : autreDate
  const heures = optionChoisie ? (optionChoisie.heureDebut === null ? null : { debut: optionChoisie.heureDebut, fin: optionChoisie.heureFin ?? optionChoisie.heureDebut }) : autreHeure ? { debut: Number(autreHeure.split('-')[0]), fin: Number(autreHeure.split('-')[1]) } : null
  const creneauxAutre = useMemo(() => {
    if (!evaluation || !horaire || !classeId || optionChoisie || !/^\d{4}-\d{2}-\d{2}$/.test(autreDate)) return []
    const supprimee = ctx.ctxAgenda ? predicatSuppression(ctx.ctxAgenda) : undefined
    return creneauxDuJour(autreDate, horaire.grilles, horaire.cases.filter((c) => c.classe_id === classeId), { supprimee }).creneaux
  }, [evaluation, horaire, classeId, optionChoisie, autreDate, ctx.ctxAgenda])

  /* ---------------------------------------------------------------------- sur quoi (éval.) */
  const blocsDepart = (k: string): ChoixChapitre[] => {
    const demande = chapitreInitial && k === classeInitiale && findChapter(...(chapitreInitial.split('/') as [string, string])) ? chapitreInitial : ''
    const enCours = demande || chapitreEnCours(k, seances) || chapitreParDefaut(k, classes, seances)
    if (!enCours) return []
    const prec = chapitrePrecedent(seances, k, enCours, aujourdhui)
    const bloc = (cle: string, recents: boolean): ChoixChapitre => {
      const [n, s] = cle.split('/')
      const c = findChapter(n, s)
      if (!c) return { cle, points: [], retires: [], connaitre: true }
      const e = etatsEtapes(seances, k, c)
      const points = structureChapitre(c)
        .filter((sec) => {
          const x = e.get(sec.id)
          if (!x || x.etat === 'pas-vue') return false
          return recents ? ecartJours(x.date, aujourdhui) <= JOURS_POINTS_PRECEDENT : true
        })
        .map((sec) => sec.id)
      return { cle, points, retires: [], connaitre: true }
    }
    return [...(prec ? [bloc(prec, true)] : []), bloc(enCours, false)]
  }
  const choixInitial = useMemo(() => (modifEval ? choixDepuisStockage(modifEval.evenement, modifEval.seance) : null), [modifEval])
  const nomDepart = choixInitial?.nom ?? 'Interro'
  const [nom, setNom] = useState(nomDepart)
  const [nomChoix, setNomChoix] = useState<string>(() => ((NOMS_PROPOSES as readonly string[]).includes(nomDepart) ? nomDepart : 'autre'))
  const [competences, setCompetences] = useState<Competence[]>(() => choixInitial?.competences ?? [1, 2, 3])
  const [blocs, setBlocs] = useState<ChoixChapitre[]>(() => choixInitial?.chapitres ?? (evaluation ? blocsDepart(classeId) : []))
  const [ajout, setAjout] = useState(false)
  const [chapitreAjout, setChapitreAjout] = useState('')
  const enCoursClasse = chapitreEnCours(classeId, seances)
  const precClasse = enCoursClasse ? chapitrePrecedent(seances, classeId, enCoursClasse, aujourdhui) : null

  const contenu: ContenuEval = useMemo(() => contenuDepuisChoix({ nom: nomChoix === 'autre' ? nom : nomChoix, competences, chapitres: blocs }), [nom, nomChoix, competences, blocs])
  const contenuAvant = useMemo(() => (choixInitial ? contenuDepuisChoix(choixInitial) : null), [choixInitial])

  function changerBloc(cle: string, f: (b: ChoixChapitre) => ChoixChapitre) {
    setBlocs((avant) => avant.map((b) => (b.cle === cle ? f(b) : b)))
  }
  function basculer<T>(liste: T[], x: T): T[] {
    return liste.includes(x) ? liste.filter((y) => y !== x) : [...liste, x]
  }

  /* ----------------------------------------------------------------------- sur quoi (devoir) */
  const chapitreDevoir0 = modifDevoir ? `${modifDevoir.seance.niveau}/${modifDevoir.seance.chapitre}` : (() => {
    const demande = chapitreInitial && classeId === classeInitiale ? chapitreInitial : ''
    const [n, s] = demande.split('/')
    return n && s && findChapter(n, s) ? demande : chapitreParDefaut(classeId, classes, seances)
  })()
  const [chapitreCle, setChapitreCle] = useState(chapitreDevoir0)
  const [niveauD, slugD] = chapitreCle.split('/')
  const chapitreD = niveauD && slugD ? findChapter(niveauD, slugD) : undefined
  const structureD = useMemo(() => (chapitreD ? structureChapitre(chapitreD) : []), [chapitreD])
  const etatsD = useMemo(() => (chapitreD && classeId ? etatsEtapes(seances, classeId, chapitreD) : new Map()), [seances, classeId, chapitreD])
  const cartes = useMemo(() => (chapitreD ? generateursChapitre(chapitreD).map((g) => ({ id: g.id, titre: texteBrut(g.titre), sectionId: g.sectionId })) : []), [chapitreD])
  const joints0 = modifDevoir?.seance.devoir_generateurs ?? []
  const [etapesD, setEtapesD] = useState<Set<string>>(() => {
    if (modifDevoir) return new Set(cartes.filter((c) => joints0.includes(c.id) && c.sectionId).map((c) => c.sectionId as string))
    const touchees = structureD.filter((s) => etatsD.get(s.id) && etatsD.get(s.id)?.etat !== 'pas-vue').map((s) => s.id)
    return new Set(touchees.slice(-1))
  })
  const proposesD = useMemo(() => {
    const ordre = structureD.filter((s) => etapesD.has(s.id)).map((s) => s.id)
    const liste = ordre.flatMap((sid) => cartes.filter((g) => g.sectionId === sid))
    for (const j of joints0) if (!liste.some((g) => g.id === j)) liste.push({ id: j, titre: cartes.find((c) => c.id === j)?.titre ?? j, sectionId: null })
    return liste
    // eslint-disable-next-line react-hooks/exhaustive-deps -- joints d'origine fixes
  }, [structureD, etapesD, cartes])
  const [decoches, setDecoches] = useState<Set<string>>(() => (modifDevoir ? new Set(cartes.filter((c) => !joints0.includes(c.id)).map((c) => c.id)) : new Set()))
  const retenusD = proposesD.filter((g) => !decoches.has(g.id)).map((g) => g.id)
  const [consigne, setConsigne] = useState(() => modifDevoir?.seance.devoir ?? '')

  const [copier, setCopier] = useState(false)
  const [prevenir, setPrevenir] = useState(true)
  const [tentative, setTentative] = useState(0)
  const racine = useRef<HTMLDivElement>(null)

  function changerClasse(k: string) {
    setClasseId(k)
    setBlocs(blocsDepart(k))
    setChapitreCle(chapitreParDefaut(k, classes, seances))
    setDecoches(new Set())
    setQuand('auto')
  }
  useEffect(() => {
    if (quand !== 'auto') return
    const c = choixDepart(options)
    setQuand(c ? c.cle : 'autre')
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seulement après un changement de classe
  }, [quand, options])

  /* -------------------------------------------------------------------------------- saisie */
  const premier = contenu.chapitres[0] ?? (blocs[0] ? { niveau: blocs[0].cle.split('/')[0], slug: blocs[0].cle.split('/')[1] } : null)
  const nomFinal = nomChoix === 'autre' ? nom.replace(/\s+/g, ' ').trim() : nomChoix
  const saisie: SaisieAnnonce = evaluation
    ? {
        quoi,
        classeId,
        niveau: premier?.niveau ?? '',
        chapitre: premier?.slug ?? '',
        date: date ?? '',
        heureDebut: heures ? heures.debut : null,
        heureFin: heures ? heures.fin : null,
        bilan: false,
        etapes: contenu.chapitres.flatMap((c) => c.points.map((p) => p.id)),
        generateurs: [],
        consigne: '',
        nom: nomFinal,
        contenu,
      }
    : { quoi, classeId, niveau: chapitreD?.levelSlug ?? '', chapitre: chapitreD?.slug ?? '', date: date ?? '', heureDebut: null, heureFin: null, bilan: false, etapes: structureD.filter((s) => etapesD.has(s.id)).map((s) => s.id), generateurs: retenusD, consigne }
  const erreurs: ReturnType<typeof erreursAnnonce> & { nom?: string; competences?: string } =
    tentative > 0 ? { ...erreursAnnonce(saisie, aujourdhui), ...(evaluation && nomChoix === 'autre' && erreurNom(nom) ? { nom: erreurNom(nom) as string } : {}), ...(evaluation && competences.length === 0 ? { competences: 'Garde au moins une compétence.' } : {}) } : {}
  // En modification, une date passée reste permise pour une évaluation passée qu'on corrige.
  if (enModif && erreurs.date && origine && saisie.date === origine.date) delete erreurs.date
  const dateValide = /^\d{4}-\d{2}-\d{2}$/.test(saisie.date)
  const avertissements =
    evaluation && classe && ctx.agenda.actif && dateValide
      ? avertissementsInterro({ date: saisie.date, ecoleId: classe.ecole_id, periodes: ctx.agenda.periodes, evenements: ctx.agenda.evenements, seuil: ctx.agenda.seuil, aujourdhui })
      : []
  const page = classeId ? pageEleves(classeId) : { etat: 'inactive' as const, interros: false, devoirs: false }
  const bloque = evaluation ? !ctx.agenda.actif : false

  // Aperçu « Ce que verront tes élèves » = la copie publiée (même fonction que la page des élèves).
  const apercu = useMemo(() => {
    if (!evaluation || !classe || !dateValide) return null
    return interroPubliee(
      { id: modifEval?.evenement.id ?? '', du: saisie.date, journee_entiere: saisie.heureDebut === null, heure_debut: saisie.heureDebut, heure_fin: saisie.heureFin, intitule: intituleDeNom(nomFinal), chapitre: premier ? `${premier.niveau}/${premier.slug}` : null },
      contenu,
      { classe, seancesClasse: seances.filter((s) => s.classe_id === classe.id), grilles: ctx.grilles, format: ctx.format, avecHeure: true },
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- recalculé quand la saisie change
  }, [evaluation, classe, dateValide, saisie.date, saisie.heureDebut, saisie.heureFin, contenu, nomFinal, seances, ctx.grilles, ctx.format])
  const lienPlan = apercu ? lienPlanRevision(apercu) : null
  const contenuDevoir: ContenuDevoir | null = !evaluation && chapitreD ? { consigne, pour: saisie.date || null, niveau: chapitreD.levelSlug, chapitre: chapitreD.slug, exercices: exercicesDevoir(chapitreD.levelSlug, chapitreD.slug, retenusD) } : null
  const textes = useMemo<TextesAnnonce | null>(() => {
    if (!classe) return null
    if (evaluation) return apercu ? textesBloc(apercu, { classe: classe.nom, lienPlan }) : null
    return contenuDevoir ? textesDevoir(contenuDevoir, { classe: classe.nom }) : null
    // eslint-disable-next-line react-hooks/exhaustive-deps -- dérivé de l'aperçu
  }, [classe, evaluation, apercu, lienPlan, JSON.stringify(contenuDevoir)])

  // Modification : ce qui change, et le message pour prévenir les élèves.
  const moment: Moment = { date: saisie.date, heureDebut: saisie.heureDebut, heureFin: saisie.heureFin }
  const changements: Changement[] = modifEval && contenuAvant && origine && dateValide ? changementsEvaluation({ moment: origine, contenu: contenuAvant }, { moment, contenu }) : modifDevoir && contenuDevoir ? changementsDevoir({ consigne: modifDevoir.seance.devoir, pour: modifDevoir.seance.devoir_pour ?? null, niveau: modifDevoir.seance.niveau, chapitre: modifDevoir.seance.chapitre, exercices: exercicesDevoir(modifDevoir.seance.niveau, modifDevoir.seance.chapitre, joints0) }, contenuDevoir) : []
  const message =
    enModif && classe && changements.length > 0
      ? modifEval && origine && contenuAvant
        ? messageModification({ classe: classe.nom, avant: origine, apres: moment, nomAvant: contenuAvant.nom, contenu })
        : contenuDevoir
          ? messageModificationDevoir({ classe: classe.nom, contenu: contenuDevoir })
          : null
      : null

  function envoyer(preparer: boolean) {
    setTentative((n) => n + 1)
    const e = { ...erreursAnnonce(saisie, aujourdhui) }
    if (enModif && e.date && origine && saisie.date === origine.date) delete e.date
    const ko = Object.keys(e).length > 0 || (evaluation && ((nomChoix === 'autre' && erreurNom(nom)) || competences.length === 0))
    if (ko || bloque || !classe || (evaluation ? contenu.chapitres.length === 0 : !chapitreD)) return
    if (enModif && changements.length === 0) return
    onAnnoncer(saisie, { textes: !enModif && copier ? textes : null, preparer, message: enModif && prevenir ? message : null })
  }

  useEffect(() => {
    if (tentative === 0) return
    racine.current?.querySelector<HTMLElement>('[aria-invalid="true"], .annonce-erreur')?.focus()
  }, [tentative])

  const etape = !dateValide && evaluation ? 1 : (evaluation ? contenu.chapitres.length === 0 : !chapitreD) ? 2 : 3
  const titre = enModif ? (evaluation ? `Modifier ${contenuAvant ? (contenuAvant.nom.toLowerCase() === 'interro' ? 'l’interro' : `« ${contenuAvant.nom} »`) : 'l’évaluation'}` : 'Modifier le devoir') : evaluation ? 'Annoncer une évaluation' : 'Donner un devoir'
  const niveauClasse = classe?.niveau ?? premier?.niveau ?? ''
  const chapitresAjoutables = niveauClasse ? chapitresDansMonOrdre(niveauClasse, ordreCourant(), LEVELS.find((l) => l.slug === niveauClasse)?.chapters ?? []).filter((c) => !blocs.some((b) => b.cle === `${niveauClasse}/${c.slug}`)) : []
  const niveauxOrdonnes = classe?.niveau ? [...LEVELS.filter((l) => l.slug === classe.niveau), ...LEVELS.filter((l) => l.slug !== classe.niveau)] : LEVELS

  const etapesTete = (
    <ol className="annonce-etapes" aria-label="Étapes">
      {['Quand', 'Sur quoi', enModif ? 'Vérifier' : 'Publier'].map((t, i) => (
        <li key={t} className={i + 1 === etape ? 'actuelle' : i + 1 < etape ? 'faite' : ''} aria-current={i + 1 === etape ? 'step' : undefined}>
          <span className="annonce-etape-num" aria-hidden="true">
            {i + 1}
          </span>
          {t}
        </li>
      ))}
    </ol>
  )

  // Marques de modification.
  const pointsAvant = new Set(contenuAvant?.chapitres.flatMap((c) => c.points.map((p) => `${c.slug}#${p.id}`)) ?? [])
  const exosAvant = new Set(contenuAvant?.chapitres.flatMap((c) => c.points.flatMap((p) => p.exercices.map((x) => x.id))) ?? [])
  const pointsApres = new Set(contenu.chapitres.flatMap((c) => c.points.map((p) => `${c.slug}#${p.id}`)))
  const exosApres = new Set(contenu.chapitres.flatMap((c) => c.points.flatMap((p) => p.exercices.map((x) => x.id))))

  const quandModifie = enModif && origine && (origine.date !== moment.date || origine.heureDebut !== moment.heureDebut || origine.heureFin !== moment.heureFin) && dateValide

  return (
    <div className="annonce" ref={racine}>
      <BandeauEspace
        titreId={`${id}-titre`}
        surtitre={classe ? `Mes classes › ${classe.nom}` : 'Mes classes'}
        titre={titre}
        icone={null}
        apresTitre={
          enModif ? (
            <p className="ep-phrase">Même écran que pour annoncer, déjà rempli. Chaque changement est marqué.</p>
          ) : (
            <p className="ep-phrase">
              {evaluation ? 'Trois étapes : le jour, la matière, puis où la publier.' : 'Trois étapes : pour quand, sur quoi, puis où le publier.'}{' '}
              <Link to={`/carnet/annoncer?classe=${encodeURIComponent(classeId)}${evaluation ? '&quoi=devoir' : ''}`} replace>
                {evaluation ? 'Plutôt donner un devoir ›' : 'Plutôt annoncer une évaluation ›'}
              </Link>
            </p>
          )
        }
        fin={etapesTete}
      />

      {enModif && classe && (
        <p className="annonce-bandeau-modif" role="note">
          {modifEval && origine && contenuAvant ? (
            <>
              Tu modifies {contenuAvant.nom.toLowerCase() === 'interro' ? 'l’interro' : `l’évaluation « ${contenuAvant.nom} »`} du <strong>{jourLong(origine.date)}</strong> ({classe.nom}). Rien n’est changé tant que tu n’as pas enregistré.
            </>
          ) : (
            <>
              Tu modifies le devoir{modifDevoir?.seance.devoir_pour ? <> pour le <strong>{jourLong(modifDevoir.seance.devoir_pour)}</strong></> : ''} ({classe.nom}). Rien n’est changé tant que tu n’as pas enregistré.
            </>
          )}
        </p>
      )}

      <div className="annonce-grille">
        <section className="ep-carte annonce-carte" aria-labelledby={`${id}-quand`}>
          {classes.length > 1 && !enModif && (
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
              <span className="annonce-etape-num petit" aria-hidden="true">
                1
              </span>{' '}
              {evaluation ? 'Quand ?' : 'Pour quand ?'}
            </legend>
            <div className="annonce-puces">
              {options.map((o) => {
                const estOrigine = !!origine && o.cle === cleQuand(origine.date, origine.heureDebut, origine.heureFin)
                return (
                  <label key={o.cle} className={`annonce-puce${quand === o.cle ? ' actif' : ''}${estOrigine && quand !== o.cle ? ' ancienne' : ''}`}>
                    <input type="radio" name={`${id}-quand`} className="carnet-sr" checked={quand === o.cle} onChange={() => setQuand(o.cle)} />
                    {estOrigine && quand !== o.cle ? <s>{texteOption(o)}</s> : texteOption(o)}
                    {estOrigine && quand !== o.cle && <span className="carnet-sr"> (date d’avant)</span>}
                  </label>
                )
              })}
              <label className={`annonce-puce${quand === 'autre' ? ' actif' : ''}`}>
                <input type="radio" name={`${id}-quand`} className="carnet-sr" checked={quand === 'autre'} onChange={() => setQuand('autre')} />
                autre date…
              </label>
            </div>
            {quandModifie && origine && (
              <p className="annonce-aide">
                <span className="annonce-marque change">date changée</span> avant : {texteOption({ cle: '', ...origine })}
              </p>
            )}
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

          {evaluation ? (
            <fieldset className="annonce-groupe">
              <legend className="annonce-question">
                <span className="annonce-etape-num petit" aria-hidden="true">
                  2
                </span>{' '}
                Sur quoi&nbsp;?
              </legend>

              <div role="radiogroup" aria-labelledby={`${id}-nom`} className="annonce-sous-groupe">
                <p id={`${id}-nom`} className="annonce-sous-question">
                  Nom de l’évaluation
                </p>
                <div className="annonce-puces">
                  {[...NOMS_PROPOSES, 'autre'].map((n) => (
                    <label key={n} className={`annonce-puce petite${nomChoix === n ? ' actif' : ''}`}>
                      <input type="radio" name={`${id}-nomchoix`} className="carnet-sr" checked={nomChoix === n} onChange={() => setNomChoix(n)} />
                      {n === 'autre' ? 'autre nom…' : n}
                    </label>
                  ))}
                </div>
                {nomChoix === 'autre' && (
                  <div className="compte-champ">
                    <label htmlFor={`${id}-nom-libre`}>Nom (par exemple « Examen blanc »)</label>
                    <input
                      id={`${id}-nom-libre`}
                      type="text"
                      value={nom}
                      autoComplete="off"
                      onChange={(e) => setNom(e.target.value)}
                      aria-invalid={erreurs.nom ? true : undefined}
                      aria-describedby={erreurs.nom ? `${id}-nom-err` : undefined}
                    />
                    {erreurs.nom && (
                      <p id={`${id}-nom-err`} className="compte-erreur-champ annonce-erreur" tabIndex={-1}>
                        {erreurs.nom}
                      </p>
                    )}
                  </div>
                )}
                {enModif && contenuAvant && contenuAvant.nom !== contenu.nom && (
                  <p className="annonce-aide">
                    <span className="annonce-marque change">nom changé</span> avant : {contenuAvant.nom}
                  </p>
                )}
              </div>

              <div className="annonce-sous-groupe">
                <p id={`${id}-comp`} className="annonce-sous-question">
                  Compétences évaluées
                </p>
                <div className="annonce-comps" role="group" aria-labelledby={`${id}-comp`}>
                  {COMPETENCES.map((c) => {
                    const pris = competences.includes(c)
                    return (
                      <button
                        key={c}
                        type="button"
                        className={`annonce-comp annonce-comp-${c}${pris ? ' pris' : ''}`}
                        aria-pressed={pris}
                        aria-invalid={erreurs.competences ? true : undefined}
                        onClick={() => setCompetences((avant) => (basculer(avant, c).sort() as Competence[]))}
                      >
                        <span className="annonce-comp-num" aria-hidden="true">
                          {c}
                        </span>
                        {NOM_COMPETENCE[c]}
                        <span aria-hidden="true">{pris ? ' ✓' : ''}</span>
                      </button>
                    )
                  })}
                </div>
                <p className="annonce-aide">Les trois sont cochées d’office. Décocher une compétence retire ses exercices, et les points qui n’en ont plus.</p>
                {!competencesActif && (
                  <p className="annonce-aide annonce-note-0013">
                    Pour garder le choix des compétences, applique la migration <code>0013_evaluation_competences.sql</code> (SQL Editor → coller tout le fichier → Run). En attendant, les
                    compétences publiées sont déduites des exercices retenus (Connaître d’office).
                  </p>
                )}
                {erreurs.competences && (
                  <p className="compte-erreur-champ annonce-erreur" tabIndex={-1}>
                    {erreurs.competences}
                  </p>
                )}
              </div>

              {blocs.map((b) => {
                const [n, s] = b.cle.split('/')
                const c = findChapter(n, s)
                if (!c) return null
                const etats = etatsEtapes(seances, classeId, c)
                const quiz = quizDuChapitre(c)
                const role = b.cle === enCoursClasse ? 'chapitre en cours' : b.cle === precClasse ? 'chapitre précédent' : ''
                return (
                  <section key={b.cle} className="annonce-bloc-chap" aria-label={titreCourt(c)}>
                    <div className="annonce-bloc-tete">
                      <p className="annonce-bloc-titre">
                        <strong>{titreCourt(c)}</strong>
                        {role && <span className="annonce-question-suite"> · {role}</span>}
                      </p>
                      <button type="button" className="ep-bouton annonce-retirer" onClick={() => setBlocs((avant) => avant.filter((x) => x.cle !== b.cle))}>
                        Retirer ce chapitre <span aria-hidden="true">×</span>
                        <span className="carnet-sr"> ({titreCourt(c)})</span>
                      </button>
                    </div>
                    <ul className="annonce-points">
                      {structureChapitre(c).map((sec) => {
                        const tous = exercicesDuPoint(c, sec.id)
                        if (!pointVisible(tous, competences)) return null
                        const coche = b.points.includes(sec.id)
                        const k = `${c.slug}#${sec.id}`
                        const exos = tous.filter((x) => competences.includes(x.competence))
                        const e = etats.get(sec.id)
                        return (
                          <li key={sec.id} className="annonce-point">
                            <label className="annonce-case">
                              <input type="checkbox" checked={coche} aria-invalid={erreurs.etapes ? true : undefined} onChange={() => changerBloc(b.cle, (x) => ({ ...x, points: basculer(x.points, sec.id) }))} />
                              <span>
                                <strong>{sec.numero}.</strong> <RichText text={sec.titre} /> <span className={`annonce-etat ${e?.etat ?? 'pas-vue'}`}>{texteVu(e, aujourdhui)}</span>
                                {enModif && pointsApres.has(k) && !pointsAvant.has(k) && <Marque quoi="ajoute" />}
                                {enModif && !pointsApres.has(k) && pointsAvant.has(k) && <Marque quoi="retire" />}
                              </span>
                            </label>
                            {coche && exos.length > 0 && (
                              <ul className="annonce-exos" aria-label={`Exercices du point ${sec.numero}`}>
                                {exos.map((x) => {
                                  const retire = b.retires.includes(x.id)
                                  return (
                                    <li key={x.id}>
                                      <button
                                        type="button"
                                        className={`annonce-exo${retire ? ' retire' : ''}`}
                                        aria-pressed={!retire}
                                        onClick={() => changerBloc(b.cle, (y) => ({ ...y, retires: basculer(y.retires, x.id) }))}
                                      >
                                        <PastilleCompetence c={x.competence} petite />
                                        <span className="annonce-code">{x.id}</span>
                                        <span className="annonce-exo-titre">{x.titre}</span>
                                        {enModif && exosApres.has(x.id) && !exosAvant.has(x.id) && <Marque quoi="ajoute" />}
                                        {enModif && !exosApres.has(x.id) && exosAvant.has(x.id) && <Marque quoi="retire" />}
                                        <span className="carnet-sr">{retire ? ' (retiré : toucher pour le remettre)' : ' (retenu : toucher pour le retirer)'}</span>
                                      </button>
                                    </li>
                                  )
                                })}
                              </ul>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                    {competences.includes(1) && (
                      <label className="annonce-case annonce-connaitre">
                        <input type="checkbox" checked={!quiz || b.connaitre} disabled={!quiz} onChange={() => changerBloc(b.cle, (x) => ({ ...x, connaitre: !x.connaitre }))} />
                        <span>
                          <PastilleCompetence c={1} petite /> <strong>Connaître</strong> : questions « formule » et quiz vrai/faux des points cochés {quiz && <span className="annonce-code">{quiz}</span>}
                        </span>
                      </label>
                    )}
                  </section>
                )
              })}
              {erreurs.etapes && (
                <p className="compte-erreur-champ annonce-erreur" tabIndex={-1}>
                  {erreurs.etapes}
                </p>
              )}

              {ajout ? (
                <div className="annonce-ajout">
                  <div className="compte-champ">
                    <label htmlFor={`${id}-ajout`}>Chapitre à ajouter</label>
                    <select id={`${id}-ajout`} value={chapitreAjout} onChange={(e) => setChapitreAjout(e.target.value)}>
                      <option value="">— choisir —</option>
                      {chapitresAjoutables.map((c) => (
                        <option key={c.slug} value={`${niveauClasse}/${c.slug}`}>
                          {numeroRepere(c)}. {texteBrut(c.title)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="annonce-boutons">
                    <button
                      type="button"
                      className="ep-bouton principal"
                      disabled={!chapitreAjout}
                      onClick={() => {
                        const [n, s] = chapitreAjout.split('/')
                        const c = findChapter(n, s)
                        if (c) {
                          const e = etatsEtapes(seances, classeId, c)
                          const points = structureChapitre(c).filter((sec) => e.get(sec.id) && e.get(sec.id)?.etat !== 'pas-vue').map((sec) => sec.id)
                          setBlocs((avant) => [...avant, { cle: chapitreAjout, points, retires: [], connaitre: true }])
                        }
                        setChapitreAjout('')
                        setAjout(false)
                      }}
                    >
                      Ajouter ce chapitre
                    </button>
                    <button type="button" className="ep-bouton" onClick={() => setAjout(false)}>
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <button type="button" className="annonce-ajouter" onClick={() => setAjout(true)} disabled={chapitresAjoutables.length === 0}>
                  + Ajouter un chapitre
                </button>
              )}
              <p className="annonce-aide">
                Le chapitre en cours de la classe s’ouvre d’office ; le chapitre précédent aussi quand la classe l’a vu ces 14 derniers jours (ses points vus ces 7 derniers jours sont cochés).
              </p>
            </fieldset>
          ) : (
            <fieldset className="annonce-groupe">
              <legend className="annonce-question">
                <span className="annonce-etape-num petit" aria-hidden="true">
                  2
                </span>{' '}
                Sur quoi&nbsp;?
              </legend>
              <div className="compte-champ">
                <label htmlFor={`${id}-chapitre`}>Chapitre</label>
                <select
                  id={`${id}-chapitre`}
                  value={chapitreCle}
                  onChange={(e) => {
                    setChapitreCle(e.target.value)
                    setEtapesD(new Set())
                    setDecoches(new Set())
                  }}
                >
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
              {chapitreD && (
                <div className="annonce-etapes-liste" role="group" aria-label="Points du devoir">
                  {structureD.map((s) => {
                    const e = etatsD.get(s.id)
                    return (
                      <label key={s.id} className="annonce-case">
                        <input type="checkbox" checked={etapesD.has(s.id)} onChange={() => setEtapesD((avant) => new Set(basculer([...avant], s.id)))} />
                        <span>
                          <strong>{s.numero}.</strong> <RichText text={s.titre} /> <span className={`annonce-etat ${e?.etat ?? 'pas-vue'}`}>{texteVu(e, aujourdhui)}</span>
                        </span>
                      </label>
                    )
                  })}
                </div>
              )}
              <div className="compte-champ">
                <label htmlFor={`${id}-consigne`}>Consigne</label>
                <textarea id={`${id}-consigne`} rows={3} value={consigne} onChange={(e) => setConsigne(e.target.value)} aria-invalid={erreurs.devoir ? true : undefined} aria-describedby={erreurs.devoir ? `${id}-devoir-err` : `${id}-consigne-aide`} />
                <p id={`${id}-consigne-aide`} className="annonce-aide">
                  Telle quelle sur la page des élèves (par exemple « Exercices 4 et 5 page 32 »).
                  {modifDevoir && consigne.trim() !== modifDevoir.seance.devoir.trim() && (
                    <>
                      {' '}
                      <span className="annonce-marque change">consigne changée</span>
                    </>
                  )}
                </p>
              </div>
              {chapitreD && (
                <div className="annonce-exos-devoir">
                  <p className="annonce-sous-question">
                    Exercices en ligne joints<span className="annonce-question-suite"> — proposés d’après les points cochés</span>
                  </p>
                  {proposesD.length === 0 ? (
                    <p className="annonce-aide">{etapesD.size === 0 ? 'Coche un point pour voir ses exercices.' : 'Pas d’exercice en ligne pour ces points.'}</p>
                  ) : (
                    <ul className="annonce-exos">
                      {proposesD.map((g) => {
                        const pris = !decoches.has(g.id)
                        return (
                          <li key={g.id}>
                            <button type="button" className={`annonce-exo${pris ? '' : ' retire'}`} aria-pressed={pris} onClick={() => setDecoches((avant) => new Set(basculer([...avant], g.id)))}>
                              <span className="annonce-code">{g.id}</span> <span className="annonce-exo-titre">{g.titre}</span>
                              {modifDevoir && pris && !joints0.includes(g.id) && <Marque quoi="ajoute" />}
                              {modifDevoir && !pris && joints0.includes(g.id) && <Marque quoi="retire" />}
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                  {erreurs.devoir && (
                    <p id={`${id}-devoir-err`} className="compte-erreur-champ annonce-erreur" tabIndex={-1}>
                      {erreurs.devoir}
                    </p>
                  )}
                </div>
              )}
            </fieldset>
          )}
        </section>

        <div className="annonce-droite">
          {enModif && (
            <section className="ep-carte annonce-changements" aria-labelledby={`${id}-chg`}>
              <h2 id={`${id}-chg`} className="annonce-question">
                <span className="annonce-etape-num petit" aria-hidden="true">
                  3
                </span>{' '}
                Ce qui va changer
              </h2>
              {changements.length === 0 ? (
                <p className="annonce-aide">Rien n’a changé pour l’instant.</p>
              ) : (
                <dl className="annonce-recap">
                  {changements.map((c) => (
                    <div key={c.quoi}>
                      <dt>{c.quoi}</dt>
                      <dd>
                        {c.lignes.map((l) => (
                          <span key={l}>{l}</span>
                        ))}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </section>
          )}

          <section className="ep-carte annonce-apercu" aria-labelledby={`${id}-apercu`}>
            <p className="annonce-surtitre" id={`${id}-apercu`}>
              {enModif ? 'Ce que verront tes élèves' : 'Ce que verront tes élèves'}
            </p>
            {evaluation ? (
              apercu ? (
                <BlocEvaluation interro={apercu} aujourdhui={aujourdhui} plan={lienPlan} nouvelOnglet />
              ) : (
                <p className="annonce-aide">Choisis la date pour voir le bloc publié.</p>
              )
            ) : (
              <>
                <p className="annonce-apercu-titre">
                  Devoir{dateValide ? ` pour le ${jourCourt(saisie.date)} (${dans(saisie.date, aujourdhui)})` : ''}
                </p>
                {consigne.trim() && <p className="annonce-apercu-consigne">{consigne.trim()}</p>}
                {retenusD.length > 0 && <p className="annonce-apercu-sujet">Exercices en ligne : {retenusD.join(', ')}</p>}
              </>
            )}
          </section>

          <section className="ep-carte annonce-publier" aria-labelledby={`${id}-publier`}>
            <h2 id={`${id}-publier`} className="annonce-question">
              {enModif ? 'Enregistrer' : 'Publier'}
            </h2>
            {enModif ? (
              <>
                <label className="annonce-case">
                  <input type="checkbox" checked={prevenir} onChange={(e) => setPrevenir(e.target.checked)} disabled={!message} />
                  <span>Copier un message pour prévenir les élèves</span>
                </label>
                {message && prevenir && <p className="annonce-message">{message}</p>}
                <p className="annonce-aide">La même {evaluation ? 'évaluation' : 'séance'} est mise à jour (jamais une seconde) ; la page des élèves se republie seule.</p>
              </>
            ) : (
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
                  {evaluation ? (ctx.agenda.actif ? 'Dans ton agenda (rappels 7 et 2 jours avant)' : 'Agenda pas encore activé (migration 0006)') : `Dans ton agenda${dateValide ? ` (« À rendre » le ${dateCourteDevoir(saisie.date)})` : ''}`}
                </Canal>
                <li>
                  <label className="annonce-case">
                    <input type="checkbox" checked={copier} onChange={(e) => setCopier(e.target.checked)} disabled={!textes} />
                    <span>Copier le texte pour le journal de classe / Smartschool (mêmes informations, codes des exercices compris)</span>
                  </label>
                  {copier && textes && (
                    <details className="annonce-texte">
                      <summary>Voir le texte copié</summary>
                      <pre>{textes.texte}</pre>
                    </details>
                  )}
                </li>
              </ul>
            )}
            {evaluation && !ctx.agenda.actif && <MessageAgendaInactif compact />}
            {!ctx.devoirs && <MessageDevoirsInactif quoi={evaluation ? 'Les points évalués et les exercices proposés' : 'La date de remise et les exercices joints'} />}
            <div className="annonce-boutons">
              <button type="button" className="ep-bouton principal" disabled={occupe || bloque || (enModif && changements.length === 0)} onClick={() => envoyer(false)}>
                {enModif ? 'Enregistrer les modifications' : evaluation ? 'Annoncer' : 'Donner le devoir'}
              </button>
              {evaluation && !enModif && (
                <button type="button" className="ep-bouton" disabled={occupe || bloque} onClick={() => envoyer(true)}>
                  Annoncer et préparer l’évaluation <span aria-hidden="true">›</span>
                </button>
              )}
              {enModif && onAnnuler && (
                <button type="button" className="ep-bouton" onClick={onAnnuler}>
                  Annuler
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
