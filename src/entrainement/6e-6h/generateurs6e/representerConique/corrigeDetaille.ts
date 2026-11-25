import type { EtapeCorrection } from "../../../export/genererFeuilleExercices";
import { calcul, lettreEtape, ligne, piege, resultat, utilise, verification } from "../../../export/corrigeTableau";
import type { Exercice133 } from "../../core6e/representerConique";
import { phases133 } from "../../core6e/representerConique";
import { c2, equationReduiteL } from "../../core6e/coniquesLotH1";
import { figureCorrige133, reponse133 } from "../../ui6e/formatRepresenterConique";
import { figureCorrigeLot } from "../../ui6e/corrigeLieuxLotH1";
import { fr, l, nb, t } from "../../ui6e/outilsLieuxLotH1";

/**
 * Corrigé détaillé « comme au tableau » de `6gen133`, une lettre par écran : centre (ou sommet) lu dans
 * les parenthèses, a et b sous les carrés, c² = a² ∓ b² (ou p/2), rectangle (±a ; ±b), directrice et
 * points au niveau du foyer (distance p). La figure complète (courbe tracée, asymptotes ou directrice)
 * est la réponse graphique : sous le dernier résultat. Même source que l'écran.
 */

type E = Exercice133;

export function correctionDetaillee133(e: E): EtapeCorrection[] {
  const C = e.C;
  const a = Math.sqrt(C.a2);
  const b = Math.sqrt(C.b2);
  const out: EtapeCorrection[] = [];
  const phases = phases133(e);
  phases.forEach((ph, i) => {
    const sq = lettreEtape(i);
    const fin = i === phases.length - 1;
    const res = fin ? { ...resultat(sq, fr(reponse133(e, ph))), figureHtml: figureCorrigeLot(figureCorrige133(e)) } : resultat(sq, fr(reponse133(e, ph)));
    switch (ph) {
      case "centre":
      case "sommet":
        out.push(
          utilise(sq, [t("Équation translatée (cours, § 2) : "), l(ph === "centre" ? "(x-h)^2" : "(y-k)^2=2p(x-h)"), t(ph === "centre" ? " et (y − k)² donnent le centre Ω(h ; k)." : " donne le sommet S(h ; k).")]),
          calcul(sq, [ligne(equationReduiteL(C), "équation donnée"), ligne(`h=${nb(C.h)},\\ k=${nb(C.k)}`, "nombres des parenthèses, au signe près")]),
          res,
        );
        break;
      case "sommetsFocaux":
        out.push(
          utilise(sq, [t("Sommets (cours, § 1) : à la distance a du centre, sur l'axe focal ("), t(C.axe === "x" ? "parallèle à Ox" : "parallèle à Oy"), t(").")]),
          calcul(sq, [ligne(`a^2=${nb(C.a2)}\\ \\Rightarrow\\ a=${nb(a)}`, C.nature === "ellipse" ? "plus grand dénominateur" : "sous le carré précédé de +")]),
          res,
        );
        break;
      case "sommetsNonFocaux":
        out.push(utilise(sq, [t("Ellipse (cours, § 1) : deux autres sommets, à la distance b du centre sur l'axe non focal.")]), calcul(sq, [ligne(`b^2=${nb(C.b2)}\\ \\Rightarrow\\ b=${nb(b)}`)]), res);
        break;
      case "foyers": {
        const ell = C.nature === "ellipse";
        out.push(
          utilise(sq, [t("Foyers (cours, § 1) : sur l'axe focal, à la distance c du centre, "), l(ell ? "c^2=a^2-b^2" : "c^2=a^2+b^2"), t(".")]),
          calcul(sq, [ligne(`c^2=${nb(C.a2)}${ell ? "-" : "+"}${nb(C.b2)}=${nb(c2(C))}`), ligne(`c=${nb(Math.sqrt(c2(C)))}`)]),
          res,
          piege(sq, [t(ell ? "Écrire c² = a² + b² : les foyers d'une ellipse sont entre ses sommets." : "Écrire c² = a² − b² : les foyers d'une hyperbole sont au-delà de ses sommets.")]),
        );
        break;
      }
      case "rectangle":
        out.push(
          utilise(sq, [t("Asymptotes (cours, § 1) : diagonales du rectangle de centre Ω, de côtés 2a (le long de l'axe focal) et 2b.")]),
          calcul(sq, [ligne(`a=${nb(a)},\\ b=${nb(b)}`)]),
          res,
          verification(sq, [t("Les asymptotes ont pour pente "), l(`\\pm${C.axe === "x" ? `\\dfrac{${nb(b)}}{${nb(a)}}` : `\\dfrac{${nb(a)}}{${nb(b)}}`}`), t(" : la courbe part des sommets en se rapprochant des diagonales.")]),
        );
        break;
      case "foyer":
        out.push(
          utilise(sq, [t("Parabole (cours, § 1) : le foyer est à la distance "), l("\\dfrac{p}{2}"), t(" du sommet, du côté de l'ouverture (signe de 2p).")]),
          calcul(sq, [ligne(`2p=${nb(2 * C.p)}\\ \\Rightarrow\\ p=${nb(C.p)}`), ligne(`\\dfrac{p}{2}=${nb(C.p / 2)}`)]),
          res,
          piege(sq, [t("Reporter p au lieu de p/2 depuis le sommet.")]),
        );
        break;
      case "piedDirectrice":
        out.push(utilise(sq, [t("Parabole (cours, § 1) : la directrice est perpendiculaire à l'axe focal, à la distance "), l("\\dfrac{p}{2}"), t(" du sommet, du côté opposé au foyer.")]), res);
        break;
      case "cordeFocale":
        out.push(
          utilise(sq, [t("Définition (cours, § 1) : "), l("|MF|=\\text{dist}(M\\,;d)"), t(". Au niveau du foyer, la distance à la directrice vaut "), l("\\dfrac{p}{2}+\\dfrac{p}{2}=p"), t(".")]),
          calcul(sq, [ligne(`|MF|=p=${nb(C.p)}`, "perpendiculairement à l'axe focal")]),
          res,
        );
        break;
    }
  });
  return out;
}
