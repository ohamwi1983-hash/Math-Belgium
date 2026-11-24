import type { Exercice160, Verdict160 } from "../core6e/independantsIncompatibles";
import { CONTEXTES_160, aEffectifs, probas160, produit160, pUnion160, verdictCalcule } from "../core6e/independantsIncompatibles";
import { evenementParId, issues, listeIssues, phraseEvenement, phraseUnivers } from "../core6e/evenements160";
import type { AideEcran, ChampEcran, Frag, OptionEcran } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { Q } from "./nombresExp";
import { decL, estDecimal, qL, qVal } from "./nombresExp";
import { tableauEffectifs, vennEffectifs } from "./figures160";

/**
 * Couche C — textes de `6gen160` « Indépendants ou incompatibles ? » : énoncé, consignes, champs,
 * options, aides à deux niveaux (propriété du cours, puis posée pour l'instance — jamais la
 * réponse), réponses. Source unique de l'écran, du papier et du corrigé. Notation du cours (§ 1) :
 * P(A), P(A ∩ B), P(A) × P(B), Ā.
 */

type E = Exercice160;
export type Phase160 = "probas" | "inter" | "produit" | "verdict";
const t = tx;
const l = lx;

export function phases160(e: E): Phase160[] {
  if (e.variante !== "valeurs") return ["probas", "inter", "produit", "verdict"];
  return e.donnee === "union" ? ["inter", "produit", "verdict"] : ["produit", "verdict"];
}

/** Écriture d'une probabilité : décimal dans la variante « valeurs » écrite en décimaux, sinon fraction réduite. */
export function ecr(e: E, x: Q): string {
  if (e.variante === "valeurs" && e.ecriture === "decimal" && estDecimal(qVal(x), 4)) return decL(qVal(x), 4);
  return qL(x);
}

export const surN = (k: number, N: number) => `\\dfrac{${k}}{${N}}`;

/** « 18/40 = 9/20 » (la fraction réduite seulement si elle diffère). */
export function fractionEtReduite(k: number, N: number, x: Q): string {
  const r = qL(x);
  return r === surN(k, N) ? r : `${surN(k, N)}=${r}`;
}

function article(un: string): string {
  return un.startsWith("une ") ? "une des" : "un des";
}

export function consigneGenerale(e: E): Frag[] {
  if (e.variante === "venn" || e.variante === "tableau") {
    const c = CONTEXTES_160[e.ctx];
    return [
      t(`On choisit au hasard ${article(c.un)} ${e.N} ${c.groupe}. On note `),
      l("A"),
      t(` l'événement « ${c.A} » et `),
      l("B"),
      t(` l'événement « ${c.B} ». ${e.variante === "venn" ? "Le diagramme de Venn" : "Le tableau"} ci-dessous donne les effectifs.`),
    ];
  }
  if (e.variante === "valeurs") {
    const p = probas160(e);
    const troisieme = e.donnee === "inter" ? l(`P(A\\cap B)=${ecr(e, p.pAB)}`) : l(`P(A\\cup B)=${ecr(e, pUnion160(e))}`);
    return [l("A"), t(" et "), l("B"), t(" sont deux événements tels que "), l(`P(A)=${ecr(e, p.pA)}`), t(", "), l(`P(B)=${ecr(e, p.pB)}`), t(" et "), troisieme, t(".")];
  }
  const A = evenementParId(e.univers, e.n, e.evA);
  const B = evenementParId(e.univers, e.n, e.evB);
  return [t(`${phraseUnivers(e.univers, e.n)} On note `), l("A"), t(` l'événement « ${phraseEvenement(e.univers, A)} » et `), l("B"), t(` l'événement « ${phraseEvenement(e.univers, B)} ».`)];
}

/** Figure de l'énoncé (écran et papier) : Venn ou tableau ; rien pour les deux autres variantes. */
export function figure160(e: E): string | null {
  if (e.variante === "venn") return vennEffectifs(e.nA - e.nAB, e.nAB, e.nB - e.nAB, e.N - e.nA - e.nB + e.nAB);
  if (e.variante === "tableau") return tableauEffectifs(e.N, e.nA, e.nB, e.nAB);
  return null;
}

export const CONSIGNE_PAPIER_160 = "Les événements A et B sont-ils indépendants, incompatibles, ou ni l'un ni l'autre ? Justifie par un calcul.";

