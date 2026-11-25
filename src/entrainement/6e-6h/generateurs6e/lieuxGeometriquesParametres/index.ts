import type { ExerciceLieuxGeometriquesParametres, OptionLieu, SousTypeLieux } from "../../core6e/lieuxGeometriquesParametres.types";
import {
  droiteNormalisee,
  latexDroite,
  latexN,
  latexPoly,
  latexQ,
  latexRacine,
  latexSomme,
  lireEquation,
  melanger,
  polyAdd,
  polyConst,
  polyMul,
  polyScal,
  polySub,
  polyVar,
  pt,
  q,
  qDiv,
  qMul,
  qNum,
  qSub,
  tirerEntier,
  tirerParmi,
} from "../../moteur6e/algebreLieux";
import type { Droite, Poly, Pt, Q } from "../../moteur6e/algebreLieux";
import { echantillonner } from "../../ui6e/figureLieux";
import type { P2 } from "../../ui6e/figureLieux";

/**
 * `6gen56` — Lieux géométriques et élimination de paramètre (6e ch. 9 ; audit, lots B et C).
 * Corrections : D demande la partie décrite (demi-parabole, droite privée d'un point…), carré placé
 * (sommets (±c ; ±c), distances aux DROITES des côtés), sommets comparés comme un ensemble, droites
 * par proportionnalité, consigne propre à chaque sous-type, C décide « cercle, point ou vide »
 * (décision 3, verdict tiré avant les paramètres, jamais dans `forme`), variété élargie, plus
 * aucune variable interne ni LaTeX brut visible.
 */

type Ex = ExerciceLieuxGeometriquesParametres;
const EQ = (s: string): Poly => lireEquation(s, ["x", "y"]).poly;
const N = (x: number) => latexN(x);
const P2n = (p: Pt): P2 => ({ x: qNum(p.x), y: qNum(p.y) });
const lp = (p: Pt) => `(${latexQ(p.x)}\\,;${latexQ(p.y)})`;
const d3 = (d: Droite) => ({ a: Number(d.a), b: Number(d.b), c: Number(d.c) });
/** « x − 3 », « x + 2 », « x » */
const moins = (v: string, n: number) => (n === 0 ? v : n > 0 ? `${v}-${N(n)}` : `${v}+${N(-n)}`);
const s = (n: number) => (n < 0 ? `(${n})` : `${n}`);
const abs = (v: string, n: number) => `|${moins(v, n)}|`;
/** Suite d'une somme : « +3x−2 », « −x », rien si nulle. */
const suite = (r: string) => (r === "0" ? "" : r.startsWith("-") ? r : `+${r}`);

const NATURES_A: OptionLieu[] = [
  { valeur: "deuxDroites", label: "Deux droites parallèles" },
  { valeur: "carre", label: "Un carré posé sur une pointe" },
  { valeur: "demiDroites", label: "Quatre demi-droites" },
  { valeur: "cercle", label: "Un cercle" },
];
const NATURES_B: OptionLieu[] = [
  { valeur: "droite", label: "Une droite" },
  { valeur: "deuxDroites", label: "Deux droites" },
  { valeur: "cercle", label: "Un cercle" },
  { valeur: "point", label: "Un seul point" },
  { valeur: "vide", label: "L'ensemble vide (aucun point)" },
];
const NATURES_E: OptionLieu[] = [
  { valeur: "vide", label: "L'ensemble vide (aucun point)" },
  { valeur: "bande", label: "Une bande pleine (entre deux droites parallèles)" },
  { valeur: "deuxDroites", label: "Deux droites parallèles" },
  { valeur: "regionCarre", label: "Un carré plein (intérieur et bord)" },
  { valeur: "carre", label: "Un carré posé sur une pointe (son bord)" },
  { valeur: "parallelogramme", label: "Un parallélogramme (son bord)" },
  { valeur: "octogone", label: "Un octogone (son bord)" },
];

function base(famille: Ex["famille"], sousType: SousTypeLieux, verdict: string): Pick<Ex, "famille" | "sousType" | "verdict" | "configuration" | "lieu" | "consignes" | "aides" | "explications"> {
  return { famille, sousType, verdict, configuration: {}, lieu: {}, consignes: {}, aides: {}, explications: {} };
}

function polyDist2(p: Pt): Poly {
  const dx = polySub(polyVar("x"), polyConst(p.x));
  const dy = polySub(polyVar("y"), polyConst(p.y));
  return polyAdd(polyMul(dx, dx), polyMul(dy, dy));
}

// ============================================================================
// A — valeurs absolues
// ============================================================================

export function construireParallelesA(): Ex {
  for (;;) {
    const a = tirerParmi([1, 2, 3]);
    const b = tirerParmi([1, -1, 2, -2, 3, -3]);
    if (gcd(a, b) !== 1) continue;
    const g = tirerEntier(-6, 6);
    const k = tirerEntier(1, 8);
    const expr = latexSomme([
      [q(a), "x"],
      [q(b), "y"],
      [q(g), ""],
    ]);
    const d1 = droiteNormalisee(q(a), q(b), q(g - k));
    const d2 = droiteNormalisee(q(a), q(b), q(g + k));
    return {
      ...base("A", "A_paralleles", "deuxDroites"),
      phases: ["nature", "droites"],
      consigne: "Détermine l'ensemble des points $P(x\\,;y)$ dont les coordonnées vérifient l'équation donnée.",
      donnees: [`$|${expr}|=${k}$`],
      natures: NATURES_A,
      nature: "deuxDroites",
      droites: [d1, d2],
      consignes: { nature: "Quelle est la nature de cet ensemble ?", droites: "Écris une équation de chacune des deux droites (une par ligne)." },
      aides: {
        nature: [{ texte: "Une valeur absolue égale à un nombre positif donne deux cas :", latex: "|u|=k\\iff u=k\\ \\text{ou}\\ u=-k\\quad(k>0)" }, { texte: "Ici l'expression entre les barres est du premier degré en $x$ et $y$ : que représente chaque cas ?" }],
        droites: [{ texte: "Les deux cas donnent deux équations :", latex: `${expr}=${k}\\quad\\text{ou}\\quad ${expr}=-${k}` }, { texte: "Elles ont les mêmes coefficients de $x$ et de $y$ : les droites sont parallèles." }],
      },
      explications: { nature: [`$|${expr}|=${k}$ équivaut à $${expr}=${k}$ ou $${expr}=-${k}$ : deux droites de mêmes coefficients, donc parallèles.`], droites: [`$${latexDroite(d1)}$ et $${latexDroite(d2)}$.`] },
      configuration: {},
      lieu: { droites: [d1, d2].map((d) => ({ ...d3(d), couleur: "vert", epais: true })) },
    } as Ex;
  }
}

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

export function construireLosangeA(): Ex {
  const p = tirerEntier(-4, 4);
  const qq = tirerEntier(-4, 4);
  const k = tirerEntier(1, 6);
  const S = [pt(p + k, qq), pt(p, qq + k), pt(p - k, qq), pt(p, qq - k)];
  return {
    ...base("A", "A_losange", "carre"),
    phases: ["nature", "sommets"],
    consigne: "Détermine l'ensemble des points $P(x\\,;y)$ dont les coordonnées vérifient l'équation donnée.",
    donnees: [`$${abs("x", p)}+${abs("y", qq)}=${k}$`],
    natures: NATURES_A,
    nature: "carre",
    sommets: S,
    consignes: { nature: "Quelle est la nature de cet ensemble ?", sommets: "Donne les coordonnées de ses sommets (un par ligne, dans l'ordre que tu veux)." },
    aides: {
      nature: [{ texte: "Distingue quatre cas selon les signes de $x-p$ et de $y-q$ : chaque cas donne un morceau de droite." }, { texte: `Par exemple si $x\\geq ${N(p)}$ et $y\\geq ${N(qq)}$ :`, latex: `(${moins("x", p)})+(${moins("y", qq)})=${k}` }],
      sommets: [{ texte: "Les sommets sont là où une des deux valeurs absolues s'annule." }, { texte: `Pour $x=${N(p)}$ :`, latex: `${abs("y", qq)}=${k}` }],
    },
    explications: {
      nature: ["Les quatre cas de signes donnent quatre segments de pente $1$ ou $-1$, qui forment un carré posé sur une pointe, centré en $" + lp(pt(p, qq)) + "$."],
      sommets: [`Sommets : ${S.map((x) => `$${lp(x)}$`).join(", ")}.`, "Piège : les sommets ne sont pas $(p\\pm k\\,;q\\pm k)$, qui seraient les sommets d'un carré aux côtés parallèles aux axes."],
    },
    configuration: {},
    lieu: { polygones: [{ pts: S.map(P2n), couleur: "vert" }], points: S.map((x) => ({ p: P2n(x), couleur: "vert" as const })) },
  } as Ex;
}

