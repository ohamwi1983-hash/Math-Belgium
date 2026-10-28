import type { Exercice } from "../core/generateur.types";
import type { EtatSessionInequationRationnelle } from "../moteur/sessionInequationRationnelle";
import type { EntreeRecapitulatif } from "./recapitulatif";
import {
  formatExpressionIsoleeDenominateurCarreLatex,
  formatExpressionIsoleeLatex,
  formatExpressionIsoleeNiveau3Latex,
  formatExpressionIsoleeNiveau4Latex,
  formatExpressionIsoleeSansFacteurCommunLatex,
} from "./formatInequationRationnelle";
import { formatLineaireDeveloppe } from "./formatSignesProduit";
import { formatFormeFactoriseeDepuisRacines, formatMembreGauche } from "./formatEquation";
import { formatFractionSimplifiee, formatPolynome } from "./formatSimplification";
import { libelleCategorie } from "./categorieLabels";
import { enonceSimplifie, facteurCommun } from "../moteur/simplificationEquation";

/** Racines triées, dédoublonnées si racine double (Δ=0) — jamais "6 ; 6", même principe que
 * `formatZerosAttendusLatex`/`formatTermesZerosAttendusLatex` (`ui/formatEquation.ts`). Les 4
 * entrées "Racines (...)" de ce récapitulatif triaient déjà par ordre croissant mais ne
 * dédoublonnaient jamais (bug trouvé lors du balayage sitewide suite à l'audit du chapitre 2). */
function formatRacinesTriees(racines: readonly [number, number]): string {
  const triees = [...racines].sort((a, b) => a - b);
  return triees[0] === triees[1] ? String(triees[0]) : triees.join(" ; ");
}

/**
 * Reconstruit la mise en évidence confirmée par l'élève ("k(...)") pour un P2 de la variante
 * facteurCommun (D ou N) — jamais la forme divisée par k, qui changerait la valeur de la fraction
 * N(x)/D(x) (voir moteur/verificationSimplification.ts, diagnostiquerMiseEnEvidenceFraction, et le
 * bug qu'elle corrige : confirmé empiriquement, capture d'écran utilisateur du 26/09, gen3).
 */
function formatMiseEnEvidence(poly: Exercice): string {
  return `${facteurCommun(poly.enonce)}(${formatMembreGauche(enonceSimplifie(poly.enonce))})`;
}

/**
 * Entrée "Δ (suffixe)"/"Forme factorisée (suffixe)" pour un P2 dont le champ1 (Δ ou
 * factorisation) vient d'être confirmé — même branchement que ui/recapitulatif.ts (exercice 1),
 * relocalisé ici pour couvrir les 5 points où ce champ1 était manquant (prompt-corrections-
 * moteur-partage.md, point 2).
 */
function entreeChamp1(p2: Exercice, suffixe: string, revele: boolean): EntreeRecapitulatif {
  return p2.categorie === "cas_general"
    ? { libelle: `Δ (${suffixe})`, estLatex: false, valeur: `Δ = ${p2.solution.delta}`, revele }
    : { libelle: `Forme factorisée (${suffixe})`, estLatex: true, valeur: `${p2.solution.formeFactorisee} = 0`, revele };
}

/**
 * Entrée "Forme factorisée (suffixe)" pour un P2 en cas_general dont l'étape de factorisation
 * (après Δ et racines) vient d'être confirmée — même principe que dans les exercices 1/3/4/5
 * (voir CLAUDE.md, "Factorisation après Δ").
 */
function entreeFactorisation(p2: Exercice, suffixe: string, revele: boolean): EntreeRecapitulatif {
  return {
    libelle: `Forme factorisée (${suffixe})`,
    estLatex: true,
    valeur: `${formatFormeFactoriseeDepuisRacines(p2.enonce, p2.solution.racines)} = 0`,
    revele,
  };
}

