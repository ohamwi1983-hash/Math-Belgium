import type {
  ExerciceDomaineDeriveeLogA,
  ExerciceDomaineDeriveeLogB,
  ExerciceDomaineDeriveeLogC,
  ExerciceDomaineDeriveeLogD,
  ExerciceDomaineDeriveeLogE,
  ExerciceDomaineDeriveeLogF,
  ExerciceDomaineDeriveeLogG,
} from "../core6e/domaineDeriveeLogarithme.types";
import type { EnsembleReelGuide } from "../core6e/ensembleReel.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerEquivalenceFonction } from "./equivalenceExponentielle";
import { verifierEnsembleReelGuide } from "./verificationEnsembleReel";

/**
 * Couche B (6e) — vérification pour `6gen16`. N'importe jamais rien de `src/generateurs6e/` — voir
 * `verificationDomaineDeriveeLogarithme.test.ts` pour la preuve avec des exercices factices définis
 * localement. Vérification par ÉCHANTILLONNAGE NUMÉRIQUE (`diagnostiquerEquivalenceFonction`,
 * `moteur6e/equivalenceExponentielle.ts`, partagé avec le chapitre 2 — "Algebrite/mathjs" des specs
 * source désigne cette même convention, voir CLAUDE.md). Chaque référence de dérivée/simplification
 * est reconstruite directement depuis les paramètres BRUTS de l'exercice (jamais depuis
 * `exercice.domaine`) — même principe que `6gen7`. Chaque `diagnostiquerXxx` retourne le statut à 3
 * valeurs (`StatutVerification`) ; `verifierXxx` (booléen, consommé par `etapeTentatives.ts`) se
 * déduit systématiquement de `diagnostiquerXxx(...)==="correct"`.
 *
 * ============================================================================
 * **Décision de conception — vérification de la famille E, écran "simplifier" (valeur absolue)**
 * ============================================================================
 * Deux sous-types (`puissanceAbs`, `valeurAbsolueQuadratique`) exigent une forme simplifiée avec
 * valeur absolue LITTÉRALE (`2·ln|u|`, jamais `2·ln(u)`) — la spec demande explicitement que cet
 * écran "teste la reconnaissance elle-même" (pas seulement l'équivalence algébrique globale, déjà
 * couverte par l'écran de dérivée qui suit). Deux problèmes DISTINCTS à couvrir, chacun avec sa
 * propre solution :
 *
 * 1. **Distinguer "avec abs" de "sans abs"** : PUR ÉCHANTILLONNAGE NUMÉRIQUE SUFFIT, à condition de
 *    choisir des points d'échantillonnage qui couvrent LES DEUX signes de l'expression interne
 *    (`e^x−1` change de signe en x=0 ; `x²−k²` change de signe en x=±k). `ln` (`Math.log`) renvoie
 *    `NaN` pour un argument négatif — une soumission SANS `abs()` évaluée à un point où
 *    l'expression interne est négative produit donc un résultat non fini, et
 *    `diagnostiquerEquivalenceFonction` traite déjà ce cas comme `"not_equivalent"` (voir
 *    `equivalenceExponentielle.ts`, `if (!Number.isFinite(soumis)) return "not_equivalent"`) — AUCUN
 *    mécanisme supplémentaire nécessaire pour ce point précis, seul le choix des points compte
 *    (`POINTS_E_ABS_SIGNE_MIXTE`/`pointsValeurAbsolueQuadratique`, toujours au moins un point de
 *    chaque signe).
 * 2. **Distinguer "forme réellement simplifiée" de "recopie brute non simplifiée"** : ln(u²) et
 *    2ln|u| sont EXACTEMENT la même fonction réelle partout où u≠0 — un élève qui recopie
 *    littéralement `ln((e^x-1)^2)` (ou toute variante contenant encore un carré, ex.
 *    `ln((e^x-1)*(e^x-1))`) passerait un test PUREMENT numérique, quels que soient les points
 *    choisis (même problème que gen50/gen52 et que `6gen7` famille E, "garde structurelle"). Un
 *    garde-fou TEXTUEL est donc nécessaire EN PLUS de l'équivalence numérique : la forme attendue
 *    ne doit plus contenir de carré (`^2`/`²`) ET doit contenir littéralement une construction
 *    `abs(...)` — seule combinaison qui, avec la grammaire de `expressionExponentielle.ts` (pas de
 *    `sqrt(u^2)` déguisé possible sans réintroduire `^2`, détecté par le même garde), force
 *    réellement la forme `k·ln(abs(...))`. Implémenté en 2 temps : la réponse doit D'ABORD être
 *    numériquement équivalente (statut `"correct"` avant garde) — un garde-fou déclenché seul, sans
 *    vérifier l'équivalence, confondrait à tort une syntaxe simplement mal formée avec une forme non
 *    simplifiée ; SEULE une réponse déjà mathématiquement juste peut être rétrogradée en
 *    `"not_equivalent"` par le garde structurel (jamais en `"parse_error"`, qui reste réservé aux
 *    vraies erreurs de syntaxe détectées par le parseur lui-même).
 *
 * Les autres sous-types de la famille E (`quotientDifference`, `puissanceSimple`, `combinaison`,
 * `dejaSimplifie`) souffrent du MÊME problème de recopie brute (la forme d'origine et la forme
 * simplifiée sont, elles aussi, algébriquement identiques partout) — un garde structurel dédié est
 * donc appliqué à chacun (voir `estUnSeulTermeAuTopNiveau`, `contientMotif`) : une réponse qui
 * ressemble encore à la forme d'origine (une seule division/un seul appel `ln` non séparé, un
 * `sqrt(` encore présent, un `ln(x^3)`/`x^x` encore intact) est rejetée avant même le test
 * numérique — même esprit que `estUneSeuleFractionAuTopNiveau` de `6gen7`.
 *
 * L'écran de DÉRIVÉE (`eDerivee`) qui suit n'a, lui, AUCUN garde structurel — la spec l'indique
 * explicitement ("accepte toute forme équivalente") : seule l'équivalence numérique compte.
 */

