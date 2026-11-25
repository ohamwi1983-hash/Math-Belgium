import type { Exercice132, Phase132 } from "../core6e/lireConique";
import { SITUATIONS, phases132 } from "../core6e/lireConique";
import type { Conique, Nature } from "../core6e/coniquesLotH1";
import { aEx, asymptoteL, asymptotes, bEx, cEx, directriceL, directrices, equationReduiteL, excentricite, exL, foyers, nomPtExL, sommets } from "../core6e/coniquesLotH1";
import type { AideEcran, ChampEcran, Frag, OptionEcran } from "../../5e-4h/ui5e/ecransTrigo.types";
import { ILLISIBLE, l, nb, t } from "./outilsLieuxLotH1";
import { figureConique } from "./figureConiquesLotH1";
import { apercuLibre } from "../moteur6e/saisieConiquesLotH1";

/**
 * Couche C — textes de `6gen132` « Lire une conique sur sa figure ou son équation réduite » : énoncés,
 * options (ordre FIXE, jamais propre à l'instance), champs, aides à deux niveaux (propriété du cours,
 * puis posée pour l'instance — jamais la réponse), réponses attendues, figures (la courbe de la
 * variante `figure` reste visible ; rien pour `equation` et `optique`, où elle trahirait la réponse).
 */

type E = Exercice132;
type Ph = Phase132;

export const NOMS_SOMMETS: Record<Nature, string[]> = { ellipse: ["A", "A'", "B", "B'"], hyperbole: ["A", "A'"], parabole: ["S"] };
export const sommetsL = (C: Conique) => sommets(C).map((s, i) => nomPtExL(NOMS_SOMMETS[C.nature][i]!, s)).join("\\ ;\\ ");
export const foyersL = (C: Conique) => foyers(C).map((f, i) => nomPtExL(i === 0 ? "F" : "F'", f)).join("\\ ;\\ ");

export function situation132(e: E): Frag[] {
  if (e.variante === "equation") return [t("Dans un repère orthonormé, on donne la conique d'équation "), l(equationReduiteL(e.C)), t(".")];
  if (e.variante === "figure")
    return [
      t(
        e.C.nature === "parabole"
          ? "La figure représente une conique dans un repère orthonormé (une unité par carreau), avec un point F et une droite d en pointillé qui lui sont liés."
          : e.C.nature === "hyperbole"
            ? "La figure représente une conique dans un repère orthonormé (une unité par carreau), avec un rectangle et deux droites en pointillé qui lui sont liés."
            : "La figure représente une conique dans un repère orthonormé (une unité par carreau).",
      ),
    ];
  return [t(SITUATIONS[e.C.nature][e.situation ?? 0]!)];
}

export function consigneGlobale132(e: E): Frag[] {
  if (e.variante === "equation")
    return [t("Donne la nature de cette conique et son axe focal (pour une parabole : son sens d'ouverture), puis ses sommets, ses foyers et, selon sa nature, son excentricité, ses asymptotes ou sa directrice.")];
  if (e.variante === "figure") return [t("Donne la nature de cette conique, son axe focal (pour une parabole : son sens d'ouverture) et ses sommets, puis écris son équation réduite.")];
  return [t("Quelle conique a la propriété optique utilisée ici ? Énonce cette propriété.")];
}

export const consigneGenerale132 = (e: E): Frag[] => [...situation132(e), t(" "), ...consigneGlobale132(e)];

const LIBELLE: Record<Ph, string> = {
  nature: "Nature",
  axe: "Axe focal ou ouverture",
  sommets: "Sommets",
  foyers: "Foyers",
  excentricite: "Excentricité",
  asymptotes: "Asymptotes",
  directrice: "Directrice",
  equation: "Équation réduite",
  naturePropriete: "Quelle conique ?",
  propriete: "Propriété optique",
};
export const libelle132 = (_e: E, p: Ph) => LIBELLE[p];

