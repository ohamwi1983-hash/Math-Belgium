import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { lettreEtape, texte } from "../../../export/corrigeTableau";
import type { Exercice111, Famille111 } from "../../core6e/transformationAffineVA";
import { PHASES_111 } from "../../core6e/transformationAffineVA";
import { consigne111, consigneGlobale111, reponse111, situation111 } from "../../ui6e/formatTransformationAffineVA";
import { fr } from "../../ui6e/outilsVariablesAleatoiresLotH1";
import { CATALOGUE_111, construireAvecVariante111, genererExercice111 } from "./index";
import { correctionDetaillee111 } from "./corrigeDetaille";

/**
 * Adaptateur papier de `6gen111` « Y = aX + b ». Énoncé papier = situation (avec E(X) et V(X) ou
 * σ(X)) + consigne globale ; les quatre écrans deviennent les étapes du corrigé. Aucun `calcul` :
 * appliquer les propriétés de E et V (la calculatrice ne les donne pas ; décision du 24/11) — tiré
 * « interdite » ET « autorisée ». Aucun cas particulier. `forme` = donnée de dispersion (variance ou
 * écart-type : une ligne de calcul de plus). Regroupement a), b), c) : entrée `6gen111` de
 * `REGROUPEMENTS` (consigne commune, ligne = la situation).
 */

type E = Exercice111;
const t = texte;

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(situation111(e)), questions: PHASES_111.map((p) => ({ consigne: fr(consigne111(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return PHASES_111.flatMap((p, i) => [...(i > 0 ? [t(" ; ")] : []), ...fr(p === "coefficients" ? reponse111(e, p).slice(0, 1) : reponse111(e, p))]);
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: { enteteFragments: fr(situation111(e)), questions: [{ consigne: fr(consigneGlobale111()) }] },
    etapesParQuestion: [PHASES_111.map((_, i) => lettreEtape(i))],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function criteresDifficulte(e: E): CriteresDifficulte {
  // Méthode 1 : traduire la situation en Y = aX + b, puis choisir la bonne propriété pour chaque
  // indicateur. Piège dans les DONNÉES : a < 0 (l'écart-type reste positif).
  return { ...etapesDuCorrige(correctionDetaillee111(e), []), methode: 1, piege: e.a < 0 ? 1 : 0, nombres: 0 };
}

function bareme(e: E): BaremeExercice {
  const pts = [1, 1, 1, 1];
  const lib = ["Expression de Y en fonction de X : ", "Espérance (linéarité) : ", "Variance (a²V(X)) : ", "Écart-type (|a|σ(X)) : "];
  return {
    reponseFinale: reponseBreve(e),
    criteres: PHASES_111.map((p, i) => ({ sousQuestion: lettreEtape(i), critere: [t(lib[i]!), ...fr(p === "coefficients" ? reponse111(e, p).slice(0, 1) : reponse111(e, p))], points: pts[i]! })),
    erreursFrequentes: [
      { description: [t("Variance transformée comme l'espérance (aV(X) + b)")], cout: "0 pt sur la variance" },
      { description: [t("b ajouté à l'écart-type, ou écart-type négatif quand a < 0")], cout: "0 pt sur l'écart-type" },
      { description: [t("Signe de b ou de a mal traduit")], cout: "0 pt sur l'étape 1, la suite est corrigée avec la valeur de l'élève" },
    ],
    reponsesAcceptees: [[t("Toute écriture exacte équivalente (fraction ou décimal) ; σ(Y) obtenu comme racine de V(Y)")]],
  };
}

export function profil111(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.donnee };
}

export const adaptateurEvaluation111: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Transformation affine Y = aX + b — Évaluation",
  nomFichierBase: "transformation-affine-variable",
  genererInstance: genererExercice111,
  catalogueVariantes: CATALOGUE_111,
  genererInstanceAvecVariante: (id: string) => construireAvecVariante111(id as Famille111),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetaillee111,
  bareme,
  enoncePapier,
  profilInstance: profil111,
};
