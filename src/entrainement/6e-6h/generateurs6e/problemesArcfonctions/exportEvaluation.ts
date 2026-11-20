import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/corrigeTableau";
import type { ExerciceProblemesArcfonctions, VarianteProblemesArcfonctions } from "../../core6e/problemesArcfonctions";
import { PHASES_PROBLEMES, consigneGenerale, question, reponse } from "../../ui6e/formatProblemesArcfonctions";
import { figureProbleme } from "../../ui6e/figureProblemesArcfonctions";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceProblemesArcfonctions } from "./index";
import { correctionDetailleeProblemesArcfonctions } from "./corrigeDetaille";

/**
 * Adaptateur papier de `6gen156` « Problèmes avec arcfonctions ». Trois VRAIES questions (une par
 * écran) : a), b), c) ; schéma dans l'énoncé (aucune valeur cherchée n'y figure). Calculatrice
 * indispensable (angles en degrés au dixième, longueurs au centimètre).
 */

type E = ExerciceProblemesArcfonctions;
const t = texte;
const f = latex;
const LETTRES = "abc";

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: consigneGenerale(e), enteteHtml: figureProbleme(e), questions: PHASES_PROBLEMES.map((p) => ({ consigne: question(e, p, true) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return PHASES_PROBLEMES.flatMap((p, i) => [t(`${i > 0 ? " ; " : ""}${LETTRES[i]}) `), ...reponse(e, p)]);
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: { enteteFragments: consigneGenerale(e), enteteHtml: figureProbleme(e), questions: PHASES_PROBLEMES.map((p) => ({ consigne: question(e, p, true) })) },
    etapesParQuestion: [["a"], ["b"], ["c"]],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return PHASES_PROBLEMES.map((p, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponse(e, p)] }));
}

function criteresDifficulte(e: E): CriteresDifficulte {
  // Méthode : l'élève construit le modèle de l'angle de vue (différence de deux arctan, dérivée) → 2 ;
  // ailleurs la loi est donnée ou le triangle rectangle s'impose → 1. Piège dans les données : le
  // verdict « rayon réfracté ? » (constant dans la variante, oui comme non). Calculatrice → nombres 1.
  return { ...etapesDuCorrige(correctionDetailleeProblemesArcfonctions(e), []), methode: e.variante === "angle-de-vue" ? 2 : 1, piege: e.variante === "reflexion-totale" ? 1 : 0, nombres: 1 };
}

function bareme(e: E): BaremeExercice {
  const criteres: BaremeExercice["criteres"] = (() => {
    switch (e.variante) {
      case "refraction":
        return [
          { sousQuestion: "a", critere: [t("Loi isolée en "), f("\\sin\\theta_2"), t(", arcsin : "), ...reponse(e, "q1")], points: 1.5 },
          { sousQuestion: "b", critere: [f("\\sin\\theta_1"), t(" isolé : "), ...reponse(e, "q2")], points: 1.5 },
          { sousQuestion: "c", critere: [t("Incidence rasante, "), f("\\sin 90^{\\circ}=1"), t(" : "), ...reponse(e, "q3")], points: 1 },
        ];
      case "reflexion-totale":
        return [
          { sousQuestion: "a", critere: [f("\\theta_2=90^{\\circ}"), t(" dans la loi : "), ...reponse(e, "q1")], points: 1.5 },
          { sousQuestion: "b", critere: [t("Angle de réfraction : "), ...reponse(e, "q2")], points: 1 },
          { sousQuestion: "c", critere: [t("Sinus comparé à 1 (ou incidence comparée à l'angle limite) et conclusion : "), ...reponse(e, "q3")], points: 1.5 },
        ];
      case "angle-de-vue":
        return [
          { sousQuestion: "a", critere: [t("Modèle "), f("\\theta(x)=\\arctan\\frac{b}{x}-\\arctan\\frac{a}{x}"), t(" et valeur : "), ...reponse(e, "q1")], points: 1.5 },
          { sousQuestion: "b", critere: [t("Dérivée, "), f("\\theta'(x)=0"), t(", maximum justifié : "), ...reponse(e, "q2")], points: 1.5 },
          { sousQuestion: "c", critere: [t("Angle maximal : "), ...reponse(e, "q3")], points: 1 },
        ];
      case "echelle":
        return [
          { sousQuestion: "a", critere: [t("arccos du rapport côté adjacent / hypoténuse : "), ...reponse(e, "q1")], points: 1.5 },
          { sousQuestion: "b", critere: [f("d=L\\cos 75^{\\circ}"), t(" : "), ...reponse(e, "q2")], points: 1 },
          { sousQuestion: "c", critere: [t("arcsin du rapport côté opposé / hypoténuse : "), ...reponse(e, "q3")], points: 1.5 },
        ];
    }
  })();
  return {
    reponseFinale: reponseBreve(e),
    criteres,
    erreursFrequentes: [
      { description: [t("Calculatrice réglée en radians")], cout: "−0,5 par valeur, une seule fois" },
      { description: [t("Mauvaise arcfonction (arcsin au lieu de arccos…) ou indices inversés")], cout: "0 pt sur la valeur" },
      { description: [t("Sinus donné sans appliquer arcsin")], cout: "moitié des points de la valeur" },
    ],
    reponsesAcceptees: [[t("Écart d'un dixième de degré (ou d'un centimètre) dû aux arrondis ; valeur exacte acceptée pour une distance")]],
  };
}

export function profilProblemesArcfonctions(e: E): ProfilInstance {
  return { casParticulier: null, calcul: "calculatrice", forme: e.variante };
}

export const adaptateurEvaluationProblemesArcfonctions: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Problèmes avec arcfonctions — Évaluation",
  nomFichierBase: "problemes-arcfonctions",
  genererInstance: genererExerciceProblemesArcfonctions,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as VarianteProblemesArcfonctions),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeProblemesArcfonctions,
  bareme,
  enoncePapier,
  profilInstance: profilProblemesArcfonctions,
  calculatriceIndispensable: true,
};
