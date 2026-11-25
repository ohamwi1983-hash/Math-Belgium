import type { EtapeCorrection, FragmentConsigne } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceModeliserPrevoir } from "../../core5e/modeliserPrevoir";
import { abscisseSeuil, prevision, xMax, xMin } from "../../core5e/modeliserPrevoir";
import { arrondi } from "../../core5e/statistiqueLotH2";
import { aArr, bArr, categorieR, contexte, equationArrondieL, figure, figurePrevision, figureSeuil, longueurT, reponse, TABLEAU_R_LATEX, xL } from "../../ui5e/formatModeliserPrevoir";
import { nPlus, egalOuEnviron, nL, nP, nT } from "../../ui5e/nombresStatLotH2";

/**
 * Corrigé détaillé « comme au tableau » de `5gen78` (cours, §§ 4 à 6), une lettre par écran :
 * a) la droite des moindres carrés à la calculatrice (moyennes, a et b, contrôle par G) ; b) r ;
 * c) fiabilité par le tableau d'interprétation ; d) prévision (figure : bande des données et point
 * prévu) ; e) interpolation ou extrapolation ; f) seuil (équation ax + b = seuil, interprétation dans
 * le contexte). Mêmes fonctions que l'écran.
 */

type E = ExerciceModeliserPrevoir;
const t = texte;
const f = latex;
const fr = (x: unknown) => x as FragmentConsigne[];
const avecFigure = (et: EtapeCorrection, svg: string): EtapeCorrection => ({ ...et, figureHtml: svg });

function etapeEquation(e: E): EtapeCorrection[] {
  const s = e.stats;
  return [
    utilise("a", [t("La calculatrice (mode « 2-Var Stats », x dans L1 et y dans L2) donne la droite des moindres carrés "), f("y=ax+b"), t(", avec "), f("a=\\dfrac{\\operatorname{Cov}(x,y)}{V(x)}"), t(" et "), f("b=\\bar{y}-a\\,\\bar{x}"), t(" (cours, § 4).")]),
    calcul("a", [
      ligne(`\\bar{x}${egalOuEnviron(s.mx, 4)}`, "moyenne des x"),
      ligne(`\\bar{y}${egalOuEnviron(s.my, 4)}`, "moyenne des y"),
      ligne(`a\\approx ${nL(s.a, e.da + 2, true)}\\approx ${nL(s.a, e.da, true)}`, `arrondi ${e.da === 1 ? "au dixième" : e.da === 2 ? "au centième" : e.da === 3 ? "au millième" : "au dix-millième"}`),
      ligne(`b\\approx ${nL(s.b, e.db + 2, true)}\\approx ${nL(s.b, e.db, true)}`, `arrondi ${e.db === 0 ? "à l'unité" : e.db === 1 ? "au dixième" : "au centième"}`),
    ]),
    avecFigure(resultat("a", [f(equationArrondieL(e))]), figure(e, "correlation")),
    verification("a", [t("La droite passe par le point moyen "), f("G(\\bar{x}\\,;\\bar{y})"), t(" (à l'arrondi près) :")], [ligne(`a\\,\\bar{x}+b\\approx ${nL(s.a * s.mx + s.b, 3)}\\approx\\bar{y}`)]),
    piege("a", [t("Échanger les listes (les y dans L1) : on obtient alors la droite de régression de x en y, qui n'est pas celle demandée.")]),
  ];
}

function etapeCorrelation(e: E): EtapeCorrection[] {
  const s = e.stats;
  return [
    utilise("b", [t("La calculatrice affiche r avec a et b ; par définition (cours, § 5) "), f("r=\\dfrac{\\operatorname{Cov}(x,y)}{\\sigma_x\\,\\sigma_y}"), t(", de même signe que a.")]),
    calcul("b", [
      ligne(`\\operatorname{Cov}(x,y)${egalOuEnviron(s.cov, 4)}`, "moyenne des produits des écarts"),
      ligne(`\\sigma_x${egalOuEnviron(s.sx, 4)}\\qquad\\sigma_y${egalOuEnviron(s.sy, 4)}`, "écarts-types (division par n)"),
      ligne(`r=\\dfrac{\\operatorname{Cov}(x,y)}{\\sigma_x\\,\\sigma_y}\\approx ${nL(s.r, 3, true)}`),
    ]),
    resultat("b", fr(reponse(e, "correlation"))),
    piege("b", [t("Donner "), f("R^2=r^2"), t(" (affiché par un tableur) à la place de r, ou oublier le signe de r.")]),
  ];
}

function etapeFiabilite(e: E): EtapeCorrection[] {
  const v = Math.abs(e.stats.r);
  return [
    utilise("c", [t("La droite est un bon modèle quand la corrélation est forte ou très forte (tableau d'interprétation du cours, § 5) :")]),
    calcul("c", [
      ligne(TABLEAU_R_LATEX),
      ligne(`|r|\\approx ${nL(v, 3, true)}${v >= 0.8 ? "\\geq" : "<"}0{,}80`, `corrélation ${categorieR(e.stats.r)}`),
    ]),
    resultat("c", fr(reponse(e, "fiabilite"))),
    piege("c", [t("Juger la fiabilité sur le signe de r : un r proche de −1 indique une corrélation aussi forte qu'un r proche de 1.")]),
  ];
}

