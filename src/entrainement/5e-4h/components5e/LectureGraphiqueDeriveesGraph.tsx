import { Line, Mafs, Plot, Point, Polygon } from "mafs";
import "mafs/core.css";
import type { ExerciceLectureGraphiqueDerivees } from "../core5e/lectureGraphiqueDerivees.types";
import { EPAISSEUR_TRAIT_ACCENTUE, EPAISSEUR_TRAIT_DISCRETE, RATIO_GRAPHE, ZOOM_MAX, ZOOM_MIN } from "../ui/mafsTransformation";
import { calculerViewBoxLectureGraphiqueDerivees, calculerZoneSurlignage, construireMarqueursPointIsole, construireSegmentsDerivees } from "../ui5e/lectureGraphiqueDeriveesCourbe";
import type { ZoneSurlignage } from "../ui5e/lectureGraphiqueDeriveesCourbe";
import { FenetreVisibleXY5e, GrilleAdaptative5e } from "./mafsGraphPartage5e";
import { useLargeurConteneur } from "../components/useLargeurConteneur";

interface Props {
  exercice: ExerciceLectureGraphiqueDerivees;
  /** Aide VISUELLE (niveau 1, jamais de texte) — surligne la zone concernée par le champ actif. */
  surlignage?: ZoneSurlignage | null;
}

const COULEUR_COURBE = "#d6336c";
const COULEUR_SURLIGNAGE = "#37b24d";
const LARGEUR_PAR_DEFAUT = 480;
const LARGEUR_MIN = 280;
const LARGEUR_MAX = 560;

/**
 * Graphe Mafs pour 5gen30 ("Lecture graphique — dérivées et applications") — courbe PROCÉDURALE
 * (`ui5e/lectureGraphiqueDeriveesCourbe.ts`, baseTrend + bumps), jamais l'ancien composant 5gen22
 * réutilisé tel quel : la fonction rendue ici a des extrema/points d'inflexion intérieurs que
 * 5gen22 ne sait pas produire. Aucun marqueur d'extremum/PI dessiné explicitement — l'élève doit
 * les LIRE sur la forme de la courbe elle-même, jamais les recevoir tout faits.
 */
export function LectureGraphiqueDeriveesGraph({ exercice, surlignage }: Props) {
  const [wrapperRef, largeurMesuree] = useLargeurConteneur<HTMLDivElement>();
  const largeur = Math.min(LARGEUR_MAX, Math.max(LARGEUR_MIN, largeurMesuree || LARGEUR_PAR_DEFAUT));
  const hauteur = largeur / RATIO_GRAPHE;

  const viewBox = calculerViewBoxLectureGraphiqueDerivees(exercice);
  const marqueurs = construireMarqueursPointIsole(exercice);
  const zoneBande = surlignage ? calculerZoneSurlignage(exercice, surlignage, viewBox.x) : null;
  const { infini } = exercice.asymptotique;

  return (
    <div className="mafs-graph" ref={wrapperRef} data-testid="mafs-graph-lecture-graphique-derivees">
      <Mafs width={largeur} height={hauteur} viewBox={{ x: viewBox.x, y: viewBox.y, padding: 0 }} pan={true} zoom={{ min: ZOOM_MIN, max: ZOOM_MAX }}>
        <GrilleAdaptative5e largeur={largeur} hauteur={hauteur} />

        {zoneBande && (
          <Polygon
            points={[
              [zoneBande[0], viewBox.y[0]],
              [zoneBande[1], viewBox.y[0]],
              [zoneBande[1], viewBox.y[1]],
              [zoneBande[0], viewBox.y[1]],
            ]}
            color={COULEUR_SURLIGNAGE}
            fillOpacity={0.18}
            strokeOpacity={0}
          />
        )}

        <FenetreVisibleXY5e largeur={largeur} hauteur={hauteur}>
          {(visible, visibleY) =>
            construireSegmentsDerivees(exercice, visible[0], visible[1], visibleY).map((segment, index) => (
              <Plot.OfX key={index} y={segment.evaluer} domain={segment.domaine} color={COULEUR_COURBE} weight={EPAISSEUR_TRAIT_ACCENTUE} />
            ))
          }
        </FenetreVisibleXY5e>

        {exercice.asymptotique.vas.map((va, index) => (
          <Line.PointAngle key={`va-${index}`} point={[va.position, 0]} angle={Math.PI / 2} color={COULEUR_COURBE} style="dashed" weight={EPAISSEUR_TRAIT_DISCRETE} opacity={0.5} />
        ))}

        {infini.type === "horizontale" &&
          (infini.limitePlusInfini === infini.limiteMoinsInfini ? (
            <Line.PointAngle point={[0, infini.limitePlusInfini]} angle={0} color={COULEUR_COURBE} style="dashed" weight={EPAISSEUR_TRAIT_DISCRETE} opacity={0.5} />
          ) : (
            <>
              <Line.PointAngle point={[0, infini.limitePlusInfini]} angle={0} color={COULEUR_COURBE} style="dashed" weight={EPAISSEUR_TRAIT_DISCRETE} opacity={0.5} />
              <Line.PointAngle point={[0, infini.limiteMoinsInfini]} angle={0} color={COULEUR_COURBE} style="dashed" weight={EPAISSEUR_TRAIT_DISCRETE} opacity={0.5} />
            </>
          ))}
        {infini.type === "oblique" && <Line.PointSlope point={[0, infini.ordonnee]} slope={infini.pente} color={COULEUR_COURBE} style="dashed" weight={EPAISSEUR_TRAIT_DISCRETE} opacity={0.5} />}

        {marqueurs.map((m, index) => (
          <Point key={index} x={m.x} y={m.y} color={COULEUR_COURBE} />
        ))}
      </Mafs>
    </div>
  );
}
