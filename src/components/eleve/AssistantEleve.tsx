import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LEVELS, findChapter } from '../../content/chaptersIndex'
import type { ChapterContent } from '../../content/types'
import { useCompte } from '../../lib/compteContexte'
import { estChapitreFonctionnel } from '../../lib/chapitresFonctionnels'
import { genererDocumentsDepuisPlan, type DocumentGenere } from '../../lib/evaluationLocal'
import { declencherTelechargement } from '../../entrainement/export/telechargerBlob'
import type { Processus } from '../../lib/evaluationPayload'
import { CATEGORIES_NIVEAU, LIBELLE_CATEGORIE, PLAGE_CATEGORIE, categorieDuNiveau, libellePlageNiveaux, rangCategorie, type CategorieNiveau } from '../../entrainement/export/niveauDifficulte'
import { tirerGraine } from '../../entrainement/export/codeExercice'
import { PART_MAX_HASARD, PART_MIN_HASARD, texteParts, type RepartitionPourcents } from '../../lib/repartitionProcessus'
import { ReglageCompetences } from '../admin/conception/ReglageCompetences'
import { RichText } from '../Math'
import { lireListeUrl } from '../../lib/carnetMatiere'
import {
  COMPETENCES_ELEVE,
  NOMBRE_FEUILLE_DEFAUT,
  NOMBRE_FEUILLE_MAX,
  NOMBRE_FEUILLE_MIN,
  capaciteType,
  chapitreAvecCalculatrice,
  permisParCalculatrice,
  demonstrationsDuChapitre,
  enonceDemonstration,
  typesFeuille,
  type Composition,
  type ExercicesFeuille,
  texteRepartitionBlanche,
  type PartsEleve,
  DUREES_ELEVE,
  LIBELLE_COMPETENCE,
  composer,
  construirePlanEleve,
  disponibilite,
  notionsDuChapitre,
  preparerCandidats,
  texteCategories,
  texteSeulement,
  type Candidat,
  type CalculatriceEleve,
  type DisponibiliteCompetence,
  type PlanEleve,
  type ReglagesEleve,
  type TypeEleve,
} from '../../lib/compositionEleve'

/**
 * Assistant « Me préparer à l'évaluation » — parcours ÉLÈVE des pages publiques `/exercice` et
 * `/{niveau}/{chapitre}/exercices` (visiteur non connecté ; un professeur connecté voit le panneau
 * professeur). Trois blocs (maquettes validées « EleveAssistant » / « EleveTelephone ») : que veux-tu
 * faire (feuille d'exercices ou évaluation blanche), sur quoi (chapitre, notions, compétences annoncées),
 * combien de temps et quels niveaux (cases à cocher, tous par défaut ; un niveau sans exercice pour
 * ces notions et compétences est grisé avec sa raison) ; puis un récapitulatif EXACT (le plan est
 * préparé à l'avance : questions imprimées, durée, points, niveaux et compétences réellement obtenus)
 * et le bouton de génération. Chaque clic produit un nouveau tirage.
 * Évaluation blanche (décision de l'utilisateur, 22/11/2026, choix c) : parts du temps et des points
 * entre les compétences cochées tirées AU HASARD à chaque préparation (« Autre tirage »), ou réglées par
 * l'élève (« Je règle les parts » : `ReglageCompetences` du professeur, non mémorisé) ; parts obtenues
 * affichées dans le récapitulatif et le document. Démonstrations annoncées : l'élève coche celles que
 * son professeur a demandé de retenir (aucune par défaut), seules celles-là peuvent être tirées.
 * Feuille d'exercices (décision de l'utilisateur, 22/11/2026 : « rien à voir avec une évaluation ») :
 * ni durée ni points — un nombre d'exercices global (− / +, 1 à 30, 10 par défaut), réparti à parts
 * égales, ou « Choisir exercice par exercice » (compteur par type, 0 à 5 ; « Revenir au nombre
 * global »). Connaître y compte aussi les « Formule », les questions de compréhension et les
 * démonstrations cochées dans « Démonstrations à travailler » (aucune par défaut) — sans niveau.
 * Case « Avec calculatrice » (décisions de l'utilisateur, 23 et 24/11/2026), feuille ET blanche, décochée
 * par défaut — exactement la règle du professeur : décochée = calculatrice interdite (variantes qui
 * l'exigent écartées et grisées avec leur raison, instances sans calculatrice) ; cochée = calculatrice
 * autorisée (seulement des cas où elle sert : variantes toujours exactes écartées et grisées, jamais une
 * instance `calcul: 'exacte'`). Chapitre sans aucun cas « calculatrice » : case désactivée, avec la
 * raison. Changer la case refait le tirage ; rien n'est mémorisé.
 * Lien du professeur (texte de l'interro annoncée, carnet) sur une page de chapitre : `?notions=id1,id2`
 * coche ces notions (id inconnu ignoré ; aucune reconnue, ou toutes : « Tout le chapitre ») ; `&exos=gen…`
 * ne garde, parmi les EXERCICES tirés, que ces générateurs — case « Seulement les exercices annoncés par
 * ton professeur », cochée d'office, que l'élève peut décocher (vrai/faux, formules et démonstrations
 * restent proposés : ce ne sont pas des générateurs). Rien n'est lu ni écrit ailleurs.
 * Aucune donnée d'élève : rien n'est enregistré.
 */

/** Numéros 1–7 d'une catégorie, tels qu'imprimés sur les feuilles (« 5–7 » pour très difficile). */
function numerosCategorie(c: CategorieNiveau): string {
  const [a, b] = PLAGE_CATEGORIE[c]
  return a === b ? String(a) : `${a}–${b}`
}

function listeCompetences(ps: readonly Processus[]): string {
  const mots = ps.map((p) => LIBELLE_COMPETENCE[p])
  return mots.length <= 1 ? (mots[0] ?? '') : `${mots.slice(0, -1).join(', ')} et ${mots[mots.length - 1]}`
}

/** Chapitres proposés d'un niveau : câblés, avec au moins une notion à générateur. */
function chapitresDisponibles(levelSlug: string): ChapterContent[] {
  return (LEVELS.find((l) => l.slug === levelSlug)?.chapters ?? []).filter((c) => estChapitreFonctionnel(levelSlug, c.slug) && notionsDuChapitre(c).length > 0)
}

function useEtroit(): boolean {
  const requete = '(max-width: 600px)'
  const [etroit, setEtroit] = useState(() => typeof window !== 'undefined' && window.matchMedia(requete).matches)
  useEffect(() => {
    const mq = window.matchMedia(requete)
    const suivre = () => setEtroit(mq.matches)
    mq.addEventListener('change', suivre)
    return () => mq.removeEventListener('change', suivre)
  }, [])
  return etroit
}

/** Compteur − / + (cibles ≥ 44 px) : jamais de champ numérique (règle « champs de saisie libre »). */
function Compteur({ valeur, min, max, nom, onChange }: { valeur: number; min: number; max: number; nom: string; onChange: (v: number) => void }) {
  return (
    <span className="eleve-compteur">
      <button type="button" aria-label={`Un de moins — ${nom}`} disabled={valeur <= min} onClick={() => onChange(Math.max(min, valeur - 1))}>
        −
      </button>
      <span className="eleve-compteur-valeur" aria-live="polite">
        {valeur}
      </span>
      <button type="button" aria-label={`Un de plus — ${nom}`} disabled={valeur >= max} onClick={() => onChange(Math.min(max, valeur + 1))}>
        +
      </button>
    </span>
  )
}

