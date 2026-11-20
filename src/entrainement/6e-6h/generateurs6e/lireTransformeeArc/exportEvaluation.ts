import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/corrigeTableau";
import type { ExerciceLireTransformee, VarianteLireTransformee } from "../../core6e/lireTransformeeArc";
import { kV } from "../../core6e/lireTransformeeArc";
import { consigne, consigneGenerale, figure, formeL, phases, reponse } from "../../ui6e/formatLireTransformeeArc";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLireTransformee } from "./index";
import { correctionDetailleeLireTransformee } from "./corrigeDetaille";

/**
 * Adaptateur papier de `6gen158` « Lire une transformée c + k·arc(mx + n) ». Énoncé papier = la courbe
 * sur sa grille (lignes entières / multiples de π/4, trois nœuds marqués, aucune coordonnée) et la
 * consigne globale ; les écrans (domaine, image, m et n, k et c) sont les étapes du corrigé. Valeurs
 * exactes.
 */

type E = ExerciceLireTransformee;
const t = texte;
const f = latex;

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: consigneGenerale(e), enteteHtml: figure(e, "papier"), questions: phases(e).map((p) => ({ consigne: consigne(e, p) })) };
}

function consignePapier(e: E): FragmentConsigne[] {
  return [
    t("La courbe ci-dessous représente "),
    f(formeL(e)),
    t(", où "),
    f("m>0"),
    t(" et "),
    f("k\\neq 0"),
    t(" sont rationnels et "),
    f("c"),
    t(" est réel. Les lignes verticales du quadrillage sont aux entiers, les lignes horizontales aux multiples de "),
    f("\\dfrac{\\pi}{4}"),
    t(" ; les points marqués sont des nœuds. Lis le domaine et l'image de "),
    f("f"),
    t(", puis détermine "),
    f("m"),
    t(", "),
    f("n"),
    t(", "),
    f("k"),
    t(", "),
    f("c"),
    t(" et l'expression de "),
    f("f(x)"),
    t(" en justifiant."),
  ];
}

function reponseBreve(e: E): FragmentConsigne[] {
  return phases(e).flatMap((p, i) => [...(i > 0 ? [t(" ; ")] : []), ...reponse(e, p)]);
}

function enoncePapier(e: E): EnoncePapier {
  return { section: { enteteFragments: consignePapier(e), enteteHtml: figure(e, "papier"), questions: [] }, reponseBreve: reponseBreve(e) };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "html", html: figure(e, "corrige") }, ...phases(e).map((p): BlocCorrection => ({ type: "paragraphe", fragments: reponse(e, p) }))];
}

function criteresDifficulte(e: E): CriteresDifficulte {
  // a (domaine) et b (image) : lectures. Méthode 1 (forme donnée, déduire les paramètres). Piège dans
  // les données : k < 0 (courbe « à l'envers ») ; arccos (c n'est pas le milieu de l'image).
  return { ...etapesDuCorrige(correctionDetailleeLireTransformee(e), ["a", "b"]), methode: 1, piege: kV(e) < 0 || e.variante === "arccos" ? 1 : 0, nombres: 0 };
}

function bareme(e: E): BaremeExercice {
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Domaine lu : "), ...reponse(e, "domaine")], points: 0.5 },
      { sousQuestion: "b", critere: [t("Image lue (crochets justes) : "), ...reponse(e, "image")], points: 0.5 },
      { sousQuestion: e.variante === "arctan" ? "d" : "c", critere: [t("m et n justifiés : "), ...reponse(e, "mn")], points: 1.5 },
      { sousQuestion: e.variante === "arctan" ? "c" : "d", critere: [t("k (signe compris) et c justifiés, expression : "), ...reponse(e, "kc")], points: 1.5 },
    ],
    erreursFrequentes: [
      { description: [t("Signe de k oublié pour une courbe décroissante")], cout: "−0,5" },
      { description: [f("m"), t(" inversé (largeur du domaine prise pour m)")], cout: "moitié des points sur m et n" },
      { description: [t("Valeurs décimales au lieu des valeurs exactes")], cout: "−0,5" },
    ],
    reponsesAcceptees: [[t("Toute écriture équivalente de l'expression ; bornes en π écrites autrement (« 3π/4 » ou « 0,75π »)")]],
  };
}

export function profilLireTransformee(e: E): ProfilInstance {
  return { casParticulier: null, calcul: "exacte", forme: e.variante };
}

export const adaptateurEvaluationLireTransformee: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Lire une transformée d'une arcfonction — Évaluation",
  nomFichierBase: "lire-transformee-arcfonction",
  genererInstance: genererExerciceLireTransformee,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as VarianteLireTransformee),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeLireTransformee,
  bareme,
  enoncePapier,
  profilInstance: profilLireTransformee,
};
