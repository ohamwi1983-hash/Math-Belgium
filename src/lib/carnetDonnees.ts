/**
 * Carnet de matière vue — accès aux tables `classes`, `seances`, `carnet_reglages`
 * (`supabase/migrations/0002_carnet.sql`). Même principe que `compteDonnees.ts` : client injecté,
 * erreurs traduites ; en plus, `ErreurCarnet.tableAbsente` signale que 0002 n'est pas encore
 * appliqué (la page affiche alors « Carnet pas encore activé », jamais un plantage).
 *
 * Sous-ensemble de l'API utilisé (imité par le faux client des tests) : `from(t).select().order()`,
 * `.eq()`, `.maybeSingle()`, `insert(…).select().single()`, `update(…).eq().select().single()`,
 * `delete().eq()`.
 *
 * Horaire (`0003_horaire.sql`, tables `horaires_ecoles` et `horaire_cases`, colonne
 * `seances.numero_heure_fin`) : FACULTATIF. `chargerHoraire` renvoie `actif: false` si 0003 n'est pas
 * appliqué, et les séances sont alors lues / écrites sans `numero_heure_fin` — le carnet marche
 * comme avant.
 *
 * Heure zéro (`0004_heure_zero.sql`, colonne `horaires_ecoles.heure_zero`, numéro 0 accepté) :
 * FACULTATIVE aussi. Sans 0004, `chargerHoraire` renvoie `heureZero: false` (grilles relues sans la
 * colonne) et le site n'écrit jamais ni la colonne ni le numéro 0.
 *
 * Devoirs, évaluations et texte en rubriques (`0007_devoirs_evaluations.sql`, colonnes de `seances`
 * et de `carnet_reglages`) : FACULTATIFS. `chargerSeances` relit sans ces colonnes si 0007 n'est pas
 * appliqué (`devoirs: false`), et le site ne les écrit alors jamais.
 *
 * Générateurs retenus pour une évaluation (`0008_evaluation_generateurs.sql`, colonne
 * `seances.evaluation_generateurs`) : FACULTATIFS aussi. `chargerSeances` relit sans la colonne si 0008
 * n'est pas appliqué (`generateursEval: false`), et le site ne l'écrit alors jamais.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { messageErreur } from './compteValidation'
import { REGLAGES_DEFAUT, type Classe, type ReglagesCarnet, type SaisieSeance, type Seance } from './carnet'
import { lireCompetences, lireRubriques, type Rubriques } from './carnetDevoirs'
import { nettoyerGrille, type CaseHoraire, type GrilleHoraire, type SaisieGrille } from './horaire'

/** Codes renvoyés quand une table n'existe pas encore (PostgREST : cache de schéma ; Postgres). */
const CODES_TABLE_ABSENTE = new Set(['PGRST205', 'PGRST204', '42P01', 'PGRST202'])

