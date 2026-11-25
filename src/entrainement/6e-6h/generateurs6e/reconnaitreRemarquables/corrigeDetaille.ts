import { figureCorrigeLot } from "../../ui6e/corrigeLieuxLotH1";
import type { EtapeCorrection } from "../../../export/genererFeuilleExercices";
import { lettreEtape, piege, resultat, utilise } from "../../../export/corrigeTableau";
import type { Exercice125 } from "../../core6e/reconnaitreRemarquables";
import { PHASES_125 } from "../../core6e/reconnaitreRemarquables";
import { NOM_OBJET, reponse125 } from "../../ui6e/formatReconnaitreRemarquables";
import { figure125 } from "../../ui6e/figureReconnaitreRemarquables";
import { fr, t } from "../../ui6e/outilsLieuxLotH1";

/**
 * Corrigé détaillé « comme au tableau » de `6gen125`, une lettre par écran : définition du cours
 * (« Ce qu'on utilise »), lecture des codages et nom de l'objet (figure légendée), propriété, piège
 * propre à l'objet. Même source que l'écran (`reponse125`).
 */

type E = Exercice125;

const PIEGE_OBJET: Record<Exercice125["objet"], string> = {
  mediane: "Confondre médiane et bissectrice : la médiane coupe le côté opposé en son milieu, pas l'angle en deux.",
  hauteur: "Confondre hauteur et médiatrice : la hauteur passe par un sommet, la médiatrice par le milieu d'un côté.",
  mediatrice: "Confondre médiatrice et hauteur : la médiatrice ne passe en général par aucun sommet.",
  bissectrice: "Confondre bissectrice et médiane : la bissectrice ne coupe en général pas le côté opposé en son milieu.",
  G: "Confondre le centre de gravité (médianes) avec le centre du cercle inscrit (bissectrices) : regarde si les codages portent sur les côtés ou sur les angles.",
  H: "Confondre orthocentre (hauteurs, issues des sommets) et centre du cercle circonscrit (médiatrices, issues des milieux).",
  O: "Croire que le centre du cercle circonscrit est la moyenne des sommets : c'est le centre de gravité qui l'est.",
  I: "Croire que le centre du cercle inscrit est le centre de gravité : ce n'est vrai que pour un triangle équilatéral.",
  circonscrit: "Confondre cercle circonscrit (passe par les sommets) et cercle inscrit (touche les côtés).",
  inscrit: "Croire que le centre du cercle inscrit est sur les médiatrices : il est sur les bissectrices.",
  exinscrit: "Oublier qu'un cercle tangent aux trois droites des côtés n'est pas forcément le cercle inscrit : il y en a quatre, dont trois exinscrits.",
  neufPoints: "Prendre ce cercle pour le cercle circonscrit : il ne passe par aucun sommet, son rayon est la moitié de celui du cercle circonscrit.",
};

export function correctionDetaillee125(e: E): EtapeCorrection[] {
  const out: EtapeCorrection[] = [];
  PHASES_125.forEach((ph, i) => {
    const sq = lettreEtape(i);
    if (ph === "objet") {
      out.push(
        {
          ...utilise(sq, [
            t(
              e.famille === "cercle"
                ? "Cercles remarquables (cours, § 1 et § 2) : circonscrit (par les sommets), inscrit (tangent aux côtés, à l'intérieur), exinscrit (tangent à un côté et aux prolongements des deux autres), cercle des neuf points (milieux des côtés, pieds des hauteurs)."
                : "Droites remarquables (cours, § 1) : médiane (sommet, milieu du côté opposé), hauteur (sommet, perpendiculaire au côté opposé), médiatrice (milieu d'un côté, perpendiculaire), bissectrice (partage un angle en deux angles égaux).",
            ),
          ]),
          figureHtml: figureCorrigeLot(figure125(e, NOM_OBJET[e.objet].replace(/^./, (c) => c.toUpperCase()))),
        },
        resultat(sq, fr(reponse125(e, ph))),
        piege(sq, [t(PIEGE_OBJET[e.objet])]),
      );
    } else {
      out.push(
        utilise(sq, [
          t(
            e.famille === "droite"
              ? "Points de concours (cours, § 1) : médianes → G, hauteurs → H, médiatrices → O, bissectrices → I."
              : e.famille === "point"
                ? "Propriétés (cours, § 1) : G aux deux tiers de chaque médiane depuis le sommet ; H, les droites vers les sommets sont perpendiculaires aux côtés opposés ; O équidistant des sommets ; I équidistant des côtés."
                : "Centre d'un cercle (cours, § 1 et § 2) : équidistant de deux points → sur leur médiatrice ; équidistant de deux droites → sur une bissectrice de leurs angles.",
          ),
        ]),
        resultat(sq, fr(reponse125(e, ph))),
        piege(sq, [
          t(
            e.famille === "point"
              ? "Échanger les propriétés de O et de I : O est à égale distance des sommets, I à égale distance des côtés."
              : e.famille === "droite"
                ? "Associer les médiatrices au centre de gravité : le centre de gravité vient des médianes."
                : "Placer le centre d'un cercle tangent aux côtés sur les médiatrices : il est sur des bissectrices.",
          ),
        ]),
      );
    }
  });
  return out;
}
