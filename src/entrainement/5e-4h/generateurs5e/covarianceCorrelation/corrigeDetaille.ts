import type { EtapeCorrection } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceCorrelation } from "../../core5e/covarianceCorrelation";
import { arrondi, decimales, net, NOM_CLASSE, sommesEcarts } from "../../core5e/stat2vLotH1";
import { avecRenvoiCours, nL, parL } from "../../ui5e/ecrituresStat2vLotH1";
import { figureCorrige, n, reponse, sxEch } from "../../ui5e/formatCovarianceCorrelation";

/**
 * Corrigé détaillé « comme au tableau » de `5gen38`, une lettre par écran. `main` : tableau des écarts
 * (xᵢ, yᵢ, Xᵢ, Yᵢ, XᵢYᵢ, Xᵢ², Yᵢ²), covariance par les écarts puis par la seconde formule (même valeur),
 * σx et σy, r, sens par le signe de la covariance, intensité par le tableau du cours. `calculatrice` :
 * lectures de la TI-30XB (σx et non Sx), covariance r·σx·σy, sens, intensité. Figure : nuage, G et droite
 * des moindres carrés.
 */

type E = ExerciceCorrelation;
const t = texte;
const f = latex;
const egalOuEnviron = (v: number, d: number) => (decimales(v) <= d ? "=" : "\\approx");

function tableauEcarts(e: E): string {
  const L = e.points.map((p) => {
    const X = net(p.x - e.G.x);
    const Y = net(p.y - e.G.y);
    return `${nL(p.x)}&${nL(p.y)}&${nL(X)}&${nL(Y)}&${nL(net(X * Y))}&${nL(net(X * X))}&${nL(net(Y * Y))}`;
  });
  const s = sommesEcarts(e.points);
  return `\\begin{array}{cc|cc|ccc}x_i&y_i&X_i&Y_i&X_iY_i&X_i^2&Y_i^2\\\\\\hline ${L.join("\\\\")}\\\\\\hline &&0&0&${nL(s.sXY)}&${nL(s.sX2)}&${nL(s.sY2)}\\end{array}`;
}

const TABLEAU_COURS = "0{,}35\\le|r|<0{,}60:\\text{ faible};\\ 0{,}60\\le|r|<0{,}80:\\text{ moyenne};\\ 0{,}80\\le|r|<0{,}98:\\text{ forte};\\ 0{,}98\\le|r|<1:\\text{ très forte}";

function interpretation(e: E, ls: [string, string]): EtapeCorrection[] {
  const [lSens, lInt] = ls;
  const a = Math.abs(e.r);
  return [
    utilise(lSens, [t("Le signe de la covariance (le même que celui de r) donne le sens de la corrélation.")]),
    resultat(lSens, [f(`\\operatorname{Cov}(x,y)${e.positif ? ">" : "<"}0`), t(" : "), ...reponse(e, "sens"), t(e.positif ? " (x et y varient dans le même sens)." : " (quand x augmente, y diminue).")]),
    utilise(lInt, [t("Tableau du cours : "), f("|r|<0{,}35"), t(" corrélation nulle ; "), f(TABLEAU_COURS), t(" ; "), f("|r|=1"), t(" parfaite.")]),
    { ...resultat(lInt, [f(`|r|\\approx${nL(a, e.dr)}`), t(" : "), ...reponse(e, "intensite"), t(".")]), figureHtml: figureCorrige(e) },
    ...(e.classe === "nulle" ? [verification(lInt, [t("Une corrélation nulle veut dire : pas de relation linéaire ; une autre forme de relation reste possible.")])] : []),
  ];
}

