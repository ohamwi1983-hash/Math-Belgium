import type { Exercice125, Famille125, Objet125, Phase125 } from "../core6e/reconnaitreRemarquables";
import { OBJETS_125, ordreDepuis } from "../core6e/reconnaitreRemarquables";
import type { AideEcran, Frag, OptionEcran } from "../../5e-4h/ui5e/ecransTrigo.types";
import { l, t } from "./outilsLieuxLotH1";
import { figure125 } from "./figureReconnaitreRemarquables";

/**
 * Couche C — textes de `6gen125` « Reconnaître droites, points et cercles remarquables » : énoncé
 * (figure codée), deux choix fermés (l'objet, puis sa propriété), aides à deux niveaux (définitions
 * du cours, puis questions sur les codages de la figure — jamais le nom), réponses, messages d'un
 * choix faux (ce que montre le codage). Ordre des options FIXE (il ne dépend pas du verdict).
 */

type E = Exercice125;
type P = Phase125;

export const NOM_OBJET: Record<Objet125, string> = {
  mediane: "une médiane",
  hauteur: "une hauteur",
  mediatrice: "une médiatrice",
  bissectrice: "une bissectrice",
  G: "le centre de gravité",
  H: "l'orthocentre",
  O: "le centre du cercle circonscrit",
  I: "le centre du cercle inscrit",
  circonscrit: "le cercle circonscrit",
  inscrit: "le cercle inscrit",
  exinscrit: "un cercle exinscrit",
  neufPoints: "le cercle des neuf points (cercle d'Euler)",
};

