/**
 * Couche A — résolution pure d'un triangle quelconque, partagée entre les générateurs "triangle"
 * du chapitre 3 (loi des sinus, loi des cosinus, aire, problèmes contextualisés — et le futur
 * générateur 6). Toujours en DEGRÉS (convention du chapitre). Chaque fonction produit un
 * `Triangle` COMPLET (3 côtés + 3 angles) — jamais seulement la quantité demandée par tel ou tel
 * écran, pour que la Couche A construise toujours l'objet entier une fois pour toutes (même
 * principe que `exercice.solution` ailleurs dans le projet : les générateurs consommateurs
 * choisissent ensuite quels champs afficher/cacher).
 *
 * **Aucune configuration ambiguë (SSA à 2 solutions) n'est résolue ici** — ce cas est
 * volontairement hors de portée (voir le futur générateur 6, en attente d'une session de
 * conception dédiée) : `resoudreSSAUnique` exige explicitement `a >= b` en précondition, qui
 * garantit par construction une solution unique (voir sa documentation).
 */
import type { Triangle } from "../../core/triangle.types";

function versRadians(degres: number): number {
  return (degres * Math.PI) / 180;
}

function versDegres(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Résout un triangle à partir de ses 3 côtés (SSS) — chaque angle est retrouvé via la loi des
 * cosinus (`acos`, portée [0°,180°], jamais d'ambiguïté contrairement à un `asin`) :
 * `cos(A) = (b²+c²-a²)/(2bc)`, et ses deux permutations pour B et C. Fonction de base réutilisée
 * par `resoudreSAS` (calcule d'abord le 3e côté, puis délègue ici pour les 3 angles).
 */
export function resoudreSSS(a: number, b: number, c: number): Triangle {
  const A = versDegres(Math.acos((b * b + c * c - a * a) / (2 * b * c)));
  const B = versDegres(Math.acos((a * a + c * c - b * b) / (2 * a * c)));
  const C = 180 - A - B;
  return { a, b, c, A, B, C };
}

/**
 * Résout un triangle à partir de deux côtés et de l'angle compris (SAS, loi des cosinus — Al-
 * Kashi) : `a² = b²+c²-2bc·cos(A)` retrouve le 3e côté, puis `resoudreSSS` retrouve les deux
 * autres angles sans jamais passer par une loi des sinus ambiguë.
 */
export function resoudreSAS(b: number, c: number, A: number): Triangle {
  const a = Math.sqrt(b * b + c * c - 2 * b * c * Math.cos(versRadians(A)));
  return resoudreSSS(a, b, c);
}

/**
 * Résout un triangle à partir de deux angles et du côté opposé à l'un d'eux (AAS/ASA, loi des
 * sinus) : les 3 angles sont déjà entièrement connus (`C = 180-A-B`, aucune ambiguïté possible,
 * contrairement à SSA), les deux côtés restants s'en déduisent par un simple rapport
 * `b = a·sin(B)/sin(A)` — jamais d'arcsin nécessaire ici.
 */
export function resoudreAAS(A: number, B: number, a: number): Triangle {
  const C = 180 - A - B;
  const sinA = Math.sin(versRadians(A));
  const b = (a * Math.sin(versRadians(B))) / sinA;
  const c = (a * Math.sin(versRadians(C))) / sinA;
  return { a, b, c, A, B, C };
}

/**
 * Résout une configuration SSA (deux côtés + l'angle opposé à l'un d'eux) GARANTIE NON AMBIGUË :
 * `A` est l'angle connu, `a` le côté opposé, `b` l'autre côté connu — **précondition stricte
 * `a >= b`**, qui garantit `B <= A` (le plus grand côté fait toujours face au plus grand angle),
 * donc `B` est nécessairement aigu (un triangle n'a jamais deux angles >= 90°) et `asin` retrouve
 * la bonne valeur sans ambiguïté, contrairement au cas général SSA (générateur 6, hors de portée
 * ici). Lève si la précondition n'est pas respectée — ne devrait jamais arriver, les générateurs
 * appelants garantissent `a >= b` à la construction.
 */
export function resoudreSSAUnique(a: number, b: number, A: number): Triangle {
  if (a < b) {
    throw new Error("resoudreSSAUnique : précondition a >= b non respectée (configuration potentiellement ambiguë)");
  }
  const B = versDegres(Math.asin((b * Math.sin(versRadians(A))) / a));
  const C = 180 - A - B;
  const sinA = Math.sin(versRadians(A));
  const c = (a * Math.sin(versRadians(C))) / sinA;
  return { a, b, c, A, B, C };
}

/** Aire d'un triangle via deux côtés et l'angle compris — `Aire = ½·a·b·sin(C)` (C entre a et b). */
export function aireTriangle(a: number, b: number, C: number): number {
  return 0.5 * a * b * Math.sin(versRadians(C));
}
