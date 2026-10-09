/**
 * Couche core (6e) — contrat pour `6gen35` ("Nombres complexes : affixes et racines carrées",
 * chapitre 7 "Nombres complexes", SECOND générateur de ce chapitre, après `6gen34`). 3 familles
 * (A, B, C), tirage ÉQUIPROBABLE de la famille (voir `generateurs6e/affixesRacines/index.ts`).
 *
 * ============================================================================
 * **CE FICHIER EST SPÉCIFIQUE À 6gen35 — PAS un module chapitre-7 partagé**
 * ============================================================================
 * Mirroir `core6e/nombresComplexes.types.ts` (6gen34) dans son PRINCIPE (entiers exacts, jamais de
 * closure), mais ne modélise QUE les 3 familles A-C de CE générateur — un futur générateur du
 * chapitre 7 créera son propre fichier `core6e/xxx.types.ts`, jamais une extension de celui-ci (voir
 * en-tête `core6e/nombresComplexes.types.ts` pour la même règle appliquée à 6gen34).
 *
 * ============================================================================
 * **Famille B — demi-entiers représentés par leur valeur DOUBLÉE (entier exact)**
 * ============================================================================
 * La spec autorise des affixes A/B/C à coefficients "entiers/demi-entiers simples". Un demi-entier
 * (k/2) est représentable EXACTEMENT en IEEE754 (dénominateur puissance de 2, aucune imprécision),
 * mais le contrat stocke la valeur DOUBLÉE en entier (`reA2`, etc.) plutôt que le quotient déjà
 * divisé — même principe que `core6e/nombresComplexes.types.ts` ("stocker les paramètres de
 * génération BRUTS, jamais un flottant déjà calculé") : `ui6e/formatAffixesRacines.ts` reconstruit
 * la fraction exacte (entier si pair, demi-entier sinon — un entier doublé impair a nécessairement
 * gcd(k,2)=1, donc DÉJÀ réduit) depuis cette valeur doublée, jamais depuis un quotient flottant.
 *
 * ============================================================================
 * **Famille C — x,y toujours ENTIERS (jamais le facteur √2/√3 évoqué par la spec comme variante)**
 * ============================================================================
 * Décision délibérée, documentée en détail dans `generateurs6e/affixesRacines/familleC.ts` (en-tête
 * de fichier) : `moteur6e/expressionComplexe.ts` n'a AUCUN support de fonction (`sqrt` hors de
 * portée, restriction documentée dans son propre en-tête) et la spec de CE générateur exige une
 * égalité EXACTE (jamais de tolérance décimale) — un x ou y irrationnel serait donc structurellement
 * impossible à saisir exactement par l'élève avec l'évaluateur partagé. `x,y entiers` (la branche
 * PRINCIPALE explicitement permise par la spec) est donc la seule utilisée ; voir la preuve
 * algébrique (a²+b²=(x²+y²)², toujours un carré parfait quand x,y sont entiers) dans l'en-tête de
 * `familleC.ts` qui confirme que cette restriction ne casse RIEN de la mécanique pédagogique
 * (résolution du système biquadratique toujours exacte, sans jamais un radical réel à calculer).
 */

/** Un nombre complexe re+im·i, sous forme numérique pure — structurellement identique (typage
 * structurel TypeScript, aucun import croisé) au `Complexe` de `moteur6e/expressionComplexe.ts`, et
 * au `ValeurComplexe` de `core6e/nombresComplexes.types.ts` (déclaré séparément ici, jamais importé
 * de ce dernier — `core6e/` ne dépend jamais d'un autre fichier `core6e/` d'un autre générateur). */
export interface ValeurComplexe {
  re: number;
  im: number;
}

// ============================================================================
// Famille A — Propriétés de z+z̄ et z−z̄ (1 écran).
// ============================================================================

export interface ExerciceFamilleA {
  famille: "A";
  /** z = a+bi, b≠0 (spec — sinon z̄=z, propriété triviale). */
  a: number;
  b: number;
  /** z+z̄ = 2a (toujours réel). */
  somme: ValeurComplexe;
  /** z−z̄ = 2bi (toujours purement imaginaire). */
  difference: ValeurComplexe;
}

