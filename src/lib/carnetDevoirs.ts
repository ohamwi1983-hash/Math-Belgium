/**
 * Carnet de matière vue — devoirs, évaluations et texte en rubriques pour l'agenda scolaire
 * (`supabase/migrations/0007_devoirs_evaluations.sql`). Logique PURE, sans React ni supabase-js,
 * testée seule (esbuild + node). Voir `.claude/rules/comptes.md`, sous-section « Devoirs, évaluations
 * et texte en rubriques ».
 *
 * - « Pour le » d'un devoir : `prochainsCours` = prochains jours de cours EFFECTIFS de la classe (son
 *   horaire, hors week-ends, congés FWB et heures supprimées par un événement de l'agenda).
 * - Processus Connaître / Appliquer / Transférer DÉDUITS des générateurs vus (la table des processus
 *   vit dans `evaluationPayload.ts`, lourde : elle est INJECTÉE, `processusDe`).
 * - Texte en rubriques (`texteAgenda`, `htmlAgenda`) : 🎯 Objectif, 📘 Vu en classe, 🧭 Compétences
 *   travaillées, ✏️ Pour s'entraîner, 📌 Devoir pour le …, 📅 Interro annoncée. Rubriques activables
 *   (`Rubriques`, mémorisées dans les réglages du professeur). La remarque n'est JAMAIS copiée.
 * - L'objectif n'existe pas dans le contenu des chapitres : `objectifPropose` propose une phrase À
 *   PARTIR DES TITRES des parties cochées, que le professeur reformule avant de copier ; jamais
 *   présentée comme venant du programme.
 */
import { findChapter } from '../content/chaptersIndex'
import type { ChapterContent } from '../content/types'
import { predicatSuppression, dateJourLong, type Evenement, type ClasseAgenda } from './agendaEvenements'
import { ajouterJours } from './calendrierFwb'
import {
  enteteSeance,
  echapperHtml,
  generateursChapitre,
  lignesPartiesVues,
  structureChapitre,
  texteBrut,
  type Seance,
  type SeanceResolue,
  type TypeEvaluation,
} from './carnet'
import { creneauxDuJour, type CaseHoraire, type Creneau, type GrilleHoraire } from './horaire'
import { urlEntrainementEleve } from './carnetMatiere'

/* ------------------------------------------------------------------------------- constantes */

export const LIBELLE_EVALUATION: Record<TypeEvaluation, string> = {
  annonce: 'Annoncer une interro',
  faite: 'Interro faite aujourd’hui',
  bilan: 'Contrôle / bilan',
}

/** Intitulé de l'événement « Interrogation » d'un contrôle-bilan (vide pour une interro annoncée :
 * l'agenda affiche alors « Interrogation »). */
export const INTITULE_BILAN = 'Contrôle-bilan'

/** Liste PROPOSÉE par défaut — PAS une liste officielle (FESeC, WBE…) : le professeur la renomme,
 * la complète ou la vide dans les réglages du carnet. */
export const COMPETENCES_TRANSVERSALES_DEFAUT: readonly string[] = [
  'S’approprier une situation',
  'Raisonner et argumenter',
  'Communiquer en langage mathématique',
  'Généraliser et structurer',
  'Utiliser un outil numérique',
]
export const COMPETENCES_MAX = 12
export const COMPETENCE_LONGUEUR_MAX = 80

export type CleRubrique = 'objectif' | 'processus' | 'transversales' | 'liens' | 'emojis'
export type Rubriques = Record<CleRubrique, boolean>
export const CLES_RUBRIQUES: CleRubrique[] = ['objectif', 'processus', 'transversales', 'liens', 'emojis']
export const RUBRIQUES_DEFAUT: Rubriques = { objectif: true, processus: true, transversales: true, liens: true, emojis: true }

export const LIBELLE_RUBRIQUE: Record<CleRubrique, { titre: string; aide?: string }> = {
  objectif: { titre: 'Objectif de la séance', aide: '1 phrase « Je suis capable de… », proposée d’après les parties cochées, modifiable' },
  processus: { titre: 'Processus (Connaître / Appliquer / Transférer)', aide: 'déduits des exercices liés à la séance' },
  transversales: { titre: 'Compétences transversales', aide: 'choisies dans ta liste (Réglages), 1 à 3 par séance' },
  liens: { titre: 'Liens vers le cours et les exercices' },
  emojis: { titre: 'Émojis de section', aide: 'désactive-les si Smartschool les affiche mal' },
}

