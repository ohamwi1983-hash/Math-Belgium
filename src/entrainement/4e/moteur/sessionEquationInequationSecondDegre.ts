/**
 * Couche B — moteur de session pour "Équations/inéquations du second degré en contexte" (position
 * 57). N'importe jamais rien de `src/generateurs/` — voir
 * `sessionEquationInequationSecondDegre.test.ts` pour la preuve avec des exercices factices.
 *
 * Séquence à 4, 6 ou 9 écrans selon `exercice.voieSysteme`/`exercice.base.variante`/
 * `exercice.base.identificationXY` (restructuration `promptimplementationgen57.md`, remplace
 * l'ancienne réutilisation de l'architecture isolement/construction de gen55) — DEUX axes
 * globalement orthogonaux :
 * - `voieSysteme=false`, `base.variante==="modelisation"` (6 familles sur 8) — séquence à 6 ou 7
 *   écrans : `identification` (conditionnelle à `base.identificationXY`, jamais renseigné par les 8
 *   familles actuelles) `→ contrainteEtGrandeur → systeme → domaine → poserEquationInequation →
 *   resoudre → validation → interpretation` (terminale).
 * - `voieSysteme=false`, `base.variante==="fonctionDonnee"` (`chuteObjet`/`distanceFreinage`,
 *   familles PHYSIQUES dont les coefficients sont directement communiqués, jamais issus d'une
 *   élimination à 2 variables — voir CLAUDE.md, "Restructuration — bug actif, voie
 *   fonctionDonnee") — `identification`/`contrainteEtGrandeur`/`systeme`/`domaine` SAUTÉS
 *   entièrement, séquence à 4 écrans démarrant directement à `poserEquationInequation`.
 * - `voieSysteme=true` (`achatGroupe` uniquement, toujours `base.variante==="modelisation"`) —
 *   `poserSysteme → eliminerSysteme → systeme → domaine → resoudre → validation → interpretation`
 *   (`identification`/`contrainteEtGrandeur`/`poserEquationInequation` tous SAUTÉS : les 2
 *   équations posées aux écrans 0a/0b tiennent déjà le rôle de "contrainteEtGrandeur", l'écran
 *   "systeme" les résout directement et substituer dans l'équation d'origine produit directement
 *   l'équation finale — pas de seuil `k` séparé à poser).
 *
 * Les écrans identification/contrainteEtGrandeur/systeme/domaine (`base.variante==="modelisation"`
 * uniquement) opèrent sur `exercice.base` via les fonctions `verifierIdentification`/
 * `verifierContrainteEtGrandeur`/`verifierSysteme`/`verifierDomaine` RÉUTILISÉES DIRECTEMENT depuis
 * `verificationOptimisation.ts` (moteur→moteur) — et les plafonds d'aide
 * `NIVEAU_AIDE_MAX_CONTRAINTE_ET_GRANDEUR`/`_SYSTEME`/`_DOMAINE` RÉUTILISÉS depuis
 * `sessionOptimisation.ts` (même import), pour rester cohérent avec les composants
 * `EtapeIdentificationOptimisation`/`EtapeContrainteEtGrandeurOptimisation`/
 * `EtapeSystemeOptimisation`/`EtapeDomaineOptimisation` (gen55, qui lisent CES MÊMES constantes en
 * interne pour désactiver leur bouton "Aide") — voir CLAUDE.md pour la justification complète de
 * cette réutilisation. Les fonctions `soumettreReponseIdentification`/`ContrainteEtGrandeur`/
 * `Systeme`/`Domaine` lèvent explicitement si `base.variante !== "modelisation"` (jamais atteint en
 * pratique, `phaseInitiale` ne mène jamais à ces phases pour une famille `fonctionDonnee` — garde
 * défensive, même principe que `soumettreReponsePont` de gen58 refusant `sommetPartage`).
 */
