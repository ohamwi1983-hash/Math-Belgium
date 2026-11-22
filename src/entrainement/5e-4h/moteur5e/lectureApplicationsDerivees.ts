import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import type { StatutVerification } from "../moteur/statutVerification";
import { lireValeur } from "./lectureValeurTrigo";

/**
 * Lecture des saisies des générateurs 5gen68–5gen70 (5e ch. 5, « Dérivées et applications ») —
 * jamais de blocage de frappe : la saisie est lue APRÈS coup, `null` = illisible (l'écran le dit,
 * aucune tentative consommée).
 * - `lireNombre` : `lireValeur` (fractions, racines, π, « − – — », virgule) + notation scientifique
 *   (« 6,2·10^-6 », « 6,2×10⁻⁶ », « 6,2e-6 »), préfixe « a = » / « f′(4) = » ignoré, unité finale
 *   recopiée ignorée (« cm³ », « °C/h », « €/pièce », « m/s »…).
 * - `lireFonctionVar` : expression en x (ou t, q) — + − × / ^, produits implicites, parenthèses,
 *   √ / sqrt / racine, sin / cos / tan EN RADIANS (« cos x », « cos(x) », « cos²x »), exposants
 *   « ² ³ ⁴ … », π, préfixe « f′(x) = » ignoré. L'évaluateur général du site travaille en degrés :
 *   il ne convient pas aux dérivées de sin, cos, tan.
 */

const EXPOSANTS: Record<string, string> = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁻": "-" };

function exposantsUnicode(s: string): string {
  return s.replace(/[⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, (m) => `^(${[...m].map((c) => EXPOSANTS[c]).join("")})`);
}

const UNITE_FINALE =
  /\s*(°\s*c(\s*(\/|par)\s*(h|heures?))?|€(\s*(\/|par)\s*pi[eè]ces?)?|euros?(\s*(\/|par)\s*pi[eè]ces?)?|cm\s*(³|²|\^\s*\(?[23]\)?)?|m\s*\/\s*s|m|s|h|milliers?(\s.*)?|(habitants?)(\s.*)?|par\s.*)$/i;

/** Nombre saisi, `null` si illisible ou vide. */
export function lireNombre(brut: string): number | null {
  let s = normaliserSigneMoins(brut).trim();
  if (s === "") return null;
  // Préfixe recopié (« a = 4 », « f'(4) = 0,25 », « e ≈ 6,2·10^-6 ») : on garde ce qui suit le dernier « = » / « ≈ ».
  s = s.replace(/^.*[=≈]/, "").trim();
  s = s.replace(UNITE_FINALE, "").trim();
  s = s.replace(/(\d)\s*[eE]\s*([+-]?\d+)$/, "$1*10^($2)");
  s = exposantsUnicode(s);
  if (s === "") return null;
  return lireValeur(s);
}

/** Égalité numérique à 1e-9 près (relatif au-delà de 1). */
export const egal = (a: number, b: number): boolean => Math.abs(a - b) < 1e-9 * Math.max(1, Math.abs(b));

export const statut = (ok: boolean): StatutVerification => (ok ? "correct" : "not_equivalent");

/** Statut d'un nombre attendu exactement. */
export function statutNombre(brut: string, cible: number): StatutVerification {
  const v = lireNombre(brut);
  return v === null ? "parse_error" : statut(egal(v, cible));
}

// ============================================================================
// Expressions en une variable (radians).
// ============================================================================

type Jeton = { t: "nb"; v: number } | { t: "var" } | { t: "op"; v: "+" | "-" | "*" | "/" | "^" } | { t: "(" } | { t: ")" } | { t: "fn"; v: "sin" | "cos" | "tan" | "sqrt" };

const NOMS: [string, Jeton][] = [
  ["racine", { t: "fn", v: "sqrt" }],
  ["sqrt", { t: "fn", v: "sqrt" }],
  ["rac", { t: "fn", v: "sqrt" }],
  ["sin", { t: "fn", v: "sin" }],
  ["cos", { t: "fn", v: "cos" }],
  ["tan", { t: "fn", v: "tan" }],
  ["tg", { t: "fn", v: "tan" }],
  ["pi", { t: "nb", v: Math.PI }],
];

function tokeniser(s: string, variable: string): Jeton[] | null {
  const out: Jeton[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < s.length && /[0-9.]/.test(s[j])) j++;
      const m = s.slice(i, j);
      if ((m.match(/\./g) ?? []).length > 1 || m === ".") return null;
      out.push({ t: "nb", v: Number(m) });
      i = j;
      continue;
    }
    if (c === "π") {
      out.push({ t: "nb", v: Math.PI });
      i++;
      continue;
    }
    if (c === "√") {
      out.push({ t: "fn", v: "sqrt" });
      i++;
      continue;
    }
    if ("+-*/^".includes(c)) {
      out.push({ t: "op", v: c as "+" | "-" | "*" | "/" | "^" });
      i++;
      continue;
    }
    if (c === "(" || c === "[") {
      out.push({ t: "(" });
      i++;
      continue;
    }
    if (c === ")" || c === "]") {
      out.push({ t: ")" });
      i++;
      continue;
    }
    if (/[a-z]/i.test(c)) {
      let j = i;
      while (j < s.length && /[a-z]/i.test(s[j])) j++;
      let mot = s.slice(i, j).toLowerCase();
      while (mot.length > 0) {
        const nom = NOMS.find(([n]) => mot.startsWith(n));
        if (nom) {
          out.push(nom[1]);
          mot = mot.slice(nom[0].length);
        } else if (mot[0] === variable) {
          out.push({ t: "var" });
          mot = mot.slice(1);
        } else return null;
      }
      i = j;
      continue;
    }
    return null;
  }
  return out;
}

