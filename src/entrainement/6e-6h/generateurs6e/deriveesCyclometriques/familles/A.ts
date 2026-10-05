import type { ExerciceDeriveeA, UTypeFamilleA } from "../../../core6e/deriveesCyclometriques.types";
import { ARCFONCTIONS, tirerEntier, tirerParmi } from "../aleatoire";
import { EPSILON_DENOMINATEUR, MARGE_ARCFONCTION } from "../constantes";
import { chercherPointsValides } from "../pointsEchantillon";

const TENTATIVES_MAX = 300;
const U_TYPES: readonly UTypeFamilleA[] = ["affine", "puissance", "racine", "reciproque"];
const A_AFFINE = [-4, -3, -2, 2, 3, 4] as const;
const A_RACINE = [1, 2, 3, 4] as const;
const K_PRIME = [1, 2, 3] as const;
const K = [-3, -2, -1, 1, 2, 3] as const;
const N = [2, 3] as const;

/** Argument u(x) pour le u_type donné — `null` si non défini/trop proche d'une singularité pour
 * ce x précis (racine négative, x≈0 pour réciproque). */
function argumentU(uType: UTypeFamilleA, a: number, b: number, n: number, kPrime: number, x: number): number | null {
  switch (uType) {
    case "affine":
      return a * x + b;
    case "puissance":
      return Math.pow(x, n);
    case "racine": {
      const sousRacine = a * x;
      if (sousRacine < EPSILON_DENOMINATEUR) return null;
      return Math.sqrt(sousRacine);
    }
    case "reciproque":
      if (Math.abs(x) < EPSILON_DENOMINATEUR) return null;
      return kPrime / x;
  }
}

/**
 * Famille A — f(x) = c + k·arcfonction(u(x)), u_type∈{affine,puissance,racine,reciproque}.
 * "Cible d'abord" non nécessaire ici (aucune contrainte de propreté entière sur le résultat, la
 * réponse étant une expression symbolique jamais un nombre) — reroll BORNÉ uniquement pour
 * garantir une fenêtre de points d'échantillonnage valide (voir `pointsEchantillon.ts`).
 */
export function construireA(): ExerciceDeriveeA {
  for (let tentative = 0; tentative < TENTATIVES_MAX; tentative++) {
    const arcfonction = tirerParmi(ARCFONCTIONS);
    const uType = tirerParmi(U_TYPES);
    const a = uType === "affine" ? tirerParmi(A_AFFINE) : uType === "racine" ? tirerParmi(A_RACINE) : 0;
    const b = uType === "affine" ? tirerEntier(-5, 5) : 0;
    const n = uType === "puissance" ? tirerParmi(N) : 0;
    const kPrime = uType === "reciproque" ? tirerParmi(K_PRIME) : 0;
    const c = tirerEntier(-5, 5);
    const k = tirerParmi(K);

    const pointsEchantillonnage = chercherPointsValides((x) => {
      const u = argumentU(uType, a, b, n, kPrime, x);
      if (u === null || !Number.isFinite(u)) return false;
      return Math.abs(u) < MARGE_ARCFONCTION;
    });
    if (pointsEchantillonnage === null) continue;

    return { famille: "A", arcfonction, uType, a, b, n, kPrime, c, k, pointsEchantillonnage };
  }
  throw new Error("construireA : aucune combinaison valide trouvée après retirage");
}
