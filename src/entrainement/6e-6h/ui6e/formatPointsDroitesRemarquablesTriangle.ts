import type { ExercicePointsDroitesRemarquablesTriangle } from "../core6e/pointsDroitesRemarquablesTriangle.types";
import type { PhasePointsDroitesRemarquablesTriangle } from "../moteur6e/typesPointsDroitesRemarquablesTriangle";
import { droiteParDeuxPoints, latexDroite, latexQ, lireEquation, lirePoint, milieu, perpendiculaire, polyDroite, proportionnels, pt, q, qNum } from "../moteur6e/algebreLieux";
import type { Droite, Pt } from "../moteur6e/algebreLieux";
import { f } from "./fragmentsCombinatoire";
import type { AideCombi, ChampCombi, FormatCombinatoire, FragmentConsigne } from "./fragmentsCombinatoire";
import { champDroiteUI, champListeDroitesUI, champListeNombresUI, champListePointsUI, champNombreUI, champPointUI, d3, ld, lp, nomPoint, p2 } from "./textesLieux";
import { figureLieux } from "./figureLieux";
import type { ObjetsLieux } from "./figureLieux";

/**
 * Textes de `6gen54` — Constructions analytiques dans le triangle (6e ch. 9, § 1 ; audit, lots B et
 * C). Aucune notation clavier, aucun exemple de champ qui soit une valeur possible, aides à deux
 * niveaux (propriété du cours, puis posée pour l'instance) qui ne donnent jamais le résultat,
 * explication après chaque écran (corrigé consultable), figure de la configuration avec le lieu ou
 * le point cherché tracé APRÈS la réponse.
 */

type E = ExercicePointsDroitesRemarquablesTriangle;
type P = PhasePointsDroitesRemarquablesTriangle;

const X = (p: Pt) => latexQ(p.x);
const Y = (p: Pt) => latexQ(p.y);
/** « (−3) » entre parenthèses si négatif, pour un calcul posé. */
const par = (r: { n: bigint; d: bigint }) => (r.n < 0n ? `(${latexQ(r)})` : latexQ(r));
const sous = (a: Pt, b: Pt) => ({ x: qNum(a.x) - qNum(b.x), y: qNum(a.y) - qNum(b.y) });
const vec = (v: { x: number; y: number }) => `\\begin{pmatrix}${latexQ(qd(v.x))}\\\\ ${latexQ(qd(v.y))}\\end{pmatrix}`;
function qd(x: number) {
  for (let d = 1; d <= 1000; d++) if (Math.abs(Math.round(x * d) - x * d) < 1e-9) return q(Math.round(x * d), d);
  return q(Math.round(x));
}

function lignes(...l: string[]): FragmentConsigne[][] {
  return l.map((x) => f(x));
}

