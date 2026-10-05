/**
 * Couche B (5e) — moteur de session pour 5gen7. N'importe jamais rien de `src/generateurs5e/` —
 * voir `sessionPolygonesArcsSecteurs.test.ts` pour la preuve avec des exercices factices définis
 * localement.
 */
import type { ExercicePolygonesArcsSecteurs } from "../core5e/polygonesArcsSecteurs.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseApres } from "./typesPolygonesArcsSecteurs";
import type { EtatSessionPolygonesArcsSecteurs, PhasePolygonesArcsSecteurs, ResultatExercicePolygonesArcsSecteurs } from "./typesPolygonesArcsSecteurs";
import { verifierCercleEntier, verifierEcranUnChamp } from "./verificationPolygonesArcsSecteurs";
import type { ReponseCercleEntier } from "./verificationPolygonesArcsSecteurs";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

function etatInitial(
  exercice: ExercicePolygonesArcsSecteurs,
): Pick<
  EtatSessionPolygonesArcsSecteurs,
  "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoreCercleEntierExercice" | "cercleEntierRevele" | "scoreArcElementaireExercice" | "arcElementaireRevele" | "scoreArcMultiPasExercice" | "arcMultiPasRevele" | "scoreSecteurElementaireExercice" | "secteurElementaireRevele"
> {
  return {
    exerciceCourant: exercice,
    phase: "cercleEntier",
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    scoreCercleEntierExercice: null,
    cercleEntierRevele: false,
    scoreArcElementaireExercice: null,
    arcElementaireRevele: false,
    scoreArcMultiPasExercice: null,
    arcMultiPasRevele: false,
    scoreSecteurElementaireExercice: null,
    secteurElementaireRevele: false,
  };
}

export function demarrerSessionPolygonesArcsSecteurs(reglages: ReglagesSession5e, generateur: () => ExercicePolygonesArcsSecteurs): EtatSessionPolygonesArcsSecteurs {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionPolygonesArcsSecteurs): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

/** 2 niveaux d'aide pour "cercleEntier"/"arcElementaire"/"secteurElementaire", 3 pour les écrans
 * multi-pas (spec explicite). */
export function niveauAideMax(phase: PhasePolygonesArcsSecteurs): number {
  return phase === "arcMultiPas" || phase === "secteurMultiPas" ? 3 : 2;
}

export function activerAideSuivante(etat: EtatSessionPolygonesArcsSecteurs): EtatSessionPolygonesArcsSecteurs {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= niveauAideMax(etat.phase)) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionPolygonesArcsSecteurs, resultat: ResultatExercicePolygonesArcsSecteurs): EtatSessionPolygonesArcsSecteurs {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()) };
}

/**
 * "secteurMultiPas" est TOUJOURS terminal quand atteint (jamais de champ d'état intermédiaire
 * `scoreSecteurMultiPasExercice` — inutile, son score n'a besoin de survivre que le temps de
 * construire le résultat final ci-dessous). "arcMultiPas" n'est en revanche JAMAIS terminal
 * (toujours suivi de "secteurElementaire") — seul "secteurElementaire" peut être terminal
 * (quand `secteurMultiPas===null`) OU non-terminal (sinon).
 */
function transitionApresEcran(etat: EtatSessionPolygonesArcsSecteurs, score: number, revele: boolean): EtatSessionPolygonesArcsSecteurs {
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;
  const phaseSuivante = phaseApres(exercice, phase);

  if (phaseSuivante !== "termine") {
    const champsScore: Partial<EtatSessionPolygonesArcsSecteurs> =
      phase === "cercleEntier"
        ? { scoreCercleEntierExercice: score, cercleEntierRevele: revele }
        : phase === "arcElementaire"
          ? { scoreArcElementaireExercice: score, arcElementaireRevele: revele }
          : phase === "arcMultiPas"
            ? { scoreArcMultiPasExercice: score, arcMultiPasRevele: revele }
            : { scoreSecteurElementaireExercice: score, secteurElementaireRevele: revele };
    return { ...etat, ...champsScore, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante };
  }

  // Dernier écran : soit "secteurElementaire" (secteurMultiPas absent), soit "secteurMultiPas".
  const scoreSecteurElementaireFinal = phase === "secteurElementaire" ? score : (etat.scoreSecteurElementaireExercice as number);
  const secteurElementaireReveleFinal = phase === "secteurElementaire" ? revele : etat.secteurElementaireRevele;

  return cloturerExerciceOuSuivant(etat, {
    exercice,
    scoreCercleEntier: etat.scoreCercleEntierExercice as number,
    cercleEntierRevele: etat.cercleEntierRevele,
    scoreArcElementaire: etat.scoreArcElementaireExercice as number,
    arcElementaireRevele: etat.arcElementaireRevele,
    scoreArcMultiPas: etat.scoreArcMultiPasExercice,
    arcMultiPasRevele: etat.arcMultiPasRevele,
    scoreSecteurElementaire: scoreSecteurElementaireFinal,
    secteurElementaireRevele: secteurElementaireReveleFinal,
    scoreSecteurMultiPas: phase === "secteurMultiPas" ? score : null,
    secteurMultiPasRevele: phase === "secteurMultiPas" ? revele : false,
  });
}

export function soumettreReponseCercleEntier(etat: EtatSessionPolygonesArcsSecteurs, reponse: ReponseCercleEntier): EtatSessionPolygonesArcsSecteurs {
  if (etat.terminee || etat.phase !== "cercleEntier") throw new Error("soumettreReponseCercleEntier : la session n'est pas à l'étape cercleEntier");
  const exercice = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<ReponseCercleEntier>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierCercleEntier(exercice, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const score = Math.max(0, (etapeCourante.score as number) - etat.niveauAide * PENALITE_PAR_NIVEAU_AIDE);
  return transitionApresEcran(etat, score, etapeCourante.revelee);
}

export function soumettreReponseEcranUnChamp(etat: EtatSessionPolygonesArcsSecteurs, texte: string): EtatSessionPolygonesArcsSecteurs {
  if (etat.terminee || etat.phase === "cercleEntier") throw new Error("soumettreReponseEcranUnChamp : la session n'est pas à un écran à un seul champ");
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, texte, {
    ...reglagesEtape(etat),
    verifier: (t) => verifierEcranUnChamp(exercice, phase, t),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const score = Math.max(0, (etapeCourante.score as number) - etat.niveauAide * PENALITE_PAR_NIVEAU_AIDE);
  return transitionApresEcran(etat, score, etapeCourante.revelee);
}
