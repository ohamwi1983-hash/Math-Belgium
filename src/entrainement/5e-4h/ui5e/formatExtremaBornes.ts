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

/** Intervalle en texte (Unicode, sans LaTeX) — pour les chaînes rendues en texte brut. */
function intervalleTexte(exercice?: ExerciceExtremaBornes): string {
  return exercice ? `[0 ; ${exercice.T}]` : "[0 ; T]";
}

// ============================================================================
// Consigne générale + objectif persistant (`QuestionFinale`).
// ============================================================================

/** Version TEXTE (Unicode, sans `$`) — lue par l'adaptateur papier (`exportEvaluation.ts`). */
export function consigneGeneraleExtremaBornes(exercice: ExerciceExtremaBornes): string {
  const { grandeur, unite, variableDef, uniteTemps } = exercice.contexte;
  return `f(t) modélise ${grandeur} (en ${unite}), où t est ${variableDef} (en ${uniteTemps}). Le modèle n'est valable que sur l'intervalle ${intervalleTexte(exercice)}.`;
}

/** Version ÉCRAN — même phrase, formules en `$…$` (rendue par `TexteRiche5e`). */
export function consigneGeneraleExtremaBornesRiche(exercice: ExerciceExtremaBornes): string {
  const { grandeur, unite, variableDef, uniteTemps } = exercice.contexte;
  return `$f(t)$ modélise ${grandeur} (en ${unite}), où $t$ est ${variableDef} (en ${uniteTemps}). Le modèle n'est valable que sur l'intervalle $[0\\,;\\,${exercice.T}]$.`;
}

/** Texte brut (bandeau `QuestionFinale`) — l'intervalle réel quand l'exercice est connu. */
export function questionFinaleExtremaBornes(exercice?: ExerciceExtremaBornes): string {
  return `Objectif : déterminer le maximum absolu et le minimum absolu de f sur ${intervalleTexte(exercice)} — attention, ce n'est pas forcément un extremum local.`;
}

// ============================================================================
// Libellés/consignes par écran — consignes en `$…$` (rendues par `TexteRiche5e`).
// ============================================================================

export const LIBELLE_ECRAN_EXTREMA_BORNES: Record<EcranExtremaBornes, string> = {
  deriver: "Calculer f'(t)",
  racines: "Résoudre f'(t) = 0",
  tableauFPrime: "Tableau de signes de f'",
  valeursExtremums: "Valeur de f à chaque extremum local",
  valeursBornes: "Valeur de f aux deux bornes",
  comparaison: "Maximum et minimum absolus",
};

export function consigneEcranExtremaBornes(ecran: EcranExtremaBornes, exercice?: ExerciceExtremaBornes): string {
  const intervalle = exercice ? `$[0\\,;\\,${exercice.T}]$` : "$[0\\,;\\,T]$";
  switch (ecran) {
    case "deriver":
      return "Calcule $f'(t)$.";
    case "racines":
      return `Résous l'équation $f'(t)=0$ et donne ses solutions dans l'intervalle ${intervalle} (une par champ, dans l'ordre que tu veux).`;
    case "tableauFPrime":
      return `Complète le tableau de signes de $f'$ sur ${intervalle} et les variations de $f$ qui en découlent : chaque solution de $f'(t)=0$ est-elle un maximum local, un minimum local ou ni l'un ni l'autre ?`;
    case "valeursExtremums":
      return "Calcule la valeur de $f$ en chaque extremum local trouvé dans le tableau.";
    case "valeursBornes":
      return exercice ? `Calcule $f(0)$ et $f(${exercice.T})$, les valeurs de $f$ aux deux bornes de l'intervalle.` : "Calcule les valeurs de $f$ aux deux bornes de l'intervalle.";
    case "comparaison":
      return `Parmi toutes les valeurs ci-dessus (extremums locaux et bornes), laquelle est le maximum absolu de $f$ sur ${intervalle}, et laquelle est le minimum absolu ? Une seule tentative.`;
  }
}

// ============================================================================
// Aides — niveau 1 (technique/piège), niveau 2 (exemple concret). Texte en prose (formules en
// `$…$`, rendu `TexteRiche5e`) + formule display éventuelle (`latex`, rendue en bloc) : jamais de
// formule écrite au clavier.
// ============================================================================

export interface AideExtremaBornes {
  texte: string;
  latex: string | null;
}

