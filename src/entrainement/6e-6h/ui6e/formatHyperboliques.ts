import type {
  ExerciceHyperboliquesA,
  ExerciceHyperboliquesB,
  ExerciceHyperboliquesC,
  ExerciceHyperboliquesD,
  ExerciceHyperboliques,
} from "../core6e/hyperboliques.types";
import type { StatutPariteHyperbolique } from "../core6e/hyperboliques.types";
import type { PhaseHyperboliques } from "../moteur6e/typesHyperboliques";
import { pariteAttendueA, signeLimiteMoinsInfiniD, signeLimitePlusInfiniD } from "../moteur6e/verificationHyperboliques";
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

/** Texte brut mêlé à du LaTeX inline court — même contrat que `ui/formatEquationDroite.ts`
 * (dupliqué à dessein, convention CLAUDE.md), rendu via `components/RenduFragments.tsx`. */
export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

function texte(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}
function latex(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
}

const SH = "\\operatorname{sh}";
const CH = "\\operatorname{ch}";

/** Consigne générale UNIQUE, partagée par les 4 familles — seulement les DÉFINITIONS de sh et ch
 * (jamais leur parité ni leurs dérivées : ce sont précisément des réponses attendues par les
 * familles A et C — le rappel nécessaire vit dans les aides de l'écran concerné). */
export const CONSIGNE_GENERALE: FragmentConsigne[] = [
  texte("Rappel : "),
  latex(`${SH}(x)=\\dfrac{e^x-e^{-x}}{2}`),
  texte(" et "),
  latex(`${CH}(x)=\\dfrac{e^x+e^{-x}}{2}`),
  texte("."),
];

/** "" / "-" / "2" — jamais un coefficient ±1 littéral devant un corps de formule. */
function formatCoef(a: number): string {
  if (a === 1) return "";
  if (a === -1) return "-";
  return `${a}`;
}

/** Argument "kx" — jamais "1x". */
function formatArgument(k: number, negatif = false): string {
  const corps = k === 1 ? "x" : `${k}x`;
  return negatif ? `-${corps}` : corps;
}

// ============================================================================
// Famille A — Parité de combinaisons.
// ============================================================================

function formatFonctionA(exercice: ExerciceHyperboliquesA): string {
  switch (exercice.type) {
    case "shKx":
      return `${formatCoef(exercice.a)}${SH}(${formatArgument(exercice.k)})`;
    case "chKx":
      return `${formatCoef(exercice.a)}${CH}(${formatArgument(exercice.k)})`;
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
    case "shPlusConstante":
      return `${SH}(x) ${fusionnerOperateurSigne("+", `${exercice.c}`)}`;
    case "xSh":
      return `x\\,${SH}(x)`;
    case "xCh":
      return `x\\,${CH}(x)`;
    case "shCube":
      return `\\left[${SH}(x)\\right]^3`;
  }
}

/** f(−x), substitué en utilisant la parité de sh/ch SÉPARÉMENT — comparaison finale à f(x)/−f(x)
 * volontairement NON FAITE (aide niveau 2). */
export function formatFMoinsXA(exercice: ExerciceHyperboliquesA): string {
  switch (exercice.type) {
    case "shKx":
      return `${formatCoef(exercice.a)}${SH}(${formatArgument(exercice.k, true)}) = ${formatCoef(exercice.a)}\\left[-${SH}(${formatArgument(exercice.k)})\\right]`;
    case "chKx":
      return `${formatCoef(exercice.a)}${CH}(${formatArgument(exercice.k, true)}) = ${formatCoef(exercice.a)}${CH}(${formatArgument(exercice.k)})`;
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
    case "shPlusConstante":
      return `${SH}(-x) ${fusionnerOperateurSigne("+", `${exercice.c}`)} = -${SH}(x) ${fusionnerOperateurSigne("+", `${exercice.c}`)}`;
    case "xSh":
      return `(-x)\\,${SH}(-x) = (-x)\\cdot\\left[-${SH}(x)\\right]`;
    case "xCh":
      return `(-x)\\,${CH}(-x) = (-x)\\cdot ${CH}(x)`;
    case "shCube":
      return `\\left[${SH}(-x)\\right]^3 = \\left[-${SH}(x)\\right]^3`;
  }
}

const LIBELLE_PARITE: Record<StatutPariteHyperbolique, string> = { paire: "paire", impaire: "impaire", aucune: "ni paire ni impaire" };

