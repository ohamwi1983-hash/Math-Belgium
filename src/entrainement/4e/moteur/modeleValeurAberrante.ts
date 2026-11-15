import type { ContexteAberrant, ExerciceValeurAberrante } from "../core/valeurAberrante.types";

/**
 * Modèle de gen110 (« Moyenne ou médiane ? La valeur aberrante ») : contextes et indicateurs.
 *
 * Médiane = RÈGLE DU SEUIL du chapitre (section « Médiane, quartiles et mode », atelier
 * `valeur-aberrante-widget`) : la première valeur, dans l'ordre croissant, dont le rang dépasse
 * STRICTEMENT n/2, c'est-à-dire la valeur de rang ⌊n/2⌋ + 1. Le générateur garantit que, dans la
 * série d'effectif PAIR (la série complète ou la série sans la valeur la plus éloignée), les deux
 * valeurs centrales sont égales : la règle du seuil et la convention « moyenne des deux valeurs
 * centrales » donnent alors la même médiane — aucun élève n'est pénalisé pour sa convention.
 */

export type Sens = "haut" | "bas";

export interface Plage {
  min: number;
  max: number;
  pas: number;
}

export interface ContexteDef {
  id: ContexteAberrant;
  /** Libellé du catalogue (sélecteur, page de conception). */
  label: string;
  /** La valeur la plus éloignée est la plus GRANDE (`haut`) ou la plus PETITE (`bas`). */
  sens: Sens;
  n: [number, number];
  /** Valeurs habituelles (série avec valeur extrême : toutes sauf une). */
  normal: Plage;
  /** La valeur extrême (verdict « médiane »). */
  extreme: Plage;
  /** Toutes les valeurs (verdict « les deux se valent ») : aucune valeur isolée. */
  sansExtreme: Plage;
  /** Unité affichée après chaque valeur et chaque champ (« /20 » collé au nombre pour une note). */
  unite: string;
  /** Unité d'un ÉCART entre deux valeurs, si elle diffère (notes : « points »). */
  uniteEcart?: string;
  /** Unité du titre de la liste (« en € »). */
  uniteListe: string;
  /** Récit de l'énoncé (identique pour les deux verdicts). */
  recit: (n: number, prenom: string) => string;
  /** Question de l'écran c, sans la liste des choix. */
  question: (prenom: string) => string;
  /** Ce qu'est la valeur extrême, verdict « médiane » seulement (explication, corrigé). */
  cause: string;
  /** Ce que décrit l'indicateur choisi (« le salaire habituel »). */
  objet: string;
}

export const CONTEXTES: ContexteDef[] = [
  {
    id: "salaires",
    label: "Salaires d'une petite entreprise (gérante comprise)",
    sens: "haut",
    n: [7, 9],
    normal: { min: 1850, max: 2750, pas: 50 },
    extreme: { min: 6500, max: 12000, pas: 500 },
    sansExtreme: { min: 1850, max: 3100, pas: 50 },
    unite: "€",
    uniteListe: "en €",
    recit: (n) => `Voici les salaires mensuels nets des ${n} personnes qui travaillent dans une petite entreprise, gérante comprise.`,
    question: () => "Pour décrire le salaire habituel d'une personne de cette entreprise, quel indicateur est le plus représentatif ?",
    cause: "le salaire de la gérante",
    objet: "le salaire habituel",
  },
  {
    id: "trajet",
    label: "Temps de trajet domicile-école",
    sens: "haut",
    n: [9, 11],
    normal: { min: 14, max: 29, pas: 1 },
    extreme: { min: 65, max: 110, pas: 5 },
    sansExtreme: { min: 14, max: 32, pas: 1 },
    unite: "min",
    uniteListe: "en minutes",
    recit: (n, prenom) => `${prenom} a noté la durée de son trajet entre la maison et l'école pendant ${n} jours d'école.`,
    question: (prenom) => `Pour donner la durée habituelle du trajet de ${prenom}, quel indicateur est le plus représentatif ?`,
    cause: "un jour de grève des bus",
    objet: "la durée habituelle du trajet",
  },
  {
    id: "immobilier",
    label: "Prix des maisons vendues dans un village",
    sens: "haut",
    n: [7, 9],
    normal: { min: 185000, max: 325000, pas: 5000 },
    extreme: { min: 1500000, max: 3200000, pas: 100000 },
    sansExtreme: { min: 185000, max: 360000, pas: 5000 },
    unite: "€",
    uniteListe: "en €",
    recit: (n) => `Voici les prix de vente des ${n} maisons vendues cette année dans un petit village.`,
    question: () => "Pour annoncer le prix habituel d'une maison dans ce village, quel indicateur est le plus représentatif ?",
    cause: "un château",
    objet: "le prix habituel d'une maison",
  },
  {
    id: "basket",
    label: "Points marqués par match au basket",
    sens: "haut",
    n: [8, 10],
    normal: { min: 9, max: 24, pas: 1 },
    extreme: { min: 44, max: 58, pas: 1 },
    sansExtreme: { min: 9, max: 27, pas: 1 },
    unite: "points",
    uniteListe: "en points",
    recit: (n, prenom) => `Voici les points marqués par ${prenom} lors de ses ${n} derniers matchs de basket.`,
    question: (prenom) => `Pour décrire le nombre de points que ${prenom} marque habituellement par match, quel indicateur est le plus représentatif ?`,
    cause: "un match exceptionnel",
    objet: "le nombre habituel de points par match",
  },
  {
    id: "notes",
    label: "Notes d'un élève sur un trimestre",
    sens: "bas",
    n: [8, 10],
    normal: { min: 10, max: 17, pas: 1 },
    extreme: { min: 0, max: 2, pas: 1 },
    sansExtreme: { min: 8, max: 17, pas: 1 },
    unite: "/20",
    uniteEcart: "points",
    uniteListe: "sur 20",
    recit: (n, prenom) => `Voici les notes de ${prenom} aux ${n} interrogations du trimestre.`,
    question: (prenom) => `Pour résumer le niveau habituel de ${prenom} ce trimestre, quel indicateur est le plus représentatif ?`,
    cause: "une copie presque blanche",
    objet: "le niveau habituel",
  },
  {
    id: "livraison",
    label: "Délais de livraison d'un site de vente",
    sens: "haut",
    n: [9, 11],
    normal: { min: 2, max: 7, pas: 1 },
    extreme: { min: 24, max: 40, pas: 1 },
    sansExtreme: { min: 2, max: 9, pas: 1 },
    unite: "jours",
    uniteListe: "en jours",
    recit: (n) => `Un site de vente en ligne a relevé le délai de livraison de ${n} commandes.`,
    question: () => "Pour annoncer le délai de livraison habituel de ce site, quel indicateur est le plus représentatif ?",
    cause: "un colis égaré puis retrouvé",
    objet: "le délai habituel",
  },
];

