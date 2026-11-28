import type { AffixeSimple, ExerciceComplexesA, ExerciceComplexesAvances, ExerciceComplexesB, ExerciceComplexesBIntersection, ExerciceComplexesBSimple, ExerciceComplexesC, ExerciceComplexesD, ExerciceComplexesE } from "../../core6e/complexesAvances.types";
import type { AngleRemarquable } from "../../core6e/formeTrigonometrique.types";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul as ligneCalcul, latex, ligne, piege as lignePiege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import { affixeLatex, affixeLatexRationnel, aideNiveau1, equationDReelles, formatReponseAttenduePhaseLatex } from "../../ui6e/formatComplexesAvances";
import { phasesPourExercice, type PhaseComplexesAvances } from "../../moteur6e/typesComplexesAvances";
import { solutionsDModules } from "../../moteur6e/verificationComplexesAvances";
import { type Fraction, cz, frac, fracLatex, fois, lignesCarre, lignesProduit, mono, par, parP, plus, pn, somme } from "../../ui6e/corrigeComplexes";
import { pointRemarquablePour } from "../racinesNiemes/fermeture";
import { racinesRatio } from "./familleD";
import { racineRationnelleLatex } from "./racineRationnelle";
import { COULEURS, planComplexeSvg } from "../figuresPlanComplexe40-42";
import type { Coord, PointPlan } from "../figuresPlanComplexe40-42";

/**
 * Corrigé détaillé « comme au tableau » de `6gen42` (nombres complexes — problèmes avancés) —
 * règle `.claude/rules/feuilles-evaluations.md` (« Corrigé détaillé — comme au tableau »). Une étape
 * par écran, pour CHAQUE variante : ce qu'on utilise (avec le renvoi au cours), le calcul écrit une
 * transformation par ligne (valeurs de l'instance, exactes : fractions, radicaux simplifiés), le
 * résultat (réponse de l'écran, `formatReponseAttenduePhaseLatex`), une vérification quand elle est
 * parlante et le piège de l'étape ; figure du lieu / des solutions à la dernière étape.
 */

const LETTRES = "abcdefghij";
const cours = (n: number | string): string => `(cours, point ${n})`;
const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);
/** Signe moins typographique dans un texte (jamais « - » visible). */
const tm = (valeur: string): string => valeur.replace(/-/g, "−");

function reponse(e: ExerciceComplexesAvances, phase: PhaseComplexesAvances): FragmentConsigne[] {
  return [f(formatReponseAttenduePhaseLatex(e, phase).join(",\\quad "))];
}

// ---------------------------------------------------------------------------------------------
// Petits outils d'écriture (fractions, polynômes de degré 2 en x et y)
// ---------------------------------------------------------------------------------------------

const Z: Fraction = { n: 0, d: 1 };
const q = (n: number, d = 1): Fraction => frac(n, d);
const neg = (a: Fraction): Fraction => frac(-a.n, a.d);
const moinsQ = (a: Fraction, b: Fraction): Fraction => plus(a, neg(b));
const estZ = (a: Fraction): boolean => a.n === 0;
/** Fraction en LaTeX, jamais décimale : « 3 », « -\frac{8}{3} ». */
const qL = (a: Fraction): string => fracLatex(a, { decimal: false });
/** Base d'une puissance : entre parenthèses si elle est négative ou fractionnaire. */
const pqL = (a: Fraction): string => (a.n < 0 || a.d !== 1 ? `\\left(${qL(a)}\\right)` : qL(a));
/** Monôme à coefficient rationnel : « x », « -x », « 3x », « \frac{2}{3}x », « » si nul. */
function termeQ(c: Fraction, s: string): string {
  if (c.n === 0) return "";
  if (c.d === 1) return mono(c.n, s);
  return `${qL(c)}${s}`;
}

type Mon = "x2" | "y2" | "xy" | "x" | "y" | "c";
type P2 = Partial<Record<Mon, Fraction>>;
const SYM: Record<Mon, string> = { x2: "x^2", y2: "y^2", xy: "xy", x: "x", y: "y", c: "" };
const MONOMES: Mon[] = ["x2", "y2", "xy", "x", "y", "c"];
const coefP = (p: P2, m: Mon): Fraction => p[m] ?? Z;
function addP(a: P2, b: P2): P2 {
  const r: P2 = {};
  for (const m of MONOMES) r[m] = plus(coefP(a, m), coefP(b, m));
  return r;
}
function scaleP(a: P2, k: Fraction): P2 {
  const r: P2 = {};
  for (const m of MONOMES) r[m] = fois(coefP(a, m), k);
  return r;
}
/** Produit de deux expressions du premier degré (termes x, y, constante). */
function mulLin(a: P2, b: P2): P2 {
  const [ax, ay, ac] = [coefP(a, "x"), coefP(a, "y"), coefP(a, "c")];
  const [bx, by, bc] = [coefP(b, "x"), coefP(b, "y"), coefP(b, "c")];
  return {
    x2: fois(ax, bx),
    y2: fois(ay, by),
    xy: plus(fois(ax, by), fois(ay, bx)),
    x: plus(fois(ax, bc), fois(ac, bx)),
    y: plus(fois(ay, bc), fois(ac, by)),
    c: fois(ac, bc),
  };
}
function polyLatex(p: P2, ordre: Mon[] = ["x2", "x", "y2", "y", "xy", "c"]): string {
  return somme(ordre.map((m) => termeQ(coefP(p, m), SYM[m])));
}
/** x − v (variable décalée), v rationnel. */
const linDecale = (v: "x" | "y", c: Fraction): P2 => ({ [v]: q(1), c: neg(c) });
/** « x−3 » (sans parenthèses), « x » si v = 0. */
function decaleQ(v: string, c: Fraction): string {
  if (estZ(c)) return v;
  return `${v}${c.n > 0 ? "-" : "+"}${qL(frac(Math.abs(c.n), c.d))}`;
}
/** « (x−3) » entre parenthèses, « x » si v = 0. */
const facteurQ = (v: string, c: Fraction): string => (estZ(c) ? v : `(${decaleQ(v, c)})`);
/** « \left(x−3\right)^2 », « x^2 » si v = 0 — même écriture que l'équation attendue de l'écran. */
const carreQ = (v: string, c: Fraction): string => (estZ(c) ? `${v}^2` : `\\left(${decaleQ(v, c)}\\right)^2`);
/** Produit de deux facteurs écrits : « x\cdot x » plutôt que « xx ». */
const produitF = (a: string, b: string): string => (/^[a-z]$/.test(a) && /^[a-z]$/.test(b) ? `${a}\\cdot ${b}` : `${a}${b}`);
/** Coefficient entier devant un facteur écrit : « 6(y+1) », « -(x+3) », « 2y ». */
function coefFacteur(c: number, facteur: string): string {
  if (c === 0) return "";
  if (c === 1) return facteur;
  if (c === -1) return `-${facteur}`;
  return `${c}${facteur}`;
}
/** c₁·m + c₀ écrit comme dans l'énoncé (« 4−m », « 4m−16 », « 16−4m »). */
function linM(c1: number, c0: number): string {
  return c1 < 0 && c0 > 0 ? somme([mono(c0), mono(c1, "m")]) : somme([mono(c1, "m"), mono(c0)]);
}
/** Affixe entière entre parenthèses si elle a deux termes ou commence par « - ». */
const parAff = (z: AffixeSimple): string => par(affixeLatex(z));

/**
 * √(num/den) écrit pas à pas jusqu'au radical simplifié de `racineRationnelleLatex` : extraction du
 * plus grand carré, racine d'un quotient, dénominateur rendu rationnel.
 */
function lignesRacine(gauche: string, numBrut: number, denBrut: number): LigneCalcul[] {
  const g0 = frac(numBrut, denBrut);
  const [num, den] = [g0.n, g0.d];
  const carre = (n: number) => {
    let s = 1;
    let r = n;
    for (let d = 2; d * d <= r; d++) {
      while (r % (d * d) === 0) {
        r /= d * d;
        s *= d;
      }
    }
    return { s, r };
  };
  const fin = racineRationnelleLatex(num, den).latex;
  const L: LigneCalcul[] = [ligne(`${gauche}=\\sqrt{${den === 1 ? num : `\\frac{${num}}{${den}}`}}`)];
  const norm = (x: string) => x.replace(/\\dfrac/g, "\\frac");
  const pousser = (latexL: string, justification?: string) => {
    const derniere = L[L.length - 1].latex;
    if (norm(derniere).endsWith(`=${norm(latexL)}`)) return;
    L.push(ligne(`=${latexL}`, justification));
  };
  const n = carre(num);
  const d = carre(den);
  const rac = (k: { s: number; r: number }) => (k.r === 1 ? `${k.s}` : `${k.s === 1 ? "" : k.s}\\sqrt{${k.r}}`);
  if (den === 1) {
    if (n.s > 1 && n.r > 1) pousser(`\\sqrt{${n.s * n.s}\\cdot ${n.r}}`, "on fait apparaître un carré");
    pousser(fin, n.r === 1 ? "racine d'un carré" : "√(a²b) = a√b");
    return L;
  }
  pousser(`\\dfrac{\\sqrt{${num}}}{\\sqrt{${den}}}`, "√(a / b) = √a / √b");
  if (n.s > 1 || d.s > 1) pousser(`\\dfrac{${rac(n)}}{${rac(d)}}`, "on extrait les carrés");
  if (d.r > 1) pousser(`\\dfrac{${rac(n)}\\cdot\\sqrt{${d.r}}}{${rac(d)}\\cdot\\sqrt{${d.r}}}`, `on multiplie haut et bas par √${d.r}`);
  pousser(fin, d.r > 1 ? "√a · √a = a, puis on simplifie" : "on simplifie");
  return L;
}

/** cos et sin exacts (LaTeX) d'un angle remarquable de la banque. */
function cosSin(a: AngleRemarquable): { cos: string; sin: string; cosN: number; sinN: number } {
  const pt = pointRemarquablePour(a);
  return { cos: pt.cos.latex, sin: pt.sin.latex, cosN: pt.cos.numerique, sinN: pt.sin.numerique };
}
/** « \cos\frac{\pi}{6} », « \cos\left(-\frac{3\pi}{4}\right) », « \cos 0 ». */
function trig(fn: "cos" | "sin" | "tan", a: string): string {
  if (a === "0") return `\\${fn} 0`;
  return a.startsWith("-") ? `\\${fn}\\left(${a}\\right)` : `\\${fn}${a}`;
}
const TANGENTES: [number, string][] = [
  [0, "0"],
  [1 / Math.sqrt(3), "\\frac{\\sqrt{3}}{3}"],
  [1, "1"],
  [Math.sqrt(3), "\\sqrt{3}"],
];
function tanLatex(a: AngleRemarquable): string {
  const v = Math.tan(a.numerique);
  const abs = TANGENTES.find(([x]) => Math.abs(Math.abs(v) - x) < 1e-9)?.[1] ?? "?";
  return v < -1e-9 ? `-${abs}` : abs;
}

// ---------------------------------------------------------------------------------------------
// Figures du corrigé
// ---------------------------------------------------------------------------------------------

const xy = (z: { a: number; b: number }): Coord => [z.a, z.b];

