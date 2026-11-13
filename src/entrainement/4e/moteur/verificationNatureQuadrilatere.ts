import type { ExerciceNatureQuadrilatere, NatureQuadrilatere } from "../core/natureQuadrilatere.types";
import type { Composantes, Point } from "../core/vecteur.types";
import { evaluerExpressionGenerale } from "./expressionGenerale";
import { critereABBC, natureDe, normeCarree, quatriemeSommetFaux, vecAB, vecBC, vecDC } from "./modeleNatureQuadrilatere";

/**
 * Vérification de gen84. Champs libres (composantes, coordonnées, normes, critère) : lus par le même
 * évaluateur que gen26 (`evaluerExpressionGenerale` : entier, décimal à virgule, fraction, « rac(…) »,
 * « √ », « sqrt(…) ») ; une saisie illisible rend `parse_error` et ne consomme jamais de tentative
 * (c'est l'appli qui ne l'envoie pas à la session). Diagnostics ciblés : vecteur pris dans le mauvais
 * sens (BA, CD), D obtenu avec AB = CD, norme donnée au carré ou en valeur approchée, critère de
 * signe opposé (BA au lieu de AB). L'écran de conclusion est un choix fermé (une tentative).
 */

const TOLERANCE = 1e-6;

/** Valeur numérique d'une saisie, ou `null` si elle est vide ou illisible. */
export function lireValeur(texte: string): number | null {
  const s = texte
    .trim()
    .replace(/[−–—]/g, "-")
    .replace(/√\(/g, "sqrt(")
    .replace(/√\s*(\d+(?:[.,]\d+)?)/g, "sqrt($1)");
  if (s === "") return null;
  try {
    const v = evaluerExpressionGenerale(s, 0);
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

function proche(a: number, b: number): boolean {
  return Math.abs(a - b) <= TOLERANCE;
}

export type StatutChamp = "correct" | "faux" | "parse_error";

export interface SaisiePaire {
  x: string;
  y: string;
}

export const PAIRE_VIDE: SaisiePaire = { x: "", y: "" };

/** Statut d'un vecteur (ou d'un point) saisi : chaque champ, et l'erreur reconnue s'il y en a une. */
export interface DiagnosticPaire {
  x: StatutChamp;
  y: StatutChamp;
  /** `oppose` : le vecteur opposé (mauvais sens) ; `cd` : D obtenu avec AB = CD. */
  erreur: "oppose" | "cd" | null;
}

function diagnostiquerPaire(saisie: SaisiePaire, attendu: Composantes | Point, reconnu: { valeur: Composantes | Point; erreur: "oppose" | "cd" } | null): DiagnosticPaire {
  const x = lireValeur(saisie.x);
  const y = lireValeur(saisie.y);
  const statut = (v: number | null, cible: number): StatutChamp => (v === null ? "parse_error" : proche(v, cible) ? "correct" : "faux");
  const sx = statut(x, attendu.x);
  const sy = statut(y, attendu.y);
  const estReconnu = reconnu !== null && x !== null && y !== null && proche(x, reconnu.valeur.x) && proche(y, reconnu.valeur.y) && !(sx === "correct" && sy === "correct");
  return { x: sx, y: sy, erreur: estReconnu ? reconnu!.erreur : null };
}

function opposeDe(v: Composantes): Composantes {
  return { x: -v.x, y: -v.y };
}

export function paireCorrecte(d: DiagnosticPaire): boolean {
  return d.x === "correct" && d.y === "correct";
}

export function paireIllisible(d: DiagnosticPaire): boolean {
  return d.x === "parse_error" || d.y === "parse_error";
}

// ---------------------------------------------------------------------------------------------
// Écran 1 — parallélogramme (AB et DC) ou quatrième sommet (AB et D)
// ---------------------------------------------------------------------------------------------

export interface DiagnosticEcran1 {
  ab: DiagnosticPaire;
  /** DC (variantes « nature » / « montrer ») ou D (variante « quatrième sommet »). */
  second: DiagnosticPaire;
}

export function diagnostiquerEcran1(e: ExerciceNatureQuadrilatere, ab: SaisiePaire, second: SaisiePaire): DiagnosticEcran1 {
  const vab = vecAB(e);
  const dAb = diagnostiquerPaire(ab, vab, { valeur: opposeDe(vab), erreur: "oppose" });
  if (e.variante === "quatrieme") {
    return { ab: dAb, second: diagnostiquerPaire(second, e.D, { valeur: quatriemeSommetFaux(e), erreur: "cd" }) };
  }
  const vdc = vecDC(e);
  return { ab: dAb, second: diagnostiquerPaire(second, vdc, { valeur: opposeDe(vdc), erreur: "oppose" }) };
}

// ---------------------------------------------------------------------------------------------
// Écran 2 — composantes de BC, normes de AB et de BC
// ---------------------------------------------------------------------------------------------

/** `carre` : la norme donnée au carré (racine oubliée) ; `approche` : valeur décimale approchée. */
export type StatutNorme = "correct" | "carre" | "approche" | "faux" | "parse_error";

export function diagnostiquerNorme(texte: string, carreAttendu: number): StatutNorme {
  const v = lireValeur(texte);
  if (v === null) return "parse_error";
  const cible = Math.sqrt(carreAttendu);
  if (proche(v, cible)) return "correct";
  if (proche(v, carreAttendu)) return "carre";
  if (Math.abs(v - cible) < 0.01) return "approche";
  return "faux";
}

export interface DiagnosticEcran2 {
  bc: DiagnosticPaire;
  normeAB: StatutNorme;
  normeBC: StatutNorme;
}

export function diagnostiquerEcran2(e: ExerciceNatureQuadrilatere, bc: SaisiePaire, normeAB: string, normeBC: string): DiagnosticEcran2 {
  const vbc = vecBC(e);
  return {
    bc: diagnostiquerPaire(bc, vbc, { valeur: opposeDe(vbc), erreur: "oppose" }),
    normeAB: diagnostiquerNorme(normeAB, normeCarree(vecAB(e))),
    normeBC: diagnostiquerNorme(normeBC, normeCarree(vbc)),
  };
}

// ---------------------------------------------------------------------------------------------
// Écran 3 — critère d'orthogonalité de AB et BC
// ---------------------------------------------------------------------------------------------

/** `signe` : l'opposé du critère (BA au lieu de AB, ou CB au lieu de BC). */
export type StatutCritere = "correct" | "signe" | "faux" | "parse_error";

export function diagnostiquerCritere(e: ExerciceNatureQuadrilatere, texte: string): StatutCritere {
  const v = lireValeur(texte);
  if (v === null) return "parse_error";
  const cible = critereABBC(e);
  if (proche(v, cible)) return "correct";
  if (cible !== 0 && proche(v, -cible)) return "signe";
  return "faux";
}

// ---------------------------------------------------------------------------------------------
// Écran 4 — conclusion (choix fermé)
// ---------------------------------------------------------------------------------------------

export function verifierNature(e: ExerciceNatureQuadrilatere, choix: NatureQuadrilatere): boolean {
  return natureDe(e) === choix;
}
