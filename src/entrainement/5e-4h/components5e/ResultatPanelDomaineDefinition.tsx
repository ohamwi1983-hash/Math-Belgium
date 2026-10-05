import type { ResultatExerciceDomaineDefinition } from "../moteur5e/typesDomaineDefinition";
import { formatCEAttendueLatex, formatDomfLatex, formatResolutionAttendueLatex } from "../ui5e/formatDomaineDefinition";
import { GrilleQuotientDomfRecap } from "./GrilleQuotientDomfRecap";
import { LigneRecap, RecapTotalPoints, statutRecap } from "./LigneRecap";
import { Katex } from "../components/Katex";

interface Props {
  resultat: ResultatExerciceDomaineDefinition;
  onContinuer: () => void;
  dernier: boolean;
}

/**
 * Écran récapitulatif final (point 1.7) — remplace l'ancien affichage à score fractionnaire par
 * écran (`CE : 80/100`) par une liste à plat, dans l'ordre des écrans réellement traversés, chacun
 * coloré selon son statut. L'écran "resolution" (racineSurFraction/racineSurD, fractionSousRacine)
 * n'apparaît que s'il a réellement eu lieu (`scoreResolution !== null`, voir `phaseApresCE`).
 */
export function ResultatPanelDomaineDefinition({ resultat, onContinuer, dernier }: Props) {
  const exercice = resultat.exercice;
  const ceCorrecte = formatCEAttendueLatex(exercice);
  const resolutionCorrecte = formatResolutionAttendueLatex(exercice);
  const domfCorrect = formatDomfLatex(exercice.domf);

  return (
    <div className="resultat-panel">
      <h2>Récapitulatif</h2>
      <LigneRecap label="CE" statut={statutRecap(resultat.ceRevele, resultat.niveauAideCE)}>
        <Katex expression={ceCorrecte} />
      </LigneRecap>
      {resultat.scoreResolution !== null && (
        <LigneRecap label="Résolution" statut={statutRecap(resultat.resolutionRevele, resultat.niveauAideResolution)}>
          {exercice.famille === "fractionSousRacine" ? <GrilleQuotientDomfRecap exercice={exercice} /> : <Katex expression={resolutionCorrecte ?? ""} />}
        </LigneRecap>
      )}
      <LigneRecap label="domf" statut={statutRecap(resultat.domfRevele, resultat.niveauAideDomf)}>
        <Katex expression={domfCorrect} />
      </LigneRecap>
      <RecapTotalPoints
        ecrans={[
          { revele: resultat.ceRevele, niveauAide: resultat.niveauAideCE },
          ...(resultat.scoreResolution !== null ? [{ revele: resultat.resolutionRevele, niveauAide: resultat.niveauAideResolution }] : []),
          { revele: resultat.domfRevele, niveauAide: resultat.niveauAideDomf },
        ]}
      />
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {dernier ? "Voir le résumé" : "Exercice suivant"}
      </button>
    </div>
  );
}
