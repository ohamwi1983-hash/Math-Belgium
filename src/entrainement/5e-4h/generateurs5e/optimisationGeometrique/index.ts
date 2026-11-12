/**
 * Couche A (5e) — génération pour 5gen32 ("Optimisation géométrique"), chapitre "Dérivées et
 * applications". 6 familles d'optimisation (trapèze, cylindre, marges ×2, fenêtre ×2) dans le
 * tirage libre ; la variante "cubique" n'est accessible que par le sélecteur (audit 5e ch. 5,
 * décision H). Contrat complet et convention RADIANS : `core5e/optimisationGeometrique.types.ts`.
 * N'importe jamais rien de `moteur5e/`.
 *
 * Deux régimes par famille : « exact » (optimum entier ou fraction simple choisi EN PREMIER, données
 * dérivées à l'envers) et « calculatrice » (données entières tirées librement, optimum irrationnel).
 *
 * Chaque fonction objectif `valeurFOptimisation` est calculée par COMPOSITION à partir de la
 * quantité "isolée" (`valeurLienMarges`/`valeurLienFenetre`/`valeurHauteurCylindre`/
 * `valeurHauteurTrapeze`+`valeurBaseSupTrapeze`) plutôt que par une formule développée mémorisée
 * séparément ; les formules développées affichées (`ui5e/formatOptimisationGeometrique.ts`) sont
 * revérifiées par égalité numérique avec cette composition (scripts de l'audit 5e ch. 5).
 */
import type {
  ExerciceCubique,
  ExerciceCylindre,
  ExerciceFenetre,
  ExerciceMarges,
  ExerciceOptimisation,
  ExerciceTrapeze,
  FamilleOptimisation,
  ValeurAvecPi,
} from "../../core5e/optimisationGeometrique.types";
import { entierAleatoire, entierNonNul, reduireFraction } from "../limites/fraction";

export function valeurNumeriqueAvecPi(v: ValeurAvecPi): number {
  return v.rationnel + v.coeffPi * Math.PI;
}

// ============================================================================
// Régimes "exact" / "calculatrice" (audit 5e ch. 5, décision H) — dans le régime exact, l'optimum
// est construit à l'envers (entier ou fraction simple) ; dans le régime calculatrice, les données
// sont des entiers tirés librement et l'optimum est irrationnel (arrondi au centième).
// ============================================================================

const PART_REGIME_EXACT = 0.55;

function regimeExact(force?: boolean): boolean {
  return force ?? Math.random() < PART_REGIME_EXACT;
}

// ============================================================================
// Famille "trapeze" — A(α) = (b + l·cos α)·l·sin α ; A'(α) = 0 ⟺ 2l·u² + b·u − l = 0 (u = cos α,
// via sin²α = 1 − cos²α). Régime exact : u = n/d choisi EN PREMIER, b = l(d² − 2n²)/(n·d) retenu
// seulement si c'est un entier — test en arithmétique ENTIÈRE (un test flottant
// `Number.isInteger(l(1−2u²)/u)` échouait pour u = 1/3, 2/3, 1/5…, audit 5e ch. 5, point 3).
// ============================================================================

const FRACTIONS_U: { num: number; den: number }[] = [];
for (let den = 2; den <= 6; den++) {
  for (let num = 1; num < den; num++) {
    const pgcd = (a: number, b: number): number => (b === 0 ? a : pgcd(b, a % b));
    if (pgcd(num, den) === 1) FRACTIONS_U.push({ num, den });
  }
}
const L_MIN_TRAPEZE = 2;
const L_MAX_TRAPEZE = 12;
const B_MAX_TRAPEZE = 30;

/** Toutes les combinaisons exactes (l, u = n/d) qui donnent une base b entière dans [1 ; 30] —
 * calculées une fois (24 combinaisons). */
