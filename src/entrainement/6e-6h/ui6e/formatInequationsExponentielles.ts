import type {
  BaseIneq,
  Comparateur,
  DirectionSigne,
  ExerciceIneqA,
  ExerciceIneqB,
  ExerciceIneqC,
  ExerciceIneqCf,
  ExerciceIneqCk,
  ExerciceIneqD,
  ExerciceIneqDConstant,
  ExerciceIneqDVariable,
  ExerciceIneqE,
  ExerciceInequationExponentielle,
  FacteurUnZero,
  PremierFacteurD,
  SecondFacteurDConstant,
  ValeurExacteIneq,
} from "../core6e/inequationsExponentielles.types";
import { inverserComparateur } from "../generateurs6e/inequationsExponentielles/comparateur";
import type { PhaseInequationExponentielle } from "../moteur6e/typesInequationsExponentielles";
import { formatEnsembleReelLatex } from "./formatEnsembleReel";

/**
 * Textes de consigne/aide + formatage LaTeX pour `6gen10`. `src/ui6e/` peut dépendre de
 * `src/generateurs6e/` (même principe que `formatEquationsExponentielles.ts`, 6gen9) — réutilise
 * `inverserComparateur` pour AFFICHER le sens déjà corrigé dans les aides, jamais pour re-DÉRIVER
 * une donnée déjà calculée à la génération (`solutionEcran2`/`3` restent la seule source de vérité
 * pour la CORRECTION, jamais recalculées ici).
 *
 * Toute aide qui embarque un symbole LaTeX est retournée en `AideAvecLatex {texte, latex}` —
 * JAMAIS interpolée en texte brut (piège déjà rencontré et corrigé à de nombreuses reprises sur ce
 * chantier). Dispatch PAR FAMILLE (+ sous-type), pas par phase seule — les phases (`aReconnaitre`,
 * `bReconnaitre`...) sont préfixées par famille et n'ont jamais de sens hors de leur famille.
 */
export const CONSIGNE_GENERALE = "Résous l'inéquation suivante :";

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

/** Texte brut mêlé à du LaTeX inline court — même contrat que `ui/formatEquationDroite.ts`
 * (dupliqué à dessein, convention CLAUDE.md), rendu via `components/RenduFragments.tsx`. */
export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

function txt(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}
function ltx(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
}

interface TermeSigne {
  valeur: number;
  suffixe: string;
}

/** Jamais de coefficient nul affiché, jamais de coefficient `±1` littéral. */
function formatSommeTermes(termes: TermeSigne[]): string {
  const nonNuls = termes.filter((t) => t.valeur !== 0);
  if (nonNuls.length === 0) return "0";
  return nonNuls
    .map((t, i) => {
      const abs = Math.abs(t.valeur);
      const corps = t.suffixe === "" ? `${abs}` : abs === 1 ? t.suffixe : `${abs}${t.suffixe}`;
      if (i === 0) return t.valeur < 0 ? `-${corps}` : corps;
      return `${t.valeur < 0 ? "-" : "+"} ${corps}`;
    })
    .join(" ");
}

/** Même principe que `formatSommeTermes`, avec un `\cdot` explicite entre coefficient et suffixe
 * dès que ce dernier n'est pas un simple monôme polynomial (`x`/`x^2`) — nécessaire pour un terme
 * `3\cdot 2^{x}`, où la juxtaposition directe serait ambiguë (réplique
 * `formatEquationsExponentielles.ts::formatSommeTermesAvecCdot`, 6gen9). */
function formatSommeTermesAvecCdot(termes: TermeSigne[]): string {
  const nonNuls = termes.filter((t) => t.valeur !== 0);
  if (nonNuls.length === 0) return "0";
  return nonNuls
    .map((t, i) => {
      const abs = Math.abs(t.valeur);
      const corps = t.suffixe === "" ? `${abs}` : abs === 1 ? t.suffixe : `${abs}\\cdot ${t.suffixe}`;
      if (i === 0) return t.valeur < 0 ? `-${corps}` : corps;
      return `${t.valeur < 0 ? "-" : "+"} ${corps}`;
    })
    .join(" ");
}

export function baseLatex(base: BaseIneq): string {
  if (base.estE) return "e";
  if (base.den === 1) return String(base.num);
  return `\\frac{${base.num}}{${base.den}}`;
}

/** Base entre PARENTHÈSES quand elle est une fraction et immédiatement suivie d'un exposant —
 * même piège déjà documenté pour 6gen9 (`\frac{5}{2}^{-4x}` attache visuellement l'exposant au
 * SEUL dénominateur). */
export function baseLatexPourExposant(base: BaseIneq): string {
  if (base.estE || base.den === 1) return baseLatex(base);
  return `\\left(${baseLatex(base)}\\right)`;
}

