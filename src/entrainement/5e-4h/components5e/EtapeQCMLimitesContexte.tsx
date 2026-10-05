import { useState } from "react";
import type { ExerciceLimitesContexte, OptionInterpretation } from "../core5e/limitesContexte.types";
import type { PhaseLimitesContexte } from "../moteur5e/typesLimitesContexte";
import { consigneGenerale, consignePhase, formatContexteTexte, formatTermesDonneesLatex, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatLimitesContexte";
import { Katex } from "../components/Katex";
import { BoutonAide } from "./BoutonAide";
import { CalculatriceScientifique } from "./CalculatriceScientifique";
import { EtatActuelLimitesContexte } from "./EtatActuelLimitesContexte";
import { formatMessageErreur } from "../ui/messageErreur";

interface Props {
  exercice: ExerciceLimitesContexte;
  phase: PhaseLimitesContexte;
  options: OptionInterpretation[];
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (indexChoisi: number | null) => void;
  verifier: (indexChoisi: number | null) => boolean;
}

/** Écran QCM "interprétation"/"AV sens"/"croissance-régression" — motif du précédent 4e
 * (`EtapeInterpretationOptimisation.tsx`) : `optionsInterpretation`, phrases pré-écrites (une seule
 * correcte, ordre mélangé à la génération), jamais de saisie libre en français. */
export function EtapeQCMLimitesContexte({ exercice, phase, options, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, verifier }: Props) {
  const [choix, setChoix] = useState<number | null>(null);
  const apresEchec = tentativesUtilisees > 0;
  const erronee = apresEchec && choix !== null && !verifier(choix);

  return (
    <div>
      <p className="prompt-text">{consigneGenerale()}</p>
      <p className="prompt-text">{formatContexteTexte(exercice)}</p>
      <div className="equation-box equation-box-donnees">
        {formatTermesDonneesLatex(exercice).map((frag, i) => (
          <Katex key={i} expression={frag} />
        ))}
      </div>
      <EtatActuelLimitesContexte exercice={exercice} phase={phase} />
      <p className="prompt-text">{consignePhase(exercice, phase)}</p>

      <div className="options-grid">
        {options.map((option, index) => (
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

      <CalculatriceScientifique />
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={choix === null} onClick={() => onValider(choix)}>
        Valider
      </button>
      {apresEchec && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, null)}
        </p>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{texteAideNiveau1(exercice, phase)}</p>
          {niveauAide >= 2 && <p>{texteAideNiveau2(exercice, phase)}</p>}
        </div>
      )}
    </div>
  );
}
