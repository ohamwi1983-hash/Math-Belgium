import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

/**
 * Lecture EXACTE des saisies des générateurs 6gen105–6gen109 (6e ch. 7, lot H de l'audit) — jamais
 * de blocage de frappe : la saisie est lue telle quelle, `null` = illisible (l'écran le dit, AUCUNE
 * tentative consommée). Calcul en rationnels exacts (`bigint`), si bien qu'un dénombrement de 6 ou
 * 12 chiffres est comparé sans arrondi. Écritures admises (notation du cours ET de la calculatrice) :
 * - entiers, décimaux à virgule ou à point, espaces de milliers (« 34 650 », espace fine ou insécable) ;
 * - « + », « − – — - », « × · ⋅ * », « x » entre deux nombres, « / ÷ : », « ^ », exposants « ² ³… »,
 *   parenthèses et crochets, multiplication implicite (« 3(4+1) », « 2k ») ;
 * - factorielle « n! », « (n−1)! » ;
 * - combinaisons : « C(10,3) », « C(10;3) », « C_10^3 », « C_{10}^{3} », « C10^3 », « binom(10,3) »,
 *   « \binom{10}{3} », « 10C3 », « 10nCr3 » ; arrangements : « A(10,3) », « A_10^3 », « 10P3 »,
 *   « 10nPr3 » ; permutations « P_5 » (= 5!) ;
 * - préfixe « N = », « P = », « P(X = 2) = », « k = » (on garde ce qui suit le dernier « = ») ;
 * - pourcentage final « % ».
 * Variables (`k`…) seulement si elles sont fournies : 6gen107 lit l'exposant de x comme une
 * expression en k.
 */

export interface Rat {
  n: bigint;
  d: bigint;
}

const ZERO: Rat = { n: 0n, d: 1n };
const abs = (a: bigint) => (a < 0n ? -a : a);
function pgcdB(a: bigint, b: bigint): bigint {
  a = abs(a);
  b = abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1n;
}
export function rat(n: bigint | number, d: bigint | number = 1n): Rat {
  let N = typeof n === "bigint" ? n : BigInt(n);
  let D = typeof d === "bigint" ? d : BigInt(d);
  if (D === 0n) throw new Error("division par zéro");
  if (D < 0n) {
    N = -N;
    D = -D;
  }
  const g = pgcdB(N, D);
  return { n: N / g, d: D / g };
}
const add = (a: Rat, b: Rat) => rat(a.n * b.d + b.n * a.d, a.d * b.d);
const sub = (a: Rat, b: Rat) => rat(a.n * b.d - b.n * a.d, a.d * b.d);
const mul = (a: Rat, b: Rat) => rat(a.n * b.n, a.d * b.d);
const div = (a: Rat, b: Rat) => rat(a.n * b.d, a.d * b.n);
const estEntier = (a: Rat) => a.d === 1n;
export const ratVal = (a: Rat): number => Number(a.n) / Number(a.d);
export const ratEgal = (a: Rat, b: Rat): boolean => a.n === b.n && a.d === b.d;

const LIMITE_FACT = 60n;
const LIMITE_EXP = 200n;

function fact(a: Rat): Rat {
  if (!estEntier(a) || a.n < 0n || a.n > LIMITE_FACT) throw new Error("factorielle");
  let r = 1n;
  for (let i = 2n; i <= a.n; i++) r *= i;
  return rat(r);
}
function combi(n: Rat, k: Rat): Rat {
  if (!estEntier(n) || !estEntier(k) || n.n < 0n || n.n > 400n) throw new Error("C");
  if (k.n < 0n || k.n > n.n) return ZERO;
  let r = 1n;
  const kk = k.n < n.n - k.n ? k.n : n.n - k.n;
  for (let i = 1n; i <= kk; i++) r = (r * (n.n - kk + i)) / i;
  return rat(r);
}
function arrang(n: Rat, k: Rat): Rat {
  if (!estEntier(n) || !estEntier(k) || n.n < 0n || n.n > 400n) throw new Error("A");
  if (k.n < 0n || k.n > n.n) return ZERO;
  let r = 1n;
  for (let i = 0n; i < k.n; i++) r *= n.n - i;
  return rat(r);
}
function puissance(a: Rat, e: Rat): Rat {
  if (!estEntier(e) || abs(e.n) > LIMITE_EXP) throw new Error("exposant");
  const neg = e.n < 0n;
  const m = neg ? -e.n : e.n;
  if (a.n === 0n && neg) throw new Error("0^-n");
  if (abs(a.n) > 10n ** 12n && m > 20n) throw new Error("trop grand");
  let r = rat(a.n ** m, a.d ** m);
  if (neg) r = div(rat(1n), r);
  return r;
}