export class ErreurCarnet extends Error {
  readonly tableAbsente: boolean
  readonly code: string
  constructor(brute: unknown) {
    const b = (brute ?? {}) as { code?: string; message?: string }
    const code = String(b.code ?? '')
    const absente = CODES_TABLE_ABSENTE.has(code) || /could not find the table|relation .* does not exist|schema cache/i.test(String(b.message ?? ''))
    let message: string
    if (absente) message = 'Carnet pas encore activé.'
    else if (code === '23514' && /seances_devoir_pour_valide/i.test(String(b.message ?? ''))) message = 'Date de remise du devoir refusée : elle doit suivre la séance (un an au plus).'
    else if (code === '23514' && /seances_evaluation_generateurs/i.test(String(b.message ?? ''))) message = 'Exercices de l’évaluation refusés par le serveur (liste trop longue ou évaluation retirée) : vérifie le bloc Évaluation.'
    else if (code === '23514' && /seances_(devoir_generateurs|objectif|competences|evaluation)/i.test(String(b.message ?? ''))) message = 'Devoir ou évaluation refusé par le serveur (valeur hors limites) : vérifie le formulaire.'
    else if (code === '23514' && /carnet_reglages_(rubriques|competences)/i.test(String(b.message ?? ''))) message = 'Réglage du texte refusé par le serveur : recharge la page.'
    else if (code === '23503' && /seances_evaluation_evenement/i.test(String(b.message ?? ''))) message = 'Interrogation introuvable dans l’agenda (supprimée ?) : recharge la page.'
    else if (code === '23505' && /periodes_bulletin/i.test(String(b.message ?? ''))) message = 'Une autre période a déjà ce numéro ou cette date (autre onglet ?) : recharge la page.'
    else if (code === '23505' && /evenements/i.test(String(b.message ?? ''))) message = 'Cette classe est déjà dans l’événement : recharge la page.'
    // Ancienne version de 0006 (sans « absence_professeur ») encore en place dans la base.
    else if (code === '23514' && /evenements_type_check/i.test(String(b.message ?? ''))) message = 'Type d’événement inconnu du serveur : recolle tout le fichier supabase/migrations/0006_agenda.sql dans l’éditeur SQL de Supabase (SQL Editor → New query → coller → Run), puis réessaie.'
    else if (code === '23514' && /evenement|periodes_bulletin|seuil/i.test(String(b.message ?? ''))) message = 'Événement ou période refusé par le serveur (dates, heures ou classes incohérentes) : vérifie le formulaire.'
    else if (code === '23505' && /horaire/i.test(String(b.message ?? ''))) message = 'Cette case de l’horaire est déjà remplie (autre onglet ?) : recharge la page.'
    else if (code === '23505') message = 'Une classe porte déjà ce nom dans cette école.'
    else if (code === '23514' && /horaire/i.test(String(b.message ?? ''))) message = 'Grille horaire refusée par le serveur (valeur hors limites) : vérifie les heures et les pauses.'
    else if (code === '23503') message = 'École ou classe introuvable (elle a peut-être été supprimée) : recharge la page.'
    else message = messageErreur(brute)
    super(message)
    this.name = 'ErreurCompte'
    this.tableAbsente = absente
    this.code = code
  }
}

function verifier<T>(res: { data?: T; error: unknown }): T {
  if (res.error) throw new ErreurCarnet(res.error)
  return res.data as T
}

const COLONNES_CLASSE = 'id, ecole_id, nom, niveau, cree_le'
const COLONNES_SEANCE = 'id, classe_id, date_seance, heure_debut, heure_fin, numero_heure, niveau, chapitre, parties, generateurs, devoir, remarque, cree_le, modifie_le'
/** Avec 0003 : la dernière heure d'une heure double en plus. */
const COLONNES_SEANCE_HORAIRE: string = `${COLONNES_SEANCE}, numero_heure_fin`
/** Avec 0007 : devoir (date, exercices joints), objectif, compétences, évaluation. */
const COLONNES_0007 = 'devoir_pour, devoir_generateurs, objectif, competences, evaluation_type, evaluation_parties, evaluation_evenement'
/** Avec 0008 : générateurs retenus pour l'évaluation. */
const COLONNES_0008 = 'evaluation_generateurs'
const NOMS_0007 = /devoir_pour|devoir_generateurs|objectif|competences|evaluation_type|evaluation_parties|evaluation_evenement|rubriques|competences_transversales/i

/** Colonne de 0008 inconnue : 0008 pas appliqué (même détection que 0007). */
export function colonne0008Absente(erreur: unknown): boolean {
  const e = (erreur ?? {}) as { code?: string; message?: string }
  return /evaluation_generateurs/i.test(String(e.message ?? '')) && (e.code === '42703' || e.code === 'PGRST204' || /does not exist|schema cache|could not find/i.test(String(e.message ?? '')))
}

/** Colonne de 0007 inconnue : 0007 pas appliqué (Postgres 42703 en lecture, PGRST204 en écriture). */
export function colonne0007Absente(erreur: unknown): boolean {
  const e = (erreur ?? {}) as { code?: string; message?: string }
  return NOMS_0007.test(String(e.message ?? '')) && (e.code === '42703' || e.code === 'PGRST204' || /does not exist|schema cache|could not find/i.test(String(e.message ?? '')))
}
const COLONNES_GRILLE = 'ecole_id, debut, duree_heure, nombre_heures, pauses, heures_mercredi, exceptions'
/** Avec 0004 : l'heure zéro en plus. */
const COLONNES_GRILLE_H0: string = `${COLONNES_GRILLE}, heure_zero`
const COLONNES_CASE = 'id, ecole_id, jour, heure, classe_id, semaine, cree_le'

