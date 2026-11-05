/**
 * Couche présentation (5e) — consignes/labels/formules pour 5gen8 ("Paramètres d'une fonction
 * sinusoïdale"). Notation du cours (section « Paramètres ») : f(x) = A·sin(ωx + φ) + b, pulsation ω,
 * période T = 2π/ω, fréquence f_req = 1/T, déphasage φ, décalage horizontal Φ = −φ/ω, décalage
 * vertical b. En interne, `exercice.B` = ω, `exercice.C` = φ, `exercice.phi` = Φ (noms historiques) —
 * jamais montrés sous ces noms à l'élève.
 */
import type { AmplitudeSinusoide, ExerciceParametresSinusoide, RationnelPi } from "../core5e/parametresSinusoide.types";
import { ORDRE_PHASES_SINUSOIDE, type PhaseParametresSinusoide } from "../moteur5e/typesParametresSinusoide";
import { inverseRationnelPi, reduireRationnelPi } from "../generateurs5e/parametresSinusoide/rationnelPi";

function formatMagnitudeRationnelleLatex(numerateur: number, denominateur: number): string {
  return denominateur === 1 ? `${numerateur}` : `\\dfrac{${numerateur}}{${denominateur}}`;
}

/** Rend un `RationnelPi` (degré -1/0/1) en LaTeX, toujours réduit, jamais de notation décimale. */
export function formatRationnelPiLatex(valeur: RationnelPi): string {
  const v = reduireRationnelPi(valeur);
  if (v.numerateur === 0) return "0";
  const signe = v.numerateur < 0 ? "-" : "";
  const n = Math.abs(v.numerateur);
  const d = v.denominateur;
  if (v.degrePi === 0) return `${signe}${formatMagnitudeRationnelleLatex(n, d)}`;
  if (v.degrePi === 1) {
    const piNum = n === 1 ? "\\pi" : `${n}\\pi`;
    return d === 1 ? `${signe}${piNum}` : `${signe}\\dfrac{${piNum}}{${d}}`;
  }
  // degrePi === -1 : π au dénominateur.
  const denomAvecPi = d === 1 ? "\\pi" : `${d}\\pi`;
  return `${signe}\\dfrac{${n}}{${denomAvecPi}}`;
}

/** Magnitude seule (toujours positive), pour l'affichage de l'amplitude à l'intérieur de la
 * formule — jamais le signe, porté séparément par `formatSigneAmplitudeLatex`. */
function formatMagnitudeAmplitudeLatex(A: AmplitudeSinusoide): string {
  if (A.radicande !== null) return `\\sqrt{${A.radicande}}`;
  const r = A.rationnelle!;
  return formatMagnitudeRationnelleLatex(r.numerateur, r.denominateur);
}

/** Une racine (jamais 1 par construction — voir RADICANDES_SANS_FACTEUR_CARRE, tous >1) n'est
 * jamais unitaire ; testé AVANT de toucher à `rationnelle`, qui vaut `null` dans ce cas. */
function estMagnitudeUnitaire(A: AmplitudeSinusoide): boolean {
  if (A.radicande !== null) return false;
  return A.rationnelle!.numerateur === A.rationnelle!.denominateur;
}

/** Coefficient A tel qu'affiché DEVANT le sin(...) dans la formule développée — omet le "1"
 * littéral quand |A|=1 (convention "jamais de coefficient ±1 littéral" déjà établie sur la
 * plateforme, 4e), garde toujours le signe réel de A (jamais |A|, qui n'est demandé qu'à l'écran 1). */
export function formatCoefficientAmplitudeLatex(A: AmplitudeSinusoide): string {
  const signe = A.signe === -1 ? "-" : "";
  if (estMagnitudeUnitaire(A)) return signe;
  return `${signe}${formatMagnitudeAmplitudeLatex(A)}`;
}

/** |A| — la vraie cible de l'écran 1, toujours positive. */
export function formatAmplitudeAbsolueLatex(A: AmplitudeSinusoide): string {
  return formatMagnitudeAmplitudeLatex(A);
}