// ---------------------------------------------------------------------------------------------
// Préparation du texte
// ---------------------------------------------------------------------------------------------

const EXPOSANTS: Record<string, string> = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁻": "-" };

function preparer(brut: string, xMultiplie: boolean): string {
  let s = normaliserSigneMoins(brut)
    .replace(/[    ]/g, " ")
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+/g, (m) => `^(${[...m].map((c) => EXPOSANTS[c]).join("")})`)
    .replace(/\\left|\\right/g, "")
    .replace(/\\(dfrac|tfrac|frac)\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, "(($2)/($3))")
    .replace(/\\binom\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, "C[$1|$2]")
    .replace(/\\(times|cdot)/g, "*")
    .replace(/[×·⋅∙•]/g, "*")
    .replace(/[÷:]/g, "/")
    .replace(/\[/g, "(")
    .replace(/\]/g, ")")
    .replace(/[{}]/g, (c) => (c === "{" ? "(" : ")"))
    .trim();
  // Préfixe « N = », « P(X = 2) = » : ce qui suit le dernier « = ».
  const i = s.lastIndexOf("=");
  if (i >= 0) {
    const gauche = s.slice(0, i).trim();
    if (gauche === "") return "";
    s = s.slice(i + 1).trim();
  }
  // Espaces de milliers : « 34 650 », « 1 234 567 » (groupes de trois chiffres exactement).
  s = s.replace(/\d{1,3}(?: \d{3})+(?![\d,.])/g, (m) => m.replace(/ /g, ""));
  // Calculatrice : « 10C3 », « 10 nCr 3 », « 10P3 », « 10nPr3 ».
  s = s.replace(/(\d+)\s*(nCr|nPr|C|P)\s*(\d+)/g, (_m, a: string, op: string, b: string) => (op === "C" || op === "nCr" ? `C(${a}|${b})` : `A(${a}|${b})`));
  s = separerArguments(s);
  // « x » de multiplication entre deux nombres / parenthèses (« 120 x 4 », « 3x(4+1) »).
  if (xMultiplie) s = s.replace(/([\d)!])\s*[xX]\s*(?=[\d(CAP])/g, "$1*");
  // Deux nombres séparés par une espace (« 3 4 ») : illisible, jamais un produit deviné.
  if (/\d\s+[\d.,]/.test(s)) return "";
  return s;
}

/** Dans « C(10,3) », « A(7;2) », « binom(10,3) », la PREMIÈRE virgule (ou « ; ») au niveau des
 * parenthèses de la fonction sépare les deux arguments (sinon « 10,3 » serait lu comme un décimal). */
function separerArguments(s: string): string {
  const r = [...s];
  const re = /(binom|C|A)\s*\(/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    let prof = 0;
    for (let i = m.index + m[0].length - 1; i < r.length; i++) {
      const c = r[i];
      if (c === "(") prof++;
      else if (c === ")") {
        prof--;
        if (prof === 0) break;
      } else if (prof === 1 && (c === "," || c === ";" || c === "|")) {
        r[i] = "|";
        break;
      }
    }
  }
  return r.join("");
}

// ---------------------------------------------------------------------------------------------
// Analyse
// ---------------------------------------------------------------------------------------------

type Jeton = { t: "nb"; v: Rat } | { t: "op"; v: string } | { t: "id"; v: string } | { t: "sep" };

