import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceProblemesArcfonctions } from "../../core6e/problemesArcfonctions";
import { ANGLE_SECURITE, angleLimite, angleVue, sinusRefracte, verdictRayon } from "../../core6e/problemesArcfonctions";
import { abL, mL, nL, reponse, sinusSubstL, valeurAttendue, vueSubstL, xOptL } from "../../ui6e/formatProblemesArcfonctions";
import { degL, nbL } from "../../ui6e/nombresCycloLotG";

/**
 * Corrigé détaillé « comme au tableau » de `6gen156` (problèmes avec arcfonctions), partagé par
 * l'appli et le papier — une lettre par question (= écran) : a, b, c. Chaque angle est calculé depuis
 * l'expression exacte (aucun arrondi intermédiaire) ; les angles sont en degrés (calculatrice en mode
 * degrés), arcsin et arccos donnant un angle de [−90° ; 90°] et [0° ; 180°].
 */

type E = ExerciceProblemesArcfonctions;
const t = texte;
const f = latex;
const DEG_CALC = "calculatrice en degrés";
const sin4 = (x: number) => nbL(x, 4, true);
const diviser = (n: number) => (n === 1 ? "on isole le sinus" : [t("on divise par "), f(nL(n))]);

function snell(n1: number, n2: number, theta: number, nom: string, nomConnu: string): LigneCalcul[] {
  const s = sinusRefracte(n1, n2, theta);
  return [
    ligne(`${nL(n1)}\\cdot\\sin ${nomConnu}=${nL(n2)}\\cdot\\sin ${nom}`, "loi de Snell-Descartes"),
    ligne(`\\sin ${nom}=${sinusSubstL(n1, n2, theta)}`, diviser(n2)),
    ligne(`\\approx ${sin4(s)}`),
    ligne(`${nom}=\\arcsin\\left(${sinusSubstL(n1, n2, theta)}\\right)`, [t("ce nombre est dans "), f("[-1\\,;\\,1]"), t(" : arcsin est défini")]),
    ligne(`\\approx ${degL(Math.asin(s) * (180 / Math.PI), 1, true)}`, DEG_CALC),
  ];
}

function etapesRefraction(e: Extract<E, { variante: "refraction" }>): EtapeCorrection[] {
  const { milieu1: m1, milieu2: m2 } = e;
  const a = "a";
  const b = "b";
  const c = "c";
  const sinT1 = (m2.n * Math.sin((e.theta2Voulu * Math.PI) / 180)) / m1.n;
  return [
    utilise(a, [t("Loi de Snell-Descartes (cours, § 2, application « réfraction ») : on isole "), f("\\sin\\theta_2"), t(", puis on applique arcsin, qui renvoie un angle de "), f("[-90^{\\circ}\\,;\\,90^{\\circ}]"), t(".")]),
    calcul(a, snell(m1.n, m2.n, e.theta1, "\\theta_2", degL(e.theta1, 0))),
    resultat(a, reponse(e, "q1")),
    verification(a, [t(`En entrant ${m2.dans}, plus réfringent, le rayon se rapproche de la normale : `), f(`\\theta_2<\\theta_1=${degL(e.theta1, 0)}`), t(".")]),
    piege(a, [t("Calculatrice réglée en radians, ou indices inversés dans la loi.")]),
    utilise(b, [t("La même loi, mais l'inconnue est l'incidence "), f("\\theta_1"), t(" : on isole "), f("\\sin\\theta_1"), t(".")]),
    calcul(b, [
      ligne(`${nL(m1.n)}\\cdot\\sin\\theta_1=${nL(m2.n)}\\cdot\\sin ${degL(e.theta2Voulu, 0)}`, "loi de Snell-Descartes"),
      ligne(`\\sin\\theta_1=${sinusSubstL(m2.n, m1.n, e.theta2Voulu)}`, diviser(m1.n)),
      ligne(`\\approx ${sin4(sinT1)}`),
      ligne(`\\theta_1=\\arcsin\\left(${sinusSubstL(m2.n, m1.n, e.theta2Voulu)}\\right)`),
      ligne(`\\approx ${degL(valeurAttendue(e, "q2"), 1, true)}`, DEG_CALC),
    ]),
    resultat(b, reponse(e, "q2")),
    piege(b, [t("Garder la formule de la question a) : ici, c'est "), f("\\sin\\theta_1"), t(" qu'on isole.")]),
    utilise(c, [t("Rayon rasant : "), f("\\theta_1"), t(" tend vers "), f("90^{\\circ}"), t(" et "), f("\\sin 90^{\\circ}=1"), t(" ; arcsin est continue, l'angle de réfraction tend vers la valeur ci-dessous.")]),
    calcul(c, [
      ligne(`${nL(m1.n)}\\cdot\\sin 90^{\\circ}=${nL(m2.n)}\\cdot\\sin\\theta_2`, "incidence rasante"),
      ligne(`\\sin\\theta_2=\\dfrac{${nL(m1.n)}}{${nL(m2.n)}}`, [f("\\sin 90^{\\circ}=1")]),
      ligne(`\\theta_2=\\arcsin\\dfrac{${nL(m1.n)}}{${nL(m2.n)}}`),
      ligne(`\\approx ${degL(valeurAttendue(e, "q3"), 1, true)}`, DEG_CALC),
    ]),
    resultat(c, reponse(e, "q3")),
    verification(c, [t("L'angle de la question a) est bien plus petit : "), f(`${degL(valeurAttendue(e, "q1"), 1, true)}<${degL(valeurAttendue(e, "q3"), 1, true)}`), t(".")]),
    piege(c, [t("Répondre 90° : c'est l'incidence qui vaut 90°, pas l'angle de réfraction.")]),
  ];
}

