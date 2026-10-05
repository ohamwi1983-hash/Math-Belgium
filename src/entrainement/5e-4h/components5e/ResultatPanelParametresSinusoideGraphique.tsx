import {
  ORDRE_PHASES_SINUSOIDE_GRAPHIQUE,
  type PhaseParametresSinusoideGraphique,
  type ResultatExerciceParametresSinusoideGraphique,
} from "../moteur5e/typesParametresSinusoideGraphique";
import { formatChampParametreGraphiqueLatex } from "../ui5e/formatParametresSinusoideGraphique";
import { LigneRecap, statutRecap, RecapTotalPoints } from "./LigneRecap";
import { Katex } from "../components/Katex";

type AideParPhase = Partial<Record<PhaseParametresSinusoideGraphique, { niveauAide: number; revele: boolean }>>;

interface Props {
  resultat: ResultatExerciceParametresSinusoideGraphique;
  aideParPhase: AideParPhase;
  onContinuer: () => void;
  dernier: boolean;
}

const LABELS_RECAP: Record<PhaseParametresSinusoideGraphique, string> = {
  decalage: "Décalage vertical (b)",
  amplitude: "Amplitude (A)",
  periode: "Période (T)",
  frequence: "Fréquence (f)",
  phi: "Décalage horizontal (Φ)",
};

export function ResultatPanelParametresSinusoideGraphique({ resultat, aideParPhase, onContinuer, dernier }: Props) {
  const exercice = resultat.exercice;
  return (
    <div className="resultat-panel">
      <h2>Récapitulatif</h2>
      {ORDRE_PHASES_SINUSOIDE_GRAPHIQUE.map((champ) => {
        const info = aideParPhase[champ];
        return (
          <LigneRecap key={champ} label={LABELS_RECAP[champ]} statut={statutRecap(info?.revele ?? false, info?.niveauAide ?? null)}>
            <Katex expression={formatChampParametreGraphiqueLatex(exercice, champ)} />
          </LigneRecap>
        );
      })}
      <RecapTotalPoints
        ecrans={ORDRE_PHASES_SINUSOIDE_GRAPHIQUE.map((champ) => {
          const info = aideParPhase[champ];
          return { revele: info?.revele ?? false, niveauAide: info?.niveauAide ?? null };
        })}
      />
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {dernier ? "Voir le résumé" : "Exercice suivant"}
      </button>
    </div>
  );
}
