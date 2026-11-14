import type { ExerciceFonctionAire, MorceauF } from "../core6e/fonctionAire.types";

/**
 * Couche B (6e) — modèle mathématique de `6gen78` « La fonction aire ». SOURCE UNIQUE des valeurs
 * exactes (aires signées, A(x), zéros, extremums) : l'écran, la vérification, le corrigé, le
 * barème et la figure en dérivent.
 *
 * Valeur exacte d'une aire : sommets entiers → multiple de 1/2 ; demi-disque de rayon 1 ou 2 →
 * multiple de π/4. D'où `ValeurExacte = demi/2 + quartPi·π/4`, jamais un flottant arrondi.
 */

export interface ValeurExacte {
  demi: number;
  quartPi: number;
}

export const ZERO: ValeurExacte = { demi: 0, quartPi: 0 };

export function somme(u: ValeurExacte, v: ValeurExacte): ValeurExacte {
  return { demi: u.demi + v.demi, quartPi: u.quartPi + v.quartPi };
}

export function oppose(u: ValeurExacte): ValeurExacte {
  return { demi: -u.demi, quartPi: -u.quartPi };
}

export function valeurNumerique(u: ValeurExacte): number {
  return u.demi / 2 + (u.quartPi * Math.PI) / 4;
}

export function estNulle(u: ValeurExacte): boolean {
  return u.demi === 0 && u.quartPi === 0;
}

const EPS = 1e-9;

export function bornesDomaine(e: ExerciceFonctionAire): { x0: number; xn: number } {
  const premier = e.morceaux[0];
  const dernier = e.morceaux[e.morceaux.length - 1];
  return { x0: debut(premier), xn: fin(dernier) };
}

export function debut(m: MorceauF): number {
  return m.type === "segment" ? m.x0 : m.centre - m.rayon;
}

export function fin(m: MorceauF): number {
  return m.type === "segment" ? m.x1 : m.centre + m.rayon;
}

function valeurMorceau(m: MorceauF, x: number): number {
  if (m.type === "segment") return m.y0 + ((m.y1 - m.y0) * (x - m.x0)) / (m.x1 - m.x0);
  const u = x - m.centre;
  return m.signe * Math.sqrt(Math.max(0, m.rayon * m.rayon - u * u));
}

/** f(x) ; `NaN` hors du domaine. */
export function evaluerF(e: ExerciceFonctionAire, x: number): number {
  for (const m of e.morceaux) {
    if (x >= debut(m) - EPS && x <= fin(m) + EPS) return valeurMorceau(m, Math.min(fin(m), Math.max(debut(m), x)));
  }
  return Number.NaN;
}

/** Sommets de la courbe (extrémités des morceaux), de gauche à droite, avec leur ordonnée. */
export function sommets(e: ExerciceFonctionAire): { x: number; y: number }[] {
  const res: { x: number; y: number }[] = [];
  for (const m of e.morceaux) {
    if (res.length === 0) res.push({ x: debut(m), y: valeurMorceau(m, debut(m)) });
    res.push({ x: fin(m), y: valeurMorceau(m, fin(m)) });
  }
  return res;
}

/** Abscisses où une aire exacte se calcule : sommets et centres des demi-disques. */
export function pointsDeCoupe(e: ExerciceFonctionAire): number[] {
  const xs = sommets(e).map((s) => s.x);
  for (const m of e.morceaux) if (m.type === "demiDisque") xs.push(m.centre);
  return [...new Set(xs)].sort((p, q) => p - q);
}

