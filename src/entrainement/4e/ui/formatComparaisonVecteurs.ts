import type { ExerciceComparaisonVecteurs, ProprieteComparaison } from "../core/comparaisonVecteurs.types";
import { calculerPositionsEtiquettesSansChevauchement, calculerViewBoxVecteurs } from "./vecteurGraph";
import type { PointAffiche, VecteurAffiche } from "./vecteurGraph";

const CONSIGNES_PROPRIETE: Record<ProprieteComparaison, string> = {
  longueur: "même longueur",
  direction: "même direction",
  sens: "même sens",
};

/** Consigne de l'étape "sélection" — texte brut + fragment LaTeX court (jamais toute la phrase
 * passée à KaTeX, même piège déjà rencontré et corrigé ailleurs dans le projet, voir CLAUDE.md). */
export function consigneSelection(exercice: ExerciceComparaisonVecteurs): { avant: string; latex: string; apres: string } {
  return {
    avant: `Sélectionne tous les vecteurs de ${CONSIGNES_PROPRIETE[exercice.propriete]} que `,
    latex: `\\vec{${exercice.labelReference}}`,
    apres: ".",
  };
}

/** Vecteurs affichés (jamais de point isolé) — un par vecteur de l'exercice, coloré différemment
 * si sélectionné. Labels en notation vectorielle réelle (`labelFleche`, flèche dessinée AU-DESSUS
 * de la lettre — voir `components/VecteurGraph.tsx::LabelVecteurFleche`), jamais une lettre nue
 * (`label`) — y compris pour la référence en rouge. Positions calculées via
 * `calculerPositionsEtiquettesSansChevauchement` (`ui/vecteurGraph.ts`) plutôt que le milieu par
 * défaut de chaque vecteur : les vecteurs de ce générateur sont TOUS des transformations (multiples
 * scalaires, translations) de 2-3 vecteurs de base, donc souvent proches/colinéaires — le placement
 * par défaut chevauchait fortement (labels superposés entre eux, ou collés sur leur propre tracé),
 * signalé et corrigé par `promptgen28modifications.md`. */
export function vecteursAffichesComparaison(
  exercice: ExerciceComparaisonVecteurs,
  labelsSelectionnes: string[],
): { points: PointAffiche[]; vecteurs: VecteurAffiche[] } {
  const vecteursBase: VecteurAffiche[] = exercice.vecteurs.map((v) => ({
    origine: v.origine,
    vecteur: v.composantes,
    couleur: labelsSelectionnes.includes(v.label) ? "#f08c00" : v.label === exercice.labelReference ? "#e03131" : undefined,
  }));
  const viewBox = calculerViewBoxVecteurs([], vecteursBase);
  const positions = calculerPositionsEtiquettesSansChevauchement(vecteursBase, viewBox);
  const vecteurs: VecteurAffiche[] = exercice.vecteurs.map((v, i) => ({
    ...vecteursBase[i],
    labelFleche: { base: v.label },
    labelPosition: positions[i],
  }));
  return { points: [], vecteurs };
}
