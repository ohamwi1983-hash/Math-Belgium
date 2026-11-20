import type { BrancheX, ExerciceEquationTrigonometrique } from "../../core5e/equationsTrigonometriques.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  CriteresDifficulte,
  EnoncePapier,
  ErreurFrequente,
  FragmentConsigne,
  QuestionExercice,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { formatBrancheLatex, relationBranche } from "../../ui5e/formatEquationTrig";
import { ensembleApproche, formatEnonceEquationTrigonometriqueLatex, formatEnsembleSolutionsLatex, produitContientTangente } from "../../ui5e/formatEquationTrigonometrique";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { correctionDetailleeEquationTrig, lettresSolutionsEquationTrig } from "./corrigeDetaille";
import { CATALOGUE_FAMILLES_EQUATION_TRIG, construireEquationTrigAvecFamille, genererExerciceEquationTrigonometrique } from "./index";
import { solutionsDistinctes, unionSolutions } from "./solveur";
import { profilEquationTrig, LIBELLE_CAS_EQUATIONS } from "../profilsEvaluationTrigonometrie";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceEquationTrigonometrique>` pour 5gen10 (Équations
 * trigonométriques) — les 4 familles du générateur, toutes enseignées par le cours (section
 * « Équations trigonométriques ») : application directe, produit de facteurs, substitution
 * pythagoricienne, égalité avec conversion. Catalogue de variantes = les 4 familles, dans l'ordre
 * du sélecteur de l'appli (`CATALOGUE_FAMILLES_EQUATION_TRIG`, partagé avec le `?code=` de
 * `App5gen10.tsx`).
 *
 * Papier (`.claude/rules/feuilles-evaluations.md`) : l'énoncé imprimé ne garde que l'équation et la
 * consigne globale (« Résous dans ℝ, puis dans [0 ; 2π[ ») ; les écrans du générateur (technique,
 * argument, isoler x, solutions…) sont les ÉTAPES du corrigé (`construireEnonce` + lettres
 * `sousQuestion`). Valeurs exactes en fractions de π ; sinon arrondies au centième, virgule décimale.
 */

const LETTRES = "abcdefghijklmnopqrstuvwxyz";

/** « x = … » ou « x ≈ … » : MÊMES fonctions que l'écran (`relationBranche`, `formatBrancheLatex`). */
function egaliteX(branche: BrancheX): string {
  return `x ${relationBranche(branche)} ${formatBrancheLatex(branche)}`;
}

/** Liste « A ou B ou C » de formules LaTeX, en fragments. */
function ouLatex(formules: string[]): FragmentConsigne[] {
  return formules.flatMap((f, i) => (i === 0 ? [latex(f)] : [texte(" ou "), latex(f)]));
}

/** Solutions retirées parce qu'une tangente n'y est pas définie (point 32 de l'audit). */
function valeursEcartees(candidats: number[], gardees: number[]): number[] {
  return candidats.filter((x) => !gardees.some((g) => Math.abs(g - x) < 1e-6));
}

// ============================================================================
// Énoncé, étapes, énoncé papier.
// ============================================================================

/** Étapes de résolution — une par écran du générateur, dans le même ordre (`moteur5e/typesEquationTrig.ts`). */
function etapes(exercice: ExerciceEquationTrigonometrique): FragmentConsigne[][] {
  const technique = [texte("Reconnais la technique de résolution.")];
  const solutions = [texte("Donne les solutions dans [0 ; 2π[, chaque valeur une seule fois.")];
  switch (exercice.famille) {
    case "directe":
      if (exercice.exercice.aucuneSolution) return [technique, [texte("Résous l'équation, ou justifie qu'elle n'a pas de solution.")]];
      return [technique, [texte("Résous l'équation pour l'argument (séries de solutions, k entier).")], [texte("Isole x dans chaque série.")], solutions];
    case "produit":
      return [
        technique,
        ...(exercice.sousCas === "nonFactoree" ? [[texte("Factorise l'équation.")]] : []),
        [texte("Écris les deux équations données par le produit nul.")],
        [texte("Résous chaque équation pour l'argument (séries, k entier).")],
        [texte("Isole x dans chaque série.")],
        [texte(`Donne les solutions dans [0 ; 2π[ : réunis celles des deux équations${produitContientTangente(exercice) ? ", sans les valeurs où une tangente n'est pas définie" : ""}.`)],
      ];
    case "pythagoricienne":
      return [
        technique,
        [texte(`Grâce à sin²(x) + cos²(x) = 1, réécris l'équation avec ${exercice.fonctionCible}(x) seulement.`)],
        [texte(`Pose t = ${exercice.fonctionCible}(x) et résous l'équation du second degré en t.`)],
        [texte(`Pour chaque racine, résous ${exercice.fonctionCible}(x) = t, ou rejette-la.`)],
        solutions,
      ];
    case "egalite":
      return [
        technique,
        [texte("Convertis un membre pour avoir la même fonction trigonométrique des deux côtés.")],
        [texte("Égale les arguments (une ou deux séries, k entier), puis isole x.")],
        exercice.identite === "tanVersTan" ? [texte("Donne les solutions dans [0 ; 2π[, sans les valeurs où une tangente n'est pas définie.")] : solutions,
      ];
  }
}

