import type { CourbeTangente, ExerciceLectureTangente } from "../core5e/lectureTangente";
import { aDe, echellesDifferentes, f, faDe, FENETRE, FENETRE_CANDIDAT, fpaQ, g, gp, NOMS_POINTS, pointB, positionBonGraphique, pQ, xPoint, yPoint } from "../core5e/lectureTangente";
import type { AideEcran, ChampEcran, Frag, OptionEcran } from "./ecransTrigo.types";
import { lx, tx } from "./ecransTrigo.types";
import type { Q } from "./nombresTrigo";
import { q, qL, qMul, qT, qSub } from "./nombresTrigo";
import type { SpecRepere } from "./figureLotHDerivees";
import { COULEUR_REPERE, COULEUR_TANGENTE, grilleReperesSvg, nombreFigure, repereSvg } from "./figureLotHDerivees";

/**
 * Couche C — textes et figures de `5gen73` « Lire f(a) et f′(a) sur un graphique » : consignes,
 * champs, options, aides à deux niveaux, réponses, figures (énoncé ET corrigé). Source unique de
 * l'écran, du papier et du corrigé.
 */

type E = ExerciceLectureTangente;
export type PhaseLectureTangente = "valeur" | "pente" | "equation" | "comparer" | "graphique";

export const phases = (e: E): PhaseLectureTangente[] => (e.variante === "inverse" ? ["valeur", "pente", "graphique"] : ["valeur", "pente", "equation", "comparer"]);

// ============================================================================
// Écritures.
// ============================================================================

/** « x » / « -2x » / « \dfrac{1}{2}x » (terme en x d'une droite). */
function termeX(m: Q): string {
  if (m.n === 0) return "";
  if (m.d === 1) return m.n === 1 ? "x" : m.n === -1 ? "-x" : `${m.n}x`;
  return `${qL(m)}x`;
}

/** Second membre d'une équation de droite y = mx + p (LaTeX). */
export function affineL(m: Q, p: Q): string {
  const tx0 = termeX(m);
  if (tx0 === "") return qL(p);
  if (p.n === 0) return tx0;
  return `${tx0}${p.n > 0 ? "+" : ""}${qL(p)}`;
}

export const nbL = (v: number): string => `${v}`;
export const parN = (v: number): string => (v < 0 ? `(${v})` : `${v}`);

/** Équation de t (LaTeX). */
export const equationL = (e: E): string => `y=${affineL(fpaQ(e), pQ(e))}`;

/** Droite d'un candidat (variante inverse) : pente m et ordonnée à l'origine. */
export function droiteCandidat(c: CourbeTangente): { m: Q; p: Q } {
  const m = q(c.dp, c.dq);
  return { m, p: qSub(q(c.ja), qMul(m, q(c.ia))) };
}

/** Échelle du quadrillage en clair. */
export function phraseEchelle(e: E): string {
  const u = (v: number) => (v === 1 ? "1 unité" : `${v} unités`);
  return `Un carreau vaut ${u(e.sx)} en abscisse et ${u(e.sy)} en ordonnée.`;
}

// ============================================================================
// Figures.
// ============================================================================

function specDirect(e: E): SpecRepere {
  const w = FENETRE;
  const c = e.courbe;
  const m = c.dp / c.dq;
  // Nom « t » le long de la tangente, loin de A et dans la fenêtre.
  let ut = c.ia + 2.6;
  if (Math.abs(ut) > w - 0.6 || Math.abs(c.ja + m * 2.6) > w - 0.8) ut = c.ia - 2.6;
  const vt = c.ja + m * (ut - c.ia);
  return {
    xmin: -w * e.sx,
    xmax: w * e.sx,
    ymin: -w * e.sy,
    ymax: w * e.sy,
    sx: e.sx,
    sy: e.sy,
    carreau: 24,
    police: 11,
    courbes: [
      { f: (x) => f(e, x) },
      { f: (x) => (m * (x / e.sx - c.ia) + c.ja) * e.sy, couleur: COULEUR_TANGENTE, epaisseur: 1.8 },
    ],
    points: [
      { x: aDe(e), y: faDe(e), label: "A", couleur: COULEUR_TANGENTE, position: m > 0 ? "no" : "ne" },
      ...e.points.map((_, k) => ({ x: xPoint(e, k), y: yPoint(e, k), label: NOMS_POINTS[k], position: (gp(c, e.points[k]!) > 0 ? "no" : "ne") as "no" | "ne" })),
    ],
    textes: Math.abs(vt) <= w - 0.6 ? [{ x: ut * e.sx, y: vt * e.sy + 0.45 * e.sy, texte: "t" }] : [],
    titre: "C",
  };
}

