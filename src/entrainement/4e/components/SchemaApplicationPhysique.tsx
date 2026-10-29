import type { ExerciceApplicationPhysique } from "../core/applicationPhysique.types";
import { calculerVecteursSchema, labelsGrapheApplicationPhysique, positionsEtiquettesSchema } from "../ui/formatApplicationPhysique";
import { calculerViewBoxVecteurs } from "../ui/vecteurGraph";
import { calculerPasGrille } from "../ui/mafsTransformation";
import { VecteurGraph } from "./VecteurGraph";

interface Props {
  exercice: ExerciceApplicationPhysique;
}

/** Schéma partagé par les 4 écrans de l'exercice (persistant, jamais un écran "énoncé" séparé) —
 * v1 depuis l'origine, v2 tracé bout à bout à son extrémité (relation de Chasles), la résultante
 * depuis l'origine. Purement illustratif : aucune des 4 étapes ne vérifie quoi que ce soit à
 * partir de ce graphe, toujours une comparaison numérique à `exercice.triangle`. Labels
 * contexte-aware (`labelsGrapheApplicationPhysique`) rendus via `labelFleche` — flèche + indice
 * dessinés en géométrie SVG pure par `VecteurGraph`/`LabelVecteurFleche`, jamais en caractère
 * Unicode (voir `formatApplicationPhysique.ts` pour le raisonnement complet). Axes cartésiens
 * masqués (`masquerAxes`, `promptgen29corrections.md`) — l'exercice raisonne en norme/angle,
 * jamais en coordonnées cartésiennes, mais le quadrillage (et sa légende d'échelle) reste affiché
 * pour percevoir les proportions relatives des longueurs. */
export function SchemaApplicationPhysique({ exercice }: Props) {
  const { v1, v2, resultante } = calculerVecteursSchema(exercice);
  const labels = labelsGrapheApplicationPhysique(exercice.contexte);
  const origine = { x: 0, y: 0 };
  const extremiteV1 = { x: v1.x, y: v1.y };
  // Étiquettes à l'extérieur du triangle et fenêtre avec marge proportionnelle (audit chapitre 6,
  // point 26 : v₁/v_R superposées à 390 px, v₂ coupée à 1280 px).
  const positions = positionsEtiquettesSchema(exercice);
  const viewBox = calculerViewBoxVecteurs(positions.coins.map((point) => ({ point, label: "" })));
  // Même pas de quadrillage sur les deux axes (le pas adaptatif donnait « 1 carré = 50 » à
  // l'horizontale et « = 20 » à la verticale) : les longueurs se comparent alors à l'œil.
  const pas = calculerPasGrille(viewBox.x[1] - viewBox.x[0]);

  return (
    <VecteurGraph
      masquerAxes
      viewBoxFixe={viewBox}
      pasGrille={pas}
      vecteurs={[
        { origine, vecteur: v1, labelFleche: labels.v1, labelPosition: positions.v1 },
        { origine: extremiteV1, vecteur: v2, labelFleche: labels.v2, labelPosition: positions.v2 },
        { origine, vecteur: resultante, labelFleche: labels.resultante, labelPosition: positions.resultante, couleur: "#e8590c" },
      ]}
    />
  );
}
