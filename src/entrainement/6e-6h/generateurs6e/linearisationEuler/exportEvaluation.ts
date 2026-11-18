import type { ExerciceLinearisation } from "../../core6e/linearisationEuler";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, EnoncePapier, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { phasesPourExercice } from "../../moteur6e/typesLinearisationEuler";
import type { PhaseLinearisation } from "../../moteur6e/typesLinearisationEuler";
import {
  consigneEcran,
  consigneGenerale,
  integraleLatex,
  lineaireLatex,
  nomLatex,
  primitiveLatex,
  reponseFragments,
  valeurIntegraleLatex,
} from "../../ui6e/formatLinearisationEuler";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLinearisation } from "./index";
import type { IdVarianteLinearisation } from "./index";
import { LIBELLE_CAS_LINEARISATION, profilLinearisation } from "./profilEvaluation";
import { correctionDetailleeLinearisation } from "./corrigeDetaille";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceLinearisation>` de `6gen93` « Linéariser avec les
 * formules d'Euler » — méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - Énoncé papier, degrés 2 à 4 : « Linéarise f(x) = … grâce aux formules d'Euler » (une seule
 *   demande) ; les quatre écrans (K, binôme, regroupement, forme linéarisée) deviennent les étapes
 *   du corrigé.
 * - Énoncé papier, application : trois VRAIES questions — a) linéariser, b) une primitive,
 *   c) l'intégrale exacte.
 * - Corrigé : une étape par écran (lettres a, b, c…), valeurs tirées des MÊMES fonctions que
 *   l'écran (`ui6e/formatLinearisationEuler.ts`), une ligne « Piège » ciblée.
 * - Aucune figure. Version aménagée : même énoncé (seule la mise en page change).
 */

const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);

// ============================================================================
// Énoncés.
// ============================================================================

function construireEnonce(e: ExerciceLinearisation): SectionExercice {
  return { enteteFragments: consigneGenerale(e), questions: phasesPourExercice(e).map((phase) => ({ consigne: consigneEcran(e, phase) })) };
}

function construireCorrection(e: ExerciceLinearisation): BlocCorrection[] {
  return phasesPourExercice(e).map((phase, i) => ({ type: "paragraphe", fragments: [t(`${"abcd"[i]}) `), ...reponseFragments(e, phase)] }));
}

function reponseBreve(e: ExerciceLinearisation): FragmentConsigne[] {
  if (e.variante === "application") {
    return [t("a) "), f(`f(x)=${lineaireLatex(e)}`), t(" ; b) "), f(`F(x)=${primitiveLatex(e)}`), t(" ; c) "), f(`I=${valeurIntegraleLatex(e)}`), t(".")];
  }
  return [f(`${nomLatex(e)}=${lineaireLatex(e)}`)];
}

function enoncePapier(e: ExerciceLinearisation): EnoncePapier {
  if (e.variante === "application") {
    return {
      section: {
        enteteFragments: [t("On considère la fonction "), f(`f(x)=${nomLatex(e)}`), t(".")],
        questions: [
          { consigne: [t("Linéarise "), f("f(x)"), t(" à l'aide des formules d'Euler.")] },
          { consigne: [t("Déduis-en une primitive "), f("F"), t(" de "), f("f"), t(".")] },
          { consigne: [t("Calcule la valeur exacte de "), f(integraleLatex(e)), t(".")] },
        ],
      },
      etapesParQuestion: [["a"], ["b"], ["c"]],
      reponseBreve: reponseBreve(e),
    };
  }
  return { section: { enteteFragments: consigneGenerale(e), questions: [] }, reponseBreve: reponseBreve(e) };
}

// ============================================================================
// Corrigé détaillé.
// ============================================================================

const correctionDetaillee = correctionDetailleeLinearisation;

function difficulte(e: ExerciceLinearisation): 1 | 2 | 3 {
  return e.variante === "degre4" || e.variante === "application" ? 3 : 2;
}

// ============================================================================
// Barème (somme 4).
// ============================================================================

const ERREUR_I = { description: [t("Puissance de "), f("2i"), t(" ou de "), f("i"), t(" mal calculée (signe de K faux)")], cout: "−1" };
const ERREUR_2 = { description: [t("Facteur 2 oublié en regroupant ("), f("2\\cos(kx)"), t(" ou "), f("2i\\sin(kx)"), t(")")], cout: "−0,5" };
const ACCEPTEES = [[t("Toute écriture équivalente de la forme linéarisée (fractions séparées ou dénominateur commun)")]];

function bareme(e: ExerciceLinearisation): BaremeExercice {
  const r = (phase: PhaseLinearisation) => reponseFragments(e, phase);
  if (e.variante === "application") {
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [t("Linéarisation par Euler : "), ...r("lineaire")], points: 1.5 },
        { sousQuestion: "b", critere: [t("Primitive : "), f(`F(x)=${primitiveLatex(e)}`)], points: 1 },
        { sousQuestion: "c", critere: [t("Intégrale exacte : "), f(`I=${valeurIntegraleLatex(e)}`)], points: 1.5 },
      ],
      erreursFrequentes: [
        ERREUR_I,
        ERREUR_2,
        { description: [t("Primitive sans le facteur "), f("\\tfrac{1}{k}"), t(" ou sans le signe − devant "), f("\\cos(kx)")], cout: "−0,5" },
        { description: [t("Valeur approchée au lieu de la valeur exacte")], cout: "−0,5" },
      ],
      reponsesAcceptees: [...ACCEPTEES, [t("Primitive à une constante près")]],
    };
  }
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Formules d'Euler et facteur : "), ...r("euler")], points: 1 },
      { sousQuestion: "b", critere: [t("Développement par le binôme : "), ...r("developper")], points: 1 },
      { sousQuestion: "c", critere: [t("Regroupement : "), ...r("regrouper")], points: 1 },
      { sousQuestion: "d", critere: [t("Forme linéarisée : "), ...r("lineaire")], points: 1 },
    ],
    erreursFrequentes: [ERREUR_I, ERREUR_2, { description: [t("Signe oublié dans le développement d'une différence")], cout: "−0,5" }],
    reponsesAcceptees: ACCEPTEES,
  };
}

export const adaptateurEvaluationLinearisationEuler: AdaptateurFeuilleExercices<ExerciceLinearisation> = {
  titreDocument: "Linéariser avec les formules d'Euler — Évaluation",
  nomFichierBase: "linearisation-euler",
  genererInstance: genererExerciceLinearisation,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteLinearisation),
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 10,
  profilInstance: profilLinearisation,
  libelleCasParticulier: LIBELLE_CAS_LINEARISATION,
};