/** Lecture tolérante de `carnet_reglages.rubriques` (objet de booléens ; clé absente = défaut). */
export function lireRubriques(j: unknown): Rubriques {
  const r = { ...RUBRIQUES_DEFAUT }
  if (j && typeof j === 'object' && !Array.isArray(j)) {
    for (const c of CLES_RUBRIQUES) {
      const v = (j as Record<string, unknown>)[c]
      if (typeof v === 'boolean') r[c] = v
    }
  }
  return r
}

/** Lecture tolérante de `carnet_reglages.competences_transversales` ; `null` (colonne vide) = liste
 * par défaut. Textes nettoyés, doublons et vides retirés. */
export function lireCompetences(j: unknown): string[] {
  if (!Array.isArray(j)) return [...COMPETENCES_TRANSVERSALES_DEFAUT]
  const vus = new Set<string>()
  const liste: string[] = []
  for (const x of j) {
    if (typeof x !== 'string') continue
    const t = x.replace(/\s+/g, ' ').trim().slice(0, COMPETENCE_LONGUEUR_MAX)
    if (!t || vus.has(t.toLowerCase())) continue
    vus.add(t.toLowerCase())
    liste.push(t)
  }
  return liste.slice(0, COMPETENCES_MAX)
}

/** Vérifie un intitulé de compétence (renommer / ajouter) ; `autres` : les intitulés déjà présents. */
export function erreurCompetence(nom: string, autres: string[]): string | null {
  const t = nom.replace(/\s+/g, ' ').trim()
  if (!t) return 'Intitulé manquant.'
  if (t.length > COMPETENCE_LONGUEUR_MAX) return `${COMPETENCE_LONGUEUR_MAX} caractères au maximum.`
  if (autres.some((a) => a.toLowerCase() === t.toLowerCase())) return 'Cette compétence est déjà dans ta liste.'
  return null
}

/* ------------------------------------------------------------------------------- prochain cours */

export interface ProchainCours {
  date: string
  /** Premier créneau de la classe ce jour-là. */
  creneau: Creneau
}

/**
 * Prochains jours de cours EFFECTIFS d'une classe, strictement APRÈS `apres` : jours où son horaire a
 * au moins un créneau qui a lieu — week-ends, congés et vacances FWB exclus (`creneauxDuJour`), heures
 * supprimées par un événement de l'agenda exclues (journée pédagogique, sortie, absence du professeur,
 * « J'accompagne »… ; une interrogation ne supprime rien). Vide si la classe n'a aucune case dans
 * l'horaire. Recherche bornée à `horizon` jours (défaut 120 : un été entier).
 */
export function prochainsCours(p: {
  classeId: string
  apres: string
  grilles: GrilleHoraire[]
  cases: CaseHoraire[]
  evenements?: Evenement[]
  classes?: ClasseAgenda[]
  n?: number
  horizon?: number
}): ProchainCours[] {
  const n = p.n ?? 2
  const cases = p.cases.filter((c) => c.classe_id === p.classeId)
  if (cases.length === 0 || !/^\d{4}-\d{2}-\d{2}$/.test(p.apres)) return []
  const supprimee = p.evenements && p.evenements.length > 0 ? predicatSuppression({ evenements: p.evenements, classes: p.classes ?? [], grilles: p.grilles }) : undefined
  const resultat: ProchainCours[] = []
  for (let d = ajouterJours(p.apres, 1), i = 0; i < (p.horizon ?? 120) && resultat.length < n; d = ajouterJours(d, 1), i++) {
    const creneaux = creneauxDuJour(d, p.grilles, cases, { supprimee }).creneaux.filter((c) => c.classe_id === p.classeId)
    if (creneaux.length > 0) resultat.push({ date: d, creneau: [...creneaux].sort((a, b) => a.debut - b.debut)[0] })
  }
  return resultat
}

