import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { lettreEtape, texte } from "../../../export/corrigeTableau";
import type { Exercice133 } from "../../core6e/representerConique";
import { phases133 } from "../../core6e/representerConique";
import { consigne133, consigneGlobale133, reponse133, situation133 } from "../../ui6e/formatRepresenterConique";
import { fr } from "../../ui6e/outilsLieuxLotH1";
import { CATALOGUE_133, construireAvecVariante133, genererExercice133 } from "./index";
import { correctionDetaillee133 } from "./corrigeDetaille";

/**
 * Adaptateur papier de `6gen133` « Représenter une conique » (Connaître). Énoncé papier = équation +
 * « Représente-la… » ; la réponse est un GRAPHIQUE : la figure complète va dans le corrigé (sous le
 * dernier résultat), jamais dans l'énoncé. Placer un point lu = lecture ; foyers (c² = a² ∓ b², p/2),
 * directrice et points au niveau du foyer = étapes. Aucun `calcul`, aucun cas particulier, `forme` = la
 * nature (visible dans l'équation). Regroupement : ligne = l'équation (consigne commune aux trois natures).
 */

type E = Exercice133;
const t = texte;

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(situation133(e)), questions: phases133(e).map((p) => ({ consigne: fr(consigne133(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return phases133(e).flatMap((p, i) => [...(i > 0 ? [t(" ; ")] : []), ...fr(reponse133(e, p))]);
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: { enteteFragments: fr(situation133(e)), questions: [{ consigne: fr(consigneGlobale133()) }] },
    etapesParQuestion: [phases133(e).map((_, i) => lettreEtape(i))],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

/** Écrans de pure lecture (placer un point dont les coordonnées se lisent sur l'équation). */
function lectures(e: E): string[] {
  if (e.C.nature === "ellipse") return ["a", "b", "c"];
  if (e.C.nature === "hyperbole") return ["a", "b", "d"];
  return ["a"];
}

function criteresDifficulte(e: E): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetaillee133(e), lectures(e)), methode: 0, piege: 0, nombres: 0, sansCharge: true };
}

const LIB: Record<string, string> = {
  centre: "Centre placé : ",
  sommet: "Sommet placé : ",
  sommetsFocaux: "Sommets de l'axe focal : ",
  sommetsNonFocaux: "Sommets de l'autre axe : ",
  foyers: "Foyers (c calculé) : ",
  foyer: "Foyer (p/2) : ",
  rectangle: "Rectangle et asymptotes : ",
  piedDirectrice: "Directrice : ",
  cordeFocale: "Points au niveau du foyer, courbe tracée : ",
};

function bareme(e: E): BaremeExercice {
  const ph = phases133(e);
  const pts = [0.5, 1, 1, 1.5];
  return {
    reponseFinale: reponseBreve(e),
    criteres: ph.map((p, i) => ({ sousQuestion: lettreEtape(i), critere: [t(LIB[p]!), ...fr(reponse133(e, p))], points: pts[i]! })),
    erreursFrequentes: [
      { description: [t("Signes du centre inversés (h lu au lieu de −h)")], cout: "0 pt sur le centre ; la suite est corrigée à partir du centre de l'élève" },
      { description: [t(e.C.nature === "parabole" ? "Foyer ou directrice à p au lieu de p/2 du sommet" : "c² = a² + b² pour l'ellipse (ou a² − b² pour l'hyperbole)")], cout: "0 pt sur cet élément" },
      { description: [t("Courbe non tracée ou ne passant pas par les points placés")], cout: "moitié des points du dernier critère" },
    ],
    reponsesAcceptees: [[t("Points placés à main levée sur le quadrillage, à une demi-unité près ; courbe tracée à main levée")]],
  };
}

export function profil133(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}

export const adaptateurEvaluation133: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Représenter une conique — Évaluation",
  nomFichierBase: "representer-conique",
  genererInstance: genererExercice133,
  catalogueVariantes: CATALOGUE_133,
  genererInstanceAvecVariante: (id: string) => construireAvecVariante133(id),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetaillee133,
  bareme,
  enoncePapier,
  profilInstance: profil133,
};
