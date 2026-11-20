/**
 * Couche A (5e) — 5gen8 : "Paramètres d'une fonction sinusoïdale". Forme canonique
 * f(x) = A·sin((2π/T)(x-φ)) + b, affichée soit développée (f(x)=A·sin(Bx+C)+b, B=2π/T, C=-2πφ/T,
 * majoritaire) soit pré-factorisée (T/φ lisibles directement, minoritaire — 1 tirage sur 4).
 */
import type { ExerciceParametresSinusoide, FormeAffichageSinusoide } from "../../core5e/parametresSinusoide.types";
import { tirerParametresBase } from "./parametres";
import { calculerB, calculerC } from "./rationnelPi";
import type { RationnelPi } from "./rationnelPi";

export const CATALOGUE_FORMES: { id: FormeAffichageSinusoide; label: string }[] = [
  { id: "developpee", label: "Forme développée : A sin(ωx + φ) + b" },
  { id: "prefactorisee", label: "Forme pré-factorisée : A sin(ω(x − Φ)) + b" },
];

const POIDS_PREFACTORISEE = 0.25;

function tirerForme(): FormeAffichageSinusoide {
  return Math.random() < POIDS_PREFACTORISEE ? "prefactorisee" : "developpee";
}

/** Déphasage φ = C dans ]−π ; π] (décision de l'utilisateur, audit 5e ch. 2, P6) : plus de
 * « sin(2x − 6π) » ni de « faux déphasage » (C multiple de 2π, courbe non décalée mais Φ ≠ 0).
 * La part des fonctions sans déphasage (Φ = 0) reste celle de `tirerPhi` (20 %). */
const PART_SANS_DEPHASAGE = 0.2;

function dansMoinsPiPi(c: RationnelPi): boolean {
  if (c.numerateur === 0) return false;
  const enPi = c.numerateur / c.denominateur;
  return c.degrePi === 1 && enPi > -1 && enPi <= 1;
}

export function construireAvecFormeId(forme: FormeAffichageSinusoide): ExerciceParametresSinusoide {
  const sansDephasage = Math.random() < PART_SANS_DEPHASAGE;
  let base = tirerParametresBase();
  if (sansDephasage) base = { ...base, phi: { numerateur: 0, denominateur: 1, degrePi: base.T.degrePi } };
  let B = calculerB(base.T);
  let C = calculerC(B, base.phi);
  for (let i = 0; !sansDephasage && !dansMoinsPiPi(C) && i < 500; i++) {
    base = tirerParametresBase();
    B = calculerB(base.T);
    C = calculerC(B, base.phi);
  }
  return { ...base, forme, B, C };
}

export function genererExerciceParametresSinusoide(): ExerciceParametresSinusoide {
  return construireAvecFormeId(tirerForme());
}