/** Figure de l'énoncé (direct, echelle) : courbe, tangente t, A, P, Q, R. */
export function figureEnonce(e: E): string {
  if (e.variante === "inverse") return figureCandidats(e);
  return repereSvg(specDirect(e));
}

/** Corrigé, étape b : A et B sur t, Δx et Δy en carreaux et en unités. */
export function figurePente(e: E): string {
  const s = specDirect(e);
  const A = { x: aDe(e), y: faDe(e) };
  const B = pointB(e);
  s.points = [
    { x: A.x, y: A.y, label: "A", couleur: COULEUR_TANGENTE, position: "so" },
    { x: B.x, y: B.y, label: "B", couleur: COULEUR_TANGENTE, position: "ne" },
  ];
  s.segments = [
    { x1: A.x, y1: A.y, x2: B.x, y2: A.y, couleur: COULEUR_REPERE, pointilles: true },
    { x1: B.x, y1: A.y, x2: B.x, y2: B.y, couleur: COULEUR_REPERE, pointilles: true },
  ];
  s.textes = [
    { x: (A.x + B.x) / 2, y: A.y - 0.9 * e.sy, texte: `Δx = ${nombreFigure(B.x - A.x)}`, couleur: COULEUR_REPERE },
    { x: B.x + 0.3 * e.sx, y: (A.y + B.y) / 2, texte: `Δy = ${nombreFigure(B.y - A.y)}`, couleur: COULEUR_REPERE, ancre: "start" },
  ];
  return repereSvg(s);
}

/** Corrigé, étape d : petites tangentes en P, Q, R. */
export function figureComparer(e: E): string {
  const s = specDirect(e);
  s.courbes = [s.courbes[0]!];
  s.textes = [];
  s.segments = e.points.map((u) => {
    const pente = gp(e.courbe, u);
    const d = 1.1 / Math.sqrt(1 + pente * pente);
    return { x1: (u - d) * e.sx, y1: (g(e.courbe, u) - pente * d) * e.sy, x2: (u + d) * e.sx, y2: (g(e.courbe, u) + pente * d) * e.sy, couleur: COULEUR_TANGENTE, epaisseur: 2.2 };
  });
  s.points = e.points.map((_, k) => ({ x: xPoint(e, k), y: yPoint(e, k), label: NOMS_POINTS[k], position: "so" as const }));
  return repereSvg(s);
}

function specCandidat(c: CourbeTangente, titre: string): SpecRepere {
  const w = FENETRE_CANDIDAT;
  const m = c.dp / c.dq;
  return {
    xmin: -w,
    xmax: w,
    ymin: -w,
    ymax: w,
    sx: 1,
    sy: 1,
    carreau: 15,
    police: 9,
    courbes: [{ f: (x) => g(c, x) }, { f: (x) => m * (x - c.ia) + c.ja, couleur: COULEUR_TANGENTE, epaisseur: 1.6 }],
    points: [{ x: c.ia, y: c.ja, couleur: COULEUR_TANGENTE }],
    titre,
    titreGrand: true,
  };
}

/** Variante inverse : les quatre graphiques candidats numérotés 1 à 4. */
export function figureCandidats(e: E): string {
  return grilleReperesSvg(e.ordreCandidats.map((k, i) => specCandidat(e.candidats[k]!, `${i + 1}`)));
}

/** Corrigé, variante inverse : le bon graphique seul. */
export function figureBonCandidat(e: E): string {
  const s = specCandidat(e.courbe, `${positionBonGraphique(e) + 1}`);
  s.carreau = 22;
  s.police = 11;
  s.points = [{ x: e.courbe.ia, y: e.courbe.ja, label: "A", couleur: COULEUR_TANGENTE, position: "no" }];
  return repereSvg(s);
}

