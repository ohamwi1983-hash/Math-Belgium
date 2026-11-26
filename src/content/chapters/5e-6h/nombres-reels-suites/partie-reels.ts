import type { ChapterSection, FormulaireGroupe } from '../../../types'

/**
 * 5e (6h) — Nombres réels et suites, partie « Les nombres réels ».
 * Squelette posé par le coordinateur (26/11/2026) : ids, numéros, titres FIXES (les agents de générateurs et
 * d'ateliers y accrochent leurs blocs). Garder le marqueur `// ⟨fin-etape …⟩` en dernière ligne de chaque `blocks`.
 */
export const sectionsReels: ChapterSection[] = [
  {
    id: 'irrationnels',
    number: 1,
    title: 'Des nombres qui ne sont pas des fractions',
    kicker: '√2 irrationnel, ensembles ℕ, ℤ, ℚ, ℝ',
    titreCourt: 'Irrationnels',
    partie: 'Les nombres réels',
    blocks: [
      { kind: 'para', text: 'Étape en cours de rédaction.' },
      // ⟨fin-etape irrationnels⟩
    ],
  },
  {
    id: 'ecritures-decimales',
    number: 2,
    title: 'Écritures décimales des rationnels et des irrationnels',
    kicker: 'limitée, périodique ou illimitée non périodique',
    titreCourt: 'Écritures décimales',
    partie: 'Les nombres réels',
    blocks: [
      { kind: 'para', text: 'Étape en cours de rédaction.' },
      // ⟨fin-etape ecritures-decimales⟩
    ],
  },
  {
    id: 'axiomes',
    number: 3,
    title: 'Les axiomes des nombres réels',
    kicker: 'quantificateurs, axiomes, Archimède, intervalles emboîtés',
    titreCourt: 'Axiomes de ℝ',
    partie: 'Les nombres réels',
    blocks: [
      { kind: 'para', text: 'Étape en cours de rédaction.' },
      // ⟨fin-etape axiomes⟩
    ],
  },
  {
    id: 'valeur-absolue',
    number: 4,
    title: 'Valeur absolue et distance',
    kicker: '|x − y| est la distance entre x et y',
    titreCourt: 'Valeur absolue',
    partie: 'Les nombres réels',
    blocks: [
      { kind: 'para', text: 'Étape en cours de rédaction.' },
      {
        kind: 'atelier',
        tag: 'valeur-absolue-distance-widget',
        label: 'Manipule toi-même : valeur absolue et distance sur la droite',
        caption:
          'Règle a et r, choisis le symbole (<, ≤, >, ≥ ou =) : les solutions de |x − a| ◇ r s’allument sur la droite et s’écrivent en intervalles. Fais glisser le point x pour lire sa distance à a. Essaie aussi r = 0 et r négatif : une distance n’est jamais négative.',
      },
      // ⟨fin-etape valeur-absolue⟩
    ],
  },
  {
    id: 'approcher-densite',
    number: 5,
    title: 'Encadrer, approcher, densité',
    kicker: 'erreurs, algorithme de Héron, dénombrable ou continu',
    titreCourt: 'Approcher un réel',
    partie: 'Les nombres réels',
    blocks: [
      { kind: 'para', text: 'Étape en cours de rédaction.' },
      {
        kind: 'atelier',
        tag: 'heron-rectangles-widget',
        label: 'Manipule toi-même : les rectangles de Héron',
        caption:
          'Tous les rectangles ont la même aire A ; la longueur suivante est la moyenne des deux côtés. Les rectangles se rapprochent du carré de côté √A, et chacun encadre √A entre sa largeur et sa longueur. Les chiffres communs aux deux bornes, donc sûrs, sont en vert : leur nombre double à peu près à chaque étape.',
      },
      // ⟨fin-etape approcher-densite⟩
    ],
  },
]

/** Puces de « Ce qu'il faut retenir » de cette partie (KaTeX, voir content-authoring.md « Synthèses en KaTeX »). */
export const recapItemsReels: string[] = []

/** Groupes du formulaire de fin de chapitre pour cette partie (formules utiles aux générateurs). */
export const formulaireGroupesReels: FormulaireGroupe[] = []
