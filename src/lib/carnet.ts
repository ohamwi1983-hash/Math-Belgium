/**
 * Carnet de matière vue (phase 2 des comptes professeurs) — logique PURE, sans React ni
 * supabase-js, testable seule : structure d'un chapitre en sections / sous-parties, horaire,
 * texte « Copier pour Smartschool », progression par classe, matière vue depuis une date.
 * Voir `.claude/rules/comptes.md` (section « Phase 2 ») et `supabase/migrations/0002_carnet.sql`.
 *
 * Parties cochées d'une séance (`seances.parties`, tableau de textes) :
 * - `sectionId` : la section ENTIÈRE ;
 * - `sectionId/slug` : une sous-partie, c'est-à-dire un bloc `subheading` de la section
 *   (slug = titre sans accents ni signes : stable si on insère une sous-partie ailleurs).
 * Une section dont toutes les sous-parties sont cochées est enregistrée comme section entière.
 */
import type { ChapterContent } from '../content/types'
import { findChapter, LEVELS } from '../content/chaptersIndex'
import { heureTexte } from '../entrainement/export/examen'
import type { MatiereVue } from './carnetMatiere'
import { chapitresDansMonOrdre, numeroAffiche, numeroRepere, ordreCourant } from './ordreChapitres'

export const SITE_URL = 'https://math-belgium.vercel.app'
export const NOM_CLASSE_MAX = 40
export const DEVOIR_MAX = 2000
export const REMARQUE_MAX = 2000
/** Phrase « Je suis capable de … » (0007). */
export const OBJECTIF_MAX = 300
export const NUMERO_HEURE_MAX = 15

export type FormatHoraire = 'plage' | 'numero'

export interface ReglagesCarnet {
  format_horaire: FormatHoraire
  duree_heure: number
}

export const REGLAGES_DEFAUT: ReglagesCarnet = { format_horaire: 'plage', duree_heure: 50 }

export interface Classe {
  id: string
  ecole_id: string
  nom: string
  niveau: string | null
  cree_le: string
}

export interface Seance {
  id: string
  classe_id: string
  /** `AAAA-MM-JJ`. */
  date_seance: string
  /** `HH:MM` ou `HH:MM:SS` (colonne `time`). */
  heure_debut: string | null
  heure_fin: string | null
  numero_heure: number | null
  /** Dernière heure d'une heure double (« H1–H2 » : 1 et 2) ; absente si 0003 n'est pas appliqué. */
  numero_heure_fin?: number | null
  niveau: string
  chapitre: string
  parties: string[]
  generateurs: string[]
  devoir: string
  remarque: string
  cree_le: string
  modifie_le: string
  /* Devoirs, évaluations et texte en rubriques (`0007_devoirs_evaluations.sql`) : absents tant que
   * 0007 n'est pas appliqué (le carnet marche alors comme avant). */
  /** Date de remise du devoir (`AAAA-MM-JJ`), `null` : pas de date. */
  devoir_pour?: string | null
  /** Exercices en ligne joints au devoir (générateurs du chapitre). */
  devoir_generateurs?: string[]
  /** Phrase « Je suis capable de … » du texte pour l'agenda scolaire (vide : rubrique omise). */
  objectif?: string
  /** Compétences transversales cochées pour cette séance (intitulés de la liste du professeur). */
  competences?: string[]
  /** Évaluation notée avec la séance : annoncée, faite aujourd'hui ou contrôle-bilan. */
  evaluation_type?: TypeEvaluation | null
  /** Parties de la matière évaluée (ids de sections du chapitre). */
  evaluation_parties?: string[]
  /** Événement « Interrogation » de l'agenda (0006) créé par « Annoncer » / « Contrôle-bilan ». */
  evaluation_evenement?: string | null
  /** Générateurs retenus pour l'évaluation, parmi ceux des sections évaluées (`0008_evaluation_generateurs.sql`,
   * absent tant que 0008 n'est pas appliqué) ; vide = tous ceux des sections évaluées. */
  evaluation_generateurs?: string[]
}

/** Évaluation notée avec une séance (0007). « faite » : l'interro a eu lieu pendant la séance (aucun
 * événement futur) ; « annonce » et « bilan » créent l'événement « Interrogation » de l'agenda. */
export type TypeEvaluation = 'annonce' | 'faite' | 'bilan'

