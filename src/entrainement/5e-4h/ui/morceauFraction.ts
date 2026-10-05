import type { Crochet, Morceau } from "../core/inequation.types";
import { parserNombreOuFraction } from "../moteur/verificationAnalyseFonction";

/**
 * Variante fraction-compatible de `morceauIntervalle.ts` (exercice "tableau de signes") —
 * nécessaire pour "Caractéristiques algébriques d'une fonction de référence" (niveau 1) : les
 * frontières de domaine y sont `-b/a` (rationnels quelconques, ex. `-1/3`), jamais garanties
 * entières par construction comme ailleurs dans le projet. `morceauIntervalle.ts` ne parse que des
 * décimaux (`Number(texte.replace(",","."))`) — insuffisant ici. Même structure/UX exacte, seul le
 * parsing de la valeur change (`parserNombreOuFraction`, déjà utilisé pour ce même besoin ailleurs
 * dans le projet — `x_S`/`y_S`, `AH`/`AV`...). Dupliquée plutôt que généralisée sur place : modifier
 * `morceauIntervalle.ts` directement changerait le comportement de "tableau de signes"/
 * "caractéristiques d'une fonction", jamais souhaité (leurs frontières sont toujours entières,
 * accepter des fractions y serait une fonctionnalité non demandée).
 */
export interface EtatMorceauFraction {
  crochetGauche: Crochet | null;
  borneGaucheMode: "nombre" | "-inf";
  borneGaucheValeur: string;
  crochetDroit: Crochet | null;
  borneDroiteMode: "nombre" | "+inf";
  borneDroiteValeur: string;
}

export function etatMorceauFractionInitial(): EtatMorceauFraction {
  return {
    crochetGauche: null,
    borneGaucheMode: "nombre",
    borneGaucheValeur: "",
    crochetDroit: null,
    borneDroiteMode: "nombre",
    borneDroiteValeur: "",
  };
}

export function toggleCrochetGaucheFraction(actuel: Crochet | null): Crochet {
  if (actuel === null) return "[";
  return actuel === "[" ? "]" : "[";
}

export function toggleCrochetDroitFraction(actuel: Crochet | null): Crochet {
  if (actuel === null) return "]";
  return actuel === "]" ? "[" : "]";
}

export function crochetGaucheVerrouilleFraction(etat: EtatMorceauFraction): boolean {
  return etat.borneGaucheMode === "-inf";
}

export function crochetDroitVerrouilleFraction(etat: EtatMorceauFraction): boolean {
  return etat.borneDroiteMode === "+inf";
}

export function crochetGaucheEffectifFraction(etat: EtatMorceauFraction): Crochet | null {
  return crochetGaucheVerrouilleFraction(etat) ? "]" : etat.crochetGauche;
}

export function crochetDroitEffectifFraction(etat: EtatMorceauFraction): Crochet | null {
  return crochetDroitVerrouilleFraction(etat) ? "[" : etat.crochetDroit;
}

function borneGaucheValide(etat: EtatMorceauFraction): boolean {
  return etat.borneGaucheMode === "-inf" || parserNombreOuFraction(etat.borneGaucheValeur) !== null;
}

function borneDroiteValide(etat: EtatMorceauFraction): boolean {
  return etat.borneDroiteMode === "+inf" || parserNombreOuFraction(etat.borneDroiteValeur) !== null;
}

export function morceauFractionEstComplet(etat: EtatMorceauFraction): boolean {
  return (
    borneGaucheValide(etat) &&
    borneDroiteValide(etat) &&
    crochetGaucheEffectifFraction(etat) !== null &&
    crochetDroitEffectifFraction(etat) !== null
  );
}

export function construireMorceauFraction(etat: EtatMorceauFraction): Morceau | null {
  if (!morceauFractionEstComplet(etat)) return null;

  return {
    crochetGauche: crochetGaucheEffectifFraction(etat) as Crochet,
    borneGauche: etat.borneGaucheMode === "-inf" ? "-inf" : (parserNombreOuFraction(etat.borneGaucheValeur) as number),
    crochetDroit: crochetDroitEffectifFraction(etat) as Crochet,
    borneDroite: etat.borneDroiteMode === "+inf" ? "+inf" : (parserNombreOuFraction(etat.borneDroiteValeur) as number),
  };
}
