import { useEffect, useId, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { RichText } from '../Math'
import { findChapter, LEVELS } from '../../content/chaptersIndex'
import {
  NUMERO_HEURE_MAX,
  dateIso,
  dateLongue,
  erreursSeance,
  generateursChapitre,
  heureChamp,
  horaireParDefaut,
  horaireTexte,
  minutesHeure,
  normaliserParties,
  numeroHeureTexte,
  structureChapitre,
  texteBrut,
  unitesCouvertes,
  unitesSection,
  type Classe,
  type ErreursSeance,
  type ReglagesCarnet,
  type SaisieSeance,
  type Seance,
  type TypeEvaluation,
} from '../../lib/carnet'
import { champHeure, creneauPropose, creneauxDuJour, creneauxPonctuels, libelleCreneau, numerosCreneau, type CaseHoraire, type Creneau, type GrilleHoraire } from '../../lib/horaire'
import { avertissementsInterro, dateJourLong, predicatSuppression } from '../../lib/agendaEvenements'
import { ajouterJours } from '../../lib/calendrierFwb'
import { aUnDevoir, choixDeLaDate, dateCourteDevoir, LIBELLE_EVALUATION, NOM_PROCESSUS, prochainsCours, type ChoixPourLe } from '../../lib/carnetDevoirs'
import { urlEvaluationMatiere } from '../../lib/carnetMatiere'
import { titreCourtChapitre } from '../../entrainement/export/examen'
import { AvertissementsInterro, MessageAgendaInactif } from './AgendaUi'
import { useCarnet } from './contexteCarnet'
import { generateursEvaluation, useTableProcessus, type GenerateurEvaluation } from './processusCarnet'
import { chapitreEnCours, chapitreParDefaut, heureCourte, jourMois } from './outilsCarnet'
import { chapitresDansMonOrdre, numeroRepere, ordreCourant } from '../../lib/ordreChapitres'

/** Interro à annoncer / contrôle-bilan : ce qu'il faut pour créer ou mettre à jour l'événement
 * « Interrogation » de l'agenda (0006). */
export interface AnnonceEvaluation {
  date: string
  heureDebut: number | null
  heureFin: number | null
}

type Bloc = 'matiere' | 'devoir' | 'evaluation' | 'remarque'

const cleCreneau = (c: Pick<Creneau, 'ecole_id' | 'heureDebut' | 'ponctuel'>) => `${c.ecole_id}|${c.heureDebut}${c.ponctuel ? '|ponctuel' : ''}`

/**
 * « Noter une séance » / « Modifier la séance » : contenu du panneau latéral commun (`PanneauLateral`).
 * En tête, le résumé « 5B · vendredi 20 novembre · H2 (09h35 → 10h25) · changer » : classe, date et
 * créneau pré-remplis (depuis le créneau cliqué), modifiables en dépliant « changer ». Puis chapitre
 * (celui en cours de la classe proposé), sections / sous-parties cochées avec « vu le … » (une case de
 * section coche toutes ses sous-parties), exercices faits, devoir, remarque privée, aperçu du texte
 * Smartschool en direct, et Annuler / Enregistrer / Enregistrer et copier pour Smartschool.
 *
 * Aucun champ numérique libre (règle CLAUDE.md) : date et heures en `type="date"` / `type="time"`,
 * numéro d'heure en liste.
 *
 * Avec un horaire (0003 + grille) : liste « Créneau de l'horaire » des créneaux du jour choisi
 * (« H2 (09h35 → 10h25) · 4Ge ») ; en choisir un règle classe, numéro(s) d'heure et plage ensemble
 * (heure double comprise). « Autre horaire » garde la saisie libre d'avant.
 *
 * Heure zéro (0004) : une H0 fixe est un créneau comme les autres (« H0–H1 » compris) ; une H0
 * PONCTUELLE (vide dans l'horaire) est quand même proposée pour la date choisie, « H0 (07h55 →
 * 08h45) · heure zéro ponctuelle », sans classe imposée : la choisir règle numéro 0 et plage, la classe
 * reste celle choisie. Sans grille, la liste des numéros propose « heure zéro » si 0004 est appliqué.
 *
 * Maquette « Noter la séance » du 24/11/2026 : blocs repliables Matière vue · Devoir · Évaluation ·
 * Remarque privée. Devoir (0007) : consigne, « Pour le » = prochain cours effectif / le suivant
 * (`carnetDevoirs.ts::prochainsCours` : horaire de la classe, congés FWB, heures supprimées par
 * l'agenda) / autre date, exercices en ligne joints. Évaluation (0007) : annoncer une interro ou un
 * contrôle-bilan (date, heure facultative → événement « Interrogation » de l'agenda, avertissements
 * de remise des points) ou interro faite aujourd'hui (notée dans la séance seulement) ; parties
 * évaluées ; « Préparer l'évaluation » (panneau prérempli, `?matiere=`) et « Choisir dans mon coffre »
 * (filtré sur le niveau et le chapitre) s'ouvrent dans un nouvel onglet : la saisie reste ici.
 */
export function FormulaireSeance({
  classes,
  seances,
  reglages,
  initiale,
  prerempli,
  horaire = null,
  heureZero = false,
  occupe,
  titreId,
  apercu,
  avecGrille,
  onEnregistrer,
  onAnnuler,
}: {
  classes: Classe[]
  seances: Seance[]
  reglages: ReglagesCarnet
  initiale: Seance | null
  /** `chapitreChoisi` : chapitre demandé explicitement (bouton « Carnet » d'un chapitre) — il ne suit
   * pas un changement de classe. */
  prerempli: { classeId: string; chapitre: string; date?: string; creneau?: Creneau | null; chapitreChoisi?: boolean }
  /** Grilles et cases de l'horaire ; `null` sans horaire (0003 absent ou aucune grille). */
  horaire?: { grilles: GrilleHoraire[]; cases: CaseHoraire[] } | null
  /** 0004 appliqué : le numéro 0 (« heure zéro ») est accepté par la base. */
  heureZero?: boolean
  occupe: boolean
  /** Id du titre (`aria-labelledby` du panneau). */
  titreId: string
  /** Texte Smartschool de la saisie (même calcul que la copie d'une séance enregistrée). */
  apercu: (s: SaisieSeance) => string
  /** L'école de cette classe a une grille horaire (format « H2 (09h35 → 10h25) »). */
  avecGrille: (classeId: string) => boolean
  /** `copier` : « Enregistrer et copier » ; `annonce` : l'interro à créer / mettre à jour dans l'agenda. */
  onEnregistrer: (s: SaisieSeance, copier: boolean, annonce: AnnonceEvaluation | null) => void
  onAnnuler: () => void
}) {
  const id = useId()
  const formulaire = useRef<HTMLFormElement>(null)
  const dateDepart = initiale?.date_seance ?? prerempli.creneau?.date ?? prerempli.date ?? dateIso(new Date())
  // Créneaux de l'horaire ce jour-là, plus les heures zéro ponctuelles (sans classe), par heure de début.
  const creneauxDe = (d: string): Creneau[] =>
    horaire && /^\d{4}-\d{2}-\d{2}$/.test(d)
      ? [...creneauxDuJour(d, horaire.grilles, horaire.cases).creneaux, ...creneauxPonctuels(d, horaire.grilles, horaire.cases)].sort((a, b) => a.debut - b.debut || a.heureDebut - b.heureDebut)
      : []
  // Créneau de départ : celui demandé ; pour une séance existante, celui qui commence à son heure ;
  // sinon le créneau en cours (ou le plus proche) de la classe ce jour-là.
  const creneauDepart = useMemo<Creneau | null>(() => {
    const liste = creneauxDe(dateDepart)
    if (prerempli.creneau && !initiale) return liste.find((c) => cleCreneau(c) === cleCreneau(prerempli.creneau as Creneau)) ?? null
    if (initiale) return liste.find((c) => (c.ponctuel || c.classe_id === initiale.classe_id) && c.heureDebut === initiale.numero_heure) ?? null
    const maintenant = new Date()
    const idem = dateDepart === dateIso(maintenant)
    return creneauPropose(
      liste.filter((c) => c.classe_id === prerempli.classeId),
      idem ? maintenant.getHours() * 60 + maintenant.getMinutes() : 0,
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- valeur de départ seulement
  }, [])
  const [classeId, setClasseId] = useState(initiale?.classe_id ?? (creneauDepart && !creneauDepart.ponctuel ? creneauDepart.classe_id : prerempli.classeId))
  const [date, setDate] = useState(dateDepart)
  const horaireInitial = useMemo(
    () =>
      initiale
        ? { heure_debut: initiale.heure_debut, heure_fin: initiale.heure_fin, numero_heure: initiale.numero_heure, numero_heure_fin: initiale.numero_heure_fin ?? null }
        : creneauDepart
          ? { heure_debut: champHeure(creneauDepart.debut), heure_fin: champHeure(creneauDepart.fin), numero_heure: creneauDepart.heureDebut, numero_heure_fin: creneauDepart.heureFin > creneauDepart.heureDebut ? creneauDepart.heureFin : null }
          : { ...horaireParDefaut(new Date(), reglages.duree_heure, seances.filter((s) => s.classe_id === prerempli.classeId), dateDepart), numero_heure_fin: null },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- valeur de départ seulement
    [],
  )
  const [debut, setDebut] = useState(horaireInitial.heure_debut ? heureChamp(minutesHeure(horaireInitial.heure_debut) ?? 0) : '')
  const [fin, setFin] = useState(horaireInitial.heure_fin ? heureChamp(minutesHeure(horaireInitial.heure_fin) ?? 0) : '')
  const [numero, setNumero] = useState(horaireInitial.numero_heure !== null ? String(horaireInitial.numero_heure) : '')
  const [numeroFin, setNumeroFin] = useState(horaireInitial.numero_heure_fin !== null ? String(horaireInitial.numero_heure_fin) : '')
  const [creneauCle, setCreneauCle] = useState(creneauDepart ? cleCreneau(creneauDepart) : '')
  const [horaireTouche, setHoraireTouche] = useState(initiale !== null)
  const creneauxDate = useMemo(
    () => creneauxDe(date),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `horaire` change avec les données
    [date, horaire],
  )
  const [chapitreCle, setChapitreCle] = useState(initiale ? `${initiale.niveau}/${initiale.chapitre}` : prerempli.chapitre)
  const [chapitreTouche, setChapitreTouche] = useState(initiale !== null || prerempli.chapitreChoisi === true)
  // Classe / date / créneau repliés derrière « changer » (dépliés d'office sans classe).
  const [changer, setChanger] = useState(!classeId)
  const [erreursAFocaliser, setErreursAFocaliser] = useState(0)
  const [niveau, chapitreSlug] = chapitreCle.split('/')
  const chapitre = niveau && chapitreSlug ? findChapter(niveau, chapitreSlug) : undefined
  const structure = useMemo(() => (chapitre ? structureChapitre(chapitre) : []), [chapitre])
  const generateurs = useMemo(() => (chapitre ? generateursChapitre(chapitre) : []), [chapitre])
  const [coches, setCoches] = useState<Set<string>>(() => (initiale && chapitre ? unitesCouvertes(initiale.parties, structureChapitre(chapitre)) : new Set()))
  const [gens, setGens] = useState<Set<string>>(() => new Set(initiale?.generateurs ?? []))
  const [devoir, setDevoir] = useState(initiale?.devoir ?? '')
  const [remarque, setRemarque] = useState(initiale?.remarque ?? '')
  const [erreurs, setErreurs] = useState<ErreursSeance>({})
  const ctx = useCarnet()
  const devoirsActifs = ctx.devoirs
  const [gensDevoir, setGensDevoir] = useState<Set<string>>(() => new Set(initiale?.devoir_generateurs ?? []))
  const [tousGensDevoir, setTousGensDevoir] = useState(false)
  // « Pour le » : prochains cours EFFECTIFS de la classe après la date de la séance.
  const coursClasse = useMemo(
    () =>
      horaire && classeId && /^\d{4}-\d{2}-\d{2}$/.test(date)
        ? prochainsCours({ classeId, apres: date, grilles: horaire.grilles, cases: horaire.cases, evenements: ctx.agenda.actif ? ctx.agenda.evenements : [], classes, n: 2 })
        : [],
    [horaire, classeId, date, ctx.agenda, classes],
  )
  const [pourLe, setPourLe] = useState<ChoixPourLe>(() => (initiale ? (initiale.devoir_pour ? 'autre' : 'prochain') : 'prochain'))
  const [pourDate, setPourDate] = useState(initiale?.devoir_pour ?? '')
  // Séance existante : la puce qui correspond à sa date de remise (une fois les cours calculés).
  const pourInitialise = useRef(false)
  useEffect(() => {
    if (pourInitialise.current || !initiale) return
    pourInitialise.current = true
    if (initiale.devoir_pour) setPourLe(choixDeLaDate(initiale.devoir_pour, coursClasse))
  }, [initiale, coursClasse])
  const dateRemise = pourLe === 'prochain' ? (coursClasse[0]?.date ?? null) : pourLe === 'suivant' ? (coursClasse[1]?.date ?? null) : pourDate || null
  const aDuDevoir = aUnDevoir({ devoir, devoir_generateurs: [...gensDevoir] })
  // Évaluation.
  const evenementLie = initiale?.evaluation_evenement ? (ctx.agenda.evenements.find((e) => e.id === initiale.evaluation_evenement) ?? null) : null
  const [typeEval, setTypeEval] = useState<TypeEvaluation | null>(initiale?.evaluation_type ?? null)
  const [evalDate, setEvalDate] = useState(evenementLie?.du ?? '')
  const [evalHeure, setEvalHeure] = useState(evenementLie && !evenementLie.journee_entiere && evenementLie.heure_debut !== null ? `${evenementLie.heure_debut}-${evenementLie.heure_fin}` : '')
  const [partiesEval, setPartiesEval] = useState<Set<string>>(() => new Set(initiale?.evaluation_parties ?? []))
  const [erreurEval, setErreurEval] = useState<string | null>(null)
  // Générateurs de l'évaluation (table du panneau des évaluations, chargée à part) : sous chaque section
  // cochée de « Matière », tous cochés par défaut ; on garde ceux que le professeur DÉCOCHE. Enregistré
  // (0008) : la liste des retenus, vide = tous (règle d'avant 0008, et quand tout reste coché).
  const tablePrete = useTableProcessus()
  const gensEvalChapitre = useMemo<GenerateurEvaluation[] | null>(() => (chapitre && tablePrete ? generateursEvaluation(chapitre.slug) : null), [chapitre, tablePrete])
  const [decochesEval, setDecochesEval] = useState<Set<string>>(() => new Set())
  // Séance existante : les générateurs non retenus des sections évaluées, une fois la table arrivée.
  const decochesInitialises = useRef(false)
  useEffect(() => {
    if (decochesInitialises.current || !gensEvalChapitre) return
    decochesInitialises.current = true
    const retenus = initiale?.evaluation_generateurs ?? []
    if (retenus.length === 0) return
    const parties = new Set(initiale?.evaluation_parties ?? [])
    setDecochesEval(new Set(gensEvalChapitre.filter((g) => parties.has(g.sectionId) && !retenus.includes(g.generatorId)).map((g) => g.generatorId)))
  }, [gensEvalChapitre, initiale])
  const sectionsEvalCochees = structure.filter((x) => partiesEval.has(x.id)).map((x) => x.id)
  /** Générateurs des sections cochées (ordre du chapitre, puis de la table). */
  const gensSectionsEval = gensEvalChapitre ? sectionsEvalCochees.flatMap((sid) => gensEvalChapitre.filter((g) => g.sectionId === sid)) : []
  const gensEvalRetenus = gensSectionsEval.filter((g) => !decochesEval.has(g.generatorId)).map((g) => g.generatorId)
  /** Un choix partiel seulement (tout coché, ou rien : « tous ») ; table pas encore là : la liste d'avant. */
  const choixGensPartiel = gensEvalRetenus.length > 0 && gensEvalRetenus.length < gensSectionsEval.length
  const gensEvalEnregistres = gensEvalChapitre
    ? choixGensPartiel
      ? [...gensEvalRetenus, ...(initiale?.evaluation_generateurs ?? []).filter((id) => !gensEvalChapitre.some((g) => g.generatorId === id))]
      : []
    : (initiale?.evaluation_generateurs ?? [])
  const [blocs, setBlocs] = useState<Record<Bloc, boolean>>(() => ({
    matiere: true,
    devoir: true,
    evaluation: (initiale?.evaluation_type ?? null) !== null,
    remarque: (initiale?.remarque ?? '') !== '',
  }))
  const basculerBloc = (b: Bloc) => setBlocs((x) => ({ ...x, [b]: !x[b] }))

  const classe = classes.find((c) => c.id === classeId)
  const plage = reglages.format_horaire === 'plage'

  /** Première date où chaque unité a été vue par CETTE classe (hors séance modifiée). */
  const dejaVu = useMemo(() => {
    const m = new Map<string, string>()
    if (!chapitre) return m
    for (const s of seances) {
      if (s.classe_id !== classeId || s.id === initiale?.id || s.niveau !== chapitre.levelSlug || s.chapitre !== chapitre.slug) continue
      for (const u of unitesCouvertes(s.parties, structure)) if (!m.has(u) || s.date_seance < (m.get(u) as string)) m.set(u, s.date_seance)
    }
    return m
  }, [seances, classeId, initiale?.id, chapitre, structure])

  function appliquerCreneau(c: Creneau | null) {
    setCreneauCle(c ? cleCreneau(c) : '')
    if (!c) return
    // H0 ponctuelle : pas de classe imposée, la classe choisie reste.
    if (!c.ponctuel) setClasseId(c.classe_id)
    setDebut(champHeure(c.debut))
    setFin(champHeure(c.fin))
    setNumero(String(c.heureDebut))
    setNumeroFin(c.heureFin > c.heureDebut ? String(c.heureFin) : '')
    setHoraireTouche(true)
  }

  function changerDate(nouvelle: string) {
    setDate(nouvelle)
    if (!horaire) return
    const actuel = creneauxDate.find((c) => cleCreneau(c) === creneauCle)
    // H0 ponctuelle : la même ce jour-là si elle existe (même école).
    const ponctuelle = actuel?.ponctuel ? creneauxDe(nouvelle).find((c) => c.ponctuel && c.ecole_id === actuel.ecole_id) : undefined
    if (ponctuelle) {
      appliquerCreneau(ponctuelle)
      return
    }
    const liste = creneauxDe(nouvelle).filter((c) => !c.ponctuel && c.classe_id === classeId)
    // Même classe ce jour-là : le créneau qui commence à la même heure, sinon le premier.
    const suivant = liste.find((c) => actuel && c.heureDebut === actuel.heureDebut) ?? liste[0] ?? null
    if (suivant) appliquerCreneau(suivant)
    else if (creneauCle) {
      setCreneauCle('')
      setNumero('')
      setNumeroFin('')
    }
  }

  function changerClasse(nouvelle: string) {
    setClasseId(nouvelle)
    const actuelPonctuel = creneauxDate.find((c) => cleCreneau(c) === creneauCle)?.ponctuel === true
    if (horaire && !actuelPonctuel) {
      const actuel = creneauxDate.find((c) => cleCreneau(c) === creneauCle)
      const liste = creneauxDate.filter((c) => !c.ponctuel && c.classe_id === nouvelle)
      const suivant = liste.find((c) => actuel && c.heureDebut === actuel.heureDebut) ?? liste[0] ?? null
      if (suivant) appliquerCreneau(suivant)
      else if (creneauCle) {
        // Le numéro d'heure du créneau quitté ne vaut pas pour cette classe.
        setCreneauCle('')
        setNumero('')
        setNumeroFin('')
      }
    }
    // Avec un créneau de l'horaire pour cette classe, ses heures priment sur l'horaire « par défaut ».
    const creneauTrouve = horaire !== null && (actuelPonctuel || creneauxDate.some((c) => !c.ponctuel && c.classe_id === nouvelle))
    if (!horaireTouche && !initiale && !creneauTrouve) {
      const h = horaireParDefaut(new Date(), reglages.duree_heure, seances.filter((s) => s.classe_id === nouvelle), date)
      setDebut(h.heure_debut ?? '')
      setFin(h.heure_fin ?? '')
      setNumero(h.numero_heure !== null ? String(h.numero_heure) : '')
    }
    // Chapitre pas encore choisi à la main et rien de coché : celui en cours de la nouvelle classe.
    if (!chapitreTouche && coches.size === 0 && gens.size === 0) {
      const propose = chapitreParDefaut(nouvelle, classes, seances)
      if (propose && propose !== chapitreCle) changerChapitre(propose, false)
    }
  }

  function changerChapitre(cle: string, touche = true) {
    setChapitreCle(cle)
    setChapitreTouche(touche)
    setCoches(new Set())
    setGens(new Set())
    setGensDevoir(new Set())
    setPartiesEval(new Set())
    setDecochesEval(new Set())
  }

  function basculer(ids: string[], cocher: boolean) {
    setCoches((avant) => {
      const s = new Set(avant)
      ids.forEach((u) => (cocher ? s.add(u) : s.delete(u)))
      return s
    })
  }

  function saisieCourante(): SaisieSeance {
    return {
      classe_id: classeId,
      date_seance: date,
      heure_debut: debut || null,
      heure_fin: debut ? fin || null : null,
      numero_heure: numero ? Number(numero) : null,
      numero_heure_fin: numero && numeroFin ? Number(numeroFin) : null,
      niveau: chapitre?.levelSlug ?? '',
      chapitre: chapitre?.slug ?? '',
      parties: normaliserParties(coches, structure),
      generateurs: generateurs.filter((g) => gens.has(g.id)).map((g) => g.id),
      devoir,
      remarque,
      ...(devoirsActifs
        ? {
            devoir_pour: aDuDevoir ? dateRemise : null,
            devoir_generateurs: generateurs.filter((g) => gensDevoir.has(g.id)).map((g) => g.id),
            objectif: initiale?.objectif ?? '',
            competences: initiale?.competences ?? [],
            evaluation_type: typeEval,
            evaluation_parties: typeEval ? structure.filter((x) => partiesEval.has(x.id)).map((x) => x.id) : [],
            evaluation_evenement: typeEval === 'annonce' || typeEval === 'bilan' ? (evenementLie?.id ?? null) : null,
            evaluation_generateurs: typeEval ? gensEvalEnregistres : [],
          }
        : {}),
    }
  }

  /** Interro annoncée / contrôle-bilan : date (après la séance) et heure facultative. */
  function annonceCourante(): { annonce: AnnonceEvaluation | null; erreur: string | null } {
    if (!devoirsActifs || (typeEval !== 'annonce' && typeEval !== 'bilan')) return { annonce: null, erreur: null }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(evalDate)) return { annonce: null, erreur: 'Choisis la date de l’interro.' }
    if (evalDate < date) return { annonce: null, erreur: 'Une interro annoncée a lieu après la séance : choisis une date qui suit (ou « Interro faite aujourd’hui »).' }
    const [a, b] = evalHeure ? evalHeure.split('-').map(Number) : [null, null]
    return { annonce: { date: evalDate, heureDebut: a, heureFin: b }, erreur: null }
  }

  function envoyer(copier: boolean) {
    const saisie = saisieCourante()
    const err = erreursSeance(saisie)
    const ev = annonceCourante()
    setErreurs(err)
    setErreurEval(ev.erreur)
    if (Object.keys(err).length === 0 && !ev.erreur) {
      onEnregistrer(saisie, copier, ev.annonce)
      return
    }
    // Classe, date ou horaire en erreur : déplier « changer » pour les montrer ; bloc fermé : l'ouvrir.
    if (err.classe || err.date || err.horaire) setChanger(true)
    setBlocs((x) => ({
      ...x,
      matiere: x.matiere || !!err.chapitre,
      devoir: x.devoir || !!err.devoir || !!err.devoirPour,
      evaluation: x.evaluation || !!ev.erreur,
      remarque: x.remarque || !!err.remarque,
    }))
    setErreursAFocaliser((n) => n + 1)
  }

  // Évaluation : créneaux de la classe le jour de l'interro (heure facultative).
  const creneauxEval = useMemo(() => {
    if (!horaire || !classeId || !/^\d{4}-\d{2}-\d{2}$/.test(evalDate)) return []
    const supprimee = ctx.ctxAgenda ? predicatSuppression(ctx.ctxAgenda) : undefined
    return creneauxDuJour(evalDate, horaire.grilles, horaire.cases.filter((c) => c.classe_id === classeId), { supprimee }).creneaux
  }, [horaire, classeId, evalDate, ctx.ctxAgenda])

  function changerDateEval(d: string) {
    setEvalDate(d)
    const cle = evalHeure
    if (!cle || !horaire || !classeId || !/^\d{4}-\d{2}-\d{2}$/.test(d)) return
    // L'heure choisie ne vaut que si la classe a cours à cette heure-là ce nouveau jour.
    const ok = creneauxDuJour(d, horaire.grilles, horaire.cases.filter((c) => c.classe_id === classeId)).creneaux.some((c) => `${c.heureDebut}-${c.heureFin}` === cle)
    if (!ok) setEvalHeure('')
  }

  function choisirTypeEval(t: TypeEvaluation) {
    setTypeEval(t)
    setErreurEval(null)
    // Parties : celles déjà vues par la classe dans ce chapitre (et cochées aujourd'hui), toutes cochées.
    if (partiesEval.size === 0) setPartiesEval(new Set(sectionsEval.map((x) => x.id)))
    if ((t === 'annonce' || t === 'bilan') && !evalDate) {
      // Date proposée : le premier cours de la classe au moins une semaine après la séance.
      const dans = horaire && classeId && /^\d{4}-\d{2}-\d{2}$/.test(date) ? prochainsCours({ classeId, apres: ajouterJours(date, 6), grilles: horaire.grilles, cases: horaire.cases, evenements: ctx.agenda.evenements, classes, n: 1 })[0] : undefined
      if (dans) {
        setEvalDate(dans.date)
        setEvalHeure(`${dans.creneau.heureDebut}-${dans.creneau.heureFin}`)
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(date)) setEvalDate(ajouterJours(date, 7))
    }
  }

  // Après une tentative refusée : focus sur le premier champ en erreur.
  useEffect(() => {
    if (erreursAFocaliser === 0) return
    formulaire.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
  }, [erreursAFocaliser])

  const niveauxOrdonnes = classe?.niveau ? [...LEVELS.filter((l) => l.slug === classe.niveau), ...LEVELS.filter((l) => l.slug !== classe.niveau)] : LEVELS
  const nbCochees = normaliserParties(coches, structure).length
  const nbGens = gens.size
  const enCours = classeId ? chapitreEnCours(classeId, seances.filter((s) => s.id !== initiale?.id)) : ''
  const saisie = saisieCourante()
  const horaireResume = horaireTexte(
    { heure_debut: saisie.heure_debut, heure_fin: saisie.heure_fin, numero_heure: saisie.numero_heure, numero_heure_fin: saisie.numero_heure_fin },
    reglages.format_horaire,
    classeId ? avecGrille(classeId) : false,
  )
  const dateValide = /^\d{4}-\d{2}-\d{2}$/.test(date)
  const texteApercu = classe && chapitre && dateValide ? apercu(saisie) : null
  // Exercices à joindre : ceux des sections cochées aujourd'hui (et ceux déjà joints), comme la maquette ;
  // « Tous les exercices du chapitre » déplie la liste complète. Rien de coché : la liste complète.
  const sectionsCochees = new Set(structure.filter((x) => unitesSection(x).some((u) => coches.has(u))).map((x) => x.id))
  const gensDevoirVisibles = tousGensDevoir || sectionsCochees.size === 0 ? generateurs : generateurs.filter((g) => (g.sectionId !== null && sectionsCochees.has(g.sectionId)) || gensDevoir.has(g.id) || gens.has(g.id))
  // Sections déjà vues par la classe dans ce chapitre, plus celles cochées aujourd'hui.
  const sectionsEval = structure.filter((x) => unitesSection(x).some((u) => coches.has(u) || dejaVu.has(u)))
  const avertissementsEval =
    devoirsActifs && classe && ctx.agenda.actif && (typeEval === 'annonce' || typeEval === 'bilan') && /^\d{4}-\d{2}-\d{2}$/.test(evalDate)
      ? avertissementsInterro({ date: evalDate, ecoleId: classe.ecole_id, periodes: ctx.agenda.periodes, evenements: ctx.agenda.evenements.filter((e) => e.id !== evenementLie?.id), seuil: ctx.agenda.seuil, aujourdhui: dateIso(new Date()) })
      : []
  const sectionsChoisies = structure.filter((x) => partiesEval.has(x.id)).map((x) => x.id)
  const lienEvaluation =
    chapitre && classe && sectionsChoisies.length > 0
      ? urlEvaluationMatiere({ levelSlug: chapitre.levelSlug, chapitres: [{ slug: chapitre.slug, sections: sectionsChoisies, ...(gensEvalEnregistres.length > 0 ? { generateurs: gensEvalEnregistres } : {}) }] }, '', classe.nom, classe.id)
      : null
  const lienCoffre = chapitre ? `/coffre?niveau=${encodeURIComponent(chapitre.levelSlug)}&q=${encodeURIComponent(titreCourtChapitre(chapitre.slug, texteBrut(chapitre.title)))}` : '/coffre'
  const resumeMatiere = chapitre ? `${nbCochees} partie${nbCochees > 1 ? 's' : ''}${nbGens > 0 ? ` · ${nbGens} exercice${nbGens > 1 ? 's' : ''}` : ''}` : ''
  const resumeDevoirBloc = aDuDevoir ? (dateRemise && devoirsActifs ? `pour le ${dateCourteDevoir(dateRemise)}` : 'noté') : ''
  const resumeEvaluation = typeEval ? (typeEval === 'faite' ? 'faite aujourd’hui' : evalDate ? `${typeEval === 'bilan' ? 'contrôle' : 'interro'} ${dateCourteDevoir(evalDate)}` : LIBELLE_EVALUATION[typeEval]) : ''

  return (
    <form ref={formulaire} className="carnet-form-panneau" onSubmit={(e: FormEvent) => (e.preventDefault(), envoyer(false))} noValidate aria-labelledby={titreId}>
      <div className="carnet-panneau-tete">
        <div className="carnet-panneau-titres">
          <h2 id={titreId}>{initiale ? 'Modifier la séance' : 'Noter la séance'}</h2>
          <p className="carnet-panneau-resume">
            <strong>{classe?.nom ?? 'Classe à choisir'}</strong>
            {dateValide && <> · {dateLongue(date, true).replace(/ \d{4}$/, '')}</>}
            {horaireResume && <> · {horaireResume}</>}
            {' · '}
            <button type="button" className="compte-bouton-lien carnet-lien-changer" aria-expanded={changer} aria-controls={`${id}-quand`} onClick={() => setChanger(!changer)}>
              {changer ? 'masquer' : 'changer'}
              <span className="carnet-sr"> la classe, la date ou l’heure</span>
            </button>
          </p>
        </div>
        <button type="button" className="carnet-bouton carnet-fermer" aria-label="Fermer" onClick={onAnnuler}>
          <span aria-hidden="true">×</span>
        </button>
      </div>

      <div className="carnet-panneau-corps">
        <div id={`${id}-quand`} className="carnet-panneau-quand" hidden={!changer}>
          <div className="carnet-grille">
            <div className="compte-champ">
              <label htmlFor={`${id}-classe`}>Classe</label>
              <select id={`${id}-classe`} value={classeId} onChange={(e) => changerClasse(e.target.value)} aria-invalid={erreurs.classe ? true : undefined}>
                <option value="">— choisir —</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nom}
                  </option>
                ))}
              </select>
              {erreurs.classe && <p className="compte-erreur-champ">{erreurs.classe}</p>}
            </div>
            <div className="compte-champ">
              <label htmlFor={`${id}-date`}>Date</label>
              <input id={`${id}-date`} type="date" value={date} onChange={(e) => changerDate(e.target.value)} aria-invalid={erreurs.date ? true : undefined} />
              {erreurs.date && <p className="compte-erreur-champ">{erreurs.date}</p>}
            </div>
          </div>

          {horaire && (
            <div className="compte-champ">
              <label htmlFor={`${id}-creneau`}>Créneau de l'horaire</label>
              <select id={`${id}-creneau`} value={creneauCle} onChange={(e) => appliquerCreneau(creneauxDate.find((c) => cleCreneau(c) === e.target.value) ?? null)}>
                {creneauxDate.map((c) => (
                  <option key={cleCreneau(c)} value={cleCreneau(c)}>
                    {libelleCreneau(c)} · {c.ponctuel ? 'heure zéro ponctuelle' : (classes.find((k) => k.id === c.classe_id)?.nom ?? 'classe')}
                  </option>
                ))}
                <option value="">Autre horaire (saisie libre)</option>
              </select>
              {creneauxDate.length === 0 && <p className="compte-aide">Aucun cours de ton horaire ce jour-là (week-end, congé ou jour sans cours) : horaire libre ci-dessous.</p>}
              {creneauxDate.some((c) => c.ponctuel && cleCreneau(c) === creneauCle) && <p className="compte-aide">Heure zéro ponctuelle : vide dans ton horaire, pour la classe choisie ci-dessus.</p>}
            </div>
          )}

          {horaire && creneauCle ? null : plage ? (
            <fieldset className="carnet-fieldset">
              <legend>Horaire</legend>
              <div className="carnet-grille carnet-grille-heures">
                <div className="compte-champ">
                  <label htmlFor={`${id}-debut`}>Début</label>
                  <input
                    id={`${id}-debut`}
                    type="time"
                    value={debut}
                    onChange={(e) => {
                      setHoraireTouche(true)
                      if (horaire) {
                        setNumero('')
                        setNumeroFin('')
                      }
                      const ancien = minutesHeure(debut)
                      const nouveau = minutesHeure(e.target.value)
                      const finM = minutesHeure(fin)
                      // La fin suit le début (même durée) tant qu'elle n'a pas été changée à la main.
                      if (nouveau !== null && (finM === null || (ancien !== null && finM - ancien === reglages.duree_heure))) setFin(heureChamp(Math.min(nouveau + reglages.duree_heure, 1439)))
                      setDebut(e.target.value)
                    }}
                    aria-invalid={erreurs.horaire ? true : undefined}
                  />
                </div>
                <span className="carnet-fleche" aria-hidden="true">
                  →
                </span>
                <div className="compte-champ">
                  <label htmlFor={`${id}-fin`}>Fin</label>
                  <input
                    id={`${id}-fin`}
                    type="time"
                    value={fin}
                    onChange={(e) => {
                      setHoraireTouche(true)
                      if (horaire) {
                        setNumero('')
                        setNumeroFin('')
                      }
                      setFin(e.target.value)
                    }}
                    aria-invalid={erreurs.horaire ? true : undefined}
                  />
                </div>
              </div>
              {erreurs.horaire && <p className="compte-erreur-champ">{erreurs.horaire}</p>}
            </fieldset>
          ) : (
            <div className="compte-champ">
              <label htmlFor={`${id}-numero`}>Heure de cours</label>
              <select
                id={`${id}-numero`}
                value={numero}
                onChange={(e) => {
                  setHoraireTouche(true)
                  setNumero(e.target.value)
                  setNumeroFin('')
                  if (horaire) {
                    setDebut('')
                    setFin('')
                  }
                }}
                aria-invalid={erreurs.horaire ? true : undefined}
              >
                <option value="">— non précisée —</option>
                {(heureZero || numero === '0') && <option value="0">{numeroHeureTexte(0)}</option>}
                {Array.from({ length: NUMERO_HEURE_MAX }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={String(n)}>
                    {numeroHeureTexte(n)}
                  </option>
                ))}
              </select>
              {erreurs.horaire && <p className="compte-erreur-champ">{erreurs.horaire}</p>}
            </div>
          )}
        </div>

        <BlocFormulaire id={`${id}-b-matiere`} titre="Matière vue" icone="matiere" ouvert={blocs.matiere} onBasculer={() => basculerBloc('matiere')} resume={resumeMatiere}>
          <div className="compte-champ">
            <label htmlFor={`${id}-chapitre`} className="carnet-etiquette">
              Chapitre
            </label>
            <select id={`${id}-chapitre`} data-autofocus value={chapitreCle} onChange={(e) => changerChapitre(e.target.value)} aria-invalid={erreurs.chapitre ? true : undefined}>
              <option value="">— choisir —</option>
              {niveauxOrdonnes.map((l) => (
                <optgroup key={l.slug} label={l.label}>
                  {chapitresDansMonOrdre(l.slug, ordreCourant(), l.chapters).map((c) => (
                    <option key={c.slug} value={`${l.slug}/${c.slug}`}>
                      {numeroRepere(c)}. {c.title}
                      {enCours === `${l.slug}/${c.slug}` ? ' (en cours)' : ''}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {erreurs.chapitre && <p className="compte-erreur-champ">{erreurs.chapitre}</p>}
            <p className="compte-aide">
              Rangés dans ton ordre (à défaut, celui du site).{' '}
              {/* Nouvel onglet : la saisie reste dans le panneau. */}
              <a href="/profil#ordre-chapitres" target="_blank" rel="noopener">
                Mon ordre des chapitres
              </a>
            </p>
          </div>

          {chapitre && (
            <fieldset className="carnet-fieldset carnet-parties">
              <legend className="carnet-etiquette">
                Ce qui a été vu <span className="compte-compte">({nbCochees} cochée{nbCochees > 1 ? 's' : ''})</span>
              </legend>
              <p className="compte-aide">Coche une section entière, ou seulement les sous-parties vues.</p>
              {structure.map((section) => {
                const unites = unitesSection(section)
                const n = unites.filter((u) => coches.has(u)).length
                const toutes = n === unites.length
                const dates = unites.map((u) => dejaVu.get(u)).filter((d): d is string => d !== undefined).sort()
                const vue = dates.length === unites.length
                const etat = vue ? `vu le ${jourMois(dates[dates.length - 1])}` : dates.length > 0 ? `commencé le ${jourMois(dates[0])}` : null
                return (
                  <div className={`carnet-section${vue ? ' vue' : dates.length > 0 ? ' commencee' : ''}`} key={section.id}>
                    <label className="carnet-case carnet-case-section">
                      <input
                        type="checkbox"
                        checked={toutes}
                        ref={(el) => {
                          if (el) el.indeterminate = n > 0 && !toutes
                        }}
                        onChange={() => basculer(unites, !toutes)}
                      />
                      <span className="carnet-case-texte">
                        {section.numero}. <RichText text={section.titre} />
                      </span>
                      {etat && <span className="carnet-vu-le">{etat}</span>}
                    </label>
                    {section.sousParties.length > 0 && (
                      <div className="carnet-sous-parties">
                        {section.sousParties.map((p) => (
                          <label className="carnet-case" key={p.id}>
                            <input type="checkbox" checked={coches.has(p.id)} onChange={(e) => basculer([p.id], e.target.checked)} />
                            <span className="carnet-case-texte">
                              <RichText text={p.titre} />
                            </span>
                            {dejaVu.has(p.id) && <span className="carnet-vu-le">vu le {jourMois(dejaVu.get(p.id) as string)}</span>}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </fieldset>
          )}

          {chapitre && generateurs.length > 0 && (
            <details className="carnet-details" open={nbGens > 0}>
              <summary>
                Exercices faits en classe <span className="compte-compte">({nbGens} coché{nbGens > 1 ? 's' : ''})</span>
              </summary>
              <div className="carnet-sous-parties carnet-generateurs">
                {generateurs.map((g) => {
                  const section = structure.find((s) => s.id === g.sectionId)
                  return (
                    <label className="carnet-case" key={g.id}>
                      <input type="checkbox" checked={gens.has(g.id)} onChange={(e) => setGens((avant) => basculerDans(avant, g.id, e.target.checked))} />
                      <span>
                        {section ? `${section.numero}. ` : 'Synthèse · '}
                        <RichText text={g.titre} />
                      </span>
                    </label>
                  )
                })}
              </div>
            </details>
          )}
        </BlocFormulaire>

        <BlocFormulaire id={`${id}-b-devoir`} titre="Devoir" icone="devoir" ouvert={blocs.devoir} onBasculer={() => basculerBloc('devoir')} resume={resumeDevoirBloc}>
          <div className="compte-champ">
            <label htmlFor={`${id}-devoir`} className="carnet-etiquette-bloc">
              Consigne
            </label>
            <textarea id={`${id}-devoir`} rows={3} value={devoir} onChange={(e) => setDevoir(e.target.value)} aria-invalid={erreurs.devoir ? true : undefined} />
            {erreurs.devoir && <p className="compte-erreur-champ">{erreurs.devoir}</p>}
          </div>
          {!devoirsActifs ? (
            <MessageDevoirsInactif quoi="La date de remise et les exercices en ligne joints" />
          ) : (
            <>
              <fieldset className="agenda-groupe">
                <legend className="carnet-etiquette-bloc">Pour le</legend>
                <div className="agenda-choix-types">
                  {coursClasse.map((c, i) => (
                    <label key={c.date} className={`agenda-choix${pourLe === (i === 0 ? 'prochain' : 'suivant') ? ' actif' : ''}`}>
                      <input type="radio" name={`${id}-pour`} className="carnet-sr" checked={pourLe === (i === 0 ? 'prochain' : 'suivant')} onChange={() => setPourLe(i === 0 ? 'prochain' : 'suivant')} />
                      {i === 0 ? `prochain cours · ${dateCourteDevoir(c.date)}` : dateCourteDevoir(c.date)}
                    </label>
                  ))}
                  <label className={`agenda-choix${pourLe === 'autre' ? ' actif' : ''}`}>
                    <input type="radio" name={`${id}-pour`} className="carnet-sr" checked={pourLe === 'autre'} onChange={() => setPourLe('autre')} />
                    Autre date…
                  </label>
                </div>
                {coursClasse.length === 0 && <p className="compte-aide">{horaire ? 'Pas de cours de cette classe dans ton horaire après cette date : choisis la date.' : 'Sans horaire, choisis la date de remise (facultatif).'}</p>}
                {pourLe === 'autre' && (
                  <div className="compte-champ carnet-champ-court">
                    <label htmlFor={`${id}-pour-date`}>Date de remise (facultatif)</label>
                    <input id={`${id}-pour-date`} type="date" value={pourDate} min={date} onChange={(e) => setPourDate(e.target.value)} aria-invalid={erreurs.devoirPour ? true : undefined} />
                  </div>
                )}
                {erreurs.devoirPour && <p className="compte-erreur-champ">{erreurs.devoirPour}</p>}
              </fieldset>
              {chapitre && generateurs.length > 0 && (
                <fieldset className="agenda-groupe">
                  <legend className="carnet-etiquette-bloc">Exercices en ligne à joindre</legend>
                  <div className="carnet-sous-parties carnet-generateurs carnet-devoir-gens">
                    {gensDevoirVisibles.map((g) => (
                      <label className="carnet-case" key={g.id}>
                        <input type="checkbox" checked={gensDevoir.has(g.id)} onChange={(e) => setGensDevoir((avant) => basculerDans(avant, g.id, e.target.checked))} />
                        <span>
                          <RichText text={g.titre} /> <span className="carnet-code-gen">({g.id})</span>
                        </span>
                      </label>
                    ))}
                  </div>
                  {gensDevoirVisibles.length < generateurs.length && (
                    <button type="button" className="compte-bouton-lien carnet-tous-gens" onClick={() => setTousGensDevoir(true)}>
                      Tous les exercices du chapitre ({generateurs.length})
                    </button>
                  )}
                </fieldset>
              )}
              {dateRemise && aDuDevoir && (
                <p className="compte-aide carnet-devoir-note">
                  Le devoir apparaît aussi dans l’agenda du {dateJourLong(dateRemise)} (« À rendre ») et dans la page de la classe.
                </p>
              )}
            </>
          )}
        </BlocFormulaire>

        <BlocFormulaire id={`${id}-b-evaluation`} titre="Évaluation" icone="evaluation" ouvert={blocs.evaluation} onBasculer={() => basculerBloc('evaluation')} resume={resumeEvaluation}>
          {!devoirsActifs ? (
            <MessageDevoirsInactif quoi="L’évaluation (annonce, interro faite, contrôle-bilan)" />
          ) : (
            <>
              <fieldset className="agenda-groupe">
                <legend className="carnet-etiquette-bloc">Type</legend>
                <div className="agenda-choix-types">
                  {(['annonce', 'faite', 'bilan'] as TypeEvaluation[]).map((t) => {
                    const bloque = t !== 'faite' && !ctx.agenda.actif
                    return (
                      <label key={t} className={`agenda-choix${typeEval === t ? ' actif' : ''}${bloque ? ' bloque' : ''}`}>
                        <input type="radio" name={`${id}-eval`} className="carnet-sr" checked={typeEval === t} disabled={bloque} onChange={() => choisirTypeEval(t)} />
                        {LIBELLE_EVALUATION[t]}
                      </label>
                    )
                  })}
                </div>
                {!ctx.agenda.actif && <MessageAgendaInactif compact />}
                {typeEval && (
                  <button type="button" className="compte-bouton-lien carnet-retirer-eval" onClick={() => setTypeEval(null)}>
                    Pas d’évaluation pour cette séance
                  </button>
                )}
              </fieldset>
              {typeEval && typeEval !== 'faite' && (
                <div className="agenda-deux">
                  <div className="compte-champ">
                    <label htmlFor={`${id}-eval-date`}>Date</label>
                    <input id={`${id}-eval-date`} type="date" value={evalDate} min={date} onChange={(e) => changerDateEval(e.target.value)} aria-invalid={erreurEval ? true : undefined} />
                  </div>
                  <div className="compte-champ">
                    <label htmlFor={`${id}-eval-heure`}>Heure</label>
                    <select id={`${id}-eval-heure`} value={evalHeure} onChange={(e) => setEvalHeure(e.target.value)}>
                      <option value="">— sans heure précise —</option>
                      {creneauxEval.map((c) => (
                        <option key={c.heureDebut} value={`${c.heureDebut}-${c.heureFin}`}>
                          {numerosCreneau(c)} ({heureCourte(c.debut)})
                        </option>
                      ))}
                      {evalHeure && !creneauxEval.some((c) => `${c.heureDebut}-${c.heureFin}` === evalHeure) && <option value={evalHeure}>{texteHeureCle(evalHeure)} (enregistrée)</option>}
                    </select>
                  </div>
                </div>
              )}
              {erreurEval && <p className="compte-erreur-champ">{erreurEval}</p>}
              {typeEval && chapitre && (
                <fieldset className="agenda-groupe">
                  <legend className="carnet-etiquette-bloc">Matière (parties vues)</legend>
                  {sectionsEval.length === 0 && <p className="compte-aide">Aucune partie de ce chapitre n’est encore cochée pour cette classe : coche les sections évaluées.</p>}
                  <div className="carnet-sous-parties carnet-eval-parties">
                    {(sectionsEval.length > 0 ? sectionsEval : structure).map((s) => {
                      const coche = partiesEval.has(s.id)
                      const gensSection = coche && gensEvalChapitre ? gensEvalChapitre.filter((g) => g.sectionId === s.id) : []
                      return (
                        <div className="carnet-eval-section" key={s.id}>
                          <label className="carnet-case">
                            <input
                              type="checkbox"
                              checked={coche}
                              onChange={(e) => {
                                const cocher = e.target.checked
                                setPartiesEval((avant) => basculerDans(avant, s.id, cocher))
                                // Section (re)cochée : tous ses exercices cochés par défaut.
                                if (cocher && gensEvalChapitre) setDecochesEval((avant) => new Set([...avant].filter((id) => !gensEvalChapitre.some((g) => g.sectionId === s.id && g.generatorId === id))))
                              }}
                            />
                            <span className="carnet-case-texte">
                              § {s.numero} <RichText text={s.titre} />
                            </span>
                          </label>
                          {gensSection.length > 0 && (
                            <div className="carnet-eval-gens" role="group" aria-label={`Exercices de la partie ${s.numero}`}>
                              {gensSection.map((g) => (
                                <label className="carnet-case" key={g.generatorId}>
                                  <input type="checkbox" checked={!decochesEval.has(g.generatorId)} onChange={(e) => setDecochesEval((avant) => basculerDans(avant, g.generatorId, !e.target.checked))} />
                                  <span className={`conc-pc conc-pc-${g.processus} conc-pc-petite`} title={NOM_PROCESSUS[g.processus]} aria-hidden="true">
                                    {g.processus}
                                  </span>
                                  <span className="carnet-case-texte">
                                    <span className="carnet-sr">{NOM_PROCESSUS[g.processus]} : </span>
                                    <RichText text={libelleGenerateurEval(g, generateurs)} /> <span className="carnet-code-gen">({g.generatorId})</span>
                                  </span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  {gensEvalChapitre === null && sectionsEvalCochees.length > 0 && <p className="compte-aide">Chargement des exercices de ces parties…</p>}
                  {gensSectionsEval.length > 0 && (
                    <p className="compte-aide carnet-eval-gens-resume" role="status">
                      {gensEvalRetenus.length === 0
                        ? `Aucun exercice coché : « Préparer l’évaluation » reprendra les ${gensSectionsEval.length} exercices de ces parties.`
                        : `${gensEvalRetenus.length} exercice${gensEvalRetenus.length > 1 ? 's' : ''} sur ${gensSectionsEval.length} retenu${gensEvalRetenus.length > 1 ? 's' : ''} pour « Préparer l’évaluation » et pour le lien d’entraînement des élèves.`}
                    </p>
                  )}
                  {gensSectionsEval.length > 0 && !ctx.generateursEval && (
                    <p className="compte-aide carnet-eval-gens-note">
                      Pour garder les générateurs choisis, applique la migration 0008 (<code>supabase/migrations/0008_evaluation_generateurs.sql</code> dans l’éditeur SQL de Supabase). En attendant, ton choix vaut pour « Préparer l’évaluation » et pour le texte copié maintenant.
                    </p>
                  )}
                </fieldset>
              )}
              {typeEval && typeEval !== 'faite' && <AvertissementsInterro avertissements={avertissementsEval} date={evalDate} />}
              {typeEval && typeEval !== 'faite' && evenementLie === null && initiale?.evaluation_evenement && (
                <p className="compte-aide">L’interro liée a été supprimée de l’agenda : « Enregistrer » la recrée.</p>
              )}
              {typeEval && (
                <div className="carnet-eval-actions">
                  {lienEvaluation ? (
                    <a className="carnet-bouton" href={lienEvaluation} target="_blank" rel="noopener">
                      Préparer l’évaluation<span className="carnet-sr"> (nouvel onglet)</span>
                    </a>
                  ) : (
                    <button type="button" className="carnet-bouton" disabled>
                      Préparer l’évaluation
                    </button>
                  )}
                  <a className="carnet-bouton" href={lienCoffre} target="_blank" rel="noopener">
                    Choisir dans mon coffre<span className="carnet-sr"> (nouvel onglet)</span>
                  </a>
                </div>
              )}
              {typeEval && !lienEvaluation && <p className="compte-aide">Coche au moins une partie pour préparer l’évaluation sur cette matière.</p>}
            </>
          )}
        </BlocFormulaire>

        <BlocFormulaire id={`${id}-b-remarque`} titre="Remarque privée" icone="remarque" ouvert={blocs.remarque} onBasculer={() => basculerBloc('remarque')} resume={remarque.trim() ? 'notée' : ''}>
          <div className="compte-champ">
            <label htmlFor={`${id}-remarque`} className="carnet-etiquette-bloc">
              Remarque (pour toi seulement)
            </label>
            <textarea id={`${id}-remarque`} rows={2} value={remarque} onChange={(e) => setRemarque(e.target.value)} aria-invalid={erreurs.remarque ? true : undefined} placeholder="Ex. : revoir ce point mardi" />
            <p className="compte-aide">Jamais copiée vers l’agenda scolaire. Aucune donnée d'élève.</p>
            {erreurs.remarque && <p className="compte-erreur-champ">{erreurs.remarque}</p>}
          </div>
        </BlocFormulaire>

        <section className="carnet-apercu-smartschool" aria-labelledby={`${id}-apercu`}>
          <h3 id={`${id}-apercu`}>Aperçu du texte pour l’agenda scolaire</h3>
          {texteApercu ? <p className="carnet-apercu-texte">{texteApercu}</p> : <p className="compte-aide">Choisis la classe, la date et le chapitre pour voir le texte.</p>}
        </section>
      </div>

      <div className="carnet-panneau-pied">
        <button type="button" className="carnet-bouton" onClick={onAnnuler}>
          Annuler
        </button>
        <button type="button" className="carnet-bouton" disabled={occupe} onClick={() => envoyer(true)}>
          Enregistrer et copier
        </button>
        <button type="submit" className="carnet-bouton principal" disabled={occupe}>
          Enregistrer
        </button>
      </div>
    </form>
  )
}

const basculerDans = (avant: Set<string>, cle: string, cocher: boolean): Set<string> => {
  const s = new Set(avant)
  if (cocher) s.add(cle)
  else s.delete(cle)
  return s
}

/** « H2 », « H1–H2 » d'une clé « 1-2 ». */
function texteHeureCle(cle: string): string {
  const [a, b] = cle.split('-').map(Number)
  return a === b ? `H${a}` : `H${a}–H${b}`
}

/** Message des blocs « Devoir » / « Évaluation » quand 0007 n'est pas appliqué. */
export function MessageDevoirsInactif({ quoi }: { quoi: string }) {
  return (
    <div className="compte-encadre agenda-inactif carnet-devoirs-inactif" role="status">
      <p>
        <strong>Pas encore activé.</strong> {quoi} demandent le fichier <code>supabase/migrations/0007_devoirs_evaluations.sql</code> : colle-le dans l’éditeur SQL de Supabase
        (SQL Editor → New query → coller → Run), puis recharge cette page. Le reste du carnet fonctionne normalement.
      </p>
    </div>
  )
}

type IconeBloc = 'matiere' | 'devoir' | 'evaluation' | 'remarque'

function IconeBlocFormulaire({ type }: { type: IconeBloc }) {
  const p = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true, focusable: false }
  if (type === 'matiere')
    return (
      <svg {...p}>
        <path d="M6 3h9l4 4v14H6z" />
        <path d="M14 3v5h5M9 12h7M9 16h7" />
      </svg>
    )
  if (type === 'devoir')
    return (
      <svg {...p}>
        <path d="M4 20l1-5L16 4l4 4L9 19z" />
        <path d="M13 7l4 4" />
      </svg>
    )
  if (type === 'evaluation')
    return (
      <svg {...p}>
        <rect x="5" y="4" width="14" height="17" rx="1.5" />
        <path d="M9 4V2.8h6V4M9 12l2 2 4-4" />
      </svg>
    )
  return (
    <svg {...p}>
      <circle cx="8" cy="15" r="4" />
      <path d="M11 12l9-9M17 6l2 2M15 8l2 2" />
    </svg>
  )
}

/** Bloc repliable du panneau « Noter la séance » (maquette du 24/11/2026) : en-tête bouton
 * (`aria-expanded`) avec l'icône, le titre, un résumé quand il est replié, et le chevron. */
function BlocFormulaire({ id, titre, icone, ouvert, onBasculer, resume, children }: { id: string; titre: string; icone: IconeBloc; ouvert: boolean; onBasculer: () => void; resume?: string; children: ReactNode }) {
  return (
    <section className={`carnet-bloc${ouvert ? ' ouvert' : ''}`} aria-labelledby={`${id}-titre`}>
      <h3 className="carnet-bloc-titre" id={`${id}-titre`}>
        <button type="button" className="carnet-bloc-tete" aria-expanded={ouvert} aria-controls={`${id}-corps`} onClick={onBasculer}>
          <span className="carnet-bloc-icone">
            <IconeBlocFormulaire type={icone} />
          </span>
          <span className="carnet-bloc-nom">{titre}</span>
          {!ouvert && resume && <span className="carnet-bloc-resume">{resume}</span>}
          <span className="carnet-bloc-chevron" aria-hidden="true">
            {ouvert ? '▾' : '▸'}
          </span>
        </button>
      </h3>
      <div className="carnet-bloc-corps" id={`${id}-corps`} hidden={!ouvert}>
        {children}
      </div>
    </section>
  )
}

/** Nom d'un générateur de l'évaluation dans le carnet : libellé explicite de la table, sinon titre de la
 * carte « S'entraîner » du chapitre, sinon nom du document (même ordre que `libelleGenerateurPanneau`). */
function libelleGenerateurEval(g: GenerateurEvaluation, cartes: { id: string; titre: string }[]): string {
  return g.libelle || cartes.find((c) => c.id === g.generatorId)?.titre || g.nom
}
