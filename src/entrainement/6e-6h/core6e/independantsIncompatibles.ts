import type { Q } from "../ui6e/nombresExp";
import { q, qMul, qVal } from "../ui6e/nombresExp";

/**
 * Couche core — `6gen160` « Indépendants ou incompatibles ? » (6e ch. 6, § 3 — rappel du § 1,
 * processus 2 APPLIQUER). Deux événements A et B donnés sous quatre formes (variantes) ; l'élève
 * calcule ce qu'il faut puis décide : indépendants / incompatibles / ni l'un ni l'autre. Le verdict
 * est tiré au tiers AVANT les nombres ; P(A) et P(B) sont toujours non nulles (sinon A et B
 * seraient à la fois incompatibles et indépendants — cas écarté, dit dans le corrigé).
 * - `venn`     : diagramme de Venn des effectifs (quatre régions) ;
 * - `tableau`  : tableau à double entrée des effectifs, marges comprises ;
 * - `valeurs`  : P(A), P(B) et P(A ∩ B) — ou P(A ∪ B) (`donnee: "union"`, un écran de plus) ;
 * - `contexte` : dé, urne de boules numérotées ou jeu de cartes, A et B décrits en mots.
 */

export type Verdict160 = "independants" | "incompatibles" | "ni";
export type Variante160 = "venn" | "tableau" | "valeurs" | "contexte";
export const VERDICTS_160: Verdict160[] = ["independants", "incompatibles", "ni"];

export interface Effectifs {
  N: number;
  nA: number;
  nB: number;
  nAB: number;
}

export interface ExVenn160 extends Effectifs {
  variante: "venn";
  verdict: Verdict160;
  ctx: number;
}

export interface ExTableau160 extends Effectifs {
  variante: "tableau";
  verdict: Verdict160;
  ctx: number;
}

export interface ExValeurs160 {
  variante: "valeurs";
  verdict: Verdict160;
  pA: Q;
  pB: Q;
  pAB: Q;
  donnee: "inter" | "union";
  ecriture: "decimal" | "fraction";
}

export type Univers160 = "de" | "urne" | "cartes52" | "cartes32";

export interface ExContexte160 extends Effectifs {
  variante: "contexte";
  verdict: Verdict160;
  univers: Univers160;
  /** Nombre de faces / de boules (dé, urne). */
  n: number;
  evA: string;
  evB: string;
}

export type Exercice160 = ExVenn160 | ExTableau160 | ExValeurs160 | ExContexte160;

/** Contextes neutres des variantes `venn` et `tableau` (rien dans les mots ne dit le verdict). */
export const CONTEXTES_160 = [
  { groupe: "élèves d'une école", un: "un élève", A: "l'élève fait partie de la chorale", B: "l'élève fait partie du club d'échecs", nomA: "chorale", nomB: "échecs" },
  { groupe: "clients d'une librairie", un: "un client", A: "le client a acheté un roman", B: "le client a acheté une bande dessinée", nomA: "roman", nomB: "BD" },
  { groupe: "participants à un stage", un: "un participant", A: "le participant a choisi l'atelier théâtre", B: "le participant a choisi l'atelier photo", nomA: "théâtre", nomB: "photo" },
  { groupe: "personnes interrogées", un: "une personne", A: "la personne possède un chat", B: "la personne possède un chien", nomA: "chat", nomB: "chien" },
  { groupe: "visiteurs d'un salon", un: "un visiteur", A: "le visiteur a assisté à la conférence du matin", B: "le visiteur a assisté à la conférence de l'après-midi", nomA: "matin", nomB: "après-midi" },
  { groupe: "abonnés d'une médiathèque", un: "un abonné", A: "l'abonné a emprunté un film", B: "l'abonné a emprunté un jeu vidéo", nomA: "film", nomB: "jeu vidéo" },
  { groupe: "membres d'un club sportif", un: "un membre", A: "le membre pratique la natation", B: "le membre pratique le tennis", nomA: "natation", nomB: "tennis" },
  { groupe: "élèves de rhéto", un: "un élève", A: "l'élève a choisi l'option latin", B: "l'élève a choisi l'option sciences économiques", nomA: "latin", nomB: "sc. éco." },
] as const;

export interface Probas160 {
  pA: Q;
  pB: Q;
  pAB: Q;
}

export function probas160(e: Exercice160): Probas160 {
  if (e.variante === "valeurs") return { pA: e.pA, pB: e.pB, pAB: e.pAB };
  return { pA: q(e.nA, e.N), pB: q(e.nB, e.N), pAB: q(e.nAB, e.N) };
}

export function produit160(e: Exercice160): Q {
  const p = probas160(e);
  return qMul(p.pA, p.pB);
}

export function pUnion160(e: Exercice160): Q {
  const p = probas160(e);
  return q(p.pA.n * p.pB.d * p.pAB.d + p.pB.n * p.pA.d * p.pAB.d - p.pAB.n * p.pA.d * p.pB.d, p.pA.d * p.pB.d * p.pAB.d);
}

/** Verdict RECALCULÉ depuis les nombres (contrôle du générateur, jamais le champ `verdict` seul). */
export function verdictCalcule(e: Exercice160): Verdict160 {
  const p = probas160(e);
  if (p.pAB.n === 0) return "incompatibles";
  const prod = qMul(p.pA, p.pB);
  return prod.n === p.pAB.n && prod.d === p.pAB.d ? "independants" : "ni";
}

export function aEffectifs(e: Exercice160): e is ExVenn160 | ExTableau160 | ExContexte160 {
  return e.variante !== "valeurs";
}

export const valeurQ = qVal;
