import type { ExerciceNombresComplexes, ValeurComplexe } from "../core6e/nombresComplexes.types";
import type { FractionEntiere } from "../generateurs6e/nombresComplexes/fractionComplexe";
import { additionnerFractions, diviserComplexeExact } from "../generateurs6e/nombresComplexes/fractionComplexe";
import type { PhaseNombresComplexes, ResultatExerciceNombresComplexes } from "../moteur6e/typesNombresComplexes";
import { phasesPourExercice } from "../moteur6e/typesNombresComplexes";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage LaTeX pour `6gen34`. Dispatch sur
 * `exercice.famille` PUIS `phase`, mirroir `formatLongueurArc.ts`/`formatCalculAires.ts`, jamais
 * importé par un autre générateur (chaque générateur reste indépendant — CLAUDE.md).
 *
 * **Vigilance signe orphelin / groupe LaTeX vide** (bug déjà rencontré et corrigé sur 6gen23/
 * 6gen26, documenté par CLAUDE.md) — PARTICULIÈREMENT pertinent ICI : chaque famille de ce
 * générateur affiche potentiellement des DIZAINES de "a+bi" par session (données, état actuel,
 * réponse attendue), chacun avec un signe potentiellement négatif sur `a` ET/OU `b`. `complexeLatex`
 * ci-dessous est LA seule fonction qui assemble un "a+bi" — assemble TOUJOURS signe+magnitude
 * ENSEMBLE (jamais un signe bare), jamais appelée en dehors de ce module. Testé explicitement
 * (`formatNombresComplexes.test.ts`, régression sur beaucoup de tirages des 9 variantes).
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
// Formatage "a+bi" — LA fonction centrale, voir en-tête de fichier.
// ============================================================================

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
 * de groupe vide (voir en-tête de fichier). `reFrac`/`imFrac` déjà réduits (`den>0`,
 * `generateurs6e/nombresComplexes/fractionComplexe.ts`). */