// ============================================================================
// Écrans.
// ============================================================================

export const LIBELLES: Record<PhaseLectureTangente, string> = {
  valeur: "Lire f(a)",
  pente: "Nombre dérivé f′(a)",
  equation: "Équation de la tangente",
  comparer: "Comparer les nombres dérivés",
  graphique: "Choisir le graphique",
};

export const libelle = (_e: E, p: PhaseLectureTangente): string => LIBELLES[p];

export function consigneGenerale(e: E): Frag[] {
  const a = aDe(e);
  if (e.variante === "inverse") {
    return [tx("La droite t d'équation "), lx(equationL(e)), tx(" est tangente à la courbe de f au point A d'abscisse "), lx(`a=${a}`), tx(". Un seul des quatre graphiques ci-dessous peut représenter f (la droite orange est la tangente tracée au point marqué).")];
  }
  const debut: Frag[] = [tx("La courbe C représente une fonction f. La droite t est tangente à C au point A d'abscisse "), lx(`a=${a}`), tx(".")];
  return echellesDifferentes(e) ? [...debut, tx(` Attention à l'échelle : ${phraseEchelle(e).replace(/^Un/, "un")}`)] : debut;
}

export function consigne(e: E, p: PhaseLectureTangente): Frag[] {
  const a = aDe(e);
  if (p === "valeur") return e.variante === "inverse" ? [tx("Calcule "), lx(`f(${a})`), tx(".")] : [tx("Lis "), lx(`f(${a})`), tx(" sur le graphique.")];
  if (p === "pente") return e.variante === "inverse" ? [tx("Donne "), lx(`f'(${a})`), tx(".")] : [tx("Détermine "), lx(`f'(${a})`), tx(" à l'aide de deux points de la tangente t.")];
  if (p === "equation") return [tx("Écris une équation de la tangente t.")];
  if (p === "comparer") return [tx("Compare les nombres dérivés de f aux points P, Q et R : en quel point "), lx("f'"), tx(" est-il négatif, et en quel point est-il le plus grand ?")];
  return [tx("Quel graphique peut représenter f ?")];
}

export function champs(e: E, p: PhaseLectureTangente): ChampEcran[] {
  const a = aDe(e);
  if (p === "valeur") return [{ label: `f(${a})`, labelLatex: `f(${a})=`, placeholder: "ex. : −2" }];
  if (p === "pente") return [{ label: `f′(${a})`, labelLatex: `f'(${a})=`, placeholder: "ex. : 3/2 ou −2" }];
  return [{ label: "Équation de t", labelLatex: "t\\;:\\;y=", placeholder: "ex. : 2x − 3 ou 1/2x + 1", raccourcis: [{ libelle: "x", texte: "x" }] }];
}

/** Phrase d'une option « comparer ». */
function phraseOption(o: [number, number]): Frag[] {
  return [lx("f'"), tx(` est négatif en ${NOMS_POINTS[o[0]]} et le plus grand en ${NOMS_POINTS[o[1]]}.`)];
}

export function optionsComparer(e: E): OptionEcran[] {
  return e.ordre.map((k) => ({ id: `o${k}`, fragments: phraseOption(e.options[k]!) }));
}

export function optionsGraphique(e: E): OptionEcran[] {
  return e.ordreCandidats.map((k, i) => ({ id: `g${k}`, fragments: [tx(`Graphique ${i + 1}`)] }));
}

