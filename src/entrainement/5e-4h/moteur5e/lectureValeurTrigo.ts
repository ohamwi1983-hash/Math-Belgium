import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import type { StatutVerification } from "../moteur/statutVerification";

/**
 * Lecture d'une valeur saisie dans un champ libre des générateurs 5gen54–5gen57 (5e ch. 2) — jamais
 * de blocage de frappe : la saisie est lue telle quelle, `null` si elle est illisible (l'écran dit
 * alors qu'elle ne compte pas comme une tentative).
 *
 * Écritures acceptées : décimal à virgule ou à point (« 0,79 », « .5 »), « − » « – » « — »
 * (`normaliserSigneMoins`), fractions (« 4/3 »), π (« π », « pi », « 5π/6 », « 2pi », « π6 » refusé),
 * racines (« √3 », « √(3)/2 », « sqrt(3) », « racine(2) »), puissances (« 2^3 »), multiplications
 * implicites (« 3√2 », « 2(π − 1) »), produits « × » « · » « * » « x » entre deux nombres, fonctions
 * en RADIANS (sin, cos, tan) et réciproques (arcsin, asin, sin⁻¹, sin^-1, arccos, arctan), degrés
 * (« 30° » = 30 × π/180). Les mots d'unité usuels en fin de saisie (« h », « min », « m », « cm »,
 * « s », « °C », « jours ») sont ignorés.
 */

type Jeton =
  | { t: "nb"; v: number }
  | { t: "op"; v: "+" | "-" | "*" | "/" | "^" }
  | { t: "("; v?: undefined }
  | { t: ")"; v?: undefined }
  | { t: "fn"; v: string }
  | { t: "deg"; v?: undefined };

const FONCTIONS: Record<string, string> = {
  sin: "sin",
  cos: "cos",
  tan: "tan",
  tg: "tan",
  arcsin: "asin",
  asin: "asin",
  arccos: "acos",
  acos: "acos",
  arctan: "atan",
  atan: "atan",
  arctg: "atan",
  sqrt: "sqrt",
  racine: "sqrt",
  rac: "sqrt",
};

const UNITES_FINALES = /\s*(°c|jours?|j|heures?|h|minutes?|min|mn|cm|mm|km|m|secondes?|sec|s|mois|rad|radians?)\s*$/i;

function normaliser(brut: string): string {
  let s = normaliserSigneMoins(brut).trim().toLowerCase();
  s = s.replace(UNITES_FINALES, "");
  s = s
    .replace(/[×·∙•*]/g, "*")
    .replace(/÷/g, "/")
    .replace(/(sin|cos|tan|tg)\s*(⁻¹|\^\s*\(?\s*-\s*1\s*\)?)/g, "$1§")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .replace(/,/g, ".")
    .replace(/\s+/g, "");
  return s;
}

function tokeniser(s: string): Jeton[] | null {
  const jetons: Jeton[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < s.length && /[0-9.]/.test(s[j])) j++;
      const morceau = s.slice(i, j);
      if ((morceau.match(/\./g) ?? []).length > 1 || morceau === ".") return null;
      jetons.push({ t: "nb", v: Number(morceau) });
      i = j;
      continue;
    }
    if (c === "π") {
      jetons.push({ t: "nb", v: Math.PI });
      i++;
      continue;
    }
    if (c === "√") {
      jetons.push({ t: "fn", v: "sqrt" });
      i++;
      continue;
    }
    if (c === "°") {
      jetons.push({ t: "deg" });
      i++;
      continue;
    }
    if ("+-/^".includes(c)) {
      jetons.push({ t: "op", v: c as "+" | "-" | "/" | "^" });
      i++;
      continue;
    }
    if (c === "*") {
      jetons.push({ t: "op", v: "*" });
      i++;
      continue;
    }
    if (c === "(" || c === "[") {
      jetons.push({ t: "(" });
      i++;
      continue;
    }
    if (c === ")" || c === "]") {
      jetons.push({ t: ")" });
      i++;
      continue;
    }
    if (/[a-z]/.test(c)) {
      let j = i;
      while (j < s.length && /[a-z]/.test(s[j])) j++;
      let mot = s.slice(i, j);
      // « sin§ » (sin⁻¹, sin^-1) : réciproque.
      if (s[j] === "§" && ["sin", "cos", "tan", "tg"].includes(mot)) {
        jetons.push({ t: "fn", v: mot === "sin" ? "asin" : mot === "cos" ? "acos" : "atan" });
        i = j + 1;
        continue;
      }
      // Découpage d'un mot collé (« pisin », « xpi ») en noms connus, le plus long d'abord.
      const noms = [...Object.keys(FONCTIONS), "pi", "x"].sort((a, b) => b.length - a.length);
      while (mot.length > 0) {
        const nom = noms.find((n) => mot.startsWith(n));
        if (!nom) return null;
        if (nom === "pi") jetons.push({ t: "nb", v: Math.PI });
        else if (nom === "x") jetons.push({ t: "op", v: "*" });
        else jetons.push({ t: "fn", v: FONCTIONS[nom] });
        mot = mot.slice(nom.length);
      }
      i = j;
      continue;
    }
    return null;
  }
  return jetons;
}

