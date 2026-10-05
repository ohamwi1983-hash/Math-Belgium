import { useState } from "react";
import type { ExerciceComparaisonSeries, QuestionInterpretation } from "../core/comparaisonSeries.types";
import { verifierInterpretation } from "../moteur/verificationComparaisonSeries";
import { niveauAideMax } from "../moteur/sessionComparaisonSeries";
import {
  libelleBoutonAide,
  segmentsAideInterpretationNiveau1,
  segmentsAideInterpretationNiveau2,
  segmentsConsigneInterpretation,
} from "../ui/formatComparaisonSeries";
import { formatMessageErreur } from "../ui/messageErreur";
import { DonneesComparaisonSeries } from "./DonneesComparaisonSeries";
import { EnonceComparaisonSeries } from "./EnonceComparaisonSeries";
import { SegmentsInline } from "./SegmentsInline";

interface Props {
  exercice: ExerciceComparaisonSeries;
  question: QuestionInterpretation;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (choix: "A" | "B") => void;
}

/** Question "interprétation contextuelle" — un profil narratif (dérivé des vraies stats de
 * `question.serieDecrite`, jamais deviné par l'élève) à associer à la bonne série. */
export function EtapeInterpretationComparaison({ exercice, question, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [choix, setChoix] = useState<"A" | "B" | null>(null);
  const maxAide = niveauAideMax();

  const apresEchec = tentativesUtilisees > 0;
  const erronee = apresEchec && choix !== null && !verifierInterpretation(question, choix);

  return (
    <div>
      <EnonceComparaisonSeries exercice={exercice} />
      <DonneesComparaisonSeries exercice={exercice} />

      <p className="prompt-text">
        <SegmentsInline segments={segmentsConsigneInterpretation(question, exercice)} />
      </p>

      <div className="options-grid-compact">
        <button
          type="button"
          className={`btn${choix === "A" ? " toggle-active" : ""}${erronee && choix === "A" ? " is-erronee" : ""}`}
          onClick={() => setChoix("A")}
        >
          Série A
        </button>
        <button
          type="button"
          className={`btn${choix === "B" ? " toggle-active" : ""}${erronee && choix === "B" ? " is-erronee" : ""}`}
          onClick={() => setChoix("B")}
        >
          Série B
        </button>
      </div>

      {niveauAide >= 1 && (
        <div className="triangle-quelconque-aide">
          <p>
            <SegmentsInline segments={segmentsAideInterpretationNiveau1()} />
          </p>
          {niveauAide >= 2 && (
            <p>
              <SegmentsInline segments={segmentsAideInterpretationNiveau2(exercice)} />
            </p>
          )}
        </div>
      )}
      <button type="button" className="btn btn-aide" disabled={niveauAide >= maxAide} onClick={onActiverAide}>
        {libelleBoutonAide(niveauAide, maxAide)}
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
