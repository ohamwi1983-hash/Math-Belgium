/**
 * Contrat partagé — chapitre 3 ("Cercle trigonométrique et triangles quelconques"), générateurs 4
 * (loi des sinus), 5 (loi des cosinus), 7 (aire) et 8 (problèmes contextualisés), et le futur
 * générateur 6 (cas ambigu SSA, en attente d'une session de conception dédiée). Réutilisation
 * assumée entre plusieurs générateurs — même principe que `PolynomeLineaire` (exercice 3) ou
 * `ValeurCellule` (exercice 5) : un triangle résolu (3 côtés + 3 angles, mutuellement cohérents) est
 * une notion mathématique générique qui n'a aucune raison d'être redéfinie indépendamment à chaque
 * générateur de ce chapitre.
 *
 * Convention de nommage standard : `a`/`b`/`c` sont les longueurs des côtés, `A`/`B`/`C` les
 * angles en DEGRÉS (jamais en radians, convention exclusive de ce chapitre) — `a` est TOUJOURS le
 * côté opposé à l'angle `A` (donc BC), `b` opposé à `B` (AC), `c` opposé à `C` (AB). `A+B+C=180`
 * toujours (à la tolérance flottante près).
 */
export interface Triangle {
  a: number;
  b: number;
  c: number;
  A: number;
  B: number;
  C: number;
}

/** Un sommet du triangle — utilisé pour désigner un côté/angle sans dupliquer les 3 lettres. */
export type SommetTriangle = "A" | "B" | "C";

/** Un côté du triangle (a/b/c) — complément de `SommetTriangle`, pour désigner explicitement une
 * longueur plutôt qu'un angle. */
export type CoteTriangle = "a" | "b" | "c";
