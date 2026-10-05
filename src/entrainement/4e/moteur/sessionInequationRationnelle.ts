/**
 * Couche B — moteur de session pour l'exercice "inéquations rationnelles" (18, série 2).
 * Niveau 1 : 4 phases fixes (ce → racineNumerateur → grille → intervalle). Niveau 2 : 2 phases
 * supplémentaires en tête (isoler → combiner), avant de rejoindre exactement la même séquence que
 * le niveau 1 — possible sans aucune branche par niveau dans ce->racineNumerateur->grille->
 * intervalle car `exercice.numerateur` porte toujours le même sens (P1_3, déjà combiné) quel que
 * soit le niveau, voir core/inequationRationnelle.types.ts. Niveau 3 : mêmes isoler/combiner
 * qu'au niveau 2 (dispatch interne sur `exercice.niveau` pour choisir le bon vérificateur, le
 * numérateur combiné étant cette fois du 2nd degré), mais après "ce" la séquence bifurque vers
 * reconnaissance→champ1→champ2 (mécanisme complet de l'exercice "méthode la plus rapide" sur le
 * P2_1 embarqué, `exercice.numerateur: Exercice`) plutôt que la simple étape "racineNumerateur"
 * des niveaux 1-2, puis une grille dédiée (`soumettreReponseGrilleNiveau3`, type
 * `GrilleQuotientNiveau3` incompatible avec `GrilleQuotient` — pas de fonction unique possible sans
 * cast non sûr). Seule `phaseInitiale` (et le branchement après "ce") dispatchent sur
 * `exercice.niveau`. Réutilise verifierCEDirecte (verificationSimplification.ts, exercice
 * "Simplifier") pour les étapes "ce" ET "racineNumerateur" (niveaux 1-2), verifierChampPrincipal/
 * verifierRacines (verification.ts, exercice "méthode la plus rapide") pour
 * champ1/champ2 (niveau 3), et verifierSolutionSignesProduit (verificationSignesProduit.ts,
 * exercice "tableau de signes à plusieurs facteurs") pour l'étape intervalle, sans aucune
 * adaptation. N'importe jamais rien de src/generateurs : voir sessionInequationRationnelle.test.ts
 * pour la preuve avec des générateurs factices minimaux.
 *
 * Bouton "Aide" (étape intervalle uniquement) : révélation à sens unique, facteur ×0,5 sur le
 * score final de l'étape intervalle — même principe que activerAideIntervalle
 * (sessionInequation.ts) / activerAideGrilleSolution (sessionSignesProduit.ts).
 */
import type { Categorie, Exercice } from "../core/generateur.types";
import type {
  ExerciceInequationRationnelle,
  GenerateurExerciceInequationRationnelle,
  GrilleQuotient,
  GrilleQuotientCubique,
  GrilleQuotientNiveau3,
  GrilleQuotientNiveau4,
} from "../core/inequationRationnelle.types";
import type { ExerciceSimplification, PolynomeLineaire } from "../core/simplification.types";
import type { SolutionEnsembleProduit } from "../core/signesProduit.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { EtatEtapeTentatives, ReglagesEtape } from "./etapeTentatives";
import { verifierChampPrincipal, verifierFactorisationCasGeneral, verifierRacines } from "./verification";
import {
  diagnostiquerMiseEnEvidenceFraction,
  diagnostiquerReductionCoefficients,
  verifierCEDirecte,
  verifierSimplification,
} from "./verificationSimplification";
import { exerciceSimplifie, necessiteSimplification as necessiteReductionCoefficients } from "./simplificationEquation";
import { verifierCE } from "./verificationEquationRationnelle";
import { verifierMiseEnEvidenceCubique } from "./expressionAlgebrique";
import {
  verifierCombiner,
  verifierCombinerQuadratique,
  verifierGrilleQuotient,
  verifierGrilleQuotientCubique,
  verifierGrilleQuotientNiveau3,
  verifierGrilleQuotientNiveau4,
  verifierIsolementDenominateurCarre,
  verifierIsolementRationnelle,
  verifierIsolementRationnelleNiveau3,
  verifierIsolementRationnelleNiveau4,
  verifierIsolementSansFacteurCommun,
} from "./verificationInequationRationnelle";
import { verifierSolutionSignesProduit } from "./verificationSignesProduit";

const POINTS_DE_BASE = 100;

/**
 * "reduction"/"denomReduction"/"simplifierDenomReduction"/"simplifierNumReduction" (nouvelles,
 * prompt utilisateur du 26/09 — généralise à ce générateur l'étape déjà présente sur
 * gen1/gen2/gen3/gen4/gen5) : chaque P2 embarqué ici (exercice.numerateur pour niveau3/4,
 * denominateurCarre, sansFacteurCommun, cubique ; exercice.denominateur pour sansFacteurCommun ;
 * fraction.denominateur/numerateur pour facteurCommun) réutilise les mêmes catégories de trinômes
 * que gen1/gen3 et peut donc avoir des coefficients non réduits — sautée quand
 * pgcd(|a|,|b|,|c|)=1, sinon toujours juste avant la reconnaissance/factorisation du P2 concerné
 * ("reduction" avant "reconnaissance" ; "denomReduction" avant "denomReconnaissance" ;
 * "simplifierDenomReduction"/"simplifierNumReduction" avant leurs "simplifier*Reconnaissance"
 * respectifs). Jamais deux fois pour le même P2 : niveau3/4/denominateurCarre/sansFacteurCommun/
 * cubique n'ont qu'un seul "numerateur" ; facteurCommun a deux P2 indépendants (D et N de
 * `fraction`), chacun avec sa propre étape de réduction.
 */
export type PhaseInequationRationnelle =
  | "isoler"
  | "combiner"
  | "ce"
  | "racineNumerateur"
  | "denomReduction"
  | "denomReconnaissance"
  | "denomChamp1"
  | "denomFactorisation"
  | "miseEnEvidence"
  | "reduction"
  | "reconnaissance"
  | "champ1"
  | "champ2"
  | "factorisation"
  | "simplifierDenomReduction"
  | "simplifierDenomReconnaissance"
  | "simplifierDenomChamp1"
  | "simplifierDenomChamp2"
  | "simplifierDenomFactorisation"
  | "simplifierNumReduction"
  | "simplifierNumReconnaissance"
  | "simplifierNumChamp1"
  | "simplifierNumChamp2"
  | "simplifierNumFactorisation"
  | "simplifierFraction"
  | "grille"
  | "intervalle";

export interface ResultatExerciceInequationRationnelle {
  /** null pour un exercice niveau1 (pas d'étape isoler) */
  scoreIsoler: number | null;
  isolerRevele: boolean;
  aideIsolerUtilisee: boolean;
  /** null pour un exercice niveau1 (pas d'étape combiner) */
  scoreCombiner: number | null;
  combinerRevele: boolean;
  aideCombinerUtilisee: boolean;
  scoreCE: number;
  ceRevele: boolean;
  aideCeUtilisee: boolean;
  /** null pour un exercice niveau3 (remplacée par reconnaissance/champ1/champ2) */
  scoreRacineNumerateur: number | null;
  racineNumerateurRevele: boolean;
  /** null sauf sansFacteurCommun, et seulement si D (exercice.denominateur) était non réduit. */
  scoreDenomReduction: number | null;
  aideDenomReductionUtilisee: boolean;
  /** null sauf sansFacteurCommun — reconnaissance+factorisation de D (exercice.denominateur), avant
   * que "ce" ne fournisse ses racines (voir core/inequationRationnelle.types.ts). */
  scoreDenomReconnaissance: number | null;
  denomReconnaissanceRevele: boolean;
  scoreDenomChamp1: number | null;
  denomChamp1Revele: boolean;
  aideDenomChamp1Utilisee: boolean;
  /** null sauf sansFacteurCommun avec D en cas_general — étape de factorisation explicite de D
   * entre denomChamp1 (Δ) et ce (racines), même principe que scoreFactorisation ci-dessous. */
  scoreDenomFactorisation: number | null;
  denomFactorisationRevele: boolean;
  aideDenomFactorisationUtilisee: boolean;
  /** null sauf cubique — mise en évidence de x avant factorisation du facteur quadratique restant. */
  scoreMiseEnEvidence: number | null;
  miseEnEvidenceRevele: boolean;
  aideMiseEnEvidenceUtilisee: boolean;
  /** null sauf niveau3/4, denominateurCarre, sansFacteurCommun, cubique, et seulement si
   * exercice.numerateur était non réduit. */
  scoreReduction: number | null;
  aideReductionUtilisee: boolean;
  /** null sauf niveau3 */
  scoreReconnaissance: number | null;
  reconnaissanceRevele: boolean;
  /** null sauf niveau3 */
  scoreChamp1: number | null;
  champ1Revele: boolean;
  aideChamp1Utilisee: boolean;
  /** null sauf niveau3 */
  scoreChamp2: number | null;
  champ2Revele: boolean;
  aideChamp2Utilisee: boolean;
  /** null sauf numérateur combiné en cas_general (niveau3/4, denominateurCarre, sansFacteurCommun,
   * cubique) — étape de factorisation explicite entre champ2 (racines) et la grille, même principe
   * que l'exercice 1/3/4/5 (voir CLAUDE.md, "Factorisation après Δ"). */
  scoreFactorisation: number | null;
  factorisationRevele: boolean;
  aideFactorisationUtilisee: boolean;
  /** null sauf facteurCommun, et seulement si D (fraction.denominateur) était non réduit. */
  scoreSimplifierDenomReduction: number | null;
  aideSimplifierDenomReductionUtilisee: boolean;
  /** null sauf facteurCommun — mécanisme "Simplifier" embarqué sur D (fraction.denominateur), même
   * principe que champ1Revele/champ2Revele : reconnaissance seule tracke un drapeau de révélation
   * (voir ResultatExerciceSimplification/ResultatExerciceEquationRationnelle, même convention). */
  scoreSimplifierDenomReconnaissance: number | null;
  simplifierDenomCategorieRevelee: boolean;
  scoreSimplifierDenomChamp1: number | null;
  aideSimplifierDenomChamp1Utilisee: boolean;
  scoreSimplifierDenomChamp2: number | null;
  aideSimplifierDenomChamp2Utilisee: boolean;
  /** null sauf facteurCommun avec D en cas_general — étape de factorisation explicite entre
   * simplifierDenomChamp2 (racines) et simplifierNumReconnaissance. */
  scoreSimplifierDenomFactorisation: number | null;
  aideSimplifierDenomFactorisationUtilisee: boolean;
  /** null sauf facteurCommun, et seulement si N (fraction.numerateur) était non réduit. */
  scoreSimplifierNumReduction: number | null;
  aideSimplifierNumReductionUtilisee: boolean;
  /** null sauf facteurCommun — même mécanisme, sur N (fraction.numerateur). */
  scoreSimplifierNumReconnaissance: number | null;
  simplifierNumCategorieRevelee: boolean;
  scoreSimplifierNumChamp1: number | null;
  aideSimplifierNumChamp1Utilisee: boolean;
  scoreSimplifierNumChamp2: number | null;
  aideSimplifierNumChamp2Utilisee: boolean;
  /** null sauf facteurCommun avec N en cas_general — étape de factorisation explicite entre
   * simplifierNumChamp2 (racines) et simplifierFraction. */
  scoreSimplifierNumFactorisation: number | null;
  aideSimplifierNumFactorisationUtilisee: boolean;
  /** null sauf facteurCommun — étape finale du mécanisme "Simplifier" (produit en croix). */
  scoreSimplifierFraction: number | null;
  aideSimplifierFractionUtilisee: boolean;
  scoreGrille: number;
  grilleRevelee: boolean;
  scoreIntervalle: number;
  intervalleRevele: boolean;
  aideIntervalleUtilisee: boolean;
}

