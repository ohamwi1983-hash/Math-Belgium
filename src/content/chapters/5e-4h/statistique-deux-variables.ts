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
    {
      id: 'nuage-point-moyen',
      number: 1,
      title: 'Série à deux variables, nuage de points, point moyen',
      blocks: [
        { kind: 'para', text: 'Section en cours de rédaction.' },
        // Lot H1 (générateurs) : carte en FIN de section.
        {
          kind: 'entrainement',
          title: 'Point moyen et valeurs manquantes',
          generatorId: '5gen77',
          description: [
            'Calcule le point moyen G d\'une série, retrouve une ou deux valeurs effacées connaissant G, puis ' +
              'écris la droite de Mayer à partir de G₁ et G₂ et fais des prévisions dans les deux sens.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 77. Point moyen et valeurs manquantes »',
        },
      ],
    },
    {
      id: 'ajustement',
      number: 2,
      title: 'Ajuster un nuage : affine ou pas ?',
      blocks: [
        { kind: 'para', text: 'Section en cours de rédaction.' },
        // Lot H1 (générateurs) : carte en FIN de section.
        {
          kind: 'entrainement',
          title: 'Lire un nuage de points',
          generatorId: '5gen76',
          description: [
            'Sur un nuage dessiné : y a-t-il une relation ? De quelle forme (affine, en arc, qui décolle) et ' +
              'dans quel sens ? Juge l\'intensité à l\'œil, puis associe quatre nuages à leur coefficient de corrélation.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 76. Lire un nuage de points »',
        },
      ],
    },
    {
      id: 'mayer',
      number: 3,
      title: 'Droite de Mayer',
      blocks: [
        { kind: 'para', text: 'Section en cours de rédaction.' },
        // Lot H1 (générateurs) : carte en FIN de section.
        {
          kind: 'entrainement',
          title: 'Droite de Mayer',
          generatorId: '5gen36',
          description: [
            'Range les données, partage-les en deux groupes (n pair ou impair), calcule G₁, G₂, la pente et ' +
              'l\'équation, vérifie que la droite passe par G, puis fais une prévision. Le nuage se complète écran après écran.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 36. Droite de Mayer »',
        },
      ],
    },
    {
      id: 'moindres-carres',
      number: 4,
      title: 'Droite des moindres carrés',
      blocks: [
        { kind: 'para', text: 'Section en cours de rédaction.' },
        // Lot H1 (générateurs) : carte en FIN de section.
        {
          kind: 'entrainement',
          title: 'Droite des moindres carrés',
          generatorId: '5gen37',
          description: [
            'À la main sur une petite série (point moyen, tableau des écarts, pente, ordonnée à l\'origine, ' +
              'prévision) ou à la calculatrice sur une série réelle (a et b arrondis, prévisions dans les deux sens).',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 37. Droite des moindres carrés »',
        },
      ],
    },
    {
      id: 'correlation',
      number: 5,
      title: 'Covariance et coefficient de corrélation',
      blocks: [
        { kind: 'para', text: 'Section en cours de rédaction.' },
        // Lot H1 (générateurs) : carte en FIN de section.
        {
          kind: 'entrainement',
          title: 'Covariance et coefficient de corrélation',
          generatorId: '5gen38',
          description: [
            'Calcule la covariance par les deux formules, les écarts-types σx et σy (sans les confondre avec Sx et ' +
              'Sy), puis r ; interprète le sens et l\'intensité de la corrélation avec le tableau du cours.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 38. Covariance et coefficient de corrélation »',
        },
      ],
    },
    { id: 'interpreter', number: 6, title: 'Interpréter : fiabilité, point aberrant, corrélation et causalité', blocks: [{ kind: 'para', text: 'Section en cours de rédaction.' }] },
  ],
  recap: {
    items: ['Synthèse en cours de rédaction.'],
  },
}
