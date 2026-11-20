import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { construireSvgFonction, type PointMarqueSvg } from "../../export/svgGraph";
import type { ExerciceAssocierParaboles, ParaboleDonnee } from "../core/associerParaboles.types";
import { NOMS, equationNommee, fenetre, ordonneeOrigine, pasLecture, valeur, zerosEntiers } from "../moteur/modeleAssocierParaboles";
import type { EcranTSD } from "./ecransTransfertSecondDegre";
import { souderPonctuation } from "./formatDetectiveVecteurs";
import { q } from "./corrigeChapitre3";

/**
 * Textes et figures de gen128 « Associer paraboles et équations » — SOURCE UNIQUE pour l'écran, les
 * aides, le papier et le corrigé. Lecture du cours (§ 2) : la forme canonique a(x − x_S)² + y_S donne
 * le sommet, la forme factorisée a(x − x₁)(x − x₂) les zéros, la forme développée ax² + bx + c
 * l'ordonnée à l'origine c ; le signe de a donne le sens, |a| l'écart vertical à un carreau du
 * sommet. Figures : quadrillage d'une unité, MÊME échelle en x et en y, valeurs entières.
 */

type E = ExerciceAssocierParaboles;
type Fr = FragmentConsigne[];
const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

export { souderPonctuation };

export const CONSIGNE_GENERALE = "Associe chaque courbe à son équation.";

export function enonceFragments(): Fr {
  return [t("Voici quatre équations et leurs quatre paraboles, dans le désordre :")];
}

export function listeEquations(e: E): Fr {
  return e.paraboles.flatMap((_, i) => (i === 0 ? [l(equationNommee(e, i))] : [t(" ; "), l(equationNommee(e, i))]));
}

export function consignePapier(): Fr {
  return [t("Associe chaque courbe à son équation ; justifie chaque choix par une lecture du graphique (sommet, sens, zéros ou ordonnée à l'origine).")];
}

export function consigneEcran(n: number): Fr {
  return [t(`Quelle équation a pour graphique la courbe ${n + 1} ?`)];
}

export function reponseEcran(e: E, n: number): Fr {
  return souderPonctuation([t(`La courbe ${n + 1} est celle de `), l(equationNommee(e, e.ordre[n]!)), t(".")]);
}

export function reponseBreveFragments(e: E): Fr {
  return souderPonctuation(e.ordre.flatMap((i, n) => [t(`${n ? " ; " : ""}courbe ${n + 1} : `), l(NOMS[i]!)]));
}

// ---------------------------------------------------------------------------------------------
// Figures
// ---------------------------------------------------------------------------------------------

const UNITE = 26;

/** Courbe n + 1 (même fenêtre pour les quatre) ; `annotee` : sommet et zéros marqués (corrigé). */
export function figureCourbe(e: E, n: number, annotee = false): string {
  const p = e.paraboles[e.ordre[n]!]!;
  const fen = fenetre(e);
  const dansCadre = (x: number) => {
    const y = valeur(p, x);
    return y < fen.yMin - 0.05 || y > fen.yMax + 0.05 ? null : y;
  };
  const points: PointMarqueSvg[] = annotee
    ? [
        { x: p.h, y: p.k, label: `S(${q(p.h).replace("-", "−")} ; ${q(p.k).replace("-", "−")})`, couleur: "#111827", labelPosition: p.a > 0 ? "dessous" : "dessus" },
        ...zerosEntiers(p).map((z): PointMarqueSvg => ({ x: z, y: 0, couleur: "#111827", label: q(z).replace("-", "−"), labelPosition: p.a > 0 ? "dessus" : "dessous" })),
      ]
    : [];
  const svg = construireSvgFonction(dansCadre, fen, {
    largeur: UNITE * (fen.xMax - fen.xMin) + 20,
    hauteur: UNITE * (fen.yMax - fen.yMin) + 20,
    classe: "graphe-cyclo",
    grille: { pasX: 1, pasY: 1, etiquetteX: 1, etiquetteY: 1 },
    lettre: `Courbe ${n + 1}`,
    points,
  });
  return svg;
}

// ---------------------------------------------------------------------------------------------
// Explication d'un choix faux (ce que donnerait l'équation choisie)
// ---------------------------------------------------------------------------------------------

