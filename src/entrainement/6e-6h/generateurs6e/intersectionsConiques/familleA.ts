import { construireMemeAxe } from "../equationConiqueCaracteristiques/familleA";
import type { Point } from "../../core6e/identificationConiques.types";
import type { CaracteristiquesConiqueA, ConiqueGenerale, DonneesHauteur, DonneesLigneA, DonneesMediatrice, DroiteAffine, ExerciceIntersectionsConiquesA, Frac, PointFrac, SousTypeDroiteA } from "../../core6e/intersectionsConiques.types";
import { fracAdd, fracDiv, fracEntier, fracEquals, fracMul, fracNeg, fracReduire, fracSub } from "./fraction";
import { tirerEntier, tirerParmi } from "./aleatoire";

/**
 * Couche A (6e) — famille A de `6gen61` ("Intersection droite-conique"). RÉUTILISE
 * `construireMemeAxe` (`equationConiqueCaracteristiques/familleA.ts`, 6gen59) pour la construction
 * ellipse/hyperbole "même axe" quand la conique n'est pas donnée directement — voir
 * `CaracteristiquesConiqueA` (`core6e/intersectionsConiques.types.ts`).
 *
 * ============================================================================
 * FONCTION RÉUTILISABLE PAR `6gen63` (à construire après ce générateur) :
 * `resoudreIntersectionDroiteConique(conique, droite)` ci-dessous — substitue `droite` (`y=mx+c`,
 * jamais verticale) dans `conique` (`p·x²+q·y²=n`, centrée à l'origine), résout l'équation du second
 * degré résultante en x par arithmétique EXACTE (fractions, `fraction.ts`), et interprète le
 * discriminant (0, 1, ou 2 solutions). Fonction PURE, sans aucune dépendance UI/session — importable
 * directement.
 *
 * ## Preuve que le discriminant est TOUJOURS un carré parfait entier exact quand il y a 1 ou 2
 * solutions rationnelles
 *
 * Soit `A''x²+B''x+C''=0` l'équation obtenue après avoir substitué `y=mx+c` dans `px²+qy²=n` PUIS
 * multiplié par `L²` (`L=ppcm(m.d,c.d)`, le plus petit dénominateur commun nécessaire — voir le
 * calcul ci-dessous) pour obtenir des coefficients ENTIERS. Si les racines x₁,x₂ de cette équation
 * sont RATIONNELLES (ce que ce module garantit PAR CONSTRUCTION, voir "génération" plus bas — jamais
 * par une recherche a posteriori d'un discriminant qui serait un carré), alors par l'identité
 * `Δ=B''²-4A''C''=A''²(x₁-x₂)²` (identité algébrique valable pour TOUTE équation du second degré à
 * racines réelles) : `Δ` est le carré d'un nombre RATIONNEL (`A''·(x₁-x₂)`, produit d'un entier et
 * d'une différence de rationnels). Or `Δ` lui-même est un ENTIER (puisque `A'',B'',C''` le sont). Un
 * entier qui est le carré d'un rationnel est nécessairement le carré d'un ENTIER (si `(p/q)²∈ℤ` avec
 * `pgcd(p,q)=1`, alors `q²|p²` donc `q=1`) — `Δ` est donc garanti être un carré parfait entier exact,
 * sans jamais avoir besoin de le vérifier après coup.
 *
 * ## Génération (comment garantir des racines rationnelles PAR CONSTRUCTION)
 *
 * Plutôt que tirer une droite au hasard et espérer un discriminant carré parfait, ce module choisit
 * D'ABORD un point "sympa" à coordonnées rationnelles EXACTES sur la conique (le point du "latus
 * rectum" — un fait conique standard : pour toute ellipse/hyperbole `x²/a²±y²/b²=1` construite avec
 * `b²=a²-c²`ou`c²-a²` (exactement la relation de `construireMemeAxe`), le point `(c, b²/a)` est
 * TOUJOURS exactement sur la courbe, quels que soient a,c entiers — vérification directe :
 * `c²/a² + (b²/a)²/b² = c²/a²+b²/a² = (c²+b²)/a² = a²/a² = 1`. Pour un cercle, un triplet
 * pythagoricien joue le même rôle. La droite est ensuite construite pour passer PAR ce point (sécante
 * à 2 points via les symétries `(±x0,±y0)`, tangente via la formule standard `p·x0·x+q·y0·y=n`, ou
 * "manquée" en écartant la tangente) — les racines sont alors, par construction géométrique directe,
 * exactement les coordonnées de points déjà connus, jamais un résultat à espérer.
 */

// ============================================================================
// La fonction réutilisable.
// ============================================================================

export type ResultatIntersectionDroiteConique = { nombreSolutions: 0; discriminant: number } | { nombreSolutions: 1; discriminant: number; points: [PointFrac] } | { nombreSolutions: 2; discriminant: number; points: [PointFrac, PointFrac] };

