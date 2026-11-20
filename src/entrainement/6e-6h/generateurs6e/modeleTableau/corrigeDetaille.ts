import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceModeleTableau } from "../../core6e/modeleTableau.types";
import { instants, qPuissance, valeurModele } from "./index";
import { COURS_MODELE, ctx, differences, mesures, nombreL, previsionL, rapports, reponse } from "../../ui6e/formatModeleTableau";
import { decL, estDecimal, qL, qVal } from "../../ui6e/nombresExp";
import type { Q } from "../../ui6e/nombresExp";

/**
 * Corrigé détaillé « comme au tableau » de 6gen147, une lettre par écran : a) les trois rapports
 * (fraction réduite puis « ≈ » au centième s'ils ne sont pas décimaux) ; b) les différences, puis le
 * verdict ; c) b (ou p) lu en t = 0, a (ou m) depuis le rapport (ou la différence) sur h unités,
 * vérifié sur une mesure ; d) la prévision calculée avec les valeurs exactes, puis arrondie.
 */

type E = ExerciceModeleTableau;
const t = texte;
const f = latex;

/** Nombre entre parenthèses s'il est négatif (facteur d'un produit). */
const par = (s: string): string => (s.startsWith("-") ? `(${s})` : s);

function lignesRapport(num: Q, den: Q, r: Q, i: number, lettre: string): LigneCalcul[] {
  const v = qVal(r);
  const just = [f(`\\dfrac{${lettre}_${i + 1}}{${lettre}_${i}}`)];
  const base = `\\dfrac{${nombreL(num)}}{${nombreL(den)}}`;
  if (estDecimal(v, 4)) return [ligne(`${base}=${decL(v, 4)}`, just)];
  return [ligne(`${base}=${qL(r)}`, just), ligne(`\\approx ${decL(Math.round(v * 100) / 100, 2)}`, "arrondi au centième")];
}

