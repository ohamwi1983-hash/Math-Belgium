import type { ExerciceEncadrerIntegrales } from "../../core6e/encadrerIntegrales.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  EnoncePapier,
  ErreurFrequente,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import type { CriteresDifficulte } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/fragmentsDocx";
import { estPhaseChoix, phasesExercice } from "../../moteur6e/typesEncadrerIntegrales";
import type { PhaseEncadrerIntegrales } from "../../moteur6e/typesEncadrerIntegrales";
import {
  bornesOrdonnees,
  formatReponseAttendueLatex,
  integraleLatex,
  intervalle,
  optionCorrecteFragments,
} from "../../ui6e/formatEncadrerIntegrales";
import { figureEnoncePapier } from "../../ui6e/figureEncadrerIntegrales";
import { profilEncadrerIntegrales } from "../profilsEvaluationEncadrerIntegrales";
import { correctionDetailleeEncadrerIntegrales } from "./corrigeDetaille";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEncadrerIntegrales } from "./index";
import type { IdVarianteEncadrerIntegrales } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceEncadrerIntegrales>` de `6gen79` « Comparer et
 * encadrer des intégrales » — méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - Énoncé papier : la fonction, l'intégrale et UNE consigne globale (« sans calculer… ») ; pour
 *   l'encadrement, la courbe (f monotone) ou le tableau de variations (`enteteHtml`, sans aucune
 *   valeur de m ou M). Les écrans deviennent les étapes du corrigé (« Étape n — … »).
 * - Corrigé : justifications et réponses tirées des MÊMES fonctions que l'écran (`justification`
 *   du catalogue, `optionCorrecteFragments`, `formatReponseAttendueLatex`) ; figure en `figureHtml`
 *   (courbe(s) pour le signe et la comparaison, rectangles m(b − a) et M(b − a) pour l'encadrement).
 * - Version aménagée : même énoncé (le pipeline ne change que la mise en page).
 */

const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);
const LETTRES = ["a", "b", "c", "d"];

function lettre(e: ExerciceEncadrerIntegrales, phase: PhaseEncadrerIntegrales): string {
  return LETTRES[phasesExercice(e).indexOf(phase)];
}

function frac(n: string): string {
  return n.replace(/\\dfrac/g, "\\frac");
}

function integraleOrdonnee(e: ExerciceEncadrerIntegrales): string {
  const [p, q] = bornesOrdonnees(e);
  return `\\int_{${frac(p.latex)}}^{${frac(q.latex)}} f(x)\\,dx`;
}

// ============================================================================
// Énoncé papier.
// ============================================================================

function entetePapier(e: ExerciceEncadrerIntegrales): FragmentConsigne[] {
  switch (e.variante) {
    case "signe":
      return [t("On considère la fonction "), f(`f(x)=${e.fLatex}`), t(" et l'intégrale "), f(`I=${integraleLatex(e)}`), t(". Sans calculer "), f("I"), t(", détermine son signe en justifiant.")];
    case "comparer":
      return [
        t("On considère les fonctions "),
        f(`f(x)=${e.fLatex}`),
        t(" et "),
        f(`g(x)=${e.gLatex}`),
        t(", ainsi que les intégrales "),
        f(`I=${integraleLatex(e, "f")}`),
        t(" et "),
        f(`J=${integraleLatex(e, "g")}`),
        t(". Sans calculer ces intégrales, compare-les en justifiant, ou explique pourquoi les propriétés de l'intégrale ne permettent pas de conclure."),
      ];
    case "encadrer":
      return [
        t("La fonction f est définie sur "),
        f(intervalle(e.a, e.b)),
        t(" par "),
        f(`f(x)=${e.fLatex}`),
        t(e.structure === "variations" ? " ; son tableau de variations est donné ci-dessous. Sans calculer " : ". Sans calculer "),
        f(`I=${integraleLatex(e)}`),
        t(", encadre cette intégrale à l'aide du minimum et du maximum de f sur cet intervalle (valeurs exactes)."),
      ];
    case "moyenne":
      return [
        t("La fonction f est définie sur "),
        f(intervalle(e.a, e.b)),
        t(" par "),
        f(`f(x)=${e.fLatex}`),
        t(e.structure === "variations" ? " ; son tableau de variations est donné ci-dessous. " : ". "),
        t("Sans calculer d'intégrale, encadre la valeur moyenne "),
        f("\\mu"),
        t(" de f sur cet intervalle à l'aide du minimum et du maximum de f (valeurs exactes)."),
      ];
  }
}

/** Titres d'étapes du corrigé (« Étape n — … »), rédigés pour le papier. */
function titreEtape(e: ExerciceEncadrerIntegrales, phase: PhaseEncadrerIntegrales): FragmentConsigne[] {
  const [p, q] = bornesOrdonnees(e);
  const I = intervalle(p, q);
  switch (phase) {
    case "signeF":
      return [t("Établis le signe de f sur "), f(I), t(".")];
    case "signeOrdonne":
      return [t("Déduis-en le signe de "), f(integraleOrdonnee(e)), t(", dont les bornes sont dans l'ordre croissant.")];
    case "conclusionSigne":
      return [t("Conclus sur le signe de "), f("I"), t(".")];
    case "inegalite":
      return [t("Établis l'inégalité entre "), f("f(x)"), t(" et "), f("g(x)"), t(" sur "), f(I), t(", ou montre que "), f("f-g"), t(" y change de signe.")];
    case "conclusionComparaison":
      return [t("Applique la propriété de comparaison et conclus.")];
    case "m":
      return [t("Détermine le minimum "), f("m"), t(" de f sur "), f(I), t(".")];
    case "M":
      return [t("Détermine le maximum "), f("M"), t(" de f sur "), f(I), t(".")];
    case "mM":
      return [t("Détermine le minimum "), f("m"), t(" et le maximum "), f("M"), t(" de f sur "), f(I), t(".")];
    case "bornes":
      return [t("Déduis-en un encadrement de "), f("I"), t(".")];
    case "bornesIntegrale":
      return [t("Encadre l'intégrale "), f(integraleLatex(e)), t(".")];
    case "bornesMoyenne":
      return [t("Déduis-en un encadrement de la valeur moyenne "), f("\\mu"), t(".")];
  }
}

function reponseEtape(e: ExerciceEncadrerIntegrales, phase: PhaseEncadrerIntegrales): FragmentConsigne[] {
  if (estPhaseChoix(phase)) return optionCorrecteFragments(e, phase);
  return formatReponseAttendueLatex(e, phase).flatMap((x, i) => (i === 0 ? [f(x)] : [t(" ; "), f(x)]));
}

function construireEnonce(e: ExerciceEncadrerIntegrales): SectionExercice {
  const html = figureEnoncePapier(e);
  return { enteteFragments: entetePapier(e), ...(html ? { enteteHtml: html } : {}), questions: phasesExercice(e).map((phase) => ({ consigne: titreEtape(e, phase) })) };
}

function construireCorrection(e: ExerciceEncadrerIntegrales): BlocCorrection[] {
  return phasesExercice(e).map((phase) => ({ type: "paragraphe", fragments: [t(`${lettre(e, phase)}) `), ...reponseEtape(e, phase)] }));
}

function reponseBreve(e: ExerciceEncadrerIntegrales): FragmentConsigne[] {
  switch (e.variante) {
    case "signe":
      return [f(((e.signeF === "positif") !== e.inverse) ? "I\\ge 0" : "I\\le 0")];
    case "comparer":
      if (e.issue === "change") return [t("On ne peut pas conclure sans calcul : "), f("f-g"), t(" change de signe sur "), f(intervalle(e.p, e.q)), t(".")];
      return [f(e.issue === "fInfG" ? "I\\le J" : "I\\ge J")];
    case "encadrer":
      return [f(`${e.borneInf.latex}\\le I\\le ${e.borneSup.latex}`)];
    case "moyenne":
      return [f(`${e.m.latex}\\le\\mu\\le ${e.M.latex}`)];
  }
}

function enoncePapier(e: ExerciceEncadrerIntegrales): EnoncePapier {
  const html = figureEnoncePapier(e);
  return { section: { enteteFragments: entetePapier(e), ...(html ? { enteteHtml: html } : {}), questions: [] }, reponseBreve: reponseBreve(e) };
}

const correctionDetaillee = correctionDetailleeEncadrerIntegrales;

/** Critères du niveau de difficulté (grille commune, `export/niveauDifficulte.ts`) : méthode et
 * piège jugés par variante (analyse des cinq chapitres), étapes lues sur le corrigé détaillé. */
function criteresDifficulte(e: ExerciceEncadrerIntegrales): CriteresDifficulte {
  const r = e.variante === "signe" || e.variante === "comparer" ? 1 : 0;
  return { ...etapesDuCorrige(correctionDetaillee(e)), methode: r, piege: r };
}

// ============================================================================
// Barème (somme 4).
// ============================================================================

function bareme(e: ExerciceEncadrerIntegrales): BaremeExercice {
  const phases = phasesExercice(e);
  const r = (phase: PhaseEncadrerIntegrales) => reponseEtape(e, phase);
  let criteres: CritereBareme[] = [];
  let erreursFrequentes: ErreurFrequente[] = [];
  let reponsesAcceptees: FragmentConsigne[][] = [];
  switch (e.variante) {
    case "signe":
      criteres = e.inverse
        ? [
            { sousQuestion: "a", critere: [t("Signe de f sur l'intervalle, justifié : "), ...r("signeF")], points: 2 },
            { sousQuestion: "b", critere: [t("Positivité appliquée aux bornes rangées : "), ...r("signeOrdonne")], points: 1 },
            { sousQuestion: "c", critere: [t("Échange des bornes : "), ...r("conclusionSigne")], points: 1 },
          ]
        : [
            { sousQuestion: "a", critere: [t("Signe de f sur l'intervalle, justifié : "), ...r("signeF")], points: 2.5 },
            { sousQuestion: "b", critere: [t("Positivité de l'intégrale : "), ...r("conclusionSigne")], points: 1.5 },
          ];
      erreursFrequentes = [
        { description: [t("Signe de f affirmé sans justification (lu sur un seul point, ou deviné)")], cout: "−1" },
        ...(e.inverse ? [{ description: [t("Bornes échangées ignorées : signe de f donné comme signe de "), f("I")], cout: `0 pt sur ${LETTRES[phases.length - 1]})` }] : []),
      ];
      reponsesAcceptees = [[t("Justification par une étude de signe, une factorisation, le cercle trigonométrique ou un argument de croissance équivalent")]];
      break;
    case "comparer":
      criteres = [
        { sousQuestion: "a", critere: [t("Inégalité (ou changement de signe) entre f et g sur l'intervalle, justifiée : "), ...r("inegalite")], points: 2.5 },
        { sousQuestion: "b", critere: [t("Conclusion par la propriété de comparaison : "), ...r("conclusionComparaison")], points: 1.5 },
      ];
      erreursFrequentes = [
        { description: [t("Inégalité tirée d'une seule valeur de x, sans étude sur tout l'intervalle")], cout: "0 pt sur a)" },
        { description: [t("Conclusion « I ≤ J » ou « I ≥ J » alors que f − g change de signe")], cout: "0 pt sur b)" },
      ];
      reponsesAcceptees = [[t("Étude du signe de f − g par factorisation, tableau de signes ou étude de fonction")], [t("Lecture graphique seule : la moitié des points de a)")]];
      break;
    case "encadrer":
      criteres = [
        { sousQuestion: "a", critere: [t("Minimum : "), ...r("m")], points: 1 },
        { sousQuestion: "b", critere: [t("Maximum : "), ...r("M")], points: 1 },
        { sousQuestion: "c", critere: [t("Encadrement de I : "), ...r("bornes")], points: 2 },
      ];
      erreursFrequentes = [
        { description: [t("Minimum et maximum inversés (sens de variation non étudié)")], cout: "−1" },
        { description: [t("Oubli du facteur "), f("b-a")], cout: "−1" },
      ];
      reponsesAcceptees = [[t("Valeurs exactes ou arrondies au centième")], [t("Tout encadrement plus fin correctement justifié")]];
      break;
    case "moyenne":
      criteres = [
        { sousQuestion: "a", critere: [t("Minimum et maximum : "), ...r("mM")], points: 1.5 },
        { sousQuestion: "b", critere: [t("Encadrement de l'intégrale : "), ...r("bornesIntegrale")], points: 1.5 },
        { sousQuestion: "c", critere: [t("Encadrement de la valeur moyenne : "), ...r("bornesMoyenne")], points: 1 },
      ];
      erreursFrequentes = [
        { description: [t("Encadrement de l'intégrale donné pour la valeur moyenne (pas de division par "), f("b-a"), t(")")], cout: "0 pt sur c)" },
        { description: [t("Minimum et maximum inversés")], cout: "−1" },
      ];
      reponsesAcceptees = [[t("Valeurs exactes ou arrondies au centième")], [t("Encadrement direct "), f("m\\le\\mu\\le M"), t(" justifié par le théorème de la moyenne")]];
      break;
  }
  return { reponseFinale: reponseBreve(e), criteres, erreursFrequentes, reponsesAcceptees };
}

export const adaptateurEvaluationEncadrerIntegrales: AdaptateurFeuilleExercices<ExerciceEncadrerIntegrales> = {
  titreDocument: "Comparer et encadrer des intégrales — Évaluation",
  nomFichierBase: "comparer-encadrer-integrales",
  genererInstance: genererExerciceEncadrerIntegrales,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteEncadrerIntegrales),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  profilInstance: profilEncadrerIntegrales,
};
