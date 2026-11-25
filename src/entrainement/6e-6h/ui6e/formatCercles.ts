import type { ExerciceCercles, ExerciceCerclesG } from "../core6e/cercles.types";
import type { PhaseCercles } from "../moteur6e/typesCercles";
import { latexCercle, latexDroite, latexPoly, latexQ, latexRacine, lireEquation, lireNombre, lirePoint, milieu, polyCercle, proportionnels, pt, ptNum, q, qMul, qNum } from "../moteur6e/algebreLieux";
import type { Pt } from "../moteur6e/algebreLieux";
import { polyEquationK, polySysteme } from "../moteur6e/verificationCercles";
import { f } from "./fragmentsCombinatoire";
import type { AideCombi, ChampCombi, FormatCombinatoire, FragmentConsigne } from "./fragmentsCombinatoire";
import { champDroiteUI, champEquationUI, champListePointsUI, champNombreUI, champPointUI, d3, ld, lp, nomPoint, p2 } from "./textesLieux";
import { figureLieux } from "./figureLieux";
import type { ObjetsLieux } from "./figureLieux";

/**
 * Textes de `6gen55` — Cercles (6e ch. 9, § 2 ; audit, lots B et C) : droites en ax + by + c = 0,
 * valeurs exactes (fractions, racines simplifiées) annoncées et acceptées en chaîne, réponses de
 * chaque écran rédigées (plus de « (voir aide/développement) »), « un des quatre cercles tangents »
 * aux trois droites, aides à deux niveaux qui ne donnent jamais le résultat, figure (cercle tracé
 * APRÈS la réponse).
 */

type E = ExerciceCercles;
type P = PhaseCercles;

const par = (r: { n: bigint; d: bigint }) => (r.n < 0n ? `(${latexQ(r)})` : latexQ(r));
const lq = latexQ;
const L = (...l: string[]): FragmentConsigne[][] => l.map((x) => f(x));
const EXACT = " Donne des valeurs exactes (fractions ou racines), jamais arrondies.";

function rayon(r2: { n: bigint; d: bigint }): string {
  return latexRacine(r2);
}

const SOMMET_ANGLE = { A: "\\widehat{A}", B: "\\widehat{B}", C: "\\widehat{C}" };
function poidsLatex(e: ExerciceCerclesG): string {
  if (e.mode === "inscrit") return "\\dfrac{a\\,A+b\\,B+c\\,C}{a+b+c}";
  if (e.sommet === "A") return "\\dfrac{-a\\,A+b\\,B+c\\,C}{-a+b+c}";
  if (e.sommet === "B") return "\\dfrac{a\\,A-b\\,B+c\\,C}{a-b+c}";
  return "\\dfrac{a\\,A+b\\,B-c\\,C}{a+b-c}";
}
function rayonGLatex(e: ExerciceCerclesG): string {
  if (e.mode === "inscrit") return "r=\\dfrac{\\text{Aire}}{s}";
  const cote = e.sommet === "A" ? "a" : e.sommet === "B" ? "b" : "c";
  return `r=\\dfrac{\\text{Aire}}{s-${cote}}`;
}

