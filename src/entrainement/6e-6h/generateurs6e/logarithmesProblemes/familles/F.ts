import type { ExerciceLogProbF } from "../../../core6e/logarithmesProblemes.types";
import { CONTEXTES_F } from "../contextes";
import { arrondir, tirerParmi } from "../aleatoire";

/** Famille F — courbe logistique généralisée `y(t)=k/(1+a·e^(-rt))`. `k`/`r` DONNÉS (constantes du
 * modèle, spec explicite), `y0=y(0)` DONNÉ DIRECTEMENT (déjà une valeur "propre" choisie à la
 * génération, sert TELLE QUELLE de référence pour `a` — voir en-tête `core6e/logarithmesProblemes.types.ts`). */
const K_POOL = [50, 80, 100, 105, 150] as const;
const R_POOL = [0.5, 0.8, 1, 1.1244, 1.5] as const;
const FRACTION_Y0_POOL = [0.05, 0.1, 0.15, 0.2, 0.25, 0.3] as const;

export function construireF(): ExerciceLogProbF {
  const k = tirerParmi(K_POOL);
  const r = tirerParmi(R_POOL);
  const y0 = arrondir(k * tirerParmi(FRACTION_Y0_POOL), 1);
  const contexte = tirerParmi(CONTEXTES_F);

  const a = k / y0 - 1;
  const t = Math.log(a) / r;

  return { famille: "F", contexteId: contexte.id, k, r, y0, a, t };
}
