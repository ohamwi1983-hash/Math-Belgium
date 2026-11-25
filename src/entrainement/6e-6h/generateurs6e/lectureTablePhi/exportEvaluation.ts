import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { texte } from "../../../export/corrigeTableau";
import type { ExerciceLTP } from "../../core6e/lectureTablePhi";
import { phases } from "../../core6e/lectureTablePhi";
import { consigne, question, reponse, sensInverse, SITUATION } from "../../ui6e/formatLectureTablePhi";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceLTP } from "./index";
import { correctionDetailleeLTP } from "./corrigeDetaille";

/**
 * Adaptateur papier de `6gen116` « Lire la table de Φ ». Énoncé papier = « Z suit 𝒩(0 ; 1) » + la
 * question (probabilité à quatre décimales, ou z au centième, case la plus proche) ; les deux écrans
 * deviennent les étapes a, b du corrigé. La table elle-même n'est JAMAIS dans l'énoncé (décision du
 * 18/11/2026) : l'adaptateur déclare `besoinTablePhi`, l'assembleur joint UNE table complète en annexe.
 * Lectures pures (case, valeur lue, z) : écrans de lecture ; méthode 0 (la propriété est imposée par
 * l'événement écrit), piège 1 quand une borne est négative (symétrie, intervalle à borne
 * négative) et TOUJOURS en lecture inverse par symétrie (le signe de z est la réponse : un niveau qui
 * varierait avec lui le trahirait sur la feuille). Aucun cas particulier, aucun `calcul` : la Casio Graph Math+ a la loi normale,
 * mais lire la table EST l'exercice (Connaître ; tiré « interdite » ET « autorisée »).
 * Regroupement a), b), c) : entrée `6gen116` de `REGROUPEMENTS` (deux consignes : calcule / détermine z).
 */

type E = ExerciceLTP;
const t = texte;
const fr = (x: unknown) => x as FragmentConsigne[];

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr([...SITUATION, { type: "texte", valeur: " " }, ...question(e)]), questions: phases(e).map((p) => ({ consigne: fr(consigne(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return fr(reponse(e, sensInverse(e) ? "z" : "valeur"));
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: { enteteFragments: fr(SITUATION), questions: [{ consigne: fr(question(e)) }] },
    etapesParQuestion: [["a", "b"]],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  const p = phases(e);
  return [{ type: "paragraphe", fragments: [...fr(reponse(e, p[0]!)), t(" ; "), ...fr(reponse(e, p[1]!))] }];
}

/** Lettres des écrans de pure lecture. */
function lectures(e: E): string[] {
  if (e.variante === "directe" || e.variante === "inverse") return ["a", "b"];
  if (e.variante === "inverseSymetrie") return ["b"];
  return [];
}

function criteresDifficulte(e: E): CriteresDifficulte {
  // inverseSymetrie : piège CONSTANT (le signe de z est la réponse ; un niveau qui varierait avec lui le
  // trahirait sur la feuille). intervalle : la borne négative se voit dans l'énoncé, rien à trahir.
  const piege = e.variante === "symetrie" || (e.variante === "intervalle" && e.aNeg) || e.variante === "inverseSymetrie" ? 1 : 0;
  return { ...etapesDuCorrige(correctionDetailleeLTP(e), lectures(e)), methode: 0, piege, nombres: 0, sansCharge: true };
}

function bareme(e: E): BaremeExercice {
  const [p1, p2] = phases(e);
  const libelle1 = p1 === "case" ? (e.variante === "directe" ? "Case de la table (ligne et colonne)" : "Case la plus proche") : p1 === "ecriture" ? "Écriture avec Φ en des nombres positifs" : "Valeur de Φ à chercher";
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t(`${libelle1} : `), ...fr(reponse(e, p1!))], points: 2 },
      { sousQuestion: "b", critere: [t(p2 === "z" ? "Valeur de z : " : "Valeur lue et calculée : "), ...fr(reponse(e, p2!))], points: 2 },
    ],
    erreursFrequentes: [
      ...(e.variante === "symetrie" || (e.variante === "intervalle" && e.aNeg) ? [{ description: [t("Φ traitée comme une fonction paire (Φ(−a) = Φ(a))")], cout: "0 pt sur l'étape 1" }] : []),
      ...(e.variante === "complement" ? [{ description: [t("Φ(a) donnée pour l'aire à droite de a")], cout: "0 pt sur l'étape 1" }] : []),
      ...(e.variante === "inverseSymetrie" && e.sens === "inf" ? [{ description: [t("Signe de z oublié")], cout: "moitié des points de l'étape 2" }] : []),
      { description: [t("Case voisine lue (ligne ou colonne d'à côté)")], cout: "−0,5" },
    ],
    reponsesAcceptees: [[t(sensInverse(e) ? "La case la plus proche ; la valeur de la calculatrice arrondie au centième" : "La valeur de la table à quatre décimales ; la valeur de la calculatrice arrondie à quatre décimales")]],
  };
}

/** `forme` = variante (le type de lecture est écrit dans l'énoncé : aucun verdict caché). */
export function profilLTP(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}

export const adaptateurEvaluationLTP: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Lire la table de Φ — Évaluation",
  nomFichierBase: "lire-table-phi",
  genererInstance: genererExerciceLTP,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeLTP,
  bareme,
  enoncePapier,
  profilInstance: profilLTP,
  besoinTablePhi: true,
};
