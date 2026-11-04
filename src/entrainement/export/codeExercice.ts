/**
 * Code d'exercice reproductible — imprimé (avec un QR code) à côté de chaque exercice d'une
 * feuille, il rouvre LE MÊME exercice dans le générateur interactif
 * (`/entrainement/{chantier}/{id}?code=XXXXXX`), avec ses aides et sa vérification automatique.
 *
 * Principe : la feuille ET l'appli tirent l'instance sous `avecGraine(graine, …)`, qui remplace
 * temporairement `Math.random` par un générateur pseudo-aléatoire déterministe (mulberry32) — tant
 * que le tirage de l'instance n'utilise que `Math.random` (c'est le cas de tous les générateurs du
 * site), la même graine redonne exactement la même instance, sans toucher au code des générateurs.
 *
 * Format : 6 caractères de l'alphabet de Crockford (sans I, L, O, U), soit 30 bits —
 * 24 bits de graine et 6 bits d'indice de variante (`0` = tirage libre, `n` = n-ième entrée de
 * `catalogueVariantes`, 1-indexée).
 */

const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const BITS_VARIANTE = 6;
const MAX_VARIANTE = (1 << BITS_VARIANTE) - 1;
const MAX_GRAINE = (1 << 24) - 1;

export interface CodeExerciceDecode {
  graine: number;
  /** Indice 0-based dans `catalogueVariantes`, ou `null` pour un tirage libre. */
  varianteIndex: number | null;
}

export function tirerGraine(): number {
  return Math.floor(Math.random() * MAX_GRAINE) + 1;
}

export function encoderCode(graine: number, varianteIndex: number | null): string {
  const v = varianteIndex === null ? 0 : Math.min(varianteIndex + 1, MAX_VARIANTE);
  let valeur = ((graine & MAX_GRAINE) * (1 << BITS_VARIANTE)) + v;
  let code = "";
  for (let i = 0; i < 6; i++) {
    code = ALPHABET[valeur % 32] + code;
    valeur = Math.floor(valeur / 32);
  }
  return code;
}

export function decoderCode(code: string): CodeExerciceDecode | null {
  const propre = code.trim().toUpperCase().replace(/O/g, "0").replace(/[IL]/g, "1");
  if (!/^[0-9A-HJKMNP-TV-Z]{6}$/.test(propre)) return null;
  let valeur = 0;
  for (const c of propre) valeur = valeur * 32 + ALPHABET.indexOf(c);
  const v = valeur % (1 << BITS_VARIANTE);
  const graine = Math.floor(valeur / (1 << BITS_VARIANTE));
  if (graine === 0) return null;
  return { graine, varianteIndex: v === 0 ? null : v - 1 };
}

function mulberry32(graine: number): () => number {
  let a = graine >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Exécute `fn` avec un `Math.random` déterministe dérivé de `graine`, puis restaure l'original
 * (même si `fn` lève une exception). */
export function avecGraine<T>(graine: number, fn: () => T): T {
  const original = Math.random;
  Math.random = mulberry32(graine);
  try {
    return fn();
  } finally {
    Math.random = original;
  }
}

/** Code présent dans l'URL courante (`?code=XXXXXX`), décodé — `null` s'il est absent ou invalide. */
export function lireCodeDepuisUrl(): CodeExerciceDecode | null {
  if (typeof window === "undefined") return null;
  const brut = new URLSearchParams(window.location.search).get("code");
  return brut ? decoderCode(brut) : null;
}

/** Instance reproductible d'un générateur : tirage libre ou variante forcée, sous la graine. Les
 * applis interactives l'appellent avec la MÊME fonction de génération que leur adaptateur
 * d'export, pour retrouver exactement l'exercice imprimé. */
export function genererAvecCode<T>(
  code: CodeExerciceDecode,
  catalogue: { id: string }[] | undefined,
  genererLibre: () => T,
  genererVariante: ((varianteId: string) => T) | undefined,
): T {
  const variante = code.varianteIndex !== null && catalogue ? catalogue[code.varianteIndex] : undefined;
  return avecGraine(code.graine, () => (variante && genererVariante ? genererVariante(variante.id) : genererLibre()));
}
