/**
 * Couche A (5e) — point d'entrée de 5gen20. 4 familles à fréquence comparable (`POIDS`) ; le
 * panneau dev expose 7 entrées (4 familles + les sous-cas des familles 2/3) pour forcer chaque
 * scénario manuellement, `POIDS`/tirage pondéré n'agissant que sur les 4 VRAIES familles.
 */
import type { ExerciceLimite } from "../../core5e/limites.types";
import { genererExerciceFormeIndeterminee } from "./formeIndeterminee";
import { genererExerciceLimiteInfiniePoint } from "./infiniePoint";
import { genererExerciceLimiteInfini } from "./infini";
import { genererExerciceLimiteReelle } from "./limiteReelle";

export type FamilleLimiteId = "limiteReelle" | "formeIndeterminee" | "limiteInfiniePoint" | "limiteInfini";

export const CATALOGUE_FAMILLES: { id: string; label: string }[] = [
  { id: "limiteReelle", label: "Nombre réel" },
  { id: "formeIndeterminee", label: "Forme 0/0" },
  { id: "limiteInfiniePoint-racineSimple", label: "Limite infinie en un point — racine simple" },
  { id: "limiteInfiniePoint-racineDouble", label: "Limite infinie en un point — racine double" },
  { id: "limiteInfini-degresEgaux", label: "Limite à l'infini — degrés égaux" },
  { id: "limiteInfini-numerateurPlusGrand", label: "Limite à l'infini — numérateur plus grand" },
  { id: "limiteInfini-numerateurPlusPetit", label: "Limite à l'infini — numérateur plus petit" },
];

export function construireAvecFamilleId(id: string): ExerciceLimite {
  switch (id) {
    case "limiteReelle":
      return genererExerciceLimiteReelle();
    case "formeIndeterminee":
      return genererExerciceFormeIndeterminee();
    case "limiteInfiniePoint-racineSimple":
      return genererExerciceLimiteInfiniePoint("racineSimple");
    case "limiteInfiniePoint-racineDouble":
      return genererExerciceLimiteInfiniePoint("racineDouble");
    case "limiteInfini-degresEgaux":
      return genererExerciceLimiteInfini("degresEgaux");
    case "limiteInfini-numerateurPlusGrand":
      return genererExerciceLimiteInfini("numerateurPlusGrand");
    case "limiteInfini-numerateurPlusPetit":
      return genererExerciceLimiteInfini("numerateurPlusPetit");
    default:
      throw new Error(`construireAvecFamilleId : id inconnu "${id}"`);
  }
}

const POIDS: Record<FamilleLimiteId, number> = {
  limiteReelle: 1,
  formeIndeterminee: 1,
  limiteInfiniePoint: 1,
  limiteInfini: 1,
};
const TOTAL_POIDS = Object.values(POIDS).reduce((a, b) => a + b, 0);

function tirerFamillePonderee(): FamilleLimiteId {
  let tirage = Math.random() * TOTAL_POIDS;
  for (const [famille, poids] of Object.entries(POIDS) as [FamilleLimiteId, number][]) {
    if (tirage < poids) return famille;
    tirage -= poids;
  }
  return "formeIndeterminee";
}

export function genererExerciceLimite(): ExerciceLimite {
  switch (tirerFamillePonderee()) {
    case "limiteReelle":
      return genererExerciceLimiteReelle();
    case "formeIndeterminee":
      return genererExerciceFormeIndeterminee();
    case "limiteInfiniePoint":
      return genererExerciceLimiteInfiniePoint();
    case "limiteInfini":
      return genererExerciceLimiteInfini();
  }
}
