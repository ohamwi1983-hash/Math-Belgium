import type { ExerciceCaracteristiquesDroite } from "../core/caracteristiquesDroite.types";
import { segmentsConsigneCaracteristiques } from "../ui/formatCaracteristiquesDroite";
import { RenduFragments } from "./RenduFragments";

interface Props {
  exercice: ExerciceCaracteristiquesDroite;
}

/**
 * Consigne générale de l'écran 2 — "Quel est [l'angle α avec Ox / l'angle α avec Oy / la pente] et
 * l'ordonnée à l'origine de la droite d'équation :", suivie du bloc de données (l'équation, rendue
 * juste après par le composant appelant) — `promptgen46modifications.md`, point 2. Même patron
 * fragment par fragment (`RenduFragments`) que `ConsigneExtractionCaracteristiquesDroite`.
 */
export function ConsigneCaracteristiquesDroiteEcran2({ exercice }: Props) {
  return (
    <p className="prompt-text">
      <RenduFragments fragments={segmentsConsigneCaracteristiques(exercice)} />
    </p>
  );
}
