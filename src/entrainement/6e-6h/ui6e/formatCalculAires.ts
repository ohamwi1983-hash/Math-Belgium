import type { ExerciceAireA, ExerciceAireB, ExerciceAireC, ExerciceAireD, ExerciceAireD_Parametre, ExerciceCalculAires, SigneFonction } from "../core6e/calculAires.types";
import type { TermeA } from "../core6e/calculPrimitives.types";
import type { PhaseCalculAires } from "../moteur6e/typesCalculAires";
import { CONSIGNE_PRECISION, decimalLatex, egalExactPuisApprox, fractionDepuisValeur, fractionLatex, racineSimplifiee } from "./nombresExactsIntegrales";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage LaTeX pour `6gen26`. Dispatch sur
 * `exercice.famille` PUIS `phase` (et `sousType` où pertinent), mirroir `formatCalculPrimitives.ts`
 * (6gen23), jamais importé (ui↔ui n'a pas de contrainte, mais chaque générateur reste indépendant
 * par convention de ce chantier — CLAUDE.md).
 *
 * **Vigilance signe orphelin (point 11 des clarifications de la spec, bug déjà rencontré et corrigé
 * sur 6gen23)** : UNE SEULE fonction assemble un terme signé complet (`termePolyLatex` ci-dessous) —
 * jamais un helper "signe seul" utilisé nu ailleurs dans ce fichier. Testé par une régression
 * dédiée dès le premier jet (`formatCalculAires.test.ts`, "aucun signe/groupe vide dans le LaTeX
 * généré").
 */

export type TypeChamp = "texte" | "choix";

export interface OptionChoix {
  valeur: string;
  label: string;
}

export interface ChampDef {
  type: TypeChamp;
  label: string;
  /** Libellé écrit en LaTeX (ex. une intégrale à bornes) — rendu À LA PLACE de `label` quand il est
   * fourni ; `label` reste le texte brut de repli (aperçu, historique). */
  labelLatex?: string;
  placeholder?: string;
  options?: OptionChoix[];
}

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

/** Texte brut mêlé à du LaTeX inline court — même contrat que `ui/formatEquationDroite.ts`/
 * `ui6e/formatProprietesLogarithme.ts` (dupliqué ici à dessein, convention CLAUDE.md : un type aussi
 * petit ne justifie pas un module partagé) ; rendu via `components/RenduFragments.tsx`. */
export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

function texte(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}
function latex(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
}

const AUCUNE_AIDE: AideAvecLatex = { texte: "", latex: null };

// ============================================================================
// Petits formateurs numériques/polynomiaux partagés.
// ============================================================================

/** Terme signé COMPLET (signe + magnitude), jamais le signe seul (voir en-tête de fichier). */
function termePolyLatex(t: TermeA, premier: boolean): string {
  const abs = Math.abs(t.coef);
  const s = t.coef < 0 ? (premier ? "-" : " - ") : premier ? "" : " + ";
  if (t.type === "constante") return `${s}${abs}`;
  if (t.type === "puissance") {
    const corps = t.n === 1 ? "x" : `x^{${t.n}}`;
    return `${s}${abs === 1 ? "" : abs}${corps}`;
  }
  // Famille A uniquement (terme unique, jamais mélangé à un polynôme) : expX/invX/cosX.
  switch (t.type) {
    case "expX":
      return `${s}${abs === 1 ? "" : abs}e^x`;
    case "invX":
      return `${s}\\dfrac{${abs}}{x}`;
    case "cosX":
      return `${s}${abs === 1 ? "" : abs}\\cos(x)`;
    default:
      return `${s}${abs}`;
  }
}

/** Somme de `TermeA` en LaTeX — `"0"` si vide (jamais une chaîne vide, qui produirait un groupe
 * KaTeX vide). */
export function polynomeLatex(termes: TermeA[]): string {
  if (termes.length === 0) return "0";
  return termes.map((t, i) => termePolyLatex(t, i === 0)).join("");
}

/** Suffixe « = valeur exacte ≈ valeur approchée » (audit chapitre 4, point 16) : fraction quand la
 * valeur est rationnelle (familles B, C, D — racines entières), forme close fournie sinon (famille
 * A), « ≈ » seulement devant un arrondi, toujours avec une virgule décimale. */
export function nombreLatex(x: number, exactLatex?: string | null): string {
  return egalExactPuisApprox(x, exactLatex);
}

const LABEL_SIGNE: Record<SigneFonction, string> = { positif: "f(x) \\geq 0", negatif: "f(x) \\leq 0" };

function signeLatex(s: SigneFonction): string {
  return LABEL_SIGNE[s];
}

const OPTIONS_SIGNE: OptionChoix[] = [
  { valeur: "positif", label: "f(x) ≥ 0" },
  { valeur: "negatif", label: "f(x) ≤ 0" },
];

const OPTIONS_ORDRE: OptionChoix[] = [
  { valeur: "fSurG", label: "f(x) ≥ g(x)" },
  { valeur: "gSurF", label: "g(x) ≥ f(x)" },
];

// ============================================================================
// Famille A — Aire courbe/axe, bornes données, signe constant.
// ============================================================================

function fLatexA(exercice: ExerciceAireA): string {
  return polynomeLatex([exercice.terme]);
}

/** e^n en LaTeX : 1, e, e^{n}. */
function puissanceELatex(n: number): string {
  if (n === 0) return "1";
  if (n === 1) return "e";
  return `e^{${n}}`;
}

/** Forme close EXACTE de l'aire de la famille A (audit point 16) :
 * - exponentielle : |c|·(e^b − e^a) ;
 * - rationnelle : |c|·ln(q), q = max(|a|,|b|) / min(|a|,|b|) ;
 * - trigonométrique : a, b ∈ {−1 ; 0 ; 1}, donc |c|·(b − a)·sin(1). */
export function aireExacteALatex(exercice: ExerciceAireA): string {
  const c = Math.abs(exercice.terme.coef);
  const { a, b } = exercice;
  if (exercice.type === "exponentielle") {
    const diff = `${puissanceELatex(b)}-${puissanceELatex(a)}`;
    return c === 1 ? diff : `${c}\\left(${diff}\\right)`;
  }
  if (exercice.type === "rationnelle") {
    const grand = Math.max(Math.abs(a), Math.abs(b));
    const petit = Math.min(Math.abs(a), Math.abs(b));
    const q = fractionLatex(grand, petit);
    const ln = q.includes("dfrac") ? `\\ln\\left(${q}\\right)` : `\\ln(${q})`;
    return c === 1 ? ln : `${c}${ln}`;
  }
  const k = c * (b - a);
  return k === 1 ? "\\sin(1)" : `${k}\\sin(1)`;
}

function aireA(exercice: ExerciceAireA): number {
  return Math.abs(exercice.primitiveReference(exercice.b) - exercice.primitiveReference(exercice.a));
}

export function consigneGeneraleA(): FragmentConsigne[] {
  return [
    texte("On considère la fonction f définie ci-dessous sur l'intervalle "),
    latex("[a;b]"),
    texte(". On veut calculer l'aire du domaine délimité par la courbe de f et l'axe des abscisses sur cet intervalle."),
  ];
}
export function blocDonneesA(exercice: ExerciceAireA): string[] {
  return [`f(x)=${fLatexA(exercice)}`, `a=${exercice.a}\\text{, }b=${exercice.b}`];
}
export function consigneEcranA(phase: PhaseCalculAires): FragmentConsigne[] {
  if (phase === "aEcran1") return [texte("Détermine le signe de "), latex("f(x)"), texte(" sur l'intervalle "), latex("[a;b]"), texte(".")];
  return [texte("Calcule l'aire du domaine délimité par la courbe de f et l'axe des abscisses sur "), latex("[a;b]"), texte(`, à partir du signe confirmé à l'étape précédente. ${CONSIGNE_PRECISION}`)];
}
export function etatActuelA(exercice: ExerciceAireA, phase: PhaseCalculAires): string[] | null {
  if (phase !== "aEcran2") return null;
  return [`\\text{Signe confirmé : }${signeLatex(exercice.signe)}`];
}
export function champsA(phase: PhaseCalculAires): ChampDef[] {
  if (phase === "aEcran1") return [{ type: "choix", label: "Signe de f sur [a;b] :", options: OPTIONS_SIGNE }];
  return [{ type: "texte", label: "Aire =", placeholder: "ex : 17/5" }];
}
export function niveauAideMaxA(): number {
  return 0;
}
export function aideNiveau1A(): AideAvecLatex {
  return AUCUNE_AIDE;
}
export function aideNiveau2A(): AideAvecLatex {
  return AUCUNE_AIDE;
}

// ============================================================================
// Famille B — Aire courbe/axe, bornes à trouver, signe constant.
// ============================================================================

export function consigneGeneraleB(): FragmentConsigne[] {
  return [texte("On considère la fonction f définie ci-dessous. On veut calculer l'aire du domaine délimité par sa courbe et l'axe des abscisses.")];
}
export function blocDonneesB(exercice: ExerciceAireB): string[] {
  return [`f(x)=${polynomeLatex(exercice.termes)}`];
}
export function consigneEcranB(phase: PhaseCalculAires): FragmentConsigne[] {
  if (phase === "bEcran1") return [texte("Trouve les racines de f : ce sont les bornes de la région dont on calcule l'aire.")];
  if (phase === "bEcran2") return [texte("Confirme le signe de f entre les racines trouvées à l'étape précédente.")];
  return [texte(`Calcule l'aire délimitée par la courbe de f et l'axe des abscisses entre ces racines, à partir du signe confirmé. ${CONSIGNE_PRECISION}`)];
}
export function etatActuelB(exercice: ExerciceAireB, phase: PhaseCalculAires): string[] | null {
  if (phase === "bEcran2") return [`r_1=${exercice.r1}\\text{, }r_2=${exercice.r2}`];
  if (phase === "bEcran3") return [`r_1=${exercice.r1}\\text{, }r_2=${exercice.r2}`, `\\text{Signe confirmé : }${signeLatex(exercice.signe)}`];
  return null;
}
export function champsB(phase: PhaseCalculAires): ChampDef[] {
  if (phase === "bEcran2") return [{ type: "choix", label: "Signe de f entre les racines :", options: OPTIONS_SIGNE }];
  if (phase === "bEcran3") return [{ type: "texte", label: "Aire =", placeholder: "ex : 17/5" }];
  return []; // bEcran1 : géré par le composant add-as-needed dédié, jamais par champsEcran.
}
export function niveauAideMaxB(phase: PhaseCalculAires): number {
  return phase === "bEcran1" ? 2 : 0;
}
export function aideNiveau1B(phase: PhaseCalculAires): AideAvecLatex {
  if (phase === "bEcran1") return { texte: "Sans bornes données, la région est délimitée par les points où la courbe coupe l'axe des abscisses : les racines de f.", latex: null };
  return AUCUNE_AIDE;
}
export function aideNiveau2B(exercice: ExerciceAireB, phase: PhaseCalculAires): AideAvecLatex {
  if (phase === "bEcran1") return { texte: "Équation à résoudre :", latex: `${polynomeLatex(exercice.termes)}=0` };
  return AUCUNE_AIDE;
}

// ============================================================================
// Famille C — Signe changeant, découper et sommer (piège central).
// ============================================================================

function integralesSousIntervallesC(exercice: ExerciceAireC): { iGauche: number; iDroit: number } {
  return {
    iGauche: exercice.primitiveReference(exercice.r2) - exercice.primitiveReference(exercice.r1),
    iDroit: exercice.primitiveReference(exercice.r3) - exercice.primitiveReference(exercice.r2),
  };
}

export function consigneGeneraleC(): FragmentConsigne[] {
  return [texte("On considère la fonction f définie ci-dessous, dont le signe change entre ses racines. On veut calculer l'aire totale du domaine délimité par sa courbe et l'axe des abscisses, entre sa plus petite et sa plus grande racine.")];
}
export function blocDonneesC(exercice: ExerciceAireC): string[] {
  return [`f(x)=${polynomeLatex(exercice.termes)}`];
}
export function consigneEcranC(phase: PhaseCalculAires): FragmentConsigne[] {
  if (phase === "cEcran1") return [texte("Trouve toutes les racines de f (ajoute autant de champs que nécessaire).")];
  if (phase === "cEcran2") return [texte("Détermine le signe de f sur chacun des deux sous-intervalles délimités par ces racines.")];
  if (phase === "cEcran3") return [texte("Calcule l'intégrale de f sur chaque sous-intervalle, séparément.")];
  return [texte(`Calcule l'aire totale du domaine — une aire est toujours positive. ${CONSIGNE_PRECISION}`)];
}
export function etatActuelC(exercice: ExerciceAireC, phase: PhaseCalculAires): string[] | null {
  const bornes = `r_1=${exercice.r1}\\text{, }r_2=${exercice.r2}\\text{, }r_3=${exercice.r3}`;
  const lignes: string[] = [];
  if (phase === "cEcran2" || phase === "cEcran3" || phase === "cEcran4") lignes.push(bornes);
  if (phase === "cEcran3" || phase === "cEcran4") {
    lignes.push(`\\text{sur }]${exercice.r1};${exercice.r2}[\\text{ : }${signeLatex(exercice.signeGauche)}`, `\\text{sur }]${exercice.r2};${exercice.r3}[\\text{ : }${signeLatex(exercice.signeDroit)}`);
  }
  if (phase === "cEcran4") {
    const { iGauche, iDroit } = integralesSousIntervallesC(exercice);
    lignes.push(`I_1${nombreLatex(iGauche)}`, `I_2${nombreLatex(iDroit)}`);
  }
  return lignes.length > 0 ? lignes : null;
}
export function champsC(exercice: ExerciceAireC, phase: PhaseCalculAires): ChampDef[] {
  if (phase === "cEcran2") {
    return [
      { type: "choix", label: `Signe de f sur ]${exercice.r1};${exercice.r2}[ :`, options: OPTIONS_SIGNE },
      { type: "choix", label: `Signe de f sur ]${exercice.r2};${exercice.r3}[ :`, options: OPTIONS_SIGNE },
    ];
  }
  if (phase === "cEcran3") {
    return [
      { type: "texte", label: `Intégrale de ${exercice.r1} à ${exercice.r2} =`, labelLatex: `\\displaystyle\\int_{${exercice.r1}}^{${exercice.r2}} f(x)\\,dx =`, placeholder: "ex : 17/5" },
      { type: "texte", label: `Intégrale de ${exercice.r2} à ${exercice.r3} =`, labelLatex: `\\displaystyle\\int_{${exercice.r2}}^{${exercice.r3}} f(x)\\,dx =`, placeholder: "ex : -17/5" },
    ];
  }
  if (phase === "cEcran4") return [{ type: "texte", label: "Aire totale =", placeholder: "ex : 34/5" }];
  return []; // cEcran1 : composant add-as-needed dédié.
}
export function niveauAideMaxC(phase: PhaseCalculAires): number {
  return phase === "cEcran4" ? 2 : 0;
}
export function aideNiveau1C(phase: PhaseCalculAires): AideAvecLatex {
  if (phase === "cEcran4") return { texte: "Une aire est toujours positive : chaque morceau où f est négative compte pour sa valeur absolue.", latex: "\\text{Aire}=|I_1|+|I_2|" };
  return AUCUNE_AIDE;
}
export function aideNiveau2C(exercice: ExerciceAireC, phase: PhaseCalculAires): AideAvecLatex {
  if (phase === "cEcran4") {
    const { iGauche, iDroit } = integralesSousIntervallesC(exercice);
    return { texte: "Les deux intégrales trouvées à l'étape précédente, avec leur signe :", latex: `I_1${nombreLatex(iGauche)}\\text{, }I_2${nombreLatex(iDroit)}` };
  }
  return AUCUNE_AIDE;
}

// ============================================================================
// Famille D — Aire entre deux courbes, avec variante paramètre.
// ============================================================================

function fLatexD(exercice: ExerciceAireD): string {
  if (exercice.sousType === "parametre") return "x^2";
  return polynomeLatex(exercice.termesF);
}
function gLatexD(exercice: ExerciceAireD): string {
  if (exercice.sousType === "parametre") return exercice.motif === "droiteParOrigine" ? "mx" : "m";
  return polynomeLatex(exercice.termesG);
}

export function consigneGeneraleD(exercice: ExerciceAireD): FragmentConsigne[] {
  if (exercice.sousType === "parametre")
    return [
      texte("On considère les deux courbes ci-dessous, qui dépendent d'un paramètre "),
      latex("m>0"),
      texte(". On veut déterminer m pour que l'aire du domaine compris entre elles soit égale à l'aire visée."),
    ];
  return [texte("On considère les courbes des fonctions f et g ci-dessous. On veut calculer l'aire du domaine compris entre elles.")];
}

export function blocDonneesD(exercice: ExerciceAireD): string[] {
  if (exercice.sousType === "parametre") {
    const intervalle = exercice.motif === "droiteParOrigine" ? "[0\\text{ ; }m]" : "[-\\sqrt{m}\\text{ ; }\\sqrt{m}]";
    return [`f(x)=${fLatexD(exercice)}`, `g(x)=${gLatexD(exercice)}\\ (m>0)`, `\\text{Intervalle : }${intervalle}`, `\\text{Aire visée : }${cibleExacteLatex(exercice)}`];
  }
  const donnees = [`f(x)=${fLatexD(exercice)}`, `g(x)=${gLatexD(exercice)}`];
  if (exercice.sousType === "bornesDonnees") return [...donnees, `a=${exercice.r1}\\text{, }b=${exercice.r2}`];
  return donnees;
}

export function consigneEcranD(exercice: ExerciceAireD, phase: PhaseCalculAires): FragmentConsigne[] {
  if (phase === "dEcran1") return [texte("Trouve les abscisses des points d'intersection des courbes de f et g : ce sont les bornes du domaine.")];
  if (phase === "dEcran2") return [texte("Détermine laquelle des deux courbes est au-dessus de l'autre sur l'intervalle.")];
  if (phase === "dEcran3") {
    if (exercice.sousType === "parametre") return [texte("Calcule l'aire du domaine compris entre les deux courbes, en fonction de m, à partir de l'ordre confirmé.")];
    return [texte(`Calcule l'aire du domaine compris entre les deux courbes sur l'intervalle, à partir de l'ordre confirmé. ${CONSIGNE_PRECISION}`)];
  }
  return [texte("Pose aire(m) = aire visée, à partir de l'expression trouvée à l'étape précédente, et résous pour "), latex("m>0"), texte(".")];
}

/** Expression de aire(m) (famille D, sous-type "parametre") — factorisée pour être réutilisée à la
 * fois par `formatReponseAttenduePhaseLatex` (dEcran3) et `etatActuelD` (dEcran4, qui doit rappeler
 * cette expression déjà confirmée), jamais dupliquée littéralement à 2 endroits. */
function expressionAireParametreLatex(exercice: ExerciceAireD_Parametre): string {
  return exercice.motif === "droiteParOrigine" ? "\\dfrac{m^3}{6}" : "\\dfrac{4}{3}m\\sqrt{m}";
}

/** Aire visée EXACTE (audit point 19) : m³/6 en fraction, ou (4/3)·m·√m avec √m simplifiée
 * (m = 5 → 20√5/3 ; m = 4 → 32/3). Jamais une valeur arrondie : l'élève résout une équation dessus. */
export function cibleExacteLatex(exercice: ExerciceAireD_Parametre): string {
  const m = exercice.m;
  if (exercice.motif === "droiteParOrigine") return fractionLatex(m * m * m, 6);
  const { coef, radicande } = racineSimplifiee(m);
  const num = 4 * m * coef;
  if (radicande === 1) return fractionLatex(num, 3);
  const f = fractionDepuisValeur(num / 3) ?? { num, den: 3 };
  const coefLatex = f.num === 1 ? "" : `${f.num}`;
  return f.den === 1 ? `${coefLatex}\\sqrt{${radicande}}` : `\\dfrac{${coefLatex}\\sqrt{${radicande}}}{${f.den}}`;
}

export function etatActuelD(exercice: ExerciceAireD, phase: PhaseCalculAires): string[] | null {
  // "bornesATrouver" seulement : pour "bornesDonnees" les bornes sont déjà dans le bloc données
  // (jamais "trouvées" par l'élève) — les rappeler ici violerait "1er écran jamais d'état actuel"
  // (dEcran2 EST le 1er écran traversé pour "bornesDonnees"/"parametre", voir `phaseInitiale`).
  const lignes: string[] = [];
  const aBornesConfirmees = exercice.sousType === "bornesATrouver";
  if (aBornesConfirmees && (phase === "dEcran2" || phase === "dEcran3" || phase === "dEcran4")) {
    lignes.push(`r_1=${exercice.r1}\\text{, }r_2=${exercice.r2}`);
  }
  if (phase === "dEcran3" || phase === "dEcran4") {
    const ordreLatex = exercice.ordre === "fSurG" ? "f(x)\\geq g(x)" : "g(x)\\geq f(x)";
    lignes.push(`\\text{Ordre confirmé : }${ordreLatex}`);
  }
  if (phase === "dEcran4" && exercice.sousType === "parametre") {
    lignes.push(`\\text{Aire}(m)=${expressionAireParametreLatex(exercice)}`, `\\text{Aire visée : }${cibleExacteLatex(exercice)}`);
  }
  return lignes.length > 0 ? lignes : null;
}

export function champsD(exercice: ExerciceAireD, phase: PhaseCalculAires): ChampDef[] {
  if (phase === "dEcran2") return [{ type: "choix", label: "Quelle courbe est au-dessus sur l'intervalle ?", options: OPTIONS_ORDRE }];
  if (phase === "dEcran3") return [{ type: "texte", label: "Aire =", placeholder: exercice.sousType === "parametre" ? "ex : 5m^2/4" : "ex : 17/5" }];
  if (phase === "dEcran4") return [{ type: "texte", label: "m =", placeholder: "ex : 9" }];
  return []; // dEcran1 : composant add-as-needed dédié.
}

export function niveauAideMaxD(phase: PhaseCalculAires): number {
  return phase === "dEcran2" ? 2 : 0;
}
export function aideNiveau1D(phase: PhaseCalculAires): AideAvecLatex {
  if (phase === "dEcran2") return { texte: "Calcule le signe de la différence suivante en un point de l'intervalle : il indique quelle courbe est au-dessus.", latex: "f(x)-g(x)" };
  return AUCUNE_AIDE;
}
function valeurFMoinsGTestD(exercice: ExerciceAireD, testX: number): number {
  if (exercice.sousType !== "parametre") return exercice.fReference(testX) - exercice.gReference(testX);
  // f(x)=x^2 pour les 2 motifs paramètre — g dépend du motif (voir `gLatexD`).
  const g = exercice.motif === "droiteParOrigine" ? exercice.m * testX : exercice.m;
  return testX * testX - g;
}

export function aideNiveau2D(exercice: ExerciceAireD, phase: PhaseCalculAires): AideAvecLatex {
  if (phase !== "dEcran2") return AUCUNE_AIDE;
  const testX = exercice.sousType === "parametre" ? (exercice.motif === "droiteParOrigine" ? exercice.m / 2 : 0) : (exercice.r1 + exercice.r2) / 2;
  const valeur = valeurFMoinsGTestD(exercice, testX);
  return { texte: "Valeur de la différence en un point de l'intervalle :", latex: `x=${decimalLatex(testX)}\\text{ : }f(x)-g(x)${nombreLatex(valeur)}` };
}

// ============================================================================
// Dispatch commun.
// ============================================================================

export function consigneGenerale(exercice: ExerciceCalculAires): FragmentConsigne[] {
  switch (exercice.famille) {
    case "A":
      return consigneGeneraleA();
    case "B":
      return consigneGeneraleB();
    case "C":
      return consigneGeneraleC();
    case "D":
      return consigneGeneraleD(exercice);
  }
}

export function blocDonnees(exercice: ExerciceCalculAires): string[] {
  switch (exercice.famille) {
    case "A":
      return blocDonneesA(exercice);
    case "B":
      return blocDonneesB(exercice);
    case "C":
      return blocDonneesC(exercice);
    case "D":
      return blocDonneesD(exercice);
  }
}

export function consigneEcran(exercice: ExerciceCalculAires, phase: PhaseCalculAires): FragmentConsigne[] {
  switch (exercice.famille) {
    case "A":
      return consigneEcranA(phase);
    case "B":
      return consigneEcranB(phase);
    case "C":
      return consigneEcranC(phase);
    case "D":
      return consigneEcranD(exercice, phase);
  }
}

export function etatActuel(exercice: ExerciceCalculAires, phase: PhaseCalculAires): string[] | null {
  switch (exercice.famille) {
    case "A":
      return etatActuelA(exercice, phase);
    case "B":
      return etatActuelB(exercice, phase);
    case "C":
      return etatActuelC(exercice, phase);
    case "D":
      return etatActuelD(exercice, phase);
  }
}

export function champsEcran(exercice: ExerciceCalculAires, phase: PhaseCalculAires): ChampDef[] {
  switch (exercice.famille) {
    case "A":
      return champsA(phase);
    case "B":
      return champsB(phase);
    case "C":
      return champsC(exercice, phase);
    case "D":
      return champsD(exercice, phase);
  }
}

export function niveauAideMaxEcran(exercice: ExerciceCalculAires, phase: PhaseCalculAires): number {
  switch (exercice.famille) {
    case "A":
      return niveauAideMaxA();
    case "B":
      return niveauAideMaxB(phase);
    case "C":
      return niveauAideMaxC(phase);
    case "D":
      return niveauAideMaxD(phase);
  }
}

export function aideNiveau1(exercice: ExerciceCalculAires, phase: PhaseCalculAires): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideNiveau1A();
    case "B":
      return aideNiveau1B(phase);
    case "C":
      return aideNiveau1C(phase);
    case "D":
      return aideNiveau1D(phase);
  }
}

