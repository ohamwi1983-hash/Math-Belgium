import { useState } from "react";
import type { ConclusionIntersectionDroites, ExerciceIntersectionDroites } from "../core/intersectionDroites.types";
import { NIVEAU_AIDE_MAX_DIAGNOSTIC } from "../moteur/sessionIntersectionDroites";
import {
  CONSIGNE_GENERALE_INTERSECTION,
  LIBELLE_CONCLUSION,
  formatAideDiagnosticNiveau2Latex,
  formatLignesEnonce,
  libelleBoutonAide,
  segmentsAideDiagnosticNiveau1,
  segmentsConsigneDiagnostic,
} from "../ui/formatIntersectionDroites";
import { formatMessageErreur } from "../ui/messageErreur";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";

interface Props {
  exercice: ExerciceIntersectionDroites;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ConclusionIntersectionDroites) => void;
}

const OPTIONS: ConclusionIntersectionDroites[] = ["secantes", "paralleles_distinctes", "confondues"];

/**
 * Écran 1 — Diagnostic. Purement catégoriel (3 boutons), aucune saisie libre — même patron que
 * `EtapeClassificationPositionDroitePlan.tsx`. Aide DIFFÉRENCIÉE selon la combinaison de formes
 * d'entrée des deux droites (`promptgen48modifications.md`, point 3).
 */
export function EtapeDiagnosticIntersectionDroites({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [choix, setChoix] = useState<ConclusionIntersectionDroites | null>(null);
  const max = NIVEAU_AIDE_MAX_DIAGNOSTIC;
  const erronee = tentativesUtilisees > 0;
  const [ligneD1, ligneD2] = formatLignesEnonce(exercice);

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE_INTERSECTION}</p>
      <div className="equation-box">
        <Katex expression={ligneD1} block />
        <Katex expression={ligneD2} block />
      </div>
      <p className="prompt-text">
        <RenduFragments fragments={segmentsConsigneDiagnostic()} />
      </p>

      <div className="options-grid-compact">
        {OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            className={`btn${choix === option ? " toggle-active" : ""}${erronee && choix === option ? " is-erronee" : ""}`}
            onClick={() => setChoix(option)}
          >
            {LIBELLE_CONCLUSION[option]}
          </button>
        ))}
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>
            <RenduFragments fragments={segmentsAideDiagnosticNiveau1(exercice)} />
          </p>
          {niveauAide >= 2 && (
            <p>
              <Katex expression={formatAideDiagnosticNiveau2Latex(exercice)} />
            </p>
          )}
        </div>
      )}
      <button type="button" className="btn btn-aide" disabled={niveauAide >= max} onClick={onActiverAide}>
        {libelleBoutonAide(niveauAide, max)}
      </button>

      <button type="button" className="btn btn-primary" disabled={choix === null} onClick={() => choix !== null && onValider(choix)}>
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax)}
        </p>
      )}
    </div>
  );
}