/** Insère les multiplications implicites (« 2π », « 3√2 », « 2(…) », « )( »). */
function implicites(j: Jeton[]): Jeton[] {
  const out: Jeton[] = [];
  for (let k = 0; k < j.length; k++) {
    const a = out[out.length - 1];
    const b = j[k];
    const finA = a && (a.t === "nb" || a.t === ")" || a.t === "deg");
    const debutB = b.t === "nb" || b.t === "(" || b.t === "fn";
    if (finA && debutB) out.push({ t: "op", v: "*" });
    out.push(b);
  }
  return out;
}

class Lecteur {
  private i = 0;
  private readonly j: Jeton[];
  constructor(j: Jeton[]) {
    this.j = j;
  }
  fini(): boolean {
    return this.i >= this.j.length;
  }
  private voir(): Jeton | undefined {
    return this.j[this.i];
  }
  private prendre(): Jeton | undefined {
    return this.j[this.i++];
  }
  somme(): number {
    let v = this.produit();
    for (;;) {
      const x = this.voir();
      if (x?.t === "op" && (x.v === "+" || x.v === "-")) {
        this.prendre();
        const w = this.produit();
        v = x.v === "+" ? v + w : v - w;
      } else return v;
    }
  }
  produit(): number {
    let v = this.unaire();
    for (;;) {
      const x = this.voir();
      if (x?.t === "op" && (x.v === "*" || x.v === "/")) {
        this.prendre();
        const w = this.unaire();
        v = x.v === "*" ? v * w : v / w;
      } else return v;
    }
  }
  unaire(): number {
    const x = this.voir();
    if (x?.t === "op" && (x.v === "-" || x.v === "+")) {
      this.prendre();
      const v = this.unaire();
      return x.v === "-" ? -v : v;
    }
    return this.puissance();
  }
  puissance(): number {
    const base = this.postfixe();
    const x = this.voir();
    if (x?.t === "op" && x.v === "^") {
      this.prendre();
      return base ** this.unaire();
    }
    return base;
  }
  postfixe(): number {
    let v = this.atome();
    while (this.voir()?.t === "deg") {
      this.prendre();
      v = (v * Math.PI) / 180;
    }
    return v;
  }
  atome(): number {
    const x = this.prendre();
    if (!x) throw new Error("fin");
    if (x.t === "nb") return x.v;
    if (x.t === "(") {
      const v = this.somme();
      if (this.prendre()?.t !== ")") throw new Error("parenthèse");
      return v;
    }
    if (x.t === "fn") {
      const arg = this.puissance();
      switch (x.v) {
        case "sin":
          return Math.sin(arg);
        case "cos":
          return Math.cos(arg);
        case "tan":
          return Math.tan(arg);
        case "asin":
          return Math.asin(arg);
        case "acos":
          return Math.acos(arg);
        case "atan":
          return Math.atan(arg);
        case "sqrt":
          return Math.sqrt(arg);
      }
    }
    throw new Error("jeton");
  }
}

/** Valeur numérique de la saisie, `null` si illisible ou vide. */
export function lireValeur(brut: string): number | null {
  const s = normaliser(brut);
  if (s === "") return null;
  const jetons = tokeniser(s);
  if (!jetons || jetons.length === 0) return null;
  try {
    const l = new Lecteur(implicites(jetons));
    const v = l.somme();
    if (!l.fini()) return null;
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

/** La saisie contient-elle π (réponse en radians écrite avec π) ? */
export function contientPi(brut: string): boolean {
  return /π|pi/i.test(brut);
}

/** Statut d'un nombre comparé à une cible avec une tolérance absolue. */
export function statutProche(brut: string, cible: number, tolerance: number): StatutVerification {
  const v = lireValeur(brut);
  if (v === null) return "parse_error";
  return Math.abs(v - cible) <= tolerance + 1e-9 ? "correct" : "not_equivalent";
}

/** Écart ramené dans ]−période/2 ; période/2] (angles : période 2π). */
export function ecartModulo(v: number, cible: number, periode: number): number {
  let d = (v - cible) % periode;
  if (d > periode / 2) d -= periode;
  if (d <= -periode / 2) d += periode;
  return d;
}

/** Statut d'un angle comparé à une cible à 2π près (décision de l'utilisateur, 5e ch. 2). */
export function statutAngle(brut: string, cible: number, tolerance: number): StatutVerification {
  const v = lireValeur(brut);
  if (v === null) return "parse_error";
  return Math.abs(ecartModulo(v, cible, 2 * Math.PI)) <= tolerance + 1e-9 ? "correct" : "not_equivalent";
}

export function valeurProche(brut: string, cible: number, tolerance: number): boolean {
  const v = lireValeur(brut);
  return v !== null && Math.abs(v - cible) <= tolerance + 1e-9;
}

export function angleProche(brut: string, cible: number, tolerance: number): boolean {
  const v = lireValeur(brut);
  return v !== null && Math.abs(ecartModulo(v, cible, 2 * Math.PI)) <= tolerance + 1e-9;
}
