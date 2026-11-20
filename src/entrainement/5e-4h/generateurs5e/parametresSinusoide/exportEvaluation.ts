import type { ExerciceParametresSinusoide, FormeAffichageSinusoide } from "../../core5e/parametresSinusoide.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  CriteresDifficulte,
  ErreurFrequente,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { consignePhase, formatChampParametreLatex, formatFormuleLatex } from "../../ui5e/formatParametresSinusoide";
import { ORDRE_PHASES_SINUSOIDE, type PhaseParametresSinusoide } from "../../moteur5e/typesParametresSinusoide";
import { CATALOGUE_FORMES, construireAvecFormeId, genererExerciceParametresSinusoide } from "./index";
import { correctionDetailleeParametresSinusoide, lettresLectureSinusoide } from "./corrigeDetaille";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { profilParametresSinusoide, PARAMETRES_SINUSOIDE } from "../profilsEvaluationTrigonometrie";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceParametresSinusoide>` pour 5gen8 (Paramètres d'une
 * fonction sinusoïdale). Méthode des feuilles : `.claude/rules/feuilles-evaluations.md`.
 *
 * - `construireEnonce` : les 7 étapes de l'écran interactif (une par paramètre, ordre du cours
 *   `ORDRE_PHASES_SINUSOIDE`, lettres a → g) — sur papier, elles ne servent qu'aux titres du corrigé.
 * - `enoncePapier` : la formule et UNE consigne globale qui liste les 7 paramètres.
 * Toutes les valeurs viennent de `formatChampParametreLatex` (celles du récapitulatif de l'écran) et
 * des champs exacts de l'instance (`B` = ω, `C` = φ, `phi` = Φ, noms historiques).
 */

const PRECISION = " (valeur exacte, ou arrondie au centième)";
const LETTRE: Record<PhaseParametresSinusoide, string> = { amplitude: "a", pulsation: "b", periode: "c", frequence: "d", dephasage: "e", phi: "f", decalage: "g" };

/** Consigne d'une étape, sans la précision d'arrondi (rappelée une fois dans la consigne globale). */
function consigneEtape(phase: PhaseParametresSinusoide): FragmentConsigne[] {
  return [texte(consignePhase(phase).replace(PRECISION, ""))];
}

function construireEnonceParametresSinusoide(exercice: ExerciceParametresSinusoide): SectionExercice {
  return {
    enteteFragments: [texte("On considère la fonction sinusoïdale "), latex(formatFormuleLatex(exercice)), texte(".")],
    questions: ORDRE_PHASES_SINUSOIDE.map((phase) => ({ consigne: consigneEtape(phase) })),
  };
}

const CONSIGNE_GLOBALE =
  "Détermine l'amplitude, la pulsation ω, la période T, la fréquence, le déphasage φ, le décalage horizontal Φ et le décalage vertical b de cette fonction (valeurs exactes, ou arrondies au centième).";

function enoncePapierParametresSinusoide(exercice: ExerciceParametresSinusoide): EnoncePapier {
  return {
    section: {
      enteteFragments: [texte("On considère la fonction sinusoïdale "), latex(formatFormuleLatex(exercice)), texte(".")],
      questions: [{ consigne: [texte(CONSIGNE_GLOBALE)] }],
    },
    etapesParQuestion: [ORDRE_PHASES_SINUSOIDE.map((phase) => LETTRE[phase])],
  };
}

function construireCorrectionParametresSinusoide(exercice: ExerciceParametresSinusoide): BlocCorrection[] {
  return ORDRE_PHASES_SINUSOIDE.map((champ) => ({ type: "paragraphe", fragments: [latex(formatChampParametreLatex(exercice, champ))] }));
}

/** Les 7 paramètres, « label = valeur », séparés par « ; ». */
function listeParametres(exercice: ExerciceParametresSinusoide): FragmentConsigne[] {
  return ORDRE_PHASES_SINUSOIDE.flatMap((champ, i) => [...(i === 0 ? [] : [texte(" ; ")]), latex(formatChampParametreLatex(exercice, champ))]);
}

function reponseBreveParametresSinusoide(exercice: ExerciceParametresSinusoide): FragmentConsigne[] {
  return listeParametres(exercice);
}

/** Critères du niveau (grille commune, `export/niveauDifficulte.ts`), jugés sur l'énoncé PAPIER :
 * écrans de pure lecture (`lettresLectureSinusoide`) : A, ω, b, et φ (forme développée) ou Φ (forme
 * pré-factorisée) — les calculs sont T, f et Φ (ou φ) ; méthode 0 (formules du cours imposées) ;
 * piège 1 si un signe des données trompe : coefficient A négatif (l'amplitude est |A|) ou, en forme
 * pré-factorisée, parenthèse « x + k » (Φ < 0) ; nombres 0 (valeurs exactes). */
function criteresDifficulteParametresSinusoide(exercice: ExerciceParametresSinusoide): CriteresDifficulte {
  const piege = exercice.A.signe < 0 || (exercice.forme === "prefactorisee" && exercice.phi.numerateur < 0) ? 1 : 0;
  return { ...etapesDuCorrige(correctionDetailleeParametresSinusoide(exercice), lettresLectureSinusoide(exercice)), methode: 0, piege, nombres: 0 };
}

/** Poids par étape (somme 4) : déphasage et décalage horizontal demandent un calcul, les autres une lecture. */
const POIDS: Record<PhaseParametresSinusoide, number> = { amplitude: 0.5, pulsation: 0.5, periode: 0.5, frequence: 0.5, dephasage: 0.75, phi: 0.75, decalage: 0.5 };

function baremeParametresSinusoide(exercice: ExerciceParametresSinusoide): BaremeExercice {
  const erreurs: ErreurFrequente[] = [
    { description: [texte("Période calculée avec la mauvaise formule ("), latex("T = \\dfrac{\\omega}{2\\pi}"), texte(" ou "), latex("T = 2\\pi\\omega"), texte(")")], cout: "0 pt sur c), suite notée sans double pénalité" },
    { description: [texte("Déphasage φ et décalage horizontal Φ confondus")], cout: "0 pt sur e) ou sur f)" },
  ];
  if (exercice.A.signe < 0) erreurs.unshift({ description: [texte("Amplitude donnée avec son signe (coefficient négatif recopié)")], cout: "0 pt sur a)" });
  if (exercice.forme === "prefactorisee") erreurs.push({ description: [texte("Signe de Φ inversé (lu tel qu'écrit dans la parenthèse)")], cout: "0 pt sur f)" });
  if (exercice.b < 0) erreurs.push({ description: [texte("Décalage vertical pris en valeur absolue")], cout: "0 pt sur g)" });
  return {
    reponseFinale: listeParametres(exercice),
    criteres: ORDRE_PHASES_SINUSOIDE.map((champ) => ({ sousQuestion: LETTRE[champ], critere: [latex(formatChampParametreLatex(exercice, champ))], points: POIDS[champ] })),
    erreursFrequentes: erreurs,
    reponsesAcceptees: [
      [texte("Décalage horizontal à une période près : "), latex("\\Phi + kT")],
      [texte("Déphasage à "), latex("2\\pi"), texte(" près : "), latex("\\varphi + 2k\\pi")],
      [texte("Valeurs arrondies au centième")],
    ],
  };
}

export const adaptateurEvaluationParametresSinusoide: AdaptateurFeuilleExercices<ExerciceParametresSinusoide> = {
  profilInstance: profilParametresSinusoide,
  parametresAuChoix: PARAMETRES_SINUSOIDE,
  titreDocument: "Paramètres d'une fonction sinusoïdale — Évaluation",
  nomFichierBase: "parametres-sinusoide",
  genererInstance: genererExerciceParametresSinusoide,
  catalogueVariantes: CATALOGUE_FORMES,
  genererInstanceAvecVariante: (id) => construireAvecFormeId(id as FormeAffichageSinusoide),
  construireEnonce: construireEnonceParametresSinusoide,
  construireCorrection: construireCorrectionParametresSinusoide,
  criteresDifficulte: criteresDifficulteParametresSinusoide,
  reponseBreve: reponseBreveParametresSinusoide,
  correctionDetaillee: correctionDetailleeParametresSinusoide,
  bareme: baremeParametresSinusoide,
  enoncePapier: enoncePapierParametresSinusoide,
};
