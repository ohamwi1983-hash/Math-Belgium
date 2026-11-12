import type { ValeurExacte } from "../core6e/cyclometrique.types";
import type { ConditionD, ExerciceFormeTrigA, ExerciceFormeTrigB, ExerciceFormeTrigC, ExerciceFormeTrigD, ExerciceFormeTrigE, ExerciceFormeTrigonometrique, FacteurComplexe } from "../core6e/formeTrigonometrique.types";
import { pgcd } from "../generateurs6e/calculPrimitives/aleatoire";
import type { PhaseFormeTrigonometrique } from "../moteur6e/typesFormeTrigonometrique";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage LaTeX pour `6gen37`. Dispatch sur
 * `exercice.famille` PUIS `phase`, mirroir `formatNombresComplexes.ts` (6gen34), jamais importé par
 * un autre générateur (chaque générateur reste indépendant — CLAUDE.md).
 *
 * **Vigilance signe orphelin / groupe LaTeX vide** (bug déjà rencontré et corrigé sur 6gen23/6gen26/
 * 6gen34, documenté par CLAUDE.md) — PARTICULIÈREMENT pertinent ici : ce générateur affiche
 * beaucoup de "a+bi"/"r(\cos θ+i\sin θ)"/"r·e^{iθ}" par session, chaque terme potentiellement
 * négatif. `assembleAPlusBI`/`assembleValeurExacteAPlusBI` ci-dessous sont les 2 SEULES fonctions
 * qui assemblent un "a+bi" — assemblent TOUJOURS signe+magnitude ENSEMBLE (jamais un signe bare),
 * jamais appelées en dehors de ce module. Couverture de régression : `formatFormeTrigonometrique.
 * test.ts`, "signe orphelin", scanne le LaTeX rendu sur de nombreux tirages aléatoires des 5
 * familles à la recherche d'un `++`/`+-`/groupe vide.
 */

export type TypeChamp = "texte" | "choix";

export interface OptionChoix {
  valeur: string;
  label: string;
}

export interface ChampDef {
  type: TypeChamp;
  label: string;
  placeholder?: string;
  options?: OptionChoix[];
}

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

/** Texte brut mêlé à du LaTeX inline court — même contrat que `ui/formatEquationDroite.ts`/
 * `ui6e/formatProprietesLogarithme.ts`, rendu via `components/RenduFragments.tsx`. */
export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

function texte(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}
function latex(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
}

const AUCUNE_AIDE: AideAvecLatex = { texte: "", latex: null };

/** Placeholders hors de l'espace des tirages (audit 6e ch. 5, point 11) : r ∈ {1 ; …} sans jamais 5,
 * aucun argument tiré ne vaut 2π/5, aucun module tiré ne vaut 5√3 — jamais une réponse possible,
 * jamais de « * » ni de point décimal. */
const PH_MODULE = "ex : 5";
const PH_MODULE_RADICAL = "ex : 5sqrt(3)";
const PH_ANGLE = "ex : 2pi/5";

// ============================================================================
// Assemblage "a+bi" — voir en-tête de fichier.
// ============================================================================

function estZeroExact(v: ValeurExacte): boolean {
  return v.numerique === 0;
}
function estNegatifExact(v: ValeurExacte): boolean {
  return v.latex.startsWith("-");
}
function magnitudeExacte(v: ValeurExacte): string {
  return estNegatifExact(v) ? v.latex.slice(1) : v.latex;
}

/** Assemble `a+bi` depuis 2 `ValeurExacte` (peuvent être irrationnelles, ex. `√2`) — famille A/B/D
 * (données uniquement, jamais un champ à taper — voir en-tête `core6e/formeTrigonometrique.types.ts`
 * pour la raison). Signe+magnitude TOUJOURS ensemble (voir en-tête de fichier). */
export function assembleValeurExacteAPlusBI(a: ValeurExacte, b: ValeurExacte): string {
  const aZero = estZeroExact(a);
  const bZero = estZeroExact(b);
  if (aZero && bZero) return "0";
  const aTexte = aZero ? "" : `${estNegatifExact(a) ? "-" : ""}${magnitudeExacte(a)}`;
  if (bZero) return aTexte;
  const bMagnitude = magnitudeExacte(b);
  const bTexteMagnitude = bMagnitude === "1" ? "" : bMagnitude;
  if (aZero) return `${estNegatifExact(b) ? "-" : ""}${bTexteMagnitude}i`;
  return `${aTexte}${estNegatifExact(b) ? "-" : "+"}${bTexteMagnitude}i`;
}

