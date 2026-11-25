import type { Exercice103, Variante103 } from "../../core6e/anagrammesContraintes";
import { consonnesDe, nbOccurrences, voyellesDe } from "../../core6e/anagrammesContraintes";
import { MOTS_REPETES, lettresDuMot } from "../../core6e/motsLotH";

/**
 * Couche A — générateur de `6gen103` « Anagrammes et contraintes ». `Math.random()` seul (le
 * `?code=` rejoue le tirage). Mots réels de la liste partagée ; « voyelles groupées » : mots sans Y
 * (voyelle ambiguë) avec au moins deux voyelles et deux consonnes ; « jamais côte à côte » : une
 * lettre présente exactement deux fois ; « commence par » : lettre répétée une fois sur deux (piège :
 * le nombre de cette lettre baisse d'un).
 */

const parmi = <T,>(t: readonly T[]): T => t[Math.floor(Math.random() * t.length)]!;

const MOTS_BLOC = MOTS_REPETES.filter((m) => !m.includes("Y") && voyellesDe(m).length >= 2 && consonnesDe(m).length >= 2);
const MOTS_DOUBLES = MOTS_REPETES.filter((m) => lettresDuMot(m).some((l) => l.nb === 2));

function tirer(variante: Variante103): Exercice103 {
  switch (variante) {
    case "anagrammes":
      return { variante, mot: parmi(MOTS_REPETES) };
    case "commencePar": {
      const mot = parmi(MOTS_REPETES.filter((m) => m.length <= 9));
      const ls = lettresDuMot(mot);
      const rep = ls.filter((l) => l.nb > 1);
      const seul = ls.filter((l) => l.nb === 1);
      const pool = Math.random() < 0.5 && seul.length > 0 ? seul : rep;
      return { variante, mot, lettre: parmi(pool).lettre };
    }
    case "bloc":
      return { variante, mot: parmi(MOTS_BLOC) };
    case "jamaisCote": {
      const mot = parmi(MOTS_DOUBLES);
      const lettre = parmi(lettresDuMot(mot).filter((l) => l.nb === 2)).lettre;
      return { variante, mot, lettre };
    }
  }
}

export const CATALOGUE_103: { id: Variante103; label: string }[] = [
  { id: "anagrammes", label: "Nombre d'anagrammes (le mot lui-même retiré)" },
  { id: "commencePar", label: "Mots qui commencent par une lettre donnée" },
  { id: "bloc", label: "Voyelles groupées (un bloc)" },
  { id: "jamaisCote", label: "Deux lettres identiques jamais côte à côte (complément)" },
];

export function construireAvecVariante103(id: string): Exercice103 {
  const v = CATALOGUE_103.find((x) => x.id === id);
  return tirer(v ? v.id : parmi(CATALOGUE_103).id);
}

export function genererExercice103(): Exercice103 {
  return tirer(parmi(CATALOGUE_103).id);
}

export { nbOccurrences };
