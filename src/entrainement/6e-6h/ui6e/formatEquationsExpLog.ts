import type { ExerciceEqLogA, ExerciceEqLogB, ExerciceEqLogC, ExerciceEqLogD, ExerciceEqLogE, ExerciceEqLogG, ExerciceEquationsExpLog, IssueSimplificationG } from "../core6e/equationsExpLog.types";
import type { PhaseEquationsExpLog } from "../moteur6e/typesEquationsExpLog";
import { formatFractionLatex } from "./formatFraction";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage LaTeX pour `6gen14`. Consigne générale FIXE
 * (`CONSIGNE_GENERALE`, jamais une fonction de l'exercice) — contrairement à `6gen12` (énoncés
 * contextualisés), ce générateur reste dans le registre "résous l'équation" déjà établi par
 * `formatEquationsExponentielles.ts` (6gen9) : l'énoncé RÉEL est le `blocDonnees` (l'équation
 * elle-même), jamais une phrase française à générer.
 *
 * **Convention log/base numérique rappelée à l'élève** (voir en-tête de
 * `core6e/equationsExpLog.types.ts`) : chaque fois qu'une réponse ATTENDUE peut nécessiter un
 * logarithme de base non-e, le `placeholder`/l'aide correspondante rappelle explicitement la forme
 * `ln(...)/ln(...)` — jamais `log_base(...)` littéral, que l'évaluateur ne saurait lire.
 */

export const CONSIGNE_GENERALE = "Résous l'équation suivante :";

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

/** Texte brut mêlé à du LaTeX inline court — même contrat que `ui/formatEquationDroite.ts`
 * (dupliqué ici à dessein, convention CLAUDE.md), rendu via `components/RenduFragments.tsx`. */
export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

function texte(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}
function latex(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
}

/** Rappel de SAISIE (l'évaluateur ne lit pas `log_base(…)`), en fragments pour `consigneEcranC`
 * cEcran3 — retiré de la version papier (`export/consignePapier.ts`). */
const RAPPEL_LN_FRAGMENTS: FragmentConsigne[] = [texte("Rappel : un logarithme de base numérique s'écrit "), latex("\\dfrac{\\ln(\\text{argument})}{\\ln(\\text{base})}"), texte(" — jamais "), latex("\\log(\\ldots)"), texte(" littéral.")];

export function formatBaseLatex(base: number): string {
  return Math.abs(base - Math.E) < 1e-9 ? "e" : String(base);
}

/** Décimal FRANÇAIS (virgule) arrondi — pour l'AFFICHAGE (aides, récapitulatif) seulement, jamais
 * la valeur de comparaison (toujours exacte côté `moteur6e/verificationEquationsExpLog.ts`). */
export function formatDecimal(v: number, decimales = 3): string {
  const f = Math.pow(10, decimales);
  const r = Math.round(v * f) / f;
  return String(r).replace(".", "{,}").replace("-{,}", "-0{,}");
}

/** Formate une valeur EXACTE pour affichage : entier brut si `v` est (numériquement) entier, sinon
 * une valeur approchée précédée de `\\approx`. */
function formatValeurLatex(v: number): string {
  if (Math.abs(v - Math.round(v)) < 1e-9) return String(Math.round(v));
  return `\\approx ${formatDecimal(v, 3)}`;
}

function formatCoefFois(coef: number, variable: string): string {
  if (coef === 1) return variable;
  if (coef === -1) return `-${variable}`;
  return `${coef}${variable}`;
}

/** "mx+n" (ou "mx-|n|"), signe correctement géré — jamais "+-2" à l'écran (convention CLAUDE.md,
 * "jamais de signe non simplifié"). */
export function formatAffineLatex(m: number, n: number, variable = "x"): string {
  const terme = formatCoefFois(m, variable);
  if (n === 0) return terme;
  return n > 0 ? `${terme}+${n}` : `${terme}-${Math.abs(n)}`;
}

function estEntier(v: number): boolean {
  return Math.abs(v - Math.round(v)) < 1e-9;
}

/** Forme EXACTE suivie de sa valeur approchée à la virgule (`\\approx`) — la réponse révélée donne
 * toujours la forme exacte que demande la consigne, jamais seulement « ≈ 3,644 ». Un entier
 * s'affiche seul. */
function exactEtApprox(exact: string, v: number): string {
  if (estEntier(v)) return String(Math.round(v));
  return `${exact} \\approx ${formatDecimal(v, 3)}`;
}

/** Combinaison linéaire `c₁·ln(a₁) + c₂·ln(a₂) + …` (termes nuls omis, coefficients ±1 implicites,
 * signes simplifiés) — "0" si tous les coefficients sont nuls. */
