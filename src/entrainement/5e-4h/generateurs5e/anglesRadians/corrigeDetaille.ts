import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import { angle, angleLatex, angleReference, cosinus, quadrant, sinus, tangente, type ExerciceAnglesRadians } from "../../moteur5e/modeleAnglesRadians";
import { chaineEgalites, piLatex, rat, ratLatex, val, type Rat } from "../../moteur5e/trigExact";
import { nomQuadrant, piSurD, positionAxe, reponseCosSin, reponseQuadrant, reponseReduction, reponseTangente, souderPonctuation, toursLatex } from "../../ui5e/formatAnglesRadians";

/**
 * Corrigé détaillé « comme au tableau » de 5gen51 (partagé par l'appli et le papier) : une lettre par
 * écran — a) réduction dans [0 ; 2π[ (tours retirés ou ajoutés, une opération par ligne), b) quadrant
 * (repères au même dénominateur), c) cos et sin (angle de référence, signe du quadrant, vérification
 * cos² + sin² = 1), d) tangente (quotient, ou cos θ = 0).
 */

type E = ExerciceAnglesRadians;
const t = texte;
const f = latex;

/** Valeur exacte en écriture « intérieure » (fraction non empilée en \dfrac). */
const interieur = (s: string) => s.replace(/\\dfrac/g, "\\frac");

function carre(v: number): Rat {
  const c = Math.round(v * v * 4);
  return rat(c, 4);
}

function etapeReduction(e: E): EtapeCorrection[] {
  const th = angle(e);
  const d = th.d;
  const n = Math.abs(e.tours);
  const signe = e.tours > 0 ? "-" : "+";
  const lignes: LigneCalcul[] = [
    ligne(`\\theta ${signe} ${2 * n}\\pi = ${angleLatex(e)} ${signe} ${toursLatex(e)}`, e.tours > 0 ? `on retire ${n} tour${n > 1 ? "s" : ""}` : `on ajoute ${n} tour${n > 1 ? "s" : ""}`),
    ligne(chaineEgalites("", piSurD(e.reduit, d), piLatex(e.reduit)), d === e.reduit.d ? undefined : "on simplifie"),
    ligne(`0 \\leq ${piLatex(e.reduit)} < 2\\pi`, [t("l'angle est dans "), f("[0\\,;\\,2\\pi[")]),
  ];
  return [
    utilise("a", [t("Un tour complet mesure "), f("2\\pi"), t(" (cours, point 4) : "), f("\\theta"), t(" et "), f("\\theta + 2k\\pi"), t(" ont le même point image.")]),
    calcul("a", lignes),
    resultat("a", souderPonctuation(reponseReduction(e))),
    piege("a", [t("Retirer "), f("\\pi"), t(" (un demi-tour) au lieu de "), f("2\\pi"), t(" donne le point diamétralement opposé.")]),
  ];
}

function etapeQuadrant(e: E): EtapeCorrection[] {
  const q = quadrant(e);
  const r = e.reduit;
  const d = r.d % 2 === 0 ? r.d : 2 * r.d;
  let lignes: LigneCalcul[];
  if (q === "axe") {
    const k = Math.round(val(r) * 2);
    lignes = [ligne(`${piLatex(r)} = ${k} \\times \\dfrac{\\pi}{2}`, [t("multiple de "), f("\\dfrac{\\pi}{2}"), t(` : M est ${positionAxe(e)}`)])];
  } else {
    const bornes: [Rat, Rat] = q === "I" ? [rat(0), rat(1, 2)] : q === "II" ? [rat(1, 2), rat(1)] : q === "III" ? [rat(1), rat(3, 2)] : [rat(3, 2), rat(2)];
    lignes = [
      ligne(`${piSurD(bornes[0], d)} < ${piSurD(r, d)} < ${piSurD(bornes[1], d)}`, [f(`${piLatex(bornes[0])} < \\theta < ${piLatex(bornes[1])}`)]),
    ];
  }
  return [
    utilise("b", [t("Les repères "), f("\\dfrac{\\pi}{2}"), t(", "), f("\\pi"), t(", "), f("\\dfrac{3\\pi}{2}"), t(" séparent les quatre quadrants (cours, point 4).")]),
    calcul("b", lignes),
    resultat("b", souderPonctuation(reponseQuadrant(e))),
  ];
}

