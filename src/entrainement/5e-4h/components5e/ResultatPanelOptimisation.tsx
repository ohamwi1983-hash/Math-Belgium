import type { ResultatExerciceOptimisation } from "../moteur5e/typesOptimisationGeometrique";
import { ordreEcransOptimisation } from "../moteur5e/typesOptimisationGeometrique";
import { formatReponseAttendueEcranLatex, LIBELLE_ECRAN } from "../ui5e/formatOptimisationGeometrique";
import { Katex } from "../components/Katex";
import { LigneRecap, RecapTotalPoints, statutRecap } from "./LigneRecap";

interface Props {
  resultat: ResultatExerciceOptimisation;
  aideParPhase: Partial<Record<string, { niveauAide: number; revele: boolean }>>;
  onContinuer: () => void;
  dernier: boolean;
}

/** Écran récapitulatif final — 4 à 7 lignes à plat selon la famille tirée (voir
 * `ordreEcransOptimisation`), même patron plat/coloré que `ResultatPanelTangentes.tsx` (5gen28). */
export function ResultatPanelOptimisation({ resultat, aideParPhase, onContinuer, dernier }: Props) {
  const exercice = resultat.exercice;

  function statutEcran(ecran: string) {
    const info = aideParPhase[ecran];
    return statutRecap(info?.revele ?? false, info?.niveauAide ?? null);
  }

  return (
    <div className="resultat-panel">
      <h2>Récapitulatif</h2>
      {ordreEcransOptimisation(exercice).map((ecran) => {
        const score = resultat.scores[ecran];
        if (score === undefined) return null;
        const statut = statutEcran(ecran);
        return (
          <LigneRecap key={ecran} label={LIBELLE_ECRAN[ecran]} statut={statut}>
            <Katex expression={formatReponseAttendueEcranLatex(exercice, ecran)} />
          </LigneRecap>
        );
      })}
      <RecapTotalPoints
        ecrans={ordreEcransOptimisation(exercice)
          .filter((ecran) => resultat.scores[ecran] !== undefined)
          .map((ecran) => {
            const info = aideParPhase[ecran];
            return { revele: info?.revele ?? false, niveauAide: info?.niveauAide ?? null };
          })}
      />
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {dernier ? "Voir le résumé" : "Exercice suivant"}
      </button>
    </div>
  );
}
