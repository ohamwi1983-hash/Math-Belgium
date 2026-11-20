import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceLectureParabole } from "../../core/lectureParabole.types";
import { nombreLatex } from "../../moteur/algebreTransfertSecondDegre";
import { coefC, f } from "../../moteur/modeleLectureParabole";
import { axeLatex, figureAnnotee, imageLatex, reponseImage, reponseIntersections, reponseSignes, reponseSommet } from "../../ui/formatLectureParabole";
import { etiquettePoint } from "../../ui/figureParaboleGrille";

/**
 * Corrigé détaillé « comme au tableau » de gen123 — règle `.claude/rules/feuilles-evaluations.md`,
 * conventions « Lectures graphiques » (une ligne par chose lue, AVEC une relation ; la justification
 * dit où on lit). a) les trois lectures du cours (a, c, puis b par x_S = −b/(2a)), b) sommet et axe,
 * c) zéros et ordonnée à l'origine, d) image, avec la figure annotée.
 */

type E = ExerciceLectureParabole;
const n = nombreLatex;
const COURS = "(cours, § 1)";

function rel(v: number): string {
  return v > 0 ? ">0" : v < 0 ? "<0" : "=0";
}

function lignesSignes(e: E): LigneCalcul[] {
  const c = coefC(e);
  const lignes: LigneCalcul[] = [
    ligne(`a${rel(e.a)}`, `parabole ouverte vers ${e.a > 0 ? "le haut" : "le bas"}`),
    ligne(`c=f(0)=${n(c)}${c === 0 ? "" : rel(c)}`, `la courbe coupe l'axe des y en ${etiquettePoint(0, c)}`),
  ];
  if (e.xS === 0) {
    lignes.push(ligne("x_S=-\\dfrac{b}{2a}=0", "le sommet est sur l'axe des y"), ligne("b=0", "seul b = 0 annule la fraction"));
    return lignes;
  }
  const gauche = e.xS < 0;
  const memeSigne = gauche;
  const sb = memeSigne ? (e.a > 0 ? ">0" : "<0") : e.a > 0 ? "<0" : ">0";
  lignes.push(
    ligne(`x_S=${n(e.xS)}${gauche ? "<0" : ">0"}`, `l'axe de symétrie est à ${gauche ? "gauche" : "droite"} de l'axe des y`),
    ligne(`-\\dfrac{b}{2a}${gauche ? "<0" : ">0"}`, [texte("car "), latex("x_S=-\\dfrac{b}{2a}")]),
    ligne(`\\dfrac{b}{2a}${gauche ? ">0" : "<0"}`, `on change de signe : a et b ont ${memeSigne ? "le même signe" : "des signes opposés"}`),
    ligne(`b${sb}`, [texte("car "), latex(`a${rel(e.a)}`)]),
  );
  return lignes;
}

function lignesZeros(e: E): LigneCalcul[] {
  if (e.zeros.length === 0) {
    return [ligne(`y_S=${n(e.yS)}${rel(e.yS)}`, `sommet ${e.yS > 0 ? "au-dessus" : "en dessous"} de l'axe des x, parabole ouverte vers ${e.a > 0 ? "le haut" : "le bas"} : la courbe ne coupe jamais l'axe des x`)];
  }
  if (e.zeros.length === 1) return [ligne(`f(${n(e.zeros[0]!)})=0`, "la courbe touche l'axe des x en son sommet")];
  return e.zeros.map((z) => ligne(`f(${n(z)})=0`, `la courbe coupe l'axe des x en x = ${String(z).replace("-", "−")}`));
}

