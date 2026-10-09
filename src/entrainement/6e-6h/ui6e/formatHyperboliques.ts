import type {
  ExerciceHyperboliquesA,
  ExerciceHyperboliquesB,
  ExerciceHyperboliquesC,
  ExerciceHyperboliquesD,
  ExerciceHyperboliques,
} from "../core6e/hyperboliques.types";
import type { PhaseHyperboliques, ResultatExerciceHyperboliques } from "../moteur6e/typesHyperboliques";
import { fusionnerOperateurSigne } from "./formatOperateurSigne";

/**
 * Textes de consigne/aide + formatage LaTeX pour `6gen19`. Toute aide qui embarque un symbole
 * LaTeX est retournée en `AideAvecLatex {texte, latex}` — jamais interpolée en texte brut (piège
 * déjà rencontré ailleurs sur ce chantier, voir CLAUDE.md). Structure calquée sur
 * `formatDomaineDeriveeLogarithme.ts` (`6gen16`) : `consigneGenerale`/`blocDonnees`/`etatActuel`
 * séparés (structure d'écran imposée par CLAUDE.md : consigne générale → bloc données → bloc "état
 * actuel" → bloc de travail).
 *
 * `sh`/`ch` sont rendus en LaTeX via `\operatorname{sh}`/`\operatorname{ch}` (KaTeX ne définit pas
 * `\sh`/`\ch` nativement — `\operatorname` produit le même rendu droit/espacé qu'un `\sin`/`\cos`
 * natif, sans dépendre d'une macro absente).
 */
export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

const SH = "\\operatorname{sh}";
const CH = "\\operatorname{ch}";

/** Consigne générale UNIQUE, partagée par les 4 familles (spec : "Propriétés de référence à
 * rappeler dans la consigne générale, disponibles pour toutes les familles") — sh/ch sont des
 * fonctions FIXES et NOMMÉES, jamais un paramètre d'exercice, donc leur rappel ne dépend d'aucun
 * champ de l'exercice (contrairement à `6gen16`, où la consigne générale variait selon la
 * famille) — même principe que `CONSIGNE_GENERALE` (`6gen6`, `formatLimitesExponentielles.ts`). */
export const CONSIGNE_GENERALE =
  "Rappel : sh(x)=(eˣ−e⁻ˣ)/2 est IMPAIRE, ch(x)=(eˣ+e⁻ˣ)/2 est PAIRE ; ch²(x)−sh²(x)=1 pour tout x ; sh'=ch et ch'=sh (donc sh''=sh et ch''=ch).";

// ============================================================================
// Famille A — Parité de combinaisons.
// ============================================================================

function formatFonctionA(exercice: ExerciceHyperboliquesA): string {
  switch (exercice.type) {
    case "shKx":
      return `${SH}(${exercice.k}x)`;
    case "chKx":
      return `${CH}(${exercice.k}x)`;
    case "shChProduit":
      return `${SH}(x)\\cdot ${CH}(x)`;
    case "shCarre":
      return `\\left[${SH}(x)\\right]^2`;
    case "chCarre":
      return `\\left[${CH}(x)\\right]^2`;
    case "shPlusCh":
      return `${SH}(x)+${CH}(x)`;
    case "shMoinsCh":
      return `${SH}(x)-${CH}(x)`;
  }
}

/** f(−x), substitué en utilisant la parité de sh/ch SÉPARÉMENT — comparaison finale à f(x)/−f(x)
 * volontairement NON FAITE (spec, aide niveau 2). */
