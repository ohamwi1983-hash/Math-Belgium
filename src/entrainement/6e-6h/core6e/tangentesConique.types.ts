import type { NatureConique, Point } from "./identificationConiques.types";

/**
 * Couche core (6e) — contrat pour `6gen62` ("Tangentes à une conique"), générateur du chapitre "Les
 * coniques". Réutilise `NatureConique`/`Point` de `core6e/identificationConiques.types.ts` TELS
 * QUELS (jamais un type parallèle redéfini — voir en-tête de ce fichier pour la convention établie
 * par `6gen58`).
 *
 * ============================================================================
 * RESTRICTION DÉLIBÉRÉE DE PÉRIMÈTRE (documentée ici une fois pour tout le générateur) :
 * - Famille A : ellipse/hyperbole centrée à l'origine OU parabole (les 3 formules de dédoublement
 *   de la mission).
 * - Famille B : HYPERBOLE UNIQUEMENT. Une ellipse admet toujours 2 tangentes réelles pour N'IMPORTE
 *   QUELLE pente demandée (courbe bornée, convexe, dans toutes les directions) — mélanger ellipse et
 *   hyperbole aurait dilué le taux de "aucune solution" très en-dessous des ~50% exigés par la
 *   mission. Seule l'hyperbole (pente demandée plus "à plat" que ses asymptotes) peut légitimement
 *   n'admettre aucune tangente réelle d'une pente donnée — restriction déjà validée par calcul
 *   direct : `k²=M(A+Bm²)/(AB)`, toujours positif pour une ellipse (A,B,M de même signe).
 * - Famille C : ELLIPSE UNIQUEMENT. Le vocabulaire "intérieur/extérieur" de la mission est le
 *   vocabulaire standard ELLIPSE (point intérieur ⟹ 0 tangente réelle, extérieur ⟹ 2) — la même
 *   notion pour une hyperbole est nettement plus subtile (une hyperbole a 3 régions du plan, pas 2,
 *   et le point (0,0) — pourtant clairement "au centre" — a malgré tout 2 tangentes réelles
 *   dégénérées le long des asymptotes). Restreindre à l'ellipse rend le piège central de la mission
 *   ("un point intérieur ne peut être l'origine d'aucune tangente réelle") sans ambiguïté.
 * - Famille E : réutilise directement famille B (donc hyperbole uniquement également).
 * ============================================================================
 */

/** Conique à centre (ellipse OU hyperbole), sous forme canonique `coeffX·x²+coeffY·y²=M` — LA forme
 * produite par `tirerTripletCanonique`/`classifierConiqueCentree`/`elementsConiqueCentree`
 * (`generateurs6e/identificationConiques/classification.ts`, 6gen58), réutilisées telles quelles
 * pour construire chaque exercice de ce générateur (voir `generateurs6e/tangentesConique/
 * algebreTangente.ts`). */
export interface ConiqueCentree {
  coeffX: number;
  coeffY: number;
  M: number;
  /** Toujours `{type:"ellipse",...}` (famille C) ou `{type:"hyperbole",...}` (familles B/E) —
   * jamais une des variantes dégénérées de `NatureConique` (structurellement impossible par
   * construction, voir `algebreTangente.ts`). */
  nature: NatureConique;
}

export type AxeParabole = "horizontal" | "vertical";

/** Parabole `y²=4px` (horizontal) ou `x²=4py` (vertical) — famille A uniquement. */
export interface ConiqueParabole {
  axe: AxeParabole;
  p: number;
  nature: NatureConique;
}

// ============================================================================
// Famille A — tangente en un point donné, sur la conique (3 écrans : aEcran1/aEcran2/aEcran3).
// ============================================================================

export interface ExerciceTangenteA_Centree {
  famille: "A";
  typeConique: "centree";
  conique: ConiqueCentree;
  /** Point DONNÉ sur la conique, garanti par construction (voir `familleA.ts`). */
  P: Point;
  /** Valeur du membre substitué (`coeffX·x₀²+coeffY·y₀²`), doit égaler `conique.M` — champ de
   * l'écran 1 (vérification par substitution). */
  valeurConfirmation: number;
}

export interface ExerciceTangenteA_Parabole {
  famille: "A";
  typeConique: "parabole";
  conique: ConiqueParabole;
  P: Point;
  /** `y₀²` (axe horizontal) ou `x₀²` (axe vertical), doit égaler `4·p·x₀`/`4·p·y₀` — champ écran 1. */
  valeurConfirmation: number;
}

export type ExerciceTangenteA = ExerciceTangenteA_Centree | ExerciceTangenteA_Parabole;

// ============================================================================
// Famille B — tangente(s) parallèle(s) à une droite donnée (hyperbole uniquement).
// bEcran1 → bEcran2 → bEcran3 → [bEcran4 si aSolution].
// ============================================================================

