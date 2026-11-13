import type { ConversionAngle, OptionReponse, Precision } from "../../core/texteTriangle.types";
import { arrondir, rad, tronquer } from "../../moteur/modeleTexteTriangle";

/**
 * Outils du générateur de gen77. Tout le hasard passe par `Math.random` : `genererAvecCode`
 * (`export/codeExercice.ts`) le remplace par une graine, et le QR code d'une feuille rouvre ainsi le
 * MÊME exercice.
 */

export function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function choisir<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)]!;
}

export function melanger<T>(liste: readonly T[]): T[] {
  const copie = [...liste];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j]!, copie[i]!];
  }
  return copie;
}

/** Nombre en texte, virgule décimale, sans bruit flottant. */
export function fr(valeur: number): string {
  return String(Number(valeur.toFixed(10))).replace(".", ",");
}

/** Nombre arrondi à la précision demandée, avec ses décimales (« 23,0 »). */
export function frArrondi(valeur: number, decimales: number): string {
  if (decimales <= 0) return String(arrondir(valeur, decimales));
  return arrondir(valeur, decimales).toFixed(decimales).replace(".", ",");
}

/** Direction d'un cap (degrés depuis le nord, sens horaire) : nord = +y, est = +x. */
export function direction(cap: number): { x: number; y: number } {
  return { x: Math.sin(rad(cap)), y: Math.cos(rad(cap)) };
}

export function normaliserCap(cap: number): number {
  return ((cap % 360) + 360) % 360;
}

/** Écart entre deux caps : différence, ou 360° − différence si l'on passe par le nord. */
export function ecartCaps(cap1: number, cap2: number): { ecart: number; nord: boolean; max: number; min: number } {
  const max = Math.max(cap1, cap2);
  const min = Math.min(cap1, cap2);
  const diff = max - min;
  return diff > 180 ? { ecart: 360 - diff, nord: true, max, min } : { ecart: diff, nord: false, max, min };
}

/** Calcul de l'écart en LaTeX, sans le résultat. */
export function ecartLatex(cap1: number, cap2: number): string {
  const { nord, max, min } = ecartCaps(cap1, cap2);
  return nord ? `360^\\circ - (${max}^\\circ - ${min}^\\circ)` : `${max}^\\circ - ${min}^\\circ`;
}

/** Cap « lisible » : à plus de 14° d'un point cardinal (une visée presque plein nord se confondrait
 * avec la flèche du nord sur la figure, et un cap cardinal rendrait l'écart trop direct). */
export function capLisible(c: number): boolean {
  const r = c % 90;
  return r > 14 && r < 76;
}

export function capAuHasard(): number {
  for (;;) {
    const c = entier(15, 345);
    if (capLisible(c)) return c;
  }
}

/** Angle d'un triangle « confortable » : ni trop petit, ni trop proche de 90° (Pythagore
 * déguisé) ni de 180°. */
export function angleConfortable(angle: number): boolean {
  return angle >= 30 && angle <= 150 && Math.abs(angle - 90) > 6;
}

export function conversion(latex: string, valeur: number, type: ConversionAngle["type"], calculLatex: string, justification: string, detailLatex?: string): ConversionAngle {
  return { latex, valeur, type, calculLatex, justification, ...(detailLatex ? { detailLatex } : {}) };
}

/** Phrase-réponse : texte avant et après « valeur unité ». */
export interface Phrase {
  avant: string;
  apres: string;
}

export function phrase(p: Phrase, valeur: string, unite: string): string {
  return `${p.avant}${valeur} ${unite}${p.apres}`;
}

/**
 * Options de l'écran 5 (phrase-réponse) : la bonne (valeur arrondie comme demandé, bonne unité),
 * le résultat d'une erreur de conversion ou de méthode (premier piège dont l'arrondi diffère), une
 * mauvaise unité, et un mauvais arrondi (troncature si elle diffère de l'arrondi, sinon précision
 * plus grossière, sinon trop de décimales). Ordre mélangé, fixé pour l'instance.
 */
export function optionsReponse(valeur: number, pieges: number[], unite: string, uniteFautive: string, precision: Precision, p: Phrase): OptionReponse[] {
  const d = precision.decimales;
  const juste = frArrondi(valeur, d);
  const textes: { texte: string; correcte: boolean }[] = [{ texte: phrase(p, juste, unite), correcte: true }];
  const piege = pieges.find((x) => x > 0 && Number.isFinite(x) && frArrondi(x, d) !== juste);
  if (piege !== undefined) textes.push({ texte: phrase(p, frArrondi(piege, d), unite), correcte: false });
  textes.push({ texte: phrase(p, juste, uniteFautive), correcte: false });
  const tronque = d >= 0 ? tronquer(valeur, d) : null;
  let mauvaisArrondi: string;
  if (tronque !== null && frArrondi(tronque, d) !== juste) mauvaisArrondi = frArrondi(tronque, d);
  else if (frArrondi(valeur, d - 1) !== juste) mauvaisArrondi = frArrondi(valeur, d - 1);
  else mauvaisArrondi = frArrondi(valeur, d + 2);
  textes.push({ texte: phrase(p, mauvaisArrondi, unite), correcte: false });
  const uniques = textes.filter((t, i) => textes.findIndex((u) => u.texte === t.texte) === i);
  return melanger(uniques);
}
