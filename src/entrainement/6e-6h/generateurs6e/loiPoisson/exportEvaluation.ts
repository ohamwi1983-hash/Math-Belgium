import type { ExerciceLoiPoisson } from "../../core6e/loiPoisson.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, CriteresDifficulte, FragmentConsigne, ProfilInstance } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { FORMAT_6GEN53, evenementB } from "../../ui6e/formatLoiPoisson";
import { phasesPourExercice } from "../../moteur6e/typesLoiPoisson";
import type { PhaseLoiPoisson } from "../../moteur6e/typesLoiPoisson";
import { lambdaA } from "../../moteur6e/verificationLoiPoisson";
import { ar, dl, frag } from "../../ui6e/corrigeVariablesAleatoires";
import { construireAdaptateurCombinatoire, lettresEcrans } from "../adaptateurCombinatoire";
import { correctionDetailleeLoiPoisson } from "./corrigeDetaille";
import { resultatB } from "./familles";
import { probabilitePoisson } from "./poisson";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLoiPoisson } from "./index";

/**
 * Adaptateur papier de `6gen53` (loi de Poisson, 6e ch. 8, § 8) — refonte du lot E de l'audit :
 * situation en prose (avec la probabilité cherchée) + consigne globale ; les écrans deviennent les étapes
 * du corrigé. A : « Peut-on approcher… ? Justifie à l'aide des conditions du cours » (les conditions sont
 * vérifiées dans le corrigé, jamais « les 3 conditions suivantes » absentes) ; B : la consigne ne dit plus
 * d'ajuster λ (c'est le piège : il passe dans le corrigé).
 *
 * Profil (règle du 24/11) : aucune réponse donnée directement par la calculatrice (juger les conditions,
 * ajuster λ, choisir somme / complément) → pas de `exacte` ; e^(−λ) exige la calculatrice partout →
 * `calcul: 'calculatrice'` pour TOUTES les instances (jamais selon le verdict de A, qui serait filtré) et
 * `calculatriceIndispensable: true`. Aucun cas particulier. A : niveau et durée constants pour les deux
 * verdicts (critères posés, pas mesurés sur le corrigé, qui a 2 ou 3 étapes selon le verdict).
 */

type E = ExerciceLoiPoisson;
const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

export function situationPapier53(e: E): FragmentConsigne[] {
  if (e.famille === "A") return [...frag(e.texte), t(" On s'intéresse à "), l(`P(X=${e.k})`), t(".")];
  return [t(`${e.texte} On note `), l("X"), t(` ${e.definitionX} ; on admet que `), l("X"), t(" suit une loi de Poisson. On cherche "), l(evenementB(e)), t(".")];
}

export const CONSIGNE_A_53 = "Peut-on approcher la loi de $X$ par une loi de Poisson ? Justifie à l'aide des conditions du cours. Si oui, donne son paramètre $\\lambda$ et calcule cette probabilité, arrondie à $10^{-4}$.";
export const CONSIGNE_B_53 = "Calcule cette probabilité, arrondie à $10^{-4}$.";

function questions(e: E): { consigne: FragmentConsigne[]; etapes: string[] }[] {
  return [{ consigne: frag(e.famille === "A" ? CONSIGNE_A_53 : CONSIGNE_B_53), etapes: lettresEcrans(phasesPourExercice, e) }];
}

function reponseBreve(e: E): FragmentConsigne[] {
  if (e.famille === "A") {
    if (!e.approximable) {
      const c = e.condition === "n" ? "n\\geq 30" : e.condition === "p" ? "p\\leq 0{,}1" : "n\\times p\\leq 15";
      return [t("Non : la condition "), l(c), t(" n'est pas vérifiée.")];
    }
    const lam = lambdaA(e);
    return [t("Oui : "), l(`\\lambda=${dl(lam)}`), t(" ; "), l(`P(X=${e.k})\\approx ${ar(probabilitePoisson(lam, e.k), 4)}`)];
  }
  return [l(`\\lambda=${dl(e.lambda)}`), t(" ; "), l(`${evenementB(e)}\\approx ${ar(resultatB(e), 4)}`)];
}

function criteres(e: E): CriteresDifficulte {
  // A : trois étapes sans charge pour les DEUX verdicts (le niveau imprimé ne trahit pas la réponse) ;
  // appliquer les conditions du cours (méthode 1). B : ajuster λ puis choisir somme / complément
  // (méthode 1) ; piège dans les données quand l'échelle du taux diffère de celle de la question.
  if (e.famille === "A") return { etapesTransformation: 3, etapesLecture: 0, lettresSansCharge: [], methode: 1, piege: 0, nombres: 1, sansCharge: true };
  const ajuste = !/\\dfrac\{([^}]*)\}\{\1\}/.test(e.calculLambda);
  return { ...etapesDuCorrige(correctionDetailleeLoiPoisson(e), []), methode: 1, piege: ajuste ? 1 : 0, nombres: 1 };
}

