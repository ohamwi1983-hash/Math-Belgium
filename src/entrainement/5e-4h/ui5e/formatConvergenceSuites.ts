/**
 * Couche présentation (5e) — consignes/labels/aides pour 5gen16 ("Convergence et divergence des
 * suites"). 3 variantes disjointes, séquences courtes (1 ou 2 écrans).
 *
 * CORRECTIF (même défaut transversal que 5gen15, `formatSuiteGeometrique.ts` — voir son en-tête) :
 * `texteAideNiveau1` retourne désormais du LaTeX PUR sur les 4 cas comportant de la notation
 * mathématique (auparavant du texte brut avec `→`/`u₁`/`1/n`, rendu en `<p>` plutôt que `<Katex
 * block>` dans `EtapeClassificationConvergence.tsx`/`EtapeDiviserQuelconque.tsx`) ; les 2 cas sans
 * notation mathématique (`diviserQuelconque`, sous-cas `degP > degQ`) restent du texte brut,
 * inchangés. Fraction `\lim=` (aide niveau 2, `classifierQuelconque`) désormais réduite par PGCD
 * (`fractionReduiteLatex`) — évite un `4/6` non simplifié, repris tel quel par le récapitulatif
 * (`ResultatPanelConvergenceSuites.tsx`) puisqu'il réutilise cette même fonction.
 */
import type { ExerciceConvergenceQuelconque, ExerciceConvergenceSuite, PolynomeConvergence } from "../core5e/convergenceSuites.types";
import type { FractionQ } from "../core5e/suitesGeometriques.types";
import type { PhaseConvergenceSuite } from "../moteur5e/typesConvergenceSuites";

/** Fraction irréductible en LaTeX — entier si `den===1`, sinon fraction (signe porté par `num`) —
 * jamais un décimal (`prompt5gen155gen16arithmetiqueexacte.md`). */
function fractionQVersLatex(f: FractionQ): string {
  if (f.den === 1) return `${f.num}`;
  return f.num < 0 ? `-\\dfrac{${-f.num}}{${f.den}}` : `\\dfrac{${f.num}}{${f.den}}`;
}

/** PGCD (Euclide, valeur absolue, retour ≥1). */
function pgcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) [x, y] = [y, x % y];
  return x || 1;
}

/** Fraction `num/den` réduite par le PGCD, dénominateur toujours affiché positif (signe porté par
 * le numérateur) — entier si la réduction donne den=1, sinon `\dfrac` — même convention que
 * `fractionQVersLatex` ci-dessus (et que `fractionQ()` dans
 * `generateurs5e/suitesGeometriques/fraction.ts`, jamais importé ici entre couches). */
function fractionReduiteLatex(num: number, den: number): string {
  const g = pgcd(num, den);
  let n = num / g;
  let d = den / g;
  if (d < 0) {
    n = -n;
    d = -d;
  }
  return d === 1 ? `${n}` : `\\dfrac{${n}}{${d}}`;
}

export interface OptionClassification {
  id: string;
  label: string;
  requiertValeur?: boolean;
}

export function consigneGenerale(exercice: ExerciceConvergenceSuite): string {
  switch (exercice.variante) {
    case "arithmetique":
      return "Cette suite arithmétique converge-t-elle ou diverge-t-elle ?";
    case "geometrique":
      return "Cette suite géométrique converge-t-elle ou diverge-t-elle ?";
    case "quelconque":
      return "Étudie la limite de cette suite rationnelle quand n tend vers l'infini.";
  }
}

function formatPolynomeLatex(p: { a: number; b: number; c: number }): string {
  const termes: string[] = [];
  if (p.a !== 0) termes.push(p.a === 1 ? "n^2" : p.a === -1 ? "-n^2" : `${p.a}n^2`);
  if (p.b !== 0) {
    const signe = termes.length > 0 && p.b > 0 ? "+" : "";
    termes.push(`${signe}${p.b === 1 ? "n" : p.b === -1 ? "-n" : `${p.b}n`}`);
  }
  if (p.c !== 0 || termes.length === 0) {
    const signe = termes.length > 0 && p.c > 0 ? "+" : "";
    termes.push(`${signe}${p.c}`);
  }
  return termes.join("");
}

export function formatTermesDonneesLatex(exercice: ExerciceConvergenceSuite): string[] {
  if (exercice.variante === "arithmetique") return [`u_1=${exercice.u1}`, `r=${exercice.r}`];
  if (exercice.variante === "geometrique") return [`u_1=${exercice.u1}`, `q=${fractionQVersLatex(exercice.q)}`];
  return [`u_n=\\dfrac{${formatPolynomeLatex(exercice.P)}}{${formatPolynomeLatex(exercice.Q)}}`];
}

