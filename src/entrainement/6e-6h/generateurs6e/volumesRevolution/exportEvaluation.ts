import type { ExerciceVolumesRevolution } from "../../core6e/volumesRevolution.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  FragmentConsigne,
  QuestionExercice,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import type { CriteresDifficulte } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/fragmentsDocx";
import {
  blocDonnees,
  consigneEcran,
  consigneGenerale,
  differenceCarresLatex,
  formatReponseAttenduePhaseLatex,
} from "../../ui6e/formatVolumesRevolution";
import { CONSIGNE_EXACTE } from "../../ui6e/nombresExactsIntegrales";
import { phasesPourExercice } from "../../moteur6e/typesVolumesRevolution";
import type { PhaseVolumesRevolution } from "../../moteur6e/typesVolumesRevolution";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceVolumesRevolution } from "./index";
import type { IdVarianteVolumesRevolution } from "./index";
import { donneesPapier, nettoyerConsigne } from "../calculAires/papierCommun";
import { LIBELLE_CAS_VOLUMES_REVOLUTION, profilVolumesRevolution } from "./profilEvaluation";
import { correctionDetailleeVolumesRevolution, piegeVolumesRevolution } from "./corrigeDetaille";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceVolumesRevolution>` pour `6gen27` (Volumes de
 * révolution) — feuille d'exercices et évaluation, méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - `construireEnonce` : une question par ÉCRAN (= une étape, lettres a, b…) ; consignes d'écran
 *   nettoyées des tournures propres à l'écran → titres « Étape n — … » du corrigé.
 * - `enoncePapier` : consigne globale (formule du volume), données, UNE demande (le volume) pour les
 *   familles A, B, C — racines, développement de [f(x)]², primitive : étapes du corrigé. Famille D :
 *   trois VRAIES questions (volume du paraboloïde, du cylindre, rapport). En A trigonométrique, la
 *   consigne rappelle l'identité de cos² (l'écran la donnait).
 * - Résultats : `formatReponseAttenduePhaseLatex` (ceux de l'appli) ; figure (région et solide) :
 *   `figureVolumesRevolutionSvg`, la même qu'à l'écran, sous la dernière étape du corrigé.
 */

const LETTRES = "abcdefgh";
const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);

/** Étapes dont la réponse est un développement : on rappelle ce qui a été développé. */
function prefixe(exercice: ExerciceVolumesRevolution, phase: PhaseVolumesRevolution): string {
  if (phase === "aEcran1" || phase === "bEcran2") return "[f(x)]^2=";
  if (phase === "cEcran3" && exercice.famille === "C") return `${differenceCarresLatex(exercice)}=`;
  return "";
}

/** Consigne d'une étape (corrigé papier) : celle de l'écran, sans le rappel cos² quand f n'est pas trigonométrique. */
function consigneEtape(exercice: ExerciceVolumesRevolution, phase: PhaseVolumesRevolution): FragmentConsigne[] {
  const consigne = nettoyerConsigne(consigneEcran(exercice, phase));
  if (phase === "aEcran1" && exercice.famille === "A" && exercice.type !== "trigonometrique") return [...consigne.slice(0, 2), t(".")];
  return consigne;
}

function reponse(exercice: ExerciceVolumesRevolution, phase: PhaseVolumesRevolution): FragmentConsigne[] {
  return [latex(prefixe(exercice, phase) + formatReponseAttenduePhaseLatex(exercice, phase).join(",\\quad "))];
}

function derniere(exercice: ExerciceVolumesRevolution): PhaseVolumesRevolution {
  const phases = phasesPourExercice(exercice);
  return phases[phases.length - 1];
}

// ============================================================================
// Énoncé interactif (étapes) et corrigé historique.
// ============================================================================

function entete(exercice: ExerciceVolumesRevolution): FragmentConsigne[] {
  return [...consigneGenerale(exercice), ...donneesPapier(blocDonnees(exercice))];
}

function construireEnonce(exercice: ExerciceVolumesRevolution): SectionExercice {
  return { enteteFragments: entete(exercice), questions: phasesPourExercice(exercice).map((phase) => ({ consigne: consigneEtape(exercice, phase) })) };
}

function construireCorrection(exercice: ExerciceVolumesRevolution): BlocCorrection[] {
  return phasesPourExercice(exercice).map((phase, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponse(exercice, phase)] }));
}

// ============================================================================
// Énoncé papier.
// ============================================================================

const q = (...fragments: FragmentConsigne[]): QuestionExercice => ({ consigne: fragments });

function enoncePapier(exercice: ExerciceVolumesRevolution): EnoncePapier {
  if (exercice.famille === "D") {
    return {
      section: {
        enteteFragments: [...entete(exercice), t(" Donne les valeurs exactes.")],
        questions: [
          q(t("Calcule le volume du paraboloïde.")),
          q(t("Calcule le volume du cylindre englobant, de rayon "), f("f(L)"), t(" et de hauteur L.")),
          q(t("Calcule le rapport du volume du paraboloïde au volume du cylindre.")),
        ],
      },
      etapesParQuestion: [["a"], ["b"], ["c"]],
    };
  }
  const rappelTrig: FragmentConsigne[] =
    exercice.famille === "A" && exercice.type === "trigonometrique" ? [t(" Rappel : "), f("{\\cos^2(x)=\\dfrac{1+\\cos(2x)}{2}}"), t(".")] : [];
  return {
    section: { enteteFragments: [...entete(exercice), ...rappelTrig, t(` Calcule ce volume. ${CONSIGNE_EXACTE}`)], questions: [] },
    reponseBreve: reponse(exercice, derniere(exercice)),
  };
}

// ============================================================================
// Corrigé détaillé.
// ============================================================================

/** Critères du niveau de difficulté (grille commune, `export/niveauDifficulte.ts`) : méthode et
 * piège jugés par variante (analyse des cinq chapitres), étapes lues sur le corrigé détaillé. */
function criteresDifficulte(e: ExerciceVolumesRevolution): CriteresDifficulte {
  const d = e.famille === "D" ? 1 : 0;
  return { ...etapesDuCorrige(correctionDetailleeVolumesRevolution(e)), methode: d, piege: d };
}

function reponseBreve(exercice: ExerciceVolumesRevolution): FragmentConsigne[] {
  if (exercice.famille === "D") return phasesPourExercice(exercice).flatMap((phase, i) => [t(`${i === 0 ? "" : " ; "}${LETTRES[i]}) `), ...reponse(exercice, phase)]);
  return reponse(exercice, derniere(exercice));
}

function poids(exercice: ExerciceVolumesRevolution): number[] {
  switch (exercice.famille) {
    case "A":
      return [1.5, 1, 1.5];
    case "B":
    case "C":
      return [1, 1, 1, 1];
    case "D":
      return [1.5, 1.5, 1];
  }
}

function bareme(exercice: ExerciceVolumesRevolution): BaremeExercice {
  const phases = phasesPourExercice(exercice);
  const w = poids(exercice);
  const erreurs: { description: FragmentConsigne[]; cout: string }[] = [];
  for (const phase of phases) {
    const piege = piegeVolumesRevolution(exercice, phase);
    if (piege) erreurs.push({ description: [t(piege)], cout: "−1" });
  }
  return {
    reponseFinale: reponse(exercice, derniere(exercice)),
    criteres: phases.map((phase, i) => ({ sousQuestion: LETTRES[i], critere: reponse(exercice, phase), points: w[i] })),
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[t("Valeur exacte seulement (multiple de π, forme avec e ou sin) : un arrondi seul ne suffit pas ; un développement non réduit mais juste est accepté")]],
  };
}

export const adaptateurEvaluationVolumesRevolution: AdaptateurFeuilleExercices<ExerciceVolumesRevolution> = {
  titreDocument: "Volumes de révolution — Évaluation",
  nomFichierBase: "volumes-revolution",
  genererInstance: genererExerciceVolumesRevolution,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteVolumesRevolution),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeVolumesRevolution,
  bareme,
  enoncePapier,
  profilInstance: profilVolumesRevolution,
  libelleCasParticulier: LIBELLE_CAS_VOLUMES_REVOLUTION,
};
