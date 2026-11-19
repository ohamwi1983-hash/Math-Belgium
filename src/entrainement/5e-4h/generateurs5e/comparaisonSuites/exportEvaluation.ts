import type { ExerciceComparaisonSuites, FamilleComparaisonSuites } from "../../core5e/comparaisonSuites.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  ErreurFrequente,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { consigneConclusion, consigneGenerale, consigneTableau, formatConclusionNLatex, formatTraductionAttendueTexte, formuleU, formuleV, labelU, labelV } from "../../ui5e/formatComparaisonSuites";
import { correctionDetailleeComparaisonSuites, reponseTexteComparaison as reponseTexte } from "./corrigeDetaille";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceComparaisonSuites } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceComparaisonSuites>` pour 5gen18 (Comparaison
 * numérique de deux suites) — feuille d'exercices et évaluation (méthode :
 * `.claude/rules/feuilles-evaluations.md`).
 *
 * - `construireEnonce` : une question PAR ÉCRAN du générateur (`tableau` → `conclusion`, consignes
 *   `consigneTableau`/`consigneConclusion`) — ce sont les étapes d'apprentissage, reprises en titres
 *   « Étape n — consigne » du corrigé.
 * - `enoncePapier` : ce qui est imprimé — le contexte et la consigne globale (`consigneGenerale` :
 *   « Détermine à partir de quelle année… » / « au cours du combientième mois… »), justifiée par un
 *   tableau de valeurs. Les rangs de la fenêtre de l'écran (`nTable`, 4 rangs décalés) ne sont PAS
 *   imprimés : l'élève fait lui-même le balayage, comme le demande le cours. Le tableau des 4 rangs
 *   autour de la bascule va au corrigé.
 *
 * Toutes les valeurs viennent de l'instance et des fonctions de l'écran (`formuleU`/`formuleV`,
 * `uTable`/`vTable` arrondis à l'unité comme à l'écran, `nSeuil`, `traductionValeur`).
 */

function enAnnees(exercice: ExerciceComparaisonSuites): boolean {
  return exercice.contexte.periode === "an";
}

function construireEnonceComparaisonSuites(exercice: ExerciceComparaisonSuites): SectionExercice {
  return {
    enteteFragments: [texte(consigneGenerale(exercice))],
    questions: [{ consigne: [texte(consigneTableau(exercice))] }, { consigne: [texte(consigneConclusion(exercice))] }],
  };
}

/** Énoncé papier : le contexte et la consigne globale, sans les rangs du tableau de l'écran. */
function enoncePapierComparaisonSuites(exercice: ExerciceComparaisonSuites): EnoncePapier {
  return {
    section: {
      enteteFragments: [texte(`${consigneGenerale(exercice)} Justifie ta réponse à l'aide d'un tableau de valeurs de Aₙ et Bₙ.`)],
      questions: [],
    },
  };
}

function construireCorrectionComparaisonSuites(exercice: ExerciceComparaisonSuites): BlocCorrection[] {
  return [
    {
      type: "tableau",
      libellesLignes: ["n", labelU(exercice), labelV(exercice)],
      valeursParLigne: [exercice.nTable.map(String), exercice.uTable.map((u) => String(Math.round(u))), exercice.vTable.map((v) => String(Math.round(v)))],
    },
    { type: "paragraphe", fragments: [latex(formatConclusionNLatex(exercice)), texte(` — ${formatTraductionAttendueTexte(exercice)}`)] },
  ];
}

function reponseBreveComparaisonSuites(exercice: ExerciceComparaisonSuites): FragmentConsigne[] {
  return [texte(`${reponseTexte(exercice)} (rang `), latex(formatConclusionNLatex(exercice)), texte(").")];
}

function baremeComparaisonSuites(exercice: ExerciceComparaisonSuites): BaremeExercice {
  const geometrique = exercice.famille !== "stockDemande";
  const erreurs: ErreurFrequente[] = [
    geometrique
      ? { description: [texte("Exposant n au lieu de n − 1 dans la formule géométrique (décalage d'un rang)")], cout: "0 pt sur les formules, suite notée sans double pénalité" }
      : { description: [texte("Raison multipliée par n au lieu de n − 1 (décalage d'un rang)")], cout: "0 pt sur les formules, suite notée sans double pénalité" },
    { description: [texte("Rang donné à la dernière ligne où la condition est encore fausse")], cout: "0 pt sur le rang" },
  ];
  if (enAnnees(exercice)) erreurs.push({ description: [texte("Année calculée comme départ + n au lieu de départ + (n − 1)")], cout: "0 pt sur la traduction" });
  const acceptees: FragmentConsigne[][] = [[texte("Tableau commencé à n = 1 (ou à un autre rang), pourvu qu'il montre la bascule et le rang qui la précède")]];
  if (!geometrique) acceptees.push([texte("Résolution par une inéquation du premier degré, puis plus petit entier n qui convient")]);
  return {
    reponseFinale: reponseBreveComparaisonSuites(exercice),
    criteres: [
      { sousQuestion: "a", critere: [texte("Formules : "), latex(formuleU(exercice)), texte(" et "), latex(formuleV(exercice))], points: 1 },
      { sousQuestion: "a", critere: [texte("Tableau de valeurs juste, autour de la bascule")], points: 1 },
      { sousQuestion: "b", critere: [texte("Premier rang du dépassement : "), latex(formatConclusionNLatex(exercice))], points: 1 },
      { sousQuestion: "b", critere: [texte(`Traduction : ${reponseTexte(exercice)}`)], points: 1 },
    ],
    erreursFrequentes: erreurs,
    reponsesAcceptees: acceptees,
  };
}

/** Deux suites géométriques à taux proches : la bascule est la plus lente à cerner. */
function difficulteComparaisonSuites(exercice: ExerciceComparaisonSuites): 1 | 2 | 3 {
  return exercice.famille === "epargneCroissance" ? 3 : 2;
}

export const adaptateurEvaluationComparaisonSuites: AdaptateurFeuilleExercices<ExerciceComparaisonSuites> = {
  titreDocument: "Comparaison numérique de deux suites — Évaluation",
  nomFichierBase: "comparaison-suites",
  genererInstance: genererExerciceComparaisonSuites,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id as FamilleComparaisonSuites),
  construireEnonce: construireEnonceComparaisonSuites,
  construireCorrection: construireCorrectionComparaisonSuites,
  difficulte: difficulteComparaisonSuites,
  reponseBreve: reponseBreveComparaisonSuites,
  correctionDetaillee: correctionDetailleeComparaisonSuites,
  bareme: baremeComparaisonSuites,
  enoncePapier: enoncePapierComparaisonSuites,
  dureeMinutes: 10,
};
