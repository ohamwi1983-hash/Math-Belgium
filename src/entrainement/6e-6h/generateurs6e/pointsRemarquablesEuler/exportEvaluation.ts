import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { lettreEtape, texte } from "../../../export/corrigeTableau";
import type { Exercice124 } from "../../core6e/pointsRemarquablesEuler";
import { PHASES_124 } from "../../core6e/pointsRemarquablesEuler";
import { consigne124, consigneGlobale124, reponse124, situation124 } from "../../ui6e/formatPointsRemarquablesEuler";
import { fr } from "../../ui6e/outilsLieuxLotH1";
import { CATALOGUE_124, construireAvecVariante124, genererExercice124 } from "./index";
import { correctionDetaillee124 } from "./corrigeDetaille";

/**
 * Adaptateur papier de `6gen124` « Points remarquables et droite d'Euler ». Énoncé papier = les trois
 * sommets + consigne globale (G, médiatrice de [AB], hauteur issue de C, O, H, N, alignement de O, G,
 * H) ; les six écrans deviennent les étapes du corrigé (figure de la droite d'Euler et du cercle
 * circonscrit à la dernière étape). Aucun `calcul` (établir des équations et les couper : la démarche
 * est évaluée, décision du 24/11) ; aucun cas particulier ; `forme` = type du triangle (visible).
 * Regroupement a), b), c) : entrée `6gen124` de `REGROUPEMENTS` (consigne commune, ligne = les trois
 * sommets).
 */

type E = Exercice124;
const t = texte;

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(situation124(e)), questions: PHASES_124.map((p) => ({ consigne: fr(consigne124(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return PHASES_124.flatMap((p, i) => [...(i > 0 ? [t(" ; ")] : []), ...(p === "mediatrice" ? [t("médiatrice : ")] : p === "hauteur" ? [t("hauteur : ")] : []), ...fr(reponse124(e, p))]);
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: { enteteFragments: fr(situation124(e)), questions: [{ consigne: fr(consigneGlobale124()) }] },
    etapesParQuestion: [PHASES_124.map((_, i) => lettreEtape(i))],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function criteresDifficulte(e: E): CriteresDifficulte {
  // Choisir les deux médiatrices / hauteurs à couper (méthode 1) ; aucun piège dans les données ;
  // valeurs entières ou demi-entières.
  return { ...etapesDuCorrige(correctionDetaillee124(e), []), methode: 1, piege: 0, nombres: 0 };
}

const LIBELLES: Record<string, string> = {
  G: "G, moyenne des sommets : ",
  mediatrice: "Médiatrice de [AB] (milieu, vecteur normal) : ",
  O: "O, intersection de deux médiatrices : ",
  hauteur: "Hauteur issue de C : ",
  H: "H, intersection de deux hauteurs : ",
  N: "N, milieu de [OH], et alignement de O, G, H : ",
};
const POIDS = [0.5, 0.75, 0.75, 0.5, 0.75, 0.75];

function bareme(e: E): BaremeExercice {
  return {
    reponseFinale: reponseBreve(e),
    criteres: PHASES_124.map((p, i) => ({ sousQuestion: lettreEtape(i), critere: [t(LIBELLES[p]!), ...fr(reponse124(e, p))], points: POIDS[i]! })),
    erreursFrequentes: [
      { description: [t("Vecteur normal pris comme vecteur directeur (droite parallèle au côté)")], cout: "0 pt sur l'équation ; la suite est corrigée avec la droite de l'élève" },
      { description: [t("O ou H confondu avec G (moyenne des sommets)")], cout: "0 pt sur l'étape concernée" },
      { description: [t("Alignement affirmé sans calcul de vecteurs")], cout: "moitié des points de la dernière étape" },
    ],
    reponsesAcceptees: [[t("Toute équation proportionnelle (forme y = mx + p comprise) ; O et H par toute paire de médiatrices / hauteurs")]],
  };
}

export function profil124(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}

export const adaptateurEvaluation124: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Points remarquables et droite d'Euler — Évaluation",
  nomFichierBase: "points-remarquables-euler",
  genererInstance: genererExercice124,
  catalogueVariantes: CATALOGUE_124,
  genererInstanceAvecVariante: (id: string) => construireAvecVariante124(id),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetaillee124,
  bareme,
  enoncePapier,
  profilInstance: profil124,
};
