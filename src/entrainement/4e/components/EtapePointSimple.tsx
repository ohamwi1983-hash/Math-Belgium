import { useState } from "react";
import type { DirectionCandidate, ExerciceOmbreSoleilSimple } from "../core/ombreSoleil.types";
import { NIVEAU_AIDE_MAX_POINT_SIMPLE } from "../moteur/sessionOmbreSoleil";
import {
  apercuDirection,
  apercuPoint,
  CONSIGNE_POINT_SIMPLE,
  directionCorrecte,
  elementsExemple,
  libelleBoutonAide,
  libelleCandidat,
  ordreAffichageCandidats,
  pointSommetPiquet,
  segmentPiquet,
  solidePourAffichage,
  TEXTE_AIDE_POINT_SIMPLE_NIVEAU1,
  TEXTE_AIDE_POINT_SIMPLE_NIVEAU2,
} from "../ui/formatOmbreSoleil";
import { formatMessageErreur } from "../ui/messageErreur";
import { Solide3DSketch } from "./Solide3DSketch";

interface Props {
  exercice: ExerciceOmbreSoleilSimple;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (id: string) => void;
}

/**
 * Écran unique — variante A ("Ombre simple sur sol plat", spec section "Variante A"). Sélection
 * DIRECTE du point-ombre parmi les 4 candidats (l'option principale de la spec, pas le détour par
 * une sélection de droite séparée) : le mélange des candidats (`ordreAffichageCandidats`) est figé
 * une seule fois par exercice via `useState` (lazy init) — jamais recalculé à chaque rendu, sans
 * quoi les boutons se réordonneraient sous les doigts de l'élève à chaque interaction.
 */
export function EtapePointSimple({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [candidats] = useState<DirectionCandidate[]>(() => ordreAffichageCandidats(exercice.directionsCandidates));
  const [choix, setChoix] = useState<DirectionCandidate | null>(null);
  const max = NIVEAU_AIDE_MAX_POINT_SIMPLE;
  const erronee = tentativesUtilisees > 0;

  const solide = solidePourAffichage(exercice);
  const exemple = elementsExemple(exercice.piquetExemple, exercice.ombreExemple);
  const apercu = apercuPoint(exercice.piquet.piquet, choix, undefined);
  const directionRevelee = niveauAide >= 2 ? apercuDirection(exercice.piquet.piquet, directionCorrecte(exercice)) : null;

  const points = [...exemple.points, pointSommetPiquet(exercice.piquet.piquet)];
  if (apercu) points.push(apercu.point);
  const segments = [...exemple.segments, segmentPiquet(exercice.piquet.piquet)];
  if (directionRevelee) segments.push(directionRevelee);
  if (apercu) segments.push(apercu.segment);

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_POINT_SIMPLE}</p>

      <Solide3DSketch solide={solide} pointsExtra={points} segmentsExtra={segments} labelsSommets={false} />

      <div className="options-grid-compact">
        {candidats.map((candidat, index) => (
          <button
            key={candidat.id}
            type="button"
            className={`btn${choix?.id === candidat.id ? " toggle-active" : ""}${erronee && choix?.id === candidat.id ? " is-erronee" : ""}`}
            onClick={() => setChoix(candidat)}
          >
            {libelleCandidat(index)}
          </button>
        ))}
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{TEXTE_AIDE_POINT_SIMPLE_NIVEAU1}</p>
          {niveauAide >= 2 && <p>{TEXTE_AIDE_POINT_SIMPLE_NIVEAU2}</p>}
        </div>
      )}
      <button type="button" className="btn btn-aide" disabled={niveauAide >= max} onClick={onActiverAide}>
        {libelleBoutonAide(niveauAide, max)}
      </button>

      <button type="button" className="btn btn-primary" disabled={choix === null} onClick={() => choix !== null && onValider(choix.id)}>
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
