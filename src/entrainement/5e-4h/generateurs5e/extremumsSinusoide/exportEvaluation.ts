import type { ExerciceExtremumsSinusoide, FonctionExtremum } from "../../core5e/extremumsSinusoide.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  ErreurFrequente,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import {
  consigneGeneraleExtremums,
  consigneSolutionsExtremums,
  formatEquationSubstitueeLatex,
  formatFonctionSourceLatex,
  formatSolutionsExtremumsLatex,
  formatTermesEtatActuelExtremums,
  latexAideNiveau1Extremums,
} from "../../ui5e/formatExtremumsSinusoide";
import { CATALOGUE_FONCTIONS_EXTREMUMS, construireAvecFonction, genererExerciceExtremumsSinusoide, valeurTrigVisee } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceExtremumsSinusoide>` pour 5gen11 (Extremums d'une
 * fonction sinusoïdale). Toutes les valeurs viennent des MÊMES fonctions que l'écran interactif
 * (`formatEquationSubstitueeLatex`, `formatTermesEtatActuelExtremums`, `formatSolutionsExtremumsLatex`)
 * — jamais un second calcul.
 *
 * Papier (`.claude/rules/feuilles-evaluations.md`) : l'énoncé imprimé ne garde que la fonction et la
 * consigne globale (avec le mode : maximums, minimums ou tous les extremums) ; les 3 écrans
 * (équation, isoler x, positions dans [0 ; 2π[) sont les étapes du corrigé.
 */

const NOM_MODE_DE = { maximums: "des maximums", minimums: "des minimums", extremums: "des extremums" } as const;

function construireEnonce(exercice: ExerciceExtremumsSinusoide): SectionExercice {
  return {
    enteteFragments: [texte("On considère la fonction "), latex(`f(x) = ${formatFonctionSourceLatex(exercice)}`)],
    questions: [
      { consigne: [texte(`Écris l'équation qui donne les positions ${NOM_MODE_DE[exercice.mode]} (k entier).`)] },
      { consigne: [texte("Isole x dans cette série.")] },
      { consigne: [texte(consigneSolutionsExtremums(exercice))] },
    ],
  };
}

function enoncePapier(exercice: ExerciceExtremumsSinusoide): EnoncePapier {
  return {
    section: {
      enteteFragments: [
        texte("On considère la fonction "),
        latex(`f(x) = ${formatFonctionSourceLatex(exercice)}`),
        texte(`. ${consigneGeneraleExtremums(exercice).replace("cette fonction", "f")}`),
      ],
      questions: [],
    },
  };
}

/** Série en x, reprise de l'état « solutions » de l'écran interactif (« x = constante + k·période »). */
function serieXLatex(exercice: ExerciceExtremumsSinusoide): string {
  return formatTermesEtatActuelExtremums(exercice, "solutions")[1];
}

function reponseBreve(exercice: ExerciceExtremumsSinusoide): FragmentConsigne[] {
  return [texte("Pour tout x réel : "), latex(serieXLatex(exercice)), texte(" ; dans [0 ; 2π[ : "), latex(formatSolutionsExtremumsLatex(exercice.solutions))];
}

const NOM_MODE = { maximums: "les maximums", minimums: "les minimums", extremums: "les extremums" } as const;


/** Phrase de méthode de l'étape 1 (valeur visée par sin/cos), en clair — la formule suit en LaTeX. */
function methodeEquation(exercice: ExerciceExtremumsSinusoide): string {
  const f = exercice.fonction;
  if (exercice.mode === "extremums") return `Les extremums sont atteints quand ${f}(u) vaut 1 ou −1 : les deux cas se réunissent en une seule série, de période π.`;
  const vise = valeurTrigVisee(exercice.mode, exercice.amplitude);
  const signe = exercice.amplitude.signe > 0 ? "positive" : "négative";
  return `L'amplitude est ${signe} : ${NOM_MODE[exercice.mode]} sont atteints quand ${f}(u) = ${vise === 1 ? "1" : "−1"} — une seule série, de période 2π.`;
}