export function correctionDetailleeModeleTableau(e: E): EtapeCorrection[] {
  const c = ctx(e);
  const y = mesures(e);
  const r = rapports(e);
  const d = differences(e);
  const ts = instants(e);
  const expo = e.genre === "exponentiel";

  // a) rapports
  const lignesA = r.flatMap((ri, i) => lignesRapport(y[i + 1], y[i], ri, i, c.lettre));
  // b) différences et verdict
  const lignesB: LigneCalcul[] = d.map((di, i) => ligne(`${nombreL(y[i + 1])}-${nombreL(y[i])}=${nombreL(di)}`, [f(`${c.lettre}_${i + 1}-${c.lettre}_${i}`)]));
  // c) paramètres
  const lignesC: LigneCalcul[] = [];
  if (expo) {
    lignesC.push(ligne(`b=${nombreL(e.b)}`, [t("valeur mesurée en "), f("t=0")]));
    if (e.h === 1) lignesC.push(ligne(`a=${nombreL(r[0])}`, "rapport commun, sur un écart d'une unité"));
    else {
      lignesC.push(ligne(`a^{2}=${nombreL(r[0])}`, "rapport commun, sur un écart de deux unités"));
      lignesC.push(ligne(`a=\\sqrt{${nombreL(r[0])}}`, [f("a>0")]));
      lignesC.push(ligne(`=${nombreL(e.a)}`));
    }
  } else {
    lignesC.push(ligne(`p=${nombreL(e.b)}`, [t("valeur mesurée en "), f("t=0")]));
    if (e.h === 1) lignesC.push(ligne(`m=${nombreL(d[0])}`, "différence commune, sur un écart d'une unité"));
    else {
      lignesC.push(ligne(`2m=${nombreL(d[0])}`, "différence commune, sur un écart de deux unités"));
      lignesC.push(ligne(`m=\\dfrac{${nombreL(d[0])}}{2}`, "on divise par 2"));
      lignesC.push(ligne(`=${nombreL(e.m)}`));
    }
  }
  const t2 = ts[2];
  const verifC = expo ? `${nombreL(e.b)}\\cdot ${nombreL(e.a)}^{${t2}}=${nombreL(y[2])}` : `${par(nombreL(e.m))}\\cdot ${t2}+${nombreL(e.b)}=${nombreL(y[2])}`;
  // d) prévision
  const exact = valeurModele(e, e.T);
  const ve = qVal(exact);
  const exactL = estDecimal(ve, 6) ? decL(ve, 6) : decL(Math.round(ve * 1e6) / 1e6, 6);
  const relExact = estDecimal(ve, 6) ? "=" : "\\approx";
  const lignesD: LigneCalcul[] = [];
  if (expo) {
    const aT = qPuissance(e.a, e.T);
    const vaT = qVal(aT);
    lignesD.push(ligne(`${nombreL(e.a)}^{${e.T}}${estDecimal(vaT, 8) ? "=" : "\\approx"}${decL(estDecimal(vaT, 8) ? vaT : Math.round(vaT * 1e8) / 1e8, 8)}`, "à la calculatrice"));
    lignesD.push(ligne(`f(${e.T})=${nombreL(e.b)}\\cdot ${nombreL(e.a)}^{${e.T}}`, [t("on remplace "), f("t"), t(" par "), f(`${e.T}`)]));
    lignesD.push(ligne(`${relExact}${exactL}`, "valeur non arrondie"));
  } else {
    lignesD.push(ligne(`f(${e.T})=${par(nombreL(e.m))}\\cdot ${e.T}+${nombreL(e.b)}`, [t("on remplace "), f("t"), t(" par "), f(`${e.T}`)]));
    lignesD.push(ligne(`${relExact}${exactL}`));
  }
  const arr = previsionL(e);
  if (arr !== exactL) lignesD.push(ligne(`\\approx ${arr}`, c.entier ? "arrondi à l'unité" : "arrondi au centième"));

  return [
    utilise("a", [t("On divise chaque mesure par la précédente : les mesures sont prises à intervalles égaux ("), f(`${e.h}`), t(e.h === 1 ? " unité)." : " unités).")]),
    calcul("a", lignesA),
    resultat("a", reponse(e, "rapports")),
    piege("a", [t("Calculer des différences au lieu de rapports, ou diviser une mesure par la suivante.")]),
    utilise("b", [t("Des rapports constants (à intervalles égaux) caractérisent un modèle exponentiel ; des différences constantes, un modèle linéaire "), t(`${COURS_MODELE}.`)]),
    calcul("b", lignesB),
    resultat("b", reponse(e, "verdict")),
    piege("b", [t(expo ? "Conclure « pas exponentiel » parce que les différences ne sont pas égales : c'est le rapport qu'il faut regarder." : "Conclure « exponentiel » parce que les mesures augmentent (ou diminuent) : ce sont les différences qui sont constantes.")]),
    utilise("c", expo ? [t("Dans "), f("f(t)=b\\cdot a^{t}"), t(", "), f("b=f(0)"), t(" et le rapport sur un écart de "), f("d"), t(" unités vaut "), f("a^{d}"), t(` ${COURS_MODELE}.`)] : [t("Dans "), f("f(t)=m\\,t+p"), t(", "), f("p=f(0)"), t(" et la différence sur un écart de "), f("d"), t(" unités vaut "), f("m\\cdot d"), t(".")]),
    calcul("c", lignesC),
    resultat("c", reponse(e, "parametres")),
    verification("c", [t("Le modèle redonne la mesure en "), f(`t=${t2}`), t(" :")], [ligne(verifC)]),
    piege("c", e.h === 2 ? [t(expo ? "Prendre le rapport sur deux unités pour " : "Prendre la différence sur deux unités pour "), f(expo ? "a" : "m"), t(".")] : [t(expo ? "Prendre la différence au lieu du rapport pour " : "Prendre le rapport au lieu de la différence pour "), f(expo ? "a" : "m"), t(".")]),
    utilise("d", [t("On remplace "), f("t"), t(" dans le modèle, avec les valeurs exactes de ses paramètres, et on n'arrondit qu'à la fin.")]),
    calcul("d", lignesD),
    resultat("d", reponse(e, "prevision")),
    piege("d", e.h === 2 ? [t(expo ? "Arrondir en cours de calcul, ou utiliser le rapport sur deux unités comme facteur par unité." : "Arrondir en cours de calcul, ou utiliser la différence sur deux unités comme pente.")] : [t("Arrondir en cours de calcul : on garde les valeurs exactes jusqu'au résultat.")]),
  ];
}