export function combinaisonLnLatex(termes: { c: number; arg: number }[]): string {
  let resultat = "";
  for (const { c, arg } of termes) {
    if (c === 0) continue;
    const abs = Math.abs(c);
    const corps = `${abs === 1 ? "" : abs}\\ln(${arg})`;
    if (resultat === "") resultat = c < 0 ? `-${corps}` : corps;
    else resultat += c < 0 ? `-${corps}` : `+${corps}`;
  }
  return resultat === "" ? "0" : resultat;
}

/** Fraction `num/den` de deux combinaisons de ln, signe sorti du dénominateur (premier terme non nul
 * du dénominateur rendu positif). */
function fractionLnLatex(num: { c: number; arg: number }[], den: { c: number; arg: number }[]): string {
  const premier = den.find((t) => t.c !== 0);
  const signe = premier !== undefined && premier.c < 0 ? -1 : 1;
  const n = num.map((t) => ({ c: signe * t.c, arg: t.arg }));
  const d = den.map((t) => ({ c: signe * t.c, arg: t.arg }));
  const numLatex = combinaisonLnLatex(n);
  if (numLatex === "0") return "0";
  return `\\dfrac{${numLatex}}{${combinaisonLnLatex(d)}}`;
}

/** Exposant entier `k` tel que `base^k = t`, ou `null` (même plage que le générateur). */
function exposantEntier(t: number, base: number): number | null {
  for (let k = -2; k <= 6; k++) {
    if (Math.abs(Math.pow(base, k) - t) < 1e-9) return k;
  }
  return null;
}

// ============================================================================
// Famille A.
// ============================================================================

/** `C` affiché toujours en valeur EXACTE — jamais en décimal (convention CLAUDE.md, "fraction
 * irréductible, jamais de décimal") : quand `C=base^p` avec `p<0`, `C` est une fraction exacte
 * `1/base^|p|` (ex. `2^-2=1/4`) — rendue en fraction LaTeX plutôt qu'en `0,25`. Dans tous les
 * autres cas (`p≥0`, ou générique) `C` est déjà un entier. */
export function formatCLatex(ex: ExerciceEqLogA): string {
  if (ex.p !== null && ex.p < 0) return `\\dfrac{1}{${ex.base}^{${-ex.p}}}`;
  return String(ex.C);
}

function blocDonneesA(ex: ExerciceEqLogA): string[] {
  return [`${ex.base}^{${formatAffineLatex(ex.m, ex.n)}} = ${formatCLatex(ex)}`];
}

/** Exposant cible en forme EXACTE : l'entier `p` quand `C` est une puissance de la base, sinon
 * `ln(C)/ln(base)`. */
export function exposantExactA(ex: ExerciceEqLogA): string {
  if (ex.p !== null) return String(ex.p);
  return `\\dfrac{\\ln(${ex.C})}{\\ln(${ex.base})}`;
}

/** x = (exposant − n)/m en forme EXACTE : fraction si l'exposant est entier, sinon
 * (ln(C) − n·ln(base)) / (m·ln(base)). */
export function xExactA(ex: ExerciceEqLogA): string {
  if (ex.p !== null) return formatFractionLatex(ex.p - ex.n, ex.m);
  return fractionLnLatex(
    [
      { c: 1, arg: ex.C },
      { c: -ex.n, arg: ex.base },
    ],
    [{ c: ex.m, arg: ex.base }],
  );
}

function etatActuelA(ex: ExerciceEqLogA, phase: "aEcran1" | "aEcran2"): string[] | null {
  if (phase === "aEcran1") return null;
  return [`\\text{exposant} = ${exposantExactA(ex)}`];
}

function consigneEcranA(_ex: ExerciceEqLogA, phase: "aEcran1" | "aEcran2"): FragmentConsigne[] {
  if (phase === "aEcran1") return [texte("Isole l'exposant : s'il correspond à une puissance entière reconnaissable de la base, donne-le directement (sans logarithme) ; sinon, exprime-le à l'aide d'un logarithme.")];
  return [texte("À partir de la valeur CORRECTE de l'étape précédente, résous l'équation affine et donne x en valeur exacte (par exemple avec des ln) ou arrondie au millième.")];
}

function aideA1(_ex: ExerciceEqLogA, phase: "aEcran1" | "aEcran2"): AideAvecLatex {
  if (phase === "aEcran1") return { texte: "Rappel : vérifie d'abord si le second membre peut s'écrire comme une puissance entière ou simple de la base avant de recourir au logarithme. Un logarithme de base numérique s'écrit à l'aide de ln :", latex: "\\dfrac{\\ln(\\text{argument})}{\\ln(\\text{base})}" };
  return { texte: "Rappel : substitue l'exposant cible CORRECT de l'étape précédente dans mx+n=exposant, puis isole x.", latex: "mx+n=\\text{exposant}" };
}

