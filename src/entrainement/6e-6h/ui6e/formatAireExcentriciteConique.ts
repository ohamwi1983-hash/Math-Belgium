import type { ExerciceAireA, ExerciceAireB, ExerciceAireExcentriciteConique } from "../core6e/aireExcentriciteConique.types";
import type { PhaseAireExcentriciteConique } from "../moteur6e/typesAireExcentriciteConique";
import { apercuSaisieLatex, latexQ, latexRacine, lireNombre, pt, q, qMul, qNum } from "../moteur6e/algebreLieux";
import { relationToujoursVraie } from "../moteur6e/saisieConiques";
import { f } from "./fragmentsCombinatoire";
import type { AideCombi, ChampCombi, FormatCombinatoire, FragmentConsigne } from "./fragmentsCombinatoire";
import { champNombreUI, PH_EQUATION } from "./textesLieux";
import { EXACT, L } from "./textesConiques";
import { figureLieux } from "./figureLieux";
import { ajouterConique, objetsVides } from "./traceConiques";

/**
 * Textes de `6gen60` — Aire, rayons focaux et excentricité (6e ch. 10, § 3 ; audit, lots B et C).
 * Énoncés tirés, valeurs exactes (aire en racine simplifiée, plus de « ≈ 17.23 »), placeholders de
 * FORMAT seulement (plus de « ex : b=c », G4), notation du cours (angle FPF′ chapeauté, aire 𝒜).
 */

type E = ExerciceAireExcentriciteConique;
type P = PhaseAireExcentriciteConique;

const lq = latexQ;
const ANGLES_REMARQUABLES: Record<string, string> = { "1/2": "60", "0/1": "90", "-1/2": "120" };
const cleQ = (r: { n: bigint; d: bigint }) => `${r.n}/${r.d}`;

function equationA(e: ExerciceAireA): string {
  return `\\dfrac{x^2}{${e.a * e.a}}+\\dfrac{y^2}{${e.b * e.b}}=1`;
}
function conditionB(e: ExerciceAireB): string {
  if (e.sousType === "abscisseFoyerParallele") return `la droite $(OP)$ est parallèle à la droite $(A'K)$, avec $K\\left(0\\,;${lq(e.parametre) === "1" ? "" : lq(e.parametre)}\\,b\\right)$`;
  if (e.sousType === "angleSommetNonFocal") {
    const deg = ANGLES_REMARQUABLES[cleQ(e.parametre)];
    return deg ? `l'angle $\\widehat{FBF'}$ mesure $${deg}^\\circ$` : `$\\cos\\widehat{FBF'}=${lq(e.parametre)}$`;
  }
  return `la distance entre les deux directrices vaut $${lq(e.parametre)}$ fois la distance focale $FF'$`;
}
function relationB(e: ExerciceAireB): string {
  if (e.sousType === "abscisseFoyerParallele") {
    const t = lq(e.parametre);
    return `\\frac{b^2}{ac}=\\frac{${t === "1" ? "" : t}b}{a},\\ \\text{soit } b=${t === "1" ? "" : t}c`;
  }
  if (e.sousType === "angleSommetNonFocal") return `\\cos\\widehat{FBF'}=\\frac{b^2-c^2}{b^2+c^2}=\\frac{b^2-c^2}{a^2}=${lq(e.parametre)}`;
  return `\\frac{2a^2}{c}=${lq(e.parametre)}\\cdot 2c,\\ \\text{soit } a^2=${lq(e.parametre)}\\,c^2`;
}

