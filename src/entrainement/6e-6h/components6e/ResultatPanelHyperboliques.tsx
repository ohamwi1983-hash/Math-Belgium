import type { ResultatExerciceHyperboliques } from "../moteur6e/typesHyperboliques";
import { totalPointsHyperboliques } from "../ui6e/formatHyperboliques";
import { LigneRecap, statutRecap } from "./LigneRecap";

interface Props {
  resultat: ResultatExerciceHyperboliques;
  onContinuer: () => void;
  dernier: boolean;
}

/**
 * Écran récapitulatif final — liste à plat, une `LigneRecap` PAR ÉCRAN RÉELLEMENT TRAVERSÉ, colorée
 * selon `statutRecap(details[phase].revele, details[phase].niveauAide)` — jamais de score
 * fractionnaire par écran. Même principe que `ResultatPanelDomaineDeriveeLogarithme.tsx` (`6gen16`).
 */
export function ResultatPanelHyperboliques({ resultat, onContinuer, dernier }: Props) {
  const d = resultat.details;
  const total = totalPointsHyperboliques(resultat);

  return (
    <div className="resultat-panel">
      <h2>Récapitulatif</h2>
      {resultat.famille === "A" && (
        <LigneRecap label="Parité" statut={statutRecap(d.aParite?.revele ?? false, d.aParite?.niveauAide ?? null)}>
          Parité déterminée en comparant f(−x) à f(x) et à −f(x).
        </LigneRecap>
      )}
      {resultat.famille === "B" && (
        <>
          <LigneRecap label="Expression isolée" statut={statutRecap(d.bIsoler?.revele ?? false, d.bIsoler?.niveauAide ?? null)}>
            Inconnue isolée à partir de l'identité ch²(x0)−sh²(x0)=1.
          </LigneRecap>
          <LigneRecap label="Valeur(s) numérique(s)" statut={statutRecap(d.bValeurs?.revele ?? false, d.bValeurs?.niveauAide ?? null)}>
            Calculée(s) à partir de l'expression confirmée à l'étape précédente.
          </LigneRecap>
        </>
      )}
      {resultat.famille === "C" && (
        <>
          <LigneRecap label="f'(x)" statut={statutRecap(d.cDerivee?.revele ?? false, d.cDerivee?.niveauAide ?? null)}>
            f'(x) calculée via sh'=ch et ch'=sh, avec la chaîne pour l'argument kx.
          </LigneRecap>
          <LigneRecap label="f''(x)" statut={statutRecap(d.cDeriveeSeconde?.revele ?? false, d.cDeriveeSeconde?.niveauAide ?? null)}>
            f''(x) calculée à partir de f'(x) confirmée à l'étape précédente.
          </LigneRecap>
          <LigneRecap label="Relation f''=k²·f" statut={statutRecap(d.cRelation?.revele ?? false, d.cRelation?.niveauAide ?? null)}>
            Coefficient k² identifié à partir de f''(x) confirmée à l'étape précédente.
          </LigneRecap>
        </>
      )}
      {resultat.famille === "D" && (
        <>
          <LigneRecap label="Réécriture en eˣ/e⁻ˣ" statut={statutRecap(d.dReecriture?.revele ?? false, d.dReecriture?.niveauAide ?? null)}>
            f(x) réécrite en termes de eˣ et e⁻ˣ.
          </LigneRecap>
          <LigneRecap label="Limites en ±∞" statut={statutRecap(d.dLimites?.revele ?? false, d.dLimites?.niveauAide ?? null)}>
            Signe de chaque limite déduit de la forme confirmée à l'étape précédente.
          </LigneRecap>
        </>
      )}
      <div className="recap-final-total">
        Total : {Math.round(total.points)}/{total.maximum}
      </div>
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {dernier ? "Voir le résumé" : "Exercice suivant"}
      </button>
    </div>
  );
}