function aideA2(ex: ExerciceEqLogA, phase: "aEcran1" | "aEcran2"): AideAvecLatex {
  if (phase === "aEcran1") return { texte: "Tentative de décomposition en puissance de la base (conclusion non donnée) :", latex: `${ex.base}^{?} = ${formatCLatex(ex)}` };
  return { texte: "Équation prête à résoudre (isolation non faite) :", latex: `${formatAffineLatex(ex.m, ex.n)} = ${exposantExactA(ex)}` };
}

function formatReponseA(ex: ExerciceEqLogA, phase: "aEcran1" | "aEcran2"): string[] {
  return phase === "aEcran1" ? [exactEtApprox(exposantExactA(ex), ex.exposantCible)] : [exactEtApprox(xExactA(ex), ex.x)];
}

// ============================================================================
// Famille B.
// ============================================================================

function blocDonneesB(ex: ExerciceEqLogB): string[] {
  return [`${ex.base1}^{${formatAffineLatex(ex.m1, ex.n1)}} = ${ex.base2}^{${formatAffineLatex(ex.m2, ex.n2)}}`];
}

function etatActuelB(ex: ExerciceEqLogB, phase: "bEcran1" | "bEcran2"): string[] | null {
  if (phase === "bEcran1") return null;
  return [`(${formatAffineLatex(ex.m1, ex.n1)})\\ln(${ex.base1}) = (${formatAffineLatex(ex.m2, ex.n2)})\\ln(${ex.base2})`];
}

function consigneEcranB(_ex: ExerciceEqLogB, phase: "bEcran1" | "bEcran2"): FragmentConsigne[] {
  if (phase === "bEcran1") return [texte("Prends le logarithme népérien des deux membres et développe ("), latex("\\ln(a^u)=u\\cdot\\ln(a)"), texte(").")];
  return [texte("À partir de la forme développée CORRECTE de l'étape précédente, regroupe les termes en x d'un côté, les constantes de l'autre, puis isole x. Donne x en valeur exacte ou arrondie au millième.")];
}

function aideB1(_ex: ExerciceEqLogB, phase: "bEcran1" | "bEcran2"): AideAvecLatex {
  if (phase === "bEcran1") return { texte: "Rappel : propriété de la puissance, à appliquer aux DEUX membres :", latex: "\\ln(a^u)=u\\cdot\\ln(a)" };
  return { texte: "Rappel : regroupe tous les termes en x d'un côté de l'égalité, les constantes de l'autre.", latex: null };
}

function aideB2(ex: ExerciceEqLogB, phase: "bEcran1" | "bEcran2"): AideAvecLatex {
  if (phase === "bEcran1") return { texte: "Un membre développé, l'autre non :", latex: `(${formatAffineLatex(ex.m1, ex.n1)})\\ln(${ex.base1}) = \\ldots` };
  const den = combinaisonLnLatex([
    { c: ex.m1, arg: ex.base1 },
    { c: -ex.m2, arg: ex.base2 },
  ]);
  const num = combinaisonLnLatex([
    { c: ex.n2, arg: ex.base2 },
    { c: -ex.n1, arg: ex.base1 },
  ]);
  return { texte: "Équation réarrangée (résolution non faite) :", latex: `x\\cdot\\big(${den}\\big) = ${num}` };
}

function formatReponseB(ex: ExerciceEqLogB, phase: "bEcran1" | "bEcran2"): string[] {
  if (phase === "bEcran1") return [`(${formatAffineLatex(ex.m1, ex.n1)})\\ln(${ex.base1}) = (${formatAffineLatex(ex.m2, ex.n2)})\\ln(${ex.base2})`];
  const exact = fractionLnLatex(
    [
      { c: ex.n2, arg: ex.base2 },
      { c: -ex.n1, arg: ex.base1 },
    ],
    [
      { c: ex.m1, arg: ex.base1 },
      { c: -ex.m2, arg: ex.base2 },
    ],
  );
  return [exactEtApprox(exact, ex.x)];
}

// ============================================================================
// Famille C.
// ============================================================================

/** "coef·base^{expr}" avec un signe correctement géré — terme de tête (`premier=true`) sans signe
 * devant. */
function formatTermePuissanceLatex(coef: number, basePuissance: string, premier: boolean): string {
  if (coef === 0) return "";
  const abs = Math.abs(coef);
  const facteur = abs === 1 ? "" : `${abs}\\cdot `;
  const signe = coef < 0 ? "-" : premier ? "" : "+";
  return `${signe}${facteur}${basePuissance}`;
}

function formatTermeConstantLatex(c: number): string {
  if (c === 0) return "";
  return c > 0 ? `+${c}` : `-${Math.abs(c)}`;
}

