import type { ExerciceCalculPrimitives } from "../core6e/calculPrimitives.types";

/**
 * Valeur EXACTE d'une intégrale définie F(b) − F(a) de `6gen25` (familles de primitive A, B, C, G
 * de 6gen23, bornes rationnelles), calculée SYMBOLIQUEMENT : combinaison linéaire à coefficients
 * rationnels d'« atomes » (ln p premier, π, √s, e^x, sin x, cos x, arctan, arcsin, (arctan x)³,
 * √(e^x + 1), base^x / ln base) — jamais reconnue après coup sur le flottant.
 *
 * Sert à trois choses, qui doivent rester d'accord (revue des profils `calcul`, décision de
 * l'utilisateur du 24/11/2026 — la Graph Math+ calcule ∫ directement) :
 * - le profil d'évaluation : valeur rationnelle (aucun atome) ⟺ `calcul: 'exacte'` ;
 * - la consigne : valeur irrationnelle ⟹ « sous forme exacte » (écran et papier) ;
 * - la vérification : valeur irrationnelle ⟹ un arrondi est refusé sans tentative.
 * Et à l'affichage de la réponse attendue (« = 3 ln(2) − 1 ≈ 1,08 » au lieu de « ≈ 1,08 »).
 *
 * Contrôle intégré : la valeur numérique de la combinaison doit égaler F(b) − F(a) (1e-9 relatif),
 * sinon `null` (l'appelant retombe sur la reconnaissance numérique d'avant).
 */

// ============================================================================
// Rationnels (entiers JavaScript : bornes et coefficients petits).
// ============================================================================

interface Q {
  n: number;
  d: number;
}

function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

function q(n: number, d = 1): Q {
  const g = pgcd(n, d);
  const s = d < 0 ? -1 : 1;
  return { n: (s * n) / g || 0, d: (s * d) / g };
}
const add = (a: Q, b: Q): Q => q(a.n * b.d + b.n * a.d, a.d * b.d);
const mul = (a: Q, b: Q): Q => q(a.n * b.n, a.d * b.d);
const neg = (a: Q): Q => q(-a.n, a.d);
const val = (a: Q): number => a.n / a.d;
function puissance(a: Q, k: number): Q {
  let r = q(1);
  for (let i = 0; i < k; i++) r = mul(r, a);
  return r;
}

/** Rationnel égal au flottant (dénominateur ≤ 10 000) — bornes, coefficients d'ajustement. */
function depuis(v: number): Q | null {
  if (!Number.isFinite(v)) return null;
  for (let d = 1; d <= 10000; d++) {
    const n = Math.round(v * d);
    if (Math.abs(n / d - v) < 1e-10 * Math.max(1, Math.abs(v))) return q(n, d);
  }
  return null;
}

function fractionL(a: Q): string {
  if (a.n === 0) return "0";
  const s = a.n < 0 ? "-" : "";
  return a.d === 1 ? `${a.n}` : `${s}\\dfrac{${Math.abs(a.n)}}{${a.d}}`;
}
/** Argument d'une fonction : `(3)`, `(-2)`, `\left(\dfrac{1}{4}\right)`. */
function argL(a: Q): string {
  return a.d === 1 ? `(${a.n})` : `\\left(${fractionL(a)}\\right)`;
}
/** Exposant : `{2}`, `{-1}`, `{\frac{1}{4}}`. */
function exposantL(a: Q): string {
  if (a.d === 1) return `{${a.n}}`;
  return `{${a.n < 0 ? "-" : ""}\\frac{${Math.abs(a.n)}}{${a.d}}}`;
}

// ============================================================================
// Atomes et combinaisons.
// ============================================================================

interface Atome {
  cle: string;
  /** LaTeX du facteur (numérateur quand `denominateur` est présent ; "" = 1). */
  latex: string;
  denominateur?: string;
  valeur: number;
  rang: number;
}

type Part = [Q, Atome | null];

const PI: Atome = { cle: "pi", latex: "\\pi", valeur: Math.PI, rang: 1 };
const PI3: Atome = { cle: "pi3", latex: "\\pi^{3}", valeur: Math.PI ** 3, rang: 2 };

