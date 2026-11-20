/**
 * Carnet de matière vue — accès aux tables `classes`, `seances`, `carnet_reglages`
 * (`supabase/migrations/0002_carnet.sql`). Même principe que `compteDonnees.ts` : client injecté,
 * erreurs traduites ; en plus, `ErreurCarnet.tableAbsente` signale que 0002 n'est pas encore
 * appliqué (la page affiche alors « Carnet pas encore activé », jamais un plantage).
 *
 * Sous-ensemble de l'API utilisé (imité par le faux client des tests) : `from(t).select().order()`,
 * `.eq()`, `.maybeSingle()`, `insert(…).select().single()`, `update(…).eq().select().single()`,
 * `delete().eq()`.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { messageErreur } from './compteValidation'
import { REGLAGES_DEFAUT, type Classe, type ReglagesCarnet, type SaisieSeance, type Seance } from './carnet'

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
    else if (code === '23505') message = 'Une classe porte déjà ce nom dans cette école.'
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

export async function listerSeances(c: SupabaseClient): Promise<Seance[]> {
  const liste = (verifier(await c.from('seances').select(COLONNES_SEANCE).order('date_seance', { ascending: false })) ?? []) as Seance[]
  return liste.map(nettoyer)
}

function ligneSeance(s: SaisieSeance) {
  return {
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

export async function ajouterSeance(c: SupabaseClient, s: SaisieSeance): Promise<Seance> {
  return nettoyer(verifier(await c.from('seances').insert(ligneSeance(s)).select(COLONNES_SEANCE).single()) as Seance)
}

export async function modifierSeance(c: SupabaseClient, id: string, s: SaisieSeance): Promise<void> {
  verifier(await c.from('seances').update(ligneSeance(s)).eq('id', id))
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