function integraleMorceau(m: MorceauF, u: number, v: number): ValeurExacte {
  const de = Math.max(u, debut(m));
  const a = Math.min(v, fin(m));
  if (a <= de + EPS) return ZERO;
  if (m.type === "segment") {
    // Aire signée d'un trapèze : (a − de)·(f(de) + f(a))/2, en demis.
    const demi = (a - de) * (valeurMorceau(m, de) + valeurMorceau(m, a));
    if (Math.abs(demi - Math.round(demi)) > 1e-9) throw new Error("integraleMorceau : borne hors des sommets");
    return { demi: Math.round(demi), quartPi: 0 };
  }
  const r = m.rayon;
  const entier = Math.abs(de - debut(m)) < EPS && Math.abs(a - fin(m)) < EPS;
  const quartGauche = Math.abs(de - debut(m)) < EPS && Math.abs(a - m.centre) < EPS;
  const quartDroit = Math.abs(de - m.centre) < EPS && Math.abs(a - fin(m)) < EPS;
  if (entier) return { demi: 0, quartPi: m.signe * 2 * r * r };
  if (quartGauche || quartDroit) return { demi: 0, quartPi: m.signe * r * r };
  throw new Error("integraleMorceau : borne à l'intérieur d'un demi-disque");
}

/** ∫ᵤᵛ f(t) dt, exacte — u et v parmi `pointsDeCoupe` ; orientée (u > v → opposé). */
export function integraleExacte(e: ExerciceFonctionAire, u: number, v: number): ValeurExacte {
  if (Math.abs(u - v) < EPS) return ZERO;
  if (u > v) return oppose(integraleExacte(e, v, u));
  return e.morceaux.reduce((acc, m) => somme(acc, integraleMorceau(m, u, v)), ZERO);
}

/** A(x) = ∫ₐˣ f(t) dt, exacte (x parmi `pointsDeCoupe`). */
export function aireExacte(e: ExerciceFonctionAire, x: number): ValeurExacte {
  return integraleExacte(e, e.a, x);
}

function primitiveMorceau(m: MorceauF, t: number): number {
  // ∫ de début(m) à t (t dans le morceau).
  if (m.type === "segment") return ((t - m.x0) * (m.y0 + valeurMorceau(m, t))) / 2;
  const r = m.rayon;
  const u = Math.max(-r, Math.min(r, t - m.centre));
  return m.signe * ((u * Math.sqrt(Math.max(0, r * r - u * u)) + r * r * Math.asin(u / r)) / 2 + (Math.PI * r * r) / 4);
}

function integraleDepuisX0(e: ExerciceFonctionAire, x: number): number {
  let total = 0;
  for (const m of e.morceaux) {
    if (x >= fin(m)) total += primitiveMorceau(m, fin(m));
    else {
      if (x > debut(m)) total += primitiveMorceau(m, x);
      break;
    }
  }
  return total;
}

/** A(x) numérique, pour tracer la courbe de A en tout x du domaine. */
export function aireNumerique(e: ExerciceFonctionAire, x: number): number {
  return integraleDepuisX0(e, x) - integraleDepuisX0(e, e.a);
}

/** Signe de f sur ]u ; v[ (supposé constant), lu au milieu. */
export function signeEntre(e: ExerciceFonctionAire, u: number, v: number): 1 | -1 | 0 {
  const y = evaluerF(e, (u + v) / 2);
  return y > EPS ? 1 : y < -EPS ? -1 : 0;
}

/** Zéros de f intérieurs au domaine (sommets d'ordonnée nulle), avec ou sans changement de signe. */
export function zerosInterieurs(e: ExerciceFonctionAire): { x: number; changeSigne: boolean }[] {
  const { x0, xn } = bornesDomaine(e);
  return sommets(e)
    .filter((s) => s.x > x0 + EPS && s.x < xn - EPS && Math.abs(s.y) < EPS)
    .map((s) => ({ x: s.x, changeSigne: signeEntre(e, s.x - 0.5, s.x) * signeEntre(e, s.x, s.x + 0.5) < 0 }));
}

/** Zéros de f où f change de signe (abscisses des extremums locaux de A). */
export function zerosChangementSigne(e: ExerciceFonctionAire): number[] {
  return zerosInterieurs(e)
    .filter((z) => z.changeSigne)
    .map((z) => z.x);
}

