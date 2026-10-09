import type {
  ExerciceEquationsComplexes,
  ExerciceFamilleAAvecBarre,
  ExerciceFamilleASansBarre,
  ExerciceFamilleB,
  ExerciceFamilleC,
  ExerciceFamilleD,
  ExerciceFamilleE,
  ExerciceFamilleF,
  IdEquationDeveloppeeB,
  IdEquationEnU,
  IdSystemeA,
  ValeurComplexe,
} from "../core6e/equationsComplexes.types";
import type { PhaseEquationsComplexes, ResultatExerciceEquationsComplexes } from "../moteur6e/typesEquationsComplexes";
import { phasesPourExercice } from "../moteur6e/typesEquationsComplexes";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage LaTeX pour `6gen36`. Dispatch sur
 * `exercice.famille` (PUIS `sousType` pour A) PUIS `phase`, mirroir `formatAffixesRacines.ts`
 * (6gen35)/`formatNombresComplexes.ts` (6gen34), jamais importé par un autre générateur.
 *
 * **Vigilance signe orphelin / groupe LaTeX vide** (bug déjà rencontré et corrigé sur plusieurs
 * générateurs 6e, documenté par CLAUDE.md) — TOUT assemblage d'équation passe par `coteLatex`
 * (filtre les termes nuls, jamais un "+0z" ni un "+-" glué) et `joindre` (assemble
 * signe+magnitude ensemble, jamais un signe orphelin) ci-dessous, jamais un "+"/"-" concaténé à la
 * main ailleurs dans ce fichier. Testé explicitement sur beaucoup de tirages
 * (`formatEquationsComplexes.test.ts`), y compris les options QCM.
 */

export interface ChampDef {
  label: string;
  placeholder?: string;
}

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

const AUCUNE_AIDE: AideAvecLatex = { texte: "", latex: null };

// ============================================================================
// Assemblage LaTeX générique — LA discipline anti-signe-orphelin de ce fichier (voir en-tête).
// ============================================================================

/** Nombre complexe entier "a+bi" — 0 si les 2 sont nuls, jamais de groupe vide. */
export function entierComplexeLatex(re: number, im: number): string {
  if (re === 0 && im === 0) return "0";
  if (im === 0) return `${re}`;
  if (re === 0) return `${im === 1 ? "" : im === -1 ? "-" : im}i`;
  const imSigne = im < 0 ? "-" : "+";
  const imMagnitude = Math.abs(im) === 1 ? "" : `${Math.abs(im)}`;
  return `${re}${imSigne}${imMagnitude}i`;
}

/** Terme "coefficient·variable" à coefficient COMPLEXE — `null` si le coefficient est nul (terme
 * omis, jamais affiché "+0z"). Coefficient non réel TOUJOURS entre parenthèses (jamais de signe
 * orphelin visible à l'extérieur, le signe interne à `entierComplexeLatex` reste dans le groupe). */
function termeVarComplexe(v: ValeurComplexe, variableLatex: string): string | null {
  if (v.re === 0 && v.im === 0) return null;
  if (v.im === 0) {
    if (v.re === 1) return variableLatex;
    if (v.re === -1) return `-${variableLatex}`;
    return `${v.re}${variableLatex}`;
  }
  return `(${entierComplexeLatex(v.re, v.im)})${variableLatex}`;
}

/** Terme constant COMPLEXE — `null` si nul. */
function termeConstanteComplexe(v: ValeurComplexe): string | null {
  if (v.re === 0 && v.im === 0) return null;
  if (v.im === 0) return `${v.re}`;
  if (v.re === 0) return `${v.im === 1 ? "" : v.im === -1 ? "-" : v.im}i`;
  return `(${entierComplexeLatex(v.re, v.im)})`;
}

/** Terme "coefficient·variable" à coefficient RÉEL — `null` si nul, jamais de parenthèses (un réel
 * porte déjà son signe naturellement). */
function termeVarReel(v: number, variableLatex: string): string | null {
  if (v === 0) return null;
  if (v === 1) return variableLatex;
  if (v === -1) return `-${variableLatex}`;
  return `${v}${variableLatex}`;
}

/** Terme constant RÉEL — `null` si nul. */
function termeConstanteReelle(v: number): string | null {
  if (v === 0) return null;
  return `${v}`;
}

/** Assemble 2 termes DÉJÀ SIGNÉS avec un "+"/"-" propre — jamais "+-"/"++" glués (voir en-tête). */
function joindre(gauche: string, droite: string): string {
  if (droite.startsWith("-")) return `${gauche} - ${droite.slice(1)}`;
  return `${gauche} + ${droite}`;
}

/** Assemble une liste de termes potentiellement nuls (`null` = omis) — "0" si tous nuls. */
function coteLatex(termes: (string | null)[]): string {
  const filtres = termes.filter((t): t is string => t !== null);
  if (filtres.length === 0) return "0";
  let resultat = filtres[0];
  for (let i = 1; i < filtres.length; i++) resultat = joindre(resultat, filtres[i]);
  return resultat;
}

// ============================================================================
// Famille A — Linéaire en z, avec ou sans z̄.
// ============================================================================

