import type { CibleAsymptote, CibleConcaviteLog, ExerciceEtudeFonctionLogarithme, ExerciceEtudeLogB, ExerciceEtudeLogC } from "../core6e/etudeFonctionLogarithme.types";
import type { CibleLimite } from "../core6e/limitesExponentielles.types";
import type { DetailPhaseEtudeFonctionLogarithme, PhaseEtudeFonctionLogarithme } from "../moteur6e/typesEtudeFonctionLogarithme";
import { PHASES_ETUDE_LOG } from "../moteur6e/typesEtudeFonctionLogarithme";
import { calculerViewBoxCandidats, evaluerCandidatFamille } from "../generateurs6e/etudeFonctionLogarithme/graphe";
import type { ViewBoxEtudeFonctionLog } from "../generateurs6e/etudeFonctionLogarithme/graphe";
import { coefficientLatex, termeConstanteLatex, trinomeLatex } from "../generateurs6e/etudeFonctionLogarithme/familles/latex";
import { formatEnsembleReelLatex } from "./formatEnsembleReel";
import { assurerAxesVisibles } from "../ui/mafsTransformation";

export type { ViewBoxEtudeFonctionLog } from "../generateurs6e/etudeFonctionLogarithme/graphe";

/**
 * Couche présentation (6e) — formatage LaTeX, cadrage des candidats (rendu Mafs) et textes de
 * consigne/aide pour `6gen21`. Les aides de niveau 2 donnent l'outil ou l'expression intermédiaire
 * (dérivée, condition à résoudre), jamais la réponse de l'écran.
 */
export const CONSIGNE_GENERALE = "Étudie la fonction suivante :";

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

function texte(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}

function latex(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
}

/** Nombre en LaTeX avec virgule décimale (« 2{,}72 »), arrondi au centième. */
function nombreLatex(v: number): string {
  const r = Math.round(v * 100) / 100;
  return String(r).replace(".", "{,}");
}

/** Nombre entier entre parenthèses s'il est négatif (« (-3) »). */
function entreParentheses(v: number): string {
  return v < 0 ? `(${v})` : String(v);
}

// ============================================================================
// Exemples de saisie — tous HORS de l'espace des réponses possibles.
// ============================================================================

export const PLACEHOLDER_LIMITE_VALEUR = "ex : 7,5";
export const PLACEHOLDER_ASYMPTOTE = "ex : y = 7 ou x = −8";
export const PLACEHOLDER_POSITION_EXTREMUM = "ex : 7/e";
export const PLACEHOLDER_VALEUR_EXTREMUM = "ex : 5ln(7)";
export const PLACEHOLDER_INFLEXION = "ex : e^(9/2)";

// ============================================================================
// f(x) — un helper par famille.
// ============================================================================

function baseBLatex(ex: Pick<ExerciceEtudeLogB, "bNum" | "bDen">): string {
  if (ex.bDen === 2) return "\\dfrac{x}{2}";
  return ex.bNum === 1 ? "x" : `${ex.bNum}x`;
}

function trinomeC(ex: ExerciceEtudeLogC): string {
  return trinomeLatex(-2 * ex.p, ex.p * ex.p - ex.q * ex.q);
}

