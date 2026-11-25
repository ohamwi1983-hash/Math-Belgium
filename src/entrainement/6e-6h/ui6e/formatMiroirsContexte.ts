import type { AideEcran, ChampEcran, DefinitionEcrans, Frag, OptionEcran } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { ExerciceMC, NatureMC, PhaseMC } from "../core6e/miroirsContexte";
import { bord, conique, distance, foyerFtfp, grandeur, nature, phases, pointT, reflechi, tangenteFtfp } from "../core6e/miroirsContexte";
import type { Pt } from "./outilsConiquesLotH2";
import { branchesConique, COULEURS, coordL, equationConiqueL, fenetrePoints, figureConiqueRepere, figureSchema, l, nL, t } from "./outilsConiquesLotH2";
import { droiteL } from "./outilsLieuxLotH2";
import { approchee, diagnostiquer, messageIllisible, piege } from "../moteur6e/verificationMiroirsContexte";
import { correctionDetailleeMC } from "../generateurs6e/miroirsContexte/corrigeDetaille";

/**
 * Couche C — textes de `6gen140` « Miroirs en contexte » : situations (jamais le nom de la conique :
 * c'est la réponse de l'écran 1), consignes, aides à deux niveaux, réponses, schémas (même échelle sur
 * les deux axes, sans quadrillage ; aucune figure à l'écran 1, qui trahirait la forme). Source unique de
 * l'écran, du papier et du corrigé.
 */

type E = ExerciceMC;
const cm = (v: number) => `${nL(v)}\\text{ cm}`;

export const NATURES: Record<NatureMC, string> = { parabole: "Une parabole", ellipse: "Une ellipse", hyperbole: "Une hyperbole", cercle: "Un cercle" };
export const ORDRE_NATURES: NatureMC[] = ["parabole", "ellipse", "hyperbole", "cercle"];

const OBJET: Record<E["variante"], string> = { antenne: "de l'antenne", phare: "du réflecteur", lithotriteur: "de la paroi", cassegrain: "du petit miroir", ftfp: "du réflecteur" };

export function situation(e: E): Frag[] {
  switch (e.variante) {
    case "antenne":
      return [
        t("Une antenne satellite a un diamètre de "),
        l(cm(e.D)),
        t(" (d'un bord à l'autre) et une profondeur de "),
        l(cm(e.h)),
        t(" (du fond au plan des bords). Les ondes venues du satellite arrivent parallèles à l'axe de l'antenne et doivent toutes se concentrer sur le récepteur. On coupe l'antenne par un plan qui contient son axe, et on place un repère orthonormé d'origine le fond de l'antenne, l'axe des abscisses étant l'axe de l'antenne (unité : le centimètre)."),
      ];
    case "phare":
      return [
        t("Le réflecteur d'un phare de voiture renvoie la lumière de sa lampe en un faisceau de rayons parallèles à son axe. La lampe est placée à "),
        l(cm(e.f)),
        t(" du fond du réflecteur, dont l'ouverture a un diamètre de "),
        l(cm(e.D)),
        t(". On coupe le réflecteur par un plan qui contient son axe, et on place un repère orthonormé d'origine le fond du réflecteur, l'axe des abscisses étant son axe (unité : le centimètre)."),
      ];
    case "lithotriteur":
      return [
        t("Dans un lithotriteur, un générateur émet des ondes de choc qui, après réflexion sur une paroi, doivent toutes passer par le calcul rénal à détruire. Sur l'axe de la paroi, le générateur est placé à "),
        l(cm(e.a - e.c)),
        t(" du fond de la paroi, et le calcul à "),
        l(cm(2 * e.c)),
        t(" du générateur. On coupe l'appareil par un plan qui contient cet axe, et on place un repère orthonormé d'origine le milieu du segment qui joint le générateur au calcul, l'axe des abscisses étant l'axe de la paroi et le calcul du côté des abscisses positives (unité : le centimètre)."),
      ];
    case "cassegrain":
      return [
        t("Dans un télescope de type Cassegrain, la lumière réfléchie par le grand miroir converge vers son foyer "),
        l("F"),
        t(". Avant de l'atteindre, elle rencontre un petit miroir convexe qui la renvoie vers un point "),
        l("F'"),
        t(", situé derrière le grand miroir (percé en son centre), où l'on place la caméra. On a "),
        l(`FF'=${cm(2 * e.c)}`),
        t(" et le sommet "),
        l("S"),
        t(" du petit miroir est sur le segment "),
        l("[FF']"),
        t(", à "),
        l(cm(e.c - e.a)),
        t(" de "),
        l("F"),
        t(". On coupe le télescope par un plan qui contient son axe, et on place un repère orthonormé d'origine le milieu de "),
        l("[FF']"),
        t(", l'axe des abscisses étant la droite "),
        l("(FF')"),
        t(" et "),
        l("F"),
        t(" du côté des abscisses positives (unité : le centimètre)."),
      ];
    case "ftfp":
      return [
        t("Le réflecteur d'un projecteur a pour section la parabole "),
        l(`\\Gamma:\\ ${equationConiqueL(conique(e))}`),
        t(" (unité : le centimètre), dont le foyer "),
        l("F"),
        t(" porte l'ampoule. Un rayon parallèle à l'axe arrive sur le réflecteur au point "),
        l(`P${coordL(e.P)}`),
        t(". La tangente à "),
        l("\\Gamma"),
        t(" en "),
        l("P"),
        t(" coupe l'axe des abscisses en "),
        l("T"),
        t("."),
      ];
  }
}
export const consigneGenerale = situation;

