import type { ExerciceSuiteClassique, ScenarioSuiteClassique } from "../../core5e/suitesClassiques.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, QuestionExercice, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { PhaseSuiteClassique } from "../../moteur5e/typesSuiteClassique";
import { ordreComplet } from "../../moteur5e/typesSuiteClassique";
import {
  consigneGenerale,
  consignePhase,
  formatTermesDonneesLatex,
  formatTermesReponseAttendueLatex,
  formatTermesSuitesFinalesLatex,
  texteReponseAttendueQCM,
} from "../../ui5e/formatSuiteClassique";
import { CATALOGUE_SCENARIOS, construireAvecScenarioId, genererExerciceSuiteClassique } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceSuiteClassique>` pour 5gen17 (Problèmes classiques
 * sur les suites) — feuille d'évaluation. 7 scénarios STRUCTURELLEMENT DISJOINTS, chacun une
 * INSTANCE FIXE (aucun paramètre aléatoire, voir `generateurs5e/suitesClassiques/index.ts`) traversant
 * TOUJOURS sa séquence complète de 3 à 5 écrans (`moteur5e/typesSuiteClassique.ts::ORDRE_PHASES`) —
 * la version papier mirror donc FIDÈLEMENT chaque écran réel par UNE question a)/b)/c)/…, jamais une
 * condensation en une seule question comme gen5/gen1 (dont les écrans guidés d'UN seul résultat final
 * s'y prêtaient, ce qui n'est pas le cas ici : chaque écran de 5gen17 est une sous-question distincte
 * du problème, avec sa propre valeur numérique à trouver).
 *
 * Tout le texte (consigne générale, consigne par écran, "données" affichées en box, réponse
 * attendue) est repris TEL QUEL de `ui5e/formatSuiteClassique.ts` — déjà la source de vérité unique
 * utilisée par les 4 composants d'écran interactifs (`components5e/Etape*Classique.tsx`), jamais
 * retraduit ici. Les 6 écrans QCM (`ID_CORRECT_QCM`) sont posés en QUESTION OUVERTE sur papier (pas
 * de boutons à cliquer) — leur `consignePhase` est déjà rédigée comme une question ouverte côté
 * écran (ex. "Quel système d'équations traduit cette situation ?"), le corrigé reprenant alors le
 * libellé de la bonne option (`texteReponseAttendueQCM`, déjà le même texte que le bouton affiché à
 * l'écran). L'écran bespoke "suitesFinalesCombinees" (2 groupes de 3 valeurs, seul scénario
 * "suitesCombinees") est traité séparément via `formatTermesSuitesFinalesLatex`.
 *
 * La "box données" (`formatTermesDonneesLatex`) n'est répétée dans une question qu'aux 2 endroits où
 * elle CHANGE réellement en cours de scénario (comme à l'écran) : "carresEmboites" bascule de la
 * partie a (u1=1/4, q=1/4) à la partie b (côté=4, q=1/2) à l'écran "airesB", et "trianglesZigzag"
 * bascule vers un rappel court à l'écran "airesZigzagAC" — sinon la donnée initiale (posée une seule
 * fois en tête d'exercice) suffit, aucun des 5 autres scénarios ne la faisant varier d'un écran à
 * l'autre.
 *
 * `regroupable` jamais activé : 3 à 5 questions par instance selon le scénario (jamais 1 seule).
 */

const NOMBRE_LIGNES_PAR_PHASE: Record<PhaseSuiteClassique, number> = {
  u64: 3,
  sommeTotaleEchiquier: 3,
  poidsComparaison: 3,
  poserSysteme: 2,
  resoudreSysteme: 4,
  suiteFinalePapyrus: 4,
  poserEquationCombinees: 2,
  resoudreRCombinees: 3,
  suitesFinalesCombinees: 4,
  distance11: 2,
  sommeTotale11: 2,
  troisMethodes: 4,
  dixTermes: 3,
  formuleRecurrence: 2,
  calculV5: 2,
  resoudrePhi: 3,
  proprieteInverse: 2,
  hauteursZigzag: 3,
  airesZigzag: 3,
  longueurZigzag: 2,
  airesZigzagAC: 3,
  sommePartielleA: 2,
  limitePuissanceA: 2,
  sommeInfinieA: 2,
  airesB: 3,
  sommeInfinieB: 2,
};

function construireQuestionPhase(exercice: ExerciceSuiteClassique, phase: PhaseSuiteClassique, phasePrecedente: PhaseSuiteClassique | null): QuestionExercice {
  const donneesActuelles = formatTermesDonneesLatex(exercice, phase);
  const donneesChangent = phasePrecedente !== null && JSON.stringify(donneesActuelles) !== JSON.stringify(formatTermesDonneesLatex(exercice, phasePrecedente));

  const consigne = donneesChangent ? [latex(donneesActuelles.join(" \\quad ")), texte(" " + consignePhase(exercice, phase))] : [texte(consignePhase(exercice, phase))];

  return { consigne, reponse: { type: "lignes", nombre: NOMBRE_LIGNES_PAR_PHASE[phase] } };
}

function construireEnonceSuiteClassique(exercice: ExerciceSuiteClassique): SectionExercice {
  const phases = ordreComplet(exercice);
  const donneesInitiales = formatTermesDonneesLatex(exercice, phases[0]);
  return {
    enteteFragments: [texte(consigneGenerale(exercice) + " "), latex(donneesInitiales.join(" \\quad "))],
    questions: phases.map((phase, i) => construireQuestionPhase(exercice, phase, i === 0 ? null : phases[i - 1])),
  };
}

function construireCorrectionPhase(exercice: ExerciceSuiteClassique, phase: PhaseSuiteClassique): BlocCorrection {
  if (phase === "suitesFinalesCombinees" && exercice.scenario === "suitesCombinees") {
    const { arithmetique, geometrique } = formatTermesSuitesFinalesLatex(exercice);
    return { type: "paragraphe", fragments: [latex(arithmetique.join(" \\quad ")), texte(" — "), latex(geometrique.join(" \\quad "))] };
  }
  const qcm = texteReponseAttendueQCM(exercice, phase);
  if (qcm !== null) return { type: "paragraphe", fragments: [latex(qcm)] };

  const termes = formatTermesReponseAttendueLatex(exercice, phase) ?? [];
  return { type: "paragraphe", fragments: [latex(termes.join(" \\quad "))] };
}

function construireCorrectionSuiteClassique(exercice: ExerciceSuiteClassique): BlocCorrection[] {
  return ordreComplet(exercice).map((phase) => construireCorrectionPhase(exercice, phase));
}

export const adaptateurEvaluationSuitesClassiques: AdaptateurFeuilleExercices<ExerciceSuiteClassique> = {
  titreDocument: "Problèmes classiques sur les suites — Évaluation",
  nomFichierBase: "suites-classiques",
  genererInstance: genererExerciceSuiteClassique,
  catalogueVariantes: CATALOGUE_SCENARIOS,
  genererInstanceAvecVariante: (id) => construireAvecScenarioId(id as ScenarioSuiteClassique),
  construireEnonce: construireEnonceSuiteClassique,
  construireCorrection: construireCorrectionSuiteClassique,
};
