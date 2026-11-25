import { CONTEXTES_PETITS, CONTEXTES_REELS } from "../core5e/contextesStat2vLotH1";
import type { ContexteSerie } from "../core5e/contextesStat2vLotH1";
import type { ExerciceMoindresCarres } from "../core5e/moindresCarres";
import { arrondi, decimales } from "../core5e/stat2vLotH1";
import type { AideEcran, ChampEcran, Frag, TableauDonnees } from "./ecransTrigo.types";
import { lx, tx } from "./ecransTrigo.types";
import { droiteL, nL, nT, pointL, tableauEcran, tableauPapierL } from "./ecrituresStat2vLotH1";
import { figureNuage } from "./figureNuageLotH1";
import { nomPrecision } from "./formatDroiteMayer";

/**
 * Couche C — textes et figures de `5gen37` « Droite des moindres carrés » : consignes (précisions
 * affichées), champs, aides à deux niveaux, réponses, tableau, nuage (la droite et G n'apparaissent
 * qu'une fois l'équation trouvée). Source unique de l'écran, du papier et du corrigé.
 */

type E = ExerciceMoindresCarres;
export type PhaseMoindresCarres = "g" | "ecarts" | "pente" | "equation" | "prevision" | "coefs" | "prevY" | "prevX";

export function phases(e: E): PhaseMoindresCarres[] {
  return e.variante === "main" ? ["g", "ecarts", "pente", "equation", "prevision"] : ["coefs", "prevY", "prevX"];
}

interface TextesContexte {
  phrase: string;
  ent: { x: string; y: string };
  titreX: string;
  titreY: string;
  questionY: (x0: string) => string;
  questionX?: (y0: string) => string;
  uniteY?: string;
  uniteX?: string;
}

export function contexte(e: E): TextesContexte {
  if (e.variante === "main") return CONTEXTES_PETITS.find((c) => c.id === e.contexteId)!;
  return CONTEXTES_REELS.find((c) => c.id === e.contexteId) as ContexteSerie;
}

// ============================================================================
// Valeurs attendues.
// ============================================================================

export const prevY = (e: E): number => e.a * e.x0 + e.b;
export const prevYArrondie = (e: E): number => arrondi(e.a, e.da) * e.x0 + arrondi(e.b, e.db);
export const prevX = (e: E): number => (e.y0! - e.b) / e.a;
export const prevXArrondie = (e: E): number => (e.y0! - arrondi(e.b, e.db)) / arrondi(e.a, e.da);
export const sommeProduitsBruts = (e: E): number => e.points.reduce((s, p) => s + p.x * p.y, 0);

// ============================================================================
// Tableau et figures.
// ============================================================================

export const tableau = (e: E): TableauDonnees => tableauEcran(e.points, contexte(e).ent, e.dx, e.dy);
export const tableauPapier = (e: E): string => tableauPapierL(e.points, contexte(e).ent, e.dx, e.dy);

const titres = (e: E) => (e.contexteId === "generique" ? {} : { titreX: contexte(e).titreX, titreY: contexte(e).titreY });

export function figureEtat(e: E, avecDroite: boolean, avecPrevisions = false): string {
  const prev = avecPrevisions ? [{ x: e.x0, y: prevY(e) }, ...(e.y0 !== undefined ? [{ x: prevX(e), y: e.y0 }] : [])] : [];
  return figureNuage({
    points: e.points,
    ...titres(e),
    remarquables: avecDroite ? [{ P: e.G, nom: "G" }, ...prev.map((P) => ({ P, nom: "P", couleur: "#7048e8" }))] : [],
    droites: avecDroite ? [{ a: e.a, b: e.b }] : [],
  });
}

export function figureEcran(e: E, p: PhaseMoindresCarres): string {
  const i = phases(e).indexOf(p);
  const avecDroite = e.variante === "main" ? i >= 4 : i >= 1;
  return figureEtat(e, avecDroite);
}

// ============================================================================
// Écrans.
// ============================================================================

const LIBELLES: Record<PhaseMoindresCarres, string> = {
  g: "Point moyen G",
  ecarts: "Tableau des écarts",
  pente: "Pente a",
  equation: "b et équation",
  prevision: "Prévision",
  coefs: "a et b à la calculatrice",
  prevY: "Prévision de y",
  prevX: "Prévision de x",
};
export const libelle = (_e: E, p: PhaseMoindresCarres): string => LIBELLES[p];

