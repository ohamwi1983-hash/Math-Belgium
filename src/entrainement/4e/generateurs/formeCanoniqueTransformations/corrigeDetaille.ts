import type { ExerciceFormeCanoniqueTransformation } from "../../core/formeCanoniqueTransformations.types";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import { calculerFormeGenerale, formatFormeGeneraleLatex } from "../../ui/formatFormeCanoniqueTransformations";
import { finaliserCorrige } from "../../ui/corrigeSecondDegre1";
import {
  COURS_TRANSFORMER,
  carreTranslate,
  coefDevant,
  facteurTexte,
  formeCanoniqueLatex,
  lignesAbscisseSommet,
  lignesOrdonneeSommet,
  nb,
  pointLatex,
  q,
  translationTexte,
  trinomeLatex,
} from "../../ui/corrigeParabole";
import { svgParabole } from "../../ui/figureParabole";

/**
 * Corrigé détaillé « comme au tableau » de gen9 (« Forme canonique et transformations »,
 * `AppFormeCanoniqueTransformations.tsx`) — règle `.claude/rules/feuilles-evaluations.md`. Une
 * lettre par ÉCRAN : a) sommet et forme canonique, b) translation horizontale → (x − x_S)²,
 * c) étirement / compression / symétrie → a(x − x_S)², d) translation verticale → forme finale.
 * Notation du cours : a(x − x_S)² + y_S, a écrit devant la parenthèse ; TH et TV pour les
 * translations. Partagé par l'adaptateur papier et l'appli (corrigé de l'étape ratée).
 */

type E = ExerciceFormeCanoniqueTransformation;

export type PhaseFormeCanonique = "canonique" | "th" | "evCvSox" | "tv";
export const PHASES_FORME_CANONIQUE: PhaseFormeCanonique[] = ["canonique", "th", "evCvSox", "tv"];

export function lettrePhaseFormeCanonique(phase: PhaseFormeCanonique): string {
  return "abcd"[PHASES_FORME_CANONIQUE.indexOf(phase)]!;
}

/** Coefficient a de la forme canonique (et de x² dans la forme développée). */
export function aFormeCanonique(e: E): number {
  return (e.sox ? -1 : 1) * (e.ev / e.cv);
}

/** f(x) = a(x − x_S)² + y_S, a devant la parenthèse. */
export function formeCanoniqueFinaleLatex(e: E): string {
  return `f(x)=${formeCanoniqueLatex(aFormeCanonique(e), e.xS, e.yS)}`;
}

/** Consignes de chaque écran (titres « Étape n — … » du corrigé). */
export function consigneEtapeFormeCanonique(phase: PhaseFormeCanonique): FragmentConsigne[] {
  switch (phase) {
    case "canonique":
      return [texte("Retrouve les coordonnées du sommet, puis écris la forme canonique complète de f(x).")];
    case "th":
      return [texte("Détermine la translation horizontale (TH) à partir de "), latex("y=x^2"), texte(" et écris la fonction obtenue.")];
    case "evCvSox":
      return [texte("Détermine l'étirement ou la compression verticale (rapport EV/CV) et la symétrie d'axe Ox (SOX), et écris la fonction obtenue.")];
    case "tv":
      return [texte("Détermine la translation verticale (TV) et écris la fonction finale.")];
  }
}

function etapeCanonique(e: E): EtapeCorrection[] {
  const l = "a";
  const g = calculerFormeGenerale(e);
  const A = g.a / g.denominateur;
  const B = g.b / g.denominateur;
  const C = g.c / g.denominateur;
  const forme = formeCanoniqueLatex(A, e.xS, e.yS);
  const lignes: LigneCalcul[] = [
    ligne(`a=${q(A)}`, "coefficient de x² : il reste le même dans la forme canonique"),
    ...lignesAbscisseSommet(A, B),
    ...lignesOrdonneeSommet(A, B, C, e.xS),
    ligne(`f(x)=${forme}`, [texte("on remplace a, "), latex("x_S"), texte(" et "), latex("y_S"), texte(" dans "), latex("a(x-x_S)^2+y_S")]),
  ];
  // Vérification : on redéveloppe la forme canonique.
  const coef = coefDevant(A);
  const interieur = trinomeLatex(1, -2 * e.xS, e.xS * e.xS);
  const verif: LigneCalcul[] =
    e.xS === 0
      ? [ligne(`${forme}=${trinomeLatex(A, B, C)}`, "c'est bien f(x) ✓")]
      : [
          ligne(`${forme}=${coef === "" ? "" : coef === "-" ? "-" : `${coef}`}(${interieur})${e.yS === 0 ? "" : e.yS > 0 ? `+${q(e.yS)}` : `-${q(-e.yS)}`}`, "on développe le carré"),
          ligne(`=${trinomeLatex(A, B, C)}`, "on distribue a et on réduit : c'est bien f(x) ✓"),
        ];
  return [
    utilise(l, [
      texte("Le sommet a pour abscisse "),
      latex("x_S=-\\dfrac{b}{2a}"),
      texte(" et pour ordonnée "),
      latex("y_S=f(x_S)"),
      texte(" ; la forme canonique s'écrit "),
      latex("f(x)=a(x-x_S)^2+y_S"),
      texte(`, avec le même a que devant x² ${COURS_TRANSFORMER}.`),
    ]),
    calcul(l, lignes, [texte("Sur "), latex(formatFormeGeneraleLatex(e).replace(/\\frac/g, "\\dfrac").replace(/\s+/g, "")), texte(" :")]),
    resultat(l, [texte("Sommet "), latex(pointLatex("S", e.xS, e.yS)), texte(", forme canonique "), latex(`f(x)=${forme}`)]),
    verification(l, [texte("On redéveloppe la forme canonique :")], verif),
    piege(
      l,
      e.xS !== 0
        ? [texte("Dans la parenthèse, on soustrait l'abscisse du sommet : "), latex(`x_S=${q(e.xS)}`), texte(" donne "), latex(carreTranslate(e.xS)), texte(e.xS < 0 ? ", avec un « + »." : ".")]
        : [texte("Le coefficient a de la forme canonique est celui de x² : il ne change pas.")],
    ),
  ];
}

