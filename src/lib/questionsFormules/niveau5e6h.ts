import type { BanqueFormules } from './types'

/**
 * Questions « Formule » de 5e (6h) — voir `types.ts`. Entrée du chapitre posée VIDE au câblage du
 * niveau (26/11/2026) : tant qu'une section n'a pas de questions, la ligne « Formule » du panneau des
 * évaluations ne propose rien pour elle (même comportement qu'une section sans formule). À remplir
 * section par section (`id` de section de `nombres-reels-suites/partie-*.ts`), dans l'ordre du cours.
 */
export const FORMULES_5E_6H: BanqueFormules = {
  'nombres-reels-suites': {},
}
