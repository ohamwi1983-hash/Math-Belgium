/**
 * Couche B — moteur de session pour "Problèmes d'optimisation (fonction du second degré)" (gen55).
 * N'importe jamais rien de `src/generateurs/` — voir `sessionOptimisation.test.ts` pour la preuve
 * avec des exercices factices.
 *
 * `phaseInitiale` décide de la phase de départ selon la variante — `"identification"` (première
 * d'une séquence à 7 écrans, `contrainteEtGrandeur → systeme → domaine → sommet → decision →
 * interpretation`, ce dernier terminal) pour `modelisation`, SAUF quand `identificationXY` est
 * absent de l'instance (certains skins nomment déjà x/y sans ambiguïté), auquel cas la séquence
 * démarre directement à `"contrainteEtGrandeur"` (6 écrans) — voir
 * `prompt-restructuration-architecture-modelisation.md`, qui remplace une architecture antérieure à
 * 8 écrans (`contrainte → isolement → construction → domaine → ...`, avec une exception structurelle
 * pour `rectangleInscrit` qui n'existe plus : les 4 familles A/B/T/V suivent désormais EXACTEMENT la
 * même séquence). `"sommet"`/`"decision"`/`"interpretation"` sont des noms de phase COMMUNS aux 2
 * séquences (contenu de ces 3 écrans strictement identique, voir `core/optimisation.types.ts`) —
 * `"sommet"` est la première phase pour `fonctionDonnee` (séquence à 3 écrans, fonction ET domaine
 * déjà fournis, aucune dérivation).
 *
 * **`NIVEAU_AIDE_MAX_IDENTIFICATION`/`_CONTRAINTE_ET_GRANDEUR`/`_SYSTEME`/`_DOMAINE` restent
 * exportées ci-dessous** — le 57e exercice ("Équations/inéquations du second degré en contexte",
 * `promptimplementationgen57.md`) les importe directement pour ses propres écrans
 * `EtapeIdentificationOptimisation`/`EtapeContrainteEtGrandeurOptimisation`/
 * `EtapeSystemeOptimisation`/`EtapeDomaineOptimisation` (`moteur/sessionEquationInequationSecondDegre.ts`) :
 * les retirer casserait sa compilation. `NIVEAU_AIDE_MAX_ISOLEMENT`/`_CONSTRUCTION` (ancienne
 * architecture à 8 écrans, plus aucun consommateur depuis cette même restructuration — gen57
 * réutilise désormais identification/contrainteEtGrandeur/systeme, jamais isolement/construction)
 * ont été retirées avec les écrans `EtapeIsolementOptimisation`/`EtapeConstructionOptimisation`
 * qu'elles plafonnaient. `NIVEAU_AIDE_MAX_CONTRAINTE` (ancienne architecture, jamais importée
 * ailleurs) avait déjà été retirée avec l'écran "contrainte" qu'elle plafonnait.
 */
import type { ExerciceOptimisation, GenerateurExerciceOptimisation } from "../core/optimisation.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import type { ReponseContrainteEtGrandeur, ReponseDecision, ReponseDomaine, ReponseIdentification, ReponseSommet } from "./verificationOptimisation";
import {
  verifierContrainteEtGrandeur,
  verifierDecision,
  verifierDomaine,
  verifierIdentification,
  verifierInterpretation,
  verifierSommet,
  verifierSysteme,
} from "./verificationOptimisation";
import type { EtatSessionOptimisation, PhaseOptimisation, ResultatExerciceOptimisation } from "./typesOptimisation";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;
export const NIVEAU_AIDE_MAX_IDENTIFICATION = 0;
export const NIVEAU_AIDE_MAX_CONTRAINTE_ET_GRANDEUR = 2;
export const NIVEAU_AIDE_MAX_SYSTEME = 3;
export const NIVEAU_AIDE_MAX_DOMAINE = 3;
export const NIVEAU_AIDE_MAX_SOMMET = 2;
export const NIVEAU_AIDE_MAX_DECISION = 3;
export const NIVEAU_AIDE_MAX_INTERPRETATION = 1;

function phaseInitiale(exercice: ExerciceOptimisation): PhaseOptimisation {
  if (exercice.variante !== "modelisation") return "sommet";
  return exercice.identificationXY ? "identification" : "contrainteEtGrandeur";
}