/** Arbre d'expression (évalué ensuite en tout point). */
type Noeud = (x: number) => number;

class Lecteur {
  private k = 0;
  private j: Jeton[];
  constructor(j: Jeton[]) {
    this.j = j;
  }
  fini() {
    return this.k >= this.j.length;
  }
  private voir(): Jeton | undefined {
    return this.j[this.k];
  }
  private prendre(): Jeton | undefined {
    return this.j[this.k++];
  }
  somme(): Noeud {
    let g = this.produit();
    for (;;) {
      const t = this.voir();
      if (t?.t === "op" && (t.v === "+" || t.v === "-")) {
        this.prendre();
        const d = this.produit();
        const a = g;
        g = t.v === "+" ? (x) => a(x) + d(x) : (x) => a(x) - d(x);
      } else return g;
    }
  }
  private debutAtome(t: Jeton | undefined): boolean {
    return !!t && (t.t === "nb" || t.t === "var" || t.t === "(" || t.t === "fn");
  }
  produit(): Noeud {
    let g = this.unaire();
    for (;;) {
      const t = this.voir();
      if (t?.t === "op" && (t.v === "*" || t.v === "/")) {
        this.prendre();
        const d = this.unaire();
        const a = g;
        g = t.v === "*" ? (x) => a(x) * d(x) : (x) => a(x) / d(x);
      } else if (this.debutAtome(t)) {
        const d = this.puissance();
        const a = g;
        g = (x) => a(x) * d(x);
      } else return g;
    }
  }
  unaire(): Noeud {
    const t = this.voir();
    if (t?.t === "op" && (t.v === "-" || t.v === "+")) {
      this.prendre();
      const d = this.unaire();
      return t.v === "-" ? (x) => -d(x) : d;
    }
    return this.puissance();
  }
  puissance(): Noeud {
    const base = this.atome();
    if (this.voir()?.t === "op" && (this.voir() as { v: string }).v === "^") {
      this.prendre();
      const e = this.unaire();
      return (x) => base(x) ** e(x);
    }
    return base;
  }
  /** Argument d'une fonction sans parenthèses (« cos x », « sin 2x ») : atomes juxtaposés. */
  private argumentNu(): Noeud {
    let g = this.atome();
    while (this.voir()?.t === "nb" || this.voir()?.t === "var") {
      const d = this.atome();
      const a = g;
      g = (x) => a(x) * d(x);
    }
    return g;
  }
  atome(): Noeud {
    const t = this.prendre();
    if (!t) throw new Error("fin");
    if (t.t === "nb") {
      const v = t.v;
      return () => v;
    }
    if (t.t === "var") return (x) => x;
    if (t.t === "(") {
      const v = this.somme();
      if (this.prendre()?.t !== ")") throw new Error("parenthèse");
      return v;
    }
    if (t.t === "fn") {
      // « cos²x », « cos^2(x) » : puissance de la fonction.
      let exposant: Noeud | null = null;
      if (this.voir()?.t === "op" && (this.voir() as { v: string }).v === "^") {
        this.prendre();
        exposant = this.atome();
      }
      const arg = this.voir()?.t === "(" ? this.atome() : this.argumentNu();
      const f = t.v === "sin" ? Math.sin : t.v === "cos" ? Math.cos : t.v === "tan" ? Math.tan : Math.sqrt;
      if (exposant) {
        const e = exposant;
        return (x) => f(arg(x)) ** e(x);
      }
      return (x) => f(arg(x));
    }
    throw new Error("jeton");
  }
}

/**
 * Expression en `variable` (défaut x), `null` si illisible. Lisible = la syntaxe est reconnue ;
 * une expression hors de son domaine en un point reste lisible (évaluée à NaN là).
 */
export function lireFonctionVar(brut: string, variable = "x"): ((x: number) => number) | null {
  let s = normaliserSigneMoins(brut).trim();
  s = s.replace(/^.*=/, "").trim();
  if (s === "") return null;
  s = s.replace(/,/g, ".").replace(/[×·∙•]/g, "*").replace(/÷/g, "/");
  s = exposantsUnicode(s);
  const jetons = tokeniser(s, variable);
  if (!jetons || jetons.length === 0) return null;
  try {
    const l = new Lecteur(jetons);
    const f = l.somme();
    if (!l.fini()) return null;
    return f;
  } catch {
    return null;
  }
}

/** Deux fonctions égales aux points donnés (points où la référence existe ; au moins 3). */
export function memesFonctions(f: (x: number) => number, g: (x: number) => number, points: number[]): boolean {
  let n = 0;
  for (const x of points) {
    const b = g(x);
    if (!Number.isFinite(b)) continue;
    const a = f(x);
    if (!Number.isFinite(a)) return false;
    if (Math.abs(a - b) > 1e-7 * Math.max(1, Math.abs(b))) return false;
    n++;
  }
  return n >= 3;
}
