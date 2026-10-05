/**
 * Couche présentation (5e) — consignes/labels/formules pour 5gen8 ("Paramètres d'une fonction
 * sinusoïdale"). Notation canonique imposée par la spec : A/T/φ/f/b UNIQUEMENT, jamais B/C montrés
 * comme des paramètres à part entière — B et C ne sont que des quantités INTERMÉDIAIRES de la forme
 * développée.
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
  const phi = reduireRationnelPi(exercice.phi);
  const termeX = phi.numerateur === 0 ? "x" : phi.numerateur > 0 ? `x-${formatRationnelPiLatex(phi)}` : `x+${formatRationnelPiLatex(negatifPourAffichage(phi))}`;
  const argument = coeffB === "" ? termeX : coeffB === "-" ? `-(${termeX})` : `${coeffB}(${termeX})`;
  return `f(x) = ${coeffA}\\sin\\!\\left(${argument}\\right)${formatTermeDecalageLatex(exercice.b)}`;
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
 * affiché dans la formule), φ, T, f, b. Réutilisé à la fois par le bloc "état actuel" (paramètres
 * déjà confirmés) et par le récapitulatif final (les 5, toujours). */
export function formatChampParametreLatex(exercice: ExerciceParametresSinusoide, champ: PhaseParametresSinusoide): string {
  switch (champ) {
    case "amplitude":
      return `|A| = ${formatAmplitudeAbsolueLatex(exercice.A)}`;
    case "phi":
      return `\\Phi = ${formatRationnelPiLatex(exercice.phi)}`;
    case "periode":
      return `T = ${formatRationnelPiLatex(exercice.T)}`;
    case "frequence":
      return `f = ${formatFrequenceLatex(exercice)}`;
    case "decalage":
      return `b = ${exercice.b}`;
  }
}

/** "Bloc état actuel" — accumule les paramètres déjà CONFIRMÉS avant `phase` (ordre A, Φ, T, f, b) ;
 * vide pour le premier écran (amplitude), jamais affiché dans ce cas (voir le composant appelant). */
export function formatTermesEtatActuelParametresSinusoideLatex(exercice: ExerciceParametresSinusoide, phase: PhaseParametresSinusoide): string[] {
  const index = ORDRE_PHASES_SINUSOIDE.indexOf(phase);
  return ORDRE_PHASES_SINUSOIDE.slice(0, index).map((champ) => formatChampParametreLatex(exercice, champ));
}

// ============================================================================
// Consignes / labels
// ============================================================================

const CONSIGNE_GENERALE = "Détermine les paramètres de cette fonction sinusoïdale.";

const CONSIGNES: Record<PhaseParametresSinusoide, string> = {
  amplitude: "Quelle est l'amplitude A de cette fonction ? (arrondis au centième près)",
  phi: "Quel est le décalage horizontal Φ de cette fonction ? (arrondis au centième près)",
  periode: "Quelle est la période T de cette fonction ? (arrondis au centième près)",
  frequence: "Quelle est la fréquence f de cette fonction ? (arrondis au centième près)",
  decalage: "Quel est le décalage vertical b de cette fonction ? (arrondis au centième près)",
};

export function consigneGenerale(): string {
  return CONSIGNE_GENERALE;
}

export function consignePhase(phase: PhaseParametresSinusoide): string {
  return CONSIGNES[phase];
}

const LABELS: Record<PhaseParametresSinusoide, string> = { amplitude: "A =", phi: "Φ =", periode: "T =", frequence: "f =", decalage: "b =" };

export function labelPhase(phase: PhaseParametresSinusoide): string {
  return LABELS[phase];
}

// ============================================================================
// Aides — (1) rappel de la définition/formule ; (2) valeurs substituées, calcul non fait
// ============================================================================

export function texteAideNiveau1(phase: PhaseParametresSinusoide): string {
  switch (phase) {
    case "amplitude":
      return "L'amplitude est TOUJOURS positive : c'est la valeur absolue du coefficient devant le sinus, quel que soit son signe dans la formule.";
    case "phi":
      return "Formule générale de conversion : Φ = −C/B (forme développée) — ou lecture directe si la forme est déjà A·sin((2π/T)(x−Φ))+b.";
    case "periode":
      return "Formule générale de conversion : T = 2π/|B| (forme développée) — ou lecture directe si la forme est déjà pré-factorisée.";
    case "frequence":
      return "La fréquence est l'inverse de la période : f = 1/T.";
    case "decalage":
      return "Le décalage vertical est le terme constant ajouté après le sinus — ici, CONTRAIREMENT à l'amplitude, le signe compte : ne prends jamais sa valeur absolue.";
  }
}

function texteBSubstitueLatex(exercice: ExerciceParametresSinusoide): string {
  return formatRationnelPiLatex(exercice.B);
}
function texteCSubstitueLatex(exercice: ExerciceParametresSinusoide): string {
  const c = reduireRationnelPi(exercice.C);
  return c.numerateur === 0 ? "0" : formatRationnelPiLatex(exercice.C);
}

export function latexAideNiveau2(exercice: ExerciceParametresSinusoide, phase: PhaseParametresSinusoide): string {
  if (exercice.forme === "prefactorisee") {
    switch (phase) {
      case "phi":
        return `\\Phi = ${formatRationnelPiLatex(exercice.phi)}`;
      case "periode":
        return `T = ${formatRationnelPiLatex(exercice.T)}`;
      case "amplitude":
        return `|A| = \\left|${formatValeurAmplitudeLatex(exercice.A)}\\right|`;
      case "frequence":
        return `f = \\dfrac{1}{T} = \\dfrac{1}{${formatRationnelPiLatex(exercice.T)}}`;
      case "decalage":
        return `b = ${exercice.b}`;
    }
  }
  switch (phase) {
    case "amplitude":
      return `|A| = \\left|${formatCoefficientAmplitudeLatex(exercice.A) || "1"}\\right|`;
    case "phi":
      return `\\Phi = -\\dfrac{C}{B} = -\\dfrac{${texteCSubstitueLatex(exercice)}}{${texteBSubstitueLatex(exercice)}}`;
    case "periode":
      return `T = \\dfrac{2\\pi}{|B|} = \\dfrac{2\\pi}{\\left|${texteBSubstitueLatex(exercice)}\\right|}`;
    case "frequence":
      return `f = \\dfrac{1}{T} = \\dfrac{1}{${formatRationnelPiLatex(exercice.T)}}`;
    case "decalage":
      return `b = ${exercice.b}`;
  }
}
