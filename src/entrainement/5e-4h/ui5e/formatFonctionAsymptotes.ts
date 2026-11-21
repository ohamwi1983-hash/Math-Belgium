import type { ExerciceFonctionAsymptotes } from "../core5e/fonctionAsymptotes";
import { estGraphique, estOblique, FENETRE, fonction, limiteDroite, numerateurEnP } from "../core5e/fonctionAsymptotes";
import type { AideEcran, ChampEcran, Frag } from "./ecransTrigo.types";
import { lx, tx } from "./ecransTrigo.types";
import { limiteL, limL, parL, plusL, pointC, polyL } from "./ecrituresLimitesLotG";
import type { SpecGraphe } from "./figureLimitesLotG";
import { grapheSvg } from "./figureLimitesLotG";

/**
 * Couche C — textes et figure de `5gen65` « Retrouver une fonction à partir de ses asymptotes » :
 * forme, données, consignes, champs, aides à deux niveaux, réponses ; figure (énoncé des variantes
 * graphiques, figure annotée du corrigé). Source unique de l'écran, du papier et du corrigé.
 */

type E = ExerciceFonctionAsymptotes;
export type PhaseFonctionAsymptotes = "av" | "horiz" | "point" | "fonction" | "verifier";
export const PHASES: PhaseFonctionAsymptotes[] = ["av", "horiz", "point", "fonction", "verifier"];

// ============================================================================
// Écritures.
// ============================================================================

export const formeL = (e: E): string => (estOblique(e) ? "f(x)=ax+b+\\dfrac{c}{x-p}" : "f(x)=\\dfrac{ax+b}{x+d}");
export const avL = (e: E): string => `x=${e.d.p}`;
export const horizL = (e: E): string => (estOblique(e) ? `y=${polyL([e.d.m, e.d.q])}` : `y=${e.d.k}`);
export const pointL = (e: E): string => `A(${e.d.x0}\\,;${e.d.y0})`;
const denL = (e: E): string => polyL([1, -e.d.p]);

/** f(x) trouvée (sans « f(x) = »). */
export function fL(e: E): string {
  const d = e.d;
  if (estOblique(e)) return `${polyL([d.m, d.q])}${d.c < 0 ? "-" : "+"}\\dfrac{${Math.abs(d.c)}}{${denL(e)}}`;
  return `\\dfrac{${polyL([d.k, d.b])}}{${denL(e)}}`;
}

export const nomHoriz = (e: E): string => (estOblique(e) ? "oblique" : "horizontale");

/** Inconnue de l'écran « point ». */
export const inconnuePoint = (e: E): string => (estOblique(e) ? "c" : "b");

// ============================================================================
// Figure.
// ============================================================================

export function specFigure(e: E, corrige = false): SpecGraphe {
  const d = e.d;
  const f = fonction(e);
  return {
    ...FENETRE,
    branches: [
      { f, de: -Infinity, a: d.p },
      { f, de: d.p, a: Infinity },
    ],
    av: [d.p],
    ah: estOblique(e) ? [] : [d.k],
    ao: estOblique(e) ? [{ m: d.m, q: d.q }] : [],
    points: [{ x: d.x0, y: d.y0, label: corrige ? `A(${d.x0 < 0 ? "−" : ""}${Math.abs(d.x0)} ; ${d.y0 < 0 ? "−" : ""}${Math.abs(d.y0)})` : "A" }],
    carreau: corrige ? 17 : 19,
    police: 10,
    etiquettes: corrige,
    couleur: corrige,
  };
}

export const figureEcran = (e: E): string => grapheSvg({ ...specFigure(e), carreau: 24, police: 11 });
export const figurePapier = (e: E, corrige = false): string => grapheSvg(specFigure(e, corrige));

// ============================================================================
// Écrans.
// ============================================================================

export const LIBELLES: Record<PhaseFonctionAsymptotes, string> = {
  av: "Asymptote verticale",
  horiz: "Asymptote horizontale ou oblique",
  point: "Point du graphe",
  fonction: "Expression de f",
  verifier: "Vérification",
};

export function libelle(e: E, p: PhaseFonctionAsymptotes): string {
  if (p === "horiz") return `Asymptote ${nomHoriz(e)}`;
  return LIBELLES[p];
}