/* ------------------------------------------------------------------------------- classes */

export async function listerClasses(c: SupabaseClient): Promise<Classe[]> {
  return (verifier(await c.from('classes').select(COLONNES_CLASSE).order('nom', { ascending: true })) ?? []) as Classe[]
}

export async function ajouterClasse(c: SupabaseClient, saisie: { nom: string; ecole_id: string; niveau: string | null }): Promise<Classe> {
  return verifier(await c.from('classes').insert({ nom: saisie.nom.trim(), ecole_id: saisie.ecole_id, niveau: saisie.niveau || null }).select(COLONNES_CLASSE).single()) as Classe
}

export async function modifierClasse(c: SupabaseClient, id: string, saisie: { nom: string; ecole_id: string; niveau: string | null }): Promise<void> {
  verifier(await c.from('classes').update({ nom: saisie.nom.trim(), ecole_id: saisie.ecole_id, niveau: saisie.niveau || null }).eq('id', id))
}

/** Supprime la classe ET ses séances (cascade côté base). */
export async function supprimerClasse(c: SupabaseClient, id: string): Promise<void> {
  verifier(await c.from('classes').delete().eq('id', id))
}

/* ------------------------------------------------------------------------------- séances */

const textes = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [])

function nettoyer(s: Seance): Seance {
  const base: Seance = { ...s, parties: Array.isArray(s.parties) ? s.parties : [], generateurs: Array.isArray(s.generateurs) ? s.generateurs : [], devoir: s.devoir ?? '', remarque: s.remarque ?? '' }
  if (!('devoir_generateurs' in s)) return base
  return {
    ...base,
    devoir_pour: s.devoir_pour ?? null,
    devoir_generateurs: textes(s.devoir_generateurs),
    objectif: s.objectif ?? '',
    competences: textes(s.competences),
    evaluation_type: s.evaluation_type ?? null,
    evaluation_parties: textes(s.evaluation_parties),
    evaluation_evenement: s.evaluation_evenement ?? null,
    ...('evaluation_generateurs' in s ? { evaluation_generateurs: textes(s.evaluation_generateurs) } : {}),
  }
}

function colonnesSeance(horaire: boolean, devoirs: boolean, generateursEval = false): string {
  return `${horaire ? COLONNES_SEANCE_HORAIRE : COLONNES_SEANCE}${devoirs ? `, ${COLONNES_0007}` : ''}${devoirs && generateursEval ? `, ${COLONNES_0008}` : ''}`
}

/** `horaire` : 0003 appliqué (colonne `numero_heure_fin` présente) ; `devoirs` : 0007 appliqué ;
 * `generateursEval` : 0008 appliqué. */
export async function listerSeances(c: SupabaseClient, horaire = false, devoirs = false, generateursEval = false): Promise<Seance[]> {
  const liste = (verifier(await c.from('seances').select(colonnesSeance(horaire, devoirs, generateursEval)).order('date_seance', { ascending: false })) ?? []) as unknown as Seance[]
  return liste.map(nettoyer)
}

/** Séances avec les colonnes de 0007 et de 0008 si elles existent ; sinon sans (`generateursEval: false`
 * sans 0008, `devoirs: false` sans 0007 : carnet d'avant). */
export async function chargerSeances(c: SupabaseClient, horaire = false): Promise<{ seances: Seance[]; devoirs: boolean; generateursEval: boolean }> {
  const avec = await c.from('seances').select(colonnesSeance(horaire, true, true)).order('date_seance', { ascending: false })
  if (avec.error && colonne0008Absente(avec.error)) {
    const sans8 = await c.from('seances').select(colonnesSeance(horaire, true)).order('date_seance', { ascending: false })
    if (sans8.error && colonne0007Absente(sans8.error)) return { seances: await listerSeances(c, horaire, false), devoirs: false, generateursEval: false }
    return { seances: ((verifier(sans8) ?? []) as unknown as Seance[]).map(nettoyer), devoirs: true, generateursEval: false }
  }
  if (avec.error && colonne0007Absente(avec.error)) return { seances: await listerSeances(c, horaire, false), devoirs: false, generateursEval: false }
  return { seances: ((verifier(avec) ?? []) as unknown as Seance[]).map(nettoyer), devoirs: true, generateursEval: true }
}