function blocDonneesC(ex: ExerciceEqLogC): string[] {
  const b = formatBaseLatex(ex.base);
  const t2 = formatTermePuissanceLatex(ex.A, `${b}^{2x}`, true);
  const t1 = formatTermePuissanceLatex(ex.B, `${b}^{x}`, false);
  const t0 = formatTermeConstantLatex(ex.Cc);
  return [`${t2}${t1}${t0}=0`];
}

function etatActuelC(ex: ExerciceEqLogC, phase: "cEcran1" | "cEcran2" | "cEcran3"): string[] | null {
  if (phase === "cEcran1") return null;
  const t2 = formatTermePuissanceLatex(ex.A, "t^2", true);
  const t1 = formatTermePuissanceLatex(ex.B, "t", false);
  const t0 = formatTermeConstantLatex(ex.Cc);
  const equationT = `${t2}${t1}${t0}=0`;
  if (phase === "cEcran2") return [equationT];
  return [equationT, `t \\in \\{${ex.tValides.map((t) => formatValeurLatex(t)).join(";\\ ")}\\}`];
}

function consigneEcranC(_ex: ExerciceEqLogC, phase: "cEcran1" | "cEcran2" | "cEcran3"): FragmentConsigne[] {
  if (phase === "cEcran1") return [texte("Pose "), latex("t=\\text{base}^x"), texte(" et réécris l'équation ci-dessus en fonction de t seul.")];
  if (phase === "cEcran2") return [texte("Résous l'équation du second degré en t, et ne garde que les valeurs strictement positives ("), latex("\\text{base}^x>0"), texte(" toujours).")];
  return [texte("Pour chaque valeur de t CORRECTE de l'étape précédente, détermine x — directement si t est une puissance reconnaissable de la base, sinon à l'aide d'un logarithme (valeur exacte ou arrondie au millième). "), ...RAPPEL_LN_FRAGMENTS];
}

function aideC1(_ex: ExerciceEqLogC, phase: "cEcran1" | "cEcran2" | "cEcran3"): AideAvecLatex {
  if (phase === "cEcran1") return { texte: "Rappel : écris les puissances de la base à l'aide de t :", latex: "\\text{base}^{2x}=(\\text{base}^x)^2=t^2,\\quad \\text{base}^x=t" };
  if (phase === "cEcran2") return { texte: "Rappel : une fois les racines du second degré trouvées, élimine toute valeur négative ou nulle — une puissance de la base est toujours strictement positive :", latex: "\\text{base}^x>0" };
  return { texte: "Rappel : vérifie pour chaque t s'il s'agit d'une puissance entière reconnaissable de la base avant de recourir au logarithme.", latex: null };
}

/** x = log_base(t) en forme EXACTE : l'entier k si t = base^k, `ln(t)` en base e, sinon
 * `ln(t)/ln(base)`. */
export function xExactC(ex: ExerciceEqLogC, t: number): string {
  const k = exposantEntier(t, ex.base);
  if (k !== null) return String(k);
  if (Math.abs(ex.base - Math.E) < 1e-9) return `\\ln(${t})`;
  return `\\dfrac{\\ln(${t})}{\\ln(${ex.base})}`;
}

function aideC2(ex: ExerciceEqLogC, phase: "cEcran1" | "cEcran2" | "cEcran3"): AideAvecLatex {
  if (phase === "cEcran1") {
    const t2 = formatTermePuissanceLatex(ex.A, "t^2", true);
    return { texte: "Substitution amorcée (le reste n'est pas encore réécrit) :", latex: `${t2}+\\ldots=0` };
  }
  if (phase === "cEcran2") {
    const discriminant = ex.B * ex.B - 4 * ex.A * ex.Cc;
    return { texte: "Discriminant de l'équation en t (racines non calculées) :", latex: `\\Delta = (${ex.B})^2-4\\cdot ${ex.A}\\cdot (${ex.Cc}) = ${discriminant}` };
  }
  const plusAmbigu = [...ex.tValides].sort((a, b) => b - a)[0];
  return { texte: "Pour la valeur la plus ambiguë, tentative de décomposition amorcée :", latex: plusAmbigu === undefined ? "\\text{(aucune valeur de t valide)}" : `${formatBaseLatex(ex.base)}^{?} \\approx ${formatValeurLatex(plusAmbigu)}` };
}

function formatReponseC(ex: ExerciceEqLogC, phase: "cEcran1" | "cEcran2" | "cEcran3"): string[] {
  if (phase === "cEcran1") {
    const t2 = formatTermePuissanceLatex(ex.A, "t^2", true);
    const t1 = formatTermePuissanceLatex(ex.B, "t", false);
    const t0 = formatTermeConstantLatex(ex.Cc);
    return [`${t2}${t1}${t0}=0`];
  }
  if (phase === "cEcran2") return ex.tValides.length === 0 ? ["\\varnothing"] : ex.tValides.map((t) => formatValeurLatex(t));
  return ex.xValides.length === 0 ? ["\\varnothing"] : ex.tValides.map((t, i) => exactEtApprox(xExactC(ex, t), ex.xValides[i]));
}

