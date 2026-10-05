import type {
  ExerciceDomaineDeriveeA,
  ExerciceDomaineDeriveeB,
  ExerciceDomaineDeriveeC,
  ExerciceDomaineDeriveeD,
  ExerciceDomaineDeriveeE,
  ExerciceDomaineDeriveeExponentielle,
  ExerciceDomaineDeriveeF,
  FormeGA,
} from "../core6e/domaineDeriveeExponentielles.types";
import type { EnsembleReelGuide } from "../core6e/ensembleReel.types";
import { verifierEnsembleReelGuide } from "./verificationEnsembleReel";
import { diagnostiquerEquivalenceFonction } from "./equivalenceExponentielle";

/**
 * Couche B (6e) — vérification pour `6gen7`. N'importe jamais rien de `src/generateurs6e/` — voir
 * `verificationDomaineDeriveeExponentielles.test.ts` pour la preuve avec des exercices factices
 * définis localement. Chaque référence de dérivée est reconstruite directement depuis les
 * paramètres BRUTS déjà stockés sur l'exercice (jamais depuis `exercice.domaine`, qui ne porte que
 * le domaine) — même principe déjà établi par `6gen6` (`referenceD`/`referenceE`/...). Le domaine,
 * lui, est PRÉCALCULÉ par la Couche A (voir la note de conception dans
 * `core6e/domaineDeriveeExponentielles.types.ts`) : `verifierDomaine` se contente de le comparer,
 * jamais de le recalculer.
 */

const TOLERANCE = 0.01;
const POINTS_GENERIQUES = [-1.3, -0.6, 0.6, 1.3];

export function verifierDomaine(exercice: ExerciceDomaineDeriveeExponentielle, reponse: EnsembleReelGuide): boolean {
  return verifierEnsembleReelGuide(reponse, exercice.domaine);
}

function equivalent(texte: string, reference: (x: number) => number, points: number[] = POINTS_GENERIQUES): boolean {
  return diagnostiquerEquivalenceFonction(texte, reference, points, TOLERANCE) === "correct";
}

function evaluerGA(g: FormeGA, x: number): number {
  return g.type === "affine" ? g.m * x + g.n : Math.pow(x, g.exposant);
}

function deriveeGA(g: FormeGA, x: number): number {
  return g.type === "affine" ? g.m : g.exposant * Math.pow(x, g.exposant - 1);
}

// ============================================================================
// Famille A — 2 écrans (domaine, dérivée). f'(x)=g'(x)·base^g(x)·ln(base) (direct) ou
// 2·(base^(mx+n)-c)·m·ln(base)·base^(mx+n) (carré).
// ============================================================================

function referenceADerivee(exercice: ExerciceDomaineDeriveeA): (x: number) => number {
  const lnBase = Math.log(exercice.base);
  if (exercice.sousType === "direct") {
    const g = exercice.g;
    return (x: number) => deriveeGA(g, x) * Math.pow(exercice.base, evaluerGA(g, x)) * lnBase;
  }
  const { base, m, n, c } = exercice;
  return (x: number) => {
    const puissance = Math.pow(base, m * x + n);
    return 2 * (puissance - c) * m * lnBase * puissance;
  };
}

export function verifierADerivee(exercice: ExerciceDomaineDeriveeA, texte: string): boolean {
  return equivalent(texte, referenceADerivee(exercice));
}

// ============================================================================
// Famille B — 2 écrans (domaine, dérivée). f'(x)=ln(base)·base^u·u'.
// ============================================================================

function referenceBDerivee(exercice: ExerciceDomaineDeriveeB): (x: number) => number {
  const lnBase = Math.log(exercice.base);
  if (exercice.sousType === "racine") {
    const { base, k } = exercice;
    return (x: number) => {
      const u = Math.sqrt(x * x - k * k);
      const uPrime = x / u;
      return lnBase * Math.pow(base, u) * uPrime;
    };
  }
  const { base, m, n, p, q } = exercice;
  return (x: number) => {
    const denom = p * x + q;
    const u = (m * x + n) / denom;
    const uPrime = (m * denom - p * (m * x + n)) / (denom * denom);
    return lnBase * Math.pow(base, u) * uPrime;
  };
}

const POINTS_B_FRACTION_OFFSETS = [0.7, -0.7, 1.9, -1.9];