export function consigne132(e: E, p: Ph): Frag[] {
  switch (p) {
    case "nature":
      return [t("Quelle est la nature de cette conique ?")];
    case "axe":
      return e.C.nature === "parabole" ? [t("Dans quel sens cette parabole est-elle ouverte ?")] : [t("Quel est l'axe focal de cette conique ?")];
    case "sommets":
      return e.variante === "figure" ? [t("Lis les coordonnées de tous les sommets de cette conique.")] : [t("Donne les coordonnées de tous les sommets de cette conique.")];
    case "foyers":
      return [t("Donne les coordonnées du foyer (des foyers) de cette conique.")];
    case "excentricite":
      return [t("Calcule l'excentricité e de cette ellipse (valeur exacte).")];
    case "asymptotes":
      return [t("Donne une équation de chacune des deux asymptotes de cette hyperbole.")];
    case "directrice":
      return [t("Donne une équation de la directrice de cette parabole.")];
    case "equation":
      return [t("Écris l'équation réduite de cette conique.")];
    case "naturePropriete":
      return [t("Quelle conique faut-il donner au miroir (ou à la paroi) pour obtenir cet effet ?")];
    case "propriete":
      return [t("Quelle propriété optique de cette conique est utilisée ?")];
  }
}

export const estChoix132 = (_e: E, p: Ph) => p === "nature" || p === "axe" || p === "naturePropriete" || p === "propriete";

export function options132(e: E, p: Ph): OptionEcran[] {
  switch (p) {
    case "nature":
      return [
        { id: "ellipse", fragments: [t("C'est une ellipse.")] },
        { id: "hyperbole", fragments: [t("C'est une hyperbole.")] },
        { id: "parabole", fragments: [t("C'est une parabole.")] },
        { id: "cercle", fragments: [t("C'est un cercle.")] },
      ];
    case "axe":
      if (e.C.nature === "parabole")
        return [
          { id: "droite", fragments: [t("Ouverte vers la droite (vers les x positifs).")] },
          { id: "gauche", fragments: [t("Ouverte vers la gauche (vers les x négatifs).")] },
          { id: "haut", fragments: [t("Ouverte vers le haut (vers les y positifs).")] },
          { id: "bas", fragments: [t("Ouverte vers le bas (vers les y négatifs).")] },
        ];
      return [
        { id: "x", fragments: [t("L'axe focal est l'axe des abscisses.")] },
        { id: "y", fragments: [t("L'axe focal est l'axe des ordonnées.")] },
      ];
    case "naturePropriete":
      return [
        { id: "parabole", fragments: [t("Une parabole.")] },
        { id: "ellipse", fragments: [t("Une ellipse.")] },
        { id: "hyperbole", fragments: [t("Une hyperbole.")] },
      ];
    default:
      return [
        { id: "parabole", fragments: [t("Tout rayon parallèle à l'axe est réfléchi vers le foyer ; tout rayon issu du foyer est réfléchi parallèlement à l'axe.")] },
        { id: "ellipse", fragments: [t("Tout rayon issu d'un foyer est réfléchi vers l'autre foyer.")] },
        { id: "hyperbole", fragments: [t("Tout rayon issu d'un foyer est réfléchi comme s'il venait de l'autre foyer : c'est son prolongement qui passe par l'autre foyer.")] },
        { id: "faux", fragments: [t("Tout faisceau de rayons parallèles est concentré en l'un des deux foyers.")] },
      ];
  }
}

export function idSens(C: Conique): string {
  return C.axe === "x" ? (C.sens === 1 ? "droite" : "gauche") : C.sens === 1 ? "haut" : "bas";
}

export function bonneOption132(e: E, p: Ph): string {
  if (p === "nature" || p === "naturePropriete" || p === "propriete") return e.C.nature;
  return e.C.nature === "parabole" ? idSens(e.C) : e.C.axe;
}

const champPoints = (label: string): ChampEcran => ({ label, placeholder: "(… ; …) ; (… ; …)", apercuLatex: apercuLibre });
const champDroite = (label: string): ChampEcran => ({ label, placeholder: "équation, avec « = »", apercuLatex: apercuLibre });

export function champs132(_e: E, p: Ph): ChampEcran[] {
  switch (p) {
    case "sommets":
      return [champPoints("Sommets")];
    case "foyers":
      return [champPoints("Foyers")];
    case "excentricite":
      return [{ label: "Excentricité e", labelLatex: "e=", placeholder: "nombre exact", apercuLatex: apercuLibre }];
    case "asymptotes":
      return [champDroite("Première asymptote"), champDroite("Seconde asymptote")];
    case "directrice":
      return [champDroite("Directrice d")];
    case "equation":
      return [champDroite("Équation réduite")];
    default:
      return [];
  }
}

