import type { AideEcran, ChampEcran, DefinitionEcrans, Frag, OptionEcran } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { ExerciceLC, NatureLC, PhaseLC } from "../core6e/lieuxContexte";
import { cercleLieu, coordonnees, droiteGravite, ecranCoordonnees, extremites, generatrice, mobile, nature, parametre, PHASES, polyLieu } from "../core6e/lieuxContexte";
import type { Pt, SpecFigure } from "./outilsLieuxLotH2";
import { affineTL, COULEURS, coordL, droiteL, equationPolyL, fenetreLieu, figureRepere, intersection, l, listeL, nL, normaliserPoly, pointsArc, ptL, racineL, t } from "./outilsLieuxLotH2";
import { diagnostiquer, messageIllisible, piege } from "../moteur6e/verificationLieuxContexte";
import { correctionDetailleeLC } from "../generateurs6e/lieuxContexte/corrigeDetaille";

/**
 * Couche C — textes de `6gen130` « Lieux en contexte : un point qui bouge » : situation, consignes des
 * quatre écrans, aides à deux niveaux, réponses, figure (situation à une position, lieu complet tracé
 * après l'équation, partie décrite dans le corrigé). Source unique de l'écran, du papier et du corrigé.
 */

type E = ExerciceLC;

export const CONSIGNE_GLOBALE = "Exprime le point mobile à l'aide du paramètre, élimine le paramètre pour obtenir une équation du lieu, puis précise la partie de ce lieu réellement décrite dans la situation.";

const sg = (c: number): string => (c === 0 ? "" : c > 0 ? `+${nL(c)}` : `-${nL(-c)}`);

/** Pente du faisceau de B en fonction de m (radars). */
export function penteBL(e: E): string {
  return e.phi === 90 ? "-\\dfrac{1}{m}" : e.phi === 45 ? "\\dfrac{m+1}{1-m}" : "\\dfrac{m-1}{m+1}";
}

export function situation(e: E): Frag[] {
  switch (e.variante) {
    case "echelle":
      return [
        t("Une échelle "),
        l("[AB]"),
        t(" de longueur "),
        l(`${e.L}\\text{ m}`),
        t(" glisse le long d'un mur : son pied "),
        l("A"),
        t(" reste sur le sol (axe des abscisses), son sommet "),
        l("B"),
        t(" contre le mur (axe des ordonnées), l'unité étant le mètre. Elle passe de la position verticale, contre le mur, à la position horizontale, au sol. On note "),
        l("a"),
        t(" l'abscisse du pied "),
        l("A"),
        t(" et "),
        l("M"),
        t(" le milieu de l'échelle. Détermine le lieu de "),
        l("M"),
        t("."),
      ];
    case "radars":
      return [
        t("Deux radars sont placés sur la côte (axe des abscisses) en "),
        l(ptL("A", { x: -e.d, y: 0 })),
        t(" et "),
        l(ptL("B", { x: e.d, y: 0 })),
        t(" (unité : le kilomètre). Leurs faisceaux balaient la mer, au-dessus de la côte ("),
        l("y>0"),
        t("), en tournant au même rythme : celui de "),
        l("A"),
        t(" a pour pente "),
        l("m"),
        t(", celui de "),
        l("B"),
        t(` fait toujours avec lui un angle de ${e.phi}° (sa pente vaut `),
        l(penteBL(e)),
        t("). Détermine le lieu du point "),
        l("P"),
        t(" où les deux faisceaux se croisent."),
      ];
    case "gravite":
      return [
        t("Un triangle "),
        l("ABC"),
        t(" a deux sommets fixes, "),
        l(ptL("A", e.A)),
        t(" et "),
        l(ptL("B", e.B)),
        t(e.rail ? ". Son sommet " : ". Son sommet "),
        l("C"),
        t(e.rail ? " glisse sur un rail rectiligne : " : " parcourt toute une droite : "),
        l(`C(t)=\\left(${affineTL(e.C0.x, e.u.x)}\\,;${affineTL(e.C0.y, e.u.y)}\\right)`),
        t(", avec "),
        l(e.rail ? "t\\in[0\\,;1]" : "t\\in\\mathbb{R}"),
        t(". Détermine le lieu du centre de gravité "),
        l("G"),
        t(" du triangle "),
        l("ABC"),
        t("."),
      ];
    case "pied":
      return [
        t("Une barre pivote autour du point "),
        l(ptL("O", e.O)),
        t(", de la position horizontale à la position verticale (un quart de tour, dans le sens inverse des aiguilles d'une montre). Dans une position de pente "),
        l("m\\geq 0"),
        t(", elle a pour équation "),
        l(`y${sg(-e.O.y)}=m${e.O.x === 0 ? "x" : `(x${sg(-e.O.x)})`}`),
        t(". On note "),
        l("H"),
        t(" le pied de la perpendiculaire abaissée du point "),
        l(ptL("P", e.P)),
        t(" sur la barre. Détermine le lieu de "),
        l("H"),
        t("."),
      ];
  }
}

