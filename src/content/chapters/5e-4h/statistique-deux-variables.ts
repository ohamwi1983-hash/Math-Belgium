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
    { id: 'ajustement', number: 2, title: 'Ajuster un nuage : affine ou pas ?', blocks: [{ kind: 'para', text: 'Section en cours de rédaction.' },
      {
        kind: 'atelier',
        tag: 'jusqu-ou-prevoir-widget',
        label: 'Manipule toi-même : jusqu’où prévoir ?',
        caption:
          'Fais glisser l’abscisse de la prévision : dans l’intervalle des données (bande verte), on interpole ; au-delà (bande ocre), on extrapole. Avec la mortalité infantile, la droite d’ajustement finit par prévoir un taux négatif ; avec l’espérance de vie en Belgique (2000-2014), elle dépasse le record humain de 122 ans. Un bon ajustement ne permet pas de prévoir n’importe où.',
      }
    ] },
    { id: 'mayer', number: 3, title: 'Droite de Mayer', blocks: [{ kind: 'para', text: 'Section en cours de rédaction.' },
      {
        kind: 'atelier',
        tag: 'nuage-mayer-widget',
        label: 'Manipule toi-même : nuage, point moyen et droite de Mayer',
        caption:
          'Ajoute, déplace et retire des points : G, G₁, G₂ et la droite de Mayer suivent en direct, et le panneau refait les cinq étapes de la méthode (trier, partager, points moyens, pente, équation). Avec un nombre impair de points, les deux groupes diffèrent d’une unité : G n’est plus le milieu de [G₁G₂], mais il reste sur la droite.',
      }
    ] },
    { id: 'moindres-carres', number: 4, title: 'Droite des moindres carrés', blocks: [{ kind: 'para', text: 'Section en cours de rédaction.' },
      {
        kind: 'atelier',
        tag: 'moindres-carres-widget',
        label: 'Manipule toi-même : ta droite contre celle des moindres carrés',
        caption:
          'Règle ou fais glisser ta droite. Chaque écart vertical est le côté d’un vrai carré : rends la somme de leurs aires la plus petite possible, puis compare avec la meilleure droite (et avec la droite de Mayer : 2,4 contre environ 2,44 pour la série du cours).',
      }
    ] },
    { id: 'correlation', number: 5, title: 'Covariance et coefficient de corrélation', blocks: [{ kind: 'para', text: 'Section en cours de rédaction.' },
      {
        kind: 'atelier',
        tag: 'quadrants-covariance-widget',
        label: 'Manipule toi-même : les quatre quadrants de la covariance',
        caption:
          'Deux axes passent par G. Chaque point dessine son rectangle jusqu’à G : vert en haut à droite et en bas à gauche (produit positif), rouge ailleurs (produit négatif). La covariance fait le bilan. Le nuage en arc donne une covariance nulle alors que les points sont liés.',
      },
      {
        kind: 'atelier',
        tag: 'devine-r-widget',
        label: 'Manipule toi-même : devine r',
        caption:
          'Estime le coefficient de corrélation d’un nuage tiré au hasard, puis vérifie. Dans l’autre mode, fabrique toi-même un nuage dont r vaut une valeur donnée, à 0,05 près.',
      },
      {
        kind: 'atelier',
        tag: 'changer-unites-widget',
        label: 'Manipule toi-même : changer d’unités',
        caption:
          'Passe des centimètres aux mètres, des kilogrammes aux grammes, ou centre les années : le nuage reste le même dessin, la pente change, mais r ne bouge pas (démonstration 7).',
      }
    ] },
    { id: 'interpreter', number: 6, title: 'Interpréter : fiabilité, point aberrant, corrélation et causalité', blocks: [{ kind: 'para', text: 'Section en cours de rédaction.' },
      {
        kind: 'atelier',
        tag: 'point-aberrant-widget',
        label: 'Manipule toi-même : le point aberrant',
        caption:
          'Fais glisser le point rouge loin du nuage : la droite des moindres carrés bascule et r chute, alors que les huit autres points n’ont pas bougé. Le bouton « Quartet d’Anscombe » montre les quatre séries de 1973 : mêmes moyennes, mêmes écarts-types, même r, même droite… et quatre nuages très différents.',
      }
    ] },
  ],
  recap: {
    items: ['Synthèse en cours de rédaction.'],
  },
}
