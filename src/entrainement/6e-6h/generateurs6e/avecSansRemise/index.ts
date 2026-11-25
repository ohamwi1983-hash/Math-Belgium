import type { ContexteASR, EvenementASR, ExerciceASR, ModeleASR } from "../../core6e/avecSansRemise";
import { ecartModeles, EVENEMENTS_ASR } from "../../core6e/avecSansRemise";
import { entier, melanger, parmi } from "../../ui6e/nombresCombinatoireLotH2";

/**
 * Couche A — générateur de `6gen108` « Avec ou sans remise ? Choisir le modèle ». `Math.random()` seul
 * (le `?code=` rejoue le tirage). Le MODÈLE (verdict de l'écran 1) est tiré EN PREMIER à parts égales,
 * puis l'événement (la `forme`), le contexte (la variante), les nombres (écart entre les deux modèles
 * ≥ 0,001) et enfin l'ordre des deux options.
 */

export const CATALOGUE_VARIANTES: { id: ContexteASR; label: string }[] = [
  { id: "urne", label: "Urne (boules rouges)" },
  { id: "cartes", label: "Jeu de 32 cartes (as ou cœurs)" },
  { id: "lot", label: "Contrôle d'un lot (pièces défectueuses)" },
  { id: "classe", label: "Élèves interrogés (devoir non fait)" },
];

function nombres(v: ContexteASR): { N: number; K: number; sorte: number } {
  switch (v) {
    case "urne": {
      const N = parmi([10, 12, 15, 20]);
      return { N, K: entier(3, Math.floor(N / 2)), sorte: 0 };
    }
    case "cartes": {
      const sorte = Math.random() < 0.5 ? 0 : 1;
      return { N: 32, K: sorte === 0 ? 4 : 8, sorte };
    }
    case "lot":
      return { N: parmi([20, 25, 30, 40]), K: entier(3, 8), sorte: 0 };
    case "classe":
      return { N: entier(20, 26), K: entier(4, 9), sorte: 0 };
  }
}

export function construire(v: ContexteASR, modele: ModeleASR = Math.random() < 0.5 ? "binomiale" : "hypergeometrique", evenement: EvenementASR = parmi(EVENEMENTS_ASR)): ExerciceASR {
  for (;;) {
    const { N, K, sorte } = nombres(v);
    const n = entier(3, 5);
    const j = evenement === "exactement" ? entier(1, Math.min(n - 1, K)) : 0;
    const e: ExerciceASR = { variante: v, modele, evenement, N, K, n, j, sorte, options: ["binomiale", "hypergeometrique"] };
    if (ecartModeles(e) < 0.001) continue;
    return { ...e, options: melanger<ModeleASR>(["binomiale", "hypergeometrique"]) };
  }
}

export function construireAvecVariante(id: string): ExerciceASR {
  const v = CATALOGUE_VARIANTES.find((x) => x.id === id);
  return construire(v ? v.id : parmi(CATALOGUE_VARIANTES).id);
}

export function genererExerciceASR(): ExerciceASR {
  const modele: ModeleASR = Math.random() < 0.5 ? "binomiale" : "hypergeometrique";
  return construire(parmi(CATALOGUE_VARIANTES).id, modele);
}
