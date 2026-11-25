import type { EtapeCorrection } from "../../../export/genererFeuilleExercices";
import { calcul, lettreEtape, ligne, piege, resultat, utilise, verification } from "../../../export/corrigeTableau";
import type { Exercice137 } from "../../core6e/hyperboleEquilatere";
import { c137, phases137 } from "../../core6e/hyperboleEquilatere";
import { exL, racineEx } from "../../core6e/coniquesLotH1";
import { figureCorrige137, reponse137 } from "../../ui6e/formatHyperboleEquilatere";
import { figureCorrigeLot } from "../../ui6e/corrigeLieuxLotH1";
import { fr, l, nb, t } from "../../ui6e/outilsLieuxLotH1";

/**
 * Corrigé détaillé « comme au tableau » de `6gen137`, une lettre par écran : c² = a² + b² avec b = a ;
 * k = a²/2 (rotation de 45°, X = (x − y)/√2, Y = (x + y)/√2, donc XY = (x² − y²)/2) ; sommets sur la
 * bissectrice ; a² = 2k ; sommets de xy = k par y = x ; foyers à la distance a√2 sur y = x. Figure sous le
 * dernier résultat.
 */

type E = Exercice137;

export function correctionDetaillee137(e: E): EtapeCorrection[] {
  const out: EtapeCorrection[] = [];
  const phases = phases137(e);
  phases.forEach((ph, i) => {
    const sq = lettreEtape(i);
    const fin = i === phases.length - 1;
    const res = fin ? { ...resultat(sq, fr(reponse137(e, ph))), figureHtml: figureCorrigeLot(figureCorrige137(e)) } : resultat(sq, fr(reponse137(e, ph)));
    switch (ph) {
      case "c":
        out.push(utilise(sq, [t("Hyperbole (cours, § 1) : "), l("c^2=a^2+b^2"), t(" ; équilatère : b = a.")]), calcul(sq, [ligne(`c^2=${e.a2}+${e.a2}=${2 * e.a2}`), ligne(`c=${exL(c137(e))}`)]), res);
        break;
      case "k":
        out.push(
          utilise(sq, [t("Repère des asymptotes (cours, § 1) : "), l("X=\\dfrac{x-y}{\\sqrt2},\\ Y=\\dfrac{x+y}{\\sqrt2}"), t(".")]),
          calcul(sq, [ligne(`XY=\\dfrac{(x-y)(x+y)}{2}=\\dfrac{x^2-y^2}{2}`), ligne(`XY=\\dfrac{${e.a2}}{2}=${nb(e.k)}`)]),
          res,
          piege(sq, [t("Écrire k = a² : on oublie le facteur 1/2 venu des deux divisions par √2.")]),
        );
        break;
      case "sommetsXY": {
        const s = racineEx(e.k);
        out.push(
          utilise(sq, [t("Les sommets sont sur l'axe de symétrie, bissectrice des asymptotes : X = Y.")]),
          calcul(sq, [ligne(`X^2=${nb(e.k)}`, "on remplace Y par X dans XY = k"), ligne(`X=\\pm${exL(s)}`)]),
          res,
          verification(sq, [t("La distance d'un sommet à O vaut "), l(`\\sqrt{2X^2}=\\sqrt{${2 * e.k}}=${exL(racineEx(e.a2))}=a`), t(" ✓")]),
        );
        break;
      }
      case "a2":
        out.push(utilise(sq, [t("Les deux formes de l'hyperbole équilatère (cours, § 1) : "), l("k=\\dfrac{a^2}{2}"), t(".")]), calcul(sq, [ligne(`a^2=2k=2\\times ${e.k}=${e.a2}`)]), res, piege(sq, [t("Prendre a² = k.")]));
        break;
      case "sommets":
        out.push(
          utilise(sq, [t("Les sommets de xy = k sont sur l'axe de symétrie y = x (cours, § 1).")]),
          calcul(sq, [ligne(`x\\cdot x=${e.k}`, "on remplace y par x"), ligne(`x=\\pm${exL(racineEx(e.k))}`)]),
          res,
        );
        break;
      case "foyers":
        out.push(
          utilise(sq, [t("Foyers (cours, § 1) : sur l'axe focal y = x, à la distance "), l("c=a\\sqrt2"), t(" de O ; leurs deux coordonnées valent "), l("\\dfrac{c}{\\sqrt2}=a"), t(".")]),
          calcul(sq, [ligne(`a=\\sqrt{${e.a2}}=${exL(racineEx(e.a2))}`), ligne(`c=a\\sqrt2=${exL(racineEx(2 * e.a2))}`)]),
          res,
          verification(sq, [t("Distance de F à O : "), l(`\\sqrt{2a^2}=\\sqrt{${2 * e.a2}}=c`), t(" ✓")]),
        );
        break;
    }
  });
  return out;
}