/** Assemble `a+bi` depuis 2 entiers exacts — familles C/E (résultat final TOUJOURS rationnel, voir
 * même en-tête). Jamais importé de `formatNombresComplexes.ts` (6gen34) — "jamais importé par un
 * autre générateur", voir son en-tête ; réimplication délibérée, même logique. */
export function assembleAPlusBI(a: number, b: number): string {
  if (a === 0 && b === 0) return "0";
  const aTexte = a === 0 ? "" : `${a}`;
  if (b === 0) return aTexte;
  const bSigne = b < 0 ? "-" : "+";
  const bMagnitude = Math.abs(b) === 1 ? "" : `${Math.abs(b)}`;
  if (a === 0) return `${b < 0 ? "-" : ""}${bMagnitude}i`;
  return `${aTexte}${bSigne}${bMagnitude}i`;
}

function fractionSimpleLatex(num: number, den: number): string {
  if (num === 0) return "0";
  const g = pgcd(Math.abs(num), Math.abs(den));
  const n = num / g;
  const d = den / g;
  return d === 1 ? `${n}` : `\\frac{${n}}{${d}}`;
}

/** Coefficient `r` d'un `FacteurComplexe` — jamais "1" nu devant `(\cos...+i\sin...)`/`e^{i\theta}`. */
function prefixeModule(r: number): string {
  return r === 1 ? "" : `${r}`;
}
function formatFacteurAPlusBI(f: FacteurComplexe): string {
  return assembleValeurExacteAPlusBI(f.a, f.b);
}
function formatFacteurTrig(f: FacteurComplexe): string {
  return `${prefixeModule(f.r)}\\left(\\cos(${f.angle.latex})+i\\sin(${f.angle.latex})\\right)`;
}
/**
 * `e^{i\theta}` — jamais une simple concaténation `"i"+angle.latex` : quand `angle.latex` est déjà
 * signé négativement (ex. `"-\frac{\pi}{6}"`), `"i-\frac{\pi}{6}"` se lirait "i MOINS π/6" (signe
 * orphelin déguisé en soustraction, PAS en produit i·θ — bug trouvé par inspection visuelle réelle
 * d'un écran récapitulatif, voir `docs/historique-6e.md`) au lieu de "i fois (-π/6)". Convention
 * standard adoptée : le signe négatif est ramené DEVANT le `i` (`e^{-i\frac{\pi}{6}}`), jamais laissé
 * coller au `i` par la droite.
 */
function formatExpIAngle(angleLatex: string): string {
  return angleLatex.startsWith("-") ? `-i${angleLatex.slice(1)}` : `i${angleLatex}`;
}
function formatFacteurExp(f: FacteurComplexe): string {
  return `${prefixeModule(f.r)}e^{${formatExpIAngle(f.angle.latex)}}`;
}

/** Module d'un point d'arrivée de la famille C, dont l'angle est de type axe (`q∈{1,2}`, `r` entier)
 * ou quart (`q=4`, `r=k√2`) — voir en-tête `generateurs6e/formeTrigonometrique/familleC.ts`. */
function latexModuleDepuisAngle(r: number, angleQ: number): string {
  if (angleQ === 4) {
    const k = Math.round(r / Math.SQRT2);
    return k === 1 ? "\\sqrt{2}" : `${k}\\sqrt{2}`;
  }
  return `${Math.round(r)}`;
}

/** Quadrant du point (a ; b), en LaTeX (aides en LaTeX — audit 6e ch. 5, point 12). */
function quadrantLatex(a: number, b: number): string {
  if (a > 0 && b > 0) return "\\text{quadrant } 1\\ (a>0,\\ b>0)";
  if (a < 0 && b > 0) return "\\text{quadrant } 2\\ (a<0,\\ b>0)";
  if (a < 0 && b < 0) return "\\text{quadrant } 3\\ (a<0,\\ b<0)";
  if (a > 0 && b < 0) return "\\text{quadrant } 4\\ (a>0,\\ b<0)";
  return "\\text{sur un axe } (a=0\\text{ ou }b=0)";
}

