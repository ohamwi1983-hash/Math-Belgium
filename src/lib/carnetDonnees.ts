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
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { messageErreur } from './compteValidation'
import { REGLAGES_DEFAUT, type Classe, type ReglagesCarnet, type SaisieSeance, type Seance } from './carnet'
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
const COLONNES_GRILLE = 'ecole_id, debut, duree_heure, nombre_heures, pauses, heures_mercredi, exceptions'
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

function nettoyer(s: Seance): Seance {
  return { ...s, parties: Array.isArray(s.parties) ? s.parties : [], generateurs: Array.isArray(s.generateurs) ? s.generateurs : [], devoir: s.devoir ?? '', remarque: s.remarque ?? '' }
}

/** `horaire` : 0003 appliqué (colonne `numero_heure_fin` présente). */
export async function listerSeances(c: SupabaseClient, horaire = false): Promise<Seance[]> {
  const colonnes: string = horaire ? COLONNES_SEANCE_HORAIRE : COLONNES_SEANCE
  const liste = (verifier(await c.from('seances').select(colonnes).order('date_seance', { ascending: false })) ?? []) as unknown as Seance[]
  return liste.map(nettoyer)
}

function ligneSeance(s: SaisieSeance, horaire: boolean): Record<string, unknown> {
  const heureDouble = horaire ? { numero_heure_fin: s.numero_heure && s.numero_heure_fin && s.numero_heure_fin > s.numero_heure ? s.numero_heure_fin : null } : {}
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
  }
}

export async function ajouterSeance(c: SupabaseClient, s: SaisieSeance, horaire = false): Promise<Seance> {
  const colonnes: string = horaire ? COLONNES_SEANCE_HORAIRE : COLONNES_SEANCE
  return nettoyer(verifier(await c.from('seances').insert(ligneSeance(s, horaire)).select(colonnes).single()) as unknown as Seance)
}

export async function modifierSeance(c: SupabaseClient, id: string, s: SaisieSeance, horaire = false): Promise<void> {
  verifier(await c.from('seances').update(ligneSeance(s, horaire)).eq('id', id))
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

/* ------------------------------------------------------------------------------- horaire (0003) */

export interface DonneesHoraire {
  /** Faux : 0003 pas encore appliqué (« Horaire pas encore activé »). */
  actif: boolean
  grilles: GrilleHoraire[]
  cases: CaseHoraire[]
}

/** Grilles et cases du professeur ; `actif: false` (sans erreur) si les tables n'existent pas. */
export async function chargerHoraire(c: SupabaseClient): Promise<DonneesHoraire> {
  try {
    const [grilles, cases] = await Promise.all([
      c.from('horaires_ecoles').select(COLONNES_GRILLE).order('ecole_id', { ascending: true }),
      c.from('horaire_cases').select(COLONNES_CASE).order('heure', { ascending: true }),
    ])
    return {
      actif: true,
      grilles: ((verifier(grilles) ?? []) as GrilleHoraire[]).map(nettoyerGrille),
      cases: ((verifier(cases) ?? []) as CaseHoraire[]).map((x) => ({ ...x, semaine: x.semaine ?? null })),
    }
  } catch (ex) {
    if (ex instanceof ErreurCarnet && ex.tableAbsente) return { actif: false, grilles: [], cases: [] }
    throw ex
  }
}

function ligneGrille(g: SaisieGrille) {
  return {
    debut: g.debut,
    duree_heure: g.duree_heure,
    nombre_heures: g.nombre_heures,
    pauses: g.pauses.map((p) => ({ apres: p.apres, duree: p.duree, type: p.type })),
    heures_mercredi: g.heures_mercredi,
    exceptions: g.exceptions.map((x) => ({ heure: x.heure, debut: x.debut, fin: x.fin })),
  }
}

/** Crée ou remplace la grille d'une école ; retire d'abord les cases devenues hors grille. */
export async function enregistrerGrille(c: SupabaseClient, ecoleId: string, g: SaisieGrille, existe: boolean, casesARetirer: string[] = []): Promise<void> {
  for (const id of casesARetirer) verifier(await c.from('horaire_cases').delete().eq('id', id))
  if (existe) verifier(await c.from('horaires_ecoles').update(ligneGrille(g)).eq('ecole_id', ecoleId))
  else verifier(await c.from('horaires_ecoles').insert({ ecole_id: ecoleId, ...ligneGrille(g) }))
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