export function construireNonBorneA(): Ex {
  const p = tirerEntier(-4, 4);
  const qq = tirerEntier(-4, 4);
  const k = tirerEntier(1, 5);
  const droites = [EQ(`x-y-${s(p)}+${s(qq)}-${k}=0`), EQ(`x+y-${s(p)}-${s(qq)}-${k}=0`), EQ(`x+y-${s(p)}-${s(qq)}+${k}=0`), EQ(`x-y-${s(p)}+${s(qq)}+${k}=0`)];
  const D = droites.map((po) => {
    const c = (e: Record<string, number>) => po.get(Object.keys(e).filter((v) => e[v]).map((v) => `${v}:1`).join(",")) ?? q(0);
    return droiteNormalisee(c({ x: 1 }), c({ y: 1 }), c({}));
  });
  const O1 = pt(p + k, qq);
  const O2 = pt(p - k, qq);
  return {
    ...base("A", "A_nonBorne", "demiDroites"),
    phases: ["nature", "droites", "sommets"],
    consigne: "Détermine l'ensemble des points $P(x\\,;y)$ dont les coordonnées vérifient l'équation donnée.",
    donnees: [`$${abs("x", p)}-${abs("y", qq)}=${k}$`],
    natures: NATURES_A,
    nature: "demiDroites",
    droites: D,
    sommets: [O1, O2],
    consignes: { nature: "Quelle est la nature de cet ensemble ?", droites: "Chaque cas de signes donne un morceau d'une droite : écris une équation de chacune des quatre droites (une par ligne).", sommets: "Donne les coordonnées des points d'où partent ces morceaux (un par ligne)." },
    aides: {
      nature: [{ texte: "Distingue quatre cas selon les signes de $x-p$ et de $y-q$ : dans chaque cas, l'équation est celle d'une droite, mais seule une partie convient." }, { texte: `Par exemple si $x\\geq ${N(p)}$ et $y\\geq ${N(qq)}$ :`, latex: `(${moins("x", p)})-(${moins("y", qq)})=${k}` }],
      droites: [{ texte: "Les quatre cas : chaque valeur absolue est remplacée par l'expression ou par son opposé." }, { texte: `Premier cas :`, latex: `(${moins("x", p)})-(${moins("y", qq)})=${k}` }],
      sommets: [{ texte: "Un morceau part du point où $y-q$ change de signe." }, { texte: `Pour $y=${N(qq)}$ :`, latex: `${abs("x", p)}=${k}` }],
    },
    explications: {
      nature: [`Dans chaque cas on obtient une droite de pente $1$ ou $-1$, mais seulement d'un côté : quatre demi-droites, issues de $${lp(O1)}$ et $${lp(O2)}$. Le lieu n'est pas borné.`],
      droites: D.map((d) => `$${latexDroite(d)}$`),
      sommets: [`Origines : $${lp(O1)}$ et $${lp(O2)}$.`],
    },
    configuration: {},
    lieu: {
      demiDroites: [
        { o: P2n(O1), u: { x: 1, y: 1 } },
        { o: P2n(O1), u: { x: 1, y: -1 } },
        { o: P2n(O2), u: { x: -1, y: 1 } },
        { o: P2n(O2), u: { x: -1, y: -1 } },
      ].map((d) => ({ ...d, couleur: "vert" as const, epais: true })),
      points: [O1, O2].map((x) => ({ p: P2n(x), couleur: "vert" as const })),
      inclure: [pt(p - k - 3, qq - 3), pt(p + k + 3, qq + 3)].map(P2n),
    },
  } as Ex;
}

// ============================================================================
// B — distances, seuils
// ============================================================================

const NORMES: Record<number, [number, number][]> = {
  2: [
    [1, 1],
    [1, -1],
  ],
  5: [
    [1, 2],
    [2, 1],
    [1, -2],
    [2, -1],
  ],
  10: [
    [1, 3],
    [3, 1],
    [1, -3],
    [3, -1],
  ],
  25: [
    [3, 4],
    [4, 3],
    [3, -4],
    [4, -3],
    [5, 0],
    [0, 5],
  ],
};

export function construireBissectrices(): Ex {
  for (;;) {
    const n = tirerParmi([2, 5, 10, 25]);
    const [a1, b1] = tirerParmi(NORMES[n]);
    const [a2, b2] = tirerParmi(NORMES[n]);
    if (a1 * b2 - a2 * b1 === 0) continue;
    const c1 = tirerEntier(-6, 6);
    const c2 = tirerEntier(-6, 6);
    const L1 = droiteNormalisee(q(a1), q(b1), q(c1));
    const L2 = droiteNormalisee(q(a2), q(b2), q(c2));
    const b1d = droiteNormalisee(q(a1 - a2), q(b1 - b2), q(c1 - c2));
    const b2d = droiteNormalisee(q(a1 + a2), q(b1 + b2), q(c1 + c2));
    const e1 = latexSomme([
      [q(a1), "x"],
      [q(b1), "y"],
      [q(c1), ""],
    ]);
    const e2 = latexSomme([
      [q(a2), "x"],
      [q(b2), "y"],
      [q(c2), ""],
    ]);
    return {
      ...base("B", "B_bissectrices", "deuxDroites"),
      phases: ["droites"],
      consigne: "On cherche le lieu des points $P$ situés à égale distance des deux droites $d_1$ et $d_2$.",
      donnees: [`$d_1\\,:\\ ${e1}=0$`, `$d_2\\,:\\ ${e2}=0$`],
      droites: [b1d, b2d],
      consignes: { droites: "Écris une équation de chaque droite qui forme le lieu (une par ligne)." },
      aides: {
        droites: [
          { texte: "Distance d'un point à une droite, puis égalité des distances :", latex: `\\dfrac{|${e1}|}{\\sqrt{${a1 * a1 + b1 * b1}}}=\\dfrac{|${e2}|}{\\sqrt{${a2 * a2 + b2 * b2}}}` },
          { texte: "Les deux dénominateurs sont égaux : il reste deux valeurs absolues égales, donc deux cas :", latex: "|u|=|v|\\iff u=v\\ \\text{ou}\\ u=-v" },
        ],
      },
      explications: { droites: [`$|${e1}|=|${e2}|$ donne $${latexDroite(b1d)}$ ou $${latexDroite(b2d)}$ : les deux bissectrices des angles formés par $d_1$ et $d_2$ (elles sont perpendiculaires).`, "Piège : une seule droite, c'est oublier le cas $u=-v$."] },
      configuration: { droites: [{ ...d3(L1), couleur: "bleu", nom: "d₁" }, { ...d3(L2), couleur: "bleu", nom: "d₂" }] },
      lieu: { droites: [b1d, b2d].map((d) => ({ ...d3(d), couleur: "vert", epais: true })) },
    } as Ex;
  }
}

/** Écrans communs des sous-types B à cercle (équation, puis Ω et R, puis nature). */
function versionCercle(e: { equation: Poly; centre: Pt; R: Q }, sansCentreR = false): Partial<Ex> {
  const R = qNum(e.R);
  const nature = R > 0 ? "cercle" : R === 0 ? "point" : "vide";
  return {
    phases: sansCentreR ? ["equation", "nature"] : ["equation", "centreR", "nature"],
    natures: NATURES_B,
    nature,
    verdict: nature,
    lieu: nature === "cercle" ? { cercles: [{ c: P2n(e.centre), r: Math.sqrt(R), couleur: "vert", epais: true }] } : nature === "point" ? { points: [{ p: P2n(e.centre), nom: "Ω", couleur: "vert" }] } : {},
  };
}
function natureExplication(centre: Pt, R: Q): string {
  const r = qNum(R);
  if (r > 0) return `$R=${latexQ(R)}>0$ : le lieu est le cercle de centre $\\Omega${lp(centre)}$ et de rayon $\\sqrt{R}=${latexRacine(R)}$.`;
  if (r === 0) return `$R=0$ : seul le point $\\Omega${lp(centre)}$ vérifie l'équation (une somme de carrés nulle).`;
  return `$R=${latexQ(R)}<0$ : une somme de carrés n'est jamais négative, le lieu est vide.`;
}
const centreRConsigne = "Écris l'équation sous la forme $(x-x_0)^2+(y-y_0)^2=R$ : donne le point $\\Omega(x_0\\,;y_0)$ et le nombre $R$.";

