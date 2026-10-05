/**
 * Couche A (5e) — génération pour 5gen28 ("Tangentes"), 4e générateur du chapitre "Dérivées et
 * applications". 3 variantes STRUCTURELLEMENT DISJOINTES tirées à fréquence pondérée (45%
 * "pointDonne" / 45% "horizontale" / 10% "doubleTangence", rare bonus) — voir
 * `core5e/tangentes.types.ts` pour le contrat complet. N'importe jamais rien de `moteur5e/`.
 *
 * Réutilise DIRECTEMENT `entierAleatoire`/`entierNonNul` (`generateurs5e/limites/fraction.ts`,
 * Couche A ↔ Couche A autorisé).
 *
 * Les évaluateurs numériques purs (`valeurFPointDonne`/`deriveeFPointDonne`/...) sont
 * volontairement RÉPLIQUÉS (jamais importés) dans `moteur5e/verificationTangentes.ts` — règle non
 * négociable CLAUDE.md, `moteur5e/` n'importe jamais `generateurs5e/`.
 */
import type {
  ExerciceTangente,
  ExerciceTangenteDoubleTangence,
  ExerciceTangenteHorizontale,
  ExerciceTangentePointDonne,
  ExerciceTangentePointDonnePolynomiale,
  ExerciceTangentePointDonneRadicale,
} from "../../core5e/tangentes.types";
import { entierAleatoire, entierNonNul } from "../limites/fraction";

