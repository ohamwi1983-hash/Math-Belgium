import { useState } from "react";
import type { ReactNode } from "react";
import type { Categorie, Exercice } from "./core/generateur.types";
import type {
  ExerciceInequationRationnelleFacteurCommun,
  GrilleQuotient,
  GrilleQuotientCubique,
  GrilleQuotientNiveau3,
  GrilleQuotientNiveau4,
  GrilleQuotientSansFacteurCommun,
  ReglagesInequationRationnelle,
} from "./core/inequationRationnelle.types";
import type { PolynomeLineaire } from "./core/simplification.types";
import type { SolutionEnsembleProduit } from "./core/signesProduit.types";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideCe,
  activerAideChamp1,
  activerAideChamp2,
  activerAideCombiner,
  activerAideDenomChamp1,
  activerAideDenomFactorisation,
  activerAideDenomReduction,
  activerAideFactorisation,
  activerAideIntervalleQuotient,
  activerAideIsoler,
  activerAideMiseEnEvidence,
  activerAideReduction,
  activerAideSimplifierDenomChamp1,
  activerAideSimplifierDenomChamp2,
  activerAideSimplifierDenomFactorisation,
  activerAideSimplifierDenomReduction,
  activerAideSimplifierFraction,
  activerAideSimplifierNumChamp1,
  activerAideSimplifierNumChamp2,
  activerAideSimplifierNumFactorisation,
  activerAideSimplifierNumReduction,
  demarrerSessionInequationRationnelle,
  soumettreChoixSimplifierDenomCategorie,
  soumettreChoixSimplifierNumCategorie,
  soumettreReponseCE,
  soumettreReponseCEListe,
  soumettreReponseChamp1,
  soumettreReponseChamp2,
  soumettreReponseCombiner,
  soumettreReponseDenomChamp1,
  soumettreReponseDenomFactorisation,
  soumettreReponseDenomReconnaissance,
  soumettreReponseDenomReduction,
  soumettreReponseFactorisation,
  soumettreReponseGrille,
  soumettreReponseGrilleCubique,
  soumettreReponseGrilleNiveau3,
  soumettreReponseGrilleNiveau4,
  soumettreReponseIntervalle,
  soumettreReponseIsoler,
  soumettreReponseMiseEnEvidence,
  soumettreReponseRacineNumerateur,
  soumettreReponseReconnaissance,
  soumettreReponseReduction,
  soumettreReponseSimplifierDenomChamp1,
  soumettreReponseSimplifierDenomChamp2,
  soumettreReponseSimplifierDenomFactorisation,
  soumettreReponseSimplifierDenomReduction,
  soumettreReponseSimplifierFraction,
  soumettreReponseSimplifierNumChamp1,
  soumettreReponseSimplifierNumChamp2,
  soumettreReponseSimplifierNumFactorisation,
  soumettreReponseSimplifierNumReduction,
} from "./moteur/sessionInequationRationnelle";
import type { EtatSessionInequationRationnelle, PhaseInequationRationnelle } from "./moteur/sessionInequationRationnelle";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, creerGenerateurInequationRationnelle } from "./generateurs/inequationRationnelle";
import type { NiveauInequationRationnelle } from "./core/inequationRationnelle.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { diagnostiquerChampPrincipal, diagnostiquerFactorisationCasGeneral } from "./moteur/verification";
import {
  diagnostiquerMiseEnEvidenceFraction,
  diagnostiquerReductionCoefficients,
  diagnostiquerSimplification,
} from "./moteur/verificationSimplification";
import { diagnostiquerMiseEnEvidenceCubique } from "./moteur/expressionAlgebrique";
import {
  diagnostiquerCombiner,
  diagnostiquerCombinerQuadratique,
  diagnostiquerIsolementDenominateurCarre,
  diagnostiquerIsolementRationnelle,
  diagnostiquerIsolementRationnelleNiveau3,
  diagnostiquerIsolementRationnelleNiveau4,
  diagnostiquerIsolementSansFacteurCommun,
} from "./moteur/verificationInequationRationnelle";
import { EtapeCEDirecte } from "./components/EtapeCEDirecte";
import { EtapeIsolement } from "./components/EtapeIsolement";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { EtapeRacinesFlexibles } from "./components/EtapeRacinesFlexibles";
import { EtapeReconnaissance } from "./components/EtapeReconnaissance";
import { EtapeChamp1 } from "./components/EtapeChamp1";
import { EtapeReductionCoefficients } from "./components/EtapeReductionCoefficients";
import { EtapeSimplification } from "./components/EtapeSimplification";
import { EtapeGrilleQuotient } from "./components/EtapeGrilleQuotient";
import { EtapeGrilleQuotientNiveau3 } from "./components/EtapeGrilleQuotientNiveau3";
import { EtapeGrilleQuotientNiveau4 } from "./components/EtapeGrilleQuotientNiveau4";
import { EtapeGrilleQuotientDenominateurCarre } from "./components/EtapeGrilleQuotientDenominateurCarre";
import { EtapeGrilleQuotientFacteurCommun } from "./components/EtapeGrilleQuotientFacteurCommun";
import { EtapeGrilleQuotientSansFacteurCommun } from "./components/EtapeGrilleQuotientSansFacteurCommun";
import { EtapeGrilleQuotientCubique } from "./components/EtapeGrilleQuotientCubique";
import { EtapeIntervalleQuotient } from "./components/EtapeIntervalleQuotient";
import { Katex } from "./components/Katex";
import { calculerRecapitulatifInequationRationnelle } from "./ui/recapitulatifInequationRationnelle";
import { numerateurCombineEstFactorise } from "./ui/etatActuelInequationRationnelle";
import {
  formatEnonceCombineDenominateurCarreLatex,
  formatEnonceCombineNiveau3Latex,
  formatEnonceCombineNiveau4Latex,
  formatEnonceCombineSansFacteurCommunLatex,
  formatEnonceCubiqueLatex,
  formatEnonceFacteurCommunLatex,
  formatEnonceInequationRationnelleLatex,
  formatEnonceOriginalComplet,
  formatEnonceOriginalDenominateurCarreLatex,
  formatEnonceOriginalNiveau2Latex,
  formatEnonceOriginalNiveau3Latex,
  formatEnonceOriginalNiveau4Latex,
  formatEnonceOriginalSansFacteurCommunLatex,
  formatExpressionIsoleeDenominateurCarreLatex,
  formatExpressionIsoleeLatex,
  formatExpressionIsoleeNiveau3Latex,
  formatExpressionIsoleeNiveau4Latex,
  formatExpressionIsoleeSansFacteurCommunLatex,
} from "./ui/formatInequationRationnelle";
import { formatEquationDenominateur, formatEquationNumerateur, formatFractionSimplifiee } from "./ui/formatSimplification";
import { formatLineaireDeveloppe } from "./ui/formatSignesProduit";
import { formatFormeFactoriseeDepuisRacines, formatMembreGauche } from "./ui/formatEquation";
import { formatSolutionEnsembleProduit } from "./ui/formatSolutionEnsembleProduit";
import { libelleCategorie } from "./ui/categorieLabels";
import { necessiteSimplification } from "./moteur/simplificationEquation";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";

/** `fraction.denominateur`/`.numerateur` sont toujours des P2 pour le type "P2/P2" (seul type utilisé par facteurCommun). */
function estPolynomeLineaire(poly: Exercice | PolynomeLineaire): poly is PolynomeLineaire {
  return "k" in poly;
}
function denominateurFacteurCommun(exercice: ExerciceInequationRationnelleFacteurCommun): Exercice {
  const d = exercice.fraction.denominateur;
  if (estPolynomeLineaire(d)) throw new Error("denominateurFacteurCommun : attendu un P2");
  return d;
}
function numerateurFacteurCommun(exercice: ExerciceInequationRationnelleFacteurCommun): Exercice {
  const n = exercice.fraction.numerateur;
  if (estPolynomeLineaire(n)) throw new Error("numerateurFacteurCommun : attendu un P2");
  return n;
}