function formatFMoinsXA(exercice: ExerciceHyperboliquesA): string {
  switch (exercice.type) {
    case "shKx":
      return `${SH}(-${exercice.k}x) = -${SH}(${exercice.k}x)`;
    case "chKx":
      return `${CH}(-${exercice.k}x) = ${CH}(${exercice.k}x)`;
    case "shChProduit":
      return `${SH}(-x)\\cdot ${CH}(-x) = \\left[-${SH}(x)\\right]\\cdot ${CH}(x)`;
    case "shCarre":
      return `\\left[${SH}(-x)\\right]^2 = \\left[-${SH}(x)\\right]^2`;
    case "chCarre":
      return `\\left[${CH}(-x)\\right]^2 = \\left[${CH}(x)\\right]^2`;
    case "shPlusCh":
      return `${SH}(-x)+${CH}(-x) = -${SH}(x)+${CH}(x)`;
    case "shMoinsCh":
      return `${SH}(-x)-${CH}(-x) = -${SH}(x)-${CH}(x)`;
  }
}

function aideANiveau1(): AideAvecLatex {
  return { texte: "Méthode générale : calcule f(−x) et compare-le à f(x) et à −f(x) — ne te fie pas à une intuition sur les briques de base (sh, ch peuvent se combiner de façon contre-intuitive).", latex: null };
}
function aideANiveau2(exercice: ExerciceHyperboliquesA): AideAvecLatex {
  return { texte: "f(−x), en utilisant la parité de sh et ch séparément (comparaison finale à toi de faire) :", latex: formatFMoinsXA(exercice) };
}

// ============================================================================
// Famille B — Identité ch²−sh²=1. x0 reste toujours caché.
// ============================================================================

function formatDonneesB(exercice: ExerciceHyperboliquesB): string[] {
  if (exercice.sousType === "trouverCh") return [`${SH}(x_0) = ${exercice.k}`];
  const donnees = [`${CH}(x_0) = ${exercice.k}`];
  if (exercice.signeX0 !== null) donnees.push(exercice.signeX0 > 0 ? "x_0 > 0" : "x_0 < 0");
  return donnees;
}

/** Expression isolée CORRECTE — dérivée uniquement des paramètres de l'exercice (jamais de la
 * saisie élève), réutilisée pour l'aide niveau 2 (écran 1) ET l'état actuel (écran 2). */
function formatExpressionIsoleeB(exercice: ExerciceHyperboliquesB): string {
  if (exercice.sousType === "trouverCh") return `${CH}(x_0) = \\sqrt{1+(${exercice.k})^2}`;
  const radicande = `(${exercice.k})^2-1`;
  if (exercice.signeX0 === null) return `${SH}(x_0) = \\pm\\sqrt{${radicande}}`;
  return `${SH}(x_0) = ${exercice.signeX0 > 0 ? "" : "-"}\\sqrt{${radicande}}`;
}

function consigneB(phase: "bIsoler" | "bValeurs"): string {
  if (phase === "bIsoler") return "À partir de l'identité ch²(x0)−sh²(x0)=1, isole l'inconnue demandée (exprime-la à l'aide d'une racine carrée, avec ou sans ±).";
  return "Calcule la ou les valeurs numériques, à partir de l'expression CORRECTE de l'étape précédente.";
}

function aideBNiveau1(phase: "bIsoler" | "bValeurs"): AideAvecLatex {
  if (phase === "bIsoler") return { texte: "Rappelle-toi l'identité ch²(x)−sh²(x)=1, à réarranger selon l'inconnue cherchée.", latex: `${CH}^2(x)-${SH}^2(x)=1` };
  return { texte: "Remplace k par sa valeur connue dans l'expression isolée, puis calcule la valeur numérique.", latex: null };
}
function aideBNiveau2(phase: "bIsoler" | "bValeurs", exercice: ExerciceHyperboliquesB): AideAvecLatex {
  if (phase === "bIsoler") {
    const radicande = exercice.sousType === "trouverCh" ? `1+(${exercice.k})^2` : `(${exercice.k})^2-1`;
    return { texte: "Expression sous la racine (signe(s) à déterminer non tranché(s)) :", latex: `\\sqrt{${radicande}}` };
  }
  return { texte: "Expression isolée déjà confirmée (recalcule-la numériquement) :", latex: formatExpressionIsoleeB(exercice) };
}