export function formatFonctionLatex(exercice: ExerciceEtudeFonctionLogarithme): string {
  switch (exercice.famille) {
    case "A": {
      const { k, c } = exercice;
      const signe = k < 0 ? "-" : "";
      const absK = Math.abs(k);
      const numerateur = c === 0 ? (absK === 1 ? "\\ln(x)" : `${absK}\\ln(x)`) : absK === 1 ? `\\ln(x)${termeConstanteLatex(c)}` : `${absK}\\left(\\ln(x)${termeConstanteLatex(c)}\\right)`;
      return `f(x) = ${signe}\\dfrac{${numerateur}}{x}`;
    }
    case "B": {
      const base = baseBLatex(exercice);
      const puissance = base === "x" ? "x" : `\\left(${base}\\right)`;
      return `f(x) = ${puissance}^{${exercice.a === 1 ? "" : exercice.a}x}${termeConstanteLatex(exercice.c)}`;
    }
    case "C":
      return `f(x) = ${coefficientLatex(exercice.m)}\\ln\\left|${trinomeC(exercice)}\\right|`;
    case "D":
      return `f(x) = ${coefficientLatex(exercice.m)}\\ln\\left(${trinomeLatex(-2 * exercice.p, exercice.p * exercice.p + exercice.a * exercice.a)}\\right)`;
    case "E": {
      const { m, c } = exercice;
      const absM = Math.abs(m);
      const signe = m < 0 ? "-" : "";
      const signeQuotient = m < 0 ? "-" : "+";
      return `f(x) = ${signe}${absM === 1 ? "" : absM}\\ln(x) ${signeQuotient} \\dfrac{${absM * c}}{x}`;
    }
  }
}

// ============================================================================
// Candidats du QCM graphique (formule unique, `generateurs6e/etudeFonctionLogarithme/graphe.ts`).
// ============================================================================

export function evaluerCandidat(exercice: ExerciceEtudeFonctionLogarithme, index: number, x: number): number | null {
  return evaluerCandidatFamille(exercice.famille, exercice.candidats[index], x);
}

/** Densité de grille cible, partagée avec `GrapheOptionEtudeFonctionLog.tsx` (`GrilleAdaptative`). */
export const CIBLE_NOMBRE_LIGNES_QCM = 6;

/** Même cadrage que celui qui a servi au contrôle de discernabilité à la génération, axes rendus
 * visibles (`assurerAxesVisibles`). */
export function calculerViewBox(exercice: ExerciceEtudeFonctionLogarithme): ViewBoxEtudeFonctionLog {
  const vb = calculerViewBoxCandidats(exercice.famille, exercice.candidats, exercice.candidats[exercice.indexCorrect], exercice.valeursRemarquables);
  const { x, y } = assurerAxesVisibles({ x: [vb.xMin, vb.xMax], y: [vb.yMin, vb.yMax] });
  return { xMin: x[0], xMax: x[1], yMin: y[0], yMax: y[1] };
}

// ============================================================================
// Équation d'une asymptote — `CibleAsymptote` → LaTeX.
// ============================================================================

export function formatEquationAsymptoteLatex(cible: CibleAsymptote): string {
  if (cible.type === "horizontale") return `y = ${cible.valeur}`;
  if (cible.type === "verticale") return `x = ${cible.p}`;
  if (cible.type === "oblique") return `y = ${cible.a === 1 ? "" : cible.a}x${termeConstanteLatex(cible.b)}`;
  return "\\text{aucune asymptote}";
}

// ============================================================================
// Labels de direction.
// ============================================================================

export interface DirectionLabel {
  id: string;
  latex: string;
}

const DIRECTIONS_ZERO_PLUS: DirectionLabel[] = [
  { id: "zeroPlus", latex: "x \\to 0^+" },
  { id: "plusInfini", latex: "x \\to +\\infty" },
];
const DIRECTIONS_INFINIS: DirectionLabel[] = [
  { id: "moinsInfini", latex: "x \\to -\\infty" },
  { id: "plusInfini", latex: "x \\to +\\infty" },
];

export function directionLabelsLimites(exercice: ExerciceEtudeFonctionLogarithme): DirectionLabel[] {
  switch (exercice.famille) {
    case "A":
    case "B":
    case "E":
      return DIRECTIONS_ZERO_PLUS;
    case "D":
      return DIRECTIONS_INFINIS;
    case "C": {
      const r1 = entreParentheses(exercice.p - exercice.q);
      const r2 = entreParentheses(exercice.p + exercice.q);
      return [
        { id: "moinsInfini", latex: "x \\to -\\infty" },
        { id: "r1Moins", latex: `x \\to ${r1}^-` },
        { id: "r1Plus", latex: `x \\to ${r1}^+` },
        { id: "r2Moins", latex: `x \\to ${r2}^-` },
        { id: "r2Plus", latex: `x \\to ${r2}^+` },
        { id: "plusInfini", latex: "x \\to +\\infty" },
      ];
    }
  }
}

