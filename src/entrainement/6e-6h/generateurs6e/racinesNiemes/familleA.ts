import type { AngleRemarquable } from "../../core6e/formeTrigonometrique.types";
import type { ExerciceRacinesA, RacineExacte } from "../../core6e/racinesNiemes.types";
import { tirerParmi } from "../calculPrimitives/aleatoire";
import { angleDepuisFraction } from "../formeTrigonometrique/angles";
import { combinerModuleAngle } from "../formeTrigonometrique/familleA";
import { pointRemarquablePour, thetasFermesPour } from "./fermeture";

/**
 * Couche A (6e) — génération, famille A ("Racines n-ièmes, cas propre") de `6gen39`. `w=r(\cosθ+
 * i\sinθ)`, `r=kModule^n` (puissance n-ième PARFAITE), `θ` un angle remarquable réutilisé depuis
 * `formeTrigonometrique/familleA.ts` (Couche A ↔ Couche A libre, CLAUDE.md) — MAIS filtré via
 * `thetasFermesPour(n)` (`fermeture.ts`) plutôt que tiré parmi les 16 angles sans discrimination :
 * voir en-tête `fermeture.ts` pour la preuve exhaustive (et `fermeture.test.ts` pour sa vérification
 * empirique) que, sans ce filtre, une partie des combinaisons (n,θ) produirait une racine dont
 * l'angle tombe HORS de la banque des 16 remarquables — un cos/sin alors inconnu, impossible à
 * combiner en un radical simple tapable par l'élève.
 *
 * `n` d'abord tiré ÉQUIPROBABLE dans {2,3,4} (conforme à la spec source), PUIS `θ` tiré ÉQUIPROBABLE
 * dans le sous-ensemble fermé pour ce `n` — jamais l'inverse (tirer un θ global puis vérifier après
 * coup : biaiserait la distribution des n vers ceux ayant le plus de θ fermés).
 */

const N_POSSIBLES = [2, 3, 4] as const;
const K_MODULE_POSSIBLES = [1, 2, 3] as const;

/** Racine n-ième d'indice `j` (angle=(θ+2jπ)/n, module commun `kModule`) — cos/sin exacts retrouvés
 * via `pointRemarquablePour` (l'angle est garanti dans la banque par construction, voir en-tête). */
function racineDindice(theta: AngleRemarquable, j: number, n: number, kModule: number): RacineExacte {
  const angle = angleDepuisFraction(theta.p + 2 * j * theta.q, theta.q * n);
  const point = pointRemarquablePour(angle);
  return { angle, re: combinerModuleAngle(kModule, point.cos), im: combinerModuleAngle(kModule, point.sin) };
}

export function construireFamilleA(): ExerciceRacinesA {
  const n = tirerParmi(N_POSSIBLES);
  const theta = tirerParmi(thetasFermesPour(n));
  const kModule = tirerParmi(K_MODULE_POSSIBLES);
  const r = Math.pow(kModule, n);
  const racines: RacineExacte[] = [];
  for (let j = 0; j < n; j++) racines.push(racineDindice(theta, j, n, kModule));
  return { famille: "A", n, kModule, r, angle: theta, racines };
}
