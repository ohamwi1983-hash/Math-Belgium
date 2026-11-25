import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { evaluerExpressionExponentielle } from "./expressionExponentielle";

/**
 * Lecture des saisies des générateurs 6gen100–6gen104 (6e ch. 7, lot H de l'audit) — jamais de
 * blocage de frappe : la saisie est lue telle quelle, `null` = illisible (l'écran le dit, AUCUNE
 * tentative consommée). Évaluateur EXACT (rationnels BigInt), pour que l'élève puisse écrire la
 * réponse sous forme factorisée au lieu de recopier un grand nombre (audit : « jamais un nombre géant
 * à saisir ») :
 * - entiers (espaces de milliers « 34 650 », espace insécable compris), « + − × · * / : ÷ ^ »,
 *   parenthèses, multiplication implicite (« 2(5!) », « 3·4 »), « x » entre deux nombres ;
 * - factorielle postfixée « 5! », « (n−k)! » déjà évaluée ;
 * - Cₙᵏ et Aₙᵏ sous toutes les écritures courantes : « C(10;3) », « C(10,3) », « C_10^3 »,
 *   « C_{10}^{3} », « C₁₀³ », touches de la calculatrice « 10C3 », « 10P3 » ; Γ : « Γ(5;3) », « G(5;3) » ;
 * - exposants Unicode « 2⁵ », « 4² » ;
 * - préfixe « N = », « n = », « x = » et unité de comptage finale (« mots », « façons »…) ignorés.
 * Les nombres trop grands (exposant ou factorielle au-delà de 200) sont refusés comme illisibles.
 */

type Rationnel = { num: bigint; den: bigint };

const pgcd = (a: bigint, b: bigint): bigint => {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b !== 0n) [a, b] = [b, a % b];
  return a === 0n ? 1n : a;
};
const red = ({ num, den }: Rationnel): Rationnel => {
  if (den < 0n) [num, den] = [-num, -den];
  const g = pgcd(num, den);
  return { num: num / g, den: den / g };
};
const ent = (n: bigint): Rationnel => ({ num: n, den: 1n });

function fact(n: bigint): bigint {
  if (n < 0n || n > 200n) throw new Error("factorielle hors domaine");
  let r = 1n;
  for (let i = 2n; i <= n; i++) r *= i;
  return r;
}
function comb(n: bigint, k: bigint): bigint {
  if (n < 0n || n > 400n) throw new Error("C hors domaine");
  if (k < 0n || k > n) return 0n;
  const kk = k < n - k ? k : n - k;
  let r = 1n;
  for (let i = 0n; i < kk; i++) r = (r * (n - i)) / (i + 1n);
  return r;
}
function arr(n: bigint, k: bigint): bigint {
  if (n < 0n || n > 400n) throw new Error("A hors domaine");
  if (k < 0n || k > n) return 0n;
  let r = 1n;
  for (let i = 0n; i < k; i++) r *= n - i;
  return r;
}

const SUP: Record<string, string> = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9" };
const SUB: Record<string, string> = { "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9" };
const versChiffres = (s: string, table: Record<string, string>) => [...s].map((c) => table[c] ?? c).join("");

const UNITE_FINALE = /\s*(mots?|façons?|manières?|possibilités?|répartitions?|solutions?|anagrammes?|codes?|dispositions?|choix|groupes?|cornets?|parties|sous-ensembles?|menus?|tirages?|comités?|bureaux?|podiums?)\s*$/i;