function denominateurDecimalFini(den: number): boolean {
  let d = den;
  while (d % 2 === 0) d /= 2;
  while (d % 5 === 0) d /= 5;
  return d === 1;
}

function formatDecimalFrancaisLatex(valeur: number): string {
  return String(valeur).replace(".", "{,}");
}

export function formatValeurExacteLatex(v: ValeurExacteIneq): string {
  if (v.den === 1) return String(v.num);
  if (denominateurDecimalFini(v.den)) return formatDecimalFrancaisLatex(v.num / v.den);
  return `\\frac{${v.num}}{${v.den}}`;
}

export function symboleComparateurLatex(cmp: Comparateur): string {
  switch (cmp) {
    case ">":
      return ">";
    case "<":
      return "<";
    case ">=":
      return "\\geq";
    case "<=":
      return "\\leq";
  }
}

export function formatXMoinsZero(zero: number): string {
  if (zero === 0) return "x";
  return zero > 0 ? `x-${zero}` : `x+${-zero}`;
}

// ============================================================================
// Famille A — 2 écrans.
// ============================================================================

export function formatExposantLineaireLatex(m: number, n: number): string {
  return formatSommeTermes([
    { valeur: m, suffixe: "x" },
    { valeur: n, suffixe: "" },
  ]);
}

function formatEnonceA(exercice: ExerciceIneqA): string {
  const bl = baseLatexPourExposant(exercice.base);
  return `${bl}^{${formatExposantLineaireLatex(exercice.m, exercice.n)}} ${symboleComparateurLatex(exercice.comparateur)} ${formatValeurExacteLatex(exercice.valeurNumerique)}`;
}

function consigneA(phase: "aReconnaitre" | "aResoudre"): FragmentConsigne[] {
  if (phase === "aReconnaitre") return [txt("Réécris le second membre comme une puissance de la MÊME base que le premier membre — donne l'exposant cible.")];
  return [txt("À partir de l'exposant CORRECT de l'étape précédente, résous l'inéquation en x — attention au sens selon que la base est supérieure ou inférieure à 1.")];
}

function aideA1(phase: "aReconnaitre" | "aResoudre"): AideAvecLatex {
  if (phase === "aReconnaitre") return { texte: "Toute valeur numérique de l'inéquation doit être réécrite comme une puissance de la même base que le membre de gauche.", latex: null };
  return {
    texte: "Rappel : si la base est supérieure à 1, le sens de l'inégalité est conservé en passant aux exposants ; si elle est inférieure à 1, le sens s'inverse.",
    latex: null,
  };
}

function aideA2(phase: "aReconnaitre" | "aResoudre", exercice: ExerciceIneqA): AideAvecLatex {
  if (phase === "aReconnaitre") {
    return { texte: "La base ici est :", latex: `${baseLatex(exercice.base)} \\quad \\left(${exercice.baseSuperieureA1 ? ">1" : "<1"}\\right)` };
  }
  const comparateurExposants = exercice.baseSuperieureA1 ? exercice.comparateur : inverserComparateur(exercice.comparateur);
  return {
    texte: `Base ${exercice.baseSuperieureA1 ? "supérieure à 1 : sens conservé" : "comprise entre 0 et 1 : sens inversé"}. L'inéquation d'exposants devient :`,
    latex: `${formatExposantLineaireLatex(exercice.m, exercice.n)} ${symboleComparateurLatex(comparateurExposants)} ${exercice.p}`,
  };
}

// ============================================================================
// Famille B — TOUJOURS ∅, 1 écran.
// ============================================================================

/** Premier membre de la famille B, `c·base^(±x)` — jamais « 1·2^x » quand c = 1. */
export function formatMembreGaucheB(exercice: ExerciceIneqB): string {
  const bl = baseLatexPourExposant(exercice.base);
  const expo = exercice.exposantNegatif ? "-x" : "x";
  return formatSommeTermesAvecCdot([{ valeur: exercice.c, suffixe: `${bl}^{${expo}}` }]);
}

function formatEnonceB(exercice: ExerciceIneqB): string {
  return `${formatMembreGaucheB(exercice)} ${symboleComparateurLatex(exercice.comparateur)} ${-exercice.k}`;
}

function consigneB(): FragmentConsigne[] {
  return [txt("Sans AUCUN calcul : cette inéquation a-t-elle au moins une solution réelle ?")];
}

function aideB1(): AideAvecLatex {
  return { texte: "Rappel fondamental : une puissance de base strictement positive reste TOUJOURS strictement positive, quel que soit l'exposant.", latex: null };
}

function aideB2(exercice: ExerciceIneqB): AideAvecLatex {
  return {
    texte: "Reformulation : un nombre STRICTEMENT POSITIF n'est jamais inférieur (ni égal) à un nombre négatif :",
    latex: `\\underbrace{${formatMembreGaucheB(exercice)}}_{>0} \\;\\not${exercice.comparateur === "<=" ? "\\leq" : "<"}\\; ${-exercice.k}`,
  };
}

