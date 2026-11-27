/**
 * Page de classe à code — construction de la COPIE publiée (carnet du professeur ; logique PURE).
 *
 * Ce qui est publié pour UNE classe (jamais une autre), d'après ses séances et l'agenda (0006 / 0007) :
 * - prochaines interros (événements « Interrogation » de la classe à partir d'aujourd'hui, 3 au plus) :
 *   date, heure (si publiée), chapitre, étapes évaluées (parties de la séance qui l'a annoncée) avec une
 *   précision — sous-parties vues par la classe, ou « sans … » si certaines ne l'ont pas été —, et les
 *   générateurs « Pour t'entraîner » (retenus dans l'annonce, sinon ceux des étapes) ;
 * - devoirs à rendre (date de remise à partir d'aujourd'hui ; sans date : donnés ces 7 derniers jours),
 *   texte du devoir tel qu'écrit par le professeur et exercices en ligne joints ;
 * - les 3 dernières séances (jusqu'à aujourd'hui) : date, heure (si publiée), chapitre, étapes vues.
 * JAMAIS : la remarque de séance, l'objectif ou les compétences, l'école, le nom du professeur (ajouté
 * par la base seulement si l'interrupteur est coché), les autres classes, les événements autres que
 * les interros (sorties, absences…).
 */
import { findChapter } from '../content/chaptersIndex'
import { titreCourtChapitre } from '../entrainement/export/examen'
import { generateursChapitre, jourSemaine, numeroHeureTexte, plageTexte, structureChapitre, texteBrut, unitesCouvertes, unitesSection, type Classe, type FormatHoraire, type PartieSection, type Seance } from './carnet'
import { aUnDevoir, INTITULE_BILAN } from './carnetDevoirs'
import type { Evenement } from './agendaEvenements'
import { heureDe, journee, plage, type GrilleHoraire } from './horaire'
import type { ContenuPageClasse, DevoirPublie, EtapePubliee, GenerateurPublie, InterroPubliee, SeancePubliee } from './pageClasse'
import { libelleChapitre, ordreCourant } from './ordreChapitres'

export const MAX_INTERROS = 3
export const MAX_DEVOIRS = 6
export const MAX_SEANCES = 3
const JOURS_DEVOIR_SANS_DATE = 7

export interface DonneesPublication {
  classe: Classe
  /** Toutes les séances du professeur (seules celles de la classe sont lues). */
  seances: Seance[]
  /** Événements de l'agenda (vide sans 0006). */
  evenements: Evenement[]
  grilles: GrilleHoraire[]
  format: FormatHoraire
  /** `AAAA-MM-JJ`. */
  aujourdhui: string
  /** Heure publiée (interrupteur « Heure de la séance ») : sinon aucune heure n'est même envoyée. */
  avecHeure: boolean
}

function ajouterJours(iso: string, n: number): string {
  const [a, m, j] = iso.split('-').map(Number)
  const d = new Date(Date.UTC(a, m - 1, j + n))
  return d.toISOString().slice(0, 10)
}

/** Titre publié : « Chapitre 3 — Suites » (numéro du professeur s'il a rangé ses chapitres et numérote
 * ses documents) ou « Suites » — jamais le numéro du site (« Mon ordre des chapitres »). */
function titreChapitre(niveau: string, slug: string): string {
  const c = findChapter(niveau, slug)
  return c ? libelleChapitre(c, ordreCourant(), { titre: titreCourtChapitre(c.slug, c.title) }) : ''
}

/** Heure d'une interro : « 2e heure » (réglage « numéro ») ou « 09h35 → 10h25 » (réglage « plage »,
 * calculée sur la grille de l'école de la classe ; repli sur le numéro). */
export function heureInterro(e: Pick<Evenement, 'du' | 'journee_entiere' | 'heure_debut' | 'heure_fin'>, classe: Pick<Classe, 'ecole_id'>, grilles: GrilleHoraire[], format: FormatHoraire): string | null {
  if (e.journee_entiere || e.heure_debut === null) return null
  const fin = e.heure_fin !== null && e.heure_fin > e.heure_debut ? e.heure_fin : null
  if (format === 'plage') {
    const g = grilles.find((x) => x.ecole_id === classe.ecole_id)
    if (g) {
      const j = journee(g, jourSemaine(e.du))
      const a = heureDe(j, e.heure_debut)
      const b = heureDe(j, fin ?? e.heure_debut)
      if (a && b) return plage(a.debut, b.fin)
    }
  }
  return numeroHeureTexte(e.heure_debut, fin)
}