function ligneSeance(s: SaisieSeance, horaire: boolean, devoirs = false, generateursEval = false): Record<string, unknown> {
  const evaluation = devoirs ? (s.evaluation_type ?? null) : null
  const avec0007 = devoirs
    ? {
        devoir_pour: s.devoir_pour || null,
        devoir_generateurs: s.devoir_generateurs ?? [],
        objectif: (s.objectif ?? '').replace(/\s+/g, ' ').trim(),
        competences: s.competences ?? [],
        evaluation_type: evaluation,
        evaluation_parties: evaluation ? (s.evaluation_parties ?? []) : [],
        evaluation_evenement: evaluation === 'annonce' || evaluation === 'bilan' ? (s.evaluation_evenement ?? null) : null,
        ...(generateursEval ? { evaluation_generateurs: evaluation ? (s.evaluation_generateurs ?? []) : [] } : {}),
      }
    : {}
  const heureDouble = horaire ? { numero_heure_fin: s.numero_heure !== null && s.numero_heure_fin !== null && s.numero_heure_fin !== undefined && s.numero_heure_fin > s.numero_heure ? s.numero_heure_fin : null } : {}
  return {
    ...heureDouble,
    classe_id: s.classe_id,
    date_seance: s.date_seance,
    heure_debut: s.heure_debut || null,
    heure_fin: s.heure_debut ? s.heure_fin || null : null,
    numero_heure: s.numero_heure,
    niveau: s.niveau,
    chapitre: s.chapitre,
    parties: s.parties,
    generateurs: s.generateurs,
    devoir: s.devoir.trim(),
    remarque: s.remarque.trim(),
    ...avec0007,
  }
}

export async function ajouterSeance(c: SupabaseClient, s: SaisieSeance, horaire = false, devoirs = false, generateursEval = false): Promise<Seance> {
  return nettoyer(verifier(await c.from('seances').insert(ligneSeance(s, horaire, devoirs, generateursEval)).select(colonnesSeance(horaire, devoirs, generateursEval)).single()) as unknown as Seance)
}

export async function modifierSeance(c: SupabaseClient, id: string, s: SaisieSeance, horaire = false, devoirs = false, generateursEval = false): Promise<void> {
  verifier(await c.from('seances').update(ligneSeance(s, horaire, devoirs, generateursEval)).eq('id', id))
}

/* ------------------------------------------------------- compétences évaluées (0013, facultative) */

/** Colonne de 0013 inconnue : migration pas appliquée. */
export function colonne0013Absente(erreur: unknown): boolean {
  const e = (erreur ?? {}) as { code?: string; message?: string }
  return /evaluation_competences/i.test(String(e.message ?? '')) && (e.code === '42703' || e.code === 'PGRST204' || /does not exist|schema cache|could not find/i.test(String(e.message ?? '')))
}

/** Compétences évaluées des séances qui annoncent une évaluation (`seances.evaluation_competences`, 0013), lues
 * À PART des séances : sans 0013, `{ actif: false }` et le carnet marche comme avant (compétences déduites). */
export async function lireCompetencesEvaluation(c: SupabaseClient): Promise<{ actif: false } | { actif: true; parSeance: Map<string, number[]> }> {
  const r = await c.from('seances').select('id, evaluation_competences').not('evaluation_type', 'is', null)
  if (r.error && (colonne0013Absente(r.error) || colonne0007Absente(r.error))) return { actif: false }
  const lignes = (verifier(r) ?? []) as unknown as { id: string; evaluation_competences: unknown }[]
  const parSeance = new Map<string, number[]>()
  for (const l of lignes) {
    const v = Array.isArray(l.evaluation_competences) ? l.evaluation_competences.filter((x): x is number => x === 1 || x === 2 || x === 3) : []
    if (v.length > 0) parSeance.set(l.id, v)
  }
  return { actif: true, parSeance }
}

/** Enregistre les compétences évaluées d'une séance d'annonce (0013) ; `[]` les retire. */
export async function enregistrerCompetencesEvaluation(c: SupabaseClient, seanceId: string, competences: number[]): Promise<void> {
  verifier(await c.from('seances').update({ evaluation_competences: competences }).eq('id', seanceId))
}

