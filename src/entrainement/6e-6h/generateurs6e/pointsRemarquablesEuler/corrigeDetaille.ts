import { figureCorrigeLot } from "../../ui6e/corrigeLieuxLotH1";
import type { EtapeCorrection } from "../../../export/genererFeuilleExercices";
import { calcul, lettreEtape, ligne, piege, resultat, utilise, verification } from "../../../export/corrigeTableau";
import type { Exercice124 } from "../../core6e/pointsRemarquablesEuler";
import { G124, H124, N124, PHASES_124, hauteurA, hauteurC, mediatriceAB, mediatriceBC } from "../../core6e/pointsRemarquablesEuler";
import { figure124, reponse124 } from "../../ui6e/formatPointsRemarquablesEuler";
import { lignesDroiteNormale, lignesMilieu, ligneVecteur } from "../../ui6e/corrigeLieuxLotH1";
import { dist2, fr, l, lignesSysteme, milieu, nb, nbp, t, vec } from "../../ui6e/outilsLieuxLotH1";

/**
 * Corrigé détaillé « comme au tableau » de `6gen124`, une lettre par écran : G (moyenne des sommets),
 * médiatrice de [AB] (milieu, vecteur normal, équation développée), O (seconde médiatrice, système,
 * vérification OA² = OB² = OC²), hauteur issue de C, H (seconde hauteur, système, vérification
 * d'Euler OH = 3·OG), N (milieu de [OH], figure de la droite d'Euler). Même source que l'écran.
 */

type E = Exercice124;

