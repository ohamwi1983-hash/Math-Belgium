import type { ExerciceIntersectionA, ExerciceIntersectionB, ExerciceIntersectionsConiques } from "../core6e/intersectionsConiques.types";
import type { PhaseIntersectionsConiques } from "../moteur6e/typesIntersectionsConiques";
import { latexDroite, latexPoint, latexQ, latexSomme, lireEquation, lirePoint, milieu, polyCoef, proportionnels, ptNum, q, qNum, qSub } from "../moteur6e/algebreLieux";
import { c2Conique, latexConique, polyConique } from "../moteur6e/algebreConiques";
import type { Conique } from "../moteur6e/algebreConiques";
import { polyCercleB, polyEquationX } from "../moteur6e/verificationIntersectionsConiques";
import { f } from "./fragmentsCombinatoire";
import type { AideCombi, ChampCombi, FormatCombinatoire, FragmentConsigne } from "./fragmentsCombinatoire";
import { champDroiteUI, champEquationUI, champListePointsUI, champNombreUI, champPointUI, d3, nomPoint, PH_POINT } from "./textesLieux";
import { EXACT, L, eqPoly } from "./textesConiques";
import { figureLieux } from "./figureLieux";
import { ajouterConique, fenetreConique, objetsVides } from "./traceConiques";

/**
 * Textes de `6gen61` — Intersection d'une conique et d'une droite (6e ch. 10, § 4 ; audit, lots B et C).
 * Conique « de centre O, d'axes les axes du repère » dite en toutes lettres (I1), données en prose
 * (plus rien de coupé à 680 px, P4), exemples de champ de FORMAT seulement (I3), aides en KaTeX (I2),
 * figure : la droite n'est tracée qu'APRÈS le nombre de points communs.
 */

type E = ExerciceIntersectionsConiques;
type P = PhaseIntersectionsConiques;

const NATURE = { ellipse: "une ellipse", hyperbole: "une hyperbole", cercle: "un cercle" } as const;

const yEgal = (e: ExerciceIntersectionA) => `y=${latexSomme([
  [e.m, "x"],
  [e.k, ""],
])}`;
const delta = (eq: [bigint, bigint, bigint]) => eq[1] * eq[1] - 4n * eq[0] * eq[2];

function donneesConique(e: ExerciceIntersectionA): string {
  if (e.nature === "cercle") return `$\\Gamma$ est le cercle de centre $O$ qui passe par $${nomPoint("S", e.S)}$.`;
  return `$\\Gamma$ est ${NATURE[e.nature]} de centre $O$ dont les axes de symétrie sont les axes du repère ; $${nomPoint("S", e.S)}$ est un sommet et $${nomPoint("F", e.F!)}$ un foyer.`;
}
function donneesDroite(e: ExerciceIntersectionA): string {
  const ab = `$${nomPoint("A", e.A)}$ et $${nomPoint("B", e.B)}$`;
  if (e.sousTypeDroite === "deuxPoints") return `$d$ est la droite $(AB)$, avec ${ab}.`;
  if (e.sousTypeDroite === "mediatrice") return `$d$ est la médiatrice du segment $[AB]$, avec ${ab}.`;
  return `$d$ est la hauteur issue de $C$ du triangle $ABC$, avec ${ab} et $${nomPoint("C", e.C!)}$.`;
}
function c1Latex(e: ExerciceIntersectionB): string {
  return `y=${latexSomme([
    [q(1), "x^2"],
    [q(e.b1), "x"],
    [q(e.c1), ""],
  ])}`;
}
function c2Latex(e: ExerciceIntersectionB): string {
  return `${latexSomme([
    [q(e.A2), "x^2"],
    [q(e.B2), "y^2"],
    [q(e.D2), "x"],
    [q(e.E2), "y"],
    [q(e.F2), ""],
  ])}=0`;
}
function c1Nul(e: ExerciceIntersectionB): string {
  return latexSomme([
    [q(1), "x^2"],
    [q(e.b1), "x"],
    [q(-1), "y"],
    [q(e.c1), ""],
  ]);
}

