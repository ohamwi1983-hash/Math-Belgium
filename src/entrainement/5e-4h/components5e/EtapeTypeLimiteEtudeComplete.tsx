import { useState } from "react";
import type { ExerciceEtudeCompletePipeline } from "../core5e/etudeComplete.types";
import { CONSIGNE_GENERALE_ETUDE_COMPLETE, consignePhase, formatLabelTypeLimiteLatex, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatEtudeComplete";
import { Katex } from "../components/Katex";
import { BlocDonneesEtudeComplete } from "./BlocDonneesEtudeComplete";
import { BoutonAide } from "./BoutonAide";
import { CalculatriceScientifique } from "./CalculatriceScientifique";
import { EtatActuelEtudeComplete } from "./EtatActuelEtudeComplete";

type Choix = "infini" | "pointVide";

interface Props {
  exercice: ExerciceEtudeCompletePipeline;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (choix: Choix[]) => void;
  diagnostiquer?: (choix: Choix[]) => boolean[];
}

/** Écran "typeLimite" (2e écran du pipeline) — UN combobox natif par exclusion, classification
 * ∞ (vraie asymptote verticale) vs 0/0 (point vide), label empilé `\lim_{x\to r} f(x)=` au-dessus de
 * chaque combobox. */
export function EtapeTypeLimiteEtudeComplete({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [choix, setChoix] = useState<(Choix | null)[]>(exercice.exclusions.map(() => null));
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = choix.every((c) => c !== null);
  const correction = montrerErreurs && diagnostiquer && complet ? diagnostiquer(choix as Choix[]) : null;

  function modifier(i: number, valeur: Choix) {
    setChoix((arr) => arr.map((v, j) => (j === i ? valeur : v)));
  }
  function valider() {
    if (!complet) return;
    onValider(choix as Choix[]);
  }

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE_ETUDE_COMPLETE}</p>
      <BlocDonneesEtudeComplete exercice={exercice} />
      <EtatActuelEtudeComplete exercice={exercice} phase="typeLimite" />
      <p className="prompt-text">{consignePhase(exercice, "typeLimite")}</p>
      {exercice.exclusions.map((excl, i) => {
        const erronee = correction !== null && correction[i] === false;
        return (
          <div key={i} className="field-row">
            <span className="field-label field-label-minuscule">
              <Katex expression={formatLabelTypeLimiteLatex(excl.position)} block />
            </span>
            <select
              className={erronee ? "ce-select is-erronee" : "ce-select"}
              aria-label={`Type de limite en x=${excl.position}`}
              value={choix[i] ?? ""}
              onChange={(e) => modifier(i, e.target.value as Choix)}
            >
              <option value="" disabled>
                Choisis…
              </option>
              <option value="infini">∞</option>
              <option value="pointVide">0/0</option>
            </select>
          </div>
        );
      })}
      <CalculatriceScientifique />
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
        </p>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{texteAideNiveau1(exercice, "typeLimite")}</p>
          {niveauAide >= 2 && <Katex expression={texteAideNiveau2(exercice, "typeLimite")} block />}
        </div>
      )}
    </div>
  );
}