/** Objectif et compétences transversales d'une séance (panneau « Texte pour l'agenda scolaire », 0007). */
export async function enregistrerTexteSeance(c: SupabaseClient, id: string, valeurs: { objectif: string; competences: string[] }): Promise<void> {
  verifier(await c.from('seances').update({ objectif: valeurs.objectif.replace(/\s+/g, ' ').trim(), competences: valeurs.competences }).eq('id', id))
}

export async function supprimerSeance(c: SupabaseClient, id: string): Promise<void> {
  verifier(await c.from('seances').delete().eq('id', id))
}

/* ------------------------------------------------------------------------------- réglages */

export async function lireReglages(c: SupabaseClient): Promise<{ reglages: ReglagesCarnet; existe: boolean }> {
  const ligne = verifier(await c.from('carnet_reglages').select('format_horaire, duree_heure').maybeSingle()) as ReglagesCarnet | null
  return ligne ? { reglages: { ...REGLAGES_DEFAUT, ...ligne }, existe: true } : { reglages: REGLAGES_DEFAUT, existe: false }
}

export async function enregistrerReglages(c: SupabaseClient, reglages: ReglagesCarnet, existe: boolean, proprietaire: string): Promise<void> {
  if (existe) verifier(await c.from('carnet_reglages').update({ format_horaire: reglages.format_horaire, duree_heure: reglages.duree_heure }).eq('proprietaire', proprietaire))
  else verifier(await c.from('carnet_reglages').insert({ format_horaire: reglages.format_horaire, duree_heure: reglages.duree_heure }))
}

/** Réglages du texte pour l'agenda scolaire (0007) : rubriques activées, liste des compétences
 * transversales. `actif: false` : 0007 pas appliqué (défauts, rien n'est mémorisé). */
export interface ReglagesTexte {
  actif: boolean
  rubriques: Rubriques
  competences: string[]
}

export async function lireReglagesTexte(c: SupabaseClient): Promise<ReglagesTexte> {
  const res = await c.from('carnet_reglages').select('rubriques, competences_transversales').maybeSingle()
  if (res.error && colonne0007Absente(res.error)) return { actif: false, rubriques: lireRubriques(null), competences: lireCompetences(null) }
  const ligne = verifier(res) as { rubriques?: unknown; competences_transversales?: unknown } | null
  return { actif: true, rubriques: lireRubriques(ligne?.rubriques ?? null), competences: lireCompetences(ligne?.competences_transversales ?? null) }
}

/** Enregistre les rubriques et / ou la liste des compétences (ligne de réglages créée si besoin). */
export async function enregistrerReglagesTexte(c: SupabaseClient, valeurs: { rubriques?: Rubriques; competences?: string[] }, existe: boolean, proprietaire: string): Promise<void> {
  const ligne: Record<string, unknown> = {}
  if (valeurs.rubriques) ligne.rubriques = valeurs.rubriques
  if (valeurs.competences) ligne.competences_transversales = valeurs.competences
  if (existe) verifier(await c.from('carnet_reglages').update(ligne).eq('proprietaire', proprietaire))
  else verifier(await c.from('carnet_reglages').insert(ligne))
}

/* ------------------------------------------------------------------------------- horaire (0003) */

export interface DonneesHoraire {
  /** Faux : 0003 pas encore appliqué (« Horaire pas encore activé »). */
  actif: boolean
  /** Faux : 0004 pas encore appliqué (case « heure zéro » désactivée, aucun numéro 0 écrit). */
  heureZero: boolean
  grilles: GrilleHoraire[]
  cases: CaseHoraire[]
}

/** Colonne `heure_zero` inconnue : 0004 pas appliqué (Postgres 42703 en lecture, PGRST204 en écriture). */
function colonneHeureZeroAbsente(erreur: unknown): boolean {
  const e = (erreur ?? {}) as { code?: string; message?: string }
  return /heure_zero/i.test(String(e.message ?? '')) && (e.code === '42703' || e.code === 'PGRST204' || /does not exist|schema cache|could not find/i.test(String(e.message ?? '')))
}

