import type {
  ExerciceEquationsTransformer,
  FonctionTrig,
  FormeEquation,
  MembreAffine,
  ValeurK,
  VarianteEquationsTransformer,
} from "../../core/equationsTransformer.types";
import { resoudreBase, valeurB, valeurK } from "../../moteur/modeleEquationsTransformer";

/**
 * Génération de gen78 (« Équations trigonométriques à transformer »). La valeur k de chaque
 * équation de base est choisie EN PREMIER (remarquable, à la calculatrice, sur un axe, ou sans
 * solution), puis l'équation de départ est construite autour (jamais tirée puis classée).
 *
 * Parts (mesurées dans `profil.ts`) : environ 15 % d'équations sans solution pour sin/cos (|k| > 1)
 * et pour le carré (k < 0) — c'est un VERDICT, jamais un cas particulier — ; 12 % de valeurs sur un
 * axe (k = 0 ou ±1) ; 30 % des autres à la calculatrice (k décimal non remarquable, angles au
 * dixième de degré). Produit : 15 % de facteurs impossibles (l'équation garde alors les solutions de
 * l'autre facteur).
 */

const r = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const choisir = <T,>(liste: readonly T[]): T => liste[r(0, liste.length - 1)]!;
const signeAuHasard = (): 1 | -1 => (Math.random() < 0.5 ? 1 : -1);

const PROBA_SANS_SOLUTION = 0.15;
const PROBA_AXE = 0.12;
const PROBA_CALCULATRICE = 0.3;

function pgcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x || 1;
}

function fraction(signe: 1 | -1 | 0, num: number, den: number, racine: 1 | 2 | 3 = 1, decimal = false): ValeurK {
  const g = pgcd(num, den);
  return { signe, num: num / g, den: den / g, racine, decimal };
}

/** |k| remarquables non nuls hors axe (num, den, racine) par fonction. */
const REMARQUABLES: Record<FonctionTrig, [number, number, 1 | 2 | 3][]> = {
  sin: [[1, 2, 1], [1, 2, 2], [1, 2, 3]],
  cos: [[1, 2, 1], [1, 2, 2], [1, 2, 3]],
  tan: [[1, 3, 3], [1, 1, 1], [1, 1, 3]],
};

/** |k| décimaux non remarquables (dixièmes), angles à la calculatrice. */
const DECIMAUX: Record<FonctionTrig, number[]> = {
  sin: [2, 3, 4, 6, 7, 8, 9],
  cos: [2, 3, 4, 6, 7, 8, 9],
  tan: [4, 8, 15, 20, 25, 30, 40],
};

/** |k| > 1 (sin, cos) : exacts (fractions) ou décimaux. */
const HORS_DOMAINE_EXACTS: [number, number][] = [[3, 2], [2, 1], [5, 2], [3, 1]];
const HORS_DOMAINE_DECIMAUX = [12, 14, 16, 18];

type Categorie = "remarquable" | "calculatrice" | "axe" | "sans-solution";

function tirerK(fonction: FonctionTrig, categorie: Categorie): ValeurK {
  switch (categorie) {
    case "axe":
      if (fonction === "tan" || Math.random() < 0.5) return fraction(0, 0, 1);
      return fraction(signeAuHasard(), 1, 1);
    case "sans-solution":
      if (Math.random() < 0.5) {
        const [n, d] = choisir(HORS_DOMAINE_EXACTS);
        return fraction(signeAuHasard(), n, d);
      }
      return fraction(signeAuHasard(), choisir(HORS_DOMAINE_DECIMAUX), 10, 1, true);
    case "calculatrice":
      return fraction(signeAuHasard(), choisir(DECIMAUX[fonction]), 10, 1, true);
    case "remarquable": {
      const [n, d, rac] = choisir(REMARQUABLES[fonction]);
      return fraction(signeAuHasard(), n, d, rac);
    }
  }
}

function categorieAffine(fonction: FonctionTrig): Categorie {
  const t = Math.random();
  if (fonction !== "tan" && t < PROBA_SANS_SOLUTION) return "sans-solution";
  if (t > 1 - PROBA_AXE) return "axe";
  return Math.random() < PROBA_CALCULATRICE ? "calculatrice" : "remarquable";
}