function construireEnonce(exercice: ExerciceEquationTrigonometrique): SectionExercice {
  return {
    enteteFragments: [latex(formatEnonceEquationTrigonometriqueLatex(exercice))],
    questions: etapes(exercice).map((consigne): QuestionExercice => ({ consigne })),
  };
}

/** Annonce d'arrondi quand une valeur attendue n'est pas une fraction de π. */
function annoncePrecision(exercice: ExerciceEquationTrigonometrique): string {
  switch (exercice.famille) {
    case "directe":
      return exercice.exercice.regime === "decimal" && !exercice.exercice.aucuneSolution ? " Arrondis au centième les valeurs qui ne sont pas exactes." : "";
    case "produit":
      return exercice.facteur1.regime === "decimal" || exercice.facteur2.regime === "decimal" ? " Arrondis au centième les valeurs qui ne sont pas des angles remarquables." : "";
    default:
      return "";
  }
}

function enoncePapier(exercice: ExerciceEquationTrigonometrique): EnoncePapier {
  return {
    section: {
      enteteFragments: [
        texte("Résous l'équation "),
        latex(formatEnonceEquationTrigonometriqueLatex(exercice)),
        texte(`, d'abord dans ℝ (k désigne un entier), puis dans [0 ; 2π[.${annoncePrecision(exercice)}`),
      ],
      questions: [],
    },
  };
}

// ============================================================================
// Solutions (réponse brève, corrigé, barème).
// ============================================================================

function seriesX(exercice: ExerciceEquationTrigonometrique): BrancheX[] {
  switch (exercice.famille) {
    case "directe":
      return exercice.exercice.branchesX;
    case "produit":
      return [...exercice.facteur1.branchesX, ...exercice.facteur2.branchesX];
    case "pythagoricienne":
      return [exercice.racine1, exercice.racine2].flatMap((r) => (r.resolution ? r.resolution.branchesX : []));
    case "egalite":
      return exercice.branches;
  }
}

function solutionsFinales(exercice: ExerciceEquationTrigonometrique): number[] {
  switch (exercice.famille) {
    case "directe":
      return exercice.exercice.solutions;
    case "produit":
    case "pythagoricienne":
      return exercice.solutionsUnion;
    case "egalite":
      return exercice.solutions;
  }
}

/** Valeurs de [0 ; 2π[ données par les séries mais écartées (tangente non définie). */
function ecarteesTangente(exercice: ExerciceEquationTrigonometrique): number[] {
  if (exercice.famille === "produit") return valeursEcartees(unionSolutions(exercice.facteur1.solutions, exercice.facteur2.solutions), exercice.solutionsUnion);
  if (exercice.famille === "egalite") return valeursEcartees(solutionsDistinctes(exercice.branches), exercice.solutions);
  return [];
}

