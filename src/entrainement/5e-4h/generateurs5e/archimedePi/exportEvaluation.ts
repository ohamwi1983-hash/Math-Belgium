import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/corrigeTableau";
import type { ExerciceArchimedePi } from "../../core5e/archimedePi";
import { consigne, consigneGenerale, PHASES_ARCHIMEDE, reponse, seuilT, situation } from "../../ui5e/formatArchimedePi";
import { figureArchimede } from "../../ui5e/figureArchimedePi";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceArchimedePi } from "./index";
import type { IdVarianteArchimede } from "./index";
import { correctionDetailleeArchimedePi } from "./corrigeDetaille";

/**
 * Adaptateur papier de `5gen56` « Encadrer π comme Archimède ». Trois VRAIES questions (exception de
 * `.claude/rules/feuilles-evaluations.md`) : a) côtés et encadrement à n côtés (étapes a, b, c) ;
 * b) encadrement à 2n côtés (étape d) ; c) nombre de côtés pour une largeur sous le seuil (étape e).
 * Figure du cours dans l'énoncé (aucune mesure à lire).
 */

type E = ExerciceArchimedePi;
const t = texte;
const f = latex;
const LETTRES = "abcde";

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: consigneGenerale(e), enteteHtml: figureArchimede(e), questions: PHASES_ARCHIMEDE.map((p) => ({ consigne: consigne(e, p) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return [t("a) "), ...reponse(e, "encadrement"), t(" ; b) "), ...reponse(e, "doublement"), t(` ; c) ${e.nSeuil} côtés.`)];
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: {
      enteteFragments: situation(e),
      enteteHtml: figureArchimede(e),
      questions: [
        { consigne: [t("Calcule "), f("\\alpha"), t(", puis les côtés "), f("|AB|"), t(" et "), f("|DE|"), t(" (au centième) ; déduis-en un encadrement de π au millième (minorant arrondi par défaut, majorant par excès).")] },
        { consigne: [t(`Fais de même avec des polygones à ${2 * e.n} côtés.`)] },
        { consigne: [t(`En continuant à doubler le nombre de côtés, à partir de combien de côtés la largeur de l'encadrement devient-elle inférieure à ${seuilT(e)} ?`)] },
      ],
    },
    etapesParQuestion: [["a", "b", "c"], ["d"], ["e"]],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return PHASES_ARCHIMEDE.map((p, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponse(e, p)] }));
}

function criteresDifficulte(e: E): CriteresDifficulte {
  // Méthode imposée par le cours ; aucun piège dans les données ; calculatrice indispensable.
  return { ...etapesDuCorrige(correctionDetailleeArchimedePi(e)), methode: 0, piege: 0, nombres: 1 };
}

function bareme(e: E): BaremeExercice {
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Demi-angle au centre : "), ...reponse(e, "angle")], points: 0.5 },
      { sousQuestion: "b", critere: [t("Côtés des deux polygones : "), ...reponse(e, "cotes")], points: 1 },
      { sousQuestion: "c", critere: [t("Encadrement de π (division par 2r) : "), ...reponse(e, "encadrement")], points: 1 },
      { sousQuestion: "d", critere: [t(`Encadrement avec ${2 * e.n} côtés : `), ...reponse(e, "doublement")], points: 0.75 },
      { sousQuestion: "e", critere: [t("Nombre de côtés justifié par les largeurs successives : "), ...reponse(e, "precision")], points: 0.75 },
    ],
    erreursFrequentes: [
      { description: [t("Calculatrice en mode radian")], cout: "−0,5, suite notée sans double pénalité" },
      { description: [t("Angle au centre entier au lieu de sa moitié")], cout: "0 pt sur l'angle, suite notée sans double pénalité" },
      { description: [t("Division par "), f("r"), t(" au lieu de "), f("2r"), t(" (encadrement de "), f("2\\pi"), t(")")], cout: "−0,5" },
      { description: [t("Un doublement de trop ou de moins")], cout: "0 pt sur le nombre de côtés" },
    ],
    reponsesAcceptees: [[t("Bornes arrondies au plus proche (au lieu de par défaut / par excès), à un millième près")], [t("Calcul direct par "), f("n\\sin\\alpha"), t(" et "), f("n\\tan\\alpha"), t(" sans passer par les côtés, s'il est justifié")]],
  };
}

export function profilArchimedePi(_e: E): ProfilInstance {
  return { casParticulier: null, calcul: "calculatrice" };
}

export const adaptateurEvaluationArchimedePi: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Encadrer π comme Archimède — Évaluation",
  nomFichierBase: "encadrer-pi-archimede",
  genererInstance: genererExerciceArchimedePi,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteArchimede),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeArchimedePi,
  bareme,
  enoncePapier,
  profilInstance: profilArchimedePi,
  calculatriceIndispensable: true,
};