/** Famille C : étiquettes NEUTRES (jamais « x = r₁ », qui serait la réponse à taper). */
export function directionLabelsAsymptotes(exercice: ExerciceEtudeFonctionLogarithme): DirectionLabel[] {
  switch (exercice.famille) {
    case "A":
    case "B":
    case "E":
      return DIRECTIONS_ZERO_PLUS;
    case "D":
      return DIRECTIONS_INFINIS;
    case "C":
      return [
        { id: "asymptote1", latex: "\\text{1re asymptote verticale}" },
        { id: "asymptote2", latex: "\\text{2e asymptote verticale}" },
      ];
  }
}

/** Famille C : l'existence des 2 asymptotes verticales découle directement du domaine (2 valeurs
 * exclues, limites infinies) — seules leurs équations sont demandées. */
export function forcerPresenceAsymptotes(exercice: ExerciceEtudeFonctionLogarithme): boolean[] {
  return exercice.famille === "C" ? [true, true] : [false, false];
}

/** Bornes du tableau de signe de la famille C (r₁, p, r₂). */
export function intervallesGrilleCLatex(exercice: ExerciceEtudeLogC): string[] {
  const r1 = exercice.p - exercice.q;
  const r2 = exercice.p + exercice.q;
  const p = exercice.p;
  return [`]-\\infty\\,;\\,${r1}[`, `]${r1}\\,;\\,${p}[`, `]${p}\\,;\\,${r2}[`, `]${r2}\\,;\\,+\\infty[`];
}

// ============================================================================
// Consignes — un texte par écran.
// ============================================================================

export function consigneDomaine(exercice: ExerciceEtudeFonctionLogarithme): FragmentConsigne[] {
  switch (exercice.famille) {
    case "A":
      return [texte("Détermine le domaine de définition de f (logarithme ET dénominateur).")];
    case "B":
      return [texte("Détermine le domaine de définition de f (puissance à exposant variable).")];
    case "C":
      return [texte("Détermine le domaine de définition de f — attention à la valeur absolue.")];
    case "D":
      return [texte("Détermine le domaine de définition de f — étudie le signe du trinôme.")];
    case "E":
      return [texte("Détermine le domaine de définition de f.")];
  }
}

export function consigneLimites(exercice: ExerciceEtudeFonctionLogarithme): FragmentConsigne[] {
  if (exercice.famille === "C") return [texte("Détermine les 6 limites suivantes : aux deux infinis, puis de part et d'autre de chaque valeur exclue.")];
  return [texte("Détermine les limites de f aux bornes de son domaine.")];
}

export function consigneAsymptotes(exercice: ExerciceEtudeFonctionLogarithme): FragmentConsigne[] {
  if (exercice.famille === "C") return [texte("À partir des limites, donne l'équation des 2 asymptotes verticales de f (dans l'ordre de ton choix).")];
  return [texte("À partir des limites, détermine l'asymptote de f dans chaque direction — ou l'absence d'asymptote.")];
}

export function consigneCroissance(exercice: ExerciceEtudeFonctionLogarithme): FragmentConsigne[] {
  if (exercice.famille === "C") {
    return [
      texte("Étudie le signe de "),
      latex("f'"),
      texte(" sur chacun des 4 intervalles, puis donne la valeur de l'extremum local (valeur exacte ou arrondie au centième)."),
    ];
  }
  return [texte("Étudie le signe de "), latex("f'"), texte(" et conclus : sens de variation, nature et position de l'extremum (valeur exacte ou arrondie au centième).")];
}

export function consigneConcavite(): FragmentConsigne[] {
  return [
    texte("Étudie le signe de "),
    latex("f''"),
    texte(" et conclus sur la concavité de f (convexe, concave, ou point(s) d'inflexion et leur(s) position(s), valeur exacte ou arrondie au centième)."),
  ];
}