const COMBINAISONS_TRAPEZE_EXACTES: { l: number; b: number; u: { num: number; den: number } }[] = (() => {
  const out: { l: number; b: number; u: { num: number; den: number } }[] = [];
  for (let l = L_MIN_TRAPEZE; l <= L_MAX_TRAPEZE; l++) {
    for (const u of FRACTIONS_U) {
      const numerateur = l * (u.den * u.den - 2 * u.num * u.num);
      if (numerateur % (u.num * u.den) !== 0) continue;
      const b = numerateur / (u.num * u.den);
      if (b >= 1 && b <= B_MAX_TRAPEZE) out.push({ l, b, u });
    }
  }
  return out;
})();

/** u = cos(α_opt), racine positive de 2l·u² + b·u − l = 0. */
export function uOptTrapeze(ex: ExerciceTrapeze): number {
  if (ex.u) return ex.u.num / ex.u.den;
  return (-ex.b + Math.sqrt(ex.b * ex.b + 8 * ex.l * ex.l)) / (4 * ex.l);
}

export function construireTrapeze(exactForce?: boolean): ExerciceTrapeze {
  if (regimeExact(exactForce)) {
    const c = COMBINAISONS_TRAPEZE_EXACTES[entierAleatoire(0, COMBINAISONS_TRAPEZE_EXACTES.length - 1)];
    return { famille: "trapeze", b: c.b, l: c.l, u: reduireFraction(c.u.num, c.u.den) };
  }
  for (let essai = 0; essai < 200; essai++) {
    const l = entierAleatoire(3, 10);
    const b = entierAleatoire(2, 20);
    if (COMBINAISONS_TRAPEZE_EXACTES.some((c) => c.l === l && c.b === b)) continue;
    return { famille: "trapeze", b, l, u: null };
  }
  return { famille: "trapeze", b: 5, l: 4, u: null };
}

export function valeurHauteurTrapeze(ex: ExerciceTrapeze, alpha: number): number {
  return ex.l * Math.sin(alpha);
}

export function valeurBaseSupTrapeze(ex: ExerciceTrapeze, alpha: number): number {
  return ex.b + 2 * ex.l * Math.cos(alpha);
}

export function alphaOptTrapeze(ex: ExerciceTrapeze): number {
  return Math.acos(uOptTrapeze(ex));
}

// ============================================================================
// Famille "cylindre" — V = coeffV·π ; S(x) = 2πx² + 2coeffV·π/x ; S'(x) = 0 ⟺ x³ = coeffV/2.
// Régime exact : x_opt entier choisi EN PREMIER (coeffV = 2·x_opt³). Régime calculatrice : coeffV
// entier quelconque (x_opt = ∛(coeffV/2) irrationnel).
// ============================================================================

const AVEC_APPLICATION_POIDS = 0.12; // rare
const PRIX_CENTIMES_PAR_CM2 = [1, 2, 3, 4, 5];

export function construireCylindre(avecApplicationForcee?: boolean, exactForce?: boolean): ExerciceCylindre {
  let xOpt: number;
  let coeffV: number;
  if (regimeExact(exactForce)) {
    xOpt = entierAleatoire(2, 8);
    coeffV = 2 * xOpt ** 3;
  } else {
    do {
      coeffV = 10 * entierAleatoire(3, 100);
    } while (Number.isInteger(Math.round(Math.cbrt(coeffV / 2) * 1e9) / 1e9));
    xOpt = Math.cbrt(coeffV / 2);
  }
  const avecApplicationNumerique = avecApplicationForcee ?? Math.random() < AVEC_APPLICATION_POIDS;
  const prixUnitaireMateriau = avecApplicationNumerique ? PRIX_CENTIMES_PAR_CM2[entierAleatoire(0, PRIX_CENTIMES_PAR_CM2.length - 1)] / 100 : undefined;
  return { famille: "cylindre", xOpt, coeffV, avecApplicationNumerique, prixUnitaireMateriau };
}

export function valeurHauteurCylindre(ex: ExerciceCylindre, x: number): number {
  const V = ex.coeffV * Math.PI;
  return V / (Math.PI * x * x);
}