/** Un terme signé `coef·n^exposant` (exposant négatif ⟹ fraction `coef/n^{|exposant|}`) — jamais de
 * coefficient `±1` littéral, jamais de terme nul affiché. Retourne "" si `coef===0` (filtré par
 * `joindreTermesSignes`). */
function formatTermePuissanceLatex(coef: number, exposant: number): string {
  if (coef === 0) return "";
  const abs = Math.abs(coef);
  const signe = coef > 0 ? "+" : "-";
  if (exposant === 0) return `${signe}${abs}`;
  if (exposant > 0) {
    const base = exposant === 1 ? "n" : `n^{${exposant}}`;
    return `${signe}${abs === 1 ? base : `${abs}${base}`}`;
  }
  const base = exposant === -1 ? "n" : `n^{${-exposant}}`;
  return `${signe}\\dfrac{${abs}}{${base}}`;
}

/** Joint des termes signés (retournés par `formatTermePuissanceLatex`) en une somme LaTeX propre —
 * jamais de "+" en tête, jamais de terme vide. "0" si tous les termes sont nuls (jamais atteint en
 * pratique, le coefficient dominant d'un polynôme de ce contrat est toujours non nul). */
function joindreTermesSignes(termes: string[]): string {
  const nonVides = termes.filter((t) => t !== "");
  if (nonVides.length === 0) return "0";
  const [premier, ...reste] = nonVides;
  return (premier.startsWith("+") ? premier.slice(1) : premier) + reste.join("");
}

/** P(n)/Q(n) divisé haut et bas par la plus haute puissance de n au dénominateur (n^degQ) — la
 * forme canonique attendue à l'écran "diviserQuelconque" (la vérification, elle, accepte toute
 * forme équivalente, voir `diagnostiquerDiviserQuelconque`). Générique sur les 3 combinaisons de
 * degrés réellement produites par le générateur ((1,2), (2,1), (1,1)/(2,2)) : diviser chaque terme
 * a·n²+b·n+c par n^degQ décale son exposant de -degQ, qu'il s'agisse du numérateur ou du
 * dénominateur. */
export function formatExpressionDiviseeLatex(exercice: ExerciceConvergenceQuelconque): string {
  const { P, Q, degQ } = exercice;
  const termesDivises = (p: PolynomeConvergence) => [formatTermePuissanceLatex(p.a, 2 - degQ), formatTermePuissanceLatex(p.b, 1 - degQ), formatTermePuissanceLatex(p.c, -degQ)];
  const numerateur = joindreTermesSignes(termesDivises(P));
  const denominateur = joindreTermesSignes(termesDivises(Q));
  return `u_n = \\dfrac{${numerateur}}{${denominateur}}`;
}

/**
 * Bloc "état actuel" — récapitule, sur l'écran "classifierQuelconque" SEULEMENT, l'expression déjà
 * simplifiée à l'écran "diviserQuelconque" (dérivée de `exercice`, jamais de la saisie de l'élève).
 * Rien pour "arithmetique"/"geometrique" (écran unique, rien à récapituler avant) ni pour
 * "diviserQuelconque" lui-même (premier écran de la séquence "quelconque").
 */
export function formatTermesEtatActuelConvergence(exercice: ExerciceConvergenceSuite, phase: PhaseConvergenceSuite): string[] {
  if (phase !== "classifierQuelconque" || exercice.variante !== "quelconque") return [];
  return [formatExpressionDiviseeLatex(exercice)];
}

/** Libellé (texte brut, jamais LaTeX) de la classification RÉELLEMENT attendue pour un écran de
 * classification donné — recherché dans le même catalogue d'options que celui affiché à l'élève
 * (`optionsClassification`), jamais un second texte dupliqué. */
export function libelleClassificationAttendue(exercice: ExerciceConvergenceSuite, phase: PhaseConvergenceSuite): string {
  const classification =
    phase === "classificationArithmetique" && exercice.variante === "arithmetique"
      ? exercice.classification
      : phase === "classificationGeometrique" && exercice.variante === "geometrique"
        ? exercice.classification
        : phase === "classifierQuelconque" && exercice.variante === "quelconque"
          ? exercice.classification
          : null;
  if (classification === null) return "";
  return optionsClassification(exercice, phase).find((o) => o.id === classification)?.label ?? "";
}

export const LIBELLE_PHASE_CONVERGENCE_SUITE: Record<PhaseConvergenceSuite, string> = {
  classificationArithmetique: "Classification (arithmétique)",
  classificationGeometrique: "Classification (géométrique)",
  diviserQuelconque: "Diviser par la plus haute puissance",
  classifierQuelconque: "Conclure sur la limite",
};

