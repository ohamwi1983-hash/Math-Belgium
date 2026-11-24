/**
 * Couche B (5e) — moteur de session pour 5gen25 ("Association graphique/mots ↔ signe de f'/f'').
 * N'importe jamais rien de `src/generateurs5e/`.
 */
import type { ExerciceAssociation } from "../core5e/association.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import type { EtatSessionAssociation, ResultatExerciceAssociation } from "./typesAssociation";
import type { ChoixLigneAssociation } from "./verificationAssociation";
import { verifierAssociationComplete } from "./verificationAssociation";
import { choixJustificationErrone, diagnostiquerJustification, saisieJustificationIllisible, specJustification } from "./justificationAssociation";

const POINTS_DE_BASE = 100;

/** Convention STANDARD de la plateforme (2 niveaux d'aide). */
export const NIVEAU_AIDE_MAX_ASSOCIATION = 2;

export function niveauAideMaxAssociation(): number {
  return NIVEAU_AIDE_MAX_ASSOCIATION;
}

function etatInitial(exercice: ExerciceAssociation): Pick<EtatSessionAssociation, "exerciceCourant" | "etapeCourante" | "niveauAide" | "phase" | "scoreAssociation"> {
  return { exerciceCourant: exercice, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: "association", scoreAssociation: undefined };
}

export function demarrerSessionAssociation(reglages: ReglagesSession5e, generateur: () => ExerciceAssociation): EtatSessionAssociation {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, derniereEtapeRevelee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionAssociation): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax };
}

export function activerAideSuivante(etat: EtatSessionAssociation): EtatSessionAssociation {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX_ASSOCIATION) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionAssociation, resultat: ResultatExerciceAssociation, revele: boolean): EtatSessionAssociation {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true, derniereEtapeRevelee: revele };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()), derniereEtapeRevelee: revele };
}

export function soumettreReponseAssociation(etat: EtatSessionAssociation, choixParItem: ChoixLigneAssociation[]): EtatSessionAssociation {
  if (etat.terminee || etat.phase !== "association") throw new Error("soumettreReponseAssociation : la session n'est pas à l'écran d'association");
  const { ordreLettres } = etat.exerciceCourant;
  const singulier = etat.exerciceCourant.famille === "grapheDeriveeAvancee" ? etat.exerciceCourant.singulier : undefined;

  // Choix fermés : une seule tentative (ils se gagneraient par élimination).
  const etapeCourante = soumettreEtapeTentatives<ChoixLigneAssociation[]>(etat.etapeCourante, choixParItem, {
    ...reglagesEtape(etat),
    tentativesMax: 1,
    verifier: (r) => verifierAssociationComplete(ordreLettres, r, singulier),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };
  // Lot C : on passe à la justification d'une association (même exercice).
  return { ...etat, phase: "justification", scoreAssociation: etapeCourante.score as number, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, derniereEtapeRevelee: etapeCourante.revelee };
}

/** Écran « justification » : champs (3 tentatives) et choix fermés (un choix faux clôt l'écran) ;
 * une saisie illisible est refusée sans tentative. Clôt l'exercice. */
export function soumettreReponseJustification(etat: EtatSessionAssociation, reponses: Record<string, string>): EtatSessionAssociation {
  if (etat.terminee || etat.phase !== "justification") throw new Error("soumettreReponseJustification : la session n'est pas à l'écran de justification");
  const spec = specJustification(etat.exerciceCourant);
  if (saisieJustificationIllisible(spec, reponses)) return etat;
  const etapeCourante = soumettreEtapeTentatives<Record<string, string>>(etat.etapeCourante, reponses, {
    ...reglagesEtape(etat),
    tentativesMax: choixJustificationErrone(spec, reponses) ? 1 : etat.reglages.tentativesMax,
    verifier: (r) => Object.values(diagnostiquerJustification(spec, r)).every((st) => st === "correct"),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };
  const revele = etapeCourante.revelee;
  const score = Math.round(((etat.scoreAssociation ?? 0) + (etapeCourante.score as number)) / 2);
  return cloturerExerciceOuSuivant(etat, { exercice: etat.exerciceCourant, score, niveauAide: etat.niveauAide, revele }, revele);
}
