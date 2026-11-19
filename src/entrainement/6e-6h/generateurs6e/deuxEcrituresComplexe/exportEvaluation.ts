import { argumentZ, cosZ, sinZ } from "../../core6e/deuxEcrituresComplexe";
import type { ExerciceDeuxEcritures } from "../../core6e/deuxEcrituresComplexe";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, EnoncePapier, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import type { CriteresDifficulte } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/fragmentsDocx";
import { PHASES_DEUX_ECRITURES } from "../../moteur6e/typesDeuxEcritures";
import {
  consigneEcran,
  consigneGenerale,
  douziemeLatex,
  formeAlgebriqueLatex,
  formeTrigonometriqueLatex,
  reponseFragments,
  trigLatex,
  zLatex,
} from "../../ui6e/formatDeuxEcritures";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceDeuxEcritures } from "./index";
import type { IdVarianteDeuxEcritures } from "./index";
import { profilDeuxEcritures } from "./profilEvaluation";
import { correctionDetailleeDeuxEcritures } from "./corrigeDetaille";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceDeuxEcritures>` de `6gen94` « Valeurs exactes par
 * deux écritures d'un même complexe » — méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - Énoncé papier : l'exercice classique en trois VRAIES questions — a) forme algébrique, b) forme
 *   trigonométrique, c) déduis-en cos θ et sin θ (θ nommé). Les quatre écrans deviennent les étapes
 *   du corrigé : la question b) couvre les étapes b (facteurs) et c (forme trigonométrique de z).
 * - Corrigé : une étape par écran (lettres a, b, c, d), valeurs tirées des MÊMES fonctions que
 *   l'écran (`ui6e/formatDeuxEcritures.ts`), une ligne « Piège » ciblée.
 * - Aucune figure. Version aménagée : même énoncé (seule la mise en page change).
 */

const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);

// ============================================================================
// Énoncés.
// ============================================================================

function construireEnonce(e: ExerciceDeuxEcritures): SectionExercice {
  return { enteteFragments: consigneGenerale(e), questions: PHASES_DEUX_ECRITURES.map((phase) => ({ consigne: consigneEcran(e, phase) })) };
}

function construireCorrection(e: ExerciceDeuxEcritures): BlocCorrection[] {
  return PHASES_DEUX_ECRITURES.map((phase, i) => ({ type: "paragraphe", fragments: [t(`${"abcd"[i]}) `), ...reponseFragments(e, phase)] }));
}

function valeursFinalesLatex(e: ExerciceDeuxEcritures): string {
  const th = argumentZ(e);
  return `${trigLatex("cos", th)}=${douziemeLatex(cosZ(e))}\\quad\\text{et}\\quad ${trigLatex("sin", th)}=${douziemeLatex(sinZ(e))}`;
}

function reponseBreve(e: ExerciceDeuxEcritures): FragmentConsigne[] {
  return [t("a) "), f(`z=${formeAlgebriqueLatex(e)}`), t(" ; b) "), f(`z=${formeTrigonometriqueLatex(e)}`), t(" ; c) "), f(valeursFinalesLatex(e)), t(".")];
}

function enoncePapier(e: ExerciceDeuxEcritures): EnoncePapier {
  const th = argumentZ(e);
  return {
    section: {
      enteteFragments: [t("On considère le nombre complexe "), f(`z=${zLatex(e)}`), t(".")],
      questions: [
        { consigne: [t("Écris "), f("z"), t(" sous forme algébrique.")] },
        { consigne: [t("Écris "), f("z"), t(" sous forme trigonométrique, en calculant d'abord le module et un argument de chaque facteur.")] },
        { consigne: [t("Déduis-en les valeurs exactes de "), f(trigLatex("cos", th)), t(" et de "), f(trigLatex("sin", th)), t(".")] },
      ],
    },
    etapesParQuestion: [["a"], ["b", "c"], ["d"]],
    reponseBreve: reponseBreve(e),
  };
}

// ============================================================================
// Corrigé détaillé.
// ============================================================================

const correctionDetaillee = correctionDetailleeDeuxEcritures;

/** Critères du niveau de difficulté (grille commune, `export/niveauDifficulte.ts`) : méthode et
 * piège jugés par variante (analyse des cinq chapitres), étapes lues sur le corrigé détaillé. */
function criteresDifficulte(e: ExerciceDeuxEcritures): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetaillee(e)), methode: 0, piege: e.variante === "quotient" ? 1 : 0, anglesEnPi: true };
}

// ============================================================================
// Barème (somme 4).
// ============================================================================

function bareme(e: ExerciceDeuxEcritures): BaremeExercice {
  const r = (phase: (typeof PHASES_DEUX_ECRITURES)[number]) => reponseFragments(e, phase);
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Forme algébrique : "), f(`z=${formeAlgebriqueLatex(e)}`)], points: 1 },
      { sousQuestion: "b", critere: [t("Module et argument des facteurs : "), ...r("facteurs")], points: 1 },
      { sousQuestion: "c", critere: [t("Forme trigonométrique : "), f(`z=${formeTrigonometriqueLatex(e)}`)], points: 1 },
      { sousQuestion: "d", critere: [t("Identification : "), f(valeursFinalesLatex(e))], points: 1 },
    ],
    erreursFrequentes: [
      e.variante === "quotient"
        ? { description: [t("Arguments additionnés au lieu d'être soustraits (quotient)")], cout: "−1" }
        : { description: [f("i^2"), t(" remplacé par "), f("1"), t(" au lieu de "), f("-1"), t(" dans le développement")], cout: "−0,5" },
      { description: [t("Argument d'un facteur dans le mauvais quadrant (arctan sans correction)")], cout: "−0,5" },
      { description: [t("Partie réelle recopiée comme cosinus, sans diviser par le module")], cout: "−1" },
      { description: [t("Valeur approchée au lieu de la valeur exacte")], cout: "−0,5" },
    ],
    reponsesAcceptees: [[t("Toute écriture exacte équivalente (par exemple un dénominateur "), f("2\\sqrt{2}"), t(" non rationalisé)")], [t("Un argument égal à "), f("2k\\pi"), t(" près")]],
  };
}

export const adaptateurEvaluationDeuxEcritures: AdaptateurFeuilleExercices<ExerciceDeuxEcritures> = {
  titreDocument: "Valeurs exactes par deux écritures d'un même complexe — Évaluation",
  nomFichierBase: "deux-ecritures-complexe",
  genererInstance: genererExerciceDeuxEcritures,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteDeuxEcritures),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  profilInstance: profilDeuxEcritures,
};
