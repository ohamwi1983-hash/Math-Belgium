import type { Exercice } from "../core/generateur.types";
import type { PolynomeLineaire } from "../core/simplification.types";
import type { EtatSessionSimplification } from "../moteur/typesSimplification";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { libelleCategorie } from "./categorieLabels";
import { formatFormeFactoriseeDepuisRacines, formatMembreGauche } from "./formatEquation";
import { formatPolynomeMisEnEvidence } from "./formatSimplification";
import { enonceSimplifie, facteurCommun } from "../moteur/simplificationEquation";

/**
 * Reconstruit la mise en évidence confirmée par l'élève ("k(...)") — jamais la forme divisée par
 * k, qui changerait la valeur de la fraction (voir moteur/verificationSimplification.ts,
 * diagnostiquerMiseEnEvidenceFraction, et le bug qu'elle corrige : confirmé empiriquement, capture
 * d'écran utilisateur du 26/09).
 */
function formatMiseEnEvidence(poly: Exercice): string {
  return `${facteurCommun(poly.enonce)}(${formatMembreGauche(enonceSimplifie(poly.enonce))})`;
}

/**
 * Construit le récapitulatif accumulé des étapes déjà closes pour l'exercice en cours — même
 * principe que ui/recapitulatif.ts (exercice 1) : dérivé uniquement des scores déjà trackés par
 * le moteur, jamais de la saisie de l'élève, toujours vide au changement d'exercice.
 */
export function calculerRecapitulatifSimplification(etat: EtatSessionSimplification): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const entrees: EntreeRecapitulatif[] = [];

  if (etat.scoreDenomReductionExercice !== null) {
    const denom = exercice.denominateur as Exercice;
    entrees.push({ libelle: "Dénominateur mis en évidence", estLatex: true, valeur: formatMiseEnEvidence(denom) });
  }
  if (etat.scoreDenomReductionP1Exercice !== null) {
    const denom = exercice.denominateur as PolynomeLineaire;
    entrees.push({ libelle: "Dénominateur mis en évidence", estLatex: true, valeur: formatPolynomeMisEnEvidence(denom) });
  }
  if (etat.scoreDenomReconnaissanceExercice !== null) {
    const denom = exercice.denominateur as Exercice;
    entrees.push({ libelle: "Méthode (dénominateur)", estLatex: false, valeur: libelleCategorie(denom.categorie) });
  }
  if (etat.scoreDenomChamp1Exercice !== null) {
    const denom = exercice.denominateur as Exercice;
    entrees.push({
      libelle: "Dénominateur factorisé",
      estLatex: denom.categorie !== "cas_general",
      valeur: denom.categorie === "cas_general" ? `Δ = ${denom.solution.delta}` : (denom.solution.formeFactorisee as string),
    });
  }
  if (etat.scoreDenomChamp2Exercice !== null) {
    const denom = exercice.denominateur as Exercice;
    entrees.push({
      libelle: "Conditions d'existence (CE)",
      estLatex: false,
      valeur: denom.solution.racines.map((r) => `x≠${r}`).join(" ; "),
    });
  }
  if (etat.scoreDenomFactorisationExercice !== null) {
    const denom = exercice.denominateur as Exercice;
    entrees.push({
      libelle: "Forme factorisée (dénominateur)",
      estLatex: true,
      valeur: `${formatFormeFactoriseeDepuisRacines(denom.enonce, denom.solution.racines)} = 0`,
    });
  }
  if (etat.scoreCEDirecteExercice !== null) {
    entrees.push({ libelle: "Condition d'existence (CE)", estLatex: false, valeur: `x≠${exercice.racineCommune}` });
  }
  if (etat.scoreNumReductionExercice !== null) {
    const num = exercice.numerateur as Exercice;
    entrees.push({ libelle: "Numérateur mis en évidence", estLatex: true, valeur: formatMiseEnEvidence(num) });
  }
  if (etat.scoreNumReductionP1Exercice !== null) {
    const num = exercice.numerateur as PolynomeLineaire;
    entrees.push({ libelle: "Numérateur mis en évidence", estLatex: true, valeur: formatPolynomeMisEnEvidence(num) });
  }
  if (etat.scoreNumReconnaissanceExercice !== null) {
    const num = exercice.numerateur as Exercice;
    entrees.push({ libelle: "Méthode (numérateur)", estLatex: false, valeur: libelleCategorie(num.categorie) });
  }
  if (etat.scoreNumChamp1Exercice !== null) {
    const num = exercice.numerateur as Exercice;
    entrees.push({
      libelle: "Numérateur factorisé",
      estLatex: num.categorie !== "cas_general",
      valeur: num.categorie === "cas_general" ? `Δ = ${num.solution.delta}` : (num.solution.formeFactorisee as string),
    });
  }
  if (etat.scoreNumChamp2Exercice !== null) {
    const num = exercice.numerateur as Exercice;
    entrees.push({ libelle: "Racines (numérateur)", estLatex: false, valeur: num.solution.racines.join(" ; ") });
  }
  if (etat.scoreNumFactorisationExercice !== null) {
    const num = exercice.numerateur as Exercice;
    entrees.push({
      libelle: "Forme factorisée (numérateur)",
      estLatex: true,
      valeur: `${formatFormeFactoriseeDepuisRacines(num.enonce, num.solution.racines)} = 0`,
    });
  }

  return entrees;
}
