import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import type { StatutVerification } from "../moteur/statutVerification";

/**
 * Lecture COMMUNE des saisies du 6e ch. 7 « Analyse combinatoire » (6gen43–6gen48, audit du
 * chapitre, lot B) — une seule grammaire pour les six générateurs (avant : trois lecteurs différents,
 * « 6! » refusé ici, « × » refusé là, « 249 900 » lu 249 × 900).
 *
 * Écritures acceptées : entiers avec espaces de milliers (« 34 650 »), décimaux à virgule ou à point,
 * fractions, « × », « · », « * », « x » entre deux nombres, « ÷ », « − – — » (via
 * `normaliserSigneMoins`), puissances « ^ » ou en exposant (« 2⁴ »), factorielle « 6! »,
 * combinaisons et arrangements « C(10 ; 3) », « C(10,3) », « C_10^3 », « 10C3 », « A(6 ; 2) »,
 * « 6P2 » (touches nCr et nPr de la calculatrice), « Γ(4 ; 3) », pourcentage final « 12 % ».
 * Les valeurs sont EXACTES (rationnels en BigInt) : aucune tolérance, aucun dépassement.
 *
 * La variable x (6gen45, développement du binôme) est lue comme un polynôme exact à coefficients
 * rationnels ; `estDeveloppe` dit si l'écriture est une somme de monômes (forme développée).
 *
 * Ce module n'impose jamais rien pendant la frappe (règle « jamais de blocage ») : il ne fait que
 * LIRE une saisie au moment de la validation. Une saisie illisible ou de mauvaise forme (nombre à
 * l'écran « formule », calcul à l'écran « nombre », arrondi trop grossier) rend `parse_error` : le
 * moteur de session ne décompte alors aucune tentative, et l'écran affiche `messageRefus`.
 */

// ============================================================================
// Rationnels exacts
// ============================================================================

export interface Rationnel {
  n: bigint;
  d: bigint;
}

function pgcd(a: bigint, b: bigint): bigint {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b !== 0n) [a, b] = [b, a % b];
  return a;
}

export function rationnel(n: bigint | number, d: bigint | number = 1n): Rationnel {
  let N = typeof n === "bigint" ? n : BigInt(n);
  let D = typeof d === "bigint" ? d : BigInt(d);
  if (D === 0n) throw new Error("rationnel : dénominateur nul");
  if (D < 0n) {
    N = -N;
    D = -D;
  }
  const g = pgcd(N, D) || 1n;
  return { n: N / g, d: D / g };
}

const ZERO = rationnel(0);
const UN = rationnel(1);

function add(a: Rationnel, b: Rationnel): Rationnel {
  return rationnel(a.n * b.d + b.n * a.d, a.d * b.d);
}
function sub(a: Rationnel, b: Rationnel): Rationnel {
  return rationnel(a.n * b.d - b.n * a.d, a.d * b.d);
}
function mul(a: Rationnel, b: Rationnel): Rationnel {
  return rationnel(a.n * b.n, a.d * b.d);
}
function div(a: Rationnel, b: Rationnel): Rationnel | null {
  if (b.n === 0n) return null;
  return rationnel(a.n * b.d, a.d * b.n);
}
export function egalRationnel(a: Rationnel, b: Rationnel): boolean {
  return a.n === b.n && a.d === b.d;
}
export function versNombre(r: Rationnel): number {
  return Number(r.n) / Number(r.d);
}
function estEntier(r: Rationnel): boolean {
  return r.d === 1n;
}
function tropGrand(r: Rationnel): boolean {
  return r.n.toString().length > 400 || r.d.toString().length > 400;
}

/** Rationnel exact d'un décimal JavaScript « propre » (0,3 → 3/10, 0,02 → 1/50). */
export function rationnelDepuisDecimal(x: number): Rationnel {
  const s = x.toFixed(12).replace(/0+$/, "").replace(/\.$/, "");
  const [ent, frac = ""] = s.split(".");
  return rationnel(BigInt(ent + frac), 10n ** BigInt(frac.length));
}

