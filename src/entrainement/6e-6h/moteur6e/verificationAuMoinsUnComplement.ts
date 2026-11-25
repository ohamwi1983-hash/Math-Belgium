import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { ExerciceAMU, PhaseAMU, StrategieAMU } from "../core6e/auMoinsUnComplement";
import { N, resultat, strategieJuste, termes, valeurImposer } from "../core6e/auMoinsUnComplement";
import { A, C, entL } from "../ui6e/nombresCombinatoireLotH2";
import { lireRationnel, ratVal } from "./lectureCombinatoireLotH2";

/**
 * Vérification de `6gen105`. Écran 1 : identifiant de la stratégie (choix fermé, une tentative).
 * Écrans 2 et 3 : la saisie est LUE avant tout verdict (illisible → `parse_error`, aucune tentative) :
 * nombre (espaces de milliers), « C(13,4) », « C_13^4 », « 13C4 », « 13!/(4!·9!) », sommes et
 * produits — valeur EXACTE (entier). Une écriture décimale n'est jamais un dénombrement : message,
 * aucune tentative. Messages ciblés : arrangement au lieu de combinaison, mauvais groupe « sans … »,
 * stratégie « imposer puis compléter » (comptes multiples), somme au lieu de différence ou de produit.
 */

type E = ExerciceAMU;
type P = PhaseAMU;
const t = tx;
const l = lx;

export function messageIllisible(): string {
  return "Nombre non reconnu : écris un entier (par exemple 715) ou un calcul comme C(13,4) − C(8,4). Cette saisie ne compte pas comme une tentative.";
}

function lire(v: string): number | null {
  const r = lireRationnel(v);
  return r === null ? null : ratVal(r);
}
const egal = (a: number, b: number) => Math.abs(a - b) < 1e-6;

export function diagnostiquer(e: E, p: P, valeurs: string[]): StatutVerification[] {
  if (p === "strategie") return [valeurs[0] === strategieJuste(e) ? "correct" : "not_equivalent"];
  const attendus = p === "termes" ? termes(e) : [resultat(e)];
  return attendus.map((x, i) => {
    const v = lire(valeurs[i] ?? "");
    if (v === null) return "parse_error";
    return egal(v, x) ? "correct" : "not_equivalent";
  });
}

/** Une saisie décimale non entière n'est pas un nombre de groupes : message, aucune tentative. */
export function approchee(_e: E, p: P, valeurs: string[]): string | null {
  if (p === "strategie") return null;
  for (const v of valeurs) {
    const x = lire(v ?? "");
    if (x !== null && Math.abs(x - Math.round(x)) > 1e-9) return "Un nombre de groupes est un entier : vérifie ton calcul (une combinaison se calcule exactement, sans arrondi). Cette saisie ne compte pas comme une tentative.";
  }
  return null;
}

function messageStrategie(e: E, choisi: StrategieAMU): Frag[] | null {
  const juste = strategieJuste(e);
  if (choisi === juste) return null;
  if (choisi === "imposer")
    return [t("Imposer un élément puis compléter librement compte plusieurs fois un même groupe : un groupe qui contient deux éléments de cette sorte est compté une fois pour chacun d'eux (le résultat serait "), l(entL(valeurImposer(e))), t(").")];
  if (juste === "complement" && choisi === "somme") return [t("Séparer « au moins un » en cas demande un cas par nombre possible (un, deux, trois…) : le contraire « aucun » se calcule en une seule fois.")];
  if (juste === "somme" && choisi === "complement") return [t("Le contraire de « au plus un » est « au moins deux », qui regroupe lui-même plusieurs cas : il est plus court d'additionner « aucun » et « exactement un ».")];
  if (choisi === "direct") return [t("Le nombre d'éléments de cette sorte n'est pas imposé : un seul produit ne compte qu'un des cas possibles.")];
  return [t("Le nombre d'éléments de chaque sorte est imposé : il n'y a qu'un cas, qui se compte par un seul produit.")];
}

