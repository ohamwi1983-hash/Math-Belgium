import type { ExerciceTransformationGraphique } from "../../core/transformationsGraphiques.types";
import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import { finaliserCorrige } from "../../ui/corrigeSecondDegre1";
import { COURS_TRANSFORMER, carreTranslate, coefDevant, coordLatex, facteurTexte, formeCanoniqueLatex, nb, q, translationTexte } from "../../ui/corrigeParabole";
import { svgParabole } from "../../ui/figureParabole";

/**
 * Corrigé détaillé « comme au tableau » de gen8 (« Transformations graphiques d'une parabole »,
 * `AppTransformationsGraphiques.tsx`) — règle `.claude/rules/feuilles-evaluations.md`. Le générateur
 * n'a qu'UN écran (translations, étirement / compression, symétrie et équation lus sur le même
 * graphique) : une seule lettre « a », avec un bloc « Lecture » (une relation par chose lue : sommet,
 * TH, TV, point croix, a) et un bloc « Équation » (une transformation par ligne, de y = x² à la
 * forme canonique, a écrit devant la parenthèse). Figure du corrigé : sommet et point croix
 * étiquetés, même échelle sur les deux axes (`figureParabole.ts`). Partagé par l'adaptateur papier
 * et l'appli.
 */

type E = ExerciceTransformationGraphique;

export function aTransformation(e: E): number {
  return (e.sox ? -1 : 1) * (e.ev / e.cv);
}

/** Équation de l'écran : f(x) = a(x − x_S)² + y_S, a devant la parenthèse (décision de l'utilisateur). */
export function equationTransformationLatex(e: E): string {
  return `f(x)=${formeCanoniqueLatex(aTransformation(e), e.p, e.q)}`;
}

export function correctionDetailleeTransformationsGraphiques(e: E): EtapeCorrection[] {
  const l = "a";
  const a = aTransformation(e);
  const r = Math.abs(a);
  const xc = e.p + 1;
  const yc = e.q + a;
  const lecture: LigneCalcul[] = [
    ligne(`S=${coordLatex(e.p, e.q)}`, "sommet lu sur le graphique"),
    ligne(`\\text{TH}=x_S=${q(e.p)}`, translationTexte(e.p, "horizontale")),
    ligne(`\\text{TV}=y_S=${q(e.q)}`, translationTexte(e.q, "verticale")),
    ligne(`\\text{point croix}=${coordLatex(xc, yc)}`, "point de la courbe une unité à droite du sommet"),
    ligne(`a=${q(yc)}-${e.q < 0 ? `\\left(${q(e.q)}\\right)` : q(e.q)}`, "écart vertical du point croix au sommet"),
    ligne(`=${q(a)}`, a < 0 ? "négatif : le point croix est sous le sommet, symétrie d'axe Ox (SOX)" : "positif : pas de symétrie d'axe Ox"),
    ligne(`|a|=${q(r)}`, `${facteurTexte(r)}${r === 1 ? "" : ` (EV/CV = ${nb(r)})`}`),
  ];
  const equation: LigneCalcul[] = [ligne("y=x^2", "parabole de référence")];
  let courante = "x^2";
  if (e.p !== 0) {
    courante = carreTranslate(e.p);
    equation.push(ligne(`y=${courante}`, [texte("TH : x devient "), latex(carreTranslate(e.p).replace(/^\(|\)\^2$/g, ""))]));
  }
  if (r !== 1) {
    courante = `${coefDevant(r)}${carreTranslate(e.p)}`;
    equation.push(ligne(`y=${courante}`, r > 1 ? `étirement vertical : on multiplie par ${nb(r)}` : `compression verticale : on multiplie par ${nb(r)}`));
  }
  if (a < 0) {
    courante = `${coefDevant(a)}${carreTranslate(e.p)}`;
    equation.push(ligne(`y=${courante}`, "SOX : on change le signe"));
  }
  equation.push(ligne(equationTransformationLatex(e), e.q === 0 ? "pas de translation verticale" : e.q > 0 ? `TV : on ajoute ${nb(e.q)}` : `TV : on soustrait ${nb(-e.q)}`));
  return finaliserCorrige([
    utilise(l, [
      texte("Le sommet "),
      latex("(0\\,;\\,0)"),
      texte(" de "),
      latex("y=x^2"),
      texte(" est amené au sommet S par les translations : "),
      latex("\\text{TH}=x_S"),
      texte(", "),
      latex("\\text{TV}=y_S"),
      texte(". Sur "),
      latex("y=x^2"),
      texte(", le point situé une unité à droite du sommet est une unité plus haut ; sur la parabole donnée, ce point (le point croix) est à a unités du sommet en hauteur : "),
      latex("|a|=\\dfrac{\\text{EV}}{\\text{CV}}"),
      texte(", et "),
      latex("a<0"),
      texte(" s'il est sous le sommet (SOX). Forme canonique : "),
      latex("f(x)=a(x-x_S)^2+y_S"),
      texte(`, a écrit devant la parenthèse ${COURS_TRANSFORMER}.`),
    ]),
    { ...calcul(l, lecture, [], "Lecture"), figureHtml: svgParabole(a, e.p, e.q, { annote: true }) },
    calcul(l, equation, [], "Équation"),
    resultat(l, [latex(equationTransformationLatex(e))]),
    verification(l, [
      texte("Le point croix doit vérifier l'équation : "),
      latex(`f\\left(${q(xc)}\\right)=${q(a)}\\cdot 1^2${e.q === 0 ? "" : e.q > 0 ? `+${q(e.q)}` : `-${q(-e.q)}`}=${q(yc)}`),
      texte(" ✓"),
    ]),
    piege(
      l,
      e.p !== 0
        ? [texte("Dans la parenthèse, on soustrait l'abscisse du sommet : un sommet en "), latex(`x=${q(e.p)}`), texte(" donne "), latex(carreTranslate(e.p)), texte(e.p < 0 ? ", avec un « + »." : ".")]
        : r < 1
          ? [texte("Un écart vertical plus petit que 1 signale une compression, pas un étirement.")]
          : [texte("a se lit sur l'écart au sommet, pas sur l'ordonnée du point croix elle-même.")],
    ),
  ]);
}
