import type { FormeDomaine } from "../core/caracteristiquesAlgebriques.types";
import type { EtatMorceauFraction } from "./morceauFraction";
import { crochetDroitEffectifFraction, crochetGaucheEffectifFraction } from "./morceauFraction";

/** Emplacement pas encore renseigné : tiret LaTeX (\_), même convention qu'`apercuIntervalle.ts`
 * (exercice "tableau de signes") — littéralement l'exemple de la spec. */
const PLACEHOLDER = "\\_";

function formatValeurBrute(valeur: string): string {
  const texte = valeur.trim();
  return texte === "" ? PLACEHOLDER : texte;
}

function formatBorneGauche(etat: EtatMorceauFraction): string {
  return etat.borneGaucheMode === "-inf" ? "-\\infty" : formatValeurBrute(etat.borneGaucheValeur);
}

function formatBorneDroite(etat: EtatMorceauFraction): string {
  return etat.borneDroiteMode === "+inf" ? "+\\infty" : formatValeurBrute(etat.borneDroiteValeur);
}

/** "?" tant que l'élève n'a pas cliqué le toggle — même convention que le bouton crochet lui-même,
 * et qu'`apercuIntervalle.ts::formatMorceau`. */
function formatMorceauFraction(etat: EtatMorceauFraction): string {
  const crochetGauche = crochetGaucheEffectifFraction(etat) ?? "?";
  const crochetDroit = crochetDroitEffectifFraction(etat) ?? "?";
  return `${crochetGauche}${formatBorneGauche(etat)} ; ${formatBorneDroite(etat)}${crochetDroit}`;
}

/**
 * Rendu LaTeX du domaine lui-même, SANS le préfixe `domf = ` — extrait de `formatApercuDomaine`
 * (`prompt-corrections-caracteristiquesalgebriques.md`, point 3) pour être réutilisé tel quel par
 * `ResultatPanelCaracteristiquesAlgebriques.tsx` (révélation du domaine attendu après échec), qui a
 * besoin du contenu seul — jamais une seconde logique de formatage de domaine écrite séparément
 * pour cet écran. Retourne `null` tant qu'aucune forme n'a été choisie (rien à afficher).
 */
export function formatDomaineLatex(forme: FormeDomaine | null, points: string[], intervalles: EtatMorceauFraction[]): string | null {
  if (forme === null) return null;

  switch (forme) {
    case "vide":
      return "\\varnothing";
    case "reel":
      return "\\mathbb{R}";
    case "prive_points":
      return `\\mathbb{R} \\setminus \\{${points.map(formatValeurBrute).join(" ; ")}\\}`;
    case "intervalles":
      return intervalles.map(formatMorceauFraction).join(" \\cup ");
  }
}

/**
 * Aperçu LaTeX en temps réel du domaine en cours de construction, préfixé `domf = `
 * (`prompt-3-ameliorations-finales.md`, point 3 — cohérent avec la notation déjà utilisée ailleurs
 * dans le projet, ex. "domf = ℝ" affiché par "Analyse d'une fonction du second degré") — même
 * principe que `formatApercuSolution` (`apercuIntervalle.ts`, exercice "tableau de signes"), mais
 * adapté à ce générateur : les listes de points/intervalles y sont EXTENSIBLES (0 à N éléments),
 * jamais un nombre fixe comme les 6 formes de `SolutionEnsemble`. Retourne `null` tant qu'aucune
 * forme n'a été choisie (rien à prévisualiser) — mis à jour à chaque interaction, jamais une
 * saisie figée.
 */
export function formatApercuDomaine(forme: FormeDomaine | null, points: string[], intervalles: EtatMorceauFraction[]): string | null {
  const contenu = formatDomaineLatex(forme, points, intervalles);
  return contenu === null ? null : `domf = ${contenu}`;
}

/**
 * Version "bloc fitter" de `formatApercuDomaine` (`promptblocfittertousgenerateurs.md`) — pour la
 * forme `"intervalles"` (liste EXTENSIBLE, 0 à N éléments, chaque morceau `[a;b]` déjà balancé
 * individuellement), retourne un tableau de fragments KaTeX courts (préfixe `domf =` sur le
 * premier, `\cup` en préfixe des suivants) plutôt qu'une seule chaîne `\cup`-jointe. Les autres
 * formes restent un unique fragment — y compris `"prive_points"`, dont la liste reste bornée en
 * pratique ET dont l'écriture `\mathbb{R} \setminus \{...\}` ne peut PAS être scindée entre points
 * sans casser l'équilibrage des accolades `\{`/`\}` que KaTeX exige au sein d'une même expression
 * (vérifié directement sous Node : `\mathbb{R} \setminus \{1 ;` seul lève `Expected '}', got 'EOF'`)
 * — même principe que `reel_sauf_points` dans `apercuIntervalleProduit.ts`.
 */
export function formatTermesApercuDomaine(forme: FormeDomaine | null, points: string[], intervalles: EtatMorceauFraction[]): string[] | null {
  if (forme === null) return null;
  if (forme !== "intervalles") {
    return [`domf = ${formatDomaineLatex(forme, points, intervalles)}`];
  }
  return intervalles.map((intervalle, i) =>
    i === 0 ? `domf = ${formatMorceauFraction(intervalle)}` : `\\cup ${formatMorceauFraction(intervalle)}`,
  );
}
