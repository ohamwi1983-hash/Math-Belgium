import type { Coefficients, ExerciceDemontrerVecteurs, IdBase, IdConclusion, Rationnel, VecteurNomme } from "../core/demontrerVecteurs.types";
import { cEgaux, cFois, cPlus, coefficientColinearite, coefficientsVecteur, divise, egaux, estNul, oppose, positions, q } from "./modeleDemontrerVecteurs";
import type { StatutColinearite, StatutVecteur } from "../ui/formatDemontrerVecteurs";

/**
 * Vérification EXACTE de gen85 (rationnels, jamais de tolérance). Saisie : entier, décimal (virgule
 * ou point, converti exactement : 0,5 = 1/2, mais 0,33 ≠ 1/3) ou fraction « a/b » ; signe moins
 * typographique accepté. Écran 2 : chaque vecteur est comparé à son expression CORRECTE (une erreur
 * sur l'un ne fausse pas l'autre), avec diagnostic du sens inversé et de Chasles mal enchaîné.
 */

/** Lecture exacte d'un coefficient ; `null` si illisible. */
export function lireRationnel(saisie: string): Rationnel | null {
  const s = saisie.trim().replace(/\s+/g, "").replace(/[−–—]/g, "-").replace(/,/g, ".").replace(/[()]/g, "");
  if (s === "") return null;
  const decimal = (t: string): Rationnel | null => {
    const m = /^(\d+)(?:\.(\d+))?$/.exec(t);
    if (!m) return null;
    const decimales = m[2] ?? "";
    if (decimales.length > 6) return null;
    return q(Number(m[1]! + decimales), 10 ** decimales.length);
  };
  const m = /^([+-]?)([\d.]+)(?:\/([+-]?)([\d.]+))?$/.exec(s);
  if (!m) return null;
  const num = decimal(m[2]!);
  if (!num) return null;
  let r = num;
  if (m[4] !== undefined) {
    const den = decimal(m[4]);
    if (!den || estNul(den)) return null;
    r = divise(num, den);
    if (m[3] === "-") r = oppose(r);
  }
  return m[1] === "-" ? oppose(r) : r;
}

export function verifierBase(id: IdBase): boolean {
  return id === "adaptee";
}

export function verifierConclusion(id: IdConclusion): boolean {
  return id === "juste";
}

/** Saisie d'un vecteur utile : coefficients de u (AB) et de v (AD ou AC), en texte. */
export interface SaisieVecteur {
  x: string;
  y: string;
}

export type DiagnosticVecteur = StatutVecteur | "parse_error";

export function diagnostiquerVecteur(e: ExerciceDemontrerVecteurs, vec: VecteurNomme, saisie: SaisieVecteur): DiagnosticVecteur {
  const x = lireRationnel(saisie.x);
  const y = lireRationnel(saisie.y);
  if (!x || !y) return "parse_error";
  const lu: Coefficients = { x, y };
  const attendu = coefficientsVecteur(e, vec);
  if (cEgaux(lu, attendu)) return "correct";
  if (cEgaux(lu, cFois(q(-1), attendu))) return "signe";
  // Chasles mal enchaîné : XY = XA + AY écrit AX + AY.
  if (vec.de !== "A") {
    const p = positions(e);
    if (cEgaux(lu, cPlus(p[vec.vers]!, p[vec.de]!))) return "chasles";
  }
  return "faux";
}

export function diagnostiquerExpressions(e: ExerciceDemontrerVecteurs, saisies: [SaisieVecteur, SaisieVecteur]): DiagnosticVecteur[] {
  return [diagnostiquerVecteur(e, e.w, saisies[0]), diagnostiquerVecteur(e, e.v, saisies[1])];
}

export type DiagnosticColinearite = StatutColinearite | "parse_error";

export function diagnostiquerColinearite(e: ExerciceDemontrerVecteurs, saisie: string): DiagnosticColinearite {
  const k = lireRationnel(saisie);
  if (!k) return "parse_error";
  const attendu = coefficientColinearite(e);
  if (egaux(k, attendu)) return "correct";
  if (!estNul(k) && egaux(k, divise(q(1), attendu))) return "inverse";
  if (egaux(k, oppose(attendu))) return "signe";
  return "faux";
}
