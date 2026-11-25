import type { ExerciceAN, PhaseAN } from "../core6e/approximationNormale";
import { bornesCorrigees, deuxBornes, mu, pDe, phases, probaTable, sigma, sigma2, zArrondis } from "../core6e/approximationNormale";
import type { AideEcran, ChampEcran, DefinitionEcrans, Frag, OptionEcran } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import { BL, nL, p4L, zL } from "./textesLoisLotH2";
import { approchee, diagnostiquer, messageIllisible, piege, probaExacteRef } from "../moteur6e/verificationApproximationNormale";
import { correctionDetailleeAN } from "../generateurs6e/approximationNormale/corrigeDetaille";

/**
 * Couche C — textes de `6gen118` « Approximation normale avec correction de continuité ». Source unique
 * de l'écran, du papier et du corrigé. Notation : 𝓑(n ; p), 𝒩(μ ; σ), Y la variable normale qui
 * approche X, Φ ; conditions du cours n > 30 et 0,3 < p < 0,7 (inégalités strictes).
 */

type E = ExerciceAN;
type P = PhaseAN;
const t = tx;
const l = lx;

export const pL = (e: E) => nL(pDe(e));
const pctT = (e: E) => `${nL(e.pc)}\\,\\%`;

export function situation(e: E): Frag[] {
  const n = l(`${e.n}`);
  switch (e.ctx) {
    case 0:
      return [t("On lance "), n, t(" fois une pièce de monnaie équilibrée. On note "), l("X"), t(" le nombre de « pile » obtenus.")];
    case 1:
      return [t("Dans une grande ville, "), l(pctT(e)), t(" des habitants utilisent les transports en commun. On interroge au hasard "), n, t(" habitants ; la ville est assez grande pour assimiler ces choix à des tirages avec remise. On note "), l("X"), t(" le nombre de personnes interrogées qui utilisent les transports en commun.")];
    case 2:
      return [t("Une graine d'une certaine variété germe avec une probabilité de "), l(pL(e)), t(". On sème "), n, t(" graines, qui germent indépendamment les unes des autres. On note "), l("X"), t(" le nombre de graines qui germent.")];
    default:
      return [t("Une machine produit "), l(pctT(e)), t(" de pièces défectueuses. On prélève au hasard "), n, t(" pièces dans une production assez grande pour assimiler ces prélèvements à des tirages avec remise. On note "), l("X"), t(" le nombre de pièces défectueuses.")];
  }
}

export const loiL = (e: E) => `X\\sim${BL(e.n, pL(e))}`;

/** « P(X\le 55) », « P(48\le X\le 56) ». */
export function evenementL(e: E): string {
  switch (e.variante) {
    case "auPlus":
      return `P(X\\le ${e.k})`;
    case "moinsDe":
      return `P(X<${e.k})`;
    case "auMoins":
      return `P(X\\ge ${e.k})`;
    case "exactement":
      return `P(X=${e.k})`;
    case "entre":
      return `P(${e.k}\\le X\\le ${e.k2})`;
  }
}

/** Écriture normale corrigée : « P(Y\le 55{,}5) », « P(47{,}5\le Y\le 56{,}5) ». */
export function evenementYL(e: E): string {
  const b = bornesCorrigees(e).map((x) => nL(x));
  if (b.length === 2) return `P(${b[0]}\\le Y\\le ${b[1]})`;
  return e.variante === "auMoins" ? `P(Y\\ge ${b[0]})` : `P(Y\\le ${b[0]})`;
}

export const PRECISION = "Arrondis au dix-millième.";

export function question(e: E): Frag[] {
  const ev = l(evenementL(e));
  return [t("Les conditions du cours permettent-elles d'approcher la loi de "), l("X"), t(" par une loi normale ? Si oui, estime "), ev, t(" à l'aide de cette approximation, avec la correction de continuité ; sinon, calcule "), ev, t(" avec la loi binomiale. "), t(PRECISION)];
}

export const enonce = (e: E): Frag[] => [...situation(e), t(" Ainsi "), l(loiL(e)), t(".")];
export const consigneGenerale = (e: E): Frag[] => [...enonce(e), t(" "), ...question(e)];

