/**
 * Profils d'instance (tirage équilibré des évaluations, `AdaptateurFeuilleExercices.profilInstance`)
 * des générateurs du chapitre 3 de 5e (« Suites »). Décisions de l'utilisateur (voir
 * `.claude/rules/feuilles-evaluations.md`, « Tirage équilibré ») : par défaut une évaluation ne tire
 * que des exercices COMPLETS ; un cas particulier ne sort que si le professeur coche « inclure un cas
 * particulier » (même cas dans toutes les séries) ; calculatrice interdite → calculs faisables à la
 * main ; autorisée → seulement des cas qui l'exigent. Les générateurs interactifs gardent toute leur
 * variété.
 *
 * Ce qui est VOULU par la variante choisie (famille « cohérence » de 5gen14, régime divergent de
 * 5gen19, classification à trouver en 5gen16…) n'est jamais filtré : seul compte ce qui RACCOURCIT
 * la résolution à l'intérieur de la variante. Mesures (5 000 tirages par variante) : voir le
 * commentaire de chaque profil.
 *
 * Sans profil : 5gen17 (problèmes classiques : un scénario par variante, aucun raccourci ni calcul
 * qui varie d'un tirage à l'autre) et 5gen18 (comparaison : bascule après le rang 3 dans plus de
 * 99,7 % des tirages ; calculatrice déterminée par la famille, donc par le choix du professeur).
 */
import type { ProfilInstance } from "../../export/genererFeuilleExercices";
import type { ExerciceSuiteArithmetique } from "../core5e/suitesArithmetiques.types";
import type { ExerciceSuiteGeometrique, FractionQ } from "../core5e/suitesGeometriques.types";
import type { ExerciceConvergenceSuite } from "../core5e/convergenceSuites.types";
import type { ExerciceSuiteRecurrenteAffine } from "../core5e/suiteRecurrenteAffine.types";

function cas(liste: (string | false)[]): string | null {
  const presents = liste.filter((c): c is string => !!c);
  return presents.length === 0 ? null : presents.join("+");
}

export const LIBELLE_CAS_ARITHMETIQUE = "Inclure un cas particulier (u₁ et r donnés directement)";

/** 5gen14 — « direct » (u₁ et r donnés : rien à retrouver, 20 % de la variante principale) et
 * données incohérentes (la résolution s'arrête au jugement, 51 % de la famille « cohérence »).
 * Familles algébriques : x entier ou fractionnaire, aucun raccourci. Tout se calcule à la main :
 * `calcul` sans objet. */
export function profilSuiteArithmetique(e: ExerciceSuiteArithmetique): ProfilInstance {
  if (e.famille === "principal") return { casParticulier: e.donnees.combo === "direct" ? "donnees-directes" : null };
  // Famille « cohérence » : le verdict EST la question — le filtrer rendrait la réponse prévisible.
  return { casParticulier: null };
}

export const LIBELLE_CAS_GEOMETRIQUE = "Inclure un cas particulier (u₁ et q donnés directement, ou somme infinie inexistante)";

function pgcd(a: bigint, b: bigint): bigint {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b) [a, b] = [b, a % b];
  return a;
}

/** uₙ = u₁·qⁿ⁻¹ en rationnel exact (BigInt : 2⁶³ n'est pas exact en flottant). */
function terme(u1: FractionQ, q: FractionQ, n: number): { num: bigint; den: bigint } {
  const num = BigInt(u1.num) * BigInt(q.num) ** BigInt(n - 1);
  const den = BigInt(u1.den) * BigInt(q.den) ** BigInt(n - 1);
  const g = pgcd(num, den) || 1n;
  return { num: num / g, den: den / g };
}

/** Faisable à la main : numérateur ≤ 100 000 et dénominateur ≤ 1 000 (après simplification). */
function calculableMain(f: { num: bigint; den: bigint }): boolean {
  return (f.num < 0n ? -f.num : f.num) <= 100000n && (f.den < 0n ? -f.den : f.den) <= 1000n;
}

/** 5gen15, variante principale — raccourcis : « direct » (u₁ et q donnés, 25 %), une seule valeur
 * de q quand q est à retrouver (exposant impair, u₁/uₚ et uₚ/uₘ) et somme infinie inexistante
 * (|q| ≥ 1, 64 %). Complets : environ 17 % des tirages. Calculatrice : un des termes demandés
 * (proches, éloigné) ou des termes de la somme trop lourd à la main (environ 16 % des tirages,
 * surtout q fractionnaire). Familles algébriques : aucun raccourci, `calcul` sans objet. */
export function profilSuiteGeometrique(e: ExerciceSuiteGeometrique): ProfilInstance {
  if (e.famille !== "principal") return { casParticulier: null };
  const { u1, q } = e.branches[0];
  const qVal = q.num / q.den;
  const indices = [...e.indicesTermesProches, e.indiceTermeEloigne, e.indiceSn];
  return {
    casParticulier: cas([
      e.donnees.combo === "direct" && "donnees-directes",
      // « Une ou deux valeurs de q » se décide par la parité de l'exposant : c'est un raisonnement, pas un raccourci.
      Math.abs(qVal) >= 1 && "somme-infinie-inexistante",
    ]),
    calcul: indices.every((n) => calculableMain(terme(u1, q, n))) ? "exacte" : "calculatrice",
  };
}

export const LIBELLE_CAS_CONVERGENCE = "Inclure un cas particulier (suite constante : r = 0 ou q = 1)";

/** 5gen16 — la seule classification qui se lit en une ligne est la suite constante (r = 0 : 32 %
 * de la variante arithmétique ; q = 1 : 20 % de la géométrique). Les autres classes (±∞, 0, q = −1,
 * oscillation) sont la compétence demandée. Limites exactes : `calcul` sans objet. */
export function profilConvergenceSuite(e: ExerciceConvergenceSuite): ProfilInstance {
  // La nature de la suite (dont « constante ») EST la réponse demandée : jamais filtrée (sinon prévisible).
  void e;
  return { casParticulier: null };
}

/** 5gen19 — régime convergent ou divergent : choix du professeur (variante), jamais filtré.
 * u₁ = L (suite constante) : 0,1 % des tirages, exclu par défaut, sans case (trop rare pour être
 * tiré à la demande). Calcul : termes Q₂, Q₃, Q₄ et limite L exacts au centième (dénominateur qui
 * divise 100 : calcul à la main) ou à arrondir (calculatrice, environ 95 % des tirages). */
export function profilSuiteRecurrenteAffine(e: ExerciceSuiteRecurrenteAffine): ProfilInstance {
  const exacts = [e.u2, e.u3, e.u4, ...(e.L ? [e.L] : [])].every((f) => 100 % f.den === 0);
  const constante = !!e.L && e.L.num === e.u1 * e.L.den;
  return { casParticulier: constante ? "suite-constante" : null, calcul: exacts ? "exacte" : "calculatrice" };
}