// ============================================================================
// Famille C — sous-type f (TOUJOURS ℝ, 1 écran) / sous-type k (TOUJOURS ℝ, 2 écrans).
// ============================================================================

function formatEnonceCf(base: BaseIneq): string {
  const bl = baseLatex(base);
  return `x\\cdot\\left(${bl}^{x}-1\\right) \\geq 0`;
}

function consigneCf(): FragmentConsigne[] {
  return [txt("Sans résoudre d'inéquation classique : cette expression est-elle vraie pour TOUT x réel ?")];
}

function aideCf1(base: BaseIneq): AideAvecLatex {
  const b = baseLatex(base);
  return { texte: "Compare séparément le signe de x et celui du second facteur, pour x < 0, x = 0 et x > 0 (la base est supérieure à 1) :", latex: `x\\quad\\text{et}\\quad ${b}^{x}-1` };
}

function aideCf2(base: BaseIneq): AideAvecLatex {
  const b = baseLatex(base);
  return {
    texte: "Pour x < 0, les deux facteurs sont négatifs ; pour x > 0, ils sont positifs ; en x = 0, le produit est nul :",
    latex: `x<0 : ${b}^{x}<1 \\Rightarrow ${b}^{x}-1<0\\qquad x>0 : ${b}^{x}-1>0\\qquad x=0 : x\\cdot\\left(${b}^{x}-1\\right)=0`,
  };
}

export function formatGCkLatex(exercice: ExerciceIneqCk, facteur: number): string {
  return formatSommeTermes([
    { valeur: facteur * exercice.a, suffixe: "x^2" },
    { valeur: facteur * exercice.b, suffixe: "x" },
    { valeur: facteur * exercice.c, suffixe: "" },
  ]);
}

function formatEnonceCk(exercice: ExerciceIneqCk): string {
  const b1 = baseLatexPourExposant(exercice.base1);
  const b2 = baseLatexPourExposant(exercice.base2);
  return `${b1}^{${formatGCkLatex(exercice, 1)}} ${symboleComparateurLatex(exercice.comparateur)} ${b2}^{${formatGCkLatex(exercice, 2)}}`;
}

function consigneCk(phase: "ckRegrouper" | "ckConclure", exercice: ExerciceIneqCk): FragmentConsigne[] {
  if (phase === "ckRegrouper")
    return [
      txt("On note "),
      ltx(`g(x)=${formatGCkLatex(exercice, 1)}`),
      txt(". Divise les deux membres par "),
      ltx(`${baseLatexPourExposant(exercice.base2)}^{2g(x)}`),
      txt(", puis écris le membre de gauche comme une seule puissance d'exposant "),
      ltx("g(x)"),
      txt(" : donne l'inéquation obtenue, comparée à 1."),
    ];
  return [txt("À partir du regroupement CORRECT de l'étape précédente : cette inéquation est-elle vraie pour TOUT x réel ?")];
}

function aideCk1(phase: "ckRegrouper" | "ckConclure", _exercice: ExerciceIneqCk): AideAvecLatex {
  if (phase === "ckRegrouper") return { texte: "Rappel : diviser les deux membres par un nombre strictement positif ne change jamais le sens de l'inégalité ; ici :", latex: `${baseLatexPourExposant(_exercice.base2)}^{2g(x)}>0` };
  return { texte: "Rappel : le rapport des bases est-il supérieur ou inférieur à 1 ? Quel sens en résulte pour l'inégalité sur g(x) ?", latex: `\\dfrac{${baseLatex(_exercice.base1)}}{${baseLatex(_exercice.base2)}^{2}}` };
}

function aideCk2(phase: "ckRegrouper" | "ckConclure", exercice: ExerciceIneqCk): AideAvecLatex {
  if (phase === "ckRegrouper") {
    return { texte: "Membre de gauche après division :", latex: `\\left(\\dfrac{${baseLatex(exercice.base1)}}{${baseLatex(exercice.base2)}^2}\\right)^{${formatGCkLatex(exercice, 1)}}` };
  }
  const bCarre = exercice.b < 0 ? `(${exercice.b})^{2}` : `${exercice.b}^{2}`;
  return { texte: "g(x) est un polynôme du second degré à coefficient dominant positif ET à discriminant NÉGATIF — donc toujours strictement positif :", latex: `\\Delta = ${bCarre}-4\\cdot ${exercice.a}\\cdot ${exercice.c} < 0` };
}

function formatEnonceC(exercice: ExerciceIneqC): string {
  return exercice.sousType === "f" ? formatEnonceCf(exercice.base) : formatEnonceCk(exercice);
}