function equationSansBarreLatex(e: ExerciceFamilleASansBarre): string {
  const gauche = coteLatex([termeVarComplexe(e.a, "z"), termeConstanteComplexe(e.b)]);
  const droite = coteLatex([termeVarComplexe(e.c, "z"), termeConstanteComplexe(e.d)]);
  return `${gauche}=${droite}`;
}

export function consigneGeneraleASans(): string {
  return "Résous dans ℂ l'équation ci-dessous. Donne la solution sous la forme a+bi.";
}
export function blocDonneesASans(e: ExerciceFamilleASansBarre): string[] {
  return [equationSansBarreLatex(e)];
}
export function consigneEcranASans(): string {
  return "Isole z (regroupe les termes en z d'un côté, les constantes de l'autre), puis donne la solution sous la forme a+bi.";
}
export function champsASans(): ChampDef[] {
  return [{ label: "z =", placeholder: "ex : 2+3i" }];
}
export function niveauAideMaxASans(): number {
  return 2;
}
export function aideNiveau1ASans(): AideAvecLatex {
  return { texte: "Regroupe tous les termes en z d'un côté de l'égalité, toutes les constantes de l'autre — comme pour une équation réelle.", latex: null };
}
export function aideNiveau2ASans(e: ExerciceFamilleASansBarre): AideAvecLatex {
  const denom = coteLatex([termeVarComplexe(e.a, "z"), termeVarComplexe({ re: -e.c.re, im: -e.c.im }, "z")]);
  const numer = coteLatex([termeConstanteComplexe(e.d), termeConstanteComplexe({ re: -e.b.re, im: -e.b.im })]);
  return { texte: "Équation regroupée (division non faite) :", latex: `${denom}=${numer}` };
}

function equationSystemeALatex(coefX: number, x: string, cible: number): string {
  return `${termeVarReel(coefX, x) ?? "0"}=${cible}`;
}

/** 4 systèmes candidats à l'écran 1 (famille A avecBarre) — voir `core6e/equationsComplexes.types.ts`
 * pour le sens de chaque distracteur. */
export function OPTIONS_SYSTEME_A(e: ExerciceFamilleAAvecBarre): { id: IdSystemeA; latex: string }[] {
  return [
    { id: "correct", latex: `${equationSystemeALatex(e.a + e.b, "x", e.c)}\\text{, }${equationSystemeALatex(e.a - e.b, "y", e.d)}` },
    { id: "signeInverseY", latex: `${equationSystemeALatex(e.a + e.b, "x", e.c)}\\text{, }${equationSystemeALatex(e.a + e.b, "y", e.d)}` },
    { id: "permuteXY", latex: `${equationSystemeALatex(e.a + e.b, "y", e.c)}\\text{, }${equationSystemeALatex(e.a - e.b, "x", e.d)}` },
    { id: "sansCombinaison", latex: `${equationSystemeALatex(e.a, "x", e.c)}\\text{, }${equationSystemeALatex(e.b, "y", e.d)}` },
  ];
}

function equationAvecBarreLatex(e: ExerciceFamilleAAvecBarre): string {
  const gauche = joindre(termeVarReel(e.a, "z") ?? "0", termeVarReel(e.b, "\\bar z") ?? "0");
  const droite = coteLatex([termeConstanteReelle(e.c), termeVarReel(e.d, "i")]);
  return `${gauche}=${droite}`;
}

export function consigneGeneraleAAvec(): string {
  return "Résous dans ℂ l'équation ci-dessous (z̄ désigne le conjugué de z). Donne la solution sous la forme a+bi.";
}
export function blocDonneesAAvec(e: ExerciceFamilleAAvecBarre): string[] {
  return [equationAvecBarreLatex(e)];
}
export function consigneEcranAAvec(phase: PhaseEquationsComplexes): string {
  if (phase === "aAvecEcran1") return "Substitue z=x+yi et z̄=x−yi, développe, puis choisis le système de 2 équations réelles obtenu (identification des parties réelle et imaginaire).";
  return "Résous le système CONFIRMÉ à l'étape précédente pour x et y, puis donne z=x+yi.";
}
export function etatActuelAAvec(e: ExerciceFamilleAAvecBarre, phase: PhaseEquationsComplexes): string[] | null {
  if (phase === "aAvecEcran2") return [`\\text{Système confirmé : }${equationSystemeALatex(e.a + e.b, "x", e.c)}\\text{, }${equationSystemeALatex(e.a - e.b, "y", e.d)}`];
  return null;
}
export function champsAAvec(phase: PhaseEquationsComplexes): ChampDef[] {
  if (phase === "aAvecEcran1") return [];
  return [
    { label: "x =", placeholder: "ex : 2" },
    { label: "y =", placeholder: "ex : 3" },
    { label: "z =", placeholder: "ex : 2+3i" },
  ];
}
export function niveauAideMaxAAvec(phase: PhaseEquationsComplexes): number {
  return phase === "aAvecEcran1" ? 2 : 0;
}
export function aideNiveau1AAvec(phase: PhaseEquationsComplexes): AideAvecLatex {
  if (phase === "aAvecEcran1") return { texte: "z̄ s'obtient en changeant le signe de la partie imaginaire de z. Une égalité entre 2 complexes équivaut à 2 égalités réelles : parties réelles égales ENTRE ELLES, parties imaginaires égales ENTRE ELLES.", latex: null };
  return AUCUNE_AIDE;
}
export function aideNiveau2AAvec(e: ExerciceFamilleAAvecBarre, phase: PhaseEquationsComplexes): AideAvecLatex {
  if (phase === "aAvecEcran1") {
    // Partie réelle (ax+bx) et partie imaginaire (ay-by) PAS ENCORE combinées — chacune enveloppée
    // entre parenthèses avant d'être jointe au reste (jamais un "+"/"-" brut concaténé à la main,
    // voir en-tête de fichier) : `coteLatex` sur des groupes déjà parenthésés ajoute toujours un
    // "+" littéral entre eux, jamais "+-"/"++" glués.
    const partieReelle = joindre(termeVarReel(e.a, "x") ?? "0", termeVarReel(e.b, "x") ?? "0");
    const partieImaginaire = joindre(termeVarReel(e.a, "y") ?? "0", termeVarReel(-e.b, "y") ?? "0");
    const gauche = coteLatex([`(${partieReelle})`, `(${partieImaginaire})i`]);
    const droite = coteLatex([termeConstanteReelle(e.c), termeVarReel(e.d, "i")]);
    return { texte: "Expression développée (séparation en système non faite) :", latex: `${gauche}=${droite}` };
  }
  return AUCUNE_AIDE;
}