export function correctionDetailleeLectureParabole(e: E): EtapeCorrection[] {
  const c = coefC(e);
  const haut = e.a > 0;
  const sortie: EtapeCorrection[] = [];

  // a) signes
  sortie.push(
    utilise("a", [texte("Trois lectures, dans cet ordre : "), latex("a"), texte(" par l'ouverture, "), latex("c=f(0)"), texte(" sur l'axe des y, puis "), latex("b"), texte(" par la position de l'axe, avec "), latex("x_S=-\\dfrac{b}{2a}"), texte(` ${COURS}.`)]),
    calcul("a", lignesSignes(e)),
    resultat("a", reponseSignes(e)),
    piege("a", [texte("Le signe de "), latex("b"), texte(" ne se lit jamais seul : un axe à gauche de l'axe des y donne "), latex("b>0"), texte(" si "), latex("a>0"), texte(", mais "), latex("b<0"), texte(" si "), latex("a<0"), texte(".")]),
  );

  // b) sommet et axe
  const h = 2;
  sortie.push(
    utilise("b", [texte(`Le sommet est le point ${haut ? "le plus bas" : "le plus haut"} de la courbe (`), latex(haut ? "a>0" : "a<0"), texte(") ; l'axe de symétrie est la verticale qui passe par lui, d'équation "), latex("x=x_S"), texte(` ${COURS}.`)]),
    calcul("b", [
      ligne(`x_S=${n(e.xS)}`, `abscisse du point ${haut ? "le plus bas" : "le plus haut"} de la courbe`),
      ligne(`y_S=${n(e.yS)}`, "ordonnée de ce point"),
      ligne(axeLatex(e), "verticale passant par S"),
    ]),
    resultat("b", reponseSommet(e)),
    verification("b", [texte("Deux points de la courbe à la même distance de l'axe ont la même hauteur :")], [ligne(`f(${n(e.xS - h)})=f(${n(e.xS + h)})=${n(f(e, e.xS + h))}`, `points symétriques par rapport à x = ${String(e.xS).replace("-", "−")}`)]),
    piege("b", [texte("L'axe de symétrie est vertical : son équation est "), latex(axeLatex(e)), texte(", jamais "), latex(`y=${n(e.yS)}`), texte(".")]),
  );

  // c) zéros et ordonnée à l'origine
  const lignesC = [...lignesZeros(e), ligne(`f(0)=${n(c)}`, `la courbe coupe l'axe des y en ${etiquettePoint(0, c)}`)];
  sortie.push(
    utilise("c", [texte("Les zéros de "), latex("f"), texte(" sont les abscisses des points où la courbe coupe l'axe des x ; l'ordonnée à l'origine est "), latex("f(0)=c"), texte(`, là où elle coupe l'axe des y ${COURS}.`)]),
    calcul("c", lignesC),
    resultat("c", reponseIntersections(e)),
  );
  if (e.zeros.length === 2) {
    sortie.push(verification("c", [texte("Le milieu des deux zéros est l'abscisse du sommet :")], [ligne(`\\dfrac{${n(e.zeros[0]!)}+${e.zeros[1]! < 0 ? `(${n(e.zeros[1]!)})` : n(e.zeros[1]!)}}{2}=${n(e.xS)}`, [texte("c'est bien "), latex("x_S")])]));
  }
  sortie.push(piege("c", [texte("Un zéro est une abscisse, lue sur l'axe des x ; l'ordonnée à l'origine "), latex("f(0)"), texte(" se lit sur l'axe des y.")]));

  // d) image
  sortie.push(
    utilise("d", [texte("Si "), latex("a>0"), texte(", le sommet est un minimum et "), latex("\\operatorname{im} f=[y_S\\,;+\\infty\\mathclose{[}"), texte(" ; si "), latex("a<0"), texte(", c'est un maximum et "), latex("\\operatorname{im} f=\\mathopen{]}-\\infty\\,;y_S]"), texte(` ${COURS}.`)]),
    calcul("d", [
      ligne(`a${rel(e.a)}`, `parabole ouverte vers ${haut ? "le haut : S est un minimum" : "le bas : S est un maximum"}`),
      ligne(`y_S=${n(e.yS)}`, `valeur ${haut ? "minimale" : "maximale"} de f, atteinte en x = ${String(e.xS).replace("-", "−")}`),
      ligne(`\\operatorname{im} f=${imageLatex(e)}`, [texte(`toutes les hauteurs ${haut ? "à partir de" : "jusqu'à"} `), latex("y_S"), texte(", atteint : crochet fermé")]),
    ]),
    { ...resultat("d", reponseImage(e)), figureHtml: figureAnnotee(e) },
    piege("d", [texte("L'image se lit sur l'axe des y : elle est bornée par "), latex("y_S"), texte(", pas par "), latex("x_S"), texte(" ; le domaine, lui, est toujours "), latex("\\mathbb{R}"), texte(".")]),
  );
  return sortie;
}
