/**
 * Couche A (5e) — génération pour 5gen33 ("Contexte économique"). N'importe jamais rien de
 * `src/moteur5e/`. Contrat : `core5e/contexteEconomique.types.ts`.
 *
 * 3 familles STRUCTURELLEMENT DISJOINTES (jamais de "type" commun au-delà de `famille`) :
 *   - "A" (~46%) — coût marginal (approximation discrète vs dérivée), degré 2 ou 3 tiré 50/50,
 *     sous-cas "extremum existe/n'existe pas" tiré INDÉPENDAMMENT du degré (toujours vrai en
 *     degré 2 — C'_T linéaire, une seule racine toujours ; ~70%/~30% en degré 3 selon le signe de
 *     Δ=4b²-12ac, vérifié empiriquement sur 2000 tirages, voir `index.test.ts`).
 *   - "B" (~46%) — bénéfice maximum via égalité des marginales, construite "à l'envers" à partir
 *     des 2 racines DÉSIRÉES (x_opt>0, x_neg<0) de Cm(x)=Rm(x).
 *   - "bonus" (~8%, rare) — greffée sur le CONTEXTE de la famille A (coût cubique), résolution par
 *     dichotomie de P(q)=q·C'_T(q)-C_T(q)=0 (⟺ Cm(q)=CM(q)), racine délibérément non simple.
 *
 * `a` du coût cubique de la famille B est TOUJOURS > 0 — nécessaire pour que x_opt (la racine
 * POSITIVE retenue de Cm=Rm) soit un MAXIMUM de B, pas un minimum : B'(x) = R'_T(x)-C'_T(x) a pour
 * coefficient dominant -3a ; a>0 ⟹ parabole vers le bas ⟹ B' passe de + à - en x_opt (le plus
 * grand des 2 racines, x_opt>0>x_neg) ⟹ x_opt est bien un maximum local de B. Vérifié
 * empiriquement (signe de B' de part et d'autre de x_opt) avant câblage, voir `index.test.ts`.
 * `a` de la famille A (indépendante) reste signé (positif ou négatif) — plus de variété dans la
 * nature (max/min) du sous-cas "extremum", jamais contraint par la même exigence.
 */
import type {
  CoutTotalA,
  CoutTotalDegre2,
  CoutTotalDegre3,
  ExerciceContexteEconomique,
  ExerciceContexteEconomiqueA,
  ExerciceContexteEconomiqueB,
  ExerciceContexteEconomiqueBonus,
  ExtremumCoutTotal,
  IterationDichotomie,
} from "../../core5e/contexteEconomique.types";
import { NB_ITERATIONS_DICHOTOMIE } from "../../core5e/contexteEconomique.types";

