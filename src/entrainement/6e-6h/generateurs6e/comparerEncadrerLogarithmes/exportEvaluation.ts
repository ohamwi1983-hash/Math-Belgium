import type { ExerciceComparerEncadrerLog } from "../../core6e/comparerEncadrerLogarithmes.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  EnoncePapier,
  ErreurFrequente,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import type { CriteresDifficulte } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/fragmentsDocx";
import { estPhaseChoix, phasesExercice } from "../../moteur6e/typesComparerEncadrerLogarithmes";
import type { PhaseComparerEncadrerLog } from "../../moteur6e/typesComparerEncadrerLogarithmes";
import {
  centiemesLatex,
  cibleChangementBase,
  entierTexte,
  formatReponseAttendueLatex,
  logDonneLatex,
  logLatex,
  milliemesLatex,
  nombresRangerLatex,
  optionCorrecteFragments,
  termeLatex,
} from "../../ui6e/formatComparerEncadrerLogarithmes";
import { profilComparerEncadrerLog } from "./profil";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceComparerEncadrerLog } from "./index";
import type { IdVarianteComparerEncadrerLog } from "./index";
import { correctionDetailleeComparerEncadrerLog } from "./corrigeDetaille";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceComparerEncadrerLog>` de `6gen86` « Comparer et
 * encadrer des logarithmes sans calculatrice » — méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - Énoncé papier : le ou les nombres et UNE consigne globale (« sans calculatrice… en justifiant ») ;
 *   les écrans deviennent les étapes du corrigé (« Étape n — … »). Aucune figure.
 * - Corrigé : réponses tirées des MÊMES fonctions que l'écran (`formatReponseAttendueLatex`,
 *   `optionCorrecteFragments`, encadrements par puissances).
 * - Version aménagée : même énoncé (le pipeline ne change que la mise en page).
 */

const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);
const LETTRES = ["a", "b", "c", "d"];

function lettre(e: ExerciceComparerEncadrerLog, phase: PhaseComparerEncadrerLog): string {
  return LETTRES[phasesExercice(e).indexOf(phase)];
}

const logAN = (a: number, N: number) => logLatex({ num: a, den: 1 }, { num: N, den: 1 });

// ============================================================================
// Énoncé papier.
// ============================================================================

function entetePapier(e: ExerciceComparerEncadrerLog): FragmentConsigne[] {
  switch (e.variante) {
    case "encadrer":
      return [t("Sans calculatrice, encadre "), f(logAN(e.a, e.N)), t(` entre deux entiers consécutifs, en justifiant à l'aide des puissances de ${e.a}.`)];
    case "comparer":
      return [t("On considère les nombres "), f(`A=${termeLatex(e.A)}`), t(" et "), f(`B=${termeLatex(e.B)}`), t(". Sans calculatrice, compare "), f("A"), t(" et "), f("B"), t(" en justifiant.")];
    case "ranger": {
      const n = nombresRangerLatex(e);
      return [t("Sans calculatrice, range dans l'ordre croissant les nombres suivants, en justifiant : "), ...n.flatMap((x, i) => (i === 0 ? [f(x)] : [t(" ; "), f(x)])), t(".")];
    }
    case "changementBase": {
      const s = e.mode === "log" ? "\\log" : "\\ln";
      return [
        t("On donne "),
        f(`${s}(2)\\approx ${milliemesLatex(e.mode === "log" ? 301 : 693)}`),
        t(" et "),
        f(`${s}(3)\\approx ${milliemesLatex(e.mode === "log" ? 477 : 1099)}`),
        t(". Sans calculatrice, calcule une valeur approchée de "),
        f(cibleChangementBase(e)),
        t(", arrondie au centième, à l'aide des propriétés du logarithme et du changement de base. Justifie."),
      ];
    }
  }
}

