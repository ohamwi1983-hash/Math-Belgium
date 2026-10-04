export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomNonZeroInt(min: number, max: number): number {
  let n = 0;
  while (n === 0) n = randomInt(min, max);
  return n;
}

/** Deux racines entières non nulles, distinctes et non opposées (pour ne pas retomber sur les autres catégories). */
export function racinesDistinctesNonOpposees(min: number, max: number): [number, number] {
  const r1 = randomNonZeroInt(min, max);
  let r2 = randomNonZeroInt(min, max);
  while (r2 === r1 || r2 === -r1) {
    r2 = randomNonZeroInt(min, max);
  }
  return [r1, r2];
}

/**
 * Seconde racine d'un cas_general à racine imposée (générateur "Simplifier") : distincte de
 * imposee, -imposee et 0 (sinon le polynôme chevaucherait mise_en_evidence/binome_conjugue),
 * et distincte de toute valeur explicitement interdite (ex: seconde racine déjà utilisée par
 * l'autre polynôme de la fraction, pour éviter le cas dégénéré décrit dans la spec).
 */
export function autreRacineCasGeneral(imposee: number, interdites: number[], min: number, max: number): number {
  let r = 0;
  const estInterdite = (n: number) => n === imposee || n === -imposee || n === 0 || interdites.includes(n);
  while (r === 0 || estInterdite(r)) {
    r = randomInt(min, max);
  }
  return r;
}

const VALEURS_K = [2, 3, 5, 6, 7, 10] as const;

/** Tire k pour la variante irrationnelle x = √k·y. */
export function tirerK(): number {
  return VALEURS_K[Math.floor(Math.random() * VALEURS_K.length)];
}