export const consigneGenerale = situation;

// ---------------------------------------------------------------------------------------------
// Réponses
// ---------------------------------------------------------------------------------------------

/** Coordonnées attendues (écran 1, échelle et centre de gravité). */
export function coordonneesL(e: E): [string, string] {
  if (e.variante === "echelle") return ["\\dfrac{a}{2}", `\\dfrac{\\sqrt{${e.L * e.L}-a^2}}{2}`];
  const s = { x: e.A.x + e.B.x + e.C0.x, y: e.A.y + e.B.y + e.C0.y };
  const f = (c: number, k: number) => {
    // (c + k t)/3, k multiple de 3.
    const kk = k / 3;
    const terme = kk === 0 ? "" : `${kk < 0 ? "-" : c === 0 ? "" : "+"}${Math.abs(kk) === 1 ? "" : nL(Math.abs(kk))}t`;
    if (c % 3 === 0) return `${c === 0 ? "" : nL(c / 3)}${terme}` || "0";
    return `${nL(c / 3)}${terme}`;
  };
  return [f(s.x, e.u.x), f(s.y, e.u.y)];
}

/** Équation de la seconde génératrice (écran 1, radars et pied), forme du cours. */
export function generatriceL(e: E): string {
  if (e.variante === "pied") return `x${sg(-e.P.x)}+m${e.P.y === 0 ? "y" : `(y${sg(-e.P.y)})`}=0`;
  return `y=${penteBL(e)}(x-${nL(e.d)})`;
}

export function equationLieuL(e: E): string {
  if (e.variante === "gravite") return droiteL(droiteGravite(e));
  if (e.variante === "echelle") return `x^2+y^2=${nL((e.L * e.L) / 4)}`;
  return equationPolyL(normaliserPoly(polyLieu(e)));
}

export function natureLieu(e: E): Frag[] {
  if (e.variante === "gravite") return [t("la droite "), l(equationLieuL(e))];
  const { c, r2 } = cercleLieu(e);
  return [t("le cercle de centre "), l(coordL(c)), t(" et de rayon "), l(racineL(r2))];
}

export const NATURES: Record<NatureLC, string> = {
  quart: "Un quart de cercle, extrémités comprises",
  demi: "Un demi-cercle, extrémités comprises",
  arcOuvert: "Un arc de cercle privé de ses deux extrémités",
  segment: "Un segment, extrémités comprises",
  droitePrivee: "Une droite privée d'un point",
};
export const ORDRE_NATURES: NatureLC[] = ["quart", "demi", "arcOuvert", "segment", "droitePrivee"];