function facteursPremiers(n: number): Map<number, number> {
  const f = new Map<number, number>();
  let m = Math.abs(n);
  for (let p = 2; p * p <= m; p++) {
    while (m % p === 0) {
      f.set(p, (f.get(p) ?? 0) + 1);
      m /= p;
    }
  }
  if (m > 1) f.set(m, (f.get(m) ?? 0) + 1);
  return f;
}

/** c·ln|x| décomposé sur les ln de nombres premiers (ln 6 − ln 2 se simplifie en ln 3). */
function lnAbs(c: Q, x: Q): Part[] {
  if (x.n === 0) throw new Error("ln(0)");
  const parts: Part[] = [];
  for (const [p, e] of facteursPremiers(x.n)) parts.push([mul(c, q(e)), { cle: `ln:${p}`, latex: `\\ln(${p})`, valeur: Math.log(p), rang: 100 + p }]);
  for (const [p, e] of facteursPremiers(x.d)) parts.push([mul(c, q(-e)), { cle: `ln:${p}`, latex: `\\ln(${p})`, valeur: Math.log(p), rang: 100 + p }]);
  return parts;
}

function expo(c: Q, x: Q): Part[] {
  if (x.n === 0) return [[c, null]];
  const latex = x.n === 1 && x.d === 1 ? "e" : `e^${exposantL(x)}`;
  return [[c, { cle: `exp:${x.n}/${x.d}`, latex, valeur: Math.exp(val(x)), rang: 400 + val(x) / 1000 }]];
}

/** c·√r (r ≥ 0 rationnel) : √(n/d) = √(n·d)/d, puis √s simplifiée (√8 = 2√2). */
function racine(c: Q, r: Q): Part[] {
  if (r.n < 0) throw new Error("racine négative");
  if (r.n === 0) return [];
  let radicande = r.n * r.d;
  let coef = 1;
  for (let k = 2; k * k <= radicande; k++) {
    while (radicande % (k * k) === 0) {
      radicande /= k * k;
      coef *= k;
    }
  }
  const facteur = mul(c, q(coef, r.d));
  if (radicande === 1) return [[facteur, null]];
  return [[facteur, { cle: `sqrt:${radicande}`, latex: `\\sqrt{${radicande}}`, valeur: Math.sqrt(radicande), rang: 200 + radicande / 1000 }]];
}

function sinus(c: Q, x: Q): Part[] {
  if (x.n === 0) return [];
  if (x.n < 0) return sinus(neg(c), neg(x));
  return [[c, { cle: `sin:${x.n}/${x.d}`, latex: `\\sin${argL(x)}`, valeur: Math.sin(val(x)), rang: 500 + val(x) / 1000 }]];
}

function cosinus(c: Q, x: Q): Part[] {
  if (x.n === 0) return [[c, null]];
  if (x.n < 0) return cosinus(c, neg(x));
  return [[c, { cle: `cos:${x.n}/${x.d}`, latex: `\\cos${argL(x)}`, valeur: Math.cos(val(x)), rang: 600 + val(x) / 1000 }]];
}

/** Nombre c·√s (s sans facteur carré, 1 pour un rationnel). */
interface Radical {
  c: Q;
  s: number;
}
function radicalL(r: Radical): string {
  if (r.s === 1) return fractionL(r.c);
  const abs = r.c.n < 0 ? neg(r.c) : r.c;
  const signe = r.c.n < 0 ? "-" : "";
  const num = abs.n === 1 ? `\\sqrt{${r.s}}` : `${abs.n}\\sqrt{${r.s}}`;
  return abs.d === 1 ? `${signe}${num}` : `${signe}\\dfrac{${num}}{${abs.d}}`;
}
function radicalDepuisRacine(r: Q): Radical {
  const parts = racine(q(1), r);
  if (parts.length === 0) return { c: q(0), s: 1 };
  const [c, atome] = parts[0];
  return { c, s: atome ? Number(atome.cle.slice("sqrt:".length)) : 1 };
}
const egal = (r: Radical, c: Q, s: number) => r.s === s && r.c.n === c.n && r.c.d === c.d;

