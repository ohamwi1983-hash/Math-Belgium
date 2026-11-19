import type { ExerciceAiresFormesReelles } from "../../core6e/airesFormesReelles.types";
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
import { phasesExercice } from "../../moteur6e/modeleAiresFormesReelles";
import type { PhaseFormesReelles } from "../../moteur6e/modeleAiresFormesReelles";
import {
  blocDonnees,
  consigneEcran,
  consigneGenerale,
  formatReponseAttenduePhaseLatex,
} from "../../ui6e/formatAiresFormesReelles";
import { schemaEnonceSvg } from "../../ui6e/figureAiresFormesReelles";
import { profilAiresFormesReelles } from "./profilEvaluation";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceAiresFormesReelles } from "./index";
import type { IdVarianteAiresFormesReelles } from "./index";
import { correctionDetailleeAiresFormesReelles } from "./corrigeDetaille";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceAiresFormesReelles>` de `6gen81` « Aires de formes
 * réelles » — méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - Énoncé papier : la situation, les formules données, le schéma coté (`enteteHtml`, repère
 *   superposé seulement si la fonction est donnée) et une consigne globale (modéliser, précision).
 *   Les VRAIES questions du problème restent en a) b) c) : aire (mur : surface à peindre ; parcelle :
 *   aire en m²), puis peinture / coût / volume / valeur. Les étapes de guidage (bornes, aire de la
 *   partie courbe) passent au corrigé (« Étape n — … »).
 * - Corrigé : valeurs tirées des MÊMES fonctions que l'écran (`formatReponseAttenduePhaseLatex`,
 *   `calculIntegraleTex`), une ligne « Piège » ciblée par étape, la figure du corrigé (repère,
 *   fonction, aire colorée) sous la conclusion de l'étape « aire ».
 * - Version aménagée : même énoncé (le pipeline ne change que la mise en page).
 */

type E = ExerciceAiresFormesReelles;

const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);
const LETTRES = "abcde";

function lettre(e: E, phase: PhaseFormesReelles): string {
  return LETTRES[phasesExercice(e).indexOf(phase)];
}

function liste(formules: string[]): FragmentConsigne[] {
  return formules.flatMap((x, i) => (i === 0 ? [f(x)] : [t(" ; "), f(x)]));
}

// ============================================================================
// Énoncé papier.
// ============================================================================

function consigneGlobale(e: E): FragmentConsigne[] {
  const precision = " Donne les aires sous forme exacte ou arrondies au centième.";
  switch (e.situation) {
    case "mur":
      return [t(e.modele === "retrouver" ? " Modélise le bord du fronton par une parabole, dans un repère de ton choix (axe des abscisses le long du bord supérieur du rectangle, unité 1 m)." + precision : precision)];
    case "vitrail":
      return [t(precision)];
    case "section": {
      const u = e.contexte === "gouttiere" ? "cm" : "m";
      const base = e.contexte === "gouttiere" ? "du bord supérieur" : "du sol";
      return [t(e.modele === "retrouver" ? ` Modélise l'arc par une parabole, dans un repère de ton choix (axe des abscisses le long ${base}, unité 1 ${u}).${precision}` : precision)];
    }
    case "parcelle":
      return [t(e.modele === "retrouver" ? " Modélise la berge par une parabole dans ce repère." + precision : precision)];
  }
}

function entete(e: E): FragmentConsigne[] {
  const formules = blocDonnees(e);
  const donnees: FragmentConsigne[] = formules.length === 0 ? [] : [t(" On donne : "), ...liste(formules), t(".")];
  return [...consigneGenerale(e), ...donnees, ...consigneGlobale(e)];
}

const q = (...fragments: FragmentConsigne[]): QuestionExercice => ({ consigne: fragments });

/** Vraies questions du problème et étapes qu'elles couvrent. */
function questionsPapier(e: E): { questions: QuestionExercice[]; etapes: string[][] } {
  switch (e.situation) {
    case "mur":
      return {
        questions: [q(t("Calcule l'aire du mur à peindre, en m².")), q(t("Combien de litres de peinture faut-il pour les deux couches ? Combien de pots faut-il acheter ?")), q(t("Quel est le coût de la peinture ?"))],
        etapes: [["a", "b", "c"], ["d"], ["e"]],
      };
    case "vitrail":
      return { questions: [q(t("Calcule l'aire de la lentille de verre rouge, en dm².")), q(t("Calcule le coût total du verre du vitrail, au centime près."))], etapes: [["a", "b"], ["c", "d"]] };
    case "section": {
      const aire = e.contexte === "gouttiere" ? "cm²" : "m²";
      const volume = e.contexte === "canal" ? "le volume d'eau contenu dans le canal plein, en m³" : e.contexte === "tunnel" ? "le volume de terre à évacuer, en m³" : "le volume d'eau contenu dans la gouttière pleine, en litres";
      return { questions: [q(t(`Calcule l'aire de la section, en ${aire}.`)), q(t(`Calcule ${volume}.`))], etapes: [["a", "b"], ["c"]] };
    }
    case "parcelle":
      return { questions: [q(t("Calcule l'aire de la parcelle, en m².")), q(t("Quelle est la valeur de la parcelle, arrondie à l'euro ?"))], etapes: [["a", "b", "c"], ["d"]] };
  }
}

