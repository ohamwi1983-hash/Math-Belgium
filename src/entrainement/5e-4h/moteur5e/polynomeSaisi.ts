import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

/**
 * Lecture d'un POLYNÔME en x saisi librement (5gen61 « Composer des polynômes ») : valeur exacte
 * (coefficients) ET forme de l'écriture (développée ? réduite ?). Toute écriture juste est lue :
 * termes dans n'importe quel ordre, « x^2 », « x² », « x³ », « 2x », « 2·x », « 2*x », « x/2 »,
 * virgule décimale, parenthèses, produits implicites (« 3(x+1) », « (x+1)(x−2) »), « − – — ».
 * `null` = illisible (caractère inconnu, parenthèse non fermée, division par une expression en x,
 * exposant non entier…) : l'écran l'arrête sans consommer de tentative.
 */

/** Coefficients par degré (indice = degré), en nombres. */
export type Polynome = number[];

type Noeud =
  | { t: "num"; v: number; par: boolean }
  | { t: "x"; par: boolean }
  | { t: "add" | "sub" | "mul" | "div"; a: Noeud; b: Noeud; par: boolean; implicite?: boolean }
  | { t: "neg"; a: Noeud; par: boolean }
  | { t: "pow"; a: Noeud; n: number; par: boolean };

type Jeton = { k: "n"; v: number } | { k: "x" } | { k: "op"; v: string };

function tokeniser(brut: string): Jeton[] | null {
  const s = normaliserSigneMoins(brut).replace(/\s+/g, "").replace(/[·×∙•]/g, "*").replace(/X/g, "x");
  const j: Jeton[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/[0-9.,]/.test(c)) {
      let k = i;
      while (k < s.length && /[0-9.,]/.test(s[k])) k++;
      const t = s.slice(i, k).replace(",", ".");
      if ((t.match(/\./g) ?? []).length > 1 || t === ".") return null;
      j.push({ k: "n", v: Number(t) });
      i = k;
      continue;
    }
    if (c === "²" || c === "³") {
      j.push({ k: "op", v: "^" }, { k: "n", v: c === "²" ? 2 : 3 });
      i++;
      continue;
    }
    if (c === "x") {
      j.push({ k: "x" });
      i++;
      continue;
    }
    if ("+-*/^()".includes(c)) {
      j.push({ k: "op", v: c });
      i++;
      continue;
    }
    return null;
  }
  return j;
}

class Lecteur {
  private i = 0;
  private j: Jeton[];
  constructor(j: Jeton[]) {
    this.j = j;
  }
  private voir(): Jeton | undefined {
    return this.j[this.i];
  }
  private estOp(v: string): boolean {
    const t = this.voir();
    return !!t && t.k === "op" && t.v === v;
  }
  lire(): Noeud {
    const n = this.somme();
    if (this.i !== this.j.length) throw new Error("reste");
    return n;
  }
  private somme(): Noeud {
    let g = this.produit();
    while (this.estOp("+") || this.estOp("-")) {
      const op = (this.j[this.i++] as { v: string }).v;
      const d = this.produit();
      g = { t: op === "+" ? "add" : "sub", a: g, b: d, par: false };
    }
    return g;
  }
  private debutFacteur(): boolean {
    const t = this.voir();
    return !!t && (t.k === "n" || t.k === "x" || (t.k === "op" && t.v === "("));
  }
  private produit(): Noeud {
    let g = this.unaire();
    for (;;) {
      if (this.estOp("*") || this.estOp("/")) {
        const op = (this.j[this.i++] as { v: string }).v;
        const d = this.unaire();
        g = { t: op === "*" ? "mul" : "div", a: g, b: d, par: false };
      } else if (this.debutFacteur()) {
        const d = this.puissance();
        g = { t: "mul", a: g, b: d, par: false, implicite: true };
      } else return g;
    }
  }
  private unaire(): Noeud {
    if (this.estOp("-")) {
      this.i++;
      return { t: "neg", a: this.unaire(), par: false };
    }
    if (this.estOp("+")) {
      this.i++;
      return this.unaire();
    }
    return this.puissance();
  }
  private puissance(): Noeud {
    const base = this.atome();
    if (this.estOp("^")) {
      this.i++;
      let signe = 1;
      if (this.estOp("(")) {
        // « x^(2) » toléré.
        this.i++;
        const t = this.voir();
        if (!t || t.k !== "n") throw new Error("exposant");
        this.i++;
        if (!this.estOp(")")) throw new Error("exposant");
        this.i++;
        return { t: "pow", a: base, n: t.v, par: false };
      }
      if (this.estOp("-")) throw new Error("exposant négatif");
      const t = this.voir();
      if (!t || t.k !== "n" || !Number.isInteger(t.v)) throw new Error("exposant");
      this.i++;
      return { t: "pow", a: base, n: signe * t.v, par: false };
    }
    return base;
  }
  private atome(): Noeud {
    const t = this.voir();
    if (!t) throw new Error("fin");
    if (t.k === "n") {
      this.i++;
      return { t: "num", v: t.v, par: false };
    }
    if (t.k === "x") {
      this.i++;
      return { t: "x", par: false };
    }
    if (t.v === "(") {
      this.i++;
      const n = this.somme();
      if (!this.estOp(")")) throw new Error("parenthèse");
      this.i++;
      return { ...n, par: true };
    }
    throw new Error("atome");
  }
}