export function consigneGenerale(e: E): Frag[] {
  if (estGraphique(e))
    return [tx("Le graphique représente une fonction f de la forme "), lx(formeL(e)), tx(". Il est complet : les asymptotes sont en pointillés et le point A est sur un nœud du quadrillage. On veut retrouver f(x).")];
  return [tx("Une fonction f est de la forme "), lx(formeL(e)), tx(". Son graphe admet l'asymptote verticale "), lx(avL(e)), tx(`, l'asymptote ${nomHoriz(e)} `), lx(horizL(e)), tx(" et passe par le point "), lx(pointL(e)), tx(". On veut retrouver f(x).")];
}

export function consigne(e: E, p: PhaseFonctionAsymptotes): Frag[] {
  const g = estGraphique(e);
  const ob = estOblique(e);
  if (p === "av") {
    const debut = g ? [tx("Lis l'asymptote verticale sur le graphique. ")] : [tx("Traduis l'asymptote verticale "), lx(avL(e)), tx(". ")];
    return ob ? [...debut, tx("Le dénominateur "), lx("x-p"), tx(" doit s'y annuler : donne p.")] : [...debut, tx("Le dénominateur "), lx("x+d"), tx(" doit s'y annuler : donne d.")];
  }
  if (p === "horiz") {
    const debut = g ? [tx(`Lis l'asymptote ${nomHoriz(e)} sur le graphique. `)] : [tx(`Traduis l'asymptote ${nomHoriz(e)} `), lx(horizL(e)), tx(". ")];
    return ob ? [...debut, tx("Donne a et b.")] : [...debut, tx("Donne a.")];
  }
  if (p === "point") {
    const debut = g ? [tx("Lis les coordonnées de A. ")] : [tx("Le point "), lx(pointL(e)), tx(" est sur le graphe. ")];
    return [...debut, tx("Remplace x et f(x) par ses coordonnées et calcule "), lx(inconnuePoint(e)), tx(".")];
  }
  if (p === "fonction") return [tx("Écris f(x) avec les valeurs trouvées.")];
  return [tx("Vérifie que "), lx(avL(e)), tx(" est bien une asymptote verticale : donne "), lx(`${limL(pointC(e.d.p, "+"))}f(x)`), tx(".")];
}

const RACCOURCIS_X = [
  { libelle: "x", texte: "x" },
  { libelle: "/", texte: "/" },
  { libelle: "( )", texte: "()" },
];

export function champs(e: E, p: PhaseFonctionAsymptotes): ChampEcran[] {
  const ob = estOblique(e);
  if (p === "av") return [ob ? { label: "p", labelLatex: "p=", placeholder: "ex. : 9" } : { label: "d", labelLatex: "d=", placeholder: "ex. : 9" }];
  if (p === "horiz") return ob ? [{ label: "a", labelLatex: "a=", placeholder: "ex. : 7" }, { label: "b", labelLatex: "b=", placeholder: "ex. : −8" }] : [{ label: "a", labelLatex: "a=", placeholder: "ex. : 7" }];
  if (p === "point") return [{ label: inconnuePoint(e), labelLatex: `${inconnuePoint(e)}=`, placeholder: "ex. : 15" }];
  if (p === "fonction") return [{ label: "f(x)", labelLatex: "f(x)=", placeholder: ob ? "ex. : 3x − 2 + 5/(x + 4)" : "ex. : (3x − 2)/(x + 4)", apercu: true, raccourcis: RACCOURCIS_X }];
  return [{ label: "Limite à droite", labelLatex: `${limL(pointC(e.d.p, "+"))}f(x)=`, placeholder: "ex. : +∞ ou −∞", raccourcis: [{ libelle: "+∞", texte: "+∞" }, { libelle: "−∞", texte: "−∞" }] }];
}

