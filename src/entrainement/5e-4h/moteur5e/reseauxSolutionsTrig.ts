/**
 * Couche B (5e) — comparaison de RÉUNIONS DE RÉSEAUX de solutions (« séries » u = c + k·p, k ∈ ℤ),
 * pour 5gen10 (audit 5e ch. 2, point 33).
 *
 * L'ancienne comparaison (`diagnostiquerBranches`, `verificationEquationTrig.ts`, partagée avec
 * 5gen11/5gen13) exige AUTANT de lignes que de branches attendues et les apparie une à une : elle
 * refuse des écritures équivalentes et correctes, par exemple
 * - sin(u) = 0 : « k·π » (une ligne) au lieu de « 2kπ ; π + 2kπ » ;
 * - cos(u) = 0 : « π/2 + kπ » au lieu de « π/2 + 2kπ ; −π/2 + 2kπ » ;
 * - sin(u) = 1 : les deux lignes que donne la formule du cours (« π/2 + 2kπ ; π − π/2 + 2kπ »), qui
 *   décrivent le même réseau.
 * Ici, on compare les ENSEMBLES de points décrits : la réunion des réseaux soumis doit être
 * exactement la réunion des réseaux attendus. Toutes les périodes étant des multiples rationnels
 * de π (2π/a, π/a avec a rationnel), les deux réunions sont périodiques de période commune L
 * (PPCM des périodes) : il suffit de comparer leurs points dans [0 ; L[.
 */
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import type { StatutVerification } from "../moteur/statutVerification";

const TOLERANCE = 0.01;
/** Au-delà, la réunion n'est pas comparée (période commune trop longue ou trop de points). */
const MAX_POINTS = 2000;
const DENOMINATEUR_MAX = 48;

export interface Reseau {
  constante: number;
  /** Peut être négative (le sens de balayage de k est arbitraire) ; jamais nulle. */
  periode: number;
}

/** Retire un « x = » ou « u = » de tête (l'élève recopie souvent le membre de gauche). */
export function sansMembreGauche(texte: string): string {
  return texte.replace(/^\s*[a-zA-Z]\s*=\s*/, "");
}

/** Lit une ligne « constante + k·période » : affine en k (vérifié en 3 points), période non nulle.
 * `null` ⟺ illisible (parse_error) ; `"nonAffine"` ⟺ lisible mais pas une série (ex. k² ou k absent). */
export function lireReseau(texte: string): Reseau | null | "nonAffine" {
  const t = sansMembreGauche(texte);
  try {
    const v = (k: number) => evaluerExpressionGenerale(t, 0, { k, n: k });
    const f0 = v(0);
    const f1 = v(1);
    const f2 = v(2);
    if (![f0, f1, f2].every(Number.isFinite)) return null;
    const periode = f1 - f0;
    if (Math.abs(f2 - 2 * f1 + f0) > 1e-6 * (1 + Math.abs(periode))) return "nonAffine";
    if (Math.abs(periode) < TOLERANCE) return "nonAffine";
    return { constante: f0, periode };
  } catch {
    return null;
  }
}

function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/** Période |p| écrite n·π/d (d ≤ 48), à `TOLERANCE` près — `null` si ce n'est pas un multiple
 * rationnel simple de π (une série dont la période n'en est pas un ne peut pas être une réponse). */
function enFractionDePi(p: number): { n: number; d: number } | null {
  const r = Math.abs(p) / Math.PI;
  for (let d = 1; d <= DENOMINATEUR_MAX; d++) {
    const n = Math.round(r * d);
    if (n > 0 && Math.abs(Math.abs(p) - (n * Math.PI) / d) <= TOLERANCE / 2) {
      const g = pgcd(n, d);
      return { n: n / g, d: d / g };
    }
  }
  return null;
}

/** PPCM de fractions réduites n/d : ppcm(n) / pgcd(d). */
function ppcmFractions(fractions: { n: number; d: number }[]): { n: number; d: number } {
  return fractions.reduce((acc, f) => {
    const n = (acc.n * f.n) / pgcd(acc.n, f.n);
    const d = pgcd(acc.d, f.d);
    return { n, d };
  });
}

/** Points de la réunion dans [0 ; L[, triés, sans doublon (à la tolérance près, circulairement). */
function pointsDansPeriode(reseaux: Reseau[], L: number): number[] | null {
  const points: number[] = [];
  for (const r of reseaux) {
    const p = Math.abs(r.periode);
    const nombre = Math.round(L / p);
    if (nombre > MAX_POINTS) return null;
    const depart = ((r.constante % p) + p) % p;
    for (let i = 0; i < nombre; i++) points.push((depart + i * p) % L);
  }
  points.sort((a, b) => a - b);
  const uniques: number[] = [];
  for (const v of points) {
    if (uniques.length === 0 || v - uniques[uniques.length - 1] > TOLERANCE) uniques.push(v);
  }
  if (uniques.length > 1 && uniques[0] + L - uniques[uniques.length - 1] <= TOLERANCE) uniques.pop();
  return uniques.length > MAX_POINTS ? null : uniques;
}

function distanceCirculaire(a: number, b: number, L: number): number {
  const d = Math.abs(a - b) % L;
  return Math.min(d, L - d);
}

/** Les deux réunions de réseaux décrivent-elles le même ensemble de points ? */
export function memesReunions(soumis: Reseau[], attendus: Reseau[]): boolean {
  if (soumis.length === 0 || attendus.length === 0) return soumis.length === attendus.length;
  const fractions = [...soumis, ...attendus].map((r) => enFractionDePi(r.periode));
  if (fractions.some((f) => f === null)) return false;
  const ppcm = ppcmFractions(fractions as { n: number; d: number }[]);
  const L = (ppcm.n * Math.PI) / ppcm.d;
  const a = pointsDansPeriode(soumis, L);
  const b = pointsDansPeriode(attendus, L);
  if (a === null || b === null || a.length !== b.length) return false;
  return a.every((v) => b.some((w) => distanceCirculaire(v, w, L) <= TOLERANCE));
}

/** Lignes soumises (une série par ligne, ordre et découpage libres) comparées à la réunion
 * attendue. */
export function diagnostiquerReunionReseaux(lignes: string[], attendus: Reseau[]): StatutVerification {
  const lus = lignes.map(lireReseau);
  if (lus.some((r) => r === null)) return "parse_error";
  if (lus.some((r) => r === "nonAffine")) return "not_equivalent";
  return memesReunions(lus as Reseau[], attendus) ? "correct" : "not_equivalent";
}
