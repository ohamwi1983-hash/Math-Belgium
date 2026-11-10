/**
 * Profils d'instance (tirage équilibré des évaluations, `AdaptateurFeuilleExercices.profilInstance`)
 * des générateurs du chapitre 5 de 4e (« Cercle trigonométrique et triangles quelconques »).
 * Décisions de l'utilisateur (voir `.claude/rules/feuilles-evaluations.md`, « Tirage équilibré ») :
 * par défaut une évaluation ne tire que des exercices COMPLETS ; un cas particulier ne sort que si
 * le professeur coche la case de la ligne (le même dans toutes les séries) ; un VERDICT n'est
 * jamais un cas particulier.
 *
 * Mesures (5 000 tirages par variante, `scratchpad/refonte-4e-ch5/mesure.txt`) :
 * - gen14 : angle réduit dans le quadrant I ≈ 25 % des variantes « angle négatif » et « angle ≥ 360° »
 *   (angle de référence immédiat, trois signes positifs) → cas particulier. La variante « multiple de
 *   90° » est déjà le cas « sur un axe » : c'est un choix de variante, pas un cas.
 * - gen15 : quadrant I ≈ 25 % des variantes 30°/45°/60° (aucune symétrie, aucun signe) → cas
 *   particulier ; la forme « à ramener dans [0° ; 360°[ » (≈ 24 %) est une `forme` (même structure
 *   d'une série à l'autre), sans objet pour 0° et 90° (jamais décalées).
 * - gen16 : quadrant I ≈ 25 % (signe immédiat) → cas particulier ; valeur issue d'un triplet
 *   pythagoricien (résultat rationnel, ≈ 50 %) → paramètre au choix « résultat avec radical ».
 * - gen17 : variantes sin/cos des quadrants II à IV sans passage par le complémentaire (≈ 50 %) →
 *   cas particulier (un palier de moins). La variante « complémentaire directe » et la tangente
 *   n'ont qu'un palier par construction : choix de variante.
 * - gen18 : |k| > 1 (≈ 18 % pour sin/cos) ou valeur sur un axe (k = 0 ou ±1 : ≈ 27 % pour sin/cos,
 *   ≈ 8 % pour tan) → cas particulier, comme 5gen10 (équation sans solution, ou sin, cos = 0 ou ±1).
 * - gen19, gen58 : valeurs décimales, toujours la calculatrice (`calculatriceIndispensable`), aucun
 *   raccourci mesuré. Le nombre de triangles (cas ambigu de la loi des sinus) n'est jamais demandé
 *   ici ; s'il l'était, ce serait un verdict, jamais un cas particulier.
 *
 * `calcul` : absent pour gen14–gen18 — toutes leurs réponses sont exactes (valeurs remarquables,
 * signes, fractions ; gen17 donne les valeurs approchées dans l'énoncé et interdit la calculatrice) :
 * la calculatrice n'y est jamais un critère de tirage (un `'exacte'` partout ferait perdre le cas
 * particulier coché quand le professeur autorise la calculatrice, palier de repli « sans
 * calculatrice »). 'calculatrice' pour gen19 et gen58 (toujours).
 */
import type { ProfilInstance } from "../../export/genererFeuilleExercices";
import type { ExerciceCercleTrigonometrique } from "../core/cercleTrigonometrique.types";
import type { ExerciceValeursRemarquables } from "../core/valeursRemarquables.types";
import type { ExerciceUnSansLautre } from "../core/unSansLautre.types";
import type { ExerciceAnglesAssocies } from "../core/anglesAssocies.types";
import type { ExerciceQuelAngle } from "../core/quelAngle.types";

function cas(liste: (string | false)[]): string | null {
  const presents = liste.filter((c): c is string => !!c);
  return presents.length === 0 ? null : presents.join("+");
}

export const LIBELLE_CAS_QUADRANT_I = "Inclure un cas particulier (angle du premier quadrant : tous les signes positifs)";

/** gen14 — placement et lecture sur le cercle trigonométrique. */
export function profilCercleTrigonometrique(e: ExerciceCercleTrigonometrique): ProfilInstance {
  return { casParticulier: e.quadrant === "I" ? "quadrant-I" : null };
}

/** gen15 — valeurs remarquables. `forme` : angle à ramener dans [0° ; 360°[ ou non (variantes
 * 30°/45°/60° seulement). */
export function profilValeursRemarquables(e: ExerciceValeursRemarquables): ProfilInstance {
  const surAxe = e.quadrant === "axeOx" || e.quadrant === "axeOy";
  return {
    casParticulier: e.quadrant === "I" ? "quadrant-I" : null,
    forme: surAxe ? undefined : e.angleDepart === e.angleReduit ? "direct" : "a-reduire",
  };
}

/** gen16 — l'un sans l'autre. */
export function profilUnSansLautre(e: ExerciceUnSansLautre): ProfilInstance {
  return { casParticulier: cas([e.quadrant === "I" && "quadrant-I", e.typeValeur === "triplet" && "valeur-rationnelle"]) };
}

/** Case du panneau (cochée par défaut) : cochée = valeur donnée quelconque, le résultat garde un
 * radical à simplifier ; décochée = triplet pythagoricien, résultat rationnel. */
export const PARAMETRES_UN_SANS_LAUTRE = [{ id: "valeur-rationnelle", label: "Résultat avec radical (valeur donnée hors triplet pythagoricien)" }];

export const LIBELLE_CAS_ANGLES_ASSOCIES = "Inclure un cas particulier (relation directe, sans passer par le complémentaire)";

/** gen17 — angles associés : variantes sin/cos des quadrants II à IV dont l'angle de référence est
 * déjà α (pas de second palier de co-fonction). Même test que l'écran (`xReference !== alpha`,
 * `necessiteAide3`). */
export function profilAnglesAssocies(e: ExerciceAnglesAssocies): ProfilInstance {
  const sansCofonction = e.variante === "sinCos" && e.quadrant !== "I" && e.xReference === e.alpha;
  return { casParticulier: sansCofonction ? "sans-cofonction" : null };
}

export const LIBELLE_CAS_QUEL_ANGLE = "Inclure un cas particulier (équation sans solution, ou k = 0 ou ±1)";

/** gen18 — trouver l'angle : |k| > 1 se règle en une ligne ; k = 0 ou ±1 tombe sur un axe. */
export function profilQuelAngle(e: ExerciceQuelAngle): ProfilInstance {
  const surAxe = e.angleReference === 0 || e.angleReference === 90;
  return { casParticulier: e.angleReference === null ? "aucune-solution" : surAxe ? "valeur-sur-axe" : null };
}

/** gen19 et gen58 — triangles quelconques et triangles liés : toujours la calculatrice. */
export function profilCalculatrice(): ProfilInstance {
  return { casParticulier: null, calcul: "calculatrice" };
}
