import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/corrigeTableau";
import type { ExerciceRelevesSinusoide } from "../../core5e/relevesSinusoide";
import { consigne, consigneGenerale, PHASES_RELEVES, questionDuree, reponse, situation, tableau } from "../../ui5e/formatRelevesSinusoide";
import { tableauHtml } from "../../ui5e/definitionRelevesSinusoide";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceRelevesSinusoide } from "./index";
import type { IdVarianteReleves } from "./index";
import { correctionDetailleeRelevesSinusoide } from "./corrigeDetaille";

/**
 * Adaptateur papier de `5gen57` « Modéliser des relevés réels par une sinusoïde ». Trois VRAIES
 * questions : a) construire le modèle (étapes a, b, c : lecture, A b ω, φ) ; b) la prévision
 * (étape d) ; c) la durée au-dessus du seuil (étape e). Tableau des relevés dans l'énoncé.
 */

type E = ExerciceRelevesSinusoide;
const t = texte;
const f = latex;
const LETTRES = "abcde";

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: consigneGenerale(e), enteteHtml: tableauHtml(tableau(e)), questions: PHASES_RELEVES.map((p) => ({ consigne: consigne(e, p) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return [t("a) "), ...reponse(e, "phase").slice(2), t(" ; b) "), ...reponse(e, "prevision"), t(" ; c) "), ...reponse(e, "duree"), t(".")];
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: {
      enteteFragments: situation(e),
      enteteHtml: tableauHtml(tableau(e)),
      questions: [
        { consigne: [t("Détermine "), f("A"), t(", "), f("b"), t(", "), f("\\omega"), t(" et "), f("\\varphi"), t(" à partir des relevés (justifie chaque paramètre ; "), f("\\varphi"), t(" dans "), f("]-\\pi\\,;\\pi]"), t(", au centième).")] },
        { consigne: consigne(e, "prevision") },
        { consigne: [t(questionDuree(e))] },
      ],
    },
    etapesParQuestion: [["a", "b", "c"], ["d"], ["e"]],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return PHASES_RELEVES.map((p, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponse(e, p)] }));
}

function criteresDifficulte(e: E): CriteresDifficulte {
  // L'élève construit lui-même le modèle à partir des relevés (méthode 2) ; écran a = lecture ;
  // calculatrice indispensable ; pas de piège dans les données.
  return { ...etapesDuCorrige(correctionDetailleeRelevesSinusoide(e), ["a"]), methode: 2, piege: 0, nombres: 1 };
}

function bareme(e: E): BaremeExercice {
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Maximum, minimum et période lus : "), ...reponse(e, "lecture")], points: 0.5 },
      { sousQuestion: "b", critere: [t("Amplitude, décalage vertical, pulsation : "), ...reponse(e, "parametres")], points: 1 },
      { sousQuestion: "c", critere: [t("Phase par le maximum : "), ...reponse(e, "phase")], points: 0.75 },
      { sousQuestion: "d", critere: [t("Prévision : "), ...reponse(e, "prevision")], points: 0.75 },
      { sousQuestion: "e", critere: [t("Durée au-dessus du seuil (arc du haut divisé par ω) : "), ...reponse(e, "duree")], points: 1 },
    ],
    erreursFrequentes: [
      ...(e.variante === "maree" ? [{ description: [t("Période prise entre une pleine et une basse mer (demi-période)")], cout: "−0,5, suite notée sans double pénalité" }] : []),
      { description: [t("Signe de "), f("\\varphi"), t(" inversé")], cout: "−0,5, suite notée sans double pénalité" },
      { description: [t("Calculatrice en mode degré")], cout: "−0,5" },
      { description: [t("Durée sous le seuil au lieu de la durée au-dessus")], cout: "−0,5" },
    ],
    reponsesAcceptees: [[t("Toute valeur de "), f("\\varphi"), t(" égale à 2π près, ou obtenue par le minimum")], [t("Écart d'une unité sur le dernier chiffre dû aux arrondis intermédiaires")]],
  };
}

export function profilRelevesSinusoide(_e: E): ProfilInstance {
  return { casParticulier: null, calcul: "calculatrice" };
}

export const adaptateurEvaluationRelevesSinusoide: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Modéliser des relevés réels — Évaluation",
  nomFichierBase: "releves-reels-sinusoide",
  genererInstance: genererExerciceRelevesSinusoide,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteReleves),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeRelevesSinusoide,
  bareme,
  enoncePapier,
  profilInstance: profilRelevesSinusoide,
  calculatriceIndispensable: true,
};
