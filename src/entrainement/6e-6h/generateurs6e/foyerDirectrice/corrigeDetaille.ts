import type { EtapeCorrection } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, utilise, verification } from "../../../export/corrigeTableau";
import type { Exercice135 } from "../../core6e/foyerDirectrice";
import { pied135, poly135, sommet135, verticale } from "../../core6e/foyerDirectrice";
import { eL, equation135L, figureCorrige135, reponse135 } from "../../ui6e/formatFoyerDirectrice";
import { figureCorrigeLot } from "../../ui6e/corrigeLieuxLotH1";
import { coordL, fr, l, nb, t } from "../../ui6e/outilsLieuxLotH1";
import { polyL } from "../../ui6e/outilsLieuxLotH2";

/**
 * Corrigé détaillé « comme au tableau » de `6gen135`, une lettre par écran : nature lue sur e ;
 * |PF|² = e²·dist(P ; d)², une transformation par ligne (distances en coordonnées, carré, dénominateur
 * chassé, développement, réduction) ; sommet S sur [FH] avec SF = e·SH (S = (F + e·H)/(1 + e)),
 * vérification dans l'équation. Figure (conique, F, d, S) sous le dernier résultat.
 */

type E = Exercice135;

const fac = (v: string, c: number) => (c === 0 ? v : `(${v}${c > 0 ? "-" : "+"}${nb(Math.abs(c))})`);

export function correctionDetaillee135(e: E): EtapeCorrection[] {
  const out: EtapeCorrection[] = [];
  const v = verticale(e) ? "x" : "y";
  const q2 = e.den * e.den;
  const n2 = e.num * e.num;
  const e2 = e.den === 1 ? nb(n2) : `\\dfrac{${n2}}{${q2}}`;
  const PF2 = `${fac("x", e.F.x)}^2+${fac("y", e.F.y)}^2`;
  const S = sommet135(e);
  const H = pied135(e);
  const ev = e.num / e.den;
  // a)
  out.push(
    utilise("a", [t("Caractérisation focale (cours, § 2) : 0 < e < 1 → ellipse, e = 1 → parabole, e > 1 → hyperbole.")]),
    resultat("a", fr(reponse135(e, "nature"))),
  );
  // b)
  const lignes = [
    ligne(`|PF|=e\\cdot\\text{dist}(P\\,;d)`, "P(x ; y) est sur la conique"),
    ligne(`\\sqrt{${PF2}}=${e.num === e.den ? "" : `${eL(e)}\\,`}|${e.k === 0 ? v : `${v}${e.k > 0 ? "-" : "+"}${nb(Math.abs(e.k))}`}|`, "distances en coordonnées"),
    ligne(`${PF2}=${e.num === e.den ? "" : e2}${fac(v, e.k)}^2`, "on élève au carré (deux membres positifs)"),
    ...(e.den === 1 ? [] : [ligne(`${q2}\\left(${PF2}\\right)=${n2}${fac(v, e.k)}^2`, `on multiplie par ${q2}`)]),
    ligne(`${polyL(poly135(e))}=0`, "on développe et on réduit"),
    ligne(equation135L(e), "coefficients simplifiés"),
  ];
  out.push(
    utilise("b", [t("Définition par foyer et directrice (cours, § 2) : "), l("|PF|=e\\cdot\\text{dist}(P\\,;d)"), t(", avec "), l(`\\text{dist}(P\\,;d)=|${v}-k|`), t(verticale(e) ? " (directrice verticale)." : " (directrice horizontale).")]),
    calcul("b", lignes),
    resultat("b", fr(reponse135(e, "equation"))),
    piege("b", [t("Oublier d'élever e au carré, ou mesurer la distance à d avec la mauvaise coordonnée.")]),
  );
  // c)
  out.push(
    utilise("c", [t("Le sommet est sur la perpendiculaire à d issue de F, entre F et le pied H : "), l("|SF|=e\\cdot|SH|"), t(", donc "), l("S=\\dfrac{F+e\\cdot H}{1+e}"), t(".")]),
    calcul("c", [
      ligne(`H${coordL(H)}`, "pied de la perpendiculaire à d issue de F"),
      ligne(`S=\\dfrac{F+${eL(e)}H}{1+${eL(e)}}`),
      ligne(`${verticale(e) ? "x_S" : "y_S"}=\\dfrac{${nb(verticale(e) ? e.F.x : e.F.y)}+${eL(e)}\\times${verticale(e) ? (e.k < 0 ? `(${nb(e.k)})` : nb(e.k)) : e.k < 0 ? `(${nb(e.k)})` : nb(e.k)}}{${nb(1 + ev)}}=${nb(verticale(e) ? S.x : S.y)}`),
    ]),
    { ...resultat("c", fr(reponse135(e, "sommet"))), figureHtml: figureCorrigeLot(figureCorrige135(e)) },
    verification("c", [t("Le point S vérifie l'équation trouvée (on remplace x et y par ses coordonnées : on obtient 0).")]),
  );
  return out;
}
