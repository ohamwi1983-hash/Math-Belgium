import { useState } from "react";
import type { ExerciceComparaisonSeries, QuestionDispersion } from "../core/comparaisonSeries.types";
import type { ArgumentDispersionOption, ReponseDispersion } from "../moteur/verificationComparaisonSeries";
import { verifierDispersion } from "../moteur/verificationComparaisonSeries";
import { niveauAideMax } from "../moteur/sessionComparaisonSeries";
import {
  OPTIONS_ARGUMENT_DISPERSION,
  libelleBoutonAide,
  segmentsAideDispersionNiveau1,
  segmentsAideDispersionNiveau2,
  segmentsConsigneDispersion,
} from "../ui/formatComparaisonSeries";
import { formatMessageErreur } from "../ui/messageErreur";
import { DonneesComparaisonSeries } from "./DonneesComparaisonSeries";
import { EnonceComparaisonSeries } from "./EnonceComparaisonSeries";
import { SegmentsInline } from "./SegmentsInline";

interface Props {
  exercice: ExerciceComparaisonSeries;
  question: QuestionDispersion;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseDispersion) => void;
}

function basculer(liste: ArgumentDispersionOption[], id: ArgumentDispersionOption): ArgumentDispersionOption[] {
  return liste.includes(id) ? liste.filter((argument) => argument !== id) : [...liste, id];
}

/**
 * Question "dispersion" — champ catégoriel A/B (série homogène) + sélection MULTIPLE (toggle
 * buttons, jamais des cases à cocher natives — aucun précédent dans le projet, on reste sur le
 * vocabulaire d'interface déjà établi ailleurs, `.options-grid-compact`/`toggle-active`) parmi 3
 * arguments — dont "Étendue", un DISTRACTEUR délibéré (le piège central de cette question, jamais
 * une réponse valide — voir `verifierDispersion`). Exactement `question.nombreArguments` doivent
 * être sélectionnés pour valider, ni plus ni moins.
 */
export function EtapeDispersionComparaison({ exercice, question, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [choix, setChoix] = useState<"A" | "B" | null>(null);
  const [argumentsChoisis, setArgumentsChoisis] = useState<ArgumentDispersionOption[]>([]);
  const maxAide = niveauAideMax();

  const complet = choix !== null && argumentsChoisis.length === question.nombreArguments;
  const apresEchec = tentativesUtilisees > 0;
  const erronee =
    apresEchec && complet && choix !== null && !verifierDispersion(question, { serie: choix, arguments: argumentsChoisis });

  return (
    <div>
      <EnonceComparaisonSeries exercice={exercice} />
      <DonneesComparaisonSeries exercice={exercice} />

      <p className="prompt-text">
        <SegmentsInline segments={segmentsConsigneDispersion(question)} />
      </p>

      <div className="options-grid-compact">
        <button
          type="button"
          className={`btn${choix === "A" ? " toggle-active" : ""}${erronee && choix === "A" ? " is-erronee" : ""}`}
          onClick={() => setChoix("A")}
        >
          Série A
        </button>
        <button
          type="button"
          className={`btn${choix === "B" ? " toggle-active" : ""}${erronee && choix === "B" ? " is-erronee" : ""}`}
          onClick={() => setChoix("B")}
        >
          Série B
        </button>
      </div>

      <p className="field-label">Argument(s) statistique(s) :</p>
      <div className="options-grid-compact">
        {OPTIONS_ARGUMENT_DISPERSION.map((option) => {
          const actif = argumentsChoisis.includes(option.id);
          return (
            <button
              key={option.id}
              type="button"
              className={`btn${actif ? " toggle-active" : ""}${erronee && actif ? " is-erronee" : ""}`}
              onClick={() => setArgumentsChoisis((liste) => basculer(liste, option.id))}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {niveauAide >= 1 && (
        <div className="triangle-quelconque-aide">
          <p>
            <SegmentsInline segments={segmentsAideDispersionNiveau1()} />
          </p>
          {niveauAide >= 2 && (
            <p>
              <SegmentsInline segments={segmentsAideDispersionNiveau2(exercice)} />
            </p>
          )}
        </div>
      )}
      <button type="button" className="btn btn-aide" disabled={niveauAide >= maxAide} onClick={onActiverAide}>
        {libelleBoutonAide(niveauAide, maxAide)}
      </button>

      <button
        type="button"
        className="btn btn-primary"
        disabled={!complet}
        onClick={() => choix !== null && onValider({ serie: choix, arguments: argumentsChoisis })}
      >
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax)}
        </p>
      )}
    </div>
  );
}