import type { GenerateurExerciceEquationInequationSecondDegre } from "../core/equationInequationSecondDegre.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import type { ReponseContrainteEtGrandeur, ReponseDomaine, ReponseIdentification } from "./verificationOptimisation";
import { verifierContrainteEtGrandeur, verifierDomaine, verifierIdentification, verifierSysteme } from "./verificationOptimisation";
import { NIVEAU_AIDE_MAX_CONTRAINTE_ET_GRANDEUR, NIVEAU_AIDE_MAX_DOMAINE, NIVEAU_AIDE_MAX_SYSTEME } from "./sessionOptimisation";
import type { ReponseIntervalle } from "./verificationEquationInequationSecondDegre";
import {
  verifierEliminationSysteme,
  verifierInterpretation,
  verifierPoserEquationInequation,
  verifierResoudre,
  verifierSystemeHypothetique,
  verifierSystemeReel,
  verifierValidationEquation,
  verifierValidationInequation,
} from "./verificationEquationInequationSecondDegre";
import type { EtatSessionEquationInequationSecondDegre, PhaseEquationInequationSecondDegre, ResultatExerciceEquationInequationSecondDegre } from "./typesEquationInequationSecondDegre";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;
export const NIVEAU_AIDE_MAX_POSER_SYSTEME = 2;
export const NIVEAU_AIDE_MAX_ELIMINER_SYSTEME = 2;
export const NIVEAU_AIDE_MAX_POSER_EQUATION_INEQUATION = 2;
export const NIVEAU_AIDE_MAX_RESOUDRE = 2;
export const NIVEAU_AIDE_MAX_VALIDATION = 3;
export const NIVEAU_AIDE_MAX_INTERPRETATION = 1;

const ETAT_TRANSITOIRE_INITIAL = {
  niveauAidePoserSysteme: 0,
  niveauAideEliminerSysteme: 0,
  niveauAideIdentification: 0,
  niveauAideContrainteEtGrandeur: 0,
  niveauAideSysteme: 0,
  niveauAideDomaine: 0,
  niveauAidePoserEquationInequation: 0,
  niveauAideResoudre: 0,
  niveauAideValidation: 0,
  niveauAideInterpretation: 0,
  scorePoserSystemeExercice: null,
  poserSystemeRevele: false,
  scoreEliminerSystemeExercice: null,
  eliminerSystemeRevele: false,
  scoreIdentificationExercice: null,
  identificationRevele: false,
  scoreContrainteEtGrandeurExercice: null,
  contrainteEtGrandeurRevele: false,
  scoreSystemeExercice: null,
  systemeRevele: false,
  scoreDomaineExercice: null,
  domaineRevele: false,
  scorePoserEquationInequationExercice: null,
  poserEquationInequationRevele: false,
  scoreResoudreExercice: null,
  resoudreRevele: false,
  scoreValidationExercice: null,
  validationRevele: false,
} as const;

/** `identification` sautée quand `base.identificationXY` est absent (aucune des 8 familles
 * actuelles ne le renseigne — étape 1 de la restructuration, voir en-tête de fichier) — mène alors
 * directement à `contrainteEtGrandeur`, même logique que `moteur/sessionOptimisation.ts`. */
function phaseInitiale(exercice: EtatSessionEquationInequationSecondDegre["exerciceCourant"]): PhaseEquationInequationSecondDegre {
  if (exercice.voieSysteme) return "poserSysteme";
  if (exercice.base.variante !== "modelisation") return "poserEquationInequation";
  return exercice.base.identificationXY ? "identification" : "contrainteEtGrandeur";
}

export function demarrerSessionEquationInequationSecondDegre(
  reglages: ReglagesSession,
  generateur: GenerateurExerciceEquationInequationSecondDegre,
): EtatSessionEquationInequationSecondDegre {
  const exerciceCourant = generateur();
  return {
    reglages,
    generateur,
    indexExercice: 0,
    exerciceCourant,
    phase: phaseInitiale(exerciceCourant),
    etapeCourante: demarrerEtapeTentatives(),
    ...ETAT_TRANSITOIRE_INITIAL,
    resultats: [],
    terminee: false,
  };
}

function reglagesEtape(etat: EtatSessionEquationInequationSecondDegre): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

function appliquerPenaliteNiveau(score: number, niveauAide: number): number {
  return Math.max(0, score - niveauAide * PENALITE_PAR_NIVEAU_AIDE);
}

