/**
 * Couche A (5e) — famille "Population" (5gen23). f(x)=a/(x+p)+b, affiché développé au numérateur
 * — bx+(a+bp) sur (x+p). b = limite/AH = population à terme. Le signe de a détermine croissance/
 * régression via f(0)−b=a/p (JAMAIS le signe de a seul — piège documenté). N'importe jamais rien de
 * `moteur5e/`.
 */
import type { ContextePopulation, ExercicePopulation, OptionInterpretation } from "../../core5e/limitesContexte.types";
import { CONTEXTES_POPULATION } from "./contextesPopulation";
import { capitaliser, entierAleatoire, entierNonNul, melanger, tirerElement } from "./utils";

function arrondiDeux(valeur: number): number {
  return Math.round(valeur * 100) / 100;
}

/** Textes SANS pronom ("elle"/"il") ni adjectif accordé au genre de `ctx.grandeurArticle` (mixte
 * selon le contexte tiré) — uniquement des prédicats invariants ("est en régression", "passant
 * progressivement", "finira", "dépassera") pour rester grammaticalement corrects quel que soit le
 * contexte, sans jamais calculer d'accord à l'exécution. */
function optionsInterpretation(a: number, b: number, p: number, ctx: ContextePopulation): OptionInterpretation[] {
  const f0 = arrondiDeux(a / p + b);
  const unite = ctx.unitePourValeur;
  const Grandeur = capitaliser(ctx.grandeurArticle);
  const regression = a > 0; // f(0)-b = a/p, signe de a/p = signe de a (p>0 toujours)
  if (regression) {
    return melanger([
      { texte: `${Grandeur} est en régression, passant progressivement de ${f0} à ${b} ${unite}.`, correcte: true },
      { texte: `${Grandeur} est en croissance, car a est positif.`, correcte: false },
      { texte: `${Grandeur} est en croissance, passant progressivement vers ${b} ${unite}.`, correcte: false },
      { texte: `${Grandeur} est en régression et finira par s'annuler complètement.`, correcte: false },
    ]);
  }
  return melanger([
    { texte: `${Grandeur} est en croissance, passant progressivement de ${f0} à ${b} ${unite}.`, correcte: true },
    { texte: `${Grandeur} est en régression, car a est négatif.`, correcte: false },
    { texte: `${Grandeur} est en régression, passant progressivement vers ${b} ${unite}.`, correcte: false },
    { texte: `${Grandeur} est en croissance, mais dépassera indéfiniment ${b} ${unite}.`, correcte: false },
  ]);
}

export function genererExercicePopulation(): ExercicePopulation {
  const a = entierNonNul(-10, 10);
  const b = entierAleatoire(1, 50);
  const p = entierAleatoire(1, 10);
  const anneeRef = entierAleatoire(1990, 2020);
  const anneeEval = anneeRef + entierAleatoire(5, 30);
  const seuil = Math.max(1, b + entierAleatoire(-10, 10));
  const contexte = tirerElement(CONTEXTES_POPULATION);
  return { famille: "population", a, b, p, anneeRef, anneeEval, seuil, optionsInterpretation: optionsInterpretation(a, b, p, contexte), contexte };
}
