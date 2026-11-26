import { evaluerExpressionGenerale } from "../../5e-4h/moteur/expressionGenerale";
import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";

/**
 * Lecture des saisies des nouvelles variantes 5e (6h) (chantier D) — jamais de blocage de frappe :
 * on lit ce qui a été tapé, `null` = illisible (l'écran le dit sans consommer de tentative).
 * Acceptés : virgule ou point décimal, espaces de milliers (« 1 234 »), « − – — », fractions
 * (« 3/2 »), racines (« √5 », « sqrt(5) », « racine(5) »), puissances, π ; un préfixe « q = »,
 * « u₁ = », « A ≈ » (tout ce qui précède le dernier « = » ou « ≈ ») ; une unité finale
 * (cm, cm², m, km, €, unités, triangles, côtés, habitants…).
 */

const UNITES = /\s*(cm²|cm2|m²|m2|cm|mm|km|m|€|euros?|unités?|triangles?|côtés?|segments?|habitants?|millions?|ans?|années?)\s*$/i;

export function nettoyer56(texte: string): string {
  let t = texte.trim();
  const i = Math.max(t.lastIndexOf("="), t.lastIndexOf("≈"));
  if (i >= 0) t = t.slice(i + 1);
  t = t.replace(UNITES, "");
  t = t.replace(/[−–—]/g, "-");
  t = t.replace(/(\d)[\s  ]+(?=\d)/g, "$1");
  return t.trim();
}

export function lireNombre56(texte: string): number | null {
  const t = nettoyer56(texte);
  if (t === "") return null;
  const direct = Number(t.replace(",", "."));
  if (/^[-+]?\d+([.,]\d+)?$/.test(t) && Number.isFinite(direct)) return direct;
  try {
    const v = evaluerExpressionGenerale(t.replace(/,/g, "."), 0);
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

/** Liste « 2 ; −2 », « 2 et −2 », « 2 ou −2 » (ordre libre). `null` si un morceau est illisible. */
export function lireListe56(texte: string): number[] | null {
  const morceaux = texte
    .split(/;|\bet\b|\bou\b/)
    .map((m) => m.trim())
    .filter((m) => m !== "");
  if (morceaux.length === 0) return null;
  const valeurs = morceaux.map(lireNombre56);
  return valeurs.some((v) => v === null) ? null : (valeurs as number[]);
}

export function proche(a: number, b: number, tolRel = 1e-9): boolean {
  return Math.abs(a - b) <= tolRel * Math.max(1, Math.abs(b));
}

/** Nombre attendu (exact à 1e-9 relatif, ou dans [min ; max] si une plage est donnée). */
export function statutNombre56(texte: string, cible: number, plage?: [number, number]): StatutVerification {
  const v = lireNombre56(texte);
  if (v === null) return "parse_error";
  if (plage) return v >= plage[0] - 1e-12 && v <= plage[1] + 1e-12 ? "correct" : "not_equivalent";
  return proche(v, cible) ? "correct" : "not_equivalent";
}

/** Liste attendue (ensemble : ordre libre, sans doublon compté deux fois). */
export function statutListe56(texte: string, cibles: number[]): StatutVerification {
  const v = lireListe56(texte);
  if (v === null) return "parse_error";
  if (v.length !== cibles.length) return "not_equivalent";
  const restants = [...cibles];
  for (const x of v) {
    const k = restants.findIndex((c) => proche(x, c));
    if (k < 0) return "not_equivalent";
    restants.splice(k, 1);
  }
  return "correct";
}

/** Saisie DÉCIMALE (chiffres seulement) proche d'une valeur exacte non décimale — à refuser sans
 * tentative quand la forme exacte est demandée. */
export function estDecimaleApprochee56(texte: string, cible: number): boolean {
  const t = nettoyer56(texte);
  if (!/^[-+]?\d+[.,]\d+$/.test(t)) return false;
  const v = Number(t.replace(",", "."));
  return !proche(v, cible) && Math.abs(v - cible) <= 0.01 * Math.max(1, Math.abs(cible));
}

/** Nombre écrit à la française pour KaTeX (virgule `{,}`, milliers `\,`), au plus `dec` décimales. */
export function nbL(x: number, dec = 2): string {
  const arrondi = Number(x.toFixed(dec));
  const [ent, frac] = Math.abs(arrondi).toString().split(".");
  const groupe = ent.length > 4 ? ent.replace(/\B(?=(\d{3})+(?!\d))/g, "\\,") : ent;
  return `${arrondi < 0 ? "-" : ""}${groupe}${frac ? "{,}" + frac : ""}`;
}

/** Même nombre en texte (virgule, espace fine insécable des milliers, « − »). */
export function nbT(x: number, dec = 2): string {
  const arrondi = Number(x.toFixed(dec));
  const [ent, frac] = Math.abs(arrondi).toString().split(".");
  const groupe = ent.length > 4 ? ent.replace(/\B(?=(\d{3})+(?!\d))/g, " ") : ent;
  return `${arrondi < 0 ? "−" : ""}${groupe}${frac ? "," + frac : ""}`;
}

export function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/** Fraction p/q réduite en LaTeX (`\dfrac`), entier si q = 1, signe devant. */
export function fracL(p: number, q: number): string {
  if (q < 0) [p, q] = [-p, -q];
  const g = pgcd(p, q);
  p /= g;
  q /= g;
  if (q === 1) return `${p}`;
  return `${p < 0 ? "-" : ""}\\dfrac{${Math.abs(p)}}{${q}}`;
}

export function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function choisir<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)];
}
