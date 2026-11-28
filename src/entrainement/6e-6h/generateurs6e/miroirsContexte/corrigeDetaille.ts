import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import type { ExerciceMC } from "../../core6e/miroirsContexte";
import { bord, conique, distance, foyerFtfp, grandeur, nature, pointT } from "../../core6e/miroirsContexte";
import { coordL, milliersL, nL, nPL, sgL, pL } from "../../ui6e/outilsConiquesLotH2";
import { equationL, figureMC, NATURES, reflechiL, tangenteL } from "../../ui6e/formatMiroirsContexte";

/**
 * Corrigé détaillé « comme au tableau » de `6gen140`, une lettre par écran. Situations : a) propriété
 * optique qui impose la conique ; b) équation (paramètre tiré des données) ; c) et d) les deux grandeurs,
 * par la position du foyer ou la DÉFINITION de la conique (distance à la directrice, somme ou différence
 * 2a), avec le schéma complet. Réflecteur (`ftfp`) : tangente dédoublée, T, FT = FP (triangle isocèle,
 * angles égaux), rayon réfléchi (PF), figure.
 */

type E = ExerciceMC;
const ft = texte;
const L = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });
const cm = (v: number) => `${nL(v)}\\text{ cm}`;

function lignesEquation(e: E): LigneCalcul[] {
  const c = conique(e);
  if (e.variante === "antenne") {
    const p = (e.D * e.D) / (8 * e.h);
    return [ligne("y^2=2px", "sommet O, axe Ox"), ligne(`\\left(${nL(e.D / 2)}\\right)^2=2p\\cdot ${nL(e.h)}`, [ft("le bord "), L(`(${nL(e.h)}\\,;${nL(e.D / 2)})`), ft(" est sur la parabole")]), ligne(`p=\\dfrac{${nL((e.D * e.D) / 4)}}{${nL(2 * e.h)}}=${nL(p)}`), ligne(equationL(e))];
  }
  if (e.variante === "phare") return [ligne("y^2=2px", "sommet O, axe Ox"), ligne(`\\dfrac p2=${nL(e.f)}\\iff p=${nL(2 * e.f)}`, "la lampe est au foyer"), ligne(equationL(e))];
  if (e.variante === "lithotriteur") {
    return [
      ligne(`2c=${nL(2 * e.c)}\\iff c=${nL(e.c)}`, "les foyers : générateur et calcul"),
      ligne(`a-c=${nL(e.a - e.c)}\\iff a=${nL(e.a)}`, [ft("le fond est le sommet "), L("(-a\\,;0)")]),
      ligne(`b^2=a^2-c^2=${nL(e.a * e.a)}-${nL(e.c * e.c)}=${nL(e.b * e.b)}`),
      ligne(equationL(e)),
    ];
  }
  if (c.type !== "hyperbole") return [];
  return [
    ligne(`2c=${nL(2 * e.c)}\\iff c=${nL(e.c)}`, [ft("les foyers "), L("F"), ft(" et "), L("F'")]),
    ligne(`c-a=${nL(e.c - e.a)}\\iff a=${nL(e.a)}`, [L("S(a\\,;0)"), ft(" est à "), L("c-a"), ft(" de "), L("F(c\\,;0)")]),
    ligne(`b^2=c^2-a^2=${nL(e.c * e.c)}-${nL(e.a * e.a)}=${nL(e.b * e.b)}`),
    ligne(equationL(e)),
  ];
}

function lignesGrandeur(e: E): LigneCalcul[] {
  const c = conique(e);
  if (e.variante === "antenne" && c.type === "parabole") return [ligne(`OF=\\dfrac p2=\\dfrac{${nL(c.p)}}{2}=${cm(grandeur(e))}`, "le récepteur est au foyer")];
  if (e.variante === "phare") return [ligne(`\\left(${nL(e.D / 2)}\\right)^2=${nL(4 * e.f)}\\,x`, [ft("le bord a pour ordonnée le rayon "), L(nL(e.D / 2))]), ligne(`x=\\dfrac{${nL((e.D * e.D) / 4)}}{${nL(4 * e.f)}}=${nL(grandeur(e))}`), ligne(`h=${cm(grandeur(e))}`, "profondeur = abscisse du bord")];
  if (e.variante === "lithotriteur") return [ligne(`\\dfrac{0^2}{${nL(e.a * e.a)}}+\\dfrac{y^2}{${nL(e.b * e.b)}}=1\\iff y^2=${nL(e.b * e.b)}`, [ft("plan "), L("x=0")]), ligne(`y=\\pm${nL(e.b)}`), ligne(`r=${cm(e.b)}`)];
  return [ligne(`S(${nL(e.a)}\\,;0)\\quad F'(${nL(-e.c)}\\,;0)`), ligne(`SF'=${nL(e.a)}-${nPL(-e.c)}=${cm(e.a + e.c)}`)];
}