export const FORMAT_6GEN55: FormatCombinatoire<E, P> = {
  consigneGenerale(e) {
    switch (e.famille) {
      case "A":
        return f("Détermine le cercle qui passe par les trois points $A$, $B$ et $C$. Son équation s'écrit $x^2+y^2+Dx+Ey+F=0$." + EXACT);
      case "B":
        return f("On cherche les cercles de rayon $r$ qui passent par les points $A$ et $B$." + EXACT);
      case "C":
        return f("On cherche le cercle qui passe par $A$ et $B$ et dont le centre est sur la droite $d$." + EXACT);
      case "D":
        return f(`On cherche le cercle tangent à l'axe des ${e.axe === "abscisses" ? "abscisses" : "ordonnées"} au point $T$ et qui passe par $A$.` + EXACT);
      case "E":
        return f("Détermine le cercle inscrit dans le triangle $ABC$ (tangent à ses trois côtés, à l'intérieur du triangle)." + EXACT);
      case "F":
        return f("On cherche le cercle de centre $\\Omega$ qui découpe sur la droite $d$ une corde de longueur $L$." + EXACT);
      case "G":
        return e.mode === "inscrit"
          ? f("Trois droites deux à deux sécantes forment le triangle $ABC$. Elles sont tangentes à quatre cercles : le cercle inscrit et trois cercles exinscrits. On cherche le cercle inscrit, à l'intérieur du triangle." + EXACT)
          : f(`Trois droites deux à deux sécantes forment le triangle $ABC$. Elles sont tangentes à quatre cercles : le cercle inscrit et trois cercles exinscrits. On cherche le cercle exinscrit situé dans l'angle $${SOMMET_ANGLE[e.sommet]}$ (hors du triangle).` + EXACT);
    }
  },
  donnees(e) {
    switch (e.famille) {
      case "A":
        return [f(`$${nomPoint("A", e.A)}$, $${nomPoint("B", e.B)}$, $${nomPoint("C", e.C)}$`)];
      case "B":
        return [f(`$${nomPoint("A", e.A)}$, $${nomPoint("B", e.B)}$, rayon $r=${rayon(e.r2)}$`)];
      case "C":
        return [f(`$${nomPoint("A", e.A)}$, $${nomPoint("B", e.B)}$`), f(`$d\\,:\\ ${ld(e.d)}$`)];
      case "D":
        return [f(`$${nomPoint("A", e.A)}$, point de tangence $${nomPoint("T", e.T)}$`)];
      case "E":
        return [f(`$${nomPoint("A", e.triangle.A)}$, $${nomPoint("B", e.triangle.B)}$, $${nomPoint("C", e.triangle.C)}$`)];
      case "F":
        return [f(`centre $${nomPoint("\\Omega", e.centre)}$, longueur de la corde $L=${e.L}$`), f(`$d\\,:\\ ${ld(e.d)}$`)];
      case "G":
        return [f(`$(AB)\\,:\\ ${ld(e.AB)}$`), f(`$(BC)\\,:\\ ${ld(e.BC)}$`), f(`$(CA)\\,:\\ ${ld(e.CA)}$`)];
    }
  },
  consigneEcran(e, p) {
    switch (p) {
      case "aSysteme":
        return f("Écris les trois équations en $D$, $E$, $F$ obtenues en remplaçant $x$ et $y$ par les coordonnées de $A$, puis de $B$, puis de $C$.");
      case "aCoefficients":
        return f("Résous ce système : calcule $D$, $E$ et $F$.");
      case "aCentreRayon":
        return f("Déduis-en le centre $\\Omega$ et le rayon $r$ du cercle.");
      case "bNombre":
        return f("Combien de cercles de rayon $r$ passent par $A$ et $B$ ?");
      case "bMediatrice":
      case "cMediatrice":
        return f("Le centre est à égale distance de $A$ et de $B$. Écris une équation de la médiatrice de $[AB]$.");
      case "bCentres":
        return f("Calcule les coordonnées de chaque centre (un par ligne).");
      case "cCentre":
        return f("Calcule les coordonnées du centre $\\Omega$.");
      case "cEquation":
      case "dEquation":
      case "fEquation":
        return f("Écris une équation du cercle.");
      case "dEquationK":
        return e.famille === "D" && e.axe === "ordonnees"
          ? f("Le centre est sur la perpendiculaire à l'axe en $T$ : on le note $\\Omega(k\\,;y_T)$, et le rayon vaut $|k|$. Écris l'équation en $k$ qui traduit $\\Omega A=\\Omega T$.")
          : f("Le centre est sur la perpendiculaire à l'axe en $T$ : on le note $\\Omega(x_T\\,;k)$, et le rayon vaut $|k|$. Écris l'équation en $k$ qui traduit $\\Omega A=\\Omega T$.");
      case "dCentreRayon":
        return f("Résous cette équation : donne le centre $\\Omega$ et le rayon $r$.");
      case "eCotes":
      case "gCotes":
        return f("Calcule les longueurs des côtés $a=BC$, $b=CA$ et $c=AB$.");
      case "eCentre":
        return f("Calcule les coordonnées du centre $I$ du cercle inscrit.");
      case "eRayon":
        return f("Calcule le rayon $r$ du cercle inscrit.");
      case "fDistance":
        return f("Calcule la distance du centre $\\Omega$ à la droite $d$.");
      case "fRayon2":
        return f("Calcule le carré $r^2$ du rayon du cercle.");
      case "gSommets":
        return f("Calcule les coordonnées des sommets $A$, $B$ et $C$.");
      case "gCentre":
        return e.famille === "G" && e.mode === "exinscrit" ? f("Calcule les coordonnées du centre $J$ du cercle exinscrit cherché.") : f("Calcule les coordonnées du centre $I$ du cercle inscrit.");
      case "gRayon":
        return f("Calcule le rayon $r$ de ce cercle.");
    }
  },
  champs(e, p): ChampCombi[] {
    switch (p) {
      case "aSysteme":
        return ["A", "B", "C"].map((n) => champEquationUI(`Pour $${n}$`, ["D", "E", "F"]));
      case "aCoefficients":
        return [champNombreUI("$D$"), champNombreUI("$E$"), champNombreUI("$F$")];
      case "aCentreRayon":
      case "dCentreRayon":
        return [champPointUI("Centre $\\Omega$"), champNombreUI("Rayon $r$")];
      case "bNombre":
        return [
          {
            type: "choix",
            label: "",
            options: [
              { valeur: "0", label: "Aucun" },
              { valeur: "1", label: "Un seul" },
              { valeur: "2", label: "Deux" },
            ],
          },
        ];
      case "bMediatrice":
      case "cMediatrice":
        return [champDroiteUI("Médiatrice")];
      case "bCentres":
        return [champListePointsUI("Centres")];
      case "cCentre":
        return [champPointUI("Centre $\\Omega$")];
      case "cEquation":
      case "dEquation":
      case "fEquation":
        return [champEquationUI("Équation du cercle")];
      case "dEquationK":
        return [champEquationUI("Équation en $k$", ["k"])];
      case "eCotes":
      case "gCotes":
        return [champNombreUI("$a=BC$"), champNombreUI("$b=CA$"), champNombreUI("$c=AB$")];
      case "eCentre":
        return [champPointUI("$I$")];
      case "eRayon":
      case "gRayon":
        return [champNombreUI("Rayon $r$")];
      case "fDistance":
        return [champNombreUI("Distance")];
      case "fRayon2":
        return [champNombreUI("$r^2$")];
      case "gSommets":
        return [champPointUI("$A$"), champPointUI("$B$"), champPointUI("$C$")];
      case "gCentre":
        return [champPointUI(e.famille === "G" && e.mode === "exinscrit" ? "$J$" : "$I$")];
    }
  },
  aides: aides55,
  reponseAttendue: reponse55,
  explication: explication55,
  libellePhase: (_e, p) => LIBELLES[p],
  messageCible: cible55,
};