export function factorielleBig(n: number): bigint {
  let r = 1n;
  for (let i = 2n; i <= BigInt(n); i++) r *= i;
  return r;
}
export function combinaisonBig(n: number, k: number): bigint {
  if (k < 0 || k > n) return 0n;
  let r = 1n;
  const kk = Math.min(k, n - k);
  for (let i = 0; i < kk; i++) r = (r * BigInt(n - i)) / BigInt(i + 1);
  return r;
}
export function arrangementBig(n: number, k: number): bigint {
  if (k < 0 || k > n) return 0n;
  let r = 1n;
  for (let i = 0; i < k; i++) r *= BigInt(n - i);
  return r;
}

// ============================================================================
// Polynômes en x à coefficients rationnels (les constantes sont des polynômes de degré 0)
// ============================================================================

type Poly = Map<number, Rationnel>;

function poly(r: Rationnel, e = 0): Poly {
  const p: Poly = new Map();
  if (r.n !== 0n) p.set(e, r);
  return p;
}
function constante(p: Poly): Rationnel | null {
  for (const e of p.keys()) if (e !== 0) return null;
  return p.get(0) ?? ZERO;
}
function polyAdd(a: Poly, b: Poly, signe = 1): Poly {
  const r: Poly = new Map(a);
  for (const [e, c] of b) {
    const v = signe === 1 ? add(r.get(e) ?? ZERO, c) : sub(r.get(e) ?? ZERO, c);
    if (v.n === 0n) r.delete(e);
    else r.set(e, v);
  }
  return r;
}
function polyMul(a: Poly, b: Poly): Poly {
  let r: Poly = new Map();
  for (const [e1, c1] of a) for (const [e2, c2] of b) r = polyAdd(r, poly(mul(c1, c2), e1 + e2));
  return r;
}

// ============================================================================
// Analyse syntaxique
// ============================================================================

export type Noeud =
  | { t: "nb"; v: Rationnel; texte: string }
  | { t: "x" }
  | { t: "op"; op: "+" | "-" | "*" | "/"; a: Noeud; b: Noeud }
  | { t: "neg"; a: Noeud }
  | { t: "pow"; a: Noeud; b: Noeud }
  | { t: "fact"; a: Noeud }
  | { t: "fn"; f: "C" | "A" | "Γ"; a: Noeud; b: Noeud }
  | { t: "par"; a: Noeud }
  | { t: "pct"; a: Noeud };

type Jeton = { k: "nb"; v: string; colle: boolean } | { k: "sym"; v: string; colle: boolean } | { k: "id"; v: string; colle: boolean };

const EXPOSANTS: Record<string, string> = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁻": "-" };

/** Normalisation commune (aucune perte d'information) : signes, multiplications, exposants, milliers. */
export function normaliserSaisieCombinatoire(texte: string): string {
  let s = normaliserSigneMoins(texte).replace(/[   ]/g, " ").trim();
  s = s.replace(/[×·⋅∙✕]/g, "*").replace(/÷/g, "/");
  s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+/g, (m) => "^(" + [...m].map((c) => EXPOSANTS[c]).join("") + ")");
  // Espaces de milliers : « 34 650 », « 1 234 567 » (groupes de 3 chiffres exactement).
  s = s.replace(/(^|[^\d.,])(\d{1,3}(?: \d{3})+)(?!\d)/g, (_m, avant: string, nombre: string) => avant + nombre.replace(/ /g, ""));
  return s;
}

function tokeniser(s: string, variableX: boolean): Jeton[] | null {
  const jetons: Jeton[] = [];
  let i = 0;
  let colle = false;
  while (i < s.length) {
    const c = s[i];
    if (c === " ") {
      colle = false;
      i++;
      continue;
    }
    if (/\d/.test(c)) {
      let j = i;
      while (j < s.length && /\d/.test(s[j])) j++;
      // Point décimal : toujours décimal. La virgule est décidée par l'analyseur (séparateur
      // d'arguments dans C(… , …), décimale ailleurs).
      if (s[j] === "." && /\d/.test(s[j + 1] ?? "")) {
        j++;
        while (j < s.length && /\d/.test(s[j])) j++;
      }
      jetons.push({ k: "nb", v: s.slice(i, j), colle });
      i = j;
      colle = true;
      continue;
    }
    if (c === "x" || c === "X") {
      // Variable du binôme, ou signe de multiplication entre deux facteurs (« 9x8x7 »).
      jetons.push(variableX ? { k: "id", v: "x", colle } : { k: "sym", v: "*", colle });
      i++;
      colle = true;
      continue;
    }
    if (c === "C" || c === "c" || c === "A" || c === "a" || c === "P" || c === "p" || c === "Γ") {
      jetons.push({ k: "id", v: c === "c" ? "C" : c === "a" ? "A" : c === "p" ? "P" : c, colle });
      i++;
      colle = true;
      continue;
    }
    if ("+-*/^()!%,;_{}[]:".includes(c)) {
      jetons.push({ k: "sym", v: c === ":" ? "/" : c === "[" ? "(" : c === "]" ? ")" : c, colle });
      i++;
      colle = true;
      continue;
    }
    return null;
  }
  return jetons;
}