export function verifierBDerivee(exercice: ExerciceDomaineDeriveeB, texte: string): boolean {
  const points =
    exercice.sousType === "racine"
      ? [exercice.k + 0.6, exercice.k + 1.4, -(exercice.k + 0.6), -(exercice.k + 1.4)]
      : POINTS_B_FRACTION_OFFSETS.map((d) => -exercice.q / exercice.p + d);
  return equivalent(texte, referenceBDerivee(exercice), points);
}

// ============================================================================
// Famille C — 3 écrans (domaine, facteurs, assemblage). f'(x)=u'v+uv'.
// ============================================================================

interface PaireFacteurs {
  u: (x: number) => number;
  uPrime: (x: number) => number;
  v: (x: number) => number;
  vPrime: (x: number) => number;
}

function facteursC(exercice: ExerciceDomaineDeriveeC): PaireFacteurs {
  if (exercice.sousType === "d") {
    const { a, b } = exercice;
    const u = (x: number) => a * x * x * x + b * x * x;
    const uPrime = (x: number) => 3 * a * x * x + 2 * b * x;
    return { u, uPrime, v: (x) => Math.exp(u(x)), vPrime: (x) => uPrime(x) * Math.exp(u(x)) };
  }
  if (exercice.sousType === "e") {
    const { r } = exercice;
    return {
      u: (x) => Math.pow(x, r),
      uPrime: (x) => r * Math.pow(x, r - 1),
      v: (x) => Math.exp(Math.sqrt(x)),
      vPrime: (x) => (1 / (2 * Math.sqrt(x))) * Math.exp(Math.sqrt(x)),
    };
  }
  const { base, c, trig } = exercice;
  const lnBase = Math.log(base);
  return {
    u: (x) => Math.pow(base, x) - c,
    uPrime: (x) => lnBase * Math.pow(base, x),
    v: (x) => (trig === "sin" ? Math.sin(x) : Math.cos(x)),
    vPrime: (x) => (trig === "sin" ? Math.cos(x) : -Math.sin(x)),
  };
}

function pointsC(exercice: ExerciceDomaineDeriveeC): number[] {
  return exercice.sousType === "e" ? [0.4, 0.9, 1.7, 2.5] : POINTS_GENERIQUES;
}

export interface ReponseDeuxChamps {
  a: string;
  b: string;
}

/** Spec : "Dériver chaque facteur séparément" — l'élève produit u'(x) ET v'(x), jamais u(x)/v(x)
 * eux-mêmes (déjà visibles dans le bloc de données f(x)=u(x)·v(x) affiché sur cet écran). */
export function verifierCFacteurs(exercice: ExerciceDomaineDeriveeC, reponse: ReponseDeuxChamps): boolean {
  const { uPrime, vPrime } = facteursC(exercice);
  const points = pointsC(exercice);
  return equivalent(reponse.a, uPrime, points) && equivalent(reponse.b, vPrime, points);
}

export function verifierCAssemblage(exercice: ExerciceDomaineDeriveeC, texte: string): boolean {
  const { u, uPrime, v, vPrime } = facteursC(exercice);
  const points = pointsC(exercice);
  return equivalent(texte, (x) => uPrime(x) * v(x) + u(x) * vPrime(x), points);
}

// ============================================================================
// Famille D — 3 écrans (domaine, N'/D', assemblage). f'(x)=(N'D-ND')/D².
// ============================================================================

function nDetDdeD(exercice: ExerciceDomaineDeriveeD): { n: (x: number) => number; nPrime: (x: number) => number; d: (x: number) => number; dPrime: (x: number) => number } {
  const lnBase = Math.log(exercice.base);
  const base = exercice.base;
  if (exercice.sousType === "f") {
    const { c, k } = exercice;
    return { n: (x) => Math.pow(base, x) + c, nPrime: (x) => lnBase * Math.pow(base, x), d: (x) => k * x, dPrime: () => k };
  }
  if (exercice.sousType === "h") {
    const { c } = exercice;
    return {
      n: (x) => Math.pow(base, x) + Math.pow(base, -x),
      nPrime: (x) => lnBase * (Math.pow(base, x) - Math.pow(base, -x)),
      d: (x) => x * x + c,
      dPrime: (x) => 2 * x,
    };
  }
  if (exercice.sousType === "i") {
    const { k, m, c } = exercice;
    return {
      n: (x) => k * x * x,
      nPrime: (x) => 2 * k * x,
      d: (x) => Math.pow(base, m * x) + c,
      dPrime: (x) => m * lnBase * Math.pow(base, m * x),
    };
  }
  return {
    n: (x) => Math.pow(base, -x) - Math.pow(base, x),
    nPrime: (x) => -lnBase * (Math.pow(base, -x) + Math.pow(base, x)),
    d: (x) => Math.pow(base, 2 * x) + 1,
    dPrime: (x) => 2 * lnBase * Math.pow(base, 2 * x),
  };
}