function figureA(e: ExerciceComplexesA): string {
  const R = Math.pow(e.k, 1 / e.n);
  const angles = e.n === 4 ? [0, Math.PI / 2, Math.PI, -Math.PI / 2] : [0, (2 * Math.PI) / 3, (-2 * Math.PI) / 3];
  return planComplexeSvg({
    cercles: [{ cx: 0, cy: 0, r: R, pointilles: true, couleur: COULEURS.doux, epaisseur: 1.1 }],
    demiDroites: angles.map((angle) => ({ origine: [0, 0] as Coord, angle, depuis: R, couleur: COULEURS.accent })),
    points: angles.map((angle) => ({ x: R * Math.cos(angle), y: R * Math.sin(angle), creux: true, couleur: COULEURS.accent })),
    inclure: [
      [-3.2, -3.2],
      [3.2, 3.2],
    ],
    libelle: "Points M dont l'affixe z vérifie la condition",
  });
}

function figureB(e: ExerciceComplexesB): string {
  if (e.sousType === "intersection") {
    return planComplexeSvg({
      droites: [{ p1: xy(e.q1), p2: xy(e.q2), couleur: COULEURS.ciel }],
      cercles: [{ cx: 0, cy: 0, r: Math.sqrt(e.kCercleO), couleur: COULEURS.accent }],
      points: [
        { x: e.q1.a, y: e.q1.b, etiquette: affixeLatexTexte(e.q1), couleur: COULEURS.bon },
        { x: e.q2.a, y: e.q2.b, etiquette: affixeLatexTexte(e.q2), couleur: COULEURS.bon, position: "so" },
      ],
      libelle: "La droite, le cercle et leurs points d'intersection",
    });
  }
  const r = e.resultat;
  const pole = e.poleExclu ? [{ x: e.poleExclu.a, y: e.poleExclu.b, creux: true, couleur: COULEURS.mauvais, etiquette: "exclu" } as PointPlan] : [];
  if (r.nature === "droite") {
    return planComplexeSvg({
      droites: [{ p1: xy(r.point1), p2: xy(r.point2), couleur: COULEURS.accent }],
      points: [...[r.point1, r.point2].filter((p) => !e.poleExclu || p.a !== e.poleExclu.a || p.b !== e.poleExclu.b).map((p) => ({ x: p.a, y: p.b, couleur: COULEURS.encre })), ...pole],
      libelle: "Le lieu de M : une droite",
    });
  }
  if (r.nature === "cercle") {
    return planComplexeSvg({
      cercles: [{ cx: r.centre.a, cy: r.centre.b, r: r.rayon, couleur: COULEURS.accent }],
      points: [{ x: r.centre.a, y: r.centre.b, etiquette: "centre", couleur: COULEURS.encre, position: "s" }, ...pole],
      libelle: "Le lieu de M : un cercle",
    });
  }
  return planComplexeSvg({
    demiDroites: r.angles.map((a) => ({ origine: xy(r.origine), angle: a.numerique, couleur: COULEURS.accent })),
    points: [{ x: r.origine.a, y: r.origine.b, creux: true, couleur: COULEURS.accent, etiquette: "origine exclue", position: "s" }, ...pole],
    libelle: "Le lieu de M : demi-droite(s)",
  });
}

/** Étiquette texte d'une affixe entière (« 2−i ») pour la figure : signe moins typographique. */
function affixeLatexTexte(z: { a: number; b: number }): string {
  return affixeLatex(z).replace(/-/g, "−");
}

function figureDModules(e: Extract<ExerciceComplexesD, { sousType: "modules" }>): string {
  const num = 2 * (e.dImaginaire ? e.q : e.p);
  const d: Coord = e.dImaginaire ? [0, num / e.r] : [num / e.r, 0];
  const milieu: Coord = [d[0] / 2, d[1] / 2];
  const sol = solutionsDModules(e);
  return planComplexeSvg({
    cercles: [{ cx: 0, cy: 0, r: 1, couleur: COULEURS.accent }],
    droites: [{ p1: milieu, p2: e.dImaginaire ? [milieu[0] + 1, milieu[1]] : [milieu[0], milieu[1] + 1], couleur: COULEURS.ciel }],
    segments: [{ de: [0, 0], a: d, pointilles: true, couleur: COULEURS.doux }],
    points: [{ x: d[0], y: d[1], etiquette: "d", couleur: COULEURS.encre, position: "se" }, ...sol.map((z) => ({ x: z.re, y: z.im, couleur: COULEURS.bon }))],
    inclure: [
      [-1.5, -1.5],
      [1.5, 1.5],
    ],
    libelle: "Cercle unité et médiatrice du segment joignant O au point d'affixe d",
  });
}

function figureE(e: ExerciceComplexesE): string {
  return planComplexeSvg({
    droites: [
      { p1: xy(e.zA), p2: xy(e.zB), couleur: COULEURS.accent },
      { p1: xy(e.zC), p2: xy(e.zD), couleur: COULEURS.ciel },
    ],
    points: [
      { x: e.zA.a, y: e.zA.b, etiquette: "A", couleur: COULEURS.accent },
      { x: e.zB.a, y: e.zB.b, etiquette: "B", couleur: COULEURS.accent },
      { x: e.zC.a, y: e.zC.b, etiquette: "C", couleur: COULEURS.ciel },
      { x: e.zD.a, y: e.zD.b, etiquette: "D", couleur: COULEURS.ciel },
    ],
    libelle: "Les droites (AB) et (CD)",
  });
}