export function construireDroiteB(): Ex {
  for (;;) {
    const A = pt(tirerEntier(-5, 5), tirerEntier(-5, 5));
    const B = pt(tirerEntier(-5, 5), tirerEntier(-5, 5));
    if (qNum(A.x) === qNum(B.x) && qNum(A.y) === qNum(B.y)) continue;
    const k = tirerEntier(-10, 10);
    const eq = polySub(polySub(polyDist2(A), polyDist2(B)), polyConst(q(k)));
    const c = (ex: string) => eq.get(ex) ?? q(0);
    const d = droiteNormalisee(c("x:1"), c("y:1"), c(""));
    return {
      ...base("B", "B_droite", "droite"),
      phases: ["equation", "nature"],
      consigne: "On cherche le lieu des points $P(x\\,;y)$ tels que $PA^2-PB^2=k$.",
      donnees: [`$A${lp(A)}$, $B${lp(B)}$, $k=${k}$`],
      equation: eq,
      equationLatex: latexDroite(d),
      natures: NATURES_B,
      nature: "droite",
      consignes: { equation: "Traduis la condition par une équation en $x$ et $y$, développée et réduite.", nature: "Quelle est la nature de ce lieu ?" },
      aides: {
        equation: [{ texte: "Écris les carrés des distances :", latex: "PA^2=(x-x_A)^2+(y-y_A)^2" }, { texte: "Ici :", latex: `(${moins("x", qNum(A.x))})^2+(${moins("y", qNum(A.y))})^2-(${moins("x", qNum(B.x))})^2-(${moins("y", qNum(B.y))})^2=${k}` }],
        nature: [{ texte: "En développant, les termes $x^2$ et $y^2$ s'annulent : regarde le degré de l'équation qui reste." }, { texte: "Le vecteur $\\overrightarrow{AB}$ est normal à ce lieu." }],
      },
      explications: { equation: [`Les carrés $x^2$ et $y^2$ s'annulent : $${latexDroite(d)}$.`], nature: ["Une équation du premier degré : le lieu est une droite, perpendiculaire à $(AB)$ (de vecteur normal $\\overrightarrow{AB}$)."] },
      configuration: { points: [{ p: P2n(A), nom: "A" }, { p: P2n(B), nom: "B" }] },
      lieu: { droites: [{ ...d3(d), couleur: "vert", epais: true }] },
    } as Ex;
  }
}

export function construireCerclePerp(): Ex {
  const x0 = tirerEntier(-5, 5);
  const y0 = tirerEntier(-5, 5);
  const k = tirerParmi([1, 2, 4, 5, 8, 9, 10, 13, 16, 25]);
  const centre = pt(x0, y0);
  const R = q(k);
  const eq = polySub(polyDist2(centre), polyConst(R));
  const ex = {
    ...base("B", "B_cerclePerp", "cercle"),
    consigne: "On cherche le lieu des points $P$ tels que la somme des carrés de leurs distances aux droites $a$ et $b$ vaille $k$.",
    donnees: [`$a\\,:\\ x=${x0}$, $b\\,:\\ y=${y0}$, $k=${k}$`],
    equation: eq,
    equationLatex: `${latexPoly(eq)}=0`,
    centre,
    R,
    consignes: { equation: "Traduis la condition par une équation en $x$ et $y$.", centreR: centreRConsigne, nature: "Quelle est la nature de ce lieu ?" },
    aides: {
      equation: [{ texte: "La distance de $P(x\\,;y)$ à la droite $x=x_0$ est $|x-x_0|$ ; son carré est $(x-x_0)^2$." }, { texte: "Ici :", latex: `\\text{dist}(P\\,;a)^2=(${moins("x", x0)})^2` }],
      centreR: [{ texte: "L'équation a déjà la forme cherchée." }, { texte: "Lis le centre et le second membre." }],
      nature: [{ texte: "Compare $R$ à $0$ : $R>0$ cercle de rayon $\\sqrt{R}$, $R=0$ un point, $R<0$ aucun point." }, { texte: `Ici $R=${k}$.` }],
    },
    explications: {
      equation: [`$(${moins("x", x0)})^2+(${moins("y", y0)})^2=${k}$`],
      centreR: [`$\\Omega${lp(centre)}$, $R=${k}$.`],
      nature: [natureExplication(centre, R)],
    },
    configuration: { droites: [{ a: 1, b: 0, c: -x0, couleur: "bleu", nom: "a" }, { a: 0, b: 1, c: -y0, couleur: "bleu", nom: "b" }] },
  };
  return { ...ex, ...versionCercle(ex) } as Ex;
}

const R_POSITIFS = [1, 2, 4, 5, 8, 9];
const R_NEGATIFS = [-1, -2, -4, -5, -8];

export function construireSeuil2Points(regime: "cercle" | "point" | "vide" = tirerParmi(["cercle", "point", "vide"] as const)): Ex {
  for (;;) {
    const A = pt(2 * tirerEntier(-3, 3), 2 * tirerEntier(-3, 3));
    const B = pt(2 * tirerEntier(-3, 3), 2 * tirerEntier(-3, 3));
    const ab2 = (qNum(B.x) - qNum(A.x)) ** 2 + (qNum(B.y) - qNum(A.y)) ** 2;
    if (ab2 === 0) continue;
    const seuil = ab2 / 2;
    const Rn = regime === "cercle" ? tirerParmi(R_POSITIFS) : regime === "point" ? 0 : tirerParmi(R_NEGATIFS);
    const k = seuil + 2 * Rn;
    if (k <= 0) continue;
    const M = pt((qNum(A.x) + qNum(B.x)) / 2, (qNum(A.y) + qNum(B.y)) / 2);
    const R = q(Rn);
    const eq = polySub(polyAdd(polyDist2(A), polyDist2(B)), polyConst(q(k)));
    const ex = {
      ...base("B", "B_seuil2Points", regime),
      consigne: "On cherche le lieu des points $P(x\\,;y)$ tels que $PA^2+PB^2=k$.",
      donnees: [`$A${lp(A)}$, $B${lp(B)}$, $k=${k}$`],
      equation: eq,
      equationLatex: `${latexPoly(eq)}=0`,
      centre: M,
      R,
      consignes: { equation: "Traduis la condition par une équation en $x$ et $y$.", centreR: centreRConsigne, nature: "Quelle est la nature de ce lieu ?" },
      aides: {
        equation: [{ texte: "Écris les carrés des distances, puis additionne :", latex: "PA^2=(x-x_A)^2+(y-y_A)^2" }, { texte: "Ici :", latex: `(${moins("x", qNum(A.x))})^2+(${moins("y", qNum(A.y))})^2+(${moins("x", qNum(B.x))})^2+(${moins("y", qNum(B.y))})^2=${k}` }],
        centreR: [{ texte: "Divise par $2$, puis complète les carrés en $x$ et en $y$." }, { texte: "Théorème de la médiane, pour vérifier :", latex: "PA^2+PB^2=2\\,PM^2+\\dfrac{AB^2}{2}" }],
        nature: [{ texte: "Compare $R$ à $0$ : $R>0$ cercle de rayon $\\sqrt{R}$, $R=0$ un point, $R<0$ aucun point." }, { texte: `Autre lecture : compare $k$ au seuil $\\dfrac{AB^2}{2}=${N(seuil)}$.` }],
      },
      explications: {
        equation: [`$${latexPoly(eq)}=0$`],
        centreR: [`$PA^2+PB^2=2PM^2+\\dfrac{AB^2}{2}$ avec $M${lp(M)}$ milieu de $[AB]$ : $PM^2=\\dfrac{k-${N(seuil)}}{2}=${latexQ(R)}$.`, `$\\Omega${lp(M)}$, $R=${latexQ(R)}$.`],
        nature: [natureExplication(M, R), "Piège : au seuil exact, le lieu n'est pas un « tout petit cercle » mais le seul point $M$."],
      },
      configuration: { points: [{ p: P2n(A), nom: "A" }, { p: P2n(B), nom: "B" }] },
    };
    return { ...ex, ...versionCercle(ex) } as Ex;
  }
}