export function consigneGenerale(e: E): Frag[] {
  return [tx(`${contexte(e).phrase} On ajuste ce nuage par la droite des moindres carrés (droite de régression de y en x)${e.variante === "calculatrice" ? ", à l'aide de la calculatrice" : ", à la main"}.`)];
}

export function consigne(e: E, p: PhaseMoindresCarres): Frag[] {
  if (p === "g") return [tx("Calcule les coordonnées du point moyen G du nuage.")];
  if (p === "ecarts")
    return [tx("Dresse le tableau des écarts à la moyenne "), lx("X_i=x_i-\\bar{x}"), tx(" et "), lx("Y_i=y_i-\\bar{y}"), tx(", puis donne "), lx("\\sum X_iY_i"), tx(" et "), lx("\\sum X_i^2"), tx(".")];
  if (p === "pente") return [tx("Calcule la pente a de la droite des moindres carrés (valeur exacte).")];
  if (p === "equation") return [tx("Calcule b, puis écris l'équation de la droite des moindres carrés.")];
  if (p === "prevision") return [tx(`${contexte(e).questionY(nT(e.x0)).replace(/\.$/, "")} (valeur exacte).`)];
  if (p === "coefs") return [tx(`À la calculatrice, donne a (arrondie ${nomPrecision(e.da)}) et b (arrondi ${nomPrecision(e.db)}) de la droite des moindres carrés `), lx("y=ax+b"), tx(".")];
  if (p === "prevY") return [tx(`${contexte(e).questionY(nT(e.x0, e.dx))} Arrondis ${nomPrecision(e.dp)}.`)];
  return [tx(`${contexte(e).questionX!(nT(e.y0!, e.dy))} Arrondis ${nomPrecision(e.dpx)}.`)];
}

const C = (label: string, labelLatex: string, placeholder: string): ChampEcran => ({ label, labelLatex, placeholder });

export function champs(e: E, p: PhaseMoindresCarres): ChampEcran[] {
  if (p === "g") return [C("x̄ =", "\\bar{x}=", "ex. : 4"), C("ȳ =", "\\bar{y}=", "ex. : 12")];
  if (p === "ecarts") return [C("Somme des XᵢYᵢ =", "\\sum X_iY_i=", "ex. : 18"), C("Somme des Xᵢ² =", "\\sum X_i^2=", "ex. : 28")];
  if (p === "pente") return [C("a =", "a=", "ex. : 0,6")];
  if (p === "equation") return [C("b =", "b=", "ex. : 2,2"), C("Équation", "\\text{Équation : }", "ex. : y = 0,6x + 2,2")];
  if (p === "prevision") return [C("y =", "y=", "ex. : 7,6")];
  if (p === "coefs") return [C("a ≈", "a\\approx", e.da === 4 ? "ex. : 0,0266" : "ex. : 0,108"), C("b ≈", "b\\approx", "ex. : 2,82")];
  if (p === "prevY") return [C("y ≈", "y\\approx", "ex. : 5,2")];
  return [C("x ≈", "x\\approx", "ex. : 150,4")];
}

export function aide1(_e: E, p: PhaseMoindresCarres): AideEcran {
  if (p === "g") return { texte: [tx("G a pour coordonnées les moyennes des x et des y :")], latex: "\\bar{x}=\\dfrac{1}{n}\\sum x_i\\qquad\\bar{y}=\\dfrac{1}{n}\\sum y_i" };
  if (p === "ecarts") return { texte: [tx("Pour chaque point, calcule l'écart de x à sa moyenne et celui de y à la sienne, puis leur produit et le carré de l'écart de x ; additionne chaque colonne.")] };
  if (p === "pente") return { texte: [tx("Pente de la droite des moindres carrés :")], latex: "a=\\dfrac{\\sum X_iY_i}{\\sum X_i^2}=\\dfrac{\\sum(x_i-\\bar{x})(y_i-\\bar{y})}{\\sum(x_i-\\bar{x})^2}" };
  if (p === "equation") return { texte: [tx("La droite des moindres carrés passe par le point moyen G :")], latex: "\\bar{y}=a\\,\\bar{x}+b\\iff b=\\bar{y}-a\\,\\bar{x}" };
  if (p === "prevision" || p === "prevY") return { texte: [tx("Remplace x par la valeur donnée dans l'équation de la droite.")] };
  if (p === "coefs") return { texte: [tx("TI-30XB : entre les x dans la liste L1 et les y dans L2, puis lance « 2-Var Stats » ; la calculatrice affiche a et b de la droite "), lx("y=ax+b"), tx(".")] };
  return { texte: [tx("Remplace y par la valeur donnée dans l'équation, puis isole x.")] };
}

