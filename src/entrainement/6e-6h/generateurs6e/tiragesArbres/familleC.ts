import type { CibleEcran3Special, ExerciceFamilleC, ExerciceFamilleCParite, ExerciceFamilleCSpecial, FractionExacte, NombreFacesDe } from "../../core6e/tiragesArbres.types";

/**
 * Couche A (6e) — génération famille C (dé truqué) pour `6gen31`. Dé à N ∈ {4, 6, 8} faces.
 *
 * **`"special"`** — la face `faceSpeciale` a une probabilité CONNUE `p0`, les N − 1 autres ont une
 * même probabilité `p`, inconnue. On tire `p = k/((N−1)m)` puis `p0 = (m−k)/m`, d'où
 * `p0 + (N−1)p = 1` exactement.
 *
 * **`"parite"`** — faces paires ≡ `p` chacune, faces impaires ≡ `q` chacune ; l'énoncé dit en mots
 * que l'un des deux types est r fois plus probable que l'autre (r ∈ {2,3,4,5}). L'élève traduit
 * cette phrase en équation et écrit l'équation de normalisation (audit 6e ch. 6 : on ne fait plus
 * « poser » une relation déjà écrite dans l'énoncé).
 */

const M_SPECIAL: readonly number[] = [4, 5, 6, 7, 8];
const K_SPECIAL: readonly number[] = [1, 2, 3];
const R_PARITE: readonly number[] = [2, 3, 4, 5];
const FACES_DE: readonly NombreFacesDe[] = [4, 6, 8];
const FACES_PAIRES: readonly number[] = [2, 4, 6];
const FACES_IMPAIRES: readonly number[] = [1, 3, 5];
const CIBLES_ECRAN3_PARITE: readonly ("pair" | "impair" | "sousEnsemble")[] = ["pair", "impair", "sousEnsemble"];
const CIBLES_ECRAN3_SPECIAL: readonly CibleEcran3Special[] = ["deuxFaces", "pair", "impair"];

function tirerEntier(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}

function tirerFacesDistinctes(count: number, faces: number): number[] {
  const tirees: number[] = [];
  while (tirees.length < count) {
    const f = tirerEntier(1, faces);
    if (!tirees.includes(f)) tirees.push(f);
  }
  return tirees.sort((x, y) => x - y);
}

/** Construction pour le sous-type "special" : p = k/((N−1)m), p0 = (m−k)/m, d'où p0 + (N−1)p = 1.
 * Signature `(m, k)` conservée (6gen33, famille G : dé à 6 faces, écran 3 « deux faces »). Un couple
 * (m, k, N) qui rendrait le dé équilibré (p0 = p) est remplacé par k − 1 (ou k + 1). */
export function construireFamilleCSpecial(m: number, k: number, faces: NombreFacesDe = 6, ecran3Cible: CibleEcran3Special = "deuxFaces"): ExerciceFamilleCSpecial {
  let kk = Math.min(k, m - 1);
  if ((m - kk) * (faces - 1) === kk) kk = kk > 1 ? kk - 1 : kk + 1;
  const p: FractionExacte = { num: kk, den: (faces - 1) * m };
  const p0: FractionExacte = { num: m - kk, den: m };
  const faceSpeciale = tirerEntier(1, faces);
  let autreFace = tirerEntier(1, faces);
  while (autreFace === faceSpeciale) autreFace = tirerEntier(1, faces);
  return { famille: "C", sousType: "special", faceSpeciale, p0, p, autreFace, faces, ecran3Cible };
}

/** Variante "special" entièrement tirée (nombre de faces, m, k, question de l'écran 3). */
export function genererFamilleCSpecial(): ExerciceFamilleCSpecial {
  return construireFamilleCSpecial(tirerParmi(M_SPECIAL), tirerParmi(K_SPECIAL), tirerParmi(FACES_DE), tirerParmi(CIBLES_ECRAN3_SPECIAL));
}

/** Construction pour le sous-type "parite" : h = N/2 faces paires et h impaires. Si les faces
 * paires sont r fois plus probables : p = r·q et h·p + h·q = 1, d'où q = 1/(h(r+1)), p = r/(h(r+1)) ;
 * symétriquement si ce sont les impaires. */
export function construireFamilleCParite(
  r: number,
  ecran3Cible: "pair" | "impair" | "sousEnsemble" = tirerParmi(CIBLES_ECRAN3_PARITE),
  faces: NombreFacesDe = tirerParmi(FACES_DE),
  plusProbable: "pair" | "impair" = tirerParmi(["pair", "impair"] as const),
): ExerciceFamilleCParite {
  const h = faces / 2;
  const den = h * (r + 1);
  const fort: FractionExacte = { num: r, den };
  const faible: FractionExacte = { num: 1, den };
  const p = plusProbable === "pair" ? fort : faible;
  const q = plusProbable === "pair" ? faible : fort;
  const sousEnsemble = ecran3Cible === "sousEnsemble" ? tirerFacesDistinctes(tirerEntier(2, 3), faces) : undefined;
  return { famille: "C", sousType: "parite", r, plusProbable, p, q, faces, ecran3Cible, sousEnsemble };
}

/** Variante "parite" entièrement tirée (r, nombre de faces, sens du rapport). */
export function genererFamilleCParite(ecran3Cible?: "pair" | "impair" | "sousEnsemble"): ExerciceFamilleCParite {
  return construireFamilleCParite(tirerParmi(R_PARITE), ecran3Cible);
}

/** Tirage équiprobable du sous-type, puis de ses paramètres. */
export function genererFamilleC(): ExerciceFamilleC {
  return Math.random() < 0.5 ? genererFamilleCSpecial() : genererFamilleCParite();
}

// ============================================================================
// Calculs purs — réutilisés par les TESTS de ce fichier (voir `familleA.ts`, même principe).
// ============================================================================

export function faceEstPaire(face: number): boolean {
  return face % 2 === 0;
}

export { FACES_IMPAIRES, FACES_PAIRES };
