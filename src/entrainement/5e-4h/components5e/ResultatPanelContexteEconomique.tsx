import type { EcranContexteEconomique, ResultatExerciceContexteEconomique } from "../moteur5e/typesContexteEconomique";
import { ordreEcransContexteEconomique } from "../moteur5e/typesContexteEconomique";
import { formatReponseAttenduePhaseLatex, LIBELLE_ECRAN_CONTEXTE_ECONOMIQUE } from "../ui5e/formatContexteEconomique";
import { Katex } from "../components/Katex";
import { LigneRecap, RecapTotalPoints, statutRecap } from "./LigneRecap";

interface Props {
  resultat: ResultatExerciceContexteEconomique;
  aideParPhase: Partial<Record<string, { niveauAide: number; revele: boolean }>>;
  onContinuer: () => void;
  dernier: boolean;
}

/** Écran récapitulatif final — 4 (famille A), 8 (famille B) ou 6 (bonus) lignes à plat selon la
 * famille (voir `ordreEcransContexteEconomique`), même patron plat/coloré que
 * `ResultatPanelEtudeLocale.tsx` (5gen29). */
export function ResultatPanelContexteEconomique({ resultat, aideParPhase, onContinuer, dernier }: Props) {
  const exercice = resultat.exercice;

  function statutEcran(ecran: string) {
    const info = aideParPhase[ecran];
    return statutRecap(info?.revele ?? false, info?.niveauAide ?? null);
  }

  return (
    <div className="resultat-panel">
      <h2>Récapitulatif</h2>
      {ordreEcransContexteEconomique(exercice).map((ecran: EcranContexteEconomique) => {
        const score = resultat.scores[ecran];
        if (score === undefined) return null;
        return (
          <LigneRecap key={ecran} label={LIBELLE_ECRAN_CONTEXTE_ECONOMIQUE[ecran]} statut={statutEcran(ecran)}>
            <span className="equation-box-termes">
              {formatReponseAttenduePhaseLatex(exercice, ecran).map((frag, i) => (
                <Katex key={i} expression={frag} />
              ))}
            </span>
          </LigneRecap>
        );
      })}
      <RecapTotalPoints
        ecrans={ordreEcransContexteEconomique(exercice)
          .filter((ecran: EcranContexteEconomique) => resultat.scores[ecran] !== undefined)
          .map((ecran: EcranContexteEconomique) => {
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
