/**
 * Couche A (5e) — génération pour 5gen33 ("Contexte économique"). N'importe jamais rien de
 * `src/moteur5e/`. Contrat : `core5e/contexteEconomique.types.ts`.
 *
 * Tous les tirages sont RÉALISTES (audit 5e ch. 5, décision G) : coût fixe > 0, coût total et coût
 * marginal strictement positifs pour q ≥ 0 (coût croissant), prix positif et décroissant sur le
 * domaine, bénéfice maximal > 0, optimum dans le domaine.
 *   - "A" (~46 %) — coût marginal (approximation discrète vs dérivée), degré 2 ou 3 tiré 50/50,
 *     puis coût moyen minimal (degré 2) ou coût marginal minimal (degré 3) ; régime exact (valeurs
 *     entières) ou calculatrice.
 *   - "B" (~46 %) — bénéfice maximum via égalité des marginales, construite "à l'envers" à partir
 *     des 2 racines DÉSIRÉES (x_opt > 0, x_neg < 0) de C'_T(x) = R'_T(x).
 *   - "bonus" (~8 %, rare) — coût cubique réaliste, résolution par dichotomie de
 *     P(q) = q·C'_T(q) − C_T(q) = 0 (⟺ coût marginal = coût moyen), racine non rationnelle.
 *
 * `a` du coût cubique de la famille B est TOUJOURS > 0 : B'(x) = R'_T(x) − C'_T(x) =
 * −3a(x − x_opt)(x − x_neg) passe de + à − en x_opt, qui est donc bien un MAXIMUM de B.
 */
import type {
  CoutTotalA,
  CoutTotalDegre2,
  CoutTotalDegre3,
  ExerciceContexteEconomique,
  ExerciceContexteEconomiqueA,
  ExerciceContexteEconomiqueB,
  ExerciceContexteEconomiqueBonus,
  IterationDichotomie,
  MinimumEconomiqueA,
} from "../../core5e/contexteEconomique.types";
import { NB_ITERATIONS_DICHOTOMIE } from "../../core5e/contexteEconomique.types";

