import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { Exercice100, Phase100, Type100 } from "../core6e/quelleFormule";
import { estCollier, valeur100 } from "../core6e/quelleFormule";
import { arr, comb, fact, gamma } from "../ui6e/nombresCombinatoireLotH";
import { bonneOption100, nomType, raisons100 } from "../ui6e/formatQuelleFormule";
import { lireCompte, vautEntier } from "./lectureCombinatoireLotH";

/**
 * Vérification de `6gen100`. Choix fermés (oui / non, type) : une tentative, jugés par
 * `bonneOption100`, message propre (raison du contexte, confusion de types). Calcul : saisie lue
 * avant tout verdict (illisible → `parse_error`, aucune tentative), écriture exacte quelconque
 * (« 8!/5! », « 10^4 », « C(8 ; 3) », « 336 ») ; messages ciblés : formule d'un type voisin
 * (Aₙᵖ ↔ Cₙᵖ, nᵖ ↔ Aₙᵖ, Cₙᵖ ↔ Γₙᵖ, n! ↔ (n − 1)!, collier sans la division par 2, lettres
 * répétées non divisées).
 */

type E = Exercice100;
type P = Phase100;
const t = tx;
const l = lx;

export function diagnostiquer100(e: E, p: P, valeurs: string[]): StatutVerification[] {
  const v = valeurs[0] ?? "";
  if (p !== "calcul") return [v === bonneOption100(e, p) ? "correct" : "not_equivalent"];
  if (lireCompte(v) === null) return ["parse_error"];
  return [vautEntier(v, valeur100(e)) ? "correct" : "not_equivalent"];
}

const CONFUSIONS: Partial<Record<Type100, Partial<Record<Type100, string>>>> = {
  arrangement: { combinaison: "Une combinaison ignore l'ordre ; ici, échanger deux éléments choisis change le résultat.", arrRep: "Ici, un élément ne peut pas revenir : pas de répétition.", permutation: "On ne place pas tous les éléments : c'est un arrangement de p éléments parmi n." },
  combinaison: { arrangement: "Un arrangement tient compte de l'ordre ; ici, l'ordre des éléments choisis ne change rien.", combRep: "Ici, un même élément ne peut pas être choisi deux fois." },
  permutation: { circulaire: "Les éléments sont alignés, pas disposés en cercle : chaque place est repérée.", arrangement: "On place tous les éléments : c'est une permutation." },
  arrRep: { arrangement: "Ici, un élément peut revenir plusieurs fois : il y a répétition.", combRep: "Ici, l'ordre compte (on note un ordre)." },
  combRep: { combinaison: "Ici, un même élément peut être choisi plusieurs fois.", arrRep: "Ici, l'ordre ne compte pas." },
  permRep: { permutation: "Certains éléments sont identiques (ou un même groupe revient) : permuter deux éléments identiques ne donne rien de nouveau.", arrRep: "On utilise tous les éléments, chacun avec son nombre d'apparitions fixé." },
  circulaire: { permutation: "En cercle, seules les positions relatives comptent : tourner la disposition ne change rien." },
};

export function piege100(e: E, p: P, valeurs: string[]): Frag[] | null {
  const v = valeurs[0] ?? "";
  if (p === "ordre" || p === "repetition" || p === "tous") {
    if (v === bonneOption100(e, p)) return null;
    const r = raisons100(e);
    return [t(p === "ordre" ? r.ordre : p === "repetition" ? r.repetition : r.tous)];
  }
  if (p === "type") {
    if (v === e.type) return null;
    const m = CONFUSIONS[e.type]?.[v as Type100];
    return [t(`C'est : ${nomType(e.type)}. ${m ?? "Reprends tes trois réponses et la ligne du tableau qui leur correspond."}`)];
  }
  const r = lireCompte(v);
  if (r === null) return null;
  const attendu = valeur100(e);
  const cand: { valeur: number; message: Frag[] }[] = [];
  const { n, p: k } = e;
  if (e.type === "arrangement") {
    cand.push({ valeur: comb(n, k), message: [t("Tu as divisé par "), l(`${k}!`), t(" : c'est une combinaison, qui ignore l'ordre ; ici, l'ordre compte.")] });
    cand.push({ valeur: n ** k, message: [t("C'est "), l("n^p"), t(" : il autorise la répétition, impossible ici.")] });
  }
  if (e.type === "combinaison") {
    cand.push({ valeur: arr(n, k), message: [t("C'est "), l("A_n^p"), t(" : il compte chaque groupe une fois par ordre. Divise par "), l(`${k}!`), t(".")] });
    cand.push({ valeur: gamma(n, k), message: [t("C'est "), l("\\Gamma_n^p"), t(" : il autorise la répétition, impossible ici.")] });
  }
  if (e.type === "arrRep") {
    cand.push({ valeur: arr(n, k), message: [t("C'est "), l("A_n^p"), t(" : il interdit la répétition ; ici, un élément peut revenir.")] });
    cand.push({ valeur: k ** n, message: [t("Base et exposant inversés : le nombre de choix par position ("), l(`${n}`), t(") est élevé à la puissance du nombre de positions ("), l(`${k}`), t(").")] });
  }
  if (e.type === "combRep") {
    cand.push({ valeur: comb(n, k), message: [t("C'est "), l("C_n^p"), t(" : il interdit la répétition ; ici, un même élément peut être choisi plusieurs fois.")] });
    cand.push({ valeur: n ** k, message: [t("C'est "), l("n^p"), t(" : il tient compte de l'ordre, qui ne compte pas ici.")] });
    cand.push({ valeur: comb(n + k, k), message: [t("Le haut du "), l("C"), t(" vaut "), l("n+p-1"), t(", pas "), l("n+p"), t(".")] });
  }
  if (e.type === "permutation") cand.push({ valeur: fact(n - 1), message: [t("C'est "), l("(n-1)!"), t(" : réservé aux dispositions en cercle. Ici, les éléments sont alignés.")] });
  if (e.type === "permRep") cand.push({ valeur: fact(n), message: [t("C'est "), l("n!"), t(" : il compte comme différents des éléments identiques. Divise par les factorielles des effectifs répétés.")] });
  if (e.type === "circulaire") {
    cand.push({ valeur: fact(n), message: [t("En cercle, tourner la disposition ne change rien : on fixe un élément, il reste "), l("(n-1)!"), t(".")] });
    if (estCollier(e)) cand.push({ valeur: fact(n - 1), message: [t("Un bracelet peut aussi être retourné : divise encore par 2.")] });
    else cand.push({ valeur: fact(n - 1) / 2, message: [t("On ne divise par 2 que si la disposition peut être retournée (collier, bracelet) ; ici, non.")] });
  }
  for (const c of cand) if (c.valeur !== attendu && Math.abs(r - c.valeur) < 1e-9) return c.message;
  return null;
}