/** cos et sin EXACTS d'un angle de la famille de π/4, π/6 ou π/3 (aide 2 de la famille E). */
function cosSinRemarquableLatex(angle: { q: number; numerique: number }): { cos: string; sin: string } {
  const signe = (v: number) => (v < 0 ? "-" : "");
  const c = Math.cos(angle.numerique);
  const sn = Math.sin(angle.numerique);
  if (angle.q === 4) return { cos: `${signe(c)}\\frac{\\sqrt{2}}{2}`, sin: `${signe(sn)}\\frac{\\sqrt{2}}{2}` };
  if (angle.q === 6) return { cos: `${signe(c)}\\frac{\\sqrt{3}}{2}`, sin: `${signe(sn)}\\frac{1}{2}` };
  return { cos: `${signe(c)}\\frac{1}{2}`, sin: `${signe(sn)}\\frac{\\sqrt{3}}{2}` };
}

const LIBELLE_CONDITION: Record<ConditionD, string> = {
  reelPositif: "réel positif",
  reelNegatif: "réel négatif",
  imaginairePurPositif: "imaginaire pur positif",
  imaginairePurNegatif: "imaginaire pur négatif",
};

const CIBLE_LATEX_CONDITION: Record<ConditionD, string> = {
  reelPositif: "",
  reelNegatif: "\\pi+",
  imaginairePurPositif: "\\frac{\\pi}{2}+",
  imaginairePurNegatif: "-\\frac{\\pi}{2}+",
};

/** Condition sur nθ écrite « nθ = c + 2pπ » (audit 6e ch. 5, point 32 : la notation ≡ (mod 2π)
 * n'est pas celle du cours). Exportée pour l'écran de choix et la fiche de réponse. */
export function congruenceLatex(condition: ConditionD): string {
  return `n\\theta=${CIBLE_LATEX_CONDITION[condition]}2p\\pi`;
}

export { LIBELLE_CONDITION };

// ============================================================================
// Famille A — Forme trigonométrique/exponentielle depuis a+bi.
// ============================================================================

export function consigneGeneraleA(): FragmentConsigne[] {
  return [texte("Détermine le module r et un argument θ du nombre complexe suivant.")];
}
export function blocDonneesA(e: ExerciceFormeTrigA): string[] {
  return [`z=${assembleValeurExacteAPlusBI(e.a, e.b)}`];
}
export function consigneEcranA(phase: PhaseFormeTrigonometrique): FragmentConsigne[] {
  if (phase === "aEcran1") return [texte("Calcule le module "), latex("r=\\sqrt{a^2+b^2}"), texte(".")];
  return [texte("Calcule un argument θ de z, en radians. Attention au quadrant : "), latex("\\arctan\\frac{b}{a}"), texte(" ne convient directement que si "), latex("a>0"), texte(".")];
}
export function etatActuelA(e: ExerciceFormeTrigA, phase: PhaseFormeTrigonometrique): string[] | null {
  if (phase === "aEcran2") return [`r=${e.r}\\text{ (confirmé)}`];
  return null;
}
export function champsA(phase: PhaseFormeTrigonometrique): ChampDef[] {
  if (phase === "aEcran1") return [{ type: "texte", label: "r =", placeholder: PH_MODULE }];
  return [{ type: "texte", label: "θ =", placeholder: PH_ANGLE }];
}
export function niveauAideMaxA(phase: PhaseFormeTrigonometrique): number {
  return phase === "aEcran2" ? 2 : 0;
}
export function aideNiveau1A(phase: PhaseFormeTrigonometrique): AideAvecLatex {
  if (phase !== "aEcran2") return AUCUNE_AIDE;
  return { texte: "La formule ci-dessous ne donne directement le bon angle que dans le cas indiqué ; sinon, ajoute ou retire π selon le quadrant du point (a ; b) :", latex: "\\theta=\\arctan\\frac{b}{a}\\quad\\text{si } a>0" };
}
export function aideNiveau2A(e: ExerciceFormeTrigA, phase: PhaseFormeTrigonometrique): AideAvecLatex {
  if (phase !== "aEcran2") return AUCUNE_AIDE;
  return { texte: "Position du point (a ; b) — la valeur de θ reste à trouver :", latex: quadrantLatex(e.a.numerique, e.b.numerique) };
}

// ============================================================================
// Famille B — Module et argument via les propriétés.
// ============================================================================