function pgcdBig(a: bigint, b: bigint): bigint {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b) [a, b] = [b, a % b];
  return a || 1n;
}

function ppcmBig(a: bigint, b: bigint): bigint {
  const aa = a < 0n ? -a : a;
  const bb = b < 0n ? -b : b;
  return (aa * bb) / pgcdBig(aa, bb);
}

/**
 * Substitue `droite` (`y=m·x+c`) dans `conique` (`p·x²+q·y²=n`), obtient `A''x²+B''x+C''=0` (entiers,
 * après multiplication par `L²`, `L=ppcm(m.d,c.d)` — le plus petit dénominateur commun nécessaire
 * pour effacer TOUTES les fractions de `q·(m·x+c)²`, voir en-tête), et interprète le discriminant.
 *
 * **Arithmétique en `BigInt`, jamais en `number`** — `L²` (et donc `A,B,C`) peut dépasser la plage
 * où `number` reste EXACT (2^53) dès que `m,c` ont des dénominateurs de quelques dizaines
 * (rencontré empiriquement en TDD : un discriminant nul par construction — cas tangente — ressortait
 * légèrement négatif à cause d'une perte de précision flottante sur `B²-4AC`, révélé par le stress
 * test `familleA.test.ts` avant d'être compris et corrigé). `A,B,Cc` sont en plus RÉDUITS par leur
 * PGCD commun avant de calculer le discriminant final : en plus d'éliminer tout risque de précision
 * (le discriminant obtenu reste largement dans la plage exacte de `number`), cette réduction donne
 * la forme MINIMALE de l'équation — celle qu'un élève obtiendrait naturellement en simplifiant au
 * fur et à mesure, jamais un multiple arbitraire inutilement grand.
 *
 * Lève une erreur si `A''=0` (droite parallèle à une asymptote — cas non géré, ce générateur ne le
 * construit jamais) ou si le discriminant positif n'est pas un carré parfait entier (ne devrait
 * jamais arriver par construction, voir en-tête — défense en profondeur qui aurait immédiatement
 * révélé le bug ci-dessus pendant le développement TDD).
 */
export function resoudreIntersectionDroiteConique(conique: ConiqueGenerale, droite: DroiteAffine): ResultatIntersectionDroiteConique {
  const { p, q, n } = conique;
  const { m, c } = droite;
  const L = ppcmBig(BigInt(m.d), BigInt(c.d));
  const M = BigInt(m.n) * (L / BigInt(m.d));
  const C = BigInt(c.n) * (L / BigInt(c.d));
  let A = BigInt(p) * L * L + BigInt(q) * M * M;
  let B = 2n * BigInt(q) * M * C;
  let Cc = BigInt(q) * C * C - BigInt(n) * L * L;

  if (A === 0n) {
    throw new Error("resoudreIntersectionDroiteConique : coefficient de x² nul (droite parallèle à une asymptote) — cas non construit par ce générateur");
  }

  const g = pgcdBig(pgcdBig(A, B), Cc) * (A < 0n ? -1n : 1n);
  A /= g;
  B /= g;
  Cc /= g;

  const discriminantBig = B * B - 4n * A * Cc;
  if (discriminantBig < 0n) return { nombreSolutions: 0, discriminant: Number(discriminantBig) };

  const AN = Number(A);
  const BN = Number(B);
  const discriminant = Number(discriminantBig);

  if (discriminantBig === 0n) {
    const x0 = fracReduire(-BN, 2 * AN);
    const y0 = fracAdd(fracMul(m, x0), c);
    return { nombreSolutions: 1, discriminant, points: [{ x: x0, y: y0 }] };
  }

  const racine = Math.round(Math.sqrt(discriminant));
  if (Math.abs(racine * racine - discriminant) > 1e-6) {
    throw new Error(`resoudreIntersectionDroiteConique : discriminant ${discriminant} n'est pas un carré parfait entier`);
  }
  const x1 = fracReduire(-BN + racine, 2 * AN);
  const x2 = fracReduire(-BN - racine, 2 * AN);
  const y1 = fracAdd(fracMul(m, x1), c);
  const y2 = fracAdd(fracMul(m, x2), c);
  return { nombreSolutions: 2, discriminant, points: [{ x: x1, y: y1 }, { x: x2, y: y2 }] };
}

// ============================================================================
// Construction de la conique (directe ou depuis caractéristiques réutilisées de 6gen59) + du point
// "sympa" (latus rectum / triplet pythagoricien) garantissant des intersections rationnelles.
// ============================================================================

type NatureConiqueA = "ellipse" | "hyperbole" | "cercle";

interface ConiqueEtPoint {
  conique: ConiqueGenerale;
  x0: Frac;
  y0: Frac;
}

