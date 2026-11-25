import { VOYELLES, lettresDuMot } from "./motsLotH";
import { fact, multinomiale } from "../ui6e/nombresCombinatoireLotH";

/**
 * Couche A — modèle de `6gen103` « Anagrammes et contraintes » (6e ch. 7, § 2). Mots réels à lettres
 * répétées ; permutations distinctes n!/(n₁!·n₂!…) ; contraintes : anagrammes (le mot lui-même
 * retiré : − 1), commence par une lettre (on la fixe), voyelles groupées (un bloc : ordre interne ×
 * ordre du bloc avec les consonnes), deux lettres identiques jamais côte à côte (complément : total −
 * mots où elles sont collées).
 */

export type Variante103 = "anagrammes" | "commencePar" | "bloc" | "jamaisCote";
export type Phase103 = "total" | "anagrammes" | "fixe" | "interne" | "externe" | "produit" | "collees" | "jamais";

export interface Exercice103 {
  variante: Variante103;
  mot: string;
  /** Lettre imposée (commence par) ou lettre doublée (jamais côte à côte). */
  lettre?: string;
}

export function phases103(e: Exercice103): Phase103[] {
  switch (e.variante) {
    case "anagrammes":
      return ["total", "anagrammes"];
    case "commencePar":
      return ["total", "fixe"];
    case "bloc":
      return ["interne", "externe", "produit"];
    case "jamaisCote":
      return ["total", "collees", "jamais"];
  }
}

export const effectifs = (mot: string) => lettresDuMot(mot).map((l) => l.nb);
export const totalPermutations = (mot: string) => multinomiale(mot.length, effectifs(mot));

export const voyellesDe = (mot: string) => [...mot].filter((c) => VOYELLES.has(c)).join("");
export const consonnesDe = (mot: string) => [...mot].filter((c) => !VOYELLES.has(c)).join("");

/** Mot privé d'une occurrence de la lettre (première lettre fixée). */
export function sansUne(mot: string, lettre: string): string {
  const i = mot.indexOf(lettre);
  return mot.slice(0, i) + mot.slice(i + 1);
}

export const nbOccurrences = (mot: string, lettre: string) => [...mot].filter((c) => c === lettre).length;

export function valeur103(e: Exercice103, p: Phase103): number {
  const m = e.mot;
  switch (p) {
    case "total":
      return totalPermutations(m);
    case "anagrammes":
      return totalPermutations(m) - 1;
    case "fixe":
      return totalPermutations(sansUne(m, e.lettre!));
    case "interne":
      return totalPermutations(voyellesDe(m));
    case "externe":
      return multinomiale(consonnesDe(m).length + 1, effectifs(consonnesDe(m)));
    case "produit":
      return valeur103(e, "interne") * valeur103(e, "externe");
    case "collees":
      // Les deux lettres identiques collées forment un seul « super-symbole » : n − 1 symboles.
      return multinomiale(m.length - 1, effectifsCollees(m, e.lettre!));
    case "jamais":
      return totalPermutations(m) - valeur103(e, "collees");
  }
}

/** Symboles du mot quand les deux lettres doublées sont collées (la paire compte comme un symbole). */
export function effectifsCollees(mot: string, lettre: string): number[] {
  return lettresDuMot(mot).map((l) => (l.lettre === lettre ? 1 : l.nb));
}

export const factorielle = fact;