/** La valeur SIGNÉE complète de A (jamais le "1" omis, contrairement au coefficient affiché dans la
 * formule) — utilisée uniquement pour l'aide niveau 2 de l'écran "amplitude", à l'intérieur des
 * barres de valeur absolue (`|A|=|...|`), où omettre le "1" produirait "||" illisible. */
function formatValeurAmplitudeLatex(A: AmplitudeSinusoide): string {
  return `${A.signe === -1 ? "-" : ""}${formatMagnitudeAmplitudeLatex(A)}`;
}

/** Le décalage vertical, joint à une somme avec le signe correct (jamais de double signe). */
function formatTermeDecalageLatex(b: number): string {
  if (b === 0) return "";
  return b > 0 ? `+${b}` : `${b}`;
}

/** Coefficient de x dans "Bx" — omet le "1" littéral (même convention que l'amplitude). */
function formatCoefficientBLatex(B: RationnelPi): string {
  const r = reduireRationnelPi(B);
  if (r.degrePi === 0 && r.numerateur === r.denominateur) return ""; // B=1
  return formatRationnelPiLatex(B);
}

/** `\cdot` requis UNIQUEMENT quand le coefficient se termine par une commande LaTeX non fermée par
 * une accolade (ex. "\pi", "2\pi", jamais "\dfrac{...}{...}" qui se termine par "}") ET que le
 * caractère suivant est une lettre nue (ex. "x") — jamais devant une parenthèse/accolade/chiffre,
 * qui termine déjà le nom de la commande sans ambiguïté. Sans cette distinction, "\pi"+"x" concatène
 * en "\pix", une commande LaTeX invalide (KaTeX consomme goulûment les lettres suivant un backslash) —
 * mais "\pi"+"(" est déjà parfaitement valide, aucun `\cdot` requis dans ce cas. */
function coefficientNecessiteCdotAvantLettre(coeff: string): boolean {
  return /\\pi$/.test(coeff);
}

/** Terme "+C"/"-C" à l'intérieur du sin(...), jamais affiché si C=0. */
function formatTermeCLatex(C: RationnelPi): string {
  const r = reduireRationnelPi(C);
  if (r.numerateur === 0) return "";
  const latex = formatRationnelPiLatex(r);
  return latex.startsWith("-") ? latex : `+${latex}`;
}

/** f(x) = A·sin(Bx+C) + b — forme développée. */
export function formatFormuleDeveloppeeLatex(exercice: ExerciceParametresSinusoide): string {
  const coeffA = formatCoefficientAmplitudeLatex(exercice.A);
  const coeffB = formatCoefficientBLatex(exercice.B);
  const termeC = formatTermeCLatex(exercice.C);
  const termeB = coeffB === "-" ? "-x" : coefficientNecessiteCdotAvantLettre(coeffB) ? `${coeffB}\\cdot x` : `${coeffB}x`;
  return `f(x) = ${coeffA}\\sin(${termeB}${termeC})${formatTermeDecalageLatex(exercice.b)}`;
}

/** f(x) = A·sin(B(x-φ)) + b — forme pré-factorisée, φ lisible directement, coefficient B (=2π/T)
 * simplifié au maximum plutôt qu'affiché littéralement "2π/T" (ex. T=4π -> B=1/2, T=2π -> B=1
 * (coefficient omis), T=2 -> B=π — jamais un "2π/2π" non réduit). Jamais de `\cdot` requis ici : le
 * coefficient est toujours immédiatement suivi d'une parenthèse, jamais d'une lettre nue, donc jamais
 * à risque de "\pix" (voir `coefficientNecessiteCdotAvantLettre`, utile uniquement en forme
 * développée où B précède directement "x"). */
