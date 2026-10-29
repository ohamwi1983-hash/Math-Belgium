import { Line, Mafs, Point as MafsPoint, Transform, useTransformContext, vec } from "mafs";
import "mafs/core.css";
import type { ExerciceConstructionParabole } from "../core/constructionParabole.types";
import type { Point } from "../core/vecteur.types";
import { EPAISSEUR_TRAIT_ACCENTUE, EPAISSEUR_TRAIT_STANDARD, RATIO_GRAPHE, ZOOM_MAX, ZOOM_MIN } from "../ui/mafsTransformation";
import { demiPorteeTraceParabole, pointsCourbeRevelee, viewBoxTraceParabole } from "../ui/traceParaboleGraph";
import { GrilleTournee, PointCroix } from "./mafsGraphPartage";
import { useLargeurConteneur } from "./useLargeurConteneur";

interface Props {
  exercice: ExerciceConstructionParabole;
  cibles: Point[];
  selectionnesIndices: number[];
  onClicPoint: (index: number) => void;
  /** Courbe complète tracée (réponse révélée) — absente par défaut. */
  afficherCourbeComplete?: boolean;
  /** Écran clos : plus aucun clic n'est pris en compte. */
  verrouille?: boolean;
}

const RAYON_TOUCHE_MAX = 22;
const RAYON_TOUCHE_MIN = 8;

/** Disques transparents de touche, un par point cible — rendus DANS le `<Transform>` (lisent la
 * matrice composée pour mesurer les distances écran entre points). Rayon = la moitié de la distance
 * écran au point le plus proche, borné à [8 ; 22] px. */
function CiblesCliquables({ cibles, onClicPoint, actif }: { cibles: Point[]; onClicPoint: (index: number) => void; actif: boolean }) {
  const { viewTransform, userTransform } = useTransformContext();
  const matrice = vec.matrixMult(viewTransform, userTransform);
  const ecran = cibles.map((c) => vec.transform([c.x, c.y], matrice));
  return (
    <>
      {cibles.map((cible, index) => {
        const distanceMin = Math.min(Infinity, ...ecran.filter((_, j) => j !== index).map((p) => vec.dist(p, ecran[index]!)));
        const rayon = Math.max(RAYON_TOUCHE_MIN, Math.min(RAYON_TOUCHE_MAX, distanceMin / 2));
        return (
          <MafsPoint
            key={`touche-${index}`}
            x={cible.x}
            y={cible.y}
            opacity={0.001}
            svgCircleProps={{ r: rayon, onClick: actif ? () => onClicPoint(index) : undefined, style: { cursor: actif ? "pointer" : "default" } }}
          />
        );
      })}
    </>
  );
}

const COULEUR_DIRECTRICE = "#495057";
const COULEUR_FOYER = "#f08c00";
const COULEUR_NON_SELECTIONNE = "#868e96";
const COULEUR_SELECTIONNE = "#2f9e44";
const COULEUR_COURBE = "#1971c2";

const LARGEUR_PAR_DEFAUT = 420;
const LARGEUR_MIN = 240;
const LARGEUR_MAX = 480;

