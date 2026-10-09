import type { ExerciceSuiteGeometrique } from "../../core5e/suitesGeometriques.types";
import type { PhaseSuiteGeometrique } from "../../moteur5e/typesSuiteGeometrique";
import { ordreComplet } from "../../moteur5e/typesSuiteGeometrique";
import type { AdaptateurFeuilleExercices, BlocCorrection, QuestionExercice, SectionExercice, ZoneReponse } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { consigneGenerale, consignePhase, formatTermesDonneesLatex, formatTermesReponseAttendueSuiteGeometrique, labelsCalculerTermesAlgebrique } from "../../ui5e/formatSuiteGeometrique";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceSuiteGeometrique } from "./index";
import type { FamilleSuiteGeometriqueId } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceSuiteGeometrique>` pour 5gen15 (Suites
 * géométriques, formule générale et termes) — feuille d'évaluation, MIROIR DIRECT de
 * `generateurs5e/suitesArithmetiques/exportEvaluation.ts` (5gen14) : `ExerciceSuiteGeometrique` a 4
 * familles structurellement disjointes (`core5e/suitesGeometriques.types.ts`), chacune avec sa
 * PROPRE séquence d'écrans, déjà entièrement décrite par `moteur5e/typesSuiteGeometrique.ts::ordreComplet`
 * — jamais réimplémentée ici : on itère directement sur `ordreComplet(exercice)` pour produire UNE
 * question par écran réellement traversé côté interactif, dans le même ordre (y compris la
 * duplication B1/B2 de la famille "principal" quand `statutQ==="double"`, chaque duplication
 * matérialisant une "suite" distincte — voir la doc de tête de `typesSuiteGeometrique.ts`). Toutes
 * les consignes/le bloc de données/les réponses attendues sont lues via `ui5e/formatSuiteGeometrique.ts`
 * (`consignePhase`/`formatTermesDonneesLatex`/`formatTermesReponseAttendueSuiteGeometrique`), déjà
 * utilisé par les écrans React (`EtapeChampSimpleSuiteGeometrique`, `EtapeTermesMultiplesSuiteGeometrique`,
 * `EtapeTrouverQ`, `EtapeSommeInfinie`, `EtapePoserEquationGeometrique`) — jamais un texte/calcul
 * redérivé indépendamment ici, seule source de vérité pour la correction.
 *
 * Le nombre de questions par instance varie de 2 (famille "algebriqueRangN" : `ORDRE_RANG_N`, 2
 * écrans) à 13 (famille "principal", combo "up_um" avec `statutQ==="double"` : écran "trouverQ" +
 * 6 écrans × 2 branches) : jamais `regroupable` (ni consigne générique fixe indépendante de
 * l'instance — `consigneGenerale`/`consignePhase` dépendent de la famille/du combo/du sous-cas —
 * ni un nombre de questions constant).
 */

function tailleReponsePourPhase(exercice: ExerciceSuiteGeometrique, phase: PhaseSuiteGeometrique): ZoneReponse {
  if (phase === "termesProches" || phase === "termesProchesB1" || phase === "termesProchesB2") return { type: "lignes", nombre: 4 };
  if (phase === "calculerTermesAlgebrique") return { type: "lignes", nombre: Math.max(labelsCalculerTermesAlgebrique(exercice).length, 1) };
  if (phase === "trouverQ") return { type: "lignes", nombre: exercice.famille === "principal" ? Math.max(exercice.branches.length, 1) : 1 };
  return { type: "lignes", nombre: 2 };
}

function construireQuestionPourPhase(exercice: ExerciceSuiteGeometrique, phase: PhaseSuiteGeometrique): QuestionExercice {
  return {
    consigne: [texte(consignePhase(exercice, phase))],
    reponse: tailleReponsePourPhase(exercice, phase),
  };
}

function construireEnonceSuiteGeometrique(exercice: ExerciceSuiteGeometrique): SectionExercice {
  const donnees = formatTermesDonneesLatex(exercice).join(" \\quad ");
  return {
    enteteFragments: [texte(`${consigneGenerale(exercice)} `), latex(donnees)],
    questions: ordreComplet(exercice).map((phase) => construireQuestionPourPhase(exercice, phase)),
  };
}

function construireCorrectionPourPhase(exercice: ExerciceSuiteGeometrique, phase: PhaseSuiteGeometrique): BlocCorrection {
  return { type: "paragraphe", fragments: [latex(formatTermesReponseAttendueSuiteGeometrique(exercice, phase).join(" \\quad "))] };
}

function construireCorrectionSuiteGeometrique(exercice: ExerciceSuiteGeometrique): BlocCorrection[] {
  return ordreComplet(exercice).map((phase) => construireCorrectionPourPhase(exercice, phase));
}

export const adaptateurEvaluationSuitesGeometriques: AdaptateurFeuilleExercices<ExerciceSuiteGeometrique> = {
  titreDocument: "Suites géométriques, formule générale et termes — Évaluation",
  nomFichierBase: "suites-geometriques",
  genererInstance: genererExerciceSuiteGeometrique,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id as FamilleSuiteGeometriqueId),
  construireEnonce: construireEnonceSuiteGeometrique,
  construireCorrection: construireCorrectionSuiteGeometrique,
};
