import type { EtapeCorrection } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceEquationCercle } from "../../core/equationCercle.types";
import { q, qp } from "../../ui/corrigeChapitre3";
import { COURS_CERCLE, lignesEquationCercle, lignesPointSurCercle, lignesRacine, finaliserAnalytique2 } from "../../ui/corrigeAnalytique2";
import { formatEquationAttendueLatex, formatEtatActuelCentreLatex, formatRayonLatex } from "../../ui/formatEquationCercle";
import { formatLongueurIrreductibleLatex } from "../../ui/formatNormeDistance";
import { construireSvgEquationCercle } from "./figure";

/**
 * Corrigé détaillé « comme au tableau » de gen49 « Équation d'un cercle (non développée) à partir
 * d'un graphe » — règle `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN
 * (`sessionEquationCercle.ts` : centre → rayon → équation) ; partagé par l'adaptateur papier et
 * l'appli (`AppEquationCercle.tsx`). Notation de l'écran : rayon R (gabarit
 * (x − x₀)² + (y − y₀)² = R² de l'énoncé). Lectures : une ligne par chose lue, la justification dit
 * où on lit ; rayon direct = écart des abscisses (ou des ordonnées), rayon indirect = composantes
 * de CP puis norme (Pythagore, comme l'exemple du cours, § 8).
 */

type E = ExerciceEquationCercle;

export function correctionDetailleeEquationCercle(e: E): EtapeCorrection[] {
  return finaliserAnalytique2(etapesEquationCercle(e));
}

