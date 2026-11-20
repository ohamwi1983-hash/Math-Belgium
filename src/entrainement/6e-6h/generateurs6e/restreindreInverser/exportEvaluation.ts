import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/corrigeTableau";
import type { ExerciceRestreindre, VarianteRestreindre } from "../../core6e/restreindreInverser";
import { consigne, consigneGenerale, figure, phases, reponse } from "../../ui6e/formatRestreindreInverser";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceRestreindre } from "./index";
import { correctionDetailleeRestreindre } from "./corrigeDetaille";

/**
 * Adaptateur papier de `6gen159` « Restreindre pour inverser ». Trois VRAIES questions (une par écran) :
 * a) la restriction, b) le domaine de g (trinôme) ou g(y₀), c) l'expression de g ; courbe de f avec x₀
 * marqué dans l'énoncé. Valeurs exactes.
 */

type E = ExerciceRestreindre;
const t = texte;
const f = latex;
const LETTRES = "abc";

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: consigneGenerale(e), enteteHtml: figure(e, "papier"), questions: phases(e).map((p) => ({ consigne: consigne(e, p) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return phases(e).flatMap((p, i) => [t(`${i > 0 ? " ; " : ""}${LETTRES[i]}) `), ...reponse(e, p)]);
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: { enteteFragments: consigneGenerale(e), enteteHtml: figure(e, "papier"), questions: phases(e).map((p) => ({ consigne: consigne(e, p) })) },
    etapesParQuestion: [["a"], ["b"], ["c"]],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return phases(e).map((p, i): BlocCorrection => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponse(e, p)] }));
}

function criteresDifficulte(e: E): CriteresDifficulte {
  // Méthode 1 (restriction puis réciproque, méthode du cours). Piège dans les données : restriction
  // autre que la restriction principale (trigonométrique : arc x seul est faux) ; trinôme : x₀ à gauche
  // du sommet (racine précédée d'un signe −).
  return { ...etapesDuCorrige(correctionDetailleeRestreindre(e), []), methode: 1, piege: e.variante !== "trinome" || e.s < 0 ? 1 : 0, nombres: 0 };
}

function bareme(e: E): BaremeExercice {
  const trinome = e.variante === "trinome";
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Restriction justifiée (sommet / extremums ou asymptotes encadrant "), f("x_0"), t(") : "), ...reponse(e, "intervalle")], points: 1 },
      trinome
        ? { sousQuestion: "b", critere: [t("Image de la restriction : "), ...reponse(e, "image")], points: 1 }
        : { sousQuestion: "b", critere: [t("Angle principal puis angle de l'intervalle : "), ...reponse(e, "valeur")], points: 1 },
      { sousQuestion: "c", critere: [t(trinome ? "x isolé, signe de la racine justifié : " : "Expression justifiée par une identité : "), ...reponse(e, "expression")], points: 2 },
    ],
    erreursFrequentes: trinome
      ? [{ description: [t("Signe de la racine non adapté à la restriction")], cout: "−1" }, { description: [t("Variables non échangées (g écrite en y)")], cout: "−0,5" }]
      : [{ description: [t("Réponse égale à la valeur principale (arcsin, arccos, arctan seul)")], cout: "0 pt sur la question" }, { description: [t("Angle juste mais hors de l'intervalle (un tour de trop)")], cout: "−0,5" }],
    reponsesAcceptees: [[t("Toute écriture équivalente de g(x)")]],
  };
}

export function profilRestreindre(e: E): ProfilInstance {
  return { casParticulier: null, calcul: "exacte", forme: e.variante };
}

export const adaptateurEvaluationRestreindre: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Restreindre pour inverser — Évaluation",
  nomFichierBase: "restreindre-pour-inverser",
  genererInstance: genererExerciceRestreindre,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as VarianteRestreindre),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeRestreindre,
  bareme,
  enoncePapier,
  profilInstance: profilRestreindre,
};