export function messageIllisible132(_e: E, p: Ph): string {
  if (p === "sommets" || p === "foyers") return ILLISIBLE.points;
  if (p === "excentricite") return ILLISIBLE.nombre;
  if (p === "equation") return "Équation non reconnue : écris une équation en x et y avec « = », par exemple x²/9 + y²/4 = 1 ou y² = 6x (tape ² ou ^2). Cette saisie ne compte pas comme une tentative.";
  return ILLISIBLE.droite;
}

const PHRASE_SENS: Record<string, string> = { droite: "ouverte vers la droite", gauche: "ouverte vers la gauche", haut: "ouverte vers le haut", bas: "ouverte vers le bas" };
export const PROPRIETE: Record<Nature, string> = {
  parabole: "tout rayon parallèle à l'axe est réfléchi vers le foyer (et un rayon issu du foyer repart parallèlement à l'axe)",
  ellipse: "tout rayon issu d'un foyer est réfléchi vers l'autre foyer",
  hyperbole: "tout rayon issu d'un foyer est réfléchi comme s'il venait de l'autre foyer (son prolongement passe par l'autre foyer)",
};

export function reponse132(e: E, p: Ph): Frag[] {
  const C = e.C;
  switch (p) {
    case "nature":
    case "naturePropriete":
      return [t(`C'est une ${C.nature}.`)];
    case "axe":
      return C.nature === "parabole" ? [t(`La parabole est ${PHRASE_SENS[idSens(C)]}.`)] : [t(`L'axe focal est l'axe des ${C.axe === "x" ? "abscisses" : "ordonnées"}.`)];
    case "sommets":
      return [l(sommetsL(C))];
    case "foyers":
      return [l(foyersL(C))];
    case "excentricite":
      return [l(`e=${exL(excentricite(C))}`)];
    case "asymptotes":
      return [l(asymptoteL(asymptotes(C)[0]!)), t(" et "), l(asymptoteL(asymptotes(C)[1]!))];
    case "directrice":
      return [l(`d\\equiv ${directriceL(C, directrices(C)[0]!)}`)];
    case "equation":
      return [l(equationReduiteL(C))];
    case "propriete":
      return [t(`Dans un miroir ${C.nature === "parabole" ? "parabolique" : C.nature === "ellipse" ? "elliptique" : "hyperbolique"}, ${PROPRIETE[C.nature]}.`)];
  }
}

export function recap132(e: E, p: Ph): Frag[] {
  if (p === "propriete") return [t(`Miroir ${e.C.nature === "parabole" ? "parabolique" : e.C.nature === "ellipse" ? "elliptique" : "hyperbolique"}`)];
  return reponse132(e, p);
}

/** a², b² lus au bon endroit (dénominateurs) — pour les aides posées. */
function denominateurs(C: Conique): string {
  return C.axe === "x" ? `a^2=${nb(C.a2)}\\ \\text{et}\\ b^2=${nb(C.b2)}` : `a^2=${nb(C.a2)}\\ \\text{et}\\ b^2=${nb(C.b2)}`;
}