const TOLERANCE = 0.01;
const POINTS_GENERIQUES = [-1.3, -0.6, 0.6, 1.3];
const POINTS_POSITIFS = [0.4, 0.9, 1.7, 2.6];

function equivalent(texte: string, reference: (x: number) => number, points: number[] = POINTS_GENERIQUES): StatutVerification {
  return diagnostiquerEquivalenceFonction(texte, reference, points, TOLERANCE);
}

function diviseurLn(base: number, baseEstE: boolean): number {
  return baseEstE ? 1 : Math.log(base);
}

export function verifierDomaine(exercice: { domaine: EnsembleReelGuide }, reponse: EnsembleReelGuide): boolean {
  return verifierEnsembleReelGuide(reponse, exercice.domaine);
}

// ============================================================================
// Famille A — f'(x) = u'(x)/(u(x)·ln(base)) [ou /u(x) si base=e].
// ============================================================================

function referenceADerivee(exercice: ExerciceDomaineDeriveeLogA): (x: number) => number {
  const div = diviseurLn(exercice.base, exercice.baseEstE);
  if (exercice.sousType === "puissance") {
    const { k } = exercice;
    return (x) => (Math.log(k) * Math.pow(k, x)) / (Math.pow(k, x) * div);
  }
  if (exercice.sousType === "carre") {
    const { c } = exercice;
    return (x) => (2 * x) / ((x * x + c) * div);
  }
  const { m, n } = exercice;
  return (x) => m / ((m * x + n) * div);
}

function pointsADerivee(exercice: ExerciceDomaineDeriveeLogA): number[] {
  if (exercice.sousType !== "affine") return POINTS_GENERIQUES;
  const { m, n } = exercice;
  const borne = -n / m;
  return m > 0 ? [borne + 0.7, borne + 1.9, borne + 3.1, borne + 4.3] : [borne - 0.7, borne - 1.9, borne - 3.1, borne - 4.3];
}

export function diagnostiquerADerivee(exercice: ExerciceDomaineDeriveeLogA, texte: string): StatutVerification {
  return equivalent(texte, referenceADerivee(exercice), pointsADerivee(exercice));
}
export function verifierADerivee(exercice: ExerciceDomaineDeriveeLogA, texte: string): boolean {
  return diagnostiquerADerivee(exercice, texte) === "correct";
}

