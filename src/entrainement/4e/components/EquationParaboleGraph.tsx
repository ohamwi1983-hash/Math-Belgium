import { useState } from "react";
import { Line, Mafs, Plot, Point as MafsPoint, Vector } from "mafs";
import "mafs/core.css";
import type { ExerciceEquationParabole } from "../core/equationParabole.types";
import { EPAISSEUR_TRAIT_ACCENTUE, EPAISSEUR_TRAIT_STANDARD, RATIO_GRAPHE, ZOOM_MAX, ZOOM_MIN } from "../ui/mafsTransformation";
import { directriceEquationParabole, pointDirectriceProcheFoyer, viewBoxEquationParabole } from "../ui/equationParaboleGraph";
import { formatIndicateurPasGrille } from "../ui/indicateurPasGrille";
import { DomaineTraceX, DomaineTraceY, GrilleAdaptative, PointCroix } from "./mafsGraphPartage";
import { useLargeurConteneur } from "./useLargeurConteneur";

interface Props {
  exercice: ExerciceEquationParabole;
  /** Marque le sommet — Aide uniquement (ou une fois confirmé), absent par défaut. */
  afficherSommet?: boolean;
  /** Vecteur illustratif directrice→foyer (longueur signée = p) — Aide 1 de l'écran "Équation"
   * uniquement, absent par défaut (`promptgen51modificationscompletes.md`, partie C.2). */
  afficherVecteurP?: boolean;
}

const COULEUR_COURBE = "#1971c2";
const COULEUR_FOYER = "#f08c00";
const COULEUR_VECTEUR_P = "#e03131";

const LARGEUR_PAR_DEFAUT = 420;
const LARGEUR_MIN = 240;
const LARGEUR_MAX = 480;

/**
 * Graphe Mafs de "Équation d'une parabole depuis un graphe" — trace la courbe (jamais son
 * équation, c'est justement ce que l'élève doit déterminer), la directrice et marque le foyer F
 * (tous deux toujours visibles, données du graphe). Axe vertical → `Plot.OfX` (y fonction de x) ;
 * axe horizontal → `Plot.OfY` (x fonction de y, jamais `Plot.OfX` qui ne pourrait pas représenter
 * une branche verticale — même précaution que `MafsGraphFonctionsReference.tsx` pour ses courbes
 * non fonctionnelles de x). Cadrage dérivé de S/F/latus rectum/directrice
 * (`viewBoxEquationParabole`, `ui/equationParaboleGraph.ts`).
 *
 * Code couleur (`promptgen51modificationscompletes.md`, partie B.2) : sommet S de la MÊME couleur
 * que la courbe (jamais une couleur distincte — contrairement à l'ancienne convention verte) ;
 * foyer F en CROIX (`PointCroix`, même convention que le centre d'un cercle, gen49/50), jamais un
 * point plein ; directrice de la MÊME couleur que le foyer F (`Line.PointAngle`, angle 0 pour une
 * directrice horizontale — axe vertical —, π/2 pour une directrice verticale — axe horizontal).
 */
export function EquationParaboleGraph({ exercice, afficherSommet = false, afficherVecteurP = false }: Props) {
  const [wrapperRef, largeurMesuree] = useLargeurConteneur<HTMLDivElement>();
  const largeur = Math.min(LARGEUR_MAX, Math.max(LARGEUR_MIN, largeurMesuree || LARGEUR_PAR_DEFAUT));
  const hauteur = largeur / RATIO_GRAPHE;
  const viewBox = viewBoxEquationParabole(exercice);
  const [pas, setPas] = useState<{ x: number; y: number } | null>(null);
  const { sommet, foyer, p } = exercice;
  const directrice = directriceEquationParabole(exercice);
  const pointDirectrice = pointDirectriceProcheFoyer(exercice);

  return (
    <div className="mafs-graph" ref={wrapperRef}>
      <Mafs width={largeur} height={hauteur} viewBox={{ x: viewBox.x, y: viewBox.y, padding: 0 }} pan={true} zoom={{ min: ZOOM_MIN, max: ZOOM_MAX }}>
        <GrilleAdaptative largeur={largeur} hauteur={hauteur} onPasChange={(x, y) => setPas({ x, y })} />
        {exercice.variante === "vertical" ? (
          <DomaineTraceX largeur={largeur}>
            {(domaine) => <Plot.OfX y={(x) => sommet.y + (x - sommet.x) ** 2 / (2 * p)} domain={domaine} color={COULEUR_COURBE} weight={EPAISSEUR_TRAIT_ACCENTUE} />}
          </DomaineTraceX>
        ) : (
          <DomaineTraceY hauteur={hauteur}>
            {(domaine) => <Plot.OfY x={(y) => sommet.x + (y - sommet.y) ** 2 / (2 * p)} domain={domaine} color={COULEUR_COURBE} weight={EPAISSEUR_TRAIT_ACCENTUE} />}
          </DomaineTraceY>
        )}
        {exercice.variante === "vertical" ? (
          <Line.PointAngle point={[sommet.x, directrice]} angle={0} color={COULEUR_FOYER} weight={EPAISSEUR_TRAIT_STANDARD} />
        ) : (
          <Line.PointAngle point={[directrice, sommet.y]} angle={Math.PI / 2} color={COULEUR_FOYER} weight={EPAISSEUR_TRAIT_STANDARD} />
        )}
        {afficherSommet && <MafsPoint x={sommet.x} y={sommet.y} color={COULEUR_COURBE} />}
        <PointCroix x={foyer.x} y={foyer.y} color={COULEUR_FOYER} />
        {afficherVecteurP && <Vector tail={[pointDirectrice.x, pointDirectrice.y]} tip={[foyer.x, foyer.y]} color={COULEUR_VECTEUR_P} weight={EPAISSEUR_TRAIT_ACCENTUE} />}
      </Mafs>
      {pas && <p className="mafs-graph-pas">{formatIndicateurPasGrille(pas.x, pas.y)}</p>}
    </div>
  );
}