export function construireSeuilCarre(regime: "cercle" | "point" | "vide" = tirerParmi(["cercle", "point", "vide"] as const)): Ex {
  for (;;) {
    const c = tirerEntier(1, 4);
    const Rn = regime === "cercle" ? tirerParmi(R_POSITIFS) : regime === "point" ? 0 : tirerParmi(R_NEGATIFS);
    const k = 4 * c * c + 2 * Rn;
    if (k <= 0) continue;
    const O = pt(0, 0);
    const R = q(Rn);
    const eq = EQ(`2x^2+2y^2+${4 * c * c}-${k}=0`);
    const ex = {
      ...base("B", "B_seuilCarre", regime),
      consigne: "On cherche le lieu des points $P$ tels que la somme des carrés de leurs distances aux quatre droites qui portent les côtés du carré vaille $k$.",
      donnees: [`carré de sommets $(${c}\\,;${c})$, $(-${c}\\,;${c})$, $(-${c}\\,;-${c})$, $(${c}\\,;-${c})$ ; $k=${k}$`],
      equation: eq,
      equationLatex: `x^2+y^2=${latexQ(R)}`,
      centre: O,
      R,
      consignes: { equation: "Traduis la condition par une équation en $x$ et $y$.", centreR: centreRConsigne, nature: "Quelle est la nature de ce lieu ?" },
      aides: {
        equation: [{ texte: "Les côtés sont portés par les droites $x=\\pm c$ et $y=\\pm c$ ; la distance de $P(x\\,;y)$ à $x=c$ est $|x-c|$." }, { texte: "Ici :", latex: `(x-${c})^2+(x+${c})^2+(y-${c})^2+(y+${c})^2=${k}` }],
        centreR: [{ texte: "Développe : $(x-c)^2+(x+c)^2=2x^2+2c^2$." }, { texte: "Puis divise par $2$." }],
        nature: [{ texte: "Compare $R$ à $0$ : $R>0$ cercle de rayon $\\sqrt{R}$, $R=0$ un point, $R<0$ aucun point." }, { texte: `Autre lecture : compare $k$ au seuil $4c^2=${4 * c * c}$.` }],
      },
      explications: {
        equation: [`$2x^2+2y^2+${4 * c * c}=${k}$`],
        centreR: [`$x^2+y^2=\\dfrac{${k}-${4 * c * c}}{2}=${latexQ(R)}$ : $\\Omega(0\\,;0)$, $R=${latexQ(R)}$.`],
        nature: [natureExplication(O, R), "Piège : le seuil est $4c^2$ pour une somme de carrés (et $4c$ pour une somme de distances simples)."],
      },
      configuration: { polygones: [{ pts: [P2n(pt(c, c)), P2n(pt(-c, c)), P2n(pt(-c, -c)), P2n(pt(c, -c))], couleur: "bleu" }], inclure: [{ x: -c - 1, y: -c - 1 }, { x: c + 1, y: c + 1 }] },
    };
    return { ...ex, ...versionCercle(ex) } as Ex;
  }
}

const K_APOLLONIUS: [number, number][] = [
  [4, 1],
  [9, 1],
  [1, 4],
  [1, 9],
  [9, 4],
  [4, 9],
  [2, 1],
  [3, 1],
  [1, 2],
  [1, 3],
];

export function construireApollonius(casK1: boolean = Math.random() < 0.5): Ex {
  const a = tirerEntier(1, 4);
  const h = tirerEntier(-3, 3);
  const A = pt(h - a, 0);
  const B = pt(h + a, 0);
  const [kn, kd] = casK1 ? [1, 1] : tirerParmi(K_APOLLONIUS);
  const k = q(kn, kd);
  const eq = polySub(polyDist2(A), polyScal(polyDist2(B), k));
  const commun = {
    consigne: "On cherche le lieu des points $P(x\\,;y)$ tels que $PA^2=k\\cdot PB^2$.",
    donnees: [`$A${lp(A)}$, $B${lp(B)}$, $k=${latexQ(k)}$`],
    equation: eq,
    configuration: { points: [{ p: P2n(A), nom: "A" }, { p: P2n(B), nom: "B" }] },
  };
  const aideEq = [{ texte: "Écris les carrés des distances :", latex: "PA^2=(x-x_A)^2+(y-y_A)^2" }, { texte: "Ici :", latex: `(${moins("x", h - a)})^2+y^2=${latexQ(k)}\\left((${moins("x", h + a)})^2+y^2\\right)` }];
  if (casK1) {
    const d = droiteNormalisee(q(1), q(0), q(-h));
    return {
      ...base("B", "B_apollonius", "droite"),
      ...commun,
      phases: ["equation", "nature"],
      equationLatex: latexDroite(d),
      natures: NATURES_B,
      nature: "droite",
      consignes: { equation: "Traduis la condition par une équation en $x$ et $y$, développée et réduite.", nature: "Quelle est la nature de ce lieu ?" },
      aides: { equation: aideEq, nature: [{ texte: "Pour $k=1$, les termes $x^2$ et $y^2$ s'annulent : regarde le degré de l'équation qui reste." }, { texte: "$PA^2=PB^2$ signifie $PA=PB$." }] },
      explications: { equation: [`$PA^2=PB^2$ donne $${latexDroite(d)}$.`], nature: ["$PA=PB$ : le lieu est la médiatrice de $[AB]$, une droite.", "Piège : pour $k=1$, on ne peut pas diviser par $1-k$ ; il n'y a pas de cercle."] },
      lieu: { droites: [{ ...d3(d), couleur: "vert", epais: true }] },
    } as Ex;
  }
  const kk = kn / kd;
  const x0 = h + (a * (kk + 1)) / (kk - 1);
  const centre = pt(x0, 0);
  const R = qDiv(qMul(q(4 * a * a), k), qMul(qSub(k, q(1)), qSub(k, q(1))));
  const ex = {
    ...base("B", "B_apollonius", "cercle"),
    ...commun,
    equationLatex: `${latexPoly(eq)}=0`,
    centre,
    R,
    consignes: { equation: "Traduis la condition par une équation en $x$ et $y$.", centreR: centreRConsigne, nature: "Quelle est la nature de ce lieu ?" },
    aides: {
      equation: aideEq,
      centreR: [{ texte: `Regroupe tout dans un membre, divise par le coefficient de $x^2$ (ici $1-k=${latexQ(qSub(q(1), k))}$), puis complète le carré en $x$.` }, { texte: "Le centre est sur la droite $(AB)$." }],
      nature: [{ texte: "Compare $R$ à $0$ : $R>0$ cercle de rayon $\\sqrt{R}$, $R=0$ un point, $R<0$ aucun point." }, { texte: "Pour $k\\neq1$, le lieu de $PA^2=k\\,PB^2$ est le cercle d'Apollonius." }],
    },
    explications: {
      equation: [`$${latexPoly(eq)}=0$`],
      centreR: [`Après division par $1-k$ et complétion du carré : $\\Omega${lp(centre)}$ et $R=${latexQ(R)}$.`],
      nature: [natureExplication(centre, R)],
    },
  };
  return { ...ex, ...versionCercle(ex) } as Ex;
}

// ============================================================================
// C — m(x² + y²) + Dx + Ey + F = 0 : cercle, point ou vide (décision 3)
// ============================================================================

export function construireFamilleC(verdict: "cercle" | "point" | "vide" = tirerParmi(["cercle", "point", "vide"] as const)): Ex {
  const m = tirerParmi([1, 2, 3, 4, -1, -2]);
  const h = tirerEntier(-4, 4);
  const k = tirerEntier(-4, 4);
  const Rn = verdict === "cercle" ? tirerParmi([1, 4, 9, 16, 25, 2, 5, 10]) : verdict === "point" ? 0 : tirerParmi([-1, -2, -4, -5, -9]);
  const D = -2 * m * h;
  const E = -2 * m * k;
  const F = m * (h * h + k * k - Rn);
  const centre = pt(h, k);
  const R = q(Rn);
  const mx = m === 1 ? "" : m === -1 ? "-" : `${m}`;
  const reste = latexSomme([
    [q(D), "x"],
    [q(E), "y"],
    [q(F), ""],
  ]);
  const eqLatex = `${mx}(x^2+y^2)${reste === "0" ? "" : reste.startsWith("-") ? reste : `+${reste}`}=0`;
  const eq = EQ(`${m}(x^2+y^2)+${s(D)}x+${s(E)}y+${s(F)}=0`);
  const ex = {
    ...base("C", "C", verdict),
    phases: ["centreR", "nature"] as Ex["phases"],
    consigne: "Détermine la nature de l'ensemble des points $P(x\\,;y)$ dont les coordonnées vérifient l'équation donnée.",
    donnees: [`$${eqLatex}$`],
    equation: eq,
    centre,
    R,
    natures: NATURES_B,
    nature: verdict,
    consignes: { centreR: centreRConsigne, nature: "Quelle est la nature de cet ensemble ?" },
    aides: {
      centreR: [{ texte: `Divise d'abord par le coefficient de $x^2$ (ici $${m}$), puis complète les carrés :`, latex: "x^2+px=\\left(x+\\frac{p}{2}\\right)^2-\\frac{p^2}{4}" }, { texte: "Après division :", latex: `x^2+y^2${suite(latexSomme([
        [q(D / m), "x"],
        [q(E / m), "y"],
        [q(F / m), ""],
      ]))}=0` }],
      nature: [{ texte: "Compare $R$ à $0$ : $R>0$ cercle de rayon $\\sqrt{R}$, $R=0$ un seul point, $R<0$ aucun point." }, { texte: "Une équation de la forme $m(x^2+y^2)+\\dots=0$ n'est pas toujours celle d'un cercle." }],
    },
    explications: {
      centreR: [`On divise par $${m}$ et on complète les carrés : $(${moins("x", h)})^2+(${moins("y", k)})^2=${latexQ(R)}$.`, `$\\Omega${lp(centre)}$, $R=${latexQ(R)}$.`],
      nature: [natureExplication(centre, R), "Piège : le centre est $\\left(-\\dfrac{D}{2m}\\,;-\\dfrac{E}{2m}\\right)$, on n'oublie pas de diviser par $m$."],
    },
    configuration: {},
    lieu: verdict === "cercle" ? { cercles: [{ c: P2n(centre), r: Math.sqrt(Rn), couleur: "vert" as const, epais: true }] } : verdict === "point" ? { points: [{ p: P2n(centre), nom: "Ω", couleur: "vert" as const }] } : {},
  };
  return ex as Ex;
}

