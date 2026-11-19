import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { construireSvgFonction, type PointMarqueSvg } from "../../export/svgGraph";
import type { ExerciceLectureInequation, IdLecture } from "../core/lectureInequationGraphique.types";
import { abscisses, f, g, solution } from "../moteur/modeleLectureInequationGraphique";
import { ensembleLatex } from "./ensembleSolutionTrinome";
import { souderPonctuation } from "./formatDetectiveVecteurs";

/**
 * Textes et figure de gen117 « Lire une inéquation sur un graphique » (écran ET papier : une seule
 * source). Figure : `export/svgGraph.ts` (quadrillage d'une unité, graduations sur des lignes
 * marquées), parabole en trait plein, droite en pointillés (lisible en noir et blanc) ; AUCUN point
 * marqué dans l'énoncé (c'est ce qu'on lit) — les points d'intersection n'apparaissent qu'au corrigé.
 */

type E = ExerciceLectureInequation;
const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

export { souderPonctuation };

export const CONSIGNE_GENERALE = "Résous graphiquement l'inéquation : lis les points d'intersection, la position de la parabole, puis écris l'ensemble-solution.";

export const TITRES_ECRANS = ["Les points d'intersection", "La position", "L'ensemble-solution"];

function symboleLatex(s: E["symbole"]): string {
  return s === "≤" ? "\\leq " : s === "≥" ? "\\geq " : s;
}

/** Membre de droite : 0, k ou g(x). */
function membreDroit(e: E): string {
  return e.variante === "axe" ? "0" : e.variante === "horizontale" ? String(e.p) : "g(x)";
}

export function inequationLatex(e: E): string {
  return `f(x)${symboleLatex(e.symbole)}${membreDroit(e)}`;
}

/** « l'axe des x » / « la droite d ». */
function reference(e: E): string {
  return e.variante === "axe" ? "l'axe des x" : "la droite d";
}

export function enonceFragments(e: E): FragmentConsigne[] {
  const p = [t("On a tracé la parabole "), l("\\mathcal{P}"), t(" d'équation "), l("y=f(x)"), t(" (trait plein)")];
  if (e.variante === "horizontale") p.push(t(" et la droite "), l("d"), t(" d'équation "), l(`y=${e.p}`), t(" (pointillés)"));
  if (e.variante === "oblique") p.push(t(" et la droite "), l("d"), t(" d'équation "), l("y=g(x)"), t(" (pointillés)"));
  p.push(t(". Résous graphiquement l'inéquation "), l(inequationLatex(e)), t("."));
  return souderPonctuation(p);
}

export function consignesEcrans(e: E): FragmentConsigne[][] {
  return [
    [t("Lis les abscisses des points d'intersection de "), l("\\mathcal{P}"), t(e.variante === "axe" ? " et de l'axe des x." : " et de la droite "), ...(e.variante === "axe" ? [] : [l("d"), t(".")])],
    [t("Où la parabole vérifie-t-elle l'inéquation ?")],
    [t("Écris l'ensemble-solution "), l("S"), t(" de l'inéquation "), l(inequationLatex(e)), t(".")],
  ];
}

function xEgal(x: number): FragmentConsigne {
  return l(`x=${x}`);
}

/** Texte d'une lecture de l'écran 2. */
export function lectureFragments(id: IdLecture, e: E): FragmentConsigne[] {
  const dessus = id.startsWith("dessus");
  const exterieur = id.endsWith("Exterieur");
  const pronom = e.variante === "axe" ? "le" : "la";
  const debut = [t(`Il faut que la parabole soit ${dessus ? "au-dessus" : "en dessous"} de ${reference(e)} : `)];
  if (e.issue === 2) {
    return souderPonctuation(exterieur ? [...debut, t("c'est le cas à gauche de "), xEgal(e.x1), t(" et à droite de "), xEgal(e.x2), t(".")] : [...debut, t("c'est le cas entre "), xEgal(e.x1), t(" et "), xEgal(e.x2), t(".")]);
  }
  if (e.issue === 1) {
    return souderPonctuation(exterieur ? [...debut, t("c'est le cas partout, sauf en "), xEgal(e.x1), t(` où elle ${pronom} touche.`)] : [...debut, t(`ce n'est le cas nulle part (elle ${pronom} touche seulement en `), xEgal(e.x1), t(").")]);
  }
  return souderPonctuation(exterieur ? [...debut, t("c'est le cas partout.")] : [...debut, t("ce n'est le cas nulle part.")]);
}

