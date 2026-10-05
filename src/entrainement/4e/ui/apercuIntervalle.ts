import type { SolutionEnsemble } from "../core/inequation.types";
import type { EtatMorceau } from "./morceauIntervalle";
import { crochetDroitEffectif, crochetGaucheEffectif } from "./morceauIntervalle";

type Forme = SolutionEnsemble["forme"];

/** Emplacement pas encore renseigné : tiret LaTeX (\_), littéralement l'exemple de la spec. */
const PLACEHOLDER = "\\_";

function formatValeurBrute(valeur: string): string {
  const texte = valeur.trim();
  return texte === "" ? PLACEHOLDER : texte;
}

function formatBorneGauche(etat: EtatMorceau): string {
  return etat.borneGaucheMode === "-inf" ? "-\\infty" : formatValeurBrute(etat.borneGaucheValeur);
}

function formatBorneDroite(etat: EtatMorceau): string {
  return etat.borneDroiteMode === "+inf" ? "+\\infty" : formatValeurBrute(etat.borneDroiteValeur);
}

/** "?" tant que l'élève n'a pas cliqué le toggle — même convention que le bouton crochet lui-même. */
function formatMorceau(etat: EtatMorceau): string {
  const crochetGauche = crochetGaucheEffectif(etat) ?? "?";
  const crochetDroit = crochetDroitEffectif(etat) ?? "?";
  return `${crochetGauche}${formatBorneGauche(etat)} ; ${formatBorneDroite(etat)}${crochetDroit}`;
}

/**
 * Aperçu LaTeX en temps réel de la réponse en cours de construction (section "construction de
 * l'intervalle") — mis à jour à chaque interaction, jamais une saisie figée. Retourne null tant
 * qu'aucune forme n'a été choisie (rien à prévisualiser). Notation francophone déjà en place
 * (crochets inversés, point-virgule) réutilisée telle quelle, jamais redérivée.
 */
export function formatApercuSolution(
  forme: Forme | null,
  valeurPoint: string,
  morceau: EtatMorceau,
  morceau1: EtatMorceau,
  morceau2: EtatMorceau,
): string | null {
  switch (forme) {
    case null:
      return null;
    case "vide":
      return "\\varnothing";
    case "reel":
      return "\\mathbb{R}";
    case "point":
      return `\\{${formatValeurBrute(valeurPoint)}\\}`;
    case "reel_sauf_point":
      return `\\mathbb{R} \\setminus \\{${formatValeurBrute(valeurPoint)}\\}`;
    case "intervalle":
      return formatMorceau(morceau);
    case "union":
      return `${formatMorceau(morceau1)} \\cup ${formatMorceau(morceau2)}`;
  }
}

/**
 * Version "bloc fitter" de `formatApercuSolution` (`promptblocfittertousgenerateurs.md`) — pour la
 * forme `"union"` (les 2 seuls morceaux susceptibles de faire déborder une chaîne unique jointe par
 * `\cup`), retourne un tableau de 2 fragments (préfixe `S =`/`\cup`) plutôt qu'une seule chaîne.
 * Toutes les autres formes restent un unique fragment court.
 */
export function formatTermesApercuSolution(
  forme: Forme | null,
  valeurPoint: string,
  morceau: EtatMorceau,
  morceau1: EtatMorceau,
  morceau2: EtatMorceau,
): string[] | null {
  if (forme === null) return null;
  if (forme !== "union") {
    return [`S = ${formatApercuSolution(forme, valeurPoint, morceau, morceau1, morceau2)}`];
  }
  return [`S = ${formatMorceau(morceau1)}`, `\\cup ${formatMorceau(morceau2)}`];
}
