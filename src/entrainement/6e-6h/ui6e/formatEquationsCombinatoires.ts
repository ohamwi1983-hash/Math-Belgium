import type { Exercice101, Phase101 } from "../core6e/equationsCombinatoires";
import { equationReduite, nMin, phases101, racines101, solutionSymetrie } from "../core6e/equationsCombinatoires";
import type { AideEcran, ChampEcran, Frag, OptionEcran } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import { AL, CL, mil } from "./nombresCombinatoireLotH";

/**
 * Couche C — textes de `6gen101` « Factorielles et équations combinatoires » : équation, consignes
 * d'écran, champs, aides à deux niveaux (propriété du cours, puis posée pour l'instance — jamais le
 * résultat), réponses. Source unique de l'écran, du papier et du corrigé. Notation du cours :
 * n!, Aₙᵏ, Cₙᵏ.
 */

type E = Exercice101;
type P = Phase101;
const t = tx;
const l = lx;

export { phases101 };

const COURS = "(cours, § 1)";

/** n + s écrit proprement (« n », « n+1 », « n-1 »). */
export const nPlus = (s: number) => (s === 0 ? "n" : s > 0 ? `n+${s}` : `n-${-s}`);
const fac = (s: number) => (s === 0 ? "n!" : `(${nPlus(s)})!`);
/** Facteur n + s entre parenthèses seulement s'il le faut. */
const par = (s: number) => (s === 0 ? "n" : `(${nPlus(s)})`);

/** Membre de gauche (LaTeX). */
export function membreGauche(e: E): string {
  switch (e.variante) {
    case "quotient":
      return `\\dfrac{${fac(e.s)}}{${fac(e.s - 2)}}`;
    case "arrangement":
      return AL("n", 2);
    case "combinaison":
      return CL("n", 2);
    case "mixte":
      return `${CL("n", 2)}+n`;
    case "symetrie":
      return e.inconnue === "n" ? CL("n", e.p) : CL(e.p, "k");
  }
}

export function equationLatex(e: E): string {
  if (e.variante === "symetrie") return e.inconnue === "n" ? `${CL("n", e.p)}=${CL("n", e.q)}` : `${CL(e.p, "k")}=${CL(e.p, `k+${e.q}`)}`;
  return `${membreGauche(e)}=${mil(e.V)}`;
}

export const inconnue101 = (e: E) => (e.variante === "symetrie" ? e.inconnue : "n");

/** Consigne globale (papier et écran) : l'équation. */
export const consigneGlobale101 = (e: E): Frag[] => [t("Résous l'équation "), l(equationLatex(e)), t(", d'inconnue naturelle "), l(inconnue101(e)), t(".")];
export const consigneGenerale101 = consigneGlobale101;

/** Polynôme développé α(n² + βn + γ) en LaTeX. */
export function polynomeLatex(e: E): string {
  switch (e.variante) {
    case "quotient": {
      const b = 2 * e.s - 1;
      const g = e.s * e.s - e.s;
      return `n^2${b === 0 ? "" : b === 1 ? "+n" : b === -1 ? "-n" : b > 0 ? `+${b}n` : `-${-b}n`}${g === 0 ? "" : g > 0 ? `+${g}` : `-${-g}`}`;
    }
    case "arrangement":
      return "n^2-n";
    case "combinaison":
      return "\\dfrac{n^2-n}{2}";
    case "mixte":
      return "\\dfrac{n^2+n}{2}";
    case "symetrie":
      return "";
  }
}

/** Forme factorisée (LaTeX). */
export function polynomeFactorise(e: E): string {
  switch (e.variante) {
    case "quotient":
      return `${par(e.s)}${par(e.s - 1)}`;
    case "arrangement":
      return "n(n-1)";
    case "combinaison":
      return "\\dfrac{n(n-1)}{2}";
    case "mixte":
      return "\\dfrac{n(n+1)}{2}";
    case "symetrie":
      return "";
  }
}