function etapesEquationCercle(e: E): EtapeCorrection[] {
  const { centre, pointMarque: p, rayonCarre } = e;
  const dx = p.x - centre.x;
  const dy = p.y - centre.y;
  const horizontal = dy === 0;
  const figure = construireSvgEquationCercle(e, { avecCentre: true, avecRayon: true, avecEcarts: e.variante === "rayon_indirect" });
  const rayonExact = formatLongueurIrreductibleLatex(rayonCarre);

  const etapes: EtapeCorrection[] = [
    utilise("a", [texte(`Le centre C d'un cercle est le point situé à la même distance de tous les points du cercle : le milieu du cercle tracé, de gauche à droite comme de bas en haut ${COURS_CERCLE}.`)]),
    calcul("a", [
      ligne(`x_C=${q(centre.x)}`, `le cercle s'étend autant à gauche qu'à droite de la verticale x = ${nbTexte(centre.x)}`),
      ligne(`y_C=${q(centre.y)}`, `le cercle s'étend autant en dessous qu'au-dessus de l'horizontale y = ${nbTexte(centre.y)}`),
    ]),
    { ...resultat("a", [texte("Le centre du cercle est "), latex(`C${formatEtatActuelCentreLatex(e)}`), texte(" (croix verte sur la figure).")]), figureHtml: figure },
    piege("a", [texte("Le centre ne se trouve pas sur le cercle : c'est le point intérieur situé à la même distance de tous les points tracés. Lis ses deux coordonnées sur les axes, l'abscisse d'abord.")]),
  ];

  if (e.variante === "rayon_direct") {
    const ecart = horizontal ? `|x_P-x_C|=|${q(p.x)}-${qp(centre.x)}|` : `|y_P-y_C|=|${q(p.y)}-${qp(centre.y)}|`;
    etapes.push(
      utilise("b", [texte(`Le rayon est la distance du centre C à un point du cercle, ici le point marqué P ; P et C sont sur la même ${horizontal ? "horizontale" : "verticale"} : la distance CP se compte en carreaux ${COURS_CERCLE}.`)]),
      calcul("b", [
        ligne(`x_P=${q(p.x)}`, "P est sur un nœud de la grille"),
        ligne(`y_P=${q(p.y)}`),
        ligne(`R=${ecart}`, horizontal ? "même ordonnée : écart des abscisses" : "même abscisse : écart des ordonnées"),
        ligne(`=${q(Math.abs(horizontal ? dx : dy))}`, "nombre de carreaux entre C et P"),
      ]),
      resultat("b", [texte("Le rayon du cercle est "), latex(`R=${formatRayonLatex(e)}`), texte(".")]),
      piege("b", [texte("Compter les carreaux à partir du centre C, pas à partir d'un axe : le rayon est la distance CP, pas une coordonnée de P.")]),
    );
  } else {
    const carre = (t: number) => (t < 0 ? `(${q(t)})^2` : `${q(t)}^2`);
    etapes.push(
      utilise("b", [
        texte("Le rayon est la distance du centre C au point marqué P. P n'est ni sur l'horizontale ni sur la verticale de C : on calcule les composantes de "),
        latex("\\vec{CP}"),
        texte(" (arrivée moins départ), puis sa norme par Pythagore, "),
        latex("R=\\sqrt{(x_P-x_C)^2+(y_P-y_C)^2}"),
        texte(` ${COURS_CERCLE}.`),
      ]),
      calcul("b", [
        ligne(`x_P=${q(p.x)}`, "P est sur un nœud de la grille"),
        ligne(`y_P=${q(p.y)}`),
        ligne(`\\vec{CP}=\\begin{pmatrix}${q(p.x)}-${qp(centre.x)}\\\\${q(p.y)}-${qp(centre.y)}\\end{pmatrix}`, "arrivée moins départ"),
        ligne(`=\\begin{pmatrix}${q(dx)}\\\\${q(dy)}\\end{pmatrix}`, "écarts horizontal et vertical : les côtés de l'angle droit sur la figure"),
        ligne(`R=\\sqrt{${carre(dx)}+${carre(dy)}}`, "norme de CP (Pythagore)"),
        ...lignesRacine("R", rayonCarre, "on additionne les carrés").map((l) => ({ ...l, latex: l.latex.replace(/^R=/, "=") })),
      ]),
      resultat("b", [texte("Le rayon du cercle est "), latex(`R=${formatRayonLatex(e)}`), texte(".")]),
      piege("b", [texte("Le segment [CP] est en diagonale : compter les carreaux le long de [CP] ne donne pas sa longueur. Seul "), latex(`R^2=${q(rayonCarre)}`), texte(" entrera dans l'équation, le rayon peut rester sous forme de racine.")]),
    );
  }

  const negatif = centre.x < 0 ? { v: "x", c: centre.x } : centre.y < 0 ? { v: "y", c: centre.y } : null;
  etapes.push(
    utilise("c", [texte("Un cercle de centre "), latex("(x_0\\,;\\,y_0)"), texte(" et de rayon R a pour équation "), latex("(x-x_0)^2+(y-y_0)^2=R^2"), texte(`, c'est Pythagore ${COURS_CERCLE}.`)]),
    calcul("c", lignesEquationCercle(centre, rayonCarre, rayonExact)),
    resultat("c", [texte("Le cercle a pour équation "), latex(formatEquationAttendueLatex(e)), texte(".")]),
    verification("c", [texte("Le point marqué P est sur le cercle : ")], lignesPointSurCercle(centre, rayonCarre, p, "P")),
    piege(
      "c",
      negatif
        ? [texte("Dans la parenthèse, on soustrait la coordonnée du centre : "), latex(`${negatif.v}_0=${q(negatif.c)}`), texte(" donne "), latex(`(${negatif.v}+${q(-negatif.c)})^2`), texte(". Et le second membre est "), latex("R^2"), texte(", pas R.")]
        : [texte("Le second membre de l'équation est "), latex(`R^2=${q(rayonCarre)}`), texte(", pas "), latex(`R=${rayonExact}`), texte(".")],
    ),
  );
  return etapes;
}

/** Nombre en texte (justification) : « − » typographique. */
function nbTexte(v: number): string {
  return String(v).replace(/^-/, "−");
}
