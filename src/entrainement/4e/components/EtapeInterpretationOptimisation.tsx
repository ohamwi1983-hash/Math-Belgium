import { useState } from "react";
import type { ExerciceOptimisation } from "../core/optimisation.types";
import { verifierInterpretation } from "../moteur/verificationOptimisation";
import { NIVEAU_AIDE_MAX_INTERPRETATION } from "../moteur/sessionOptimisation";
import { consigneInterpretation, formatDonneesFinalesLatex, texteAideInterpretationNiveau1 } from "../ui/formatOptimisation";
import { formatMessageErreur } from "../ui/messageErreur";
import { EnonceOptimisation } from "./EnonceOptimisation";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceOptimisation;
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

/** Écran commun aux 2 variantes, toujours TERMINAL — QCM, choisir la phrase de conclusion correcte
 * parmi `exercice.optionsInterpretation` (ordre déjà mélangé à la génération, jamais retrié). */
export function EtapeInterpretationOptimisation({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation}: Props) {
  const [choix, setChoix] = useState<number | null>(null);
  const apresEchec = tentativesUtilisees > 0;
  const erronee = apresEchec && choix !== null && !verifierInterpretation(exercice, choix);

  return (
    <div>
      <EnonceOptimisation exercice={exercice} />
      <EtatActuelPanel latex={formatDonneesFinalesLatex(exercice)} label="Données" />
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
