import type { ExerciceVolumeD } from "../../core6e/volumesRevolution.types";
import { tirerParmi } from "../calculPrimitives/aleatoire";

/**
 * Couche A (6e) — génération, famille D ("Comparaison à un cylindre englobant") de `6gen27`.
 * f(x) = k·√x sur [0;L] (paraboloïde) comparé au cylindre englobant (rayon=f(L)=k√L,
 * hauteur=L) — propriété INVARIANTE en k et L : le volume du paraboloïde vaut TOUJOURS exactement
 * la moitié du volume du cylindre englobant (V_parabo=π·k²·L²/2, V_cyl=π·k²·L², rapport=1/2).
 *
 * `k` est tiré parmi 4 valeurs représentées en FRACTION EXACTE (`kNum`/`kDen`) — jamais stockées en
 * décimal (CLAUDE.md) — pour un affichage LaTeX propre (`ui6e/formatVolumesRevolution.ts`). Les 4
 * valeurs candidates (1, 3/2, 2, 5/2) restent malgré tout EXACTEMENT représentables en `number`
 * IEEE754 (1 ; 1,5 ; 2 ; 2,5 sont tous des multiples de 0,5, une puissance de 2 exacte en binaire)
 * — la vérification numérique (`moteur6e/verificationVolumesRevolution.ts`) peut donc calculer
 * `volumeParaboloide`/`volumeCylindre` directement en flottant sans AUCUNE perte de précision, la
 * fraction n'étant nécessaire que pour l'AFFICHAGE.
 *
 * `L` est un carré parfait (4, 9, 16, 25) — garantit un rayon f(L)=k√L propre (√L entier).
 */

const CANDIDATS_K: { num: number; den: number }[] = [
  { num: 1, den: 1 }, // k=1
  { num: 3, den: 2 }, // k=1,5
  { num: 2, den: 1 }, // k=2
  { num: 5, den: 2 }, // k=2,5
];
const CANDIDATS_L = [4, 9, 16, 25] as const;

export function construireFamilleVolumeD(): ExerciceVolumeD {
  const { num: kNum, den: kDen } = tirerParmi(CANDIDATS_K);
  const L = tirerParmi(CANDIDATS_L);
  const k = kNum / kDen;
  const volumeParaboloide = (Math.PI * k * k * L * L) / 2;
  const volumeCylindre = Math.PI * k * k * L * L;
  return { famille: "D", kNum, kDen, L, volumeParaboloide, volumeCylindre };
}
