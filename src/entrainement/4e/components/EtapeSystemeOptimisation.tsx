import { useState } from "react";
import type { ExerciceOptimisationModelisation } from "../core/optimisation.types";
import { diagnostiquerSysteme } from "../moteur/verificationOptimisation";
import { NIVEAU_AIDE_MAX_SYSTEME } from "../moteur/sessionOptimisation";
import { consigneSysteme, formatSystemeAccoladeLatex, segmentsPhraseEnonce, texteAideSystemeNiveau1, texteAideSystemeNiveau2, texteAideSystemeNiveau3 } from "../ui/formatOptimisation";
import { formatMessageErreur } from "../ui/messageErreur";
import { ApercuExpressionLatex } from "./ApercuExpressionLatex";
import { EnonceOptimisation } from "./EnonceOptimisation";
import { Katex } from "./Katex";
import { SegmentsInline } from "./SegmentsInline";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceOptimisationModelisation;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
}

/**
 * Écran 3 (`prompt-restructuration-architecture-modelisation.md`) — RÉSOUT le système posé à l'écran
 * précédent (isoler, substituer, développer, en une seule réponse : la grandeur développée en
 * fonction de x — perte assumée : les pièges "isoler" et "développer" ne sont plus diagnostiqués
 * séparément, voir `core/optimisation.types.ts`). Les 2 équations rappelées avec une accolade
 * (`formatSystemeAccoladeLatex`) sont TOUJOURS celles validées à l'écran précédent (dérivées de
 * l'exercice), jamais la saisie de l'élève — convention "état actuel" déjà en place. Même cible de
 * vérification que l'ancien écran "construction" (`diagnostiquerSysteme`, alias direct — voir
 * `verificationOptimisation.ts`).
 */
export function EtapeSystemeOptimisation({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [texte, setTexte] = useState("");
  const complet = texte.trim() !== "";
  const statut = complet ? diagnostiquerSysteme(exercice, texte) : undefined;

  return (
    <div>
      <EnonceOptimisation exercice={exercice} />
      <div className="equation-box">
        <Katex expression={formatSystemeAccoladeLatex(exercice)} block />
      </div>
      <p className="prompt-text">{consigneSysteme(exercice)}</p>
      <ApercuExpressionLatex texte={texte} label={`${exercice.contexte.nomGrandeur} =`} />
      <div className="field">
        <label className="field-label" htmlFor="optimisation-systeme">
          {exercice.contexte.nomGrandeur} =
        </label>
        <input
          id="optimisation-systeme"
          className={`text-input${tentativesUtilisees > 0 && statut && statut !== "correct" ? " is-erronee" : ""}`}
          placeholder="ex : -x^2+20x"
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
        />
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{texteAideSystemeNiveau1()}</p>
          {niveauAide >= 2 && (
            <p>
              <SegmentsInline segments={segmentsPhraseEnonce(texteAideSystemeNiveau2(exercice))} />
            </p>
          )}
          {niveauAide >= 3 && <p>{texteAideSystemeNiveau3(exercice)}</p>}
        </div>
      )}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_SYSTEME} onActiverAide={onActiverAide} />

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(texte)}>
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