function etapeTh(e: E): EtapeCorrection[] {
  const l = "b";
  return [
    utilise(l, [texte("Une translation horizontale de TH unités remplace x par "), latex("x-\\text{TH}"), texte(" ; elle amène le sommet de "), latex("y=x^2"), texte(" à l'abscisse "), latex("x_S"), texte(", donc "), latex("\\text{TH}=x_S"), texte(` ${COURS_TRANSFORMER}.`)]),
    calcul(l, [
      ligne(`\\text{TH}=x_S=${q(e.xS)}`, translationTexte(e.xS, "horizontale")),
      ligne("y=x^2", "parabole de référence"),
      ligne(`y=${carreTranslate(e.xS)}`, e.xS === 0 ? "aucune translation horizontale" : [texte("x devient "), latex(carreTranslate(e.xS).replace(/^\(|\)\^2$/g, ""))]),
    ]),
    resultat(l, [latex(`\\text{TH}=${q(e.xS)}`), texte(" ; fonction obtenue "), latex(`y=${carreTranslate(e.xS)}`)]),
    piege(l, [texte("Une translation vers la droite ("), latex("\\text{TH}>0"), texte(") s'écrit avec un « − » dans la parenthèse, vers la gauche avec un « + ».")]),
  ];
}

function etapeEvCvSox(e: E): EtapeCorrection[] {
  const l = "c";
  const A = aFormeCanonique(e);
  const r = e.ev / e.cv;
  return [
    utilise(l, [
      texte("Le coefficient a donne le reste : "),
      latex("|a|=\\dfrac{\\text{EV}}{\\text{CV}}"),
      texte(" ("),
      latex("|a|>1"),
      texte(" : étirement vertical, "),
      latex("|a|<1"),
      texte(" : compression verticale) et "),
      latex("a<0"),
      texte(` signale une symétrie d'axe Ox (SOX) ${COURS_TRANSFORMER}.`),
    ]),
    calcul(l, [
      ligne(`a=${q(A)}`, "coefficient de la forme canonique"),
      ligne(`|a|=${q(r)}`, `${facteurTexte(r)} (EV/CV = ${nb(r)})`),
      ligne(A < 0 ? "a<0" : "a>0", A < 0 ? "symétrie d'axe Ox (SOX)" : "pas de symétrie d'axe Ox"),
      ligne(`y=${coefDevant(A)}${carreTranslate(e.xS)}`, [texte("on multiplie "), latex(carreTranslate(e.xS)), texte(" par a")]),
    ]),
    resultat(l, [texte(`${facteurTexte(r)[0]!.toUpperCase()}${facteurTexte(r).slice(1)}, ${A < 0 ? "symétrie d'axe Ox" : "pas de symétrie"} ; fonction obtenue `), latex(`y=${coefDevant(A)}${carreTranslate(e.xS)}`)]),
    piege(
      l,
      r < 1
        ? [latex("|a|<1"), texte(" : c'est une compression (la parabole s'aplatit), pas un étirement.")]
        : [texte("Seul le rapport EV/CV compte : plusieurs réglages des curseurs donnent la même valeur de "), latex("|a|"), texte(".")],
    ),
  ];
}

function etapeTv(e: E): EtapeCorrection[] {
  const l = "d";
  const A = aFormeCanonique(e);
  return [
    utilise(l, [texte("Une translation verticale de TV unités ajoute TV à la fonction ; elle amène le sommet à l'ordonnée "), latex("y_S"), texte(", donc "), latex("\\text{TV}=y_S"), texte(` ${COURS_TRANSFORMER}.`)]),
    calcul(l, [
      ligne(`\\text{TV}=y_S=${q(e.yS)}`, translationTexte(e.yS, "verticale")),
      ligne(`f(x)=${formeCanoniqueLatex(A, e.xS, e.yS)}`, e.yS === 0 ? "aucune translation verticale" : e.yS > 0 ? `on ajoute ${nb(e.yS)}` : `on soustrait ${nb(-e.yS)}`),
    ]),
    { ...resultat(l, [latex(`\\text{TV}=${q(e.yS)}`), texte(" ; fonction finale "), latex(formeCanoniqueFinaleLatex(e))]), figureHtml: svgParabole(A, e.xS, e.yS, { annote: true }) },
    verification(l, [
      texte("Le point croix, une unité à droite du sommet, est à a unités du sommet en hauteur : "),
      latex(`f\\left(${q(e.xS + 1)}\\right)=${q(A)}\\cdot 1^2${e.yS === 0 ? "" : e.yS > 0 ? `+${q(e.yS)}` : `-${q(-e.yS)}`}=${q(A + e.yS)}`),
      texte(" ✓"),
    ]),
    piege(l, [texte("La translation verticale s'ajoute à la fin, hors de la parenthèse : elle ne change ni l'axe ni l'ouverture.")]),
  ];
}

export function correctionDetailleeFormeCanoniqueTransformations(e: E): EtapeCorrection[] {
  return finaliserCorrige([...etapeCanonique(e), ...etapeTh(e), ...etapeEvCvSox(e), ...etapeTv(e)]);
}