export function aideNiveau2(exercice: ExerciceCalculAires, phase: PhaseCalculAires): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideNiveau2A();
    case "B":
      return aideNiveau2B(exercice, phase);
    case "C":
      return aideNiveau2C(exercice, phase);
    case "D":
      return aideNiveau2D(exercice, phase);
  }
}

export const LIBELLE_PHASE: Record<PhaseCalculAires, string> = {
  aEcran1: "Étape 1 (signe)",
  aEcran2: "Étape 2 (aire)",
  bEcran1: "Étape 1 (racines)",
  bEcran2: "Étape 2 (signe)",
  bEcran3: "Étape 3 (aire)",
  cEcran1: "Étape 1 (racines)",
  cEcran2: "Étape 2 (signes)",
  cEcran3: "Étape 3 (intégrales par morceau)",
  cEcran4: "Étape 4 (aire totale)",
  dEcran1: "Étape 1 (bornes)",
  dEcran2: "Étape 2 (ordre)",
  dEcran3: "Étape 3 (aire)",
  dEcran4: "Étape 4 (résoudre m)",
};

export const LIBELLE_FAMILLE: Record<ExerciceCalculAires["famille"], string> = {
  A: "A — Aire courbe/axe (signe constant)",
  B: "B — Aire courbe/axe (bornes à trouver)",
  C: "C — Signe changeant (découper et sommer)",
  D: "D — Aire entre deux courbes",
};