// ============================================================================
// Famille "marges" — largeur totale x + 2m_h, hauteur totale y + 2m_v.
// margesA (aire totale T fixée) : x_opt = √(m_h·T/m_v) − 2m_h ; margesB (aire imprimée A fixée) :
// x_opt = √(m_h·A/m_v). Régime exact : x_opt entier choisi EN PREMIER, T/A dérivé ; régime
// calculatrice : T/A entier tiré librement (dimensions d'une page, en cm).
// ============================================================================

const MAX_ESSAIS_MARGES = 400;

export function construireMargesA(exactForce?: boolean): ExerciceMarges {
  const exact = regimeExact(exactForce);
  for (let essai = 0; essai < MAX_ESSAIS_MARGES; essai++) {
    const mh = entierAleatoire(1, 4);
    const mv = entierAleatoire(1, 4);
    if (mh === mv) continue;
    if (exact) {
      const xOpt = entierAleatoire(4, 20);
      const T = (mv * (xOpt + 2 * mh) ** 2) / mh;
      if (Number.isInteger(T) && T >= 60 && T <= 900 && valeurLienMarges({ famille: "margesA", mh, mv, T, xOpt }, xOpt) > 0) {
        return { famille: "margesA", mh, mv, T, xOpt };
      }
    } else {
      const T = 10 * entierAleatoire(10, 80);
      const xOpt = Math.sqrt((mh * T) / mv) - 2 * mh;
      if (Number.isInteger(Math.round(xOpt * 1e9) / 1e9)) continue;
      if (xOpt >= 2 && valeurLienMarges({ famille: "margesA", mh, mv, T, xOpt }, xOpt) >= 2) return { famille: "margesA", mh, mv, T, xOpt };
    }
  }
  return { famille: "margesA", mh: 1, mv: 3, T: 300, xOpt: 8 };
}

export function construireMargesB(exactForce?: boolean): ExerciceMarges {
  const exact = regimeExact(exactForce);
  for (let essai = 0; essai < MAX_ESSAIS_MARGES; essai++) {
    const mh = entierAleatoire(1, 4);
    const mv = entierAleatoire(1, 4);
    if (mh === mv) continue;
    if (exact) {
      const xOpt = entierAleatoire(4, 20);
      const A = (mv * xOpt * xOpt) / mh;
      if (Number.isInteger(A) && A >= 30 && A <= 700) return { famille: "margesB", mh, mv, A, xOpt };
    } else {
      const A = 10 * entierAleatoire(5, 60);
      const xOpt = Math.sqrt((mh * A) / mv);
      if (Number.isInteger(Math.round(xOpt * 1e9) / 1e9)) continue;
      if (xOpt >= 2) return { famille: "margesB", mh, mv, A, xOpt };
    }
  }
  return { famille: "margesB", mh: 1, mv: 3, A: 48, xOpt: 4 };
}

/** y(x) — dimension isolée depuis la contrainte (aire totale T fixée, margesA) ou (aire imprimée A
 * fixée, margesB). */
export function valeurLienMarges(ex: ExerciceMarges, x: number): number {
  if (ex.famille === "margesA") {
    const T = ex.T as number;
    return T / (x + 2 * ex.mh) - 2 * ex.mv;
  }
  const A = ex.A as number;
  return A / x;
}

// ============================================================================
// Famille "fenetre" — fenetreA : P = (4 + π)·r_opt ; fenetreB : A = (2 + π/2)·r_opt².
// Régime exact : r_opt entier choisi EN PREMIER, P/A donné en fonction de π ; régime
// calculatrice : P/A entier (en dm, dm²), r_opt irrationnel.
// ============================================================================

export function construireFenetreA(exactForce?: boolean): ExerciceFenetre {
  if (regimeExact(exactForce)) {
    const rOpt = entierAleatoire(2, 9);
    return { famille: "fenetreA", P: { rationnel: 4 * rOpt, coeffPi: rOpt }, rOpt };
  }
  const P = entierAleatoire(8, 45);
  return { famille: "fenetreA", P: { rationnel: P, coeffPi: 0 }, rOpt: P / (4 + Math.PI) };
}

