import type { PhaseExtremumsSinusoide, ResultatExerciceExtremumsSinusoide } from "../moteur5e/typesExtremumsSinusoide";
import { formatFonctionSourceLatex, formatTermesEtatActuelExtremums } from "../ui5e/formatExtremumsSinusoide";
import { decouperEquationLongueLatex } from "../ui5e/blocFitterEquation";
import { Katex } from "../components/Katex";
import { CercleTrigEquationSketch } from "./CercleTrigEquationSketch";
import { LigneRecap, statutRecap, RecapTotalPoints } from "./LigneRecap";

type AideParPhase = Partial<Record<PhaseExtremumsSinusoide, { niveauAide: number; revele: boolean }>>;

interface Props {
  resultat: ResultatExerciceExtremumsSinusoide;
  aideParPhase: AideParPhase;
  onContinuer: () => void;
  dernier: boolean;
}

/**
 * Écran récapitulatif final — liste à plat (même convention que 5gen1,
 * `ResultatPanelDomaineDefinition.tsx`) : les 3 écrans sont TOUJOURS traversés (séquence fixe, voir
 * `ORDRE_PHASES_EXTREMUMS`), donc les 3 lignes sont toujours affichées, jamais de garde `!== null`.
 */
export function ResultatPanelExtremumsSinusoide({ resultat, aideParPhase, onContinuer, dernier }: Props) {
  const exercice = resultat.exercice;
  const [equationSubstitueeAttendue, brancheXAttendue] = formatTermesEtatActuelExtremums(exercice, "solutions");
  const poserEquation = aideParPhase.poserEquation;
  const isolerX = aideParPhase.isolerX;
  const solutions = aideParPhase.solutions;

  return (
    <div className="resultat-panel">
      <h2>Récapitulatif</h2>
      <div className="equation-box equation-box-termes">
        {decouperEquationLongueLatex(formatFonctionSourceLatex(exercice)).map((morceau, i) => (
          <Katex key={i} expression={morceau} />
        ))}
      </div>
      <LigneRecap label="Équation posée" statut={statutRecap(poserEquation?.revele ?? false, poserEquation?.niveauAide ?? null)}>
        <Katex expression={equationSubstitueeAttendue} />
      </LigneRecap>
      <LigneRecap label="Isolement de x" statut={statutRecap(isolerX?.revele ?? false, isolerX?.niveauAide ?? null)}>
        <Katex expression={brancheXAttendue} />
      </LigneRecap>
      <LigneRecap label="Solutions distinctes" statut={statutRecap(solutions?.revele ?? false, solutions?.niveauAide ?? null)}>
        <CercleTrigEquationSketch points={exercice.solutions} regime="exact" />
      </LigneRecap>
      <RecapTotalPoints
        ecrans={[poserEquation, isolerX, solutions].map((info) => ({
          revele: info?.revele ?? false,
          niveauAide: info?.niveauAide ?? null,
        }))}
      />
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {dernier ? "Voir le résumé" : "Exercice suivant"}
      </button>
    </div>
  );
}
