import type { PhaseInjectiviteFonctions, ResultatExerciceInjectiviteFonctions } from "../moteur6e/typesInjectiviteFonctions";
import { calculerTotalPointsInjectiviteFonctions } from "../ui6e/formatInjectiviteFonctions";
import { formatEnsembleReelLatex } from "../ui6e/formatEnsembleReel";
import { Katex } from "../components/Katex";
import { LigneRecap, statutRecap } from "./LigneRecap";

interface Props {
  resultat: ResultatExerciceInjectiviteFonctions;
  niveauAideParPhase: Partial<Record<PhaseInjectiviteFonctions, number>>;
  onContinuer: () => void;
  dernier: boolean;
}

/**
 * Écran récapitulatif final — même patron plat/coloré que l'ancienne version de ce générateur
 * (`ResultatPanelSuiteArithmetique.tsx`, 5gen14) : une `LigneRecap` par écran RÉELLEMENT traversé
 * (les 5 écrans, toujours dans l'ordre — séquence fixe), contenant la réponse ATTENDUE — jamais un
 * score fractionnaire `X/100`. `revele*` vient directement de la Couche B ; `niveauAideParPhase` est
 * fourni par `App6gen1.tsx` (capturé au moment où chaque écran se ferme).
 *
 * La ligne "Injective" affiche AUSSI le(s) intervalle(s) acceptés quand `injective===false` (utile
 * même si la ligne "Réciproque"/"Image" en dépendent déjà) ; la ligne "Bijective" rappelle X et Y
 * attendus.
 */
export function ResultatPanelInjectiviteFonctions({ resultat, niveauAideParPhase, onContinuer, dernier }: Props) {
  const ex = resultat.exercice;
  const { points, maximum } = calculerTotalPointsInjectiviteFonctions(resultat);

  return (
    <div className="resultat-panel">
      <h2>Récapitulatif</h2>
      <LigneRecap label="Domaine" statut={statutRecap(resultat.reveleDomaine, niveauAideParPhase.domaine ?? null)}>
        <Katex expression={formatEnsembleReelLatex(ex.domaine)} />
      </LigneRecap>
      <LigneRecap label="Injective" statut={statutRecap(resultat.reveleInjective, niveauAideParPhase.injective ?? null)}>
        {ex.injective ? (
          "Oui"
        ) : (
          <>
            Non — injective sur <Katex expression={formatEnsembleReelLatex(ex.intervalleGauche)} /> ou sur{" "}
            <Katex expression={formatEnsembleReelLatex(ex.intervalleDroite)} />
          </>
        )}
      </LigneRecap>
      <LigneRecap label="Réciproque" statut={statutRecap(resultat.reveleReciproque, niveauAideParPhase.reciproque ?? null)}>
        f⁻¹(x) — voir la méthode (poser y=f(x), échanger x/y, isoler y) appliquée à l'intervalle retenu.
      </LigneRecap>
      <LigneRecap label="Image" statut={statutRecap(resultat.reveleImage, niveauAideParPhase.image ?? null)}>
        <Katex expression={formatEnsembleReelLatex(ex.image)} />
      </LigneRecap>
      <LigneRecap label="Bijective" statut={statutRecap(resultat.reveleBijection, niveauAideParPhase.bijection ?? null)}>
        Sur <Katex expression={formatEnsembleReelLatex(ex.intervalleGauche)} /> (ou <Katex expression={formatEnsembleReelLatex(ex.intervalleDroite)} />)
        {" dans "}
        <Katex expression={formatEnsembleReelLatex(ex.image)} />
      </LigneRecap>
      <p className="recap-final-total">
        Total : {Math.round(points)}/{maximum}
      </p>
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {dernier ? "Voir le résumé" : "Exercice suivant"}
      </button>
    </div>
  );
}