export const FORMAT_6GEN60: FormatCombinatoire<E, P> = {
  consigneGenerale(e) {
    if (e.famille === "A") return f("On donne une ellipse de foyers $F$ et $F'$, et un point $P$ de cette ellipse. Détermine les rayons focaux $PF$ et $PF'$, puis l'aire du triangle $FPF'$." + EXACT);
    const base = "Une ellipse d'équation $\\frac{x^2}{a^2}+\\frac{y^2}{b^2}=1$ ($a>b>0$) a pour foyers $F(c\\,;0)$ et $F'(-c\\,;0)$.";
    if (e.sousType === "abscisseFoyerParallele") return f(`${base} Le point $P$ de l'ellipse, d'ordonnée positive, a la même abscisse que $F$, et $A'(-a\\,;0)$ est un sommet. Détermine l'excentricité $e$ de l'ellipse.` + EXACT);
    if (e.sousType === "angleSommetNonFocal") return f(`${base} $B(0\\,;b)$ est un sommet de l'axe non focal. Détermine l'excentricité $e$ de l'ellipse.` + EXACT);
    return f(`${base} Détermine son excentricité $e$.` + EXACT);
  },
  donnees(e) {
    if (e.famille === "A") return [f(`ellipse : $${equationA(e)}$`), f(`$PF=${lq(e.k)}\\cdot PF'$`)];
    return [f(`Condition : ${conditionB(e)}.`)];
  },
  consigneEcran(_e, p) {
    switch (p) {
      case "aRayons":
        return f("Calcule les rayons focaux $PF$ et $PF'$.");
      case "aCos":
        return f("Calcule $\\cos\\widehat{FPF'}$.");
      case "aAire":
        return f("Calcule l'aire $\\mathcal{A}$ du triangle $FPF'$.");
      case "bRelation":
        return f("Traduis la condition par une relation entre $a$, $b$, $c$ (ou directement $e$).");
      case "bE":
        return f("Déduis-en l'excentricité $e$.");
    }
  },
  champs(_e, p): ChampCombi[] {
    switch (p) {
      case "aRayons":
        return [champNombreUI("$PF$"), champNombreUI("$PF'$")];
      case "aCos":
        return [champNombreUI("$\\cos\\widehat{FPF'}$")];
      case "aAire":
        return [champNombreUI("Aire $\\mathcal{A}$")];
      case "bRelation":
        return [{ type: "texte", label: "Relation", placeholder: PH_EQUATION, apercuFn: (v) => apercuSaisieLatex(v, ["a", "b", "c", "e"]) }];
      case "bE":
        return [champNombreUI("$e$")];
    }
  },
  aides: aides60,
  reponseAttendue: reponse60,
  explication: explication60,
  libellePhase: (_e, p) => LIBELLES[p],
  messageCible: cible60,
};

const LIBELLES: Record<P, string> = {
  aRayons: "Rayons focaux",
  aCos: "Cosinus de l'angle",
  aAire: "Aire du triangle",
  bRelation: "Relation",
  bE: "Excentricité",
};

function aides60(e: E, p: P): AideCombi[] {
  if (e.famille === "A") {
    const c2 = e.a * e.a - e.b * e.b;
    if (p === "aRayons") return [{ texte: "Pour tout point de l'ellipse :", latex: "PF+PF'=2a" }, { texte: "Ici, un système de deux équations :", latex: `\\begin{cases}PF+PF'=${2 * e.a}\\\\ PF=${lq(e.k)}\\cdot PF'\\end{cases}` }];
    if (p === "aCos") return [{ texte: "Théorème d'Al-Kashi dans le triangle $FPF'$, avec $FF'=2c$ :", latex: "FF'^2=PF^2+PF'^2-2\\cdot PF\\cdot PF'\\cos\\widehat{FPF'}" }, { texte: "Ici :", latex: `c^2=a^2-b^2=${c2},\\quad FF'^2=4c^2=${4 * c2}` }];
    return [{ texte: "Aire d'un triangle à partir de deux côtés et de l'angle compris, avec $\\sin^2+\\cos^2=1$ :", latex: "\\mathcal{A}=\\frac{1}{2}\\,PF\\cdot PF'\\sin\\widehat{FPF'}" }, { texte: "Ici :", latex: `\\sin^2\\widehat{FPF'}=1-\\left(${lq(e.cos)}\\right)^2` }];
  }
  if (p === "bRelation") {
    if (e.sousType === "abscisseFoyerParallele") return [{ texte: "Calcule l'ordonnée de $P$ (on remplace $x$ par $c$), puis écris que les deux droites ont la même pente :", latex: "y_P=\\frac{b^2}{a}" }, { texte: "Pentes à égaler :", latex: "\\text{pente de }(OP)=\\frac{y_P}{c},\\qquad \\text{pente de }(A'K)=\\frac{y_K}{a}" }];
    if (e.sousType === "angleSommetNonFocal") return [{ texte: "Dans le triangle isocèle $FBF'$, $BF=BF'=a$ (somme des distances aux foyers) et $FF'=2c$." }, { texte: "Al-Kashi en $B$ :", latex: "4c^2=2a^2-2a^2\\cos\\widehat{FBF'}" }];
    return [{ texte: "Les directrices sont les droites $x=\\pm\\frac{a^2}{c}$ ; la distance focale vaut $2c$." }, { texte: "Distance entre les directrices :", latex: "\\frac{2a^2}{c}" }];
  }
  return [{ texte: "Excentricité :", latex: "e=\\frac{c}{a},\\qquad b^2=a^2-c^2" }, { texte: "Relation obtenue :", latex: relationB(e) }];
}

