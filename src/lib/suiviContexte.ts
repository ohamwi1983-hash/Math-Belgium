import { createContext, useContext } from 'react'
import type { EtatPuceProgression } from '../entrainement/components/ProgressionPuces'

/**
 * Pour les générateurs SANS puces de progression (quiz vrai/faux, gen40 « Section plane ») : noter un
 * exercice terminé dans « Mon suivi » (`suiviEssais.ts`). Fourni par `EntrainementPage` (qui connaît
 * l'identifiant du générateur) ; hors de cette page (aperçu, tests), l'appel ne fait rien.
 * Les générateurs à puces n'ont rien à appeler : `EntrainementPage` observe leurs segments.
 */
export type NoterEssai = (ecrans: readonly EtatPuceProgression[], variante?: string) => void

const rien: NoterEssai = () => {}

export const SuiviEssaiContext = createContext<NoterEssai>(rien)

export function useNoterEssai(): NoterEssai {
  return useContext(SuiviEssaiContext)
}

/** Signal de `ValidationEcran` (partagé par tous les générateurs) : l'écran en cours vient d'être clos,
 * révélé ou juste. `EntrainementPage` s'en sert pour noter le DERNIER écran d'un exercice, que les puces
 * gardent « en cours » jusqu'à « Nouvel exercice ». Sans effet hors de cette page. */
export const SuiviVerdictContext = createContext<((revele: boolean) => void) | null>(null)

export function useSignalerVerdict(): ((revele: boolean) => void) | null {
  return useContext(SuiviVerdictContext)
}
