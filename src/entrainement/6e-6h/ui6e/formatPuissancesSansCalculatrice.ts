import type { ExerciceComparer, ExerciceInverse, ExercicePuissances, ExerciceSimplifier, Relation } from "../core6e/puissancesSansCalculatrice.types";
import type { AideEcran, ChampEcran, Frag, OptionEcran } from "./ecransExp.types";
import { lx, tx } from "./ecransExp.types";
import { affineL, coefL, decL, q, qL } from "./nombresExp";
import type { Q } from "./nombresExp";

/**
 * Couche C — textes de 6gen146 « Puissances à exposant réel : calculer et comparer sans
 * calculatrice » : consignes, champs, aides à deux niveaux, réponses, écritures exactes. Source
 * unique de l'écran, du récapitulatif, du corrigé détaillé et du papier.
 */

type E = ExercicePuissances;
export type PhasePuissances = "exposant" | "valeur" | "exposants" | "sens" | "conclusion";

export function phases(e: E): PhasePuissances[] {
  return e.variante === "comparer" ? ["exposants", "sens", "conclusion"] : ["exposant", "valeur"];
}

export const COURS_PUISSANCES = "(cours, point 1)";

// ============================================================================
// Écritures.
// ============================================================================

/** p + r√k (p, r entiers ; p = 0 → r√k seul). */
export function sommeRacL(p: number, r: number, k: number): string {
  const rac = `\\sqrt{${k}}`;
  if (r === 0) return `${p}`;
  if (p === 0) return `${coefL(r)}${rac}`;
  return `${p}${r < 0 ? "-" : "+"}${Math.abs(r) === 1 ? "" : Math.abs(r)}${rac}`;
}

/** Les deux exposants (ou l'exposant intérieur et extérieur) de `simplifier`. */
export function exposantsSimplifier(e: ExerciceSimplifier): [string, string] {
  switch (e.sousType) {
    case "produit":
      return [sommeRacL(e.p, e.r, e.k), sommeRacL(e.s, -e.r, e.k)];
    case "quotient":
      return [sommeRacL(e.p, e.r, e.k), sommeRacL(e.s, e.r, e.k)];
    case "puissance":
      return [`\\sqrt{${e.k}}`, `${coefL(e.r)}\\sqrt{${e.k}}`];
    case "base":
      return [sommeRacL(0, e.r, e.k), sommeRacL(e.s, -2 * e.r, e.k)];
  }
}

export function expressionSimplifierL(e: ExerciceSimplifier): string {
  const [u, v] = exposantsSimplifier(e);
  switch (e.sousType) {
    case "produit":
      return `${e.a}^{${u}}\\cdot ${e.a}^{${v}}`;
    case "quotient":
      return `\\dfrac{${e.a}^{${u}}}{${e.a}^{${v}}}`;
    case "puissance":
      return `\\left(${e.a}^{${u}}\\right)^{${v}}`;
    case "base":
      return `${e.a * e.a}^{${u}}\\cdot ${e.a}^{${v}}`;
  }
}

/** aⁿ en valeur exacte (fraction 1/a^|n| pour n < 0). */
export function puissanceExacte(a: number, n: number): Q {
  return n >= 0 ? q(a ** n) : q(1, a ** -n);
}

/** Base entre parenthèses si elle n'est pas un entier (fraction, décimal, e reste seule). */
export function baseL(latex: string): string {
  return /^[0-9]+$|^e$/.test(latex) ? latex : `\\left(${latex}\\right)`;
}

export function puissanceComparerL(e: ExerciceComparer, cote: "gauche" | "droite"): string {
  return `${baseL(e.base.latex)}^{${e[cote].latex}}`;
}

export const RELATION_L: Record<Relation, string> = { "<": "<", "=": "=", ">": ">" };

/** Écriture d'une base décimale 1/a^i (0,5 ; 0,25 ; 0,125 ; 0,2 ; 0,04). */
export function baseDecimaleL(a: number, i: number): string {
  return decL(1 / a ** i);
}