export function consignePapier(): Frag[] {
  return [t("Les événements "), l("A"), t(" et "), l("B"), t(" sont-ils indépendants, incompatibles, ou ni l'un ni l'autre ? Justifie par un calcul.")];
}

export function libelle(_e: E, phase: Phase160): string {
  return phase === "probas" ? "P(A) et P(B)" : phase === "inter" ? "P(A ∩ B)" : phase === "produit" ? "P(A) × P(B)" : "Verdict";
}

export function consigne(e: E, phase: Phase160): Frag[] {
  if (phase === "probas") return [t("Calcule "), l("P(A)"), t(" et "), l("P(B)"), t(" (valeurs exactes).")];
  if (phase === "inter") return e.variante === "valeurs" ? [t("À partir des données, calcule "), l("P(A\\cap B)"), t(" (valeur exacte).")] : [t("Calcule "), l("P(A\\cap B)"), t(" (valeur exacte).")];
  if (phase === "produit") return [t("Calcule "), l("P(A)\\times P(B)"), t(" (valeur exacte).")];
  return [t("Les événements "), l("A"), t(" et "), l("B"), t(" sont-ils indépendants, incompatibles, ou ni l'un ni l'autre ?")];
}

const PH = "ex. : 3/20 ou 0,15";

export function champs(_e: E, phase: Phase160): ChampEcran[] {
  if (phase === "probas")
    return [
      { label: "P(A) =", labelLatex: "P(A)=", placeholder: PH },
      { label: "P(B) =", labelLatex: "P(B)=", placeholder: PH },
    ];
  if (phase === "inter") return [{ label: "P(A ∩ B) =", labelLatex: "P(A\\cap B)=", placeholder: PH }];
  return [{ label: "P(A) × P(B) =", labelLatex: "P(A)\\times P(B)=", placeholder: PH }];
}

export const LIBELLE_VERDICT: Record<Verdict160, string> = {
  independants: "A et B sont indépendants",
  incompatibles: "A et B sont incompatibles",
  ni: "Ni l'un ni l'autre",
};

export function options(): OptionEcran[] {
  return [
    { id: "independants", fragments: [l("A"), t(" et "), l("B"), t(" sont indépendants")] },
    { id: "incompatibles", fragments: [l("A"), t(" et "), l("B"), t(" sont incompatibles")] },
    { id: "ni", fragments: [t("Ni l'un ni l'autre")] },
  ];
}

export function reponse(e: E, phase: Phase160): Frag[] {
  const p = probas160(e);
  if (phase === "probas") return [l(`P(A)=${ecr(e, p.pA)}`), t(" et "), l(`P(B)=${ecr(e, p.pB)}`)];
  if (phase === "inter") return [l(`P(A\\cap B)=${ecr(e, p.pAB)}`)];
  if (phase === "produit") return [l(`P(A)\\times P(B)=${ecr(e, produit160(e))}`)];
  return options().find((o) => o.id === verdictCalcule(e))!.fragments;
}

export const recap = reponse;

export function messageIllisible(): string {
  return "Je n'arrive pas à lire ta réponse (exemples d'écritures : 3/20, 0,15, 15 %). Cela ne compte pas comme une tentative.";
}

// ============================================================================
// Aides.
// ============================================================================

/** Issues de A, de B, de A ∩ B (variante contexte). */
export function ensemblesContexte(e: Extract<E, { variante: "contexte" }>) {
  const om = issues(e.univers, e.n);
  const A = evenementParId(e.univers, e.n, e.evA);
  const B = evenementParId(e.univers, e.n, e.evB);
  return { om, A, B, xA: om.filter(A.test), xB: om.filter(B.test), xAB: om.filter((x) => A.test(x) && B.test(x)) };
}