function etapesReflexion(e: Extract<E, { variante: "reflexion-totale" }>): EtapeCorrection[] {
  const { milieu1: m1, milieu2: m2 } = e;
  const L = angleLimite(m1.n, m2.n);
  const s = sinusRefracte(m1.n, m2.n, e.theta1Verdict);
  const oui = verdictRayon(e);
  return [
    utilise("a", [t("À l'angle limite, le rayon réfracté rase la surface : "), f("\\theta_2=90^{\\circ}"), t(" dans la loi de Snell-Descartes (cours, § 2).")]),
    calcul("a", [
      ligne(`${nL(m1.n)}\\cdot\\sin\\theta_L=${nL(m2.n)}\\cdot\\sin 90^{\\circ}`, "loi de Snell-Descartes"),
      ligne(`\\sin\\theta_L=\\dfrac{${nL(m2.n)}}{${nL(m1.n)}}`, [f("\\sin 90^{\\circ}=1")]),
      ligne(`\\theta_L=\\arcsin\\dfrac{${nL(m2.n)}}{${nL(m1.n)}}`),
      ligne(`\\approx ${degL(L, 1, true)}`, DEG_CALC),
    ]),
    resultat("a", reponse(e, "q1")),
    piege("a", [t("Écrire "), f("\\sin\\theta_L=\\dfrac{n_1}{n_2}"), t(" : ce rapport dépasse 1, arcsin n'y est pas défini.")]),
    utilise("b", [t("Loi de Snell-Descartes : on isole "), f("\\sin\\theta_2"), t(", puis arcsin ; l'incidence est inférieure à l'angle limite, le calcul aboutit.")]),
    calcul("b", snell(m1.n, m2.n, e.theta1, "\\theta_2", degL(e.theta1, 0))),
    resultat("b", reponse(e, "q2")),
    verification("b", [t(`En passant ${m2.dans}, moins réfringent, le rayon s'écarte de la normale : `), f(`\\theta_2>\\theta_1=${degL(e.theta1, 0)}`), t(".")]),
    piege("b", [t("Calculatrice réglée en radians, ou indices inversés dans la loi.")]),
    utilise("c", [t("Un rayon réfracté existe seulement si "), f("\\sin\\theta_2"), t(" calculé par la loi ne dépasse pas 1 (arcsin est défini sur "), f("[-1\\,;\\,1]"), t(") : c'est-à-dire si l'incidence est inférieure à l'angle limite.")]),
    calcul("c", [
      ligne(`\\sin\\theta_2=${sinusSubstL(m1.n, m2.n, e.theta1Verdict)}`, "loi de Snell-Descartes"),
      ligne(`\\approx ${sin4(s)}`),
      ligne(`${sin4(s)}${oui ? "<" : ">"}1`, oui ? "arcsin est défini" : "aucun angle n'a ce sinus"),
      ligne(`${degL(e.theta1Verdict, 0)}${oui ? "<" : ">"}${degL(L, 1, true)}`, "comparaison à l'angle limite"),
    ]),
    resultat("c", reponse(e, "q3")),
    piege("c", [t("Calculer un angle avec la calculatrice sans regarder si le sinus dépasse 1 (« Math Error »).")]),
  ];
}