const LIBELLES: Record<P, string> = {
  aSysteme: "Système en D, E, F",
  aCoefficients: "D, E et F",
  aCentreRayon: "Centre et rayon",
  bNombre: "Nombre de cercles",
  bMediatrice: "Médiatrice de [AB]",
  bCentres: "Centres",
  cMediatrice: "Médiatrice de [AB]",
  cCentre: "Centre",
  cEquation: "Équation du cercle",
  dEquationK: "Équation en k",
  dCentreRayon: "Centre et rayon",
  dEquation: "Équation du cercle",
  eCotes: "Côtés",
  eCentre: "Centre du cercle inscrit",
  eRayon: "Rayon inscrit",
  fDistance: "Distance du centre à d",
  fRayon2: "Carré du rayon",
  fEquation: "Équation du cercle",
  gSommets: "Sommets",
  gCotes: "Côtés",
  gCentre: "Centre",
  gRayon: "Rayon",
};

function eqSysteme(p: Pt): string {
  return `${latexPoly(polySysteme(p), ["D", "E", "F"])}=0`;
}

function aires(t: { A: Pt; B: Pt; C: Pt }): string {
  return `\\text{Aire}=\\frac{1}{2}\\left|(${lq(t.B.x)}-${par(t.A.x)})(${lq(t.C.y)}-${par(t.A.y)})-(${lq(t.B.y)}-${par(t.A.y)})(${lq(t.C.x)}-${par(t.A.x)})\\right|`;
}