// ============================================================================
// Famille B — Équation rationnelle en z.
// ============================================================================

function fractionBLatex(a: number, b: number, c: number, d: number): string {
  const numer = coteLatex([termeVarReel(a, "z"), termeConstanteReelle(b)]);
  const denom = coteLatex([termeVarReel(c, "z"), termeConstanteReelle(d)]);
  return `\\dfrac{${numer}}{${denom}}`;
}

/** 4 équations développées candidates à l'écran 1 — voir `core6e/equationsComplexes.types.ts`. */
export function OPTIONS_EQUATION_B(e: ExerciceFamilleB): { id: IdEquationDeveloppeeB; latex: string }[] {
  const ka: ValeurComplexe = { re: e.k.re * e.a, im: e.k.im * e.a };
  const kb: ValeurComplexe = { re: e.k.re * e.b, im: e.k.im * e.b };
  const gaucheReelle = coteLatex([termeVarReel(e.a, "z"), termeConstanteReelle(e.b)]);
  const droiteReelle = coteLatex([termeVarReel(e.c, "z"), termeConstanteReelle(e.d)]);
  return [
    { id: "correct", latex: `${gaucheReelle}=${coteLatex([termeVarComplexe(e.kc, "z"), termeConstanteComplexe(e.kd)])}` },
    { id: "coteInverse", latex: `${coteLatex([termeVarComplexe(ka, "z"), termeConstanteComplexe(kb)])}=${droiteReelle}` },
    { id: "oublieC", latex: `${gaucheReelle}=${coteLatex([termeVarComplexe(e.k, "z"), termeConstanteComplexe(e.kd)])}` },
    { id: "oublieD", latex: `${gaucheReelle}=${coteLatex([termeVarComplexe(e.kc, "z"), termeConstanteReelle(e.d)])}` },
  ];
}

export function consigneGeneraleB(): string {
  return "Résous dans ℂ l'équation rationnelle ci-dessous. Donne la solution sous la forme a+bi.";
}
export function blocDonneesB(e: ExerciceFamilleB): string[] {
  return [`${fractionBLatex(e.a, e.b, e.c, e.d)}=${entierComplexeLatex(e.k.re, e.k.im)}`];
}
export function consigneEcranB(phase: PhaseEquationsComplexes): string {
  if (phase === "bEcran1") return "Multiplie les 2 membres par le dénominateur pour éliminer la fraction, développe, puis choisis l'équation développée correcte.";
  return "Isole z à partir de l'équation CONFIRMÉE à l'étape précédente, puis donne la solution sous la forme a+bi.";
}
export function etatActuelB(e: ExerciceFamilleB, phase: PhaseEquationsComplexes): string[] | null {
  if (phase === "bEcran2") return [`\\text{Équation confirmée : }${coteLatex([termeVarReel(e.a, "z"), termeConstanteReelle(e.b)])}=${coteLatex([termeVarComplexe(e.kc, "z"), termeConstanteComplexe(e.kd)])}`];
  return null;
}
export function champsB(phase: PhaseEquationsComplexes): ChampDef[] {
  if (phase === "bEcran1") return [];
  return [{ label: "z =", placeholder: "ex : 1+i" }];
}
export function niveauAideMaxB(phase: PhaseEquationsComplexes): number {
  return phase === "bEcran1" ? 2 : 0;
}
export function aideNiveau1B(phase: PhaseEquationsComplexes): AideAvecLatex {
  if (phase === "bEcran1") return { texte: "Multiplie les 2 membres de l'égalité par (cz+d) pour éliminer la fraction.", latex: null };
  return AUCUNE_AIDE;
}
export function aideNiveau2B(e: ExerciceFamilleB, phase: PhaseEquationsComplexes): AideAvecLatex {
  if (phase === "bEcran1") {
    return { texte: "Équation après multiplication (développement non fait) :", latex: `${coteLatex([termeVarReel(e.a, "z"), termeConstanteReelle(e.b)])}=(${entierComplexeLatex(e.k.re, e.k.im)})(${coteLatex([termeVarReel(e.c, "z"), termeConstanteReelle(e.d)])})` };
  }
  return AUCUNE_AIDE;
}

