import type { ExerciceEchellesLogarithmiques } from "../../core6e/echellesLogarithmiques.types";
import { typeQuestion } from "../../core6e/echellesLogarithmiques.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { PHASES_ECHELLES } from "../../moteur6e/typesEchellesLogarithmiques";
import type { PhaseEchelles } from "../../moteur6e/typesEchellesLogarithmiques";
import { fiche, formatReponseAttenduePhaseLatex } from "../../ui6e/formatEchellesLogarithmiques";
import { profilEchellesLogarithmiques } from "./profilEvaluation";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEchellesLogarithmiques } from "./index";
import type { IdVarianteEchelles } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceEchellesLogarithmiques>` de `6gen90`
 * « Échelles logarithmiques : rapports et sommes » — méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - `construireEnonce` : une question par écran (étapes a, b, c), titres « Étape n — … » du corrigé.
 * - `enoncePapier` : la situation (avec la formule de l'échelle) et la SEULE vraie question du
 *   problème (celle de l'écran « réponse », précision comprise) ; la traduction et le calcul
 *   intermédiaire sont des étapes de guidage, elles passent au corrigé.
 * - Corrigé : par étape, Méthode (aide de l'écran), Calcul, Piège ciblé, Conclusion (réponse de
 *   l'écran, `formatReponseAttenduePhaseLatex`).
 * - Version aménagée : même énoncé (le pipeline ne change que la mise en page).
 */

const LETTRES: Record<PhaseEchelles, string> = { traduire: "a", calcul: "b", reponse: "c" };

const t = (v: string): FragmentConsigne => texte(v);
const f = (v: string): FragmentConsigne => latex(v);

function reponse(e: ExerciceEchellesLogarithmiques, phase: PhaseEchelles): FragmentConsigne[] {
  return formatReponseAttenduePhaseLatex(e, phase).map(f);
}

function construireEnonce(e: ExerciceEchellesLogarithmiques): SectionExercice {
  const fi = fiche(e);
  return {
    enteteFragments: fi.consigneGenerale,
    questions: PHASES_ECHELLES.map((phase) => ({ consigne: fi.consignes[phase] })),
  };
}

function construireCorrection(e: ExerciceEchellesLogarithmiques): BlocCorrection[] {
  return PHASES_ECHELLES.map((phase) => ({ type: "paragraphe", fragments: [t(`${LETTRES[phase]}) `), ...reponse(e, phase)] }));
}

function enoncePapier(e: ExerciceEchellesLogarithmiques): EnoncePapier {
  const fi = fiche(e);
  return {
    section: {
      enteteFragments: [...fi.consigneGenerale, t(" Justifie ta réponse par un calcul.")],
      questions: [{ consigne: fi.questionPapier }],
    },
    etapesParQuestion: [["a", "b", "c"]],
    reponseBreve: reponse(e, "reponse"),
  };
}

function methode(e: ExerciceEchellesLogarithmiques, phase: PhaseEchelles): FragmentConsigne[] {
  const aide = fiche(e).aides[phase][0];
  return aide.latex ? [t(`${aide.texte} `), f(aide.latex)] : [t(aide.texte)];
}

function correctionDetaillee(e: ExerciceEchellesLogarithmiques): EtapeCorrection[] {
  const fi = fiche(e);
  return PHASES_ECHELLES.flatMap((phase) => {
    const sousQuestion = LETTRES[phase];
    return [
      { label: "Méthode", sousQuestion, fragments: methode(e, phase) },
      { label: "Calcul", sousQuestion, fragments: [f(fi.calculs[phase])] },
      { label: "Piège", sousQuestion, fragments: [t(fi.pieges[phase])] },
      { label: "Conclusion", sousQuestion, fragments: reponse(e, phase) },
    ];
  });
}

function difficulte(e: ExerciceEchellesLogarithmiques): 1 | 2 | 3 {
  if (typeQuestion(e.variante) === "combien" || e.variante === "seisme-magnitude" || e.variante === "etoiles-magnitude") return 3;
  return 2;
}

function reponseBreve(e: ExerciceEchellesLogarithmiques): FragmentConsigne[] {
  return reponse(e, "reponse");
}

const POIDS: Record<PhaseEchelles, number> = { traduire: 1, calcul: 1.5, reponse: 1.5 };

function bareme(e: ExerciceEchellesLogarithmiques): BaremeExercice {
  const fi = fiche(e);
  const erreurs = PHASES_ECHELLES.map((phase) => ({ description: [t(fi.pieges[phase])], cout: phase === "traduire" ? "−1,5" : "−1" }));
  erreurs.push({ description: [t("Réponse sans la précision demandée, ou sans unité quand il y en a une")], cout: "−0,5" });
  return {
    reponseFinale: reponse(e, "reponse"),
    criteres: PHASES_ECHELLES.map((phase) => ({
      sousQuestion: LETTRES[phase],
      critere: phase === "traduire" ? [t("Relation correcte entre l'écart sur l'échelle et le rapport : "), ...reponse(e, phase)] : reponse(e, phase),
      points: POIDS[phase],
    })),
    erreursFrequentes: erreurs,
    reponsesAcceptees: [
      [t(e.regime === "exacte" ? "Valeur exacte (puissance de 10 ou décimal)" : "Valeur exacte (avec log ou une puissance de 10) ou arrondie à la précision demandée ; un écart dû à un arrondi intermédiaire au centième est toléré")],
    ],
  };
}

export const adaptateurEvaluationEchellesLogarithmiques: AdaptateurFeuilleExercices<ExerciceEchellesLogarithmiques> = {
  titreDocument: "Échelles logarithmiques : rapports et sommes — Évaluation",
  nomFichierBase: "echelles-logarithmiques",
  genererInstance: genererExerciceEchellesLogarithmiques,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteEchelles),
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 8,
  profilInstance: profilEchellesLogarithmiques,
};
