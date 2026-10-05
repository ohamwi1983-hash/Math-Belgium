import type { EnsembleReelGuide } from "../core6e/ensembleReel.types";
import type { ExerciceInjectiviteFonctions } from "../core6e/injectiviteFonctions.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesInjectiviteFonctions";
import type { CoteBranche, EtatSessionInjectiviteFonctions, PhaseInjectiviteFonctions, ResultatExerciceInjectiviteFonctions } from "./typesInjectiviteFonctions";
import type { ReponseBijection, ReponseInjective } from "./verificationInjectiviteFonctions";
import { detecterCoteBranche, verifierBijection, verifierDomaine, verifierImage, verifierInjective, verifierReciproque } from "./verificationInjectiviteFonctions";

/**
 * Couche B (6e) — moteur de session pour `6gen1`. N'importe jamais rien de `src/generateurs6e/` —
 * voir `sessionInjectiviteFonctions.test.ts` (exercice factice local) et
 * `generateurs6e/injectiviteFonctions/session.integration.test.ts` (seul fichier autorisé Couche A
 * + Couche B) pour la preuve.
 */

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** 2 niveaux d'aide sur chaque écran, SAUF "bijection" qui n'en garde qu'un seul (complément
 * ciblé — voir historique-6e.md : la 2e aide de cet écran, redondante avec celle de l'écran
 * "image", a été supprimée). */
export const NIVEAU_AIDE_MAX: Record<PhaseInjectiviteFonctions, number> = {
  domaine: 2,
  injective: 2,
  reciproque: 2,
  image: 2,
  bijection: 1,
};

function etatInitial(
  exercice: ExerciceInjectiviteFonctions,
): Pick<
  EtatSessionInjectiviteFonctions,
  | "exerciceCourant"
  | "phase"
  | "etapeCourante"
  | "niveauAide"
  | "coteChoisi"
  | "scoreDomainePartiel"
  | "scoreInjectivePartiel"
  | "scoreReciproquePartiel"
  | "scoreImagePartiel"
  | "reveleDomainePartiel"
  | "reveleInjectivePartiel"
  | "reveleReciproquePartiel"
  | "reveleImagePartiel"
> {
  return {
    exerciceCourant: exercice,
    phase: phaseInitiale(),
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    coteChoisi: "droite",
    scoreDomainePartiel: null,
    scoreInjectivePartiel: null,
    scoreReciproquePartiel: null,
    scoreImagePartiel: null,
    reveleDomainePartiel: null,
    reveleInjectivePartiel: null,
    reveleReciproquePartiel: null,
    reveleImagePartiel: null,
  };
}

export function demarrerSessionInjectiviteFonctions(reglages: ReglagesSession6e, generateur: () => ExerciceInjectiviteFonctions): EtatSessionInjectiviteFonctions {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionInjectiviteFonctions): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionInjectiviteFonctions): EtatSessionInjectiviteFonctions {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  const max = NIVEAU_AIDE_MAX[etat.phase];
  if (etat.niveauAide >= max) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function scoreApresPenalite(etat: EtatSessionInjectiviteFonctions, scoreBrut: number): number {
  return Math.max(0, scoreBrut - etat.niveauAide * PENALITE_PAR_NIVEAU_AIDE);
}

function cloturerExerciceOuSuivant(etat: EtatSessionInjectiviteFonctions, resultat: ResultatExerciceInjectiviteFonctions): EtatSessionInjectiviteFonctions {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()) };
}

/**
 * Générique, comme dans les autres générateurs 6e — mais accepte un `apresTerminee` optionnel pour
 * la SEULE transition qui a besoin d'un effet de bord supplémentaire (mémoriser `coteChoisi` en
 * quittant la phase "injective", voir en-tête de `typesInjectiviteFonctions.ts`).
 */
