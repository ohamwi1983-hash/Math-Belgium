import type { ExerciceColinearPointsParametre } from "../core/colinearite.types";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { EtapeReductionColinearite } from "./EtapeReductionColinearite";

interface Props {
  exercice: ExerciceColinearPointsParametre;
  tentativesUtilisees: number;
  tentativesMax: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  validation?: ValidationEtapeProps | null;
}

/** Écran « relation réduite » de la variante « alignement avec x » : même écran que
 * « paramètre » (`EtapeReductionColinearite`, audit 4e ch. 6, lot B), données = les trois points. */
export function EtapeReductionAvecXColinearite(props: Props) {
  return <EtapeReductionColinearite {...props} />;
}