export function expressionInverseL(e: ExerciceInverse): string {
  const unSurA = `\\left(\\dfrac{1}{${e.a}}\\right)`;
  switch (e.sousType) {
    case "inverse":
      return `${unSurA}^{${affineL(-e.i, e.p)}}`;
    case "produit":
      return `${unSurA}^{${coefL(e.i)}x}\\cdot ${e.a ** e.j}^{x}`;
    case "quotient":
      return `\\dfrac{${e.a ** e.j}^{x}}{${e.a}^{${affineL(1, e.p)}}}`;
    case "decimale":
      return `\\left(${baseDecimaleL(e.a, e.i)}\\right)^{x}\\cdot ${e.a ** e.j}^{x}`;
  }
}

export const exposantInverseL = (e: ExerciceInverse): string => affineL(e.m, e.c);
export const valeurInverse = (e: ExerciceInverse): Q => puissanceExacte(e.a, e.m * e.x0 + e.c);

/** Réponse attendue de l'écran (fragments) — aussi la ligne « Résultat » du corrigé. */
export function reponse(e: E, phase: PhasePuissances): Frag[] {
  if (e.variante === "simplifier") {
    if (phase === "exposant") return [lx(`E=${e.a}^{${e.n}}`)];
    return [lx(`E=${qL(puissanceExacte(e.a, e.n))}`)];
  }
  if (e.variante === "inverse") {
    if (phase === "exposant") return [lx(`f(x)=${e.a}^{${exposantInverseL(e)}}`)];
    return [lx(`f(${e.x0})=${qL(valeurInverse(e))}`)];
  }
  if (phase === "exposants") return [lx(`${e.gauche.latex}${e.relationExposants}${e.droite.latex}`)];
  if (phase === "sens") return [lx(`x\\mapsto ${baseL(e.base.latex)}^{x}`), tx(e.croissante ? " est croissante sur ℝ" : " est décroissante sur ℝ")];
  return [lx(`${puissanceComparerL(e, "gauche")}${e.relation}${puissanceComparerL(e, "droite")}`)];
}

export const recap = reponse;

// ============================================================================
// Consignes et champs.
// ============================================================================

export function consigneGenerale(e: E): Frag[] {
  if (e.variante === "simplifier") return [tx("Sans calculatrice, on veut la valeur exacte de "), lx(`E=${expressionSimplifierL(e)}`), tx(".")];
  if (e.variante === "inverse") return [tx("On donne "), lx(`f(x)=${expressionInverseL(e)}`), tx(", pour tout réel "), lx("x"), tx(".")];
  return [tx("Sans calculatrice, compare "), lx(`A=${puissanceComparerL(e, "gauche")}`), tx(" et "), lx(`B=${puissanceComparerL(e, "droite")}`), tx(".")];
}

export function consigne(e: E, phase: PhasePuissances): Frag[] {
  if (e.variante === "simplifier") {
    if (phase === "exposant") return [tx("Écris "), lx("E"), tx(" comme une seule puissance de "), lx(`${e.a}`), tx(" : donne l'exposant "), lx("n"), tx(" tel que "), lx(`E=${e.a}^{n}`), tx(".")];
    return [tx("Donne la valeur exacte de "), lx("E"), tx(" (un entier ou une fraction).")];
  }
  if (e.variante === "inverse") {
    if (phase === "exposant") return [tx("Écris "), lx("f(x)"), tx(" comme une seule puissance de "), lx(`${e.a}`), tx(" : donne son exposant, une expression en "), lx("x"), tx(".")];
    return [tx("Calcule la valeur exacte de "), lx(`f(${e.x0})`), tx(".")];
  }
  if (phase === "exposants") return [tx("Compare les deux exposants "), lx(e.gauche.latex), tx(" et "), lx(e.droite.latex), tx(".")];
  if (phase === "sens") return [tx("Quel est le sens de variation de la fonction "), lx(`x\\mapsto ${baseL(e.base.latex)}^{x}`), tx(" sur ℝ ?")];
  return [tx("Conclus : compare "), lx("A"), tx(" et "), lx("B"), tx(".")];
}

export function libelle(e: E, phase: PhasePuissances): string {
  switch (phase) {
    case "exposant":
      return e.variante === "inverse" ? "Une seule puissance" : "Une seule puissance de " + (e as ExerciceSimplifier).a;
    case "valeur":
      return "Valeur exacte";
    case "exposants":
      return "Ordre des exposants";
    case "sens":
      return "Sens de variation";
    case "conclusion":
      return "Conclusion";
  }
}

