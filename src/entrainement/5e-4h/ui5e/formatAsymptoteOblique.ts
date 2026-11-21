/**
 * Couche présentation (5e) — consignes/labels/aides pour 5gen21 ("Asymptote oblique"). 2 variantes,
 * 3 phases chacune (dont "conclureEquationAsymptote" PARTAGÉE) — `consignePhase`/`texteAideNiveau1`/
 * `texteAideNiveau2` dispatchent par phase (jamais besoin d'être variante-conscientes : chaque phase
 * n'appartient qu'à une seule variante, sauf la phase partagée, dont la cible ne dépend pas non plus
 * de la variante).
 */
import type { ExerciceAsymptoteOblique } from "../core5e/asymptoteOblique.types";
import { ordreComplet } from "../moteur5e/typesAsymptoteOblique";
import type { PhaseAsymptoteOblique } from "../moteur5e/typesAsymptoteOblique";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { AideTrig } from "./aidesTrigonometrie";
import { egaleA, lireLimite } from "../moteur5e/saisieLimites";

// ============================================================================
// Seed déterministe (transversal 3, même principe que 5gen20) — dérivé des champs déjà stockés,
// jamais un nouveau champ.
// ============================================================================

function hashSeed(...nums: number[]): number {
  let h = 2166136261;
  for (const n of nums) {
    h ^= Math.trunc(n) + 0x9e3779b9;
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seedExercice(exercice: ExerciceAsymptoteOblique): number {
  return hashSeed(exercice.a, exercice.b, exercice.c, ...exercice.coeffsD);
}

/** PRNG déterministe (mulberry32) — utilisé UNIQUEMENT pour permuter l'ordre d'affichage des
 * termes, jamais pour une valeur mathématique. */
function ordreTermesVarie(coeffs: number[], seed: number): number[] {
  const degres: number[] = [];
  for (let d = coeffs.length - 1; d >= 0; d--) if (coeffs[d] !== 0) degres.push(d);
  let s = seed;
  const rand = () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = degres.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [degres[i], degres[j]] = [degres[j], degres[i]];
  }
  return degres;
}

// ============================================================================
// Fragments LaTeX/texte de bas niveau — polynômes.
// ============================================================================

function formatMonomeLatex(coeff: number, degre: number, premier: boolean): string {
  if (coeff === 0) return "";
  const abs = Math.abs(coeff);
  const signe = coeff < 0 ? "-" : premier ? "" : "+";
  const variable = degre === 0 ? "" : degre === 1 ? "x" : `x^{${degre}}`;
  const coeffAffiche = abs === 1 && degre !== 0 ? "" : `${abs}`;
  return `${signe}${coeffAffiche}${variable}`;
}

/** `coeffs[i]` = coefficient de x^i — `seed` permute l'ORDRE d'affichage des termes (transversal 3),
 * jamais leur valeur. */
function formatPolynomeLatex(coeffs: number[], seed: number): string {
  const ordre = ordreTermesVarie(coeffs, seed);
  let out = "";
  let premier = true;
  for (const d of ordre) {
    const frag = formatMonomeLatex(coeffs[d], d, premier);
    if (frag !== "") {
      out += frag;
      premier = false;
    }
  }
  return out === "" ? "0" : out;
}

/** Quotient Q(x)=ax+b — TOUJOURS dans cet ordre fixe (2 termes seulement, jamais concerné par la
 * variation d'ordre du transversal 3, qui ne s'applique qu'au numérateur/dénominateur du bloc de
 * données). */
function formatQuotientLatex(a: number, b: number): string {
  return formatMonomeLatex(a, 1, true) + formatMonomeLatex(b, 0, false);
}

/** ax+b+c/D(x) — signe de `c` toujours distribué (jamais "+(-5)"), D(x) dans son ordre varié. */
function formatFormeDeveloppeeLatex(a: number, b: number, c: number, coeffsD: number[], seed: number): string {
  const dTexte = formatPolynomeLatex(coeffsD, seed);
  const fraction = c < 0 ? `-\\dfrac{${Math.abs(c)}}{${dTexte}}` : `+\\dfrac{${c}}{${dTexte}}`;
  return `${formatQuotientLatex(a, b)}${fraction}`;
}

// ============================================================================
// Consigne générale + bloc de données.
// ============================================================================

export function consigneGenerale(): string {
  return "Détermine l'équation de l'asymptote oblique de la fonction f(x) ci-dessous.";
}

/** La fonction SEULE (pas de "f(x)=" devant — déjà nommée par la consigne générale). */
export function formatTermesDonneesLatex(exercice: ExerciceAsymptoteOblique): string[] {
  const seed = seedExercice(exercice);
  return [`\\dfrac{${formatPolynomeLatex(exercice.coeffsP, seed)}}{${formatPolynomeLatex(exercice.coeffsD, seed + 1)}}`];
}

// ============================================================================
// Libellés/consignes par phase.
// ============================================================================

export const LIBELLE_PHASE_ASYMPTOTE_OBLIQUE: Record<PhaseAsymptoteOblique, string> = {
  diviserEuclidienne: "Division euclidienne",
  ecrireFormeDeveloppee: "Écrire f(x)",
  calculerCoefficientA: "Coefficient a",
  calculerCoefficientB: "Coefficient b",
  conclureEquationAsymptote: "Équation de l'asymptote",
};

export function labelPhase(phase: PhaseAsymptoteOblique): string {
  switch (phase) {
    case "ecrireFormeDeveloppee":
      return "f(x)=";
    case "calculerCoefficientA":
      return "a=";
    case "calculerCoefficientB":
      return "b=";
    case "conclureEquationAsymptote":
      // Notation du cours (« AO : y = ax + b »), plus « AO ≡ » sans y (audit 5c4a, 5gen21 point 2).
      return "\\text{AO : }y=";
    default:
      return "";
  }
}

/** Formule LaTeX affichée en mode DISPLAY (rendu empilé, notation de limite déjà corrigée sur
 * 5gen20) au-dessus du champ — UNIQUEMENT les 2 écrans "viaLimites" (chaîne vide sinon, aucun bloc
 * formule à afficher). */
export function formatFormulePhaseLatex(phase: PhaseAsymptoteOblique): string {
  switch (phase) {
    case "calculerCoefficientA":
      return "a=\\lim_{x\\to\\pm\\infty}\\dfrac{f(x)}{x}";
    case "calculerCoefficientB":
      return "b=\\lim_{x\\to\\pm\\infty}\\left[f(x)-ax\\right]";
    default:
      return "";
  }
}

/** Consigne d'écran en texte riche (`$…$` = KaTeX) : polynômes de l'énoncé dans leur ordre (titres
 * d'étape du corrigé compris — plus de « −33−7x²+x³+11x » en texte brut). */
export function consignePhase(exercice: ExerciceAsymptoteOblique, phase: PhaseAsymptoteOblique): string {
  const seed = seedExercice(exercice);
  switch (phase) {
    case "diviserEuclidienne":
      return `Effectue la division euclidienne de $${formatPolynomeLatex(exercice.coeffsP, seed)}$ par $${formatPolynomeLatex(exercice.coeffsD, seed + 1)}$. Détermine le quotient $Q(x)$ et le reste $R(x)$.`;
    case "ecrireFormeDeveloppee":
      return "Écris $f(x)$ sous la forme $Q(x)+\\dfrac{R(x)}{D(x)}$.";
    case "calculerCoefficientA":
      return "Calcule le coefficient $a$.";
    case "calculerCoefficientB":
      return "Calcule le coefficient $b$.";
    case "conclureEquationAsymptote":
      return "Donne l'équation de l'asymptote oblique.";
  }
}

// ============================================================================
// Aides — niveau 1 : la propriété du cours ; niveau 2 : la propriété posée pour CETTE fonction
// (jamais la réponse). Format `AideTrig` (phrase puis formules KaTeX), rendu par `AidesTrig`.
// ============================================================================

const tx = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const lx = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

function dominant(coeffs: number[]): string {
  const d = coeffs.length - 1;
  return formatMonomeLatex(coeffs[d], d, true);
}

export function aidesAsymptoteOblique(exercice: ExerciceAsymptoteOblique, phase: PhaseAsymptoteOblique): AideTrig[] {
  const seed = seedExercice(exercice);
  const P = formatPolynomeLatex(exercice.coeffsP, seed);
  const D = formatPolynomeLatex(exercice.coeffsD, seed + 1);
  const ax = formatMonomeLatex(exercice.a, 1, true);
  switch (phase) {
    case "diviserEuclidienne":
      return [
        {
          texte: [tx("Division euclidienne : à chaque tour, on divise le terme de plus haut degré du reste par celui de "), lx("D(x)"), tx(", on multiplie "), lx("D(x)"), tx(" par ce terme et on soustrait, jusqu'à un reste de degré inférieur à celui de "), lx("D(x)"), tx(" :")],
          formules: ["P(x)=Q(x)\\cdot D(x)+R(x)"],
        },
        {
          texte: [tx("Ici, le premier terme du quotient est le quotient des termes de plus haut degré ; le quotient est du premier degré et le reste est une constante :")],
          formules: [`\\dfrac{${dominant(exercice.coeffsP)}}{${dominant(exercice.coeffsD)}}`],
        },
      ];
    case "ecrireFormeDeveloppee":
      return [
        { texte: [tx("De "), lx("P(x)=Q(x)\\cdot D(x)+R(x)"), tx(", on divise chaque membre par "), lx("D(x)"), tx(" :")], formules: ["f(x)=Q(x)+\\dfrac{R(x)}{D(x)}"] },
        { texte: [tx("Ici, avec le quotient et le reste trouvés à l'étape 1 et le dénominateur de l'énoncé :")], formules: [`f(x)=Q(x)+\\dfrac{R(x)}{${D}}`] },
      ];
    case "calculerCoefficientA":
      return [
        { texte: [tx("En "), lx("\\pm\\infty"), tx(", un quotient de polynômes a la même limite que le quotient de leurs termes de plus haut degré :")], formules: ["a=\\lim_{x\\to\\pm\\infty}\\dfrac{f(x)}{x}"] },
        { texte: [tx("Ici, on divise f(x) par x, puis on garde les termes de plus haut degré du numérateur et du dénominateur :")], formules: [`\\dfrac{f(x)}{x}=\\dfrac{${P}}{x(${D})}`] },
      ];
    case "calculerCoefficientB":
      return [
        { texte: [tx("On réduit "), lx("f(x)-ax"), tx(" au même dénominateur, puis on compare les termes de plus haut degré :")], formules: ["b=\\lim_{x\\to\\pm\\infty}\\left[f(x)-ax\\right]"] },
        { texte: [tx("Ici, avec le coefficient a trouvé à l'étape 1 :")], formules: [`f(x)-${exercice.a < 0 ? `(${ax})` : ax}=\\dfrac{${P}-${exercice.a < 0 ? `(${ax})` : ax}(${D})}{${D}}`] },
      ];
    case "conclureEquationAsymptote":
      return exercice.variante === "divisionEuclidienne"
        ? [
            { texte: [tx("Dans "), lx("f(x)=Q(x)+\\dfrac{R(x)}{D(x)}"), tx(", la fraction tend vers 0 en "), lx("\\pm\\infty"), tx(" : l'asymptote oblique est la droite "), lx("y=Q(x)"), tx(", sans le reste.")] },
            { texte: [tx("Ici, écris le quotient trouvé à l'étape 1, seul :")], formules: ["\\text{AO : }y=Q(x)"] },
          ]
        : [
            { texte: [tx("Avec "), lx("a=\\lim\\dfrac{f(x)}{x}"), tx(" et "), lx("b=\\lim\\left[f(x)-ax\\right]"), tx(", l'asymptote oblique est la droite "), lx("y=ax+b"), tx(".")] },
            { texte: [tx("Ici, remplace a et b par les valeurs trouvées aux étapes 1 et 2 :")], formules: ["\\text{AO : }y=ax+b"] },
          ];
  }
}

// ============================================================================
// Messages ciblés (erreurs du cours), jamais la réponse.
// ============================================================================

/** Saisie égale à g aux points donnés (hors pôles). */
function egale(brut: string, g: (x: number) => number): boolean {
  return egaleA(brut, g);
}

export function cibleAsymptoteOblique(exercice: ExerciceAsymptoteOblique, phase: PhaseAsymptoteOblique, valeurs: string[]): FragmentConsigne[] | null {
  const { a, b, c, coeffsD } = exercice;
  const D = (x: number) => coeffsD.reduce((acc, k, i) => acc + k * x ** i, 0);
  switch (phase) {
    case "diviserEuclidienne": {
      const [q, r] = valeurs;
      const msgs: FragmentConsigne[] = [];
      if (!egale(q, (x) => a * x + b)) {
        if (egale(q, (x) => a * x)) msgs.push(tx("Le quotient a encore un terme constant : fais un second tour de division avec le reste obtenu."));
        else if (egale(q, (x) => a * x - b) || egale(q, (x) => -a * x + b)) msgs.push(tx("Erreur de signe dans le quotient : en soustrayant, change le signe de CHAQUE terme du produit."));
        else if (egale(q, (x) => a * x + b + c / D(x))) msgs.push(tx("Le quotient est un polynôme : le reste ne s'y ajoute pas."));
        else msgs.push(tx("Le premier terme du quotient est le quotient des termes de plus haut degré de P et de D."));
      }
      const vr = lireLimite(r);
      if (vr !== null && Math.abs(vr - c) > 1e-9) {
        if (Math.abs(vr + c) < 1e-9) msgs.push(tx(" Signe du reste : à la dernière soustraction, change le signe de chaque terme."));
        else msgs.push(tx(" Le reste est ce qui reste à la fin de la division : vérifie avec "), lx("Q(x)\\cdot D(x)+R(x)=P(x)"), tx("."));
      }
      return msgs.length > 0 ? msgs : null;
    }
    case "ecrireFormeDeveloppee": {
      const s = valeurs[0];
      if (egale(s, (x) => a * x + b + c)) return [tx("Le reste se divise par le dénominateur : "), lx("\\dfrac{R(x)}{D(x)}"), tx(".")];
      if (egale(s, (x) => a * x + b - c / D(x))) return [tx("Signe du reste : reprends le reste trouvé à l'étape 1 avec son signe.")];
      if (egale(s, (x) => (a * x + b) / D(x) + c)) return [tx("Le quotient s'écrit seul ; c'est le RESTE qui est divisé par "), lx("D(x)"), tx(".")];
      return [tx("Utilise le quotient et le reste de l'étape 1 : "), lx("f(x)=Q(x)+\\dfrac{R(x)}{D(x)}"), tx(".")];
    }
    case "calculerCoefficientA": {
      const v = lireLimite(valeurs[0]);
      if (v === null) return null;
      if (!Number.isFinite(v)) return [lx("\\dfrac{f(x)}{x}"), tx(" a un numérateur et un dénominateur de même degré : sa limite est un nombre réel.")];
      if (Math.abs(v - b) < 1e-9 && a !== b) return [tx("C'est l'ordonnée à l'origine : a est le coefficient de x, la limite de "), lx("\\dfrac{f(x)}{x}"), tx(".")];
      if (Math.abs(v + a) < 1e-9) return [tx("Signe : le quotient des termes de plus haut degré garde le signe de leurs coefficients.")];
      return [tx("Garde seulement les termes de plus haut degré de "), lx("P(x)"), tx(" et de "), lx("x\\cdot D(x)"), tx(", puis simplifie.")];
    }
    case "calculerCoefficientB": {
      const v = lireLimite(valeurs[0]);
      if (v === null) return null;
      if (!Number.isFinite(v)) return [tx("b est la limite de "), lx("f(x)-ax"), tx(", pas celle de f(x) (qui est infinie) : soustrais d'abord ax.")];
      if (Math.abs(v + b) < 1e-9) return [tx("Signe : le signe − devant ax porte sur tout le produit "), lx("ax\\cdot D(x)"), tx(".")];
      if (Math.abs(v - c) < 1e-9 && b !== c) return [tx("C'est le reste de la division ; b est la limite du quotient des termes de plus haut degré de "), lx("f(x)-ax"), tx(".")];
      return [tx("Réduis "), lx("f(x)-ax"), tx(" au même dénominateur : le numérateur est alors de même degré que D(x).")];
    }
    case "conclureEquationAsymptote": {
      const s = valeurs[0];
      if (egale(s, (x) => a * x + b + c / D(x))) return [tx("L'asymptote est une droite : le reste divisé par D(x) n'en fait pas partie.")];
      if (egale(s, (x) => b * x + a)) return [tx("a est le coefficient de x et b l'ordonnée à l'origine : "), lx("y=ax+b"), tx(".")];
      if (egale(s, (x) => a * x)) return [tx("Il manque l'ordonnée à l'origine b.")];
      return [tx("Reprends les résultats des étapes précédentes : "), lx(exercice.variante === "divisionEuclidienne" ? "y=Q(x)" : "y=ax+b"), tx(".")];
    }
  }
}

// ============================================================================
// Bloc "état actuel" — récapitule les valeurs déjà CONFIRMÉES plus tôt dans la séquence.
// ============================================================================

function formatQuotientResteConfirmesLatex(exo: ExerciceAsymptoteOblique): string[] {
  return [`Q(x)=${formatQuotientLatex(exo.a, exo.b)}`, `R(x)=${exo.c}`];
}
/** D(x) dans l'ordre de l'ÉNONCÉ (graine + 1, comme `formatTermesDonneesLatex`). */
function formatFormeDeveloppeeConfirmeeLatex(exo: ExerciceAsymptoteOblique, seed: number): string {
  return `=${formatFormeDeveloppeeLatex(exo.a, exo.b, exo.c, exo.coeffsD, seed + 1)}`;
}
function formatCoefficientAConfirmeLatex(exo: ExerciceAsymptoteOblique): string {
  return `a=${exo.a}`;
}
function formatCoefficientBConfirmeLatex(exo: ExerciceAsymptoteOblique): string {
  return `b=${exo.b}`;
}
function formatEquationAsymptoteConfirmeeLatex(exo: ExerciceAsymptoteOblique): string {
  return `\\text{AO : }y=${formatQuotientLatex(exo.a, exo.b)}`;
}

export function formatTermesEtatActuelLatex(exercice: ExerciceAsymptoteOblique, phase: PhaseAsymptoteOblique): string[] | null {
  const seed = seedExercice(exercice);
  const ordre = ordreComplet(exercice);
  const index = ordre.indexOf(phase);
  const precedentes = index > 0 ? ordre.slice(0, index) : [];

  const termes: string[] = [];
  for (const p of precedentes) {
    if (p === "diviserEuclidienne") termes.push(...formatQuotientResteConfirmesLatex(exercice));
    else if (p === "ecrireFormeDeveloppee") termes.push(formatFormeDeveloppeeConfirmeeLatex(exercice, seed));
    else if (p === "calculerCoefficientA") termes.push(formatCoefficientAConfirmeLatex(exercice));
    else if (p === "calculerCoefficientB") termes.push(formatCoefficientBConfirmeLatex(exercice));
    else if (p === "conclureEquationAsymptote") termes.push(formatEquationAsymptoteConfirmeeLatex(exercice));
  }
  return termes.length > 0 ? termes : null;
}

// ============================================================================
// Récapitulatif final — réponse ATTENDUE pour chaque écran RÉELLEMENT traversé.
// ============================================================================

export function formatReponseAttenduePhaseLatex(exercice: ExerciceAsymptoteOblique, phase: PhaseAsymptoteOblique): string[] {
  const seed = seedExercice(exercice);
  switch (phase) {
    case "diviserEuclidienne":
      return formatQuotientResteConfirmesLatex(exercice);
    case "ecrireFormeDeveloppee":
      return [formatFormeDeveloppeeConfirmeeLatex(exercice, seed)];
    case "calculerCoefficientA":
      return [formatCoefficientAConfirmeLatex(exercice)];
    case "calculerCoefficientB":
      return [formatCoefficientBConfirmeLatex(exercice)];
    case "conclureEquationAsymptote":
      return [formatEquationAsymptoteConfirmeeLatex(exercice)];
  }
}
