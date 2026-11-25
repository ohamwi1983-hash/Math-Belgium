import type { ContexteAMU, EvenementAMU, ExerciceAMU, StrategieAMU } from "../../core6e/auMoinsUnComplement";
import { EVENEMENTS_AMU } from "../../core6e/auMoinsUnComplement";
import { entier, melanger, parmi } from "../../ui6e/nombresCombinatoireLotH2";

/**
 * Couche A — générateur de `6gen105` « Au moins un : le complément ». `Math.random()` seul (le
 * `?code=` rejoue le tirage). L'ÉVÉNEMENT (au moins un / au plus un / exactement j), qui décide de
 * la stratégie juste de l'écran 1, est tiré EN PREMIER à parts égales (verdict équilibré, jamais
 * dans `forme`) ; la variante fixe le contexte ; viennent ensuite les nombres, puis l'ordre des
 * quatre stratégies.
 */

export const CATALOGUE_VARIANTES: { id: ContexteAMU; label: string }[] = [
  { id: "comite", label: "Comité dans un club (femmes et hommes)" },
  { id: "cartes", label: "Main de cartes (jeu de 32 cartes, as)" },
  { id: "defectueuses", label: "Échantillon d'ampoules (défectueuses)" },
  { id: "delegation", label: "Délégation d'élèves (6e et 5e)" },
];

function nombres(v: ContexteAMU): { a: number; b: number } {
  switch (v) {
    case "comite":
      return { a: entier(3, 7), b: entier(5, 10) };
    case "cartes":
      return { a: 4, b: 28 };
    case "defectueuses":
      return { a: entier(3, 6), b: entier(8, 15) };
    case "delegation":
      return { a: entier(3, 6), b: entier(5, 10) };
  }
}

export function construire(v: ContexteAMU, evenement: EvenementAMU = parmi(EVENEMENTS_AMU)): ExerciceAMU {
  const { a, b } = nombres(v);
  const k = entier(3, Math.min(5, b));
  let j = 0;
  if (evenement === "exactement") {
    const jMax = Math.min(a, k - 1);
    const possibles = Array.from({ length: jMax }, (_, i) => i + 1).filter((x) => k - x <= b);
    j = parmi(possibles);
  }
  const options = melanger<StrategieAMU>(["complement", "somme", "direct", "imposer"]);
  return { variante: v, evenement, a, b, k, j, options };
}

export function construireAvecVariante(id: string): ExerciceAMU {
  const v = CATALOGUE_VARIANTES.find((x) => x.id === id);
  return construire(v ? v.id : parmi(CATALOGUE_VARIANTES).id);
}

export function genererExerciceAMU(): ExerciceAMU {
  // Événement d'abord (verdict), contexte ensuite.
  const evenement = parmi(EVENEMENTS_AMU);
  return construire(parmi(CATALOGUE_VARIANTES).id, evenement);
}
