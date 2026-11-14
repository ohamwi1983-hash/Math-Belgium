import type { ExerciceTangentesLog, TexteAvecLatex } from "../core6e/tangentesLogarithmiques.types";
import type { PhaseTangentesLog } from "../moteur6e/typesTangentesLogarithmiques";
import { entier, latexComb, latexEquation, latexEquationNonDeveloppee } from "../generateurs6e/tangentesLogarithmiques/exact";
import { logLatex } from "../generateurs6e/tangentesLogarithmiques/familles";

/**
 * Couche C (6e) — textes de `6gen87` « Tangentes aux courbes logarithmiques ». SOURCE UNIQUE des
 * consignes, aides et réponses attendues : l'écran, le récapitulatif et l'adaptateur de feuilles
 * (`generateurs6e/tangentesLogarithmiques/exportEvaluation.ts`) en dérivent.
 *
 * Règles permanentes : aucune formule écrite au clavier dans un texte (les formules vont dans
 * `latex`), « − » typographique, jamais de prose en mode math, aides sans la réponse finale.
 */

export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

export interface ChampDef {
  label: string;
  placeholder: string;
}

export type AideAvecLatex = TexteAvecLatex;

const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

// ============================================================================
// Écritures.
// ============================================================================

export function x0Latex(e: ExerciceTangentesLog, i = 0): string {
  return latexComb(e.contacts[i].x0);
}

export function pointP(e: ExerciceTangentesLog): string {
  return e.variante === "origine" ? `P(0\\,;\\,${latexComb(e.pP)})` : "";
}

export function droiteD(e: ExerciceTangentesLog): string {
  return e.variante === "parallele" ? latexEquation(e.m, entier(e.h)) : "";
}

export function penteD(e: ExerciceTangentesLog): string {
  return e.variante === "parallele" ? latexComb(e.m) : "";
}

/** « −2 » typographique pour un libellé en texte brut. */
function entierTexte(n: number): string {
  return n < 0 ? `−${-n}` : `${n}`;
}

// ============================================================================
// Énoncé.
// ============================================================================

export function consigneGenerale(e: ExerciceTangentesLog): FragmentConsigne[] {
  const f = l(`f(x)=${e.fonction.fLatex}`);
  switch (e.variante) {
    case "point":
      return [t("On considère la fonction "), f, t(" et son graphique "), l("C_f"), t(". Détermine l'équation de la tangente à "), l("C_f"), t(" au point d'abscisse "), l(`x_0=${x0Latex(e)}`), t(".")];
    case "parallele":
      return [t("On considère la fonction "), f, t(" et son graphique "), l("C_f"), t(". Détermine les équations de toutes les tangentes à "), l("C_f"), t(" parallèles à la droite "), l(`d\\,:\\,${droiteD(e)}`), t(".")];
    case "origine":
      return [
        t("On considère la fonction "),
        f,
        t(" et son graphique "),
        l("C_f"),
        t(". Détermine l'équation de la tangente à "),
        l("C_f"),
        t(" qui passe par le point "),
        l(pointP(e)),
        t(e.pP.length === 0 ? ", origine du repère." : "."),
      ];
  }
}

export function blocDonnees(e: ExerciceTangentesLog): string[] {
  const f = `f(x)=${e.fonction.fLatex}`;
  switch (e.variante) {
    case "point":
      return [f, `x_0=${x0Latex(e)}`];
    case "parallele":
      return [f, `d\\,:\\,${droiteD(e)}`];
    case "origine":
      return [f, pointP(e)];
  }
}

