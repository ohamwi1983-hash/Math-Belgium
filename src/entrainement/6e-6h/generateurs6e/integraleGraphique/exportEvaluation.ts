import type { ExerciceIntegraleGraphique } from "../../core6e/integraleGraphique.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { PhaseIntegraleGraphique } from "../../moteur6e/typesIntegraleGraphique";
import { PHASES_INTEGRALE_GRAPHIQUE } from "../../moteur6e/typesIntegraleGraphique";
import {
  abscissesAttendues,
  
} from "../../moteur6e/verificationIntegraleGraphique";
import {
  bornes,
  bornesInconnue,
  bornesInversees,
  consigneGenerale,
  formatReponseAttenduePhaseLatex,
  integraleLatex,
  intervalleLatex,
} from "../../ui6e/formatIntegraleGraphique";
import { figureIntegraleGraphiqueSvg } from "../../ui6e/figureIntegraleGraphique";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceIntegraleGraphique } from "./index";
import type { IdVarianteIntegraleGraphique } from "./index";
import { profilIntegraleGraphique } from "./profilEvaluation";
import { correctionDetailleeIntegraleGraphique } from "./corrigeDetaille";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceIntegraleGraphique>` de `6gen77` « L'intégrale lue
 * sur un graphique (aire signée) » — méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - Énoncé papier : la consigne générale de l'écran, la courbe sur quadrillage (`enteteHtml`, la MÊME
 *   figure qu'à l'écran, sans aucune région coloriée) et UNE demande. Les trois écrans (découpe ou
 *   lecture, aires signées ou additivité, somme ou bornes inversées) deviennent les étapes du corrigé
 *   (lettres a, b, c).
 * - Corrigé : valeurs tirées des MÊMES fonctions que l'écran (`formatReponseAttenduePhaseLatex`,
 *   `moteur6e/verificationIntegraleGraphique.ts`) ; la figure coloriée (aires positives en vert,
 *   négatives en rouge, valeur de chaque morceau) en `figureHtml` ; une ligne « Piège » ciblée.
 * - Version aménagée : même énoncé (le pipeline ne change que la mise en page).
 */

const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);
const LETTRES: Record<PhaseIntegraleGraphique, string> = { ecran1: "a", ecran2: "b", ecran3: "c" };

function listeLatex(formules: string[]): FragmentConsigne[] {
  return formules.flatMap((x, i) => (i === 0 ? [f(x)] : [t(" ; "), f(x)]));
}

// ============================================================================
// Énoncé.
// ============================================================================

function demande(e: ExerciceIntegraleGraphique): FragmentConsigne[] {
  if (e.variante === "calcul") return [t(" Donne la valeur exacte.")];
  if (e.variante === "aireIntegrale") return [t(" Calcule ces deux nombres (valeurs exactes).")];
  const [hi, lo] = bornesInversees(e);
  return [t(" Calcule "), f(integraleLatex(hi, lo)), t(" (valeur exacte).")];
}

function entetePapier(e: ExerciceIntegraleGraphique): FragmentConsigne[] {
  return [...consigneGenerale(e), ...demande(e)];
}

function titreEtape(e: ExerciceIntegraleGraphique, phase: PhaseIntegraleGraphique): FragmentConsigne[] {
  const { a, b } = bornes(e);
  if (e.variante === "calcul") {
    if (phase === "ecran1") return [t("Découpe "), f(intervalleLatex(a, b)), t(" à chaque sommet de la courbe et à chaque point où elle traverse l'axe des abscisses.")];
    if (phase === "ecran2") return [t("Calcule l'intégrale de "), f("f"), t(" sur chaque morceau (aire comptée négativement sous l'axe).")];
    return [t("Déduis-en "), f(integraleLatex(a, b)), t(".")];
  }
  if (e.variante === "aireIntegrale") {
    if (phase === "ecran1") return [t("Repère les abscisses où "), f("f"), t(" change de signe.")];
    if (phase === "ecran2") return [t("Calcule l'intégrale de "), f("f"), t(" sur chaque intervalle où elle garde un signe constant.")];
    return [t("Déduis-en l'intégrale "), f(integraleLatex(a, b)), t(" et l'aire de la région.")];
  }
  const [g, d] = bornesInconnue(e);
  const [hi, lo] = bornesInversees(e);
  if (phase === "ecran1") return [t("Lis "), f(integraleLatex(e.c, e.d)), t(" sur le graphique, à l'aide d'aires de figures simples.")];
  if (phase === "ecran2") return [t("Calcule "), f(integraleLatex(g, d)), t(" par additivité (relation de Chasles).")];
  return [t("Déduis-en "), f(integraleLatex(hi, lo)), t(".")];
}

function construireEnonce(e: ExerciceIntegraleGraphique): SectionExercice {
  return {
    enteteFragments: entetePapier(e),
    enteteHtml: figureIntegraleGraphiqueSvg(e, false),
    questions: PHASES_INTEGRALE_GRAPHIQUE.map((phase) => ({ consigne: titreEtape(e, phase) })),
  };
}

function construireCorrection(e: ExerciceIntegraleGraphique): BlocCorrection[] {
  return PHASES_INTEGRALE_GRAPHIQUE.map((phase) => ({ type: "paragraphe", fragments: [t(`${LETTRES[phase]}) `), ...listeLatex(formatReponseAttenduePhaseLatex(e, phase))] }));
}

function reponseBreve(e: ExerciceIntegraleGraphique): FragmentConsigne[] {
  return listeLatex(formatReponseAttenduePhaseLatex(e, "ecran3"));
}

function enoncePapier(e: ExerciceIntegraleGraphique): EnoncePapier {
  return { section: { enteteFragments: entetePapier(e), enteteHtml: figureIntegraleGraphiqueSvg(e, false), questions: [] }, reponseBreve: reponseBreve(e) };
}

const correctionDetaillee = correctionDetailleeIntegraleGraphique;

function difficulte(e: ExerciceIntegraleGraphique): 1 | 2 | 3 {
  return e.variante === "aireIntegrale" ? 3 : 2;
}

// ============================================================================
// Barème (somme 4).
// ============================================================================

function erreurDisque(e: ExerciceIntegraleGraphique): { description: FragmentConsigne[]; cout: string }[] {
  if (e.disque === "aucun") return [];
  return [{ description: [t(e.disque === "demi" ? "Demi-disque compté comme un disque entier" : "Quart de disque compté comme un demi-disque ou un disque entier")], cout: "−0,5" }];
}

function bareme(e: ExerciceIntegraleGraphique): BaremeExercice {
  const r2 = formatReponseAttenduePhaseLatex(e, "ecran2");
  const r3 = formatReponseAttenduePhaseLatex(e, "ecran3");
  const accepte = [[t("Toute écriture exacte équivalente (fraction non simplifiée, décimal exact, π factorisé)")], [t("Un autre découpage en figures simples, s'il aboutit au même résultat")]];
  if (e.variante === "calcul") {
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [t("Découpage aux changements de forme et aux zéros : "), ...listeLatex(abscissesAttendues(e).map((x) => `x=${x}`))], points: 0.75 },
        { sousQuestion: "b", critere: [t("Aires des figures correctes (formules et dimensions lues)")], points: 1.25 },
        { sousQuestion: "b", critere: [t("Signes corrects (négatif sous l'axe) : "), ...listeLatex(r2)], points: 1 },
        { sousQuestion: "c", critere: [f(r3[0])], points: 1 },
      ],
      erreursFrequentes: [
        { description: [t("Morceaux sous l'axe comptés positivement (aire au lieu d'intégrale)")], cout: "−1,5" },
        ...erreurDisque(e),
        { description: [t("Valeur approchée au lieu de la valeur exacte")], cout: "−0,25" },
      ],
      reponsesAcceptees: accepte,
    };
  }
  if (e.variante === "aireIntegrale") {
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [t("Changements de signe : "), ...listeLatex(abscissesAttendues(e).map((x) => `x=${x}`))], points: 0.5 },
        { sousQuestion: "b", critere: [t("Intégrales signées sur chaque intervalle : "), ...listeLatex(r2)], points: 1.5 },
        { sousQuestion: "c", critere: [f(r3[0])], points: 1 },
        { sousQuestion: "c", critere: [t("Aire : "), f(r3[1])], points: 1 },
      ],
      erreursFrequentes: [
        { description: [t("Même nombre donné pour l'intégrale et l'aire")], cout: "0 pt sur l'une des deux réponses" },
        { description: [t("Aire négative (intégrale recopiée)")], cout: "−1" },
        ...erreurDisque(e),
      ],
      reponsesAcceptees: accepte,
    };
  }
  const [g, d] = bornesInconnue(e);
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [f(formatReponseAttenduePhaseLatex(e, "ecran1")[0]), t(", par des aires signées")], points: 1.5 },
      { sousQuestion: "b", critere: [t("Relation de Chasles écrite et "), f(`${integraleLatex(g, d)}=${e.inconnue}`)], points: 1.5 },
      { sousQuestion: "c", critere: [f(r3[0]), t(" (bornes inversées)")], points: 1 },
    ],
    erreursFrequentes: [
      { description: [t("Signe oublié lors de l'inversion des bornes")], cout: "−1" },
      { description: [t("Intégrale lue ajoutée au lieu d'être retranchée")], cout: "0 pt sur b)" },
      { description: [t("Partie sous l'axe comptée positivement")], cout: "−0,75" },
    ],
    reponsesAcceptees: accepte,
  };
}

export const adaptateurEvaluationIntegraleGraphique: AdaptateurFeuilleExercices<ExerciceIntegraleGraphique> = {
  titreDocument: "L'intégrale lue sur un graphique — Évaluation",
  nomFichierBase: "integrale-graphique",
  genererInstance: genererExerciceIntegraleGraphique,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteIntegraleGraphique),
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 8,
  profilInstance: profilIntegraleGraphique,
};