const CONSIGNE_GENERALE = "Résous cette inéquation rationnelle.";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

const REGLAGES_NIVEAU: ReglagesInequationRationnelle = {
  niveauxActifs: ["niveau1", "niveau2", "niveau3", "niveau4", "denominateurCarre", "facteurCommun", "sansFacteurCommun", "cubique"],
  repartition: "equilibre",
};

function nouvelleSession(): EtatSessionInequationRationnelle {
  return demarrerSessionInequationRationnelle(REGLAGES_DEMO, creerGenerateurInequationRationnelle(REGLAGES_NIVEAU));
}

/**
 * Sous-séquence "reduction?→reconnaissance→champ1→champ2→factorisation?" du mécanisme
 * "méthode la plus rapide" embarqué sur un P2 donné — identique pour `exercice.numerateur`
 * (niveaux 3-4, denominateurCarre, sansFacteurCommun, cubique). `reduction` n'est incluse que si
 * elle a réellement lieu : soit déjà close (`scoreReductionDejaFixe !== null`), soit encore à
 * venir sur des coefficients pas encore réduits (`necessiteSimplification`) — cette disjonction
 * reste valable après coup car une fois la réduction close, `poly` est déjà réduit (coefficients
 * premiers entre eux) et `necessiteSimplification` y répondrait alors toujours non. `factorisation`
 * n'existe que si `poly.categorie === "cas_general"` (jamais affecté par la réduction).
 */
function sequenceReductionP2(scoreReductionDejaFixe: number | null, poly: Exercice): PhaseInequationRationnelle[] {
  const reductionApplicable = scoreReductionDejaFixe !== null || necessiteSimplification(poly);
  return [
    ...(reductionApplicable ? (["reduction"] as PhaseInequationRationnelle[]) : []),
    "reconnaissance",
    "champ1",
    "champ2",
    ...(poly.categorie === "cas_general" ? (["factorisation"] as PhaseInequationRationnelle[]) : []),
  ];
}

/** Même principe que `sequenceReductionP2`, pour `exercice.denominateur` (sansFacteurCommun
 * uniquement) — pas de "denomChamp2" : les racines de D sont fournies plus tard par "ce" elle-même. */
function sequenceDenomSansFacteurCommun(scoreDenomReductionDejaFixe: number | null, poly: Exercice): PhaseInequationRationnelle[] {
  const reductionApplicable = scoreDenomReductionDejaFixe !== null || necessiteSimplification(poly);
  return [
    ...(reductionApplicable ? (["denomReduction"] as PhaseInequationRationnelle[]) : []),
    "denomReconnaissance",
    "denomChamp1",
    ...(poly.categorie === "cas_general" ? (["denomFactorisation"] as PhaseInequationRationnelle[]) : []),
  ];
}

/** Même principe, pour D (`fraction.denominateur`, facteurCommun uniquement) — a bien son propre "champ2". */
function sequenceSimplifierDenom(scoreDejaFixe: number | null, poly: Exercice): PhaseInequationRationnelle[] {
  const reductionApplicable = scoreDejaFixe !== null || necessiteSimplification(poly);
  return [
    ...(reductionApplicable ? (["simplifierDenomReduction"] as PhaseInequationRationnelle[]) : []),
    "simplifierDenomReconnaissance",
    "simplifierDenomChamp1",
    "simplifierDenomChamp2",
    ...(poly.categorie === "cas_general" ? (["simplifierDenomFactorisation"] as PhaseInequationRationnelle[]) : []),
  ];
}

/** Même principe, pour N (`fraction.numerateur`, facteurCommun uniquement). */
function sequenceSimplifierNum(scoreDejaFixe: number | null, poly: Exercice): PhaseInequationRationnelle[] {
  const reductionApplicable = scoreDejaFixe !== null || necessiteSimplification(poly);
  return [
    ...(reductionApplicable ? (["simplifierNumReduction"] as PhaseInequationRationnelle[]) : []),
    "simplifierNumReconnaissance",
    "simplifierNumChamp1",
    "simplifierNumChamp2",
    ...(poly.categorie === "cas_general" ? (["simplifierNumFactorisation"] as PhaseInequationRationnelle[]) : []),
  ];
}

/**
 * Séquence RÉELLE des phases pour l'exercice courant, dans l'ordre où elles se déroulent — jamais
 * une liste statique indépendante du niveau (contrairement à AppAnalyseFonction.tsx) : chaque
 * niveau a sa propre séquence (voir le commentaire de tête de sessionInequationRationnelle.ts et
 * chaque fonction `soumettreReponseXxx` pour la transition exacte vers la phase suivante), avec des
 * étapes "reduction"/"denomReduction"/"simplifier*Reduction" et "factorisation"/"denomFactorisation"/
 * "simplifier*Factorisation" optionnelles selon l'exercice réellement généré.
 */
function ordrePhases(etat: EtatSessionInequationRationnelle): PhaseInequationRationnelle[] {
  const exercice = etat.exerciceCourant;

  if (exercice.niveau === "niveau1") {
    return ["ce", "racineNumerateur", "grille", "intervalle"];
  }
  if (exercice.niveau === "niveau2") {
    return ["isoler", "combiner", "ce", "racineNumerateur", "grille", "intervalle"];
  }
  if (exercice.niveau === "cubique") {
    return ["ce", "miseEnEvidence", ...sequenceReductionP2(etat.scoreReductionExercice, exercice.numerateur), "grille", "intervalle"];
  }
  if (exercice.niveau === "facteurCommun") {
    const D = denominateurFacteurCommun(exercice);
    const N = numerateurFacteurCommun(exercice);
    return [
      "ce",
      ...sequenceSimplifierDenom(etat.scoreSimplifierDenomReductionExercice, D),
      ...sequenceSimplifierNum(etat.scoreSimplifierNumReductionExercice, N),
      "simplifierFraction",
      "grille",
      "intervalle",
    ];
  }
  if (exercice.niveau === "sansFacteurCommun") {
    return [
      "isoler",
      "combiner",
      ...sequenceDenomSansFacteurCommun(etat.scoreDenomReductionExercice, exercice.denominateur),
      "ce",
      ...sequenceReductionP2(etat.scoreReductionExercice, exercice.numerateur),
      "grille",
      "intervalle",
    ];
  }
  // niveau3, niveau4, denominateurCarre
  return ["isoler", "combiner", "ce", ...sequenceReductionP2(etat.scoreReductionExercice, exercice.numerateur), "grille", "intervalle"];
}

/**
 * Signal `revele` d'une phase du PASSÉ de `etat` (déjà close) — même switch que `releveRevelePhase`
 * ci-dessus, jamais recalculé différemment, mais lu directement sur `etat` (les champs persistent
 * une fois fixés) plutôt que sur l'état transitoire `nouvelEtat` d'une transition en cours.
 */
