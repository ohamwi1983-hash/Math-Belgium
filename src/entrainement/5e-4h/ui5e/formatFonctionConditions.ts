import type { ExerciceFonctionConditions, NatureConditions } from "../core5e/fonctionConditions";
import { idSysteme, optionsNature, systemes } from "../core5e/fonctionConditions";
import type { AideEcran, ChampEcran, Frag, OptionEcran } from "./ecransTrigo.types";
import { lx, tx } from "./ecransTrigo.types";
import { parL, plusL, polyL } from "./ecrituresLimitesLotG";
import { systemeL } from "./ecrituresApplicationsDerivees";

/**
 * Couche C — textes de `5gen69` « Déterminer une fonction par des conditions » : conditions,
 * consignes, champs, options (systèmes, nature), aides à deux niveaux, réponses. Source unique de
 * l'écran, du papier et du corrigé.
 */

type E = ExerciceFonctionConditions;
export type PhaseFonctionConditions = "directes" | "systeme" | "resolution" | "derivee" | "nature";
export const PHASES: PhaseFonctionConditions[] = ["directes", "systeme", "resolution", "derivee", "nature"];

// ============================================================================
// Écritures.
// ============================================================================

export const FORME = "f(x)=ax^3+bx^2+cx+d";
export const fxL = (e: E): string => polyL([e.a, e.b, e.c, e.d]);
export const fpxL = (e: E): string => polyL([3 * e.a, 2 * e.b, e.c]);
export const fppxL = (e: E): string => polyL([6 * e.a, 2 * e.b]);
/** Tangente en 0 : y = cx + d. */
export const tangenteL = (e: E): string => `y=${polyL([e.c, e.d])}`;
export const pointL = (x: number, y: number): string => `(${x}\\,;${y})`;
/** Point étudié (nature) : (x₀ ; y₀) ou (x₂ ; y₂) ; abscisse d'inflexion x₁. */
export const pointEtudieL = (e: E): string => pointL(e.xs, e.yp);
const estInflexion = (e: E) => e.variante === "inflexion";
/** f′ ou f″ selon la variante. */
export const deriveeEtudiee = (e: E): string => (estInflexion(e) ? "f''" : "f'");

/** Conditions (fragments), sans « On cherche… ». */
export function conditions(e: E): Frag[] {
  if (e.variante === "tangenteHorizontale")
    return [tx("la tangente d'équation "), lx(tangenteL(e)), tx(" au point d'abscisse 0, et une tangente horizontale au point "), lx(pointEtudieL(e))];
  if (e.variante === "inflexion")
    return [tx("la tangente d'équation "), lx(tangenteL(e)), tx(" au point d'abscisse 0 et un point d'inflexion d'abscisse "), lx(`${e.xs}`), tx(", et qui passe par le point "), lx(pointL(e.xp, e.yp))];
  return [tx("des tangentes horizontales aux points d'abscisses 0 et "), lx(`${e.xs}`), tx(", et qui passe par les points "), lx(pointL(0, e.d)), tx(" et "), lx(pointL(e.xs, e.yp))];
}

/** Libellé d'une nature (texte brut). */
export function libelleNature(n: NatureConditions, e: E): string {
  switch (n) {
    case "max":
      return "un maximum local";
    case "min":
      return "un minimum local";
    case "palier":
      return estInflexion(e) ? "pas de point d'inflexion (f″ ne change pas de signe)" : "ni maximum ni minimum (f′ ne change pas de signe)";
    case "concaveConvexe":
      return "concave puis convexe";
    case "convexeConcave":
      return "convexe puis concave";
  }
}

// ============================================================================
// Écrans.
// ============================================================================

export const LIBELLES: Record<PhaseFonctionConditions, string> = {
  directes: "Conditions directes : c et d",
  systeme: "Système en a et b",
  resolution: "Résolution du système",
  derivee: "Dérivée",
  nature: "Nature du point",
};

export function libelle(e: E, p: PhaseFonctionConditions): string {
  if (p === "derivee") return estInflexion(e) ? "Dérivée seconde" : "Dérivée";
  if (p === "nature") return estInflexion(e) ? "Concavité" : "Nature du point";
  return LIBELLES[p];
}

export function consigneGenerale(e: E): Frag[] {
  return [tx("On cherche une fonction "), lx(FORME), tx(" (a, b, c et d réels, "), lx("a\\neq 0"), tx(") dont la courbe admet "), ...conditions(e), tx(".")];
}