function reponseBreve(e: E): FragmentConsigne[] {
  const { etapes } = questionsPapier(e);
  const phases = phasesExercice(e);
  return etapes.flatMap((lettres, i) => {
    const derniere = phases[LETTRES.indexOf(lettres[lettres.length - 1])];
    return [...(i > 0 ? [t(" ; ")] : []), t(`${LETTRES[i]}) `), ...liste(formatReponseAttenduePhaseLatex(e, derniere))];
  });
}

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: entete(e), enteteHtml: schemaEnonceSvg(e), questions: phasesExercice(e).map((phase) => ({ consigne: consigneEcran(e, phase) })) };
}

function construireCorrection(e: E): BlocCorrection[] {
  return phasesExercice(e).map((phase) => ({ type: "paragraphe", fragments: [t(`${lettre(e, phase)}) `), ...liste(formatReponseAttenduePhaseLatex(e, phase))] }));
}

function enoncePapier(e: E): EnoncePapier {
  const { questions, etapes } = questionsPapier(e);
  return { section: { enteteFragments: entete(e), enteteHtml: schemaEnonceSvg(e), questions }, etapesParQuestion: etapes, reponseBreve: reponseBreve(e) };
}

// ============================================================================
// Corrigé détaillé.
// ============================================================================

const correctionDetaillee = correctionDetailleeAiresFormesReelles;

// ============================================================================
// Barème (poids, somme 4).
// ============================================================================

const POIDS: Record<E["situation"], Partial<Record<PhaseFormesReelles, number>>> = {
  mur: { modeliser: 1, aire: 1, total: 0.5, peinture: 1, cout: 0.5 },
  vitrail: { modeliser: 1, aire: 1, total: 0.5, cout: 1.5 },
  section: { modeliser: 1, aire: 1.5, volume: 1.5 },
  parcelle: { modeliser: 1, aire: 1, total: 1, cout: 1 },
};

function critere(e: E, phase: PhaseFormesReelles): FragmentConsigne[] {
  const reponse = liste(formatReponseAttenduePhaseLatex(e, phase));
  if (phase === "modeliser") return e.situation === "vitrail" ? [t("Intersections : "), ...reponse] : e.modele === "retrouver" ? [t("Modèle et bornes : "), ...reponse] : [t("Bornes : "), ...reponse];
  if (phase === "aire") return [t("Intégrale correcte et aire : "), ...reponse];
  return reponse;
}

function erreurs(e: E): ErreurFrequente[] {
  switch (e.situation) {
    case "mur":
      return [
        { description: [t("Oubli de la partie rectangulaire")], cout: "−0,5 et suite cohérente" },
        { description: [t("Nombre de pots arrondi vers le bas")], cout: "−0,5" },
        { description: [t("Une seule couche comptée")], cout: "−0,5" },
      ];
    case "vitrail":
      return [
        { description: [t("Bornes prises aux bords du vitrail")], cout: "0 pt sur les étapes 1 et 2" },
        { description: [t("Aires en dm² multipliées par un prix au m²")], cout: "−1" },
      ];
    case "section":
      return [
        { description: [t("Aire négative (intégrale non corrigée de son signe)")], cout: "−0,5" },
        { description: e.contexte === "gouttiere" ? [t("Conversion cm³ → L ou longueur en m oubliée")] : [t("Oubli de la multiplication par la longueur")], cout: "−1" },
      ];
    case "parcelle":
      return [
        { description: [t("Bornes en mètres au lieu des unités du repère")], cout: "0 pt sur les étapes 1 et 2" },
        { description: [t("Conversion 1 u.a. = 10 m²")], cout: "−1" },
      ];
  }
}

function bareme(e: E): BaremeExercice {
  const criteres: CritereBareme[] = phasesExercice(e).map((phase) => ({ sousQuestion: lettre(e, phase), critere: critere(e, phase), points: POIDS[e.situation][phase] ?? 0 }));
  const acceptees: FragmentConsigne[][] = [[t("Valeurs exactes ou arrondies au centième ; une erreur de calcul n'est pénalisée qu'une fois (suite cohérente)")]];
  if ((e.situation === "mur" || e.situation === "section") && e.modele === "retrouver") acceptees.push([t("Tout repère dont l'axe des abscisses suit la base de l'arc (équation translatée, mêmes aires)")]);
  return { reponseFinale: reponseBreve(e), criteres, erreursFrequentes: erreurs(e), reponsesAcceptees: acceptees };
}

/** Critères du niveau de difficulté (grille commune, `export/niveauDifficulte.ts`) : méthode et
 * piège jugés par variante (analyse des cinq chapitres), étapes lues sur le corrigé détaillé. */
function criteresDifficulte(e: E): CriteresDifficulte {
  // « retrouver » : l'élève construit lui-même l'équation de l'arc (modélisation) ; sinon fonction donnée.
  return { ...etapesDuCorrige(correctionDetaillee(e)), methode: e.modele === "retrouver" ? 2 : 1, piege: 1 };
}

export const adaptateurEvaluationAiresFormesReelles: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Aires de formes réelles — Évaluation",
  nomFichierBase: "aires-formes-reelles",
  genererInstance: genererExerciceAiresFormesReelles,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteAiresFormesReelles),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  profilInstance: profilAiresFormesReelles,
};

