import type { ExerciceOmbreSoleil } from "../core/ombreSoleil.types";
import { elementsConclusion, solidePourAffichage, texteConclusion } from "../ui/formatOmbreSoleil";
import { Solide3DSketch } from "./Solide3DSketch";

interface Props {
  exercice: ExerciceOmbreSoleil;
  onContinuer: () => void;
}

/** Écran de conclusion — l'ombre reconstituée (aucune interaction ni vérification). */
export function EtapeConclusionOmbreSoleil({ exercice, onContinuer }: Props) {
  const { points, segments } = elementsConclusion(exercice);
  return (
    <div>
      <div className="equation-box">
        <p>{texteConclusion(exercice)}</p>
      </div>
      <Solide3DSketch solide={solidePourAffichage(exercice)} pointsExtra={points} segmentsExtra={segments} labelsSommets={false} />
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        Nouvel exercice
      </button>
    </div>
  );
}
