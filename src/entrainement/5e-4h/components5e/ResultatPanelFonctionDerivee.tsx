import type { ResultatExerciceFonctionDerivee } from "../moteur5e/typesFonctionDerivee";
import { ECRANS_POSSIBLES } from "../moteur5e/typesFonctionDerivee";
import { formatReponseAttendueCalculerLatex, formatTermesReponseAttendueDecomposerLatex, LIBELLE_ECRAN, texteReponseAttendueReconnaissance } from "../ui5e/formatFonctionDerivee";
import { Katex } from "../components/Katex";
import { LigneRecap, RecapTotalPoints, statutRecap } from "./LigneRecap";

interface Props {
  resultat: ResultatExerciceFonctionDerivee;
  aideParPhase: Partial<Record<string, { niveauAide: number; revele: boolean }>>;
  onContinuer: () => void;
  dernier: boolean;
}

/** Écran récapitulatif final — 2 ou 3 lignes à plat selon que "decomposer" a été traversé (jamais
 * pour "reglebase"), même patron plat/coloré que `ResultatPanelDefinitionDerivee.tsx` (5gen26).
 * "reconnaissance" reste une simple ligne texte (nom de catégorie, pas de KaTeX) ; "decomposer"/
 * "calculer" affichent leur réponse en KaTeX. */
export function ResultatPanelFonctionDerivee({ resultat, aideParPhase, onContinuer, dernier }: Props) {
  const exercice = resultat.exercice;

  function statutEcran(ecran: string) {
    const info = aideParPhase[ecran];
    return statutRecap(info?.revele ?? false, info?.niveauAide ?? null);
  }

  return (
    <div className="resultat-panel">
      <h2>Récapitulatif</h2>
      {ECRANS_POSSIBLES.map((ecran) => {
        const score = resultat.scores[ecran];
        if (score === undefined) return null;
        const statut = statutEcran(ecran);
        if (ecran === "reconnaissance") {
          return (
            <LigneRecap key={ecran} label={LIBELLE_ECRAN.reconnaissance} statut={statut}>
              {texteReponseAttendueReconnaissance(exercice)}
            </LigneRecap>
          );
        }
        if (ecran === "decomposer") {
          return (
            <LigneRecap key={ecran} label={LIBELLE_ECRAN.decomposer} statut={statut}>
              <span className="equation-box-termes">
                {formatTermesReponseAttendueDecomposerLatex(exercice, resultat.typeRetenu).map((frag, i) => (
                  <Katex key={i} expression={frag} />
                ))}
              </span>
            </LigneRecap>
          );
        }
        return (
          <LigneRecap key={ecran} label={LIBELLE_ECRAN.calculer} statut={statut}>
            <Katex expression={formatReponseAttendueCalculerLatex(exercice)} />
          </LigneRecap>
        );
      })}
      <RecapTotalPoints
        ecrans={ECRANS_POSSIBLES.filter((ecran) => resultat.scores[ecran] !== undefined).map((ecran) => {
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