function pointsD(exercice: ExerciceDomaineDeriveeD): number[] {
  return exercice.sousType === "f" ? [-1.3, -0.6, 0.6, 1.3] : [-1.1, -0.4, 0.5, 1.2];
}

/** Spec : "Dériver N et D séparément" — l'élève produit N'(x) ET D'(x), jamais N(x)/D(x) eux-mêmes
 * (déjà visibles dans le bloc de données f(x)=N(x)/D(x) affiché sur cet écran). */
export function verifierDND(exercice: ExerciceDomaineDeriveeD, reponse: ReponseDeuxChamps): boolean {
  const { nPrime, dPrime } = nDetDdeD(exercice);
  const points = pointsD(exercice);
  return equivalent(reponse.a, nPrime, points) && equivalent(reponse.b, dPrime, points);
}

export function verifierDAssemblage(exercice: ExerciceDomaineDeriveeD, texte: string): boolean {
  const { n, nPrime, d, dPrime } = nDetDdeD(exercice);
  const points = pointsD(exercice);
  return equivalent(texte, (x) => (nPrime(x) * d(x) - n(x) * dPrime(x)) / (d(x) * d(x)), points);
}

// ============================================================================
// Famille E — 3 écrans (domaine, simplifier, dérivée). Domaine toujours ℝ.
// ============================================================================

function formeOrigineE(exercice: ExerciceDomaineDeriveeE): (x: number) => number {
  if (exercice.sousType === "j") {
    const { base, g, h } = exercice;
    return (x: number) => Math.pow(base, evaluerGA(g, x)) / Math.pow(base, evaluerGA(h, x));
  }
  if (exercice.sousType === "m") {
    const { base } = exercice;
    return (x: number) => (Math.pow(base, x) - 1) / Math.pow(base, x);
  }
  const { base1, base2, c } = exercice;
  return (x: number) => (Math.pow(base1, x) - c) / Math.pow(base2, x);
}

function formeSimplifieeE(exercice: ExerciceDomaineDeriveeE): (x: number) => number {
  if (exercice.sousType === "j") {
    const { base, g, h } = exercice;
    return (x: number) => Math.pow(base, evaluerGA(g, x) - evaluerGA(h, x));
  }
  if (exercice.sousType === "m") {
    const { base } = exercice;
    return (x: number) => 1 - Math.pow(base, -x);
  }
  const { base1, base2, c } = exercice;
  const r1 = base1 / base2;
  const r2 = 1 / base2;
  return (x: number) => Math.pow(r1, x) - c * Math.pow(r2, x);
}

function deriveeSimplifieeE(exercice: ExerciceDomaineDeriveeE): (x: number) => number {
  if (exercice.sousType === "j") {
    const { base, g, h } = exercice;
    const lnBase = Math.log(base);
    return (x: number) => (deriveeGA(g, x) - deriveeGA(h, x)) * lnBase * Math.pow(base, evaluerGA(g, x) - evaluerGA(h, x));
  }
  if (exercice.sousType === "m") {
    const { base } = exercice;
    const lnBase = Math.log(base);
    return (x: number) => lnBase * Math.pow(base, -x);
  }
  const { base1, base2, c } = exercice;
  const r1 = base1 / base2;
  const r2 = 1 / base2;
  const lnR1 = Math.log(r1);
  const lnR2 = Math.log(r2);
  return (x: number) => lnR1 * Math.pow(r1, x) - c * lnR2 * Math.pow(r2, x);
}