function jetons(s: string): Jeton[] | null {
  const r: Jeton[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i]!;
    if (c === " ") {
      i++;
      continue;
    }
    if (/\d/.test(c) || ((c === "," || c === ".") && /\d/.test(s[i + 1] ?? ""))) {
      const m = /^(\d*)(?:[.,](\d+))?/.exec(s.slice(i))!;
      const ent = m[1] || "0";
      const dec = m[2] ?? "";
      r.push({ t: "nb", v: rat(BigInt(ent + dec), 10n ** BigInt(dec.length)) });
      i += m[0].length;
      continue;
    }
    if ("+-*/^()!_%".includes(c)) {
      r.push({ t: "op", v: c });
      i++;
      continue;
    }
    if (c === "|" || c === ";") {
      r.push({ t: "sep" });
      i++;
      continue;
    }
    if (/[a-zA-Z]/.test(c)) {
      const m = /^(binom|nCr|nPr|[a-zA-Z])/.exec(s.slice(i))!;
      r.push({ t: "id", v: m[1]! });
      i += m[1]!.length;
      continue;
    }
    return null;
  }
  return r;
}

class Analyseur {
  private i = 0;
  private readonly j: Jeton[];
  private readonly vars: Record<string, Rat>;
  constructor(j: Jeton[], vars: Record<string, Rat>) {
    this.j = j;
    this.vars = vars;
  }
  fini() {
    return this.i >= this.j.length;
  }
  private voir(): Jeton | undefined {
    return this.j[this.i];
  }
  private estOp(v: string): boolean {
    const x = this.voir();
    return !!x && x.t === "op" && x.v === v;
  }
  private attendre(v: string) {
    if (!this.estOp(v)) throw new Error(`« ${v} » attendu`);
    this.i++;
  }
  expr(): Rat {
    let a = this.terme();
    for (;;) {
      if (this.estOp("+")) {
        this.i++;
        a = add(a, this.terme());
      } else if (this.estOp("-")) {
        this.i++;
        a = sub(a, this.terme());
      } else return a;
    }
  }
  private debutFacteur(): boolean {
    const x = this.voir();
    if (!x) return false;
    if (x.t === "nb" || x.t === "id") return true;
    return x.t === "op" && x.v === "(";
  }
  private terme(): Rat {
    let a = this.unaire();
    for (;;) {
      if (this.estOp("*")) {
        this.i++;
        a = mul(a, this.unaire());
      } else if (this.estOp("/")) {
        this.i++;
        a = div(a, this.unaire());
      } else if (this.debutFacteur()) {
        a = mul(a, this.unaire());
      } else return a;
    }
  }
  private unaire(): Rat {
    if (this.estOp("-")) {
      this.i++;
      return sub(ZERO, this.unaire());
    }
    if (this.estOp("+")) {
      this.i++;
      return this.unaire();
    }
    return this.puissance();
  }
  private puissance(): Rat {
    const b = this.postfixe();
    if (this.estOp("^")) {
      this.i++;
      return puissance(b, this.unaire());
    }
    return b;
  }
  private postfixe(): Rat {
    let a = this.primaire();
    for (;;) {
      if (this.estOp("!")) {
        this.i++;
        a = fact(a);
      } else if (this.estOp("%")) {
        this.i++;
        a = div(a, rat(100n));
      } else return a;
    }
  }
  /** Indice / exposant d'un « C_10^3 » : un nombre, une variable ou un groupe parenthésé. */
  private atome(): Rat {
    const x = this.voir();
    if (!x) throw new Error("atome");
    if (x.t === "nb") {
      this.i++;
      return x.v;
    }
    if (x.t === "id" && x.v in this.vars) {
      this.i++;
      return this.vars[x.v]!;
    }
    if (x.t === "op" && x.v === "(") {
      this.i++;
      const v = this.expr();
      this.attendre(")");
      return v;
    }
    throw new Error("atome");
  }
  private deuxArguments(): [Rat, Rat] {
    this.attendre("(");
    const a = this.expr();
    const x = this.voir();
    if (!x || x.t !== "sep") throw new Error("séparateur");
    this.i++;
    const b = this.expr();
    this.attendre(")");
    return [a, b];
  }
  private primaire(): Rat {
    const x = this.voir();
    if (!x) throw new Error("fin");
    if (x.t === "nb") {
      this.i++;
      return x.v;
    }
    if (x.t === "op" && x.v === "(") {
      this.i++;
      const v = this.expr();
      this.attendre(")");
      return v;
    }
    if (x.t === "id") {
      const nom = x.v;
      if (nom in this.vars) {
        this.i++;
        return this.vars[nom]!;
      }
      if (nom === "C" || nom === "A" || nom === "binom") {
        this.i++;
        const f = nom === "A" ? arrang : combi;
        if (this.estOp("(")) {
          const [a, b] = this.deuxArguments();
          return f(a, b);
        }
        // C_10^3, C_{10}^{3}, C10^3 (indice puis exposant), C^3_10 (exposant puis indice).
        let n: Rat | null = null;
        let k: Rat | null = null;
        for (let tour = 0; tour < 2; tour++) {
          if (this.estOp("_")) {
            this.i++;
            n = this.atome();
          } else if (this.estOp("^")) {
            this.i++;
            k = this.atome();
          } else if (n === null && this.voir()?.t === "nb") n = this.atome();
        }
        if (n === null || k === null) throw new Error("C incomplet");
        return f(n, k);
      }
      if (nom === "P") {
        this.i++;
        if (this.estOp("_")) this.i++;
        return fact(this.atome());
      }
    }
    throw new Error("inattendu");
  }
}