// ============================================================================
// Famille C — Quadratique, discriminant réel négatif.
// ============================================================================

function equationCLatex(e: ExerciceFamilleC): string {
  return `${coteLatex([termeVarReel(e.a, "z^2"), termeVarReel(e.b, "z"), termeConstanteReelle(e.c)])}=0`;
}

export function consigneGeneraleC(): string {
  return "Résous dans ℂ l'équation du second degré ci-dessous. Donne les 2 solutions sous la forme a+bi.";
}
export function blocDonneesC(e: ExerciceFamilleC): string[] {
  return [equationCLatex(e)];
}
export function consigneEcranC(phase: PhaseEquationsComplexes): string {
  if (phase === "cEcran1") return "Calcule le discriminant Δ=b²-4ac, et constate qu'il est négatif.";
  return "Δ étant négatif, applique la formule quadratique avec √Δ=i√|Δ| (Δ CONFIRMÉ à l'étape précédente), et donne les 2 solutions.";
}
export function etatActuelC(e: ExerciceFamilleC, phase: PhaseEquationsComplexes): string[] | null {
  if (phase === "cEcran2") return [`\\text{Δ confirmé : }\\Delta=${e.delta}`];
  return null;
}
export function champsC(phase: PhaseEquationsComplexes): ChampDef[] {
  if (phase === "cEcran1") return [{ label: "Δ =", placeholder: "ex : -16" }];
  return [];
}
export function niveauAideMaxC(phase: PhaseEquationsComplexes): number {
  return phase === "cEcran2" ? 2 : 0;
}
export function aideNiveau1C(phase: PhaseEquationsComplexes): AideAvecLatex {
  if (phase === "cEcran2") return { texte: "Δ étant négatif, √Δ=i√|Δ| (|Δ| est positif, sa racine carrée réelle existe).", latex: null };
  return AUCUNE_AIDE;
}
export function aideNiveau2C(e: ExerciceFamilleC, phase: PhaseEquationsComplexes): AideAvecLatex {
  if (phase === "cEcran2") return { texte: "Formule substituée (calcul final non fait) :", latex: `z=\\dfrac{-(${e.b})\\pm i\\sqrt{${-e.delta}}}{2\\times(${e.a})}` };
  return AUCUNE_AIDE;
}

// ============================================================================
// Famille D — Quadratique, discriminant complexe.
// ============================================================================

function equationDLatex(e: ExerciceFamilleD): string {
  return `${coteLatex([termeVarReel(e.a, "z^2"), termeVarComplexe(e.b, "z"), termeConstanteComplexe(e.c)])}=0`;
}

export function consigneGeneraleD(): string {
  return "Résous dans ℂ l'équation du second degré ci-dessous (le discriminant est complexe). Donne les 2 solutions sous la forme a+bi.";
}
export function blocDonneesD(e: ExerciceFamilleD): string[] {
  return [equationDLatex(e)];
}
export function consigneEcranD(phase: PhaseEquationsComplexes): string {
  if (phase === "dEcran1") return "Calcule le discriminant Δ=b²-4ac (un nombre complexe).";
  if (phase === "dEcran2") return "Calcule les 2 racines carrées complexes de Δ CONFIRMÉ à l'étape précédente (même technique qu'une racine carrée de complexe).";
  return "Applique la formule quadratique z=(-b±√Δ)/(2a) à partir de √Δ CONFIRMÉ à l'étape précédente, et donne les 2 solutions.";
}
export function etatActuelD(e: ExerciceFamilleD, phase: PhaseEquationsComplexes): string[] | null {
  const deltaConfirme = `\\text{Δ confirmé : }\\Delta=${entierComplexeLatex(e.delta.re, e.delta.im)}`;
  if (phase === "dEcran2") return [deltaConfirme];
  // Écran 3 : cumule Δ (écran 1) ET √Δ (écran 2), du plus ancien au plus récent — jamais seulement
  // l'écran immédiatement précédent (audit transversal "état actuel cumulatif").
  if (phase === "dEcran3") return [deltaConfirme, `\\text{√Δ confirmé : }${entierComplexeLatex(e.racinesDelta[0].re, e.racinesDelta[0].im)}\\text{ et }${entierComplexeLatex(e.racinesDelta[1].re, e.racinesDelta[1].im)}`];
  return null;
}
export function champsD(phase: PhaseEquationsComplexes): ChampDef[] {
  if (phase === "dEcran1") return [{ label: "Δ =", placeholder: "ex : -3+4i" }];
  return [];
}
export function niveauAideMaxD(phase: PhaseEquationsComplexes): number {
  return phase === "dEcran2" ? 2 : 0;
}
export function aideNiveau1D(phase: PhaseEquationsComplexes): AideAvecLatex {
  if (phase === "dEcran2") return { texte: "Pose √Δ=x+yi, élève au carré et identifie : x²-y²=Re(Δ), 2xy=Im(Δ) — un système à résoudre pour x,y entiers.", latex: null };
  return AUCUNE_AIDE;
}
export function aideNiveau2D(e: ExerciceFamilleD, phase: PhaseEquationsComplexes): AideAvecLatex {
  if (phase === "dEcran2") return { texte: "Système posé (résolution non faite) :", latex: `x^2-y^2=${e.delta.re}\\text{, }2xy=${e.delta.im}` };
  return AUCUNE_AIDE;
}