// ============================================================================
// Famille D.
// ============================================================================

function blocDonneesD(ex: ExerciceEqLogD): string[] {
  return [`\\log_{${ex.a}}(x) = ${ex.k}`];
}

export function xExactD(ex: ExerciceEqLogD): string {
  return ex.k >= 0 ? String(Math.pow(ex.a, ex.k)) : formatFractionLatex(1, Math.pow(ex.a, -ex.k));
}

function etatActuelD(_ex: ExerciceEqLogD, phase: "dEcran1" | "dEcran2"): string[] | null {
  if (phase === "dEcran1") return null;
  return ["\\text{CE} : ]0;+\\infty["];
}

function consigneEcranD(_ex: ExerciceEqLogD, phase: "dEcran1" | "dEcran2"): FragmentConsigne[] {
  if (phase === "dEcran1") return [texte("Pose la condition d'existence (CE) — rappelle-toi ce que doit vérifier l'argument d'un logarithme.")];
  return [texte("Résous l'équation pour x et donne sa valeur exacte.")];
}

function aideD1(_ex: ExerciceEqLogD, phase: "dEcran1" | "dEcran2"): AideAvecLatex {
  if (phase === "dEcran1") return { texte: "Rappel : l'argument d'un logarithme doit être strictement positif ; sa base doit être strictement positive et différente de 1.", latex: null };
  return { texte: "Rappel : un logarithme et une exponentielle de même base se défont mutuellement.", latex: "\\log_a(x)=k \\iff x=a^k" };
}

function aideD2(_ex: ExerciceEqLogD, phase: "dEcran1" | "dEcran2"): AideAvecLatex {
  if (phase === "dEcran1") return { texte: "Ici, x est l'ARGUMENT du logarithme (la base est déjà connue).", latex: null };
  return { texte: "Rappel des puissances d'exposant nul ou négatif :", latex: "a^0=1, \\qquad a^{-n}=\\dfrac{1}{a^n}" };
}

function formatReponseD(ex: ExerciceEqLogD, phase: "dEcran1" | "dEcran2"): string[] {
  if (phase === "dEcran1") return ["]0;+\\infty["];
  return [xExactD(ex)];
}

// ============================================================================
// Famille E.
// ============================================================================

function blocDonneesE(ex: ExerciceEqLogE): string[] {
  const b = formatBaseLatex(ex.base);
  return [`\\log_{${b}}(x-${ex.p}) + \\log_{${b}}(x-${ex.q}) = \\log_{${b}}(${formatAffineLatex(ex.e, ex.d)})`];
}

/** Borne de la CE en valeur EXACTE : un entier, ou `-d/e` en fraction irréductible (les seules
 * bornes non entières possibles, voir `familles/E.ts`) — jamais un flottant brut (« 4.333… »). */
function borneCELatex(ex: ExerciceEqLogE, borne: number): string {
  if (estEntier(borne)) return String(Math.round(borne));
  return formatFractionLatex(-ex.d, ex.e);
}

export function ceELatex(ex: ExerciceEqLogE): string {
  return ex.ceSup === null ? `x > ${borneCELatex(ex, ex.ceInf)}` : `${borneCELatex(ex, ex.ceInf)} < x < ${borneCELatex(ex, ex.ceSup)}`;
}

/** `x² − Sx + P` développé, signes simplifiés. */
export function polynomeELatex(ex: ExerciceEqLogE): string {
  const S = ex.p + ex.q + ex.e;
  const P = ex.p * ex.q - ex.d;
  const termeX = S === 0 ? "" : S > 0 ? `-${S === 1 ? "" : S}x` : `+${-S === 1 ? "" : -S}x`;
  const termeC = P === 0 ? "" : P > 0 ? `+${P}` : `-${-P}`;
  return `x^2${termeX}${termeC}`;
}

function etatActuelE(ex: ExerciceEqLogE, phase: "eEcran1" | "eEcran2" | "eEcran3"): string[] | null {
  if (phase === "eEcran1") return null;
  if (phase === "eEcran2") return [`\\text{CE} : ${ceELatex(ex)}`];
  return [`\\text{CE} : ${ceELatex(ex)}`, `(x-${ex.p})(x-${ex.q}) = ${formatAffineLatex(ex.e, ex.d)}`];
}