/** arctan(x) en multiple rationnel de π quand x est remarquable (0, 1, √3, √3/3), sinon atome. */
function arctanMultiplePi(x: Radical): Q | null {
  if (x.c.n === 0) return q(0);
  const signe = x.c.n < 0 ? -1 : 1;
  const r: Radical = { c: x.c.n < 0 ? neg(x.c) : x.c, s: x.s };
  if (egal(r, q(1), 1)) return q(signe, 4);
  if (egal(r, q(1), 3)) return q(signe, 3);
  if (egal(r, q(1, 3), 3)) return q(signe, 6);
  return null;
}
function arctanAtome(x: Radical): Atome {
  const l = x.s === 1 && x.c.d === 1 ? `\\arctan(${x.c.n})` : `\\arctan\\left(${radicalL(x)}\\right)`;
  return { cle: `atan:${x.c.n}/${x.c.d}/${x.s}`, latex: l, valeur: Math.atan(val(x.c) * Math.sqrt(x.s)), rang: 700 + val(x.c) * Math.sqrt(x.s) / 1000 };
}
function arctan(c: Q, x: Radical): Part[] {
  const m = arctanMultiplePi(x);
  if (m) return m.n === 0 ? [] : [[mul(c, m), PI]];
  if (x.c.n < 0) return arctan(neg(c), { c: neg(x.c), s: x.s });
  return [[c, arctanAtome(x)]];
}

/** arcsin(x), x rationnel de [−1 ; 1] : 0, ±1/2, ±1 remarquables. */
function arcsinMultiplePi(x: Q): Q | null {
  const a = Math.abs(val(x));
  const s = x.n < 0 ? -1 : 1;
  if (x.n === 0) return q(0);
  if (Math.abs(a - 0.5) < 1e-12) return q(s, 6);
  if (Math.abs(a - 1) < 1e-12) return q(s, 2);
  return null;
}
function arcsin(c: Q, x: Q): Part[] {
  const m = arcsinMultiplePi(x);
  if (m) return m.n === 0 ? [] : [[mul(c, m), PI]];
  if (x.n < 0) return arcsin(neg(c), neg(x));
  return [[c, { cle: `asin:${x.n}/${x.d}`, latex: `\\arcsin${argL(x)}`, valeur: Math.asin(val(x)), rang: 800 + val(x) / 1000 }]];
}

/** c·(cyclo(x))³ (6gen23 C2). */
function cycloCube(c: Q, cyclo: "arctan" | "arcsin", x: Q): Part[] {
  const m = cyclo === "arctan" ? arctanMultiplePi({ c: x, s: 1 }) : arcsinMultiplePi(x);
  if (m) return m.n === 0 ? [] : [[mul(c, puissance(m, 3)), PI3]];
  if (x.n < 0) return cycloCube(neg(c), cyclo, neg(x));
  const f = cyclo === "arctan" ? "\\arctan" : "\\arcsin";
  const v = cyclo === "arctan" ? Math.atan(val(x)) : Math.asin(val(x));
  return [[c, { cle: `${cyclo}3:${x.n}/${x.d}`, latex: `\\left(${f}${argL(x)}\\right)^{3}`, valeur: v ** 3, rang: 900 + val(x) / 1000 }]];
}

/** c·√(e^x + 1) (6gen23 C4) ; x = 0 → c√2. */
function racineExpPlusUn(c: Q, x: Q): Part[] {
  if (x.n === 0) return racine(c, q(2));
  const e = x.n === 1 && x.d === 1 ? "e" : `e^${exposantL(x)}`;
  return [[c, { cle: `sqrtexp:${x.n}/${x.d}`, latex: `\\sqrt{${e}+1}`, valeur: Math.sqrt(Math.exp(val(x)) + 1), rang: 1000 + val(x) / 1000 }]];
}

/** c·base^x / ln(base) (terme « baseX » de 6gen23 A). */
function baseSurLn(c: Q, base: number, x: Q): Part[] {
  const entier = Math.floor(val(x));
  const frac = add(x, q(-entier));
  let facteur = c;
  facteur = entier >= 0 ? mul(facteur, q(base ** entier)) : mul(facteur, q(1, base ** -entier));
  const num = frac.n === 0 ? "" : frac.n === 1 && frac.d === 2 ? `\\sqrt{${base}}` : `${base}^${exposantL(frac)}`;
  return [[facteur, { cle: `bx:${base}:${frac.n}/${frac.d}`, latex: num, denominateur: `\\ln(${base})`, valeur: base ** val(frac) / Math.log(base), rang: 1100 + base }]];
}