// ---------------------------------------------------------------------------------------------
// Questions de la situation (écrans 3 et 4)
// ---------------------------------------------------------------------------------------------

export function questionGrandeur(e: E): Frag[] {
  switch (e.variante) {
    case "antenne":
      return [t("À quelle distance du fond de l'antenne faut-il placer le récepteur ?")];
    case "phare":
      return [t("Quelle est la profondeur du réflecteur ?")];
    case "lithotriteur":
      return [t("La paroi s'arrête au plan perpendiculaire à l'axe qui passe par le milieu du segment joignant le générateur au calcul. Quel est le rayon de son ouverture ?")];
    case "cassegrain":
      return [t("À quelle distance du sommet "), l("S"), t(" du petit miroir se trouve la caméra, en "), l("F'"), t(" ?")];
    default:
      return [];
  }
}

export function questionDistance(e: E): Frag[] {
  switch (e.variante) {
    case "antenne":
      return [t("Un support rectiligne relie le récepteur au bord de l'antenne. Quelle est sa longueur ?")];
    case "phare":
      return [t("Quelle distance sépare la lampe du bord du réflecteur ?")];
    case "lithotriteur":
      return [t("Quelle distance parcourt chaque onde, du générateur au calcul, en passant par la paroi ?")];
    case "cassegrain":
      return [t("Pour un point "), l("P"), t(" quelconque du petit miroir, que vaut "), l("PF'-PF"), t(" ?")];
    default:
      return [];
  }
}

// ---------------------------------------------------------------------------------------------
// Réponses
// ---------------------------------------------------------------------------------------------

export const equationL = (e: E): string => equationConiqueL(conique(e));
export const tangenteL = (e: E): string => droiteL(tangenteFtfp(e));
export const reflechiL = (e: E): string => droiteL(reflechi(e));

export function reponse(e: E, p: PhaseMC): Frag[] {
  switch (p) {
    case "conique":
      return [t(NATURES[nature(e)])];
    case "equation":
      return [l(equationL(e))];
    case "grandeur":
      return [l(cm(grandeur(e)))];
    case "distance":
      return [l(e.variante === "cassegrain" ? `PF'-PF=${cm(distance(e))}` : cm(distance(e)))];
    case "tangente":
      return [l(tangenteL(e))];
    case "pointT":
      return [l(`T${coordL(pointT(e))}`)];
    case "distances":
      return [l(`FT=FP=${nL(grandeur(e))}`)];
    case "reflechi":
      return [l(reflechiL(e))];
  }
}
export const recap = reponse;