export function libelle(_e: E, p: P): string {
  const L: Record<P, string> = { verdict: "Approximable ?", condition: "Condition en défaut", exacte: "Probabilité exacte", parametres: "μ et σ", bornes: "Correction de continuité", z: "Valeur(s) de z", proba: "Probabilité approchée" };
  return L[p];
}

export function consigne(e: E, p: P): Frag[] {
  switch (p) {
    case "verdict":
      return [t("Les conditions du cours permettent-elles d'approcher la loi de "), l("X"), t(" par une loi normale ?")];
    case "condition":
      return [t("Quelle condition du cours n'est pas remplie ?")];
    case "exacte":
      return [t("Calcule "), l(evenementL(e)), t(" avec la loi binomiale (calculatrice), au dix-millième.")];
    case "parametres":
      return [t("Donne l'espérance "), l("\\mu"), t(" et l'écart-type "), l("\\sigma"), t(" de la loi normale "), l("Y"), t(" qui approche "), l("X"), t(" ("), l("\\sigma"), t(" au centième si elle n'est pas exacte).")];
    case "bornes":
      return deuxBornes(e)
        ? [t("Avec la correction de continuité, "), l(`${evenementL(e)}\\approx P(b_1\\le Y\\le b_2)`), t(". Donne les bornes corrigées "), l("b_1"), t(" et "), l("b_2"), t(".")]
        : [t("Avec la correction de continuité, "), l(`${evenementL(e)}\\approx P(Y${e.variante === "auMoins" ? "\\ge" : "\\le"} b)`), t(". Donne la borne corrigée "), l("b"), t(".")];
    case "z":
      return deuxBornes(e) ? [t("Standardise les deux bornes corrigées : donne "), l("z_1"), t(" et "), l("z_2"), t(" au centième.")] : [t("Standardise la borne corrigée : donne "), l("z"), t(" au centième.")];
    case "proba":
      return [t("Estime "), l(evenementL(e)), t(" avec la table de "), l("\\Phi"), t(" (quatre décimales).")];
  }
}

export function options(e: E, p: P): OptionEcran[] {
  if (p === "verdict")
    return [
      { id: "oui", fragments: [t("Oui, les deux conditions sont remplies")] },
      { id: "non", fragments: [t("Non, une condition n'est pas remplie")] },
    ];
  void e;
  return [
    { id: "n", fragments: [l("n\\le 30"), t(" : pas assez d'épreuves")] },
    { id: "p", fragments: [l("p"), t(" n'est pas strictement compris entre "), l("0{,}3"), t(" et "), l("0{,}7")] },
  ];
}

export function champs(e: E, p: P): ChampEcran[] {
  if (p === "parametres")
    return [
      { label: "Espérance μ", labelLatex: "\\mu=", placeholder: "nombre" },
      { label: "Écart-type σ", labelLatex: "\\sigma=", placeholder: "au centième" },
    ];
  if (p === "bornes")
    return deuxBornes(e)
      ? [
          { label: "Borne corrigée b₁", labelLatex: "b_1=", placeholder: "nombre" },
          { label: "Borne corrigée b₂", labelLatex: "b_2=", placeholder: "nombre" },
        ]
      : [{ label: "Borne corrigée b", labelLatex: "b=", placeholder: "nombre" }];
  if (p === "z")
    return deuxBornes(e)
      ? [
          { label: "z₁", labelLatex: "z_1=", placeholder: "au centième" },
          { label: "z₂", labelLatex: "z_2=", placeholder: "au centième" },
        ]
      : [{ label: "z", labelLatex: "z=", placeholder: "au centième" }];
  return [{ label: "Probabilité", labelLatex: "P=", placeholder: "quatre décimales" }];
}

/** σ en LaTeX : exacte si entière ou décimale courte, sinon « \sqrt{24}\approx 4{,}90 ». */
export function sigmaL(e: E): string {
  const s = sigma(e);
  const v2 = sigma2(e);
  if (Math.abs(s * 100 - Math.round(s * 100)) < 1e-9) return nL(s);
  return `\\sqrt{${nL(v2)}}\\approx ${nL(Math.round(s * 100) / 100, 2)}`;
}

