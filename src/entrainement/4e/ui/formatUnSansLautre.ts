/**
 * Présentation — "L'un sans l'autre" (chapitre 3, seizième générateur). Toujours pur (exercice →
 * LaTeX), jamais de logique de vérification (voir moteur/verificationUnSansLautre.ts).
 */
import type { ExerciceUnSansLautre, FonctionConnue, QuadrantOuvert } from "../core/unSansLautre.types";

const NOM_FONCTION: Record<FonctionConnue, string> = { cos: "\\cos", sin: "\\sin" };

function formatFractionSigneeLatex(signe: 1 | -1, p: number, q: number): string {
  const corps = `\\frac{${p}}{${q}}`;
  return signe === -1 ? `-${corps}` : corps;
}

/** Bloc énoncé fixe, ligne 1 : la valeur donnée (ex. `\cos\theta = -\frac{3}{5}`). */
export function formatValeurConnueLatex(exercice: ExerciceUnSansLautre): string {
  return `${NOM_FONCTION[exercice.fonctionConnue]}\\theta = ${formatFractionSigneeLatex(exercice.signeConnu, exercice.p, exercice.q)}`;
}

/** Bloc énoncé fixe, ligne 2 : l'intervalle sur θ (ex. `90^\circ < \theta < 180^\circ`). */
export function formatIntervalleLatex(exercice: ExerciceUnSansLautre): string {
  return `${exercice.borneInf}^\\circ < \\theta < ${exercice.borneSup}^\\circ`;
}

/** `\sin^2\theta` ou `\cos^2\theta` — jamais la fonction donnée. */
export function formatCarreLatex(fonction: FonctionConnue): string {
  return `${NOM_FONCTION[fonction]}^2\\theta`;
}

/** Fraction irréductible par construction (voir core/unSansLautre.types.ts) — jamais de racine
 * pour cette réponse, un carré étant toujours rationnel. */
export function formatCarreCibleLatex(exercice: ExerciceUnSansLautre): string {
  return `\\frac{${exercice.carreCibleNum}}{${exercice.carreCibleDen}}`;
}

/** `\sin\theta` ou `\cos\theta` (fonction cible, écran 2). */
export function formatFonctionCibleLatex(exercice: ExerciceUnSansLautre): string {
  return `${NOM_FONCTION[exercice.fonctionCible]}\\theta`;
}

const LIBELLE_QUADRANT: Record<QuadrantOuvert, string> = { I: "I", II: "II", III: "III", IV: "IV" };

export function libelleQuadrantUnSansLautre(quadrant: QuadrantOuvert): string {
  return LIBELLE_QUADRANT[quadrant];
}

/** Aide écran 2 : signe déduit du quadrant, ex. `\sin(\theta) > 0`. */
export function formatSigneCibleLatex(exercice: ExerciceUnSansLautre): string {
  return `${NOM_FONCTION[exercice.fonctionCible]}(\\theta) ${exercice.signeCible === 1 ? ">" : "<"} 0`;
}

// --- Simplification exacte (partagée par la révélation et la présentation) --------------------

function pgcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    [x, y] = [y, x % y];
  }
  return x;
}

/** `n = k² * m`, `m` sans facteur carré — extraction du plus grand facteur carré. */
function extraireFacteurCarre(n: number): { k: number; m: number } {
  let k = 1;
  let m = n;
  for (let d = 2; d * d <= m; d++) {
    while (m % (d * d) === 0) {
      m /= d * d;
      k *= d;
    }
  }
  return { k, m };
}

interface FormeRadicale {
  coefficient: number;
  radicand: number;
  denominateur: number;
}

/** Simplifie `coefficient·√radicandBrut / denominateurBrut` en forme canonique (radicande sans
 * facteur carré, coefficient/dénominateur coprimes) — utilisée aussi bien pour la valeur signée
 * (écran 2) que pour la tangente (écran 3, y compris quand une rationalisation de dénominateur est
 * nécessaire — voir `formatValeurTangenteSimplifieeLatex`). */
function simplifierFormeRadicale(coefficient: number, radicandBrut: number, denominateurBrut: number): FormeRadicale {
  const { k, m } = extraireFacteurCarre(radicandBrut);
  const coefApresRacine = coefficient * k;
  const diviseur = pgcd(coefApresRacine, denominateurBrut) || 1;
  return { coefficient: coefApresRacine / diviseur, radicand: m, denominateur: denominateurBrut / diviseur };
}

function rendreFormeRadicaleLatex(signe: 1 | -1, forme: FormeRadicale): string {
  const signeTexte = signe === -1 ? "-" : "";
  const numerateur =
    forme.radicand === 1 ? `${forme.coefficient}` : forme.coefficient === 1 ? `\\sqrt{${forme.radicand}}` : `${forme.coefficient}\\sqrt{${forme.radicand}}`;
  const corps = forme.denominateur === 1 ? numerateur : `\\frac{${numerateur}}{${forme.denominateur}}`;
  return `${signeTexte}${corps}`;
}

/** Réponse simplifiée attendue de l'écran 2 (valeur signée) — fraction pure (triplet) ou
 * coefficient·√radicande/q (quelconque), toujours dérivée de la même décomposition que le calcul
 * de vérification. */
export function formatValeurCibleSimplifieeLatex(exercice: ExerciceUnSansLautre): string {
  const forme = simplifierFormeRadicale(1, exercice.carreCibleNum, exercice.q);
  return rendreFormeRadicaleLatex(exercice.signeCible, forme);
}

/**
 * Réponse simplifiée attendue de l'écran 3 (tangente) — `tanθ = sinθ/cosθ`, les deux valeurs
 * partageant le même dénominateur `q` qui s'annule systématiquement dans le rapport : si
 * `fonctionConnue="cos"`, `tanθ = ±√(carreCibleNum)/p` (racine déjà au numérateur, jamais de
 * dénominateur à rationaliser) ; si `fonctionConnue="sin"`, `tanθ = ±p/√(carreCibleNum)`, qui
 * DOIT être rationalisé (`p/√N = p√N/N`) avant simplification — les deux cas passent par la même
 * fonction de simplification, `simplifierFormeRadicale`, appelée avec des arguments différents
 * selon le cas (voir tests pour la dérivation complète, y compris l'exemple qui nécessite une
 * rationalisation réelle).
 */
export function formatValeurTangenteSimplifieeLatex(exercice: ExerciceUnSansLautre): string {
  const signe = (exercice.signeConnu * exercice.signeCible) as 1 | -1;
  const forme =
    exercice.fonctionConnue === "cos"
      ? simplifierFormeRadicale(1, exercice.carreCibleNum, exercice.p)
      : simplifierFormeRadicale(exercice.p, exercice.carreCibleNum, exercice.carreCibleNum);
  return rendreFormeRadicaleLatex(signe, forme);
}

export const PLACEHOLDER_CARRE = "ex : 7/9";
export const PLACEHOLDER_VALEUR_SIGNEE = "ex : -sqrt(7)/3";
export const PLACEHOLDER_TANGENTE = "ex : -sqrt(7)/7";
