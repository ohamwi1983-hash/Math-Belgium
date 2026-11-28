import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, lettreEtape, ligne, piege, resultat, utilise } from "../../../export/corrigeTableau";
import type { Exercice160 } from "../../core6e/independantsIncompatibles";
import { probas160, produit160, pUnion160, verdictCalcule } from "../../core6e/independantsIncompatibles";
import { listeIssues } from "../../core6e/evenements160";
import { lx, tx } from "../../../5e-4h/ui5e/ecransTrigo.types";
import type { Frag } from "../../../5e-4h/ui5e/ecransTrigo.types";
import type { Phase160 } from "../../ui6e/format160";
import { ecr, ensemblesContexte, fractionEtReduite, phases160, reponse } from "../../ui6e/format160";

/**
 * Corrigé détaillé « comme au tableau » de `6gen160`, une lettre par écran (`phases160`) :
 * P(A) et P(B) (régions additionnées, totaux lus, issues comptées), P(A ∩ B) (partie commune, case,
 * issues communes, ou formule d'addition retournée), P(A) × P(B), puis le verdict justifié par les
 * DEUX tests (A ∩ B vide ? égalité du produit ?). Même source que l'écran.
 */

type E = Exercice160;
const fr = (f: Frag[]): FragmentConsigne[] => f as FragmentConsigne[];
const t = tx;
const l = lx;

function lignesProbas(e: E): { u: Frag[]; lignes: LigneCalcul[] } {
  const p = probas160(e);
  if (e.variante === "venn")
    return {
      u: [t("Issues équiprobables (cours, point 1) : "), l("P(A)=\\dfrac{n(A)}{n(\\Omega)}"), t(". Un événement est tout son disque, partie commune comprise.")],
      lignes: [
        e.nAB === 0 ? ligne(`n(A)=${e.nA}`, "disque A, sans partie commune") : ligne(`n(A)=${e.nA - e.nAB}+${e.nAB}=${e.nA}`, "A seulement, plus la partie commune"),
        ligne(`P(A)=${fractionEtReduite(e.nA, e.N, p.pA)}`),
        e.nAB === 0 ? ligne(`n(B)=${e.nB}`) : e.nB === e.nAB ? ligne(`n(B)=${e.nB}`, "tout B est dans la partie commune") : ligne(`n(B)=${e.nB - e.nAB}+${e.nAB}=${e.nB}`),
        ligne(`P(B)=${fractionEtReduite(e.nB, e.N, p.pB)}`),
      ],
    };
  if (e.variante === "tableau")
    return {
      u: [t("Issues équiprobables (cours, point 1) : "), l("P(A)=\\dfrac{n(A)}{n(\\Omega)}"), t(", avec les totaux du tableau.")],
      lignes: [ligne(`P(A)=${fractionEtReduite(e.nA, e.N, p.pA)}`, "total de la ligne de A"), ligne(`P(B)=${fractionEtReduite(e.nB, e.N, p.pB)}`, "total de la colonne de B")],
    };
  if (e.variante === "contexte") {
    const s = ensemblesContexte(e);
    const just = (xs: typeof s.xA, pl: string) => {
      const liste = listeIssues(xs);
      return liste && typeof xs[0] === "number" ? `{${liste}}` : pl;
    };
    return {
      u: [t("Issues équiprobables (cours, point 1) : "), l("P(A)=\\dfrac{n(A)}{n(\\Omega)}"), t(".")],
      lignes: [
        ligne(`n(\\Omega)=${e.N}`),
        ligne(`n(A)=${e.nA}`, just(s.xA, s.A.pluriel)),
        ligne(`P(A)=${fractionEtReduite(e.nA, e.N, p.pA)}`),
        ligne(`n(B)=${e.nB}`, just(s.xB, s.B.pluriel)),
        ligne(`P(B)=${fractionEtReduite(e.nB, e.N, p.pB)}`),
      ],
    };
  }
  return { u: [], lignes: [] };
}

function lignesInter(e: E): { u: Frag[]; lignes: LigneCalcul[] } {
  const p = probas160(e);
  if (e.variante === "valeurs")
    return {
      u: [t("Formule d'addition (cours, point 1), retournée pour isoler "), l("P(A\\cap B)"), t(".")],
      lignes: [
        ligne("P(A\\cap B)=P(A)+P(B)-P(A\\cup B)"),
        ligne(`=${ecr(e, p.pA)}+${ecr(e, p.pB)}-${ecr(e, pUnion160(e))}`, "on remplace"),
        ligne(`=${ecr(e, p.pAB)}`),
      ],
    };
  const u: Frag[] = [l("A\\cap B"), t(" : les issues où "), l("A"), t(" et "), l("B"), t(" sont réalisés en même temps (cours, point 1).")];
  const pAB = e.nAB === 0 ? "0" : fractionEtReduite(e.nAB, e.N, p.pAB);
  if (e.variante === "venn") return { u, lignes: [ligne(`P(A\\cap B)=${pAB}`, e.nAB === 0 ? "partie commune aux deux disques vide" : "partie commune aux deux disques")] };
  if (e.variante === "tableau") return { u, lignes: [ligne(`P(A\\cap B)=${pAB}`, e.nAB === 0 ? "case de la ligne A et de la colonne B : 0" : "case de la ligne A et de la colonne B, sur le total général")] };
  const s = ensemblesContexte(e);
  const liste = listeIssues(s.xAB);
  const just = e.nAB === 0 ? "aucune issue n'est dans A et dans B" : liste ? `{${liste}}` : "issues communes à A et à B";
  return {
    u,
    lignes: [ligne(e.nAB === 0 ? "A\\cap B=\\emptyset" : `n(A\\cap B)=${e.nAB}`, just), ligne(`P(A\\cap B)=${e.nAB === 0 ? "0" : fractionEtReduite(e.nAB, e.N, p.pAB)}`)],
  };
}

