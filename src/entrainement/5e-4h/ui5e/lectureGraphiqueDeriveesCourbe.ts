/**
 * Couche présentation (5e) — rendu de la courbe de 5gen30 ("Lecture graphique — dérivées et
 * applications"). La courbe est la MÊME que celle de la génération : morceaux évalués par
 * `generateurs5e/lectureGraphiqueDerivees/courbeNumerique.ts` (import direct, aucune réplique),
 * donc la vérité terrain stockée correspond exactement à ce qui est affiché.
 */
import type { ExerciceLectureGraphiqueDerivees } from "../core5e/lectureGraphiqueDerivees.types";
import type { ExerciceLectureGraphiqueLimites } from "../core5e/lectureGraphiqueLimites.types";
import { BUFFER_VA_DERIVEES, domainesBranches, valeurCourbe } from "../generateurs5e/lectureGraphiqueDerivees/courbeNumerique";
import { xBordVisibleY } from "../ui/mafsTransformation";

/** Évaluateur f(x) complet. `xMin`/`xMax` sont ignorés (signature conservée pour l'adaptateur papier). */
export function construireEvaluateurCourbeDerivees(exercice: ExerciceLectureGraphiqueDerivees, _xMin?: number, _xMax?: number): (x: number) => number {
  return (x: number) => valeurCourbe(exercice, x);
}

export interface PieceDomaineDerivees {
  lo: number;
  hi: number;
}

/** Domaine tracé de chaque branche (une zone de BUFFER_VA_DERIVEES exclue près d'une AV où la
 * courbe diverge ; une branche qui aboutit à un point isolé va jusqu'au point). */
export function construireDomainesPieces(asymptotique: ExerciceLectureGraphiqueLimites, xMin: number, xMax: number): PieceDomaineDerivees[] {
  return domainesBranches(asymptotique, [xMin, xMax]).map((d) => ({
    lo: d.vaGauche === null ? d.lo : d.pointIsoleGauche ? d.lo : d.lo + BUFFER_VA_DERIVEES,
    hi: d.vaDroite === null ? d.hi : d.pointIsoleDroite ? d.hi : d.hi - BUFFER_VA_DERIVEES,
  }));
}

export interface SegmentCourbeDerivees {
  domaine: [number, number];
  evaluer: (x: number) => number;
}

/** Un `Plot.OfX` par branche ; près d'une AV, la branche est prolongée jusqu'au bord VISIBLE de la
 * fenêtre (zoom/pan) pour que la divergence ne paraisse jamais coupée. */
export function construireSegmentsDerivees(exercice: ExerciceLectureGraphiqueDerivees, xMin: number, xMax: number, visibleY: [number, number]): SegmentCourbeDerivees[] {
  const f = construireEvaluateurCourbeDerivees(exercice);
  return domainesBranches(exercice.asymptotique, exercice.bornesX).map((d) => {
    let lo = d.vaGauche === null ? Math.min(xMin, d.lo) : d.lo;
    let hi = d.vaDroite === null ? Math.max(xMax, d.hi) : d.hi;
    // Entre l'AV et le raccord (au moins D_MIN.divergence = 0,8), la branche est le gabarit c/(x − a),
    // strictement monotone : hypothèse de `xBordVisibleY`.
    if (d.vaGauche !== null && !d.pointIsoleGauche) lo = xBordVisibleY(f, d.vaGauche, d.vaGauche + 0.8, visibleY);
    if (d.vaDroite !== null && !d.pointIsoleDroite) hi = xBordVisibleY(f, d.vaDroite, d.vaDroite - 0.8, visibleY);
    return { domaine: [lo, hi] as [number, number], evaluer: f };
  });
}

/** ViewBox — x : fenêtre FIXE de l'exercice ; y : englobe points clés, raccords, points isolés et
 * asymptotes aux bords, avec une marge (au plus [−11 ; 11]). */
export function calculerViewBoxLectureGraphiqueDerivees(exercice: ExerciceLectureGraphiqueDerivees): { x: [number, number]; y: [number, number] } {
  const [xMin, xMax] = exercice.bornesX;
  const valeurs: number[] = [];
  const { infini } = exercice.asymptotique;
  if (infini.type === "horizontale") valeurs.push(infini.limitePlusInfini, infini.limiteMoinsInfini);
  else if (infini.type === "oblique") valeurs.push(infini.pente * xMin + infini.ordonnee, infini.pente * xMax + infini.ordonnee);
  for (const va of exercice.asymptotique.vas) {
    if (va.pointIsoleGauche !== undefined) valeurs.push(va.pointIsoleGauche);
    if (va.pointIsoleDroit !== undefined) valeurs.push(va.pointIsoleDroit);
  }
  for (const m of exercice.morceaux) {
    if (m.kind === "divergence") continue;
    for (let i = 0; i <= 6; i++) {
      const x = m.x0 + ((m.x1 - m.x0) * i) / 6;
      valeurs.push(valeurCourbe(exercice, x));
    }
  }
  let yMin = Math.min(-3, ...valeurs) - 1.5;
  let yMax = Math.max(3, ...valeurs) + 1.5;
  yMin = Math.max(yMin, -11);
  yMax = Math.min(yMax, 11);
  return { x: [xMin, xMax], y: [Math.floor(yMin), Math.ceil(yMax)] };
}

export interface MarqueurPointIsole {
  x: number;
  y: number;
}

export function construireMarqueursPointIsole(exercice: ExerciceLectureGraphiqueDerivees): MarqueurPointIsole[] {
  const marqueurs: MarqueurPointIsole[] = [];
  for (const va of exercice.asymptotique.vas) {
    if (va.pointIsoleGauche !== undefined) marqueurs.push({ x: va.position, y: va.pointIsoleGauche });
    if (va.pointIsoleDroit !== undefined) marqueurs.push({ x: va.position, y: va.pointIsoleDroit });
  }
  return marqueurs;
}

// ============================================================================
// Aide VISUELLE — surlignage d'une bande verticale autour d'un point déjà connu (valeur d'un
// extremum dont la position a été validée à l'écran précédent).
// ============================================================================

export type ZoneSurlignage = { type: "point"; position: number };

const LARGEUR_BANDE_POINT = 0.6;

export function calculerZoneSurlignage(_exercice: ExerciceLectureGraphiqueDerivees, zone: ZoneSurlignage): [number, number] {
  return [zone.position - LARGEUR_BANDE_POINT, zone.position + LARGEUR_BANDE_POINT];
}
