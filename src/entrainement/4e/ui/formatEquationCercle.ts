/**
 * Couche présentation — "Équation d'un cercle (non développée) à partir d'un graphe"
 * (`src/generateurs/equationCercle/`, `src/moteur/sessionEquationCercle.ts`). Consignes/textes
 * d'aide/rappels d'état actuel par écran — dérivés uniquement des champs déjà présents sur le
 * contrat, jamais recalculés différemment côté vérification (`moteur/verificationEquationCercle.ts`).
 *
 * Graphe-first, comme "Lecture graphique — équation d'une droite" (gen43) : jamais de bloc
 * `equation-box` révélant le centre/rayon en texte — c'est justement ce que l'élève doit déterminer
 * à partir du graphe. L'aide de niveau 2 des écrans "centre"/"rayon" révèle une donnée
 * supplémentaire SUR LE GRAPHE lui-même (le centre marqué, le segment du rayon tracé), jamais un
 * texte donnant directement la réponse numérique.
 */
import type { ExerciceEquationCercle, VarianteEquationCercle } from "../core/equationCercle.types";
import { nombreFrLatex } from "./nombreFr";
import { formatLongueurIrreductibleLatex } from "./formatNormeDistance";

export { formatPointLatex } from "./formatEquationDroite";

export const LIBELLE_VARIANTE: Record<VarianteEquationCercle, string> = {
  rayon_direct: "Rayon lu directement sur la grille",
  rayon_indirect: "Rayon retrouvé par la distance (Pythagore)",
};

/** Consigne générale — rappelle l'objectif complet de l'exercice, affichée sur les 3 écrans
 * (`promptgen49gen50modifications.md`, partie A.1) : les 2 écrans de lecture (centre, rayon) ET
 * l'écran de l'équation, jamais seulement l'un des trois. */
export const CONSIGNE_GENERALE_EQUATION_CERCLE = "Détermine l'équation cartésienne du cercle suivant :";

// ============================================================================
// Écran 1 — centre.
// ============================================================================

export const CONSIGNE_CENTRE = "Détermine les coordonnées du centre de ce cercle.";

export const TEXTE_AIDE_CENTRE_NIVEAU1 =
  "Le centre est le point équidistant de tous les points du cercle — c'est le point situé exactement au milieu du cercle tracé, quelle que soit la direction dans laquelle tu regardes.";

export const TEXTE_AIDE_CENTRE_NIVEAU2 = "Le centre est désormais marqué en vert sur le graphe ci-dessus.";

// ============================================================================
// Écran 2 — rayon.
// ============================================================================

export const CONSIGNE_RAYON = "Détermine le rayon de ce cercle.";

/** `rayon_indirect` donne le plus souvent un rayon irrationnel (√13…) : la forme attendue est
 * annoncée, jamais laissée à deviner. */
export function consigneRayon(exercice: ExerciceEquationCercle): string {
  if (exercice.variante === "rayon_direct") return CONSIGNE_RAYON;
  return "Détermine le rayon de ce cercle — valeur exacte (par exemple √13) ou arrondie au centième.";
}

export function texteAideRayonNiveau1(exercice: ExerciceEquationCercle): string {
  if (exercice.variante === "rayon_direct") {
    return "Le point marqué est aligné avec le centre sur un axe de la grille : compte directement le nombre de cases qui les séparent.";
  }
  return "Le point marqué n'est pas aligné avec le centre : utilise le théorème de Pythagore à partir des écarts horizontal et vertical entre le centre et ce point. Le rayon n'est pas forcément entier — tu peux le laisser sous forme de racine.";
}

export function texteAideRayonNiveau2(exercice: ExerciceEquationCercle): string {
  if (exercice.variante === "rayon_direct") {
    return "Le segment entre le centre et le point marqué est maintenant tracé sur le graphe — compte le nombre de cases qui les séparent.";
  }
  return "Le segment entre le centre et le point marqué est maintenant tracé sur le graphe. Applique le théorème de Pythagore avec les écarts horizontal et vertical :";
}

/** Écart élevé au carré — parenthèses uniquement autour d'un négatif (`(-2)^2`, jamais `-2^2`, qui
 * se lirait `-(2^2)`, ni `(3)^2` superflu). */
function formatEcartCarreLatex(ecart: number): string {
  return ecart < 0 ? `(${ecart})^2` : `${ecart}^2`;
}

/** Formule substituée (écarts réels), jamais résolue — `null` pour `rayon_direct`, où compter les
 * cases suffit et où la calculer reviendrait à donner la réponse. */