export function consigneEcran(e: ExerciceTangentesLog, phase: PhaseTangentesLog): FragmentConsigne[] {
  const Y = l("y=mx+p");
  switch (phase) {
    case "derivee":
      return [t("Calcule "), l("f'(x)"), t(".")];
    case "valeurs":
      return [t("Calcule les valeurs exactes de "), l(`f\\left(${x0Latex(e)}\\right)`), t(" et de "), l(`f'\\left(${x0Latex(e)}\\right)`), t(".")];
    case "equation":
      return e.variante === "origine"
        ? [t("Remplace "), l("a"), t(" par la valeur trouvée : écris l'équation de cette tangente sous la forme "), Y, t(".")]
        : [t("Écris l'équation de la tangente au point d'abscisse "), l(x0Latex(e)), t(", sous la forme "), Y, t(".")];
    case "solutions":
      return [
        t("Une tangente parallèle à "),
        l("d"),
        t(" a la même pente que "),
        l("d"),
        t(". Résous "),
        l(`f'(x)=${penteD(e)}`),
        t(" dans le domaine de f et donne toutes les abscisses des points de contact (une valeur par ligne)."),
      ];
    case "equations":
      return [t("Écris l'équation de chaque tangente parallèle à "), l("d"), t(", sous la forme "), Y, t(".")];
    case "tangenteA":
      return [t("Soit "), l("a"), t(" un réel du domaine de f. Écris l'équation de la tangente à "), l("C_f"), t(" au point d'abscisse "), l("a"), t(", en fonction de "), l("x"), t(" et de "), l("a"), t(".")];
    case "valeurA":
      return [t("Cette tangente passe par "), l(pointP(e)), t(". Déduis-en la valeur exacte de "), l("a"), t(".")];
  }
}

export function champsEcran(e: ExerciceTangentesLog, phase: PhaseTangentesLog): ChampDef[] {
  switch (phase) {
    case "derivee":
      return [{ label: "f′(x) =", placeholder: "ex. 3/(x+1) - ln(x)" }];
    case "valeurs":
      return [
        { label: "f(x₀) =", placeholder: "ex. 2ln(3) + 1" },
        { label: "f′(x₀) =", placeholder: "ex. 1/e^2" },
      ];
    case "equation":
      return [{ label: "Tangente :", placeholder: "ex. y = 2x - ln(3)" }];
    case "equations":
      return e.contacts.map((c) => ({ label: `Tangente au point d'abscisse ${entierTexte(c.x0.length === 0 ? 0 : c.x0[0].n)} :`, placeholder: "ex. y = x/2 + ln(5)" }));
    case "tangenteA":
      return [{ label: "Tangente en a :", placeholder: "y = … (avec x et a)" }];
    case "valeurA":
      return [{ label: "a =", placeholder: "valeur exacte, ex. 2e^3" }];
    case "solutions":
      return [{ label: "x =", placeholder: "ex. -1/2" }];
  }
}

// ============================================================================
// Aides (jamais la réponse : il reste toujours un calcul).
// ============================================================================

function rappelValeurs(e: ExerciceTangentesLog): AideAvecLatex {
  const f = e.fonction;
  switch (f.famille) {
    case "logBase": {
      const base = Number(/\\ln\((\d+)\)/.exec(f.dfLatex)?.[1] ?? "10");
      return { texte: "Rappel :", latex: `${logLatex(base, `${base}^{n}`)}=n,\\qquad ${logLatex(base, "1")}=0` };
    }
    case "lnAffine":
    case "lnQuad":
      return { texte: "Rappel (le logarithme d'un autre entier se laisse tel quel dans une valeur exacte) :", latex: "\\ln(1)=0" };
    default:
      return { texte: "Rappels :", latex: "\\ln(1)=0,\\qquad\\ln\\left(e^{n}\\right)=n,\\qquad\\ln\\left(\\dfrac{1}{e}\\right)=-1" };
  }
}