function etapeCosSin(e: E): EtapeCorrection[] {
  const q = quadrant(e);
  const r = e.reduit;
  const c = cosinus(e);
  const s = sinus(e);
  const lignes: LigneCalcul[] = [];
  if (q === "axe") {
    lignes.push(ligne(`\\cos\\left(${piLatex(r)}\\right) = ${c.latex}`, "abscisse de M"));
    lignes.push(ligne(`\\sin\\left(${piLatex(r)}\\right) = ${s.latex}`, "ordonnée de M"));
  } else {
    const a = angleReference(e);
    if (q !== "I") {
      const expr = q === "II" ? `\\pi - ${piLatex(r)}` : q === "III" ? `${piLatex(r)} - \\pi` : `2\\pi - ${piLatex(r)}`;
      lignes.push(ligne(`\\alpha = ${expr}`, "angle de référence"));
      lignes.push(ligne(`= ${piLatex(a)}`));
    }
    const sc = c.valeur < 0 ? "-" : "";
    const ss = s.valeur < 0 ? "-" : "";
    lignes.push(ligne(chaineEgalites(`\\cos\\left(${piLatex(r)}\\right)`, `${sc}\\cos\\left(${piLatex(a)}\\right)`, c.latex), c.valeur < 0 ? `M à gauche de l'axe vertical : cosinus négatif` : "M à droite de l'axe vertical : cosinus positif"));
    lignes.push(ligne(chaineEgalites(`\\sin\\left(${piLatex(r)}\\right)`, `${ss}\\sin\\left(${piLatex(a)}\\right)`, s.latex), s.valeur < 0 ? "M sous l'axe horizontal : sinus négatif" : "M au-dessus de l'axe horizontal : sinus positif"));
  }
  const c2 = carre(c.valeur);
  const s2 = carre(s.valeur);
  return [
    utilise("c", [f("\\cos\\theta"), t(" est l'abscisse de M, "), f("\\sin\\theta"), t(" son ordonnée (cours, point 4) ; les valeurs sans signe sont celles de l'angle de référence, le signe vient du quadrant.")]),
    calcul("c", lignes),
    resultat("c", souderPonctuation(reponseCosSin(e))),
    verification("c", [f(`\\left(${c.latex}\\right)^2 + \\left(${s.latex}\\right)^2 = ${ratLatex(c2)} + ${ratLatex(s2)} = 1`)]),
    piege("c", q === "axe" ? [t("Sur un axe, une des deux coordonnées vaut 0 : lis le point d'intersection du cercle et de l'axe.")] : [t(`Ne pas échanger cos et sin : pour l'angle de référence `), f("\\dfrac{\\pi}{6}"), t(", le cosinus vaut "), f("\\dfrac{\\sqrt{3}}{2}"), t(` et le sinus `), f("\\dfrac{1}{2}"), t(`. Dans le ${nomQuadrant(q)}, les signes changent.`)]),
  ];
}

function etapeTangente(e: E): EtapeCorrection[] {
  const tg = tangente(e);
  const c = cosinus(e);
  const s = sinus(e);
  const lignes: LigneCalcul[] = tg
    ? [ligne(`\\tan\\theta = \\dfrac{\\sin\\theta}{\\cos\\theta}`, "définition"), ligne(`= \\dfrac{${interieur(s.latex)}}{${interieur(c.latex)}}`, "on remplace"), ligne(`= ${tg.latex}`, "on simplifie")]
    : [ligne(`\\cos\\left(${piLatex(e.reduit)}\\right) = 0`, "on ne peut pas diviser par 0")];
  return [
    utilise("d", [f("\\tan\\theta = \\dfrac{\\sin\\theta}{\\cos\\theta}"), t(", qui n'existe que si "), f("\\cos\\theta \\neq 0"), t(" (cours, point 4).")]),
    calcul("d", lignes),
    resultat("d", souderPonctuation(reponseTangente(e))),
    piege("d", [t("Le quotient se fait dans l'ordre sinus sur cosinus ; quand "), f("\\cos\\theta = 0"), t(" (M sur l'axe vertical), la tangente n'existe pas.")]),
  ];
}

export function correctionDetailleeAnglesRadians(e: E): EtapeCorrection[] {
  return [...etapeReduction(e), ...etapeQuadrant(e), ...etapeCosSin(e), ...etapeTangente(e)];
}
