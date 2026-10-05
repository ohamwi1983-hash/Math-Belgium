import type { ResultatExerciceDomaineDeriveeExponentielle } from "../moteur6e/typesDomaineDeriveeExponentielles";
import { formatEnsembleReelLatex } from "../ui6e/formatEnsembleReel";
import { totalPointsDomaineDeriveeExponentielle } from "../ui6e/formatDomaineDeriveeExponentielles";
import { Katex } from "../components/Katex";
import { LigneRecap, statutRecap } from "./LigneRecap";

interface Props {
  resultat: ResultatExerciceDomaineDeriveeExponentielle;
  onContinuer: () => void;
  dernier: boolean;
}

/**
 * Écran récapitulatif final — liste à plat, une `LigneRecap` PAR ÉCRAN RÉELLEMENT TRAVERSÉ de
 * l'exercice, colorée selon `statutRecap(details[phase].revele, details[phase].niveauAide)` —
 * remplace l'ancien affichage à score fractionnaire (`X/100`). Le domaine est PRÉCALCULÉ sur
 * l'exercice (`exercice.domaine`, "cible d'abord") — affiché tel quel. Les écrans de dérivée
 * (facteurs/N'D'/assemblage/simplifier/dérivée) n'ont pas de chaîne de référence unique canonique
 * (toute forme algébriquement équivalente est acceptée, vérifiée par équivalence NUMÉRIQUE) — leur
 * ligne décrit donc ce qui a été vérifié plutôt qu'une expression figée.
 */
export function ResultatPanelDomaineDeriveeExponentielle({ resultat, onContinuer, dernier }: Props) {
  const d = resultat.details;
  const exercice = resultat.exercice;
  const domaineLatex = formatEnsembleReelLatex(exercice.domaine);
  // Une seule des 6 clés `xDomaine` est jamais peuplée pour un `resultat` donné (dispatch par
  // famille, voir `typesDomaineDeriveeExponentielles.ts`) — jamais un vrai conflit de repli.
  const domaineDetail = d.aDomaine ?? d.bDomaine ?? d.cDomaine ?? d.dDomaine ?? d.eDomaine ?? d.fDomaine;
  const total = totalPointsDomaineDeriveeExponentielle(resultat);

  return (
    <div className="resultat-panel">
      <h2>Récapitulatif</h2>
      <LigneRecap label="Domaine" statut={statutRecap(domaineDetail?.revele ?? false, domaineDetail?.niveauAide ?? null)}>
        <Katex expression={domaineLatex} />
      </LigneRecap>
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
            Forme simplifiée, équivalente à f(x) (jamais une recopie brute de l'énoncé).
          </LigneRecap>
          <LigneRecap label="Dérivée" statut={statutRecap(d.eDerivee?.revele ?? false, d.eDerivee?.niveauAide ?? null)}>
            Dérivée de la forme simplifiée, vérifiée par équivalence numérique avec f'(x).
          </LigneRecap>
        </>
      )}
      <div className="recap-final-total">Total : {Math.round(total.points)}/{total.maximum}</div>
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {dernier ? "Voir le résumé" : "Exercice suivant"}
      </button>
    </div>
  );
}