/** Normalisation commune (signes, produits, Cₙᵏ écrits de diverses façons, milliers). */
export function normaliserCombinatoire(brut: string): string {
  let s = normaliserSigneMoins(brut).replace(/[’`]/g, "'").trim();
  s = s.replace(/^\s*[A-Za-zΓ]{1,2}(_?\{?\d*\}?)?\s*=\s*/, "");
  s = s.replace(UNITE_FINALE, "").trim();
  s = s.replace(/[·×⋅∙]/g, "*").replace(/[÷:]/g, "/");
  // Milliers : « 34 650 », « 1 234 567 » (espace normale, insécable ou fine).
  for (let i = 0; i < 3; i++) s = s.replace(/(\d)[\s  ](?=\d{3}(?!\d))/g, "$1");
  s = s.replace(/Γ/g, "G");
  // C₁₀³, A₈³ (indices et exposants Unicode).
  s = s.replace(/([CAG])\s*([₀-₉]+)\s*([⁰-⁹¹²³]+)/g, (_m, f: string, a: string, b: string) => `${f}(${versChiffres(a, SUB)},${versChiffres(b, SUP)})`);
  // C_10^3, C_{10}^{3}, C^3_10.
  s = s.replace(/([CAG])\s*_\s*\{?\s*(\d+)\s*\}?\s*\^\s*\{?\s*(\d+)\s*\}?/g, "$1($2,$3)");
  s = s.replace(/([CAG])\s*\^\s*\{?\s*(\d+)\s*\}?\s*_\s*\{?\s*(\d+)\s*\}?/g, "$1($3,$2)");
  // Touches de calculatrice : 10C3, 10P3.
  s = s.replace(/(\d+)\s*[Cc]\s*(\d+)/g, "C($1,$2)").replace(/(\d+)\s*[P]\s*(\d+)/g, "A($1,$2)");
  // Exposants Unicode restants (¹ ² ³ sont hors du bloc ⁰–⁹).
  s = s.replace(/([⁰-⁹¹²³]+)/g, (_m, e: string) => `^${versChiffres(e, SUP)}`);
  // « x » entre deux nombres = multiplication.
  s = s.replace(/(\d|\)|!)\s*[xX]\s*(?=[\d(])/g, "$1*");
  return s.replace(/;/g, ",").trim();
}

type Jeton = { t: "n"; v: bigint } | { t: "f"; nom: string } | { t: "op"; v: string };

function jetons(s: string): Jeton[] {
  const out: Jeton[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i]!;
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    if (/\d/.test(c)) {
      let j = i;
      while (j < s.length && /\d/.test(s[j]!)) j++;
      if (s[j] === "," && /\d/.test(s[j + 1] ?? "") && !/\(/.test(s.slice(0, i))) throw new Error("décimal");
      out.push({ t: "n", v: BigInt(s.slice(i, j)) });
      i = j;
      continue;
    }
    if (/[CAG]/.test(c) && s.slice(i + 1).trimStart().startsWith("(")) {
      out.push({ t: "f", nom: c });
      i++;
      continue;
    }
    if ("+-*/^!(),".includes(c)) {
      out.push({ t: "op", v: c });
      i++;
      continue;
    }
    throw new Error(`caractère ${c}`);
  }
  return out;
}

class Analyseur {
  private p = 0;
  private readonly j: Jeton[];
  constructor(j: Jeton[]) {
    this.j = j;
  }
  private voir(): Jeton | undefined {
    return this.j[this.p];
  }
  private estOp(v: string): boolean {
    const x = this.voir();
    return !!x && x.t === "op" && x.v === v;
  }
  private attendre(v: string) {
    if (!this.estOp(v)) throw new Error(`« ${v} » attendu`);
    this.p++;
  }
  fin(): boolean {
    return this.p >= this.j.length;
  }
  expr(): Rationnel {
    let a = this.terme();
    while (this.estOp("+") || this.estOp("-")) {
      const op = (this.j[this.p++] as { v: string }).v;
      const b = this.terme();
      a = red({ num: op === "+" ? a.num * b.den + b.num * a.den : a.num * b.den - b.num * a.den, den: a.den * b.den });
    }
    return a;
  }
  /** Multiplication implicite : « 2(…) », « 3C(5;2) », « (…)(…) », « 5!4! » — jamais deux nombres
   * séparés par une espace (« 12 34 » est illisible, pas 408). */
  private debutFacteur(): boolean {
    const x = this.voir();
    if (!x) return false;
    if (x.t === "f" || (x.t === "op" && x.v === "(")) return true;
    const prec = this.j[this.p - 1];
    return x.t === "n" && !!prec && prec.t === "op" && (prec.v === ")" || prec.v === "!");
  }
  private terme(): Rationnel {
    let a = this.unaire();
    for (;;) {
      if (this.estOp("*") || this.estOp("/")) {
        const op = (this.j[this.p++] as { v: string }).v;
        const b = this.unaire();
        if (op === "/" && b.num === 0n) throw new Error("division par 0");
        a = red(op === "*" ? { num: a.num * b.num, den: a.den * b.den } : { num: a.num * b.den, den: a.den * b.num });
      } else if (this.debutFacteur()) {
        const b = this.unaire();
        a = red({ num: a.num * b.num, den: a.den * b.den });
      } else return a;
    }
  }
  private unaire(): Rationnel {
    if (this.estOp("-")) {
      this.p++;
      const a = this.unaire();
      return { num: -a.num, den: a.den };
    }
    if (this.estOp("+")) {
      this.p++;
      return this.unaire();
    }
    return this.puissance();
  }
  private puissance(): Rationnel {
    const base = this.postfixe();
    if (this.estOp("^")) {
      this.p++;
      const e = this.unaire();
      if (e.den !== 1n || e.num < 0n || e.num > 200n) throw new Error("exposant");
      return red({ num: base.num ** e.num, den: base.den ** e.num });
    }
    return base;
  }
  private postfixe(): Rationnel {
    let a = this.atome();
    while (this.estOp("!")) {
      this.p++;
      if (a.den !== 1n) throw new Error("factorielle d'un non-entier");
      a = ent(fact(a.num));
    }
    return a;
  }
  private atome(): Rationnel {
    const x = this.voir();
    if (!x) throw new Error("fin inattendue");
    if (x.t === "n") {
      this.p++;
      return ent(x.v);
    }
    if (x.t === "f") {
      this.p++;
      this.attendre("(");
      const a = this.expr();
      this.attendre(",");
      const b = this.expr();
      this.attendre(")");
      if (a.den !== 1n || b.den !== 1n) throw new Error("arguments entiers");
      if (x.nom === "C") return ent(comb(a.num, b.num));
      if (x.nom === "A") return ent(arr(a.num, b.num));
      return ent(comb(a.num + b.num - 1n, b.num));
    }
    if (x.v === "(") {
      this.p++;
      const a = this.expr();
      this.attendre(")");
      return a;
    }
    throw new Error("atome attendu");
  }
}

/** Valeur exacte d'une saisie (rationnel), `null` si illisible. */
export function lireExact(brut: string): Rationnel | null {
  // « C_8^3 = 8!/(3!·5!) = 56 » : chaque membre est lu, la valeur retenue est celle du dernier.
  const membres = brut.split("=");
  if (membres.length > 1) {
    const derniers = membres.slice(1);
    let v: Rationnel | null = null;
    for (const m of derniers) {
      v = lireUnMembre(m);
      if (!v) return null;
    }
    return v;
  }
  return lireUnMembre(brut);
}

function lireUnMembre(brut: string): Rationnel | null {
  const s = normaliserCombinatoire(brut);
  if (s === "") return null;
  try {
    const a = new Analyseur(jetons(s));
    const v = a.expr();
    if (!a.fin()) return null;
    return v;
  } catch {
    return null;
  }
}

/** Valeur numérique (entière ou non) d'une saisie, `null` si illisible. */
export function lireCompte(brut: string): number | null {
  const v = lireExact(brut);
  if (!v) return null;
  return Number(v.num) / Number(v.den);
}

/** La saisie vaut-elle EXACTEMENT l'entier attendu ? */
export function vautEntier(brut: string, attendu: number): boolean {
  const v = lireExact(brut);
  return !!v && v.den === 1n && v.num === BigInt(attendu);
}

/** Liste d'entiers (« 8 ; −7 », « 8 et −7 », « {8 ; −7} », « n = 8 ou n = −7 »), `null` si illisible. */
export function lireListeEntiers(brut: string): number[] | null {
  let s = normaliserSigneMoins(brut).replace(/[{}]/g, " ").replace(/\b(S|n|x)\s*[₀-₉\d]?\s*=\s*/g, " ").trim();
  s = s.replace(/\s+(et|ou)\s+/gi, ";").replace(/,/g, ";");
  const morceaux = s.split(/\s*;\s*|\s{2,}/).filter((m) => m.trim() !== "");
  if (morceaux.length === 0) return null;
  const out: number[] = [];
  for (const m of morceaux) {
    const v = lireExact(m);
    if (!v || v.den !== 1n) return null;
    out.push(Number(v.num));
  }
  return out;
}

/** La saisie contient-elle encore une factorielle ou un Cₙᵏ / Aₙᵏ (forme de départ, pas simplifiée) ? */
export function contientSymboleCombinatoire(brut: string): boolean {
  const s = normaliserCombinatoire(brut);
  return /!|[CAG]\s*\(/.test(s);
}

/** Polynôme en n saisi (« n(n − 1) », « n² + n », « (n+1)·n ») → fonction, `null` si illisible. */
export function lirePolynomeN(brut: string): ((n: number) => number) | null {
  const s = normaliserSigneMoins(brut)
    .replace(/^\s*[A-Za-z]{0,2}\s*(\([^)]*\))?\s*=\s*/, "")
    .replace(/[·×⋅∙]/g, "*")
    .replace(/[÷:]/g, "/")
    .replace(/([⁰-⁹¹²³]+)/g, (_m, e: string) => `^${versChiffres(e, SUP)}`)
    .trim();
  if (s === "" || /[^n0-9+\-*/^().,\s]/i.test(s.replace(/N/g, "n"))) return null;
  const t = s.replace(/N/g, "n");
  try {
    const f = (n: number) => evaluerExpressionExponentielle(t, { n });
    const v = f(3.7);
    if (!Number.isFinite(v)) return null;
    return f;
  } catch {
    return null;
  }
}

/** Même polynôme (comparaison en 7 points, dont des non-entiers). */
export function memePolynome(f: (n: number) => number, g: (n: number) => number): boolean {
  return [-3.5, -1, 0, 1.25, 2, 5.5, 11].every((x) => {
    const a = f(x);
    const b = g(x);
    return Number.isFinite(a) && Math.abs(a - b) <= 1e-7 * Math.max(1, Math.abs(b));
  });
}
