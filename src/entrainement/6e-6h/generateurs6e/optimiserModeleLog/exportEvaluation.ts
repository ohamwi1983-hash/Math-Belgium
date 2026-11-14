import type { ExerciceOptimiserLog } from "../../core6e/optimiserModeleLog.types";
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
import { PHASES_OPTIMISER_LOG } from "../../moteur6e/typesOptimiserModeleLog";
import type { PhaseOptimiserLog } from "../../moteur6e/typesOptimiserModeleLog";
import { fiche, formatReponseAttenduePhaseLatex } from "../../ui6e/formatOptimiserModeleLog";
import { figureOptimiserLogSvg } from "../../ui6e/figureOptimiserModeleLog";
import { VARIANTES_CALCULATRICE_OPTIMISER_LOG, profilOptimiserLog } from "./profilEvaluation";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceOptimiserLog } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceOptimiserLog>` de `6gen91` « Optimiser un modèle
 * logarithmique » — méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - `construireEnonce` : une question par écran (étapes a à e), titres « Étape n — … » du corrigé.
 * - `enoncePapier` : la situation et son modèle, puis les DEUX vraies questions du problème :
 *   a) le domaine dans le contexte (étape a), b) l'optimum, sa justification et sa valeur en
 *   contexte (étapes b à e : dérivée, zéro, signe, valeur — le guidage passe au corrigé). Pas de
 *   figure dans l'énoncé (elle donnerait la nature et la position approchée de l'optimum).
 * - Corrigé : par étape, Méthode (aide de l'écran), Calcul, Piège ciblé, Conclusion (réponse de
 *   l'écran) ; la courbe avec l'optimum en `figureHtml` sous l'étape e.
 * - Version aménagée : même énoncé (le pipeline ne change que la mise en page).
 */

const LETTRES: Record<PhaseOptimiserLog, string> = { domaine: "a", derivee: "b", zero: "c", nature: "d", valeur: "e" };

const t = (v: string): FragmentConsigne => texte(v);
const f = (v: string): FragmentConsigne => latex(v);

function reponse(e: ExerciceOptimiserLog, phase: PhaseOptimiserLog): FragmentConsigne[] {
  return formatReponseAttenduePhaseLatex(e, phase).flatMap((x, i) => (i === 0 ? [f(x)] : [t(" ; "), f(x)]));
}

function construireEnonce(e: ExerciceOptimiserLog): SectionExercice {
  const fi = fiche(e);
  return {
    enteteFragments: fi.consigneGenerale,
    questions: PHASES_OPTIMISER_LOG.map((phase) => ({ consigne: fi.consignes[phase] })),
  };
}

function construireCorrection(e: ExerciceOptimiserLog): BlocCorrection[] {
  return PHASES_OPTIMISER_LOG.map((phase) => ({ type: "paragraphe", fragments: [t(`${LETTRES[phase]}) `), ...reponse(e, phase)] }));
}

function enoncePapier(e: ExerciceOptimiserLog): EnoncePapier {
  const fi = fiche(e);
  return {
    section: {
      enteteFragments: [...fi.consigneGenerale, t(" Justifie chaque réponse par un calcul.")],
      questions: [{ consigne: fi.consignes.domaine }, { consigne: fi.questionPapier }],
    },
    etapesParQuestion: [["a"], ["b", "c", "d", "e"]],
    reponseBreve: [t("a) "), ...reponse(e, "domaine"), t(" ; b) "), ...reponse(e, "valeur")],
  };
}

function methode(e: ExerciceOptimiserLog, phase: PhaseOptimiserLog): FragmentConsigne[] {
  const aide = fiche(e).aides[phase][0];
  return aide.latex ? [t(`${aide.texte} `), f(aide.latex)] : [t(aide.texte)];
}

function correctionDetaillee(e: ExerciceOptimiserLog): EtapeCorrection[] {
  const fi = fiche(e);
  return PHASES_OPTIMISER_LOG.flatMap((phase) => {
    const sousQuestion = LETTRES[phase];
    const lignes: EtapeCorrection[] = [
      { label: "Méthode", sousQuestion, fragments: methode(e, phase) },
      { label: "Calcul", sousQuestion, fragments: [f(fi.calculs[phase])] },
      { label: "Piège", sousQuestion, fragments: [t(fi.pieges[phase])] },
    ];
    if (phase === "valeur") {
      lignes.push({ label: "Conclusion", sousQuestion, fragments: reponse(e, phase), figureHtml: figureOptimiserLogSvg(e) });
    } else {
      lignes.push({ label: "Conclusion", sousQuestion, fragments: reponse(e, phase) });
    }
    return lignes;
  });
}

function difficulte(e: ExerciceOptimiserLog): 1 | 2 | 3 {
  return e.variante === "rendement-moyen" ? 3 : 2;
}

function reponseBreve(e: ExerciceOptimiserLog): FragmentConsigne[] {
  return enoncePapier(e).reponseBreve ?? [];
}

const POIDS: Record<PhaseOptimiserLog, number> = { domaine: 0.5, derivee: 1, zero: 0.75, nature: 0.75, valeur: 1 };

const CRITERE: Record<PhaseOptimiserLog, string> = {
  domaine: "Domaine dans le contexte (condition du logarithme et contraintes de la situation) : ",
  derivee: "Dérivée correcte : ",
  zero: "Valeur exacte qui annule la dérivée : ",
  nature: "Signe de la dérivée et nature de l'optimum justifiés : ",
  valeur: "Optimum et valeur optimale dans les unités demandées : ",
};

function bareme(e: ExerciceOptimiserLog): BaremeExercice {
  const fi = fiche(e);
  const erreurs = PHASES_OPTIMISER_LOG.map((phase) => ({ description: [t(fi.pieges[phase])], cout: phase === "domaine" ? "−0,5" : phase === "nature" || phase === "valeur" ? "−0,5" : "−1" }));
  erreurs.push({ description: [t("Réponse sans unité, ou valeur de la variable donnée à la place de la grandeur demandée")], cout: "−0,5" });
  const calculatrice = e.mode === "arrondie";
  return {
    reponseFinale: reponse(e, "valeur"),
    criteres: PHASES_OPTIMISER_LOG.map((phase) => ({ sousQuestion: LETTRES[phase], critere: [t(CRITERE[phase]), ...reponse(e, phase)], points: POIDS[phase] })),
    erreursFrequentes: erreurs,
    reponsesAcceptees: [
      [t(calculatrice ? "Valeurs arrondies à la précision demandée, ou valeurs exactes ; un écart dû à un arrondi intermédiaire est toléré" : "Valeurs exactes (avec e) ; une valeur approchée seule ne suffit pas")],
      [t("Toute écriture équivalente de la dérivée")],
      [t("Nature justifiée par un tableau de signes ou par le signe de la dérivée de part et d'autre de la valeur trouvée")],
    ],
  };
}

export const adaptateurEvaluationOptimiserModeleLog: AdaptateurFeuilleExercices<ExerciceOptimiserLog> = {
  titreDocument: "Optimiser un modèle logarithmique — Évaluation",
  nomFichierBase: "optimiser-modele-logarithmique",
  genererInstance: genererExerciceOptimiserLog,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id),
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 15,
  profilInstance: profilOptimiserLog,
  calculatriceIndispensable: VARIANTES_CALCULATRICE_OPTIMISER_LOG,
};
