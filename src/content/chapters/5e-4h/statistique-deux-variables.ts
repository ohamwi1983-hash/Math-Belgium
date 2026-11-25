import type { ChapterContent } from '../../types'

/**
 * 5e (4h), chapitre 6 — Statistique à deux variables.
 * SQUELETTE posé par le coordinateur (25/11/2026) : ids de sections FIXES (les agents de générateurs et
 * d'ateliers y accrochent leurs blocs). Contenu rédigé par le lot AF d'après la proposition validée par le
 * professeur (toutes les recommandations suivies).
 */
export const statistiqueDeuxVariables: ChapterContent = {
  level: '5e (4h)',
  levelSlug: '5e-4h',
  chapterNumber: 6,
  title: 'Statistique à deux variables',
  slug: 'statistique-deux-variables',
  lede:
    'Deux grandeurs mesurées sur les mêmes individus varient-elles ensemble ? Un **nuage de points** le ' +
    'montre, une **droite d’ajustement** le résume et permet de prévoir, et le **coefficient de corrélation** ' +
    'dit si cette droite mérite confiance.',
  sections: [
    { id: 'nuage-point-moyen', number: 1, title: 'Série à deux variables, nuage de points, point moyen', blocks: [{ kind: 'para', text: 'Section en cours de rédaction.' }] },
    { id: 'ajustement', number: 2, title: 'Ajuster un nuage : affine ou pas ?', blocks: [{ kind: 'para', text: 'Section en cours de rédaction.' }] },
    { id: 'mayer', number: 3, title: 'Droite de Mayer', blocks: [{ kind: 'para', text: 'Section en cours de rédaction.' }] },
    { id: 'moindres-carres', number: 4, title: 'Droite des moindres carrés', blocks: [{ kind: 'para', text: 'Section en cours de rédaction.' }] },
    { id: 'correlation', number: 5, title: 'Covariance et coefficient de corrélation', blocks: [{ kind: 'para', text: 'Section en cours de rédaction.' }] },
    { id: 'interpreter', number: 6, title: 'Interpréter : fiabilité, point aberrant, corrélation et causalité', blocks: [{ kind: 'para', text: 'Section en cours de rédaction.' }] },
  ],
  recap: {
    items: ['Synthèse en cours de rédaction.'],
  },
}