export function reponse(e: E, p: PhaseLC): Frag[] {
  const m = mobile(e);
  if (p === "parametre") {
    if (ecranCoordonnees(e)) {
      const [x, y] = coordonneesL(e);
      return [l(`x_${m}=${x}`), t(" et "), l(`y_${m}=${y}`)];
    }
    return [l(generatriceL(e))];
  }
  if (p === "equation") return [l(equationLieuL(e)), t(" : "), ...natureLieu(e)];
  if (p === "nature") return [t(NATURES[nature(e)])];
  return [t(nature(e) === "droitePrivee" ? "Point exclu : " : "Extrémités : "), l(listeL(extremites(e)))];
}

export function libelle(_e: E, p: PhaseLC): string {
  return { parametre: "Point mobile", equation: "Lieu complet", nature: "Partie décrite", extremites: "Extrémités" }[p];
}

export function consigne(e: E, p: PhaseLC): Frag[] {
  const m = mobile(e);
  if (p === "parametre") {
    if (e.variante === "echelle") return [t("Exprime les coordonnées de "), l("M"), t(" en fonction de "), l("a"), t(".")];
    if (e.variante === "gravite") return [t("Exprime les coordonnées de "), l("G"), t(" en fonction de "), l("t"), t(".")];
    if (e.variante === "radars") return [t("Écris une équation du faisceau du radar "), l("B"), t(" en fonction de "), l("m"), t(".")];
    return [t("Écris une équation de la perpendiculaire à la barre passant par "), l("P"), t(", en fonction de "), l("m"), t(".")];
  }
  if (p === "equation") return [t("Élimine le paramètre "), l(parametre(e)), t(" : donne une équation du lieu complet de "), l(m), t(".")];
  if (p === "nature") return [t("Dans cette situation, quelle partie de ce lieu "), l(m), t(" décrit-il réellement ?")];
  return [t("Donne les coordonnées des extrémités de cette partie (ou du point exclu).")];
}

export function champs(e: E, p: PhaseLC): ChampEcran[] {
  const m = mobile(e);
  if (p === "parametre") {
    if (ecranCoordonnees(e)) return [{ label: `Abscisse de ${m}`, labelLatex: `x_${m}=`, placeholder: `en fonction de ${parametre(e)}` }, { label: `Ordonnée de ${m}`, labelLatex: `y_${m}=`, placeholder: `en fonction de ${parametre(e)}` }];
    return [{ label: "Équation de la génératrice", placeholder: "équation en x, y et m" }];
  }
  if (p === "equation") return [{ label: "Équation du lieu complet", placeholder: "équation en x et y" }];
  return [{ label: "Extrémités ou point exclu", placeholder: "(… ; …) ; (… ; …)" }];
}

// ---------------------------------------------------------------------------------------------
// Aides
// ---------------------------------------------------------------------------------------------

export function aide1(e: E, p: PhaseLC): AideEcran {
  if (p === "parametre") {
    if (e.variante === "echelle") return { texte: [t("Le triangle formé par le mur, le sol et l'échelle est rectangle : Pythagore donne la hauteur du sommet, puis le milieu se calcule :")], latex: "OA^2+OB^2=AB^2,\\quad M=\\dfrac{A+B}{2}" };
    if (e.variante === "gravite") return { texte: [t("Le centre de gravité est la moyenne des trois sommets :")], latex: "G=\\dfrac{A+B+C}{3}" };
    if (e.variante === "radars") return { texte: [t("Une droite de pente donnée passant par un point connu :")], latex: "y-y_B=\\text{pente}\\cdot(x-x_B)" };
    return { texte: [t("La barre a pour vecteur directeur "), l("(1\\,;m)"), t(" : c'est un vecteur normal de la perpendiculaire.")] };
  }
  if (p === "equation") {
    if (ecranCoordonnees(e)) return { texte: [t("Exprime le paramètre à partir d'une coordonnée, ou cherche une relation entre "), l("x"), t(" et "), l("y"), t(" qui ne le contienne plus.")] };
    return { texte: [t("Méthode des génératrices (cours, point 5) : tire "), l("m"), t(" de la première génératrice et remplace-le dans la seconde.")] };
  }
  if (p === "nature") return { texte: [t("Le contexte limite les positions possibles : longueurs positives, demi-plan balayé, quart de tour, triangle qui doit exister…")] };
  return { texte: [t("Cherche les positions extrêmes de la situation (ou celle qui est interdite).")] };
}

