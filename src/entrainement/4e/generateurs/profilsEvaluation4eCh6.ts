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
import type { ExerciceNormeDistance } from "../core/normeDistance.types";
import type { ExerciceReductionVectorielle } from "../core/reductionVectorielle.types";
import type { ExerciceComparaisonVecteurs } from "../core/comparaisonVecteurs.types";
import type { ExerciceApplicationPhysique } from "../core/applicationPhysique.types";
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

export const LIBELLE_CAS_NORME_ENTIERE = "Inclure un cas particulier (norme entière : aucune racine à simplifier)";

/** gen26 — norme et distance. Variantes « norme d'un vecteur » et « distance » : norme entière
 * (triplet pythagoricien, ≈ 50 % par construction) → cas particulier (pas de racine à écrire ni à
 * simplifier). Isocèle ou scalène, rectangle ou non, nombre de solutions (variante « paramètre ») :
 * des VERDICTS, jamais filtrés. */
export function profilNormeDistance(e: ExerciceNormeDistance): ProfilInstance {
  if (e.variante === "vecteur") return { casParticulier: Number.isInteger(Math.sqrt(e.normeCarree)) ? "norme-entiere" : null };
  if (e.variante === "distance") return { casParticulier: Number.isInteger(Math.sqrt(e.distanceCarree)) ? "norme-entiere" : null };
  return { casParticulier: null };
}

/** gen27 — réduction d'une somme de vecteurs sur une figure. 0, 1 ou 2 paires de termes opposés
 * (k·RS + k·SR, tirées à parts égales : ≈ 33 % sans aucune paire) : paramètre au choix du
 * professeur, présent dans les 4 figures (case cochée = au moins une paire à éliminer). */
export const PARAMETRES_REDUCTION = [{ id: "sans-paire-opposee", label: "Paire de termes opposés à éliminer" }];

export function profilReductionVectorielle(e: ExerciceReductionVectorielle): ProfilInstance {
  const t = e.termes;
  const paire = t.some((a, i) => t.some((b, j) => j > i && a.origine === b.arrivee && a.arrivee === b.origine && a.coefficient === b.coefficient));
  return { casParticulier: paire ? null : "sans-paire-opposee" };
}

/** gen28 — comparaison de vecteurs sur une figure. Qui a la même longueur, direction ou sens que la
 * référence : des VERDICTS (le nombre de bonnes réponses varie avec la figure), jamais filtrés.
 * La propriété est la variante : aucun cas particulier. */
export function profilComparaisonVecteurs(_e: ExerciceComparaisonVecteurs): ProfilInstance {
  return { casParticulier: null };
}

/** gen29 — résultante de deux vecteurs (vitesses, forces). Racine, cosinus et arc sinus ou arc
 * tangente : TOUJOURS la calculatrice (`calculatriceIndispensable`). Direction Nord ou Sud de la
 * résultante : un VERDICT, jamais filtré. Le contexte (avion, hélicoptère, forces) est neutre. */
export function profilApplicationPhysique(_e: ExerciceApplicationPhysique): ProfilInstance {
  return { casParticulier: null, calcul: "calculatrice" };
}