// ============================================================================
// D — représentation paramétrique : équation ET partie décrite
// ============================================================================

function restrictionsDe(libelles: Record<string, string>, correcte: string): { restrictions: OptionLieu[]; restriction: string } {
  return { restrictions: melanger(Object.entries(libelles).map(([valeur, label]) => ({ valeur, label }))), restriction: correcte };
}

export function construireSubstitution(forme: "racine" | "racineMoins" | "affine" = tirerParmi(["racine", "racineMoins", "affine"] as const)): Ex {
  const p = tirerEntier(-4, 4);
  const qq = tirerParmi([1, 2, 3, -1, -2, -3]);
  const r = tirerEntier(-5, 5);
  const xParam = forme === "racine" ? `x=${p === 0 ? "" : `${p}+`}\\sqrt{t}` : forme === "racineMoins" ? `x=${p === 0 ? "-" : `${p}-`}\\sqrt{t}` : `x=${p === 0 ? "" : `${p}+`}t`;
  const yParam = forme === "affine" ? `y=${latexSomme([
    [q(qq), "t^2"],
    [q(r), ""],
  ])}` : `y=${latexSomme([
    [q(qq), "t"],
    [q(r), ""],
  ])}`;
  const domaine = forme === "affine" ? "t\\in\\mathbb{R}" : "t\\geq0";
  const eq = EQ(`y=${qq}(x-${s(p)})^2+${s(r)}`);
  const eqLatex = `y=${qq === 1 ? "" : qq === -1 ? "-" : qq}(${moins("x", p)})^2${r === 0 ? "" : r > 0 ? `+${r}` : r}`;
  const correcte = forme === "racine" ? "droite" : forme === "racineMoins" ? "gauche" : "entiere";
  const f = (x: number) => qq * (x - p) ** 2 + r;
  const de = forme === "racine" ? p : p - 4;
  const a = forme === "racineMoins" ? p : p + 4;
  return {
    ...base("D", "D_substitution", correcte),
    phases: ["equation", "restriction"],
    consigne: "Le point $P(x\\,;y)$ dépend d'un paramètre $t$. Détermine le lieu de $P$ quand $t$ parcourt son domaine.",
    donnees: [`$${xParam}$, $${yParam}$, avec $${domaine}$`],
    equation: eq,
    equationLatex: eqLatex,
    ...restrictionsDe(
      {
        entiere: `la parabole $${eqLatex}$ entière`,
        droite: `la moitié de cette parabole où $x\\geq ${p}$`,
        gauche: `la moitié de cette parabole où $x\\leq ${p}$`,
        privee: `la parabole privée de son sommet $(${p}\\,;${r})$`,
      },
      correcte,
    ),
    consignes: { equation: "Élimine $t$ : écris une équation cartésienne du lieu (en $x$ et $y$).", restriction: "Quelle partie de cette parabole le point $P$ décrit-il vraiment ?" },
    aides: {
      equation: [{ texte: "Isole $t$ dans l'équation de $x$, puis remplace dans celle de $y$." }, { texte: forme === "affine" ? "Ici :" : "Isoler $\\sqrt{t}$ puis élever au carré :", latex: forme === "racine" ? `\\sqrt{t}=${moins("x", p)}\\ \\Rightarrow\\ t=(${moins("x", p)})^2` : forme === "racineMoins" ? `\\sqrt{t}=${p}-x\\ \\Rightarrow\\ t=(${moins("x", p)})^2` : `t=${moins("x", p)}` }],
      restriction: [{ texte: "Regarde les valeurs que $x$ peut prendre quand $t$ parcourt son domaine." }, { texte: forme === "affine" ? "Ici $t$ parcourt tout $\\mathbb{R}$." : "Une racine carrée n'est jamais négative." }],
    },
    explications: {
      equation: [`On obtient $${eqLatex}$.`],
      restriction: [forme === "racine" ? `$\\sqrt{t}\\geq0$, donc $x\\geq ${p}$ : seule la moitié droite de la parabole est décrite.` : forme === "racineMoins" ? `$\\sqrt{t}\\geq0$, donc $x\\leq ${p}$ : seule la moitié gauche de la parabole est décrite.` : "$x$ prend toutes les valeurs réelles : la parabole entière est décrite.", "Piège : élever au carré fait perdre l'information de signe ; il faut la retrouver dans le domaine."],
    },
    configuration: {},
    lieu: { courbes: [{ pts: echantillonner((x) => ({ x, y: f(x) }), de, a), couleur: "vert", epais: true }], points: [{ p: { x: p, y: r }, couleur: "vert" }], inclure: [{ x: p - 4, y: r - 2 }, { x: p + 4, y: r + 2 }] },
  } as Ex;
}

