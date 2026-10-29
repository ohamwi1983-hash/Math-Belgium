import { useState } from "react";
import type { ExercicePositionDroitePlan, ReponseJustificationPositionDroitePlan } from "../core/positionDroitePlan.types";
import { NIVEAU_AIDE_MAX_JUSTIFICATION } from "../moteur/sessionPositionDroitePlan";
import { nomsPointsFigure } from "../moteur/verificationPositionDroitePlan";
import { consigneJustification, libelleCandidatSecante, texteAideJustification } from "../ui/formatPositionDroitePlan";
import { formatMessageErreur } from "../ui/messageErreur";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExercicePositionDroitePlan;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseJustificationPositionDroitePlan) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

function memeSelection(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((x) => b.includes(x));
}

/**
 * Écran 2 — Justification structurée. L'interface s'adapte à `exercice.classification` (confirmée à
 * l'écran 1 et rappelée dans « Ce qu'on sait déjà ») : "incluse" → sélection de TOUS les points
 * nommés de la figure qui sont dans le plan (avant : les 2 points de la droite, c'est-à-dire
 * exactement son nom) ; "parallele"/"secante" → sélection unique parmi des candidats. Jamais de
 * texte libre. Seule la sélection soumise et refusée passe en rouge, jamais une sélection modifiée
 * depuis.
 */
export function EtapeJustificationPositionDroitePlan({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation }: Props) {
  const [pointsChoisis, setPointsChoisis] = useState<string[]>([]);
  const [indexCandidat, setIndexCandidat] = useState<number | null>(null);
  const [soumis, setSoumis] = useState<{ points: string[]; index: number | null } | null>(null);
  const max = NIVEAU_AIDE_MAX_JUSTIFICATION;
  const refuse = (tentativesUtilisees > 0 || validation?.revele === true) && soumis !== null;
  const gele = Boolean(validation);

  const tousLesPoints = nomsPointsFigure(exercice);

  function basculerPoint(nom: string) {
    if (gele) return;
    setPointsChoisis((liste) => (liste.includes(nom) ? liste.filter((n) => n !== nom) : [...liste, nom]));
  }

  const complet = exercice.classification === "incluse" ? pointsChoisis.length >= 1 : indexCandidat !== null;

  function valider() {
    if (exercice.classification === "incluse") {
      if (pointsChoisis.length === 0) return;
      setSoumis({ points: pointsChoisis, index: null });
      onValider({ type: "incluse", points: pointsChoisis });
    } else {
      if (indexCandidat === null) return;
      setSoumis({ points: [], index: indexCandidat });
      onValider({ type: exercice.classification, indexCandidat });
    }
  }

  const selectionIncluseRefusee = refuse && memeSelection(soumis!.points, pointsChoisis);
  const candidatRefuse = (index: number) => refuse && soumis!.index === index && indexCandidat === index;

  return (
    <div>
      <p className="prompt-text">{consigneJustification(exercice)}</p>

      {exercice.classification === "incluse" && (
        <div className="options-grid-compact">
          {tousLesPoints.map((nom) => {
            const actif = pointsChoisis.includes(nom);
            return (
              <button
                key={nom}
                type="button"
                className={`btn${actif ? " toggle-active" : ""}${selectionIncluseRefusee && actif ? " is-erronee" : ""}`}
                onClick={() => basculerPoint(nom)}
                aria-pressed={actif}
              >
                {nom}
              </button>
            );
          })}
        </div>
      )}

      {exercice.classification === "parallele" && (
        <div className="options-grid-compact">
          {exercice.candidatsParallele.map((candidat, index) => (
            <button
              key={`${candidat.sommets[0]}-${candidat.sommets[1]}`}
              type="button"
              className={`btn${indexCandidat === index ? " toggle-active" : ""}${candidatRefuse(index) ? " is-erronee" : ""}`}
              onClick={() => !gele && setIndexCandidat(index)}
            >
              {candidat.label}
            </button>
          ))}
        </div>
      )}

      {exercice.classification === "secante" && (
        <div className="options-grid-compact">
          {exercice.candidatsSecante.map((candidat, index) => (
            <button
              key={candidat.type === "arete" ? `${candidat.sommets[0]}-${candidat.sommets[1]}` : `${candidat.type}-${candidat.nom}`}
              type="button"
              className={`btn${indexCandidat === index ? " toggle-active" : ""}${candidatRefuse(index) ? " is-erronee" : ""}`}
              onClick={() => !gele && setIndexCandidat(index)}
            >
              {libelleCandidatSecante(candidat)}
            </button>
          ))}
        </div>
      )}

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{texteAideJustification(exercice.classification)}</p>
        </div>
      )}
      {!validation && (
        <>
          <BoutonAide niveauAide={niveauAide} niveauAideMax={max} onActiverAide={onActiverAide} />

          <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
            Valider
          </button>
          {tentativesUtilisees > 0 && (
            <p className="alert-error" role="alert">
              {formatMessageErreur(tentativesUtilisees, tentativesMax)}
            </p>
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