function lignesDistance(e: E): LigneCalcul[] {
  const c = conique(e);
  if (c.type === "parabole") {
    const B = bord(e);
    const F = { x: c.p / 2, y: 0 };
    return [
      ligne(`FP=\\text{dist}(P\\,;d)=x_P+\\dfrac p2`, [ft("définition, "), L(`d\\equiv x=${nL(-c.p / 2)}`)]),
      ligne(`FP=${nL(B.x)}+${nL(c.p / 2)}=${cm(distance(e))}`, [L(`P${coordL(B)}`)]),
      ligne(`FP=\\sqrt{${pL(B.x - F.x)}^2+${pL(B.y)}^2}=\\sqrt{${milliersL((B.x - F.x) ** 2 + B.y * B.y)}}=${nL(distance(e))}`, "contrôle par la distance"),
    ];
  }
  if (e.variante === "lithotriteur") return [ligne(`PF'+PF=2a`, [ft("pour tout point "), L("P"), ft(" de l'ellipse")]), ligne(`2a=2\\cdot ${nL(e.a)}=${cm(2 * e.a)}`)];
  return [ligne(`PF'-PF=2a`, [L("P"), ft(" sur la branche proche de "), L("F")]), ligne(`2a=2\\cdot ${nL(e.a)}=${cm(2 * e.a)}`)];
}

function correctionContexte(e: E): EtapeCorrection[] {
  const n = nature(e);
  const raison: FragmentConsigne[] =
    n === "parabole"
      ? [ft("Des rayons parallèles à l'axe se concentrent en un point (ou l'inverse) : seule la parabole renvoie vers son foyer tous les rayons parallèles à son axe. "), ft(e.variante === "antenne" ? "Le récepteur est au foyer." : "La lampe est au foyer.")]
      : n === "ellipse"
        ? [ft("Les ondes partent d'un point et doivent passer par un autre : l'ellipse renvoie vers un foyer tout ce qui part de l'autre. Le générateur et le calcul sont aux foyers.")]
        : [ft("Des rayons qui se dirigeaient vers F repartent vers F′ : l'hyperbole renvoie un rayon dirigé vers un foyer comme s'il venait de l'autre. F et F′ sont ses foyers.")];
  const piegeD: FragmentConsigne[] =
    e.variante === "antenne"
      ? [ft("Prendre "), L("p"), ft(" pour la distance du fond au récepteur : le foyer est à "), L("\\dfrac p2"), ft(" du sommet.")]
      : e.variante === "phare"
        ? [ft("Utiliser le diamètre comme ordonnée du bord : c'est le rayon, la moitié du diamètre.")]
        : e.variante === "lithotriteur"
          ? [ft("Prendre la distance entre les foyers "), L("2c"), ft(" pour la longueur du trajet : par la paroi, il mesure "), L("2a"), ft(", le même pour toutes les ondes, qui arrivent donc en même temps.")]
          : [ft("Prendre "), L("a"), ft(" égal à la moitié de "), L("FF'"), ft(" : c'est "), L("c"), ft(" ; "), L("a"), ft(" est la distance du centre au sommet "), L("S"), ft(".")];
  return [
    utilise("a", [ft("Propriétés optiques des coniques (cours, point 6).")]),
    calcul("a", [], raison, "Raisonnement"),
    resultat("a", [ft(NATURES[n]), ft(".")]),
    utilise("b", [ft(n === "parabole" ? "Équation réduite d'une parabole de sommet O et d'axe Ox, foyer en " : n === "ellipse" ? "Équation réduite de l'ellipse, " : "Équation réduite de l'hyperbole, "), L(n === "parabole" ? "\\left(\\dfrac p2\\,;0\\right)" : n === "ellipse" ? "b^2=a^2-c^2" : "b^2=c^2-a^2"), ft(" (cours, point 1).")]),
    calcul("b", lignesEquation(e)),
    resultat("b", [L(equationL(e)), ft(".")]),
    utilise("c", [ft(e.variante === "antenne" ? "Le récepteur est au foyer, à " : e.variante === "phare" ? "Le bord du réflecteur est un point de la parabole ; sa distance à l'axe est le rayon de l'ouverture." : e.variante === "lithotriteur" ? "Points de l'ellipse situés dans le plan de coupe." : "Position des points sur l'axe."), ...(e.variante === "antenne" ? [L("\\dfrac p2"), ft(" du sommet.")] : [])]),
    calcul("c", lignesGrandeur(e)),
    resultat("c", [L(cm(grandeur(e))), ft(".")]),
    utilise("d", n === "parabole" ? [ft("Définition de la parabole : distance au foyer = distance à la directrice (cours, point 1).")] : n === "ellipse" ? [ft("Définition de l'ellipse : "), L("PF+PF'=2a"), ft(" (cours, point 1).")] : [ft("Définition de l'hyperbole : "), L("|PF'-PF|=2a"), ft(" (cours, point 1).")]),
    calcul("d", lignesDistance(e)),
    { ...resultat("d", [L(e.variante === "cassegrain" ? `PF'-PF=${cm(distance(e))}` : cm(distance(e))), ft(".")]), figureHtml: figureMC(e, true) },
    piege("d", piegeD),
  ];
}