/** Réponse attendue (révélation, fiche, corrigé) — f(−x) développée puis la conclusion. */
function formatReponseAParite(exercice: ExerciceHyperboliquesA): string {
  const parite = pariteAttendueA(exercice);
  const comparaison = parite === "paire" ? " = f(x)" : parite === "impaire" ? " = -f(x)" : "";
  return `f(-x) = ${formatFMoinsXA(exercice)}${comparaison} \\;\\Rightarrow\\; \\text{f est ${LIBELLE_PARITE[parite]}}`;
}

function aideANiveau1(): AideAvecLatex {
  return {
    texte: "Calcule f(−x) en utilisant sh(−x) = −sh(x) (sh est impaire) et ch(−x) = ch(x) (ch est paire), puis compare le résultat à f(x) et à −f(x).",
    latex: `${SH}(-x)=-${SH}(x),\\quad ${CH}(-x)=${CH}(x)`,
  };
}
function aideANiveau2(exercice: ExerciceHyperboliquesA): AideAvecLatex {
  return { texte: "f(−x), en utilisant la parité de sh et ch séparément (comparaison finale à toi de faire) :", latex: formatFMoinsXA(exercice) };
}

// ============================================================================
// Famille B — Identité ch²−sh²=1, valeur(s) EXACTE(S). x0 reste toujours caché.
// ============================================================================

function pgcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) [x, y] = [y, x % y];
  return x;
}

/** k en LaTeX — entier, ou fraction irréductible signée. */
function formatKLatex(exercice: ExerciceHyperboliquesB): string {
  if (exercice.kDen === 1) return `${exercice.kNum}`;
  const signe = exercice.kNum < 0 ? "-" : "";
  return `${signe}\\dfrac{${Math.abs(exercice.kNum)}}{${exercice.kDen}}`;
}

/** √N / D simplifié : extrait le plus grand carré de N, réduit la fraction. */
function formatRacineSurEntier(n: number, d: number): string {
  let s = 1;
  let r = n;
  for (let f = 2; f * f <= r; f++) {
    while (r % (f * f) === 0) {
      r /= f * f;
      s *= f;
    }
  }
  const g = pgcd(s, d);
  const num = s / g;
  const den = d / g;
  const numLatex = r === 1 ? `${num}` : num === 1 ? `\\sqrt{${r}}` : `${num}\\sqrt{${r}}`;
  return den === 1 ? numLatex : `\\dfrac{${numLatex}}{${den}}`;
}

/** Valeur exacte positive de la racine attendue : √(1+k²) (trouverCh) ou √(k²−1) (trouverSh),
 * k = kNum/kDen ⟹ √(kDen² ± kNum²)/kDen. */
function formatRacineB(exercice: ExerciceHyperboliquesB): string {
  const n = exercice.sousType === "trouverCh" ? exercice.kDen * exercice.kDen + exercice.kNum * exercice.kNum : exercice.kNum * exercice.kNum - exercice.kDen * exercice.kDen;
  return formatRacineSurEntier(n, exercice.kDen);
}

function formatDonneesB(exercice: ExerciceHyperboliquesB): string[] {
  if (exercice.sousType === "trouverCh") return [`${SH}(x_0) = ${formatKLatex(exercice)}`];
  const donnees = [`${CH}(x_0) = ${formatKLatex(exercice)}`];
  if (exercice.signeX0 !== null) donnees.push(exercice.signeX0 > 0 ? "x_0 > 0" : "x_0 < 0");
  return donnees;
}

function formatReponseB(exercice: ExerciceHyperboliquesB): string {
  const racine = formatRacineB(exercice);
  if (exercice.sousType === "trouverCh") return `${CH}(x_0) = ${racine}`;
  if (exercice.signeX0 === null) return `${SH}(x_0) = ${racine} \\quad \\text{ou} \\quad ${SH}(x_0) = -${racine}`;
  return `${SH}(x_0) = ${exercice.signeX0 > 0 ? "" : "-"}${racine}`;
}

function consigneB(exercice: ExerciceHyperboliquesB): FragmentConsigne[] {
  const inconnue = exercice.sousType === "trouverCh" ? `${CH}(x_0)` : `${SH}(x_0)`;
  return [
    texte("Calcule la valeur EXACTE de "),
    latex(inconnue),
    texte(" (écris une racine avec sqrt(…)). S'il y a plusieurs valeurs possibles, donne-les toutes."),
  ];
}