export function correctionDetaillee124(e: E): EtapeCorrection[] {
  const out: EtapeCorrection[] = [];
  const G = G124(e);
  const H = H124(e);
  const N = N124(e);
  const sommeTexte = (a: number, b: number, c: number) => `${nb(a)}${b < 0 ? "" : "+"}${nb(b)}${c < 0 ? "" : "+"}${nb(c)}`;
  PHASES_124.forEach((ph, i) => {
    const sq = lettreEtape(i);
    switch (ph) {
      case "G":
        out.push(
          utilise(sq, [t("Centre de gravité (cours, § 1) : point de concours des médianes, sa coordonnée est la moyenne des coordonnées des sommets.")]),
          calcul(sq, [
            ligne(`x_G=\\dfrac{${sommeTexte(e.A.x, e.B.x, e.C.x)}}{3}=\\dfrac{${nb(3 * G.x)}}{3}=${nb(G.x)}`, "moyenne des abscisses"),
            ligne(`y_G=\\dfrac{${sommeTexte(e.A.y, e.B.y, e.C.y)}}{3}=\\dfrac{${nb(3 * G.y)}}{3}=${nb(G.y)}`, "moyenne des ordonnées"),
          ]),
          resultat(sq, fr(reponse124(e, ph))),
          piege(sq, [t("Oublier de diviser par 3, ou prendre G pour le centre du cercle circonscrit.")]),
        );
        break;
      case "mediatrice": {
        const M = milieu(e.A, e.B);
        const { lignes } = lignesDroiteNormale(vec(e.A, e.B), M, "M");
        out.push(
          utilise(sq, [t("Médiatrice (cours, § 1) : elle passe par le milieu M de [AB] et elle est perpendiculaire à (AB), donc "), l("\\vec{AB}"), t(" en est un vecteur normal.")]),
          calcul(sq, [...lignesMilieu("M", e.A, e.B, "A", "B"), ligneVecteur("AB", e.A, e.B), ...lignes]),
          resultat(sq, fr(reponse124(e, ph))),
          verification(sq, [t("Le milieu M vérifie l'équation, et A, B sont à égale distance de tout point de cette droite.")]),
          piege(sq, [t("Prendre "), l("\\vec{AB}"), t(" comme vecteur directeur : on obtiendrait une droite parallèle à (AB).")]),
        );
        break;
      }
      case "O": {
        const { lignes } = lignesDroiteNormale(vec(e.B, e.C), milieu(e.B, e.C), "le milieu de [BC]");
        out.push(
          utilise(sq, [t("Centre du cercle circonscrit (cours, § 1) : point de concours des médiatrices ; on coupe la médiatrice de [AB] avec celle de [BC].")]),
          calcul(sq, [...lignesMilieu("M'", e.B, e.C, "B", "C"), ligneVecteur("BC", e.B, e.C), ...lignes, ...lignesSysteme(mediatriceAB(e), mediatriceBC(e))]),
          resultat(sq, fr(reponse124(e, ph))),
          verification(sq, [t("O est à égale distance des trois sommets : "), l(`OA^2=OB^2=OC^2=${dist2(e.O, e.A)}`), t(".")]),
          piege(sq, [t("Prendre la moyenne des sommets : c'est G, pas O (ils ne sont confondus que dans un triangle équilatéral).")]),
        );
        break;
      }
      case "hauteur": {
        const { lignes } = lignesDroiteNormale(vec(e.A, e.B), e.C, "C");
        out.push(
          utilise(sq, [t("Hauteur (cours, § 1) : elle passe par le sommet C et elle est perpendiculaire à (AB), donc "), l("\\vec{AB}"), t(" en est un vecteur normal.")]),
          calcul(sq, [ligneVecteur("AB", e.A, e.B), ...lignes]),
          resultat(sq, fr(reponse124(e, ph))),
          verification(sq, [t("C vérifie l'équation.")]),
          piege(sq, [t("Faire passer la droite par le milieu de [AB] : ce serait la médiatrice, pas la hauteur.")]),
        );
        break;
      }
      case "H": {
        const { lignes } = lignesDroiteNormale(vec(e.B, e.C), e.A, "A");
        const OG = vec(e.O, G);
        const OH = vec(e.O, H);
        out.push(
          utilise(sq, [t("Orthocentre (cours, § 1) : point de concours des hauteurs ; on coupe la hauteur issue de C avec celle issue de A (vecteur normal "), l("\\vec{BC}"), t(").")]),
          calcul(sq, [ligneVecteur("BC", e.B, e.C), ...lignes, ...lignesSysteme(hauteurC(e), hauteurA(e))]),
          resultat(sq, fr(reponse124(e, ph))),
          verification(sq, [t("Droite d'Euler : "), l(`\\vec{OG}\\begin{pmatrix}${nb(OG.x)}\\\\${nb(OG.y)}\\end{pmatrix}`), t(" et "), l(`\\vec{OH}\\begin{pmatrix}${nb(OH.x)}\\\\${nb(OH.y)}\\end{pmatrix}`), t(", donc "), l("\\vec{OH}=3\\,\\vec{OG}"), t(" : O, G et H sont alignés.")]),
          piege(sq, [t("Couper deux médianes ou deux médiatrices au lieu de deux hauteurs ; dans un triangle obtusangle, H est à l'extérieur du triangle.")]),
        );
        break;
      }
      case "N":
        out.push(
          utilise(sq, [t("Cercle des neuf points (cours, § 1) : son centre N est le milieu de [OH], sur la droite d'Euler ; son rayon est la moitié de celui du cercle circonscrit.")]),
          {
            ...calcul(sq, [ligne(`N\\left(\\dfrac{${nb(e.O.x)}+${nbp(H.x)}}{2}\\,;\\dfrac{${nb(e.O.y)}+${nbp(H.y)}}{2}\\right)=\\left(${nb(N.x)}\\,;${nb(N.y)}\\right)`, "milieu de [OH]")]),
            figureHtml: figureCorrigeLot(figure124(e, "fin")),
          },
          resultat(sq, fr(reponse124(e, ph))),
          verification(sq, [t("N est sur la droite d'Euler (OGH), entre O et H.")]),
          piege(sq, [t("Prendre le milieu de [OG] ou de [GH] : N est le milieu de [OH].")]),
        );
        break;
    }
  });
  return out;
}
