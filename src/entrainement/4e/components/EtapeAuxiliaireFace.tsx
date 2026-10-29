import { useState } from "react";
import type { ExerciceSectionPlaneSolide } from "../core/sectionPlaneSolide.types";
import type { ConstructionAuxiliaireConfirmee } from "../moteur/typesSectionPlaneSolide";
import { NIVEAU_AIDE_MAX_AUXILIAIRE } from "../moteur/sessionSectionPlaneSolide";
import {
  CONSIGNE_AUXILIAIRE_FACE,
  TEXTE_AIDE_FACE_NIVEAU1,
  candidatsFaces,
  elementsConstructionAuxiliaire,
  libelleFace,
  pointsExtraConnus,
  segmentsExtraTraces,
  texteAideFaceNiveau2,
  texteProgression,
} from "../ui/formatSectionPlaneSolide";
import { formatMessageErreur } from "../ui/messageErreur";
import { Solide3DSketch } from "./Solide3DSketch";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceSectionPlaneSolide;
  connus: number[];
  segmentsTraces: string[];
  ligneAuxiliaireChoisie: [string, string];
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (face: number) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
  /** Construction CONFIRMÉE (présente avec `validation`) — la droite qui relie I au point déjà
   * connu et le nouveau point de section sont alors dessinés (audit chapitre 8, point 21). */
  construction?: ConstructionAuxiliaireConfirmee | null;
}

/**
 * Écran type B, étape 2 (dernière étape du flux auxiliaire) — sélection de la face que le point
 * auxiliaire I (intersection déjà validée à l'étape précédente) permet de continuer à construire.
 * I et les 2 droites prolongées jusqu'à lui sont DESSINÉS dès l'arrivée sur cet écran (audit
 * chapitre 8, points 7 et 21 — le nouveau point apparaissait sans construction visible). Toutes les
 * faces non encore tracées sont proposées (jamais seulement celles à moitié connues, qui
 * désignaient presque la réponse) ; une seule tentative (décision H2a).
 */
export function EtapeAuxiliaireFace({
  exercice,
  connus,
  segmentsTraces,
  ligneAuxiliaireChoisie,
  tentativesUtilisees,
  tentativesMax,
  niveauAide,
  onActiverAide,
  onValider,
  validation,
  construction,
}: Props) {
  const [faceChoisie, setFaceChoisie] = useState<number | null>(null);
  const [faceSoumise, setFaceSoumise] = useState<number | null>(null);
  const max = NIVEAU_AIDE_MAX_AUXILIAIRE;
  const refusee = (validation ? validation.revele : tentativesUtilisees > 0) && faceChoisie === faceSoumise;

  const candidats = candidatsFaces(exercice, new Set(segmentsTraces));
  const dessin = elementsConstructionAuxiliaire(exercice, connus, ligneAuxiliaireChoisie[0], ligneAuxiliaireChoisie[1], validation ? construction : null);

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_AUXILIAIRE_FACE}</p>
      <p className="prompt-fact">{texteProgression(connus, segmentsTraces)}</p>

      <Solide3DSketch
        solide={exercice.solide}
        pointsExtra={[...pointsExtraConnus(exercice, connus), ...dessin.points]}
        segmentsExtra={[...segmentsExtraTraces(exercice, segmentsTraces), ...dessin.segments]}
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
          <p>{TEXTE_AIDE_FACE_NIVEAU1}</p>
          {niveauAide >= 2 && <p>{texteAideFaceNiveau2(exercice, connus, ligneAuxiliaireChoisie)}</p>}
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
