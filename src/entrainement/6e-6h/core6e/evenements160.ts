import type { Univers160 } from "./independantsIncompatibles";

/**
 * Univers et événements de la variante `contexte` de `6gen160` : dé à n faces, urne de n boules
 * numérotées de 1 à n, jeu de 52 ou de 32 cartes. Chaque événement a une phrase (énoncé, écran,
 * papier), une description de l'ensemble pour le corrigé, et un test sur une issue. Source unique
 * de l'énoncé, de la vérification et du corrigé.
 */

export interface Carte {
  v: number; // 2..14 (11 valet, 12 dame, 13 roi, 14 as)
  s: number; // 0 cœur, 1 carreau, 2 trèfle, 3 pique
}

export type Issue = number | Carte;

const ENSEIGNES = ["cœur", "carreau", "trèfle", "pique"];
const VALEURS: Record<number, string> = { 11: "valet", 12: "dame", 13: "roi", 14: "as" };

export function nomCarte(c: Carte): string {
  return `${VALEURS[c.v] ?? String(c.v)} de ${ENSEIGNES[c.s]}`;
}

export function issues(univers: Univers160, n: number): Issue[] {
  if (univers === "de" || univers === "urne") return Array.from({ length: n }, (_, i) => i + 1);
  const min = univers === "cartes52" ? 2 : 7;
  const out: Carte[] = [];
  for (let s = 0; s < 4; s++) for (let v = min; v <= 14; v++) out.push({ v, s });
  return out;
}

export interface Evenement {
  id: string;
  /** Fin de phrase : « est pair », « est un multiple de 3 », « est un cœur ». */
  attribut: string;
  /** Description de l'ensemble au pluriel (corrigé) : « les cœurs », « les nombres pairs ». */
  pluriel: string;
  test: (x: Issue) => boolean;
}

const estPremier = (k: number) => k >= 2 && [...Array(Math.max(0, Math.floor(Math.sqrt(k)) - 1))].every((_, i) => k % (i + 2) !== 0);

export function evenementsNombres(n: number): Evenement[] {
  const evs: Evenement[] = [
    { id: "pair", attribut: "est pair", pluriel: "les nombres pairs", test: (x) => (x as number) % 2 === 0 },
    { id: "impair", attribut: "est impair", pluriel: "les nombres impairs", test: (x) => (x as number) % 2 === 1 },
    { id: "m3", attribut: "est un multiple de 3", pluriel: "les multiples de 3", test: (x) => (x as number) % 3 === 0 },
    { id: "m4", attribut: "est un multiple de 4", pluriel: "les multiples de 4", test: (x) => (x as number) % 4 === 0 },
    { id: "m5", attribut: "est un multiple de 5", pluriel: "les multiples de 5", test: (x) => (x as number) % 5 === 0 },
    { id: "premier", attribut: "est un nombre premier", pluriel: "les nombres premiers", test: (x) => estPremier(x as number) },
  ];
  const seuils = [...new Set([Math.round(n / 4), Math.round(n / 3), Math.round(n / 2), Math.round((2 * n) / 3), Math.round((3 * n) / 4)])].filter((k) => k >= 2 && k <= n - 2);
  for (const k of seuils) {
    evs.push({ id: `le${k}`, attribut: `est inférieur ou égal à ${k}`, pluriel: `les nombres de 1 à ${k}`, test: (x) => (x as number) <= k });
    evs.push({ id: `gt${k}`, attribut: `est strictement supérieur à ${k}`, pluriel: `les nombres de ${k + 1} à ${n}`, test: (x) => (x as number) > k });
  }
  return evs;
}

export function evenementsCartes(univers: "cartes52" | "cartes32"): Evenement[] {
  const min = univers === "cartes52" ? 2 : 7;
  const c = (x: Issue) => x as Carte;
  return [
    { id: "coeur", attribut: "est un cœur", pluriel: "les cœurs", test: (x) => c(x).s === 0 },
    { id: "carreau", attribut: "est un carreau", pluriel: "les carreaux", test: (x) => c(x).s === 1 },
    { id: "trefle", attribut: "est un trèfle", pluriel: "les trèfles", test: (x) => c(x).s === 2 },
    { id: "pique", attribut: "est un pique", pluriel: "les piques", test: (x) => c(x).s === 3 },
    { id: "rouge", attribut: "est rouge", pluriel: "les cartes rouges (cœurs et carreaux)", test: (x) => c(x).s <= 1 },
    { id: "noire", attribut: "est noire", pluriel: "les cartes noires (trèfles et piques)", test: (x) => c(x).s >= 2 },
    { id: "figure", attribut: "est une figure (valet, dame ou roi)", pluriel: "les figures (valet, dame, roi de chaque enseigne)", test: (x) => c(x).v >= 11 && c(x).v <= 13 },
    { id: "as", attribut: "est un as", pluriel: "les as", test: (x) => c(x).v === 14 },
    { id: "roi", attribut: "est un roi", pluriel: "les rois", test: (x) => c(x).v === 13 },
    { id: "nombre", attribut: `porte un nombre (de ${min} à 10)`, pluriel: `les cartes de ${min} à 10`, test: (x) => c(x).v <= 10 },
  ];
}

export function evenementsUnivers(univers: Univers160, n: number): Evenement[] {
  return univers === "de" || univers === "urne" ? evenementsNombres(n) : evenementsCartes(univers);
}

export function evenementParId(univers: Univers160, n: number, id: string): Evenement {
  const ev = evenementsUnivers(univers, n).find((x) => x.id === id);
  if (!ev) throw new Error(`événement inconnu ${id}`);
  return ev;
}

/** Phrase de l'énoncé : « le résultat est pair », « le numéro tiré est pair », « la carte est un cœur ». */
export function phraseEvenement(univers: Univers160, ev: Evenement): string {
  const sujet = univers === "de" ? "le résultat" : univers === "urne" ? "le numéro tiré" : "la carte";
  return `${sujet} ${ev.attribut}`;
}

export function phraseUnivers(univers: Univers160, n: number): string {
  if (univers === "de") return `On lance un dé équilibré à ${n} faces, numérotées de 1 à ${n}.`;
  if (univers === "urne") return `Une urne contient ${n} boules indiscernables au toucher, numérotées de 1 à ${n}. On tire une boule au hasard.`;
  return `On tire une carte au hasard dans un jeu de ${univers === "cartes52" ? 52 : 32} cartes.`;
}

/** Liste lisible d'un ensemble d'issues (corrigé) : « 2 ; 4 ; 6 » ou « 3 ; 6 ; … ; 30 » ; cartes : noms
 * (au plus quatre), sinon `null` (le corrigé dit alors l'ensemble en mots). */
export function listeIssues(xs: Issue[]): string | null {
  if (xs.length === 0) return null;
  if (typeof xs[0] === "number") {
    const ns = xs as number[];
    if (ns.length <= 8) return ns.join(" ; ");
    return `${ns[0]} ; ${ns[1]} ; ${ns[2]} ; … ; ${ns[ns.length - 1]}`;
  }
  if (xs.length > 4) return null;
  return (xs as Carte[]).map(nomCarte).join(", ");
}