/** Ce que le formulaire envoie (sans id ni dates techniques). */
export type SaisieSeance = Pick<
  Seance,
  | 'classe_id'
  | 'date_seance'
  | 'heure_debut'
  | 'heure_fin'
  | 'numero_heure'
  | 'numero_heure_fin'
  | 'niveau'
  | 'chapitre'
  | 'parties'
  | 'generateurs'
  | 'devoir'
  | 'remarque'
  | 'devoir_pour'
  | 'devoir_generateurs'
  | 'objectif'
  | 'competences'
  | 'evaluation_type'
  | 'evaluation_parties'
  | 'evaluation_evenement'
  | 'evaluation_generateurs'
>

/* ------------------------------------------------------------------------------- textes */

const EXPOSANTS: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '+': '⁺', '-': '⁻', n: 'ⁿ' }
const COMMANDES: Record<string, string> = {
  infty: '∞',
  pi: 'π',
  alpha: 'α',
  beta: 'β',
  theta: 'θ',
  Delta: 'Δ',
  in: '∈',
  leq: '≤',
  geq: '≥',
  le: '≤',
  ge: '≥',
  neq: '≠',
  times: '×',
  cdot: '·',
  to: '→',
  mathbb: '',
  mathrm: '',
  text: '',
  operatorname: '',
  ln: 'ln',
  log: 'log',
  sin: 'sin',
  cos: 'cos',
  tan: 'tan',
  lim: 'lim',
  R: 'ℝ',
}

/** Formule KaTeX simple → texte (« $1^{\infty}$ » → « 1^∞ » lisible : « 1∞ » en exposant). */
function latexEnTexte(latex: string): string {
  let t = latex
    .replace(/\\mathbb\{R\}/g, 'ℝ')
    .replace(/\\(?:left|right|displaystyle|,|;|!|quad|qquad)/g, '')
    .replace(/\\([A-Za-z]+)/g, (_, nom: string) => COMMANDES[nom] ?? nom)
  t = t.replace(/\^\{([^{}]*)\}|\^(\S)/g, (_, groupe: string | undefined, seul: string | undefined) => {
    const contenu = groupe ?? seul ?? ''
    const converti = [...contenu].map((c) => EXPOSANTS[c] ?? c).join('')
    return [...contenu].every((c) => EXPOSANTS[c]) ? converti : [...contenu].length === 1 ? `^${contenu}` : `^(${contenu})`
  })
  return t.replace(/[{}]/g, '').replace(/-/g, '−').replace(/\s+/g, ' ').trim()
}

/** Texte `RichText` (« $…$ » et « **gras** ») → texte brut pour Smartschool et la fiche. */
export function texteBrut(riche: string): string {
  return riche
    .replace(/\$\$([^$]+)\$\$|\$([^$]+)\$/g, (_, a: string | undefined, b: string | undefined) => latexEnTexte(a ?? b ?? ''))
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Titre → identifiant stable (« Changement de base » → « changement-de-base »). */
export function slugTitre(texte: string): string {
  const s = texteBrut(texte)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '')
  return s || 'partie'
}

/* ------------------------------------------------------------------- structure d'un chapitre */

export interface SousPartie {
  /** `sectionId/slug`. */
  id: string
  /** Titre tel qu'écrit dans le contenu (RichText). */
  titre: string
}

export interface GenerateurChapitre {
  id: string
  titre: string
  chantier: string
  sectionId: string | null
}

export interface PartieSection {
  id: string
  numero: number
  titre: string
  sousParties: SousPartie[]
  generateurs: GenerateurChapitre[]
}

/** Sections numérotées du chapitre, avec leurs sous-parties (blocs `subheading` de premier niveau)
 * et leurs générateurs (cartes « S'entraîner »). */
export function structureChapitre(chapitre: ChapterContent): PartieSection[] {
  return chapitre.sections.map((section) => {
    const vus = new Map<string, number>()
    const sousParties: SousPartie[] = []
    const generateurs: GenerateurChapitre[] = []
    for (const bloc of section.blocks) {
      if (bloc.kind === 'subheading') {
        const base = slugTitre(bloc.text)
        const n = (vus.get(base) ?? 0) + 1
        vus.set(base, n)
        sousParties.push({ id: `${section.id}/${n === 1 ? base : `${base}-${n}`}`, titre: bloc.text })
      } else if (bloc.kind === 'entrainement' && !generateurs.some((g) => g.id === bloc.generatorId)) {
        generateurs.push({ id: bloc.generatorId, titre: bloc.title, chantier: bloc.chantier, sectionId: section.id })
      }
    }
    return { id: section.id, numero: section.number, titre: section.title, sousParties, generateurs }
  })
}