/** « 3!4! » : produit implicite admis après une factorielle (jamais entre deux nombres nus). */
function finitParFactorielle(n: Noeud): boolean {
  return n.t === "fact" || (n.t === "op" && finitParFactorielle(n.b));
}

class Analyseur {
  private i = 0;
  private jetons: Jeton[];
  constructor(jetons: Jeton[]) {
    this.jetons = jetons;
  }
  private voir(): Jeton | undefined {
    return this.jetons[this.i];
  }
  private estSym(v: string, j = this.voir()): boolean {
    return !!j && j.k === "sym" && j.v === v;
  }
  private prendre(): Jeton | undefined {
    return this.jetons[this.i++];
  }
  fini(): boolean {
    return this.i >= this.jetons.length;
  }
  expression(dansArgs: boolean): Noeud | null {
    let a = this.terme(dansArgs);
    if (!a) return null;
    while (this.estSym("+") || this.estSym("-")) {
      const op = this.prendre()!.v as "+" | "-";
      const b = this.terme(dansArgs);
      if (!b) return null;
      a = { t: "op", op, a, b };
    }
    return a;
  }
  private debutFacteur(j: Jeton | undefined): boolean {
    if (!j) return false;
    if (j.k === "id") return true;
    if (j.k === "nb") return false; // deux nombres côte à côte : illisible (pas de produit implicite)
    return j.v === "(" || j.v === "{";
  }
  private terme(dansArgs: boolean): Noeud | null {
    let a = this.unaire(dansArgs);
    if (!a) return null;
    for (;;) {
      if (this.estSym("*") || this.estSym("/")) {
        const op = this.prendre()!.v as "*" | "/";
        const b = this.unaire(dansArgs);
        if (!b) return null;
        a = { t: "op", op, a, b };
      } else if (this.debutFacteur(this.voir()) || (this.voir()?.k === "nb" && finitParFactorielle(a))) {
        const b = this.unaire(dansArgs);
        if (!b) return null;
        a = { t: "op", op: "*", a, b };
      } else return a;
    }
  }
  private unaire(dansArgs: boolean): Noeud | null {
    if (this.estSym("-")) {
      this.prendre();
      const a = this.unaire(dansArgs);
      return a ? { t: "neg", a } : null;
    }
    if (this.estSym("+")) {
      this.prendre();
      return this.unaire(dansArgs);
    }
    return this.puissance(dansArgs);
  }
  private puissance(dansArgs: boolean): Noeud | null {
    const a = this.postfixe(dansArgs);
    if (!a) return null;
    if (this.estSym("^")) {
      this.prendre();
      const b = this.unaire(dansArgs);
      return b ? { t: "pow", a, b } : null;
    }
    return a;
  }
  private postfixe(dansArgs: boolean): Noeud | null {
    let a = this.primaire(dansArgs);
    if (!a) return null;
    for (;;) {
      if (this.estSym("!")) {
        this.prendre();
        a = { t: "fact", a };
      } else if (this.estSym("%")) {
        this.prendre();
        a = { t: "pct", a };
      } else return a;
    }
  }
  private nombre(dansArgs: boolean): Noeud | null {
    const j = this.prendre();
    if (!j || j.k !== "nb") return null;
    let texte = j.v;
    // Virgule décimale : « 0,35 » hors des arguments d'une combinaison, collée des deux côtés.
    const v = this.voir();
    const suivant = this.jetons[this.i + 1];
    if (!dansArgs && v && this.estSym(",", v) && v.colle && suivant && suivant.k === "nb" && suivant.colle && !texte.includes(".")) {
      this.i += 2;
      texte = `${texte}.${suivant.v}`;
    }
    const [ent, frac = ""] = texte.split(".");
    return { t: "nb", v: rationnel(BigInt(ent + frac), 10n ** BigInt(frac.length)), texte };
  }
  private groupe(dansArgs: boolean): Noeud | null {
    const ouvrant = this.prendre()!.v;
    const fermant = ouvrant === "{" ? "}" : ")";
    const a = this.expression(false);
    if (!a || !this.estSym(fermant)) return null;
    this.prendre();
    void dansArgs;
    return { t: "par", a };
  }
  /** Indice ou exposant d'un « C_n^k » : un nombre, ou un groupe entre accolades / parenthèses. */
  private argumentCourt(): Noeud | null {
    const j = this.voir();
    if (!j) return null;
    if (j.k === "nb") return this.nombre(true);
    if (this.estSym("{") || this.estSym("(")) {
      const g = this.groupe(true);
      return g && g.t === "par" ? g.a : g;
    }
    return null;
  }
  private primaire(dansArgs: boolean): Noeud | null {
    const j = this.voir();
    if (!j) return null;
    if (j.k === "nb") {
      const a = this.nombre(dansArgs);
      // « 10C3 » / « 6P2 » : touches nCr et nPr de la calculatrice.
      const id = this.voir();
      const n2 = this.jetons[this.i + 1];
      if (a && id && id.k === "id" && (id.v === "C" || id.v === "P") && n2 && n2.k === "nb") {
        this.i++;
        const b = this.nombre(true);
        return b ? { t: "fn", f: id.v === "C" ? "C" : "A", a, b } : null;
      }
      return a;
    }
    if (j.k === "id") {
      this.prendre();
      if (j.v === "x") return { t: "x" };
      const f = j.v === "P" ? "A" : (j.v as "C" | "A" | "Γ");
      if (this.estSym("_")) {
        // C_n^k (notation du cours tapée au clavier)
        this.prendre();
        const a = this.argumentCourt();
        if (!a || !this.estSym("^")) return null;
        this.prendre();
        const b = this.argumentCourt();
        return b ? { t: "fn", f, a, b } : null;
      }
      if (!this.estSym("(")) return null;
      this.prendre();
      const a = this.expression(true);
      if (!a || !(this.estSym(",") || this.estSym(";"))) return null;
      this.prendre();
      const b = this.expression(true);
      if (!b || !this.estSym(")")) return null;
      this.prendre();
      return { t: "fn", f, a, b };
    }
    if (this.estSym("(") || this.estSym("{")) return this.groupe(dansArgs);
    return null;
  }
}