/** Titres d'étapes du corrigé (« Étape n — … »), rédigés pour le papier. */
function titreEtape(e: ExerciceComparerEncadrerLog, phase: PhaseComparerEncadrerLog): FragmentConsigne[] {
  switch (phase) {
    case "puissances":
      return e.variante === "encadrer" ? [t(`Encadre ${entierTexte(e.N)} entre deux puissances consécutives de ${e.a}.`)] : [];
    case "encadrement":
      return e.variante === "encadrer" ? [t("Déduis-en un encadrement de "), f(logAN(e.a, e.N)), t(" entre deux entiers consécutifs.")] : [];
    case "encadrerA":
      return [t("Encadre "), f("A"), t(" entre deux entiers consécutifs.")];
    case "encadrerB":
      return [t("Encadre "), f("B"), t(" entre deux entiers consécutifs.")];
    case "verdict":
      return [t("Compare "), f("A"), t(" et "), f("B"), t(".")];
    case "situer":
      return [t("Encadre chaque logarithme entre deux entiers consécutifs.")];
    case "ordre":
      return [t("Range les quatre nombres dans l'ordre croissant.")];
    case "formule":
      return e.variante === "changementBase" ? [t("Écris "), f(cibleChangementBase(e)), t(" à l'aide du changement de base.")] : [];
    case "valeurs":
      return e.variante === "changementBase" ? [t("Calcule des valeurs approchées de "), f(logDonneLatex(e, e.N)), t(" et de "), f(logDonneLatex(e, e.a)), t(".")] : [];
    case "quotient":
      return e.variante === "changementBase" ? [t("Déduis-en une valeur approchée de "), f(cibleChangementBase(e)), t(", arrondie au centième.")] : [];
  }
}

function reponseEtape(e: ExerciceComparerEncadrerLog, phase: PhaseComparerEncadrerLog): FragmentConsigne[] {
  if (estPhaseChoix(phase)) return optionCorrecteFragments(e, phase);
  return formatReponseAttendueLatex(e, phase).flatMap((x, i) => (i === 0 ? [f(x)] : [t(" ; "), f(x)]));
}

function construireEnonce(e: ExerciceComparerEncadrerLog): SectionExercice {
  return { enteteFragments: entetePapier(e), questions: phasesExercice(e).map((phase) => ({ consigne: titreEtape(e, phase) })) };
}

function construireCorrection(e: ExerciceComparerEncadrerLog): BlocCorrection[] {
  return phasesExercice(e).map((phase) => ({ type: "paragraphe", fragments: [t(`${lettre(e, phase)}) `), ...reponseEtape(e, phase)] }));
}

function reponseBreve(e: ExerciceComparerEncadrerLog): FragmentConsigne[] {
  switch (e.variante) {
    case "encadrer":
      return [f(`${e.k}<${logAN(e.a, e.N)}<${e.k + 1}`)];
    case "comparer":
      return [f(`${termeLatex(e.A)}${e.verdict}${termeLatex(e.B)}`)];
    case "ranger":
      return optionCorrecteFragments(e, "ordre");
    case "changementBase":
      return [f(`${cibleChangementBase(e)}\\approx ${centiemesLatex(e.resultatCentiemes)}`)];
  }
}

function enoncePapier(e: ExerciceComparerEncadrerLog): EnoncePapier {
  return { section: { enteteFragments: entetePapier(e), questions: [] }, reponseBreve: reponseBreve(e) };
}

// ============================================================================
// Corrigé détaillé.
// ============================================================================

const correctionDetaillee = correctionDetailleeComparerEncadrerLog;

/** Étoiles fixées par la variante (jamais par le verdict). */
/** Critères du niveau de difficulté (grille commune, `export/niveauDifficulte.ts`) : méthode et
 * piège jugés par variante (analyse des cinq chapitres), étapes lues sur le corrigé détaillé. */
function criteresDifficulte(e: ExerciceComparerEncadrerLog): CriteresDifficulte {
  const r = e.variante === "comparer" || e.variante === "ranger" ? 1 : 0;
  return { ...etapesDuCorrige(correctionDetaillee(e)), methode: r, piege: r };
}

// ============================================================================
// Barème (somme 4).
// ============================================================================