function consigneC(phase: "cfReconnaitre" | "ckRegrouper" | "ckConclure", exercice: ExerciceIneqC): FragmentConsigne[] {
  return phase === "cfReconnaitre" ? consigneCf() : consigneCk(phase, exercice as ExerciceIneqCk);
}

function aideC1(phase: "cfReconnaitre" | "ckRegrouper" | "ckConclure", exercice: ExerciceIneqC): AideAvecLatex {
  if (phase === "cfReconnaitre") return aideCf1((exercice as ExerciceIneqCf).base);
  return aideCk1(phase, exercice as ExerciceIneqCk);
}

function aideC2(phase: "cfReconnaitre" | "ckRegrouper" | "ckConclure", exercice: ExerciceIneqC): AideAvecLatex {
  if (phase === "cfReconnaitre") return aideCf2((exercice as ExerciceIneqCf).base);
  return aideCk2(phase, exercice as ExerciceIneqCk);
}

// ============================================================================
// Famille D — sous-type constant (2 écrans) / variable (3 écrans).
// ============================================================================

export function formatPremierFacteurLatex(pf: PremierFacteurD): string {
  const bl = baseLatexPourExposant(pf.base);
  const puissance = `${bl}^{${formatExposantLineaireLatex(pf.m, pf.n)}}`;
  if (pf.positif) return formatSommeTermesAvecCdot([{ valeur: pf.c, suffixe: puissance }]);
  return `-${formatSommeTermesAvecCdot([{ valeur: pf.c, suffixe: puissance }])}-${pf.d}`;
}

export function formatSecondFacteurConstantLatex(sf: SecondFacteurDConstant): string {
  if (sf.type === "quadratique") return `${formatSommeTermes([{ valeur: sf.d, suffixe: "x^2" }])}-${sf.e}`;
  const bl = baseLatexPourExposant(sf.base);
  return `${bl}^{x}-${sf.k}`;
}

function formatEnonceDConstant(exercice: ExerciceIneqDConstant): string {
  const p1 = formatPremierFacteurLatex(exercice.premierFacteur);
  const p2 = formatSecondFacteurConstantLatex(exercice.secondFacteur);
  return `\\left(${p1}\\right)\\cdot\\left(${p2}\\right) ${symboleComparateurLatex(exercice.comparateur)} 0`;
}

function consigneDConstant(phase: "dConstantSigne" | "dConstantResoudre"): FragmentConsigne[] {
  if (phase === "dConstantSigne") return [txt("Le premier facteur a un signe CONSTANT, quel que soit x — lequel ?")];
  return [txt("À partir du signe CORRECT de l'étape précédente, résous l'inéquation sur le SECOND facteur seul — avec le bon sens (conservé si le 1er facteur est positif, inversé s'il est négatif).")];
}

function aideDConstant1(phase: "dConstantSigne" | "dConstantResoudre"): AideAvecLatex {
  if (phase === "dConstantSigne") return { texte: "Une puissance de base strictement positive est toujours strictement positive — regarde uniquement le signe du coefficient/de la constante qui l'entoure.", latex: null };
  return { texte: "Rappel : le signe du 1er facteur détermine si le sens de l'inéquation sur le second facteur doit être conservé ou inversé.", latex: null };
}

function aideDConstant2(phase: "dConstantSigne" | "dConstantResoudre", exercice: ExerciceIneqDConstant): AideAvecLatex {
  if (phase === "dConstantSigne") {
    const p1 = formatPremierFacteurLatex(exercice.premierFacteur);
    return { texte: "Premier facteur :", latex: `\\underbrace{${p1}}_{${exercice.premierFacteur.positif ? ">0" : "<0"}}` };
  }
  const sensCorrige = exercice.premierFacteur.positif ? exercice.comparateur : inverserComparateur(exercice.comparateur);
  const p2 = formatSecondFacteurConstantLatex(exercice.secondFacteur);
  return { texte: "Inéquation sur le second facteur seul (sens déjà corrigé) :", latex: `${p2} ${symboleComparateurLatex(sensCorrige)} 0` };
}

/** Facteur à un seul zéro — jamais « 0-x » ni « -\left(x\right) » quand le zéro vaut 0 (« -x »). */
export function formatFacteurUnZeroLatex(f: FacteurUnZero): string {
  if (f.type === "lineaire") return f.pente === 1 ? formatXMoinsZero(f.zero) : f.zero === 0 ? "-x" : `${f.zero}-x`;
  const bl = baseLatexPourExposant(f.base);
  const argExpo = f.sgn === 1 ? formatXMoinsZero(f.zero) : f.zero === 0 ? "-x" : `-\\left(${formatXMoinsZero(f.zero)}\\right)`;
  return `${formatSommeTermesAvecCdot([{ valeur: f.c, suffixe: `${bl}^{${argExpo}}` }])}-${f.c}`;
}