export const FORMAT_6GEN54: FormatCombinatoire<E, P> = {
  consigneGenerale(e) {
    switch (e.famille) {
      case "A":
        return f("Dans un triangle $ABC$, $A'$ est le milieu de $[BC]$, $B'$ celui de $[CA]$ et $C'$ celui de $[AB]$. Retrouve les sommets du triangle.");
      case "B":
        return f("Dans le triangle $ABC$, la bissectrice de l'angle $\\widehat{ABC}$ coupe le côté $[AC]$ en $I$. Calcule les coordonnées de $I$.");
      case "C":
        return f("On cherche les points $C$ de la droite $d$ tels que l'aire du triangle $ABC$ soit égale à $k$. Un point de $d$ s'écrit $C(t)$.");
      case "D":
        return f("Dans le triangle $ABC$, on connaît le sommet $A$, la médiane issue de $B$ et la médiane issue de $C$. Retrouve $B$, $C$ puis les équations des trois côtés.");
      case "E":
        return f("On cherche les droites qui passent par $P$ et qui sont à égale distance des points $A$ et $B$.");
      case "F":
        return f("Construis par le calcul le symétrique $Q$ du point $P$ par rapport à la droite $(AB)$.");
      case "G":
        return e.sousType === "sommetDiagonale"
          ? f("Un paysagiste dessine sur un plan (unité : 1 m) un massif carré $ABCD$. Il a déjà placé le sommet $A$ et tracé la diagonale $(BD)$. Retrouve les autres sommets.")
          : f("Une dalle carrée $ABCD$ est dessinée sur un plan (unité : 1 dm). On connaît son centre $P$ et la droite $(AB)$ qui porte un de ses côtés. Retrouve les quatre sommets.");
      case "H":
        return e.contexte === "miroir"
          ? f("Un rayon lumineux part de la source $P$ et frappe un miroir plan, représenté par la droite $d$, au point $M$. On cherche la droite que suit le rayon réfléchi.")
          : f("Une boule de billard part de $P$ et rebondit sur la bande $d$ au point $M$ ; sans effet, elle rebondit comme un rayon sur un miroir. On cherche la droite qu'elle suit après le rebond.");
    }
  },

  donnees(e) {
    switch (e.famille) {
      case "A":
        return [f(`$${nomPoint("A'", e.Ap)}$, $${nomPoint("B'", e.Bp)}$, $${nomPoint("C'", e.Cp)}$`)];
      case "B":
        return [f(`$${nomPoint("A", e.A)}$, $${nomPoint("B", e.B)}$, $${nomPoint("C", e.C)}$`)];
      case "C":
        return [
          f(`$${nomPoint("A", e.A)}$, $${nomPoint("B", e.B)}$, aire voulue $k=${e.k}$`),
          f(`$d\\,:\\ ${ld(e.d)}$, paramétrée par $C(t)=\\left(${paramLatex(e.P0.x, e.u.x)}\\,;\\,${paramLatex(e.P0.y, e.u.y)}\\right)$`),
        ];
      case "D":
        return [f(`$${nomPoint("A", e.A)}$`), f(`médiane issue de $B$ : $${ld(e.medianeB)}$`), f(`médiane issue de $C$ : $${ld(e.medianeC)}$`)];
      case "E":
        return [f(`$${nomPoint("P", e.P)}$, $${nomPoint("A", e.A)}$, $${nomPoint("B", e.B)}$`)];
      case "F":
        return [f(`$${nomPoint("A", e.A)}$, $${nomPoint("B", e.B)}$, $${nomPoint("P", e.P)}$`)];
      case "G":
        return e.sousType === "sommetDiagonale" ? [f(`$${nomPoint("A", e.A)}$, diagonale $(BD)\\,:\\ ${ld(e.droiteBD)}$`)] : [f(`centre $${nomPoint("P", e.P)}$, côté porté par $(AB)\\,:\\ ${ld(e.droiteAB)}$`)];
      case "H":
        return [f(`$${nomPoint("P", e.P)}$, $${nomPoint("M", e.M)}$`), f(`${e.contexte === "miroir" ? "miroir" : "bande"} $d\\,:\\ ${ld(e.d)}$`)];
    }
  },

  consigneEcran(e, p) {
    switch (p) {
      case "aSommetA":
        return f("Calcule les coordonnées du sommet $A$.");
      case "aSommetsBC":
        return f("Calcule de même les coordonnées des sommets $B$ et $C$.");
      case "bLongueurs":
        return f("Calcule les longueurs $AB$ et $BC$ (valeurs exactes).");
      case "bPointI":
        return f("Calcule les coordonnées du point $I$.");
      case "cExpression":
        return f("L'aire du triangle $ABC(t)$ s'écrit $\\text{Aire}(t)=\\frac{1}{2}\\left|K+Mt\\right|$. Écris l'expression $K+Mt$ (ce qui est entre les barres).");
      case "cValeursT":
        return f("Trouve toutes les valeurs de $t$ pour lesquelles l'aire vaut $k$ (une par ligne).");
      case "cPointsC":
        return f("Donne les coordonnées de chaque point $C$ qui convient (un par ligne).");
      case "dPointB":
        return f("Calcule les coordonnées du sommet $B$.");
      case "dPointC":
        return f("Calcule les coordonnées du sommet $C$.");
      case "dCotes":
        return f("Écris une équation de chacun des trois côtés, sous la forme $ax+by+c=0$.");
      case "eNombre":
        return f("Combien de droites passent par $P$ et sont à égale distance de $A$ et de $B$ ?");
      case "eDroites":
        return f("Écris une équation de chaque droite qui convient (une par ligne).");
      case "fPerpendiculaire":
        return f("Écris une équation de la perpendiculaire à $(AB)$ passant par $P$.");
      case "fPied":
        return f("Calcule les coordonnées du point $H$ où cette perpendiculaire coupe $(AB)$.");
      case "fSymetrique":
        return f("Calcule les coordonnées du symétrique $Q$ de $P$.");
      case "gPremier":
        return e.famille === "G" && e.sousType === "sommetDiagonale" ? f("Calcule les coordonnées du centre $O$ du carré.") : f("Calcule les coordonnées du milieu $M$ du côté $[AB]$.");
      case "gDeuxieme":
        return e.famille === "G" && e.sousType === "sommetDiagonale" ? f("Calcule les coordonnées du sommet $C$.") : f("Calcule les coordonnées des sommets $A$ et $B$ (un par ligne, dans l'ordre que tu veux).");
      case "gTroisieme":
        return e.famille === "G" && e.sousType === "sommetDiagonale" ? f("Calcule les coordonnées des sommets $B$ et $D$ (un par ligne, dans l'ordre que tu veux).") : f("Calcule les coordonnées des deux autres sommets (un par ligne).");
      case "hSymetrique":
        return f("Calcule les coordonnées du symétrique $P'$ de $P$ par rapport à $d$.");
      case "hRayon":
        return e.famille === "H" && e.contexte === "billard" ? f("Écris une équation de la droite suivie par la boule après le rebond en $M$.") : f("Écris une équation de la droite qui porte le rayon réfléchi.");
    }
  },

  champs(_e, p): ChampCombi[] {
    switch (p) {
      case "aSommetA":
        return [champPointUI("$A$")];
      case "aSommetsBC":
        return [champPointUI("$B$"), champPointUI("$C$")];
      case "bLongueurs":
        return [champNombreUI("$AB$"), champNombreUI("$BC$")];
      case "bPointI":
        return [champPointUI("$I$")];
      case "cExpression":
        return [{ type: "texte", label: "$K+Mt=$", placeholder: "expression en t" }];
      case "cValeursT":
        return [champListeNombresUI("Valeurs de $t$")];
      case "cPointsC":
        return [champListePointsUI("Points $C$")];
      case "dPointB":
        return [champPointUI("$B$")];
      case "dPointC":
        return [champPointUI("$C$")];
      case "dCotes":
        return [champDroiteUI("$(AB)$"), champDroiteUI("$(BC)$"), champDroiteUI("$(CA)$")];
      case "eNombre":
        return [
          {
            type: "choix",
            label: "",
            options: [
              { valeur: "aucune", label: "Aucune" },
              { valeur: "une", label: "Une seule" },
              { valeur: "deux", label: "Deux" },
              { valeur: "infinite", label: "Une infinité" },
            ],
          },
        ];
      case "eDroites":
        return [champListeDroitesUI("Droites")];
      case "fPerpendiculaire":
        return [champDroiteUI("Perpendiculaire")];
      case "fPied":
        return [champPointUI("$H$")];
      case "fSymetrique":
        return [champPointUI("$Q$")];
      case "gPremier":
        return [champPointUI(_e.famille === "G" && _e.sousType === "sommetDiagonale" ? "$O$" : "$M$")];
      case "gDeuxieme":
        return _e.famille === "G" && _e.sousType === "sommetDiagonale" ? [champPointUI("$C$")] : [champListePointsUI("Sommets $A$ et $B$")];
      case "gTroisieme":
        return [champListePointsUI(_e.famille === "G" && _e.sousType === "sommetDiagonale" ? "Sommets $B$ et $D$" : "Deux autres sommets")];
      case "hSymetrique":
        return [champPointUI("$P'$")];
      case "hRayon":
        return [champDroiteUI("Droite")];
    }
  },

  aides: aides54,
  reponseAttendue: reponse54,
  explication: explication54,
  libellePhase: (_e, p) => LIBELLES[p],
  messageCible: cible54,
};

