import { useState } from "react";
import type { ExerciceOptimisation } from "../core/optimisation.types";
import { diagnostiquerDecision } from "../moteur/verificationOptimisation";
import type { ReponseDecision } from "../moteur/verificationOptimisation";
import { NIVEAU_AIDE_MAX_DECISION } from "../moteur/sessionOptimisation";
import { consigneDecision, contexteLabelX, contexteLabelY, formatDonneesAvecSommetLatex, segmentsPhraseEnonce, texteAideDecisionNiveau1, texteAideDecisionNiveau2, texteAideDecisionNiveau3 } from "../ui/formatOptimisation";
import { formatMessageErreur } from "../ui/messageErreur";
import { EnonceOptimisation } from "./EnonceOptimisation";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { SegmentsInline } from "./SegmentsInline";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceOptimisation;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseDecision) => void;
}

/**
 * Écran commun aux 2 variantes — le sommet appartient-il au domaine de validité ? Puis la valeur
 * optimale réellement recherchée (le sommet si oui, sinon la borne du domaine la plus proche —
 * `exercice.optimal`, déjà calculé à la génération quel que soit le choix de l'élève).
 *
 * Mêmes conventions de labels/rendu qu'`EtapeSommetOptimisation.tsx` (`prompt-restructuration-
 * architecture-modelisation.md`, points 1-2) : `x_{opt}`/`valeur_{optimale}` REMPLACÉS par le nom
 * concret, aide rendue via `<SegmentsInline>` pour toute notation à underscore.
 */
export function EtapeDecisionOptimisation({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [dansDomaine, setDansDomaine] = useState<boolean | null>(null);
  const [x, setX] = useState("");
  const [y, setY] = useState("");
  const complet = dansDomaine !== null && x.trim() !== "" && y.trim() !== "";
  const reponse: ReponseDecision = { dansDomaine, x, y };
  const statut = complet ? diagnostiquerDecision(exercice, reponse) : undefined;
  const apresEchec = tentativesUtilisees > 0;
  const statutGlobal = statut
    ? statut.x === "parse_error" || statut.y === "parse_error"
      ? "parse_error"
      : statut.dansDomaine && statut.x === "correct" && statut.y === "correct"
        ? "correct"
        : "not_equivalent"
    : undefined;
  const dansDomaineErronee = apresEchec && statut !== undefined && !statut.dansDomaine;

  const labelX = contexteLabelX(exercice) || "x_{opt}";
  const labelY = contexteLabelY(exercice) || "valeur_{optimale}";

  return (
    <div>
      <EnonceOptimisation exercice={exercice} />
      <EtatActuelPanel latex={formatDonneesAvecSommetLatex(exercice)} label="Données" />
      <p className="prompt-text">{consigneDecision(exercice)}</p>

      <div className="options-grid-compact">
        <button
          type="button"
          className={`btn${dansDomaine === true ? " toggle-active" : ""}${dansDomaineErronee && dansDomaine === true ? " is-erronee" : ""}`}
          onClick={() => setDansDomaine(true)}
        >
          Oui, le sommet est dans le domaine
        </button>
        <button
          type="button"
          className={`btn${dansDomaine === false ? " toggle-active" : ""}${dansDomaineErronee && dansDomaine === false ? " is-erronee" : ""}`}
          onClick={() => setDansDomaine(false)}
        >
          Non, le sommet est hors du domaine
        </button>
      </div>

      <div className="field">
        <label className="field-label" htmlFor="optimisation-decision-x">
          {labelX} =
        </label>
        <input
          id="optimisation-decision-x"
          className={`text-input${apresEchec && statut && statut.x !== "correct" ? " is-erronee" : ""}`}
          value={x}
          onChange={(e) => setX(e.target.value)}
        />
      </div>
      <div className="field">
        <label className="field-label" htmlFor="optimisation-decision-y">
          {labelY} =
        </label>
        <input
          id="optimisation-decision-y"
          className={`text-input${apresEchec && statut && statut.y !== "correct" ? " is-erronee" : ""}`}
          value={y}
          onChange={(e) => setY(e.target.value)}
        />
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>
            <SegmentsInline segments={segmentsPhraseEnonce(texteAideDecisionNiveau1(exercice))} />
          </p>
          {niveauAide >= 2 && (
            <p>
              <SegmentsInline segments={segmentsPhraseEnonce(texteAideDecisionNiveau2(exercice))} />
            </p>
          )}
          {niveauAide >= 3 && (
            <p>
              <SegmentsInline segments={segmentsPhraseEnonce(texteAideDecisionNiveau3(exercice))} />
            </p>
          )}
        </div>
      )}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_DECISION} onActiverAide={onActiverAide} />

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(reponse)}>
        Valider
      </button>
      {apresEchec && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, statutGlobal)}
        </p>
      )}
    </div>
  );
}
