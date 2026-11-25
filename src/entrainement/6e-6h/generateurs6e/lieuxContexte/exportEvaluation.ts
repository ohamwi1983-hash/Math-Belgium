import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { texte } from "../../../export/corrigeTableau";
import type { ExerciceLC } from "../../core6e/lieuxContexte";
import { extremites, nature, PHASES } from "../../core6e/lieuxContexte";
import { listeL } from "../../ui6e/outilsLieuxLotH2";
import { CONSIGNE_GLOBALE, consigne, equationLieuL, NATURES, situation } from "../../ui6e/formatLieuxContexte";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceLC } from "./index";
import { correctionDetailleeLC } from "./corrigeDetaille";

/**
 * Adaptateur papier de `6gen130` « Lieux en contexte : un point qui bouge ». Énoncé papier = la
 * situation (avec le paramètre qu'elle définit) + consigne globale (exprimer, éliminer, restreindre) ;
 * aucune figure dans l'énoncé (la situation est décrite en mots et en coordonnées), la figure du lieu
 * (partie décrite, points exclus en creux) est dans le corrigé. Niveau et durée constants : trois
 * étapes qui transforment + une lecture (extrémités), méthode 2 (l'élève construit le modèle), piège 1
 * (la restriction imposée par le contexte). `forme` = situation ; aucun cas particulier ; aucun `calcul`
 * (modéliser et éliminer : tiré « interdite » ET « autorisée »). Regroupement écarté : situation propre
 * à l'instance.
 */

type E = ExerciceLC;
const t = texte;
const fr = (x: unknown) => x as FragmentConsigne[];
const L = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(situation(e)), questions: PHASES.map((p) => ({ consigne: fr(consigne(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  const exclu = nature(e) === "droitePrivee";
  return [L(equationLieuL(e)), t(" ; "), t(NATURES[nature(e)].replace(/^./, (c) => c.toLowerCase())), t(exclu ? " ; point exclu " : " ; extrémités "), L(listeL(extremites(e)))];
}

function enoncePapier(e: E): EnoncePapier {
  return { section: { enteteFragments: fr(situation(e)), questions: [{ consigne: [t(CONSIGNE_GLOBALE)] }] }, etapesParQuestion: [["a", "b", "c", "d"]], reponseBreve: reponseBreve(e) };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function criteresDifficulte(_e: E): CriteresDifficulte {
  return { etapesTransformation: 3, etapesLecture: 1, methode: 2, piege: 1, nombres: 0, sansCharge: true };
}

function bareme(e: E): BaremeExercice {
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t(e.variante === "radars" || e.variante === "pied" ? "Seconde génératrice en fonction de m" : "Coordonnées du point mobile en fonction du paramètre")], points: 1 },
      { sousQuestion: "b", critere: [t("Paramètre éliminé, équation du lieu complet : "), L(equationLieuL(e))], points: 1.5 },
      { sousQuestion: "c", critere: [t("Partie décrite, justifiée par la situation : "), t(NATURES[nature(e)].replace(/^./, (c) => c.toLowerCase()))], points: 1 },
      { sousQuestion: "d", critere: [t(nature(e) === "droitePrivee" ? "Point exclu : " : "Extrémités : "), L(listeL(extremites(e)))], points: 0.5 },
    ],
    erreursFrequentes: [
      { description: [t("Lieu complet donné comme réponse, sans tenir compte de la situation")], cout: "0 pt sur la partie décrite" },
      { description: [t("Paramètre mal exprimé (milieu, moyenne ou pente oubliés)")], cout: "0 pt sur l'étape 1, la suite est jugée sur sa propre cohérence" },
    ],
    reponsesAcceptees: [[t("Toute équation équivalente ; toute description équivalente de la partie (inégalités sur x et y, extrémités)")]],
  };
}

export function profilLC(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}

export const adaptateurEvaluationLC: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Lieux en contexte : un point qui bouge — Évaluation",
  nomFichierBase: "lieux-en-contexte-point-qui-bouge",
  genererInstance: genererExerciceLC,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeLC,
  bareme,
  enoncePapier,
  profilInstance: profilLC,
};