// ============================================================================
// Famille C — f(x) = a·sh(kx) + b·ch(kx).
// ============================================================================

interface TermeSigne {
  valeur: number;
  suffixe: string;
}

/** Jamais de coefficient `±1` littéral, jamais de terme nul affiché, jamais de double signe —
 * même convention que `formatDomaineDeriveeLogarithme.ts` (6gen16). */
function formatSommeTermes(termes: TermeSigne[]): string {
  const nonNuls = termes.filter((t) => t.valeur !== 0);
  if (nonNuls.length === 0) return "0";
  return nonNuls
    .map((t, i) => {
      const abs = Math.abs(t.valeur);
      const corps = abs === 1 ? t.suffixe : `${abs}${t.suffixe}`;
      if (i === 0) return t.valeur < 0 ? `-${corps}` : corps;
      return `${t.valeur < 0 ? "-" : "+"} ${corps}`;
    })
    .join(" ");
}

function formatFonctionC(exercice: ExerciceHyperboliquesC): string {
  const { a, b, k } = exercice;
  return formatSommeTermes([
    { valeur: a, suffixe: `${SH}(${k}x)` },
    { valeur: b, suffixe: `${CH}(${k}x)` },
  ]);
}

function formatDeriveeC(exercice: ExerciceHyperboliquesC): string {
  const { a, b, k } = exercice;
  const interieur = formatSommeTermes([
    { valeur: a, suffixe: `${CH}(${k}x)` },
    { valeur: b, suffixe: `${SH}(${k}x)` },
  ]);
  return `${k}\\left[${interieur}\\right]`;
}

function formatDeriveeSecondeC(exercice: ExerciceHyperboliquesC): string {
  return `${exercice.k * exercice.k}\\left[${formatFonctionC(exercice)}\\right]`;
}

function consigneC(phase: "cDerivee" | "cDeriveeSeconde" | "cRelation"): string {
  if (phase === "cDerivee") return "Calcule f'(x), en utilisant sh'=ch et ch'=sh (attention à la chaîne pour l'argument kx).";
  if (phase === "cDeriveeSeconde") return "Calcule f''(x) à partir de l'expression CORRECTE de f'(x) obtenue à l'étape précédente.";
  return "Exprime la relation entre f''(x) et f(x) : quelle est la valeur du coefficient tel que f''(x) = coefficient·f(x) ?";
}

function aideCNiveau1(phase: "cDerivee" | "cDeriveeSeconde" | "cRelation"): AideAvecLatex {
  if (phase === "cDerivee") return { texte: "Rappel : sh'=ch et ch'=sh (pas de changement de signe, contrairement à sin/cos).", latex: `${SH}' = ${CH},\\quad ${CH}' = ${SH}` };
  if (phase === "cDeriveeSeconde") return { texte: "Applique EXACTEMENT la même règle (sh'=ch, ch'=sh) à f'(x), en n'oubliant pas la chaîne.", latex: null };
  return { texte: "Rappel : sh et ch vérifient chacune f''=f — une combinaison linéaire des deux hérite d'une propriété analogue, avec un facteur k² dû à la chaîne.", latex: `${SH}'' = ${SH},\\quad ${CH}'' = ${CH}` };
}
function aideCNiveau2(phase: "cDerivee" | "cDeriveeSeconde" | "cRelation", exercice: ExerciceHyperboliquesC): AideAvecLatex {
  const { a, b, k } = exercice;
  if (phase === "cDerivee") {
    const termeB = fusionnerOperateurSigne("+", `${b}\\cdot ${k}\\cdot ${CH}'(${k}x)`);
    return { texte: "Chaîne appliquée à kx affichée, dérivées de sh et ch non substituées :", latex: `f'(x) = ${a}\\cdot ${k}\\cdot ${SH}'(${k}x) ${termeB}` };
  }
  if (phase === "cDeriveeSeconde") {
    const termeB = fusionnerOperateurSigne("+", `${b}\\cdot ${k}\\cdot ${SH}'(${k}x)`);
    return { texte: "Chaîne appliquée à kx (dérivée de f' déjà confirmée), dérivées de sh et ch non substituées :", latex: `f''(x) = ${a}\\cdot ${k}\\cdot ${CH}'(${k}x) ${termeB}` };
  }
  return { texte: "f''(x) et f(x) affichés côte à côte (rapport non identifié) :", latex: `f''(x) = ${formatDeriveeSecondeC(exercice)},\\quad f(x) = ${formatFonctionC(exercice)}` };
}