export function libelle(e: E, p: PhaseMC): string {
  const lib: Record<PhaseMC, string> = {
    conique: "Conique",
    equation: "Équation",
    grandeur: { antenne: "Position du récepteur", phare: "Profondeur", lithotriteur: "Rayon de l'ouverture", cassegrain: "Distance SF′", ftfp: "" }[e.variante],
    distance: { antenne: "Longueur du support", phare: "Lampe – bord", lithotriteur: "Trajet d'une onde", cassegrain: "PF′ − PF", ftfp: "" }[e.variante],
    tangente: "Tangente en P",
    pointT: "Point T",
    distances: "FT et FP",
    reflechi: "Rayon réfléchi",
  };
  return lib[p];
}

export function consigne(e: E, p: PhaseMC): Frag[] {
  switch (p) {
    case "conique":
      return [t(`Quelle conique doit être la section ${OBJET[e.variante]} pour que la situation fonctionne ?`)];
    case "equation":
      return [t("Écris une équation de cette conique dans le repère donné.")];
    case "grandeur":
      return questionGrandeur(e);
    case "distance":
      return questionDistance(e);
    case "tangente":
      return [t("Écris une équation de la tangente à "), l("\\Gamma"), t(" en "), l("P"), t(".")];
    case "pointT":
      return [t("Donne les coordonnées du point "), l("T"), t(".")];
    case "distances":
      return [t("Calcule les distances "), l("FT"), t(" et "), l("FP"), t(".")];
    case "reflechi":
      return [t("Écris une équation de la droite qui porte le rayon réfléchi en "), l("P"), t(".")];
  }
}

export function champs(_e: E, p: PhaseMC): ChampEcran[] {
  if (p === "equation") return [{ label: "Équation de la conique", placeholder: "équation en x et y" }];
  if (p === "grandeur" || p === "distance") return [{ label: "Longueur", unite: "cm", placeholder: "valeur exacte" }];
  if (p === "tangente" || p === "reflechi") return [{ label: p === "tangente" ? "Tangente en P" : "Rayon réfléchi", placeholder: "équation en x et y" }];
  if (p === "pointT") return [{ label: "Coordonnées de T", placeholder: "(… ; …)" }];
  return [
    { label: "FT", labelLatex: "FT=", unite: "cm", placeholder: "valeur exacte" },
    { label: "FP", labelLatex: "FP=", unite: "cm", placeholder: "valeur exacte" },
  ];
}

export function optionsConique(): OptionEcran[] {
  return ORDRE_NATURES.map((n) => ({ id: n, fragments: [t(NATURES[n])] }));
}

// ---------------------------------------------------------------------------------------------
// Aides
// ---------------------------------------------------------------------------------------------

export function aide1(e: E, p: PhaseMC): AideEcran {
  switch (p) {
    case "conique":
      return { texte: [t("Propriétés optiques (cours, § 6) : la parabole renvoie vers son foyer les rayons parallèles à son axe ; l'ellipse renvoie vers un foyer ce qui part de l'autre ; l'hyperbole renvoie un rayon dirigé vers un foyer comme s'il venait de l'autre.")] };
    case "equation":
      if (e.variante === "lithotriteur") return { texte: [t("Ellipse de foyers sur l'axe des abscisses (cours, § 1) : "), l("c"), t(" est la moitié de la distance entre les foyers, "), l("a"), t(" la distance du centre au sommet, et :")], latex: "b^2=a^2-c^2" };
      if (e.variante === "cassegrain") return { texte: [t("Hyperbole de foyers sur l'axe des abscisses (cours, § 1) : "), l("c"), t(" est la moitié de "), l("FF'"), t(", "), l("a"), t(" la distance du centre au sommet, et :")], latex: "b^2=c^2-a^2" };
      return { texte: [t("Parabole de sommet l'origine et d'axe l'axe des abscisses (cours, § 1) :")], latex: "y^2=2px,\\quad F\\left(\\dfrac p2\\,;0\\right)" };
    case "grandeur":
      if (e.variante === "antenne") return { texte: [t("Le récepteur est au foyer "), l("F"), t(", à "), l("\\dfrac p2"), t(" du sommet.")] };
      if (e.variante === "phare") return { texte: [t("Le bord du réflecteur est un point de la parabole : son ordonnée est le rayon de l'ouverture, son abscisse la profondeur.")] };
      if (e.variante === "lithotriteur") return { texte: [t("Le plan coupe l'axe au centre de l'ellipse : cherche les points de l'ellipse d'abscisse "), l("0"), t(".")] };
      return { texte: [t("Place "), l("S"), t(", "), l("F"), t(" et "), l("F'"), t(" sur l'axe : "), l("S"), t(" est un sommet de l'hyperbole.")] };
    case "distance":
      if (e.variante === "lithotriteur") return { texte: [t("Définition de l'ellipse (cours, § 1) : pour tout point "), l("P"), t(" de l'ellipse :")], latex: "PF+PF'=2a" };
      if (e.variante === "cassegrain") return { texte: [t("Définition de l'hyperbole (cours, § 1) : pour tout point "), l("P"), t(" de la branche la plus proche de "), l("F"), t(" :")], latex: "PF'-PF=2a" };
      return { texte: [t("Définition de la parabole : la distance d'un point au foyer égale sa distance à la directrice "), l("d\\equiv x=-\\dfrac p2"), t(".")] };
    case "tangente":
      return { texte: [t("Forme dédoublée (cours, § 5) :")], latex: "y\\,y_P=p\\,(x+x_P)" };
    case "pointT":
      return { texte: [t("T est sur l'axe des abscisses : remplace "), l("y"), t(" par "), l("0"), t(" dans l'équation de la tangente.")] };
    case "distances":
      return { texte: [t("Pour "), l("FP"), t(", utilise la définition de la parabole (distance à la directrice) ou la formule de la distance.")] };
    case "reflechi":
      return { texte: [t("Le triangle "), l("FPT"), t(" est isocèle en "), l("F"), t(" : les angles en "), l("T"), t(" et en "), l("P"), t(" sont égaux, donc le rayon réfléchi passe par un point remarquable de la parabole.")] };
  }
}

