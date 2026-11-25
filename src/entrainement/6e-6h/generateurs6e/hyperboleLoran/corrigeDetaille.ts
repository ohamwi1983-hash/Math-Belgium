import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceLO } from "../../core6e/hyperboleLoran";
import { deltaT, intersectionsRoute, positions } from "../../core6e/hyperboleLoran";
import { coordL, milliersL, nL, pL } from "../../ui6e/outilsConiquesLotH2";
import { equationL, figureLO, LIBELLES_BRANCHE, positionsL, routeL, second } from "../../ui6e/formatHyperboleLoran";

/**
 * Corrigé détaillé « comme au tableau » de `6gen142`, une lettre par écran : a) distance = vitesse × durée
 * (unités) ; b) le navire est plus proche de l'émetteur reçu en premier, d'où la branche ; c) a, c, b² et
 * l'équation réduite ; d) intersection avec la route, point rejeté (autre branche) ou deux positions
 * possibles (ambiguïté), avec le schéma.
 */

type E = ExerciceLO;
const ft = texte;
const L = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

function lignesD(e: E): LigneCalcul[] {
  const a2 = e.a * e.a;
  const b2 = e.b * e.b;
  const pts = intersectionsRoute(e);
  if (e.variante === "parallele") {
    const h = e.route;
    const x2 = a2 * (1 + (h * h) / b2);
    return [
      ligne(`\\dfrac{x^2}{${milliersL(a2)}}-\\dfrac{${pL(h)}^2}{${milliersL(b2)}}=1`, [ft("on remplace "), L("y"), ft(" par "), L(nL(h))]),
      ligne(`x^2=${milliersL(a2)}\\left(1+\\dfrac{${milliersL(h * h)}}{${milliersL(b2)}}\\right)=${milliersL(x2)}`),
      ligne(`x=${nL(pts[1]!.x)}\\ \\text{ou}\\ x=${nL(pts[0]!.x)}`, "deux points de l'hyperbole"),
      ligne(`x${e.premier === "B" ? ">0" : "<0"}`, `branche du côté de ${e.premier}`),
    ];
  }
  const k = e.route;
  const y2 = b2 * ((k * k) / a2 - 1);
  return [
    ligne(`\\dfrac{${pL(k)}^2}{${milliersL(a2)}}-\\dfrac{y^2}{${milliersL(b2)}}=1`, [ft("on remplace "), L("x"), ft(" par "), L(nL(k))]),
    ligne(`y^2=${milliersL(b2)}\\left(\\dfrac{${milliersL(k * k)}}{${milliersL(a2)}}-1\\right)=${milliersL(y2)}`),
    ligne(`y=${nL(pts[1]!.y)}\\ \\text{ou}\\ y=${nL(pts[0]!.y)}`, "deux points de la même branche"),
  ];
}

export function correctionDetailleeLO(e: E): EtapeCorrection[] {
  const n = positions(e).length;
  return [
    utilise("a", [ft("Pendant le retard, le signal de "), L(second(e)), ft(" parcourt la distance supplémentaire : distance = vitesse × durée.")]),
    calcul("a", [ligne(`300\\,000\\text{ km/s}=0{,}3\\text{ km/}\\mu\\text{s}`, [L("1\\ \\mu\\text{s}=10^{-6}\\text{ s}")]), ligne(`|PA-PB|=0{,}3\\cdot ${deltaT(e)}=${nL(2 * e.a)}`)]),
    resultat("a", [L(`|PA-PB|=${nL(2 * e.a)}\\text{ km}`), ft(".")]),
    utilise("b", [ft("Les points dont la différence des distances à "), L("A"), ft(" et à "), L("B"), ft(" est constante forment une hyperbole de foyers "), L("A"), ft(" et "), L("B"), ft(" (cours, § 1 et § 6) ; le signe de "), L("PA-PB"), ft(" choisit la branche.")]),
    calcul("b", [ligne(e.premier === "B" ? `PA-PB=${nL(2 * e.a)}>0` : `PB-PA=${nL(2 * e.a)}>0`, `le signal de ${e.premier} arrive le premier : P est plus proche de ${e.premier}`)]),
    resultat("b", [ft(LIBELLES_BRANCHE[e.premier]), ft(".")]),
    utilise("c", [ft("Hyperbole de foyers "), L("(\\pm c\\,;0)"), ft(" : "), L("|PF-PF'|=2a"), ft(", "), L("b^2=c^2-a^2"), ft(" (cours, § 1).")]),
    calcul("c", [ligne(`2a=${nL(2 * e.a)}\\iff a=${nL(e.a)}`), ligne(`c=${nL(e.c)}`, "demi-distance AB"), ligne(`b^2=${milliersL(e.c * e.c)}-${milliersL(e.a * e.a)}=${milliersL(e.b * e.b)}`)]),
    resultat("c", [L(equationL(e)), ft(".")]),
    utilise("d", [ft("Points de l'hyperbole situés sur la route "), L(routeL(e)), ft(", puis seulement ceux de la bonne branche.")]),
    calcul("d", lignesD(e)),
    { ...resultat("d", [ft(n === 1 ? "Une seule position : " : "Deux positions possibles : "), L(positionsL(e)), ft(n === 1 ? "." : " ; une seconde paire d'émetteurs lève l'ambiguïté.")]), figureHtml: figureLO(e, true, true) },
    verification("d", [ft("Pour "), L(coordL(positions(e)[0]!)), ft(" : "), L(`PA-PB=${nL(Math.hypot(positions(e)[0]!.x + e.c, positions(e)[0]!.y))}-${nL(Math.hypot(positions(e)[0]!.x - e.c, positions(e)[0]!.y))}=${nL(Math.hypot(positions(e)[0]!.x + e.c, positions(e)[0]!.y) - Math.hypot(positions(e)[0]!.x - e.c, positions(e)[0]!.y))}`), ft(".")]),
    piege("d", e.variante === "parallele" ? [ft("Garder les deux points de la route : celui de l'autre branche est plus proche de "), L(second(e)), ft(", il ne correspond pas au signal reçu.")] : [ft("Croire que la position est unique : les deux points de la route sont sur la bonne branche (l'ambiguïté du LORAN).")]),
  ];
}
