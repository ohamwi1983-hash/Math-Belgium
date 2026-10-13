import { useState } from "react";
import type { ExerciceEquationInequationSecondDegre } from "../core/equationInequationSecondDegre.types";
import { diagnostiquerResoudre } from "../moteur/verificationEquationInequationSecondDegre";
import { NIVEAU_AIDE_MAX_RESOUDRE } from "../moteur/sessionEquationInequationSecondDegre";
import { consigneResoudre, texteAideResoudreNiveau1, texteAideResoudreNiveau2 } from "../ui/formatEquationInequationSecondDegre";
import { segmentsPhraseEnonce } from "../ui/formatOptimisation";
import { formatMessageErreur } from "../ui/messageErreur";
import { EnTeteExercice } from "./EnTeteExercice";
import { Katex } from "./Katex";
import { QuestionFinale } from "./QuestionFinale";
import { SegmentsInline } from "./SegmentsInline";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceEquationInequationSecondDegre;
  estPremierEcran: boolean;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (valeurs: string[]) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran 5 — résoudre algébriquement (2 valeurs, ordre indifférent : les 2 racines pour `equation`,
 * les 2 bornes de l'intervalle BRUT pour `inequation`). */
export function EtapeResoudreEquationInequationSecondDegre({ exercice, estPremierEcran, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation}: Props) {
  const [valeurs, setValeurs] = useState<[string, string]>(["", ""]);
  const complet = valeurs.every((v) => v.trim() !== "");
  const statut = complet ? diagnostiquerResoudre(exercice, valeurs) : undefined;

  function modifier(index: 0 | 1, valeur: string) {
    setValeurs(index === 0 ? [valeur, valeurs[1]] : [valeurs[0], valeur]);
  }

  return (
    <div>
      <EnTeteExercice
        estPremierEcran={estPremierEcran}
        consigneGenerale={<SegmentsInline segments={segmentsPhraseEnonce(exercice.base.contexte.phraseEnonce)} />}
        blocDonnees={<QuestionFinale question={exercice.base.contexte.questionFinale} />}
      />
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
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_RESOUDRE} onActiverAide={onActiverAide} />

        <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(valeurs)}>
          Valider
        </button>
        {tentativesUtilisees > 0 && (
          <p className="alert-error" role="alert">
            {formatMessageErreur(tentativesUtilisees, tentativesMax, statut)}
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