function lignesProduit(e: E): LigneCalcul[] {
  const p = probas160(e);
  const prod = produit160(e);
  const brut = `${ecr(e, p.pA)}\\times ${ecr(e, p.pB)}`;
  const lignes = [ligne(`P(A)\\times P(B)=${brut}`)];
  if (!(e.variante === "valeurs" && e.ecriture === "decimal")) {
    const num = p.pA.n * p.pB.n;
    const den = p.pA.d * p.pB.d;
    if (den !== 1 && (num !== prod.n || den !== prod.d)) lignes.push(ligne(`=\\dfrac{${num}}{${den}}`, "numérateurs et dénominateurs multipliés"));
  }
  lignes.push(ligne(`=${ecr(e, prod)}`, lignes.length > 1 ? "on simplifie" : undefined));
  return lignes;
}

function lignesVerdict(e: E): LigneCalcul[] {
  const p = probas160(e);
  const ab = ecr(e, p.pAB);
  const pr = ecr(e, produit160(e));
  const v = verdictCalcule(e);
  if (v === "incompatibles") return [ligne("P(A\\cap B)=0", "A et B ne se produisent jamais ensemble"), ligne(`P(A)\\times P(B)=${pr}\\neq 0`, "le produit n'est pas égal à P(A ∩ B)")];
  if (v === "independants") return [ligne(`P(A\\cap B)=${ab}\\neq 0`, "pas incompatibles"), ligne(`P(A)\\times P(B)=${pr}=P(A\\cap B)`, "égalité exacte")];
  return [ligne(`P(A\\cap B)=${ab}\\neq 0`, "pas incompatibles"), ligne(`P(A)\\times P(B)=${pr}\\neq P(A\\cap B)`, "pas indépendants")];
}

function piegeVerdict(e: E): Frag[] {
  const v = verdictCalcule(e);
  if (v === "incompatibles") return [t("Croire que des événements incompatibles sont indépendants : "), l("P(A\\cap B)=0"), t(" alors que "), l("P(A)\\times P(B)>0"), t(", l'égalité échoue toujours (elle ne tiendrait que si "), l("P(A)"), t(" ou "), l("P(B)"), t(" était nulle).")];
  if (v === "independants") return [t("Conclure « incompatibles » parce que "), l("A"), t(" et "), l("B"), t(" semblent sans lien : ils peuvent se produire ensemble ; « sans lien » se dit indépendants, et se vérifie par le calcul.")];
  return [t("Conclure à l'indépendance parce que les deux nombres sont proches : l'égalité doit être exacte.")];
}

export function correctionDetaillee160(e: E): EtapeCorrection[] {
  const out: EtapeCorrection[] = [];
  phases160(e).forEach((ph: Phase160, i) => {
    const sq = lettreEtape(i);
    if (ph === "probas") {
      const { u, lignes } = lignesProbas(e);
      out.push(utilise(sq, fr(u)), calcul(sq, lignes), resultat(sq, fr(reponse(e, ph))));
    } else if (ph === "inter") {
      const { u, lignes } = lignesInter(e);
      out.push(utilise(sq, fr(u)), calcul(sq, lignes), resultat(sq, fr(reponse(e, ph))));
    } else if (ph === "produit") {
      out.push(
        utilise(sq, fr([t("Test d'indépendance (cours, point 1) : on compare "), l("P(A\\cap B)"), t(" au produit "), l("P(A)\\times P(B)"), t(".")])),
        calcul(sq, lignesProduit(e)),
        resultat(sq, fr(reponse(e, ph))),
      );
    } else {
      out.push(
        utilise(sq, fr([t("Incompatibles : "), l("P(A\\cap B)=0"), t(". Indépendants : "), l("P(A\\cap B)=P(A)\\times P(B)"), t(" (cours, point 1). Avec "), l("P(A)"), t(" et "), l("P(B)"), t(" non nulles, les deux ne peuvent pas être vrais à la fois.")])),
        calcul(sq, lignesVerdict(e)),
        resultat(sq, fr(reponse(e, ph))),
        piege(sq, fr(piegeVerdict(e))),
      );
    }
  });
  return out;
}
