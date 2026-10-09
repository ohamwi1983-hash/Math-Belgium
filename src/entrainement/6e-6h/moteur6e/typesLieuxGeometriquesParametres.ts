import type { ExerciceLieuxGeometriquesParametres } from "../core6e/lieuxGeometriquesParametres.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session pour `6gen56`. Longueur de chaîne d'écrans VARIABLE selon la
 * famille, le sous-type ET (familles B/E) le RÉGIME tiré — mirroir du patron
 * `typesDenombrementFondamental.ts` (6gen43) :
 * - Famille A : "paralleles"/"nonBorne"=2 écrans, "losange"=3.
 * - Famille B : TOUJOURS 4 écrans pour les 6 sous-types (écran3 réel pour les 3 sous-types à seuil,
 *   écran3 ALLÉGÉ — confirmation qu'aucun seuil ne s'applique — pour les 3 sans seuil : jamais
 *   sauté, pour rendre le piège explicite plutôt que silencieux).
 * - Famille C : toujours 2 écrans.
 * - Famille D : toujours 3 écrans (3 sous-types).
 * - Famille E : "perpendiculaires"/"secantes"=2 écrans (écran2 ET écran3 réellement SAUTÉS,
 *   aucun seuil n'a jamais de prise ici) ; "paralleles"/"carre"=4 écrans SAUF si regime==="vide"
 *   (alors 3 : rien à ajouter après avoir établi ∅ au régime).
 */

export type PhaseLieuxGeometriquesParametres =
  | "aParallelesEcran1"
  | "aParallelesEcran2"
  | "aNonBorneEcran1"
  | "aNonBorneEcran2"
  | "aLosangeEcran1"
  | "aLosangeEcran2"
  | "aLosangeEcran3"
  | "bBissectricesEcran1"
  | "bBissectricesEcran2"
  | "bBissectricesEcran3"
  | "bBissectricesEcran4"
  | "bDroiteEcran1"
  | "bDroiteEcran2"
  | "bDroiteEcran3"
  | "bDroiteEcran4"
  | "bCerclePerpEcran1"
  | "bCerclePerpEcran2"
  | "bCerclePerpEcran3"
  | "bCerclePerpEcran4"
  | "bSeuil2PointsEcran1"
  | "bSeuil2PointsEcran2"
  | "bSeuil2PointsEcran3"
  | "bSeuil2PointsEcran4"
  | "bApolloniusEcran1"
  | "bApolloniusEcran2"
  | "bApolloniusEcran3"
  | "bApolloniusEcran4"
  | "bSeuilCarreEcran1"
  | "bSeuilCarreEcran2"
  | "bSeuilCarreEcran3"
  | "bSeuilCarreEcran4"
  | "cEcran1"
  | "cEcran2"
  | "dSubstitutionEcran1"
  | "dSubstitutionEcran2"
  | "dSubstitutionEcran3"
  | "dFractionsEcran1"
  | "dFractionsEcran2"
  | "dFractionsEcran3"
  | "dRatioEcran1"
  | "dRatioEcran2"
  | "dRatioEcran3"
  | "eParallelesEcran1"
  | "eParallelesEcran2"
  | "eParallelesEcran3"
  | "eParallelesEcran4"
  | "ePerpendiculairesEcran1"
  | "ePerpendiculairesEcran4"
  | "eSecantesEcran1"
  | "eSecantesEcran4"
  | "eCarreEcran1"
  | "eCarreEcran2"
  | "eCarreEcran3"
  | "eCarreEcran4";

export function phaseInitiale(exercice: ExerciceLieuxGeometriquesParametres): PhaseLieuxGeometriquesParametres {
  switch (exercice.famille) {
    case "A":
      if (exercice.sousType === "paralleles") return "aParallelesEcran1";
      if (exercice.sousType === "nonBorne") return "aNonBorneEcran1";
      return "aLosangeEcran1";
    case "B":
      switch (exercice.sousType) {
        case "bissectrices":
          return "bBissectricesEcran1";
        case "droite":
          return "bDroiteEcran1";
        case "cerclePerp":
          return "bCerclePerpEcran1";
        case "seuil2Points":
          return "bSeuil2PointsEcran1";
        case "apollonius":
          return "bApolloniusEcran1";
        case "seuilCarre":
          return "bSeuilCarreEcran1";
      }
      break;
    case "C":
      return "cEcran1";
    case "D":
      if (exercice.sousType === "substitution") return "dSubstitutionEcran1";
      if (exercice.sousType === "fractions") return "dFractionsEcran1";
      return "dRatioEcran1";
    case "E":
      if (exercice.sousType === "paralleles") return "eParallelesEcran1";
      if (exercice.sousType === "perpendiculaires") return "ePerpendiculairesEcran1";
      if (exercice.sousType === "secantes") return "eSecantesEcran1";
      return "eCarreEcran1";
  }
  /* c8 ignore next */
  throw new Error("phaseInitiale : exercice inconnu");
}

/** `phaseApres` a besoin de l'exercice complet (pas seulement la phase) pour les 2 sauts
 * conditionnels : famille E "paralleles"/"carre" sautent l'écran4 quand `regime==="vide"` (rien à
 * ajouter après avoir établi ∅). Toutes les autres transitions sont FIXES (indépendantes du tirage) —
 * mirroir `typesDenombrementFondamental.ts` (6gen43), signature élargie ici (`exercice` en plus de
 * `phase`) car 6gen43 n'avait aucun saut dépendant d'une valeur RÉGIME (seulement du sous-type). */
export function phaseApres(exercice: ExerciceLieuxGeometriquesParametres, phase: PhaseLieuxGeometriquesParametres): PhaseLieuxGeometriquesParametres | "termine" {
  switch (phase) {
    case "aParallelesEcran1":
      return "aParallelesEcran2";
    case "aParallelesEcran2":
      return "termine";
    case "aNonBorneEcran1":
      return "aNonBorneEcran2";
    case "aNonBorneEcran2":
      return "termine";
    case "aLosangeEcran1":
      return "aLosangeEcran2";
    case "aLosangeEcran2":
      return "aLosangeEcran3";
    case "aLosangeEcran3":
      return "termine";

    case "bBissectricesEcran1":
      return "bBissectricesEcran2";
    case "bBissectricesEcran2":
      return "bBissectricesEcran3";
    case "bBissectricesEcran3":
      return "bBissectricesEcran4";
    case "bBissectricesEcran4":
      return "termine";

    case "bDroiteEcran1":
      return "bDroiteEcran2";
    case "bDroiteEcran2":
      return "bDroiteEcran3";
    case "bDroiteEcran3":
      return "bDroiteEcran4";
    case "bDroiteEcran4":
      return "termine";

    case "bCerclePerpEcran1":
      return "bCerclePerpEcran2";
    case "bCerclePerpEcran2":
      return "bCerclePerpEcran3";
    case "bCerclePerpEcran3":
      return "bCerclePerpEcran4";
    case "bCerclePerpEcran4":
      return "termine";

    case "bSeuil2PointsEcran1":
      return "bSeuil2PointsEcran2";
    case "bSeuil2PointsEcran2":
      return "bSeuil2PointsEcran3";
    case "bSeuil2PointsEcran3":
      return "bSeuil2PointsEcran4";
    case "bSeuil2PointsEcran4":
      return "termine";

    case "bApolloniusEcran1":
      return "bApolloniusEcran2";
    case "bApolloniusEcran2":
      return "bApolloniusEcran3";
    case "bApolloniusEcran3":
      return "bApolloniusEcran4";
    case "bApolloniusEcran4":
      return "termine";

    case "bSeuilCarreEcran1":
      return "bSeuilCarreEcran2";
    case "bSeuilCarreEcran2":
      return "bSeuilCarreEcran3";
    case "bSeuilCarreEcran3":
      return "bSeuilCarreEcran4";
    case "bSeuilCarreEcran4":
      return "termine";

    case "cEcran1":
      return "cEcran2";
    case "cEcran2":
      return "termine";

    case "dSubstitutionEcran1":
      return "dSubstitutionEcran2";
    case "dSubstitutionEcran2":
      return "dSubstitutionEcran3";
    case "dSubstitutionEcran3":
      return "termine";
    case "dFractionsEcran1":
      return "dFractionsEcran2";
    case "dFractionsEcran2":
      return "dFractionsEcran3";
    case "dFractionsEcran3":
      return "termine";
    case "dRatioEcran1":
      return "dRatioEcran2";
    case "dRatioEcran2":
      return "dRatioEcran3";
    case "dRatioEcran3":
      return "termine";

    case "eParallelesEcran1":
      return "eParallelesEcran2";
    case "eParallelesEcran2":
      return "eParallelesEcran3";
    case "eParallelesEcran3":
      return exercice.famille === "E" && exercice.sousType === "paralleles" && exercice.regime === "vide" ? "termine" : "eParallelesEcran4";
    case "eParallelesEcran4":
      return "termine";
    case "ePerpendiculairesEcran1":
      return "ePerpendiculairesEcran4";
    case "ePerpendiculairesEcran4":
      return "termine";
    case "eSecantesEcran1":
      return "eSecantesEcran4";
    case "eSecantesEcran4":
      return "termine";
    case "eCarreEcran1":
      return "eCarreEcran2";
    case "eCarreEcran2":
      return "eCarreEcran3";
    case "eCarreEcran3":
      return exercice.famille === "E" && exercice.sousType === "carre" && exercice.regime === "vide" ? "termine" : "eCarreEcran4";
    case "eCarreEcran4":
      return "termine";
  }
}

/** Liste ORDONNÉE des phases réellement traversées par CET exercice précis — mirroir 6gen43/6gen37. */
export function phasesPourExercice(exercice: ExerciceLieuxGeometriquesParametres): PhaseLieuxGeometriquesParametres[] {
  const phases: PhaseLieuxGeometriquesParametres[] = [];
  let phase: PhaseLieuxGeometriquesParametres | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(exercice, phase);
  }
  return phases;
}

export interface ResultatExerciceLieuxGeometriquesParametres {
  exercice: ExerciceLieuxGeometriquesParametres;
  scores: Partial<Record<PhaseLieuxGeometriquesParametres, number>>;
}

export interface EtatSessionLieuxGeometriquesParametres {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceLieuxGeometriquesParametres;
  exerciceCourant: ExerciceLieuxGeometriquesParametres;
  phase: PhaseLieuxGeometriquesParametres;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<PhaseLieuxGeometriquesParametres, number>>;
  indexExercice: number;
  resultats: ResultatExerciceLieuxGeometriquesParametres[];
  terminee: boolean;
  derniereTransitionRevelee: boolean;
}
