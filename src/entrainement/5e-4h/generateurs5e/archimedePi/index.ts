import type { ExerciceArchimedePi, VarianteArchimede } from "../../core5e/archimedePi";
import { largeurDe, majorantDe, minorantDe } from "../../core5e/archimedePi";

export type IdVarianteArchimede = VarianteArchimede;

/**
 * Couche A — générateur de `5gen56` « Encadrer π comme Archimède ». `Math.random()` seul (`?code=`).
 * n : 6 (hexagone d'Archimède), 4 (carré), ou 5, 8, 10, 12 ; rayon 2 à 10 cm. Le seuil s (0,1 ; 0,05 ;
 * 0,02 ; 0,01 ; 0,005 ; 0,002 ; 0,001) est choisi pour qu'il faille au moins DEUX doublements au-delà
 * de 2n et qu'aucune largeur ne soit à moins de 15 % du seuil (réponse nette malgré les arrondis).
 */

function parmi<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)];
}

const SEUILS = [0.1, 0.05, 0.02, 0.01, 0.005, 0.002, 0.001];

function construire(variante: VarianteArchimede): ExerciceArchimedePi {
  for (;;) {
    const n = variante === "hexagone" ? 6 : variante === "carre" ? 4 : parmi([5, 8, 10, 12]);
    const r = parmi([2, 3, 4, 5, 6, 8, 10]);
    const K = parmi([2, 3, 4]); // doublements après n : nSeuil = n·2^K
    const nSeuil = n * 2 ** K;
    const wN = largeurDe(nSeuil);
    const wAvant = largeurDe(nSeuil / 2);
    const candidats = SEUILS.filter((s) => s / wN >= 1.15 && wAvant / s >= 1.15);
    if (candidats.length === 0) continue;
    const seuil = parmi(candidats);
    const alphaDeg = 180 / n;
    const rad = Math.PI / n;
    return {
      variante,
      n,
      r,
      alphaDeg,
      coteInscrit: 2 * r * Math.sin(rad),
      coteCirconscrit: 2 * r * Math.tan(rad),
      minorant: minorantDe(n),
      majorant: majorantDe(n),
      minorant2: minorantDe(2 * n),
      majorant2: majorantDe(2 * n),
      seuil,
      nSeuil,
      cleCollecteur: `${variante}/n${n}/K${K}`,
    };
  }
}

export const CATALOGUE_VARIANTES: { id: IdVarianteArchimede; label: string }[] = [
  { id: "hexagone", label: "Départ d'Archimède : hexagone (6 côtés)" },
  { id: "carre", label: "Départ : carré (4 côtés)" },
  { id: "autre", label: "Départ : pentagone, octogone, décagone ou dodécagone" },
];

export function construireAvecVarianteId(id: IdVarianteArchimede): ExerciceArchimedePi {
  return construire(id);
}

export function genererExerciceArchimedePi(): ExerciceArchimedePi {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