function entierAleatoire(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Entier non nul dans [-max,-min] ∪ [min,max] — signe tiré 50/50. */
function entierSigneNonNul(min: number, max: number): number {
  const magnitude = entierAleatoire(min, max);
  return Math.random() < 0.5 ? magnitude : -magnitude;
}

// ============================================================================
// Évaluateurs purs — C_T(q)/C'_T(q), communs aux familles A et bonus.
// ============================================================================

export function valeurCoutTotal(c: CoutTotalA, q: number): number {
  return c.degre === 2 ? c.a * q * q + c.b * q + c.c : c.a * q ** 3 + c.b * q * q + c.c * q + c.d;
}

export function deriveeCoutTotal(c: CoutTotalA, q: number): number {
  return c.degre === 2 ? 2 * c.a * q + c.b : 3 * c.a * q * q + 2 * c.b * q + c.c;
}

/** Sonde de signe de part et d'autre de `position` (racine connue de C'_T=0) pour classifier
 * max/min — robuste quel que soit le signe du coefficient dominant, jamais une formule figée par
 * cas. Même principe que le "changement de signe réel" déjà en place pour 5gen29
 * (`generateurs5e/etudeLocale/index.ts`), réimplémenté ici (Couche A propre à ce générateur). */
function natureExtremum(c: CoutTotalA, position: number): "max" | "min" {
  const EPS = 1e-3;
  const avant = deriveeCoutTotal(c, position - EPS);
  const apres = deriveeCoutTotal(c, position + EPS);
  return avant > 0 && apres < 0 ? "max" : "min";
}

// ============================================================================
// Famille A — construction.
// ============================================================================

function tirerCoutTotalDegre2(): CoutTotalDegre2 {
  return { degre: 2, a: entierSigneNonNul(1, 3), b: entierAleatoire(-10, 10), c: entierAleatoire(-10, 10) };
}

function tirerCoutTotalDegre3(): CoutTotalDegre3 {
  return { degre: 3, a: entierSigneNonNul(1, 3), b: entierAleatoire(-8, 8), c: entierAleatoire(-8, 8), d: entierAleatoire(-10, 10) };
}

/** Racines de C'_T(q)=0, TOUJOURS triées croissant — vide si `!extremumExiste`. Position/nature
 * JAMAIS filtrées par signe (contrairement à la famille B) : la consigne de ce sous-cas ne
 * restreint pas au domaine q>0. */
function racinesEtNatureExtremum(c: CoutTotalA): { existe: boolean; extrema: ExtremumCoutTotal[] } {
  if (c.degre === 2) {
    const position = -c.b / (2 * c.a);
    return { existe: true, extrema: [{ position, nature: natureExtremum(c, position) }] };
  }
  const A = 3 * c.a;
  const B = 2 * c.b;
  const C = c.c;
  const delta = B * B - 4 * A * C;
  if (delta <= 0) return { existe: false, extrema: [] };
  const racine = Math.sqrt(delta);
  const positions = [(-B - racine) / (2 * A), (-B + racine) / (2 * A)].sort((p, q) => p - q);
  return { existe: true, extrema: positions.map((position) => ({ position, nature: natureExtremum(c, position) })) };
}

const TENTATIVES_MAX_CONSTRUCTION = 200;

function construireExerciceA(): ExerciceContexteEconomiqueA {
  for (let tentative = 0; tentative < TENTATIVES_MAX_CONSTRUCTION; tentative++) {
    const coutTotal: CoutTotalA = Math.random() < 0.5 ? tirerCoutTotalDegre2() : tirerCoutTotalDegre3();
    const q0 = entierAleatoire(1, 8);
    const cmDerivee = deriveeCoutTotal(coutTotal, q0);
    if (cmDerivee === 0) continue;
    if (coutTotal.degre === 3) {
      const delta = 4 * coutTotal.b * coutTotal.b - 12 * coutTotal.a * coutTotal.c;
      if (delta === 0) continue; // racine double dégénérée, exclue délibérément (voir types)
    }
    const cmDiscret = valeurCoutTotal(coutTotal, q0 + 1) - valeurCoutTotal(coutTotal, q0);
    const ecartAbsolu = Math.abs(cmDiscret - cmDerivee);
    const ecartPourcent = (ecartAbsolu / Math.abs(cmDerivee)) * 100;
    const { existe, extrema } = racinesEtNatureExtremum(coutTotal);
    return { famille: "A", coutTotal, q0, cmDiscret, cmDerivee, ecartAbsolu, ecartPourcent, extremumExiste: existe, extrema };
  }
  // Repli déterministe (jamais atteint en pratique — TENTATIVES_MAX_CONSTRUCTION largement
  // suffisant vu les fréquences empiriques, voir index.test.ts).
  const coutTotal: CoutTotalDegre2 = { degre: 2, a: 1, b: -4, c: 3 };
  const q0 = 2;
  const cmDerivee = deriveeCoutTotal(coutTotal, q0);
  const cmDiscret = valeurCoutTotal(coutTotal, q0 + 1) - valeurCoutTotal(coutTotal, q0);
  const { existe, extrema } = racinesEtNatureExtremum(coutTotal);
  return {
    famille: "A",
    coutTotal,
    q0,
    cmDiscret,
    cmDerivee,
    ecartAbsolu: Math.abs(cmDiscret - cmDerivee),
    ecartPourcent: (Math.abs(cmDiscret - cmDerivee) / Math.abs(cmDerivee)) * 100,
    extremumExiste: existe,
    extrema,
  };
}

/** Force le degré ET (en degré 3) le sous-cas "extremum existe"/"n'existe pas" — utilisé par le
 * panneau dev. Boucle bornée + repli sur un tirage libre du bon degré si la sous-condition n'est
 * jamais atteinte (n'arrive jamais en pratique, fréquences ~30%/~70%). */
function construireExerciceADegre(degre: 2 | 3, extremumExiste?: boolean): ExerciceContexteEconomiqueA {
  for (let tentative = 0; tentative < TENTATIVES_MAX_CONSTRUCTION; tentative++) {
    const coutTotal: CoutTotalA = degre === 2 ? tirerCoutTotalDegre2() : tirerCoutTotalDegre3();
    const q0 = entierAleatoire(1, 8);
    const cmDerivee = deriveeCoutTotal(coutTotal, q0);
    if (cmDerivee === 0) continue;
    if (coutTotal.degre === 3) {
      const delta = 4 * coutTotal.b * coutTotal.b - 12 * coutTotal.a * coutTotal.c;
      if (delta === 0) continue;
    }
    const { existe, extrema } = racinesEtNatureExtremum(coutTotal);
    if (extremumExiste !== undefined && existe !== extremumExiste) continue;
    const cmDiscret = valeurCoutTotal(coutTotal, q0 + 1) - valeurCoutTotal(coutTotal, q0);
    const ecartAbsolu = Math.abs(cmDiscret - cmDerivee);
    return { famille: "A", coutTotal, q0, cmDiscret, cmDerivee, ecartAbsolu, ecartPourcent: (ecartAbsolu / Math.abs(cmDerivee)) * 100, extremumExiste: existe, extrema };
  }
  return construireExerciceA();
}

// ============================================================================
// Famille B — construction "à l'envers".
//
// Choisis a>0, x_opt>0, x_neg<0 (racines DÉSIRÉES de Cm(x)=Rm(x)) EN PREMIER, puis m,k (prix)
// librement — dérive b = m - (3a/2)(x_opt+x_neg), c = k + 3a·x_opt·x_neg. Ces formules rendent
// EXACTEMENT 3a(x-x_opt)(x-x_neg) = 3a x² + (2b-2m) x + (c-k), donc Cm(x)-Rm(x) = 3a(x-x_opt)(x-x_neg)
// (vérifié par test unitaire numérique, `index.test.ts`) : les 2 racines de Cm=Rm sont bien
// exactement x_opt et x_neg par construction, jamais approchées.
// ============================================================================

function construireExerciceB(): ExerciceContexteEconomiqueB {
  for (let tentative = 0; tentative < TENTATIVES_MAX_CONSTRUCTION; tentative++) {
    const a = entierAleatoire(1, 3);
    const xOpt = entierAleatoire(1, 6);
    const xNeg = -entierAleatoire(1, 6);
    const m = entierSigneNonNul(1, 5);
    const k = entierAleatoire(-10, 10);
    const bBrut = m - (3 * a * (xOpt + xNeg)) / 2;
    if (!Number.isInteger(bBrut)) continue;
    const b = bBrut;
    const c = k + 3 * a * xOpt * xNeg;
    const d = entierAleatoire(-10, 10);
    const beneficeMax = (m * xOpt * xOpt + k * xOpt) - (a * xOpt ** 3 + b * xOpt * xOpt + c * xOpt + d);
    return { famille: "B", m, k, a, b, c, d, xOpt, xNeg, beneficeMax };
  }
  // Repli déterministe (jamais atteint en pratique — ~2/3 des tirages donnent b entier direct).
  const a = 1;
  const xOpt = 2;
  const xNeg = -2;
  const m = 3;
  const k = 5;
  const b = m - (3 * a * (xOpt + xNeg)) / 2;
  const c = k + 3 * a * xOpt * xNeg;
  const d = 4;
  const beneficeMax = (m * xOpt * xOpt + k * xOpt) - (a * xOpt ** 3 + b * xOpt * xOpt + c * xOpt + d);
  return { famille: "B", m, k, a, b, c, d, xOpt, xNeg, beneficeMax };
}

// ============================================================================
// Bonus — P(q) = q·C'_T(q) - C_T(q) = 2a q³ + b q² - d (le terme en q s'annule EXACTEMENT — vérifié
// par test unitaire numérique). Construction : tire a,b,c,d PUIS cherche un intervalle [gauche;
// droite] (bornes entières, largeur 1 ou 2) où P change de signe ; calcule la racine "vraie" par
// dichotomie interne poussée (60 itérations, jamais montrée à l'élève) ; REJETTE tout tirage dont
// la racine coïncide avec un rationnel simple p/qd (qd | 2a, p | d — théorème des racines
// rationnelles, couvre aussi tout milieu de dichotomie aux dénominateurs 1/2/4 pour a∈{1,2}) —
// garantit une racine non simple, jamais factorisable proprement. Précalcule ensuite EXACTEMENT
// NB_ITERATIONS_DICHOTOMIE itérations de vérité terrain.
// ============================================================================

function coefficientsP(c: CoutTotalDegre3): { pA: number; pB: number; pD: number } {
  return { pA: 2 * c.a, pB: c.b, pD: c.d };
}

export function evaluerP(c: CoutTotalDegre3, q: number): number {
  const { pA, pB, pD } = coefficientsP(c);
  return pA * q ** 3 + pB * q * q - pD;
}

function diviseurs(n: number): number[] {
  const abs = Math.max(1, Math.abs(Math.round(n)));
  const r: number[] = [];
  for (let i = 1; i <= abs; i++) if (abs % i === 0) r.push(i);
  return r;
}

/** true si un rationnel p/qd (qd | 2a, p | d, théorème des racines rationnelles) annule P — sert à
 * rejeter tout tirage dont la racine serait "trop simple". */
function possedeRacineRationnelleSimple(c: CoutTotalDegre3): boolean {
  const pds = diviseurs(c.d);
  const qds = diviseurs(2 * c.a);
  const EPS = 1e-9;
  for (const p of pds) {
    for (const qd of qds) {
      for (const signe of [1, -1]) {
        const candidat = (signe * p) / qd;
        if (Math.abs(evaluerP(c, candidat)) < EPS) return true;
      }
    }
  }
  return false;
}

function chercherIntervalleSigneOppose(c: CoutTotalDegre3): { gauche: number; droite: number } | null {
  for (let gauche = 0; gauche <= 2; gauche++) {
    for (const largeur of [1, 2]) {
      const droite = gauche + largeur;
      if (evaluerP(c, gauche) * evaluerP(c, droite) < 0) return { gauche, droite };
    }
  }
  return null;
}

const ITERATIONS_INTERNES_RACINE = 60;

function racineParDichotomieInterne(c: CoutTotalDegre3, gauche: number, droite: number): number {
  let lo = gauche;
  let hi = droite;
  let signeLo = evaluerP(c, lo) < 0;
  for (let i = 0; i < ITERATIONS_INTERNES_RACINE; i++) {
    const m = (lo + hi) / 2;
    const signeM = evaluerP(c, m) < 0;
    if (signeM === signeLo) {
      lo = m;
    } else {
      hi = m;
    }
  }
  return (lo + hi) / 2;
}

function precalculerIterations(c: CoutTotalDegre3, gauche: number, droite: number): { iterations: IterationDichotomie[]; borneFinaleGauche: number; borneFinaleDroite: number } {
  const iterations: IterationDichotomie[] = [];
  let lo = gauche;
  let hi = droite;
  for (let i = 0; i < NB_ITERATIONS_DICHOTOMIE; i++) {
    const milieu = (lo + hi) / 2;
    const pMilieu = evaluerP(c, milieu);
    const signeMilieu: 1 | -1 = pMilieu > 0 ? 1 : -1;
    const signeGauche: 1 | -1 = evaluerP(c, lo) > 0 ? 1 : -1;
    const garderCote: "gauche" | "droite" = signeGauche !== signeMilieu ? "gauche" : "droite";
    iterations.push({ gauche: lo, droite: hi, milieu, signeMilieu, garderCote });
    if (garderCote === "gauche") hi = milieu;
    else lo = milieu;
  }
  return { iterations, borneFinaleGauche: lo, borneFinaleDroite: hi };
}

function construireExerciceBonus(): ExerciceContexteEconomiqueBonus {
  for (let tentative = 0; tentative < TENTATIVES_MAX_CONSTRUCTION; tentative++) {
    const coutTotal: CoutTotalDegre3 = { degre: 3, a: entierAleatoire(1, 2), b: entierAleatoire(-5, 5), c: entierAleatoire(-8, 8), d: entierAleatoire(5, 30) };
    const intervalle = chercherIntervalleSigneOppose(coutTotal);
    if (!intervalle) continue;
    if (possedeRacineRationnelleSimple(coutTotal)) continue;
    const racineApprochee = racineParDichotomieInterne(coutTotal, intervalle.gauche, intervalle.droite);
    const { iterations, borneFinaleGauche, borneFinaleDroite } = precalculerIterations(coutTotal, intervalle.gauche, intervalle.droite);
    if (iterations.some((it) => it.signeMilieu !== 1 && it.signeMilieu !== -1)) continue;
    // Le vrai zéro doit rester dans l'intervalle final — garantit que la tolérance calculée
    // ci-dessous borne réellement l'écart entre le milieu final et la racine.
    if (!(racineApprochee >= Math.min(borneFinaleGauche, borneFinaleDroite) && racineApprochee <= Math.max(borneFinaleGauche, borneFinaleDroite))) continue;
    const demiLargeurFinale = Math.abs(borneFinaleDroite - borneFinaleGauche) / 2;
    const toleranceFinale = Math.ceil(demiLargeurFinale * 100) / 100;
    return { famille: "bonus", coutTotal, borneGauche: intervalle.gauche, borneDroite: intervalle.droite, racineApprochee, iterations, toleranceFinale };
  }
  // Repli déterministe (jamais atteint en pratique — 100% de réussite sur 500 tirages simulés,
  // voir index.test.ts).
  const coutTotal: CoutTotalDegre3 = { degre: 3, a: 1, b: 2, c: -3, d: 12 };
  const racineApprochee = racineParDichotomieInterne(coutTotal, 1, 2);
  const { iterations, borneFinaleGauche, borneFinaleDroite } = precalculerIterations(coutTotal, 1, 2);
  const demiLargeurFinale = Math.abs(borneFinaleDroite - borneFinaleGauche) / 2;
  return { famille: "bonus", coutTotal, borneGauche: 1, borneDroite: 2, racineApprochee, iterations, toleranceFinale: Math.ceil(demiLargeurFinale * 100) / 100 };
}

// ============================================================================
// Point d'entrée — dispatch pondéré. Bonus RARE (~8%), reste réparti ~50/50 entre A et B.
// ============================================================================

export function genererExerciceContexteEconomique(): ExerciceContexteEconomique {
  const r = Math.random();
  if (r < 0.08) return construireExerciceBonus();
  return r < 0.54 ? construireExerciceA() : construireExerciceB();
}

// ============================================================================
// Panneau dev — variantes forcées : famille A (degré 2), famille A degré 3 (extremum existe /
// n'existe pas), famille B, bonus.
// ============================================================================

export const CATALOGUE_VARIANTES: { id: string; label: string }[] = [
  { id: "A-degre2", label: "Famille A — coût degré 2" },
  { id: "A-degre3-extremum", label: "Famille A — coût degré 3, extremum existe" },
  { id: "A-degre3-sans-extremum", label: "Famille A — coût degré 3, pas d'extremum" },
  { id: "B", label: "Famille B — bénéfice maximum" },
  { id: "bonus", label: "Bonus — dichotomie (coût moyen)" },
];

export function construireAvecVarianteId(id: string): ExerciceContexteEconomique {
  switch (id) {
    case "A-degre2":
      return construireExerciceADegre(2);
    case "A-degre3-extremum":
      return construireExerciceADegre(3, true);
    case "A-degre3-sans-extremum":
      return construireExerciceADegre(3, false);
    case "B":
      return construireExerciceB();
    case "bonus":
      return construireExerciceBonus();
    default:
      return construireExerciceA();
  }
}
