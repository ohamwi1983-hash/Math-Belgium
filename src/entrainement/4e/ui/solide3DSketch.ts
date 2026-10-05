import type { AreteSolide3D, FaceSolide3D, PlanSolide3D, Point3D, Solide3D } from "../core/geometrieEspace.types";
import {
  additionner3D,
  multiplierScalaire3D,
  pointAppartientAuPlan,
  produitScalaire3D,
  produitVectoriel3D,
  soustraire3D,
} from "../moteur/geometrieEspace";
import { projeterPoint3D, type Point2D } from "./projectionCavaliere";

/**
 * Préparation géométrique pure (jamais de JSX ici) du rendu SVG statique en perspective cavalière —
 * chapitre "Géométrie dans l'espace", module partagé par les 3 générateurs. Le composant React
 * (`src/components/Solide3DSketch.tsx`) ne fait que consommer les structures calculées ici, jamais
 * de logique géométrique dans le composant lui-même — même séparation pure/rendu que
 * `ui/triangleSketch.ts`/`ui/parabolaSketch.ts` ailleurs dans le projet.
 *
 * Contrairement aux croquis schématiques à coordonnées pixel FIXES du reste du projet (
 * `TriangleSketch`, `ParabolaSketch`...), ce rendu dérive son viewBox DYNAMIQUEMENT de la vraie
 * boîte englobante 2D projetée — le point pédagogique de ce chapitre est un raisonnement fidèle à
 * un solide réellement proportionné, jamais un schéma volontairement pas à l'échelle.
 */

export const LARGEUR_SVG = 400;
export const HAUTEUR_SVG = 320;
export const MARGE_SVG = 36;

/**
 * Direction de vue FIXE (depuis le solide vers la caméra) — jamais personnalisée par instance ni
 * par générateur, pour que les 3 générateurs du chapitre partagent exactement le même rendu. Une
 * face est visible ssi sa normale extérieure a un produit scalaire positif avec cette direction.
 * Vérifiée manuellement sur le parallélépipède : produit l'arrangement classique "3 arêtes se
 * rejoignant en un seul sommet caché arrière-bas-gauche" attendu d'un manuel scolaire.
 */
export const DIRECTION_VUE_3D: Point3D = { x: 0.5, y: -1, z: 0.5 };

function centroide3D(points: Point3D[]): Point3D {
  const somme = points.reduce((acc, p) => additionner3D(acc, p), { x: 0, y: 0, z: 0 });
  return multiplierScalaire3D(somme, 1 / points.length);
}

/**
 * Normale extérieure d'une face, ROBUSTE à l'ordre de parcours (horaire/antihoraire) des sommets —
 * calculée via le produit vectoriel des 2 premières arêtes puis retournée si elle pointe vers
 * l'intérieur du solide (test contre le centroïde global), jamais supposée cohérente entre faces.
 */
export function normaleExterieureFace(solide: Solide3D, face: FaceSolide3D): Point3D {
  const p0 = solide.sommets[face[0]];
  const p1 = solide.sommets[face[1]];
  const p2 = solide.sommets[face[2]];
  let normale = produitVectoriel3D(soustraire3D(p1, p0), soustraire3D(p2, p0));

  const centreSolide = centroide3D(Object.values(solide.sommets));
  const centreFace = centroide3D(face.map((nom) => solide.sommets[nom]));
  const versExterieur = soustraire3D(centreFace, centreSolide);
  if (produitScalaire3D(normale, versExterieur) < 0) {
    normale = multiplierScalaire3D(normale, -1);
  }
  return normale;
}

export function faceEstVisible(solide: Solide3D, face: FaceSolide3D): boolean {
  return produitScalaire3D(normaleExterieureFace(solide, face), DIRECTION_VUE_3D) > 0;
}

/**
 * Arêtes DÉRIVÉES des faces (jamais saisies à la main par gabarit), dédupliquées entre faces
 * adjacentes, avec leur visibilité — visible (trait plein) dès qu'AU MOINS une face adjacente est
 * visible, pointillé si les deux (ou l'unique) face(s) adjacente(s) sont cachées.
 *
 * `solide.toutesAretesVisibles` (campanile uniquement) force `visible=true` sur CHAQUE arête,
 * inconditionnellement — jamais de calcul de normale/caméra pour ce gabarit précis, conformément à
 * la spec ("toutes les arêtes sont visibles/données, pas d'étape de complétion de pointillés").
 */
export function calculerAretesAvecVisibilite(solide: Solide3D): AreteSolide3D[] {
  const parCle = new Map<string, AreteSolide3D>();
  for (const face of solide.faces) {
    const visible = solide.toutesAretesVisibles === true || faceEstVisible(solide, face);
    for (let i = 0; i < face.length; i++) {
      const a = face[i];
      const b = face[(i + 1) % face.length];
      const [s1, s2] = [a, b].sort();
      const cle = `${s1}-${s2}`;
      const existante = parCle.get(cle);
      if (existante) {
        existante.visible = existante.visible || visible;
      } else {
        parCle.set(cle, { sommets: [s1, s2], visible });
      }
    }
  }
  return [...parCle.values()];
}

/** Échelle/décalage de mise à l'échelle dynamique, calculée une seule fois depuis les sommets du
 * solide — réutilisable pour projeter n'importe quel point 3D annexe (point de section, point
 * d'ombre...) dans le MÊME repère pixel que les sommets du solide, jamais un second calcul
 * d'échelle indépendant qui désynchroniserait les deux. */
