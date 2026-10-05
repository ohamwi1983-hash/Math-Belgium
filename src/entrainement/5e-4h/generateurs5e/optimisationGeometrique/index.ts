/**
 * Couche A (5e) — génération pour 5gen32 ("Optimisation géométrique"), 8e générateur du chapitre
 * "Dérivées et applications". 4 familles STRUCTURELLEMENT DISJOINTES tirées à fréquence comparable
 * (~22% chacune) + 2 variantes bonus RARES (poids réduit, voir `POIDS_FAMILLE`) — voir
 * `core5e/optimisationGeometrique.types.ts` pour le contrat complet et la convention RADIANS
 * (famille "trapeze"). N'importe jamais rien de `moteur5e/`.
 *
 * Toutes les familles sont construites "à l'envers" : le résultat optimal (x_opt/α_opt) est choisi
 * EN PREMIER, les données d'énoncé (b,l / V / T,A,mh,mv / P,A) sont DÉRIVÉES ensuite pour que ce
 * résultat tombe exactement juste — jamais un tirage-puis-rejet des données elles-mêmes.
 *
 * Chaque fonction objectif `valeurFOptimisation` est calculée par COMPOSITION à partir de la
 * quantité "isolée" (`valeurLienOptimisation`/`valeurHauteurTrapeze`+`valeurBaseSupTrapeze`) plutôt
 * que par une formule développée mémorisée séparément — cohérence interne : la même donnée
 * (mh,mv,T,A,P...) traverse tous les écrans sans jamais être re-dérivée d'une valeur déjà
 * approximée. Les formules développées visées par la tâche (ex. S(x)=2πx²+2V/x) sont revérifiées
 * PAR ÉGALITÉ NUMÉRIQUE avec cette composition dans `index.test.ts` (elles doivent coïncider
 * partout, pas seulement au point optimal).
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
// Famille "trapeze" — construction "à l'envers" : l (entier) ET u=cos(α_opt) (fraction simple)
// choisis EN PREMIER, b=l(1-2u²)/u dérivé, retenu SEULEMENT si entier positif raisonnable.
// ============================================================================

const FRACTIONS_U: { num: number; den: number }[] = [
  { num: 1, den: 2 },
  { num: 1, den: 3 },
  { num: 2, den: 3 },
  { num: 1, den: 4 },
  { num: 3, den: 4 },
  { num: 1, den: 5 },
  { num: 2, den: 5 },
  { num: 3, den: 5 },
  { num: 4, den: 5 },
];
const L_CANDIDATS_TRAPEZE = [2, 3, 4, 5, 6, 7, 8];
const MAX_ESSAIS_TRAPEZE = 300;
const B_MAX_TRAPEZE = 25;

export function construireTrapeze(): ExerciceTrapeze {
  for (let essai = 0; essai < MAX_ESSAIS_TRAPEZE; essai++) {
    const l = L_CANDIDATS_TRAPEZE[entierAleatoire(0, L_CANDIDATS_TRAPEZE.length - 1)];
    const frac = FRACTIONS_U[entierAleatoire(0, FRACTIONS_U.length - 1)];
    const u = frac.num / frac.den;
    const bNum = l * (1 - 2 * u * u);
    const bDen = u;
    const b = bNum / bDen;
    if (Number.isInteger(b) && b >= 1 && b <= B_MAX_TRAPEZE) {
      return { famille: "trapeze", b, l, u: reduireFraction(frac.num, frac.den) };
    }
  }
  // Repli déterministe — combinaison connue valide (voir tête de fichier, vérifiée numériquement).
  return { famille: "trapeze", b: 4, l: 4, u: { num: 1, den: 2 } };
}

export function valeurHauteurTrapeze(ex: ExerciceTrapeze, alpha: number): number {
  return ex.l * Math.sin(alpha);
}

export function valeurBaseSupTrapeze(ex: ExerciceTrapeze, alpha: number): number {
  return ex.b + 2 * ex.l * Math.cos(alpha);
}

export function alphaOptTrapeze(ex: ExerciceTrapeze): number {
  return Math.acos(ex.u.num / ex.u.den);
}

// ============================================================================
// Famille "cylindre" — x_opt (entier) choisi EN PREMIER, V=2π·x_opt³ dérivé (coeffV=2·x_opt³).
// ============================================================================

const AVEC_APPLICATION_POIDS = 0.12; // rare

export function construireCylindre(avecApplicationForcee?: boolean): ExerciceCylindre {
  const xOpt = entierAleatoire(2, 6);
  const coeffV = 2 * xOpt ** 3;
  const avecApplicationNumerique = avecApplicationForcee ?? Math.random() < AVEC_APPLICATION_POIDS;
  const prixUnitaireMateriau = avecApplicationNumerique ? entierAleatoire(2, 9) : undefined;
  return { famille: "cylindre", xOpt, coeffV, avecApplicationNumerique, prixUnitaireMateriau };
}

export function valeurHauteurCylindre(ex: ExerciceCylindre, x: number): number {
  const V = ex.coeffV * Math.PI;
  return V / (Math.PI * x * x);
}

// ============================================================================
// Famille "marges" (C, 2 sous-parties) — x_opt (entier), mh, mv (entiers distincts) choisis EN
// PREMIER ; T (margesA) ou A (margesB) dérivé — boucle bornée + repli déterministe (mh=1 divise
// toujours proprement).
// ============================================================================

const MAX_ESSAIS_MARGES = 200;

export function construireMargesA(): ExerciceMarges {
  for (let essai = 0; essai < MAX_ESSAIS_MARGES; essai++) {
    const xOpt = entierAleatoire(2, 6);
    const mh = entierAleatoire(1, 4);
    const mv = entierAleatoire(1, 4);
    if (mh === mv) continue;
    const T = (mv * (xOpt + 2 * mh) ** 2) / mh;
    if (Number.isInteger(T) && T > 0 && T <= 500) {
      return { famille: "margesA", mh, mv, T, xOpt };
    }
  }
  return { famille: "margesA", mh: 1, mv: 3, T: 108, xOpt: 4 };
}

export function construireMargesB(): ExerciceMarges {
  for (let essai = 0; essai < MAX_ESSAIS_MARGES; essai++) {
    const xOpt = entierAleatoire(2, 6);
    const mh = entierAleatoire(1, 4);
    const mv = entierAleatoire(1, 4);
    if (mh === mv) continue;
    const A = (mv * xOpt * xOpt) / mh;
    if (Number.isInteger(A) && A > 0 && A <= 500) {
      return { famille: "margesB", mh, mv, A, xOpt };
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
// Famille "fenetre" (D, 2 sous-parties) — r_opt (entier, PAIR pour fenetreB — voir tête de fichier
// core5e, garde le coefficient de π entier) choisi EN PREMIER, P (fenetreA) ou A (fenetreB) dérivé
// exactement en fonction de π.
// ============================================================================

export function construireFenetreA(): ExerciceFenetre {
  const rOpt = entierAleatoire(2, 6);
  const P: ValeurAvecPi = { rationnel: 4 * rOpt, coeffPi: rOpt };
  return { famille: "fenetreA", P, rOpt };
}

const R_OPT_PAIRS_FENETRE_B = [2, 4, 6];

export function construireFenetreB(): ExerciceFenetre {
  const rOpt = R_OPT_PAIRS_FENETRE_B[entierAleatoire(0, R_OPT_PAIRS_FENETRE_B.length - 1)];
  const A: ValeurAvecPi = { rationnel: 2 * rOpt * rOpt, coeffPi: (rOpt * rOpt) / 2 };
  return { famille: "fenetreB", A, rOpt };
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
  cubique: 12, // bonus 2, poids réduit mais non négligeable pour rester testable en dev
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
  { id: "trapeze", label: "A. Trapèze isocèle (angle α, signe de A'')" },
  { id: "cylindre", label: "B. Cylindre à volume fixé" },
  { id: "cylindre-application", label: "B. Cylindre — bonus application numérique" },
  { id: "margesA", label: "C(a). Marges — aire totale fixée, maximiser l'aire imprimée" },
  { id: "margesB", label: "C(b). Marges — aire imprimée fixée, minimiser l'aire totale" },
  { id: "fenetreA", label: "D(a). Fenêtre — périmètre fixé, maximiser l'aire" },
  { id: "fenetreB", label: "D(b). Fenêtre — aire fixée, minimiser le périmètre" },
  { id: "cubique", label: "Bonus 2. Reconstruction d'un polynôme cubique" },
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