export function construireFractions(forme: "fraction" | "cube" | "carre" = tirerParmi(["fraction", "cube", "carre"] as const)): Ex {
  for (;;) {
    const a = tirerEntier(-3, 3);
    const b = tirerEntier(-4, 4);
    const c = tirerParmi([1, 2, 3, -1, -2]);
    let xParam: string;
    let yParam: string;
    let domaine: string;
    let pente: number;
    let ord: number;
    let P0: [number, number];
    if (forme === "fraction") {
      if (b - c * a === 0) continue;
      xParam = `x=\\dfrac{1}{${moins("t", -a)}}`;
      yParam = `y=\\dfrac{${latexSomme([
        [q(c), "t"],
        [q(b), ""],
      ])}}{${moins("t", -a)}}`;
      domaine = `t\\neq${-a}`;
      pente = b - c * a;
      ord = c;
      P0 = [0, c];
    } else {
      const n = forme === "cube" ? 3 : 2;
      xParam = `x=${a === 0 ? "" : `${a}+`}t^${n}`;
      yParam = `y=${latexSomme([
        [q(b), ""],
        [q(c), `t^${n}`],
      ])}`;
      domaine = "t\\in\\mathbb{R}";
      pente = c;
      ord = b - c * a;
      P0 = [a, b];
    }
    const eq = EQ(`y=${s(pente)}x+${s(ord)}`);
    const eqLatex = `y=${latexSomme([
      [q(pente), "x"],
      [q(ord), ""],
    ])}`;
    const correcte = forme === "fraction" ? "privee" : forme === "cube" ? "entiere" : "demiDroite";
    const xo = P0[0];
    return {
      ...base("D", "D_fractions", correcte),
      phases: ["equation", "restriction"],
      consigne: "Le point $P(x\\,;y)$ dépend d'un paramètre $t$. Détermine le lieu de $P$ quand $t$ parcourt son domaine.",
      donnees: [`$${xParam}$, $${yParam}$, avec $${domaine}$`],
      equation: eq,
      equationLatex: eqLatex,
      ...restrictionsDe(
        {
          entiere: `la droite $${eqLatex}$ entière`,
          privee: `cette droite privée du point $(${N(P0[0])}\\,;${N(P0[1])})$`,
          demiDroite: `la demi-droite de cette droite où $x\\geq ${N(xo)}$`,
          demiGauche: `la demi-droite de cette droite où $x\\leq ${N(xo)}$`,
        },
        correcte,
      ),
      consignes: { equation: "Élimine $t$ : écris une équation cartésienne du lieu (en $x$ et $y$).", restriction: "Quelle partie de cette droite le point $P$ décrit-il vraiment ?" },
      aides: {
        equation:
          forme === "fraction"
            ? [{ texte: "Décompose $y$ : un nombre plus un multiple de $\\dfrac{1}{t+a}$, c'est-à-dire de $x$." }, { texte: "Ici :", latex: `\\dfrac{${latexSomme([
                [q(c), "t"],
                [q(b), ""],
              ])}}{${moins("t", -a)}}=${c}+\\dfrac{${b - c * a}}{${moins("t", -a)}}` }]
            : [{ texte: `Isole $t^${forme === "cube" ? 3 : 2}$ dans l'équation de $x$, puis remplace dans celle de $y$.` }, { texte: "Ici :", latex: `t^${forme === "cube" ? 3 : 2}=${moins("x", a)}` }],
        restriction: [{ texte: "Regarde les valeurs que $x$ peut prendre quand $t$ parcourt son domaine." }, { texte: forme === "fraction" ? "Une fraction de numérateur $1$ peut-elle valoir $0$ ?" : forme === "cube" ? "Un cube peut-il prendre toutes les valeurs réelles ?" : "Un carré peut-il être négatif ?" }],
      },
      explications: {
        equation: [`On obtient $${eqLatex}$.`],
        restriction: [forme === "fraction" ? `$x=\\dfrac{1}{t+${s(a)}}$ ne vaut jamais $0$ : le point $(0\\,;${c})$ de la droite n'est jamais atteint.` : forme === "cube" ? "$t^3$ prend toutes les valeurs réelles, donc $x$ aussi : la droite entière est décrite." : `$t^2\\geq0$, donc $x\\geq ${a}$ : seule une demi-droite, d'origine $(${a}\\,;${b})$, est décrite.`],
      },
      configuration: {},
      lieu:
        forme === "carre"
          ? { demiDroites: [{ o: { x: P0[0], y: P0[1] }, u: { x: 1, y: pente }, couleur: "vert" as const, epais: true }], points: [{ p: { x: P0[0], y: P0[1] }, couleur: "vert" as const }], inclure: [{ x: P0[0] - 3, y: P0[1] - 3 }, { x: P0[0] + 4, y: P0[1] + 3 }] }
          : { droites: [{ ...d3(droiteNormalisee(q(pente), q(-1), q(ord))), couleur: "vert" as const, epais: true }], points: forme === "fraction" ? [{ p: { x: 0, y: c }, creux: true, couleur: "vert" as const }] : [], inclure: [{ x: P0[0] - 3, y: P0[1] - 3 }, { x: P0[0] + 3, y: P0[1] + 3 }] },
    } as Ex;
  }
}

const EXPOSANTS: [number, number][] = [
  [2, 3],
  [3, 2],
  [3, 4],
  [4, 3],
];

export function construireRatio(domaine: "reels" | "positifs" = tirerParmi(["reels", "positifs"] as const)): Ex {
  const [m, n] = tirerParmi(EXPOSANTS);
  const a = tirerParmi([1, 2, -1, -2]);
  const b = tirerParmi([1, 2, -1, -2]);
  // x = a·tᵐ, y = b·tⁿ ⇒ bᵐ·xⁿ = aⁿ·yᵐ
  const bm = Math.pow(b, m);
  const an = Math.pow(a, n);
  const eq = EQ(`${s(bm)}x^${n}=${s(an)}y^${m}`);
  const coef = (v: number) => (v === 1 ? "" : v === -1 ? "-" : `${v}`);
  const eqLatex = `${coef(bm)}x^${n}=${coef(an)}y^${m}`;
  const correcte = domaine === "reels" ? "entiere" : "moitieSans";
  const tm = (v: number) => (v === 1 ? "" : v === -1 ? "-" : `${v}`);
  return {
    ...base("D", "D_ratio", correcte),
    phases: ["equation", "restriction"],
    consigne: "Le point $P(x\\,;y)$ dépend d'un paramètre $t$. Détermine le lieu de $P$ quand $t$ parcourt son domaine.",
    donnees: [`$x=${tm(a)}t^${m}$, $y=${tm(b)}t^${n}$, avec $${domaine === "reels" ? "t\\in\\mathbb{R}" : "t>0"}$`],
    equation: eq,
    equationLatex: eqLatex,
    ...restrictionsDe(
      {
        entiere: "toute la courbe",
        moitieSans: "une moitié de la courbe, sans l'origine",
        moitieAvec: "une moitié de la courbe, origine comprise",
        privee: "la courbe privée de l'origine",
      },
      correcte,
    ),
    consignes: { equation: "Élimine $t$ : écris une équation cartésienne du lieu (en $x$ et $y$, sans fraction ni racine).", restriction: "Quelle partie de cette courbe le point $P$ décrit-il vraiment ?" },
    aides: {
      equation: [{ texte: `Élève $x$ à la puissance $${n}$ et $y$ à la puissance $${m}$ : les deux font apparaître $t^{${m * n}}$.` }, { texte: "Ici :", latex: `x^${n}=${s(an)}\\,t^{${m * n}},\\qquad y^${m}=${s(bm)}\\,t^{${m * n}}` }],
      restriction: [{ texte: "Regarde quelles valeurs prennent $x$ et $y$ quand $t$ parcourt son domaine." }, { texte: domaine === "reels" ? "Pour chaque point de la courbe, peut-on retrouver un $t$ réel ?" : "Pour $t>0$, quels sont les signes de $x$ et de $y$ ? L'origine est-elle atteinte ?" }],
    },
    explications: {
      equation: [`$${eqLatex}$`],
      restriction: [domaine === "reels" ? "Pour chaque point de la courbe, une valeur réelle de $t$ convient : toute la courbe est décrite." : "Pour $t>0$, $x$ et $y$ gardent un signe fixe et ne s'annulent jamais : une moitié de la courbe, sans l'origine."],
    },
    configuration: {},
    lieu: { courbes: [{ pts: echantillonner((t) => ({ x: a * Math.pow(t, m), y: b * Math.pow(t, n) }), domaine === "reels" ? -1.5 : 0.02, 1.5, 160), couleur: "vert", epais: true }], points: domaine === "positifs" ? [{ p: { x: 0, y: 0 }, creux: true, couleur: "vert" }] : [], fenetre: { xmin: -5, xmax: 5, ymin: -5, ymax: 5 } },
  } as Ex;
}

// ============================================================================
// E — somme de distances simples
// ============================================================================

export function construireParallelesE(regime: "vide" | "bandePleine" | "pairDeDroites" = tirerParmi(["vide", "bandePleine", "pairDeDroites"] as const)): Ex {
  const verticale = Math.random() < 0.5;
  const p = tirerEntier(-4, 3);
  const d = tirerEntier(2, 6);
  const k = regime === "vide" ? tirerEntier(1, d - 1) : regime === "bandePleine" ? d : d + tirerEntier(1, 6);
  const v = verticale ? "x" : "y";
  const nature = regime === "vide" ? "vide" : regime === "bandePleine" ? "bande" : "deuxDroites";
  const droites = regime === "pairDeDroites" ? [p + (d - k) / 2, p + (d + k) / 2].map((c) => (verticale ? droiteNormalisee(q(1), q(0), qOpp(c)) : droiteNormalisee(q(0), q(1), qOpp(c)))) : undefined;
  const lig = (c: number) => (verticale ? { a: 1, b: 0, c: -c } : { a: 0, b: 1, c: -c });
  return {
    ...base("E", "E_paralleles", nature),
    phases: regime === "pairDeDroites" ? ["nature", "droites"] : ["nature"],
    consigne: "On cherche le lieu des points $P$ dont la somme des distances aux droites $a$ et $b$ vaut $k$.",
    donnees: [`$a\\,:\\ ${v}=${p}$, $b\\,:\\ ${v}=${p + d}$, $k=${k}$`],
    natures: NATURES_E,
    nature,
    droites,
    consignes: { nature: "Quelle est la nature de ce lieu ?", droites: "Écris une équation de chacune des droites qui forment le lieu (une par ligne)." },
    aides: {
      nature: [{ texte: "Entre les deux droites, la somme des distances est constante et vaut leur écartement ; à l'extérieur, elle grandit. Compare $k$ à cet écartement (le seuil)." }, { texte: `Ici l'écartement vaut $${d}$ et $k=${k}$.` }],
      droites: [{ texte: `À l'extérieur de la bande, par exemple si $${v}>${p + d}$ :`, latex: `(${moins(v, p)})+(${moins(v, p + d)})=${k}` }, { texte: "Fais de même de l'autre côté." }],
    },
    explications: {
      nature: [regime === "vide" ? `$k=${k}<${d}$ : la somme des distances ne descend jamais sous l'écartement $${d}$, le lieu est vide.` : regime === "bandePleine" ? `$k=${k}$ est exactement l'écartement : tous les points de la bande, bords compris, conviennent.` : `$k=${k}>${d}$ : deux droites parallèles à $a$ et $b$, de part et d'autre de la bande.`],
      droites: droites ? droites.map((x) => `$${latexDroite(x)}$`) : [],
    },
    configuration: { droites: [{ ...lig(p), couleur: "bleu", nom: "a" }, { ...lig(p + d), couleur: "bleu", nom: "b" }] },
    lieu: regime === "bandePleine" ? { bandes: [{ sens: verticale ? "verticale" : "horizontale", min: p, max: p + d, couleur: "vert" }] } : regime === "pairDeDroites" ? { droites: droites!.map((x) => ({ ...d3(x), couleur: "vert" as const, epais: true })), inclure: verticale ? [{ x: p + (d - k) / 2 - 1, y: 0 }, { x: p + (d + k) / 2 + 1, y: 0 }] : [{ y: p + (d - k) / 2 - 1, x: 0 }, { y: p + (d + k) / 2 + 1, x: 0 }] } : {},
  } as Ex;
}
function qOpp(c: number): Q {
  return q(Math.round(-2 * c), 2);
}