/** Tous les générateurs du chapitre (sections, puis carte de la synthèse), sans doublon. */
export function generateursChapitre(chapitre: ChapterContent): GenerateurChapitre[] {
  const liste = structureChapitre(chapitre).flatMap((s) => s.generateurs)
  const intro = (chapitre.intro?.blocks ?? []).filter((b) => b.kind === 'entrainement')
  for (const b of [...intro, ...(chapitre.recap.entrainement ? [chapitre.recap.entrainement] : [])]) {
    if (b.kind === 'entrainement' && !liste.some((g) => g.id === b.generatorId)) liste.push({ id: b.generatorId, titre: b.title, chantier: b.chantier, sectionId: null })
  }
  return liste
}

/** Unités de progression d'une section : ses sous-parties, ou la section elle-même si elle n'en a pas. */
export function unitesSection(section: PartieSection): string[] {
  return section.sousParties.length > 0 ? section.sousParties.map((p) => p.id) : [section.id]
}

/** Parties cochées (ids d'unités ou de sections) → valeur enregistrée : section entière si toutes
 * ses sous-parties sont cochées, sinon les sous-parties ; ids inconnus du contenu conservés à la fin
 * (contenu modifié depuis : rien n'est perdu). */
export function normaliserParties(coches: Iterable<string>, structure: PartieSection[]): string[] {
  const ensemble = new Set(coches)
  const resultat: string[] = []
  const connus = new Set<string>()
  for (const section of structure) {
    connus.add(section.id)
    section.sousParties.forEach((p) => connus.add(p.id))
    const unites = unitesSection(section)
    if (ensemble.has(section.id) || unites.every((u) => ensemble.has(u))) resultat.push(section.id)
    else resultat.push(...unites.filter((u) => ensemble.has(u)))
  }
  for (const id of ensemble) if (!connus.has(id) && !resultat.includes(id)) resultat.push(id)
  return resultat
}

/** Valeur enregistrée → ensemble des UNITÉS couvertes (une section entière couvre toutes ses
 * sous-parties). */
export function unitesCouvertes(parties: string[], structure: PartieSection[]): Set<string> {
  const couvertes = new Set<string>()
  for (const id of parties) {
    const section = structure.find((s) => s.id === id)
    if (section) unitesSection(section).forEach((u) => couvertes.add(u))
    else couvertes.add(id)
  }
  return couvertes
}

/** Une ligne lisible par partie vue : « 2. Propriétés » (entière) ou « 2. Propriétés : Changement
 * de base, Encadrer… » (sous-parties), avec l'ancre de la section. */
export interface LignePartieVue {
  sectionId: string
  numero: number
  titreSection: string
  /** Sous-parties vues (texte brut) ; vide = section entière. */
  sousParties: string[]
  entiere: boolean
}

export function lignesPartiesVues(parties: string[], structure: PartieSection[]): LignePartieVue[] {
  const couvertes = unitesCouvertes(parties, structure)
  const lignes: LignePartieVue[] = []
  for (const section of structure) {
    const unites = unitesSection(section)
    const vues = unites.filter((u) => couvertes.has(u))
    if (vues.length === 0) continue
    const entiere = vues.length === unites.length
    lignes.push({
      sectionId: section.id,
      numero: section.numero,
      titreSection: texteBrut(section.titre),
      sousParties: entiere ? [] : section.sousParties.filter((p) => couvertes.has(p.id)).map((p) => texteBrut(p.titre)),
      entiere,
    })
  }
  return lignes
}

export function texteLignePartie(l: LignePartieVue): string {
  return l.entiere ? `${l.numero}. ${l.titreSection}` : `${l.numero}. ${l.titreSection} — ${l.sousParties.join(' ; ')}`
}

/* ------------------------------------------------------------------------------- dates, horaire */

const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']

function partiesDate(iso: string): { a: number; m: number; j: number } | null {
  const r = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  if (!r) return null
  return { a: Number(r[1]), m: Number(r[2]), j: Number(r[3]) }
}

