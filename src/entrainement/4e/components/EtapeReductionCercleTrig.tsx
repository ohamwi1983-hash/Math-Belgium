import type { AngleAvecPremierQuadrant } from "../core/cercleTrigonometrique.types";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { AideReductionCercleTrig } from "./AideReductionCercleTrig";
import { ChampAngleTrig } from "./ChampAngleTrig";
import { aidesReduction, messageReduction } from "../ui/aidesCercleTrigo";

interface Props {
  exercice: AngleAvecPremierQuadrant;
  tentativesUtilisees: number;
  tentativesMax: number;
  recapitulatif: EntreeRecapitulatif[];
  aideActivee: boolean;
  onActiverAide: () => void;
  onValider: (valeur: number) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran`. */
  validation?: ValidationEtapeProps | null;
}

/** Premier écran rencontré si une réduction est nécessaire : un angle en degrés (règles communes,
 * `ChampAngleTrig`). Aide : propriété des tours (niveau 1), application + trajet sur le cercle
 * (niveau 2). */
export function EtapeReductionCercleTrig({ exercice, tentativesUtilisees, tentativesMax, recapitulatif, onActiverAide, onValider, validation }: Props) {
  return (
    <ChampAngleTrig
      id="cercle-trig-reduction"
      question="Quel est l'angle entre 0° et 360° qui donne le même point sur le cercle trigonométrique ?"
      label="Angle équivalent en degrés"
      tentativesUtilisees={tentativesUtilisees}
      tentativesMax={tentativesMax}
      recapitulatif={recapitulatif}
      aides={aidesReduction(exercice)}
      figure={(n) => (n >= 2 ? <AideReductionCercleTrig exercice={exercice} aideActivee sansBouton onActiverAide={() => {}} /> : null)}
      onPremiereAide={onActiverAide}
      messageCible={(v) => messageReduction(exercice, v)}
      onValider={onValider}
      validation={validation}
    />
  );
}