export function complexeLatex(reFrac: FractionEntiere, imFrac: FractionEntiere): string {
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

/** Raccourci pour un couple d'entiers exacts (familles A/B/F/G, jamais de fraction). */
export function entierComplexeLatex(re: number, im: number): string {
  return complexeLatex({ num: re, den: 1 }, { num: im, den: 1 });
}

/** Reconstruit la fraction EXACTE (a+bi)/(c+di) depuis les entiers bruts — jamais depuis un
 * `ValeurComplexe` flottant déjà arrondi (voir en-tête `core6e/nombresComplexes.types.ts`). */
function divisionLatex(a: number, b: number, c: number, d: number): string {
  const { reFrac, imFrac } = diviserComplexeExact({ re: a, im: b }, { re: c, im: d });
  return complexeLatex(reFrac, imFrac);
}

/** Reconstruit la SOMME EXACTE de 2 fractions (a1+b1i)/(c1+d1i) + (a2+b2i)/(c2+d2i) depuis les
 * entiers bruts — famille E, écran 2. Même vigilance que `divisionLatex` : `exercice.resultat` est
 * un flottant réservé à la vérification numérique Couche B, JAMAIS affiché tel quel (un flottant
 * comme "2.8" viole la convention CLAUDE.md "fraction irréductible, jamais de décimal" — bug trouvé
 * par inspection visuelle réelle, voir `docs/historique-6e.md`). */
function sommeFractionsLatex(a1: number, b1: number, c1: number, d1: number, a2: number, b2: number, c2: number, d2: number): string {
  const f1 = diviserComplexeExact({ re: a1, im: b1 }, { re: c1, im: d1 });
  const f2 = diviserComplexeExact({ re: a2, im: b2 }, { re: c2, im: d2 });
  const reSomme = additionnerFractions(f1.reFrac, f2.reFrac);
  const imSomme = additionnerFractions(f1.imFrac, f2.imFrac);
  return complexeLatex(reSomme, imSomme);
}

/** k·i au dénominateur — "i" seul si k=1 (jamais "1i"). */
function kiLatex(k: number): string {
  return k === 1 ? "i" : `${k}i`;
}

function valeurComplexeLatex(v: ValeurComplexe): string {
  return entierComplexeLatex(v.re, v.im);
}

// ============================================================================
// Famille A — Addition et soustraction.
// ============================================================================

function operationLatex(op: "+" | "-"): string {
  return op === "+" ? "+" : "-";
}

export function consigneGeneraleA(): string {
  return "Calcule le résultat de l'opération suivante et donne-le sous la forme a+bi.";
}
export function blocDonneesA(e: Extract<ExerciceNombresComplexes, { famille: "A" }>): string[] {
  return [`(${entierComplexeLatex(e.a, e.b)})${operationLatex(e.operation)}(${entierComplexeLatex(e.c, e.d)})`];
}
export function consigneEcranA(): string {
  return "Calcule la somme ou différence ci-dessus, sous la forme a+bi.";
}
export function champsA(): ChampDef[] {
  return [{ type: "texte", label: "Résultat =", placeholder: "ex : 3-2i" }];
}

// ============================================================================
// Famille B — Multiplication et puissances.
// ============================================================================

export function consigneGeneraleB(): string {
  return "Calcule le résultat de l'opération suivante et donne-le sous la forme a+bi.";
}
export function blocDonneesB(e: Extract<ExerciceNombresComplexes, { famille: "B" }>): string[] {
  if (e.sousType === "produit") return [`(${entierComplexeLatex(e.a, e.b)})\\cdot(${entierComplexeLatex(e.c, e.d)})`];
  if (e.sousType === "carre") return [`(${entierComplexeLatex(e.a, e.b)})^2`];
  return [`(${entierComplexeLatex(e.a, e.b)})^3`];
}
export function consigneEcranB(e: Extract<ExerciceNombresComplexes, { famille: "B" }>, phase: PhaseNombresComplexes): string {
  if (phase === "bProduitEcran1") return "Développe le produit ci-dessus, sous la forme a+bi.";
  if (phase === "bCarreEcran1") return "Développe le carré ci-dessus (i²=-1), sous la forme a+bi.";
  if (phase === "bCubeEcran1") return "Calcule d'abord le carré (a+bi)², sous la forme a+bi.";
  return `Multiplie le carré CONFIRMÉ à l'étape précédente par (${entierComplexeLatex(e.a, e.b)}) pour obtenir le cube, sous la forme a+bi.`;
}
export function etatActuelB(e: Extract<ExerciceNombresComplexes, { famille: "B" }>, phase: PhaseNombresComplexes): string[] | null {
  if (e.sousType === "cube" && phase === "bCubeEcran2") return [`(${entierComplexeLatex(e.a, e.b)})^2=${valeurComplexeLatex(e.carre)}\\text{ (confirmé)}`];
  return null;
}
export function champsB(): ChampDef[] {
  return [{ type: "texte", label: "Résultat =", placeholder: "ex : -5+12i" }];
}
export function niveauAideMaxB(e: Extract<ExerciceNombresComplexes, { famille: "B" }>, phase: PhaseNombresComplexes): number {
  return e.sousType === "cube" && phase === "bCubeEcran2" ? 2 : 0;
}
export function aideNiveau1B(e: Extract<ExerciceNombresComplexes, { famille: "B" }>, phase: PhaseNombresComplexes): AideAvecLatex {
  if (e.sousType === "cube" && phase === "bCubeEcran2") return { texte: "(a+bi)³=(a+bi)²·(a+bi) — calcule ce produit en 2 étapes plutôt que de développer directement un trinôme au cube.", latex: null };
  return AUCUNE_AIDE;
}
export function aideNiveau2B(e: Extract<ExerciceNombresComplexes, { famille: "B" }>, phase: PhaseNombresComplexes): AideAvecLatex {
  if (e.sousType === "cube" && phase === "bCubeEcran2") return { texte: "Produit posé (développement non fait) :", latex: `(${valeurComplexeLatex(e.carre)})\\cdot(${entierComplexeLatex(e.a, e.b)})` };
  return AUCUNE_AIDE;
}

// ============================================================================
// Famille C — Division par conjugué.
// ============================================================================

export function consigneGeneraleC(): string {
  return "Calcule le résultat de la division suivante et donne-le sous la forme a+bi.";
}
export function blocDonneesC(e: Extract<ExerciceNombresComplexes, { famille: "C" }>): string[] {
  return [`\\dfrac{${entierComplexeLatex(e.a, e.b)}}{${entierComplexeLatex(e.c, e.d)}}`];
}
export function consigneEcranC(phase: PhaseNombresComplexes): string {
  if (phase === "cEcran1") return "Multiplie le numérateur ET le dénominateur par le conjugué du dénominateur, et développe les deux.";
  return "Simplifie sous la forme a+bi, à partir du numérateur/dénominateur CONFIRMÉS à l'étape précédente.";
}
export function etatActuelC(e: Extract<ExerciceNombresComplexes, { famille: "C" }>, phase: PhaseNombresComplexes): string[] | null {
  if (phase === "cEcran2") return [`\\text{Numérateur confirmé : }${valeurComplexeLatex(e.numerateurDeveloppe)}\\text{, dénominateur confirmé : }${e.denominateurDeveloppe}`];
  return null;
}
export function champsC(phase: PhaseNombresComplexes): ChampDef[] {
  // Labels COURTS délibérément (jamais "Numérateur développé =" / "Dénominateur développé =") —
  // bug de débordement horizontal trouvé par inspection visuelle réelle sur un viewport 1280px : 2
  // champs côte à côte avec des labels longs réduisent le `.text-input` à quelques pixels de large
  // (placeholder tronqué à "ex"/"e)") — même classe de bug déjà documentée pour 6gen30/32/33
  // (CLAUDE.md, "Débordement horizontal"). La consigne de l'écran ("multiplie... et développe les
  // deux") donne déjà le contexte "développé", inutile de le répéter dans le label du champ.
  if (phase === "cEcran1")
    return [
      { type: "texte", label: "Numérateur =", placeholder: "ex : 5+3i" },
      { type: "texte", label: "Dénominateur =", placeholder: "ex : 13" },
    ];
  return [{ type: "texte", label: "Résultat =", placeholder: "ex : 0.5+1.5i" }];
}
export function niveauAideMaxC(phase: PhaseNombresComplexes): number {
  return phase === "cEcran1" ? 2 : 0;
}
export function aideNiveau1C(phase: PhaseNombresComplexes): AideAvecLatex {
  if (phase === "cEcran1") return { texte: "Multiplier par le conjugué du dénominateur élimine sa partie imaginaire : (c+di)(c-di)=c²+d², un réel.", latex: null };
  return AUCUNE_AIDE;
}
export function aideNiveau2C(e: Extract<ExerciceNombresComplexes, { famille: "C" }>, phase: PhaseNombresComplexes): AideAvecLatex {
  if (phase === "cEcran1") return { texte: "Dénominateur déjà développé (réel) — numérateur non développé :", latex: `\\text{dénominateur}=${e.denominateurDeveloppe}` };
  return AUCUNE_AIDE;
}

// ============================================================================
// Famille D — Division par ki.
// ============================================================================

export function consigneGeneraleD(): string {
  return "Calcule le résultat de la division suivante et donne-le sous la forme a+bi.";
}
export function blocDonneesD(e: Extract<ExerciceNombresComplexes, { famille: "D" }>): string[] {
  return [`\\dfrac{${entierComplexeLatex(e.a, e.b)}}{${kiLatex(e.k)}}`];
}
export function consigneEcranD(): string {
  return "Diviser par i (ou ki) équivaut à multiplier par -i (ou -i/k) — calcule directement, sous la forme a+bi.";
}
export function champsD(): ChampDef[] {
  return [{ type: "texte", label: "Résultat =", placeholder: "ex : 2-i" }];
}
export function niveauAideMaxD(): number {
  return 2;
}
export function aideNiveau1D(): AideAvecLatex {
  return { texte: "1/i=-i (vérifiable par i×(-i)=-i²=1).", latex: null };
}
export function aideNiveau2D(e: Extract<ExerciceNombresComplexes, { famille: "D" }>): AideAvecLatex {
  return { texte: "Expression réécrite comme un produit (calcul final non fait) :", latex: `(${entierComplexeLatex(e.a, e.b)})\\cdot\\left(${e.k === 1 ? "" : `\\dfrac{1}{${e.k}}`}-i\\right)` };
}

// ============================================================================
// Famille E — Combiner 2 fractions.
// ============================================================================

export function consigneGeneraleE(): string {
  return "Calcule le résultat de la somme suivante et donne-le sous la forme a+bi.";
}
export function blocDonneesE(e: Extract<ExerciceNombresComplexes, { famille: "E" }>): string[] {
  return [`\\dfrac{${entierComplexeLatex(e.a1, e.b1)}}{${entierComplexeLatex(e.c1, e.d1)}}+\\dfrac{${entierComplexeLatex(e.a2, e.b2)}}{${entierComplexeLatex(e.c2, e.d2)}}`];
}
export function consigneEcranE(phase: PhaseNombresComplexes): string {
  if (phase === "eEcran1") return "Mets chaque fraction séparément sous forme a+bi (conjugué de chaque dénominateur).";
  return "Additionne les 2 résultats CONFIRMÉS à l'étape précédente, sous la forme a+bi.";
}
export function etatActuelE(e: Extract<ExerciceNombresComplexes, { famille: "E" }>, phase: PhaseNombresComplexes): string[] | null {
  // Reconstruit depuis les entiers bruts (`divisionLatex`), JAMAIS depuis `e.fraction1`/`e.fraction2`
  // (flottants — voir `sommeFractionsLatex` pour la même vigilance appliquée à l'écran 2).
  if (phase === "eEcran2") return [`\\text{Fraction 1 confirmée : }${divisionLatex(e.a1, e.b1, e.c1, e.d1)}\\text{, fraction 2 confirmée : }${divisionLatex(e.a2, e.b2, e.c2, e.d2)}`];
  return null;
}
export function champsE(phase: PhaseNombresComplexes): ChampDef[] {
  if (phase === "eEcran1")
    return [
      { type: "texte", label: "1ère fraction =", placeholder: "ex : 1-i" },
      { type: "texte", label: "2ème fraction =", placeholder: "ex : 1+i" },
    ];
  return [{ type: "texte", label: "Résultat =", placeholder: "ex : 2" }];
}
export function niveauAideMaxE(phase: PhaseNombresComplexes): number {
  return phase === "eEcran1" ? 2 : 0;
}
export function aideNiveau1E(phase: PhaseNombresComplexes): AideAvecLatex {
  if (phase === "eEcran1") return { texte: "Traite chaque fraction séparément avec le conjugué de SON propre dénominateur, plutôt que de combiner les 2 fractions sur un dénominateur commun (valide mais beaucoup plus lourd).", latex: null };
  return AUCUNE_AIDE;
}
export function aideNiveau2E(e: Extract<ExerciceNombresComplexes, { famille: "E" }>, phase: PhaseNombresComplexes): AideAvecLatex {
  if (phase === "eEcran1") return { texte: "Conjugué du 1er dénominateur (calcul non fait) :", latex: `\\overline{${entierComplexeLatex(e.c1, e.d1)}}=${entierComplexeLatex(e.c1, -e.d1)}` };
  return AUCUNE_AIDE;
}

// ============================================================================
// Famille F — Simplifier le quotient avant de mettre au carré.
// ============================================================================

export function consigneGeneraleF(): string {
  return "Calcule le résultat de l'expression suivante et donne-le sous la forme a+bi.";
}
export function blocDonneesF(e: Extract<ExerciceNombresComplexes, { famille: "F" }>): string[] {
  return [`\\left(\\dfrac{${entierComplexeLatex(e.numRe, e.numIm)}}{${entierComplexeLatex(e.c, e.d)}}\\right)^2`];
}
export function consigneEcranF(phase: PhaseNombresComplexes): string {
  if (phase === "fEcran1") return "Simplifie le quotient interne via le conjugué, AVANT toute mise au carré.";
  return "Élève au carré le résultat CONFIRMÉ à l'étape précédente, sous la forme a+bi.";
}
export function etatActuelF(e: Extract<ExerciceNombresComplexes, { famille: "F" }>, phase: PhaseNombresComplexes): string[] | null {
  if (phase === "fEcran2") return [`\\text{Quotient simplifié confirmé : }${valeurComplexeLatex(e.quotientSimplifie)}`];
  return null;
}
export function champsF(phase: PhaseNombresComplexes): ChampDef[] {
  if (phase === "fEcran1") return [{ type: "texte", label: "Quotient interne simplifié =", placeholder: "ex : i" }];
  return [{ type: "texte", label: "Résultat =", placeholder: "ex : -1" }];
}
export function niveauAideMaxF(phase: PhaseNombresComplexes): number {
  return phase === "fEcran1" ? 2 : 0;
}
export function aideNiveau1F(phase: PhaseNombresComplexes): AideAvecLatex {
  if (phase === "fEcran1") return { texte: "Vérifie TOUJOURS si un quotient à l'intérieur d'une puissance peut se simplifier avant de développer quoi que ce soit — développer numérateur² et dénominateur² séparément est bien plus long et risqué.", latex: null };
  return AUCUNE_AIDE;
}
export function aideNiveau2F(e: Extract<ExerciceNombresComplexes, { famille: "F" }>, phase: PhaseNombresComplexes): AideAvecLatex {
  if (phase === "fEcran1") return { texte: "Conjugué du dénominateur interne (simplification finale non faite) :", latex: `\\overline{${entierComplexeLatex(e.c, e.d)}}=${entierComplexeLatex(e.c, -e.d)}` };
  return AUCUNE_AIDE;
}

// ============================================================================
// Famille G — Puissances de i.
// ============================================================================

export function consigneGeneraleG(): string {
  return "Détermine la valeur de la puissance de i suivante.";
}
export function blocDonneesG(e: Extract<ExerciceNombresComplexes, { famille: "G" }>): string[] {
  return [`i^{${e.n}}`];
}
export function consigneEcranG(e: Extract<ExerciceNombresComplexes, { famille: "G" }>, phase: PhaseNombresComplexes): string {
  if (phase === "gEcran1") {
    return e.n >= 0
      ? "Détermine le reste de la division de l'exposant par 4."
      : "Convertis l'exposant négatif en une forme équivalente positive, puis réduis modulo 4 (donne le reste, dans {0,1,2,3}).";
  }
  return "Donne la valeur du cycle {i⁰=1, i¹=i, i²=-1, i³=-i} correspondant au reste CONFIRMÉ à l'étape précédente.";
}
export function etatActuelG(e: Extract<ExerciceNombresComplexes, { famille: "G" }>, phase: PhaseNombresComplexes): string[] | null {
  if (phase === "gEcran2") return [`\\text{Reste confirmé : }${e.reste}`];
  return null;
}
export function champsG(phase: PhaseNombresComplexes): ChampDef[] {
  if (phase === "gEcran1") return [{ type: "texte", label: "Reste (mod 4) =", placeholder: "ex : 1" }];
  return [{ type: "texte", label: "Valeur =", placeholder: "ex : i" }];
}
export function niveauAideMaxG(phase: PhaseNombresComplexes): number {
  return phase === "gEcran1" ? 2 : 0;
}
export function aideNiveau1G(e: Extract<ExerciceNombresComplexes, { famille: "G" }>, phase: PhaseNombresComplexes): AideAvecLatex {
  if (phase !== "gEcran1") return AUCUNE_AIDE;
  if (e.n < 0) return { texte: "i^(-n)=1/i^n — le cycle des puissances négatives suit le même schéma, décalé : i⁻¹=-i, i⁻²=-1, i⁻³=i, i⁻⁴=1.", latex: null };
  return { texte: "i a une période de 4 (i⁰=1, i¹=i, i²=-1, i³=-i, puis ça recommence) — réduis l'exposant modulo 4.", latex: null };
}
export function aideNiveau2G(e: Extract<ExerciceNombresComplexes, { famille: "G" }>, phase: PhaseNombresComplexes): AideAvecLatex {
  if (phase !== "gEcran1") return AUCUNE_AIDE;
  if (e.n < 0) return { texte: "Exposant reformulé comme positif équivalent (valeur finale non donnée) :", latex: `i^{${e.n}}=\\dfrac{1}{i^{${-e.n}}}` };
  const quotient = Math.floor(e.n / 4);
  return { texte: "Décomposition posée (reste non calculé) :", latex: `${e.n}=4\\times ${quotient}+?` };
}

// ============================================================================
// Dispatch commun.
// ============================================================================

export function consigneGenerale(exercice: ExerciceNombresComplexes): string {
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
    case "F":
      return consigneGeneraleF();
    case "G":
      return consigneGeneraleG();
  }
}

