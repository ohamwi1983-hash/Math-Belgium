import type { AngleSurCercle } from "../core/cercleTrigonometrique.types";
import { calculerTrajetCercleTrig } from "../ui/cercleTrigTrajet";
import { calculerAideSignes } from "../ui/cercleTrigSignesAide";
import { CENTRE_CERCLE_TRIG, HAUTEUR_CERCLE_TRIG, RAYON_CERCLE_TRIG } from "../ui/cercleTrigGeometrie";
import { CercleTrigTrajetBase } from "./CercleTrigTrajetBase";

interface Props {
  exercice: AngleSurCercle;
  aideActivee: boolean;
  onActiverAide: () => void;
}

/**
 * Aide de l'écran "Signes" (promptcorrectionsgenerateur14aides.md, section 8 ;
 * promptcorrectionsgenerateur14lot2.md, section 4) — reprend le même trajet de base et ajoute : la
 * droite tangente au cercle en (1,0), verticale, en trait PLEIN sur toute la hauteur du cadre
 * (jamais seulement jusqu'à un point d'intersection), et les 3 projections colorées — vert pour
 * cos(θ) (axe X), bleu pour sin(θ) (axe Y), rose clair pour tan(θ) (la tangente, continuation du
 * rayon déjà tracé, jamais décalée artificiellement — voir `cercleTrigSignesAide.ts`). La
 * coloration des labels sin/cos/tan est gérée par `EtapeSignesCercleTrig.tsx`, sur les en-têtes du
 * tableau uniquement (lot 2, section 5) — jamais ici, ni sur la phrase de consigne.
 *
 * Round 7 : le marqueur plein de tan(θ) (`<circle>`) n'est rendu que si `pointTanVisible` — quand
 * l'intersection réelle `(1,tanθ)` tombe hors du cadre et que le pointillé est tronqué au bord
 * (round 6), la LIGNE va bien jusqu'au bord, mais aucun point n'y est marqué (ce n'est pas
 * l'intersection réelle, l'y afficher serait trompeur).
 *
 * Prop typée structurellement (`AngleSurCercle`) — réutilisée telle quelle par le générateur 15
 * ("Valeurs remarquables") pour l'aide de son écran "Valeurs exactes".
 */
export function AideSignesCercleTrig({ exercice, aideActivee, onActiverAide }: Props) {
  const trajet = calculerTrajetCercleTrig(exercice.angleDepart, exercice.angleReduit);
  const aideSignes = calculerAideSignes(exercice.angleReduit);
  const xTangente = CENTRE_CERCLE_TRIG.x + RAYON_CERCLE_TRIG;

  return (
    <div>
      {aideActivee && (
        <CercleTrigTrajetBase
          trajet={trajet}
          labelAngleBrutTexte={`${exercice.angleDepart}°`}
          ariaLabel="Cercle trigonométrique montrant les projections de cos(θ), sin(θ) et tan(θ)"
        >
          <line x1={xTangente} y1={0} x2={xTangente} y2={HAUTEUR_CERCLE_TRIG} className="cercle-trig-tangente" />

          <line
            x1={aideSignes.pointCercle.x}
            y1={aideSignes.pointCercle.y}
            x2={aideSignes.pointCos.x}
            y2={aideSignes.pointCos.y}
            className="cercle-trig-projection-cos"
          />
          <circle cx={aideSignes.pointCos.x} cy={aideSignes.pointCos.y} r={4} className="cercle-trig-point-cos" />

          <line
            x1={aideSignes.pointCercle.x}
            y1={aideSignes.pointCercle.y}
            x2={aideSignes.pointSin.x}
            y2={aideSignes.pointSin.y}
            className="cercle-trig-projection-sin"
          />
          <circle cx={aideSignes.pointSin.x} cy={aideSignes.pointSin.y} r={4} className="cercle-trig-point-sin" />

          {aideSignes.pointTan && (
            <>
              <line
                x1={aideSignes.pointCercle.x}
                y1={aideSignes.pointCercle.y}
                x2={aideSignes.pointTan.x}
                y2={aideSignes.pointTan.y}
                className="cercle-trig-projection-tan"
              />
              {aideSignes.pointTanVisible && (
                <circle cx={aideSignes.pointTan.x} cy={aideSignes.pointTan.y} r={4} className="cercle-trig-point-tan" />
              )}
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