export function aide1(e: E, p: PhaseLectureTangente): AideEcran {
  if (p === "valeur") {
    if (e.variante === "inverse") return { texte: [tx("Le point A appartient à la fois à la courbe et à la tangente : son ordonnée se calcule avec l'équation de t.")] };
    return { texte: [tx("f(a) est l'ordonnée du point de la courbe d'abscisse a : c'est la hauteur du point A.")] };
  }
  if (p === "pente") {
    if (e.variante === "inverse") return { texte: [tx("Le nombre dérivé f′(a) est la pente de la tangente en A : dans "), lx("y=mx+p"), tx(", c'est le coefficient de x.")] };
    return { texte: [tx("Le nombre dérivé f′(a) est la pente de la tangente en A ; avec deux points A et B de t :")], latex: "f'(a)=\\dfrac{y_B-y_A}{x_B-x_A}" };
  }
  if (p === "equation") return { texte: [tx("La tangente en A passe par "), lx("(a\\,;f(a))"), tx(" et a pour pente f′(a) :")], latex: "y=f'(a)\\,(x-a)+f(a)" };
  if (p === "comparer") return { texte: [tx("Le signe de f′ dit si la courbe monte ("), lx("f'>0"), tx(") ou descend ("), lx("f'<0"), tx(") ; plus la courbe monte raide, plus f′ est grand. Ne regarde pas la hauteur des points.")] };
  return { texte: [tx("Sur le bon graphique, la tangente tracée passe par "), lx("(a\\,;f(a))"), tx(" ET a pour pente f′(a).")] };
}

export function aide2(e: E, p: PhaseLectureTangente): AideEcran | null {
  const a = aDe(e);
  const B = pointB(e);
  if (p === "valeur") {
    if (e.variante === "inverse") return { texte: [tx("Remplace x par "), lx(`${a}`), tx(" dans :")], latex: equationL(e) };
    const t: Frag[] = [tx("Pars de "), lx(`x=${a}`), tx(" sur l'axe horizontal, monte ou descends jusqu'au point A, puis lis la hauteur sur l'axe vertical.")];
    return echellesDifferentes(e) ? { texte: [...t, tx(` ${phraseEchelle(e)}`)] } : { texte: t };
  }
  if (p === "pente") {
    if (e.variante === "inverse") return { texte: [tx("Repère le coefficient de x dans "), lx(equationL(e)), tx(".")] };
    const t: Frag[] = [tx("Par exemple A et le nœud B d'abscisse "), lx(`${B.x}`), tx(" de la tangente : calcule "), lx("\\Delta y"), tx(" et "), lx("\\Delta x"), tx(" en unités (pas en carreaux), puis leur quotient.")];
    return echellesDifferentes(e) ? { texte: [...t, tx(` ${phraseEchelle(e)}`)] } : { texte: t };
  }
  if (p === "equation") return { texte: [tx("Remplace a, f(a) et f′(a) par leurs valeurs, puis distribue et réduis :")], latex: `y=f'(${a})\\,(x-${parN(a)})+f(${a})` };
  if (p === "comparer") return { texte: [tx("Imagine la tangente en chaque point : la seule qui descend donne "), lx("f'<0"), tx(" ; parmi les deux qui montent, la plus raide donne le plus grand f′.")] };
  return { texte: [tx("Ici "), lx(`f(${a})=${faDe(e)}`), tx(" et "), lx(`f'(${a})=${qL(fpaQ(e))}`), tx(" : vérifie le point de tangence, puis la pente, sur chaque graphique.")] };
}

export function reponse(e: E, p: PhaseLectureTangente): Frag[] {
  const a = aDe(e);
  if (p === "valeur") return [lx(`f(${a})=${faDe(e)}`)];
  if (p === "pente") return [lx(`f'(${a})=${qL(fpaQ(e))}`)];
  if (p === "equation") return [lx(`t\\;:\\;${equationL(e)}`)];
  if (p === "comparer") return phraseOption(e.options[0]!);
  return [tx(`Graphique ${positionBonGraphique(e) + 1}`)];
}

export const recap = reponse;

export function messageIllisible(_e: E, p: PhaseLectureTangente): string {
  if (p === "equation") return "Équation non reconnue : écris le second membre en x, par exemple 2x − 3 ou 1/2x + 1. Cette saisie ne compte pas comme une tentative.";
  return "Nombre non reconnu : écris un nombre, par exemple −2, 1,5 ou 3/2. Cette saisie ne compte pas comme une tentative.";
}

/** f′(a) en texte (« 3/2 »). */
export const fpaT = (e: E): string => qT(fpaQ(e));