export function reponse(e: E, p: P): Frag[] {
  switch (p) {
    case "verdict":
      return e.approximable ? [t("Oui : "), l(`n=${e.n}>30`), t(" et "), l(`0{,}3<p=${pL(e)}<0{,}7`)] : [t("Non : une condition n'est pas remplie.")];
    case "condition":
      return e.echec === "n" ? [l(`n=${e.n}\\le 30`)] : [l(`p=${pL(e)}`), t(" n'est pas strictement compris entre "), l("0{,}3"), t(" et "), l("0{,}7")];
    case "exacte":
      return [l(`${evenementL(e)}\\approx ${p4L(probaExacteRef(e))}`)];
    case "parametres":
      return [l(`\\mu=${nL(mu(e))}`), t(" et "), l(`\\sigma=${sigmaL(e)}`)];
    case "bornes":
      return [l(`${evenementL(e)}\\approx ${evenementYL(e)}`)];
    case "z": {
      const z = zArrondis(e);
      return z.length === 2 ? [l(`z_1\\approx ${zL(z[0]!)}`), t(" et "), l(`z_2\\approx ${zL(z[1]!)}`)] : [l(`z\\approx ${zL(z[0]!)}`)];
    }
    case "proba":
      return [l(`${evenementL(e)}\\approx ${p4L(probaTable(e))}`)];
  }
}

export const recap = reponse;

const CONDITIONS = "n>30\\qquad 0{,}3<p<0{,}7";

export function aide1(_e: E, p: P): AideEcran {
  switch (p) {
    case "verdict":
    case "condition":
      return { texte: [t("Conditions du cours (§ 7) pour approcher une loi binomiale par une loi normale, inégalités strictes :")], latex: CONDITIONS };
    case "exacte":
      return { texte: [t("Loi binomiale (cours, § 2) ; pour une somme de termes, utilise la loi binomiale cumulée de la calculatrice :")], latex: "P(X=i)=C_n^i\\,p^i(1-p)^{n-i}" };
    case "parametres":
      return { texte: [t("La loi normale qui approche "), l("\\mathcal{B}(n\\,;p)"), t(" a les mêmes espérance et écart-type :")], latex: "\\mu=np\\qquad \\sigma=\\sqrt{np(1-p)}" };
    case "bornes":
      return { texte: [t("Correction de continuité : la valeur entière "), l("k"), t(" est représentée par l'intervalle "), l("[k-0{,}5\\,;k+0{,}5]"), t(" ; on garde ou on retire cette demi-unité selon l'événement :")], latex: "P(X\\le k)\\approx P(Y\\le k+0{,}5)\\qquad P(X\\ge k)\\approx P(Y\\ge k-0{,}5)" };
    case "z":
      return { texte: [t("Standardisation (cours, § 6) :")], latex: "z=\\dfrac{b-\\mu}{\\sigma}" };
    default:
      return { texte: [t("Écris la probabilité avec "), l("\\Phi"), t(", puis lis la table (symétrie pour un "), l("z"), t(" négatif) :")], latex: "P(Y\\ge b)=1-\\Phi(z)\\qquad \\Phi(-z)=1-\\Phi(z)" };
  }
}

