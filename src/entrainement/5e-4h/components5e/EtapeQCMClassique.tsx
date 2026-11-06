import { useState } from "react";
import type { ExerciceSuiteClassique } from "../core5e/suitesClassiques.types";
import type { PhaseSuiteClassique } from "../moteur5e/typesSuiteClassique";
import { consigneGenerale, consignePhase, formatTermesDonneesLatex, optionsQCM, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatSuiteClassique";
import { Katex } from "../components/Katex";
import { TexteMathsClassique } from "./TexteMathsClassique";
import { FigureSuiteClassique } from "./FigureSuiteClassique";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceSuiteClassique;
  phase: PhaseSuiteClassique;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (choixId: string) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran de choix multiple (QCM, une seule tentative — voir `PHASES_QCM_SUITE_CLASSIQUE`) —
 * réutilisé par 5 des 26 phases de 5gen17. */
export function EtapeQCMClassique({ exercice, phase, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation}: Props) {
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
      <EnTeteExercice
        consigneGenerale={consigneGenerale(exercice)}
        blocDonnees={
          <>
            <div className="equation-box equation-box-donnees">
              {formatTermesDonneesLatex(exercice, phase).map((frag, i) => (
                <Katex key={i} expression={frag} />
              ))}
            </div>
            <FigureSuiteClassique exercice={exercice} phase={phase} />
          </>
        }
      />
      <p className="prompt-text">{consignePhase(exercice, phase)}</p>
      {/* Une colonne : certains libellés sont des phrases (le texte passe à la ligne au lieu de
       * déborder à 390 px). */}
      <div className="options-grid" style={{ gridTemplateColumns: "1fr" }}>
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            className={`btn ${choixId === o.id ? "toggle-active" : ""}`}
            style={{ justifyContent: "flex-start", textAlign: "left" }}
            onClick={() => setChoixId(o.id)}
          >
            <span>
              <TexteMathsClassique texte={o.label} />
            </span>
          </button>
        ))}
      </div>
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>
            <TexteMathsClassique texte={texteAideNiveau1(exercice, phase)} />
          </p>
          {niveauAide >= 2 && aide2.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <Katex expression={aide2} block />
            </div>
          )}
        </div>
      )}
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={choixId === null} onClick={valider}>
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
    </div>
  );
}
