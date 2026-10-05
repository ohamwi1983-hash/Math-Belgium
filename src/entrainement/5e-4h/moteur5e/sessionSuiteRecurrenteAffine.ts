/**
 * Couche B (5e) — moteur de session pour 5gen19 ("Suite récurrente affine et régime permanent").
 * N'importe jamais rien de `src/generateurs5e/`.
 */
import type { ExerciceSuiteRecurrenteAffine } from "../core5e/suiteRecurrenteAffine.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesSuiteRecurrenteAffine";
import type { EtatSessionSuiteRecurrenteAffine, PhaseSuiteRecurrenteAffine, ResultatExerciceSuiteRecurrenteAffine } from "./typesSuiteRecurrenteAffine";
import { diagnostiquerPoserRecurrence, diagnostiquerRegimePermanent, diagnostiquerTermesSuccessifs } from "./verificationSuiteRecurrenteAffine";
import type { ReponseRegimePermanent } from "./verificationSuiteRecurrenteAffine";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

export const NIVEAU_AIDE_MAX_SUITE_RECURRENTE_AFFINE = 2;

function etatInitial(
  exercice: ExerciceSuiteRecurrenteAffine,
): Pick<EtatSessionSuiteRecurrenteAffine, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scorePoserRecurrencePartiel" | "scoreRegimePermanentPartiel"> {
  return {
    exerciceCourant: exercice,
    phase: phaseInitiale(),
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    scorePoserRecurrencePartiel: null,
    scoreRegimePermanentPartiel: null,
  };
}

export function demarrerSessionSuiteRecurrenteAffine(reglages: ReglagesSession5e, generateur: () => ExerciceSuiteRecurrenteAffine): EtatSessionSuiteRecurrenteAffine {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, derniereEtapeRevelee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionSuiteRecurrenteAffine): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

/** Plafond d'aide PAR PHASE (B.3, `promptcorrectionsround2.md`) — remplace l'usage nu de
 * `NIVEAU_AIDE_MAX_SUITE_RECURRENTE_AFFINE` (toujours 2). `texteAideNiveau2()`
 * (`ui5e/formatSuiteRecurrenteAffine.ts`) ne couvre que "poserRecurrence" et "regimePermanent",
 * retombant sur `return ""` pour "termesSuccessifs" (3e et dernier écran, TOUJOURS traversé —
 * séquence fixe) — sans ce garde, le bouton "Aide supplémentaire" restait cliquable/pénalisant
 * pour un niveau 2 systématiquement vide sur 100% des instances. */
export function niveauAideMaxSuiteRecurrenteAffine(phase: PhaseSuiteRecurrenteAffine): number {
  if (phase === "termesSuccessifs") return 1;
  return NIVEAU_AIDE_MAX_SUITE_RECURRENTE_AFFINE;
}

export function activerAideSuivante(etat: EtatSessionSuiteRecurrenteAffine): EtatSessionSuiteRecurrenteAffine {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= niveauAideMaxSuiteRecurrenteAffine(etat.phase)) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionSuiteRecurrenteAffine, resultat: ResultatExerciceSuiteRecurrenteAffine, revele: boolean): EtatSessionSuiteRecurrenteAffine {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true, derniereEtapeRevelee: revele };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()), derniereEtapeRevelee: revele };
}

export function soumettreReponsePoserRecurrence(etat: EtatSessionSuiteRecurrenteAffine, texte: string): EtatSessionSuiteRecurrenteAffine {
  if (etat.terminee || etat.phase !== "poserRecurrence") throw new Error("soumettreReponsePoserRecurrence : la session n'est pas à l'étape 'poserRecurrence'");

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, texte, {
    ...reglagesEtape(etat),
    verifier: (t) => diagnostiquerPoserRecurrence(t, etat.exerciceCourant) === "correct",
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const revele = etapeCourante.revelee;
  const score = Math.max(0, (etapeCourante.score as number) - etat.niveauAide * PENALITE_PAR_NIVEAU_AIDE);
  return { ...etat, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: "regimePermanent", scorePoserRecurrencePartiel: score, derniereEtapeRevelee: revele };
}

export function soumettreReponseRegimePermanent(etat: EtatSessionSuiteRecurrenteAffine, reponse: ReponseRegimePermanent): EtatSessionSuiteRecurrenteAffine {
  if (etat.terminee || etat.phase !== "regimePermanent") throw new Error("soumettreReponseRegimePermanent : la session n'est pas à l'étape 'regimePermanent'");

  const etapeCourante = soumettreEtapeTentatives<ReponseRegimePermanent>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => diagnostiquerRegimePermanent(r, etat.exerciceCourant) === "correct",
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const revele = etapeCourante.revelee;
  const score = Math.max(0, (etapeCourante.score as number) - etat.niveauAide * PENALITE_PAR_NIVEAU_AIDE);
  return { ...etat, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: "termesSuccessifs", scoreRegimePermanentPartiel: score, derniereEtapeRevelee: revele };
}

export function soumettreReponseTermesSuccessifs(etat: EtatSessionSuiteRecurrenteAffine, textes: string[]): EtatSessionSuiteRecurrenteAffine {
  if (etat.terminee || etat.phase !== "termesSuccessifs") throw new Error("soumettreReponseTermesSuccessifs : la session n'est pas à l'étape 'termesSuccessifs'");
  if (etat.scorePoserRecurrencePartiel === null || etat.scoreRegimePermanentPartiel === null) {
    throw new Error("soumettreReponseTermesSuccessifs : scores des écrans précédents manquants");
  }

  const etapeCourante = soumettreEtapeTentatives<string[]>(etat.etapeCourante, textes, {
    ...reglagesEtape(etat),
    verifier: (t) => diagnostiquerTermesSuccessifs(t, etat.exerciceCourant) === "correct",
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const revele = etapeCourante.revelee;
  const score = Math.max(0, (etapeCourante.score as number) - etat.niveauAide * PENALITE_PAR_NIVEAU_AIDE);
  const phaseSuivante = phaseApres("termesSuccessifs");
  if (phaseSuivante !== "termine") throw new Error("soumettreReponseTermesSuccessifs : séquence inattendue après 'termesSuccessifs'");

  return cloturerExerciceOuSuivant(
    etat,
    {
      exercice: etat.exerciceCourant,
      scorePoserRecurrence: etat.scorePoserRecurrencePartiel,
      scoreRegimePermanent: etat.scoreRegimePermanentPartiel,
      scoreTermesSuccessifs: score,
    },
    revele,
  );
}
