import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { BandeauEspace } from '../components/compte/BandeauEspace'
import { MenuEspace } from '../components/compte/MenuEspace'
import { EnTeteCompte, PageCompte, PageReservee } from '../components/compte/PageReservee'
import { AgendaPeriode } from '../components/carnet/AgendaPeriode'
import { Aujourdhui } from '../components/carnet/Aujourdhui'
import { CarteSeance } from '../components/carnet/CarteSeance'
import { CarnetContexte, avecGrille, textesSeance, type ContexteCarnet } from '../components/carnet/contexteCarnet'
import { FormulaireSeance, type AnnonceEvaluation } from '../components/carnet/FormulaireSeance'
import { ReglagesTexteAgenda, TexteAgenda } from '../components/carnet/TexteAgenda'
import { prechargerProcessus } from '../components/carnet/processusCarnet'
import { GestionClasses, type SaisieClasse } from '../components/carnet/GestionClasses'
import { MaSemaine } from '../components/carnet/MaSemaine'
import { MessageHoraireInactif, MonHoraire } from '../components/carnet/MonHoraire'
import { PageClasse } from '../components/carnet/PageClasse'
import { PageClasseEleves } from '../components/carnet/PageClasseEleves'
import { VueEnsembleClasses } from '../components/carnet/VueEnsembleClasses'
import { AnnoncerEvaluation, type EtatPageEleves, type TextesAnnonce } from '../components/carnet/AnnoncerEvaluation'
import { PanneauLateral } from '../components/carnet/PanneauLateral'
import { FormulaireEvenement } from '../components/carnet/FormulaireEvenement'
import { ReglagesAgenda } from '../components/carnet/ReglagesAgenda'
import { chapitreParDefaut, copierTexte, lireClasseMemorisee, memoriserClasse, texteReperes } from '../components/carnet/outilsCarnet'
import '../components/carnet/carnet.css'
import '../components/carnet/agenda.css'
import '../components/compte/profil.css'
import '../components/compte/espace-pages.css'
import { findChapter } from '../content/chaptersIndex'
import { dateIso, dateLongue, type Classe, type ReglagesCarnet, type SaisieSeance, type Seance } from '../lib/carnet'
import { dateJourLong } from '../lib/agendaEvenements'
import { INTITULE_BILAN, lireCompetences, lireRubriques, type Rubriques } from '../lib/carnetDevoirs'
import {
  ajouterClasse,
  ajouterSeance,
  chargerHoraire,
  chargerSeances,
  enregistrerReglagesTexte,
  enregistrerTexteSeance,
  lireReglagesTexte,
  type ReglagesTexte,
  definirCase,
  enregistrerGrille,
  enregistrerReglages,
  ErreurCarnet,
  lireReglages,
  listerClasses,
  modifierClasse,
  modifierSeance,
  supprimerClasse,
  supprimerGrille,
  supprimerSeance,
  type DonneesHoraire,
} from '../lib/carnetDonnees'
import { creneauPropose, creneauxDuJour, seanceDuCreneau, type Creneau } from '../lib/horaire'
import { AGENDA_INACTIF, ajouterEvenement, ajouterPeriode, chargerAgenda, enregistrerSeuil, modifierEvenement, modifierPeriode, supprimerEvenement, supprimerPeriode, type DonneesAgenda } from '../lib/agendaDonnees'
import { predicatSuppression, type ContexteAgenda, type Evenement, type PeriodeBulletin, type SaisieEvenement } from '../lib/agendaEvenements'
import { estConnecteActif, useCompte } from '../lib/compteContexte'
import { useOrdreChapitres } from '../lib/ordreChapitres'
import { messageErreur } from '../lib/compteValidation'
import { construireContenuPage, memeContenu } from '../lib/pageClasseContenu'
import type { ReglagesPageClasse } from '../lib/pageClasse'
import { chargerPagesClasse, couperCode, enregistrerReglagesPage, nouveauCode, publierContenu, type PagesClasse } from '../lib/pageClasseDonnees'
import { nouvelleSeanceSupport, saisieDepuisSeance, seanceAvecAnnonce, seanceSupport, type QuoiAnnonce, type SaisieAnnonce } from '../lib/annonceClasse'
import { urlEvaluationMatiere } from '../lib/carnetMatiere'

const DUREES = [40, 45, 50, 55, 60, 90, 100, 110]
const TEXTE_DEFAUT = { rubriques: lireRubriques(null), competences: lireCompetences(null) }

/** `/carnet/*` — carnet de matière vue (phase 2 des comptes), réservé aux professeurs connectés.
 * Bandeau sombre (« ESPACE PROFESSEUR », période et semaine, créneaux à noter, classes) et menu
 * unique « Mon espace » (`MenuEspace`, où « Carnet de matière vue » se déplie ; gauche sur
 * ordinateur, barre du bas sur téléphone), qui mène à : « Aujourd'hui » (accueil,
 * `/carnet`), « Ma semaine » (`/carnet/semaine`), une page par classe (`/carnet/classe/:id`), la
 * gestion des classes (`/carnet/classes`), l'agenda d'une période (`/carnet/agenda`, `?classe=`),
 * « Mon horaire » (`/carnet/horaire`) et les réglages (`/carnet/reglages`). « Noter une séance »
 * s'ouvre partout dans le même panneau latéral, sans quitter la page. `?chapitre=<niveau>/<chapitre>`
 * (bouton « Carnet » d'une page de cours) ouvre ce panneau sur ce chapitre. Aucune de ces adresses
 * n'est pré-rendue (`scripts/routes.mjs` ne liste que l'accueil et les chapitres). */
export function CarnetPage() {
  return (
    <PageCompte titre="Mes classes" large sansTete>
      <TeteDeRepli />
      <PageReservee>
        <Carnet />
      </PageReservee>
    </PageCompte>
  )
}

/** Titre habituel tant que la page n'est pas prête (le bandeau porte le `<h1>`). */
function TeteDeRepli() {
  const compte = useCompte()
  return estConnecteActif(compte) ? null : <EnTeteCompte titre="Mes classes" />
}

interface Donnees {
  classes: Classe[]
  seances: Seance[]
  reglages: ReglagesCarnet
  reglagesExiste: boolean
  horaire: DonneesHoraire
  /** Agenda (0006) ; `actif` faux tant que 0006 n'est pas appliqué. */
  agenda: DonneesAgenda
  /** 0007 appliqué : colonnes de devoir / évaluation / texte présentes. */
  devoirs: boolean
  /** 0008 appliqué : colonne `seances.evaluation_generateurs` présente. */
  generateursEval: boolean
  /** Rubriques du texte et compétences transversales (défauts sans 0007). */
  texte: ReglagesTexte
  /** Pages de classe des élèves (0010) ; `actif` faux tant que 0010 n'est pas appliquée. */
  pages: PagesClasse
  /** Panne de lecture des pages de classe (le carnet reste utilisable). */
  erreurPages: string | null
}

type Panneau =
  | { type: 'noter'; classeId: string; chapitre: string; creneau: Creneau | null; date?: string; chapitreChoisi?: boolean }
  | { type: 'modifier'; seance: Seance }
  | { type: 'voir'; seanceId: string }
  | { type: 'evenement'; evenement: Evenement | null; prerempli: Partial<SaisieEvenement> }
  | { type: 'texte'; seanceId: string }