const LIBELLES: Record<P, string> = {
  aSommetA: "Sommet A",
  aSommetsBC: "Sommets B et C",
  bLongueurs: "Longueurs AB et BC",
  bPointI: "Pied I de la bissectrice",
  cExpression: "Aire en fonction de t",
  cValeursT: "Valeurs de t",
  cPointsC: "Points C",
  dPointB: "Sommet B",
  dPointC: "Sommet C",
  dCotes: "Équations des côtés",
  eNombre: "Nombre de droites",
  eDroites: "Équations des droites",
  fPerpendiculaire: "Perpendiculaire",
  fPied: "Pied H",
  fSymetrique: "Symétrique Q",
  gPremier: "Premier point",
  gDeuxieme: "Deuxième étape",
  gTroisieme: "Derniers sommets",
  hSymetrique: "Symétrique P′",
  hRayon: "Rayon réfléchi",
};

/** « 2 + 3t », « −1 − t », « 4 » (coordonnée de C(t)). */
function paramLatex(x0: { n: bigint; d: bigint }, u: number): string {
  const base = latexQ(x0);
  if (u === 0) return base;
  const terme = u === 1 ? "t" : u === -1 ? "-t" : `${u}t`;
  if (x0.n === 0n) return terme;
  return `${base}${u > 0 ? "+" : ""}${terme}`;
}

function equationPoseeSysteme(d: Droite, A: Pt): string {
  // milieu de [A ; (x ; y)] sur d : a(x_A + x)/2 + b(y_A + y)/2 + c = 0
  return `${d.a}\\cdot\\dfrac{${X(A)}+x}{2}${d.b < 0n ? "" : "+"}${d.b}\\cdot\\dfrac{${Y(A)}+y}{2}${d.c < 0n ? "" : "+"}${d.c}=0`;
}

