import { useState } from "react";
import type { ExerciceSuiteClassique } from "../core5e/suitesClassiques.types";
import type { PhaseSuiteClassique } from "../moteur5e/typesSuiteClassique";
import { consigneGenerale, consignePhase, formatTermesDonneesLatex, optionsQCM, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatSuiteClassique";
import { Katex } from "../components/Katex";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelSuiteClassique } from "./EtatActuelSuiteClassique";

interface Props {
  exercice: ExerciceSuiteClassique;
  phase: PhaseSuiteClassique;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (choixId: string) => void;
}

/** Écran de choix multiple (QCM) — réutilisé par 6 des 26 phases de 5gen17. */
export function EtapeQCMClassique({ exercice, phase, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const options = optionsQCM(exercice, phase);
  const [choixId, setChoixId] = useState<string | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const aide2 = texteAideNiveau2(exercice, phase);

  function valider() {
    if (choixId === null) return;
    onValider(choixId);
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale(exercice)}</p>
      <div className="equation-box equation-box-donnees">
        {formatTermesDonneesLatex(exercice, phase).map((frag, i) => (
          <Katex key={i} expression={frag} />
        ))}
      </div>
      <EtatActuelSuiteClassique exercice={exercice} phase={phase} />
      <p className="prompt-text">{consignePhase(exercice, phase)}</p>
      <div className="options-liste-longue">
        {options.map((o) => (
          <button key={o.id} type="button" className={`btn ${choixId === o.id ? "toggle-active" : ""}`} onClick={() => setChoixId(o.id)}>
            <Katex expression={o.label} />
          </button>
        ))}
      </div>
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={choixId === null} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
        </p>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <Katex expression={texteAideNiveau1(exercice, phase)} block />
          {niveauAide >= 2 && aide2.length > 0 && <Katex expression={aide2} block />}
        </div>
      )}
    </div>
  );
}