export function aide2(e: E, p: PhaseMC): AideEcran | null {
  const P = e.variante === "antenne" || e.variante === "phare" ? bord(e) : e.P;
  switch (p) {
    case "conique":
      return { texte: [t(e.variante === "lithotriteur" ? "Ici, ce qui part d'un point doit passer par un autre point." : e.variante === "cassegrain" ? "Ici, des rayons qui se dirigeaient vers F repartent vers F′." : "Ici, des rayons parallèles doivent se concentrer en un point, ou l'inverse.")] };
    case "equation":
      if (e.variante === "antenne") return { texte: [t("Le bord de l'antenne est le point "), l(`\\left(${nL(e.h)}\\,;${nL(e.D / 2)}\\right)`), t(" : il vérifie l'équation, ce qui donne "), l("p"), t(".")] };
      if (e.variante === "phare") return { texte: [t("La lampe est au foyer : "), l(`\\dfrac p2=${nL(e.f)}`), t(".")] };
      if (e.variante === "lithotriteur") return { texte: [t("Ici "), l(`2c=${nL(2 * e.c)}`), t(" et le fond est le sommet "), l("(-a\\,;0)"), t(", à "), l(cm(e.a - e.c)), t(" du foyer "), l("(-c\\,;0)"), t(".")] };
      return { texte: [t("Ici "), l(`2c=${nL(2 * e.c)}`), t(" et "), l("S(a\\,;0)"), t(" est à "), l(cm(e.c - e.a)), t(" de "), l("F(c\\,;0)"), t(".")] };
    case "grandeur":
      if (e.variante === "antenne") return { texte: [t("Tu as trouvé "), l("p"), t(" à l'écran précédent ; divise-le par 2.")] };
      if (e.variante === "phare") return { texte: [t("Le bord a pour ordonnée "), l(nL(e.D / 2)), t(" (le rayon, pas le diamètre) : remplace "), l("y"), t(" dans l'équation.")] };
      if (e.variante === "lithotriteur") return { texte: [t("Pour "), l("x=0"), t(", l'équation donne "), l("y^2=b^2"), t(".")] };
      return { texte: [t("Ici "), l(`S(${nL(e.a)}\\,;0)`), t(" et "), l(`F'(${nL(-e.c)}\\,;0)`), t(".")] };
    case "distance":
      if (e.variante === "lithotriteur" || e.variante === "cassegrain") return { texte: [t("Tu as trouvé "), l("a"), t(" à l'écran 2.")] };
      return { texte: [t("Le bord est "), l(`P${coordL(P)}`), t(" et la directrice est "), l(`x=${nL(-(conique(e) as { p: number }).p / 2)}`), t(".")] };
    case "tangente":
      return { texte: [t("Ici "), l(`p=${nL(e.p)}`), t(", "), l(`x_P=${nL(e.P.x)}`), t(" et "), l(`y_P=${nL(e.P.y)}`), t(".")] };
    case "pointT":
      return null;
    case "distances":
      return { texte: [t("Le foyer est "), l(`F${coordL(foyerFtfp(e))}`), t(" et la directrice "), l(`x=${nL(-e.p / 2)}`), t(".")] };
    case "reflechi":
      return { texte: [t("Le rayon réfléchi passe par "), l("P"), t(" et par le foyer "), l(`F${coordL(foyerFtfp(e))}`), t(".")] };
  }
}

