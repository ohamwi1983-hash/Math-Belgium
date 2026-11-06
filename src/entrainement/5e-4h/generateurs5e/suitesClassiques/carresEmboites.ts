import type { ExerciceCarresEmboites } from "../../core5e/suitesClassiques.types";
import { sommeInfinie, termeGeometrique } from "../suitesGeometriques/parametres";
import { choisirParmi, entierAleatoire } from "./aleatoire";

/** Partages de la partie a : (nombre de petits carrés, nombre coloriés à chaque étape). (4, 1) est
 * la figure classique (fraction colorée 1/3). */
export const PARTAGES_CARRES: readonly { parts: number; colorees: number }[] = [
  { parts: 4, colorees: 1 },
  { parts: 4, colorees: 2 },
  { parts: 9, colorees: 1 },
  { parts: 9, colorees: 2 },
  { parts: 9, colorees: 4 },
];

/** Scénario 7 — des carrés emboîtés (2 parties indépendantes).
 *
 * Partie a — un carré d'aire 1 partagé en p petits carrés égaux ; on en colorie c, puis on
 * recommence dans un petit carré non colorié… Fractions coloriées : c/p, c/p², … (u₁ = c/p, raison
 * 1/p), somme infinie c/(p − 1).
 * Partie b — en joignant les milieux des côtés d'un carré de côté a (2 à 10 cm), on obtient un
 * carré d'aire moitié : aires a², a²/2, a²/4… (raison 1/2), somme infinie 2a². */
export function construireCarresEmboites(partage = choisirParmi(PARTAGES_CARRES), coteB: number = entierAleatoire(2, 10)): ExerciceCarresEmboites {
  const u1A = partage.colorees / partage.parts;
  const qA = 1 / partage.parts;
  const sommeInfinieA = sommeInfinie(u1A, qA) ?? 0;

  const qB = 1 / 2;
  const u1B = coteB * coteB;
  const airesB: [number, number, number] = [termeGeometrique(u1B, qB, 1), termeGeometrique(u1B, qB, 2), termeGeometrique(u1B, qB, 3)];
  const sommeInfinieB = sommeInfinie(u1B, qB) ?? 0;

  return { scenario: "carresEmboites", partsA: partage.parts, coloreesA: partage.colorees, u1A, qA, sommeInfinieA, qB, coteB, airesB, sommeInfinieB };
}