// ============================================================================
// Famille D — f(x) = a·sh(x) + b·ch(x) = [(a+b)e^x + (b−a)e^(−x)]/2.
// ============================================================================

function formatFonctionD(exercice: ExerciceHyperboliquesD): string {
  const { a, b } = exercice;
  return formatSommeTermes([
    { valeur: a, suffixe: SH + "(x)" },
    { valeur: b, suffixe: CH + "(x)" },
  ]);
}

/** Forme réécrite CORRECTE en e^x/e^(−x) — dérivée uniquement des paramètres de l'exercice. */
function formatFormeExponentielleD(exercice: ExerciceHyperboliquesD): string {
  const { a, b } = exercice;
  const numerateur = formatSommeTermes([
    { valeur: a + b, suffixe: "e^x" },
    { valeur: b - a, suffixe: "e^{-x}" },
  ]);
  return `\\dfrac{${numerateur}}{2}`;
}

function consigneD(phase: "dReecriture" | "dLimites"): string {
  if (phase === "dReecriture") return "Réécris f(x) en termes de eˣ et e⁻ˣ, puis identifie le terme dominant à chaque infini.";
  return "Conclus le signe de la limite de f à chaque infini, à partir de la forme CORRECTE de l'étape précédente (1 statut par direction).";
}

function aideDNiveau1(phase: "dReecriture" | "dLimites"): AideAvecLatex {
  if (phase === "dReecriture") return { texte: "Rappelle-toi de réécrire sh et ch en termes de eˣ et e⁻ˣ avant toute analyse de limite.", latex: `${SH}(x)=\\dfrac{e^x-e^{-x}}{2},\\quad ${CH}(x)=\\dfrac{e^x+e^{-x}}{2}` };
  return { texte: "À chaque infini, un seul des deux termes exponentiels survit (l'autre tend vers 0) — repère lequel.", latex: null };
}
function aideDNiveau2(phase: "dReecriture" | "dLimites", exercice: ExerciceHyperboliquesD): AideAvecLatex {
  const { a, b } = exercice;
  if (phase === "dReecriture") {
    const termeB = fusionnerOperateurSigne("+", `${b}\\cdot\\dfrac{e^x+e^{-x}}{2}`);
    return { texte: "Expression développée mais non regroupée par puissance d'exponentielle :", latex: `f(x) = ${a}\\cdot\\dfrac{e^x-e^{-x}}{2} ${termeB}` };
  }
  return { texte: "Signe de (a+b) et de (b−a), rappelés séparément (conclusion non donnée) :", latex: `a+b = ${a + b},\\quad b-a = ${b - a}` };
}

// ============================================================================
// Dispatch public.
// ============================================================================

/** Bloc de données affiché sur CHAQUE écran de l'exercice (spec : consigne générale et bloc de
 * données redondants sur chaque écran — traçabilité des coefficients). */
export function blocDonnees(exercice: ExerciceHyperboliques): string[] {
  switch (exercice.famille) {
    case "A":
      return [`f(x) = ${formatFonctionA(exercice)}`];
    case "B":
      return formatDonneesB(exercice);
    case "C":
      return [`f(x) = ${formatFonctionC(exercice)}`];
    case "D":
      return [`f(x) = ${formatFonctionD(exercice)}`];
  }
}