// ============================================================================
// Famille B.
// ============================================================================

function bornesBDoubleContrainte(exercice: { base: number; m: 1 | -1; n: number }): { borne1: number; borne2: number } {
  const { base, m, n } = exercice;
  return { borne1: -n / m, borne2: (base - n) / m };
}

function referenceBDerivee(exercice: ExerciceDomaineDeriveeLogB): (x: number) => number {
  if (exercice.sousType === "doubleContrainte") {
    const { base, m, n } = exercice;
    const lnBase = Math.log(base);
    return (x) => {
      const w = Math.log(m * x + n) / lnBase;
      const wPrime = m / ((m * x + n) * lnBase);
      return -wPrime / (2 * Math.sqrt(1 - w));
    };
  }
  if (exercice.sousType === "racineInterne") {
    const div = Math.log(exercice.base);
    return (x) => -x / ((1 - x * x) * div);
  }
  if (exercice.sousType === "quadratique") {
    const { k, base } = exercice;
    const div = Math.log(base);
    return (x) => (2 * x) / ((x * x - k * k) * div);
  }
  const { p, base } = exercice;
  const div = Math.log(base);
  return (x) => 1 / (2 * (x - p) * div);
}

function pointsBDerivee(exercice: ExerciceDomaineDeriveeLogB): number[] {
  if (exercice.sousType === "doubleContrainte") {
    const { borne1, borne2 } = bornesBDoubleContrainte(exercice);
    const bas = Math.min(borne1, borne2);
    const largeur = Math.abs(borne2 - borne1);
    return [bas + largeur * 0.15, bas + largeur * 0.35, bas + largeur * 0.55, bas + largeur * 0.75];
  }
  if (exercice.sousType === "racineInterne") return [-0.6, -0.3, 0.3, 0.6];
  if (exercice.sousType === "quadratique") {
    const { k } = exercice;
    return [-(k + 1.3), -(k + 0.6), k + 0.6, k + 1.3];
  }
  const { p } = exercice;
  return [p + 0.6, p + 1.4, p + 2.7, p + 4.1];
}

export function diagnostiquerBDerivee(exercice: ExerciceDomaineDeriveeLogB, texte: string): StatutVerification {
  return equivalent(texte, referenceBDerivee(exercice), pointsBDerivee(exercice));
}
export function verifierBDerivee(exercice: ExerciceDomaineDeriveeLogB, texte: string): boolean {
  return diagnostiquerBDerivee(exercice, texte) === "correct";
}

// ============================================================================
// Famille C — f'(x) = u'v+uv'.
// ============================================================================

export interface ReponseDeuxChamps {
  a: string;
  b: string;
}

interface PaireFacteurs {
  u: (x: number) => number;
  uPrime: (x: number) => number;
  v: (x: number) => number;
  vPrime: (x: number) => number;
}

function facteursC(exercice: ExerciceDomaineDeriveeLogC): PaireFacteurs {
  if (exercice.sousType === "produitLn") {
    const { k } = exercice;
    return { u: (x) => k * x, uPrime: () => k, v: (x) => Math.log(x), vPrime: (x) => 1 / x };
  }
  if (exercice.sousType === "trigLn") {
    const { trig, trig2 } = exercice;
    const trigFn = trig === "sin" ? Math.sin : Math.cos;
    const trigPrimeFn = trig === "sin" ? Math.cos : (x: number) => -Math.sin(x);
    const trig2Fn = trig2 === "sin" ? Math.sin : Math.cos;
    const trig2PrimeFn = trig2 === "sin" ? Math.cos : (x: number) => -Math.sin(x);
    return {
      u: trigFn,
      uPrime: trigPrimeFn,
      v: (x) => Math.log(2 + trig2Fn(x)),
      vPrime: (x) => trig2PrimeFn(x) / (2 + trig2Fn(x)),
    };
  }
  if (exercice.sousType === "expoLn") {
    const { base, baseEstE } = exercice;
    const lnBase = Math.log(base);
    return {
      u: (x) => Math.pow(base, x),
      uPrime: (x) => (baseEstE ? Math.pow(base, x) : lnBase * Math.pow(base, x)),
      v: (x) => Math.log(x),
      vPrime: (x) => 1 / x,
    };
  }
  if (exercice.sousType === "carreLn") {
    const { m, n } = exercice;
    return { u: (x) => x * x, uPrime: (x) => 2 * x, v: (x) => Math.log(m * x + n), vPrime: (x) => m / (m * x + n) };
  }
  const { k } = exercice;
  return {
    u: (x) => Math.log(x),
    uPrime: (x) => 1 / x,
    v: (x) => Math.sqrt(x * x - k * k),
    vPrime: (x) => x / Math.sqrt(x * x - k * k),
  };
}