/** Grilles avec l'heure zéro si 0004 est appliqué, sinon sans (`heureZero: false`). */
async function lireGrilles(c: SupabaseClient): Promise<{ grilles: GrilleHoraire[]; heureZero: boolean }> {
  const avec = await c.from('horaires_ecoles').select(COLONNES_GRILLE_H0).order('ecole_id', { ascending: true })
  if (avec.error && colonneHeureZeroAbsente(avec.error)) {
    const sans = await c.from('horaires_ecoles').select(COLONNES_GRILLE).order('ecole_id', { ascending: true })
    return { grilles: ((verifier(sans) ?? []) as unknown as GrilleHoraire[]).map((g) => nettoyerGrille({ ...g, heure_zero: false })), heureZero: false }
  }
  return { grilles: ((verifier(avec) ?? []) as unknown as GrilleHoraire[]).map(nettoyerGrille), heureZero: true }
}

/** Grilles et cases du professeur ; `actif: false` (sans erreur) si les tables n'existent pas. */
export async function chargerHoraire(c: SupabaseClient): Promise<DonneesHoraire> {
  try {
    const [g, cases] = await Promise.all([lireGrilles(c), c.from('horaire_cases').select(COLONNES_CASE).order('heure', { ascending: true })])
    return {
      actif: true,
      heureZero: g.heureZero,
      grilles: g.grilles,
      // Sans 0004, une case H0 ne peut pas exister ; par prudence elle est ignorée.
      cases: ((verifier(cases) ?? []) as CaseHoraire[]).map((x) => ({ ...x, semaine: x.semaine ?? null })).filter((x) => g.heureZero || x.heure >= 1),
    }
  } catch (ex) {
    if (ex instanceof ErreurCarnet && ex.tableAbsente) return { actif: false, heureZero: false, grilles: [], cases: [] }
    throw ex
  }
}

/** Ligne écrite en base. Sans 0004 (`heureZero` faux) : ni la colonne `heure_zero` ni une
 * correction de H0. */
function ligneGrille(g: SaisieGrille, heureZero: boolean) {
  const h0 = heureZero && g.heure_zero === true
  return {
    ...(heureZero ? { heure_zero: h0 } : {}),
    debut: g.debut,
    duree_heure: g.duree_heure,
    nombre_heures: g.nombre_heures,
    pauses: g.pauses.map((p) => ({ apres: p.apres, duree: p.duree, type: p.type })),
    heures_mercredi: g.heures_mercredi,
    exceptions: g.exceptions.filter((x) => h0 || x.heure >= 1).map((x) => ({ heure: x.heure, debut: x.debut, fin: x.fin })),
  }
}

/** Crée ou remplace la grille d'une école ; retire d'abord les cases devenues hors grille (H0
 * décochée comprise). `heureZero` : 0004 appliqué. */
export async function enregistrerGrille(c: SupabaseClient, ecoleId: string, g: SaisieGrille, existe: boolean, casesARetirer: string[] = [], heureZero = false): Promise<void> {
  for (const id of casesARetirer) verifier(await c.from('horaire_cases').delete().eq('id', id))
  if (existe) verifier(await c.from('horaires_ecoles').update(ligneGrille(g, heureZero)).eq('ecole_id', ecoleId))
  else verifier(await c.from('horaires_ecoles').insert({ ecole_id: ecoleId, ...ligneGrille(g, heureZero) }))
}

/** Retire la grille d'une école ET son horaire de la semaine. */
export async function supprimerGrille(c: SupabaseClient, ecoleId: string): Promise<void> {
  verifier(await c.from('horaire_cases').delete().eq('ecole_id', ecoleId))
  verifier(await c.from('horaires_ecoles').delete().eq('ecole_id', ecoleId))
}

/** Remplit (classe) ou vide (`null`) une case de l'horaire. */
export async function definirCase(
  c: SupabaseClient,
  existante: Pick<CaseHoraire, 'id'> | undefined,
  saisie: { ecole_id: string; jour: number; heure: number; classe_id: string | null },
): Promise<void> {
  if (saisie.classe_id === null) {
    if (existante) verifier(await c.from('horaire_cases').delete().eq('id', existante.id))
    return
  }
  if (existante) verifier(await c.from('horaire_cases').update({ classe_id: saisie.classe_id }).eq('id', existante.id))
  else verifier(await c.from('horaire_cases').insert({ ecole_id: saisie.ecole_id, jour: saisie.jour, heure: saisie.heure, classe_id: saisie.classe_id }))
}