/** « jeudi 20 novembre 2026 » (`avecJour` faux : « 20 novembre 2026 »). */
export function dateLongue(iso: string, avecJour = true): string {
  const d = partiesDate(iso)
  if (!d) return iso
  const jour = new Date(Date.UTC(d.a, d.m - 1, d.j)).getUTCDay()
  return `${avecJour ? `${JOURS[jour]} ` : ''}${d.j === 1 ? '1er' : d.j} ${MOIS[d.m - 1]} ${d.a}`
}

/** « 20/11/2026 ». */
export function dateCourte(iso: string): string {
  const d = partiesDate(iso)
  return d ? `${String(d.j).padStart(2, '0')}/${String(d.m).padStart(2, '0')}/${d.a}` : iso
}

/** Jour de la semaine (0 = dimanche) d'une date `AAAA-MM-JJ`. */
export function jourSemaine(iso: string): number {
  const d = partiesDate(iso)
  return d ? new Date(Date.UTC(d.a, d.m - 1, d.j)).getUTCDay() : -1
}

/** Date locale `AAAA-MM-JJ` (aujourd'hui par défaut). */
export function dateIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** « 08:50 » / « 08:50:00 » → minutes depuis minuit ; `null` si vide ou illisible. */
export function minutesHeure(h: string | null | undefined): number | null {
  const r = /^(\d{1,2}):(\d{2})/.exec(h ?? '')
  if (!r) return null
  const v = Number(r[1]) * 60 + Number(r[2])
  return Number(r[1]) < 24 && Number(r[2]) < 60 ? v : null
}

