import type { ExerciceDetermParamA, ExerciceDetermParamB, ExerciceDetermParamC, ExerciceDeterminerParametresLogarithme } from "../core6e/determinerParametresLogarithme.types";
import type { PhaseDeterminerParametresLogarithme, ResultatExerciceDeterminerParametresLogarithme } from "../moteur6e/typesDeterminerParametresLogarithme";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage LaTeX pour `6gen18`. 3 familles
 * STRUCTURELLEMENT DISJOINTES (2 ou 3 écrans selon la famille, comme `formatExponentiellesProblemes.ts`
 * 6gen12) — tout dispatche sur `exercice.famille` PUIS `phase`.
 *
 * **Convention de substitution numérique** (résout une contrainte technique du moteur) : les
 * constantes de l'énoncé (`x0`,`x1`,`k1`,`r1`,`r2`) sont TOUJOURS substituées par leur VALEUR
 * NUMÉRIQUE dans les consignes/placeholders — jamais par leur NOM symbolique. Ce n'est pas qu'un
 * choix pédagogique : `moteur6e/expressionExponentielle.ts` (l'évaluateur qui interprète le texte
 * élève) ne reconnaît que des identifiants purement alphabétiques ("x0" s'y tokeniserait en "x"
 * suivi de "0", jamais comme un seul identifiant) — un élève qui taperait "x0" littéralement
 * obtiendrait donc un `parse_error`. Toute consigne/placeholder illustre donc l'équation avec la
 * valeur numérique déjà en place (ex. "m*5+n=0", jamais "m*x0+n=0").
 *
 * **Valeurs EXACTES, jamais de décimal** (convention CLAUDE.md) pour toute valeur affichée
 * (aide/récapitulatif) : `m` (sous-type "ordonnée") est un rationnel propre, affiché en fraction
 * irréductible ; toutes les autres solutions (`m`/`n` sous-type "point", `p`/`q`/`r` famille B) sont
 * IRRATIONNELLES par construction (division par `ln(k1)`) — affichées sous forme EXACTE
 * `coef·ln(k1)/dénominateur` (fraction irréductible elle aussi), jamais arrondies. La saisie ÉLÈVE,
 * elle, reste libre décimal/fraction (vérifiée par tolérance, `moteur6e/verificationDetermi
 * nerParametresLogarithme.ts`).
 */

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a || 1;
}

/** Fraction irréductible LaTeX pour un rationnel EXACT num/den (den réduit toujours positif, signe
 * remonté devant la fraction) — jamais de décimal. Retourne l'entier seul si le dénominateur réduit
 * vaut 1. */
export function formatFractionSimplifieeLatex(num: number, den: number): string {
  if (num === 0) return "0";
  const signe = num < 0 !== den < 0 ? "-" : "";
  let n = Math.abs(num);
  let d = Math.abs(den);
  const g = pgcd(n, d);
  n /= g;
  d /= g;
  return d === 1 ? `${signe}${n}` : `${signe}\\dfrac{${n}}{${d}}`;
}

/** Fraction irréductible LaTeX pour `coef·ln(k1)/den` (coef,den entiers non nuls) — forme EXACTE
 * d'une solution IRRATIONNELLE (division par `ln(k1)`), jamais un décimal arrondi : familles A
 * (sous-type "point") et B, dont les solutions ne sont jamais des rationnels propres. */
export function formatCoefLnFractionLatex(coef: number, k1: number, den: number): string {
  if (coef === 0) return "0";
  const signe = coef < 0 !== den < 0 ? "-" : "";
  let c = Math.abs(coef);
  let d = Math.abs(den);
  const g = pgcd(c, d);
  c /= g;
  d /= g;
  const numerateur = c === 1 ? `\\ln(${k1})` : `${c}\\ln(${k1})`;
  return d === 1 ? `${signe}${numerateur}` : `${signe}\\dfrac{${numerateur}}{${d}}`;
}

// ============================================================================
// Famille A.
// ============================================================================

function denomA(exercice: ExerciceDetermParamA & { sousType: "point" }): number {
  return exercice.x1 - exercice.x0;
}