/** Heure d'une séance pour l'élève : même règle (jamais « H2 », vocabulaire du carnet). */
export function heureSeance(s: Pick<Seance, 'heure_debut' | 'heure_fin' | 'numero_heure' | 'numero_heure_fin'>, format: FormatHoraire): string | null {
  const numero = s.numero_heure !== null && s.numero_heure !== undefined ? numeroHeureTexte(s.numero_heure, s.numero_heure_fin) : null
  const p = plageTexte(s.heure_debut, s.heure_fin)
  return format === 'numero' ? (numero ?? p) : (p ?? numero)
}

/** Étapes évaluées avec leur précision, d'après ce que la CLASSE a vu dans ce chapitre jusqu'à la date
 * de l'interro (une étape jamais cochée dans une séance : pas de précision non plus). */
export function etapesEvaluees(sections: PartieSection[], vues: Set<string>): EtapePubliee[] {
  return sections.map((s) => {
    const titres = s.sousParties
    let precision = ''
    if (titres.length > 0) {
      const vuesIci = titres.filter((p) => vues.has(p.id))
      const manquent = titres.filter((p) => !vues.has(p.id))
      // Étape vue en entier : pas de précision (une longue liste de sous-titres gênerait la lecture).
      // Vue en partie : la liste la plus courte — « seulement : … » ou « sans : … ».
      if (vuesIci.length > 0 && manquent.length > 0) {
        precision = vuesIci.length <= manquent.length ? `seulement : ${vuesIci.map((p) => minuscule(p.titre)).join(' ; ')}` : `sans : ${manquent.map((p) => minuscule(p.titre)).join(' ; ')}`
      }
    }
    return { id: s.id, numero: s.numero, titre: s.titre, precision: precision.slice(0, 400) }
  })
}

/** Minuscule initiale (sauf sigle ou formule en tête) : « Raison q » → « raison q ». */
function minuscule(t: string): string {
  if (/^\$|^[A-Z]{2}/.test(t)) return t
  return t.charAt(0).toLowerCase() + t.slice(1)
}

function generateursPublies(niveau: string, chapitre: string, ids: string[]): GenerateurPublie[] {
  const c = findChapter(niveau, chapitre)
  const tous = c ? generateursChapitre(c) : []
  return ids.slice(0, 12).map((id) => ({ id, titre: texteBrut(tous.find((g) => g.id === id)?.titre ?? id) }))
}

function interrosPubliees(d: DonneesPublication, seancesClasse: Seance[]): InterroPubliee[] {
  return d.evenements
    .filter((e) => e.type === 'interrogation' && e.classe_id === d.classe.id && e.du >= d.aujourdhui)
    .sort((a, b) => (a.du < b.du ? -1 : a.du > b.du ? 1 : (a.heure_debut ?? -1) - (b.heure_debut ?? -1)))
    .slice(0, MAX_INTERROS)
    .map((e) => {
      const annonce = seancesClasse.find((s) => s.evaluation_evenement === e.id)
      const [niveauEv, slugEv] = (e.chapitre ?? '').split('/')
      const niveau = annonce?.niveau ?? niveauEv ?? ''
      const chapitre = annonce?.chapitre ?? slugEv ?? ''
      const contenu = findChapter(niveau, chapitre)
      const structure = contenu ? structureChapitre(contenu) : []
      const sections = structure.filter((s) => (annonce?.evaluation_parties ?? []).includes(s.id))
      const vues = unitesCouvertes(
        seancesClasse.filter((s) => s.niveau === niveau && s.chapitre === chapitre && s.date_seance <= e.du).flatMap((s) => s.parties),
        structure,
      )
      const retenus = annonce?.evaluation_generateurs ?? []
      const ids = retenus.length > 0 ? retenus : sections.flatMap((s) => s.generateurs.map((g) => g.id))
      const heure = d.avecHeure ? heureInterro(e, d.classe, d.grilles, d.format) : null
      return {
        date: e.du,
        ...(heure ? { heure } : {}),
        type: e.intitule === INTITULE_BILAN || annonce?.evaluation_type === 'bilan' ? 'bilan' : 'interro',
        titre: contenu ? titreChapitre(niveau, chapitre) : '',
        niveau: contenu ? niveau : '',
        chapitre: contenu ? chapitre : '',
        etapes: etapesEvaluees(sections, vues),
        generateurs: contenu ? generateursPublies(niveau, chapitre, [...new Set(ids)]) : [],
      } satisfies InterroPubliee
    })
}