export function consigneGeneraleB(): FragmentConsigne[] {
  return [texte("Utilise les propriétés du module et de l'argument (jamais un développement algébrique direct) pour calculer le résultat de l'opération.")];
}
export function blocDonneesB(e: ExerciceFormeTrigB): string[] {
  if (e.sousType === "puissance") return [`z=${formatFacteurAPlusBI(e.z)}\\quad n=${e.n}`, `z^{${e.n}}=\\,?`];
  const symbole = e.sousType === "produit" ? "\\cdot\\," : "/";
  return [`z_1=${formatFacteurAPlusBI(e.z1)}\\quad z_2=${formatFacteurAPlusBI(e.z2)}`, `z_1${symbole}z_2=\\,?`];
}
export function consigneEcranB(e: ExerciceFormeTrigB, phase: PhaseFormeTrigonometrique): FragmentConsigne[] {
  if (phase === "bEcran1") return e.sousType === "puissance" ? [texte("Calcule le module et l'argument de z.")] : [texte("Calcule le module et l'argument de chaque facteur séparément.")];
  if (e.sousType === "produit") return [texte("Combine les valeurs confirmées : multiplie les modules, additionne les arguments.")];
  if (e.sousType === "quotient") return [texte("Combine les valeurs confirmées : divise les modules, soustrais les arguments.")];
  return [texte("Combine les valeurs confirmées : élève le module à la puissance n, multiplie l'argument par n.")];
}
export function etatActuelB(e: ExerciceFormeTrigB, phase: PhaseFormeTrigonometrique): string[] | null {
  if (phase !== "bEcran2") return null;
  if (e.sousType === "puissance") return [`r=${e.z.r}\\text{, }\\theta=${e.z.angle.latex}\\text{ (confirmés)}`];
  return [`r_1=${e.z1.r}\\text{, }\\theta_1=${e.z1.angle.latex}\\text{, }r_2=${e.z2.r}\\text{, }\\theta_2=${e.z2.angle.latex}\\text{ (confirmés)}`];
}
export function champsB(e: ExerciceFormeTrigB, phase: PhaseFormeTrigonometrique): ChampDef[] {
  if (phase === "bEcran2") return [{ type: "texte", label: "r =", placeholder: PH_MODULE }, { type: "texte", label: "θ =", placeholder: PH_ANGLE }];
  if (e.sousType === "puissance") return [{ type: "texte", label: "r =", placeholder: PH_MODULE }, { type: "texte", label: "θ =", placeholder: PH_ANGLE }];
  return [
    { type: "texte", label: "r₁ =", placeholder: PH_MODULE },
    { type: "texte", label: "θ₁ =", placeholder: PH_ANGLE },
    { type: "texte", label: "r₂ =", placeholder: "ex : 7" },
    { type: "texte", label: "θ₂ =", placeholder: "ex : 3pi/5" },
  ];
}
export function niveauAideMaxB(phase: PhaseFormeTrigonometrique): number {
  return phase === "bEcran2" ? 2 : 0;
}
export function aideNiveau1B(e: ExerciceFormeTrigB, phase: PhaseFormeTrigonometrique): AideAvecLatex {
  if (phase !== "bEcran2") return AUCUNE_AIDE;
  if (e.sousType === "produit") return { texte: "Propriétés du produit :", latex: "|z_1z_2|=|z_1|\\,|z_2|\\qquad\\arg(z_1z_2)=\\arg z_1+\\arg z_2" };
  if (e.sousType === "quotient") return { texte: "Propriétés du quotient :", latex: "\\left|\\frac{z_1}{z_2}\\right|=\\frac{|z_1|}{|z_2|}\\qquad\\arg\\frac{z_1}{z_2}=\\arg z_1-\\arg z_2" };
  return { texte: "Propriétés de la puissance :", latex: "|z^n|=|z|^n\\qquad\\arg(z^n)=n\\arg z" };
}
export function aideNiveau2B(e: ExerciceFormeTrigB, phase: PhaseFormeTrigonometrique): AideAvecLatex {
  if (phase !== "bEcran2") return AUCUNE_AIDE;
  if (e.sousType === "puissance") return { texte: "Valeurs individuelles confirmées (combinaison non faite) :", latex: `r=${e.z.r}\\text{, }\\theta=${e.z.angle.latex}` };
  return { texte: "Valeurs individuelles confirmées (combinaison non faite) :", latex: `r_1=${e.z1.r}\\text{, }\\theta_1=${e.z1.angle.latex}\\text{, }r_2=${e.z2.r}\\text{, }\\theta_2=${e.z2.angle.latex}` };
}

// ============================================================================
// Famille C — Puissance via De Moivre.
// ============================================================================

