import type { EtapeCorrection } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import type { ExerciceComposeeDiagonale } from "../../core5e/composeeDiagonale";
import { composeeL, courbeO, domaineL, nomI, nomO, reponse } from "../../ui5e/formatComposeeDiagonale";
import { figurePapier } from "../../ui5e/figureComposeeDiagonale";

/**
 * Corrigé détaillé « comme au tableau » de `5gen63`, TOUJOURS trois lettres (niveau et durée
 * identiques quel que soit le verdict) : a) première lecture ; b) report par la diagonale et
 * existence ; c) seconde lecture — ou conclusion « n'existe pas ». Figure de la construction en
 * `figureHtml` sous l'étape c (7 cm). Source unique de l'écran et du papier.
 */

type E = ExerciceComposeeDiagonale;
const t = texte;
const f = latex;
const enveloppe = (svg: string) => `<div style="max-width:7cm;margin:4px auto">${svg.replace(/<svg ([^>]*?)width="([\d.]+)" height="([\d.]+)"/, '<svg $1width="100%" style="height:auto;display:block"')}</div>`;

export function correctionDetailleeComposeeDiagonale(e: E): EtapeCorrection[] {
  const i = nomI(e);
  const o = nomO(e);
  const r: EtapeCorrection[] = [
    utilise("a", [f(`${composeeL(e)}=${o}\\big(${i}(${e.a})\\big)`), t(" : la fonction écrite à droite, "), f(i), t(", agit en premier (cours, point 2).")]),
    calcul("a", [ligne(`${i}(${e.a})=${e.v}`, [t("point "), f(`(${e.a}\\,;\\,${e.v})`), t(" de "), f(`C_${i}`), t(", lu sur la grille")])]),
    resultat("a", reponse(e, "premiere")),
    piege("a", o === i ? [t("Lire deux fois la même valeur : la seconde lecture part de "), f(`${e.v}`), t(", pas de "), f(`${e.a}`), t(".")] : [t("Commencer par "), f(`C_${o}`), t(" : on calculerait "), f(`(${i}\\circ ${o})(${e.a})`), t(".")]),
    utilise("b", [t("La valeur "), f(`${e.v}`), t(" lue sur l'axe vertical devient une entrée de "), f(o), t(" : la droite "), f("y=x"), t(" la reporte sur l'axe horizontal (astuce du cours, point 4). Le graphe de "), f(o), t(" étant complet, "), f(`\\operatorname{dom} ${o}=${domaineL(courbeO(e))}`), t(".")]),
    calcul("b", [
      ligne(`y=${e.v}`, [t("horizontale depuis "), f(`(${e.a}\\,;\\,${e.v})`), t(" jusqu'à la diagonale : point "), f(`(${e.v}\\,;\\,${e.v})`)]),
      ligne(e.existe ? `${e.v}\\in ${domaineL(courbeO(e))}` : `${e.v}\\notin ${domaineL(courbeO(e))}`, e.existe ? [t("la verticale "), f(`x=${e.v}`), t(" rencontre "), f(`C_${o}`)] : [t("la verticale "), f(`x=${e.v}`), t(" ne rencontre pas "), f(`C_${o}`)]),
    ]),
    resultat("b", reponse(e, "existence")),
    piege("b", e.existe ? [t("Conclure « n'existe pas » parce que le point n'est pas sur la diagonale : la diagonale ne sert qu'au report.")] : [t("Prolonger "), f(`C_${o}`), t(" à l'œil au-delà de son extrémité : le graphe est complet, "), f(o), t(" n'est pas définie en "), f(`${e.v}`), t(".")]),
  ];
  if (e.existe) {
    r.push(
      utilise("c", [t("Depuis "), f(`(${e.v}\\,;\\,${e.v})`), t(", on va verticalement jusqu'à "), f(`C_${o}`), t(".")]),
      { ...calcul("c", [ligne(`${composeeL(e)}=${o}(${e.v})`, [t("on remplace "), f(`${i}(${e.a})`), t(" par "), f(`${e.v}`)]), ligne(`=${e.w}`, [t("point "), f(`(${e.v}\\,;\\,${e.w})`), t(" de "), f(`C_${o}`)])]), figureHtml: enveloppe(figurePapier(e, { complete: true })) },
      resultat("c", reponse(e, "valeur")),
      piege("c", [t("Lire "), f(`${o}(${e.a})`), t(" au lieu de "), f(`${o}(${e.v})`), t(", ou s'arrêter sur la diagonale.")]),
    );
  } else {
    r.push(
      utilise("c", [t("Une composée n'existe que si la valeur intermédiaire appartient au domaine de la fonction qui la reçoit (cours, point 4).")]),
      { ...calcul("c", [ligne(`${composeeL(e)}=${o}(${e.v})`, [f(`${e.v}`), t(" hors du domaine de "), f(o), t(" : aucune image")])]), figureHtml: enveloppe(figurePapier(e, { complete: true })) },
      resultat("c", [f(composeeL(e)), t(" n'existe pas")]),
      piege("c", [t("Donner quand même une valeur lue sur la grille, ou lire "), f(`${o}(${e.a})`), t(".")]),
    );
  }
  return r;
}