function aides55(e: E, p: P): AideCombi[] {
  switch (e.famille) {
    case "A":
      if (p === "aSysteme")
        return [
          { texte: "Un point est sur le cercle si ses coordonnées vérifient l'équation :", latex: "x_A^2+y_A^2+D\\,x_A+E\\,y_A+F=0" },
          { texte: "Pour $A$ :", latex: `${par(e.A.x)}^2+${par(e.A.y)}^2+${par(e.A.x)}\\,D+${par(e.A.y)}\\,E+F=0` },
        ];
      if (p === "aCoefficients")
        return [
          { texte: "Soustrais les équations deux à deux : $F$ disparaît, et il reste deux équations en $D$ et $E$." },
          { texte: "Le système :", latex: `\\begin{cases}${eqSysteme(e.A)}\\\\ ${eqSysteme(e.B)}\\\\ ${eqSysteme(e.C)}\\end{cases}` },
        ];
      return [
        { texte: "Complète les carrés : le centre et le rayon se lisent sur $D$, $E$, $F$ :", latex: "\\Omega\\left(-\\frac{D}{2}\\,;-\\frac{E}{2}\\right),\\qquad r^2=\\frac{D^2}{4}+\\frac{E^2}{4}-F" },
        { texte: "Ici :", latex: `r^2=\\frac{${par(q(e.D))}^2}{4}+\\frac{${par(q(e.E))}^2}{4}-${par(q(e.F))}` },
      ];
    case "B": {
      const M = milieu(e.A, e.B);
      if (p === "bNombre")
        return [
          { texte: "Le centre est sur la médiatrice de $[AB]$, à la distance $r$ de $A$ : compare $r$ à la moitié de $AB$." },
          { texte: "Ici :", latex: `AB=\\sqrt{(${lq(e.B.x)}-${par(e.A.x)})^2+(${lq(e.B.y)}-${par(e.A.y)})^2},\\qquad r=${rayon(e.r2)}` },
        ];
      if (p === "bMediatrice")
        return [
          { texte: "La médiatrice de $[AB]$ passe par le milieu $M$ de $[AB]$, et $\\overrightarrow{AB}$ en est un vecteur normal." },
          { texte: "Ici :", latex: `M${lp(M)},\\qquad\\overrightarrow{AB}\\begin{pmatrix}${qNum(e.B.x) - qNum(e.A.x)}\\\\ ${qNum(e.B.y) - qNum(e.A.y)}\\end{pmatrix}` },
        ];
      return [
        { texte: "Un centre $\\Omega(x\\,;y)$ est sur la médiatrice et vérifie $\\Omega A=r$ : résous le système." },
        { texte: "Le système :", latex: `\\begin{cases}${latexDroite(e.mediatrice)}\\\\ (x-${par(e.A.x)})^2+(y-${par(e.A.y)})^2=${lq(e.r2)}\\end{cases}` },
      ];
    }
    case "C":
      if (p === "cMediatrice") {
        const M = milieu(e.A, e.B);
        return [
          { texte: "La médiatrice de $[AB]$ passe par le milieu $M$ de $[AB]$, et $\\overrightarrow{AB}$ en est un vecteur normal." },
          { texte: "Ici :", latex: `M${lp(M)},\\qquad\\overrightarrow{AB}\\begin{pmatrix}${qNum(e.B.x) - qNum(e.A.x)}\\\\ ${qNum(e.B.y) - qNum(e.A.y)}\\end{pmatrix}` },
        ];
      }
      if (p === "cCentre")
        return [
          { texte: "$\\Omega$ est à la fois sur la médiatrice de $[AB]$ et sur $d$ : résous le système des deux équations." },
          { texte: "Le système :", latex: `\\begin{cases}${latexDroite(e.mediatrice)}\\\\ ${latexDroite(e.d)}\\end{cases}` },
        ];
      return [
        { texte: "Cercle de centre $\\Omega$ et de rayon $r$ :", latex: "(x-x_\\Omega)^2+(y-y_\\Omega)^2=r^2" },
        { texte: "Le carré du rayon :", latex: `r^2=\\Omega A^2=(${lq(e.A.x)}-${par(e.centre.x)})^2+(${lq(e.A.y)}-${par(e.centre.y)})^2` },
      ];
    case "D":
      if (p === "dEquationK")
        return [
          { texte: "Le rayon d'un cercle tangent à un axe en $T$ est la distance $\\Omega T=|k|$ ; écris l'égalité des carrés :", latex: "\\Omega A^2=k^2" },
          { texte: e.axe === "abscisses" ? `Ici $\\Omega(${lq(e.T.x)}\\,;k)$ : écris $\\Omega A^2$ avec la formule de la distance.` : `Ici $\\Omega(k\\,;${lq(e.T.y)})$ : écris $\\Omega A^2$ avec la formule de la distance.` },
        ];
      if (p === "dCentreRayon")
        return [
          { texte: "Développe : les termes en $k^2$ s'annulent, l'équation est du premier degré en $k$. Le rayon est $|k|$." },
          { texte: "Après développement :", latex: `${latexPoly(polyEquationK(e), ["k"])}=0` },
        ];
      return [
        { texte: "Cercle de centre $\\Omega$ et de rayon $r$ :", latex: "(x-x_\\Omega)^2+(y-y_\\Omega)^2=r^2" },
        { texte: "Ici $r^2=k^2$." },
      ];
    case "E":
    case "G": {
      const t = e.triangle;
      if (p === "gSommets" && e.famille === "G")
        return [
          { texte: "Chaque sommet est l'intersection de deux côtés : $A$ est sur $(AB)$ et sur $(CA)$." },
          { texte: "Pour $A$ :", latex: `\\begin{cases}${latexDroite(e.AB)}\\\\ ${latexDroite(e.CA)}\\end{cases}` },
        ];
      if (p === "eCotes" || p === "gCotes")
        return [
          { texte: "Distance entre deux points :", latex: "BC=\\sqrt{(x_C-x_B)^2+(y_C-y_B)^2}" },
          { texte: "Pour $a$ :", latex: `a=\\sqrt{(${lq(t.C.x)}-${par(t.B.x)})^2+(${lq(t.C.y)}-${par(t.B.y)})^2}` },
        ];
      if (p === "eCentre" || p === "gCentre") {
        const g = e.famille === "G" ? e : null;
        return [
          {
            texte: g && g.mode === "exinscrit" ? "Le centre d'un cercle exinscrit est le point de concours d'une bissectrice intérieure et de deux bissectrices extérieures ; ses coordonnées sont des moyennes pondérées des sommets, avec le côté opposé au sommet de l'angle compté négativement :" : "Le centre du cercle inscrit est le point de concours des bissectrices ; ses coordonnées sont les moyennes des sommets pondérées par les longueurs des côtés opposés :",
            latex: g ? `${g.mode === "exinscrit" ? "J" : "I"}=${poidsLatex(g)}` : "I=\\dfrac{a\\,A+b\\,B+c\\,C}{a+b+c}",
          },
          { texte: "Ici :", latex: `a=${t.a},\\quad b=${t.b},\\quad c=${t.c}` },
        ];
      }
      return [
        { texte: "L'aire du triangle s'écrit aussi avec le rayon et le demi-périmètre $s$ :", latex: e.famille === "G" ? rayonGLatex(e) : "r=\\dfrac{\\text{Aire}}{s}" },
        { texte: "Ici :", latex: aires(t) },
      ];
    }
    case "F":
      if (p === "fDistance")
        return [
          { texte: "Distance d'un point à la droite $ax+by+c=0$ :", latex: "\\text{dist}(\\Omega\\,;d)=\\dfrac{|a\\,x_\\Omega+b\\,y_\\Omega+c|}{\\sqrt{a^2+b^2}}" },
          { texte: "Ici :", latex: `\\dfrac{|${e.d.a}\\cdot${par(e.centre.x)}${e.d.b < 0n ? "" : "+"}${e.d.b}\\cdot${par(e.centre.y)}${e.d.c < 0n ? "" : "+"}${e.d.c}|}{\\sqrt{${e.d.a}^2+${par(q(e.d.b))}^2}}` },
        ];
      if (p === "fRayon2")
        return [
          { texte: "Le pied $H$ de la perpendiculaire issue de $\\Omega$ est le milieu de la corde : Pythagore dans le triangle rectangle $\\Omega HM$ ($M$, extrémité de la corde) :", latex: "r^2=\\Omega H^2+\\left(\\frac{L}{2}\\right)^2" },
          { texte: "Ici :", latex: `\\Omega H^2=${lq(e.dist2)},\\qquad \\frac{L}{2}=${e.L / 2}` },
        ];
      return [{ texte: "Cercle de centre $\\Omega$ et de rayon $r$ :", latex: "(x-x_\\Omega)^2+(y-y_\\Omega)^2=r^2" }];
  }
}

