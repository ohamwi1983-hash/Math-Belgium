import { analyser } from "../../core5e/troisTermes.types";
import type { ExerciceTroisTermes } from "../../core5e/troisTermes.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EtapeCorrection,
  ErreurFrequente,
  EnoncePapier,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { phasesJouees } from "../../moteur5e/typesTroisTermes";
import type { PhaseTroisTermes } from "../../moteur5e/typesTroisTermes";
import { aideNiveau1, calculSolutionsFragments, conclusionSolutions, consigneEcran, consigneGenerale, equationSimplifieeLatex, reponseBreveFragments, reponseFragments } from "../../ui5e/formatTroisTermes";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceTroisTermes } from "./index";
import type { IdVarianteTroisTermes } from "./index";
import { profilTroisTermes } from "./profilEvaluation";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceTroisTermes>` de `5gen46` « Trois termes
 * consécutifs » — méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - Énoncé papier : l'énoncé de l'écran tel quel (les trois expressions, la question « pour quelle(s)
 *   valeur(s) de x… », la demande des termes et de la raison) ; les quatre étapes d'apprentissage
 *   (relation, équation réduite, valeurs de x, termes) passent dans le corrigé.
 * - Corrigé : une étape par écran joué (lettres a, b, c, d dans l'ordre des écrans ; pas d'étape d
 *   quand aucune valeur ne convient), valeurs tirées des MÊMES fonctions que l'écran (`aideNiveau1`,
 *   `reponseFragments`), une ligne « Piège » ciblée.
 * - Étoiles et durée fixées par la VARIANTE seulement : elles ne trahissent jamais le nombre de
 *   valeurs qui conviennent. Aucune figure, toutes les valeurs exactes. Version aménagée : même énoncé.
 */

const t = (valeur: string): FragmentConsigne => texte(valeur);
const f = (valeur: string): FragmentConsigne => latex(valeur);
const LETTRES = "abcd";

// ============================================================================
// Énoncés.
// ============================================================================

function construireEnonce(e: ExerciceTroisTermes): SectionExercice {
  return { enteteFragments: consigneGenerale(e), questions: phasesJouees(e).map((phase) => ({ consigne: consigneEcran(e, phase) })) };
}

function reponseBreve(e: ExerciceTroisTermes): FragmentConsigne[] {
  return reponseBreveFragments(e);
}

function enoncePapier(e: ExerciceTroisTermes): EnoncePapier {
  return { section: { enteteFragments: consigneGenerale(e), questions: [] }, reponseBreve: reponseBreve(e) };
}

function construireCorrection(e: ExerciceTroisTermes): BlocCorrection[] {
  return phasesJouees(e).map((phase, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponseFragments(e, phase)] }));
}

/** ★★ arithmétique (premier degré) ; ★★★ géométrique (second degré possible, solutions à vérifier). */
function difficulte(e: ExerciceTroisTermes): 1 | 2 | 3 {
  return e.variante === "arithmetique" ? 2 : 3;
}

// ============================================================================
// Corrigé détaillé.
// ============================================================================

/** La ligne « Piège », sur l'étape où l'erreur classique se commet. */
function piege(e: ExerciceTroisTermes): { phase: PhaseTroisTermes; fragments: FragmentConsigne[] } {
  if (e.variante === "arithmetique") {
    return { phase: "relation", fragments: [t("Le terme du milieu n'est pas la somme de ses voisins mais leur MOYENNE : "), f("b=\\dfrac{a+c}{2}"), t(", d'où "), f("2b=a+c"), t(" (et non "), f("b=a+c"), t(").")] };
  }
  const an = analyser(e);
  if (an.ecartees.length > 0) {
    return { phase: "solutions", fragments: [t("Une solution de l'équation n'est pas forcément une réponse : si elle annule un terme, on l'écarte, car une suite géométrique ne contient aucun terme nul (et "), f("b^2=a\\times c"), t(" est alors vraie sans que les nombres forment une suite géométrique).")] };
  }
  return { phase: "relation", fragments: [t("Le terme du milieu vérifie "), f("b^2=a\\times c"), t(" : pas "), f("b=a\\times c"), t(", et mieux vaut éviter "), f("b=\\sqrt{a\\times c}"), t(", fausse quand "), f("b"), t(" est négatif.")] };
}

function correctionDetaillee(e: ExerciceTroisTermes): EtapeCorrection[] {
  const p = piege(e);
  return phasesJouees(e).flatMap((phase, i): EtapeCorrection[] => {
    const sousQuestion = LETTRES[i];
    const aide = aideNiveau1(e, phase);
    const lignes: EtapeCorrection[] = [
      { label: "Méthode", sousQuestion, fragments: [t(aide.texte), ...(aide.latex ? [t(" "), f(aide.latex)] : [])] },
      { label: "Calcul", sousQuestion, fragments: phase === "solutions" ? calculSolutionsFragments(e) : reponseFragments(e, phase) },
    ];
    if (phase === "solutions") lignes.push({ label: "Conclusion", sousQuestion, fragments: conclusionSolutions(e) });
    if (p.phase === phase) lignes.push({ label: "Piège", sousQuestion, fragments: p.fragments });
    return lignes;
  });
}

// ============================================================================
// Barème.
// ============================================================================

function bareme(e: ExerciceTroisTermes): BaremeExercice {
  const phases = phasesJouees(e);
  const avecTermes = phases.includes("termes");
  const relation = e.variante === "arithmetique" ? "2b=a+c" : "b^2=a\\times c";
  const criteres = [
    { sousQuestion: "a", critere: [t("Relation entre trois termes consécutifs : "), f(relation)], points: avecTermes ? 0.5 : 1 },
    { sousQuestion: "b", critere: [t("Équation développée et réduite : "), f(equationSimplifieeLatex(e))], points: avecTermes ? 1 : 1.5 },
    {
      sousQuestion: "c",
      critere: [t(e.variante === "geometrique" ? "Équation résolue et chaque solution vérifiée (aucun terme nul) : " : "Équation résolue : "), ...conclusionSolutions(e)],
      points: 1.5,
    },
    ...(avecTermes ? [{ sousQuestion: "d", critere: [t("Trois termes et raison pour chaque valeur : "), ...reponseBreveFragments(e)], points: 1 }] : []),
  ];
  const erreurs: ErreurFrequente[] =
    e.variante === "arithmetique"
      ? [
          { description: [t("Relation "), f("b=a+c"), t(" au lieu de "), f("2b=a+c")], cout: "−1, suite notée sans double pénalité" },
          { description: [t("Le 2 n'est pas distribué à tous les termes de b, ou erreur de signe en passant a + c à gauche")], cout: "−0,5" },
          { description: [t("Raison calculée à l'envers ("), f("a-b"), t(")")], cout: "−0,25" },
        ]
      : [
          { description: [t("Relation "), f("b=a\\times c"), t(" ou "), f("2b=a+c"), t(" au lieu de "), f("b^2=a\\times c")], cout: "−1, suite notée sans double pénalité" },
          { description: [t("Double produit oublié en développant "), f("b^2")], cout: "−0,5" },
          { description: [t("Solution qui annule un terme gardée, ou une seule des deux solutions donnée")], cout: "−0,5" },
          { description: [t("Raison calculée à l'envers ("), f("\\dfrac{a}{b}"), t(")")], cout: "−0,25" },
        ];
  return {
    reponseFinale: reponseBreve(e),
    criteres,
    erreursFrequentes: erreurs,
    reponsesAcceptees: [
      e.variante === "arithmetique" ? [t("Relation écrite "), f("b-a=c-b")] : [t("Relation écrite "), f("\\dfrac{b}{a}=\\dfrac{c}{b}"), t(" (puis produit en croix)")],
      [t("Équation réduite multipliée par un nombre non nul")],
    ],
  };
}

export const adaptateurEvaluationTroisTermes: AdaptateurFeuilleExercices<ExerciceTroisTermes> = {
  titreDocument: "Trois termes consécutifs — Évaluation",
  nomFichierBase: "trois-termes-consecutifs",
  genererInstance: genererExerciceTroisTermes,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteTroisTermes),
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 8,
  profilInstance: profilTroisTermes,
};