export function champs(e: E, phase: PhasePuissances): ChampEcran[] {
  if (e.variante === "simplifier") {
    if (phase === "exposant") return [{ label: "Exposant n", labelLatex: "n=", placeholder: "ex. : 7" }];
    return [{ label: "Valeur exacte de E", labelLatex: "E=", placeholder: "ex. : 1/49" }];
  }
  const ex = e as ExerciceInverse;
  if (phase === "exposant") return [{ label: "Exposant (expression en x)", labelLatex: `f(x)=${ex.a}^{\\,\\ldots}\\quad\\text{exposant :}`, placeholder: "ex. : 5x + 4" }];
  return [{ label: `Valeur exacte de f(${ex.x0})`, labelLatex: `f(${ex.x0})=`, placeholder: "ex. : 1/49" }];
}

export function options(e: ExerciceComparer, phase: PhasePuissances): OptionEcran[] {
  if (phase === "sens") return [
    { id: "croissante", fragments: [tx("Croissante")] },
    { id: "decroissante", fragments: [tx("Décroissante")] },
  ];
  const [g, d] = phase === "exposants" ? [e.gauche.latex, e.droite.latex] : [puissanceComparerL(e, "gauche"), puissanceComparerL(e, "droite")];
  return (["<", "=", ">"] as Relation[]).map((r) => ({ id: r, fragments: [lx(`${g}${r}${d}`)] }));
}

export function idAttendu(e: ExerciceComparer, phase: PhasePuissances): string {
  if (phase === "exposants") return e.relationExposants;
  if (phase === "sens") return e.croissante ? "croissante" : "decroissante";
  return e.relation;
}

export function messageIllisible(e: E, phase: PhasePuissances): string {
  if (e.variante === "inverse" && phase === "exposant") return "Je n'arrive pas à lire ton exposant (exemples d'écritures acceptées : 2x − 3, −x, 3*x + 1). Cela ne compte pas comme une tentative.";
  return "Je n'arrive pas à lire ta réponse (exemples d'écritures acceptées : 9, −2, 1/8, 2^(−3), 1+√3−√3). Cela ne compte pas comme une tentative.";
}

// ============================================================================
// Aides (deux niveaux : la règle du cours, puis son application à l'instance — jamais la réponse).
// ============================================================================

const REGLE_1 = "a^{r}\\cdot a^{s}=a^{r+s}";
const REGLE_2 = "\\dfrac{a^{r}}{a^{s}}=a^{r-s}";
const REGLE_4 = "\\left(a^{r}\\right)^{s}=a^{r\\cdot s}";

export function aide1(e: E, phase: PhasePuissances): AideEcran {
  if (e.variante === "simplifier") {
    if (phase === "valeur") return { texte: [tx("Un exposant négatif donne un inverse :")], latex: "a^{-n}=\\dfrac{1}{a^{n}}" };
    if (e.sousType === "produit") return { texte: [tx("Règle (1) du cours, valable pour tous les exposants réels :")], latex: REGLE_1 };
    if (e.sousType === "quotient") return { texte: [tx("Règle (2) du cours, valable pour tous les exposants réels :")], latex: REGLE_2 };
    if (e.sousType === "puissance") return { texte: [tx("Règle (4) du cours, valable pour tous les exposants réels :")], latex: REGLE_4 };
    return { texte: [tx("Écris d'abord "), lx(`${e.a * e.a}`), tx(" comme une puissance de "), lx(`${e.a}`), tx(", puis utilise les règles (4) et (1) :")], latex: `${REGLE_4}\\qquad ${REGLE_1}` };
  }
  if (e.variante === "inverse") {
    if (phase === "valeur") return { texte: [tx("Remplace "), lx("x"), tx(" dans l'exposant trouvé, puis calcule la puissance ; un exposant négatif donne un inverse :")], latex: "a^{-n}=\\dfrac{1}{a^{n}}" };
    return { texte: [tx("Écris chaque base comme une puissance de "), lx(`${e.a}`), tx(" ; par exemple "), lx("\\dfrac{1}{a}=a^{-1}"), tx(". Puis règles (4) et (1) ou (2) :")], latex: `${REGLE_4}\\qquad ${REGLE_1}` };
  }
  if (phase === "exposants") return e.genre === "pi" ? { texte: [tx("Utilise une valeur approchée de "), lx("\\pi"), tx(" connue du cours : "), lx("\\pi\\approx 3{,}14159")] } : { texte: [tx("Deux nombres positifs sont rangés dans le même ordre que leurs carrés : compare les carrés, sans calculatrice.")] };
  if (phase === "sens") return { texte: [tx("La fonction "), lx("x\\mapsto a^{x}"), tx(" est croissante si "), lx("a>1"), tx(", décroissante si "), lx("0<a<1"), tx(".")] };
  return { texte: [tx("Une fonction croissante conserve l'ordre ; une fonction décroissante l'inverse.")] };
}