export type ChoixPourLe = 'prochain' | 'suivant' | 'autre'

/** Choix « Pour le » d'une date de remise déjà enregistrée : la puce correspondante si la date est un
 * des deux prochains cours, sinon « Autre date ». */
export function choixDeLaDate(date: string | null | undefined, cours: ProchainCours[]): ChoixPourLe {
  if (date && cours[0]?.date === date) return 'prochain'
  if (date && cours[1]?.date === date) return 'suivant'
  return 'autre'
}

/** « jeu. 26/11 » — étiquette courte d'une puce « Pour le ». */
export function dateCourteDevoir(iso: string): string {
  return dateJourLong(iso).replace(/^(\w{3})\w*/, (_, j: string) => `${j}.`)
}

/* ------------------------------------------------------------------------------- devoirs à rendre */

/** Le devoir d'une séance a-t-il un contenu (consigne ou exercices joints) ? */
export function aUnDevoir(s: Pick<Seance, 'devoir' | 'devoir_generateurs'>): boolean {
  return s.devoir.trim() !== '' || (s.devoir_generateurs?.length ?? 0) > 0
}

/** Séances dont le devoir est À RENDRE ce jour-là (option : une classe), plus anciennes d'abord. */
export function devoirsARendre<S extends Pick<Seance, 'id' | 'classe_id' | 'date_seance' | 'devoir' | 'devoir_pour' | 'devoir_generateurs'>>(seances: S[], date: string, classeId?: string): S[] {
  return seances
    .filter((s) => s.devoir_pour === date && aUnDevoir(s) && (!classeId || s.classe_id === classeId))
    .sort((a, b) => (a.date_seance < b.date_seance ? -1 : a.date_seance > b.date_seance ? 1 : a.id < b.id ? -1 : 1))
}

/** Devoirs à rendre entre deux dates incluses (page classe, agenda d'une période), par date. */
export function devoirsEntre<S extends Pick<Seance, 'id' | 'classe_id' | 'date_seance' | 'devoir' | 'devoir_pour' | 'devoir_generateurs'>>(seances: S[], du: string, au: string, classeId?: string | null): S[] {
  return seances
    .filter((s) => !!s.devoir_pour && s.devoir_pour >= du && s.devoir_pour <= au && aUnDevoir(s) && (!classeId || s.classe_id === classeId))
    .sort((a, b) => ((a.devoir_pour as string) < (b.devoir_pour as string) ? -1 : (a.devoir_pour as string) > (b.devoir_pour as string) ? 1 : a.date_seance < b.date_seance ? -1 : 1))
}

/** Résumé court d'un devoir (« Exercices 4 et 5 p. 62 · 2 exercices en ligne »). */
export function resumeDevoir(s: Pick<Seance, 'devoir' | 'devoir_generateurs'>, max = 80): string {
  const consigne = s.devoir.replace(/\s+/g, ' ').trim()
  const court = consigne.length > max ? `${consigne.slice(0, max - 1).trimEnd()}…` : consigne
  const n = s.devoir_generateurs?.length ?? 0
  return [court, n > 0 ? `${n} exercice${n > 1 ? 's' : ''} en ligne` : ''].filter(Boolean).join(' · ')
}

/* ------------------------------------------------------------------------------- processus */

export type Processus = 1 | 2 | 3
export const NOM_PROCESSUS: Record<Processus, string> = { 1: 'Connaître', 2: 'Appliquer', 3: 'Transférer' }

export interface ProcessusDeduit {
  processus: Processus
  nom: string
  /** Titres des exercices qui le relèvent (cartes « S'entraîner » du chapitre). */
  exercices: string[]
}

/** Processus des générateurs vus, dans l'ordre Connaître → Transférer ; un générateur que la table ne
 * connaît pas (`processusDe` rend `null`) est ignoré (jamais deviné). */
