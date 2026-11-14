import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type {
  ExerciceDetectiveIntegrales,
  IdDescriptionIntegrales,
  IdScenarioIntegrales,
  Rationnel,
  SupportIntegrales,
  TermeExact,
  TypeErreurIntegrales,
  ValeurLigne,
} from "../core6e/detectiveIntegrales.types";

/**
 * Modèle de 6gen84 (« Le détective d'erreurs : intégrales et primitives ») : résolution pure de
 * l'exercice support, ligne par ligne. UNE seule source pour l'écran, les aides, la vérification et
 * l'adaptateur de feuilles.
 *
 * - `copieEleve(e)` : la copie fictive (le défaut est injecté à la ligne fausse ; les lignes
 *   suivantes en découlent avec la bonne méthode : la copie reste cohérente avec son erreur) ;
 * - `correction(e)` : la résolution juste, à partir de la ligne fausse (la ligne corrigée d'abord) ;
 * - `valeursAttendues(e)` : ce que l'écran 3 demande (valeur de la ligne corrigée quand elle porte
 *   une valeur propre, puis le résultat final).
 *
 * Toutes les valeurs sont EXACTES (rationnels, multiples de π, de ln(m) ou de √3) : aucune
 * calculatrice. Formules du cours : `\int f(ax+b)\,dx = \dfrac{1}{a}F(ax+b) + C`,
 * `\int\dfrac{1}{x}\,dx = \ln|x| + C`, `\int\sin(x)\,dx = -\cos(x) + C`, méthode des disques,
 * valeur moyenne, condition initiale `F(x_0) + C = y_0`.
 */

export const SCENARIOS: Record<IdScenarioIntegrales, { type: TypeErreurIntegrales; support: SupportIntegrales; ligne: number; nombreLignes: number }> = {
  A1: { type: "affine", support: "integrale", ligne: 0, nombreLignes: 4 },
  A2: { type: "affine", support: "integrale", ligne: 1, nombreLignes: 4 },
  L1: { type: "lnAbs", support: "integrale", ligne: 0, nombreLignes: 4 },
  L2: { type: "lnAbs", support: "conditionInitiale", ligne: 0, nombreLignes: 4 },
  G1: { type: "signe", support: "integrale", ligne: 1, nombreLignes: 5 },
  G2: { type: "signe", support: "conditionInitiale", ligne: 0, nombreLignes: 4 },
  R1: { type: "aire", support: "aireCourbe", ligne: 1, nombreLignes: 4 },
  R2: { type: "aire", support: "aireDeuxCourbes", ligne: 1, nombreLignes: 4 },
  V1: { type: "volume", support: "volume", ligne: 1, nombreLignes: 4 },
  V2: { type: "volume", support: "volume", ligne: 1, nombreLignes: 4 },
  B1: { type: "bornes", support: "valeurMoyenne", ligne: 1, nombreLignes: 3 },
  C1: { type: "constante", support: "conditionInitiale", ligne: 2, nombreLignes: 4 },
  C2: { type: "constante", support: "cinematique", ligne: 0, nombreLignes: 3 },
};

export const SCENARIOS_PAR_TYPE: Record<TypeErreurIntegrales, IdScenarioIntegrales[]> = {
  affine: ["A1", "A2"],
  lnAbs: ["L1", "L2"],
  signe: ["G1", "G2"],
  aire: ["R1", "R2"],
  volume: ["V1", "V2"],
  bornes: ["B1"],
  constante: ["C1", "C2"],
};

export function typeErreur(e: { scenario: IdScenarioIntegrales }): TypeErreurIntegrales {
  return SCENARIOS[e.scenario].type;
}

export function support(e: { scenario: IdScenarioIntegrales }): SupportIntegrales {
  return SCENARIOS[e.scenario].support;
}

/** Indice (0 = ligne 1) de la ligne fausse. */
export function indiceLigneFausse(e: { scenario: IdScenarioIntegrales }): number {
  return SCENARIOS[e.scenario].ligne;
}

/** Description juste de l'erreur (écran 2). */
export function descriptionCorrecte(e: { scenario: IdScenarioIntegrales }): IdDescriptionIntegrales {
  switch (e.scenario) {
    case "A1":
    case "A2":
      return "affine";
    case "L1":
    case "L2":
      return "lnAbs";
    case "G1":
      return "signeSin";
    case "G2":
      return "signeCos";
    case "R1":
      return "aireRacines";
    case "R2":
      return "aireIntersections";
    case "V1":
      return "volumeCarre";
    case "V2":
      return "volumePi";
    case "B1":
      return "bornes";
    case "C1":
      return "constanteIsolee";
    case "C2":
      return "constanteOubliee";
  }
}