function aides54(e: E, p: P): AideCombi[] {
  switch (e.famille) {
    case "A": {
      if (p === "aSommetA")
        return [
          { texte: "Théorème des milieux : $AC'A'B'$ est un parallélogramme, donc on obtient un sommet sans résoudre de système :", latex: "A=B'+C'-A'" },
          { texte: "Coordonnée par coordonnée :", latex: `x_A=${X(e.Bp)}+${par(e.Cp.x)}-${par(e.Ap.x)},\\quad y_A=${Y(e.Bp)}+${par(e.Cp.y)}-${par(e.Ap.y)}` },
        ];
      return [
        { texte: "Même raisonnement pour chaque sommet : on additionne les milieux des deux côtés qui partent du sommet et on retranche le troisième :", latex: "B=A'+C'-B',\\qquad C=A'+B'-C'" },
        { texte: "Par exemple pour $B$ :", latex: `x_B=${X(e.Ap)}+${par(e.Cp.x)}-${par(e.Bp.x)}` },
      ];
    }
    case "B":
      if (p === "bLongueurs")
        return [
          { texte: "Distance entre deux points :", latex: "AB=\\sqrt{(x_B-x_A)^2+(y_B-y_A)^2}" },
          { texte: "Ici :", latex: `AB=\\sqrt{(${X(e.B)}-${par(e.A.x)})^2+(${Y(e.B)}-${par(e.A.y)})^2}` },
        ];
      return [
        { texte: "Théorème de la bissectrice : $I$ partage $[AC]$ dans le rapport des côtés adjacents à l'angle :", latex: "\\dfrac{AI}{IC}=\\dfrac{AB}{BC}" },
        { texte: `Ici $\\dfrac{AI}{IC}=\\dfrac{${e.AB}}{${e.BC}}$ : $I$ est situé aux $\\dfrac{${e.AB}}{${e.AB + e.BC}}$ de $[AC]$ en partant de $A$ :`, latex: `I=A+\\dfrac{${e.AB}}{${e.AB + e.BC}}\\,\\overrightarrow{AC}` },
      ];
    case "C": {
      const ab = sous(e.B, e.A);
      if (p === "cExpression")
        return [
          { texte: "Aire d'un triangle $ABC$ dans un repère orthonormé :", latex: "\\text{Aire}=\\frac{1}{2}\\left|(x_B-x_A)(y_C-y_A)-(y_B-y_A)(x_C-x_A)\\right|" },
          { texte: "Remplace $C$ par $C(t)$ :", latex: `\\frac{1}{2}\\left|${par(qd(ab.x))}\\left(${paramLatex(e.P0.y, e.u.y)}-${par(e.A.y)}\\right)-${par(qd(ab.y))}\\left(${paramLatex(e.P0.x, e.u.x)}-${par(e.A.x)}\\right)\\right|` },
        ];
      if (p === "cValeursT")
        return [
          { texte: "Une valeur absolue donne deux équations :", latex: "|u|=2k\\iff u=2k\\ \\text{ou}\\ u=-2k" },
          { texte: "Ici :", latex: `${e.K}${e.M < 0 ? "" : "+"}${e.M}t=${2 * e.k}\\quad\\text{ou}\\quad ${e.K}${e.M < 0 ? "" : "+"}${e.M}t=-${2 * e.k}` },
        ];
      return [
        { texte: "Remplace chaque valeur de $t$ dans $C(t)$.", latex: `C(t)=\\left(${paramLatex(e.P0.x, e.u.x)}\\,;\\,${paramLatex(e.P0.y, e.u.y)}\\right)` },
        { texte: "Vérifie : les deux points sont de part et d'autre de $(AB)$, à la même distance de cette droite." },
      ];
    }
    case "D": {
      if (p === "dPointB")
        return [
          { texte: "Pose $B(x\\,;y)$ : $B$ est sur sa médiane, et le milieu $C'$ de $[AB]$ est sur la médiane issue de $C$. Deux conditions, deux équations." },
          { texte: "Le système à résoudre :", latex: `\\begin{cases}${latexDroite(e.medianeB)}\\\\ ${equationPoseeSysteme(e.medianeC, e.A)}\\end{cases}` },
        ];
      if (p === "dPointC")
        return [
          { texte: "Même méthode : $C$ est sur sa médiane, et le milieu $B'$ de $[AC]$ est sur la médiane issue de $B$." },
          { texte: "Le système à résoudre :", latex: `\\begin{cases}${latexDroite(e.medianeC)}\\\\ ${equationPoseeSysteme(e.medianeB, e.A)}\\end{cases}` },
        ];
      return [
        { texte: "Droite par deux points $A$ et $B$ : si $\\overrightarrow{AB}=\\begin{pmatrix}u\\\\ v\\end{pmatrix}$, alors $\\begin{pmatrix}v\\\\ -u\\end{pmatrix}$ est normal à la droite :", latex: "v(x-x_A)-u(y-y_A)=0" },
        { texte: "Pour $(AB)$ :", latex: `\\overrightarrow{AB}=${vec(sous(e.B, e.A))}` },
      ];
    }
    case "E":
      if (p === "eNombre")
        return [
          { texte: "Une droite est à égale distance de $A$ et de $B$ si et seulement si elle est parallèle à $(AB)$ ou passe par le milieu de $[AB]$." },
          { texte: "Regarde où se trouve $P$ : sur la droite $(AB)$ ? au milieu de $[AB]$ ? ailleurs ? Combien de droites des deux sortes passent alors par $P$ ?" },
        ];
      return [
        { texte: "Les droites cherchées passent par $P$ et sont parallèles à $(AB)$ ou passent par le milieu $I$ de $[AB]$." },
        { texte: "Ici :", latex: `I=${lp(milieu(e.A, e.B))},\\quad\\overrightarrow{AB}=${vec(sous(e.B, e.A))}` },
      ];
    case "F":
      if (p === "fPerpendiculaire")
        return [
          { texte: "$\\overrightarrow{AB}$ est un vecteur normal de toute perpendiculaire à $(AB)$ :", latex: "x_{\\overrightarrow{AB}}\\,(x-x_P)+y_{\\overrightarrow{AB}}\\,(y-y_P)=0" },
          { texte: "Ici :", latex: `\\overrightarrow{AB}=${vec(sous(e.B, e.A))}` },
        ];
      if (p === "fPied")
        return [
          { texte: "$H$ est sur les deux droites : résous le système formé par $(AB)$ et la perpendiculaire." },
          { texte: "Le système :", latex: `\\begin{cases}${latexDroite(e.droiteAB)}\\\\ ${latexDroite(e.perpendiculaire)}\\end{cases}` },
        ];
      return [
        { texte: "$H$ est le milieu de $[PQ]$ :", latex: "Q=2H-P" },
        { texte: "Ici :", latex: `x_Q=2\\cdot${par(e.H.x)}-${par(e.P.x)},\\quad y_Q=2\\cdot${par(e.H.y)}-${par(e.P.y)}` },
      ];
    case "G":
      if (e.sousType === "sommetDiagonale") {
        if (p === "gPremier")
          return [
            { texte: "Les diagonales d'un carré sont perpendiculaires et se coupent en leur milieu : $O$ est le pied de la perpendiculaire à $(BD)$ passant par $A$." },
            { texte: "La perpendiculaire à $(BD)$ par $A$ :", latex: latexDroite(perpendiculaire(e.droiteBD, e.A)) },
          ];
        if (p === "gDeuxieme")
          return [
            { texte: "$O$ est le milieu de la diagonale $[AC]$ :", latex: "C=2O-A" },
            { texte: "Ici :", latex: `x_C=2\\cdot${par(e.O.x)}-${par(e.A.x)}` },
          ];
        return [
          { texte: "Les diagonales ont la même longueur et sont perpendiculaires : $\\overrightarrow{OB}$ s'obtient en faisant tourner $\\overrightarrow{OA}$ d'un quart de tour, et $D$ est le symétrique de $B$ par rapport à $O$ :", latex: "\\begin{pmatrix}u\\\\ v\\end{pmatrix}\\longmapsto\\begin{pmatrix}-v\\\\ u\\end{pmatrix}" },
          { texte: "Ici :", latex: `\\overrightarrow{OA}=${vec(sous(e.A, e.O))}` },
        ];
      }
      if (p === "gPremier")
        return [
          { texte: "Le centre est à égale distance des côtés : le milieu $M$ de $[AB]$ est le pied de la perpendiculaire à $(AB)$ passant par $P$." },
          { texte: "La perpendiculaire à $(AB)$ par $P$ :", latex: latexDroite(perpendiculaire(e.droiteAB, e.P)) },
        ];
      if (p === "gDeuxieme")
        return [
          { texte: "Dans un carré, $MA=MB=MP$ (la moitié du côté) et $(AB)\\perp(MP)$ : $\\overrightarrow{MA}$ et $\\overrightarrow{MB}$ s'obtiennent en faisant tourner $\\overrightarrow{MP}$ d'un quart de tour, dans un sens puis dans l'autre :", latex: "\\begin{pmatrix}u\\\\ v\\end{pmatrix}\\longmapsto\\begin{pmatrix}-v\\\\ u\\end{pmatrix}\\ \\text{ou}\\ \\begin{pmatrix}v\\\\ -u\\end{pmatrix}" },
          { texte: "Ici :", latex: `\\overrightarrow{MP}=${vec(sous(e.P, e.M))}` },
        ];
      return [
        { texte: "$P$ est le milieu des deux diagonales : chaque sommet a son opposé symétrique par rapport à $P$." },
        { texte: "Pour le sommet opposé à $A$ :", latex: `2P-A=\\left(2\\cdot${par(e.P.x)}-${par(e.A.x)}\\,;\\,2\\cdot${par(e.P.y)}-${par(e.A.y)}\\right)` },
      ];
    case "H":
      if (p === "hSymetrique")
        return [
          { texte: "Symétrique par rapport à une droite : perpendiculaire à $d$ passant par $P$, pied $H$ (intersection avec $d$), puis $P'=2H-P$." },
          { texte: "La perpendiculaire à $d$ par $P$ :", latex: latexDroite(perpendiculaire(e.d, e.P)) },
        ];
      return [
        { texte: "Loi de la réflexion : le rayon réfléchi semble venir de $P'$, le symétrique de la source. Il est porté par la droite $(P'M)$." },
        { texte: "Un vecteur directeur :", latex: `\\overrightarrow{P'M}=${vec(sous(e.M, e.Pp))}` },
      ];
  }
}

