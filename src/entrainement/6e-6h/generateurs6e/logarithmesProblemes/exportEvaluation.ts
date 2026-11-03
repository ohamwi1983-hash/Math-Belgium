import type { ExerciceLogarithmesProblemes } from "../../core6e/logarithmesProblemes.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { aideNiveau2, blocDonnees, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex, LIBELLE_PHASE, phasesPourExercice } from "../../ui6e/formatLogarithmesProblemes";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLogarithmesProblemes } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceLogarithmesProblemes>` pour `6gen22`
 * (Logarithmes : problèmes) — feuille d'évaluation.
 *
 * 5 familles (A, B, C, E, F), chacune 3 à 4 écrans guidés côté interactif — condensés ici en autant de
 * questions écrites (une question par écran RÉELLEMENT traversé par l'instance tirée, voir
 * `phasesPourExercice` : nombre d'écrans fixe par famille SAUF la famille E, variable PAR INSTANCE
 * selon `deduireAB`, jamais une simple table par famille comme `PHASES_PAR_FAMILLE` de 6gen12).
 * Le corrigé de chaque question lit la réponse déjà établie via `formatReponseAttenduePhaseLatex` —
 * la MÊME fonction qui alimente déjà `ResultatPanelLogarithmesProblemes.tsx`, jamais recalculée
 * indépendamment.
 *
 * Catalogue branché : `CATALOGUE_VARIANTES`/`construireAvecVarianteId` (axe FIN — 16
 * familles/sous-types/contextes, D et G retirés), pas `CATALOGUE_FAMILLES`/`construireAvecFamilleId` (axe
 * grossier, 7 familles équiprobables, jamais utilisé pour un contrôle dev/prof) : c'est l'axe
 * effectivement branché sur le sélecteur dev de `App6gen22.tsx` (`SelecteurVarianteDev
 * options={CATALOGUE_VARIANTES}`), donc celui qu'un professeur reconnaît et attend ici.
 */

function construireEnonceLogarithmesProblemes(exercice: ExerciceLogarithmesProblemes): SectionExercice {
  const phases = phasesPourExercice(exercice);
  const donnees = blocDonnees(exercice);
  return {
    enteteFragments: [...consigneGenerale(exercice), ...(donnees.length > 0 ? [latex(donnees.join(",\\quad "))] : [])],
    questions: phases.map((phase) => ({
      consigne: [texte(`${LIBELLE_PHASE[phase]} — `), ...consigneEcran(exercice, phase)],
      reponse: { type: "lignes" as const, nombre: 3 },
    })),
  };
}

/** Corrigé avec démarche : pour chaque étape, l'équation posée ou substituée (celle de l'aide de
 * niveau 2, quand elle en a une), puis le résultat. */
function construireCorrectionLogarithmesProblemes(exercice: ExerciceLogarithmesProblemes): BlocCorrection[] {
  const phases = phasesPourExercice(exercice);
  return phases.flatMap((phase): BlocCorrection[] => {
    const demarche = aideNiveau2(exercice, phase);
    const blocs: BlocCorrection[] = [];
    if (demarche.latex !== null) blocs.push({ type: "paragraphe", fragments: [texte(`${LIBELLE_PHASE[phase]} — démarche : `), latex(demarche.latex)] });
    blocs.push({ type: "paragraphe", fragments: [texte(`${LIBELLE_PHASE[phase]} — résultat : `), latex(formatReponseAttenduePhaseLatex(exercice, phase).join(",\\quad "))] });
    return blocs;
  });
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