export function activerAideSuivante(etat: EtatSessionEquationInequationSecondDegre): EtatSessionEquationInequationSecondDegre {
  if (etat.terminee) {
    throw new Error("activerAideSuivante : la session est déjà terminée");
  }
  if (etat.phase === "poserSysteme") {
    if (etat.niveauAidePoserSysteme >= NIVEAU_AIDE_MAX_POSER_SYSTEME) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    return { ...etat, niveauAidePoserSysteme: etat.niveauAidePoserSysteme + 1 };
  }
  if (etat.phase === "eliminerSysteme") {
    if (etat.niveauAideEliminerSysteme >= NIVEAU_AIDE_MAX_ELIMINER_SYSTEME) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    return { ...etat, niveauAideEliminerSysteme: etat.niveauAideEliminerSysteme + 1 };
  }
  if (etat.phase === "identification") {
    throw new Error("activerAideSuivante : l'écran identification n'a pas d'aide (vérification par sélection uniquement)");
  }
  if (etat.phase === "contrainteEtGrandeur") {
    if (etat.niveauAideContrainteEtGrandeur >= NIVEAU_AIDE_MAX_CONTRAINTE_ET_GRANDEUR)
      throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    return { ...etat, niveauAideContrainteEtGrandeur: etat.niveauAideContrainteEtGrandeur + 1 };
  }
  if (etat.phase === "systeme") {
    if (etat.niveauAideSysteme >= NIVEAU_AIDE_MAX_SYSTEME) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    return { ...etat, niveauAideSysteme: etat.niveauAideSysteme + 1 };
  }
  if (etat.phase === "domaine") {
    if (etat.niveauAideDomaine >= NIVEAU_AIDE_MAX_DOMAINE) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    return { ...etat, niveauAideDomaine: etat.niveauAideDomaine + 1 };
  }
  if (etat.phase === "poserEquationInequation") {
    if (etat.niveauAidePoserEquationInequation >= NIVEAU_AIDE_MAX_POSER_EQUATION_INEQUATION)
      throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    return { ...etat, niveauAidePoserEquationInequation: etat.niveauAidePoserEquationInequation + 1 };
  }
  if (etat.phase === "resoudre") {
    if (etat.niveauAideResoudre >= NIVEAU_AIDE_MAX_RESOUDRE) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    return { ...etat, niveauAideResoudre: etat.niveauAideResoudre + 1 };
  }
  if (etat.phase === "validation") {
    if (etat.niveauAideValidation >= NIVEAU_AIDE_MAX_VALIDATION) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    return { ...etat, niveauAideValidation: etat.niveauAideValidation + 1 };
  }
  if (etat.niveauAideInterpretation >= NIVEAU_AIDE_MAX_INTERPRETATION) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAideInterpretation: etat.niveauAideInterpretation + 1 };
}

function cloturerExerciceOuSuivant(
  etat: EtatSessionEquationInequationSecondDegre,
  resultat: ResultatExerciceEquationInequationSecondDegre,
): EtatSessionEquationInequationSecondDegre {
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
    ...ETAT_TRANSITOIRE_INITIAL,
  };
}

export function soumettreReponsePoserSysteme(
  etat: EtatSessionEquationInequationSecondDegre,
  reponse: { reel: string; hypothetique: string },
): EtatSessionEquationInequationSecondDegre {
  if (etat.terminee || etat.phase !== "poserSysteme") throw new Error("soumettreReponsePoserSysteme : la session n'est pas à l'étape poserSysteme");
  const exerciceCourant = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<{ reel: string; hypothetique: string }>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierSystemeReel(exerciceCourant, r.reel) && verifierSystemeHypothetique(exerciceCourant, r.hypothetique),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAidePoserSysteme);
  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "eliminerSysteme",
    scorePoserSystemeExercice: score,
    poserSystemeRevele: etapeCourante.revelee,
  };
}

export function soumettreReponseEliminerSysteme(etat: EtatSessionEquationInequationSecondDegre, texte: string): EtatSessionEquationInequationSecondDegre {
  if (etat.terminee || etat.phase !== "eliminerSysteme") throw new Error("soumettreReponseEliminerSysteme : la session n'est pas à l'étape eliminerSysteme");
  const exerciceCourant = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, texte, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierEliminationSysteme(exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideEliminerSysteme);
  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "systeme",
    scoreEliminerSystemeExercice: score,
    eliminerSystemeRevele: etapeCourante.revelee,
  };
}

/** Première étape de la voie `modelisation`, quand `identificationXY` est défini — mène toujours à
 * "contrainteEtGrandeur". Pas de pénalité d'aide (aucune aide sur cet écran, vérification par
 * sélection). */