/** Arbre de la saisie, ou `null` si elle est illisible. */
export function analyser(texte: string, variableX = false): Noeud | null {
  const s = normaliserSaisieCombinatoire(texte);
  if (s === "") return null;
  const jetons = tokeniser(s, variableX);
  if (!jetons || jetons.length === 0) return null;
  const a = new Analyseur(jetons);
  const n = a.expression(false);
  return n && a.fini() ? n : null;
}

function entierPetit(r: Rationnel | null, max: number): number | null {
  if (!r || !estEntier(r) || r.n < 0n || r.n > BigInt(max)) return null;
  return Number(r.n);
}

function evaluerPoly(n: Noeud): Poly | null {
  switch (n.t) {
    case "nb":
      return poly(n.v);
    case "x":
      return poly(UN, 1);
    case "par":
      return evaluerPoly(n.a);
    case "neg": {
      const a = evaluerPoly(n.a);
      return a ? polyAdd(new Map(), a, -1) : null;
    }
    case "pct": {
      const a = evaluerPoly(n.a);
      const c = a && constante(a);
      return c ? poly(mul(c, rationnel(1, 100))) : null;
    }
    case "op": {
      const a = evaluerPoly(n.a);
      const b = evaluerPoly(n.b);
      if (!a || !b) return null;
      if (n.op === "+") return polyAdd(a, b);
      if (n.op === "-") return polyAdd(a, b, -1);
      if (n.op === "*") return polyMul(a, b);
      const cb = constante(b);
      if (!cb || cb.n === 0n) return null;
      const r: Poly = new Map();
      for (const [e, c] of a) r.set(e, div(c, cb)!);
      return r;
    }
    case "pow": {
      const a = evaluerPoly(n.a);
      const b = evaluerPoly(n.b);
      const cb = b && constante(b);
      if (!a || !cb || !estEntier(cb)) return null;
      const e = Number(cb.n);
      const ca = constante(a);
      if (ca) {
        if (Math.abs(e) > 400) return null;
        let r = UN;
        const base = e < 0 ? div(UN, ca) : ca;
        if (!base) return null;
        for (let i = 0; i < Math.abs(e); i++) r = mul(r, base);
        return poly(r);
      }
      if (e < 0 || e > 40) return null;
      let r: Poly = poly(UN);
      for (let i = 0; i < e; i++) r = polyMul(r, a);
      return r;
    }
    case "fact": {
      const a = evaluerPoly(n.a);
      const k = entierPetit(a && constante(a), 200);
      return k === null ? null : poly(rationnel(factorielleBig(k)));
    }
    case "fn": {
      const a = evaluerPoly(n.a);
      const b = evaluerPoly(n.b);
      const na = entierPetit(a && constante(a), 500);
      const kb = entierPetit(b && constante(b), 500);
      if (na === null || kb === null) return null;
      if (n.f === "C") return poly(rationnel(combinaisonBig(na, kb)));
      if (n.f === "A") return poly(rationnel(arrangementBig(na, kb)));
      return poly(rationnel(combinaisonBig(na + kb - 1, kb)));
    }
  }
}