function formeGeneraleCentree(natureCible: "ellipse" | "hyperbole", axe: "horizontal" | "vertical", a: number, bCarre: number): ConiqueGenerale {
  const aCarre = a * a;
  if (natureCible === "ellipse") {
    return axe === "horizontal" ? { p: bCarre, q: aCarre, n: aCarre * bCarre } : { p: aCarre, q: bCarre, n: aCarre * bCarre };
  }
  return axe === "horizontal" ? { p: bCarre, q: -aCarre, n: aCarre * bCarre } : { p: -aCarre, q: bCarre, n: aCarre * bCarre };
}

/** Point du "latus rectum" — TOUJOURS sur la conique, voir preuve en en-tête de fichier. */
function pointLatusRectum(axe: "horizontal" | "vertical", a: number, c: number, bCarre: number): { x0: Frac; y0: Frac } {
  const bSurA = fracReduire(bCarre, a);
  return axe === "horizontal" ? { x0: fracEntier(c), y0: bSurA } : { x0: bSurA, y0: fracEntier(c) };
}

const TRIPLETS_PYTHAGORICIENS: [number, number, number][] = [
  [3, 4, 5],
  [6, 8, 10],
  [5, 12, 13],
  [8, 15, 17],
  [7, 24, 25],
  [9, 12, 15],
  [20, 21, 29],
];

interface ResultatConique {
  coniqueEtPoint: ConiqueEtPoint;
  natureConique: NatureConiqueA;
  axe?: "horizontal" | "vertical";
  a?: number;
  bCarre?: number;
  rayon?: number;
  caracteristiques?: CaracteristiquesConiqueA;
  coniqueDirecte: boolean;
}

function sommetEtFoyer(axe: "horizontal" | "vertical", a: number, c: number, signeS: 1 | -1, signeF: 1 | -1): { sommetS: Point; foyerF: Point } {
  if (axe === "horizontal") return { sommetS: { x: signeS * a, y: 0 }, foyerF: { x: signeF * c, y: 0 } };
  return { sommetS: { x: 0, y: signeS * a }, foyerF: { x: 0, y: signeF * c } };
}

function construireConique(natureConique: NatureConiqueA): ResultatConique {
  if (natureConique === "cercle") {
    const triplet = tirerParmi(TRIPLETS_PYTHAGORICIENS);
    const s = tirerEntier(1, 2);
    const leg1 = triplet[0] * s;
    const leg2 = triplet[1] * s;
    const r = triplet[2] * s;
    return {
      coniqueEtPoint: { conique: { p: 1, q: 1, n: r * r }, x0: fracEntier(leg1), y0: fracEntier(leg2) },
      natureConique,
      rayon: r,
      coniqueDirecte: true,
    };
  }

  const base = construireMemeAxe({ natureCible: natureConique });
  const conique = formeGeneraleCentree(natureConique, base.axe, base.a, base.bCarre);
  const { x0, y0 } = pointLatusRectum(base.axe, base.a, base.c, base.bCarre);
  const coniqueDirecte = tirerParmi([true, false]);
  const { sommetS, foyerF } = sommetEtFoyer(base.axe, base.a, base.c, base.signeS, base.signeF);

  return {
    coniqueEtPoint: { conique, x0, y0 },
    natureConique,
    axe: base.axe,
    a: base.a,
    bCarre: base.bCarre,
    coniqueDirecte,
    caracteristiques: coniqueDirecte ? undefined : { a: base.a, c: base.c, bCarre: base.bCarre, natureCible: natureConique, axe: base.axe, sommetS, foyerF },
  };
}

// ============================================================================
// Construction de la droite cible (0, 1, ou 2 solutions) à partir du point "sympa".
// ============================================================================

function tangenteEnPoint(conique: ConiqueGenerale, x0: Frac, y0: Frac): DroiteAffine {
  const m = fracNeg(fracDiv(fracMul(fracEntier(conique.p), x0), fracMul(fracEntier(conique.q), y0)));
  const c = fracDiv(fracEntier(conique.n), fracMul(fracEntier(conique.q), y0));
  return { m, c };
}

const TYPES_PAIRE_SECANTE = ["diagPlus", "diagMoins", "horizPlus", "horizMoins"] as const;

function construireDroiteCible(conique: ConiqueGenerale, x0: Frac, y0: Frac, nombreSolutions: 0 | 1 | 2): DroiteAffine {
  if (nombreSolutions === 1) return tangenteEnPoint(conique, x0, y0);
  if (nombreSolutions === 0) {
    const tangente = tangenteEnPoint(conique, x0, y0);
    return { m: tangente.m, c: fracMul(tangente.c, fracEntier(2)) };
  }
  const type = tirerParmi(TYPES_PAIRE_SECANTE);
  if (type === "diagPlus") return { m: fracDiv(y0, x0), c: fracEntier(0) };
  if (type === "diagMoins") return { m: fracNeg(fracDiv(y0, x0)), c: fracEntier(0) };
  if (type === "horizPlus") return { m: fracEntier(0), c: y0 };
  return { m: fracEntier(0), c: fracNeg(y0) };
}

