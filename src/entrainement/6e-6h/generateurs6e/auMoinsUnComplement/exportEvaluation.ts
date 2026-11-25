import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { texte } from "../../../export/corrigeTableau";
import type { ExerciceAMU } from "../../core6e/auMoinsUnComplement";
import { PHASES_AMU, strategieJuste } from "../../core6e/auMoinsUnComplement";
import { CONSIGNE_PAPIER, consigne, noms, question, reponse, situation } from "../../ui6e/formatAuMoinsUnComplement";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceAMU } from "./index";
import { correctionDetailleeAMU } from "./corrigeDetaille";

/**
 * Adaptateur papier de `6gen105` « Au moins un : le complément ». Énoncé papier = situation + question
 * + consigne globale (« Explique la stratégie… puis calcule ») ; les trois écrans (stratégie, deux
 * nombres, résultat) deviennent les étapes a, b, c du corrigé. La stratégie juste dépend de
 * l'événement (au moins un / au plus un / exactement j) : c'est un VERDICT, tiré à parts égales
 * dans chaque série, jamais dans `forme` (= le contexte) ; niveau et durée CONSTANTS (trois étapes
 * `sansCharge`, méthode 1, piège 1 — « au moins / au plus / exactement » est le piège des données,
 * quel que soit l'événement —, nombres 0). Aucun cas particulier, aucun `calcul` (la calculatrice
 * donne Cₙᵏ, pas la stratégie : décision du 24/11). Regroupement a), b), c) écarté : situation propre
 * à chaque instance et consigne qui embarque les données (comme 6gen33).
 */

type E = ExerciceAMU;
const t = texte;
const fr = (x: unknown) => x as FragmentConsigne[];

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr([...situation(e), { type: "texte", valeur: " " }, ...question(e)]), questions: PHASES_AMU.map((p) => ({ consigne: fr(consigne(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return fr(reponse(e, "resultat"));
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: { enteteFragments: fr([...situation(e), { type: "texte", valeur: " " }, ...question(e)]), questions: [{ consigne: [t(CONSIGNE_PAPIER)] }] },
    etapesParQuestion: [["a", "b", "c"]],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: [...fr(reponse(e, "strategie")), t(" "), ...fr(reponse(e, "termes")), t(" ; "), ...fr(reponse(e, "resultat"))] }];
}

function criteresDifficulte(e: E): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeAMU(e), []), methode: 1, piege: 1, nombres: 0, sansCharge: true };
}

function bareme(e: E): BaremeExercice {
  const n = noms(e);
  const s = strategieJuste(e);
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Stratégie juste et justifiée : "), ...fr(reponse(e, "strategie"))], points: 1 },
      { sousQuestion: "b", critere: [t("Les deux nombres (combinaisons) : "), ...fr(reponse(e, "termes"))], points: 1.5 },
      { sousQuestion: "c", critere: [t("Résultat : "), ...fr(reponse(e, "resultat"))], points: 1.5 },
    ],
    erreursFrequentes: [
      ...(s === "complement" ? [{ description: [t(`${n.cibleFem ? "Une" : "Un"} ${n.cible} imposé${n.cibleFem ? "e" : ""}, puis le reste choisi librement (des groupes comptés plusieurs fois)`)], cout: "0 pt sur les étapes 1 et 3" }] : []),
      { description: [t("Arrangements au lieu de combinaisons (l'ordre ne compte pas dans un groupe)")], cout: "moitié des points de l'étape 2" },
      { description: [t(s === "direct" ? "Somme au lieu du produit des deux choix" : s === "somme" ? "Différence au lieu de la somme des deux cas" : "Somme au lieu de la différence")], cout: "0 pt sur l'étape 3" },
      { description: [t("Stratégie juste mais plus longue (séparer en tous les cas), calcul exact")], cout: "−0,5" },
    ],
    reponsesAcceptees: [[t("Toute stratégie juste menant au bon nombre (séparer en cas, passer par le contraire) ; résultat écrit avec des combinaisons non calculées si le calcul est posé")]],
  };
}

/** `forme` = contexte seul (jamais l'événement : il décide de la stratégie, c'est un verdict). */
export function profilAMU(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}

export const adaptateurEvaluationAMU: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Au moins un : le complément — Évaluation",
  nomFichierBase: "au-moins-un-complement",
  genererInstance: genererExerciceAMU,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeAMU,
  bareme,
  enoncePapier,
  profilInstance: profilAMU,
};