/** n² + bn + c = 0 en LaTeX. */
export function equationSecondDegre(e: E): string {
  const { b, c } = equationReduite(e);
  const tb = b === 0 ? "" : b === 1 ? "+n" : b === -1 ? "-n" : b > 0 ? `+${b}n` : `-${-b}n`;
  const tc = c === 0 ? "" : c > 0 ? `+${mil(c)}` : `-${mil(-c)}`;
  return `n^2${tb}${tc}=0`;
}

export function libelle101(_e: E, p: P): string {
  switch (p) {
    case "polynome":
      return "Polynôme en n";
    case "racines":
      return "Solutions de l'équation";
    case "admissible":
      return "Valeur de n";
    case "propriete":
      return "Propriété utilisée";
    case "valeur":
      return "Solution";
  }
}

export function consigne101(e: E, p: P): Frag[] {
  switch (p) {
    case "polynome":
      return [t("Écris le membre de gauche "), l(membreGauche(e)), t(" comme un polynôme en "), l("n"), t(" (sans factorielle).")];
    case "racines":
      return [t("L'équation devient une équation du second degré. Donne ses deux solutions, séparées par « ; ».")];
    case "admissible":
      return [t("Quelle valeur de "), l("n"), t(" est solution de l'équation de départ ?")];
    case "propriete":
      return [t("Que peut-on déduire de l'égalité "), l(equationLatex(e)), t(" ?")];
    case "valeur":
      return [t("Donne la solution "), l(inconnue101(e)), t(".")];
  }
}

/** Options dans un ordre propre à l'instance (la bonne n'est pas toujours la première). */
export function options101(e: E): OptionEcran[] {
  const o = optionsBrutes(e);
  const r = (e.p + e.q) % o.length;
  return [...o.slice(r), ...o.slice(0, r)];
}

function optionsBrutes(e: E): OptionEcran[] {
  if (e.inconnue === "n")
    return [
      { id: "somme", fragments: [l(`n=${e.p}+${e.q}`)] },
      { id: "difference", fragments: [l(`n=${e.q}-${e.p}`)] },
      { id: "produit", fragments: [l(`n=${e.p}\\times ${e.q}`)] },
      { id: "aucune", fragments: [t("Aucune solution, car "), l(`${e.p}\\neq ${e.q}`)] },
    ];
  return [
    { id: "somme", fragments: [l(`k+(k+${e.q})=${e.p}`)] },
    { id: "difference", fragments: [l(`(k+${e.q})-k=${e.p}`)] },
    { id: "produit", fragments: [l(`k\\times(k+${e.q})=${e.p}`)] },
    { id: "aucune", fragments: [t("Aucune solution, car "), l(`k\\neq k+${e.q}`)] },
  ];
}

export function champs101(e: E, p: P): ChampEcran[] {
  if (p === "polynome") return [{ label: "Polynôme en n", labelLatex: `${membreGauche(e)}=`, placeholder: "expression en n", apercu: true }];
  if (p === "racines") return [{ label: "Deux solutions", labelLatex: "n_1\\,;\\,n_2=", placeholder: "deux nombres séparés par ;" }];
  return [{ label: libelle101(e, p), labelLatex: `${inconnue101(e)}=`, placeholder: "nombre entier" }];
}

export function reponse101(e: E, p: P): Frag[] {
  switch (p) {
    case "polynome":
      return [l(`${membreGauche(e)}=${polynomeFactorise(e)}=${polynomeLatex(e)}`)];
    case "racines": {
      const [r1, r2] = racines101(e);
      return [l(`${equationSecondDegre(e)}`), t(" : "), l(`n_1=${mil(r1)}`), t(" et "), l(`n_2=${mil(r2)}`)];
    }
    case "admissible":
      return [l(`n=${e.sol}`)];
    case "propriete":
      return optionsBrutes(e)[0]!.fragments;
    case "valeur":
      return [l(`${inconnue101(e)}=${solutionSymetrie(e)}`)];
  }
}
export const recap101 = reponse101;