export function processusDeduits(generateurs: { id: string; titre: string }[], processusDe: (generatorId: string) => Processus | null): ProcessusDeduit[] {
  const parProcessus = new Map<Processus, string[]>()
  for (const g of generateurs) {
    const p = processusDe(g.id)
    if (!p) continue
    const liste = parProcessus.get(p) ?? []
    if (!liste.includes(g.titre)) liste.push(g.titre)
    parProcessus.set(p, liste)
  }
  return ([1, 2, 3] as Processus[]).filter((p) => parProcessus.has(p)).map((p) => ({ processus: p, nom: NOM_PROCESSUS[p], exercices: parProcessus.get(p) as string[] }))
}

/* ------------------------------------------------------------------------------- objectif */

function minusculeInitiale(t: string): string {
  // Sigle ou nom propre en tête (« PGCD », « Pythagore ») : gardé tel quel.
  if (/^[A-ZÀ-Ý]{2,}\b/.test(t) || /^(Pythagore|Thalès|Chasles|Euler|Moivre|Pascal|Monge|Gauss|Newton|Al-Kashi)\b/.test(t)) return t
  return t.charAt(0).toLowerCase() + t.slice(1)
}

/** Phrase PROPOSÉE pour l'objectif, d'après les TITRES des parties cochées (sous-parties, ou titre
 * court de la section entière) — à reformuler par le professeur. Vide sans partie cochée. */
export function objectifPropose(parties: string[], chapitre: ChapterContent | undefined): string {
  if (!chapitre) return ''
  const structure = structureChapitre(chapitre)
  const elements: string[] = []
  for (const l of lignesPartiesVues(parties, structure)) {
    if (l.entiere) {
      const section = chapitre.sections.find((s) => s.id === l.sectionId)
      elements.push(texteBrut(section?.titreCourt ?? l.titreSection))
    } else elements.push(...l.sousParties)
  }
  const propres = [...new Set(elements.map((e) => minusculeInitiale(e.replace(/[.:;]\s*$/, '').trim())).filter(Boolean))]
  if (propres.length === 0) return ''
  return `Je suis capable d’expliquer et d’utiliser : ${propres.join(' ; ')}.`.slice(0, 300)
}

/** Phrases de « L'essentiel » des sections touchées par les parties cochées (aide à la reformulation
 * de l'objectif, affichée à côté — jamais copiée telle quelle). */
export function essentielsDesParties(parties: string[], chapitre: ChapterContent | undefined): string[] {
  if (!chapitre) return []
  const ids = new Set(lignesPartiesVues(parties, structureChapitre(chapitre)).map((l) => l.sectionId))
  return chapitre.sections.filter((s) => ids.has(s.id)).flatMap((s) => (s.essentiel ?? []).map(texteBrut))
}

/* ------------------------------------------------------------------------------- texte en rubriques */

export interface PartieTexte {
  /** « § 3 Convergence et divergence des suites ». */
  titre: string
  /** Sous-parties vues (vide : section entière). */
  sousParties: string[]
  url: string
}

export interface EvaluationTexte {
  type: TypeEvaluation
  /** Date de l'interro (annoncée : celle de l'événement ; faite : celle de la séance). */
  date: string
  /** « H2 », « H1–H2 », `null` sans heure. */
  heure: string | null
  /** « § 2 », « § 3 ». */
  numeros: string[]
  /** Titres courts des sections évaluées (« suites géométriques »). */
  themes: string[]
  /** Interro annoncée / contrôle-bilan : page publique d'entraînement de l'élève (assistant « Me préparer
   * à l'évaluation » du chapitre, sections annoncées cochées, générateurs retenus seulement) ; absent
   * pour une interro faite aujourd'hui. Aucun nom d'élève, rien n'est enregistré. */
  entrainementEleve?: string
}

export interface DonneesTexteAgenda {
  entete: string
  /** « MATHÉMATIQUES — Chapitre 3 : Suites » ; `null` si le chapitre a été retiré du site. */
  chapitre: { ligne: string; titre: string; url: string } | null
  objectif: string
  parties: PartieTexte[]
  processus: ProcessusDeduit[]
  transversales: string[]
  entrainement: { titre: string; url: string }[]
  devoir: { pour: string | null; consigne: string; exercices: { titre: string; url: string }[] } | null
  evaluation: EvaluationTexte | null
  /** Texte d'une annonce seule (« Annoncer une évaluation » / « Donner un devoir ») : pas de rubrique « Vu en
   * classe » de repli (le lien du chapitre), puisque rien n'a été vu. Absent : comportement d'avant. */
  sansVu?: boolean
}

