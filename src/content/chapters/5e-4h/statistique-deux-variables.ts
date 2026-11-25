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
    {
      id: 'moindres-carres', number: 4, title: 'Droite des moindres carrés', blocks: [
      { kind: 'para', text: 'Section en cours de rédaction.' },
      {
        kind: 'entrainement',
        title: 'Quel est le meilleur ajustement ?',
        generatorId: '5gen79',
        chantier: '5e-4h',
        description: [
          'Deux droites proposées pour un même nuage : calcule l’écart d’un point, puis la somme des carrés des écarts verticaux pour chacune, et désigne la meilleure. Variantes : retrouver laquelle de deux droites est celle des moindres carrés (l’autre est celle de Mayer, et les deux passent par G), ou retirer un point aberrant et recalculer r et la droite.',
        ],
        whereLabel: '5e (4h) → « 79. Quel est le meilleur ajustement ? »',
      },
    ] },
    { id: 'correlation', number: 5, title: 'Covariance et coefficient de corrélation', blocks: [{ kind: 'para', text: 'Section en cours de rédaction.' }] },
    {
      id: 'interpreter', number: 6, title: 'Interpréter : fiabilité, point aberrant, corrélation et causalité', blocks: [
      { kind: 'para', text: 'Section en cours de rédaction.' },
      {
        kind: 'entrainement',
        title: 'Modéliser et prévoir en contexte',
        generatorId: '5gen78',
        chantier: '5e-4h',
        description: [
          'Une série réaliste (dilatation, grue, pièces défectueuses, ventes, population, consommation) : à la calculatrice, la droite des moindres carrés et r, puis le modèle est-il fiable ? Une prévision, interpolation ou extrapolation, et un seuil à atteindre (« quand atteindra-t-on 5 % ? »).',
        ],
        whereLabel: '5e (4h) → « 78. Modéliser et prévoir en contexte »',
      },
      {
        kind: 'entrainement',
        title: 'Corrélation ou causalité ?',
        generatorId: '5gen80',
        chantier: '5e-4h',
        description: [
          'Une forte corrélation et une conclusion hâtive : cause commune, coïncidence, causalité inverse, effet décalé dans le temps ou vraie causalité ? Choisis le type d’explication, puis l’explication précise (la troisième grandeur, le bon sens de la cause, le retard…).',
        ],
        whereLabel: '5e (4h) → « 80. Corrélation ou causalité ? »',
      },
      {
        kind: 'entrainement',
        title: 'Détective d’erreurs : statistique à deux variables',
        generatorId: '5gen81',
        chantier: '5e-4h',
        description: [
          'La résolution d’un élève contient une seule ligne fausse : Mayer sans trier les points, pente arrondie avant de calculer b, médianes au lieu des moyennes, x̄ et ȳ échangés dans b, écarts-types divisés par n − 1, covariance sans diviser par n (r > 1), extrapolation abusive ou « donc x cause y ». Trouve la ligne, nomme l’erreur, puis corrige.',
        ],
        whereLabel: '5e (4h) → « 81. Détective d’erreurs : statistique à deux variables »',
      },
    ] },
  ],
  recap: {
    items: ['Synthèse en cours de rédaction.'],
  },
}