export function messageIllisible101(_e: E, p: P): string {
  if (p === "polynome") return "Expression non reconnue : écris un polynôme en n, par exemple n(n − 1) ou n² + 3n. Cette saisie ne compte pas comme une tentative.";
  if (p === "racines") return "Solutions non reconnues : écris deux nombres entiers séparés par « ; », par exemple 4 ; −3. Cette saisie ne compte pas comme une tentative.";
  return "Nombre non reconnu : écris un nombre entier. Cette saisie ne compte pas comme une tentative.";
}

export function aide1_101(e: E, p: P): AideEcran {
  switch (p) {
    case "polynome":
      if (e.variante === "quotient") return { texte: [t(`Factorielle ${COURS} : on écrit la plus grande factorielle jusqu'à la plus petite, puis on simplifie :`)], latex: "(m+1)!=(m+1)\\times m!" };
      if (e.variante === "arrangement") return { texte: [t(`Arrangement ${COURS} :`)], latex: `${AL("n", "k")}=\\dfrac{n!}{(n-k)!}=n\\times(n-1)\\times\\cdots\\times(n-k+1)` };
      return { texte: [t(`Combinaison ${COURS} :`)], latex: `${CL("n", "k")}=\\dfrac{n!}{k!\\,(n-k)!}` };
    case "racines":
      return { texte: [t("On ramène tout dans un membre (on multiplie d'abord par 2 s'il y a un dénominateur 2), puis on résout avec le discriminant :")], latex: "\\Delta=b^2-4ac,\\quad n=\\dfrac{-b\\pm\\sqrt{\\Delta}}{2a}" };
    case "admissible":
      return { texte: [t("L'inconnue est un nombre naturel, et le membre de gauche doit être défini (pas de factorielle d'un nombre négatif, "), l("C_n^k"), t(" et "), l("A_n^k"), t(" demandent "), l("n\\ge k"), t(").")] };
    case "propriete":
      return { texte: [t(`Symétrie ${COURS} : choisir k éléments revient à laisser les autres de côté :`)], latex: `${CL("n", "k")}=${CL("n", "n-k")}` };
    case "valeur":
      return { texte: [t("Applique la relation obtenue à l'écran précédent.")] };
  }
}

export function aide2_101(e: E, p: P): AideEcran | null {
  switch (p) {
    case "polynome":
      if (e.variante === "quotient") return { texte: [t("Ici :")], latex: `${fac(e.s)}=${par(e.s)}\\times ${par(e.s - 1)}\\times ${fac(e.s - 2)}` };
      if (e.variante === "arrangement") return { texte: [t("Ici, deux facteurs :")], latex: `${AL("n", 2)}=\\dfrac{n!}{(n-2)!}` };
      if (e.variante === "combinaison") return { texte: [t("Ici :")], latex: `${CL("n", 2)}=\\dfrac{${AL("n", 2)}}{2!}` };
      return { texte: [t("Ici, calcule d'abord "), l(CL("n", 2)), t(", puis ajoute "), l("n"), t(" en mettant au même dénominateur.")] };
    case "racines": {
      const { b, c } = equationReduite(e);
      return { texte: [t("Ici, l'équation à résoudre est "), l(equationSecondDegre(e)), t(", avec :")], latex: `\\Delta=${b < 0 ? `(${b})` : b}^2-4\\times 1\\times ${c < 0 ? `(${mil(c)})` : mil(c)}` };
    }
    case "admissible":
      return { texte: [t("Ici, il faut "), l(`n\\ge ${nMin(e)}`), t(" : une des deux solutions ne convient pas.")] };
    case "propriete":
      return e.inconnue === "n"
        ? { texte: [t("Ici, deux indices différents donnent le même nombre : ils sont « symétriques », leur somme vaut "), l("n"), t(".")] }
        : { texte: [t("Ici, les indices "), l("k"), t(" et "), l(`k+${e.q}`), t(" ne peuvent pas être égaux : ils sont symétriques, leur somme vaut "), l(`${e.p}`), t(".")] };
    case "valeur":
      return e.inconnue === "n" ? { texte: [t("Ici :")], latex: `n=${e.p}+${e.q}` } : { texte: [t("Ici, résous :")], latex: `2k+${e.q}=${e.p}` };
  }
}