function pointsC(exercice: ExerciceDomaineDeriveeLogC): number[] {
  if (exercice.sousType === "trigLn") return POINTS_GENERIQUES;
  if (exercice.sousType === "carreLn") {
    const { m, n } = exercice;
    const borne = -n / m;
    return m > 0 ? [borne + 0.7, borne + 1.9, borne + 3.1, borne + 4.3] : [borne - 0.7, borne - 1.9, borne - 3.1, borne - 4.3];
  }
  if (exercice.sousType === "lnRacine") {
    const { k } = exercice;
    return [k + 0.6, k + 1.4, k + 2.7, k + 4.1];
  }
  return POINTS_POSITIFS;
}

/** Spec : "Dérive chaque facteur SÉPARÉMENT" — l'élève produit u'(x) ET v'(x), jamais u(x)/v(x)
 * eux-mêmes (déjà visibles dans le bloc de données). */
export function diagnostiquerCFacteurs(exercice: ExerciceDomaineDeriveeLogC, reponse: ReponseDeuxChamps): StatutVerification {
  const { uPrime, vPrime } = facteursC(exercice);
  const points = pointsC(exercice);
  const sa = equivalent(reponse.a, uPrime, points);
  if (sa === "parse_error") return "parse_error";
  const sb = equivalent(reponse.b, vPrime, points);
  if (sb === "parse_error") return "parse_error";
  return sa === "correct" && sb === "correct" ? "correct" : "not_equivalent";
}
export function verifierCFacteurs(exercice: ExerciceDomaineDeriveeLogC, reponse: ReponseDeuxChamps): boolean {
  return diagnostiquerCFacteurs(exercice, reponse) === "correct";
}

export function diagnostiquerCAssemblage(exercice: ExerciceDomaineDeriveeLogC, texte: string): StatutVerification {
  const { u, uPrime, v, vPrime } = facteursC(exercice);
  const points = pointsC(exercice);
  return equivalent(texte, (x) => uPrime(x) * v(x) + u(x) * vPrime(x), points);
}
export function verifierCAssemblage(exercice: ExerciceDomaineDeriveeLogC, texte: string): boolean {
  return diagnostiquerCAssemblage(exercice, texte) === "correct";
}

// ============================================================================
// Famille D — f'(x) = (N'D-ND')/D².
// ============================================================================

function nDetDdeD(exercice: ExerciceDomaineDeriveeLogD): { n: (x: number) => number; nPrime: (x: number) => number; d: (x: number) => number; dPrime: (x: number) => number } {
  if (exercice.sousType === "sommeLog") {
    const { base, baseEstE } = exercice;
    const div = diviseurLn(base, baseEstE);
    return { n: (x) => x + Math.log(x) / div, nPrime: (x) => 1 + 1 / (x * div), d: (x) => x, dPrime: () => 1 };
  }
  if (exercice.sousType === "lnSurKx") {
    const { k } = exercice;
    return { n: (x) => Math.log(x), nPrime: (x) => 1 / x, d: (x) => k * x, dPrime: () => k };
  }
  const { base, baseEstE } = exercice;
  const lnBase = Math.log(base);
  return {
    n: (x) => Math.pow(base, x) + x,
    nPrime: (x) => (baseEstE ? Math.pow(base, x) : lnBase * Math.pow(base, x)) + 1,
    d: (x) => Math.log(x),
    dPrime: (x) => 1 / x,
  };
}

function pointsD(exercice: ExerciceDomaineDeriveeLogD): number[] {
  return exercice.sousType === "expoSurLn" ? [0.3, 0.6, 1.5, 2.5] : POINTS_POSITIFS;
}