function reponse54(e: E, p: P): string[] {
  switch (e.famille) {
    case "A":
      return p === "aSommetA" ? [nomPoint("A", e.A)] : [nomPoint("B", e.B), nomPoint("C", e.C)];
    case "B":
      return p === "bLongueurs" ? [`AB=${e.AB}`, `BC=${e.BC}`] : [nomPoint("I", e.I)];
    case "C":
      if (p === "cExpression") return [`K+Mt=${e.K}${e.M < 0 ? "" : "+"}${e.M}t\\ \\text{(ou son opposé)}`];
      if (p === "cValeursT") return e.t.map((x) => `t=${latexQ(qd(x))}`);
      return e.C.map((c) => nomPoint("C", c));
    case "D":
      if (p === "dPointB") return [nomPoint("B", e.B)];
      if (p === "dPointC") return [nomPoint("C", e.C)];
      return [`(AB)\\,:\\ ${ld(e.AB)}`, `(BC)\\,:\\ ${ld(e.BC)}`, `(CA)\\,:\\ ${ld(e.CA)}`];
    case "E":
      if (p === "eNombre") return [e.position === "milieu" ? "\\text{une infinité}" : e.position === "surAB" ? "\\text{une seule}" : "\\text{deux}"];
      return e.droites.map(ld);
    case "F":
      if (p === "fPerpendiculaire") return [ld(e.perpendiculaire)];
      if (p === "fPied") return [nomPoint("H", e.H)];
      return [nomPoint("Q", e.Q)];
    case "G":
      if (e.sousType === "sommetDiagonale") {
        if (p === "gPremier") return [nomPoint("O", e.O)];
        if (p === "gDeuxieme") return [nomPoint("C", e.C)];
        return [nomPoint("B", e.B), nomPoint("D", e.D)];
      }
      if (p === "gPremier") return [nomPoint("M", e.M)];
      if (p === "gDeuxieme") return [lp(e.A), lp(e.B)];
      return [lp(e.C), lp(e.D)];
    case "H":
      return p === "hSymetrique" ? [nomPoint("P'", e.Pp)] : [ld(e.rayonReflechi)];
  }
}

