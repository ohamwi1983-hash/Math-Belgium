import type { ExerciceMethodeGeneratrices } from "../core6e/methodeGeneratrices.types";
import type { PhaseMethodeGeneratrices } from "../moteur6e/typesMethodeGeneratrices";
import { latexN, lireEquation, polyMul, polyVar, proportionnels } from "../moteur6e/algebreLieux";
import { f } from "./fragmentsCombinatoire";
import type { AideCombi, ChampCombi, FormatCombinatoire, FragmentConsigne } from "./fragmentsCombinatoire";
import { champEquationUI } from "./textesLieux";
import { echantillonner, figureLieux } from "./figureLieux";
import type { ObjetsLieux, P2 } from "./figureLieux";

/**
 * Textes de `6gen57` — méthode des génératrices (6e ch. 9, § 5 ; audit, lots B et C) : énoncés qui
 * donnent le domaine du paramètre (et, en C, la référence de l'angle), KaTeX partout (« α » tapé ou
 * « alpha »), aides qui ne donnent jamais l'équation attendue, consignes qui ne disent pas s'il y a
 * un singulier ou un parasite, options de restriction de même forme. Figure : la configuration pour
 * UNE valeur de α (point d'intersection marqué « ? »), puis le lieu, extrémités et point exclus en
 * creux, APRÈS la dernière réponse.
 */

type E = ExerciceMethodeGeneratrices;
type P = PhaseMethodeGeneratrices;
const L = (...l: string[]): FragmentConsigne[][] => l.map((x) => f(x));
const N = latexN;
const coefLatex = (n: number) => (n === 1 ? "" : n === -1 ? "-" : `${n}`);
const moins = (v: string, n: number) => (n === 0 ? v : n > 0 ? `${v}-${n}` : `${v}+${-n}`);

