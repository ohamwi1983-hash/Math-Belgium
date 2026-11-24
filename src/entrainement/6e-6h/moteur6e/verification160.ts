import type { Exercice160 } from "../core6e/independantsIncompatibles";
import { probas160, produit160, pUnion160, verdictCalcule } from "../core6e/independantsIncompatibles";
import type { StatutVerification } from "../moteur/statutVerification";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { Phase160 } from "../ui6e/format160";
import { qVal } from "../ui6e/nombresExp";
import { MESSAGE_APPROCHEE_PROBA, probabiliteApprochee, statutProbabilite, vaut } from "./lectureProbaLotG";

/**
 * Vérification de `6gen160` : probabilités comparées NUMÉRIQUEMENT à la valeur exacte (toute
 * écriture exacte acceptée : 9/20, 18/40, 0,45, 45 %) ; valeur décimale approchée arrêtée par un
 * message SANS tentative ; verdict (choix fermé) comparé au verdict RECALCULÉ depuis les nombres.
 * Messages ciblés : région « A seulement » prise pour A (Venn), case intérieure prise pour un total
 * (tableau), probabilité conditionnelle au lieu de P(A ∩ B), indépendance supposée, somme au lieu
 * du produit, signe de la formule d'addition, et le piège central « incompatibles ⇒ indépendants ».
 */

type E = Exercice160;
const t = tx;
const l = lx;

export function attendus(e: E, phase: Phase160): number[] {
  const p = probas160(e);
  if (phase === "probas") return [qVal(p.pA), qVal(p.pB)];
  if (phase === "inter") return [qVal(p.pAB)];
  if (phase === "produit") return [qVal(produit160(e))];
  return [];
}

export function diagnostiquer(e: E, phase: Phase160, valeurs: string[]): StatutVerification[] {
  if (phase === "verdict") return [valeurs[0] === verdictCalcule(e) ? "correct" : "not_equivalent"];
  return attendus(e, phase).map((v, i) => statutProbabilite(valeurs[i] ?? "", v));
}

export function approchee(e: E, phase: Phase160, valeurs: string[]): string | null {
  if (phase === "verdict") return null;
  const att = attendus(e, phase);
  return att.some((v, i) => probabiliteApprochee(valeurs[i] ?? "", v)) ? MESSAGE_APPROCHEE_PROBA : null;
}

export function piege(e: E, phase: Phase160, valeurs: string[]): Frag[] | null {
  const p = probas160(e);
  const pA = qVal(p.pA);
  const pB = qVal(p.pB);
  const pAB = qVal(p.pAB);
  const prod = pA * pB;
  if (phase === "verdict") {
    const juste = verdictCalcule(e);
    const choix = valeurs[0];
    if (juste === "incompatibles" && choix === "independants")
      return [t("Incompatibles ne veut pas dire indépendants : "), l("P(A\\cap B)=0"), t(" alors que "), l("P(A)\\times P(B)>0"), t(" — l'égalité de l'indépendance échoue toujours quand "), l("P(A)"), t(" et "), l("P(B)"), t(" ne sont pas nulles.")];
    if (juste === "independants" && choix === "incompatibles") return [t("Ici "), l("P(A\\cap B)\\neq 0"), t(" : "), l("A"), t(" et "), l("B"), t(" peuvent se produire ensemble, ils ne sont pas incompatibles.")];
    if (juste === "independants") return [t("L'égalité "), l("P(A\\cap B)=P(A)\\times P(B)"), t(" est vraie : c'est exactement la définition de l'indépendance.")];
    if (juste === "incompatibles") return [l("P(A\\cap B)=0"), t(" : "), l("A"), t(" et "), l("B"), t(" ne peuvent jamais se produire ensemble.")];
    if (choix === "independants") return [l("P(A\\cap B)"), t(" et "), l("P(A)\\times P(B)"), t(" sont proches mais différents : l'indépendance demande une égalité exacte.")];
    return [l("P(A\\cap B)\\neq 0"), t(" : il existe des issues dans "), l("A"), t(" et dans "), l("B"), t(" à la fois.")];
  }
  const s0 = valeurs[0] ?? "";
  if (phase === "probas") {
    const s1 = valeurs[1] ?? "";
    // Une valeur piège n'est retenue que si elle diffère de la bonne réponse de CE champ.
    const pA0 = (x: number) => Math.abs(x - pA) > 1e-12 && vaut(s0, x);
    const pB1 = (x: number) => Math.abs(x - pB) > 1e-12 && vaut(s1, x);
    if (e.variante === "venn") {
      if (e.nAB > 0 && (pA0((e.nA - e.nAB) / e.N) || pB1((e.nB - e.nAB) / e.N))) return [t("Un événement est tout son disque : ajoute la partie commune aux deux disques.")];
      if (pA0(e.nA / (e.N - (e.N - e.nA - e.nB + e.nAB)))) return [t("Divise par l'effectif total "), l(`${e.N}`), t(", ceux qui sont hors des disques compris.")];
    }
    if (e.variante === "tableau" && e.nAB > 0 && (pA0(e.nAB / e.N) || pB1(e.nAB / e.N))) return [t("Ce nombre est celui de "), l("A\\cap B"), t(" : "), l("P(A)"), t(" se lit sur le total de la ligne "), l("A"), t(".")];
    if (e.variante === "contexte" && e.nAB > 0 && (pA0(e.nAB / e.N) || pB1(e.nAB / e.N))) return [t("Compte toutes les issues de l'événement, pas seulement celles qu'il partage avec l'autre.")];
    return null;
  }
  if (phase === "inter") {
    if (pAB !== prod && vaut(s0, prod)) return [t("Ne suppose pas l'indépendance : c'est justement ce qu'on veut vérifier. "), ...(e.variante === "valeurs" ? [t("Utilise la formule d'addition.")] : [t("Compte les issues de "), l("A\\cap B"), t(".")])];
    if (e.variante === "valeurs") {
      const u = qVal(pUnion160(e));
      if (vaut(s0, u - pA - pB)) return [t("Attention au signe : "), l("P(A\\cap B)=P(A)+P(B)-P(A\\cup B)"), t(".")];
      if (vaut(s0, pA + pB)) return [t("C'est la somme "), l("P(A)+P(B)"), t(" : il reste à retirer "), l("P(A\\cup B)"), t(".")];
      return null;
    }
    if (e.nAB > 0 && (vaut(s0, e.nAB / e.nA) || vaut(s0, e.nAB / e.nB))) return [t("Tu as divisé par l'effectif de "), l("A"), t(" ou de "), l("B"), t(" : c'est une probabilité conditionnelle. "), l("P(A\\cap B)"), t(" se rapporte à l'effectif total.")];
    if (e.nAB > 0 && vaut(s0, e.nAB / (e.nA + e.nB - e.nAB))) return [t("Divise par l'effectif total, pas par celui de "), l("A\\cup B"), t(".")];
    return null;
  }
  if (vaut(s0, pA + pB)) return [t("C'est le produit qu'il faut calculer, pas la somme.")];
  if (pAB !== prod && vaut(s0, pAB)) return [t("Tu as recopié "), l("P(A\\cap B)"), t(" : calcule le produit des deux probabilités, puis compare.")];
  return null;
}