function explication54(e: E, p: P): FragmentConsigne[][] {
  switch (e.famille) {
    case "A":
      if (p === "aSommetA") return lignes("Théorème des milieux : $AC'A'B'$ est un parallélogramme, donc $A=B'+C'-A'$.", `$x_A=${X(e.Bp)}+${par(e.Cp.x)}-${par(e.Ap.x)}=${X(e.A)}$ et $y_A=${Y(e.Bp)}+${par(e.Cp.y)}-${par(e.Ap.y)}=${Y(e.A)}$.`, `Résultat : $${nomPoint("A", e.A)}$.`);
      return lignes("De même $B=A'+C'-B'$ et $C=A'+B'-C'$.", `Résultat : $${nomPoint("B", e.B)}$ et $${nomPoint("C", e.C)}$.`, "Vérification : le milieu de $[BC]$ est bien $A'$.");
    case "B":
      if (p === "bLongueurs") return lignes(`$AB=\\sqrt{${par(qd(sous(e.B, e.A).x))}^2+${par(qd(sous(e.B, e.A).y))}^2}=${e.AB}$ et $BC=\\sqrt{${par(qd(sous(e.C, e.B).x))}^2+${par(qd(sous(e.C, e.B).y))}^2}=${e.BC}$.`);
      return lignes(`Théorème de la bissectrice : $\\dfrac{AI}{IC}=\\dfrac{AB}{BC}=\\dfrac{${e.AB}}{${e.BC}}$.`, `Donc $I=A+\\dfrac{${e.AB}}{${e.AB + e.BC}}\\,\\overrightarrow{AC}$, avec $\\overrightarrow{AC}=${vec(sous(e.C, e.A))}$.`, `Résultat : $${nomPoint("I", e.I)}$.`, "Piège : $I$ n'est pas le milieu de $[AC]$ (le triangle n'est pas isocèle en $B$).");
    case "C":
      if (p === "cExpression") return lignes(`On remplace $C$ par $C(t)$ dans la formule de l'aire, puis on développe : $\\text{Aire}(t)=\\frac{1}{2}\\left|${e.K}${e.M < 0 ? "" : "+"}${e.M}t\\right|$.`, "L'opposé de cette expression convient aussi (même valeur absolue).");
      if (p === "cValeursT") return lignes(`$\\frac{1}{2}|${e.K}${e.M < 0 ? "" : "+"}${e.M}t|=${e.k}\\iff ${e.K}${e.M < 0 ? "" : "+"}${e.M}t=${2 * e.k}$ ou $${e.K}${e.M < 0 ? "" : "+"}${e.M}t=-${2 * e.k}$.`, `Résultat : $t=${latexQ(qd(e.t[0]))}$ ou $t=${latexQ(qd(e.t[1]))}$.`, "Piège : une seule valeur, c'est oublier une des deux équations de la valeur absolue.");
      return lignes(`$C(${latexQ(qd(e.t[0]))})=${lp(e.C[0])}$ et $C(${latexQ(qd(e.t[1]))})=${lp(e.C[1])}$.`, "Vérification : ces deux points sont symétriques par rapport au point où $d$ coupe $(AB)$.");
    case "D": {
      if (p === "dPointB") return lignes("$B$ est sur sa médiane ; le milieu $C'$ de $[AB]$ est sur la médiane issue de $C$.", `On résout le système $\\begin{cases}${latexDroite(e.medianeB)}\\\\ ${equationPoseeSysteme(e.medianeC, e.A)}\\end{cases}$.`, `Résultat : $${nomPoint("B", e.B)}$.`);
      if (p === "dPointC") return lignes("$C$ est sur sa médiane ; le milieu $B'$ de $[AC]$ est sur la médiane issue de $B$.", `Résultat : $${nomPoint("C", e.C)}$.`);
      return lignes(`$(AB)\\,:\\ ${ld(e.AB)}$`, `$(BC)\\,:\\ ${ld(e.BC)}$`, `$(CA)\\,:\\ ${ld(e.CA)}$`, "Vérification : chaque sommet vérifie les équations des deux côtés qui y passent.");
    }
    case "E":
      if (p === "eNombre") {
        if (e.position === "milieu") return lignes("$P$ est le milieu de $[AB]$ : toute droite passant par $P$ passe par le milieu de $[AB]$, donc est à égale distance de $A$ et de $B$.", "Il y a donc une infinité de droites.");
        if (e.position === "surAB") return lignes("$P$ est sur $(AB)$ sans en être le milieu : la parallèle à $(AB)$ par $P$ est $(AB)$ elle-même, et la droite par $P$ et le milieu de $[AB]$ est encore $(AB)$.", "Une seule droite convient : $(AB)$.");
        return lignes("$P$ n'est pas sur $(AB)$ : la parallèle à $(AB)$ par $P$ et la droite par $P$ et le milieu de $[AB]$ sont deux droites différentes.", "Deux droites conviennent.");
      }
      return lignes(...e.droites.map((d) => `$${ld(d)}$`), "Vérification : chaque droite passe par $P$.");
    case "F":
      if (p === "fPerpendiculaire") return lignes(`$\\overrightarrow{AB}=${vec(sous(e.B, e.A))}$ est normal à la perpendiculaire, qui passe par $P$ : $${ld(e.perpendiculaire)}$.`);
      if (p === "fPied") return lignes(`Système $\\begin{cases}${latexDroite(e.droiteAB)}\\\\ ${latexDroite(e.perpendiculaire)}\\end{cases}$ : $${nomPoint("H", e.H)}$.`);
      return lignes(`$Q=2H-P=${lp(e.Q)}$.`, "Piège : $Q=2P-H$ est faux, c'est $H$ le milieu de $[PQ]$.");
    case "G":
      if (e.sousType === "sommetDiagonale") {
        if (p === "gPremier") return lignes(`Perpendiculaire à $(BD)$ par $A$ : $${latexDroite(perpendiculaire(e.droiteBD, e.A))}$, puis intersection avec $(BD)$.`, `Résultat : $${nomPoint("O", e.O)}$.`);
        if (p === "gDeuxieme") return lignes(`$C=2O-A=${lp(e.C)}$.`);
        return lignes(`$\\overrightarrow{OA}=${vec(sous(e.A, e.O))}$ tourné d'un quart de tour donne $${vec(sous(e.B, e.O))}$ ou son opposé.`, `Résultat : $${lp(e.B)}$ et $${lp(e.D)}$ (l'un ou l'autre peut s'appeler $B$).`);
      }
      if (p === "gPremier") return lignes(`Perpendiculaire à $(AB)$ par $P$ : $${latexDroite(perpendiculaire(e.droiteAB, e.P))}$, puis intersection avec $(AB)$.`, `Résultat : $${nomPoint("M", e.M)}$.`);
      if (p === "gDeuxieme") return lignes(`$\\overrightarrow{MP}=${vec(sous(e.P, e.M))}$ tourné d'un quart de tour dans chaque sens donne $\\overrightarrow{MA}$ et $\\overrightarrow{MB}$.`, `Résultat : $${lp(e.A)}$ et $${lp(e.B)}$.`);
      return lignes(`Symétriques par rapport à $P$ : $${lp(e.C)}$ et $${lp(e.D)}$.`, "Vérification : les quatre côtés ont la même longueur et les diagonales aussi.");
    case "H":
      if (p === "hSymetrique") return lignes(`Perpendiculaire à $d$ par $P$ : $${latexDroite(perpendiculaire(e.d, e.P))}$ ; elle coupe $d$ au milieu de $[PP']$.`, `Résultat : $${nomPoint("P'", e.Pp)}$.`);
      return lignes(`Le rayon réfléchi est porté par $(P'M)$ : $${ld(e.rayonReflechi)}$.`, "Piège : ce n'est ni le miroir $d$, ni la droite $(PM)$ du rayon incident.");
  }
}

