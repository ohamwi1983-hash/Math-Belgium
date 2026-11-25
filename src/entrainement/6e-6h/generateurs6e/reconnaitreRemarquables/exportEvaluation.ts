import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { lettreEtape, texte } from "../../../export/corrigeTableau";
import type { Exercice125, Famille125 } from "../../core6e/reconnaitreRemarquables";
import { PHASES_125 } from "../../core6e/reconnaitreRemarquables";
import { NOM_OBJET, consigne125, consigneGlobale125, reponse125, situation125 } from "../../ui6e/formatReconnaitreRemarquables";
import { figure125 } from "../../ui6e/figureReconnaitreRemarquables";
import { fr } from "../../ui6e/outilsLieuxLotH1";
import { CATALOGUE_125, construireAvecVariante125, genererExercice125 } from "./index";
import { correctionDetaillee125 } from "./corrigeDetaille";

/**
 * Adaptateur papier de `6gen125` « Reconnaître droites, points et cercles remarquables » (Connaître).
 * Énoncé papier = phrase de situation + figure codée (sans le nom de l'objet) + consigne globale ; les
 * deux écrans deviennent les étapes du corrigé (figure légendée). L'OBJET est le verdict : tiré à parts
 * égales dans la famille, jamais dans `forme` (= la famille, visible), jamais cas particulier ; les
 * variantes (familles) ne disent pas la réponse → aucun groupe à verdict. Critères FIXES (deux lectures
 * de figure) : même niveau et même durée pour tous les objets. Aucun `calcul`. Regroupement écarté :
 * la figure est propre à l'instance ET c'est la donnée à interpréter.
 */

type E = Exercice125;
const t = texte;

function section(e: E, questions: SectionExercice["questions"]): SectionExercice {
  return { enteteFragments: fr(situation125(e)), enteteHtml: figure125(e), questions };
}

function construireEnonce(e: E): SectionExercice {
  return section(e, PHASES_125.map((p) => ({ consigne: fr(consigne125(e, p)) })));
}

const nomCourt = (e: E) => NOM_OBJET[e.objet].replace(/^./, (c) => c.toUpperCase());

function reponseBreve(e: E): FragmentConsigne[] {
  return [t(`${nomCourt(e)} ; `), ...fr(reponse125(e, "propriete"))];
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: section(e, [{ consigne: fr(consigneGlobale125(e)) }]),
    etapesParQuestion: [PHASES_125.map((_, i) => lettreEtape(i))],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function criteresDifficulte(): CriteresDifficulte {
  // Deux lectures de la figure codée (nommer, associer la propriété) : méthode 0, aucun piège dans les
  // données, critères fixes pour ne jamais trahir l'objet.
  return { etapesTransformation: 0, etapesLecture: 2, methode: 0, piege: 0, nombres: 0, sansCharge: true };
}

const CRITERE_PROPRIETE: Record<Famille125, string> = {
  droite: "Point de concours correct",
  point: "Propriété caractéristique correcte",
  cercle: "Position du centre correcte",
};

function bareme(e: E): BaremeExercice {
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: lettreEtape(0), critere: [t(`${nomCourt(e)}, justifié par les codages`)], points: 2 },
      { sousQuestion: lettreEtape(1), critere: [t(`${CRITERE_PROPRIETE[e.famille]} : `), ...fr(reponse125(e, "propriete"))], points: 2 },
    ],
    erreursFrequentes: [
      { description: [t("Nom juste sans justification par les codages")], cout: "moitié des points de l'étape 1" },
      { description: [t("Confusion médiane / bissectrice ou hauteur / médiatrice")], cout: "0 pt sur l'étape 1" },
    ],
    reponsesAcceptees: [[t("Toute formulation équivalente de la propriété (« équidistant des sommets », « à égale distance des trois sommets »…)")]],
  };
}

export function profil125(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.famille };
}

export const adaptateurEvaluation125: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Droites, points et cercles remarquables — Évaluation",
  nomFichierBase: "reconnaitre-remarquables",
  genererInstance: genererExercice125,
  catalogueVariantes: CATALOGUE_125,
  genererInstanceAvecVariante: (id: string) => construireAvecVariante125(id),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetaillee125,
  bareme,
  enoncePapier,
  profilInstance: profil125,
};
