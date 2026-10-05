/**
 * Couche B — moteur de session pour "Angles associés" (chapitre 3, dix-septième générateur).
 * REFONTE COMPLÈTE (`promptgen17refontecomplete.md`) : un seul écran par exercice (jamais plus de
 * phases `questionPrincipale`/`questionComplementaire`/`valeurFinale` séparées) — un unique champ de
 * réponse numérique (la valeur approchée finale), avec une aide progressive additive à paliers (2 ou
 * 3 niveaux selon l'exercice, `verificationAnglesAssocies.ts::niveauAideMax`), même principe -20
 * pts/niveau que "Applications physiques" (écran "norme") ou "Distance point-droite et
 * droite-droite". N'importe jamais rien de src/generateurs — voir sessionAnglesAssocies.test.ts pour
 * la preuve avec des générateurs factices.
 */
import type { GenerateurExerciceAnglesAssocies } from "../core/anglesAssocies.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import { niveauAideMax, verifierValeurFinale } from "./verificationAnglesAssocies";
import type { EtatSessionAnglesAssocies, ResultatExerciceAnglesAssocies } from "./typesAnglesAssocies";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

function appliquerPenaliteNiveau(score: number, niveauAide: number): number {
  return Math.max(0, score - niveauAide * PENALITE_PAR_NIVEAU_AIDE);
}

export function demarrerSessionAnglesAssocies(
  reglages: ReglagesSession,
  generateur: GenerateurExerciceAnglesAssocies,
): EtatSessionAnglesAssocies {
  return {
    reglages,
    generateur,
    indexExercice: 0,
    exerciceCourant: generateur(),
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    resultats: [],
    terminee: false,
  };
}

export function activerAide(etat: EtatSessionAnglesAssocies): EtatSessionAnglesAssocies {
  if (etat.terminee) {
    throw new Error("activerAide : la session est déjà terminée");
  }
  if (etat.niveauAide >= niveauAideMax(etat.exerciceCourant)) {
    throw new Error("activerAide : niveau d'aide maximal déjà atteint");
  }
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function reglagesEtape(etat: EtatSessionAnglesAssocies): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

export function soumettreReponse(etat: EtatSessionAnglesAssocies, valeur: number): EtatSessionAnglesAssocies {
  if (etat.terminee) {
    throw new Error("soumettreReponse : la session est déjà terminée");
  }

  const etapeCourante = soumettreEtapeTentatives<number>(etat.etapeCourante, valeur, {
    ...reglagesEtape(etat),
    verifier: (v) => verifierValeurFinale(etat.exerciceCourant, v),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAide);
  const resultat: ResultatExerciceAnglesAssocies = {
    variante: etat.exerciceCourant.variante,
    relation: etat.exerciceCourant.relation,
    score,
    revele: etapeCourante.revelee,
    niveauAide: etat.niveauAide,
  };

  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;

  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }

  return {
    ...etat,
    resultats,
    indexExercice,
    exerciceCourant: etat.generateur(),
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
  };
}
