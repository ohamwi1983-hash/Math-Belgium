import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceConstructionDroite } from "../../core/constructionDroite.types";
import type { Point } from "../../core/vecteur.types";
import { nombreTexte, plusQ, q, qp } from "../../ui/corrigeChapitre3";
import { COURS_DROITE, COURS_LIRE_TRACER, equation, lignesPointCartesienne, lignesPointSurCartesienne, produit, pt, type Fragments } from "../../ui/corrigeAnalytique1";
import { finaliserVecteurs } from "../../ui/corrigeVecteurs2";
import { formatEnonceLatex } from "../../ui/formatConstructionDroite";
import { construireSvgConstructionDroite, secondPoint } from "./figure";

/**
 * Corrigé détaillé « comme au tableau » de gen44 « Construction graphique — tracer une droite » — règle
 * `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN (`AppConstructionDroite.tsx`,
 * `ORDRE_PHASES`) : a = deux points à coordonnées entières calculés depuis l'équation (valeur choisie,
 * coordonnée calculée, une opération par ligne) ; b = points placés (où on avance sur chaque axe) et
 * droite tracée (figure). `points` : à l'écran, les deux points CONFIRMÉS à l'étape a (ceux de l'élève),
 * pour l'étape b ; sur papier, A et B = A + u. Partagé par l'adaptateur papier et l'appli.
 */

type E = ExerciceConstructionDroite;

function lignesPoint(e: E, nom: string, p: Point, t: number): LigneCalcul[] {
  switch (e.variante) {
    case "parametrique": {
      const d = e.parametrique!;
      const coord = (c0: number, a: number, v: string) =>
        a === 0 ? ligne(`${v}_${nom}=${q(c0)}`) : ligne(`${v}_${nom}=${q(c0)}${a > 0 ? "+" : "-"}${Math.abs(a) === 1 ? "" : `${q(Math.abs(a))}\\cdot `}${t}=${q(c0 + a * t)}`);
      return [ligne(`t=${t}`, "valeur entière choisie, la même dans les deux équations"), coord(d.x0, d.a, "x"), coord(d.y0, d.b, "y")];
    }
    case "implicite":
      return lignesPointCartesienne(e.implicite!, nom, p);
    case "explicite_y": {
      const { m, p: o } = e.expliciteY!;
      return [
        ligne(`x_${nom}=${q(p.x)}`, m === 0 ? "on choisit l'abscisse (y ne dépend pas de x)" : Number.isInteger(m) ? "on choisit l'abscisse" : "abscisse multiple du dénominateur de m : y sera entier"),
        ligne(m === 0 ? `y_${nom}=${q(o)}` : `y_${nom}=${produit(m, p.x)}${plusQ(o)}=${q(p.y)}`, "on remplace x dans y = mx + p"),
      ];
    }
    case "explicite_x": {
      const { n, q: o } = e.expliciteX!;
      return [
        ligne(`y_${nom}=${q(p.y)}`, n === 0 ? "on choisit l'ordonnée (x ne dépend pas de y)" : Number.isInteger(n) ? "on choisit l'ordonnée" : "ordonnée multiple du dénominateur de n : x sera entier"),
        ligne(n === 0 ? `x_${nom}=${q(o)}` : `x_${nom}=${produit(n, p.y)}${plusQ(o)}=${q(p.x)}`, "on remplace y dans x = ny + q"),
      ];
    }
  }
}

function methode(e: E): Fragments {
  switch (e.variante) {
    case "parametrique":
      return [texte("Chaque valeur du paramètre t donne un point (x ; y) de la droite : on remplace t par la même valeur dans les deux équations "), texte(`${COURS_DROITE}.`)];
    case "implicite":
      return [texte("Un point de la droite vérifie son équation : on fixe une coordonnée (l'abscisse, ou l'ordonnée si la droite est verticale) et on résout pour trouver l'autre "), texte(`${COURS_LIRE_TRACER}.`)];
    case "explicite_y":
      return [texte("On remplace x par une valeur et on calcule "), latex("y=mx+p"), texte(" ; si m est une fraction, x multiple de son dénominateur donne un y entier "), texte(`${COURS_LIRE_TRACER}.`)];
    case "explicite_x":
      return [texte("On remplace y par une valeur et on calcule "), latex("x=ny+q"), texte(" ; si n est une fraction, y multiple de son dénominateur donne un x entier "), texte(`${COURS_LIRE_TRACER}.`)];
  }
}