function consigneEcranE(_ex: ExerciceEqLogE, phase: "eEcran1" | "eEcran2" | "eEcran3"): FragmentConsigne[] {
  if (phase === "eEcran1") return [texte("Pose la CE : chaque argument de chaque logarithme doit être strictement positif.")];
  if (phase === "eEcran2") return [texte("Combine les 2 logarithmes du membre de gauche (somme ⟹ produit) pour obtenir une équation polynomiale sans logarithme.")];
  return [texte("Résous l'équation polynomiale CORRECTE de l'étape précédente, puis filtre les racines trouvées à l'aide de la CE CORRECTE de l'étape 1.")];
}

function aideE1(_ex: ExerciceEqLogE, phase: "eEcran1" | "eEcran2" | "eEcran3"): AideAvecLatex {
  if (phase === "eEcran1") return { texte: "Rappel : chaque argument de chaque logarithme doit être strictement positif, séparément.", latex: null };
  if (phase === "eEcran2") return { texte: "Rappel : une somme de logarithmes de même base est le logarithme du produit ; égale ensuite les arguments (même base des deux côtés) :", latex: "\\log_{\\text{base}}(A)+\\log_{\\text{base}}(B)=\\log_{\\text{base}}(A\\cdot B)" };
  return { texte: "Rappel : vérifie chaque racine trouvée contre la CE avant de conclure — n'en élimine ni n'en garde une par erreur.", latex: null };
}

function aideE2(ex: ExerciceEqLogE, phase: "eEcran1" | "eEcran2" | "eEcran3"): AideAvecLatex {
  if (phase === "eEcran1") return { texte: "Inéquations individuelles (intersection non faite) :", latex: `x>${ex.p} \\quad ; \\quad x>${ex.q}` };
  if (phase === "eEcran2") {
    const b = formatBaseLatex(ex.base);
    return { texte: "Membre de gauche combiné (il reste à égaler les arguments des deux membres) :", latex: `\\log_{${b}}\\big((x-${ex.p})(x-${ex.q})\\big)` };
  }
  const S = ex.p + ex.q + ex.e;
  const P = ex.p * ex.q - ex.d;
  return { texte: "Équation développée et son discriminant (racines non calculées) — à confronter ensuite à la CE :", latex: `${polynomeELatex(ex)}=0 \\qquad \\Delta = ${S * S - 4 * P}` };
}

function formatReponseE(ex: ExerciceEqLogE, phase: "eEcran1" | "eEcran2" | "eEcran3"): string[] {
  if (phase === "eEcran1") return [ceELatex(ex)];
  if (phase === "eEcran2") return [`(x-${ex.p})(x-${ex.q}) = ${formatAffineLatex(ex.e, ex.d)}`];
  return ex.solutionsFinales.length === 0 ? ["\\varnothing"] : ex.solutionsFinales.map((r) => formatValeurLatex(r));
}

// ============================================================================
// Famille G.
// ============================================================================

function blocDonneesG(ex: ExerciceEqLogG): string[] {
  const b = formatBaseLatex(ex.base);
  if (ex.type === "violationCE") return [`\\log_{${b}}(${formatAffineLatex(ex.m1, ex.n1)}) = \\log_{${b}}(${formatAffineLatex(ex.m2, ex.n2)})`];
  if (ex.type === "identite") return [`\\log_{${b}}(${formatAffineLatex(ex.m1, ex.n1)}) + \\log_{${b}}(${formatAffineLatex(ex.m2, ex.n2)}) = \\log_{${b}}\\big((${formatAffineLatex(ex.m1, ex.n1)})(${formatAffineLatex(ex.m2, ex.n2)})\\big)`];
  return [`\\log_{${b}}(x^2+${ex.b0}) = \\log_{${b}}(${ex.c0})`];
}

function etatActuelG(ex: ExerciceEqLogG, phase: "gEcran1" | "gEcran2"): string[] | null {
  if (phase === "gEcran1") return null;
  return formatReponseG(ex, "gEcran1");
}

function consigneEcranG(_ex: ExerciceEqLogG, phase: "gEcran1" | "gEcran2"): FragmentConsigne[] {
  if (phase === "gEcran1") return [texte("Fais disparaître les logarithmes : combine les membres si nécessaire, puis égale les arguments. Écris l'équation obtenue.")];
  return [texte("Confronte l'équation simplifiée CORRECTE de l'étape précédente à la condition d'existence de l'équation de départ, puis choisis le verdict qui s'applique.")];
}

function aideG1(_ex: ExerciceEqLogG, phase: "gEcran1" | "gEcran2"): AideAvecLatex {
  if (phase === "gEcran1") return { texte: "Rappel : une somme de logarithmes de même base devient le logarithme du produit, et deux logarithmes de même base sont égaux si et seulement si leurs arguments le sont.", latex: "\\log_b(A)+\\log_b(B)=\\log_b(A\\cdot B), \\qquad \\log_b(A)=\\log_b(B) \\iff A=B" };
  return { texte: "Rappel des 3 issues possibles après simplification : l'ensemble vide par violation de la CE, l'ensemble vide par discriminant négatif, ou vrai sur tout le domaine (= la CE elle-même).", latex: null };
}