function reponse60(e: E, p: P): string[] {
  if (e.famille === "A") {
    if (p === "aRayons") return [`PF=${lq(e.pf)}`, `PF'=${lq(e.pfp)}`];
    if (p === "aCos") return [`\\cos\\widehat{FPF'}=${lq(e.cos)}`];
    return [`\\mathcal{A}=${latexRacine(e.aire2)}`];
  }
  if (p === "bRelation") return [relationB(e)];
  return [`e=${latexRacine(e.e2)}`];
}

function explication60(e: E, p: P): FragmentConsigne[][] {
  if (e.famille === "A") {
    const c2 = e.a * e.a - e.b * e.b;
    if (p === "aRayons") return L(`$PF+PF'=${2 * e.a}$ et $PF=${lq(e.k)}\\,PF'$ : $\\left(${lq(e.k)}+1\\right)PF'=${2 * e.a}$, donc $PF'=${lq(e.pfp)}$ et $PF=${lq(e.pf)}$.`, "Piège : $2a$ est la somme des deux rayons focaux, pas l'un d'eux.");
    if (p === "aCos") return L(`$4c^2=${4 * c2}$ ; Al-Kashi : $\\cos\\widehat{FPF'}=\\dfrac{PF^2+PF'^2-4c^2}{2\\,PF\\cdot PF'}=${lq(e.cos)}$.`);
    const sin2 = q(Number(e.cos.d * e.cos.d - e.cos.n * e.cos.n), Number(e.cos.d * e.cos.d));
    return L(`$\\sin\\widehat{FPF'}=\\sqrt{1-\\left(${lq(e.cos)}\\right)^2}=${latexRacine(sin2)}$ (l'angle est entre $0^\\circ$ et $180^\\circ$, son sinus est positif).`, `$\\mathcal{A}=\\frac{1}{2}\\cdot${lq(e.pf)}\\cdot${lq(e.pfp)}\\cdot${latexRacine(sin2)}=${latexRacine(e.aire2)}$.`);
  }
  if (p === "bRelation") return L(`$${relationB(e)}$.`, "Toute relation équivalente convient (en $a$, $b$, $c$ ou en $e$).");
  const e2 = e.e2;
  return L(`En divisant par $a^2$ (avec $c=ea$ et $b^2=a^2-c^2$), la relation donne $e^2=${lq(e2)}$, donc $e=${latexRacine(e2)}$.`, "Vérification : $0<e<1$, c'est bien une ellipse.");
}

function cible60(e: E, p: P, v: string[]): FragmentConsigne[] | null {
  const n = (s: string) => {
    try {
      return lireNombre(s).valeur;
    } catch {
      return null;
    }
  };
  const pres = (a: number | null, b: number) => a !== null && Math.abs(a - b) < 1e-9 * Math.max(1, Math.abs(b));
  if (e.famille === "A") {
    if (p === "aRayons" && pres(n(v[0]), qNum(e.pfp)) && pres(n(v[1]), qNum(e.pf))) return f("$PF$ et $PF'$ sont échangés : $PF$ est $" + lq(e.k) + "$ fois plus grand.");
    if (p === "aCos" && pres(n(v[0]), -qNum(e.cos))) return f("Attention au signe : $\\cos\\widehat{FPF'}=\\dfrac{PF^2+PF'^2-FF'^2}{2\\,PF\\cdot PF'}$.");
    if (p === "aAire") {
      const x = n(v[0]);
      if (pres(x, 2 * Math.sqrt(qNum(e.aire2)))) return f("N'oublie pas le facteur $\\frac{1}{2}$ de l'aire du triangle.");
      if (pres(x, 0.5 * qNum(e.pf) * qNum(e.pfp))) return f("L'aire fait intervenir le sinus de l'angle compris.");
    }
    return null;
  }
  if (p === "bRelation" && relationToujoursVraie(v[0])) return f("Cette relation est vraie pour toute ellipse : elle ne traduit pas la condition de l'énoncé.");
  if (p === "bE" && pres(n(v[0]), qNum(e.e2))) return f("C'est $e^2$ : l'excentricité en est la racine carrée.");
  return null;
}