/** Valeur exacte d'une saisie sans variable, ou `null` (illisible, ou x présent). */
export function lireValeur(texte: string): Rationnel | null {
  const n = analyser(texte);
  if (!n) return null;
  const p = evaluerPoly(n);
  const c = p && constante(p);
  if (!c || tropGrand(c)) return null;
  return c;
}

/** La saisie contient-elle un opérateur de dénombrement (« ! », C, A, Γ) ? */
export function contientOperateurCombinatoire(n: Noeud): boolean {
  switch (n.t) {
    case "fact":
    case "fn":
      return true;
    case "nb":
    case "x":
      return false;
    case "par":
    case "neg":
    case "pct":
      return contientOperateurCombinatoire(n.a);
    case "op":
    case "pow":
      return contientOperateurCombinatoire(n.a) || contientOperateurCombinatoire(n.b);
  }
}

/** La saisie est-elle un nombre écrit tel quel (« 4536 », « −12 », « 0,25 ») ? */
export function estNombreSimple(texte: string): boolean {
  const n = analyser(texte);
  if (!n) return false;
  const coeur = n.t === "neg" ? n.a : n;
  return coeur.t === "nb";
}

// ============================================================================
// Rendu LaTeX de la saisie (aperçu sous le champ)
// ============================================================================

export function noeudVersLatex(n: Noeud): string {
  switch (n.t) {
    case "nb":
    {
      const [ent, frac] = n.texte.split(".");
      const groupes = ent.length > 4 ? ent.replace(/\B(?=(\d{3})+$)/g, "\\,") : ent;
      return frac === undefined ? groupes : `${groupes}{,}${frac}`;
    }
    case "x":
      return "x";
    case "par":
      return `\\left(${noeudVersLatex(n.a)}\\right)`;
    case "neg":
      return `-${noeudVersLatex(n.a)}`;
    case "pct":
      return `${noeudVersLatex(n.a)}\\,\\%`;
    case "fact":
      return `${noeudVersLatex(n.a)}!`;
    case "pow":
      return `{${noeudVersLatex(n.a)}}^{${noeudVersLatex(n.b.t === "par" ? n.b.a : n.b)}}`;
    case "fn": {
      const a = noeudVersLatex(n.a);
      const b = noeudVersLatex(n.b);
      return n.f === "Γ" ? `\\Gamma_{${a}}^{${b}}` : `${n.f}_{${a}}^{${b}}`;
    }
    case "op": {
      if (n.op === "/") return `\\dfrac{${noeudVersLatex(n.a.t === "par" ? n.a.a : n.a)}}{${noeudVersLatex(n.b.t === "par" ? n.b.a : n.b)}}`;
      if (n.op === "*") {
        const implicite = n.b.t === "x" || (n.b.t === "pow" && n.b.a.t === "x");
        return `${noeudVersLatex(n.a)}${implicite ? "" : "\\times "}${noeudVersLatex(n.b)}`;
      }
      return `${noeudVersLatex(n.a)}${n.op}${noeudVersLatex(n.b)}`;
    }
  }
}

