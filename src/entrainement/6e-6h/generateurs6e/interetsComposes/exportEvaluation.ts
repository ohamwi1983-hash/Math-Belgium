import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/corrigeTableau";
import type { ExerciceInteretsComposes, VarianteInteretsComposes } from "../../core6e/interetsComposes";
import { PHASES_INTERETS, consigne, consigneGenerale, questionCapitaux, questionLimite, questionTaux, reponse } from "../../ui6e/formatInteretsComposes";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceInteretsComposes } from "./index";
import { correctionDetailleeInteretsComposes } from "./corrigeDetaille";

/**
 * Adaptateur papier de `6gen151` « Intérêts composés et nombre e ». Trois VRAIES questions (une par
 * écran) : a) trois capitaux, b) la limite K₀·e^{rt}, c) le taux annuel équivalent. Formule des
 * intérêts composés donnée dans l'énoncé. Calculatrice indispensable.
 */

type E = ExerciceInteretsComposes;
const t = texte;
const f = latex;
const LETTRES = "abc";

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: consigneGenerale(e), questions: PHASES_INTERETS.map((p) => ({ consigne: consigne(e, p) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return [t("a) "), ...reponse(e, "capitaux"), t(" ; b) "), ...reponse(e, "limite"), t(" ; c) "), ...reponse(e, "taux"), t(".")];
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: {
      enteteFragments: consigneGenerale(e),
      questions: [{ consigne: [t(questionCapitaux(e))] }, { consigne: [t(questionLimite(e))] }, { consigne: [t(questionTaux(e))] }],
    },
    etapesParQuestion: [["a"], ["b"], ["c"]],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return PHASES_INTERETS.map((p, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponse(e, p)] }));
}

function criteresDifficulte(e: E): CriteresDifficulte {
  // Formule donnée (méthode au plus 1) ; la limite demande de reconnaître la définition de e ;
  // aucun piège dans les données ; calculatrice indispensable.
  return { ...etapesDuCorrige(correctionDetailleeInteretsComposes(e), []), methode: 1, piege: 0, nombres: 1 };
}

function bareme(e: E): BaremeExercice {
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Trois capitaux (taux "), f("\\frac{r}{n}"), t(", "), f("n\\cdot t"), t(" versements) : "), ...reponse(e, "capitaux")], points: 1.5 },
      { sousQuestion: "b", critere: [t("Limite reconnue par la définition de e : "), ...reponse(e, "limite")], points: 1.5 },
      { sousQuestion: "c", critere: [t("Taux équivalent "), f("e^{r}-1"), t(" : "), ...reponse(e, "taux")], points: 1 },
    ],
    erreursFrequentes: [
      { description: [t("Taux annuel appliqué à chaque versement")], cout: "−0,5 par capital" },
      { description: [t("Exposant sans la durée "), f("t")], cout: "−0,5" },
      { description: [f("e^{r}"), t(" donné comme taux (1 non retiré)")], cout: "−0,5" },
    ],
    reponsesAcceptees: [[t("Écart d'un centime dû aux arrondis de la calculatrice ; taux en décimal ou en %")]],
  };
}

export function profilInteretsComposes(e: E): ProfilInstance {
  return { casParticulier: null, calcul: "calculatrice", forme: e.variante };
}

export const adaptateurEvaluationInteretsComposes: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Intérêts composés et nombre e — Évaluation",
  nomFichierBase: "interets-composes-nombre-e",
  genererInstance: genererExerciceInteretsComposes,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as VarianteInteretsComposes),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeInteretsComposes,
  bareme,
  enoncePapier,
  profilInstance: profilInteretsComposes,
  calculatriceIndispensable: true,
};
