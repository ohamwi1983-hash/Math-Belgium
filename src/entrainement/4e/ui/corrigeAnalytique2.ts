import { latex, ligne, texte } from "../../export/corrigeTableau";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../export/genererFeuilleExercices";
import { moinsH, q, qp, racineSimplifiee, rationnel, sansDoublons, somme } from "./corrigeChapitre3";
import { COURS_CERCLE, COURS_LIEU } from "./corrigeLotG";

/**
 * Briques du corrigé détaillé « comme au tableau » du chapitre 7 de 4e, moitié 2 (gen49–gen54 :
 * cercle, parabole, construction, lieux), sans `docx` (importées par les applis ET les
 * adaptateurs) : une transformation par ligne, la règle à droite. Renvois au cours : § 7 lieu
 * géométrique, § 8 cercle, § 9 parabole, § 10 intersection de deux lieux. Valeurs exactes
 * (fractions, racines simplifiées) ; jamais « déterminant », aucun radian.
 */

export { COURS_CERCLE, COURS_LIEU };
export const COURS_PARABOLE = "(cours, point 9)";
export const COURS_LIEUX = "(cours, point 10)";

type Fragments = FragmentConsigne[];

function net(v: number): number {
  return Math.abs(v) < 1e-12 ? 0 : v;
}

/** Le nombre s'écrit-il avec une fraction ? */
export function estFraction(v: number): boolean {
  const r = rationnel(v);
  return !!r && r.d !== 1;
}

/** Nombre entre parenthèses (`\left( \right)` pour une fraction) avant un exposant. */
export function baseCarre(v: number): string {
  const s = q(v);
  if (estFraction(v)) return `\\left(${s}\\right)`;
  return net(v) < 0 ? `(${s})` : s;
}

/** « (x−c)^2 », « \left(x−\dfrac{5}{2}\right)^2 », « x^2 » si c = 0. */
export function carreBinome(c: number, v: string): string {
  if (net(c) === 0) return `${v}^2`;
  return estFraction(c) ? `\\left(${moinsH(c, v)}\\right)^2` : `(${moinsH(c, v)})^2`;
}

/** Binôme tel qu'on le substitue, avant simplification du signe : « x-2 », « x-(-3) », « x-0 ». */
export function binomeBrut(c: number, v: string): string {
  return `${v}-${qp(c)}`;
}

/** Carré d'un binôme substitué brut : « (x-(-3))^2 ». */
export function carreBrut(c: number, v: string): string {
  return `(${binomeBrut(c, v)})^2`;
}

/** Développement de (αu + β)² : α²u² + 2αβu + β². */
export function carreDeveloppe(alpha: number, beta: number, u: string): string {
  return somme([
    [alpha * alpha, `${u}^2`],
    [2 * alpha * beta, u],
    [beta * beta, ""],
  ]);
}

/** « - (développement) » : parenthèses seulement s'il y a plusieurs termes. */
export function moinsGroupe(expr: string): string {
  return /^-?[^+-]+$/.test(expr) ? `-${expr}`.replace(/^--/, "+") : `-(${expr})`;
}

/**
 * Compléter le carré de « u² + b·u » : (u + b/2)² − (b/2)², puis le carré calculé.
 * Deux lignes (une transformation chacune) ; b ≠ 0.
 */
export function lignesCompleterCarre(b: number, u: string): LigneCalcul[] {
  const h = -b / 2;
  const depart = somme([
    [1, `${u}^2`],
    [b, u],
  ]);
  return [
    ligne(`${depart}=${carreBinome(h, u)}-${baseCarre(Math.abs(b / 2))}^2`, [
      texte("on complète le carré : moitié de "),
      latex(q(b)),
      texte(", "),
      // « 5/2 = 5/2 » ne dit rien : la fraction seule quand la moitié ne se simplifie pas.
      latex(`\\dfrac{${q(b)}}{2}` === q(b / 2) ? q(b / 2) : `\\dfrac{${q(b)}}{2}=${q(b / 2)}`),
    ]),
    ligne(`=${carreBinome(h, u)}-${q((b * b) / 4)}`, [latex(`${baseCarre(Math.abs(b / 2))}^2=${q((b * b) / 4)}`)]),
  ];
}

/**
 * Racine carrée exacte d'un rationnel positif `r2`, ligne par ligne : `nom = √r2`, quotient de
 * racines, carré extrait, simplification. Dernière valeur = `racineCarreeLatex(r2)`.
 */
