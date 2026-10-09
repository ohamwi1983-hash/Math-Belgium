import type { AngleRemarquable } from "../../core6e/formeTrigonometrique.types";
import type { ExerciceRacinesC, RacineExacte } from "../../core6e/racinesNiemes.types";
import { tirerParmi } from "../calculPrimitives/aleatoire";
import { additionnerAngles, angleDepuisFraction } from "../formeTrigonometrique/angles";
import { combinerModuleAngle } from "../formeTrigonometrique/familleA";
import { pointRemarquablePour, thetasFermesPour } from "./fermeture";

/**
 * Couche A (6e) — génération, famille C ("zⁿ=wⁿ, astuce racine de l'unité") de `6gen39`.
 * `w=r(\cosθ+i\sinθ)`, `r` entier simple (1 à 4), `θ` remarquable filtré via `thetasFermesPour(n)`
 * (`fermeture.ts`), EXACTEMENT le même mécanisme de fermeture que `familleA.ts` — nécessaire ici
 * pour que `z_k=w·ζ_k` (écran 3) reste un couple (partie réelle, partie imaginaire) tapable pour
 * TOUTE valeur de k.
 *
 * ============================================================================
 * **`n∈{3,4,6}` — PAS `{3,4,5,6}` comme la spec source le liste** — déviation délibérée, documentée
 * ============================================================================
 * `thetasFermesPour(5)` est un ensemble VIDE (voir `fermeture.ts`, prouvé par `fermeture.test.ts`) :
 * `2π/5` n'est multiple NI de π/6 NI de π/4, donc jamais dans la banque des 16 remarquables, quel que
 * soit `θ` — y compris `θ=0` (le cas le plus simple : les racines cinquièmes de l'unité elles-mêmes,
 * `ζ_k=\cos(2kπ/5)+i\sin(2kπ/5)`, n'ont AUCUNE forme exacte dans la table des 9 valeurs connues
 * de ce chantier — `cos(72°)` implique le nombre d'or, hors de portée de `combinerModuleAngle`).
 * `n=5` est donc STRUCTURELLEMENT incompatible avec "convertis en a+bi" (spec, écran 3) — retiré de
 * la génération plutôt que de laisser un écran 3 occasionnellement impossible à répondre exactement.
 *
 * `zetas[k].angle=2kπ/n` (construit via `angleDepuisFraction`, EXACT, jamais un multiple flottant) —
 * TOUJOURS dans la banque pour `n∈{3,4,6}` (2π/3, 2π/4=π/2, 2π/6=π/3 sont tous des multiples exacts
 * de π/6 ou π/4, et rester multiple de la même famille est stable par addition/réduction modulo 2π —
 * voir `fermeture.test.ts` pour la couverture croisée). `racines[k].angle=θ+ζ_k.angle`, TOUJOURS dans
 * la banque PAR CONSTRUCTION (c'est exactement ce que `thetasFermesPour(n)` a vérifié en amont pour
 * `θ` : `angleDepuisFraction(θ.p+2kθ.q, θ.q·n)` EST la même formule que `additionnerAngles(θ,
 * angleDepuisFraction(2k,n))` une fois réduite — même fraction exacte, donc même résultat).
 */

const N_POSSIBLES = [3, 4, 6] as const; // n=5 exclu — voir en-tête de fichier et fermeture.ts.
const R_POSSIBLES = [1, 2, 3, 4] as const;

function zetaDindice(k: number, n: number): RacineExacte {
  const angle = angleDepuisFraction(2 * k, n);
  const point = pointRemarquablePour(angle);
  return { angle, re: combinerModuleAngle(1, point.cos), im: combinerModuleAngle(1, point.sin) };
}

function racineDindice(theta: AngleRemarquable, zeta: RacineExacte, r: number): RacineExacte {
  const angle = additionnerAngles(theta, zeta.angle);
  const point = pointRemarquablePour(angle);
  return { angle, re: combinerModuleAngle(r, point.cos), im: combinerModuleAngle(r, point.sin) };
}

export function construireFamilleC(): ExerciceRacinesC {
  const n = tirerParmi(N_POSSIBLES);
  const theta = tirerParmi(thetasFermesPour(n));
  const r = tirerParmi(R_POSSIBLES);
  const zetas: RacineExacte[] = [];
  for (let k = 0; k < n; k++) zetas.push(zetaDindice(k, n));
  const racines = zetas.map((zeta) => racineDindice(theta, zeta, r));
  return { famille: "C", n, r, angle: theta, zetas, racines };
}