export function consigneGraphique(): FragmentConsigne[] {
  return [texte("Sélectionne le graphique qui représente f.")];
}

// ============================================================================
// Aides — 2 niveaux par écran. Le niveau 2 donne l'outil ou l'expression intermédiaire, jamais la
// réponse.
// ============================================================================

export function aideDomaineNiveau1(exercice: ExerciceEtudeFonctionLogarithme): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return { texte: "ln(u) n'existe que si u > 0, et un dénominateur ne peut pas s'annuler.", latex: "\\ln(u) : u>0 \\qquad \\dfrac{\\dots}{v} : v\\neq 0" };
    case "B":
      return { texte: "Une puissance à exposant variable s'écrit avec l'exponentielle : elle n'est définie que si sa base est strictement positive.", latex: "u^{v}=e^{v\\ln(u)}" };
    case "C":
      return { texte: "|u| > 0 dès que u ≠ 0, quel que soit le signe de u : le domaine de ln|u| est plus large que celui de ln(u).", latex: "|u|>0 \\iff u\\neq 0" };
    case "D":
      return { texte: "ln(u) exige u > 0 : étudie le signe du trinôme sous le logarithme.", latex: null };
    case "E":
      return { texte: "ln(x) exige x > 0, et le quotient exige un dénominateur non nul.", latex: null };
  }
}

export function aideDomaineNiveau2(exercice: ExerciceEtudeFonctionLogarithme): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
    case "E":
      return { texte: "Les deux conditions portent sur le même x : écris-les, puis garde les x qui vérifient les deux.", latex: null };
    case "B":
      return { texte: "Écris la condition « base strictement positive » pour cette fonction et résous-la :", latex: `${baseBLatex(exercice)} > 0` };
    case "C":
      return { texte: "Il suffit d'exclure les zéros du trinôme : résous", latex: `${trinomeC(exercice)} = 0` };
    case "D": {
      const b = -2 * exercice.p;
      const c = exercice.p * exercice.p + exercice.a * exercice.a;
      return { texte: "Calcule le discriminant du trinôme (son signe dit si le trinôme peut s'annuler ou devenir négatif) :", latex: `\\Delta = ${entreParentheses(b)}^2 - 4\\cdot ${c}` };
    }
  }
}

export function aideLimitesNiveau1(exercice: ExerciceEtudeFonctionLogarithme): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return { texte: "En 0⁺, ln(x) → −∞ et le dénominateur x → 0⁺ ; en +∞, croissances comparées.", latex: "\\lim_{x\\to+\\infty}\\dfrac{\\ln(x)}{x}=0" };
    case "B":
      return { texte: "Réécris la puissance avec l'exponentielle et étudie la limite de l'exposant.", latex: "u^{v}=e^{v\\ln(u)}" };
    case "C":
      return { texte: "Aux valeurs exclues, |trinôme| → 0⁺ et ln(0⁺) = −∞ ; aux infinis, le trinôme → +∞.", latex: null };
    case "D":
      return { texte: "Aux infinis, le trinôme tend vers +∞, donc son logarithme aussi.", latex: null };
    case "E":
      return { texte: "Mets au même dénominateur pour lever l'indétermination en 0⁺.", latex: "\\ln(x)+\\dfrac{c}{x}=\\dfrac{x\\ln(x)+c}{x}" };
  }
}

export function aideLimitesNiveau2(exercice: ExerciceEtudeFonctionLogarithme): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return { texte: "Sépare la fraction en deux termes :", latex: `f(x) = ${exercice.k}\\cdot\\dfrac{\\ln(x)}{x} + \\dfrac{${exercice.k * exercice.c}}{x}` };
    case "B":
      return { texte: "En 0⁺, croissances comparées :", latex: "\\lim_{x\\to 0^+} x\\ln(x) = 0" };
    case "C":
    case "D":
      return { texte: "Tiens compte du signe du facteur devant le logarithme : il inverse les limites s'il est négatif.", latex: null };
    case "E":
      return { texte: "En 0⁺, croissances comparées : le numérateur x·ln(x) + c tend vers c > 0.", latex: "\\lim_{x\\to 0^+} x\\ln(x) = 0" };
  }
}