export interface EchelleProjection3D {
  minX: number;
  minY: number;
  echelle: number;
  decalageX: number;
  decalageY: number;
}

export function calculerEchelleProjection(solide: Solide3D): EchelleProjection3D {
  const projections = Object.values(solide.sommets).map((p) => projeterPoint3D(p));
  const xs = projections.map((p) => p.x);
  const ys = projections.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const largeurUnites = maxX - minX || 1;
  const hauteurUnites = maxY - minY || 1;

  const zoneLargeur = LARGEUR_SVG - 2 * MARGE_SVG;
  const zoneHauteur = HAUTEUR_SVG - 2 * MARGE_SVG;
  const echelle = Math.min(zoneLargeur / largeurUnites, zoneHauteur / hauteurUnites);

  const decalageX = MARGE_SVG + (zoneLargeur - largeurUnites * echelle) / 2;
  const decalageY = MARGE_SVG + (zoneHauteur - hauteurUnites * echelle) / 2;

  return { minX, minY, echelle, decalageX, decalageY };
}

/** Projette un point 3D interne quelconque (pas forcément un sommet nommé du solide — un point de
 * section, un point d'ombre...) vers un pixel, dans le MÊME repère que `calculerSommetsPixel`. */
export function projeter3DVersPixel(p: Point3D, echelleProjection: EchelleProjection3D): Point2D {
  const projete = projeterPoint3D(p);
  const { minX, minY, echelle, decalageX, decalageY } = echelleProjection;
  return {
    x: decalageX + (projete.x - minX) * echelle,
    // Inversion verticale : l'axe y mathématique grandit vers le haut, l'axe y SVG vers le bas.
    y: HAUTEUR_SVG - decalageY - (projete.y - minY) * echelle,
  };
}

/** Coordonnées PIXEL (pas encore les unités 3D) de chaque sommet nommé, mise à l'échelle
 * dynamiquement pour occuper au mieux le canevas tout en préservant le ratio d'aspect réel. */
export function calculerSommetsPixel(solide: Solide3D): Record<string, Point2D> {
  const echelleProjection = calculerEchelleProjection(solide);
  const sommetsPixel: Record<string, Point2D> = {};
  for (const [nom, p] of Object.entries(solide.sommets)) {
    sommetsPixel[nom] = projeter3DVersPixel(p, echelleProjection);
  }
  return sommetsPixel;
}

/** Position pixel des ÉTIQUETTES de sommet (jamais le sommet lui-même) — décalée radialement vers
 * l'extérieur depuis le centroïde 2D de tous les sommets, pour ne jamais chevaucher les arêtes. */
export function calculerLabelsSommetsPixel(solide: Solide3D, distance = 14): Record<string, Point2D> {
  const sommetsPixel = calculerSommetsPixel(solide);
  const points = Object.values(sommetsPixel);
  const centre = {
    x: points.reduce((s, p) => s + p.x, 0) / points.length,
    y: points.reduce((s, p) => s + p.y, 0) / points.length,
  };
  const labels: Record<string, Point2D> = {};
  for (const [nom, p] of Object.entries(sommetsPixel)) {
    const dx = p.x - centre.x;
    const dy = p.y - centre.y;
    const longueur = Math.hypot(dx, dy) || 1;
    labels[nom] = { x: p.x + (dx / longueur) * distance, y: p.y + (dy / longueur) * distance };
  }
  return labels;
}

export interface GeometrieSolide3D {
  sommetsPixel: Record<string, Point2D>;
  labelsSommetsPixel: Record<string, Point2D>;
  aretes: AreteSolide3D[];
}

export function calculerGeometrieSolide3D(solide: Solide3D): GeometrieSolide3D {
  return {
    sommetsPixel: calculerSommetsPixel(solide),
    labelsSommetsPixel: calculerLabelsSommetsPixel(solide),
    aretes: calculerAretesAvecVisibilite(solide),
  };
}

/**
 * Polygone (pixels, ordonné) de TOUS les sommets du solide appartenant au plan désigné — jamais
 * seulement les 3 sommets qui le définissent : un plan diagonal peut traverser d'autres sommets du
 * solide (ex. un plan défini par 3 sommets d'un parallélépipède peut aussi contenir un 4e sommet).
 * Trié par angle autour du centroïde 2D des points concernés — valide ici car la perspective
 * cavalière est une projection affine, elle préserve l'ordre angulaire d'un polygone plan convexe.
 */
export function calculerPolygonePlan(solide: Solide3D, plan: PlanSolide3D): Point2D[] {
  const planPoints: [Point3D, Point3D, Point3D] = [solide.sommets[plan[0]], solide.sommets[plan[1]], solide.sommets[plan[2]]];
  const sommetsPixel = calculerSommetsPixel(solide);

  const nomsDansLePlan = Object.keys(solide.sommets).filter((nom) => pointAppartientAuPlan(solide.sommets[nom], planPoints));

  const points = nomsDansLePlan.map((nom) => sommetsPixel[nom]);
  const centre = {
    x: points.reduce((s, p) => s + p.x, 0) / points.length,
    y: points.reduce((s, p) => s + p.y, 0) / points.length,
  };
  return points
    .map((p) => ({ p, angle: Math.atan2(p.y - centre.y, p.x - centre.x) }))
    .sort((a, b) => a.angle - b.angle)
    .map(({ p }) => p);
}
