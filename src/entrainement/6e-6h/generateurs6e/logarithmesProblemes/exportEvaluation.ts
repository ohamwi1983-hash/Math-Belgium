import type { ExerciceLogarithmesProblemes } from "../../core6e/logarithmesProblemes.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { blocDonnees, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex, LIBELLE_PHASE, phasesPourExercice } from "../../ui6e/formatLogarithmesProblemes";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLogarithmesProblemes } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceLogarithmesProblemes>` pour `6gen22`
 * (Logarithmes : problèmes) — feuille d'évaluation.
 *
 * 7 familles (A à G), chacune 2 à 4 écrans guidés côté interactif — condensés ici en autant de
 * questions écrites (une question par écran RÉELLEMENT traversé par l'instance tirée, voir
 * `phasesPourExercice` : nombre d'écrans fixe par famille SAUF la famille E, variable PAR INSTANCE
 * selon `deduireAB`, jamais une simple table par famille comme `PHASES_PAR_FAMILLE` de 6gen12).
 * Le corrigé de chaque question lit la réponse déjà établie via `formatReponseAttenduePhaseLatex` —
 * la MÊME fonction qui alimente déjà `ResultatPanelLogarithmesProblemes.tsx`, jamais recalculée
 * indépendamment.
 *
 * Catalogue branché : `CATALOGUE_VARIANTES`/`construireAvecVarianteId` (axe FIN — 16
 * familles/sous-types/contextes), pas `CATALOGUE_FAMILLES`/`construireAvecFamilleId` (axe
 * grossier, 7 familles équiprobables, jamais utilisé pour un contrôle dev/prof) : c'est l'axe
 * effectivement branché sur le sélecteur dev de `App6gen22.tsx` (`SelecteurVarianteDev
 * options={CATALOGUE_VARIANTES}`), donc celui qu'un professeur reconnaît et attend ici.
 */

function construireEnonceLogarithmesProblemes(exercice: ExerciceLogarithmesProblemes): SectionExercice {
  const phases = phasesPourExercice(exercice);
  const donnees = blocDonnees(exercice);
  return {
    enteteFragments: [texte(consigneGenerale(exercice)), ...(donnees.length > 0 ? [latex(donnees.join(",\\quad "))] : [])],
    questions: phases.map((phase) => ({
      consigne: [texte(`${LIBELLE_PHASE[phase]} — `), texte(consigneEcran(exercice, phase))],
      reponse: { type: "lignes" as const, nombre: 3 },
    })),
  };
}

function construireCorrectionLogarithmesProblemes(exercice: ExerciceLogarithmesProblemes): BlocCorrection[] {
  const phases = phasesPourExercice(exercice);
  return phases.map((phase) => ({
    type: "paragraphe",
    fragments: [texte(`${LIBELLE_PHASE[phase]} : `), latex(formatReponseAttenduePhaseLatex(exercice, phase).join(",\\quad "))],
  }));
}

export const adaptateurEvaluationLogarithmesProblemes: AdaptateurFeuilleExercices<ExerciceLogarithmesProblemes> = {
  titreDocument: "Logarithmes : problèmes — Évaluation",
  nomFichierBase: "logarithmes-problemes",
  genererInstance: genererExerciceLogarithmesProblemes,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  construireEnonce: construireEnonceLogarithmesProblemes,
  construireCorrection: construireCorrectionLogarithmesProblemes,
};