export function blocDonnees(exercice: ExerciceNombresComplexes): string[] {
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
    case "F":
      return blocDonneesF(exercice);
    case "G":
      return blocDonneesG(exercice);
  }
}

export function consigneEcran(exercice: ExerciceNombresComplexes, phase: PhaseNombresComplexes): string {
  switch (exercice.famille) {
    case "A":
      return consigneEcranA();
    case "B":
      return consigneEcranB(exercice, phase);
    case "C":
      return consigneEcranC(phase);
    case "D":
      return consigneEcranD();
    case "E":
      return consigneEcranE(phase);
    case "F":
      return consigneEcranF(phase);
    case "G":
      return consigneEcranG(exercice, phase);
  }
}

export function etatActuel(exercice: ExerciceNombresComplexes, phase: PhaseNombresComplexes): string[] | null {
  switch (exercice.famille) {
    case "A":
      return null;
    case "B":
      return etatActuelB(exercice, phase);
    case "C":
      return etatActuelC(exercice, phase);
    case "D":
      return null;
    case "E":
      return etatActuelE(exercice, phase);
    case "F":
      return etatActuelF(exercice, phase);
    case "G":
      return etatActuelG(exercice, phase);
  }
}

export function champsEcran(exercice: ExerciceNombresComplexes, phase: PhaseNombresComplexes): ChampDef[] {
  switch (exercice.famille) {
    case "A":
      return champsA();
    case "B":
      return champsB();
    case "C":
      return champsC(phase);
    case "D":
      return champsD();
    case "E":
      return champsE(phase);
    case "F":
      return champsF(phase);
    case "G":
      return champsG(phase);
  }
}

