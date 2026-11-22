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
import { formatEquationExpliciteXLatex, formatEquationExpliciteYLatex, formatEquationImpliciteLatex, formatPointLatex, formatRepresentationParametriqueLatex, formatValeurGenereeLatex } from "./formatEquationDroite";
import type { FragmentConsigne } from "./formatEquationDroite";
import { nombreFr } from "./nombreFr";


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
      return "Trouve deux points distincts de cette droite à coordonnées entières : choisis une valeur de x qui donne un y entier, calcule y, puis recommence avec une autre valeur de x.";
    case "explicite_x":
      return "Trouve deux points distincts de cette droite à coordonnées entières : choisis une valeur de y qui donne un x entier, calcule x, puis recommence avec une autre valeur de y.";
  }
}

/** Aide niveau 1 — rappel de méthode générique, jamais une valeur réelle de l'exercice. */
export function texteAidePointsNiveau1(exercice: ExerciceConstructionDroite): string {
  return aidePointsNiveau1(exercice)
    .map((f) => f.valeur)
    .join("")
    .replace(/\\,/g, " ")
    .replace(/\\cdot/g, "·");
}

/** Aide niveau 1 (KaTeX) — la méthode du cours, sans valeur de l'instance. */
export function aidePointsNiveau1(exercice: ExerciceConstructionDroite): FragmentConsigne[] {
  switch (exercice.variante) {
    case "parametrique":
      return [t("Remplace "), l("t"), t(" par une valeur entière de ton choix dans les deux équations : tu obtiens un point "), l("(x\\,;\\,y)"), t(" de la droite. Recommence avec une autre valeur de "), l("t"), t(" pour un second point.")];
    case "implicite":
      return [t("Choisis une valeur entière pour "), l("x"), t(", puis résous l'équation pour trouver "), l("y"), t(" (ou l'inverse si c'est plus simple). Recommence avec une autre valeur pour un second point.")];
    case "explicite_y":
      return [t("Remplace "), l("x"), t(" par une valeur entière et calcule "), l("y=mx+p"), t(". Si "), l("m"), t(" est une fraction, choisis "), l("x"), t(" multiple de son dénominateur pour que "), l("y"), t(" soit entier ; pour le second point, ajoute ce dénominateur à "), l("x"), t(".")];
    case "explicite_x":
      return [t("Remplace "), l("y"), t(" par une valeur entière et calcule "), l("x=ny+q"), t(". Si "), l("n"), t(" est une fraction, choisis "), l("y"), t(" de façon à rendre "), l("x"), t(" entier ; pour le second point, ajoute le dénominateur de "), l("n"), t(" à "), l("y"), t(".")];
  }
}

/** Aide niveau 2 (KaTeX) — la méthode posée pour UNE valeur bien choisie, le calcul laissé à l'élève
 * (audit 4e ch. 7, G4 : jamais un point de la réponse tout fait). */
export function aidePointsNiveau2(exercice: ExerciceConstructionDroite): FragmentConsigne[] {
  const { point } = exercice;
  const v = (n: number) => (n < 0 ? `(${formatValeurGenereeLatex(n)})` : formatValeurGenereeLatex(n));
  switch (exercice.variante) {
    case "parametrique": {
      const d = exercice.parametrique!;
      return [t("Par exemple, pour "), l("t=0"), t(" puis "), l("t=1"), t(" : "), l(`x=${formatValeurGenereeLatex(d.x0)}+${v(d.a)}\\cdot 0`), t(", "), l(`y=${formatValeurGenereeLatex(d.y0)}+${v(d.b)}\\cdot 0`), t(" ; puis "), l(`x=${formatValeurGenereeLatex(d.x0)}+${v(d.a)}\\cdot 1`), t(", "), l(`y=${formatValeurGenereeLatex(d.y0)}+${v(d.b)}\\cdot 1`), t(".")];
    }
    case "implicite": {
      const d = exercice.implicite!;
      if (Math.abs(d.b) > 1e-12) return [t("Par exemple, pour "), l(`x=${formatValeurGenereeLatex(point.x)}`), t(" : "), l(`${formatValeurGenereeLatex(d.a)}\\cdot ${v(point.x)}${d.b < 0 ? "-" : "+"}${formatValeurGenereeLatex(Math.abs(d.b))}y${d.c < 0 ? "-" : "+"}${formatValeurGenereeLatex(Math.abs(d.c))}=0`), t(" : il reste à résoudre en "), l("y"), t(".")];
      return [t("La droite est verticale : "), l("x"), t(" est le même pour tous ses points ; choisis deux valeurs de "), l("y"), t(".")];
    }
    case "explicite_y": {
      const d = exercice.expliciteY!;
      return [t("Par exemple, pour "), l(`x=${formatValeurGenereeLatex(point.x)}`), t(" : "), l(`y=${formatValeurGenereeLatex(d.m)}\\cdot ${v(point.x)}+${v(d.p)}`), t(" ; le second point : "), l(`x=${formatValeurGenereeLatex(point.x)}+${formatValeurGenereeLatex(denominateur(d.m))}`), t(".")];
    }
    case "explicite_x": {
      const d = exercice.expliciteX!;
      return [t("Par exemple, pour "), l(`y=${formatValeurGenereeLatex(point.y)}`), t(" : "), l(`x=${formatValeurGenereeLatex(d.n)}\\cdot ${v(point.y)}+${v(d.q)}`), t(" ; le second point : "), l(`y=${formatValeurGenereeLatex(point.y)}+${formatValeurGenereeLatex(denominateur(d.n))}`), t(".")];
    }
  }
}

function denominateur(v: number): number {
  for (let d = 1; d <= 100; d++) if (Math.abs(v * d - Math.round(v * d)) < 1e-9) return d;
  return 1;
}

function t(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}
function l(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
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
/** Aide de tracé, niveau 1 — la technique, sans valeur. */
export const AIDE_TRACE_NIVEAU_1 = "Pour placer un point, pars de l'origine : avance horizontalement de son abscisse (vers la droite si elle est positive), puis verticalement de son ordonnée (vers le haut si elle est positive).";

export function texteAideTraceNiveau1(cible1: Point): string {
  const signe = (v: number) => nombreFr(v).replace("-", "−");
  return `Pour placer le point (${signe(cible1.x)} ; ${signe(cible1.y)}) : pars de l'origine, ${deplacement(cible1.x, "vers la droite", "vers la gauche", "ne te déplace pas horizontalement")}, puis ${deplacement(cible1.y, "vers le haut", "vers le bas", "ne te déplace pas verticalement")}. Fais de même pour le second point.`;
}

/** « avance de 3 unités vers la droite » / « de 1 unité vers la gauche » — jamais « de -1 unité(s) »
 * (audit chapitre 7, point 18). */
function deplacement(valeur: number, sensPositif: string, sensNegatif: string, sansDeplacement: string): string {
  if (valeur === 0) return sansDeplacement;
  const n = Math.abs(valeur);
  return `avance de ${nombreFr(n)} unité${n > 1 ? "s" : ""} ${valeur > 0 ? sensPositif : sensNegatif}`;
}