export interface EtatSessionInequationRationnelle {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceInequationRationnelle;
  /** nombre d'exercices déjà clôturés (0 au début) */
  indexExercice: number;
  exerciceCourant: ExerciceInequationRationnelle;
  phase: PhaseInequationRationnelle;
  etapeCourante: EtatEtapeTentatives;
  scoreIsolerExercice: number | null;
  isolerRevele: boolean;
  scoreCombinerExercice: number | null;
  combinerRevele: boolean;
  scoreCEExercice: number | null;
  ceRevele: boolean;
  scoreRacineNumerateurExercice: number | null;
  racineNumerateurRevele: boolean;
  scoreDenomReductionExercice: number | null;
  scoreDenomReconnaissanceExercice: number | null;
  denomReconnaissanceRevele: boolean;
  scoreDenomChamp1Exercice: number | null;
  denomChamp1Revele: boolean;
  scoreDenomFactorisationExercice: number | null;
  denomFactorisationRevele: boolean;
  scoreMiseEnEvidenceExercice: number | null;
  miseEnEvidenceRevele: boolean;
  scoreReductionExercice: number | null;
  scoreReconnaissanceExercice: number | null;
  reconnaissanceRevele: boolean;
  scoreChamp1Exercice: number | null;
  champ1Revele: boolean;
  scoreChamp2Exercice: number | null;
  champ2Revele: boolean;
  scoreFactorisationExercice: number | null;
  factorisationRevele: boolean;
  scoreSimplifierDenomReductionExercice: number | null;
  scoreSimplifierDenomReconnaissanceExercice: number | null;
  simplifierDenomCategorieRevelee: boolean;
  scoreSimplifierDenomChamp1Exercice: number | null;
  scoreSimplifierDenomChamp2Exercice: number | null;
  scoreSimplifierDenomFactorisationExercice: number | null;
  scoreSimplifierNumReductionExercice: number | null;
  scoreSimplifierNumReconnaissanceExercice: number | null;
  simplifierNumCategorieRevelee: boolean;
  scoreSimplifierNumChamp1Exercice: number | null;
  scoreSimplifierNumChamp2Exercice: number | null;
  scoreSimplifierNumFactorisationExercice: number | null;
  scoreSimplifierFractionExercice: number | null;
  scoreGrilleExercice: number | null;
  grilleRevelee: boolean;
  /** Bouton "Aide" de l'étape intervalle : révélation à sens unique, jamais remise à false pour
   * cet exercice une fois activée. Applique ×0,5 au score final de l'étape intervalle, quel que
   * soit le nombre de tentatives avant/après l'activation. */
  aideUtilisee: boolean;
  /**
   * Aides à sens unique (1 seul niveau, ×0,5 sur le score de l'étape concernée à sa clôture —
   * conceptionaidescomposantspartageshistorique.md), distinctes de `aideUtilisee` ci-dessus (qui
   * ne concerne que l'étape "intervalle") — remises à false au passage à l'exercice suivant.
   */
  aideIsolerUtilisee: boolean;
  aideCombinerUtilisee: boolean;
  aideMiseEnEvidenceUtilisee: boolean;
  aideCeUtilisee: boolean;
  aideDenomReductionUtilisee: boolean;
  aideDenomChamp1Utilisee: boolean;
  aideDenomFactorisationUtilisee: boolean;
  aideReductionUtilisee: boolean;
  aideSimplifierDenomReductionUtilisee: boolean;
  aideSimplifierDenomChamp1Utilisee: boolean;
  aideSimplifierDenomChamp2Utilisee: boolean;
  aideSimplifierDenomFactorisationUtilisee: boolean;
  aideSimplifierNumReductionUtilisee: boolean;
  aideSimplifierNumChamp1Utilisee: boolean;
  aideSimplifierNumChamp2Utilisee: boolean;
  aideSimplifierNumFactorisationUtilisee: boolean;
  aideSimplifierFractionUtilisee: boolean;
  aideChamp1Utilisee: boolean;
  aideChamp2Utilisee: boolean;
  aideFactorisationUtilisee: boolean;
  resultats: ResultatExerciceInequationRationnelle[];
  terminee: boolean;
}

const ETAT_TRANSITOIRE_VIERGE = {
  scoreIsolerExercice: null,
  isolerRevele: false,
  scoreCombinerExercice: null,
  combinerRevele: false,
  scoreCEExercice: null,
  ceRevele: false,
  scoreRacineNumerateurExercice: null,
  racineNumerateurRevele: false,
  scoreDenomReductionExercice: null,
  scoreDenomReconnaissanceExercice: null,
  denomReconnaissanceRevele: false,
  scoreDenomChamp1Exercice: null,
  denomChamp1Revele: false,
  scoreDenomFactorisationExercice: null,
  denomFactorisationRevele: false,
  scoreMiseEnEvidenceExercice: null,
  miseEnEvidenceRevele: false,
  scoreReductionExercice: null,
  scoreReconnaissanceExercice: null,
  reconnaissanceRevele: false,
  scoreChamp1Exercice: null,
  champ1Revele: false,
  scoreChamp2Exercice: null,
  champ2Revele: false,
  scoreFactorisationExercice: null,
  factorisationRevele: false,
  scoreSimplifierDenomReductionExercice: null,
  scoreSimplifierDenomReconnaissanceExercice: null,
  simplifierDenomCategorieRevelee: false,
  scoreSimplifierDenomChamp1Exercice: null,
  scoreSimplifierDenomChamp2Exercice: null,
  scoreSimplifierDenomFactorisationExercice: null,
  scoreSimplifierNumReductionExercice: null,
  scoreSimplifierNumReconnaissanceExercice: null,
  simplifierNumCategorieRevelee: false,
  scoreSimplifierNumChamp1Exercice: null,
  scoreSimplifierNumChamp2Exercice: null,
  scoreSimplifierNumFactorisationExercice: null,
  scoreSimplifierFractionExercice: null,
  scoreGrilleExercice: null,
  grilleRevelee: false,
  aideUtilisee: false,
  aideIsolerUtilisee: false,
  aideCombinerUtilisee: false,
  aideMiseEnEvidenceUtilisee: false,
  aideCeUtilisee: false,
  aideDenomReductionUtilisee: false,
  aideDenomChamp1Utilisee: false,
  aideDenomFactorisationUtilisee: false,
  aideReductionUtilisee: false,
  aideSimplifierDenomReductionUtilisee: false,
  aideSimplifierDenomChamp1Utilisee: false,
  aideSimplifierDenomChamp2Utilisee: false,
  aideSimplifierDenomFactorisationUtilisee: false,
  aideSimplifierNumReductionUtilisee: false,
  aideSimplifierNumChamp1Utilisee: false,
  aideSimplifierNumChamp2Utilisee: false,
  aideSimplifierNumFactorisationUtilisee: false,
  aideSimplifierFractionUtilisee: false,
  aideChamp1Utilisee: false,
  aideChamp2Utilisee: false,
  aideFactorisationUtilisee: false,
} as const;

