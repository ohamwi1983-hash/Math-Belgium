import type { Contexte100, Exercice100, Type100 } from "../../core6e/quelleFormule";
import { TYPES_100 } from "../../core6e/quelleFormule";
import { MOTS_REPETES, lettresDuMot } from "../../core6e/motsLotH";

/**
 * Couche A — générateur de `6gen100` « Quelle formule ? ». `Math.random()` seul (le `?code=` rejoue
 * le tirage). Le type (verdict) est tiré à parts égales AVANT tout le reste ; le contexte ensuite,
 * parmi ceux du type ; les nombres restent raisonnables (réponse ≤ 50 000).
 */

const parmi = <T,>(t: readonly T[]): T => t[Math.floor(Math.random() * t.length)]!;
const entier = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));

const CONTEXTES: Record<Type100, Contexte100[]> = {
  arrangement: ["podium", "bureau", "codeDistinct"],
  combinaison: ["comite", "cartes", "pizza", "poignees"],
  permutation: ["livres", "oral", "photo"],
  arrRep: ["pin", "motsLettres", "urneRemise"],
  combRep: ["glaces", "dominos", "desIdentiques"],
  permRep: ["mot", "boules", "groupes", "saison"],
  circulaire: ["table", "bracelet", "ronde"],
};

/** Trois effectifs (≥ 2 : « 1 boules » ne se dit pas) de somme ≤ 10. */
function effectifs3(): number[] {
  for (;;) {
    const e = [entier(2, 5), entier(2, 4), entier(2, 4)];
    const s = e.reduce((a, b) => a + b, 0);
    if (s >= 6 && s <= 10) return e;
  }
}

function tirer(type: Type100): Exercice100 {
  const contexte = parmi(CONTEXTES[type]);
  switch (contexte) {
    case "podium":
      return { type, contexte, n: entier(6, 12), p: 3 };
    case "bureau":
      return { type, contexte, n: entier(8, 15), p: parmi([2, 3]) };
    case "codeDistinct":
      return { type, contexte, n: 10, p: entier(3, 4) };
    case "comite":
      return { type, contexte, n: entier(15, 25), p: entier(2, 4) };
    case "cartes":
      return { type, contexte, n: 32, p: entier(2, 3) };
    case "pizza":
      return { type, contexte, n: entier(6, 12), p: entier(2, 4) };
    case "poignees":
      return { type, contexte, n: entier(6, 20), p: 2 };
    case "livres":
      return { type, contexte, n: entier(4, 8), p: 0 };
    case "oral":
      return { type, contexte, n: entier(5, 8), p: 0 };
    case "photo":
      return { type, contexte, n: entier(4, 7), p: 0 };
    case "pin":
      return { type, contexte, n: 10, p: entier(3, 4) };
    case "motsLettres":
      return { type, contexte, n: entier(4, 6), p: 3 };
    case "urneRemise":
      return { type, contexte, n: entier(5, 9), p: 3 };
    case "glaces":
      return { type, contexte, n: entier(5, 10), p: entier(2, 4) };
    case "dominos":
      return { type, contexte, n: entier(5, 9), p: 2 };
    case "desIdentiques":
      return { type, contexte, n: 6, p: entier(2, 4) };
    case "mot": {
      const mot = parmi(MOTS_REPETES.filter((m) => m.length <= 9));
      return { type, contexte, n: mot.length, p: 0, mot, effectifs: lettresDuMot(mot).map((l) => l.nb) };
    }
    case "boules":
    case "groupes":
    case "saison": {
      const eff = effectifs3();
      return { type, contexte, n: eff.reduce((a, b) => a + b, 0), p: 0, effectifs: eff };
    }
    case "table":
    case "ronde":
      return { type, contexte, n: entier(5, 8), p: 0 };
    case "bracelet":
      return { type, contexte, n: entier(5, 8), p: 0 };
  }
}

export const CATALOGUE_100: { id: Type100; label: string }[] = [
  { id: "arrangement", label: "Arrangement simple (podium, bureau, code à chiffres distincts)" },
  { id: "combinaison", label: "Combinaison simple (comité, cartes, garnitures, poignées de main)" },
  { id: "permutation", label: "Permutation simple (ranger, ordre de passage, photo)" },
  { id: "arrRep", label: "Arrangement avec répétition (code, mots, tirage avec remise)" },
  { id: "combRep", label: "Combinaison avec répétition (glaces, dominos, dés identiques)" },
  { id: "permRep", label: "Permutation avec répétition (mot, boules, groupes nommés)" },
  { id: "circulaire", label: "Permutation circulaire (table, ronde, bracelet)" },
];

export function construireAvecVariante100(id: string): Exercice100 {
  const v = CATALOGUE_100.find((x) => x.id === id);
  return tirer(v ? v.id : parmi(TYPES_100));
}

export function genererExercice100(): Exercice100 {
  return tirer(parmi(TYPES_100));
}
