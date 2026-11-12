import type { CleBranche, CleCellule, ExerciceArbreTableauEffectifs } from "../core6e/arbreTableauEffectifs.types";
import { ORDRE_BRANCHES, ORDRE_CELLULES } from "../core6e/arbreTableauEffectifs.types";
import type { PhaseArbreTableauEffectifs } from "../moteur6e/typesArbreTableauEffectifs";
import { phasesPourExercice } from "../moteur6e/typesArbreTableauEffectifs";
import type { Fraction } from "../moteur6e/verificationArbreTableauEffectifs";
import {
  branchesInconnues,
  cellulesInconnues,
  fractionASachantB,
  fractionB,
  fractionBSachantA,
  fractionBranche,
  pgcd,
  sontIndependantsArbreTableau,
  valeurBranche,
} from "../moteur6e/verificationArbreTableauEffectifs";

/**
 * Couche ui (6e) — textes, champs, aides, figures et réponses attendues de `6gen74`. Toutes les
 * valeurs viennent de `moteur6e/verificationArbreTableauEffectifs.ts` ; l'adaptateur papier
 * (`generateurs6e/arbreTableauEffectifs/exportEvaluation.ts`) réutilise ces mêmes fonctions.
 *
 * Notations du cours : `P(B\mid A)`, `\bar{A}`. Les lettres des événements dépendent du contexte
 * (V et G pour la vaccination et la grippe…) ; leurs définitions, en prose, sont données UNE fois
 * dans la consigne générale — jamais de mots en mode mathématique.
 */

export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

export interface ChampDef {
  label: string;
  labelLatex: string;
  placeholder: string;
}

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

export interface OptionChoix {
  id: string;
  label: string;
}

function txt(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}
function ltx(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
}

export const LIBELLE_PHASE: Record<PhaseArbreTableauEffectifs, string> = {
  arbre: "Arbre pondéré",
  tableau: "Tableau des effectifs",
  conditionnelles: "Probabilités conditionnelles",
  independance: "Indépendance",
};

// ============================================================================
// Nombres
// ============================================================================

const ESPACE_FINE = " ";

/** Entier en texte, espace fine insécable pour les milliers (« 1 000 »). */
export function entierTexte(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ESPACE_FINE);
}

export function entierLatex(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "\\,");
}

/** Décimal (au plus 4 décimales), virgule française, pour du TEXTE (figure, prose). */
export function decimalTexte(v: number): string {
  return String(Math.round(v * 10000) / 10000).replace(".", ",");
}

export function decimalLatex(v: number): string {
  return decimalTexte(v).replace(",", "{,}");
}

/** `true` si num/den s'écrit exactement avec au plus 4 décimales. */
function decimalExact(f: Fraction): boolean {
  return Math.abs(Math.round((f.num / f.den) * 10000) * f.den - f.num * 10000) < 1e-6;
}

export function fractionLatex(f: Fraction): string {
  return `\\dfrac{${entierLatex(f.num)}}{${entierLatex(f.den)}}`;
}

/** « \dfrac{48}{132}=\dfrac{4}{11}\approx0{,}36 » : la fraction d'effectifs, sa forme irréductible
 * si elle diffère, puis sa valeur décimale (exacte, ou arrondie au centième). */
export function egaliteFraction(f: Fraction): string {
  const d = pgcd(f.num, f.den);
  const simple = { num: f.num / d, den: f.den / d };
  let s = fractionLatex(f);
  if (d > 1 && simple.den !== 1) s += `=${fractionLatex(simple)}`;
  const v = f.num / f.den;
  s += decimalExact(f) ? `=${decimalLatex(v)}` : `\\approx${(Math.round(v * 100) / 100).toFixed(2).replace(".", "{,}")}`;
  return s;
}

// ============================================================================
// Notations
// ============================================================================

function lettres(ex: ExerciceArbreTableauEffectifs): { A: string; B: string } {
  return { A: ex.contexte.lettreA, B: ex.contexte.lettreB };
}

export function latexBranche(ex: ExerciceArbreTableauEffectifs, cle: CleBranche): string {
  const { A, B } = lettres(ex);
  switch (cle) {
    case "A":
      return `P(${A})`;
    case "nA":
      return `P(\\bar{${A}})`;
    case "B_A":
      return `P(${B}\\mid ${A})`;
    case "nB_A":
      return `P(\\bar{${B}}\\mid ${A})`;
    case "B_nA":
      return `P(${B}\\mid \\bar{${A}})`;
    case "nB_nA":
      return `P(\\bar{${B}}\\mid \\bar{${A}})`;
  }
}