/** Aperçu KaTeX d'une saisie (null si illisible). */
export function apercuLatex(texte: string, variableX = false): string | null {
  const n = analyser(texte, variableX);
  return n ? noeudVersLatex(n) : null;
}

// ============================================================================
// Natures de champ, refus sans tentative et diagnostic
// ============================================================================

/**
 * - `entier` : un nombre entier, écrit directement ou par un calcul (« 9 × 8 × 7 », « 6! »).
 * - `nombre` : le résultat CALCULÉ, écrit comme un nombre (écran « calcul » après un écran « formule »).
 * - `formule` : l'écriture NON calculée, avec « ! », C, A ou Γ (écran « formule »).
 * - `probabilite` : fraction, produit… exact, ou décimal correctement arrondi (au moins 3 décimales,
 *   et au moins 2 chiffres significatifs), ou pourcentage.
 * - `probabiliteCalculee` : même chose, mais sans « ! » ni C (écran « calcul » après un écran « formule »).
 * - `exacte` : valeur exacte (fraction ou décimal exact) — aucun arrondi accepté.
 * - `arrondi4` : exact, ou décimal arrondi correctement avec au moins 4 décimales.
 * - `liste` : liste d'entiers « 1 ; 2 ; 6 », « {1;2;6} », « (1, 2, 6) », comparée comme multiensemble.
 * - `polynome` : expression en x, développée (somme de monômes) — comparaison exacte des coefficients.
 */
export type NatureSaisie = "entier" | "nombre" | "formule" | "probabilite" | "probabiliteCalculee" | "exacte" | "arrondi4" | "liste" | "polynome";

const FIN = " Cette saisie ne compte pas comme une tentative.";

export const MESSAGES_ILLISIBLE: Record<NatureSaisie, string> = {
  entier: "Nombre non reconnu : écris un entier (les espaces de milliers sont permis), ou un calcul avec ×, « ! » ou C(n ; k)." + FIN,
  nombre: "Nombre non reconnu : écris le résultat comme un entier (les espaces de milliers sont permis)." + FIN,
  formule: "Formule non reconnue : utilise « ! » pour une factorielle, C(n ; k) pour une combinaison, A(n ; k) pour un arrangement, et des parenthèses autour d'un dénominateur." + FIN,
  probabilite: "Probabilité non reconnue : écris une fraction, un produit de fractions, une écriture avec C(n ; k), ou un décimal (virgule ou point)." + FIN,
  probabiliteCalculee: "Probabilité non reconnue : écris une fraction ou un décimal (virgule ou point)." + FIN,
  exacte: "Nombre non reconnu : écris un décimal (virgule ou point) ou une fraction." + FIN,
  arrondi4: "Nombre non reconnu : écris un décimal (virgule ou point) ou une fraction." + FIN,
  liste: "Liste non reconnue : écris les entiers séparés par des points-virgules, avec ou sans accolades." + FIN,
  polynome: "Polynôme non reconnu : vérifie les signes et les puissances de x (x^3 ou x³), par exemple 2x^2 − 5x + 1." + FIN,
};

export const MESSAGE_FORMULE_ATTENDUE =
  "On demande ici la formule, sans la calculer : écris-la avec « ! » ou C(n ; k), le calcul vient à l'écran suivant." + FIN;
export const MESSAGE_NOMBRE_ATTENDU = "On demande ici le résultat calculé : écris un nombre, pas une expression." + FIN;
export const MESSAGE_DEVELOPPE_ATTENDU =
  "Ce polynôme n'est pas développé : écris une somme de termes de la forme a·xᵏ, sans parenthèses ni puissance de binôme." + FIN;
