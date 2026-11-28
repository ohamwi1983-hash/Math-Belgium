import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../export/genererFeuilleExercices";
import { ligne } from "../../export/corrigeTableau";
import { estCarreParfait, latexQ, latexRacine, latexSomme, q, qAdd, qDiv, qMul, qNeg, qNum, qSub } from "../moteur6e/algebreLieux";
import type { Pt, Q } from "../moteur6e/algebreLieux";
import { c2Conique, racineQ } from "../moteur6e/algebreConiques";
import type { Conique } from "../moteur6e/algebreConiques";
import { arrondiLatex, milliers } from "./fragmentsCombinatoire";
import { avecFigure, parQ } from "./corrigeLieux";

/**
 * Briques du corrigé « comme au tableau » des générateurs 6gen58–6gen63 (6e ch. 10 « Les coniques »,
 * audit, lot E), en plus de celles du ch. 7 (`corrigeCombinatoire.ts` : `fx`, `utiliseCours`,
 * `finaliserCombinatoire`, `corrigeDeLEcran`…) et du ch. 9 (`corrigeLieux.ts` : droites, systèmes,
 * `avecFigure`). SANS `docx` : importé par les adaptateurs papier ET par les applis (corrigé consultable
 * après chaque réponse). Notations du cours réécrit (lot AFD) : y² = 2px avec p = dist(F ; d), |PF|,
 * « loi des cosinus », forme dédoublée, condition de tangence k² = a²m² ± b².
 */

export const COURS_IDENTIFIER = "cours, point 1";
export const COURS_EXCENTRICITE = "cours, point 2";
export const COURS_AIRE = "cours, point 3";
export const COURS_INTERSECTION = "cours, point 4";
export const COURS_TANGENTES = "cours, point 5";
export const COURS_OPTIQUE = "cours, point 6";

type Fragments = FragmentConsigne[];

export const lq = latexQ;
export { parQ };

/** Figure du corrigé : la chaîne SVG de l'écran (toutes les étapes faites), bornée à 9 cm. */
export function avecFigureConique(etape: EtapeCorrection, svg: string | null): EtapeCorrection {
  return svg ? avecFigure(etape, svg) : etape;
}

/** « \sqrt{50} » brut. */
export const racineBrute = (R: Q) => `\\sqrt{${latexQ(R)}}`;

/** Valeur approchée (au centième, virgule) d'une racine irrationnelle, sinon chaîne vide. */
export function approxRacine(R: Q): string {
  if (estCarreParfait(R)) return "";
  return `\\approx ${arrondiLatex(Math.sqrt(qNum(R)), 2)}`;
}

/** « c = √50 = 5√2 » (une seule écriture si la racine est déjà simplifiée ou entière). */
export function ligneRacine(nom: string, R: Q, justification?: string | Fragments): LigneCalcul {
  const brut = racineBrute(R);
  const simple = latexRacine(R);
  return ligne(simple === brut ? `${nom}=${brut}` : `${nom}=${brut}=${simple}`, justification);
}

/** Écriture « a(x − h) » d'une variable décalée : « x », « x-3 », « x+\frac{1}{2} ». */
export function decale(v: string, h: Q): string {
  if (h.n === 0n) return v;
  return h.n > 0n ? `${v}-${latexQ(h)}` : `${v}+${latexQ(qNeg(h))}`;
}

/** Coefficient devant une lettre : 1 → « », −1 → « - ». */
export function coefL(c: Q | number): string {
  const r = typeof c === "number" ? q(c) : c;
  if (r.n === 1n && r.d === 1n) return "";
  if (r.n === -1n && r.d === 1n) return "-";
  return latexQ(r);
}

/** a, b, c d'une ellipse ou d'une hyperbole (racines simplifiées), et c². */
export function demiAxes(c: Extract<Conique, { type: "ellipse" | "hyperbole" }>) {
  const c2 = c2Conique(c);
  return { a: latexRacine(c.a2), b: latexRacine(c.b2), c: latexRacine(c2), c2 };
}

/** Lignes « c² = a² ∓ b² = … » puis « c = √… ». */
export function lignesC(c: Extract<Conique, { type: "ellipse" | "hyperbole" }>): LigneCalcul[] {
  const c2 = c2Conique(c);
  const op = c.type === "ellipse" ? "-" : "+";
  return [ligne(`c^2=a^2${op}b^2=${latexQ(c.a2)}${op}${latexQ(c.b2)}=${latexQ(c2)}`, c.type === "ellipse" ? "ellipse : c² = a² − b²" : "hyperbole : c² = a² + b²"), ligneRacine("c", c2)];
}

