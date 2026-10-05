import { useState } from "react";
import { Circle, Line, Mafs, Point as MafsPoint } from "mafs";
import "mafs/core.css";
import type { ExerciceEquationCercle } from "../core/equationCercle.types";
import { EPAISSEUR_TRAIT_ACCENTUE, EPAISSEUR_TRAIT_STANDARD, RATIO_GRAPHE, ZOOM_MAX, ZOOM_MIN, etendreViewBoxPourEtiquettes } from "../ui/mafsTransformation";
import { viewBoxEquationCercle } from "../ui/equationCercleGraph";
import { formatIndicateurPasGrille } from "../ui/indicateurPasGrille";
import { GrilleAdaptative, PointCroix } from "./mafsGraphPartage";
import { useLargeurConteneur } from "./useLargeurConteneur";

interface Props {
  exercice: ExerciceEquationCercle;
  /** Segment pointillé du centre au point marqué — Aide uniquement, absent par défaut. */
  afficherRayon?: boolean;
  /** Marque le centre du cercle — Aide uniquement (ou une fois confirmé), absent par défaut. */
  afficherCentre?: boolean;
}

const COULEUR_CERCLE = "#1971c2";
const COULEUR_POINT = "#f08c00";
const COULEUR_CENTRE = "#2f9e44";

const LARGEUR_PAR_DEFAUT = 420;
const LARGEUR_MIN = 240;
const LARGEUR_MAX = 480;

/**
 * Graphe Mafs de "Équation d'un cercle (non développée) à partir d'un graphe" — trace le cercle
 * (jamais son centre/rayon sous forme numérique, c'est justement ce que l'élève doit déterminer) et
 * marque le point donné en énoncé. Cadrage dérivé des 4 points cardinaux du cercle
 * (`viewBoxEquationCercle`, `ui/equationCercleGraph.ts`) plutôt que d'un domaine fixe.
 */
export function EquationCercleGraph({ exercice, afficherRayon = false, afficherCentre = false }: Props) {
  const [wrapperRef, largeurMesuree] = useLargeurConteneur<HTMLDivElement>();
  const largeur = Math.min(LARGEUR_MAX, Math.max(LARGEUR_MIN, largeurMesuree || LARGEUR_PAR_DEFAUT));
  const hauteur = largeur / RATIO_GRAPHE;
  const viewBox = viewBoxEquationCercle(exercice);
  const viewBoxEtendu = etendreViewBoxPourEtiquettes(viewBox);
  const [pas, setPas] = useState<{ x: number; y: number } | null>(null);

  return (
    <div className="mafs-graph" ref={wrapperRef}>
      <Mafs width={largeur} height={hauteur} viewBox={{ x: viewBoxEtendu.x, y: viewBoxEtendu.y, padding: 0 }} pan={true} zoom={{ min: ZOOM_MIN, max: ZOOM_MAX }}>
        <GrilleAdaptative largeur={largeur} hauteur={hauteur} onPasChange={(x, y) => setPas({ x, y })} />
        <Circle center={[exercice.centre.x, exercice.centre.y]} radius={exercice.rayon} color={COULEUR_CERCLE} weight={EPAISSEUR_TRAIT_ACCENTUE} fillOpacity={0} />
        {afficherCentre && <PointCroix x={exercice.centre.x} y={exercice.centre.y} color={COULEUR_CENTRE} />}
        {afficherRayon && (
          <Line.Segment
            point1={[exercice.centre.x, exercice.centre.y]}
            point2={[exercice.pointMarque.x, exercice.pointMarque.y]}
            color={COULEUR_POINT}
            style="dashed"
            weight={EPAISSEUR_TRAIT_STANDARD}
          />
        )}
        <MafsPoint x={exercice.pointMarque.x} y={exercice.pointMarque.y} color={COULEUR_POINT} />
      </Mafs>
      {pas && <p className="mafs-graph-pas">{formatIndicateurPasGrille(pas.x, pas.y)}</p>}
    </div>
  );
}
