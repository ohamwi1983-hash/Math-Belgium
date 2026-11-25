import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/corrigeTableau";
import type { ExerciceTI } from "../../core6e/termeIndependant";
import { existe, PHASES_TI } from "../../core6e/termeIndependant";
import { consigne, enonce, expressionL, reponse } from "../../ui6e/formatTermeIndependant";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceTI } from "./index";
import { correctionDetailleeTI } from "./corrigeDetaille";

/**
 * Adaptateur papier de `6gen107` « Terme indépendant ». Énoncé papier = « Détermine le terme
 * indépendant de x dans le développement de (…)ⁿ, s'il existe. » + « Justifie chaque étape. » ; les
 * trois écrans (exposant, k, terme) deviennent les étapes a, b, c du corrigé. Le VERDICT (le terme
 * existe ou non) est tiré à parts égales dans chaque série, jamais dans `forme` (= la famille) ;
 * niveau et durée ne dépendent pas du verdict (trois étapes `sansCharge`, méthode 1, piège = b
 * négatif, tiré indépendamment du verdict ; nombres 0). Aucun cas particulier (« aucun » est un
 * verdict), aucun `calcul` (la calculatrice ne trouve pas k). Regroupement a), b), c) : entrée
 * `6gen107` de `REGROUPEMENTS` (consigne commune, ligne = l'expression).
 */

type E = ExerciceTI;
const t = texte;
const fr = (x: unknown) => x as FragmentConsigne[];

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(enonce(e)), questions: PHASES_TI.map((p) => ({ consigne: fr(consigne(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return fr(reponse(e, "terme"));
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: {
      enteteFragments: [t("Détermine le terme indépendant de "), latex("x"), t(" dans le développement de "), latex(expressionL(e)), t(", s'il existe.")],
      questions: [{ consigne: [t("Justifie chaque étape.")] }],
    },
    etapesParQuestion: [["a", "b", "c"]],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: [...fr(reponse(e, "exposant")), t(" ; "), ...fr(reponse(e, "k")), t(" ; "), ...fr(reponse(e, "terme"))] }];
}

function criteresDifficulte(e: E): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeTI(e), []), methode: 1, piege: e.b < 0 ? 1 : 0, nombres: 0, sansCharge: true };
}

function bareme(e: E): BaremeExercice {
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Terme général et exposant de x : "), ...fr(reponse(e, "exposant"))], points: 1.5 },
      { sousQuestion: "b", critere: [t("Équation « exposant = 0 », k entier ou non : "), ...fr(reponse(e, "k"))], points: 1.5 },
      { sousQuestion: "c", critere: [t(existe(e) ? "Valeur du terme : " : "Conclusion : "), ...fr(reponse(e, "terme"))], points: 1 },
    ],
    erreursFrequentes: [
      { description: [t("Exposant négatif du second terme oublié (exposant de x faux)")], cout: "0 pt sur l'étape 1" },
      { description: [t("k non entier arrondi au lieu de conclure qu'il n'y a pas de terme indépendant")], cout: "0 pt sur les étapes 2 et 3" },
      { description: [t("Signe de bᵏ ou puissance de a oubliés dans la valeur du terme")], cout: "moitié des points de l'étape 3" },
      { description: [t("Rang k confondu avec k + 1 (terme voisin calculé)")], cout: "moitié des points de l'étape 3" },
    ],
    reponsesAcceptees: [[t("Terme général écrit avec l'ordre inverse des termes du binôme si les exposants sont cohérents ; valeur laissée sous la forme d'un produit si le calcul est posé")]],
  };
}

/** `forme` = famille seule (jamais l'existence du terme : c'est un verdict). */
export function profilTI(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}

export const adaptateurEvaluationTI: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Terme indépendant — Évaluation",
  nomFichierBase: "terme-independant",
  genererInstance: genererExerciceTI,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeTI,
  bareme,
  enoncePapier,
  profilInstance: profilTI,
};
