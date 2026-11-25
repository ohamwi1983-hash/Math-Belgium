import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { lettreEtape, texte } from "../../../export/corrigeTableau";
import type { Exercice135 } from "../../core6e/foyerDirectrice";
import { phases135 } from "../../core6e/foyerDirectrice";
import { consigne135, consigneGlobale135, reponse135, situation135 } from "../../ui6e/formatFoyerDirectrice";
import { fr } from "../../ui6e/outilsLieuxLotH1";
import { CATALOGUE_135, construireAvecVariante135, genererExercice135 } from "./index";
import { correctionDetaillee135 } from "./corrigeDetaille";

/**
 * Adaptateur papier de `6gen135` « Équation depuis foyer, directrice et excentricité » (Appliquer).
 * Énoncé papier = F, d, e + consigne globale (identique pour les trois natures) ; écrans → étapes du
 * corrigé, figure sous le dernier résultat. La nature est un verdict tiré dans la variante : jamais dans
 * `forme` (= direction de la directrice, visible), jamais cas particulier ; critères fixes (lecture de la
 * nature, méthode 0 — démarche imposée par la définition —, piège 1 pour la directrice horizontale ET
 * verticale, pour que le niveau ne dise rien, `sansCharge`). Aucun `calcul` (établir une équation).
 * Regroupement : ligne = les données (F, d et e).
 */

type E = Exercice135;
const t = texte;

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(situation135(e)), questions: phases135(e).map((p) => ({ consigne: fr(consigne135(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return phases135(e).flatMap((p, i) => [...(i > 0 ? [t(" ; ")] : []), ...fr(reponse135(e, p))]);
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: { enteteFragments: fr(situation135(e)), questions: [{ consigne: fr(consigneGlobale135()) }] },
    etapesParQuestion: [phases135(e).map((_, i) => lettreEtape(i))],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function criteresDifficulte(e: E): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetaillee135(e), ["a"]), methode: 0, piege: 1, nombres: 0, sansCharge: true };
}

function bareme(e: E): BaremeExercice {
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Nature justifiée par la valeur de e : "), ...fr(reponse135(e, "nature"))], points: 0.5 },
      { sousQuestion: "b", critere: [t("Condition |PF|² = e²·dist(P ; d)² traduite et développée : "), ...fr(reponse135(e, "equation"))], points: 2.5 },
      { sousQuestion: "c", critere: [t("Sommet entre F et d : "), ...fr(reponse135(e, "sommet"))], points: 1 },
    ],
    erreursFrequentes: [
      { description: [t("e non élevé au carré")], cout: "1 pt sur l'équation" },
      { description: [t("Distance à la directrice mesurée avec la mauvaise coordonnée")], cout: "moitié des points de l'équation" },
      { description: [t("Sommet pris au milieu de [FH] alors que e ≠ 1")], cout: "0 pt sur le sommet" },
    ],
    reponsesAcceptees: [[t("Toute équation proportionnelle (forme non développée comprise) ; coordonnées exactes équivalentes")]],
  };
}

export function profil135(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}

export const adaptateurEvaluation135: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Équation depuis foyer, directrice et excentricité — Évaluation",
  nomFichierBase: "foyer-directrice-excentricite",
  genererInstance: genererExercice135,
  catalogueVariantes: CATALOGUE_135,
  genererInstanceAvecVariante: (id: string) => construireAvecVariante135(id),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetaillee135,
  bareme,
  enoncePapier,
  profilInstance: profil135,
};