export const FORMAT_6GEN61: FormatCombinatoire<E, P> = {
  consigneGenerale(e) {
    if (e.famille === "A") return f("On cherche les points communs à une conique $\\Gamma$ et à une droite $d$." + EXACT);
    return f("La parabole $C_1$ et l'ellipse $C_2$ ci-dessous se coupent en plusieurs points. Montre, sans résoudre le système, que ces points sont sur un même cercle, puis détermine ce cercle." + EXACT);
  },
  donnees(e) {
    if (e.famille === "A") return [f(donneesConique(e)), f(donneesDroite(e))];
    return [f(`$C_1\\,:\\ ${c1Latex(e)}$`), f(`$C_2\\,:\\ ${c2Latex(e)}$`)];
  },
  consigneEcran(e, p) {
    switch (p) {
      case "aConique":
        return f("Écris une équation de la conique $\\Gamma$.");
      case "aDroite":
        return f("Écris une équation de la droite $d$.");
      case "aEquationX":
        return f("Remplace $y$ dans l'équation de $\\Gamma$ par son expression tirée de l'équation de $d$ : écris l'équation du second degré en $x$ obtenue.");
      case "aNombre":
        return f("Combien de points communs ont $\\Gamma$ et $d$ ?");
      case "aPoints":
        return f("Donne les coordonnées de chaque point commun (un par ligne).");
      case "bCouple":
        return e.famille === "B" ? f(`On écrit $C_1\\,:\\ ${c1Nul(e)}=0$. Pour quels nombres $\\lambda$ et $\\mu$ (non nuls tous les deux) l'équation $\\lambda\\cdot C_1+\\mu\\cdot C_2=0$ est-elle celle d'un cercle ? Donne un couple $(\\lambda\\,;\\mu)$.`) : [];
      case "bCercle":
        return f("Écris l'équation du cercle obtenu avec ce couple.");
      case "bCentreRayon":
        return f("Donne le centre $\\Omega$ et le rayon $r$ de ce cercle.");
    }
  },
  champs(_e, p): ChampCombi[] {
    switch (p) {
      case "aConique":
        return [champEquationUI("Équation de $\\Gamma$")];
      case "aDroite":
        return [champDroiteUI("Équation de $d$")];
      case "aEquationX":
        return [champEquationUI("Équation en $x$", ["x"])];
      case "aNombre":
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
      case "aPoints":
        return [champListePointsUI("Points communs")];
      case "bCouple":
        return [{ type: "texte", label: "$(\\lambda\\,;\\mu)$", placeholder: PH_POINT }];
      case "bCercle":
        return [champEquationUI("Équation du cercle")];
      case "bCentreRayon":
        return [champPointUI("Centre $\\Omega$"), champNombreUI("Rayon $r$")];
    }
  },
  aides: aides61,
  reponseAttendue: reponse61,
  explication: explication61,
  libellePhase: (_e, p) => LIBELLES[p],
  messageCible: cible61,
};

const LIBELLES: Record<P, string> = {
  aConique: "Équation de Γ",
  aDroite: "Équation de d",
  aEquationX: "Équation en x",
  aNombre: "Nombre de points communs",
  aPoints: "Points communs",
  bCouple: "Couple (λ ; μ)",
  bCercle: "Équation du cercle",
  bCentreRayon: "Centre et rayon",
};

function aideConique(c: Conique): AideCombi[] {
  if (c.type === "cercle") return [{ texte: "Cercle de centre $O$ et de rayon $r$ :", latex: "x^2+y^2=r^2" }, { texte: "Ici :", latex: `r^2=OS^2=${latexQ(c.r2)}` }];
  const rel = c.type === "ellipse" ? "b^2=a^2-c^2" : "b^2=c^2-a^2";
  return [
    { texte: `$a$ est la distance du centre au sommet, $c$ celle du centre au foyer, puis ${c.type === "ellipse" ? "pour une ellipse" : "pour une hyperbole"} :`, latex: rel },
    { texte: "Ici, l'axe focal est celui de $S$ et $F$ :", latex: `a=OS=${Math.round(Math.sqrt(qNum((c as Extract<Conique, { a2: unknown }>).a2)))},\\quad c=OF=${Math.round(Math.sqrt(qNum(c2Conique(c as Extract<Conique, { type: "ellipse" | "hyperbole" }>))))}` },
  ];
}

