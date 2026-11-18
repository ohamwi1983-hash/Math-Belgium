import type { ExerciceTransfoA, ExerciceTransformationsPlan } from "../../core6e/transformationsPlan.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  FragmentConsigne,
  QuestionExercice,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { blocDonneesA, blocDonneesB, blocDonneesC, formuleD, formatReponseAttenduePhaseLatex, nomPoint } from "../../ui6e/formatTransformationsPlan";
import { phasesPourExercice } from "../../moteur6e/typesTransformationsPlan";
import type { PhaseTransformationsPlan } from "../../moteur6e/typesTransformationsPlan";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceTransformationsPlan } from "./index";
import type { IdVarianteTransformationsPlan } from "./index";
import { profilTransformationsPlan } from "../profilsEvaluationComplexes40-42";
import { correctionDetailleeTransformationsPlan, piege } from "./corrigeDetaille";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceTransformationsPlan>` pour `6gen40` (Transformations
 * du plan via les nombres complexes) — méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - `construireEnonce` : une question par écran du générateur (titres « Étape n — … » du corrigé),
 *   reformulées pour le papier (plus de QCM « parmi les formules proposées », plus de « confirmée »).
 * - `enoncePapier` :
 *   - A : la transformation est DONNÉE en toutes lettres (« … par la rotation de centre O et d'angle
 *     θ ») : une seule demande, l'image de P ; la formule complexe est l'étape 1 du corrigé ;
 *   - B : deux vraies questions — a) le point construit (et sa place dans le plan), b) les éléments
 *     de la transformation qui envoie A sur ce point ;
 *   - C : a) la rotation de centre O qui envoie A sur B (existence et angle), b) les images des
 *     autres points ;
 *   - D : « détermine la nature et les éléments caractéristiques » (une seule demande : la nature
 *     n'est jamais annoncée).
 * - Figures du corrigé (`figureHtml`) : les points et leurs images, le centre, le vecteur de
 *   translation (`figuresPlanComplexe40-42.ts`) — jamais dans l'énoncé (elles montrent la réponse).
 */

const LETTRES = "abcdefghij";
const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);

function reponse(e: ExerciceTransformationsPlan, phase: PhaseTransformationsPlan): FragmentConsigne[] {
  return [f(formatReponseAttenduePhaseLatex(e, phase).join(",\\quad "))];
}

// ---------------------------------------------------------------------------------------------
// Énoncé papier
// ---------------------------------------------------------------------------------------------

function descriptionA(e: ExerciceTransfoA): FragmentConsigne[] {
  const p = e.parametres;
  const lignes = blocDonneesA(e);
  switch (p.sousType) {
    case "translation":
      return [t("par la translation de vecteur d'affixe "), f(lignes[1])];
    case "homothetie":
      return [t("par l'homothétie de centre O et de rapport "), f(lignes[1])];
    case "rotation":
      return [t("par la rotation de centre O et d'angle "), f(lignes[1])];
    case "similitude":
      return [t("par la similitude de centre O, de rapport "), f(lignes[1]), t(" et d'angle "), f(lignes[2]), t(" (rotation puis homothétie)")];
    case "rotationTranslation":
      return [t("par la rotation de centre O et d'angle "), f(lignes[1]), t(", suivie de la translation de vecteur d'affixe "), f(lignes[2])];
  }
}

function entetePapier(e: ExerciceTransformationsPlan): FragmentConsigne[] {
  switch (e.famille) {
    case "A":
      return [t("Le point P a pour affixe "), f(blocDonneesA(e)[0]), t(". Calcule l'affixe de son image P′ "), ...descriptionA(e), t(".")];
    case "B": {
      const [zA, zB] = blocDonneesB(e);
      return [t("Les points A et B ont pour affixes "), f(zA), t(" et "), f(zB), t(".")];
    }
    case "C": {
      const lignes = blocDonneesC(e);
      const autres = lignes.slice(2);
      return [
        t("Les points A et B ont pour affixes "),
        f(lignes[0]),
        t(" et "),
        f(lignes[1]),
        t(`. On donne aussi les points ${e.autresPoints.map((_, i) => nomPoint(i)).join(", ").replace(/, ([^,]*)$/, " et $1")} : `),
        ...autres.flatMap((l, i) => (i === 0 ? [f(l)] : [t(i === autres.length - 1 ? " et " : ", "), f(l)])),
        t("."),
      ];
    }
    case "D":
      return [
        t("On considère la transformation du plan qui associe au point M d'affixe "),
        f("z"),
        t(" le point M′ d'affixe "),
        f(formuleD(e)),
        t(". Détermine sa nature et ses éléments caractéristiques (le vecteur pour une translation ; sinon le centre, et l'angle et/ou le rapport selon sa nature)."),
      ];
  }
}

function questionsPapier(e: ExerciceTransformationsPlan): QuestionExercice[] {
  if (e.famille === "B") {
    if (e.sousType === "somme")
      return [
        { consigne: [t("Calcule l'affixe du point M tel que "), f("z_M=z_A+z_B"), t(", puis place les points A, B et M dans le plan complexe.")] },
        { consigne: [t("Le point M est l'image du point A par une translation. Donne l'affixe du vecteur de cette translation.")] },
      ];
    return [
      { consigne: [t("Calcule l'affixe du point P tel que "), f("z_P=z_A\\cdot z_B"), t(", puis place les points A, B et P dans le plan complexe.")] },
      { consigne: [t("Le point P est l'image du point A par une similitude de centre O. Donne le rapport et l'angle de cette similitude.")] },
    ];
  }
  if (e.famille === "C") {
    const noms = e.autresPoints.map((_, i) => nomPoint(i)).join(", ").replace(/, ([^,]*)$/, " et $1");
    return [
      { consigne: [t("Justifie qu'il existe une rotation de centre O qui transforme A en B, et détermine son angle.")] },
      { consigne: [t(`Calcule les affixes des images des points ${noms} par cette rotation.`)] },
    ];
  }
  return [];
}

function etapesParQuestion(e: ExerciceTransformationsPlan): string[][] | undefined {
  if (e.famille === "B") return [["a"], ["b"]];
  if (e.famille === "C") return [["a", "b"], ["c"]];
  return undefined;
}

/** Titres d'étapes du corrigé — reformulation papier des consignes d'écran (`consigneEcran`). */
function titreEtape(e: ExerciceTransformationsPlan, phase: PhaseTransformationsPlan): FragmentConsigne[] {
  switch (phase) {
    case "aEcran1":
      return [t("Écris la formule complexe de cette transformation.")];
    case "aEcran2":
      return [t("Calcule l'image de P à l'aide de cette formule.")];
    case "bEcran1":
      return e.famille === "B" && e.sousType === "produit" ? [t("Calcule "), f("z_P=z_A\\cdot z_B"), t(".")] : [t("Calcule "), f("z_M=z_A+z_B"), t(".")];
    case "bEcran2":
      return e.famille === "B" && e.sousType === "produit"
        ? [t("Donne le rapport et l'angle de la similitude de centre O qui envoie A sur P.")]
        : [t("Donne l'affixe du vecteur de la translation qui envoie A sur M.")];
    case "cEcran1":
      return [t("Calcule "), f("|z_A|"), t(" et "), f("|z_B|"), t(", et vérifie qu'ils sont égaux.")];
    case "cEcran2":
      return [t("Détermine l'angle de la rotation de centre O qui transforme A en B.")];
    case "cEcran3":
      return [t("Applique cette rotation à chacun des autres points donnés.")];
    case "dEcran1":
      return [t("Détermine la nature de cette transformation.")];
    case "dEcran2":
      return [t("Détermine ses éléments caractéristiques.")];
  }
}

function construireEnonce(e: ExerciceTransformationsPlan): SectionExercice {
  return { enteteFragments: entetePapier(e), questions: phasesPourExercice(e).map((phase) => ({ consigne: titreEtape(e, phase) })) };
}

/** Corrigé historique (pipelines Word/PDF sans corrigé détaillé) : le résultat de chaque étape. */
function construireCorrection(e: ExerciceTransformationsPlan): BlocCorrection[] {
  return phasesPourExercice(e).map((phase, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponse(e, phase)] }));
}

function phaseFinale(e: ExerciceTransformationsPlan): PhaseTransformationsPlan {
  const phases = phasesPourExercice(e);
  return phases[phases.length - 1];
}

/** Réponse finale d'une famille sans sous-question papier (A, D). */
function reponseFinaleSimple(e: ExerciceTransformationsPlan): FragmentConsigne[] {
  if (e.famille === "D") return [...reponse(e, "dEcran1"), t(" : "), ...reponse(e, "dEcran2")];
  return reponse(e, phaseFinale(e));
}

function enoncePapier(e: ExerciceTransformationsPlan): EnoncePapier {
  const questions = questionsPapier(e);
  if (questions.length === 0) return { section: { enteteFragments: entetePapier(e), questions: [] }, reponseBreve: reponseFinaleSimple(e) };
  const phases = phasesPourExercice(e);
  const groupes = etapesParQuestion(e) ?? [];
  const reponsesQuestions = groupes.map((lettres, q) => [t(`${q === 0 ? "" : " ; "}${LETTRES[q]}) `), ...reponse(e, phases[LETTRES.indexOf(lettres[lettres.length - 1])])]);
  return { section: { enteteFragments: entetePapier(e), questions }, etapesParQuestion: groupes, reponseBreve: reponsesQuestions.flat() };
}

// ---------------------------------------------------------------------------------------------
// Figures du corrigé
// ---------------------------------------------------------------------------------------------

const correctionDetaillee = correctionDetailleeTransformationsPlan;

function difficulte(e: ExerciceTransformationsPlan): 1 | 2 | 3 {
  switch (e.famille) {
    case "A":
      return e.parametres.sousType === "translation" || e.parametres.sousType === "homothetie" ? 1 : 2;
    case "B":
      return 2;
    case "C":
      return 3;
    case "D":
      return e.nature === "translation" ? 1 : 3;
  }
}

function reponseBreve(e: ExerciceTransformationsPlan): FragmentConsigne[] {
  return enoncePapier(e).reponseBreve ?? reponseFinaleSimple(e);
}

const POIDS: Record<ExerciceTransformationsPlan["famille"], number[]> = { A: [1.5, 2.5], B: [2, 2], C: [1, 1.5, 1.5], D: [1.5, 2.5] };

function bareme(e: ExerciceTransformationsPlan): BaremeExercice {
  const phases = phasesPourExercice(e);
  const poids = POIDS[e.famille];
  const erreurs = phases.map((phase) => piege(e, phase)).filter((p): p is FragmentConsigne[] => !!p);
  return {
    reponseFinale: reponseBreve(e),
    criteres: phases.map((phase, i) => ({
      sousQuestion: LETTRES[i],
      critere: phase === "aEcran1" ? [f(`z_{P'}=${formatReponseAttenduePhaseLatex(e, phase)[0]}`)] : reponse(e, phase),
      points: poids[i],
    })),
    erreursFrequentes: erreurs.map((description) => ({ description, cout: "−1" })),
    reponsesAcceptees: [[t("Toute écriture équivalente d'un angle (à 2π près)")], [t("Affixes sous la forme a + bi, ou coordonnées (a ; b) du point")]],
  };
}

export const adaptateurEvaluationTransformationsPlan: AdaptateurFeuilleExercices<ExerciceTransformationsPlan> = {
  titreDocument: "Transformations du plan complexe — Évaluation",
  nomFichierBase: "transformations-plan",
  genererInstance: genererExerciceTransformationsPlan,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteTransformationsPlan),
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 10,
  profilInstance: profilTransformationsPlan,
};
