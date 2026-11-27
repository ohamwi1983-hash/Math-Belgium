/**
 * Logo FACULTATIF de chaque école (`supabase/migrations/0012_logo_ecole.sql`, décision du 27/11/2026) :
 * imprimé à gauche dans la cartouche de tous les documents du professeur (copie, aménagée, corrigé,
 * grille, feuille, examen, remédiation, Word). Stocké dans `ecoles.logo` (texte data URL, ≈ 150 Ko au
 * plus, contrainte `ecoles_logo_valide`), protégé par le RLS existant des écoles (les siennes, compte
 * actif ; `anon` rien ; l'administrateur ne voit rien).
 *
 * Lu À PART de la liste des écoles du contexte (`lireEcoles` ne le demande pas : la liste est chargée
 * sur chaque page d'un professeur connecté), seulement là où il sert : Réglages (aperçu) et le panneau
 * de conception (rendu des documents). Jamais enregistré dans un plan du coffre ni dans un partage
 * (`planSansLogo`) : le plan garde le cartouche texte, le logo est remis au rendu depuis l'école choisie.
 *
 * Sans 0012 : `lireLogos` → `{ actif: false }`, rien n'est écrit, Réglages dit « Applique la migration
 * 0012… », les documents restent exactement ceux d'avant.
 */
import { useEffect, useSyncExternalStore } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { logoValide } from '../entrainement/export/cartouche'
import { messageErreur, type Ecole } from './compteValidation'
import type { PlanDocument } from './evaluationLocal'

export type EtatLogos =
  | { etat: 'sans-compte' | 'chargement' | 'absente' | 'erreur' }
  | { etat: 'actif'; logos: Record<string, string> }

/** 0012 pas appliquée : colonne `ecoles.logo` inconnue (42703 en lecture, PGRST204 en écriture). */
export function logoAbsent(erreur: unknown): boolean {
  const e = (erreur ?? {}) as { code?: string; message?: string }
  const m = String(e.message ?? '')
  return /logo/i.test(m) && (e.code === '42703' || e.code === 'PGRST204' || /does not exist|schema cache|could not find/i.test(m))
}

/** Logos des écoles du professeur (id → data URL valide) ; `{ actif: false }` sans 0012. */
export async function lireLogos(c: SupabaseClient): Promise<{ actif: false } | { actif: true; logos: Record<string, string> }> {
  const res = await c.from('ecoles').select('id, logo')
  if (res.error) {
    if (logoAbsent(res.error)) return { actif: false }
    throw new Error(messageErreur(res.error))
  }
  const logos: Record<string, string> = {}
  for (const l of (res.data ?? []) as { id: string; logo?: unknown }[]) if (logoValide(l.logo)) logos[l.id] = l.logo
  return { actif: true, logos }
}

/** Enregistre (ou retire avec `null`) le logo d'une école. `false` : 0012 pas appliquée, rien écrit. */
export async function enregistrerLogo(c: SupabaseClient, ecoleId: string, logo: string | null): Promise<boolean> {
  if (logo !== null && !logoValide(logo)) throw new Error('Image refusée : choisis une image PNG, JPG ou WEBP.')
  const res = await c.from('ecoles').update({ logo }).eq('id', ecoleId)
  if (res.error) {
    if (logoAbsent(res.error)) return false
    if ((res.error as { code?: string }).code === '23514') throw new Error("Image refusée par le serveur (trop lourde ou d'un format inattendu) : essaie une image plus petite, PNG ou JPG.")
    throw new Error(messageErreur(res.error))
  }
  return true
}

/* --------------------------------------------------------------------- magasin (une lecture par session) */

let courant: EtatLogos = { etat: 'sans-compte' }
/** Professeur dont les logos sont gardés (`null` : personne) — un autre compte sur le même navigateur relit. */
let cleCourante: string | null = null
let enVol: Promise<void> | null = null
const abonnes = new Set<() => void>()

function definir(e: EtatLogos) {
  courant = e
  for (const f of abonnes) f()
}

function abonner(f: () => void): () => void {
  abonnes.add(f)
  return () => abonnes.delete(f)
}

const lire = () => courant

/** Lance (une fois par professeur) la lecture des logos ; `forcer` relit (après un changement). */
export function chargerLogos(client: SupabaseClient | null, proprietaire: string | null, forcer = false): Promise<void> {
  if (!client || !proprietaire) {
    cleCourante = null
    if (courant.etat !== 'sans-compte') definir({ etat: 'sans-compte' })
    return Promise.resolve()
  }
  if (!forcer && proprietaire === cleCourante && (enVol || courant.etat !== 'sans-compte')) return enVol ?? Promise.resolve()
  const autre = proprietaire !== cleCourante
  cleCourante = proprietaire
  if (autre || courant.etat !== 'actif') definir({ etat: 'chargement' })
  const p = lireLogos(client)
    .then((r) => {
      if (cleCourante === proprietaire) definir(r.actif ? { etat: 'actif', logos: r.logos } : { etat: 'absente' })
    })
    .catch(() => {
      if (cleCourante === proprietaire) definir({ etat: 'erreur' })
    })
    .finally(() => {
      if (enVol === p) enVol = null
    })
  enVol = p
  return p
}

/** Remplace le logo d'une école dans le magasin (après un enregistrement réussi). */
export function majLogoLocal(ecoleId: string, logo: string | null) {
  if (courant.etat !== 'actif') return
  const logos = { ...courant.logos }
  if (logo) logos[ecoleId] = logo
  else delete logos[ecoleId]
  definir({ etat: 'actif', logos })
}

/** État des logos du professeur connecté (lecture lancée au premier appel ; `null` : pas de session). */
export function useLogosEcoles(client: SupabaseClient | null, proprietaire: string | null): EtatLogos {
  const etat = useSyncExternalStore(abonner, lire, lire)
  useEffect(() => {
    void chargerLogos(client, proprietaire)
  }, [client, proprietaire])
  return proprietaire && proprietaire === cleCourante ? etat : proprietaire ? { etat: 'chargement' } : { etat: 'sans-compte' }
}

/** Les écoles du contexte, chacune avec son logo s'il est connu. */
export function ecolesAvecLogo(ecoles: Ecole[], etat: EtatLogos): Ecole[] {
  if (etat.etat !== 'actif') return ecoles
  return ecoles.map((e) => (etat.logos[e.id] ? { ...e, logo: etat.logos[e.id] } : e))
}

/** Copie du plan à ENREGISTRER (coffre) : sans le logo (≈ 200 Ko qui n'ont rien à faire dans chaque
 * plan ; remis au rendu depuis l'école choisie). Plan sans logo : renvoyé tel quel (même objet). */
export function planSansLogo(plan: PlanDocument): PlanDocument {
  const c = plan.entete.cartouche
  if (!c || c.logo === undefined) return plan
  const { logo: _retire, ...cartouche } = c
  return { ...plan, entete: { ...plan.entete, cartouche } }
}
