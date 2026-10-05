import type { EtatSessionAnalyseFonction } from "../moteur/typesAnalyseFonction";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { libelleCategorie } from "./categorieLabels";
import { signeReelA, signeReelAB } from "../moteur/verificationAnalyseFonction";
import { formatFractionIrreductible } from "./formatFraction";

/**
 * Même principe que les récapitulatifs du reste du projet : dérivé uniquement des scores déjà
 * trackés par le moteur (scoreXxxExercice !== null ⟺ l'étape a eu lieu et est close), jamais de
 * la saisie de l'élève, toujours vide au changement d'exercice.
 */
export function calculerRecapitulatifAnalyseFonction(etat: EtatSessionAnalyseFonction): EntreeRecapitulatif[] {
  const { exercice, xS, yS } = etat.exerciceCourant;
  const entrees: EntreeRecapitulatif[] = [];

  if (etat.scoreCoefficientsExercice !== null) {
    const { a, b, c } = exercice.enonce;
    entrees.push({ libelle: "Coefficients", estLatex: false, valeur: `a = ${a} ; b = ${b} ; c = ${c}` });
  }

  if (etat.scoreAllureExercice !== null) {
    const signeA = signeReelA(exercice.enonce) === "+" ? "a > 0" : "a < 0";
    const signeAB = signeReelAB(exercice.enonce);
    const texteAB = signeAB === "0" ? "a·b = 0" : signeAB === "+" ? "a·b > 0" : "a·b < 0";
    entrees.push({ libelle: "Allure", estLatex: false, valeur: `${signeA} ; ${texteAB}` });
  }

  if (etat.scoreAxeSommetExercice !== null) {
    // Fractions irréductibles (point 2, prompt-4-modifications-analyse-fonction.md) — jamais un
    // décimal, jamais "n/1" pour une valeur entière.
    const xSFrac = formatFractionIrreductible(xS);
    const ySFrac = formatFractionIrreductible(yS);
    entrees.push({
      libelle: "Axe de symétrie et sommet",
      estLatex: false,
      valeur: `x = ${xSFrac} ; S(${xSFrac} ; ${ySFrac})`,
    });
  }

  if (etat.scoreDomaineImageExercice !== null) {
    const imf = exercice.enonce.a > 0 ? `[${yS} ; +∞[` : `]-∞ ; ${yS}]`;
    entrees.push({ libelle: "Domaine et image", estLatex: false, valeur: `domf = ℝ ; imf = ${imf}` });
  }

  if (etat.scoreRacinesReconnaissanceExercice !== null) {
    entrees.push({ libelle: "Méthode (racines)", estLatex: false, valeur: libelleCategorie(exercice.categorie) });
  }

  if (etat.scoreRacinesChamp1Exercice !== null) {
    entrees.push({ libelle: "Forme factorisée", estLatex: true, valeur: `${exercice.solution.formeFactorisee} = 0` });
  }

  if (etat.scoreRacinesChamp2Exercice !== null) {
    entrees.push({ libelle: "Racines", estLatex: false, valeur: exercice.solution.racines.join(" ; ") });
  }

  return entrees;
}
