/**
 * Couche présentation — "Intersection entre deux droites" (`src/generateurs/intersectionDroites/`,
 * `src/moteur/sessionIntersectionDroites.ts`). `formatPointLatex`/`formatVecteurLatex`
 * réutilisés directement depuis `formatEquationDroite.ts` (jamais dupliqués —
 * même style que `formatRelationsDroites.ts`/`formatDistanceDroite.ts`).
 *
 * Restructuration `promptgen48modifications.md` : consigne générale ("Quelle est l'intersection de
 * ces droites ?", point 1) affichée sur les 2 écrans (diagnostic ET point d'intersection quand il
 * existe), consigne de l'écran diagnostic reformulée (point 2), aides de l'écran diagnostic
 * DIFFÉRENCIÉES selon la combinaison de formes d'entrée (point 3 — cart_cart : pentes ; param_param :
 * colinéarité des vecteurs directeurs ; mixte : comparaison pente/ratio, adaptée à laquelle des
 * deux droites est réellement paramétrique dans l'instance, jamais supposée être `d1`), consigne de
 * l'écran "point" reformulée pour la seule variante `param_cart` (point 4 — `cart_cart`/`param_param`
 * gardent leur texte propre, déjà court et non concerné par la reformulation demandée).
 *
 * **Écran 2 — les aides niveau 2 diffèrent par variante, jamais un résultat final calculé** :
 * `cart_cart` réduit le système {d1;d2} à une seule équation en x (élimination de y) ; `param_cart`
 * substitue la paramétrique de d1 dans l'équation implicite de d2 (une seule équation en t, jamais
 * résolue — c'est précisément le piège central de cette variante : trouver t ne suffit pas, il faut
 * encore réinjecter dans d1 pour obtenir le point) ; `param_param` égale les deux paramétriques
 * composante par composante (un système à 2 équations/2 inconnues t et s, non résolu).
 */
import type { ConclusionIntersectionDroites, ExerciceIntersectionDroites, LigneIntersection, VarianteIntersectionDroites } from "../core/intersectionDroites.types";
import { formatEquationExpliciteXLatex, formatEquationExpliciteYLatex, formatEquationImpliciteLatex, formatPointLatex, formatRepresentationParametriqueLatex, formatSommeTermesGeneree, formatVecteurLatex } from "./formatEquationDroite";
import { formatFractionIrreductible } from "./formatFraction";

export { formatPointLatex, formatVecteurLatex };

export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

function texte(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}
function latex(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
}

export const LIBELLE_VARIANTE: Record<VarianteIntersectionDroites, string> = {
  cart_cart: "Cartésienne × cartésienne",
  param_cart: "Paramétrique × cartésienne",
  param_param: "Paramétrique × paramétrique",
};

export const LIBELLE_CONCLUSION: Record<ConclusionIntersectionDroites, string> = {
  secantes: "Sécantes",
  paralleles_distinctes: "Parallèles distinctes",
  confondues: "Confondues",
};

/** `d \equiv ...` — notation `\equiv` (jamais `:`), signes/coefficients toujours simplifiés,
 * domaine du paramètre toujours précisé pour une forme paramétrique (correction transversale
 * chapitre 6, points 1, 2 et 4). */
function formatLigneLatex(ligne: LigneIntersection, label: string, variableParam: string): string {
  switch (ligne.forme) {
    case "implicite": {
      const d = ligne.implicite;
      return `${label} \\equiv ${formatEquationImpliciteLatex(d.a, d.b, d.c)}`;
    }
    case "explicite_y": {
      const d = ligne.expliciteYAffichee!;
      return `${label} \\equiv ${formatEquationExpliciteYLatex(d.m, d.p)}`;
    }
    case "explicite_x": {
      const d = ligne.expliciteXAffichee!;
      return `${label} \\equiv ${formatEquationExpliciteXLatex(d.n, d.q)}`;
    }
    case "parametrique": {
      const d = ligne.parametriqueAffichee!;
      return `${label} \\equiv ${formatRepresentationParametriqueLatex(d.x0, d.a, d.y0, d.b, variableParam)}`;
    }
  }
}

