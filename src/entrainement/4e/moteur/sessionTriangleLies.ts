/**
 * Couche B — moteur de session pour "Triangles liés (triangulation, côté ou angle partagé)"
 * (cinquante-huitième générateur, `promptimplementationgen58.md`). N'importe jamais rien de
 * `src/generateurs/` — voir `sessionTriangleLies.test.ts` pour la preuve avec des exercices
 * factices.
 *
 * `phaseInitiale` vaut toujours `"pont"` (les 2 variantes commencent par le même écran) ;
 * `phaseApresPont` aiguille sur `exercice.variante` — `"angles"` pour `anglePartage`, `"cible"`
 * directement pour `cotePartage` (écran absent de sa séquence, les 2 angles qui ferment le
 * triangle cible étant déjà donnés dans l'énoncé).
 */
import type { ExerciceTriangleLies, GenerateurExerciceTriangleLies } from "../core/triangleLies.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import type { ReponseAnglesTriangleLies, ReponsePontSommetPartage, ReponseSoustractionTriangleLies } from "./verificationTriangleLies";
import { verifierAngles, verifierCible, verifierInterpretation, verifierPont, verifierPontSommetPartage, verifierSoustraction } from "./verificationTriangleLies";
import type { EtatSessionTriangleLies, PhaseTriangleLies, ResultatExerciceTriangleLies } from "./typesTriangleLies";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;
export const NIVEAU_AIDE_MAX_PONT = 2;
export const NIVEAU_AIDE_MAX_ANGLES = 3;
export const NIVEAU_AIDE_MAX_SOUSTRACTION = 2;
export const NIVEAU_AIDE_MAX_INTERPRETATION = 1;

/** Plafond d'aide DYNAMIQUE de l'écran "cible" (même principe que `niveauAideMax` de gen17,
 * `verificationAnglesAssocies.ts` — premier précédent d'un plafond calculé par exercice plutôt
 * qu'une constante fixe) : traitement léger (2 niveaux) si côté/angle demandé — techniques déjà
 * maîtrisées (gen19) — plus riche (3 niveaux) si l'aire est demandée — terrain pédagogique neuf sur
 * la plateforme (voir la spec, section 3). */
export function niveauAideMaxCible(exercice: ExerciceTriangleLies): number {
  return exercice.grandeurDemandee === "aire" ? 3 : 2;
}

function phaseInitiale(): PhaseTriangleLies {
  return "pont";
}

function phaseApresPont(exercice: ExerciceTriangleLies): PhaseTriangleLies {
  if (exercice.variante === "anglePartage") return "angles";
  if (exercice.variante === "sommetPartage") return "soustraction";
  return "cible";
}

const ETAT_TRANSITOIRE_INITIAL = {
  niveauAidePont: 0,
  niveauAideAngles: 0,
  niveauAideSoustraction: 0,
  niveauAideCible: 0,
  niveauAideInterpretation: 0,
  scorePontExercice: null,
  pontRevele: false,
  scoreAnglesExercice: null,
  anglesRevele: false,
  scoreSoustractionExercice: null,
  soustractionRevele: false,
  scoreCibleExercice: null,
  cibleRevele: false,
} as const;

export function demarrerSessionTriangleLies(reglages: ReglagesSession, generateur: GenerateurExerciceTriangleLies): EtatSessionTriangleLies {
  const exerciceCourant = generateur();
  return {
    reglages,
    generateur,
    indexExercice: 0,
    exerciceCourant,
    phase: phaseInitiale(),
    etapeCourante: demarrerEtapeTentatives(),
    ...ETAT_TRANSITOIRE_INITIAL,
    resultats: [],
    terminee: false,
  };
}

function reglagesEtape(etat: EtatSessionTriangleLies): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

function appliquerPenaliteNiveau(score: number, niveauAide: number): number {
  return Math.max(0, score - niveauAide * PENALITE_PAR_NIVEAU_AIDE);
}

export function activerAideSuivante(etat: EtatSessionTriangleLies): EtatSessionTriangleLies {
  if (etat.terminee) {
    throw new Error("activerAideSuivante : la session est déjà terminée");
  }
  if (etat.phase === "pont") {
    if (etat.niveauAidePont >= NIVEAU_AIDE_MAX_PONT) {
      throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    }
    return { ...etat, niveauAidePont: etat.niveauAidePont + 1 };
  }
  if (etat.phase === "angles") {
    if (etat.niveauAideAngles >= NIVEAU_AIDE_MAX_ANGLES) {
      throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    }
    return { ...etat, niveauAideAngles: etat.niveauAideAngles + 1 };
  }
  if (etat.phase === "soustraction") {
    if (etat.niveauAideSoustraction >= NIVEAU_AIDE_MAX_SOUSTRACTION) {
      throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    }
    return { ...etat, niveauAideSoustraction: etat.niveauAideSoustraction + 1 };
  }
  if (etat.phase === "cible") {
    if (etat.niveauAideCible >= niveauAideMaxCible(etat.exerciceCourant)) {
      throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    }
    return { ...etat, niveauAideCible: etat.niveauAideCible + 1 };
  }
  if (etat.niveauAideInterpretation >= NIVEAU_AIDE_MAX_INTERPRETATION) {
    throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  }
  return { ...etat, niveauAideInterpretation: etat.niveauAideInterpretation + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionTriangleLies, resultat: ResultatExerciceTriangleLies): EtatSessionTriangleLies {
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
    phase: phaseInitiale(),
    etapeCourante: demarrerEtapeTentatives(),
    ...ETAT_TRANSITOIRE_INITIAL,
  };
}

