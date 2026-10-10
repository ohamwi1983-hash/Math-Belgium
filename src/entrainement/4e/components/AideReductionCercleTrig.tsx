import type { AngleSurCercle } from "../core/cercleTrigonometrique.types";
import { calculerTrajetCercleTrig } from "../ui/cercleTrigTrajet";
import { CercleTrigTrajetBase } from "./CercleTrigTrajetBase";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: AngleSurCercle;
  aideActivee: boolean;
  onActiverAide: () => void;
}

/**
 * Aide de l'écran "Réduction" (promptcorrectionsgenerateur14aides.md, section 6) — remplace l'aide
 * générique retirée (section 1). Cercle interactif (labels X/Y, flèches, O noir — section 3) + le
 * trajet de l'angle brut : rayon vers l'angle réduit, arc ou spirale selon `|angleDepart|`, sens de
 * parcours, label de l'angle BRUT de l'énoncé (jamais l'angle réduit) à côté du rayon.
 *
 * Prop typée structurellement (`AngleSurCercle`, pas `ExerciceCercleTrigonometrique` en dur) —
 * réutilisée telle quelle par le générateur 15 ("Valeurs remarquables") pour l'écran "Quadrant",
 * qui n'a pas d'écran "Réduction" propre (voir sa section dédiée dans CLAUDE.md).
 */
export function AideReductionCercleTrig({ exercice, aideActivee, onActiverAide }: Props) {
  return (
    <div>
      {aideActivee && (
        <CercleTrigTrajetBase
          trajet={calculerTrajetCercleTrig(exercice.angleDepart, exercice.angleReduit)}
          labelAngleBrutTexte={`${exercice.angleDepart}°`}
          ariaLabel={`Cercle trigonométrique montrant le trajet de l'angle ${exercice.angleDepart}° jusqu'à sa position réduite`}
        />
      )}
      <BoutonAide niveauAide={aideActivee ? 1 : 0} niveauAideMax={1} onActiverAide={onActiverAide} />
    </div>
  );
}
