import { useState } from "react";
import type { ExerciceEquationInequationSecondDegre } from "../core/equationInequationSecondDegre.types";
import { diagnostiquerSystemeHypothetique, diagnostiquerSystemeReel } from "../moteur/verificationEquationInequationSecondDegre";
import { NIVEAU_AIDE_MAX_POSER_SYSTEME } from "../moteur/sessionEquationInequationSecondDegre";
import { consignePoserSysteme, texteAidePoserSystemeNiveau1, texteAidePoserSystemeNiveau2 } from "../ui/formatEquationInequationSecondDegre";
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
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: { reel: string; hypothetique: string }) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran 0a (`voieSysteme` uniquement) — poser les 2 équations du système (situation réelle
 * `x·y=M`, situation hypothétique `(x+a)(y-b)=M`). */
export function EtapePoserSystemeEquationInequationSecondDegre({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation}: Props) {
  const [reel, setReel] = useState("");
  const [hypothetique, setHypothetique] = useState("");
  const complet = reel.trim() !== "" && hypothetique.trim() !== "";
  const statutReel = reel.trim() !== "" ? diagnostiquerSystemeReel(exercice, reel) : undefined;
  const statutHypothetique = hypothetique.trim() !== "" ? diagnostiquerSystemeHypothetique(exercice, hypothetique) : undefined;

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={<SegmentsInline segments={segmentsPhraseEnonce(exercice.base.contexte.phraseEnonce)} />}
        blocDonnees={<QuestionFinale question={exercice.base.contexte.questionFinale} />}
      />
      <p className="prompt-text">{consignePoserSysteme()}</p>
      <div className="field">
        <label className="field-label" htmlFor="equation-inequation-systeme-reel">
          Situation réelle
        </label>
        <input
          id="equation-inequation-systeme-reel"
          className={`text-input${tentativesUtilisees > 0 && statutReel && statutReel !== "correct" ? " is-erronee" : ""}`}
          placeholder="ex : x*y=360"
          value={reel}
          onChange={(e) => setReel(e.target.value)}
        />
      </div>
      <div className="field">
        <label className="field-label" htmlFor="equation-inequation-systeme-hypothetique">
          Situation hypothétique
        </label>
        <input
          id="equation-inequation-systeme-hypothetique"
          className={`text-input${tentativesUtilisees > 0 && statutHypothetique && statutHypothetique !== "correct" ? " is-erronee" : ""}`}
          placeholder="ex : (x+3)*(y-4)=360"
          value={hypothetique}
          onChange={(e) => setHypothetique(e.target.value)}
        />
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{texteAidePoserSystemeNiveau1()}</p>
          {niveauAide >= 2 && (
            <p>
              Système attendu : <Katex expression={texteAidePoserSystemeNiveau2(exercice)} />
            </p>
          )}
        </div>
      )}
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_POSER_SYSTEME} onActiverAide={onActiverAide} />

        <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider({ reel, hypothetique })}>
          Valider
        </button>
        {tentativesUtilisees > 0 && (
          <p className="alert-error" role="alert">
            {formatMessageErreur(tentativesUtilisees, tentativesMax, statutReel === "parse_error" || statutHypothetique === "parse_error" ? "parse_error" : undefined)}
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