export const FORMAT_6GEN57: FormatCombinatoire<E, P> = {
  consigneGenerale(e) {
    const par = e.parametre === "t" ? "$t$" : "$\\alpha$";
    return f(`Le paramètre fait bouger deux droites, les génératrices ; on cherche le lieu de leur point d'intersection. Élimine ${par} entre leurs équations, puis étudie chaque morceau obtenu.`);
  },
  donnees(e) {
    const d = e.donnees;
    switch (d.famille) {
      case "A":
        return L(`$ABCD$ est un rectangle : $A(0\\,;0)$, $B(${d.b}\\,;0)$, $C(${d.b}\\,;${d.d})$, $D(0\\,;${d.d})$.`, `Pour $\\alpha\\in\\,\\mathopen{]}0\\,;${d.d}\\mathclose{[}$, on place $Z(0\\,;\\alpha)$ sur $[AD]$ et $Y(${d.b}\\,;\\alpha)$ sur $[BC]$.`, "Lieu cherché : le point d'intersection des droites $(AY)$ et $(BZ)$ quand $\\alpha$ varie.");
      case "B":
        return L(`Triangle $ABC$ : $B(0\\,;0)$, $C(${d.c}\\,;0)$, $A(0\\,;${d.a})$.`, `Pour $\\alpha\\in\\,\\mathopen{]}0\\,;${d.a}\\mathclose{[}$, la droite $y=\\alpha$, parallèle à $(BC)$, coupe $[AB]$ en $D$ et $[AC]$ en $E$.`, "Lieu cherché : le point d'intersection des droites $(BE)$ et $(CD)$ quand $\\alpha$ varie.");
      case "C":
        return L(
          `$A(${d.h}\\,;0)$ et $B(${d.h + d.k}\\,;0)$. Par $A$ passe la droite $a$ qui fait l'angle $\\alpha$ avec l'axe des abscisses ; par $B$ passe la droite $b$ qui fait l'angle $2\\alpha$ (angles orientés, mesurés de l'axe des abscisses vers la droite).`,
          "$\\alpha\\in\\,\\mathopen{]}0^\\circ\\,;90^\\circ\\mathclose{[}$ ; on pose $t=\\tan\\alpha>0$, et $\\tan 2\\alpha=\\dfrac{2t}{1-t^2}$.",
          "Lieu cherché : le point d'intersection de $a$ et $b$ quand $\\alpha$ varie.",
        );
      case "D":
        return d.sousCas === 1
          ? L(`$B(0\\,;0)$ et $C(${d.c}\\,;0)$. Le sommet $A(\\alpha\\,;${d.h})$ parcourt la droite $y=${d.h}$ ($\\alpha\\in\\mathbb{R}$).`, "$M$ et $N$ sont les milieux de $[AB]$ et $[AC]$.", "Lieu cherché : le centre de gravité $G$, intersection des médianes $(BN)$ et $(CM)$, quand $\\alpha$ varie.")
          : L(`$B(${d.b}\\,;0)$ et $C(${d.c}\\,;0)$. Le sommet $A(0\\,;\\alpha)$ parcourt l'axe des ordonnées privé de l'origine ($\\alpha\\neq0$).`, "$M$ et $N$ sont les milieux de $[AB]$ et $[AC]$.", "Lieu cherché : le centre de gravité $G$, intersection des médianes $(BN)$ et $(CM)$, quand $\\alpha$ varie.");
      case "E":
        return L(`$A(${d.p}\\,;0)$ et $B(${d.r}\\,;0)$. Le point $C(0\\,;\\alpha)$ parcourt l'axe des ordonnées privé de l'origine ($\\alpha\\neq0$).`, "$a$ est la perpendiculaire à $(AC)$ passant par $A$, $b$ la perpendiculaire à $(BC)$ passant par $B$.", "Lieu cherché : le point d'intersection de $a$ et $b$ quand $\\alpha$ varie.");
    }
  },
  consigneEcran(e, p) {
    const d = e.donnees;
    switch (p) {
      case "generatrices":
        return e.parametre === "t" ? f("Écris une équation de chaque génératrice, en fonction de $x$, $y$ et $t$.") : f("Écris une équation de chaque génératrice, en fonction de $x$, $y$ et $\\alpha$.");
      case "elimination":
        if (d.famille === "E" && d.methode === "produitCroise") return f("Isole $\\alpha$ dans chaque équation, égale les deux expressions et chasse les dénominateurs (produit en croix), puis factorise. Écris l'équation obtenue en $x$ et $y$.");
        if (d.famille === "C") return f("Tire $t$ de l'équation de $a$, remplace-le dans celle de $b$, chasse le dénominateur, puis factorise. Écris l'équation obtenue en $x$ et $y$.");
        return e.facteurs >= 2 ? f("Élimine $\\alpha$ entre les deux équations, puis factorise : écris l'équation obtenue en $x$ et $y$, sous la forme d'un produit égal à $0$.") : f("Élimine $\\alpha$ entre les deux équations et simplifie : écris l'équation obtenue en $x$ et $y$.");
      case "statut1":
        return f(`Quel est le statut du morceau $${e.morceaux[0].latex}$ ?`);
      case "statut2":
        return f(`Quel est le statut du morceau $${e.morceaux[1].latex}$ ?`);
      case "restriction":
        return f(`Quelle partie du morceau propre est réellement décrite quand ${e.parametre === "t" ? "$\\alpha$" : "$\\alpha$"} parcourt son domaine ?`);
    }
  },
  champs(e, p): ChampCombi[] {
    switch (p) {
      case "generatrices":
        return e.noms.map((n) => champEquationUI(`$${n}$`, ["x", "y", e.parametre]));
      case "elimination":
        return [champEquationUI("Équation", ["x", "y"])];
      case "statut1":
      case "statut2":
        return [
          {
            type: "choix",
            label: "",
            options: [
              { valeur: "singulier", label: "Singulier : pour une valeur précise du paramètre, les deux génératrices sont confondues" },
              { valeur: "parasite", label: "Parasite : aucune valeur du paramètre ne donne un point de ce morceau" },
              { valeur: "propre", label: "Propre : il fait réellement partie du lieu" },
            ],
          },
        ];
      case "restriction":
        return [{ type: "choix", label: "", options: e.optionsRestriction.map((o) => ({ valeur: o.id, label: o.label })) }];
    }
  },
  aides: aides57,
  reponseAttendue(e, p) {
    switch (p) {
      case "generatrices":
        return e.generatricesLatex.map((g, i) => `${e.noms[i]}\\,:\\ ${g}`);
      case "elimination":
        return [e.elimineLatex];
      case "statut1":
        return [`${e.morceaux[0].latex}\\ :\\ \\text{${e.morceaux[0].statut}}`];
      case "statut2":
        return [`${e.morceaux[1].latex}\\ :\\ \\text{${e.morceaux[1].statut}}`];
      case "restriction":
        return [restrictionKatex(e)];
    }
  },
  explication: explication57,
  libellePhase: (_e, p) => ({ generatrices: "Génératrices", elimination: "Élimination et factorisation", statut1: "Statut du premier morceau", statut2: "Statut du second morceau", restriction: "Restriction" })[p],
  messageCible: cible57,
};

