import { FORMULES_4E } from './niveau4e'
import { FORMULES_5E } from './niveau5e'
import { FORMULES_6E } from './niveau6e'
import type { BanqueFormules } from './types'

export type { BanqueFormules, QuestionFormuleBrute } from './types'

/** Banque des questions « Formule » des trois années (les slugs de chapitre sont uniques). */
export const QUESTIONS_FORMULES: BanqueFormules = { ...FORMULES_4E, ...FORMULES_5E, ...FORMULES_6E }