export function formatFormulePrefactoriseeLatex(exercice: ExerciceParametresSinusoide): string {
  const coeffA = formatCoefficientAmplitudeLatex(exercice.A);
  const coeffB = formatCoefficientBLatex(exercice.B);
  return `f(x) = ${coeffA}\\sin\\!\\left(${argumentPrefactorise(coeffB, termeXPrefactorise(exercice))}\\right)${formatTermeDecalageLatex(exercice.b)}`;
}

/** « x − Φ » (ou « x » seul si Φ = 0). */
function termeXPrefactorise(exercice: ExerciceParametresSinusoide): string {
  const phi = reduireRationnelPi(exercice.phi);
  return phi.numerateur === 0 ? "x" : phi.numerateur > 0 ? `x-${formatRationnelPiLatex(phi)}` : `x+${formatRationnelPiLatex(negatifPourAffichage(phi))}`;
}

/** ω(x − Φ) — sans parenthèses quand Φ = 0 (jamais « \\dfrac{\\pi}{6}(x) »). */
function argumentPrefactorise(coeffB: string, termeX: string): string {
  if (termeX === "x") {
    if (coeffB === "" || coeffB === "-") return `${coeffB}x`;
    return coefficientNecessiteCdotAvantLettre(coeffB) ? `${coeffB}\\cdot x` : `${coeffB}x`;
  }
  return coeffB === "" ? termeX : coeffB === "-" ? `-(${termeX})` : `${coeffB}(${termeX})`;
}

function negatifPourAffichage(v: RationnelPi): RationnelPi {
  return { numerateur: -v.numerateur, denominateur: v.denominateur, degrePi: v.degrePi };
}

export function formatFormuleLatex(exercice: ExerciceParametresSinusoide): string {
  return exercice.forme === "developpee" ? formatFormuleDeveloppeeLatex(exercice) : formatFormulePrefactoriseeLatex(exercice);
}

// ============================================================================
// Bloc "état actuel" / récapitulatif final — fragments "label = valeur", TOUJOURS dérivés de
// `exercice` (jamais de la saisie de l'élève), même convention "état actuel" que le reste de la
// plateforme (voir CLAUDE.md, section 5gen1).
// ============================================================================

/** f = 1/T, calculé EXACTEMENT (jamais un flottant approché) — réutilise `inverseRationnelPi`
 * (Couche A, `rationnelPi.ts`, déjà partagée entre 5gen8 et 5gen9). */
export function formatFrequenceLatex(exercice: ExerciceParametresSinusoide): string {
  return formatRationnelPiLatex(inverseRationnelPi(exercice.T));
}

/** Fragment "label = valeur" pour UN paramètre déjà résolu — |A| (jamais le coefficient signé
 * affiché dans la formule), ω, T, f_req, φ, Φ, b. Réutilisé par le récapitulatif, la réponse
 * révélée et l'export. */
export function formatChampParametreLatex(exercice: ExerciceParametresSinusoide, champ: PhaseParametresSinusoide): string {
  switch (champ) {
    case "amplitude":
      return `|A| = ${formatAmplitudeAbsolueLatex(exercice.A)}`;
    case "pulsation":
      return `\\omega = ${formatRationnelPiLatex(exercice.B)}`;
    case "periode":
      return `T = ${formatRationnelPiLatex(exercice.T)}`;
    case "frequence":
      return `f_{req} = ${formatFrequenceLatex(exercice)}`;
    case "dephasage":
      return `\\varphi = ${formatRationnelPiLatex(exercice.C)}`;
    case "phi":
      return `\\Phi = ${formatRationnelPiLatex(exercice.phi)}`;
    case "decalage":
      return `b = ${exercice.b}`;
  }
}

/** "Bloc état actuel" — accumule les paramètres déjà CONFIRMÉS avant `phase` (ordre du cours) ;
 * vide pour le premier écran (amplitude), jamais affiché dans ce cas (voir le composant appelant). */
export function formatTermesEtatActuelParametresSinusoideLatex(exercice: ExerciceParametresSinusoide, phase: PhaseParametresSinusoide): string[] {
  const index = ORDRE_PHASES_SINUSOIDE.indexOf(phase);
  return ORDRE_PHASES_SINUSOIDE.slice(0, index).map((champ) => formatChampParametreLatex(exercice, champ));
}

