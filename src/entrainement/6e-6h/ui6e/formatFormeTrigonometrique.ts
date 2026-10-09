import type { ValeurExacte } from "../core6e/cyclometrique.types";
import type { ConditionD, ExerciceFormeTrigA, ExerciceFormeTrigB, ExerciceFormeTrigC, ExerciceFormeTrigD, ExerciceFormeTrigE, ExerciceFormeTrigonometrique, FacteurComplexe } from "../core6e/formeTrigonometrique.types";
import { pgcd } from "../generateurs6e/calculPrimitives/aleatoire";
import type { PhaseFormeTrigonometrique, ResultatExerciceFormeTrigonometrique } from "../moteur6e/typesFormeTrigonometrique";
import { phasesPourExercice } from "../moteur6e/typesFormeTrigonometrique";

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

const AUCUNE_AIDE: AideAvecLatex = { texte: "", latex: null };

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

function decrireQuadrant(a: number, b: number): string {
  if (a > 0 && b > 0) return "1 (a>0, b>0)";
  if (a < 0 && b > 0) return "2 (a<0, b>0)";
  if (a < 0 && b < 0) return "3 (a<0, b<0)";
  if (a > 0 && b < 0) return "4 (a>0, b<0)";
  return "sur un axe (a=0 ou b=0)";
}

const LIBELLE_CONDITION: Record<ConditionD, string> = {
  reelPositif: "réel positif",
  reelNegatif: "réel négatif",
  imaginairePurPositif: "imaginaire pur positif",
  imaginairePurNegatif: "imaginaire pur négatif",
};

const CIBLE_LATEX_CONDITION: Record<ConditionD, string> = {
  reelPositif: "0",
  reelNegatif: "\\pi",
  imaginairePurPositif: "\\frac{\\pi}{2}",
  imaginairePurNegatif: "\\frac{3\\pi}{2}",
};

function congruenceLatex(condition: ConditionD): string {
  return `n\\theta\\equiv ${CIBLE_LATEX_CONDITION[condition]}\\ (\\text{mod } 2\\pi)`;
}

export { LIBELLE_CONDITION };

// ============================================================================
// Famille A — Forme trigonométrique/exponentielle depuis a+bi.
// ============================================================================

export function consigneGeneraleA(): string {
  return "Détermine le module et l'argument du nombre complexe suivant, puis exprime-le sous forme trigonométrique et exponentielle.";
}
export function blocDonneesA(e: ExerciceFormeTrigA): string[] {
  return [`z=${assembleValeurExacteAPlusBI(e.a, e.b)}`];
}
export function consigneEcranA(phase: PhaseFormeTrigonometrique): string {
  if (phase === "aEcran1") return "Calcule le module r=√(a²+b²).";
  return "Calcule l'argument θ (attention au quadrant : arctan(b/a) n'est valable directement que si a>0).";
}
export function etatActuelA(e: ExerciceFormeTrigA, phase: PhaseFormeTrigonometrique): string[] | null {
  if (phase === "aEcran2") return [`r=${e.r}\\text{ (confirmé)}`];
  return null;
}
export function champsA(phase: PhaseFormeTrigonometrique): ChampDef[] {
  if (phase === "aEcran1") return [{ type: "texte", label: "r =", placeholder: "ex : 2" }];
  return [{ type: "texte", label: "θ =", placeholder: "ex : pi/3" }];
}
export function niveauAideMaxA(phase: PhaseFormeTrigonometrique): number {
  return phase === "aEcran2" ? 2 : 0;
}
export function aideNiveau1A(phase: PhaseFormeTrigonometrique): AideAvecLatex {
  if (phase !== "aEcran2") return AUCUNE_AIDE;
  return { texte: "arctan(b/a) donne directement le bon angle SEULEMENT si a>0. Si a<0, il faut ajouter ou soustraire π selon le quadrant du point (a;b).", latex: null };
}
export function aideNiveau2A(e: ExerciceFormeTrigA, phase: PhaseFormeTrigonometrique): AideAvecLatex {
  if (phase !== "aEcran2") return AUCUNE_AIDE;
  return { texte: `Le point (a;b) est situé dans le quadrant ${decrireQuadrant(e.a.numerique, e.b.numerique)} — valeur exacte de l'argument non donnée ici.`, latex: null };
}

// ============================================================================
// Famille B — Module et argument via les propriétés.
// ============================================================================

