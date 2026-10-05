import type { Morceau } from "../core/inequation.types";
import type { EtatListeMorceaux } from "./listeMorceaux";
import { construireMorceau } from "./morceauIntervalle";

/**
 * Visualisation en temps réel (refonte 2, correction 3) : pour les 4 questions à liste extensible
 * de morceaux (domaine, croissance, décroissance, constance), extrait les morceaux DÉJÀ COMPLETS
 * de la liste en cours de construction — une ligne encore incomplète (borne ou crochet manquant)
 * est simplement ignorée, jamais affichée à moitié sur le graphique. Fonction pure, dérivée
 * uniquement de l'état de saisie déjà présent dans chaque composant — aucun nouvel état React,
 * même principe que apercuIntervalle.ts (exercice "tableau de signes").
 */
export function morceauxCompletsPourSurlignage(etat: EtatListeMorceaux): Morceau[] {
  return etat.map(construireMorceau).filter((m): m is Morceau => m !== null);
}