// ---------------------------------------------------------------------------
// Figure
// ---------------------------------------------------------------------------

export function figure6gen60(e: E, closes: readonly P[]): string | null {
  const o = objetsVides();
  if (e.famille === "A") {
    const c = Math.sqrt(e.a * e.a - e.b * e.b);
    const pf = qNum(e.pf);
    const pfp = qNum(e.pfp);
    // F(c ; 0), F′(−c ; 0) : PF² − PF′² = −4cx.
    const x = (pfp * pfp - pf * pf) / (4 * c);
    const y = e.b * Math.sqrt(Math.max(0, 1 - (x * x) / (e.a * e.a)));
    const conique = { type: "ellipse" as const, centre: pt(0, 0), axe: "x" as const, a2: q(e.a * e.a), b2: q(e.b * e.b) };
    ajouterConique(o, conique, 2 * e.a + 2, { couleur: "bleu", foyers: true });
    const F = { x: c, y: 0 };
    const Fp = { x: -c, y: 0 };
    const P = { x, y };
    if (closes.includes("aAire")) o.polygones.push({ pts: [F, P, Fp], couleur: "vert", rempli: true, trait: false });
    o.segments.push({ a: P, b: F, couleur: "accent" }, { a: P, b: Fp, couleur: "accent" });
    o.points.push({ p: P, nom: "P", couleur: "encre" });
    o.fenetre = { xmin: -e.a - 1, xmax: e.a + 1, ymin: -e.b - 1, ymax: e.b + 1 };
    return figureLieux(o);
  }
  if (!closes.includes("bE")) return null;
  const a = 5;
  const e2 = qNum(e.e2);
  const c = a * Math.sqrt(e2);
  const b = Math.sqrt(a * a - c * c);
  const conique = { type: "ellipse" as const, centre: pt(0, 0), axe: "x" as const, a2: q(25), b2: qMul(q(25), q(Number(e.e2.d - e.e2.n), Number(e.e2.d))) };
  ajouterConique(o, conique, 12, { couleur: "vert", foyers: true, directrices: e.sousType === "distanceDirectrices" });
  if (e.sousType === "abscisseFoyerParallele") {
    const yP = (b * b) / a;
    const t = qNum(e.parametre);
    o.points.push({ p: { x: c, y: yP }, nom: "P" }, { p: { x: -a, y: 0 }, nom: "A′" }, { p: { x: 0, y: t * b }, nom: "K" });
    o.segments.push({ a: { x: 0, y: 0 }, b: { x: c, y: yP }, couleur: "accent" }, { a: { x: -a, y: 0 }, b: { x: 0, y: t * b }, couleur: "accent" });
  } else if (e.sousType === "angleSommetNonFocal") {
    o.points.push({ p: { x: 0, y: b }, nom: "B" });
    o.segments.push({ a: { x: 0, y: b }, b: { x: c, y: 0 }, couleur: "accent" }, { a: { x: 0, y: b }, b: { x: -c, y: 0 }, couleur: "accent" });
  }
  const larg = e.sousType === "distanceDirectrices" ? Math.max(a + 1, (a * a) / c + 1) : a + 1;
  const haut = e.sousType === "abscisseFoyerParallele" ? Math.max(b, qNum(e.parametre) * b) + 1 : b + 1;
  o.fenetre = { xmin: -larg, xmax: larg, ymin: -b - 1, ymax: haut };
  return figureLieux(o);
}
