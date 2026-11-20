import { useState } from "react";
import type { ExerciceOptimisationModelisation } from "../core/optimisation.types";
import { diagnostiquerSysteme } from "../moteur/verificationOptimisation";
import { consigneSysteme, formatSystemeAccoladeLatex, segmentsPhraseEnonce } from "../ui/formatOptimisation";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { AidesNiveaux, MessageRetour, useTentativeLisible } from "./RetourSaisie";
import { aidesSysteme, MESSAGE_EXPRESSION_OPTIMISATION_ILLISIBLE } from "../ui/aidesOptimisation";
import { ApercuExpressionLatex } from "./ApercuExpressionLatex";
import { EnTeteExercice } from "./EnTeteExercice";
import { Katex } from "./Katex";
import { QuestionFinale } from "./QuestionFinale";
import { SegmentsInline } from "./SegmentsInline";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";

interface Props {
  exercice: ExerciceOptimisationModelisation;
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
export function EtapeSystemeOptimisation({ exercice, tentativesUtilisees, tentativesMax, onActiverAide, onValider, validation}: Props) {
  const [texte, setTexte] = useState("");
  const saisie = useTentativeLisible<string>();
  const lisible = diagnostiquerSysteme(exercice, texte) !== "parse_error";
  const complet = texte.trim() !== "";
  const statut = complet ? diagnostiquerSysteme(exercice, texte) : undefined;

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={<SegmentsInline segments={segmentsPhraseEnonce(exercice.contexte.phraseEnonce)} />}
        blocDonnees={<QuestionFinale question={exercice.contexte.questionFinale} />}
      />
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
          placeholder="ex : -3x^2+17x+5"
          value={texte}
          onChange={(e) => setTexte(normaliserSigneMoins(e.target.value))}
        />
      </div>

      {!validation && (
        <>
        <AidesNiveaux aides={aidesSysteme(exercice)} onPremiereAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => saisie.tenter(texte, lisible, onValider)}>
          Valider
        </button>
        <MessageRetour illisible={saisie.illisible} tentativesUtilisees={tentativesUtilisees} tentativesMax={tentativesMax} texteIllisible={MESSAGE_EXPRESSION_OPTIMISATION_ILLISIBLE} cible={null} />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
