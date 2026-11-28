import type { Exercice134, Phase134 } from "../core6e/reduireConique";
import { phases134, polyDonne } from "../core6e/reduireConique";
import type { Conique } from "../core6e/coniquesLotH1";
import { aEx, asymptoteL, asymptotes, bEx, centre, directriceL, directrices, equationReduiteL, exL, foyers, nomPtExL, ptExL, sommets } from "../core6e/coniquesLotH1";
import type { AideEcran, ChampEcran, Frag, OptionEcran } from "../../5e-4h/ui5e/ecransTrigo.types";
import { ILLISIBLE, l, nb, somme, t } from "./outilsLieuxLotH1";
import { equationPolyL } from "./outilsLieuxLotH2";
import { figureConique } from "./figureConiquesLotH1";
import { apercuLibre } from "../moteur6e/saisieConiquesLotH1";

/**
 * Couche C — textes de `6gen134` « Réduire par translation et donner tous les éléments » : énoncé
 * (équation développée), consignes qui ne disent jamais la nature, options de nature et d'axe (ordre
 * FIXE), aides à deux niveaux (méthode du cours, puis posée pour l'instance — jamais la réponse),
 * réponses attendues ; aucune figure à l'écran (elle trahirait la nature), figure complète au corrigé.
 */

type E = Exercice134;
type Ph = Phase134;

export const equationDonneeL = (e: E) => equationPolyL(polyDonne(e));

export function situation134(e: E): Frag[] {
  return [t("Dans un repère orthonormé, une conique a pour équation "), l(equationDonneeL(e)), t(".")];
}

export const consigneGlobale134 = (): Frag[] => [
  t("Réduis cette équation par une translation des axes : donne le nouveau centre (ou le sommet) Ω et l'équation réduite dans le repère translaté (x′ ; y′). Identifie la conique, puis donne, dans le repère initial, ses sommets, ses foyers et, selon le cas, ses directrices, ses asymptotes ou son paramètre et sa directrice."),
];

export const consigneGenerale134 = (e: E): Frag[] => [...situation134(e), t(" "), ...consigneGlobale134()];

const LIBELLE: Record<Ph, string> = {
  centre: "Centre ou sommet Ω",
  reduite: "Équation réduite",
  nature: "Nature et axe focal",
  sommets: "Sommets",
  foyers: "Foyers",
  directrices: "Directrices",
  asymptotes: "Asymptotes",
  parametre: "Paramètre p",
  foyer: "Foyer",
  directrice: "Directrice",
};
export const libelle134 = (_e: E, p: Ph) => LIBELLE[p];

export function consigne134(e: E, p: Ph): Frag[] {
  switch (p) {
    case "centre":
      return [t("Complète les carrés : quel est le point Ω(h ; k) qui devient l'origine du repère translaté (le centre de la conique, ou son sommet si c'est une parabole) ?")];
    case "reduite":
      return [t("Écris l'équation réduite de la conique dans le repère translaté d'origine Ω, avec les lettres x′ et y′ (tape x' et y').")];
    case "nature":
      return [t("Quelle est la nature de cette conique, et la direction de son axe focal ?")];
    case "sommets":
      return [t(e.C.nature === "ellipse" ? "Donne les coordonnées des quatre sommets, dans le repère initial." : "Donne les coordonnées des sommets, dans le repère initial.")];
    case "foyers":
      return [t("Donne les coordonnées des deux foyers, dans le repère initial.")];
    case "directrices":
      return [t("Donne une équation de chacune des deux directrices, dans le repère initial.")];
    case "asymptotes":
      return [t("Donne une équation de chacune des deux asymptotes, dans le repère initial.")];
    case "parametre":
      return [t("Quel est le paramètre p de cette parabole (distance du foyer à la directrice) ?")];
    case "foyer":
      return [t("Donne les coordonnées du foyer, dans le repère initial.")];
    case "directrice":
      return [t("Donne une équation de la directrice, dans le repère initial.")];
  }
}

export const estChoix134 = (_e: E, p: Ph) => p === "nature";

export const OPTIONS_NATURE: { id: string; texte: string }[] = [
  { id: "ellipse-x", texte: "Une ellipse d'axe focal horizontal (parallèle à Ox)." },
  { id: "ellipse-y", texte: "Une ellipse d'axe focal vertical (parallèle à Oy)." },
  { id: "hyperbole-x", texte: "Une hyperbole d'axe focal horizontal (parallèle à Ox)." },
  { id: "hyperbole-y", texte: "Une hyperbole d'axe focal vertical (parallèle à Oy)." },
  { id: "parabole-x", texte: "Une parabole d'axe focal horizontal (parallèle à Ox)." },
  { id: "parabole-y", texte: "Une parabole d'axe focal vertical (parallèle à Oy)." },
];
export const options134 = (): OptionEcran[] => OPTIONS_NATURE.map((o) => ({ id: o.id, fragments: [t(o.texte)] }));
export const bonneOption134 = (e: E) => `${e.C.nature}-${e.C.axe}`;

