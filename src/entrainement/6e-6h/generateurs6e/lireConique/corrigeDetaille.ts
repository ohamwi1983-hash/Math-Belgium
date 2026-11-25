import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, lettreEtape, ligne, piege, resultat, utilise, verification } from "../../../export/corrigeTableau";
import type { Exercice132 } from "../../core6e/lireConique";
import { phases132 } from "../../core6e/lireConique";
import type { Conique } from "../../core6e/coniquesLotH1";
import { aEx, bEx, c2, cEx, excentricite, exL } from "../../core6e/coniquesLotH1";
import { figureCorrige132, reponse132 } from "../../ui6e/formatLireConique";
import { figureCorrigeLot } from "../../ui6e/corrigeLieuxLotH1";
import { fr, l, nb, t } from "../../ui6e/outilsLieuxLotH1";

/**
 * Corrigé détaillé « comme au tableau » de `6gen132`, une lettre par écran : reconnaissance sur
 * l'équation ou la figure (cours, § 1), a et b lus sous les carrés, c² = a² ∓ b² (ou p/2), e = c/a,
 * asymptotes y = ±(b/a)x, directrice x = −p/2 ; équation réduite écrite à partir des lectures ;
 * propriété optique (§ 6). Figure complète (centre, sommets, foyers, asymptotes ou directrice) sous le
 * dernier résultat. Même source que l'écran.
 */

type E = Exercice132;

/** a = √a², b = √b² (une ligne chacun). */
function lignesAB(C: Conique): LigneCalcul[] {
  return [ligne(`a^2=${nb(C.a2)}\\ \\Rightarrow\\ a=${exL(aEx(C))}`, "a² : sous la variable de l'axe focal"), ligne(`b^2=${nb(C.b2)}\\ \\Rightarrow\\ b=${exL(bEx(C))}`, "b² : sous l'autre variable")];
}