export function figure(e: ExerciceComplexesAvances): string | null {
  switch (e.famille) {
    case "A":
      return figureA(e);
    case "B":
      return figureB(e);
    case "D":
      return e.sousType === "modules" ? figureDModules(e) : null;
    case "E":
      return figureE(e);
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------------------------
// Structure d'une étape
// ---------------------------------------------------------------------------------------------

interface BlocCalcul {
  lignes: LigneCalcul[];
  intro?: FragmentConsigne[];
  label?: string;
}

interface Etape {
  utilise: FragmentConsigne[];
  calculs: BlocCalcul[];
  verification?: { fragments: FragmentConsigne[]; lignes?: LigneCalcul[] };
}

/** Lignes consécutives identiques retirées (une ligne « =X » qui répète la précédente). */
function sansDoublons(lignes: LigneCalcul[]): LigneCalcul[] {
  return lignes.filter((l, i) => {
    if (i === 0) return true;
    const prec = lignes[i - 1].latex;
    const membre = l.latex.startsWith("=") ? l.latex : null;
    return !(membre && prec.endsWith(membre));
  });
}

// ---------------------------------------------------------------------------------------------
// Famille A — zⁿ réel strictement supérieur à k
// ---------------------------------------------------------------------------------------------

function etapeA(e: ExerciceComplexesA, phase: PhaseComplexesAvances): Etape {
  const n = e.n;
  if (phase === "aEcran1") {
    const aide = aideNiveau1(e, phase);
    return {
      utilise: [t(`${aide.texte.replace(/\.$/, "")} ${cours(9)} : `), f(aide.latex ?? "")],
      calculs: [
        {
          lignes: [
            ligne(`z^{${n}}=r^{${n}}\\,e^{${n}i\\theta}`, [f("z=r\\,e^{i\\theta}"), t(" (r > 0), formule de De Moivre")]),
            ligne(`z^{${n}}\\in\\mathbb{R}^{+}_{0}\\iff e^{${n}i\\theta}=1`, [t("car "), f(`r^{${n}}>0`)]),
            ligne(`\\iff ${n}\\theta\\equiv 0\\pmod{2\\pi}`, [f("e^{i\\varphi}=1"), t(" seulement si φ est un multiple de 2π")]),
          ],
        },
      ],
    };
  }
  if (phase === "aEcran2") {
    if (n === 4)
      return {
        utilise: [t(`Un argument se lit sur la position du point (a ; b) ${cours(4)} : θ = 0 ou π sur l'axe réel (b = 0), θ = ±π/2 sur l'axe imaginaire (a = 0).`)],
        calculs: [
          {
            lignes: [
              ligne("4\\theta\\equiv 0\\pmod{2\\pi}\\iff\\theta\\equiv 0\\pmod{\\frac{\\pi}{2}}", "on divise par 4 (le modulo aussi)"),
              ligne("\\iff\\theta\\in\\left\\{0\\,;\\frac{\\pi}{2}\\,;\\pi\\,;-\\frac{\\pi}{2}\\right\\}", "angles de ]−π ; π]"),
              ligne("\\iff a=0\\ \\text{ou}\\ b=0", "θ = 0 ou π : axe réel ; θ = ±π/2 : axe imaginaire"),
            ],
          },
        ],
      };
    return {
      utilise: [t(`Un argument se lit sur la position du point (a ; b) ${cours(4)} : θ = 0 sur le demi-axe des réels positifs ; ailleurs `), f("b=a\\tan\\theta"), t(", le signe de a fixant le quadrant.")],
      calculs: [
        {
          lignes: [
            ligne("3\\theta\\equiv 0\\pmod{2\\pi}\\iff\\theta\\equiv 0\\pmod{\\frac{2\\pi}{3}}", "on divise par 3 (le modulo aussi)"),
            ligne("\\iff\\theta\\in\\left\\{0\\,;\\frac{2\\pi}{3}\\,;-\\frac{2\\pi}{3}\\right\\}", "angles de ]−π ; π]"),
          ],
        },
        {
          label: "Traduction en a et b",
          lignes: [
            ligne("\\theta=0\\iff b=0\\ \\text{et}\\ a>0", "demi-axe des réels positifs"),
            ligne("\\tan\\frac{2\\pi}{3}=-\\sqrt{3}", "valeur remarquable"),
            ligne("\\theta=\\frac{2\\pi}{3}\\iff b=-\\sqrt{3}\\,a\\ \\text{et}\\ a<0", "b = a tan θ, 2ᵉ quadrant (a < 0)"),
            ligne("\\tan\\left(-\\frac{2\\pi}{3}\\right)=\\sqrt{3}", "valeur remarquable"),
            ligne("\\theta=-\\frac{2\\pi}{3}\\iff b=\\sqrt{3}\\,a\\ \\text{et}\\ a<0", "b = a tan θ, 3ᵉ quadrant (a < 0)"),
          ],
        },
      ],
    };
  }
  const seuil = `\\sqrt[${n}]{${e.k}}`;
  return {
    utilise: [t(`Le module d'une puissance est la puissance du module ${cours(5)}, et `), f("|a+bi|=\\sqrt{a^2+b^2}"), t(` ${cours(4)}. Un réel strictement positif est égal à son module.`)],
    calculs: [
      {
        lignes: [
          ligne(`z^{${n}}=|z^{${n}}|`, [f(`z^{${n}}`), t(" est un réel strictement positif (étape 1)")]),
          ligne(`=|z|^{${n}}`, [f("|z^n|=|z|^n")]),
          ligne(`|z|^{${n}}>${e.k}\\iff|z|>${seuil}`, n === 3 ? "la racine cubique conserve l'ordre" : "la racine quatrième conserve l'ordre sur ℝ⁺"),
          ligne(`\\iff\\sqrt{a^2+b^2}>${seuil}`, [f("|z|=\\sqrt{a^2+b^2}")]),
        ],
      },
    ],
  };
}

// ---------------------------------------------------------------------------------------------
// Famille B — lieux géométriques
// ---------------------------------------------------------------------------------------------

/** Équation « Ax + By + C = 0 » d'une droite, divisée par le pgcd (premier coefficient positif) —
 * même normalisation que l'équation attendue de l'écran. */
function normaliserDroite(A: number, B: number, C: number): { g: number; texte: string } {
  const pg = (u: number, w: number): number => (w === 0 ? Math.abs(u) : pg(w, u % w));
  const g0 = pg(pg(A, B), C) || 1;
  const g = A / g0 < 0 || (A === 0 && B / g0 < 0) ? -g0 : g0;
  return { g, texte: `${somme([mono(A / g, "x"), mono(B / g, "y"), mono(C / g)])}=0` };
}

/** « A·x₀ + B·y₀ + C » écrit avec les coordonnées d'un point (vérification d'appartenance). */
function substitutionDroite(A: number, B: number, C: number, p: AffixeSimple): string {
  const terme = (c: number, v: number) => (c === 0 ? "" : c === 1 ? pn(v) : c === -1 ? `-${pn(v)}` : `${c}\\cdot ${pn(v)}`);
  return somme([terme(A, p.a), terme(B, p.b), mono(C)]);
}

/** Lignes « Re/Im de (z − p₁)·conj(z − p₂) » communes aux lieux droite (Im = 0) et Thalès (Re = 0). */
function lignesProduitConjugue(e: ExerciceComplexesBSimple, partie: "Re" | "Im"): LigneCalcul[] {
  const [a1, b1, a2, b2] = [e.p1.a, e.p1.b, e.p2.a, e.p2.b];
  const X1 = linDecale("x", q(a1));
  const Y1 = linDecale("y", q(b1));
  const X2 = linDecale("x", q(a2));
  const Y2 = linDecale("y", q(b2));
  const [fx1, fy1, fx2, fy2] = [facteurQ("x", q(a1)), facteurQ("y", q(b1)), facteurQ("x", q(a2)), facteurQ("y", q(b2))];
  const L: LigneCalcul[] = [ligne(`(z-p_1)\\,\\overline{(z-p_2)}=[${fx1}+${fy1}i]\\,[${fx2}-${fy2}i]`, "z = x + yi ; le conjugué change le signe de la partie imaginaire")];
  if (partie === "Im") {
    const P1 = mulLin(Y1, X2);
    const P2 = mulLin(X1, Y2);
    const total = addP(P1, scaleP(P2, q(-1)));
    L.push(ligne(`\\operatorname{Im}=${produitF(fy1, fx2)}-${produitF(fx1, fy2)}`, "partie imaginaire du produit : Y₁X₂ − X₁Y₂"));
    L.push(ligne(`=${polyLatex(P1, ["xy", "y", "x", "c"])}-${par(polyLatex(P2, ["xy", "x", "y", "c"]))}`, "on distribue"));
    L.push(ligne(`=${polyLatex(total, ["x", "y", "c"])}`, "on réduit : les termes en xy s'annulent"));
    return L;
  }
  const P1 = mulLin(X1, X2);
  const P2 = mulLin(Y1, Y2);
  L.push(ligne(`\\operatorname{Re}=${produitF(fx1, fx2)}+${produitF(fy1, fy2)}`, "partie réelle du produit : X₁X₂ + Y₁Y₂"));
  L.push(ligne(`=${par(polyLatex(P1, ["x2", "x", "c"]))}+${par(polyLatex(P2, ["y2", "y", "c"]))}`, "on distribue"));
  L.push(ligne(`=${polyLatex(addP(P1, P2), ["x2", "x", "y2", "y", "c"])}`, "on regroupe"));
  return L;
}

/**
 * Équation « x² + y² + Ax + By + C = 0 » (coefficients rationnels) → forme canonique du cercle :
 * on complète les carrés, puis on isole. La dernière ligne est l'équation attendue de l'écran.
 */
function lignesCompleterCarres(p: P2): LigneCalcul[] {
  const cx = fois(coefP(p, "x"), q(-1, 2));
  const cy = fois(coefP(p, "y"), q(-1, 2));
  const C = coefP(p, "c");
  const cx2 = fois(cx, cx);
  const cy2 = fois(cy, cy);
  const gauche = somme([carreQ("x", cx), estZ(cx) ? "" : termeQ(neg(cx2), ""), carreQ("y", cy), estZ(cy) ? "" : termeQ(neg(cy2), ""), termeQ(C, "")]);
  const L: LigneCalcul[] = [];
  if (!estZ(cx) || !estZ(cy)) L.push(ligne(`${gauche}=0`, [f("x^2-2cx=(x-c)^2-c^2"), t(" : on complète les carrés")]));
  const R2 = moinsQ(plus(cx2, cy2), C);
  const isole = somme([termeQ(cx2, ""), termeQ(cy2, ""), termeQ(neg(C), "")]);
  L.push(ligne(`${carreQ("x", cx)}+${carreQ("y", cy)}=${isole}`, "on isole les carrés"));
  L.push(ligne(`=${qL(R2)}`, "on calcule"));
  return sansDoublons(L);
}

function etapeBSimple(e: ExerciceComplexesBSimple, phase: PhaseComplexesAvances): Etape {
  const [a1, b1] = [e.p1.a, e.p1.b];
  const attendue = formatReponseAttenduePhaseLatex(e, "bEcran1")[0];
  if (phase === "bEcran1") {
    switch (e.sousType) {
      case "droite": {
        const A = e.p2.b - e.p1.b;
        const B = e.p1.a - e.p2.a;
        const C = e.p2.a * e.p1.b - e.p1.a * e.p2.b;
        const eq = normaliserDroite(A, B, C);
        return {
          utilise: [t(`Un quotient est réel quand le produit du numérateur par le conjugué du dénominateur est réel ${cours(1)} : `), f("\\dfrac{u}{v}=\\dfrac{u\\,\\bar v}{|v|^2}"), t(" ; un nombre est réel quand sa partie imaginaire est nulle.")],
          calculs: [
            {
              intro: [t("On écrit que la partie imaginaire de "), f("(z-p_1)\\,\\overline{(z-p_2)}"), t(" est nulle :")],
              lignes: sansDoublons([
                ...lignesProduitConjugue(e, "Im"),
                ligne(`${somme([mono(A, "x"), mono(B, "y"), mono(C)])}=0`, "partie imaginaire nulle"),
                ...(eq.g !== 1 ? [ligne(eq.texte, eq.g === -1 ? "on multiplie par −1" : `on divise par ${eq.g}`)] : []),
              ]),
            },
          ],
        };
      }
      case "thales": {
        const [a2, b2] = [e.p2.a, e.p2.b];
        const Re = addP(mulLin(linDecale("x", q(a1)), linDecale("x", q(a2))), mulLin(linDecale("y", q(b1)), linDecale("y", q(b2))));
        return {
          utilise: [t(`Un quotient est imaginaire pur quand le produit du numérateur par le conjugué du dénominateur l'est ${cours(1)} : `), f("\\dfrac{u}{v}=\\dfrac{u\\,\\bar v}{|v|^2}"), t(" ; un imaginaire pur a une partie réelle nulle. On complète ensuite les carrés.")],
          calculs: [
            { intro: [t("On écrit que la partie réelle de "), f("(z-p_1)\\,\\overline{(z-p_2)}"), t(" est nulle :")], lignes: [...lignesProduitConjugue(e, "Re"), ligne(`${polyLatex(Re, ["x2", "x", "y2", "y", "c"])}=0`, "partie réelle nulle")] },
            { label: "Forme du cercle", lignes: lignesCompleterCarres(Re) },
          ],
        };
      }
      case "apollonius": {
        const k = e.k as number;
        const k2 = k * k;
        const [a2, b2] = [e.p2.a, e.p2.b];
        const d1 = addP(mulLin(linDecale("x", q(a1)), linDecale("x", q(a1))), mulLin(linDecale("y", q(b1)), linDecale("y", q(b1))));
        const d2 = addP(mulLin(linDecale("x", q(a2)), linDecale("x", q(a2))), mulLin(linDecale("y", q(b2)), linDecale("y", q(b2))));
        const tout = addP(d1, scaleP(d2, q(-k2)));
        const norm = scaleP(tout, q(1, 1 - k2));
        const ordre: Mon[] = ["x2", "x", "y2", "y", "c"];
        return {
          utilise: [t(`Une égalité de modules s'élève au carré (des deux côtés, des nombres positifs), et `), f("|X+Yi|^2=X^2+Y^2"), t(` ${cours(4)} ; on complète ensuite les carrés.`)],
          calculs: [
            {
              lignes: [
                ligne(`|z-p_1|^2=${carreQ("x", q(a1))}+${carreQ("y", q(b1))}`, "z − p₁ = (x − Re p₁) + (y − Im p₁)i"),
                ligne(`|z-p_2|^2=${carreQ("x", q(a2))}+${carreQ("y", q(b2))}`, "de même"),
                ligne(`${carreQ("x", q(a1))}+${carreQ("y", q(b1))}=${k2}\\left[${carreQ("x", q(a2))}+${carreQ("y", q(b2))}\\right]`, `on élève |z − p₁| = ${k}|z − p₂| au carré`),
                ligne(`${polyLatex(d1, ordre)}=${polyLatex(scaleP(d2, q(k2)), ordre)}`, `on développe, puis on distribue ${k2}`),
                ligne(`${polyLatex(tout, ordre)}=0`, "on passe tout à gauche"),
                ligne(`${polyLatex(norm, ordre)}=0`, `on divise par ${1 - k2}`),
              ],
            },
            { label: "Forme du cercle", lignes: lignesCompleterCarres(norm) },
          ],
        };
      }
      case "demiDroites": {
        const origineO = a1 === 0 && b1 === 0;
        const X = decaleQ("x", q(a1));
        const Y = decaleQ("y", q(b1));
        const imag = e.forme === "imaginaire";
        const lien = imag ? Y : X;
        const deux = lien.length === 1 ? `2${lien}` : `2\\left(${lien}\\right)`;
        const module = `\\sqrt{${carreQ("x", q(a1))}+${carreQ("y", q(b1))}}`;
        const c = e.cLatex ?? "0";
        const cCoef = c === "1" ? "" : c === "-1" ? "-" : c;
        const lignes: LigneCalcul[] = [
          ligne(origineO ? "w=z=x+yi" : `w=z-a=${facteurQ("x", q(a1))}+${facteurQ("y", q(b1))}i`, "z = x + yi"),
          imag ? ligne(`w-\\bar w=${deux}\\,i`, [f("w-\\bar w=2i\\operatorname{Im}w")]) : ligne(`w+\\bar w=${deux}`, [f("w+\\bar w=2\\operatorname{Re}w")]),
          ligne(`|w|=${module}`, [f("|X+Yi|=\\sqrt{X^2+Y^2}")]),
        ];
        if (e.c === 0) {
          lignes.push(ligne(imag ? `${deux}\\,i=0` : `${deux}=0`, "c = 0 : le second membre est nul"));
          lignes.push(ligne(attendue, imag ? "on divise par 2i" : "on divise par 2"));
        } else if (imag) {
          lignes.push(ligne(`${deux}\\,i=${cCoef}\\,i\\,${module}`, "on remplace dans la condition"));
          lignes.push(ligne(attendue, "on divise par i"));
        } else lignes.push(ligne(attendue, "on remplace dans la condition"));
        return {
          utilise: [t("Avec w = z − a = X + Yi "), t(cours(1)), t(" : "), f("w+\\bar w=2X"), t(", "), f("w-\\bar w=2iY"), t(" et "), f("|w|=\\sqrt{X^2+Y^2}"), t(` ${cours(4)}.`)],
          calculs: [{ lignes }],
        };
      }
      case "cercleO":
        return {
          utilise: [t(`Le produit d'un complexe par son conjugué est le carré de son module ${cours(1)} : `), f("z\\cdot\\bar z=|z|^2=x^2+y^2"), t(".")],
          calculs: [
            {
              lignes: [
                ligne("z\\cdot\\bar z=(x+yi)(x-yi)", "z = x + yi"),
                ligne("=x^2-(yi)^2", "(a + b)(a − b) = a² − b²"),
                ligne("=x^2+y^2", "car i² = −1"),
                ligne(`x^2+y^2=${e.k}`, "condition de l'énoncé"),
              ],
            },
          ],
        };
      case "cercleA": {
        const k = e.k as number;
        return {
          utilise: [t(`|z − a| est la distance de M au point A d'affixe a ${cours(9)} ; on élève au carré avec `), f("|X+Yi|^2=X^2+Y^2"), t(` ${cours(4)}.`)],
          calculs: [
            {
              lignes: [
                ligne(`z-a=${facteurQ("x", q(a1))}+${facteurQ("y", q(b1))}i`, tm(`z = x + yi, a = ${affixeLatex(e.p1)}`)),
                ligne(`|z-a|^2=${carreQ("x", q(a1))}+${carreQ("y", q(b1))}`, "|X + Yi|² = X² + Y²"),
                ligne(`${carreQ("x", q(a1))}+${carreQ("y", q(b1))}=${k * k}`, `on élève |z − a| = ${k} au carré`),
              ],
            },
          ],
        };
      }
      case "argument":
      case "argumentPi": {
        const th = e.theta as AngleRemarquable;
        const fx = facteurQ("x", q(a1));
        const fy = facteurQ("y", q(b1));
        const cs = cosSin(th);
        const lignes: LigneCalcul[] = [
          ligne(`(z-a)\\,e^{-i\\theta}=[${fx}+${fy}i]\\,(${trig("cos", th.latex)}-i${trig("sin", th.latex)})`, [f("e^{-i\\theta}=\\cos\\theta-i\\sin\\theta")]),
          ligne(`\\operatorname{Im}=${fy}${trig("cos", th.latex)}-${fx}${trig("sin", th.latex)}`, "partie imaginaire du produit : Y cos θ − X sin θ"),
          ligne(`${fy}${trig("cos", th.latex)}=${fx}${trig("sin", th.latex)}`, "partie imaginaire nulle"),
        ];
        if (Math.abs(cs.sinN) < 1e-9) {
          lignes.push(ligne(`${cs.cosN < 0 ? `-${fy}` : decaleQ("y", q(b1))}=0`, [f(`${trig("cos", th.latex)}=${cs.cos}`), t(" et "), f(`${trig("sin", th.latex)}=0`)]));
          lignes.push(ligne(attendue, "on isole y"));
        } else if (Math.abs(cs.cosN) < 1e-9) {
          lignes.push(ligne(`${cs.sinN < 0 ? `-${fx}` : decaleQ("x", q(a1))}=0`, [f(`${trig("cos", th.latex)}=0`), t(" et "), f(`${trig("sin", th.latex)}=${cs.sin}`)]));
          lignes.push(ligne(attendue, "on isole x"));
        } else {
          lignes.push(ligne(`${decaleQ("y", q(b1))}=${fx}\\,${trig("tan", th.latex)}`,[t("on divise par "), f(`${trig("cos", th.latex)}\\neq 0`)]));
          lignes.push(ligne(attendue, [f(`${trig("tan", th.latex)}=${tanLatex(th)}`)]));
        }
        return {
          utilise: [
            f(e.sousType === "argument" ? "\\arg(z-a)\\equiv\\theta\\pmod{2\\pi}" : "\\arg(z-a)\\equiv\\theta\\pmod{\\pi}"),
            t(` signifie que tourner z − a de −θ donne un réel (${e.sousType === "argument" ? "positif" : "positif ou négatif"}) ${cours(9)} : `),
            f("(z-a)\\,e^{-i\\theta}\\in\\mathbb{R}"),
            t(`, avec `),
            f("e^{-i\\theta}=\\cos\\theta-i\\sin\\theta"),
            t(` ${cours(4)}.`),
          ],
          calculs: [{ lignes }],
        };
      }
    }
  }

  // Étape 2 : nature et éléments du lieu.
  const r = e.resultat;
  if (r.nature === "droite") {
    if (e.sousType === "argumentPi") {
      const d = { a: r.point2.a - r.point1.a, b: r.point2.b - r.point1.b };
      return {
        utilise: [f("\\arg(z-a)\\equiv\\theta\\pmod{\\pi}"), t(` : droite complète passant par A, de direction θ, privée de A ${cours(9)} ; un second point s'obtient en ajoutant à a un déplacement de direction θ.`)],
        calculs: [
          {
            lignes: [
              ligne(`z_2=${parAff(r.point1)}+${parAff(d)}`, tm(`déplacement (${d.a} ; ${d.b}) de direction θ`)),
              ligne(`=${affixeLatex(r.point2)}`, "on additionne parties réelles et imaginaires"),
            ],
          },
        ],
      };
    }
    const A = e.p2.b - e.p1.b;
    const B = e.p1.a - e.p2.a;
    const C = e.p2.a * e.p1.b - e.p1.a * e.p2.b;
    const eq = normaliserDroite(A, B, C);
    const [A2, B2, C2] = [A / eq.g, B / eq.g, C / eq.g];
    return {
      utilise: [t(`Une équation ax + by + c = 0 est celle d'une droite ${cours(9)} ; on en vérifie deux points en remplaçant x et y. Le point où la condition n'est pas définie (dénominateur nul) est exclu.`)],
      calculs: [
        {
          intro: [t("Les points d'affixes "), f("p_1"), t(" et "), f("p_2"), t(" vérifient l'équation "), f(eq.texte), t(" :")],
          lignes: [ligne(`${substitutionDroite(A2, B2, C2, e.p1)}=0`, tm(`p₁ = ${affixeLatex(e.p1)}`)), ligne(`${substitutionDroite(A2, B2, C2, e.p2)}=0`, tm(`p₂ = ${affixeLatex(e.p2)}, exclu (z ≠ p₂)`))],
        },
      ],
    };
  }
  if (r.nature === "cercle") {
    const R2 = e.sousType === "thales" ? q((e.p1.a - e.p2.a) ** 2 + (e.p1.b - e.p2.b) ** 2, 4) : e.sousType === "apollonius" ? q((e.k as number) ** 2 * ((e.p1.a - e.p2.a) ** 2 + (e.p1.b - e.p2.b) ** 2), (1 - (e.k as number) ** 2) ** 2) : e.sousType === "cercleA" ? q((e.k as number) ** 2) : q(e.k as number);
    const cx = frac(Math.round(r.centre.a * 360), 360);
    const cy = frac(Math.round(r.centre.b * 360), 360);
    const lignesCentre: LigneCalcul[] = [ligne(`x_0=${qL(cx)}`, estZ(cx) ? "terme x² : x₀ = 0" : `on lit (x − x₀)²`), ligne(`y_0=${qL(cy)}`, estZ(cy) ? "terme y² : y₀ = 0" : "on lit (y − y₀)²")];
    const etape: Etape = {
      utilise: [f("(x-x_0)^2+(y-y_0)^2=r^2"), t(` est l'équation du cercle de centre `), f("x_0+y_0\\,i"), t(` et de rayon `), f("r=\\sqrt{r^2}"), t(` ${cours(9)}.${e.poleExclu ? " Le point où la condition n'est pas définie est exclu." : ""}`)],
      calculs: [{ lignes: [...lignesCentre, ligne(`r^2=${qL(R2)}`, "second membre de l'équation"), ...lignesRacine("r", R2.n, R2.d)] }],
    };
    if (e.sousType === "thales")
      etape.verification = {
        fragments: [t("Cercle de diamètre [P₁P₂] (cercle de Thalès) : son centre est le milieu de [P₁P₂].")],
        lignes: [ligne(`\\dfrac{p_1+p_2}{2}=\\dfrac{${parAff(e.p1)}+${parAff(e.p2)}}{2}`), ligne(`=${affixeLatexRationnel(r.centre.a, r.centre.b)}`)],
      };
    return etape;
  }
  // Demi-droite(s).
  if (e.sousType === "argument") {
    const th = e.theta as AngleRemarquable;
    const cs = cosSin(th);
    const surX = Math.abs(cs.cosN) > 1e-9;
    const lettre = surX ? "x" : "y";
    const val = surX ? cs.cosN : cs.sinN;
    const c0 = surX ? a1 : b1;
    return {
      utilise: [f("\\arg(z-a)\\equiv\\theta\\pmod{2\\pi}"), t(` : demi-droite d'origine A (exclue), d'angle θ ${cours(9)}. Avec `), f("z-a=\\rho\\,e^{i\\theta}"), t(" ("), f("\\rho>0"), t("), x − Re a a le signe de cos θ et y − Im a celui de sin θ : on ne garde qu'un côté de la droite de l'étape 1.")],
      calculs: [
        {
          lignes: [
            ligne(`${trig(surX ? "cos" : "sin", th.latex)}=${surX ? cs.cos : cs.sin}`, "valeur remarquable"),
            ligne(`${decaleQ(lettre, q(c0))}${val > 0 ? ">" : "<"}0`, `même signe que ${surX ? "cos" : "sin"} θ`),
            ligne(`${lettre}${val > 0 ? ">" : "<"}${c0}`, "on isole"),
          ],
        },
      ],
    };
  }
  // demiDroites : cos θ = c/2 (forme réelle) ou sin θ = c/2 (forme imaginaire).
  const imag = e.forme === "imaginaire";
  const th0 = r.angles[0];
  const cs = cosSin(th0);
  const valeur = imag ? cs.sin : cs.cos;
  const angles = r.angles.length === 1 ? `\\theta=${th0.latex}` : `\\theta=${r.angles[0].latex}\\ \\text{ou}\\ \\theta=${r.angles[1].latex}`;
  return {
    utilise: [t("Avec "), f("w=z-a=|w|\\,e^{i\\theta}"), t(" ("), f("w\\neq 0"), t(") : "), f(imag ? "\\sin\\theta=\\dfrac{\\operatorname{Im}w}{|w|}" : "\\cos\\theta=\\dfrac{\\operatorname{Re}w}{|w|}"), t(` ${cours(4)}. La condition fixe θ : une ou deux demi-droites d'origine A, exclue ${cours(9)}.`)],
    calculs: [
      {
        lignes: [
          ligne(imag ? "\\sin\\theta=\\dfrac{\\operatorname{Im}w}{|w|}" : "\\cos\\theta=\\dfrac{\\operatorname{Re}w}{|w|}", "w ≠ 0 : origine exclue"),
          ligne(`=${valeur}`, imag ? "2 Im w = c|w| (étape 1), on divise par 2|w|" : "2 Re w = c|w| (étape 1), on divise par 2|w|"),
          ligne(angles, r.angles.length === 1 ? "une seule solution dans ]−π ; π]" : imag ? "sin θ = sin(π − θ)" : "cos θ = cos(−θ)"),
        ],
      },
    ],
    verification: {
      fragments: [t("Le point d'affixe "), f(`a+e^{i\\theta}`), t(` (θ = `), f(th0.latex), t(") est sur le lieu : "), f("|w|=1"), t(imag ? " et 2 Im w = 2 sin θ doit valoir c :" : " et 2 Re w = 2 cos θ doit valoir c :")],
      lignes: [ligne(`2${trig(imag ? "sin" : "cos", th0.latex)}=${e.cLatex ?? "0"}`)],
    },
  };
}

function etapeBIntersection(e: ExerciceComplexesBIntersection, phase: PhaseComplexesAvances): Etape {
  const { q1, q2 } = e;
  const k = e.kCercleO;
  const [a1, b1] = [q1.a, q1.b];
  const D = { a: q2.a - q1.a, b: q2.b - q1.b };
  // Droite (q₁q₂) : Im[(z − q₁)·conj(q₂ − q₁)] = D.a·(y − b₁) − D.b·(x − a₁).
  const A = -D.b;
  const B = D.a;
  const C = D.b * a1 - D.a * b1;
  const eq = normaliserDroite(A, B, C);
  const [A2, B2] = [A / eq.g, B / eq.g];
  if (phase === "bInterEcran1") {
    const fx = facteurQ("x", q(a1));
    const fy = facteurQ("y", q(b1));
    return {
      utilise: [t(`(1) Le dénominateur est un nombre fixe : le quotient est réel quand le produit de z − q₁ par le conjugué de q₂ − q₁ est réel ${cours(1)}. (2) `), f("z\\cdot\\bar z=x^2+y^2"), t(` ${cours(1)}.`)],
      calculs: [
        {
          label: "Condition (1)",
          lignes: sansDoublons([
            ligne(`q_2-q_1=${parAff(q2)}-${parAff(q1)}`),
            ligne(`=${affixeLatex(D)}`, "on soustrait parties réelles et parties imaginaires"),
            ligne(`(z-q_1)\\,\\overline{(q_2-q_1)}=[${fx}+${fy}i]\\,(${cz(D.a, -D.b)})`, "z = x + yi ; on conjugue q₂ − q₁"),
            ligne(`\\operatorname{Im}=${somme([coefFacteur(D.a, fy), coefFacteur(-D.b, fx)])}`, "partie imaginaire du produit"),
            ligne(`=${somme([mono(D.a, "y"), mono(-D.a * b1), mono(-D.b, "x"), mono(D.b * a1)])}`, "on distribue"),
            ligne(`=${somme([mono(A, "x"), mono(B, "y"), mono(C)])}`, "on regroupe"),
            ligne(`${somme([mono(A, "x"), mono(B, "y"), mono(C)])}=0`, "partie imaginaire nulle"),
            ...(eq.g !== 1 ? [ligne(eq.texte, eq.g === -1 ? "on multiplie par −1" : `on divise par ${eq.g}`)] : []),
          ]),
        },
        {
          label: "Condition (2)",
          lignes: [ligne("z\\cdot\\bar z=(x+yi)(x-yi)", "z = x + yi"), ligne("=x^2-(yi)^2", "(a + b)(a − b) = a² − b²"), ligne("=x^2+y^2", "car i² = −1"), ligne(`x^2+y^2=${k}`, "condition (2)")],
        },
      ],
    };
  }
  if (phase === "bInterEcran2")
    return {
      utilise: [t(`ax + by + c = 0 est une droite ; `), f("x^2+y^2=r^2"), t(` est le cercle de centre O et de rayon r ${cours(9)}.`)],
      calculs: [
        { label: "Droite", intro: [t("Les points d'affixes "), f("q_1"), t(" et "), f("q_2"), t(" vérifient (1) :")], lignes: [ligne(`${substitutionDroite(A2, B2, 0, q1)}=0`, tm(`q₁ = ${affixeLatex(q1)}`)), ligne(`${substitutionDroite(A2, B2, 0, q2)}=0`, tm(`q₂ = ${affixeLatex(q2)}`))] },
        { label: "Cercle", lignes: [ligne(`r^2=${k}`, "second membre de (2)"), ...lignesRacine("r", k, 1)] },
      ],
    };
  // Étape 3 : on isole une inconnue dans (1), on remplace dans (2).
  const isoleX = A2 !== 0 && (Math.abs(A2) === 1 || B2 === 0 || Math.abs(B2) !== 1);
  const v = isoleX ? "x" : "y";
  const w = isoleX ? "y" : "x";
  const m = isoleX ? q(-B2, A2) : q(-A2, B2);
  const L: LigneCalcul[] = [];
  const sol = isoleX ? Math.abs(b1) : Math.abs(a1);
  if (estZ(m)) {
    L.push(ligne(`${v}=0`, "équation (1)"));
    L.push(ligne(`0^2+${w}^2=${k}`, "on remplace dans (2)"));
    L.push(ligne(`${w}^2=${k}`, "on simplifie"));
    L.push(ligne(`${w}=\\pm ${sol}`, `deux racines opposées (${sol}² = ${k})`));
    return {
      utilise: [t(`Méthode de substitution : on isole une inconnue dans l'équation de la droite, on la remplace dans celle du cercle ${cours(3)} ; l'équation du second degré obtenue a deux solutions.`)],
      calculs: [{ lignes: L }],
      verification: { fragments: [t("Chaque point trouvé vérifie (2) :")], lignes: [ligne(`${pn(q1.a)}^2+${pn(q1.b)}^2=${k}`), ligne(`${pn(q2.a)}^2+${pn(q2.b)}^2=${k}`)] },
    };
  }
  const mv = termeQ(m, w);
  const m2 = fois(m, m);
  const coefTot = plus(m2, q(1));
  L.push(ligne(`${v}=${mv}`, "on isole " + v + " dans (1)"));
  L.push(ligne(`\\left(${mv}\\right)^2+${w}^2=${k}`, "on remplace dans (2)"));
  L.push(ligne(`${termeQ(m2, `${w}^2`)}+${w}^2=${k}`, "(ab)² = a²b²"));
  L.push(ligne(`${termeQ(coefTot, `${w}^2`)}=${k}`, "on regroupe"));
  L.push(ligne(`${w}^2=${qL(fois(q(k), frac(coefTot.d, coefTot.n)))}`, `on divise par ${qL(coefTot).replace(/\\frac\{(\d+)\}\{(\d+)\}/, "$1/$2")}`));
  L.push(ligne(`${w}=\\pm ${sol}`, "deux racines opposées"));
  for (const [i, s] of [sol, -sol].entries()) {
    const val = fois(m, q(s));
    if (Math.abs(m.n) === 1 && m.d === 1) L.push(ligne(`${v}_${i + 1}=${qL(val)}`, tm(`${v} = ${m.n < 0 ? "−" : ""}${w}, pour ${w} = ${s}`)));
    else L.push(ligne(`${v}_${i + 1}=${qL(m)}\\cdot ${pn(s)}=${qL(val)}`, tm(`pour ${w} = ${s}`)));
  }
  return {
    utilise: [t(`Méthode de substitution : on isole une inconnue dans l'équation de la droite, on la remplace dans celle du cercle ${cours(3)} ; l'équation du second degré obtenue a deux solutions.`)],
    calculs: [{ lignes: L }],
    verification: { fragments: [t("Chaque point trouvé vérifie (2) :")], lignes: [ligne(`${pn(q1.a)}^2+${pn(q1.b)}^2=${k}`), ligne(`${pn(q2.a)}^2+${pn(q2.b)}^2=${k}`)] },
  };
}

// ---------------------------------------------------------------------------------------------
// Famille C — le cercle unité est-il préservé ?
// ---------------------------------------------------------------------------------------------

function etapeC(e: ExerciceComplexesC, phase: PhaseComplexesAvances): Etape {
  const p2 = e.a * e.a + e.b * e.b;
  const pL = cz(e.a, e.b);
  const pbL = cz(e.a, -e.b);
  const [num] = formatReponseAttenduePhaseLatex(e, "cEcran1");
  const [den] = formatReponseAttenduePhaseLatex(e, "cEcran2");
  const denNom = e.conjugue ? "1-\\bar p z" : "1-pz";
  if (phase === "cEcran1") {
    const aide = aideNiveau1(e, phase);
    return {
      utilise: [t(`${aide.texte.replace(/ :$/, "")} ${cours(1)} : `), f(aide.latex ?? "")],
      calculs: [
        {
          lignes: [
            ligne("|z-p|^2=(z-p)\\,\\overline{(z-p)}", "|w|² = w·w̄"),
            ligne("=(z-p)(\\bar z-\\bar p)", "conjugué d'une différence"),
            ligne("=z\\bar z-\\bar p\\,z-p\\,\\bar z+p\\,\\bar p", "on distribue"),
          ],
        },
        {
          label: "Avec les valeurs",
          lignes: [
            ...(e.b === 0
              ? [ligne(`p\\,\\bar p=${pn(e.a)}\\cdot ${pn(e.a)}`, tm(`p = ${pL} est réel : p̄ = p`)), ligne(`=${p2}`)]
              : [ligne(`p\\,\\bar p=${parP(pL)}${parP(pbL)}`, tm(`p = ${pL}, p̄ = ${pbL}`)), ligne(`=${pn(e.a)}^2+${pn(e.b)}^2`, "(a + bi)(a − bi) = a² + b²"), ligne(`=${p2}`)]),
            ligne(`|z-p|^2=${num}`, "on remplace p, p̄ et p p̄"),
          ],
        },
      ],
    };
  }
  if (phase === "cEcran2") {
    const lignes = e.conjugue
      ? [
          ligne("|1-\\bar p z|^2=(1-\\bar p z)\\,\\overline{(1-\\bar p z)}", "|w|² = w·w̄"),
          ligne("=(1-\\bar p z)(1-p\\,\\bar z)", [t("conjugué d'un produit : "), f("\\overline{\\bar p z}=p\\,\\bar z")]),
          ligne("=1-p\\,\\bar z-\\bar p z+\\bar p p\\,z\\bar z", "on distribue"),
          ligne(`=${den}`, tm(`p = ${pL}, p̄ = ${pbL}, p p̄ = ${p2} (étape 1)`)),
        ]
      : [
          ligne("|1-pz|^2=(1-pz)\\,\\overline{(1-pz)}", "|w|² = w·w̄"),
          ligne("=(1-pz)(1-\\bar p\\,\\bar z)", [t("conjugué d'un produit : "), f("\\overline{pz}=\\bar p\\,\\bar z")]),
          ligne("=1-\\bar p\\,\\bar z-pz+p\\bar p\\,z\\bar z", "on distribue"),
          ligne(`=${den}`, tm(`p = ${pL}, p̄ = ${pbL}, p p̄ = ${p2} (étape 1)`)),
        ];
    return {
      utilise: [t(`Même méthode ${cours(1)} : `), f("|w|^2=w\\,\\bar w"), t(", et le conjugué d'un produit est le produit des conjugués.")],
      calculs: [{ lignes }],
    };
  }
  const reste = num.replace(/^z\\bar z/, "").replace(new RegExp(`\\+${p2}$`), "");
  const resteDen = den.replace(/^1/, "").replace(`+${p2}\\,z\\bar z`, "");
  const numSubst = `1${reste}+${p2}`;
  const denSubst = `1${resteDen}+${p2}`;
  const calculs: BlocCalcul[] = [
    {
      lignes: [
        ligne(`|z-p|^2=${numSubst}`, "on remplace z z̄ par 1"),
        ligne(`=${1 + p2}${reste}`, "on regroupe les constantes"),
        ligne(`|${denNom}|^2=${denSubst}`, "on remplace z z̄ par 1"),
        ligne(`=${1 + p2}${resteDen}`, "on regroupe les constantes"),
      ],
    },
  ];
  if (e.conjugue) {
    calculs.push({
      label: "Conclusion",
      lignes: [
        ligne("|z-p|^2=|1-\\bar p z|^2", "les deux expressions sont identiques"),
        ligne("|z'|=\\dfrac{|z-p|}{|1-\\bar p z|}", "module d'un quotient"),
        ligne("=1", "numérateur et dénominateur égaux (et non nuls)"),
      ],
    });
    return {
      utilise: [t(`Sur le cercle unité, `), f("z\\cdot\\bar z=1"), t(`. Le module d'un quotient est le quotient des modules ${cours(4)} : `), f("|z'|=1"), t(` si et seulement si les carrés des modules du numérateur et du dénominateur sont égaux ${cours(9)}.`)],
      calculs,
    };
  }
  const deuxB = mono(2 * e.b, "i");
  calculs.push({
    label: "Différence",
    lignes: [
      ligne("|z-p|^2-|1-pz|^2=(p-\\bar p)\\,z-(p-\\bar p)\\,\\bar z", "les constantes s'annulent ; coefficients de z et de z̄ échangés"),
      ligne("=(p-\\bar p)(z-\\bar z)", "on met p − p̄ en évidence"),
      ligne(`=(${deuxB})(2i\\operatorname{Im}z)`, tm(`p − p̄ = 2i Im p = ${deuxB} ; z − z̄ = 2i Im z`)),
      ligne(`=${mono(-4 * e.b, "\\operatorname{Im}z")}`, "car i² = −1"),
    ],
  });
  return {
    utilise: [t(`Sur le cercle unité, `), f("z\\cdot\\bar z=1"), t(`. Le module d'un quotient est le quotient des modules ${cours(4)} : `), f("|z'|=1"), t(` si et seulement si les carrés des modules du numérateur et du dénominateur sont égaux ${cours(9)}.`)],
    calculs,
    verification: { fragments: [t("Pour z = i (sur le cercle unité), Im z = 1 : la différence vaut "), f(`${-4 * e.b}\\neq 0`), t(", donc "), f("|z'|\\neq 1"), t(".")] },
  };
}

// ---------------------------------------------------------------------------------------------
// Famille D — équations avec paramètre(s)
// ---------------------------------------------------------------------------------------------

function etapeD(e: ExerciceComplexesD, phase: PhaseComplexesAvances): Etape {
  switch (e.sousType) {
    case "ratio": {
      if (phase === "dRatioEcran1") {
        const valeurs = formatReponseAttenduePhaseLatex(e, "dRatioEcran1");
        const racines = racinesRatio(e.n, e.m);
        const L: LigneCalcul[] = [ligne(`u_k=${e.m}\\left(\\cos\\frac{2k\\pi}{${e.n}}+i\\sin\\frac{2k\\pi}{${e.n}}\\right)`, tm(`k = 0, …, ${e.n - 1} : module ${e.m}, arguments espacés de 2π/${e.n}`))];
        racines.forEach((rk, k) => {
          const brut = frac(2 * k, e.n);
          const angle = brut.n === 0 ? "0" : `${brut.d === 1 ? (brut.n === 1 ? "\\pi" : `${brut.n}\\pi`) : `\\frac{${brut.n === 1 ? "" : brut.n}\\pi}{${brut.d}}`}`;
          const cs = cosSin(rk.angle);
          L.push(ligne(`u_${k}=${e.m}\\left(${trig("cos", angle)}+i${trig("sin", angle)}\\right)`, `k = ${k}`));
          L.push(ligne(`=${valeurs[k]}`, [f(`${trig("cos", angle)}=${cs.cos}`), t(", "), f(`${trig("sin", angle)}=${cs.sin}`)]));
        });
        return {
          utilise: [t(`Racines n-ièmes ${cours(6)} : les solutions de `), f("u^n=m^n"), t(" (m > 0) sont "), f("u_k=m\\left(\\cos\\frac{2k\\pi}{n}+i\\sin\\frac{2k\\pi}{n}\\right)"), t(", pour "), f("k=0,\\ldots,n-1"), t(`. Ici `), f(`k=${e.m}^{${e.n}}`), t(".")],
          calculs: [{ lignes: L }],
        };
      }
      const z = frac(e.c, e.m - 1);
      const zL = qL(z);
      return {
        utilise: [f("u=\\dfrac{z+c}{z}\\iff uz=z+c\\iff z(u-1)=c\\iff z=\\dfrac{c}{u-1}"), t(` (u ≠ 1) ${cours(3)}.`)],
        calculs: [{ lignes: sansDoublons([ligne("z=\\dfrac{c}{u-1}"), ligne(`=\\dfrac{${e.c}}{${e.m}-1}`, `u = m = ${e.m}, c = ${e.c}`), ligne(`=\\dfrac{${e.c}}{${e.m - 1}}`, "on calcule le dénominateur"), ligne(`=${zL}`, "on simplifie")]) }],
        verification: { fragments: [t("On retrouve bien "), f(`u=${e.m}`), t(" :")], lignes: [ligne(`\\dfrac{z+c}{z}=\\dfrac{${zL}${e.c < 0 ? e.c : `+${e.c}`}}{${zL}}`), ligne(`=${e.m}`)] },
      };
    }
    case "reelles": {
      const A = e.x1 + e.x2;
      const P = e.x1 * e.x2;
      const [reel, imagEq] = formatReponseAttenduePhaseLatex(e, "dReellesEcran1");
      const m0 = e.m0;
      const fm = linM(-1, m0); // m₀ − m
      const reelG = reel.replace(/=0$/, "");
      if (phase === "dReellesEcran1") {
        const brute = equationDReelles(e).replace(/\\begin\{aligned\}&|\\\\ &\\qquad\{\}|\\end\{aligned\}/g, "").replace(/z/g, "x");
        const linKM = linM(e.k, -e.k * m0);
        const constIm = e.k === 0 ? "" : `+(${linKM})`;
        const L: LigneCalcul[] = [
          ligne(brute, "z = x (x réel)"),
          ligne(`(${reelG})+[(${fm})x${constIm}]\\,i=0`,"on regroupe parties réelle et imaginaire"),
          ligne(reel, "partie réelle nulle"),
          ligne(`(${fm})x${constIm}=0`, "partie imaginaire nulle"),
        ];
        if (e.k !== 0) {
          const mk = -e.k;
          L.push(ligne(`(${fm})x${mk > 0 ? "+" : "-"}${Math.abs(mk) === 1 ? "" : Math.abs(mk)}(${fm})=0`, [f(`${linKM}=${mk === 1 ? "" : mk === -1 ? "-" : mk}(${fm})`)]));
          L.push(ligne(imagEq, `on met ${m0} − m en évidence`));
        }
        return {
          utilise: [t(`Deux complexes sont égaux quand leurs parties réelles et leurs parties imaginaires sont égales ${cours(1)} : si z = x est réel, l'équation est vraie quand sa partie réelle et sa partie imaginaire sont nulles.`)],
          calculs: [{ lignes: L }],
        };
      }
      if (phase === "dReellesEcran2") {
        const k = e.k;
        const subst = somme([`${pn(k)}^2`, A === 0 ? "" : `${-A < 0 ? "-" : ""}${Math.abs(A) === 1 ? pn(k) : `${Math.abs(A)}\\cdot ${pn(k)}`}`, mono(P)]);
        const L: LigneCalcul[] = sansDoublons([
          ligne(`${subst}=${somme([mono(k * k), mono(-A * k), mono(P)])}`, k === 0 ? "x = 0 annule le facteur x : on le teste dans la 1ʳᵉ équation" : tm(`x = ${k} annule x ${k > 0 ? "−" : "+"} ${Math.abs(k)} : on le teste dans la 1ʳᵉ équation`)),
          ligne(`=${k * k - A * k + P}`),
          ligne(`${fm}=0`, tm(`${k} n'est pas racine : pour x ≠ ${k}, le facteur ${m0} − m doit être nul`)),
          ligne(`m=${m0}`, "on isole m"),
        ]);
        return {
          utilise: [t(`Un produit est nul si et seulement si l'un de ses facteurs est nul ${cours(3)}. Les racines de la 1ʳᵉ équation doivent aussi annuler la 2ᵉ, `), f(imagEq), t(".")],
          calculs: [{ lignes: L }],
        };
      }
      const delta = A * A - 4 * P;
      const rac = Math.round(Math.sqrt(delta));
      const [xa, xb] = [(A - rac) / 2, (A + rac) / 2];
      // Indices x₁, x₂ dans l'ordre du résultat de l'écran.
      const [ia, ib] = e.x1 === xa ? ["x_1", "x_2"] : ["x_2", "x_1"];
      return {
        utilise: [t(`Pour m = ${m0}, la 2ᵉ équation est vraie pour tout x ; il reste l'équation du second degré `), f(reel), t(` : `), f("\\Delta=b^2-4ac"), t(" et "), f("x=\\dfrac{-b\\pm\\sqrt{\\Delta}}{2a}"), t(` ${cours(3)}.`)],
        calculs: [
          {
            lignes: [
              ligne(`\\Delta=${pn(-A)}^2-4\\cdot 1\\cdot ${pn(P)}`, "Δ = b² − 4ac"),
              ligne(`=${A * A}${-4 * P >= 0 ? "+" : "-"}${Math.abs(4 * P)}`, "on calcule chaque terme"),
              ligne(`=${delta}`),
              ligne(`${ia}=\\dfrac{${A}-\\sqrt{${delta}}}{2}`, "x = (−b − √Δ) / (2a)"),
              ligne(`=\\dfrac{${A}-${rac}}{2}`, tm(`√${delta} = ${rac}`)),
              ligne(`=${xa}`),
              ligne(`${ib}=\\dfrac{${A}+\\sqrt{${delta}}}{2}`, "x = (−b + √Δ) / (2a)"),
              ligne(`=\\dfrac{${A}+${rac}}{2}`),
              ligne(`=${xb}`),
            ],
          },
        ],
        verification: { fragments: [t(`Somme et produit des racines ${cours(3)} : `), f("x_1+x_2=-\\dfrac{b}{a}"), t(" et "), f("x_1x_2=\\dfrac{c}{a}"), t(".")], lignes: [ligne(`${xa}+${pn(xb)}=${A}`), ligne(`${pn(xa)}\\cdot ${pn(xb)}=${P}`)] },
      };
    }
    case "coef": {
      const { p, q: qq } = e;
      const z0 = cz(p, qq);
      const re = p * p - qq * qq;
      const im = 2 * p * qq;
      const reelEq = somme([mono(p, "\\alpha"), "\\beta", mono(re)]);
      const imagEq = somme([mono(qq, "\\alpha"), mono(im)]);
      const alpha = -2 * p;
      const beta = p * p + qq * qq;
      if (phase === "dCoefEcran1") {
        const simplifiee = `${somme(["\\alpha", mono(2 * p)])}=0`;
        return {
          utilise: [t(`z₀ est racine : on remplace z par z₀ ; α et β étant réels, on identifie partie réelle et partie imaginaire ${cours(1)}. Carré : `), f("(x+y)^2=x^2+2xy+y^2"), t(".")],
          calculs: [
            {
              lignes: sansDoublons([
                ...lignesCarre(p, qq, "z_0^2"),
                ligne(`z_0^2+\\alpha z_0+\\beta=${cz(re, im)}+\\alpha(${z0})+\\beta`, "on remplace z par z₀"),
                ligne(`=(${reelEq})+(${imagEq})\\,i`, "on regroupe parties réelle et imaginaire"),
                ligne(`${reelEq}=0`, "partie réelle nulle"),
                ligne(`${imagEq}=0`, "partie imaginaire nulle"),
                ...(qq !== 1 ? [ligne(simplifiee, `on divise par ${qq}`)] : []),
              ]),
            },
          ],
        };
      }
      const termeAlpha = mono(p * alpha);
      return {
        utilise: [t(`La 2ᵉ équation ne contient que α ; on reporte ensuite α dans la 1ʳᵉ ${cours(3)}.`)],
        calculs: [
          {
            lignes: sansDoublons([
              ligne(`${imagEq}=0`, "partie imaginaire nulle"),
              ligne(`${mono(qq, "\\alpha")}=${-im}`, im === 0 ? "" : tm(`on retire ${im} des deux côtés`)),
              ligne(`\\alpha=${alpha}`, `on divise par ${qq}`),
              ligne(`${reelEq}=0`, "partie réelle nulle"),
              ligne(`${somme([termeAlpha, "\\beta", mono(re)])}=0`, `α = ${alpha}`),
              ligne(`\\beta=${beta}`, "on isole β"),
            ]),
          },
        ],
        verification: {
          fragments: [t(`Un polynôme à coefficients réels a pour racines z₀ et son conjugué ${cours(3)} : leur somme vaut −α et leur produit β.`)],
          lignes: [ligne(`z_0+\\overline{z_0}=${par(z0)}+${par(cz(p, -qq))}=${2 * p}`), ligne(`z_0\\,\\overline{z_0}=${pn(p)}^2+${pn(qq)}^2=${beta}`)],
        },
      };
    }
    case "modules": {
      if (phase === "dModulesEcran1")
        return {
          utilise: [t(`Le module d'un quotient est le quotient des modules ${cours(4)} : `), f("\\left|\\dfrac{1}{z}\\right|=\\dfrac{1}{|z|}"), t(".")],
          calculs: [{ lignes: [ligne("|z|=\\left|\\dfrac{1}{z}\\right|", "condition de l'énoncé"), ligne("=\\dfrac{1}{|z|}", "module d'un inverse"), ligne("|z|^2=1", "on multiplie par |z| > 0"), ligne("|z|=1", "un module est positif")] }],
        };
      const im = !!e.dImaginaire;
      const dv = frac(2 * (im ? e.q : e.p), e.r);
      const v = im ? "y" : "x";
      const w = im ? "x" : "y";
      const solV = frac(im ? e.q : e.p, e.r);
      const solW = frac(im ? e.p : e.q, e.r);
      const sol = solutionsDModules(e);
      const milieu: LigneCalcul[] = [
        ligne("|z|^2=|z-d|^2", "on élève au carré (modules positifs)"),
        ligne(im ? `x^2+y^2=x^2+${carreQ("y", dv)}` : `x^2+y^2=${carreQ("x", dv)}+y^2`, im ? "z − d = x + (y − Im d)i" : "z − d = (x − d) + yi"),
        ligne(`x^2+y^2=${im ? `x^2+y^2${termeQ(neg(fois(q(2), dv)), "y").replace(/^(?!-)/, "+")}+${qL(fois(dv, dv))}` : `x^2${termeQ(neg(fois(q(2), dv)), "x").replace(/^(?!-)/, "+")}+${qL(fois(dv, dv))}+y^2`}`, "on développe"),
        ligne(`${termeQ(fois(q(2), dv), v)}=${qL(fois(dv, dv))}`, "on simplifie x² et y² des deux côtés"),
        ligne(`${v}=${qL(solV)}`, `on divise par ${qL(fois(q(2), dv)).replace(/\\frac\{(\d+)\}\{(\d+)\}/, "$1/$2")}`.replace("-", "−")),
      ];
      const cercle: LigneCalcul[] = [
        ligne(`${w}^2=1-${v}^2`, "x² + y² = 1"),
        ligne(`${w}^2=1-${pqL(solV)}^2`, tm(`${v} = ${qL(solV).replace(/\\frac\{(\d+)\}\{(\d+)\}/, "$1/$2")}`)),
        ligne(`=1-${qL(fois(solV, solV))}`),
        ligne(`=${qL(moinsQ(q(1), fois(solV, solV)))}`, "même dénominateur"),
        ligne(`${w}=\\pm ${qL(frac(Math.abs(solW.n), solW.d))}`, "deux racines opposées"),
      ];
      return {
        utilise: [t(`|z| = |z − d| : M est à égale distance de O et du point d'affixe d, donc sur la médiatrice de ce segment ${cours(9)} ; on l'intersecte avec le cercle unité |z| = 1, avec `), f("|x+yi|^2=x^2+y^2"), t(` ${cours(4)}.`)],
        calculs: [
          { label: "Médiatrice", lignes: milieu },
          { label: "Cercle unité", lignes: cercle },
        ],
        verification: { fragments: [t("Les deux points sont sur le cercle unité :")], lignes: [ligne(`${pqL(frac(Math.round(sol[0].re * e.r), e.r))}^2+${pqL(frac(Math.round(sol[0].im * e.r), e.r))}^2=${qL(fois(q(Math.round(sol[0].re * e.r)), q(Math.round(sol[0].re * e.r), e.r * e.r)))}+${qL(fois(q(Math.round(sol[0].im * e.r)), q(Math.round(sol[0].im * e.r), e.r * e.r)))}`), ligne("=1")] },
      };
    }
  }
}


// ---------------------------------------------------------------------------------------------
// Famille E — parallélisme / perpendicularité
// ---------------------------------------------------------------------------------------------

function etapeE(e: ExerciceComplexesE, phase: PhaseComplexesAvances): Etape {
  const N = { a: e.zD.a - e.zC.a, b: e.zD.b - e.zC.b };
  const D = { a: e.zB.a - e.zA.a, b: e.zB.b - e.zA.b };
  const n2 = D.a * D.a + D.b * D.b;
  const pr = N.a * D.a + N.b * D.b;
  const pi = N.b * D.a - N.a * D.b;
  const re = frac(pr, n2);
  const im = frac(pi, n2);
  const rL = affixeLatexRationnel(pr / n2, pi / n2);
  const R = "\\dfrac{z_D-z_C}{z_B-z_A}";
  if (phase === "eEcran1") {
    const L: LigneCalcul[] = [ligne(`${R}=\\dfrac{${parAff(e.zD)}-${parAff(e.zC)}}{${parAff(e.zB)}-${parAff(e.zA)}}`, "on remplace par les affixes"), ligne(`=\\dfrac{${cz(N.a, N.b)}}{${cz(D.a, D.b)}}`, "on soustrait parties réelles et parties imaginaires")];
    if (N.a === D.a && N.b === D.b) L.push(ligne("=1", "numérateur et dénominateur égaux"));
    else if (D.b === 0) L.push(ligne(`=${rL}`, tm(`on divise chaque partie par ${D.a}`)));
    else {
      const Db = cz(D.a, -D.b);
      L.push(ligne(`=\\dfrac{${parP(cz(N.a, N.b))}${parP(Db)}}{${parP(cz(D.a, D.b))}${parP(Db)}}`, tm(`on multiplie haut et bas par le conjugué ${Db}`)));
      L.push(...lignesProduit(N.a, N.b, D.a, -D.b, `${parP(cz(N.a, N.b))}${parP(Db)}`));
      L.push(ligne(`${parP(cz(D.a, D.b))}${parP(Db)}=${D.a === 0 ? `${pn(D.b)}^2` : `${pn(D.a)}^2+${pn(D.b)}^2`}`, "(c + di)(c − di) = c² + d²"));
      L.push(ligne(`=${n2}`));
      L.push(ligne(`${R}=\\dfrac{${cz(pr, pi)}}{${n2}}`, "on reporte"));
      const reductible = (pr !== 0 && re.d !== n2) || (pi !== 0 && im.d !== n2);
      if (pr !== 0 && pi !== 0 && reductible) L.push(ligne(`=\\dfrac{${pr}}{${n2}}${pi < 0 ? "-" : "+"}\\dfrac{${Math.abs(pi)}}{${n2}}\\,i`, "on sépare partie réelle et partie imaginaire"));
      L.push(ligne(`=${rL}`, pr !== 0 && pi !== 0 && !reductible ? "on sépare partie réelle et partie imaginaire" : "on simplifie"));
    }
    return {
      utilise: [t(`On calcule les deux différences, puis on divise en multipliant haut et bas par le conjugué du dénominateur ${cours(1)} : `), f("\\dfrac{u}{v}=\\dfrac{u\\,\\bar v}{|v|^2}"), t(".")],
      calculs: [{ lignes: sansDoublons(L) }],
      verification:
        N.a === D.a && N.b === D.b
          ? undefined
          : D.b === 0
            ? { fragments: [t("Le rapport multiplié par "), f(`z_B-z_A=${D.a}`), t(" redonne "), f(`z_D-z_C=${cz(N.a, N.b)}`), t(" :")], lignes: [ligne(`${parP(rL)}\\cdot ${pn(D.a)}=${cz(N.a, N.b)}`, "on distribue")] }
            : { fragments: [t("Le rapport multiplié par "), f("z_B-z_A"), t(" redonne "), f(`z_D-z_C=${cz(N.a, N.b)}`), t(" : on multiplie le numérateur "), f(cz(pr, pi)), t(" par "), f("z_B-z_A"), t(`, puis on divise par ${n2}.`)], lignes: sansDoublons([...lignesProduit(pr, pi, D.a, D.b), ligne(`\\dfrac{${cz(n2 * N.a, n2 * N.b)}}{${n2}}=${cz(N.a, N.b)}`, `on divise par ${n2}`)]) },
    };
  }
  const argAttendu = formatReponseAttenduePhaseLatex(e, "eEcran2")[0].replace(/^\\arg/, "");
  if (phase === "eEcran2") {
    if (e.statut !== "aucun") {
      const reel = pi === 0;
      const tv = reel ? pr / n2 : pi / n2;
      const theta = argAttendu.replace(/^=/, "");
      const mod = Math.abs(tv) === 1 ? "" : `${Math.abs(tv)}`;
      const quoi = reel ? (tv > 0 ? "réel positif : demi-axe d'angle 0" : "réel négatif : demi-axe d'angle π") : tv > 0 ? "imaginaire pur positif : angle π/2" : "imaginaire pur négatif : angle −π/2";
      return {
        utilise: [t(`Argument d'un complexe ${cours(4)} : un réel positif a pour argument 0, un réel négatif π, un imaginaire pur ±π/2 (selon le signe de sa partie imaginaire).`)],
        calculs: [{ lignes: [ligne(`${rL}=${mod}\\left(${trig("cos", theta)}+i${trig("sin", theta)}\\right)`, quoi)] }],
      };
    }
    const tq = frac(pi, pr);
    const valeur = argAttendu.replace(/^\\approx\s*/, "");
    const quadrant = pr > 0 ? { ajout: "", j: "a > 0 : arctan donne directement l'angle" } : pi > 0 ? { ajout: "+\\pi", j: "a < 0 et b > 0 : 2ᵉ quadrant, on ajoute π" } : { ajout: "-\\pi", j: "a < 0 et b < 0 : 3ᵉ quadrant, on retire π" };
    return {
      utilise: [t(`Argument d'un complexe a + bi qui n'est pas sur un axe ${cours(4)} : `), f("\\tan\\theta=\\dfrac{b}{a}"), t(" ; "), f("\\theta=\\arctan\\dfrac{b}{a}"), t(" si a > 0, à corriger de ±π si a < 0 (quadrant).")],
      calculs: [
        {
          lignes: sansDoublons([
            ligne(`\\tan\\theta=\\dfrac{${pi}}{${pr}}`, `tan θ = b / a : le dénominateur ${n2} se simplifie`),
            ligne(`=${qL(tq)}`, "on simplifie"),
            ligne(`\\theta=\\arctan\\left(${qL(tq)}\\right)${quadrant.ajout}`, quadrant.j),
            argAttendu.startsWith("=") ? ligne(argAttendu, [t("angle remarquable : "), f(`\\arctan(${qL(frac(Math.abs(tq.n), tq.d))})=\\frac{\\pi}{4}`)]) : ligne(`\\approx ${valeur}`, "à la calculatrice, en radians"),
          ]),
        },
      ],
    };
  }
  return {
    utilise: [t(`L'argument du rapport mesure l'angle entre les directions de (AB) et de (CD) ${cours(8)} : (AB) et (CD) sont parallèles quand le rapport est réel (argument 0 ou π), perpendiculaires quand il est imaginaire pur (argument ±π/2).`)],
    calculs: [
      {
        lignes: [
          ligne(`\\left(\\overrightarrow{AB},\\overrightarrow{CD}\\right)=\\arg${R}`, "angle orienté des deux directions"),
          ligne(argAttendu,e.statut === "aucun" ? "étape 2 : ni 0 ou π, ni ±π/2" : e.statut === "paralleles" ? "étape 2 : 0 ou π, rapport réel" : "étape 2 : ±π/2, rapport imaginaire pur"),
        ],
      },
    ],
  };
}

// ---------------------------------------------------------------------------------------------
// Pièges (aussi utilisés par le barème de l'adaptateur)
// ---------------------------------------------------------------------------------------------

export function piege(e: ExerciceComplexesAvances, phase: PhaseComplexesAvances): FragmentConsigne[] | null {
  switch (phase) {
    case "aEcran1":
      return [t("S'arrêter à "), f("n\\theta\\equiv 0\\pmod{\\pi}"), t(" : un multiple impair de π donne un réel négatif.")];
    case "aEcran2":
      return e.famille === "A" && e.n === 4
        ? [t("Exiger un signe pour a ou b : avec n = 4, θ = π donne 4θ = 4π, un multiple de 2π ; tout l'axe réel convient, et tout l'axe imaginaire aussi.")]
        : [t("Oublier la condition de signe : "), f("b=-\\sqrt{3}\\,a"), t(" avec a > 0 donne θ = −π/3, et z³ est alors un réel négatif.")];
    case "aEcran3":
      return [t("Comparer |z| à k au lieu de "), f(e.famille === "A" ? `\\sqrt[${e.n}]{${e.k}}` : "\\sqrt[n]{k}"), t(" : c'est "), f("|z|^n"), t(" qui doit dépasser k.")];
    case "bEcran1": {
      if (e.famille !== "B" || e.sousType === "intersection") return null;
      switch (e.sousType) {
        case "droite":
          return [t("Oublier de conjuguer z − p₂ : sans conjugué, le produit n'a pas la même partie imaginaire que le quotient.")];
        case "thales":
          return [t("Écrire que la partie imaginaire est nulle : « imaginaire pur » impose une partie réelle nulle.")];
        case "apollonius":
          return [t("Oublier d'élever k au carré : "), f("|z-p_1|^2=k^2\\,|z-p_2|^2"), t(".")];
        case "demiDroites":
          return [t("Écrire |w| = X² + Y² : le module est la racine carrée "), f("\\sqrt{X^2+Y^2}"), t(".")];
        case "cercleO":
          return [t("Écrire "), f("z\\cdot\\bar z=x^2-y^2"), t(" : "), f("(yi)^2=-y^2"), t(", donc "), f("-(yi)^2=+y^2"), t(".")];
        case "cercleA":
          return [t("Se tromper de signe dans les parenthèses : on soustrait les coordonnées de a, "), f("(x-\\operatorname{Re}a)^2"), t(".")];
        default:
          return [t("Se tromper de signe : "), f("e^{-i\\theta}=\\cos\\theta-i\\sin\\theta"), t(", donc la partie imaginaire est "), f("Y\\cos\\theta-X\\sin\\theta"), t(".")];
      }
    }
    case "bEcran2": {
      if (e.famille !== "B" || e.sousType === "intersection") return null;
      if (e.resultat.nature === "demiDroite") return [t("Donner la droite entière : la condition de signe (ou d'argument modulo 2π) ne garde qu'une partie, origine exclue.")];
      if (e.poleExclu) return [t("Oublier d'exclure le point d'affixe "), f(affixeLatex(e.poleExclu)), t(", où la condition n'est pas définie.")];
      if (e.sousType === "cercleO") return [t("Prendre k pour rayon : le rayon est "), f("\\sqrt{k}"), t(".")];
      if (e.sousType === "cercleA") return [t("Confondre k et "), f("k^2"), t(" : le rayon est k.")];
      return [t("Prendre le second membre pour le rayon : c'est "), f("r^2"), t(", il faut en prendre la racine carrée.")];
    }
    case "bInterEcran1":
      return [t("Oublier le conjugué de q₂ − q₁ : c'est la partie imaginaire de "), f("(z-q_1)\\,\\overline{(q_2-q_1)}"), t(" qui doit être nulle.")];
    case "bInterEcran2":
      return [t("Prendre k pour rayon : le rayon est "), f("\\sqrt{k}"), t(".")];
    case "bInterEcran3":
      return [t("Ne garder qu'une des deux solutions de l'équation du second degré obtenue.")];
    case "cEcran1":
      return [t("Écrire "), f("p\\,\\bar p=p^2"), t(" : c'est "), f("|p|^2=a^2+b^2"), t(", un réel positif.")];
    case "cEcran2":
      return [t("Mal conjuguer : le conjugué de "), f("pz"), t(" est "), f("\\bar p\\,\\bar z"), t(".")];
    case "cEcran3":
      return e.famille === "C" && !e.conjugue
        ? [t("Conclure « égaux » au vu des constantes : les coefficients de z et de z̄ sont échangés, la différence dépend de z.")]
        : [t("Conclure sans remplacer "), f("z\\cdot\\bar z"), t(" par 1 : c'est l'hypothèse |z| = 1 qui rend les deux expressions égales.")];
    case "dRatioEcran1":
      return [t("Ne donner que la solution réelle : "), f("u^n=k"), t(" a n solutions complexes.")];
    case "dRatioEcran2":
      return [t("Calculer "), f("z=\\dfrac{c}{u}"), t(" : de "), f("u=\\dfrac{z+c}{z}"), t(" on tire "), f("z(u-1)=c"), t(".")];
    case "dReellesEcran1":
      return [t("Garder le facteur i dans l'équation de la partie imaginaire : on écrit seulement le coefficient de i, égal à 0.")];
    case "dReellesEcran2":
      return [t("N'utiliser que la partie réelle et oublier la condition donnée par la partie imaginaire.")];
    case "dReellesEcran3":
      return [t("Ne donner qu'une solution : les deux racines de la partie réelle conviennent.")];
    case "dCoefEcran1":
      return [t("Oublier que α et β sont réels : c'est ce qui permet d'identifier parties réelle et imaginaire.")];
    case "dCoefEcran2":
      return [t("Se tromper de signe : α est l'opposé de la somme des racines, "), f("\\alpha=-\\left(z_0+\\overline{z_0}\\right)"), t(".")];
    case "dModulesEcran1":
      return [t("Répondre |z| = ±1 : un module est toujours positif.")];
    case "dModulesEcran2":
      return [t("Oublier l'un des deux points d'intersection de la médiatrice avec le cercle unité.")];
    case "eEcran1":
      return [t("Ne multiplier que le dénominateur par le conjugué : le numérateur doit l'être aussi, sinon le rapport change.")];
    case "eEcran2":
      return e.famille === "E" && e.statut === "aucun"
        ? [t("Prendre arctan(b / a) sans regarder le signe de a : pour a < 0, il faut ajouter ou retirer π.")]
        : [t("Donner 0 pour un réel négatif : son argument est π.")];
    case "eEcran3":
      return [t("Inverser les critères : rapport réel → parallèles ; rapport imaginaire pur → perpendiculaires.")];
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------------------------
// Assemblage
// ---------------------------------------------------------------------------------------------

function etape(e: ExerciceComplexesAvances, phase: PhaseComplexesAvances): Etape {
  switch (e.famille) {
    case "A":
      return etapeA(e, phase);
    case "B":
      return e.sousType === "intersection" ? etapeBIntersection(e, phase) : etapeBSimple(e, phase);
    case "C":
      return etapeC(e, phase);
    case "D":
      return etapeD(e, phase);
    case "E":
      return etapeE(e, phase);
  }
}

function lignesEtape(e: ExerciceComplexesAvances, phase: PhaseComplexesAvances, sq: string, derniere: boolean): EtapeCorrection[] {
  const et = etape(e, phase);
  const L: EtapeCorrection[] = [utilise(sq, et.utilise)];
  for (const b of et.calculs) {
    const lignes = b.lignes.filter((l, i) => i === 0 || l.latex !== b.lignes[i - 1].latex);
    if (lignes.length) L.push(ligneCalcul(sq, lignes, b.intro ?? [], b.label));
  }
  const fig = derniere ? figure(e) : null;
  L.push({ ...resultat(sq, reponse(e, phase)), ...(fig ? { figureHtml: fig } : {}) });
  if (et.verification) L.push(verification(sq, et.verification.fragments, et.verification.lignes));
  const p = piege(e, phase);
  if (p) L.push(lignePiege(sq, p));
  return L;
}

export function correctionDetailleeComplexesAvances(e: ExerciceComplexesAvances): EtapeCorrection[] {
  const phases = phasesPourExercice(e);
  return phases.flatMap((phase, i) => lignesEtape(e, phase, LETTRES[i], i === phases.length - 1));
}
