/**
 * Géométrie de l'aide UNIQUE de "Quel angle ?" (chapitre 3, générateur en position 18 —
 * `promptcorrectionsgenerateur18aideunique.md`, remplace l'ancien système à 3 aides progressives ;
 * `promptcorrectionrenduaidegenerateur18.md`, deux corrections de rendu supplémentaires — voir
 * `calculerAideCandidats`/`calculerAideProjections` ci-dessous ; puis une correction supplémentaire
 * demandée directement en conversation, sans fichier prompt dédié, pour la seule variante tan —
 * voir le champ `visible` de `calculerAideProjections`) : quadrants surlignés + points candidats/
 * rayons/arcs fléchés/projections convergentes, combinés en une seule vue par le composant
 * `AideQuelAngle.tsx`. Construite sur la même base que le sélecteur de quadrant/les aides du
 * générateur 14 (`calculerZonesCercleQuadrantSelecteur`/`calculerTrajetCercleTrig`/
 * `calculerAideSignes`, réutilisées telles quelles, jamais dupliquées) et affichée par-dessus
 * `CercleTrigBase` (voir `components/CercleTrigBase.tsx`).
 *
 * Réutilise `calculerQuadrant` du générateur 14 (`quadrantCalculs.ts`, import générateur→générateur)
 * pour dériver, à la demande, le(s) quadrant(s) concerné(s) par chaque solution — jamais stocké sur
 * le contrat `ExerciceQuelAngle` (voir sa doc), toujours recalculé ici depuis les valeurs réelles.
 */
import { calculerQuadrant } from "../generateurs/cercleTrigonometrique/quadrantCalculs";
import type { FonctionTrig } from "../core/quelAngle.types";
import type { Quadrant } from "../core/cercleTrigonometrique.types";
import { CENTRE_CERCLE_TRIG, RAYON_CERCLE_TRIG, pointSurCercle } from "./cercleTrigGeometrie";
import type { PointCroquisCercleTrig } from "./cercleTrigGeometrie";
import { calculerZonesCercleQuadrantSelecteur } from "./cercleQuadrantSelecteur";
import { RAYON_ARC, calculerTrajetCercleTrig } from "./cercleTrigTrajet";
import { calculerAideSignes } from "./cercleTrigSignesAide";

/**
 * "Quadrants concernés" de l'aide unique. `cheminsQuadrants` : un quart de disque (même géométrie
 * que le sélecteur de quadrant) par quadrant I-IV concerné. `rayonsAxes` : pour une solution
 * tombant exactement sur un axe (cas `k=±1`, une seule solution) — il n'y a pas de "quadrant" à
 * proprement parler, la zone surlignée dégénère en un simple rayon (segment du centre jusqu'au
 * bord du cercle, dans la direction exacte de la solution) plutôt qu'une région.
 */
export interface AideQuadrantsQuelAngle {
  cheminsQuadrants: string[];
  rayonsAxes: { x1: number; y1: number; x2: number; y2: number }[];
}

export function calculerAideQuadrants(solutions: number[]): AideQuadrantsQuelAngle {
  const { zonesQuadrant } = calculerZonesCercleQuadrantSelecteur();
  const centre = CENTRE_CERCLE_TRIG;

  const cheminsQuadrants: string[] = [];
  const rayonsAxes: { x1: number; y1: number; x2: number; y2: number }[] = [];

  for (const solution of solutions) {
    const quadrant = calculerQuadrant(solution);
    if (quadrant === "axeOx" || quadrant === "axeOy") {
      const point = pointSurCercle(solution, RAYON_CERCLE_TRIG);
      rayonsAxes.push({ x1: centre.x, y1: centre.y, x2: point.x, y2: point.y });
      continue;
    }
    const zone = zonesQuadrant.find((z) => z.quadrant === quadrant);
    if (zone) cheminsQuadrants.push(zone.cheminDisque);
  }

  return { cheminsQuadrants, rayonsAxes };
}

/** Libellé court d'un quadrant, pour le texte de l'aide (ex. "quadrants II et III", "l'axe Ox"). */
export function libelleQuadrants(solutions: number[]): string {
  const quadrants = [...new Set(solutions.map(calculerQuadrant))];
  const libelleUn = (q: Quadrant) => (q === "axeOx" ? "l'axe Ox" : q === "axeOy" ? "l'axe Oy" : `le quadrant ${q}`);
  if (quadrants.length === 1) return libelleUn(quadrants[0]);
  const libellesPluriel = quadrants.map((q) => (q === "axeOx" || q === "axeOy" ? libelleUn(q) : q));
  return `les quadrants ${libellesPluriel.join(" et ")}`;
}