function correctionDetaillee(exercice: ExerciceExtremumsSinusoide): EtapeCorrection[] {
  const piege =
    exercice.mode === "extremums"
      ? "Tous les extremums réunis : la période de la série en u est π (et non 2π) — une seule équation suffit."
      : exercice.amplitude.signe < 0
        ? `Amplitude négative : ${NOM_MODE[exercice.mode]} sont atteints quand ${exercice.fonction}(u) = ${exercice.mode === "maximums" ? "−1" : "1"}, et non l'inverse.`
        : `${NOM_MODE[exercice.mode].charAt(0).toUpperCase()}${NOM_MODE[exercice.mode].slice(1)} seuls : une seule série, de période 2π — ne pas réunir avec l'autre valeur.`;
  return [
    { label: "Méthode", sousQuestion: "a", fragments: [texte(`${methodeEquation(exercice)} `), latex(latexAideNiveau1Extremums(exercice).replace(/X/g, "u"))] },
    { label: "Calcul", sousQuestion: "a", fragments: [latex(formatEquationSubstitueeLatex(exercice))] },
    { label: "Méthode", sousQuestion: "b", fragments: [texte("On retranche la constante, puis on divise TOUT par le coefficient de x — la période aussi.")] },
    { label: "Calcul", sousQuestion: "b", fragments: [latex(serieXLatex(exercice))] },
    { label: "Méthode", sousQuestion: "c", fragments: [texte("On donne à k des valeurs entières successives (…, −1, 0, 1, 2, …) et on garde les x de [0 ; 2π[.")] },
    { label: "Conclusion", sousQuestion: "c", fragments: [latex(formatSolutionsExtremumsLatex(exercice.solutions))] },
    { label: "Piège", sousQuestion: "a", fragments: [texte(piege)] },
  ];
}

/** Corrigé historique (pipeline Word/PDF). */
function construireCorrection(exercice: ExerciceExtremumsSinusoide): BlocCorrection[] {
  return [
    { type: "paragraphe", fragments: [latex(formatEquationSubstitueeLatex(exercice)), texte(".")] },
    { type: "paragraphe", fragments: [latex(serieXLatex(exercice))] },
    { type: "paragraphe", fragments: [texte("Dans [0 ; 2π[ : "), latex(formatSolutionsExtremumsLatex(exercice.solutions))] },
  ];
}

function bareme(exercice: ExerciceExtremumsSinusoide): BaremeExercice {
  const erreursFrequentes: ErreurFrequente[] = [];
  if (exercice.mode === "extremums") {
    erreursFrequentes.push({ description: [texte("Période 2π : une seule des deux valeurs (1 ou −1) traitée")], cout: "−1" });
  } else {
    if (exercice.amplitude.signe < 0) erreursFrequentes.push({ description: [texte("Valeur visée inversée (amplitude négative ignorée)")], cout: "0 pt sur a)" });
    erreursFrequentes.push({ description: [texte("Maximums et minimums réunis (période π) alors qu'un seul type est demandé")], cout: "−1" });
  }
  erreursFrequentes.push({ description: [texte("Constante divisée par le coefficient de x, mais pas la période")], cout: "−1" });
  return {
    reponseFinale: reponseBreve(exercice),
    criteres: [
      { sousQuestion: "a", critere: [texte(`Équation des positions ${exercice.mode === "extremums" ? "des extremums (période π)" : `${NOM_MODE[exercice.mode].replace("les ", "des ")} (valeur visée, période 2π)`}`)], points: 1.5 },
      { sousQuestion: "b", critere: [texte("x isolé, période divisée par le coefficient de x")], points: 1.5 },
      { sousQuestion: "c", critere: [texte("Positions dans [0 ; 2π[, toutes et une seule fois")], points: 1 },
    ],
    erreursFrequentes,
    reponsesAcceptees: [[texte("Toute écriture équivalente de la série (k parcouru dans l'autre sens, constante décalée d'une période)")], [texte("Valeurs approchées au centième")]],
  };
}

function difficulte(exercice: ExerciceExtremumsSinusoide): 1 | 2 | 3 {
  return exercice.mode !== "extremums" && exercice.amplitude.signe < 0 ? 3 : 2;
}

export const adaptateurEvaluationExtremumsSinusoide: AdaptateurFeuilleExercices<ExerciceExtremumsSinusoide> = {
  titreDocument: "Extremums d'une fonction sinusoïdale — Évaluation",
  nomFichierBase: "extremums-sinusoide",
  genererInstance: genererExerciceExtremumsSinusoide,
  catalogueVariantes: CATALOGUE_FONCTIONS_EXTREMUMS,
  genererInstanceAvecVariante: (id) => construireAvecFonction(id as FonctionExtremum),
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 6,
};

