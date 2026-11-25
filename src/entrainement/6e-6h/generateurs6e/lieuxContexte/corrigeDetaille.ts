import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import type { ExerciceLC } from "../../core6e/lieuxContexte";
import { coordonnees, extremites, nature, polyLieu } from "../../core6e/lieuxContexte";
import { affineTL, coordL, listeL, nL, normaliserPoly, polyL } from "../../ui6e/outilsLieuxLotH2";
import { coordonneesL, equationLieuL, figureLC, generatriceL, NATURES, natureLieu, penteBL } from "../../ui6e/formatLieuxContexte";

/**
 * Corrigé détaillé « comme au tableau » de `6gen130`, une lettre par écran : a) le point mobile en
 * fonction du paramètre (ou la seconde génératrice) ; b) l'élimination, une transformation par ligne ;
 * c) la partie décrite, imposée par le contexte ; d) ses extrémités (ou le point exclu), avec la figure
 * (lieu complet en gris, partie décrite en couleur, points exclus en creux).
 */

type E = ExerciceLC;
const ft = texte;
const L = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });
const fr = (x: unknown) => x as FragmentConsigne[];
const sg = (c: number): string => (c === 0 ? "" : c > 0 ? `+${nL(c)}` : `-${nL(-c)}`);
const par = (v: string, c: number) => (c === 0 ? v : `(${v}${sg(-c)})`);

function blocA(e: E): { u: FragmentConsigne[]; lignes: LigneCalcul[] } {
  switch (e.variante) {
    case "echelle": {
      const L2 = e.L * e.L;
      const [x, y] = coordonneesL(e);
      return {
        u: [ft("Pythagore dans le triangle "), L("OAB"), ft(", rectangle en "), L("O"), ft(" ; coordonnées du milieu (cours, § 1).")],
        lignes: [ligne(`OB^2=AB^2-OA^2=${L2}-a^2`, [L("A(a\\,;0)"), ft(", "), L(`AB=${e.L}`)]), ligne(`B\\left(0\\,;\\sqrt{${L2}-a^2}\\right)`, "B sur le mur"), ligne(`x_M=\\dfrac{a+0}{2}=${x}`, "milieu de [AB]"), ligne(`y_M=\\dfrac{0+\\sqrt{${L2}-a^2}}{2}=${y}`)],
      };
    }
    case "gravite": {
      const [x, y] = coordonneesL(e);
      const cx = affineTL(e.C0.x, e.u.x);
      const cy = affineTL(e.C0.y, e.u.y);
      return {
        u: [ft("Le centre de gravité est la moyenne des trois sommets : "), L("G=\\dfrac{A+B+C}{3}"), ft(" (cours, § 1).")],
        lignes: [ligne(`x_G=\\dfrac{${nL(e.A.x)}${e.B.x < 0 ? "" : "+"}${nL(e.B.x)}+(${cx})}{3}=${x}`), ligne(`y_G=\\dfrac{${nL(e.A.y)}${e.B.y < 0 ? "" : "+"}${nL(e.B.y)}+(${cy})}{3}=${y}`)],
      };
    }
    case "radars":
      return {
        u: [ft("Droite de pente donnée passant par un point : "), L("y-y_B=\\text{pente}\\cdot(x-x_B)"), ft(".")],
        lignes: [ligne(generatriceL(e), [ft("pente "), L(penteBL(e)), ft(", point "), L(`B(${nL(e.d)}\\,;0)`)])],
      };
    case "pied":
      return {
        u: [ft("La barre a pour vecteur directeur "), L("(1\\,;m)"), ft(" : c'est un vecteur normal de la perpendiculaire passant par "), L("P"), ft(" (cours, § 1).")],
        lignes: [ligne(`1\\cdot ${par("x", e.P.x)}+m\\cdot ${par("y", e.P.y)}=0`, "vecteur normal (1 ; m)"), ligne(generatriceL(e))],
      };
  }
}