export function aide2(e: E, p: PhaseLC): AideEcran | null {
  if (p === "parametre") {
    if (e.variante === "echelle") return { texte: [t("Avec "), l("A(a\\,;0)"), t(", le sommet est "), l(`B\\left(0\\,;\\sqrt{${e.L * e.L}-a^2}\\right)`), t(".")] };
    if (e.variante === "gravite") return { texte: [t("Additionne les abscisses de "), l("A"), t(", "), l("B"), t(" et "), l("C(t)"), t(", puis divise par 3 ; de même pour les ordonnées.")] };
    if (e.variante === "radars") return { texte: [t("Pente "), l(penteBL(e)), t(", point "), l(ptL("B", { x: e.d, y: 0 })), t(".")] };
    return { texte: [t("Passe par "), l(ptL("P", e.P)), t(" avec le vecteur normal "), l("(1\\,;m)"), t(" :")], latex: "1\\cdot(x-x_P)+m\\,(y-y_P)=0" };
  }
  if (p === "equation") {
    if (e.variante === "echelle") return { texte: [t("Calcule "), l("x^2+y^2"), t(" : "), l("a"), t(" disparaît.")] };
    if (e.variante === "gravite") return { texte: [t("Tire "), l("t"), t(" de l'abscisse (ou de l'ordonnée) et remplace-le dans l'autre coordonnée.")] };
    if (e.variante === "radars") return { texte: [t("Du faisceau de "), l("A"), t(" : "), l(`m=\\dfrac{y}{x+${e.d}}`), t(" ; remplace, puis multiplie par "), l(`x+${e.d}`), t(".")] };
    return { texte: [t("De la barre : "), l(`m=\\dfrac{y${sg(-e.O.y)}}{x${sg(-e.O.x)}}`), t(" ; remplace, puis multiplie par "), l(`x${sg(-e.O.x)}`), t(".")] };
  }
  if (p === "nature") {
    if (e.variante === "echelle") return { texte: [t("Quelles valeurs prennent "), l("x_M=\\tfrac a2"), t(" et "), l("y_M"), t(" quand "), l("a"), t(" va de "), l("0"), t(" à "), l(nL(e.L)), t(" ?")] };
    if (e.variante === "radars") return { texte: [t("Les faisceaux restent au-dessus de la côte ; que se passe-t-il quand un faisceau longe la côte ?")] };
    if (e.variante === "gravite") return { texte: e.rail ? [t("Pour quelles valeurs de "), l("t"), t(" le point "), l("C"), t(" est-il sur le rail ?")] : [t("Pour quelle position de "), l("C"), t(" le triangle "), l("ABC"), t(" n'existe-t-il pas ?")] };
    return { texte: [t("Un angle inscrit vaut la moitié de l'angle au centre : quand la barre tourne d'un quart de tour, de quel angle tourne H autour du centre du cercle ?")] };
  }
  if (e.variante === "radars") return { texte: [t("Ce sont les points du cercle situés sur la côte.")] };
  if (e.variante === "pied") return { texte: [t("Prends la barre horizontale ("), l("m=0"), t("), puis verticale.")] };
  if (e.variante === "echelle") return { texte: [t("Prends "), l("a=0"), t(" puis "), l(`a=${nL(e.L)}`), t(".")] };
  return { texte: e.rail ? [t("Prends "), l("t=0"), t(" puis "), l("t=1"), t(".")] : [t("Cherche le point "), l("K"), t(" où la droite de "), l("C"), t(" coupe "), l("(AB)"), t(".")] };
}

export function optionsNature(): OptionEcran[] {
  return ORDRE_NATURES.map((n) => ({ id: n, fragments: [t(NATURES[n])] }));
}

