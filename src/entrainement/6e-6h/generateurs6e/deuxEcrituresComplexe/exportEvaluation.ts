import { argumentZ, cosZ, sinZ } from "../../core6e/deuxEcrituresComplexe";
import type { ExerciceDeuxEcritures } from "../../core6e/deuxEcrituresComplexe";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, EnoncePapier, EtapeCorrection, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { PHASES_DEUX_ECRITURES } from "../../moteur6e/typesDeuxEcritures";
import {
  calculAlgebriqueLatex,
  calculArgumentFacteurLatex,
  calculArgumentZLatex,
  calculIdentificationLatex,
  calculModuleFacteurLatex,
  calculModuleZLatex,
  consigneEcran,
  consigneGenerale,
  douziemeLatex,
  facteurLatex,
  formeAlgebriqueLatex,
  formeTrigonometriqueLatex,
  reponseFragments,
  trigLatex,
  zLatex,
} from "../../ui6e/formatDeuxEcritures";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceDeuxEcritures } from "./index";
import type { IdVarianteDeuxEcritures } from "./index";
import { profilDeuxEcritures } from "./profilEvaluation";

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

function correctionDetaillee(e: ExerciceDeuxEcritures): EtapeCorrection[] {
  const quotient = e.variante === "quotient";
  const th = argumentZ(e);
  const lignes: EtapeCorrection[] = [
    quotient
      ? { label: "Méthode", sousQuestion: "a", fragments: [t("On multiplie le numérateur et le dénominateur par le conjugué du dénominateur, qui devient réel : "), f("(c+di)(c-di)=c^2+d^2"), t(".")] }
      : { label: "Méthode", sousQuestion: "a", fragments: [t("On développe le produit terme à terme et on remplace "), f("i^2"), t(" par "), f("-1"), t(".")] },
    { label: "Calcul", sousQuestion: "a", fragments: [f(calculAlgebriqueLatex(e))] },
    { label: "Méthode", sousQuestion: "b", fragments: [t("Module "), f("r=\\sqrt{a^2+b^2}"), t(", puis l'angle "), f("\\theta"), t(" tel que "), f("\\cos\\theta=\\dfrac{a}{r}"), t(" et "), f("\\sin\\theta=\\dfrac{b}{r}"), t(" (angle remarquable).")] },
    { label: "Calcul", sousQuestion: "b", fragments: [f(`z_1=${facteurLatex(e.z1)}`), t(" : "), f(calculModuleFacteurLatex(e.z1, "z_1")), t(" et "), f(calculArgumentFacteurLatex(e.z1, "1")), t(".")] },
    { label: "Calcul", sousQuestion: "b", fragments: [f(`z_2=${facteurLatex(e.z2)}`), t(" : "), f(calculModuleFacteurLatex(e.z2, "z_2")), t(" et "), f(calculArgumentFacteurLatex(e.z2, "2")), t(".")] },
    {
      label: "Méthode",
      sousQuestion: "c",
      fragments: quotient
        ? [t("Un quotient divise les modules et soustrait les arguments : "), f("\\left|\\dfrac{z_1}{z_2}\\right|=\\dfrac{|z_1|}{|z_2|}"), t(" et "), f("\\arg\\dfrac{z_1}{z_2}=\\arg z_1-\\arg z_2"), t(".")]
        : [t("Un produit multiplie les modules et additionne les arguments : "), f("|z_1z_2|=|z_1|\\cdot|z_2|"), t(" et "), f("\\arg(z_1z_2)=\\arg z_1+\\arg z_2"), t(".")],
    },
    { label: "Calcul", sousQuestion: "c", fragments: [f(calculModuleZLatex(e)), t(" et "), f(calculArgumentZLatex(e)), t(".")] },
    { label: "Conclusion", sousQuestion: "c", fragments: [f(`z=${formeTrigonometriqueLatex(e)}`), t(".")] },
    { label: "Méthode", sousQuestion: "d", fragments: [t("Les deux écritures désignent le même nombre : "), f(`${formeTrigonometriqueLatex(e)}=${formeAlgebriqueLatex(e)}`), t(". On identifie les parties réelles, puis les parties imaginaires.")] },
    { label: "Calcul", sousQuestion: "d", fragments: [f(calculIdentificationLatex(e, "cos")), t(" et "), f(calculIdentificationLatex(e, "sin")), t(" (on multiplie le numérateur et le dénominateur par "), f("\\sqrt{2}"), t(").")] },
    { label: "Conclusion", sousQuestion: "d", fragments: [f(valeursFinalesLatex(e)), t(".")] },
    quotient
      ? { label: "Piège", sousQuestion: "c", fragments: [t("Additionner les arguments d'un quotient : "), f("\\arg\\dfrac{z_1}{z_2}=\\arg z_1-\\arg z_2"), t(", dans cet ordre ; une somme donnerait un autre angle, donc d'autres valeurs de "), f(trigLatex("cos", th)), t(" et "), f(trigLatex("sin", th)), t(".")] }
      : { label: "Piège", sousQuestion: "d", fragments: [t("Oublier le module en identifiant : "), f("r\\cos\\theta=\\mathrm{Re}(z)"), t(", donc "), f("\\cos\\theta=\\dfrac{\\mathrm{Re}(z)}{r}"), t(" ; ici "), f("r\\neq1"), t(", recopier la partie réelle ne donne pas le cosinus.")] },
  ];
  return lignes;
}

function difficulte(): 1 | 2 | 3 {
  return 3;
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
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 15,
  profilInstance: profilDeuxEcritures,
};