export function consigneGeneraleC(): FragmentConsigne[] {
  return [texte("Calcule "), latex("z^n"), texte(" sous la forme a+bi, en passant par la forme trigonométrique (formule de De Moivre).")];
}
export function blocDonneesC(e: ExerciceFormeTrigC): string[] {
  return [`z=${assembleAPlusBI(e.a, e.b)}\\quad n=${e.n}`, `z^{${e.n}}=\\,?`];
}
export function consigneEcranC(phase: PhaseFormeTrigonometrique): FragmentConsigne[] {
  if (phase === "cEcran1") return [texte("Convertis z en forme trigonométrique/exponentielle : calcule r et θ.")];
  // Bug réel corrigé ici (audit LaTeX 6e-6h, lot H) : cette consigne contenait le texte source LaTeX
  // "(r(\cos\theta+i\sin\theta))^n=..." tel quel dans une string brute, affiché avec les backslashes
  // littéraux à l'écran au lieu d'être rendu par KaTeX.
  if (phase === "cEcran2") return [texte("Applique la formule de De Moivre : "), latex("(r(\\cos\\theta+i\\sin\\theta))^n=r^n(\\cos(n\\theta)+i\\sin(n\\theta))"), texte(", puis ramène nθ dans l'intervalle "), latex("]-\\pi\\,;\\pi]"), texte(".")];
  return [texte("Reconvertis le résultat confirmé à l'étape précédente en forme algébrique a+bi.")];
}
export function etatActuelC(e: ExerciceFormeTrigC, phase: PhaseFormeTrigonometrique): string[] | null {
  const rThetaConfirmes = `r=${latexModuleDepuisAngle(e.r, e.angle.q)}\\text{, }\\theta=${e.angle.latex}\\text{ (confirmés)}`;
  if (phase === "cEcran2") return [rThetaConfirmes];
  // Écran 3 : cumule r/θ (écran 1) ET rⁿ/nθ (écran 2), du plus ancien au plus récent — jamais
  // seulement l'écran immédiatement précédent (audit transversal "état actuel cumulatif").
  if (phase === "cEcran3") return [rThetaConfirmes, `r^n=${latexModuleDepuisAngle(e.rFinal, e.angleFinal.q)}\\text{, }n\\theta=${e.angleFinal.latex}\\text{ (confirmés)}`];
  return null;
}
export function champsC(phase: PhaseFormeTrigonometrique): ChampDef[] {
  if (phase === "cEcran1") return [{ type: "texte", label: "r =", placeholder: PH_MODULE_RADICAL }, { type: "texte", label: "θ =", placeholder: PH_ANGLE }];
  if (phase === "cEcran2") return [{ type: "texte", label: "rⁿ =", placeholder: PH_MODULE_RADICAL }, { type: "texte", label: "nθ =", placeholder: PH_ANGLE }];
  return [{ type: "texte", label: "Résultat =", placeholder: "ex : 3−2i" }];
}
export function niveauAideMaxC(phase: PhaseFormeTrigonometrique): number {
  return phase === "cEcran2" ? 2 : 0;
}
export function aideNiveau1C(phase: PhaseFormeTrigonometrique): AideAvecLatex {
  if (phase !== "cEcran2") return AUCUNE_AIDE;
  return { texte: "Formule de De Moivre :", latex: "\\left(r(\\cos\\theta+i\\sin\\theta)\\right)^n=r^n\\left(\\cos(n\\theta)+i\\sin(n\\theta)\\right)" };
}
export function aideNiveau2C(e: ExerciceFormeTrigC, phase: PhaseFormeTrigonometrique): AideAvecLatex {
  if (phase !== "cEcran2") return AUCUNE_AIDE;
  return { texte: "Produit à calculer, puis à ramener dans ]−π ; π] :", latex: `n\\theta=${e.n}\\times\\left(${e.angle.latex}\\right)` };
}

// ============================================================================
// Famille D — Trouver n selon une condition sur l'argument.
// ============================================================================