function etapesVue(e: Extract<E, { variante: "angle-de-vue" }>): EtapeCorrection[] {
  const { a, b } = e;
  const a2 = nbL(a * a, 4);
  const b2 = nbL(b * b, 4);
  const xOpt = valeurAttendue(e, "q2");
  return [
    utilise("a", [t("Dans le triangle rectangle yeux – mur, l'angle vers un point situé "), f("h"), t(" m plus haut que les yeux a pour tangente "), f("\\dfrac{h}{x}"), t(". L'angle de vue est la différence des angles vers le bord supérieur et vers le bord inférieur (cours, § 4, application).")]),
    calcul("a", [
      ligne(`\\theta(x)=\\arctan\\dfrac{b}{x}-\\arctan\\dfrac{a}{x}`, "différence de deux angles"),
      ligne(`\\theta(${mL(e.x0)})=${vueSubstL(e, mL(e.x0))}`),
      ligne(`\\approx ${degL(angleVue(a, b, e.x0), 1, true)}`, DEG_CALC),
    ]),
    resultat("a", reponse(e, "q1")),
    piege("a", [t("Écrire "), f("\\arctan\\dfrac{b-a}{x}"), t(" : les deux angles se mesurent depuis l'horizontale des yeux.")]),
    utilise("b", [t("Dérivée de "), f("\\arctan u"), t(" (cours, § 4) : "), f("\\dfrac{u'}{1+u^{2}}"), t(" ; avec "), f("u=\\dfrac{k}{x}"), t(", "), f("\\left(\\arctan\\dfrac{k}{x}\\right)'=\\dfrac{-k}{x^{2}+k^{2}}"), t(". L'angle est maximal où "), f("\\theta'"), t(" passe du signe + au signe −.")]),
    calcul("b", [
      ligne(`\\theta'(x)=\\dfrac{-${mL(b)}}{x^{2}+${b2}}+\\dfrac{${mL(a)}}{x^{2}+${a2}}`, "règle de la chaîne"),
      ligne(`=\\dfrac{${nbL(b - a, 2)}\\,(${abL(e)}-x^{2})}{(x^{2}+${a2})(x^{2}+${b2})}`, "même dénominateur"),
      ligne(`\\theta'(x)=0\\iff x^{2}=${abL(e)}`, [t("le dénominateur est positif")]),
      ligne(`x=${xOptL(e)}`, [f("x>0")]),
      ligne(`\\approx ${nbL(xOpt, 2, true)}`, "au centimètre"),
    ]),
    resultat("b", reponse(e, "q2")),
    verification("b", [t("Avant cette distance "), f("\\theta'(x)>0"), t(" (car "), f(`x^{2}<${abL(e)}`), t("), après "), f("\\theta'(x)<0"), t(" : c'est bien un maximum.")]),
    piege("b", [t("Prendre la moyenne des deux hauteurs : la distance optimale est leur moyenne géométrique "), f("\\sqrt{ab}"), t(".")]),
    utilise("c", [t("On remplace "), f("x"), t(" par la distance optimale dans "), f("\\theta(x)"), t(".")]),
    calcul("c", [ligne(`\\theta\\left(${xOptL(e)}\\right)=${vueSubstL(e, xOptL(e))}`), ligne(`\\approx ${degL(valeurAttendue(e, "q3"), 1, true)}`, DEG_CALC)]),
    resultat("c", reponse(e, "q3")),
    verification("c", [t("L'angle de la question a) est plus petit : "), f(`${degL(valeurAttendue(e, "q1"), 1, true)}<${degL(valeurAttendue(e, "q3"), 1, true)}`), t(".")]),
    piege("c", [t("Calculer l'angle à la distance arrondie au mètre : la réponse change au dixième de degré.")]),
  ];
}

