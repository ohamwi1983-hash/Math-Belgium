import type { ExerciceLogProbB } from "../../../core6e/logarithmesProblemes.types";
import { CONTEXTES_B } from "../contextes";
import { arrondir, tirerEntier, tirerParmi } from "../aleatoire";

/**
 * Famille B — modèle à 2 points `Q(t)=Q0·r^t` (r>1, croissance uniquement — les 3 contextes de
 * `CONTEXTES_B` décrivent tous une grandeur qui progresse, jamais une décroissance, pour que
 * l'écran 4 "la grandeur aura été multipliée par k" (k>1) reste naturel). Pas de précédent
 * `6gen13` réel pour ce patron (voir devlog) — conçu fraîchement depuis l'algèbre du prompt, même
 * "génération par construction" que `exponentiellesProblemes/familles/C.ts` (6gen12) : `t1`/`delta`/
 * `v1` tirés directement, tout le reste DÉRIVÉ.
 */
const R_POOL = [1.03, 1.05, 1.08, 1.1, 1.12, 1.15] as const;
const K_POOL = [2, 3, 4, 5] as const;

function arrondiAffichage(v: number): number {
  return arrondir(v, Math.abs(v) < 100 ? 1 : 0);
}

export function construireB(): ExerciceLogProbB {
  const r = tirerParmi(R_POOL);
  const contexte = tirerParmi(CONTEXTES_B);

  const t1 = tirerEntier(3, 8);
  const delta = tirerEntier(2, 5);
  const t2 = t1 + delta;
  const v1 = tirerEntier(contexte.v1Min, contexte.v1Max);

  const v2 = v1 * Math.pow(r, delta);
  const v2Affiche = arrondiAffichage(v2);
  const Q0 = v1 / Math.pow(r, t1);

  const tRef = t2 + tirerEntier(1, 4);
  const valeurRef = Q0 * Math.pow(r, tRef);

  const k = tirerParmi(K_POOL);
  const tCible = tRef + Math.log(k) / Math.log(r);

  return { famille: "B", contexteId: contexte.id, t1, t2, v1, r, v2, v2Affiche, Q0, tRef, valeurRef, k, tCible };
}
