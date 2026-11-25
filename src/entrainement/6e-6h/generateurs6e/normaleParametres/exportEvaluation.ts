import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { texte } from "../../../export/corrigeTableau";
import type { ExerciceNP } from "../../core6e/normaleParametres";
import { phases } from "../../core6e/normaleParametres";
import { consigne, question, reponse, situation } from "../../ui6e/formatNormaleParametres";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceNP } from "./index";
import { correctionDetailleeNP } from "./corrigeDetaille";

/**
 * Adaptateur papier de `6gen120` « Loi normale : retrouver μ ou σ ». Énoncé papier = situation (la ou
 * les proportions, en pourcentage à deux décimales : valeurs exactes de la table) + la question (σ, μ,
 * ou les deux, au dixième) ; les écrans deviennent les étapes du corrigé. `besoinTablePhi` (table à
 * l'envers, en annexe). Piège 1 CONSTANT (le signe de z est à trouver : un niveau qui varierait avec
 * lui le trahirait sur la feuille) ; méthode 1 (relation
 * x = μ + zσ à choisir et à retourner) ; aucun cas particulier ; aucun `calcul` (la Casio Graph Math+
 * donne Φ⁻¹, mais retrouver un paramètre EST le raisonnement : tiré « interdite » ET « autorisée »).
 * `forme` = variante. Regroupement écarté : situation propre à l'instance.
 */

type E = ExerciceNP;
const t = texte;
const fr = (x: unknown) => x as FragmentConsigne[];

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr([...situation(e), { type: "texte", valeur: " " }, ...question(e)]), questions: phases(e).map((p) => ({ consigne: fr(consigne(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  if (e.variante === "sigma") return fr(reponse(e, "sigma"));
  if (e.variante === "mu") return fr(reponse(e, "mu"));
  return [...fr(reponse(e, "mu")), t(" et "), ...fr(reponse(e, "sigma"))];
}

function enoncePapier(e: E): EnoncePapier {
  return { section: { enteteFragments: fr(situation(e)), questions: [{ consigne: fr(question(e)) }] }, etapesParQuestion: [phases(e).map((_p, i) => "abc"[i]!)], reponseBreve: reponseBreve(e) };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: [...fr(reponse(e, "z")), t(" ; "), ...reponseBreve(e)] }];
}

function criteresDifficulte(e: E): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeNP(e)), methode: 1, piege: 1, nombres: 0, sansCharge: true };
}

function bareme(e: E): BaremeExercice {
  const criteres =
    e.variante === "systeme"
      ? [
          { sousQuestion: "a", critere: [t("Valeurs de z (table à l'envers, signes) : "), ...fr(reponse(e, "z"))], points: 1.5 },
          { sousQuestion: "b", critere: [t("Écart-type par le système : "), ...fr(reponse(e, "sigma"))], points: 1.5 },
          { sousQuestion: "c", critere: [t("Moyenne : "), ...fr(reponse(e, "mu"))], points: 1 },
        ]
      : [
          { sousQuestion: "a", critere: [t("Valeur de z (table à l'envers, signe) : "), ...fr(reponse(e, "z"))], points: 2 },
          { sousQuestion: "b", critere: [t(e.variante === "sigma" ? "Écart-type : " : "Moyenne : "), ...reponseBreve(e)], points: 2 },
        ];
  return {
    reponseFinale: reponseBreve(e),
    criteres,
    erreursFrequentes: [
      { description: [t("Signe de z oublié (valeur sous la moyenne, ou proportion « plus de » supérieure à 50 %)")], cout: "moitié des points de l'étape 1" },
      { description: [t("Proportion « plus de » lue directement dans la table (complément oublié)")], cout: "0 pt sur l'étape 1" },
    ],
    reponsesAcceptees: [[t("z lu dans la table ou donné par la calculatrice (Φ inverse), paramètre au dixième")]],
  };
}

export function profilNP(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}

export const adaptateurEvaluationNP: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Loi normale : retrouver μ ou σ — Évaluation",
  nomFichierBase: "loi-normale-retrouver-parametres",
  genererInstance: genererExerciceNP,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeNP,
  bareme,
  enoncePapier,
  profilInstance: profilNP,
  besoinTablePhi: true,
};