export function formatMLatexA(exercice: ExerciceDetermParamA): string {
  if (exercice.sousType === "ordonnee") return formatFractionSimplifieeLatex(-exercice.k, exercice.x0);
  return formatCoefLnFractionLatex(1, exercice.k1, denomA(exercice));
}

export function formatNLatexA(exercice: ExerciceDetermParamA): string {
  if (exercice.sousType === "ordonnee") return String(exercice.k);
  return formatCoefLnFractionLatex(-exercice.x0, exercice.k1, denomA(exercice));
}

function equation2LatexA(exercice: ExerciceDetermParamA): string {
  return exercice.sousType === "ordonnee" ? `n=${exercice.k}` : `m\\cdot ${exercice.x1}+n=\\ln(${exercice.k1})`;
}

function libelleDeuxiemeConditionA(exercice: ExerciceDetermParamA): string {
  return exercice.sousType === "ordonnee" ? "ordonnée à l'origine" : "point de passage";
}

export function consigneGeneraleA(): string {
  return "On cherche f(x)=ln(mx+n) vérifiant les 2 conditions ci-dessous.";
}

export function blocDonneesA(exercice: ExerciceDetermParamA): string[] {
  const condition2 = exercice.sousType === "ordonnee" ? `\\text{Ordonnée à l'origine : } ${exercice.k}` : `\\text{Passe par le point } \\left(${exercice.x1}\\,;\\,\\ln(${exercice.k1})\\right)`;
  return ["f(x)=\\ln(mx+n)", `\\text{Asymptote verticale : } x=${exercice.x0}`, condition2];
}

export function etatActuelA(exercice: ExerciceDetermParamA, phase: PhaseDeterminerParametresLogarithme): string[] | null {
  if (phase !== "aEcran2") return null;
  return [`m\\cdot ${exercice.x0}+n=0`, equation2LatexA(exercice)];
}

export function consigneEcranA(phase: PhaseDeterminerParametresLogarithme): string {
  if (phase === "aEcran1") {
    return `Traduis chacune des 2 conditions en une équation portant sur m et n — utilise directement les valeurs numériques données (jamais "x0"/"x1"/"k1" comme symboles).`;
  }
  return "Résous ce système à 2 équations et donne les valeurs de m et n (fraction ou décimal).";
}

export function labelsEcranA(exercice: ExerciceDetermParamA, phase: PhaseDeterminerParametresLogarithme): { a: string; b: string } {
  if (phase === "aEcran1") return { a: "Équation 1 (asymptote)", b: `Équation 2 (${libelleDeuxiemeConditionA(exercice)})` };
  return { a: "m =", b: "n =" };
}

export function placeholdersEcranA(exercice: ExerciceDetermParamA, phase: PhaseDeterminerParametresLogarithme): { a: string; b: string } {
  if (phase === "aEcran1") {
    const b = exercice.sousType === "ordonnee" ? `n=${exercice.k}` : `m*${exercice.x1}+n=ln(${exercice.k1})`;
    return { a: `m*${exercice.x0}+n=0`, b };
  }
  return { a: "ex : -2/5", b: "ex : 1,3" };
}

export function aideNiveau1A(phase: PhaseDeterminerParametresLogarithme): AideAvecLatex {
  if (phase === "aEcran1") {
    return { texte: "Une asymptote verticale de ln(mx+n) correspond à l'annulation de l'argument : mx+n=0.", latex: null };
  }
  return { texte: "Isole n dans l'équation de l'asymptote (la plus simple), puis substitue dans la deuxième équation.", latex: null };
}

export function aideNiveau2A(exercice: ExerciceDetermParamA, phase: PhaseDeterminerParametresLogarithme): AideAvecLatex {
  if (phase === "aEcran1") {
    return { texte: "L'équation de l'asymptote est déjà posée — il reste à traduire la deuxième condition :", latex: `m\\cdot ${exercice.x0}+n=0` };
  }
  return { texte: "Substitution faite (calcul non terminé) :", latex: `n=-m\\cdot ${exercice.x0},\\quad ${equation2LatexA(exercice)}` };
}

