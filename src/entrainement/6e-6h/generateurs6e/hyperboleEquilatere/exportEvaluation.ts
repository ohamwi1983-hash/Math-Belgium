import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { lettreEtape, texte } from "../../../export/corrigeTableau";
import type { Exercice137 } from "../../core6e/hyperboleEquilatere";
import { phases137 } from "../../core6e/hyperboleEquilatere";
import { consigne137, consigneGlobale137, reponse137, situation137 } from "../../ui6e/formatHyperboleEquilatere";
import { fr } from "../../ui6e/outilsLieuxLotH1";
import { CATALOGUE_137, construireAvecVariante137, genererExercice137 } from "./index";
import { correctionDetaillee137 } from "./corrigeDetaille";

/**
 * Adaptateur papier de `6gen137` « Hyperbole équilatère et xy = k » (Appliquer). Énoncé papier =
 * équation donnée + repère d'arrivée décrit + consigne globale ; écrans → étapes du corrigé, figure sous
 * le dernier résultat. Méthode 0 (formules du cours), piège 1 (k = a²/2, jamais a²), aucun cas
 * particulier, `forme` = la variante. Aucun `calcul`. Regroupement : ligne = l'équation donnée (une
 * consigne par variante).
 */

type E = Exercice137;
const t = texte;

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(situation137(e)), questions: phases137(e).map((p) => ({ consigne: fr(consigne137(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return phases137(e).flatMap((p, i) => [...(i > 0 ? [t(" ; ")] : []), ...fr(reponse137(e, p))]);
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: { enteteFragments: fr(situation137(e)), questions: [{ consigne: fr(consigneGlobale137(e)) }] },
    etapesParQuestion: [phases137(e).map((_, i) => lettreEtape(i))],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function criteresDifficulte(e: E): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetaillee137(e), []), methode: 0, piege: 1, nombres: 0, sansCharge: true };
}

function bareme(e: E): BaremeExercice {
  const ph = phases137(e);
  const lib: Record<string, string> = { c: "c² = 2a² : ", k: "k = a²/2 : ", sommetsXY: "Sommets dans le repère des asymptotes : ", a2: "a² = 2k : ", sommets: "Sommets : ", foyers: "Foyers : " };
  return {
    reponseFinale: reponseBreve(e),
    criteres: ph.map((p, i) => ({ sousQuestion: lettreEtape(i), critere: [t(lib[p]!), ...fr(reponse137(e, p))], points: [1, 1.5, 1.5][i]! })),
    erreursFrequentes: [
      { description: [t(e.variante === "versXY" ? "k = a² au lieu de a²/2" : "a² = k au lieu de 2k")], cout: "0 pt sur cette constante ; la suite est corrigée avec la valeur de l'élève" },
      { description: [t("Éléments donnés dans le mauvais repère")], cout: "moitié des points de l'élément" },
    ],
    reponsesAcceptees: [[t("Valeurs exactes équivalentes (√8 = 2√2…) ; points dans un ordre quelconque")]],
  };
}

export function profil137(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}

export const adaptateurEvaluation137: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Hyperbole équilatère et xy = k — Évaluation",
  nomFichierBase: "hyperbole-equilatere",
  genererInstance: genererExercice137,
  catalogueVariantes: CATALOGUE_137,
  genererInstanceAvecVariante: (id: string) => construireAvecVariante137(id),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetaillee137,
  bareme,
  enoncePapier,
  profilInstance: profil137,
};
