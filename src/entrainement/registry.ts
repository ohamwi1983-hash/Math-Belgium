/**
 * Table centrale des générateurs rapatriés depuis plateforme-maths — SEULE source de vérité
 * (plus de `GENERATEURS_MIGRES` séparée à garder synchronisée côté `generatorLink.ts`). Ajouter un
 * générateur migré = ajouter une entrée ici, rien d'autre à câbler :
 * - `src/lib/generatorLink.ts` (lien interne vs externe) la lit directement ;
 * - `src/routes/EntrainementPage.tsx` (route générique `/entrainement/:chantier/:generatorId`) la
 *   lit pour charger le bon composant (lazy) et construire le fil d'Ariane.
 *
 * Module de DONNÉES pur (pas de JSX/React ici) : `importComponent` est un thunk `() => import(...)`
 * non encore résolu — `EntrainementPage` l'enveloppe dans `React.lazy` au moment du rendu, donc
 * importer ce fichier (ex. depuis `generatorLink.ts`, hors contexte React) ne déclenche jamais le
 * téléchargement du code d'un générateur, seulement la consultation de sa fiche.
 *
 * `chantier` vaut toujours `ChapterContent.levelSlug` ('4e', '5e-4h', '6e-6h'), jamais réécrit —
 * mêmes valeurs que `GENERATEURS_MIGRES` avant elle. Code source : `src/entrainement/{chantier}/`,
 * miroir de la structure relative d'origine de plateforme-maths (voir le commentaire de tête
 * d'`AppMethodeRapide.tsx` pour pourquoi).
 */
import type { ComponentType } from 'react'

export interface EntrainementEntry {
  chantier: string
  chapitreSlug: string
  chapitreTitle: string
  importComponent: () => Promise<{ default: ComponentType }>
}

export const LEVEL_LABELS: Record<string, string> = {
  '4e': '4e',
  '5e-4h': '5e (4h)',
  '6e-6h': '6e (6h)',
}

export const ENTRAINEMENT_REGISTRY: Record<string, EntrainementEntry> = {
  gen1: {
    chantier: '4e',
    chapitreSlug: 'equations-inequations-second-degre',
    chapitreTitle: 'Équations et inéquations du second degré',
    importComponent: () => import('./4e/AppMethodeRapide').then((m) => ({ default: m.AppMethodeRapide })),
  },
}