// ---------------------------------------------------------------------------------------------
// Nombres exacts
// ---------------------------------------------------------------------------------------------

function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

export function rat(n: number, d = 1): Rationnel {
  if (d < 0) [n, d] = [-n, -d];
  const g = pgcd(n, d);
  return { n: n / g === 0 ? 0 : n / g, d: d / g };
}

const plusR = (a: Rationnel, b: Rationnel) => rat(a.n * b.d + b.n * a.d, a.d * b.d);
const foisR = (a: Rationnel, b: Rationnel) => rat(a.n * b.n, a.d * b.d);
const oppR = (a: Rationnel) => rat(-a.n, a.d);
const valR = (a: Rationnel) => a.n / a.d;

/** Rationnel en LaTeX : entier, ou `\dfrac{p}{q}` (signe devant). */
export function ratLatex(r: Rationnel): string {
  if (r.d === 1) return String(r.n);
  return `${r.n < 0 ? "-" : ""}\\dfrac{${Math.abs(r.n)}}{${r.d}}`;
}

/** Rationnel entre parenthèses s'il est négatif (terme soustrait, facteur). */
export function parRat(r: Rationnel): string {
  return r.n < 0 ? `\\left(${ratLatex(r)}\\right)` : ratLatex(r);
}

/** Entier entre parenthèses s'il est négatif. */
export function parN(x: number): string {
  return x < 0 ? `(${x})` : String(x);
}

const VALEURS_SYMBOLES: Record<string, number> = { "": 1, "\\pi": Math.PI, "\\sqrt{3}": Math.sqrt(3) };

function valeurSymbole(s: string): number {
  if (s in VALEURS_SYMBOLES) return VALEURS_SYMBOLES[s]!;
  const m = /^\\ln\((\d+)\)$/.exec(s);
  return m ? Math.log(Number(m[1])) : NaN;
}

export function terme(coef: Rationnel, symbole = ""): TermeExact {
  return { coef, symbole, valeur: valeurSymbole(symbole) };
}

/** Somme de termes exacts (termes de même symbole regroupés, termes nuls retirés). */
export function sommeExacte(...listes: TermeExact[][]): TermeExact[] {
  const resultat: TermeExact[] = [];
  for (const t of listes.flat()) {
    const i = resultat.findIndex((r) => r.symbole === t.symbole);
    if (i >= 0) resultat[i] = { ...resultat[i]!, coef: plusR(resultat[i]!.coef, t.coef) };
    else resultat.push(t);
  }
  return resultat.filter((t) => t.coef.n !== 0).sort((a, b) => (a.symbole === "" ? -1 : b.symbole === "" ? 1 : 0));
}

export function foisExact(termes: TermeExact[], k: Rationnel): TermeExact[] {
  return sommeExacte(termes.map((t) => ({ ...t, coef: foisR(t.coef, k) })));
}

export function valeurExacte(termes: TermeExact[]): number {
  return termes.reduce((s, t) => s + valR(t.coef) * t.valeur, 0);
}

/** Un terme positif en LaTeX : coefficient numérateur pour π et √ (`\dfrac{9\pi}{2}`), devant sinon. */
function termePositifLatex(c: Rationnel, s: string): string {
  if (s === "") return ratLatex(c);
  const numerateur = s === "\\pi" || s.startsWith("\\sqrt");
  if (c.d === 1) return c.n === 1 ? s : `${c.n}${s}`;
  if (numerateur) return `\\dfrac{${c.n === 1 ? "" : c.n}${s}}{${c.d}}`;
  return `\\dfrac{${c.n}}{${c.d}}${s}`;
}

/** Somme de termes (coefficient × symbole quelconque : `x^2`, `\sin(x)`, `\pi`…) en LaTeX. */
export function termesLatex(termes: { coef: Rationnel; symbole: string }[]): string {
  const utiles = termes.filter((t) => t.coef.n !== 0);
  if (utiles.length === 0) return "0";
  return utiles
    .map((t, i) => {
      const positif = { n: Math.abs(t.coef.n), d: t.coef.d };
      const corps = termePositifLatex(positif, t.symbole);
      if (i === 0) return t.coef.n < 0 ? `-${corps}` : corps;
      return t.coef.n < 0 ? ` - ${corps}` : ` + ${corps}`;
    })
    .join("");
}

/** Monômes à coefficients entiers : `[[3, "x^2"], [-4, "x"], [5, ""]]` → `3x^2 - 4x + 5`. */
function poly(monomes: [number, string][]): string {
  return termesLatex(monomes.map(([c, s]) => ({ coef: rat(c), symbole: s })));
}