export function latexCellule(ex: ExerciceArbreTableauEffectifs, cle: CleCellule): string {
  const { A, B } = lettres(ex);
  switch (cle) {
    case "AB":
      return `n(${A}\\cap ${B})`;
    case "AnB":
      return `n(${A}\\cap \\bar{${B}})`;
    case "A":
      return `n(${A})`;
    case "nAB":
      return `n(\\bar{${A}}\\cap ${B})`;
    case "nAnB":
      return `n(\\bar{${A}}\\cap \\bar{${B}})`;
    case "nA":
      return `n(\\bar{${A}})`;
    case "B":
      return `n(${B})`;
    case "nB":
      return `n(\\bar{${B}})`;
    case "N":
      return "N";
  }
}

export function latexPBsachantA(ex: ExerciceArbreTableauEffectifs): string {
  const { A, B } = lettres(ex);
  return `P(${B}\\mid ${A})`;
}

export function latexPAsachantB(ex: ExerciceArbreTableauEffectifs): string {
  const { A, B } = lettres(ex);
  return `P(${A}\\mid ${B})`;
}

/** Lettre surlignée en texte brut (figure SVG) : macron combinant U+0304. */
export function lettreBarreTexte(lettre: string): string {
  return `${lettre}̄`;
}

// ============================================================================
// Consignes
// ============================================================================

function pourcent(v: number): string {
  return `${decimalTexte(Math.round(v * 10000) / 100)}${ESPACE_FINE}%`;
}

