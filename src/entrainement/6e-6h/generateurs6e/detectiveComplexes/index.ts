import type {
  DonneesDetectiveComplexes,
  ExerciceDetectiveComplexes,
  ExerciceFormeTrigo,
  ExerciceModuleSomme,
  ExerciceMoivre,
  ExercicePuissance,
  ExerciceQuotient,
  ExerciceRacineProduit,
  ExerciceRacines,
  IdDescriptionComplexes,
  TypeErreurComplexes,
  VarianteDetectiveComplexes,
} from "../../core6e/detectiveComplexes.types";
import { erreurVisible, numerateurQuotient, sommeZW } from "../../moteur6e/modeleDetectiveComplexes";

/**
 * Générateur de 6gen99 « Détective d'erreurs : nombres complexes ». Tout le hasard passe par
 * `Math.random` : `genererAvecCode` (`export/codeExercice.ts`) le remplace par une graine, et le
 * QR code d'une feuille rouvre ainsi le MÊME exercice (données, ordre des descriptions).
 *
 * Variante = exercice support. Dans chaque variante, le TYPE D'ERREUR (donc la ligne fausse) est
 * tiré uniformément AVANT les nombres et avant toute boucle de rejet : c'est le verdict des écrans
 * a) et b), jamais fixé par `forme` (`profil.ts`). Les nombres sont tirés dans le MÊME ensemble
 * quel que soit le type d'erreur (sinon les données trahiraient l'erreur) :
 * - formeTrigo : racineOubliee (ligne 1) | rapportInverse (ligne 2) | quadrant (ligne 3) ;
 *   z = k·(−1 ± i√3) ou k·(−√3 ± i) — toujours a < 0 et |a| ≠ |b| ;
 * - quotient : sansConjugue (ligne 1) | denominateur (ligne 2) | numerateurI2 (ligne 3) ;
 *   quotient entier de Gauss, |c| ≠ |d| ;
 * - puissance : doubleProduit (ligne 1) | carreI2 (ligne 2) | termeATerme (ligne 3) ;
 * - moivre : moduleOublie (ligne 2) | reductionPi (ligne 3) | cosSin (ligne 4) ; arguments
 *   multiples de π/6 (jamais ±π/4 ni ±3π/4, où cos et sin se confondent au signe près) ;
 * - racines : quadrant (ligne 2) | moduleDivise (ligne 3) | pas2pi (ligne 4) ; w toujours a < 0 ;
 * - moduleSomme : carreBi (ligne 1) | sommeRacines (ligne 2) | inegaliteTriangulaire (ligne 4) ;
 *   toujours |a| > |b| ;
 * - racineProduit (« démonstration » de n = −n, demande de l'utilisateur) : une seule erreur,
 *   √(ab) = √a·√b appliquée à deux négatifs, dont la POSITION (ligne 2, 3 ou 4) est tirée,
 *   équiprobable, avant n (de 1 à 20, le même ensemble quelle que soit la position).
 *
 * Garanties (vérifiées par tirages massifs) : valeurs exactes ; l'erreur se VOIT (au moins une
 * valeur finale de la copie diffère de la bonne).
 */

function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function choisir<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)]!;
}

function melanger<T>(liste: T[]): T[] {
  const copie = [...liste];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j]!, copie[i]!];
  }
  return copie;
}

const signe = () => (Math.random() < 0.5 ? -1 : 1);
const nonNul = (max: number) => signe() * entier(1, max);

// ---------------------------------------------------------------------------------------------
// Tirage des nombres, type d'erreur déjà fixé
// ---------------------------------------------------------------------------------------------

function tirerTrigo(type: ExerciceFormeTrigo["type"]): ExerciceFormeTrigo {
  for (;;) {
    const e: ExerciceFormeTrigo = { variante: "formeTrigo", type, dir: entier(0, 3), k: entier(1, 12) };
    if (erreurVisible(e)) return e;
  }
}

function tirerQuotient(type: ExerciceQuotient["type"]): ExerciceQuotient {
  for (;;) {
    const c = nonNul(4);
    const d = nonNul(4);
    if (Math.abs(c) === Math.abs(d)) continue;
    const e: ExerciceQuotient = { variante: "quotient", type, c, d, x: nonNul(4), y: nonNul(4) };
    const { a, b } = numerateurQuotient(e);
    if (a === 0 || b === 0 || Math.abs(a) > 30 || Math.abs(b) > 30) continue;
    if (!erreurVisible(e)) continue;
    return e;
  }
}

function tirerPuissance(type: ExercicePuissance["type"]): ExercicePuissance {
  for (;;) {
    const a = nonNul(4);
    const b = nonNul(4);
    if (Math.abs(a) === Math.abs(b)) continue;
    const e: ExercicePuissance = { variante: "puissance", type, a, b };
    if (erreurVisible(e)) return e;
  }
}

const PARAMS_PI_3: [number, 1 | 2 | 3][] = [
  [4, 1],
  [5, 1],
  [7, 1],
  [8, 1],
  [4, 2],
  [5, 2],
  [4, 3],
];

