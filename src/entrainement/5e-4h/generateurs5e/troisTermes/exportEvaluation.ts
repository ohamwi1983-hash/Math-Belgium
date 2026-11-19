import type { ExerciceTroisTermes } from "../../core5e/troisTermes.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, ErreurFrequente, EnoncePapier, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import type { CriteresDifficulte } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/fragmentsDocx";
import { phasesJouees } from "../../moteur5e/typesTroisTermes";
import { conclusionSolutions, consigneEcran, consigneGenerale, equationSimplifieeLatex, reponseBreveFragments, reponseFragments } from "../../ui5e/formatTroisTermes";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceTroisTermes } from "./index";
import type { IdVarianteTroisTermes } from "./index";
import { profilTroisTermes } from "./profilEvaluation";
import { correctionDetailleeTroisTermes } from "./corrigeDetaille";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceTroisTermes>` de `5gen46` « Trois termes
 * consécutifs » — méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - Énoncé papier : l'énoncé de l'écran tel quel (les trois expressions, la question « pour quelle(s)
 *   valeur(s) de x… », la demande des termes et de la raison) ; les quatre étapes d'apprentissage
 *   (relation, équation réduite, valeurs de x, termes) passent dans le corrigé.
 * - Corrigé détaillé « comme au tableau » : `corrigeDetaille.ts` (partagé avec l'appli), une étape
 *   par écran joué (lettres a, b, c, d ; pas d'étape d quand aucune valeur ne convient).
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
/** Critères du niveau de difficulté (grille commune, `export/niveauDifficulte.ts`) : méthode et
 * piège jugés par variante (analyse des cinq chapitres), étapes lues sur le corrigé détaillé. */
function criteresDifficulte(e: ExerciceTroisTermes): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeTroisTermes(e)), methode: 0, piege: e.variante === "geometrique" ? 1 : 0 };
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
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeTroisTermes,
  bareme,
  enoncePapier,
  profilInstance: profilTroisTermes,
};
