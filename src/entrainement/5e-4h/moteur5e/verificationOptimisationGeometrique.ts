/**
 * Couche B (5e) — vérification pour 5gen32 ("Optimisation géométrique"). N'importe jamais rien de
 * `src/generateurs5e/`.
 *
 * Réplique localement (jamais importées) `valeurNumeriqueAvecPi`/`valeurHauteurTrapeze`/
 * `valeurBaseSupTrapeze`/`alphaOptTrapeze`/`valeurHauteurCylindre`/`valeurLienMarges`/
 * `valeurLienFenetre`/`valeurFOptimisation`/`valeurFCubique` (`generateurs5e/optimisationGeometrique/
 * index.ts`) — même patron que `verificationFonctionDerivee.ts` répliquant `valeurFonction` (5gen27).
 *
 * Convention "x" pour TOUT champ symbolique, quel que soit le nom affiché de la variable (α pour la
 * famille "trapeze", r pour "fenetre"...) — même convention que le reste de la plateforme
 * (`verificationFonctionDerivee.ts`, `verificationTangentes.ts`...), les placeholders le rappellent
 * explicitement à l'élève. Seule EXCEPTION : l'écran "relation" de la variante bonus "cubique", où
 * la variable réellement significative est "a" (coefficient dominant) — substitution locale a→x
 * avant délégation, même technique que u→x dans `verificationFonctionDerivee.ts`.
 *
 * Écran "deriver" : différence finie CENTRÉE de `valeurFOptimisation` (jamais une 2e formule
 * symbolique côté moteur) — même technique que `deriveeParDifferenceFinie`
 * (`verificationFonctionDerivee.ts`, 5gen27). Écran "justifier" (toutes les familles, trapèze
 * compris — plus de test par A'', audit 5e ch. 5, décision A) : l'élève calcule F' en deux points
 * test « ronds » de part et d'autre de l'optimum (`pointsTest`), puis choisit la nature (UNE seule
 * tentative sur ce choix, voir `sessionOptimisationGeometrique.ts`).
 *
 * Famille "trapeze" — α en RADIANS (voir `core5e/optimisationGeometrique.types.ts`) : `sin`/`cos`
 * interceptés et évalués en radians AVANT délégation à `evaluerExpressionGenerale` (câblé en
 * DEGRÉS nativement) — réplique locale de `evaluerRadians` (`verificationFonctionDerivee.ts`).
 */
import type { ExerciceCubique, ExerciceCylindre, ExerciceFenetre, ExerciceMarges, ExerciceOptimisation, ExerciceTrapeze, ValeurAvecPi } from "../core5e/optimisationGeometrique.types";
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import type { StatutVerification } from "../moteur/statutVerification";
import type { EcranOptimisation } from "./typesOptimisationGeometrique";

// ============================================================================
// Réplique locale de la Couche A — jamais importée.
// ============================================================================

export function valeurNumeriqueAvecPi(v: ValeurAvecPi): number {
  return v.rationnel + v.coeffPi * Math.PI;
}

export function valeurHauteurTrapeze(ex: ExerciceTrapeze, alpha: number): number {
  return ex.l * Math.sin(alpha);
}
export function valeurBaseSupTrapeze(ex: ExerciceTrapeze, alpha: number): number {
  return ex.b + 2 * ex.l * Math.cos(alpha);
}
export function uOptTrapeze(ex: ExerciceTrapeze): number {
  if (ex.u) return ex.u.num / ex.u.den;
  return (-ex.b + Math.sqrt(ex.b * ex.b + 8 * ex.l * ex.l)) / (4 * ex.l);
}
export function alphaOptTrapeze(ex: ExerciceTrapeze): number {
  return Math.acos(uOptTrapeze(ex));
}
export function valeurHauteurCylindre(ex: ExerciceCylindre, x: number): number {
  const V = ex.coeffV * Math.PI;
  return V / (Math.PI * x * x);
}
export function valeurLienMarges(ex: ExerciceMarges, x: number): number {
  if (ex.famille === "margesA") return (ex.T as number) / (x + 2 * ex.mh) - 2 * ex.mv;
  return (ex.A as number) / x;
}
export function valeurLienFenetre(ex: ExerciceFenetre, r: number): number {
  if (ex.famille === "fenetreA") {
    const P = valeurNumeriqueAvecPi(ex.P as ValeurAvecPi);
    return (P - (2 + Math.PI) * r) / 2;
  }
  const A = valeurNumeriqueAvecPi(ex.A as ValeurAvecPi);
  return A / (2 * r) - (Math.PI * r) / 4;
}

