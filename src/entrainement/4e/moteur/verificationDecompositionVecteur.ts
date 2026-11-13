import type { ExerciceComposantes, ExerciceGraphique, SystemeOption } from "../core/decompositionVecteur.types";
import { combinaison, nettoyer } from "./modeleDecompositionVecteur";

/**
 * Vérification de gen82. Choix fermés (point M, système, verdict) : une tentative. Champs libres
 * (coefficients, composantes, k) : un nombre entier, décimal (virgule ou point) ou une fraction
 * « 3/2 » ; signe moins typographique accepté (`normaliserSigneMoins` côté saisie). Une saisie
 * illisible (`parse_error`) ne consomme jamais de tentative (c'est l'appli qui ne l'envoie pas à la
 * session). Les erreurs typiques reçoivent un statut propre (message ciblé) : signe, coefficients
 * échangés (mélange des deux directions), lecture en cases au lieu de la longueur du vecteur,
 * solution qui ne vérifie qu'une équation, k inversé.
 */

/** Nombre saisi (entier, décimal, fraction p/q) ; `null` si illisible. */
export function lireNombre(texte: string): number | null {
  const s = texte.trim().replace(/\s+/g, "").replace(/[−–—]/g, "-").replace(",", ".");
  if (s === "") return null;
  const frac = /^([+-]?)(\d+(?:\.\d+)?)\/([+-]?)(\d+(?:\.\d+)?)$/.exec(s);
  if (frac) {
    const den = Number(frac[4]);
    if (den === 0) return null;
    const signe = (frac[1] === "-" ? -1 : 1) * (frac[3] === "-" ? -1 : 1);
    return nettoyer((signe * Number(frac[2])) / den);
  }
  if (!/^[+-]?(\d+(\.\d*)?|\.\d+)$/.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? nettoyer(n) : null;
}

function egal(x: number, y: number): boolean {
  return Math.abs(x - y) < 1e-9;
}

// ---------------------------------------------------------------------------------------------
// Famille graphique
// ---------------------------------------------------------------------------------------------

export function verifierPoint(e: ExerciceGraphique, choix: string): boolean {
  return choix === e.pointM;
}

export type StatutCoefficient = "correct" | "signe" | "melange" | "echelle" | "faux" | "parse_error";

/** Écran 1 (a) ou 2 (b). */
export function diagnostiquerCoefficient(e: ExerciceGraphique, ecran: 1 | 2, texte: string): StatutCoefficient {
  const x = lireNombre(texte);
  if (x === null) return "parse_error";
  const attendu = ecran === 1 ? e.a : e.b;
  const autre = ecran === 1 ? e.b : e.a;
  if (egal(x, attendu)) return "correct";
  if (attendu !== 0 && egal(x, -attendu)) return "signe";
  if (!egal(autre, attendu) && (egal(x, autre) || (autre !== 0 && egal(x, -autre)))) return "melange";
  if (attendu !== 0 && (egal(x, 2 * attendu) || egal(x, attendu / 2) || egal(Math.abs(x), Math.abs(2 * attendu)))) return "echelle";
  return "faux";
}

// ---------------------------------------------------------------------------------------------
// Famille composantes
// ---------------------------------------------------------------------------------------------

export function verifierSysteme(choix: SystemeOption): boolean {
  return choix === "correct";
}

export function verifierVerdict(e: ExerciceComposantes, possible: boolean): boolean {
  return possible === e.possible;
}

export type StatutResolution = "correct" | "inverse" | "signe" | "une_equation" | "faux" | "parse_error";

export interface DiagnosticResolution {
  statut: StatutResolution;
  aJuste: boolean;
  bJuste: boolean;
}

export function diagnostiquerResolution(e: ExerciceComposantes, texteA: string, texteB: string): DiagnosticResolution {
  const a = lireNombre(texteA);
  const b = lireNombre(texteB);
  if (a === null || b === null) return { statut: "parse_error", aJuste: false, bJuste: false };
  const A = e.a!;
  const B = e.b!;
  const aJuste = egal(a, A);
  const bJuste = egal(b, B);
  if (aJuste && bJuste) return { statut: "correct", aJuste, bJuste };
  if (!egal(A, B) && egal(a, B) && egal(b, A)) return { statut: "inverse", aJuste, bJuste };
  if (egal(Math.abs(a), Math.abs(A)) && egal(Math.abs(b), Math.abs(B))) return { statut: "signe", aJuste, bJuste };
  const eq1 = egal(a * e.v.x + b * e.w.x, e.u.x);
  const eq2 = egal(a * e.v.y + b * e.w.y, e.u.y);
  if (eq1 !== eq2) return { statut: "une_equation", aJuste, bJuste };
  return { statut: "faux", aJuste, bJuste };
}

export type StatutVerification = "correct" | "faux" | "parse_error";

export interface DiagnosticVerification {
  statut: StatutVerification;
  /** Composantes justes : a·v (x, y) puis b·w (x, y). */
  justes: boolean[];
}

export function diagnostiquerVerification(e: ExerciceComposantes, textes: string[]): DiagnosticVerification {
  const valeurs = textes.map(lireNombre);
  if (valeurs.some((x) => x === null)) return { statut: "parse_error", justes: textes.map(() => false) };
  const { av, bw } = combinaison(e);
  const attendus = [av.x, av.y, bw.x, bw.y];
  const justes = valeurs.map((x, i) => egal(x!, attendus[i]!));
  return { statut: justes.every(Boolean) ? "correct" : "faux", justes };
}

export type StatutK = "correct" | "inverse" | "signe" | "faux" | "parse_error";

export function diagnostiquerK(e: ExerciceComposantes, texte: string): StatutK {
  const k = lireNombre(texte);
  if (k === null) return "parse_error";
  const K = e.k!;
  if (egal(k, K)) return "correct";
  if (egal(k, 1 / K)) return "inverse";
  if (egal(k, -K) || egal(k, -1 / K)) return "signe";
  return "faux";
}
