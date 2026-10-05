import type { ResultatExerciceTangente } from "../moteur5e/typesTangentes";
import { ordreEcransTangente } from "../moteur5e/typesTangentes";
import { formatReponseAttenduePhaseLatex, LIBELLE_ECRAN } from "../ui5e/formatTangentes";
import { Katex } from "../components/Katex";
import { LigneRecap, RecapTotalPoints, statutRecap } from "./LigneRecap";

interface Props {
  resultat: ResultatExerciceTangente;
  aideParPhase: Partial<Record<string, { niveauAide: number; revele: boolean }>>;
  onContinuer: () => void;
  dernier: boolean;
}

/** Écran récapitulatif final — 2 ou 3 lignes à plat selon la variante tirée (voir
 * `ordreEcransTangente`), même patron plat/coloré que `ResultatPanelDefinitionDerivee.tsx`
 * (5gen26). */
export function ResultatPanelTangentes({ resultat, aideParPhase, onContinuer, dernier }: Props) {
  const exercice = resultat.exercice;

  function statutEcran(ecran: string) {
    const info = aideParPhase[ecran];
    return statutRecap(info?.revele ?? false, info?.niveauAide ?? null);
  }

  return (
    <div className="resultat-panel">
      <h2>Récapitulatif</h2>
      {ordreEcransTangente(exercice).map((ecran) => {
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
        ecrans={ordreEcransTangente(exercice)
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
