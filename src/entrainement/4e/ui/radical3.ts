/**
 * Nombres de la forme p + r·√3 (p, r rationnels) — angles de 30°, 60°, 120° et 150° des droites du
 * 4e ch. 7 (gen42 « angle avec Ox / Oy », gen46 ; décision 4 de l'audit) : tan 30° = √3/3,
 * tan 60° = √3. Les calculs restent en flottants (comme pour les fractions, retrouvées par
 * `formatFractionIrreductible`) ; l'AFFICHAGE retrouve la forme exacte p + r√3. Jamais de décimal
 * imprimé pour une valeur irrationnelle de cette forme.
 */

const RACINE3 = Math.sqrt(3);
const DEN_MAX = 12;

function pgcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : pgcd(b, a % b);
}

export interface Rationnel {
  n: number;
  d: number;
}

function rationnelProche(v: number): Rationnel | null {
  for (let d = 1; d <= DEN_MAX; d++) {
    const n = v * d;
    if (Math.abs(n - Math.round(n)) < 1e-9) {
      const nn = Math.round(n);
      const g = pgcd(nn, d) || 1;
      return { n: nn / g, d: d / g };
    }
  }
  return null;
}

/** v = p + r√3 avec r ≠ 0 (dénominateurs ≤ 12), sinon null (v rationnel ou autre irrationnel). */
export function decomposer3(v: number): { p: Rationnel; r: Rationnel } | null {
  if (!Number.isFinite(v)) return null;
  if (rationnelProche(v) !== null) return null;
  for (let d = 1; d <= DEN_MAX; d++) {
    for (let n = 1; n <= 12 * d; n++) {
      if (pgcd(n, d) !== 1) continue;
      for (const s of [1, -1]) {
        const r = (s * n) / d;
        const p = rationnelProche(v - r * RACINE3);
        if (p !== null) return { p, r: { n: s * n, d } };
      }
    }
  }
  return null;
}

export function estRadical3(v: number): boolean {
  return decomposer3(v) !== null;
}

function fracLatex(r: Rationnel, dfrac: boolean): string {
  const f = dfrac ? "\\dfrac" : "\\frac";
  const abs = Math.abs(r.n);
  const corps = r.d === 1 ? String(abs) : `${f}{${abs}}{${r.d}}`;
  return r.n < 0 ? `-${corps}` : corps;
}

/** r√3 en LaTeX : « \sqrt{3} », « -2\sqrt{3} », « \dfrac{\sqrt{3}}{3} », « -\dfrac{2\sqrt{3}}{3} ». */
function radicalLatex(r: Rationnel, dfrac: boolean): string {
  const f = dfrac ? "\\dfrac" : "\\frac";
  const abs = Math.abs(r.n);
  const num = `${abs === 1 ? "" : abs}\\sqrt{3}`;
  const corps = r.d === 1 ? num : `${f}{${num}}{${r.d}}`;
  return r.n < 0 ? `-${corps}` : corps;
}

/** Valeur p + r√3 en LaTeX (« 2-3\sqrt{3} », « \dfrac{\sqrt{3}}{3} ») ; null si v n'est pas de
 * cette forme avec r ≠ 0. */
export function latexRadical3(v: number, dfrac = true): string | null {
  const dec = decomposer3(v);
  if (!dec) return null;
  const rad = radicalLatex(dec.r, dfrac);
  if (dec.p.n === 0) return rad;
  return `${fracLatex(dec.p, dfrac)}${rad.startsWith("-") ? rad : `+${rad}`}`;
}

/** Vrai si v = p + r√3 avec p ≠ 0 ET r ≠ 0 (somme : jamais un facteur sans parenthèses). */
export function estMixte3(v: number): boolean {
  const dec = decomposer3(v);
  return dec !== null && dec.p.n !== 0;
}

/** Parties rationnelle et radicale (p, r√3) de v — `null` si v n'est pas de cette forme. */
export function parties3(v: number): { rationnelle: number; radicale: number } | null {
  const dec = decomposer3(v);
  if (!dec) return null;
  const rationnelle = dec.p.n / dec.p.d;
  return { rationnelle, radicale: v - rationnelle };
}

/** Écriture en texte (« √3 », « −2√3 », « √3/3 », « 2 − 3√3 ») pour une saisie d'exemple ou un
 * message (jamais en LaTeX). */
export function texteRadical3(v: number): string | null {
  const dec = decomposer3(v);
  if (!dec) return null;
  const abs = Math.abs(dec.r.n);
  const rad = `${abs === 1 ? "" : abs}√3${dec.r.d === 1 ? "" : `/${dec.r.d}`}`;
  const p = dec.p.n === 0 ? "" : `${dec.p.d === 1 ? dec.p.n : `${dec.p.n}/${dec.p.d}`}`.replace("-", "−");
  if (p === "") return `${dec.r.n < 0 ? "−" : ""}${rad}`;
  return `${p} ${dec.r.n < 0 ? "−" : "+"} ${rad}`;
}
