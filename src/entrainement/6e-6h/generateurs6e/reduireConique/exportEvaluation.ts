import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { lettreEtape, texte } from "../../../export/corrigeTableau";
import type { Exercice134 } from "../../core6e/reduireConique";
import { phases134 } from "../../core6e/reduireConique";
import { consigne134, consigneGlobale134, reponse134, situation134 } from "../../ui6e/formatReduireConique";
import { fr } from "../../ui6e/outilsLieuxLotH1";
import { CATALOGUE_134, construireAvecVariante134, genererExercice134 } from "./index";
import { correctionDetaillee134 } from "./corrigeDetaille";

/**
 * Adaptateur papier de `6gen134` « Réduire par translation et donner tous les éléments » (Appliquer).
 * Énoncé papier = équation développée + consigne globale identique pour les trois natures ; les six
 * écrans deviennent les étapes du corrigé (complétion des carrés une transformation par ligne, retour au
 * repère initial, figure complète). La nature est un verdict : groupe `groupe_nature` (panneau
 * d'évaluation seulement), jamais dans `forme`, jamais cas particulier ; critères fixes (lecture de la
 * nature, méthode 1, piège 1 — second membre négatif, p contre 2p, a² sous y² —, `sansCharge`) : niveau et
 * durée constants dans le groupe. Aucun `calcul` (réduire une équation : la calculatrice ne le fait pas).
 * Regroupement : ligne = l'équation.
 */

type E = Exercice134;
const t = texte;

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(situation134(e)), questions: phases134(e).map((p) => ({ consigne: fr(consigne134(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return phases134(e).flatMap((p, i) => [...(i > 0 ? [t(" ; ")] : []), ...fr(reponse134(e, p))]);
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: { enteteFragments: fr(situation134(e)), questions: [{ consigne: fr(consigneGlobale134()) }] },
    etapesParQuestion: [phases134(e).map((_, i) => lettreEtape(i))],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function criteresDifficulte(e: E): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetaillee134(e), ["c"]), methode: 1, piege: 1, nombres: 0, sansCharge: true };
}

const LIB: Record<string, string> = {
  centre: "Carrés complétés, centre ou sommet : ",
  reduite: "Équation réduite : ",
  nature: "Nature et axe focal : ",
  sommets: "Sommets (repère initial) : ",
  foyers: "Foyers (repère initial) : ",
  foyer: "Foyer (repère initial) : ",
  directrices: "Directrices : ",
  directrice: "Directrice : ",
  asymptotes: "Asymptotes : ",
  parametre: "Paramètre : ",
};

function bareme(e: E): BaremeExercice {
  const ph = phases134(e);
  const pts = [1, 0.5, 0.5, 0.5, 0.75, 0.75];
  return {
    reponseFinale: reponseBreve(e),
    criteres: ph.map((p, i) => ({ sousQuestion: lettreEtape(i), critere: [t(LIB[p]!), ...fr(reponse134(e, p))], points: pts[i]! })),
    erreursFrequentes: [
      { description: [t("Coefficient du carré non mis en évidence, ou signes du centre inversés")], cout: "0 pt sur le centre ; la suite est corrigée avec les valeurs de l'élève" },
      { description: [t("Division par un second membre négatif sans inverser les signes (axe focal faux)")], cout: "0 pt sur l'équation réduite et la nature" },
      { description: [t("Éléments laissés dans le repère translaté")], cout: "moitié des points de chaque élément concerné" },
      ...(e.C.nature === "parabole" ? [{ description: [t("2p ou p/2 donné pour p")], cout: "0 pt sur le paramètre" }] : []),
    ],
    reponsesAcceptees: [[t("Équations proportionnelles (formes développées comprises) ; points dans un ordre quelconque ; valeurs exactes équivalentes")]],
  };
}

export function profil134(_e: E): ProfilInstance {
  return { casParticulier: null, forme: "reduire" };
}

export const adaptateurEvaluation134: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Réduire par translation et donner tous les éléments — Évaluation",
  nomFichierBase: "reduire-conique",
  genererInstance: genererExercice134,
  catalogueVariantes: CATALOGUE_134,
  genererInstanceAvecVariante: (id: string) => construireAvecVariante134(id),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetaillee134,
  bareme,
  enoncePapier,
  profilInstance: profil134,
  groupesVerdict: [{ id: "groupe_nature", label: "Conique à réduire (nature tirée au hasard)", variantes: ["ellipse", "hyperbole", "parabole"] }],
};
