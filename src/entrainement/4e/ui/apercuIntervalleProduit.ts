import type { SolutionEnsembleProduit } from "../core/signesProduit.types";
import type { EtatMorceau } from "./morceauIntervalle";
import { crochetDroitEffectif, crochetGaucheEffectif } from "./morceauIntervalle";

type Forme = SolutionEnsembleProduit["forme"];

/** Emplacement pas encore renseigné : tiret LaTeX (\_), même convention que apercuIntervalle.ts. */
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
 * Aperçu LaTeX en temps réel de la réponse en cours de construction, généralisé à un nombre
 * variable de morceaux ("union") et de valeurs exclues ("reel_sauf_points") — prompt-corrections-
 * tableau-signes-3points.md, point 2. Fichier séparé de ui/apercuIntervalle.ts (exercice "tableau
 * de signes", qui reste limité à exactement 2 morceaux / 1 valeur, jamais partagé — voir
 * core/signesProduit.types.ts). Chaque morceau/valeur garde son propre état indépendamment des
 * autres, y compris incomplet (placeholders "?"/"\_").
 *
 * `morceaux` sert pour les deux formes "intervalle" (1 morceau attendu) ET "union" (2+ morceaux) —
 * un seul paramètre liste, jamais deux paramètres séparés (promptgenerateur5signesProduit.md,
 * point 4 : "Tableau de signes à plusieurs facteurs" fusionne ces deux formes en une seule option
 * "Au moins un intervalle" sur son propre écran ; "Inéquations rationnelles" garde ses deux options
 * séparées mais adapte simplement son appel — `[morceau]` pour "intervalle", `morceauxUnion` pour
 * "union" — sans aucun changement de comportement).
 */
export function formatApercuSolutionProduit(
  forme: Forme | null,
  valeurPoint: string,
  valeursExclues: string[],
  morceaux: EtatMorceau[],
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
    case "reel_sauf_points":
      return `\\mathbb{R} \\setminus \\{${valeursExclues.map(formatValeurBrute).join(", ")}\\}`;
    case "intervalle":
    case "union":
      return morceaux.map(formatMorceau).join(" \\cup ");
  }
}

/**
 * Version "bloc fitter" de `formatApercuSolutionProduit` (`promptblocfittertousgenerateurs.md`) —
 * un tableau de fragments KaTeX courts (préfixe `S =` sur le premier, `\cup` en préfixe de chacun
 * des suivants) plutôt qu'une seule chaîne `\cup`-jointe, pour la forme `"union"`/`"intervalle"`
 * SEULE forme réellement extensible (nombre de morceaux illimité, "+ Ajouter un morceau") — les
 * autres formes restent un unique fragment court (`vide`/`reel`/`point`/`reel_sauf_points`, jamais
 * plus de 2-3 valeurs courtes dans la pratique de ce générateur). `null` tant qu'aucune forme n'est
 * choisie, comme la fonction d'origine.
 */
export function formatTermesApercuSolutionProduit(
  forme: Forme | null,
  valeurPoint: string,
  valeursExclues: string[],
  morceaux: EtatMorceau[],
): string[] | null {
  if (forme === null) return null;
  if (forme !== "intervalle" && forme !== "union") {
    return [`S = ${formatApercuSolutionProduit(forme, valeurPoint, valeursExclues, morceaux)}`];
  }
  return morceaux.map((morceau, i) => (i === 0 ? `S = ${formatMorceau(morceau)}` : `\\cup ${formatMorceau(morceau)}`));
}
