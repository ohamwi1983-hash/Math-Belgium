import { useState } from "react";
import type { ExerciceSectionPlaneSolide } from "../core/sectionPlaneSolide.types";
import { NIVEAU_AIDE_MAX_SEGMENT } from "../moteur/sessionSectionPlaneSolide";
import {
  CONSIGNE_SEGMENT_DIRECT,
  TEXTE_AIDE_SEGMENT_NIVEAU1,
  apercuSegmentFace,
  candidatsSegmentDirect,
  libelleBoutonAide,
  libelleFace,
  pointsExtraConnus,
  segmentsExtraTraces,
  texteAideSegmentNiveau2,
  texteProgressionPoints,
  texteProgressionSegments,
} from "../ui/formatSectionPlaneSolide";
import { formatMessageErreur } from "../ui/messageErreur";
import { Solide3DSketch } from "./Solide3DSketch";

interface Props {
  exercice: ExerciceSectionPlaneSolide;
  connus: number[];
  segmentsTraces: string[];
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (face: number) => void;
}

/**
 * Écran type A — "Tracer un segment direct" (spec). La liste de candidats inclut délibérément les
 * faces à 0 ou 1 seul point connu, comme distracteurs — c'est précisément le piège central de la
 * spec (tenter de tracer un segment dans une face pas encore assez connue).
 */
export function EtapeSegmentDirect({ exercice, connus, segmentsTraces, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [faceChoisie, setFaceChoisie] = useState<number | null>(null);
  const max = NIVEAU_AIDE_MAX_SEGMENT;
  const erronee = tentativesUtilisees > 0;

  const connusSet = new Set(connus);
  const segmentsTracesSet = new Set(segmentsTraces);
  const candidats = candidatsSegmentDirect(exercice, connusSet, segmentsTracesSet);
  const apercu = apercuSegmentFace(exercice, connus, faceChoisie);

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_SEGMENT_DIRECT}</p>
      <p className="prompt-text">
        {texteProgressionPoints(exercice, connus)} — {texteProgressionSegments(exercice, segmentsTraces)}
      </p>

      <Solide3DSketch
        solide={exercice.solide}
        pointsExtra={pointsExtraConnus(exercice, connus)}
        segmentsExtra={apercu ? [...segmentsExtraTraces(exercice, segmentsTraces), apercu] : segmentsExtraTraces(exercice, segmentsTraces)}
      />

      <div className="options-grid-compact">
        {candidats.map((candidat) => (
          <button
            key={candidat.face}
            type="button"
            className={`btn${faceChoisie === candidat.face ? " toggle-active" : ""}${erronee && faceChoisie === candidat.face ? " is-erronee" : ""}`}
            onClick={() => setFaceChoisie(candidat.face)}
          >
            {libelleFace(exercice, candidat.face)}
          </button>
        ))}
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{TEXTE_AIDE_SEGMENT_NIVEAU1}</p>
          {niveauAide >= 2 && <p>{texteAideSegmentNiveau2(exercice, candidats)}</p>}
        </div>
      )}
      <button type="button" className="btn btn-aide" disabled={niveauAide >= max} onClick={onActiverAide}>
        {libelleBoutonAide(niveauAide, max)}
      </button>

      <button type="button" className="btn btn-primary" disabled={faceChoisie === null} onClick={() => faceChoisie !== null && onValider(faceChoisie)}>
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