export function aide1(e: E, phase: Phase160): AideEcran {
  if (phase === "probas") return { texte: [t("Issues équiprobables (cours, § 1) : on divise le nombre de cas favorables par le nombre de cas possibles :")], latex: "P(A)=\\dfrac{n(A)}{n(\\Omega)}" };
  if (phase === "inter") {
    if (e.variante === "valeurs") return { texte: [t("Formule d'addition (cours, § 1), à retourner pour isoler "), l("P(A\\cap B)"), t(" :")], latex: "P(A\\cup B)=P(A)+P(B)-P(A\\cap B)" };
    return { texte: [l("A\\cap B"), t(" est réalisé quand "), l("A"), t(" et "), l("B"), t(" le sont en même temps (cours, § 1) :")], latex: "P(A\\cap B)=\\dfrac{n(A\\cap B)}{n(\\Omega)}" };
  }
  if (phase === "produit") return { texte: [t("Pour tester l'indépendance (cours, § 1), on compare "), l("P(A\\cap B)"), t(" au produit :")], latex: "P(A)\\times P(B)" };
  return {
    texte: [
      t("Incompatibles : "),
      l("A\\cap B=\\emptyset"),
      t(", donc "),
      l("P(A\\cap B)=0"),
      t(". Indépendants : "),
      l("P(A\\cap B)=P(A)\\times P(B)"),
      t(" (cours, § 1). Si aucune des deux égalités n'est vraie : ni l'un ni l'autre."),
    ],
  };
}

export function aide2(e: E, phase: Phase160): AideEcran | null {
  const p = probas160(e);
  if (phase === "probas") {
    if (e.variante === "venn")
      return { texte: [l("A"), t(" est tout le disque "), l("A"), t(", partie commune comprise ; l'effectif total est "), l(`${e.N}`), t(" :")], latex: `n(A)=${e.nA - e.nAB}+${e.nAB}\\qquad n(B)=${e.nB - e.nAB}+${e.nAB}` };
    if (e.variante === "tableau") return { texte: [l("n(A)"), t(" est le total de la ligne de "), l("A"), t(", "), l("n(B)"), t(" celui de la colonne de "), l("B"), t(", et "), l("n(\\Omega)"), t(" le total général, en bas à droite.")] };
    if (e.variante === "contexte") {
      const s = ensemblesContexte(e);
      const dire = (nom: string, xs: typeof s.xA, pl: string) => {
        const liste = listeIssues(xs);
        return liste && typeof xs[0] === "number" ? [l(nom), t(` = {${liste}}`)] : [l(nom), t(` : ${pl}`)];
      };
      return { texte: [...dire("A", s.xA, s.A.pluriel), t(" ; "), ...dire("B", s.xB, s.B.pluriel), t(`. Compte-les parmi les ${e.N} issues équiprobables.`)] };
    }
    return null;
  }
  if (phase === "inter") {
    if (e.variante === "valeurs") return { texte: [t("Isole "), l("P(A\\cap B)"), t(" et remplace :")], latex: `P(A\\cap B)=P(A)+P(B)-P(A\\cup B)=${ecr(e, p.pA)}+${ecr(e, p.pB)}-${ecr(e, pUnion160(e))}` };
    if (e.variante === "venn") return { texte: [t("C'est la partie commune aux deux disques, rapportée à l'effectif total "), l(`${e.N}`), t(".")] };
    if (e.variante === "tableau") return { texte: [t("C'est la case à la croisée de la ligne "), l("A"), t(" et de la colonne "), l("B"), t(", divisée par le total général — pas par le total d'une ligne.")] };
    const s = ensemblesContexte(e);
    return { texte: [t("Cherche les issues qui sont à la fois dans "), l("A"), t(` (${s.A.pluriel}) et dans `), l("B"), t(` (${s.B.pluriel}).`)] };
  }
  if (phase === "produit") return { texte: [t("Multiplie les deux probabilités :")], latex: `P(A)\\times P(B)=${ecr(e, p.pA)}\\times ${ecr(e, p.pB)}` };
  return { texte: [t("Compare les résultats des étapes précédentes :")], latex: `P(A\\cap B)=${ecr(e, p.pAB)}\\qquad P(A)\\times P(B)=${ecr(e, produit160(e))}` };
}

export function explicationChoix(): string {
  return "Incompatibles : P(A ∩ B) = 0. Indépendants : P(A ∩ B) = P(A) × P(B), égalité exacte. Sinon : ni l'un ni l'autre.";
}

/** Données de l'instance en une ligne (réponse brève, corrigé). */
export function syntheseVerdict(e: E): Frag[] {
  const p = probas160(e);
  return [l(`P(A\\cap B)=${ecr(e, p.pAB)}`), t(" et "), l(`P(A)\\times P(B)=${ecr(e, produit160(e))}`), t(" : "), ...reponse(e, "verdict")];
}

export const avecEffectifs = aEffectifs;
