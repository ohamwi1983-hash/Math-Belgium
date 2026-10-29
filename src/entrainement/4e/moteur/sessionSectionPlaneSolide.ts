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
 * Aide PROGRESSIVE (2 niveaux max par écran, remise à 0 à chaque écran — y compris entre
 * "auxiliaireLignes" et "auxiliaireFace", qui ont chacun leurs propres aides depuis l'audit du
 * chapitre 8 ; aucune aide sur "conclusion") — même mécanique que le reste du projet.
 *
 * **Tentatives (audit chapitre 8, décision H2a)** : UNE seule tentative sur les écrans de choix
 * parmi quelques faces ("segmentDirect", "auxiliaireFace"), qui se gagnaient sinon par élimination ;
 * l'écran "auxiliaireLignes" (≈ 2 paires valables sur plus de 300) garde `reglages.tentativesMax`.
 * Le DERNIER segment du polygone (un seul candidat possible) est tracé automatiquement, sans écran.
 */
import type { GenerateurExerciceSectionPlaneSolide } from "../core/sectionPlaneSolide.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import {
  ciblesAuxiliaires,
  cleSegment,
  facesPretesPourSegment,
  pairesLignesValides,
  pointDebloqueParFaceAuxiliaire,
  polygoneFerme,
  resoudreLigne,
  verifierFaceAuxiliaire,
  verifierLignesAuxiliaires,
  verifierSegmentDirect,
} from "./verificationSectionPlaneSolide";
import type { EtatSessionSectionPlaneSolide, ResultatExerciceSectionPlaneSolide } from "./typesSectionPlaneSolide";

const POINTS_DE_BASE = 100;
export const NIVEAU_AIDE_MAX_SEGMENT = 2;
export const NIVEAU_AIDE_MAX_AUXILIAIRE = 2;
/** Une seule tentative sur les écrans de choix de face (décision H2a, voir l'en-tête). */
export const TENTATIVES_MAX_CHOIX_FACE = 1;

/** Nombre de tentatives de l'écran COURANT — 1 pour un choix de face, `reglages.tentativesMax`
 * pour le choix des 2 droites. Utilisé par le moteur ET par l'affichage du message d'erreur. */
export function tentativesMaxPhase(etat: Pick<EtatSessionSectionPlaneSolide, "phase" | "reglages">): number {
  return etat.phase === "auxiliaireLignes" ? etat.reglages.tentativesMax : TENTATIVES_MAX_CHOIX_FACE;
}

/** Trace AUTOMATIQUEMENT le dernier segment du polygone quand il est le seul restant et que ses 2
 * points sont connus (un seul candidat possible : un écran pour lui ne testerait rien, audit
 * chapitre 8, point 23). Mute `segmentsTraces` et renvoie la clé tracée, ou `null`. */
function tracerDernierSegmentSiSeul(
  etat: Pick<EtatSessionSectionPlaneSolide, "exerciceCourant">,
  connus: ReadonlySet<number>,
  segmentsTraces: Set<string>,
): string | null {
  if (segmentsTraces.size !== etat.exerciceCourant.points.length - 1) return null;
  const pretes = facesPretesPourSegment(etat.exerciceCourant, connus, segmentsTraces);
  if (pretes.length !== 1) return null;
  const cle = cleSegment(pretes[0].pointA, pretes[0].pointB);
  segmentsTraces.add(cle);
  return cle;
}

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
    segmentAutomatique: null,
    derniereConstruction: null,
    resultats: [],
    terminee: false,
  };
}

function reglagesEtape(etat: EtatSessionSectionPlaneSolide): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: tentativesMaxPhase(etat),
  };
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
    segmentAutomatique: null,
    derniereConstruction: null,
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

  const score = etapeCourante.score as number;
  const scoresAccumules = [...etat.scoresAccumules, score];
  const revelesAccumules = [...etat.revelesAccumules, etapeCourante.revelee];
  const niveauxAideAccumules = [...etat.niveauxAideAccumules, etat.niveauAide];

  // Trace le segment réellement confirmé — celui choisi par l'élève s'il était correct, sinon la
  // première face prête trouvée (garantie non vide : cette phase n'est atteinte que si au moins une
  // face l'est).
  const facesPretes = facesPretesPourSegment(etat.exerciceCourant, connusSet, segmentsTracesSet);
  const faceConfirmee = facesPretes.find((f) => f.face === faceChoisie) ?? facesPretes[0];
  segmentsTracesSet.add(cleSegment(faceConfirmee.pointA, faceConfirmee.pointB));
  const segmentAutomatique = tracerDernierSegmentSiSeul(etat, connusSet, segmentsTracesSet);

  const phase = phaseDepuisEtat(etat, connusSet, segmentsTracesSet);

  return {
    ...etat,
    phase,
    segmentsTraces: [...segmentsTracesSet],
    segmentAutomatique,
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    scoresAccumules,
    revelesAccumules,
    niveauxAideAccumules,
  };
}