// ============================================================================
// Famille E — Quartique biquadratique u=z².
// ============================================================================

function equationELatex(e: ExerciceFamilleE): string {
  return `${coteLatex([termeVarComplexe(e.a, "z^4"), termeVarComplexe(e.b, "z^2"), termeConstanteComplexe(e.c)])}=0`;
}

/** 4 équations en U candidates à l'écran 1. */
export function OPTIONS_EQUATION_E(e: ExerciceFamilleE): { id: IdEquationEnU; latex: string }[] {
  return [
    { id: "correct", latex: `${coteLatex([termeVarComplexe(e.a, "U^2"), termeVarComplexe(e.b, "U"), termeConstanteComplexe(e.c)])}=0` },
    { id: "exposantInverse", latex: `${coteLatex([termeVarComplexe(e.a, "U"), termeVarComplexe(e.b, "U^2"), termeConstanteComplexe(e.c)])}=0` },
    { id: "coefInverses", latex: `${coteLatex([termeVarComplexe(e.c, "U^2"), termeVarComplexe(e.b, "U"), termeConstanteComplexe(e.a)])}=0` },
    { id: "oublieB", latex: `${coteLatex([termeVarComplexe(e.a, "U^2"), termeConstanteComplexe(e.c)])}=0` },
  ];
}

export function consigneGeneraleE(): string {
  return "Résous dans ℂ l'équation du quatrième degré ci-dessous, en posant u=z². Donne les 4 solutions sous la forme a+bi.";
}
export function blocDonneesE(e: ExerciceFamilleE): string[] {
  return [equationELatex(e)];
}
export function consigneEcranE(phase: PhaseEquationsComplexes): string {
  if (phase === "eEcran1") return "Pose u=z², réécris l'équation en une équation du second degré en u, et choisis-la ci-dessous.";
  if (phase === "eEcran2") return "Résous l'équation en u CONFIRMÉE à l'étape précédente (2 valeurs de u, potentiellement complexes).";
  return "Pour chacune des 2 valeurs de u CONFIRMÉES à l'étape précédente, calcule les racines carrées correspondantes z=±√u, et donne les 4 solutions.";
}
export function etatActuelE(e: ExerciceFamilleE, phase: PhaseEquationsComplexes): string[] | null {
  const equationEnUConfirmee = `\\text{Équation en u confirmée : }${coteLatex([termeVarComplexe(e.a, "U^2"), termeVarComplexe(e.b, "U"), termeConstanteComplexe(e.c)])}=0`;
  if (phase === "eEcran2") return [equationEnUConfirmee];
  // Écran 3 : cumule l'équation en u (écran 1) ET ses 2 valeurs (écran 2), du plus ancien au plus
  // récent — jamais seulement l'écran immédiatement précédent (audit transversal "état actuel
  // cumulatif").
  if (phase === "eEcran3") return [equationEnUConfirmee, `\\text{Valeurs de u confirmées : }u_1=${entierComplexeLatex(e.u1.re, e.u1.im)}\\text{, }u_2=${entierComplexeLatex(e.u2.re, e.u2.im)}`];
  return null;
}
export function niveauAideMaxE(phase: PhaseEquationsComplexes): number {
  return phase === "eEcran3" ? 2 : 0;
}
export function aideNiveau1E(phase: PhaseEquationsComplexes): AideAvecLatex {
  if (phase === "eEcran3") return { texte: "Une équation quartique réductible en u=z² produit jusqu'à 4 racines : 2 valeurs de u, CHACUNE donnant 2 racines opposées en z (z=+√u et z=-√u) — jamais une seule par valeur de u.", latex: null };
  return AUCUNE_AIDE;
}
export function aideNiveau2E(e: ExerciceFamilleE, phase: PhaseEquationsComplexes): AideAvecLatex {
  if (phase === "eEcran3") {
    return { texte: "Les racines pour u₁ déjà données (celles pour u₂ non) :", latex: `z=\\pm(${entierComplexeLatex(e.racineU1.re, e.racineU1.im)})` };
  }
  return AUCUNE_AIDE;
}

// ============================================================================
// Famille F — Quartique générale, racine rationnelle et division.
// ============================================================================

function equationFLatex(e: ExerciceFamilleF): string {
  return `${coteLatex([termeVarReel(e.a, "z^4"), termeVarReel(e.b, "z^3"), termeVarReel(e.c, "z^2"), termeVarReel(e.d, "z"), termeConstanteReelle(e.e)])}=0`;
}
function polynomeLatex(coefs: number[], puissanceDepart: number): string {
  const termes = coefs.map((c, i) => {
    const puissance = puissanceDepart - i;
    if (puissance === 0) return termeConstanteReelle(c);
    if (puissance === 1) return termeVarReel(c, "z");
    return termeVarReel(c, `z^${puissance}`);
  });
  return coteLatex(termes);
}