/** Aides de niveau 2 : orientent vers le BON test sans jamais énoncer le verdict (audit : l'ancienne
 * aide disait « l'égalité obtenue est une IDENTITÉ » ou « discriminant < 0 », soit la réponse). */
function aideG2(ex: ExerciceEqLogG, phase: "gEcran1" | "gEcran2"): AideAvecLatex {
  if (phase === "gEcran1") {
    if (ex.type === "identite") return { texte: "Applique la règle du produit au membre de gauche, puis compare-le au membre de droite.", latex: null };
    return { texte: "Chaque membre est déjà un seul logarithme de même base : égale directement leurs arguments.", latex: null };
  }
  if (ex.type === "violationCE") return { texte: "Résous l'équation simplifiée, puis remplace x par la valeur trouvée dans un argument de l'équation de départ : est-il strictement positif ?", latex: null };
  if (ex.type === "identite") return { texte: "L'équation simplifiée ne contient plus x : demande-toi pour quels x l'équation de départ a seulement un sens.", latex: null };
  return { texte: "Isole x² dans l'équation simplifiée et regarde le signe du second membre.", latex: null };
}

/** CE de l'identité (`m1x+n1>0` et `m2x+n2>0`), en valeurs exactes — jamais vide (voir
 * `familles/G.ts`). */
export function ceIdentiteLatex(ex: Extract<ExerciceEqLogG, { type: "identite" }>): string {
  const conditions = [
    { m: ex.m1, n: ex.n1 },
    { m: ex.m2, n: ex.n2 },
  ].map(({ m, n }) => ({ croissante: m > 0, seuil: -n / m, latex: formatFractionLatex(-n, m) }));
  const minorants = conditions.filter((c) => c.croissante).sort((a, b) => b.seuil - a.seuil);
  const majorants = conditions.filter((c) => !c.croissante).sort((a, b) => a.seuil - b.seuil);
  if (majorants.length === 0) return `x > ${minorants[0].latex}`;
  if (minorants.length === 0) return `x < ${majorants[0].latex}`;
  return `${minorants[0].latex} < x < ${majorants[0].latex}`;
}

function formatReponseG(ex: ExerciceEqLogG, phase: "gEcran1" | "gEcran2"): string[] {
  if (phase === "gEcran1") {
    if (ex.type === "violationCE") return [`${formatAffineLatex(ex.m1, ex.n1)} = ${formatAffineLatex(ex.m2, ex.n2)}`];
    if (ex.type === "identite") {
      const produit = `(${formatAffineLatex(ex.m1, ex.n1)})(${formatAffineLatex(ex.m2, ex.n2)})`;
      return [`${produit} = ${produit} \\iff 0=0`];
    }
    return [`x^2 = ${ex.c0 - ex.b0}`];
  }
  if (ex.type === "violationCE") return ["\\varnothing\\ (\\text{la solution trouvée viole la CE})"];
  if (ex.type === "identite") return [`\\text{vrai pour tout } x \\text{ de la CE : } ${ceIdentiteLatex(ex)}`];
  return ["\\varnothing\\ (\\text{discriminant} < 0)"];
}

// ============================================================================
// Dispatch général.
// ============================================================================

export function consigneGenerale(_exercice: ExerciceEquationsExpLog): FragmentConsigne[] {
  return [texte(CONSIGNE_GENERALE)];
}

export function blocDonnees(exercice: ExerciceEquationsExpLog): string[] {
  switch (exercice.famille) {
    case "A":
      return blocDonneesA(exercice);
    case "B":
      return blocDonneesB(exercice);
    case "C":
      return blocDonneesC(exercice);
    case "D":
      return blocDonneesD(exercice);
    case "E":
      return blocDonneesE(exercice);
    case "G":
      return blocDonneesG(exercice);
  }
}

export function etatActuel(exercice: ExerciceEquationsExpLog, phase: PhaseEquationsExpLog): string[] | null {
  switch (exercice.famille) {
    case "A":
      return etatActuelA(exercice, phase as "aEcran1" | "aEcran2");
    case "B":
      return etatActuelB(exercice, phase as "bEcran1" | "bEcran2");
    case "C":
      return etatActuelC(exercice, phase as "cEcran1" | "cEcran2" | "cEcran3");
    case "D":
      return etatActuelD(exercice, phase as "dEcran1" | "dEcran2");
    case "E":
      return etatActuelE(exercice, phase as "eEcran1" | "eEcran2" | "eEcran3");
    case "G":
      return etatActuelG(exercice, phase as "gEcran1" | "gEcran2");
  }
}