export function aide1_132(e: E, p: Ph): AideEcran {
  const C = e.C;
  switch (p) {
    case "nature":
      return e.variante === "figure"
        ? { texte: [t("Cours, § 1 : une ellipse est une courbe fermée ; une hyperbole a deux branches ; une parabole n'a qu'une branche, ouverte.")] }
        : { texte: [t("Cours, § 1 : sur l'équation réduite, deux carrés additionnés égaux à 1 → ellipse (cercle si les dénominateurs sont égaux) ; deux carrés soustraits égaux à 1 → hyperbole ; un seul carré → parabole.")] };
    case "axe":
      if (C.nature === "parabole") return { texte: [t("Cours, § 1 : la variable au carré donne l'axe focal (y² → axe des abscisses), la variable au premier degré et le signe de 2p donnent le sens d'ouverture.")] };
      if (C.nature === "ellipse") return { texte: [t("Cours, § 1 : c'est toujours le plus grand dénominateur qui porte a² et désigne l'axe focal, jamais la place de x ou de y dans l'écriture.")] };
      return { texte: [t("Cours, § 1 : l'axe focal d'une hyperbole est celui de la variable dont le carré est précédé du signe +.")] };
    case "sommets":
      if (C.nature === "ellipse") return { texte: [t("Cours, § 1 : l'ellipse "), l("\\dfrac{x^2}{a^2}+\\dfrac{y^2}{b^2}=1"), t(" a quatre sommets :")], latex: "(\\pm a\\,;0)\\ \\text{et}\\ (0\\,;\\pm b)" };
      if (C.nature === "hyperbole") return { texte: [t("Cours, § 1 : l'hyperbole "), l("\\dfrac{x^2}{a^2}-\\dfrac{y^2}{b^2}=1"), t(" a deux sommets, tous deux sur l'axe focal :")], latex: "(\\pm a\\,;0)" };
      return { texte: [t("Cours, § 1 : le sommet d'une parabole est son point le plus proche du foyer, sur l'axe focal ; dans l'équation réduite, c'est l'origine du repère.")] };
    case "foyers":
      if (C.nature === "ellipse") return { texte: [t("Cours, § 1 : les foyers sont sur l'axe focal, à la distance c du centre, avec :")], latex: "c^2=a^2-b^2" };
      if (C.nature === "hyperbole") return { texte: [t("Cours, § 1 : les foyers sont sur l'axe focal, à la distance c du centre, avec :")], latex: "c^2=a^2+b^2" };
      return { texte: [t("Cours, § 1 : pour "), l("y^2=2px"), t(", le foyer est "), l("F\\left(\\dfrac{p}{2}\\,;0\\right)"), t(" : il est à la distance "), l("\\dfrac{p}{2}"), t(" du sommet, du côté de l'ouverture.")] };
    case "excentricite":
      return { texte: [t("Cours, § 2 : l'excentricité d'une ellipse ou d'une hyperbole est :")], latex: "e=\\dfrac{c}{a}" };
    case "asymptotes":
      return C.axe === "x"
        ? { texte: [t("Cours, § 1 : l'hyperbole "), l("\\dfrac{x^2}{a^2}-\\dfrac{y^2}{b^2}=1"), t(" a pour asymptotes :")], latex: "y=\\pm\\dfrac{b}{a}\\,x" }
        : { texte: [t("Cours, § 1 : on échange les rôles de x et y ; l'hyperbole "), l("\\dfrac{y^2}{a^2}-\\dfrac{x^2}{b^2}=1"), t(" a pour asymptotes :")], latex: "y=\\pm\\dfrac{a}{b}\\,x" };
    case "directrice":
      return { texte: [t("Cours, § 1 : pour "), l("y^2=2px"), t(", la directrice est "), l("d\\equiv x=-\\dfrac{p}{2}"), t(" : elle est à la distance "), l("\\dfrac{p}{2}"), t(" du sommet, du côté opposé au foyer.")] };
    case "equation":
      return { texte: [t("Cours, § 1 : équations réduites — "), l("\\dfrac{x^2}{a^2}+\\dfrac{y^2}{b^2}=1"), t(", "), l("\\dfrac{x^2}{a^2}-\\dfrac{y^2}{b^2}=1"), t(", "), l("y^2=2px"), t(" (et leurs versions où x et y sont échangés ou de signe opposé).")] };
    case "naturePropriete":
      return { texte: [t("Cours, § 6 : le miroir parabolique travaille avec des rayons parallèles et un foyer ; les miroirs elliptique et hyperbolique relient les deux foyers.")] };
    case "propriete":
      return { texte: [t("Cours, § 6 : relis la conséquence de la propriété optique propre à chaque miroir (parabolique, elliptique, hyperbolique).")] };
  }
}