export function niveauAideMaxEcran(exercice: ExerciceNombresComplexes, phase: PhaseNombresComplexes): number {
  switch (exercice.famille) {
    case "A":
      return 0;
    case "B":
      return niveauAideMaxB(exercice, phase);
    case "C":
      return niveauAideMaxC(phase);
    case "D":
      return niveauAideMaxD();
    case "E":
      return niveauAideMaxE(phase);
    case "F":
      return niveauAideMaxF(phase);
    case "G":
      return niveauAideMaxG(phase);
  }
}

export function aideNiveau1(exercice: ExerciceNombresComplexes, phase: PhaseNombresComplexes): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return AUCUNE_AIDE;
    case "B":
      return aideNiveau1B(exercice, phase);
    case "C":
      return aideNiveau1C(phase);
    case "D":
      return aideNiveau1D();
    case "E":
      return aideNiveau1E(phase);
    case "F":
      return aideNiveau1F(phase);
    case "G":
      return aideNiveau1G(exercice, phase);
  }
}

export function aideNiveau2(exercice: ExerciceNombresComplexes, phase: PhaseNombresComplexes): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return AUCUNE_AIDE;
    case "B":
      return aideNiveau2B(exercice, phase);
    case "C":
      return aideNiveau2C(exercice, phase);
    case "D":
      return aideNiveau2D(exercice);
    case "E":
      return aideNiveau2E(exercice, phase);
    case "F":
      return aideNiveau2F(exercice, phase);
    case "G":
      return aideNiveau2G(exercice, phase);
  }
}

