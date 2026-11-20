import { useState } from "react";
import type { ExerciceTriangleLies } from "../core/triangleLies.types";
import { verifierInterpretation } from "../moteur/verificationTriangleLies";
import { NIVEAU_AIDE_MAX_INTERPRETATION } from "../moteur/sessionTriangleLies";
import { consigneInterpretation } from "../ui/formatTriangleLies";
import { aidesInterpretation } from "../ui/aidesTrianglesLies";
import { RenduFragments } from "./RenduFragments";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { EnTeteExercice } from "./EnTeteExercice";
import { QuestionFinale } from "./QuestionFinale";
import { TriangleLiesSketch } from "./TriangleLiesSketch";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceTriangleLies;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  /** Récap « Ce qu'on sait déjà » des écrans déjà clos (`calculerRecapitulatifTriangleLies`). */
  recapitulatif: EntreeRecapitulatif[];
  onValider: (indexChoisi: number | null) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran commun aux 2 variantes, toujours TERMINAL — QCM, choisir la phrase de conclusion correcte
 * parmi `exercice.optionsInterpretation` (ordre déjà mélangé à la génération, jamais retrié). */
export function EtapeInterpretationTriangleLies({ exercice, tentativesUtilisees, niveauAide, onActiverAide, recapitulatif, onValider, validation }: Props) {
  const [choix, setChoix] = useState<number | null>(null);
  const apresEchec = tentativesUtilisees > 0;
  // Choix fermé à UNE tentative : jamais de correction avant la clôture.
  void apresEchec;
  void verifierInterpretation;
  const erronee = false;

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={exercice.contexte}
        blocDonnees={
          <>
            <QuestionFinale question={exercice.questionCible} />
            <TriangleLiesSketch exercice={exercice} />
          </>
        }
      />
      <RecapitulatifPanel entrees={recapitulatif} />
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
          {aidesInterpretation().slice(0, niveauAide).map((fragments, i) => (
            <p key={i}>
              <RenduFragments fragments={fragments} />
            </p>
          ))}
        </div>
      )}
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_INTERPRETATION} onActiverAide={onActiverAide} />

        <button type="button" className="btn btn-primary" disabled={choix === null} onClick={() => onValider(choix)}>
          Valider
        </button>
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