/** Coefficient entier devant une expression (1 omis). */
function cc(c: number, expr: string): string {
  return c === 1 ? expr : `${c}${expr}`;
}

// ---------------------------------------------------------------------------------------------
// Fragments
// ---------------------------------------------------------------------------------------------

const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

export const INTERVALLE_NEGATIF = "\\mathopen{]}-\\infty;0\\mathclose{[}";

// ---------------------------------------------------------------------------------------------
// Données dérivées des scénarios
// ---------------------------------------------------------------------------------------------

/** Angles remarquables de G1 (cosinus exact). */
export const ANGLES_G1: { l: string; cos: Rationnel }[] = [
  { l: "0", cos: rat(1) },
  { l: "\\frac{\\pi}{3}", cos: rat(1, 2) },
  { l: "\\frac{\\pi}{2}", cos: rat(0) },
  { l: "\\frac{2\\pi}{3}", cos: rat(-1, 2) },
  { l: "\\pi", cos: rat(-1) },
];
/** Paires de bornes (indices dans `ANGLES_G1`) de G1. */
export const BORNES_G1: [number, number][] = [
  [0, 2],
  [0, 1],
  [0, 4],
  [2, 4],
  [0, 3],
  [1, 4],
];

/** Points x₀ de G2 (sinus exact). */
export const POINTS_G2: { l: string; sin: TermeExact[] }[] = [
  { l: "\\frac{\\pi}{6}", sin: [terme(rat(1, 2))] },
  { l: "\\frac{\\pi}{2}", sin: [terme(rat(1))] },
  { l: "\\frac{\\pi}{3}", sin: [terme(rat(1, 2), "\\sqrt{3}")] },
];

/** x₀ de L2 : −1, −e, −e² (|x₀| = e^p). */
export const POINTS_L2 = ["-1", "-e", "-e^{2}"];
const ABS_L2 = ["1", "e", "e^{2}"];

function cosArg(a: string): string {
  return a === "0" ? "\\cos(0)" : `\\cos\\left(${a}\\right)`;
}

/** Bornes et données de chaque support, utilisées par l'énoncé (ui) comme par la copie. */
export function bornesG1(e: ExerciceDetectiveIntegrales): { a: (typeof ANGLES_G1)[number]; b: (typeof ANGLES_G1)[number] } {
  const [i, j] = BORNES_G1[e.donnees.i!]!;
  return { a: ANGLES_G1[i]!, b: ANGLES_G1[j]! };
}

export function bornesL1(e: ExerciceDetectiveIntegrales): { bas: number; haut: number } {
  const { a, m } = e.donnees as { a: number; m: number };
  return { bas: -a * m, haut: -a };
}

/** f(x) en LaTeX (énoncé). */
export function fonctionLatex(e: ExerciceDetectiveIntegrales): string {
  const d = e.donnees;
  switch (e.scenario) {
    case "A1":
      return cc(d.c!, `\\cos(${d.k}x)`);
    case "A2":
      return `(${d.a}x + ${d.b})^{${d.n}}`;
    case "L1":
    case "L2":
      return `\\dfrac{${d.c}}{x}`;
    case "G1":
      return cc(d.c!, "\\sin(x)");
    case "G2":
      return cc(d.c!, "\\cos(x)");
    case "R1":
      return poly([[1, "x^2"], [-d.k! * d.k!, ""]]);
    case "R2":
      return cc(d.k!, "x");
    case "V1":
      return cc(d.k!, "x");
    case "V2":
      return `\\sqrt{${d.k}x}`;
    case "B1":
      return poly([[3, "x^2"], [d.p!, ""]]);
    case "C1":
      return poly([[3, "x^2"], [2 * d.b!, "x"]]);
    case "C2":
      return cc(2 * d.k!, "t");
  }
}

// ---------------------------------------------------------------------------------------------
// Copie, correction, valeurs attendues
// ---------------------------------------------------------------------------------------------

interface Resolution {
  copie: FragmentConsigne[][];
  correction: FragmentConsigne[][];
  valeurs: ValeurLigne[];
}

const nombre = (prefixe: FragmentConsigne[], termes: TermeExact[], unite?: string): ValeurLigne => ({ genre: "nombre", prefixe, termes, unite });

