import type { KeyboardEvent } from "react";

/**
 * Variante ÉTENDUE de `bloquerSaisieNonNumerique.ts` (générateur 14) — autorise en plus la notation
 * `sqrt(...)` (`s`, `q`, `r`, `t`, parenthèses), pour les 3 champs de saisie libre du générateur
 * "L'un sans l'autre" (promptcreationgenerateur16unsanslautre.md, section "Bloquage numérique
 * étendu") : "Cette extension est propre à ce générateur pour l'instant, ne pas la répercuter sur
 * les autres générateurs de la plateforme" — module SÉPARÉ plutôt qu'une modification du module
 * partagé, jamais réutilisé ailleurs.
 */
const CARACTERE_AUTORISE = /^[0-9\-.,/sqrt()]$/i;

export function gererKeyDownNumeriqueRacine(e: KeyboardEvent<HTMLInputElement>): void {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key.length > 1) return;
  if (!CARACTERE_AUTORISE.test(e.key)) {
    e.preventDefault();
  }
}

export function filtrerSaisieNumeriqueRacine(valeur: string): string {
  return valeur
    .split("")
    .filter((c) => CARACTERE_AUTORISE.test(c))
    .join("");
}
