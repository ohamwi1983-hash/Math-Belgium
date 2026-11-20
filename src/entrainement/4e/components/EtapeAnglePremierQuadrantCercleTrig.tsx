import type { AngleAvecPremierQuadrant } from "../core/cercleTrigonometrique.types";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { AideAnglePremierQuadrantCercleTrig } from "./AideAnglePremierQuadrantCercleTrig";
import { ChampAngleTrig } from "./ChampAngleTrig";
import { aidesAnglePremierQuadrant, messageAnglePremierQuadrant } from "../ui/aidesCercleTrigo";

interface Props {
  exercice: AngleAvecPremierQuadrant;
  tentativesUtilisees: number;
  tentativesMax: number;
  recapitulatif: EntreeRecapitulatif[];
  aideActivee: boolean;
  onActiverAide: () => void;
  onValider: (valeur: number) => void;
  validation?: ValidationEtapeProps | null;
  /** Identifiant du champ (gen14 / gen15). */
  idChamp?: string;
}

/** Angle du premier quadrant (angle de référence), toujours entre 0° et 90° — partagé par gen14 et
 * gen15 (règles communes, `ChampAngleTrig`). */
export function EtapeAnglePremierQuadrantCercleTrig({ exercice, tentativesUtilisees, tentativesMax, recapitulatif, onActiverAide, onValider, validation, idChamp = "cercle-trig-premier-quadrant" }: Props) {
  return (
    <ChampAngleTrig
      id={idChamp}
      question="Quel est l'angle du premier quadrant associé à cet angle ?"
      label="Angle du premier quadrant en degrés"
      tentativesUtilisees={tentativesUtilisees}
      tentativesMax={tentativesMax}
      recapitulatif={recapitulatif}
      aides={aidesAnglePremierQuadrant(exercice)}
      figure={(n) => (n >= 2 ? <AideAnglePremierQuadrantCercleTrig exercice={exercice} aideActivee sansBouton onActiverAide={() => {}} /> : null)}
      onPremiereAide={onActiverAide}
      messageCible={(v) => messageAnglePremierQuadrant(exercice, v)}
      onValider={onValider}
      validation={validation}
    />
  );
}
