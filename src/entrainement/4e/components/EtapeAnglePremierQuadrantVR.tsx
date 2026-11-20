import type { ExerciceValeursRemarquables } from "../core/valeursRemarquables.types";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { EtapeAnglePremierQuadrantCercleTrig } from "./EtapeAnglePremierQuadrantCercleTrig";

interface Props {
  exercice: ExerciceValeursRemarquables;
  tentativesUtilisees: number;
  tentativesMax: number;
  recapitulatif: EntreeRecapitulatif[];
  aideActivee: boolean;
  onActiverAide: () => void;
  onValider: (valeur: number) => void;
  validation?: ValidationEtapeProps | null;
}

/** gen15 : même écran que gen14 (règles communes, audit 4e ch. 5 lot B). */
export function EtapeAnglePremierQuadrantVR(props: Props) {
  return <EtapeAnglePremierQuadrantCercleTrig {...props} idChamp="valeurs-remarquables-premier-quadrant" />;
}
