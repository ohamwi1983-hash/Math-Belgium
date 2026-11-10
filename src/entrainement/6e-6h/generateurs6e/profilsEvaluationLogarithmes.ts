/**
 * Profils d'instance (tirage équilibré des évaluations, `AdaptateurFeuilleExercices.profilInstance`)
 * des générateurs du chapitre 3 de 6e (« Fonctions logarithmes »). Décisions de l'utilisateur
 * (`.claude/rules/feuilles-evaluations.md`, section « Tirage équilibré ») :
 * - par défaut, une évaluation ne tire que des exercices COMPLETS (toutes les étapes à faire, aucun
 *   raccourci ni paramètre neutre) ; un cas particulier ne sort que si le professeur coche « inclure
 *   un cas particulier » pour la ligne — et c'est alors le même cas dans toutes les séries ;
 * - calculatrice interdite → seulement des valeurs exactes (puissances reconnaissables : log₂(8)…) ;
 *   autorisée → seulement des cas qui exigent la calculatrice (`calcul`). `calcul` est ABSENT quand
 *   la variante n'a qu'un seul régime (toujours exacte, ou toujours décimale comme les problèmes en
 *   contexte) : aucune contrainte ne s'y applique alors.
 * Un vrai cas pédagogique (une racine rejetée par la condition d'existence, une base < 1 qui inverse
 * le sens) n'est PAS un cas particulier. Une variante dont TOUTES les instances partagent un trait
 * (famille G de 6gen14 « toujours vrai / toujours faux », famille F de 6gen15) non plus : c'est le
 * professeur qui l'a choisie.
 *
 * Générateurs sans profil (mesures sur 5 000 tirages par variante, voir le rapport) : 6gen13 (calcul
 * littéral, structure fixée par la variante), 6gen17 (limites : structure fixée par la sous-famille,
 * valeurs exactes), 6gen20 (choix d'un graphique), 6gen22 (problèmes en contexte : toujours
 * décimaux, calculatrice indispensable quelle que soit l'instance).
 *
 * Plusieurs caractéristiques à la fois → identifiants joints par « + » (jamais tirés pour la case).
 */
import type { ProfilInstance } from "../../export/genererFeuilleExercices";
import type { ExerciceEquationsExpLog } from "../core6e/equationsExpLog.types";
import type { ExerciceInequationLogarithmique } from "../core6e/inequationsLogarithmiques.types";
import type { ExerciceDomaineDeriveeLogarithme } from "../core6e/domaineDeriveeLogarithme.types";
import type { ExerciceDeterminerParametresLogarithme } from "../core6e/determinerParametresLogarithme.types";
import type { ExerciceHyperboliques } from "../core6e/hyperboliques.types";
import type { ExerciceEtudeFonctionLogarithme } from "../core6e/etudeFonctionLogarithme.types";

function cas(liste: (string | false)[]): string | null {
  const presents = liste.filter((c): c is string => !!c);
  return presents.length === 0 ? null : presents.join("+");
}

const estEntier = (v: number) => Math.abs(v - Math.round(v)) < 1e-9;

// ---------------------------------------------------------------------------------------------
// 6gen14 — équations exponentielles et logarithmiques
// ---------------------------------------------------------------------------------------------

export const LIBELLE_CAS_EQUATIONS_EXP_LOG = "Inclure un cas particulier (second membre égal à 1, log égal à 0 ou 1, aucune solution)";

/**
 * - A `base^(mx+n) = C` : C puissance reconnaissable de la base → exacte (sans calculatrice), sinon
 *   calculatrice ; C = 1 (exposant 0) est un cas particulier.
 * - B (deux bases) : x entier → exacte, sinon calculatrice (≈ 95 %).
 * - C (substitution t) : aucune valeur de t positive → « aucune solution » (cas particulier) ; x
 *   tous entiers → exacte, sinon calculatrice.
 * - D `log_a(x) = k` : k = 0 ou 1 (x = 1 ou x = a) est un cas particulier ; toujours exacte.
 * - E (combiner des logs) : les deux racines rejetées → « aucune solution » ; toujours exacte.
 * - G : variante entière « toujours vrai / toujours faux » (choix du professeur).
 */
export function profilEquationsExpLog(e: ExerciceEquationsExpLog): ProfilInstance {
  switch (e.famille) {
    case "A":
      return { casParticulier: e.estPuissancePropre && e.p === 0 ? "second-membre-1" : null, calcul: e.estPuissancePropre ? "exacte" : "calculatrice" };
    case "B":
      return { casParticulier: null, calcul: estEntier(e.x) ? "exacte" : "calculatrice" };
    case "C":
      if (e.tValides.length === 0) return { casParticulier: "aucune-solution" };
      return { casParticulier: null, calcul: e.xValides.every(estEntier) ? "exacte" : "calculatrice" };
    case "D":
      return { casParticulier: e.k === 0 || e.k === 1 ? "log-egal-0-ou-1" : null };
    case "E":
      return { casParticulier: e.solutionsFinales.length === 0 ? "aucune-solution" : null };
    default:
      return { casParticulier: null };
  }
}

// ---------------------------------------------------------------------------------------------
// 6gen15 — inéquations logarithmiques (valeurs toujours exactes : `calcul` sans objet)
// ---------------------------------------------------------------------------------------------

