import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/corrigeTableau";
import type { ExerciceApproximationAffine } from "../../core5e/approximationAffine";
import { calculatriceL, consigne, consigneGenerale, fL, nombreL, PHASES, relationCalculatrice, reponse, uniteL } from "../../ui5e/formatApproximationAffine";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceApproximationAffine } from "./index";
import { correctionDetailleeApproximationAffine } from "./corrigeDetaille";

/**
 * Adaptateur papier de `5gen68` « Approximation affine ». Énoncé papier = le nombre à estimer, la
 * fonction, la valeur de la calculatrice + UNE consigne globale « estime…, puis calcule l'erreur
 * commise » ; les cinq écrans (a et h, f′(x), f(a) et f′(a), approximation, erreur) sont les étapes
 * a–e du corrigé. Contexte (cube, plaque) : le récit, la valeur exacte et la même consigne.
 */

type E = ExerciceApproximationAffine;
const t = texte;
const f = latex;
const fr = (x: unknown) => x as FragmentConsigne[];
const estTrigo = (e: E) => e.fn === "sin" || e.fn === "cos" || e.fn === "tan";

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(consigneGenerale(e)), questions: PHASES.map((p) => ({ consigne: fr(consigne(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return [...fr(reponse(e, "approx")), t(" ; "), ...fr(reponse(e, "erreur"))];
}

function enoncePapier(e: E): EnoncePapier {
  if (e.contexte) {
    const ctx = fr(consigneGenerale(e)).slice(0, -1);
    return {
      section: {
        enteteFragments: [
          ...ctx,
          t(e.contexte === "cube" ? " Estime son nouveau volume sans calculatrice, à l'aide de l'approximation affine de V. Sa valeur exacte est " : " Estime sa nouvelle aire sans calculatrice, à l'aide de l'approximation affine de A. Sa valeur exacte est "),
          f(`${nombreL(e)}=${calculatriceL(e)}${uniteL(e)}`),
          t(" : calcule l'erreur commise, à deux chiffres significatifs."),
        ],
        questions: [],
      },
      reponseBreve: reponseBreve(e),
    };
  }
  return {
    section: {
      enteteFragments: [
        t("Estime "),
        f(nombreL(e)),
        t(" sans calculatrice, à l'aide de l'approximation affine de la fonction "),
        f(fL(e)),
        t(estTrigo(e) ? " (x en radians) près d'un nombre bien choisi. La calculatrice affiche " : " près d'un nombre bien choisi. La calculatrice affiche "),
        f(`${nombreL(e)}${relationCalculatrice(e)}${calculatriceL(e)}`),
        t(" : calcule l'erreur commise, à deux chiffres significatifs."),
      ],
      questions: [],
    },
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

/** Cinq étapes (choisir a et h est une décision) ; méthode 1 (formule du cours, a à choisir) ; piège
 * dans les données : h < 0 ; nombres 1 (valeur approchée et arrondi à deux chiffres significatifs). */
function criteresDifficulte(e: E): CriteresDifficulte {
  return { etapesTransformation: 5, etapesLecture: 0, methode: 1, piege: e.h < 0 ? 1 : 0, nombres: 1, sansCharge: true };
}

function bareme(e: E): BaremeExercice {
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Choix de a et h : "), ...fr(reponse(e, "ah"))], points: 0.5 },
      { sousQuestion: "b", critere: [t("Dérivée : "), ...fr(reponse(e, "derivee"))], points: 0.5 },
      { sousQuestion: "c", critere: [t("Valeur et pente en a : "), ...fr(reponse(e, "valeurs"))], points: 1 },
      { sousQuestion: "d", critere: [t("Approximation affine : "), ...fr(reponse(e, "approx"))], points: 1 },
      { sousQuestion: "e", critere: [t("Erreur commise : "), ...fr(reponse(e, "erreur"))], points: 1 },
    ],
    erreursFrequentes: [
      { description: [t("h pris sans son signe (ou égal au nombre lui-même)")], cout: "0 pt sur l'étape 1, suite notée sans double pénalité" },
      { description: [t("Dérivée de référence fausse (facteur 2 de la racine, signe de 1/x ou de cos)")], cout: "moitié des points des étapes 2 et 3" },
      { description: [t("Approximation sans f(a), ou sans multiplier par h")], cout: "0 pt sur l'étape 4" },
      { description: [t("Erreur négative ou mal arrondie (zéros comptés de travers)")], cout: "moitié des points de l'étape 5" },
    ],
    reponsesAcceptees: [[t("Erreur écrite en décimal ou en notation scientifique, à deux ou trois chiffres significatifs")]],
  };
}

/** `forme` = variante + signe de h (piège dans les données) ; aucun cas particulier ni verdict. Tout
 * se fait sans calculatrice (valeur de la calculatrice DONNÉE) : pas de `calcul`. */
export function profilApproximationAffine(e: E): ProfilInstance {
  return { casParticulier: null, forme: `${e.variante}|${e.h < 0 ? "h-" : "h+"}` };
}

export const adaptateurEvaluationApproximationAffine: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Approximation affine — Évaluation",
  nomFichierBase: "approximation-affine",
  genererInstance: genererExerciceApproximationAffine,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeApproximationAffine,
  bareme,
  enoncePapier,
  profilInstance: profilApproximationAffine,
};