export function abscissesFragments(e: E): FragmentConsigne[] {
  const xs = abscisses(e);
  if (xs.length === 0) return [t("Aucun point d'intersection.")];
  if (xs.length === 1) return [t("Un seul point commun (contact) : "), xEgal(xs[0]!), t(".")];
  return [xEgal(xs[0]!), t(" et "), xEgal(xs[1]!), t(".")];
}

export function solutionLatex(e: E): string {
  return `S=${ensembleLatex(solution(e))}`;
}

export function reponseSolutionFragments(e: E): FragmentConsigne[] {
  return [l(solutionLatex(e))];
}

// ---------------------------------------------------------------------------------------------
// Aides
// ---------------------------------------------------------------------------------------------

export function aidesEcran(e: E, ecran: number): FragmentConsigne[][] {
  const ref = reference(e);
  const a: FragmentConsigne[][] =
    ecran === 0
      ? [
          [t(`Cherche les endroits où la parabole croise (ou touche) ${ref}.`)],
          [t("Descends verticalement de chacun de ces points jusqu'à l'axe des x : ses abscisses sont sur les lignes de la grille.")],
        ]
      : ecran === 1
        ? [
            [t("Le symbole décide de la position : "), l("f(x)>" + membreDroit(e)), t(` demande la parabole au-dessus de ${ref}, `), l("f(x)<" + membreDroit(e)), t(" en dessous.")],
            [t(`Regarde de chaque côté des points communs si la parabole passe au-dessus ou en dessous de ${ref}.`)],
          ]
        : [
            [t("Les x qui conviennent forment l'ensemble-solution ; un symbole large (≤ ou ≥) inclut les abscisses des points communs, un symbole strict les exclut.")],
            [t("Crochets inversés : un crochet tourné vers l'extérieur exclut la borne, et "), l("\\pm\\infty"), t(" a toujours un crochet ouvert.")],
          ];
  return a.map(souderPonctuation);
}

// ---------------------------------------------------------------------------------------------
// Figure
// ---------------------------------------------------------------------------------------------

const UNITE = 22;
const COULEUR_DROITE = "#c2410c";

/** SVG de la figure ; `avecPoints` : points d'intersection marqués et étiquetés (corrigé seulement). */
export function figureSvg(e: E, avecPoints = false): string {
  const { xMin, xMax, yMin, yMax } = e.fenetre;
  const dansCadre = (h: (x: number) => number) => (x: number) => {
    const y = h(x);
    return y < yMin - 0.05 || y > yMax + 0.05 ? null : y;
  };
  const points: PointMarqueSvg[] = avecPoints ? abscisses(e).map((x) => ({ x, y: f(e, x), label: `(${String(x).replace("-", "−")} ; ${String(f(e, x)).replace("-", "−")})`, couleur: "#111827", labelPosition: f(e, x) >= yMax - 1.5 ? "dessous" : "dessus" })) : [];
  const etiquetteY = yMax - yMin > 10 ? 2 : 1;
  return fondsSousEtiquettes(construireSvgFonction(dansCadre((x) => f(e, x)), e.fenetre, {
    largeur: UNITE * (xMax - xMin) + 20,
    hauteur: UNITE * (yMax - yMin) + 20,
    classe: "graphe-cyclo",
    grille: { pasX: 1, pasY: 1, etiquetteX: 1, etiquetteY },
    courbesSecondaires: e.variante === "axe" ? [] : [{ evaluer: dansCadre((x) => g(e, x)), couleur: COULEUR_DROITE, pointilles: true }],
    points,
  }));
}

/** Fond blanc sous chaque graduation de l'axe des y : la droite en pointillés qui
 * passe juste à côté d'une graduation « 4 » la faisait lire « −4 ». */
function fondsSousEtiquettes(svg: string): string {
  return svg.replace(/<text x="([\d.-]+)" y="([\d.-]+)" font-size="8" text-anchor="(start|end)"([^>]*)>([^<]*)<\/text>/g, (tout, xs: string, ys: string, ancre: string, _reste: string, contenu: string) => {
    const x = Number(xs);
    const y = Number(ys);
    const w = contenu.length * 4.7 + 2;
    const gauche = ancre === "end" ? x - w + 1 : x - 1;
    return `<rect x="${gauche.toFixed(1)}" y="${(y - 7).toFixed(1)}" width="${w.toFixed(1)}" height="9" fill="#ffffff" opacity="0.9"/>${tout}`;
  });
}
