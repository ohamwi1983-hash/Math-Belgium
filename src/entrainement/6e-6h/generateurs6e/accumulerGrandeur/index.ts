import type {
  ExerciceAccumulerGrandeur,
  ExerciceCo2,
  ExerciceCuve,
  ExercicePluieComparer,
  ExercicePluieSeuil,
  ExerciceSalle,
  ExerciceSolaireComparer,
  ExerciceSolaireSeuil,
  IdVarianteAccumulerGrandeur,
  InstallationSolaire,
} from "../../core6e/accumulerGrandeur.types";

export type { IdVarianteAccumulerGrandeur } from "../../core6e/accumulerGrandeur.types";

/**
 * Couche A (6e) — tirage de `6gen80` « Accumuler une grandeur ». Une fonction de construction par
 * variante ; tirage libre équiprobable parmi les 8 variantes (`CATALOGUE_VARIANTES`, aussi utilisé
 * par `SelecteurVarianteDev` et l'adaptateur d'export). Uniquement `Math.random` : la graine des
 * feuilles imprimées (`export/codeExercice.ts::avecGraine`) rejoue donc exactement la même instance.
 *
 * Les paramètres sont tirés « à l'envers » (on choisit d'abord les instants entiers, puis on en
 * déduit les coefficients) pour que les variantes exactes donnent des entiers ou des décimaux finis
 * et que les valeurs restent plausibles (débits de quelques dizaines de L/min, puissances de
 * 1,5 à 4,5 kW, intensités de pluie jusqu'à 50 mm/h…).
 */

export const CATALOGUE_VARIANTES: { id: IdVarianteAccumulerGrandeur; label: string }[] = [
  { id: "cuve-max", label: "Cuve (entrée et sortie) — volume maximal" },
  { id: "cuve-vide", label: "Cuve (entrée et sortie) — instant où elle est vide" },
  { id: "salle-pleine", label: "Salle qui se remplit — instant où elle est pleine" },
  { id: "solaire-seuil", label: "Panneaux solaires (sinus) — batterie pleine" },
  { id: "solaire-comparer", label: "Panneaux solaires (polynôme) — comparer deux installations" },
  { id: "pluie-seuil", label: "Averse (exponentielle) — instant où une hauteur est atteinte" },
  { id: "pluie-comparer", label: "Orage (polynôme) — comparer avec une pluie fine" },
  { id: "co2-seuil", label: "Émissions de CO₂ (exponentielle) — budget carbone épuisé" },
];

function choisir<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)];
}

function entier(min: number, max: number, pas = 1): number {
  const n = Math.floor((max - min) / pas) + 1;
  return min + pas * Math.floor(Math.random() * n);
}

function melanger(n: number): number[] {
  const t = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [t[i], t[j]] = [t[j], t[i]];
  }
  return t;
}

// ============================================================================
// Cuve : V(t) = −(c/2)(t − tVide)(t + tN).
// ============================================================================

export function construireCuve(variante: "cuve-max" | "cuve-vide"): ExerciceCuve {
  for (;;) {
    const c = choisir([0.5, 1, 1.5, 2]);
    const tVide = entier(60, 180, 6);
    const tN = entier(20, tVide - 40, 2);
    if ((tVide - tN) % 4 !== 0) continue;
    const a = (c * (tVide - tN)) / 2;
    const V0 = (c * tVide * tN) / 2;
    const tMax = (tVide - tN) / 2;
    const s0 = choisir([10, 15, 20, 25, 30]);
    const E = a + s0;
    if (a < 10 || a > 90 || V0 < 400 || V0 > 8000 || tMax < 20 || E > 120) continue;
    if (s0 + c * tVide > 400) continue;
    const T = entier(10, tMax - 5, 10);
    return { variante, contexte: choisir(["cuve", "bassin", "citerne"] as const), E, s0, c, V0, tVide, T, ordreOptions: melanger(4) };
  }
}

// ============================================================================
// Salle : N(t) = N0 + a·t + b·t²/2, pleine en tPlein.
// ============================================================================

export function construireSalle(): ExerciceSalle {
  for (;;) {
    const a = entier(20, 60, 5);
    const b = choisir([0.5, 1, 1.5, 2]);
    const tPlein = entier(36, 90, 6);
    const N0 = entier(100, 800, 50);
    const capacite = N0 + a * tPlein + (b * tPlein * tPlein) / 2;
    if (capacite < 1500 || capacite > 9000) continue;
    const T = entier(10, tPlein - 6, 10);
    return { variante: "salle-pleine", contexte: choisir(["concert", "stade", "festival"] as const), N0, a, b, tPlein, capacite, T, ordreOptions: melanger(4) };
  }
}

// ============================================================================
// Panneaux solaires.
// ============================================================================

export function construireSolaireSeuil(): ExerciceSolaireSeuil {
  for (;;) {
    const lever = choisir([6, 7]);
    const D = choisir([12, 13, 14]);
    if (lever + D > 21) continue;
    const Pm = entier(1500, 4500, 250);
    const t1 = entier(lever + 1, lever + D - 4);
    const t2 = entier(t1 + 3, lever + D - 1);
    const total = (2 * Pm * D) / Math.PI;
    const Ebatterie = entier(1000, Math.floor(total * 0.8), 500);
    const part = Ebatterie / total;
    if (part < 0.2 || (part > 0.42 && part < 0.58)) continue;
    return { variante: "solaire-seuil", Pm, lever, D, t1, t2, Ebatterie, ordreOptions: melanger(4) };
  }
}

