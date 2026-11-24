import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/corrigeTableau";
import type { ExerciceFonctionConditions } from "../../core5e/fonctionConditions";
import { conditions, consigne, consigneGenerale, FORME, PHASES, reponse } from "../../ui5e/formatFonctionConditions";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceFonctionConditions } from "./index";
import { correctionDetailleeFonctionConditions } from "./corrigeDetaille";

/**
 * Adaptateur papier de `5gen69` « Déterminer une fonction par des conditions ». Énoncé papier = la
 * forme de f et ses conditions + UNE consigne globale (sans donnée tirée : le regroupement a), b), c)
 * reste possible) ; les cinq écrans (c et d, système, résolution, dérivée, nature) sont les étapes a–e
 * du corrigé.
 */

type E = ExerciceFonctionConditions;
const t = texte;
const f = latex;
const fr = (x: unknown) => x as FragmentConsigne[];

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(consigneGenerale(e)), questions: PHASES.map((p) => ({ consigne: fr(consigne(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return [...fr(reponse(e, "resolution")).slice(-1), t(" ; "), ...fr(reponse(e, "nature"))];
}

/** Consigne globale (identique pour toutes les instances d'une variante). */
export function questionPapier(e: E): FragmentConsigne[] {
  if (e.variante === "inflexion")
    return [t("Détermine a, b, c et d, puis vérifie, en étudiant le signe de "), f("f''"), t(", que la courbe a bien un point d'inflexion, et précise sa concavité de part et d'autre.")];
  return [
    t("Détermine a, b, c et d, puis précise, en étudiant le signe de "),
    f("f'"),
    t(e.variante === "deuxTangentes" ? ", si le point d'abscisse non nulle à tangente horizontale est un maximum local, un minimum local ou ni l'un ni l'autre." : ", si le point à tangente horizontale est un maximum local, un minimum local ou ni l'un ni l'autre."),
  ];
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: { enteteFragments: [t("On cherche une fonction "), f(FORME), t(" dont la courbe admet "), ...fr(conditions(e)), t(". "), ...questionPapier(e)], questions: [] },
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

/** Cinq étapes (traduire les conditions est une décision) ; méthode 2 (l'élève construit le système) ;
 * piège CONSTANT par variante — tangente horizontale : une tangente horizontale n'est pas toujours un
 * extremum (le verdict « palier » n'est jamais trahi par le niveau) ; tout est entier. */
function criteresDifficulte(e: E): CriteresDifficulte {
  return { etapesTransformation: 5, etapesLecture: 0, methode: 2, piege: e.variante === "tangenteHorizontale" ? 1 : 0, nombres: 0, sansCharge: true };
}

function bareme(e: E): BaremeExercice {
  const inf = e.variante === "inflexion";
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Conditions directes : "), ...fr(reponse(e, "directes"))], points: 0.5 },
      { sousQuestion: "b", critere: [t("Système en a et b : "), ...fr(reponse(e, "systeme"))], points: 1 },
      { sousQuestion: "c", critere: [t("Système résolu : "), ...fr(reponse(e, "resolution")).slice(0, 3)], points: 1 },
      { sousQuestion: "d", critere: [t(inf ? "Dérivée seconde : " : "Dérivée : "), ...fr(reponse(e, "derivee"))], points: 0.5 },
      { sousQuestion: "e", critere: [t(inf ? "Signe de f″ et concavité justifiés : " : "Signe de f′ et nature justifiés : "), ...fr(reponse(e, "nature"))], points: 1 },
    ],
    erreursFrequentes: [
      { description: [t("c et d échangés (pente et ordonnée à l'origine de la tangente)")], cout: "0 pt sur l'étape 1, suite notée sans double pénalité" },
      { description: inf ? [t("Point d'inflexion traduit par "), f("f'(x_1)=0")] : [t("Tangente horizontale traduite par "), f("f(x_0)=0")], cout: "0 pt sur l'étape 2" },
      { description: [t("Erreur de calcul dans la résolution du système")], cout: "moitié des points de l'étape 3" },
      { description: inf ? [t("Concavité lue sur f′")] : [t("Extremum affirmé sans étude du signe de f′")], cout: "0 pt sur l'étape 5" },
    ],
    reponsesAcceptees: [[t("Signe étudié par un tableau de signes ou par des valeurs tests ; système résolu par substitution ou par combinaison")]],
  };
}

/** `forme` = variante ; le verdict (nature) reste tiré au hasard ; aucun cas particulier ; tout est
 * exact (pas de `calcul`). */
export function profilFonctionConditions(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}

export const adaptateurEvaluationFonctionConditions: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Déterminer une fonction par des conditions — Évaluation",
  nomFichierBase: "fonction-par-conditions",
  genererInstance: genererExerciceFonctionConditions,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeFonctionConditions,
  bareme,
  enoncePapier,
  profilInstance: profilFonctionConditions,
};
