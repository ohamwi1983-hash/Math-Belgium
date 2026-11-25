import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { lettreEtape, texte } from "../../../export/corrigeTableau";
import type { Exercice123 } from "../../core6e/demontrerAnalytique";
import { PHASES_123 } from "../../core6e/demontrerAnalytique";
import { consigne123, consigneGlobale123, egalites123, enonce123, reperes123, reponse123 } from "../../ui6e/formatDemontrerAnalytique";
import { fr } from "../../ui6e/outilsLieuxLotH1";
import { CATALOGUE_123, construireAvecVariante123, genererExercice123 } from "./index";
import { correctionDetaillee123 } from "./corrigeDetaille";

/**
 * Adaptateur papier de `6gen123` « Démontrer par la géométrie analytique » (Transférer). Énoncé papier =
 * « Démontre que… » + consigne globale (rédiger : repère, coordonnées, égalité, calcul) — jamais la
 * méthode ni le repère ; les quatre écrans deviennent les étapes du corrigé (figure de la configuration
 * à la dernière). Aucun `calcul` (démontrer), aucun cas particulier ; `forme` = propriété. Regroupement
 * a), b), c) écarté : l'énoncé EST la propriété propre à l'instance (une consigne « Démontre chaque
 * propriété » laisserait des lignes de longueurs très différentes — possible, mais une démonstration se
 * corrige mieux seule).
 */

type E = Exercice123;
const t = texte;

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(enonce123(e)), questions: PHASES_123.map((p) => ({ consigne: fr(consigne123(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return [t("Repère "), ...fr(reperes123(e)[0]!), t(" ; "), ...fr(reponse123(e, "coordonnees")), t(" ; égalité à établir : "), ...fr(egalites123(e)[0]!.fr), t(" ; "), ...fr(reponse123(e, "calcul"))];
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: { enteteFragments: fr(enonce123(e)), questions: [{ consigne: fr(consigneGlobale123()) }] },
    etapesParQuestion: [PHASES_123.map((_, i) => lettreEtape(i))],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function criteresDifficulte(e: E): CriteresDifficulte {
  // L'élève construit lui-même le modèle (repère, paramètres, égalité) : méthode 2 ; aucun piège dans
  // les données ; calcul littéral exact.
  return { ...etapesDuCorrige(correctionDetaillee123(e), []), methode: 2, piege: 0, nombres: 0 };
}

function bareme(e: E): BaremeExercice {
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: lettreEtape(0), critere: [t("Repère adapté, paramètres quelconques : "), ...fr(reperes123(e)[0]!)], points: 1 },
      { sousQuestion: lettreEtape(1), critere: [t("Coordonnées des points construits : "), ...fr(reponse123(e, "coordonnees"))], points: 1 },
      { sousQuestion: lettreEtape(2), critere: [t("Égalité qui traduit la conclusion : "), ...fr(egalites123(e)[0]!.fr)], points: 0.5 },
      { sousQuestion: lettreEtape(3), critere: [t("Calcul des deux membres et conclusion générale : "), ...fr(reponse123(e, "calcul"))], points: 1.5 },
    ],
    erreursFrequentes: [
      { description: [t("Démonstration sur un exemple numérique")], cout: "au plus 1 pt pour l'ensemble" },
      { description: [t("Repère trop particulier (angle droit, côtés égaux imposés)")], cout: "0 pt sur le repère ; moitié des points du calcul" },
      { description: [t("Conclusion non rédigée (« pour toutes les valeurs des lettres »)")], cout: "−0,5" },
    ],
    reponsesAcceptees: [[t("Tout autre repère adapté qui ne perd pas la généralité (autre sommet à l'origine, sans le facteur 2…) ; toute écriture équivalente des coordonnées")]],
  };
}

export function profil123(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.support };
}

export const adaptateurEvaluation123: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Démontrer par la géométrie analytique — Évaluation",
  nomFichierBase: "demontrer-analytique",
  genererInstance: genererExercice123,
  catalogueVariantes: CATALOGUE_123,
  genererInstanceAvecVariante: (id: string) => construireAvecVariante123(id),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetaillee123,
  bareme,
  enoncePapier,
  profilInstance: profil123,
};
