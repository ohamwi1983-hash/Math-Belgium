import type { ExerciceColinearPointsParametre } from "../core/colinearite.types";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { EtapeResolutionColinearite } from "./EtapeResolutionColinearite";

interface Props {
  exercice: ExerciceColinearPointsParametre;
  tentativesUtilisees: number;
  tentativesMax: number;
  onActiverAide: () => void;
  onValider: (valeur: number) => void;
  validation?: ValidationEtapeProps | null;
}

/** Écran « résolution » de la variante « alignement avec x » : même écran que « paramètre »
 * (`EtapeResolutionColinearite`, audit 4e ch. 6, lot B). */
export function EtapeResolutionAvecXColinearite(props: Props) {
  return <EtapeResolutionColinearite {...props} />;
}