const ETAT_TRANSITOIRE_INITIAL = {
  niveauAideIdentification: 0,
  niveauAideContrainteEtGrandeur: 0,
  niveauAideSysteme: 0,
  niveauAideDomaine: 0,
  niveauAideSommet: 0,
  niveauAideDecision: 0,
  niveauAideInterpretation: 0,
  scoreIdentificationExercice: null,
  identificationRevele: false,
  scoreContrainteEtGrandeurExercice: null,
  contrainteEtGrandeurRevele: false,
  scoreSystemeExercice: null,
  systemeRevele: false,
  scoreDomaineExercice: null,
  domaineRevele: false,
  scoreSommetExercice: null,
  sommetRevele: false,
  scoreDecisionExercice: null,
  decisionRevele: false,
} as const;

export function demarrerSessionOptimisation(reglages: ReglagesSession, generateur: GenerateurExerciceOptimisation): EtatSessionOptimisation {
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

function reglagesEtape(etat: EtatSessionOptimisation): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

function appliquerPenaliteNiveau(score: number, niveauAide: number): number {
  return Math.max(0, score - niveauAide * PENALITE_PAR_NIVEAU_AIDE);
}

export function activerAideSuivante(etat: EtatSessionOptimisation): EtatSessionOptimisation {
  if (etat.terminee) {
    throw new Error("activerAideSuivante : la session est déjà terminée");
  }
  if (etat.phase === "identification") {
    throw new Error("activerAideSuivante : l'écran identification n'a pas d'aide (vérification par sélection uniquement)");
  }
  if (etat.phase === "contrainteEtGrandeur") {
    if (etat.niveauAideContrainteEtGrandeur >= NIVEAU_AIDE_MAX_CONTRAINTE_ET_GRANDEUR) {
      throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    }
    return { ...etat, niveauAideContrainteEtGrandeur: etat.niveauAideContrainteEtGrandeur + 1 };
  }
  if (etat.phase === "systeme") {
    if (etat.niveauAideSysteme >= NIVEAU_AIDE_MAX_SYSTEME) {
      throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    }
    return { ...etat, niveauAideSysteme: etat.niveauAideSysteme + 1 };
  }
  if (etat.phase === "domaine") {
    if (etat.niveauAideDomaine >= NIVEAU_AIDE_MAX_DOMAINE) {
      throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    }
    return { ...etat, niveauAideDomaine: etat.niveauAideDomaine + 1 };
  }
  if (etat.phase === "sommet") {
    if (etat.niveauAideSommet >= NIVEAU_AIDE_MAX_SOMMET) {
      throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    }
    return { ...etat, niveauAideSommet: etat.niveauAideSommet + 1 };
  }
  if (etat.phase === "decision") {
    if (etat.niveauAideDecision >= NIVEAU_AIDE_MAX_DECISION) {
      throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    }
    return { ...etat, niveauAideDecision: etat.niveauAideDecision + 1 };
  }
  if (etat.niveauAideInterpretation >= NIVEAU_AIDE_MAX_INTERPRETATION) {
    throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  }
  return { ...etat, niveauAideInterpretation: etat.niveauAideInterpretation + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionOptimisation, resultat: ResultatExerciceOptimisation): EtatSessionOptimisation {
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

/** Première étape de la variante `modelisation`, quand `identificationXY` est défini — mène
 * toujours à "contrainteEtGrandeur". Pas de pénalité d'aide (`NIVEAU_AIDE_MAX_IDENTIFICATION=0`) :
 * vérification par sélection, aucun texte d'aide prévu pour ce type d'écran (même convention que
 * l'écran "interpretation"). */
export function soumettreReponseIdentification(etat: EtatSessionOptimisation, reponse: ReponseIdentification): EtatSessionOptimisation {
  if (etat.terminee || etat.phase !== "identification") {
    throw new Error("soumettreReponseIdentification : la session n'est pas à l'étape identification");
  }
  const exerciceCourant = etat.exerciceCourant;
  if (exerciceCourant.variante !== "modelisation") {
    throw new Error("soumettreReponseIdentification : l'écran identification n'existe que pour la variante modelisation");
  }
  if (!exerciceCourant.identificationXY) {
    throw new Error("soumettreReponseIdentification : cette instance n'a pas d'écran identification");
  }

  const etapeCourante = soumettreEtapeTentatives<ReponseIdentification>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierIdentification(exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

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
export function soumettreReponseContrainteEtGrandeur(etat: EtatSessionOptimisation, reponse: ReponseContrainteEtGrandeur): EtatSessionOptimisation {
  if (etat.terminee || etat.phase !== "contrainteEtGrandeur") {
    throw new Error("soumettreReponseContrainteEtGrandeur : la session n'est pas à l'étape contrainteEtGrandeur");
  }
  const exerciceCourant = etat.exerciceCourant;
  if (exerciceCourant.variante !== "modelisation") {
    throw new Error("soumettreReponseContrainteEtGrandeur : l'écran contrainteEtGrandeur n'existe que pour la variante modelisation");
  }

  const etapeCourante = soumettreEtapeTentatives<ReponseContrainteEtGrandeur>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierContrainteEtGrandeur(exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideContrainteEtGrandeur);

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "systeme",
    scoreContrainteEtGrandeurExercice: score,
    contrainteEtGrandeurRevele: etapeCourante.revelee,
  };
}

/** Suit "contrainteEtGrandeur" — mène toujours à "domaine". */
export function soumettreReponseSysteme(etat: EtatSessionOptimisation, texte: string): EtatSessionOptimisation {
  if (etat.terminee || etat.phase !== "systeme") {
    throw new Error("soumettreReponseSysteme : la session n'est pas à l'étape systeme");
  }
  const exerciceCourant = etat.exerciceCourant;
  if (exerciceCourant.variante !== "modelisation") {
    throw new Error("soumettreReponseSysteme : l'écran systeme n'existe que pour la variante modelisation");
  }

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, texte, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierSysteme(exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideSysteme);

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "domaine",
    scoreSystemeExercice: score,
    systemeRevele: etapeCourante.revelee,
  };
}

export function soumettreReponseDomaine(etat: EtatSessionOptimisation, reponse: ReponseDomaine): EtatSessionOptimisation {
  if (etat.terminee || etat.phase !== "domaine") {
    throw new Error("soumettreReponseDomaine : la session n'est pas à l'étape domaine");
  }
  const exerciceCourant = etat.exerciceCourant;
  if (exerciceCourant.variante !== "modelisation") {
    throw new Error("soumettreReponseDomaine : l'écran domaine n'existe que pour la variante modelisation");
  }

  const etapeCourante = soumettreEtapeTentatives<ReponseDomaine>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierDomaine(exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideDomaine);

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "sommet",
    scoreDomaineExercice: score,
    domaineRevele: etapeCourante.revelee,
  };
}

/** Commune aux 2 variantes — mène toujours à "decision". */
export function soumettreReponseSommet(etat: EtatSessionOptimisation, reponse: ReponseSommet): EtatSessionOptimisation {
  if (etat.terminee || etat.phase !== "sommet") {
    throw new Error("soumettreReponseSommet : la session n'est pas à l'étape sommet");
  }
  const exerciceCourant = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<ReponseSommet>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierSommet(exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideSommet);

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "decision",
    scoreSommetExercice: score,
    sommetRevele: etapeCourante.revelee,
  };
}

/** Commune aux 2 variantes — mène toujours à "interpretation". */
export function soumettreReponseDecision(etat: EtatSessionOptimisation, reponse: ReponseDecision): EtatSessionOptimisation {
  if (etat.terminee || etat.phase !== "decision") {
    throw new Error("soumettreReponseDecision : la session n'est pas à l'étape decision");
  }
  const exerciceCourant = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<ReponseDecision>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierDecision(exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideDecision);

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "interpretation",
    scoreDecisionExercice: score,
    decisionRevele: etapeCourante.revelee,
  };
}

/** Commune aux 2 variantes — toujours TERMINALE (que ce soit la 3ᵉ écran de `fonctionDonnee` ou la
 * 7ᵉ de `modelisation`). */
export function soumettreReponseInterpretation(etat: EtatSessionOptimisation, indexChoisi: number | null): EtatSessionOptimisation {
  if (etat.terminee || etat.phase !== "interpretation") {
    throw new Error("soumettreReponseInterpretation : la session n'est pas à l'étape interpretation");
  }
  const exerciceCourant = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<number | null>(etat.etapeCourante, indexChoisi, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierInterpretation(exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideInterpretation);

  return cloturerExerciceOuSuivant(etat, {
    variante: exerciceCourant.variante,
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
    scoreSommet: etat.scoreSommetExercice as number,
    sommetRevele: etat.sommetRevele,
    niveauAideSommet: etat.niveauAideSommet,
    scoreDecision: etat.scoreDecisionExercice as number,
    decisionRevele: etat.decisionRevele,
    niveauAideDecision: etat.niveauAideDecision,
    scoreInterpretation: score,
    interpretationRevele: etapeCourante.revelee,
    niveauAideInterpretation: etat.niveauAideInterpretation,
  });
}
