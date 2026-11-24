/**
 * 5gen27 — dérivée d'un produit ou d'un quotient sous forme RÉDUITE (audit 5e ch. 5, G10 : la réponse
 * de référence de la brève, du barème, du papier et de l'écran était la formule u'v + uv' recopiée,
 * « (2·√x − 2x·1/(2√x)) / (√x)² »). Calcul symbolique minimal sur des TERMES de la forme
 * c · x^(p/2) · (ax + b)^(e/2) · trig(αx + β) : produit de termes (coefficients multipliés, exposants
 * ajoutés), quotient mis au même dénominateur (fractions internes chassées), termes semblables
 * regroupés quand ils ne contiennent que des puissances de x. Affichage seulement : la vérification
 * de l'élève reste une équivalence numérique.
 */
import type { AtomeDerivable } from "../../core5e/fonctionDerivee.types";
import { formatPolynomeLatex } from "../domaineDefinition/polynome";

interface Lin {
  a: number;
  b: number;
  /** Exposant × 2 (1 = racine, 2 = puissance 1, −1 = 1/racine…). */
  e2: number;
}

interface Terme {
  num: number;
  den: number;
  /** Exposant de x × 2. */
  p2: number;
  lins: Lin[];
  trig?: { fn: "sin" | "cos"; a: number; b: number; puissance: number };
}

function pgcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x || 1;
}

function normaliser(t: Terme): Terme {
  const g = pgcd(t.num, t.den);
  const s = t.den < 0 ? -1 : 1;
  return { ...t, num: (s * t.num) / g, den: (s * t.den) / g, lins: t.lins.filter((l) => l.e2 !== 0) };
}

const trivial = (at: AtomeDerivable) => at.interieurA === 1 && at.interieurB === 0;

export function termeAtome(at: AtomeDerivable): Terme {
  const base: Terme = { num: at.coeff, den: 1, p2: 0, lins: [] };
  switch (at.noyau.type) {
    case "monome":
      return trivial(at) ? { ...base, p2: 2 * at.noyau.exposant } : { ...base, lins: [{ a: at.interieurA, b: at.interieurB, e2: 2 * at.noyau.exposant }] };
    case "racine":
      return trivial(at) ? { ...base, p2: 1 } : { ...base, lins: [{ a: at.interieurA, b: at.interieurB, e2: 1 }] };
    case "trig":
      return { ...base, trig: { fn: at.noyau.fonction, a: at.interieurA, b: at.interieurB, puissance: 1 } };
  }
}

export function termeDeriveeAtome(at: AtomeDerivable): Terme {
  const a = at.interieurA;
  switch (at.noyau.type) {
    case "monome": {
      const n = at.noyau.exposant;
      if (trivial(at)) return normaliser({ num: at.coeff * n, den: 1, p2: 2 * (n - 1), lins: [] });
      return normaliser({ num: at.coeff * n * a, den: 1, p2: 0, lins: [{ a, b: at.interieurB, e2: 2 * (n - 1) }] });
    }
    case "racine":
      return trivial(at) ? normaliser({ num: at.coeff, den: 2, p2: -1, lins: [] }) : normaliser({ num: at.coeff * a, den: 2, p2: 0, lins: [{ a, b: at.interieurB, e2: -1 }] });
    case "trig": {
      const fn = at.noyau.fonction === "sin" ? "cos" : "sin";
      const signe = at.noyau.fonction === "sin" ? 1 : -1;
      return { num: signe * at.coeff * a, den: 1, p2: 0, lins: [], trig: { fn, a, b: at.interieurB, puissance: 1 } };
    }
  }
}

function memeLin(l: Lin, m: Lin) {
  return l.a === m.a && l.b === m.b;
}

function multiplier(t: Terme, u: Terme): Terme {
  const lins = t.lins.map((l) => ({ ...l }));
  for (const m of u.lins) {
    const x = lins.find((l) => memeLin(l, m));
    if (x) x.e2 += m.e2;
    else lins.push({ ...m });
  }
  let trig = t.trig ? { ...t.trig } : u.trig ? { ...u.trig } : undefined;
  if (t.trig && u.trig) {
    if (t.trig.fn === u.trig.fn && t.trig.a === u.trig.a && t.trig.b === u.trig.b) trig = { ...t.trig, puissance: t.trig.puissance + u.trig.puissance };
    else throw new Error("deriveeReduite : deux fonctions trigonométriques différentes");
  }
  return normaliser({ num: t.num * u.num, den: t.den * u.den, p2: t.p2 + u.p2, lins, trig });
}

function oppose(t: Terme): Terme {
  return { ...t, num: -t.num };
}