/** Commune à `cotePartage`/`anglePartage` — mène à "angles" (`anglePartage`) ou directement à
 * "cible" (`cotePartage`). Pour `sommetPartage`, utiliser `soumettreReponsePontSommetPartage`
 * (réponse à 3 champs, pas un simple nombre). */
export function soumettreReponsePont(etat: EtatSessionTriangleLies, valeur: number): EtatSessionTriangleLies {
  if (etat.terminee || etat.phase !== "pont") {
    throw new Error("soumettreReponsePont : la session n'est pas à l'étape pont");
  }
  const exerciceCourant = etat.exerciceCourant;
  if (exerciceCourant.variante === "sommetPartage") {
    throw new Error("soumettreReponsePont : utiliser soumettreReponsePontSommetPartage pour la variante sommetPartage");
  }

  const etapeCourante = soumettreEtapeTentatives<number>(etat.etapeCourante, valeur, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierPont(exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAidePont);

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: phaseApresPont(exerciceCourant),
    scorePontExercice: score,
    pontRevele: etapeCourante.revelee,
  };
}

/** Uniquement `sommetPartage` — réponse à 3 champs (angle au sommet + les 2 côtés qui en partent),
 * écrite dans les MÊMES champs de score/révélation que `soumettreReponsePont` (toujours "l'écran
 * pont", quelle que soit la forme de la réponse) ; mène toujours à "soustraction". */
export function soumettreReponsePontSommetPartage(etat: EtatSessionTriangleLies, reponse: ReponsePontSommetPartage): EtatSessionTriangleLies {
  if (etat.terminee || etat.phase !== "pont") {
    throw new Error("soumettreReponsePontSommetPartage : la session n'est pas à l'étape pont");
  }
  const exerciceCourant = etat.exerciceCourant;
  if (exerciceCourant.variante !== "sommetPartage") {
    throw new Error("soumettreReponsePontSommetPartage : n'existe que pour la variante sommetPartage");
  }

  const etapeCourante = soumettreEtapeTentatives<ReponsePontSommetPartage>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierPontSommetPartage(exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAidePont);

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: phaseApresPont(exerciceCourant),
    scorePontExercice: score,
    pontRevele: etapeCourante.revelee,
  };
}

/** Uniquement `sommetPartage` — mène toujours à "cible". */
export function soumettreReponseSoustraction(etat: EtatSessionTriangleLies, reponse: ReponseSoustractionTriangleLies): EtatSessionTriangleLies {
  if (etat.terminee || etat.phase !== "soustraction") {
    throw new Error("soumettreReponseSoustraction : la session n'est pas à l'étape soustraction");
  }
  const exerciceCourant = etat.exerciceCourant;
  if (exerciceCourant.variante !== "sommetPartage") {
    throw new Error("soumettreReponseSoustraction : l'écran soustraction n'existe que pour la variante sommetPartage");
  }

  const etapeCourante = soumettreEtapeTentatives<ReponseSoustractionTriangleLies>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierSoustraction(exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideSoustraction);

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "cible",
    scoreSoustractionExercice: score,
    soustractionRevele: etapeCourante.revelee,
  };
}

/** Uniquement `anglePartage` — mène toujours à "cible". */
export function soumettreReponseAngles(etat: EtatSessionTriangleLies, reponse: ReponseAnglesTriangleLies): EtatSessionTriangleLies {
  if (etat.terminee || etat.phase !== "angles") {
    throw new Error("soumettreReponseAngles : la session n'est pas à l'étape angles");
  }
  const exerciceCourant = etat.exerciceCourant;
  if (exerciceCourant.variante !== "anglePartage") {
    throw new Error("soumettreReponseAngles : l'écran angles n'existe que pour la variante anglePartage");
  }

  const etapeCourante = soumettreEtapeTentatives<ReponseAnglesTriangleLies>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierAngles(exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideAngles);

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "cible",
    scoreAnglesExercice: score,
    anglesRevele: etapeCourante.revelee,
  };
}

/** Commune aux 2 variantes — mène toujours à "interpretation". */
export function soumettreReponseCible(etat: EtatSessionTriangleLies, valeur: number): EtatSessionTriangleLies {
  if (etat.terminee || etat.phase !== "cible") {
    throw new Error("soumettreReponseCible : la session n'est pas à l'étape cible");
  }
  const exerciceCourant = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<number>(etat.etapeCourante, valeur, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierCible(exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideCible);

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "interpretation",
    scoreCibleExercice: score,
    cibleRevele: etapeCourante.revelee,
  };
}

/** Commune aux 2 variantes — toujours TERMINALE. */
export function soumettreReponseInterpretation(etat: EtatSessionTriangleLies, indexChoisi: number | null): EtatSessionTriangleLies {
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
    scorePont: etat.scorePontExercice as number,
    pontRevele: etat.pontRevele,
    niveauAidePont: etat.niveauAidePont,
    scoreAngles: etat.scoreAnglesExercice,
    anglesRevele: etat.anglesRevele,
    niveauAideAngles: etat.niveauAideAngles,
    scoreSoustraction: etat.scoreSoustractionExercice,
    soustractionRevele: etat.soustractionRevele,
    niveauAideSoustraction: etat.niveauAideSoustraction,
    scoreCible: etat.scoreCibleExercice as number,
    cibleRevele: etat.cibleRevele,
    niveauAideCible: etat.niveauAideCible,
    scoreInterpretation: score,
    interpretationRevele: etapeCourante.revelee,
    niveauAideInterpretation: etat.niveauAideInterpretation,
  });
}