function aideBNiveau1(): AideAvecLatex {
  return {
    texte: "Utilise l'identité ch²(x)−sh²(x)=1 pour isoler le CARRÉ de l'inconnue. Rappel : ch(x) ≥ 1 est toujours positive, sh(x) a le même signe que x.",
    latex: `${CH}^2(x)-${SH}^2(x)=1`,
  };
}
function aideBNiveau2(exercice: ExerciceHyperboliquesB): AideAvecLatex {
  const k = formatKLatex(exercice);
  if (exercice.sousType === "trouverCh") {
    return { texte: "Carré de l'inconnue (racine et signe encore à déterminer) :", latex: `${CH}^2(x_0) = 1+${SH}^2(x_0) = 1+\\left(${k}\\right)^2` };
  }
  return { texte: "Carré de l'inconnue (racine et signe(s) encore à déterminer) :", latex: `${SH}^2(x_0) = ${CH}^2(x_0)-1 = \\left(${k}\\right)^2-1` };
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
  const arg = formatArgument(k);
  return formatSommeTermes([
    { valeur: a, suffixe: `${SH}(${arg})` },
    { valeur: b, suffixe: `${CH}(${arg})` },
  ]);
}

/** f'(x) développée : a·k·ch(kx) + b·k·sh(kx). */
export function formatDeriveeC(exercice: ExerciceHyperboliquesC): string {
  const { a, b, k } = exercice;
  const arg = formatArgument(k);
  return formatSommeTermes([
    { valeur: a * k, suffixe: `${CH}(${arg})` },
    { valeur: b * k, suffixe: `${SH}(${arg})` },
  ]);
}

/** f''(x) développée : a·k²·sh(kx) + b·k²·ch(kx). */
export function formatDeriveeSecondeC(exercice: ExerciceHyperboliquesC): string {
  const { a, b, k } = exercice;
  const arg = formatArgument(k);
  return formatSommeTermes([
    { valeur: a * k * k, suffixe: `${SH}(${arg})` },
    { valeur: b * k * k, suffixe: `${CH}(${arg})` },
  ]);
}

function consigneC(phase: "cDerivee" | "cDeriveeSeconde"): FragmentConsigne[] {
  if (phase === "cDerivee") return [texte("Calcule f'(x).")];
  return [texte("Calcule f''(x) à partir de l'expression CORRECTE de f'(x) obtenue à l'étape précédente.")];
}

function aideCNiveau1(phase: "cDerivee" | "cDeriveeSeconde"): AideAvecLatex {
  if (phase === "cDerivee") return { texte: "Rappel : pas de changement de signe (contrairement à sin et cos), et la dérivée de sh(kx) fait apparaître le facteur k (dérivée de l'argument) :", latex: `${SH}' = ${CH},\\quad ${CH}' = ${SH}` };
  return { texte: "Applique EXACTEMENT la même règle (sh'=ch, ch'=sh) à f'(x), en n'oubliant pas le facteur k de l'argument.", latex: `${SH}' = ${CH},\\quad ${CH}' = ${SH}` };
}

/** "a·k" sans facteur 1 inutile. */
function produitCoefK(a: number, k: number): string {
  return k === 1 ? `${a}` : `${a}\\cdot ${k}`;
}