function aides61(e: E, p: P): AideCombi[] {
  if (e.famille === "A") {
    switch (p) {
      case "aConique":
        return aideConique(e.conique);
      case "aDroite": {
        const AB = { x: qSub(e.B.x, e.A.x), y: qSub(e.B.y, e.A.y) };
        const vAB = `\\overrightarrow{AB}\\begin{pmatrix}${latexQ(AB.x)}\\\\ ${latexQ(AB.y)}\\end{pmatrix}`;
        if (e.sousTypeDroite === "deuxPoints") return [{ texte: "Pente de la droite $(AB)$ :", latex: "m=\\dfrac{y_B-y_A}{x_B-x_A}" }, { texte: "Ici :", latex: vAB }];
        if (e.sousTypeDroite === "mediatrice") return [{ texte: "La médiatrice de $[AB]$ passe par le milieu $M$ de $[AB]$ et a $\\overrightarrow{AB}$ pour vecteur normal." }, { texte: "Ici :", latex: `M${latexPoint(milieu(e.A, e.B))},\\quad ${vAB}` }];
        return [{ texte: "La hauteur issue de $C$ passe par $C$ et est perpendiculaire à $(AB)$ : $\\overrightarrow{AB}$ en est un vecteur normal." }, { texte: "Ici :", latex: `C${latexPoint(e.C!)},\\quad ${vAB}` }];
      }
      case "aEquationX":
        return [{ texte: "Isole $y$ dans l'équation de $d$, remplace-le dans celle de $\\Gamma$, développe, puis multiplie par un dénominateur commun." }, { texte: "Ici :", latex: yEgal(e) }];
      case "aNombre":
        return [{ texte: "Pour une équation du second degré : $\\Delta>0$, deux points ; $\\Delta=0$, un seul (la droite est tangente) ; $\\Delta<0$, aucun." }, { texte: "L'équation obtenue :", latex: eqPoly(polyEquationX(e.eq), ["x"]) }];
      default:
        return [{ texte: "Résous l'équation en $x$, puis calcule l'ordonnée avec l'équation de $d$." }, { texte: "Ici :", latex: `\\Delta=${delta(e.eq)}` }];
    }
  }
  switch (p) {
    case "bCouple":
      return [{ texte: "Une équation de cercle a des coefficients de $x^2$ et de $y^2$ égaux (et aucun terme en $xy$)." }, { texte: "Dans $\\lambda\\cdot C_1+\\mu\\cdot C_2$ :", latex: `x^2\\ :\\ \\lambda+${e.A2}\\mu,\\qquad y^2\\ :\\ ${e.B2}\\mu` }];
    case "bCercle":
      return [{ texte: "Remplace $\\lambda$ et $\\mu$, développe et réduis, puis divise par le coefficient de $x^2$." }, { texte: "Avec le couple :", latex: `(\\lambda\\,;\\mu)=(${e.lambda}\\,;${e.mu})` }];
    default:
      return [{ texte: "Complète les carrés :", latex: "x^2+y^2-2hx-2ky+c=0\\iff(x-h)^2+(y-k)^2=h^2+k^2-c" }, { texte: "L'équation du cercle :", latex: eqPoly(polyCercleB(e)) }];
  }
}

function reponse61(e: E, p: P): string[] {
  if (e.famille === "A") {
    switch (p) {
      case "aConique":
        return [latexConique(e.conique)];
      case "aDroite":
        return [yEgal(e)];
      case "aEquationX":
        return [eqPoly(polyEquationX(e.eq), ["x"])];
      case "aNombre":
        return [`\\text{${["aucun", "un seul", "deux"][e.verdict]}}`];
      default:
        return e.points.map(latexPoint);
    }
  }
  switch (p) {
    case "bCouple":
      return [`(\\lambda\\,;\\mu)=(${e.lambda}\\,;${e.mu})`, "\\text{ou tout couple proportionnel}"];
    case "bCercle":
      return [eqPoly(polyCercleB(e))];
    default:
      return [`\\Omega${latexPoint(e.centre)}`, `r=${e.rayon}`];
  }
}