export function construireFenetreB(exactForce?: boolean): ExerciceFenetre {
  if (regimeExact(exactForce)) {
    const rOpt = entierAleatoire(2, 8);
    return { famille: "fenetreB", A: { rationnel: 2 * rOpt * rOpt, coeffPi: (rOpt * rOpt) / 2 }, rOpt };
  }
  const A = entierAleatoire(10, 120);
  return { famille: "fenetreB", A: { rationnel: A, coeffPi: 0 }, rOpt: Math.sqrt(A / (2 + Math.PI / 2)) };
}

/** h(r) — hauteur du rectangle isolée depuis la contrainte (périmètre P fixé, fenetreA) ou (aire A
 * fixée, fenetreB). */
export function valeurLienFenetre(ex: ExerciceFenetre, r: number): number {
  if (ex.famille === "fenetreA") {
    const P = valeurNumeriqueAvecPi(ex.P as ValeurAvecPi);
    return (P - (2 + Math.PI) * r) / 2;
  }
  const A = valeurNumeriqueAvecPi(ex.A as ValeurAvecPi);
  return A / (2 * r) - (Math.PI * r) / 4;
}

// ============================================================================
// Fonctions objectif à UNE variable — composées à partir des quantités "isolées" ci-dessus (jamais
// une formule développée mémorisée séparément, voir tête de fichier).
// ============================================================================

export function valeurFOptimisation(ex: ExerciceOptimisation, x: number): number {
  switch (ex.famille) {
    case "trapeze": {
      const baseInf = ex.b;
      const baseSup = valeurBaseSupTrapeze(ex, x);
      const hauteur = valeurHauteurTrapeze(ex, x);
      return ((baseInf + baseSup) / 2) * hauteur;
    }
    case "cylindre": {
      const h = valeurHauteurCylindre(ex, x);
      return 2 * Math.PI * x * x + 2 * Math.PI * x * h;
    }
    case "margesA": {
      const y = valeurLienMarges(ex, x);
      return x * y;
    }
    case "margesB": {
      const y = valeurLienMarges(ex, x);
      return (x + 2 * ex.mh) * (y + 2 * ex.mv);
    }
    case "fenetreA": {
      const h = valeurLienFenetre(ex, x);
      return 2 * x * h + (Math.PI * x * x) / 2;
    }
    case "fenetreB": {
      const h = valeurLienFenetre(ex, x);
      return 2 * x + 2 * h + Math.PI * x;
    }
    case "cubique":
      throw new Error("valeurFOptimisation : non applicable à la variante bonus 'cubique'");
  }
}

// ============================================================================
// Variante bonus 2 — "cubique". Construction "à l'envers" COMPLÈTE (voir tête de fichier).
// ============================================================================

const A_CANDIDATS_CUBIQUE = [-3, -2, -1, 1, 2, 3];
const X2_CANDIDATS_CUBIQUE = [-4, -2, 2, 4]; // toujours PAIRS : garantit b=-3a·x2/2 entier
const MAX_ESSAIS_CUBIQUE = 100;

export function valeurFCubique(ex: ExerciceCubique, x: number): number {
  return ex.a * x ** 3 + ex.b * x * x + ex.d;
}