/**
 * a·f(α) + b = c avec k = (c − b)/a. a est un multiple du dénominateur de k (a·k s'écrit m ou m√r) ;
 * si k est irrationnel, c = 0 et b = −a·k = ∓m√r ; sinon c est un petit entier et b = c − a·k ≠ 0.
 */
function membreAffine(fonction: FonctionTrig, k: ValeurK, cForce?: number): MembreAffine {
  const m = k.den >= 5 ? 1 : r(1, k.den === 1 ? 3 : 2);
  const a = (Math.random() < 0.2 ? -1 : 1) * k.den * m;
  const ak = (a / k.den) * k.signe * k.num; // a·k = ak·√racine
  if (k.racine !== 1) return { fonction, a, bEntier: 0, bRacineCoef: -ak, bRacine: k.racine, c: 0 };
  for (let essai = 0; ; essai++) {
    const c = cForce ?? r(-3, 3);
    const b = c - ak;
    if (b !== 0 || essai > 20) return { fonction, a, bEntier: b, bRacineCoef: 0, bRacine: 1, c };
  }
}

function construireAffine(fonction: FonctionTrig): ExerciceEquationsTransformer {
  const k = tirerK(fonction, categorieAffine(fonction));
  const membre = membreAffine(fonction, k);
  const base = resoudreBase(fonction, k);
  return assembler(`affine-${fonction}` as VarianteEquationsTransformer, { type: "affine", membre }, [base]);
}

/** f²(α) = k² : k² rationnel. Remarquables 1/4, 1/2, 3/4 ; décimaux (0,2)² … ; axe 0 ou 1 ; négatifs. */
function construireCarre(fonction: "sin" | "cos"): ExerciceEquationsTransformer {
  const t = Math.random();
  let carreNum: number;
  let carreDen: number;
  let decimal = false;
  if (t < PROBA_SANS_SOLUTION) {
    if (Math.random() < 0.5) [carreNum, carreDen] = choisir([[-1, 4], [-1, 2], [-3, 4], [-1, 1]] as const);
    else [carreNum, carreDen, decimal] = [...choisir([[-4, 25], [-9, 25], [-16, 25], [-36, 100]] as const), true];
  } else if (t > 1 - PROBA_AXE) {
    [carreNum, carreDen] = Math.random() < 0.5 ? [0, 1] : [1, 1];
  } else if (Math.random() < PROBA_CALCULATRICE) {
    const dixiemes = choisir([2, 3, 4, 6, 7, 8, 9]);
    [carreNum, carreDen, decimal] = [dixiemes * dixiemes, 100, true];
  } else {
    [carreNum, carreDen] = choisir([[1, 4], [1, 2], [3, 4]] as const);
  }
  const g = pgcd(carreNum, carreDen);
  carreNum /= g;
  carreDen /= g;

  // Écriture : f²(α) = k (40 %, toujours pour un dénominateur 100 ou k = 0), sinon a·f²(α) + b = 0,
  // a·f²(α) = c ou a·f²(α) + b = c (a = dénominateur de k, doublé parfois).
  let membre: MembreAffine;
  const nue = Math.random() < 0.4 || carreDen === 100 || carreNum === 0;
  if (nue) {
    membre = { fonction, a: 1, bEntier: 0, bRacineCoef: 0, bRacine: 1, c: carreNum / carreDen };
  } else {
    const a = carreDen * (carreDen <= 2 && Math.random() < 0.5 ? 2 : 1);
    const ak = (a / carreDen) * carreNum;
    membre = Math.random() < 0.5 ? { fonction, a, bEntier: -ak, bRacineCoef: 0, bRacine: 1, c: 0 } : { fonction, a, bEntier: 0, bRacineCoef: 0, bRacine: 1, c: ak };
    if (membre.c === 0 && Math.random() < 0.3) {
      const decalage = r(1, 3);
      membre = { ...membre, bEntier: membre.bEntier + decalage, c: decalage };
    }
  }
  const bases = [];
  if (carreNum === 0) bases.push(resoudreBase(fonction, fraction(0, 0, 1)));
  else if (carreNum > 0) {
    const racine = racineValeur(carreNum, carreDen, decimal);
    bases.push(resoudreBase(fonction, { ...racine, signe: 1 }), resoudreBase(fonction, { ...racine, signe: -1 }));
  }
  return assembler(`carre-${fonction}` as VarianteEquationsTransformer, { type: "carre", membre, carreNum, carreDen, carreDecimal: decimal, nue }, bases);
}