function avancerPhase<TReponse>(
  etat: EtatSessionInjectiviteFonctions,
  reponse: TReponse,
  verifier: (exercice: ExerciceInjectiviteFonctions, reponse: TReponse) => boolean,
  phaseAttendue: PhaseInjectiviteFonctions,
  apresTerminee?: (etat: EtatSessionInjectiviteFonctions, reponse: TReponse) => Partial<EtatSessionInjectiviteFonctions>,
): EtatSessionInjectiviteFonctions {
  if (etat.terminee) throw new Error("soumettreReponse : la session est déjà terminée");
  if (etat.phase !== phaseAttendue) throw new Error(`soumettreReponse : attendu à la phase "${phaseAttendue}", trouvé "${etat.phase}"`);
  const exercice = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<TReponse>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifier(exercice, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const score = scoreApresPenalite(etat, etapeCourante.score as number);
  const revele = etapeCourante.revelee;
  const effetsSupplementaires = apresTerminee ? apresTerminee(etat, reponse) : {};
  const phaseSuivante = phaseApres(etat.phase);

  if (phaseSuivante === "termine") {
    return cloturerExerciceOuSuivant(etat, {
      exercice,
      scoreDomaine: etat.scoreDomainePartiel as number,
      scoreInjective: etat.scoreInjectivePartiel as number,
      scoreReciproque: etat.scoreReciproquePartiel as number,
      scoreImage: etat.scoreImagePartiel as number,
      scoreBijection: score,
      reveleDomaine: etat.reveleDomainePartiel as boolean,
      reveleInjective: etat.reveleInjectivePartiel as boolean,
      reveleReciproque: etat.reveleReciproquePartiel as boolean,
      reveleImage: etat.reveleImagePartiel as boolean,
      reveleBijection: revele,
    });
  }

  const partielsMisAJour: Partial<EtatSessionInjectiviteFonctions> = {};
  if (etat.phase === "domaine") {
    partielsMisAJour.scoreDomainePartiel = score;
    partielsMisAJour.reveleDomainePartiel = revele;
  } else if (etat.phase === "injective") {
    partielsMisAJour.scoreInjectivePartiel = score;
    partielsMisAJour.reveleInjectivePartiel = revele;
  } else if (etat.phase === "reciproque") {
    partielsMisAJour.scoreReciproquePartiel = score;
    partielsMisAJour.reveleReciproquePartiel = revele;
  } else if (etat.phase === "image") {
    partielsMisAJour.scoreImagePartiel = score;
    partielsMisAJour.reveleImagePartiel = revele;
  }

  return { ...etat, ...partielsMisAJour, ...effetsSupplementaires, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante };
}

export function soumettreReponseDomaine(etat: EtatSessionInjectiviteFonctions, reponse: EnsembleReelGuide): EtatSessionInjectiviteFonctions {
  return avancerPhase(etat, reponse, verifierDomaine, "domaine");
}

/**
 * Mémorise `coteChoisi` (voir en-tête de `typesInjectiviteFonctions.ts`) au moment EXACT où la
 * phase "injective" se termine — que ce soit par une réponse correcte ou par une révélation après
 * épuisement des tentatives (`detecterCoteBranche` retombe alors sur `"droite"` par défaut).
 */
export function soumettreReponseInjective(etat: EtatSessionInjectiviteFonctions, reponse: ReponseInjective): EtatSessionInjectiviteFonctions {
  return avancerPhase(etat, reponse, verifierInjective, "injective", (etatCourant, r) => ({
    coteChoisi: detecterCoteBranche(etatCourant.exerciceCourant, r.intervalle) as CoteBranche,
  }));
}

export function soumettreReponseReciproque(etat: EtatSessionInjectiviteFonctions, texte: string): EtatSessionInjectiviteFonctions {
  return avancerPhase(etat, texte, (exercice, t) => verifierReciproque(exercice, etat.coteChoisi, t), "reciproque");
}

export function soumettreReponseImage(etat: EtatSessionInjectiviteFonctions, reponse: EnsembleReelGuide): EtatSessionInjectiviteFonctions {
  return avancerPhase(etat, reponse, verifierImage, "image");
}

export function soumettreReponseBijection(etat: EtatSessionInjectiviteFonctions, reponse: ReponseBijection): EtatSessionInjectiviteFonctions {
  return avancerPhase(etat, reponse, verifierBijection, "bijection");
}