function resoudre(e: ExerciceDetectiveIntegrales): Resolution {
  const d = e.donnees;
  switch (e.scenario) {
    case "A1": {
      const { c, k } = d as { c: number; k: number };
      const B = `\\frac{\\pi}{${2 * k}}`;
      const I = `\\int_0^{${B}} f(x)\\,dx`;
      const ok = termesLatex([{ coef: rat(c, k), symbole: `\\sin(${k}x)` }]);
      const sinOk = (arg: string) => termesLatex([{ coef: rat(c, k), symbole: `\\sin${arg}` }]);
      return {
        copie: [
          [t("Une primitive de f est "), l(`F(x) = ${cc(c, `\\sin(${k}x)`)}`), t(".")],
          [l(`${I} = F\\left(${B}\\right) - F(0)`)],
          [l(`= ${cc(c, "\\sin\\left(\\frac{\\pi}{2}\\right)")} - ${cc(c, "\\sin(0)")}`)],
          [l(`= ${c}`)],
        ],
        correction: [
          [t("Une primitive de f est "), l(`F(x) = ${ok}`), t(", car la dérivée de "), l(`\\sin(${k}x)`), t(" vaut "), l(`${k}\\cos(${k}x)`), t(".")],
          [l(`${I} = F\\left(${B}\\right) - F(0) = ${sinOk("\\left(\\frac{\\pi}{2}\\right)")} - ${sinOk("(0)")}`)],
          [l(`${I} = ${ratLatex(rat(c, k))}`)],
        ],
        valeurs: [
          { genre: "fonction", quantite: "F(x)", latex: ok, variable: "x", f: (x) => (c / k) * Math.sin(k * x), points: [0.1, 0.35, 0.8, 1.3], aConstantePres: true, avecC: false },
          nombre([l(`${I} =`)], [terme(rat(c, k))]),
        ],
      };
    }
    case "A2": {
      const { a, b, n } = d as { a: number; b: number; n: number };
      const inner = `${a}x + ${b}`;
      const D = a * (n + 1);
      const num = (a + b) ** (n + 1) - b ** (n + 1);
      return {
        copie: [
          [l(`f(x) = (${inner})^{${n}}`), t(" est de la forme "), l("g(ax + b)"), t(" avec "), l(`g(u) = u^{${n}}`), t(" et "), l(`a = ${a}`), t(".")],
          [t("Une primitive de f est "), l(`F(x) = \\dfrac{(${inner})^{${n + 1}}}{${n + 1}}`), t(".")],
          [l(`\\int_0^1 f(x)\\,dx = F(1) - F(0) = \\dfrac{${a + b}^{${n + 1}}}{${n + 1}} - \\dfrac{${b}^{${n + 1}}}{${n + 1}}`)],
          [l(`= ${ratLatex(rat(num, n + 1))}`)],
        ],
        correction: [
          [t("Une primitive de f est "), l(`F(x) = \\dfrac{(${inner})^{${n + 1}}}{${D}}`), t(", car la dérivée de "), l(`(${inner})^{${n + 1}}`), t(" vaut "), l(`${D}(${inner})^{${n}}`), t(".")],
          [l(`\\int_0^1 f(x)\\,dx = F(1) - F(0) = \\dfrac{${a + b}^{${n + 1}}}{${D}} - \\dfrac{${b}^{${n + 1}}}{${D}}`)],
          [l(`= ${ratLatex(rat(num, D))}`)],
        ],
        valeurs: [
          { genre: "fonction", quantite: "F(x)", latex: `\\dfrac{(${inner})^{${n + 1}}}{${D}}`, variable: "x", f: (x) => (a * x + b) ** (n + 1) / D, points: [0, 0.3, 0.7, 1], aConstantePres: true, avecC: false },
          nombre([l("\\int_0^1 f(x)\\,dx =")], [terme(rat(num, D))]),
        ],
      };
    }
    case "L1": {
      const { c, a, m } = d as { c: number; a: number; m: number };
      const { bas, haut } = bornesL1(e);
      const I = `\\int_{${bas}}^{${haut}} f(x)\\,dx`;
      const resultat = [terme(rat(-c), `\\ln(${m})`)];
      const justification = a === 1 ? [t(", car "), l("\\ln(1) = 0"), t(".")] : [t(", car "), l(`\\ln(${a * m}) = \\ln(${a}) + \\ln(${m})`), t(".")];
      return {
        copie: [
          [t("Une primitive de f est "), l(`F(x) = ${cc(c, "\\ln(x)")}`), t(".")],
          [l(`${I} = F(${haut}) - F(${bas}) = ${cc(c, `\\ln(${haut})`)} - ${cc(c, `\\ln(${bas})`)}`)],
          [t("Or "), l(`\\ln(${haut})`), t(" et "), l(`\\ln(${bas})`), t(" n'existent pas : le logarithme n'est défini que pour un nombre strictement positif.")],
          [t("Conclusion : cette intégrale n'existe pas.")],
        ],
        correction: [
          [t("Une primitive de f est "), l(`F(x) = ${cc(c, "\\ln|x|")}`), t(", définie aussi pour "), l("x < 0"), t(".")],
          [l(`${I} = F(${haut}) - F(${bas}) = ${cc(c, `\\ln(${a})`)} - ${cc(c, `\\ln(${a * m})`)}`)],
          [l(`${I} = ${termesLatex(resultat)}`), ...justification],
        ],
        valeurs: [
          { genre: "fonction", quantite: "F(x)", latex: cc(c, "\\ln|x|"), variable: "x", f: (x) => c * Math.log(Math.abs(x)), points: [bas + 0.3, (bas + haut) / 2, haut - 0.2, bas + 0.9], aConstantePres: true, avecC: false },
          nombre([l(`${I} =`)], resultat),
        ],
      };
    }
    case "L2": {
      const { c, p, y } = d as { c: number; p: number; y: number };
      const x0 = POINTS_L2[p]!;
      const K = y - c * p;
      const finale = termesLatex([
        { coef: rat(c), symbole: "\\ln(-x)" },
        { coef: rat(K), symbole: "" },
      ]);
      return {
        copie: [
          [t("Primitive générale : "), l(`F(x) = ${cc(c, "\\ln(x)")} + C`), t(".")],
          [t("La condition donne "), l(`F(${x0}) = ${cc(c, `\\ln(${x0})`)} + C = ${y}`), t(".")],
          [t("Or "), l(`\\ln(${x0})`), t(" n'existe pas : cette équation n'a pas de sens.")],
          [t("Conclusion : aucune primitive de f ne vérifie "), l(`F(${x0}) = ${y}`), t(".")],
        ],
        correction: [
          [t("Sur "), l(INTERVALLE_NEGATIF), t(", "), l("|x| = -x"), t(" : "), l(`F(x) = ${cc(c, "\\ln|x|")} + C = ${cc(c, "\\ln(-x)")} + C`), t(".")],
          [t("La condition donne "), l(`F(${x0}) = ${cc(c, `\\ln(${ABS_L2[p]})`)} + C = ${c * p} + C = ${y}`), t(", donc "), l(`C = ${K}`), t(".")],
          [l(`F(x) = ${finale}`), t(" sur "), l(INTERVALLE_NEGATIF), t(".")],
        ],
        valeurs: [
          { genre: "fonction", quantite: "F(x)", latex: cc(c, "\\ln|x|"), variable: "x", f: (x) => c * Math.log(Math.abs(x)), points: [-0.4, -1.3, -2.5, -5], aConstantePres: true, avecC: true },
          { genre: "fonction", quantite: "F(x)", latex: finale, variable: "x", f: (x) => c * Math.log(-x) + K, points: [-0.4, -1.3, -2.5, -5], aConstantePres: false, avecC: false },
        ],
      };
    }
    case "G1": {
      const { c } = d as { c: number };
      const { a, b } = bornesG1(e);
      const I = `\\int_{${a.l}}^{${b.l}} f(x)\\,dx`;
      const copieV = foisR(rat(c), plusR(b.cos, oppR(a.cos)));
      const juste = oppR(copieV);
      return {
        copie: [
          [l(`${I} = ${c}\\int_{${a.l}}^{${b.l}} \\sin(x)\\,dx`)],
          [l(`= ${c}\\left[\\cos(x)\\right]_{${a.l}}^{${b.l}}`)],
          [l(`= ${c}\\left(${cosArg(b.l)} - ${cosArg(a.l)}\\right)`)],
          [l(`= ${c}\\left(${ratLatex(b.cos)} - ${parRat(a.cos)}\\right)`)],
          [l(`= ${ratLatex(copieV)}`)],
        ],
        correction: [
          [l(`= ${c}\\left[-\\cos(x)\\right]_{${a.l}}^{${b.l}}`)],
          [l(`= ${c}\\left(-${cosArg(b.l)} + ${cosArg(a.l)}\\right)`)],
          [l(`= ${c}\\left(${ratLatex(oppR(b.cos))} + ${parRat(a.cos)}\\right)`)],
          [l(`${I} = ${ratLatex(juste)}`)],
        ],
        valeurs: [
          { genre: "fonction", quantite: "\\int \\sin(x)\\,dx", latex: "-\\cos(x)", variable: "x", f: (x) => -Math.cos(x), points: [0.2, 0.9, 1.7, 2.6], aConstantePres: true, avecC: true },
          nombre([l(`${I} =`)], [terme(juste)]),
        ],
      };
    }
    case "G2": {
      const { c, j, y } = d as { c: number; j: number; y: number };
      const P = POINTS_G2[j]!;
      const cs = foisExact(P.sin, rat(c));
      const sinArg = `\\sin\\left(${P.l}\\right)`;
      const Ccopie = sommeExacte([terme(rat(y))], cs);
      const Cjuste = sommeExacte([terme(rat(y))], foisExact(cs, rat(-1)));
      const finale = termesLatex([{ coef: rat(c), symbole: "\\sin(x)" }, ...Cjuste]);
      const valK = valeurExacte(Cjuste);
      return {
        copie: [
          [t("Primitive générale : "), l(`F(x) = -${cc(c, "\\sin(x)")} + C`), t(".")],
          [l(`F\\left(${P.l}\\right) = -${cc(c, sinArg)} + C = ${termesLatex(foisExact(cs, rat(-1)))} + C`)],
          [t("La condition donne "), l(`${termesLatex(foisExact(cs, rat(-1)))} + C = ${y}`), t(", donc "), l(`C = ${termesLatex(Ccopie)}`), t(".")],
          [l(`F(x) = ${termesLatex([{ coef: rat(-c), symbole: "\\sin(x)" }, ...Ccopie])}`)],
        ],
        correction: [
          [t("Primitive générale : "), l(`F(x) = ${cc(c, "\\sin(x)")} + C`), t(".")],
          [l(`F\\left(${P.l}\\right) = ${cc(c, sinArg)} + C = ${termesLatex(cs)} + C`)],
          [t("La condition donne "), l(`${termesLatex(cs)} + C = ${y}`), t(", donc "), l(`C = ${termesLatex(Cjuste)}`), t(".")],
          [l(`F(x) = ${finale}`)],
        ],
        valeurs: [
          { genre: "fonction", quantite: "F(x)", latex: cc(c, "\\sin(x)"), variable: "x", f: (x) => c * Math.sin(x), points: [0.2, 0.9, 1.6, 2.8], aConstantePres: true, avecC: true },
          { genre: "fonction", quantite: "F(x)", latex: finale, variable: "x", f: (x) => c * Math.sin(x) + valK, points: [0.2, 0.9, 1.6, 2.8], aConstantePres: false, avecC: false },
        ],
      };
    }
    case "R1": {
      const { k, m } = d as { k: number; m: number };
      const k2 = k * k;
      const I = plusR(rat(m ** 3, 3), rat(-k2 * m));
      const A1 = rat(2 * k ** 3, 3);
      const A2 = plusR(I, A1);
      const A = plusR(A1, A2);
      return {
        copie: [
          [t("Une primitive de f est "), l(`F(x) = \\dfrac{x^3}{3} - ${cc(k2, "x")}`), t(".")],
          [t("Aire "), l(`= \\int_0^{${m}} \\left(${poly([[1, "x^2"], [-k2, ""]])}\\right)dx`), t(".")],
          [l(`= F(${m}) - F(0) = \\dfrac{${m ** 3}}{3} - ${k2 * m} = ${ratLatex(I)}`)],
          [t("L'aire vaut "), l(ratLatex(I)), t(" u.a.")],
        ],
        correction: [
          [t("f s'annule en "), l(`x = ${k}`), t(" : "), l("f(x) \\le 0"), t(" sur "), l(`[0;${k}]`), t(" et "), l("f(x) \\ge 0"), t(" sur "), l(`[${k};${m}]`), t(". Aire "), l(`= -\\int_0^{${k}} f(x)\\,dx + \\int_{${k}}^{${m}} f(x)\\,dx`), t(".")],
          [l(`-\\int_0^{${k}} f(x)\\,dx = -\\left(F(${k}) - F(0)\\right) = ${ratLatex(A1)}`), t(" et "), l(`\\int_{${k}}^{${m}} f(x)\\,dx = F(${m}) - F(${k}) = ${ratLatex(A2)}`), t(".")],
          [t("L'aire vaut "), l(`${ratLatex(A1)} + ${ratLatex(A2)} = ${ratLatex(A)}`), t(" u.a.")],
        ],
        valeurs: [nombre([t("aire =")], [terme(A)], "u.a.")],
      };
    }
    case "R2": {
      const { k, m } = d as { k: number; m: number };
      const kx = cc(k, "x");
      const Vc = plusR(rat(k * m * m, 2), rat(-(m ** 3), 3));
      const A1 = rat(k ** 3, 6);
      const A2 = plusR(plusR(rat(m ** 3, 3), rat(-k * m * m, 2)), rat(k ** 3, 6));
      const A = plusR(A1, A2);
      return {
        copie: [
          [l(`x^2 = ${kx}`), t(" donne "), l("x = 0"), t(" ou "), l(`x = ${k}`), t(".")],
          [t("Sur "), l(`[0;${m}]`), t(", aire "), l(`= \\int_0^{${m}} \\left(${kx} - x^2\\right)dx`), t(".")],
          [l(`= \\left[\\dfrac{${cc(k, "x^2")}}{2} - \\dfrac{x^3}{3}\\right]_0^{${m}} = ${ratLatex(rat(k * m * m, 2))} - ${ratLatex(rat(m ** 3, 3))} = ${ratLatex(Vc)}`)],
          [t("L'aire vaut "), l(ratLatex(Vc)), t(" u.a.")],
        ],
        correction: [
          [t("Les courbes se croisent en "), l(`x = ${k}`), t(", à l'intérieur de "), l(`[0;${m}]`), t(" : "), l(`${kx} \\ge x^2`), t(" sur "), l(`[0;${k}]`), t(" et "), l(`x^2 \\ge ${kx}`), t(" sur "), l(`[${k};${m}]`), t(".")],
          [t("Aire "), l(`= \\int_0^{${k}} \\left(${kx} - x^2\\right)dx + \\int_{${k}}^{${m}} \\left(x^2 - ${kx}\\right)dx = ${ratLatex(A1)} + ${ratLatex(A2)}`), t(".")],
          [t("L'aire vaut "), l(ratLatex(A)), t(" u.a.")],
        ],
        valeurs: [nombre([t("aire =")], [terme(A)], "u.a.")],
      };
    }
    case "V1": {
      const { k, h } = d as { k: number; h: number };
      const fx = cc(k, "x");
      const k2x2 = cc(k * k, "x^2");
      const carre = k === 1 ? "x^2" : `(${k}x)^2 = ${k2x2}`;
      const Vcopie = [terme(rat(k * h * h, 2), "\\pi")];
      const V = [terme(rat(k * k * h ** 3, 3), "\\pi")];
      return {
        copie: [
          [l(`V = \\pi\\int_0^{${h}} [f(x)]^2\\,dx`)],
          [l(`= \\pi\\int_0^{${h}} ${fx}\\,dx`)],
          [l(`= \\pi\\left[\\dfrac{${cc(k, "x^2")}}{2}\\right]_0^{${h}}`)],
          [l(`V = ${termesLatex(Vcopie)}`), t(" u.v.")],
        ],
        correction: [
          [l(`= \\pi\\int_0^{${h}} ${k2x2}\\,dx`), t(", car "), l(`[f(x)]^2 = ${carre}`), t(".")],
          [l(`= \\pi\\left[\\dfrac{${cc(k * k, "x^3")}}{3}\\right]_0^{${h}}`)],
          [l(`V = ${termesLatex(V)}`), t(" u.v.")],
        ],
        valeurs: [
          { genre: "fonction", quantite: "[f(x)]^2", latex: k2x2, variable: "x", f: (x) => k * k * x * x, points: [0.5, 1, 1.8, 2.6], aConstantePres: false, avecC: false },
          nombre([l("V =")], V, "u.v."),
        ],
      };
    }
    case "V2": {
      const { k, h } = d as { k: number; h: number };
      const q = rat(k * h * h, 2);
      const V = [terme(q, "\\pi")];
      return {
        copie: [
          [l(`[f(x)]^2 = \\left(\\sqrt{${k}x}\\right)^2 = ${k}x`)],
          [l(`V = \\int_0^{${h}} ${k}x\\,dx`)],
          [l(`= \\left[\\dfrac{${k}x^2}{2}\\right]_0^{${h}} = ${ratLatex(q)}`)],
          [l(`V = ${ratLatex(q)}`), t(" u.v.")],
        ],
        correction: [
          [l(`V = \\pi\\int_0^{${h}} ${k}x\\,dx`)],
          [l(`= \\pi\\left[\\dfrac{${k}x^2}{2}\\right]_0^{${h}} = \\pi\\cdot ${ratLatex(q)}`)],
          [l(`V = ${termesLatex(V)}`), t(" u.v.")],
        ],
        valeurs: [nombre([l("V =")], V, "u.v.")],
      };
    }
    case "B1": {
      const { p, a, b } = d as { p: number; a: number; b: number };
      const Fa = a ** 3 + p * a;
      const Fb = b ** 3 + p * b;
      const I = Fb - Fa;
      const integrale = `\\int_{${a}}^{${b}} f(x)\\,dx`;
      return {
        copie: [
          [t("Une primitive de f est "), l(`F(x) = ${poly([[1, "x^3"], [p, "x"]])}`), t(".")],
          [l(`${integrale} = F(${a}) - F(${b}) = ${Fa} - ${Fb} = ${-I}`)],
          [t("Valeur moyenne : "), l(`\\dfrac{1}{${b} - ${a}}${integrale} = \\dfrac{${-I}}{${b - a}} = ${ratLatex(rat(-I, b - a))}`)],
        ],
        correction: [
          [l(`${integrale} = F(${b}) - F(${a}) = ${Fb} - ${Fa} = ${I}`)],
          [t("Valeur moyenne : "), l(`\\dfrac{1}{${b} - ${a}}${integrale} = \\dfrac{${I}}{${b - a}} = ${ratLatex(rat(I, b - a))}`)],
        ],
        valeurs: [nombre([l(`${integrale} =`)], [terme(rat(I))]), nombre([t("valeur moyenne =")], [terme(rat(I, b - a))])],
      };
    }
    case "C1": {
      const { b, x, y } = d as { b: number; x: number; y: number };
      const v = x ** 3 + b * x * x;
      const Fpoly = poly([[1, "x^3"], [b, "x^2"]]);
      const facteur = Math.abs(b) === 1 ? "" : `${Math.abs(b)}\\cdot `;
      const calcul = `${parN(x)}^3 ${b > 0 ? "+" : "-"} ${facteur}${parN(x)}^2`;
      const finale = poly([[1, "x^3"], [b, "x^2"], [y - v, ""]]);
      return {
        copie: [
          [t("Primitive générale : "), l(`F(x) = ${Fpoly} + C`), t(".")],
          [l(`F(${x}) = ${calcul} + C = ${v} + C`)],
          [t("La condition donne "), l(`${v} + C = ${y}`), t(", donc "), l(`C = ${y} + ${parN(v)} = ${y + v}`), t(".")],
          [l(`F(x) = ${poly([[1, "x^3"], [b, "x^2"], [y + v, ""]])}`)],
        ],
        correction: [
          [t("La condition donne "), l(`${v} + C = ${y}`), t(", donc "), l(`C = ${y} - ${parN(v)} = ${y - v}`), t(".")],
          [l(`F(x) = ${finale}`)],
        ],
        valeurs: [
          nombre([l("C =")], [terme(rat(y - v))]),
          { genre: "fonction", quantite: "F(x)", latex: finale, variable: "x", f: (z) => z ** 3 + b * z * z + y - v, points: [-1.5, -0.4, 0.7, 1.9], aConstantePres: false, avecC: false },
        ],
      };
    }
    case "C2": {
      const { k, v, T } = d as { k: number; v: number; T: number };
      const kt2 = cc(k, "t^2");
      const facteur = k === 1 ? "" : `${k}\\cdot `;
      return {
        copie: [
          [t("La vitesse est une primitive de l'accélération : "), l(`v(t) = ${kt2}`), t(".")],
          [l(`v(${T}) = ${facteur}${T}^2 = ${k * T * T}`)],
          [t(`Après ${T} s, la vitesse vaut `), l(`${k * T * T}`), t(" m/s.")],
        ],
        correction: [
          [t("La vitesse est une primitive de l'accélération : "), l(`v(t) = ${kt2} + C`), t(" ; comme "), l(`v(0) = C = ${v}`), t(", "), l(`v(t) = ${kt2} + ${v}`), t(".")],
          [l(`v(${T}) = ${facteur}${T}^2 + ${v} = ${k * T * T + v}`)],
          [t(`Après ${T} s, la vitesse vaut `), l(`${k * T * T + v}`), t(" m/s.")],
        ],
        valeurs: [
          { genre: "fonction", quantite: "v(t)", latex: `${kt2} + ${v}`, variable: "t", f: (z) => k * z * z + v, points: [0.5, 1.2, 2, 3.4], aConstantePres: false, avecC: false },
          nombre([l(`v(${T}) =`)], [terme(rat(k * T * T + v))], "m/s"),
        ],
      };
    }
  }
}

export function copieEleve(e: ExerciceDetectiveIntegrales): FragmentConsigne[][] {
  return resoudre(e).copie;
}

/** Résolution juste à partir de la ligne fausse (la première ligne est la ligne corrigée). */
export function correction(e: ExerciceDetectiveIntegrales): FragmentConsigne[][] {
  return resoudre(e).correction;
}

export function valeursAttendues(e: ExerciceDetectiveIntegrales): ValeurLigne[] {
  return resoudre(e).valeurs;
}

/** Une valeur exacte en LaTeX. */
export function latexValeur(v: ValeurLigne): string {
  return v.genre === "nombre" ? termesLatex(v.termes) : v.latex;
}