// ============================================================================
// Consignes / labels
// ============================================================================

const CONSIGNE_GENERALE = "Détermine les paramètres de cette fonction sinusoïdale.";

const PRECISION = " (valeur exacte, ou arrondie au centième)";

const CONSIGNES: Record<PhaseParametresSinusoide, string> = {
  amplitude: `Quelle est l'amplitude de cette fonction ?${PRECISION}`,
  pulsation: `Quelle est la pulsation ω de cette fonction ?${PRECISION}`,
  periode: `Quelle est la période T de cette fonction ?${PRECISION}`,
  frequence: `Quelle est la fréquence de cette fonction ?${PRECISION}`,
  dephasage: `Quel est le déphasage φ de cette fonction ?${PRECISION}`,
  phi: `Quel est le décalage horizontal Φ de cette fonction ?${PRECISION}`,
  decalage: "Quel est le décalage vertical b de cette fonction ?",
};

export function consigneGenerale(): string {
  return CONSIGNE_GENERALE;
}

export function consignePhase(phase: PhaseParametresSinusoide): string {
  return CONSIGNES[phase];
}

const LABELS: Record<PhaseParametresSinusoide, string> = {
  amplitude: "Amplitude =",
  pulsation: "ω =",
  periode: "T =",
  frequence: "Fréquence =",
  dephasage: "φ =",
  phi: "Φ =",
  decalage: "b =",
};

export function labelPhase(phase: PhaseParametresSinusoide): string {
  return LABELS[phase];
}

/** Exemple affiché dans le champ — HORS de l'espace des tirages (aucun dénominateur 7 n'est jamais
 * tiré : T ∈ {kπ, k ∈ {1,2,3,4,6,8}} ∪ {2,…,12}\{7, 9, 11}, Φ de dénominateur 1, 2, 3, 4 ou 6 ;
 * |A| ≤ 5 ; b entier de −6 à 6), virgule décimale. */
const PLACEHOLDERS: Record<PhaseParametresSinusoide, string> = {
  amplitude: "ex : 7/3",
  pulsation: "ex : 5pi/7",
  periode: "ex : 7pi",
  frequence: "ex : 1/(7pi)",
  dephasage: "ex : -5pi/7",
  phi: "ex : 5pi/7",
  decalage: "ex : -7,5",
};

export function placeholderPhase(phase: PhaseParametresSinusoide): string {
  return PLACEHOLDERS[phase];
}

// ============================================================================
// Aides — (1) la règle, formule générale en KaTeX ; (2) OÙ lire dans la formule de l'exercice
// (accolade sous la partie concernée, jamais la valeur réécrite à part) ou la formule substituée,
// le calcul restant à faire.
// ============================================================================

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

export function aideNiveau1(phase: PhaseParametresSinusoide): AideAvecLatex {
  switch (phase) {
    case "amplitude":
      return { texte: "L'amplitude est toujours positive : c'est la valeur absolue du coefficient placé devant le sinus.", latex: "\\text{amplitude} = |A|" };
    case "pulsation":
      return { texte: "La pulsation ω est le coefficient de x à l'intérieur du sinus, l'argument étant écrit sous la forme ωx + φ ou ω(x − Φ) :", latex: "f(x) = A\\sin(\\omega x+\\varphi)+b" };
    case "periode":
      return { texte: "La période se déduit de la pulsation :", latex: "T = \\dfrac{2\\pi}{\\omega}" };
    case "frequence":
      return { texte: "La fréquence est l'inverse de la période :", latex: "f_{req} = \\dfrac{1}{T}" };
    case "dephasage":
      return { texte: "Le déphasage φ est la constante ajoutée dans l'argument écrit sous la forme ωx + φ. Si l'argument est écrit ω(x − Φ), développe-le :", latex: "\\omega(x-\\Phi) = \\omega x - \\omega\\Phi" };
    case "phi":
      return { texte: "Le décalage horizontal Φ est la valeur soustraite à x quand l'argument est écrit ω(x − Φ) :", latex: "\\Phi = -\\dfrac{\\varphi}{\\omega}" };
    case "decalage":
      return { texte: "Le décalage vertical est le terme constant ajouté après le sinus — ici, contrairement à l'amplitude, le signe compte : ne prends pas sa valeur absolue.", latex: null };
  }
}

