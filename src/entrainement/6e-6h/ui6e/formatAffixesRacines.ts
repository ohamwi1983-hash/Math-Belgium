import type { ExerciceAffixesRacines, IdRelationParallelogramme, IdSystemeRacine } from "../core6e/affixesRacines.types";
import type { PhaseAffixesRacines, ResultatExerciceAffixesRacines } from "../moteur6e/typesAffixesRacines";
import { phasesPourExercice } from "../moteur6e/typesAffixesRacines";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage LaTeX pour `6gen35`. Dispatch sur
 * `exercice.famille` PUIS `phase`, mirroir `formatNombresComplexes.ts` (6gen34), jamais importé par
 * un autre générateur (chaque générateur reste indépendant — CLAUDE.md).
 *
 * **Vigilance signe orphelin / groupe LaTeX vide** (bug déjà rencontré et corrigé sur 6gen23/
 * 6gen26/6gen34, documenté par CLAUDE.md) — `complexeLatex` ci-dessous est LA seule fonction qui
 * assemble un "a+bi" — assemble TOUJOURS signe+magnitude ENSEMBLE (jamais un signe bare), jamais
 * appelée en dehors de ce module. Testé explicitement (`formatAffixesRacines.test.ts`, régression
 * sur beaucoup de tirages des 3 variantes, y compris les options QCM).
 */

export type TypeChamp = "texte" | "choix";

export interface ChampDef {
  type: TypeChamp;
  label: string;
  placeholder?: string;
}

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

const AUCUNE_AIDE: AideAvecLatex = { texte: "", latex: null };

// ============================================================================
// Formatage "a+bi" — LA fonction centrale, voir en-tête de fichier.
// ============================================================================

interface FractionEntiere {
  num: number;
  den: number;
}

/** Magnitude seule (jamais de signe) — fraction réduite en LaTeX, entier si `den===1`. */
function fracLatex(num: number, den: number): string {
  return den === 1 ? `${num}` : `\\frac{${num}}{${den}}`;
}

/** Magnitude d'un COEFFICIENT DE i — comme `fracLatex`, sauf que "1" est omis (convention "i" plutôt
 * que "1i", jamais appliquée à la partie réelle). */
function magnitudeCoefI(num: number, den: number): string {
  return num === 1 && den === 1 ? "" : fracLatex(num, den);
}

/** LA fonction d'assemblage "a+bi" — signe+magnitude TOUJOURS ensemble, jamais un signe orphelin ni
 * de groupe vide (voir en-tête de fichier). */
function complexeLatex(reFrac: FractionEntiere, imFrac: FractionEntiere): string {
  const reZero = reFrac.num === 0;
  const imZero = imFrac.num === 0;
  if (reZero && imZero) return "0";

  const reTexte = reZero ? "" : reFrac.num < 0 ? `-${fracLatex(-reFrac.num, reFrac.den)}` : fracLatex(reFrac.num, reFrac.den);
  if (imZero) return reTexte;

  const imSigne = imFrac.num < 0 ? "-" : "+";
  const imMagnitude = magnitudeCoefI(Math.abs(imFrac.num), imFrac.den);
  if (reZero) return `${imFrac.num < 0 ? "-" : ""}${imMagnitude}i`;
  return `${reTexte}${imSigne}${imMagnitude}i`;
}

/** Raccourci pour un couple d'entiers exacts (familles A/C, jamais de fraction). */
export function entierComplexeLatex(re: number, im: number): string {
  return complexeLatex({ num: re, den: 1 }, { num: im, den: 1 });
}

/** Enveloppe une valeur signée dans des parenthèses SI elle est négative — nécessaire dès qu'on
 * combine 2 fois la MÊME variable brute avec un opérateur explicite (ex. "a-a", "b+b" dans l'aide
 * amorcée de la famille A) : sans ça, `a=-1` produirait un double signe orphelin "(-1--1)" ou
 * "(-1-+1)" (bug trouvé par cette régression même, voir `formatAffixesRacines.test.ts`) — jamais un
 * problème pour une SEULE occurrence après "=" (un simple "-3" est un nombre valide, jamais un signe
 * orphelin), donc appliqué UNIQUEMENT à ces cas de combinaison répétée. */
function envelopperSiNegatif(v: number): string {
  return v < 0 ? `(${v})` : `${v}`;
}

/** Convertit une valeur DOUBLÉE (entier) en fraction {num,den} — pair -> entier réduit, impair ->
 * demi-entier DÉJÀ réduit (gcd(impair,2)=1, voir en-tête `core6e/affixesRacines.types.ts`). */
function fractionDepuisDouble(v2: number): FractionEntiere {
  return v2 % 2 === 0 ? { num: v2 / 2, den: 1 } : { num: v2, den: 2 };
}

