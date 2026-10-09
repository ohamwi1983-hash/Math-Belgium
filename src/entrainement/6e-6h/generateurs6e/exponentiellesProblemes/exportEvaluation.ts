import type { ExerciceExponentiellesProblemes } from "../../core6e/exponentiellesProblemes.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { blocDonnees, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex, LIBELLE_PHASE, PHASES_PAR_FAMILLE } from "../../ui6e/formatExponentiellesProblemes";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceExponentiellesProblemes } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceExponentiellesProblemes>` pour `6gen12`
 * (Exponentielles : problèmes contextualisés) — feuille d'évaluation.
 *
 * 7 familles, chacune 2 à 4 écrans guidés côté interactif (`PHASES_PAR_FAMILLE`) — condensés ici en
 * autant de questions écrites (une question par écran réellement traversé par la famille tirée).
 * Le corrigé de chaque question lit la réponse déjà établie via `formatReponseAttenduePhaseLatex` —
 * la MÊME fonction qui alimente déjà `ResultatPanelExponentiellesProblemes.tsx` (rendue là-bas via
 * `<Katex>` pour chaque fragment, y compris les réponses textuelles comme "Atteignable"/"Non
 * atteignable" de la famille G — même traitement repris ici), jamais recalculée indépendamment.
 */

function construireEnonceExponentiellesProblemes(exercice: ExerciceExponentiellesProblemes): SectionExercice {
  const phases = PHASES_PAR_FAMILLE[exercice.famille];
  const donnees = blocDonnees(exercice);
  return {
    enteteFragments: [texte(consigneGenerale(exercice)), ...(donnees.length > 0 ? [latex(donnees.join(",\\quad "))] : [])],
    questions: phases.map((phase) => ({
      consigne: [texte(`${LIBELLE_PHASE[phase]} — `), texte(consigneEcran(exercice, phase))],
      reponse: { type: "lignes" as const, nombre: 3 },
    })),
  };
}

function construireCorrectionExponentiellesProblemes(exercice: ExerciceExponentiellesProblemes): BlocCorrection[] {
  const phases = PHASES_PAR_FAMILLE[exercice.famille];
  return phases.map((phase) => ({
    type: "paragraphe",
    fragments: [texte(`${LIBELLE_PHASE[phase]} : `), latex(formatReponseAttenduePhaseLatex(exercice, phase).join(",\\quad "))],
  }));
}

export const adaptateurEvaluationExponentiellesProblemes: AdaptateurFeuilleExercices<ExerciceExponentiellesProblemes> = {
  titreDocument: "Exponentielles : problèmes contextualisés — Évaluation",
  nomFichierBase: "exponentielles-problemes",
  genererInstance: genererExerciceExponentiellesProblemes,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0]),
  construireEnonce: construireEnonceExponentiellesProblemes,
  construireCorrection: construireCorrectionExponentiellesProblemes,
};