export function diagnostiquerDND(exercice: ExerciceDomaineDeriveeLogD, reponse: ReponseDeuxChamps): StatutVerification {
  const { nPrime, dPrime } = nDetDdeD(exercice);
  const points = pointsD(exercice);
  const sa = equivalent(reponse.a, nPrime, points);
  if (sa === "parse_error") return "parse_error";
  const sb = equivalent(reponse.b, dPrime, points);
  if (sb === "parse_error") return "parse_error";
  return sa === "correct" && sb === "correct" ? "correct" : "not_equivalent";
}
export function verifierDND(exercice: ExerciceDomaineDeriveeLogD, reponse: ReponseDeuxChamps): boolean {
  return diagnostiquerDND(exercice, reponse) === "correct";
}

export function diagnostiquerDAssemblage(exercice: ExerciceDomaineDeriveeLogD, texte: string): StatutVerification {
  const { n, nPrime, d, dPrime } = nDetDdeD(exercice);
  const points = pointsD(exercice);
  return equivalent(texte, (x) => (nPrime(x) * d(x) - n(x) * dPrime(x)) / (d(x) * d(x)), points);
}
export function verifierDAssemblage(exercice: ExerciceDomaineDeriveeLogD, texte: string): boolean {
  return diagnostiquerDAssemblage(exercice, texte) === "correct";
}

// ============================================================================
// Famille E — voir le commentaire de tête pour la conception de la garde valeur absolue.
// ============================================================================

/** Vrai s'il n'existe AUCUN `+`/`-` binaire hors parenthèses — même technique de balayage de
 * profondeur que `estUneSeuleFractionAuTopNiveau` (`6gen7`). Un "seul terme" au top niveau trahit
 * une recopie non simplifiée (la forme correcte a toujours une somme/différence au sommet, pour les
 * sous-types concernés). */
function estUnSeulTermeAuTopNiveau(texte: string): boolean {
  let profondeur = 0;
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
    if (profondeur === 0 && (c === "+" || c === "-") && dernierCaractereSignifiant !== "" && !"+-*/^(".includes(dernierCaractereSignifiant)) {
      return false;
    }
    dernierCaractereSignifiant = c;
  }
  return true;
}

/** Argument (balancé en parenthèses) de chaque appel `ln(...)` trouvé dans `texte`. */
function argumentsDesAppelsLn(texte: string): string[] {
  const arguments_: string[] = [];
  const regex = /\bln\s*\(/gi;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(texte))) {
    let profondeur = 1;
    let i = m.index + m[0].length;
    const debut = i;
    while (i < texte.length && profondeur > 0) {
      if (texte[i] === "(") profondeur++;
      else if (texte[i] === ")") profondeur--;
      i++;
    }
    arguments_.push(texte.slice(debut, i - 1));
  }
  return arguments_;
}

/** Vrai si `argument` est, à son niveau le PLUS EXTERNE (profondeur 0 relative à lui-même), une
 * puissance carrée (`(...)^2` couvrant l'intégralité de l'argument) — ex. l'argument de
 * `ln((e^x-1)^2)`. Ne se déclenche PAS sur un `^2` niché plus profondément (ex. `abs(x^2-k^2)`,
 * où tous les `^2` sont à l'intérieur de l'appel `abs(...)`, jamais au niveau le plus externe de
 * l'argument du `ln`) — condition nécessaire pour ne pas rejeter à tort la forme simplifiée
 * correcte (qui contient légitimement des `^2` internes, ex. `x^2` dans `abs(x^2-k^2)`). */
function argumentEstPuissanceDeuxAuTop(argument: string): boolean {
  const t = argument.trim();
  if (t.endsWith("²")) return true;
  let profondeur = 0;
  let dernierCaretTop = -1;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (c === "(") profondeur++;
    else if (c === ")") profondeur = Math.max(0, profondeur - 1);
    else if (c === "^" && profondeur === 0) dernierCaretTop = i;
  }
  if (dernierCaretTop === -1) return false;
  return t.slice(dernierCaretTop + 1).trim() === "2";
}

