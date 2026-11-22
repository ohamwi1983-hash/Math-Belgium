/**
 * Agenda du carnet — accès aux tables `evenements`, `evenements_classes`, `periodes_bulletin` et à la
 * colonne `carnet_reglages.seuil_avertissement` (`supabase/migrations/0006_agenda.sql`). Même
 * principe que `carnetDonnees.ts` : client injecté, erreurs traduites (`ErreurCarnet`).
 *
 * FACULTATIF : sans 0006, `chargerAgenda` renvoie `actif: false` (tables ou colonne absentes) et le
 * carnet marche comme avant ; les nouveaux écrans affichent « Agenda pas encore activé ».
 *
 * Sous-ensemble de l'API utilisé (imité par le faux client des tests) : `select().order()`,
 * `.maybeSingle()`, `insert(…).select().single()`, `insert([…])`, `update(…).eq()`,
 * `delete().eq().eq()`.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { ErreurCarnet } from './carnetDonnees'
import { normaliserSaisie, planRenumerotation, SEUIL_DEFAUT, type Evenement, type PeriodeBulletin, type SaisieEvenement } from './agendaEvenements'

export interface DonneesAgenda {
  /** Faux : 0006 pas encore appliqué. */
  actif: boolean
  evenements: Evenement[]
  periodes: PeriodeBulletin[]
  seuil: number
}

export const AGENDA_INACTIF: DonneesAgenda = { actif: false, evenements: [], periodes: [], seuil: SEUIL_DEFAUT }

const COLONNES_EVENEMENT = 'id, ecole_id, type, intitule, du, au, journee_entiere, heure_debut, heure_fin, toutes_classes, accompagne, classe_id, chapitre, cree_le'
const COLONNES_PERIODE = 'id, ecole_id, annee_scolaire, numero, remise'

function verifier<T>(res: { data?: T; error: unknown }): T {
  if (res.error) throw new ErreurCarnet(res.error)
  return res.data as T
}

/** Colonne `seuil_avertissement` inconnue : 0006 pas appliqué. */
function colonneAbsente(erreur: unknown): boolean {
  const e = (erreur ?? {}) as { code?: string; message?: string }
  return /seuil_avertissement/i.test(String(e.message ?? '')) && (e.code === '42703' || e.code === 'PGRST204' || /does not exist|schema cache|could not find/i.test(String(e.message ?? '')))
}

/** Événements (avec leurs classes), périodes et seuil ; `actif: false` si 0006 manque. */
export async function chargerAgenda(c: SupabaseClient): Promise<DonneesAgenda> {
  try {
    const [ev, liens, periodes, reglage] = await Promise.all([
      c.from('evenements').select(COLONNES_EVENEMENT).order('du', { ascending: true }),
      c.from('evenements_classes').select('evenement_id, classe_id'),
      c.from('periodes_bulletin').select(COLONNES_PERIODE).order('remise', { ascending: true }),
      c.from('carnet_reglages').select('seuil_avertissement').maybeSingle(),
    ])
    if (reglage.error && colonneAbsente(reglage.error)) return AGENDA_INACTIF
    const liste = (verifier(ev) ?? []) as Omit<Evenement, 'classes'>[]
    const lies = (verifier(liens) ?? []) as { evenement_id: string; classe_id: string }[]
    const seuil = (verifier(reglage) as { seuil_avertissement?: number } | null)?.seuil_avertissement
    return {
      actif: true,
      evenements: liste.map((e) => ({ ...e, intitule: e.intitule ?? '', classes: lies.filter((l) => l.evenement_id === e.id).map((l) => l.classe_id) })),
      periodes: (verifier(periodes) ?? []) as PeriodeBulletin[],
      seuil: typeof seuil === 'number' ? seuil : SEUIL_DEFAUT,
    }
  } catch (ex) {
    if (ex instanceof ErreurCarnet && ex.tableAbsente) return AGENDA_INACTIF
    throw ex
  }
}

function ligneEvenement(s: SaisieEvenement) {
  const n = normaliserSaisie(s)
  return {
    ecole_id: n.ecole_id,
    type: n.type,
    intitule: n.intitule,
    du: n.du,
    au: n.au,
    journee_entiere: n.journee_entiere,
    heure_debut: n.heure_debut,
    heure_fin: n.heure_fin,
    toutes_classes: n.toutes_classes,
    accompagne: n.accompagne,
    classe_id: n.classe_id,
    chapitre: n.chapitre,
  }
}

export async function ajouterEvenement(c: SupabaseClient, s: SaisieEvenement): Promise<string> {
  const n = normaliserSaisie(s)
  const cree = verifier(await c.from('evenements').insert(ligneEvenement(n)).select('id').single()) as { id: string }
  if (n.classes.length > 0) {
    const r = await c.from('evenements_classes').insert(n.classes.map((classe_id) => ({ evenement_id: cree.id, classe_id, ecole_id: n.ecole_id })))
    if (r.error) {
      // Pas d'événement à moitié enregistré : on le retire avant de signaler l'erreur.
      await c.from('evenements').delete().eq('id', cree.id)
      throw new ErreurCarnet(r.error)
    }
  }
  return cree.id
}

