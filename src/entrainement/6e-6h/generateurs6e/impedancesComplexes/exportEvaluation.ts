import type { ExerciceImpedances } from "../../core6e/impedancesComplexes";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, EnoncePapier, EtapeCorrection, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { PHASES_IMPEDANCES } from "../../moteur6e/typesImpedances";
import type { PhaseImpedances } from "../../moteur6e/typesImpedances";
import {
  NOM_NATURE,
  RAPPEL_J,
  UN_SUR_J_LATEX,
  argumentArrondiLatex,
  calculArgumentLatex,
  calculBobineLatex,
  calculCondensateurLatex,
  calculIntensiteLatex,
  calculModuleLatex,
  calculTotaleLatex,
  consigneEcran,
  consigneGenerale,
  descriptionCircuit,
  formeAlgebriqueLatex,
  intensiteArrondieLatex,
  justificationNature,
  moduleArrondiLatex,
  nomReactif,
  rappelImpedances,
  reponseFragments,
} from "../../ui6e/formatImpedances";
import { schemaCircuitSvg } from "../../ui6e/schemaCircuitImpedances";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceImpedances } from "./index";
import type { IdVarianteImpedances } from "./index";
import { profilImpedances } from "./profilEvaluation";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceImpedances>` de `6gen96` « Électricité :
 * impédances complexes » — méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - Énoncé papier : description du circuit + schéma (`enteteHtml`, données seulement) + rappels
 *   (notation j, impédances des composants, règle d'association, loi d'Ohm, signe du déphasage),
 *   puis quatre VRAIES questions : a) impédance Z sous forme algébrique (étapes a et b), b) module
 *   et déphasage (c), c) intensité efficace (d), d) nature du circuit, justifiée (e).
 * - Corrigé : une étape par écran (lettres a à e), valeurs tirées des MÊMES fonctions que l'écran
 *   (`ui6e/formatImpedances.ts`), une ligne « Piège » ciblée.
 * - Toutes les instances exigent la calculatrice (module, arctangente, intensité) :
 *   `calculatriceIndispensable` sur les trois variantes. Version aménagée : même énoncé.
 */

const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);
const LETTRES = "abcde";

/** Loi d'Ohm et signe du déphasage (consigne papier autosuffisante). */
const RAPPEL_OHM_DEPHASAGE: FragmentConsigne[] = [
  t("En alternatif, "),
  f("I=\\dfrac{U}{|Z|}"),
  t(" (valeurs efficaces) ; le déphasage "),
  f("\\varphi=\\arg Z"),
  t(" est positif pour un circuit inductif, négatif pour un circuit capacitif et nul pour un circuit résistif."),
];

// ============================================================================
// Énoncés.
// ============================================================================

function construireEnonce(e: ExerciceImpedances): SectionExercice {
  return { enteteFragments: consigneGenerale(e), enteteHtml: schemaCircuitSvg(e), questions: PHASES_IMPEDANCES.map((phase) => ({ consigne: consigneEcran(e, phase) })) };
}

function construireCorrection(e: ExerciceImpedances): BlocCorrection[] {
  return PHASES_IMPEDANCES.map((phase, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponseFragments(e, phase)] }));
}

function reponseBreve(e: ExerciceImpedances): FragmentConsigne[] {
  return [
    t("a) "),
    f(`Z=${formeAlgebriqueLatex(e)}\\ \\Omega`),
    t(" ; b) "),
    f(`|Z|\\approx ${moduleArrondiLatex(e)}\\ \\Omega,\\ \\varphi\\approx ${argumentArrondiLatex(e)}^\\circ`),
    t(" ; c) "),
    f(`I\\approx ${intensiteArrondieLatex(e)}\\ \\text{A}`),
    t(` ; d) circuit ${NOM_NATURE[e.nature]}.`),
  ];
}

function enoncePapier(e: ExerciceImpedances): EnoncePapier {
  return {
    section: {
      enteteFragments: [...descriptionCircuit(e), t(" "), ...RAPPEL_J, t(" "), ...rappelImpedances(e), t(" "), ...RAPPEL_OHM_DEPHASAGE],
      enteteHtml: schemaCircuitSvg(e),
      questions: [
        { consigne: [t("Calcule l'impédance complexe de chaque composant, puis l'impédance totale "), f("Z"), t(" du circuit, sous forme algébrique.")] },
        { consigne: [t("Calcule le module "), f("|Z|"), t(" (en ohms, au dixième) et le déphasage "), f("\\varphi=\\arg Z"), t(" (en degrés, au dixième).")] },
        { consigne: [t("Calcule l'intensité efficace "), f("I"), t(" du courant (en ampères, au centième).")] },
        { consigne: [t("Le circuit est-il inductif, capacitif ou résistif ? Justifie.")] },
      ],
    },
    etapesParQuestion: [["a", "b"], ["c"], ["d"], ["e"]],
    reponseBreve: reponseBreve(e),
  };
}

// ============================================================================
// Corrigé détaillé.
// ============================================================================

function lignesComposants(e: ExerciceImpedances): EtapeCorrection[] {
  const lignes: EtapeCorrection[] = [
    {
      label: "Méthode",
      sousQuestion: "a",
      fragments:
        e.xC === null
          ? [t("On remplace L, converti en henrys, dans la formule "), f("Z_L=jL\\omega"), t(".")]
          : [t(e.xL !== null ? "On remplace L (en henrys) et C (en farads) dans les formules ; avec " : "On remplace C, converti en farads, dans la formule ; avec "), f("j^2=-1"), t(", "), f(UN_SUR_J_LATEX), t(".")],
    },
  ];
  if (e.xL !== null) lignes.push({ label: "Calcul", sousQuestion: "a", fragments: [f(calculBobineLatex(e))] });
  if (e.xC !== null) lignes.push({ label: "Calcul", sousQuestion: "a", fragments: [f(calculCondensateurLatex(e))] });
  return lignes;
}

function correctionDetaillee(e: ExerciceImpedances): EtapeCorrection[] {
  const parallele = e.variante === "parallele";
  const lignes: EtapeCorrection[] = [
    ...lignesComposants(e),
    parallele
      ? { label: "Méthode", sousQuestion: "b", fragments: [t("En parallèle, avec "), f(`Z_1=R`), t(" et "), f(`Z_2=${nomReactif(e)}`), t(" : "), f("\\dfrac{1}{Z}=\\dfrac{1}{Z_1}+\\dfrac{1}{Z_2}"), t(", c'est-à-dire "), f("Z=\\dfrac{Z_1Z_2}{Z_1+Z_2}"), t(" ; on multiplie ensuite par le conjugué du dénominateur.")] }
      : { label: "Méthode", sousQuestion: "b", fragments: [t("En série, les impédances s'additionnent : parties réelles entre elles, parties imaginaires entre elles.")] },
    { label: "Calcul", sousQuestion: "b", fragments: [f(calculTotaleLatex(e))] },
    { label: "Méthode", sousQuestion: "c", fragments: [t("Pour "), f("Z=a+bj"), t(" avec "), f("a>0"), t(" : "), f("|Z|=\\sqrt{a^2+b^2}"), t(" et "), f("\\varphi=\\arctan\\dfrac{b}{a}"), t(" (calculatrice en degrés).")] },
    { label: "Calcul", sousQuestion: "c", fragments: [f(calculModuleLatex(e))] },
    { label: "Calcul", sousQuestion: "c", fragments: [f(calculArgumentLatex(e))] },
    { label: "Méthode", sousQuestion: "d", fragments: [t("Loi d'Ohm en alternatif, avec le module de l'impédance : "), f("I=\\dfrac{U}{|Z|}"), t(".")] },
    { label: "Calcul", sousQuestion: "d", fragments: [f(calculIntensiteLatex(e))] },
    { label: "Conclusion", sousQuestion: "e", fragments: justificationNature(e) },
  ];
  if (e.xC !== null && !parallele) {
    lignes.push({ label: "Piège", sousQuestion: "a", fragments: [t("Le signe de l'impédance du condensateur : "), f("\\dfrac{1}{j}=-j"), t(", donc "), f("Z_C=-\\dfrac{j}{C\\omega}"), t(" a une partie imaginaire NÉGATIVE ; l'écrire positive change la nature du circuit.")] });
  } else if (parallele) {
    lignes.push({ label: "Piège", sousQuestion: "b", fragments: [t("Additionner directement les impédances des deux branches : "), f(`Z\\neq Z_1+Z_2`), t(" en parallèle, ce sont les inverses qui s'additionnent.")] });
  } else {
    lignes.push({ label: "Piège", sousQuestion: "d", fragments: [t("Diviser la tension par la seule résistance : "), f(`\\dfrac{U}{R}=\\dfrac{${e.U}}{${e.R}}`), t(" ignore la bobine ; c'est le module "), f("|Z|"), t(" qui intervient.")] });
  }
  return lignes;
}

function difficulte(e: ExerciceImpedances): 1 | 2 | 3 {
  return e.variante === "parallele" ? 3 : 2;
}

// ============================================================================
// Barème (somme 4).
// ============================================================================

function bareme(e: ExerciceImpedances): BaremeExercice {
  const r = (phase: PhaseImpedances) => reponseFragments(e, phase);
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Impédance de chaque composant : "), ...r("composants")], points: 0.5 },
      { sousQuestion: "b", critere: [t("Impédance totale : "), f(`Z=${formeAlgebriqueLatex(e)}\\ \\Omega`)], points: 1 },
      { sousQuestion: "c", critere: [t("Module et déphasage : "), f(`|Z|\\approx ${moduleArrondiLatex(e)}\\ \\Omega,\\ \\varphi\\approx ${argumentArrondiLatex(e)}^\\circ`)], points: 1 },
      { sousQuestion: "d", critere: [t("Intensité efficace : "), f(`I\\approx ${intensiteArrondieLatex(e)}\\ \\text{A}`)], points: 0.75 },
      { sousQuestion: "e", critere: [t(`Nature (circuit ${NOM_NATURE[e.nature]}), justifiée par le signe de `), f("\\varphi")], points: 0.75 },
    ],
    erreursFrequentes: [
      { description: [t("Signe de l'impédance du condensateur ("), f("\\dfrac{1}{j}"), t(" pris égal à "), f("j"), t(")")], cout: "−0,5" },
      { description: [t("Inductance ou capacité non convertie (mH, µF)")], cout: "−0,5" },
      e.variante === "parallele" ? { description: [t("Impédances des branches additionnées directement")], cout: "−1" } : { description: [t("Module calculé comme la somme des parties")], cout: "−0,5" },
      { description: [t("Intensité calculée avec la résistance seule ("), f("U/R"), t(")")], cout: "−0,5" },
      { description: [t("Argument donné en radians, ou unité absente")], cout: "−0,25" },
    ],
    reponsesAcceptees: [[t("Toute valeur arrondie à une unité près du dernier chiffre demandé")], [t("Notation "), f("i"), t(" au lieu de "), f("j"), t(" (même nombre)")]],
  };
}

export const adaptateurEvaluationImpedances: AdaptateurFeuilleExercices<ExerciceImpedances> = {
  titreDocument: "Électricité : impédances complexes — Évaluation",
  nomFichierBase: "impedances-complexes",
  genererInstance: genererExerciceImpedances,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteImpedances),
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 15,
  profilInstance: profilImpedances,
  calculatriceIndispensable: CATALOGUE_VARIANTES.map((v) => v.id),
};