export function construireCubique(): ExerciceCubique {
  const a = A_CANDIDATS_CUBIQUE[entierAleatoire(0, A_CANDIDATS_CUBIQUE.length - 1)];
  const x2 = X2_CANDIDATS_CUBIQUE[entierAleatoire(0, X2_CANDIDATS_CUBIQUE.length - 1)];
  const b = (-3 * a * x2) / 2;
  const d = entierNonNul(5);

  for (let essai = 0; essai < MAX_ESSAIS_CUBIQUE; essai++) {
    const x3 = entierNonNul(4);
    if (x3 === x2) continue;
    const denom = x3 ** 3 - 1.5 * x2 * x3 * x3;
    if (Math.abs(denom) < 1e-9) continue; // dégénéré (x3=1.5·x2) — jamais retenu
    const y3 = a * x3 ** 3 + b * x3 * x3 + d;
    return { famille: "cubique", a, b, x2, d, x3, y3 };
  }
  // Repli déterministe (a=2, x2=4, b=-12) — x3=1 n'est jamais dégénéré pour ce couple.
  const x3Repli = 1;
  const bRepli = (-3 * 2 * 4) / 2;
  const dRepli = 5;
  const y3Repli = 2 * x3Repli ** 3 + bRepli * x3Repli * x3Repli + dRepli;
  return { famille: "cubique", a: 2, b: bRepli, x2: 4, d: dRepli, x3: x3Repli, y3: y3Repli };
}

// ============================================================================
// Dispatch pondéré + panneau dev.
// ============================================================================

const POIDS_FAMILLE: Record<FamilleOptimisation, number> = {
  trapeze: 22,
  cylindre: 22,
  margesA: 11,
  margesB: 11,
  fenetreA: 11,
  fenetreB: 11,
  // Hors du tirage libre (audit 5e ch. 5, décision H) : ce n'est pas de l'optimisation. Toujours
  // accessible par le sélecteur de variantes (`CATALOGUE_VARIANTES`).
  cubique: 0,
};
const TOTAL_POIDS_FAMILLE = Object.values(POIDS_FAMILLE).reduce((a, b) => a + b, 0);

function tirerFamille(): FamilleOptimisation {
  let tirage = Math.random() * TOTAL_POIDS_FAMILLE;
  for (const [famille, poids] of Object.entries(POIDS_FAMILLE) as [FamilleOptimisation, number][]) {
    if (tirage < poids) return famille;
    tirage -= poids;
  }
  return "trapeze";
}

export function genererParFamille(famille: FamilleOptimisation): ExerciceOptimisation {
  switch (famille) {
    case "trapeze":
      return construireTrapeze();
    case "cylindre":
      return construireCylindre();
    case "margesA":
      return construireMargesA();
    case "margesB":
      return construireMargesB();
    case "fenetreA":
      return construireFenetreA();
    case "fenetreB":
      return construireFenetreB();
    case "cubique":
      return construireCubique();
  }
}

export function genererExerciceOptimisation(): ExerciceOptimisation {
  return genererParFamille(tirerFamille());
}

export const CATALOGUE_VARIANTES: { id: string; label: string }[] = [
  { id: "trapeze", label: "A. Trapèze isocèle (angle α, signe de A')" },
  { id: "cylindre", label: "B. Cylindre à volume fixé" },
  { id: "cylindre-application", label: "B. Cylindre — bonus application numérique" },
  { id: "margesA", label: "C(a). Marges — aire totale fixée, maximiser l'aire imprimée" },
  { id: "margesB", label: "C(b). Marges — aire imprimée fixée, minimiser l'aire totale" },
  { id: "fenetreA", label: "D(a). Fenêtre — périmètre fixé, maximiser l'aire" },
  { id: "fenetreB", label: "D(b). Fenêtre — aire fixée, minimiser le périmètre" },
  { id: "cubique", label: "Hors tirage. Reconstruction d'un polynôme cubique" },
];

export function construireAvecVarianteId(id: string): ExerciceOptimisation {
  switch (id) {
    case "trapeze":
      return construireTrapeze();
    case "cylindre":
      return construireCylindre(false);
    case "cylindre-application":
      return construireCylindre(true);
    case "margesA":
      return construireMargesA();
    case "margesB":
      return construireMargesB();
    case "fenetreA":
      return construireFenetreA();
    case "fenetreB":
      return construireFenetreB();
    case "cubique":
      return construireCubique();
    default:
      throw new Error(`construireAvecVarianteId : id inconnu "${id}"`);
  }
}