function melanger<T>(arr: T[]): T[] {
  const copie = [...arr];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

function plage(min: number, max: number): number[] {
  const out: number[] = [];
  for (let i = min; i <= max; i++) out.push(i);
  return out;
}

/** 2 valeurs DISTINCTES tirées parmi `candidats` (≥2 éléments) — mélange puis prend les 2
 * premières, garantissant la distinction sans rejet/régénération (même patron que
 * `generateurs5e/definitionDerivee/index.ts::tirerDeuxDistincts`). */
function tirerDeuxDistincts(candidats: number[]): [number, number] {
  const melange = melanger(candidats);
  return [melange[0], melange[1]];
}

// ============================================================================
// Variante A — "pointDonne". 2 sous-familles à fréquence comparable.
// ============================================================================

/** Degré 2 ou 3, coefficients ascendants |coeff|≤5, coefficient de tête non nul. */
export function genererPointDonnePolynomiale(): ExerciceTangentePointDonnePolynomiale {
  const degre = Math.random() < 0.5 ? 2 : 3;
  const coeffs: number[] = [];
  for (let i = 0; i < degre; i++) coeffs.push(entierAleatoire(-5, 5));
  coeffs.push(entierNonNul(5));
  const a = entierAleatoire(-4, 4);
  return { variante: "pointDonne", sousFamille: "polynomiale", coeffs, a };
}

/** f(x)=coeff·√(m·x+p) — `a` tiré en premier, `p` DÉDUIT pour que m·a+p tombe exactement sur un
 * entier positif ∈[2,6] (marge de domaine garantie par construction, jamais un rejet). */
export function genererPointDonneRadicale(): ExerciceTangentePointDonneRadicale {
  const a = entierAleatoire(-3, 3);
  const m = entierNonNul(3);
  const radicandeCible = entierAleatoire(2, 6);
  const p = radicandeCible - m * a;
  const coeff = entierNonNul(4);
  return { variante: "pointDonne", sousFamille: "radicale", coeff, m, p, a };
}

export function genererPointDonne(): ExerciceTangentePointDonne {
  return Math.random() < 0.5 ? genererPointDonnePolynomiale() : genererPointDonneRadicale();
}

// ============================================================================
// Variante B — "horizontale". Construction "à l'envers" : les racines de f'(x)=0 sont choisies EN
// PREMIER, b/c s'en déduisent en arithmétique EXACTE (jamais un rejet/régénération).
//
// Preuve : f(x)=a·x³+b·x²+c·x+d ⟹ f'(x)=3a·x²+2b·x+c. Si f'(x)=3a·(x-r1)(x-r2)
// = 3a·x² - 3a(r1+r2)·x + 3a·r1·r2, l'identification donne 2b=-3a(r1+r2) donc b=-3a(r1+r2)/2, et
// c=3a·r1·r2 (toujours entier). Pour que b soit TOUJOURS entier quelles que soient les parités de
// r1/r2, il suffit que `a` soit PAIR (3a(r1+r2) est alors pair, quel que soit r1+r2) — d'où le
// tirage de `a` dans un ensemble d'entiers pairs non nuls, jamais impair.
// ============================================================================

const A_COEF_HORIZONTALE = [-2, 2];

function construireHorizontaleAvecRacines(racines: number[]): ExerciceTangenteHorizontale {
  const a = A_COEF_HORIZONTALE[entierAleatoire(0, A_COEF_HORIZONTALE.length - 1)];
  const r1 = racines[0];
  const r2 = racines.length === 2 ? racines[1] : racines[0];
  const b = (-3 * a * (r1 + r2)) / 2;
  const c = 3 * a * r1 * r2;
  const d = entierAleatoire(-5, 5);
  return { variante: "horizontale", a, b, c, d, racines };
}

export function genererHorizontaleRacineDouble(): ExerciceTangenteHorizontale {
  const r = entierAleatoire(-3, 3);
  return construireHorizontaleAvecRacines([r]);
}

export function genererHorizontaleRacinesDistinctes(): ExerciceTangenteHorizontale {
  const [r1, r2] = tirerDeuxDistincts(plage(-3, 3));
  return construireHorizontaleAvecRacines([r1, r2]);
}

export function genererHorizontale(): ExerciceTangenteHorizontale {
  return Math.random() < 0.5 ? genererHorizontaleRacineDouble() : genererHorizontaleRacinesDistinctes();
}

// ============================================================================
// Variante C — "doubleTangence" (RARE, bonus). Construction EXACTE : f(x)=k·(x-p)²·(x-q)²+m·x+c,
// DÉVELOPPÉ en un quartique ascendant via multiplication polynomiale entière — jamais une
// recherche, jamais une régénération.
// ============================================================================

/** Multiplie 2 polynômes représentés en coefficients ASCENDANTS — arithmétique entière exacte. */
export function multiplierPolynomes(p: number[], q: number[]): number[] {
  const resultat = new Array(p.length + q.length - 1).fill(0);
  for (let i = 0; i < p.length; i++) {
    for (let j = 0; j < q.length; j++) {
      resultat[i + j] += p[i] * q[j];
    }
  }
  return resultat;
}

const K_CANDIDATS = [1, -1, 2, -2];

export function genererDoubleTangence(): ExerciceTangenteDoubleTangence {
  const m = entierAleatoire(-3, 3);
  const c = entierAleatoire(-3, 3);
  const [p, q] = tirerDeuxDistincts(plage(-3, 3));
  const k = K_CANDIDATS[entierAleatoire(0, K_CANDIDATS.length - 1)];
  const quadP = [p * p, -2 * p, 1]; // (x-p)² ascendant
  const quadQ = [q * q, -2 * q, 1]; // (x-q)² ascendant
  const quartique = multiplierPolynomes(quadP, quadQ).map((v) => v * k);
  quartique[0] += c;
  quartique[1] += m;
  return { variante: "doubleTangence", coeffs: quartique, p, q };
}

// ============================================================================
// Évaluation numérique pure (nécessaire à la génération/l'affichage ET, RÉPLIQUÉE, à la
// vérification côté moteur5e).
// ============================================================================

export function valeurFPointDonne(exercice: ExerciceTangentePointDonne, x: number): number {
  if (exercice.sousFamille === "polynomiale") {
    return exercice.coeffs.reduce((s, coeff, i) => s + coeff * Math.pow(x, i), 0);
  }
  return exercice.coeff * Math.sqrt(exercice.m * x + exercice.p);
}

/** f'(x) — formule fermée, calculée UNE FOIS ICI par dérivation triviale (règle de puissance pour
 * la sous-famille polynomiale, formule connue pour la racine) : JAMAIS demandée à l'élève dans ce
 * générateur (c'est la compétence de 5gen27). */
export function deriveeFPointDonne(exercice: ExerciceTangentePointDonne, x: number): number {
  if (exercice.sousFamille === "polynomiale") {
    let s = 0;
    for (let i = 1; i < exercice.coeffs.length; i++) s += i * exercice.coeffs[i] * Math.pow(x, i - 1);
    return s;
  }
  return (exercice.coeff * exercice.m) / (2 * Math.sqrt(exercice.m * x + exercice.p));
}

export function valeurFHorizontale(exercice: ExerciceTangenteHorizontale, x: number): number {
  return exercice.a * x * x * x + exercice.b * x * x + exercice.c * x + exercice.d;
}

export function deriveeFHorizontale(exercice: ExerciceTangenteHorizontale, x: number): number {
  return 3 * exercice.a * x * x + 2 * exercice.b * x + exercice.c;
}

export function valeurFDoubleTangence(exercice: ExerciceTangenteDoubleTangence, x: number): number {
  return exercice.coeffs.reduce((s, coeff, i) => s + coeff * Math.pow(x, i), 0);
}

export function deriveeFDoubleTangence(exercice: ExerciceTangenteDoubleTangence, x: number): number {
  let s = 0;
  for (let i = 1; i < exercice.coeffs.length; i++) s += i * exercice.coeffs[i] * Math.pow(x, i - 1);
  return s;
}

// ============================================================================
// Dispatch pondéré + panneau dev.
// ============================================================================

const POIDS: Record<ExerciceTangente["variante"], number> = { pointDonne: 45, horizontale: 45, doubleTangence: 10 };
const TOTAL_POIDS = Object.values(POIDS).reduce((a, b) => a + b, 0);

function tirerVariantePonderee(): ExerciceTangente["variante"] {
  let tirage = Math.random() * TOTAL_POIDS;
  for (const [variante, poids] of Object.entries(POIDS) as [ExerciceTangente["variante"], number][]) {
    if (tirage < poids) return variante;
    tirage -= poids;
  }
  return "pointDonne";
}

export function genererExerciceTangente(): ExerciceTangente {
  switch (tirerVariantePonderee()) {
    case "pointDonne":
      return genererPointDonne();
    case "horizontale":
      return genererHorizontale();
    case "doubleTangence":
      return genererDoubleTangence();
  }
}

export const CATALOGUE_VARIANTES: { id: string; label: string }[] = [
  { id: "pointDonne-polynomiale", label: "A. Point donné — polynomiale" },
  { id: "pointDonne-radicale", label: "A. Point donné — radicale" },
  { id: "horizontale-double", label: "B. Horizontale — racine double" },
  { id: "horizontale-distinct", label: "B. Horizontale — 2 racines distinctes" },
  { id: "doubleTangence", label: "C. Double tangence (bonus)" },
];

export function construireAvecVarianteId(id: string): ExerciceTangente {
  switch (id) {
    case "pointDonne-polynomiale":
      return genererPointDonnePolynomiale();
    case "pointDonne-radicale":
      return genererPointDonneRadicale();
    case "horizontale-double":
      return genererHorizontaleRacineDouble();
    case "horizontale-distinct":
      return genererHorizontaleRacinesDistinctes();
    case "doubleTangence":
      return genererDoubleTangence();
    default:
      throw new Error(`construireAvecVarianteId : id inconnu "${id}"`);
  }
}