/** « la droite $x=2$ privée du point $…$ » → KaTeX (`\text{…}` pour la prose). */
function restrictionKatex(e: E): string {
  return e.restrictionLatex
    .split("$")
    .map((m, i) => (i % 2 ? m : m === "" ? "" : `\\text{${m}}`))
    .join("");
}

function aides57(e: E, p: P): AideCombi[] {
  const d = e.donnees;
  if (p === "generatrices") {
    switch (d.famille) {
      case "A":
        return [
          { texte: "Une droite qui passe par l'origine et par $(u\\,;v)$ a pour équation :", latex: "v\\,x-u\\,y=0" },
          { texte: "Vecteurs directeurs :", latex: `\\overrightarrow{AY}\\begin{pmatrix}${d.b}\\\\ \\alpha\\end{pmatrix},\\qquad\\overrightarrow{BZ}\\begin{pmatrix}-${d.b}\\\\ \\alpha\\end{pmatrix}` },
        ];
      case "B":
        return [
          { texte: "Coordonnées des points mobiles (Thalès dans le triangle) :", latex: `D(0\\,;\\alpha),\\qquad E\\left(\\frac{${d.c}(${d.a}-\\alpha)}{${d.a}}\\,;\\alpha\\right)` },
          { texte: "$(BE)$ passe par l'origine ; $(CD)$ passe par $C$ et $D$ :", latex: `\\overrightarrow{CD}\\begin{pmatrix}-${d.c}\\\\ \\alpha\\end{pmatrix}` },
        ];
      case "C":
        return [
          { texte: "Une droite qui fait l'angle $\\theta$ avec l'axe des abscisses a pour pente $\\tan\\theta$ ; et :", latex: "\\tan 2\\alpha=\\frac{2\\tan\\alpha}{1-\\tan^2\\alpha}=\\frac{2t}{1-t^2}" },
          { texte: "Chasse le dénominateur dans l'équation de $b$ :", latex: `y=\\frac{2t}{1-t^2}\\,(${moins("x", d.h + d.k)})` },
        ];
      case "D":
        return d.sousCas === 1
          ? [
              { texte: "Milieux :", latex: `M\\left(\\frac{\\alpha}{2}\\,;\\frac{${d.h}}{2}\\right),\\qquad N\\left(\\frac{\\alpha+${d.c}}{2}\\,;\\frac{${d.h}}{2}\\right)` },
              { texte: "$(BN)$ passe par l'origine et par $N$ ; $(CM)$ passe par $C$ et $M$." },
            ]
          : [
              { texte: "Milieux :", latex: `M\\left(\\frac{${d.b}}{2}\\,;\\frac{\\alpha}{2}\\right),\\qquad N\\left(\\frac{${d.c}}{2}\\,;\\frac{\\alpha}{2}\\right)` },
              { texte: "$(BN)$ passe par $B$ et $N$ ; $(CM)$ passe par $C$ et $M$." },
            ];
      case "E":
        return [
          { texte: "La perpendiculaire à $(AC)$ passant par $A$ a $\\overrightarrow{AC}$ pour vecteur normal :", latex: "x_{\\overrightarrow{AC}}(x-x_A)+y_{\\overrightarrow{AC}}(y-y_A)=0" },
          { texte: "Ici :", latex: `\\overrightarrow{AC}\\begin{pmatrix}${-d.p}\\\\ \\alpha\\end{pmatrix},\\qquad\\overrightarrow{BC}\\begin{pmatrix}${-d.r}\\\\ \\alpha\\end{pmatrix}` },
        ];
    }
  }
  if (p === "elimination") {
    if (d.famille === "C")
      return [
        { texte: "De l'équation de $a$ :", latex: `t=\\frac{y}{${moins("x", d.h)}}` },
        { texte: `Remplace, puis multiplie les deux membres par $(${moins("x", d.h)})^2$.` },
      ];
    const memeTerme = (d.famille === "D" && d.sousCas === 1) || (d.famille === "E" && d.methode === "soustraction");
    if (memeTerme)
      return [
        { texte: "Les deux équations contiennent le même terme en $\\alpha$ : soustrais-les membre à membre, $\\alpha$ disparaît." },
        { texte: "Écris-les d'abord avec le terme en $\\alpha$ seul dans le premier membre :", latex: e.generatricesLatex.join("\\qquad ") },
      ];
    return [
      { texte: "Les coefficients de $\\alpha$ sont différents : isole $\\alpha$ dans chaque équation, égale les deux expressions et fais le produit en croix." },
      { texte: "Garde tous les facteurs, n'en simplifie aucun : chacun sera un morceau à étudier." },
    ];
  }
  if (p === "statut1" || p === "statut2")
    return [
      { texte: "Un morceau est singulier si les deux génératrices sont confondues pour une valeur du paramètre, parasite si aucune valeur du paramètre ne donne ses points, propre sinon." },
      { texte: `Remplace l'équation du morceau dans les deux génératrices : pour quelle valeur du paramètre sont-elles vérifiées par tous ses points ? par aucun ?` },
    ];
  const coord = (() => {
    switch (d.famille) {
      case "A":
        return `\\left(\\frac{${d.b}}{2}\\,;\\frac{\\alpha}{2}\\right)`;
      case "B":
        return `\\left(\\frac{${d.c}(${d.a}-\\alpha)}{${2 * d.a}-\\alpha}\\,;\\ \\dots\\right)`;
      case "C":
        return `\\left(${d.h === 0 ? "" : `${d.h}+`}\\dfrac{${2 * d.k}}{1+t^2}\\,;\\dfrac{${2 * d.k}t}{1+t^2}\\right)`;
      case "D":
        return d.sousCas === 1 ? `\\left(\\frac{\\alpha+${d.c}}{3}\\,;\\frac{${d.h}}{3}\\right)` : `\\left(\\frac{${d.b + d.c}}{3}\\,;\\frac{\\alpha}{3}\\right)`;
      case "E":
        return `\\left(${d.p + d.r}\\,;\\frac{${d.p * d.r}}{\\alpha}\\right)`;
    }
  })();
  return [
    { texte: "Exprime les coordonnées du point d'intersection en fonction du paramètre, puis regarde ce qu'elles deviennent quand le paramètre parcourt son domaine (bornes exclues, valeurs interdites)." },
    { texte: "Le point d'intersection :", latex: coord },
  ];
}

