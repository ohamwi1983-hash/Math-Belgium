/**
 * Couche A (5e) — 5gen8 : "Paramètres d'une fonction sinusoïdale". Forme canonique
 * f(x) = A·sin((2π/T)(x-φ)) + b, affichée soit développée (f(x)=A·sin(Bx+C)+b, B=2π/T, C=-2πφ/T,
 * majoritaire) soit pré-factorisée (T/φ lisibles directement, minoritaire — 1 tirage sur 4).
 */
import type { ExerciceParametresSinusoide, FormeAffichageSinusoide } from "../../core5e/parametresSinusoide.types";
import { tirerParametresBase } from "./parametres";
import { calculerB, calculerC } from "./rationnelPi";

export const CATALOGUE_FORMES: { id: FormeAffichageSinusoide; label: string }[] = [
  { id: "developpee", label: "Forme développée (A·sin(Bx+C)+b)" },
  { id: "prefactorisee", label: "Forme pré-factorisée (A·sin((2π/T)(x-φ))+b)" },
];

const POIDS_PREFACTORISEE = 0.25;

function tirerForme(): FormeAffichageSinusoide {
  return Math.random() < POIDS_PREFACTORISEE ? "prefactorisee" : "developpee";
}

export function construireAvecFormeId(forme: FormeAffichageSinusoide): ExerciceParametresSinusoide {
  const base = tirerParametresBase();
  const B = calculerB(base.T);
  const C = calculerC(B, base.phi);
  return { ...base, forme, B, C };
}

export function genererExerciceParametresSinusoide(): ExerciceParametresSinusoide {
  return construireAvecFormeId(tirerForme());
}