export function formatReponseAttendueA(exercice: ExerciceDetermParamA, phase: PhaseDeterminerParametresLogarithme): string[] {
  if (phase === "aEcran1") return [`m\\cdot ${exercice.x0}+n=0`, equation2LatexA(exercice)];
  return [`m=${formatMLatexA(exercice)}`, `n=${formatNLatexA(exercice)}`];
}

// ============================================================================
// Famille B.
// ============================================================================

function denomB(exercice: ExerciceDetermParamB): number {
  return (exercice.x1 - exercice.r1) * (exercice.x1 - exercice.r2);
}

export function formatPLatexB(exercice: ExerciceDetermParamB): string {
  return formatCoefLnFractionLatex(1, exercice.k1, denomB(exercice));
}
export function formatQLatexB(exercice: ExerciceDetermParamB): string {
  return formatCoefLnFractionLatex(-(exercice.r1 + exercice.r2), exercice.k1, denomB(exercice));
}
export function formatRLatexB(exercice: ExerciceDetermParamB): string {
  return formatCoefLnFractionLatex(exercice.r1 * exercice.r2, exercice.k1, denomB(exercice));
}

export function consigneGeneraleB(): string {
  return "On cherche f(x)=ln(px²+qx+r) vérifiant les conditions ci-dessous.";
}

export function blocDonneesB(exercice: ExerciceDetermParamB): string[] {
  return [
    "f(x)=\\ln(px^2+qx+r)",
    `\\text{Asymptotes verticales : } x=${exercice.r1} \\text{ et } x=${exercice.r2}`,
    `\\text{Passe par le point } \\left(${exercice.x1}\\,;\\,\\ln(${exercice.k1})\\right)`,
  ];
}

export function etatActuelB(exercice: ExerciceDetermParamB, phase: PhaseDeterminerParametresLogarithme): string[] | null {
  if (phase === "bEcran2") return [`q=-p\\cdot(${exercice.r1}+${exercice.r2})`, `r=p\\cdot ${exercice.r1}\\cdot ${exercice.r2}`];
  if (phase === "bEcran3") return [`q=-p\\cdot(${exercice.r1}+${exercice.r2})`, `r=p\\cdot ${exercice.r1}\\cdot ${exercice.r2}`, `p=${formatPLatexB(exercice)}`];
  return null;
}

export function consigneEcranB(phase: PhaseDeterminerParametresLogarithme): string {
  if (phase === "bEcran1") {
    return "Écris p(x-r1)(x-r2) sous la forme px²+qx+r (utilise directement les valeurs numériques de r1 et r2), puis exprime q et r en fonction de p.";
  }
  if (phase === "bEcran2") return "Utilise la condition du point de passage pour trouver la valeur de p.";
  return "Donne les valeurs de q et r, à partir de la valeur de p trouvée à l'étape précédente.";
}

export function labelsEcranB(phase: PhaseDeterminerParametresLogarithme): { a: string; b: string } {
  if (phase === "bEcran3") return { a: "q =", b: "r =" };
  return { a: "q (en fonction de p) =", b: "r (en fonction de p) =" };
}

export function placeholdersEcranB(exercice: ExerciceDetermParamB, phase: PhaseDeterminerParametresLogarithme): { a: string; b: string } {
  if (phase === "bEcran1") return { a: `-p*(${exercice.r1}+${exercice.r2})`, b: `p*${exercice.r1}*${exercice.r2}` };
  return { a: "ex : 1,2", b: "ex : -3,4" };
}

export function aideNiveau1B(phase: PhaseDeterminerParametresLogarithme): AideAvecLatex {
  if (phase === "bEcran1") {
    return { texte: "Un polynôme du second degré ayant 2 racines connues r1 et r2 s'écrit p(x-r1)(x-r2).", latex: null };
  }
  if (phase === "bEcran2") return { texte: "Remplace q et r (trouvés à l'étape précédente) dans px²+qx+r, puis utilise la condition du point de passage.", latex: null };
  return { texte: "Réutilise les expressions de q(p) et r(p) trouvées à l'étape 1, avec la valeur de p trouvée à l'étape 2.", latex: null };
}