function tirerMoivre(type: ExerciceMoivre["type"]): ExerciceMoivre {
  for (;;) {
    const dir = entier(0, 7);
    // Toujours |nθ| > π (une réduction de 2π est nécessaire) et |zⁿ| ≤ 1 296 :
    // ±π/6 : n de 7 à 11 (|z| = 2) ; ±π/3 : (n, k) parmi PARAMS_PI_3 ; ±2π/3 et ±5π/6 : n = 2 ou 3, |z| = 2, 4 ou 6.
    const [n, k] = dir < 2 ? [entier(7, 11), 1 as const] : dir < 4 ? choisir(PARAMS_PI_3) : [entier(2, 3), choisir([1, 2, 3] as const)];
    const e: ExerciceMoivre = { variante: "moivre", type, dir, n, k };
    if (erreurVisible(e)) return e;
  }
}

const INDICES_RACINES: { n: 3 | 4; R: number }[] = [
  { n: 3, R: 8 },
  { n: 3, R: 64 },
  { n: 3, R: 216 },
  { n: 3, R: 512 },
  { n: 4, R: 16 },
  { n: 4, R: 256 },
];

function tirerRacines(type: ExerciceRacines["type"]): ExerciceRacines {
  for (;;) {
    const { n, R } = choisir(INDICES_RACINES);
    const e: ExerciceRacines = { variante: "racines", type, dir: entier(0, 5), n, R };
    if (erreurVisible(e)) return e;
  }
}

function tirerModuleSomme(type: ExerciceModuleSomme["type"]): ExerciceModuleSomme {
  for (;;) {
    const a = signe() * entier(2, 6);
    const b = signe() * entier(1, Math.abs(a) - 1);
    const c = nonNul(6);
    const d = nonNul(6);
    const e: ExerciceModuleSomme = { variante: "moduleSomme", type, a, b, c, d };
    const { s, tt } = sommeZW(e);
    if (s === 0 || tt === 0) continue;
    // z et w jamais orthogonaux (leurre « √(|z|² + |w|²) » toujours faux) ni de même direction.
    if (a * c + b * d === 0 || a * d - b * c === 0) continue;
    if (!erreurVisible(e)) continue;
    return e;
  }
}

function tirerRacineProduit(position: ExerciceRacineProduit["position"]): ExerciceRacineProduit {
  return { variante: "racineProduit", type: "racineNegatifs", n: entier(1, 20), position };
}

// ---------------------------------------------------------------------------------------------
// Descriptions de l'écran 2 : la bonne + 3 leurres (toujours FAUX pour cette ligne)
// ---------------------------------------------------------------------------------------------

function avecOptions(d: DonneesDetectiveComplexes): ExerciceDetectiveComplexes {
  const bonne: TypeErreurComplexes = d.type;
  const leurres = [1, 2, 3].map((k) => `${bonne}_leurre${k}` as IdDescriptionComplexes);
  return { ...d, options: melanger<IdDescriptionComplexes>([bonne, ...leurres]) };
}

// ---------------------------------------------------------------------------------------------
// Catalogue de variantes (SelecteurVarianteDev, `?code=`, adaptateur de feuilles)
// ---------------------------------------------------------------------------------------------

export const CATALOGUE_VARIANTES: { id: VarianteDetectiveComplexes; label: string }[] = [
  { id: "formeTrigo", label: "Forme trigonométrique de a + bi" },
  { id: "quotient", label: "Quotient sous forme algébrique" },
  { id: "puissance", label: "Puissance (a + bi)³" },
  { id: "moivre", label: "Formule de Moivre : zⁿ" },
  { id: "racines", label: "Racines n-ièmes" },
  { id: "moduleSomme", label: "Module d'une somme |z + w|" },
  { id: "racineProduit", label: "√(ab) = √a·√b avec des négatifs (1 = −1)" },
];

export function genererDetectiveComplexes(variante: VarianteDetectiveComplexes): ExerciceDetectiveComplexes {
  switch (variante) {
    case "formeTrigo":
      return avecOptions(tirerTrigo(choisir(["racineOubliee", "rapportInverse", "quadrant"] as const)));
    case "quotient":
      return avecOptions(tirerQuotient(choisir(["sansConjugue", "denominateur", "numerateurI2"] as const)));
    case "puissance":
      return avecOptions(tirerPuissance(choisir(["doubleProduit", "carreI2", "termeATerme"] as const)));
    case "moivre":
      return avecOptions(tirerMoivre(choisir(["moduleOublie", "reductionPi", "cosSin"] as const)));
    case "racines":
      return avecOptions(tirerRacines(choisir(["quadrant", "moduleDivise", "pas2pi"] as const)));
    case "moduleSomme":
      return avecOptions(tirerModuleSomme(choisir(["carreBi", "sommeRacines", "inegaliteTriangulaire"] as const)));
    case "racineProduit":
      return avecOptions(tirerRacineProduit(choisir([2, 3, 4] as const)));
  }
}

export function construireAvecVariante(id: string): ExerciceDetectiveComplexes {
  if (!CATALOGUE_VARIANTES.some((v) => v.id === id)) return genererExerciceDetectiveComplexes();
  return genererDetectiveComplexes(id as VarianteDetectiveComplexes);
}

/** Tirage libre : une variante au hasard. */
export function genererExerciceDetectiveComplexes(): ExerciceDetectiveComplexes {
  return genererDetectiveComplexes(choisir(CATALOGUE_VARIANTES).id);
}
