import type { PhaseConvergenceSuite, ResultatExerciceConvergenceSuite } from "../moteur5e/typesConvergenceSuites";
import { formatExpressionDiviseeLatex, formatTermesDonneesLatex, libelleClassificationAttendue, texteAideNiveau2 } from "../ui5e/formatConvergenceSuites";
import { Katex } from "../components/Katex";
import { LigneRecap, statutRecap, RecapTotalPoints } from "./LigneRecap";

interface Props {
  resultat: ResultatExerciceConvergenceSuite;
  aideParPhase: Partial<Record<PhaseConvergenceSuite, { niveauAide: number; revele: boolean }>>;
  onContinuer: () => void;
  dernier: boolean;
}

/**
 * Écran récapitulatif final — liste à plat (même convention que 5gen1,
 * `ResultatPanelDomaineDefinition.tsx`), dispatchée sur `exercice.variante` : 1 ligne pour
 * "arithmetique"/"geometrique" (écran unique), 2 lignes pour "quelconque" (diviser puis conclure).
 * `aideParPhase` (fourni par `App5gen16.tsx`, capturé au moment précis où chaque écran se ferme)
 * porte `niveauAide`/`revele` par écran — `ResultatExerciceConvergenceSuite.scores` (Couche B) ne
 * les trace pas, jamais touché ici.
 */
export function ResultatPanelConvergenceSuites({ resultat, aideParPhase, onContinuer, dernier }: Props) {
  const exercice = resultat.exercice;

  function statutPhase(phase: PhaseConvergenceSuite) {
    const info = aideParPhase[phase];
    return statutRecap(info?.revele ?? false, info?.niveauAide ?? null);
  }

  /** Phases RÉELLEMENT affichées ci-dessous, mêmes conditions — source unique pour `RecapTotalPoints`. */
  const phasesAffichees: PhaseConvergenceSuite[] = [
    ...(exercice.variante === "arithmetique" && resultat.scores.classificationArithmetique !== undefined
      ? (["classificationArithmetique"] as const)
      : []),
    ...(exercice.variante === "geometrique" && resultat.scores.classificationGeometrique !== undefined
      ? (["classificationGeometrique"] as const)
      : []),
    ...(exercice.variante === "quelconque" && resultat.scores.diviserQuelconque !== undefined ? (["diviserQuelconque"] as const) : []),
    ...(exercice.variante === "quelconque" && resultat.scores.classifierQuelconque !== undefined ? (["classifierQuelconque"] as const) : []),
  ];

  return (
    <div className="resultat-panel">
      <h2>Récapitulatif</h2>
      <div className="equation-box equation-box-termes">
        {formatTermesDonneesLatex(exercice).map((frag, i) => (
          <Katex key={i} expression={frag} />
        ))}
      </div>

      {exercice.variante === "arithmetique" && resultat.scores.classificationArithmetique !== undefined && (
        <LigneRecap label="Classification (arithmétique)" statut={statutPhase("classificationArithmetique")}>
          {libelleClassificationAttendue(exercice, "classificationArithmetique")}
        </LigneRecap>
      )}

      {exercice.variante === "geometrique" && resultat.scores.classificationGeometrique !== undefined && (
        <LigneRecap label="Classification (géométrique)" statut={statutPhase("classificationGeometrique")}>
          {libelleClassificationAttendue(exercice, "classificationGeometrique")}
        </LigneRecap>
      )}

      {exercice.variante === "quelconque" && (
        <>
          {resultat.scores.diviserQuelconque !== undefined && (
            <LigneRecap label="Diviser par la plus haute puissance" statut={statutPhase("diviserQuelconque")}>
              <Katex expression={formatExpressionDiviseeLatex(exercice)} />
            </LigneRecap>
          )}
          {resultat.scores.classifierQuelconque !== undefined && (
            <LigneRecap label="Conclure sur la limite" statut={statutPhase("classifierQuelconque")}>
              {libelleClassificationAttendue(exercice, "classifierQuelconque")}
              {exercice.classification === "limiteValeur" && (
                <>
                  {" — "}
                  <Katex expression={texteAideNiveau2(exercice, "classifierQuelconque")} />
                </>
              )}
            </LigneRecap>
          )}
        </>
      )}

      <RecapTotalPoints
        ecrans={phasesAffichees.map((phase) => {
          const info = aideParPhase[phase];
          return { revele: info?.revele ?? false, niveauAide: info?.niveauAide ?? null };
        })}
      />
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {dernier ? "Voir le résumé" : "Exercice suivant"}
      </button>
    </div>
  );
}
