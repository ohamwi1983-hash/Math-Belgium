import type { PhasePolygonesArcsSecteurs, ResultatExercicePolygonesArcsSecteurs } from "../moteur5e/typesPolygonesArcsSecteurs";
import {
  formatAireTotaleAttendueLatex,
  formatArcElementaireAttendueLatex,
  formatArcMultiPasAttendueLatex,
  formatCirconferenceAttendueLatex,
  formatSecteurElementaireAttendueLatex,
  formatSecteurMultiPasAttendueLatex,
} from "../ui5e/formatPolygonesArcsSecteurs";
import { LigneRecap, RecapTotalPoints, statutRecap } from "./LigneRecap";
import { Katex } from "../components/Katex";

interface Props {
  resultat: ResultatExercicePolygonesArcsSecteurs;
  aideParPhase: Partial<Record<PhasePolygonesArcsSecteurs, number>>;
  onContinuer: () => void;
  dernier: boolean;
}

/**
 * Écran récapitulatif final — liste à plat (`LigneRecap`), une ligne par écran RÉELLEMENT
 * traversé (les 2 écrans "multi-pas" sont optionnels, gardés sur `scoreXxx !== null`), contenant
 * la réponse attendue (jamais un score fractionnaire `X/100`).
 *
 * `niveauAide` n'est pas tracké par écran côté `ResultatExercicePolygonesArcsSecteurs` (seuls
 * `scoreXxx`/`xxxRevele` existent, `moteur5e/typesPolygonesArcsSecteurs.ts`) — le niveau d'aide
 * RÉELLEMENT utilisé sur chaque écran est donc capturé côté présentation (`App5gen7.tsx`,
 * `aideParPhase`, figé au moment où l'écran se ferme) et transmis ici en prop, jamais recalculé
 * depuis le score.
 */
export function ResultatPanelPolygone({ resultat, aideParPhase, onContinuer, dernier }: Props) {
  const exercice = resultat.exercice;
  const arcMultiPasCorrect = formatArcMultiPasAttendueLatex(exercice);
  const secteurMultiPasCorrect = formatSecteurMultiPasAttendueLatex(exercice);

  return (
    <div className="resultat-panel">
      <h2>Récapitulatif</h2>
      <LigneRecap label="Cercle entier" statut={statutRecap(resultat.cercleEntierRevele, aideParPhase.cercleEntier ?? null)}>
        <Katex expression={`\\text{Circonférence} = ${formatCirconferenceAttendueLatex(exercice)}`} />{" "}
        <Katex expression={`\\text{Aire} = ${formatAireTotaleAttendueLatex(exercice)}`} />
      </LigneRecap>
      <LigneRecap label="Arc élémentaire" statut={statutRecap(resultat.arcElementaireRevele, aideParPhase.arcElementaire ?? null)}>
        <Katex expression={formatArcElementaireAttendueLatex(exercice)} />
      </LigneRecap>
      {resultat.scoreArcMultiPas !== null && arcMultiPasCorrect !== null && (
        <LigneRecap label="Arc multi-pas" statut={statutRecap(resultat.arcMultiPasRevele, aideParPhase.arcMultiPas ?? null)}>
          <Katex expression={arcMultiPasCorrect} />
        </LigneRecap>
      )}
      <LigneRecap label="Secteur élémentaire" statut={statutRecap(resultat.secteurElementaireRevele, aideParPhase.secteurElementaire ?? null)}>
        <Katex expression={formatSecteurElementaireAttendueLatex(exercice)} />
      </LigneRecap>
      {resultat.scoreSecteurMultiPas !== null && secteurMultiPasCorrect !== null && (
        <LigneRecap label="Secteur multi-pas" statut={statutRecap(resultat.secteurMultiPasRevele, aideParPhase.secteurMultiPas ?? null)}>
          <Katex expression={secteurMultiPasCorrect} />
        </LigneRecap>
      )}
      <RecapTotalPoints
        ecrans={[
          { revele: resultat.cercleEntierRevele, niveauAide: aideParPhase.cercleEntier ?? null },
          { revele: resultat.arcElementaireRevele, niveauAide: aideParPhase.arcElementaire ?? null },
          ...(resultat.scoreArcMultiPas !== null && arcMultiPasCorrect !== null ? [{ revele: resultat.arcMultiPasRevele, niveauAide: aideParPhase.arcMultiPas ?? null }] : []),
          { revele: resultat.secteurElementaireRevele, niveauAide: aideParPhase.secteurElementaire ?? null },
          ...(resultat.scoreSecteurMultiPas !== null && secteurMultiPasCorrect !== null ? [{ revele: resultat.secteurMultiPasRevele, niveauAide: aideParPhase.secteurMultiPas ?? null }] : []),
        ]}
      />
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {dernier ? "Voir le résumé" : "Exercice suivant"}
      </button>
    </div>
  );
}
