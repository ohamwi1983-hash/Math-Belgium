import type { ExerciceLorenzGini, ExerciceLorenzLecture } from "../../core6e/lorenzGini";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { phasesPourExercice } from "../../moteur6e/typesLorenzGini";
import type { PhaseLorenz } from "../../moteur6e/typesLorenzGini";
import {
  blocDonnees,
  consigneEcran,
  consigneGenerale,
  formatReponseAttenduePhaseLatex,
  reponseChoix,
} from "../../ui6e/formatLorenzGini";
import { decimalLatex } from "../../ui6e/nombresExactsIntegrales";
import { figureEnonceSvg } from "../../ui6e/figureLorenzGini";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLorenzGini } from "./index";
import type { IdVarianteLorenzGini } from "./index";
import { VARIANTES_CALCULATRICE_LORENZ, profilLorenzGini } from "./profilEvaluation";
import { correctionDetailleeLorenzGini } from "./corrigeDetaille";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceLorenzGini>` de `6gen82` « Courbe de Lorenz et
 * coefficient de Gini » — méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - Énoncé papier : le contexte (consigne générale de l'écran), le modèle, la figure SANS aire
 *   colorée (`enteteHtml`) et la consigne globale. Lecture : deux VRAIES questions (a) lire et
 *   interpréter L(p), b) coefficient de Gini) ; comparaison et paramètre : une seule demande.
 * - Corrigé : une étape par écran (lettres a, b, c… dans l'ordre des écrans), valeurs tirées des
 *   MÊMES fonctions que l'écran (`formatReponseAttenduePhaseLatex`, `reponseChoix`), une ligne
 *   « Piège » ciblée, la région entre la diagonale et la courbe colorée en `figureHtml`.
 * - Version aménagée : même énoncé (seule la mise en page change).
 */

const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);
const LETTRES = "abcdefgh";

function liste(formules: string[]): FragmentConsigne[] {
  return formules.flatMap((x, i) => (i === 0 ? [f(x)] : [t(" ; "), f(x)]));
}

function reponseEtape(e: ExerciceLorenzGini, phase: PhaseLorenz): FragmentConsigne[] {
  return phase === "interpretation" || phase === "verdict" ? reponseChoix(e, phase) : liste(formatReponseAttenduePhaseLatex(e, phase));
}

// ============================================================================
// Énoncés.
// ============================================================================

function donnees(e: ExerciceLorenzGini): FragmentConsigne[] {
  return [t(" "), ...liste(blocDonnees(e)), t(".")];
}

function demandeGlobale(e: ExerciceLorenzGini): FragmentConsigne[] {
  switch (e.variante) {
    case "lecture":
      return [];
    case "comparaison": {
      const question = e.contexte === "pays" ? "Dans quel pays les revenus sont-ils répartis de la façon la plus inégalitaire ?" : "La réforme a-t-elle réduit ou accru les inégalités de revenus ?";
      return [t(` Calcule le coefficient de Gini de chaque répartition (valeurs exactes, puis arrondies au millième). Selon ce coefficient, ${question.charAt(0).toLowerCase()}${question.slice(1)}`)];
    }
    case "parametre":
      return [t(" Détermine la valeur de a qui permet d'atteindre ce coefficient de Gini.")];
  }
}

function entetePapier(e: ExerciceLorenzGini): FragmentConsigne[] {
  return [...consigneGenerale(e), ...donnees(e), ...demandeGlobale(e)];
}

/** Titres des étapes du corrigé (« Étape n — … »), rédigés pour le papier. */
function titreEtape(e: ExerciceLorenzGini, phase: PhaseLorenz): FragmentConsigne[] {
  if (phase === "interpretation") return [t("Interprète ce résultat par une phrase.")];
  if (phase === "verdict") return [t("Conclus à l'aide des deux coefficients de Gini.")];
  return consigneEcran(e, phase);
}

function construireEnonce(e: ExerciceLorenzGini): SectionExercice {
  return { enteteFragments: entetePapier(e), enteteHtml: figureEnonceSvg(e), questions: phasesPourExercice(e).map((phase) => ({ consigne: titreEtape(e, phase) })) };
}

function construireCorrection(e: ExerciceLorenzGini): BlocCorrection[] {
  return phasesPourExercice(e).map((phase, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponseEtape(e, phase)] }));
}

function questionsLecture(e: ExerciceLorenzLecture) {
  const p = decimalLatex(e.p, 3);
  return [{ consigne: [t("Calcule "), f(`L(${p})`), t(" (valeur exacte, puis arrondie au millième si nécessaire) et interprète ce résultat par une phrase.")] }, { consigne: [t("Calcule le coefficient de Gini de cette répartition (valeur exacte, puis arrondie au millième).")] }];
}

function minusculeInitiale(fs: FragmentConsigne[]): FragmentConsigne[] {
  return fs.map((x, i) => (i === 0 && x.type === "texte" ? { ...x, valeur: x.valeur.charAt(0).toLowerCase() + x.valeur.slice(1) } : x));
}

function reponseBreve(e: ExerciceLorenzGini): FragmentConsigne[] {
  switch (e.variante) {
    case "lecture":
      return [t("a) "), ...reponseEtape(e, "valeur"), t(" : "), ...minusculeInitiale(reponseChoix(e, "interpretation")), t(" b) "), ...reponseEtape(e, "gini"), t(".")];
    case "comparaison":
      return [...reponseEtape(e, "ginis"), t(". "), ...reponseChoix(e, "verdict")];
    case "parametre":
      return [...reponseEtape(e, "valeurA"), t(".")];
  }
}

function enoncePapier(e: ExerciceLorenzGini): EnoncePapier {
  if (e.variante === "lecture") {
    return { section: { enteteFragments: entetePapier(e), enteteHtml: figureEnonceSvg(e), questions: questionsLecture(e) }, etapesParQuestion: [["a", "b"], ["c", "d"]], reponseBreve: reponseBreve(e) };
  }
  return { section: { enteteFragments: entetePapier(e), enteteHtml: figureEnonceSvg(e), questions: [] }, reponseBreve: reponseBreve(e) };
}

// ============================================================================
// Corrigé détaillé.
// ============================================================================

const correctionDetaillee = correctionDetailleeLorenzGini;

function difficulte(e: ExerciceLorenzGini): 1 | 2 | 3 {
  if (e.variante === "lecture") return e.courbe.famille === "expo" ? 3 : 2;
  return 3;
}

// ============================================================================
// Barème (poids, somme 4).
// ============================================================================

function bareme(e: ExerciceLorenzGini): BaremeExercice {
  const r = (phase: PhaseLorenz) => reponseEtape(e, phase);
  const piegeFacteur2 = { description: [t("Facteur 2 oublié (aire donnée comme coefficient de Gini)")], cout: "−1" };
  const piegeSousCourbe = { description: [t("Aire sous la courbe de Lorenz au lieu de l'aire entre la diagonale et la courbe")], cout: "−1" };
  const accepte = [[t("Valeur exacte ou arrondie au millième ; pourcentage équivalent")]];
  switch (e.variante) {
    case "lecture":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          { sousQuestion: "a", critere: r("valeur"), points: 0.75 },
          { sousQuestion: "b", critere: [t("Phrase : "), ...r("interpretation")], points: 0.75 },
          { sousQuestion: "c", critere: [t("Aire posée "), f("\\int_0^1\\left(x-L(x)\\right)dx"), t(" et calculée : "), ...r("aire")], points: 1.5 },
          { sousQuestion: "d", critere: r("gini"), points: 1 },
        ],
        erreursFrequentes: [
          { description: [t("Interprétation à l'envers (part de la population et part des revenus échangées)")], cout: "0 pt sur l'interprétation" },
          piegeSousCourbe,
          piegeFacteur2,
          { description: [t("Coefficient de Gini supérieur à 1 ou négatif, sans réaction")], cout: "−0,5" },
        ],
        reponsesAcceptees: accepte,
      };
    case "comparaison":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          ...e.courbes.map((_, i) => ({ sousQuestion: "a", critere: [f(formatReponseAttenduePhaseLatex(e, "aires")[i])], points: 1 })),
          ...e.courbes.map((_, i) => ({ sousQuestion: "b", critere: [f(formatReponseAttenduePhaseLatex(e, "ginis")[i])], points: 0.5 })),
          { sousQuestion: "c", critere: [t("Conclusion justifiée par les deux coefficients : "), ...r("verdict")], points: 1 },
        ],
        erreursFrequentes: [
          piegeSousCourbe,
          piegeFacteur2,
          { description: [t("Conclusion inversée (le plus grand coefficient de Gini pris pour le plus égalitaire)")], cout: "0 pt sur la conclusion" },
          { description: [t("Conclusion tirée de la figure seule, sans les coefficients")], cout: "−0,5" },
        ],
        reponsesAcceptees: accepte,
      };
    case "parametre":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          { sousQuestion: "a", critere: r("aireA"), points: 1.5 },
          { sousQuestion: "b", critere: r("giniA"), points: 1 },
          { sousQuestion: "c", critere: [...r("valeurA"), t(", avec la vérification "), f("0\\leq a\\leq 1")], points: 1.5 },
        ],
        erreursFrequentes: [
          { description: [t("Aire égalée à la valeur visée (facteur 2 oublié)")], cout: "−1" },
          { description: [t("Valeur de a hors de [0 ; 1] acceptée sans remarque")], cout: "−0,5" },
          { description: [t("Erreur dans la mise en évidence de a ou dans la primitive")], cout: "−1" },
        ],
        reponsesAcceptees: [[t("Fraction ou décimal équivalent")]],
      };
  }
}

export const adaptateurEvaluationLorenzGini: AdaptateurFeuilleExercices<ExerciceLorenzGini> = {
  titreDocument: "Courbe de Lorenz et coefficient de Gini — Évaluation",
  nomFichierBase: "lorenz-gini",
  genererInstance: genererExerciceLorenzGini,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteLorenzGini),
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 10,
  profilInstance: profilLorenzGini,
  calculatriceIndispensable: VARIANTES_CALCULATRICE_LORENZ,
};