export function consigneGeneraleF(): string {
  return "Résous dans ℂ l'équation du quatrième degré ci-dessous (2 racines rationnelles évidentes, puis un facteur du second degré). Donne les 4 solutions sous la forme a+bi.";
}
export function blocDonneesF(e: ExerciceFamilleF): string[] {
  return [equationFLatex(e)];
}
export function consigneEcranF(phase: PhaseEquationsComplexes): string {
  if (phase === "fEcran1") return "Teste des valeurs candidates simples (diviseurs du terme constant sur diviseurs du coefficient dominant) pour trouver une première racine rationnelle r₁.";
  if (phase === "fEcran2") return "Divise le polynôme par (z-r₁) CONFIRMÉ à l'étape précédente — donne le quotient (polynôme du 3e degré).";
  if (phase === "fEcran3") return "Trouve une racine rationnelle r₂ du quotient CONFIRMÉ à l'étape précédente, puis divise à nouveau — donne r₂ et le quotient (polynôme du 2e degré).";
  if (phase === "fEcran4") return "Résous le facteur du second degré CONFIRMÉ à l'étape précédente (discriminant négatif) — donne les 2 racines complexes conjuguées.";
  return "Donne l'ensemble complet des 4 solutions de l'équation (r₁, r₂, et les 2 racines complexes CONFIRMÉES à l'étape précédente).";
}
export function etatActuelF(e: ExerciceFamilleF, phase: PhaseEquationsComplexes): string[] | null {
  // 5 écrans — chaque ligne ci-dessous est la réponse VALIDÉE d'UN écran ; chaque phase >=2 cumule
  // TOUTES les lignes des écrans précédents, du plus ancien au plus récent, jamais seulement celle
  // de l'écran immédiatement précédent (audit transversal "état actuel cumulatif" — bug trouvé ici :
  // fEcran3/4/5 ne montraient chacun qu'UNE seule ligne, celle de l'écran juste avant).
  const r1Confirme = `\\text{r}_1\\text{ confirmé : }r_1=${e.r1}`;
  const quotientCubiqueConfirme = `\\text{Quotient confirmé : }${polynomeLatex(e.quotientCubique, 3)}=0`;
  const r2EtQuotientConfirmes = `\\text{r}_2\\text{ et quotient confirmés : }r_2=${e.r2}\\text{, }${polynomeLatex(e.quotientQuadratique, 2)}=0`;
  const racinesComplexesConfirmees = `\\text{Racines complexes confirmées : }${entierComplexeLatex(e.p, e.q)}\\text{, }${entierComplexeLatex(e.p, -e.q)}`;
  if (phase === "fEcran2") return [r1Confirme];
  if (phase === "fEcran3") return [r1Confirme, quotientCubiqueConfirme];
  if (phase === "fEcran4") return [r1Confirme, quotientCubiqueConfirme, r2EtQuotientConfirmes];
  if (phase === "fEcran5") return [r1Confirme, quotientCubiqueConfirme, r2EtQuotientConfirmes, racinesComplexesConfirmees];
  return null;
}
export function champsF(phase: PhaseEquationsComplexes): ChampDef[] {
  if (phase === "fEcran1") return [{ label: "r₁ =", placeholder: "ex : 1" }];
  if (phase === "fEcran2") return [{ label: "Quotient (polynôme en z) =", placeholder: "ex : z^3+z^2+z+1" }];
  if (phase === "fEcran3")
    return [
      { label: "r₂ =", placeholder: "ex : -1" },
      { label: "Quotient (polynôme en z) =", placeholder: "ex : z^2+1" },
    ];
  return [];
}
export function niveauAideMaxF(phase: PhaseEquationsComplexes): number {
  return phase === "fEcran1" ? 2 : 0;
}
export function aideNiveau1F(phase: PhaseEquationsComplexes): AideAvecLatex {
  if (phase === "fEcran1") return { texte: "Théorème des racines rationnelles : toute racine rationnelle p/q d'un polynôme à coefficients entiers vérifie p | terme constant et q | coefficient dominant.", latex: null };
  return AUCUNE_AIDE;
}
export function aideNiveau2F(e: ExerciceFamilleF, phase: PhaseEquationsComplexes): AideAvecLatex {
  if (phase === "fEcran1") {
    const diviseursE = diviseurs(e.e);
    const diviseursA = diviseurs(e.a);
    return { texte: "Candidats à tester (test non fait) :", latex: `p\\in\\{${diviseursE.join(",")}\\}\\text{, }q\\in\\{${diviseursA.join(",")}\\}` };
  }
  return AUCUNE_AIDE;
}
function diviseurs(n: number): number[] {
  const abs = Math.abs(n) || 1;
  const resultat: number[] = [];
  for (let d = 1; d <= abs; d++) if (abs % d === 0) resultat.push(d, -d);
  return resultat;
}

// ============================================================================
// Dispatch commun.
// ============================================================================

export function consigneGenerale(exercice: ExerciceEquationsComplexes): string {
  switch (exercice.famille) {
    case "A":
      return exercice.sousType === "sansBarre" ? consigneGeneraleASans() : consigneGeneraleAAvec();
    case "B":
      return consigneGeneraleB();
    case "C":
      return consigneGeneraleC();
    case "D":
      return consigneGeneraleD();
    case "E":
      return consigneGeneraleE();
    case "F":
      return consigneGeneraleF();
  }
}

