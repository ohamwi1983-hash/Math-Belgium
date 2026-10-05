import type { EtatSessionSignesProduit } from "../moteur/typesSignesProduit";
import { formatFacteurLatex } from "./formatSignesProduit";
import { formatFormeFactoriseeDepuisRacines } from "./formatEquation";

/**
 * Bloc "état actuel" (promptgenerateur5signesProduit.md, point 1) — pour ce générateur, contexte
 * indispensable dès le premier écran d'un facteur : contrairement aux autres exercices du projet
 * (où l'encadré principal EST déjà l'équation à traiter, et "état actuel" ne fait que rappeler une
 * transformation déjà confirmée), l'encadré principal ici affiche désormais l'inéquation ENTIÈRE
 * (voir ui/formatSignesProduit.ts), donc "état actuel" est seul responsable de montrer QUEL facteur
 * isolé l'élève travaille — jamais null tant qu'un facteur reste à traiter (racineLineaire,
 * methodeFacteur, les sous-étapes de factorisation, signeIrreductible), null seulement sur
 * grille/intervalle (plus de facteur isolé à ce stade, voir formatEnonceSignesProduitFactoriseLatex
 * pour la décomposition complète qui les remplace).
 *
 * Remplace (jamais n'accumule) : une seule expression à la fois, mise à jour au fil des
 * sous-étapes du facteur courant — développée tant que rien n'est confirmé pour lui (ou pour
 * cas_general, tant que la factorisation textuelle n'a pas eu lieu), puis factorisée dès qu'elle
 * est connue (champ1 pour les 3 techniques nommées, factorisationFactorisation pour cas_general —
 * même principe que calculerEtatActuel, exercice 1). Un facteur linéaire ou irréductible ne
 * transforme jamais son propre affichage (rien à factoriser), donc reste identique du début à la
 * fin de son propre traitement.
 */
export function calculerEtatActuelSignesProduit(etat: EtatSessionSignesProduit): string | null {
  const facteur = etat.exerciceCourant.facteurs[etat.indexFacteurExercice];
  if (!facteur) return null;

  if (facteur.type !== "quadratique_factorisable") {
    return `${formatFacteurLatex(facteur)} = 0`;
  }

  const { categorie, enonce, solution } = facteur.exercice;
  const factoriseeConnue =
    categorie === "cas_general"
      ? etat.scoreFactorisationFactorisationExercice !== null
      : etat.scoreFactorisationChamp1Exercice !== null;

  if (factoriseeConnue) {
    return `${formatFormeFactoriseeDepuisRacines(enonce, solution.racines)} = 0`;
  }
  return `${formatFacteurLatex(facteur)} = 0`;
}