export function valeurFOptimisation(ex: ExerciceOptimisation, x: number): number {
  switch (ex.famille) {
    case "trapeze": {
      const baseSup = valeurBaseSupTrapeze(ex, x);
      const hauteur = valeurHauteurTrapeze(ex, x);
      return ((ex.b + baseSup) / 2) * hauteur;
    }
    case "cylindre": {
      const h = valeurHauteurCylindre(ex, x);
      return 2 * Math.PI * x * x + 2 * Math.PI * x * h;
    }
    case "margesA": {
      const y = valeurLienMarges(ex, x);
      return x * y;
    }
    case "margesB": {
      const y = valeurLienMarges(ex, x);
      return (x + 2 * ex.mh) * (y + 2 * ex.mv);
    }
    case "fenetreA": {
      const h = valeurLienFenetre(ex, x);
      return 2 * x * h + (Math.PI * x * x) / 2;
    }
    case "fenetreB": {
      const h = valeurLienFenetre(ex, x);
      return 2 * x + 2 * h + Math.PI * x;
    }
    case "cubique":
      throw new Error("valeurFOptimisation : non applicable à la variante bonus 'cubique'");
  }
}

export function valeurFCubique(ex: ExerciceCubique, x: number): number {
  return ex.a * x ** 3 + ex.b * x * x + ex.d;
}

// ============================================================================
// Évaluateur RADIANS (famille "trapeze" uniquement) — réplique locale de `evaluerRadians`
// (`verificationFonctionDerivee.ts`), voir tête de fichier.
// ============================================================================