export function blocDonnees(exercice: ExerciceEquationsComplexes): string[] {
  switch (exercice.famille) {
    case "A":
      return exercice.sousType === "sansBarre" ? blocDonneesASans(exercice) : blocDonneesAAvec(exercice);
    case "B":
      return blocDonneesB(exercice);
    case "C":
      return blocDonneesC(exercice);
    case "D":
      return blocDonneesD(exercice);
    case "E":
      return blocDonneesE(exercice);
    case "F":
      return blocDonneesF(exercice);
  }
}

export function consigneEcran(exercice: ExerciceEquationsComplexes, phase: PhaseEquationsComplexes): string {
  switch (exercice.famille) {
    case "A":
      return exercice.sousType === "sansBarre" ? consigneEcranASans() : consigneEcranAAvec(phase);
    case "B":
      return consigneEcranB(phase);
    case "C":
      return consigneEcranC(phase);
    case "D":
      return consigneEcranD(phase);
    case "E":
      return consigneEcranE(phase);
    case "F":
      return consigneEcranF(phase);
  }
}

export function etatActuel(exercice: ExerciceEquationsComplexes, phase: PhaseEquationsComplexes): string[] | null {
  switch (exercice.famille) {
    case "A":
      return exercice.sousType === "sansBarre" ? null : etatActuelAAvec(exercice, phase);
    case "B":
      return etatActuelB(exercice, phase);
    case "C":
      return etatActuelC(exercice, phase);
    case "D":
      return etatActuelD(exercice, phase);
    case "E":
      return etatActuelE(exercice, phase);
    case "F":
      return etatActuelF(exercice, phase);
  }
}

export function champsEcran(exercice: ExerciceEquationsComplexes, phase: PhaseEquationsComplexes): ChampDef[] {
  switch (exercice.famille) {
    case "A":
      return exercice.sousType === "sansBarre" ? champsASans() : champsAAvec(phase);
    case "B":
      return champsB(phase);
    case "C":
      return champsC(phase);
    case "D":
      return champsD(phase);
    case "E":
      return [];
    case "F":
      return champsF(phase);
  }
}

export function niveauAideMaxEcran(exercice: ExerciceEquationsComplexes, phase: PhaseEquationsComplexes): number {
  switch (exercice.famille) {
    case "A":
      return exercice.sousType === "sansBarre" ? niveauAideMaxASans() : niveauAideMaxAAvec(phase);
    case "B":
      return niveauAideMaxB(phase);
    case "C":
      return niveauAideMaxC(phase);
    case "D":
      return niveauAideMaxD(phase);
    case "E":
      return niveauAideMaxE(phase);
    case "F":
      return niveauAideMaxF(phase);
  }
}

export function aideNiveau1(exercice: ExerciceEquationsComplexes, phase: PhaseEquationsComplexes): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return exercice.sousType === "sansBarre" ? aideNiveau1ASans() : aideNiveau1AAvec(phase);
    case "B":
      return aideNiveau1B(phase);
    case "C":
      return aideNiveau1C(phase);
    case "D":
      return aideNiveau1D(phase);
    case "E":
      return aideNiveau1E(phase);
    case "F":
      return aideNiveau1F(phase);
  }
}

export function aideNiveau2(exercice: ExerciceEquationsComplexes, phase: PhaseEquationsComplexes): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return exercice.sousType === "sansBarre" ? aideNiveau2ASans(exercice) : aideNiveau2AAvec(exercice, phase);
    case "B":
      return aideNiveau2B(exercice, phase);
    case "C":
      return aideNiveau2C(exercice, phase);
    case "D":
      return aideNiveau2D(exercice, phase);
    case "E":
      return aideNiveau2E(exercice, phase);
    case "F":
      return aideNiveau2F(exercice, phase);
  }
}

/** Nombre de valeurs attendu pour un écran "ensemble" (add-as-needed) — `0` pour tout autre type
 * d'écran (QCM ou champs fixes, non concerné). */
export function nombreCibleEnsemble(exercice: ExerciceEquationsComplexes, phase: PhaseEquationsComplexes): number {
  if (exercice.famille === "C" && phase === "cEcran2") return 2;
  if (exercice.famille === "D" && (phase === "dEcran2" || phase === "dEcran3")) return 2;
  if (exercice.famille === "E" && phase === "eEcran2") return 2;
  if (exercice.famille === "E" && phase === "eEcran3") return 4;
  if (exercice.famille === "F" && phase === "fEcran4") return 2;
  if (exercice.famille === "F" && phase === "fEcran5") return 4;
  return 0;
}

