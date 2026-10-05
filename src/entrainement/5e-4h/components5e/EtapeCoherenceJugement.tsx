import { useState } from "react";
import type { ExerciceSuiteArithmetique } from "../core5e/suitesArithmetiques.types";
import { consigneGenerale, consignePhase, formatTermesDonneesLatex, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatSuiteArithmetique";
import { Katex } from "../components/Katex";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelSuiteArithmetique } from "./EtatActuelSuiteArithmetique";

interface Props {
  exercice: ExerciceSuiteArithmetique;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (choix: boolean) => void;
}

/** Écran "coherenceJugement" (famille "coherence" uniquement) — jugement binaire, 2 boutons de
 * sélection (`.options-grid` + `.btn.toggle-active`, même convention que le reste de la
 * plateforme) suivis d'un bouton "Valider" persistant — jamais d'auto-soumission au clic. */
export function EtapeCoherenceJugement({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const [choix, setChoix] = useState<boolean | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const aide2 = texteAideNiveau2(exercice, "coherenceJugement");

  return (
    <div>
      <p className="prompt-text">{consigneGenerale(exercice)}</p>
      <div className="equation-box equation-box-donnees">
        {formatTermesDonneesLatex(exercice).map((frag, i) => (
          <Katex key={i} expression={frag} />
        ))}
      </div>
      <EtatActuelSuiteArithmetique exercice={exercice} phase="coherenceJugement" />
      <p className="prompt-text">{consignePhase(exercice, "coherenceJugement")}</p>
      <div className="options-grid">
        <button type="button" className={choix === true ? "btn toggle-active" : "btn"} onClick={() => setChoix(true)}>
          Cohérentes
        </button>
        <button type="button" className={choix === false ? "btn toggle-active" : "btn"} onClick={() => setChoix(false)}>
          Incohérentes
        </button>
      </div>
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={choix === null} onClick={() => choix !== null && onValider(choix)}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
        </p>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{texteAideNiveau1(exercice, "coherenceJugement")}</p>
          {niveauAide >= 2 && aide2.length > 0 && <Katex expression={aide2} block />}
        </div>
      )}
    </div>
  );
}
