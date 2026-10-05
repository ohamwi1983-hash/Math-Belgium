/**
 * Couche B — vérification pour "Réduction d'une somme de vecteurs (Chasles)" (chapitre "Calcul
 * vectoriel", cinquième générateur). La réponse de l'élève est toujours une paire de lettres
 * (ex. "MA", "M A", "M-A") désignant le vecteur `\vec{XY}` qu'il propose comme réduction — jamais
 * une comparaison au SEUL couple `(pointDepart, pointArrivee)` d'origine : toute paire de points de
 * la figure dont le vecteur réel coïncide avec la cible est acceptée (comparaison par coordonnées
 * réelles, jamais une liste figée de "vecteurs équivalents" câblée en dur), satisfaisant nativement
 * la tolérance demandée par la spec ("si deux segments différents représentent le même vecteur").
 */
import type { ExerciceReductionVectorielle } from "../core/reductionVectorielle.types";
import type { StatutVerification } from "./statutVerification";

const TOLERANCE = 0.01;
const REGEX_PAIRE = /^([A-Za-z])[\s,;\->]*([A-Za-z])$/;

export function diagnostiquerReduction(exercice: ExerciceReductionVectorielle, texte: string): StatutVerification {
  const nettoye = texte.trim();
  const match = REGEX_PAIRE.exec(nettoye);
  if (!match) return "parse_error";

  const origine = match[1].toUpperCase();
  const arrivee = match[2].toUpperCase();
  const pointOrigine = exercice.points[origine];
  const pointArrivee = exercice.points[arrivee];
  if (!pointOrigine || !pointArrivee) return "parse_error";

  const dx = pointArrivee.x - pointOrigine.x - exercice.reponse.x;
  const dy = pointArrivee.y - pointOrigine.y - exercice.reponse.y;
  return Math.abs(dx) <= TOLERANCE && Math.abs(dy) <= TOLERANCE ? "correct" : "not_equivalent";
}

export function verifierReduction(exercice: ExerciceReductionVectorielle, texte: string): boolean {
  return diagnostiquerReduction(exercice, texte) === "correct";
}