export function aide2(e: E, p: PhaseMoindresCarres): AideEcran | null {
  const n = e.points.length;
  if (p === "g") return { texte: [tx(`Additionne les ${n} valeurs de x et divise par ${n} ; de même pour y. Ici les deux moyennes sont entières.`)] };
  if (p === "ecarts") return { texte: [tx("Avec "), lx(`\\bar{x}=${nL(e.G.x)}`), tx(" et "), lx(`\\bar{y}=${nL(e.G.y)}`), tx(" : pour le premier point, "), lx(`X_1=${nL(e.points[0]!.x)}-${nL(e.G.x)}`), tx(" et "), lx(`Y_1=${nL(e.points[0]!.y)}-${nL(e.G.y)}`), tx(".")] };
  if (p === "pente") return { texte: [tx("Ici : "), lx(`a=\\dfrac{${nL(e.sXY)}}{${nL(e.sX2)}}`), tx(".")] };
  if (p === "equation") return { texte: [tx("Ici : "), lx(`b=${nL(e.G.y)}-${nL(e.a)}\\times${nL(e.G.x)}`), tx(".")] };
  if (p === "prevision") return { texte: [tx("Calcule "), lx(`${nL(e.a)}\\times${nL(e.x0)}${e.b < 0 ? "" : "+"}${nL(e.b)}`), tx(".")] };
  if (p === "coefs") return { texte: [tx("Dans la liste des résultats de « 2-Var Stats », descends jusqu'à a et b (après Σxy). Ne confonds pas a (la pente) et b (l'ordonnée à l'origine).")] };
  if (p === "prevY") return { texte: [tx("Calcule "), lx(`a\\times${nL(e.x0)}+b`), tx(" avec les valeurs de a et b de la calculatrice.")] };
  return { texte: [tx("Résous "), lx(`ax+b=${nL(e.y0!)}`), tx(" : "), lx(`x=\\dfrac{${nL(e.y0!)}-b}{a}`), tx(".")] };
}

const egalOuEnviron = (v: number, d: number) => (decimales(v) <= d ? "=" : "\\approx");

export function reponse(e: E, p: PhaseMoindresCarres): Frag[] {
  if (p === "g") return [lx(pointL("G", e.G))];
  if (p === "ecarts") return [lx(`\\sum X_iY_i=${nL(e.sXY)}`), tx(" et "), lx(`\\sum X_i^2=${nL(e.sX2)}`)];
  if (p === "pente") return [lx(`a=${nL(e.a)}`)];
  if (p === "equation") return [lx(`b=${nL(e.b)}`), tx(", donc "), lx(droiteL(e.a, e.b))];
  if (p === "prevision") return [lx(`y=${nL(prevY(e))}`)];
  if (p === "coefs") return [lx(`a${egalOuEnviron(e.a, e.da)}${nL(e.a, e.da)}`), tx(" et "), lx(`b${egalOuEnviron(e.b, e.db)}${nL(e.b, e.db)}`), tx(", donc "), lx(droiteL(e.a, e.b, e.da, e.db))];
  const u = p === "prevY" ? contexte(e).uniteY : contexte(e).uniteX;
  if (p === "prevY") return [lx(`y\\approx${nL(prevY(e), e.dp)}`), ...(u ? [tx(` ${u}`)] : [])];
  return [lx(`x\\approx${nL(prevX(e), e.dpx)}`), ...(u ? [tx(` ${u}`)] : [])];
}

export const recap = reponse;

export function messageIllisible(_e: E, p: PhaseMoindresCarres): string {
  if (p === "equation") return "Saisie non reconnue : écris b comme un nombre (par exemple 2,2) et l'équation sous la forme y = ax + b. Cette saisie ne compte pas comme une tentative.";
  return "Nombre non reconnu : écris un nombre décimal avec une virgule (par exemple 0,6) ou une fraction. Cette saisie ne compte pas comme une tentative.";
}
