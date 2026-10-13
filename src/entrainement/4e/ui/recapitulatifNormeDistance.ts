import type { EtatSessionNormeDistance, PhaseNormeDistance } from "../moteur/typesNormeDistance";
import { SEQUENCES } from "../moteur/typesNormeDistance";
import type { ExerciceNormeDistance } from "../core/normeDistance.types";
import type { EntreeRecapitulatif } from "./recapitulatif";
import {
  formatEtatActuelLongueursIsoceleLatex,
  formatEtatActuelLongueursPythagoreLatex,
  formatEtatActuelVecteursTriangleLatex,
  formatEquationReduiteParametreNormeLatex,
  formatVecteurLatex,
} from "./formatNormeDistance";

/**
 * Valeur d'une entrée du récapitulatif pour une phase donnée — réutilise TELLES QUELLES les
 * fonctions déjà écrites pour l'ancien bloc "état actuel" (jamais une nouvelle logique de
 * formatage) : seules les phases qui PRÉCÈDENT au moins un écran suivant au sein de leur variante
 * (voir `SEQUENCES`) ont besoin d'une entrée ici — la dernière phase de chaque variante n'est
 * jamais affichée dans son propre récapitulatif.
 */
function valeurPourPhase(exercice: ExerciceNormeDistance, phase: PhaseNormeDistance): Pick<EntreeRecapitulatif, "libelle" | "valeur" | "estLatex"> {
  switch (phase) {
    case "constructionDistance": {
      if (exercice.variante !== "distance") throw new Error("recapitulatifNormeDistance : exercice inattendu (constructionDistance)");
      return { libelle: "Vecteur construit", estLatex: true, valeur: formatVecteurLatex(`${exercice.labelA}${exercice.labelB}`, exercice.vecteurAB) };
    }
    case "constructionIsocele": {
      if (exercice.variante !== "isocele") throw new Error("recapitulatifNormeDistance : exercice inattendu (constructionIsocele)");
      return {
        libelle: "Vecteurs construits",
        estLatex: true,
        valeur: formatEtatActuelVecteursTriangleLatex(exercice.labelA, exercice.labelB, exercice.labelC, exercice.vecteurAB, exercice.vecteurAC, exercice.vecteurBC),
      };
    }
    case "calculIsocele": {
      if (exercice.variante !== "isocele") throw new Error("recapitulatifNormeDistance : exercice inattendu (calculIsocele)");
      return { libelle: "Longueurs calculées", estLatex: true, valeur: formatEtatActuelLongueursIsoceleLatex(exercice) };
    }
    case "reductionParametreNorme": {
      if (exercice.variante !== "parametre") throw new Error("recapitulatifNormeDistance : exercice inattendu (reductionParametreNorme)");
      return { libelle: "Équation réduite", estLatex: true, valeur: formatEquationReduiteParametreNormeLatex(exercice) };
    }
    case "constructionPythagore": {
      if (exercice.variante !== "pythagore") throw new Error("recapitulatifNormeDistance : exercice inattendu (constructionPythagore)");
      return {
        libelle: "Vecteurs construits",
        estLatex: true,
        valeur: formatEtatActuelVecteursTriangleLatex(exercice.labelA, exercice.labelB, exercice.labelC, exercice.vecteurAB, exercice.vecteurAC, exercice.vecteurBC),
      };
    }
    case "calculPythagore": {
      if (exercice.variante !== "pythagore") throw new Error("recapitulatifNormeDistance : exercice inattendu (calculPythagore)");
      return { libelle: "Longueurs calculées", estLatex: true, valeur: formatEtatActuelLongueursPythagoreLatex(exercice) };
    }
    // normeVecteur/calculDistance/conclusionIsocele/resolutionParametreNorme/testPythagore sont
    // toujours la DERNIÈRE phase de leur variante (voir SEQUENCES) — jamais appelées ici.
    default:
      throw new Error(`recapitulatifNormeDistance : phase sans entrée récap (${phase})`);
  }
}

/**
 * Récapitulatif "Ce qu'on sait déjà" — chaque variante traverse une séquence FIXE et DISJOINTE
 * des autres (voir `SEQUENCES`, `moteur/typesNormeDistance.ts`) : les entrées accumulées sont
 * donc toujours les phases déjà closes de CETTE séquence, jamais une autre variante.
 */
export function calculerRecapitulatifNormeDistance(etat: EtatSessionNormeDistance): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const sequence = SEQUENCES[exercice.variante];
  const precedentes = sequence.slice(0, sequence.indexOf(etat.phase));

  return precedentes.map((phase) => {
    const score = etat.scoresAccumules[phase]!;
    return { ...valeurPourPhase(exercice, phase), revele: score.revele };
  });
}