function reponse55(e: E, p: P): string[] {
  switch (e.famille) {
    case "A":
      if (p === "aSysteme") return [e.A, e.B, e.C].map(eqSysteme);
      if (p === "aCoefficients") return [`D=${e.D}`, `E=${e.E}`, `F=${e.F}`];
      return [nomPoint("\\Omega", e.centre), `r=${rayon(e.r2)}`];
    case "B":
      if (p === "bNombre") return [e.verdict === 0 ? "\\text{aucun}" : e.verdict === 1 ? "\\text{un seul}" : "\\text{deux}"];
      if (p === "bMediatrice") return [ld(e.mediatrice)];
      return e.centres.map(lp);
    case "C":
      if (p === "cMediatrice") return [ld(e.mediatrice)];
      if (p === "cCentre") return [nomPoint("\\Omega", e.centre)];
      return [latexCercle(e.centre, e.r2)];
    case "D":
      if (p === "dEquationK") return [`${latexPoly(polyEquationK(e), ["k"])}=0`];
      if (p === "dCentreRayon") return [nomPoint("\\Omega", e.centre), `r=${lq(q(Math.abs(Number(e.k.n)), e.k.d))}`];
      return [latexCercle(e.centre, e.r2)];
    case "E":
      if (p === "eCotes") return [`a=${e.triangle.a}`, `b=${e.triangle.b}`, `c=${e.triangle.c}`];
      if (p === "eCentre") return [nomPoint("I", e.centre)];
      return [`r=${lq(e.r)}`];
    case "F":
      if (p === "fDistance") return [`\\text{dist}(\\Omega\\,;d)=${rayon(e.dist2)}`];
      if (p === "fRayon2") return [`r^2=${lq(e.r2)}`];
      return [latexCercle(e.centre, e.r2)];
    case "G":
      if (p === "gSommets") return [nomPoint("A", e.triangle.A), nomPoint("B", e.triangle.B), nomPoint("C", e.triangle.C)];
      if (p === "gCotes") return [`a=${e.triangle.a}`, `b=${e.triangle.b}`, `c=${e.triangle.c}`];
      if (p === "gCentre") return [nomPoint(e.mode === "exinscrit" ? "J" : "I", e.centre)];
      return [`r=${lq(e.r)}`];
  }
}

