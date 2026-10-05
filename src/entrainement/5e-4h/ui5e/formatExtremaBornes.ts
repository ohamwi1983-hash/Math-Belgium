/**
 * Couche présentation (5e) — consignes/labels/aides/LaTeX pour 5gen34 ("Extrema en contexte
 * borné"). Dépend librement des couches inférieures (jamais l'inverse) : réutilise
 * `evalPoly`/`derivativeCoeffs` (`generateurs5e/extremaBornes/index.ts`) — même patron que
 * `formatEtudeLocale.ts` (5gen29).
 */
import type { CandidatComparaisonBorne } from "../moteur5e/verificationExtremaBornes";
import type { ExerciceExtremaBornes } from "../core5e/extremaBornes.types";
import { derivativeCoeffs, evalPoly } from "../generateurs5e/extremaBornes/index";
import type { EcranExtremaBornes } from "../moteur5e/typesExtremaBornes";
import { ORDRE_ECRANS_EXTREMA_BORNES } from "../moteur5e/typesExtremaBornes";

// ============================================================================
// Fragments LaTeX de bas niveau.
// ============================================================================

/** Polynôme à partir de coefficients ASCENDANTS [constante, t, t², ...], variable "t" (jamais "x"
 * — ce générateur modélise une grandeur en fonction du TEMPS, jamais une variable abstraite). */
function formatPolynomeTLatex(coeffs: number[]): string {
  let out = "";
  let premier = true;
  for (let d = coeffs.length - 1; d >= 0; d--) {
    const coeff = coeffs[d];
    if (coeff === 0) continue;
    const abs = Math.abs(coeff);
    const signe = coeff < 0 ? "-" : premier ? "" : "+";
    const variable = d === 0 ? "" : d === 1 ? "t" : `t^{${d}}`;
    const coeffAffiche = abs === 1 && d !== 0 ? "" : `${abs}`;
    out += `${signe}${coeffAffiche}${variable}`;
    premier = false;
  }
  return out === "" ? "0" : out;
}

export function formatFDeTLatex(exercice: ExerciceExtremaBornes): string {
  return `f(t)=${formatPolynomeTLatex(exercice.coeffs)}`;
}

export function formatFPrimeDeTLatex(exercice: ExerciceExtremaBornes): string {
  return `f'(t)=${formatPolynomeTLatex(derivativeCoeffs(exercice.coeffs))}`;
}

export function formatDomaineLatex(exercice: ExerciceExtremaBornes): string {
  return `t\\in[0\\,;\\,${exercice.T}]`;
}

// ============================================================================
// Consigne générale + objectif persistant (`QuestionFinale`).
// ============================================================================

export function consigneGeneraleExtremaBornes(exercice: ExerciceExtremaBornes): string {
  const { grandeur, unite, variableDef, uniteTemps } = exercice.contexte;
  return `f(t) modélise ${grandeur} (en ${unite}), où t est ${variableDef} (en ${uniteTemps}) — valable UNIQUEMENT sur t∈[0;${exercice.T}].`;
}

export function questionFinaleExtremaBornes(): string {
  return "Objectif : déterminer le MAXIMUM absolu ET le MINIMUM absolu de f sur [0;T] — attention, ce n'est pas forcément un extremum local !";
}

// ============================================================================
// Libellés/consignes par écran.
// ============================================================================

export const LIBELLE_ECRAN_EXTREMA_BORNES: Record<EcranExtremaBornes, string> = {
  deriver: "Calculer f'(t)",
  tableauFPrime: "Résoudre f'(t)=0 et tableau de signes",
  valeursExtremums: "Valeur de f à chaque extremum local",
  valeursBornes: "Valeur de f aux 2 bornes",
  comparaison: "Maximum et minimum absolus",
};

export function consigneEcranExtremaBornes(ecran: EcranExtremaBornes): string {
  switch (ecran) {
    case "deriver":
      return "Calcule f'(t).";
    case "tableauFPrime":
      return "f'(t)=0 admet les racines indiquées en en-tête du tableau (vérifie-le en résolvant f'(t)=0 au brouillon) — complète le tableau de signes de f' et les variations de f qui en découlent, pour identifier chaque extremum local (MAX ou min).";
    case "valeursExtremums":
      return "Pour CHAQUE extremum local trouvé au tableau précédent, calcule f(t).";
    case "valeursBornes":
      return "Calcule f(0) et f(T) — les 2 valeurs de f AUX BORNES du domaine.";
    case "comparaison":
      return "Parmi TOUTES les valeurs ci-dessus (extrema locaux ET bornes), identifie laquelle est le MAXIMUM absolu de f sur [0;T], et laquelle est le MINIMUM absolu.";
  }
}

// ============================================================================
// Aides — niveau 1 (technique/piège), niveau 2 (exemple concret).
// ============================================================================

export function texteAideNiveau1ExtremaBornes(ecran: EcranExtremaBornes): string {
  switch (ecran) {
    case "deriver":
      return "Dérive terme à terme : la dérivée de a·tⁿ est n·a·tⁿ⁻¹.";
    case "tableauFPrime":
      return "f'(t)=0 se résout comme d'habitude (facteur commun, ou identification aux racines). Vérifie ensuite le signe de f' juste avant et juste après chaque racine — c'est ce changement de signe qui détermine MAX ou min.";
    case "valeursExtremums":
      return "Substitue l'abscisse directement dans f(t) — jamais dans f'(t), qui ne donne que la pente, pas la hauteur.";
    case "valeursBornes":
      return "t=0 et t=T sont les 2 extrémités du domaine — substitue-les directement dans f(t), même si ce ne sont pas des racines de f'.";
    case "comparaison":
      return "PIÈGE CENTRAL : le domaine [0;T] est FERMÉ ET BORNÉ. Le maximum (ou le minimum) absolu de f n'est PAS forcément un extremum local — il peut très bien se trouver à une des 2 bornes (t=0 ou t=T). Compare TOUTES les valeurs (extrema locaux + f(0) + f(T)) avant de conclure, jamais seulement le premier extremum trouvé au tableau.";
  }
}