export function consigne(e: E, p: PhaseFonctionConditions): Frag[] {
  if (p === "directes") return [tx("Deux conditions donnent directement c et d : calcule "), lx("f(0)"), tx(" et "), lx("f'(0)"), tx(", puis donne c et d.")];
  if (p === "systeme") return [tx("Traduis les deux autres conditions par des équations en a et b (c et d sont connus). Quel système obtiens-tu ?")];
  if (p === "resolution") return [tx("Résous ce système : donne a et b.")];
  if (p === "derivee") return estInflexion(e) ? [tx("Écris "), lx("f''(x)"), tx(" avec les coefficients trouvés.")] : [tx("Écris "), lx("f'(x)"), tx(" avec les coefficients trouvés.")];
  if (estInflexion(e)) return [tx("Étudie le signe de "), lx("f''"), tx(" de part et d'autre de "), lx(`x=${e.xs}`), tx(". Comment la concavité de la courbe change-t-elle ?")];
  return [tx("Étudie le signe de "), lx("f'"), tx(" de part et d'autre de "), lx(`x=${e.xs}`), tx(". Le point "), lx(pointEtudieL(e)), tx(" est-il un maximum local, un minimum local, ou ni l'un ni l'autre ?")];
}

export function optionsSysteme(e: E): OptionEcran[] {
  const s = systemes(e);
  return e.ordre.map((k) => ({ id: idSysteme(k), fragments: [lx(systemeL(s[k]![0], s[k]![1]))] }));
}

export function optionsNatureEcran(e: E): OptionEcran[] {
  return optionsNature(e).map((n) => ({ id: n, fragments: [tx(libelleNature(n, e))] }));
}

const RACCOURCIS_X = [
  { libelle: "x", texte: "x" },
  { libelle: "x²", texte: "x²" },
];

export function champs(e: E, p: PhaseFonctionConditions): ChampEcran[] {
  if (p === "directes")
    return [
      { label: "c", labelLatex: "c=", placeholder: "ex. : −4" },
      { label: "d", labelLatex: "d=", placeholder: "ex. : 3" },
    ];
  if (p === "resolution")
    return [
      { label: "a", labelLatex: "a=", placeholder: "ex. : 2" },
      { label: "b", labelLatex: "b=", placeholder: "ex. : −6" },
    ];
  return [{ label: estInflexion(e) ? "f″(x)" : "f′(x)", labelLatex: `${deriveeEtudiee(e)}(x)=`, placeholder: estInflexion(e) ? "ex. : 12x − 6" : "ex. : 6x² − 12x + 1", apercu: true, raccourcis: RACCOURCIS_X }];
}

/** Équation substituée (« 3a·2² + 2b·2 + (−3) = 0 ») d'une condition, pour l'aide et le corrigé. */
export function substitutionsSysteme(e: E): [string, string] {
  const { c, d, xs: x, xp, yp } = e;
  const X = parL(x);
  if (e.variante === "inflexion") {
    const P = parL(xp);
    return [`6a\\cdot ${X}+2b=0`, `a\\cdot ${P}^3+b\\cdot ${P}^2${plusL(c * xp)}${plusL(d)}=${yp}`];
  }
  if (e.variante === "deuxTangentes") return [`3a\\cdot ${X}^2+2b\\cdot ${X}=0`, `a\\cdot ${X}^3+b\\cdot ${X}^2${plusL(d)}=${yp}`];
  return [`3a\\cdot ${X}^2+2b\\cdot ${X}${plusL(c)}=0`, `a\\cdot ${X}^3+b\\cdot ${X}^2${plusL(c * x)}${plusL(d)}=${yp}`];
}

/** Forme factorisée de f′ (f″ pour l'inflexion), pour l'aide et le corrigé. */
export function factoriseeL(e: E): string {
  const k = (v: number) => (v === 1 ? "" : v === -1 ? "-" : `${v}`);
  const fac = (r: number) => (r === 0 ? "x" : `(x${plusL(-r)})`);
  if (e.variante === "inflexion") return `${6 * e.a}${fac(e.xs)}`;
  if (e.variante === "deuxTangentes") return `${k(3 * e.a)}x${fac(e.xs)}`;
  if (e.autre === e.xs) return `${k(3 * e.a)}${fac(e.xs)}^2`;
  return `${k(3 * e.a)}${fac(e.xs)}${fac(e.autre)}`;
}