function MessageCarnetInactif() {
  return (
    <div className="compte-encadre" role="status">
      <p>
        <strong>Carnet pas encore activé.</strong>
      </p>
      <p>
        Colle le fichier <code>supabase/migrations/0002_carnet.sql</code> dans l'éditeur SQL de Supabase (SQL Editor → New query → coller → Run), puis recharge cette page. Le reste du
        site fonctionne normalement en attendant.
      </p>
    </div>
  )
}

function Carnet() {
  const compte = useCompte()
  const client = compte.client
  // « Mon ordre des chapitres » : le carnet (listes, textes, agenda, page de classe) suit l'ordre du
  // professeur ; re-rendu et nouvelle vérification de la page de classe quand il arrive ou change.
  const etatOrdre = useOrdreChapitres()
  const [params, setParams] = useSearchParams()
  const naviguer = useNavigate()
  const chemin = useLocation().pathname.replace(/\/+$/, '') || '/'
  const [donnees, setDonnees] = useState<Donnees | null>(null)
  const [absent, setAbsent] = useState(false)
  const [erreurChargement, setErreurChargement] = useState<string | null>(null)
  const [panneau, setPanneau] = useState<Panneau | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)
  const [texteACopier, setTexteACopier] = useState<string | null>(null)
  const [occupe, setOccupe] = useState(false)
  const [classeActive, setClasseActive] = useState<string | null>(() => lireClasseMemorisee())
  // Heure courante (créneau en cours, oubliées, heures restantes), rafraîchie chaque minute.
  const [maintenant, setMaintenant] = useState(() => new Date())
  const titrePanneau = useId()
  const idBandeau = useId()
  useEffect(() => {
    const t = window.setInterval(() => setMaintenant(new Date()), 60_000)
    return () => window.clearInterval(t)
  }, [])

  const charger = useCallback(async () => {
    if (!client) return
    try {
      // L'horaire (0003) d'abord : il dit si `seances.numero_heure_fin` existe.
      // L'agenda (0006) est facultatif : sans lui (ou en cas de panne de lecture), le carnet reste utilisable.
      const [classes, r, horaire, agenda] = await Promise.all([listerClasses(client), lireReglages(client), chargerHoraire(client), chargerAgenda(client).catch(() => AGENDA_INACTIF)])
      // Devoirs / évaluations / texte (0007) : facultatifs, détectés à la lecture des séances.
      // Pages de classe des élèves (0010) : facultatives, une panne ne bloque jamais le carnet.
      const [{ seances, devoirs, generateursEval }, texte, pagesLues] = await Promise.all([
        chargerSeances(client, horaire.actif),
        lireReglagesTexte(client).catch((): ReglagesTexte => ({ actif: false, ...TEXTE_DEFAUT })),
        chargerPagesClasse(client).then(
          (pages) => ({ pages, erreur: null }),
          (ex: unknown) => ({ pages: { actif: true, pages: [] } as PagesClasse, erreur: messageErreur(ex) }),
        ),
      ])
      setDonnees({
        classes,
        seances,
        reglages: r.reglages,
        reglagesExiste: r.existe,
        horaire,
        agenda,
        devoirs,
        generateursEval,
        texte: devoirs ? texte : { ...texte, actif: false },
        pages: pagesLues.pages,
        erreurPages: pagesLues.erreur,
      })
      setAbsent(false)
      setErreurChargement(null)
    } catch (ex) {
      if (ex instanceof ErreurCarnet && ex.tableAbsente) setAbsent(true)
      else setErreurChargement(messageErreur(ex))
    }
  }, [client])

  useEffect(() => {
    void charger()
  }, [charger])

  // Table des processus (texte en rubriques) : chargée à part, une fois le carnet affiché.
  const pret = donnees !== null
  useEffect(() => {
    if (!pret) return
    const t = window.setTimeout(() => void prechargerProcessus().catch(() => undefined), 400)
    return () => window.clearTimeout(t)
  }, [pret])

  // « Noter dans le carnet » depuis une page de cours : `?chapitre=niveau/chapitre`.
  const chapitreDemande = params.get('chapitre')
  useEffect(() => {
    if (!donnees || !chapitreDemande) return
    const [niveau, slug] = chapitreDemande.split('/')
    const suivant = new URLSearchParams(params)
    suivant.delete('chapitre')
    setParams(suivant, { replace: true })
    if (!niveau || !slug || !findChapter(niveau, slug) || donnees.classes.length === 0) return
    // Avec un horaire : le créneau en cours (ou le plus proche) d'aujourd'hui, de préférence d'une
    // classe du niveau du chapitre.
    const h = donnees.horaire
    const maintenantCourant = new Date()
    const creneaux = h.actif ? creneauxDuJour(dateIso(maintenantCourant), h.grilles, h.cases).creneaux : []
    const niveauDe = (classeIdCreneau: string) => donnees.classes.find((c) => c.id === classeIdCreneau)?.niveau
    const creneau = creneauPropose(creneaux, maintenantCourant.getHours() * 60 + maintenantCourant.getMinutes(), (c) => niveauDe(c.classe_id) === niveau)
    const memeNiveau = donnees.classes.filter((c) => c.niveau === niveau)
    const classeId = creneau?.classe_id ?? (memeNiveau.some((c) => c.id === classeActive) ? classeActive : (memeNiveau[0]?.id ?? classeActive ?? donnees.classes[0].id))
    setPanneau({ type: 'noter', classeId: classeId ?? '', chapitre: `${niveau}/${slug}`, creneau: creneau ?? null, chapitreChoisi: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- une fois, dès que les données sont là
  }, [donnees !== null, chapitreDemande])

  // « Noter la matière vue » du tableau de bord (`/espace`) : `?noter=<classe>` ouvre le panneau « Noter la
  // séance » sur le créneau d'aujourd'hui de cette classe (le premier pas encore noté), comme « Noter » d'Aujourd'hui.
  const noterDemande = params.get('noter')
  useEffect(() => {
    if (!donnees || !noterDemande) return
    const suivant = new URLSearchParams(params)
    suivant.delete('noter')
    setParams(suivant, { replace: true })
    const classe = donnees.classes.find((c) => c.id === noterDemande)
    if (!classe) return
    const h = donnees.horaire
    const ctx = h.actif && donnees.agenda.actif ? { grilles: h.grilles, cases: h.cases, evenements: donnees.agenda.evenements, classes: donnees.classes } : null
    const supprimee = ctx ? predicatSuppression(ctx) : undefined
    const creneaux = h.actif ? creneauxDuJour(dateIso(new Date()), h.grilles, h.cases, { supprimee }).creneaux.filter((c) => c.classe_id === classe.id) : []
    const creneau = creneaux.find((c) => !seanceDuCreneau(c, donnees.seances)) ?? null
    setClasseActive(classe.id)
    memoriserClasse(classe.id)
    setPanneau({ type: 'noter', classeId: classe.id, chapitre: chapitreParDefaut(classe.id, donnees.classes, donnees.seances), creneau })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- une fois, dès que les données sont là
  }, [donnees !== null, noterDemande])

  const ecoles = compte.ecoles
  const profil = compte.profil
  const seances = donnees?.seances
  // Heures supprimées par les événements : horaire (0003) ET agenda (0006) nécessaires.
  const ctxAgenda = useMemo<ContexteAgenda | null>(() => {
    if (!donnees || !donnees.horaire.actif || !donnees.agenda.actif) return null
    return { grilles: donnees.horaire.grilles, cases: donnees.horaire.cases, evenements: donnees.agenda.evenements, classes: donnees.classes }
  }, [donnees])
  const contexte = useMemo<ContexteCarnet | null>(() => {
    if (!donnees || !profil) return null
    return {
      classes: donnees.classes,
      ecoles,
      grilles: donnees.horaire.actif ? donnees.horaire.grilles : [],
      format: donnees.reglages.format_horaire,
      professeur: profil.nom_affiche,
      occupe,
      voir: (s) => setPanneau({ type: 'voir', seanceId: s.id }),
      modifier: (s) => setPanneau({ type: 'modifier', seance: s }),
      supprimer: (s) => {
        if (window.confirm('Supprimer cette séance du carnet ?')) void agir(() => supprimerSeance(client!, s.id), 'Séance supprimée.').then((ok) => ok && setPanneau(null))
      },
      agenda: donnees.agenda,
      ctxAgenda,
      nouvelEvenement: (prerempli = {}) => setPanneau({ type: 'evenement', evenement: null, prerempli }),
      ouvrirEvenement: (e) => setPanneau({ type: 'evenement', evenement: e, prerempli: {} }),
      devoirs: donnees.devoirs,
      generateursEval: donnees.generateursEval,
      texte: donnees.texte,
      ouvrirTexte: (s) => setPanneau({ type: 'texte', seanceId: s.id }),
    }
  }, [donnees, ecoles, profil, occupe, client, ctxAgenda])

  // Nombre de créneaux d'aujourd'hui passés ou en cours sans séance (« 2 à noter » du menu).
  const aNoter = useMemo(() => {
    if (!donnees || !donnees.horaire.actif || !seances) return 0
    const d = dateIso(maintenant)
    const m = maintenant.getHours() * 60 + maintenant.getMinutes()
    const supprimee = ctxAgenda ? predicatSuppression(ctxAgenda) : undefined
    return creneauxDuJour(d, donnees.horaire.grilles, donnees.horaire.cases, { supprimee }).creneaux.filter((c) => c.debut <= m && !seanceDuCreneau(c, seances)).length
  }, [donnees, seances, maintenant, ctxAgenda])

  // Pages de classe des élèves (0010) : publication AUTOMATIQUE. Dès que le carnet change (séance,
  // interro, devoir, événement, réglage de la page, nouveau jour), la copie de chaque classe dont le code
  // est actif est recalculée ; si elle diffère de celle du serveur, elle est republiée. Choix plus sûr
  // qu'un bouton seul : une interro déplacée ou supprimée ne reste jamais affichée aux élèves parce
  // qu'on a oublié de cliquer (« Mettre à jour maintenant » ne fait que forcer cette vérification).
  const aujourdhuiPublication = dateIso(maintenant)
  const [etatPublication, setEtatPublication] = useState<{ message: string | null; erreur: string | null }>({ message: null, erreur: null })
  const publicationEnCours = useRef(false)
  const synchroniserPages = useCallback(
    async (d: Donnees, forcerMessage = false): Promise<void> => {
      // L'ordre du professeur décide du titre publié (« Chapitre 3 — Suites ») : attendre sa lecture.
      if (!client || !d.pages.actif || publicationEnCours.current || etatOrdre.etat === 'chargement') return
      const aPublier = d.pages.pages.flatMap((p) => {
        const classe = d.classes.find((c) => c.id === p.classe_id)
        if (!classe || p.code === null) return []
        const contenu = construireContenuPage({
          classe,
          seances: d.seances,
          evenements: d.agenda.actif ? d.agenda.evenements : [],
          grilles: d.horaire.actif ? d.horaire.grilles : [],
          format: d.reglages.format_horaire,
          aujourdhui: aujourdhuiPublication,
          avecHeure: p.publier_heure,
        })
        return memeContenu(contenu, p.contenu) ? [] : [{ classeId: p.classe_id, contenu }]
      })
      if (aPublier.length === 0) {
        if (forcerMessage) setEtatPublication({ message: 'La page des élèves est déjà à jour : elle suit ton journal de classe.', erreur: null })
        return
      }
      publicationEnCours.current = true
      try {
        const faites: { classeId: string; contenu: (typeof aPublier)[number]['contenu']; publieLe: string | null }[] = []
        for (const x of aPublier) faites.push({ ...x, publieLe: await publierContenu(client, x.classeId, x.contenu) })
        setDonnees((avant) =>
          avant && avant.pages.actif
            ? { ...avant, pages: { actif: true, pages: avant.pages.pages.map((p) => { const f = faites.find((y) => y.classeId === p.classe_id); return f ? { ...p, contenu: f.contenu, publie_le: f.publieLe } : p }) } }
            : avant,
        )
        setEtatPublication({ message: `Page des élèves mise à jour${faites.length > 1 ? ` (${faites.length} classes)` : ''} : les élèves voient la nouvelle version.`, erreur: null })
      } catch (ex) {
        setEtatPublication({ message: null, erreur: `Page des élèves pas mise à jour : ${messageErreur(ex)}` })
      } finally {
        publicationEnCours.current = false
      }
    },
    [client, aujourdhuiPublication, etatOrdre],
  )
  useEffect(() => {
    if (donnees) void synchroniserPages(donnees)
  }, [donnees, synchroniserPages])
  // « Mettre à jour maintenant » : carnet relu, puis vérification avec un message même s'il n'y a rien à publier.
  const [forcerVerification, setForcerVerification] = useState(0)
  useEffect(() => {
    if (forcerVerification > 0 && donnees) void synchroniserPages(donnees, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seulement sur demande
  }, [forcerVerification])

  /** Menu « Mon espace » (carnet déplié) + bandeau sombre autour de chaque état de la page. */
  function cadre(contenu: ReactNode) {
    const classes = donnees?.classes
    const reperes = texteReperes(dateIso(maintenant))
    const surReglages = chemin === '/carnet/reglages'
    // « Annoncer une évaluation » / « Donner un devoir » porte son propre en-tête (titre et trois étapes).
    const surAnnonce = chemin === '/carnet/annoncer'
    const phraseClasses = 'Ce que tu vois avec chaque classe, quand, et ce qui l’attend.'
    return (
      <div className="carnet">
        <MenuEspace carnet={donnees ? { classes: donnees.classes, nombreSeances: (k) => donnees.seances.filter((s) => s.classe_id === k).length, aNoter } : undefined}>
          {surAnnonce ? null : surReglages ? (
            <BandeauEspace
              titreId={`${idBandeau}-titre`}
              surtitre="Réglages"
              titre="Réglages de l'agenda"
              icone={null}
              apresTitre={<p className="ep-phrase">Périodes du bulletin, texte copié pour l'agenda scolaire et écriture de l'horaire des séances.</p>}
            />
          ) : (
            <BandeauEspace
              titreId={`${idBandeau}-titre`}
              surtitre="Mes classes"
              titre="Ton journal de classe"
              classe="espace-bandeau-carnet"
              icone={null}
              apresTitre={<p className="ep-phrase">{phraseClasses}</p>}
              etiquettePastilles="En bref"
              pastilles={[
                reperes ? (
                  <li key="reperes" className="profil-bandeau-ecole">
                    {reperes}
                  </li>
                ) : null,
                aNoter > 0 ? (
                  <li key="a-noter" className="profil-bandeau-ecole espace-bandeau-pastille-forte">
                    {aNoter} à noter<span className="carnet-sr"> aujourd'hui</span>
                  </li>
                ) : null,
                classes && classes.length > 0 ? (
                  <li key="classes" className="profil-bandeau-ecole">
                    {classes.length} classe{classes.length > 1 ? 's' : ''}
                  </li>
                ) : null,
              ]}
              fin={
                classes && classes.length > 0 && chemin === '/carnet' ? (
                  <Link className="ep-bouton" to="/carnet/classes">
                    + Ajouter une classe
                  </Link>
                ) : undefined
              }
            />
          )}
          {contenu}
        </MenuEspace>
      </div>
    )
  }

  async function agir(action: () => Promise<unknown>, succes: string): Promise<boolean> {
    setOccupe(true)
    setErreur(null)
    setMessage(null)
    setTexteACopier(null)
    try {
      await action()
      await charger()
      setMessage(succes)
      return true
    } catch (ex) {
      if (ex instanceof ErreurCarnet && ex.tableAbsente) setAbsent(true)
      setErreur(messageErreur(ex))
      return false
    } finally {
      setOccupe(false)
    }
  }

  if (!estConnecteActif(compte) || !client || !profil) return null
  if (absent) return cadre(<MessageCarnetInactif />)
  if (erreurChargement) {
    return cadre(
      <div className="compte-encadre compte-erreur" role="alert">
        <p>{erreurChargement}</p>
        <button type="button" className="compte-bouton-secondaire" onClick={() => void charger()}>
          Réessayer
        </button>
      </div>,
    )
  }
  if (!donnees || !contexte) return cadre(<p className="compte-chargement">Chargement du carnet…</p>)

  const reglages = donnees.reglages
  const horaire = donnees.horaire
  // Horaire utilisable par le formulaire : 0003 appliqué et au moins une grille.
  const horaireFormulaire = horaire.actif && horaire.grilles.length > 0 ? { grilles: horaire.grilles, cases: horaire.cases } : null
  const horaireRempli = horaire.actif && horaire.grilles.some((g) => horaire.cases.some((c) => c.ecole_id === g.ecole_id))
  const grilles = horaire.actif ? horaire.grilles : []
  const classeMemo = donnees.classes.find((c) => c.id === classeActive)?.id ?? donnees.classes[0]?.id ?? null

  function choisirClasse(id: string) {
    setClasseActive(id)
    memoriserClasse(id)
  }

  /** « Noter la séance » d'un créneau (Aujourd'hui, Ma semaine, à rattraper). */
  function noterCreneau(c: Creneau) {
    choisirClasse(c.classe_id)
    setPanneau({ type: 'noter', classeId: c.classe_id, chapitre: chapitreParDefaut(c.classe_id, donnees!.classes, donnees!.seances), creneau: c })
  }

  /** « Noter une séance » sans créneau (page d'une classe, autre séance du jour). */
  function noterLibre(classeId?: string, date?: string) {
    const id = classeId ?? classeMemo ?? ''
    setPanneau({ type: 'noter', classeId: id, chapitre: chapitreParDefaut(id, donnees!.classes, donnees!.seances), creneau: null, date })
  }

  function apercu(s: SaisieSeance): string {
    const classe = donnees!.classes.find((c) => c.id === s.classe_id)
    if (!classe) return ''
    return textesSeance(contexte!, { ...s, id: '', cree_le: '', modifie_le: '' }, classe).texte
  }

  async function enregistrerSeance(s: SaisieSeance, copier: boolean, annonce: AnnonceEvaluation | null) {
    const p = panneau
    if (!p || (p.type !== 'noter' && p.type !== 'modifier') || !client) return
    const actif = horaire.actif
    const devoirs = donnees!.devoirs
    const generateursEval = donnees!.generateursEval
    const agenda = donnees!.agenda
    const classe = donnees!.classes.find((c) => c.id === s.classe_id)
    // Interro annoncée / contrôle-bilan : l'événement « Interrogation » de l'agenda (0006).
    const saisieEv: SaisieEvenement | null =
      devoirs && annonce && classe && agenda.actif
        ? {
            ecole_id: classe.ecole_id,
            type: 'interrogation',
            intitule: s.evaluation_type === 'bilan' ? INTITULE_BILAN : '',
            du: annonce.date,
            au: annonce.date,
            journee_entiere: annonce.heureDebut === null,
            heure_debut: annonce.heureDebut,
            heure_fin: annonce.heureFin,
            toutes_classes: false,
            accompagne: false,
            classe_id: classe.id,
            chapitre: `${s.niveau}/${s.chapitre}`,
            classes: [],
          }
        : null
    // Copie lancée AVANT l'enregistrement (geste de l'utilisateur encore valable pour le
    // presse-papiers) ; même texte que la copie d'une séance enregistrée, interro comprise.
    const evenementCopie = saisieEv ? { ...saisieEv, id: '', cree_le: '' } : null
    const textes = classe ? textesSeance(contexte!, { ...s, id: '', cree_le: '', modifie_le: '' }, classe, undefined, saisieEv ? { evenement: evenementCopie } : {}) : null
    const copie = copier && textes ? copierTexte(textes.texte, textes.html) : null
    const ancien = p.type === 'modifier' ? (p.seance.evaluation_evenement ?? null) : null
    const ok = await agir(
      async () => {
        let evId: string | null = s.evaluation_evenement ?? null
        let cree: string | null = null
        if (saisieEv) {
          const existant = evId ? agenda.evenements.find((e) => e.id === evId) : undefined
          if (existant) await modifierEvenement(client, existant, saisieEv)
          else evId = cree = await ajouterEvenement(client, saisieEv)
        }
        const finale: SaisieSeance = devoirs ? { ...s, evaluation_evenement: saisieEv ? evId : null } : s
        try {
          if (p.type === 'modifier') await modifierSeance(client, p.seance.id, finale, actif, devoirs, generateursEval)
          else await ajouterSeance(client, finale, actif, devoirs, generateursEval)
        } catch (ex) {
          // Pas d'interro orpheline : celle qu'on vient de créer est retirée.
          if (cree) await supprimerEvenement(client, cree).catch(() => undefined)
          throw ex
        }
        // L'interro liée d'avant n'a plus lieu d'être (évaluation retirée ou « faite aujourd'hui »).
        if (ancien && ancien !== finale.evaluation_evenement && agenda.evenements.some((e) => e.id === ancien)) await supprimerEvenement(client, ancien)
      },
      p.type === 'modifier' ? 'Séance modifiée.' : 'Séance enregistrée.',
    )
    if (!ok) return
    setPanneau(null)
    choisirClasse(s.classe_id)
    const base = p.type === 'modifier' ? 'Séance modifiée' : 'Séance enregistrée'
    const interro = saisieEv ? ` ${s.evaluation_type === 'bilan' ? 'Contrôle-bilan' : 'Interro'} du ${dateJourLong(saisieEv.du)} ajouté${s.evaluation_type === 'bilan' ? '' : 'e'} à l’agenda.` : ''
    if (copie && textes) {
      if (await copie) setMessage(`${base} et copiée : colle-la dans Smartschool (journal de classe ou message).${interro}`)
      else {
        setMessage(`${base}. Copie automatique impossible sur cet appareil : sélectionne le texte ci-dessous et copie-le.${interro}`)
        setTexteACopier(textes.texte)
      }
    } else if (interro) setMessage(`${base}.${interro}`)
  }

  /** « Annoncer une évaluation » / « Donner un devoir » : l'événement « Interrogation » (0006) et / ou la séance
   * d'annonce (séance du jour complétée, sinon nouvelle séance sans matière vue — `lib/annonceClasse.ts`). Aucune
   * migration. La page des élèves se republie seule (`synchroniserPages`, au rechargement des données). */
  async function annoncer(a: SaisieAnnonce, o: { textes: TextesAnnonce | null; preparer: boolean }) {
    if (!client || !donnees) return
    const classe = donnees.classes.find((c) => c.id === a.classeId)
    if (!classe) return
    const { devoirs, generateursEval, agenda } = donnees
    const actif = donnees.horaire.actif
    const evaluation = a.quoi === 'evaluation'
    if (evaluation && !agenda.actif) return
    // Copie AVANT l'enregistrement (le geste de l'utilisateur vaut encore pour le presse-papiers).
    const copie = o.textes ? copierTexte(o.textes.texte, o.textes.html) : null
    const maintenantCourant = new Date()
    const aujourdhui = dateIso(maintenantCourant)
    const minutes = maintenantCourant.getHours() * 60 + maintenantCourant.getMinutes()
    const support = devoirs ? seanceSupport(donnees.seances, a, aujourdhui) : null
    // Nouvelle séance d'annonce : à l'heure du cours en cours de la classe s'il y en a un.
    const enCours = actif ? (creneauxDuJour(aujourdhui, donnees.horaire.grilles, donnees.horaire.cases.filter((c) => c.classe_id === classe.id)).creneaux.find((c) => c.debut <= minutes && minutes < c.fin) ?? null) : null
    const base = support ? saisieDepuisSeance(support) : nouvelleSeanceSupport(a, aujourdhui, minutes, enCours)
    // Sans 0007 : la date de remise ne peut pas être gardée, elle va dans la consigne.
    const annonceFinale: SaisieAnnonce = !evaluation && !devoirs && a.date ? { ...a, consigne: `Pour le ${dateJourLong(a.date)} : ${a.consigne.trim()}` } : a
    const saisieEv: SaisieEvenement | null = evaluation
      ? {
          ecole_id: classe.ecole_id,
          type: 'interrogation',
          intitule: a.bilan ? INTITULE_BILAN : '',
          du: a.date,
          au: a.date,
          journee_entiere: a.heureDebut === null,
          heure_debut: a.heureDebut,
          heure_fin: a.heureFin,
          toutes_classes: false,
          accompagne: false,
          classe_id: classe.id,
          chapitre: `${a.niveau}/${a.chapitre}`,
          classes: [],
        }
      : null
    const nature = a.bilan ? 'Contrôle-bilan' : 'Interro'
    const fait = evaluation ? `${nature} du ${dateJourLong(a.date)} annoncé${a.bilan ? '' : 'e'} à la ${classe.nom}` : `Devoir donné à la ${classe.nom}${a.date ? ` pour le ${dateJourLong(a.date)}` : ''}`
    const ok = await agir(async () => {
      let evId: string | null = null
      if (saisieEv) evId = await ajouterEvenement(client, saisieEv)
      // Sans 0007, une évaluation n'est que l'événement de l'agenda (date et chapitre).
      if (evaluation && !devoirs) return
      const finale = seanceAvecAnnonce(base, annonceFinale, evId)
      try {
        if (support) await modifierSeance(client, support.id, finale, actif, devoirs, generateursEval)
        else await ajouterSeance(client, finale, actif, devoirs, generateursEval)
      } catch (ex) {
        // Pas d'interro orpheline : celle qu'on vient de créer est retirée.
        if (evId) await supprimerEvenement(client, evId).catch(() => undefined)
        throw ex
      }
    }, `${fait}.`)
    if (!ok) return
    choisirClasse(classe.id)
    if (copie && o.textes) {
      if (await copie) setMessage(`${fait}, et texte copié : colle-le dans le journal de classe ou Smartschool.`)
      else {
        setMessage(`${fait}. Copie automatique impossible sur cet appareil : sélectionne le texte ci-dessous et copie-le.`)
        setTexteACopier(o.textes.texte)
      }
    }
    if (o.preparer && evaluation) {
      naviguer(urlEvaluationMatiere({ levelSlug: a.niveau, chapitres: [{ slug: a.chapitre, sections: a.etapes, ...(a.generateurs.length > 0 ? { generateurs: a.generateurs } : {}) }] }, '', classe.nom, classe.id))
      return
    }
    naviguer(`/carnet/classe/${classe.id}`)
  }

  /** État de la page des élèves d'une classe (0010) pour « Publier ». */
  function etatPageEleves(classeId: string): EtatPageEleves {
    if (!donnees || !donnees.pages.actif) return { etat: 'inactive', interros: false, devoirs: false }
    const p = donnees.pages.pages.find((x) => x.classe_id === classeId)
    if (!p) return { etat: 'aucune', interros: false, devoirs: false }
    return { etat: p.code ? 'publiee' : 'coupee', interros: p.publier_interros, devoirs: p.publier_devoirs }
  }

  /** Rubriques du texte (panneau du texte ou réglages) : mémorisées si 0007 est appliqué. */
  async function changerRubriques(r: Rubriques) {
    if (!client || !profil || !donnees) return
    setDonnees({ ...donnees, texte: { ...donnees.texte, rubriques: r } }) // affiché tout de suite
    if (!donnees.texte.actif) return
    await agir(() => enregistrerReglagesTexte(client, { rubriques: r }, donnees.reglagesExiste, profil.id), 'Rubriques du texte enregistrées.')
  }

  async function changerCompetences(liste: string[]) {
    if (!client || !profil || !donnees || !donnees.texte.actif) return
    setDonnees({ ...donnees, texte: { ...donnees.texte, competences: liste } })
    await agir(() => enregistrerReglagesTexte(client, { competences: liste }, donnees.reglagesExiste, profil.id), 'Liste des compétences transversales enregistrée.')
  }

  async function changerReglages(r: ReglagesCarnet) {
    if (!client || !profil || !donnees) return
    const existe = donnees.reglagesExiste
    setDonnees({ ...donnees, reglages: r }) // affiché tout de suite ; relu après l'enregistrement
    await agir(() => enregistrerReglages(client, r, existe, profil.id), 'Réglage enregistré.')
  }

  async function enregistrerEvenement(saisie: SaisieEvenement) {
    const p = panneau
    if (!p || p.type !== 'evenement' || !client) return
    const avant = p.evenement
    const interro = saisie.type === 'interrogation'
    const ok = await agir(
      () => (avant ? modifierEvenement(client, avant, saisie) : ajouterEvenement(client, saisie)),
      avant ? (interro ? 'Interrogation modifiée.' : 'Événement modifié.') : interro ? 'Interrogation enregistrée.' : 'Événement enregistré.',
    )
    if (ok) setPanneau(null)
  }

  async function supprimerUnEvenement() {
    const p = panneau
    if (!p || p.type !== 'evenement' || !p.evenement || !client) return
    const e = p.evenement
    const ok = await agir(() => supprimerEvenement(client, e.id), e.type === 'interrogation' ? 'Interrogation supprimée.' : 'Événement supprimé.')
    if (ok) setPanneau(null)
  }

  const periodes: PeriodeBulletin[] = donnees.agenda.periodes
  const reglagesAgenda = (
    <ReglagesAgenda
      actif={donnees.agenda.actif}
      ecoles={ecoles}
      periodes={periodes}
      evenements={donnees.agenda.evenements}
      seuil={donnees.agenda.seuil}
      aujourdhui={dateIso(maintenant)}
      occupe={occupe}
      onAjouter={(ecoleId, annee, remise) => agir(() => ajouterPeriode(client, ecoleId, annee, remise, periodes), 'Période ajoutée.')}
      onModifier={(per, remise) => agir(() => modifierPeriode(client, per, remise, periodes), `Période ${per.numero} modifiée.`)}
      onSupprimer={(per) => agir(() => supprimerPeriode(client, per, periodes), `Période ${per.numero} supprimée.`)}
      onSeuil={(seuil) => {
        const existe = donnees.reglagesExiste
        setDonnees({ ...donnees, agenda: { ...donnees.agenda, seuil } }) // affiché tout de suite ; relu après l'enregistrement
        void agir(() => enregistrerSeuil(client, seuil, existe, profil.id), `Seuil : ${seuil} jour${seuil > 1 ? 's' : ''} de classe.`)
      }}
    />
  )

  const gestionClasses = (
    <GestionClasses
      classes={donnees.classes}
      ecoles={ecoles}
      nombreSeances={(id) => donnees.seances.filter((s) => s.classe_id === id).length}
      occupe={occupe}
      onAjouter={(s) => agir(() => ajouterClasse(client, s), `Classe « ${s.nom.trim()} » ajoutée.`)}
      onModifier={(id, s) => agir(() => modifierClasse(client, id, s), 'Classe modifiée.')}
      onSupprimer={supprimerUneClasse}
    />
  )

  function supprimerUneClasse(c: Classe) {
    const n = donnees!.seances.filter((s) => s.classe_id === c.id).length
    if (window.confirm(`Supprimer la classe « ${c.nom} »${n > 0 ? ` et ses ${n} séance${n > 1 ? 's' : ''}` : ''} ? Cette action est irréversible.`)) void agir(() => supprimerClasse(client!, c.id), 'Classe supprimée.')
  }

  const reglagesSection = (
    <section className="compte-section carnet-page-simple" aria-labelledby="carnet-reglages">
      <h2 id="carnet-reglages" className="carnet-titre-vue">
        Bulletin, texte de l'agenda scolaire et horaire des séances
      </h2>
      {reglagesAgenda}
      <ReglagesTexteAgenda
        actif={donnees.texte.actif}
        rubriques={donnees.texte.rubriques}
        competences={donnees.texte.competences}
        occupe={occupe}
        onRubriques={(r) => void changerRubriques(r)}
        onCompetences={(l) => void changerCompetences(l)}
      />
      <fieldset className="carnet-fieldset">
        <legend>Ordre des chapitres</legend>
        <p className="compte-aide">
          Tes classes, la page des élèves, tes documents enregistrés et imprimés suivent l'ordre où tu donnes les chapitres, avec tes numéros (jamais ceux du site).{' '}
          <Link to="/profil#ordre-chapitres">Mon ordre des chapitres (Réglages)</Link>
        </p>
      </fieldset>
      <fieldset className="carnet-fieldset">
        <legend>Horaire des séances</legend>
        <label className="carnet-case">
          <input type="radio" name="format-horaire" checked={reglages.format_horaire === 'plage'} disabled={occupe} onChange={() => void changerReglages({ ...reglages, format_horaire: 'plage' })} />
          <span>Plage horaire (08h50 → 09h40)</span>
        </label>
        <label className="carnet-case">
          <input type="radio" name="format-horaire" checked={reglages.format_horaire === 'numero'} disabled={occupe} onChange={() => void changerReglages({ ...reglages, format_horaire: 'numero' })} />
          <span>Numéro d'heure (3e heure)</span>
        </label>
        {reglages.format_horaire === 'plage' && (
          <div className="compte-champ carnet-champ-court">
            <label htmlFor="carnet-duree">Durée d'une heure de cours</label>
            <select id="carnet-duree" value={String(reglages.duree_heure)} disabled={occupe} onChange={(e) => void changerReglages({ ...reglages, duree_heure: Number(e.target.value) })}>
              {[...new Set([...DUREES, reglages.duree_heure])].sort((a, b) => a - b).map((d) => (
                <option key={d} value={String(d)}>
                  {d} min
                </option>
              ))}
            </select>
          </div>
        )}
        <p className="compte-aide">
          Mémorisé dans ton compte. Les séances déjà notées gardent leurs deux écritures quand elles les ont. Avec une grille horaire, les séances notées depuis l'horaire
          affichent le numéro et la plage ensemble : « H2 (09h35 → 10h25) ».
        </p>
      </fieldset>
    </section>
  )

  const messages = (message || erreur) && (
    <div className="carnet-messages">
      <p className={erreur ? 'compte-erreur-champ' : 'compte-message'} role={erreur ? 'alert' : 'status'}>
        {erreur ?? message}
      </p>
      {texteACopier !== null && <textarea className="carnet-texte-copie" readOnly rows={8} value={texteACopier} onFocus={(e) => e.currentTarget.select()} aria-label="Texte pour Smartschool" />}
    </div>
  )

  // Sans école : rien n'est possible avant d'en ajouter une dans le profil.
  if (ecoles.length === 0) {
    return cadre(
      <div className="compte-sections">
        {messages}
        <div className="compte-encadre" role="status">
          <p>
            <strong>Ajoute d'abord ton école.</strong> Chaque classe est rattachée à une de tes écoles : ajoute-la dans les <Link to="/profil#profil">Réglages (Mon profil et mes écoles)</Link> (nom
            et adresse), puis reviens ici.
          </p>
        </div>
        {reglagesSection}
      </div>,
    )
  }

  const sansClasse = (
    <section className="compte-section carnet-page-simple" aria-labelledby="carnet-premiere-classe">
      <h2 id="carnet-premiere-classe" className="carnet-titre-vue">
        Mes classes
      </h2>
      <p className="compte-intro">
        Note ce qui a été vu dans chaque classe : sections et sous-parties du cours, exercices, devoir. Copie le résumé pour Smartschool, imprime une fiche ou l'agenda complet d'une
        période, suis la progression et crée une évaluation sur la matière vue. Aucune donnée d'élève n'est enregistrée.
      </p>
      <p className="compte-vide">Aucune classe pour l'instant : ajoute la première (par exemple « 5e B »).</p>
      {gestionClasses}
    </section>
  )
  const avecClasses = (vue: ReactNode) => (donnees.classes.length === 0 ? sansClasse : vue)

  const seanceVue = panneau?.type === 'voir' ? donnees.seances.find((s) => s.id === panneau.seanceId) : undefined
  const seanceTexte = panneau?.type === 'texte' ? donnees.seances.find((s) => s.id === panneau.seanceId) : undefined
  const classeTexte = seanceTexte ? donnees.classes.find((c) => c.id === seanceTexte.classe_id) : undefined

  return (
    <CarnetContexte.Provider value={contexte}>
      {cadre(
        <>
          {messages}
          <Routes>
            <Route
              index
              element={avecClasses(
                <VueEnsembleClasses
                  classes={donnees.classes}
                  seances={donnees.seances}
                  horaire={horaire}
                  agenda={donnees.agenda}
                  maintenant={maintenant}
                  pageEleves={(id) => (donnees.pages.actif ? (donnees.pages.pages.find((p) => p.classe_id === id)?.code ? 'publiee' : donnees.pages.pages.some((p) => p.classe_id === id) ? 'coupee' : 'aucune') : 'inactive')}
                />,
              )}
            />
            <Route
              path="aujourdhui"
              element={avecClasses(
                <Aujourdhui
                  grilles={grilles}
                  cases={horaire.actif ? horaire.cases : []}
                  seances={donnees.seances}
                  horaireActif={horaire.actif}
                  classeActive={classeMemo}
                  maintenant={maintenant}
                  onNoter={noterCreneau}
                  onNoterLibre={noterLibre}
                />,
              )}
            />
            <Route
              path="semaine"
              element={avecClasses(
                <MaSemaine
                  grilles={grilles}
                  cases={horaire.actif ? horaire.cases : []}
                  seances={donnees.seances}
                  horaireActif={horaire.actif}
                  maintenant={maintenant}
                  dureeHeure={reglages.duree_heure}
                  onNoter={noterCreneau}
                />,
              )}
            />
            <Route
              path="classe/:id"
              element={
                <RouteClasse
                  classes={donnees.classes}
                  rendu={(classe) => (
                    <PageClasse
                      classe={classe}
                      seances={donnees.seances}
                      cases={horaire.actif ? horaire.cases : []}
                      maintenant={maintenant}
                      onNoter={(id) => noterLibre(id)}
                      onModifierClasse={(id, s: SaisieClasse) => agir(() => modifierClasse(client, id, s), 'Classe modifiée.')}
                      onSupprimerClasse={supprimerUneClasse}
                      pageEleves={donnees.pages.actif ? (donnees.pages.pages.find((p) => p.classe_id === classe.id)?.code ? 'publiee' : donnees.pages.pages.some((p) => p.classe_id === classe.id) ? 'coupee' : 'aucune') : 'inactive'}
                    />
                  )}
                  onVue={choisirClasse}
                />
              }
            />
            <Route
              path="classe/:id/eleves"
              element={
                <RouteClasse
                  classes={donnees.classes}
                  rendu={(classe) => {
                    const page = donnees.pages.actif ? donnees.pages.pages.find((p) => p.classe_id === classe.id) : undefined
                    const action = (faire: () => Promise<unknown>, succes: string) => {
                      setEtatPublication({ message: null, erreur: null })
                      return agir(faire, succes)
                    }
                    const creer = () => void action(() => nouveauCode(client, classe.id), page?.code ? 'Nouveau code créé : l’ancien ne marche plus.' : 'Code créé : la page des élèves est publiée.')
                    return (
                      <PageClasseEleves
                        classe={classe}
                        actif={donnees.pages.actif}
                        erreurChargement={donnees.erreurPages}
                        page={page}
                        apercu={construireContenuPage({
                          classe,
                          seances: donnees.seances,
                          evenements: donnees.agenda.actif ? donnees.agenda.evenements : [],
                          grilles: horaire.actif ? horaire.grilles : [],
                          format: reglages.format_horaire,
                          aujourdhui: dateIso(maintenant),
                          avecHeure: page?.publier_heure ?? false,
                        })}
                        occupe={occupe}
                        message={etatPublication.message}
                        erreur={etatPublication.erreur}
                        onCreer={creer}
                        onNouveau={creer}
                        onCouper={() => void action(() => couperCode(client, classe.id), 'Code coupé : la page des élèves ne s’ouvre plus.')}
                        onReglages={(r: ReglagesPageClasse) => void action(() => enregistrerReglagesPage(client, classe.id, r), 'Ce que voient les élèves : enregistré.')}
                        onMettreAJour={() => {
                          setEtatPublication({ message: null, erreur: null })
                          void charger().then(() => setForcerVerification((n) => n + 1))
                        }}
                      />
                    )
                  }}
                  onVue={choisirClasse}
                />
              }
            />
            <Route
              path="classes"
              element={
                donnees.classes.length === 0 ? (
                  sansClasse
                ) : (
                  <section className="compte-section carnet-page-simple" aria-labelledby="carnet-classes">
                    <h2 id="carnet-classes" className="carnet-titre-vue">
                      Mes classes
                    </h2>
                    {gestionClasses}
                  </section>
                )
              }
            />
            <Route
              path="agenda"
              element={avecClasses(
                <RouteAgenda>
                  {(classeParam) => (
                    <AgendaPeriode
                      key={classeParam ?? ''}
                      classes={donnees.classes}
                      seances={donnees.seances}
                      ecoles={ecoles}
                      grilles={grilles}
                      format={reglages.format_horaire}
                      dureeHeure={reglages.duree_heure}
                      professeur={profil.nom_affiche}
                      classeActive={classeParam ?? classeMemo}
                      maintenant={maintenant}
                    />
                  )}
                </RouteAgenda>,
              )}
            />
            <Route
              path="horaire"
              element={
                <section className="compte-section carnet-page-simple" aria-labelledby="carnet-horaire">
                  <h2 id="carnet-horaire" className="carnet-titre-vue">
                    Mon horaire
                  </h2>
                  {donnees.classes.length === 0 ? (
                    <p className="compte-encadre" role="status">
                      Ajoute d'abord une classe (<Link to="/carnet/classes">Mes classes</Link>) pour remplir ton horaire de la semaine.
                    </p>
                  ) : !horaire.actif ? (
                    <MessageHoraireInactif />
                  ) : (
                    <>
                      {!horaireRempli && (
                        <p className="compte-intro">
                          Remplis ton horaire de la semaine : le carnet te proposera alors la séance du créneau en cours, te rappellera les séances oubliées et comptera les heures
                          restantes avec chaque classe (congés de la Fédération Wallonie-Bruxelles exclus).
                        </p>
                      )}
                      <MonHoraire
                        horaire={horaire}
                        ecoles={ecoles}
                        classes={donnees.classes}
                        occupe={occupe}
                        onEnregistrerGrille={(ecoleId, g, existe, hors) => agir(() => enregistrerGrille(client, ecoleId, g, existe, hors, horaire.heureZero), 'Grille horaire enregistrée.')}
                        onSupprimerGrille={(ecoleId) => void agir(() => supprimerGrille(client, ecoleId), 'Grille et horaire de cette école retirés.')}
                        onDefinirCase={(existante, saisie) => agir(() => definirCase(client, existante, saisie), 'Horaire enregistré.')}
                      />
                    </>
                  )}
                </section>
              }
            />
            <Route path="reglages" element={reglagesSection} />
            <Route
              path="annoncer"
              element={avecClasses(
                <RouteAnnonce>
                  {(classeParam, quoi, chapitreParam) => (
                    <AnnoncerEvaluation
                      key={`${quoi}-${classeParam ?? ''}`}
                      classes={donnees.classes}
                      seances={donnees.seances}
                      horaire={horaireFormulaire}
                      quoi={quoi}
                      classeInitiale={classeParam ?? classeMemo}
                      chapitreInitial={chapitreParam}
                      pageEleves={etatPageEleves}
                      occupe={occupe}
                      maintenant={maintenant}
                      onAnnoncer={(a, o) => void annoncer(a, o)}
                    />
                  )}
                </RouteAnnonce>,
              )}
            />
            <Route path="*" element={<Navigate to="/carnet" replace />} />
          </Routes>
        </>,
      )}

      {panneau && (panneau.type === 'noter' || panneau.type === 'modifier') && (
        <PanneauLateral titreId={titrePanneau} onFermer={() => setPanneau(null)}>
          <FormulaireSeance
            key={
              panneau.type === 'modifier'
                ? panneau.seance.id
                : `nouveau-${panneau.chapitre}-${panneau.classeId}-${panneau.creneau ? `${panneau.creneau.date}-${panneau.creneau.ecole_id}-${panneau.creneau.heureDebut}` : (panneau.date ?? '')}`
            }
            classes={donnees.classes}
            seances={donnees.seances}
            reglages={reglages}
            initiale={panneau.type === 'modifier' ? panneau.seance : null}
            prerempli={panneau.type === 'noter' ? { classeId: panneau.classeId, chapitre: panneau.chapitre, creneau: panneau.creneau, date: panneau.date, chapitreChoisi: panneau.chapitreChoisi } : { classeId: '', chapitre: '' }}
            horaire={horaireFormulaire}
            heureZero={horaire.heureZero}
            occupe={occupe}
            titreId={titrePanneau}
            apercu={apercu}
            avecGrille={(id) => {
              const k = donnees.classes.find((c) => c.id === id)
              return k ? avecGrille(contexte, k) : false
            }}
            onEnregistrer={(s, copier, annonce) => void enregistrerSeance(s, copier, annonce)}
            onAnnuler={() => setPanneau(null)}
          />
        </PanneauLateral>
      )}
      {panneau?.type === 'evenement' && (
        <PanneauLateral titreId={titrePanneau} onFermer={() => setPanneau(null)}>
          <FormulaireEvenement
            key={panneau.evenement?.id ?? 'nouveau'}
            initiale={panneau.evenement}
            prerempli={panneau.prerempli}
            classes={donnees.classes}
            ecoles={ecoles}
            grilles={grilles}
            cases={horaire.actif ? horaire.cases : []}
            periodes={periodes}
            evenements={donnees.agenda.evenements}
            seuil={donnees.agenda.seuil}
            aujourdhui={dateIso(maintenant)}
            actif={donnees.agenda.actif}
            occupe={occupe}
            titreId={titrePanneau}
            onEnregistrer={(s) => void enregistrerEvenement(s)}
            onSupprimer={() => void supprimerUnEvenement()}
            onAnnuler={() => setPanneau(null)}
          />
        </PanneauLateral>
      )}
      {seanceTexte && classeTexte && (
        <PanneauLateral titreId={titrePanneau} onFermer={() => setPanneau(null)} large>
          <TexteAgenda
            key={seanceTexte.id}
            seance={seanceTexte}
            classe={classeTexte}
            titreId={titrePanneau}
            onFermer={() => setPanneau(null)}
            onRubriques={(r) => void changerRubriques(r)}
            onEnregistrerSeance={(v) => void agir(() => enregistrerTexteSeance(client, seanceTexte.id, v), 'Objectif et compétences enregistrés avec la séance.')}
          />
        </PanneauLateral>
      )}
      {seanceVue && (
        <PanneauLateral titreId={titrePanneau} onFermer={() => setPanneau(null)}>
          <div className="carnet-panneau-tete">
            <div className="carnet-panneau-titres">
              <h2 id={titrePanneau}>Séance du {dateLongue(seanceVue.date_seance).replace(/ \d{4}$/, '')}</h2>
              <p className="carnet-panneau-resume">{donnees.classes.find((c) => c.id === seanceVue.classe_id)?.nom}</p>
            </div>
            <button type="button" className="carnet-bouton carnet-fermer" aria-label="Fermer" onClick={() => setPanneau(null)} data-autofocus>
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <div className="carnet-panneau-corps">
            <CarteSeance seance={seanceVue} />
            <p>
              <button type="button" className="carnet-bouton" disabled={occupe} onClick={() => setPanneau({ type: 'modifier', seance: seanceVue })}>
                Modifier la séance
              </button>
            </p>
          </div>
        </PanneauLateral>
      )}
    </CarnetContexte.Provider>
  )
}

/** `/carnet/classe/:id` : la classe demandée (mémorisée comme classe active), ou un message. */
function RouteClasse({ classes, rendu, onVue }: { classes: Classe[]; rendu: (c: Classe) => ReactNode; onVue: (id: string) => void }) {
  const { id } = useParams()
  const classe = classes.find((c) => c.id === id)
  useEffect(() => {
    if (classe) onVue(classe.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seulement quand la classe change
  }, [classe?.id])
  if (!classe) {
    return (
      <div className="compte-encadre" role="status">
        <p>
          Cette classe n'existe pas (ou plus). <Link to="/carnet/classes">Voir mes classes</Link>
        </p>
      </div>
    )
  }
  return <>{rendu(classe)}</>
}

/** `/carnet/annoncer?classe=<id>&quoi=devoir&chapitre=<niveau>/<slug>` : « Annoncer une évaluation » (défaut) ou
 * « Donner un devoir », classe et chapitre choisis d'avance (tableau de bord, carte et page de la classe, fin de
 * projection). */
function RouteAnnonce({ children }: { children: (classe: string | null, quoi: QuoiAnnonce, chapitre: string | null) => ReactNode }) {
  const [params] = useSearchParams()
  return <>{children(params.get('classe'), params.get('quoi') === 'devoir' ? 'devoir' : 'evaluation', params.get('chapitre'))}</>
}

/** `/carnet/agenda?classe=<id>` (bouton « Agenda de la classe ») : classe choisie d'avance. */
function RouteAgenda({ children }: { children: (classe: string | null) => ReactNode }) {
  const [params] = useSearchParams()
  return <>{children(params.get('classe'))}</>
}