export function aideAsymptotesNiveau1(_exercice: ExerciceEtudeFonctionLogarithme): AideAvecLatex {
  return {
    texte:
      "Limite infinie quand x tend vers une valeur finie a ⟹ asymptote verticale x = a. Limite finie L en ±∞ ⟹ asymptote horizontale y = L. Une limite finie en une borne FINIE du domaine n'est PAS une asymptote.",
    latex: null,
  };
}

export function aideAsymptotesNiveau2(exercice: ExerciceEtudeFonctionLogarithme): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return { texte: "Relis tes limites : en 0⁺ et en +∞, chacune est-elle infinie, finie ou nulle ?", latex: null };
    case "C":
      return { texte: "Les candidates sont les valeurs exclues du domaine, là où f tend vers ±∞.", latex: null };
    default:
      return { texte: "Pour une limite infinie en ±∞, cherche une éventuelle asymptote oblique : f(x)/x a-t-il une limite finie non nulle ?", latex: "\\lim_{x\\to\\pm\\infty}\\dfrac{f(x)}{x}" };
  }
}

export function aideCroissanceNiveau1(exercice: ExerciceEtudeFonctionLogarithme): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return { texte: "Dérive le quotient, puis étudie le signe du numérateur (x² > 0).", latex: "\\left(\\dfrac{u}{v}\\right)'=\\dfrac{u'v-uv'}{v^2}" };
    case "B":
      return { texte: "Dérivation logarithmique : pose g(x) = f(x) − c, prends ln des deux membres et dérive.", latex: `\\ln\\left(g(x)\\right) = ${exercice.a === 1 ? "" : exercice.a}x\\ln\\left(${baseBLatex(exercice)}\\right)` };
    case "C":
      return { texte: "Dérive ln|u| comme ln(u) : (ln|u|)' = u'/u, puis étudie séparément le signe du numérateur et du trinôme sur chaque intervalle.", latex: "\\left(\\ln|u|\\right)'=\\dfrac{u'}{u}" };
    case "D":
      return { texte: "Dérive le logarithme d'une fonction :", latex: "\\left(\\ln(u)\\right)'=\\dfrac{u'}{u}" };
    case "E":
      return { texte: "Dérive terme à terme, puis mets au même dénominateur.", latex: "\\left(\\dfrac{c}{x}\\right)' = -\\dfrac{c}{x^2}" };
  }
}

export function aideCroissanceNiveau2(exercice: ExerciceEtudeFonctionLogarithme): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return { texte: "Après simplification (l'équation f'(x) = 0 reste à résoudre) :", latex: `f'(x) = \\dfrac{${exercice.k}\\left(${1 - exercice.c} - \\ln(x)\\right)}{x^2}` };
    case "B":
      return { texte: "Tu dois obtenir (g > 0, il reste à étudier le signe de la parenthèse) :", latex: `\\dfrac{g'(x)}{g(x)} = ${exercice.a === 1 ? "" : exercice.a}\\left(\\ln\\left(${baseBLatex(exercice)}\\right) + 1\\right)` };
    case "C":
      return { texte: "La valeur de l'extremum se calcule en remplaçant x par le zéro de f' dans f. Au passage, le trinôme y vaut :", latex: `${-exercice.q * exercice.q}` };
    case "D":
      return { texte: "Dérivée (son signe reste à étudier) :", latex: `f'(x) = \\dfrac{${exercice.m}\\left(2x${termeConstanteLatex(-2 * exercice.p)}\\right)}{${trinomeLatex(-2 * exercice.p, exercice.p * exercice.p + exercice.a * exercice.a)}}` };
    case "E":
      return { texte: "Dérivée terme à terme (mise au même dénominateur non faite) :", latex: `f'(x) = ${exercice.m}\\left(\\dfrac{1}{x} - \\dfrac{${exercice.c}}{x^2}\\right)` };
  }
}