export function aideNiveau2B(exercice: ExerciceDetermParamB, phase: PhaseDeterminerParametresLogarithme): AideAvecLatex {
  if (phase === "bEcran1") {
    return { texte: "Développement partiellement effectué — q et r restent à isoler :", latex: `p\\left(x^2-(${exercice.r1}+${exercice.r2})x+${exercice.r1}\\cdot ${exercice.r2}\\right)` };
  }
  if (phase === "bEcran2") {
    return { texte: "Condition du point de passage (calcul non terminé) :", latex: `p\\cdot(${exercice.x1}-${exercice.r1})(${exercice.x1}-${exercice.r2})=\\ln(${exercice.k1})` };
  }
  return { texte: "Valeur de p à substituer :", latex: `p=${formatPLatexB(exercice)}` };
}

export function formatReponseAttendueB(exercice: ExerciceDetermParamB, phase: PhaseDeterminerParametresLogarithme): string[] {
  if (phase === "bEcran1") return [`q=-p\\cdot(${exercice.r1}+${exercice.r2})`, `r=p\\cdot ${exercice.r1}\\cdot ${exercice.r2}`];
  if (phase === "bEcran2") return [`p=${formatPLatexB(exercice)}`];
  return [`q=${formatQLatexB(exercice)}`, `r=${formatRLatexB(exercice)}`];
}

// ============================================================================
// Famille C.
// ============================================================================

function symboleC(exercice: ExerciceDetermParamC): "<" | ">" {
  return exercice.typeExtremum === "maximum" ? "<" : ">";
}

export function consigneGeneraleC(exercice: ExerciceDetermParamC): string {
  return `On cherche à quelles conditions sur p,q,r la fonction f(x)=ln(px²+qx+r) admet un ${exercice.typeExtremum} local en x=${exercice.x0}.`;
}

export function blocDonneesC(exercice: ExerciceDetermParamC): string[] {
  return ["f(x)=\\ln(px^2+qx+r)", `\\text{Extremum recherché : ${exercice.typeExtremum} local en } x=${exercice.x0}`];
}

export function etatActuelC(exercice: ExerciceDetermParamC, phase: PhaseDeterminerParametresLogarithme): string[] | null {
  if (phase === "cEcran2") return [`p${symboleC(exercice)}0`];
  if (phase === "cEcran3") return [`p${symboleC(exercice)}0`, `q=-2\\cdot p\\cdot ${exercice.x0}`];
  return null;
}

export function consigneEcranC(phase: PhaseDeterminerParametresLogarithme): string {
  if (phase === "cEcran1") {
    return "ln est une fonction croissante : un extremum de f coïncide avec un extremum de u(x)=px²+qx+r. Quelle condition cela impose-t-il sur le signe de p ?";
  }
  if (phase === "cEcran2") {
    return "Le sommet de la parabole u doit se trouver exactement en x=x0 — utilise directement la valeur numérique de x0. Écris la relation entre q et p.";
  }
  return "Pour que l'extremum de f existe réellement, il faut que u(x0) soit strictement positif (domaine de ln). Écris cette condition comme une inéquation sur r (en fonction de p, utilise la valeur numérique de x0).";
}

export function placeholderEcranC(exercice: ExerciceDetermParamC, phase: PhaseDeterminerParametresLogarithme): string {
  if (phase === "cEcran1") return `ex : p${symboleC(exercice)}0`;
  if (phase === "cEcran2") return `ex : q=-2*p*${exercice.x0}`;
  return `ex : r>p*${exercice.x0 * exercice.x0}`;
}

export function aideNiveau1C(phase: PhaseDeterminerParametresLogarithme): AideAvecLatex {
  if (phase === "cEcran1") return { texte: "ln est croissante : un extremum de ln(u) est TOUJOURS de la même nature (max/min) que celui de u lui-même.", latex: null };
  if (phase === "cEcran2") return { texte: "Le sommet d'une parabole px²+qx+r se situe en x=-q/(2p).", latex: null };
  return { texte: "Un extremum de ln(u) suppose que u soit bien strictement positif à cet endroit — ce n'est pas automatique, c'est une condition supplémentaire à poser.", latex: null };
}

