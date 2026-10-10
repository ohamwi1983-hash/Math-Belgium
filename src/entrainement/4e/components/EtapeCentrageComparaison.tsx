import { useState } from "react";
import type { ExerciceComparaisonSeries, QuestionCentrage } from "../core/comparaisonSeries.types";
import { verifierCentrage } from "../moteur/verificationComparaisonSeries";
import { niveauAideMax } from "../moteur/sessionComparaisonSeries";
import { segmentsAideCentrageNiveau1, segmentsAideCentrageNiveau2, segmentsConsigneCentrage } from "../ui/formatComparaisonSeries";
import { formatMessageErreur } from "../ui/messageErreur";
import { DonneesComparaisonSeries } from "./DonneesComparaisonSeries";
import { EnonceComparaisonSeries } from "./EnonceComparaisonSeries";
import { SegmentsInline } from "./SegmentsInline";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceComparaisonSeries;
  question: QuestionCentrage;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (choix: "A" | "B") => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Question "centrage" — champ catégoriel A/B, jamais de statut à 3 valeurs (aucune saisie libre). */
export function EtapeCentrageComparaison({ exercice, question, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation}: Props) {
  const [choix, setChoix] = useState<"A" | "B" | null>(null);
  const maxAide = niveauAideMax();

  const apresEchec = tentativesUtilisees > 0;
  const erronee = apresEchec && choix !== null && !verifierCentrage(question, choix);

  return (
    <div>
      <EnonceComparaisonSeries exercice={exercice} />
      <DonneesComparaisonSeries exercice={exercice} />

      <p className="prompt-text">
        <SegmentsInline segments={segmentsConsigneCentrage()} />
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
            <SegmentsInline segments={segmentsAideCentrageNiveau1()} />
          </p>
          {niveauAide >= 2 && (
            <p>
              <SegmentsInline segments={segmentsAideCentrageNiveau2(exercice)} />
            </p>
          )}
        </div>
      )}
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={maxAide} onActiverAide={onActiverAide} />

        <button type="button" className="btn btn-primary" disabled={choix === null} onClick={() => choix !== null && onValider(choix)}>
          Valider
        </button>
        {tentativesUtilisees > 0 && (
          <p className="alert-error" role="alert">
            {formatMessageErreur(tentativesUtilisees, tentativesMax)}
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