function explication55(e: E, p: P): FragmentConsigne[][] {
  switch (e.famille) {
    case "A":
      if (p === "aSysteme") return L("On remplace $x$ et $y$ par les coordonnées de chaque point :", ...[e.A, e.B, e.C].map((x) => `$${eqSysteme(x)}$`));
      if (p === "aCoefficients") return L("En soustrayant les équations deux à deux, $F$ disparaît ; on résout le système en $D$, $E$, puis on remonte à $F$.", `Résultat : $D=${e.D}$, $E=${e.E}$, $F=${e.F}$.`);
      return L(`$\\Omega\\left(-\\frac{D}{2}\\,;-\\frac{E}{2}\\right)=${lp(e.centre)}$ et $r^2=\\frac{D^2}{4}+\\frac{E^2}{4}-F=${lq(e.r2)}$, donc $r=${rayon(e.r2)}$.`, "Piège : $r^2$ n'est pas le rayon ; et le centre a les coordonnées $-\\frac{D}{2}$ et $-\\frac{E}{2}$ (signes opposés).");
    case "B": {
      const M = milieu(e.A, e.B);
      if (p === "bNombre") {
        const ab2 = (qNum(e.B.x) - qNum(e.A.x)) ** 2 + (qNum(e.B.y) - qNum(e.A.y)) ** 2;
        const comp = e.verdict === 2 ? ">" : e.verdict === 1 ? "=" : "<";
        return L(`$\\frac{AB}{2}=\\frac{${latexRacine(q(ab2))}}{2}=${latexRacine(q(ab2, 4))}$ et $r=${rayon(e.r2)}$ : $r${comp}\\frac{AB}{2}$.`, e.verdict === 2 ? "Le cercle de centre $A$ et de rayon $r$ coupe la médiatrice en deux points : deux cercles." : e.verdict === 1 ? "Le seul centre possible est le milieu de $[AB]$ : un seul cercle, de diamètre $[AB]$." : "Aucun point de la médiatrice n'est à la distance $r$ de $A$ : aucun cercle.");
      }
      if (p === "bMediatrice") return L(`Milieu $M${lp(M)}$, vecteur normal $\\overrightarrow{AB}$ : $${ld(e.mediatrice)}$.`);
      return L("On remplace une coordonnée par l'autre (équation de la médiatrice) dans $(x-x_A)^2+(y-y_A)^2=r^2$, puis on résout l'équation du second degré.", `Résultat : ${e.centres.map((c) => `$${lp(c)}$`).join(" et ")}.`, "Vérification : chaque centre est à la distance $r$ de $A$ et de $B$.");
    }
    case "C":
      if (p === "cMediatrice") return L(`Milieu $M${lp(milieu(e.A, e.B))}$, vecteur normal $\\overrightarrow{AB}$ : $${ld(e.mediatrice)}$.`);
      if (p === "cCentre") return L(`On résout $\\begin{cases}${latexDroite(e.mediatrice)}\\\\ ${latexDroite(e.d)}\\end{cases}$ : $${nomPoint("\\Omega", e.centre)}$.`);
      return L(`$r^2=\\Omega A^2=${lq(e.r2)}$, d'où $${latexCercle(e.centre, e.r2)}$.`);
    case "D":
      if (p === "dEquationK") return L(`$\\Omega A^2=k^2$ s'écrit : $${latexPoly(polyEquationK(e), ["k"])}=0$ une fois développée (les $k^2$ s'annulent).`);
      if (p === "dCentreRayon") return L(`$k=${lq(e.k)}$, donc $${nomPoint("\\Omega", e.centre)}$ et $r=|k|=${lq(q(Math.abs(Number(e.k.n)), e.k.d))}$.`, "Piège : un rayon est toujours positif.");
      return L(`$${latexCercle(e.centre, e.r2)}$`, "Vérification : $T$ et $A$ vérifient l'équation.");
    case "E":
    case "G": {
      const t = e.triangle;
      if (p === "gSommets") return L(`On résout trois systèmes de deux équations : $${nomPoint("A", t.A)}$, $${nomPoint("B", t.B)}$, $${nomPoint("C", t.C)}$.`);
      if (p === "eCotes" || p === "gCotes") return L(`$a=BC=${t.a}$, $b=CA=${t.b}$, $c=AB=${t.c}$.`);
      if (p === "eCentre" || p === "gCentre") {
        const nom = e.famille === "G" && e.mode === "exinscrit" ? "J" : "I";
        return L(`$${nom}=${e.famille === "G" ? poidsLatex(e) : "\\dfrac{a\\,A+b\\,B+c\\,C}{a+b+c}"}$ avec $a=${t.a}$, $b=${t.b}$, $c=${t.c}$.`, `Résultat : $${nomPoint(nom, e.centre)}$.`, "Piège : ce n'est pas le centre de gravité (moyenne simple des sommets).");
      }
      return L(`$\\text{Aire}=${lq(t.aire)}$, $s=${lq(q(t.a + t.b + t.c, 2))}$.`, `${e.famille === "G" ? `$${rayonGLatex(e)}$` : "$r=\\dfrac{\\text{Aire}}{s}$"}, d'où $r=${lq(e.r)}$.`, "Vérification : la distance du centre à chaque côté vaut $r$.");
    }
    case "F":
      if (p === "fDistance") return L(`$\\text{dist}(\\Omega\\,;d)=${rayon(e.dist2)}$, soit $\\Omega H^2=${lq(e.dist2)}$.`);
      if (p === "fRayon2") return L(`$r^2=${lq(e.dist2)}+${e.L / 2}^2=${lq(e.r2)}$.`, "Piège : c'est la moitié de la corde qui entre dans Pythagore.");
      return L(`$${latexCercle(e.centre, e.r2)}$`);
  }
}

function pointLu(v: string): { x: number; y: number } | null {
  try {
    const p = lirePoint(v);
    return { x: p.x.valeur, y: p.y.valeur };
  } catch {
    return null;
  }
}
const pres = (a: number, b: number) => Math.abs(a - b) < 1e-9;