function explication57(e: E, p: P): FragmentConsigne[][] {
  const d = e.donnees;
  switch (p) {
    case "generatrices":
      return L(...e.generatricesLatex.map((g, i) => `$${e.noms[i]}\\,:\\ ${g}$`), "Toute équation proportionnelle est juste aussi.");
    case "elimination":
      return L(`On obtient $${e.elimineLatex}$.`, e.facteurs >= 2 ? "Chaque facteur est un morceau à étudier : on ne divise jamais par un facteur qui contient $x$ ou $y$ (il pourrait être nul)." : "La constante qui reste en facteur n'est pas nulle : on peut la simplifier.");
    case "statut1":
    case "statut2": {
      const m = e.morceaux[p === "statut1" ? 0 : 1];
      if (m.statut === "singulier") return L(`Pour ${d.famille === "C" ? "$\\alpha=0$ (soit $t=0$)" : "$\\alpha=0$"}, les deux génératrices sont toutes deux la droite $y=0$ : elles sont confondues.`, `Le morceau $${m.latex}$ est singulier : il ne fait pas partie du lieu.`);
      if (m.statut === "parasite" && d.famille === "C") return L(`Un point de $y=0$ vérifierait $t(${moins("x", d.h)})=0$, donc $x=${d.h}$ (car $t>0$), et $2t(${moins("x", d.h + d.k)})=0$, donc $x=${d.h + d.k}$ : impossible.`, "Aucune valeur de $\\alpha$ ne donne ces points : le morceau $y=0$ est parasite (il vient de la multiplication par un dénominateur).");
      if (m.statut === "parasite" && d.famille === "E") return L(`Un point de $y=0$ vérifierait $0=${coefLatex(d.p)}(${moins("x", d.p)})$ et $0=${coefLatex(d.r)}(${moins("x", d.r)})$, donc $x=${d.p}$ et $x=${d.r}$ en même temps : impossible.`, "Aucune valeur de $\\alpha$ ne donne ces points : le morceau $y=0$ est parasite (il vient du produit en croix).");
      return L(`Le morceau $${m.latex}$ est propre : pour chaque valeur du paramètre, le point d'intersection est sur ce morceau.`);
    }
    case "restriction":
      return L(`Réponse : ${e.restrictionLatex}.`, ...(d.famille === "C" ? [`Le point d'intersection est $\\left(${d.h === 0 ? "" : `${d.h}+`}\\dfrac{${2 * d.k}}{1+t^2}\\,;\\dfrac{${2 * d.k}t}{1+t^2}\\right)$ : $y>0$, et $x$ parcourt $\\mathopen{]}${d.h}\\,;${d.h + 2 * d.k}\\mathclose{[}$ quand $t$ parcourt $\\mathopen{]}0\\,;+\\infty\\mathclose{[}$ ; les extrémités $A$ et $(${d.h + 2 * d.k}\\,;0)$ ne sont jamais atteintes.`] : d.famille === "E" ? [`Le point $(${d.p + d.r}\\,;0)$ demanderait un $\\alpha$ infini : il n'est jamais atteint.`] : d.famille === "D" && d.sousCas === 2 ? [`Le point $(${N((d.b + d.c) / 3)}\\,;0)$ correspondrait à $\\alpha=0$, interdit (triangle aplati).`] : d.famille === "D" ? ["Quand $\\alpha$ parcourt $\\mathbb{R}$, l'abscisse de $G$ prend toutes les valeurs."] : ["Aux bornes du domaine, le point d'intersection tend vers les extrémités, sans les atteindre."]));
  }
}

