import { parserNombreOuFraction } from "./verificationAnalyseFonction";
import type { StatutVerification } from "./statutVerification";
import type { ChampAttendu } from "../ui/formatDiagrammesTrompeurs";

/**
 * Vérification de gen111 : chaque champ attend un nombre EXACT (fréquences au plus à une décimale,
 * angles et effectifs entiers, évolutions entières) — tolérance minime contre le bruit flottant.
 * La saisie n'est jamais filtrée pendant la frappe (CLAUDE.md) : ici seulement, on ignore les
 * espaces, un « + » initial, le signe « % » ou « ° » et l'unité du contexte écrite après le nombre.
 * Une saisie illisible donne `parse_error` (aucune tentative comptée par l'appli).
 */

const TOLERANCE = 1e-6;

export function lireNombre(saisie: string, unite: string): number | null {
  let s = saisie.trim().toLowerCase();
  if (unite && unite !== "%" && unite !== "°" && s.endsWith(unite.toLowerCase())) s = s.slice(0, -unite.length);
  s = s.replace(/[\s  ]/g, "").replace(/[%°]$/, "").replace(/^\+/, "");
  if (s === "") return null;
  return parserNombreOuFraction(s);
}

export function statutChamp(saisie: string, champ: ChampAttendu): StatutVerification {
  const v = lireNombre(saisie, champ.unite);
  if (v === null) return "parse_error";
  return Math.abs(v - champ.attendu) <= TOLERANCE ? "correct" : "not_equivalent";
}