export function construirePerpendiculaires(): Ex {
  const p = tirerEntier(-3, 3);
  const qq = tirerEntier(-3, 3);
  const k = tirerEntier(1, 6);
  const S = [pt(p + k, qq), pt(p, qq + k), pt(p - k, qq), pt(p, qq - k)];
  return {
    ...base("E", "E_perpendiculaires", "carre"),
    phases: ["nature", "sommets"],
    consigne: "On cherche le lieu des points $P$ dont la somme des distances aux droites perpendiculaires $a$ et $b$ vaut $k$.",
    donnees: [`$a\\,:\\ x=${p}$, $b\\,:\\ y=${qq}$, $k=${k}$`],
    natures: NATURES_E,
    nature: "carre",
    sommets: S,
    consignes: { nature: "Quelle est la nature de ce lieu ?", sommets: "Donne les coordonnées de ses sommets (un par ligne, dans l'ordre que tu veux)." },
    aides: {
      nature: [{ texte: "Traduis : la distance de $P(x\\,;y)$ à $a$ est $|x-x_a|$, à $b$ est $|y-y_b|$." }, { texte: "Ici :", latex: `${abs("x", p)}+${abs("y", qq)}=${k}` }],
      sommets: [{ texte: "Les sommets sont sur $a$ ou sur $b$ : là où une des distances est nulle." }, { texte: `Sur $a$ ($x=${p}$) :`, latex: `${abs("y", qq)}=${k}` }],
    },
    explications: { nature: [`$${abs("x", p)}+${abs("y", qq)}=${k}$ : un carré posé sur une pointe, centré au point d'intersection de $a$ et $b$.`], sommets: [`Sommets : ${S.map((x) => `$${lp(x)}$`).join(", ")}.`] },
    configuration: { droites: [{ a: 1, b: 0, c: -p, couleur: "bleu", nom: "a" }, { a: 0, b: 1, c: -qq, couleur: "bleu", nom: "b" }] },
    lieu: { polygones: [{ pts: S.map(P2n), couleur: "vert" }], points: S.map((x) => ({ p: P2n(x), couleur: "vert" as const })) },
  } as Ex;
}

export function construireSecantes(): Ex {
  const [pp, qq0, n] = tirerParmi([
    [3, 4, 5],
    [4, 3, 5],
    [3, -4, 5],
    [4, -3, 5],
  ] as const);
  const k = tirerParmi([1, 2, 3, 4, 6]);
  const S = [pt((n * k) / pp, 0), pt((qq0 * k) / pp, k), pt((-n * k) / pp, 0), pt((-qq0 * k) / pp, -k)];
  const bLatex = latexSomme([
    [q(pp), "x"],
    [q(-qq0), "y"],
  ]);
  return {
    ...base("E", "E_secantes", "parallelogramme"),
    phases: ["nature", "sommets"],
    consigne: "On cherche le lieu des points $P$ dont la somme des distances aux droites sécantes $a$ et $b$ vaut $k$.",
    donnees: [`$a\\,:\\ y=0$, $b\\,:\\ ${bLatex}=0$, $k=${k}$`],
    natures: NATURES_E,
    nature: "parallelogramme",
    sommets: S,
    consignes: { nature: "Quelle est la nature de ce lieu ?", sommets: "Donne les coordonnées de ses sommets (un par ligne, dans l'ordre que tu veux)." },
    aides: {
      nature: [{ texte: "Traduis avec la distance d'un point à une droite :", latex: `|y|+\\dfrac{|${bLatex}|}{${n}}=${k}` }, { texte: "Dans chaque région délimitée par $a$ et $b$, c'est l'équation d'un segment : les sommets sont sur $a$ et sur $b$." }],
      sommets: [{ texte: "Sur $a$ ($y=0$) :", latex: `\\dfrac{|${pp}x|}{${n}}=${k}` }, { texte: "Sur $b$, la distance à $b$ est nulle :", latex: `|y|=${k}` }],
    },
    explications: { nature: ["Les quatre segments relient deux points de $a$ et deux points de $b$ ; ses diagonales sont portées par $a$ et $b$ et se coupent en leur milieu : un parallélogramme (pas un losange, car $a$ et $b$ ne sont pas perpendiculaires)."], sommets: [`Sommets : ${S.map((x) => `$${lp(x)}$`).join(", ")}.`] },
    configuration: { droites: [{ a: 0, b: 1, c: 0, couleur: "bleu", nom: "a" }, { a: pp, b: -qq0, c: 0, couleur: "bleu", nom: "b" }] },
    lieu: { polygones: [{ pts: S.map(P2n), couleur: "vert" }], points: S.map((x) => ({ p: P2n(x), couleur: "vert" as const })) },
  } as Ex;
}

export function construireCarreE(regime: "vide" | "bandePleine" | "formeEtendue" = tirerParmi(["vide", "bandePleine", "formeEtendue"] as const)): Ex {
  const c = tirerEntier(1, 4);
  const j = tirerEntier(1, 3);
  const k = regime === "vide" ? tirerEntier(1, 4 * c - 1) : regime === "bandePleine" ? 4 * c : 4 * c + 2 * j;
  const mm = c + j;
  const nature = regime === "vide" ? "vide" : regime === "bandePleine" ? "regionCarre" : "octogone";
  const S = [pt(c, mm), pt(-c, mm), pt(-mm, c), pt(-mm, -c), pt(-c, -mm), pt(c, -mm), pt(mm, -c), pt(mm, c)];
  const carre = [pt(c, c), pt(-c, c), pt(-c, -c), pt(c, -c)];
  return {
    ...base("E", "E_carre", nature),
    phases: regime === "formeEtendue" ? ["nature", "sommets"] : ["nature"],
    consigne: "On cherche le lieu des points $P$ dont la somme des distances aux quatre droites qui portent les côtés du carré vaut $k$.",
    donnees: [`carré de sommets $(${c}\\,;${c})$, $(-${c}\\,;${c})$, $(-${c}\\,;-${c})$, $(${c}\\,;-${c})$ ; $k=${k}$`],
    natures: NATURES_E,
    nature,
    sommets: regime === "formeEtendue" ? S : undefined,
    consignes: { nature: "Quelle est la nature de ce lieu ?", sommets: "Donne les coordonnées de ses sommets (un par ligne, dans l'ordre que tu veux)." },
    aides: {
      nature: [{ texte: "Pour deux côtés opposés, portés par $x=c$ et $x=-c$ : la somme des distances vaut $2c$ entre les deux droites, et $2|x|$ à l'extérieur." }, { texte: `Le seuil (le plus petit total possible) vaut $4c=${4 * c}$ ; ici $k=${k}$.` }],
      sommets: [{ texte: "Au-dessus du carré, entre $x=-c$ et $x=c$ : le total vaut $2c+2y$." }, { texte: "Ici :", latex: `${2 * c}+2y=${k}` }],
    },
    explications: {
      nature: [regime === "vide" ? `$k=${k}<4c=${4 * c}$ : le total ne descend jamais sous $${4 * c}$, le lieu est vide.` : regime === "bandePleine" ? `$k=4c=${4 * c}$ : tous les points du carré, intérieur et bord compris, ont ce total ; c'est le carré plein.` : `$k=${k}>4c=${4 * c}$ : des segments horizontaux et verticaux au-dessus, en dessous et sur les côtés, reliés par des segments obliques : un octogone.`, "Piège : le seuil est $4c$ pour une somme de distances simples ($4c^2$ pour une somme de carrés)."],
      sommets: [`Sommets : ${S.map((x) => `$${lp(x)}$`).join(", ")}.`],
    },
    configuration: { polygones: [{ pts: carre.map(P2n), couleur: "bleu" }], inclure: [{ x: -mm - 1, y: -mm - 1 }, { x: mm + 1, y: mm + 1 }] },
    lieu: regime === "bandePleine" ? { polygones: [{ pts: carre.map(P2n), couleur: "vert", rempli: true }] } : regime === "formeEtendue" ? { polygones: [{ pts: S.map(P2n), couleur: "vert" }], points: S.map((x) => ({ p: P2n(x), couleur: "vert" as const })) } : {},
  } as Ex;
}