/** Minutes → « 08:50 » (valeur d'un champ `type="time"` et de la colonne `time`). */
export function heureChamp(minutes: number): string {
  const m = ((Math.round(minutes) % 1440) + 1440) % 1440
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

/** « 1re heure », « 3e heure » ; avec `fin` (heure double) : « 1re–2e heures ». Heure zéro (0004) :
 * « heure zéro » (jamais « 0e heure »), « heure zéro et 1re heure », « heure zéro à 2e heure ». */
export function numeroHeureTexte(n: number, fin?: number | null): string {
  const ordinal = (k: number) => `${k}${k === 1 ? 're' : 'e'}`
  const double = fin !== null && fin !== undefined && fin > n
  if (n === 0) return double ? `heure zéro ${fin === 1 ? 'et' : 'à'} ${ordinal(fin)} heure` : 'heure zéro'
  return double ? `${ordinal(n)}–${ordinal(fin)} heures` : `${ordinal(n)} heure`
}

/** Le numéro d'heure est-il renseigné ? (0 = heure zéro, renseigné). */
function aNumero(n: number | null | undefined): n is number {
  return n !== null && n !== undefined
}

/** Plage « 08h50 → 09h40 » (même typographie que l'examen), « 08h50 » sans fin, `null` sans début. */
export function plageTexte(debut: string | null, fin: string | null): string | null {
  const d = minutesHeure(debut)
  if (d === null) return null
  const f = minutesHeure(fin)
  return f === null ? heureTexte(d) : `${heureTexte(d)} → ${heureTexte(f)}`
}

/** Horaire d'une séance selon le format préféré ; l'autre écriture sert de repli. `avecGrille`
 * (l'école de la classe a une grille horaire, 0003) : numéro ET plage ensemble, « H2 (09h35 → 10h25) »,
 * « H1–H2 (08h45 → 10h25) », dès que la séance a les deux. */
export function horaireTexte(s: Pick<Seance, 'heure_debut' | 'heure_fin' | 'numero_heure' | 'numero_heure_fin'>, format: FormatHoraire, avecGrille = false): string | null {
  const plage = plageTexte(s.heure_debut, s.heure_fin)
  if (avecGrille && aNumero(s.numero_heure) && plage) {
    const fin = aNumero(s.numero_heure_fin) && s.numero_heure_fin > s.numero_heure ? s.numero_heure_fin : null
    return `${fin !== null ? `H${s.numero_heure}–H${fin}` : `H${s.numero_heure}`} (${plage})`
  }
  const numero = aNumero(s.numero_heure) ? numeroHeureTexte(s.numero_heure, s.numero_heure_fin) : null
  return format === 'numero' ? (numero ?? plage) : (plage ?? numero)
}

/** Nombre d'heures de cours d'une séance (agenda, synthèse) : heure double « H1–H2 » = 2 (numéros) ;
 * sans numéro de fin (saisie libre, ou 0003 pas appliqué), une plage plus longue qu'une heure compte
 * d'après `dureeHeure` (arrondi, au moins 1 : 08h45 → 10h25 avec des heures de 50 min = 2) ; sinon 1. */
export function heuresSeance(s: Pick<Seance, 'heure_debut' | 'heure_fin' | 'numero_heure' | 'numero_heure_fin'>, dureeHeure: number): number {
  if (aNumero(s.numero_heure) && aNumero(s.numero_heure_fin) && s.numero_heure_fin > s.numero_heure) return s.numero_heure_fin - s.numero_heure + 1
  const d = minutesHeure(s.heure_debut)
  const f = minutesHeure(s.heure_fin)
  if (d !== null && f !== null && f > d && dureeHeure > 0) return Math.max(1, Math.round((f - d) / dureeHeure))
  return 1
}

/** Horaire proposé pour une nouvelle séance : celui de la dernière séance de la classe le même jour
 * de la semaine s'il existe ; sinon l'heure actuelle arrondie aux 5 minutes (plage de `duree`). */
export function horaireParDefaut(
  maintenant: Date,
  duree: number,
  seancesClasse: Pick<Seance, 'date_seance' | 'heure_debut' | 'heure_fin' | 'numero_heure'>[],
  date: string = dateIso(maintenant),
): { heure_debut: string | null; heure_fin: string | null; numero_heure: number | null } {
  const jour = jourSemaine(date)
  const meme = [...seancesClasse]
    .filter((s) => jourSemaine(s.date_seance) === jour && (s.heure_debut || aNumero(s.numero_heure)))
    .sort((a, b) => (a.date_seance < b.date_seance ? 1 : -1))[0]
  if (meme) return { heure_debut: meme.heure_debut ? heureChamp(minutesHeure(meme.heure_debut) ?? 0) : null, heure_fin: meme.heure_fin ? heureChamp(minutesHeure(meme.heure_fin) ?? 0) : null, numero_heure: meme.numero_heure }
  const debut = Math.round((maintenant.getHours() * 60 + maintenant.getMinutes()) / 5) * 5
  const fin = Math.min(debut + duree, 23 * 60 + 59)
  return { heure_debut: heureChamp(debut), heure_fin: fin > debut ? heureChamp(fin) : null, numero_heure: null }
}

/* ---------------------------------------------------------------------------- validations */

export function erreurNomClasse(nom: string): string | null {
  const t = nom.trim()
  if (t === '') return 'Nom de la classe manquant (exemple : « 5e B »).'
  if (t.length > NOM_CLASSE_MAX) return `Nom de la classe trop long : ${NOM_CLASSE_MAX} caractères maximum.`
  return null
}

export interface ErreursSeance {
  classe?: string
  date?: string
  horaire?: string
  chapitre?: string
  devoir?: string
  remarque?: string
  devoirPour?: string
  objectif?: string
}

export function erreursSeance(s: SaisieSeance): ErreursSeance {
  const e: ErreursSeance = {}
  if (!s.classe_id) e.classe = 'Choisis la classe.'
  const d = partiesDate(s.date_seance)
  if (!d || d.a < 2000 || d.a > 2100 || d.m < 1 || d.m > 12 || d.j < 1 || d.j > 31) e.date = 'Date manquante ou illisible.'
  const debut = minutesHeure(s.heure_debut)
  const fin = minutesHeure(s.heure_fin)
  if (s.heure_debut && debut === null) e.horaire = 'Heure de début illisible : écris par exemple 08:50.'
  else if (s.heure_fin && fin === null) e.horaire = 'Heure de fin illisible : écris par exemple 09:40.'
  else if (fin !== null && debut === null) e.horaire = 'Indique aussi l’heure de début.'
  else if (fin !== null && debut !== null && fin <= debut) e.horaire = 'L’heure de fin doit suivre l’heure de début.'
  if (s.numero_heure !== null && (s.numero_heure < 0 || s.numero_heure > NUMERO_HEURE_MAX)) e.horaire = `Numéro d’heure : de 0 (heure zéro) à ${NUMERO_HEURE_MAX}.`
  const nFin = s.numero_heure_fin ?? null
  if (nFin !== null && (s.numero_heure === null || nFin <= s.numero_heure || nFin > NUMERO_HEURE_MAX)) e.horaire = 'Heure double : la dernière heure doit suivre la première.'
  if (!s.niveau || !s.chapitre) e.chapitre = 'Choisis le chapitre.'
  if (s.devoir.length > DEVOIR_MAX) e.devoir = `Devoir trop long : ${DEVOIR_MAX} caractères maximum.`
  if (s.remarque.length > REMARQUE_MAX) e.remarque = `Remarque trop longue : ${REMARQUE_MAX} caractères maximum.`
  const pour = s.devoir_pour ? partiesDate(s.devoir_pour) : null
  if (s.devoir_pour && (!pour || pour.a < 2000 || pour.a > 2100)) e.devoirPour = 'Date de remise illisible.'
  else if (s.devoir_pour && s.devoir_pour < s.date_seance) e.devoirPour = 'Le devoir est à rendre après la séance : choisis une date qui suit.'
  else if (s.devoir_pour && d && Date.parse(s.devoir_pour) - Date.parse(s.date_seance.slice(0, 10)) > 366 * 86_400_000) e.devoirPour = 'Date de remise trop lointaine (un an au plus).'
  if ((s.objectif ?? '').length > OBJECTIF_MAX) e.objectif = `Objectif trop long : ${OBJECTIF_MAX} caractères maximum.`
  return e
}

/* ------------------------------------------------------------- texte « Copier pour Smartschool » */

export interface SeanceResolue {
  date: string
  horaire: string | null
  classe: string
  ecole: string
  /** `numero` : numéro IMPRIMÉ (texte Smartschool, fiche, agenda — vus par les élèves et leurs parents) = celui
   * du professeur s'il a rangé ses chapitres, sinon `null` (titre seul, jamais le numéro du site) ;
   * `repere` : numéro montré au professeur dans le carnet (le sien, à défaut celui du site). */
  chapitre: { numero: number | null; repere: number; titre: string; niveau: string; url: string } | null
  parties: { texte: string; url: string }[]
  generateurs: { titre: string; url: string }[]
  devoir: string
  remarque: string
}

/** Rassemble tout ce qu'il faut pour le texte Smartschool et la fiche. `lienGenerateur` reçoit
 * `(chantier, id)` et rend un lien (absolu ou relatif au site). */
export function resoudreSeance(
  seance: Seance,
  classe: Pick<Classe, 'nom'>,
  options: { format: FormatHoraire; ecole?: string; lienGenerateur?: (chantier: string, id: string) => string; avecGrille?: boolean },
): SeanceResolue {
  const chapitre = findChapter(seance.niveau, seance.chapitre)
  const base = `${SITE_URL}/${seance.niveau}/${seance.chapitre}`
  const structure = chapitre ? structureChapitre(chapitre) : []
  const absolu = (u: string) => (u.startsWith('/') ? SITE_URL + u : u)
  const generateurs = chapitre
    ? generateursChapitre(chapitre)
        .filter((g) => seance.generateurs.includes(g.id))
        .map((g) => ({ titre: g.titre, url: options.lienGenerateur ? absolu(options.lienGenerateur(g.chantier, g.id)) : '' }))
    : seance.generateurs.map((id) => ({ titre: id, url: '' }))
  return {
    date: seance.date_seance,
    horaire: horaireTexte(seance, options.format, options.avecGrille ?? false),
    classe: classe.nom.trim(),
    ecole: options.ecole?.trim() ?? '',
    chapitre: chapitre ? { numero: numeroAffiche(chapitre), repere: numeroRepere(chapitre), titre: texteBrut(chapitre.title), niveau: chapitre.level, url: base } : null,
    parties: lignesPartiesVues(seance.parties, structure).map((l) => ({ texte: texteLignePartie(l), url: `${base}#${l.sectionId}` })),
    generateurs,
    devoir: seance.devoir.trim(),
    remarque: seance.remarque.trim(),
  }
}

function capitale(t: string): string {
  return t.charAt(0).toUpperCase() + t.slice(1)
}

/** En-tête « Jeudi 20 novembre 2026 · 08h50 → 09h40 · 5e B ». */
export function enteteSeance(r: SeanceResolue): string {
  return [capitale(dateLongue(r.date)), r.horaire, r.classe].filter(Boolean).join(' · ')
}

/** Options de sortie (agenda d'une période) : `liens` faux retire les adresses, `remarque` vrai ajoute
 * la remarque libre. Par défaut (une séance) : liens, et JAMAIS la remarque. */
export interface OptionsTexteSeance {
  liens?: boolean
  remarque?: boolean
}

/** Texte brut à coller dans Smartschool (journal de classe, message) : date, horaire, classe,
 * chapitre, parties vues avec le lien de leur section, générateurs utilisés, devoir. La remarque
 * libre est une note du professeur : jamais copiée (sauf demande explicite, `remarque: true`). */
export function texteSmartschool(r: SeanceResolue, options: OptionsTexteSeance = {}): string {
  const liens = options.liens ?? true
  const lignes: string[] = [enteteSeance(r)]
  if (r.chapitre) lignes.push(r.chapitre.numero !== null ? `Chapitre ${r.chapitre.numero} — ${r.chapitre.titre}` : r.chapitre.titre)
  if (r.parties.length > 0) {
    lignes.push('', 'Vu en classe :')
    for (const p of r.parties) lignes.push(`• ${p.texte}`, ...(liens ? [`  ${p.url}`] : []))
  } else if (r.chapitre && liens) {
    lignes.push(r.chapitre.url)
  }
  if (r.generateurs.length > 0) {
    lignes.push('', 'Pour s’entraîner :')
    for (const g of r.generateurs) lignes.push(`• ${g.titre}`, ...(g.url && liens ? [`  ${g.url}`] : []))
  }
  if (r.devoir) lignes.push('', `Devoir : ${r.devoir}`)
  if (options.remarque && r.remarque) lignes.push('', `Remarque : ${r.remarque}`)
  return lignes.join('\n')
}

export function echapperHtml(t: string): string {
  return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/** Même contenu en HTML simple (liens cliquables quand l'éditeur de Smartschool accepte le collage riche). */
export function htmlSmartschool(r: SeanceResolue, options: OptionsTexteSeance = {}): string {
  const liens = options.liens ?? true
  const lien = (url: string, texte: string) => (liens && url ? `<a href="${echapperHtml(url)}">${echapperHtml(texte)}</a>` : echapperHtml(texte))
  const h: string[] = [`<p><strong>${echapperHtml(enteteSeance(r))}</strong>`]
  if (r.chapitre) h.push(`<br>${r.chapitre.numero !== null ? `Chapitre ${r.chapitre.numero} — ` : ''}${lien(r.chapitre.url, r.chapitre.titre)}`)
  h.push('</p>')
  if (r.parties.length > 0) {
    h.push('<p>Vu en classe :</p><ul>')
    for (const p of r.parties) h.push(`<li>${lien(p.url, p.texte)}</li>`)
    h.push('</ul>')
  }
  if (r.generateurs.length > 0) {
    h.push('<p>Pour s’entraîner :</p><ul>')
    for (const g of r.generateurs) h.push(`<li>${lien(g.url, g.titre)}</li>`)
    h.push('</ul>')
  }
  if (r.devoir) h.push(`<p><strong>Devoir :</strong> ${echapperHtml(r.devoir).replace(/\n/g, '<br>')}</p>`)
  if (options.remarque && r.remarque) h.push(`<p><strong>Remarque :</strong> ${echapperHtml(r.remarque).replace(/\n/g, '<br>')}</p>`)
  return h.join('')
}

/* --------------------------------------------------------------------------- progression */

export interface UniteProgression {
  id: string
  titre: string
  /** Date de la première séance qui l'a vue (`AAAA-MM-JJ`), `null` si pas encore vue. */
  premiereFois: string | null
  seances: number
}

export interface SectionProgression {
  id: string
  numero: number
  titre: string
  unites: UniteProgression[]
  vues: number
  total: number
  premiereFois: string | null
}

export interface ChapitreProgression {
  levelSlug: string
  slug: string
  numero: number
  titre: string
  sections: SectionProgression[]
  vues: number
  total: number
  derniereSeance: string | null
}

/** Chapitres à montrer pour une classe : ceux de son niveau (dans l'ordre du professeur, à défaut
 * celui du site — « Mon ordre des chapitres »), puis ceux des séances qui n'en font pas partie. */
export function chapitresDeLaClasse(classe: Pick<Classe, 'niveau'>, seances: Pick<Seance, 'niveau' | 'chapitre'>[]): ChapterContent[] {
  const liste: ChapterContent[] = classe.niveau ? chapitresDansMonOrdre(classe.niveau, ordreCourant()) : []
  for (const s of seances) {
    const c = findChapter(s.niveau, s.chapitre)
    if (c && !liste.includes(c)) liste.push(c)
  }
  return liste
}

/** Progression d'UNE classe : pour chaque chapitre, les unités (sous-parties, ou sections sans
 * sous-partie) vues avec la date de la première fois, et celles qui restent. */
export function progressionClasse(seances: Seance[], chapitres: ChapterContent[]): ChapitreProgression[] {
  const triees = [...seances].sort((a, b) => (a.date_seance < b.date_seance ? -1 : a.date_seance > b.date_seance ? 1 : a.cree_le < b.cree_le ? -1 : 1))
  return chapitres.map((chapitre) => {
    const structure = structureChapitre(chapitre)
    const premiere = new Map<string, string>()
    const nombre = new Map<string, number>()
    let derniere: string | null = null
    for (const s of triees) {
      if (s.niveau !== chapitre.levelSlug || s.chapitre !== chapitre.slug) continue
      derniere = s.date_seance
      for (const u of unitesCouvertes(s.parties, structure)) {
        if (!premiere.has(u)) premiere.set(u, s.date_seance)
        nombre.set(u, (nombre.get(u) ?? 0) + 1)
      }
    }
    const sections = structure.map((section) => {
      const unites: UniteProgression[] =
        section.sousParties.length > 0
          ? section.sousParties.map((p) => ({ id: p.id, titre: texteBrut(p.titre), premiereFois: premiere.get(p.id) ?? null, seances: nombre.get(p.id) ?? 0 }))
          : [{ id: section.id, titre: texteBrut(section.titre), premiereFois: premiere.get(section.id) ?? null, seances: nombre.get(section.id) ?? 0 }]
      const dates = unites.map((u) => u.premiereFois).filter((d): d is string => d !== null).sort()
      return { id: section.id, numero: section.numero, titre: texteBrut(section.titre), unites, vues: dates.length, total: unites.length, premiereFois: dates[0] ?? null }
    })
    return {
      levelSlug: chapitre.levelSlug,
      slug: chapitre.slug,
      numero: numeroRepere(chapitre),
      titre: texteBrut(chapitre.title),
      sections,
      vues: sections.reduce((t, s) => t + s.vues, 0),
      total: sections.reduce((t, s) => t + s.total, 0),
      derniereSeance: derniere,
    }
  })
}

/* ----------------------------------------------------------- matière vue depuis une date */

export interface ResultatMatiere {
  matiere: MatiereVue | null
  /** Séances prises en compte. */
  seances: number
  /** Niveaux écartés (séances d'un autre niveau que celui retenu). */
  autresNiveaux: string[]
}

/** Sections vues depuis `depuis` (incluse) par les séances données (d'UNE classe) : une section
 * compte dès qu'une de ses sous-parties est cochée. Un seul niveau (le panneau n'en traite qu'un) :
 * celui qui a le plus de séances ; les autres sont signalés. Ordre : celui du site. */
export function matiereDepuis(seances: Seance[], depuis: string): ResultatMatiere {
  const retenues = seances.filter((s) => s.date_seance >= depuis && s.parties.length > 0)
  if (retenues.length === 0) return { matiere: null, seances: 0, autresNiveaux: [] }
  const parNiveau = new Map<string, number>()
  retenues.forEach((s) => parNiveau.set(s.niveau, (parNiveau.get(s.niveau) ?? 0) + 1))
  const niveau = [...parNiveau.entries()].sort((a, b) => b[1] - a[1])[0][0]
  const level = LEVELS.find((l) => l.slug === niveau)
  const chapitres: MatiereVue['chapitres'] = []
  for (const chapitre of level?.chapters ?? []) {
    const duChapitre = retenues.filter((s) => s.niveau === niveau && s.chapitre === chapitre.slug)
    if (duChapitre.length === 0) continue
    const structure = structureChapitre(chapitre)
    const couvertes = new Set(duChapitre.flatMap((s) => [...unitesCouvertes(s.parties, structure)]))
    const sections = structure.filter((sec) => unitesSection(sec).some((u) => couvertes.has(u))).map((sec) => sec.id)
    if (sections.length > 0) chapitres.push({ slug: chapitre.slug, sections })
  }
  return {
    matiere: chapitres.length > 0 ? { levelSlug: niveau, chapitres } : null,
    seances: retenues.filter((s) => s.niveau === niveau).length,
    autresNiveaux: [...parNiveau.keys()].filter((n) => n !== niveau),
  }
}

/** Libellé d'un niveau (« 5e (4h) »). */
export function libelleNiveau(slug: string | null): string {
  return LEVELS.find((l) => l.slug === slug)?.label ?? slug ?? ''
}
