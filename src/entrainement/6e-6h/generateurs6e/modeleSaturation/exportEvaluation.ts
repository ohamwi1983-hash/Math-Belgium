import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/corrigeTableau";
import type { ExerciceModeleSaturation, VarianteModeleSaturation } from "../../core6e/modeleSaturation";
import { tableauHtml } from "../../../5e-4h/ui5e/definitionRelevesSinusoide";
import { PHASES_MODELE_SATURATION, consigne, consigneGenerale, questionPrevision, questionSeuil, reponse, tableau } from "../../ui6e/formatModeleSaturation";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceModeleSaturation } from "./index";
import { correctionDetailleeModeleSaturation } from "./corrigeDetaille";

/**
 * Adaptateur papier de `6gen150` « Modèle L + C·qᵗ ». Trois VRAIES questions : a) construire le
 * modèle (étapes a, b, c : rapport des écarts, L et C, q) ; b) la prévision (étape d) ; c) l'instant
 * où le seuil est atteint (étape e). Tableau des mesures dans l'énoncé. Calculatrice indispensable.
 */

type E = ExerciceModeleSaturation;
const t = texte;
const f = latex;
const LETTRES = "abcde";

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: consigneGenerale(e), enteteHtml: tableauHtml(tableau(e)), questions: PHASES_MODELE_SATURATION.map((p) => ({ consigne: consigne(e, p) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return [t("a) "), ...reponse(e, "limite"), t(" ; "), ...reponse(e, "q"), t(" ; b) "), ...reponse(e, "prevision"), t(" ; c) "), ...reponse(e, "seuil"), t(".")];
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: {
      enteteFragments: consigneGenerale(e),
      enteteHtml: tableauHtml(tableau(e)),
      questions: [
        { consigne: [t("À partir des mesures, détermine "), f("L"), t(", "), f("C"), t(" et "), f("q"), t(" (q arrondi au dix-millième) ; justifie chaque valeur.")] },
        { consigne: [t(questionPrevision(e))] },
        { consigne: [t(questionSeuil(e))] },
      ],
    },
    etapesParQuestion: [["a", "b", "c"], ["d"], ["e"]],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return PHASES_MODELE_SATURATION.map((p, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponse(e, p)] }));
}

function criteresDifficulte(e: E): CriteresDifficulte {
  // L'élève construit le modèle à partir des mesures (méthode 2) ; aucune lecture (les mesures sont
  // utilisées, pas seulement lues) ; calculatrice indispensable ; piège dans les données : C < 0
  // (grandeur qui augmente vers L : signe de C).
  return { ...etapesDuCorrige(correctionDetailleeModeleSaturation(e), []), methode: 2, piege: e.C < 0 ? 1 : 0, nombres: 1 };
}

function bareme(e: E): BaremeExercice {
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Rapport des écarts successifs : "), ...reponse(e, "rapport")], points: 0.75 },
      { sousQuestion: "b", critere: [t("Valeur limite et écart initial : "), ...reponse(e, "limite")], points: 1 },
      { sousQuestion: "c", critere: [t("Facteur par unité de temps : "), ...reponse(e, "q")], points: 0.5 },
      { sousQuestion: "d", critere: [t("Prévision avec le modèle complet : "), ...reponse(e, "prevision")], points: 0.75 },
      { sousQuestion: "e", critere: [t("Seuil : terme exponentiel isolé, touche ln : "), ...reponse(e, "seuil")], points: 1 },
    ],
    erreursFrequentes: [
      { description: [t("Rapport des mesures au lieu du rapport des écarts")], cout: "0 pt sur le rapport, suite notée sans double pénalité" },
      { description: [t("Dernière mesure prise pour la valeur limite L")], cout: "0 pt sur L" },
      { description: [f("q=r"), t(" (le rapport porte sur plusieurs unités de temps)")], cout: "−0,5, suite notée sans double pénalité" },
      { description: [t("L oublié dans la prévision ou dans le seuil")], cout: "−0,5" },
    ],
    reponsesAcceptees: [[t("Écart d'une unité sur le dernier chiffre dû à q arrondi")], [t("Toute écriture exacte de "), f("q"), t(" (racine de r)")]],
  };
}

export function profilModeleSaturation(_e: E): ProfilInstance {
  return { casParticulier: null, calcul: "calculatrice" };
}

export const adaptateurEvaluationModeleSaturation: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Modèle L + C·qᵗ — Évaluation",
  nomFichierBase: "modele-saturation",
  genererInstance: genererExerciceModeleSaturation,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as VarianteModeleSaturation),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeModeleSaturation,
  bareme,
  enoncePapier,
  profilInstance: profilModeleSaturation,
  calculatriceIndispensable: true,
};