export function consigneGeneraleD(): FragmentConsigne[] {
  return [texte("Détermine les valeurs de n telles que "), latex("z^n"), texte(" vérifie la condition donnée.")];
}
export function blocDonneesD(e: ExerciceFormeTrigD): string[] {
  return [`z=${formatFacteurAPlusBI(e.z)}`, `z^n\\text{ doit être }\\textbf{${LIBELLE_CONDITION[e.condition]}}`];
}
export function consigneEcranD(phase: PhaseFormeTrigonometrique): FragmentConsigne[] {
  if (phase === "dEcran1") return [texte("Détermine l'argument θ de z.")];
  if (phase === "dEcran2") return [texte("Choisis l'équation sur nθ qui traduit la condition demandée ("), latex("p\\in\\mathbb{Z}"), texte(").")];
  return [texte("Résous l'équation confirmée : écris les solutions sous la forme "), latex("n=k+m\\,p"), texte(", avec "), latex("p\\in\\mathbb{Z}"), texte(" et m > 0.")];
}
export function etatActuelD(e: ExerciceFormeTrigD, phase: PhaseFormeTrigonometrique): string[] | null {
  const thetaConfirme = `\\theta=${e.z.angle.latex}\\text{ (confirmé)}`;
  if (phase === "dEcran2") return [thetaConfirme];
  // Écran 3 : cumule θ (écran 1) ET la congruence posée (écran 2), du plus ancien au plus récent —
  // jamais seulement l'écran immédiatement précédent (audit transversal "état actuel cumulatif").
  if (phase === "dEcran3") return [thetaConfirme, `${congruenceLatex(e.condition)}\\text{ (confirmé)}`];
  return null;
}
export function champsD(phase: PhaseFormeTrigonometrique): ChampDef[] {
  if (phase === "dEcran1") return [{ type: "texte", label: "θ =", placeholder: PH_ANGLE }];
  if (phase === "dEcran3") return [{ type: "texte", label: "k =", placeholder: "ex : 5" }, { type: "texte", label: "m =", placeholder: "ex : 9" }];
  return []; // dEcran2 : écran de CHOIX, aucun champ texte — voir EtapeChoixCongruenceFormeTrigonometrique.
}
export function niveauAideMaxD(phase: PhaseFormeTrigonometrique): number {
  return phase === "dEcran2" ? 2 : 0;
}
export function aideNiveau1D(phase: PhaseFormeTrigonometrique): AideAvecLatex {
  if (phase !== "dEcran2") return AUCUNE_AIDE;
  return { texte: "D'après la formule de De Moivre, un argument de zⁿ vaut :", latex: "\\arg(z^n)=n\\theta" };
}
export function aideNiveau2D(phase: PhaseFormeTrigonometrique): AideAvecLatex {
  if (phase !== "dEcran2") return AUCUNE_AIDE;
  // Ne désigne pas la condition de l'exercice : l'élève doit encore faire la correspondance.
  return { texte: "Argument (à 2pπ près) d'un nombre situé sur chaque demi-axe :", latex: "\\begin{array}{ll}\\text{réel positif} & 0\\\\ \\text{réel négatif} & \\pi\\\\ \\text{imaginaire pur positif} & \\frac{\\pi}{2}\\\\ \\text{imaginaire pur négatif} & -\\frac{\\pi}{2}\\end{array}" };
}

// ============================================================================
// Famille E — Déduire des valeurs trigonométriques exactes.
// ============================================================================

export function consigneGeneraleE(): FragmentConsigne[] {
  return [texte("Calcule le même nombre complexe de deux façons pour en déduire les valeurs exactes de cos θ et sin θ, où θ est l'angle obtenu.")];
}
export function blocDonneesE(e: ExerciceFormeTrigE): string[] {
  const symbole = e.operation === "produit" ? "\\cdot\\," : "/";
  return [`z_1=e^{${formatExpIAngle(e.alpha.latex)}} \\quad z_2=e^{${formatExpIAngle(e.beta.latex)}}`, `z_1${symbole}z_2=e^{i\\theta}=\\,?`];
}
export function consigneEcranE(e: ExerciceFormeTrigE, phase: PhaseFormeTrigonometrique): FragmentConsigne[] {
  if (phase === "eEcran1") {
    const loi = e.operation === "produit" ? "e^{i\\alpha}\\cdot e^{i\\beta}=e^{i(\\alpha+\\beta)}" : "\\frac{e^{i\\alpha}}{e^{i\\beta}}=e^{i(\\alpha-\\beta)}";
    return [texte("Calcule l'angle θ grâce aux propriétés des exposants : "), latex(loi), texte(".")];
  }
  return [texte("Développe le même calcul sous forme a+bi : par identification, a = cos θ et b = sin θ. Donne leurs valeurs exactes (avec des racines carrées).")];
}
export function etatActuelE(e: ExerciceFormeTrigE, phase: PhaseFormeTrigonometrique): string[] | null {
  if (phase === "eEcran2") return [`\\theta=${e.angleResultat.latex}\\text{ (confirmé)}`];
  return null;
}
export function champsE(phase: PhaseFormeTrigonometrique): ChampDef[] {
  if (phase === "eEcran1") return [{ type: "texte", label: "θ =", placeholder: PH_ANGLE }];
  return [
    { type: "texte", label: "cos θ =", placeholder: "ex : sqrt(7)/3" },
    { type: "texte", label: "sin θ =", placeholder: "ex : sqrt(7)/3" },
  ];
}
export function niveauAideMaxE(phase: PhaseFormeTrigonometrique): number {
  return phase === "eEcran2" ? 2 : 0;
}
export function aideNiveau1E(e: ExerciceFormeTrigE, phase: PhaseFormeTrigonometrique): AideAvecLatex {
  if (phase !== "eEcran2") return AUCUNE_AIDE;
  if (e.operation === "quotient") return { texte: "Les deux nombres sont de module 1 : diviser par le second revient à multiplier par son conjugué, puis développer avec i² = −1 :", latex: "\\frac{e^{i\\alpha}}{e^{i\\beta}}=(\\cos\\alpha+i\\sin\\alpha)(\\cos\\beta-i\\sin\\beta)" };
  return { texte: "Développe le produit des formes trigonométriques, avec i² = −1 :", latex: "e^{i\\alpha}\\cdot e^{i\\beta}=(\\cos\\alpha+i\\sin\\alpha)(\\cos\\beta+i\\sin\\beta)" };
}
export function aideNiveau2E(e: ExerciceFormeTrigE, phase: PhaseFormeTrigonometrique): AideAvecLatex {
  if (phase !== "eEcran2") return AUCUNE_AIDE;
  const a = cosSinRemarquableLatex(e.alpha);
  const b = cosSinRemarquableLatex(e.beta);
  return {
    texte: "Valeurs remarquables à utiliser dans le développement (le calcul reste à faire) :",
    latex: `\\begin{array}{ll}\\cos(${e.alpha.latex})=${a.cos} & \\sin(${e.alpha.latex})=${a.sin}\\\\ \\cos(${e.beta.latex})=${b.cos} & \\sin(${e.beta.latex})=${b.sin}\\end{array}`,
  };
}

