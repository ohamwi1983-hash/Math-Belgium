import { useState } from "react";
import type { ExerciceSectionPlaneSolide } from "../core/sectionPlaneSolide.types";
import { NIVEAU_AIDE_MAX_SEGMENT } from "../moteur/sessionSectionPlaneSolide";
import { CONSIGNE_SEGMENT_DIRECT, TEXTE_AIDE_SEGMENT_NIVEAU1, apercuSegmentFace, candidatsFaces, libelleFace, pointsExtraConnus, segmentsExtraTraces, texteAideSegmentNiveau2, texteProgression } from "../ui/formatSectionPlaneSolide";
import { ariaOptionChoixFerme, classeOptionChoixFerme } from "../ui/choixFige";
import { Solide3DSketch } from "./Solide3DSketch";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { TexteInsistance } from "../../components/TexteInsistance";

interface Props {
  exercice: ExerciceSectionPlaneSolide;
  connus: number[];
  segmentsTraces: string[];
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (face: number) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
  /** Face retenue par le moteur (celle de l'élève si elle convenait, sinon la face révélée) — marquée
   * en vert ✓ une fois l'écran clos ; un choix faux est marqué en rouge ✗ (audit 4e ch. 8, lot B). */
  faceJuste?: number | null;
}

/**
 * Écran type A — "Tracer un segment direct" (spec). TOUTES les faces du solide sont proposées (sauf
 * celles déjà tracées) : les faces à 0 ou 1 seul point connu, ou que le plan ne traverse pas, sont
 * des distracteurs — c'est précisément le piège central de la spec (tenter de tracer un segment
 * dans une face pas encore assez connue). L'état local (face choisie) est remis à zéro à chaque
 * écran par la `key` posée dans `AppSectionPlaneSolide.tsx` (audit chapitre 8, point 19 : une
 * sélection invisible survivait d'un écran au suivant).
 */
export function EtapeSegmentDirect({ exercice, connus, segmentsTraces, niveauAide, onActiverAide, onValider, validation, faceJuste }: Props) {
  const [faceChoisie, setFaceChoisie] = useState<number | null>(null);
  const max = NIVEAU_AIDE_MAX_SEGMENT;
  const etatOptions = { selection: faceChoisie, choisie: validation ? faceChoisie : null, bonne: faceJuste ?? -1 };

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

      <div className="options-grid-compact" role="radiogroup">
        {candidats.map((face) => {
          const aria = ariaOptionChoixFerme(face, etatOptions);
          return (
            <button
              key={face}
              type="button"
              role="radio"
              aria-checked={faceChoisie === face}
              className={classeOptionChoixFerme(face, etatOptions)}
              onClick={() => setFaceChoisie(face)}
              disabled={Boolean(validation)}
            >
              {libelleFace(exercice, face)}
              {aria && <span className="sr-only"> — {aria}</span>}
            </button>
          );
        })}
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{TEXTE_AIDE_SEGMENT_NIVEAU1}</p>
          {niveauAide >= 2 && <p><TexteInsistance texte={texteAideSegmentNiveau2(exercice, connus)} /></p>}
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
              onValider(faceChoisie);
            }}
          >
            Valider
          </button>
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
