import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { lettreEtape, texte } from "../../../export/corrigeTableau";
import type { Exercice132 } from "../../core6e/lireConique";
import { phases132 } from "../../core6e/lireConique";
import { consigne132, consigneGlobale132, figure132, reponse132, situation132 } from "../../ui6e/formatLireConique";
import { fr } from "../../ui6e/outilsLieuxLotH1";
import { CATALOGUE_132, construireAvecVariante132, genererExercice132 } from "./index";
import { correctionDetaillee132 } from "./corrigeDetaille";

/**
 * Adaptateur papier de `6gen132` « Lire une conique sur sa figure ou son équation réduite » (Connaître).
 * Énoncé papier = équation, figure ou situation + consigne globale identique pour les trois natures (la
 * nature est le verdict : jamais dans la consigne, jamais dans `forme`, jamais cas particulier) ; les
 * écrans deviennent les étapes du corrigé, figure complète sous le dernier résultat. Écrans de pure
 * lecture (nature, axe, sommets ; tout `optique`) ; critères fixes (`sansCharge`) : niveau et durée
 * constants pour les trois natures. Aucun `calcul` (reconnaître, lire : la calculatrice ne donne rien).
 * Regroupement : `equation` (ligne = l'équation) et `figure` (une figure par ligne) ; `optique` écarté
 * (situation propre à l'instance).
 */

type E = Exercice132;
const t = texte;

function construireEnonce(e: E): SectionExercice {
  const fig = figure132(e, "nature");
  return { enteteFragments: fr(situation132(e)), ...(fig ? { enteteHtml: fig } : {}), questions: phases132(e).map((p) => ({ consigne: fr(consigne132(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return phases132(e).flatMap((p, i) => [...(i > 0 ? [t(" ; ")] : []), ...fr(reponse132(e, p))]);
}

function enoncePapier(e: E): EnoncePapier {
  const fig = figure132(e, "nature");
  return {
    section: { enteteFragments: fr(situation132(e)), ...(fig ? { enteteHtml: fig } : {}), questions: [{ consigne: fr(consigneGlobale132(e)) }] },
    etapesParQuestion: [phases132(e).map((_, i) => lettreEtape(i))],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

/** Lettres des écrans de pure lecture. */
function lectures(e: E): string[] {
  if (e.variante === "optique") return ["a", "b"];
  return ["a", "b", "c"];
}

function criteresDifficulte(e: E): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetaillee132(e), lectures(e)), methode: 0, piege: 0, nombres: 0, sansCharge: true };
}

const LIB: Record<string, string> = {
  nature: "Nature reconnue : ",
  axe: "Axe focal ou sens d'ouverture : ",
  sommets: "Sommets : ",
  foyers: "Foyers (relation entre a, b, c ou p/2) : ",
  excentricite: "Excentricité : ",
  asymptotes: "Asymptotes : ",
  directrice: "Directrice : ",
  equation: "Équation réduite : ",
  naturePropriete: "Conique : ",
  propriete: "Propriété optique énoncée : ",
};

function bareme(e: E): BaremeExercice {
  const ph = phases132(e);
  const pts = ph.length === 5 ? [0.5, 0.5, 1, 1, 1] : ph.length === 4 ? [0.5, 0.5, 1, 2] : [2, 2];
  return {
    reponseFinale: reponseBreve(e),
    criteres: ph.map((p, i) => ({ sousQuestion: lettreEtape(i), critere: [t(LIB[p]!), ...fr(reponse132(e, p))], points: pts[i]! })),
    erreursFrequentes: [
      ...(e.variante === "optique" ? [{ description: [t("Miroir elliptique censé concentrer des rayons parallèles")], cout: "0 pt sur la propriété" }] : [{ description: [t("a² lu sous x² au lieu du plus grand dénominateur (axe focal faux)")], cout: "0 pt sur l'axe ; la suite est corrigée avec la lecture de l'élève" }]),
      ...(e.variante === "equation" ? [{ description: [t("c² = a² + b² pour une ellipse (ou l'inverse), foyer de la parabole à p au lieu de p/2")], cout: "0 pt sur les foyers" }] : []),
      ...(e.variante === "figure" ? [{ description: [t("Équation de la parabole écrite avec 4p au lieu de 2p")], cout: "moitié des points de l'équation" }] : []),
    ],
    reponsesAcceptees: [[t("Points dans un ordre quelconque ; valeurs exactes équivalentes ; toute équation proportionnelle (forme développée comprise)")]],
  };
}

export function profil132(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}

export const adaptateurEvaluation132: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Lire une conique sur sa figure ou son équation réduite — Évaluation",
  nomFichierBase: "lire-conique",
  genererInstance: genererExercice132,
  catalogueVariantes: CATALOGUE_132,
  genererInstanceAvecVariante: (id: string) => construireAvecVariante132(id),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetaillee132,
  bareme,
  enoncePapier,
  profilInstance: profil132,
};
