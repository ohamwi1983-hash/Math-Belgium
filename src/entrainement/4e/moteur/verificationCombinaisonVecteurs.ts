/**
 * Couche B — vérification pour "Calcul de composantes de combinaisons linéaires" (chapitre "Calcul
 * vectoriel"). Remplace en place l'ancienne vérification de ce même générateur — voir
 * `core/combinaisonVecteurs.types.ts` pour le contraste complet.
 *
 * **Écran 1 — champ de saisie libre unique** (`promptcorrectionsgenerateur21notationinterface.md`,
 * correction 4 — remplace l'interface "add-as-needed" d'une réécriture précédente) : l'élève écrit
 * directement l'expression réduite complète en une seule fois (ex. `-3u+3v+12AB`). Délègue
 * entièrement à `expressionVectorielle.ts::diagnostiquerCombinaisonVecteurs`/`parserCombinaisonVecteurs`
 * — module déjà partagé par d'autres générateurs du chapitre pour ce même type de notation
 * vectorielle en texte (une somme signée de termes `[coefficient]nom`, aucune parenthèse, premier
 * terme au signe optionnel, virgule décimale tolérée) — plutôt que de réimplémenter un second
 * parseur. `nomsValides` = `exercice.baseCanonique` (jamais "BA", voir le contrat — un id absent du
 * texte vaut implicitement 0, même convention que "0 est une valeur valide").
 *
 * **Écran 2 — calcul numérique**, mêmes primitives que "Point à partir d'une relation vectorielle"
 * (position 20) : statut à 3 valeurs sur CHAQUE champ séparément (`diagnostiquerX`/`diagnostiquerY`),
 * pour isoler une éventuelle erreur de signe sur une seule coordonnée — consommé par le composant
 * d'écran pour marquer en rouge le seul champ fautif, en direct.
 */
import type { ExerciceCombinaisonVecteurs } from "../core/combinaisonVecteurs.types";
import type { StatutVerification } from "./statutVerification";
import { diagnostiquerCombinaisonVecteurs } from "./expressionVectorielle";

export function diagnostiquerSimplification(exercice: ExerciceCombinaisonVecteurs, texte: string): StatutVerification {
  return diagnostiquerCombinaisonVecteurs(texte, exercice.baseCanonique, exercice.coefficientsReduits);
}

export function verifierSimplification(exercice: ExerciceCombinaisonVecteurs, texte: string): boolean {
  return diagnostiquerSimplification(exercice, texte) === "correct";
}

const TOLERANCE_COMPOSANTES = 0.01;

export function diagnostiquerX(exercice: ExerciceCombinaisonVecteurs, x: number): StatutVerification {
  if (!Number.isFinite(x)) return "parse_error";
  return Math.abs(x - exercice.reponse.x) <= TOLERANCE_COMPOSANTES ? "correct" : "not_equivalent";
}

export function diagnostiquerY(exercice: ExerciceCombinaisonVecteurs, y: number): StatutVerification {
  if (!Number.isFinite(y)) return "parse_error";
  return Math.abs(y - exercice.reponse.y) <= TOLERANCE_COMPOSANTES ? "correct" : "not_equivalent";
}

export function diagnostiquerComposantes(exercice: ExerciceCombinaisonVecteurs, x: number, y: number): StatutVerification {
  const statutX = diagnostiquerX(exercice, x);
  const statutY = diagnostiquerY(exercice, y);
  if (statutX === "parse_error" || statutY === "parse_error") return "parse_error";
  return statutX === "correct" && statutY === "correct" ? "correct" : "not_equivalent";
}

export function verifierComposantes(exercice: ExerciceCombinaisonVecteurs, x: number, y: number): boolean {
  return diagnostiquerComposantes(exercice, x, y) === "correct";
}