const majuscule = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Ce que montre précisément la figure (corrigé, message d'un choix faux). */
export function descriptionObjet(e: E): string {
  const { nP, nQ, nR } = ordreDepuis(e);
  const [a, b, c] = e.noms;
  switch (e.objet) {
    case "mediane":
      return `La droite colorée passe par le sommet ${nP} et par le milieu du côté [${nQ}${nR}] (les deux moitiés portent le même codage) : c'est la médiane issue de ${nP}.`;
    case "hauteur":
      return `La droite colorée passe par le sommet ${nP} et coupe le côté [${nQ}${nR}] à angle droit (petit carré) : c'est la hauteur issue de ${nP}.`;
    case "mediatrice":
      return `La droite colorée passe par le milieu du côté [${nQ}${nR}] (moitiés codées) et lui est perpendiculaire (petit carré), sans passer par un sommet : c'est la médiatrice de [${nQ}${nR}].`;
    case "bissectrice":
      return `La droite colorée passe par le sommet ${nP} et partage l'angle en ${nP} en deux angles égaux (arcs codés) : c'est la bissectrice de l'angle en ${nP}.`;
    case "G":
      return `Les trois droites grises joignent chaque sommet au milieu du côté opposé (moitiés codées) : ce sont les médianes ; P, leur point de concours, est le centre de gravité.`;
    case "H":
      return `Les trois droites grises passent chacune par un sommet et sont perpendiculaires au côté opposé : ce sont les hauteurs ; P, leur point de concours, est l'orthocentre.`;
    case "O":
      return `Les trois droites grises passent par le milieu d'un côté et lui sont perpendiculaires : ce sont les médiatrices ; P, leur point de concours, est le centre du cercle circonscrit.`;
    case "I":
      return `Les trois droites grises partagent chacune un angle du triangle en deux angles égaux : ce sont les bissectrices ; P, leur point de concours, est le centre du cercle inscrit.`;
    case "circonscrit":
      return `Le cercle passe par les trois sommets ${a}, ${b} et ${c} : c'est le cercle circonscrit.`;
    case "inscrit":
      return `Le cercle est à l'intérieur du triangle et touche ses trois côtés (points de contact marqués) : c'est le cercle inscrit.`;
    case "exinscrit":
      return `Le cercle est à l'extérieur du triangle : il touche le côté [${nQ}${nR}] et les prolongements des deux autres côtés (en pointillé) : c'est le cercle exinscrit dans l'angle en ${nP}.`;
    case "neufPoints":
      return `Le cercle passe par les milieux des trois côtés et par les pieds des trois hauteurs (points marqués) : c'est le cercle des neuf points, ou cercle d'Euler.`;
  }
}

export const figureEcran125 = (e: E) => figure125(e);

export function situation125(e: E): Frag[] {
  const tri = `${e.noms[0]}${e.noms[1]}${e.noms[2]}`;
  switch (e.famille) {
    case "droite":
      return [t(`La figure montre un triangle ${tri} et, en couleur, une droite ; les codages (traits, petits carrés, arcs) sont ceux de la figure.`)];
    case "point":
      return [t(`La figure montre un triangle ${tri}, trois droites grises de même nature (codages compris) et leur point de concours P.`)];
    case "cercle":
      return [t(`La figure montre un triangle ${tri} et, en couleur, un cercle ; les points marqués et les codages font partie de la figure.`)];
  }
}

const QUESTION: Record<Famille125, { objet: string; propriete: string }> = {
  droite: { objet: "Quelle est la droite tracée en couleur ?", propriete: "Les trois droites de ce type d'un triangle se coupent en un même point. Lequel ?" },
  point: { objet: "Quel est le point P ?", propriete: "Quelle propriété le point P possède-t-il ?" },
  cercle: { objet: "Quel est le cercle tracé en couleur ?", propriete: "Où se trouve le centre de ce cercle ?" },
};

export function consigneGlobale125(e: E): Frag[] {
  switch (e.famille) {
    case "droite":
      return [t("Nomme la droite tracée en couleur, puis le point de concours des trois droites de ce type du triangle. Justifie à l'aide des codages.")];
    case "point":
      return [t("Nomme le point P, puis donne une propriété qui le caractérise. Justifie à l'aide des codages.")];
    case "cercle":
      return [t("Nomme le cercle tracé en couleur, puis dis où se trouve son centre. Justifie à l'aide de la figure.")];
  }
}

export const consigneGenerale125 = (e: E): Frag[] => [...situation125(e), t(" "), ...consigneGlobale125(e)];

export const libelle125 = (_e: E, p: P) => (p === "objet" ? "Nom" : "Propriété");

export const consigne125 = (e: E, p: P): Frag[] => [t(QUESTION[e.famille][p])];

/** Propriété associée à chaque objet (deuxième écran). */
const PROPRIETE: Record<Objet125, Frag[]> = {
  mediane: [t("le centre de gravité G")],
  hauteur: [t("l'orthocentre H")],
  mediatrice: [t("le centre O du cercle circonscrit")],
  bissectrice: [t("le centre I du cercle inscrit")],
  G: [t("Il est situé aux deux tiers de chaque médiane, à partir du sommet.")],
  H: [t("Les droites qui le joignent aux sommets sont perpendiculaires aux côtés opposés.")],
  O: [t("Il est à égale distance des trois sommets.")],
  I: [t("Il est à égale distance des trois côtés.")],
  circonscrit: [t("au point de concours des médiatrices des côtés")],
  inscrit: [t("au point de concours des bissectrices des angles du triangle")],
  exinscrit: [t("au point de concours d'une bissectrice intérieure et des bissectrices extérieures des deux autres angles")],
  neufPoints: [t("au milieu du segment [OH] qui joint le centre O du cercle circonscrit à l'orthocentre H")],
};

export function options125(e: E, p: P): OptionEcran[] {
  return OBJETS_125[e.famille].map((o) => ({ id: o, fragments: p === "objet" ? [t(majuscule(NOM_OBJET[o]))] : PROPRIETE[o].map((f) => (f.type === "texte" && e.famille !== "point" ? { ...f, valeur: majuscule(f.valeur) } : f)) }));
}

export const bonneOption125 = (e: E, _p: P) => e.objet;

export function reponse125(e: E, p: P): Frag[] {
  if (p === "objet") return [t(`${majuscule(NOM_OBJET[e.objet])}. ${descriptionObjet(e)}`)];
  switch (e.famille) {
    case "droite":
      return [t("Les trois droites de ce type se coupent en "), ...PROPRIETE[e.objet], t(".")];
    case "point":
      return PROPRIETE[e.objet];
    case "cercle":
      return [t("Son centre est "), ...PROPRIETE[e.objet], t(".")];
  }
}

export function recap125(e: E, p: P): Frag[] {
  if (p === "objet") return [t(majuscule(NOM_OBJET[e.objet]))];
  return e.famille === "point" ? PROPRIETE[e.objet] : [t(majuscule((PROPRIETE[e.objet][0] as { valeur: string }).valeur))];
}

/** Choix faux : ce que montre la figure (jamais seulement « faux »). */
export function piege125(e: E, p: P, choix: string): Frag[] | null {
  if (choix === e.objet) return null;
  if (p === "objet") {
    const c = choix as Objet125;
    const confusion: Partial<Record<Objet125, string>> = {
      mediane: "Une médiane joint un sommet au milieu du côté opposé (codage de deux moitiés égales).",
      hauteur: "Une hauteur passe par un sommet et coupe le côté opposé à angle droit.",
      mediatrice: "Une médiatrice passe par le milieu d'un côté et lui est perpendiculaire, sans passer en général par un sommet.",
      bissectrice: "Une bissectrice partage un angle du triangle en deux angles égaux.",
      G: "Le centre de gravité est le point de concours des médianes.",
      H: "L'orthocentre est le point de concours des hauteurs.",
      O: "Le centre du cercle circonscrit est le point de concours des médiatrices.",
      I: "Le centre du cercle inscrit est le point de concours des bissectrices.",
      circonscrit: "Le cercle circonscrit passe par les trois sommets.",
      inscrit: "Le cercle inscrit est à l'intérieur et touche les trois côtés.",
      exinscrit: "Un cercle exinscrit est à l'extérieur et touche un côté et les prolongements des deux autres.",
      neufPoints: "Le cercle des neuf points passe par les milieux des côtés et les pieds des hauteurs.",
    };
    return [t(`${confusion[c] ?? ""} Ici, ${descriptionObjet(e).replace(/^./, (c) => c.toLowerCase())}`)];
  }
  switch (e.famille) {
    case "droite":
      return [t(`Médianes → centre de gravité G ; hauteurs → orthocentre H ; médiatrices → centre O du cercle circonscrit ; bissectrices → centre I du cercle inscrit. Ici, la droite est ${NOM_OBJET[e.objet]}.`)];
    case "point":
      return [t("O (médiatrices) est équidistant des sommets ; I (bissectrices) est équidistant des côtés ; G (médianes) est aux deux tiers de chaque médiane ; H (hauteurs) : les droites vers les sommets sont perpendiculaires aux côtés opposés. Ici, P est "), t(`${NOM_OBJET[e.objet]}.`)];
    case "cercle":
      return [t(`Le centre d'un cercle qui passe par les sommets est équidistant des sommets (médiatrices) ; celui d'un cercle tangent aux côtés est équidistant des côtés (bissectrices). Ici, c'est ${NOM_OBJET[e.objet]}.`)];
  }
}

export function aide1_125(e: E, p: P): AideEcran {
  if (p === "objet") {
    switch (e.famille) {
      case "droite":
        return { texte: [t(`Cours, § 1 : médiane = sommet et milieu du côté opposé ; hauteur = sommet et perpendiculaire au côté opposé ; médiatrice = milieu d'un côté et perpendiculaire à ce côté ; bissectrice = partage un angle en deux angles égaux.`)] };
      case "point":
        return { texte: [t(`Cours, § 1 : les médianes se coupent au centre de gravité, les hauteurs à l'orthocentre, les médiatrices au centre du cercle circonscrit, les bissectrices au centre du cercle inscrit.`)] };
      case "cercle":
        return { texte: [t(`Cours, § 1 et § 2 : le cercle circonscrit passe par les sommets ; le cercle inscrit touche les trois côtés de l'intérieur ; un cercle exinscrit touche un côté et les prolongements des deux autres ; le cercle des neuf points passe par les milieux des côtés et les pieds des hauteurs.`)] };
    }
  }
  switch (e.famille) {
    case "droite":
      return { texte: [t(`Cours, § 1 : à chaque type de droite remarquable correspond un point de concours (G, H, O ou I).`)] };
    case "point":
      return { texte: [t(`Cours, § 1 : un point de la médiatrice d'un segment est équidistant de ses extrémités ; un point de la bissectrice d'un angle est équidistant de ses côtés ; le centre de gravité partage chaque médiane dans le rapport 2 : 1.`)] };
    case "cercle":
      return { texte: [t(`Cours, § 1 et § 2 : le centre d'un cercle passant par deux points est sur la médiatrice de ces points ; le centre d'un cercle tangent à deux droites est sur une bissectrice de leurs angles.`)] };
  }
}

export function aide2_125(e: E, p: P): AideEcran | null {
  if (p === "objet") {
    switch (e.famille) {
      case "droite":
        return { texte: [t("Ici, regarde : la droite passe-t-elle par un sommet ? Coupe-t-elle un côté en son milieu ? Le codage montre-t-il des longueurs égales, un angle droit ou des angles égaux ?")] };
      case "point":
        return { texte: [t("Ici, commence par reconnaître une des droites grises à l'aide de ses codages : les trois sont de la même nature.")] };
      case "cercle":
        return { texte: [t("Ici, le cercle passe-t-il par des sommets ? Touche-t-il des côtés (ou leurs prolongements) ? Est-il à l'intérieur ou à l'extérieur du triangle ? Quels points sont marqués ?")] };
    }
  }
  return { texte: [t("Ici, reprends ta réponse au premier écran : de quel objet s'agit-il, et quelle propriété le définit ?")] };
}

export { l };
