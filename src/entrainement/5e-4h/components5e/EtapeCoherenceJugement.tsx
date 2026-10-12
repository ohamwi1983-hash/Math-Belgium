import { useState } from "react";
import type { ExerciceSuiteArithmetique } from "../core5e/suitesArithmetiques.types";
import { consigneGenerale, consignePhase, formatTermesDonneesLatex, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatSuiteArithmetique";
import { Katex } from "../components/Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceSuiteArithmetique;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (choix: boolean) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran "coherenceJugement" (famille "coherence" uniquement) — jugement binaire, 2 boutons de
 * sélection (`.options-grid` + `.btn.toggle-active`, même convention que le reste de la
 * plateforme) suivis d'un bouton "Valider" persistant — jamais d'auto-soumission au clic. */
export function EtapeCoherenceJugement({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation}: Props) {
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
      <p className="prompt-text">{consignePhase(exercice, "coherenceJugement")}</p>
      <div className="options-grid">
        <button type="button" className={choix === true ? "btn toggle-active" : "btn"} onClick={() => setChoix(true)}>
          Cohérentes
        </button>
        <button type="button" className={choix === false ? "btn toggle-active" : "btn"} onClick={() => setChoix(false)}>
          Incohérentes
        </button>
      </div>
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={choix === null} onClick={() => choix !== null && onValider(choix)}>
          Valider
        </button>
        {montrerErreurs && (
          <p className="alert-error" role="alert">
            Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{texteAideNiveau1(exercice, "coherenceJugement")}</p>
          {niveauAide >= 2 && aide2.length > 0 && <Katex expression={aide2} block />}
        </div>
      )}
    </div>
  );
}