export function consigneGeneraleB(): string {
  return "Utilise les propriétés du module et de l'argument (jamais un développement algébrique direct) pour calculer le résultat de l'opération.";
}
export function blocDonneesB(e: ExerciceFormeTrigB): string[] {
  if (e.sousType === "puissance") return [`z=${formatFacteurAPlusBI(e.z)}\\quad n=${e.n}`, `z^{${e.n}}=\\,?`];
  const symbole = e.sousType === "produit" ? "\\cdot\\," : "/";
  return [`z_1=${formatFacteurAPlusBI(e.z1)}\\quad z_2=${formatFacteurAPlusBI(e.z2)}`, `z_1${symbole}z_2=\\,?`];
}
export function consigneEcranB(e: ExerciceFormeTrigB, phase: PhaseFormeTrigonometrique): string {
  if (phase === "bEcran1") return e.sousType === "puissance" ? "Calcule le module et l'argument de z." : "Calcule le module et l'argument de chaque facteur séparément.";
  if (e.sousType === "produit") return "Combine à partir des valeurs CONFIRMÉES : multiplie les modules, additionne les arguments.";
  if (e.sousType === "quotient") return "Combine à partir des valeurs CONFIRMÉES : divise les modules, soustrais les arguments.";
  return "Combine à partir des valeurs CONFIRMÉES : élève le module à la puissance n, multiplie l'argument par n.";
}
export function etatActuelB(e: ExerciceFormeTrigB, phase: PhaseFormeTrigonometrique): string[] | null {
  if (phase !== "bEcran2") return null;
  if (e.sousType === "puissance") return [`r=${e.z.r}\\text{, }\\theta=${e.z.angle.latex}\\text{ (confirmés)}`];
  return [`r_1=${e.z1.r}\\text{, }\\theta_1=${e.z1.angle.latex}\\text{, }r_2=${e.z2.r}\\text{, }\\theta_2=${e.z2.angle.latex}\\text{ (confirmés)}`];
}
export function champsB(e: ExerciceFormeTrigB, phase: PhaseFormeTrigonometrique): ChampDef[] {
  if (phase === "bEcran2") return [{ type: "texte", label: "r =", placeholder: "ex : 6" }, { type: "texte", label: "θ =", placeholder: "ex : pi/2" }];
  if (e.sousType === "puissance") return [{ type: "texte", label: "r =", placeholder: "ex : 2" }, { type: "texte", label: "θ =", placeholder: "ex : pi/4" }];
  return [
    { type: "texte", label: "r₁ =", placeholder: "ex : 2" },
    { type: "texte", label: "θ₁ =", placeholder: "ex : pi/3" },
    { type: "texte", label: "r₂ =", placeholder: "ex : 3" },
    { type: "texte", label: "θ₂ =", placeholder: "ex : pi/4" },
  ];
}
export function niveauAideMaxB(phase: PhaseFormeTrigonometrique): number {
  return phase === "bEcran2" ? 2 : 0;
}
export function aideNiveau1B(phase: PhaseFormeTrigonometrique): AideAvecLatex {
  if (phase !== "bEcran2") return AUCUNE_AIDE;
  return { texte: "Rappel des 3 propriétés : produit → multiplier les modules et additionner les arguments ; quotient → diviser les modules et soustraire les arguments ; puissance → élever le module à la puissance et multiplier l'argument.", latex: null };
}
export function aideNiveau2B(e: ExerciceFormeTrigB, phase: PhaseFormeTrigonometrique): AideAvecLatex {
  if (phase !== "bEcran2") return AUCUNE_AIDE;
  if (e.sousType === "puissance") return { texte: "Valeurs individuelles confirmées (combinaison non faite) :", latex: `r=${e.z.r}\\text{, }\\theta=${e.z.angle.latex}` };
  return { texte: "Valeurs individuelles confirmées (combinaison non faite) :", latex: `r_1=${e.z1.r}\\text{, }\\theta_1=${e.z1.angle.latex}\\text{, }r_2=${e.z2.r}\\text{, }\\theta_2=${e.z2.angle.latex}` };
}

// ============================================================================
// Famille C — Puissance via De Moivre.
// ============================================================================

