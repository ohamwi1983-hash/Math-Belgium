/**
 * Couche présentation — "Construction graphique — tracer une droite depuis son équation". Rendu
 * LaTeX de l'énoncé (dispatché par `variante`, un seul champ non-null à la fois) et consignes/aides
 * par écran — dérivées uniquement des champs déjà présents sur le contrat, jamais recalculées
 * différemment côté vérification (`moteur/verificationConstructionDroite.ts`).
 *
 * `formatPointLatex` réutilisée telle quelle depuis `formatEquationDroite.ts`
 * (module frère), jamais réécrite — même principe que `formatLectureGraphiqueDroite.ts`.
 */
import type { ExerciceConstructionDroite } from "../core/constructionDroite.types";
import type { Point } from "../core/vecteur.types";
import { formatEquationExpliciteXLatex, formatEquationExpliciteYLatex, formatEquationImpliciteLatex, formatPointLatex, formatRepresentationParametriqueLatex } from "./formatEquationDroite";


/** Rendu de l'équation réellement affichée à l'élève — dispatché sur `variante`, jamais recalculé
 * différemment de la Couche A qui a construit ce même champ. Signes/coefficients toujours
 * simplifiés (correction transversale chapitre 6, point 1). */
export function formatEnonceLatex(exercice: ExerciceConstructionDroite): string {
  switch (exercice.variante) {
    case "parametrique": {
      const p = exercice.parametrique!;
      return formatRepresentationParametriqueLatex(p.x0, p.a, p.y0, p.b);
    }
    case "implicite": {
      const d = exercice.implicite!;
      return formatEquationImpliciteLatex(d.a, d.b, d.c);
    }
    case "explicite_y": {
      const d = exercice.expliciteY!;
      return formatEquationExpliciteYLatex(d.m, d.p);
    }
    case "explicite_x": {
      const d = exercice.expliciteX!;
      return formatEquationExpliciteXLatex(d.n, d.q);
    }
  }
}

/** Consigne générale, affichée sur les 2 écrans (`promptgen43gen44etcorrectionschapitre6.md`,
 * partie B.1) — rappelle l'objectif final ("tracer" la droite) avant le détail de la consigne par
 * écran (`consignePoints`/`CONSIGNE_TRACE`, qui précisent la tâche immédiate). Adaptée à la forme
 * d'entrée : "d'équation" pour les 3 formes cartésiennes, "dont la représentation paramétrique est
 * donnée" pour la forme paramétrique (une représentation paramétrique n'est pas, au sens strict,
 * une unique "équation"). */
export function consigneGeneraleTrace(exercice: ExerciceConstructionDroite): string {
  return exercice.variante === "parametrique"
    ? "Trace la droite dont la représentation paramétrique est donnée ci-dessous."
    : "Trace la droite d'équation ci-dessous.";
}

// ============================================================================
// Écran 1 — deux points entiers distincts de la droite.
// ============================================================================

export function consignePoints(exercice: ExerciceConstructionDroite): string {
  switch (exercice.variante) {
    case "parametrique":
      return "Choisis deux valeurs entières distinctes du paramètre t, calcule les coordonnées (x ; y) correspondantes, puis donne les deux points obtenus.";
    case "implicite":
      return "Trouve deux points à coordonnées entières distincts qui vérifient cette équation.";
    case "explicite_y":
      return "Choisis deux valeurs entières distinctes de x, calcule y à chaque fois, puis donne les deux points obtenus.";
    case "explicite_x":
      return "Choisis deux valeurs entières distinctes de y, calcule x à chaque fois, puis donne les deux points obtenus.";
  }
}

/** Aide niveau 1 — rappel de méthode générique, jamais une valeur réelle de l'exercice. */
export function texteAidePointsNiveau1(exercice: ExerciceConstructionDroite): string {
  switch (exercice.variante) {
    case "parametrique":
      return "Remplace t par une valeur entière de ton choix dans les deux équations pour obtenir un point (x ; y) de la droite. Recommence avec une autre valeur de t pour un second point.";
    case "implicite":
      return "Choisis une valeur entière pour x, résous l'équation pour trouver y (ou l'inverse si c'est plus simple). Recommence avec une autre valeur pour un second point.";
    case "explicite_y":
      return "Remplace x par une valeur entière de ton choix, calcule y = mx + p pour obtenir un point de la droite. Recommence avec une autre valeur de x.";
    case "explicite_x":
      return "Remplace y par une valeur entière de ton choix, calcule x = ny + q pour obtenir un point de la droite. Recommence avec une autre valeur de y.";
  }
}

/** Aide niveau 2 — un exemple de point RÉELLEMENT sur la droite (toujours `exercice.point`, valable
 * quelle que soit `variante` puisque les 4 formes décrivent la même droite) — jamais la seule paire
 * imposée : la vérification (`diagnostiquerPoints`) accepte n'importe quel autre point entier. */
export function formatAidePointsNiveau2Latex(exercice: ExerciceConstructionDroite): string {
  return `\\text{Par exemple : } ${formatPointLatex(exercice.point)}`;
}

export const PLACEHOLDER_COORDONNEE = "ex : 3";

// ============================================================================
// Écran 2 — placement des 2 points confirmés sur le graphe (glissement cranté).
// ============================================================================

export const CONSIGNE_TRACE = "Place ces deux points sur le graphe en faisant glisser les marqueurs jusqu'aux bonnes positions.";

/** Rappel des 2 points confirmés à l'écran 1 (`cible1`/`cible2`) — toujours la vraie valeur déjà
 * validée (ou révélée), jamais recalculée différemment. */
export function formatEtatActuelPointsLatex(cible1: Point, cible2: Point): string {
  return `A${formatPointLatex(cible1)} \\quad B${formatPointLatex(cible2)}`;
}

/** Aide (1 seul niveau) — rappel de méthode de placement, substitué avec les vraies coordonnées de
 * `cible1` à titre d'exemple (déjà connues de l'élève via le bloc "état actuel" ci-dessus — cette
 * aide porte sur la TECHNIQUE de placement, jamais sur une donnée cachée). */
export function texteAideTraceNiveau1(cible1: Point): string {
  return `Pour placer le point (${cible1.x} ; ${cible1.y}) : pars de l'origine, déplace-toi de ${cible1.x} unité(s) sur l'axe horizontal, puis de ${cible1.y} unité(s) sur l'axe vertical. Fais de même pour le second point.`;
}