export function consigneEcran(exercice: ExerciceEquationsExpLog, phase: PhaseEquationsExpLog): FragmentConsigne[] {
  switch (exercice.famille) {
    case "A":
      return consigneEcranA(exercice, phase as "aEcran1" | "aEcran2");
    case "B":
      return consigneEcranB(exercice, phase as "bEcran1" | "bEcran2");
    case "C":
      return consigneEcranC(exercice, phase as "cEcran1" | "cEcran2" | "cEcran3");
    case "D":
      return consigneEcranD(exercice, phase as "dEcran1" | "dEcran2");
    case "E":
      return consigneEcranE(exercice, phase as "eEcran1" | "eEcran2" | "eEcran3");
    case "G":
      return consigneEcranG(exercice, phase as "gEcran1" | "gEcran2");
  }
}

export function aideNiveau1(exercice: ExerciceEquationsExpLog, phase: PhaseEquationsExpLog): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideA1(exercice, phase as "aEcran1" | "aEcran2");
    case "B":
      return aideB1(exercice, phase as "bEcran1" | "bEcran2");
    case "C":
      return aideC1(exercice, phase as "cEcran1" | "cEcran2" | "cEcran3");
    case "D":
      return aideD1(exercice, phase as "dEcran1" | "dEcran2");
    case "E":
      return aideE1(exercice, phase as "eEcran1" | "eEcran2" | "eEcran3");
    case "G":
      return aideG1(exercice, phase as "gEcran1" | "gEcran2");
  }
}

export function aideNiveau2(exercice: ExerciceEquationsExpLog, phase: PhaseEquationsExpLog): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideA2(exercice, phase as "aEcran1" | "aEcran2");
    case "B":
      return aideB2(exercice, phase as "bEcran1" | "bEcran2");
    case "C":
      return aideC2(exercice, phase as "cEcran1" | "cEcran2" | "cEcran3");
    case "D":
      return aideD2(exercice, phase as "dEcran1" | "dEcran2");
    case "E":
      return aideE2(exercice, phase as "eEcran1" | "eEcran2" | "eEcran3");
    case "G":
      return aideG2(exercice, phase as "gEcran1" | "gEcran2");
  }
}

/** Réponse RÉELLEMENT attendue d'un écran donné — un fragment LaTeX par élément, jamais dérivée de
 * ce que l'élève a soumis (toujours reconstruite depuis les champs déjà résolus de `exercice`). */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceEquationsExpLog, phase: PhaseEquationsExpLog): string[] {
  switch (exercice.famille) {
    case "A":
      return formatReponseA(exercice, phase as "aEcran1" | "aEcran2");
    case "B":
      return formatReponseB(exercice, phase as "bEcran1" | "bEcran2");
    case "C":
      return formatReponseC(exercice, phase as "cEcran1" | "cEcran2" | "cEcran3");
    case "D":
      return formatReponseD(exercice, phase as "dEcran1" | "dEcran2");
    case "E":
      return formatReponseE(exercice, phase as "eEcran1" | "eEcran2" | "eEcran3");
    case "G":
      return formatReponseG(exercice, phase as "gEcran1" | "gEcran2");
  }
}

/** Libellé court d'écran pour le récapitulatif final (`LigneRecap`). */
export const LIBELLE_PHASE: Record<PhaseEquationsExpLog, string> = {
  aEcran1: "Étape 1 (exposant)",
  aEcran2: "Étape 2 (résolution)",
  bEcran1: "Étape 1 (ln développé)",
  bEcran2: "Étape 2 (résolution)",
  cEcran1: "Étape 1 (équation en t)",
  cEcran2: "Étape 2 (valeurs de t)",
  cEcran3: "Étape 3 (valeurs de x)",
  dEcran1: "Étape 1 (CE)",
  dEcran2: "Étape 2 (résolution)",
  eEcran1: "Étape 1 (CE)",
  eEcran2: "Étape 2 (combinaison)",
  eEcran3: "Étape 3 (résolution filtrée)",
  gEcran1: "Étape 1 (simplification)",
  gEcran2: "Étape 2 (verdict)",
};

/** Phases réellement traversées, PAR FAMILLE — pilote l'affichage du récapitulatif final
 * (`ResultatPanelEquationsExpLog.tsx`). */
export const PHASES_PAR_FAMILLE: Record<ExerciceEquationsExpLog["famille"], PhaseEquationsExpLog[]> = {
  A: ["aEcran1", "aEcran2"],
  B: ["bEcran1", "bEcran2"],
  C: ["cEcran1", "cEcran2", "cEcran3"],
  D: ["dEcran1", "dEcran2"],
  E: ["eEcran1", "eEcran2", "eEcran3"],
  G: ["gEcran1", "gEcran2"],
};

export type { IssueSimplificationG };