function formatEnonceDVariable(exercice: ExerciceIneqDVariable): string {
  const f1 = formatFacteurUnZeroLatex(exercice.facteur1);
  const f2 = formatFacteurUnZeroLatex(exercice.facteur2);
  return `\\left(${f1}\\right)\\cdot\\left(${f2}\\right) ${symboleComparateurLatex(exercice.comparateur)} 0`;
}

function consigneDVariable(phase: "dVariableSigne1" | "dVariableSigne2" | "dVariableTableau"): FragmentConsigne[] {
  if (phase === "dVariableSigne1") return [txt("Étudie le signe du PREMIER facteur : en quel point s'annule-t-il, et quel est le sens du changement de signe ?")];
  if (phase === "dVariableSigne2") return [txt("Étudie le signe du SECOND facteur : en quel point s'annule-t-il, et quel est le sens du changement de signe ?")];
  return [txt("À partir des 2 signes CORRECTS des étapes précédentes, construis le tableau de signes du produit et donne l'ensemble-solution.")];
}

function aideDVariable1(phase: "dVariableSigne1" | "dVariableSigne2" | "dVariableTableau"): AideAvecLatex {
  if (phase === "dVariableTableau") return { texte: "Rappel : la règle des signes d'un produit — (+)×(+)=+, (−)×(−)=+, (+)×(−)=(−)×(+)=−.", latex: "(+)\\times(+)=+\\qquad(-)\\times(-)=+\\qquad(+)\\times(-)=(-)\\times(+)=-" };
  return { texte: "Résous l'équation \"facteur = 0\" pour trouver le zéro, puis teste le signe juste avant et juste après ce zéro.", latex: "\\text{facteur}=0" };
}

function signeAvantApres(sens: DirectionSigne, avant: boolean): string {
  if (sens === "negatif_puis_positif") return avant ? "-" : "+";
  return avant ? "+" : "-";
}

function aideDVariable2(phase: "dVariableSigne1" | "dVariableSigne2" | "dVariableTableau", exercice: ExerciceIneqDVariable): AideAvecLatex {
  if (phase === "dVariableSigne1") return { texte: "Le premier facteur s'annule en :", latex: `x = ${exercice.zero1}` };
  if (phase === "dVariableSigne2") return { texte: "Le second facteur s'annule en :", latex: `x = ${exercice.zero2}` };
  return {
    texte: "Signe de chaque facteur, séparément (le produit reste à combiner toi-même) :",
    latex: `\\begin{gathered} \\text{facteur 1 : } ${signeAvantApres(exercice.sens1, true)} \\text{ avant } ${exercice.zero1}\\text{, } ${signeAvantApres(exercice.sens1, false)} \\text{ après} \\\\ \\text{facteur 2 : } ${signeAvantApres(exercice.sens2, true)} \\text{ avant } ${exercice.zero2}\\text{, } ${signeAvantApres(exercice.sens2, false)} \\text{ après} \\end{gathered}`,
  };
}

function formatEnonceD(exercice: ExerciceIneqD): string {
  return exercice.sousType === "constant" ? formatEnonceDConstant(exercice) : formatEnonceDVariable(exercice);
}

function consigneD(phase: PhaseInequationExponentielle, exercice: ExerciceIneqD): FragmentConsigne[] {
  if (exercice.sousType === "constant") return consigneDConstant(phase as "dConstantSigne" | "dConstantResoudre");
  return consigneDVariable(phase as "dVariableSigne1" | "dVariableSigne2" | "dVariableTableau");
}

function aideD1(phase: PhaseInequationExponentielle, exercice: ExerciceIneqD): AideAvecLatex {
  if (exercice.sousType === "constant") return aideDConstant1(phase as "dConstantSigne" | "dConstantResoudre");
  return aideDVariable1(phase as "dVariableSigne1" | "dVariableSigne2" | "dVariableTableau");
}

function aideD2(phase: PhaseInequationExponentielle, exercice: ExerciceIneqD): AideAvecLatex {
  if (exercice.sousType === "constant") return aideDConstant2(phase as "dConstantSigne" | "dConstantResoudre", exercice);
  return aideDVariable2(phase as "dVariableSigne1" | "dVariableSigne2" | "dVariableTableau", exercice);
}

// ============================================================================
// Famille E — 2 écrans.
// ============================================================================

function formatEnonceE(exercice: ExerciceIneqE): string {
  const b1 = baseLatexPourExposant(exercice.base1);
  const b2 = baseLatexPourExposant(exercice.base2);
  const expo = formatExposantLineaireLatex(exercice.m, exercice.n);
  return `${b1}^{${expo}} ${symboleComparateurLatex(exercice.comparateur)} ${b2}^{${expo}}`;
}