export function lignesRacine(nom: string, r2: number, justificationDepart: string | Fragments): LigneCalcul[] {
  const r = rationnel(r2);
  if (!r) return [ligne(`${nom}=\\sqrt{${q(r2)}}`, justificationDepart)];
  const lignes: LigneCalcul[] = [ligne(`${nom}=\\sqrt{${q(r2)}}`, justificationDepart)];
  // Numérateur N et dénominateur s (un carré s²) : √(n/d) = √N / s.
  let N = r.n;
  let s = 1;
  if (r.d !== 1) {
    const sd = Math.round(Math.sqrt(r.d));
    if (sd * sd === r.d) {
      s = sd;
      lignes.push(ligne(`=\\dfrac{\\sqrt{${r.n}}}{\\sqrt{${r.d}}}`, "racine d'un quotient"));
      if (Math.round(Math.sqrt(r.n)) ** 2 !== r.n) lignes.push(ligne(`=\\dfrac{\\sqrt{${r.n}}}{${s}}`, `√${r.d} = ${s}`));
    } else {
      N = r.n * r.d;
      s = r.d;
      lignes.push(ligne(`=\\sqrt{\\dfrac{${N}}{${r.d * r.d}}}`, `on multiplie le numérateur et le dénominateur par ${r.d} : un carré au dénominateur`));
      lignes.push(ligne(`=\\dfrac{\\sqrt{${N}}}{${s}}`, "racine d'un quotient"));
    }
  }
  const { k, m } = racineSimplifiee(N);
  const sur = (num: string, den: number) => (den === 1 ? num : `\\dfrac{${num}}{${den}}`);
  if (m === 1) {
    lignes.push(ligne(`=${sur(String(k), s)}`, `${N} = ${k}²`));
    if (s !== 1 && q(k / s) !== `\\dfrac{${k}}{${s}}`) lignes.push(ligne(`=${q(k / s)}`, "on simplifie la fraction"));
    return sansDoublons(lignes);
  }
  if (k > 1) {
    lignes.push(ligne(`=${sur(`\\sqrt{${k * k}\\cdot ${m}}`, s)}`, `on fait apparaître le carré ${k * k}`));
    lignes.push(ligne(`=${sur(`${k}\\sqrt{${m}}`, s)}`, `√${k * k} = ${k}`));
    const g = pgcd(k, s);
    if (s !== 1 && g > 1) {
      const kk = k / g;
      const ss = s / g;
      lignes.push(ligne(`=${sur(`${kk === 1 ? "" : kk}\\sqrt{${m}}`, ss)}`, `on simplifie par ${g}`));
    }
  }
  return sansDoublons(lignes);
}

function pgcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : pgcd(b, a % b);
}

/** « (x_P−x₀)²+(y_P−y₀)² » écrit avec les nombres (« (5-2)^2+(3+1)^2 », « 5^2 » si x₀ = 0). */
export function sommeCarresPoint(p: { x: number; y: number }, c: { x: number; y: number }): string {
  const carre = (v: number, c0: number) => (net(c0) === 0 ? baseCarre(v) + "^2" : `(${q(v)}${c0 < 0 ? `+${q(-c0)}` : `-${q(c0)}`})^2`);
  return `${carre(p.x, c.x)}+${carre(p.y, c.y)}`;
}

/**
 * Vérification « P est sur le cercle (x − x₀)² + (y − y₀)² = r² » : substitution, carrés, somme
 * (une transformation par ligne).
 */
export function lignesPointSurCercle(c: { x: number; y: number }, r2: number, p: { x: number; y: number }, nomPoint: string, nomCarre = "r^2"): LigneCalcul[] {
  const dx = p.x - c.x;
  const dy = p.y - c.y;
  const val = dx * dx + dy * dy;
  const ok = Math.abs(val - r2) < 1e-9;
  return sansDoublons([
    ligne(`${sommeCarresPoint(p, c)}=${baseCarre(dx)}^2+${baseCarre(dy)}^2`, `coordonnées de ${nomPoint} remplacées dans le premier membre`),
    ligne(`=${q(val)}`, ok ? [texte("c'est bien "), latex(`${nomCarre}=${q(r2)}`), texte(` : ${nomPoint} est sur le cercle`)] : `${nomPoint} ne vérifie pas l'équation`),
  ]);
}

/**
 * Équation du cercle de centre `c` et de rayon `rayonLatex` (r² = `r2`) : substitution brute du
 * centre et du rayon, puis signes simplifiés et rayon élevé au carré.
 */
export function lignesEquationCercle(c: { x: number; y: number }, r2: number, rayonLatex: string, nomRayon = "r"): LigneCalcul[] {
  const rayonCarre = /^\d+$/.test(rayonLatex) ? `${rayonLatex}^2` : `(${rayonLatex})^2`;
  return sansDoublons([
    ligne(`${carreBrut(c.x, "x")}+${carreBrut(c.y, "y")}=${rayonCarre}`, [latex(`x_0=${q(c.x)}`), texte(", "), latex(`y_0=${q(c.y)}`), texte(", "), latex(`${nomRayon}=${rayonLatex}`), texte(" remplacés")]),
    ligne(`${carreBinome(c.x, "x")}+${carreBinome(c.y, "y")}=${q(r2)}`, signesEtCarre(c, rayonCarre, r2)),
  ]);
}