/**
 * ⚠️ **Garde STRUCTURELLE, en plus de l'équivalence numérique** — même famille de risque que
 * gen50/gen52 (chapitre 6, 4e — voir CLAUDE.md, "Sixième révision — audit puis correctif de
 * vérification structurelle") : la cible de l'écran "eSimplifier" est ALGÉBRIQUEMENT IDENTIQUE (pour
 * tout x du domaine) à `f(x)` déjà affichée dans l'énoncé — une pure équivalence NUMÉRIQUE ne peut
 * donc PAS distinguer "forme réellement simplifiée" de "recopie brute de l'énoncé, jamais
 * transformée" (les deux ont, par construction, exactement les mêmes valeurs).
 *
 * Discriminant structurel choisi — jamais une comparaison caractère par caractère avec l'énoncé
 * (trop fragile face à un espacement/une casse différents) — l'origine NON simplifiée des 3
 * sous-types est TOUJOURS, au niveau le plus externe, une UNIQUE division `A/B` couvrant
 * l'expression ENTIÈRE (aucun `+`/`-` binaire au niveau le plus externe) ; la cible SIMPLIFIÉE
 * (ou toute reformulation raisonnable — ex. `base^(g-h)` réécrite `base^g*base^(-h)`, ou
 * `1-1/base^x` au lieu de `1-base^(-x)`) a TOUJOURS, à ce même niveau, soit une somme/différence
 * binaire au sommet (jamais réductible à une seule fraction couvrant tout), soit AUCUNE division du
 * tout — jamais une unique fraction encadrant l'expression complète. `estUneSeuleFractionAuTopNiveau`
 * scanne la profondeur de parenthèses (jamais une évaluation numérique) pour détecter ce cas
 * précis : AUCUN `+`/`-` binaire hors parenthèses ET AU MOINS UN `/` hors parenthèses.
 *
 * **Limite connue et acceptée, documentée plutôt que devinée silencieusement** (même esprit que la
 * "vigilance" de gen50/gen52) : une réponse artificielle comme `base^(g(x)-h(x))/1` (une division
 * par 1 superflue au niveau le plus externe) serait À TORT rejetée par cette garde — cas extrême
 * qu'un élève ne produit jamais en pratique, jugé acceptable plutôt que de complexifier le
 * discriminant pour un cas qui ne se présente pas.
 */
export function estUneSeuleFractionAuTopNiveau(texte: string): boolean {
  let profondeur = 0;
  let aUnPlusOuMoinsBinaireAuTop = false;
  let aUneDivisionAuTop = false;
  let dernierCaractereSignifiant = "";
  for (const c of texte) {
    if (c === "(") {
      profondeur++;
      continue;
    }
    if (c === ")") {
      profondeur = Math.max(0, profondeur - 1);
      continue;
    }
    if (/\s/.test(c)) continue;
    if (profondeur === 0) {
      if ((c === "+" || c === "-") && dernierCaractereSignifiant !== "" && !"+-*/^(".includes(dernierCaractereSignifiant)) {
        aUnPlusOuMoinsBinaireAuTop = true;
      }
      if (c === "/") aUneDivisionAuTop = true;
    }
    dernierCaractereSignifiant = c;
  }
  return !aUnPlusOuMoinsBinaireAuTop && aUneDivisionAuTop;
}

export function verifierESimplifier(exercice: ExerciceDomaineDeriveeE, texte: string): boolean {
  if (estUneSeuleFractionAuTopNiveau(texte)) return false;
  return equivalent(texte, formeSimplifieeE(exercice));
}

export function verifierEDerivee(exercice: ExerciceDomaineDeriveeE, texte: string): boolean {
  return equivalent(texte, deriveeSimplifieeE(exercice));
}

// Exportée pour le seul besoin des tests (cross-vérification "la forme simplifiée == f(x) d'origine").
export { formeOrigineE };

// ============================================================================
// Famille F — 2 écrans (domaine, dérivée). Chaîne à 3 niveaux.
// ============================================================================

function referenceFDerivee(exercice: ExerciceDomaineDeriveeF): (x: number) => number {
  const { k, trig } = exercice;
  return (x: number) => {
    const w = Math.exp(x * x - k);
    const wPrime = 2 * x * w;
    return trig === "cos" ? -Math.sin(w) * wPrime : -wPrime / Math.sqrt(1 - w * w);
  };
}

export function verifierFDerivee(exercice: ExerciceDomaineDeriveeF, texte: string): boolean {
  const points = exercice.trig === "cos" ? [-1.4, -0.5, 0.5, 1.4] : [-Math.sqrt(exercice.k) * 0.6, -Math.sqrt(exercice.k) * 0.2, Math.sqrt(exercice.k) * 0.2, Math.sqrt(exercice.k) * 0.6];
  return equivalent(texte, referenceFDerivee(exercice), points);
}