/** Valeurs fausses typiques d'un champ et leur message (jamais la réponse). */
function erreursTermes(e: E, i: number): { valeur: number; message: Frag[] }[] {
  const r: { valeur: number; message: Frag[] }[] = [];
  const s = strategieJuste(e);
  const ordre: Frag[] = [t("L'ordre ne compte pas dans un groupe : c'est une combinaison, pas un arrangement.")];
  if (s === "complement") {
    if (i === 0) {
      r.push({ valeur: A(N(e), e.k), message: ordre });
      r.push({ valeur: N(e) ** e.k, message: [t("Pas de répétition : un même élément ne peut pas être choisi deux fois.")] });
    } else {
      r.push({ valeur: C(e.a, e.k), message: [t("Sans aucun élément de la sorte demandée, le groupe est entièrement choisi parmi les autres éléments.")] });
      r.push({ valeur: A(e.b, e.k), message: ordre });
    }
  } else if (s === "somme") {
    if (i === 0) {
      r.push({ valeur: C(e.a, e.k), message: [t("Sans aucun élément de la sorte demandée, le groupe est entièrement choisi parmi les autres éléments.")] });
      r.push({ valeur: A(e.b, e.k), message: ordre });
    } else {
      r.push({ valeur: C(e.b, e.k - 1), message: [t("Il faut aussi choisir quel élément de la sorte demandée fait partie du groupe : "), l(`${e.a}`), t(" choix, à multiplier.")] });
      r.push({ valeur: e.a * C(N(e) - 1, e.k - 1), message: [t("Les autres membres doivent être choisis parmi les éléments de l'autre sorte seulement, sinon le groupe pourrait en contenir plusieurs.")] });
    }
  } else {
    if (i === 0) r.push({ valeur: A(e.a, e.j), message: ordre });
    else {
      r.push({ valeur: A(e.b, e.k - e.j), message: ordre });
      r.push({ valeur: C(N(e) - e.j, e.k - e.j), message: [t("Les autres membres sont choisis parmi les éléments de l'autre sorte seulement (sinon le nombre exact ne serait plus respecté).")] });
    }
  }
  return r;
}

function erreursResultat(e: E): { valeur: number; message: Frag[] }[] {
  const [t1, t2] = termes(e);
  const s = strategieJuste(e);
  const r: { valeur: number; message: Frag[] }[] = [];
  if (s === "complement") {
    r.push({ valeur: valeurImposer(e), message: messageStrategie(e, "imposer")! });
    r.push({ valeur: t1 + t2, message: [t("Le contraire se retire du total.")] });
    r.push({ valeur: t2, message: [t("C'est le nombre de groupes sans aucun élément de la sorte demandée : il reste à le retirer du total.")] });
    r.push({ valeur: t1 - C(e.a, e.k), message: [t("Tu as retiré les groupes sans aucun élément de l'autre sorte.")] });
  } else if (s === "somme") {
    r.push({ valeur: t1 - t2, message: [t("Les deux cas s'additionnent : ils ne se chevauchent pas et forment ensemble « au plus un ».")] });
    r.push({ valeur: C(N(e), e.k) - C(e.b, e.k), message: [t("C'est le nombre de groupes qui en contiennent au moins un ; on demande au plus un.")] });
  } else {
    r.push({ valeur: t1 + t2, message: [t("Chaque choix de la première sorte se combine avec chaque choix de l'autre : on multiplie, on n'additionne pas.")] });
    r.push({ valeur: A(e.a, e.j) * A(e.b, e.k - e.j), message: [t("L'ordre ne compte pas dans un groupe : ce sont des combinaisons.")] });
  }
  r.push({ valeur: C(N(e), e.k), message: [t("C'est le nombre de tous les groupes, sans tenir compte de la condition.")] });
  return r;
}

export function piege(e: E, p: P, valeurs: string[]): Frag[] | null {
  if (p === "strategie") return messageStrategie(e, valeurs[0] as StrategieAMU);
  const attendus = p === "termes" ? termes(e) : [resultat(e)];
  for (let i = 0; i < attendus.length; i++) {
    const v = lire(valeurs[i] ?? "");
    if (v === null || egal(v, attendus[i]!)) continue;
    const liste = p === "termes" ? erreursTermes(e, i) : erreursResultat(e);
    for (const x of liste) if (!egal(x.valeur, attendus[i]!) && egal(v, x.valeur)) return x.message;
    if (p === "termes" && attendus.length === 2 && egal(v, attendus[1 - i]!)) return [t("Les deux nombres sont inversés : relis l'étiquette de chaque champ.")];
  }
  return null;
}