function bareme(e: E): BaremeExercice {
  if (e.famille === "A") {
    const lam = lambdaA(e);
    return {
      reponseFinale: reponseBreve(e),
      criteres: e.approximable
        ? [
            { sousQuestion: "a", critere: frag(`Trois conditions vérifiées : $n=${e.n}\\geq 30$, $p=${dl(e.pCentiemes / 100)}\\leq 0{,}1$, $n\\times p=${dl(lam)}\\leq 15$`), points: 1.5 },
            { sousQuestion: "b", critere: frag(`$\\lambda=n\\times p=${dl(lam)}$`), points: 1 },
            { sousQuestion: "c", critere: frag(`$P(X=${e.k})\\approx ${ar(probabilitePoisson(lam, e.k), 4)}$`), points: 1.5 },
          ]
        : [
            { sousQuestion: "a", critere: [t("Les trois conditions testées, conclusion « pas d'approximation »")], points: 2.5 },
            { sousQuestion: "b", critere: [t("Condition "), ...reponseBreve(e).slice(1, 2), t(" non vérifiée, donc pas d'approximation")], points: 1.5 },
          ],
      erreursFrequentes: [
        { description: [t("Condition "), l("n\\times p\\leq 15"), t(" oubliée")], cout: "moitié des points de l'étape 1" },
        ...(e.approximable ? [{ description: [t("Probabilité calculée avec "), l("p"), t(" au lieu de "), l("\\lambda")], cout: "0 pt sur l'étape 3" }] : []),
      ],
      reponsesAcceptees: [[t("La valeur de la calculatrice (loi de Poisson) à "), l("10^{-4}"), t(" près")]],
    };
  }
  const res = ar(resultatB(e), 4);
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Paramètre ajusté à l'échelle de la question : "), l(`\\lambda=${dl(e.lambda)}`)], points: 1.5 },
      {
        sousQuestion: "b",
        critere:
          e.typeQuestion === "exactement"
            ? [t("Terme "), l("e^{-\\lambda}\\,\\dfrac{\\lambda^{k}}{k!}"), t(" : "), l(evenementB(e)), t(" ≈ "), l(res)]
            : e.typeQuestion === "auMoins"
              ? [t("Complément "), l(`1-P(X\\leq ${e.k - 1})`), t(" : "), l(evenementB(e)), t(" ≈ "), l(res)]
              : [t("Somme des termes : "), l(evenementB(e)), t(" ≈ "), l(res)],
        points: 2.5,
      },
    ],
    erreursFrequentes: [
      { description: [t("Taux recopié comme "), l("\\lambda"), t(" sans l'adapter à l'échelle")], cout: "0 pt sur l'étape 1, l'étape 2 notée sur la suite" },
      ...(e.typeQuestion === "auMoins" ? [{ description: [t("Complément de "), l(`X\\leq ${e.k}`), t(" au lieu de "), l(`X\\leq ${e.k - 1}`)], cout: "1 pt sur l'étape 2" }] : []),
      ...(e.typeQuestion === "auPlus" || e.typeQuestion === "entreAetB" ? [{ description: [t("Une borne oubliée dans la somme")], cout: "1 pt sur l'étape 2" }] : []),
    ],
    reponsesAcceptees: [[t("La valeur des probabilités cumulées de la calculatrice ; un écart de "), l("10^{-4}"), t(" dû à des termes arrondis en route")]],
  };
}

export function profilLoiPoisson(_e: E): ProfilInstance {
  return { casParticulier: null, calcul: "calculatrice" };
}

export const adaptateurEvaluationLoiPoisson: AdaptateurFeuilleExercices<E> = construireAdaptateurCombinatoire<E, PhaseLoiPoisson>({
  titreDocument: "Loi de Poisson — Évaluation",
  nomFichierBase: "loi-poisson",
  genererInstance: genererExerciceLoiPoisson,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  format: FORMAT_6GEN53,
  phases: phasesPourExercice,
  situation: situationPapier53,
  questions,
  reponseBreve,
  correction: correctionDetailleeLoiPoisson,
  bareme,
  criteres,
  profil: profilLoiPoisson,
  calculatriceIndispensable: true,
});
