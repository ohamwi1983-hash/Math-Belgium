/**
 * Couche B (5e) — vérification pour 5gen27 ("Fonction dérivée"). N'importe jamais rien de
 * `src/generateurs5e/`.
 *
 * Réplique localement (jamais importée) `valeurAtome`/`valeurFonction`
 * (`generateurs5e/fonctionDerivee/index.ts`) — même patron que `verificationDefinitionDerivee.ts`
 * répliquant `valeurFonction` de 5gen26.
 *
 * `sin`/`cos` doivent être évalués en RADIANS ici (contexte calcul différentiel — d/dx[sin x]=cos x
 * n'est vrai qu'en radians), CONTRAIREMENT à `moteur/expressionGenerale.ts` dont le sin/cos est
 * câblé en DEGRÉS (convention exclusive du chapitre 3 "Cercle trigonométrique", 4e). Même
 * technique que `evaluerTrigRadians` (`moteur5e/verificationEquationTrig.ts`) : repérer chaque
 * appel sin(...)/cos(...) par comptage de profondeur de parenthèses, évaluer son argument (déjà
 * substitué numériquement) puis appliquer `Math.sin`/`Math.cos` directement, en boucle jusqu'à
 * ce qu'il n'en reste plus — RÉPLIQUÉE ici plutôt qu'importée (Couche B ↔ Couche B autorisé en
 * principe, mais réplication choisie pour ne jamais risquer d'affecter 5gen10, cohérent avec la
 * convention "réplication" déjà établie sur ce chantier pour les petits évaluateurs purs).
 *
 * Vérification "Calculer f'(x)" : différence finie centrée de `valeurFonction` (JAMAIS une 2e
 * formule symbolique côté moteur — évite de dupliquer la logique produit/quotient/chaîne une 2e
 * fois, conformément à la consigne de la tâche), tolérance légèrement plus large qu'ailleurs pour
 * absorber l'erreur de troncature de la différence finie.
 */
import type { AtomeDerivable, ExerciceFonctionDerivee, TypeDerivee } from "../core5e/fonctionDerivee.types";
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import type { StatutVerification } from "../moteur/statutVerification";

// ============================================================================
// Réplique locale de la Couche A — jamais importée.
// ============================================================================

export function valeurAtome(atome: AtomeDerivable, x: number): number {
  const u = atome.interieurA * x + atome.interieurB;
  switch (atome.noyau.type) {
    case "monome":
      return atome.coeff * Math.pow(u, atome.noyau.exposant);
    case "racine":
      return atome.coeff * Math.sqrt(u);
    case "trig":
      return atome.noyau.fonction === "sin" ? atome.coeff * Math.sin(u) : atome.coeff * Math.cos(u);
  }
}

export function valeurFonction(exercice: ExerciceFonctionDerivee, x: number): number {
  switch (exercice.famille) {
    case "reglebase":
      return exercice.atomes.reduce((s, a) => s + valeurAtome(a, x), 0);
    case "produit":
      return valeurAtome(exercice.atome1, x) * valeurAtome(exercice.atome2, x);
    case "quotient":
      if (exercice.ambigu) {
        const u = exercice.a * x + exercice.b;
        const t = exercice.trig === "sin" ? Math.sin(u) : Math.cos(u);
        return 1 / (t * t);
      }
      return valeurAtome(exercice.atome1, x) / valeurAtome(exercice.atome2, x);
    case "composee":
      return valeurAtome(exercice.atome, x);
  }
}

// ============================================================================
// Échantillonnage défensif — pool identique à celui de la génération (rejet côté Couche A garantit
// qu'au moins `MIN_POINTS_VALIDES` d'entre eux restent exploitables pour tout exercice produit).
// ============================================================================

export const CANDIDATS_X: number[] = [
  0.7, -0.4, 1.3, -0.9, 0.2, 1.7, 2.3, -1.6, 3.1, -2.7, 0.55, 1.05, -0.15, 4.2, -3.3, 2.85, -0.65, 1.45, -2.15, 3.65,
];

