import type { ExerciceEqLogA, ExerciceEqLogB, ExerciceEqLogC, ExerciceEqLogD, ExerciceEqLogE, ExerciceEqLogF, ExerciceEqLogG, ExerciceEquationsExpLog, IssueSimplificationG } from "../core6e/equationsExpLog.types";
import type { PhaseEquationsExpLog, ResultatExerciceEquationsExpLog } from "../moteur6e/typesEquationsExpLog";

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

const RAPPEL_LN = "Rappel : un logarithme de base numérique s'écrit ln(argument)/ln(base) — jamais log(...) littéral.";

function formatBaseLatex(base: number): string {
  return Math.abs(base - Math.E) < 1e-9 ? "e" : String(base);
}

/** Décimal FRANÇAIS (virgule) arrondi — pour l'AFFICHAGE (aides, récapitulatif) seulement, jamais
 * la valeur de comparaison (toujours exacte côté `moteur6e/verificationEquationsExpLog.ts`). */
function formatDecimal(v: number, decimales = 3): string {
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
function formatAffineLatex(m: number, n: number, variable = "x"): string {
  const terme = formatCoefFois(m, variable);
  if (n === 0) return terme;
  return n > 0 ? `${terme}+${n}` : `${terme}-${Math.abs(n)}`;
}

// ============================================================================
// Famille A.
// ============================================================================

/** `C` affiché toujours en valeur EXACTE — jamais en décimal (convention CLAUDE.md, "fraction
 * irréductible, jamais de décimal") : quand `C=base^p` avec `p<0`, `C` est une fraction exacte
 * `1/base^|p|` (ex. `2^-2=1/4`) — rendue en fraction LaTeX plutôt qu'en `0,25`. Dans tous les
 * autres cas (`p≥0`, ou générique) `C` est déjà un entier. */
function formatCLatex(ex: ExerciceEqLogA): string {
  if (ex.p !== null && ex.p < 0) return `\\dfrac{1}{${ex.base}^{${-ex.p}}}`;
  return String(ex.C);
}

function blocDonneesA(ex: ExerciceEqLogA): string[] {
  return [`${ex.base}^{${formatAffineLatex(ex.m, ex.n)}} = ${formatCLatex(ex)}`];
}

function etatActuelA(ex: ExerciceEqLogA, phase: "aEcran1" | "aEcran2"): string[] | null {
  if (phase === "aEcran1") return null;
  return [`\\text{exposant} = ${formatValeurLatex(ex.exposantCible)}`];
}

function consigneEcranA(_ex: ExerciceEqLogA, phase: "aEcran1" | "aEcran2"): string {
  if (phase === "aEcran1") return "Isole l'exposant : s'il correspond à une puissance entière reconnaissable de la base, donne-le directement (sans logarithme) ; sinon, exprime-le à l'aide d'un logarithme.";
  return "À partir de la valeur CORRECTE de l'étape précédente, résous l'équation affine et donne x (forme exacte, éventuellement sous forme logarithmique).";
}

function aideA1(_ex: ExerciceEqLogA, phase: "aEcran1" | "aEcran2"): AideAvecLatex {
  if (phase === "aEcran1") return { texte: `Rappel : vérifie d'abord si le second membre peut s'écrire comme une puissance entière ou simple de la base avant de recourir au logarithme. ${RAPPEL_LN}`, latex: null };
  return { texte: "Rappel : substitue l'exposant cible CORRECT de l'étape précédente dans mx+n=exposant, puis isole x.", latex: null };
}

function aideA2(ex: ExerciceEqLogA, phase: "aEcran1" | "aEcran2"): AideAvecLatex {
  if (phase === "aEcran1") return { texte: "Tentative de décomposition en puissance de la base (conclusion non donnée) :", latex: `${ex.base}^{?} = ${formatCLatex(ex)}` };
  return { texte: "Équation prête à résoudre (isolation non faite) :", latex: `${formatAffineLatex(ex.m, ex.n)} = ${formatValeurLatex(ex.exposantCible)}` };
}

function formatReponseA(ex: ExerciceEqLogA, phase: "aEcran1" | "aEcran2"): string[] {
  return phase === "aEcran1" ? [formatValeurLatex(ex.exposantCible)] : [formatValeurLatex(ex.x)];
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

function consigneEcranB(_ex: ExerciceEqLogB, phase: "bEcran1" | "bEcran2"): string {
  if (phase === "bEcran1") return "Prends le logarithme népérien des deux membres et développe (ln(a^u)=u·ln(a)).";
  return "À partir de la forme développée CORRECTE de l'étape précédente, regroupe les termes en x d'un côté, les constantes de l'autre, puis isole x.";
}

function aideB1(_ex: ExerciceEqLogB, phase: "bEcran1" | "bEcran2"): AideAvecLatex {
  if (phase === "bEcran1") return { texte: "Rappel : ln(a^u)=u·ln(a), à appliquer aux DEUX membres.", latex: null };
  return { texte: "Rappel : regroupe tous les termes en x d'un côté de l'égalité, les constantes de l'autre.", latex: null };
}

function aideB2(ex: ExerciceEqLogB, phase: "bEcran1" | "bEcran2"): AideAvecLatex {
  if (phase === "bEcran1") return { texte: "Un membre développé, l'autre non :", latex: `(${formatAffineLatex(ex.m1, ex.n1)})\\ln(${ex.base1}) = \\ldots` };
  return { texte: "Équation réarrangée (résolution non faite) :", latex: `x\\cdot(${ex.m1}\\ln(${ex.base1})-${ex.m2}\\ln(${ex.base2})) = ${ex.n2}\\ln(${ex.base2})-${ex.n1}\\ln(${ex.base1})` };
}

function formatReponseB(ex: ExerciceEqLogB, phase: "bEcran1" | "bEcran2"): string[] {
  if (phase === "bEcran1") return [`(${formatAffineLatex(ex.m1, ex.n1)})\\ln(${ex.base1}) = (${formatAffineLatex(ex.m2, ex.n2)})\\ln(${ex.base2})`];
  return [formatValeurLatex(ex.x)];
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

function consigneEcranC(_ex: ExerciceEqLogC, phase: "cEcran1" | "cEcran2" | "cEcran3"): string {
  if (phase === "cEcran1") return "Pose t=base^x et réécris l'équation ci-dessus en fonction de t seul.";
  if (phase === "cEcran2") return "Résous l'équation du second degré en t, et ne garde que les valeurs strictement positives (base^x>0 toujours).";
  return `Pour chaque valeur de t CORRECTE de l'étape précédente, détermine x — directement si t est une puissance reconnaissable de la base, sinon à l'aide d'un logarithme. ${RAPPEL_LN}`;
}

function aideC1(_ex: ExerciceEqLogC, phase: "cEcran1" | "cEcran2" | "cEcran3"): AideAvecLatex {
  if (phase === "cEcran1") return { texte: "Rappel : base^{2x}=(base^x)²=t², et base^x=t.", latex: null };
  if (phase === "cEcran2") return { texte: "Rappel : une fois les racines du second degré trouvées, élimine toute valeur ≤0 (impossible pour base^x).", latex: null };
  return { texte: "Rappel : vérifie pour chaque t s'il s'agit d'une puissance entière reconnaissable de la base avant de recourir au logarithme.", latex: null };
}

function racinesBrutes(ex: ExerciceEqLogC): number[] {
  const discriminant = ex.B * ex.B - 4 * ex.A * ex.Cc;
  if (discriminant < 0) return [];
  const racine = Math.sqrt(discriminant);
  return [(-ex.B - racine) / (2 * ex.A), (-ex.B + racine) / (2 * ex.A)].sort((a, b) => a - b);
}

function aideC2(ex: ExerciceEqLogC, phase: "cEcran1" | "cEcran2" | "cEcran3"): AideAvecLatex {
  if (phase === "cEcran1") {
    const t2 = formatTermePuissanceLatex(ex.A, "t^2", true);
    return { texte: "Substitution amorcée (le reste n'est pas encore réécrit) :", latex: `${t2}+\\ldots=0` };
  }
  if (phase === "cEcran2") {
    const racines = racinesBrutes(ex);
    return { texte: "Racines du second degré (signe non encore vérifié) :", latex: racines.length === 0 ? "\\text{aucune racine réelle}" : `t \\in \\{${racines.map((t) => formatValeurLatex(t)).join(";\\ ")}\\}` };
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
  return ex.xValides.length === 0 ? ["\\varnothing"] : ex.xValides.map((x) => formatValeurLatex(x));
}

// ============================================================================
// Famille D.
// ============================================================================

function blocDonneesD(ex: ExerciceEqLogD): string[] {
  return ex.sousType === "D1" ? [`\\log_x(${ex.N}) = ${ex.k}`] : [`\\log_{${ex.a}}(x) = ${ex.k}`];
}

function etatActuelD(ex: ExerciceEqLogD, phase: "dEcran1" | "dEcran2"): string[] | null {
  if (phase === "dEcran1") return null;
  return ex.sousType === "D1" ? ["\\text{CE} : ]0;1[\\ \\cup\\ ]1;+\\infty["] : ["\\text{CE} : ]0;+\\infty["];
}

function consigneEcranD(ex: ExerciceEqLogD, phase: "dEcran1" | "dEcran2"): string {
  if (phase === "dEcran1") return "Pose la condition d'existence (CE) — rappelle-toi ce que doit vérifier x selon qu'il est la base ou l'argument du logarithme.";
  return ex.sousType === "D1" ? "Résous log_x(N)=k pour x (élève l'équation à la puissance 1/k)." : "Résous log_a(x)=k pour x directement.";
}

function aideD1(ex: ExerciceEqLogD, phase: "dEcran1" | "dEcran2"): AideAvecLatex {
  if (phase === "dEcran1") {
    return ex.sousType === "D1" ? { texte: "Rappel : ici x est la BASE du logarithme, donc x>0 ET x≠1.", latex: null } : { texte: "Rappel : ici x est l'ARGUMENT du logarithme (la base est déjà connue), donc seulement x>0.", latex: null };
  }
  return ex.sousType === "D1" ? { texte: "Rappel : log_x(N)=k équivaut à x^k=N, donc x=N^(1/k).", latex: null } : { texte: "Rappel : log_a(x)=k équivaut directement à x=a^k.", latex: null };
}

function aideD2(ex: ExerciceEqLogD, phase: "dEcran1" | "dEcran2"): AideAvecLatex {
  if (phase === "dEcran1") {
    return ex.sousType === "D1" ? { texte: "CE affichée sous forme d'inéquations (non combinées) :", latex: "x>0 \\quad \\text{et} \\quad x\\neq 1" } : { texte: "CE affichée sous forme d'inéquation :", latex: "x>0" };
  }
  return ex.sousType === "D1" ? { texte: "Équation prête (puissance non calculée) :", latex: `x^{${ex.k}} = ${ex.N}` } : { texte: "Expression prête (calcul non fait) :", latex: `x = ${ex.a}^{${ex.k}}` };
}

function formatReponseD(ex: ExerciceEqLogD, phase: "dEcran1" | "dEcran2"): string[] {
  if (phase === "dEcran1") return ex.sousType === "D1" ? ["]0;1[\\ \\cup\\ ]1;+\\infty["] : ["]0;+\\infty["];
  return [formatValeurLatex(ex.x)];
}

// ============================================================================
// Famille E.
// ============================================================================

function blocDonneesE(ex: ExerciceEqLogE): string[] {
  const b = formatBaseLatex(ex.base);
  return [`\\log_{${b}}(x-${ex.p}) + \\log_{${b}}(x-${ex.q}) = \\log_{${b}}(${formatAffineLatex(ex.e, ex.d)})`];
}

function ceELatex(ex: ExerciceEqLogE): string {
  return ex.ceSup === null ? `x > ${ex.ceInf}` : `${ex.ceInf} < x < ${formatValeurLatex(ex.ceSup)}`;
}

function etatActuelE(ex: ExerciceEqLogE, phase: "eEcran1" | "eEcran2" | "eEcran3"): string[] | null {
  if (phase === "eEcran1") return null;
  if (phase === "eEcran2") return [`\\text{CE} : ${ceELatex(ex)}`];
  return [`\\text{CE} : ${ceELatex(ex)}`, `(x-${ex.p})(x-${ex.q}) = ${formatAffineLatex(ex.e, ex.d)}`];
}

function consigneEcranE(_ex: ExerciceEqLogE, phase: "eEcran1" | "eEcran2" | "eEcran3"): string {
  if (phase === "eEcran1") return "Pose la CE : chaque argument de chaque logarithme doit être strictement positif.";
  if (phase === "eEcran2") return "Combine les 2 logarithmes du membre de gauche (somme ⟹ produit) pour obtenir une équation polynomiale sans logarithme.";
  return "Résous l'équation polynomiale CORRECTE de l'étape précédente, puis filtre les racines trouvées à l'aide de la CE CORRECTE de l'étape 1.";
}

function aideE1(_ex: ExerciceEqLogE, phase: "eEcran1" | "eEcran2" | "eEcran3"): AideAvecLatex {
  if (phase === "eEcran1") return { texte: "Rappel : chaque argument de chaque logarithme doit être strictement positif, séparément.", latex: null };
  if (phase === "eEcran2") return { texte: "Rappel : log_base(A)+log_base(B) = log_base(A·B), puis égale les arguments (même base des deux côtés).", latex: null };
  return { texte: "Rappel : vérifie chaque racine trouvée contre la CE avant de conclure — n'en élimine ni n'en garde une par erreur.", latex: null };
}

function aideE2(ex: ExerciceEqLogE, phase: "eEcran1" | "eEcran2" | "eEcran3"): AideAvecLatex {
  if (phase === "eEcran1") return { texte: "Inéquations individuelles (intersection non faite) :", latex: `x>${ex.p} \\quad ; \\quad x>${ex.q}` };
  if (phase === "eEcran2") {
    const b = formatBaseLatex(ex.base);
    return { texte: "Logarithmes combinés à gauche (logarithme non encore retiré) :", latex: `\\log_{${b}}\\big((x-${ex.p})(x-${ex.q})\\big) = \\log_{${b}}(${formatAffineLatex(ex.e, ex.d)})` };
  }
  return { texte: "Racines de l'équation polynomiale, rappelées à côté de la CE (verdict non donné) :", latex: `x \\in \\{${ex.racinesAlgebriques.map((r) => formatValeurLatex(r)).join(";\\ ")}\\} \\quad \\text{CE} : ${ceELatex(ex)}` };
}

function formatReponseE(ex: ExerciceEqLogE, phase: "eEcran1" | "eEcran2" | "eEcran3"): string[] {
  if (phase === "eEcran1") return [ceELatex(ex)];
  if (phase === "eEcran2") return [`(x-${ex.p})(x-${ex.q}) = ${formatAffineLatex(ex.e, ex.d)}`];
  return ex.solutionsFinales.length === 0 ? ["\\varnothing"] : ex.solutionsFinales.map((r) => formatValeurLatex(r));
}

// ============================================================================
// Famille F.
// ============================================================================

function blocDonneesF(ex: ExerciceEqLogF): string[] {
  return [`\\log_x(${ex.a}) + \\log_{${ex.a}}(x) = ${ex.k}`];
}

function etatActuelF(ex: ExerciceEqLogF, phase: "fEcran1" | "fEcran2" | "fEcran3"): string[] | null {
  if (phase === "fEcran1") return null;
  if (phase === "fEcran2") return ["]0;1[\\ \\cup\\ ]1;+\\infty["];
  return ["]0;1[\\ \\cup\\ ]1;+\\infty[", `y+\\dfrac{1}{y} = ${ex.k}`];
}

function consigneEcranF(ex: ExerciceEqLogF, phase: "fEcran1" | "fEcran2" | "fEcran3"): string {
  if (phase === "fEcran1") return "Pose la CE (x est à la fois une base de logarithme et un argument).";
  if (phase === "fEcran2") return `Change de base pour log_x(${ex.a}), pose y=log_${ex.a}(x), et réécris l'équation en y.`;
  return `Résous l'équation en y obtenue, puis reconvertis chaque solution valide en x = ${ex.a}^y (tolérance numérique acceptée — réponses non nécessairement exactes).`;
}

function aideF1(ex: ExerciceEqLogF, phase: "fEcran1" | "fEcran2" | "fEcran3"): AideAvecLatex {
  if (phase === "fEcran1") return { texte: "Rappel : x est ici la base du logarithme log_x(a), donc x>0 et x≠1.", latex: null };
  if (phase === "fEcran2") return { texte: `Rappel de la formule de changement de base : log_a(N)=log_b(N)/log_b(a) — ici log_x(${ex.a}) = log_${ex.a}(${ex.a})/log_${ex.a}(x) = 1/y.`, latex: null };
  return { texte: "Rappel : multiplie par y pour obtenir y²-ky+1=0, résous, puis calcule a^y pour chaque solution.", latex: null };
}

function aideF2(ex: ExerciceEqLogF, phase: "fEcran1" | "fEcran2" | "fEcran3"): AideAvecLatex {
  if (phase === "fEcran1") return { texte: "CE affichée sous forme d'inéquations (non combinées) :", latex: "x>0 \\quad \\text{et} \\quad x\\neq 1" };
  if (phase === "fEcran2") return { texte: "Équation partiellement réécrite en y (la substitution de log_x(a) n'est pas encore faite) :", latex: `\\log_{${ex.a}}(${ex.a}) \\text{ substitué} \\Rightarrow \\log_x(${ex.a}) + y = ${ex.k}` };
  return { texte: "Solutions en y (conversion en x non faite) :", latex: `y \\in \\{${ex.yValides.map((y) => formatValeurLatex(y)).join(";\\ ")}\\}` };
}

function formatReponseF(ex: ExerciceEqLogF, phase: "fEcran1" | "fEcran2" | "fEcran3"): string[] {
  if (phase === "fEcran1") return ["]0;1[\\ \\cup\\ ]1;+\\infty["];
  if (phase === "fEcran2") return [`y+\\dfrac{1}{y} = ${ex.k}`];
  return ex.xValides.map((x) => formatValeurLatex(x));
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

function consigneEcranG(_ex: ExerciceEqLogG, phase: "gEcran1" | "gEcran2"): string {
  if (phase === "gEcran1") return "Pose la CE, puis combine/simplifie les deux membres de l'équation (fais disparaître les logarithmes).";
  return "À partir de la simplification CORRECTE de l'étape précédente, choisis le verdict qui s'applique.";
}

function aideG1(_ex: ExerciceEqLogG, phase: "gEcran1" | "gEcran2"): AideAvecLatex {
  if (phase === "gEcran1") return { texte: "", latex: null };
  return { texte: "Rappel des 3 issues possibles après simplification : l'ensemble vide par violation de la CE, l'ensemble vide par discriminant négatif, ou vrai sur tout le domaine (= la CE elle-même).", latex: null };
}

function aideG2(ex: ExerciceEqLogG, phase: "gEcran1" | "gEcran2"): AideAvecLatex {
  if (phase === "gEcran1") return { texte: "", latex: null };
  if (ex.type === "violationCE") {
    const x0 = (ex.n2 - ex.n1) / (ex.m1 - ex.m2);
    const valeur = ex.m1 * x0 + ex.n1;
    return { texte: "Résultat de la simplification rappelé (résolution de l'équation linéaire, verdict non donné) :", latex: `x = ${formatValeurLatex(x0)} \\quad \\Rightarrow \\quad \\text{argument} = ${formatValeurLatex(valeur)}` };
  }
  if (ex.type === "identite") return { texte: "Résultat de la simplification rappelé (verdict non donné) : l'égalité obtenue est une IDENTITÉ, vraie pour tout x.", latex: null };
  return { texte: "Résultat de la simplification rappelé (verdict non donné) :", latex: `x^2 = ${ex.c0 - ex.b0} \\quad (\\text{discriminant} < 0)` };
}

function formatReponseG(ex: ExerciceEqLogG, phase: "gEcran1" | "gEcran2"): string[] {
  if (phase === "gEcran1") {
    if (ex.type === "violationCE") return [`${formatAffineLatex(ex.m1, ex.n1)} = ${formatAffineLatex(ex.m2, ex.n2)}`];
    if (ex.type === "identite") return ["0=0"];
    return [`x^2 = ${ex.c0 - ex.b0}`];
  }
  if (ex.type === "violationCE") return ["\\varnothing\\ (\\text{CE violée})"];
  if (ex.type === "identite") return ["\\text{vrai sur tout le domaine (= la CE)}"];
  return ["\\varnothing\\ (\\text{discriminant} < 0)"];
}

// ============================================================================
// Dispatch général.
// ============================================================================

export function consigneGenerale(_exercice: ExerciceEquationsExpLog): string {
  return CONSIGNE_GENERALE;
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
    case "F":
      return blocDonneesF(exercice);
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
    case "F":
      return etatActuelF(exercice, phase as "fEcran1" | "fEcran2" | "fEcran3");
    case "G":
      return etatActuelG(exercice, phase as "gEcran1" | "gEcran2");
  }
}

export function consigneEcran(exercice: ExerciceEquationsExpLog, phase: PhaseEquationsExpLog): string {
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
    case "F":
      return consigneEcranF(exercice, phase as "fEcran1" | "fEcran2" | "fEcran3");
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
    case "F":
      return aideF1(exercice, phase as "fEcran1" | "fEcran2" | "fEcran3");
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
    case "F":
      return aideF2(exercice, phase as "fEcran1" | "fEcran2" | "fEcran3");
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
    case "F":
      return formatReponseF(exercice, phase as "fEcran1" | "fEcran2" | "fEcran3");
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
  fEcran1: "Étape 1 (CE)",
  fEcran2: "Étape 2 (changement de base)",
  fEcran3: "Étape 3 (résolution)",
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
  F: ["fEcran1", "fEcran2", "fEcran3"],
  G: ["gEcran1", "gEcran2"],
};

/** Total points du récapitulatif final — complément AJOUTÉ à côté de la liste `LigneRecap` colorée
 * (jamais à sa place, voir CLAUDE.md). Somme les scores DÉJÀ calculés par
 * `sessionEquationsExpLog.ts` — le nombre d'écrans varie PAR FAMILLE (`maximum = 100 × nombre
 * d'écrans`). */
export function calculerTotalPointsEquationsExpLog(resultat: ResultatExerciceEquationsExpLog): { total: number; maximum: number } {
  const phases = PHASES_PAR_FAMILLE[resultat.famille];
  const scores = resultat as unknown as Record<string, number>;
  const cles: Record<PhaseEquationsExpLog, string> = {
    aEcran1: "scoreEcran1",
    aEcran2: "scoreEcran2",
    bEcran1: "scoreEcran1",
    bEcran2: "scoreEcran2",
    cEcran1: "scoreEcran1",
    cEcran2: "scoreEcran2",
    cEcran3: "scoreEcran3",
    dEcran1: "scoreEcran1",
    dEcran2: "scoreEcran2",
    eEcran1: "scoreEcran1",
    eEcran2: "scoreEcran2",
    eEcran3: "scoreEcran3",
    fEcran1: "scoreEcran1",
    fEcran2: "scoreEcran2",
    fEcran3: "scoreEcran3",
    gEcran1: "scoreEcran1",
    gEcran2: "scoreEcran2",
  };
  const total = phases.reduce((s, p) => s + (scores[cles[p]] ?? 0), 0);
  return { total, maximum: 100 * phases.length };
}

export type { IssueSimplificationG };
