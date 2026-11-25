import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { texte } from "../../../export/corrigeTableau";
import type { ExerciceTD } from "../../core6e/tangenteDeriveeDedoublee";
import { PHASES_TD, pente } from "../../core6e/tangenteDeriveeDedoublee";
import { nL } from "../../ui6e/outilsConiquesLotH2";
import { consigne, situation, tangentePL, tangenteQL } from "../../ui6e/formatTangenteDeriveeDedoublee";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceTD } from "./index";
import { correctionDetailleeTD } from "./corrigeDetaille";

/**
 * Adaptateur papier de `6gen138` « Tangente par la dérivée et forme dédoublée ». Énoncé papier = la conique
 * et ses deux points + consigne globale (dérivée en P, forme dédoublée en Q) ; les quatre écrans deviennent
 * les étapes a–d du corrigé (figure : conique et tangentes). Niveau et durée constants : trois étapes qui
 * transforment + une lecture (fonction qui contient P), méthode 1 (méthode du cours imposée par la
 * consigne), piège 1 (signe de y_P, sommet de l'axe focal). `forme` = conique ; aucun cas particulier
 * (la branche est un verdict, le sommet Q ne raccourcit rien) ; aucun `calcul` (dériver : règle du 24/11).
 * Regroupement : la conique et ses points forment la ligne (entrée `6gen138` de `REGROUPEMENTS`).
 */

type E = ExerciceTD;
const t = texte;
const fr = (x: unknown) => x as FragmentConsigne[];
const L = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(situation(e)), questions: PHASES_TD.map((p) => ({ consigne: fr(consigne(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return [t("Pente en P : "), L(nL(pente(e))), t(" ; tangente en P : "), L(tangentePL(e)), t(" ; tangente en Q : "), L(tangenteQL(e))];
}

function enoncePapier(e: E): EnoncePapier {
  return { section: { enteteFragments: fr(situation(e)), questions: [{ consigne: [t("Détermine une équation de la tangente à "), L("\\Gamma"), t(" en "), L("P"), t(" par la dérivée (fonction dont le graphique contient "), L("P"), t(", puis pente), puis une équation de la tangente à "), L("\\Gamma"), t(" en "), L("Q"), t(" par la forme dédoublée.")] }] }, etapesParQuestion: [["a", "b", "c", "d"]], reponseBreve: reponseBreve(e) };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function criteresDifficulte(_e: E): CriteresDifficulte {
  return { etapesTransformation: 3, etapesLecture: 1, methode: 1, piege: 1, nombres: 0, sansCharge: true };
}

function bareme(e: E): BaremeExercice {
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Fonction dont le graphique contient P, choisie par le signe de "), L("y_P")], points: 0.5 },
      { sousQuestion: "b", critere: [t("Dérivée et pente "), L(`f'(x_P)=${nL(pente(e))}`)], points: 1.5 },
      { sousQuestion: "c", critere: [t("Tangente en P : "), L(tangentePL(e))], points: 1 },
      { sousQuestion: "d", critere: [t("Forme dédoublée en Q : "), L(tangenteQL(e))], points: 1 },
    ],
    erreursFrequentes: [
      { description: [t("Branche supérieure dérivée pour un point d'ordonnée négative (pente de signe opposé)")], cout: "0 pt sur la pente, la suite est jugée sur sa cohérence" },
      { description: [t("Forme dédoublée avec "), L("x_Q^2"), t(" au lieu de "), L("x\\,x_Q"), t(", ou coefficient "), L("2p"), t(" pour la parabole")], cout: "0 pt sur l'étape 4" },
      { description: [t("Dérivée cherchée en un sommet de l'axe focal (division par zéro) au lieu d'une tangente verticale")], cout: "0 pt sur l'étape 4" },
    ],
    reponsesAcceptees: [[t("Toute équation équivalente de chaque tangente (multipliée par un nombre non nul, forme y = mx + p) ; pente sous forme de fraction ou de décimal exact")]],
  };
}

export function profilTD(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}

export const adaptateurEvaluationTD: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Tangente par la dérivée et forme dédoublée — Évaluation",
  nomFichierBase: "tangente-derivee-forme-dedoublee",
  genererInstance: genererExerciceTD,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeTD,
  bareme,
  enoncePapier,
  profilInstance: profilTD,
};