/** Rendu de chaque droite, individuellement — `d1` toujours paramétrée par `t`, `d2` toujours par
 * `s` (même quand une seule des deux est réellement paramétrique) — cohérent avec
 * `exercice.tAttendu`/`sAttendu`. Retourne un COUPLE de chaînes (jamais concaténées en une seule
 * expression KaTeX) : affichées empilées verticalement côté composant, jamais côte à côte sur un
 * seul bloc `.equation-box` — débordement mobile déjà rencontré avec l'ancienne concaténation
 * `\quad`, surtout pour `param_param` (deux systèmes `\begin{cases}` l'un à côté de l'autre),
 * correction transversale chapitre 6, point 6. */
export function formatLignesEnonce(exercice: ExerciceIntersectionDroites): [string, string] {
  return [formatLigneLatex(exercice.d1, "d_1", "t"), formatLigneLatex(exercice.d2, "d_2", "s")];
}

/** Conservée pour les usages qui n'ont besoin que d'une chaîne unique (ex. un test de contenu) —
 * les composants d'écran doivent préférer `formatLignesEnonce` (voir sa documentation). */
export function formatEnonceLatex(exercice: ExerciceIntersectionDroites): string {
  return formatLignesEnonce(exercice).join(" \\quad ");
}

// ============================================================================
// Consigne générale — point 1, affichée identique sur les 2 écrans (diagnostic, et point
// d'intersection quand cet écran existe, càd conclusion === "secantes").
// ============================================================================

export const CONSIGNE_GENERALE_INTERSECTION = "Quelle est l'intersection de ces droites ?";

// ============================================================================
// Fraction irréductible pour toute valeur GÉNÉRÉE non entière (pente d'une droite — correction
// transversale chapitre 6, C.2) — mêmes wrappers locaux que `formatDistanceDroite.ts`, dupliqués
// plutôt que partagés (trop petits pour l'extraction, déjà la convention établie sur ce chapitre).
// ============================================================================

function formatMagnitudeFractionLatex(abs: number): string {
  const texteFraction = formatFractionIrreductible(abs);
  const [numerateur, denominateur] = texteFraction.split("/");
  return denominateur === undefined ? numerateur! : `\\frac{${numerateur}}{${denominateur}}`;
}

function formatValeurFractionLatex(valeur: number): string {
  return valeur < 0 ? `-${formatMagnitudeFractionLatex(-valeur)}` : formatMagnitudeFractionLatex(valeur);
}

/** Pente d'une droite quelle que soit sa forme d'affichage — dérivée directement de son vecteur
 * directeur (`vecteur.y/vecteur.x`), toujours présent sur `LigneIntersection` indépendamment de
 * `forme`. Toujours finie dans ce générateur : `tirerVecteur()` (`generateurs/intersectionDroites/index.ts`)
 * garantit les deux composantes non nulles pour toute droite, quelle que soit la variante — aucune
 * droite verticale/horizontale n'est jamais générée ici. */
function penteDeLigne(ligne: LigneIntersection): number {
  return ligne.vecteur.y / ligne.vecteur.x;
}

/** Repère laquelle des deux droites est réellement paramétrique dans l'instance — jamais supposée
 * être `d1` (la combinaison `param_cart` place toujours la paramétrique en `d1` dans ce générateur
 * aujourd'hui, mais l'aide doit rester correcte si cette contrainte de construction changeait un
 * jour — `promptgen48modifications.md`, point 3c : "adapter les indices selon laquelle des deux
 * droites est paramétrique dans l'instance"). */
function ligneParametrique(exercice: ExerciceIntersectionDroites): { ligne: LigneIntersection; indice: 1 | 2 } {
  return exercice.d1.forme === "parametrique" ? { ligne: exercice.d1, indice: 1 } : { ligne: exercice.d2, indice: 2 };
}

function ligneCartesienne(exercice: ExerciceIntersectionDroites): { ligne: LigneIntersection; indice: 1 | 2 } {
  return exercice.d1.forme === "parametrique" ? { ligne: exercice.d2, indice: 2 } : { ligne: exercice.d1, indice: 1 };
}

