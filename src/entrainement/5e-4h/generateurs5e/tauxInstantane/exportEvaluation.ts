import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/corrigeTableau";
import type { ExerciceTauxInstantane } from "../../core5e/tauxInstantane";
import { consigne, consigneGenerale, F, PHASES, phraseContexte, reponse, uniteTaux, V } from "../../ui5e/formatTauxInstantane";
import { decL } from "../../ui5e/ecrituresApplicationsDerivees";
import { tauxInstantane } from "../../core5e/tauxInstantane";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceTauxInstantane } from "./index";
import { correctionDetailleeTauxInstantane } from "./corrigeDetaille";

/**
 * Adaptateur papier de `5gen70` « Taux de variation instantané en contexte ». Énoncé papier = le
 * contexte et le modèle, puis TROIS vraies questions : a) taux moyen sur [a ; b] (étape a) ; b) taux
 * instantané en a et son unité (étapes b, c, d) ; c) interprétation (étape e). Pas de regroupement
 * a), b), c) (vraies questions, contexte propre à l'instance).
 */

type E = ExerciceTauxInstantane;
const t = texte;
const f = latex;
const fr = (x: unknown) => x as FragmentConsigne[];

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(consigneGenerale(e)), questions: PHASES.map((p) => ({ consigne: fr(consigne(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return [t("a) "), ...fr(reponse(e, "moyen")), t(" ; b) "), f(`${F(e)}'(${e.a})=${decL(tauxInstantane(e))}`), t(` ${uniteTaux(e)} ; c) `), ...fr(reponse(e, "interpretation"))];
}

function enoncePapier(e: E): EnoncePapier {
  const n = F(e);
  const v = V(e);
  return {
    section: {
      enteteFragments: fr(phraseContexte(e)),
      questions: [
        { consigne: [t(`Calcule le taux de variation moyen de ${n} entre `), f(`${v}=${e.a}`), t(" et "), f(`${v}=${e.b}`), t(".")] },
        { consigne: [t(`Calcule le taux de variation instantané de ${n} en `), f(`${v}=${e.a}`), t(" et donne son unité.")] },
        { consigne: [t("Interprète ce taux instantané dans le contexte.")] },
      ],
    },
    etapesParQuestion: [["a"], ["b", "c", "d"], ["e"]],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

/** Cinq étapes (unité et interprétation sont des décisions, pas des lectures) ; méthode 1 (modèle
 * donné, formules du cours) ; aucun piège dans les données (le signe est le verdict : constant) ;
 * nombres exacts. */
function criteresDifficulte(_e: E): CriteresDifficulte {
  return { etapesTransformation: 5, etapesLecture: 0, methode: 1, piege: 0, nombres: 0, sansCharge: true };
}

function bareme(e: E): BaremeExercice {
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Taux moyen : "), ...fr(reponse(e, "moyen"))], points: 1 },
      { sousQuestion: "b", critere: [t("Dérivée : "), ...fr(reponse(e, "derivee"))], points: 0.5 },
      { sousQuestion: "c", critere: [t("Taux instantané : "), ...fr(reponse(e, "instantane"))], points: 1 },
      { sousQuestion: "d", critere: [t(`Unité : ${uniteTaux(e)}`)], points: 0.5 },
      { sousQuestion: "e", critere: [t("Interprétation (signe, instant, vitesse de variation)")], points: 1 },
    ],
    erreursFrequentes: [
      { description: [t("Variation non divisée par la longueur de l'intervalle")], cout: "moitié des points de l'étape 1" },
      { description: [t("Valeur f(a) donnée à la place de f′(a)")], cout: "0 pt sur l'étape 3" },
      { description: [t("Unité de la grandeur seule (sans « par … »)")], cout: "0 pt sur l'étape 4" },
      { description: [t("Interprétation qui confond instant et moyenne, ou qui ignore le signe")], cout: "0 pt sur l'étape 5" },
    ],
    reponsesAcceptees: [[t("Taux moyen en fraction ou en décimal ; interprétation équivalente (« chaque … supplémentaire fait varier la grandeur d'environ … »)")]],
  };
}

/** `forme` = contexte ; le signe de f′(a) (verdict de l'interprétation) reste tiré au hasard ; tout
 * est exact (pas de `calcul`). */
export function profilTauxInstantane(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}

export const adaptateurEvaluationTauxInstantane: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Taux de variation instantané en contexte — Évaluation",
  nomFichierBase: "taux-instantane-contexte",
  genererInstance: genererExerciceTauxInstantane,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeTauxInstantane,
  bareme,
  enoncePapier,
  profilInstance: profilTauxInstantane,
};