/** État actuel — `null` sur tout écran dont la vérification ne dépend PAS d'un écran précédent
 * (aParite, bIsoler, cDerivee, dReecriture sont chacun le premier écran de leur famille). Non-null
 * uniquement quand l'écran réutilise réellement la vérité mathématique CONFIRMÉE d'un écran
 * antérieur. */
export function etatActuel(exercice: ExerciceHyperboliques, phase: PhaseHyperboliques): string[] | null {
  if (exercice.famille === "B" && phase === "bValeurs") {
    return [`${formatExpressionIsoleeB(exercice)}\\ \\text{(confirmé à l'étape précédente)}`];
  }
  if (exercice.famille === "C" && phase === "cDeriveeSeconde") {
    return [`f'(x) = ${formatDeriveeC(exercice)}\\ \\text{(confirmé à l'étape précédente)}`];
  }
  if (exercice.famille === "C" && phase === "cRelation") {
    return [`f'(x) = ${formatDeriveeC(exercice)}\\ \\text{(confirmé à l'étape 1)}`, `f''(x) = ${formatDeriveeSecondeC(exercice)}\\ \\text{(confirmé à l'étape 2)}`];
  }
  if (exercice.famille === "D" && phase === "dLimites") {
    return [`f(x) = ${formatFormeExponentielleD(exercice)}\\ \\text{(confirmé à l'étape précédente)}`];
  }
  return null;
}

export function consigneEcran(exercice: ExerciceHyperboliques, phase: PhaseHyperboliques): string {
  switch (exercice.famille) {
    case "A":
      return "Détermine la parité de cette fonction (paire, impaire, ou aucune des deux).";
    case "B":
      return consigneB(phase as "bIsoler" | "bValeurs");
    case "C":
      return consigneC(phase as "cDerivee" | "cDeriveeSeconde" | "cRelation");
    case "D":
      return consigneD(phase as "dReecriture" | "dLimites");
  }
}

export function aideNiveau1(exercice: ExerciceHyperboliques, phase: PhaseHyperboliques): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideANiveau1();
    case "B":
      return aideBNiveau1(phase as "bIsoler" | "bValeurs");
    case "C":
      return aideCNiveau1(phase as "cDerivee" | "cDeriveeSeconde" | "cRelation");
    case "D":
      return aideDNiveau1(phase as "dReecriture" | "dLimites");
  }
}

export function aideNiveau2(exercice: ExerciceHyperboliques, phase: PhaseHyperboliques): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideANiveau2(exercice);
    case "B":
      return aideBNiveau2(phase as "bIsoler" | "bValeurs", exercice);
    case "C":
      return aideCNiveau2(phase as "cDerivee" | "cDeriveeSeconde" | "cRelation", exercice);
    case "D":
      return aideDNiveau2(phase as "dReecriture" | "dLimites", exercice);
  }
}

export interface TotalPointsRecap {
  points: number;
  maximum: number;
}

/**
 * Total de points du récapitulatif final — SOMME des scores déjà pénalisés (tentatives + aide) sur
 * chaque écran RÉELLEMENT traversé (1 à 3 selon la famille), affiché EN COMPLÉMENT de la liste
 * colorée `LigneRecap`/`statutRecap` (jamais à sa place — convention CLAUDE.md). Même principe que
 * `totalPointsDomaineDeriveeLogarithme` (`6gen16`).
 */
export function totalPointsHyperboliques(resultat: ResultatExerciceHyperboliques): TotalPointsRecap {
  switch (resultat.famille) {
    case "A":
      return { points: resultat.scoreParite, maximum: 100 };
    case "B":
      return { points: resultat.scoreIsoler + resultat.scoreValeurs, maximum: 200 };
    case "C":
      return { points: resultat.scoreDerivee + resultat.scoreDeriveeSeconde + resultat.scoreRelation, maximum: 300 };
    case "D":
      return { points: resultat.scoreReecriture + resultat.scoreLimites, maximum: 200 };
  }
}