function cibleCercle(v: string, c: Pt, r2: { n: bigint; d: bigint }): FragmentConsigne[] | null {
  let poly;
  try {
    poly = lireEquation(v, ["x", "y"]).poly;
  } catch {
    return null;
  }
  const r = Math.sqrt(qNum(r2));
  const essais: [Pt, number, string][] = [
    [pt(-qNum(c.x), -qNum(c.y)), qNum(r2), "Attention aux signes : dans $(x-x_\\Omega)^2$, on soustrait l'abscisse du centre."],
    [pt(-qNum(c.x), qNum(c.y)), qNum(r2), "Attention aux signes : dans $(x-x_\\Omega)^2$, on soustrait l'abscisse du centre."],
    [pt(qNum(c.x), -qNum(c.y)), qNum(r2), "Attention aux signes : dans $(y-y_\\Omega)^2$, on soustrait l'ordonnée du centre."],
  ];
  for (const [cc, rr, m] of essais) {
    if (ptNum(cc).x === ptNum(c).x && ptNum(cc).y === ptNum(c).y) continue;
    if (proportionnels(poly, polyCercle(cc, q(rr)))) return f(m);
  }
  if (Number.isInteger(r) && r !== qNum(r2) && proportionnels(poly, polyCercle(c, q(r)))) return f("Le second membre est $r^2$, le carré du rayon, pas $r$.");
  if (Number.isInteger(qNum(qMul(r2, r2))) && proportionnels(poly, polyCercle(c, qMul(r2, r2)))) return f("Le second membre est $r^2$ : tu as élevé au carré deux fois.");
  return null;
}

function cible55(e: E, p: P, valeurs: string[]): FragmentConsigne[] | null {
  switch (e.famille) {
    case "A": {
      if (p !== "aCentreRayon") return null;
      const c = pointLu(valeurs[0]);
      if (c && pres(c.x, e.D / 2) && pres(c.y, e.E / 2) && (e.D !== 0 || e.E !== 0)) return f("Le centre est $\\left(-\\frac{D}{2}\\,;-\\frac{E}{2}\\right)$ : les signes sont opposés à ceux de $D$ et $E$.");
      try {
        if (pres(lireNombre(valeurs[1]).valeur, qNum(e.r2)) && qNum(e.r2) !== 1) return f("C'est $r^2$ : le rayon en est la racine carrée.");
      } catch {
        return null;
      }
      return null;
    }
    case "B":
      if (p === "bCentres" && e.verdict === 2 && valeurs[0].split("\n").filter((l) => l.trim()).length === 1) return f("Il manque un centre : l'équation du second degré a deux solutions.");
      return null;
    case "C":
    case "D":
    case "F":
      if (p === "cEquation" || p === "dEquation" || p === "fEquation") return cibleCercle(valeurs[0], e.centre, e.r2);
      if (p === "dCentreRayon" && e.famille === "D") {
        try {
          if (pres(lireNombre(valeurs[1]).valeur, qNum(e.k)) && qNum(e.k) < 0) return f("Un rayon est positif : $r=|k|$.");
        } catch {
          return null;
        }
      }
      if (p === "fRayon2" && e.famille === "F") {
        try {
          if (pres(lireNombre(valeurs[0]).valeur, qNum(e.dist2) + e.L * e.L)) return f("Dans Pythagore, c'est la moitié de la corde, $\\frac{L}{2}$, qui intervient.");
        } catch {
          return null;
        }
      }
      return null;
    case "E":
    case "G": {
      if (p !== "eCentre" && p !== "gCentre") return null;
      const c = pointLu(valeurs[0]);
      const t = e.triangle;
      const G = { x: (qNum(t.A.x) + qNum(t.B.x) + qNum(t.C.x)) / 3, y: (qNum(t.A.y) + qNum(t.B.y) + qNum(t.C.y)) / 3 };
      if (c && pres(c.x, G.x) && pres(c.y, G.y)) return f("C'est le centre de gravité : ici, chaque sommet est pondéré par la longueur du côté opposé.");
      return null;
    }
  }
}

// ============================================================================
// Figure
// ============================================================================

