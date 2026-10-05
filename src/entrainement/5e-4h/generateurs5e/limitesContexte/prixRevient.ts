/**
 * Couche A (5e) — famille "Prix de revient" (5gen23). Cᵤ(x)=b+a/x, x≥seuil. N'importe jamais rien
 * de `moteur5e/`.
 */
import type { ContextePrixRevient, ExercicePrixRevient, OptionInterpretation } from "../../core5e/limitesContexte.types";
import { CONTEXTES_PRIX_REVIENT } from "./contextesPrixRevient";
import { entierAleatoire, melanger, tirerElement } from "./utils";

function optionsInterpretation(b: number, a: number): OptionInterpretation[] {
  return melanger([
    { texte: `Le coût unitaire tend vers ${b} €, en diminuant, sans jamais l'atteindre.`, correcte: true },
    { texte: `Le coût unitaire tend vers ${b} €, en augmentant, sans jamais l'atteindre.`, correcte: false },
    { texte: `Le coût unitaire atteint exactement ${b} € à partir d'un certain nombre d'exemplaires.`, correcte: false },
    { texte: `Le coût unitaire tend vers ${a} €, en diminuant.`, correcte: false },
  ]);
}

function optionsVASens(seuil: number, ctx: ContextePrixRevient): OptionInterpretation[] {
  return melanger([
    { texte: `Non, car le domaine réel de validité est x≥${seuil} : x=0 n'appartient jamais à ce domaine.`, correcte: true },
    { texte: `Oui, ${ctx.sujetGenerique} peut ${ctx.verbeInfinitif} 0 ${ctx.uniteSingulier} sans aucun coût.`, correcte: false },
    { texte: `Non, car un coût ne peut jamais être négatif.`, correcte: false },
    { texte: `Oui, car la fonction Cᵤ(x) est continue en x=0.`, correcte: false },
  ]);
}

export function genererExercicePrixRevient(): ExercicePrixRevient {
  const a = entierAleatoire(200, 2000);
  const b = entierAleatoire(5, 50);
  const seuil = entierAleatoire(10, 100);
  const contexte = tirerElement(CONTEXTES_PRIX_REVIENT);
  return { famille: "prixRevient", a, b, seuil, optionsInterpretation: optionsInterpretation(b, a), optionsVASens: optionsVASens(seuil, contexte), contexte };
}