export function consigneGeneraleC(): string {
  return "Calcule zⁿ sous la forme a+bi, en passant par la forme trigonométrique (formule de De Moivre).";
}
export function blocDonneesC(e: ExerciceFormeTrigC): string[] {
  return [`z=${assembleAPlusBI(e.a, e.b)}\\quad n=${e.n}`, `z^{${e.n}}=\\,?`];
}
export function consigneEcranC(phase: PhaseFormeTrigonometrique): string {
  if (phase === "cEcran1") return "Convertis z en forme trigonométrique/exponentielle : calcule r et θ.";
  if (phase === "cEcran2") return "Applique la formule de De Moivre : (r(\\cos\\theta+i\\sin\\theta))^n=r^n(\\cos(n\\theta)+i\\sin(n\\theta)) — réduis l'argument modulo 2π si nécessaire.";
  return "Reconvertis le résultat CONFIRMÉ à l'étape précédente en forme algébrique a+bi.";
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
  if (phase === "cEcran1") return [{ type: "texte", label: "r =", placeholder: "ex : sqrt(2)" }, { type: "texte", label: "θ =", placeholder: "ex : pi/4" }];
  if (phase === "cEcran2") return [{ type: "texte", label: "rⁿ =", placeholder: "ex : 2" }, { type: "texte", label: "nθ =", placeholder: "ex : pi/2" }];
  return [{ type: "texte", label: "Résultat =", placeholder: "ex : 2i" }];
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
  return { texte: "nθ calculé, PAS ENCORE réduit modulo 2π :", latex: `n\\theta=${e.n}\\times\\left(${e.angle.latex}\\right)` };
}

// ============================================================================
// Famille D — Trouver n selon une condition sur l'argument.
// ============================================================================

export function consigneGeneraleD(): string {
  return "Détermine les valeurs de n telles que zⁿ vérifie la condition donnée.";
}
export function blocDonneesD(e: ExerciceFormeTrigD): string[] {
  return [`z=${formatFacteurAPlusBI(e.z)}`, `z^n\\text{ doit être }\\textbf{${LIBELLE_CONDITION[e.condition]}}`];
}
export function consigneEcranD(phase: PhaseFormeTrigonometrique): string {
  if (phase === "dEcran1") return "Détermine l'argument θ de z.";
  if (phase === "dEcran2") return "Pose l'équation de congruence sur nθ (mod 2π) correspondant à la condition demandée.";
  return "Résous pour n à partir de l'équation CONFIRMÉE : exprime l'ensemble des solutions sous la forme n≡k (mod m).";
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
  if (phase === "dEcran1") return [{ type: "texte", label: "θ =", placeholder: "ex : pi/3" }];
  if (phase === "dEcran3") return [{ type: "texte", label: "k =", placeholder: "ex : 3" }, { type: "texte", label: "m =", placeholder: "ex : 12" }];
  return []; // dEcran2 : écran de CHOIX, aucun champ texte — voir EtapeChoixCongruenceFormeTrigonometrique.
}
export function niveauAideMaxD(phase: PhaseFormeTrigonometrique): number {
  return phase === "dEcran2" ? 2 : 0;
}
export function aideNiveau1D(phase: PhaseFormeTrigonometrique): AideAvecLatex {
  if (phase !== "dEcran2") return AUCUNE_AIDE;
  return { texte: "Les 4 conditions possibles sur l'argument (modulo 2π) : réel positif → nθ≡0 ; réel négatif → nθ≡π ; imaginaire pur positif → nθ≡π/2 ; imaginaire pur négatif → nθ≡3π/2.", latex: null };
}
export function aideNiveau2D(e: ExerciceFormeTrigD, phase: PhaseFormeTrigonometrique): AideAvecLatex {
  if (phase !== "dEcran2") return AUCUNE_AIDE;
  return { texte: `Condition correspondant à "${LIBELLE_CONDITION[e.condition]}" (non résolue) :`, latex: congruenceLatex(e.condition) };
}

// ============================================================================
// Famille E — Déduire des valeurs trigonométriques exactes.
// ============================================================================