export function figure6gen55(e: E, closes: readonly P[]): string {
  const c = (ph: P) => closes.includes(ph);
  const o: ObjetsLieux = { points: [], droites: [], segments: [], cercles: [], polygones: [] };
  const pts = o.points!;
  switch (e.famille) {
    case "A":
      pts.push({ p: p2(e.A), nom: "A" }, { p: p2(e.B), nom: "B" }, { p: p2(e.C), nom: "C" });
      if (c("aCentreRayon")) {
        o.cercles!.push({ c: p2(e.centre), r: Math.sqrt(qNum(e.r2)), couleur: "vert", epais: true });
        pts.push({ p: p2(e.centre), nom: "Ω", couleur: "vert" });
      }
      o.inclure = [{ x: qNum(e.centre.x) - Math.sqrt(qNum(e.r2)), y: qNum(e.centre.y) - Math.sqrt(qNum(e.r2)) }, { x: qNum(e.centre.x) + Math.sqrt(qNum(e.r2)), y: qNum(e.centre.y) + Math.sqrt(qNum(e.r2)) }];
      break;
    case "B": {
      o.segments!.push({ a: p2(e.A), b: p2(e.B), couleur: "bleu" });
      pts.push({ p: p2(e.A), nom: "A" }, { p: p2(e.B), nom: "B" });
      if (c("bMediatrice")) o.droites!.push({ ...d3(e.mediatrice), couleur: "gris", pointilles: true });
      const r = Math.sqrt(qNum(e.r2));
      if (c("bCentres") || (c("bNombre") && e.verdict === 0)) {
        e.centres.forEach((cc, i) => {
          o.cercles!.push({ c: p2(cc), r, couleur: "vert", epais: true });
          pts.push({ p: p2(cc), nom: e.centres.length > 1 ? `Ω${i ? "₂" : "₁"}` : "Ω", couleur: "vert" });
        });
        if (e.verdict === 0) o.cercles!.push({ c: p2(e.A), r, couleur: "gris", pointilles: true });
      }
      const M = ptNum(milieu(e.A, e.B));
      o.inclure = [
        { x: M.x - r - 1, y: M.y - r - 1 },
        { x: M.x + r + 1, y: M.y + r + 1 },
      ];
      break;
    }
    case "C": {
      o.droites!.push({ ...d3(e.d), nom: "d" });
      pts.push({ p: p2(e.A), nom: "A" }, { p: p2(e.B), nom: "B" });
      if (c("cMediatrice")) o.droites!.push({ ...d3(e.mediatrice), couleur: "gris", pointilles: true });
      if (c("cCentre")) pts.push({ p: p2(e.centre), nom: "Ω", couleur: "vert" });
      const r = Math.sqrt(qNum(e.r2));
      if (c("cEquation")) o.cercles!.push({ c: p2(e.centre), r, couleur: "vert", epais: true });
      o.inclure = [
        { x: qNum(e.centre.x) - r, y: qNum(e.centre.y) - r },
        { x: qNum(e.centre.x) + r, y: qNum(e.centre.y) + r },
      ];
      break;
    }
    case "D": {
      pts.push({ p: p2(e.A), nom: "A" }, { p: p2(e.T), nom: "T", couleur: "accent" });
      o.droites!.push(e.axe === "abscisses" ? { a: 1, b: 0, c: -qNum(e.T.x), couleur: "gris", pointilles: true } : { a: 0, b: 1, c: -qNum(e.T.y), couleur: "gris", pointilles: true });
      if (c("dCentreRayon")) pts.push({ p: p2(e.centre), nom: "Ω", couleur: "vert" });
      const r = Math.abs(qNum(e.k));
      if (c("dEquation")) o.cercles!.push({ c: p2(e.centre), r, couleur: "vert", epais: true });
      o.inclure = [
        { x: qNum(e.centre.x) - r, y: qNum(e.centre.y) - r },
        { x: qNum(e.centre.x) + r, y: qNum(e.centre.y) + r },
      ];
      break;
    }
    case "E": {
      const t = e.triangle;
      o.polygones!.push({ pts: [p2(t.A), p2(t.B), p2(t.C)], couleur: "bleu" });
      pts.push({ p: p2(t.A), nom: "A" }, { p: p2(t.B), nom: "B" }, { p: p2(t.C), nom: "C" });
      if (c("eCentre")) pts.push({ p: p2(e.centre), nom: "I", couleur: "vert" });
      if (c("eRayon")) o.cercles!.push({ c: p2(e.centre), r: qNum(e.r), couleur: "vert", epais: true });
      break;
    }
    case "F": {
      o.droites!.push({ ...d3(e.d), nom: "d" });
      pts.push({ p: p2(e.centre), nom: "Ω" });
      const r = Math.sqrt(qNum(e.r2));
      if (c("fEquation")) {
        o.cercles!.push({ c: p2(e.centre), r, couleur: "vert", epais: true });
        o.segments!.push({ a: e.corde[0], b: e.corde[1], couleur: "accent", epais: true });
      }
      o.inclure = [
        { x: qNum(e.centre.x) - r, y: qNum(e.centre.y) - r },
        { x: qNum(e.centre.x) + r, y: qNum(e.centre.y) + r },
      ];
      break;
    }
    case "G": {
      const t = e.triangle;
      o.droites!.push({ ...d3(e.AB), couleur: "bleu" }, { ...d3(e.BC), couleur: "bleu" }, { ...d3(e.CA), couleur: "bleu" });
      if (c("gSommets")) pts.push({ p: p2(t.A), nom: "A" }, { p: p2(t.B), nom: "B" }, { p: p2(t.C), nom: "C" });
      if (c("gCentre")) pts.push({ p: p2(e.centre), nom: e.mode === "exinscrit" ? "J" : "I", couleur: "vert" });
      if (c("gRayon")) o.cercles!.push({ c: p2(e.centre), r: qNum(e.r), couleur: "vert", epais: true });
      const r = qNum(e.r);
      o.inclure = [p2(t.A), p2(t.B), p2(t.C), { x: qNum(e.centre.x) - r, y: qNum(e.centre.y) - r }, { x: qNum(e.centre.x) + r, y: qNum(e.centre.y) + r }];
      break;
    }
  }
  return figureLieux(o);
}