// ============================================================================
// Catalogue
// ============================================================================

export type IdVarianteLieuxGeometriquesParametres =
  | "A_paralleles"
  | "A_nonBorne"
  | "A_losange"
  | "B_bissectrices"
  | "B_droite"
  | "B_cerclePerp"
  | "B_seuil2Points_cercle"
  | "B_seuil2Points_point"
  | "B_seuil2Points_vide"
  | "B_apollonius_k1"
  | "B_apollonius_kAutre"
  | "B_seuilCarre_cercle"
  | "B_seuilCarre_point"
  | "B_seuilCarre_vide"
  | "C_cercle"
  | "D_substitution"
  | "D_fractions"
  | "D_ratio"
  | "E_paralleles_vide"
  | "E_paralleles_bandePleine"
  | "E_paralleles_pairDeDroites"
  | "E_perpendiculaires"
  | "E_secantes"
  | "E_carre_vide"
  | "E_carre_bandePleine"
  | "E_carre_formeEtendue";

/** Catalogue : mêmes identifiants, même ordre qu'avant (les `?code=` imprimés gardent leur variante). */
export const CATALOGUE_VARIANTES: { id: IdVarianteLieuxGeometriquesParametres; label: string }[] = [
  { id: "A_paralleles", label: "A — |ax + by + c| = k" },
  { id: "A_nonBorne", label: "A — |x − p| − |y − q| = k (différence)" },
  { id: "A_losange", label: "A — |x − p| + |y − q| = k (somme)" },
  { id: "B_bissectrices", label: "B — Équidistance à deux droites" },
  { id: "B_droite", label: "B — PA² − PB² = k" },
  { id: "B_cerclePerp", label: "B — Carrés des distances à deux perpendiculaires" },
  { id: "B_seuil2Points_cercle", label: "B — PA² + PB² = k : cercle" },
  { id: "B_seuil2Points_point", label: "B — PA² + PB² = k : point" },
  { id: "B_seuil2Points_vide", label: "B — PA² + PB² = k : vide" },
  { id: "B_apollonius_k1", label: "B — PA² = k·PB² avec k = 1" },
  { id: "B_apollonius_kAutre", label: "B — PA² = k·PB² avec k ≠ 1" },
  { id: "B_seuilCarre_cercle", label: "B — Carrés des distances aux côtés d'un carré : cercle" },
  { id: "B_seuilCarre_point", label: "B — Carrés des distances aux côtés d'un carré : point" },
  { id: "B_seuilCarre_vide", label: "B — Carrés des distances aux côtés d'un carré : vide" },
  { id: "C_cercle", label: "C — m(x² + y²) + Dx + Ey + F = 0 : cercle, point ou vide" },
  { id: "D_substitution", label: "D — Paramètre sous une racine : parabole" },
  { id: "D_fractions", label: "D — Paramètre en fraction ou en puissance : droite" },
  { id: "D_ratio", label: "D — x = a·tᵐ, y = b·tⁿ" },
  { id: "E_paralleles_vide", label: "E — Deux parallèles : vide" },
  { id: "E_paralleles_bandePleine", label: "E — Deux parallèles : bande pleine" },
  { id: "E_paralleles_pairDeDroites", label: "E — Deux parallèles : deux droites" },
  { id: "E_perpendiculaires", label: "E — Deux perpendiculaires" },
  { id: "E_secantes", label: "E — Deux sécantes non perpendiculaires" },
  { id: "E_carre_vide", label: "E — Côtés d'un carré : vide" },
  { id: "E_carre_bandePleine", label: "E — Côtés d'un carré : carré plein" },
  { id: "E_carre_formeEtendue", label: "E — Côtés d'un carré : octogone" },
];

export function construireAvecVarianteId(id: string): Ex {
  switch (id as IdVarianteLieuxGeometriquesParametres) {
    case "A_paralleles":
      return construireParallelesA();
    case "A_nonBorne":
      return construireNonBorneA();
    case "A_losange":
      return construireLosangeA();
    case "B_bissectrices":
      return construireBissectrices();
    case "B_droite":
      return construireDroiteB();
    case "B_cerclePerp":
      return construireCerclePerp();
    case "B_seuil2Points_cercle":
      return construireSeuil2Points("cercle");
    case "B_seuil2Points_point":
      return construireSeuil2Points("point");
    case "B_seuil2Points_vide":
      return construireSeuil2Points("vide");
    case "B_apollonius_k1":
      return construireApollonius(true);
    case "B_apollonius_kAutre":
      return construireApollonius(false);
    case "B_seuilCarre_cercle":
      return construireSeuilCarre("cercle");
    case "B_seuilCarre_point":
      return construireSeuilCarre("point");
    case "B_seuilCarre_vide":
      return construireSeuilCarre("vide");
    case "C_cercle":
      return construireFamilleC();
    case "D_substitution":
      return construireSubstitution();
    case "D_fractions":
      return construireFractions();
    case "D_ratio":
      return construireRatio();
    case "E_paralleles_vide":
      return construireParallelesE("vide");
    case "E_paralleles_bandePleine":
      return construireParallelesE("bandePleine");
    case "E_paralleles_pairDeDroites":
      return construireParallelesE("pairDeDroites");
    case "E_perpendiculaires":
      return construirePerpendiculaires();
    case "E_secantes":
      return construireSecantes();
    case "E_carre_vide":
      return construireCarreE("vide");
    case "E_carre_bandePleine":
      return construireCarreE("bandePleine");
    default:
      return construireCarreE("formeEtendue");
  }
}

/** Tirage libre : famille à parts égales, puis sous-type ; verdicts tirés dans le constructeur. */
export function genererExerciceLieuxGeometriquesParametres(): Ex {
  const famille = tirerParmi(["A", "B", "C", "D", "E"] as const);
  switch (famille) {
    case "A":
      return tirerParmi([construireParallelesA, construireNonBorneA, construireLosangeA])();
    case "B":
      return tirerParmi([construireBissectrices, construireDroiteB, construireCerclePerp, () => construireSeuil2Points(), () => construireApollonius(), () => construireSeuilCarre()])();
    case "C":
      return construireFamilleC();
    case "D":
      return tirerParmi([() => construireSubstitution(), () => construireFractions(), () => construireRatio()])();
    default:
      return tirerParmi([() => construireParallelesE(), construirePerpendiculaires, construireSecantes, () => construireCarreE()])();
  }
}

/** Groupes à verdict : le nom de ces variantes dit le régime (panneau d'évaluation). */
export const GROUPES_VERDICT_6GEN56 = [
  { id: "groupe_seuil_2points", label: "B — PA² + PB² = k (cercle, point ou vide)", variantes: ["B_seuil2Points_cercle", "B_seuil2Points_point", "B_seuil2Points_vide"] },
  { id: "groupe_apollonius", label: "B — PA² = k·PB² (droite ou cercle)", variantes: ["B_apollonius_k1", "B_apollonius_kAutre"] },
  { id: "groupe_seuil_carre", label: "B — Carrés des distances aux côtés d'un carré (cercle, point ou vide)", variantes: ["B_seuilCarre_cercle", "B_seuilCarre_point", "B_seuilCarre_vide"] },
  { id: "groupe_paralleles", label: "E — Deux parallèles (vide, bande ou deux droites)", variantes: ["E_paralleles_vide", "E_paralleles_bandePleine", "E_paralleles_pairDeDroites"] },
  { id: "groupe_carre", label: "E — Côtés d'un carré (vide, carré plein ou octogone)", variantes: ["E_carre_vide", "E_carre_bandePleine", "E_carre_formeEtendue"] },
];
