import type { ExerciceSuiteClassique, ScenarioSuiteClassique } from "../../core5e/suitesClassiques.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  EnoncePapier,
  ErreurFrequente,
  FragmentConsigne,
  QuestionExercice,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import type { CriteresDifficulte } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/fragmentsDocx";
import { construireSvgCarresEmboites, construireSvgZigzag } from "../../export5e/svgSuiteClassique";
import type { PhaseSuiteClassique } from "../../moteur5e/typesSuiteClassique";
import { ordreComplet } from "../../moteur5e/typesSuiteClassique";
import {
  consigneGenerale,
  consignePhase,
  LIBELLE_PHASE_SUITE_CLASSIQUE,
} from "../../ui5e/formatSuiteClassique";
import { correctionDetailleeSuiteClassique, reponseLatexSuiteClassique as reponseLatex } from "./corrigeDetaille";
import { CATALOGUE_SCENARIOS, construireAvecScenarioId, genererExerciceSuiteClassique } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceSuiteClassique>` pour 5gen17 (Problèmes classiques
 * sur les suites) — feuille d'exercices et évaluation (méthode : `.claude/rules/feuilles-evaluations.md`).
 *
 * - `construireEnonce` : une question PAR ÉCRAN du générateur (`ordreComplet`, consignes de
 *   `consignePhase`) — ce sont les étapes d'apprentissage, reprises en titres « Étape n — … » du
 *   corrigé. Les QCM de méthode de l'écran (« quel système traduit… ») y deviennent des étapes rédigées.
 * - `enoncePapier` : ce qui est imprimé — l'énoncé autosuffisant (`consigneGenerale`), la figure
 *   (zigzag, carrés) et les VRAIES questions du problème (`QUESTIONS_PAPIER`) : u₍ₖ₎ / S₆₄ / poids
 *   pour l'échiquier, les 5 parts pour le papyrus… Les étapes de pur guidage (poser le système,
 *   l'équation en x, la limite de (1/p)ⁿ) passent dans le corrigé.
 *
 * Toutes les valeurs viennent des fonctions de l'écran (`ui5e/formatSuiteClassique.ts` : réponses
 * attendues, aides de niveau 1 et 2) ; les figures, de `export5e/svgSuiteClassique.ts` (même
 * construction que `components5e/FigureSuiteClassique.tsx`).
 *
 * `regroupable` jamais activé : plusieurs questions par instance, consignes dépendant des valeurs.
 */

const LETTRES = "abcdefghijklmnopqrstuvwxyz";

function lettre(exercice: ExerciceSuiteClassique, phase: PhaseSuiteClassique): string {
  return LETTRES[ordreComplet(exercice).indexOf(phase)];
}

function enteteHtml(exercice: ExerciceSuiteClassique): string | undefined {
  if (exercice.scenario === "trianglesZigzag") return construireSvgZigzag(exercice);
  if (exercice.scenario === "carresEmboites") return construireSvgCarresEmboites(exercice);
  return undefined;
}

// ============================================================================
// Étapes (construireEnonce) et énoncé papier
// ============================================================================

function construireEnonceSuiteClassique(exercice: ExerciceSuiteClassique): SectionExercice {
  return {
    enteteFragments: [texte(consigneGenerale(exercice))],
    enteteHtml: enteteHtml(exercice),
    questions: ordreComplet(exercice).map((phase): QuestionExercice => ({ consigne: [texte(consigneSansSaisie(exercice, phase))] })),
  };
}

/** Une vraie question du problème imprimé : sa consigne et les étapes (écrans) qu'elle couvre. */
interface QuestionPapier {
  consigne: string;
  phases: PhaseSuiteClassique[];
}

/** Consigne d'écran sans la syntaxe de saisie (« Une puissance comme 2^10 est acceptée »). */
function consigneSansSaisie(exercice: ExerciceSuiteClassique, phase: PhaseSuiteClassique): string {
  return consignePhase(exercice, phase).replace(/\s*\(Une puissance comme 2\^10 est acceptée\.\)/, " Tu peux donner la réponse sous forme de puissance.");
}

function questionsPapier(exercice: ExerciceSuiteClassique): QuestionPapier[] {
  const q = (phase: PhaseSuiteClassique): QuestionPapier => ({ consigne: consigneSansSaisie(exercice, phase), phases: [phase] });
  switch (exercice.scenario) {
    case "echiquier":
      return [q("u64"), q("sommeTotaleEchiquier"), q("poidsComparaison")];
    case "papyrusRhind":
      return [
        {
          consigne: "Détermine les 5 parts, de la plus petite à la plus grande (valeurs exactes ou arrondies au centième). Justifie en posant un système d'équations d'inconnues a et Δ.",
          phases: ["poserSysteme", "resoudreSysteme", "suiteFinalePapyrus"],
        },
      ];
    case "suitesCombinees":
      return [
        {
          consigne: `Détermine x, puis la raison r de la suite arithmétique (r ≠ 0). Donne enfin les deux suites : la suite arithmétique ${String(exercice.premierTerme).replace("-", "−")}, y, z et la suite géométrique y, x, z.`,
          phases: ["poserEquationCombinees", "resoudreRCombinees", "suitesFinalesCombinees"],
        },
      ];
    case "vitesse":
      return [q("distance11"), q("sommeTotale11"), q("troisMethodes")];
    case "fibonacci":
      return [
        q("dixTermes"),
        { consigne: "Écris la formule de récurrence qui définit cette suite (pour n ≥ 3).", phases: ["formuleRecurrence"] },
        q("calculV5"),
        q("resoudrePhi"),
        { consigne: "Exprime 1/φ en fonction de φ, en utilisant l'équation vérifiée par φ.", phases: ["proprieteInverse"] },
      ];
    case "trianglesZigzag":
      return [q("hauteursZigzag"), q("longueurZigzag"), q("airesZigzag"), q("airesZigzagAC")];
    case "carresEmboites":
      return [
        { consigne: `Partie a — ${consignePhase(exercice, "sommePartielleA")}`, phases: ["sommePartielleA"] },
        { consigne: consignePhase(exercice, "sommeInfinieA"), phases: ["limitePuissanceA", "sommeInfinieA"] },
        q("airesB"),
        q("sommeInfinieB"),
      ];
  }
}

function enoncePapierSuiteClassique(exercice: ExerciceSuiteClassique): EnoncePapier {
  const questions = questionsPapier(exercice);
  return {
    section: {
      enteteFragments: [texte(consigneGenerale(exercice))],
      enteteHtml: enteteHtml(exercice),
      questions: questions.map((question) => ({ consigne: [texte(question.consigne)] })),
    },
    etapesParQuestion: questions.map((question) => question.phases.map((phase) => lettre(exercice, phase))),
    reponseBreve:
      questions.length > 1
        ? questions.flatMap((question, i): FragmentConsigne[] => [texte(`${i === 0 ? "" : " ; "}${LETTRES[i]}) `), latex(reponseLatex(exercice, question.phases[question.phases.length - 1]))])
        : undefined,
  };
}

// ============================================================================
// Corrigé
// ============================================================================

function construireCorrectionSuiteClassique(exercice: ExerciceSuiteClassique): BlocCorrection[] {
  return ordreComplet(exercice).map((phase): BlocCorrection => ({ type: "paragraphe", fragments: [latex(reponseLatex(exercice, phase))] }));
}

/** Réponses finales du problème (dernière étape de chaque question papier), sans lettre. */
function reponseBreveSuiteClassique(exercice: ExerciceSuiteClassique): FragmentConsigne[] {
  return questionsPapier(exercice).flatMap((question, i): FragmentConsigne[] => [...(i === 0 ? [] : [texte(" ; ")]), latex(reponseLatex(exercice, question.phases[question.phases.length - 1]))]);
}

// ============================================================================
// Barème — un critère par étape, poids ≥ 0,5 (aucun critère arrondi à 0 au demi-point), somme 4.
// ============================================================================

const POIDS: Record<ScenarioSuiteClassique, number[]> = {
  echiquier: [1, 1.5, 1.5],
  papyrusRhind: [1.5, 1.5, 1],
  suitesCombinees: [1, 1.5, 1.5],
  vitesse: [1, 1.5, 1.5],
  fibonacci: [1, 0.5, 0.5, 1.5, 0.5],
  trianglesZigzag: [1, 1, 1, 1],
  carresEmboites: [1, 0.5, 1, 0.5, 1],
};

function erreursFrequentes(exercice: ExerciceSuiteClassique): ErreurFrequente[] {
  const sur = (phase: PhaseSuiteClassique) => `0 pt sur ${lettre(exercice, phase)})`;
  switch (exercice.scenario) {
    case "echiquier":
      return [
        { description: [texte("Grains de la case calculés avec "), latex("2^n"), texte(" au lieu de "), latex("2^{n-1}")], cout: sur("u64") },
        { description: [texte("Poids laissé en grammes (oubli de la conversion en tonnes)")], cout: "−0,5" },
      ];
    case "papyrusRhind":
      return [{ description: [texte("Relation inversée : les 2 plus petites parts valent k fois les 3 plus grandes")], cout: `${sur("poserSysteme")}, suite notée sans double pénalité` }];
    case "suitesCombinees":
      return [
        { description: [texte("Équation "), latex("x^2=P"), texte(" au lieu de "), latex("x^3=P")], cout: sur("poserEquationCombinees") },
        { description: [texte("Solution "), latex("r=0"), texte(" gardée")], cout: "−0,5" },
      ];
    case "vitesse":
      return [
        { description: [latex("u_n=u_1+n\\,r"), texte(" au lieu de "), latex("u_1+(n-1)\\,r")], cout: `${sur("distance11")}, suite notée sans double pénalité` },
        { description: [texte("Division par 3,6 au lieu d'une multiplication")], cout: "−0,5" },
      ];
    case "fibonacci":
      return [
        { description: [texte("Racine négative gardée pour φ")], cout: sur("resoudrePhi") },
        { description: [texte("Rapport inversé "), latex("\\dfrac{u_k}{u_{k+1}}")], cout: sur("calculV5") },
      ];
    case "trianglesZigzag":
      return [
        { description: [texte("Raison "), latex("\\dfrac12"), texte(" utilisée pour les aires")], cout: sur("airesZigzag") },
        { description: [texte("Longueur limite prise égale à ℓ₁ ou à la somme de quelques segments seulement")], cout: sur("longueurZigzag") },
      ];
    case "carresEmboites":
      return [
        { description: [texte("Somme infinie calculée avec "), latex("\\dfrac{1}{1-q}"), texte(" sans le premier terme")], cout: "−0,5 par somme" },
        { description: [texte("Aire du carré suivant prise égale au quart (et non à la moitié) de la précédente")], cout: sur("airesB") },
      ];
  }
}

function baremeSuiteClassique(exercice: ExerciceSuiteClassique): BaremeExercice {
  const phases = ordreComplet(exercice);
  const poids = POIDS[exercice.scenario];
  return {
    reponseFinale: reponseBreveSuiteClassique(exercice),
    criteres: phases.map((phase, i): CritereBareme => ({ sousQuestion: LETTRES[i], critere: [texte(`${LIBELLE_PHASE_SUITE_CLASSIQUE[phase]} : `), latex(reponseLatex(exercice, phase))], points: poids[i] })),
    erreursFrequentes: erreursFrequentes(exercice),
    reponsesAcceptees: [
      [texte("Valeurs exactes, ou arrondies à la précision demandée")],
      [texte("Grands nombres écrits sous forme de puissance ou en notation scientifique")],
    ],
  };
}

/** Critères du niveau de difficulté (grille commune, `export/niveauDifficulte.ts`) : méthode et
 * piège jugés par variante (analyse des cinq chapitres), étapes lues sur le corrigé détaillé. */
function criteresDifficulte(e: ExerciceSuiteClassique): CriteresDifficulte {
  const methode = e.scenario === "suitesCombinees" || e.scenario === "fibonacci" ? 1 : 2;
  return { ...etapesDuCorrige(correctionDetailleeSuiteClassique(e)), methode, piege: e.scenario === "vitesse" ? 0 : 1 };
}

export const adaptateurEvaluationSuitesClassiques: AdaptateurFeuilleExercices<ExerciceSuiteClassique> = {
  titreDocument: "Problèmes classiques sur les suites — Évaluation",
  nomFichierBase: "suites-classiques",
  genererInstance: genererExerciceSuiteClassique,
  catalogueVariantes: CATALOGUE_SCENARIOS,
  genererInstanceAvecVariante: (id) => construireAvecScenarioId(id as ScenarioSuiteClassique),
  construireEnonce: construireEnonceSuiteClassique,
  construireCorrection: construireCorrectionSuiteClassique,
  criteresDifficulte,
  reponseBreve: reponseBreveSuiteClassique,
  correctionDetaillee: correctionDetailleeSuiteClassique,
  bareme: baremeSuiteClassique,
  enoncePapier: enoncePapierSuiteClassique,
};
