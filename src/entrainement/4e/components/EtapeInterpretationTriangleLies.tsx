import { useState } from "react";
import type { ExerciceTriangleLies } from "../core/triangleLies.types";
import { verifierInterpretation } from "../moteur/verificationTriangleLies";
import { NIVEAU_AIDE_MAX_INTERPRETATION } from "../moteur/sessionTriangleLies";
import { consigneInterpretation, formatEtatActuelAnglesConfirmes, formatEtatActuelCibleConfirme, formatEtatActuelPontConfirme, formatEtatActuelSoustractionConfirme, texteAideInterpretationNiveau1 } from "../ui/formatTriangleLies";
import { formatMessageErreur } from "../ui/messageErreur";
import { BlocDonneesTriangleLies } from "./BlocDonneesTriangleLies";
import { EnonceTriangleLies } from "./EnonceTriangleLies";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceTriangleLies;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (indexChoisi: number | null) => void;
}

/** Écran commun aux 2 variantes, toujours TERMINAL — QCM, choisir la phrase de conclusion correcte
 * parmi `exercice.optionsInterpretation` (ordre déjà mélangé à la génération, jamais retrié). */
export function EtapeInterpretationTriangleLies({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [choix, setChoix] = useState<number | null>(null);
  const apresEchec = tentativesUtilisees > 0;
  const erronee = apresEchec && choix !== null && !verifierInterpretation(exercice, choix);

  const etatActuel = [formatEtatActuelPontConfirme(exercice)];
  if (exercice.variante === "anglePartage") {
    etatActuel.push(formatEtatActuelAnglesConfirmes(exercice));
  }
  if (exercice.variante === "sommetPartage") {
    etatActuel.push(formatEtatActuelSoustractionConfirme(exercice));
  }
  etatActuel.push(formatEtatActuelCibleConfirme(exercice));

  return (
    <div>
      <EnonceTriangleLies exercice={exercice} />
      <BlocDonneesTriangleLies titre="État actuel" lignes={etatActuel} />
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
      <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_INTERPRETATION} onActiverAide={onActiverAide} />

      <button type="button" className="btn btn-primary" disabled={choix === null} onClick={() => onValider(choix)}>
        Valider
      </button>
      {apresEchec && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax)}
        </p>
      )}
    </div>
  );
}