export function consigneGeneraleE(): string {
  return "Déduis les valeurs exactes de cos et sin de l'angle résultant, en comparant 2 calculs du même nombre complexe.";
}
export function blocDonneesE(e: ExerciceFormeTrigE): string[] {
  const symbole = e.operation === "produit" ? "\\cdot\\," : "/";
  return [`z_1=e^{${formatExpIAngle(e.alpha.latex)}}\\quad z_2=e^{${formatExpIAngle(e.beta.latex)}}`, `z_1${symbole}z_2=\\,?`];
}
export function consigneEcranE(phase: PhaseFormeTrigonometrique): string {
  if (phase === "eEcran1") return "Calcule directement le résultat via les exposants (loi des exposants de l'exponentielle complexe).";
  if (phase === "eEcran2") return "Calcule le même résultat en substituant cos+isin (conjugué du dénominateur si c'est un quotient), sous forme a+bi.";
  return "Égale les 2 formes CONFIRMÉES pour en déduire cos et sin de l'angle résultant.";
}
export function etatActuelE(e: ExerciceFormeTrigE, phase: PhaseFormeTrigonometrique): string[] | null {
  const angleResultatConfirme = `\\text{Angle résultant confirmé : }${e.angleResultat.latex}`;
  if (phase === "eEcran2") return [angleResultatConfirme];
  // Écran 3 : cumule l'angle résultant (écran 1) ET le développement algébrique (écran 2), du plus
  // ancien au plus récent — jamais seulement l'écran immédiatement précédent (audit transversal
  // "état actuel cumulatif").
  if (phase === "eEcran3") return [angleResultatConfirme, `e^{${formatExpIAngle(e.angleResultat.latex)}}=${assembleAPlusBI(e.aFinal, e.bFinal)}\\text{ (confirmés)}`];
  return null;
}
export function champsE(phase: PhaseFormeTrigonometrique): ChampDef[] {
  if (phase === "eEcran1") return [{ type: "texte", label: "Angle =", placeholder: "ex : pi" }];
  if (phase === "eEcran2") return [{ type: "texte", label: "Résultat =", placeholder: "ex : -1" }];
  return [{ type: "texte", label: "cos =", placeholder: "ex : -1" }, { type: "texte", label: "sin =", placeholder: "ex : 0" }];
}
export function niveauAideMaxE(phase: PhaseFormeTrigonometrique): number {
  return phase === "eEcran2" ? 2 : 0;
}
export function aideNiveau1E(e: ExerciceFormeTrigE, phase: PhaseFormeTrigonometrique): AideAvecLatex {
  if (phase !== "eEcran2") return AUCUNE_AIDE;
  if (e.operation === "quotient") return { texte: "Pour un quotient, multiplie numérateur ET dénominateur par le conjugué du dénominateur.", latex: null };
  return { texte: "Pour un produit, développe directement (cos α+i sin α)(cos β+i sin β), en utilisant i²=-1.", latex: null };
}
export function aideNiveau2E(e: ExerciceFormeTrigE, phase: PhaseFormeTrigonometrique): AideAvecLatex {
  if (phase !== "eEcran2") return AUCUNE_AIDE;
  const symbole = e.operation === "produit" ? "\\cdot\\," : "/";
  return { texte: "Développement posé (calcul final non fait) :", latex: `(\\cos(${e.alpha.latex})+i\\sin(${e.alpha.latex}))${symbole}(\\cos(${e.beta.latex})+i\\sin(${e.beta.latex}))` };
}

// ============================================================================
// Dispatch commun (mirroir 6gen34).
// ============================================================================

export function consigneGenerale(exercice: ExerciceFormeTrigonometrique): string {
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

export function consigneEcran(exercice: ExerciceFormeTrigonometrique, phase: PhaseFormeTrigonometrique): string {
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
      return consigneEcranE(phase);
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
      return aideNiveau1B(phase);
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
      return aideNiveau2D(exercice, phase);
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
  dEcran2: "Étape 2 (congruence posée)",
  dEcran3: "Étape 3 (résolution en n)",
  eEcran1: "Étape 1 (via les exposants)",
  eEcran2: "Étape 2 (développement algébrique)",
  eEcran3: "Étape 3 (valeurs exactes déduites)",
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
      return [`n\\equiv ${exercice.congruence.k}\\ (\\text{mod }${exercice.congruence.m})`];
    case "E":
      if (phase === "eEcran1") return [exercice.angleResultat.latex];
      if (phase === "eEcran2") return [assembleAPlusBI(exercice.aFinal, exercice.bFinal)];
      return [`\\cos(${exercice.angleResultat.latex})=${exercice.aFinal}\\text{, }\\sin(${exercice.angleResultat.latex})=${exercice.bFinal}`];
  }
}

/** Total points du récapitulatif final — maximum VARIABLE (100 × nombre d'écrans réellement
 * traversés par CET exercice : 2 pour A/B, 3 pour C/D/E). */
export function calculerTotalPointsFormeTrigonometrique(resultat: ResultatExerciceFormeTrigonometrique): { total: number; maximum: number } {
  const phases = phasesPourExercice(resultat.exercice);
  const total = phases.reduce((acc, phase) => acc + (resultat.scores[phase] ?? 0), 0);
  return { total, maximum: phases.length * 100 };
}
