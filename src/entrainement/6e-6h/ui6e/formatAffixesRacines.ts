import type { ExerciceAffixesRacines, IdRelationParallelogramme, IdSystemeRacine, ValeurComplexe } from "../core6e/affixesRacines.types";
import type { PhaseAffixesRacines } from "../moteur6e/typesAffixesRacines";

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

/** Texte brut mêlé à du LaTeX inline court — même contrat que `ui/formatEquationDroite.ts`/
 * `ui6e/formatProprietesLogarithme.ts` (dupliqué ici à dessein, convention CLAUDE.md) ; rendu via
 * `components/RenduFragments.tsx`. */
export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

function texte(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}
function latex(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
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
/** num/den avec den ∈ {1, 2} ici : un demi s'écrit en décimal avec virgule (`2{,}5`), comme
 * l'élève doit le saisir (forme réduite sans « / »). */
function fracLatex(num: number, den: number): string {
  if (den === 1) return `${num}`;
  if (den === 2) return String(num / 2).replace(".", "{,}");
  return `\\frac{${num}}{${den}}`;
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

export function consigneGeneraleA(): FragmentConsigne[] {
  return [texte("z est un nombre complexe donné. Calcule "), latex("z+\\bar z"), texte(" et "), latex("z-\\bar z"), texte(", chacun sous la forme "), latex("a+bi"), texte(".")];
}
export function blocDonneesA(e: Extract<ExerciceAffixesRacines, { famille: "A" }>): string[] {
  return [`z=${entierComplexeLatex(e.a, e.b)}`];
}
export function consigneEcranA(): FragmentConsigne[] {
  return [texte("Calcule "), latex("z+\\bar z"), texte(" et "), latex("z-\\bar z"), texte(", chacun sous la forme "), latex("a+bi"), texte(" (0 s'il n'y a pas de partie réelle/imaginaire).")];
}
export function champsA(): ChampDef[] {
  return [
    { type: "texte", label: "z+z̄ =", placeholder: "forme a+bi" },
    { type: "texte", label: "z−z̄ =", placeholder: "forme a+bi" },
  ];
}
export function niveauAideMaxA(): number {
  return 2;
}
export function aideNiveau1A(): AideAvecLatex {
  return { texte: "Le conjugué change le signe de la partie imaginaire ; additionne (ou soustrais) ensuite parties réelles entre elles et parties imaginaires entre elles.", latex: "z=a+bi\\ \\Rightarrow\\ \\bar z=a-bi" };
}
export function aideNiveau2A(e: Extract<ExerciceAffixesRacines, { famille: "A" }>): AideAvecLatex {
  // Calculs POSÉS seulement (avant : la partie réelle de z+z̄ y était déjà calculée).
  const z = entierComplexeLatex(e.a, e.b);
  const zBarre = entierComplexeLatex(e.a, -e.b);
  return {
    texte: "Calculs posés (non effectués) :",
    latex: `z+\\bar z=(${z})+(${zBarre})\\qquad z-\\bar z=(${z})-(${zBarre})`,
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
  { id: "correct", latex: "z_D=z_A-z_B+z_C" },
  { id: "echangeDiagonales", latex: "z_D=z_A+z_B-z_C" },
  { id: "signeInverse", latex: "z_D=-z_A-z_B+z_C" },
  { id: "mauvaiseCombinaison", latex: "z_D=-z_A+z_B+z_C" },
];

export function consigneGeneraleB(): FragmentConsigne[] {
  return [texte("A, B, C sont 3 points du plan, donnés par leurs affixes. Détermine l'affixe du point D tel que ABCD (dans cet ordre) soit un parallélogramme.")];
}
export function blocDonneesB(e: Extract<ExerciceAffixesRacines, { famille: "B" }>): string[] {
  return [`z_A=${affixeDemiEntiereLatex(e.reA2, e.imA2)}\\qquad z_B=${affixeDemiEntiereLatex(e.reB2, e.imB2)}\\qquad z_C=${affixeDemiEntiereLatex(e.reC2, e.imC2)}`];
}
export function consigneEcranB(phase: PhaseAffixesRacines): FragmentConsigne[] {
  if (phase === "bEcran1") return [texte("Dans le parallélogramme ABCD (sommets dans cet ordre), quelle relation lie les affixes des 4 sommets ?")];
  return [texte("Calcule l'affixe de D avec la relation obtenue à l'étape précédente, sous la forme "), latex("a+bi"), texte(".")];
}
export function etatActuelB(phase: PhaseAffixesRacines): string[] | null {
  if (phase === "bEcran2") return ["\\text{Relation : }z_D=z_A-z_B+z_C"];
  return null;
}
export function champsB(phase: PhaseAffixesRacines): ChampDef[] {
  if (phase === "bEcran1") return [{ type: "choix", label: "Relation" }];
  return [{ type: "texte", label: "z_D =", placeholder: "forme a+bi" }];
}
export function niveauAideMaxB(phase: PhaseAffixesRacines): number {
  return phase === "bEcran1" ? 2 : 0;
}
export function aideNiveau1B(phase: PhaseAffixesRacines): AideAvecLatex {
  if (phase === "bEcran1") return { texte: "Dans un parallélogramme, les 2 diagonales [AC] et [BD] ont le même milieu.", latex: null };
  return AUCUNE_AIDE;
}
export function aideNiveau2B(phase: PhaseAffixesRacines): AideAvecLatex {
  if (phase === "bEcran1") return { texte: "Égalité des milieux posée (résolution non faite) :", latex: "\\dfrac{z_A+z_C}{2}=\\dfrac{z_B+z_D}{2}" };
  return AUCUNE_AIDE;
}

// ============================================================================
// Famille C — Racines carrées d'un nombre complexe.
// ============================================================================

/** 4 options de l'écran 1 (QCM) — système identifiant les parties réelle/imaginaire de
 * (x+yi)²=a+bi. "correct" = {x²-y²=a, 2xy=b}. Distracteurs : `permutation` (a et b échangés entre
 * les 2 équations), `signeInverse` (x²+y²=a au lieu de x²-y²=a), `facteurManquant` (xy=b au lieu de
 * 2xy=b, le facteur 2 du double produit oublié). */
export function OPTIONS_SYSTEME_C(a: number, b: number, module: number): { id: IdSystemeRacine; latex: string }[] {
  const systeme = (e1: string, e2: string, e3: string) => `\\begin{cases}${e1}\\\\ ${e2}\\\\ ${e3}\\end{cases}`;
  return [
    { id: "correct", latex: systeme(`x^2-y^2=${a}`, `2xy=${b}`, `x^2+y^2=${module}`) },
    { id: "permutation", latex: systeme(`x^2-y^2=${b}`, `2xy=${a}`, `x^2+y^2=${module}`) },
    { id: "signeInverse", latex: systeme(`x^2+y^2=${a}`, `2xy=${b}`, `x^2-y^2=${module}`) },
    { id: "facteurManquant", latex: systeme(`x^2-y^2=${a}`, `xy=${b}`, `x^2+y^2=${module}`) },
    { id: "moduleCarre", latex: systeme(`x^2-y^2=${a}`, `2xy=${b}`, `x^2+y^2=${module * module}`) },
  ];
}

function systemeCorrectC(e: Extract<ExerciceAffixesRacines, { famille: "C" }>): string {
  return `x^2-y^2=${e.a}\\text{, }2xy=${e.b}\\text{, }x^2+y^2=${e.module}`;
}
function xRetenuC(e: Extract<ExerciceAffixesRacines, { famille: "C" }>): number {
  return e.xRetenu ?? e.xPositif;
}

export function consigneGeneraleC(): FragmentConsigne[] {
  return [texte("Calcule les 2 racines carrées complexes du nombre ci-dessous, en posant "), latex("(x+yi)^2=a+bi"), texte(".")];
}
export function blocDonneesC(e: Extract<ExerciceAffixesRacines, { famille: "C" }>): string[] {
  return [`a+bi=${entierComplexeLatex(e.a, e.b)}`];
}
export function consigneEcranC(phase: PhaseAffixesRacines): FragmentConsigne[] {
  if (phase === "cEcran1")
    return [texte("Choisis le système vérifié par x et y : parties réelles, parties imaginaires et modules de "), latex("(x+yi)^2"), texte(" et de "), latex("a+bi"), texte(".")];
  if (phase === "cEcran2") return [texte("Avec le système obtenu à l'étape précédente, calcule une valeur de x.")];
  return [texte("Déduis y de la valeur de x obtenue à l'étape précédente, puis donne les 2 racines carrées.")];
}
export function etatActuelC(e: Extract<ExerciceAffixesRacines, { famille: "C" }>, phase: PhaseAffixesRacines): string[] | null {
  if (phase === "cEcran2") return [`\\text{Système : }${systemeCorrectC(e)}`];
  if (phase === "cEcran3") return [`\\text{Système : }${systemeCorrectC(e)}`, `x=${xRetenuC(e)}`];
  return null;
}
export function champsC(phase: PhaseAffixesRacines): ChampDef[] {
  if (phase === "cEcran1") return [{ type: "choix", label: "Système" }];
  if (phase === "cEcran2") return [{ type: "texte", label: "x =", placeholder: "un réel" }];
  return [];
}
export function niveauAideMaxC(phase: PhaseAffixesRacines): number {
  return phase === "cEcran1" ? 0 : 2;
}
export function aideNiveau1C(phase: PhaseAffixesRacines): AideAvecLatex {
  if (phase === "cEcran2") return { texte: "Additionne la 1re et la 3e équation : y disparaît.", latex: "(x^2-y^2)+(x^2+y^2)=2x^2" };
  if (phase === "cEcran3") return { texte: "La 2e équation donne y ; un nombre complexe non nul a toujours 2 racines carrées, opposées l'une de l'autre.", latex: "y=\\dfrac{b}{2x}\\qquad z_2=-z_1" };
  return AUCUNE_AIDE;
}
export function aideNiveau2C(e: Extract<ExerciceAffixesRacines, { famille: "C" }>, phase: PhaseAffixesRacines): AideAvecLatex {
  if (phase === "cEcran2") return { texte: "Somme posée (résolution non faite) :", latex: `2x^2=${e.a < 0 ? `(${e.a})` : e.a}+${e.module}` };
  if (phase === "cEcran3") return { texte: "Valeur de y posée (calcul non fait) :", latex: `y=\\dfrac{${e.b}}{2\\cdot ${xRetenuC(e) < 0 ? `(${xRetenuC(e)})` : xRetenuC(e)}}` };
  return AUCUNE_AIDE;
}


function valeurLatex(v: ValeurComplexe): string {
  return complexeLatex(fractionDepuisDouble(2 * v.re), fractionDepuisDouble(2 * v.im));
}

export function consigneGeneraleD(): FragmentConsigne[] {
  return [texte("A et B sont 2 points du plan, donnés par leurs affixes. Calcule l'affixe du milieu M de [AB], puis la distance AB.")];
}
export function blocDonneesD(e: Extract<ExerciceAffixesRacines, { famille: "D" }>): string[] {
  return [`z_A=${valeurLatex(e.zA)}\\qquad z_B=${valeurLatex(e.zB)}`];
}
export function consigneEcranD(phase: PhaseAffixesRacines): FragmentConsigne[] {
  if (phase === "dEcran1") return [texte("Calcule l'affixe du milieu M de [AB], sous la forme "), latex("a+bi"), texte(" (virgule décimale si besoin).")];
  return [texte("Calcule "), latex("z_B-z_A"), texte(", puis la distance AB, qui est son module.")];
}
export function etatActuelD(e: Extract<ExerciceAffixesRacines, { famille: "D" }>, phase: PhaseAffixesRacines): string[] | null {
  if (phase === "dEcran2") return [`z_M=${valeurLatex(e.milieu)}`];
  return null;
}
export function champsD(phase: PhaseAffixesRacines): ChampDef[] {
  if (phase === "dEcran1") return [{ type: "texte", label: "z_M =", placeholder: "forme a+bi" }];
  return [
    { type: "texte", label: "z_B − z_A =", placeholder: "forme a+bi" },
    { type: "texte", label: "AB =", placeholder: "un réel positif" },
  ];
}
export function niveauAideMaxD(): number {
  return 2;
}
export function aideNiveau1D(phase: PhaseAffixesRacines): AideAvecLatex {
  if (phase === "dEcran1") return { texte: "L'affixe du milieu est la moyenne des affixes des extrémités :", latex: "z_M=\\dfrac{z_A+z_B}{2}" };
  return { texte: "La distance AB est le module de la différence des affixes :", latex: "AB=|z_B-z_A|=\\sqrt{x^2+y^2}\\ \\text{ si }\\ z_B-z_A=x+yi" };
}
export function aideNiveau2D(e: Extract<ExerciceAffixesRacines, { famille: "D" }>, phase: PhaseAffixesRacines): AideAvecLatex {
  if (phase === "dEcran1") return { texte: "Somme posée (calcul non fait) :", latex: `z_M=\\dfrac{(${valeurLatex(e.zA)})+(${valeurLatex(e.zB)})}{2}` };
  return { texte: "Différence posée (calcul non fait) :", latex: `z_B-z_A=(${valeurLatex(e.zB)})-(${valeurLatex(e.zA)})` };
}


export function consigneGenerale(exercice: ExerciceAffixesRacines): FragmentConsigne[] {
  switch (exercice.famille) {
    case "A":
      return consigneGeneraleA();
    case "B":
      return consigneGeneraleB();
    case "C":
      return consigneGeneraleC();
    case "D":
      return consigneGeneraleD();
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
    case "D":
      return blocDonneesD(exercice);
  }
}

export function consigneEcran(exercice: ExerciceAffixesRacines, phase: PhaseAffixesRacines): FragmentConsigne[] {
  switch (exercice.famille) {
    case "A":
      return consigneEcranA();
    case "B":
      return consigneEcranB(phase);
    case "C":
      return consigneEcranC(phase);
    case "D":
      return consigneEcranD(phase);
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
    case "D":
      return etatActuelD(exercice, phase);
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
    case "D":
      return champsD(phase);
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
    case "D":
      return niveauAideMaxD();
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
    case "D":
      return aideNiveau1D(phase);
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
    case "D":
      return aideNiveau2D(exercice, phase);
  }
}

export const LIBELLE_PHASE: Record<PhaseAffixesRacines, string> = {
  aEcran1: "Résultat",
  bEcran1: "Étape 1 (relation)",
  bEcran2: "Étape 2 (affixe de D)",
  cEcran1: "Étape 1 (système)",
  cEcran2: "Étape 2 (valeur de x)",
  cEcran3: "Étape 3 (les 2 racines)",
  dEcran1: "Étape 1 (milieu)",
  dEcran2: "Étape 2 (distance)",
};

export const LIBELLE_FAMILLE: Record<ExerciceAffixesRacines["famille"], string> = {
  A: "A — Propriétés de z+z̄ et z−z̄",
  B: "B — Parallélogramme via affixes",
  C: "C — Racines carrées d'un nombre complexe",
  D: "D — Milieu et distance",
};

/** Récapitulatif final : affiche toujours la réponse CORRECTE connue de l'exercice — jamais
 * recalculée depuis la saisie élève. */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceAffixesRacines, phase: PhaseAffixesRacines): string[] {
  switch (exercice.famille) {
    case "A":
      return [`z+\\bar z=${entierComplexeLatex(exercice.somme.re, exercice.somme.im)}\\text{, }z-\\bar z=${entierComplexeLatex(exercice.difference.re, exercice.difference.im)}`];
    case "B":
      if (phase === "bEcran1") return ["z_D=z_A-z_B+z_C"];
      return [`z_D=${affixeDemiEntiereLatex(exercice.reD2, exercice.imD2)}`];
    case "C":
      if (phase === "cEcran1") return [systemeCorrectC(exercice)];
      if (phase === "cEcran2") return [`x=${exercice.xPositif}\\ \\text{ ou }\\ x=${-exercice.xPositif}`];
      return [`z_1=${entierComplexeLatex(exercice.xPositif, exercice.yDeduit)}\\text{, }z_2=${entierComplexeLatex(-exercice.xPositif, -exercice.yDeduit)}`];
    case "D":
      if (phase === "dEcran1") return [`z_M=${valeurLatex(exercice.milieu)}`];
      return [`z_B-z_A=${valeurLatex(exercice.difference)}\\text{, }AB=${exercice.distance}`];
  }
}

