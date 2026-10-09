import type { ContexteFamilleA, ExerciceFamilleA_Problemes } from "../../core6e/integralesProblemes.types";

/**
 * Couche A (6e) — famille A de `6gen29` : intégration numérique par la méthode des trapèzes,
 * NOUVEAUTÉ CENTRALE de ce générateur (profil connu uniquement par points discrets, aucune
 * expression analytique — contrairement à TOUT le reste du chapitre 4, toujours parti d'une f(x)
 * fermée). Génération pure Couche A, aucune dépendance à un autre générateur.
 */

function entierEntre(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

/** Profil de hauteurs y0..yn, entiers dans [8;12], garanti NON monotone (réaliste — un vrai terrain
 * irrégulier ne varie jamais dans un seul sens) : retire tant que la suite est monotone (croissante
 * ou décroissante au sens large). */
function tirerProfil(n: number): number[] {
  for (;;) {
    const y = Array.from({ length: n + 1 }, () => entierEntre(8, 12));
    const croissant = y.every((v, i) => i === 0 || v >= y[i - 1]);
    const decroissant = y.every((v, i) => i === 0 || v <= y[i - 1]);
    if (!croissant && !decroissant) return y;
  }
}

function avecValeursAttendues(base: Omit<ExerciceFamilleA_Problemes, "sommeAttendue" | "valeurFinaleAttendue">): ExerciceFamilleA_Problemes {
  const exercice = { ...base, sommeAttendue: 0, valeurFinaleAttendue: 0 };
  exercice.sommeAttendue = sommeTrapezes(exercice);
  exercice.valeurFinaleAttendue = valeurFinaleA(exercice);
  return exercice;
}

export function construireFamilleA_Terrain(): ExerciceFamilleA_Problemes {
  const n = Math.random() < 0.5 ? 6 : 8;
  return avecValeursAttendues({ famille: "A", contexte: "terrain", n, deltaX: 1, y: tirerProfil(n), dimensionSupplementaire: null });
}

export function construireFamilleA_Mur(): ExerciceFamilleA_Problemes {
  const n = Math.random() < 0.5 ? 6 : 8;
  return avecValeursAttendues({ famille: "A", contexte: "mur", n, deltaX: 1, y: tirerProfil(n), dimensionSupplementaire: entierEntre(2, 5) });
}

const CONSTRUCTEURS_PAR_CONTEXTE: Record<ContexteFamilleA, () => ExerciceFamilleA_Problemes> = {
  terrain: construireFamilleA_Terrain,
  mur: construireFamilleA_Mur,
};

/** Tirage équiprobable du contexte (voir en-tête de fichier). */
export function construireFamilleA(): ExerciceFamilleA_Problemes {
  const contexte: ContexteFamilleA = Math.random() < 0.5 ? "terrain" : "mur";
  return CONSTRUCTEURS_PAR_CONTEXTE[contexte]();
}

/** Somme entre crochets de la formule des trapèzes — (y0+yn)/2 + y1+...+y_(n-1) — réponse attendue
 * de l'écran 1 (AVANT multiplication par Δx). */
export function sommeTrapezes(exercice: ExerciceFamilleA_Problemes): number {
  const { y } = exercice;
  const n = y.length - 1;
  let s = (y[0] + y[n]) / 2;
  for (let i = 1; i < n; i++) s += y[i];
  return s;
}

/** Aire (Δx·somme), AVANT multiplication par la dimension supplémentaire éventuelle. */
export function aireTrapezes(exercice: ExerciceFamilleA_Problemes): number {
  return exercice.deltaX * sommeTrapezes(exercice);
}

/** Valeur finale de l'écran 2 — aire, multipliée par la dimension supplémentaire si le contexte en
 * a une (jamais recalculée autrement que par ce produit, cohérent avec l'énoncé). */
export function valeurFinaleA(exercice: ExerciceFamilleA_Problemes): number {
  const aire = aireTrapezes(exercice);
  return exercice.dimensionSupplementaire === null ? aire : aire * exercice.dimensionSupplementaire;
}