function correctionFtfp(e: E): EtapeCorrection[] {
  const F = foyerFtfp(e);
  const T = pointT(e);
  const P = e.P;
  const d = grandeur(e);
  return [
    utilise("a", [ft("Forme dédoublée de la tangente à "), L("y^2=2px"), ft(" : "), L("y\\,y_P=p\\,(x+x_P)"), ft(" (cours, point 5).")]),
    calcul("a", [ligne(`y\\cdot ${nPL(P.y)}=${nL(e.p)}\\,(x${sgL(P.x)})`, [L(`p=${nL(e.p)}`), ft(", "), L(`P${coordL(P)}`)]), ligne(tangenteL(e), "forme implicite")]),
    resultat("a", [L(tangenteL(e)), ft(".")]),
    utilise("b", [L("T"), ft(" est sur l'axe des abscisses : "), L("y=0"), ft(".")]),
    calcul("b", [ligne(`0=${nL(e.p)}\\,(x${sgL(P.x)})\\iff x=${nL(-P.x)}`)]),
    resultat("b", [L(`T${coordL(T)}`), ft(".")]),
    utilise("c", [ft("Foyer "), L(`F${coordL(F)}`), ft(" ; définition de la parabole pour "), L("FP"), ft(" (distance à la directrice "), L(`x=${nL(-e.p / 2)}`), ft(").")]),
    calcul("c", [ligne(`FT=${nL(F.x)}-${nPL(T.x)}=${nL(d)}`), ligne(`FP=x_P+\\dfrac p2=${nL(P.x)}+${nL(e.p / 2)}=${nL(d)}`), ligne(`FP=\\sqrt{${pL(P.x - F.x)}^2+${pL(P.y)}^2}=\\sqrt{${milliersL((P.x - F.x) ** 2 + P.y * P.y)}}=${nL(d)}`, "contrôle")]),
    resultat("c", [L(`FT=FP=${nL(d)}\\text{ cm}`), ft(" : le triangle "), L("FPT"), ft(" est isocèle en "), L("F"), ft(".")]),
    utilise("d", [ft("Loi de la réflexion : angles égaux avec la tangente (cours, point 6). Les angles à la base du triangle isocèle "), L("FPT"), ft(" sont égaux, et le rayon incident, parallèle à l'axe, fait avec la tangente le même angle que l'axe (angles correspondants).")]),
    calcul("d", [ligne(`\\widehat{PTF}=\\widehat{TPF}`, "triangle isocèle en F"), ligne(`\\text{rayon réfléchi}=(PF)`, "angle égal de l'autre côté de la tangente"), ligne(reflechiL(e), [ft("droite par "), L("P"), ft(" et "), L("F")])]),
    { ...resultat("d", [ft("Le rayon réfléchi passe par le foyer : "), L(reflechiL(e)), ft(".")]), figureHtml: figureMC(e, true) },
    piege("d", [ft("Placer "), L("T"), ft(" en "), L(`(${nL(P.x)}\\,;0)`), ft(" : la tangente coupe l'axe de l'autre côté du sommet, en "), L("-x_P"), ft(".")]),
  ];
}

export function correctionDetailleeMC(e: E): EtapeCorrection[] {
  return e.variante === "ftfp" ? correctionFtfp(e) : correctionContexte(e);
}