/**
 * "Points candidats" de l'aide unique — un point + un arc ORIENTÉ FLÉCHÉ (depuis l'axe X positif,
 * balayant jusqu'au rayon du point) par solution, SANS lecture numérique affichée à côté des
 * points (l'élève doit encore calculer et inscrire la valeur lui-même —
 * `promptcorrectionsgenerateur18aideunique.md`). Réutilise `calculerTrajetCercleTrig` telle quelle :
 * chaque solution est déjà dans `[0°,360°[`, donc `calculerTrajetCercleTrig(s,s)` produit
 * exactement l'arc/la flèche/le point souhaités (jamais de spirale, magnitude toujours <360).
 *
 * **Rayons d'arc espacés, un par candidat** (`promptcorrectionrenduaidegenerateur18.md`, point 1) :
 * les deux arcs partent tous deux de l'axe X positif (0°) — au même rayon standard, ils se
 * chevauchaient donc près du départ, rendant leur lecture confuse. `calculerTrajetCercleTrig`
 * accepte désormais un 3e paramètre optionnel `rayonArc` (voir `cercleTrigTrajet.ts`) ; chaque
 * candidat reçoit ici un rayon décalé symétriquement autour de `RAYON_ARC` (`ESPACEMENT_RAYON_ARC`
 * au total, réparti entre les candidats) — jamais deux candidats au même rayon, donc jamais de
 * chevauchement d'arc (deux arcs concentriques de rayons distincts ne se recoupent jamais). Pour un
 * seul candidat (cas collapse `k=±1`), l'offset est nul : comportement inchangé (`RAYON_ARC` seul).
 * `pointFinal` (le point marqué, toujours au rayon plein `RAYON_CERCLE_TRIG`) n'est jamais affecté
 * par ce décalage — seul le TRACÉ de l'arc en est déplacé, jamais le point lui-même.
 */
export interface CandidatAideQuelAngle {
  chemin: string;
  fleche: string;
  point: PointCroquisCercleTrig;
}

const ESPACEMENT_RAYON_ARC = 9;

export function calculerAideCandidats(solutions: number[]): CandidatAideQuelAngle[] {
  const n = solutions.length;
  return solutions.map((solution, index) => {
    const offset = n > 1 ? (index - (n - 1) / 2) * (ESPACEMENT_RAYON_ARC / Math.max(1, n - 1)) : 0;
    const trajet = calculerTrajetCercleTrig(solution, solution, RAYON_ARC + offset);
    return { chemin: trajet.chemin, fleche: trajet.fleche, point: trajet.pointFinal };
  });
}

/**
 * "Projections convergentes" de l'aide unique (`promptcorrectionrenduaidegenerateur18.md`, point 2)
 * — pour chaque point candidat, une ligne pointillée jusqu'à sa projection sur l'axe concerné par
 * la variante de l'exercice (X pour cos, Y pour sin, la tangente en `(1,0)` pour tan — même
 * construction que l'aide "Signes" du générateur 14, réutilisée telle quelle via
 * `calculerAideSignes` plutôt que redupliquée) : les deux projections tombent alors visuellement
 * au MÊME point (les deux candidats partagent la même valeur pour la fonction de la variante),
 * rendant explicite ce que l'élève doit en déduire. `projection` est `null` uniquement pour `tan`
 * quand `cos(solution)=0` — n'arrive jamais en pratique pour cet exercice (`réf` exclut 0 et 90
 * pour la variante tan, voir `core/quelAngle.types.ts`), filtré par prudence plutôt que supposé.
 *
 * `visible` (correction demandée directement en conversation, sans fichier prompt dédié — variante
 * tan de cette aide) reprend `pointTanVisible` de `calculerAideSignes` : pour `tan`, l'intersection
 * réelle avec la tangente peut tomber hors du cadre visible (ex. `tan α=√3`, candidat à 60° —
 * `pointTanVisible=false`, tronqué au bord) — dans ce cas `projection` reste le point de
 * TRONCATURE (le pointillé s'y étend toujours), mais `visible=false` signale à la présentation de
 * ne PAS y afficher de marqueur (même règle que le point plein de tan(θ) de l'aide "Signes" du
 * générateur 14, round 7 — un marqueur à un point de troncature suggérerait à tort que
 * l'intersection réelle s'y trouve). Pour `cos`/`sin`, `visible` vaut toujours `true` : la
 * projection orthogonale sur un axe reste par construction toujours dans le cadre (le rayon du
 * cercle est strictement inférieur à la demi-largeur/demi-hauteur du cadre).
 */
export interface ProjectionAideQuelAngle {
  point: PointCroquisCercleTrig;
  projection: PointCroquisCercleTrig;
  visible: boolean;
}

export function calculerAideProjections(fonction: FonctionTrig, solutions: number[]): ProjectionAideQuelAngle[] {
  const projections: ProjectionAideQuelAngle[] = [];
  for (const solution of solutions) {
    const { pointCercle, pointCos, pointSin, pointTan, pointTanVisible } = calculerAideSignes(solution);
    if (fonction === "cos") {
      projections.push({ point: pointCercle, projection: pointCos, visible: true });
    } else if (fonction === "sin") {
      projections.push({ point: pointCercle, projection: pointSin, visible: true });
    } else if (pointTan) {
      projections.push({ point: pointCercle, projection: pointTan, visible: pointTanVisible });
    }
  }
  return projections;
}