function cible57(e: E, p: P, valeurs: string[]): FragmentConsigne[] | null {
  if (p !== "elimination") return null;
  const d = e.donnees;
  let poly;
  try {
    poly = lireEquation(valeurs[0], ["x", "y"]).poly;
  } catch {
    return null;
  }
  // Facteur y supprimé (D2, A, B, C, E par produit en croix).
  if (e.facteurs >= 2 && e.morceaux[0].latex === "y=0") {
    const sansY = lireEquation(e.elimineTexte.replace(/^y/, ""), ["x", "y"]).poly;
    if (proportionnels(poly, sansY)) return f("Tu as divisé par $y$ : c'est interdit quand $y$ peut être nul. Garde le facteur $y$ : on étudiera ensuite le morceau $y=0$.");
  }
  if (d.famille === "E" && d.methode === "soustraction" && proportionnels(poly, polyMul(polyVar("y"), e.elimine))) return f("Les deux équations ont le même terme $\\alpha y$ : soustrais-les. Le produit en croix ferait apparaître un facteur $y$ en trop.");
  return null;
}

// ============================================================================
// Figure
// ============================================================================

function inter(p1: P2, u1: P2, p2: P2, u2: P2): P2 | null {
  const det = u1.x * -u2.y - u1.y * -u2.x;
  if (Math.abs(det) < 1e-12) return null;
  const t = ((p2.x - p1.x) * -u2.y - (p2.y - p1.y) * -u2.x) / det;
  return { x: p1.x + t * u1.x, y: p1.y + t * u1.y };
}
const droite = (p: P2, u: P2) => ({ a: -u.y, b: u.x, c: u.y * p.x - u.x * p.y });

