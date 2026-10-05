/**
 * Couche B — moteur de session pour 5gen1 ("Domaine de définition", 5e FWB 4h). N'importe jamais
 * rien de `src/generateurs5e/` — voir `sessionDomaineDefinition.test.ts` pour la preuve avec un
 * générateur factice.
 *
 * 3 phases — `ce → resolution → domf`, `resolution` SAUTÉE uniquement pour la famille "pasDeCE"
 * (voir `phaseApresCE`, typesDomaineDefinition.ts). Aide progressive additive par écran
 * (-20 pts/niveau), même mécanique que le reste de la plateforme.
 *
 * Réutilise directement `demarrerEtapeTentatives`/`soumettreEtapeTentatives`
 * (`src/moteur/etapeTentatives.ts`) — brique générique sans aucune connaissance du contenu vérifié,
 * import cross-chantier explicitement décidé (voir CLAUDE.md section 5gen1).
 */
import type { EnsembleReelGuide, ExerciceDomaineDefinition, GenerateurExerciceDomaineDefinition, GrilleQuotientDomf } from "../core5e/domaineDefinition.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { niveauAideMaxCE, niveauAideMaxDomf, niveauAideMaxResolution, phaseApresCE } from "./typesDomaineDefinition";
import type { EtatSessionDomaineDefinition, ResultatExerciceDomaineDefinition } from "./typesDomaineDefinition";
import { verifierCE, verifierEnsembleReelGuide, verifierGrilleDomf, verifierResolutionRacineSurFraction } from "./verificationDomaineDefinition";
import type { ReponseCE, ReponseResolutionRacineSurFraction } from "./verificationDomaineDefinition";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

export { niveauAideMaxCE, niveauAideMaxDomf, niveauAideMaxResolution };

export type ReponseResolution =
  | { famille: "rationnelle" | "irrationnelleSimple" | "racineImpaireDenominateur"; ensemble: EnsembleReelGuide }
  | ({ famille: "racineSurFraction" } & ReponseResolutionRacineSurFraction)
  | { famille: "fractionSousRacine"; grille: GrilleQuotientDomf };

function etatInitial(
  exercice: ExerciceDomaineDefinition,
): Pick<EtatSessionDomaineDefinition, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAideCE" | "niveauAideResolution" | "niveauAideDomf" | "scoreCEExercice" | "ceRevele" | "scoreResolutionExercice" | "resolutionRevele"> {
  return {
    exerciceCourant: exercice,
    phase: "ce",
    etapeCourante: demarrerEtapeTentatives(),
    niveauAideCE: 0,
    niveauAideResolution: 0,
    niveauAideDomf: 0,
    scoreCEExercice: null,
    ceRevele: false,
    scoreResolutionExercice: null,
    resolutionRevele: false,
  };
}

export function demarrerSessionDomaineDefinition(reglages: ReglagesSession5e, generateur: GenerateurExerciceDomaineDefinition): EtatSessionDomaineDefinition {
  return {
    reglages,
    generateur,
    indexExercice: 0,
    resultats: [],
    terminee: false,
    ...etatInitial(generateur()),
  };
}

function reglagesEtape(etat: EtatSessionDomaineDefinition): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

function appliquerPenaliteNiveau(score: number, niveauAide: number): number {
  return Math.max(0, score - niveauAide * PENALITE_PAR_NIVEAU_AIDE);
}

export function activerAideSuivante(etat: EtatSessionDomaineDefinition): EtatSessionDomaineDefinition {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  const exercice = etat.exerciceCourant;
  if (etat.phase === "ce") {
    if (etat.niveauAideCE >= niveauAideMaxCE(exercice)) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    return { ...etat, niveauAideCE: etat.niveauAideCE + 1 };
  }
  if (etat.phase === "resolution") {
    if (etat.niveauAideResolution >= niveauAideMaxResolution()) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    return { ...etat, niveauAideResolution: etat.niveauAideResolution + 1 };
  }
  if (etat.niveauAideDomf >= niveauAideMaxDomf(exercice)) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAideDomf: etat.niveauAideDomf + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionDomaineDefinition, resultat: ResultatExerciceDomaineDefinition): EtatSessionDomaineDefinition {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()) };
}

/** Écran "ce" — mène à "resolution", sauf famille "pasDeCE" qui saute directement à "domf". */
export function soumettreReponseCE(etat: EtatSessionDomaineDefinition, reponse: ReponseCE): EtatSessionDomaineDefinition {
  if (etat.terminee || etat.phase !== "ce") throw new Error("soumettreReponseCE : la session n'est pas à l'étape ce");
  const exercice = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<ReponseCE>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierCE(exercice, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideCE);
  const phaseSuivante = phaseApresCE(exercice);

  if (phaseSuivante === "domf") {
    return {
      ...etat,
      etapeCourante: demarrerEtapeTentatives(),
      phase: "domf",
      scoreCEExercice: score,
      ceRevele: etapeCourante.revelee,
      scoreResolutionExercice: null,
      resolutionRevele: false,
    };
  }

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "resolution",
    scoreCEExercice: score,
    ceRevele: etapeCourante.revelee,
  };
}

function verifierResolutionQuelconque(exercice: ExerciceDomaineDefinition, reponse: ReponseResolution): boolean {
  if (reponse.famille !== exercice.famille) return false;
  if (exercice.famille === "rationnelle" || exercice.famille === "irrationnelleSimple" || exercice.famille === "racineImpaireDenominateur") {
    return reponse.famille === exercice.famille && verifierEnsembleReelGuide(reponse.ensemble, exercice.resolution);
  }
  if (exercice.famille === "racineSurFraction" && reponse.famille === "racineSurFraction") {
    return verifierResolutionRacineSurFraction(exercice, reponse);
  }
  if (exercice.famille === "fractionSousRacine" && reponse.famille === "fractionSousRacine") {
    return verifierGrilleDomf(reponse.grille, exercice.grille);
  }
  return false;
}

/** Écran "resolution" (absent de la séquence pour la famille "pasDeCE") — mène toujours à "domf". */
export function soumettreReponseResolution(etat: EtatSessionDomaineDefinition, reponse: ReponseResolution): EtatSessionDomaineDefinition {
  if (etat.terminee || etat.phase !== "resolution") throw new Error("soumettreReponseResolution : la session n'est pas à l'étape resolution");
  const exercice = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<ReponseResolution>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierResolutionQuelconque(exercice, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideResolution);

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "domf",
    scoreResolutionExercice: score,
    resolutionRevele: etapeCourante.revelee,
  };
}

/** Écran "domf" (dernière phase, toujours atteinte) — clôture toujours l'exercice. */
export function soumettreReponseDomf(etat: EtatSessionDomaineDefinition, reponse: EnsembleReelGuide): EtatSessionDomaineDefinition {
  if (etat.terminee || etat.phase !== "domf") throw new Error("soumettreReponseDomf : la session n'est pas à l'étape domf");
  const exercice = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<EnsembleReelGuide>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierEnsembleReelGuide(r, exercice.domf),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideDomf);

  return cloturerExerciceOuSuivant(etat, {
    exercice,
    scoreCE: etat.scoreCEExercice as number,
    ceRevele: etat.ceRevele,
    niveauAideCE: etat.niveauAideCE,
    scoreResolution: etat.scoreResolutionExercice,
    resolutionRevele: etat.resolutionRevele,
    niveauAideResolution: etat.scoreResolutionExercice === null ? null : etat.niveauAideResolution,
    scoreDomf: score,
    domfRevele: etapeCourante.revelee,
    niveauAideDomf: etat.niveauAideDomf,
  });
}