export function explicationChoix(e: E, p: PhaseLC): string {
  return p === "nature" ? `${NATURES[nature(e)]} : la situation limite les positions possibles.` : "";
}

// ---------------------------------------------------------------------------------------------
// Figure
// ---------------------------------------------------------------------------------------------

function pointCroisement(e: E, m: number): Pt {
  return intersection({ a: m, b: -1, c: m * e.d }, generatrice(e, m))!;
}

/** Points de la partie décrite (figure du corrigé). */
function partieDecrite(e: E): Pt[] {
  const { c, r2 } = e.variante === "gravite" ? { c: { x: 0, y: 0 }, r2: 0 } : cercleLieu(e);
  const r = Math.sqrt(r2);
  switch (e.variante) {
    case "echelle":
      return pointsArc(c, r, 0, Math.PI / 2);
    case "radars": {
      const a0 = Math.atan2(-c.y, e.d);
      return pointsArc(c, r, a0, Math.PI - a0);
    }
    case "pied": {
      const H0 = { x: e.P.x, y: e.O.y };
      const a0 = Math.atan2(H0.y - c.y, H0.x - c.x);
      return pointsArc(c, r, a0, a0 + Math.PI);
    }
    case "gravite":
      return e.rail ? [coordonnees(e, 0), coordonnees(e, 1)] : [coordonnees(e, -12), coordonnees(e, 12)];
  }
}

