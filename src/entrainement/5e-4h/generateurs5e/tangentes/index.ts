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

// ============================================================================
// Variante A — "pointDonne". 2 sous-familles à fréquence comparable.
// ============================================================================

/** Abscisse du point : 0 rarement (≈ 1 fois sur 12), sinon un entier non nul de [−3 ; 3] — a = 0
 * raccourcissait la substitution dans 11 à 14 % des tirages (audit 5e ch. 5, point 37). */
function tirerAbscisse(): number {
  return Math.random() < 1 / 12 ? 0 : entierNonNul(3);
}

/** Valeurs affichées raisonnables : |f(a)| et |f'(a)| ≤ 60 (audit 5e ch. 5, point 37 — jusqu'à
 * 425 auparavant). */
const BORNE_VALEURS = 60;

/** Degré 2 ou 3, coefficients ascendants |coeff|≤5, coefficient de tête non nul. */
export function genererPointDonnePolynomiale(): ExerciceTangentePointDonnePolynomiale {
  for (;;) {
    const degre = Math.random() < 0.5 ? 2 : 3;
    const coeffs: number[] = [];
    for (let i = 0; i < degre; i++) coeffs.push(entierAleatoire(-5, 5));
    coeffs.push(entierNonNul(5));
    const a = tirerAbscisse();
    const exercice: ExerciceTangentePointDonnePolynomiale = { variante: "pointDonne", sousFamille: "polynomiale", coeffs, a };
    if (Math.abs(valeurFPointDonne(exercice, a)) <= BORNE_VALEURS && Math.abs(deriveeFPointDonne(exercice, a)) <= BORNE_VALEURS) return exercice;
  }
}

/** Radicandes NON carrés parfaits : f(a) et f'(a) sont des valeurs exactes avec une racine carrée
 * irréductible (plus de « √4 » non simplifié — audit 5e ch. 5, point 34). */
const RADICANDES_TANGENTE = [2, 3, 5, 6];

/** f(x)=coeff·√(m·x+p) — `a` tiré en premier, `p` DÉDUIT pour que m·a+p tombe exactement sur un
 * radicande non carré (marge de domaine garantie par construction, jamais un rejet). */
export function genererPointDonneRadicale(): ExerciceTangentePointDonneRadicale {
  const a = tirerAbscisse();
  const m = entierNonNul(3);
  const radicandeCible = RADICANDES_TANGENTE[entierAleatoire(0, RADICANDES_TANGENTE.length - 1)];
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

/** Racine 0 rarement (elle annule c et raccourcit le calcul — 14 à 29,5 % des tirages avant
 * l'audit 5e ch. 5, point 37). */
function tirerRacine(): number {
  return Math.random() < 1 / 20 ? 0 : entierNonNul(3);
}

function ordonneesRaisonnables(exercice: ExerciceTangenteHorizontale): boolean {
  return exercice.racines.every((r) => Math.abs(valeurFHorizontale(exercice, r)) <= BORNE_VALEURS);
}

export function genererHorizontaleRacineDouble(): ExerciceTangenteHorizontale {
  for (;;) {
    const exercice = construireHorizontaleAvecRacines([tirerRacine()]);
    if (ordonneesRaisonnables(exercice)) return exercice;
  }
}

export function genererHorizontaleRacinesDistinctes(): ExerciceTangenteHorizontale {
  for (;;) {
    const r1 = tirerRacine();
    let r2 = tirerRacine();
    while (r2 === r1) r2 = tirerRacine();
    const exercice = construireHorizontaleAvecRacines([r1, r2]);
    if (ordonneesRaisonnables(exercice)) return exercice;
  }
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

const K_CANDIDATS = [1, -1, 1, -1, 2, -2];

/** Coefficients du quartique développé bornés (|eᵢ| ≤ 40 — jusqu'à 165 avant l'audit 5e ch. 5,
 * point 37) ; p = 0 et pente nulle (m = 0) deviennent rares (≈ 14,5 % chacun auparavant). */
const BORNE_COEFFS_QUARTIQUE = 40;

export function genererDoubleTangence(): ExerciceTangenteDoubleTangence {
  for (;;) {
    const m = Math.random() < 1 / 20 ? 0 : entierNonNul(3);
    const c = entierAleatoire(-3, 3);
    const p = Math.random() < 1 / 20 ? 0 : entierNonNul(2);
    let q = entierAleatoire(-3, 3);
    while (q === p) q = entierAleatoire(-3, 3);
    const k = K_CANDIDATS[entierAleatoire(0, K_CANDIDATS.length - 1)];
    const quadP = [p * p, -2 * p, 1]; // (x-p)² ascendant
    const quadQ = [q * q, -2 * q, 1]; // (x-q)² ascendant
    const quartique = multiplierPolynomes(quadP, quadQ).map((v) => v * k);
    quartique[0] += c;
    quartique[1] += m;
    if (quartique.every((v) => Math.abs(v) <= BORNE_COEFFS_QUARTIQUE)) return { variante: "doubleTangence", coeffs: quartique, p, q };
  }
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