const champPoints = (label: string): ChampEcran => ({ label, placeholder: "(… ; …) ; (… ; …)", apercuLatex: apercuLibre });
const champDroite = (label: string): ChampEcran => ({ label, placeholder: "équation, avec « = »", apercuLatex: apercuLibre });

export function champs134(_e: E, p: Ph): ChampEcran[] {
  switch (p) {
    case "centre":
      return [{ label: "Point Ω", labelLatex: "\\Omega=", placeholder: "(… ; …)", apercuLatex: apercuLibre }];
    case "reduite":
      return [champDroite("Équation réduite en x′ et y′")];
    case "sommets":
      return [champPoints("Sommets")];
    case "foyers":
      return [champPoints("Foyers")];
    case "foyer":
      return [champPoints("Foyer F")];
    case "directrices":
      return [champDroite("Première directrice"), champDroite("Seconde directrice")];
    case "asymptotes":
      return [champDroite("Première asymptote"), champDroite("Seconde asymptote")];
    case "directrice":
      return [champDroite("Directrice d")];
    case "parametre":
      return [{ label: "Paramètre p", labelLatex: "p=", placeholder: "nombre exact", apercuLatex: apercuLibre }];
    default:
      return [];
  }
}

export function messageIllisible134(_e: E, p: Ph): string {
  if (p === "centre") return ILLISIBLE.point;
  if (p === "sommets" || p === "foyers" || p === "foyer") return ILLISIBLE.points;
  if (p === "parametre") return ILLISIBLE.nombre;
  if (p === "reduite") return "Équation non reconnue : écris-la avec x′ et y′ (tape x' et y') et « = », par exemple x'²/9 + y'²/4 = 1. Cette saisie ne compte pas comme une tentative.";
  return ILLISIBLE.droite;
}

const NOMS: Record<string, string[]> = { ellipse: ["A", "A'", "B", "B'"], hyperbole: ["A", "A'"], parabole: ["S"] };
const listePts = (_C: Conique, pts: ReturnType<typeof sommets>, noms: string[]) => pts.map((s, i) => nomPtExL(noms[i]!, s)).join("\\ ;\\ ");

export function reponse134(e: E, p: Ph): Frag[] {
  const C = e.C;
  switch (p) {
    case "centre":
      return [l(`\\Omega${ptExL(centre(C))}`)];
    case "reduite":
      return [l(equationReduiteL(C, true))];
    case "nature":
      return [t(OPTIONS_NATURE.find((o) => o.id === bonneOption134(e))!.texte.replace(/^Une/, "C'est une"))];
    case "sommets":
      return [l(listePts(C, sommets(C), NOMS[C.nature]!))];
    case "foyers":
      return [l(listePts(C, foyers(C), ["F", "F'"]))];
    case "foyer":
      return [l(listePts(C, foyers(C), ["F"]))];
    case "directrices": {
      const [d1, d2] = directrices(C);
      return [l(`d\\equiv ${directriceL(C, d1!)}`), t(" et "), l(`d'\\equiv ${directriceL(C, d2!)}`)];
    }
    case "directrice":
      return [l(`d\\equiv ${directriceL(C, directrices(C)[0]!)}`)];
    case "asymptotes": {
      const [d1, d2] = asymptotes(C);
      return [l(asymptoteL(d1!)), t(" et "), l(asymptoteL(d2!))];
    }
    case "parametre":
      return [l(`p=${nb(C.p)}`)];
  }
}

export const recap134 = reponse134;

