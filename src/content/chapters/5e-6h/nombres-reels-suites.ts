import type { ChapterContent } from '../../types'
import { sectionsReels } from './nombres-reels-suites/partie-reels'
import { sectionsSuites } from './nombres-reels-suites/partie-suites'
import { sectionsFinance } from './nombres-reels-suites/partie-finance'

/**
 * 5e (6h), chapitre 1 — Nombres réels et suites (avec l'algèbre financière comme application des suites).
 * Les 14 étapes vivent dans trois fichiers (un par partie) pour que plusieurs chantiers puissent les écrire
 * en parallèle. Proposition validée par le professeur le 26/11/2026 (manuel : pages jaunes, bleues, vertes
 * et algèbre financière ; nombres recalculés, erreurs du manuel corrigées). Calculatrice des élèves :
 * Casio Graph Math+.
 */
export const nombresReelsSuites: ChapterContent = {
  level: '5e (6h)',
  levelSlug: '5e-6h',
  chapterNumber: 1,
  title: 'Nombres réels et suites',
  slug: 'nombres-reels-suites',
  lede:
    'Des nombres qui ne sont pas des fractions jusqu’au remboursement d’un crédit : les réels, les suites ' +
    'arithmétiques et géométriques, leurs limites, et leur application aux intérêts et aux emprunts.',
  sections: [...sectionsReels, ...sectionsSuites, ...sectionsFinance],
  recap: {
    items: ['Synthèse en cours de rédaction.'],
  },
}
