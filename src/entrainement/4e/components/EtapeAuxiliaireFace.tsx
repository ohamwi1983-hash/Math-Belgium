import { useState } from "react";
import type { ExerciceSectionPlaneSolide } from "../core/sectionPlaneSolide.types";
import { NIVEAU_AIDE_MAX_AUXILIAIRE } from "../moteur/sessionSectionPlaneSolide";
import {
  CONSIGNE_AUXILIAIRE_FACE,
  TEXTE_AIDE_AUXILIAIRE_NIVEAU1,
  apercuLignesChoisies,
  facesAMoitieConnues,
  libelleBoutonAide,
  libelleFace,
  pointsExtraConnus,
  segmentsExtraTraces,
  texteAideAuxiliaireNiveau2,
  texteProgressionPoints,
  texteProgressionSegments,
} from "../ui/formatSectionPlaneSolide";
import { formatMessageErreur } from "../ui/messageErreur";
import { Solide3DSketch } from "./Solide3DSketch";

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
}

/**
 * Écran type B, étape 2 (dernière étape du flux auxiliaire) — sélection de la face que le nouveau
 * point (intersection déjà validée à l'étape précédente, jamais recalculée ici côté présentation)
 * permet de continuer à construire. Les candidats affichés sont les faces à moitié connues (toutes,
 * pas seulement celle réellement débloquée par la paire de droites choisie) — le distracteur est
 * délibéré, l'élève doit reconnaître laquelle cette construction précise débloque réellement.
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
}: Props) {
  const [faceChoisie, setFaceChoisie] = useState<number | null>(null);
  const max = NIVEAU_AIDE_MAX_AUXILIAIRE;
  const erronee = tentativesUtilisees > 0;

  const facesAide = facesAMoitieConnues(exercice, new Set(connus));

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_AUXILIAIRE_FACE}</p>
      <p className="prompt-text">
        {texteProgressionPoints(exercice, connus)} — {texteProgressionSegments(exercice, segmentsTraces)}
      </p>

      <Solide3DSketch
        solide={exercice.solide}
        pointsExtra={pointsExtraConnus(exercice, connus)}
        segmentsExtra={[...segmentsExtraTraces(exercice, segmentsTraces), ...apercuLignesChoisies(exercice, ligneAuxiliaireChoisie)]}
      />

      <div className="options-grid-compact">
        {facesAide.map((candidat) => (
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
          <p>{TEXTE_AIDE_AUXILIAIRE_NIVEAU1}</p>
          {niveauAide >= 2 && <p>{texteAideAuxiliaireNiveau2(exercice, facesAide)}</p>}
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
