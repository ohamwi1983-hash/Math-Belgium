import { useState } from "react";
import type { ExerciceEquationInequationSecondDegre } from "../core/equationInequationSecondDegre.types";
import type { ReponseSysteme } from "../moteur/verificationEquationInequationSecondDegre";
import { diagnostiquerRelation1, diagnostiquerRelation2 } from "../moteur/verificationEquationInequationSecondDegre";
import { NIVEAU_AIDE_MAX_POSER_SYSTEME } from "../moteur/sessionEquationInequationSecondDegre";
import { consignePoserSysteme, texteAidePoserSystemeNiveau1, texteAidePoserSystemeNiveau2 } from "../ui/formatEquationInequationSecondDegre";
import { segmentsPhraseEnonce } from "../ui/formatOptimisation";
import { formatMessageErreur } from "../ui/messageErreur";
import { CroquisEquationInequationSecondDegre } from "./CroquisEquationInequationSecondDegre";
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
  onValider: (reponse: ReponseSysteme) => void;
  /** Présent une fois l'écran terminé — gèle les champs, remplace "Valider" par le bloc
   * `ValidationEcran` (convention CLAUDE.md, "validation/invalidation avant de passer à l'écran
   * suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran 1 (architecture D uniquement, voir `core/equationInequationSecondDegre.types.ts`, en-tête)
 * — poser les 2 relations entre x et y décrites dans l'énoncé, chacune vérifiée indépendamment
 * (`diagnostiquerRelation1`/`2`, qui acceptent n'importe quelle mise à l'échelle non nulle). */
export function EtapePoserSystemeEquationInequationSecondDegre({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation }: Props) {
  const [relation1, setRelation1] = useState("");
  const [relation2, setRelation2] = useState("");
  const complet = relation1.trim() !== "" && relation2.trim() !== "";
  const statut1 = complet ? diagnostiquerRelation1(exercice, relation1) : undefined;
  const statut2 = complet ? diagnostiquerRelation2(exercice, relation2) : undefined;
  const systeme = exercice.systeme;

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={<SegmentsInline segments={segmentsPhraseEnonce(exercice.base.contexte.phraseEnonce)} />}
        blocDonnees={<QuestionFinale question={exercice.base.contexte.questionFinale} />}
      />
      {exercice.base.contexte.croquis && <CroquisEquationInequationSecondDegre croquis={exercice.base.contexte.croquis} />}
      <p className="prompt-text">{consignePoserSysteme()}</p>

      <div className="field">
        <label className="field-label" htmlFor="equation-inequation-systeme-relation1">
          {systeme?.label1 ?? "Relation 1"}
        </label>
        <input
          id="equation-inequation-systeme-relation1"
          className={`text-input${tentativesUtilisees > 0 && statut1 && statut1 !== "correct" ? " is-erronee" : ""}`}
          placeholder="ex : x+y=20"
          value={relation1}
          onChange={(e) => setRelation1(e.target.value)}
        />
      </div>
      <div className="field">
        <label className="field-label" htmlFor="equation-inequation-systeme-relation2">
          {systeme?.label2 ?? "Relation 2"}
        </label>
        <input
          id="equation-inequation-systeme-relation2"
          className={`text-input${tentativesUtilisees > 0 && statut2 && statut2 !== "correct" ? " is-erronee" : ""}`}
          placeholder="ex : x*y=91"
          value={relation2}
          onChange={(e) => setRelation2(e.target.value)}
        />
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{texteAidePoserSystemeNiveau1(exercice)}</p>
          {niveauAide >= 2 && (
            <p>
              Relations à traduire : <Katex expression={texteAidePoserSystemeNiveau2(exercice)} />
            </p>
          )}
        </div>
      )}
      {!validation && (
        <>
          <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_POSER_SYSTEME} onActiverAide={onActiverAide} />

          <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider({ relation1, relation2 })}>
            Valider
          </button>
          {tentativesUtilisees > 0 && (
            <p className="alert-error" role="alert">
              {formatMessageErreur(tentativesUtilisees, tentativesMax, statut1 !== "correct" ? statut1 : statut2)}
            </p>
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