/**
 * Niveaux 2 à 4 et denominateurCarre démarrent par isoler/combiner ; niveau1 et facteurCommun (pas
 * de membre de droite à isoler, l'énoncé est déjà N(x)/D(x) ◇ 0) rejoignent directement "ce".
 */
function phaseInitiale(exercice: ExerciceInequationRationnelle): PhaseInequationRationnelle {
  return exercice.niveau === "niveau1" || exercice.niveau === "facteurCommun" || exercice.niveau === "cubique" ? "ce" : "isoler";
}

export function demarrerSessionInequationRationnelle(
  reglages: ReglagesSession,
  generateur: GenerateurExerciceInequationRationnelle,
): EtatSessionInequationRationnelle {
  const exerciceCourant = generateur();
  return {
    reglages,
    generateur,
    indexExercice: 0,
    exerciceCourant,
    phase: phaseInitiale(exerciceCourant),
    etapeCourante: demarrerEtapeTentatives(),
    ...ETAT_TRANSITOIRE_VIERGE,
    resultats: [],
    terminee: false,
  };
}

function reglagesEtape(etat: EtatSessionInequationRationnelle): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

function garderPhase(etat: EtatSessionInequationRationnelle, phase: PhaseInequationRationnelle, nomFonction: string): void {
  if (etat.terminee || etat.phase !== phase) {
    throw new Error(`${nomFonction} : la session n'est pas à l'étape ${phase}`);
  }
}

/** Étape "isoler" (niveaux 2 à 4) : réécrire P1_1/P1_2 ◇ k (ou ◇ P1_3(x), ou ◇ P1_3/P1_4) sous forme ... ◇ 0. */
export function soumettreReponseIsoler(etat: EtatSessionInequationRationnelle, reponse: string): EtatSessionInequationRationnelle {
  garderPhase(etat, "isoler", "soumettreReponseIsoler");
  const exerciceCourant = etat.exerciceCourant;
  if (exerciceCourant.niveau === "niveau1" || exerciceCourant.niveau === "facteurCommun" || exerciceCourant.niveau === "cubique") {
    throw new Error("soumettreReponseIsoler : cet exercice n'a pas d'étape isoler (niveau1, facteurCommun, cubique)");
  }

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => {
      if (exerciceCourant.niveau === "niveau2") return verifierIsolementRationnelle(r, exerciceCourant);
      if (exerciceCourant.niveau === "niveau3") return verifierIsolementRationnelleNiveau3(r, exerciceCourant);
      if (exerciceCourant.niveau === "denominateurCarre") return verifierIsolementDenominateurCarre(r, exerciceCourant);
      if (exerciceCourant.niveau === "sansFacteurCommun") return verifierIsolementSansFacteurCommun(r, exerciceCourant);
      return verifierIsolementRationnelleNiveau4(r, exerciceCourant);
    },
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "combiner",
    scoreIsolerExercice: etat.aideIsolerUtilisee ? (etapeCourante.score as number) * 0.5 : etapeCourante.score,
    isolerRevele: etapeCourante.revelee,
  };
}

/** Active le bouton "Aide" de l'étape "isoler" — révélation à sens unique, ×0,5 sur le score. */
export function activerAideIsoler(etat: EtatSessionInequationRationnelle): EtatSessionInequationRationnelle {
  garderPhase(etat, "isoler", "activerAideIsoler");
  return { ...etat, aideIsolerUtilisee: true };
}

/** Étape "combiner" (niveaux 2 à 4) : dénominateur(s) fixe(s), seul le numérateur combiné est saisi (linéaire en niveau 2, quadratique en niveaux 3-4). */
export function soumettreReponseCombiner(etat: EtatSessionInequationRationnelle, reponse: string): EtatSessionInequationRationnelle {
  garderPhase(etat, "combiner", "soumettreReponseCombiner");
  const exerciceCourant = etat.exerciceCourant;
  if (exerciceCourant.niveau === "niveau1" || exerciceCourant.niveau === "facteurCommun" || exerciceCourant.niveau === "cubique") {
    throw new Error("soumettreReponseCombiner : cet exercice n'a pas d'étape combiner (niveau1, facteurCommun, cubique)");
  }

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) =>
      exerciceCourant.niveau === "niveau2"
        ? verifierCombiner(r, exerciceCourant.numerateur)
        : verifierCombinerQuadratique(r, exerciceCourant.numerateur),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase:
      exerciceCourant.niveau === "sansFacteurCommun"
        ? necessiteReductionCoefficients(exerciceCourant.denominateur)
          ? "denomReduction"
          : "denomReconnaissance"
        : "ce",
    scoreCombinerExercice: etat.aideCombinerUtilisee ? (etapeCourante.score as number) * 0.5 : etapeCourante.score,
    combinerRevele: etapeCourante.revelee,
  };
}

/** Active le bouton "Aide" de l'étape "combiner" — révélation à sens unique, ×0,5 sur le score. */
export function activerAideCombiner(etat: EtatSessionInequationRationnelle): EtatSessionInequationRationnelle {
  garderPhase(etat, "combiner", "activerAideCombiner");
  return { ...etat, aideCombinerUtilisee: true };
}

/**
 * Étape "denomReduction" (sansFacteurCommun uniquement, quand pgcd(|a|,|b|,|c|)>1 sur D — voir
 * soumettreReponseCombiner) : réduit D à coefficients premiers entre eux AVANT sa reconnaissance/
 * factorisation — même principe que soumettreReponseDenomReduction (gen3). Remplace
 * exercice.denominateur par sa version réduite une fois confirmée.
 */
export function soumettreReponseDenomReduction(etat: EtatSessionInequationRationnelle, reponse: string): EtatSessionInequationRationnelle {
  garderPhase(etat, "denomReduction", "soumettreReponseDenomReduction");
  const exerciceCourant = etat.exerciceCourant;
  if (exerciceCourant.niveau !== "sansFacteurCommun") {
    throw new Error("soumettreReponseDenomReduction : cet exercice n'a pas d'étape denomReduction (sansFacteurCommun uniquement)");
  }

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => diagnostiquerReductionCoefficients(exerciceCourant.denominateur, r) === "correct",
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    exerciceCourant: { ...exerciceCourant, denominateur: exerciceSimplifie(exerciceCourant.denominateur) },
    etapeCourante: demarrerEtapeTentatives(),
    phase: "denomReconnaissance",
    scoreDenomReductionExercice: etat.aideDenomReductionUtilisee ? (etapeCourante.score as number) * 0.5 : etapeCourante.score,
  };
}

/** Active le bouton "Aide" de l'étape "denomReduction" — révélation à sens unique, ×0,5 sur le score. */
export function activerAideDenomReduction(etat: EtatSessionInequationRationnelle): EtatSessionInequationRationnelle {
  garderPhase(etat, "denomReduction", "activerAideDenomReduction");
  return { ...etat, aideDenomReductionUtilisee: true };
}