export function correctionDetaillee132(e: E): EtapeCorrection[] {
  const C = e.C;
  const out: EtapeCorrection[] = [];
  const phases = phases132(e);
  phases.forEach((ph, i) => {
    const sq = lettreEtape(i);
    const fin = i === phases.length - 1;
    const res = (frags: ReturnType<typeof reponse132>) => (fin ? { ...resultat(sq, fr(frags)), figureHtml: figureCorrigeLot(figureCorrige132(e)) } : resultat(sq, fr(frags)));
    switch (ph) {
      case "nature":
        out.push(
          utilise(
            sq,
            e.variante === "figure"
              ? [t("Allure des coniques (cours, § 1) : l'ellipse est fermée, l'hyperbole a deux branches, la parabole une seule branche ouverte.")]
              : [t("Équations réduites (cours, § 1) : deux carrés additionnés → ellipse ; deux carrés soustraits → hyperbole ; un seul carré → parabole.")],
          ),
          res(reponse132(e, ph)),
          piege(sq, [t("Confondre ellipse et cercle : le cercle a deux dénominateurs égaux.")]),
        );
        break;
      case "axe":
        out.push(
          utilise(
            sq,
            C.nature === "parabole"
              ? [t("Parabole (cours, § 1) : la variable au carré donne l'axe focal, le signe du coefficient 2p le sens d'ouverture.")]
              : C.nature === "ellipse"
                ? [t("Ellipse (cours, § 1) : le plus grand dénominateur porte "), l("a^2"), t(" et désigne l'axe focal.")]
                : [t("Hyperbole (cours, § 1) : l'axe focal est celui de la variable dont le carré est précédé du signe +.")],
          ),
          res(reponse132(e, ph)),
        );
        break;
      case "sommets":
        out.push(
          utilise(sq, C.nature === "parabole" ? [t("Le sommet de la parabole est l'origine du repère de son équation réduite (cours, § 1).")] : [t("Sommets (cours, § 1) : à la distance a du centre sur l'axe focal"), t(C.nature === "ellipse" ? ", à la distance b sur l'autre axe." : " ; l'hyperbole n'en a que deux.")]),
          ...(C.nature === "parabole" ? [] : [calcul(sq, lignesAB(C))]),
          res(reponse132(e, ph)),
          ...(C.nature === "hyperbole" ? [piege(sq, [t("Ajouter les points "), l("(0\\,;\\pm b)"), t(" : l'hyperbole ne coupe pas son axe non focal.")])] : []),
        );
        break;
      case "foyers":
        if (C.nature === "parabole") {
          out.push(
            utilise(sq, [t("Parabole (cours, § 1) : le foyer est à la distance "), l("\\dfrac{p}{2}"), t(" du sommet, du côté de l'ouverture.")]),
            calcul(sq, [ligne(`2p=${nb(2 * C.p)}\\ \\Rightarrow\\ p=${nb(C.p)}`, "coefficient lu (en valeur absolue)"), ligne(`\\dfrac{p}{2}=${nb(C.p / 2)}`)]),
            res(reponse132(e, ph)),
            piege(sq, [t("Placer le foyer à la distance p (au lieu de p/2) du sommet.")]),
          );
        } else {
          const ell = C.nature === "ellipse";
          out.push(
            utilise(sq, [t("Foyers (cours, § 1) : sur l'axe focal, à la distance c du centre, avec "), l(ell ? "c^2=a^2-b^2" : "c^2=a^2+b^2"), t(".")]),
            calcul(sq, [ligne(`c^2=${nb(C.a2)}${ell ? "-" : "+"}${nb(C.b2)}=${nb(c2(C))}`), ligne(`c=${exL(cEx(C))}`)]),
            res(reponse132(e, ph)),
            piege(sq, [t(ell ? "Écrire c² = a² + b² (relation de l'hyperbole)." : "Écrire c² = a² − b² (relation de l'ellipse).")]),
          );
        }
        break;
      case "excentricite":
        out.push(
          utilise(sq, [t("Excentricité (cours, § 2) : "), l("e=\\dfrac{c}{a}"), t(".")]),
          calcul(sq, [ligne(`e=\\dfrac{${exL(cEx(C))}}{${exL(aEx(C))}}`), ligne(`=${exL(excentricite(C))}`)]),
          res(reponse132(e, ph)),
          verification(sq, [t("Pour une ellipse, "), l("0<e<1"), t(" : c'est bien le cas.")]),
        );
        break;
      case "asymptotes": {
        const m = C.axe === "x" ? `\\dfrac{b}{a}=\\dfrac{${exL(bEx(C))}}{${exL(aEx(C))}}` : `\\dfrac{a}{b}=\\dfrac{${exL(aEx(C))}}{${exL(bEx(C))}}`;
        out.push(
          utilise(sq, [t("Asymptotes (cours, § 1) : elles passent par le centre et sont les diagonales du rectangle "), l(C.axe === "x" ? "(\\pm a\\,;\\pm b)" : "(\\pm b\\,;\\pm a)"), t(".")]),
          calcul(sq, [ligne(`m=${m}=${nb(C.axe === "x" ? Math.sqrt(C.b2 / C.a2) : Math.sqrt(C.a2 / C.b2))}`, "pente positive")]),
          res(reponse132(e, ph)),
          piege(sq, [t("Prendre l'inverse de la pente quand l'axe focal est vertical.")]),
        );
        break;
      }
      case "directrice":
        out.push(
          utilise(sq, [t("Parabole (cours, § 1) : la directrice est perpendiculaire à l'axe focal, à la distance "), l("\\dfrac{p}{2}"), t(" du sommet, du côté opposé au foyer.")]),
          calcul(sq, [ligne(`\\dfrac{p}{2}=${nb(C.p / 2)}`)]),
          res(reponse132(e, ph)),
          verification(sq, [t("Le sommet est le milieu du segment qui joint le foyer à la directrice, perpendiculairement à elle.")]),
        );
        break;
      case "equation": {
        const lignes: LigneCalcul[] =
          C.nature === "parabole"
            ? [ligne(`\\dfrac{p}{2}=${nb(C.p / 2)}`, "distance lue du sommet au foyer"), ligne(`p=${nb(C.p)}\\ \\Rightarrow\\ 2p=${nb(2 * C.p)}`)]
            : [
                ligne(`a=${exL(aEx(C))}\\ \\Rightarrow\\ a^2=${nb(C.a2)}`, C.nature === "ellipse" ? "demi-grand axe lu" : "sommets lus"),
                ligne(`b=${exL(bEx(C))}\\ \\Rightarrow\\ b^2=${nb(C.b2)}`, C.nature === "ellipse" ? "demi-petit axe lu" : "rectangle lu"),
              ];
        out.push(
          utilise(sq, [t("Équations réduites (cours, § 1), écrites avec les longueurs lues sur la figure.")]),
          calcul(sq, lignes),
          res(reponse132(e, ph)),
        );
        break;
      }
      case "naturePropriete":
        out.push(
          utilise(sq, [t("Miroirs (cours, § 6) : rayons parallèles ↔ foyer pour la parabole ; foyer ↔ autre foyer pour l'ellipse et l'hyperbole.")]),
          resultat(sq, fr(reponse132(e, ph))),
          piege(sq, [t("Croire qu'un miroir elliptique concentre des rayons parallèles : seul le miroir parabolique le fait.")]),
        );
        break;
      case "propriete":
        out.push(utilise(sq, [t("Propriétés optiques (cours, § 6).")]), res(reponse132(e, ph)));
        break;
    }
  });
  return out;
}