export function aideConcaviteNiveau1(_exercice: ExerciceEtudeFonctionLogarithme): AideAvecLatex {
  return {
    texte: "Étudie le signe de f'' : f'' > 0 ⟹ convexe, f'' < 0 ⟹ concave ; un changement de signe de f'' donne un point d'inflexion.",
    latex: "f''(x) > 0 \\Rightarrow \\text{convexe} \\qquad f''(x) < 0 \\Rightarrow \\text{concave}",
  };
}

export function aideConcaviteNiveau2(exercice: ExerciceEtudeFonctionLogarithme): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return { texte: "Dérivée seconde (son signe reste à étudier) :", latex: `f''(x) = \\dfrac{${exercice.k}\\left(2\\ln(x)${termeConstanteLatex(2 * exercice.c - 3)}\\right)}{x^3}` };
    case "B":
      return { texte: "Avec g = f − c : g'' = g·[(g'/g)² + (g'/g)'] — compare chaque terme à 0 (x > 0).", latex: `\\dfrac{g''(x)}{g(x)} = ${exercice.a * exercice.a === 1 ? "" : exercice.a * exercice.a}\\left(\\ln\\left(${baseBLatex(exercice)}\\right)+1\\right)^2 + \\dfrac{${exercice.a}}{x}` };
    case "C":
      return {
        texte: "Dérivée seconde (son signe reste à étudier) :",
        latex: `f''(x) = \\dfrac{${-2 * exercice.m}\\left(\\left(x${termeConstanteLatex(-exercice.p)}\\right)^2 + ${exercice.q * exercice.q}\\right)}{\\left(${trinomeC(exercice)}\\right)^2}`,
      };
    case "D":
      return {
        texte: "Dérivée seconde (son signe reste à étudier) :",
        latex: `f''(x) = \\dfrac{${2 * exercice.m}\\left(${exercice.a * exercice.a} - \\left(x${termeConstanteLatex(-exercice.p)}\\right)^2\\right)}{\\left(${trinomeLatex(-2 * exercice.p, exercice.p * exercice.p + exercice.a * exercice.a)}\\right)^2}`,
      };
    case "E":
      return { texte: "Dérivée seconde terme à terme (mise au même dénominateur non faite) :", latex: `f''(x) = ${exercice.m}\\left(-\\dfrac{1}{x^2} + \\dfrac{${2 * exercice.c}}{x^3}\\right)` };
  }
}

export function aideGraphiqueNiveau1(_exercice: ExerciceEtudeFonctionLogarithme): AideAvecLatex {
  return { texte: "Compare chaque graphique à tes conclusions : limites et asymptotes, sens de variation et extremum, concavité.", latex: null };
}

export function aideGraphiqueNiveau2(exercice: ExerciceEtudeFonctionLogarithme): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return { texte: "Regarde en particulier le comportement près de 0⁺ et la droite dont la courbe se rapproche en +∞.", latex: null };
    case "B":
      return { texte: "Regarde en particulier le point de départ de la courbe en 0⁺ et la nature de l'extremum.", latex: null };
    case "C":
      return { texte: "Regarde en particulier l'axe de symétrie de la courbe et ses 3 branches.", latex: null };
    case "D":
      return { texte: "Regarde en particulier l'abscisse de l'extremum et l'écart entre les deux points d'inflexion.", latex: null };
    case "E":
      return { texte: "Regarde en particulier l'existence d'un extremum et le comportement près de 0⁺.", latex: null };
  }
}

// ============================================================================
// Récapitulatif et réponse révélée — un contenu LaTeX par écran.
// ============================================================================

export const LIBELLE_PHASE_ETUDE_LOG: Record<PhaseEtudeFonctionLogarithme, string> = {
  domaine: "Domaine",
  limites: "Limites",
  asymptotes: "Asymptotes",
  croissance: "Croissance",
  concavite: "Concavité",
  graphique: "Graphique",
};

export function phasesVisitees(): PhaseEtudeFonctionLogarithme[] {
  return PHASES_ETUDE_LOG;
}

