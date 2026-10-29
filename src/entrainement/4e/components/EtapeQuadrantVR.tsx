import { useState } from "react";
import type { ExerciceValeursRemarquables } from "../core/valeursRemarquables.types";
import type { Quadrant } from "../core/cercleTrigonometrique.types";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { BoutonAide } from "./BoutonAide";
import { CercleQuadrantSelecteur } from "./CercleQuadrantSelecteur";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";

interface Props {
  exercice: ExerciceValeursRemarquables;
  tentativesUtilisees: number;
  tentativesMax: number;
  recapitulatif: EntreeRecapitulatif[];
  aideActivee: boolean;
  onActiverAide: () => void;
  onValider: (quadrant: Quadrant) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran "Quadrant" — réutilise tel quel le sélecteur interactif du premier générateur du chapitre
 * (`CercleQuadrantSelecteur`), déjà entièrement générique (aucune dépendance au contrat de cet
 * exercice au-delà du type `Quadrant`). Premier écran de la séquence (pas d'écran "Réduction" pour
 * ce générateur — `promptcreationgenerateur15.md`). Son aide est une aide de MÉTHODE (entre quels
 * multiples de 90° tombe l'angle), jamais le dessin du point θ sur le cercle : l'ancien dessin
 * (`AideReductionCercleTrig`) plaçait l'angle dans son quadrant et donnait donc directement la
 * réponse de cet écran (audit du chapitre 5).
 */
export function EtapeQuadrantVR({ exercice, tentativesUtilisees, tentativesMax, recapitulatif, aideActivee, onActiverAide, onValider, validation}: Props) {
  const [selection, setSelection] = useState<Quadrant | null>(null);

  return (
    <div>
      <RecapitulatifPanel entrees={recapitulatif} />
      <p className="prompt-text">Dans quel quadrant ou sur quel axe se trouve cet angle ?</p>

      <CercleQuadrantSelecteur selection={selection} onSelectionner={setSelection} />

      <div>
        {aideActivee && (
          <div className="triangle-quelconque-aide">
            {(exercice.angleDepart < 0 || exercice.angleDepart >= 360) && (
              <p>Ramène d'abord l'angle entre 0° et 360° : ajoute ou retire 360° autant de fois que nécessaire.</p>
            )}
            <p>
              Repère entre quels multiples de 90° tombe l'angle : entre 0° et 90°, quadrant I ; entre 90° et 180°,
              quadrant II ; entre 180° et 270°, quadrant III ; entre 270° et 360°, quadrant IV. Un angle égal à 0°,
              90°, 180° ou 270° se trouve sur un axe.
            </p>
          </div>
        )}
        <BoutonAide niveauAide={aideActivee ? 1 : 0} niveauAideMax={1} onActiverAide={onActiverAide} />
      </div>
      {!validation && (
        <>
        <button
          type="button"
          className="btn btn-primary"
          disabled={selection === null}
          onClick={() => selection !== null && onValider(selection)}
        >
          Valider
        </button>
        {tentativesUtilisees > 0 && (
          <p className="alert-error" role="alert">
            Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