function reponseBreve(exercice: ExerciceEquationTrigonometrique): FragmentConsigne[] {
  if (exercice.famille === "directe" && exercice.exercice.aucuneSolution) return [texte("Aucune solution : "), latex("S = \\varnothing")];
  const series = seriesX(exercice);
  const solutions = solutionsFinales(exercice);
  const ecartees = ecarteesTangente(exercice);
  return [
    texte("Dans ℝ : "),
    ...ouLatex(series.map(egaliteX)),
    ...(ecartees.length > 0 ? [texte(" (sauf là où une tangente n'est pas définie)")] : []),
    texte(" ; dans [0 ; 2π[ : "),
    latex(formatEnsembleSolutionsLatex(solutions)),
  ];
}

/** Corrigé historique (pipeline Word/PDF) : la réponse de chaque étape, en paragraphes. */
function construireCorrection(exercice: ExerciceEquationTrigonometrique): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(exercice) }];
}

// ============================================================================
// Barème (poids, somme 4), difficulté.
// ============================================================================

function critere(sousQuestion: string, texteCritere: string, points: number): CritereBareme {
  return { sousQuestion, critere: [texte(texteCritere)], points };
}

function bareme(exercice: ExerciceEquationTrigonometrique): BaremeExercice {
  const reponseFinale = reponseBreve(exercice);
  const reponsesAcceptees: FragmentConsigne[][] = [
    [texte("Toute écriture équivalente d'une série : k parcouru dans l'autre sens, constante décalée d'une période, "), latex("k\\pi"), texte(" écrit « "), latex("2k\\pi"), texte(" ou "), latex("\\pi + 2k\\pi"), texte(" »")],
  ];
  const erreursFrequentes: ErreurFrequente[] = [];
  let criteres: CritereBareme[];
  switch (exercice.famille) {
    case "directe": {
      const e = exercice.exercice;
      if (e.aucuneSolution) {
        criteres = [critere("a", "Technique reconnue (application directe)", 1), critere("b", "Conclut « aucune solution » en justifiant par −1 ≤ sin, cos ≤ 1", 3)];
        erreursFrequentes.push({ description: [texte("Calculer un arcsin ou un arccos d'une valeur hors de [−1 ; 1]")], cout: "0 pt sur b)" });
        break;
      }
      criteres = [
        critere("a", "Technique reconnue (application directe)", 0.5),
        critere("b", e.fonction === "tan" ? "Série de l'argument, période π" : "Séries de l'argument (formule du cours)", 1.5),
        critere("c", "x isolé, période divisée par le coefficient de x", 1),
        critere("d", "Solutions dans [0 ; 2π[, toutes et une seule fois", 1),
      ];
      if (e.fonction !== "tan" && !e.casSpecial) erreursFrequentes.push({ description: [texte("Une seule série au lieu de deux")], cout: "−1" });
      if (e.fonction === "tan") erreursFrequentes.push({ description: [texte("Période 2π au lieu de π pour la tangente")], cout: "−0,5" });
      erreursFrequentes.push({ description: [texte("Constante divisée par le coefficient de x, mais pas la période")], cout: "0 pt sur c)" });
      break;
    }
    case "produit": {
      const nonFact = exercice.sousCas === "nonFactoree";
      const l = (i: number) => LETTRES[i];
      let i = 0;
      criteres = [critere(l(i++), "Technique reconnue (produit nul)", 0.5)];
      if (nonFact) criteres.push(critere(l(i++), "Mise en évidence du facteur commun", 0.5));
      criteres.push(critere(l(i++), "Les deux équations du produit nul", 0.5));
      criteres.push(critere(l(i++), "Séries de l'argument pour chaque équation", nonFact ? 1 : 1.25));
      criteres.push(critere(l(i++), "x isolé dans chaque série", nonFact ? 0.5 : 0.75));
      criteres.push(critere(l(i++), "Réunion des solutions dans [0 ; 2π[", 1));
      if (nonFact) erreursFrequentes.push({ description: [texte("Diviser par le facteur commun au lieu de factoriser (solutions perdues)")], cout: "0 pt sur b) et c)" });
      if (produitContientTangente(exercice)) erreursFrequentes.push({ description: [texte("Garder une valeur où une tangente n'est pas définie")], cout: "−0,5" });
      erreursFrequentes.push({ description: [texte("Oublier les solutions de l'une des deux équations")], cout: "−1" });
      break;
    }
    case "pythagoricienne":
      criteres = [
        critere("a", "Technique reconnue (substitution pythagoricienne)", 0.5),
        critere("b", "Équation réécrite avec une seule fonction", 1),
        critere("c", "Racines t de l'équation du second degré", 1),
        critere("d", "Racine hors de [−1 ; 1] rejetée, les autres résolues", 1),
        critere("e", "Solutions dans [0 ; 2π[", 0.5),
      ];
      erreursFrequentes.push(
        { description: [texte("Remplacer un carré par « 1 + » l'autre carré (signe)")], cout: "0 pt sur b)" },
        { description: [texte("Chercher des x pour une racine t hors de [−1 ; 1]")], cout: "−1" },
      );
      break;
    case "egalite":
      criteres = [
        critere("a", "Technique reconnue (égalité avec conversion)", 0.5),
        critere("b", "Conversion correcte (angles complémentaires, ou tangente impaire)", 1),
        critere("c", exercice.identite === "tanVersTan" ? "Une série, période π, x isolé" : "Deux séries, x isolé dans chacune", 1.5),
        critere("d", "Solutions dans [0 ; 2π[", 1),
      ];
      erreursFrequentes.push({ description: [texte("Égaler les arguments sans convertir (fonctions différentes)")], cout: "0 pt sur b) et c)" });
      if (exercice.identite !== "tanVersTan") erreursFrequentes.push({ description: [texte("Une seule des deux séries")], cout: "−1" });
      else erreursFrequentes.push({ description: [texte("Garder une valeur où une tangente n'est pas définie")], cout: "−0,5" });
      break;
  }
  if (ensembleApproche(solutionsFinales(exercice))) reponsesAcceptees.push([texte("Valeurs approchées au centième")]);
  return { reponseFinale, criteres, erreursFrequentes, reponsesAcceptees };
}