/**
 * Récapitulatif accumulé pour l'exercice "inéquations rationnelles" — même principe que
 * recapitulatifSignesProduit.ts (toujours la vraie valeur confirmée, jamais la saisie de
 * l'élève, rien pour une étape qui n'a pas eu lieu). L'inéquation épinglée en permanence dès le
 * tout premier écran montre l'énoncé de DÉPART (N1/D ◇ k pour le niveau 2, N1/D ◇ P1_3(x) pour le
 * niveau 3, N1/D2 ◇ N3/D4 pour le niveau 4, la seule forme qui existe pour le niveau 1) — sans elle
 * l'élève ne verrait plus l'énoncé complet une fois passé aux étapes suivantes. Aucune entrée pour
 * la grille elle-même (comme signesProduit : le rappel visuel se fait via le tableau, pas via ce
 * panneau textuel).
 *
 * L'entrée CE est rendue en KaTeX (`x \neq [valeur]`, prompt de corrections) — pas un texte brut
 * avec le caractère unicode "≠" : le symbole mathématique doit passer par le même rendu que le
 * reste des expressions de l'application, jamais un substitut textuel. Niveau 4 (2 valeurs) :
 * libellé au pluriel, les deux jointes par "\text{ et }" dans une seule chaîne KaTeX.
 *
 * Niveaux 2-4 : "Isolement" (la forme cible de l'étape isoler) et "Numérateur combiné" (P1_3
 * développé en niveau 2, P2_1 développé en niveaux 3-4, confirmé à l'étape combiner) — ces deux
 * entrées n'existent structurellement jamais pour un exercice niveau 1
 * (scoreIsolerExercice/scoreCombinerExercice y restent toujours null), la vérification sur
 * `exercice.niveau` sert avant tout au typage (narrowing).
 *
 * "Racine du numérateur" (niveaux 1-2 uniquement) n'a pas d'équivalent aux niveaux 3-4, où la
 * racine du numérateur combiné (P2_1, du 2nd degré) est déjà couverte par les entrées
 * "Méthode"/"Racines" de son mécanisme de reconnaissance+factorisation+racines réutilisé (voir
 * sessionInequationRationnelle.ts).
 */
