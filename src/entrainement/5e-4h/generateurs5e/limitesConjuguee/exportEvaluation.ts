import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/corrigeTableau";
import type { ExerciceConjuguee } from "../../core5e/limitesConjuguee";
import { cible, limite, partielles } from "../../core5e/limitesConjuguee";
import { exacteL, limL, limiteL } from "../../ui5e/ecrituresLimitesLotG";
import { conjL, consigne, consigneGenerale, limiteEnonceL, PHASES, reponse } from "../../ui5e/formatLimitesConjuguee";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceConjuguee } from "./index";
import { correctionDetailleeConjuguee } from "./corrigeDetaille";

/**
 * Adaptateur papier de `5gen64` « Limites avec racines carrées : expression conjuguée ». Énoncé
 * papier = la limite + la consigne (« calcule la valeur exacte ») : UNE question ; les quatre écrans
 * (forme, transformation, limites partielles, conclusion) sont les étapes a–d du corrigé « comme au
 * tableau ». Regroupable a), b), c) (« Calcule la valeur exacte de chaque limite »).
 */

type E = ExerciceConjuguee;
const t = texte;
const f = latex;
const fr = (x: unknown) => x as FragmentConsigne[];

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(consigneGenerale(e)), questions: PHASES.map((p) => ({ consigne: fr(consigne(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return fr(reponse(e, "limite"));
}

function enoncePapier(e: E): EnoncePapier {
  return { section: { enteteFragments: [t("Calcule la valeur exacte de la limite suivante : "), f(limiteEnonceL(e)), t(".")], questions: [] }, reponseBreve: reponseBreve(e) };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

/** Quatre étapes qui transforment ; méthode 1 (choisir l'expression conjuguée ou la mise en
 * évidence parmi les techniques du cours) ; piège dans les données : x → −∞ sous une racine
 * (√(x²) = −x) ; valeurs exactes. */
function criteresDifficulte(e: E): CriteresDifficulte {
  return { etapesTransformation: 4, etapesLecture: 0, methode: 1, piege: e.variante === "moinsInfini" ? 1 : 0, nombres: 0 };
}

function bareme(e: E): BaremeExercice {
  const [n, d] = partielles(e);
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Forme indéterminée reconnue (limite de chaque morceau)")], points: 0.5 },
      { sousQuestion: "b", critere: e.sous === "E1" ? [t("x² mis en évidence sous la racine, "), f("\\sqrt{x^2}=-x"), t(" pour x < 0")] : [t("Multiplication par la conjuguée "), f(conjL(e)), t(" et produit remarquable développé")], points: 1.5 },
      { sousQuestion: "c", critere: [t("Simplification ou division par x ; limites "), f(limiteL(n)), t(" et "), f(limiteL(d))], points: 1 },
      { sousQuestion: "d", critere: [t("Conclusion exacte : "), f(`${limL(cible(e))}f(x)=${exacteL(limite(e))}`)], points: 1 },
    ],
    erreursFrequentes: [
      { description: [f("\\infty-\\infty=0"), t(" ou "), f("\\dfrac{\\infty}{\\infty}=1"), t(" écrit sans transformer")], cout: "0 pt sur la conclusion" },
      { description: [t("Multiplication par la conjuguée au numérateur seulement (fonction changée)")], cout: "moitié des points de la transformation" },
      { description: [t("Produit remarquable faux ("), f("A^2+B^2"), t(", coefficient non élevé au carré)")], cout: "−1" },
      ...(e.variante === "moinsInfini" ? [{ description: [f("\\sqrt{x^2}=x"), t(" en "), f("-\\infty"), t(" (signe de la limite faux)")], cout: "moitié des points des étapes c et d" }] : []),
      { description: [t("Racine laissée au dénominateur, fraction non simplifiée")], cout: "−0,5" },
    ],
    reponsesAcceptees: [[t("Toute écriture exacte équivalente ("), f("\\dfrac{1}{2\\sqrt{3}}=\\dfrac{\\sqrt{3}}{6}"), t(") ; méthode de la mise en évidence acceptée quand elle est juste")]],
  };
}

/** `forme` = variante | sous-forme : même structure d'une série à l'autre ; aucun cas particulier,
 * aucun verdict (la forme indéterminée se lit sur l'expression) ; tout est exact. */
export function profilConjuguee(e: E): ProfilInstance {
  // Pas de `calcul` (revue des profils, 24/11/2026) : la calculatrice ne donne pas la réponse, tiré
  // que la calculatrice soit interdite ou autorisée.
  return { casParticulier: null, forme: `${e.variante}|${e.sous}` };
}

export const adaptateurEvaluationLimitesConjuguee: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Limites avec racines carrées : expression conjuguée — Évaluation",
  nomFichierBase: "limites-expression-conjuguee",
  genererInstance: genererExerciceConjuguee,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeConjuguee,
  bareme,
  enoncePapier,
  profilInstance: profilConjuguee,
};