/** Étape "denomReconnaissance" (sansFacteurCommun uniquement) : choix de la catégorie parmi les 4, pour D (exercice.denominateur). */
export function soumettreReponseDenomReconnaissance(
  etat: EtatSessionInequationRationnelle,
  choix: Categorie,
): EtatSessionInequationRationnelle {
  garderPhase(etat, "denomReconnaissance", "soumettreReponseDenomReconnaissance");
  const exerciceCourant = etat.exerciceCourant;
  if (exerciceCourant.niveau !== "sansFacteurCommun") {
    throw new Error("soumettreReponseDenomReconnaissance : cet exercice n'a pas d'étape denomReconnaissance (sansFacteurCommun uniquement)");
  }

  const etapeCourante = soumettreEtapeTentatives<Categorie>(etat.etapeCourante, choix, {
    ...reglagesEtape(etat),
    verifier: (c) => c === exerciceCourant.denominateur.categorie,
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "denomChamp1",
    scoreDenomReconnaissanceExercice: etapeCourante.score,
    denomReconnaissanceRevele: etapeCourante.revelee,
  };
}

/**
 * Étape "denomChamp1" (sansFacteurCommun uniquement) : "Factorise" ou "Δ =" pour D, selon la
 * catégorie retenue — suivie de "ce" (les racines de D SONT la CE, aucune étape denomChamp2
 * distincte n'est nécessaire, voir core/inequationRationnelle.types.ts et soumettreReponseCEListe,
 * qui vérifie déjà ces mêmes racines via exercice.ce), sauf si D est en cas_general : dans ce cas,
 * une étape "denomFactorisation" s'intercale d'abord (même principe que "factorisation" ci-dessous).
 */
export function soumettreReponseDenomChamp1(etat: EtatSessionInequationRationnelle, reponse: string): EtatSessionInequationRationnelle {
  garderPhase(etat, "denomChamp1", "soumettreReponseDenomChamp1");
  const exerciceCourant = etat.exerciceCourant;
  if (exerciceCourant.niveau !== "sansFacteurCommun") {
    throw new Error("soumettreReponseDenomChamp1 : cet exercice n'a pas d'étape denomChamp1 (sansFacteurCommun uniquement)");
  }

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierChampPrincipal(exerciceCourant.denominateur, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: exerciceCourant.denominateur.categorie === "cas_general" ? "denomFactorisation" : "ce",
    scoreDenomChamp1Exercice: etat.aideDenomChamp1Utilisee ? (etapeCourante.score as number) * 0.5 : etapeCourante.score,
    denomChamp1Revele: etapeCourante.revelee,
  };
}

/** Active le bouton "Aide" de l'étape "denomChamp1" — révélation à sens unique, ×0,5 sur le score. */
export function activerAideDenomChamp1(etat: EtatSessionInequationRationnelle): EtatSessionInequationRationnelle {
  garderPhase(etat, "denomChamp1", "activerAideDenomChamp1");
  return { ...etat, aideDenomChamp1Utilisee: true };
}

/**
 * Étape "denomFactorisation" (sansFacteurCommun uniquement, D en cas_general) : forme factorisée
 * explicite de D à partir de Δ/racines déjà confirmés, avant "ce" — réutilise
 * verifierFactorisationCasGeneral (exercice "méthode la plus rapide"), même principe que
 * soumettreReponseFactorisation ci-dessous.
 */
export function soumettreReponseDenomFactorisation(
  etat: EtatSessionInequationRationnelle,
  reponse: string,
): EtatSessionInequationRationnelle {
  garderPhase(etat, "denomFactorisation", "soumettreReponseDenomFactorisation");
  const exerciceCourant = etat.exerciceCourant;
  if (exerciceCourant.niveau !== "sansFacteurCommun") {
    throw new Error("soumettreReponseDenomFactorisation : cet exercice n'a pas d'étape denomFactorisation (sansFacteurCommun uniquement)");
  }

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierFactorisationCasGeneral(exerciceCourant.denominateur, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "ce",
    scoreDenomFactorisationExercice: etat.aideDenomFactorisationUtilisee
      ? (etapeCourante.score as number) * 0.5
      : etapeCourante.score,
    denomFactorisationRevele: etapeCourante.revelee,
  };
}

/** Active le bouton "Aide" de l'étape "denomFactorisation" — révélation à sens unique, ×0,5 sur le score. */
export function activerAideDenomFactorisation(etat: EtatSessionInequationRationnelle): EtatSessionInequationRationnelle {
  garderPhase(etat, "denomFactorisation", "activerAideDenomFactorisation");
  return { ...etat, aideDenomFactorisationUtilisee: true };
}

/** Étape "ce" (niveaux 1 à 3, une seule condition d'existence) — passage à racineNumerateur (niveaux 1-2) ou reconnaissance (niveau 3). */
export function soumettreReponseCE(etat: EtatSessionInequationRationnelle, reponse: string): EtatSessionInequationRationnelle {
  garderPhase(etat, "ce", "soumettreReponseCE");
  const exerciceCourant = etat.exerciceCourant;
  if (exerciceCourant.niveau === "niveau4" || exerciceCourant.niveau === "facteurCommun" || exerciceCourant.niveau === "sansFacteurCommun") {
    throw new Error("soumettreReponseCE : cet exercice utilise soumettreReponseCEListe (niveau4/facteurCommun/sansFacteurCommun, 2 valeurs)");
  }

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierCEDirecte(r, exerciceCourant.ce),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase:
      exerciceCourant.niveau === "cubique"
        ? "miseEnEvidence"
        : exerciceCourant.niveau === "niveau3" || exerciceCourant.niveau === "denominateurCarre"
          ? necessiteReductionCoefficients(exerciceCourant.numerateur)
            ? "reduction"
            : "reconnaissance"
          : "racineNumerateur",
    scoreCEExercice: etapeCourante.score,
    ceRevele: etapeCourante.revelee,
  };
}

/**
 * Étape "miseEnEvidence" (cubique uniquement) : l'élève factorise N(x) = ax³+bx²+cx en x·(ax²+bx+c)
 * — généralise verifierMiseEnEvidence (exercice 1) au degré 3 via verifierMiseEnEvidenceCubique,
 * comparée directement à `exercice.numerateur.enonce` (le facteur quadratique restant). Toujours
 * suivie de "reconnaissance", pour factoriser ce même facteur quadratique.
 */
export function soumettreReponseMiseEnEvidence(
  etat: EtatSessionInequationRationnelle,
  reponse: string,
): EtatSessionInequationRationnelle {
  garderPhase(etat, "miseEnEvidence", "soumettreReponseMiseEnEvidence");
  const exerciceCourant = etat.exerciceCourant;
  if (exerciceCourant.niveau !== "cubique") {
    throw new Error("soumettreReponseMiseEnEvidence : cet exercice n'a pas d'étape miseEnEvidence (cubique uniquement)");
  }

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierMiseEnEvidenceCubique(r, exerciceCourant.numerateur.enonce),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: necessiteReductionCoefficients(exerciceCourant.numerateur) ? "reduction" : "reconnaissance",
    scoreMiseEnEvidenceExercice: etat.aideMiseEnEvidenceUtilisee ? (etapeCourante.score as number) * 0.5 : etapeCourante.score,
    miseEnEvidenceRevele: etapeCourante.revelee,
  };
}

/** Active le bouton "Aide" de l'étape "miseEnEvidence" — révélation à sens unique, ×0,5 sur le score. */
export function activerAideMiseEnEvidence(etat: EtatSessionInequationRationnelle): EtatSessionInequationRationnelle {
  garderPhase(etat, "miseEnEvidence", "activerAideMiseEnEvidence");
  return { ...etat, aideMiseEnEvidenceUtilisee: true };
}

/**
 * Étape "ce" (niveau 4 et facteurCommun, 2 valeurs) : racines de P1_2 et P1_4 (niveau 4) ou de D
 * avant simplification, p et s (facteurCommun) — ordre indifférent. Toujours suivie de
 * reconnaissance (niveau4) ou simplifierDenomReconnaissance (facteurCommun, mécanisme "Simplifier"
 * embarqué — voir core/inequationRationnelle.types.ts).
 */
export function soumettreReponseCEListe(
  etat: EtatSessionInequationRationnelle,
  reponses: [number, number],
): EtatSessionInequationRationnelle {
  garderPhase(etat, "ce", "soumettreReponseCEListe");
  const exerciceCourant = etat.exerciceCourant;
  if (exerciceCourant.niveau !== "niveau4" && exerciceCourant.niveau !== "facteurCommun" && exerciceCourant.niveau !== "sansFacteurCommun") {
    throw new Error("soumettreReponseCEListe : cet exercice utilise soumettreReponseCE (niveaux 1-3/denominateurCarre, valeur unique)");
  }

  const etapeCourante = soumettreEtapeTentatives<[number, number]>(etat.etapeCourante, reponses, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierCE(r, exerciceCourant.ce),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase:
      exerciceCourant.niveau === "facteurCommun"
        ? necessiteReductionCoefficients(fractionDenominateurP2(exerciceCourant.fraction))
          ? "simplifierDenomReduction"
          : "simplifierDenomReconnaissance"
        : necessiteReductionCoefficients(exerciceCourant.numerateur)
          ? "reduction"
          : "reconnaissance",
    scoreCEExercice: etat.aideCeUtilisee ? (etapeCourante.score as number) * 0.5 : etapeCourante.score,
    ceRevele: etapeCourante.revelee,
  };
}

/**
 * Active le bouton "Aide" de l'étape "ce" — ne concerne que `soumettreReponseCEListe`
 * (`EtapeRacinesFlexibles`, niveau4/facteurCommun/sansFacteurCommun) ; `soumettreReponseCE`
 * (`EtapeCEDirecte`, une seule CE) n'a pas d'aide. Révélation à sens unique, ×0,5 sur le score.
 */
export function activerAideCe(etat: EtatSessionInequationRationnelle): EtatSessionInequationRationnelle {
  garderPhase(etat, "ce", "activerAideCe");
  return { ...etat, aideCeUtilisee: true };
}

/** Étape "racineNumerateur" (niveaux 1-2 uniquement) : la racine de exercice.numerateur (P1_3 en niveau 2, P1_1 en niveau 1), entre CE et la grille de signes. */
export function soumettreReponseRacineNumerateur(
  etat: EtatSessionInequationRationnelle,
  reponse: string,
): EtatSessionInequationRationnelle {
  garderPhase(etat, "racineNumerateur", "soumettreReponseRacineNumerateur");
  const exerciceCourant = etat.exerciceCourant;
  if (
    exerciceCourant.niveau === "niveau3" ||
    exerciceCourant.niveau === "niveau4" ||
    exerciceCourant.niveau === "denominateurCarre" ||
    exerciceCourant.niveau === "facteurCommun" ||
    exerciceCourant.niveau === "sansFacteurCommun" ||
    exerciceCourant.niveau === "cubique"
  ) {
    throw new Error(
      "soumettreReponseRacineNumerateur : cet exercice n'a pas d'étape racineNumerateur (niveaux 3-4, denominateurCarre, facteurCommun, sansFacteurCommun, cubique)",
    );
  }

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierCEDirecte(r, exerciceCourant.numerateur.p),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "grille",
    scoreRacineNumerateurExercice: etapeCourante.score,
    racineNumerateurRevele: etapeCourante.revelee,
  };
}

/**
 * Étape "reduction" (niveaux 3-4, denominateurCarre, sansFacteurCommun, cubique — uniquement quand
 * les coefficients de P2_1/exercice.numerateur ne sont pas déjà premiers entre eux) : réduire
 * a,b,c au maximum avant sa propre reconnaissance — même principe que l'étape "Simplification" de
 * l'exercice "méthode la plus rapide" (voir CLAUDE.md, moteur/simplificationEquation.ts).
 */