export function consignePhase(_exercice: ExerciceConvergenceSuite, phase: PhaseConvergenceSuite): string {
  switch (phase) {
    case "classificationArithmetique":
      return "Cette suite converge-t-elle ou diverge-t-elle ? Si elle diverge, précise le sens.";
    case "classificationGeometrique":
      return "Cette suite converge-t-elle ou diverge-t-elle ? Attention aux cas particuliers.";
    case "diviserQuelconque":
      return "Divise le numérateur et le dénominateur par la plus haute puissance de n présente au DÉNOMINATEUR.";
    case "classifierQuelconque":
      return "Conclus : quelle est la limite de cette suite ? (arrondis au centième près si tu dois entrer une valeur)";
  }
  return "";
}

const OPTIONS_ARITHMETIQUE: OptionClassification[] = [
  { id: "convergeVersU1", label: "Converge vers u₁" },
  { id: "divergePlusInfini", label: "Diverge vers +∞" },
  { id: "divergeMoinsInfini", label: "Diverge vers -∞" },
];

const OPTIONS_GEOMETRIQUE: OptionClassification[] = [
  { id: "convergeVersU1", label: "Converge vers u₁" },
  { id: "convergeVersZero", label: "Converge vers 0" },
  { id: "divergePlusInfini", label: "Diverge vers +∞" },
  { id: "divergeMoinsInfini", label: "Diverge vers -∞" },
  { id: "oscilleNeConvergePas", label: "Oscille, ne converge pas" },
  { id: "oscilleDivergeSansLimite", label: "Oscille avec amplitude croissante, diverge" },
];

const OPTIONS_QUELCONQUE: OptionClassification[] = [
  { id: "limiteZero", label: "Converge vers 0" },
  { id: "limiteValeur", label: "Converge vers une autre valeur", requiertValeur: true },
  { id: "divergePlusInfini", label: "Diverge vers +∞" },
  { id: "divergeMoinsInfini", label: "Diverge vers -∞" },
];

export function optionsClassification(_exercice: ExerciceConvergenceSuite, phase: PhaseConvergenceSuite): OptionClassification[] {
  if (phase === "classificationArithmetique") return OPTIONS_ARITHMETIQUE;
  if (phase === "classificationGeometrique") return OPTIONS_GEOMETRIQUE;
  if (phase === "classifierQuelconque") return OPTIONS_QUELCONQUE;
  return [];
}

export function texteAideNiveau1(exercice: ExerciceConvergenceSuite, phase: PhaseConvergenceSuite): string {
  switch (phase) {
    case "classificationArithmetique":
      return "r=0 \\Rightarrow \\text{converge vers } u_1. \\quad r>0 \\Rightarrow \\text{diverge vers } +\\infty. \\quad r<0 \\Rightarrow \\text{diverge vers } -\\infty.";
    case "classificationGeometrique":
      return "q=1 \\Rightarrow \\text{converge vers } u_1. \\quad |q|<1 \\Rightarrow \\text{converge vers } 0. \\quad q>1 \\Rightarrow \\text{diverge vers } \\pm\\infty \\text{ selon le signe de } u_1. \\quad q=-1 \\Rightarrow \\text{oscille sans converger. } \\quad q<-1 \\Rightarrow \\text{oscille avec amplitude croissante.}";
    case "diviserQuelconque":
      return "Repère la plus haute puissance de n au DÉNOMINATEUR, puis divise CHAQUE terme (numérateur ET dénominateur) par cette puissance.";
    case "classifierQuelconque": {
      const e = exercice as ExerciceConvergenceQuelconque;
      if (e.degP < e.degQ) return "n \\text{ élevé à une puissance négative tend vers } 0 \\text{ : tous les termes en } \\dfrac{1}{n}, \\dfrac{1}{n^2}\\ldots \\text{ disparaissent.}";
      if (e.degP === e.degQ) return "\\text{Les termes en } \\dfrac{1}{n} \\text{ disparaissent, il reste le rapport des coefficients dominants.}";
      return "Le dénominateur a disparu au numérateur mais pas au dénominateur : la suite diverge — détermine le signe.";
    }
  }
  return "";
}

export function texteAideNiveau2(exercice: ExerciceConvergenceSuite, phase: PhaseConvergenceSuite): string {
  if (phase === "diviserQuelconque" && exercice.variante === "quelconque") {
    const e = exercice as ExerciceConvergenceQuelconque;
    return `${e.degQ === 2 ? "n^2" : "n"}`;
  }
  if (phase === "classifierQuelconque" && exercice.variante === "quelconque") {
    const e = exercice as ExerciceConvergenceQuelconque;
    if (e.classification === "limiteValeur") {
      const dominantP = e.degP === 2 ? e.P.a : e.P.b;
      const dominantQ = e.degQ === 2 ? e.Q.a : e.Q.b;
      return `\\lim = ${fractionReduiteLatex(dominantP, dominantQ)}`;
    }
  }
  return "";
}