// ============================================================================
// Écran 1 — Diagnostic (sécantes / parallèles distinctes / confondues).
// ============================================================================

/** Reformulation point 2 — remplace l'ancienne question longue ("Détermine la position relative de
 * d₁ et d₂ : sont-elles sécantes, parallèles distinctes, ou confondues ?"). */
export function segmentsConsigneDiagnostic(): FragmentConsigne[] {
  return [texte("Les droites "), latex("d_1"), texte(" et "), latex("d_2"), texte(" sont :")];
}

/** Aide niveau 1, DIFFÉRENCIÉE selon la combinaison de formes d'entrée des deux droites — point 3.
 * Cas particulier `param_cart`/`cart_param` (mixte) : si la droite paramétrique est verticale
 * (`x_{\vec u}=0`), le rapport n'est pas calculable — l'aide l'explique, bien que ce cas ne soit
 * jamais atteint en pratique dans ce générateur (voir `penteDeLigne`, composantes toujours non
 * nulles par construction) — mentionné par complétude pédagogique, même principe déjà établi pour
 * "Distance point-droite et droite-droite" (`CLAUDE.md`, section gen47). */
export function segmentsAideDiagnosticNiveau1(exercice: ExerciceIntersectionDroites): FragmentConsigne[] {
  if (exercice.variante === "cart_cart") {
    return [texte("Compare les pentes "), latex("m_1"), texte(" et "), latex("m_2"), texte(" des deux droites — sont-elles égales ou non ?")];
  }
  if (exercice.variante === "param_param") {
    return [
      texte("Regarde si les vecteurs directeurs "),
      latex("\\vec{u_1}"),
      texte(" de "),
      latex("d_1"),
      texte(" et "),
      latex("\\vec{u_2}"),
      texte(" de "),
      latex("d_2"),
      texte(" sont colinéaires ou non."),
    ];
  }
  const { indice: iParam } = ligneParametrique(exercice);
  const { indice: iCart } = ligneCartesienne(exercice);
  return [
    texte("Regarde si "),
    latex(`m_${iCart} = \\dfrac{y_{\\vec{u_${iParam}}}}{x_{\\vec{u_${iParam}}}}`),
    texte(" — sont-elles égales ou non ? (si "),
    latex(`x_{\\vec{u_${iParam}}} = 0`),
    texte(", la droite paramétrique est verticale et ce rapport n'est pas calculable : compare alors directement si la droite cartésienne est elle-même verticale, c'est-à-dire si elle n'a pas de forme "),
    latex("y=mx+p"),
    texte(" définie.)"),
  ];
}

/** Aide niveau 2, DIFFÉRENCIÉE — révèle la DONNÉE BRUTE (jamais la conclusion de colinéarité elle-
 * même, qui reste à calculer par l'élève à partir de cette donnée) : la pente `m_1` (cart_cart), les
 * composantes de `\vec{u_1}` (param_param), ou les composantes du vecteur directeur de la droite
 * réellement paramétrique de l'instance (mixte, indices adaptés comme pour l'aide niveau 1). */
export function formatAideDiagnosticNiveau2Latex(exercice: ExerciceIntersectionDroites): string {
  if (exercice.variante === "cart_cart") {
    return `m_1 = ${formatValeurFractionLatex(penteDeLigne(exercice.d1))}`;
  }
  if (exercice.variante === "param_param") {
    return `\\vec{u_1}${formatVecteurLatex(exercice.d1.vecteur)}`;
  }
  const { ligne, indice } = ligneParametrique(exercice);
  return `\\vec{u_${indice}}${formatVecteurLatex(ligne.vecteur)}`;
}

// ============================================================================
// Écran 2 — Point d'intersection (uniquement si conclusion === "secantes").
// ============================================================================

/** Reformulation point 4 — seule la variante `param_cart` est raccourcie (l'ancienne question
 * détaillait déjà toute la méthode substitution/isolement de t/réinjection, désormais réservée à
 * l'aide de cet écran, jamais répétée dans la question). `cart_cart`/`param_param` gardent leur
 * texte propre, déjà court et non concerné par cette reformulation. */
