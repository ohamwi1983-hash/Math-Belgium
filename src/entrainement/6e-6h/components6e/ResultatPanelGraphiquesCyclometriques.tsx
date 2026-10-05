import type { ResultatExerciceGraphiquesCyclometriques } from "../moteur6e/typesGraphiquesCyclometriques";
import { Katex } from "../components/Katex";
import {
  calculerViewBoxGraphique,
  formatEnsembleReelApproxLatex,
  formatExtremumLatex,
  formatOrdonneeLatex,
  LIBELLE_PARITE,
} from "../ui6e/formatGraphiquesCyclometriques";
import { GrapheOptionCyclo } from "./GrapheOptionCyclo";
import { LigneRecap, statutRecap } from "./LigneRecap";

interface Props {
  resultat: ResultatExerciceGraphiquesCyclometriques;
  info: { niveauAide: number; revele: boolean } | undefined;
  onContinuer: () => void;
  dernier: boolean;
}

/**
 * Écran récapitulatif final — REFONTE : un seul écran par exercice désormais (7 sous-réponses
 * soumises ensemble), donc une seule tentative-bloc et un seul statut couleur partagé par les 7
 * `LigneRecap` (lettre + les 6 propriétés) — jamais un score fractionnaire `X/100` par ligne, la
 * réponse RÉELLEMENT attendue de chaque ligne est affichée à la place (voir CLAUDE.md,
 * "Récapitulatif final à plat, coloré").
 */
export function ResultatPanelGraphiquesCyclometriques({ resultat, info, onContinuer, dernier }: Props) {
  const exercice = resultat.exercice;
  const props = exercice.proprietes;
  const viewBox = calculerViewBoxGraphique(exercice);
  const statut = statutRecap(info?.revele ?? false, info?.niveauAide ?? null);

  return (
    <div className="card resultat-panel">
      <h2>Récapitulatif</h2>
      <LigneRecap label="Graphique" statut={statut}>
        <GrapheOptionCyclo exercice={exercice} index={exercice.indexCorrect} viewBox={viewBox} largeur={150} hauteur={150} />
      </LigneRecap>
      <LigneRecap label="Ordonnée à l'origine" statut={statut}>
        <Katex expression={formatOrdonneeLatex(props.ordonnee)} />
      </LigneRecap>
      <LigneRecap label="Domaine de f" statut={statut}>
        <Katex expression={`\\text{dom} f = ${formatEnsembleReelApproxLatex(props.domf)}`} />
      </LigneRecap>
      <LigneRecap label="Image de f" statut={statut}>
        <Katex expression={`\\text{Im}(f) = ${formatEnsembleReelApproxLatex(props.imf)}`} />
      </LigneRecap>
      <LigneRecap label="Parité" statut={statut}>
        {LIBELLE_PARITE[props.parite]}
      </LigneRecap>
      <LigneRecap label="Maximum" statut={statut}>
        <Katex expression={formatExtremumLatex(props.maximum)} />
      </LigneRecap>
      <LigneRecap label="Minimum" statut={statut}>
        <Katex expression={formatExtremumLatex(props.minimum)} />
      </LigneRecap>
      <p className="recap-final-total">Score : {Math.round(resultat.score)}/100</p>
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {dernier ? "Voir le résumé" : "Exercice suivant"}
      </button>
    </div>
  );
}
