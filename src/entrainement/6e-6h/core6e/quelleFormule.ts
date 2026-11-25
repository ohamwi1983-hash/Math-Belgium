import { arr, comb, fact, gamma, multinomiale } from "../ui6e/nombresCombinatoireLotH";

/**
 * Couche A — modèle de `6gen100` « Quelle formule ? Reconnaître le groupement » (6e ch. 7, § 1).
 * Le TYPE de groupement est le verdict : tiré à parts égales AVANT le contexte et les nombres. Les
 * réponses aux trois questions du cours (ordre ? répétition ? tous utilisés ?) découlent du type ;
 * la troisième n'est posée que si l'ordre compte (méthode du cours).
 */

export type Type100 = "arrangement" | "combinaison" | "permutation" | "arrRep" | "combRep" | "permRep" | "circulaire";
export type Phase100 = "ordre" | "repetition" | "tous" | "type" | "calcul";

export const TYPES_100: Type100[] = ["arrangement", "combinaison", "permutation", "arrRep", "combRep", "permRep", "circulaire"];

export type Contexte100 =
  | "podium"
  | "bureau"
  | "codeDistinct"
  | "comite"
  | "cartes"
  | "pizza"
  | "poignees"
  | "livres"
  | "oral"
  | "photo"
  | "pin"
  | "motsLettres"
  | "urneRemise"
  | "glaces"
  | "dominos"
  | "desIdentiques"
  | "mot"
  | "boules"
  | "groupes"
  | "saison"
  | "table"
  | "bracelet"
  | "ronde";

export interface Exercice100 {
  type: Type100;
  contexte: Contexte100;
  n: number;
  p: number;
  /** Permutation avec répétition : effectifs des éléments identiques (somme n). */
  effectifs?: number[];
  /** Mot dont on permute les lettres (contexte `mot`). */
  mot?: string;
}

export const REPONSES_100: Record<Type100, { ordre: boolean; repetition: boolean; tous: boolean | null }> = {
  arrangement: { ordre: true, repetition: false, tous: false },
  combinaison: { ordre: false, repetition: false, tous: null },
  permutation: { ordre: true, repetition: false, tous: true },
  arrRep: { ordre: true, repetition: true, tous: false },
  combRep: { ordre: false, repetition: true, tous: null },
  permRep: { ordre: true, repetition: true, tous: true },
  circulaire: { ordre: true, repetition: false, tous: true },
};

export function phases100(e: Exercice100): Phase100[] {
  return REPONSES_100[e.type].ordre ? ["ordre", "repetition", "tous", "type", "calcul"] : ["ordre", "repetition", "type", "calcul"];
}

export const estCollier = (e: Exercice100) => e.contexte === "bracelet";

export function valeur100(e: Exercice100): number {
  switch (e.type) {
    case "arrangement":
      return arr(e.n, e.p);
    case "combinaison":
      return comb(e.n, e.p);
    case "permutation":
      return fact(e.n);
    case "arrRep":
      return e.n ** e.p;
    case "combRep":
      return gamma(e.n, e.p);
    case "permRep":
      return multinomiale(e.n, e.effectifs ?? []);
    case "circulaire":
      return estCollier(e) ? fact(e.n - 1) / 2 : fact(e.n - 1);
  }
}