/** Écran B, étape 1 : les 2 droites choisies doivent réellement débloquer au moins une face à
 * moitié connue — une fois validées, elles sont conservées (`ligneAuxiliaireChoisie`) pour l'étape
 * "auxiliaireFace" qui suit, jamais recalculées indépendamment. L'aide est remise à 0 en sortie :
 * l'écran "face" a ses propres aides (audit chapitre 8). */
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

  const score = etapeCourante.score as number;
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
    niveauAide: 0,
    scoresAccumules,
    revelesAccumules,
    niveauxAideAccumules,
  };
}

/** Paire RÉVÉLÉE après échec — la plus lisible des paires valables (`pairesLignesValides` : 2
 * droites d'une même face, point auxiliaire proche du solide), jamais une paire « creuse ». */
function trouverPaireLignesValide(
  exercice: EtatSessionSectionPlaneSolide["exerciceCourant"],
  connus: ReadonlySet<number>,
  segmentsTraces: ReadonlySet<string>,
): [string, string] {
  const meilleure = pairesLignesValides(exercice, connus, segmentsTraces)[0];
  if (meilleure) return [meilleure.ligne1, meilleure.ligne2];
  // Ne devrait jamais arriver pour une instance résoluble (garantie `resolutionReference` à la
  // génération) — garde défensive plutôt qu'un throw, pour ne jamais bloquer le flux.
  const premiere = exercice.lignesStatiques;
  return [premiere[0].cle, premiere[1].cle];
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

  const score = etapeCourante.score as number;
  const scoresAccumules = [...etat.scoresAccumules, score];
  const revelesAccumules = [...etat.revelesAccumules, etapeCourante.revelee];
  const niveauxAideAccumules = [...etat.niveauxAideAccumules, etat.niveauAide];

  const construction = constructionConfirmee(etat.exerciceCourant, connusSet, ligne1, ligne2, faceChoisie);
  connusSet.add(construction.pointCible);

  const segmentsTracesSet = new Set(etat.segmentsTraces);
  const segmentAutomatique = tracerDernierSegmentSiSeul(etat, connusSet, segmentsTracesSet);
  const phase = phaseDepuisEtat(etat, connusSet, segmentsTracesSet);

  return {
    ...etat,
    phase,
    connus: [...connusSet],
    segmentsTraces: [...segmentsTracesSet],
    segmentAutomatique,
    derniereConstruction: { ligne1, ligne2, ...construction },
    ligneAuxiliaireChoisie: null,
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    scoresAccumules,
    revelesAccumules,
    niveauxAideAccumules,
  };
}

/** Construction réellement confirmée à l'écran "face" : celle de la face choisie si elle est
 * correcte, sinon la première face réellement débloquée par la paire (garantie non vide,
 * `verifierLignesAuxiliaires` déjà validé à l'étape précédente pour cette même paire). */
function constructionConfirmee(
  exercice: EtatSessionSectionPlaneSolide["exerciceCourant"],
  connus: ReadonlySet<number>,
  ligne1: string,
  ligne2: string,
  faceChoisie: number,
): { face: number; pointConnu: number; pointCible: number } {
  const l1 = resoudreLigne(exercice, ligne1);
  const l2 = resoudreLigne(exercice, ligne2);
  const cibles = l1 && l2 ? ciblesAuxiliaires(exercice, connus, l1, l2) : [];
  const cible = cibles.find((c) => c.face === faceChoisie) ?? cibles[0];
  if (cible) return cible;
  // Ne devrait jamais arriver — garde défensive.
  const point = pointDebloqueParFaceAuxiliaire(exercice, connus, ligne1, ligne2, faceChoisie);
  return { face: faceChoisie, pointConnu: point ?? exercice.points[0].id, pointCible: point ?? exercice.points[0].id };
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