export const MESSAGE_VALEUR_ATTENDUE =
  "On demande ici la valeur de la probabilité : calcule les combinaisons et écris une fraction ou un décimal." + FIN;
export const MESSAGE_ARRONDI4 = "Donne la valeur exacte ou un arrondi avec au moins 4 décimales." + FIN;

function decimalesMinProbabilite(cible: number): number {
  const absolu = Math.abs(cible);
  if (absolu === 0) return 3;
  // Annonce des générateurs du chapitre : « valeur exacte, ou arrondi au millième » (3 décimales).
  const base = 3;
  // Au moins 2 chiffres significatifs (0,000 1… → 5 décimales) : « 0,000 » n'est jamais un arrondi.
  const significatifs = Math.ceil(-Math.log10(absolu)) + 1;
  return Math.max(base, significatifs);
}

/** Écriture décimale (ou pourcentage) : nombre de décimales effectives, ou null si ce n'en est pas une. */
function decimalesEcrites(texte: string): { valeur: Rationnel; decimales: number } | null {
  const s = normaliserSaisieCombinatoire(texte).replace(/\s+/g, "");
  const pourcent = /%$/.test(s);
  const corps = pourcent ? s.slice(0, -1) : s;
  const m = /^(-?)(\d+)(?:[.,](\d+))?$/.exec(corps);
  if (!m) return null;
  const frac = m[3] ?? "";
  let v = rationnel(BigInt(m[1] + m[2] + frac), 10n ** BigInt(frac.length));
  if (pourcent) v = mul(v, rationnel(1, 100));
  return { valeur: v, decimales: frac.length + (pourcent ? 2 : 0) };
}

function arrondiCorrect(valeur: Rationnel, decimales: number, cible: Rationnel): boolean {
  // |valeur − cible| < ½·10⁻ᵈ ; pile au milieu, seul l'arrondi « au-dessus » (en valeur absolue).
  const ecart = sub(valeur, cible);
  const demi = rationnel(1n, 2n * 10n ** BigInt(decimales));
  const absEcart = ecart.n < 0n ? rationnel(-ecart.n, ecart.d) : ecart;
  const cmp = absEcart.n * demi.d - demi.n * absEcart.d;
  if (cmp < 0n) return true;
  if (cmp === 0n) return (ecart.n > 0n) === (cible.n >= 0n);
  return false;
}

export type Cible = Rationnel | number | bigint;

export function versRationnel(c: Cible): Rationnel {
  if (typeof c === "bigint") return rationnel(c);
  if (typeof c === "number") return Number.isInteger(c) ? rationnel(c) : rationnelDepuisDecimal(c);
  return c;
}

/** Liste d'entiers d'une saisie « 1 ; 2 ; 6 », « {1;2;6} », « (1,2,6) », « 1 2 6 ». */
export function lireListeEntiers(texte: string): number[] | null {
  const s = normaliserSigneMoins(texte).replace(/[{}()[\]]/g, " ").trim();
  if (s === "") return null;
  const parties = s.split(/[;,\s]+/).filter((p) => p !== "");
  const r: number[] = [];
  for (const p of parties) {
    if (!/^-?\d+$/.test(p)) return null;
    r.push(Number(p));
  }
  return r.length > 0 ? r : null;
}

/** Polynôme en x d'une saisie (coefficients exacts), ou null. */
export function lirePolynome(texte: string): Poly | null {
  const n = analyser(texte, true);
  return n ? evaluerPoly(n) : null;
}

/** Somme de monômes c·xᵉ (sans parenthèses autour d'une somme, sans puissance de binôme) ? */
export function estDeveloppe(texte: string): boolean {
  const n = analyser(texte, true);
  if (!n) return false;
  const monome = (m: Noeud): boolean => {
    switch (m.t) {
      case "nb":
      case "x":
        return true;
      case "neg":
        return monome(m.a);
      case "par":
        return m.a.t !== "op" || (m.a.op !== "+" && m.a.op !== "-") ? monome(m.a) : false;
      case "pow":
        return (m.a.t === "x" || m.a.t === "nb") && (m.b.t === "nb" || (m.b.t === "par" && m.b.a.t === "nb"));
      case "op":
        return (m.op === "*" || m.op === "/") && monome(m.a) && monome(m.b);
      default:
        return false;
    }
  };
  const somme = (m: Noeud): boolean => (m.t === "op" && (m.op === "+" || m.op === "-") ? somme(m.a) && somme(m.b) : monome(m));
  return somme(n);
}