const DEBUT_APPEL_TRIG = /(?<![a-zA-Z])(sin|cos)\s*\(/i;
const GARDE_APPELS_TRIG_MAX = 10;
const TRIG_MATH: Record<"sin" | "cos", (x: number) => number> = { sin: Math.sin, cos: Math.cos };

interface AppelTrigTrouve {
  debut: number;
  fin: number;
  fonction: "sin" | "cos";
  interieur: string;
}

function trouverAppelTrig(expr: string): AppelTrigTrouve | null {
  const debutMatch = DEBUT_APPEL_TRIG.exec(expr);
  if (debutMatch === null) return null;
  const indexParenOuvrante = debutMatch.index + debutMatch[0].length - 1;
  let profondeur = 0;
  for (let i = indexParenOuvrante; i < expr.length; i++) {
    if (expr[i] === "(") profondeur++;
    else if (expr[i] === ")") {
      profondeur--;
      if (profondeur === 0) {
        return { debut: debutMatch.index, fin: i, fonction: debutMatch[1].toLowerCase() as "sin" | "cos", interieur: expr.slice(indexParenOuvrante + 1, i) };
      }
    }
  }
  return null;
}

function evaluerRadians(texte: string, xValeur: number): number {
  let expr = texte.replace(/(?<![a-zA-Z])x(?![a-zA-Z])/g, `(${xValeur})`);
  let garde = 0;
  let appel: AppelTrigTrouve | null;
  while ((appel = trouverAppelTrig(expr)) && garde < GARDE_APPELS_TRIG_MAX) {
    const valeurInterieure = evaluerExpressionGenerale(appel.interieur, 0);
    const valeur = TRIG_MATH[appel.fonction](valeurInterieure);
    expr = expr.slice(0, appel.debut) + `(${valeur})` + expr.slice(appel.fin + 1);
    garde++;
  }
  return evaluerExpressionGenerale(expr, 0);
}

// ============================================================================
// π symbolique — géré nativement par `evaluerExpressionGenerale` (audit
// promptauditparsingpisqrt.md, "pi" reconnu comme identifiant même collé à un coefficient), aucune
// substitution textuelle n'est plus nécessaire ici.
// ============================================================================

/** Substitue une lettre-variable donnée (mot entier) par "x" avant délégation — nécessaire pour
 * l'écran "relation" (bonus "cubique"), où l'élève écrit une expression en "a". */
function substituerVariable(texte: string, nomVar: string): string {
  const motif = new RegExp(`(?<![a-zA-Z])${nomVar}(?![a-zA-Z])`, "g");
  return texte.replace(motif, "x");
}

// ============================================================================
// Diagnostics génériques.
// ============================================================================

const MAGNITUDE_MAX_PLAUSIBLE = 1e7;
function pointValide(v: number): boolean {
  return Number.isFinite(v) && Math.abs(v) < MAGNITUDE_MAX_PLAUSIBLE;
}

export function diagnostiquerNombreTolerant(texte: string, cible: number, tolerance: number): StatutVerification {
  try {
    // « x = 4 », « h = 3,46 » : un préfixe « nom = » recopié depuis le libellé est ignoré.
    const sansPrefixe = texte.includes("=") ? texte.slice(texte.lastIndexOf("=") + 1) : texte;
    const valeur = evaluerExpressionGenerale(sansPrefixe, 0);
    if (!Number.isFinite(valeur)) return "parse_error";
    return Math.abs(valeur - cible) <= tolerance ? "correct" : "not_equivalent";
  } catch {
    return "parse_error";
  }
}

const MIN_POINTS_VALIDES = 3;

/** Équivalence algébrique en x, échantillonnée sur `points` (domaine sûr, propre à chaque famille/
 * exercice — voir `pointsEchantillonDomaine`). `radians` bascule vers l'évaluateur trig RADIANS
 * (famille "trapeze" uniquement). */
function diagnostiquerExpressionEnX(texte: string, cible: (x: number) => number, points: number[], radians: boolean): StatutVerification {
  try {
    let nbValides = 0;
    for (const x of points) {
      let c: number;
      try {
        c = cible(x);
      } catch {
        continue;
      }
      if (!pointValide(c)) continue;
      nbValides++;
      const valeurEntree = radians ? evaluerRadians(texte, x) : evaluerExpressionGenerale(texte, x);
      if (!Number.isFinite(valeurEntree)) return "parse_error";
      const tol = Math.max(1e-3, Math.abs(c) * 1e-3);
      if (Math.abs(valeurEntree - c) > tol) return "not_equivalent";
    }
    return nbValides >= MIN_POINTS_VALIDES ? "correct" : "parse_error";
  } catch {
    return "parse_error";
  }
}

/** Points d'échantillonnage SÛRS (domaine physique, évite tout pôle/bord) pour les écrans "lien"/
 * "construire"/"deriver" — proportionnels à la solution optimale de l'exercice pour rester dans un
 * domaine numériquement bien conditionné, jamais des valeurs fixes indépendantes de l'exercice. */
function pointsEchantillonDomaine(ex: ExerciceOptimisation): number[] {
  switch (ex.famille) {
    case "trapeze":
      return [0.25, 0.5, 0.85, 1.1, 1.35];
    case "cylindre":
    case "margesA":
    case "margesB":
      return [0.4, 0.7, 1.3, 1.8, 2.4].map((f) => f * ex.xOpt);
    case "fenetreA": {
      const P = valeurNumeriqueAvecPi(ex.P as ValeurAvecPi);
      const rMax = P / (2 + Math.PI);
      return [0.15, 0.3, 0.5, 0.7, 0.85].map((f) => f * rMax);
    }
    case "fenetreB": {
      const A = valeurNumeriqueAvecPi(ex.A as ValeurAvecPi);
      const rMax = Math.sqrt((2 * A) / Math.PI);
      return [0.15, 0.3, 0.5, 0.7, 0.85].map((f) => f * rMax);
    }
    case "cubique":
      return [0, 1, 2, -1, 3, -2];
  }
}

const EPS_DIFFERENCE_FINIE = 1e-5;

export function deriveeParDifferenceFinie(ex: ExerciceOptimisation, x: number): number | null {
  const gauche = valeurFOptimisation(ex, x - EPS_DIFFERENCE_FINIE);
  const droite = valeurFOptimisation(ex, x + EPS_DIFFERENCE_FINIE);
  if (!pointValide(gauche) || !pointValide(droite)) return null;
  return (droite - gauche) / (2 * EPS_DIFFERENCE_FINIE);
}

/** Vérifie le champ symbolique "dérivée" par différence finie centrée de `valeurFOptimisation`,
 * échantillonnée sur `pointsEchantillonDomaine`. */
export function diagnostiquerDerivee(texte: string, ex: ExerciceOptimisation): StatutVerification {
  const radians = ex.famille === "trapeze";
  return diagnostiquerExpressionEnX(
    texte,
    (x) => {
      const d = deriveeParDifferenceFinie(ex, x);
      if (d === null) throw new Error("point invalide");
      return d;
    },
    pointsEchantillonDomaine(ex),
    radians,
  );
}

// ============================================================================
// x_opt / α_opt / r_opt — valeur numérique retenue par exercice (racine physique de F'(x)=0).
// ============================================================================

export function xOptimal(ex: ExerciceOptimisation): number {
  switch (ex.famille) {
    case "trapeze":
      return alphaOptTrapeze(ex);
    case "cylindre":
      return ex.xOpt;
    case "margesA":
    case "margesB":
      return ex.xOpt;
    case "fenetreA":
    case "fenetreB":
      return ex.rOpt;
    case "cubique":
      throw new Error("xOptimal : non applicable à la variante bonus 'cubique'");
  }
}

/** Bornes du domaine physique (x borné supérieurement pour "trapeze" et "fenetreA"/"fenetreB") —
 * utilisées pour placer les points test, qui doivent rester dans le domaine. */
function bornesDomaine(ex: ExerciceOptimisation): { min: number; max: number } {
  switch (ex.famille) {
    case "trapeze":
      return { min: 0, max: Math.PI / 2 };
    case "fenetreA": {
      const P = valeurNumeriqueAvecPi(ex.P as ValeurAvecPi);
      return { min: 0, max: P / (2 + Math.PI) };
    }
    case "fenetreB": {
      const A = valeurNumeriqueAvecPi(ex.A as ValeurAvecPi);
      return { min: 0, max: Math.sqrt((2 * A) / Math.PI) };
    }
    case "margesA":
      return { min: 0, max: (ex.T as number) / (2 * ex.mv) - 2 * ex.mh };
    default:
      return { min: 0, max: Infinity };
  }
}

/** Deux points test « ronds » de part et d'autre de l'optimum, dans le domaine : `avant`/`apres`
 * dans l'unité de calcul (radians pour le trapèze), `affichageAvant`/`affichageApres` dans l'unité
 * montrée à l'élève (degrés pour le trapèze, sinon identiques). */
export interface PointsTest {
  avant: number;
  apres: number;
  affichageAvant: number;
  affichageApres: number;
}

export function pointsTest(ex: ExerciceOptimisation): PointsTest {
  if (ex.famille === "trapeze") {
    const optDeg = (alphaOptTrapeze(ex) * 180) / Math.PI;
    let avantDeg = Math.floor((optDeg - 3) / 10) * 10;
    if (avantDeg < 10) avantDeg = 10;
    let apresDeg = Math.ceil((optDeg + 3) / 10) * 10;
    if (apresDeg >= 90) apresDeg = 85;
    return { avant: (avantDeg * Math.PI) / 180, apres: (apresDeg * Math.PI) / 180, affichageAvant: avantDeg, affichageApres: apresDeg };
  }
  const opt = xOptimal(ex);
  const { min, max } = bornesDomaine(ex);
  for (const pas of [1, 0.5, 0.25, 0.1]) {
    let avant = Math.floor((opt - 1e-9) / pas) * pas;
    if (opt - avant < 0.2 * pas) avant -= pas;
    let apres = Math.ceil((opt + 1e-9) / pas) * pas;
    if (apres - opt < 0.2 * pas) apres += pas;
    avant = Math.round(avant * 100) / 100;
    apres = Math.round(apres * 100) / 100;
    if (avant > min + 1e-9 && apres < max - 1e-9) return { avant, apres, affichageAvant: avant, affichageApres: apres };
  }
  const avant = (min + opt) / 2;
  const apres = Number.isFinite(max) ? (opt + max) / 2 : opt * 1.5;
  return { avant, apres, affichageAvant: avant, affichageApres: apres };
}

/** Valeurs EXACTES (à la différence finie près) de F' aux deux points test. */
export function valeursDeriveePointsTest(ex: ExerciceOptimisation): { avant: number; apres: number } {
  const { avant, apres } = pointsTest(ex);
  return { avant: deriveeParDifferenceFinie(ex, avant) ?? 0, apres: deriveeParDifferenceFinie(ex, apres) ?? 0 };
}

export type ConclusionExtremum = "max" | "min";

export function conclusionReelle(ex: ExerciceOptimisation): ConclusionExtremum {
  const { avant, apres } = valeursDeriveePointsTest(ex);
  return avant > 0 && apres < 0 ? "max" : "min";
}

/** Valeur de F' saisie à un point test : seul son SIGNE sert à conclure, la valeur est acceptée à
 * 1 % près (annoncé : « valeurs arrondies au centième acceptées »). */
export function diagnostiquerValeurPointTest(texte: string, cible: number): StatutVerification {
  return diagnostiquerNombreTolerant(texte, cible, 0.011 + 0.01 * Math.abs(cible));
}

// ============================================================================
// Champs "lien" — cibles par famille.
// ============================================================================

export function diagnostiquerLienTrapeze(reponseH: string, reponseB: string, ex: ExerciceTrapeze): { h: StatutVerification; B: StatutVerification } {
  const points = pointsEchantillonDomaine(ex);
  return {
    h: diagnostiquerExpressionEnX(reponseH, (a) => valeurHauteurTrapeze(ex, a), points, true),
    B: diagnostiquerExpressionEnX(reponseB, (a) => valeurBaseSupTrapeze(ex, a), points, true),
  };
}

function cibleLien(ex: ExerciceOptimisation): ((x: number) => number) | null {
  switch (ex.famille) {
    case "cylindre":
      return (x) => valeurHauteurCylindre(ex, x);
    case "margesA":
    case "margesB":
      return (x) => valeurLienMarges(ex, x);
    case "fenetreA":
    case "fenetreB":
      return (x) => valeurLienFenetre(ex, x);
    default:
      return null;
  }
}

export function diagnostiquerLien(texte: string, ex: ExerciceOptimisation): StatutVerification {
  const cible = cibleLien(ex);
  if (!cible) return "parse_error";
  return diagnostiquerExpressionEnX(texte, cible, pointsEchantillonDomaine(ex), false);
}

// ============================================================================
// Champ "construire" (F(x)) et "deriver" (F'(x), différence finie).
// ============================================================================

export function diagnostiquerConstruire(texte: string, ex: ExerciceOptimisation): StatutVerification {
  const radians = ex.famille === "trapeze";
  return diagnostiquerExpressionEnX(texte, (x) => valeurFOptimisation(ex, x), pointsEchantillonDomaine(ex), radians);
}

// ============================================================================
// Écran "resoudre" — racine retenue + (le cas échéant) justification du rejet de l'autre racine.
// ============================================================================

export interface OptionChoix {
  id: string;
  label: string;
}

export const OPTIONS_JUSTIFICATION_LONGUEUR: OptionChoix[] = [
  { id: "positive_longueur", label: "on rejette la racine négative : une longueur ne peut jamais être négative" },
  { id: "positive_grande", label: "on rejette la racine négative : elle est plus petite que l'autre" },
  { id: "toutes_valables", label: "les deux racines sont physiquement valables" },
];

export function justificationCorrecteId(): string {
  return "positive_longueur";
}

/** Précisions ANNONCÉES à l'écran (`ui5e/formatOptimisationGeometrique.ts::PRECISION_*`) — les
 * tolérances ci-dessous les couvrent exactement (valeur exacte, ou arrondi au centième ; α arrondi
 * au degré). */
const TOL_CENTIEME = 0.0051;
const TOL_DEGRE = 0.51;

export function diagnostiquerRacineTrapezeU(texte: string, ex: ExerciceTrapeze): StatutVerification {
  return diagnostiquerNombreTolerant(texte, uOptTrapeze(ex), TOL_CENTIEME);
}
/** α arrondi au degré, éventuellement calculé à partir de u déjà arrondi au centième : l'arrondi de
 * u déplace α d'au plus 0,0051/sin α radian, ajouté à la demi-unité d'arrondi. */
function toleranceAlphaDegres(ex: ExerciceTrapeze): number {
  return TOL_DEGRE + ((TOL_CENTIEME / Math.sin(alphaOptTrapeze(ex))) * 180) / Math.PI;
}

export function diagnostiquerRacineTrapezeAlphaDegres(texte: string, ex: ExerciceTrapeze): StatutVerification {
  const cibleDegres = (alphaOptTrapeze(ex) * 180) / Math.PI;
  return diagnostiquerNombreTolerant(texte, cibleDegres, toleranceAlphaDegres(ex));
}

export function diagnostiquerRacine(texte: string, ex: ExerciceOptimisation): StatutVerification {
  return diagnostiquerNombreTolerant(texte, xOptimal(ex), TOL_CENTIEME);
}

/** Tolérance d'une dimension calculée à partir de l'optimum ARRONDI (au centième, ou au degré pour
 * l'angle du trapèze) : arrondi propre + propagation de l'arrondi de l'optimum. */
function toleranceDimension(fn: (x: number) => number, xOpt: number, ecartOptimum: number): number {
  const h = 1e-5;
  const pente = Math.abs((fn(xOpt + h) - fn(xOpt - h)) / (2 * h));
  return TOL_CENTIEME + 1.1 * pente * ecartOptimum + 1e-9;
}

/** Tolérance de la valeur optimale (F'(x_opt) = 0 : l'arrondi de l'optimum n'a qu'un effet du 2e
 * ordre ; on couvre l'arrondi des dimensions intermédiaires par 0,5 % de la valeur). */
function toleranceObjectif(valeur: number): number {
  return 0.011 + 0.005 * Math.abs(valeur);
}

// ============================================================================
// Écran "justifier" — valeurs de F' aux points test, puis nature (un seul essai sur le choix).
// ============================================================================

export function diagnostiquerConclusion(texte: string, ex: ExerciceOptimisation): StatutVerification {
  return texte === conclusionReelle(ex) ? "correct" : "not_equivalent";
}

// ============================================================================
// Écran "conclure".
// ============================================================================

export function diagnostiquerConclureTrapeze(reponses: { hauteur: string; baseSup: string; aire: string }, ex: ExerciceTrapeze): Record<string, StatutVerification> {
  const alphaOpt = alphaOptTrapeze(ex);
  const ecartAngle = (toleranceAlphaDegres(ex) * Math.PI) / 180;
  const aire = valeurFOptimisation(ex, alphaOpt);
  return {
    hauteur: diagnostiquerNombreTolerant(reponses.hauteur, valeurHauteurTrapeze(ex, alphaOpt), toleranceDimension((a) => valeurHauteurTrapeze(ex, a), alphaOpt, ecartAngle)),
    baseSup: diagnostiquerNombreTolerant(reponses.baseSup, valeurBaseSupTrapeze(ex, alphaOpt), toleranceDimension((a) => valeurBaseSupTrapeze(ex, a), alphaOpt, ecartAngle)),
    aire: diagnostiquerNombreTolerant(reponses.aire, aire, toleranceObjectif(aire) + 0.01 * Math.abs(aire)),
  };
}

export function diagnostiquerConclureCylindre(reponses: { hauteur: string; aire: string }, ex: ExerciceCylindre): Record<string, StatutVerification> {
  const aire = valeurFOptimisation(ex, ex.xOpt);
  return {
    hauteur: diagnostiquerNombreTolerant(reponses.hauteur, valeurHauteurCylindre(ex, ex.xOpt), toleranceDimension((x) => valeurHauteurCylindre(ex, x), ex.xOpt, TOL_CENTIEME)),
    aire: diagnostiquerNombreTolerant(reponses.aire, aire, toleranceObjectif(aire)),
  };
}

export function diagnostiquerConclureMarges(reponses: { y: string; aire: string }, ex: ExerciceMarges): Record<string, StatutVerification> {
  const aire = valeurFOptimisation(ex, ex.xOpt);
  return {
    y: diagnostiquerNombreTolerant(reponses.y, valeurLienMarges(ex, ex.xOpt), toleranceDimension((x) => valeurLienMarges(ex, x), ex.xOpt, TOL_CENTIEME)),
    aire: diagnostiquerNombreTolerant(reponses.aire, aire, toleranceObjectif(aire)),
  };
}

export function diagnostiquerConclureFenetre(reponses: { hauteur: string; objectif: string }, ex: ExerciceFenetre): Record<string, StatutVerification> {
  const objectif = valeurFOptimisation(ex, ex.rOpt);
  return {
    hauteur: diagnostiquerNombreTolerant(reponses.hauteur, valeurLienFenetre(ex, ex.rOpt), toleranceDimension((r) => valeurLienFenetre(ex, r), ex.rOpt, TOL_CENTIEME)),
    objectif: diagnostiquerNombreTolerant(reponses.objectif, objectif, toleranceObjectif(objectif)),
  };
}

// ============================================================================
// Écran "application" (bonus, cylindre uniquement) — substitution numérique dans les dimensions
// déjà trouvées, jamais une 2e optimisation.
// ============================================================================

export function coutOptimalCylindre(ex: ExerciceCylindre): number {
  const aireOptimale = valeurFOptimisation(ex, ex.xOpt);
  return (ex.prixUnitaireMateriau ?? 0) * aireOptimale;
}

/** Annoncé « arrondi au centime » ; l'arrondi de S_min au centième n'a qu'un effet négligeable. */
export function diagnostiquerApplicationCylindre(texte: string, ex: ExerciceCylindre): StatutVerification {
  const cible = coutOptimalCylindre(ex);
  return diagnostiquerNombreTolerant(texte, cible, TOL_CENTIEME + 0.002 * Math.abs(cible));
}

// ============================================================================
// Variante bonus 2 — "cubique".
// ============================================================================

export function diagnostiquerCoeffsImmediats(reponses: { c: string; d: string }, ex: ExerciceCubique): Record<string, StatutVerification> {
  return {
    c: diagnostiquerNombreTolerant(reponses.c, 0, 1e-3),
    d: diagnostiquerNombreTolerant(reponses.d, ex.d, 1e-3),
  };
}

export function diagnostiquerRelationCubique(texte: string, ex: ExerciceCubique): StatutVerification {
  const substitue = substituerVariable(texte, "a");
  const points = [1, -1, 2, -2, 3];
  return diagnostiquerExpressionEnX(substitue, (a) => (-3 * a * ex.x2) / 2, points, false);
}

export function diagnostiquerResoudreACubique(texte: string, ex: ExerciceCubique): StatutVerification {
  return diagnostiquerNombreTolerant(texte, ex.a, 1e-3);
}

export function diagnostiquerExpressionFinaleCubique(texte: string, ex: ExerciceCubique): StatutVerification {
  return diagnostiquerExpressionEnX(texte, (x) => valeurFCubique(ex, x), [0, 1, 2, -1, 3, -2], false);
}

// ============================================================================
// Dispatch générique par écran — utilisé par `sessionOptimisationGeometrique.ts`. Chaque écran
// reçoit `Record<string,string>` (voir `ui5e/formatOptimisationGeometrique.ts::champsEcran` pour
// la liste des clés attendues par écran/famille) et renvoie le statut PAR CHAMP.
// ============================================================================

/** Table des identifiants de champ PAR écran/famille — SEULE source de vérité, partagée avec
 * `ui5e/formatOptimisationGeometrique.ts::champsEcran` (les clés doivent coïncider EXACTEMENT :
 * un champ affiché sans diagnostic correspondant, ou l'inverse, est un bug de câblage). */
export function diagnostiquerEcran(ex: ExerciceOptimisation, phase: EcranOptimisation, reponses: Record<string, string>): Record<string, StatutVerification> {
  const r = (id: string) => reponses[id] ?? "";
  switch (phase) {
    case "lien": {
      if (ex.famille === "trapeze") {
        const { h, B } = diagnostiquerLienTrapeze(r("h"), r("B"), ex);
        return { h, B };
      }
      const idChamp = ex.famille === "margesA" || ex.famille === "margesB" ? "y" : "h";
      return { [idChamp]: diagnostiquerLien(r(idChamp), ex) };
    }
    case "construire":
      return { F: diagnostiquerConstruire(r("F"), ex) };
    case "deriver":
      return { Fprime: diagnostiquerDerivee(r("Fprime"), ex) };
    case "resoudre": {
      if (ex.famille === "trapeze") {
        return { u: diagnostiquerRacineTrapezeU(r("u"), ex), alpha: diagnostiquerRacineTrapezeAlphaDegres(r("alpha"), ex) };
      }
      const idRacine = ex.famille === "fenetreA" || ex.famille === "fenetreB" ? "r" : "x";
      const out: Record<string, StatutVerification> = { [idRacine]: diagnostiquerRacine(r(idRacine), ex) };
      if (ex.famille === "margesA" || ex.famille === "margesB" || ex.famille === "fenetreB") {
        out.justification = r("justification") === justificationCorrecteId() ? "correct" : "not_equivalent";
      }
      return out;
    }
    case "justifier": {
      const valeurs = valeursDeriveePointsTest(ex);
      return {
        deriveeAvant: diagnostiquerValeurPointTest(r("deriveeAvant"), valeurs.avant),
        deriveeApres: diagnostiquerValeurPointTest(r("deriveeApres"), valeurs.apres),
        conclusion: diagnostiquerConclusion(r("conclusion"), ex),
      };
    }
    case "conclure": {
      switch (ex.famille) {
        case "trapeze":
          return diagnostiquerConclureTrapeze({ hauteur: r("hauteur"), baseSup: r("baseSup"), aire: r("aire") }, ex);
        case "cylindre":
          return diagnostiquerConclureCylindre({ hauteur: r("hauteur"), aire: r("aire") }, ex);
        case "margesA": {
          const { y, aire } = diagnostiquerConclureMarges({ y: r("y"), aire: r("aireImprimee") }, ex);
          return { y, aireImprimee: aire };
        }
        case "margesB": {
          const { y, aire } = diagnostiquerConclureMarges({ y: r("y"), aire: r("aireTotale") }, ex);
          return { y, aireTotale: aire };
        }
        case "fenetreA": {
          const { hauteur, objectif } = diagnostiquerConclureFenetre({ hauteur: r("hauteur"), objectif: r("aire") }, ex);
          return { hauteur, aire: objectif };
        }
        case "fenetreB": {
          const { hauteur, objectif } = diagnostiquerConclureFenetre({ hauteur: r("hauteur"), objectif: r("perimetre") }, ex);
          return { hauteur, perimetre: objectif };
        }
        case "cubique":
          return {};
      }
    }
    case "application":
      return { cout: ex.famille === "cylindre" ? diagnostiquerApplicationCylindre(r("cout"), ex) : "parse_error" };
    case "coeffsImmediats":
      return ex.famille === "cubique" ? diagnostiquerCoeffsImmediats({ c: r("c"), d: r("d") }, ex) : {};
    case "relation":
      return { b: ex.famille === "cubique" ? diagnostiquerRelationCubique(r("b"), ex) : "parse_error" };
    case "resoudreA":
      return { a: ex.famille === "cubique" ? diagnostiquerResoudreACubique(r("a"), ex) : "parse_error" };
    case "expressionFinale":
      return { f: ex.famille === "cubique" ? diagnostiquerExpressionFinaleCubique(r("f"), ex) : "parse_error" };
  }
}

/** Identifiants des champs à CHOIX FERMÉ (boutons) — un seul essai sur ces choix (audit 5e ch. 5,
 * point 11) : un choix faux clôt l'écran (`sessionOptimisationGeometrique.ts`), et l'écran gèle le
 * choix après la première validation (`EtapeGeneriqueOptimisation.tsx`). */
export const CHAMPS_CHOIX_FERME = ["justification", "conclusion"];

export function choixFermeErrone(ex: ExerciceOptimisation, phase: EcranOptimisation, reponses: Record<string, string>): boolean {
  const statuts = diagnostiquerEcran(ex, phase, reponses);
  return CHAMPS_CHOIX_FERME.some((id) => statuts[id] !== undefined && statuts[id] !== "correct");
}

export function verifierEcran(ex: ExerciceOptimisation, phase: EcranOptimisation, reponses: Record<string, string>): boolean {
  const statuts = diagnostiquerEcran(ex, phase, reponses);
  return Object.values(statuts).every((s) => s === "correct");
}