export function aide1(e: E, p: PhaseFonctionAsymptotes): AideEcran {
  const ob = estOblique(e);
  if (p === "av") return { texte: [tx("Une fonction rationnelle a une asymptote verticale là où son dénominateur s'annule (et pas son numérateur).")] };
  if (p === "horiz") {
    if (ob) return { texte: [tx("La droite "), lx("y=ax+b"), tx(" est asymptote oblique quand l'écart tend vers 0 en l'infini :")], latex: "f(x)-(ax+b)=\\dfrac{c}{x-p}\\ \\xrightarrow[x\\to\\pm\\infty]{}\\ 0" };
    return { texte: [tx("En l'infini, un quotient de deux polynômes de même degré tend vers le quotient des coefficients des termes de plus haut degré :")], latex: "\\lim\\limits_{x\\to\\pm\\infty}\\dfrac{ax+b}{x+d}=\\dfrac{a}{1}" };
  }
  if (p === "point") return { texte: [tx("Un point est sur le graphe quand ses coordonnées vérifient "), lx("y=f(x)"), tx(" : remplace x par l'abscisse et f(x) par l'ordonnée, puis isole l'inconnue.")] };
  if (p === "fonction") return { texte: [tx("Remplace chaque lettre de la forme donnée par la valeur trouvée aux écrans précédents.")] };
  return { texte: [tx("Près de p, le numérateur tend vers un nombre non nul et le dénominateur vers 0 : la limite est infinie ; son signe vient des signes du numérateur et du dénominateur.")] };
}

export function aide2(e: E, p: PhaseFonctionAsymptotes): AideEcran | null {
  const d = e.d;
  const ob = estOblique(e);
  if (p === "av") return ob ? { texte: [tx("Ici "), lx("x-p"), tx(" doit valoir 0 pour "), lx(`x=${d.p}`), tx(".")] } : { texte: [tx("Ici "), lx("x+d"), tx(" doit valoir 0 pour "), lx(`x=${d.p}`), tx(" : résous l'équation")], latex: `${d.p}+d=0` };
  if (p === "horiz") return ob ? { texte: [tx("Compare "), lx("y=ax+b"), tx(" et "), lx(horizL(e)), tx(" coefficient par coefficient.")] } : { texte: [tx("Ici cette limite doit valoir l'ordonnée de l'asymptote horizontale :")], latex: `\\dfrac{a}{1}=${d.k}` };
  if (p === "point") {
    if (ob) return { texte: [tx("Avec a, b et p trouvés, l'égalité à résoudre est :")], latex: `${d.m}\\cdot ${parL(d.x0)}${plusL(d.q)}+\\dfrac{c}{${d.x0}${plusL(-d.p)}}=${d.y0}` };
    return { texte: [tx("Avec a et d trouvés, l'égalité à résoudre est :")], latex: `\\dfrac{${d.k}\\cdot ${parL(d.x0)}+b}{${d.x0}${plusL(-d.p)}}=${d.y0}` };
  }
  if (p === "fonction") return { texte: [tx("Le dénominateur s'écrit "), lx(denL(e)), tx(" ; écris le reste de la forme avec tes valeurs.")] };
  return { texte: [tx(ob ? "Ici le numérateur de la fraction vaut " : "Ici le numérateur tend vers "), lx(`${numerateurEnP(e)}`), tx(" et le dénominateur "), lx(denL(e)), tx(" tend vers "), lx("0^+"), tx(".")] };
}

export function reponse(e: E, p: PhaseFonctionAsymptotes): Frag[] {
  const d = e.d;
  const ob = estOblique(e);
  if (p === "av") return ob ? [lx(`p=${d.p}`)] : [lx(`d=${-d.p}`), tx(" (dénominateur "), lx(denL(e)), tx(")")];
  if (p === "horiz") return ob ? [lx(`a=${d.m}`), tx(" et "), lx(`b=${d.q}`)] : [lx(`a=${d.k}`)];
  if (p === "point") return [lx(ob ? `c=${d.c}` : `b=${d.b}`)];
  if (p === "fonction") return [lx(`f(x)=${fL(e)}`)];
  return [lx(`${limL(pointC(d.p, "+"))}f(x)=${limiteL(limiteDroite(e))}`)];
}

export const recap = reponse;

export function messageIllisible(_e: E, p: PhaseFonctionAsymptotes): string {
  if (p === "fonction") return "Expression non reconnue : écris f(x) avec x, par exemple (3x − 2)/(x + 4) ou 2x + 1 + 3/(x − 2). Cette saisie ne compte pas comme une tentative.";
  if (p === "verifier") return "Limite non reconnue : écris +∞ ou −∞ (ou « inf », « -inf »), ou un nombre. Cette saisie ne compte pas comme une tentative.";
  return "Nombre non reconnu : écris un entier, par exemple 3 ou −2. Cette saisie ne compte pas comme une tentative.";
}