/** Message de refus SANS tentative (illisible, mauvaise forme, arrondi trop grossier), ou null. */
export function messageRefus(texte: string, nature: NatureSaisie, cible?: Cible): string | null {
  if (texte.trim() === "") return MESSAGES_ILLISIBLE[nature];
  if (nature === "liste") return lireListeEntiers(texte) ? null : MESSAGES_ILLISIBLE.liste;
  if (nature === "polynome") {
    if (!lirePolynome(texte)) return MESSAGES_ILLISIBLE.polynome;
    return estDeveloppe(texte) ? null : MESSAGE_DEVELOPPE_ATTENDU;
  }
  const n = analyser(texte);
  if (!n || lireValeur(texte) === null) return MESSAGES_ILLISIBLE[nature];
  if (nature === "formule" && !contientOperateurCombinatoire(n)) return MESSAGE_FORMULE_ATTENDUE;
  if (nature === "nombre" && !estNombreSimple(texte)) return MESSAGE_NOMBRE_ATTENDU;
  if (nature === "probabiliteCalculee" && contientOperateurCombinatoire(n)) return MESSAGE_VALEUR_ATTENDUE;
  if ((nature === "probabilite" || nature === "probabiliteCalculee" || nature === "arrondi4") && cible !== undefined) {
    const dec = decimalesEcrites(texte);
    const c = versRationnel(cible);
    if (dec && !egalRationnel(dec.valeur, c)) {
      const min = nature === "arrondi4" ? 4 : decimalesMinProbabilite(versNombre(c));
      if (dec.decimales < min) {
        return nature === "arrondi4"
          ? MESSAGE_ARRONDI4
          : `C'est un arrondi trop grossier : donne la valeur exacte (une fraction) ou un décimal avec au moins ${min} décimales.` + FIN;
      }
    }
  }
  return null;
}

/** Diagnostic d'un champ : `parse_error` dès qu'un refus sans tentative s'applique. */
export function diagnostiquerSaisie(texte: string, nature: NatureSaisie, cible: Cible | number[] | Poly): StatutVerification {
  if (messageRefus(texte, nature, Array.isArray(cible) || cible instanceof Map ? undefined : cible) !== null) return "parse_error";
  if (nature === "liste") {
    const l = lireListeEntiers(texte)!;
    const attendu = [...(cible as number[])].sort((a, b) => a - b);
    const recu = [...l].sort((a, b) => a - b);
    return attendu.length === recu.length && attendu.every((v, i) => v === recu[i]) ? "correct" : "not_equivalent";
  }
  if (nature === "polynome") {
    const p = lirePolynome(texte)!;
    const q = cible as Poly;
    const cles = new Set([...p.keys(), ...q.keys()]);
    for (const e of cles) if (!egalRationnel(p.get(e) ?? ZERO, q.get(e) ?? ZERO)) return "not_equivalent";
    return "correct";
  }
  const v = lireValeur(texte)!;
  const c = versRationnel(cible as Cible);
  if (egalRationnel(v, c)) return "correct";
  if (nature === "probabilite" || nature === "probabiliteCalculee" || nature === "arrondi4") {
    const dec = decimalesEcrites(texte);
    if (dec && arrondiCorrect(dec.valeur, dec.decimales, c)) return "correct";
  }
  return "not_equivalent";
}

/** Polynôme attendu à partir de ses coefficients (exposant → coefficient entier). */
export function polynomeDepuisCoefficients(coefficients: { exposant: number; coefficient: number }[]): Poly {
  let p: Poly = new Map();
  for (const { exposant, coefficient } of coefficients) p = polyAdd(p, poly(rationnel(coefficient), exposant));
  return p;
}

/** La saisie vaut-elle exactement `cible` (sans regarder la forme) ? Pour les messages ciblés. */
export function vaut(texte: string, cible: Cible): boolean {
  const v = lireValeur(texte);
  return v !== null && egalRationnel(v, versRationnel(cible));
}
