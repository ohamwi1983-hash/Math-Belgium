import type { EtapeCorrection } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceMoindresCarres } from "../../core5e/moindresCarres";
import { decimales, net } from "../../core5e/stat2vLotH1";
import { avecRenvoiCours, nL, parL, plusL } from "../../ui5e/ecrituresStat2vLotH1";
import { figureEtat, prevX, prevY, reponse } from "../../ui5e/formatMoindresCarres";

/**
 * Corrigé détaillé « comme au tableau » de `5gen37`, une lettre par écran. `main` : moyennes, tableau des
 * écarts (KaTeX `array` : xᵢ, yᵢ, Xᵢ, Yᵢ, XᵢYᵢ, Xᵢ² et la ligne des sommes), a = ΣXᵢYᵢ / ΣXᵢ², b par G,
 * prévision. `calculatrice` : lecture de a et b (« 2-Var Stats » de la TI-30XB), prévisions dans les deux
 * sens. Figure : nuage, G, droite.
 */

type E = ExerciceMoindresCarres;
const t = texte;
const f = latex;
const somL = (v: number[]) => v.map((x, i) => (i === 0 ? nL(x) : x < 0 ? nL(x) : `+${nL(x)}`)).join("");
const egalOuEnviron = (v: number, d: number) => (decimales(v) <= d ? "=" : "\\approx");

function tableauEcarts(e: E): string {
  const L = e.points.map((p) => {
    const X = net(p.x - e.G.x);
    const Y = net(p.y - e.G.y);
    return `${nL(p.x)}&${nL(p.y)}&${nL(X)}&${nL(Y)}&${nL(net(X * Y))}&${nL(net(X * X))}`;
  });
  return `\\begin{array}{cc|cc|cc}x_i&y_i&X_i&Y_i&X_iY_i&X_i^2\\\\\\hline ${L.join("\\\\")}\\\\\\hline &&0&0&${nL(e.sXY)}&${nL(e.sX2)}\\end{array}`;
}

function main(e: E): EtapeCorrection[] {
  const n = e.points.length;
  const X = e.points.map((p) => p.x);
  const Y = e.points.map((p) => p.y);
  return [
    utilise("a", [t("La droite des moindres carrés passe par le point moyen "), f("G(\\bar{x}\\,;\\bar{y})"), t(" ; sa pente est "), f("a=\\dfrac{\\sum X_iY_i}{\\sum X_i^2}"), t(", avec les écarts à la moyenne "), f("X_i=x_i-\\bar{x}"), t(" et "), f("Y_i=y_i-\\bar{y}"), t(".")]),
    calcul("a", [ligne(`\\bar{x}=\\dfrac{${somL(X)}}{${n}}=${nL(e.G.x)}`), ligne(`\\bar{y}=\\dfrac{${somL(Y)}}{${n}}=${nL(e.G.y)}`)]),
    resultat("a", reponse(e, "g")),
    calcul("b", [ligne(tableauEcarts(e))], [t("Tableau des écarts (la somme des écarts est toujours nulle) :")]),
    resultat("b", reponse(e, "ecarts")),
    calcul("c", [ligne(`a=\\dfrac{\\sum X_iY_i}{\\sum X_i^2}=\\dfrac{${nL(e.sXY)}}{${nL(e.sX2)}}=${nL(e.a)}`)]),
    resultat("c", reponse(e, "pente")),
    piege("c", [t("Diviser par "), f("\\sum Y_i^2"), t(", ou multiplier les valeurs "), f("x_iy_i"), t(" au lieu des écarts : la formule utilise les écarts à la moyenne, et les carrés des écarts de x.")]),
    calcul("d", [ligne(`b=\\bar{y}-a\\,\\bar{x}=${nL(e.G.y)}-${parL(e.a)}\\times${parL(e.G.x)}=${nL(e.b)}`)], [t("La droite passe par G : "), f("\\bar{y}=a\\,\\bar{x}+b"), t(".")]),
    { ...resultat("d", reponse(e, "equation")), figureHtml: figureEtat(e, true) },
    calcul("e", [ligne(`y=${nL(e.a)}\\times${parL(e.x0)}${plusL(e.b)}=${nL(prevY(e))}`)], [t("On remplace x par "), f(nL(e.x0)), t(" :")]),
    resultat("e", reponse(e, "prevision")),
  ];
}

function calculatrice(e: E): EtapeCorrection[] {
  const vx = prevX(e);
  return [
    utilise("a", [t("TI-30XB : on entre les x dans la liste L1 et les y dans L2, puis « 2-Var Stats » ; parmi les résultats (n, x̄, σx, ȳ, σy, Σxy…), la calculatrice affiche a et b de la droite des moindres carrés "), f("y=ax+b"), t(".")]),
    calcul("a", [ligne(`a${egalOuEnviron(e.a, e.da)}${nL(e.a, e.da)}`, "pente (arrondie)"), ligne(`b${egalOuEnviron(e.b, e.db)}${nL(e.b, e.db)}`, "ordonnée à l'origine (arrondie)")]),
    { ...resultat("a", reponse(e, "coefs")), figureHtml: figureEtat(e, true) },
    verification("a", [t("La droite passe par le point moyen : "), f(`a\\,\\bar{x}+b\\approx${nL(e.a * e.G.x + e.b, 2)}`), t(" et "), f(`\\bar{y}${egalOuEnviron(e.G.y, 2)}${nL(e.G.y, 2)}`), t(".")]),
    calcul("b", [ligne(`y=a\\times${parL(e.x0)}+b\\approx${nL(prevY(e), e.dp + 1)}\\approx${nL(prevY(e), e.dp)}`)], [t("On remplace x par "), f(nL(e.x0)), t(" :")]),
    resultat("b", reponse(e, "prevY")),
    calcul("c", [ligne(`ax+b=${nL(e.y0!)}`), ligne(`x=\\dfrac{${nL(e.y0!)}-b}{a}\\approx${nL(vx, e.dpx + 1)}\\approx${nL(vx, e.dpx)}`)], [t("On remplace y par "), f(nL(e.y0!)), t(" et on isole x :")]),
    { ...resultat("c", reponse(e, "prevX")), figureHtml: figureEtat(e, true, true) },
    piege("c", [t("Remplacer x par l'ordonnée donnée, ou échanger a et b en recopiant l'écran de la calculatrice.")]),
  ];
}

export function correctionDetailleeMoindresCarres(e: E): EtapeCorrection[] {
  return avecRenvoiCours(e.variante === "main" ? main(e) : calculatrice(e), 4);
}