/** √(num/den) exact : num/den ∈ {1/4, 1/2, 3/4, 1, (d/10)²}. */
function racineValeur(num: number, den: number, decimal: boolean): ValeurK {
  if (decimal) return fraction(1, Math.round(Math.sqrt(num) * 10), Math.round(Math.sqrt(den) * 10), 1, true);
  if (num === 1 && den === 1) return fraction(1, 1, 1);
  if (num === 1 && den === 4) return fraction(1, 1, 2);
  if (num === 1 && den === 2) return fraction(1, 1, 2, 2);
  return fraction(1, 1, 2, 3); // 3/4
}

/** f(α) · (a·g(α) + b) = 0 : le facteur nu donne f(α) = 0, l'autre g(α) = k (jamais sur un axe). */
function construireProduit(): ExerciceEquationsTransformer {
  const g = choisir(["sin", "cos", "tan"] as const);
  // cos α = 0 donne 90° et 270°, où tan α n'existe pas : jamais « cos α · (a·tan α + b) = 0 ».
  const nu = g === "tan" ? choisir(["sin", "tan"] as const) : choisir(["sin", "cos", "tan"] as const);
  const t = Math.random();
  const categorie: Categorie = g !== "tan" && t < PROBA_SANS_SOLUTION ? "sans-solution" : Math.random() < PROBA_CALCULATRICE ? "calculatrice" : "remarquable";
  const k = tirerK(g, categorie);
  const affine = membreAffine(g, k, 0);
  const nuEnPremier = Math.random() < 0.7;
  const baseNu = resoudreBase(nu, fraction(0, 0, 1));
  const baseAffine = resoudreBase(g, k);
  const forme: FormeEquation = { type: "produit", nu, affine, nuEnPremier };
  return assembler("produit", forme, nuEnPremier ? [baseNu, baseAffine] : [baseAffine, baseNu]);
}

function assembler(variante: VarianteEquationsTransformer, forme: FormeEquation, bases: ExerciceEquationsTransformer["bases"]): ExerciceEquationsTransformer {
  const calculatrice = bases.some((b) => b.k.decimal) || (forme.type === "carre" && forme.carreDecimal);
  const solutions = [...new Set(bases.flatMap((b) => b.solutions))].sort((x, y) => x - y);
  // Garde-fou : k = (c − b)/a doit redonner la valeur de la base (affine).
  if (forme.type === "affine") {
    const m = forme.membre;
    const k = (m.c - valeurB(m)) / m.a;
    if (Math.abs(k - valeurK(bases[0]!.k)) > 1e-9) throw new Error("gen78 : équation affine incohérente");
  }
  return { variante, forme, bases, calculatrice, solutions };
}

export const CATALOGUE_VARIANTES: { id: VarianteEquationsTransformer; label: string }[] = [
  { id: "affine-sin", label: "a·sin α + b = c" },
  { id: "affine-cos", label: "a·cos α + b = c" },
  { id: "affine-tan", label: "a·tan α + b = c" },
  { id: "carre-sin", label: "sin² α = k" },
  { id: "carre-cos", label: "cos² α = k" },
  { id: "produit", label: "Produit nul : f(α) · (a·g(α) + b) = 0" },
];

export function construireAvecVariante(id: string): ExerciceEquationsTransformer {
  switch (id as VarianteEquationsTransformer) {
    case "affine-sin":
      return construireAffine("sin");
    case "affine-cos":
      return construireAffine("cos");
    case "affine-tan":
      return construireAffine("tan");
    case "carre-sin":
      return construireCarre("sin");
    case "carre-cos":
      return construireCarre("cos");
    default:
      return construireProduit();
  }
}

export function genererExerciceEquationsTransformer(): ExerciceEquationsTransformer {
  return construireAvecVariante(choisir(CATALOGUE_VARIANTES).id);
}
