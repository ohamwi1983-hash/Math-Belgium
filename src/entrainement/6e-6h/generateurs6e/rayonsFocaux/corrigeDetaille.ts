import type { EtapeCorrection } from "../../../export/genererFeuilleExercices";
import { calcul, lettreEtape, ligne, piege, resultat, utilise, verification } from "../../../export/corrigeTableau";
import type { Exercice136 } from "../../core6e/rayonsFocaux";
import { aire136, cosMax136, cosTheta, phases136, rayonF136, rayonFp136, tanDemi } from "../../core6e/rayonsFocaux";
import { exL } from "../../core6e/coniquesLotH1";
import { figureCorrige136, reponse136 } from "../../ui6e/formatRayonsFocaux";
import { figureCorrigeLot } from "../../ui6e/corrigeLieuxLotH1";
import { fr, l, nb, t } from "../../ui6e/outilsLieuxLotH1";

/**
 * Corrigé détaillé « comme au tableau » de `6gen136`, une lettre par écran : e = c/a ; rayons focaux
 * a ∓ e·x (vérification |PF| + |PF′| = 2a) ; angle maximal en B par la loi des cosinus, comparaison des
 * cosinus, aire b²·tan(θ/2) redémontrée (|PF| + |PF′| = 2a, loi des cosinus, ½·|PF|·|PF′|·sin θ). Figure
 * sous le dernier résultat.
 */

type E = Exercice136;

export function correctionDetaillee136(e: E): EtapeCorrection[] {
  const out: EtapeCorrection[] = [];
  const phases = phases136(e);
  const ev = e.c / e.a;
  phases.forEach((ph, i) => {
    const sq = lettreEtape(i);
    const fin = i === phases.length - 1;
    const res = fin ? { ...resultat(sq, fr(reponse136(e, ph))), figureHtml: figureCorrigeLot(figureCorrige136(e)) } : resultat(sq, fr(reponse136(e, ph)));
    switch (ph) {
      case "excentricite":
        out.push(utilise(sq, [t("Excentricité (cours, point 2) : "), l("e=\\dfrac{c}{a}"), t(".")]), calcul(sq, [ligne(`a=${e.a},\\ c=${e.c}`, "équation et foyers lus"), ligne(`e=\\dfrac{${e.c}}{${e.a}}=${nb(ev)}`)]), res);
        break;
      case "rayonF":
        out.push(
          utilise(sq, [t("Rayons focaux (cours, point 3) : "), l("|PF|=a-e\\,x_P"), t(" pour le foyer F(c ; 0).")]),
          calcul(sq, [ligne(`|PF|=${e.a}-${nb(ev)}\\times${e.xP! < 0 ? `(${nb(e.xP!)})` : nb(e.xP!)}`), ligne(`=${nb(rayonF136(e))}`)]),
          res,
        );
        break;
      case "rayonFp":
        out.push(
          utilise(sq, [t("Rayons focaux (cours, point 3) : "), l("|PF'|=a+e\\,x_P"), t(".")]),
          calcul(sq, [ligne(`|PF'|=${e.a}+${nb(ev)}\\times${e.xP! < 0 ? `(${nb(e.xP!)})` : nb(e.xP!)}`), ligne(`=${nb(rayonFp136(e))}`)]),
          res,
          verification(sq, [l(`|PF|+|PF'|=${nb(rayonF136(e))}+${nb(rayonFp136(e))}=${nb(2 * e.a)}=2a`), t(" ✓")]),
        );
        break;
      case "cosMax":
        out.push(
          utilise(sq, [t("B est sur l'axe non focal : "), l("|BF|=|BF'|=a"), t(" ; loi des cosinus dans le triangle FBF′ (cours, point 3), avec "), l("|FF'|=2c"), t(".")]),
          calcul(sq, [ligne(`\\cos\\widehat{FBF'}=\\dfrac{a^2+a^2-4c^2}{2a^2}`), ligne(`=\\dfrac{${e.a * e.a}+${e.a * e.a}-${4 * e.c * e.c}}{${2 * e.a * e.a}}`), ligne(`=${nb(cosMax136(e))}`)]),
          res,
        );
        break;
      case "existence":
        out.push(
          utilise(sq, [t("Quand P parcourt l'ellipse, l'angle FPF′ est maximal en B (cours, point 3) ; un angle plus grand a un cosinus plus petit.")]),
          calcul(sq, [ligne(`\\cos ${e.theta}^\\circ=${nb(cosTheta(e.theta!))}`), ligne(`${nb(cosTheta(e.theta!))}${e.existe ? "\\geq" : "<"}${nb(cosMax136(e))}`, e.existe ? "l'angle demandé ne dépasse pas l'angle maximal" : "l'angle demandé dépasse l'angle maximal")]),
          res,
          piege(sq, [t("Comparer les cosinus dans le mauvais sens : un plus grand angle a un plus petit cosinus.")]),
        );
        break;
      case "aire": {
        const th = e.theta!;
        out.push(
          utilise(sq, [t("Triangle focal (cours, point 3) : "), l("|PF|+|PF'|=2a"), t(", loi des cosinus, puis "), l("\\mathcal{A}=\\tfrac12|PF|\\,|PF'|\\sin\\theta"), t(".")]),
          calcul(sq, [
            ligne(`4c^2=|PF|^2+|PF'|^2-2|PF|\\,|PF'|\\cos\\theta`, "loi des cosinus"),
            ligne(`4c^2=4a^2-2|PF|\\,|PF'|(1+\\cos\\theta)`, "car (|PF| + |PF′|)² = 4a²"),
            ligne(`|PF|\\,|PF'|=\\dfrac{2b^2}{1+\\cos\\theta}`, "car a² − c² = b²"),
            ligne(`\\mathcal{A}=b^2\\dfrac{\\sin\\theta}{1+\\cos\\theta}=b^2\\tan\\dfrac{\\theta}{2}`),
            ligne(`\\mathcal{A}=${e.b * e.b}\\times\\tan ${th / 2}^\\circ=${e.b * e.b}\\times ${exL(tanDemi(th))}`),
            ligne(`=${exL(aire136(e))}`),
          ]),
          res,
        );
        break;
      }
    }
  });
  return out;
}
