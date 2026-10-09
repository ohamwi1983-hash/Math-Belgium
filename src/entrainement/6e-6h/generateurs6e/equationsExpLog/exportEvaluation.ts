import type { ExerciceEquationsExpLog, FamilleEquationsExpLog } from "../../core6e/equationsExpLog.types";
import type { PhaseEquationsExpLog } from "../../moteur6e/typesEquationsExpLog";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import { latex, texte } from "../../../export/fragmentsDocx";
import { CONSIGNE_GENERALE, LIBELLE_PHASE, PHASES_PAR_FAMILLE, blocDonnees, consigneEcran, formatReponseAttenduePhaseLatex } from "../../ui6e/formatEquationsExpLog";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceEquationsExpLog } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceEquationsExpLog>` pour `6gen14` (Résoudre une
 * équation exponentielle ou logarithmique) — feuille d'évaluation, voir
 * `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence.
 *
 * 7 familles STRUCTURELLEMENT DISJOINTES à 2 ou 3 écrans chacune (`PHASES_PAR_FAMILLE`,
 * `ui6e/formatEquationsExpLog.ts`) — plutôt que dupliquer un dispatch par famille comme
 * `equationsCyclometriques/exportEvaluation.ts`, cet adaptateur reste GÉNÉRIQUE sur `famille` en
 * réutilisant DIRECTEMENT les fonctions déjà écrites côté écran pour piloter l'interactif :
 * `consigneEcran` (consigne de chaque écran), `blocDonnees` (l'équation de tête) et surtout
 * `formatReponseAttenduePhaseLatex`, qui est la même fonction que consulte déjà
 * `ResultatPanelEquationsExpLog.tsx` pour afficher la réponse correcte du récapitulatif — jamais
 * recalculée indépendamment ici. Une question écrite PAR ÉCRAN traversé, dans le même ordre que
 * l'interactif (`PHASES_PAR_FAMILLE`) — jamais un question unique par instance, donc `regroupable`
 * reste absent (aucune famille n'a un seul écran).
 */

const TAILLE_REPONSE: Record<PhaseEquationsExpLog, number> = {
  aEcran1: 2,
  aEcran2: 2,
  bEcran1: 2,
  bEcran2: 3,
  cEcran1: 2,
  cEcran2: 3,
  cEcran3: 3,
  dEcran1: 2,
  dEcran2: 2,
  eEcran1: 2,
  eEcran2: 2,
  eEcran3: 3,
  fEcran1: 2,
  fEcran2: 2,
  fEcran3: 3,
  gEcran1: 2,
  gEcran2: 2,
};

function construireEnonceEquationsExpLog(exercice: ExerciceEquationsExpLog): SectionExercice {
  const phases = PHASES_PAR_FAMILLE[exercice.famille];
  return {
    enteteFragments: [texte(`${CONSIGNE_GENERALE} `), latex(blocDonnees(exercice)[0])],
    questions: phases.map((phase) => ({
      consigne: [texte(consigneEcran(exercice, phase))],
      reponse: { type: "lignes", nombre: TAILLE_REPONSE[phase] },
    })),
  };
}

const LETTRES = "abcdefghijklmnopqrstuvwxyz";

function construireCorrectionEquationsExpLog(exercice: ExerciceEquationsExpLog): BlocCorrection[] {
  const phases = PHASES_PAR_FAMILLE[exercice.famille];
  return phases.map((phase, i) => {
    const reponseFragments = formatReponseAttenduePhaseLatex(exercice, phase).flatMap((frag, j) => (j === 0 ? [latex(frag)] : [texte(" ; "), latex(frag)]));
    const fragments: FragmentConsigne[] = [texte(`${LETTRES[i]}) ${LIBELLE_PHASE[phase]} : `), ...reponseFragments];
    return { type: "paragraphe", fragments };
  });
}

export const adaptateurEvaluationEquationsExpLog: AdaptateurFeuilleExercices<ExerciceEquationsExpLog> = {
  titreDocument: "Résoudre une équation exponentielle ou logarithmique — Évaluation",
  nomFichierBase: "equations-exp-log",
  genererInstance: genererExerciceEquationsExpLog,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id as FamilleEquationsExpLog),
  construireEnonce: construireEnonceEquationsExpLog,
  construireCorrection: construireCorrectionEquationsExpLog,
};
