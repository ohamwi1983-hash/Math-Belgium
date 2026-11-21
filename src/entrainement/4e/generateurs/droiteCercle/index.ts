import type { CatalogueVarianteEntree } from "../../../export/genererFeuilleExercices";
import type { ExerciceCercleTangent, ExerciceDroiteCercle, ExercicePositionRelative, ExerciceTangentePoint, PositionDroiteCercle, VarianteDroiteCercle } from "../../core/droiteCercle.types";
import { choisir, droiteDirectrice, droiteNormale, entier, pgcd, signe, type Droite, type Pt } from "../../ui/geometrieLotG";

/**
 * Générateur de gen92 « Tangente et position relative d'une droite et d'un cercle » (4e, ch. 7,
 * § 8 « Le cercle »). Tout le hasard passe par `Math.random` (`?code=` : `genererAvecCode`).
 *
 * - `tangente-point` : cercle (x − x₀)² + (y − y₀)² = r² et un point P du cercle ; CP entier
 *   (r² = somme de deux carrés), tangente n·(X − P) = 0 avec n = CP.
 * - `position-relative` : le VERDICT (extérieure, tangente, sécante) est tiré AVANT les nombres, à
 *   parts égales ; la droite d et le centre C sont construits à rebours (C = H + k·n, n normal à d,
 *   H entier = pied de la perpendiculaire) : CH² = k²·‖n‖² entier, r² comparé à CH² (égal, plus
 *   grand ou plus petit — écart d'au plus la moitié de CH² pour que la comparaison ne soit pas
 *   évidente). Cercle donné par son équation développée (coefficient 1 devant x² et y²).
 * - `cercle-tangent` : centre C et droite d, même construction ; r² = CH².
 * Droite (ou rayon) parallèle à un axe ≈ 1 fois sur 6 : raccourci du cours (cas particulier).
 */

export const CATALOGUE_VARIANTES: CatalogueVarianteEntree[] = [
  { id: "tangente-point", label: "Tangente au cercle en un point P" },
  { id: "position-relative", label: "Position relative d'une droite et d'un cercle (distance et rayon)" },
  { id: "cercle-tangent", label: "Cercle de centre donné tangent à une droite" },
];

const PROBA_AXE = 0.17;

/** Vecteur directeur primitif d'une droite (composantes ≤ 3) ; parallèle à un axe avec PROBA_AXE. */
function directionDroite(): Pt {
  if (Math.random() < PROBA_AXE) return Math.random() < 0.5 ? { x: 1, y: 0 } : { x: 0, y: 1 };
  for (;;) {
    const x = entier(1, 3);
    const y = entier(1, 3);
    if (pgcd(x, y) === 1) return { x: x * signe(), y: y * signe() };
  }
}

export function droiteAxiale(d: Droite): boolean {
  return d.a === 0 || d.b === 0;
}

function construireTangente(): ExerciceTangentePoint {
  const axe = Math.random() < PROBA_AXE;
  for (;;) {
    const centre = { x: entier(-5, 5), y: entier(-5, 5) };
    const cp = axe ? (Math.random() < 0.5 ? { x: entier(2, 6) * signe(), y: 0 } : { x: 0, y: entier(2, 6) * signe() }) : { x: entier(1, 5) * signe(), y: entier(1, 5) * signe() };
    const r2 = cp.x * cp.x + cp.y * cp.y;
    if (r2 > 50 || (!axe && cp.x === cp.y)) continue;
    const p = { x: centre.x + cp.x, y: centre.y + cp.y };
    if (Math.abs(p.x) > 9 || Math.abs(p.y) > 9 || (p.x === 0 && p.y === 0)) continue;
    const tangente = droiteNormale(p, cp);
    if (Math.abs(tangente.c) > 60) continue;
    const ordreRole = [0, 1, 2].sort(() => Math.random() - 0.5);
    return { variante: "tangente-point", centre, r2, p, cp, ordreRole, tangente };
  }
}

/** Centre, droite et pied construits à rebours : C = H + k·n (n normal à d). */
function rebours(cherche: (dist2: number) => number | null): { centre: Pt; d: Droite; h: Pt; dist2: number; r2: number } {
  for (;;) {
    const u = directionDroite();
    const n = { x: -u.y, y: u.x };
    const n2 = n.x * n.x + n.y * n.y;
    const axe = n2 === 1;
    const k = (axe ? entier(2, 6) : n2 >= 10 ? 1 : entier(1, 2)) * signe();
    const h = { x: entier(-4, 4), y: entier(-4, 4) };
    const centre = { x: h.x + k * n.x, y: h.y + k * n.y };
    if (Math.abs(centre.x) > 6 || Math.abs(centre.y) > 6) continue;
    const d = droiteDirectrice(h, u);
    if (Math.abs(d.c) > 30) continue;
    const dist2 = k * k * n2;
    const r2 = cherche(dist2);
    if (r2 === null || r2 < 1) continue;
    if (Math.abs(centre.x * centre.x + centre.y * centre.y - r2) > 60) continue;
    return { centre, d, h, dist2, r2 };
  }
}

function construirePosition(position: PositionDroiteCercle): ExercicePositionRelative {
  const r = rebours((dist2) => {
    if (position === "tangente") return dist2;
    const ecart = entier(1, Math.max(1, Math.ceil(dist2 / 2)));
    if (position === "secante") return dist2 + ecart;
    return dist2 - ecart >= 2 ? dist2 - ecart : null;
  });
  return { variante: "position-relative", centre: r.centre, r2: r.r2, d: r.d, h: r.h, dist2: r.dist2, position };
}

function construireCercleTangent(): ExerciceCercleTangent {
  const r = rebours((dist2) => dist2);
  return { variante: "cercle-tangent", centre: r.centre, d: r.d, h: r.h, r2: r.r2 };
}

export function construireAvecVariante(id: string): ExerciceDroiteCercle {
  const v = (CATALOGUE_VARIANTES.some((c) => c.id === id) ? id : choisir(CATALOGUE_VARIANTES).id) as VarianteDroiteCercle;
  if (v === "tangente-point") return construireTangente();
  if (v === "cercle-tangent") return construireCercleTangent();
  // Verdict tiré AVANT les nombres, à parts égales.
  return construirePosition(choisir(["exterieure", "tangente", "secante"] as const));
}

export function genererExerciceDroiteCercle(): ExerciceDroiteCercle {
  return construireAvecVariante(choisir(CATALOGUE_VARIANTES).id);
}