/** Δ et racines (rationnelles ou non) d'une équation entière a x² + b x + c = 0, une ligne par calcul. */
export function lignesDiscriminant(eq: [bigint, bigint, bigint], v = "x"): { lignes: LigneCalcul[]; delta: bigint } {
  const [a, b, c] = eq;
  const delta = b * b - 4n * a * c;
  const p = (n: bigint) => (n < 0n ? `(${milliers(n)})` : milliers(n));
  return { lignes: [ligne(`\\Delta=${p(b)}^2-4\\cdot ${p(a)}\\cdot ${p(c)}=${milliers(delta)}`, `discriminant de l'équation en ${v}`)], delta };
}

/** Carré d'un rationnel : « 3^2 », « \left(-\frac{1}{2}\right)^2 ». */
export function carreL(r: Q): string {
  return r.d !== 1n || r.n < 0n ? `\\left(${latexQ(r)}\\right)^2` : `${r.n}^2`;
}

/** Solutions rationnelles d'une équation entière à discriminant carré parfait (Δ ≥ 0). */
export function racinesRationnelles(eq: [bigint, bigint, bigint]): Q[] {
  const [a, b, c] = eq;
  const d = b * b - 4n * a * c;
  if (d < 0n) return [];
  const r = racineQ(q(d));
  if (d === 0n) return [q(-b, 2n * a)];
  const rr = r.n; // entier
  return [qDiv(qSub(q(-b), q(rr)), q(2n * a)), qDiv(qAdd(q(-b), q(rr)), q(2n * a))].sort((u, w) => qNum(u) - qNum(w));
}

/** Lignes des solutions « x = (−b ± √Δ)/(2a) » (Δ carré parfait). */
export function lignesSolutions(eq: [bigint, bigint, bigint], v = "x", vTexte = v): { lignes: LigneCalcul[]; sol: Q[] } {
  const [a, b] = eq;
  const sol = racinesRationnelles(eq);
  const d = eq[1] * eq[1] - 4n * eq[0] * eq[2];
  const mb = milliers(-b);
  if (d === 0n) return { lignes: [ligne(`${v}=\\dfrac{${mb}}{2\\cdot ${a < 0n ? `(${milliers(a)})` : milliers(a)}}=${latexQ(sol[0])}`, `Δ = 0 : une seule solution, ${vTexte} = −b/(2a)`)], sol };
  const r = racineQ(q(d)).n;
  const den = 2n * a;
  return {
    lignes: [
      ligne(`\\sqrt{\\Delta}=\\sqrt{${milliers(d)}}=${milliers(r)}`),
      ligne(`${v}_1=\\dfrac{${mb}-${milliers(r)}}{${milliers(den)}}=${latexQ(qDiv(qSub(q(-b), q(r)), q(den)))}`, `${vTexte} = (−b ± √Δ)/(2a)`),
      ligne(`${v}_2=\\dfrac{${mb}+${milliers(r)}}{${milliers(den)}}=${latexQ(qDiv(qAdd(q(-b), q(r)), q(den)))}`),
    ],
    sol,
  };
}

/** « y = mx + k » en KaTeX. */
export const yMK = (m: Q, k: Q) => `y=${latexSomme([
  [m, "x"],
  [k, ""],
])}`;

/** Valeur du premier membre de P(x ; y) = … pour un point exact (contrôle « le point vérifie »). */
export function remplacer(expr: (x: string, y: string) => string, P: Pt): string {
  return expr(parQ(P.x), parQ(P.y));
}

/** Équation réduite d'une conique CENTRÉE en O avec y (ou x) remplacé par une expression. */
export function equationSubstituee(c: Extract<Conique, { type: "ellipse" | "hyperbole" | "cercle" }>, ex: string): string {
  if (c.type === "cercle") return `x^2+\\left(${ex}\\right)^2=${latexQ(c.r2)}`;
  const s = c.type === "ellipse" ? "+" : "-";
  if (c.axe === "x") return `\\dfrac{x^2}{${latexQ(c.a2)}}${s}\\dfrac{\\left(${ex}\\right)^2}{${latexQ(c.b2)}}=1`;
  return c.type === "ellipse" ? `\\dfrac{\\left(${ex}\\right)^2}{${latexQ(c.a2)}}+\\dfrac{x^2}{${latexQ(c.b2)}}=1` : `\\dfrac{\\left(${ex}\\right)^2}{${latexQ(c.a2)}}-\\dfrac{x^2}{${latexQ(c.b2)}}=1`;
}

/** Coefficients rationnels de A x² + B x + C = 0 écrits proprement. */
export function trinome(A: Q, B: Q, C: Q, v = "x"): string {
  return `${latexSomme([
    [A, `${v}^2`],
    [B, v],
    [C, ""],
  ])}=0`;
}

/** Espaces de milliers dans les entiers de 5 chiffres ou plus d'une formule (« 15\,625 »). */
export function milliersDans(s: string): string {
  return s.replace(/(?<![\d{,])\d{5,}(?!\d)/g, (m) => milliers(BigInt(m)));
}

export const qAbs = (r: Q) => (r.n < 0n ? qNeg(r) : r);
export const deuxQ = (r: Q) => qMul(q(2), r);
