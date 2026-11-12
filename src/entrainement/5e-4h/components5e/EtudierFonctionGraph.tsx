import { Line, Mafs, Plot, Point, Polygon } from "mafs";
import "mafs/core.css";
import type { ExerciceEtudierFonction } from "../core5e/etudierFonction.types";
import { EPAISSEUR_TRAIT_ACCENTUE, EPAISSEUR_TRAIT_DISCRETE, RATIO_GRAPHE } from "../ui/mafsTransformation";
import { calculerViewBoxEtudierFonction, construireSegmentsEtudierFonction } from "../ui5e/etudierFonctionCourbe";
import { decalageVertical, exclusionsCE, typeAsymptotique } from "../moteur5e/verificationEtudierFonction";
import { GrilleAdaptative5e } from "./mafsGraphPartage5e";
import { useLargeurConteneur } from "../components/useLargeurConteneur";
import type { EchellePixels, PointConfirmePlacement } from "./PlacementPointsGraphique";

interface Props {
  exercice: ExerciceEtudierFonction;
  onTap: (x: number, y: number, echelle: EchellePixels) => void;
  /** Aide : bande verticale à l'abscisse du point demandé (jamais le point lui-même). */
  abscisseAide: number | null;
  propositionsConfirmees: PointConfirmePlacement[];
  dernierTapRate: { x: number; y: number } | null;
  /** Courbe affichée seulement une fois tous les points placés (sinon placer un point reviendrait à
   * le lire sur la courbe). */
  afficherCourbe: boolean;
}

const COULEUR_COURBE = "#d6336c";
const COULEUR_AIDE = "#37b24d";
const COULEUR_CORRECT = "#2f9e44";
const COULEUR_REVELE = "#e8590c";
const COULEUR_RATE = "#e03131";
const LARGEUR_PAR_DEFAUT = 480;
const LARGEUR_MIN = 280;
const LARGEUR_MAX = 560;
const DEMI_LARGEUR_BANDE_PX = 9;

/**
 * Graphe Mafs pour l'écran « graphique » de 5gen31. Fenêtre bornée par les points remarquables et
 * repère NON isotrope (`preserveAspectRatio={false}`) ; `pan={false}` (le tap doit rester fiable au
 * doigt). `Mafs.onClick` fournit les coordonnées en espace de données ; l'échelle (pixels par unité)
 * accompagne chaque tap pour une tolérance exprimée en pixels.
 */
export function EtudierFonctionGraph({ exercice, onTap, abscisseAide, propositionsConfirmees, dernierTapRate, afficherCourbe }: Props) {
  const [wrapperRef, largeurMesuree] = useLargeurConteneur<HTMLDivElement>();
  const largeur = Math.min(LARGEUR_MAX, Math.max(LARGEUR_MIN, largeurMesuree || LARGEUR_PAR_DEFAUT));
  const hauteur = largeur / RATIO_GRAPHE;

  const viewBox = calculerViewBoxEtudierFonction(exercice);
  const echelle: EchellePixels = { x: largeur / (viewBox.x[1] - viewBox.x[0]), y: hauteur / (viewBox.y[1] - viewBox.y[0]) };
  const segments = construireSegmentsEtudierFonction(exercice);
  const exclusions = exclusionsCE(exercice);
  const type = typeAsymptotique(exercice);
  const demiBande = DEMI_LARGEUR_BANDE_PX / echelle.x;

  return (
    <div className="mafs-graph" ref={wrapperRef} data-testid="mafs-graph-etudier-fonction">
      <Mafs width={largeur} height={hauteur} viewBox={{ x: viewBox.x, y: viewBox.y, padding: 0 }} preserveAspectRatio={false} pan={false} onClick={(point) => onTap(point[0], point[1], echelle)}>
        <GrilleAdaptative5e largeur={largeur} hauteur={hauteur} />

        {abscisseAide !== null && (
          <Polygon
            points={[
              [abscisseAide - demiBande, viewBox.y[0]],
              [abscisseAide + demiBande, viewBox.y[0]],
              [abscisseAide + demiBande, viewBox.y[1]],
              [abscisseAide - demiBande, viewBox.y[1]],
            ]}
            color={COULEUR_AIDE}
            fillOpacity={0.2}
            strokeOpacity={0}
          />
        )}

        {afficherCourbe && segments.map((segment, index) => <Plot.OfX key={index} y={segment.evaluer} domain={segment.domaine} color={COULEUR_COURBE} weight={EPAISSEUR_TRAIT_ACCENTUE} />)}

        {exclusions.map((position, index) => (
          <Line.PointAngle key={`va-${index}`} point={[position, 0]} angle={Math.PI / 2} color={COULEUR_COURBE} style="dashed" weight={EPAISSEUR_TRAIT_DISCRETE} opacity={0.5} />
        ))}

        {type === "horizontale" && <Line.PointAngle point={[0, decalageVertical(exercice)]} angle={0} color={COULEUR_COURBE} style="dashed" weight={EPAISSEUR_TRAIT_DISCRETE} opacity={0.5} />}
        {exercice.famille === "rationnelleAO" && <Line.PointSlope point={[0, exercice.b]} slope={exercice.a} color={COULEUR_COURBE} style="dashed" weight={EPAISSEUR_TRAIT_DISCRETE} opacity={0.5} />}

        {propositionsConfirmees.map((p, index) => (
          <Point key={`ok-${index}`} x={p.x} y={p.y} color={p.correct ? COULEUR_CORRECT : COULEUR_REVELE} />
        ))}
        {dernierTapRate && <Point x={dernierTapRate.x} y={dernierTapRate.y} color={COULEUR_RATE} />}
      </Mafs>
    </div>
  );
}