export function soumettreReponseReduction(etat: EtatSessionInequationRationnelle, reponse: string): EtatSessionInequationRationnelle {
  garderPhase(etat, "reduction", "soumettreReponseReduction");
  const exerciceCourant = etat.exerciceCourant;
  if (
    exerciceCourant.niveau !== "niveau3" &&
    exerciceCourant.niveau !== "niveau4" &&
    exerciceCourant.niveau !== "denominateurCarre" &&
    exerciceCourant.niveau !== "sansFacteurCommun" &&
    exerciceCourant.niveau !== "cubique"
  ) {
    throw new Error("soumettreReponseReduction : cet exercice n'a pas d'étape reduction (niveaux 1-2, facteurCommun)");
  }

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => diagnostiquerReductionCoefficients(exerciceCourant.numerateur, r) === "correct",
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    exerciceCourant: { ...exerciceCourant, numerateur: exerciceSimplifie(exerciceCourant.numerateur) },
    etapeCourante: demarrerEtapeTentatives(),
    phase: "reconnaissance",
    scoreReductionExercice: etat.aideReductionUtilisee ? (etapeCourante.score as number) * 0.5 : etapeCourante.score,
  };
}

/** Active le bouton "Aide" de l'étape "reduction" — révélation à sens unique, ×0,5 sur le score. */
export function activerAideReduction(etat: EtatSessionInequationRationnelle): EtatSessionInequationRationnelle {
  garderPhase(etat, "reduction", "activerAideReduction");
  return { ...etat, aideReductionUtilisee: true };
}

/** Étape "reconnaissance" (niveaux 3-4) : choix de la catégorie parmi les 4, pour P2_1 (exercice.numerateur). */
export function soumettreReponseReconnaissance(
  etat: EtatSessionInequationRationnelle,
  choix: Categorie,
): EtatSessionInequationRationnelle {
  garderPhase(etat, "reconnaissance", "soumettreReponseReconnaissance");
  const exerciceCourant = etat.exerciceCourant;
  if (
    exerciceCourant.niveau !== "niveau3" &&
    exerciceCourant.niveau !== "niveau4" &&
    exerciceCourant.niveau !== "denominateurCarre" &&
    exerciceCourant.niveau !== "sansFacteurCommun" &&
    exerciceCourant.niveau !== "cubique"
  ) {
    throw new Error("soumettreReponseReconnaissance : cet exercice n'a pas d'étape reconnaissance (niveaux 1-2)");
  }

  const etapeCourante = soumettreEtapeTentatives<Categorie>(etat.etapeCourante, choix, {
    ...reglagesEtape(etat),
    verifier: (c) => c === exerciceCourant.numerateur.categorie,
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "champ1",
    scoreReconnaissanceExercice: etapeCourante.score,
    reconnaissanceRevele: etapeCourante.revelee,
  };
}

/** Étape "champ1" (niveaux 3-4) : "Factorise l'équation" ou "Δ =" selon la catégorie retenue pour P2_1. */
export function soumettreReponseChamp1(etat: EtatSessionInequationRationnelle, reponse: string): EtatSessionInequationRationnelle {
  garderPhase(etat, "champ1", "soumettreReponseChamp1");
  const exerciceCourant = etat.exerciceCourant;
  if (
    exerciceCourant.niveau !== "niveau3" &&
    exerciceCourant.niveau !== "niveau4" &&
    exerciceCourant.niveau !== "denominateurCarre" &&
    exerciceCourant.niveau !== "sansFacteurCommun" &&
    exerciceCourant.niveau !== "cubique"
  ) {
    throw new Error("soumettreReponseChamp1 : cet exercice n'a pas d'étape champ1 (niveaux 1-2)");
  }

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierChampPrincipal(exerciceCourant.numerateur, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "champ2",
    scoreChamp1Exercice: etat.aideChamp1Utilisee ? (etapeCourante.score as number) * 0.5 : etapeCourante.score,
    champ1Revele: etapeCourante.revelee,
  };
}

/** Active le bouton "Aide" de l'étape "champ1" — révélation à sens unique, ×0,5 sur le score. */
export function activerAideChamp1(etat: EtatSessionInequationRationnelle): EtatSessionInequationRationnelle {
  garderPhase(etat, "champ1", "activerAideChamp1");
  return { ...etat, aideChamp1Utilisee: true };
}

/** Étape "champ2" (niveaux 3-4) : les 2 racines de P2_1. */
export function soumettreReponseChamp2(
  etat: EtatSessionInequationRationnelle,
  racines: [number, number],
): EtatSessionInequationRationnelle {
  garderPhase(etat, "champ2", "soumettreReponseChamp2");
  const exerciceCourant = etat.exerciceCourant;
  if (
    exerciceCourant.niveau !== "niveau3" &&
    exerciceCourant.niveau !== "niveau4" &&
    exerciceCourant.niveau !== "denominateurCarre" &&
    exerciceCourant.niveau !== "sansFacteurCommun" &&
    exerciceCourant.niveau !== "cubique"
  ) {
    throw new Error("soumettreReponseChamp2 : cet exercice n'a pas d'étape champ2 (niveaux 1-2)");
  }

  const etapeCourante = soumettreEtapeTentatives<[number, number]>(etat.etapeCourante, racines, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierRacines(r, exerciceCourant.numerateur),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: exerciceCourant.numerateur.categorie === "cas_general" ? "factorisation" : "grille",
    scoreChamp2Exercice: etat.aideChamp2Utilisee ? (etapeCourante.score as number) * 0.5 : etapeCourante.score,
    champ2Revele: etapeCourante.revelee,
  };
}

/** Active le bouton "Aide" de l'étape "champ2" — révélation à sens unique, ×0,5 sur le score. */
export function activerAideChamp2(etat: EtatSessionInequationRationnelle): EtatSessionInequationRationnelle {
  garderPhase(etat, "champ2", "activerAideChamp2");
  return { ...etat, aideChamp2Utilisee: true };
}

/**
 * Étape "factorisation" (niveaux 3-4, denominateurCarre, sansFacteurCommun, cubique — numérateur
 * combiné en cas_general uniquement) : forme factorisée explicite de P2_1 à partir de Δ/racines
 * déjà confirmés, avant la grille — même principe que l'exercice "méthode la plus rapide"/
 * "Simplifier"/"Équation rationnelle"/"Signes-produit" (voir CLAUDE.md, "Factorisation après Δ").
 */
export function soumettreReponseFactorisation(etat: EtatSessionInequationRationnelle, reponse: string): EtatSessionInequationRationnelle {
  garderPhase(etat, "factorisation", "soumettreReponseFactorisation");
  const exerciceCourant = etat.exerciceCourant;
  if (
    exerciceCourant.niveau !== "niveau3" &&
    exerciceCourant.niveau !== "niveau4" &&
    exerciceCourant.niveau !== "denominateurCarre" &&
    exerciceCourant.niveau !== "sansFacteurCommun" &&
    exerciceCourant.niveau !== "cubique"
  ) {
    throw new Error("soumettreReponseFactorisation : cet exercice n'a pas d'étape factorisation (niveaux 1-2)");
  }

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierFactorisationCasGeneral(exerciceCourant.numerateur, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "grille",
    scoreFactorisationExercice: etat.aideFactorisationUtilisee ? (etapeCourante.score as number) * 0.5 : etapeCourante.score,
    factorisationRevele: etapeCourante.revelee,
  };
}

/** Active le bouton "Aide" de l'étape "factorisation" — révélation à sens unique, ×0,5 sur le score. */
export function activerAideFactorisation(etat: EtatSessionInequationRationnelle): EtatSessionInequationRationnelle {
  garderPhase(etat, "factorisation", "activerAideFactorisation");
  return { ...etat, aideFactorisationUtilisee: true };
}

/** `fraction.denominateur`/`.numerateur` sont toujours des P2 pour le type "P2/P2" (seul type utilisé par facteurCommun). */
function estPolynomeLineaire(poly: Exercice | PolynomeLineaire): poly is PolynomeLineaire {
  return "k" in poly;
}
function fractionDenominateurP2(fraction: ExerciceSimplification): Exercice {
  if (estPolynomeLineaire(fraction.denominateur)) {
    throw new Error("fractionDenominateurP2 : le dénominateur de cette fraction n'est pas un P2");
  }
  return fraction.denominateur;
}
function fractionNumerateurP2(fraction: ExerciceSimplification): Exercice {
  if (estPolynomeLineaire(fraction.numerateur)) {
    throw new Error("fractionNumerateurP2 : le numérateur de cette fraction n'est pas un P2");
  }
  return fraction.numerateur;
}

/**
 * Étape "simplifierDenomReduction" (facteurCommun uniquement) : demande de mettre D
 * (fraction.denominateur) en évidence (facteur commun conservé, visible), jamais de le DIVISER —
 * contrairement au numérateur combiné d'une inéquation "◇0" (soumettreReponseReduction
 * ci-dessus), D ici est le dénominateur d'une FRACTION (N(x)/D(x)) dont la valeur doit rester
 * exactement celle de l'énoncé : diviser SEULEMENT D par ce facteur la changerait silencieusement
 * (même bug confirmé empiriquement sur gen3, capture d'écran utilisateur du 26/09). Ne modifie
 * donc jamais `fraction.denominateur` : simplifierDenomReconnaissance et la suite continuent de
 * travailler sur D d'origine, exactement comme avant l'ajout de cette étape.
 */
export function soumettreReponseSimplifierDenomReduction(
  etat: EtatSessionInequationRationnelle,
  reponse: string,
): EtatSessionInequationRationnelle {
  garderPhase(etat, "simplifierDenomReduction", "soumettreReponseSimplifierDenomReduction");
  const exerciceCourant = etat.exerciceCourant;
  if (exerciceCourant.niveau !== "facteurCommun") {
    throw new Error("soumettreReponseSimplifierDenomReduction : cet exercice n'a pas d'étape simplifierDenomReduction (facteurCommun uniquement)");
  }

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => diagnostiquerMiseEnEvidenceFraction(fractionDenominateurP2(exerciceCourant.fraction), r) === "correct",
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "simplifierDenomReconnaissance",
    scoreSimplifierDenomReductionExercice: etat.aideSimplifierDenomReductionUtilisee
      ? (etapeCourante.score as number) * 0.5
      : etapeCourante.score,
  };
}

