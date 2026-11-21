import type { ExerciceRelationVectorielle } from "../core/relationVectorielle.types";
import { valeursGrapheAide } from "../ui/formatRelationVectorielle";
import type { Niveaux } from "../ui/retoursVecteurs";
import { VecteurGraph } from "./VecteurGraph";
import { AidesNiveaux } from "./RetourSaisie";

interface Props {
  exercice: ExerciceRelationVectorielle;
  aides: Niveaux;
  /** Drapeau d'aide du moteur (`activerAide`), levé à la première ouverture. */
  onPremiereAide: () => void;
}

/**
 * Aides de gen21 (audit 4e ch. 6, lot B) : deux niveaux en KaTeX (`ui/retoursVecteurs.ts`), et au
 * niveau 2 le graphe d'aide d'avant (points connus et vecteur tracé, jamais le point cherché) — il
 * n'est jamais affiché par défaut dans cette version guidée.
 */
export function AideRelationVectorielle({ exercice, aides, onPremiereAide }: Props) {
  const { points, vecteurs } = valeursGrapheAide(exercice);
  return <AidesNiveaux aides={aides} figure={(n) => (n >= 2 ? <VecteurGraph points={points} vecteurs={vecteurs} /> : null)} onPremiereAide={onPremiereAide} />;
}