export const LIBELLE_PHASE: Record<PhaseEquationsComplexes, string> = {
  aSansEcran1: "Résultat",
  aAvecEcran1: "Étape 1 (système)",
  aAvecEcran2: "Étape 2 (x, y, z)",
  bEcran1: "Étape 1 (équation développée)",
  bEcran2: "Étape 2 (valeur de z)",
  cEcran1: "Étape 1 (Δ)",
  cEcran2: "Étape 2 (les 2 solutions)",
  dEcran1: "Étape 1 (Δ)",
  dEcran2: "Étape 2 (√Δ)",
  dEcran3: "Étape 3 (les 2 solutions)",
  eEcran1: "Étape 1 (équation en u)",
  eEcran2: "Étape 2 (valeurs de u)",
  eEcran3: "Étape 3 (les 4 solutions)",
  fEcran1: "Étape 1 (r₁)",
  fEcran2: "Étape 2 (quotient cubique)",
  fEcran3: "Étape 3 (r₂ et quotient quadratique)",
  fEcran4: "Étape 4 (racines complexes)",
  fEcran5: "Étape 5 (les 4 solutions)",
};

export const LIBELLE_FAMILLE: Record<ExerciceEquationsComplexes["famille"], string> = {
  A: "A — Linéaire en z (avec ou sans z̄)",
  B: "B — Équation rationnelle en z",
  C: "C — Quadratique, Δ réel négatif",
  D: "D — Quadratique, Δ complexe",
  E: "E — Quartique biquadratique u=z²",
  F: "F — Quartique, racines rationnelles et division",
};

/** Récapitulatif final : affiche toujours la réponse CORRECTE connue de l'exercice — jamais
 * recalculée depuis la saisie élève. */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceEquationsComplexes, phase: PhaseEquationsComplexes): string[] {
  if (exercice.famille === "A" && exercice.sousType === "sansBarre") {
    return [`z=${entierComplexeLatex(exercice.z.re, exercice.z.im)}`];
  }
  if (exercice.famille === "A" && exercice.sousType === "avecBarre") {
    if (phase === "aAvecEcran1") return [`${equationSystemeALatex(exercice.a + exercice.b, "x", exercice.c)}\\text{, }${equationSystemeALatex(exercice.a - exercice.b, "y", exercice.d)}`];
    return [`x=${exercice.x}\\text{, }y=${exercice.y}\\text{, }z=${entierComplexeLatex(exercice.x, exercice.y)}`];
  }
  if (exercice.famille === "B") {
    if (phase === "bEcran1") return [`${coteLatex([termeVarReel(exercice.a, "z"), termeConstanteReelle(exercice.b)])}=${coteLatex([termeVarComplexe(exercice.kc, "z"), termeConstanteComplexe(exercice.kd)])}`];
    return [`z=${entierComplexeLatex(exercice.z.re, exercice.z.im)}`];
  }
  if (exercice.famille === "C") {
    if (phase === "cEcran1") return [`\\Delta=${exercice.delta}`];
    return [`z_1=${entierComplexeLatex(exercice.racines[0].re, exercice.racines[0].im)}\\text{, }z_2=${entierComplexeLatex(exercice.racines[1].re, exercice.racines[1].im)}`];
  }
  if (exercice.famille === "D") {
    if (phase === "dEcran1") return [`\\Delta=${entierComplexeLatex(exercice.delta.re, exercice.delta.im)}`];
    if (phase === "dEcran2") return [`${entierComplexeLatex(exercice.racinesDelta[0].re, exercice.racinesDelta[0].im)}\\text{, }${entierComplexeLatex(exercice.racinesDelta[1].re, exercice.racinesDelta[1].im)}`];
    return [`z_1=${entierComplexeLatex(exercice.racines[0].re, exercice.racines[0].im)}\\text{, }z_2=${entierComplexeLatex(exercice.racines[1].re, exercice.racines[1].im)}`];
  }
  if (exercice.famille === "E") {
    if (phase === "eEcran1") return [`${coteLatex([termeVarComplexe(exercice.a, "U^2"), termeVarComplexe(exercice.b, "U"), termeConstanteComplexe(exercice.c)])}=0`];
    if (phase === "eEcran2") return [`u_1=${entierComplexeLatex(exercice.u1.re, exercice.u1.im)}\\text{, }u_2=${entierComplexeLatex(exercice.u2.re, exercice.u2.im)}`];
    return [exercice.racines.map((r) => entierComplexeLatex(r.re, r.im)).join("\\text{, }")];
  }
  // famille F
  if (phase === "fEcran1") return [`r_1=${exercice.r1}`];
  if (phase === "fEcran2") return [`${polynomeLatex(exercice.quotientCubique, 3)}=0`];
  if (phase === "fEcran3") return [`r_2=${exercice.r2}\\text{, }${polynomeLatex(exercice.quotientQuadratique, 2)}=0`];
  if (phase === "fEcran4") return [`${entierComplexeLatex(exercice.p, exercice.q)}\\text{, }${entierComplexeLatex(exercice.p, -exercice.q)}`];
  return [exercice.racines.map((r) => entierComplexeLatex(r.re, r.im)).join("\\text{, }")];
}

/** Total points du récapitulatif final — maximum VARIABLE (100 × nombre d'écrans réellement
 * traversés par CET exercice). */
export function calculerTotalPointsEquationsComplexes(resultat: ResultatExerciceEquationsComplexes): { total: number; maximum: number } {
  const phases = phasesPourExercice(resultat.exercice);
  const total = phases.reduce((acc, phase) => acc + (resultat.scores[phase] ?? 0), 0);
  return { total, maximum: phases.length * 100 };
}