/** Heure d'un événement : « H2 », « H1–H2 », « H0 » ; `null` pour une journée entière. */
export function heureEvenementTexte(e: Pick<Evenement, 'journee_entiere' | 'heure_debut' | 'heure_fin'>): string | null {
  if (e.journee_entiere || e.heure_debut === null || e.heure_fin === null) return null
  return e.heure_fin > e.heure_debut ? `H${e.heure_debut}–H${e.heure_fin}` : `H${e.heure_debut}`
}

/**
 * Tout ce qu'il faut pour le texte en rubriques d'UNE séance. `r` : la séance résolue habituelle
 * (`resoudreSeance`, mêmes options que la copie d'avant : horaire, liens des générateurs) ;
 * `processusDe` : table des processus (injectée) ; `evenement` : l'interro de l'agenda liée à la
 * séance (annonce / bilan), `null` si absente (0006, ou supprimée depuis).
 */
export function donneesTexteAgenda(
  seance: Seance,
  r: SeanceResolue,
  options: {
    lienGenerateur?: (chantier: string, id: string) => string
    processusDe?: (generatorId: string) => Processus | null
    evenement?: Evenement | null
    objectif?: string
    transversales?: string[]
  } = {},
): DonneesTexteAgenda {
  const chapitre = findChapter(seance.niveau, seance.chapitre)
  const structure = chapitre ? structureChapitre(chapitre) : []
  const base = r.chapitre?.url ?? ''
  const gens = chapitre ? generateursChapitre(chapitre) : []
  const absolu = (u: string) => (u.startsWith('/') ? `https://math-belgium.vercel.app${u}` : u)
  const lien = (g: { chantier: string; id: string }) => (options.lienGenerateur ? absolu(options.lienGenerateur(g.chantier, g.id)) : '')
  const parties: PartieTexte[] = lignesPartiesVues(seance.parties, structure).map((l) => ({ titre: `§ ${l.numero} ${l.titreSection}`, sousParties: l.sousParties, url: `${base}#${l.sectionId}` }))
  // Processus : exercices faits en classe ET exercices joints au devoir.
  const vus = gens.filter((g) => seance.generateurs.includes(g.id) || (seance.devoir_generateurs ?? []).includes(g.id)).map((g) => ({ id: g.id, titre: texteBrut(g.titre) }))
  const processus = options.processusDe ? processusDeduits(vus, options.processusDe) : []
  const exercicesDevoir = gens.filter((g) => (seance.devoir_generateurs ?? []).includes(g.id)).map((g) => ({ titre: texteBrut(g.titre), url: lien(g) }))
  const consigne = seance.devoir.trim()
  const devoir = consigne || exercicesDevoir.length > 0 ? { pour: seance.devoir_pour ?? null, consigne, exercices: exercicesDevoir } : null
  let evaluation: EvaluationTexte | null = null
  const t = seance.evaluation_type ?? null
  if (t) {
    const sections = structure.filter((s) => (seance.evaluation_parties ?? []).includes(s.id))
    const themes = sections.map((s) => minusculeInitiale(texteBrut(chapitre?.sections.find((x) => x.id === s.id)?.titreCourt ?? s.titre)))
    const numeros = sections.map((s) => `§ ${s.numero}`)
    const entrainementEleve = chapitre ? absolu(urlEntrainementEleve(seance.niveau, seance.chapitre, sections.map((s) => s.id), seance.evaluation_generateurs ?? [])) : undefined
    if (t === 'faite') evaluation = { type: t, date: seance.date_seance, heure: null, numeros, themes }
    else if (options.evenement) evaluation = { type: t, date: options.evenement.du, heure: heureEvenementTexte(options.evenement), numeros, themes, ...(entrainementEleve ? { entrainementEleve } : {}) }
  }
  return {
    entete: enteteSeance(r),
    chapitre: r.chapitre ? { ligne: r.chapitre.numero !== null ? `MATHÉMATIQUES — Chapitre ${r.chapitre.numero} : ` : 'MATHÉMATIQUES — ', titre: r.chapitre.titre, url: r.chapitre.url } : null,
    objectif: (options.objectif ?? seance.objectif ?? '').replace(/\s+/g, ' ').trim(),
    parties,
    processus,
    transversales: options.transversales ?? seance.competences ?? [],
    entrainement: r.generateurs,
    devoir,
    evaluation,
  }
}