export function aide1(e: E, p: PhaseFonctionConditions): AideEcran {
  if (p === "directes") {
    if (e.variante === "deuxTangentes") return { texte: [tx("Une tangente horizontale a une pente nulle : "), lx("f'(0)=0"), tx(". Un point de la courbe vérifie "), lx("y=f(x)"), tx(".")] };
    return { texte: [tx("La tangente au point d'abscisse 0 passe par "), lx("(0\\,;f(0))"), tx(" et a pour pente "), lx("f'(0)"), tx(" :")], latex: "y=f'(0)\\,x+f(0)" };
  }
  if (p === "systeme") {
    if (estInflexion(e)) return { texte: [tx("Un point d'inflexion annule "), lx("f''"), tx(" ; un point de la courbe vérifie "), lx("f(x)=y"), tx(" :")], latex: "f''(x)=6ax+2b" };
    return { texte: [tx("Une tangente horizontale en "), lx("x_0"), tx(" donne "), lx("f'(x_0)=0"), tx(" ; un point de la courbe donne "), lx("f(x_0)=y_0"), tx(" :")], latex: "f'(x)=3ax^2+2bx+c" };
  }
  if (p === "resolution") return { texte: [tx("Élimine une inconnue : exprime b dans une équation et remplace-le dans l'autre, ou multiplie les équations pour que les termes en b soient opposés, puis additionne.")] };
  if (p === "derivee") return estInflexion(e) ? { texte: [tx("Dérive deux fois :")], latex: "f'(x)=3ax^2+2bx+c\\qquad f''(x)=6ax+2b" } : { texte: [tx("Dérive terme à terme :")], latex: "f'(x)=3ax^2+2bx+c" };
  if (estInflexion(e)) return { texte: [tx("La courbe est concave là où "), lx("f''<0"), tx(" et convexe là où "), lx("f''>0"), tx(" ; il y a inflexion si "), lx("f''"), tx(" change de signe.")] };
  return { texte: [tx("En un point où "), lx("f'"), tx(" s'annule, il y a un extremum seulement si "), lx("f'"), tx(" change de signe : de + à − c'est un maximum, de − à + un minimum (cours, point 5).")] };
}

export function aide2(e: E, p: PhaseFonctionConditions): AideEcran | null {
  if (p === "directes") return { texte: [tx("Avec "), lx(FORME), tx(", on a :")], latex: "f(0)=d\\qquad f'(0)=c" };
  if (p === "systeme") {
    const [s1, s2] = substitutionsSysteme(e);
    return { texte: [tx("Remplace x et les coefficients connus, puis simplifie chaque égalité :")], latex: `${s1}\\qquad ${s2}` };
  }
  if (p === "resolution") return { texte: [tx("Une fois a trouvé, remplace-le dans l'équation la plus simple pour obtenir b.")] };
  if (p === "derivee") return estInflexion(e) ? { texte: [tx("Remplace a et b par leurs valeurs :")], latex: `f''(x)=6\\cdot ${parL(e.a)}\\,x+2\\cdot ${parL(e.b)}` } : { texte: [tx("Remplace a, b et c par leurs valeurs :")], latex: `f'(x)=3\\cdot ${parL(e.a)}\\,x^2+2\\cdot ${parL(e.b)}\\,x${plusL(e.c)}` };
  return { texte: [tx("Écris "), lx(deriveeEtudiee(e)), tx(" sous forme factorisée et regarde le signe de chaque facteur juste avant et juste après "), lx(`x=${e.xs}`), tx(" :")], latex: `${deriveeEtudiee(e)}(x)=${factoriseeL(e)}` };
}

export function reponse(e: E, p: PhaseFonctionConditions): Frag[] {
  if (p === "directes") return [lx(`c=${e.c}`), tx(" et "), lx(`d=${e.d}`)];
  if (p === "systeme") {
    const s = systemes(e)[0]!;
    return [lx(systemeL(s[0], s[1]))];
  }
  if (p === "resolution") return [lx(`a=${e.a}`), tx(" et "), lx(`b=${e.b}`), tx(", donc "), lx(`f(x)=${fxL(e)}`)];
  if (p === "derivee") return [lx(`${deriveeEtudiee(e)}(x)=${estInflexion(e) ? fppxL(e) : fpxL(e)}`)];
  if (estInflexion(e)) return [tx(`La courbe est ${libelleNature(e.nature, e)} : point d'inflexion d'abscisse `), lx(`${e.xs}`), tx(".")];
  if (e.nature === "palier") return [tx("Ni maximum ni minimum : "), lx("f'"), tx(" s'annule en "), lx(`x=${e.xs}`), tx(" sans changer de signe.")];
  return [lx(pointEtudieL(e)), tx(` est ${libelleNature(e.nature, e)}.`)];
}

export const recap = reponse;

export function messageIllisible(e: E, p: PhaseFonctionConditions): string {
  if (p === "derivee") return `Expression non reconnue : écris un polynôme en x, par exemple ${estInflexion(e) ? "12x − 6" : "6x² − 12x + 1 (ou 6x^2 − 12x + 1)"}. Cette saisie ne compte pas comme une tentative.`;
  return "Nombre non reconnu : écris un entier, par exemple 3 ou −2. Cette saisie ne compte pas comme une tentative.";
}
