/**
 * Couche B — moteur de session pour "Section plane d'un solide" (40e générateur, chapitre
 * "Géométrie dans l'espace"). N'importe jamais rien de `src/generateurs/` — voir
 * `sessionSectionPlaneSolide.test.ts` pour la preuve avec un générateur factice, même principe que
 * les 39 autres moteurs du projet.
 *
 * **Boucle dynamique, pas une séquence de phases fixe** — voir `typesSectionPlaneSolide.ts` pour le
 * détail de l'architecture. `phaseDepuisEtat` est l'unique point de décision : recalculée après
 * CHAQUE mutation d'état (segment tracé, point découvert), elle retourne toujours la phase
 * pertinente, sans jamais énumérer les itérations à l'avance.
 *
 * Aide PROGRESSIVE (2 niveaux max sur "segmentDirect", 2 niveaux max PARTAGÉS sur le flux
 * "auxiliaireLignes"→"auxiliaireFace", aucune aide sur "conclusion"), pénalité ADDITIVE (-20 points
 * par niveau atteint) appliquée à la clôture de l'étape concernée — même mécanique que le reste du
 * projet.
 */
import type { GenerateurExerciceSectionPlaneSolide } from "../core/sectionPlaneSolide.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import {
  cleSegment,
  facesPretesPourSegment,
  pointDebloqueParFaceAuxiliaire,
  polygoneFerme,
  verifierFaceAuxiliaire,
  verifierLignesAuxiliaires,
  verifierSegmentDirect,
} from "./verificationSectionPlaneSolide";
import type { EtatSessionSectionPlaneSolide, ResultatExerciceSectionPlaneSolide } from "./typesSectionPlaneSolide";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;
export const NIVEAU_AIDE_MAX_SEGMENT = 2;
export const NIVEAU_AIDE_MAX_AUXILIAIRE = 2;

function phaseDepuisEtat(
  etat: Pick<EtatSessionSectionPlaneSolide, "exerciceCourant">,
  connus: ReadonlySet<number>,
  segmentsTraces: ReadonlySet<string>,
): "segmentDirect" | "auxiliaireLignes" | "conclusion" {
  if (polygoneFerme(etat.exerciceCourant, segmentsTraces)) return "conclusion";
  if (facesPretesPourSegment(etat.exerciceCourant, connus, segmentsTraces).length > 0) return "segmentDirect";
  return "auxiliaireLignes";
}

export function demarrerSessionSectionPlaneSolide(
  reglages: ReglagesSession,
  generateur: GenerateurExerciceSectionPlaneSolide,
): EtatSessionSectionPlaneSolide {
  const exerciceCourant = generateur();
  const connus = new Set(exerciceCourant.idsDepart);
  return {
    reglages,
    generateur,
    indexExercice: 0,
    exerciceCourant,
    phase: phaseDepuisEtat({ exerciceCourant }, connus, new Set()),
    connus: [...connus],
    segmentsTraces: [],
    ligneAuxiliaireChoisie: null,
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    scoresAccumules: [],
    revelesAccumules: [],
    niveauxAideAccumules: [],
    resultats: [],
    terminee: false,
  };
}

function reglagesEtape(etat: EtatSessionSectionPlaneSolide): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

function appliquerPenaliteNiveau(score: number, niveauAide: number): number {
  return Math.max(0, score - niveauAide * PENALITE_PAR_NIVEAU_AIDE);
}

/** Révèle le niveau d'aide suivant de l'unité pédagogique courante — lève si la session est
 * terminée, si l'écran courant est "conclusion" (aucune aide, jamais de bouton), ou si le niveau
 * maximal de l'écran courant est déjà atteint. */
export function activerAideSuivante(etat: EtatSessionSectionPlaneSolide): EtatSessionSectionPlaneSolide {
  if (etat.terminee) {
    throw new Error("activerAideSuivante : la session est déjà terminée");
  }
  if (etat.phase === "conclusion") {
    throw new Error("activerAideSuivante : aucune aide sur l'écran de conclusion");
  }
  const max = etat.phase === "segmentDirect" ? NIVEAU_AIDE_MAX_SEGMENT : NIVEAU_AIDE_MAX_AUXILIAIRE;
  if (etat.niveauAide >= max) {
    throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  }
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(
  etat: EtatSessionSectionPlaneSolide,
  resultat: ResultatExerciceSectionPlaneSolide,
): EtatSessionSectionPlaneSolide {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;

  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }

  const exerciceCourant = etat.generateur();
  const connus = new Set(exerciceCourant.idsDepart);

  return {
    ...etat,
    resultats,
    indexExercice,
    exerciceCourant,
    phase: phaseDepuisEtat({ exerciceCourant }, connus, new Set()),
    connus: [...connus],
    segmentsTraces: [],
    ligneAuxiliaireChoisie: null,
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    scoresAccumules: [],
    revelesAccumules: [],
    niveauxAideAccumules: [],
  };
}

