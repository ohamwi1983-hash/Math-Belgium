import { useMemo } from "react";
import type { DroiteSolide3D, PlanSolide3D, Point3D, Solide3D } from "../core/geometrieEspace.types";
import {
  calculerEchelleProjection,
  calculerGeometrieSolide3D,
  calculerPolygonePlan,
  calculerSegmentsDroite,
  HAUTEUR_SVG,
  LARGEUR_SVG,
  positionLabelExterieur,
  projeter3DVersPixel,
} from "../ui/solide3DSketch";

export interface PointExtraSolide3D {
  position: Point3D;
  label: string;
  couleur: string;
  /** Étiquette décalée vers l'extérieur du solide (comme celles des sommets) au lieu d'être posée
   * juste au-dessus du point — utile pour un point nommé posé sur une arête (milieu I...). Absent par
   * défaut : comportement historique inchangé. */
  labelExterieur?: boolean;
}

export interface SegmentExtraSolide3D {
  a: Point3D;
  b: Point3D;
  couleur: string;
  pointille?: boolean;
}

interface Props {
  solide: Solide3D;
  /** Plan mis en évidence (coloré/hachuré) — désigné par 3 sommets nommés, jamais montré par
   * équation. */
  plan?: PlanSolide3D;
  /** Droite mise en évidence, désignée par 2 sommets nommés — tracée PROLONGÉE au-delà de ses deux
   * points, partie cachée par le solide en pointillé (`calculerSegmentsDroite`). */
  droite?: DroiteSolide3D;
  /** Même chose que `droite`, mais par 2 points 3D quelconques (ex. un sommet et le milieu nommé
   * d'une arête) — prioritaire sur `droite` quand les deux sont fournis. */
  droitePoints?: [Point3D, Point3D];
  /** Points annexes (ex. points de section, points d'ombre) — coordonnées 3D internes réelles,
   * jamais des sommets nommés du solide. */
  pointsExtra?: PointExtraSolide3D[];
  /** Segments annexes déjà tracés (ex. section en cours de construction, ombre déjà projetée). */
  segmentsExtra?: SegmentExtraSolide3D[];
  /** Masque les étiquettes de sommet — utile quand un écran veut isoler la lecture (rare, défaut
   * toujours affiché). */
  labelsSommets?: boolean;
}

/**
 * Rendu SVG STATIQUE en perspective cavalière — chapitre "Géométrie dans l'espace", partagé par
 * les 3 générateurs du chapitre (jamais mélangé aux graphes Mafs interactifs du reste du projet,
 * ce rendu n'a ni zoom ni pan ni manipulation directe : toute interaction élève passe par des
 * boutons de sélection externes au SVG, jamais un clic direct dessus). Toute la géométrie
 * (projection, visibilité des arêtes, polygone du plan) est déjà calculée par `ui/solide3DSketch.ts`
 * — ce composant ne fait que consommer ces structures, jamais de logique géométrique ici.
 */
export function Solide3DSketch({ solide, plan, droite, droitePoints, pointsExtra = [], segmentsExtra = [], labelsSommets = true }: Props) {
  const geometrie = useMemo(() => calculerGeometrieSolide3D(solide), [solide]);
  const echelleProjection = useMemo(() => calculerEchelleProjection(solide), [solide]);
  const polygonePlan = useMemo(() => (plan ? calculerPolygonePlan(solide, plan) : null), [solide, plan]);
  const extremitesDroite: [Point3D, Point3D] | null = droitePoints ?? (droite ? [solide.sommets[droite[0]], solide.sommets[droite[1]]] : null);
  // Clé par coordonnées : un nouveau tableau à chaque rendu ne doit pas relancer le découpage.
  const cleDroite = extremitesDroite ? JSON.stringify(extremitesDroite) : "";
  const segmentsDroite = useMemo(() => {
    if (!cleDroite) return [];
    const [a, b] = JSON.parse(cleDroite) as [Point3D, Point3D];
    return calculerSegmentsDroite(solide, a, b);
  }, [solide, cleDroite]);

  const aretesCachees = geometrie.aretes.filter((a) => !a.visible);
  const aretesVisibles = geometrie.aretes.filter((a) => a.visible);

  return (
    <svg
      className="solide3d-sketch"
      viewBox={`0 0 ${LARGEUR_SVG} ${HAUTEUR_SVG}`}
      role="img"
      aria-label="Représentation en perspective cavalière du solide"
    >
      {aretesCachees.map((arete) => {
        const [n1, n2] = arete.sommets;
        const p1 = geometrie.sommetsPixel[n1];
        const p2 = geometrie.sommetsPixel[n2];
        return <line key={`${n1}-${n2}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} className="solide3d-arete solide3d-arete-cachee" />;
      })}

      {polygonePlan && polygonePlan.length >= 3 && (
        <polygon points={polygonePlan.map((p) => `${p.x},${p.y}`).join(" ")} className="solide3d-plan" />
      )}

      {aretesVisibles.map((arete) => {
        const [n1, n2] = arete.sommets;
        const p1 = geometrie.sommetsPixel[n1];
        const p2 = geometrie.sommetsPixel[n2];
        return <line key={`${n1}-${n2}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} className="solide3d-arete" />;
      })}

      {segmentsDroite.map((segment, index) => (
        <line
          key={`droite-${index}`}
          x1={segment.x1}
          y1={segment.y1}
          x2={segment.x2}
          y2={segment.y2}
          className={`solide3d-droite${segment.cache ? " is-cachee" : ""}`}
        />
      ))}

      {segmentsExtra.map((segment, index) => {
        const p1 = projeter3DVersPixel(segment.a, echelleProjection);
        const p2 = projeter3DVersPixel(segment.b, echelleProjection);
        return (
          <line
            key={`segment-extra-${index}`}
            x1={p1.x}
            y1={p1.y}
            x2={p2.x}
            y2={p2.y}
            className={`solide3d-segment-extra${segment.pointille ? " is-pointille" : ""}`}
            style={{ stroke: segment.couleur }}
          />
        );
      })}

      {labelsSommets &&
        Object.entries(geometrie.sommetsPixel).map(([nom, p]) => {
          const label = geometrie.labelsSommetsPixel[nom];
          return (
            <g key={`sommet-${nom}`}>
              <circle cx={p.x} cy={p.y} r={2.5} className="solide3d-sommet-point" />
              <text x={label.x} y={label.y} className="solide3d-sommet-label">
                {nom}
              </text>
            </g>
          );
        })}

      {pointsExtra.map((point, index) => {
        const p = projeter3DVersPixel(point.position, echelleProjection);
        const label = point.labelExterieur ? positionLabelExterieur(solide, point.position) : { x: p.x, y: p.y - 11 };
        return (
          <g key={`point-extra-${index}`}>
            <circle cx={p.x} cy={p.y} r={5} className="solide3d-point-extra" style={{ fill: point.couleur }} />
            <text x={label.x} y={label.y} className="solide3d-point-extra-label" style={{ fill: point.couleur }}>
              {point.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
