import type { EtapeCorrection } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExercicePointMoyen, Manquant } from "../../core5e/pointMoyenStat";
import { decimales, net } from "../../core5e/stat2vLotH1";
import { nL, parL, pointL } from "../../ui5e/ecrituresStat2vLotH1";
import { figureMayer, figureNuageG, n, PRECISION_PREV_X, prevX, prevY, reponse, sommeConnue, sommeTotale, valeurManquante } from "../../ui5e/formatPointMoyenStat";

/**
 * Corrigé détaillé « comme au tableau » de `5gen77`, une lettre par écran : moyennes posées puis calculées,
 * somme totale n·x̄ et valeur effacée par différence (vérifiée en recalculant la moyenne), pente de G₁G₂,
 * b par les coordonnées de G₁ (vérifié avec G₂), prévisions dans les deux sens. Figure : nuage complet
 * avec G, ou G₁, G₂ et la droite de Mayer.
 */

type E = ExercicePointMoyen;
const t = texte;
const f = latex;

const sommeL = (v: number[], d: number): string => v.map((x, i) => (i === 0 ? nL(x, d) : x < 0 ? nL(x, d) : `+${nL(x, d)}`)).join("");

function etapeG(e: E): EtapeCorrection[] {
  const X = e.points.map((p) => p.x);
  const Y = e.points.map((p) => p.y);
  const sx = net(X.reduce((s, v) => s + v, 0));
  const sy = net(Y.reduce((s, v) => s + v, 0));
  return [
    utilise("a", [t("Le point moyen G a pour coordonnées la moyenne des x et la moyenne des y : "), f("\\bar{x}=\\dfrac{1}{n}\\sum x_i"), t(", "), f("\\bar{y}=\\dfrac{1}{n}\\sum y_i"), t(`, ici avec n = ${n(e)}.`)]),
    calcul("a", [
      ligne(`\\bar{x}=\\dfrac{${sommeL(X, e.dx)}}{${n(e)}}=\\dfrac{${nL(sx)}}{${n(e)}}=${nL(e.G.x)}`),
      ligne(`\\bar{y}=\\dfrac{${sommeL(Y, e.dy)}}{${n(e)}}=\\dfrac{${nL(sy)}}{${n(e)}}=${nL(e.G.y)}`),
    ]),
    { ...resultat("a", [f(pointL("G", e.G))]), figureHtml: figureNuageG(e) },
    piege("a", [t("Prendre la médiane, ou le milieu des valeurs extrêmes, au lieu de la moyenne.")]),
  ];
}

function lignesManquant(e: E, m: Manquant, lettre: string, avecTotal: boolean): EtapeCorrection[] {
  const c = m.coord;
  const tot = sommeTotale(e, c);
  const connues = e.points.filter((_, i) => i !== m.i).map((p) => p[c]);
  const d = c === "x" ? e.dx : e.dy;
  const v = valeurManquante(e, m);
  const nom = `${c}_{${m.i + 1}}`;
  const L = [
    ...(avecTotal ? [ligne(`\\sum ${c}_i=n\\cdot\\bar{${c}}=${n(e)}\\times${nL(e.G[c])}=${nL(tot)}`, "somme de toutes les valeurs")] : []),
    ligne(`${nom}=${nL(tot)}-(${sommeL(connues, d)})`, "on retire les valeurs connues"),
    ligne(`${nom}=${nL(tot)}-${parL(sommeConnue(e, c))}=${nL(v)}`),
  ];
  return [
    calcul(lettre, L),
    resultat(lettre, [f(`${nom}=${nL(v)}`)]),
    verification(lettre, [t("On recalcule la moyenne avec la valeur trouvée : "), f(`\\dfrac{${nL(tot)}}{${n(e)}}=${nL(e.G[c])}`), t(".")]),
  ];
}

function etapesUne(e: E): EtapeCorrection[] {
  const m = e.manquants[0]!;
  const c = m.coord;
  return [
    utilise("a", [t("La moyenne est la somme divisée par l'effectif, donc la somme de toutes les valeurs vaut l'effectif fois la moyenne : "), f(`\\bar{${c}}=\\dfrac{\\sum ${c}_i}{n}\\iff\\sum ${c}_i=n\\cdot\\bar{${c}}`), t(".")]),
    calcul("a", [ligne(`\\sum ${c}_i=${n(e)}\\times${nL(e.G[c])}=${nL(sommeTotale(e, c))}`)]),
    resultat("a", reponse(e, "somme")),
    utilise("b", [t("La valeur effacée est ce qui manque aux valeurs connues pour atteindre cette somme.")]),
    ...lignesManquant(e, m, "b", false).map((x, i) => (i === 1 ? { ...x, figureHtml: figureNuageG(e) } : x)),
    piege("b", [t("Faire la moyenne des valeurs connues : la valeur effacée compte dans l'effectif n.")]),
  ];
}

