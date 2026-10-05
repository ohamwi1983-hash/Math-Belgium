/**
 * Couche A (5e) — famille 3 de l'extension 5gen10 ("Substitution pythagoricienne", voir CLAUDE.md
 * section 5gen10 "Extension — 4 familles"). "Cible d'abord" : choisit t1≠t2 (2 valeurs REMARQUABLES
 * distinctes, POOL ci-dessous — dont certaines |t|>1, piège central de l'écran 3), dérive
 * α·T²+β·T+γ=0 par Vieta (α=g² où g=lcm(den₁,den₂)∈{1,2}, garantit β/γ ENTIERS — voir preuve dans
 * les tests), puis l'équation MIXTE d'origine par substitution EN SENS INVERSE de l'identité
 * sin²x+cos²x=1.
 *
 * Le POOL ne contient QUE des valeurs remarquables (0, ±0,5, ±1 pour les racines valides, ±1,5/±2
 * pour les racines structurellement invalides) — toute racine valide a donc TOUJOURS un angle exact
 * en fraction de π (`bExactPourT`), régime "exact" garanti pour cette famille entière, jamais besoin
 * d'un régime décimal.
 */
import type { ExerciceEquationTrig, ExercicePythagoricienne, RacinePythagoricienne, RationnelPi } from "../../core5e/equationsTrigonometriques.types";
import { branchesGeneralesCos, branchesGeneralesSin } from "./identites";
import { construireExerciceEquationTrig } from "./index";
import { unionSolutions } from "./solveur";
import { valeurNumerique } from "../parametresSinusoide/rationnelPi";

interface ValeurT {
  num: number;
  den: 1 | 2;
}

const POOL_T: ValeurT[] = [
  { num: -2, den: 1 },
  { num: -3, den: 2 },
  { num: -1, den: 1 },
  { num: -1, den: 2 },
  { num: 0, den: 1 },
  { num: 1, den: 2 },
  { num: 1, den: 1 },
  { num: 3, den: 2 },
  { num: 2, den: 1 },
];

function valeurNumeriqueT(v: ValeurT): number {
  return v.num / v.den;
}

function formatTLatex(t: number): string {
  if (Number.isInteger(t)) return String(t);
  const signe = t < 0 ? "-" : "";
  const magnitude = Math.abs(t);
  // magnitude ∈ {0.5, 1.5} dans ce pool — dénominateur 2 toujours.
  const num = Math.round(magnitude * 2);
  return `${signe}\\frac{${num}}{2}`;
}

const PI = (numerateur: number, denominateur: number): RationnelPi => ({ numerateur, denominateur, degrePi: 1 });

/** Angle EXACT (fraction de π) d'une valeur remarquable t∈{-1,-0.5,0,0.5,1} — seules valeurs VALIDES
 * (|t|≤1) du pool. */
function bExactPourT(fonctionCible: "cos" | "sin", t: number): RationnelPi {
  if (fonctionCible === "cos") {
    if (t === 1) return PI(0, 1);
    if (t === 0.5) return PI(1, 3);
    if (t === 0) return PI(1, 2);
    if (t === -0.5) return PI(2, 3);
    return PI(1, 1); // t === -1
  }
  if (t === 1) return PI(1, 2);
  if (t === 0.5) return PI(1, 6);
  if (t === 0) return PI(0, 1);
  if (t === -0.5) return PI(-1, 6);
  return PI(-1, 2); // t === -1
}

function construireRacine(fonctionCible: "cos" | "sin", t: number): RacinePythagoricienne {
  const invalide = Math.abs(t) > 1;
  if (invalide) return { t, invalide, resolution: null };

  const B = bExactPourT(fonctionCible, t);
  const branchesU = fonctionCible === "cos" ? branchesGeneralesCos(B, valeurNumerique(B)) : branchesGeneralesSin(B, valeurNumerique(B));
  const cas = { k: t, kLatex: formatTLatex(t), regime: "exact" as const, aucuneSolution: false, casSpecial: false, branchesU };
  const b = { exact: PI(0, 1), decimal: 0 };
  const resolution: ExerciceEquationTrig = construireExerciceEquationTrig(fonctionCible, cas, b, { numerateur: 1, denominateur: 1 });
  return { t, invalide: false, resolution };
}