// ============================================================================
// Dispatch commun (mirroir 6gen34).
// ============================================================================

export function consigneGenerale(exercice: ExerciceFormeTrigonometrique): FragmentConsigne[] {
  switch (exercice.famille) {
    case "A":
      return consigneGeneraleA();
    case "B":
      return consigneGeneraleB();
    case "C":
      return consigneGeneraleC();
    case "D":
      return consigneGeneraleD();
    case "E":
      return consigneGeneraleE();
  }
}

export function blocDonnees(exercice: ExerciceFormeTrigonometrique): string[] {
  switch (exercice.famille) {
    case "A":
      return blocDonneesA(exercice);
    case "B":
      return blocDonneesB(exercice);
    case "C":
      return blocDonneesC(exercice);
    case "D":
      return blocDonneesD(exercice);
    case "E":
      return blocDonneesE(exercice);
  }
}

export function consigneEcran(exercice: ExerciceFormeTrigonometrique, phase: PhaseFormeTrigonometrique): FragmentConsigne[] {
  switch (exercice.famille) {
    case "A":
      return consigneEcranA(phase);
    case "B":
      return consigneEcranB(exercice, phase);
    case "C":
      return consigneEcranC(phase);
    case "D":
      return consigneEcranD(phase);
    case "E":
      return consigneEcranE(exercice, phase);
  }
}

export function etatActuel(exercice: ExerciceFormeTrigonometrique, phase: PhaseFormeTrigonometrique): string[] | null {
  switch (exercice.famille) {
    case "A":
      return etatActuelA(exercice, phase);
    case "B":
      return etatActuelB(exercice, phase);
    case "C":
      return etatActuelC(exercice, phase);
    case "D":
      return etatActuelD(exercice, phase);
    case "E":
      return etatActuelE(exercice, phase);
  }
}

export function champsEcran(exercice: ExerciceFormeTrigonometrique, phase: PhaseFormeTrigonometrique): ChampDef[] {
  switch (exercice.famille) {
    case "A":
      return champsA(phase);
    case "B":
      return champsB(exercice, phase);
    case "C":
      return champsC(phase);
    case "D":
      return champsD(phase);
    case "E":
      return champsE(phase);
  }
}

export function niveauAideMaxEcran(exercice: ExerciceFormeTrigonometrique, phase: PhaseFormeTrigonometrique): number {
  switch (exercice.famille) {
    case "A":
      return niveauAideMaxA(phase);
    case "B":
      return niveauAideMaxB(phase);
    case "C":
      return niveauAideMaxC(phase);
    case "D":
      return niveauAideMaxD(phase);
    case "E":
      return niveauAideMaxE(phase);
  }
}