function explication61(e: E, p: P): FragmentConsigne[][] {
  if (e.famille === "A") {
    switch (p) {
      case "aConique":
        return L(`$${latexConique(e.conique)}$.`, e.conique.type === "cercle" ? "Le rayon est la distance $OS$." : "Piège : $a^2$ va sous le carré de la variable de l'axe focal (celui de $S$ et $F$).");
      case "aDroite":
        return L(`$d\\,:\\ ${yEgal(e)}$, soit $${latexDroite(e.droite)}$.`);
      case "aEquationX":
        return L(`On remplace $y$ par $${latexSomme([[e.m, "x"], [e.k, ""]])}$ dans l'équation de $\\Gamma$, on développe et on multiplie par un dénominateur commun : $${eqPoly(polyEquationX(e.eq), ["x"])}$.`, "Toute équation proportionnelle convient.");
      case "aNombre": {
        const d = delta(e.eq);
        return L(`$\\Delta=(${e.eq[1]})^2-4\\cdot${e.eq[0]}\\cdot(${e.eq[2]})=${d}$ : ${d > 0n ? "$\\Delta>0$, deux points communs" : d === 0n ? "$\\Delta=0$, un seul point commun : $d$ est tangente à $\\Gamma$" : "$\\Delta<0$, aucun point commun"}.`, "Piège : le signe de $\\Delta$ ne dépend pas du facteur par lequel on a multiplié l'équation.");
      }
      default:
        return L(`Les solutions de l'équation donnent les abscisses ; l'équation de $d$ donne les ordonnées : ${e.points.map((P) => `$${latexPoint(P)}$`).join(" et ")}.`, "Vérification : chaque point vérifie l'équation de $\\Gamma$ et celle de $d$.");
    }
  }
  switch (p) {
    case "bCouple":
      return L(`Il faut $\\lambda+${e.A2}\\mu=${e.B2}\\mu$, soit $\\lambda=${e.lambda}\\,\\mu$ : par exemple $(\\lambda\\,;\\mu)=(${e.lambda}\\,;${e.mu})$.`, "Tout point commun à $C_1$ et $C_2$ annule $C_1$ et $C_2$, donc aussi $\\lambda\\cdot C_1+\\mu\\cdot C_2$ : il est sur ce cercle.");
    case "bCercle":
      return L(`On développe et on divise par $${e.B2}$ : $${eqPoly(polyCercleB(e))}$.`);
    default:
      return L(`En complétant les carrés : $(x${qNum(e.centre.x) < 0 ? "+" : "-"}${Math.abs(qNum(e.centre.x))})^2+(y${qNum(e.centre.y) < 0 ? "+" : "-"}${Math.abs(qNum(e.centre.y))})^2=${e.rayon * e.rayon}$ : $\\Omega${latexPoint(e.centre)}$ et $r=${e.rayon}$.`, "Piège : le second membre est $r^2$, pas $r$.");
  }
}