export interface TangenteParallele {
  k: number;
  point: Point;
}

export interface ExerciceTangenteB {
  famille: "B";
  conique: ConiqueCentree;
  /** Pente demandée (valeur numérique — dérivée de `mNum/mDen`). */
  m: number;
  mNum: number;
  mDen: number;
  /** Ordonnée à l'origine de la droite `d` DONNÉE (`y=mx+c0`) — purement narrative (seule la pente
   * compte pour le calcul, mission), jamais réutilisée dans l'algèbre de tangence. */
  c0: number;
  /** `true` ⟺ `k²=M(coeffX+coeffY·m²)/(coeffX·coeffY) > 0` — 2 tangentes réelles distinctes. `false`
   * ⟺ aucune tangente réelle de cette pente (conclusion légitime, PIÈGE CENTRAL famille B). */
  aSolution: boolean;
  /** Toujours de longueur 2 si `aSolution`, sinon `[]` (jamais 1 — voir garde dans `familleB.ts`
   * excluant explicitement la racine double `k=0`). */
  tangentes: TangenteParallele[];
}

// ============================================================================
// Famille C — tangente(s) depuis un point extérieur (ellipse uniquement).
// cEcran1 → cEcran2 → cEcran3 → [cEcran4 si aSolution].
// ============================================================================

export interface TangenteDepuisPoint {
  m: number;
  point: Point;
}

export interface ExerciceTangenteC {
  famille: "C";
  conique: ConiqueCentree;
  /** Point P DONNÉ — pas nécessairement sur la conique. */
  P: Point;
  /** `true` ⟺ P extérieur à l'ellipse (`coeffX·x₀²+coeffY·y₀²-M > 0`) — 2 tangentes réelles.
   * `false` ⟺ P intérieur (PIÈGE CENTRAL famille C, aucune tangente réelle possible). */
  aSolution: boolean;
  tangentes: TangenteDepuisPoint[];
}

// ============================================================================
// Famille D — construire une conique depuis un point de passage + une tangente.
// dEcran1 → dEcran2 → dEcran3 → dEcran4 (toujours les 4 — jamais de cas dégénéré par construction).
// ============================================================================

export type AxeTransverse = "horizontal" | "vertical";

export interface ExerciceTangenteD {
  famille: "D";
  natureCible: "ellipse" | "hyperbole";
  /** Axe transverse — pertinent seulement pour `natureCible==="hyperbole"` (détermine quel terme
   * est positif) ; toujours présent pour uniformité du contrat (ignoré pour l'ellipse, formule
   * symétrique en `a`,`b`). */
  axeTransverse: AxeTransverse;
  /** Valeurs VRAIES (connues du générateur, cachées de l'élève jusqu'à l'écran 3) — construites en
   * PREMIER, la donnée (P, droite d) étant dérivée à l'envers pour garantir un système cohérent
   * (même principe que `ExerciceFamilleB` de `6gen59`, point de passage construit à l'envers depuis
   * `p`). */
  a: number;
  b: number;
  /** Point de passage DONNÉ (coordonnées entières, sur la conique par construction). */
  P: Point;
  /** Droite tangente `d` DONNÉE, sous forme `y=mx+k` — coefficients EXACTS (fractions réduites) ET
   * leur valeur numérique, pour affichage KaTeX ET pour l'algèbre de vérification. */
  ligne: { mNum: number; mDen: number; kNum: number; kDen: number; m: number; k: number };
}

// ============================================================================
// Famille E — point d'une conique le plus proche d'une droite (réutilise famille B intégralement).
// eEcran1 → eEcran2 → eEcran3.
// ============================================================================

export interface ExerciceTangenteE {
  famille: "E";
  /** Exercice famille B sous-jacent, `aSolution` TOUJOURS forcé à `true` (famille E a besoin des 2
   * points de tangence réels pour avoir un sens) — réutilisé TEL QUEL, jamais reconstruit
   * indépendamment (voir `familleE.ts`, en-tête). */
  base: ExerciceTangenteB;
  /** Droite `d` RÉELLE (même pente que `base.m`, ordonnée à l'origine `c0` CONCRÈTE et
   * significative cette fois — contrairement à `base.c0`, purement narratif) — nécessaire pour
   * calculer une distance point-droite réelle. */
  c0: number;
  /** Distances des 2 points de `base.tangentes` (même ordre) à la droite `d` ci-dessus. */
  distances: [number, number];
  /** Index (0 ou 1) du point de `base.tangentes` le plus proche de `d`. */
  indexPlusProche: 0 | 1;
}

export type ExerciceTangentesConique = ExerciceTangenteA | ExerciceTangenteB | ExerciceTangenteC | ExerciceTangenteD | ExerciceTangenteE;
export type FamilleTangentesConique = ExerciceTangentesConique["famille"];