export const LIBELLE_CAS_INEQUATIONS_LOG = "Inclure un cas particulier (second membre nul, trinôme en y sans terme constant ou sans terme en y, condition d'existence impossible)";

/**
 * - A `log_b(mx+n) ⋚ k` : k = 0 (l'argument se compare directement à 1) est un cas particulier.
 * - D (trinôme en y = log x) : C = 0 (une racine nulle, factorisation immédiate) et B = 0 (y² isolé
 *   directement) sont des cas particuliers — sinon il faut résoudre le second degré.
 * - E : condition d'existence incompatible → l'exercice s'arrête à la reconnaissance (cas
 *   particulier, ≈ 50 % des tirages).
 */
export function profilInequationsLogarithmiques(e: ExerciceInequationLogarithmique): ProfilInstance {
  switch (e.famille) {
    case "A":
      return { casParticulier: e.k === 0 ? "second-membre-nul" : null };
    case "D":
      return { casParticulier: cas([e.C === 0 && "racine-nulle", e.B === 0 && "sans-terme-en-y"]) };
    case "E":
      return { casParticulier: e.ceCompatible ? null : "ce-incompatible" };
    default:
      return { casParticulier: null };
  }
}

// ---------------------------------------------------------------------------------------------
// 6gen16 — domaine, dérivée, dérivation logarithmique (calcul littéral : `calcul` sans objet)
// ---------------------------------------------------------------------------------------------

export const LIBELLE_CAS_DOMAINE_DERIVEE_LOG = "Inclure un cas particulier (dérivation logarithmique avec coefficient 1 : x^x, x^(sin x), (cos x)^(tan x))";

/** Famille G : le coefficient multiplicatif `a` de l'exposant ou de l'argument vaut 1 (x^x au lieu de
 * x^(2x), sin(x) au lieu de sin(2x), tan x au lieu de 2·tan x) — un facteur de dérivée en moins.
 * Seulement pour les variantes où `a` MULTIPLIE (pas pour (1 + a/x)^x, (a + x)…, ni pour les
 * variantes à `a` fixé). */
export function profilDomaineDeriveeLogarithme(e: ExerciceDomaineDeriveeLogarithme): ProfilInstance {
  if (e.famille === "G" && (e.variante === "xx" || e.variante === "xSinx" || e.variante === "cosTan") && e.a === 1) return { casParticulier: "coefficient-1" };
  return { casParticulier: null };
}

// ---------------------------------------------------------------------------------------------
// 6gen18 — f(x) = a + b·ln(x) depuis le graphique
// ---------------------------------------------------------------------------------------------

/** Paramètres de f(x) = a + b·ln(x) que le professeur choisit d'inclure (cases cochées par défaut). */
export const PARAMETRES_LOG = [
  { id: "a-nul", label: "a ≠ 0" },
  { id: "b-egal-1", label: "b ≠ ±1" },
];

/** a = 0 (la courbe passe par (1 ; 0)) et b = ±1 sont des paramètres neutres (≈ 17 % et 33 %). */
export function profilDeterminerParametresLogarithme(e: ExerciceDeterminerParametresLogarithme): ProfilInstance {
  return { casParticulier: cas([e.a === 0 && "a-nul", Math.abs(e.b) === 1 && "b-egal-1"]) };
}

// ---------------------------------------------------------------------------------------------
// 6gen19 — sinus et cosinus hyperboliques
// ---------------------------------------------------------------------------------------------

export const LIBELLE_CAS_HYPERBOLIQUES = "Inclure un cas particulier (sh(x) ou ch(x) sans coefficient dans l'argument)";

/** a·sh(kx), a·ch(kx) (famille A) et a·sh(kx) + b·ch(kx) (famille C) : k = 1 supprime le facteur de
 * la dérivée en chaîne (≈ 33 %). Valeurs toujours exactes (radicaux) : `calcul` sans objet. */
export function profilHyperboliques(e: ExerciceHyperboliques): ProfilInstance {
  const k = (e as { k?: number }).k;
  const concerne = (e.famille === "A" && (e.type === "shKx" || e.type === "chKx")) || e.famille === "C";
  return { casParticulier: concerne && k === 1 ? "k-egal-1" : null };
}

// ---------------------------------------------------------------------------------------------
// 6gen21 — étude complète d'une fonction logarithmique
// ---------------------------------------------------------------------------------------------

export const LIBELLE_CAS_ETUDE_LOG = "Inclure un cas particulier (sans constante c, ou trinôme centré en 0)";

/**
 * - A `k(ln x + c)/x` et B `(bx)^{ax} + c` : c = 0 (≈ 20–25 %) supprime un décalage — A devient
 *   l'exemple du cours ln(x)/x à un facteur près.
 * - C `m·ln|x² + βx + γ|` et D `m·ln(x² + βx + γ)` : p = 0 (≈ 20 %) centre le trinôme en 0 (β = 0),
 *   extremum et symétrie en x = 0.
 */
export function profilEtudeFonctionLogarithme(e: ExerciceEtudeFonctionLogarithme): ProfilInstance {
  switch (e.famille) {
    case "A":
    case "B":
      return { casParticulier: e.c === 0 ? "sans-constante" : null };
    case "C":
    case "D":
      return { casParticulier: e.p === 0 ? "trinome-centre-en-0" : null };
    default:
      return { casParticulier: null };
  }
}
