import { FORMULES_4E } from './niveau4e'
import { FORMULES_5E } from './niveau5e'
import { FORMULES_6E } from './niveau6e'
import { FORMULES_5E_6H } from './niveau5e6h'
import type { BanqueFormules } from './types'

export type { BanqueFormules, QuestionFormuleBrute } from './types'

/** Banque des questions « Formule » des quatre années (les slugs de chapitre sont uniques). */
export const QUESTIONS_FORMULES: BanqueFormules = { ...FORMULES_4E, ...FORMULES_5E, ...FORMULES_6E, ...FORMULES_5E_6H }
