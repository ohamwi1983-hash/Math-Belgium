import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { ExerciceChemins, PhaseChemins } from "../core6e/cheminsQuadrillage";
import { apresP, avantP, parP, totalAB, valeursAttendues } from "../core6e/cheminsQuadrillage";
import { A, C, fact } from "../ui6e/nombresCombinatoireLotH2";
import { lireRationnel, ratVal } from "./lectureCombinatoireLotH2";

/**
 * Vérification de `6gen106`. La saisie est LUE avant tout verdict (illisible → `parse_error`, aucune
 * tentative) : entier (espaces de milliers), « C(8,3) », « C_8^3 », « 8C3 », « 8!/(3!·5!) », produits
 * et différences — valeur EXACTE. Un décimal non entier n'est pas un nombre de chemins : message, aucune
 * tentative. Messages ciblés : 2ᵐ⁺ⁿ (chaque déplacement « libre »), (m + n)! (déplacements de même
 * sorte non identifiés), arrangement, cases au lieu de pas, somme au lieu du produit, chemins par P
 * oubliés ou mal retirés.
 */

type E = ExerciceChemins;
type P = PhaseChemins;
const t = tx;
const l = lx;

export function messageIllisible(): string {
  return "Nombre non reconnu : écris un entier (par exemple 56) ou un calcul comme C(8,3). Cette saisie ne compte pas comme une tentative.";
}

function lire(v: string): number | null {
  const r = lireRationnel(v);
  return r === null ? null : ratVal(r);
}
const egal = (a: number, b: number) => Math.abs(a - b) < 1e-6;

export function diagnostiquer(e: E, p: P, valeurs: string[]): StatutVerification[] {
  return valeursAttendues(e, p).map((x, i) => {
    const v = lire(valeurs[i] ?? "");
    if (v === null) return "parse_error";
    return egal(v, x) ? "correct" : "not_equivalent";
  });
}

export function approchee(_e: E, _p: P, valeurs: string[]): string | null {
  for (const v of valeurs) {
    const x = lire(v ?? "");
    if (x !== null && Math.abs(x - Math.round(x)) > 1e-9) return "Un nombre de chemins (ou de déplacements) est un entier : vérifie ton calcul. Cette saisie ne compte pas comme une tentative.";
  }
  return null;
}

/** Erreurs typiques d'un comptage de chemins avec a pas « → » et b pas « ↑ ». */
function erreursComptage(a: number, b: number): { valeur: number; message: Frag[] }[] {
  return [
    { valeur: 2 ** (a + b), message: [t("Les déplacements ne sont pas libres : il y a exactement "), l(`${a}`), t(" pas vers la droite et "), l(`${b}`), t(" vers le haut. On choisit seulement leurs places.")] },
    { valeur: fact(a + b), message: [t("Deux flèches de même sorte sont identiques : échanger deux flèches vers le haut donne le même chemin. On choisit les places, c'est une combinaison.")] },
    { valeur: A(a + b, b), message: [t("L'ordre dans lequel on choisit les places des flèches vers le haut ne compte pas : combinaison, pas arrangement.")] },
    { valeur: C(Math.max(a + b - 2, 0), Math.max(b - 1, 0)), message: [t("Compte les pas entre les nœuds (les traits), pas les carreaux ni les nœuds.")] },
    { valeur: a * b, message: [t("On compte des chemins, pas des carreaux : choisis les places des flèches vers le haut parmi tous les déplacements.")] },
    { valeur: a + b, message: [t("C'est le nombre de déplacements d'un chemin ; on demande combien de chemins différents existent.")] },
  ];
}

function erreurs(e: E, p: P): { valeur: number; message: Frag[] }[] {
  switch (p) {
    case "pas":
      return [];
    case "avantP":
      return erreursComptage(e.px, e.py);
    case "apresP":
      return erreursComptage(e.m - e.px, e.n - e.py);
    case "total":
      return erreursComptage(e.m, e.n);
    case "parP":
      return [
        { valeur: avantP(e) + apresP(e), message: [t("Chaque chemin de A à P se prolonge par chacun des chemins de P à B : on multiplie, on n'additionne pas.")] },
        { valeur: avantP(e), message: [t("Ce sont seulement les chemins de A à P : il faut encore aller de P à B.")] },
        { valeur: apresP(e), message: [t("Ce sont seulement les chemins de P à B : il faut d'abord aller de A à P.")] },
      ];
    case "chemins":
      if (e.variante === "total") return erreursComptage(e.m, e.n);
      if (e.variante === "passage")
        return [
          { valeur: avantP(e) + apresP(e), message: [t("Chaque chemin de A à P se prolonge par chacun des chemins de P à B : on multiplie, on n'additionne pas.")] },
          { valeur: totalAB(e), message: [t("C'est le nombre de tous les chemins de A à B, qu'ils passent par P ou non.")] },
        ];
      return [
        { valeur: parP(e), message: [t("Ce sont les chemins qui passent par P ; on demande ceux qui l'évitent.")] },
        { valeur: totalAB(e) + parP(e), message: [t("Les chemins par P se retirent du total.")] },
        { valeur: totalAB(e) - avantP(e) - apresP(e), message: [t("Le nombre de chemins par P est un produit (A → P puis P → B), pas une somme.")] },
        { valeur: totalAB(e) - 1, message: [t("Plusieurs chemins passent par P, pas un seul : calcule leur nombre (A → P puis P → B).")] },
        { valeur: totalAB(e), message: [t("C'est le nombre de tous les chemins : retire ceux qui passent par P.")] },
      ];
  }
}

export function piege(e: E, p: P, valeurs: string[]): Frag[] | null {
  const attendus = valeursAttendues(e, p);
  if (p === "pas") {
    const v0 = lire(valeurs[0] ?? "");
    const v1 = lire(valeurs[1] ?? "");
    if (v1 !== null && !egal(v1, e.n) && egal(v1, e.m)) return [t("Ce nombre-là est celui des déplacements vers la droite : relis l'étiquette du champ.")];
    if (v0 !== null && !egal(v0, e.m + e.n) && egal(v0, (e.m + 1) * (e.n + 1))) return [t("C'est le nombre de nœuds ; on compte les déplacements d'un nœud au suivant.")];
    if (v0 !== null && !egal(v0, e.m + e.n) && egal(v0, e.m * e.n)) return [t("C'est le nombre de carreaux ; un chemin le plus court fait des pas vers la droite et des pas vers le haut, dans un ordre quelconque : additionne-les.")];
    return null;
  }
  const v = lire(valeurs[0] ?? "");
  if (v === null || egal(v, attendus[0]!)) return null;
  for (const x of erreurs(e, p)) if (!egal(x.valeur, attendus[0]!) && egal(v, x.valeur)) return x.message;
  return null;
}
