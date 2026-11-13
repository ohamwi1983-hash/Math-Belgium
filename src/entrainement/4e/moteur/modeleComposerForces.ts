import type { ExerciceComposerForces, NomTriangle, SommetExtremite } from "../core/composerForces.types";

/**
 * Modèle de gen80 (« Composer deux forces ou deux vitesses ») : toutes les grandeurs exactes de
 * l'exercice, une seule source pour l'écran, les aides, la vérification, la figure et l'adaptateur
 * de feuilles. Angles en DEGRÉS.
 *
 * Sens direct — triangle O–G–C (G = extrémité du grand vecteur) : OG = grand, GC = petit (report du
 * petit vecteur), OC = résultante ; angle en G = 180° − θ ; angle en O = déviation α (entre la
 * résultante et le grand vecteur). α est TOUJOURS aigu : il est opposé au côté GC = petit, qui n'est
 * jamais le plus grand côté (petit < grand), et seul l'angle opposé au plus grand côté peut être
 * obtus — d'où le choix de demander l'angle avec le GRAND vecteur (la loi des sinus, dont l'arc
 * sinus rend toujours un angle aigu, donne alors directement la bonne valeur).
 *
 * Cap — triangle O–P–C (P = extrémité du petit vecteur) : OP = petit, PC = grand (report de la
 * vitesse propre), OC = vitesse réelle, portée par la route ; angle en O = β ; angle en C = γ (entre
 * le cap et la route), opposé à OP = petit < grand = PC (opposé à β) : γ < β et γ < 180° − β, donc
 * γ est aigu, et la loi des sinus le donne sans ambiguïté.
 */

const D2R = Math.PI / 180;

export function estCap(e: ExerciceComposerForces): boolean {
  return e.question === "cap";
}

export function sommetPetit(e: ExerciceComposerForces): SommetExtremite {
  return e.sommetGrand === "A" ? "B" : "A";
}

/** Troisième sommet du triangle utile (avec O et C). */
export function sommetCle(e: ExerciceComposerForces): SommetExtremite {
  return estCap(e) ? sommetPetit(e) : e.sommetGrand;
}

export function triangleUtile(e: ExerciceComposerForces): NomTriangle {
  return sommetCle(e) === "A" ? "OAC" : "OBC";
}

export function nombreEcrans(e: ExerciceComposerForces): number {
  return e.question === "intensite" ? 3 : 4;
}

// ---------------------------------------------------------------------------------------------
// Sens direct
// ---------------------------------------------------------------------------------------------

/** Angle du triangle utile au sommet G : 180° − θ. */
export function angleInterieur(e: ExerciceComposerForces): number {
  return 180 - e.angle;
}

function alKashi(b: number, c: number, angleDeg: number): number {
  return Math.sqrt(Math.max(0, b * b + c * c - 2 * b * c * Math.cos(angleDeg * D2R)));
}

/** Piège : θ (angle entre les vecteurs) mis directement dans Al-Kashi — c'est la longueur de
 * l'AUTRE diagonale [AB] du parallélogramme. */
export function intensiteAvecTheta(e: ExerciceComposerForces): number {
  return alKashi(e.grand, e.petit, e.angle);
}

/** Calculatrice en radians (cos de 180 − θ pris en radians). */
export function intensiteRadians(e: ExerciceComposerForces): number {
  return Math.sqrt(Math.max(0, e.grand * e.grand + e.petit * e.petit - 2 * e.grand * e.petit * Math.cos(angleInterieur(e))));
}

/** Déviation α : angle entre la résultante et le grand vecteur (sens direct). */
export function deviation(e: ExerciceComposerForces): number {
  const t = e.angle * D2R;
  return Math.atan2(e.petit * Math.sin(t), e.grand + e.petit * Math.cos(t)) / D2R;
}

// ---------------------------------------------------------------------------------------------
// Cap
// ---------------------------------------------------------------------------------------------

/** γ : angle entre le cap (direction du grand vecteur) et la route (angle en C du triangle O–P–C). */
export function angleCap(e: ExerciceComposerForces): number {
  return Math.asin((e.petit * Math.sin(e.angle * D2R)) / e.grand) / D2R;
}

/** Angle en P du triangle O–P–C : 180° − β − γ. */
export function angleSommetPetit(e: ExerciceComposerForces): number {
  return 180 - e.angle - angleCap(e);
}

/** Angle entre les deux vecteurs dans le problème du cap (supplémentaire de l'angle en P). */
export function angleEntreVecteursCap(e: ExerciceComposerForces): number {
  return e.angle + angleCap(e);
}

// ---------------------------------------------------------------------------------------------
// Commun
// ---------------------------------------------------------------------------------------------

/** Intensité de la résultante (longueur OC). */
export function intensiteResultante(e: ExerciceComposerForces): number {
  if (estCap(e)) return (e.grand * Math.sin(angleSommetPetit(e) * D2R)) / Math.sin(e.angle * D2R);
  return alKashi(e.grand, e.petit, angleInterieur(e));
}

/** Valeur numérique attendue à un écran de saisie (index 1, 2, 3 ; l'écran 0 est le choix du
 * triangle). */
export function valeurAttendue(e: ExerciceComposerForces, ecran: number): number {
  if (estCap(e)) {
    if (ecran === 1) return angleCap(e);
    if (ecran === 2) return angleSommetPetit(e);
    return intensiteResultante(e);
  }
  if (ecran === 1) return angleInterieur(e);
  if (ecran === 2) return intensiteResultante(e);
  return deviation(e);
}

/** L'écran demande-t-il une intensité (unité à choisir) ? */
export function ecranIntensite(e: ExerciceComposerForces, ecran: number): boolean {
  return estCap(e) ? ecran === 3 : ecran === 2;
}

/** Écran de l'angle intérieur EXACT (sens direct, 180° − θ, valeur entière). */
export function ecranAngleExact(e: ExerciceComposerForces, ecran: number): boolean {
  return !estCap(e) && ecran === 1;
}