/** Morceaux de la formule affichée, pour y placer une accolade (`\underbrace`) sous la partie à lire. */
function annoter(contenu: string, etiquette: string): string {
  return `\\underbrace{${contenu}}_{${etiquette}}`;
}

/** Formule de l'exercice avec une accolade sous la partie concernée par `phase` — montre OÙ lire,
 * sans jamais réécrire la valeur à part. */
function formuleAnnotee(exercice: ExerciceParametresSinusoide, phase: "amplitude" | "pulsation" | "dephasage" | "phi" | "decalage"): string {
  const coeffAAffiche = formatCoefficientAmplitudeLatex(exercice.A);
  const coeffA = phase === "amplitude" ? annoter(formatValeurAmplitudeLatex(exercice.A), "A") : coeffAAffiche;
  const decalage = formatTermeDecalageLatex(exercice.b);
  const termeDecalage = phase === "decalage" ? annoter(decalage || "+0", "+b") : decalage;
  const coeffB = formatCoefficientBLatex(exercice.B);
  let argument: string;
  if (exercice.forme === "developpee") {
    const termeB = coeffB === "-" ? "-x" : coefficientNecessiteCdotAvantLettre(coeffB) ? `${coeffB}\\cdot x` : `${coeffB}x`;
    const termeC = formatTermeCLatex(exercice.C);
    argument = `${phase === "pulsation" ? annoter(termeB, "\\omega x") : termeB}${phase === "dephasage" ? annoter(termeC || "+0", "+\\varphi") : termeC}`;
  } else {
    const termeX = termeXPrefactorise(exercice);
    const annoterOmega = phase === "pulsation" || phase === "dephasage";
    const annoterX = phase === "phi" || phase === "dephasage";
    const x = annoterX ? annoter(termeX, "x-\\Phi") : termeX;
    const omega = coeffB === "" ? "1" : formatRationnelPiLatex(exercice.B);
    if (annoterOmega) argument = `${annoter(omega, "\\omega")}\\cdot\\left(${x}\\right)`;
    else if (annoterX) argument = coeffB === "" ? x : `${coeffB}\\left(${x}\\right)`;
    else argument = argumentPrefactorise(coeffB, termeX);
  }
  return `f(x) = ${coeffA}\\sin\\!\\left(${argument}\\right)${termeDecalage}`;
}

export function latexAideNiveau2(exercice: ExerciceParametresSinusoide, phase: PhaseParametresSinusoide): string {
  switch (phase) {
    case "amplitude":
    case "pulsation":
    case "decalage":
      return formuleAnnotee(exercice, phase);
    case "periode":
      return `T = \\dfrac{2\\pi}{\\omega} = \\dfrac{2\\pi}{${formatRationnelPiLatex(exercice.B)}}`;
    case "frequence":
      return `f_{req} = \\dfrac{1}{T} = \\dfrac{1}{${formatRationnelPiLatex(exercice.T)}}`;
    case "dephasage":
      return exercice.forme === "developpee" ? formuleAnnotee(exercice, "dephasage") : `${formuleAnnotee(exercice, "dephasage")} \\qquad \\varphi = -\\omega\\cdot\\Phi`;
    case "phi":
      return exercice.forme === "developpee"
        ? `\\Phi = -\\dfrac{\\varphi}{\\omega} = -\\dfrac{${formatRationnelPiLatex(exercice.C)}}{${formatRationnelPiLatex(exercice.B)}}`
        : formuleAnnotee(exercice, "phi");
  }
}
