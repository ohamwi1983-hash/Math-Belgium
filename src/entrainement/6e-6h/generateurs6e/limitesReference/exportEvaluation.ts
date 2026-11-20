import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, ErreurFrequente, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/corrigeTableau";
import type { ExerciceLimitesRef } from "../../core6e/limitesReference.types";
import { consigne, consigneGenerale, limExprL, limite, PHASES, reponse, valeurLimiteL } from "../../ui6e/formatLimitesReference";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceLimitesRef } from "./index";
import { correctionDetailleeLimitesRef } from "./corrigeDetaille";

/**
 * Adaptateur papier de 6gen145 « Limites de référence et croissances comparées ». Énoncé papier =
 * la limite à calculer et la consigne globale (« Justifie : forme obtenue et limite de référence
 * utilisée ») ; les trois écrans (forme, référence, valeur) passent dans le corrigé.
 * La variante DIT la forme et la référence (« En 0 : (eᵘ − 1)/u → 1 », « Pas une forme
 * indéterminée ») : groupe à verdict (`groupesVerdict`) en évaluation. Niveau et durée constants
 * dans le groupe (méthode 1, piège 1, nombres 0 : ln a est une valeur exacte) pour ne pas trahir
 * le verdict.
 */

type E = ExerciceLimitesRef;
const t = texte;
const f = latex;

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: consigneGenerale(e), questions: PHASES.map((p) => ({ consigne: consigne(e, p) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return [f(`${limExprL(e)}=${valeurLimiteL(limite(e))}`)];
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: { enteteFragments: [t("Calcule "), f(`${limExprL(e)}`), t(" sans calculatrice. Justifie : forme obtenue, puis limite de référence utilisée (ou règle de calcul).")], questions: [] },
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return PHASES.map((p, i) => ({ type: "paragraphe", fragments: [t(`${"abc"[i]}) `), ...reponse(e, p)] }));
}

function criteresDifficulte(e: E): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeLimitesRef(e)), methode: 1, piege: 1, nombres: 0 };
}

function bareme(e: E): BaremeExercice {
  const erreurs: ErreurFrequente[] = [{ description: [t("Forme mal identifiée (limites des morceaux fausses)")], cout: "0 pt sur la forme, suite notée sans double pénalité" }];
  if (e.variante === "expo0") erreurs.push({ description: [t("Rapport des coefficients inversé, ou facteur constant oublié")], cout: "−1" });
  if (e.variante === "base0") erreurs.push({ description: [t("Facteur "), f("\\ln a"), t(" oublié (limite de référence confondue avec celle de la base e)")], cout: "−1" });
  if (e.variante === "plusInfini" || e.variante === "moinsInfini") erreurs.push({ description: [t("Dominance renversée : "), f("x^{n}"), t(" « l'emporte » sur l'exponentielle")], cout: "0 pt sur la valeur" });
  if (e.variante === "pasFI") erreurs.push({ description: [t("Forme déclarée indéterminée alors que les règles de calcul concluent")], cout: "−1" });
  erreurs.push({ description: [t("Valeur sans aucune justification")], cout: "1 pt au plus" });
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Limites des morceaux et forme : "), ...reponse(e, "forme")], points: 1 },
      { sousQuestion: "b", critere: [t("Réécriture et limite de référence (ou règle de calcul) : "), ...reponse(e, "reference")], points: 1.5 },
      { sousQuestion: "c", critere: [t("Valeur exacte : "), ...reponse(e, "valeur")], points: 1.5 },
    ],
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[t("Toute écriture exacte équivalente ("), f("\\dfrac{3}{2}\\ln 2=\\ln\\left(2^{3/2}\\right)"), t(", "), f("\\ln 3-\\ln 2=\\ln\\dfrac{3}{2}"), t(") ; la règle de L'Hôpital, correctement appliquée, est acceptée pour une forme 0/0 ou ∞/∞")]],
  };
}

/** Aucun cas particulier (« pas une forme indéterminée » est un verdict), valeurs exactes. */
export function profilLimitesRef(_e: E): ProfilInstance {
  return { casParticulier: null, calcul: "exacte" };
}

export const adaptateurEvaluationLimitesReference: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Limites de référence et croissances comparées — Évaluation",
  nomFichierBase: "limites-reference-exponentielles",
  genererInstance: genererExerciceLimitesRef,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeLimitesRef,
  bareme,
  enoncePapier,
  profilInstance: profilLimitesRef,
  groupesVerdict: [{ id: "groupe_reference", label: "Limite à calculer (forme et référence tirées au hasard)", variantes: CATALOGUE_VARIANTES.map((v) => v.id) }],
};