export interface OptionsLecture {
  /** Variables admises (« k » de 6gen107) et leur valeur. */
  variables?: Record<string, Rat>;
  /** « x » entre deux nombres lu comme × (défaut : oui). */
  xMultiplie?: boolean;
}

/** Valeur exacte d'une saisie, `null` si elle est illisible. */
export function lireRationnel(brut: string, options: OptionsLecture = {}): Rat | null {
  const s = preparer(brut, options.xMultiplie ?? true);
  if (s === "") return null;
  const j = jetons(s);
  if (!j || j.length === 0) return null;
  try {
    const a = new Analyseur(j, options.variables ?? {});
    const v = a.expr();
    if (!a.fini()) return null;
    return v;
  } catch {
    return null;
  }
}

/** Valeur numérique d'une saisie (`null` si illisible). */
export function lireNombre(brut: string): number | null {
  const r = lireRationnel(brut);
  return r === null ? null : ratVal(r);
}

/** La saisie est-elle un nombre décimal ÉCRIT (« 0,3087 », « 12.5 ») ? Renvoie son nombre de décimales. */
export function decimalesEcrites(brut: string): number | null {
  let s = normaliserSigneMoins(brut).trim();
  const i = s.lastIndexOf("=");
  if (i >= 0) s = s.slice(i + 1).trim();
  s = s.replace(/\s/g, "").replace(/%$/, "");
  const m = /^-?\d*[.,](\d+)$/.exec(s);
  return m ? m[1]!.length : null;
}

/** Réponse « aucun » (aucun terme, aucune valeur) : « aucun », « aucune », « pas de … », « ∅ », « impossible ». */
export function estAucun(brut: string): boolean {
  const s = brut.trim().toLowerCase();
  return /^(aucun|aucune|il n'y en a pas|il n’y en a pas|pas de|n'existe pas|n’existe pas|impossible|∅|ø|\{\s*\})/.test(s);
}

/** Expression en une variable (« 18 − 3k ») égale à la fonction affine attendue a + b·var ? */
export function statutExpressionAffine(brut: string, variable: string, a: number, b: number): "correct" | "not_equivalent" | "parse_error" {
  const vals = [0, 1, 2, 5, 7];
  let lisible = false;
  let juste = true;
  for (const v of vals) {
    const r = lireRationnel(brut, { variables: { [variable]: rat(BigInt(v)) }, xMultiplie: false });
    if (r === null) return "parse_error";
    lisible = true;
    if (!ratEgal(r, rat(BigInt(a + b * v)))) juste = false;
  }
  if (!lisible) return "parse_error";
  // Une constante (sans la variable) ne peut pas être juste puisque b ≠ 0 : jugée par les valeurs.
  return juste ? "correct" : "not_equivalent";
}

/** Valeurs d'une expression en une variable aux points 0 et 1 (`null` si illisible) — messages ciblés. */
export function affineLue(brut: string, variable: string): { a: number; b: number } | null {
  const r0 = lireRationnel(brut, { variables: { [variable]: rat(0n) }, xMultiplie: false });
  const r1 = lireRationnel(brut, { variables: { [variable]: rat(1n) }, xMultiplie: false });
  const r2 = lireRationnel(brut, { variables: { [variable]: rat(2n) }, xMultiplie: false });
  if (!r0 || !r1 || !r2) return null;
  const a = ratVal(r0);
  const b = ratVal(r1) - a;
  if (Math.abs(ratVal(r2) - (a + 2 * b)) > 1e-9) return null;
  return { a, b };
}
