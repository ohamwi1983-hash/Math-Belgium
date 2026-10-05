import type { ExerciceOmbreSoleil } from "../core/ombreSoleil.types";
import { elementsConclusion, solidePourAffichage } from "../ui/formatOmbreSoleil";
import { Solide3DSketch } from "./Solide3DSketch";

interface Props {
  exercice: ExerciceOmbreSoleil;
  onContinuer: () => void;
}

/**
 * Écran de conclusion — "relier les points-ombres pour reconstituer l'ombre complète" (spec, étape
 * 4 de la décomposition commune). Aucune interaction ni vérification supplémentaire, jamais de
 * bouton Aide (même convention que tout écran `max=0` du projet — voir "Section plane d'un solide").
 */
export function EtapeConclusionOmbreSoleil({ exercice, onContinuer }: Props) {
  const solide = solidePourAffichage(exercice);
  const { points, segments } = elementsConclusion(exercice);

  return (
    <div>
      <div className="equation-box">
        <p>L'ombre complète est reconstituée — chaque point-ombre est relié au suivant.</p>
      </div>

      <Solide3DSketch solide={solide} pointsExtra={points} segmentsExtra={segments} labelsSommets={false} />

      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        Continuer
      </button>
    </div>
  );
}
