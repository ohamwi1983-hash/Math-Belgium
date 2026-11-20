import type { ExerciceLimiteExponentielle, FamilleLimiteExponentielle } from "../../core6e/limitesExponentielles.types";
import { construireA } from "./familles/A";
import { construireB } from "./familles/B";
import { construireC } from "./familles/C";
import { construireH } from "./familles/H";
import { construireI } from "./familles/I";
import { construireJ } from "./familles/J";
import { construireK } from "./familles/K";
import { construireL } from "./familles/L";
import { construireN } from "./familles/N";

/** `retiree` : entrée réservée (famille G retirée) — jamais affichée (sélecteur, panneau), gardée
 * pour que l'indice des variantes suivantes, donc leurs `?code=` imprimés, ne change pas. Un ancien
 * code de G rouvre un exercice tiré librement avec la même graine. */
export const CATALOGUE_FAMILLES: { id: FamilleLimiteExponentielle | "G"; label: string; retiree?: boolean }[] = [
  { id: "A", label: "A — Limite directe" },
  { id: "B", label: "B — Somme d'une exponentielle et d'un polynôme" },
  { id: "C", label: "C — Puissance de x et exponentielle (produit ou quotient)" },
  { id: "G", label: "G — (retirée : développement limité)", retiree: true },
  { id: "H", label: "H — Règle de L'Hôpital, exponentielle et affine" },
  { id: "I", label: "I — Règle de L'Hôpital, exponentielle et sinus" },
  { id: "J", label: "J — Règle de L'Hôpital, exponentielle et arcfonction" },
  { id: "K", label: "K — Règle de L'Hôpital, deux applications" },
  { id: "L", label: "L — Limites qui mènent au nombre e" },
  { id: "N", label: "N — Puissance d'une puissance" },
];

const CONSTRUCTEURS: Record<FamilleLimiteExponentielle, () => ExerciceLimiteExponentielle> = {
  A: construireA,
  B: construireB,
  C: construireC,
  H: construireH,
  I: construireI,
  J: construireJ,
  K: construireK,
  L: construireL,
  N: construireN,
};

export function construireAvecFamilleId(familleId: FamilleLimiteExponentielle | "G"): ExerciceLimiteExponentielle {
  if (familleId === "G") return genererExerciceLimiteExponentielle();
  return CONSTRUCTEURS[familleId]();
}

/**
 * Tirage pondéré — même tableau de poids qu'avant le retrait de G (G : 0,5) : quand le tirage tombe
 * sur l'emplacement de G, on retire. Un `?code=` libre déjà imprimé qui ne tombait pas sur G
 * rouvre donc exactement le même exercice qu'avant.
 */
const POIDS: Record<FamilleLimiteExponentielle | "G", number> = { A: 1, B: 1, C: 1, G: 0.5, H: 1, I: 1, J: 1, K: 1, L: 1, N: 1 };
const POIDS_TOTAL = Object.values(POIDS).reduce((s, p) => s + p, 0);

export function tirerFamillePonderee(): FamilleLimiteExponentielle {
  for (;;) {
    let tirage = Math.random() * POIDS_TOTAL;
    let choisie: FamilleLimiteExponentielle | "G" = "N";
    for (const { id } of CATALOGUE_FAMILLES) {
      tirage -= POIDS[id];
      if (tirage < 0) {
        choisie = id;
        break;
      }
    }
    if (choisie !== "G") return choisie;
  }
}

export function genererExerciceLimiteExponentielle(): ExerciceLimiteExponentielle {
  return construireAvecFamilleId(tirerFamillePonderee());
}