export function aide2(e: E, phase: PhasePuissances): AideEcran | null {
  if (e.variante === "simplifier") {
    if (phase === "valeur") return { texte: [tx("Calcule "), lx(`${e.a}^{${Math.abs(e.n)}}`), tx(e.n < 0 ? " puis prends son inverse." : " de tête.")] };
    if (e.sousType === "puissance") return { texte: [tx("Multiplie les deux exposants : "), lx(`\\sqrt{${e.k}}\\cdot\\sqrt{${e.k}}=${e.k}`), tx(".")] };
    if (e.sousType === "base") return { texte: [lx(`${e.a * e.a}=${e.a}^{2}`), tx(", donc "), lx(`${e.a * e.a}^{u}=${e.a}^{2u}`), tx(" ; additionne ensuite les deux exposants : les termes en "), lx(`\\sqrt{${e.k}}`), tx(" se compensent.")] };
    return { texte: [tx(e.sousType === "produit" ? "Additionne les deux exposants" : "Soustrais les deux exposants (attention aux parenthèses)"), tx(" : regroupe les nombres entiers d'un côté, les termes en "), lx(`\\sqrt{${e.k}}`), tx(" de l'autre — ces derniers se compensent.")] };
  }
  if (e.variante === "inverse") {
    if (phase === "valeur") return { texte: [tx("Remplace "), lx("x"), tx(" par "), lx(`${e.x0 < 0 ? `(${e.x0})` : e.x0}`), tx(" dans l'exposant, calcule-le, puis la puissance de "), lx(`${e.a}`), tx(".")] };
    const ecritures: string[] = [];
    if (e.sousType === "decimale") ecritures.push(`${baseDecimaleL(e.a, e.i)}=\\dfrac{1}{${e.a ** e.i}}=${e.a}^{-${e.i}}`);
    else if (e.sousType !== "quotient") ecritures.push(`\\dfrac{1}{${e.a}}=${e.a}^{-1}`);
    if (e.sousType !== "inverse") ecritures.push(`${e.a ** e.j}=${e.a}^{${e.j}}`);
    return { texte: [tx("Ici :")], latex: ecritures.join("\\qquad ") };
  }
  if (phase === "exposants") {
    if (e.genre === "pi") return { texte: [tx("Compare "), lx("3{,}14159"), tx(" et "), lx(e.gauche.latex === "\\pi" ? e.droite.latex : e.gauche.latex), tx(" chiffre par chiffre.")] };
    return {
      texte: [
        tx("Calcule "),
        lx(`\\left(${e.gauche.latex}\\right)^{2}`),
        tx(" et "),
        lx(`\\left(${e.droite.latex}\\right)^{2}`),
        ...(e.genre === "egaux" ? [tx(" (rappel : "), lx("\\left(m\\sqrt{k}\\right)^{2}=m^{2}\\cdot k"), tx("), puis compare-les.")] : [tx(", puis compare-les.")]),
      ],
    };
  }
  if (phase === "sens") return { texte: [tx("Compare la base "), lx(e.base.latex), tx(" au nombre 1.")] };
  return { texte: [tx("Combine l'ordre des exposants (premier écran) et le sens de variation (deuxième écran).")] };
}

/** Choix fermé faux : explication affichée avec la réponse. */
export function explicationChoix(e: E, phase: PhasePuissances): string {
  if (e.variante !== "comparer") return "";
  if (phase === "sens") return e.croissante ? "La base est plus grande que 1." : "La base est comprise entre 0 et 1.";
  if (phase === "conclusion") return e.croissante ? "Base > 1 : les puissances sont rangées comme leurs exposants." : "Base entre 0 et 1 : l'ordre des exposants s'inverse.";
  return "";
}