export function aide2_132(e: E, p: Ph): AideEcran | null {
  const C = e.C;
  switch (p) {
    case "nature":
      return e.variante === "figure" ? { texte: [t("Ici, compte les branches de la courbe et regarde si elle se referme.")] } : { texte: [t("Ici, regarde combien de carrés contient l'équation, et le signe qui les sépare.")] };
    case "axe":
      if (C.nature === "parabole") return { texte: [t("Ici, repère quelle variable est au carré, puis le signe du coefficient de l'autre variable.")] };
      if (C.nature === "ellipse") return { texte: [t("Ici, compare les nombres sous "), l("x^2"), t(" et sous "), l("y^2"), t(e.variante === "figure" ? " — ou, sur la figure, la direction dans laquelle la courbe est la plus longue." : ".")] };
      return { texte: [t(e.variante === "figure" ? "Ici, regarde quel axe les deux branches coupent." : "Ici, repère le carré précédé du signe +.")] };
    case "sommets":
      if (e.variante === "figure") return { texte: [t("Ici, cherche les points où la courbe coupe ses axes de symétrie et lis leurs coordonnées sur le quadrillage.")] };
      if (C.nature === "parabole") return { texte: [t("Ici, l'équation n'a pas de terme constant : remplace x et y par 0 pour le vérifier.")] };
      return { texte: [t("Ici, "), l(denominateurs(C)), t(" : prends les racines carrées, puis place-les sur le bon axe.")] };
    case "foyers":
      if (C.nature === "parabole") return { texte: [t("Ici, 2p vaut "), l(nb(2 * C.p * C.sens)), t(" : calcule p, puis "), l("\\dfrac{p}{2}"), t(", et place le foyer du côté de l'ouverture.")] };
      return { texte: [t("Ici, "), l(denominateurs(C)), t(" : calcule "), l("c^2"), t(", puis c, et place les deux foyers sur l'axe focal.")] };
    case "excentricite":
      return { texte: [t("Ici, reprends c trouvé à l'écran précédent et "), l(`a=${exL(aEx(C))}`), t(".")] };
    case "asymptotes":
      return { texte: [t("Ici, "), l(`a=${exL(aEx(C))}`), t(" et "), l(`b=${exL(bEx(C))}`), t(" : attention au rapport à écrire selon l'axe focal.")] };
    case "directrice":
      return { texte: [t("Ici, 2p vaut "), l(nb(2 * C.p * C.sens)), t(" : calcule "), l("\\dfrac{p}{2}"), t(" et place la directrice du côté opposé au foyer.")] };
    case "equation":
      if (C.nature === "parabole") return { texte: [t("Ici, lis la distance du sommet au foyer : elle vaut "), l("\\dfrac{p}{2}"), t(". Déduis-en p, puis 2p, avec le bon signe.")] };
      if (C.nature === "hyperbole") return { texte: [t("Ici, a se lit sur les sommets et b sur le rectangle en pointillé (ses sommets ont pour coordonnées "), l("(\\pm a\\,;\\pm b)"), t(" ou "), l("(\\pm b\\,;\\pm a)"), t(").")] };
      return { texte: [t("Ici, a et b se lisent sur les quatre sommets : a sur l'axe le plus long, b sur l'autre.")] };
    case "naturePropriete":
      return { texte: [t("Ici, demande-toi si les rayons utiles arrivent parallèles entre eux, ou partent d'un point pour aller vers un autre point.")] };
    case "propriete":
      return { texte: [t(`Ici, la conique est une ${C.nature} : choisis l'énoncé qui lui correspond exactement.`)] };
  }
}

/** Figure de l'écran : la courbe de la variante `figure` (jamais pour `equation` ni `optique`). */
export function figure132(e: E, _p: Ph): string | null {
  if (e.variante !== "figure") return null;
  return figureConique(e.C, {
    asymptotes: e.C.nature === "hyperbole",
    rectangle: e.C.nature === "hyperbole",
    directrices: e.C.nature === "parabole",
    foyers: e.C.nature === "parabole",
    etiquettes: true,
  });
}

/** Figure du corrigé : courbe, centre, sommets, foyers, asymptotes ou directrice(s). */
export function figureCorrige132(e: E): string {
  return figureConique(e.C, { centre: true, sommets: true, foyers: true, asymptotes: true, rectangle: e.C.nature === "hyperbole", directrices: e.C.nature !== "hyperbole" });
}

export { phases132, cEx };