export function texteAideNiveau1ExtremaBornes(ecran: EcranExtremaBornes, exercice?: ExerciceExtremaBornes): AideExtremaBornes {
  switch (ecran) {
    case "deriver":
      return { texte: "Dérive terme à terme :", latex: "\\left(a\\,t^{n}\\right)'=n\\,a\\,t^{n-1}" };
    case "racines": {
      const degreFPrime = exercice ? exercice.degre - 1 : 2;
      return degreFPrime === 2
        ? { texte: "$f'(t)$ est du second degré : calcule son discriminant, puis ses deux racines.", latex: "t=\\dfrac{-b\\pm\\sqrt{\\Delta}}{2a}" }
        : {
            texte: "$f'(t)$ est du troisième degré : mets d'abord le coefficient de $t^3$ en évidence, cherche une racine entière parmi les diviseurs du terme constant restant, puis factorise par la méthode de Horner.",
            latex: null,
          };
    }
    case "tableauFPrime":
      return {
        texte: "Choisis une valeur de $t$ dans chaque intervalle et calcule le signe de $f'$. Un passage de + à − donne un maximum local, de − à + un minimum local.",
        latex: null,
      };
    case "valeursExtremums":
      return { texte: "Remplace $t$ par l'abscisse de l'extremum dans $f(t)$, pas dans $f'(t)$ : la dérivée donne la pente, pas la valeur de la grandeur.", latex: null };
    case "valeursBornes":
      return { texte: "Les bornes de l'intervalle ne sont pas des solutions de $f'(t)=0$ : remplace quand même $t$ par chacune d'elles dans $f(t)$.", latex: null };
    case "comparaison":
      return {
        texte: `L'intervalle est fermé et borné : le maximum (ou le minimum) absolu peut être un extremum local, ou bien se trouver à une borne ($t=0$ ou $t=${exercice ? exercice.T : "T"}$). Compare toutes les valeurs avant de conclure.`,
        latex: null,
      };
  }
}

export function texteAideNiveau2ExtremaBornes(ecran: EcranExtremaBornes, exercice?: ExerciceExtremaBornes): AideExtremaBornes {
  switch (ecran) {
    case "deriver":
      return { texte: "Exemple :", latex: "f(t)=2t^3-6t^2+5 \\;\\Longrightarrow\\; f'(t)=6t^2-12t" };
    case "racines": {
      if (exercice && exercice.degre === 4) {
        const r1 = exercice.racinesFPrime[0];
        return { texte: `Une racine entière de $f'(t)$ est $t=${r1}$. Divise $f'(t)$ par $(t-${r1})$ avec la méthode de Horner, puis résous l'équation du second degré obtenue.`, latex: null };
      }
      return { texte: "Exemple :", latex: "6t^2-24t+18=0 \\iff t^2-4t+3=0,\\ \\Delta=4 \\;\\Longrightarrow\\; t=1 \\text{ ou } t=3" };
    }
    case "tableauFPrime":
      return { texte: "Exemple :", latex: "f'(t)=6t(t-2) : \\quad f'(1)=-6<0,\\ f'(3)=18>0 \\;\\Longrightarrow\\; \\text{minimum local en } t=2" };
    case "valeursExtremums":
      return { texte: "Exemple, pour $f(t)=2t^3-6t^2+5$ et un extremum en $t=2$ :", latex: "f(2)=2\\cdot2^3-6\\cdot2^2+5=16-24+5=-3" };
    case "valeursBornes":
      return { texte: "Exemple, pour le même $f$ sur $[0\\,;\\,5]$ :", latex: "f(0)=5 \\qquad f(5)=2\\cdot125-6\\cdot25+5=105" };
    case "comparaison":
      return {
        texte: "Exemple du piège : les extremums locaux valent 8 (maximum local) et 2 (minimum local), mais $f(T)=15$. Le maximum absolu est alors 15, atteint à la borne : 8 n'est qu'un maximum local.",
        latex: null,
      };
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

/** Exemples hors de l'espace des tirages (valeurs toujours entières ≥ 5 par construction) : une
 * valeur décimale négative ne peut jamais être une réponse. */
export function placeholdersChampsExtremums(): string[] {
  return ["ex : −2,5"];
}

export function labelsChampsBornes(exercice: ExerciceExtremaBornes): string[] {
  return [`f(0)=`, `f(${formatEntierLatex(exercice.T)})=`];
}

export function placeholdersChampsBornes(): string[] {
  return ["ex : −1,5"];
}

export function labelsChampsRacines(exercice: ExerciceExtremaBornes): string[] {
  return exercice.racinesFPrime.map((_, i) => `t_{${i + 1}}=`);
}

/** Racines toujours entières et positives par construction : un exemple décimal négatif ne peut
 * jamais être une solution. */
export function placeholdersChampsRacines(): string[] {
  return ["ex : −0,5"];
}

// ============================================================================
// Bloc "état actuel" — accumule les faits CONFIRMÉS des écrans déjà traversés pour CET exercice
// (jamais dérivé de la saisie brute de l'élève, absent tant que rien n'est confirmé).
// ============================================================================

function formatClassificationTexte(c: "max" | "min"): string {
  return c === "max" ? "maximum local" : "minimum local";
}

function formatRacinesLatex(exercice: ExerciceExtremaBornes): string[] {
  return [`f'(t)=0 \\iff ${exercice.racinesFPrime.map((t) => `t=${formatEntierLatex(t)}`).join(" \\text{ ou } ")}`];
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
      case "racines":
        termes.push(...formatRacinesLatex(exercice));
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
    case "racines":
      return formatRacinesLatex(exercice);
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