export function explicationChoix(e: E, p: PhaseMC): string {
  if (p !== "conique") return "";
  if (e.variante === "lithotriteur") return "Ce qui part d'un foyer d'une ellipse est renvoyé vers l'autre foyer : c'est une ellipse.";
  if (e.variante === "cassegrain") return "Un rayon dirigé vers un foyer d'une hyperbole repart comme s'il venait de l'autre foyer : c'est une hyperbole.";
  return "Seule la parabole renvoie vers son foyer tous les rayons parallèles à son axe (et inversement).";
}

// ---------------------------------------------------------------------------------------------
// Figures
// ---------------------------------------------------------------------------------------------

function arcParabole(p: number, yMax: number, n = 80): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const y = -yMax + (2 * yMax * i) / n;
    pts.push({ x: (y * y) / (2 * p), y });
  }
  return pts;
}

/** Schéma (antenne, phare, lithotriteur, Cassegrain) ou repère (ftfp) ; `complet` : réponses dessinées. */
export function figureMC(e: E, complet: boolean): string {
  const c = conique(e);
  if (e.variante === "ftfp") {
    const F = foyerFtfp(e);
    const T = pointT(e);
    const fen = fenetrePoints([e.P, T, F, { x: 0, y: e.P.y > 0 ? -2 : 2 }], 1, 8);
    return figureConiqueRepere({
      fenetre: fen,
      courbes: branchesConique(c, fen).map((points) => ({ points, couleur: COULEURS.bleu })),
      droites: complet ? [{ d: tangenteFtfp(e), couleur: COULEURS.gris }] : [],
      segments: [
        { A: { x: fen.xMax, y: e.P.y }, B: e.P, couleur: COULEURS.accent, fleche: true },
        ...(complet ? [{ A: e.P, B: F, couleur: COULEURS.vert, fleche: true }, { A: T, B: F, couleur: COULEURS.vert, pointille: true }] : []),
      ],
      points: [{ P: e.P, label: "P", position: e.P.y > 0 ? "n" : "s" }, { P: F, label: "F", position: "s" }, ...(complet ? [{ P: T, label: "T", position: "s" as const }] : [])],
    });
  }
  if (c.type === "parabole") {
    const B = bord(e);
    const F = { x: c.p / 2, y: 0 };
    const xMax = Math.max(B.x, F.x, B.y * 0.8) * 1.12;
    const fen = { xMin: -0.08 * xMax, xMax, yMin: -B.y * 1.12, yMax: B.y * 1.12 };
    return figureSchema({
      fenetre: fen,
      axes: true,
      courbes: [{ points: arcParabole(c.p, B.y), couleur: COULEURS.bleu, epaisseur: 2.6 }],
      segments: [
        { A: { x: xMax, y: B.y * 0.5 }, B: { x: (B.y * B.y * 0.25) / (2 * c.p), y: B.y * 0.5 }, couleur: COULEURS.accent, fleche: true },
        ...(complet ? [{ A: { x: (B.y * B.y * 0.25) / (2 * c.p), y: B.y * 0.5 }, B: F, couleur: COULEURS.vert, fleche: true }, { A: F, B, couleur: COULEURS.gris, pointille: true }] : []),
      ],
      points: [{ P: { x: 0, y: 0 }, label: "O", position: "so" }, ...(complet ? [{ P: F, label: "F", position: "se" as const, couleur: COULEURS.vert }] : []), { P: B, label: "P", position: "ne" }],
    });
  }
  const a = c.a;
  const b = c.b;
  const cc = e.c;
  if (c.type === "ellipse") {
    const pts: Pt[] = [];
    for (let i = 0; i <= 90; i++) {
      const t0 = Math.PI / 2 + (Math.PI * i) / 90;
      pts.push({ x: a * Math.cos(t0), y: b * Math.sin(t0) });
    }
    const P = { x: a * Math.cos(2.2), y: b * Math.sin(2.2) };
    const fen = { xMin: -a * 1.12, xMax: cc + a * 0.25, yMin: -b * 1.2, yMax: b * 1.2 };
    return figureSchema({
      fenetre: fen,
      axes: true,
      courbes: [{ points: pts, couleur: COULEURS.bleu, epaisseur: 2.6 }, ...(complet ? [{ points: pts.map((q) => ({ x: -q.x, y: q.y })), couleur: "#9aa1ab", epaisseur: 1.2, pointille: true }] : [])],
      segments: [
        { A: { x: -cc, y: 0 }, B: P, couleur: COULEURS.accent, fleche: true },
        { A: P, B: { x: cc, y: 0 }, couleur: COULEURS.vert, fleche: true },
      ],
      points: [
        { P: { x: -cc, y: 0 }, label: "générateur", position: "s" },
        { P: { x: cc, y: 0 }, label: "calcul", position: "s" },
        ...(complet ? [{ P: { x: 0, y: b }, couleur: COULEURS.vert }, { P: { x: 0, y: -b }, couleur: COULEURS.vert }] : []),
      ],
    });
  }
  // Hyperbole (Cassegrain) : branche proche de F, F, F′, un rayon vers F renvoyé vers F′.
  const pts: Pt[] = [];
  for (let i = 0; i <= 80; i++) {
    const s = -0.9 + (1.8 * i) / 80;
    pts.push({ x: a * Math.cosh(s), y: b * Math.sinh(s) });
  }
  const P = { x: a * Math.cosh(0.45), y: b * Math.sinh(0.45) };
  const depart = { x: P.x + 1.6 * (P.x - cc), y: P.y + 1.6 * P.y };
  const fen = { xMin: -cc * 1.15, xMax: cc * 1.15, yMin: -b * 1.1, yMax: Math.max(b * 1.1, depart.y) };
  return figureSchema({
    fenetre: fen,
    axes: true,
    courbes: [{ points: pts, couleur: COULEURS.bleu, epaisseur: 2.6 }],
    segments: [
      { A: depart, B: P, couleur: COULEURS.accent, fleche: true },
      { A: P, B: { x: cc, y: 0 }, couleur: COULEURS.accent, pointille: true },
      ...(complet ? [{ A: P, B: { x: -cc, y: 0 }, couleur: COULEURS.vert, fleche: true }] : []),
    ],
    points: [
      { P: { x: cc, y: 0 }, label: "F", position: "s" },
      { P: { x: -cc, y: 0 }, label: "F′ (caméra)", position: "s" },
      { P: { x: a, y: 0 }, label: "S", position: "so" },
    ],
  });
}

export function figure(e: E, p: PhaseMC): string | null {
  if (p === "conique") return null;
  return figureMC(e, false);
}

// ---------------------------------------------------------------------------------------------
// Définition
// ---------------------------------------------------------------------------------------------

/** `6gen140` : conique (choix jugé), équation, deux grandeurs (contexte) ; ou tangente, T, FT = FP,
 * rayon réfléchi (réflecteur). */
export const DEFINITION_MC: DefinitionEcrans<E, PhaseMC> = {
  phases,
  estChoix: (_e, p) => p === "conique",
  mode: (e, p) => (p === "conique" ? { type: "choix", options: optionsConique() } : { type: "champs", champs: champs(e, p) }),
  libelle,
  consigneGenerale,
  figure,
  consigne,
  approchee,
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
  correction: correctionDetailleeMC,
  apercuEnonce: (e) => [t({ antenne: "Antenne satellite", phare: "Phare de voiture", lithotriteur: "Lithotriteur", cassegrain: "Télescope Cassegrain", ftfp: "Réflecteur : tangente et rayon réfléchi" }[e.variante])],
};