function releveRevele(etat: EtatSessionInequationRationnelle, phase: PhaseInequationRationnelle): boolean {
  switch (phase) {
    case "isoler":
      return etat.isolerRevele;
    case "combiner":
      return etat.combinerRevele;
    case "ce":
      return etat.ceRevele;
    case "racineNumerateur":
      return etat.racineNumerateurRevele;
    case "denomReduction":
      return etat.scoreDenomReductionExercice === 0;
    case "denomReconnaissance":
      return etat.denomReconnaissanceRevele;
    case "denomChamp1":
      return etat.denomChamp1Revele;
    case "denomFactorisation":
      return etat.denomFactorisationRevele;
    case "miseEnEvidence":
      return etat.miseEnEvidenceRevele;
    case "reduction":
      return etat.scoreReductionExercice === 0;
    case "reconnaissance":
      return etat.reconnaissanceRevele;
    case "champ1":
      return etat.champ1Revele;
    case "champ2":
      return etat.champ2Revele;
    case "factorisation":
      return etat.factorisationRevele;
    case "simplifierDenomReduction":
      return etat.scoreSimplifierDenomReductionExercice === 0;
    case "simplifierDenomReconnaissance":
      return etat.simplifierDenomCategorieRevelee;
    case "simplifierDenomChamp1":
      return etat.scoreSimplifierDenomChamp1Exercice === 0;
    case "simplifierDenomChamp2":
      return etat.scoreSimplifierDenomChamp2Exercice === 0;
    case "simplifierDenomFactorisation":
      return etat.scoreSimplifierDenomFactorisationExercice === 0;
    case "simplifierNumReduction":
      return etat.scoreSimplifierNumReductionExercice === 0;
    case "simplifierNumReconnaissance":
      return etat.simplifierNumCategorieRevelee;
    case "simplifierNumChamp1":
      return etat.scoreSimplifierNumChamp1Exercice === 0;
    case "simplifierNumChamp2":
      return etat.scoreSimplifierNumChamp2Exercice === 0;
    case "simplifierNumFactorisation":
      return etat.scoreSimplifierNumFactorisationExercice === 0;
    case "simplifierFraction":
      return etat.scoreSimplifierFractionExercice === 0;
    case "grille":
      return etat.grilleRevelee;
    case "intervalle":
      return etat.resultats[etat.resultats.length - 1]?.intervalleRevele ?? false;
  }
}

/** Segments de la barre de progression en puces — "courante" sur `etat.phase`, "a-venir" après,
 * "revele"/"correcte" (via `releveRevele`) avant, suivant `ordrePhases(etat)`. */
function calculerSegmentsProgression(etat: EtatSessionInequationRationnelle): EtatPuceProgression[] {
  const phases = ordrePhases(etat);
  const indexCourant = phases.indexOf(etat.phase);
  return phases.map((phase, k) => {
    if (k > indexCourant) return "a-venir";
    if (k === indexCourant) return "courante";
    return releveRevele(etat, phase) ? "revele" : "correcte";
  });
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionInequationRationnelle;
  revele: boolean;
}

/**
 * Signal `revele` de la phase qui vient JUSTE de se terminer (`etat.phase`, avant la transition).
 * Beaucoup de phases ont un vrai booléen `xxxRevele` dédié (lu directement sur `nouvelEtat`) ; les
 * autres ("denomReduction", "reduction", et tout le groupe "simplifierXxxReduction/Champ1/Champ2/
 * Factorisation"/"simplifierFraction") n'en ont JAMAIS eu au niveau du moteur — l'ancien
 * `ResultatPanelInequationRationnelle.tsx` dérivait alors `revele` post-hoc comme `scoreXxx === 0`
 * (approximatif : une pénalité d'aide peut aussi ramener à 0 une réponse correcte mais aidée — même
 * défaut qu'avant, reproduit ici à l'identique, PAS corrigé dans cette passe). "intervalle" clôture
 * TOUJOURS l'exercice : son booléen `intervalleRevele` (un vrai booléen, pas un score) n'existe que
 * sur le dernier `resultats[...]` de `nouvelEtat`, jamais sur un champ top-level. */
function releveRevelePhase(etat: EtatSessionInequationRationnelle, nouvelEtat: EtatSessionInequationRationnelle): boolean {
  switch (etat.phase) {
    case "isoler":
      return nouvelEtat.isolerRevele;
    case "combiner":
      return nouvelEtat.combinerRevele;
    case "ce":
      return nouvelEtat.ceRevele;
    case "racineNumerateur":
      return nouvelEtat.racineNumerateurRevele;
    case "denomReduction":
      return nouvelEtat.scoreDenomReductionExercice === 0;
    case "denomReconnaissance":
      return nouvelEtat.denomReconnaissanceRevele;
    case "denomChamp1":
      return nouvelEtat.denomChamp1Revele;
    case "denomFactorisation":
      return nouvelEtat.denomFactorisationRevele;
    case "miseEnEvidence":
      return nouvelEtat.miseEnEvidenceRevele;
    case "reduction":
      return nouvelEtat.scoreReductionExercice === 0;
    case "reconnaissance":
      return nouvelEtat.reconnaissanceRevele;
    case "champ1":
      return nouvelEtat.champ1Revele;
    case "champ2":
      return nouvelEtat.champ2Revele;
    case "factorisation":
      return nouvelEtat.factorisationRevele;
    case "simplifierDenomReduction":
      return nouvelEtat.scoreSimplifierDenomReductionExercice === 0;
    case "simplifierDenomReconnaissance":
      return nouvelEtat.simplifierDenomCategorieRevelee;
    case "simplifierDenomChamp1":
      return nouvelEtat.scoreSimplifierDenomChamp1Exercice === 0;
    case "simplifierDenomChamp2":
      return nouvelEtat.scoreSimplifierDenomChamp2Exercice === 0;
    case "simplifierDenomFactorisation":
      return nouvelEtat.scoreSimplifierDenomFactorisationExercice === 0;
    case "simplifierNumReduction":
      return nouvelEtat.scoreSimplifierNumReductionExercice === 0;
    case "simplifierNumReconnaissance":
      return nouvelEtat.simplifierNumCategorieRevelee;
    case "simplifierNumChamp1":
      return nouvelEtat.scoreSimplifierNumChamp1Exercice === 0;
    case "simplifierNumChamp2":
      return nouvelEtat.scoreSimplifierNumChamp2Exercice === 0;
    case "simplifierNumFactorisation":
      return nouvelEtat.scoreSimplifierNumFactorisationExercice === 0;
    case "simplifierFraction":
      return nouvelEtat.scoreSimplifierFractionExercice === 0;
    case "grille":
      return nouvelEtat.grilleRevelee;
    case "intervalle":
      return nouvelEtat.resultats[nouvelEtat.resultats.length - 1].intervalleRevele;
  }
}

/** Reproduit exactement ce que `ResultatPanelInequationRationnelle.tsx` affichait (bloc
 * "answer-reveal") pour UNE phase donnée, scopé à l'exercice/phase qui vient juste de se terminer
 * (`etat.exerciceCourant`/`etat.phase`, jamais l'état suivant). Cet ancien panneau n'avait PAS de
 * bloc "answer-reveal" pour plusieurs phases (seule la ligne colorée du récapitulatif existait :
 * "denomReduction", "denomReconnaissance", "denomChamp1", "reduction", "reconnaissance", "champ1",
 * et toutes les étapes "Réduction"/"Reconnaissance"/"Factorisation finale" du groupe "simplifier*"
 * — seuls "simplifierXxxChamp1/Champ2/Factorisation" et "isoler" en sansFacteurCommun manquent eux
 * aussi) — fidèlement reproduit ici par `null` (pas de contenu ajouté qui n'existait pas avant). */