export function figure6gen57(e: E, closes: readonly P[]): string {
  const fini = closes.includes("restriction");
  const d = e.donnees;
  const o: ObjetsLieux = { points: [], droites: [], segments: [], polygones: [], cercles: [], courbes: [] };
  const pts = o.points!;
  const g = (p: P2, u: P2) => o.droites!.push({ ...droite(p, u), couleur: "gris", pointilles: true });
  let M: P2 | null = null;
  switch (d.famille) {
    case "A": {
      o.polygones!.push({ pts: [{ x: 0, y: 0 }, { x: d.b, y: 0 }, { x: d.b, y: d.d }, { x: 0, y: d.d }], couleur: "bleu" });
      const al = (d.d * 2) / 3;
      const Z = { x: 0, y: al };
      const Y = { x: d.b, y: al };
      o.segments!.push({ a: { x: 0, y: 0 }, b: Y, couleur: "gris", pointilles: true }, { a: { x: d.b, y: 0 }, b: Z, couleur: "gris", pointilles: true });
      pts.push({ p: { x: 0, y: 0 }, nom: "A" }, { p: { x: d.b, y: 0 }, nom: "B" }, { p: { x: d.b, y: d.d }, nom: "C" }, { p: { x: 0, y: d.d }, nom: "D" }, { p: Z, nom: "Z", couleur: "gris" }, { p: Y, nom: "Y", couleur: "gris" });
      M = { x: d.b / 2, y: al / 2 };
      if (fini) o.segments!.push({ a: { x: d.b / 2, y: 0 }, b: { x: d.b / 2, y: d.d / 2 }, couleur: "vert", epais: true });
      if (fini) pts.push({ p: { x: d.b / 2, y: 0 }, creux: true, couleur: "vert" }, { p: { x: d.b / 2, y: d.d / 2 }, creux: true, couleur: "vert" });
      break;
    }
    case "B": {
      const A = { x: 0, y: d.a };
      const B = { x: 0, y: 0 };
      const C = { x: d.c, y: 0 };
      o.polygones!.push({ pts: [A, B, C], couleur: "bleu" });
      const al = d.a / 2;
      const D = { x: 0, y: al };
      const E2 = { x: (d.c * (d.a - al)) / d.a, y: al };
      o.segments!.push({ a: B, b: E2, couleur: "gris", pointilles: true }, { a: C, b: D, couleur: "gris", pointilles: true }, { a: D, b: E2, couleur: "gris" });
      pts.push({ p: A, nom: "A" }, { p: B, nom: "B" }, { p: C, nom: "C" }, { p: D, nom: "D", couleur: "gris" }, { p: E2, nom: "E", couleur: "gris" });
      M = inter(B, E2, C, { x: D.x - C.x, y: D.y - C.y });
      if (fini) {
        o.segments!.push({ a: { x: d.c / 2, y: 0 }, b: A, couleur: "vert", epais: true });
        pts.push({ p: { x: d.c / 2, y: 0 }, creux: true, couleur: "vert" }, { p: A, creux: true, couleur: "vert" });
      }
      break;
    }
    case "C": {
      const A = { x: d.h, y: 0 };
      const B = { x: d.h + d.k, y: 0 };
      const al = (35 * Math.PI) / 180;
      g(A, { x: Math.cos(al), y: Math.sin(al) });
      g(B, { x: Math.cos(2 * al), y: Math.sin(2 * al) });
      pts.push({ p: A, nom: "A" }, { p: B, nom: "B" });
      M = { x: d.h + d.k + d.k * Math.cos(2 * al), y: d.k * Math.sin(2 * al) };
      o.inclure = [
        { x: d.h + d.k - d.k, y: -d.k },
        { x: d.h + 2 * d.k, y: d.k },
      ];
      if (fini) {
        o.cercles!.push({ c: B, r: d.k, couleur: "gris", pointilles: true });
        o.courbes!.push({ pts: echantillonner((u) => ({ x: B.x + d.k * Math.cos(u), y: d.k * Math.sin(u) }), 0, Math.PI), couleur: "vert", epais: true });
        pts.push({ p: { x: d.h + 2 * d.k, y: 0 }, creux: true, couleur: "vert" }, { p: A, creux: true, couleur: "vert" });
      }
      break;
    }
    case "D": {
      if (d.sousCas === 1) {
        const B = { x: 0, y: 0 };
        const C = { x: d.c, y: 0 };
        const A = { x: 1, y: d.h };
        o.droites!.push({ a: 0, b: 1, c: -d.h, couleur: "gris", pointilles: true });
        o.polygones!.push({ pts: [A, B, C], couleur: "bleu" });
        const Mm = { x: A.x / 2, y: A.y / 2 };
        const Nn = { x: (A.x + C.x) / 2, y: A.y / 2 };
        o.segments!.push({ a: B, b: Nn, couleur: "gris", pointilles: true }, { a: C, b: Mm, couleur: "gris", pointilles: true });
        pts.push({ p: A, nom: "A" }, { p: B, nom: "B" }, { p: C, nom: "C" });
        M = { x: (A.x + C.x) / 3, y: d.h / 3 };
        if (fini) o.droites!.push({ a: 0, b: 1, c: -d.h / 3, couleur: "vert", epais: true });
      } else {
        const B = { x: d.b, y: 0 };
        const C = { x: d.c, y: 0 };
        const A = { x: 0, y: 3 };
        o.polygones!.push({ pts: [A, B, C], couleur: "bleu" });
        const Mm = { x: B.x / 2, y: 1.5 };
        const Nn = { x: C.x / 2, y: 1.5 };
        o.segments!.push({ a: B, b: Nn, couleur: "gris", pointilles: true }, { a: C, b: Mm, couleur: "gris", pointilles: true });
        pts.push({ p: A, nom: "A" }, { p: B, nom: "B" }, { p: C, nom: "C" });
        M = { x: (d.b + d.c) / 3, y: 1 };
        if (fini) {
          o.droites!.push({ a: 1, b: 0, c: -(d.b + d.c) / 3, couleur: "vert", epais: true });
          pts.push({ p: { x: (d.b + d.c) / 3, y: 0 }, creux: true, couleur: "vert" });
        }
      }
      break;
    }
    case "E": {
      const A = { x: d.p, y: 0 };
      const B = { x: d.r, y: 0 };
      const al = 3;
      const C = { x: 0, y: al };
      g(A, { x: al, y: d.p });
      g(B, { x: al, y: d.r });
      o.segments!.push({ a: A, b: C, couleur: "bleu" }, { a: B, b: C, couleur: "bleu" });
      pts.push({ p: A, nom: "A" }, { p: B, nom: "B" }, { p: C, nom: "C", couleur: "gris" });
      M = { x: d.p + d.r, y: (d.p * d.r) / al };
      if (fini) {
        o.droites!.push({ a: 1, b: 0, c: -(d.p + d.r), couleur: "vert", epais: true });
        pts.push({ p: { x: d.p + d.r, y: 0 }, creux: true, couleur: "vert" });
      }
      break;
    }
  }
  if (M) pts.push({ p: M, nom: fini ? undefined : "?", couleur: "accent" });
  return figureLieux(o);
}
