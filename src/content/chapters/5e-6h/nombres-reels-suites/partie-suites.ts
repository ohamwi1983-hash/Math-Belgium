import type { ChapterSection } from '../../../types'

/**
 * 5e (6h) — Nombres réels et suites, partie « Les suites ».
 * Squelette posé par le coordinateur (26/11/2026) : ids, numéros, titres FIXES (les agents de générateurs et
 * d'ateliers y accrochent leurs blocs). Garder le marqueur `// ⟨fin-etape …⟩` en dernière ligne de chaque `blocks`.
 */
export const sectionsSuites: ChapterSection[] = [
  {
    id: 'definir-suite',
    number: 6,
    title: 'Définir et représenter une suite',
    kicker: 'formule explicite ou récurrence, suite = fonction sur ℕ₀',
    titreCourt: 'Définir une suite',
    partie: 'Les suites',
    blocks: [
      { kind: 'para', text: 'Étape en cours de rédaction.' },
      // ⟨fin-etape definir-suite⟩
    ],
  },
  {
    id: 'suites-arithmetiques',
    number: 7,
    title: 'Suites arithmétiques',
    kicker: 'uₙ = u₁ + (n − 1)r, somme et symbole Σ',
    titreCourt: 'Suites arithmétiques',
    partie: 'Les suites',
    blocks: [
      { kind: 'para', text: 'Étape en cours de rédaction.' },
      // ⟨fin-etape suites-arithmetiques⟩
    ],
  },
  {
    id: 'suites-geometriques',
    number: 8,
    title: 'Suites géométriques',
    kicker: 'uₙ = u₁·qⁿ⁻¹, somme par S − qS',
    titreCourt: 'Suites géométriques',
    partie: 'Les suites',
    blocks: [
      { kind: 'para', text: 'Étape en cours de rédaction.' },
      // ⟨fin-etape suites-geometriques⟩
    ],
  },
  {
    id: 'limite-suite',
    number: 9,
    title: 'Limite d’une suite',
    kicker: 'convergence, définition avec ε',
    titreCourt: 'Limite d’une suite',
    partie: 'Les suites',
    blocks: [
      { kind: 'para', text: 'Étape en cours de rédaction.' },
      // ⟨fin-etape limite-suite⟩
    ],
  },
  {
    id: 'sommes-infinies',
    number: 10,
    title: 'Sommes infinies',
    kicker: 'limite des sommes partielles, série harmonique',
    titreCourt: 'Sommes infinies',
    partie: 'Les suites',
    blocks: [
      { kind: 'para', text: 'Étape en cours de rédaction.' },
      // ⟨fin-etape sommes-infinies⟩
    ],
  },
]
