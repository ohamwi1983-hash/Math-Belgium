import type { ExerciceParadoxesProbabilites } from "../../core6e/paradoxesProbabilites.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CriteresDifficulte,
  EnoncePapier,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { correctionDetailleeParadoxes } from "./corrigeDetaille";
import {
  blocDonnees,
  conclusionCorrecte,
  consigneGenerale,
  formatReponseAttenduePhaseLatex,
} from "../../ui6e/formatParadoxesProbabilites";
import { VARIANTES_CALCULATRICE_PARADOXES, profilParadoxesProbabilites } from "../profilsEvaluationParadoxes";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceParadoxesProbabilites } from "./index";
import type { IdVarianteParadoxesProbabilites } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceParadoxesProbabilites>` de `6gen76` « Quand
 * l'intuition se trompe » — méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - Énoncé papier : l'histoire (consigne générale de l'écran, raisonnement de Méré compris) et UNE
 *   consigne globale. L'écran de PRÉDICTION (non noté, propre au générateur interactif) disparaît ;
 *   les trois autres écrans deviennent les étapes du corrigé (« Étape n — … »), lettres a, b, c.
 * - Corrigé : valeurs tirées des MÊMES fonctions que l'écran (`formatReponseAttenduePhaseLatex`,
 *   `conclusionCorrecte`), une ligne « Piège » par étape où il y en a un, l'arbre en `figureHtml`
 *   (Monty Hall, deux enfants).
 * - Version aménagée : même énoncé (le pipeline ne change que la mise en page).
 */

const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);

type Etape = "modeliser" | "calculer" | "conclure";
const ETAPES: Etape[] = ["modeliser", "calculer", "conclure"];
const LETTRES: Record<Etape, string> = { modeliser: "a", calculer: "b", conclure: "c" };

function liste(formules: string[]): FragmentConsigne[] {
  return formules.flatMap((x, i) => (i === 0 ? [f(x)] : [t(" ; "), f(x)]));
}


// ============================================================================
// Énoncé papier.
// ============================================================================

function entetePapier(e: ExerciceParadoxesProbabilites): FragmentConsigne[] {
  const histoire = consigneGenerale(e);
  switch (e.famille) {
    case "mere":
      return [
        ...histoire,
        t(" "),
        f(blocDonnees(e)[0]),
        t(". Calcule la probabilité de gagner chaque pari (valeur exacte, puis arrondie au millième). Chaque pari est-il favorable au joueur ? Lequel est le meilleur ? Que penser du raisonnement de Méré ?"),
      ];
    case "montyHall":
      return [...histoire, t(" Calcule "), f("P(G)"), t(" et "), f("P(C)"), t(" (valeurs exactes), puis dis s'il vaut mieux garder sa porte ou en changer.")];
    case "deuxEnfants":
      return [...histoire, t(" Calcule-la en justifiant à l'aide d'issues équiprobables (sexe de l'aîné, puis du cadet).")];
  }
}

/** Titres d'étapes du corrigé (« Étape n — … »), rédigés pour le papier. */
function titreEtape(e: ExerciceParadoxesProbabilites, etape: Etape): FragmentConsigne[] {
  switch (e.famille) {
    case "mere":
      if (etape === "modeliser") return [t("Calcule "), f("P(\\overline{A_1})"), t(" et "), f("P(\\overline{A_2})"), t(" en passant par l'événement contraire « aucun ».")];
      if (etape === "calculer") return [t("Déduis-en "), f("P(A_1)"), t(" et "), f("P(A_2)"), t(".")];
      return [t("Conclus : quels paris sont favorables au joueur, et lequel est le meilleur ?")];
    case "montyHall":
      if (etape === "modeliser") return [t("Construis l'arbre de ce que sait l'animateur : donne "), f("P(V)"), t(" et "), f("P(C\\mid\\overline{V})"), t(".")];
      if (etape === "calculer") return [t("Calcule "), f("P(G)"), t(" et "), f("P(C)"), t(".")];
      return [t("Conclus : faut-il garder sa porte ou en changer ?")];
    case "deuxEnfants":
      if (etape === "modeliser") return [t("Écris l'univers des issues équiprobables, puis les événements "), f("A"), t(" et "), f("B"), t(".")];
      if (etape === "calculer") return [t("Calcule "), f("P(B\\mid A)"), t(".")];
      return [t("Conclus en justifiant.")];
  }
}

function reponseEtape(e: ExerciceParadoxesProbabilites, etape: Etape): FragmentConsigne[] {
  return etape === "conclure" ? conclusionCorrecte(e) : liste(formatReponseAttenduePhaseLatex(e, etape));
}

function construireEnonce(e: ExerciceParadoxesProbabilites): SectionExercice {
  return { enteteFragments: entetePapier(e), questions: ETAPES.map((etape) => ({ consigne: titreEtape(e, etape) })) };
}

function construireCorrection(e: ExerciceParadoxesProbabilites): BlocCorrection[] {
  return ETAPES.map((etape) => ({ type: "paragraphe", fragments: [t(`${LETTRES[etape]}) `), ...reponseEtape(e, etape)] }));
}

function reponseBreve(e: ExerciceParadoxesProbabilites): FragmentConsigne[] {
  return [...liste(formatReponseAttenduePhaseLatex(e, "calculer")), t(". "), ...conclusionCorrecte(e), t(".")];
}

function enoncePapier(e: ExerciceParadoxesProbabilites): EnoncePapier {
  return { section: { enteteFragments: entetePapier(e), questions: [] }, reponseBreve: reponseBreve(e) };
}

// ============================================================================
// Corrigé détaillé.
// ============================================================================







// ============================================================================
// Barème (poids, somme 4).
// ============================================================================

/** Niveau (`niveauDifficulte.ts`) : modéliser et calculer transforment, conclure est une décision qui
 * relit les valeurs calculées (lecture) ; méthode 2 pour Monty Hall (modéliser le geste de
 * l'animateur), 1 sinon ; piège 1 partout (l'intuition de l'énoncé est le piège : proportionnalité de
 * Méré, portes « équiprobables », compositions « équiprobables ») ; nombres : Méré (calculatrice). */
function criteresDifficulte(e: ExerciceParadoxesProbabilites): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeParadoxes(e), ["c"]), methode: e.famille === "montyHall" ? 2 : 1, piege: 1, nombres: e.famille === "mere" ? 1 : 0 };
}

function bareme(e: ExerciceParadoxesProbabilites): BaremeExercice {
  const m = formatReponseAttenduePhaseLatex(e, "modeliser");
  const c = formatReponseAttenduePhaseLatex(e, "calculer");
  const conclusion = { sousQuestion: "c", critere: [t("Conclusion : "), ...conclusionCorrecte(e)], points: 1 };
  switch (e.famille) {
    case "mere":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          { sousQuestion: "a", critere: [t("Événement contraire du pari 1 : "), f(m[0])], points: 0.75 },
          { sousQuestion: "a", critere: [t("Événement contraire du pari 2 : "), f(m[1])], points: 0.75 },
          { sousQuestion: "b", critere: [f(c[0])], points: 0.75 },
          { sousQuestion: "b", critere: [f(c[1])], points: 0.75 },
          conclusion,
        ],
        erreursFrequentes: [
          { description: [t("Proportionnalité de Méré ("), f("4\\times\\frac{1}{6}"), t(") au lieu de l'événement contraire")], cout: "0 pt sur a) et b)" },
          { description: [t("Probabilité de « tous des 6 » au lieu de « aucun 6 »")], cout: "−1" },
          { description: [t("Donner "), f("P(\\overline{A})"), t(" comme probabilité de gain (oubli de "), f("1-\\ldots"), t(")")], cout: "−0,5" },
        ],
        reponsesAcceptees: [[t("Valeur exacte, valeur arrondie au millième ou pourcentage équivalent")], [t("Arrondi au centième si la comparaison à "), f("\\frac{1}{2}"), t(" reste correcte : la moitié des points du calcul")]],
      };
    case "montyHall":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          { sousQuestion: "a", critere: [f(m[0]), t(", justifiée (le geste de l'animateur ne change rien)")], points: 0.5 },
          { sousQuestion: "a", critere: [f(m[1])], points: 1 },
          { sousQuestion: "b", critere: [f(c[0])], points: 0.5 },
          { sousQuestion: "b", critere: [f(c[1])], points: 1 },
          conclusion,
        ],
        erreursFrequentes: [
          { description: [t("« Ça revient au même » : portes restantes jugées équiprobables")], cout: "0 pt sur b) et c)" },
          { description: [t("Oublier le facteur "), f("\\frac{1}{n-2}"), t(" quand plusieurs portes restent fermées")], cout: "−1" },
        ],
        reponsesAcceptees: [[t("Fractions équivalentes ou décimaux arrondis au millième")], [t("Dénombrement des cas équiprobables (voiture derrière chaque porte) au lieu d'un arbre, s'il aboutit aux mêmes probabilités")]],
      };
    case "deuxEnfants":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          { sousQuestion: "a", critere: [t("Univers de 4 issues équiprobables (aîné, cadet)")], points: 0.5 },
          { sousQuestion: "a", critere: [f(m[0]), t(" ; "), f(m[1])], points: 1 },
          { sousQuestion: "b", critere: [f(c[0])], points: 1.5 },
          conclusion,
        ],
        erreursFrequentes: [
          e.information === "auMoinsUn"
            ? { description: [t("Compositions (2 garçons, 1 garçon et 1 fille, 2 filles) jugées équiprobables : réponse "), f("\\frac{1}{2}")], cout: "0 pt sur a) et b)" }
            : { description: [t("Information traitée comme « au moins un » : réponse "), f("\\frac{1}{3}")], cout: "0 pt sur a) et b)" },
          { description: [t("Information ignorée : réponse "), f("\\frac{1}{4}")], cout: "0 pt sur a) et b)" },
        ],
        reponsesAcceptees: [[t("Calcul par la formule "), f("P(B\\mid A)=\\dfrac{P(A\\cap B)}{P(A)}"), t(" au lieu du dénombrement")], [t("Fraction ou décimal arrondi au millième")]],
      };
  }
}

export const adaptateurEvaluationParadoxesProbabilites: AdaptateurFeuilleExercices<ExerciceParadoxesProbabilites> = {
  titreDocument: "Quand l'intuition se trompe — Évaluation",
  nomFichierBase: "intuition-probabilites",
  genererInstance: genererExerciceParadoxesProbabilites,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteParadoxesProbabilites),
  construireEnonce,
  construireCorrection,
  reponseBreve,
  correctionDetaillee: correctionDetailleeParadoxes,
  criteresDifficulte,
  bareme,
  enoncePapier,
  profilInstance: profilParadoxesProbabilites,
  calculatriceIndispensable: VARIANTES_CALCULATRICE_PARADOXES,
};