function bareme(e: ExerciceComparerEncadrerLog): BaremeExercice {
  const r = (phase: PhaseComparerEncadrerLog) => reponseEtape(e, phase);
  let criteres: CritereBareme[] = [];
  let erreursFrequentes: ErreurFrequente[] = [];
  let reponsesAcceptees: FragmentConsigne[][] = [];
  switch (e.variante) {
    case "encadrer":
      criteres = [
        { sousQuestion: "a", critere: [t("Puissances consécutives qui encadrent le nombre : "), ...r("puissances")], points: 2 },
        { sousQuestion: "b", critere: [t("Encadrement du logarithme, justifié par la croissance : "), ...r("encadrement")], points: 2 },
      ];
      erreursFrequentes = [
        { description: [t("Puissances recopiées comme bornes du logarithme (au lieu des exposants)")], cout: "0 pt sur b)" },
        { description: [t("Croissance du logarithme non citée")], cout: "−0,5" },
      ];
      reponsesAcceptees = [[t("Puissances écrites sous forme de puissances ou de valeurs")]];
      break;
    case "comparer":
      criteres = [
        { sousQuestion: "a", critere: [t("Encadrement de A : "), ...r("encadrerA")], points: 1 },
        { sousQuestion: "b", critere: [t("Encadrement de B : "), ...r("encadrerB")], points: 1 },
        { sousQuestion: "c", critere: [t("Comparaison justifiée : "), ...r("verdict")], points: 2 },
      ];
      erreursFrequentes = [
        ...(e.baseInf1 ? [{ description: [t("Sens de l'encadrement non inversé pour une base inférieure à 1")], cout: "0 pt sur a) et b)" }] : []),
        { description: [t("Conclusion tirée d'encadrements identiques, sans changement de base")], cout: "0 pt sur c)" },
        { description: [t("Conclusion sans justification (valeurs « lues » à la calculatrice)")], cout: "0 pt sur c)" },
      ];
      reponsesAcceptees = [[t("Tout encadrement plus fin correctement justifié, ou un changement de base direct")]];
      break;
    case "ranger":
      criteres = [
        { sousQuestion: "a", critere: [t("Encadrement de chaque logarithme : "), ...r("situer")], points: 2.5 },
        { sousQuestion: "b", critere: [t("Ordre croissant : "), ...r("ordre")], points: 1.5 },
      ];
      erreursFrequentes = [
        { description: [t("Erreur de signe sur l'encadrement d'un logarithme négatif")], cout: "−0,5 par logarithme" },
        { description: [t("Ordre donné sans aucun encadrement")], cout: "0 pt sur a)" },
      ];
      reponsesAcceptees = [[t("Ordre écrit avec des inégalités ou en liste numérotée")]];
      break;
    case "changementBase":
      criteres = [
        { sousQuestion: "a", critere: [t("Changement de base : "), ...r("formule")], points: 1 },
        { sousQuestion: "b", critere: [t("Valeurs approchées par les propriétés : "), ...r("valeurs")], points: 1.5 },
        { sousQuestion: "c", critere: [t("Quotient arrondi au centième : "), ...r("quotient")], points: 1.5 },
      ];
      erreursFrequentes = [
        { description: [t("Quotient inversé ou remplacé par une différence")], cout: "0 pt sur a) et c)" },
        ...(e.N.p < 0 || e.N.q < 0
          ? [{ description: [t("Logarithmes d'un quotient additionnés au lieu d'être soustraits")], cout: "−1" }]
          : [{ description: [t("Logarithme d'un produit confondu avec le produit des logarithmes")], cout: "−1" }]),
        { description: [t("Arrondi incorrect ou précision non respectée")], cout: "−0,5" },
      ];
      reponsesAcceptees = [[t("Résultat à "), f("\\pm 0{,}01"), t(" près si la démarche est correcte")]];
      break;
  }
  return { reponseFinale: reponseBreve(e), criteres, erreursFrequentes, reponsesAcceptees };
}

export const adaptateurEvaluationComparerEncadrerLog: AdaptateurFeuilleExercices<ExerciceComparerEncadrerLog> = {
  titreDocument: "Comparer et encadrer des logarithmes sans calculatrice — Évaluation",
  nomFichierBase: "comparer-encadrer-logarithmes",
  genererInstance: genererExerciceComparerEncadrerLog,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteComparerEncadrerLog),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  profilInstance: profilComparerEncadrerLog,
};