function entierAleatoire(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
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

// ============================================================================
// Famille A — construction (coûts réalistes, audit 5e ch. 5, décision G).
// ============================================================================

function estCarreParfait(n: number): boolean {
  const r = Math.round(Math.sqrt(n));
  return r * r === n;
}

/** Degré 2 : C_T(q) = a q² + b q + c (a, b, c > 0 : coût croissant, coût fixe c). Coût moyen
 * C_M(q) = a q + b + c/q, minimal en q = √(c/a), où il vaut 2√(ac) + b. Régime exact : c = a·k². */
function tirerCoutDegre2(exact: boolean): { coutTotal: CoutTotalDegre2; minimum: MinimumEconomiqueA } {
  const a = entierAleatoire(1, 3);
  const b = entierAleatoire(2, 30);
  let c: number;
  if (exact) {
    const k = entierAleatoire(3, 12);
    c = a * k * k;
  } else {
    do {
      c = entierAleatoire(20, 300);
    } while (c % a === 0 && estCarreParfait(c / a));
  }
  const q = Math.sqrt(c / a);
  return { coutTotal: { degre: 2, a, b, c }, minimum: { grandeur: "coutMoyen", q, valeur: 2 * Math.sqrt(a * c) + b, exact } };
}

/** Degré 3 : C_T(q) = a q³ + b q² + c q + d avec a > 0, b < 0, d > 0 et b² < 3ac (C'_T > 0
 * partout : coût croissant). Coût marginal C'_T minimal en q = −b/(3a), où il vaut c − b²/(3a).
 * Régime exact : b multiple de 3a. */
function tirerCoutDegre3(exact: boolean): { coutTotal: CoutTotalDegre3; minimum: MinimumEconomiqueA } {
  const a = entierAleatoire(1, 2);
  let b: number;
  if (exact) {
    b = -3 * a * entierAleatoire(2, 8);
  } else {
    do {
      b = -entierAleatoire(4, 24 * a);
    } while (b % (3 * a) === 0);
  }
  const c = Math.ceil((b * b) / (3 * a) + 1e-9) + entierAleatoire(2, 40);
  const d = entierAleatoire(20, 200);
  const q = -b / (3 * a);
  return { coutTotal: { degre: 3, a, b, c, d }, minimum: { grandeur: "coutMarginal", q, valeur: c - (b * b) / (3 * a), exact } };
}

function construireExerciceADegre(degre: 2 | 3, exactForce?: boolean): ExerciceContexteEconomiqueA {
  const exact = exactForce ?? Math.random() < 0.6;
  // Les deux estimations du coût marginal doivent rester PROCHES (écart non nul, au plus 25 %),
  // comme l'annonce le cours (audit 5e ch. 5, point 23).
  for (let essai = 0; essai < 200; essai++) {
    const { coutTotal, minimum } = degre === 2 ? tirerCoutDegre2(exact) : tirerCoutDegre3(exact);
    const q0 = entierAleatoire(2, 10);
    const cmDerivee = deriveeCoutTotal(coutTotal, q0);
    const cmDiscret = valeurCoutTotal(coutTotal, q0 + 1) - valeurCoutTotal(coutTotal, q0);
    const ecartAbsolu = Math.abs(cmDiscret - cmDerivee);
    const ecartPourcent = (ecartAbsolu / cmDerivee) * 100;
    if (ecartAbsolu === 0 || ecartPourcent > 25) continue;
    return { famille: "A", coutTotal, q0, cmDiscret, cmDerivee, ecartAbsolu, ecartPourcent, minimum };
  }
  // Repli déterministe : C_T(q) = q² + 10q + 100, q₀ = 10 (écart 1 sur 30, soit 3,33 %).
  const coutTotal: CoutTotalDegre2 = { degre: 2, a: 1, b: 10, c: 100 };
  return { famille: "A", coutTotal, q0: 10, cmDiscret: 31, cmDerivee: 30, ecartAbsolu: 1, ecartPourcent: 100 / 30, minimum: { grandeur: "coutMoyen", q: 10, valeur: 30, exact: true } };
}

function construireExerciceA(): ExerciceContexteEconomiqueA {
  return construireExerciceADegre(Math.random() < 0.5 ? 2 : 3);
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
  for (let tentative = 0; tentative < 2000; tentative++) {
    const a = entierAleatoire(1, 2);
    const xOpt = entierAleatoire(2, 9);
    const xNeg = -entierAleatoire(1, 5);
    const pente = entierAleatoire(1, 6); // p(x) = k − pente·x
    const bBrut = -(3 * a * (xOpt + xNeg)) / 2 - pente;
    if (!Number.isInteger(bBrut)) continue;
    const b = bBrut;
    // c = k + 3a·x_opt·x_neg > 0 ⟹ k > 3a·x_opt·|x_neg|.
    const kMin = 3 * a * xOpt * -xNeg + 1;
    const k = kMin + entierAleatoire(0, 60);
    const c = k + 3 * a * xOpt * xNeg;
    if (c <= 0) continue;
    if (b < 0 && b * b >= 3 * a * c) continue; // C'_T > 0 pour x ≥ 0
    if (k - pente * xOpt <= 0) continue; // prix positif à l'optimum
    const rtOpt = k * xOpt - pente * xOpt * xOpt;
    const ctSansFixe = a * xOpt ** 3 + b * xOpt * xOpt + c * xOpt;
    const margeMax = rtOpt - ctSansFixe;
    if (margeMax < 10) continue;
    const d = entierAleatoire(5, Math.min(150, margeMax - 5));
    const beneficeMax = rtOpt - (ctSansFixe + d);
    if (beneficeMax <= 0) continue;
    const pointTestAvant = xOpt >= 3 ? xOpt - 2 : 1;
    const pointTestApres = xOpt + 1;
    if (pointTestAvant >= xOpt) continue;
    return { famille: "B", m: -pente, k, a, b, c, d, xOpt, xNeg, beneficeMax, pointTestAvant, pointTestApres };
  }
  // Repli déterministe (vérifié réaliste) : p(x) = 60 − 2x, C_T(x) = x³ − 3x² + 18x + 20.
  return { famille: "B", m: -2, k: 60, a: 1, b: -3, c: 18, d: 20, xOpt: 4, xNeg: -3, beneficeMax: 60 * 4 - 2 * 16 - (64 - 48 + 72 + 20), pointTestAvant: 2, pointTestApres: 5 };
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

const TENTATIVES_MAX_CONSTRUCTION = 200;
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
    const a = entierAleatoire(1, 2);
    const b = entierAleatoire(-6, 6);
    // Coût réaliste : c > b²/(3a) (coût marginal toujours positif) ; P ne dépend pas de c.
    const c = Math.floor((b * b) / (3 * a)) + entierAleatoire(1, 20);
    const coutTotal: CoutTotalDegre3 = { degre: 3, a, b, c, d: entierAleatoire(5, 30) };
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
  const coutTotal: CoutTotalDegre3 = { degre: 3, a: 1, b: 2, c: 5, d: 12 };
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
// Panneau dev — variantes forcées (identifiants inchangés, libellés à jour) : famille A degré 2,
// famille A degré 3 en valeurs exactes / à la calculatrice, famille B, bonus.
// ============================================================================

export const CATALOGUE_VARIANTES: { id: string; label: string }[] = [
  { id: "A-degre2", label: "Famille A — coût degré 2 (coût moyen minimal)" },
  { id: "A-degre3-extremum", label: "Famille A — coût degré 3 (coût marginal minimal, valeurs exactes)" },
  { id: "A-degre3-sans-extremum", label: "Famille A — coût degré 3 (coût marginal minimal, calculatrice)" },
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