/** Écran A : la face choisie doit avoir réellement 2 points connus et un segment pas encore tracé —
 * une fois validée, ce segment est ajouté à `segmentsTraces` (jamais un nouveau point découvert, un
 * segment direct ne fait que relier 2 points déjà connus). Épuisement des tentatives : le segment
 * "révélé" est celui de la première face prête trouvée (déterministe), pour que le flux avance
 * toujours, même quand plusieurs faces étaient valables. */
export function soumettreReponseSegmentDirect(
  etat: EtatSessionSectionPlaneSolide,
  faceChoisie: number,
): EtatSessionSectionPlaneSolide {
  if (etat.terminee || etat.phase !== "segmentDirect") {
    throw new Error("soumettreReponseSegmentDirect : la session n'est pas à l'étape segmentDirect");
  }

  const connusSet = new Set(etat.connus);
  const segmentsTracesSet = new Set(etat.segmentsTraces);

  const etapeCourante = soumettreEtapeTentatives<number>(etat.etapeCourante, faceChoisie, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierSegmentDirect(etat.exerciceCourant, connusSet, segmentsTracesSet, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAide);
  const scoresAccumules = [...etat.scoresAccumules, score];
  const revelesAccumules = [...etat.revelesAccumules, etapeCourante.revelee];
  const niveauxAideAccumules = [...etat.niveauxAideAccumules, etat.niveauAide];

  // Trace le segment réellement confirmé — celui choisi par l'élève s'il était correct, sinon la
  // première face prête trouvée (garantie non vide : cette phase n'est atteinte que si au moins une
  // face l'est).
  const facesPretes = facesPretesPourSegment(etat.exerciceCourant, connusSet, segmentsTracesSet);
  const faceConfirmee = facesPretes.find((f) => f.face === faceChoisie) ?? facesPretes[0];
  segmentsTracesSet.add(cleSegment(faceConfirmee.pointA, faceConfirmee.pointB));

  const phase = phaseDepuisEtat(etat, connusSet, segmentsTracesSet);

  return {
    ...etat,
    phase,
    segmentsTraces: [...segmentsTracesSet],
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    scoresAccumules,
    revelesAccumules,
    niveauxAideAccumules,
  };
}

/** Écran B, étape 1 : les 2 droites choisies doivent réellement débloquer au moins une face à
 * moitié connue — une fois validées, elles sont conservées (`ligneAuxiliaireChoisie`) pour l'étape
 * "auxiliaireFace" qui suit, jamais recalculées indépendamment. L'aide n'est PAS réinitialisée en
 * sortie (même unité pédagogique que l'étape suivante, spec section "Écran type B"). */
export function soumettreReponseAuxiliaireLignes(
  etat: EtatSessionSectionPlaneSolide,
  ligne1: string,
  ligne2: string,
): EtatSessionSectionPlaneSolide {
  if (etat.terminee || etat.phase !== "auxiliaireLignes") {
    throw new Error("soumettreReponseAuxiliaireLignes : la session n'est pas à l'étape auxiliaireLignes");
  }

  const connusSet = new Set(etat.connus);

  const etapeCourante = soumettreEtapeTentatives<[string, string]>(etat.etapeCourante, [ligne1, ligne2], {
    ...reglagesEtape(etat),
    verifier: ([l1, l2]) => verifierLignesAuxiliaires(etat.exerciceCourant, connusSet, l1, l2),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAide);
  const scoresAccumules = [...etat.scoresAccumules, score];
  const revelesAccumules = [...etat.revelesAccumules, etapeCourante.revelee];
  const niveauxAideAccumules = [...etat.niveauxAideAccumules, etat.niveauAide];

  // Si l'élève n'a jamais trouvé de paire valide, une paire réellement valable est retrouvée par
  // recherche exhaustive (garantie non vide par `simulationResoluble` à la génération) — jamais la
  // paire fausse soumise par l'élève, qui ne débloquerait rien à l'étape suivante.
  const pairesValides = etapeCourante.reussie
    ? ([ligne1, ligne2] as [string, string])
    : trouverPaireLignesValide(etat.exerciceCourant, connusSet, new Set(etat.segmentsTraces));

  return {
    ...etat,
    phase: "auxiliaireFace",
    ligneAuxiliaireChoisie: pairesValides,
    etapeCourante: demarrerEtapeTentatives(),
    scoresAccumules,
    revelesAccumules,
    niveauxAideAccumules,
    // niveauAide volontairement PAS réinitialisé ici — même unité pédagogique que l'étape suivante.
  };
}

function trouverPaireLignesValide(
  exercice: EtatSessionSectionPlaneSolide["exerciceCourant"],
  connus: ReadonlySet<number>,
  segmentsTraces: ReadonlySet<string>,
): [string, string] {
  const candidats = [
    ...exercice.lignesStatiques.map((l) => l.cle),
    ...[...segmentsTraces].map((s) => `segment:${s}`),
  ];
  for (let i = 0; i < candidats.length; i++) {
    for (let j = i + 1; j < candidats.length; j++) {
      if (verifierLignesAuxiliaires(exercice, connus, candidats[i], candidats[j])) {
        return [candidats[i], candidats[j]];
      }
    }
  }
  // Ne devrait jamais arriver pour une instance résoluble (garantie `simulationResoluble` à la
  // génération) — garde défensive plutôt qu'un throw, pour ne jamais bloquer le flux.
  return [candidats[0], candidats[1]];
}

/** Écran B, étape 2 (dernière étape du flux auxiliaire) : la face choisie doit être réellement
 * débloquée par la paire de droites déjà validée — une fois validée, le nouveau point de section
 * qu'elle désigne devient CONNU. */
export function soumettreReponseAuxiliaireFace(
  etat: EtatSessionSectionPlaneSolide,
  faceChoisie: number,
): EtatSessionSectionPlaneSolide {
  if (etat.terminee || etat.phase !== "auxiliaireFace") {
    throw new Error("soumettreReponseAuxiliaireFace : la session n'est pas à l'étape auxiliaireFace");
  }
  if (!etat.ligneAuxiliaireChoisie) {
    throw new Error("soumettreReponseAuxiliaireFace : aucune paire de droites confirmée à l'étape précédente");
  }
  const [ligne1, ligne2] = etat.ligneAuxiliaireChoisie;
  const connusSet = new Set(etat.connus);

  const etapeCourante = soumettreEtapeTentatives<number>(etat.etapeCourante, faceChoisie, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierFaceAuxiliaire(etat.exerciceCourant, connusSet, ligne1, ligne2, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAide);
  const scoresAccumules = [...etat.scoresAccumules, score];
  const revelesAccumules = [...etat.revelesAccumules, etapeCourante.revelee];
  const niveauxAideAccumules = [...etat.niveauxAideAccumules, etat.niveauAide];

  const pointDebloque =
    pointDebloqueParFaceAuxiliaire(etat.exerciceCourant, connusSet, ligne1, ligne2, faceChoisie) ??
    pointDebloqueParFacePremiereValide(etat.exerciceCourant, connusSet, ligne1, ligne2);
  connusSet.add(pointDebloque);

  const segmentsTracesSet = new Set(etat.segmentsTraces);
  const phase = phaseDepuisEtat(etat, connusSet, segmentsTracesSet);

  return {
    ...etat,
    phase,
    connus: [...connusSet],
    ligneAuxiliaireChoisie: null,
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    scoresAccumules,
    revelesAccumules,
    niveauxAideAccumules,
  };
}

function pointDebloqueParFacePremiereValide(
  exercice: EtatSessionSectionPlaneSolide["exerciceCourant"],
  connus: ReadonlySet<number>,
  ligne1: string,
  ligne2: string,
): number {
  // Recherche directe via les mêmes primitives que verifierFaceAuxiliaire, sans re-parcourir toutes
  // les faces à la main — réutilise `pointDebloqueParFaceAuxiliaire` en testant chaque face croisée
  // jusqu'à trouver la première réellement débloquée (garanti non vide, `verifierLignesAuxiliaires`
  // déjà validé à l'étape précédente pour cette même paire).
  for (const face of exercice.facesCroisees) {
    const point = pointDebloqueParFaceAuxiliaire(exercice, connus, ligne1, ligne2, face);
    if (point !== null) return point;
  }
  // Ne devrait jamais arriver — garde défensive.
  return exercice.points[0].id;
}

/** Écran de conclusion, dernière étape : aucune interaction/vérification (spec, "Condition
 * d'arrêt") — clôture toujours l'exercice, agrège la moyenne des scores déjà accumulés. */
export function soumettreConclusion(etat: EtatSessionSectionPlaneSolide): EtatSessionSectionPlaneSolide {
  if (etat.terminee || etat.phase !== "conclusion") {
    throw new Error("soumettreConclusion : la session n'est pas à l'étape conclusion");
  }
  const scores = etat.scoresAccumules;
  const scoreMoyen = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  return cloturerExerciceOuSuivant(etat, {
    scores,
    scoreMoyen,
    revelees: etat.revelesAccumules,
    niveauxAide: etat.niveauxAideAccumules,
  });
}