/** Ligne du lien élève sous l'interro annoncée (texte et HTML). */
export const PREFIXE_ENTRAINEMENT_ELEVE = 'Pour t’entraîner : '

const EMOJI = { objectif: '🎯', vu: '📘', competences: '🧭', entrainer: '✏️', devoir: '📌', interro: '📅', faite: '📝' }

/** « § 2 et § 3 », « § 1, § 2 et § 4 ». */
function listeEt(elements: string[]): string {
  if (elements.length <= 1) return elements.join('')
  return `${elements.slice(0, -1).join(', ')} et ${elements[elements.length - 1]}`
}

/** Rubriques du texte, dans l'ordre : titre (avec ou sans émoji) + lignes. Partagé par le texte brut
 * et le HTML. Une rubrique vide n'apparaît pas. */
interface Rubrique {
  cle: 'objectif' | 'vu' | 'competences' | 'entrainer' | 'devoir' | 'interro'
  titre: string
  /** Texte brut (lignes) — sans les adresses quand `liens` est faux. */
  lignes: string[]
}

function titreRubrique(emoji: string, titre: string, avecEmoji: boolean): string {
  return avecEmoji ? `${emoji} ${titre}` : titre
}

/** Phrase de l'évaluation : « Interro annoncée : lundi 7/12 (H2) — § 2 et § 3 (suites géométriques,
 * convergence et divergence). » */
export function phraseEvaluation(e: EvaluationTexte): string {
  const quoi = e.numeros.length > 0 ? ` — ${listeEt(e.numeros)}${e.themes.length > 0 ? ` (${e.themes.join(', ')})` : ''}` : ''
  if (e.type === 'faite') return `Interro faite en classe${quoi}.`
  const titre = e.type === 'bilan' ? 'Contrôle-bilan annoncé' : 'Interro annoncée'
  return `${titre} : ${dateJourLong(e.date)}${e.heure ? ` (${e.heure})` : ''}${quoi}.`
}

function rubriques(d: DonneesTexteAgenda, o: Rubriques): Rubrique[] {
  const liens = o.liens
  const r: Rubrique[] = []
  if (o.objectif && d.objectif) r.push({ cle: 'objectif', titre: titreRubrique(EMOJI.objectif, 'Objectif de la séance', o.emojis), lignes: [d.objectif] })
  const vu: string[] = []
  for (const p of d.parties) {
    vu.push(`• ${p.titre}`, ...p.sousParties.map((s) => `  – ${s}`))
    if (liens) vu.push(`  ${p.url}`)
  }
  if (d.parties.length === 0 && d.chapitre && liens && !d.sansVu) vu.push(d.chapitre.url)
  if (vu.length > 0) r.push({ cle: 'vu', titre: titreRubrique(EMOJI.vu, 'Vu en classe', o.emojis), lignes: vu })
  const comp: string[] = []
  if (o.processus && d.processus.length > 0) comp.push(`• Processus : ${d.processus.map((p) => `${p.nom} (${p.exercices.join(', ')})`).join(' · ')}`)
  if (o.transversales && d.transversales.length > 0) comp.push(`• Transversales : ${d.transversales.join(' · ')}`)
  if (comp.length > 0) r.push({ cle: 'competences', titre: titreRubrique(EMOJI.competences, 'Compétences travaillées', o.emojis), lignes: comp })
  if (d.entrainement.length > 0) r.push({ cle: 'entrainer', titre: titreRubrique(EMOJI.entrainer, 'Pour s’entraîner (en ligne)', o.emojis), lignes: d.entrainement.map((g) => `• ${g.titre}${liens && g.url ? ` — ${g.url}` : ''}`) })
  if (d.devoir) {
    const titre = d.devoir.pour ? `Devoir pour le ${dateJourLong(d.devoir.pour)}` : 'Devoir'
    const lignes = [...(d.devoir.consigne ? d.devoir.consigne.split(/\r?\n/).map((l) => l.trimEnd()) : []), ...d.devoir.exercices.map((g) => `• ${g.titre}${liens && g.url ? ` — ${g.url}` : ''}`)]
    r.push({ cle: 'devoir', titre: titreRubrique(EMOJI.devoir, titre, o.emojis), lignes })
  }
  if (d.evaluation)
    r.push({
      cle: 'interro',
      titre: titreRubrique(d.evaluation.type === 'faite' ? EMOJI.faite : EMOJI.interro, phraseEvaluation(d.evaluation), o.emojis),
      lignes: liens && d.evaluation.entrainementEleve ? [`${PREFIXE_ENTRAINEMENT_ELEVE}${d.evaluation.entrainementEleve}`] : [],
    })
  return r
}