export function aideNiveau1(exercice: ExerciceFormeTrigonometrique, phase: PhaseFormeTrigonometrique): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideNiveau1A(phase);
    case "B":
      return aideNiveau1B(exercice, phase);
    case "C":
      return aideNiveau1C(phase);
    case "D":
      return aideNiveau1D(phase);
    case "E":
      return aideNiveau1E(exercice, phase);
  }
}

export function aideNiveau2(exercice: ExerciceFormeTrigonometrique, phase: PhaseFormeTrigonometrique): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideNiveau2A(exercice, phase);
    case "B":
      return aideNiveau2B(exercice, phase);
    case "C":
      return aideNiveau2C(exercice, phase);
    case "D":
      return aideNiveau2D(phase);
    case "E":
      return aideNiveau2E(exercice, phase);
  }
}

export const LIBELLE_PHASE: Record<PhaseFormeTrigonometrique, string> = {
  aEcran1: "Étape 1 (module)",
  aEcran2: "Étape 2 (argument)",
  bEcran1: "Étape 1 (module/argument individuels)",
  bEcran2: "Étape 2 (combinaison)",
  cEcran1: "Étape 1 (forme trigonométrique)",
  cEcran2: "Étape 2 (De Moivre)",
  cEcran3: "Étape 3 (forme a+bi)",
  dEcran1: "Étape 1 (argument)",
  dEcran2: "Étape 2 (équation sur nθ)",
  dEcran3: "Étape 3 (résolution en n)",
  eEcran1: "Étape 1 (angle via les exposants)",
  eEcran2: "Étape 2 (cos θ et sin θ par développement)",
};

export const LIBELLE_FAMILLE: Record<ExerciceFormeTrigonometrique["famille"], string> = {
  A: "A — Forme trigonométrique/exponentielle depuis a+bi",
  B: "B — Module et argument via les propriétés",
  C: "C — Puissance via De Moivre",
  D: "D — Trouver n selon une condition sur l'argument",
  E: "E — Déduire des valeurs trigonométriques exactes",
};

/** Récapitulatif final : affiche toujours la réponse CORRECTE connue de l'exercice — jamais
 * recalculée depuis la saisie élève. */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceFormeTrigonometrique, phase: PhaseFormeTrigonometrique): string[] {
  switch (exercice.famille) {
    case "A":
      if (phase === "aEcran1") return [`r=${exercice.r}`];
      return [`\\theta=${exercice.angle.latex}\\quad\\Rightarrow\\quad z=${formatFacteurTrig({ r: exercice.r, angle: exercice.angle, a: exercice.a, b: exercice.b })}=${formatFacteurExp({ r: exercice.r, angle: exercice.angle, a: exercice.a, b: exercice.b })}`];
    case "B":
      if (phase === "bEcran1") {
        if (exercice.sousType === "puissance") return [`r=${exercice.z.r}\\text{, }\\theta=${exercice.z.angle.latex}`];
        return [`r_1=${exercice.z1.r}\\text{, }\\theta_1=${exercice.z1.angle.latex}\\text{, }r_2=${exercice.z2.r}\\text{, }\\theta_2=${exercice.z2.angle.latex}`];
      }
      if (exercice.sousType === "quotient") return [`r=${fractionSimpleLatex(exercice.z1.r, exercice.z2.r)}\\text{, }\\theta=${exercice.angleResultat.latex}`];
      return [`r=${exercice.rResultat}\\text{, }\\theta=${exercice.angleResultat.latex}`];
    case "C":
      if (phase === "cEcran1") return [`r=${latexModuleDepuisAngle(exercice.r, exercice.angle.q)}\\text{, }\\theta=${exercice.angle.latex}`];
      if (phase === "cEcran2") return [`r^n=${latexModuleDepuisAngle(exercice.rFinal, exercice.angleFinal.q)}\\text{, }n\\theta=${exercice.angleFinal.latex}`];
      return [assembleAPlusBI(exercice.aFinal, exercice.bFinal)];
    case "D":
      if (phase === "dEcran1") return [`\\theta=${exercice.z.angle.latex}`];
      if (phase === "dEcran2") return [congruenceLatex(exercice.condition)];
      return [`n=${exercice.congruence.k === 0 ? "" : `${exercice.congruence.k}+`}${exercice.congruence.m}p,\\ p\\in\\mathbb{Z}`];
    case "E":
      if (phase === "eEcran1") return [`\\theta=${exercice.angleResultat.latex}`];
      return [`\\cos\\theta=${exercice.cosResultat.latex}\\text{ ;}`, `\\sin\\theta=${exercice.sinResultat.latex}`];
  }
}

