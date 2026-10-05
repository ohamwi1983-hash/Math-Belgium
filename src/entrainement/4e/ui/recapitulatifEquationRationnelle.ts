import type { Exercice } from "../core/generateur.types";
import type { ExerciceSimplification, PolynomeLineaire } from "../core/simplification.types";
import type { EtatSessionEquationRationnelle } from "../moteur/typesEquationRationnelle";
import type { EntreeRecapitulatif } from "./recapitulatif";
import {
  estSolutionUnique,
  formatEnonceLatex,
  formatFormeFactoriseeDepuisRacines,
  formatMembreGauche,
  formatTermesZerosAttendusLatex,
  formatZerosAttendusLatex,
} from "./formatEquation";
import { formatFractionReduiteOuConstante } from "./formatEquationRationnelle";
import { formatFractionSimplifiee } from "./formatSimplification";
import { libelleCategorie } from "./categorieLabels";
import { enonceSimplifie, facteurCommun } from "../moteur/simplificationEquation";

function estPolynomeLineaire(poly: Exercice | PolynomeLineaire): poly is PolynomeLineaire {
  return "k" in poly;
}

/** Le P2 embarqué dans fractionGauche (numérateur pour "P2/P1", dénominateur pour "P1/P2") — même principe que sessionEquationRationnelle.ts::p2DeFractionGauche. */
function p2DeFractionGauche(fractionGauche: ExerciceSimplification): Exercice {
  return estPolynomeLineaire(fractionGauche.numerateur) ? (fractionGauche.denominateur as Exercice) : (fractionGauche.numerateur as Exercice);
}

/**
 * Reconstruit la mise en évidence confirmée par l'élève ("k(...)") — jamais la forme divisée par
 * k, qui changerait la valeur de fractionGauche (voir moteur/verificationSimplification.ts,
 * diagnostiquerMiseEnEvidenceFraction, et le bug qu'elle corrige : confirmé empiriquement, capture
 * d'écran utilisateur du 26/09, gen3).
 */
function formatMiseEnEvidence(poly: Exercice): string {
  return `${facteurCommun(poly.enonce)}(${formatMembreGauche(enonceSimplifie(poly.enonce))})`;
}

/**
 * Construit le récapitulatif accumulé des étapes déjà closes — même principe que
 * ui/recapitulatif.ts (exercice 1) et ui/recapitulatifSimplification.ts (exercice 3) : dérivé
 * uniquement des scores déjà trackés par le moteur, jamais de la saisie de l'élève.
 *
 * Cas 4a/4b (prompt-cas4a-4b.md, `exercice.fractionGauche` présent) : un **premier passage**
 * (méthode/factorisation/racines du P2 de la fraction à simplifier, puis la fraction simplifiée)
 * précède "Équation isolée" — libellés suffixés "(fraction)" pour ne jamais les confondre avec le
 * **second passage** (méthode/factorisation/racines de l'équation finale) qui suit, aux libellés
 * inchangés partagés avec toutes les autres constructions.
 */
export function calculerRecapitulatifEquationRationnelle(etat: EtatSessionEquationRationnelle): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const entrees: EntreeRecapitulatif[] = [];

  if (etat.scoreCEExercice !== null) {
    entrees.push({
      libelle: exercice.ce.length === 1 ? "Condition d'existence (CE)" : "Conditions d'existence (CE)",
      estLatex: false,
      valeur: exercice.ce.map((v) => `x ≠ ${v}`).join(" et "),
    });
  }

  const fractionGauche = exercice.fractionGauche;

  if (fractionGauche && etat.scoreSimplifierReductionExercice !== null) {
    entrees.push({
      libelle: "Mise en évidence (fraction)",
      estLatex: true,
      valeur: formatMiseEnEvidence(p2DeFractionGauche(fractionGauche)),
    });
  }

  if (fractionGauche && etat.scoreSimplifierReconnaissanceExercice !== null) {
    entrees.push({
      libelle: "Méthode (fraction)",
      estLatex: false,
      valeur: libelleCategorie(p2DeFractionGauche(fractionGauche).categorie),
    });
  }

  if (fractionGauche && etat.scoreSimplifierChamp1Exercice !== null) {
    const p2 = p2DeFractionGauche(fractionGauche);
    entrees.push(
      p2.categorie === "cas_general"
        ? { libelle: "Δ (fraction)", estLatex: false, valeur: `Δ = ${p2.solution.delta}` }
        : { libelle: "Forme factorisée (fraction)", estLatex: true, valeur: `${p2.solution.formeFactorisee} = 0` },
    );
  }

  if (fractionGauche && etat.scoreSimplifierChamp2Exercice !== null) {
    const p2 = p2DeFractionGauche(fractionGauche);
    const valeurs = formatTermesZerosAttendusLatex(p2);
    entrees.push({
      libelle: estSolutionUnique(p2) ? "Racine (fraction)" : "Racines (fraction)",
      estLatex: true,
      valeur: formatZerosAttendusLatex(p2),
      ...(valeurs.length > 1 ? { valeurs } : {}),
    });
  }

  if (fractionGauche && etat.scoreSimplifierFactorisationExercice !== null) {
    const p2 = p2DeFractionGauche(fractionGauche);
    entrees.push({
      libelle: "Forme factorisée (fraction)",
      estLatex: true,
      valeur: `${formatFormeFactoriseeDepuisRacines(p2.enonce, p2.solution.racines)} = 0`,
    });
  }

  if (fractionGauche && etat.scoreSimplifierFractionExercice !== null) {
    entrees.push({ libelle: "Fraction simplifiée", estLatex: true, valeur: formatFractionSimplifiee(fractionGauche) });
  }

  if (etat.scoreSimplifierExercice !== null && exercice.fractionsSimplifiables.length > 0) {
    const valeurs = exercice.fractionsSimplifiables.map(formatFractionReduiteOuConstante);
    entrees.push({
      libelle: exercice.fractionsSimplifiables.length === 1 ? "Fraction simplifiée" : "Fractions simplifiées",
      estLatex: true,
      valeur: valeurs.join("\\quad"),
      valeurs,
    });
  }

  if (etat.scoreIsolementExercice !== null) {
    entrees.push({
      libelle: "Équation isolée",
      estLatex: true,
      valeur: formatEnonceLatex(exercice.equationIsolee.enonce),
    });
  }

  if (etat.scoreReconnaissanceExercice !== null) {
    entrees.push({ libelle: "Méthode", estLatex: false, valeur: libelleCategorie(exercice.equationIsolee.categorie) });
  }

  if (etat.scoreChampPrincipalExercice !== null) {
    const eq = exercice.equationIsolee;
    entrees.push(
      eq.categorie === "cas_general"
        ? { libelle: "Δ", estLatex: false, valeur: `Δ = ${eq.solution.delta}` }
        : { libelle: "Forme factorisée", estLatex: true, valeur: `${eq.solution.formeFactorisee} = 0` },
    );
  }

  if (etat.scoreRacinesExercice !== null) {
    const eq = exercice.equationIsolee;
    const valeurs = formatTermesZerosAttendusLatex(eq);
    entrees.push({
      libelle: estSolutionUnique(eq) ? "Solution" : "Solutions",
      estLatex: true,
      valeur: formatZerosAttendusLatex(eq),
      ...(valeurs.length > 1 ? { valeurs } : {}),
    });
  }

  return entrees;
}