/** Récapitulatif final : affiche toujours la réponse CORRECTE connue de l'exercice — jamais
 * recalculée depuis la saisie élève. */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceCalculAires, phase: PhaseCalculAires): string[] {
  if (exercice.famille === "A") {
    if (phase === "aEcran1") return [signeLatex(exercice.signe)];
    return [`\\text{Aire}${nombreLatex(aireA(exercice), aireExacteALatex(exercice))}`];
  }
  if (exercice.famille === "B") {
    if (phase === "bEcran1") return [`r_1=${exercice.r1}\\text{, }r_2=${exercice.r2}`];
    if (phase === "bEcran2") return [signeLatex(exercice.signe)];
    const aire = Math.abs(exercice.primitiveReference(exercice.r2) - exercice.primitiveReference(exercice.r1));
    return [`\\text{Aire}${nombreLatex(aire)}`];
  }
  if (exercice.famille === "C") {
    if (phase === "cEcran1") return [`r_1=${exercice.r1}\\text{, }r_2=${exercice.r2}\\text{, }r_3=${exercice.r3}`];
    if (phase === "cEcran2") return [`${signeLatex(exercice.signeGauche)}\\text{, }${signeLatex(exercice.signeDroit)}`];
    const { iGauche, iDroit } = integralesSousIntervallesC(exercice);
    if (phase === "cEcran3") return [`I_1${nombreLatex(iGauche)}\\text{, }I_2${nombreLatex(iDroit)}`];
    return [`\\text{Aire totale}${nombreLatex(Math.abs(iGauche) + Math.abs(iDroit))}`];
  }
  // Famille D.
  if (phase === "dEcran1" && exercice.sousType !== "parametre") return [`r_1=${exercice.r1}\\text{, }r_2=${exercice.r2}`];
  if (phase === "dEcran2") return [exercice.ordre === "fSurG" ? "f(x)\\geq g(x)" : "g(x)\\geq f(x)"];
  if (phase === "dEcran3") {
    if (exercice.sousType === "parametre") {
      return [`\\text{Aire}(m)=${expressionAireParametreLatex(exercice)}`];
    }
    const aire = Math.abs(exercice.primitiveHReference(exercice.r2) - exercice.primitiveHReference(exercice.r1));
    return [`\\text{Aire}${nombreLatex(aire)}`];
  }
  if (exercice.sousType === "parametre") return [`m=${exercice.m}`];
  return [`\\text{${LIBELLE_PHASE[phase]}}`];
}

