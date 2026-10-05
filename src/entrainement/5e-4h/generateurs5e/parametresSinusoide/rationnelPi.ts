/**
 * Couche A (5e) — arithmétique EXACTE sur des rationnels multipliés par π^k (k ∈ {-1,0,1}), jamais
 * reconstruite depuis un flottant. Module PARTAGÉ entre 5gen8 ("Paramètres d'une fonction
 * sinusoïdale") et 5gen9 (son pendant graphique, `generateurs5e/parametresSinusoideGraphique/`,
 * import générateur→générateur explicitement autorisé par l'architecture) : les deux tirent T/φ de
 * la même façon et doivent afficher exactement la même notation.
 *
 * Pourquoi k reste toujours dans {-1,0,1} ici (jamais besoin d'un degré plus élevé) : T et φ sont
 * générés avec un degré ∈ {0,1} (voir `parametres.ts`) — un nombre "plat" (degré 0) ou un multiple
 * de π (degré 1), jamais les deux à la fois. B = 2π/T et f = 1/T inversent ce degré (0↔-1 pour f,
 * 1↔0 pour B puisque le "2π" du numérateur ajoute +1 avant de soustraire le degré de T). C = -B·φ
 * additionne les degrés de B et φ, qui sont TOUJOURS opposés par construction (B a le degré opposé
 * de T, φ a le MÊME degré que T) — la somme vaut donc toujours exactement 1, jamais 0 ni 2. Aucune
 * opération de cette plateforme ne multiplie jamais deux valeurs de même degré non nul, donc |k|=2
 * n'est structurellement jamais atteint.
 */

export interface RationnelPi {
  /** Signé, peut être 0. */
  numerateur: number;
  /** Toujours > 0. */
  denominateur: number;
  /** valeur = (numerateur/denominateur) × π^degrePi. */
  degrePi: -1 | 0 | 1;
}

export function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/** Réduit numérateur/dénominateur par leur PGCD, sans jamais toucher au degré de π. */
export function reduireRationnelPi(v: RationnelPi): RationnelPi {
  if (v.numerateur === 0) return { numerateur: 0, denominateur: 1, degrePi: v.degrePi };
  const signe = Math.sign(v.numerateur);
  const n = Math.abs(v.numerateur);
  const g = pgcd(n, v.denominateur);
  return { numerateur: signe * (n / g), denominateur: v.denominateur / g, degrePi: v.degrePi };
}

export function valeurNumerique(v: RationnelPi): number {
  return (v.numerateur / v.denominateur) * Math.PI ** v.degrePi;
}

export function negatifRationnelPi(v: RationnelPi): RationnelPi {
  return { numerateur: v.numerateur === 0 ? 0 : -v.numerateur, denominateur: v.denominateur, degrePi: v.degrePi };
}

/** 1/v — v.numerateur doit être non nul (jamais l'inverse de zéro, T/B ne sont jamais nuls). */
export function inverseRationnelPi(v: RationnelPi): RationnelPi {
  const signe = Math.sign(v.numerateur);
  const degrePi = (v.degrePi === 0 ? 0 : -v.degrePi) as -1 | 0 | 1;
  return reduireRationnelPi({ numerateur: signe * v.denominateur, denominateur: signe * v.numerateur, degrePi });
}

/** a×b — n'est jamais appelée sur deux valeurs au degré non nul simultanément sur cette plateforme
 * (voir la preuve en tête de fichier) ; un degré résultant hors de {-1,0,1} lève explicitement
 * plutôt que de produire une valeur silencieusement fausse. */
export function multiplierRationnelPi(a: RationnelPi, b: RationnelPi): RationnelPi {
  const degrePi = a.degrePi + b.degrePi;
  if (degrePi < -1 || degrePi > 1) throw new Error(`multiplierRationnelPi : degré de π hors plage (${degrePi})`);
  return reduireRationnelPi({ numerateur: a.numerateur * b.numerateur, denominateur: a.denominateur * b.denominateur, degrePi: degrePi as -1 | 0 | 1 });
}

export function multiplierParEntier(v: RationnelPi, n: number): RationnelPi {
  return reduireRationnelPi({ numerateur: v.numerateur * n, denominateur: v.denominateur, degrePi: v.degrePi });
}

export function diviserParEntier(v: RationnelPi, n: number): RationnelPi {
  return reduireRationnelPi({ numerateur: v.numerateur, denominateur: v.denominateur * n, degrePi: v.degrePi });
}

/** a+b — n'est jamais appelée sur deux degrés de π différents sur cette plateforme (5gen9 n'additionne
 * que φ et des multiples de T/4, qui partagent TOUJOURS le même degré que T=φ par construction) ;
 * lève explicitement plutôt que de produire une somme silencieusement incohérente sinon. */
export function additionnerRationnelPi(a: RationnelPi, b: RationnelPi): RationnelPi {
  if (a.degrePi !== b.degrePi) throw new Error(`additionnerRationnelPi : degrés de π incompatibles (${a.degrePi} vs ${b.degrePi})`);
  return reduireRationnelPi({ numerateur: a.numerateur * b.denominateur + b.numerateur * a.denominateur, denominateur: a.denominateur * b.denominateur, degrePi: a.degrePi });
}

const DEUX_PI: RationnelPi = { numerateur: 2, denominateur: 1, degrePi: 1 };

/** B = 2π/T. */
export function calculerB(T: RationnelPi): RationnelPi {
  return multiplierRationnelPi(DEUX_PI, inverseRationnelPi(T));
}

/** C = -B×φ (toujours de degré 1, voir la preuve en tête de fichier). */
export function calculerC(B: RationnelPi, phi: RationnelPi): RationnelPi {
  return negatifRationnelPi(multiplierRationnelPi(B, phi));
}

/** f = 1/T. */
export function calculerFrequence(T: RationnelPi): RationnelPi {
  return inverseRationnelPi(T);
}
