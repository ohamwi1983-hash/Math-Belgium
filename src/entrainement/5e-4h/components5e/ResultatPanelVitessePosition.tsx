import type { ResultatExerciceVitessePosition } from "../moteur5e/typesVitessePosition";
import { ordreEcransVitessePosition } from "../moteur5e/typesVitessePosition";
import { formatReponseAttenduePhaseLatex, LIBELLE_ECRAN } from "../ui5e/formatVitessePosition";
import { Katex } from "../components/Katex";
import { LigneRecap, RecapTotalPoints, statutRecap } from "./LigneRecap";

interface Props {
  resultat: ResultatExerciceVitessePosition;
  aideParPhase: Partial<Record<string, { niveauAide: number; revele: boolean }>>;
  onContinuer: () => void;
  dernier: boolean;
}

/** Écran récapitulatif final — 5 (A) ou 6 (B) lignes à plat selon la variante tirée, même patron
 * plat/coloré que `ResultatPanelTangentes.tsx` (5gen28). */
export function ResultatPanelVitessePosition({ resultat, aideParPhase, onContinuer, dernier }: Props) {
  const exercice = resultat.exercice;

  function statutEcran(ecran: string) {
    const info = aideParPhase[ecran];
    return statutRecap(info?.revele ?? false, info?.niveauAide ?? null);
  }

  return (
    <div className="resultat-panel">
      <h2>Récapitulatif</h2>
      {ordreEcransVitessePosition(exercice).map((ecran) => {
        const score = resultat.scores[ecran];
        if (score === undefined) return null;
        const statut = statutEcran(ecran);
        return (
          <LigneRecap key={ecran} label={LIBELLE_ECRAN[ecran]} statut={statut}>
            <span className="equation-box-termes">
              {formatReponseAttenduePhaseLatex(exercice, ecran).map((frag, i) => (
                <Katex key={i} expression={frag} />
              ))}
            </span>
          </LigneRecap>
        );
      })}
      <RecapTotalPoints
        ecrans={ordreEcransVitessePosition(exercice)
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