/** Texte brut à coller dans l'agenda scolaire (Smartschool…) : en-tête, ligne du chapitre, puis les
 * rubriques séparées par une ligne vide. */
export function texteAgenda(d: DonneesTexteAgenda, o: Rubriques = RUBRIQUES_DEFAUT): string {
  const lignes: string[] = [d.entete]
  if (d.chapitre) lignes.push(`${d.chapitre.ligne}${d.chapitre.titre}`)
  for (const rub of rubriques(d, o)) lignes.push('', rub.titre, ...rub.lignes)
  return lignes.join('\n')
}

/** Même contenu en HTML simple (collage riche : liens cliquables, titres de rubrique en gras). */
export function htmlAgenda(d: DonneesTexteAgenda, o: Rubriques = RUBRIQUES_DEFAUT): string {
  const e = echapperHtml
  const lien = (url: string, texte: string) => (o.liens && url ? `<a href="${e(url)}">${e(texte)}</a>` : e(texte))
  const h: string[] = [`<p><strong>${e(d.entete)}</strong>`]
  if (d.chapitre) h.push(`<br>${e(d.chapitre.ligne)}${lien(d.chapitre.url, d.chapitre.titre)}`)
  h.push('</p>')
  for (const rub of rubriques(d, o)) {
    if (rub.cle === 'interro') {
      const eleve = o.liens && d.evaluation?.entrainementEleve ? `<br>${e(PREFIXE_ENTRAINEMENT_ELEVE)}${lien(d.evaluation.entrainementEleve, d.evaluation.entrainementEleve)}` : ''
      h.push(`<p><strong>${e(rub.titre)}</strong>${eleve}</p>`)
      continue
    }
    h.push(`<p><strong>${e(rub.titre)}</strong>`)
    if (rub.cle === 'objectif') h.push(`<br>${e(d.objectif)}</p>`)
    else if (rub.cle === 'vu') {
      h.push('</p><ul>')
      for (const p of d.parties) h.push(`<li>${lien(p.url, p.titre)}${p.sousParties.length > 0 ? `<ul>${p.sousParties.map((s) => `<li>${e(s)}</li>`).join('')}</ul>` : ''}</li>`)
      if (d.parties.length === 0 && d.chapitre) h.push(`<li>${lien(d.chapitre.url, d.chapitre.titre)}</li>`)
      h.push('</ul>')
    } else if (rub.cle === 'competences') h.push(`</p><ul>${rub.lignes.map((l) => `<li>${e(l.replace(/^• /, ''))}</li>`).join('')}</ul>`)
    else if (rub.cle === 'entrainer') h.push(`</p><ul>${d.entrainement.map((g) => `<li>${lien(g.url, g.titre)}</li>`).join('')}</ul>`)
    else if (rub.cle === 'devoir' && d.devoir) {
      h.push(d.devoir.consigne ? `<br>${e(d.devoir.consigne).replace(/\r?\n/g, '<br>')}</p>` : '</p>')
      if (d.devoir.exercices.length > 0) h.push(`<ul>${d.devoir.exercices.map((g) => `<li>${lien(g.url, g.titre)}</li>`).join('')}</ul>`)
    }
  }
  return h.join('')
}