function etapePrevision(e: E): EtapeCorrection[] {
  const c = contexte(e);
  return [
    utilise("d", [t("On connaît x, on cherche y : on remplace x par "), f(xL(e, e.x0)), t(" dans l'équation de la droite.")]),
    calcul("d", [
      ligne(`y=${nL(aArr(e), e.da)}\\cdot ${nP(e.x0, 2)}${nPlus(bArr(e), e.db)}\\approx ${nL(arrondi(aArr(e) * e.x0 + bArr(e), e.dp + 2), e.dp + 2)}`, "avec a et b arrondis"),
      ligne(`y\\approx ${nL(prevision(e), e.dp + 2)}`, "avec a et b non arrondis (mémoire de la calculatrice)"),
    ]),
    { ...resultat("d", fr(reponse(e, "prevision"))), figureHtml: figurePrevision(e) },
    ...(e.variante === "population" || e.variante === "ventes" ? [] : [verification("d", [t(`La valeur reste du même ordre que celles du tableau (${c.uniteY}).`)])]),
  ];
}

function etapeNature(e: E): EtapeCorrection[] {
  const mn = xL(e, xMin(e));
  const mx = xL(e, xMax(e));
  const x0 = xL(e, e.x0);
  const lien = e.interpolation ? `${mn}<${x0}<${mx}` : e.x0 > xMax(e) ? `${x0}>${mx}` : `${x0}<${mn}`;
  return [
    utilise("e", [t("Interpolation : x est dans l'intervalle des données ; extrapolation : en dehors, où rien ne garantit que la tendance continue (cours, § 2 et § 6).")]),
    calcul("e", [ligne(lien, `les x du tableau vont de ${nT(xMin(e), 2)} à ${nT(xMax(e), 2)}`)]),
    resultat("e", fr(reponse(e, "nature"))),
    ...(e.fiable ? [] : [verification("e", [t("De toute façon, le modèle est peu fiable (corrélation trop faible) : la prévision n'est qu'un ordre de grandeur.")])]),
    piege("e", [t("Croire qu'une valeur absente du tableau donne forcément une extrapolation : seul compte qu'elle soit dans l'intervalle des données ou non.")]),
  ];
}

function interpretationSeuil(e: E): FragmentConsigne[] {
  const x = abscisseSeuil(e);
  switch (e.variante) {
    case "dilatation":
      return [t(`La barre mesure ${longueurT(e)} m vers ${nT(x, 0)} °C.`)];
    case "grue":
      return [t(`La flèche ne doit pas dépasser environ ${nT(x, 1)} m (plus longue, la charge maximale tombe sous ${nT(e.seuil, 2)} t).`)];
    case "defectueuses":
      return [t(`Il faut prévoir l'entretien vers la semaine ${nT(x, 1)}, donc au plus tard au début de la semaine ${Math.floor(x)}${Math.floor(x) === x ? "" : ""}.`)];
    case "ventes":
      return [t(`Il faut proposer le matériel à environ ${nT(x, 1)} milliers d'euros.`)];
    case "population":
      return [t(`x ≈ ${nT(x, 1)} : la commune atteindra ${nT(e.seuil, 0)} habitants au cours de l'année ${2010 + Math.floor(x)}.`)];
    case "consommation":
      return [t(`Une voiture d'environ ${nT(x, 0)} ch consommerait ${nT(e.seuil, 2)} l/100 km.`)];
  }
}

function etapeSeuil(e: E): EtapeCorrection[] {
  const a = aArr(e);
  const b = bArr(e);
  const sl = e.variante === "dilatation" ? nL(e.seuil, 0) : nL(e.seuil, 2);
  const x = abscisseSeuil(e);
  const lignes = [
    ...(e.variante === "dilatation" ? [ligne(`${longueurT(e).replace(",", "{,}")}\\text{ m}-10\\text{ m}=${sl}\\text{ mm}`, "allongement cherché")] : []),
    ligne(`${nL(a, e.da)}\\,x${nPlus(b, e.db)}=${sl}`, "on connaît y, on cherche x"),
    ligne(`x=\\dfrac{${sl}-${nP(b, e.db)}}{${nL(a, e.da)}}\\approx ${nL((e.seuil - b) / a, e.ds + 2)}`, "avec a et b arrondis"),
    ligne(`x\\approx ${nL(x, e.ds + 2)}`, "avec a et b non arrondis"),
  ];
  return [
    utilise("f", [t("Cette fois, on connaît y (le seuil) et on cherche x : on résout "), f("ax+b=\\text{seuil}"), t(".")]),
    calcul("f", lignes),
    { ...resultat("f", [...fr(reponse(e, "seuil")), t(" — "), ...interpretationSeuil(e)]), figureHtml: figureSeuil(e) },
    verification("f", [t("Contrôle :")], [ligne(`${nL(e.stats.a, e.da + 2)}\\cdot ${nP(arrondi(x, e.ds), e.ds)}${nPlus(e.stats.b, e.db + 2)}\\approx ${nL(e.stats.a * arrondi(x, e.ds) + e.stats.b, 2)}`, "on retrouve le seuil, à l'arrondi de x près")]),
    ...(x > xMax(e) || x < xMin(e) ? [verification("f", [t("Cette valeur sort de l'intervalle des données : c'est une extrapolation, à prendre avec prudence.")])] : []),
    piege("f", [t("Remplacer x par le seuil au lieu de résoudre l'équation.")]),
  ];
}

export function correctionDetailleeModeliserPrevoir(e: E): EtapeCorrection[] {
  return [...etapeEquation(e), ...etapeCorrelation(e), ...etapeFiabilite(e), ...etapePrevision(e), ...etapeNature(e), ...etapeSeuil(e)];
}
