import type { ExerciceCalculPrimitives } from "../../core6e/calculPrimitives.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { aideNiveau1, blocDonnees, consigneEcran, formatReponseAttenduePhaseLatex, integrandeLatex, primitiveLatex } from "../../ui6e/formatCalculPrimitives";
import { phasesPourExercice } from "../../moteur6e/typesCalculPrimitives";
import type { PhaseCalculPrimitives } from "../../moteur6e/typesCalculPrimitives";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceCalculPrimitives } from "./index";
import type { IdVarianteCalculPrimitives } from "./index";
import { LIBELLE_CAS_CALCUL_PRIMITIVES, profilCalculPrimitives } from "./profilEvaluation";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceCalculPrimitives>` pour `6gen23` (Calcul de
 * primitives) — feuille d'exercices et évaluation, méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - `construireEnonce` : une question par écran du générateur interactif (= une ÉTAPE, lettre a, b…
 *   dans l'ordre des écrans) ; ses consignes deviennent les titres « Étape n — … » du corrigé.
 * - `enoncePapier` : « Calcule une primitive F de f » + la méthode imposée par la famille
 *   (changement de variable, intégration par parties, identité trigonométrique, éléments simples) —
 *   aucune sous-question : les étapes d'écran passent au corrigé.
 * - Résultats : `formatReponseAttenduePhaseLatex` (ceux de l'appli : la vraie valeur de chaque
 *   étape), jamais recalculés à part ; les lignes « Méthode » reprennent l'aide de niveau 1 de
 *   l'écran.
 *
 * Les fonctions `*Primitive` exportées servent aussi aux adaptateurs de 6gen24 et 6gen25, dont les
 * premiers écrans sont ceux de 6gen23 (même chaîne d'écrans, mêmes textes).
 */

const LETTRES = "abcdefghij";
const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);

// ============================================================================
// Pièces partagées (6gen23, 6gen24, 6gen25).
// ============================================================================

/** Méthode imposée par la famille, à la suite de « Calcule une primitive F de f… ». Vide quand la
 * méthode fait partie de ce qu'on évalue (primitive directe, composée, simplification de D5). */
export function methodePapierPrimitive(e: ExerciceCalculPrimitives): string {
  switch (e.famille) {
    case "C":
      return " à l'aide d'un changement de variable";
    case "D":
      if (e.sousType === "5") return "";
      return e.sousType === "2" || e.sousType === "4" ? " à l'aide d'intégrations par parties successives" : " à l'aide d'une intégration par parties";
    case "E":
      return " à l'aide d'une substitution trigonométrique";
    case "F":
      return " à l'aide d'une identité trigonométrique";
    case "G":
      return " en décomposant f en éléments simples";
    default:
      return "";
  }
}

/** Définition de f telle qu'imprimée (« f(x) = … », avec sa restriction éventuelle). */
export function definitionFPrimitive(e: ExerciceCalculPrimitives): string {
  return blocDonnees(e)[0];
}

/** Titre d'étape (consigne d'écran) relu pour le papier : l'écran D5 posait une question-piège
 * (« est-ce vraiment nécessaire ici ? ») qui n'a de sens qu'à l'écran. */
export function titreEtapePrimitive(e: ExerciceCalculPrimitives, phase: PhaseCalculPrimitives): FragmentConsigne[] {
  if (phase === "dEcranDirect") {
    return [t("Regroupe les facteurs exponentiels en une seule puissance, puis calcule directement une primitive (aucune intégration par parties n'est nécessaire).")];
  }
  return consigneEcran(e, phase);
}

/** Aide de niveau 1 de l'écran, en fragments (texte terminé par « : », formule en LaTeX). */
export function methodeEtapePrimitive(e: ExerciceCalculPrimitives, phase: PhaseCalculPrimitives): FragmentConsigne[] {
  const aide = aideNiveau1(e, phase);
  if (!aide.texte && !aide.latex) return [];
  return aide.latex ? [t(`${aide.texte.trim()} `), f(aide.latex)] : [t(aide.texte.trim())];
}

/** Résultat d'une étape (vraie valeur, plusieurs valeurs séparées). */
export function reponseEtapePrimitive(e: ExerciceCalculPrimitives, phase: PhaseCalculPrimitives): FragmentConsigne[] {
  return [f(formatReponseAttenduePhaseLatex(e, phase).join(",\\quad "))];
}

/** Piège ciblé de l'instance (une ligne « Piège » du corrigé, et une erreur fréquente du barème). */
export function piegePrimitive(e: ExerciceCalculPrimitives): string {
  switch (e.famille) {
    case "A":
      if (e.sousType === "direct") {
        return e.termes.some((x) => x.type === "invX")
          ? "Oublier la valeur absolue : une primitive de 1/x est ln|x|, car 1/x est aussi définie pour x < 0."
          : "Oublier de diviser par l'exposant augmenté de 1, ou se tromper de signe sur une primitive usuelle.";
      }
      return e.sousType === "diviserFraction"
        ? "Primitiver séparément le numérateur et le dénominateur : il faut d'abord diviser chaque terme."
        : "Multiplier les exposants au lieu de les additionner : x·√x = x^(1 + 1/2).";
    case "B":
      return "Oublier le facteur λ, ou diviser par u′(x) au lieu d'ajuster le coefficient.";
    case "C":
      return "Laisser des x dans l'intégrale en u (dx aussi doit être remplacé), ou oublier de revenir à x.";
    case "D":
      if (e.sousType === "5") return "Se lancer dans une intégration par parties : le produit de deux exponentielles est une seule exponentielle.";
      if (e.sousType === "2") return "S'arrêter après la première intégration par parties : l'intégrale restante en demande une seconde.";
      if (e.sousType === "4") return "Faire la seconde intégration par parties en inversant les rôles : on retombe sur une identité sans intérêt.";
      return "Choisir u et dv à l'envers : l'intégrale restante devient plus compliquée au lieu de se simplifier.";
    case "E":
      return "Oublier de remplacer dx (le facteur de dθ), ou revenir à x sans le triangle rectangle de référence.";
    case "F":
      if (e.sousType === "tan") return "Oublier le signe moins : une primitive de tan(x) est −ln|cos(x)|.";
      if (e.sousType === "angleDoubleSin" || e.sousType === "angleDoubleCos") return "Se tromper de signe dans la formule de duplication : sin²(x) = (1 − cos(2x))/2 et cos²(x) = (1 + cos(2x))/2.";
      return "Primitiver une puissance de sin ou de cos sans la réécrire : seule la forme u′·g(u) se primitive directement.";
    case "G":
      return "Oublier la valeur absolue dans les logarithmes, ou identifier les coefficients sans vérifier la décomposition.";
  }
}

/** Difficulté propre au calcul de la primitive. */
export function difficultePrimitive(e: ExerciceCalculPrimitives): 1 | 2 | 3 {
  switch (e.famille) {
    case "A":
      return e.sousType === "direct" ? 1 : 2;
    case "B":
      return 2;
    case "C":
      return e.sousType === "1" || e.sousType === "3" ? 3 : 2;
    case "D":
      return e.sousType === "2" || e.sousType === "4" ? 3 : 2;
    case "E":
    case "G":
      return 3;
    case "F":
      return 2;
  }
}

/** Lignes du corrigé d'une étape de calcul de primitive : Méthode (aide de niveau 1 de l'écran),
 * Conclusion (vraie valeur de l'étape) ; sur la dernière étape, Vérification par dérivation et
 * Piège ciblé. */
export function lignesEtapePrimitive(e: ExerciceCalculPrimitives, phase: PhaseCalculPrimitives, sousQuestion: string, derniere: boolean, avecPiege: boolean): EtapeCorrection[] {
  const lignes: EtapeCorrection[] = [];
  const methode = methodeEtapePrimitive(e, phase);
  if (methode.length > 0) lignes.push({ label: "Méthode", sousQuestion, fragments: methode });
  lignes.push({ label: derniere ? "Conclusion" : "Résultat", sousQuestion, fragments: reponseEtapePrimitive(e, phase) });
  if (derniere) {
    lignes.push({ label: "Vérification", sousQuestion, fragments: [t("En dérivant, on retrouve "), f(`f(x)=${integrandeLatex(e)}`), t(".")] });
    if (avecPiege) lignes.push({ label: "Piège", sousQuestion, fragments: [t(piegePrimitive(e))] });
  }
  return lignes;
}

/** Erreurs fréquentes communes à tout calcul de primitive. */
export function erreursFrequentesPrimitive(e: ExerciceCalculPrimitives): { texte: string; cout: string }[] {
  const liste = [{ texte: piegePrimitive(e), cout: "−1" }];
  if (/\\ln\\left\||\\ln\|/.test(primitiveLatex(e)) && !liste[0].texte.includes("valeur absolue")) {
    liste.push({ texte: "Oublier la valeur absolue dans un logarithme (ln|…|)", cout: "−0,5" });
  }
  liste.push({ texte: "Primitive juste à une erreur de signe ou de facteur près, non détectée faute d'avoir dérivé le résultat", cout: "−1" });
  return liste;
}

/** Poids des étapes d'un calcul de primitive, total `total` : l'étape finale pèse le plus. */
export function poidsEtapesPrimitive(n: number, total: number): number[] {
  if (n <= 1) return [total];
  const finale = total / 2;
  return Array.from({ length: n }, (_, i) => (i === n - 1 ? finale : (total - finale) / (n - 1)));
}

// ============================================================================
// 6gen23.
// ============================================================================

function entetePapier(e: ExerciceCalculPrimitives): FragmentConsigne[] {
  return [t("Calcule une primitive F de la fonction f définie par "), f(definitionFPrimitive(e)), t(`${methodePapierPrimitive(e)}.`)];
}

function construireEnonce(e: ExerciceCalculPrimitives): SectionExercice {
  return { enteteFragments: entetePapier(e), questions: phasesPourExercice(e).map((phase) => ({ consigne: titreEtapePrimitive(e, phase) })) };
}

/** Corrigé historique (pipelines Word/PDF sans corrigé détaillé) : le résultat de chaque étape. */
function construireCorrection(e: ExerciceCalculPrimitives): BlocCorrection[] {
  return phasesPourExercice(e).map((phase, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponseEtapePrimitive(e, phase)] }));
}

function enoncePapier(e: ExerciceCalculPrimitives): EnoncePapier {
  const phases = phasesPourExercice(e);
  return { section: { enteteFragments: entetePapier(e), questions: [] }, reponseBreve: reponseEtapePrimitive(e, phases[phases.length - 1]) };
}

function correctionDetaillee(e: ExerciceCalculPrimitives): EtapeCorrection[] {
  const phases = phasesPourExercice(e);
  return phases.flatMap((phase, i) => lignesEtapePrimitive(e, phase, LETTRES[i], i === phases.length - 1, true));
}

function reponseBreve(e: ExerciceCalculPrimitives): FragmentConsigne[] {
  const phases = phasesPourExercice(e);
  return reponseEtapePrimitive(e, phases[phases.length - 1]);
}

function bareme(e: ExerciceCalculPrimitives): BaremeExercice {
  const phases = phasesPourExercice(e);
  const poids = poidsEtapesPrimitive(phases.length, 4);
  return {
    reponseFinale: reponseBreve(e),
    criteres: phases.map((phase, i) => ({ sousQuestion: LETTRES[i], critere: reponseEtapePrimitive(e, phase), points: poids[i] })),
    erreursFrequentes: [...erreursFrequentesPrimitive(e), { texte: "Constante d'intégration absente de la primitive générale", cout: "−0,5" }].map((x) => ({ description: [t(x.texte)], cout: x.cout })),
    reponsesAcceptees: [
      [t("Toute primitive qui ne diffère de celle-ci que par une constante")],
      [t("Toute écriture équivalente (développée, factorisée, logarithmes regroupés)")],
    ],
  };
}

export const adaptateurEvaluationCalculPrimitives: AdaptateurFeuilleExercices<ExerciceCalculPrimitives> = {
  titreDocument: "Calcul de primitives — Évaluation",
  nomFichierBase: "calcul-primitives",
  genererInstance: genererExerciceCalculPrimitives,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteCalculPrimitives),
  construireEnonce,
  construireCorrection,
  difficulte: difficultePrimitive,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 8,
  profilInstance: profilCalculPrimitives,
  libelleCasParticulier: LIBELLE_CAS_CALCUL_PRIMITIVES,
};
