import type { ResultatExerciceDefinitionDerivee } from "../moteur5e/typesDefinitionDerivee";
import { ORDRE_COMPLET } from "../moteur5e/typesDefinitionDerivee";
import { LIBELLE_ECRAN, formatReponseAttendueEcranLatex } from "../ui5e/formatDefinitionDerivee";
import { Katex } from "../components/Katex";
import { LigneRecap, RecapTotalPoints, statutRecap } from "./LigneRecap";

interface Props {
  resultat: ResultatExerciceDefinitionDerivee;
  aideParPhase: Partial<Record<string, { niveauAide: number; revele: boolean }>>;
  onContinuer: () => void;
  dernier: boolean;
}

/** Écran récapitulatif final — 3 lignes à plat (1 par écran), même patron plat/coloré que
 * `ResultatPanelAsymptoteOblique.tsx` (5gen21). L'écran "developper" (f(a)+f(a+h)) reste UNE
 * SEULE ligne — reflète la notation en tentative combinée (1 bouton Valider, 2 champs). */
export function ResultatPanelDefinitionDerivee({ resultat, aideParPhase, onContinuer, dernier }: Props) {
  const exercice = resultat.exercice;

  function statutEcran(ecran: string) {
    const info = aideParPhase[ecran];
    return statutRecap(info?.revele ?? false, info?.niveauAide ?? null);
  }

  return (
    <div className="resultat-panel">
      <h2>Récapitulatif</h2>
      {ORDRE_COMPLET.map((ecran) => {
        const score = resultat.scores[ecran];
        if (score === undefined) return null;
        const statut = statutEcran(ecran);
        return (
          <LigneRecap key={ecran} label={LIBELLE_ECRAN[ecran]} statut={statut}>
            <span className="equation-box-termes">
              {formatReponseAttendueEcranLatex(exercice, ecran).map((frag, i) => (
                <Katex key={i} expression={frag} />
              ))}
            </span>
          </LigneRecap>
        );
      })}
      <RecapTotalPoints
        ecrans={ORDRE_COMPLET.filter((ecran) => resultat.scores[ecran] !== undefined).map((ecran) => {
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