/** Affixe famille B (potentiellement demi-entière) — reconstruite EXACTEMENT depuis les valeurs
 * doublées brutes, jamais depuis un quotient flottant déjà calculé. */
function affixeDemiEntiereLatex(re2: number, im2: number): string {
  return complexeLatex(fractionDepuisDouble(re2), fractionDepuisDouble(im2));
}

// ============================================================================
// Famille A — Propriétés de z+z̄ et z−z̄.
// ============================================================================

export function consigneGeneraleA(): string {
  return "z est un nombre complexe donné. Calcule z+z̄ et z−z̄, chacun sous la forme a+bi.";
}
export function blocDonneesA(e: Extract<ExerciceAffixesRacines, { famille: "A" }>): string[] {
  return [`z=${entierComplexeLatex(e.a, e.b)}`];
}
export function consigneEcranA(): string {
  return "Calcule z+z̄ et z−z̄, chacun sous la forme a+bi (0 s'il n'y a pas de partie réelle/imaginaire).";
}
export function champsA(): ChampDef[] {
  return [
    { type: "texte", label: "z+z̄ =", placeholder: "ex : 6" },
    { type: "texte", label: "z−z̄ =", placeholder: "ex : 4i" },
  ];
}
export function niveauAideMaxA(): number {
  return 2;
}
export function aideNiveau1A(): AideAvecLatex {
  return { texte: "z̄=a−bi — additionne (ou soustrais) z et z̄ terme à terme : parties réelles entre elles, parties imaginaires entre elles.", latex: null };
}
export function aideNiveau2A(e: Extract<ExerciceAffixesRacines, { famille: "A" }>): AideAvecLatex {
  const a = envelopperSiNegatif(e.a);
  const b = envelopperSiNegatif(e.b);
  return {
    texte: "Calcul amorcé (parties réelles déjà combinées, parties imaginaires pas encore combinées) :",
    latex: `z+\\bar z=${2 * e.a}+(${b}-${b})i\\text{, }z-\\bar z=(${a}-${a})+(${b}+${b})i`,
  };
}

// ============================================================================
// Famille B — Parallélogramme via affixes.
// ============================================================================

/** 4 options de l'écran 1 (QCM) — relation entre A,B,C,D dans un parallélogramme ABCD (dans cet
 * ordre de sommets). "correct" = les diagonales [AC]/[BD] ont le même milieu (A+C=B+D), donc
 * D=A-B+C. Les 3 distracteurs couvrent : `echangeDiagonales` (utilise [AB]/[CD] comme diagonales,
 * confusion sur QUELLE paire de sommets forme une diagonale), `signeInverse` (signe de A inversé),
 * `mauvaiseCombinaison` (signe de B inversé — cas où l'élève additionne au lieu de soustraire). */
export const OPTIONS_RELATION_B: { id: IdRelationParallelogramme; latex: string }[] = [
  { id: "correct", latex: "D=A-B+C" },
  { id: "echangeDiagonales", latex: "D=A+B-C" },
  { id: "signeInverse", latex: "D=-A-B+C" },
  { id: "mauvaiseCombinaison", latex: "D=-A+B+C" },
];

export function consigneGeneraleB(): string {
  return "A, B, C sont 3 points du plan, donnés par leurs affixes. Détermine l'affixe du point D tel que ABCD (dans cet ordre) soit un parallélogramme.";
}
export function blocDonneesB(e: Extract<ExerciceAffixesRacines, { famille: "B" }>): string[] {
  return [`A=${affixeDemiEntiereLatex(e.reA2, e.imA2)}\\text{, }B=${affixeDemiEntiereLatex(e.reB2, e.imB2)}\\text{, }C=${affixeDemiEntiereLatex(e.reC2, e.imC2)}`];
}
export function consigneEcranB(phase: PhaseAffixesRacines): string {
  if (phase === "bEcran1") return "Dans un parallélogramme ABCD (dans cet ordre de sommets), quelle relation vectorielle entre les affixes de A, B, C, D est correcte ?";
  return "Calcule l'affixe de D à partir de la relation CONFIRMÉE à l'étape précédente, sous la forme a+bi.";
}
export function etatActuelB(phase: PhaseAffixesRacines): string[] | null {
  if (phase === "bEcran2") return ["\\text{Relation confirmée : }D=A-B+C"];
  return null;
}
export function champsB(phase: PhaseAffixesRacines): ChampDef[] {
  if (phase === "bEcran1") return [{ type: "choix", label: "Relation" }];
  return [{ type: "texte", label: "Affixe de D =", placeholder: "ex : 3+3i" }];
}
export function niveauAideMaxB(phase: PhaseAffixesRacines): number {
  return phase === "bEcran1" ? 2 : 0;
}
export function aideNiveau1B(phase: PhaseAffixesRacines): AideAvecLatex {
  if (phase === "bEcran1") return { texte: "Dans un parallélogramme, les 2 diagonales se coupent en leur milieu.", latex: null };
  return AUCUNE_AIDE;
}
export function aideNiveau2B(phase: PhaseAffixesRacines): AideAvecLatex {
  if (phase === "bEcran1") return { texte: "Égalité des milieux posée (résolution pour D non faite) :", latex: "\\dfrac{A+C}{2}=\\dfrac{B+D}{2}" };
  return AUCUNE_AIDE;
}