/** Niveau (grille commune) : aucun écran de lecture (la reconnaissance de la technique est une
 * DÉCISION et compte comme une étape) ; les écrans « solutions » sont des étapes SANS charge (même
 * substitution pour chaque k). Méthode : imposée pour l'application directe (0), à choisir parmi
 * les techniques du cours sinon (1). Piège dans les DONNÉES : valeur ±1 (une seule série), facteur
 * commun qu'on serait tenté de diviser (produit non factorisé), valeur où une tangente n'est pas
 * définie, racine t à rejeter ; « aucune solution » est un cas particulier, pas un piège. Nombres :
 * calculatrice (profil) ou angles kπ/n non remarquables (`anglesEnPi`). */
function criteresDifficulte(exercice: ExerciceEquationTrigonometrique): CriteresDifficulte {
  const base = etapesDuCorrige(correctionDetailleeEquationTrig(exercice));
  let piege = false;
  switch (exercice.famille) {
    case "directe":
      piege = exercice.exercice.casSpecial;
      break;
    case "produit":
      piege = exercice.sousCas === "nonFactoree" || ecarteesTangente(exercice).length > 0 || exercice.facteur1.casSpecial || exercice.facteur2.casSpecial;
      break;
    case "pythagoricienne":
      piege = exercice.racine1.invalide || exercice.racine2.invalide;
      break;
    case "egalite":
      piege = ecarteesTangente(exercice).length > 0;
      break;
  }
  return {
    ...base,
    lettresSansCharge: [...(base.lettresSansCharge ?? []), ...lettresSolutionsEquationTrig(exercice)],
    methode: exercice.famille === "directe" ? 0 : 1,
    piege: piege ? 1 : 0,
    anglesEnPi: true,
  };
}

export const adaptateurEvaluationEquationTrig: AdaptateurFeuilleExercices<ExerciceEquationTrigonometrique> = {
  profilInstance: profilEquationTrig,
  libelleCasParticulier: LIBELLE_CAS_EQUATIONS,
  titreDocument: "Équations trigonométriques — Évaluation",
  nomFichierBase: "equations-trigonometriques",
  genererInstance: genererExerciceEquationTrigonometrique,
  catalogueVariantes: CATALOGUE_FAMILLES_EQUATION_TRIG,
  genererInstanceAvecVariante: construireEquationTrigAvecFamille,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeEquationTrig,
  bareme,
  enoncePapier,
};