export function contexteDef(e: Pick<ExerciceValeurAberrante, "contexte">): ContexteDef {
  return CONTEXTES.find((c) => c.id === e.contexte)!;
}

// ---------------------------------------------------------------------------------------------
// Indicateurs
// ---------------------------------------------------------------------------------------------

export function arrondi9(x: number): number {
  const r = Math.round(x * 1e9) / 1e9;
  return r === 0 ? 0 : r;
}

export function trier(valeurs: readonly number[]): number[] {
  return [...valeurs].sort((a, b) => a - b);
}

export function somme(valeurs: readonly number[]): number {
  return arrondi9(valeurs.reduce((s, v) => s + v, 0));
}

export function moyenne(valeurs: readonly number[]): number {
  return arrondi9(somme(valeurs) / valeurs.length);
}

/** Rang (1, 2, …) de la médiane par la règle du seuil : ⌊n/2⌋ + 1. */
export function rangMediane(n: number): number {
  return Math.floor(n / 2) + 1;
}

export function mediane(valeurs: readonly number[]): number {
  return trier(valeurs)[rangMediane(valeurs.length) - 1]!;
}

/** Les deux valeurs centrales d'une série d'effectif pair sont-elles égales (ou n impair) ? */
export function medianeSansAmbiguite(valeurs: readonly number[]): boolean {
  const n = valeurs.length;
  if (n % 2 === 1) return true;
  const t = trier(valeurs);
  return t[n / 2 - 1] === t[n / 2];
}

/** Nombre de décimales d'un décimal (après arrondi à 1e-9). */
export function decimales(x: number): number {
  const s = arrondi9(x).toFixed(9).replace(/0+$/, "");
  const i = s.indexOf(".");
  return i < 0 || i === s.length - 1 ? 0 : s.length - i - 1;
}

/** La valeur retirée à l'écran b : la plus grande (sens `haut`) ou la plus petite (sens `bas`). */
export function valeurRetiree(e: ExerciceValeurAberrante): number {
  const t = trier(e.valeurs);
  return contexteDef(e).sens === "haut" ? t[t.length - 1]! : t[0]!;
}

/** Les valeurs sans la valeur retirée (une seule occurrence, toujours unique par construction). */
export function valeursRestantes(e: ExerciceValeurAberrante): number[] {
  const v = valeurRetiree(e);
  const i = e.valeurs.indexOf(v);
  return [...e.valeurs.slice(0, i), ...e.valeurs.slice(i + 1)];
}

export interface Indicateurs {
  n: number;
  somme: number;
  moyenne: number;
  mediane: number;
  rang: number;
  triees: number[];
}

export function indicateurs(valeurs: readonly number[]): Indicateurs {
  return { n: valeurs.length, somme: somme(valeurs), moyenne: moyenne(valeurs), mediane: mediane(valeurs), rang: rangMediane(valeurs.length), triees: trier(valeurs) };
}

export function indicateursComplets(e: ExerciceValeurAberrante): Indicateurs {
  return indicateurs(e.valeurs);
}

export function indicateursSansExtreme(e: ExerciceValeurAberrante): Indicateurs {
  return indicateurs(valeursRestantes(e));
}
