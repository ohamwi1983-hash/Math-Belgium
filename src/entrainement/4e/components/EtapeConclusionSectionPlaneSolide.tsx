import type { ExerciceSectionPlaneSolide } from "../core/sectionPlaneSolide.types";
import { pointsExtraConnus, segmentsExtraTraces } from "../ui/formatSectionPlaneSolide";
import { Solide3DSketch } from "./Solide3DSketch";

interface Props {
  exercice: ExerciceSectionPlaneSolide;
  connus: number[];
  segmentsTraces: string[];
  onContinuer: () => void;
}

/**
 * Écran de conclusion — "le dernier segment tracé rejoint le tout premier point de la section"
 * (spec, "Condition d'arrêt") : aucune interaction ni vérification supplémentaire, jamais de bouton
 * Aide (même convention que tout écran `max=0` du projet). Affiche le polygone de section entier,
 * enfin complet.
 */
export function EtapeConclusionSectionPlaneSolide({ exercice, connus, segmentsTraces, onContinuer }: Props) {
  return (
    <div>
      <div className="equation-box">
        <p>Le polygone de section est fermé — le dernier segment rejoint le tout premier point de la section.</p>
      </div>

      <Solide3DSketch solide={exercice.solide} pointsExtra={pointsExtraConnus(exercice, connus)} segmentsExtra={segmentsExtraTraces(exercice, segmentsTraces)} />

      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        Continuer
      </button>
    </div>
  );
}