function analyser(texte: string): Noeud | null {
  if (texte.trim() === "") return null;
  const j = tokeniser(texte);
  if (!j || j.length === 0) return null;
  try {
    return new Lecteur(j).lire();
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------------------------
// Arithmétique des polynômes (coefficients flottants : les valeurs saisies sont petites).
// ---------------------------------------------------------------------------------------------

export function nettoyer(p: Polynome): Polynome {
  const r = p.map((c) => (Math.abs(c) < 1e-12 ? 0 : c));
  while (r.length > 1 && r[r.length - 1] === 0) r.pop();
  return r.length ? r : [0];
}
export function addP(a: Polynome, b: Polynome): Polynome {
  return nettoyer(Array.from({ length: Math.max(a.length, b.length) }, (_, i) => (a[i] ?? 0) + (b[i] ?? 0)));
}
export function mulP(a: Polynome, b: Polynome): Polynome {
  const r = new Array(a.length + b.length - 1).fill(0);
  a.forEach((x, i) => b.forEach((y, j) => (r[i + j] += x * y)));
  return nettoyer(r);
}
export const scalP = (k: number, a: Polynome): Polynome => nettoyer(a.map((c) => k * c));
export function puisP(a: Polynome, n: number): Polynome {
  let r: Polynome = [1];
  for (let i = 0; i < n; i++) r = mulP(r, a);
  return r;
}
/** f∘g : f(g(x)). */
export function composerP(f: Polynome, g: Polynome): Polynome {
  let r: Polynome = [0];
  f.forEach((c, k) => (r = addP(r, scalP(c, puisP(g, k)))));
  return r;
}
export function evalP(p: Polynome, x: number): number {
  return p.reduce((s, c, k) => s + c * x ** k, 0);
}
export function egauxP(a: Polynome, b: Polynome, tol = 1e-9): boolean {
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) if (Math.abs((a[i] ?? 0) - (b[i] ?? 0)) > tol * Math.max(1, Math.abs(b[i] ?? 0))) return false;
  return true;
}

function valeur(n: Noeud): Polynome | null {
  switch (n.t) {
    case "num":
      return [n.v];
    case "x":
      return [0, 1];
    case "neg": {
      const a = valeur(n.a);
      return a && scalP(-1, a);
    }
    case "add":
    case "sub": {
      const a = valeur(n.a);
      const b = valeur(n.b);
      if (!a || !b) return null;
      return addP(a, n.t === "add" ? b : scalP(-1, b));
    }
    case "mul": {
      const a = valeur(n.a);
      const b = valeur(n.b);
      return a && b ? mulP(a, b) : null;
    }
    case "div": {
      const a = valeur(n.a);
      const b = valeur(n.b);
      if (!a || !b || b.length !== 1 || b[0] === 0) return null; // division par une expression en x : illisible ici
      return scalP(1 / b[0], a);
    }
    case "pow": {
      const a = valeur(n.a);
      if (!a || n.n < 0 || n.n > 12) return null;
      return puisP(a, n.n);
    }
  }
}

/** Polynôme saisi (`null` = illisible). */
export function lirePolynome(texte: string): Polynome | null {
  const n = analyser(texte);
  if (!n) return null;
  const p = valeur(n);
  return p && p.every((c) => Number.isFinite(c)) ? p : null;
}

// ---------------------------------------------------------------------------------------------
// Forme de l'écriture.
// ---------------------------------------------------------------------------------------------

/** Constante numérique pure sans parenthèse de somme (« 3 », « 1/2 », « 0,5 »). */
function estConstante(n: Noeud): boolean {
  if (n.t === "num") return true;
  // « −3x » se lit (−3)·x : le signe d'un terme peut porter sur son coefficient.
  if (n.t === "neg") return !n.par && estConstante(n.a);
  if (n.t === "div") return (n.a.t === "num" || (n.a.t === "neg" && n.a.a.t === "num")) && n.b.t === "num" && !n.a.par && !n.b.par;
  return false;
}

/** Degré d'un MONÔME écrit (« 3 », « x », « −2x² », « x²/2 », « 3·x^4 ») ; `null` sinon. */
function degreMonome(n: Noeud, signeAdmis: boolean): number | null {
  if (n.par && n.t !== "num" && n.t !== "x") return null;
  switch (n.t) {
    case "num":
      return 0;
    case "x":
      return 1;
    case "neg":
      return signeAdmis ? degreMonome(n.a, false) : null;
    case "pow":
      return n.a.t === "x" && !n.a.par && n.n >= 2 ? n.n : null;
    case "div": {
      if (estConstante(n)) return 0;
      if (n.b.t !== "num") return null;
      const d = degreMonome(n.a, false);
      return d !== null && d >= 1 ? d : null;
    }
    case "mul": {
      if (estConstante(n.a)) {
        const d = degreMonome(n.b, false);
        return d !== null && d >= 1 ? d : null;
      }
      if (estConstante(n.b)) {
        const d = degreMonome(n.a, false);
        return d !== null && d >= 1 ? d : null;
      }
      return null;
    }
    default:
      return null;
  }
}

function termes(n: Noeud, signe: number, acc: { n: Noeud; signe: number }[]): void {
  if (!n.par && (n.t === "add" || n.t === "sub")) {
    termes(n.a, signe, acc);
    termes(n.b, n.t === "add" ? signe : -signe, acc);
    return;
  }
  acc.push({ n, signe });
}

export type FormePolynome = "developpee-reduite" | "non-developpee" | "non-reduite";

/** Forme d'une saisie lisible : développée réduite (une somme de monômes de degrés distincts, sans
 * coefficient nul), non développée (parenthèse, produit de facteurs en x, puissance d'une somme),
 * ou développée mais non réduite (deux termes de même degré, coefficient nul). */
export function formePolynome(texte: string): FormePolynome | null {
  const racine = analyser(texte);
  if (!racine || !valeur(racine)) return null;
  const acc: { n: Noeud; signe: number }[] = [];
  termes(racine, 1, acc);
  const degres: number[] = [];
  for (const { n } of acc) {
    const d = degreMonome(n, true);
    if (d === null) return "non-developpee";
    const v = valeur(n)!;
    if (v.every((c) => c === 0)) return "non-reduite";
    degres.push(d);
  }
  return new Set(degres).size === degres.length ? "developpee-reduite" : "non-reduite";
}
