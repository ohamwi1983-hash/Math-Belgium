import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/corrigeTableau";
import type { ExerciceComposeePoint } from "../../core5e/composeePoint";
import { nomExt, nomInt } from "../../core5e/composeePoint";
import { composeeL, consigne, consigneGenerale, fL, gL, phases, reponse } from "../../ui5e/formatComposeePoint";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceComposeePoint } from "./index";
import { correctionDetailleeComposeePoint } from "./corrigeDetaille";

/**
 * Adaptateur papier de `5gen60` « Composée en un point ». Énoncé papier = f, g et la question
 * (calculer la composée ou justifier qu'elle n'existe pas) : UNE question, sans sous-questions ; les
 * étapes d'apprentissage (valeur intermédiaire, existence, valeur) passent dans le corrigé, une
 * lettre par écran. L'existence est un VERDICT tiré dans chaque série (jamais dans `forme`) ; niveau
 * et durée CONSTANTS dans les deux issues (trois étapes comptées, `sansCharge`).
 */

type E = ExerciceComposeePoint;
const t = texte;
const f = latex;
const fr = (x: unknown) => x as FragmentConsigne[];

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(consigneGenerale(e)), questions: phases(e).map((p) => ({ consigne: fr(consigne(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  if (e.existe) return fr(reponse(e, "valeur"));
  return [f(`${nomInt(e)}(${e.a})=${e.m}\\notin\\operatorname{dom}${nomExt(e)}`), t(" : "), f(composeeL(e)), t(" n'existe pas.")];
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: { enteteFragments: [t("Soient "), f(`f(x)=${fL(e)}`), t(" et "), f(`g(x)=${gL(e)}`), t(". Calcule la valeur exacte de "), f(composeeL(e)), t(", ou justifie que ce nombre n'existe pas.")], questions: [] },
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

/** Méthode imposée (définition de la composée) ; piège dans les données : la condition d'existence
 * de la seconde fonction (constant, quelle que soit l'issue) ; valeurs exactes. Trois étapes dans
 * les deux issues : le niveau et la durée ne trahissent pas le verdict. */
function criteresDifficulte(_e: E): CriteresDifficulte {
  return { etapesTransformation: 3, etapesLecture: 0, methode: 0, piege: 1, nombres: 0, sansCharge: true };
}

function bareme(e: E): BaremeExercice {
  const it = nomInt(e);
  const ex = nomExt(e);
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Ordre juste ("), f(it), t(" d'abord) et valeur intermédiaire : "), f(`${it}(${e.a})=${e.m}`)], points: 1 },
      { sousQuestion: "b", critere: [t("Condition d'existence de "), f(ex), t(" posée et testée en "), f(`${e.m}`), t(e.existe ? " : la composée existe" : " : la composée n'existe pas")], points: e.existe ? 1.5 : 3 },
      ...(e.existe ? [{ sousQuestion: "c", critere: [t("Valeur exacte simplifiée : "), ...fr(reponse(e, "valeur"))], points: 1.5 }] : []),
    ],
    erreursFrequentes: [
      { description: [t("Ordre inversé (calcul de "), f(`(${it}\\circ ${ex})(${e.a})`), t(")")], cout: "0 pt sur la valeur intermédiaire, suite notée sans double pénalité" },
      { description: [t("Existence testée sur la valeur de départ au lieu de la valeur intermédiaire")], cout: "0 pt sur l'existence" },
      ...(e.ext.genre === "racineDen" ? [{ description: [t("Condition « ≥ 0 » au lieu de « > 0 » pour une racine au dénominateur")], cout: "moitié des points de l'existence" }] : []),
      ...(e.existe ? [{ description: [t("Valeur approchée au lieu de la valeur exacte")], cout: "moitié des points de la valeur" }] : []),
    ],
    reponsesAcceptees: [[t("Toute écriture exacte équivalente ("), f("\\dfrac{2}{\\sqrt{5}}=\\dfrac{2\\sqrt{5}}{5}"), t(", "), f("\\sqrt{8}=2\\sqrt{2}"), t(")")]],
  };
}

/** `forme` = variante | ordre (f∘g ou g∘f) : même structure d'une série à l'autre ; l'existence est
 * le verdict (jamais dans `forme`, jamais un cas particulier) ; tout est exact. */
export function profilComposeePoint(e: E): ProfilInstance {
  // Pas de `calcul` (revue des profils, 24/11/2026) : la calculatrice ne donne pas la réponse, tiré
  // que la calculatrice soit interdite ou autorisée.
  return { casParticulier: null, forme: `${e.variante}|${e.ordre}` };
}

export const adaptateurEvaluationComposeePoint: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Composée en un point — Évaluation",
  nomFichierBase: "composee-en-un-point",
  genererInstance: genererExerciceComposeePoint,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeComposeePoint,
  bareme,
  enoncePapier,
  profilInstance: profilComposeePoint,
};