function consigneE(phase: "eRegrouper" | "eResoudre", exercice: ExerciceIneqE): FragmentConsigne[] {
  if (phase === "eRegrouper")
    return [
      txt("Divise les deux membres par "),
      ltx(`${baseLatexPourExposant(exercice.base2)}^{${formatExposantLineaireLatex(exercice.m, exercice.n)}}`),
      txt(", puis écris le membre de gauche comme une seule puissance : donne l'inéquation obtenue, comparée à 1."),
    ];
  return [txt("À partir du regroupement CORRECT de l'étape précédente, résous — attention au sens selon que le rapport des bases est supérieur ou inférieur à 1.")];
}

function aideE1(phase: "eRegrouper" | "eResoudre", exercice: ExerciceIneqE): AideAvecLatex {
  if (phase === "eRegrouper") return { texte: "Rappel : diviser les deux membres par un nombre strictement positif ne change jamais le sens ; ici :", latex: `${baseLatexPourExposant(exercice.base2)}^{${formatExposantLineaireLatex(exercice.m, exercice.n)}}>0` };
  return { texte: "Rappel : si la base est supérieure à 1, le sens est conservé ; si elle est comprise entre 0 et 1, il s'inverse. Ici, la base est le rapport :", latex: `\\dfrac{${baseLatex(exercice.base1)}}{${baseLatex(exercice.base2)}}` };
}

function aideE2(phase: "eRegrouper" | "eResoudre", exercice: ExerciceIneqE): AideAvecLatex {
  if (phase === "eRegrouper") {
    return { texte: "Membre de gauche après division :", latex: `\\left(\\dfrac{${baseLatex(exercice.base1)}}{${baseLatex(exercice.base2)}}\\right)^{${formatExposantLineaireLatex(exercice.m, exercice.n)}}` };
  }
  const comparateurExposants = exercice.ratioSuperieurA1 ? exercice.comparateur : inverserComparateur(exercice.comparateur);
  return {
    texte: `Rapport des bases ${exercice.ratioSuperieurA1 ? "supérieur à 1 : sens conservé" : "compris entre 0 et 1 : sens inversé"}. L'inéquation d'exposants devient :`,
    latex: `${formatExposantLineaireLatex(exercice.m, exercice.n)} ${symboleComparateurLatex(comparateurExposants)} 0`,
  };
}

// ============================================================================
// Dispatch public.
// ============================================================================

/** Bloc de données (l'inéquation) affiché sur CHAQUE écran de l'exercice (spec : "consigne
 * générale et bloc de données... redondants sur chaque écran"). */
export function formatEnonceLatex(exercice: ExerciceInequationExponentielle): string {
  switch (exercice.famille) {
    case "A":
      return formatEnonceA(exercice);
    case "B":
      return formatEnonceB(exercice);
    case "C":
      return formatEnonceC(exercice);
    case "D":
      return formatEnonceD(exercice);
    case "E":
      return formatEnonceE(exercice);
  }
}

export function consigneEcran(phase: PhaseInequationExponentielle, exercice: ExerciceInequationExponentielle): FragmentConsigne[] {
  switch (exercice.famille) {
    case "A":
      return consigneA(phase as "aReconnaitre" | "aResoudre");
    case "B":
      return consigneB();
    case "C":
      return consigneC(phase as "cfReconnaitre" | "ckRegrouper" | "ckConclure", exercice);
    case "D":
      return consigneD(phase, exercice);
    case "E":
      return consigneE(phase as "eRegrouper" | "eResoudre", exercice);
  }
}

export function aideNiveau1(phase: PhaseInequationExponentielle, exercice: ExerciceInequationExponentielle): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideA1(phase as "aReconnaitre" | "aResoudre");
    case "B":
      return aideB1();
    case "C":
      return aideC1(phase as "cfReconnaitre" | "ckRegrouper" | "ckConclure", exercice);
    case "D":
      return aideD1(phase, exercice);
    case "E":
      return aideE1(phase as "eRegrouper" | "eResoudre", exercice);
  }
}

export function aideNiveau2(phase: PhaseInequationExponentielle, exercice: ExerciceInequationExponentielle): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideA2(phase as "aReconnaitre" | "aResoudre", exercice);
    case "B":
      return aideB2(exercice);
    case "C":
      return aideC2(phase as "cfReconnaitre" | "ckRegrouper" | "ckConclure", exercice);
    case "D":
      return aideD2(phase, exercice);
    case "E":
      return aideE2(phase as "eRegrouper" | "eResoudre", exercice);
  }
}