/** Active le bouton "Aide" de l'étape "simplifierDenomReduction" — révélation à sens unique, ×0,5 sur le score. */
export function activerAideSimplifierDenomReduction(etat: EtatSessionInequationRationnelle): EtatSessionInequationRationnelle {
  garderPhase(etat, "simplifierDenomReduction", "activerAideSimplifierDenomReduction");
  return { ...etat, aideSimplifierDenomReductionUtilisee: true };
}

/** Étape "simplifierDenomReconnaissance" (facteurCommun uniquement) : choix de la catégorie parmi les 4, pour D (fraction.denominateur). */
export function soumettreChoixSimplifierDenomCategorie(
  etat: EtatSessionInequationRationnelle,
  choix: Categorie,
): EtatSessionInequationRationnelle {
  garderPhase(etat, "simplifierDenomReconnaissance", "soumettreChoixSimplifierDenomCategorie");
  const exerciceCourant = etat.exerciceCourant;
  if (exerciceCourant.niveau !== "facteurCommun") {
    throw new Error("soumettreChoixSimplifierDenomCategorie : cet exercice n'a pas d'étape simplifierDenomReconnaissance (facteurCommun uniquement)");
  }

  const etapeCourante = soumettreEtapeTentatives<Categorie>(etat.etapeCourante, choix, {
    ...reglagesEtape(etat),
    verifier: (c) => c === fractionDenominateurP2(exerciceCourant.fraction).categorie,
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "simplifierDenomChamp1",
    scoreSimplifierDenomReconnaissanceExercice: etapeCourante.score,
    simplifierDenomCategorieRevelee: etapeCourante.revelee,
  };
}

/** Étape "simplifierDenomChamp1" (facteurCommun uniquement) : "Factorise" ou "Δ =" pour D, selon la catégorie retenue. */
export function soumettreReponseSimplifierDenomChamp1(
  etat: EtatSessionInequationRationnelle,
  reponse: string,
): EtatSessionInequationRationnelle {
  garderPhase(etat, "simplifierDenomChamp1", "soumettreReponseSimplifierDenomChamp1");
  const exerciceCourant = etat.exerciceCourant;
  if (exerciceCourant.niveau !== "facteurCommun") {
    throw new Error("soumettreReponseSimplifierDenomChamp1 : cet exercice n'a pas d'étape simplifierDenomChamp1 (facteurCommun uniquement)");
  }

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierChampPrincipal(fractionDenominateurP2(exerciceCourant.fraction), r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "simplifierDenomChamp2",
    scoreSimplifierDenomChamp1Exercice: etat.aideSimplifierDenomChamp1Utilisee
      ? (etapeCourante.score as number) * 0.5
      : etapeCourante.score,
  };
}

/** Active le bouton "Aide" de l'étape "simplifierDenomChamp1" — révélation à sens unique, ×0,5 sur le score. */
export function activerAideSimplifierDenomChamp1(etat: EtatSessionInequationRationnelle): EtatSessionInequationRationnelle {
  garderPhase(etat, "simplifierDenomChamp1", "activerAideSimplifierDenomChamp1");
  return { ...etat, aideSimplifierDenomChamp1Utilisee: true };
}

/** Étape "simplifierDenomChamp2" (facteurCommun uniquement) : les racines de D (p et s) — toujours suivie de simplifierNumReconnaissance. */
export function soumettreReponseSimplifierDenomChamp2(
  etat: EtatSessionInequationRationnelle,
  racines: [number, number],
): EtatSessionInequationRationnelle {
  garderPhase(etat, "simplifierDenomChamp2", "soumettreReponseSimplifierDenomChamp2");
  const exerciceCourant = etat.exerciceCourant;
  if (exerciceCourant.niveau !== "facteurCommun") {
    throw new Error("soumettreReponseSimplifierDenomChamp2 : cet exercice n'a pas d'étape simplifierDenomChamp2 (facteurCommun uniquement)");
  }

  const etapeCourante = soumettreEtapeTentatives<[number, number]>(etat.etapeCourante, racines, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierRacines(r, fractionDenominateurP2(exerciceCourant.fraction)),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase:
      fractionDenominateurP2(exerciceCourant.fraction).categorie === "cas_general"
        ? "simplifierDenomFactorisation"
        : necessiteReductionCoefficients(fractionNumerateurP2(exerciceCourant.fraction))
          ? "simplifierNumReduction"
          : "simplifierNumReconnaissance",
    scoreSimplifierDenomChamp2Exercice: etat.aideSimplifierDenomChamp2Utilisee
      ? (etapeCourante.score as number) * 0.5
      : etapeCourante.score,
  };
}

/** Active le bouton "Aide" de l'étape "simplifierDenomChamp2" — révélation à sens unique, ×0,5 sur le score. */
export function activerAideSimplifierDenomChamp2(etat: EtatSessionInequationRationnelle): EtatSessionInequationRationnelle {
  garderPhase(etat, "simplifierDenomChamp2", "activerAideSimplifierDenomChamp2");
  return { ...etat, aideSimplifierDenomChamp2Utilisee: true };
}

/**
 * Étape "simplifierDenomFactorisation" (facteurCommun uniquement, D en cas_general) : forme
 * factorisée explicite de D avant de passer à la reconnaissance de N — même principe que
 * soumettreReponseFactorisation ci-dessus.
 */
export function soumettreReponseSimplifierDenomFactorisation(
  etat: EtatSessionInequationRationnelle,
  reponse: string,
): EtatSessionInequationRationnelle {
  garderPhase(etat, "simplifierDenomFactorisation", "soumettreReponseSimplifierDenomFactorisation");
  const exerciceCourant = etat.exerciceCourant;
  if (exerciceCourant.niveau !== "facteurCommun") {
    throw new Error("soumettreReponseSimplifierDenomFactorisation : cet exercice n'a pas d'étape simplifierDenomFactorisation (facteurCommun uniquement)");
  }

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierFactorisationCasGeneral(fractionDenominateurP2(exerciceCourant.fraction), r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: necessiteReductionCoefficients(fractionNumerateurP2(exerciceCourant.fraction)) ? "simplifierNumReduction" : "simplifierNumReconnaissance",
    scoreSimplifierDenomFactorisationExercice: etat.aideSimplifierDenomFactorisationUtilisee
      ? (etapeCourante.score as number) * 0.5
      : etapeCourante.score,
  };
}

/** Active le bouton "Aide" de l'étape "simplifierDenomFactorisation" — révélation à sens unique, ×0,5 sur le score. */
export function activerAideSimplifierDenomFactorisation(
  etat: EtatSessionInequationRationnelle,
): EtatSessionInequationRationnelle {
  garderPhase(etat, "simplifierDenomFactorisation", "activerAideSimplifierDenomFactorisation");
  return { ...etat, aideSimplifierDenomFactorisationUtilisee: true };
}

/**
 * Étape "simplifierNumReduction" (facteurCommun uniquement) : même principe que
 * soumettreReponseSimplifierDenomReduction ci-dessus, pour N (fraction.numerateur) — mise en
 * évidence du facteur commun, jamais de division qui changerait la valeur de la fraction N(x)/D(x).
 */
export function soumettreReponseSimplifierNumReduction(
  etat: EtatSessionInequationRationnelle,
  reponse: string,
): EtatSessionInequationRationnelle {
  garderPhase(etat, "simplifierNumReduction", "soumettreReponseSimplifierNumReduction");
  const exerciceCourant = etat.exerciceCourant;
  if (exerciceCourant.niveau !== "facteurCommun") {
    throw new Error("soumettreReponseSimplifierNumReduction : cet exercice n'a pas d'étape simplifierNumReduction (facteurCommun uniquement)");
  }

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => diagnostiquerMiseEnEvidenceFraction(fractionNumerateurP2(exerciceCourant.fraction), r) === "correct",
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "simplifierNumReconnaissance",
    scoreSimplifierNumReductionExercice: etat.aideSimplifierNumReductionUtilisee ? (etapeCourante.score as number) * 0.5 : etapeCourante.score,
  };
}

/** Active le bouton "Aide" de l'étape "simplifierNumReduction" — révélation à sens unique, ×0,5 sur le score. */
export function activerAideSimplifierNumReduction(etat: EtatSessionInequationRationnelle): EtatSessionInequationRationnelle {
  garderPhase(etat, "simplifierNumReduction", "activerAideSimplifierNumReduction");
  return { ...etat, aideSimplifierNumReductionUtilisee: true };
}