function blocB(e: E): LigneCalcul[] {
  switch (e.variante) {
    case "echelle": {
      const L2 = e.L * e.L;
      return [ligne("x^2=\\dfrac{a^2}{4}"), ligne(`y^2=\\dfrac{${L2}-a^2}{4}`), ligne(`x^2+y^2=\\dfrac{a^2+${L2}-a^2}{4}`, "on additionne"), ligne(`=${nL(L2 / 4)}`, "a disparaît")];
    }
    case "gravite": {
      const v = { x: e.u.x / 3, y: e.u.y / 3 };
      const c = coordonnees(e, 0);
      const coef = (k: number) => (k === 1 ? "" : k === -1 ? "-" : nL(k));
      const elimination =
        v.x === 0 ? ligne(`x${sg(-c.x)}=0`, [L("x"), ft(" ne dépend pas de "), L("t")]) : v.y === 0 ? ligne(`y${sg(-c.y)}=0`, [L("y"), ft(" ne dépend pas de "), L("t")]) : ligne(`${coef(v.y)}${coef(v.y) ? par("x", c.x) : `x${sg(-c.x)}`}=${coef(v.x)}${coef(v.x) ? par("y", c.y) : `y${sg(-c.y)}`}`, [ft("on élimine "), L("t")]);
      const fin = v.x === 0 || v.y === 0 ? [] : [ligne(equationLieuL(e), "on regroupe")];
      return [ligne(`x=${affineTL(c.x, v.x)}\\quad\\text{et}\\quad y=${affineTL(c.y, v.y)}`, "coordonnées de G"), elimination, ...fin];
    }
    case "radars": {
      const d = nL(e.d);
      const lignes = [ligne(`m=\\dfrac{y}{x+${d}}`, [ft("faisceau de A : "), L(`y=m(x+${d})`)])];
      if (e.phi === 90)
        return [...lignes, ligne(`x+my-${d}=0`, [ft("faisceau de B, multiplié par "), L("-m")]), ligne(`x+\\dfrac{y}{x+${d}}\\cdot y-${d}=0`, [ft("on remplace dans "), L(`x+my-${d}=0`)]), ligne(`(x-${d})(x+${d})+y^2=0`, [ft("on multiplie par "), L(`x+${d}`)]), ligne(equationLieuL(e), "on développe")];
      const dd = e.d * e.d;
      if (e.phi === 45)
        return [
          ...lignes,
          ligne(`(1-m)\\,y=(m+1)(x-${d})`, "faisceau de B"),
          ligne(`y(x+${d})-y^2=(y+x+${d})(x-${d})`, [ft("on remplace "), L("m"), ft(" et on multiplie par "), L(`x+${d}`)]),
          ligne(`xy+${d}y-y^2=xy-${d}y+x^2-${dd}`, "on développe"),
          ligne(equationLieuL(e), "on regroupe"),
        ];
      return [
        ...lignes,
        ligne(`(m+1)\\,y=(m-1)(x-${d})`, "faisceau de B"),
        ligne(`y^2+y(x+${d})=(y-x-${d})(x-${d})`, [ft("on remplace "), L("m"), ft(" et on multiplie par "), L(`x+${d}`)]),
        ligne(`y^2+xy+${d}y=xy-${d}y-x^2+${dd}`, "on développe"),
        ligne(equationLieuL(e), "on regroupe"),
      ];
    }
    case "pied": {
      const P = normaliserPoly(polyLieu(e));
      return [
        ligne(`m=\\dfrac{${polyL({ y: 1, "1": -e.O.y })}}{${polyL({ x: 1, "1": -e.O.x })}}`, "de l'équation de la barre"),
        ligne(`${par("x", e.P.x)}+\\dfrac{${par("y", e.O.y)}${par("y", e.P.y)}}{${polyL({ x: 1, "1": -e.O.x })}}=0`.replace(/^\((x)\)/, "$1"), "on remplace m"),
        ligne(`${par("x", e.P.x)}${par("x", e.O.x)}+${par("y", e.O.y)}${par("y", e.P.y)}=0`, [ft("on multiplie par "), L(polyL({ x: 1, "1": -e.O.x }))]),
        ligne(`${polyL(P)}=0`, "on développe"),
      ];
    }
  }
}

