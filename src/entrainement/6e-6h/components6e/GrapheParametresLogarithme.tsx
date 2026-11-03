import { Coordinates, Line, Mafs, Plot, Point, Text } from "mafs";
import "mafs/core.css";
import type { ExerciceDeterminerParametresLogarithme } from "../core6e/determinerParametresLogarithme.types";
import { useLargeurConteneur } from "../components/useLargeurConteneur";
import { EPAISSEUR_TRAIT_ACCENTUE, EPAISSEUR_TRAIT_DISCRETE, EPAISSEUR_TRAIT_STANDARD } from "../ui/mafsTransformation";
import { abscisseSecondeMarque, cadreGraphe, evaluerF, ordonneeSecondeMarque, segmentTangente } from "../ui6e/formatDeterminerParametresLogarithme";

const COULEUR_COURBE = "#1971c2";
const COULEUR_TANGENTE = "#e8590c";
const COULEUR_POINT = "#2b2d42";
const COULEUR_AIDE = "#f08c00";
const LARGEUR_MAX = 520;

interface Props {
  exercice: ExerciceDeterminerParametresLogarithme;
  /** Aide visuelle (aide 2 de l'écran « a ») : droite verticale x = 1 en pointillé. */
  surlignerAbscisse1: boolean;
}

/**
 * Graphique de `6gen18` — courbe de f(x) = a + b·ln(x) sur un quadrillage FIXE d'unité 1 (pas de
 * zoom ni de déplacement : les valeurs se lisent aux intersections du quadrillage), le point
 * d'abscisse 1 et, selon la variante, la tangente en x = 1 ou un point d'abscisse e / e² (repéré sur
 * l'axe par un trait pointillé et son étiquette). Les points portent des lettres neutres (P, Q).
 */
export function GrapheParametresLogarithme({ exercice, surlignerAbscisse1 }: Props) {
  const [ref, largeurMesuree] = useLargeurConteneur<HTMLDivElement>();
  const largeur = Math.min(largeurMesuree, LARGEUR_MAX);
  const cadre = cadreGraphe(exercice);
  const hauteur = Math.round(Math.min(Math.max(largeur * 0.8, 240), 420));
  const pasEtiquetteY = cadre.yMax - cadre.yMin > 14 ? 2 : 1;
  const x2 = abscisseSecondeMarque(exercice);
  const y2 = ordonneeSecondeMarque(exercice);
  const [debutTangente, finTangente] = segmentTangente(exercice);

  return (
    <div ref={ref} className="mafs-graph" style={{ maxWidth: LARGEUR_MAX, marginInline: "auto" }}>
      {largeur > 0 && (
        <Mafs width={largeur} height={hauteur} viewBox={{ x: [cadre.xMin, cadre.xMax + 0.5], y: [cadre.yMin - 0.4, cadre.yMax + 0.4], padding: 0 }} pan={false} zoom={false} preserveAspectRatio={false}>
          <Coordinates.Cartesian
            xAxis={{ lines: 1, labels: (n) => (n <= 0 || (exercice.variante !== "pente" && Math.abs(n - x2) < 0.7) ? "" : String(n)) }}
            yAxis={{ lines: 1, labels: (n) => (n === 0 || n % pasEtiquetteY !== 0 ? "" : String(n)) }}
          />
          <Plot.OfX y={(x) => (x > 0 ? evaluerF(exercice, x) : NaN)} domain={[0.005, cadre.xMax]} color={COULEUR_COURBE} weight={EPAISSEUR_TRAIT_ACCENTUE} />
          {exercice.variante === "pente" && <Line.Segment point1={debutTangente} point2={finTangente} color={COULEUR_TANGENTE} weight={EPAISSEUR_TRAIT_STANDARD} />}
          {surlignerAbscisse1 && <Line.Segment point1={[1, cadre.yMin]} point2={[1, cadre.yMax]} color={COULEUR_AIDE} weight={EPAISSEUR_TRAIT_DISCRETE} style="dashed" />}
          {exercice.variante !== "pente" && (
            <>
              <Line.Segment point1={[x2, 0]} point2={[x2, y2]} color={COULEUR_POINT} weight={EPAISSEUR_TRAIT_DISCRETE} style="dashed" />
              <Text x={x2} y={0} attach={y2 >= 0 ? "s" : "n"} attachDistance={14} color={COULEUR_POINT} size={16}>
                {exercice.variante === "pointE" ? "e" : "e²"}
              </Text>
              <Point x={x2} y={y2} color={COULEUR_POINT} />
              <Text x={x2} y={y2} attach={x2 > cadre.xMax - 1.5 ? "nw" : "ne"} attachDistance={12} color={COULEUR_POINT} size={18}>
                {exercice.lettrePoint2}
              </Text>
            </>
          )}
          <Point x={1} y={exercice.a} color={COULEUR_POINT} />
          <Text x={1} y={exercice.a} attach={exercice.variante === "pente" && exercice.b > 0 ? "se" : "ne"} attachDistance={12} color={COULEUR_POINT} size={18}>
            {exercice.lettrePoint1}
          </Text>
        </Mafs>
      )}
    </div>
  );
}