export function calculerRecapitulatifInequationRationnelle(etat: EtatSessionInequationRationnelle): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;

  // L'inéquation de départ n'est plus une entrée de ce récapitulatif (petit texte) depuis
  // promptcorrectionsgenerateurs764transversal.md, générateur 6, point 2.1 : elle est désormais un
  // bloc "Énoncé" mis en évidence sur chaque écran (voir formatEnonceOriginalComplet, réutilisée
  // telle quelle par AppInequationRationnelle.tsx), toujours affiché — plus besoin de la répéter ici.
  const entrees: EntreeRecapitulatif[] = [];

  if (
    exercice.niveau !== "niveau1" &&
    exercice.niveau !== "facteurCommun" &&
    exercice.niveau !== "cubique" &&
    etat.scoreIsolerExercice !== null
  ) {
    entrees.push({
      libelle: "Isolement",
      estLatex: true,
      valeur:
        exercice.niveau === "niveau2"
          ? formatExpressionIsoleeLatex(exercice)
          : exercice.niveau === "niveau3"
            ? formatExpressionIsoleeNiveau3Latex(exercice)
            : exercice.niveau === "denominateurCarre"
              ? formatExpressionIsoleeDenominateurCarreLatex(exercice)
              : exercice.niveau === "sansFacteurCommun"
                ? formatExpressionIsoleeSansFacteurCommunLatex(exercice)
                : formatExpressionIsoleeNiveau4Latex(exercice),
      revele: etat.isolerRevele,
    });
  }

  if (exercice.niveau === "niveau2" && etat.scoreCombinerExercice !== null) {
    entrees.push({
      libelle: "Numérateur combiné",
      estLatex: true,
      valeur: formatLineaireDeveloppe(exercice.numerateur.k, exercice.numerateur.p),
      revele: etat.combinerRevele,
    });
  }

  if (
    (exercice.niveau === "niveau3" ||
      exercice.niveau === "niveau4" ||
      exercice.niveau === "denominateurCarre" ||
      exercice.niveau === "sansFacteurCommun") &&
    etat.scoreCombinerExercice !== null
  ) {
    entrees.push({
      libelle: "Numérateur combiné",
      estLatex: true,
      valeur: formatMembreGauche(exercice.numerateur.enonce),
      revele: etat.combinerRevele,
    });
  }

  if (etat.scoreCEExercice !== null) {
    if (exercice.niveau === "niveau4" || exercice.niveau === "facteurCommun" || exercice.niveau === "sansFacteurCommun") {
      const valeurs = exercice.ce.map((v) => `x \\neq ${v}`);
      entrees.push({
        libelle: "Conditions d'existence (CE)",
        estLatex: true,
        valeur: valeurs.join(" \\text{ et } "),
        valeurs,
        revele: etat.ceRevele,
      });
    } else {
      entrees.push({ libelle: "Condition d'existence (CE)", estLatex: true, valeur: `x \\neq ${exercice.ce}`, revele: etat.ceRevele });
    }
  }

  if (
    exercice.niveau !== "niveau3" &&
    exercice.niveau !== "niveau4" &&
    exercice.niveau !== "denominateurCarre" &&
    exercice.niveau !== "facteurCommun" &&
    exercice.niveau !== "sansFacteurCommun" &&
    exercice.niveau !== "cubique" &&
    etat.scoreRacineNumerateurExercice !== null
  ) {
    entrees.push({ libelle: "Racine du numérateur", estLatex: false, valeur: String(exercice.numerateur.p), revele: etat.racineNumerateurRevele });
  }

  if (
    (exercice.niveau === "niveau3" ||
      exercice.niveau === "niveau4" ||
      exercice.niveau === "denominateurCarre" ||
      exercice.niveau === "sansFacteurCommun") &&
    etat.scoreReductionExercice !== null
  ) {
    entrees.push({
      libelle: "Numérateur combiné réduit",
      estLatex: true,
      valeur: formatPolynome(exercice.numerateur),
      revele: etat.reductionRevele,
    });
  }

  if (
    (exercice.niveau === "niveau3" ||
      exercice.niveau === "niveau4" ||
      exercice.niveau === "denominateurCarre" ||
      exercice.niveau === "sansFacteurCommun") &&
    etat.scoreReconnaissanceExercice !== null
  ) {
    entrees.push({
      libelle: "Méthode (numérateur combiné)",
      estLatex: false,
      valeur: libelleCategorie(exercice.numerateur.categorie),
      revele: etat.reconnaissanceRevele,
    });
  }

  if (
    (exercice.niveau === "niveau3" ||
      exercice.niveau === "niveau4" ||
      exercice.niveau === "denominateurCarre" ||
      exercice.niveau === "sansFacteurCommun") &&
    etat.scoreChamp1Exercice !== null
  ) {
    entrees.push(entreeChamp1(exercice.numerateur, "numérateur combiné", etat.champ1Revele));
  }

  if (
    (exercice.niveau === "niveau3" ||
      exercice.niveau === "niveau4" ||
      exercice.niveau === "denominateurCarre" ||
      exercice.niveau === "sansFacteurCommun") &&
    etat.scoreChamp2Exercice !== null
  ) {
    entrees.push({
      libelle: "Racines (numérateur combiné)",
      estLatex: false,
      valeur: formatRacinesTriees(exercice.numerateur.solution.racines),
      revele: etat.champ2Revele,
    });
  }

  if (
    (exercice.niveau === "niveau3" ||
      exercice.niveau === "niveau4" ||
      exercice.niveau === "denominateurCarre" ||
      exercice.niveau === "sansFacteurCommun") &&
    etat.scoreFactorisationExercice !== null
  ) {
    entrees.push(entreeFactorisation(exercice.numerateur, "numérateur combiné", etat.factorisationRevele));
  }

  if (exercice.niveau === "sansFacteurCommun" && etat.scoreDenomReductionExercice !== null) {
    entrees.push({
      libelle: "Dénominateur réduit",
      estLatex: true,
      valeur: formatPolynome(exercice.denominateur),
      revele: etat.denomReductionRevele,
    });
  }

  if (exercice.niveau === "sansFacteurCommun" && etat.scoreDenomReconnaissanceExercice !== null) {
    entrees.push({
      libelle: "Méthode (dénominateur)",
      estLatex: false,
      valeur: libelleCategorie(exercice.denominateur.categorie),
      revele: etat.denomReconnaissanceRevele,
    });
  }

  if (exercice.niveau === "sansFacteurCommun" && etat.scoreDenomChamp1Exercice !== null) {
    entrees.push(entreeChamp1(exercice.denominateur, "dénominateur", etat.denomChamp1Revele));
  }

  if (exercice.niveau === "sansFacteurCommun" && etat.scoreDenomFactorisationExercice !== null) {
    entrees.push(entreeFactorisation(exercice.denominateur, "dénominateur", etat.denomFactorisationRevele));
  }

  if (exercice.niveau === "cubique" && etat.scoreMiseEnEvidenceExercice !== null) {
    entrees.push({
      libelle: "Mise en évidence",
      estLatex: true,
      valeur: `x(${formatMembreGauche(exercice.numerateur.enonce)})`,
      revele: etat.miseEnEvidenceRevele,
    });
  }

  if (exercice.niveau === "cubique" && etat.scoreReductionExercice !== null) {
    entrees.push({
      libelle: "Facteur quadratique réduit",
      estLatex: true,
      valeur: formatPolynome(exercice.numerateur),
      revele: etat.reductionRevele,
    });
  }

  if (exercice.niveau === "cubique" && etat.scoreReconnaissanceExercice !== null) {
    entrees.push({
      libelle: "Méthode (facteur quadratique)",
      estLatex: false,
      valeur: libelleCategorie(exercice.numerateur.categorie),
      revele: etat.reconnaissanceRevele,
    });
  }

  if (exercice.niveau === "cubique" && etat.scoreChamp1Exercice !== null) {
    entrees.push(entreeChamp1(exercice.numerateur, "facteur quadratique", etat.champ1Revele));
  }

  if (exercice.niveau === "cubique" && etat.scoreChamp2Exercice !== null) {
    entrees.push({
      libelle: "Racines (facteur quadratique)",
      estLatex: false,
      valeur: formatRacinesTriees(exercice.numerateur.solution.racines),
      revele: etat.champ2Revele,
    });
  }

  if (exercice.niveau === "cubique" && etat.scoreFactorisationExercice !== null) {
    entrees.push(entreeFactorisation(exercice.numerateur, "facteur quadratique", etat.factorisationRevele));
  }

  if (exercice.niveau === "facteurCommun") {
    const D = exercice.fraction.denominateur;
    const N = exercice.fraction.numerateur;
    if (!("categorie" in D) || !("categorie" in N)) throw new Error("calculerRecapitulatifInequationRationnelle : attendu des P2 pour facteurCommun");

    if (etat.scoreSimplifierDenomReductionExercice !== null) {
      entrees.push({
        libelle: "Dénominateur mis en évidence",
        estLatex: true,
        valeur: formatMiseEnEvidence(D),
        revele: etat.simplifierDenomReductionRevele,
      });
    }
    if (etat.scoreSimplifierDenomReconnaissanceExercice !== null) {
      entrees.push({
        libelle: "Méthode (dénominateur)",
        estLatex: false,
        valeur: libelleCategorie(D.categorie),
        revele: etat.simplifierDenomCategorieRevelee,
      });
    }
    if (etat.scoreSimplifierDenomChamp1Exercice !== null) {
      entrees.push(entreeChamp1(D, "dénominateur", etat.simplifierDenomChamp1Revele));
    }
    if (etat.scoreSimplifierDenomChamp2Exercice !== null) {
      entrees.push({
        libelle: "Racines (dénominateur)",
        estLatex: false,
        valeur: formatRacinesTriees(D.solution.racines),
        revele: etat.simplifierDenomChamp2Revele,
      });
    }
    if (etat.scoreSimplifierDenomFactorisationExercice !== null) {
      entrees.push(entreeFactorisation(D, "dénominateur", etat.simplifierDenomFactorisationRevele));
    }
    if (etat.scoreSimplifierNumReductionExercice !== null) {
      entrees.push({
        libelle: "Numérateur mis en évidence",
        estLatex: true,
        valeur: formatMiseEnEvidence(N),
        revele: etat.simplifierNumReductionRevele,
      });
    }
    if (etat.scoreSimplifierNumReconnaissanceExercice !== null) {
      entrees.push({
        libelle: "Méthode (numérateur)",
        estLatex: false,
        valeur: libelleCategorie(N.categorie),
        revele: etat.simplifierNumCategorieRevelee,
      });
    }
    if (etat.scoreSimplifierNumChamp1Exercice !== null) {
      entrees.push(entreeChamp1(N, "numérateur", etat.simplifierNumChamp1Revele));
    }
    if (etat.scoreSimplifierNumChamp2Exercice !== null) {
      entrees.push({
        libelle: "Racines (numérateur)",
        estLatex: false,
        valeur: formatRacinesTriees(N.solution.racines),
        revele: etat.simplifierNumChamp2Revele,
      });
    }
    if (etat.scoreSimplifierNumFactorisationExercice !== null) {
      entrees.push(entreeFactorisation(N, "numérateur", etat.simplifierNumFactorisationRevele));
    }
    if (etat.scoreSimplifierFractionExercice !== null) {
      entrees.push({
        libelle: "Fraction simplifiée",
        estLatex: true,
        valeur: formatFractionSimplifiee(exercice.fraction),
        revele: etat.simplifierFractionRevele,
      });
    }
  }

  return entrees;
}
