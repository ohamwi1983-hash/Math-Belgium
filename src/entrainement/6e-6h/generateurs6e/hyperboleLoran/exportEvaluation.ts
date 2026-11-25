import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { texte } from "../../../export/corrigeTableau";
import type { ExerciceLO } from "../../core6e/hyperboleLoran";
import { PHASES_LO, positions } from "../../core6e/hyperboleLoran";
import { nL } from "../../ui6e/outilsConiquesLotH2";
import { consigne, equationL, LIBELLES_BRANCHE, positionsL, situation } from "../../ui6e/formatHyperboleLoran";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceLO } from "./index";
import { correctionDetailleeLO } from "./corrigeDetaille";

/**
 * Adaptateur papier de `6gen142` « Hyperbole de navigation : LORAN ». Énoncé papier = la situation
 * (émetteurs, retard, vitesse, route) + consigne globale ; les quatre écrans deviennent les étapes a–d du
 * corrigé (schéma : branche, route, positions). La branche (émetteur reçu en premier) est un verdict tiré
 * dans chaque série ; le nombre de positions dépend de la route (variante) : groupe à verdict
 * `groupe_route` (une ou deux positions) dans le panneau d'évaluation. Niveau et durée constants : quatre
 * étapes qui transforment, méthode 2 (modéliser la mesure par une hyperbole), piège 1 (point de l'autre
 * branche, ou deux positions). `forme` = route ; aucun cas particulier ; aucun `calcul` (modéliser :
 * règle du 24/11). Regroupement écarté : situation propre à l'instance.
 */

type E = ExerciceLO;
const t = texte;
const fr = (x: unknown) => x as FragmentConsigne[];
const L = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(situation(e)), questions: PHASES_LO.map((p) => ({ consigne: fr(consigne(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return [L(`|PA-PB|=${nL(2 * e.a)}\\text{ km}`), t(" ; "), t(LIBELLES_BRANCHE[e.premier].replace(/^./, (c) => c.toLowerCase())), t(" de "), L(equationL(e)), t(positions(e).length === 1 ? " ; position : " : " ; deux positions possibles : "), L(positionsL(e))];
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: { enteteFragments: fr(situation(e)), questions: [{ consigne: [t("Montre que le navire se trouve sur une branche d'hyperbole dont tu donneras l'équation réduite (précise laquelle des deux branches), puis détermine la ou les positions possibles du navire sur sa route. Justifie.")] }] },
    etapesParQuestion: [["a", "b", "c", "d"]],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function criteresDifficulte(_e: E): CriteresDifficulte {
  return { etapesTransformation: 4, etapesLecture: 0, methode: 2, piege: 1, nombres: 0, sansCharge: true };
}

function bareme(e: E): BaremeExercice {
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [L(`|PA-PB|=0{,}3\\cdot\\Delta t=${nL(2 * e.a)}\\text{ km}`)], points: 0.5 },
      { sousQuestion: "b", critere: [t("Branche justifiée par l'émetteur reçu en premier")], points: 1 },
      { sousQuestion: "c", critere: [t("Équation : "), L(equationL(e))], points: 1 },
      { sousQuestion: "d", critere: [t("Positions : "), L(positionsL(e)), t(positions(e).length === 1 ? ", l'autre point rejeté" : ", les deux possibles")], points: 1.5 },
    ],
    erreursFrequentes: [
      { description: [L("a"), t(" pris égal à la différence des distances (au lieu de "), L("2a"), t(")")], cout: "0 pt sur l'équation, la suite est jugée sur sa cohérence" },
      { description: [t("Point de l'autre branche gardé, ou une seule des deux positions possibles")], cout: "moitié des points de l'étape 4" },
      { description: [t("Durée en microsecondes multipliée par une vitesse en km/s sans conversion")], cout: "0 pt sur l'étape 1" },
    ],
    reponsesAcceptees: [[t("Toute équation équivalente ; positions dans un ordre libre")]],
  };
}

export function profilLO(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}

export const adaptateurEvaluationLO: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Hyperbole de navigation : LORAN — Évaluation",
  nomFichierBase: "hyperbole-navigation-loran",
  genererInstance: genererExerciceLO,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeLO,
  bareme,
  enoncePapier,
  profilInstance: profilLO,
  groupesVerdict: [{ id: "groupe_route", label: "Route quelconque (une ou deux positions, tirée au hasard)", variantes: ["parallele", "perpendiculaire"] }],
};