// ============================================================================
// Famille C — Racines carrées d'un nombre complexe.
// ============================================================================

/** 4 options de l'écran 1 (QCM) — système identifiant les parties réelle/imaginaire de
 * (x+yi)²=a+bi. "correct" = {x²-y²=a, 2xy=b}. Distracteurs : `permutation` (a et b échangés entre
 * les 2 équations), `signeInverse` (x²+y²=a au lieu de x²-y²=a), `facteurManquant` (xy=b au lieu de
 * 2xy=b, le facteur 2 du double produit oublié). */
export function OPTIONS_SYSTEME_C(a: number, b: number): { id: IdSystemeRacine; latex: string }[] {
  return [
    { id: "correct", latex: `x^2-y^2=${a}\\text{, }2xy=${b}` },
    { id: "permutation", latex: `x^2-y^2=${b}\\text{, }2xy=${a}` },
    { id: "signeInverse", latex: `x^2+y^2=${a}\\text{, }2xy=${b}` },
    { id: "facteurManquant", latex: `x^2-y^2=${a}\\text{, }xy=${b}` },
  ];
}

export function consigneGeneraleC(): string {
  return "Calcule les 2 racines carrées complexes du nombre a+bi ci-dessous.";
}
export function blocDonneesC(e: Extract<ExerciceAffixesRacines, { famille: "C" }>): string[] {
  return [`a+bi=${entierComplexeLatex(e.a, e.b)}`];
}
export function consigneEcranC(phase: PhaseAffixesRacines): string {
  if (phase === "cEcran1") return "Pose le système qui identifie les parties réelle et imaginaire de (x+yi)²=a+bi.";
  if (phase === "cEcran2") return "Résous le système CONFIRMÉ à l'étape précédente pour x (substitue y=b/(2x) dans la 1ère équation, filtre la solution réelle valide x²>0).";
  return "Déduis y à partir du x CONFIRMÉ à l'étape précédente (y=b/(2x)), puis donne les 2 racines carrées ±(x+yi).";
}
export function etatActuelC(e: Extract<ExerciceAffixesRacines, { famille: "C" }>, phase: PhaseAffixesRacines): string[] | null {
  if (phase === "cEcran2") return [`\\text{Système confirmé : }x^2-y^2=${e.a}\\text{, }2xy=${e.b}`];
  // Écran 3 : liste TOUTES les réponses confirmées des écrans précédents (1 ET 2), du plus ancien
  // au plus récent — jamais seulement celle de l'écran immédiatement précédent (audit transversal
  // "état actuel cumulatif", bug trouvé ici : le système confirmé à l'écran 1 disparaissait dès
  // l'écran 3).
  if (phase === "cEcran3") return [`\\text{Système confirmé : }x^2-y^2=${e.a}\\text{, }2xy=${e.b}`, `\\text{x confirmé : }x=${e.xPositif}`];
  return null;
}
export function champsC(phase: PhaseAffixesRacines): ChampDef[] {
  if (phase === "cEcran1") return [{ type: "choix", label: "Système" }];
  if (phase === "cEcran2") return [{ type: "texte", label: "x =", placeholder: "ex : 2" }];
  return [];
}
export function niveauAideMaxC(phase: PhaseAffixesRacines): number {
  if (phase === "cEcran2" || phase === "cEcran3") return 2;
  return 0;
}
export function aideNiveau1C(phase: PhaseAffixesRacines): AideAvecLatex {
  if (phase === "cEcran2") return { texte: "Remplace y par b/(2x) dans x²−y²=a pour obtenir une équation ne portant plus que sur x.", latex: null };
  if (phase === "cEcran3") return { texte: "Une racine carrée complexe non nulle possède TOUJOURS 2 solutions, opposées l'une de l'autre.", latex: null };
  return AUCUNE_AIDE;
}
export function aideNiveau2C(e: Extract<ExerciceAffixesRacines, { famille: "C" }>, phase: PhaseAffixesRacines): AideAvecLatex {
  if (phase === "cEcran2") return { texte: "Équation biquadratique obtenue après substitution (résolution non faite) :", latex: `x^4-(${e.a})x^2-\\dfrac{(${e.b})^2}{4}=0` };
  if (phase === "cEcran3") return { texte: "Une des 2 racines déjà donnée (l'autre non) :", latex: `z_1=${entierComplexeLatex(e.xPositif, e.yDeduit)}` };
  return AUCUNE_AIDE;
}