function main(e: E): EtapeCorrection[] {
  const s = sommesEcarts(e.points);
  const nn = n(e);
  const sxy = net(e.moyProduits * nn);
  return [
    utilise("a", [t("Covariance : moyenne des produits des écarts à la moyenne, "), f("\\operatorname{Cov}(x,y)=\\dfrac{1}{n}\\sum X_iY_i"), t(" avec "), f("X_i=x_i-\\bar{x}"), t(", "), f("Y_i=y_i-\\bar{y}"), t(` ; ici `), f(`\\bar{x}=${nL(e.G.x)}`), t(" et "), f(`\\bar{y}=${nL(e.G.y)}`), t(".")]),
    calcul("a", [ligne(tableauEcarts(e)), ligne(`\\operatorname{Cov}(x,y)=\\dfrac{${nL(s.sXY)}}{${nn}}=${nL(e.cov)}`)]),
    resultat("a", reponse(e, "covEcarts")),
    calcul("b", [ligne(`\\sum x_iy_i=${e.points.map((p) => `${nL(p.x)}\\cdot${nL(p.y)}`).join("+")}=${nL(sxy)}`), ligne(`\\dfrac{1}{n}\\sum x_iy_i=\\dfrac{${nL(sxy)}}{${nn}}=${nL(e.moyProduits)}`), ligne(`\\operatorname{Cov}(x,y)=${nL(e.moyProduits)}-${parL(e.G.x)}\\times${parL(e.G.y)}=${nL(e.cov)}`)], [t("Seconde formule : "), f("\\operatorname{Cov}(x,y)=\\dfrac{1}{n}\\sum x_iy_i-\\bar{x}\\,\\bar{y}"), t(".")]),
    resultat("b", reponse(e, "covProduits")),
    verification("b", [t("Les deux formules donnent la même covariance.")]),
    calcul("c", [ligne(`\\sigma_x=\\sqrt{\\dfrac{${nL(s.sX2)}}{${nn}}}${egalOuEnviron(e.sx, e.ds)}${nL(e.sx, e.ds)}`), ligne(`\\sigma_y=\\sqrt{\\dfrac{${nL(s.sY2)}}{${nn}}}${egalOuEnviron(e.sy, e.ds)}${nL(e.sy, e.ds)}`)], [t("Écarts-types (division par n) :")]),
    resultat("c", reponse(e, "sigmas")),
    piege("c", [t("Diviser par n − 1 (c'est "), f("S_x"), t(", que la calculatrice affiche aussi) : ici on trouverait "), f(`S_x\\approx${nL(sxEch(e), 2)}`), t(".")]),
    calcul("d", [ligne(`r=\\dfrac{\\operatorname{Cov}(x,y)}{\\sigma_x\\,\\sigma_y}=\\dfrac{${nL(e.cov)}}{\\sqrt{\\dfrac{${nL(s.sX2)}}{${nn}}}\\cdot\\sqrt{\\dfrac{${nL(s.sY2)}}{${nn}}}}=\\dfrac{${nL(s.sXY)}}{\\sqrt{${nL(s.sX2)}\\cdot${nL(s.sY2)}}}\\approx${nL(e.r, e.dr)}`)]),
    resultat("d", reponse(e, "r")),
    ...interpretation(e, ["e", "f"]),
  ];
}

function calculatrice(e: E): EtapeCorrection[] {
  return [
    utilise("a", [t("TI-30XB : x dans L1, y dans L2, puis « 2-Var Stats ». On lit "), f("\\sigma_x"), t(" et "), f("\\sigma_y"), t(" (division par n), et non "), f("S_x"), t(", "), f("S_y"), t(" (division par n − 1).")]),
    calcul("a", [ligne(`\\sigma_x${egalOuEnviron(e.sx, e.ds)}${nL(e.sx, e.ds)}`), ligne(`\\sigma_y${egalOuEnviron(e.sy, e.ds)}${nL(e.sy, e.ds)}`)]),
    resultat("a", reponse(e, "sigmas")),
    piege("a", [t("Recopier "), f(`S_x\\approx${nL(sxEch(e), 2)}`), t(" à la place de "), f("\\sigma_x"), t(".")]),
    calcul("b", [ligne(`r\\approx${nL(e.r, e.dr)}`, "dernière ligne de « 2-Var Stats »")]),
    resultat("b", reponse(e, "r")),
    calcul("c", [ligne(`\\operatorname{Cov}(x,y)=r\\,\\sigma_x\\,\\sigma_y\\approx${nL(arrondi(e.r, e.dr))}\\times${nL(e.sx, e.ds)}\\times${nL(e.sy, e.ds)}\\approx${nL(e.cov, e.dc)}`)], [t("La calculatrice ne donne pas la covariance : on la tire de "), f("r=\\dfrac{\\operatorname{Cov}(x,y)}{\\sigma_x\\sigma_y}"), t(".")]),
    resultat("c", reponse(e, "cov")),
    verification("c", [t("Avec la seconde formule : "), f(`\\dfrac{1}{n}\\sum x_iy_i-\\bar{x}\\,\\bar{y}\\approx${nL(e.moyProduits, 4)}-${parL(e.G.x, 4)}\\times${parL(e.G.y, 4)}\\approx${nL(e.cov, e.dc)}`), t(".")]),
    ...interpretation(e, ["d", "e"]),
  ];
}

export function correctionDetailleeCorrelation(e: E): EtapeCorrection[] {
  return avecRenvoiCours(e.variante === "main" ? main(e) : calculatrice(e), 5);
}

export const nomClasse = (e: E) => NOM_CLASSE[e.classe];