function reponseAttenduePhase(etat: EtatSessionInequationRationnelle): ReactNode {
  const exercice = etat.exerciceCourant;
  switch (etat.phase) {
    case "isoler":
      if (exercice.niveau === "niveau2") return <>Forme isolée attendue : {formatExpressionIsoleeLatex(exercice)}</>;
      if (exercice.niveau === "niveau3") return <>Forme isolée attendue : {formatExpressionIsoleeNiveau3Latex(exercice)}</>;
      if (exercice.niveau === "niveau4") return <>Forme isolée attendue : {formatExpressionIsoleeNiveau4Latex(exercice)}</>;
      if (exercice.niveau === "denominateurCarre") return <>Forme isolée attendue : {formatExpressionIsoleeDenominateurCarreLatex(exercice)}</>;
      return null;
    case "combiner":
      if (exercice.niveau === "niveau2") {
        return <>Numérateur combiné attendu : {formatLineaireDeveloppe(exercice.numerateur.k, exercice.numerateur.p)}</>;
      }
      if (
        exercice.niveau === "niveau3" ||
        exercice.niveau === "niveau4" ||
        exercice.niveau === "denominateurCarre" ||
        exercice.niveau === "sansFacteurCommun"
      ) {
        return <>Numérateur combiné attendu : {formatMembreGauche(exercice.numerateur.enonce)}</>;
      }
      return null;
    case "ce":
      return (
        <>
          Condition{Array.isArray(exercice.ce) ? "s" : ""} d'existence attendue{Array.isArray(exercice.ce) ? "s" : ""} :{" "}
          {Array.isArray(exercice.ce) ? exercice.ce.join(" et ") : exercice.ce}
        </>
      );
    case "racineNumerateur":
      if (
        exercice.niveau !== "niveau3" &&
        exercice.niveau !== "niveau4" &&
        exercice.niveau !== "denominateurCarre" &&
        exercice.niveau !== "facteurCommun" &&
        exercice.niveau !== "sansFacteurCommun" &&
        exercice.niveau !== "cubique"
      ) {
        return <>Racine du numérateur attendue : {exercice.numerateur.p}</>;
      }
      return null;
    case "denomReduction":
    case "denomReconnaissance":
    case "denomChamp1":
      return null;
    case "denomFactorisation":
      if (exercice.niveau === "sansFacteurCommun") {
        return (
          <>
            Forme factorisée attendue (dénominateur) :{" "}
            <Katex
              expression={`${formatFormeFactoriseeDepuisRacines(exercice.denominateur.enonce, exercice.denominateur.solution.racines)} = 0`}
            />
          </>
        );
      }
      return null;
    case "miseEnEvidence":
      if (exercice.niveau === "cubique") return <>Mise en évidence attendue : x({formatMembreGauche(exercice.numerateur.enonce)})</>;
      return null;
    case "reduction":
    case "reconnaissance":
    case "champ1":
      return null;
    case "champ2":
      if (
        exercice.niveau === "niveau3" ||
        exercice.niveau === "niveau4" ||
        exercice.niveau === "denominateurCarre" ||
        exercice.niveau === "sansFacteurCommun"
      ) {
        return <>Racines attendues (numérateur combiné) : {[...exercice.numerateur.solution.racines].sort((a, b) => a - b).join(" ; ")}</>;
      }
      if (exercice.niveau === "cubique") {
        return <>Racines attendues (facteur quadratique) : {[...exercice.numerateur.solution.racines].sort((a, b) => a - b).join(" ; ")}</>;
      }
      return null;
    case "factorisation":
      if (
        exercice.niveau === "niveau3" ||
        exercice.niveau === "niveau4" ||
        exercice.niveau === "denominateurCarre" ||
        exercice.niveau === "sansFacteurCommun" ||
        exercice.niveau === "cubique"
      ) {
        return (
          <>
            Forme factorisée attendue ({exercice.niveau === "cubique" ? "facteur quadratique" : "numérateur combiné"}) :{" "}
            <Katex expression={`${formatFormeFactoriseeDepuisRacines(exercice.numerateur.enonce, exercice.numerateur.solution.racines)} = 0`} />
          </>
        );
      }
      return null;
    case "simplifierDenomReduction":
      return null;
    case "simplifierDenomReconnaissance":
      if (exercice.niveau === "facteurCommun" && "categorie" in exercice.fraction.denominateur) {
        return <>Méthode attendue (dénominateur) : {libelleCategorie(exercice.fraction.denominateur.categorie)}</>;
      }
      return null;
    case "simplifierDenomChamp1":
      if (exercice.niveau === "facteurCommun" && "categorie" in exercice.fraction.denominateur) {
        const d = exercice.fraction.denominateur;
        return (
          <>
            Réponse attendue (dénominateur) : {d.categorie === "cas_general" ? `Δ = ${d.solution.delta}` : `${d.solution.formeFactorisee} = 0`}
          </>
        );
      }
      return null;
    case "simplifierDenomChamp2":
      if (exercice.niveau === "facteurCommun" && "categorie" in exercice.fraction.denominateur) {
        return <>Racines attendues (dénominateur) : {[...exercice.fraction.denominateur.solution.racines].sort((a, b) => a - b).join(" ; ")}</>;
      }
      return null;
    case "simplifierDenomFactorisation":
      if (exercice.niveau === "facteurCommun" && "categorie" in exercice.fraction.denominateur) {
        const d = exercice.fraction.denominateur;
        return (
          <>
            Forme factorisée attendue (dénominateur) : <Katex expression={`${formatFormeFactoriseeDepuisRacines(d.enonce, d.solution.racines)} = 0`} />
          </>
        );
      }
      return null;
    case "simplifierNumReduction":
      return null;
    case "simplifierNumReconnaissance":
      if (exercice.niveau === "facteurCommun" && "categorie" in exercice.fraction.numerateur) {
        return <>Méthode attendue (numérateur) : {libelleCategorie(exercice.fraction.numerateur.categorie)}</>;
      }
      return null;
    case "simplifierNumChamp1":
      if (exercice.niveau === "facteurCommun" && "categorie" in exercice.fraction.numerateur) {
        const n = exercice.fraction.numerateur;
        return (
          <>
            Réponse attendue (numérateur) : {n.categorie === "cas_general" ? `Δ = ${n.solution.delta}` : `${n.solution.formeFactorisee} = 0`}
          </>
        );
      }
      return null;
    case "simplifierNumChamp2":
      if (exercice.niveau === "facteurCommun" && "categorie" in exercice.fraction.numerateur) {
        return <>Racines attendues (numérateur) : {[...exercice.fraction.numerateur.solution.racines].sort((a, b) => a - b).join(" ; ")}</>;
      }
      return null;
    case "simplifierNumFactorisation":
      if (exercice.niveau === "facteurCommun" && "categorie" in exercice.fraction.numerateur) {
        const n = exercice.fraction.numerateur;
        return (
          <>
            Forme factorisée attendue (numérateur) : <Katex expression={`${formatFormeFactoriseeDepuisRacines(n.enonce, n.solution.racines)} = 0`} />
          </>
        );
      }
      return null;
    case "simplifierFraction":
      if (exercice.niveau === "facteurCommun") {
        return (
          <>
            Fraction simplifiée attendue : <Katex expression={formatFractionSimplifiee(exercice.fraction)} />
          </>
        );
      }
      return null;
    case "grille":
      return <>Tableau attendu : signe du quotient = {exercice.grille.ligneQuotient.join(" ")}</>;
    case "intervalle":
      return <>Réponse attendue : S = {formatSolutionEnsembleProduit(exercice.solution)}</>;
  }
}

