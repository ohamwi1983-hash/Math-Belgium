import type { ExerciceRacinesB } from "../../core6e/racinesNiemes.types";
import { tirerEntier, tirerParmi } from "../calculPrimitives/aleatoire";
import { calculerArgument, calculerModule } from "../formeTrigonometrique/familleA";

/**
 * Couche A (6e) — génération, famille B ("Racines n-ièmes, cas général") de `6gen39`. `w=a+bi`,
 * coefficients entiers tirés SANS aucune contrainte de "propreté" (contrairement aux familles A/C) —
 * `r`/`θ` réutilisent directement `calculerModule`/`calculerArgument`
 * (`formeTrigonometrique/familleA.ts`, Couche A ↔ Couche A libre) : `θ` peut donc être le fallback
 * DÉCIMAL de `calculerArgument` (aucun angle remarquable trouvé) — voir son en-tête. C'est
 * précisément le point de cette famille : aucune conversion finale en a+bi n'est exigée (spec), donc
 * AUCUNE fermeture de banque n'est nécessaire ici (contrairement à `familleA.ts`/`familleC.ts`) —
 * `n` reste tiré dans {3,4,5,6} tel quel, `n=5` INCLUS (voir `fermeture.ts` pour la raison pour
 * laquelle `n=5` est, lui, exclu des familles A/C).
 */

const N_POSSIBLES = [3, 4, 5, 6] as const;
const BORNE = 6;

function tirerAB(): { a: number; b: number } {
  let a = 0;
  let b = 0;
  while (a === 0 && b === 0) {
    a = tirerEntier(-BORNE, BORNE);
    b = tirerEntier(-BORNE, BORNE);
  }
  return { a, b };
}

export function construireFamilleB(): ExerciceRacinesB {
  const n = tirerParmi(N_POSSIBLES);
  const { a, b } = tirerAB();
  const r = calculerModule(a, b);
  const angle = calculerArgument(a, b);
  return { famille: "B", n, a, b, r, angle };
}
