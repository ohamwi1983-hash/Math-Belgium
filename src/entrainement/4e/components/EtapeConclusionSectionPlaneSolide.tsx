import type { ExerciceSectionPlaneSolide } from "../core/sectionPlaneSolide.types";
import { decorDonnees, pointsExtraConnus, segmentsExtraTraces, texteConclusion } from "../ui/formatSectionPlaneSolide";
import { lignesTableauSession, tableauAppartenanceSvg } from "../ui/tableauAppartenanceSection";
import { Solide3DSketch } from "./Solide3DSketch";

interface Props {
  exercice: ExerciceSectionPlaneSolide;
  connus: number[];
  segmentsTraces: string[];
  /** Dernier segment tracé automatiquement (seul candidat restant), `null` sinon. */
  segmentAutomatique: string | null;
  onContinuer: () => void;
}

/**
 * Écran de conclusion — "le dernier segment tracé rejoint le tout premier point de la section"
 * (spec, "Condition d'arrêt") : aucune interaction ni vérification supplémentaire, jamais de bouton
 * Aide (même convention que tout écran `max=0` du projet). Affiche le polygone de section entier,
 * nommé, et signale le dernier segment s'il a été tracé automatiquement (audit chapitre 8, point 23).
 * Puis le tableau d'appartenance des points aux faces (manuel, 6 a / 7 a), dans l'ordre où l'élève
 * a obtenu les points.
 */
export function EtapeConclusionSectionPlaneSolide({ exercice, connus, segmentsTraces, segmentAutomatique, onContinuer }: Props) {
  return (
    <div>
      <div className="equation-box">
        {texteConclusion(exercice, connus, segmentAutomatique).map((ligne) => (
          <p key={ligne}>{ligne}</p>
        ))}
      </div>

      <Solide3DSketch solide={exercice.solide} pointsExtra={[...decorDonnees(exercice).points, ...pointsExtraConnus(exercice, connus)]} segmentsExtra={[...decorDonnees(exercice).segments, ...segmentsExtraTraces(exercice, segmentsTraces)]} />

      <p className="field-label field-label-minuscule">Tableau d'appartenance : chaque point dans les faces dont le plan le contient</p>
      <div className="corrige-ecran-figure" dangerouslySetInnerHTML={{ __html: tableauAppartenanceSvg(exercice, lignesTableauSession(exercice, connus)) }} />

      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        Nouvel exercice
      </button>
    </div>
  );
}