/** Étape "simplifierNumReconnaissance" (facteurCommun uniquement) : choix de la catégorie parmi les 4, pour N (fraction.numerateur). */
export function soumettreChoixSimplifierNumCategorie(
  etat: EtatSessionInequationRationnelle,
  choix: Categorie,
): EtatSessionInequationRationnelle {
  garderPhase(etat, "simplifierNumReconnaissance", "soumettreChoixSimplifierNumCategorie");
  const exerciceCourant = etat.exerciceCourant;
  if (exerciceCourant.niveau !== "facteurCommun") {
    throw new Error("soumettreChoixSimplifierNumCategorie : cet exercice n'a pas d'étape simplifierNumReconnaissance (facteurCommun uniquement)");
  }

  const etapeCourante = soumettreEtapeTentatives<Categorie>(etat.etapeCourante, choix, {
    ...reglagesEtape(etat),
    verifier: (c) => c === fractionNumerateurP2(exerciceCourant.fraction).categorie,
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "simplifierNumChamp1",
    scoreSimplifierNumReconnaissanceExercice: etapeCourante.score,
    simplifierNumCategorieRevelee: etapeCourante.revelee,
  };
}

/** Étape "simplifierNumChamp1" (facteurCommun uniquement) : "Factorise" ou "Δ =" pour N, selon la catégorie retenue. */
export function soumettreReponseSimplifierNumChamp1(
  etat: EtatSessionInequationRationnelle,
  reponse: string,
): EtatSessionInequationRationnelle {
  garderPhase(etat, "simplifierNumChamp1", "soumettreReponseSimplifierNumChamp1");
  const exerciceCourant = etat.exerciceCourant;
  if (exerciceCourant.niveau !== "facteurCommun") {
    throw new Error("soumettreReponseSimplifierNumChamp1 : cet exercice n'a pas d'étape simplifierNumChamp1 (facteurCommun uniquement)");
  }

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierChampPrincipal(fractionNumerateurP2(exerciceCourant.fraction), r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "simplifierNumChamp2",
    scoreSimplifierNumChamp1Exercice: etat.aideSimplifierNumChamp1Utilisee
      ? (etapeCourante.score as number) * 0.5
      : etapeCourante.score,
  };
}

/** Active le bouton "Aide" de l'étape "simplifierNumChamp1" — révélation à sens unique, ×0,5 sur le score. */
export function activerAideSimplifierNumChamp1(etat: EtatSessionInequationRationnelle): EtatSessionInequationRationnelle {
  garderPhase(etat, "simplifierNumChamp1", "activerAideSimplifierNumChamp1");
  return { ...etat, aideSimplifierNumChamp1Utilisee: true };
}

/** Étape "simplifierNumChamp2" (facteurCommun uniquement) : les racines de N (p et q) — toujours suivie de simplifierFraction. */
export function soumettreReponseSimplifierNumChamp2(
  etat: EtatSessionInequationRationnelle,
  racines: [number, number],
): EtatSessionInequationRationnelle {
  garderPhase(etat, "simplifierNumChamp2", "soumettreReponseSimplifierNumChamp2");
  const exerciceCourant = etat.exerciceCourant;
  if (exerciceCourant.niveau !== "facteurCommun") {
    throw new Error("soumettreReponseSimplifierNumChamp2 : cet exercice n'a pas d'étape simplifierNumChamp2 (facteurCommun uniquement)");
  }

  const etapeCourante = soumettreEtapeTentatives<[number, number]>(etat.etapeCourante, racines, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierRacines(r, fractionNumerateurP2(exerciceCourant.fraction)),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: fractionNumerateurP2(exerciceCourant.fraction).categorie === "cas_general" ? "simplifierNumFactorisation" : "simplifierFraction",
    scoreSimplifierNumChamp2Exercice: etat.aideSimplifierNumChamp2Utilisee
      ? (etapeCourante.score as number) * 0.5
      : etapeCourante.score,
  };
}

/** Active le bouton "Aide" de l'étape "simplifierNumChamp2" — révélation à sens unique, ×0,5 sur le score. */
export function activerAideSimplifierNumChamp2(etat: EtatSessionInequationRationnelle): EtatSessionInequationRationnelle {
  garderPhase(etat, "simplifierNumChamp2", "activerAideSimplifierNumChamp2");
  return { ...etat, aideSimplifierNumChamp2Utilisee: true };
}

/**
 * Étape "simplifierNumFactorisation" (facteurCommun uniquement, N en cas_general) : forme
 * factorisée explicite de N avant "simplifierFraction" — même principe que
 * soumettreReponseSimplifierDenomFactorisation ci-dessus.
 */
export function soumettreReponseSimplifierNumFactorisation(
  etat: EtatSessionInequationRationnelle,
  reponse: string,
): EtatSessionInequationRationnelle {
  garderPhase(etat, "simplifierNumFactorisation", "soumettreReponseSimplifierNumFactorisation");
  const exerciceCourant = etat.exerciceCourant;
  if (exerciceCourant.niveau !== "facteurCommun") {
    throw new Error("soumettreReponseSimplifierNumFactorisation : cet exercice n'a pas d'étape simplifierNumFactorisation (facteurCommun uniquement)");
  }

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierFactorisationCasGeneral(fractionNumerateurP2(exerciceCourant.fraction), r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "simplifierFraction",
    scoreSimplifierNumFactorisationExercice: etat.aideSimplifierNumFactorisationUtilisee
      ? (etapeCourante.score as number) * 0.5
      : etapeCourante.score,
  };
}

/** Active le bouton "Aide" de l'étape "simplifierNumFactorisation" — révélation à sens unique, ×0,5 sur le score. */
export function activerAideSimplifierNumFactorisation(
  etat: EtatSessionInequationRationnelle,
): EtatSessionInequationRationnelle {
  garderPhase(etat, "simplifierNumFactorisation", "activerAideSimplifierNumFactorisation");
  return { ...etat, aideSimplifierNumFactorisationUtilisee: true };
}

/**
 * Étape "simplifierFraction" (facteurCommun uniquement) : les 2 champs numérateur/dénominateur
 * simplifiés de `exercice.fraction` — réutilise verifierSimplification telle quelle (exercice
 * "Simplifier"), déjà générique sur ExerciceSimplification (produit en croix + contrôle
 * structurel). Toujours suivie de "grille" (jamais de couplage avec la révélation ou non de cette
 * étape : même si la simplification est révélée après échec, la grille de référence reste
 * construite à partir de la vraie simplification — exercice.grille, jamais une saisie de l'élève).
 */
export function soumettreReponseSimplifierFraction(
  etat: EtatSessionInequationRationnelle,
  numerateurSaisi: string,
  denominateurSaisi: string,
): EtatSessionInequationRationnelle {
  garderPhase(etat, "simplifierFraction", "soumettreReponseSimplifierFraction");
  const exerciceCourant = etat.exerciceCourant;
  if (exerciceCourant.niveau !== "facteurCommun") {
    throw new Error("soumettreReponseSimplifierFraction : cet exercice n'a pas d'étape simplifierFraction (facteurCommun uniquement)");
  }

  const etapeCourante = soumettreEtapeTentatives<[string, string]>(etat.etapeCourante, [numerateurSaisi, denominateurSaisi], {
    ...reglagesEtape(etat),
    verifier: ([n, d]) => verifierSimplification(exerciceCourant.fraction, n, d),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "grille",
    scoreSimplifierFractionExercice: etat.aideSimplifierFractionUtilisee
      ? (etapeCourante.score as number) * 0.5
      : etapeCourante.score,
  };
}

/** Active le bouton "Aide" de l'étape "simplifierFraction" — révélation à sens unique, ×0,5 sur le score. */
export function activerAideSimplifierFraction(etat: EtatSessionInequationRationnelle): EtatSessionInequationRationnelle {
  garderPhase(etat, "simplifierFraction", "activerAideSimplifierFraction");
  return { ...etat, aideSimplifierFractionUtilisee: true };
}

/** Étape "grille" (niveaux 1-2) : toute la grille (N, D, quotient) en une seule tentative globale. */
export function soumettreReponseGrille(
  etat: EtatSessionInequationRationnelle,
  reponse: GrilleQuotient,
): EtatSessionInequationRationnelle {
  garderPhase(etat, "grille", "soumettreReponseGrille");
  const exerciceCourant = etat.exerciceCourant;
  if (
    exerciceCourant.niveau === "niveau3" ||
    exerciceCourant.niveau === "niveau4" ||
    exerciceCourant.niveau === "denominateurCarre" ||
    exerciceCourant.niveau === "sansFacteurCommun" ||
    exerciceCourant.niveau === "cubique"
  ) {
    throw new Error(
      "soumettreReponseGrille : cet exercice utilise soumettreReponseGrilleNiveau3/4/Cubique (niveaux 3-4, denominateurCarre, sansFacteurCommun, cubique)",
    );
  }

  const etapeCourante = soumettreEtapeTentatives<GrilleQuotient>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierGrilleQuotient(r, exerciceCourant.grille),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "intervalle",
    scoreGrilleExercice: etapeCourante.score,
    grilleRevelee: etapeCourante.revelee,
  };
}

/** Étape "grille" (niveau 3 et denominateurCarre — même type GrilleQuotientNiveau3, voir core/inequationRationnelle.types.ts) : 2 lignes N + 1 ligne D + le quotient, en une seule tentative globale. */
export function soumettreReponseGrilleNiveau3(
  etat: EtatSessionInequationRationnelle,
  reponse: GrilleQuotientNiveau3,
): EtatSessionInequationRationnelle {
  garderPhase(etat, "grille", "soumettreReponseGrilleNiveau3");
  const exerciceCourant = etat.exerciceCourant;
  if (exerciceCourant.niveau !== "niveau3" && exerciceCourant.niveau !== "denominateurCarre") {
    throw new Error("soumettreReponseGrilleNiveau3 : cet exercice utilise soumettreReponseGrille (niveaux 1-2) ou GrilleNiveau4 (niveau4)");
  }

  const etapeCourante = soumettreEtapeTentatives<GrilleQuotientNiveau3>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierGrilleQuotientNiveau3(r, exerciceCourant.grille),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "intervalle",
    scoreGrilleExercice: etapeCourante.score,
    grilleRevelee: etapeCourante.revelee,
  };
}