function majuscule(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Phrase d'introduction + définitions des événements (commune aux trois sens de départ). */
export function introductionEtEvenements(ex: ExerciceArbreTableauEffectifs): FragmentConsigne[] {
  const c = ex.contexte;
  const { A, B } = lettres(ex);
  return [
    txt(`${c.introduction.replace("{N}", entierTexte(ex.effectifs.N))} On choisit ${c.individu} au hasard. On note `),
    ltx(A),
    txt(` l'événement « ${c.definitionA} » et `),
    ltx(B),
    txt(` l'événement « ${c.definitionB} ».`),
  ];
}

/** Phrases des pourcentages (sens de départ `pourcentages`). */
export function phrasesPourcentages(ex: ExerciceArbreTableauEffectifs): string {
  const c = ex.contexte;
  return (
    `${pourcent(valeurBranche(ex, "A"))} des ${c.population} ${c.verbeA}. ` +
    `${majuscule(`parmi ${c.groupeA}`)}, ${pourcent(valeurBranche(ex, "B_A"))} ${c.verbeB} ; ` +
    `parmi ${c.groupeNonA}, ${pourcent(valeurBranche(ex, "B_nA"))} ${c.verbeB}.`
  );
}

export function consigneGenerale(ex: ExerciceArbreTableauEffectifs): FragmentConsigne[] {
  const debut = introductionEtEvenements(ex);
  switch (ex.mode) {
    case "pourcentages":
      return [...debut, txt(` ${phrasesPourcentages(ex)}`)];
    case "arbrePartiel":
      return [...debut, txt(" L'arbre pondéré ci-dessous décrit la situation ; certaines branches sont à compléter.")];
    case "tableauPartiel":
      return [...debut, txt(" Le tableau ci-dessous donne une partie des effectifs.")];
  }
}

export function consigneEcran(ex: ExerciceArbreTableauEffectifs, phase: PhaseArbreTableauEffectifs): FragmentConsigne[] {
  const { A, B } = lettres(ex);
  switch (phase) {
    case "arbre":
      if (ex.mode === "pourcentages") return [txt("Traduis les pourcentages en probabilités et complète l'arbre pondéré : donne la probabilité portée par chaque branche (forme exacte ou décimale).")];
      if (ex.mode === "arbrePartiel") return [txt("Complète l'arbre pondéré : donne la probabilité de chaque branche marquée « ? » (forme exacte ou décimale).")];
      return [txt("À partir du tableau des effectifs, complète l'arbre pondéré : donne la probabilité portée par chaque branche (forme exacte ou décimale).")];
    case "tableau":
      if (ex.mode === "tableauPartiel") return [txt("Complète le tableau des effectifs : calcule chaque case vide.")];
      return [txt(`Construis le tableau des effectifs des ${entierTexte(ex.effectifs.N)} ${ex.contexte.population} : calcule chaque case.`)];
    case "conditionnelles":
      return [txt("Calcule "), ltx(latexPBsachantA(ex)), txt(" et "), ltx(latexPAsachantB(ex)), txt(" (forme exacte ou décimale arrondie au centième).")];
    case "independance":
      return [txt("Les événements "), ltx(A), txt(" et "), ltx(B), txt(" sont-ils indépendants ?")];
  }
}

export const OPTIONS_INDEPENDANCE: OptionChoix[] = [
  { id: "oui", label: "Oui, ils sont indépendants" },
  { id: "non", label: "Non, ils ne sont pas indépendants" },
];

// ============================================================================
// Champs
// ============================================================================

/** Exemples HORS de l'espace de tirage : 0,07 n'est jamais une branche (multiples de 0,05) ni P(A|B)
 * (≥ 0,1 par construction) ; l'effectif d'exemple est choisi parmi des nombres qui ne sont AUCUNE
 * case du tableau de l'instance. */
const PLACEHOLDER_PROBABILITE = "ex : 0,07";

function placeholderEffectif(ex: ExerciceArbreTableauEffectifs): string {
  const valeurs = ORDRE_CELLULES.map((c) => ex.effectifs[c]);
  const choix = [37, 53, 71, 89, 97, 43].find((n) => !valeurs.includes(n)) ?? 7;
  return `ex : ${choix}`;
}

export function champsEcran(ex: ExerciceArbreTableauEffectifs, phase: PhaseArbreTableauEffectifs): ChampDef[] {
  switch (phase) {
    case "arbre":
      return branchesInconnues(ex).map((b) => ({ label: latexBranche(ex, b), labelLatex: latexBranche(ex, b), placeholder: PLACEHOLDER_PROBABILITE }));
    case "tableau": {
      const ph = placeholderEffectif(ex);
      return cellulesInconnues(ex).map((c) => ({ label: latexCellule(ex, c), labelLatex: latexCellule(ex, c), placeholder: ph }));
    }
    case "conditionnelles":
      return [latexPBsachantA(ex), latexPAsachantB(ex)].map((l) => ({ label: l, labelLatex: l, placeholder: PLACEHOLDER_PROBABILITE }));
    case "independance":
      return [];
  }
}

// ============================================================================
// Aides (sans la réponse : formules générales, exemple hors instance)
// ============================================================================

/** Deux formules d'aide l'une sous l'autre (lisible à 390 px, jamais coupé à droite). */
function deuxLignes(a: string, b: string): string {
  return `\\begin{gathered}${a}\\\\ ${b}\\end{gathered}`;
}

export function aideNiveau1(ex: ExerciceArbreTableauEffectifs, phase: PhaseArbreTableauEffectifs): AideAvecLatex {
  const { A, B } = lettres(ex);
  switch (phase) {
    case "arbre":
      if (ex.mode === "tableauPartiel")
        return {
          texte: "Au 1er niveau, on divise un effectif par l'effectif total ; au 2e niveau, on divise par l'effectif du nœud de départ, et non par N :",
          latex: deuxLignes(`P(${A})=\\dfrac{n(${A})}{N}`, `P(${B}\\mid ${A})=\\dfrac{n(${A}\\cap ${B})}{n(${A})}`),
        };
      return {
        texte: "Les branches qui partent d'un même nœud ont des probabilités de somme 1 :",
        latex: deuxLignes(`P(\\bar{${A}})=1-P(${A})`, `P(\\bar{${B}}\\mid ${A})=1-P(${B}\\mid ${A})`),
      };
    case "tableau":
      if (ex.mode === "tableauPartiel")
        return {
          texte: "Dans chaque ligne et dans chaque colonne, les deux cases ont pour somme le total :",
          latex: deuxLignes(`n(${A}\\cap ${B})+n(${A}\\cap \\bar{${B}})=n(${A})`, `n(${A})+n(\\bar{${A}})=N`),
        };
      return {
        texte: "L'effectif d'une case s'obtient en multipliant l'effectif total par les probabilités lues le long du chemin :",
        latex: deuxLignes(`n(${A})=N\\times P(${A})`, `n(${A}\\cap ${B})=N\\times P(${A})\\times P(${B}\\mid ${A})`),
      };
    case "conditionnelles":
      return {
        texte: "Une probabilité conditionnelle se calcule dans la sous-population de la condition, c'est-à-dire de l'événement écrit après la barre :",
        latex: deuxLignes(`P(${B}\\mid ${A})=\\dfrac{n(${A}\\cap ${B})}{n(${A})}`, `P(${A}\\mid ${B})=\\dfrac{n(${A}\\cap ${B})}{n(${B})}`),
      };
    case "independance":
      return {
        texte: `Deux événements sont indépendants lorsque savoir que ${A} est réalisé ne change pas la probabilité de ${B} :`,
        latex: `P(${B}\\mid ${A})=P(${B})`,
      };
  }
}

export function aideNiveau2(ex: ExerciceArbreTableauEffectifs, phase: PhaseArbreTableauEffectifs): AideAvecLatex {
  const { A, B } = lettres(ex);
  switch (phase) {
    case "arbre":
      if (ex.mode === "pourcentages")
        return {
          texte: "Le premier pourcentage donne le 1er niveau. Un pourcentage « parmi un groupe » donne une branche du 2e niveau, celle qui part du nœud de ce groupe. Pour convertir, on divise par 100, par exemple :",
          latex: "12\\,\\%=\\dfrac{12}{100}=0{,}12",
        };
      if (ex.mode === "arbrePartiel")
        return {
          texte: "Pour chaque nœud, la branche manquante est la complémentaire de la branche donnée qui part du MÊME nœud (jamais d'une branche issue d'un autre nœud) :",
          latex: `P(${B}\\mid \\bar{${A}})+P(\\bar{${B}}\\mid \\bar{${A}})=1`,
        };
      return {
        texte: "Les effectifs des nœuds se lisent dans la colonne des totaux (1er niveau) et dans les cases de la ligne correspondante (2e niveau) :",
        latex: `P(\\bar{${B}}\\mid \\bar{${A}})=\\dfrac{n(\\bar{${A}}\\cap \\bar{${B}})}{n(\\bar{${A}})}`,
      };
    case "tableau":
      if (ex.mode === "tableauPartiel")
        return {
          texte: "Commence par une ligne ou une colonne où il ne manque qu'une seule case. Une fois cette case trouvée, une autre ligne ou une autre colonne n'a plus qu'une case vide : recommence.",
          latex: null,
        };
      return {
        texte: "Les autres cases se complètent par soustraction, puis les totaux de colonne par addition :",
        latex: deuxLignes(`n(${A}\\cap \\bar{${B}})=n(${A})-n(${A}\\cap ${B})`, `n(${B})=n(${A}\\cap ${B})+n(\\bar{${A}}\\cap ${B})`),
      };
    case "conditionnelles":
      return {
        texte: "La première se lit aussi sur une branche de l'arbre. La seconde ne s'y lit pas : son dénominateur est le total de la colonne, qui réunit des individus des deux lignes :",
        latex: `n(${B})=n(${A}\\cap ${B})+n(\\bar{${A}}\\cap ${B})`,
      };
    case "independance":
      return {
        texte: "Calcule la probabilité de cet événement avec le tableau, puis compare-la à la probabilité conditionnelle trouvée à l'écran précédent :",
        latex: `P(${B})=\\dfrac{n(${B})}{N}`,
      };
  }
}

// ============================================================================
// Réponses attendues (validation, récapitulatif, corrigé)
// ============================================================================

export function formatReponseAttenduePhaseLatex(ex: ExerciceArbreTableauEffectifs, phase: PhaseArbreTableauEffectifs): string[] {
  switch (phase) {
    case "arbre":
      return branchesInconnues(ex).map((b) => `${latexBranche(ex, b)}=${decimalLatex(valeurBranche(ex, b))}`);
    case "tableau":
      return cellulesInconnues(ex).map((c) => `${latexCellule(ex, c)}=${entierLatex(ex.effectifs[c])}`);
    case "conditionnelles":
      return [`${latexPBsachantA(ex)}=${egaliteFraction(fractionBSachantA(ex))}`, `${latexPAsachantB(ex)}=${egaliteFraction(fractionASachantB(ex))}`];
    case "independance": {
      const { B } = lettres(ex);
      const bA = fractionBSachantA(ex);
      return [
        `${latexPBsachantA(ex)}=${decimalLatex(bA.num / bA.den)}`,
        `P(${B})=${egaliteFraction(fractionB(ex))}`,
        sontIndependantsArbreTableau(ex) ? `${latexPBsachantA(ex)}=P(${B})` : `${latexPBsachantA(ex)}\\neq P(${B})`,
      ];
    }
  }
}

export function verdictIndependanceTexte(ex: ExerciceArbreTableauEffectifs): string {
  const { A, B } = lettres(ex);
  return sontIndependantsArbreTableau(ex) ? `${A} et ${B} sont indépendants.` : `${A} et ${B} ne sont pas indépendants.`;
}

// ============================================================================
// Figures (arbre pondéré, tableau d'effectifs)
// ============================================================================

export interface ArbreAffichage {
  firstLevel: { label: string; prob: string }[];
  secondLevel: { fromFirst: number; label: string; prob: string }[];
}

export type EnTeteTableau = { latex: string } | { texte: string };

export interface TableauEffectifsAffichage {
  enTetesLignes: EnTeteTableau[];
  enTetesColonnes: EnTeteTableau[];
  /** 3 × 3 : `null` = case à compléter (champ de saisie à l'écran, vide sur papier). */
  cellules: { cle: CleCellule; valeur: string | null }[][];
}

/** Arbre de l'instance : `inconnues` = branches affichées « ? ». */
export function construireArbre(ex: ExerciceArbreTableauEffectifs, inconnues: CleBranche[]): ArbreAffichage {
  const { A, B } = lettres(ex);
  const prob = (b: CleBranche) => (inconnues.includes(b) ? "?" : decimalTexte(valeurBranche(ex, b)));
  return {
    firstLevel: [
      { label: A, prob: prob("A") },
      { label: lettreBarreTexte(A), prob: prob("nA") },
    ],
    secondLevel: [
      { fromFirst: 0, label: B, prob: prob("B_A") },
      { fromFirst: 0, label: lettreBarreTexte(B), prob: prob("nB_A") },
      { fromFirst: 1, label: B, prob: prob("B_nA") },
      { fromFirst: 1, label: lettreBarreTexte(B), prob: prob("nB_nA") },
    ],
  };
}

export function construireTableau(ex: ExerciceArbreTableauEffectifs, inconnues: CleCellule[]): TableauEffectifsAffichage {
  const { A, B } = lettres(ex);
  const cellule = (cle: CleCellule) => ({ cle, valeur: inconnues.includes(cle) ? null : entierTexte(ex.effectifs[cle]) });
  return {
    enTetesLignes: [{ latex: A }, { latex: `\\bar{${A}}` }, { texte: "Total" }],
    enTetesColonnes: [{ latex: B }, { latex: `\\bar{${B}}` }, { texte: "Total" }],
    cellules: [
      [cellule("AB"), cellule("AnB"), cellule("A")],
      [cellule("nAB"), cellule("nAnB"), cellule("nA")],
      [cellule("B"), cellule("nB"), cellule("N")],
    ],
  };
}

function rang(ex: ExerciceArbreTableauEffectifs, phase: PhaseArbreTableauEffectifs): number {
  return phasesPourExercice(ex).indexOf(phase);
}

/** Arbre affiché à l'écran : à compléter à l'écran « arbre » (« ? » sur les branches inconnues),
 * complet une fois cet écran passé, absent avant (sens `tableauPartiel`). */
export function arbreEcran(ex: ExerciceArbreTableauEffectifs, phase: PhaseArbreTableauEffectifs): ArbreAffichage | null {
  if (phase === "arbre") return construireArbre(ex, branchesInconnues(ex));
  return rang(ex, "arbre") < rang(ex, phase) ? construireArbre(ex, []) : null;
}

export function tableauEcran(ex: ExerciceArbreTableauEffectifs, phase: PhaseArbreTableauEffectifs): TableauEffectifsAffichage | null {
  if (phase === "tableau") return construireTableau(ex, cellulesInconnues(ex));
  return rang(ex, "tableau") < rang(ex, phase) ? construireTableau(ex, []) : null;
}

/** Utilitaire du corrigé : toutes les branches, dans l'ordre de lecture. */
export function toutesLesBranches(): CleBranche[] {
  return [...ORDRE_BRANCHES];
}

export { fractionBranche };