export const LIBELLE_PHASE: Record<PhaseNombresComplexes, string> = {
  aEcran1: "Résultat",
  bProduitEcran1: "Produit",
  bCarreEcran1: "Carré",
  bCubeEcran1: "Étape 1 (carré)",
  bCubeEcran2: "Étape 2 (cube)",
  cEcran1: "Étape 1 (développement)",
  cEcran2: "Étape 2 (résultat)",
  dEcran1: "Résultat",
  eEcran1: "Étape 1 (2 fractions séparées)",
  eEcran2: "Étape 2 (somme)",
  fEcran1: "Étape 1 (quotient simplifié)",
  fEcran2: "Étape 2 (carré)",
  gEcran1: "Étape 1 (reste)",
  gEcran2: "Étape 2 (valeur)",
};

export const LIBELLE_FAMILLE: Record<ExerciceNombresComplexes["famille"], string> = {
  A: "A — Addition et soustraction",
  B: "B — Multiplication et puissances",
  C: "C — Division par conjugué",
  D: "D — Division par i",
  E: "E — Combiner 2 fractions",
  F: "F — Simplifier avant de mettre au carré",
  G: "G — Puissances de i",
};

/** Récapitulatif final : affiche toujours la réponse CORRECTE connue de l'exercice — jamais
 * recalculée depuis la saisie élève. Reconstruit les fractions exactes des familles C/D/E depuis
 * les entiers bruts (jamais depuis le `ValeurComplexe` flottant stocké — voir en-tête de fichier
 * `core6e/nombresComplexes.types.ts`). */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceNombresComplexes, phase: PhaseNombresComplexes): string[] {
  switch (exercice.famille) {
    case "A":
      return [entierComplexeLatex(exercice.resultat.re, exercice.resultat.im)];
    case "B":
      if (exercice.sousType === "cube") {
        if (phase === "bCubeEcran1") return [valeurComplexeLatex(exercice.carre)];
        return [valeurComplexeLatex(exercice.cube)];
      }
      return [valeurComplexeLatex(exercice.resultat)];
    case "C":
      // 2 valeurs cibles combinées en UN SEUL fragment KaTeX (jamais 2 fragments séparés rendus
      // côte à côte sans séparateur — bug trouvé par inspection visuelle réelle, voir
      // `docs/historique-6e.md` : 2 `<Katex>` adjacents sans espace/étiquette se lisent comme une
      // seule expression garbled, ex. "-2-6i 40"). Mirroir `etatActuelC`/`bEcran1` de
      // `formatLongueurArc.ts` ("t_1=...\\text{, }t_2=...").
      if (phase === "cEcran1") return [`\\text{Numérateur}=${valeurComplexeLatex(exercice.numerateurDeveloppe)}\\text{, }\\text{Dénominateur}=${exercice.denominateurDeveloppe}`];
      return [divisionLatex(exercice.a, exercice.b, exercice.c, exercice.d)];
    case "D":
      return [divisionLatex(exercice.a, exercice.b, 0, exercice.k)];
    case "E":
      // Même consigne que ci-dessus (famille C) — voir ce commentaire.
      if (phase === "eEcran1") return [`\\text{Fraction 1}=${divisionLatex(exercice.a1, exercice.b1, exercice.c1, exercice.d1)}\\text{, }\\text{Fraction 2}=${divisionLatex(exercice.a2, exercice.b2, exercice.c2, exercice.d2)}`];
      // Somme EXACTE reconstruite depuis les entiers bruts — JAMAIS `exercice.resultat` (flottant,
      // voir en-tête `sommeFractionsLatex`).
      return [sommeFractionsLatex(exercice.a1, exercice.b1, exercice.c1, exercice.d1, exercice.a2, exercice.b2, exercice.c2, exercice.d2)];
    case "F":
      if (phase === "fEcran1") return [valeurComplexeLatex(exercice.quotientSimplifie)];
      return [valeurComplexeLatex(exercice.resultat)];
    case "G":
      if (phase === "gEcran1") return [`${exercice.reste}`];
      return [valeurComplexeLatex(exercice.resultat)];
  }
}

/** Total points du récapitulatif final — maximum VARIABLE (100 × nombre d'écrans réellement
 * traversés par CET exercice : 1 pour A/D/B-produit/B-carré, 2 pour B-cube/C/E/F/G). */
export function calculerTotalPointsNombresComplexes(resultat: ResultatExerciceNombresComplexes): { total: number; maximum: number } {
  const phases = phasesPourExercice(resultat.exercice);
  const total = phases.reduce((acc, phase) => acc + (resultat.scores[phase] ?? 0), 0);
  return { total, maximum: phases.length * 100 };
}