export function aide2(e: E, p: P): AideEcran | null {
  switch (p) {
    case "verdict":
    case "condition":
      return { texte: [t("Ici "), l(`n=${e.n}`), t(" et "), l(`p=${pL(e)}`), t(" : compare chacun à sa condition (attention aux inégalités strictes).")] };
    case "exacte":
      if (e.variante === "auMoins") return { texte: [t("Ici :")], latex: `P(X\\ge ${e.k})=1-P(X\\le ${e.k - 1})` };
      if (e.variante === "moinsDe") return { texte: [t("Ici :")], latex: `P(X<${e.k})=P(X\\le ${e.k - 1})` };
      if (e.variante === "exactement") return { texte: [t("Ici :")], latex: `P(X=${e.k})=C_{${e.n}}^{${e.k}}\\,(${pL(e)})^{${e.k}}\\,(${nL(1 - pDe(e))})^{${e.n - e.k}}` };
      if (e.variante === "entre") return { texte: [t("Ici :")], latex: `P(${e.k}\\le X\\le ${e.k2})=P(X\\le ${e.k2})-P(X\\le ${e.k - 1})` };
      return { texte: [t("Ici, somme des termes de "), l("i=0"), t(" à "), l(`i=${e.k}`), t(" : loi binomiale cumulée.")] };
    case "parametres":
      return { texte: [t("Ici :")], latex: `\\mu=${e.n}\\times ${pL(e)}\\qquad \\sigma=\\sqrt{${e.n}\\times ${pL(e)}\\times ${nL(1 - pDe(e))}}` };
    case "bornes":
      if (e.variante === "moinsDe") return { texte: [t("Ici "), l(`P(X<${e.k})=P(X\\le ${e.k - 1})`), t(" : applique la correction à "), l(`${e.k - 1}`), t(".")] };
      if (e.variante === "exactement") return { texte: [t("Ici on veut toute la « barre » de la valeur "), l(`${e.k}`), t(", de part et d'autre de "), l(`${e.k}`), t(".")] };
      if (e.variante === "entre") return { texte: [t("Ici les valeurs "), l(`${e.k}`), t(" et "), l(`${e.k2}`), t(" sont comprises : élargis l'intervalle d'une demi-unité de chaque côté.")] };
      return { texte: [t("Ici la valeur "), l(`${e.k}`), t(" est comprise dans l'événement : sa demi-unité aussi.")] };
    case "z": {
      const b = bornesCorrigees(e);
      const sL = Math.abs(sigma(e) * 100 - Math.round(sigma(e) * 100)) < 1e-9 ? nL(sigma(e)) : `\\sqrt{${nL(sigma2(e))}}`;
      return { texte: [t("Ici :")], latex: b.map((x, i) => `z${b.length === 2 ? `_${i + 1}` : ""}=\\dfrac{${nL(x)}-${nL(mu(e))}}{${sL}}`).join("\\qquad ") };
    }
    default: {
      const z = zArrondis(e);
      const ecr = e.variante === "auMoins" ? `1-\\Phi(${zL(z[0]!)})` : z.length === 2 ? `\\Phi(${zL(z[1]!)})-\\Phi(${zL(z[0]!)})` : `\\Phi(${zL(z[0]!)})`;
      return { texte: [t("Ici :")], latex: `${evenementL(e)}\\approx ${ecr}` };
    }
  }
}

export function explicationChoix(e: E, p: P): string {
  if (p === "verdict") return e.approximable ? `n = ${e.n} > 30 et p = ${pL(e).replace("{,}", ",")} est strictement entre 0,3 et 0,7.` : e.echec === "n" ? `n = ${e.n} n'est pas strictement supérieur à 30.` : `p = ${pL(e).replace("{,}", ",")} n'est pas strictement entre 0,3 et 0,7.`;
  if (p === "condition") return e.echec === "n" ? `n = ${e.n} ≤ 30, alors que p = ${pL(e).replace("{,}", ",")} convient.` : `p = ${pL(e).replace("{,}", ",")} n'est pas dans ]0,3 ; 0,7[, alors que n = ${e.n} > 30.`;
  return "";
}

/** `6gen118` : verdict (choix jugé ✗ / ✓), puis cinq écrans en tout (approximable) ou trois (non). */
export const DEFINITION_AN: DefinitionEcrans<E, P> = {
  phases,
  estChoix: (_e, p) => p === "verdict" || p === "condition",
  mode: (e, p) => (p === "verdict" || p === "condition" ? { type: "choix", options: options(e, p) } : { type: "champs", champs: champs(e, p) }),
  libelle,
  consigneGenerale,
  consigne,
  approchee,
  aide1,
  aide2,
  aidesChoixDeuxNiveaux: true,
  diagnostiquer,
  piege,
  piegeChoixRevele: true,
  bonneOption: (e, p) => (p === "verdict" ? (e.approximable ? "oui" : "non") : (e.echec ?? "n")),
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  explicationChoix,
  correction: correctionDetailleeAN,
  apercuEnonce: (e) => [l(loiL(e)), t(" ; "), l(evenementL(e))],
};