function egalPoint(v: string, cible: Pt): boolean {
  try {
    const p = lirePoint(v);
    return Math.abs(p.x.valeur - qNum(cible.x)) < 1e-9 && Math.abs(p.y.valeur - qNum(cible.y)) < 1e-9;
  } catch {
    return false;
  }
}
function egalDroite(v: string, d: Droite): boolean {
  try {
    return proportionnels(lireEquation(v, ["x", "y"]).poly, polyDroite(d));
  } catch {
    return false;
  }
}

function cible54(e: E, p: P, valeurs: string[]): FragmentConsigne[] | null {
  const v = valeurs[0] ?? "";
  switch (e.famille) {
    case "A": {
      if (p === "aSommetA" && egalPoint(v, e.B)) return f("C'est le sommet $B$ : pour $A$, on additionne les milieux des deux côtés qui partent de $A$ ($B'$ et $C'$) et on retranche $A'$.");
      if (p === "aSommetA" && egalPoint(v, e.C)) return f("C'est le sommet $C$ : pour $A$, on additionne $B'$ et $C'$ et on retranche $A'$.");
      return null;
    }
    case "B":
      if (p === "bPointI" && egalPoint(v, milieu(e.A, e.C))) return f("C'est le milieu de $[AC]$ : la bissectrice coupe $[AC]$ dans le rapport $\\dfrac{AB}{BC}$, pas en son milieu.");
      if (p === "bPointI") {
        const s = e.AB + e.BC;
        const inverse = { x: q(Math.round(e.AB * qNum(e.A.x) + e.BC * qNum(e.C.x)), s), y: q(Math.round(e.AB * qNum(e.A.y) + e.BC * qNum(e.C.y)), s) };
        if (egalPoint(v, inverse)) return f("Ton point est trop près du mauvais sommet : $AI$ est proportionnel à $AB$, donc $I$ est plus près de $A$ si $AB$ est le plus petit côté.");
      }
      return null;
    case "C":
      if (p === "cValeursT" && v.split("\n").filter((l) => l.trim()).length === 1) return f("Il en manque une : $|u|=2k$ donne deux équations, $u=2k$ et $u=-2k$.");
      if (p === "cPointsC" && v.split("\n").filter((l) => l.trim()).length === 1) return f("Il manque un point : il y a deux valeurs de $t$, donc deux points $C$.");
      return null;
    case "E":
      if (p === "eDroites" && e.position === "hors" && v.split("\n").filter((l) => l.trim()).length === 1) return f("Il en manque une : pense à la parallèle à $(AB)$ ET à la droite qui passe par le milieu de $[AB]$.");
      return null;
    case "F":
      if (p === "fSymetrique" && egalPoint(v, pt(2 * qNum(e.P.x) - qNum(e.H.x), 2 * qNum(e.P.y) - qNum(e.H.y)))) return f("C'est $H$ le milieu de $[PQ]$ : $Q=2H-P$, pas $2P-H$.");
      if (p === "fPerpendiculaire" && egalDroite(v, droiteParDeuxPoints(e.A, e.B))) return f("C'est la droite $(AB)$ elle-même : on demande la perpendiculaire à $(AB)$ qui passe par $P$.");
      return null;
    case "H":
      if (p === "hRayon" && egalDroite(v, e.d)) return f("C'est le miroir lui-même : le rayon réfléchi part de $M$ et s'éloigne de $d$.");
      if (p === "hRayon" && egalDroite(v, e.rayonIncident)) return f("C'est la droite $(PM)$ du rayon incident : le rayon réfléchi est porté par $(P'M)$.");
      if (p === "hSymetrique" && egalPoint(v, e.P)) return f("C'est $P$ lui-même : son symétrique est de l'autre côté de $d$.");
      return null;
    default:
      return null;
  }
}

// ============================================================================
// Figure (configuration, puis points cherchés APRÈS la réponse)
// ============================================================================