export function formatAideRayonNiveau2Latex(exercice: ExerciceEquationCercle): string | null {
  if (exercice.variante === "rayon_direct") return null;
  const dx = exercice.pointMarque.x - exercice.centre.x;
  const dy = exercice.pointMarque.y - exercice.centre.y;
  return `R = \\sqrt{${formatEcartCarreLatex(dx)} + ${formatEcartCarreLatex(dy)}}`;
}

/** Rayon exact, racine simplifiée (`2\sqrt{5}`, jamais `\sqrt{20}`), suivi de sa valeur arrondie
 * au centième quand il est irrationnel. */
export function formatRayonLatex(exercice: ExerciceEquationCercle): string {
  const exact = formatLongueurIrreductibleLatex(exercice.rayonCarre);
  if (Number.isInteger(exercice.rayon)) return exact;
  return `${exact} \\approx ${nombreFrLatex(Math.round(exercice.rayon * 100) / 100)}`;
}

/** Centre CONFIRMÉ à l'écran 1 — toujours la vraie valeur de l'exercice, jamais la saisie de
 * l'élève (même principe que le reste du projet). VALEUR seule, jamais « Centre = » : le
 * récapitulatif et `ValidationEcran` portent déjà leur propre libellé (audit chapitre 7, point 43). */
export function formatEtatActuelCentreLatex(exercice: ExerciceEquationCercle): string {
  return `(${exercice.centre.x} \\; ; \\; ${exercice.centre.y})`;
}

// ============================================================================
// Écran 3 — équation.
// ============================================================================

export const CONSIGNE_EQUATION = "Écris l'équation de ce cercle, sous sa forme NON développée.";

export const LATEX_GABARIT_EQUATION = "(x - x_0)^2 + (y - y_0)^2 = R^2";

/** Équation équivalente mais développée (ou mal structurée) — audit chapitre 7, point 42 : elle
 * était acceptée alors que la consigne demande la forme NON développée. */
export const MESSAGE_FORME_DEVELOPPEE =
  "Ton équation décrit bien ce cercle, mais elle n'est pas sous la forme demandée : écris-la (x − x₀)² + (y − y₀)² = R², sans développer";

/** Prose seule — la formule générale (`LATEX_GABARIT_EQUATION`) est déjà rendue juste après en
 * KaTeX (`EtapeEquationEquationCercle.tsx`), jamais dupliquée ici en notation Unicode brute. */
export const TEXTE_AIDE_EQUATION_NIVEAU1 = "Un cercle de centre (x₀ ; y₀) et de rayon R a pour équation (jamais développée à ce stade) :";

/** "x - a" ou "x + |a|" — jamais "x - (-3)" (double signe) ; "a=0" retourne la variable nue ("x"),
 * jamais "x - 0" (correction transversale chapitre 6, point 1). */
function formatBinomeCentre(variable: "x" | "y", valeur: number): string {
  if (valeur === 0) return variable;
  return valeur > 0 ? `${variable} - ${valeur}` : `${variable} + ${-valeur}`;
}

/** Parenthèses UNIQUEMENT si le binôme est composé, jamais autour de la variable nue, qui
 * donnerait "(x)²" superflu (audit transversal, `promptauditparenthesessuperflues.md`). */
function formatBinomeCentreCarreLatex(variable: "x" | "y", valeur: number): string {
  const binome = formatBinomeCentre(variable, valeur);
  return valeur === 0 ? `${binome}^2` : `(${binome})^2`;
}

/** Réponse attendue exacte (révélation du panneau de résultat) — dérivée directement du contrat,
 * jamais de la saisie de l'élève. Signe toujours simplifié (jamais "- (-3)"), coefficient nul
 * jamais affiché littéralement (jamais "x - 0"). */
export function formatEquationAttendueLatex(exercice: ExerciceEquationCercle): string {
  const { centre, rayonCarre } = exercice;
  return `${formatBinomeCentreCarreLatex("x", centre.x)} + ${formatBinomeCentreCarreLatex("y", centre.y)} = ${rayonCarre}`;
}

/** Exemples de saisie choisis HORS de l'espace des tirages (centre dans [−4 ; 4]², R ≤ 5 en lecture
 * directe, R² ≤ 32 en lecture indirecte) — un placeholder ne vaut jamais la réponse (audit
 * chapitre 7, point 10). */
export const PLACEHOLDER_COORDONNEE = "ex : 7";
export function placeholderRayon(exercice: ExerciceEquationCercle): string {
  return exercice.variante === "rayon_direct" ? "ex : 7" : "ex : √57";
}
export const PLACEHOLDER_EQUATION = "ex : (x-5)^2+(y+6)^2=9";