export function aideNiveau2C(exercice: ExerciceDetermParamC, phase: PhaseDeterminerParametresLogarithme): AideAvecLatex {
  if (phase === "cEcran1") {
    const nature = exercice.typeExtremum === "maximum" ? "vers le bas (concavité négative)" : "vers le haut (concavité positive)";
    return { texte: `Pour un ${exercice.typeExtremum} de u, la parabole doit être tournée ${nature} — quel signe cela impose-t-il pour p ?`, latex: null };
  }
  if (phase === "cEcran2") {
    return { texte: "Position du sommet, avec x0 substitué numériquement (relation non isolée) :", latex: `-\\dfrac{q}{2p}=${exercice.x0}` };
  }
  return { texte: `u(x0), avec q déjà substitué (q=-2p·${exercice.x0}) :`, latex: `u(${exercice.x0})=p\\cdot ${exercice.x0}^2+\\left(-2p\\cdot ${exercice.x0}\\right)\\cdot ${exercice.x0}+r=-p\\cdot ${exercice.x0 * exercice.x0}+r` };
}

export function formatReponseAttendueC(exercice: ExerciceDetermParamC, phase: PhaseDeterminerParametresLogarithme): string[] {
  if (phase === "cEcran1") return [`p${symboleC(exercice)}0`];
  if (phase === "cEcran2") return [`q=-2\\cdot p\\cdot ${exercice.x0}`];
  return [`r>p\\cdot ${exercice.x0 * exercice.x0}`];
}

// ============================================================================
// Dispatch commun.
// ============================================================================

export const LIBELLE_PHASE: Record<PhaseDeterminerParametresLogarithme, string> = {
  aEcran1: "Étape 1 (système d'équations)",
  aEcran2: "Étape 2 (résolution)",
  bEcran1: "Étape 1 (q,r en fonction de p)",
  bEcran2: "Étape 2 (valeur de p)",
  bEcran3: "Étape 3 (valeurs de q,r)",
  cEcran1: "Étape 1 (signe de p)",
  cEcran2: "Étape 2 (relation sur q)",
  cEcran3: "Étape 3 (inéquation sur r)",
};

export const PHASES_PAR_FAMILLE: Record<ExerciceDeterminerParametresLogarithme["famille"], PhaseDeterminerParametresLogarithme[]> = {
  A: ["aEcran1", "aEcran2"],
  B: ["bEcran1", "bEcran2", "bEcran3"],
  C: ["cEcran1", "cEcran2", "cEcran3"],
};

export function formatReponseAttenduePhaseLatex(exercice: ExerciceDeterminerParametresLogarithme, phase: PhaseDeterminerParametresLogarithme): string[] {
  switch (exercice.famille) {
    case "A":
      return formatReponseAttendueA(exercice, phase);
    case "B":
      return formatReponseAttendueB(exercice, phase);
    case "C":
      return formatReponseAttendueC(exercice, phase);
  }
}

/** Total points du récapitulatif final — COMPLÉMENT de `LigneRecap`/`statutRecap`, jamais un
 * remplacement (CLAUDE.md). Le nombre d'écrans varie PAR FAMILLE (`maximum = 100 × nombre
 * d'écrans` : 200 pour A, 300 pour B/C). */
export function calculerTotalPointsDeterminerParametresLogarithme(resultat: ResultatExerciceDeterminerParametresLogarithme): { total: number; maximum: number } {
  const phases = PHASES_PAR_FAMILLE[resultat.famille];
  const scores = resultat as unknown as Record<string, number>;
  const cles: Record<PhaseDeterminerParametresLogarithme, string> = {
    aEcran1: "scoreEcran1",
    aEcran2: "scoreEcran2",
    bEcran1: "scoreEcran1",
    bEcran2: "scoreEcran2",
    bEcran3: "scoreEcran3",
    cEcran1: "scoreEcran1",
    cEcran2: "scoreEcran2",
    cEcran3: "scoreEcran3",
  };
  const total = phases.reduce((acc, phase) => acc + (scores[cles[phase]] ?? 0), 0);
  return { total, maximum: phases.length * 100 };
}
