/**
 * Couche A — modèle de `6gen110` « Variance et écart-type d'une loi discrète » (6e ch. 8, § 1).
 * Probabilités en CENTIÈMES (entiers, multiples de 5) : E(X), E(X²) et V(X) sont des décimaux EXACTS
 * calculés en entiers (S₁ = Σ xᵢpᵢ, S₂ = Σ xᵢ²pᵢ ; E = S₁/100, E(X²) = S₂/100,
 * V = (100·S₂ − S₁²)/10 000). Variante `calcul` : la loi est choisie pour que σ(X) soit un décimal
 * exact (au plus deux décimales) — l'écart-type se donne sans racine approchée. Variante `risque` :
 * deux jeux de même espérance et de variances différentes ; le jeu le plus risqué (verdict) est tiré
 * à parts égales AVANT les lois.
 */

export type Variante110 = "calcul" | "risque";
export type Contexte110 = "gain" | "pannes" | "buts";
export type Phase110 = "esperance" | "carres" | "variance" | "ecartType" | "esperances" | "variances" | "verdict";

export interface Loi110 {
  valeurs: number[];
  /** Probabilités en centièmes (somme 100). */
  probas: number[];
}

export interface Exercice110 {
  variante: Variante110;
  contexte: Contexte110;
  loi: Loi110;
  /** Variante `risque` : second jeu (même espérance). */
  loiB?: Loi110;
  /** Variante `risque` : jeu le plus risqué (plus grande variance). */
  plusRisque?: "A" | "B";
}

export const s1 = (l: Loi110) => l.valeurs.reduce((a, x, i) => a + x * l.probas[i]!, 0);
export const s2 = (l: Loi110) => l.valeurs.reduce((a, x, i) => a + x * x * l.probas[i]!, 0);
/** 10 000 × V(X), entier. */
export const v10000 = (l: Loi110) => 100 * s2(l) - s1(l) ** 2;

export const esperance = (l: Loi110) => s1(l) / 100;
export const esperanceCarres = (l: Loi110) => s2(l) / 100;
export const variance = (l: Loi110) => v10000(l) / 10000;
export const ecartType = (l: Loi110) => Math.sqrt(v10000(l)) / 100;

export function phases110(e: Exercice110): Phase110[] {
  return e.variante === "calcul" ? ["esperance", "carres", "variance", "ecartType"] : ["esperances", "variances", "verdict"];
}

const entier = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
const parmi = <T,>(t: readonly T[]): T => t[Math.floor(Math.random() * t.length)]!;

/** n probabilités multiples de 5 (centièmes), chacune ≥ `min`, de somme 100. */
function probas(n: number, min = 5): number[] {
  for (;;) {
    const p = Array.from({ length: n }, () => min + 5 * entier(0, Math.floor((100 - n * min) / 5)));
    const reste = 100 - p.slice(0, n - 1).reduce((a, b) => a + b, 0);
    if (reste >= min && reste % 5 === 0) {
      p[n - 1] = reste;
      return p;
    }
  }
}

function valeursDistinctes(n: number, a: number, b: number): number[] {
  const s = new Set<number>();
  while (s.size < n) s.add(entier(a, b));
  return [...s].sort((x, y) => x - y);
}

const carreParfait = (n: number) => n > 0 && Number.isInteger(Math.sqrt(n));

function loiCalcul(contexte: Contexte110): Loi110 {
  for (;;) {
    let valeurs: number[];
    if (contexte === "gain") {
      valeurs = valeursDistinctes(4, -5, 10);
      if (valeurs[0]! >= 0) continue;
    } else if (contexte === "pannes") {
      valeurs = entier(0, 1) ? [0, 1, 2, 3] : [0, 1, 2, 3, 4];
    } else valeurs = [0, 1, 2, 3, 4];
    const l = { valeurs, probas: probas(valeurs.length) };
    const v = v10000(l);
    // σ décimal exact à au plus deux décimales, différent de V (le piège σ = V reste visible) et de 1.
    if (carreParfait(v) && v !== 10000 && Math.sqrt(v) / 100 !== v / 10000) return l;
  }
}

function loiJeu(): Loi110 {
  return { valeurs: valeursDistinctes(3, -10, 15), probas: probas(3, 10) };
}

/** Second jeu de même espérance (S₁ identique), variance différente d'au moins 25 %. */
function paireRisque(): [Loi110, Loi110] {
  for (;;) {
    const a = loiJeu();
    // Espérance à une décimale au plus (S₁ multiple de 10) : variances à deux décimales au plus.
    // Jeu réaliste : une perte et un gain possibles, espérance entre −2 € et 6 €.
    if (a.valeurs[0]! >= 0 || a.valeurs[2]! <= 0 || s1(a) % 10 !== 0 || s1(a) < -200 || s1(a) > 600) continue;
    const cible = s1(a);
    for (let k = 0; k < 400; k++) {
      const n = entier(0, 2) === 0 ? 4 : 3;
      const p = probas(n, 10);
      const xs = valeursDistinctes(n - 1, -12, 18);
      const reste = cible - xs.reduce((acc, x, i) => acc + x * p[i]!, 0);
      if (reste % p[n - 1]! !== 0) continue;
      const dernier = reste / p[n - 1]!;
      if (dernier < -15 || dernier > 25 || xs.includes(dernier)) continue;
      const valeurs = [...xs, dernier];
      const ordre = valeurs.map((_, i) => i).sort((i, j) => valeurs[i]! - valeurs[j]!);
      const b = { valeurs: ordre.map((i) => valeurs[i]!), probas: ordre.map((i) => p[i]!) };
      const va = v10000(a);
      const vb = v10000(b);
      if (Math.abs(va - vb) < 0.25 * Math.min(va, vb)) continue;
      if (JSON.stringify(a.valeurs) === JSON.stringify(b.valeurs)) continue;
      if (b.valeurs[0]! >= 0 || b.valeurs[b.valeurs.length - 1]! <= 0) continue;
      return [a, b];
    }
  }
}

export function tirer110(variante: Variante110): Exercice110 {
  if (variante === "calcul") {
    const contexte = parmi<Contexte110>(["gain", "pannes", "buts"]);
    return { variante, contexte, loi: loiCalcul(contexte) };
  }
  const plusRisque = parmi<"A" | "B">(["A", "B"]);
  const [x, y] = paireRisque();
  const xPlus = v10000(x) > v10000(y);
  const [loi, loiB] = (plusRisque === "A") === xPlus ? [x, y] : [y, x];
  return { variante, contexte: "gain", loi, loiB, plusRisque };
}
