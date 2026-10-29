import { Line, Polyline, Text } from "mafs";
import type { ExerciceApplicationPhysique } from "../core/applicationPhysique.types";
import { geometrieSchemaApplicationPhysique, labelsGrapheApplicationPhysique, legendeAngleSchemaApplicationPhysique } from "../ui/formatApplicationPhysique";
import { calculerViewBoxVecteurs } from "../ui/vecteurGraph";
import { calculerPasGrille, EPAISSEUR_TRAIT_DISCRETE, EPAISSEUR_TRAIT_STANDARD } from "../ui/mafsTransformation";
import { VecteurGraph } from "./VecteurGraph";
import { useLargeurConteneur } from "./useLargeurConteneur";

interface Props {
  exercice: ExerciceApplicationPhysique;
  /** Dessine la résultante (diagonale du parallélogramme). Absent/`false` par défaut : elle reste
   * masquée tant que l'écran « direction » n'est pas validé (décision F3) — la tracer plus tôt
   * donnait la réponse de cet écran à l'œil. */
  afficherResultante?: boolean;
}

const COULEUR_RESULTANTE = "#e8590c";
const COULEUR_CONSTRUCTION = "#868e96";
const COULEUR_ANGLE = "#495057";
/** Bornes et défaut de largeur de `VecteurGraph`, et ce que son cadre `.mafs-graph` retranche
 * (padding 2 × 12 px + bordure 2 × 1 px) — pour disposer les étiquettes à l'échelle réelle. */
const LARGEUR_GRAPHE_MIN = 240;
const LARGEUR_GRAPHE_MAX = 480;
const LARGEUR_GRAPHE_DEFAUT = 420;
const CADRE_GRAPHE_PX = 26;

/** Schéma partagé par les 4 écrans de l'exercice (persistant, jamais un écran "énoncé" séparé),
 * aligné sur la règle du parallélogramme du cours (section application physique) : v1 et v2
 * partent de la MÊME origine, l'angle θ de l'énoncé est marqué par un arc à cette origine, le
 * parallélogramme est esquissé en pointillés et la résultante, sa diagonale issue de l'origine,
 * n'apparaît qu'avec `afficherResultante`. Une rose des vents (N/E/S/O) donne l'orientation sans
 * rien révéler. Purement illustratif : aucune des 4 étapes ne vérifie quoi que ce soit à partir de
 * ce graphe, toujours une comparaison numérique à `exercice.triangle`. Labels contexte-aware
 * (`labelsGrapheApplicationPhysique`) rendus via `labelFleche` — flèche + indice dessinés en
 * géométrie SVG pure par `VecteurGraph`/`LabelVecteurFleche`, jamais en caractère Unicode. Axes
 * cartésiens masqués (`masquerAxes`, `promptgen29corrections.md`) — le quadrillage (et sa légende
 * d'échelle) reste affiché pour percevoir les proportions relatives des longueurs. */
export function SchemaApplicationPhysique({ exercice, afficherResultante = false }: Props) {
  const [conteneurRef, largeurConteneur] = useLargeurConteneur<HTMLDivElement>();
  const largeurGraphe = largeurConteneur
    ? Math.min(LARGEUR_GRAPHE_MAX, Math.max(LARGEUR_GRAPHE_MIN, largeurConteneur - CADRE_GRAPHE_PX))
    : LARGEUR_GRAPHE_DEFAUT;
  const geometrie = geometrieSchemaApplicationPhysique(exercice, largeurGraphe);
  const { v1, v2, resultante, cotesPointilles, arc, etiquettes, rose } = geometrie;
  const labels = labelsGrapheApplicationPhysique(exercice.contexte);
  const origine = { x: 0, y: 0 };
  // Fenêtre calculée résultante comprise même quand elle est masquée : rien ne bouge à son
  // apparition (audit chapitre 6, point 26 : étiquettes coupées ou superposées).
  const viewBox = calculerViewBoxVecteurs(geometrie.coins.map((point) => ({ point, label: "" })));
  // Même pas de quadrillage sur les deux axes : les longueurs se comparent alors à l'œil.
  const pas = calculerPasGrille(viewBox.x[1] - viewBox.x[0]);

  return (
    <div className="schema-application-physique" ref={conteneurRef}>
      <VecteurGraph
        masquerAxes
        viewBoxFixe={viewBox}
        pasGrille={pas}
        vecteurs={[
          { origine, vecteur: v1, labelFleche: labels.v1, labelPosition: etiquettes.v1 },
          { origine, vecteur: v2, labelFleche: labels.v2, labelPosition: etiquettes.v2 },
          ...(afficherResultante
            ? [{ origine, vecteur: resultante, labelFleche: labels.resultante, labelPosition: etiquettes.resultante, couleur: COULEUR_RESULTANTE }]
            : []),
        ]}
      >
        {cotesPointilles.map(([a, b], i) => (
          <Line.Segment key={`cote-${i}`} point1={[a.x, a.y]} point2={[b.x, b.y]} color={COULEUR_CONSTRUCTION} style="dashed" weight={EPAISSEUR_TRAIT_STANDARD} />
        ))}
        <Polyline points={arc.points.map((p): [number, number] => [p.x, p.y])} color={COULEUR_ANGLE} weight={EPAISSEUR_TRAIT_STANDARD} fillOpacity={0} />
        <Text x={arc.label.x} y={arc.label.y} size={18} color={COULEUR_ANGLE}>
          θ
        </Text>
        {(["N", "E", "S", "O"] as const).map((direction) => (
          <g key={`rose-${direction}`}>
            <Line.Segment
              point1={[rose.centre.x, rose.centre.y]}
              point2={[rose.branches[direction].x, rose.branches[direction].y]}
              color={COULEUR_CONSTRUCTION}
              weight={direction === "N" ? EPAISSEUR_TRAIT_STANDARD : EPAISSEUR_TRAIT_DISCRETE}
            />
            <Text x={rose.lettres[direction].x} y={rose.lettres[direction].y} size={14} color={COULEUR_CONSTRUCTION}>
              {direction}
            </Text>
          </g>
        ))}
      </VecteurGraph>
      <p className="mafs-graph-pas schema-application-physique-legende">{legendeAngleSchemaApplicationPhysique(exercice)}</p>
    </div>
  );
}