function contientLnDePuissanceDeuxAuTop(texte: string): boolean {
  return argumentsDesAppelsLn(texte).some((arg) => argumentEstPuissanceDeuxAuTop(arg));
}
function contientAbs(texte: string): boolean {
  return /\babs\s*\(/i.test(texte);
}
function contientSqrt(texte: string): boolean {
  return /\bsqrt\s*\(/i.test(texte);
}
function contientLnDeXCube(texte: string): boolean {
  return /\bln\s*\(\s*x\s*(\^|\*\*)\s*3\s*\)/i.test(texte);
}
function contientXPuissanceX(texte: string): boolean {
  return /\bx\s*(\^|\*\*)\s*x\b/i.test(texte);
}

function pointsESimplifier(exercice: ExerciceDomaineDeriveeLogE): number[] {
  switch (exercice.sousType) {
    case "puissanceAbs":
      return [-0.8, -0.3, 0.4, 0.9];
    case "quotientDifference": {
      const { m, n, p } = exercice;
      const r1 = -n / m;
      const r2 = -exercice.q / p;
      const gap = r2 - r1;
      return [r1 + gap * 0.25, r1 + gap * 0.4, r1 + gap * 0.6, r1 + gap * 0.75];
    }
    case "puissanceSimple":
    case "combinaison":
    case "dejaSimplifie":
      return POINTS_POSITIFS;
    case "valeurAbsolueQuadratique": {
      const { k } = exercice;
      return [0, k * 0.5, k * 1.5, k * 2];
    }
  }
}

function formeSimplifieeE(exercice: ExerciceDomaineDeriveeLogE): (x: number) => number {
  switch (exercice.sousType) {
    case "puissanceAbs":
      return (x) => 2 * Math.log(Math.abs(Math.exp(x) - 1));
    case "quotientDifference": {
      const { m, n, p, q } = exercice;
      return (x) => Math.log(m * x + n) - Math.log(p * x + q);
    }
    case "puissanceSimple":
      return (x) => 0.5 * Math.log(x);
    case "combinaison":
      return (x) => Math.pow(Math.log(x), 3) - 3 * Math.log(x);
    case "valeurAbsolueQuadratique": {
      const { k } = exercice;
      return (x) => 2 * Math.log(Math.abs(x * x - k * k));
    }
    case "dejaSimplifie":
      return (x) => x * Math.log(x);
  }
}

function deriveeSimplifieeE(exercice: ExerciceDomaineDeriveeLogE): (x: number) => number {
  switch (exercice.sousType) {
    case "puissanceAbs":
      return (x) => (2 * Math.exp(x)) / (Math.exp(x) - 1);
    case "quotientDifference": {
      const { m, n, p, q } = exercice;
      return (x) => m / (m * x + n) - p / (p * x + q);
    }
    case "puissanceSimple":
      return (x) => 1 / (2 * x);
    case "combinaison":
      return (x) => (3 * Math.pow(Math.log(x), 2)) / x - 3 / x;
    case "valeurAbsolueQuadratique": {
      const { k } = exercice;
      return (x) => (4 * x) / (x * x - k * k);
    }
    case "dejaSimplifie":
      return (x) => Math.log(x) + 1;
  }
}

/** Garde structurelle par sous-type — voir commentaire de tête. `null` = pas de garde
 * supplémentaire nécessaire (aucun sous-type de E n'est dans ce cas, mais gardé pour extensibilité). */
function formeRejeteeParGarde(exercice: ExerciceDomaineDeriveeLogE, texte: string): boolean {
  switch (exercice.sousType) {
    case "puissanceAbs":
    case "valeurAbsolueQuadratique":
      return contientLnDePuissanceDeuxAuTop(texte) || !contientAbs(texte);
    case "quotientDifference":
      return estUnSeulTermeAuTopNiveau(texte);
    case "puissanceSimple":
      return contientSqrt(texte);
    case "combinaison":
      return contientLnDeXCube(texte);
    case "dejaSimplifie":
      return contientXPuissanceX(texte);
  }
}

export function diagnostiquerESimplifier(exercice: ExerciceDomaineDeriveeLogE, texte: string): StatutVerification {
  const statut = equivalent(texte, formeSimplifieeE(exercice), pointsESimplifier(exercice));
  if (statut !== "correct") return statut;
  return formeRejeteeParGarde(exercice, texte) ? "not_equivalent" : "correct";
}
export function verifierESimplifier(exercice: ExerciceDomaineDeriveeLogE, texte: string): boolean {
  return diagnostiquerESimplifier(exercice, texte) === "correct";
}

/** Écran dérivée — "accepte toute forme équivalente" (spec explicite), AUCUNE garde structurelle. */
export function diagnostiquerEDerivee(exercice: ExerciceDomaineDeriveeLogE, texte: string): StatutVerification {
  return equivalent(texte, deriveeSimplifieeE(exercice), pointsESimplifier(exercice));
}
export function verifierEDerivee(exercice: ExerciceDomaineDeriveeLogE, texte: string): boolean {
  return diagnostiquerEDerivee(exercice, texte) === "correct";
}

// ============================================================================
// Famille F.
// ============================================================================

function referenceFDerivee(exercice: ExerciceDomaineDeriveeLogF): (x: number) => number {
  if (exercice.sousType === "lnSurSin") {
    return (x) => {
      const w = Math.exp(x);
      const g = 2 + Math.sin(w);
      const gPrime = Math.cos(w) * w;
      return (gPrime * (1 - Math.log(g))) / (g * g);
    };
  }
  if (exercice.sousType === "arcsinLog") {
    const { p } = exercice;
    return (x) => p / Math.sqrt(1 - p * x * p * x);
  }
  if (exercice.sousType === "racineArcsin") {
    return (x) => {
      const s = Math.sqrt(1 - Math.exp(x));
      const sPrime = -Math.exp(x) / (2 * s);
      return sPrime / Math.sqrt(1 - s * s);
    };
  }
  const ln10 = Math.log(10);
  return (x) => {
    const n = Math.atan(2 * x);
    const nPrime = 2 / (1 + 4 * x * x);
    const d = 1 - Math.log(2 * x) / ln10;
    const dPrime = -1 / (x * ln10);
    return (nPrime * d - n * dPrime) / (d * d);
  };
}

function pointsFDerivee(exercice: ExerciceDomaineDeriveeLogF): number[] {
  if (exercice.sousType === "lnSurSin") return [-1, -0.4, 0.5, 1.2];
  if (exercice.sousType === "arcsinLog") {
    const { p } = exercice;
    return [-0.6 / p, -0.3 / p, 0.3 / p, 0.6 / p];
  }
  if (exercice.sousType === "racineArcsin") return [-2.5, -1.5, -0.8, -0.3];
  return [0.5, 1.5, 8, 12];
}

export function diagnostiquerFDerivee(exercice: ExerciceDomaineDeriveeLogF, texte: string): StatutVerification {
  return equivalent(texte, referenceFDerivee(exercice), pointsFDerivee(exercice));
}
export function verifierFDerivee(exercice: ExerciceDomaineDeriveeLogF, texte: string): boolean {
  return diagnostiquerFDerivee(exercice, texte) === "correct";
}

// ============================================================================
// Famille G — dérivation logarithmique implicite. `uvDeG` retourne u/u'/v/v' — pour la variante
// "produit", u/v désignent UNIQUEMENT la partie puissance x^(-(1+x)) (jamais f(x) entier, voir
// `core6e/domaineDeriveeLogarithme.types.ts`).
// ============================================================================

interface UVDeG {
  u: (x: number) => number;
  uPrime: (x: number) => number;
  v: (x: number) => number;
  vPrime: (x: number) => number;
  points: number[];
}

function uvDeG(exercice: ExerciceDomaineDeriveeLogG): UVDeG {
  switch (exercice.variante) {
    case "xx":
      return { u: (x) => x, uPrime: () => 1, v: (x) => x, vPrime: () => 1, points: POINTS_POSITIFS };
    case "xSinx":
      return { u: (x) => x, uPrime: () => 1, v: (x) => Math.sin(x), vPrime: (x) => Math.cos(x), points: POINTS_POSITIFS };
    case "cosTan":
      return { u: (x) => Math.cos(x), uPrime: (x) => -Math.sin(x), v: (x) => Math.tan(x), vPrime: (x) => 1 / Math.pow(Math.cos(x), 2), points: [-0.8, -0.3, 0.3, 0.8] };
    case "unSurXPuissanceX":
      return { u: (x) => 1 + 1 / x, uPrime: (x) => -1 / (x * x), v: (x) => x, vPrime: () => 1, points: [1, 2, 3, 5] };
    case "sinXInvX":
      return { u: (x) => Math.sin(x), uPrime: (x) => Math.cos(x), v: (x) => 1 / x, vPrime: (x) => -1 / (x * x), points: [0.5, 1.0, 1.8, 2.5] };
    case "racineXPuissanceX":
    case "xRacineXPuissanceX":
      return { u: (x) => x, uPrime: () => 1, v: (x) => 1 + x / 2, vPrime: () => 0.5, points: POINTS_POSITIFS };
    case "produit":
      return { u: (x) => x, uPrime: () => 1, v: (x) => -(1 + x), vPrime: () => -1, points: POINTS_POSITIFS };
  }
}

function referenceGIdentifier(exercice: ExerciceDomaineDeriveeLogG): (x: number) => number {
  const { u, v } = uvDeG(exercice);
  return (x) => Math.pow(u(x), v(x));
}

function referenceGFPrimeSurF(exercice: ExerciceDomaineDeriveeLogG): (x: number) => number {
  const { u, uPrime, v, vPrime } = uvDeG(exercice);
  return (x) => vPrime(x) * Math.log(u(x)) + (v(x) * uPrime(x)) / u(x);
}

function referenceGIsoler(exercice: ExerciceDomaineDeriveeLogG): (x: number) => number {
  const { u, v } = uvDeG(exercice);
  const fPrimeSurF = referenceGFPrimeSurF(exercice);
  const g = (x: number) => Math.pow(u(x), v(x));
  const gPrime = (x: number) => g(x) * fPrimeSurF(x);
  if (exercice.variante !== "produit") return gPrime;
  // Sous-type "produit" : f(x) = (1+x)·g(x) → f'(x) = g(x) + (1+x)·g'(x) (règle du produit, le
  // facteur affine (1+x) se dérive classiquement en parallèle — spec explicite).
  return (x: number) => g(x) + (1 + x) * gPrime(x);
}

/** Garde structurelle écran 1 : les 2 sous-types "à simplifier d'abord" doivent aboutir à une
 * puissance unique SANS racine résiduelle — une recopie de la forme d'origine (qui contient encore
 * `sqrt(`) est numériquement équivalente partout mais ne teste pas la reconnaissance. */
function formeGRejeteeParGarde(exercice: ExerciceDomaineDeriveeLogG, texte: string): boolean {
  if (exercice.variante === "racineXPuissanceX" || exercice.variante === "xRacineXPuissanceX") return contientSqrt(texte);
  return false;
}

export function diagnostiquerGIdentifier(exercice: ExerciceDomaineDeriveeLogG, texte: string): StatutVerification {
  const { points } = uvDeG(exercice);
  const statut = equivalent(texte, referenceGIdentifier(exercice), points);
  if (statut !== "correct") return statut;
  return formeGRejeteeParGarde(exercice, texte) ? "not_equivalent" : "correct";
}
export function verifierGIdentifier(exercice: ExerciceDomaineDeriveeLogG, texte: string): boolean {
  return diagnostiquerGIdentifier(exercice, texte) === "correct";
}

export function diagnostiquerGFPrimeSurF(exercice: ExerciceDomaineDeriveeLogG, texte: string): StatutVerification {
  const { points } = uvDeG(exercice);
  return equivalent(texte, referenceGFPrimeSurF(exercice), points);
}
export function verifierGFPrimeSurF(exercice: ExerciceDomaineDeriveeLogG, texte: string): boolean {
  return diagnostiquerGFPrimeSurF(exercice, texte) === "correct";
}

export function diagnostiquerGIsoler(exercice: ExerciceDomaineDeriveeLogG, texte: string): StatutVerification {
  const { points } = uvDeG(exercice);
  return equivalent(texte, referenceGIsoler(exercice), points);
}
export function verifierGIsoler(exercice: ExerciceDomaineDeriveeLogG, texte: string): boolean {
  return diagnostiquerGIsoler(exercice, texte) === "correct";
}