/**
 * Graphe Mafs de l'écran final "trace" — mêmes conventions de grille tournée que
 * `ConstructionParaboleGraph.tsx` (voir son en-tête). Les 6 points cibles sont FIXES (jamais
 * `MovablePoint` — déjà entièrement déterminés par la construction des 3 itérations précédentes) ;
 * `Point.svgCircleProps.onClick` (SVG natif, Mafs ne propose aucun gestionnaire de clic dédié par
 * point) sert de seul mécanisme d'interaction. La VRAIE courbe analytique de la parabole est révélée
 * PROGRESSIVEMENT comme une POLYLINE DENSE de `Line.Segment` (`pointsCourbeRevelee`,
 * `ui/traceParaboleGraph.ts`) — jamais `Plot.*` (`Plot.Parametric`/`Plot.OfX`), dont le rendu
 * repose sur la variable CSS `--mafs-view-transform` posée une seule fois à la racine `<Mafs>` et
 * jamais mise à jour par un `<Transform>` imbriqué, contrairement à `Line.Segment` qui compose
 * `viewTransform×userTransform` lui-même via `useTransformContext()` — voir l'en-tête de
 * `ui/traceParaboleGraph.ts` pour le détail complet (bug trouvé après confirmation visuelle par
 * l'utilisateur que la courbe ne passait par aucun des points sélectionnés). Le domaine révélé ne
 * s'étend que tant que la sélection RÉELLE suit la courbe d'une extrémité à l'autre (dans un sens
 * ou dans l'autre) — un point sauté FIGE la révélation (elle ne régresse ni ne se "répare"),
 * exactement ce que dit la consigne (`CONSIGNE_TRACE`). `afficherCourbeComplete` (réponse révélée
 * après épuisement des tentatives) trace la courbe entière, du premier au dernier point construit.
 *
 * Zones de touche : chaque point visible (12 px de diamètre) est doublé d'un disque transparent
 * plus large (`CiblesCliquables`, jusqu'à 22 px de rayon ≈ 44 px de diamètre au doigt), réduit si
 * deux points sont proches pour ne jamais faire se chevaucher deux zones.
 *
 * Sélection trackée par INDEX (jamais par valeur de point) : si l'élève a choisi le même `r` à deux
 * itérations différentes, `cibles` contient alors des points STRICTEMENT identiques (2 paires
 * dupliquées) — un suivi par valeur rendrait la seconde occurrence indistinguable de la première et
 * donc jamais sélectionnable, empêchant l'élève d'atteindre les 6 clics requis (trouvé par test
 * Playwright de bout en bout, méthode "verify before fixing" du projet).
 */
export function TraceParaboleGraph({ exercice, cibles, selectionnesIndices, onClicPoint, afficherCourbeComplete = false, verrouille = false }: Props) {
  const [wrapperRef, largeurMesuree] = useLargeurConteneur<HTMLDivElement>();
  const largeur = Math.min(LARGEUR_MAX, Math.max(LARGEUR_MIN, largeurMesuree || LARGEUR_PAR_DEFAUT));
  const hauteur = largeur / RATIO_GRAPHE;
  const { foyer, theta } = exercice;
  const viewBox = viewBoxTraceParabole(exercice, cibles);
  const demiPortee = demiPorteeTraceParabole(exercice, cibles);
  const pointsCourbe = pointsCourbeRevelee(exercice, cibles, selectionnesIndices, afficherCourbeComplete);

  return (
    <div className="mafs-graph" ref={wrapperRef}>
      <Mafs width={largeur} height={hauteur} viewBox={{ x: viewBox.x, y: viewBox.y, padding: 0 }} pan={true} zoom={{ min: ZOOM_MIN, max: ZOOM_MAX }}>
        <Transform rotate={theta}>
          <GrilleTournee demiPortee={demiPortee} />
          <Line.PointAngle point={[foyer.x, 0]} angle={0} color={COULEUR_DIRECTRICE} weight={EPAISSEUR_TRAIT_STANDARD} />
          <PointCroix x={foyer.x} y={foyer.y} color={COULEUR_FOYER} />
          {pointsCourbe.slice(0, -1).map((p, index) => (
            <Line.Segment key={index} point1={[p.x, p.y]} point2={[pointsCourbe[index + 1]!.x, pointsCourbe[index + 1]!.y]} color={COULEUR_COURBE} weight={EPAISSEUR_TRAIT_ACCENTUE} />
          ))}
          {cibles.map((cible, index) => (
            <MafsPoint
              key={index}
              x={cible.x}
              y={cible.y}
              color={selectionnesIndices.includes(index) ? COULEUR_SELECTIONNE : COULEUR_NON_SELECTIONNE}
              svgCircleProps={{ style: { pointerEvents: "none" } }}
            />
          ))}
          <CiblesCliquables cibles={cibles} onClicPoint={onClicPoint} actif={!verrouille} />
        </Transform>
      </Mafs>
    </div>
  );
}