// ============================================================================
// F(x) exacte par famille (x rationnel).
// ============================================================================

function primitiveExacte(e: ExerciceCalculPrimitives, x: Q): Part[] | null {
  if (e.famille === "A" && e.sousType === "direct") {
    const parts: Part[] = [];
    for (const t of e.termes) {
      const c = q(t.coef);
      switch (t.type) {
        case "invX":
          parts.push(...lnAbs(c, x));
          break;
        case "puissance": {
          const n = t.n as number;
          parts.push([mul(q(t.coef, n + 1), puissance(x, n + 1)), null]);
          break;
        }
        case "expX":
          parts.push(...expo(c, x));
          break;
        case "cosX":
          parts.push(...sinus(c, x));
          break;
        case "baseX":
          parts.push(...baseSurLn(c, t.base as number, x));
          break;
        case "arctanTerme":
          parts.push(...arctan(c, { c: x, s: 1 }));
          break;
        case "arcsinTerme":
          parts.push(...arcsin(c, x));
          break;
        case "constante":
          parts.push([mul(c, x), null]);
          break;
      }
    }
    return parts;
  }
  if (e.famille === "A" && e.sousType === "diviserFraction") {
    const pr = e.p - e.r;
    const qr = e.q - e.r;
    return [
      [mul(q(e.a, pr + 1), puissance(x, pr + 1)), null],
      [mul(q(e.b, qr + 1), puissance(x, qr + 1)), null],
    ];
  }
  if (e.famille === "A" && e.sousType === "diviserProduit") {
    // c/(k + 3/2) · x^{k+3/2} = 2c/(2k + 3) · x^{k+1} · √x.
    return racine(mul(q(2 * e.c, 2 * e.k + 3), puissance(x, e.k + 1)), x);
  }
  if (e.famille === "B") {
    const facteur = depuis(e.facteurAjustement);
    if (!facteur) return null;
    const u = e.typeU === "affine" ? add(mul(q(e.mAffine as number), x), q(e.nAffine as number)) : add(puissance(x, e.pPuissance as number), q(e.cPuissance as number));
    switch (e.typeG) {
      case "puissance": {
        const n = e.nG as number;
        return [[mul(mul(facteur, q(1, n + 1)), puissance(u, n + 1)), null]];
      }
      case "invU":
        return lnAbs(facteur, u);
      case "expU":
        return expo(facteur, u);
      case "cosU":
        return sinus(facteur, u);
      case "sinU":
        return cosinus(neg(facteur), u);
      case "invUsq":
        return arctan(facteur, { c: u, s: 1 });
      case "invSqrtU":
        return arcsin(facteur, u);
    }
    return null;
  }
  if (e.famille === "C") {
    if (e.sousType === "1") {
      // (k/a²)·((2/5)u^{5/2} − b(2/3)u^{3/2}) = (k/a²)·((2/5)u² − (2b/3)u)·√u.
      const u = add(mul(q(e.a), x), q(e.b));
      const poly = add(mul(q(2, 5), puissance(u, 2)), mul(q(-2 * e.b, 3), u));
      return racine(mul(q(e.k, e.a * e.a), poly), u);
    }
    if (e.sousType === "2") return cycloCube(q(e.k, 3), e.cyclo, x);
    if (e.sousType === "3") return arctan(q(2 * e.k), radicalDepuisRacine(x));
    return racineExpPlusUn(q(2 * e.k), x);
  }
  if (e.famille === "G") {
    if (e.sousType === "1") return [...lnAbs(q(e.A), add(x, q(-e.r1))), ...lnAbs(q(e.B), add(x, q(-e.r2)))];
    if (e.sousType === "2") return [[add(mul(q(1, 2), puissance(x, 2)), mul(q(e.d), x)), null], ...lnAbs(q(e.e), add(x, q(-e.r)))];
    if (e.sousType === "3") {
      const B = depuis(e.B / 2);
      if (!B) return null;
      return [...lnAbs(q(e.A), x), ...lnAbs(B, add(puissance(x, 2), q(1))), ...arctan(q(e.D), { c: x, s: 1 })];
    }
    return arctan(q(e.gamma, e.m), { c: mul(add(x, q(e.h)), q(1, e.m)), s: 1 });
  }
  return null;
}