function etapesDeux(e: E): EtapeCorrection[] {
  const mx = e.manquants.find((m) => m.coord === "x")!;
  const my = e.manquants.find((m) => m.coord === "y")!;
  return [
    utilise("a", [t("Pour chaque série, la somme de toutes les valeurs vaut l'effectif fois la moyenne : "), f("\\sum x_i=n\\cdot\\bar{x}"), t(" et "), f("\\sum y_i=n\\cdot\\bar{y}"), t(" ; la valeur effacée est la différence avec les valeurs connues.")]),
    ...lignesManquant(e, mx, "a", true),
    ...lignesManquant(e, my, "b", true).map((x, i) => (i === 1 ? { ...x, figureHtml: figureNuageG(e) } : x)),
    piege("b", [t("Diviser par le nombre de valeurs connues : l'effectif n compte toutes les colonnes du tableau.")]),
  ];
}

function etapesMayer(e: E): EtapeCorrection[] {
  const { G1, G2, a, b, x0, y0 } = e as Required<E>;
  const vx = prevX(e);
  const approche = decimales(vx) > PRECISION_PREV_X;
  return [
    utilise("a", [t("La droite de Mayer est la droite "), f("G_1G_2"), t(" ; pente d'une droite passant par deux points : "), f("a=\\dfrac{y_2-y_1}{x_2-x_1}"), t(".")]),
    calcul("a", [ligne(`a=\\dfrac{${nL(G2.y)}-${parL(G1.y)}}{${nL(G2.x)}-${parL(G1.x)}}=\\dfrac{${nL(net(G2.y - G1.y))}}{${nL(net(G2.x - G1.x))}}=${nL(a)}`)]),
    resultat("a", reponse(e, "pente")),
    utilise("b", [t("La droite passe par "), f("G_1"), t(" : ses coordonnées vérifient "), f("y=ax+b"), t(".")]),
    calcul("b", [ligne(`${nL(G1.y)}=${nL(a)}\\times${parL(G1.x)}+b`), ligne(`b=${nL(G1.y)}-${parL(net(a * G1.x))}=${nL(b)}`)]),
    { ...resultat("b", reponse(e, "equation")), figureHtml: figureMayer(e, true) },
    verification("b", [t("Avec "), f("G_2"), t(" : "), f(`${nL(a)}\\times${parL(G2.x)}${b < 0 ? "" : "+"}${nL(b)}=${nL(G2.y)}`), t(".")]),
    calcul("c", [ligne(`y=${nL(a)}\\times${parL(x0)}${b < 0 ? "" : "+"}${nL(b)}=${nL(prevY(e))}`)], [t("On remplace x par "), f(nL(x0)), t(" dans l'équation.")]),
    resultat("c", reponse(e, "prevY")),
    calcul(
      "d",
      [ligne(`${nL(a)}x${b < 0 ? "" : "+"}${nL(b)}=${nL(y0)}`), ligne(`${nL(a)}x=${nL(y0)}-${parL(b)}=${nL(net(y0 - b))}`), ligne(`x=\\dfrac{${nL(net(y0 - b))}}{${nL(a)}}${approche ? "\\approx" : "="}${nL(vx, PRECISION_PREV_X)}`)],
      [t("On remplace y par "), f(nL(y0)), t(" et on isole x.")],
    ),
    { ...resultat("d", reponse(e, "prevX")), figureHtml: figureMayer(e, true, true) },
    piege("d", [t("Remplacer x par l'ordonnée donnée : ici c'est y qui est connu, on résout une équation en x.")]),
  ];
}

export function correctionDetailleePointMoyen(e: E): EtapeCorrection[] {
  if (e.variante === "pointMoyen") return etapeG(e);
  if (e.variante === "uneValeur") return etapesUne(e);
  if (e.variante === "deuxValeurs") return etapesDeux(e);
  return etapesMayer(e);
}
