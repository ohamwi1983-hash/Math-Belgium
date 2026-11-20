import { add, div, mul, neg, rat, ratLatex, piLatex, val, type Rat } from "./trigExact";

/**
 * Fonction sinusoïdale EXACTE f(x) = A sin(ωx + φ) + b des générateurs 5gen50, 5gen52, 5gen53
 * (notation du cours, § 4 : φ déphasage, Φ = −φ/ω décalage horizontal, T = 2π/ω).
 *
 * Deux régimes d'axe :
 * - `radians` : ω rationnel, φ = coefficient de π ; T, Φ et les abscisses sont des multiples de π ;
 * - `sansPi` : ω = (coefficient)·π, φ = coefficient de π ; T, Φ et les abscisses sont rationnels.
 * Dans les deux cas une abscisse est un `Rat` ; `enPi` dit si elle se lit « ·π ».
 */
export interface SinusoideExacte {
  A: number;
  /** Pulsation : `omega` (régime radians) ou `omega·π` (régime sansPi). */
  omega: Rat;
  /** Déphasage, coefficient de π (dans ]−π ; π]). */
  phi: Rat;
  b: number;
  /** `true` : abscisses en multiples de π (ω sans π). */
  enPi: boolean;
}

/** Période T (coefficient de π si `enPi`, nombre sinon). */
export function periode(s: SinusoideExacte): Rat {
  return div(rat(2), s.omega);
}

/** Décalage horizontal Φ = −φ/ω. */
export function decalage(s: SinusoideExacte): Rat {
  return neg(div(s.phi, s.omega));
}

/** Abscisse exacte en LaTeX (multiple de π ou rationnel). */
export function abscisseLatex(s: SinusoideExacte, x: Rat): string {
  return s.enPi ? piLatex(x) : ratLatex(x);
}

/** Valeur numérique d'une abscisse. */
export function abscisseValeur(s: SinusoideExacte, x: Rat): number {
  return s.enPi ? val(x) * Math.PI : val(x);
}

export function evaluer(s: SinusoideExacte, x: number): number {
  const w = s.enPi ? val(s.omega) : val(s.omega) * Math.PI;
  return s.A * Math.sin(w * x + val(s.phi) * Math.PI) + s.b;
}

/** Les 5 points clés d'une période à partir de Φ : (Φ + kT/4 ; b, b + A, b, b − A, b). */
export function pointsCles(s: SinusoideExacte, depuis = 0, nombre = 5): { x: Rat; y: number }[] {
  const T = periode(s);
  const P = decalage(s);
  const ys = [s.b, s.b + s.A, s.b, s.b - s.A];
  const res: { x: Rat; y: number }[] = [];
  for (let k = depuis; k < depuis + nombre; k++) res.push({ x: add(P, mul(rat(k, 4), T)), y: ys[((k % 4) + 4) % 4]! });
  return res;
}

/** Coefficient « ωx » en LaTeX : « 2x », « x », « \dfrac{1}{2}x », « \pi x », « \dfrac{\pi}{2}x ». */
export function omegaXLatex(s: SinusoideExacte): string {
  const w = s.omega;
  if (!s.enPi) {
    if (w.n === 1 && w.d === 1) return "\\pi x";
    return `${piLatex(w)} x`;
  }
  if (w.n === 1 && w.d === 1) return "x";
  return `${ratLatex(w)}x`;
}

/** Terme « + φ » en LaTeX (vide si φ = 0). */
export function phiTermeLatex(phi: Rat): string {
  if (phi.n === 0) return "";
  return phi.n > 0 ? ` + ${piLatex(phi)}` : ` - ${piLatex(neg(phi))}`;
}

/** « f(x) = 3\sin\left(2x - \dfrac{\pi}{3}\right) + 1 » (sans « f(x) = » si `nom` est vide). */
export function expressionLatex(s: SinusoideExacte, nom = "f(x)"): string {
  const a = s.A === 1 ? "" : s.A === -1 ? "-" : String(s.A);
  const bTerme = s.b === 0 ? "" : s.b > 0 ? ` + ${s.b}` : ` - ${-s.b}`;
  const corps = `${a}\\sin\\left(${omegaXLatex(s)}${phiTermeLatex(s.phi)}\\right)${bTerme}`;
  return nom ? `${nom} = ${corps}` : corps;
}

/** « 2 », « \dfrac{1}{2} », « \pi », « \dfrac{\pi}{2} » : la pulsation telle qu'on la lit. */
export function omegaLatex(s: SinusoideExacte): string {
  return s.enPi ? ratLatex(s.omega) : piLatex(s.omega);
}
