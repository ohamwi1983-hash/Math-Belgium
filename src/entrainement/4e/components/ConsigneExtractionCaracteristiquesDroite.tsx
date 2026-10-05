import type { ExerciceCaracteristiquesDroite } from "../core/caracteristiquesDroite.types";
import { segmentsConsigneExtraction } from "../ui/formatCaracteristiquesDroite";
import { RenduFragments } from "./RenduFragments";

interface Props {
  exercice: ExerciceCaracteristiquesDroite;
}

/**
 * Consigne de l'écran 1 — nomme explicitement le point $A$ et le vecteur directeur $\vec{u}$
 * (`promptgen46modifications.md`, point 1). Même patron fragment par fragment (texte brut / KaTeX
 * inline courts, `RenduFragments`) que `ConsigneGeneraleEquationDroite`/`ConsigneGeneraleRelationsDroites`.
 */
export function ConsigneExtractionCaracteristiquesDroite({ exercice }: Props) {
  return (
    <p className="prompt-text">
      <RenduFragments fragments={segmentsConsigneExtraction(exercice)} />
    </p>
  );
}
