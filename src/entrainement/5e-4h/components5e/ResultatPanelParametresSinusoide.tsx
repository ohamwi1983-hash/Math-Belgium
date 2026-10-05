import { ORDRE_PHASES_SINUSOIDE, type PhaseParametresSinusoide, type ResultatExerciceParametresSinusoide } from "../moteur5e/typesParametresSinusoide";
import { formatChampParametreLatex } from "../ui5e/formatParametresSinusoide";
import { LigneRecap, RecapTotalPoints, statutRecap } from "./LigneRecap";
import { Katex } from "../components/Katex";

type AideParPhase = Partial<Record<PhaseParametresSinusoide, { niveauAide: number; revele: boolean }>>;

interface Props {
  resultat: ResultatExerciceParametresSinusoide;
  aideParPhase: AideParPhase;
  onContinuer: () => void;
  dernier: boolean;
}

const LABELS_RECAP: Record<PhaseParametresSinusoide, string> = {
  amplitude: "Amplitude (A)",
  phi: "Décalage horizontal (Φ)",
  periode: "Période (T)",
  frequence: "Fréquence (f)",
  decalage: "Décalage vertical (b)",
};

export function ResultatPanelParametresSinusoide({ resultat, aideParPhase, onContinuer, dernier }: Props) {
  const exercice = resultat.exercice;
  return (
    <div className="resultat-panel">
      <h2>Récapitulatif</h2>
      {ORDRE_PHASES_SINUSOIDE.map((champ) => {
        const info = aideParPhase[champ];
        return (
          <LigneRecap key={champ} label={LABELS_RECAP[champ]} statut={statutRecap(info?.revele ?? false, info?.niveauAide ?? null)}>
            <Katex expression={formatChampParametreLatex(exercice, champ)} />
          </LigneRecap>
        );
      })}
      <RecapTotalPoints ecrans={ORDRE_PHASES_SINUSOIDE.map((champ) => ({ revele: aideParPhase[champ]?.revele ?? false, niveauAide: aideParPhase[champ]?.niveauAide ?? null }))} />
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {dernier ? "Voir le résumé" : "Exercice suivant"}
      </button>
    </div>
  );
}
