/**
 * Profils d'instance (tirage équilibré des évaluations, `AdaptateurFeuilleExercices.profilInstance`)
 * des générateurs « cercles, paraboles, lieux » du chapitre 7 de 4e (« Géométrie analytique
 * plane », gen49–gen54). Décisions de l'utilisateur (`.claude/rules/feuilles-evaluations.md`,
 * « Tirage équilibré ») : par défaut une évaluation ne tire que des exercices COMPLETS ; les
 * paramètres neutres sont au choix du professeur (cases « Paramètres à inclure ») ; la série A fixe
 * la structure (forme) que reproduisent les autres séries.
 *
 * Mesures (5 000 tirages par variante, `scratchpad/refonte-4e-ch7b/mesure.txt`) :
 * - gen49 (centre dans [−4 ; 4]²) : abscisse du centre nulle ≈ 11 %, ordonnée nulle ≈ 11 % (le
 *   binôme se réduit à x² ou y², rien à soustraire). Rayon entier en lecture indirecte (triplet
 *   3-4-5) ≈ 12,5 % : n'abrège rien (R² entre directement dans l'équation) → pas un paramètre.
 * - gen50 : coefficient commun k = 1 ≈ 25 % (pas de division), centre à coordonnées entières
 *   (A et B pairs) ≈ 27 % en rayon rationnel, ≈ 23 % en irrationnel. L'équation représente
 *   toujours un cercle (r² > 0 par construction) : aucun verdict « est-ce un cercle ? » à filtrer.
 * - gen51 / gen52 (sommet dans [−3 ; 3]²) : abscisse du sommet nulle ≈ 14 %, ordonnée nulle
 *   ≈ 14 % — en gen52, la coordonnée du sommet le long de la variable au carré nulle supprime la
 *   complétion du carré (raccourci réel). gen52 : coefficient du carré a = 1 ≈ 25 % (pas de mise
 *   en évidence). L'orientation (axe vertical / horizontal) EST la variante.
 * - gen53 : aucun paramètre (foyer à 2 ou 4 carreaux de la directrice, angle de la grille) → pas
 *   de profil.
 * - gen54 : le nombre de points d'intersection est un VERDICT (et la variante choisie par le
 *   professeur) → jamais un cas particulier. L'orientation de la parabole (droite-parabole) change
 *   la substitution (en x ou en y) : c'est la `forme`, reproduite d'une série à l'autre.
 *
 * `calcul` est absent partout : toutes les valeurs sont exactes (rayons sous forme de racine), la
 * calculatrice n'apporte rien et n'est jamais indispensable.
 */
import type { ProfilInstance } from "../../export/genererFeuilleExercices";
import type { ExerciceEquationCercle } from "../core/equationCercle.types";
import type { ExerciceEquationCercleDeveloppee } from "../core/equationCercleDeveloppee.types";
import type { ExerciceEquationParabole } from "../core/equationParabole.types";
import type { ExerciceEquationParaboleDeveloppee } from "../core/equationParaboleDeveloppee.types";
import type { ExerciceLieuxGeometriques } from "../core/lieuxGeometriques.types";

function cas(liste: (string | false)[]): string | null {
  const presents = liste.filter((c): c is string => !!c);
  return presents.length === 0 ? null : presents.join("+");
}

// ---------------------------------------------------------------------------------------------
// gen49 — équation d'un cercle lue sur un graphe
// ---------------------------------------------------------------------------------------------

/** Une case décochée impose la coordonnée du centre NULLE (binôme réduit à x² ou y²). */
export const PARAMETRES_CENTRE_CERCLE = [
  { id: "centre-abscisse-nulle", label: "Abscisse du centre non nulle" },
  { id: "centre-ordonnee-nulle", label: "Ordonnée du centre non nulle" },
];

export function profilEquationCercle(e: ExerciceEquationCercle): ProfilInstance {
  return { casParticulier: cas([e.centre.x === 0 && "centre-abscisse-nulle", e.centre.y === 0 && "centre-ordonnee-nulle"]) };
}

// ---------------------------------------------------------------------------------------------
// gen50 — centre et rayon depuis l'équation développée
// ---------------------------------------------------------------------------------------------

/** Coefficient commun k = 1 (aucune division) ; centre à coordonnées entières (aucune fraction
 * dans la complétion du carré). */
export const PARAMETRES_CERCLE_DEVELOPPE = [
  { id: "k-egal-1", label: "Coefficient commun de x² et y² différent de 1" },
  { id: "centre-entier", label: "Centre à coordonnées fractionnaires" },
];

export function profilEquationCercleDeveloppee(e: ExerciceEquationCercleDeveloppee): ProfilInstance {
  return { casParticulier: cas([e.k === 1 && "k-egal-1", Number.isInteger(e.centre.x) && Number.isInteger(e.centre.y) && "centre-entier"]) };
}

// ---------------------------------------------------------------------------------------------
// gen51 / gen52 — parabole (sommet S entier)
// ---------------------------------------------------------------------------------------------

export const PARAMETRES_SOMMET_PARABOLE = [
  { id: "sommet-abscisse-nulle", label: "Abscisse du sommet non nulle" },
  { id: "sommet-ordonnee-nulle", label: "Ordonnée du sommet non nulle" },
];

function marqueursSommet(sommet: { x: number; y: number }): (string | false)[] {
  return [sommet.x === 0 && "sommet-abscisse-nulle", sommet.y === 0 && "sommet-ordonnee-nulle"];
}

export function profilEquationParabole(e: ExerciceEquationParabole): ProfilInstance {
  return { casParticulier: cas(marqueursSommet(e.sommet)) };
}

/** gen52 : les deux coordonnées du sommet + le coefficient du carré (a = 1 : pas de mise en
 * évidence). */
export const PARAMETRES_PARABOLE_DEVELOPPEE = [...PARAMETRES_SOMMET_PARABOLE, { id: "a-egal-1", label: "Coefficient du carré différent de 1" }];

export function profilEquationParaboleDeveloppee(e: ExerciceEquationParaboleDeveloppee): ProfilInstance {
  return { casParticulier: cas([...marqueursSommet(e.sommet), e.a === 1 && "a-egal-1"]) };
}

// ---------------------------------------------------------------------------------------------
// gen54 — intersection de deux lieux
// ---------------------------------------------------------------------------------------------

export function profilLieuxGeometriques(e: ExerciceLieuxGeometriques): ProfilInstance {
  if (e.paire !== "droiteParabole") return { casParticulier: null };
  const parabole = e.lieu1.type === "parabole" ? e.lieu1 : e.lieu2;
  return { casParticulier: null, forme: parabole.type === "parabole" ? parabole.orientation : undefined };
}