// ============================================================================
// Dispatch commun.
// ============================================================================

export function consigneGenerale(exercice: ExerciceAffixesRacines): string {
  switch (exercice.famille) {
    case "A":
      return consigneGeneraleA();
    case "B":
      return consigneGeneraleB();
    case "C":
      return consigneGeneraleC();
  }
}

export function blocDonnees(exercice: ExerciceAffixesRacines): string[] {
  switch (exercice.famille) {
    case "A":
      return blocDonneesA(exercice);
    case "B":
      return blocDonneesB(exercice);
    case "C":
      return blocDonneesC(exercice);
  }
}

export function consigneEcran(exercice: ExerciceAffixesRacines, phase: PhaseAffixesRacines): string {
  switch (exercice.famille) {
    case "A":
      return consigneEcranA();
    case "B":
      return consigneEcranB(phase);
    case "C":
      return consigneEcranC(phase);
  }
}

export function etatActuel(exercice: ExerciceAffixesRacines, phase: PhaseAffixesRacines): string[] | null {
  switch (exercice.famille) {
    case "A":
      return null;
    case "B":
      return etatActuelB(phase);
    case "C":
      return etatActuelC(exercice, phase);
  }
}

export function champsEcran(exercice: ExerciceAffixesRacines, phase: PhaseAffixesRacines): ChampDef[] {
  switch (exercice.famille) {
    case "A":
      return champsA();
    case "B":
      return champsB(phase);
    case "C":
      return champsC(phase);
  }
}

export function niveauAideMaxEcran(exercice: ExerciceAffixesRacines, phase: PhaseAffixesRacines): number {
  switch (exercice.famille) {
    case "A":
      return niveauAideMaxA();
    case "B":
      return niveauAideMaxB(phase);
    case "C":
      return niveauAideMaxC(phase);
  }
}

export function aideNiveau1(exercice: ExerciceAffixesRacines, phase: PhaseAffixesRacines): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideNiveau1A();
    case "B":
      return aideNiveau1B(phase);
    case "C":
      return aideNiveau1C(phase);
  }
}

export function aideNiveau2(exercice: ExerciceAffixesRacines, phase: PhaseAffixesRacines): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideNiveau2A(exercice);
    case "B":
      return aideNiveau2B(phase);
    case "C":
      return aideNiveau2C(exercice, phase);
  }
}

export const LIBELLE_PHASE: Record<PhaseAffixesRacines, string> = {
  aEcran1: "Résultat",
  bEcran1: "Étape 1 (relation)",
  bEcran2: "Étape 2 (affixe de D)",
  cEcran1: "Étape 1 (système)",
  cEcran2: "Étape 2 (valeur de x)",
  cEcran3: "Étape 3 (les 2 racines)",
};

export const LIBELLE_FAMILLE: Record<ExerciceAffixesRacines["famille"], string> = {
  A: "A — Propriétés de z+z̄ et z−z̄",
  B: "B — Parallélogramme via affixes",
  C: "C — Racines carrées d'un nombre complexe",
};

/** Récapitulatif final : affiche toujours la réponse CORRECTE connue de l'exercice — jamais
 * recalculée depuis la saisie élève. */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceAffixesRacines, phase: PhaseAffixesRacines): string[] {
  switch (exercice.famille) {
    case "A":
      return [`z+\\bar z=${entierComplexeLatex(exercice.somme.re, exercice.somme.im)}\\text{, }z-\\bar z=${entierComplexeLatex(exercice.difference.re, exercice.difference.im)}`];
    case "B":
      if (phase === "bEcran1") return ["D=A-B+C"];
      return [`D=${affixeDemiEntiereLatex(exercice.reD2, exercice.imD2)}`];
    case "C":
      if (phase === "cEcran1") return [`x^2-y^2=${exercice.a}\\text{, }2xy=${exercice.b}`];
      if (phase === "cEcran2") return [`x=${exercice.xPositif}`];
      return [`z_1=${entierComplexeLatex(exercice.xPositif, exercice.yDeduit)}\\text{, }z_2=${entierComplexeLatex(-exercice.xPositif, -exercice.yDeduit)}`];
  }
}

/** Total points du récapitulatif final — maximum VARIABLE (100 × nombre d'écrans réellement
 * traversés par CET exercice : 1 pour A, 2 pour B, 3 pour C). */
export function calculerTotalPointsAffixesRacines(resultat: ResultatExerciceAffixesRacines): { total: number; maximum: number } {
  const phases = phasesPourExercice(resultat.exercice);
  const total = phases.reduce((acc, phase) => acc + (resultat.scores[phase] ?? 0), 0);
  return { total, maximum: phases.length * 100 };
}
