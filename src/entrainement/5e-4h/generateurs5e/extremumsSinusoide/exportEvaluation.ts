import type { ExerciceExtremumsSinusoide, FonctionExtremum } from "../../core5e/extremumsSinusoide.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CriteresDifficulte,
  EnoncePapier,
  ErreurFrequente,
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
} from "../../ui5e/formatExtremumsSinusoide";
import { CATALOGUE_FONCTIONS_EXTREMUMS, construireAvecFonction, genererExerciceExtremumsSinusoide } from "./index";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { correctionDetailleeExtremumsSinusoide } from "./corrigeDetaille";
import { profilExtremumsSinusoide, PARAMETRES_SINUSOIDE } from "../profilsEvaluationTrigonometrie";

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

/** Niveau (grille commune) : aucun écran de lecture ; méthode imposée (la série du cours) ; piège
 * dans les DONNÉES : amplitude négative quand on cherche les maximums ou les minimums seuls (valeur
 * visée inversée). Nombres : angles kπ/n non remarquables (`anglesEnPi`). */
function criteresDifficulte(exercice: ExerciceExtremumsSinusoide): CriteresDifficulte {
  return {
    ...etapesDuCorrige(correctionDetailleeExtremumsSinusoide(exercice)),
    methode: 0,
    piege: exercice.mode !== "extremums" && exercice.amplitude.signe < 0 ? 1 : 0,
    anglesEnPi: true,
  };
}

export const adaptateurEvaluationExtremumsSinusoide: AdaptateurFeuilleExercices<ExerciceExtremumsSinusoide> = {
  profilInstance: profilExtremumsSinusoide,
  parametresAuChoix: PARAMETRES_SINUSOIDE,
  titreDocument: "Extremums d'une fonction sinusoïdale — Évaluation",
  nomFichierBase: "extremums-sinusoide",
  genererInstance: genererExerciceExtremumsSinusoide,
  catalogueVariantes: CATALOGUE_FONCTIONS_EXTREMUMS,
  genererInstanceAvecVariante: (id) => construireAvecFonction(id as FonctionExtremum),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeExtremumsSinusoide,
  bareme,
  enoncePapier,
};

