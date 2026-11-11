import { construireFamilleVolumeA, construireFamilleVolumeD } from "../volumesRevolution";
import type { ExerciceFamilleG_Archimede, ExerciceFamilleG_Calotte, ExerciceFamilleG_Problemes, ExerciceFamilleG_Soustraction, SousTypeG_Problemes } from "../../core6e/integralesProblemes.types";

/**
 * Couche A (6e) — famille G de `6gen29` : volume de révolution appliqué, 3 sous-types.
 *
 * - "soustraction" — RÉUTILISE `construireFamilleVolumeA` (`generateurs6e/volumesRevolution/`,
 *   6gen27) pour le volume total, jamais réimplémenté.
 * - "archimede" — RÉUTILISE `construireFamilleVolumeD` (même module, 6gen27) pour le paraboloïde
 *   contenant (`volumeParaboloide` déjà calculé là-bas, jamais recalculé ici).
 * - "calotte" — construction FRAÎCHE (aucune réutilisation directe de 6gen27, forme π∫(r²−(y−r)²)dy
 *   différente de toutes les familles A-D de ce générateur) : sphère de rayon r, volume d'eau
 *   jusqu'à une hauteur h, formule de la calotte sphérique.
 */

function entierEntre(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

/** Reproduit localement (Couche A) la même formule que `volumeEntreBornes` de
 * `moteur6e/verificationVolumesRevolution.ts` (Couche B, jamais importée depuis Couche A —
 * CLAUDE.md). */
function volumeTotalFamilleA(ex: ReturnType<typeof construireFamilleVolumeA>): number {
  return Math.PI * (ex.primitiveDeveloppeReference(ex.b) - ex.primitiveDeveloppeReference(ex.a));
}

/** Minimum de |f| sur [a;b], par échantillonnage fin (f continue : polynôme du 1er degré, a·eˣ+b,
 * a·cos x). */
function minimumValeurAbsolue(f: (x: number) => number, a: number, b: number): number {
  let min = Infinity;
  for (let i = 0; i <= 400; i++) min = Math.min(min, Math.abs(f(a + ((b - a) * i) / 400)));
  return min;
}

const RAYONS_TROU: { num: number; den: number }[] = [
  { num: 1, den: 2 },
  { num: 1, den: 1 },
];

/** Trou cylindrique coaxial de rayon ρ percé sur toute la longueur [a;b] : ρ < 0,8·min|f| garantit
 * que le cylindre tient dans le solide (paroi d'épaisseur non nulle partout) — on retire les courbes
 * trop proches de l'axe (min|f| < 0,625, qui ne laisse même pas passer ρ = 1/2). */
export function construireFamilleG_Soustraction(): ExerciceFamilleG_Soustraction {
  for (;;) {
    const volumeTotal = construireFamilleVolumeA();
    const minF = minimumValeurAbsolue(volumeTotal.fReference, volumeTotal.a, volumeTotal.b);
    const possibles = RAYONS_TROU.filter((r) => r.num / r.den < 0.8 * minF);
    if (possibles.length === 0) continue;
    const { num: rayonTrouNum, den: rayonTrouDen } = possibles[Math.floor(Math.random() * possibles.length)];
    const longueurTrou = volumeTotal.b - volumeTotal.a;
    const rho = rayonTrouNum / rayonTrouDen;
    const volumeInterieur = Math.PI * rho * rho * longueurTrou;
    const vTotal = volumeTotalFamilleA(volumeTotal);
    return { famille: "G", sousType: "soustraction", volumeTotal, volumeTotalAttendu: vTotal, rayonTrouNum, rayonTrouDen, longueurTrou, volumeInterieur };
  }
}

export function construireFamilleG_Archimede(): ExerciceFamilleG_Archimede {
  const paraboloide = construireFamilleVolumeD();
  const k = paraboloide.kNum / paraboloide.kDen;
  const rayonMax = k * Math.sqrt(paraboloide.L);
  // Candidats de rayon de bille, filtrés pour rester nettement dans le paraboloïde (marge, jamais
  // au ras du bord) — au moins 1 (r=1) reste toujours disponible dans les plages de la spec 6gen27.
  const candidats = [1, 1.5, 2].filter((r) => r < rayonMax * 0.6);
  const r = candidats.length > 0 ? candidats[Math.floor(Math.random() * candidats.length)] : 1;
  return { famille: "G", sousType: "archimede", paraboloide, r };
}

export function construireFamilleG_Calotte(): ExerciceFamilleG_Calotte {
  const r = entierEntre(2, 5);
  const hDemande = entierEntre(1, 2 * r - 1);
  return { famille: "G", sousType: "calotte", r, hDemande, integrandeReference: integrandeCalotteReference(r), primitiveReference: primitiveCalotteReference(r) };
}

const CONSTRUCTEURS_PAR_SOUS_TYPE: Record<SousTypeG_Problemes, () => ExerciceFamilleG_Problemes> = {
  soustraction: construireFamilleG_Soustraction,
  archimede: construireFamilleG_Archimede,
  calotte: construireFamilleG_Calotte,
};

export function construireFamilleG(): ExerciceFamilleG_Problemes {
  const sousTypes: SousTypeG_Problemes[] = ["soustraction", "archimede", "calotte"];
  const sousType = sousTypes[Math.floor(Math.random() * sousTypes.length)];
  return CONSTRUCTEURS_PAR_SOUS_TYPE[sousType]();
}

// ============================================================================
// Formules — sous-type "calotte" (fraîches, réutilisées par Couche B via `diagnostiquerPrimitive`).
// ============================================================================

/** Intégrande posé (avant développement) — r²−(y−r)², variable y, r déjà substitué numériquement
 * (spec écran 1 : "poser V(h)=π∫[0,h](r²−(y−r)²)dy"). */
export function integrandeCalotteReference(r: number): (y: number) => number {
  return (y: number) => r * r - (y - r) * (y - r);
}

/** Primitive (constante nulle) de l'intégrande DÉVELOPPÉ (2r·y−y²) — écran 2 : F(y) = r·y² − y³/3. */
export function primitiveCalotteReference(r: number): (y: number) => number {
  return (y: number) => r * y * y - (y * y * y) / 3;
}

/** V(h) = π·(F(h)−F(0)) = π·(r·h² − h³/3) — écran 3. */
export function volumeCalotte(r: number, h: number): number {
  const F = primitiveCalotteReference(r);
  return Math.PI * (F(h) - F(0));
}

// ============================================================================
// Formules — sous-type "archimede".
// ============================================================================

export function volumeSphereDeplace(r: number): number {
  return (4 / 3) * Math.PI * r * r * r;
}

export function fractionExpulsee(ex: ExerciceFamilleG_Archimede): number {
  return volumeSphereDeplace(ex.r) / ex.paraboloide.volumeParaboloide;
}

// ============================================================================
// Formule — sous-type "soustraction".
// ============================================================================

export function volumeMatiere(ex: ExerciceFamilleG_Soustraction): number {
  return volumeTotalFamilleA(ex.volumeTotal) - ex.volumeInterieur;
}