export function texteAideNiveau2ExtremaBornes(ecran: EcranExtremaBornes): string {
  switch (ecran) {
    case "deriver":
      return "Exemple : f(t)=2t³-6t²+5 ⟹ f'(t)=6t²-12t.";
    case "tableauFPrime":
      return "Exemple : f'(t)=6t(t-2)=0 ⟹ t=0 ou t=2 (ne retiens que celles strictement entre 0 et T). f' passe de - à + en une racine ⟹ minimum ; de + à - ⟹ maximum.";
    case "valeursExtremums":
      return "Exemple : pour f(t)=2t³-6t²+5 et t=2 (trouvé au tableau), f(2)=2·2³-6·2²+5=16-24+5=-3.";
    case "valeursBornes":
      return "Exemple : pour le même f, sur [0;5] : f(0)=2·0-6·0+5=5 et f(5)=2·125-6·25+5=255-150+5=110.";
    case "comparaison":
      return "Exemple CONCRET du piège : un exercice donne 1 seul extremum local, un MAXIMUM valant 8 (en t=3). Beaucoup d'élèves répondent alors directement '8 est le maximum absolu' sans vérifier les bornes — mais si f(T)=15 à la borne T, c'est 15 qui est le VRAI maximum absolu, pas 8 : 8 n'est qu'un maximum LOCAL, dépassé par la valeur à la borne.";
  }
}

// ============================================================================
// Labels/placeholders des champs numériques.
// ============================================================================

function formatEntierLatex(v: number): string {
  return `${v}`;
}

export function labelsChampsExtremums(exercice: ExerciceExtremaBornes): string[] {
  return exercice.racinesFPrime.map((t) => `f(${formatEntierLatex(t)})=`);
}

export function placeholdersChampsExtremums(): string[] {
  return ["ex : 12"];
}

export function labelsChampsBornes(exercice: ExerciceExtremaBornes): string[] {
  return [`f(0)=`, `f(${formatEntierLatex(exercice.T)})=`];
}

export function placeholdersChampsBornes(): string[] {
  return ["ex : 5"];
}

// ============================================================================
// Bloc "état actuel" — accumule les faits CONFIRMÉS des écrans déjà traversés pour CET exercice
// (jamais dérivé de la saisie brute de l'élève, absent tant que rien n'est confirmé).
// ============================================================================

function formatClassificationTexte(c: "max" | "min"): string {
  return c === "max" ? "MAX" : "min";
}

function formatRacinesAvecClassificationLatex(exercice: ExerciceExtremaBornes): string[] {
  return exercice.racinesFPrime.map((t, i) => `t=${formatEntierLatex(t)} \\Rightarrow \\text{${formatClassificationTexte(exercice.classificationFPrime[i])}}`);
}

function formatValeursExtremumsLatex(exercice: ExerciceExtremaBornes): string[] {
  return exercice.racinesFPrime.map((t) => `f(${formatEntierLatex(t)})=${evalPoly(exercice.coeffs, t)}`);
}

function formatValeursBornesLatex(exercice: ExerciceExtremaBornes): string[] {
  return [`f(0)=${evalPoly(exercice.coeffs, 0)}`, `f(${exercice.T})=${evalPoly(exercice.coeffs, exercice.T)}`];
}

export function formatTermesEtatActuelLatex(exercice: ExerciceExtremaBornes, phase: EcranExtremaBornes): string[] | null {
  const index = ORDRE_ECRANS_EXTREMA_BORNES.indexOf(phase);
  if (index <= 0) return null;

  const termes: string[] = [];
  for (let i = 0; i < index; i++) {
    switch (ORDRE_ECRANS_EXTREMA_BORNES[i]) {
      case "deriver":
        termes.push(formatFPrimeDeTLatex(exercice));
        break;
      case "tableauFPrime":
        termes.push(...formatRacinesAvecClassificationLatex(exercice));
        break;
      case "valeursExtremums":
        termes.push(...formatValeursExtremumsLatex(exercice));
        break;
      case "valeursBornes":
        termes.push(...formatValeursBornesLatex(exercice));
        break;
      case "comparaison":
        break; // dernier écran — rien à accumuler après lui dans ce générateur
    }
  }
  return termes.length === 0 ? null : termes;
}

// ============================================================================
// Récapitulatif final — réponse ATTENDUE, par écran.
// ============================================================================

export function formatReponseAttenduePhaseLatex(exercice: ExerciceExtremaBornes, ecran: EcranExtremaBornes, candidatMax: CandidatComparaisonBorne, candidatMin: CandidatComparaisonBorne): string[] {
  switch (ecran) {
    case "deriver":
      return [formatFPrimeDeTLatex(exercice)];
    case "tableauFPrime":
      return formatRacinesAvecClassificationLatex(exercice);
    case "valeursExtremums":
      return formatValeursExtremumsLatex(exercice);
    case "valeursBornes":
      return formatValeursBornesLatex(exercice);
    case "comparaison":
      return [`\\text{Maximum absolu : } f(${candidatMax.t})=${candidatMax.valeur}`, `\\text{Minimum absolu : } f(${candidatMin.t})=${candidatMin.valeur}`];
  }
}

// ============================================================================
// Candidats de l'écran "comparaison" — libellé LaTeX pour chaque bouton de choix.
// ============================================================================

export function formatCandidatLatex(candidat: CandidatComparaisonBorne): string {
  return `f(${candidat.t})=${candidat.valeur}`;
}
