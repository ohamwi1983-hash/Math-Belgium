import type { ExerciceImpedances } from "../../core6e/impedancesComplexes";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, EnoncePapier, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import type { CriteresDifficulte } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/fragmentsDocx";
import { PHASES_IMPEDANCES } from "../../moteur6e/typesImpedances";
import type { PhaseImpedances } from "../../moteur6e/typesImpedances";
import {
  NOM_NATURE,
  RAPPEL_J,
  argumentArrondiLatex,
  consigneEcran,
  consigneGenerale,
  descriptionCircuit,
  formeAlgebriqueLatex,
  intensiteArrondieLatex,
  moduleArrondiLatex,
  rappelImpedances,
  reponseFragments,
} from "../../ui6e/formatImpedances";
import { schemaCircuitSvg } from "../../ui6e/schemaCircuitImpedances";
import { correctionDetailleeImpedances } from "./corrigeDetaille";
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

const correctionDetaillee = correctionDetailleeImpedances;

/** Critères du niveau de difficulté (grille commune, `export/niveauDifficulte.ts`) : méthode et
 * piège jugés par variante (analyse des cinq chapitres), étapes lues sur le corrigé détaillé. */
function criteresDifficulte(e: ExerciceImpedances): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetaillee(e)), methode: 0, piege: 1, anglesEnPi: true };
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
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  profilInstance: profilImpedances,
  calculatriceIndispensable: CATALOGUE_VARIANTES.map((v) => v.id),
};