/** Valeur de l'équation MIXTE d'origine (sin²+cos mélangés, ou cos²+sin) à un x donné — cross-vérifiée
 * indépendamment du polynôme cible par les tests (identité pythagoricienne). */
export function evaluerEquationMixte(ex: ExercicePythagoricienne, x: number): number {
  const { alpha, beta, gamma, fonctionCible } = ex;
  if (fonctionCible === "cos") return -alpha * Math.sin(x) ** 2 + beta * Math.cos(x) + (alpha + gamma);
  return -alpha * Math.cos(x) ** 2 + beta * Math.sin(x) + (alpha + gamma);
}

/** Valeur du polynôme CIBLE (pur, une seule fonction) à un x donné. */
export function evaluerPolynomeCible(ex: ExercicePythagoricienne, x: number): number {
  const T = ex.fonctionCible === "cos" ? Math.cos(x) : Math.sin(x);
  return ex.alpha * T * T + ex.beta * T + ex.gamma;
}

const TENTATIVES_MAX_INDICES = 200;

/** Tire 2 indices distincts dans `POOL_T`, en rerollant tant que les 2 valeurs tirées sont TOUTES
 * LES DEUX invalides (|t|>1, structurellement possible : le pool contient 4 valeurs invalides sur
 * 9) — sinon `solutionsUnion` serait vide (aucune racine valide à résoudre) et l'écran final
 * "solutionsPythagoricienne" (add-as-needed, jamais de bouton "aucune solution") deviendrait
 * insoluble pour l'élève — bug de softlock trouvé par vérification Playwright de bout en bout, même
 * principe de reroll déjà en place côté famille "produit" (`produitFacteurs.ts`, sous-cas
 * "nonFactoree"/"factoree") pour exactement cette même classe de défaut. */
/** Rejette une paire (i1,i2) ssi les 2 valeurs sont TOUTES LES DEUX invalides (voir ci-dessus) OU
 * ssi leur somme est nulle (F.1 — t1=-t2 ⟹ β=-alpha*(t1+t2)=0, le polynôme cible dégénèrerait en
 * pure α·T²+γ=0 SANS terme linéaire, jamais souhaitable pour cet écran). */
function paireRejetee(i1: number, i2: number): boolean {
  const t1 = valeurNumeriqueT(POOL_T[i1]);
  const t2 = valeurNumeriqueT(POOL_T[i2]);
  const toutesDeuxInvalides = Math.abs(t1) > 1 && Math.abs(t2) > 1;
  const betaNul = t1 + t2 === 0;
  return toutesDeuxInvalides || betaNul;
}

function tirerDeuxIndicesValides(): [number, number] {
  let i1 = Math.floor(Math.random() * POOL_T.length);
  let i2 = Math.floor(Math.random() * POOL_T.length);
  while (i2 === i1) i2 = Math.floor(Math.random() * POOL_T.length);
  let tentative = 0;
  while (paireRejetee(i1, i2) && tentative < TENTATIVES_MAX_INDICES) {
    i1 = Math.floor(Math.random() * POOL_T.length);
    i2 = Math.floor(Math.random() * POOL_T.length);
    while (i2 === i1) i2 = Math.floor(Math.random() * POOL_T.length);
    tentative++;
  }
  return [i1, i2];
}

export function construireExercicePythagoricienne(): ExercicePythagoricienne {
  const fonctionCible: "cos" | "sin" = Math.random() < 0.5 ? "cos" : "sin";

  const [i1, i2] = tirerDeuxIndicesValides();
  const v1 = POOL_T[i1];
  const v2 = POOL_T[i2];
  const t1 = valeurNumeriqueT(v1);
  const t2 = valeurNumeriqueT(v2);

  const g = (v1.den === 2 || v2.den === 2 ? 2 : 1) as 1 | 2;
  const alpha = g * g;
  const beta = Math.round(-alpha * (t1 + t2));
  const gamma = Math.round(alpha * t1 * t2);

  const racine1 = construireRacine(fonctionCible, t1);
  const racine2 = construireRacine(fonctionCible, t2);
  const solutionsUnion = unionSolutions(racine1.resolution?.solutions ?? [], racine2.resolution?.solutions ?? []);

  return { famille: "pythagoricienne", fonctionCible, alpha, beta, gamma, racine1, racine2, solutionsUnion };
}
