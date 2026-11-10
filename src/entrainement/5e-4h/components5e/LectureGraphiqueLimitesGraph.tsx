import { Line, Mafs, Plot, Point } from "mafs";
import "mafs/core.css";
import type { ExerciceLectureGraphiqueLimites } from "../core5e/lectureGraphiqueLimites.types";
import { EPAISSEUR_TRAIT_ACCENTUE, EPAISSEUR_TRAIT_DISCRETE, RATIO_GRAPHE, ZOOM_MAX, ZOOM_MIN } from "../ui/mafsTransformation";
import { calculerViewBoxLectureGraphique, construireMarqueursPointIsole, construireSegments } from "../ui5e/lectureGraphiqueLimitesCourbe";
import { FenetreVisibleXY5e, GrilleAdaptative5e } from "./mafsGraphPartage5e";
import { useLargeurConteneur } from "../components/useLargeurConteneur";
import "./lectureGraphiqueLimites.css";

interface Props {
  exercice: ExerciceLectureGraphiqueLimites;
}

const COULEUR_COURBE = "#d6336c";
/** Asymptotes dans une couleur DISTINCTE de la courbe et des axes, pleinement opaques, tracées
 * par-dessus le quadrillage : une asymptote x = 0 ou y = 0 ne se confond plus avec un axe (audit 5e
 * ch. 4, point 27). */
const COULEUR_ASYMPTOTE = "#1971c2";
const OPACITE_ASYMPTOTE = 0.95;
const LARGEUR_PAR_DEFAUT = 480;
const LARGEUR_MIN = 280;
const LARGEUR_MAX = 560;

/**
 * Graphe Mafs pour 5gen22 ("Limites et asymptotes, lecture graphique") — courbe PROCÉDURALE (voir
 * `ui5e/lectureGraphiqueLimitesCourbe.ts`), un `Plot.OfX` par morceau (jamais un seul avec
 * exclusion interne, cf. précédent 4e `MafsGraphCaracteristiquesFonction`). Asymptotes verticales/
 * horizontales en `Line.PointAngle`, oblique en `Line.PointSlope` (même style dashed/opacité que le
 * précédent 4e), point(s) isolé(s) en `Point` plein (f(a) RÉELLEMENT défini par continuité).
 */
export function LectureGraphiqueLimitesGraph({ exercice }: Props) {
  const [wrapperRef, largeurMesuree] = useLargeurConteneur<HTMLDivElement>();
  const largeur = Math.min(LARGEUR_MAX, Math.max(LARGEUR_MIN, largeurMesuree || LARGEUR_PAR_DEFAUT));
  const hauteur = largeur / RATIO_GRAPHE;

  const viewBox = calculerViewBoxLectureGraphique(exercice);
  const marqueurs = construireMarqueursPointIsole(exercice);
  const { infini } = exercice;

  return (
    <div className="mafs-graph graphe-lecture-limites" ref={wrapperRef} data-testid="mafs-graph-lecture-graphique-limites">
      {/* `preserveAspectRatio={false}` : échelles x et y indépendantes — avec le « contain » par défaut de
          Mafs, une asymptote oblique raide (grande étendue en y) élargissait aussi l'axe des x et écrasait
          la courbe à 390 px (audit 5e ch. 4, point 26 ; même piège que les graphes de 6e). */}
      <Mafs
        width={largeur}
        height={hauteur}
        viewBox={{ x: viewBox.x, y: viewBox.y, padding: 0 }}
        preserveAspectRatio={false}
        pan={true}
        zoom={{ min: ZOOM_MIN, max: ZOOM_MAX }}
      >
        <GrilleAdaptative5e largeur={largeur} hauteur={hauteur} />

        <FenetreVisibleXY5e largeur={largeur} hauteur={hauteur}>
          {(visible, visibleY) =>
            construireSegments(exercice, visible[0], visible[1], visibleY).map((segment, index) => (
              <Plot.OfX key={index} y={segment.evaluer} domain={segment.domaine} color={COULEUR_COURBE} weight={EPAISSEUR_TRAIT_ACCENTUE} />
            ))
          }
        </FenetreVisibleXY5e>

        {exercice.vas.map((va, index) => (
          <Line.PointAngle key={`va-${index}`} point={[va.position, 0]} angle={Math.PI / 2} color={COULEUR_ASYMPTOTE} style="dashed" weight={EPAISSEUR_TRAIT_DISCRETE * 1.6} opacity={OPACITE_ASYMPTOTE} />
        ))}

        {infini.type === "horizontale" &&
          (infini.limitePlusInfini === infini.limiteMoinsInfini ? (
            <Line.PointAngle point={[0, infini.limitePlusInfini]} angle={0} color={COULEUR_ASYMPTOTE} style="dashed" weight={EPAISSEUR_TRAIT_DISCRETE * 1.6} opacity={OPACITE_ASYMPTOTE} />
          ) : (
            <>
              <Line.PointAngle point={[0, infini.limitePlusInfini]} angle={0} color={COULEUR_ASYMPTOTE} style="dashed" weight={EPAISSEUR_TRAIT_DISCRETE * 1.6} opacity={OPACITE_ASYMPTOTE} />
              <Line.PointAngle point={[0, infini.limiteMoinsInfini]} angle={0} color={COULEUR_ASYMPTOTE} style="dashed" weight={EPAISSEUR_TRAIT_DISCRETE * 1.6} opacity={OPACITE_ASYMPTOTE} />
            </>
          ))}
        {infini.type === "oblique" && <Line.PointSlope point={[0, infini.ordonnee]} slope={infini.pente} color={COULEUR_ASYMPTOTE} style="dashed" weight={EPAISSEUR_TRAIT_DISCRETE * 1.6} opacity={OPACITE_ASYMPTOTE} />}

        {marqueurs.map((m, index) => (
          <Point key={index} x={m.x} y={m.y} color={COULEUR_COURBE} />
        ))}
      </Mafs>
    </div>
  );
}