// ============================================================================
// Bloc "état actuel" (rappel accumulé des réponses déjà CONFIRMÉES de la même famille) — correctif
// de l'audit "état actuel cumulatif" qui avait raté ce générateur (aucun de ses 4 composants
// d'écran ne référençait `etatActuel`). Même patron que `formatExponentiellesProblemes.ts::
// etatActuelA/B/C` (6gen12, même chapitre) et `formatPointsDroitesRemarquablesTriangle.ts` :
// `null` sur le 1er écran de CHAQUE famille (rien à rappeler), sinon un tableau de fragments LaTeX
// ACCUMULÉS depuis ce 1er écran — jamais seulement l'écran immédiatement précédent. Dérivé
// UNIQUEMENT des champs déjà figés à la génération (mêmes valeurs que `contenuRecapPhase`),
// jamais de la saisie élève.
// ============================================================================

/** Famille A — 2 écrans : aReconnaitre (rien à rappeler) → aResoudre (rappelle p). */
function etatActuelA(exercice: ExerciceIneqA, phase: "aReconnaitre" | "aResoudre"): string[] | null {
  if (phase === "aReconnaitre") return null;
  return [`\\text{Exposant cible confirmé : }p=${exercice.p}`];
}

/** Famille C, sous-type k — 2 écrans : ckRegrouper (rien à rappeler) → ckConclure (rappelle le
 * regroupement). Sous-type f reste 1 seul écran, jamais de rappel. */
function etatActuelCk(exercice: ExerciceIneqCk, phase: "ckRegrouper" | "ckConclure"): string[] | null {
  if (phase === "ckRegrouper") return null;
  const latex = `\\left(\\dfrac{${baseLatex(exercice.base1)}}{${baseLatex(exercice.base2)}^2}\\right)^{${formatGCkLatex(exercice, 1)}} ${symboleComparateurLatex(exercice.comparateur)} 1`;
  return [`\\text{Regroupement confirmé : }${latex}`];
}

function etatActuelC(exercice: ExerciceIneqC, phase: "cfReconnaitre" | "ckRegrouper" | "ckConclure"): string[] | null {
  if (exercice.sousType === "f") return null;
  return etatActuelCk(exercice, phase as "ckRegrouper" | "ckConclure");
}

/** Famille D, sous-type constant — 2 écrans : dConstantSigne (rien à rappeler) →
 * dConstantResoudre (rappelle le signe du 1er facteur). */
function etatActuelDConstant(exercice: ExerciceIneqDConstant, phase: "dConstantSigne" | "dConstantResoudre"): string[] | null {
  if (phase === "dConstantSigne") return null;
  return [`\\text{Signe confirmé (1er facteur) : toujours ${exercice.premierFacteur.positif ? "positif" : "négatif"}}`];
}

/** Famille D, sous-type variable — 3 écrans, ACCUMULE : dVariableSigne1 (rien à rappeler) →
 * dVariableSigne2 (rappelle le signe du facteur 1) → dVariableTableau (rappelle les 2 signes). */
function etatActuelDVariable(exercice: ExerciceIneqDVariable, phase: "dVariableSigne1" | "dVariableSigne2" | "dVariableTableau"): string[] | null {
  if (phase === "dVariableSigne1") return null;
  const facteur1 = `\\text{Facteur 1 confirmé : zéro en }x=${exercice.zero1}\\text{, }${texteSensLisible(exercice.sens1)}`;
  if (phase === "dVariableSigne2") return [facteur1];
  const facteur2 = `\\text{Facteur 2 confirmé : zéro en }x=${exercice.zero2}\\text{, }${texteSensLisible(exercice.sens2)}`;
  return [facteur1, facteur2];
}

function etatActuelD(exercice: ExerciceIneqD, phase: PhaseInequationExponentielle): string[] | null {
  if (exercice.sousType === "constant") return etatActuelDConstant(exercice, phase as "dConstantSigne" | "dConstantResoudre");
  return etatActuelDVariable(exercice, phase as "dVariableSigne1" | "dVariableSigne2" | "dVariableTableau");
}

/** Famille E — 2 écrans : eRegrouper (rien à rappeler) → eResoudre (rappelle le regroupement). */
function etatActuelE(exercice: ExerciceIneqE, phase: "eRegrouper" | "eResoudre"): string[] | null {
  if (phase === "eRegrouper") return null;
  const latex = `\\left(\\dfrac{${baseLatex(exercice.base1)}}{${baseLatex(exercice.base2)}}\\right)^{${formatExposantLineaireLatex(exercice.m, exercice.n)}} ${symboleComparateurLatex(exercice.comparateur)} 1`;
  return [`\\text{Regroupement confirmé : }${latex}`];
}

/**
 * Rappel accumulé, un fragment LaTeX par écran DÉJÀ CONFIRMÉ de la famille courante — `null` sur le
 * 1er écran de chaque famille (familles B et C sous-type f : TOUJOURS `null`, 1 seul écran).
 * `App6gen10.tsx` passe `etatActuel(exercice, phase)` à chacun des 4 composants d'écran.
 */