function cible61(e: E, p: P, v: string[]): FragmentConsigne[] | null {
  if (e.famille !== "A") return null;
  if (p === "aConique" && (e.conique.type === "ellipse" || e.conique.type === "hyperbole")) {
    try {
      const poly = lireEquation(v[0], ["x", "y"]).poly;
      const ech: Conique = { ...e.conique, axe: e.conique.axe === "x" ? "y" : "x" };
      if (proportionnels(poly, polyConique(ech))) return f("$a^2$ et $b^2$ sont échangés : l'axe focal est celui du sommet et du foyer donnés.");
      const autre: Conique = { ...e.conique, type: e.conique.type === "ellipse" ? "hyperbole" : "ellipse" };
      if (proportionnels(poly, polyConique(autre))) return f(e.conique.type === "ellipse" ? "Le foyer est entre le centre et le sommet : c'est une ellipse." : "Le foyer est au-delà du sommet : c'est une hyperbole.");
    } catch {
      return null;
    }
  }
  if (p === "aEquationX") {
    try {
      const poly = lireEquation(v[0], ["x"]).poly;
      if (polyCoef(poly, { x: 2 }).n === 0n) return f("L'équation obtenue est du second degré : $y^2$ donne un terme en $x^2$.");
    } catch {
      return null;
    }
  }
  if (p === "aPoints" && e.points.length === 2 && v[0].split("\n").filter((l) => l.trim()).length === 1) return f("Il manque un point : l'équation a deux solutions.");
  if (p === "aPoints") {
    try {
      const lus = v[0].split("\n").filter((l) => l.trim()).map((l) => lirePoint(l));
      const surD = lus.every((P) => Math.abs(P.y.valeur - (qNum(e.m) * P.x.valeur + qNum(e.k))) < 1e-9);
      if (!surD) return f("Calcule l'ordonnée de chaque point avec l'équation de $d$ : chaque point est sur $d$.");
    } catch {
      return null;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Figure
// ---------------------------------------------------------------------------

export function figure6gen61(e: E, closes: readonly P[]): string {
  const o = objetsVides();
  if (e.famille === "A") {
    const autres = [ptNum(e.S), ...(e.F ? [ptNum(e.F)] : [])];
    const verdictJuge = closes.includes("aNombre");
    if (verdictJuge) autres.push(ptNum(e.A), ptNum(e.B), ...(e.C ? [ptNum(e.C)] : []));
    const fen = fenetreConique(e.conique, autres);
    if (closes.includes("aConique")) ajouterConique(o, e.conique, Math.max(fen.xmax - fen.xmin, fen.ymax - fen.ymin), { couleur: "bleu" });
    o.points.push({ p: ptNum(e.S), nom: "S" });
    if (e.F) o.points.push({ p: ptNum(e.F), nom: "F", couleur: "accent" });
    if (verdictJuge) {
      o.droites.push({ ...d3(e.droite), couleur: "vert", epais: true, nom: "d" });
      o.points.push({ p: ptNum(e.A), nom: "A" }, { p: ptNum(e.B), nom: "B" });
      if (e.C) o.points.push({ p: ptNum(e.C), nom: "C" });
    }
    if (closes.includes("aPoints")) e.points.forEach((P, i) => o.points.push({ p: ptNum(P), nom: e.points.length > 1 ? `I${i ? "₂" : "₁"}` : "I", couleur: "vert" }));
    else if (verdictJuge) e.points.forEach((P) => o.points.push({ p: ptNum(P), nom: "?", couleur: "vert" }));
    o.fenetre = fen;
    return figureLieux(o);
  }
  // B : parabole et ellipse, puis le cercle trouvé.
  const parab: Conique = { type: "parabole", sommet: { x: q(-e.b1, 2), y: q(4 * e.c1 - e.b1 * e.b1, 4) }, axe: "y", sens: 1, p: q(1, 2) };
  const hx = q(-e.D2, 2 * e.A2);
  const hy = q(-e.E2, 2 * e.B2);
  const M = -e.F2 + (e.D2 * e.D2) / (4 * e.A2) + (e.E2 * e.E2) / (4 * e.B2);
  const ellipse: Conique | null = M > 0 ? (e.A2 < e.B2 ? { type: "ellipse", centre: { x: hx, y: hy }, axe: "x", a2: q(Math.round(M * 4 * e.A2 * e.B2), 4 * e.A2 * e.A2 * e.B2), b2: q(Math.round(M * 4 * e.A2 * e.B2), 4 * e.A2 * e.B2 * e.B2) } : { type: "ellipse", centre: { x: hx, y: hy }, axe: "y", a2: q(Math.round(M * 4 * e.A2 * e.B2), 4 * e.A2 * e.B2 * e.B2), b2: q(Math.round(M * 4 * e.A2 * e.B2), 4 * e.A2 * e.A2 * e.B2) }) : null;
  const cercle: Conique = { type: "cercle", centre: e.centre, r2: q(e.rayon * e.rayon) };
  const fen = fenetreConique(cercle, ellipse ? [ptNum(ellipse.type === "ellipse" ? ellipse.centre : e.centre)] : []);
  const ext = Math.max(fen.xmax - fen.xmin, fen.ymax - fen.ymin);
  ajouterConique(o, parab, ext, { couleur: "bleu", epais: false });
  if (ellipse) ajouterConique(o, ellipse, ext, { couleur: "violet", epais: false });
  if (closes.includes("bCercle")) ajouterConique(o, cercle, ext, { couleur: "vert" });
  if (closes.includes("bCentreRayon")) o.points.push({ p: ptNum(e.centre), nom: "Ω", couleur: "vert" });
  o.fenetre = fen;
  return figureLieux(o);
}