export function segmentsConsignePoint(exercice: ExerciceIntersectionDroites): FragmentConsigne[] {
  switch (exercice.variante) {
    case "cart_cart":
      return [texte("Résous le système {d₁ ; d₂} pour trouver les coordonnées du point d'intersection.")];
    case "param_cart":
      return [texte("Résous le système d'équations "), latex("d_1\\cap d_2"), texte(".")];
    case "param_param":
      return [texte("Égale les 2 représentations paramétriques composante par composante pour former un système à 2 équations et 2 inconnues (t et s), puis calcule les coordonnées du point d'intersection.")];
  }
}

export function texteAidePointNiveau1(exercice: ExerciceIntersectionDroites): string {
  switch (exercice.variante) {
    case "cart_cart":
      return "Résous le système par substitution ou par combinaison linéaire (élimine une inconnue).";
    case "param_cart":
      return "Remplace x et y dans l'équation de d₂ par les expressions paramétriques de d₁, puis isole t. Attention : trouver t ne suffit pas — réinjecte-le ensuite dans la représentation paramétrique de d₁ pour obtenir le point.";
    case "param_param":
      return "Égale les 2 représentations paramétriques composante par composante (x et y) pour obtenir un système à 2 équations et 2 inconnues, t et s — ne les confonds pas, chacune appartient à une seule droite.";
  }
}

/** Résultat partiel/système réduit, jamais résolu — voir l'en-tête de fichier pour le détail par
 * variante. */
export function formatAidePointNiveau2Latex(exercice: ExerciceIntersectionDroites): string {
  const { d1, d2 } = exercice;
  if (exercice.variante === "cart_cart") {
    const coefX = d1.implicite.a * d2.implicite.b - d2.implicite.a * d1.implicite.b;
    const constante = d1.implicite.c * d2.implicite.b - d2.implicite.c * d1.implicite.b;
    return `(${coefX})\\,x + (${constante}) = 0`;
  }
  if (exercice.variante === "param_cart") {
    const p = d1.parametriqueAffichee!;
    const d = d2.implicite;
    const coefT = d.a * p.a + d.b * p.b;
    const constante = d.a * p.x0 + d.b * p.y0 + d.c;
    return `(${coefT})\\,t + (${constante}) = 0`;
  }
  const p1 = d1.parametriqueAffichee!;
  const p2 = d2.parametriqueAffichee!;
  const ligne1 = `${formatSommeTermesGeneree([
    { valeur: p1.a, suffixe: "t" },
    { valeur: -p2.a, suffixe: "s" },
  ])} = ${p2.x0 - p1.x0}`;
  const ligne2 = `${formatSommeTermesGeneree([
    { valeur: p1.b, suffixe: "t" },
    { valeur: -p2.b, suffixe: "s" },
  ])} = ${p2.y0 - p1.y0}`;
  return `\\begin{cases} ${ligne1} \\\\ ${ligne2} \\end{cases}`;
}

// ============================================================================
// Panneau de résultat — révélation après épuisement des tentatives, toujours dérivée de
// `exercice` (jamais une saisie résiduelle de l'élève).
// ============================================================================

export function texteConclusionAttendue(exercice: ExerciceIntersectionDroites): string {
  return `Les droites d₁ et d₂ sont ${LIBELLE_CONCLUSION[exercice.conclusion].toLowerCase()}.`;
}

/** `null` ssi `conclusion !== "secantes"` — rien à révéler pour cet écran, jamais atteint. */
export function texteReponsePointAttendue(exercice: ExerciceIntersectionDroites): string | null {
  if (exercice.conclusion !== "secantes" || !exercice.point) return null;
  const partiel: string[] = [];
  if (exercice.tAttendu !== null) partiel.push(`t = ${exercice.tAttendu}`);
  if (exercice.sAttendu !== null) partiel.push(`s = ${exercice.sAttendu}`);
  const prefixe = partiel.length > 0 ? `${partiel.join(", ")}, ` : "";
  return `${prefixe}point d'intersection : (${exercice.point.x} ; ${exercice.point.y})`;
}