export function soumettreReponseIdentification(etat: EtatSessionEquationInequationSecondDegre, reponse: ReponseIdentification): EtatSessionEquationInequationSecondDegre {
  if (etat.terminee || etat.phase !== "identification") throw new Error("soumettreReponseIdentification : la session n'est pas à l'étape identification");
  const base = etat.exerciceCourant.base;
  if (base.variante !== "modelisation") throw new Error("soumettreReponseIdentification : famille en voie fonctionDonnee, l'écran identification n'existe pas pour elle");
  if (!base.identificationXY) throw new Error("soumettreReponseIdentification : cette instance n'a pas d'écran identification");

  const etapeCourante = soumettreEtapeTentatives<ReponseIdentification>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierIdentification(base, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideIdentification);
  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "contrainteEtGrandeur",
    scoreIdentificationExercice: score,
    identificationRevele: etapeCourante.revelee,
  };
}

/** Suit "identification" (ou première étape si l'instance n'en a pas) — mène toujours à "systeme". */
export function soumettreReponseContrainteEtGrandeur(
  etat: EtatSessionEquationInequationSecondDegre,
  reponse: ReponseContrainteEtGrandeur,
): EtatSessionEquationInequationSecondDegre {
  if (etat.terminee || etat.phase !== "contrainteEtGrandeur")
    throw new Error("soumettreReponseContrainteEtGrandeur : la session n'est pas à l'étape contrainteEtGrandeur");
  const base = etat.exerciceCourant.base;
  if (base.variante !== "modelisation")
    throw new Error("soumettreReponseContrainteEtGrandeur : famille en voie fonctionDonnee, l'écran contrainteEtGrandeur n'existe pas pour elle");

  const etapeCourante = soumettreEtapeTentatives<ReponseContrainteEtGrandeur>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierContrainteEtGrandeur(base, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideContrainteEtGrandeur);
  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "systeme",
    scoreContrainteEtGrandeurExercice: score,
    contrainteEtGrandeurRevele: etapeCourante.revelee,
  };
}

/** Suit "contrainteEtGrandeur" (`modelisation`) ou "eliminerSysteme" (`voieSysteme`) — mène
 * toujours à "domaine". */
export function soumettreReponseSysteme(etat: EtatSessionEquationInequationSecondDegre, texte: string): EtatSessionEquationInequationSecondDegre {
  if (etat.terminee || etat.phase !== "systeme") throw new Error("soumettreReponseSysteme : la session n'est pas à l'étape systeme");
  const base = etat.exerciceCourant.base;
  if (base.variante !== "modelisation") throw new Error("soumettreReponseSysteme : famille en voie fonctionDonnee, l'écran systeme n'existe pas pour elle");

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, texte, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierSysteme(base, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideSysteme);
  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "domaine",
    scoreSystemeExercice: score,
    systemeRevele: etapeCourante.revelee,
  };
}

export function soumettreReponseDomaine(etat: EtatSessionEquationInequationSecondDegre, reponse: ReponseDomaine): EtatSessionEquationInequationSecondDegre {
  if (etat.terminee || etat.phase !== "domaine") throw new Error("soumettreReponseDomaine : la session n'est pas à l'étape domaine");
  const base = etat.exerciceCourant.base;
  if (base.variante !== "modelisation") throw new Error("soumettreReponseDomaine : famille en voie fonctionDonnee, l'écran domaine n'existe pas pour elle");

  const etapeCourante = soumettreEtapeTentatives<ReponseDomaine>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierDomaine(base, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideDomaine);
  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: etat.exerciceCourant.voieSysteme ? "resoudre" : "poserEquationInequation",
    scoreDomaineExercice: score,
    domaineRevele: etapeCourante.revelee,
  };
}

export function soumettreReponsePoserEquationInequation(etat: EtatSessionEquationInequationSecondDegre, texte: string): EtatSessionEquationInequationSecondDegre {
  if (etat.terminee || etat.phase !== "poserEquationInequation")
    throw new Error("soumettreReponsePoserEquationInequation : la session n'est pas à l'étape poserEquationInequation");
  const exerciceCourant = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, texte, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierPoserEquationInequation(exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAidePoserEquationInequation);
  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "resoudre",
    scorePoserEquationInequationExercice: score,
    poserEquationInequationRevele: etapeCourante.revelee,
  };
}