/** Met à jour l'événement puis ses liaisons (la base retire d'elle-même les liaisons d'un événement
 * qui passe à « toutes », devient une interro ou change d'école). */
export async function modifierEvenement(c: SupabaseClient, avant: Evenement, s: SaisieEvenement): Promise<void> {
  const n = normaliserSaisie(s)
  verifier(await c.from('evenements').update(ligneEvenement(n)).eq('id', avant.id))
  const conservees = n.toutes_classes || n.type === 'interrogation' || n.ecole_id !== avant.ecole_id ? [] : avant.classes
  for (const classe_id of conservees.filter((k) => !n.classes.includes(k))) verifier(await c.from('evenements_classes').delete().eq('evenement_id', avant.id).eq('classe_id', classe_id))
  const nouvelles = n.classes.filter((k) => !conservees.includes(k))
  if (nouvelles.length > 0) verifier(await c.from('evenements_classes').insert(nouvelles.map((classe_id) => ({ evenement_id: avant.id, classe_id, ecole_id: n.ecole_id }))))
}

/** Supprime l'événement (et ses liaisons, en cascade). */
export async function supprimerEvenement(c: SupabaseClient, id: string): Promise<void> {
  verifier(await c.from('evenements').delete().eq('id', id))
}

/* ------------------------------------------------------------------------------- périodes */

/** Message quand une modification de date changerait l'ordre des périodes au-delà d'une voisine. */
export const ORDRE_PERIODES = 'Cette date passerait au-delà d’une autre période : garde l’ordre (P1, P2…), ou supprime cette période et ajoute-la à sa nouvelle date.'

/** Erreur déjà traduite (`messageErreur` la reprend telle quelle). */
function erreurOrdre(): Error {
  return Object.assign(new Error(ORDRE_PERIODES), { name: 'ErreurCompte' })
}

async function renumeroter(c: SupabaseClient, plan: { id: string; numero: number }[], sauf?: string): Promise<void> {
  for (const p of plan) if (p.id !== sauf) verifier(await c.from('periodes_bulletin').update({ numero: p.numero }).eq('id', p.id))
}

/** Ajoute une remise des points ; les périodes suivantes sont renumérotées (P1 = la plus tôt). */
export async function ajouterPeriode(c: SupabaseClient, ecoleId: string, annee: string, remise: string, existantes: PeriodeBulletin[]): Promise<void> {
  const memes = existantes.filter((p) => p.ecole_id === ecoleId && p.annee_scolaire === annee)
  const NOUVELLE = '__nouvelle__'
  const plan = planRenumerotation([...memes, { id: NOUVELLE, numero: 1000, remise }])
  if (!plan) throw erreurOrdre()
  await renumeroter(c, plan, NOUVELLE)
  const numero = plan.find((p) => p.id === NOUVELLE)?.numero ?? memes.length + 1
  verifier(await c.from('periodes_bulletin').insert({ ecole_id: ecoleId, annee_scolaire: annee, numero, remise }))
}

/** Change la date de remise d'une période (sans la faire passer au-delà d'une voisine). */
export async function modifierPeriode(c: SupabaseClient, periode: PeriodeBulletin, remise: string, existantes: PeriodeBulletin[]): Promise<void> {
  const memes = existantes.filter((p) => p.ecole_id === periode.ecole_id && p.annee_scolaire === periode.annee_scolaire).map((p) => (p.id === periode.id ? { ...p, remise } : p))
  const plan = planRenumerotation(memes)
  if (plan === null || plan.length > 0) throw erreurOrdre()
  verifier(await c.from('periodes_bulletin').update({ remise }).eq('id', periode.id))
}

/** Supprime une période ; les suivantes reculent d'un numéro. */
export async function supprimerPeriode(c: SupabaseClient, periode: PeriodeBulletin, existantes: PeriodeBulletin[]): Promise<void> {
  verifier(await c.from('periodes_bulletin').delete().eq('id', periode.id))
  const restantes = existantes.filter((p) => p.ecole_id === periode.ecole_id && p.annee_scolaire === periode.annee_scolaire && p.id !== periode.id)
  await renumeroter(c, planRenumerotation(restantes) ?? [])
}

/** Seuil « peu de temps pour corriger » (ligne de réglages créée si besoin). */
export async function enregistrerSeuil(c: SupabaseClient, seuil: number, existe: boolean, proprietaire: string): Promise<void> {
  if (existe) verifier(await c.from('carnet_reglages').update({ seuil_avertissement: seuil }).eq('proprietaire', proprietaire))
  else verifier(await c.from('carnet_reglages').insert({ seuil_avertissement: seuil }))
}
