import type { ExerciceLimiteExponentielle, FamilleLimiteExponentielle } from "../../core6e/limitesExponentielles.types";
import { construireA } from "./familles/A";
import { construireB } from "./familles/B";
import { construireC } from "./familles/C";
import { construireG } from "./familles/G";
import { construireH } from "./familles/H";
import { construireI } from "./familles/I";
import { construireJ } from "./familles/J";
import { construireK } from "./familles/K";
import { construireL } from "./familles/L";
import { construireN } from "./familles/N";

export const CATALOGUE_FAMILLES: { id: FamilleLimiteExponentielle; label: string }[] = [
  { id: "A", label: "A — Limite directe" },
  { id: "B", label: "B — Somme, terme exponentiel dominant" },
  { id: "C", label: "C — Produit, FI ∞·0" },
  { id: "G", label: "G — ∞−∞ avancée (instance unique)" },
  { id: "H", label: "H — L'Hôpital, 0/0 pur exponentiel" },
  { id: "I", label: "I — L'Hôpital, 0/0 mixte trigonométrique" },
  { id: "J", label: "J — L'Hôpital, 0/0 mixte arcfonction" },
  { id: "K", label: "K — L'Hôpital, deux applications" },
  { id: "L", label: "L — FI 1^∞ via pivot e" },
  { id: "N", label: "N — FI ∞^0/0^0 via loi des puissances" },
];

const CONSTRUCTEURS: Record<FamilleLimiteExponentielle, () => ExerciceLimiteExponentielle> = {
  A: construireA,
  B: construireB,
  C: construireC,
  G: construireG,
  H: construireH,
  I: construireI,
  J: construireJ,
  K: construireK,
  L: construireL,
  N: construireN,
};

export function construireAvecFamilleId(familleId: FamilleLimiteExponentielle): ExerciceLimiteExponentielle {
  return CONSTRUCTEURS[familleId]();
}

/**
 * Tirage pondéré — G (poids 0,5) est nettement plus rare que les autres familles (poids 1
 * chacune), conformément à la spec : "famille tirée avec une probabilité réduite... pour éviter
 * la répétition d'une instance unique trop fréquente" (G est une INSTANCE UNIQUE codée en dur,
 * voir `familles/G.ts`).
 */
const POIDS: Record<FamilleLimiteExponentielle, number> = { A: 1, B: 1, C: 1, G: 0.5, H: 1, I: 1, J: 1, K: 1, L: 1, N: 1 };
const POIDS_TOTAL = Object.values(POIDS).reduce((s, p) => s + p, 0);

export function tirerFamillePonderee(): FamilleLimiteExponentielle {
  let tirage = Math.random() * POIDS_TOTAL;
  for (const { id } of CATALOGUE_FAMILLES) {
    tirage -= POIDS[id];
    if (tirage < 0) return id;
  }
  return CATALOGUE_FAMILLES[CATALOGUE_FAMILLES.length - 1].id;
}

export function genererExerciceLimiteExponentielle(): ExerciceLimiteExponentielle {
  return construireAvecFamilleId(tirerFamillePonderee());
}
