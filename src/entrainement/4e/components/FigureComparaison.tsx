import { useMemo, useState } from "react";
import type { ExerciceComparaisonVecteurs } from "../core/comparaisonVecteurs.types";
import { VecteurGraph } from "./VecteurGraph";
import { couleurVecteurComparaison, TETE_FLECHE_COMPARAISON, vecteursAffichesComparaison } from "../ui/formatComparaisonVecteurs";
import { ETIQUETTE_ECRAN } from "../ui/etiquettesComparaison";
import { RATIO_GRAPHE } from "../ui/mafsTransformation";

/**
 * Figure de gen28 à l'écran (écrans « sélection » et « égalité ») : les étiquettes sont placées à
 * leur taille réelle pour la largeur effectivement tracée (`VecteurGraph.onLargeurGraphe`) — à la
 * largeur par défaut avant la première mesure. Le placement ne dépend que de l'exercice et de la
 * largeur ; `selection` ne change que les couleurs (pas de nouveau placement à chaque case cochée).
 */
export function FigureComparaison({ exercice, selection }: { exercice: ExerciceComparaisonVecteurs; selection: string[] }) {
  const [largeur, setLargeur] = useState<number | null>(null);
  const { points, vecteurs, viewBox } = useMemo(
    () =>
      vecteursAffichesComparaison(
        exercice,
        [],
        largeur ? { ...ETIQUETTE_ECRAN, largeurPx: largeur, hauteurPx: largeur / RATIO_GRAPHE } : undefined,
      ),
    [exercice, largeur],
  );
  const colores = vecteurs.map((v, i) => ({ ...v, couleur: couleurVecteurComparaison(exercice, exercice.vecteurs[i].label, selection) }));
  return (
    <VecteurGraph
      points={points}
      vecteurs={colores}
      masquerAxes
      pasGrille={1}
      viewBoxFixe={viewBox}
      teteFleche={TETE_FLECHE_COMPARAISON}
      onLargeurGraphe={setLargeur}
    />
  );
}