function formatCibleLimiteLatex(cible: CibleLimite): string {
  if (cible.type === "plus_infini") return "+\\infty";
  if (cible.type === "moins_infini") return "-\\infty";
  if (cible.type === "zero") return "0";
  return String(cible.valeur);
}

/** « e ≈ 2,72 » — la forme exacte, suivie de sa valeur approchée quand elle n'est pas entière. */
function positionLatex(exacte: string, valeur: number): string {
  if (Number.isInteger(valeur) || exacte === String(valeur)) return exacte;
  return `${exacte} \\approx ${nombreLatex(valeur)}`;
}

function formatConcaviteLatex(concavite: CibleConcaviteLog): string {
  if (concavite.type === "convexe_partout") return "\\text{convexe sur tout le domaine}";
  if (concavite.type === "concave_partout") return "\\text{concave sur tout le domaine}";
  const positions = concavite.positions.map((p, i) => `x = ${positionLatex(concavite.positionsLatex[i], p)}`);
  return concavite.positions.length > 1 ? `\\text{points d'inflexion en } ${positions.join(" \\text{ et } ")}` : `\\text{point d'inflexion en } ${positions[0]}`;
}

/** Réponse RÉELLEMENT attendue d'un écran, toujours en LaTeX — alimente la réponse révélée, la
 * fiche de consultation, le récapitulatif et le corrigé exporté. */
export function contenuRecapLatex(exercice: ExerciceEtudeFonctionLogarithme, phase: PhaseEtudeFonctionLogarithme): string {
  switch (phase) {
    case "domaine":
      return formatEnsembleReelLatex(exercice.domaine);
    case "limites": {
      const labels = directionLabelsLimites(exercice);
      return `\\begin{gathered} ${labels.map((l, i) => `${l.latex} : ${formatCibleLimiteLatex(exercice.limites[i])}`).join(" \\\\ ")} \\end{gathered}`;
    }
    case "asymptotes": {
      if (exercice.famille === "C") return exercice.asymptotes.map(formatEquationAsymptoteLatex).join(" \\quad\\text{et}\\quad ");
      const labels = directionLabelsAsymptotes(exercice);
      return `\\begin{gathered} ${labels.map((l, i) => `${l.latex} : ${formatEquationAsymptoteLatex(exercice.asymptotes[i])}`).join(" \\\\ ")} \\end{gathered}`;
    }
    case "croissance": {
      if (exercice.famille === "C") {
        const intervalles = intervallesGrilleCLatex(exercice);
        const lignes = exercice.croissance.signes.map((s, i) => `\\text{${s === "croissante" ? "croissante" : "décroissante"} sur } ${intervalles[i]}`);
        const nature = exercice.croissance.extremum === "maximum" ? "maximum" : "minimum";
        lignes.push(`\\text{${nature} local : } f(${exercice.croissance.positionExtremum}) = ${positionLatex(exercice.croissance.valeurExtremumLatex, exercice.croissance.valeurExtremum)}`);
        return `\\begin{gathered} ${lignes.join(" \\\\ ")} \\end{gathered}`;
      }
      const c = exercice.croissance;
      if (c.type === "croissante_partout") return "\\text{croissante sur tout le domaine}";
      if (c.type === "decroissante_partout") return "\\text{décroissante sur tout le domaine}";
      return `\\text{${c.type === "minimum" ? "minimum" : "maximum"} en } x = ${positionLatex(exercice.croissanceLatex, c.position as number)}`;
    }
    case "concavite":
      return formatConcaviteLatex(exercice.concavite);
    case "graphique":
      return `\\text{graphique ${String.fromCharCode(65 + exercice.indexCorrect)}}`;
  }
}

export function detailPourPhase(details: Partial<Record<PhaseEtudeFonctionLogarithme, DetailPhaseEtudeFonctionLogarithme>>, phase: PhaseEtudeFonctionLogarithme): DetailPhaseEtudeFonctionLogarithme | undefined {
  return details[phase];
}