const MAGNITUDE_MAX_PLAUSIBLE = 1e6;
const MIN_POINTS_VALIDES = 3;
const TOLERANCE = 1e-3;

function pointValide(valeur: number): boolean {
  return Number.isFinite(valeur) && Math.abs(valeur) < MAGNITUDE_MAX_PLAUSIBLE;
}

// ============================================================================
// Évaluateur RADIANS — voir en-tête. `sin`/`cos` interceptés AVANT de déléguer le reste (+,-,*,/,^,
// sqrt, parenthèses...) à `evaluerExpressionGenerale`.
// ============================================================================

// PAS \b : \b ne voit AUCUNE frontière entre un chiffre et une lettre ("6sin(" : "6" et "s" sont
// tous deux \w) — un coefficient collé directement au nom de fonction (ex. "6sin(3x)", issu de la
// conversion "6\sin(3x)"→"6sin(3x)" côté test, ou une saisie élève sans "*" explicite) ne serait
// alors JAMAIS intercepté ici et retomberait sur le sin/cos natif de `evaluerExpressionGenerale`,
// câblé en DEGRÉS (bug réel confirmé empiriquement — voir le rapport de tâche). Seule contrainte
// conservée : ne pas matcher au milieu d'un autre identifiant (ex. "asin") — interdire une LETTRE
// juste avant, jamais un chiffre.
const DEBUT_APPEL_TRIG = /(?<![a-zA-Z])(sin|cos)\s*\(/i;
const GARDE_APPELS_TRIG_MAX = 10;

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

const TRIG_MATH: Record<"sin" | "cos", (x: number) => number> = { sin: Math.sin, cos: Math.cos };

/** Évalue `texte` en x=`xValeur`, sin/cos en RADIANS (interceptés avant délégation). Lève sur
 * erreur de syntaxe ; NaN/Infinity propagés nativement pour un problème de domaine. */
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
// Diagnostic générique — cible fonction de x (échantillonnage défensif).
// ============================================================================

function diagnostiquerExpressionEnX(texte: string, cible: (x: number) => number): StatutVerification {
  try {
    let auMoinsUnPoint = false;
    let nbValides = 0;
    for (const x of CANDIDATS_X) {
      let c: number;
      try {
        c = cible(x);
      } catch {
        continue;
      }
      if (!pointValide(c)) continue;
      nbValides++;
      auMoinsUnPoint = true;
      const valeurEntree = evaluerRadians(texte, x);
      if (!Number.isFinite(valeurEntree)) return "parse_error";
      if (Math.abs(valeurEntree - c) > TOLERANCE) return "not_equivalent";
    }
    return auMoinsUnPoint && nbValides >= MIN_POINTS_VALIDES ? "correct" : "parse_error";
  } catch {
    return "parse_error";
  }
}

/** Même principe, cible fonction de "u" (placeholder) — substitution u→x par mot entier (même
 * technique que h→x, `verificationDefinitionDerivee.ts`), puis délégation au diagnostic en x. */
function diagnostiquerExpressionEnU(texte: string, cibleEnU: (u: number) => number): StatutVerification {
  const substitue = texte.replace(/(?<![a-zA-Z])u(?![a-zA-Z])/g, "x");
  return diagnostiquerExpressionEnX(substitue, cibleEnU);
}

// ============================================================================
// Cibles de décomposition — calculées DIRECTEMENT depuis les champs de l'exercice, jamais en
// reparsant le LaTeX stocké dans `decompositions` (celui-ci ne sert qu'à l'affichage,
// `ui5e/formatFonctionDerivee.ts`).
// ============================================================================

/** Cible d'une décomposition u·v ou u/v : facteurs de référence (à une constante multiplicative
 * près — le coefficient peut être porté par u ou par v, audit 5c5a point 23, décision K) et
 * opération qui doit redonner f. `refU` absent : u doit être une constante non nulle (lecture
 * « quotient » de 1/trig² ou de k/(ax+b)ⁿ). */
interface CibleUV {
  refU: ((x: number) => number) | null;
  refV: (x: number) => number;
  operation: "produit" | "quotient";
  tolereEchange: boolean;
}

function cibleDecompositionUV(exercice: ExerciceFonctionDerivee): CibleUV | null {
  if (exercice.famille === "produit") return { refU: (x) => valeurAtome(exercice.atome1, x), refV: (x) => valeurAtome(exercice.atome2, x), operation: "produit", tolereEchange: true };
  if (exercice.famille === "quotient" && !exercice.ambigu) return { refU: (x) => valeurAtome(exercice.atome1, x), refV: (x) => valeurAtome(exercice.atome2, x), operation: "quotient", tolereEchange: false };
  if (exercice.famille === "quotient" && exercice.ambigu) {
    return {
      refU: null,
      refV: (x) => {
        const u = exercice.a * x + exercice.b;
        const t = exercice.trig === "sin" ? Math.sin(u) : Math.cos(u);
        return t * t;
      },
      operation: "quotient",
      tolereEchange: false,
    };
  }
  if (exercice.famille === "composee" && exercice.atome.noyau.type === "monome" && exercice.atome.noyau.exposant < 0) {
    const { interieurA, interieurB } = exercice.atome;
    const n = -exercice.atome.noyau.exposant;
    return { refU: null, refV: (x) => Math.pow(interieurA * x + interieurB, n), operation: "quotient", tolereEchange: false };
  }
  return null;
}

/** Valeurs de l'expression saisie aux points de `CANDIDATS_X` où la référence est exploitable —
 * `null` si la saisie est illisible. */
function echantillonner(texte: string, ref: (x: number) => number): { x: number; saisie: number; ref: number }[] | null {
  const points: { x: number; saisie: number; ref: number }[] = [];
  for (const x of CANDIDATS_X) {
    let r: number;
    try {
      r = ref(x);
    } catch {
      continue;
    }
    if (!pointValide(r) || Math.abs(r) < 1e-9) continue;
    let v: number;
    try {
      v = evaluerRadians(texte, x);
    } catch {
      return null;
    }
    if (!Number.isFinite(v)) return null;
    points.push({ x, saisie: v, ref: r });
  }
  return points.length >= MIN_POINTS_VALIDES ? points : null;
}

/** La saisie est-elle `λ × ref` pour une constante λ ≠ 0 ? Renvoie λ, `null` sinon. */
function facteurProportionnalite(texte: string, ref: (x: number) => number): number | null | "illisible" {
  const points = echantillonner(texte, ref);
  if (points === null) return "illisible";
  const lambda = points[0].saisie / points[0].ref;
  if (!Number.isFinite(lambda) || Math.abs(lambda) < 1e-9) return null;
  const ok = points.every((p) => Math.abs(p.saisie - lambda * p.ref) <= Math.max(TOLERANCE, Math.abs(lambda * p.ref) * TOLERANCE));
  return ok ? lambda : null;
}

/** Constante non nulle (u d'une lecture « numérateur constant ») : renvoie sa valeur. */
function valeurConstante(texte: string): number | null | "illisible" {
  return facteurProportionnalite(texte, () => 1);
}

type StatutChampUV = StatutVerification;

/** Statut d'un champ seul : facteur de la bonne forme (à une constante près). */
function statutFacteur(texte: string, ref: ((x: number) => number) | null): StatutChampUV {
  const lambda = ref === null ? valeurConstante(texte) : facteurProportionnalite(texte, ref);
  if (lambda === "illisible") return "parse_error";
  return lambda === null ? "not_equivalent" : "correct";
}

/** (u, v) donne-t-il f, avec u ∝ refU et v ∝ refV ? */
function paireValide(u: string, v: string, refU: ((x: number) => number) | null, refV: (x: number) => number, operation: "produit" | "quotient"): boolean {
  const lu = refU === null ? valeurConstante(u) : facteurProportionnalite(u, refU);
  const lv = facteurProportionnalite(v, refV);
  if (typeof lu !== "number" || typeof lv !== "number") return false;
  // u·v = (λu·refU)(λv·refV) = λu·λv·f ; u/v = (λu/λv)·f (refU absent : refU ≡ 1, f = 1/refV × k).
  if (operation === "produit") return Math.abs(lu * lv - 1) < 1e-6;
  return true; // la cohérence du coefficient est vérifiée par `quotientRedonneF`.
}

function quotientRedonneF(u: string, v: string, exercice: ExerciceFonctionDerivee): boolean {
  try {
    let n = 0;
    for (const x of CANDIDATS_X) {
      const f = valeurFonction(exercice, x);
      if (!pointValide(f)) continue;
      const q = evaluerRadians(u, x) / evaluerRadians(v, x);
      if (!Number.isFinite(q)) continue;
      if (Math.abs(q - f) > Math.max(TOLERANCE, Math.abs(f) * TOLERANCE)) return false;
      n++;
    }
    return n >= MIN_POINTS_VALIDES;
  } catch {
    return false;
  }
}

/** Décomposition u/v ou u·v valable : chaque facteur a la bonne forme (constante multiplicative
 * libre) et l'ensemble redonne exactement f. */
function decompositionUVValide(u: string, v: string, exercice: ExerciceFonctionDerivee, cible: CibleUV): boolean {
  if (cible.operation === "produit") {
    if (cible.refU === null) return false;
    return paireValide(u, v, cible.refU, cible.refV, "produit") || (cible.tolereEchange && paireValide(u, v, cible.refV, cible.refU, "produit"));
  }
  return paireValide(u, v, cible.refU, cible.refV, "quotient") && quotientRedonneF(u, v, exercice);
}

interface CibleComposee {
  cibleInterieur: (x: number) => number;
  cibleExterieur: (u: number) => number;
}

function cibleDecompositionComposee(exercice: ExerciceFonctionDerivee, typeRetenu: TypeDerivee): CibleComposee | null {
  if (exercice.famille === "composee") {
    return {
      cibleInterieur: (x) => exercice.atome.interieurA * x + exercice.atome.interieurB,
      cibleExterieur: (u) => valeurAtome({ noyau: exercice.atome.noyau, coeff: exercice.atome.coeff, interieurA: 1, interieurB: 0 }, u),
    };
  }
  if (exercice.famille === "quotient" && exercice.ambigu && typeRetenu === "composee") {
    return {
      cibleInterieur: (x) => (exercice.trig === "sin" ? Math.sin(exercice.a * x + exercice.b) : Math.cos(exercice.a * x + exercice.b)),
      cibleExterieur: (u) => 1 / (u * u),
    };
  }
  return null;
}

// ============================================================================
// Diagnostics exposés — par champ (UI, surlignage rouge) et combinés (moteur, notation).
// ============================================================================

/** Statuts des deux champs u et v, pour le surlignage : les deux sont justes si la paire est
 * valable ; sinon chaque champ est jugé sur sa forme, et si les deux formes sont bonnes mais que
 * leurs coefficients ne redonnent pas f, c'est v qui est marqué. */
export function diagnostiquerChampsUV(reponse: { u: string; v: string }, exercice: ExerciceFonctionDerivee): { u: StatutVerification; v: StatutVerification } {
  const cible = cibleDecompositionUV(exercice);
  if (!cible) return { u: "parse_error", v: "parse_error" };
  if (decompositionUVValide(reponse.u, reponse.v, exercice, cible)) return { u: "correct", v: "correct" };
  let su = statutFacteur(reponse.u, cible.refU);
  let sv = statutFacteur(reponse.v, cible.refV);
  if (cible.tolereEchange && (su !== "correct" || sv !== "correct")) {
    const su2 = statutFacteur(reponse.u, cible.refV);
    const sv2 = statutFacteur(reponse.v, cible.refU);
    if (su2 === "correct" && sv2 === "correct") {
      su = su2;
      sv = sv2;
    }
  }
  if (su === "correct" && sv === "correct") sv = "not_equivalent";
  return { u: su, v: sv };
}

export function diagnostiquerChampU(texte: string, exercice: ExerciceFonctionDerivee): StatutVerification {
  const cible = cibleDecompositionUV(exercice);
  if (!cible) return "parse_error";
  const direct = statutFacteur(texte, cible.refU);
  if (direct === "correct" || !cible.tolereEchange) return direct;
  return statutFacteur(texte, cible.refV) === "correct" ? "correct" : direct;
}

export function diagnostiquerChampV(texte: string, exercice: ExerciceFonctionDerivee): StatutVerification {
  const cible = cibleDecompositionUV(exercice);
  if (!cible) return "parse_error";
  const direct = statutFacteur(texte, cible.refV);
  if (direct === "correct" || !cible.tolereEchange || cible.refU === null) return direct;
  return statutFacteur(texte, cible.refU) === "correct" ? "correct" : direct;
}

export function diagnostiquerChampInterieur(texte: string, exercice: ExerciceFonctionDerivee, typeRetenu: TypeDerivee): StatutVerification {
  const cible = cibleDecompositionComposee(exercice, typeRetenu);
  if (!cible) return "parse_error";
  return diagnostiquerExpressionEnX(texte, cible.cibleInterieur);
}

export function diagnostiquerChampExterieur(texte: string, exercice: ExerciceFonctionDerivee, typeRetenu: TypeDerivee): StatutVerification {
  const cible = cibleDecompositionComposee(exercice, typeRetenu);
  if (!cible) return "parse_error";
  return diagnostiquerExpressionEnU(texte, cible.cibleExterieur);
}

/** Vérification combinée u+v — vraie ssi chaque facteur a la bonne forme (coefficient porté par
 * u ou par v, au choix de l'élève), l'ensemble redonnant exactement f ; ordre libre pour un
 * produit, imposé pour un quotient. */
export function verifierDecompositionUV(reponse: { u: string; v: string }, exercice: ExerciceFonctionDerivee): boolean {
  const cible = cibleDecompositionUV(exercice);
  if (!cible) return false;
  return decompositionUVValide(reponse.u, reponse.v, exercice, cible);
}

export function verifierDecompositionComposee(reponse: { interieur: string; exterieur: string }, exercice: ExerciceFonctionDerivee, typeRetenu: TypeDerivee): boolean {
  const cible = cibleDecompositionComposee(exercice, typeRetenu);
  if (!cible) return false;
  return diagnostiquerExpressionEnX(reponse.interieur, cible.cibleInterieur) === "correct" && diagnostiquerExpressionEnU(reponse.exterieur, cible.cibleExterieur) === "correct";
}

// ============================================================================
// Écran "calculer" — différence finie centrée de `valeurFonction`.
// ============================================================================

const EPS_DIFFERENCE_FINIE = 1e-5;

function deriveeParDifferenceFinie(exercice: ExerciceFonctionDerivee, x: number): number | null {
  const gauche = valeurFonction(exercice, x - EPS_DIFFERENCE_FINIE);
  const droite = valeurFonction(exercice, x + EPS_DIFFERENCE_FINIE);
  if (!pointValide(gauche) || !pointValide(droite)) return null;
  return (droite - gauche) / (2 * EPS_DIFFERENCE_FINIE);
}

export function diagnostiquerCalculerDerivee(texte: string, exercice: ExerciceFonctionDerivee): StatutVerification {
  try {
    let auMoinsUnPoint = false;
    let nbValides = 0;
    for (const x of CANDIDATS_X) {
      const cible = deriveeParDifferenceFinie(exercice, x);
      if (cible === null || !pointValide(cible)) continue;
      nbValides++;
      auMoinsUnPoint = true;
      const valeurEntree = evaluerRadians(texte, x);
      if (!Number.isFinite(valeurEntree)) return "parse_error";
      const ecart = Math.abs(valeurEntree - cible);
      const toleranceRelative = Math.max(TOLERANCE, Math.abs(cible) * TOLERANCE);
      if (ecart > toleranceRelative) return "not_equivalent";
    }
    return auMoinsUnPoint && nbValides >= MIN_POINTS_VALIDES ? "correct" : "parse_error";
  } catch {
    return "parse_error";
  }
}