/** « on avance de 3 unités vers la droite » (ou « pas de déplacement horizontal »). */
function deplacement(v: number, axe: "x" | "y"): string {
  if (v === 0) return axe === "x" ? "sur l'axe vertical (abscisse nulle)" : "sur l'axe horizontal (ordonnée nulle)";
  const n = Math.abs(v);
  const unite = `${nombreTexte(n)} unité${n > 1 ? "s" : ""}`;
  return axe === "x" ? `depuis l'origine, ${unite} vers la ${v > 0 ? "droite" : "gauche"}` : `puis ${unite} vers le ${v > 0 ? "haut" : "bas"}`;
}

export function correctionDetailleeConstructionDroite(e: E, points?: [Point, Point]): EtapeCorrection[] {
  const a = e.point;
  const b = secondPoint(e.point, e.vecteur);
  const [p1, p2] = points ?? [a, b];
  const u = { x: p2.x - p1.x, y: p2.y - p1.y };
  const piegeA: Fragments =
    e.variante === "parametrique"
      ? [texte("Une même valeur de t sert pour x ET pour y : on ne choisit pas une valeur de t différente dans chaque équation.")]
      : e.variante === "implicite"
        ? [texte("Les coefficients a et b de l'équation ne sont pas les coordonnées d'un point : on vérifie que chaque point choisi satisfait l'équation.")]
        : [texte("Avec un coefficient fractionnaire, toutes les valeurs ne donnent pas une coordonnée entière : on prend un multiple du dénominateur.")];
  const piegeB: Fragments =
    e.vecteur.x === 0
      ? [texte("Une équation du type "), latex("x=k"), texte(" représente une droite VERTICALE (tous ses points ont la même abscisse).")]
      : e.vecteur.y === 0
        ? [texte("Une équation du type "), latex("y=k"), texte(" représente une droite HORIZONTALE (tous ses points ont la même ordonnée).")]
        : [texte("On trace la droite entière, prolongée des deux côtés, pas seulement le segment [AB].")];
  return finaliserVecteurs([
    utilise("a", methode(e)),
    calcul("a", lignesPoint(e, "A", a, 0), [], "Premier point"),
    calcul("a", lignesPoint(e, "B", b, 1), [], "Second point"),
    resultat("a", [latex(pt("A", a)), texte(" et "), latex(pt("B", b)), texte(" sont deux points distincts de d.")]),
    ...(e.variante === "parametrique"
      ? []
      : [verification("a", [texte("Les deux points vérifient l'équation cartésienne "), latex(equation(e.referenceImplicite)), texte(" de d : ")], [...lignesPointSurCartesienne(e.referenceImplicite, a, "A"), ...lignesPointSurCartesienne(e.referenceImplicite, b, "B")])]),
    piege("a", piegeA),
    utilise("b", [texte("Un point se place en partant de l'origine : l'abscisse sur l'axe horizontal, puis l'ordonnée sur l'axe vertical ; deux points distincts suffisent pour tracer la droite "), texte(`${COURS_LIRE_TRACER}.`)]),
    calcul(
      "b",
      [
        ligne(`x_A=${q(p1.x)}`, deplacement(p1.x, "x")),
        ligne(`y_A=${q(p1.y)}`, deplacement(p1.y, "y")),
        ligne(`x_B=${q(p2.x)}`, deplacement(p2.x, "x")),
        ligne(`y_B=${q(p2.y)}`, deplacement(p2.y, "y")),
      ],
      [],
      "Placement",
    ),
    {
      ...resultat("b", [texte("On place "), latex(pt("A", p1)), texte(" et "), latex(pt("B", p2)), texte(", puis on trace la droite (AB), prolongée jusqu'aux bords du repère : c'est "), latex(`d\\equiv ${formatEnonceLatex(e)}`), texte(".")]),
      figureHtml: construireSvgConstructionDroite(e, true, [p1, p2]),
    },
    verification("b", [texte("De A à B, on avance de "), latex(qp(u.x)), texte(" horizontalement et de "), latex(qp(u.y)), texte(" verticalement : c'est un vecteur directeur de d, la direction tracée est la bonne.")]),
    piege("b", piegeB),
  ]);
}