function energieInstallation(i: InstallationSolaire): number {
  return (i.k * (i.fin - i.debut) ** 3) / 6;
}

export function construireSolaireComparer(): ExerciceSolaireComparer {
  // Le signe de E_A − E_B est décidé d'abord : jamais toujours le même gagnant.
  const aGagne = Math.random() < 0.5;
  for (;;) {
    const portee = entier(12, 16);
    const debut = choisir([5, 6, 7]);
    if (debut + portee > 21) continue;
    const kA = entier(20, 70);
    const PmA = (kA * portee * portee) / 4;
    if (PmA < 1200 || PmA > 3000 || (kA * portee ** 3) % 6 !== 0) continue;
    const porteeB = entier(8, Math.min(11, portee - 3));
    const debutB = Math.round((2 * debut + portee - porteeB) / 2);
    const kB = entier(kA + 1, 4 * kA);
    const PmB = (kB * porteeB * porteeB) / 4;
    if (PmB < 1.2 * PmA || PmB > 4500 || (kB * porteeB ** 3) % 6 !== 0) continue;
    const A = { k: kA, debut, fin: debut + portee };
    const B = { k: kB, debut: debutB, fin: debutB + porteeB };
    const ecart = energieInstallation(A) - energieInstallation(B);
    if (Math.abs(ecart) < 300 || ecart > 0 !== aGagne) continue;
    return { variante: "solaire-comparer", A, B, ordreOptions: melanger(4) };
  }
}

// ============================================================================
// Pluie.
// ============================================================================

export function construirePluieSeuil(): ExercicePluieSeuil {
  for (;;) {
    const k = choisir([0.4, 0.5, 0.8, 1]);
    const I0 = entier(8, 40, 4);
    const D = choisir([2, 3, 4]);
    const H = (I0 / k) * (1 - Math.exp(-k * D));
    const Hcible = entier(Math.ceil(0.3 * H), Math.floor(0.85 * H));
    if (Hcible < 2 || Hcible > 0.85 * H) continue;
    const tCible = -Math.log(1 - (k * Hcible) / I0) / k;
    if (tCible < 0.15 * D || tCible > 0.9 * D) continue;
    return { variante: "pluie-seuil", I0, k, D, Hcible, aireToit: entier(60, 160, 10), ordreOptions: melanger(4) };
  }
}

export function construirePluieComparer(): ExercicePluieComparer {
  const orageGagne = Math.random() < 0.5;
  for (;;) {
    const D = choisir([2, 3, 4]);
    const c = entier(2, 48);
    const intensiteMax = (c * D * D) / 4;
    const H1 = (c * D ** 3) / 6;
    if ((c * D ** 3) % 3 !== 0 || intensiteMax < 8 || intensiteMax > 50 || H1 > 60) continue;
    const m = choisir([1, 1.5, 2, 2.5, 3]);
    const D2 = entier(3, 12);
    const ecart = H1 - m * D2;
    if (Math.abs(ecart) < 1 || ecart > 0 !== orageGagne) continue;
    return { variante: "pluie-comparer", c, D, m, D2, aireToit: entier(60, 160, 10), ordreOptions: melanger(4) };
  }
}

// ============================================================================
// CO₂.
// ============================================================================

export function construireCo2(): ExerciceCo2 {
  for (;;) {
    const r0 = entier(120, 400, 20);
    const k = choisir([0.02, 0.03, 0.04, 0.05]);
    const Q0 = Math.round((r0 * (7 + Math.random() * 3)) / 100) * 100;
    const T = entier(3, 8);
    const tVise = 9 + Math.random() * 14;
    const budget = Math.round((Q0 + (r0 / k) * (Math.exp(k * tVise) - 1)) / 500) * 500;
    const tBudget = Math.log(1 + (k * (budget - Q0)) / r0) / k;
    if (tBudget < T + 2 || tBudget > 25) continue;
    return { variante: "co2-seuil", r0, k, annee0: 2024, anneeReference: 2015, Q0, T, budget, ordreOptions: melanger(4) };
  }
}

// ============================================================================
// Points d'entrée.
// ============================================================================

export function construireAvecVarianteId(id: IdVarianteAccumulerGrandeur): ExerciceAccumulerGrandeur {
  switch (id) {
    case "cuve-max":
    case "cuve-vide":
      return construireCuve(id);
    case "salle-pleine":
      return construireSalle();
    case "solaire-seuil":
      return construireSolaireSeuil();
    case "solaire-comparer":
      return construireSolaireComparer();
    case "pluie-seuil":
      return construirePluieSeuil();
    case "pluie-comparer":
      return construirePluieComparer();
    case "co2-seuil":
      return construireCo2();
  }
}

/** Tirage libre : variante équiprobable parmi les 8 du catalogue. */
export function genererExerciceAccumulerGrandeur(): ExerciceAccumulerGrandeur {
  return construireAvecVarianteId(choisir(CATALOGUE_VARIANTES).id);
}