function signesEtCarre(c: { x: number; y: number }, rayonCarre: string, r2: number): Fragments {
  const morceaux: Fragments = [];
  for (const [v, c0] of [
    ["x", c.x],
    ["y", c.y],
  ] as const) {
    if (net(c0) < 0) morceaux.push(latex(`${v}-(${q(c0)})=${moinsH(c0, v)}`), texte(", "));
    else if (net(c0) === 0) morceaux.push(latex(`${v}-0=${v}`), texte(", "));
  }
  morceaux.push(latex(`${rayonCarre}=${q(r2)}`));
  return morceaux;
}

/** Discriminant d'un trinôme entier a·u² + b·u + c, une transformation par ligne. */
export function lignesDiscriminant(a: number, b: number, c: number): LigneCalcul[] {
  const b2 = b * b;
  const m4ac = -4 * a * c;
  return sansDoublons([
    ligne(`\\Delta=${qp(b)}^2-4\\cdot ${qp(a)}\\cdot ${qp(c)}`, [texte("formule "), latex("\\Delta=b^2-4ac"), texte(" avec "), latex(`a=${q(a)}`), texte(", "), latex(`b=${q(b)}`), texte(", "), latex(`c=${q(c)}`)]),
    ligne(`=${q(b2)}${m4ac === 0 ? "" : m4ac > 0 ? `+${q(m4ac)}` : `-${q(-m4ac)}`}`),
    ligne(`=${q(b2 + m4ac)}`),
  ]);
}

/**
 * Solutions d'un trinôme entier (Δ ≥ 0, Δ carré parfait) : √Δ, puis u₁ < u₂ par la formule, ou la
 * solution double. `u` : nom de l'inconnue (« x », « y »).
 */
export function lignesSolutions(a: number, b: number, c: number, u: string): { lignes: LigneCalcul[]; racines: number[] } {
  const delta = b * b - 4 * a * c;
  if (delta === 0) {
    const x = -b / (2 * a);
    return {
      lignes: sansDoublons([ligne(`${u}=\\dfrac{${q(-b)}}{${q(2 * a)}}`, [texte("Δ = 0 : solution double "), latex(`${u}=\\dfrac{-b}{2a}`)]), ligne(`=${q(x)}`)]),
      racines: [x],
    };
  }
  const s = Math.round(Math.sqrt(delta));
  const exact = s * s === delta;
  const racDelta = exact ? String(s) : `\\sqrt{${delta}}`;
  const lignes: LigneCalcul[] = [ligne(`\\sqrt{\\Delta}=\\sqrt{${delta}}${exact ? `=${s}` : ""}`, exact ? `${delta} = ${s}²` : "Δ > 0 : deux solutions")];
  const signe = a > 0 ? 1 : -1;
  const racines = [(-b - signe * Math.sqrt(delta)) / (2 * a), (-b + signe * Math.sqrt(delta)) / (2 * a)];
  ([-signe, signe] as const).forEach((sg, i) => {
    const nom = `${u}_${i + 1}`;
    const num = `${q(-b)}${sg < 0 ? "-" : "+"}${racDelta}`;
    lignes.push(ligne(`${nom}=\\dfrac{${num}}{${q(2 * a)}}`, i === 0 ? [texte("Δ > 0 : deux solutions "), latex(`\\dfrac{-b\\pm\\sqrt{\\Delta}}{2a}`)] : undefined));
    if (exact) lignes.push(ligne(`=\\dfrac{${q(-b + sg * s)}}{${q(2 * a)}}`), ligne(`=${q(racines[i]!)}`));
  });
  return { lignes: sansDoublons(lignes), racines };
}

/** Formule courte qui contient une relation : groupée `{…}` pour que KaTeX ne la coupe pas après
 * « = » dans une colonne étroite (justification, texte d'un « Ce qu'on utilise » ou d'un résultat)
 * — même règle que `corrigeVecteurs2.ts::finaliserVecteurs`. */
function grouper(f: FragmentConsigne, toujours: boolean): FragmentConsigne {
  if (f.type !== "latex" || f.valeur.startsWith("{")) return f;
  const visible = f.valeur
    .replace(/\\begin\{pmatrix\}(.*?)\\\\(.*?)\\end\{pmatrix\}/g, "$1")
    .replace(/\\[a-zA-Z]+/g, "")
    .replace(/[{}\s]/g, "").length;
  if (!/=|\\neq|\\iff|<|>/.test(f.valeur) || (!toujours && visible > 40)) return f;
  return { type: "latex", valeur: `{${f.valeur}}` };
}

/** Dernière passe des corrigés de la moitié 2 : formules des justifications et des textes groupées. */
export function finaliserAnalytique2(etapes: EtapeCorrection[]): EtapeCorrection[] {
  return etapes.map((e) => ({
    ...e,
    fragments: e.fragments.length > 1 ? e.fragments.map((f) => grouper(f, false)) : e.fragments,
    ...(e.calcul ? { calcul: e.calcul.map((l) => (Array.isArray(l.justification) ? { ...l, justification: l.justification.map((f) => grouper(f, true)) } : l)) } : {}),
  }));
}
