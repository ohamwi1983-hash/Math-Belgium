import type { ResultatExerciceDomaineDeriveeLogarithme } from "../moteur6e/typesDomaineDeriveeLogarithme";
import { formatEnsembleReelLatex } from "../ui6e/formatEnsembleReel";
import { totalPointsDomaineDeriveeLogarithme } from "../ui6e/formatDomaineDeriveeLogarithme";
import { Katex } from "../components/Katex";
import { LigneRecap, statutRecap } from "./LigneRecap";

interface Props {
  resultat: ResultatExerciceDomaineDeriveeLogarithme;
  onContinuer: () => void;
  dernier: boolean;
}

/**
 * Écran récapitulatif final — liste à plat, une `LigneRecap` PAR ÉCRAN RÉELLEMENT TRAVERSÉ,
 * colorée selon `statutRecap(details[phase].revele, details[phase].niveauAide)` — jamais de score
 * fractionnaire par écran. La famille G n'a AUCUNE ligne "Domaine" (pas d'écran de domaine — voir
 * `core6e/domaineDeriveeLogarithme.types.ts`). Le domaine des 6 autres familles est PRÉCALCULÉ sur
 * l'exercice (`exercice.domaine`, "cible d'abord") — affiché tel quel. Même principe que
 * `ResultatPanelDomaineDeriveeExponentielle.tsx` (`6gen7`).
 */
export function ResultatPanelDomaineDeriveeLogarithme({ resultat, onContinuer, dernier }: Props) {
  const d = resultat.details;
  const exercice = resultat.exercice;
  const total = totalPointsDomaineDeriveeLogarithme(resultat);

  const domaineDetail = d.aDomaine ?? d.bDomaine ?? d.cDomaine ?? d.dDomaine ?? d.eDomaine ?? d.fDomaine;

  return (
    <div className="resultat-panel">
      <h2>Récapitulatif</h2>
      {resultat.famille !== "G" && "domaine" in exercice && (
        <LigneRecap label="Domaine" statut={statutRecap(domaineDetail?.revele ?? false, domaineDetail?.niveauAide ?? null)}>
          <Katex expression={formatEnsembleReelLatex(exercice.domaine)} />
        </LigneRecap>
      )}
      {(resultat.famille === "A" || resultat.famille === "B" || resultat.famille === "F") && (
        <LigneRecap label="Dérivée" statut={statutRecap((d.aDerivee ?? d.bDerivee ?? d.fDerivee)?.revele ?? false, (d.aDerivee ?? d.bDerivee ?? d.fDerivee)?.niveauAide ?? null)}>
          Dérivée calculée directement, vérifiée par équivalence numérique avec f'(x).
        </LigneRecap>
      )}
      {resultat.famille === "C" && (
        <>
          <LigneRecap label="Dérivées des facteurs" statut={statutRecap(d.cFacteurs?.revele ?? false, d.cFacteurs?.niveauAide ?? null)}>
            u'(x) et v'(x), vérifiées séparément par équivalence numérique.
          </LigneRecap>
          <LigneRecap label="Assemblage (u'v+uv')" statut={statutRecap(d.cAssemblage?.revele ?? false, d.cAssemblage?.niveauAide ?? null)}>
            f'(x) assemblée, vérifiée par équivalence numérique.
          </LigneRecap>
        </>
      )}
      {resultat.famille === "D" && (
        <>
          <LigneRecap label="Dérivées N'/D'" statut={statutRecap(d.dND?.revele ?? false, d.dND?.niveauAide ?? null)}>
            N'(x) et D'(x), vérifiées séparément par équivalence numérique.
          </LigneRecap>
          <LigneRecap label="Assemblage (quotient)" statut={statutRecap(d.dAssemblage?.revele ?? false, d.dAssemblage?.niveauAide ?? null)}>
            f'(x) assemblée via (N'D−ND')/D², vérifiée par équivalence numérique.
          </LigneRecap>
        </>
      )}
      {resultat.famille === "E" && (
        <>
          <LigneRecap label="Simplification" statut={statutRecap(d.eSimplifier?.revele ?? false, d.eSimplifier?.niveauAide ?? null)}>
            Forme simplifiée via les propriétés du log, jamais une recopie brute de l'énoncé.
          </LigneRecap>
          <LigneRecap label="Dérivée" statut={statutRecap(d.eDerivee?.revele ?? false, d.eDerivee?.niveauAide ?? null)}>
            Dérivée de la forme simplifiée, vérifiée par équivalence numérique avec f'(x).
          </LigneRecap>
        </>
      )}
      {resultat.famille === "G" && (
        <>
          <LigneRecap label="Structure u^v" statut={statutRecap(d.gIdentifier?.revele ?? false, d.gIdentifier?.niveauAide ?? null)}>
            u(x) et v(x) identifiés (simplification préalable si nécessaire).
          </LigneRecap>
          <LigneRecap label="f'/f" statut={statutRecap(d.gFPrimeSurF?.revele ?? false, d.gFPrimeSurF?.niveauAide ?? null)}>
            f'/f = v'·ln(u) + v·u'/u, par dérivation logarithmique implicite.
          </LigneRecap>
          <LigneRecap label="f' isolée" statut={statutRecap(d.gIsoler?.revele ?? false, d.gIsoler?.niveauAide ?? null)}>
            f' isolée en multipliant par f=u^v.
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