/** Étape "grille" (cubique uniquement) : 3 lignes N (le facteur x, plus les 2 racines du facteur quadratique) + 1 ligne D + le quotient, en une seule tentative globale. */
export function soumettreReponseGrilleCubique(
  etat: EtatSessionInequationRationnelle,
  reponse: GrilleQuotientCubique,
): EtatSessionInequationRationnelle {
  garderPhase(etat, "grille", "soumettreReponseGrilleCubique");
  const exerciceCourant = etat.exerciceCourant;
  if (exerciceCourant.niveau !== "cubique") {
    throw new Error("soumettreReponseGrilleCubique : cet exercice utilise soumettreReponseGrille/GrilleNiveau3/GrilleNiveau4 (autres niveaux)");
  }

  const etapeCourante = soumettreEtapeTentatives<GrilleQuotientCubique>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierGrilleQuotientCubique(r, exerciceCourant.grille),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "intervalle",
    scoreGrilleExercice: etapeCourante.score,
    grilleRevelee: etapeCourante.revelee,
  };
}

/** Étape "grille" (niveau 4 uniquement) : 2 lignes N (racines de P2_1) + 2 lignes D (P1_2, P1_4) + le quotient, en une seule tentative globale. */
export function soumettreReponseGrilleNiveau4(
  etat: EtatSessionInequationRationnelle,
  reponse: GrilleQuotientNiveau4,
): EtatSessionInequationRationnelle {
  garderPhase(etat, "grille", "soumettreReponseGrilleNiveau4");
  const exerciceCourant = etat.exerciceCourant;
  if (exerciceCourant.niveau !== "niveau4" && exerciceCourant.niveau !== "sansFacteurCommun") {
    throw new Error("soumettreReponseGrilleNiveau4 : cet exercice utilise soumettreReponseGrille/GrilleNiveau3 (niveaux 1-3)");
  }

  const etapeCourante = soumettreEtapeTentatives<GrilleQuotientNiveau4>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierGrilleQuotientNiveau4(r, exerciceCourant.grille),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "intervalle",
    scoreGrilleExercice: etapeCourante.score,
    grilleRevelee: etapeCourante.revelee,
  };
}

/**
 * Active le bouton "Aide" pour l'étape intervalle en cours : révélation à sens unique (jamais de
 * retour à false pour cet exercice), applique ×0,5 au score final de cette étape dans
 * soumettreReponseIntervalle, quel que soit le nombre de tentatives déjà utilisées ou à venir.
 */
export function activerAideIntervalleQuotient(etat: EtatSessionInequationRationnelle): EtatSessionInequationRationnelle {
  if (etat.terminee || etat.phase !== "intervalle") {
    throw new Error("activerAideIntervalleQuotient : la session n'est pas à l'étape intervalle");
  }
  return { ...etat, aideUtilisee: true };
}

/** Étape "intervalle" : finale, clôture l'exercice et agrège les scores (6 pour niveau2, 4 pour niveau1 — isoler/combiner restent null). */
export function soumettreReponseIntervalle(
  etat: EtatSessionInequationRationnelle,
  reponse: SolutionEnsembleProduit,
): EtatSessionInequationRationnelle {
  garderPhase(etat, "intervalle", "soumettreReponseIntervalle");

  const etapeCourante = soumettreEtapeTentatives<SolutionEnsembleProduit>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierSolutionSignesProduit(r, etat.exerciceCourant.solution),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const scoreIntervalle = etat.aideUtilisee ? (etapeCourante.score as number) * 0.5 : (etapeCourante.score as number);

  const resultat: ResultatExerciceInequationRationnelle = {
    scoreIsoler: etat.scoreIsolerExercice,
    isolerRevele: etat.isolerRevele,
    aideIsolerUtilisee: etat.aideIsolerUtilisee,
    scoreCombiner: etat.scoreCombinerExercice,
    combinerRevele: etat.combinerRevele,
    aideCombinerUtilisee: etat.aideCombinerUtilisee,
    scoreCE: etat.scoreCEExercice as number,
    ceRevele: etat.ceRevele,
    aideCeUtilisee: etat.aideCeUtilisee,
    scoreRacineNumerateur: etat.scoreRacineNumerateurExercice,
    racineNumerateurRevele: etat.racineNumerateurRevele,
    scoreDenomReduction: etat.scoreDenomReductionExercice,
    aideDenomReductionUtilisee: etat.aideDenomReductionUtilisee,
    scoreDenomReconnaissance: etat.scoreDenomReconnaissanceExercice,
    denomReconnaissanceRevele: etat.denomReconnaissanceRevele,
    scoreDenomChamp1: etat.scoreDenomChamp1Exercice,
    denomChamp1Revele: etat.denomChamp1Revele,
    aideDenomChamp1Utilisee: etat.aideDenomChamp1Utilisee,
    scoreDenomFactorisation: etat.scoreDenomFactorisationExercice,
    denomFactorisationRevele: etat.denomFactorisationRevele,
    aideDenomFactorisationUtilisee: etat.aideDenomFactorisationUtilisee,
    scoreMiseEnEvidence: etat.scoreMiseEnEvidenceExercice,
    miseEnEvidenceRevele: etat.miseEnEvidenceRevele,
    aideMiseEnEvidenceUtilisee: etat.aideMiseEnEvidenceUtilisee,
    scoreReduction: etat.scoreReductionExercice,
    aideReductionUtilisee: etat.aideReductionUtilisee,
    scoreReconnaissance: etat.scoreReconnaissanceExercice,
    reconnaissanceRevele: etat.reconnaissanceRevele,
    scoreChamp1: etat.scoreChamp1Exercice,
    champ1Revele: etat.champ1Revele,
    aideChamp1Utilisee: etat.aideChamp1Utilisee,
    scoreChamp2: etat.scoreChamp2Exercice,
    champ2Revele: etat.champ2Revele,
    aideChamp2Utilisee: etat.aideChamp2Utilisee,
    scoreFactorisation: etat.scoreFactorisationExercice,
    factorisationRevele: etat.factorisationRevele,
    aideFactorisationUtilisee: etat.aideFactorisationUtilisee,
    scoreSimplifierDenomReduction: etat.scoreSimplifierDenomReductionExercice,
    aideSimplifierDenomReductionUtilisee: etat.aideSimplifierDenomReductionUtilisee,
    scoreSimplifierDenomReconnaissance: etat.scoreSimplifierDenomReconnaissanceExercice,
    simplifierDenomCategorieRevelee: etat.simplifierDenomCategorieRevelee,
    scoreSimplifierDenomChamp1: etat.scoreSimplifierDenomChamp1Exercice,
    aideSimplifierDenomChamp1Utilisee: etat.aideSimplifierDenomChamp1Utilisee,
    scoreSimplifierDenomChamp2: etat.scoreSimplifierDenomChamp2Exercice,
    aideSimplifierDenomChamp2Utilisee: etat.aideSimplifierDenomChamp2Utilisee,
    scoreSimplifierDenomFactorisation: etat.scoreSimplifierDenomFactorisationExercice,
    aideSimplifierDenomFactorisationUtilisee: etat.aideSimplifierDenomFactorisationUtilisee,
    scoreSimplifierNumReduction: etat.scoreSimplifierNumReductionExercice,
    aideSimplifierNumReductionUtilisee: etat.aideSimplifierNumReductionUtilisee,
    scoreSimplifierNumReconnaissance: etat.scoreSimplifierNumReconnaissanceExercice,
    simplifierNumCategorieRevelee: etat.simplifierNumCategorieRevelee,
    scoreSimplifierNumChamp1: etat.scoreSimplifierNumChamp1Exercice,
    aideSimplifierNumChamp1Utilisee: etat.aideSimplifierNumChamp1Utilisee,
    scoreSimplifierNumChamp2: etat.scoreSimplifierNumChamp2Exercice,
    aideSimplifierNumChamp2Utilisee: etat.aideSimplifierNumChamp2Utilisee,
    scoreSimplifierNumFactorisation: etat.scoreSimplifierNumFactorisationExercice,
    aideSimplifierNumFactorisationUtilisee: etat.aideSimplifierNumFactorisationUtilisee,
    scoreSimplifierFraction: etat.scoreSimplifierFractionExercice,
    aideSimplifierFractionUtilisee: etat.aideSimplifierFractionUtilisee,
    scoreGrille: etat.scoreGrilleExercice as number,
    grilleRevelee: etat.grilleRevelee,
    scoreIntervalle,
    intervalleRevele: etapeCourante.revelee,
    aideIntervalleUtilisee: etat.aideUtilisee,
  };

  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;

  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }

  const exerciceCourant = etat.generateur();
  return {
    ...etat,
    resultats,
    indexExercice,
    exerciceCourant,
    phase: phaseInitiale(exerciceCourant),
    etapeCourante: demarrerEtapeTentatives(),
    ...ETAT_TRANSITOIRE_VIERGE,
  };
}
