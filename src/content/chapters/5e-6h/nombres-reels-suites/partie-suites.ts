import type { ChapterSection, FormulaireGroupe } from '../../../types'

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
      {
        kind: 'atelier',
        tag: 'calculatrice-prudence-widget',
        label: 'Manipule toi-même : calculatrice… prudence !',
        caption:
          'La suite définie par u₁ = 1⁄7 et uₙ₊₁ = 29uₙ − 4 est constante : 29 · 1⁄7 − 4 = 1⁄7. Mais si on tape u₁ arrondi à k décimales, l’écart avec 1⁄7 est multiplié par 29 à chaque pas, et les termes calculés finissent par s’envoler, même avec quinze décimales.',
      },
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
      {
        kind: 'atelier',
        tag: 'serie-harmonique-widget',
        label: 'Manipule toi-même : la série harmonique diverge',
        caption:
          'Groupe les termes 1⁄n par paquets de 1, 2, 4, 8… termes : chaque paquet vaut au moins 1⁄2 (Oresme). Les sommes partielles dépassent donc n’importe quel nombre, très lentement : il faut 12 367 termes pour dépasser 10.',
      },
      {
        kind: 'atelier',
        tag: 'fractales-widget',
        label: 'Manipule toi-même : flocon de von Koch et triangle de Sierpinski',
        caption:
          'Avance étape par étape. Le flocon de von Koch a une aire qui tend vers 2√3⁄5 (pour un triangle de départ de côté 1) et un périmètre qui tend vers +∞ ; le triangle de Sierpinski a une aire qui tend vers 0 et un périmètre total qui tend vers +∞. Le panneau écrit les suites géométriques qui le prouvent.',
      },
      // ⟨fin-etape sommes-infinies⟩
    ],
  },
]

/** Puces de « Ce qu'il faut retenir » de cette partie (KaTeX, voir content-authoring.md « Synthèses en KaTeX »). */
export const recapItemsSuites: string[] = []

/** Groupes du formulaire de fin de chapitre pour cette partie (formules utiles aux générateurs). */
export const formulaireGroupesSuites: FormulaireGroupe[] = []
