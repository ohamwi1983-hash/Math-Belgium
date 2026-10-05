import { useState } from "react";
import { Line, Mafs, Point, Polyline } from "mafs";
import "mafs/core.css";
import type { CourbeGraphique, PointGraphique } from "../core5e/composeeGraphique.types";
import { X_MAX_CADRE, X_MIN_CADRE, Y_MAX_CADRE, Y_MIN_CADRE } from "../generateurs5e/composeeGraphique/courbes";
import { extremitesCourbe, pointsLissesCourbe } from "../ui5e/composeeGraphiqueGraph";
import { EPAISSEUR_TRAIT_ACCENTUE, EPAISSEUR_TRAIT_DISCRETE, RATIO_GRAPHE, ZOOM_MAX, ZOOM_MIN } from "../ui/mafsTransformation";
import { formatIndicateurPasGrille } from "../ui/indicateurPasGrille";
import { GrilleAdaptative } from "../components/mafsGraphPartage";
import { useLargeurConteneur } from "../components/useLargeurConteneur";

const COULEUR_AIDE = "#6d28d9";

interface Props {
  courbe: CourbeGraphique;
  couleur: string;
  nom: string;
  /** Point à révéler (aide niveau 2, E.7) — coordonnées entières d'un nœud RÉEL de `courbe`,
   * accompagné de 2 pointillés violets vers les axes. `null`/absent par défaut, rien de plus
   * affiché tant que l'aide n'a pas atteint ce palier. */
  pointRevele?: PointGraphique | null;
}

const LARGEUR_PAR_DEFAUT = 320;
const LARGEUR_MIN = 240;
const LARGEUR_MAX = 400;

/**
 * Une seule courbe (ligne brisée à nœuds de grille entiers, voir `core5e/composeeGraphique.types.ts`)
 * sur un cadre FIXE `[-8,8]×[-8,8]` (jamais un viewBox dynamique — contrairement aux autres graphes
 * Mafs de la plateforme, les 2 courbes de 5gen4 partagent toujours le même cadre, condition
 * nécessaire pour comparer visuellement leurs domaines respectifs). Points PLEINS aux 2 extrémités
 * (défini/continu jusque-là, rien au-delà — même convention "point plein = défini" que gen12, 4e,
 * appliquée ici aux seules bornes du domaine puisque la courbe elle-même n'a aucune discontinuité
 * interne). Tracé RENDU en spline lisse (`pointsLissesCourbe`, E.6) via `Polyline` — jamais les
 * données brutes (`courbe.points`), qui restent la seule source de vérité pour les questions/la
 * vérification.
 */
export function CourbeGraph({ courbe, couleur, nom, pointRevele }: Props) {
  const [ref, largeurMesuree] = useLargeurConteneur<HTMLDivElement>();
  const largeur = Math.min(LARGEUR_MAX, Math.max(LARGEUR_MIN, largeurMesuree || LARGEUR_PAR_DEFAUT));
  const hauteur = largeur / RATIO_GRAPHE;
  const [debut, fin] = extremitesCourbe(courbe);
  const [pas, setPas] = useState<{ x: number; y: number } | null>(null);

  return (
    <div ref={ref} className="courbe-graph-conteneur mafs-graph">
      <p className="courbe-graph-label">{nom}</p>
      <Mafs width={largeur} height={hauteur} viewBox={{ x: [X_MIN_CADRE, X_MAX_CADRE], y: [Y_MIN_CADRE, Y_MAX_CADRE], padding: 0 }} pan={true} zoom={{ min: ZOOM_MIN, max: ZOOM_MAX }}>
        <GrilleAdaptative largeur={largeur} hauteur={hauteur} onPasChange={(x, y) => setPas({ x, y })} />
        <Polyline points={pointsLissesCourbe(courbe).map((p): [number, number] => [p.x, p.y])} color={couleur} weight={EPAISSEUR_TRAIT_ACCENTUE} fillOpacity={0} />
        <Point x={debut.x} y={debut.y} color={couleur} />
        <Point x={fin.x} y={fin.y} color={couleur} />
        {pointRevele && (
          <>
            <Line.Segment point1={[0, pointRevele.y]} point2={[pointRevele.x, pointRevele.y]} color={COULEUR_AIDE} weight={EPAISSEUR_TRAIT_DISCRETE} style="dashed" />
            <Line.Segment point1={[pointRevele.x, 0]} point2={[pointRevele.x, pointRevele.y]} color={COULEUR_AIDE} weight={EPAISSEUR_TRAIT_DISCRETE} style="dashed" />
            <Point x={pointRevele.x} y={pointRevele.y} color={COULEUR_AIDE} />
          </>
        )}
      </Mafs>
      {pas && <p className="mafs-graph-pas">{formatIndicateurPasGrille(pas.x, pas.y)}</p>}
    </div>
  );
}
