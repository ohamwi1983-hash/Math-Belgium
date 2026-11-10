/**
 * Profils d'instance (tirage équilibré des évaluations, `AdaptateurFeuilleExercices.profilInstance`)
 * des générateurs du chapitre 6 de 4e (« Calcul vectoriel »). Décisions de l'utilisateur (voir
 * `.claude/rules/feuilles-evaluations.md`, « Tirage équilibré ») : par défaut une évaluation ne tire
 * que des exercices COMPLETS ; un cas particulier ne sort que si le professeur coche la case de la
 * ligne (le même dans toutes les séries) ; un VERDICT (colinéaires ou non, orthogonaux ou non,
 * triangle rectangle ou non, isocèle ou non, égalité de vecteurs) n'est JAMAIS un cas particulier.
 *
 * Mesures : voir le commentaire de chaque profil (5 000 tirages par variante,
 * `scratchpad/refonte-4e-ch6/mesure.txt`).
 */
import type { ProfilInstance } from "../../export/genererFeuilleExercices";
import type { ExercicePointVectoriel } from "../core/pointVectoriel.types";
import type { ExerciceRelationVectorielle } from "../core/relationVectorielle.types";
import type { ExerciceCombinaisonVecteurs } from "../core/combinaisonVecteurs.types";
import type { ExerciceConstructionVectorielle } from "../core/constructionVectorielle.types";
import type { ExerciceColinearite } from "../core/colinearite.types";
import type { ExerciceOrthogonalite } from "../core/orthogonalite.types";
import { idCanoniqueRef } from "./combinaisonVecteurs";

export const LIBELLE_CAS_ORIGINE = "Inclure un cas particulier (image de l'origine O : ses coordonnées sont celles du vecteur)";

/** gen20 — point à partir d'une relation vectorielle. Translation de l'origine O (≈ 30 % de la
 * variante « translation ») : les coordonnées de l'image sont directement les composantes du
 * vecteur → cas particulier. `forme` : relation point à point ou combinaison de deux vecteurs (tirée
 * à 50 % dans la variante « relation générale »). */
export function profilPointVectoriel(e: ExercicePointVectoriel): ProfilInstance {
  if (e.variante === "translation") return { casParticulier: e.labelPoint === "O" ? "image-origine" : null };
  if (e.variante === "milieu") return { casParticulier: null };
  return { casParticulier: null, forme: e.forme };
}

/** gen21 — relation vectorielle traduite en différences de points. Même cas particulier que gen20
 * (translation de O, ≈ 30 %) ; `forme` : relation point à point ou milieu (75 / 25 % dans la
 * variante « relation générale »). */
export function profilRelationVectorielle(e: ExerciceRelationVectorielle): ProfilInstance {
  if (e.variante === "translation") return { casParticulier: e.labelPoint === "O" ? "image-origine" : null };
  return { casParticulier: null, forme: e.forme };
}

export const LIBELLE_CAS_COMBINAISON = "Inclure un cas particulier (un vecteur s'élimine à la réduction)";

/** gen22 — composantes d'une combinaison linéaire. Un vecteur de l'expression dont le coefficient
 * réduit est nul (il s'élimine : un terme de moins à calculer) : 0 % (sans parenthèses, parenthèses),
 * ≈ 13 % (vecteur répété), ≈ 16 % (paire AB/BA), ≈ 21 % (complète) → cas particulier. */
export function profilCombinaisonVecteurs(e: ExerciceCombinaisonVecteurs): ProfilInstance {
  const presents = new Set(e.groupes.flatMap((g) => g.termes.map((t) => idCanoniqueRef(t.ref))));
  return { casParticulier: [...presents].some((id) => e.coefficientsReduits[id] === 0) ? "vecteur-elimine" : null };
}

export const LIBELLE_CAS_CONSTRUCTION = "Inclure un cas particulier (coefficient 1 ou −1 : même longueur que le vecteur donné)";

/** gen23 — construction de k·AB. Coefficient ±1 (≈ 33 % : on recopie le vecteur, ou on l'inverse,
 * sans changer sa longueur) → cas particulier. */
export function profilConstructionVectorielle(e: ExerciceConstructionVectorielle): ProfilInstance {
  return { casParticulier: Math.abs(e.coefficient) === 1 ? "coefficient-unite" : null };
}

/** gen24 — colinéarité et alignement. Le résultat (colinéaires / alignés ou non, ≈ 50 / 50) est un
 * VERDICT : jamais filtré. La valeur de x (variantes avec paramètre) est un entier de −4 à 4, sans
 * raccourci mesurable : aucun cas particulier. */
export function profilColinearite(_e: ExerciceColinearite): ProfilInstance {
  return { casParticulier: null };
}

/** gen25 — orthogonalité. Orthogonaux ou non, triangle rectangle ou non et en quel sommet : des
 * VERDICTS, jamais filtrés. Solutions en x entières, sans raccourci : aucun cas particulier. */
export function profilOrthogonalite(_e: ExerciceOrthogonalite): ProfilInstance {
  return { casParticulier: null };
}
