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
    entrees.push({
      libelle: "Dénominateur mis en évidence",
      estLatex: true,
      valeur: formatMiseEnEvidence(denom),
      // Pas de `denomReductionRevele` tracké par le moteur (`moteur/typesSimplification.ts`) — même
      // heuristique que recapitulatif.ts : score exactement 0 ⟺ révélée.
      revele: etat.scoreDenomReductionExercice === 0,
    });
  }
  if (etat.scoreDenomReductionP1Exercice !== null) {
    const denom = exercice.denominateur as PolynomeLineaire;
    entrees.push({
      libelle: "Dénominateur mis en évidence",
      estLatex: true,
      valeur: formatPolynomeMisEnEvidence(denom),
      // Pas de `denomReductionP1Revele` tracké par le moteur — même heuristique.
      revele: etat.scoreDenomReductionP1Exercice === 0,
    });
  }
  if (etat.scoreDenomReconnaissanceExercice !== null) {
    const denom = exercice.denominateur as Exercice;
    entrees.push({
      libelle: "Méthode (dénominateur)",
      estLatex: false,
      valeur: libelleCategorie(denom.categorie),
      revele: etat.denomCategorieRevelee,
    });
  }
  if (etat.scoreDenomChamp1Exercice !== null) {
    const denom = exercice.denominateur as Exercice;
    entrees.push({
      libelle: "Dénominateur factorisé",
      estLatex: denom.categorie !== "cas_general",
      valeur: denom.categorie === "cas_general" ? `Δ = ${denom.solution.delta}` : (denom.solution.formeFactorisee as string),
      // Pas de `denomChamp1Revele` tracké par le moteur — même heuristique.
      revele: etat.scoreDenomChamp1Exercice === 0,
    });
  }
  if (etat.scoreDenomChamp2Exercice !== null) {
    const denom = exercice.denominateur as Exercice;
    entrees.push({
      libelle: "Conditions d'existence (CE)",
      estLatex: false,
      valeur: denom.solution.racines.map((r) => `x≠${r}`).join(" ; "),
      // Pas de `denomChamp2Revele` tracké par le moteur — même heuristique.
      revele: etat.scoreDenomChamp2Exercice === 0,
    });
  }
  if (etat.scoreDenomFactorisationExercice !== null) {
    const denom = exercice.denominateur as Exercice;
    entrees.push({
      libelle: "Forme factorisée (dénominateur)",
      estLatex: true,
      valeur: `${formatFormeFactoriseeDepuisRacines(denom.enonce, denom.solution.racines)} = 0`,
      // Pas de `denomFactorisationRevele` tracké par le moteur — même heuristique.
      revele: etat.scoreDenomFactorisationExercice === 0,
    });
  }
  if (etat.scoreCEDirecteExercice !== null) {
    entrees.push({
      libelle: "Condition d'existence (CE)",
      estLatex: false,
      valeur: `x≠${exercice.racineCommune}`,
      // Pas de `ceDirecteRevele` tracké par le moteur — même heuristique.
      revele: etat.scoreCEDirecteExercice === 0,
    });
  }
  if (etat.scoreNumReductionExercice !== null) {
    const num = exercice.numerateur as Exercice;
    entrees.push({
      libelle: "Numérateur mis en évidence",
      estLatex: true,
      valeur: formatMiseEnEvidence(num),
      // Pas de `numReductionRevele` tracké par le moteur — même heuristique.
      revele: etat.scoreNumReductionExercice === 0,
    });
  }
  if (etat.scoreNumReductionP1Exercice !== null) {
    const num = exercice.numerateur as PolynomeLineaire;
    entrees.push({
      libelle: "Numérateur mis en évidence",
      estLatex: true,
      valeur: formatPolynomeMisEnEvidence(num),
      // Pas de `numReductionP1Revele` tracké par le moteur — même heuristique.
      revele: etat.scoreNumReductionP1Exercice === 0,
    });
  }
  if (etat.scoreNumReconnaissanceExercice !== null) {
    const num = exercice.numerateur as Exercice;
    entrees.push({
      libelle: "Méthode (numérateur)",
      estLatex: false,
      valeur: libelleCategorie(num.categorie),
      revele: etat.numCategorieRevelee,
    });
  }
  if (etat.scoreNumChamp1Exercice !== null) {
    const num = exercice.numerateur as Exercice;
    entrees.push({
      libelle: "Numérateur factorisé",
      estLatex: num.categorie !== "cas_general",
      valeur: num.categorie === "cas_general" ? `Δ = ${num.solution.delta}` : (num.solution.formeFactorisee as string),
      // Pas de `numChamp1Revele` tracké par le moteur — même heuristique.
      revele: etat.scoreNumChamp1Exercice === 0,
    });
  }
  if (etat.scoreNumChamp2Exercice !== null) {
    const num = exercice.numerateur as Exercice;
    entrees.push({
      libelle: "Racines (numérateur)",
      estLatex: false,
      valeur: num.solution.racines.join(" ; "),
      // Pas de `numChamp2Revele` tracké par le moteur — même heuristique.
      revele: etat.scoreNumChamp2Exercice === 0,
    });
  }
  if (etat.scoreNumFactorisationExercice !== null) {
    const num = exercice.numerateur as Exercice;
    entrees.push({
      libelle: "Forme factorisée (numérateur)",
      estLatex: true,
      valeur: `${formatFormeFactoriseeDepuisRacines(num.enonce, num.solution.racines)} = 0`,
      // Pas de `numFactorisationRevele` tracké par le moteur — même heuristique.
      revele: etat.scoreNumFactorisationExercice === 0,
    });
  }

  return entrees;
}
