import type { ExerciceGeometrieCercle, ScenarioGeometrieCercle } from "../../core5e/geometrieCercle.types";
import type { PhaseGeometrieCercle } from "../../moteur5e/typesGeometrieCercle";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  CritereBareme,
  BlocCorrection,
  EnoncePapier,
  ErreurFrequente,
  CriteresDifficulte,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { construireSvgGeometrieCercle } from "../../export5e/svgGraphGeometrieCercle";
import { blocDonneesLatex, consigneGenerale, consignePhase, formatValeurPhaseLatex, phasesDuScenario } from "../../ui5e/formatGeometrieCercle";
import { CATALOGUE_SCENARIOS, construireAvecScenarioId, genererExerciceGeometrieCercle } from "./index";
import { correctionDetailleeGeometrieCercle } from "./corrigeDetaille";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceGeometrieCercle>` pour 5gen12 (Problèmes de
 * géométrie du cercle) — feuille d'exercices et évaluation (méthode : `.claude/rules/
 * feuilles-evaluations.md`).
 *
 * - `construireEnonce` : une question PAR ÉCRAN du générateur (`phasesDuScenario`, consignes de
 *   `consignePhase`) — ce sont les étapes d'apprentissage, reprises en titres du corrigé.
 * - `enoncePapier` : ce qui est imprimé — énoncé, croquis, données et UNE consigne globale (l'aire
 *   demandée, arrondie à l'unité), jamais les étapes.
 * Les 3 scénarios (secteur balayé, segment circulaire, lentille) sont couverts ; toutes les valeurs
 * viennent de l'instance (mêmes champs et mêmes `formatValeurPhaseLatex`/`texteAideNiveau2` que
 * l'écran interactif).
 */

const LETTRES = "abcdefghijklmnopqrstuvwxyz";

/** Nombre arrondi à `decimales` décimales, virgule décimale LaTeX (`{,}`). */
function nombreLatex(v: number, decimales: number): string {
  const f = 10 ** decimales;
  const r = Math.round(v * f) / f;
  return String(Object.is(r, -0) ? 0 : r).replace(".", "{,}");
}

function enteteFragments(exercice: ExerciceGeometrieCercle): FragmentConsigne[] {
  return [texte(`${consigneGenerale(exercice)} Données : `), latex(blocDonneesLatex(exercice).join(",\\quad ")), texte(".")];
}

function construireEnonceGeometrieCercle(exercice: ExerciceGeometrieCercle): SectionExercice {
  return {
    enteteFragments: enteteFragments(exercice),
    enteteHtml: construireSvgGeometrieCercle(exercice),
    questions: phasesDuScenario(exercice.scenario).map((phase) => ({ consigne: [texte(consignePhase(exercice, phase))] })),
  };
}

/** Énoncé papier : la consigne générale (qui énonce déjà l'aire demandée), les données, la précision
 * attendue et le croquis — sans les étapes. */
function enoncePapierGeometrieCercle(exercice: ExerciceGeometrieCercle): EnoncePapier {
  return {
    section: {
      enteteFragments: [...enteteFragments(exercice), texte(" Donne l'aire arrondie à l'unité.")],
      enteteHtml: construireSvgGeometrieCercle(exercice),
      questions: [],
    },
  };
}

function construireCorrectionGeometrieCercle(exercice: ExerciceGeometrieCercle): BlocCorrection[] {
  return [
    { type: "html", html: construireSvgGeometrieCercle(exercice) },
    ...phasesDuScenario(exercice.scenario).map((phase): BlocCorrection => ({ type: "paragraphe", fragments: [latex(formatValeurPhaseLatex(exercice, phase))] })),
  ];
}

// ============================================================================
// Feuilles enrichies : réponse brève, corrigé détaillé, barème.
// ============================================================================

function aireFinale(exercice: ExerciceGeometrieCercle): { libelle: string; valeur: number } {
  switch (exercice.scenario) {
    case "secteurBalaye":
      return { libelle: "Aire balayée", valeur: exercice.aireBalayee };
    case "segmentCirculaire":
      return { libelle: "Aire du segment", valeur: exercice.aireSegment };
    case "lentille":
      return { libelle: "Aire de la lentille", valeur: exercice.aireLentille };
  }
}

function reponseBreveGeometrieCercle(exercice: ExerciceGeometrieCercle): FragmentConsigne[] {
  const { libelle, valeur } = aireFinale(exercice);
  return [texte(`${libelle} : `), latex(`A \\approx ${nombreLatex(valeur, 0)}`)];
}

/** Critères du niveau (grille commune, `export/niveauDifficulte.ts`), jugés sur l'énoncé PAPIER :
 * écrans tous de calcul (aucune pure lecture) ; méthode 1 pour le secteur balayé (différence de deux
 * secteurs) et le segment (secteur − triangle, la méthode du cours § 3), 2 pour la lentille (l'élève
 * décompose lui-même la figure en deux segments, chacun avec son rayon) ; piège 0 (la position des
 * centres est dite dans l'énoncé, θ en degrés à convertir est la méthode) ; nombres 1 (calculatrice :
 * arccos, sinus, arrondis). */
function criteresDifficulteGeometrieCercle(exercice: ExerciceGeometrieCercle): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeGeometrieCercle(exercice)), methode: exercice.scenario === "lentille" ? 2 : 1, piege: 0, nombres: 1 };
}

/** Poids par étape (somme 4). */
const POIDS: Record<ScenarioGeometrieCercle, number[]> = {
  secteurBalaye: [1, 1, 1, 1],
  segmentCirculaire: [1, 1, 1, 1],
  lentille: [0.5, 0.5, 0.5, 0.25, 0.5, 0.5, 0.5, 0.25, 0.5],
};

const CRITERE: Record<PhaseGeometrieCercle, string> = {
  conversionRad: "Conversion de θ en radians",
  aireGrandSecteur: "Aire du grand secteur, θ en radians",
  airePetitSecteur: "Aire du petit secteur",
  aireBalayee: "Aire balayée = différence des secteurs",
  angleTheta: "θ par la loi des cosinus, en radians",
  aireSecteur: "Aire du secteur, θ en radians",
  aireTriangle: "Aire du triangle ½r² sin θ",
  aireSegment: "Segment = secteur − triangle",
  angle1: "θ₁ par la loi des cosinus, en radians",
  secteur1: "Aire du secteur du premier cercle",
  triangle1: "Aire du triangle du premier cercle",
  segmentAire1: "Segment du premier cercle",
  angle2: "θ₂ par la loi des cosinus, en radians",
  secteur2: "Aire du secteur du second cercle",
  triangle2: "Aire du triangle du second cercle",
  segmentAire2: "Segment du second cercle",
  aireLentille: "Lentille = somme des deux segments",
};

/** Critères du barème, un par étape. Lentille : 9 étapes pour 4 points arrondis au demi-point
 * laisseraient un critère à 0 — les deux soustractions « segment = secteur − triangle » (même geste,
 * 0,25 chacune) forment un seul critère, rattaché à l'étape du second segment. */
function criteresBareme(exercice: ExerciceGeometrieCercle, phases: PhaseGeometrieCercle[], poids: number[]): CritereBareme[] {
  const criteres: CritereBareme[] = phases.map((phase, i) => ({ sousQuestion: LETTRES[i], critere: [texte(`${CRITERE[phase]} : `), latex(formatValeurPhaseLatex(exercice, phase))], points: poids[i] }));
  const i1 = phases.indexOf("segmentAire1");
  const i2 = phases.indexOf("segmentAire2");
  if (i1 < 0 || i2 < 0) return criteres;
  criteres[i2] = {
    sousQuestion: LETTRES[i2],
    critere: [texte("Segments = secteur − triangle, pour chaque cercle : "), latex(formatValeurPhaseLatex(exercice, "segmentAire1")), texte(" ; "), latex(formatValeurPhaseLatex(exercice, "segmentAire2"))],
    points: poids[i1] + poids[i2],
  };
  return criteres.filter((_, i) => i !== i1);
}

function baremeGeometrieCercle(exercice: ExerciceGeometrieCercle): BaremeExercice {
  const phases = phasesDuScenario(exercice.scenario);
  const poids = POIDS[exercice.scenario];
  const erreurs: ErreurFrequente[] = [{ description: [texte("θ laissé en degrés dans ½r²θ")], cout: "0 pt sur l'étape, suite notée sans double pénalité" }];
  if (exercice.scenario !== "secteurBalaye") {
    erreurs.push({ description: [texte("Aire du triangle calculée comme r·c/2")], cout: "0 pt sur l'étape" });
    erreurs.push({ description: [texte("Calculatrice en degrés pour arccos, puis valeur utilisée comme des radians")], cout: "0 pt sur l'étape" });
  }
  if (exercice.scenario === "segmentCirculaire") erreurs.push({ description: [texte("Segment = secteur + triangle")], cout: "0 pt sur l'étape" });
  if (exercice.scenario === "lentille") erreurs.push({ description: [texte("Lentille = différence des deux segments")], cout: "0 pt sur l'étape" });
  if (exercice.scenario === "secteurBalaye") erreurs.push({ description: [texte("½ oublié dans l'aire d'un secteur")], cout: "−1" });
  const { valeur } = aireFinale(exercice);
  return {
    reponseFinale: [latex(`A \\approx ${nombreLatex(valeur, 0)}`)],
    criteres: criteresBareme(exercice, phases, poids),
    erreursFrequentes: erreurs,
    reponsesAcceptees: [
      [texte("Aires obtenues avec θ arrondi au dixième (écart de quelques unités sur l'aire finale), si la démarche est correcte")],
      [texte("Aire finale calculée à partir des aires intermédiaires déjà arrondies")],
    ],
  };
}


export const adaptateurEvaluationGeometrieCercle: AdaptateurFeuilleExercices<ExerciceGeometrieCercle> = {
  // Toutes les instances exigent une calculatrice (valeurs décimales) : avertissement du panneau.
  calculatriceIndispensable: true,
  titreDocument: "Problèmes de géométrie du cercle — Évaluation",
  nomFichierBase: "geometrie-cercle",
  genererInstance: genererExerciceGeometrieCercle,
  catalogueVariantes: CATALOGUE_SCENARIOS,
  genererInstanceAvecVariante: (id) => construireAvecScenarioId(id as ScenarioGeometrieCercle),
  construireEnonce: construireEnonceGeometrieCercle,
  construireCorrection: construireCorrectionGeometrieCercle,
  criteresDifficulte: criteresDifficulteGeometrieCercle,
  reponseBreve: reponseBreveGeometrieCercle,
  correctionDetaillee: correctionDetailleeGeometrieCercle,
  bareme: baremeGeometrieCercle,
  enoncePapier: enoncePapierGeometrieCercle,
};