export function figure6gen54(e: E, closes: readonly P[]): string {
  const c = (ph: P) => closes.includes(ph);
  const o: ObjetsLieux = { points: [], droites: [], segments: [], polygones: [] };
  const pts = o.points!;
  switch (e.famille) {
    case "A": {
      o.segments!.push({ a: p2(e.Ap), b: p2(e.Bp), couleur: "gris", pointilles: true }, { a: p2(e.Bp), b: p2(e.Cp), couleur: "gris", pointilles: true }, { a: p2(e.Cp), b: p2(e.Ap), couleur: "gris", pointilles: true });
      pts.push({ p: p2(e.Ap), nom: "A'", couleur: "gris" }, { p: p2(e.Bp), nom: "B'", couleur: "gris" }, { p: p2(e.Cp), nom: "C'", couleur: "gris" });
      if (c("aSommetA")) pts.push({ p: p2(e.A), nom: "A", couleur: "vert" });
      if (c("aSommetsBC")) {
        o.polygones!.push({ pts: [p2(e.A), p2(e.B), p2(e.C)], couleur: "vert" });
        pts.push({ p: p2(e.B), nom: "B", couleur: "vert" }, { p: p2(e.C), nom: "C", couleur: "vert" });
      }
      o.inclure = [p2(e.A), p2(e.B), p2(e.C)];
      break;
    }
    case "B":
      o.polygones!.push({ pts: [p2(e.A), p2(e.B), p2(e.C)], couleur: "bleu" });
      pts.push({ p: p2(e.A), nom: "A" }, { p: p2(e.B), nom: "B" }, { p: p2(e.C), nom: "C" });
      if (c("bPointI")) {
        o.segments!.push({ a: p2(e.B), b: p2(e.I), couleur: "vert", epais: true });
        pts.push({ p: p2(e.I), nom: "I", couleur: "vert" });
      }
      break;
    case "C":
      o.droites!.push({ ...d3(e.d), nom: "d" });
      o.segments!.push({ a: p2(e.A), b: p2(e.B), couleur: "bleu" });
      pts.push({ p: p2(e.A), nom: "A" }, { p: p2(e.B), nom: "B" });
      if (c("cPointsC")) {
        e.C.forEach((pc, i) => {
          o.polygones!.push({ pts: [p2(e.A), p2(e.B), p2(pc)], couleur: "vert", rempli: true, trait: false });
          pts.push({ p: p2(pc), nom: i === 0 ? "C₁" : "C₂", couleur: "vert" });
        });
      }
      o.inclure = e.C.map(p2);
      break;
    case "D":
      o.droites!.push({ ...d3(e.medianeB), couleur: "gris", pointilles: true }, { ...d3(e.medianeC), couleur: "gris", pointilles: true });
      pts.push({ p: p2(e.A), nom: "A" });
      if (c("dPointB")) pts.push({ p: p2(e.B), nom: "B", couleur: "vert" });
      if (c("dPointC")) pts.push({ p: p2(e.C), nom: "C", couleur: "vert" });
      if (c("dCotes")) o.polygones!.push({ pts: [p2(e.A), p2(e.B), p2(e.C)], couleur: "vert" });
      o.inclure = [p2(e.B), p2(e.C)];
      break;
    case "E":
      o.segments!.push({ a: p2(e.A), b: p2(e.B), couleur: "bleu" });
      pts.push({ p: p2(e.A), nom: "A" }, { p: p2(e.B), nom: "B" }, { p: p2(e.P), nom: "P", couleur: "accent" });
      if (c("eDroites")) e.droites.forEach((d) => o.droites!.push({ ...d3(d), couleur: "vert", epais: true }));
      break;
    case "F":
      o.droites!.push({ ...d3(e.droiteAB), couleur: "bleu", nom: "(AB)" });
      pts.push({ p: p2(e.A), nom: "A" }, { p: p2(e.B), nom: "B" }, { p: p2(e.P), nom: "P", couleur: "accent" });
      if (c("fPerpendiculaire")) o.droites!.push({ ...d3(e.perpendiculaire), couleur: "gris", pointilles: true });
      if (c("fPied")) pts.push({ p: p2(e.H), nom: "H", couleur: "vert" });
      if (c("fSymetrique")) pts.push({ p: p2(e.Q), nom: "Q", couleur: "vert" });
      o.inclure = [p2(e.Q)];
      break;
    case "G":
      if (e.sousType === "sommetDiagonale") {
        o.droites!.push({ ...d3(e.droiteBD), couleur: "gris", pointilles: true, nom: "(BD)" });
        pts.push({ p: p2(e.A), nom: "A" });
        if (c("gPremier")) pts.push({ p: p2(e.O), nom: "O", couleur: "vert" });
        if (c("gDeuxieme")) pts.push({ p: p2(e.C), nom: "C", couleur: "vert" });
        if (c("gTroisieme")) {
          o.polygones!.push({ pts: [p2(e.A), p2(e.B), p2(e.C), p2(e.D)], couleur: "vert", rempli: true });
          pts.push({ p: p2(e.B), nom: "B", couleur: "vert" }, { p: p2(e.D), nom: "D", couleur: "vert" });
        }
      } else {
        o.droites!.push({ ...d3(e.droiteAB), couleur: "gris", pointilles: true, nom: "(AB)" });
        pts.push({ p: p2(e.P), nom: "P" });
        if (c("gPremier")) pts.push({ p: p2(e.M), nom: "M", couleur: "vert" });
        if (c("gDeuxieme")) pts.push({ p: p2(e.A), couleur: "vert" }, { p: p2(e.B), couleur: "vert" });
        if (c("gTroisieme")) {
          o.polygones!.push({ pts: [p2(e.A), p2(e.B), p2(e.C), p2(e.D)], couleur: "vert", rempli: true });
          pts.push({ p: p2(e.C), couleur: "vert" }, { p: p2(e.D), couleur: "vert" });
        }
      }
      o.inclure = [p2(e.A), p2(e.B), p2(e.C), p2(e.D)];
      break;
    case "H": {
      o.droites!.push({ ...d3(e.d), couleur: "bleu", epais: true, nom: "d" });
      o.segments!.push({ a: p2(e.P), b: p2(e.M), couleur: "accent" });
      pts.push({ p: p2(e.P), nom: "P", couleur: "accent" }, { p: p2(e.M), nom: "M" });
      if (c("hSymetrique")) {
        pts.push({ p: p2(e.Pp), nom: "P'", couleur: "gris" });
        o.segments!.push({ a: p2(e.Pp), b: p2(e.M), couleur: "gris", pointilles: true });
      }
      if (c("hRayon")) {
        const u = { x: qNum(e.M.x) - qNum(e.Pp.x), y: qNum(e.M.y) - qNum(e.Pp.y) };
        o.demiDroites = [{ o: p2(e.M), u, couleur: "vert", epais: true }];
      }
      o.inclure = [p2(e.Pp)];
      break;
    }
  }
  return figureLieux(o);
}

