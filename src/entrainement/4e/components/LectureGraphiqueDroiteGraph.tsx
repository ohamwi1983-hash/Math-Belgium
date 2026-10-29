import { useState } from "react";
import { Line, Mafs, Point as MafsPoint } from "mafs";
import "mafs/core.css";
import type { ExerciceLectureGraphiqueDroite } from "../core/lectureGraphiqueDroite.types";
import type { Point } from "../core/vecteur.types";
import { EPAISSEUR_TRAIT_ACCENTUE, RATIO_GRAPHE, ZOOM_MAX, ZOOM_MIN, etendreViewBoxPourEtiquettes } from "../ui/mafsTransformation";
import { PAS_GRILLE_LECTURE, pointsEntiersVisibles, viewBoxLectureGraphiqueDroite } from "../ui/lectureGraphiqueDroiteGraph";
import { formatIndicateurPasGrille } from "../ui/indicateurPasGrille";
import { GrilleAdaptative } from "./mafsGraphPartage";
import { useLargeurConteneur } from "./useLargeurConteneur";

interface Props {
  exercice: ExerciceLectureGraphiqueDroite;
  /** Points-exemple mis en évidence (Aide niveau 2) — absents par défaut. */
  pointsSurlignes?: Point[];
}

const COULEUR_DROITE = "#1971c2";
const COULEUR_POINT = "#495057";
const COULEUR_SURLIGNAGE = "#f08c00";

const LARGEUR_PAR_DEFAUT = 420;
const LARGEUR_MIN = 240;
const LARGEUR_MAX = 480;
/** Largeur (px) en dessous de laquelle deux nombres consécutifs de l'axe X se chevaucheraient. */
const LARGEUR_MIN_PAR_ETIQUETTE = 24;

/**
 * Graphe Mafs de "Lecture graphique — équation d'une droite" — trace la droite (jamais sous forme
 * numérique) et marque les points à coordonnées entières réellement visibles, sans jamais afficher
 * l'équation elle-même (c'est justement ce que l'élève doit trouver). Réutilise `Line.PointAngle`
 * (déjà établie dans le projet pour tracer une droite infinie, ex. les asymptotes de
 * `MafsGraphCaracteristiquesFonction.tsx`) — angle calculé via `atan2`, universellement correct y
 * compris pour les cas verticale/horizontale, jamais de branchement spécial.
 */
export function LectureGraphiqueDroiteGraph({ exercice, pointsSurlignes = [] }: Props) {
  const [wrapperRef, largeurMesuree] = useLargeurConteneur<HTMLDivElement>();
  const largeur = Math.min(LARGEUR_MAX, Math.max(LARGEUR_MIN, largeurMesuree || LARGEUR_PAR_DEFAUT));
  const hauteur = largeur / RATIO_GRAPHE;
  const viewBox = viewBoxLectureGraphiqueDroite(exercice);
  const viewBoxEtendu = etendreViewBoxPourEtiquettes(viewBox);
  // Pas de 1 sur un graphe étroit (téléphone) : un nombre X sur deux, sinon ils se chevauchent.
  const etiquettesSerrees = largeur / (viewBoxEtendu.x[1] - viewBoxEtendu.x[0]) < LARGEUR_MIN_PAR_ETIQUETTE;
  const [pas, setPas] = useState<{ x: number; y: number } | null>(null);
  const angle = Math.atan2(exercice.vecteur.y, exercice.vecteur.x);
  const points = pointsEntiersVisibles(exercice);
  const estSurligne = (p: Point) => pointsSurlignes.some((s) => s.x === p.x && s.y === p.y);

  return (
    <div className="mafs-graph" ref={wrapperRef}>
      <Mafs width={largeur} height={hauteur} viewBox={{ x: viewBoxEtendu.x, y: viewBoxEtendu.y, padding: 0 }} pan={true} zoom={{ min: ZOOM_MIN, max: ZOOM_MAX }}>
        <GrilleAdaptative largeur={largeur} hauteur={hauteur} onPasChange={(x, y) => setPas({ x, y })} pasFixe={PAS_GRILLE_LECTURE} uneEtiquetteXSurDeux={etiquettesSerrees} />
        <Line.PointAngle point={[exercice.point.x, exercice.point.y]} angle={angle} color={COULEUR_DROITE} weight={EPAISSEUR_TRAIT_ACCENTUE} />
        {points.map((p, i) => (
          <MafsPoint key={`point-${i}`} x={p.x} y={p.y} color={estSurligne(p) ? COULEUR_SURLIGNAGE : COULEUR_POINT} />
        ))}
      </Mafs>
      {pas && <p className="mafs-graph-pas">{formatIndicateurPasGrille(pas.x, pas.y)}</p>}
    </div>
  );
}