function etapesEchelle(e: Extract<E, { variante: "echelle" }>): EtapeCorrection[] {
  return [
    utilise("a", [t("Triangle rectangle mur – sol – échelle : l'échelle est l'hypoténuse, la distance au mur est le côté adjacent à l'angle au sol. arccos renvoie un angle de "), f("[0^{\\circ}\\,;\\,180^{\\circ}]"), t(" (cours, § 2).")]),
    calcul("a", [
      ligne(`\\cos\\alpha=\\dfrac{d}{L}`, "côté adjacent sur hypoténuse"),
      ligne(`=\\dfrac{${mL(e.d)}}{${mL(e.L)}}`),
      ligne(`\\alpha=\\arccos\\dfrac{${mL(e.d)}}{${mL(e.L)}}`),
      ligne(`\\approx ${degL(valeurAttendue(e, "q1"), 1, true)}`, DEG_CALC),
    ]),
    resultat("a", reponse(e, "q1")),
    piege("a", [t("Utiliser arcsin : on obtient l'angle avec le mur.")]),
    utilise("b", [t("Même triangle, angle au sol connu ("), f(`${ANGLE_SECURITE}^{\\circ}`), t(") : la distance au mur est "), f("L\\cos\\alpha"), t(".")]),
    calcul("b", [ligne(`d=${mL(e.L)}\\cos ${degL(ANGLE_SECURITE, 0)}`, "côté adjacent"), ligne(`\\approx ${nbL(valeurAttendue(e, "q2"), 2, true)}`, DEG_CALC)]),
    resultat("b", reponse(e, "q2")),
    verification("b", [t("C'est la règle « un pour quatre » : le pied est à environ un quart de la longueur, "), f(`\\dfrac{${mL(e.L)}}{4}=${nbL(e.L / 4, 3)}`), t(".")]),
    piege("b", [t("Prendre le sinus : on obtiendrait la hauteur atteinte, pas la distance au mur.")]),
    utilise("c", [t("La hauteur atteinte est le côté opposé à l'angle au sol : "), f("\\sin\\alpha=\\dfrac{h}{L}"), t(", et arcsin renvoie un angle de "), f("[-90^{\\circ}\\,;\\,90^{\\circ}]"), t(".")]),
    calcul("c", [
      ligne(`\\sin\\alpha=\\dfrac{${mL(e.h)}}{${mL(e.L)}}`, "côté opposé sur hypoténuse"),
      ligne(`\\alpha=\\arcsin\\dfrac{${mL(e.h)}}{${mL(e.L)}}`),
      ligne(`\\approx ${degL(valeurAttendue(e, "q3"), 1, true)}`, DEG_CALC),
    ]),
    resultat("c", reponse(e, "q3")),
    verification("c", [t(`L'angle ${valeurAttendue(e, "q3") > ANGLE_SECURITE ? "dépasse" : "est sous"} l'angle de sécurité de ${ANGLE_SECURITE}° : l'échelle est ${valeurAttendue(e, "q3") > ANGLE_SECURITE ? "trop raide" : "trop inclinée, son pied risque de glisser"}.`)]),
    piege("c", [t("Utiliser arccos : la hauteur n'est pas le côté adjacent à l'angle au sol.")]),
  ];
}

export function correctionDetailleeProblemesArcfonctions(e: E): EtapeCorrection[] {
  switch (e.variante) {
    case "refraction":
      return etapesRefraction(e);
    case "reflexion-totale":
      return etapesReflexion(e);
    case "angle-de-vue":
      return etapesVue(e);
    case "echelle":
      return etapesEchelle(e);
  }
}

