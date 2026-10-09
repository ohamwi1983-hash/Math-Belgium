import type { ExerciceSuiteArithmetique } from "../../core5e/suitesArithmetiques.types";
import type { PhaseSuiteArithmetique } from "../../moteur5e/typesSuiteArithmetique";
import { ordreComplet } from "../../moteur5e/typesSuiteArithmetique";
import type { AdaptateurFeuilleExercices, BlocCorrection, QuestionExercice, SectionExercice, ZoneReponse } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import {
  consigneGenerale,
  consignePhase,
  formatReponseAttenduePhaseLatex,
  formatTermesDonneesLatex,
  labelsCalculerTermesAlgebrique,
  texteAideNiveau2,
} from "../../ui5e/formatSuiteArithmetique";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceSuiteArithmetique } from "./index";
import type { FamilleSuiteArithmetiqueId } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceSuiteArithmetique>` pour 5gen14 (Suites
 * arithmétiques, formule générale et termes) — feuille d'évaluation. `ExerciceSuiteArithmetique` a
 * 5 familles STRUCTURELLEMENT DISJOINTES (`core5e/suitesArithmetiques.types.ts`), chacune avec sa
 * PROPRE séquence d'écrans (1 à 6 questions selon la famille/le combo/le sous-cas), déjà entièrement
 * décrite par `moteur5e/typesSuiteArithmetique.ts::ordreComplet` — jamais réimplémentée ici : on
 * itère directement sur `ordreComplet(exercice)` pour produire UNE question par écran réellement
 * traversé côté interactif, dans le même ordre. Toutes les consignes/le bloc de données/les réponses
 * attendues sont lues via `ui5e/formatSuiteArithmetique.ts` (`consignePhase`/`formatTermesDonneesLatex`/
 * `formatReponseAttenduePhaseLatex`), déjà utilisé par les écrans React (`EtapeChampSimpleSuiteArithmetique`,
 * `EtapeTermesMultiples`, `EtapeCoherenceJugement`, `EtapePoserEquation`) — jamais un texte/calcul
 * redérivé indépendamment ici, seule source de vérité pour la correction.
 *
 * Le nombre de questions par instance varie de 1 (famille "coherence", données incohérentes — la
 * séquence s'arrête à l'écran de jugement) à 6 (famille "principal"/"coherence" cohérente, combo à 2
 * écrans "trouver" + 4 écrans de la queue commune) : jamais `regroupable` (ni consigne générique
 * fixe indépendante de l'instance — `consigneGenerale`/`consignePhase` dépendent de la famille/du
 * combo/du sous-cas — ni un nombre de questions constant).
 */

function tailleReponsePourPhase(exercice: ExerciceSuiteArithmetique, phase: PhaseSuiteArithmetique): ZoneReponse {
  if (phase === "termesProches") return { type: "lignes", nombre: 4 };
  if (phase === "calculerTermesAlgebrique") return { type: "lignes", nombre: Math.max(labelsCalculerTermesAlgebrique(exercice).length, 1) };
  if (phase === "coherenceJugement") return { type: "lignes", nombre: 3 };
  if (phase === "poserEquationAlgebrique" || phase === "poserEquationRangN") return { type: "lignes", nombre: 2 };
  return { type: "lignes", nombre: 2 };
}

function construireQuestionPourPhase(exercice: ExerciceSuiteArithmetique, phase: PhaseSuiteArithmetique): QuestionExercice {
  return {
    consigne: [texte(consignePhase(exercice, phase))],
    reponse: tailleReponsePourPhase(exercice, phase),
  };
}

function construireEnonceSuiteArithmetique(exercice: ExerciceSuiteArithmetique): SectionExercice {
  const donnees = formatTermesDonneesLatex(exercice).join(" \\quad ");
  return {
    enteteFragments: [texte(`${consigneGenerale(exercice)} `), latex(donnees)],
    questions: ordreComplet(exercice).map((phase) => construireQuestionPourPhase(exercice, phase)),
  };
}

/** Correction de l'écran "coherenceJugement" (famille "coherence" uniquement, garanti par
 * `ordreComplet`) — verdict + justification numérique, même calcul que l'aide niveau 2 de l'écran
 * interactif (`texteAideNiveau2`, seule phase à en exposer une réelle) : jamais recalculé
 * indépendamment ici. */
function construireCorrectionCoherenceJugement(exercice: ExerciceSuiteArithmetique): BlocCorrection {
  if (exercice.famille !== "coherence") throw new Error("construireCorrectionCoherenceJugement : famille hors 'coherence'");
  return {
    type: "paragraphe",
    fragments: [texte(exercice.coherent ? "Cohérentes — " : "Incohérentes — "), latex(texteAideNiveau2(exercice, "coherenceJugement"))],
  };
}

function construireCorrectionPourPhase(exercice: ExerciceSuiteArithmetique, phase: PhaseSuiteArithmetique): BlocCorrection {
  if (phase === "coherenceJugement") return construireCorrectionCoherenceJugement(exercice);
  return { type: "paragraphe", fragments: [latex(formatReponseAttenduePhaseLatex(exercice, phase).join(" \\quad "))] };
}

function construireCorrectionSuiteArithmetique(exercice: ExerciceSuiteArithmetique): BlocCorrection[] {
  return ordreComplet(exercice).map((phase) => construireCorrectionPourPhase(exercice, phase));
}

export const adaptateurEvaluationSuitesArithmetiques: AdaptateurFeuilleExercices<ExerciceSuiteArithmetique> = {
  titreDocument: "Suites arithmétiques, formule générale et termes — Évaluation",
  nomFichierBase: "suites-arithmetiques",
  genererInstance: genererExerciceSuiteArithmetique,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id as FamilleSuiteArithmetiqueId),
  construireEnonce: construireEnonceSuiteArithmetique,
  construireCorrection: construireCorrectionSuiteArithmetique,
};