// ============================================================================
// Famille B — Parallélogramme via affixes (2 écrans).
// ============================================================================

/** 4 systèmes candidats à l'écran 1 — voir `generateurs6e/affixesRacines/familleB.ts` et
 * `ui6e/formatAffixesRacines.ts` pour le libellé LaTeX de chacun. "correct" = D=A+C-B (diagonales
 * [AC] et [BD] de même milieu — LA relation attendue pour un parallélogramme ABCD, dans cet ordre
 * de sommets). Les 3 distracteurs couvrent les 2 confusions les plus attendues : quelle PAIRE de
 * sommets forme une diagonale (`echangeDiagonales`), et l'ordre d'addition/soustraction
 * (`signeInverse`, `mauvaiseCombinaison`). */
export type IdRelationParallelogramme = "correct" | "echangeDiagonales" | "signeInverse" | "mauvaiseCombinaison";

export interface ExerciceFamilleB {
  famille: "B";
  /** Affixes A/B/C — valeurs DOUBLÉES (entiers exacts), voir en-tête de fichier. */
  reA2: number;
  imA2: number;
  reB2: number;
  imB2: number;
  reC2: number;
  imC2: number;
  /** Écran 2 — affixe de D=A+C-B, valeur DOUBLÉE (toujours un entier exact, somme/différence
   * d'entiers). */
  reD2: number;
  imD2: number;
}

// ============================================================================
// Famille C — Racines carrées d'un nombre complexe (3 écrans).
// ============================================================================

/** 4 systèmes candidats à l'écran 1 — voir `generateurs6e/affixesRacines/familleC.ts` et
 * `ui6e/formatAffixesRacines.ts`. "correct" = {x²-y²=a, 2xy=b} (identification directe des parties
 * réelle/imaginaire de (x+yi)²=a+bi). Les 3 distracteurs couvrent les confusions attendues :
 * `permutation` (a et b échangés entre les 2 équations), `signeInverse` (x²+y²=a au lieu de
 * x²-y²=a), `facteurManquant` (xy=b au lieu de 2xy=b, le facteur 2 du double produit oublié). */
export type IdSystemeRacine = "correct" | "permutation" | "signeInverse" | "facteurManquant";

export interface ExerciceFamilleC {
  famille: "C";
  /** Racine cible x+yi construite À L'ENVERS (voir en-tête de fichier + `familleC.ts`) — x,y
   * ENTIERS non nuls (jamais 0, spec : sinon a+bi ci-dessous serait réel pur, cas dégénéré hors
   * propos d'un exercice de racine carrée COMPLEXE). */
  x: number;
  y: number;
  /** Complexe de départ a+bi = (x+yi)² — TOUJOURS entier exact (x,y entiers). */
  a: number;
  b: number;
  /** Écran 2 — solution filtrée du système biquadratique (x²>0), toujours |x| (entier positif,
   * TOUJOURS exact — voir preuve algébrique en en-tête de fichier). */
  xPositif: number;
  /** Écran 3 — y déduit de xPositif via y=b/(2·xPositif), TOUJOURS un entier exact (= y si x>0,
   * = -y si x<0 — même valeur ABSOLUE que `y`, signe potentiellement inversé). */
  yDeduit: number;
  /** Écran 3 — les 2 racines ±(xPositif+yDeduit·i), même ENSEMBLE que ±(x+yi) quel que soit le
   * signe de x tiré à la génération (voir en-tête de fichier). */
  racines: [ValeurComplexe, ValeurComplexe];
}

// ============================================================================
// Union globale.
// ============================================================================

export type ExerciceAffixesRacines = ExerciceFamilleA | ExerciceFamilleB | ExerciceFamilleC;

export type FamilleAffixesRacines = ExerciceAffixesRacines["famille"];

export type GenerateurExerciceAffixesRacines = () => ExerciceAffixesRacines;
