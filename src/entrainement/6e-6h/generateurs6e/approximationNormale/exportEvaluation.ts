import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { texte } from "../../../export/corrigeTableau";
import type { ExerciceAN } from "../../core6e/approximationNormale";
import { phases } from "../../core6e/approximationNormale";
import { consigne, enonce, question, reponse } from "../../ui6e/formatApproximationNormale";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceAN } from "./index";
import { correctionDetailleeAN } from "./corrigeDetaille";

/**
 * Adaptateur papier de `6gen118` « Approximation normale avec correction de continuité ». Énoncé papier
 * = situation + X ∼ 𝓑(n ; p) + la question en une consigne IDENTIQUE pour les deux verdicts (« Les
 * conditions du cours permettent-elles… ? Si oui, estime… avec la correction de continuité ; sinon,
 * calcule… avec la loi binomiale. Arrondis au dix-millième. ») ; les écrans deviennent les étapes du
 * corrigé (a–e si approximable, a–c sinon). Le verdict est tiré dans chaque série, jamais dans
 * `forme` (= l'événement) ; niveau et durée CONSTANTS pour les deux verdicts (critères fixes : sinon le
 * niveau imprimé sur la feuille trahirait la réponse). `besoinTablePhi` pour TOUTES les instances (la
 * table jointe ne doit pas trahir le verdict). `calculatriceIndispensable` : la loi binomiale exacte
 * (n jusqu'à 200, sommes de termes) et σ = √(np(1 − p)) ne se font pas à la main ; aucun `calcul` au
 * profil (verdict et correction de continuité évalués, tiré en « autorisée »). Aucun cas particulier.
 * Regroupement écarté : situation propre à chaque instance.
 */

type E = ExerciceAN;
const t = texte;
const fr = (x: unknown) => x as FragmentConsigne[];

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr([...enonce(e), { type: "texte", valeur: " " }, ...question(e)]), questions: phases(e).map((p) => ({ consigne: fr(consigne(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return e.approximable ? [...fr(reponse(e, "verdict")), t(" "), ...fr(reponse(e, "proba"))] : [...fr(reponse(e, "condition")), t(" : pas d'approximation normale. "), ...fr(reponse(e, "exacte"))];
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: { enteteFragments: fr(enonce(e)), questions: [{ consigne: fr(question(e)) }] },
    etapesParQuestion: [phases(e).map((_p, i) => "abcde"[i]!)],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function criteresDifficulte(_e: E): CriteresDifficulte {
  return { etapesTransformation: 4, etapesLecture: 1, methode: 1, piege: 0, nombres: 1, sansCharge: true };
}

function bareme(e: E): BaremeExercice {
  if (!e.approximable)
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [t("Conditions vérifiées une à une")], points: 1 },
        { sousQuestion: "b", critere: [t("Condition en défaut : "), ...fr(reponse(e, "condition"))], points: 1 },
        { sousQuestion: "c", critere: [t("Probabilité exacte (loi binomiale) : "), ...fr(reponse(e, "exacte"))], points: 2 },
      ],
      erreursFrequentes: [
        { description: [t("Approximation normale faite malgré une condition non remplie (inégalité stricte ignorée)")], cout: "0 pt sur les étapes 1 et 2" },
        { description: [t("Cumul mal écrit (« au moins », « moins de »)")], cout: "moitié des points de l'étape 3" },
      ],
      reponsesAcceptees: [[t("Valeur de la loi binomiale de la calculatrice, arrondie au dix-millième")]],
    };
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Conditions vérifiées : "), ...fr(reponse(e, "verdict"))], points: 0.5 },
      { sousQuestion: "b", critere: [t("Paramètres : "), ...fr(reponse(e, "parametres"))], points: 0.5 },
      { sousQuestion: "c", critere: [t("Correction de continuité : "), ...fr(reponse(e, "bornes"))], points: 1.5 },
      { sousQuestion: "d", critere: [t("Standardisation : "), ...fr(reponse(e, "z"))], points: 0.5 },
      { sousQuestion: "e", critere: [t("Lecture de la table et résultat : "), ...fr(reponse(e, "proba"))], points: 1 },
    ],
    erreursFrequentes: [
      { description: [t("Correction de continuité oubliée ou du mauvais côté")], cout: "0 pt sur l'étape 3" },
      { description: [t("σ = np(1 − p) (racine oubliée)")], cout: "0 pt sur l'étape 2" },
      ...(e.variante === "auMoins" ? [{ description: [t("Φ(z) donnée au lieu de 1 − Φ(z)")], cout: "moitié des points de l'étape 5" }] : []),
    ],
    reponsesAcceptees: [[t("z au centième (σ arrondi admis) et la valeur correspondante de la table ; la valeur de la loi normale de la calculatrice avec les bornes corrigées")]],
  };
}

/** `forme` = événement (jamais le verdict « approximable ? »). */
export function profilAN(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}

export const adaptateurEvaluationAN: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Approximation normale avec correction de continuité — Évaluation",
  nomFichierBase: "approximation-normale-continuite",
  genererInstance: genererExerciceAN,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeAN,
  bareme,
  enoncePapier,
  profilInstance: profilAN,
  calculatriceIndispensable: true,
  besoinTablePhi: true,
};