function aideCNiveau2(phase: "cDerivee" | "cDeriveeSeconde", exercice: ExerciceHyperboliquesC): AideAvecLatex {
  const { a, b, k } = exercice;
  const arg = formatArgument(k);
  if (phase === "cDerivee") {
    const termeB = fusionnerOperateurSigne("+", `${produitCoefK(b, k)}\\cdot ${CH}'(${arg})`);
    return { texte: "Facteur k de l'argument affiché, dérivées de sh et ch non substituées :", latex: `f'(x) = ${produitCoefK(a, k)}\\cdot ${SH}'(${arg}) ${termeB}` };
  }
  const termeB = fusionnerOperateurSigne("+", `${produitCoefK(b * k, k)}\\cdot ${SH}'(${arg})`);
  return { texte: "Facteur k de l'argument affiché (dérivée de f' confirmée), dérivées de sh et ch non substituées :", latex: `f''(x) = ${produitCoefK(a * k, k)}\\cdot ${CH}'(${arg}) ${termeB}` };
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
export function formatFormeExponentielleD(exercice: ExerciceHyperboliquesD): string {
  const { a, b } = exercice;
  const numerateur = formatSommeTermes([
    { valeur: a + b, suffixe: "e^x" },
    { valeur: b - a, suffixe: "e^{-x}" },
  ]);
  return `\\dfrac{${numerateur}}{2}`;
}

function formatReponseDLimites(exercice: ExerciceHyperboliquesD): string {
  const signe = (s: "plus_infini" | "moins_infini") => (s === "plus_infini" ? "+\\infty" : "-\\infty");
  return `\\lim_{x\\to+\\infty} f(x) = ${signe(signeLimitePlusInfiniD(exercice))},\\quad \\lim_{x\\to-\\infty} f(x) = ${signe(signeLimiteMoinsInfiniD(exercice))}`;
}

function consigneD(phase: "dReecriture" | "dLimites"): FragmentConsigne[] {
  if (phase === "dReecriture") {
    return [texte("Réécris f(x) en termes de "), latex("e^x"), texte(" et "), latex("e^{-x}"), texte(" (regroupe les termes en "), latex("e^x"), texte(" et en "), latex("e^{-x}"), texte(").")];
  }
  return [texte("Conclus le signe de la limite de f à chaque infini, à partir de la forme CORRECTE de l'étape précédente.")];
}

function aideDNiveau1(phase: "dReecriture" | "dLimites"): AideAvecLatex {
  if (phase === "dReecriture") return { texte: "Remplace sh(x) et ch(x) par leur définition en eˣ et e⁻ˣ, puis regroupe les termes en eˣ d'un côté et en e⁻ˣ de l'autre.", latex: `${SH}(x)=\\dfrac{e^x-e^{-x}}{2},\\quad ${CH}(x)=\\dfrac{e^x+e^{-x}}{2}` };
  return { texte: "À chaque infini, un seul des deux termes exponentiels survit (l'autre tend vers 0) — repère lequel, puis regarde le signe de son coefficient.", latex: null };
}
function aideDNiveau2(phase: "dReecriture" | "dLimites", exercice: ExerciceHyperboliquesD): AideAvecLatex {
  const { a, b } = exercice;
  if (phase === "dReecriture") {
    return {
      texte: `Coefficients à calculer, avec a = ${a} et b = ${b} :`,
      latex: "\\text{coefficient de } e^x = \\dfrac{a+b}{2},\\quad \\text{coefficient de } e^{-x} = \\dfrac{b-a}{2}",
    };
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
 * (aParite, bValeurs, cDerivee, dReecriture sont chacun le premier écran de leur famille). */
export function etatActuel(exercice: ExerciceHyperboliques, phase: PhaseHyperboliques): string[] | null {
  if (exercice.famille === "C" && phase === "cDeriveeSeconde") {
    return [`f'(x) = ${formatDeriveeC(exercice)}\\ \\text{(confirmé à l'étape précédente)}`];
  }
  if (exercice.famille === "D" && phase === "dLimites") {
    return [`f(x) = ${formatFormeExponentielleD(exercice)}\\ \\text{(confirmé à l'étape précédente)}`];
  }
  return null;
}

/** Réponse attendue d'un écran, en LaTeX — utilisée telle quelle par la révélation, la fiche de
 * consultation, le récapitulatif « Ce qu'on sait déjà » et le corrigé exporté (jamais un texte
 * générique). */
export function reponseAttendueLatex(exercice: ExerciceHyperboliques, phase: PhaseHyperboliques): string {
  switch (exercice.famille) {
    case "A":
      return formatReponseAParite(exercice);
    case "B":
      return formatReponseB(exercice);
    case "C":
      return phase === "cDerivee" ? `f'(x) = ${formatDeriveeC(exercice)}` : `f''(x) = ${formatDeriveeSecondeC(exercice)}`;
    case "D":
      return phase === "dReecriture" ? `f(x) = ${formatFormeExponentielleD(exercice)}` : formatReponseDLimites(exercice);
  }
}

export function consigneEcran(exercice: ExerciceHyperboliques, phase: PhaseHyperboliques): FragmentConsigne[] {
  switch (exercice.famille) {
    case "A":
      return [texte("Détermine la parité de cette fonction (paire, impaire, ou aucune des deux).")];
    case "B":
      return consigneB(exercice);
    case "C":
      return consigneC(phase as "cDerivee" | "cDeriveeSeconde");
    case "D":
      return consigneD(phase as "dReecriture" | "dLimites");
  }
}

export function aideNiveau1(exercice: ExerciceHyperboliques, phase: PhaseHyperboliques): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideANiveau1();
    case "B":
      return aideBNiveau1();
    case "C":
      return aideCNiveau1(phase as "cDerivee" | "cDeriveeSeconde");
    case "D":
      return aideDNiveau1(phase as "dReecriture" | "dLimites");
  }
}

export function aideNiveau2(exercice: ExerciceHyperboliques, phase: PhaseHyperboliques): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideANiveau2(exercice);
    case "B":
      return aideBNiveau2(exercice);
    case "C":
      return aideCNiveau2(phase as "cDerivee" | "cDeriveeSeconde", exercice);
    case "D":
      return aideDNiveau2(phase as "dReecriture" | "dLimites", exercice);
  }
}
