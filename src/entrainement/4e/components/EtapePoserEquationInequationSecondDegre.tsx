import { useState } from "react";
import type { ExerciceEquationInequationSecondDegre } from "../core/equationInequationSecondDegre.types";
import { diagnostiquerPoserEquationInequation } from "../moteur/verificationEquationInequationSecondDegre";
import { NIVEAU_AIDE_MAX_POSER_EQUATION_INEQUATION } from "../moteur/sessionEquationInequationSecondDegre";
import { consignePoserEquationInequation, formatDonneesConfirmeesLatex, texteAidePoserEquationInequationNiveau1, texteAidePoserEquationInequationNiveau2 } from "../ui/formatEquationInequationSecondDegre";
import { segmentsPhraseEnonce } from "../ui/formatOptimisation";
import { formatMessageErreur } from "../ui/messageErreur";
import { EnTeteExercice } from "./EnTeteExercice";
import { EtatActuelPanel } from "./EtatActuelPanel";
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
  onValider: (texte: string) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran 4 — traduire le seuil de l'énoncé (`exercice.k`, jamais mentionné dans la phrase narrative)
 * en équation/inéquation `f(x) [=/>/<] k`. */
export function EtapePoserEquationInequationSecondDegre({ exercice, estPremierEcran, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation}: Props) {
  const [texte, setTexte] = useState("");
  const complet = texte.trim() !== "";
  const statut = complet ? diagnostiquerPoserEquationInequation(exercice, texte) : undefined;
  const label = exercice.variante === "equation" ? "Équation" : "Inéquation";

  return (
    <div>
      <EnTeteExercice
        estPremierEcran={estPremierEcran}
        consigneGenerale={<SegmentsInline segments={segmentsPhraseEnonce(exercice.base.contexte.phraseEnonce)} />}
        blocDonnees={<QuestionFinale question={exercice.base.contexte.questionFinale} />}
      />
      <EtatActuelPanel latex={formatDonneesConfirmeesLatex(exercice)} />
      <p className="prompt-text">{consignePoserEquationInequation(exercice)}</p>
      <div className="field">
        <label className="field-label" htmlFor="equation-inequation-poser">
          {label}
        </label>
        <input
          id="equation-inequation-poser"
          className={`text-input${tentativesUtilisees > 0 && statut && statut !== "correct" ? " is-erronee" : ""}`}
          placeholder={exercice.variante === "equation" ? "ex : -x^2+20x=91" : "ex : -x^2+20x>91"}
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
        />
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{texteAidePoserEquationInequationNiveau1()}</p>
          {niveauAide >= 2 && (
            <p>
              Relation à traduire : <Katex expression={texteAidePoserEquationInequationNiveau2(exercice)} />
            </p>
          )}
        </div>
      )}
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_POSER_EQUATION_INEQUATION} onActiverAide={onActiverAide} />

        <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(texte)}>
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
