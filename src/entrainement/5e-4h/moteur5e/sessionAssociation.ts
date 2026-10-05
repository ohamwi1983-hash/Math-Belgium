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

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** Convention STANDARD de la plateforme (2 niveaux d'aide). */
export const NIVEAU_AIDE_MAX_ASSOCIATION = 2;

export function niveauAideMaxAssociation(): number {
  return NIVEAU_AIDE_MAX_ASSOCIATION;
}

function etatInitial(exercice: ExerciceAssociation): Pick<EtatSessionAssociation, "exerciceCourant" | "etapeCourante" | "niveauAide"> {
  return { exerciceCourant: exercice, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0 };
}

export function demarrerSessionAssociation(reglages: ReglagesSession5e, generateur: () => ExerciceAssociation): EtatSessionAssociation {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, derniereEtapeRevelee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionAssociation): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
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
  if (etat.terminee) throw new Error("soumettreReponseAssociation : la session est déjà terminée");
  const { ordreLettres } = etat.exerciceCourant;
  const singulier = etat.exerciceCourant.famille === "grapheDeriveeAvancee" ? etat.exerciceCourant.singulier : undefined;

  const etapeCourante = soumettreEtapeTentatives<ChoixLigneAssociation[]>(etat.etapeCourante, choixParItem, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierAssociationComplete(ordreLettres, r, singulier),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const revele = etapeCourante.revelee;
  const score = Math.max(0, (etapeCourante.score as number) - etat.niveauAide * PENALITE_PAR_NIVEAU_AIDE);
  return cloturerExerciceOuSuivant(etat, { exercice: etat.exerciceCourant, score, niveauAide: etat.niveauAide, revele }, revele);
}