function devoirsPublies(d: DonneesPublication, seancesClasse: Seance[]): DevoirPublie[] {
  const depuis = ajouterJours(d.aujourdhui, -JOURS_DEVOIR_SANS_DATE)
  return seancesClasse
    .filter((s) => aUnDevoir(s) && (s.devoir_pour ? s.devoir_pour >= d.aujourdhui : s.date_seance >= depuis && s.date_seance <= d.aujourdhui))
    .sort((a, b) => {
      const pa = a.devoir_pour ?? '9999'
      const pb = b.devoir_pour ?? '9999'
      return pa < pb ? -1 : pa > pb ? 1 : a.date_seance < b.date_seance ? -1 : 1
    })
    .slice(0, MAX_DEVOIRS)
    .map((s) => ({
      pour: s.devoir_pour ?? null,
      donne_le: s.date_seance,
      texte: s.devoir.trim(),
      niveau: s.niveau,
      chapitre: s.chapitre,
      generateurs: generateursPublies(s.niveau, s.chapitre, s.devoir_generateurs ?? []),
    }))
}

function seancesPubliees(d: DonneesPublication, seancesClasse: Seance[]): SeancePubliee[] {
  return seancesClasse
    // Une séance sans matière vue (annonce d'une évaluation ou d'un devoir faite hors cours, « Annoncer une
    // évaluation ») n'a rien à montrer parmi les dernières séances.
    .filter((s) => s.date_seance <= d.aujourdhui && (s.parties.length > 0 || s.generateurs.length > 0))
    .sort((a, b) => (a.date_seance > b.date_seance ? -1 : a.date_seance < b.date_seance ? 1 : (b.numero_heure ?? 0) - (a.numero_heure ?? 0) || (a.cree_le > b.cree_le ? -1 : 1)))
    .slice(0, MAX_SEANCES)
    .map((s) => {
      const contenu = findChapter(s.niveau, s.chapitre)
      const structure = contenu ? structureChapitre(contenu) : []
      const couvertes = unitesCouvertes(s.parties, structure)
      const etapes: EtapePubliee[] = structure
        .filter((sec) => unitesSection(sec).some((u) => couvertes.has(u)))
        .map((sec) => {
          const toutes = unitesSection(sec).every((u) => couvertes.has(u))
          const sous = toutes ? [] : sec.sousParties.filter((p) => couvertes.has(p.id)).map((p) => minuscule(p.titre))
          return { id: sec.id, numero: sec.numero, titre: sec.titre, precision: sous.join(', ').slice(0, 400) }
        })
      const heure = d.avecHeure ? heureSeance(s, d.format) : null
      return { date: s.date_seance, ...(heure ? { heure } : {}), niveau: contenu ? s.niveau : '', chapitre: contenu ? s.chapitre : '', titre: contenu ? titreChapitre(s.niveau, s.chapitre) : '', etapes }
    })
}

/** La copie à publier pour la classe (toujours les trois rubriques : la base retire celles qui ne
 * sont pas cochées, et l'heure si elle ne l'est pas — ici aussi, par prudence). */
export function construireContenuPage(d: DonneesPublication): ContenuPageClasse {
  const seancesClasse = d.seances.filter((s) => s.classe_id === d.classe.id)
  return { v: 1, interros: interrosPubliees(d, seancesClasse), devoirs: devoirsPublies(d, seancesClasse), seances: seancesPubliees(d, seancesClasse) }
}

/** JSON à clés triées (Postgres range les clés d'un jsonb à sa façon : l'ordre ne doit pas compter). */
function jsonStable(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(jsonStable).join(',')}]`
  if (v && typeof v === 'object') {
    const o = v as Record<string, unknown>
    return `{${Object.keys(o).filter((k) => o[k] !== undefined).sort().map((k) => `${JSON.stringify(k)}:${jsonStable(o[k])}`).join(',')}}`
  }
  return JSON.stringify(v ?? null)
}

/** Même contenu ? (comparaison stable : évite de republier à chaque ouverture du carnet). */
export function memeContenu(a: unknown, b: unknown): boolean {
  return jsonStable(a ?? {}) === jsonStable(b ?? {})
}