/** Texte brut (le message d'un choix faux n'est pas rendu en KaTeX) : « (2 ; −3) ». */
const nb = (v: number) => (v < 0 ? `−${-v}` : String(v));
function point(x: number, y: number): string {
  return `(${nb(x)} ; ${nb(y)})`;
}

export function explicationChoix(e: E, n: number, choisi: number): string {
  const vraie = e.paraboles[e.ordre[n]!]!;
  const s = e.paraboles[choisi]!;
  const d: string[] = [];
  if (s.h !== vraie.h || s.k !== vraie.k) d.push(`un sommet ${point(s.h, s.k)} (celui de la courbe est ${point(vraie.h, vraie.k)})`);
  if (s.a > 0 !== vraie.a > 0) d.push(`une parabole tournée vers le ${s.a > 0 ? "haut" : "bas"} (la courbe est tournée vers le ${vraie.a > 0 ? "haut" : "bas"})`);
  else if (s.a !== vraie.a) {
    const m = pasLecture(vraie) === 1 ? pasLecture(s) : pasLecture(vraie);
    d.push(`le point ${point(s.h + m, valeur(s, s.h + m))} (la courbe passe par ${point(vraie.h + m, valeur(vraie, vraie.h + m))})`);
  }
  if (d.length === 0) {
    const zs = zerosEntiers(s);
    d.push(zs.length ? `des zéros ${zs.map(nb).join(" et ")}` : "aucun zéro");
  }
  return `L'équation de ${NOMS[choisi]} donnerait ${d.join(" et ")}.`;
}

// ---------------------------------------------------------------------------------------------
// Aides et écrans
// ---------------------------------------------------------------------------------------------

export function aides(e: E): Fr[] {
  const n1: Fr = [
    t("Pour chaque équation, lis ce que son écriture montre : le sommet sur "),
    l("a(x-x_S)^2+y_S"),
    t(", les zéros sur "),
    l("a(x-x_1)(x-x_2)"),
    t(", l'ordonnée à l'origine c sur "),
    l("ax^2+bx+c"),
    t(" ; le signe de a donne le sens. Compare avec la courbe."),
  ];
  const n2: Record<E["variante"], Fr> = {
    signesSommet: [t("Seuls les signes changent : "), l("(x-2)^2"), t(" donne "), l("x_S=2"), t(", "), l("(x+2)^2"), t(" donne "), l("x_S=-2"), t(" ; "), l("y_S"), t(" se lit avec son signe. Lis le sommet de la courbe sur le quadrillage.")],
    coefficientA: [t("Même sommet pour les quatre : le signe de a donne le sens ; puis, à m carreaux du sommet, la courbe s'écarte verticalement de "), l("a\\cdot m^2"), t(" (un carreau : "), l("|a|"), t(" ; trois carreaux avec "), l("|a|=\\dfrac{1}{3}"), t(" : 3).")],
    factorisee: [t("Dans "), l("a(x-x_1)(x-x_2)"), t(", les zéros sont les nombres qui annulent les facteurs : "), l("(x+3)"), t(" s'annule pour "), l("x=-3"), t(". Le signe de a donne le sens.")],
    troisEcritures: [t("Forme factorisée : les zéros ; forme canonique : le sommet ; forme développée : l'ordonnée à l'origine c et le sens (signe de a). Une seule différence suffit à écarter une équation.")],
  };
  return [n1, n2[e.variante]];
}

export function ecrans(e: E): EcranTSD[] {
  return [0, 1, 2, 3].map((n) => ({
    type: "choix",
    titre: `Courbe ${n + 1}`,
    consigne: consigneEcran(n),
    options: e.paraboles.map((_, i) => [l(equationNommee(e, i))]),
    bonne: e.ordre[n]!,
    aides: aides(e),
    messageFaux: "Ce n'était pas la bonne équation (une seule tentative sur un choix fermé).",
    explications: e.paraboles.map((_, i) => (i === e.ordre[n] ? "" : explicationChoix(e, n, i))),
    figure: figureCourbe(e, n),
  }));
}

/** Lectures d'une courbe (corrigé) : sommet, sens, point à m carreaux, zéros, ordonnée à l'origine. */
export function lectures(p: ParaboleDonnee): { m: number; yPas: number; zeros: number[]; c: number } {
  const m = pasLecture(p);
  return { m, yPas: valeur(p, p.h + m), zeros: zerosEntiers(p), c: ordonneeOrigine(p) };
}
