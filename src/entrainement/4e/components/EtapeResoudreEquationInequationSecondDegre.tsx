import { useState } from "react";
import type { ExerciceEquationInequationSecondDegre } from "../core/equationInequationSecondDegre.types";
import { diagnostiquerResoudre } from "../moteur/verificationEquationInequationSecondDegre";
import { NIVEAU_AIDE_MAX_RESOUDRE } from "../moteur/sessionEquationInequationSecondDegre";
import { consigneResoudre, formatDonneesAvecEquationLatex, texteAideResoudreNiveau1, texteAideResoudreNiveau2 } from "../ui/formatEquationInequationSecondDegre";
import { formatMessageErreur } from "../ui/messageErreur";
import { EnonceOptimisation } from "./EnonceOptimisation";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { Katex } from "./Katex";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceEquationInequationSecondDegre;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (valeurs: string[]) => void;
}

/** Écran 5 — résoudre algébriquement (2 valeurs, ordre indifférent : les 2 racines pour `equation`,
 * les 2 bornes de l'intervalle BRUT pour `inequation`). */
export function EtapeResoudreEquationInequationSecondDegre({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [valeurs, setValeurs] = useState<[string, string]>(["", ""]);
  const complet = valeurs.every((v) => v.trim() !== "");
  const statut = complet ? diagnostiquerResoudre(exercice, valeurs) : undefined;

  function modifier(index: 0 | 1, valeur: string) {
    setValeurs(index === 0 ? [valeur, valeurs[1]] : [valeurs[0], valeur]);
  }

  return (
    <div>
      <EnonceOptimisation exercice={exercice.base} />
      <EtatActuelPanel latex={formatDonneesAvecEquationLatex(exercice)} />
      <p className="prompt-text">{consigneResoudre()}</p>

      <div className="field-row">
        {valeurs.map((valeur, index) => (
          <div className="field" key={index}>
            <label className="field-label field-label-minuscule" htmlFor={`equation-inequation-resoudre-${index}`}>
              <Katex expression={`${exercice.base.contexte.labelVariable}_{${index + 1}} =`} />
            </label>
            <input
              id={`equation-inequation-resoudre-${index}`}
              className={`text-input${tentativesUtilisees > 0 && statut && statut !== "correct" ? " is-erronee" : ""}`}
              value={valeur}
              onChange={(e) => modifier(index as 0 | 1, e.target.value)}
            />
          </div>
        ))}
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{texteAideResoudreNiveau1()}</p>
          {niveauAide >= 2 && (
            <p>
              À résoudre : <Katex expression={texteAideResoudreNiveau2(exercice)} />
            </p>
          )}
        </div>
      )}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_RESOUDRE} onActiverAide={onActiverAide} />

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(valeurs)}>
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, statut)}
        </p>
      )}
    </div>
  );
}