/** Niveaux d'un type d'exercice aux niveaux cochés (« 2–4 · facile à difficile »), d'après ses tirages
 * d'estimation ; rien pour un générateur sans niveau. */
function niveauxDuType(c: Candidat, niveaux: readonly CategorieNiveau[]): string | null {
  const tous = niveaux.length === CATEGORIES_NIVEAU.length
  const retenus = c.niveaux.filter((n) => tous || niveaux.includes(categorieDuNiveau(n)))
  const liste = retenus.length > 0 ? retenus : c.niveaux
  if (liste.length === 0) return null
  return libellePlageNiveaux(Math.min(...liste), Math.max(...liste))
}

/** « seulement avec calculatrice » (case décochée : ce que seules des variantes à calculatrice offrent) ou
 * « seulement sans calculatrice » (case cochée : ce que seules des variantes toujours exactes offrent). */
function texteAutreChoix(calculatrice: CalculatriceEleve): string {
  return calculatrice === 'interdite' ? 'seulement avec calculatrice' : 'seulement sans calculatrice'
}

/** Ce qu'une compétence offre aux niveaux : « seulement de facile à moyen », suivi des niveaux que seul
 * l'autre choix de calculatrice offrirait (« ; difficile : seulement avec calculatrice »). */
function texteOffre(d: DisponibiliteCompetence, calculatrice: CalculatriceEleve): string {
  const calc = d.categoriesEcarteesCalculatrice.length > 0 ? `${texteCategories(d.categoriesEcarteesCalculatrice)} : ${texteAutreChoix(calculatrice)}` : ''
  if (d.categories.length === 0) return calc || texteSeulement(d.categories)
  return `${texteSeulement(d.categories)}${calc ? ` ; ${calc}` : ''}`
}

/** Nom d'un type d'exercice (texte simple, pour les noms accessibles des compteurs). */
function nomType(c: Candidat): string {
  return ([c.titre, c.variante].filter(Boolean).join(' — ') || 'Exercice').replace(/\$/g, '')
}