// ============================================================================
// Combinaison réduite et rendu LaTeX.
// ============================================================================

export interface ValeurExacte {
  /** LaTeX réduit (« 3\ln(2) - 1 », « \dfrac{\pi}{4} », « \dfrac{7}{3} »). */
  latex: string;
  /** Aucun atome : entier ou fraction (ce que la calculatrice affiche telle quelle). */
  rationnel: boolean;
  valeur: number;
  /** Termes (coefficient, atome) — pour multiplier la combinaison (valeur moyenne). */
  termes: Part[];
}

function reduire(parts: Part[]): Part[] {
  const parCle = new Map<string, Part>();
  for (const [c, a] of parts) {
    const cle = a ? a.cle : "";
    const avant = parCle.get(cle);
    parCle.set(cle, avant ? [add(avant[0], c), a] : [c, a]);
  }
  const atomes = [...parCle.values()].filter(([c, a]) => a !== null && c.n !== 0).sort((x, y) => (x[1] as Atome).rang - (y[1] as Atome).rang);
  const rationnel = parCle.get("");
  return rationnel && rationnel[0].n !== 0 ? [...atomes, rationnel] : atomes;
}

function termeL(c: Q, a: Atome | null): string {
  const abs = c.n < 0 ? neg(c) : c;
  if (!a) return fractionL(abs);
  if (a.denominateur) {
    const numerateur = abs.n === 1 ? a.latex || "1" : a.latex ? `${abs.n}${/^\d/.test(a.latex) ? "\\cdot " : ""}${a.latex}` : `${abs.n}`;
    return `\\dfrac{${numerateur}}{${abs.d === 1 ? "" : abs.d}${a.denominateur}}`;
  }
  const corps = abs.n === 1 ? a.latex : `${abs.n}${a.latex}`;
  return abs.d === 1 ? corps : `\\dfrac{${corps}}{${abs.d}}`;
}

function latexDe(termes: Part[]): string {
  if (termes.length === 0) return "0";
  return termes
    .map(([c, a], i) => {
      const t = termeL(c, a);
      if (i === 0) return c.n < 0 ? `-${t}` : t;
      return c.n < 0 ? ` - ${t}` : ` + ${t}`;
    })
    .join("");
}

function valeurDe(termes: Part[]): number {
  return termes.reduce((s, [c, a]) => s + val(c) * (a ? a.valeur : 1), 0);
}

function construire(termes: Part[], attendue: number): ValeurExacte | null {
  const reduits = reduire(termes);
  const valeur = valeurDe(reduits);
  if (!(Math.abs(valeur - attendue) <= 1e-9 * Math.max(1, Math.abs(attendue)))) return null;
  return { latex: latexDe(reduits), rationnel: reduits.every(([, a]) => a === null), valeur: attendue, termes: reduits };
}

/** Valeur exacte de ∫ₐᵇ f = F(b) − F(a) ; `null` si une famille n'est pas couverte ou si le contrôle
 * numérique échoue. */
export function valeurExacteIntegrale(primitive: ExerciceCalculPrimitives, a: number, b: number): ValeurExacte | null {
  try {
    const qa = depuis(a);
    const qb = depuis(b);
    if (!qa || !qb) return null;
    const Fb = primitiveExacte(primitive, qb);
    const Fa = primitiveExacte(primitive, qa);
    if (!Fb || !Fa) return null;
    const termes: Part[] = [...Fb, ...Fa.map(([c, at]): Part => [neg(c), at])];
    return construire(termes, primitive.primitiveReference(b) - primitive.primitiveReference(a));
  } catch {
    return null;
  }
}

/** La même valeur multipliée par un rationnel (valeur moyenne : × 1/(b − a)). */
export function multiplierValeurExacte(v: ValeurExacte, facteur: number): ValeurExacte | null {
  const f = depuis(facteur);
  if (!f) return null;
  return construire(
    v.termes.map(([c, a]): Part => [mul(c, f), a]),
    v.valeur * facteur,
  );
}