export function aide1_134(e: E, p: Ph): AideEcran {
  const C = e.C;
  switch (p) {
    case "centre":
      return { texte: [t("Cours, point 2 : regroupe les termes en x et en y, mets le coefficient du carré en évidence, puis complète chaque groupe en un carré parfait :")], latex: "x^2-2hx=(x-h)^2-h^2" };
    case "reduite":
      return { texte: [t("Cours, point 2 : après la complétion, divise par le second membre pour obtenir 1 (pour une parabole, isole le carré), puis remplace x − h par x′ et y − k par y′.")] };
    case "nature":
      return { texte: [t("Cours, point 1 : deux carrés additionnés égaux à 1 → ellipse (axe focal = plus grand dénominateur) ; soustraits → hyperbole (axe focal = carré précédé de +) ; un seul carré → parabole.")] };
    case "sommets":
    case "foyers":
    case "foyer":
      return { texte: [t("Cours, point 2 : calcule l'élément dans le repère translaté (centre en O′), puis reviens au repère initial :")], latex: "x=x'+h\\qquad y=y'+k" };
    case "directrices":
      return { texte: [t("Cours, point 2 : les directrices sont perpendiculaires à l'axe focal, à la distance "), l("\\dfrac{a^2}{c}"), t(" du centre.")] };
    case "asymptotes":
      return { texte: [t("Cours, point 1 : dans le repère translaté, les asymptotes sont "), l(C.axe === "x" ? "y'=\\pm\\dfrac{b}{a}x'" : "y'=\\pm\\dfrac{a}{b}x'"), t(" ; elles passent par le centre Ω.")] };
    case "parametre":
      return { texte: [t("Cours, point 1 : dans "), l("y'^2=2p\\,x'"), t(", le coefficient est 2p (le double du paramètre) ; p est la distance du foyer à la directrice.")] };
    case "directrice":
      return { texte: [t("Cours, point 1 : la directrice est perpendiculaire à l'axe focal, à la distance "), l("\\dfrac{p}{2}"), t(" du sommet, du côté opposé au foyer.")] };
  }
}

export function aide2_134(e: E, p: Ph): AideEcran | null {
  const C = e.C;
  const P = polyDonne(e);
  switch (p) {
    case "centre": {
      const groupes = (["x", "y"] as const)
        .filter((v) => (P[v === "x" ? "x2" : "y2"] ?? 0) !== 0)
        .map((v) => l(somme([[P[v === "x" ? "x2" : "y2"] ?? 0, `${v}^2`], [P[v] ?? 0, v]])));
      return { texte: [t("Ici, regroupe "), ...groupes.flatMap((g, i) => (i === 0 ? [g] : [t(" et "), g])), t(" : divise le coefficient du premier degré par celui du carré avant de compléter (pour une parabole, l'autre variable reste au premier degré).")] };
    }
    case "reduite":
      return C.nature === "parabole"
        ? { texte: [t("Ici, garde le carré seul dans un membre et mets le reste en évidence sous la forme 2p(x − h) ou 2p(y − k).")] }
        : { texte: [t("Ici, regarde le signe du second membre obtenu : si tu divises par un nombre négatif, les deux signes s'inversent.")] };
    case "nature":
      return { texte: [t("Ici, lis l'équation réduite de l'écran précédent : combien de carrés, quel signe entre eux, et lequel porte le plus grand dénominateur ou le signe + ?")] };
    case "sommets":
      return { texte: [t("Ici, "), l(`a=${exL(aEx(C))}`), t(C.nature === "ellipse" ? " et " : " : "), ...(C.nature === "ellipse" ? [l(`b=${exL(bEx(C))}`), t(" : ")] : []), t("place les sommets autour de O′ dans le repère translaté, puis ajoute h et k.")] };
    case "foyers":
      return { texte: [t("Ici, "), l(`a^2=${nb(C.a2)}`), t(" et "), l(`b^2=${nb(C.b2)}`), t(" : calcule c dans le repère translaté, puis ajoute h et k.")] };
    case "foyer":
    case "directrice":
      return { texte: [t("Ici, "), l(`p=${nb(C.p)}`), t(" : compte "), l("\\dfrac{p}{2}"), t(" depuis le sommet Ω, dans le sens de l'ouverture (signe du coefficient 2p) pour le foyer, en sens contraire pour la directrice.")] };
    case "directrices":
      return { texte: [t("Ici, "), l(`a^2=${nb(C.a2)}`), t(" : calcule c, puis "), l("\\dfrac{a^2}{c}"), t(", et reporte-le de part et d'autre du centre le long de l'axe focal.")] };
    case "asymptotes":
      return { texte: [t("Ici, remplace x′ par "), l(C.h > 0 ? `x-${nb(C.h)}` : `x+${nb(-C.h)}`), t(" et y′ par "), l(C.k > 0 ? `y-${nb(C.k)}` : `y+${nb(-C.k)}`), t(" dans les équations du repère translaté.")] };
    case "parametre":
      return { texte: [t("Ici, lis le coefficient du terme du premier degré dans l'équation réduite : il vaut 2p, au signe près.")] };
  }
}

/** Figure du corrigé : conique, centre, sommets, foyers, directrices ou asymptotes, axes translatés implicites. */
export function figureCorrige134(e: E): string {
  return figureConique(e.C, { centre: true, sommets: true, foyers: true, asymptotes: true, directrices: e.C.nature !== "hyperbole", rectangle: e.C.nature === "hyperbole" });
}

export { phases134 };