function blocC(e: E): FragmentConsigne[] {
  switch (e.variante) {
    case "echelle":
      return [L("a"), ft(" va de "), L("0"), ft(" à "), L(nL(e.L)), ft(" : "), L("x_M=\\tfrac a2"), ft(" va de "), L("0"), ft(" à "), L(nL(e.L / 2)), ft(" et "), L("y_M\\geq 0"), ft(". Seul le quart de cercle du premier quadrant est décrit ; l'échelle verticale ("), L("a=0"), ft(") et au sol ("), L(`a=${nL(e.L)}`), ft(") donnent ses extrémités.")];
    case "radars":
      return [ft("Les faisceaux restent au-dessus de la côte : "), L("y>0"), ft(", seuls les points du cercle situés au-dessus de "), L("(AB)"), ft(". En "), L("A"), ft(" et en "), L("B"), ft(", un faisceau longerait la côte : ces deux points sont exclus. Tout point de l'arc voit "), L("[AB]"), ft(` sous un angle de ${e.phi}° (arc capable) : il est atteint.`)];
    case "gravite":
      if (e.rail) return [L("t"), ft(" ne prend que les valeurs de "), L("0"), ft(" à "), L("1"), ft(" : "), L("G"), ft(" décrit le segment joignant "), L("G(0)"), ft(" à "), L("G(1)"), ft(".")];
      return [L("t"), ft(" parcourt "), L("\\mathbb{R}"), ft(", mais pour "), L("t=-1"), ft(", "), L("C"), ft(" est sur "), L("(AB)"), ft(" : le triangle est aplati. Le point "), L("G(-1)"), ft(" est exclu de la droite.")];
    case "pied":
      return [ft("Pour toute position, l'angle "), L("\\widehat{OHP}"), ft(" est droit : "), L("H"), ft(" est sur le cercle de diamètre "), L("[OP]"), ft(". La barre tourne de 90° ; l'angle au centre étant le double de l'angle inscrit, "), L("H"), ft(" tourne de 180° autour du centre : un demi-cercle, de la barre horizontale à la barre verticale, en passant par "), L("P"), ft(".")];
  }
}

export function correctionDetailleeLC(e: E): EtapeCorrection[] {
  const a = blocA(e);
  const ext = extremites(e);
  const exclu = nature(e) === "droitePrivee";
  return [
    utilise("a", a.u),
    calcul("a", a.lignes),
    resultat("a", e.variante === "echelle" || e.variante === "gravite" ? [L(`x_{${e.variante === "echelle" ? "M" : "G"}}=${coordonneesL(e)[0]}`), ft(" et "), L(`y_{${e.variante === "echelle" ? "M" : "G"}}=${coordonneesL(e)[1]}`), ft(".")] : [L(generatriceL(e)), ft(".")]),
    utilise("b", e.variante === "radars" || e.variante === "pied" ? [ft("Méthode des génératrices (cours, § 5) : on tire "), L("m"), ft(" de la première et on le remplace dans la seconde.")] : [ft("On élimine le paramètre entre les deux coordonnées (cours, § 5 et § 6).")]),
    calcul("b", blocB(e)),
    resultat("b", [L(equationLieuL(e)), ft(" : "), ...fr(natureLieu(e)), ft(".")]),
    utilise("c", [ft("Le contexte impose la restriction : on cherche les positions réellement possibles (cours, § 5).")]),
    calcul("c", [], blocC(e), "Raisonnement"),
    resultat("c", [ft(NATURES[nature(e)]), ft(".")]),
    { ...resultat("d", [ft(exclu ? "Point exclu : " : ext.length === 2 && nature(e) === "arcOuvert" ? "Extrémités (exclues) : " : "Extrémités : "), L(listeL(ext)), ft(".")]), figureHtml: figureLC(e, true, true) },
    piege("d", [ft(e.variante === "radars" ? "Garder tout le cercle : la partie sous la côte n'est pas balayée, et A, B ne sont jamais atteints." : e.variante === "pied" ? "Croire qu'un quart de tour de la barre donne un quart de cercle : l'angle au centre est double." : e.variante === "gravite" ? (e.rail ? "Donner toute la droite : C ne quitte pas le rail." : "Oublier que C ne peut pas être sur (AB) : le triangle n'existerait plus.") : "Donner tout le cercle : les longueurs restent positives.")]),
  ];
}

export { coordL };