export function aideNiveau1(e: ExerciceTangentesLog, phase: PhaseTangentesLog): AideAvecLatex {
  const f = e.fonction;
  switch (phase) {
    case "derivee":
      return f.regle;
    case "valeurs": {
      const x0 = x0Latex(e);
      return { texte: "Remplace x par la valeur de x₀ dans les expressions de f(x) et de f′(x), puis simplifie :", latex: `f\\left(${x0}\\right)=${f.fDe(x0)},\\qquad f'\\left(${x0}\\right)=${f.dfDe(x0)}` };
    }
    case "equation":
      return e.variante === "origine"
        ? { texte: "Il suffit de calculer la pente au point de contact trouvé :", latex: `f'(a)=${e.dfaLatex}` }
        : { texte: "Équation de la tangente au point d'abscisse x₀ :", latex: "y=f'(x_0)(x-x_0)+f(x_0)" };
    case "solutions":
      return { texte: "Deux droites parallèles ont la même pente : résous, dans le domaine de f, l'équation :", latex: `${f.dfLatex}=${penteD(e)}` };
    case "equations":
      return { texte: "Équation de la tangente au point d'abscisse x₀ :", latex: "y=f'(x_0)(x-x_0)+f(x_0)" };
    case "tangenteA":
      return { texte: "Équation de la tangente au point d'abscisse a :", latex: "y=f'(a)(x-a)+f(a)" };
    case "valeurA":
      return e.variante === "origine"
        ? { texte: "P appartient à la tangente : remplace x par 0 et y par l'ordonnée de P :", latex: e.substitution }
        : { texte: "" };
  }
}

export function aideNiveau2(e: ExerciceTangentesLog, phase: PhaseTangentesLog): AideAvecLatex {
  const f = e.fonction;
  switch (phase) {
    case "derivee":
      return f.detail;
    case "valeurs":
      return rappelValeurs(e);
    case "equation":
      return e.variante === "origine"
        ? { texte: "La tangente passe par P : son ordonnée à l'origine est donc l'ordonnée de P :", latex: `p=${latexComb(e.pP)}` }
        : { texte: "Avec les valeurs de l'étape précédente, il reste à développer :", latex: latexEquationNonDeveloppee(e.contacts[0]) };
    case "solutions":
      return e.variante === "parallele"
        ? { texte: "En chassant le dénominateur, on obtient l'équation suivante ; garde seulement ses solutions qui appartiennent au domaine de f :", latex: e.equationSecondDegre }
        : { texte: "" };
    case "equations":
      return { texte: "Pour chaque abscisse x₀ trouvée, calcule f(x₀) ; la pente vaut toujours celle de d :", latex: `f'(x_0)=${penteD(e)}` };
    case "tangenteA":
      return e.variante === "origine" ? { texte: "Ici :", latex: `f(a)=${e.faLatex},\\qquad f'(a)=${e.dfaLatex}` } : { texte: "" };
    case "valeurA":
      return e.variante === "origine" ? { texte: e.texteSimplifiee, latex: e.simplifiee } : { texte: "" };
  }
}

// ============================================================================
// Réponses attendues, libellés.
// ============================================================================

export function formatReponseAttendueLatex(e: ExerciceTangentesLog, phase: PhaseTangentesLog): string[] {
  const c = e.contacts[0];
  switch (phase) {
    case "derivee":
      return [`f'(x)=${e.fonction.dfLatex}`];
    case "valeurs":
      return [`f\\left(${x0Latex(e)}\\right)=${latexComb(c.fx0)}`, `f'\\left(${x0Latex(e)}\\right)=${latexComb(c.dfx0)}`];
    case "equation":
      return [latexEquation(c.m, c.p)];
    case "equations":
      return e.contacts.map((k) => latexEquation(k.m, k.p));
    case "solutions":
      return e.contacts.map((k) => `x=${latexComb(k.x0)}`);
    case "tangenteA":
      return e.variante === "origine" ? [e.equationEnA] : [];
    case "valeurA":
      return [`a=${latexComb(c.x0)}`];
  }
}

export function libellePhase(_e: ExerciceTangentesLog, phase: PhaseTangentesLog): string {
  switch (phase) {
    case "derivee":
      return "Dérivée";
    case "valeurs":
      return "f(x₀) et f′(x₀)";
    case "equation":
      return "Équation de la tangente";
    case "solutions":
      return "Points de contact";
    case "equations":
      return "Équations des tangentes";
    case "tangenteA":
      return "Tangente au point d'abscisse a";
    case "valeurA":
      return "Valeur de a";
  }
}