export function etatActuel(exercice: ExerciceInequationExponentielle, phase: PhaseInequationExponentielle): string[] | null {
  switch (exercice.famille) {
    case "A":
      return etatActuelA(exercice, phase as "aReconnaitre" | "aResoudre");
    case "B":
      return null;
    case "C":
      return etatActuelC(exercice, phase as "cfReconnaitre" | "ckRegrouper" | "ckConclure");
    case "D":
      return etatActuelD(exercice, phase);
    case "E":
      return etatActuelE(exercice, phase as "eRegrouper" | "eResoudre");
  }
}

// ============================================================================
// Récapitulatif final (`ResultatPanelInequationExponentielle.tsx`) — un libellé + un contenu
// PAR ÉCRAN RÉELLEMENT TRAVERSÉ (jamais un score fractionnaire `X/100`, voir CLAUDE.md,
// "Récapitulatif final à plat, coloré"). `latex`/`texte` jamais mêlés à l'intérieur d'un même
// champ (même motif `AideAvecLatex` que le reste du fichier) — le composant choisit lequel rendre.
// ============================================================================

export const LIBELLE_PHASE_INEQ: Record<PhaseInequationExponentielle, string> = {
  aReconnaitre: "Exposant cible",
  aResoudre: "Résolution (ensemble-solution)",
  bReconnaitre: "Reconnaissance",
  cfReconnaitre: "Reconnaissance",
  ckRegrouper: "Regroupement",
  ckConclure: "Conclusion",
  dConstantSigne: "Signe du 1er facteur",
  dConstantResoudre: "Résolution (ensemble-solution)",
  dVariableSigne1: "Signe du 1er facteur",
  dVariableSigne2: "Signe du 2e facteur",
  dVariableTableau: "Tableau de signes (ensemble-solution)",
  eRegrouper: "Regroupement",
  eResoudre: "Résolution (ensemble-solution)",
};

export interface ContenuRecap {
  texte: string | null;
  latex: string | null;
}

export function texteSensLisible(sens: DirectionSigne): string {
  return sens === "negatif_puis_positif" ? "Négatif avant, positif après" : "Positif avant, négatif après";
}

/** Contenu affiché par la `LigneRecap` d'un écran donné — LA RÉPONSE RÉELLEMENT ATTENDUE de cet
 * écran, jamais recalculée depuis un score (voir CLAUDE.md). Dérivée UNIQUEMENT des champs déjà
 * figés à la génération (`solutionEcranX`, `p`, `zeroX`/`sensX`...), jamais de la saisie élève. */
export function contenuRecapPhase(exercice: ExerciceInequationExponentielle, phase: PhaseInequationExponentielle): ContenuRecap {
  switch (exercice.famille) {
    case "A":
      if (phase === "aReconnaitre") return { texte: null, latex: `p=${exercice.p}` };
      return { texte: null, latex: formatEnsembleReelLatex(exercice.solutionEcran2) };
    case "B":
      return { texte: "∅ — Aucune solution", latex: null };
    case "C":
      if (exercice.sousType === "f") return { texte: "Vraie pour tout x réel (ℝ)", latex: null };
      if (phase === "ckRegrouper") {
        const latex = `\\left(\\dfrac{${baseLatex(exercice.base1)}}{${baseLatex(exercice.base2)}^2}\\right)^{${formatGCkLatex(exercice, 1)}} ${symboleComparateurLatex(exercice.comparateur)} 1`;
        return { texte: null, latex };
      }
      return { texte: "Vraie pour tout x réel (ℝ)", latex: null };
    case "D":
      if (exercice.sousType === "constant") {
        if (phase === "dConstantSigne") return { texte: exercice.premierFacteur.positif ? "Toujours positif" : "Toujours négatif", latex: null };
        return { texte: null, latex: formatEnsembleReelLatex(exercice.solutionEcran2) };
      }
      if (phase === "dVariableSigne1") return { texte: `${texteSensLisible(exercice.sens1)} (zéro en x = ${String(exercice.zero1).replace("-", "−")})`, latex: null };
      if (phase === "dVariableSigne2") return { texte: `${texteSensLisible(exercice.sens2)} (zéro en x = ${String(exercice.zero2).replace("-", "−")})`, latex: null };
      return { texte: null, latex: formatEnsembleReelLatex(exercice.solutionEcran3) };
    case "E": {
      if (phase === "eRegrouper") {
        const latex = `\\left(\\dfrac{${baseLatex(exercice.base1)}}{${baseLatex(exercice.base2)}}\\right)^{${formatExposantLineaireLatex(exercice.m, exercice.n)}} ${symboleComparateurLatex(exercice.comparateur)} 1`;
        return { texte: null, latex };
      }
      return { texte: null, latex: formatEnsembleReelLatex(exercice.solutionEcran2) };
    }
  }
}

