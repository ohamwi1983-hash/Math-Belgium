/**
 * Couche A (5e) — famille "Prix de revient" (5gen23). Cᵤ(x)=b+a/x, x≥seuil. N'importe jamais rien
 * de `moteur5e/`.
 */
import type { ContextePrixRevient, ExercicePrixRevient, OptionInterpretation } from "../../core5e/limitesContexte.types";
import { CONTEXTES_PRIX_REVIENT } from "./contextesPrixRevient";
import { entierAleatoire, melanger, tirerElement } from "./utils";

/** Une des deux formulations (courte ou longue), au hasard : la longueur d'une option ne trahit
 * jamais la bonne réponse (audit 5c4b, point 15 — la bonne était toujours la plus longue). */
function variante(courte: string, longue: string): string {
  return Math.random() < 0.5 ? courte : longue;
}

/** Quatre options de MÊME structure (verbe + valeur citée + issue), toutes chiffrées : la bonne ne
 * se devine ni à sa longueur ni au fait d'être la seule à citer un nombre (audit 5c4b, point 15). */
function optionsInterpretation(b: number, a: number): OptionInterpretation[] {
  return melanger([
    { texte: variante(`Le coût unitaire diminue et se rapproche de ${b} € sans jamais l'atteindre.`, `Le coût unitaire diminue quand x grandit et se rapproche de ${b} € sans jamais l'atteindre.`), correcte: true },
    { texte: variante(`Le coût unitaire augmente et se rapproche de ${b} € sans jamais l'atteindre.`, `Le coût unitaire augmente quand x grandit et se rapproche de ${b} € sans jamais l'atteindre.`), correcte: false },
    { texte: variante(`Le coût unitaire diminue et finit par valoir exactement ${b} €.`, `Le coût unitaire diminue quand x grandit et finit par valoir exactement ${b} € pour une grosse commande.`), correcte: false },
    { texte: variante(`Le coût unitaire diminue et se rapproche de ${a} € sans jamais l'atteindre.`, `Le coût unitaire diminue quand x grandit et se rapproche de ${a} € sans jamais l'atteindre.`), correcte: false },
  ]);
}

function optionsVASens(seuil: number, a: number, b: number, ctx: ContextePrixRevient): OptionInterpretation[] {
  return melanger([
    {
      texte: variante(
        `Non : la commande minimale est de ${seuil} ${ctx.unitePluriel}, donc x = 0 est hors du domaine réel.`,
        `Non : la commande minimale est de ${seuil} ${ctx.unitePluriel}, donc la valeur x = 0 n'appartient pas au domaine réel.`,
      ),
      correcte: true,
    },
    {
      texte: variante(
        `Oui : on peut commander 0 ${ctx.uniteSingulier} et payer seulement le coût fixe de ${a} €.`,
        `Oui : on peut commander 0 ${ctx.uniteSingulier}, on paie alors seulement le coût fixe de ${a} €, donc x = 0 a un sens.`,
      ),
      correcte: false,
    },
    {
      texte: variante(
        `Non : en x = 0, le coût unitaire vaudrait ${b} €, ce qui est impossible.`,
        `Non : en x = 0, le coût unitaire vaudrait exactement ${b} €, ce qui est impossible dans ce contexte.`,
      ),
      correcte: false,
    },
    {
      texte: variante(
        `Oui : la commande minimale de ${seuil} ${ctx.unitePluriel} n'empêche pas de calculer Cᵤ(0).`,
        `Oui : la commande minimale de ${seuil} ${ctx.unitePluriel} n'est qu'indicative, elle n'empêche pas de calculer Cᵤ(0).`,
      ),
      correcte: false,
    },
  ]);
}

export function genererExercicePrixRevient(): ExercicePrixRevient {
  const a = entierAleatoire(200, 2000);
  const b = entierAleatoire(5, 50);
  const seuil = entierAleatoire(10, 100);
  const contexte = tirerElement(CONTEXTES_PRIX_REVIENT);
  return { famille: "prixRevient", a, b, seuil, optionsInterpretation: optionsInterpretation(b, a), optionsVASens: optionsVASens(seuil, a, b, contexte), contexte };
}