/** Figure : situation (une position), `avecLieu` : lieu complet en gris ; `final` : partie décrite. */
export function figureLC(e: E, avecLieu: boolean, final: boolean): string {
  const cadre: Pt[] = [];
  const spec: SpecFigure = { fenetre: { xMin: 0, xMax: 1, yMin: 0, yMax: 1 }, segments: [], points: [], courbes: [], droites: [] };
  const lieuComplet: Pt[] = e.variante === "gravite" ? [] : pointsArc(cercleLieu(e).c, Math.sqrt(cercleLieu(e).r2));
  switch (e.variante) {
    case "echelle": {
      const a = 0.6 * e.L;
      const A = { x: a, y: 0 };
      const B = { x: 0, y: Math.sqrt(e.L * e.L - a * a) };
      cadre.push({ x: -1, y: -1 }, { x: e.L, y: e.L });
      spec.segments!.push({ A, B, couleur: COULEURS.noir, epaisseur: 2.4 });
      spec.points!.push({ P: A, label: "A", position: "s" }, { P: B, label: "B", position: "e" }, { P: coordonnees(e, a), label: "M", position: "ne", couleur: COULEURS.accent });
      break;
    }
    case "radars": {
      const A = { x: -e.d, y: 0 };
      const B = { x: e.d, y: 0 };
      const m = e.phi === 135 ? 0.35 : 0.8;
      const P = pointCroisement(e, m);
      const { c, r2 } = cercleLieu(e);
      const r = Math.sqrt(r2);
      cadre.push({ x: c.x - r, y: Math.max(c.y - r, -2) }, { x: c.x + r, y: c.y + r });
      spec.segments!.push({ A, B: P, couleur: COULEURS.accent }, { A: B, B: P, couleur: COULEURS.vert });
      spec.points!.push({ P: A, label: "A", position: "so" }, { P: B, label: "B", position: "se" }, { P, label: "P", position: "n" });
      break;
    }
    case "gravite": {
      const tEx = e.rail ? 0.5 : 0.4;
      const C = { x: e.C0.x + tEx * e.u.x, y: e.C0.y + tEx * e.u.y };
      const C1 = e.C0;
      const C2 = { x: e.C0.x + e.u.x, y: e.C0.y + e.u.y };
      cadre.push(e.A, e.B, C1, C2);
      if (e.rail) spec.segments!.push({ A: C1, B: C2, couleur: COULEURS.gris, epaisseur: 4 });
      else spec.droites!.push({ d: { a: e.u.y, b: -e.u.x, c: -e.u.y * e.C0.x + e.u.x * e.C0.y }, couleur: COULEURS.gris, label: "d" });
      spec.segments!.push({ A: e.A, B: e.B, couleur: COULEURS.noir }, { A: e.B, B: C, couleur: COULEURS.noir }, { A: C, B: e.A, couleur: COULEURS.noir });
      spec.points!.push({ P: e.A, label: "A", position: "so" }, { P: e.B, label: "B", position: "se" }, { P: C, label: "C", position: "ne" }, { P: coordonnees(e, tEx), label: "G", position: "ne", couleur: COULEURS.accent });
      break;
    }
    case "pied": {
      const m = 0.5;
      const bar = { a: m, b: -1, c: e.O.y - m * e.O.x };
      const H = intersection(bar, generatrice(e, m))!;
      cadre.push({ x: e.O.x - 1, y: e.O.y - 1 }, { x: e.P.x + 1, y: e.P.y + 1 });
      spec.droites!.push({ d: bar, couleur: COULEURS.noir, label: "barre" });
      spec.segments!.push({ A: e.P, B: H, couleur: COULEURS.gris, pointille: true });
      spec.points!.push({ P: e.O, label: "O", position: "so" }, { P: e.P, label: "P", position: "ne" }, { P: H, label: "H", position: "se", couleur: COULEURS.accent });
      break;
    }
  }
  const fen = fenetreLieu(cadre, 1, 8);
  spec.fenetre = fen;
  spec.unite = Math.max(12, Math.min(28, Math.floor(300 / Math.max(fen.xMax - fen.xMin, fen.yMax - fen.yMin))));
  spec.graduationsLisibles = true;
  if (avecLieu) {
    if (e.variante === "gravite") spec.droites!.unshift({ d: droiteGravite(e), couleur: final ? "#9aa1ab" : COULEURS.bleu });
    else spec.courbes!.unshift({ points: lieuComplet, couleur: final ? "#9aa1ab" : COULEURS.bleu });
  }
  if (final) {
    if (e.variante === "gravite") spec.segments!.unshift({ A: partieDecrite(e)[0]!, B: partieDecrite(e)[1]!, couleur: COULEURS.accent, epaisseur: 2.6 });
    else spec.courbes!.push({ points: partieDecrite(e), couleur: COULEURS.accent });
    const creux = nature(e) === "arcOuvert" || nature(e) === "droitePrivee";
    for (const p of extremites(e)) spec.points!.push({ P: p, couleur: COULEURS.accent, creux });
  }
  return figureRepere(spec);
}

export function figure(e: E, p: PhaseLC): string {
  return figureLC(e, p === "nature" || p === "extremites", false);
}

// ---------------------------------------------------------------------------------------------
// Définition
// ---------------------------------------------------------------------------------------------

export const recap = reponse;

/** `6gen130` : point mobile (deux champs, ou une équation en m), lieu complet (champ), nature (choix
 * jugé), extrémités ou point exclu (champ). */
export const DEFINITION_LC: DefinitionEcrans<E, PhaseLC> = {
  phases: () => PHASES,
  estChoix: (_e, p) => p === "nature",
  mode: (e, p) => (p === "nature" ? { type: "choix", options: optionsNature() } : { type: "champs", champs: champs(e, p) }),
  libelle,
  consigneGenerale,
  figure,
  consigne,
  aide1,
  aide2,
  diagnostiquer,
  piege,
  piegeChoixRevele: true,
  bonneOption: (e) => nature(e),
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  explicationChoix,
  correction: correctionDetailleeLC,
  apercuEnonce: (e) => [t({ echelle: "Échelle qui glisse : lieu du milieu M", radars: "Deux radars : lieu du croisement P", gravite: "Triangle ABC : lieu du centre de gravité G", pied: "Barre qui pivote : lieu du pied H" }[e.variante])],
};
