import { Circle, Line, Mafs, Plot, Point } from "mafs";
import "mafs/core.css";
import type { ExerciceEtudierFonction } from "../core5e/etudierFonction.types";
import { EPAISSEUR_TRAIT_ACCENTUE, EPAISSEUR_TRAIT_DISCRETE, RATIO_GRAPHE } from "../ui/mafsTransformation";
import { calculerViewBoxEtudierFonction, construireSegmentsEtudierFonction } from "../ui5e/etudierFonctionCourbe";
import { exclusionsCE, typeAsymptotique } from "../moteur5e/verificationEtudierFonction";
import { GrilleAdaptative5e } from "./mafsGraphPartage5e";
import { useLargeurConteneur } from "../components/useLargeurConteneur";
import { TOLERANCE_AFFICHEE } from "./PlacementPointsGraphique";
import type { PointConfirmePlacement } from "./PlacementPointsGraphique";

interface Props {
  exercice: ExerciceEtudierFonction;
  onTap: (x: number, y: number) => void;
  zoneAide: { x: number; y: number } | null;
  propositionsConfirmees: PointConfirmePlacement[];
  dernierTapRate: { x: number; y: number } | null;
}

const COULEUR_COURBE = "#d6336c";
const COULEUR_AIDE = "#37b24d";
const COULEUR_CORRECT = "#2f9e44";
const COULEUR_REVELE = "#e8590c";
const COULEUR_RATE = "#e03131";
const LARGEUR_PAR_DEFAUT = 480;
const LARGEUR_MIN = 280;
const LARGEUR_MAX = 560;

/**
 * Graphe Mafs pour l'écran "graphique" de 5gen31 — courbe RÉELLE (`ui5e/etudierFonctionCourbe.ts`),
 * jamais réutilisé de 5gen22/5gen30 (voir tête de fichier de ce module). `pan={false}` (jamais de
 * zoom) : le tap direct doit rester fiable/prévisible sur mobile, un geste de pan concurrent
 * introduirait une ambiguïté tactile. Capture les taps via le prop natif `Mafs.onClick`, qui fournit
 * directement les coordonnées EN ESPACE DE DONNÉES (`vec.Vector2`), jamais des pixels écran.
 */
export function EtudierFonctionGraph({ exercice, onTap, zoneAide, propositionsConfirmees, dernierTapRate }: Props) {
  const [wrapperRef, largeurMesuree] = useLargeurConteneur<HTMLDivElement>();
  const largeur = Math.min(LARGEUR_MAX, Math.max(LARGEUR_MIN, largeurMesuree || LARGEUR_PAR_DEFAUT));
  const hauteur = largeur / RATIO_GRAPHE;

  const viewBox = calculerViewBoxEtudierFonction(exercice);
  const segments = construireSegmentsEtudierFonction(exercice);
  const exclusions = exclusionsCE(exercice);
  const type = typeAsymptotique(exercice);

  return (
    <div className="mafs-graph" ref={wrapperRef} data-testid="mafs-graph-etudier-fonction">
      <Mafs width={largeur} height={hauteur} viewBox={{ x: viewBox.x, y: viewBox.y, padding: 0 }} pan={false} onClick={(point) => onTap(point[0], point[1])}>
        <GrilleAdaptative5e largeur={largeur} hauteur={hauteur} />

        {zoneAide && <Circle center={[zoneAide.x, zoneAide.y]} radius={TOLERANCE_AFFICHEE} color={COULEUR_AIDE} fillOpacity={0.25} strokeOpacity={0} />}

        {segments.map((segment, index) => (
          <Plot.OfX key={index} y={segment.evaluer} domain={segment.domaine} color={COULEUR_COURBE} weight={EPAISSEUR_TRAIT_ACCENTUE} />
        ))}

        {exclusions.map((position, index) => (
          <Line.PointAngle key={`va-${index}`} point={[position, 0]} angle={Math.PI / 2} color={COULEUR_COURBE} style="dashed" weight={EPAISSEUR_TRAIT_DISCRETE} opacity={0.5} />
        ))}

        {type === "horizontale" && <Line.PointAngle point={[0, 0]} angle={0} color={COULEUR_COURBE} style="dashed" weight={EPAISSEUR_TRAIT_DISCRETE} opacity={0.5} />}
        {exercice.famille === "rationnelleAO" && (
          <Line.PointSlope point={[0, exercice.b]} slope={exercice.a} color={COULEUR_COURBE} style="dashed" weight={EPAISSEUR_TRAIT_DISCRETE} opacity={0.5} />
        )}

        {propositionsConfirmees.map((p, index) => (
          <Point key={`ok-${index}`} x={p.x} y={p.y} color={p.correct ? COULEUR_CORRECT : COULEUR_REVELE} />
        ))}
        {dernierTapRate && <Point x={dernierTapRate.x} y={dernierTapRate.y} color={COULEUR_RATE} />}
      </Mafs>
    </div>
  );
}