/** Dénominateur : coefficient puis facteurs ; « (2x+1) » seul n'a pas besoin de parenthèses. */
function denominateurLatex(coeff: number, bas: string[]): string {
  if (coeff === 1 && bas.length === 1 && /^\([^()]*\)$/.test(bas[0])) return bas[0].slice(1, -1);
  return `${coeff === 1 && bas.length > 0 ? "" : coeff}${bas.join("")}`;
}

function linLatex(l: Lin): string {
  return formatPolynomeLatex([l.b, l.a], "x");
}

/** Facteurs « positifs » (numérateur) et « négatifs » (dénominateur), sans coefficient. */
function facteurs(t: Terme): { haut: string[]; bas: string[] } {
  const haut: string[] = [];
  const bas: string[] = [];
  const puissanceX = (p2: number, liste: string[]) => {
    const k = Math.floor(p2 / 2);
    if (k === 1) liste.push("x");
    else if (k > 1) liste.push(`x^{${k}}`);
    if (p2 % 2 === 1) liste.push("\\sqrt{x}");
  };
  if (t.p2 > 0) puissanceX(t.p2, haut);
  if (t.p2 < 0) puissanceX(-t.p2, bas);
  for (const l of t.lins) {
    const e = Math.abs(l.e2);
    const liste = l.e2 > 0 ? haut : bas;
    const k = Math.floor(e / 2);
    const corps = linLatex(l);
    if (k === 1) liste.push(`(${corps})`);
    else if (k > 1) liste.push(`(${corps})^{${k}}`);
    if (e % 2 === 1) liste.push(`\\sqrt{${corps}}`);
  }
  if (t.trig) {
    const arg = t.trig.a === 1 && t.trig.b === 0 ? "x" : linLatex({ a: t.trig.a, b: t.trig.b, e2: 2 });
    const fn = t.trig.fn === "sin" ? "\\sin" : "\\cos";
    haut.push(t.trig.puissance === 1 ? `${fn}(${arg})` : `${fn}^{${t.trig.puissance}}(${arg})`);
  }
  return { haut, bas };
}

/** Terme signé, en LaTeX (« -\dfrac{3x^{2}}{2\sqrt{x}} », « 6\sqrt{x}\cos(3x-1) »). */
export function termeLatex(t: Terme): string {
  const { haut, bas } = facteurs(t);
  const signe = t.num < 0 ? "-" : "";
  const n = Math.abs(t.num);
  const corpsHaut = haut.join("");
  if (bas.length === 0 && t.den === 1) return `${signe}${n === 1 && corpsHaut !== "" ? "" : n}${corpsHaut}`;
  const numerateur = `${n === 1 && corpsHaut !== "" ? "" : n}${corpsHaut}`;
  const denominateur = denominateurLatex(t.den, bas);
  return `${signe}\\dfrac{${numerateur}}{${denominateur}}`;
}

function joindre(termes: string[]): string {
  return termes.map((s, i) => (i === 0 ? s : s.startsWith("-") ? ` - ${s.slice(1)}` : ` + ${s}`)).join("");
}

/** Termes qui ne diffèrent que par le coefficient : regroupés (2√x + 4√x = 6√x). */
function regrouper(termes: Terme[]): Terme[] {
  const cle = (t: Terme) => JSON.stringify({ p2: t.p2, lins: t.lins, trig: t.trig });
  const out: Terme[] = [];
  for (const t of termes) {
    const x = out.find((u) => cle(u) === cle(t));
    if (x) {
      const num = x.num * t.den + t.num * x.den;
      const den = x.den * t.den;
      Object.assign(x, normaliser({ ...x, num, den }));
    } else out.push({ ...t });
  }
  return out.filter((t) => t.num !== 0);
}

/** Un facteur (ax + b) d'exposant 1 sans trig : développé (pour regrouper avec les autres termes). */
function developper(t: Terme): Terme[] {
  const i = t.lins.findIndex((l) => l.e2 === 2);
  if (i < 0 || t.trig) return [t];
  const l = t.lins[i];
  const reste = t.lins.filter((_, j) => j !== i);
  return [normaliser({ ...t, num: t.num * l.a, lins: reste, p2: t.p2 + 2 }), normaliser({ ...t, num: t.num * l.b, lins: reste })].filter((u) => u.num !== 0);
}

/** Plus petit facteur qui chasse les dénominateurs internes (coefficients, √x, x, (ax + b)^k). */
function denominateurCommun(termes: Terme[]): Terme {
  let den = 1;
  let p2 = 0;
  const lins: Lin[] = [];
  for (const t of termes) {
    den = (den * t.den) / pgcd(den, t.den);
    p2 = Math.max(p2, -t.p2);
    for (const l of t.lins) {
      if (l.e2 >= 0) continue;
      const x = lins.find((m) => memeLin(m, l));
      if (x) x.e2 = Math.max(x.e2, -l.e2);
      else lins.push({ ...l, e2: -l.e2 });
    }
  }
  return { num: den, den: 1, p2, lins };
}