// ============================================================================
// Construction de [A;B] (médiatrice) ou [A;B;C] (hauteur) réalisant la droite cible CONFIRMÉE.
// ============================================================================

function construireMediatrice(droite: DroiteAffine): DonneesMediatrice {
  const k = tirerEntier(1, 2);
  const A: PointFrac = { x: fracEntier(k * droite.m.n), y: fracSub(droite.c, fracEntier(k * droite.m.d)) };
  const B: PointFrac = { x: fracEntier(-k * droite.m.n), y: fracAdd(droite.c, fracEntier(k * droite.m.d)) };
  return { sousType: "mediatrice", A, B };
}

function sontAlignes(A: PointFrac, B: PointFrac, C: PointFrac): boolean {
  const gauche = fracMul(fracSub(C.y, A.y), fracSub(B.x, A.x));
  const droite = fracMul(fracSub(C.x, A.x), fracSub(B.y, A.y));
  return fracEquals(gauche, droite);
}

function construireHauteur(droite: DroiteAffine): DonneesHauteur {
  const t = tirerEntier(1, 2);
  const C: PointFrac = { x: fracEntier(t), y: fracAdd(fracMul(droite.m, fracEntier(t)), droite.c) };
  let k0 = tirerEntier(1, 3);
  let A: PointFrac = { x: fracEntier(0), y: fracEntier(k0) };
  let B: PointFrac = { x: fracEntier(droite.m.n), y: fracSub(fracEntier(k0), fracEntier(droite.m.d)) };
  for (let tentative = 0; tentative < 10 && sontAlignes(A, B, C); tentative++) {
    k0++;
    A = { x: fracEntier(0), y: fracEntier(k0) };
    B = { x: fracEntier(droite.m.n), y: fracSub(fracEntier(k0), fracEntier(droite.m.d)) };
  }
  return { sousType: "hauteur", A, B, C, sommet: "C" };
}

// ============================================================================
// Point d'entrée famille A.
// ============================================================================

export interface OverridesFamilleA {
  natureConique?: NatureConiqueA;
  sousTypeDroite?: SousTypeDroiteA;
  nombreSolutions?: 0 | 1 | 2;
}

export function construireFamilleA(overrides: OverridesFamilleA = {}): ExerciceIntersectionsConiquesA {
  const natureConique = overrides.natureConique ?? tirerParmi(["ellipse", "hyperbole", "cercle"] as const);
  const resultatConique = construireConique(natureConique);
  const { conique, x0, y0 } = resultatConique.coniqueEtPoint;

  const sousTypeDroite = overrides.sousTypeDroite ?? tirerParmi(["deuxPoints", "mediatrice", "hauteur"] as const);
  const optionsNombreSolutions: (0 | 1 | 2)[] = natureConique === "hyperbole" ? [1, 2] : [0, 1, 2];
  const nombreSolutionsCible = sousTypeDroite === "deuxPoints" ? 2 : (overrides.nombreSolutions ?? tirerParmi(optionsNombreSolutions));

  const droite = construireDroiteCible(conique, x0, y0, nombreSolutionsCible);
  const resultat = resoudreIntersectionDroiteConique(conique, droite);
  if (resultat.nombreSolutions !== nombreSolutionsCible) {
    throw new Error(`construireFamilleA : incohérence de génération — ${nombreSolutionsCible} solution(s) attendue(s), ${resultat.nombreSolutions} obtenue(s)`);
  }

  const points: PointFrac[] = resultat.nombreSolutions === 0 ? [] : resultat.points;

  let donneesLigne: DonneesLigneA;
  if (sousTypeDroite === "deuxPoints") {
    const [A, B] = points as [PointFrac, PointFrac];
    donneesLigne = { sousType: "deuxPoints", A, B };
  } else if (sousTypeDroite === "mediatrice") {
    donneesLigne = construireMediatrice(droite);
  } else {
    donneesLigne = construireHauteur(droite);
  }

  return {
    famille: "A",
    coniqueDirecte: resultatConique.coniqueDirecte,
    caracteristiques: resultatConique.caracteristiques,
    natureConique,
    axe: resultatConique.axe,
    a: resultatConique.a,
    bCarre: resultatConique.bCarre,
    rayon: resultatConique.rayon,
    conique,
    sousTypeDroite,
    donneesLigne,
    droite,
    nombreSolutions: resultat.nombreSolutions,
    discriminant: resultat.discriminant,
    points,
  };
}