function nomFichier(chapitre: ChapterContent, type: TypeEleve, doc: DocumentGenere): string {
  const base = `${type === 'blanche' ? 'Évaluation blanche' : "Feuille d'exercices"} — ${chapitre.title}`.replace(/[\\/:*?"<>|]/g, '-')
  return `${base}${doc.type === 'amenagee' ? ' — version aménagée' : ''}.html`
}

export function AssistantEleve({ verrouille }: { verrouille?: { levelSlug: string; chapitreSlug: string } }) {
  const compte = useCompte()
  const location = useLocation()
  const etroit = useEtroit()

  // `/exercice?niveau=5e-4h` : année présélectionnée (lien de la page d'accueil) ; valeur inconnue, ou
  // année sans chapitre proposé, ignorée (première année).
  const [anneeInitiale] = useState(() => {
    const demandee = new URLSearchParams(location.search).get('niveau')
    return demandee && LEVELS.some((l) => l.slug === demandee) && chapitresDisponibles(demandee).length > 0 ? demandee : LEVELS[0].slug
  })
  const [levelSlug, setLevelSlug] = useState(verrouille?.levelSlug ?? anneeInitiale)
  const [chapitreSlug, setChapitreSlug] = useState(verrouille?.chapitreSlug ?? chapitresDisponibles(anneeInitiale)[0]?.slug ?? '')
  const chapitre = findChapter(levelSlug, chapitreSlug)
  const notions = useMemo(() => (chapitre ? notionsDuChapitre(chapitre) : []), [chapitre])

  const [type, setType] = useState<TypeEleve>('blanche')
  // Lien du professeur (carnet : interro annoncée) : `?notions=` et `?exos=`, page d'un chapitre seulement.
  const [annonceUrl] = useState(() => {
    const q = new URLSearchParams(location.search)
    return verrouille ? { notions: lireListeUrl(q.get('notions'), 'section'), exos: lireListeUrl(q.get('exos'), 'generateur') } : { notions: [], exos: [] }
  })
  /** `null` : tout le chapitre. */
  const [choisies, setChoisies] = useState<Set<string> | null>(() => {
    const ids = notions.map((n) => n.sectionId)
    const garde = annonceUrl.notions.filter((id) => ids.includes(id))
    return garde.length === 0 || garde.length === ids.length ? null : new Set(garde)
  })
  // Notions annoncées cachées derrière « + n » sur téléphone : liste dépliée d'office.
  const [notionsDepliees, setNotionsDepliees] = useState(() => annonceUrl.notions.some((id) => notions.slice(3).some((n) => n.sectionId === id)))
  /** Case « Seulement les exercices annoncés par ton professeur » (`?exos=`), cochée d'office. */
  const [seulementAnnonces, setSeulementAnnonces] = useState(true)
  const [duree, setDuree] = useState<number>(30)
  /** Niveaux cochés (intention de l'élève) : tous par défaut, niveaux mélangés. */
  const [niveauxCoches, setNiveauxCoches] = useState<Set<CategorieNiveau>>(() => new Set(CATEGORIES_NIVEAU))
  /** Compétences cochées : les trois par défaut. */
  const [competencesCochees, setCompetencesCochees] = useState<Set<Processus>>(() => new Set([1, 2, 3] as Processus[]))
  /** Petit rappel quand l'élève essaie de tout décocher. */
  const [rappelMinimum, setRappelMinimum] = useState<'niveau' | 'competence' | null>(null)
  const [amenagee, setAmenagee] = useState(false)
  /** Case « Avec calculatrice » (décision de l'utilisateur, 23/11/2026) : décochée par défaut =
   * calculatrice interdite, comme chez le professeur. Changer la case refait le tirage ; non mémorisée. */
  const [avecCalculatriceVoulue, setAvecCalculatrice] = useState(false)
  /** Le chapitre a-t-il au moins un exercice « avec calculatrice » (règle du professeur) ? `false` : case
   * désactivée (« Aucun exercice de ce chapitre ne demande la calculatrice »), calculatrice interdite. */
  const [casCalculatrice, setCasCalculatrice] = useState<boolean | null>(null)
  const calculatriceImpossible = casCalculatrice === false
  const avecCalculatrice = avecCalculatriceVoulue && !calculatriceImpossible
  const calculatrice: CalculatriceEleve = avecCalculatrice ? 'autorisee' : 'interdite'
  /** Feuille d'exercices : joindre le formulaire du chapitre (annexe juste après l'énoncé, comme la case du
   * professeur) — décoché par défaut (décision de l'utilisateur, 22/11/2026). Posé au moment de générer :
   * cocher la case ne refait pas le tirage. */
  const [formulaire, setFormulaire] = useState(false)
  /** Évaluation blanche (décision de l'utilisateur, 22/11/2026, choix c) : parts tirées au hasard à
   * chaque préparation (graine), ou réglées par l'élève — jamais mémorisé. */
  const [modeParts, setModeParts] = useState<'hasard' | 'reglee'>('hasard')
  const [partsManuelles, setPartsManuelles] = useState<RepartitionPourcents | null>(null)
  const [graineParts, setGraineParts] = useState(() => tirerGraine())
  /** Démonstrations cochées (clés `cleDemonstration`) — évaluation blanche : annoncées par le
   * professeur ; feuille : à travailler. Aucune par défaut. */
  const [demosCochees, setDemosCochees] = useState<Set<string>>(() => new Set())
  /** FEUILLE d'exercices (décision de l'utilisateur, 22/11/2026) : ni durée ni points — un nombre
   * d'exercices global (10 par défaut), ou choisi exercice par exercice. Rien n'est mémorisé. */
  const [nombreExercices, setNombreExercices] = useState(NOMBRE_FEUILLE_DEFAUT)
  const [modeNombre, setModeNombre] = useState<'global' | 'carte'>('global')
  const [parType, setParType] = useState<Record<string, number>>({})

  const [candidatsTous, setCandidats] = useState<Candidat[] | null>(null)
  /** Générateurs annoncés par le professeur (`?exos=`) qui existent dans ce chapitre. */
  const exosAnnonces = useMemo(() => (candidatsTous ? annonceUrl.exos.filter((id) => candidatsTous.some((c) => c.sorte === 'exercice' && c.generatorId === id)) : []), [candidatsTous, annonceUrl])
  const filtreExos = seulementAnnonces && exosAnnonces.length > 0
  /** Candidats utilisés partout (disponibilité, liste, composition) : filtrés aux générateurs annoncés. */
  const candidats = useMemo(
    () => (candidatsTous && filtreExos ? candidatsTous.filter((c) => c.sorte !== 'exercice' || exosAnnonces.includes(c.generatorId)) : candidatsTous),
    [candidatsTous, filtreExos, exosAnnonces],
  )
  const [progression, setProgression] = useState<{ fait: number; total: number } | null>(null)
  /** Plan préparé, avec la clé des réglages pour lesquels il a été tiré : un plan d'anciens réglages
   * (changement pas encore recalculé) n'est jamais affiché ni généré. */
  const [prepareBrut, setPrepare] = useState<(PlanEleve & { cle: string; composition: Composition }) | null>(null)
  const [enPreparation, setEnPreparation] = useState(false)
  const [tirage, setTirage] = useState(0)
  const [genereEnCours, setGenereEnCours] = useState(false)
  const [resultat, setResultat] = useState<{ plan: PlanEleve; documents: DocumentGenere[]; type: TypeEleve; chapitre: ChapterContent } | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)
  const urls = useRef<string[]>([])
  const blocResultat = useRef<HTMLDivElement>(null)

  const sections = useMemo(() => (choisies ? [...choisies] : []), [choisies])
  const blancheChoisie = type === 'blanche'
  const avecFormulaire = (chapitre?.formulaire?.groups.length ?? 0) > 0
  /** Démonstrations du chapitre dans les notions retenues (tout le chapitre : toutes). */
  const demonstrations = useMemo(() => (chapitre ? demonstrationsDuChapitre(chapitre).filter((d) => !choisies || choisies.has(d.sectionId)) : []), [chapitre, choisies])
  const demosRetenues = useMemo(() => demonstrations.filter((d) => demosCochees.has(d.cle)).map((d) => d.cle), [demonstrations, demosCochees])
  const niveaux = useMemo(() => CATEGORIES_NIVEAU.filter((c) => niveauxCoches.has(c)), [niveauxCoches])
  const competences = useMemo(() => ([1, 2, 3] as Processus[]).filter((p) => competencesCochees.has(p)), [competencesCochees])
  // Disponibilité EN DIRECT, sur les candidats déjà préparés (niveaux des tirages d'estimation).
  const dispo = useMemo(
    () => (candidats ? disponibilite(candidats, { sections, competences, niveaux, demonstrations: demosRetenues, calculatrice }) : null),
    [candidats, sections, competences, niveaux, demosRetenues, calculatrice],
  )
  /** Niveaux cochés ET proposés : au moins un, sinon rien n'est composé. */
  const niveauxUtiles = dispo ? niveaux.filter((c) => dispo.niveaux[c]) : niveaux
  const competencesUtiles = dispo ? competences.filter((p) => dispo.parCompetence[p].total > 0) : competences
  // Seulement des questions sans niveau (démonstrations cochées, formules, compréhension) : les niveaux
  // ne comptent pas.
  const seulementSansNiveau =
    !!dispo && competencesUtiles.length > 0 && competencesUtiles.every((p) => dispo.parCompetence[p].sansNiveauSeules) && competencesUtiles.some((p) => dispo.parCompetence[p].auxNiveauxCoches)
  // Feuille : types d'exercices proposés pour ces choix (liste « exercice par exercice »), et nombre.
  const typesDispo = useMemo(
    () => (!blancheChoisie && candidats && chapitre ? typesFeuille(candidats, { sections, competences, niveaux, demonstrations: demosRetenues, calculatrice }, chapitre) : []),
    [blancheChoisie, candidats, chapitre, sections, competences, niveaux, demosRetenues, calculatrice],
  )
  /** Liste « exercice par exercice » affichée : les types écartés par le choix de la calculatrice y
   * restent, grisés (« demande une calculatrice » / « se fait sans calculatrice »), sans compteur réglable. */
  const typesAffiches = useMemo(
    () => (!blancheChoisie && candidats && chapitre ? typesFeuille(candidats, { sections, competences, niveaux, demonstrations: demosRetenues }, chapitre) : []),
    [blancheChoisie, candidats, chapitre, sections, competences, niveaux, demosRetenues],
  )
  /** Compteurs des seuls types encore proposés (un type qui disparaît avec les choix ne compte plus) ;
   * deux démonstrations d'un même résultat (même énoncé imprimé) : la première réglée seulement. */
  const parTypeRetenu = useMemo(() => {
    const r: Record<string, number> = {}
    const enonces = new Set<string>()
    for (const c of typesDispo) {
      if (!parType[c.cle]) continue
      const e = enonceDemonstration(c)
      if (e !== null) {
        if (enonces.has(e)) continue
        enonces.add(e)
      }
      r[c.cle] = Math.min(capaciteType(c), parType[c.cle])
    }
    return r
  }, [typesDispo, parType])
  /** Compteur au plus d'un type : sa capacité ; 0 pour une démonstration dont le même énoncé est déjà
   * réglé par une autre. */
  const maxType = (c: Candidat) => {
    const e = enonceDemonstration(c)
    if (e !== null && typesDispo.some((x) => x.cle !== c.cle && enonceDemonstration(x) === e && (parTypeRetenu[x.cle] ?? 0) > 0)) return 0
    return capaciteType(c)
  }
  const totalCarte = Object.values(parTypeRetenu).reduce((t, n) => t + n, 0)
  const exercices: ExercicesFeuille | undefined = blancheChoisie ? undefined : modeNombre === 'global' ? { mode: 'global', nombre: nombreExercices } : { mode: 'carte', parType: parTypeRetenu }
  const carteVide = exercices?.mode === 'carte' && totalCarte === 0
  const reglagesValides = (niveauxUtiles.length > 0 || seulementSansNiveau) && competencesUtiles.length > 0 && !carteVide
  const cleCompetencesUtiles = competencesUtiles.join(',')
  // Cocher / décocher une compétence remet les parts réglées à égalité (comme le réglage du professeur).
  useEffect(() => setPartsManuelles(null), [cleCompetencesUtiles])
  const parts: PartsEleve | undefined = blancheChoisie
    ? modeParts === 'hasard'
      ? { mode: 'hasard', graine: graineParts }
      : { mode: 'reglee', pourcents: partsManuelles, graine: graineParts }
    : undefined
  const cleReglages = JSON.stringify([levelSlug, chapitreSlug, sections, duree, niveaux, competences, type, amenagee, tirage, parts ?? null, demosRetenues, exercices ?? null, calculatrice, filtreExos])
  const prepare = prepareBrut && prepareBrut.cle === cleReglages ? prepareBrut : null

  // Candidats du chapitre (niveaux et durées estimés), calculés une variante à la fois.
  useEffect(() => {
    if (!chapitre) return
    let annule = false
    setCandidats(null)
    setPrepare(null)
    setProgression(null)
    preparerCandidats(chapitre, type, calculatrice, (fait, total) => {
      if (!annule) setProgression({ fait, total })
    })
      .then((c) => {
        if (!annule) setCandidats(c)
      })
      .catch(() => {
        if (!annule) setErreur('Impossible de préparer les exercices de ce chapitre.')
      })
    return () => {
      annule = true
    }
  }, [chapitre, type, calculatrice])

  // Chapitre sans aucun cas « calculatrice » : la case est désactivée (calcul en arrière-plan, en cache).
  useEffect(() => {
    if (!chapitre) return
    let annule = false
    setCasCalculatrice(null)
    chapitreAvecCalculatrice(chapitre, type)
      .then((oui) => {
        if (!annule) setCasCalculatrice(oui)
      })
      .catch(() => undefined)
    return () => {
      annule = true
    }
  }, [chapitre, type])

  // Plan préparé à l'avance (récapitulatif exact) ; un nouveau à chaque changement et après chaque
  // génération (`tirage`).
  useEffect(() => {
    if (!chapitre || !candidats) return
    if (!reglagesValides) {
      setPrepare(null)
      setEnPreparation(false)
      return
    }
    let annule = false
    setEnPreparation(true)
    const reglages: ReglagesEleve = {
      levelSlug,
      chapitreSlug: chapitre.slug,
      sections,
      duree,
      niveaux,
      competences,
      type,
      amenagee,
      demonstrations: demosRetenues,
      ...(parts ? { parts } : {}),
      ...(exercices ? { exercices } : {}),
      calculatrice,
    }
    // Même clé que `cleReglages` (filtre des exercices annoncés compris) : sinon le plan préparé n'est jamais reconnu.
    const cle = JSON.stringify([levelSlug, chapitre.slug, sections, duree, niveaux, competences, type, amenagee, tirage, parts ?? null, demosRetenues, exercices ?? null, calculatrice, filtreExos])
    const minuterie = window.setTimeout(() => {
      const composition = composer(candidats, reglages)
      construirePlanEleve(reglages, chapitre, composition)
        .then((p) => {
          if (!annule) {
            setPrepare({ ...p, cle, composition })
            setErreur(null)
          }
        })
        .catch((e) => {
          // Composition vide : rien ne convient (dit à l'élève, pas une erreur de la page).
          if (!(e instanceof Error && /vide/i.test(e.message))) console.error(e)
          if (!annule) {
            setPrepare(null)
            setErreur(
              sections.length > 0
                ? 'Aucun exercice ne convient à ces réglages : ajoute une notion, un niveau ou une compétence.'
                : 'Aucun exercice ne convient à ces réglages : ajoute un niveau ou une compétence.',
            )
          }
        })
        .finally(() => {
          if (!annule) setEnPreparation(false)
        })
    }, 150)
    return () => {
      annule = true
      window.clearTimeout(minuterie)
    }
    // `parts` est recréé à chaque rendu : sa forme sérialisée (`cleParts`) suffit comme dépendance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapitre, candidats, levelSlug, sections, duree, niveaux, competences, type, amenagee, tirage, reglagesValides, JSON.stringify(parts ?? null), demosRetenues, JSON.stringify(exercices ?? null), calculatrice, filtreExos])

  useEffect(() => () => urls.current.forEach((u) => URL.revokeObjectURL(u)), [])

  function changerNiveauScolaire(slug: string) {
    setLevelSlug(slug)
    setChapitreSlug(chapitresDisponibles(slug)[0]?.slug ?? '')
    setChoisies(null)
    setResultat(null)
    revenirAuNombreGlobal()
  }

  function changerChapitre(slug: string) {
    setChapitreSlug(slug)
    setChoisies(null)
    setResultat(null)
    revenirAuNombreGlobal()
  }

  /** « Choisir exercice par exercice » : la liste part de la feuille préparée (même répartition). */
  function choisirParType() {
    const depart: Record<string, number> = {}
    if (prepare && modeNombre === 'global') for (const u of prepare.composition.unites) depart[u.candidat.cle] = u.nombre
    setParType(depart)
    setModeNombre('carte')
  }

  function revenirAuNombreGlobal() {
    setModeNombre('global')
    setParType({})
  }

  function basculerNotion(id: string) {
    setChoisies((actuelles) => {
      // « Tout le chapitre » coché : un clic sur une notion ne garde que celle-ci.
      if (!actuelles) return new Set([id])
      const suivantes = new Set(actuelles)
      if (suivantes.has(id)) suivantes.delete(id)
      else suivantes.add(id)
      return suivantes.size === 0 || suivantes.size === notions.length ? null : suivantes
    })
  }

  function basculerNiveau(c: CategorieNiveau) {
    if (dispo && !dispo.niveaux[c]) return
    const suivants = new Set(niveauxCoches)
    if (suivants.has(c)) suivants.delete(c)
    else suivants.add(c)
    // Au moins un niveau coché ET proposé.
    if (!CATEGORIES_NIVEAU.some((k) => suivants.has(k) && (!dispo || dispo.niveaux[k]))) {
      setRappelMinimum('niveau')
      return
    }
    setRappelMinimum(null)
    setNiveauxCoches(suivants)
  }

  function basculerCompetence(p: Processus) {
    if (dispo && dispo.parCompetence[p].total === 0) return
    const suivantes = new Set(competencesCochees)
    if (suivantes.has(p)) suivantes.delete(p)
    else suivantes.add(p)
    if (![...suivantes].some((q) => !dispo || dispo.parCompetence[q].total > 0)) {
      setRappelMinimum('competence')
      return
    }
    setRappelMinimum(null)
    setCompetencesCochees(suivantes)
  }

  function basculerDemonstration(cle: string) {
    setDemosCochees((actuelles) => {
      const suivantes = new Set(actuelles)
      if (suivantes.has(cle)) suivantes.delete(cle)
      else suivantes.add(cle)
      return suivantes
    })
  }

  function autreTirage() {
    setGraineParts(tirerGraine())
    setTirage((t) => t + 1)
  }

  async function generer() {
    if (!prepare || !chapitre) return
    setGenereEnCours(true)
    setErreur(null)
    try {
      const joindreFormulaire = type === 'feuille' && formulaire && avecFormulaire
      const documents = await genererDocumentsDepuisPlan(joindreFormulaire ? { ...prepare.plan, entete: { ...prepare.plan.entete, joindreFormulaire: true } } : prepare.plan)
      urls.current.forEach((u) => URL.revokeObjectURL(u))
      urls.current = []
      setResultat({ plan: prepare, documents, type, chapitre })
      setTirage((t) => t + 1)
      // Nouvelles parts au hasard à chaque génération.
      setGraineParts(tirerGraine())
      window.setTimeout(() => blocResultat.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
    } catch (e) {
      console.error(e)
      setErreur('Erreur pendant la génération — réessaie.')
    } finally {
      setGenereEnCours(false)
    }
  }

  function ouvrir(doc: DocumentGenere, imprimer: boolean) {
    const url = URL.createObjectURL(doc.blob)
    urls.current.push(url)
    window.open(url + (imprimer ? '#imprimer' : ''), '_blank')
  }

  const blanche = type === 'blanche'
  const retour = encodeURIComponent(location.pathname + location.search)
  const lienProfesseur = compte.etat !== 'indisponible'
  const notionsVisibles = etroit && !notionsDepliees && notions.length > 4 ? notions.slice(0, 3) : notions
  const toutLeChapitre = choisies === null

  const resume = prepare?.resume
  const recap = resume
    ? blanche
      ? `${resume.questions} question${resume.questions > 1 ? 's' : ''} · ≈ ${resume.dureeConseillee} min · ${resume.points ?? 20} points`
      : // Feuille : le nombre d'exercices seulement (ni durée ni points).
        `${resume.exercices} exercice${resume.exercices > 1 ? 's' : ''}${resume.demandes !== undefined && resume.exercices < resume.demandes ? ` sur ${resume.demandes} demandés` : ''}`
    : progression && !candidats
      ? `Préparation des exercices… ${Math.round((100 * progression.fait) / Math.max(1, progression.total))} %`
      : candidats && carteVide
        ? 'Choisis au moins un exercice dans la liste'
        : candidats && !reglagesValides
          ? 'Rien à composer avec ces réglages'
          : 'Préparation…'
  /** Niveaux et compétences réellement obtenus (récapitulatif exact). */
  const recapContenu = resume
    ? `${resume.categories.length === 0 ? 'Questions sans niveau' : `${resume.categories.length === 1 ? 'Niveau' : 'Niveaux'} : ${texteCategories(resume.categories)}`} · ${listeCompetences(resume.competences)}${blanche && resume.competences.length > 1 && !resume.parts ? ', temps partagé à parts égales' : ''} · ${avecCalculatrice ? 'avec' : 'sans'} calculatrice`
    : null
  /** Feuille au nombre global : moins de types que demandé (dit simplement). */
  const manqueExercices = !blanche && modeNombre === 'global' && resume?.disponibles !== undefined && resume.disponibles < nombreExercices ? resume.disponibles : null
  /** Feuille : des exercices de même consigne sont regroupés sous un même numéro. */
  const regroupes = !blanche && !!resume && resume.questions < resume.exercices
  /** Liste « exercice par exercice », groupée par point du chapitre (toutes les sections : une formule
   * ou une démonstration peut appartenir à une section sans générateur, « Tout le chapitre »). */
  const groupesTypes = (chapitre?.sections ?? [])
    .map((s) => ({ notion: { sectionId: s.id, titre: s.title }, types: typesAffiches.filter((c) => c.sectionId === s.id) }))
    .filter((g) => g.types.length > 0)
  /** Évaluation blanche : parts obtenues (celles des points), et leur origine (même texte que le
   * document, `texteRepartitionBlanche` ; téléphone : l'avertissement final est masqué dans la barre
   * collante, il est écrit juste au-dessus, sous « Parts du temps et des points »). */
  const plusieursParts = !!resume?.parts && Object.values(resume.parts).filter((v) => v > 0).length > 1
  const recapParts = resume?.parts
    ? plusieursParts
      ? `${texteParts(resume.parts)} — ${resume.partsHasard ? 'tirées au hasard' : 'réglées par toi'}`
      : texteRepartitionBlanche(resume.parts, !!resume.partsHasard)
    : null
  const tousNiveauxCoches = niveaux.length === CATEGORIES_NIVEAU.length
  const niveauxGrises = dispo ? CATEGORIES_NIVEAU.filter((c) => !dispo.niveaux[c]) : []
  /** Pourquoi des niveaux sont grisés : ce que chaque compétence cochée offre vraiment. */
  const raisonsNiveaux =
    dispo && niveauxGrises.length > 0
      ? competences
          .filter((p) => dispo.parCompetence[p].total > 0)
          .map((p) => {
            const d = dispo.parCompetence[p]
            const calc = d.categoriesEcarteesCalculatrice.length > 0 ? ` (${texteOffre({ ...d, categories: [] }, calculatrice)})` : ''
            if (d.categories.length === 0) return `${LIBELLE_COMPETENCE[p]} : seulement des questions sans niveau${calc}`
            return `${LIBELLE_COMPETENCE[p]} : ${texteOffre(d, calculatrice)}${d.questionsSansNiveau ? ', plus des questions sans niveau (toujours proposées)' : ''}`
          })
      : []
  /** Compétences cochées sans exercice aux niveaux cochés : signalées, leur temps va aux autres. */
  const competencesSansNiveau = dispo ? competences.filter((p) => dispo.parCompetence[p].total > 0 && !dispo.parCompetence[p].auxNiveauxCoches) : []
  const connaitreCochee = competencesCochees.has(1) && !!dispo && dispo.parCompetence[1].total > 0
  const montrerDemos = connaitreCochee && demonstrations.length > 0
  const montrerParts = blanche && competencesUtiles.length > 1

  return (
    <div className="eleve">
      <div className="eleve-tete">
        <div>
          <p className="eyebrow eleve-surtitre">{chapitre ? `${chapitre.level} · ${chapitre.title}` : 'Entraînement'}</p>
          <h1 className="eleve-titre">Me préparer à l'évaluation</h1>
        </div>
        {lienProfesseur && (
          <Link className="eleve-lien-prof" to={`/connexion?retour=${retour}`}>
            Je suis professeur : me connecter
          </Link>
        )}
      </div>

      <section className="eleve-bloc" aria-labelledby="eleve-q1">
        <div className="eleve-bloc-tete">
          <span className="eleve-num" aria-hidden="true">
            1
          </span>
          <h2 id="eleve-q1">Que veux-tu faire ?</h2>
        </div>
        <div className="eleve-cartes" role="radiogroup" aria-labelledby="eleve-q1">
          <button type="button" role="radio" aria-checked={type === 'feuille'} className="eleve-carte" onClick={() => setType('feuille')}>
            <span className="eleve-carte-titre">Une feuille d'exercices</span>
            <span className="eleve-carte-texte">
              Tu choisis les points du chapitre, les compétences et le nombre d'exercices. Ni durée ni points : corrigé à la fin, QR code pour refaire en ligne avec les aides.
            </span>
          </button>
          <button type="button" role="radio" aria-checked={type === 'blanche'} className="eleve-carte" onClick={() => setType('blanche')}>
            <span className="eleve-carte-titre">Une évaluation blanche</span>
            <span className="eleve-carte-texte">Comme une vraie interro : en temps limité, avec des points. Tu te corriges ensuite avec le corrigé détaillé.</span>
          </button>
        </div>
      </section>

      <section className="eleve-bloc" aria-labelledby="eleve-q2">
        <div className="eleve-bloc-tete eleve-bloc-tete-large">
          <div className="eleve-bloc-tete">
            <span className="eleve-num" aria-hidden="true">
              2
            </span>
            <h2 id="eleve-q2">{blanche ? 'Sur quoi porte ton évaluation ?' : 'Sur quoi veux-tu t’entraîner ?'}</h2>
          </div>
          {verrouille && (
            <Link className="eleve-lien-discret" to="/exercice">
              Changer de chapitre
            </Link>
          )}
        </div>
        {!verrouille && (
          <div className="eleve-choix-chapitre">
            <label className="eleve-champ">
              <span>Année</span>
              <select value={levelSlug} onChange={(e) => changerNiveauScolaire(e.target.value)}>
                {LEVELS.filter((l) => chapitresDisponibles(l.slug).length > 0).map((l) => (
                  <option key={l.slug} value={l.slug}>
                    {l.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="eleve-champ eleve-champ-large">
              <span>Chapitre</span>
              <select value={chapitreSlug} onChange={(e) => changerChapitre(e.target.value)}>
                {chapitresDisponibles(levelSlug).map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {/* Côté élève : jamais le numéro du site (son professeur peut suivre un autre ordre). */}
                    {c.title}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
        <p className="eleve-aide">{blanche ? 'Coche ce que ton professeur a annoncé. Pas sûr ? Prends tout le chapitre.' : 'Choisis les points du chapitre qui t’intéressent, ou tout le chapitre.'}</p>
        <div className="eleve-puces" role="group" aria-label="Notions">
          <button type="button" className="eleve-puce" aria-pressed={toutLeChapitre} onClick={() => setChoisies(null)}>
            Tout le chapitre
          </button>
          {notionsVisibles.map((n) => {
            const on = !toutLeChapitre && choisies!.has(n.sectionId)
            return (
              <button key={n.sectionId} type="button" className="eleve-puce" aria-pressed={on} onClick={() => basculerNotion(n.sectionId)}>
                {on && <span aria-hidden="true">✓ </span>}
                {n.titre}
              </button>
            )
          })}
          {notionsVisibles.length < notions.length && (
            <button type="button" className="eleve-puce eleve-puce-plus" onClick={() => setNotionsDepliees(true)} aria-label={`Afficher les ${notions.length - notionsVisibles.length} autres notions`}>
              + {notions.length - notionsVisibles.length}
            </button>
          )}
        </div>
        {exosAnnonces.length > 0 && (
          <div className="eleve-reglage eleve-annonce-exos">
            <div className="eleve-coches">
              <button type="button" className="eleve-coche" aria-pressed={seulementAnnonces} aria-describedby="eleve-annonce-exos-aide" onClick={() => setSeulementAnnonces((v) => !v)}>
                <span className="eleve-coche-case" aria-hidden="true">
                  {seulementAnnonces ? '✓' : ''}
                </span>
                <span>Seulement les exercices annoncés par ton professeur</span>
              </button>
            </div>
            <p className="eleve-aide" id="eleve-annonce-exos-aide">
              {seulementAnnonces
                ? `Ton professeur a choisi ${exosAnnonces.length} sorte${exosAnnonces.length > 1 ? 's' : ''} d’exercices : seuls ceux-là sont tirés (les questions de cours restent proposées). Décoche pour tous les exercices de ces notions.`
                : 'Décochée : tous les exercices de ces notions peuvent être tirés.'}
            </p>
          </div>
        )}
        <div className="eleve-reglage">
          <span className="eleve-etiquette" id="eleve-competences">
            Compétences
          </span>
          <p className="eleve-aide">
            {blanche
              ? "Coche ce que ton professeur a annoncé pour l'interrogation."
              : 'Coche celles que tu veux travailler (une, deux ou trois) : les exercices sont répartis à parts égales entre elles.'}
          </p>
          <div className="eleve-coches" role="group" aria-labelledby="eleve-competences">
            {COMPETENCES_ELEVE.map(({ id, libelle }) => {
              const vide = !!dispo && dispo.parCompetence[id].total === 0
              // Ses seuls exercices sont écartés par le choix de la calculatrice.
              const calcSeule = vide && dispo!.parCompetence[id].totalEcartesCalculatrice > 0
              const on = competencesCochees.has(id) && !vide
              return (
                <button
                  key={id}
                  type="button"
                  className="eleve-coche"
                  aria-pressed={on}
                  aria-disabled={vide || undefined}
                  title={calcSeule ? `« ${libelle} » : ${texteAutreChoix(calculatrice)} dans ces notions` : vide ? `Aucun exercice « ${libelle} » dans ces notions` : undefined}
                  onClick={() => basculerCompetence(id)}
                >
                  <span className="eleve-coche-case" aria-hidden="true">
                    {on ? '✓' : ''}
                  </span>
                  <span>{libelle}</span>
                  {vide && <span className="eleve-coche-raison">{calcSeule ? texteAutreChoix(calculatrice) : 'aucun exercice ici'}</span>}
                </button>
              )
            })}
          </div>
          {rappelMinimum === 'competence' && (
            <p className="eleve-note" role="status">
              Garde au moins une compétence.
            </p>
          )}
        </div>
        {montrerDemos && (
          <fieldset className="eleve-reglage eleve-demos">
            <legend className="eleve-etiquette">{blanche ? 'Démonstrations annoncées' : 'Démonstrations à travailler'}</legend>
            <p className="eleve-aide">
              {blanche
                ? "Coche celles que ton professeur a demandé de retenir pour l'interro. Aucune cochée : pas de démonstration dans ton évaluation blanche."
                : 'Coche celles que tu veux travailler. Aucune cochée : pas de démonstration dans ta feuille.'}
            </p>
            <div className="eleve-demos-liste">
              {demonstrations.map((d) => (
                <label key={d.cle} className="eleve-case eleve-demo">
                  <input type="checkbox" checked={demosCochees.has(d.cle)} onChange={() => basculerDemonstration(d.cle)} />
                  <span>
                    <RichText text={d.titre} />
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        )}
        {montrerParts && (
          <div className="eleve-reglage eleve-parts">
            <span className="eleve-etiquette" id="eleve-parts">
              Parts du temps et des points
            </span>
            <div className="eleve-segments" role="radiogroup" aria-labelledby="eleve-parts">
              <button type="button" role="radio" aria-checked={modeParts === 'hasard'} onClick={() => setModeParts('hasard')}>
                Au hasard
              </button>
              <button type="button" role="radio" aria-checked={modeParts === 'reglee'} onClick={() => setModeParts('reglee')}>
                Je règle les parts
              </button>
            </div>
            {modeParts === 'hasard' ? (
              <p className="eleve-aide">
                Chaque tirage partage le temps et les points autrement entre les compétences cochées (de {PART_MIN_HASARD}&nbsp;% à {PART_MAX_HASARD}&nbsp;% chacune) : ta vraie interro peut être
                répartie autrement.
              </p>
            ) : (
              <ReglageCompetences
                reglage={{ cochees: competencesUtiles, parts: partsManuelles }}
                onChange={(r) => setPartsManuelles(r.parts)}
                feuille={false}
                dureeCible={duree}
                presentes={dispo ? competencesUtiles.filter((p) => dispo.parCompetence[p].auxNiveauxCoches) : competencesUtiles}
                onFermer={() => setModeParts('hasard')}
                eleve={{
                  titre: 'Parts de ton évaluation blanche',
                  aide: 'Règle avec − / + la part de chaque compétence cochée (5 % au moins). Le temps et les points suivent ces parts.',
                  etat: 'Réglage non mémorisé : il disparaît si tu recharges la page.',
                  fermer: 'Revenir au hasard',
                }}
              />
            )}
          </div>
        )}
      </section>

      <section className="eleve-bloc" aria-labelledby="eleve-q3">
        <div className="eleve-bloc-tete">
          <span className="eleve-num" aria-hidden="true">
            3
          </span>
          <h2 id="eleve-q3">{blanche ? 'Combien de temps, et quels niveaux ?' : 'Quels niveaux, et combien d’exercices ?'}</h2>
        </div>
        {blanche && (
          <div className="eleve-reglages">
            <div className="eleve-reglage">
              <span className="eleve-etiquette" id="eleve-duree">
                Durée
              </span>
              <div className="eleve-segments" role="radiogroup" aria-labelledby="eleve-duree">
                {DUREES_ELEVE.map((d) => (
                  <button key={d} type="button" role="radio" aria-checked={duree === d} onClick={() => setDuree(d)}>
                    {d} min
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        <div className="eleve-reglage">
          <span className="eleve-etiquette" id="eleve-calculatrice">
            Calculatrice
          </span>
          <div className="eleve-coches" role="group" aria-labelledby="eleve-calculatrice" aria-describedby="eleve-calculatrice-aide">
            <button
              type="button"
              className="eleve-coche eleve-coche-calculatrice"
              aria-pressed={avecCalculatrice}
              aria-disabled={calculatriceImpossible || undefined}
              onClick={() => {
                if (!calculatriceImpossible) setAvecCalculatrice((v) => !v)
              }}
            >
              <span className="eleve-coche-case" aria-hidden="true">
                {avecCalculatrice ? '✓' : ''}
              </span>
              <span>Avec calculatrice</span>
            </button>
          </div>
          <p className="eleve-aide" id="eleve-calculatrice-aide">
            {calculatriceImpossible
              ? 'Aucun exercice de ce chapitre ne demande la calculatrice : tout se fait sans.'
              : avecCalculatrice
                ? `Cochée : seulement les exercices où la calculatrice sert. Ceux de valeurs exactes (comme cos 210°) sont réservés à « sans calculatrice ».`
                : `Décochée : seulement des exercices faisables sans calculatrice${blanche ? ', comme une interro « calculatrice interdite »' : ''}. Coche-la si ${blanche ? 'ton professeur autorise' : 'tu veux t’entraîner avec'} la calculatrice.`}
          </p>
        </div>
        <div className="eleve-reglage">
          <div className="eleve-etiquette-ligne">
            <span className="eleve-etiquette" id="eleve-niveau">
              Niveaux
            </span>
            {!tousNiveauxCoches && (
              <button type="button" className="eleve-lien-bouton" onClick={() => setNiveauxCoches(new Set(CATEGORIES_NIVEAU))}>
                Tout cocher
              </button>
            )}
          </div>
          <p className="eleve-aide" id="eleve-niveau-aide">
            Tous cochés : les niveaux sont mélangés.
          </p>
          <div className="eleve-coches" role="group" aria-labelledby="eleve-niveau" aria-describedby="eleve-niveau-aide">
            {CATEGORIES_NIVEAU.map((c) => {
              const grise = !!dispo && !dispo.niveaux[c]
              const on = niveauxCoches.has(c) && !grise
              return (
                <button
                  key={c}
                  type="button"
                  className="eleve-coche eleve-coche-niveau"
                  aria-pressed={on}
                  aria-disabled={grise || undefined}
                  aria-describedby={grise ? 'eleve-niveau-raisons' : undefined}
                  title={
                    grise
                      ? dispo!.niveauxEcartesCalculatrice[c]
                        ? `${LIBELLE_CATEGORIE[c]} : ${texteAutreChoix(calculatrice)} pour ${listeCompetences(competences)} dans ces notions`
                        : `Aucun exercice ${LIBELLE_CATEGORIE[c]} pour ${listeCompetences(competences)} dans ces notions`
                      : undefined
                  }
                  onClick={() => basculerNiveau(c)}
                >
                  <span className="eleve-coche-case" aria-hidden="true">
                    {on ? '✓' : ''}
                  </span>
                  <span className={`eleve-niv-num niv-c${rangCategorie(c)}`}>{numerosCategorie(c)}</span>
                  <span>{LIBELLE_CATEGORIE[c]}</span>
                </button>
              )
            })}
          </div>
          {rappelMinimum === 'niveau' && (
            <p className="eleve-note" role="status">
              Garde au moins un niveau.
            </p>
          )}
          {(raisonsNiveaux.length > 0 || competencesSansNiveau.length > 0) && (
            <div className="eleve-dispo" id="eleve-niveau-raisons">
              {raisonsNiveaux.length > 0 && (
                <p>
                  Grisé : aucun exercice {niveauxGrises.some((c) => dispo!.niveauxEcartesCalculatrice[c]) ? (calculatrice === 'interdite' ? 'sans calculatrice ' : 'avec calculatrice ') : ''}à ce niveau dans ces notions. {raisonsNiveaux.join(' · ')}.
                </p>
              )}
              {competencesSansNiveau.map((p) =>
                dispo!.parCompetence[p].demonstrationsSeules ? (
                  <p key={p}>
                    {LIBELLE_COMPETENCE[p]} : seulement des démonstrations ici — coche celles {blanche ? 'qui sont annoncées' : 'que tu veux travailler'}, sinon {blanche ? 'son temps va' : 'ses exercices vont'} aux
                    autres compétences cochées.
                  </p>
                ) : (
                  <p key={p}>
                    {LIBELLE_COMPETENCE[p]} : aucun exercice aux niveaux cochés ({texteOffre(dispo!.parCompetence[p], calculatrice)}) — {blanche ? 'son temps va' : 'ses exercices vont'} aux autres
                    compétences cochées.
                  </p>
                ),
              )}
            </div>
          )}
        </div>
        {!blanche && (
          <div className="eleve-reglage eleve-nombre">
            {modeNombre === 'global' ? (
              <>
                <span className="eleve-etiquette" id="eleve-nombre">
                  Combien d'exercices ?
                </span>
                <div className="eleve-nombre-ligne" role="group" aria-labelledby="eleve-nombre">
                  <Compteur valeur={nombreExercices} min={NOMBRE_FEUILLE_MIN} max={NOMBRE_FEUILLE_MAX} nom="nombre d'exercices" onChange={setNombreExercices} />
                  <button type="button" className="eleve-bouton-secondaire" onClick={choisirParType} disabled={!candidats}>
                    Choisir exercice par exercice
                  </button>
                </div>
                {manqueExercices !== null && (
                  <p className="eleve-note" role="status">
                    Seulement {manqueExercices} exercice{manqueExercices > 1 ? 's' : ''} disponible{manqueExercices > 1 ? 's' : ''} avec ces choix.
                  </p>
                )}
                <p className="eleve-aide">Les exercices sont répartis le plus également possible entre les points du chapitre et les compétences cochés.</p>
              </>
            ) : (
              <>
                <span className="eleve-etiquette" id="eleve-nombre">
                  Exercice par exercice
                </span>
                <p className="eleve-aide">Règle le nombre de chaque type d'exercice (de 0 à 5 ; une démonstration : 0 ou 1). Rien n'est mémorisé.</p>
                {groupesTypes.length === 0 ? (
                  <p className="eleve-note">Aucun exercice avec ces choix : ajoute une notion, un niveau ou une compétence.</p>
                ) : (
                  <div className="eleve-types">
                    {groupesTypes.map(({ notion, types }) => {
                      const choisis = types.reduce((t, c) => t + (parTypeRetenu[c.cle] ?? 0), 0)
                      return (
                        <div key={notion.sectionId} className="eleve-types-notion" role="group" aria-labelledby={`eleve-types-${notion.sectionId}`}>
                          <p className="eleve-types-titre" id={`eleve-types-${notion.sectionId}`}>
                            {notion.titre}
                            {choisis > 0 && <span className="eleve-types-choisis"> · {choisis} choisi{choisis > 1 ? 's' : ''}</span>}
                          </p>
                          <ul>
                            {types.map((c) => {
                              const niv = niveauxDuType(c, niveaux)
                              // Écarté par le choix de la calculatrice : type grisé, compteur bloqué à 0.
                              const demandeCalc = !permisParCalculatrice(c, calculatrice)
                              return (
                                <li key={c.cle} className={`eleve-type${demandeCalc ? ' eleve-type-grise' : ''}`} aria-disabled={demandeCalc || undefined}>
                                  <span className="eleve-type-nom">
                                    <span>
                                      {c.titre ? <RichText text={c.titre} /> : !c.variante && 'Exercice'}
                                      {c.variante && (
                                        <>
                                          {c.titre ? ' — ' : ''}
                                          <RichText text={c.variante} />
                                        </>
                                      )}
                                    </span>
                                    <span className="eleve-type-meta">
                                      {LIBELLE_COMPETENCE[c.processus]}
                                      {niv ? ` · niv. ${niv}` : ''}
                                      {demandeCalc && <span className="eleve-type-calc"> · {calculatrice === 'interdite' ? 'demande une calculatrice' : 'se fait sans calculatrice'}</span>}
                                    </span>
                                  </span>
                                  <Compteur
                                    valeur={demandeCalc ? 0 : (parTypeRetenu[c.cle] ?? 0)}
                                    min={0}
                                    max={demandeCalc ? 0 : maxType(c)}
                                    nom={nomType(c)}
                                    onChange={(v) => setParType((avant) => ({ ...avant, [c.cle]: v }))}
                                  />
                                </li>
                              )
                            })}
                          </ul>
                        </div>
                      )
                    })}
                  </div>
                )}
                <div className="eleve-types-pied">
                  <span className="eleve-types-total" aria-live="polite">
                    Total : {totalCarte} exercice{totalCarte > 1 ? 's' : ''}
                  </span>
                  <button type="button" className="eleve-bouton-secondaire" onClick={revenirAuNombreGlobal}>
                    Revenir au nombre global
                  </button>
                </div>
              </>
            )}
            {regroupes && <p className="eleve-aide">Sur la feuille, les exercices qui ont la même consigne sont regroupés sous un même numéro (a, b, c…).</p>}
          </div>
        )}
        {!blanche && avecFormulaire && (
          <label className="eleve-case">
            <input type="checkbox" checked={formulaire} onChange={(e) => setFormulaire(e.target.checked)} /> Joindre le formulaire du chapitre (juste après les exercices)
          </label>
        )}
        <label className="eleve-case">
          <input type="checkbox" checked={amenagee} onChange={(e) => setAmenagee(e.target.checked)} /> Version aménagée (plus grande, plus aérée)
        </label>
        {resume?.elargi && (
          <p className="eleve-note">
            {blanche
              ? `Peu d'exercices aux niveaux cochés dans ces notions : des exercices de niveau ${texteCategories(resume.categoriesHorsChoix)} complètent.`
              : `Un exercice tiré est de niveau ${texteCategories(resume.categoriesHorsChoix)} : son type n'a pas donné d'autre tirage aux niveaux cochés.`}
          </p>
        )}
      </section>

      <section className="eleve-recap" aria-label="Récapitulatif" aria-live="polite">
        <div>
          <p className="eleve-recap-titre">{blanche ? 'Ton évaluation blanche' : "Ta feuille d'exercices"}</p>
          <p className="eleve-recap-detail">
            {recap}
            {resume && <span className="eleve-recap-fin"> · corrigé détaillé à la fin</span>}
          </p>
          {recapContenu && <p className="eleve-recap-contenu">{recapContenu}</p>}
          {recapParts && (
            <p className="eleve-recap-contenu eleve-recap-parts">
              {recapParts}
              {plusieursParts && <span className="eleve-recap-avertissement"> : ta vraie interro peut être répartie autrement</span>}
              {resume?.partsHasard && plusieursParts && (
                <>
                  {' '}
                  <button type="button" className="eleve-recap-tirage" onClick={autreTirage} disabled={enPreparation}>
                    Autre tirage
                  </button>
                </>
              )}
            </p>
          )}
        </div>
        <button type="button" className="eleve-generer" onClick={() => void generer()} disabled={!prepare || genereEnCours || enPreparation}>
          {genereEnCours ? 'Génération…' : blanche ? 'Générer mon évaluation blanche' : 'Générer ma feuille d’exercices'}
        </button>
      </section>
      {erreur && (
        <p className="eleve-erreur" role="alert">
          {erreur}
        </p>
      )}

      {resultat && (
        <section className="eleve-resultat" ref={blocResultat} aria-labelledby="eleve-resultat-titre">
          <h2 id="eleve-resultat-titre">{resultat.type === 'blanche' ? 'Ton évaluation blanche est prête' : 'Ta feuille d’exercices est prête'}</h2>
          <p className="eleve-aide">
            {resultat.type === 'blanche'
              ? `${resultat.plan.resume.questions} questions · ≈ ${resultat.plan.resume.dureeConseillee} min · ${resultat.plan.resume.points ?? 20} points indicatifs. Imprime-la, ou ouvre-la et enregistre-la en PDF.`
              : `${resultat.plan.resume.exercices} exercice${resultat.plan.resume.exercices > 1 ? 's' : ''}. Imprime-la, ou ouvre-la et enregistre-la en PDF.`}
          </p>
          <ul className="eleve-documents">
            {resultat.documents.map((doc) => (
              <li key={doc.suffixe}>
                <span className="eleve-document-nom">
                  {doc.type === 'amenagee' ? 'Version aménagée' : resultat.type === 'blanche' ? 'Évaluation blanche + corrigé détaillé' : "Feuille d'exercices + corrigé détaillé"}
                </span>
                <span className="eleve-document-actions">
                  <button type="button" onClick={() => ouvrir(doc, false)}>
                    Ouvrir
                  </button>
                  <button type="button" onClick={() => ouvrir(doc, true)}>
                    Imprimer
                  </button>
                  <button type="button" onClick={() => declencherTelechargement(doc.blob, nomFichier(resultat.chapitre, resultat.type, doc))}>
                    Télécharger
                  </button>
                </span>
              </li>
            ))}
          </ul>
          <p className="eleve-aide">Un nouveau clic sur « Générer » tire de nouveaux exercices.</p>
        </section>
      )}

      <aside className="eleve-conseil">
        <p className="eleve-conseil-titre">Comment bien l'utiliser</p>
        <p>
          {blanche
            ? 'Fais-la sans ton cours, chronomètre lancé. Corrige-toi ensuite avec le corrigé détaillé, puis refais en ligne, avec les aides, les exercices ratés grâce à leur QR code.'
            : "Fais les exercices sur une feuille à part. Compare d'abord tes résultats aux réponses brèves, puis lis le corrigé détaillé ; refais en ligne, avec les aides, ceux que tu as ratés grâce à leur QR code."}
        </p>
      </aside>
    </div>
  )
}
