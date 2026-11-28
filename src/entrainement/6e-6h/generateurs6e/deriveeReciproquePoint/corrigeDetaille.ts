import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceDeriveeReciproque } from "../../core6e/deriveeReciproquePoint.types";
import { applicable, modele, y0L } from "../../moteur6e/modeleDeriveeReciproquePoint";
import { lx, tx } from "../../ui6e/ecransExp.types";
import type { Frag } from "../../ui6e/ecransExp.types";
import { reponse } from "../../ui6e/formatDeriveeReciproquePoint";

/**
 * Corrigé détaillé « comme au tableau » de `6gen155`, une lettre par écran : a) x₀ = f⁻¹(y₀) par une
 * valeur évidente (équation, f(x₀) calculé ligne à ligne, unicité par la stricte croissance) ;
 * b) f′(x), puis f′(x₀) ligne à ligne ; c) hypothèse f′(x₀) ≠ 0 du théorème ; d) (f⁻¹)′(y₀) =
 * 1/f′(f⁻¹(y₀)) écrit ligne à ligne — ou, si f′(x₀) = 0, la conclusion « n'existe pas » (tangente
 * verticale par symétrie). Même source que l'écran (modèle, textes).
 */

const fr = (f: Frag[]): FragmentConsigne[] => f as FragmentConsigne[];
const t = tx;
const l = lx;

function chaine(premier: string, suite: string[], just?: LigneCalcul["justification"]): LigneCalcul[] {
  const [a, ...b] = suite;
  return [ligne(`${premier}=${a}`, just), ...b.map((x) => ligne(`=${x}`))];
}

export function correctionDetailleeReciproque(e: ExerciceDeriveeReciproque): EtapeCorrection[] {
  const m = modele(e);
  const p = m.point;
  const y = y0L(e);
  const oui = applicable(e);
  const etapes: EtapeCorrection[] = [
    utilise("a", fr([l("f^{-1}(y_0)"), t(" est le réel "), l("x_0"), t(" de "), l("I"), t(" tel que "), l("f(x_0)=y_0"), t(" (cours, point 1) ; on teste une valeur évidente.")])),
    calcul("a", [ligne(`${m.fL}=${y}`, "équation à résoudre dans I"), ...chaine(`f(${p.x0L})`, p.chaineF, [t("on teste "), l(`x=${p.x0L}`)]), ligne(`x_0=${p.x0L}`, "f strictement croissante : c'est la seule solution")]),
    resultat("a", fr(reponse(e, "x0"))),
    piege("a", fr([t("Calculer "), l("f(y_0)"), t(" au lieu de résoudre "), l("f(x)=y_0"), t(".")])),
    utilise("b", fr([t("Dérivées de référence (règles du cours), puis on remplace "), l("x"), t(" par "), l("x_0"), t(".")])),
    calcul("b", [ligne(`f'(x)=${m.fpxL}`, "dérivée terme à terme"), ...chaine(`f'(${p.x0L})`, p.chaineFp, [t("on remplace "), l("x"), t(" par "), l(p.x0L)])]),
    resultat("b", fr(reponse(e, "derivee"))),
    piege("b", fr([t("Remplacer "), l("x"), t(" par "), l("y_0"), t(" dans "), l("f'"), t(".")])),
    utilise("c", fr([t("Hypothèses du théorème (cours, point 1) : "), l("f"), t(" continue et strictement monotone sur l'intervalle "), l("I"), t(", dérivable en "), l("x_0"), t(", avec "), l("f'(x_0)\\neq 0"), t(".")])),
    calcul("c", [ligne(oui ? `f'(${p.x0L})=${p.fpL}\\neq 0` : `f'(${p.x0L})=0`, oui ? "hypothèse remplie" : "l'hypothèse f′(x₀) ≠ 0 n'est pas remplie")]),
    resultat("c", fr(reponse(e, "theoreme"))),
    piege("c", fr([t("Conclure que "), l("f"), t(" n'est pas injective parce que "), l("f'"), t(" s'annule : une fonction strictement croissante peut avoir une dérivée nulle en un point isolé.")])),
  ];
  if (oui) {
    const fpFrac = p.fpL.startsWith("\\dfrac") || p.fpL.includes("\\dfrac") ? p.fpL.replace(/\\dfrac/g, "\\frac") : p.fpL;
    const suite = [`\\dfrac{1}{${fpFrac}}`, ...p.chaineInv].filter((x, i, tab) => i === 0 || x !== tab[i - 1]);
    if (suite[suite.length - 1] !== p.invL) suite.push(p.invL);
    etapes.push(
      utilise("d", fr([t("Théorème de la dérivée d'une réciproque (cours, point 1), avec "), l(`f^{-1}(${y})=${p.x0L}`), t(" (étape 1).")])),
      calcul("d", [
        ligne(`(f^{-1})'(${y})=\\dfrac{1}{f'\\left(f^{-1}(${y})\\right)}`, "théorème"),
        ligne(`=\\dfrac{1}{f'(${p.x0L})}`, [l(`f^{-1}(${y})=${p.x0L}`)]),
        ...suite.map((x, i) => ligne(`=${x}`, i === 0 ? [l(`f'(${p.x0L})=${p.fpL}`)] : undefined)),
      ]),
      resultat("d", fr(reponse(e, "resultat"))),
      verification("d", fr([t("Pentes inverses (symétrie par rapport à "), l("y=x"), t(") :")]), [ligne(`${p.fpL.includes("+") || p.fpL.includes("-") ? `\\left(${p.fpL}\\right)` : p.fpL}\\cdot ${p.invL}=1`)]),
      piege("d", fr([t("Donner "), l("f'(x_0)"), t(" sans l'inverser, ou "), l("-\\dfrac{1}{f'(x_0)}"), t(" (pente d'une perpendiculaire).")])),
    );
  } else {
    etapes.push(
      utilise("d", fr([t("Le théorème ne s'applique pas. Par symétrie par rapport à "), l("y=x"), t(", la tangente horizontale à "), l("f"), t(" en "), l(`(${p.x0L}\\,;\\,${y})`), t(" devient une tangente verticale à "), l("f^{-1}"), t(" en "), l(`(${y}\\,;\\,${p.x0L})`), t(".")])),
      calcul("d", [ligne(`f'(${p.x0L})=0`, "pente nulle : tangente horizontale à f"), ligne(`(f^{-1})'(${y})\\notin\\mathbb{R}`, "tangente verticale à f⁻¹ : pas de nombre dérivé")]),
      resultat("d", fr([l(`(f^{-1})'(${y})`), t(" n'existe pas (tangente verticale).")])),
    );
  }
  return etapes;
}
