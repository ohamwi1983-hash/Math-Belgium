import { useState } from "react";
import type { ExerciceEquationInequationSecondDegre } from "../core/equationInequationSecondDegre.types";
import { verifierInterpretation } from "../moteur/verificationEquationInequationSecondDegre";
import { NIVEAU_AIDE_MAX_INTERPRETATION } from "../moteur/sessionEquationInequationSecondDegre";
import { consigneInterpretation, formatDonneesFinalesLatex, texteAideInterpretationNiveau1 } from "../ui/formatEquationInequationSecondDegre";
import { segmentsPhraseEnonce } from "../ui/formatOptimisation";
import { formatMessageErreur } from "../ui/messageErreur";
import { EnTeteExercice } from "./EnTeteExercice";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { QuestionFinale } from "./QuestionFinale";
import { SegmentsInline } from "./SegmentsInline";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceEquationInequationSecondDegre;
  estPremierEcran: boolean;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (indexChoisi: number | null) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran 7, TOUJOURS terminal — QCM, phrase de conclusion correcte parmi 4 options mélangées. */
export function EtapeInterpretationEquationInequationSecondDegre({ exercice, estPremierEcran, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation}: Props) {
  const [choix, setChoix] = useState<number | null>(null);
  const apresEchec = tentativesUtilisees > 0;
  const erronee = apresEchec && choix !== null && !verifierInterpretation(exercice, choix);

  return (
    <div>
      <EnTeteExercice
        estPremierEcran={estPremierEcran}
        consigneGenerale={<SegmentsInline segments={segmentsPhraseEnonce(exercice.base.contexte.phraseEnonce)} />}
        blocDonnees={<QuestionFinale question={exercice.base.contexte.questionFinale} />}
      />
      <EtatActuelPanel latex={formatDonneesFinalesLatex(exercice)} />
      <p className="prompt-text">{consigneInterpretation()}</p>

      <div className="options-grid">
        {exercice.optionsInterpretation.map((option, index) => (
          <button
            key={index}
            type="button"
            className={`btn${choix === index ? " toggle-active" : ""}${erronee && choix === index ? " is-erronee" : ""}`}
            onClick={() => setChoix(index)}
          >
            {option.texte}
          </button>
        ))}
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{texteAideInterpretationNiveau1()}</p>
        </div>
      )}
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_INTERPRETATION} onActiverAide={onActiverAide} />

        <button type="button" className="btn btn-primary" disabled={choix === null} onClick={() => onValider(choix)}>
          Valider
        </button>
        {apresEchec && (
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
