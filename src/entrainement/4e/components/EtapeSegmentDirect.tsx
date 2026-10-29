import { useState } from "react";
import type { ExerciceSectionPlaneSolide } from "../core/sectionPlaneSolide.types";
import { NIVEAU_AIDE_MAX_SEGMENT } from "../moteur/sessionSectionPlaneSolide";
import { CONSIGNE_SEGMENT_DIRECT, TEXTE_AIDE_SEGMENT_NIVEAU1, apercuSegmentFace, candidatsFaces, libelleFace, pointsExtraConnus, segmentsExtraTraces, texteAideSegmentNiveau2, texteProgression } from "../ui/formatSectionPlaneSolide";
import { formatMessageErreur } from "../ui/messageErreur";
import { Solide3DSketch } from "./Solide3DSketch";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceSectionPlaneSolide;
  connus: number[];
  segmentsTraces: string[];
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (face: number) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran type A — "Tracer un segment direct" (spec). TOUTES les faces du solide sont proposées (sauf
 * celles déjà tracées) : les faces à 0 ou 1 seul point connu, ou que le plan ne traverse pas, sont
 * des distracteurs — c'est précisément le piège central de la spec (tenter de tracer un segment
 * dans une face pas encore assez connue). L'état local (face choisie) est remis à zéro à chaque
 * écran par la `key` posée dans `AppSectionPlaneSolide.tsx` (audit chapitre 8, point 19 : une
 * sélection invisible survivait d'un écran au suivant).
 */
export function EtapeSegmentDirect({ exercice, connus, segmentsTraces, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation }: Props) {
  const [faceChoisie, setFaceChoisie] = useState<number | null>(null);
  const [faceSoumise, setFaceSoumise] = useState<number | null>(null);
  const max = NIVEAU_AIDE_MAX_SEGMENT;
  const refusee = (validation ? validation.revele : tentativesUtilisees > 0) && faceChoisie === faceSoumise;

  const candidats = candidatsFaces(exercice, new Set(segmentsTraces));
  const apercu = validation ? null : apercuSegmentFace(exercice, connus, faceChoisie);

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_SEGMENT_DIRECT}</p>
      <p className="prompt-fact">{texteProgression(connus, segmentsTraces)}</p>

      <Solide3DSketch
        solide={exercice.solide}
        pointsExtra={pointsExtraConnus(exercice, connus)}
        segmentsExtra={apercu ? [...segmentsExtraTraces(exercice, segmentsTraces), apercu] : segmentsExtraTraces(exercice, segmentsTraces)}
      />

      <div className="options-grid-compact">
        {candidats.map((face) => (
          <button
            key={face}
            type="button"
            className={`btn${faceChoisie === face ? " toggle-active" : ""}${refusee && faceChoisie === face ? " is-erronee" : ""}`}
            onClick={() => setFaceChoisie(face)}
            disabled={Boolean(validation)}
          >
            {libelleFace(exercice, face)}
          </button>
        ))}
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{TEXTE_AIDE_SEGMENT_NIVEAU1}</p>
          {niveauAide >= 2 && <p>{texteAideSegmentNiveau2(exercice, connus)}</p>}
        </div>
      )}
      {!validation && (
        <>
          <BoutonAide niveauAide={niveauAide} niveauAideMax={max} onActiverAide={onActiverAide} />

          <button
            type="button"
            className="btn btn-primary"
            disabled={faceChoisie === null}
            onClick={() => {
              if (faceChoisie === null) return;
              setFaceSoumise(faceChoisie);
              onValider(faceChoisie);
            }}
          >
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
