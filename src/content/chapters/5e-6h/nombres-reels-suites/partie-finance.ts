import type { ChapterSection, FormulaireGroupe } from '../../../types'

/**
 * 5e (6h) — Nombres réels et suites, partie « Algèbre financière ».
 * Squelette posé par le coordinateur (26/11/2026) : ids, numéros, titres FIXES (les agents de générateurs et
 * d'ateliers y accrochent leurs blocs). Garder le marqueur `// ⟨fin-etape …⟩` en dernière ligne de chaque `blocks`.
 */
export const sectionsFinance: ChapterSection[] = [
  {
    id: 'interets',
    number: 11,
    title: 'Intérêt simple, intérêts composés',
    kicker: 'I = C₀·i·t et Cₙ = C₀(1 + i)ⁿ',
    titreCourt: 'Intérêts',
    partie: 'Algèbre financière',
    blocks: [
      { kind: 'para', text: 'Étape en cours de rédaction.' },
      {
        kind: 'atelier',
        tag: 'simple-compose-widget',
        label: 'Manipule toi-même : intérêt simple ou intérêts composés ?',
        caption:
          'Pour 10 000 € placés, la valeur acquise à intérêt simple suit une droite, celle à intérêts composés une courbe. Elles se croisent au bout d’un an : avant, l’intérêt simple rapporte un peu plus ; après, les intérêts composés l’emportent. Augmente le taux pour mieux voir l’écart.',
      },
      // ⟨fin-etape interets⟩
    ],
  },
  {
    id: 'taux-equivalents',
    number: 12,
    title: 'Taux équivalents et taux réel',
    kicker: '(1 + i_mensuel)¹² = 1 + i_annuel',
    titreCourt: 'Taux équivalents',
    partie: 'Algèbre financière',
    blocks: [
      { kind: 'para', text: 'Étape en cours de rédaction.' },
      // ⟨fin-etape taux-equivalents⟩
    ],
  },
  {
    id: 'annuites',
    number: 13,
    title: 'Annuités : placer et rembourser',
    kicker: 'valeur acquise Vₙ, valeur actuelle V₀',
    titreCourt: 'Annuités',
    partie: 'Algèbre financière',
    blocks: [
      { kind: 'para', text: 'Étape en cours de rédaction.' },
      {
        kind: 'atelier',
        tag: 'ligne-temps-annuites-widget',
        label: 'Manipule toi-même : la ligne du temps des annuités',
        caption:
          'Règle le versement, leur nombre et le taux, puis choisis la date d’évaluation : chaque versement est capitalisé (flèche vers la droite, × (1 + i) par période) ou actualisé (vers la gauche, × (1 + i)⁻¹). La somme des valeurs donne Vₙ, V₀ ou Vₙ(1 + i).',
      },
      // ⟨fin-etape annuites⟩
    ],
  },
  {
    id: 'credit',
    number: 14,
    title: 'Crédit à la consommation',
    kicker: 'TAEG, mensualité, tableau d’amortissement',
    titreCourt: 'Crédit',
    partie: 'Algèbre financière',
    blocks: [
      { kind: 'para', text: 'Étape en cours de rédaction.' },
      {
        kind: 'atelier',
        tag: 'simulateur-credit-widget',
        label: 'Manipule toi-même : simulateur de crédit',
        caption:
          'Règle le capital emprunté, le TAEG et la durée : le simulateur calcule le taux mensuel équivalent, la mensualité et le coût du crédit. Les barres montrent, mois après mois, la part d’intérêts (qui diminue) et la part de capital remboursé (qui augmente) ; le tableau d’amortissement détaille chaque ligne.',
      },
      // ⟨fin-etape credit⟩
    ],
  },
]

/** Puces de « Ce qu'il faut retenir » de cette partie (KaTeX, voir content-authoring.md « Synthèses en KaTeX »). */
export const recapItemsFinance: string[] = []

/** Groupes du formulaire de fin de chapitre pour cette partie (formules utiles aux générateurs). */
export const formulaireGroupesFinance: FormulaireGroupe[] = []
