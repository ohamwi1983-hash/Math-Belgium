import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/corrigeTableau";
import type { Exercice161 } from "../../core6e/quelJeuChoisir";
import { PHASES_161, consigne, consigneGenerale, consignePapier, reponse, syntheseVerdict161 } from "../../ui6e/format161";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExercice161 } from "./index";
import { correctionDetaillee161 } from "./corrigeDetaille";

/**
 * Adaptateur feuilles d'exercices / évaluations de `6gen161` « Quel jeu choisir ? ». Énoncé papier
 * = contexte + les deux jeux + UNE consigne « À quel jeu as-tu le plus de chances de gagner ?
 * Justifie… » ; les trois écrans deviennent les étapes du corrigé (jeu A, jeu B, comparaison). Tout
 * est exact et c'est la modélisation qui est évaluée : aucun `calcul` (tiré calculatrice interdite
 * ET autorisée). Verdict tiré au tiers, jamais cas particulier ni `forme` ; critères constants
 * (trois étapes `sansCharge`, méthode 2 : l'élève modélise chaque jeu) → niveau et durée constants.
 */

type E = Exercice161;
const t = texte;
const f = latex;
const fr = (x: unknown): FragmentConsigne[] => x as FragmentConsigne[];

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(consigneGenerale(e)), questions: PHASES_161.map((p) => ({ consigne: fr(consigne(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return fr(syntheseVerdict161(e));
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: { enteteFragments: fr(consigneGenerale(e)), questions: [{ consigne: fr(consignePapier()) }] },
    etapesParQuestion: [["a", "b", "c"]],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function criteresDifficulte(e: E): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetaillee161(e), []), methode: 2, piege: 0, nombres: 0, sansCharge: true };
}

function bareme(e: E): BaremeExercice {
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Jeu A modélisé (dénombrement, arbre ou contraire) : "), ...fr(reponse(e, "pA"))], points: 1.5 },
      { sousQuestion: "b", critere: [t("Jeu B modélisé : "), ...fr(reponse(e, "pB"))], points: 1.5 },
      { sousQuestion: "c", critere: [t("Comparaison justifiée (même dénominateur ou produits en croix) et choix : "), ...fr(reponse(e, "choix"))], points: 1 },
    ],
    erreursFrequentes: [
      { description: [t("Probabilités additionnées au lieu de passer par l'événement contraire")], cout: "0 pt sur le jeu concerné" },
      { description: [t("Tirage sans remise traité comme avec remise (ou l'inverse)")], cout: "moitié des points du jeu concerné" },
      { description: [t("Un seul des chemins gagnants compté")], cout: "moitié des points du jeu concerné" },
      { description: [t("Choix fait sans comparaison exacte (valeurs arrondies trop tôt, intuition)")], cout: "0 pt sur la comparaison" },
    ],
    reponsesAcceptees: [[t("Toute écriture exacte des probabilités ("), f("\\dfrac{6}{36}=\\dfrac{1}{6}"), t(") ; comparaison par les valeurs décimales si elles départagent sans ambiguïté")]],
  };
}

/** Même variante dans toutes les séries ; le verdict reste tiré au hasard. */
export function profil161(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}

export const adaptateurEvaluation161: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Quel jeu choisir ? — Évaluation",
  nomFichierBase: "quel-jeu-choisir",
  genererInstance: genererExercice161,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id: string) => construireAvecVariante(id),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetaillee161,
  bareme,
  enoncePapier,
  profilInstance: profil161,
};