export function soumettreReponseResoudre(etat: EtatSessionEquationInequationSecondDegre, valeurs: string[]): EtatSessionEquationInequationSecondDegre {
  if (etat.terminee || etat.phase !== "resoudre") throw new Error("soumettreReponseResoudre : la session n'est pas à l'étape resoudre");
  const exerciceCourant = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<string[]>(etat.etapeCourante, valeurs, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierResoudre(exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideResoudre);
  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "validation",
    scoreResoudreExercice: score,
    resoudreRevele: etapeCourante.revelee,
  };
}

export function soumettreReponseValidationEquation(etat: EtatSessionEquationInequationSecondDegre, reponses: boolean[]): EtatSessionEquationInequationSecondDegre {
  if (etat.terminee || etat.phase !== "validation") throw new Error("soumettreReponseValidationEquation : la session n'est pas à l'étape validation");
  const exerciceCourant = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<boolean[]>(etat.etapeCourante, reponses, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierValidationEquation(exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideValidation);
  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "interpretation",
    scoreValidationExercice: score,
    validationRevele: etapeCourante.revelee,
  };
}

export function soumettreReponseValidationInequation(etat: EtatSessionEquationInequationSecondDegre, reponse: ReponseIntervalle): EtatSessionEquationInequationSecondDegre {
  if (etat.terminee || etat.phase !== "validation") throw new Error("soumettreReponseValidationInequation : la session n'est pas à l'étape validation");
  const exerciceCourant = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<ReponseIntervalle>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierValidationInequation(exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideValidation);
  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "interpretation",
    scoreValidationExercice: score,
    validationRevele: etapeCourante.revelee,
  };
}

export function soumettreReponseInterpretation(etat: EtatSessionEquationInequationSecondDegre, indexChoisi: number | null): EtatSessionEquationInequationSecondDegre {
  if (etat.terminee || etat.phase !== "interpretation") throw new Error("soumettreReponseInterpretation : la session n'est pas à l'étape interpretation");
  const exerciceCourant = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<number | null>(etat.etapeCourante, indexChoisi, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierInterpretation(exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideInterpretation);

  return cloturerExerciceOuSuivant(etat, {
    variante: exerciceCourant.variante,
    famille: exerciceCourant.famille,
    scorePoserSysteme: etat.scorePoserSystemeExercice,
    poserSystemeRevele: etat.poserSystemeRevele,
    niveauAidePoserSysteme: etat.niveauAidePoserSysteme,
    scoreEliminerSysteme: etat.scoreEliminerSystemeExercice,
    eliminerSystemeRevele: etat.eliminerSystemeRevele,
    niveauAideEliminerSysteme: etat.niveauAideEliminerSysteme,
    scoreIdentification: etat.scoreIdentificationExercice,
    identificationRevele: etat.identificationRevele,
    niveauAideIdentification: etat.niveauAideIdentification,
    scoreContrainteEtGrandeur: etat.scoreContrainteEtGrandeurExercice,
    contrainteEtGrandeurRevele: etat.contrainteEtGrandeurRevele,
    niveauAideContrainteEtGrandeur: etat.niveauAideContrainteEtGrandeur,
    scoreSysteme: etat.scoreSystemeExercice,
    systemeRevele: etat.systemeRevele,
    niveauAideSysteme: etat.niveauAideSysteme,
    scoreDomaine: etat.scoreDomaineExercice,
    domaineRevele: etat.domaineRevele,
    niveauAideDomaine: etat.niveauAideDomaine,
    scorePoserEquationInequation: etat.scorePoserEquationInequationExercice,
    poserEquationInequationRevele: etat.poserEquationInequationRevele,
    niveauAidePoserEquationInequation: etat.niveauAidePoserEquationInequation,
    scoreResoudre: etat.scoreResoudreExercice as number,
    resoudreRevele: etat.resoudreRevele,
    niveauAideResoudre: etat.niveauAideResoudre,
    scoreValidation: etat.scoreValidationExercice as number,
    validationRevele: etat.validationRevele,
    niveauAideValidation: etat.niveauAideValidation,
    scoreInterpretation: score,
    interpretationRevele: etapeCourante.revelee,
    niveauAideInterpretation: etat.niveauAideInterpretation,
  });
}