function sommeLatex(termes: Terme[]): string {
  return joindre(termes.map(termeLatex));
}

/** u'v + uv' : termes réduits ; sans fonction trigonométrique, une seule fraction (termes regroupés). */
export function deriveeProduitReduiteLatex(A: AtomeDerivable, B: AtomeDerivable): string {
  const termes = [multiplier(termeDeriveeAtome(A), termeAtome(B)), multiplier(termeAtome(A), termeDeriveeAtome(B))];
  if (termes.some((t) => t.trig)) return sommeLatex(regrouper(termes));
  const D = denominateurCommun(termes);
  if (D.num === 1 && D.p2 === 0 && D.lins.length === 0) return sommeLatex(regrouper(termes.flatMap(developper)));
  const numerateur = regrouper(termes.map((t) => multiplier(t, D)).flatMap(developper));
  return fraction(numerateur, D);
}

function fraction(numerateur: Terme[], denominateur: Terme): string {
  // Facteur numérique commun du numérateur simplifié avec celui du dénominateur.
  const g = numerateur.reduce((acc, t) => pgcd(acc, t.num), denominateur.num);
  const num = numerateur.map((t) => ({ ...t, num: t.num / g }));
  const den = { ...denominateur, num: denominateur.num / g };
  // Signe : numérateur « positif » d'abord (un seul terme négatif → signe devant).
  let signe = "";
  if (num.every((u) => u.num < 0)) {
    signe = "-";
    num.forEach((u, i) => (num[i] = oppose(u)));
  }
  const { bas } = facteurs({ ...den, lins: den.lins.map((l) => ({ ...l, e2: -l.e2 })), p2: -den.p2 });
  const denLatex = denominateurLatex(den.num, bas);
  const numLatex = sommeLatex(num);
  if (denLatex === "1") return `${signe}${numLatex}`;
  return `${signe}\\dfrac{${numLatex}}{${denLatex}}`;
}

/** (u'v − uv') / v² : fractions internes chassées, termes semblables regroupés. */
export function deriveeQuotientReduiteLatex(A: AtomeDerivable, B: AtomeDerivable): string {
  const v = termeAtome(B);
  const termes = [multiplier(termeDeriveeAtome(A), v), oppose(multiplier(termeAtome(A), termeDeriveeAtome(B)))];
  const D = denominateurCommun(termes);
  const numerateur = regrouper(termes.map((t) => multiplier(t, D)).flatMap(developper));
  const v2 = multiplier(v, v);
  // Dénominateur total : D · v² ; x^p de v² et du numérateur simplifiés quand tous les termes du
  // numérateur en contiennent.
  let den = multiplier(D, v2);
  const pMin = Math.min(...numerateur.map((t) => t.p2));
  if (pMin > 0 && den.p2 > 0) {
    const k = Math.min(pMin, den.p2) - (Math.min(pMin, den.p2) % 2);
    if (k > 0) {
      numerateur.forEach((t) => (t.p2 -= k));
      den = { ...den, p2: den.p2 - k };
    }
  }
  // Puissance de x² ou x³ au dénominateur : écrite comme facteur, jamais comme exposant négatif.
  const enBas: Terme = { ...den, p2: -den.p2, lins: den.lins.map((l) => ({ ...l, e2: -l.e2 })) };
  return fractionAvecTrig(numerateur, enBas, den.num, den.trig);
}

function fractionAvecTrig(numerateur: Terme[], enBas: Terme, coeff: number, trig: Terme["trig"]): string {
  const g = numerateur.reduce((acc, t) => pgcd(acc, t.num), coeff);
  const num = numerateur.map((t) => ({ ...t, num: t.num / g }));
  const c = coeff / g;
  let signe = "";
  if (num.every((u) => u.num < 0)) {
    signe = "-";
    num.forEach((u, i) => (num[i] = oppose(u)));
  }
  const bas = facteurs({ ...enBas, trig: undefined, num: 1, den: 1 }).bas;
  if (trig) {
    const arg = trig.a === 1 && trig.b === 0 ? "x" : formatPolynomeLatex([trig.b, trig.a], "x");
    bas.push(`${trig.fn === "sin" ? "\\sin" : "\\cos"}^{${trig.puissance}}(${arg})`);
  }
  const denLatex = denominateurLatex(c, bas);
  const numLatex = sommeLatex(num);
  if (denLatex === "1") return `${signe}${numLatex}`;
  return `${signe}\\dfrac{${numLatex}}{${denLatex}}`;
}