export function AppInequationRationnelle() {
  const [etat, setEtat] = useState<EtatSessionInequationRationnelle>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionInequationRationnelle) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      setEnAttente({ etatSuivant: nouvelEtat, revele: releveRevelePhase(etat, nouvelEtat) });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    setEtat(enAttente.etatSuivant.terminee ? nouvelleSession() : enAttente.etatSuivant);
    setEnAttente(null);
  }

  function onGenererDev(varianteId: string) {
    setEnAttente(null);
    setEtat(demarrerSessionInequationRationnelle(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as NiveauInequationRationnelle)));
  }

  const recapitulatif = calculerRecapitulatifInequationRationnelle(etat);
  /**
   * Bloc "Énoncé" fixe (promptcorrectionsgenerateurs764transversal.md, générateur 6, point 2.1) —
   * l'inéquation de départ complète, identique quel que soit l'écran/la phase courante, passée à
   * `enonceFixe` sur chaque composant d'étape concerné. Chaque composant omet automatiquement son
   * propre `expressionAffichee` s'il duplique cette même chaîne (ex. l'écran "isoler", où
   * l'expression affichée EST l'énoncé de départ) — voir EtapeIsolement.tsx.
   */
  const enonceFixe = formatEnonceOriginalComplet(etat.exerciceCourant);
  const exerciceNiveau2 = etat.exerciceCourant.niveau === "niveau2" ? etat.exerciceCourant : undefined;
  const exerciceNiveau3 = etat.exerciceCourant.niveau === "niveau3" ? etat.exerciceCourant : undefined;
  const exerciceNiveau4 = etat.exerciceCourant.niveau === "niveau4" ? etat.exerciceCourant : undefined;
  const exerciceDenominateurCarre = etat.exerciceCourant.niveau === "denominateurCarre" ? etat.exerciceCourant : undefined;
  const exerciceFacteurCommun = etat.exerciceCourant.niveau === "facteurCommun" ? etat.exerciceCourant : undefined;
  const exerciceSansFacteurCommun = etat.exerciceCourant.niveau === "sansFacteurCommun" ? etat.exerciceCourant : undefined;
  const exerciceCubique = etat.exerciceCourant.niveau === "cubique" ? etat.exerciceCourant : undefined;
  const exerciceNumerateurLineaire =
    etat.exerciceCourant.niveau !== "niveau3" &&
    etat.exerciceCourant.niveau !== "niveau4" &&
    etat.exerciceCourant.niveau !== "denominateurCarre" &&
    etat.exerciceCourant.niveau !== "facteurCommun" &&
    etat.exerciceCourant.niveau !== "sansFacteurCommun" &&
    etat.exerciceCourant.niveau !== "cubique"
      ? etat.exerciceCourant
      : undefined;
  const exerciceNumerateurQuadratique =
    etat.exerciceCourant.niveau === "niveau3" ||
    etat.exerciceCourant.niveau === "niveau4" ||
    etat.exerciceCourant.niveau === "denominateurCarre" ||
    etat.exerciceCourant.niveau === "sansFacteurCommun" ||
    etat.exerciceCourant.niveau === "cubique"
      ? etat.exerciceCourant
      : undefined;

  /**
   * Bloc de travail "N(x) = ..." (numérateur combiné isolé). Affiche N(x) sous sa forme factorisée
   * dès que sa propre factorisation est confirmée, jamais régressé vers la forme développée
   * ensuite (point 2.3.3) — même primitive `numerateurCombineEstFactorise` que celle qui alimentait
   * l'ancien bloc "État actuel" (retiré, désormais redondant avec le récapitulatif), jamais
   * recalculée différemment. Pour `cubique`, `exercice.numerateur` ne représente que le facteur
   * quadratique RESTANT après mise en évidence de x (pas N(x) tout entier, voir
   * core/inequationRationnelle.types.ts) : le préfixe "N(x) =" y serait trompeur, remplacé par un
   * libellé textuel baké directement dans le LaTeX (même convention que formatLigneNumerateurLabel)
   * — ce bloc n'a plus de label externe séparé depuis la restructuration en 3 blocs (`expressionAffichee`
   * n'affiche qu'une simple équation-box, sans en-tête).
   */
  function blocNumerateurQuadratique(exercice: NonNullable<typeof exerciceNumerateurQuadratique>): string {
    const factorise = numerateurCombineEstFactorise(exercice, etat);
    const quadratique = factorise
      ? formatFormeFactoriseeDepuisRacines(exercice.numerateur.enonce, exercice.numerateur.solution.racines)
      : formatMembreGauche(exercice.numerateur.enonce);
    return exercice.niveau === "cubique" ? `\\text{Facteur quadratique restant : } ${quadratique}` : `N(x) = ${quadratique}`;
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttenduePhase(etat),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Inéquations rationnelles</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
      </header>

      <main className="card">
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} />

        <div className="card-body">
          <EnTeteExercice consigneGenerale={CONSIGNE_GENERALE} blocDonnees={null} />
          {etat.phase === "isoler" && exerciceNiveau2 ? (
            <EtapeIsolement
              key="isoler"
              expressionAffichee={formatEnonceOriginalNiveau2Latex(exerciceNiveau2)}
              question="Réécris cette inéquation avec 0 au membre de droite."
              label="Inéquation isolée"
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              diagnostiquer={(v) => diagnostiquerIsolementRationnelle(v, exerciceNiveau2)}
              aideActivee={etat.aideIsolerUtilisee}
              onActiverAide={() => setEtat(activerAideIsoler(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseIsoler(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "isoler" && exerciceNiveau3 ? (
            <EtapeIsolement
              key="isoler"
              expressionAffichee={formatEnonceOriginalNiveau3Latex(exerciceNiveau3)}
              question="Réécris cette inéquation avec 0 au membre de droite."
              label="Inéquation isolée"
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              diagnostiquer={(v) => diagnostiquerIsolementRationnelleNiveau3(v, exerciceNiveau3)}
              aideActivee={etat.aideIsolerUtilisee}
              onActiverAide={() => setEtat(activerAideIsoler(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseIsoler(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "isoler" && exerciceNiveau4 ? (
            <EtapeIsolement
              key="isoler"
              expressionAffichee={formatEnonceOriginalNiveau4Latex(exerciceNiveau4)}
              question="Réécris cette inéquation avec 0 au membre de droite."
              label="Inéquation isolée"
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              diagnostiquer={(v) => diagnostiquerIsolementRationnelleNiveau4(v, exerciceNiveau4)}
              aideActivee={etat.aideIsolerUtilisee}
              onActiverAide={() => setEtat(activerAideIsoler(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseIsoler(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "isoler" && exerciceDenominateurCarre ? (
            <EtapeIsolement
              key="isoler"
              expressionAffichee={formatEnonceOriginalDenominateurCarreLatex(exerciceDenominateurCarre)}
              question="Réécris cette inéquation avec 0 au membre de droite."
              label="Inéquation isolée"
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              diagnostiquer={(v) => diagnostiquerIsolementDenominateurCarre(v, exerciceDenominateurCarre)}
              aideActivee={etat.aideIsolerUtilisee}
              onActiverAide={() => setEtat(activerAideIsoler(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseIsoler(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "isoler" && exerciceSansFacteurCommun ? (
            <EtapeIsolement
              key="isoler"
              expressionAffichee={formatEnonceOriginalSansFacteurCommunLatex(exerciceSansFacteurCommun)}
              question="Réécris cette inéquation avec 0 au membre de droite."
              label="Inéquation isolée"
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              diagnostiquer={(v) => diagnostiquerIsolementSansFacteurCommun(v, exerciceSansFacteurCommun)}
              aideActivee={etat.aideIsolerUtilisee}
              onActiverAide={() => setEtat(activerAideIsoler(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseIsoler(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "combiner" && exerciceNiveau2 ? (
            <EtapeIsolement
              key="combiner"
              expressionAffichee={formatExpressionIsoleeLatex(exerciceNiveau2)}
              question="Combine cette expression en une seule fraction. Quel est le numérateur obtenu ?"
              label={`Numérateur (dénominateur inchangé : ${formatLineaireDeveloppe(exerciceNiveau2.denominateur.k, exerciceNiveau2.denominateur.p)})`}
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              diagnostiquer={(v) => diagnostiquerCombiner(v, exerciceNiveau2.numerateur)}
              aideActivee={etat.aideCombinerUtilisee}
              onActiverAide={() => setEtat(activerAideCombiner(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseCombiner(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "combiner" && exerciceNiveau3 ? (
            <EtapeIsolement
              key="combiner"
              expressionAffichee={formatExpressionIsoleeNiveau3Latex(exerciceNiveau3)}
              question="Combine cette expression en une seule fraction. Quel est le numérateur obtenu (développé) ?"
              label={`Numérateur (dénominateur inchangé : ${formatLineaireDeveloppe(exerciceNiveau3.denominateur.k, exerciceNiveau3.denominateur.p)})`}
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              diagnostiquer={(v) => diagnostiquerCombinerQuadratique(v, exerciceNiveau3.numerateur)}
              aideActivee={etat.aideCombinerUtilisee}
              onActiverAide={() => setEtat(activerAideCombiner(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseCombiner(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "combiner" && exerciceNiveau4 ? (
            <EtapeIsolement
              key="combiner"
              expressionAffichee={formatExpressionIsoleeNiveau4Latex(exerciceNiveau4)}
              question="Combine cette expression en une seule fraction. Quel est le numérateur obtenu (développé) ?"
              label={`Numérateur (dénominateur inchangé : (${formatLineaireDeveloppe(exerciceNiveau4.denominateurGauche.k, exerciceNiveau4.denominateurGauche.p)})(${formatLineaireDeveloppe(exerciceNiveau4.denominateurDroit.k, exerciceNiveau4.denominateurDroit.p)}))`}
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              diagnostiquer={(v) => diagnostiquerCombinerQuadratique(v, exerciceNiveau4.numerateur)}
              aideActivee={etat.aideCombinerUtilisee}
              onActiverAide={() => setEtat(activerAideCombiner(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseCombiner(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "combiner" && exerciceDenominateurCarre ? (
            <EtapeIsolement
              key="combiner"
              expressionAffichee={formatExpressionIsoleeDenominateurCarreLatex(exerciceDenominateurCarre)}
              question="Combine cette expression en une seule fraction. Quel est le numérateur obtenu (développé) ?"
              label={`Numérateur (dénominateur inchangé : (${formatLineaireDeveloppe(exerciceDenominateurCarre.denominateur.k, exerciceDenominateurCarre.denominateur.p)})²)`}
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              diagnostiquer={(v) => diagnostiquerCombinerQuadratique(v, exerciceDenominateurCarre.numerateur)}
              aideActivee={etat.aideCombinerUtilisee}
              onActiverAide={() => setEtat(activerAideCombiner(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseCombiner(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "combiner" && exerciceSansFacteurCommun ? (
            <EtapeIsolement
              key="combiner"
              expressionAffichee={formatExpressionIsoleeSansFacteurCommunLatex(exerciceSansFacteurCommun)}
              question="Combine cette expression en une seule fraction. Quel est le numérateur obtenu (développé) ?"
              label={`Numérateur (dénominateur inchangé : ${formatMembreGauche(exerciceSansFacteurCommun.denominateur.enonce)})`}
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              diagnostiquer={(v) => diagnostiquerCombinerQuadratique(v, exerciceSansFacteurCommun.numerateur)}
              aideActivee={etat.aideCombinerUtilisee}
              onActiverAide={() => setEtat(activerAideCombiner(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseCombiner(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "denomReduction" && exerciceSansFacteurCommun ? (
            <EtapeReductionCoefficients
              key="denomReduction"
              exercice={exerciceSansFacteurCommun.denominateur}
              nom="dénominateur"
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              diagnostiquer={(v) => diagnostiquerReductionCoefficients(exerciceSansFacteurCommun.denominateur, v)}
              aideActivee={etat.aideDenomReductionUtilisee}
              onActiverAide={() => setEtat(activerAideDenomReduction(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseDenomReduction(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "denomReconnaissance" && exerciceSansFacteurCommun ? (
            <EtapeReconnaissance
              key="denomReconnaissance"
              exercice={exerciceSansFacteurCommun.denominateur}
              expressionAffichee={formatEquationDenominateur(exerciceSansFacteurCommun.denominateur)}
              question="Quelle est la méthode la plus rapide pour factoriser ce dénominateur ?"
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              onChoisir={(choix: Categorie) => terminerEtape(soumettreReponseDenomReconnaissance(etat, choix))}
              validation={validation}
            />
          ) : etat.phase === "denomChamp1" && exerciceSansFacteurCommun ? (
            <EtapeChamp1
              key="denomChamp1"
              exercice={exerciceSansFacteurCommun.denominateur}
              expressionAffichee={formatEquationDenominateur(exerciceSansFacteurCommun.denominateur)}
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              diagnostiquer={(v) => diagnostiquerChampPrincipal(exerciceSansFacteurCommun.denominateur, v)}
              aideActivee={etat.aideDenomChamp1Utilisee}
              onActiverAide={() => setEtat(activerAideDenomChamp1(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseDenomChamp1(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "denomFactorisation" && exerciceSansFacteurCommun ? (
            <EtapeChamp1
              key="denomFactorisation"
              exercice={exerciceSansFacteurCommun.denominateur}
              expressionAffichee={formatEquationDenominateur(exerciceSansFacteurCommun.denominateur)}
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              labelFactorisation="Forme factorisée"
              etapeFactorisationForcee
              diagnostiquer={(v) => diagnostiquerFactorisationCasGeneral(exerciceSansFacteurCommun.denominateur, v)}
              aideActivee={etat.aideDenomFactorisationUtilisee}
              onActiverAide={() => setEtat(activerAideDenomFactorisation(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseDenomFactorisation(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "ce" && exerciceSansFacteurCommun ? (
            <EtapeRacinesFlexibles
              key="ce"
              exercice={exerciceSansFacteurCommun.denominateur}
              expressionAffichee={formatEnonceCombineSansFacteurCommunLatex(exerciceSansFacteurCommun)}
              labelChamp="Conditions d'existence (CE)"
              libellePasDe="Pas de CE"
              libelleAuMoins="Au moins une CE"
              placeholderPrefixe="CE"
              prefixeChamp="x \neq"
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              texteAide="Une fois le dénominateur factorisé, chaque facteur égalé à 0 donne une condition d'existence (CE)."
              aideActivee={etat.aideCeUtilisee}
              onActiverAide={() => setEtat(activerAideCe(etat))}
              onValider={(valeurs) => terminerEtape(soumettreReponseCEListe(etat, valeurs))}
              validation={validation}
            />
          ) : etat.phase === "ce" && exerciceCubique ? (
            <EtapeCEDirecte
              key="ce"
              expressionAffichee={formatEnonceCubiqueLatex(exerciceCubique)}
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              onValider={(reponse) => terminerEtape(soumettreReponseCE(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "miseEnEvidence" && exerciceCubique ? (
            <EtapeIsolement
              key="miseEnEvidence"
              expressionAffichee={formatEnonceCubiqueLatex(exerciceCubique)}
              question="Mets x en évidence dans ce numérateur."
              label="Factorisation"
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              diagnostiquer={(v) => diagnostiquerMiseEnEvidenceCubique(v, exerciceCubique.numerateur.enonce)}
              texteAide="Sors le facteur x du numérateur."
              aideActivee={etat.aideMiseEnEvidenceUtilisee}
              onActiverAide={() => setEtat(activerAideMiseEnEvidence(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseMiseEnEvidence(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "ce" && exerciceNiveau3 ? (
            <EtapeCEDirecte
              key="ce"
              expressionAffichee={formatEnonceCombineNiveau3Latex(exerciceNiveau3)}
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              onValider={(reponse) => terminerEtape(soumettreReponseCE(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "ce" && exerciceDenominateurCarre ? (
            <EtapeCEDirecte
              key="ce"
              expressionAffichee={formatEnonceCombineDenominateurCarreLatex(exerciceDenominateurCarre)}
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              onValider={(reponse) => terminerEtape(soumettreReponseCE(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "ce" && exerciceNiveau4 ? (
            <EtapeRacinesFlexibles
              key="ce"
              exercice={exerciceNiveau4.numerateur}
              expressionAffichee={formatEnonceCombineNiveau4Latex(exerciceNiveau4)}
              labelChamp="Conditions d'existence (CE)"
              libellePasDe="Pas de CE"
              libelleAuMoins="Au moins une CE"
              placeholderPrefixe="CE"
              prefixeChamp="x \neq"
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              texteAide="Une fois le dénominateur factorisé, chaque facteur égalé à 0 donne une condition d'existence (CE)."
              aideActivee={etat.aideCeUtilisee}
              onActiverAide={() => setEtat(activerAideCe(etat))}
              onValider={(valeurs) => terminerEtape(soumettreReponseCEListe(etat, valeurs))}
              validation={validation}
            />
          ) : etat.phase === "ce" && exerciceFacteurCommun ? (
            <EtapeRacinesFlexibles
              key="ce"
              exercice={denominateurFacteurCommun(exerciceFacteurCommun)}
              expressionAffichee={formatEnonceFacteurCommunLatex(exerciceFacteurCommun)}
              labelChamp="Conditions d'existence (CE)"
              libellePasDe="Pas de CE"
              libelleAuMoins="Au moins une CE"
              placeholderPrefixe="CE"
              prefixeChamp="x \neq"
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              texteAide="Une fois le dénominateur factorisé, chaque facteur égalé à 0 donne une condition d'existence (CE)."
              aideActivee={etat.aideCeUtilisee}
              onActiverAide={() => setEtat(activerAideCe(etat))}
              onValider={(valeurs) => terminerEtape(soumettreReponseCEListe(etat, valeurs))}
              validation={validation}
            />
          ) : etat.phase === "simplifierDenomReduction" && exerciceFacteurCommun ? (
            <EtapeReductionCoefficients
              key="simplifierDenomReduction"
              exercice={denominateurFacteurCommun(exerciceFacteurCommun)}
              nom="dénominateur"
              variante="miseEnEvidence"
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              expressionAfficheeTermes={[formatEquationDenominateur(denominateurFacteurCommun(exerciceFacteurCommun))]}
              diagnostiquer={(v) => diagnostiquerMiseEnEvidenceFraction(denominateurFacteurCommun(exerciceFacteurCommun), v)}
              aideActivee={etat.aideSimplifierDenomReductionUtilisee}
              onActiverAide={() => setEtat(activerAideSimplifierDenomReduction(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseSimplifierDenomReduction(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "simplifierDenomReconnaissance" && exerciceFacteurCommun ? (
            <EtapeReconnaissance
              key="simplifierDenomReconnaissance"
              exercice={denominateurFacteurCommun(exerciceFacteurCommun)}
              expressionAffichee={formatEquationDenominateur(denominateurFacteurCommun(exerciceFacteurCommun))}
              question="Quelle est la méthode la plus rapide pour factoriser ce dénominateur ?"
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              onChoisir={(choix: Categorie) => terminerEtape(soumettreChoixSimplifierDenomCategorie(etat, choix))}
              validation={validation}
            />
          ) : etat.phase === "simplifierDenomChamp1" && exerciceFacteurCommun ? (
            <EtapeChamp1
              key="simplifierDenomChamp1"
              exercice={denominateurFacteurCommun(exerciceFacteurCommun)}
              expressionAffichee={formatEquationDenominateur(denominateurFacteurCommun(exerciceFacteurCommun))}
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              diagnostiquer={(v) => diagnostiquerChampPrincipal(denominateurFacteurCommun(exerciceFacteurCommun), v)}
              aideActivee={etat.aideSimplifierDenomChamp1Utilisee}
              onActiverAide={() => setEtat(activerAideSimplifierDenomChamp1(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseSimplifierDenomChamp1(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "simplifierDenomChamp2" && exerciceFacteurCommun ? (
            <EtapeRacinesFlexibles
              key="simplifierDenomChamp2"
              exercice={denominateurFacteurCommun(exerciceFacteurCommun)}
              expressionAffichee={formatEquationDenominateur(denominateurFacteurCommun(exerciceFacteurCommun))}
              prefixeChamp="x ="
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              aideActivee={etat.aideSimplifierDenomChamp2Utilisee}
              onActiverAide={() => setEtat(activerAideSimplifierDenomChamp2(etat))}
              onValider={(racines) => terminerEtape(soumettreReponseSimplifierDenomChamp2(etat, racines))}
              validation={validation}
            />
          ) : etat.phase === "simplifierDenomFactorisation" && exerciceFacteurCommun ? (
            <EtapeChamp1
              key="simplifierDenomFactorisation"
              exercice={denominateurFacteurCommun(exerciceFacteurCommun)}
              expressionAffichee={formatEquationDenominateur(denominateurFacteurCommun(exerciceFacteurCommun))}
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              labelFactorisation="Forme factorisée"
              etapeFactorisationForcee
              diagnostiquer={(v) => diagnostiquerFactorisationCasGeneral(denominateurFacteurCommun(exerciceFacteurCommun), v)}
              aideActivee={etat.aideSimplifierDenomFactorisationUtilisee}
              onActiverAide={() => setEtat(activerAideSimplifierDenomFactorisation(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseSimplifierDenomFactorisation(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "simplifierNumReduction" && exerciceFacteurCommun ? (
            <EtapeReductionCoefficients
              key="simplifierNumReduction"
              exercice={numerateurFacteurCommun(exerciceFacteurCommun)}
              nom="numérateur"
              variante="miseEnEvidence"
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              expressionAfficheeTermes={[formatEquationNumerateur(numerateurFacteurCommun(exerciceFacteurCommun))]}
              diagnostiquer={(v) => diagnostiquerMiseEnEvidenceFraction(numerateurFacteurCommun(exerciceFacteurCommun), v)}
              aideActivee={etat.aideSimplifierNumReductionUtilisee}
              onActiverAide={() => setEtat(activerAideSimplifierNumReduction(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseSimplifierNumReduction(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "simplifierNumReconnaissance" && exerciceFacteurCommun ? (
            <EtapeReconnaissance
              key="simplifierNumReconnaissance"
              exercice={numerateurFacteurCommun(exerciceFacteurCommun)}
              expressionAffichee={formatEquationNumerateur(numerateurFacteurCommun(exerciceFacteurCommun))}
              question="Quelle est la méthode la plus rapide pour factoriser ce numérateur ?"
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              onChoisir={(choix: Categorie) => terminerEtape(soumettreChoixSimplifierNumCategorie(etat, choix))}
              validation={validation}
            />
          ) : etat.phase === "simplifierNumChamp1" && exerciceFacteurCommun ? (
            <EtapeChamp1
              key="simplifierNumChamp1"
              exercice={numerateurFacteurCommun(exerciceFacteurCommun)}
              expressionAffichee={formatEquationNumerateur(numerateurFacteurCommun(exerciceFacteurCommun))}
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              diagnostiquer={(v) => diagnostiquerChampPrincipal(numerateurFacteurCommun(exerciceFacteurCommun), v)}
              aideActivee={etat.aideSimplifierNumChamp1Utilisee}
              onActiverAide={() => setEtat(activerAideSimplifierNumChamp1(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseSimplifierNumChamp1(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "simplifierNumChamp2" && exerciceFacteurCommun ? (
            <EtapeRacinesFlexibles
              key="simplifierNumChamp2"
              exercice={numerateurFacteurCommun(exerciceFacteurCommun)}
              expressionAffichee={formatEquationNumerateur(numerateurFacteurCommun(exerciceFacteurCommun))}
              prefixeChamp="x ="
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              aideActivee={etat.aideSimplifierNumChamp2Utilisee}
              onActiverAide={() => setEtat(activerAideSimplifierNumChamp2(etat))}
              onValider={(racines) => terminerEtape(soumettreReponseSimplifierNumChamp2(etat, racines))}
              validation={validation}
            />
          ) : etat.phase === "simplifierNumFactorisation" && exerciceFacteurCommun ? (
            <EtapeChamp1
              key="simplifierNumFactorisation"
              exercice={numerateurFacteurCommun(exerciceFacteurCommun)}
              expressionAffichee={formatEquationNumerateur(numerateurFacteurCommun(exerciceFacteurCommun))}
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              labelFactorisation="Forme factorisée"
              etapeFactorisationForcee
              diagnostiquer={(v) => diagnostiquerFactorisationCasGeneral(numerateurFacteurCommun(exerciceFacteurCommun), v)}
              aideActivee={etat.aideSimplifierNumFactorisationUtilisee}
              onActiverAide={() => setEtat(activerAideSimplifierNumFactorisation(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseSimplifierNumFactorisation(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "simplifierFraction" && exerciceFacteurCommun ? (
            <EtapeSimplification
              key="simplifierFraction"
              expressionAffichee={formatEnonceFacteurCommunLatex(exerciceFacteurCommun)}
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              diagnostiquer={(n, d) => diagnostiquerSimplification(exerciceFacteurCommun.fraction, n, d)}
              aideActivee={etat.aideSimplifierFractionUtilisee}
              onActiverAide={() => setEtat(activerAideSimplifierFraction(etat))}
              onValider={(numerateur, denominateur) => terminerEtape(soumettreReponseSimplifierFraction(etat, numerateur, denominateur))}
              validation={validation}
            />
          ) : etat.phase === "ce" && exerciceNumerateurLineaire ? (
            <EtapeCEDirecte
              key="ce"
              expressionAffichee={formatEnonceInequationRationnelleLatex(exerciceNumerateurLineaire)}
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              onValider={(reponse) => terminerEtape(soumettreReponseCE(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "racineNumerateur" && exerciceNumerateurLineaire ? (
            <EtapeCEDirecte
              key="racineNumerateur"
              expressionAffichee={formatEnonceInequationRationnelleLatex(exerciceNumerateurLineaire)}
              question="Quelle est la racine du numérateur ?"
              label="Racine du numérateur"
              libellePasDe="Pas de racine"
              libelleAuMoins="Au moins une racine"
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              onValider={(reponse) => terminerEtape(soumettreReponseRacineNumerateur(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "reduction" && exerciceNumerateurQuadratique ? (
            <EtapeReductionCoefficients
              key="reduction"
              exercice={exerciceNumerateurQuadratique.numerateur}
              nom="numérateur"
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              expressionAfficheeTermes={[blocNumerateurQuadratique(exerciceNumerateurQuadratique)]}
              diagnostiquer={(v) => diagnostiquerReductionCoefficients(exerciceNumerateurQuadratique.numerateur, v)}
              aideActivee={etat.aideReductionUtilisee}
              onActiverAide={() => setEtat(activerAideReduction(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseReduction(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "reconnaissance" && exerciceNumerateurQuadratique ? (
            <EtapeReconnaissance
              key="reconnaissance"
              exercice={exerciceNumerateurQuadratique.numerateur}
              expressionAffichee={blocNumerateurQuadratique(exerciceNumerateurQuadratique)}
              question="Quelle est la méthode la plus rapide pour factoriser ce numérateur ?"
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              onChoisir={(choix: Categorie) => terminerEtape(soumettreReponseReconnaissance(etat, choix))}
              validation={validation}
            />
          ) : etat.phase === "champ1" && exerciceNumerateurQuadratique ? (
            <EtapeChamp1
              key="champ1"
              exercice={exerciceNumerateurQuadratique.numerateur}
              expressionAffichee={blocNumerateurQuadratique(exerciceNumerateurQuadratique)}
              labelFactorisation="Factorise le numérateur"
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              diagnostiquer={(v) => diagnostiquerChampPrincipal(exerciceNumerateurQuadratique.numerateur, v)}
              aideActivee={etat.aideChamp1Utilisee}
              onActiverAide={() => setEtat(activerAideChamp1(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseChamp1(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "champ2" && exerciceNumerateurQuadratique ? (
            <EtapeRacinesFlexibles
              key="champ2"
              exercice={exerciceNumerateurQuadratique.numerateur}
              expressionAffichee={blocNumerateurQuadratique(exerciceNumerateurQuadratique)}
              prefixeChamp="x ="
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              aideActivee={etat.aideChamp2Utilisee}
              onActiverAide={() => setEtat(activerAideChamp2(etat))}
              onValider={(racines) => terminerEtape(soumettreReponseChamp2(etat, racines))}
              validation={validation}
            />
          ) : etat.phase === "factorisation" && exerciceNumerateurQuadratique ? (
            <EtapeChamp1
              key="factorisation"
              exercice={exerciceNumerateurQuadratique.numerateur}
              expressionAffichee={blocNumerateurQuadratique(exerciceNumerateurQuadratique)}
              enonceFixe={enonceFixe}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              labelFactorisation="Forme factorisée"
              etapeFactorisationForcee
              diagnostiquer={(v) => diagnostiquerFactorisationCasGeneral(exerciceNumerateurQuadratique.numerateur, v)}
              aideActivee={etat.aideFactorisationUtilisee}
              onActiverAide={() => setEtat(activerAideFactorisation(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseFactorisation(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "grille" && exerciceNiveau3 ? (
            <EtapeGrilleQuotientNiveau3
              exercice={exerciceNiveau3}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              onValider={(reponse: GrilleQuotientNiveau3) => terminerEtape(soumettreReponseGrilleNiveau3(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "grille" && exerciceNiveau4 ? (
            <EtapeGrilleQuotientNiveau4
              exercice={exerciceNiveau4}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              onValider={(reponse: GrilleQuotientNiveau4) => terminerEtape(soumettreReponseGrilleNiveau4(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "grille" && exerciceDenominateurCarre ? (
            <EtapeGrilleQuotientDenominateurCarre
              exercice={exerciceDenominateurCarre}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              onValider={(reponse: GrilleQuotientNiveau3) => terminerEtape(soumettreReponseGrilleNiveau3(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "grille" && exerciceFacteurCommun ? (
            <EtapeGrilleQuotientFacteurCommun
              exercice={exerciceFacteurCommun}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              onValider={(reponse: GrilleQuotient) => terminerEtape(soumettreReponseGrille(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "grille" && exerciceSansFacteurCommun ? (
            <EtapeGrilleQuotientSansFacteurCommun
              exercice={exerciceSansFacteurCommun}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              onValider={(reponse: GrilleQuotientSansFacteurCommun) => terminerEtape(soumettreReponseGrilleNiveau4(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "grille" && exerciceCubique ? (
            <EtapeGrilleQuotientCubique
              exercice={exerciceCubique}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              onValider={(reponse: GrilleQuotientCubique) => terminerEtape(soumettreReponseGrilleCubique(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "grille" && exerciceNumerateurLineaire ? (
            <EtapeGrilleQuotient
              exercice={exerciceNumerateurLineaire}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              onValider={(reponse: GrilleQuotient) => terminerEtape(soumettreReponseGrille(etat, reponse))}
              validation={validation}
            />
          ) : (
            <EtapeIntervalleQuotient
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              aideActivee={etat.aideUtilisee}
              onActiverAide={() => setEtat(activerAideIntervalleQuotient(etat))}
              onValider={(reponse: SolutionEnsembleProduit) => terminerEtape(soumettreReponseIntervalle(etat, reponse))}
              validation={validation}
            />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