/** Morceaux monotones de f : [de ; a] et sens (+1 croissante, −1 décroissante, 0 constante). */
function morceauxMonotones(e: ExerciceFonctionAire): { de: number; a: number; sens: number }[] {
  const res: { de: number; a: number; sens: number }[] = [];
  for (const m of e.morceaux) {
    if (m.type === "segment") res.push({ de: m.x0, a: m.x1, sens: Math.sign(m.y1 - m.y0) });
    else {
      res.push({ de: m.centre - m.rayon, a: m.centre, sens: m.signe });
      res.push({ de: m.centre, a: m.centre + m.rayon, sens: -m.signe });
    }
  }
  return res;
}

/** Abscisses intérieures où f change de sens de variation (sommets « pics » de f, centres des
 * demi-disques) — les extremums de f, que l'élève confond avec ceux de A. */
export function changementsSensF(e: ExerciceFonctionAire): number[] {
  const mono = morceauxMonotones(e);
  const res: number[] = [];
  for (let i = 1; i < mono.length; i++) if (mono[i].sens !== mono[i - 1].sens) res.push(mono[i].de);
  return res;
}

/** Points du tableau de variations de A : bornes du domaine et zéros où f change de signe. */
export function pointsTableau(e: ExerciceFonctionAire): number[] {
  const { x0, xn } = bornesDomaine(e);
  return [x0, ...zerosChangementSigne(e), xn];
}

/** Intervalles de l'écran « sens de variation » : coupés aux zéros de f ET aux changements de sens
 * de f, pour que le piège « A décroît quand f décroît » soit testé sur un intervalle précis. */
export function intervallesSens(e: ExerciceFonctionAire): { de: number; a: number; sens: 1 | -1 }[] {
  const { x0, xn } = bornesDomaine(e);
  const coupes = [...new Set([x0, xn, ...zerosInterieurs(e).map((z) => z.x), ...changementsSensF(e)])].sort((p, q) => p - q);
  const res: { de: number; a: number; sens: 1 | -1 }[] = [];
  for (let i = 0; i + 1 < coupes.length; i++) {
    const s = signeEntre(e, coupes[i], coupes[i + 1]);
    res.push({ de: coupes[i], a: coupes[i + 1], sens: s >= 0 ? 1 : -1 });
  }
  return res;
}

export type NatureExtremum = "max" | "min" | "aucun";

/** Nature de A en x (intérieur) : f passe de + à − → maximum, de − à + → minimum. */
export function natureEn(e: ExerciceFonctionAire, x: number): NatureExtremum {
  const gauche = signeEntre(e, x - 0.5, x);
  const droite = signeEntre(e, x, x + 0.5);
  if (gauche > 0 && droite < 0) return "max";
  if (gauche < 0 && droite > 0) return "min";
  return "aucun";
}

/** Abscisses candidates de l'écran « extremums » : zéros de f (avec ou sans changement de signe)
 * et extremums de f — rangées. */
export function candidatsExtremums(e: ExerciceFonctionAire): number[] {
  const { x0, xn } = bornesDomaine(e);
  const xs = [...zerosInterieurs(e).map((z) => z.x), ...changementsSensF(e)].filter((x) => x > x0 + EPS && x < xn - EPS);
  return [...new Set(xs)].sort((p, q) => p - q);
}

/** Extremums locaux de A (intérieurs), rangés. */
export function extremumsA(e: ExerciceFonctionAire): { x: number; nature: "max" | "min" }[] {
  return zerosChangementSigne(e).map((x) => ({ x, nature: natureEn(e, x) as "max" | "min" }));
}

/** Les 4 graphiques candidats (variante `graphique`), indices canoniques. */
export function candidatGraphique(e: ExerciceFonctionAire, indice: number, x: number): number {
  switch (indice) {
    case 0:
      return aireNumerique(e, x);
    case 1:
      return evaluerF(e, x);
    case 2:
      return evaluerF(e, e.a) + aireNumerique(e, x);
    default:
      return -aireNumerique(e, x);
  }
}
