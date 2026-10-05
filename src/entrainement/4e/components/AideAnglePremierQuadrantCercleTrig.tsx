import type { AngleAvecPremierQuadrant } from "../core/cercleTrigonometrique.types";
import { calculerTrajetCercleTrig } from "../ui/cercleTrigTrajet";
import { calculerAidePremierQuadrant } from "../ui/cerclePremierQuadrantAide";
import { CENTRE_CERCLE_TRIG } from "../ui/cercleTrigGeometrie";
import { CercleTrigTrajetBase } from "./CercleTrigTrajetBase";

interface Props {
  exercice: AngleAvecPremierQuadrant;
  aideActivee: boolean;
  onActiverAide: () => void;
}

/**
 * Aide de l'écran "Angle du premier quadrant" (promptcorrectionsgenerateur14aides.md, section 7) —
 * reprend le même trajet que l'aide "Réduction" et ajoute : le point symétrique de θ dans le
 * premier quadrant (sans label numérique), son propre rayon avec un petit arc d'angle labellisé
 * "?", et une ligne pointillée reliant les deux points UNIQUEMENT pour une symétrie orthogonale
 * (quadrant II ou IV) — jamais pour une symétrie centrale (III) ni les cas dégénérés (I, axes).
 *
 * Prop typée structurellement (`AngleAvecPremierQuadrant`) — réutilisée telle quelle par le
 * générateur 15 ("Valeurs remarquables"), même écran de même nom, même mécanique.
 */
export function AideAnglePremierQuadrantCercleTrig({ exercice, aideActivee, onActiverAide }: Props) {
  const trajet = calculerTrajetCercleTrig(exercice.angleDepart, exercice.angleReduit);
  const aidePQ = calculerAidePremierQuadrant(exercice.anglePremierQuadrant, exercice.quadrant, exercice.angleReduit);

  return (
    <div>
      {aideActivee && (
        <CercleTrigTrajetBase
          trajet={trajet}
          labelAngleBrutTexte={`${exercice.angleDepart}°`}
          ariaLabel="Cercle trigonométrique montrant l'angle brut et le point symétrique du premier quadrant"
        >
          {aidePQ.afficherLignePointillee && (
            <line
              x1={trajet.pointFinal.x}
              y1={trajet.pointFinal.y}
              x2={aidePQ.point.x}
              y2={aidePQ.point.y}
              className="cercle-trig-ligne-pointillee"
            />
          )}
          <line
            x1={CENTRE_CERCLE_TRIG.x}
            y1={CENTRE_CERCLE_TRIG.y}
            x2={aidePQ.point.x}
            y2={aidePQ.point.y}
            className="cercle-trig-rayon-question"
          />
          <circle cx={aidePQ.point.x} cy={aidePQ.point.y} r={5} className="cercle-trig-point-question" />
          {aidePQ.arcAngleChemin && (
            <>
              <path d={aidePQ.arcAngleChemin} className="cercle-trig-arc-question" />
              {aidePQ.fleche && <polygon points={aidePQ.fleche} className="cercle-trig-fleche-question" />}
              <text x={aidePQ.labelQuestion.x} y={aidePQ.labelQuestion.y} className="cercle-trig-label-question">
                ?
              </text>
            </>
          )}
        </CercleTrigTrajetBase>
      )}
      <button type="button" className="btn btn-aide" disabled={aideActivee} onClick={onActiverAide}>
        {aideActivee ? "Aide utilisée" : "Aide"}
      </button>
    </div>
  );
}
