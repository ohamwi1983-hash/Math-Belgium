import type { ExerciceBinomeNewton } from "../core6e/binomeNewton.types";
import type { PhaseBinomeNewton } from "../moteur6e/typesBinomeNewton";
import { approximationC, termeNegligeC, valeurExacteC } from "../moteur6e/verificationBinomeNewton";
import { combinaisonBig, versNombre, vaut } from "../moteur6e/saisieCombinatoire";
import { arrondiLatex, decimalLatex, f, milliers, t } from "./fragmentsCombinatoire";
import type { ChampCombi, FormatCombinatoire, FragmentConsigne } from "./fragmentsCombinatoire";

/**
 * Textes de `6gen45` (6e ch. 7, § 3) — audit, lots B et C : terme de rang r = T₍ₖ₊₁₎ (convention du
 * cours et du formulaire), notation KaTeX partout (plus de « (ax)^{n-k} » ni de « b^k = » en clair),
 * « × » comme dans le cours, aides à deux niveaux sans les termes, approximation 1 + nε enfin travaillée,
 * triangle de Pascal.
 */

type E = ExerciceBinomeNewton;
type P = PhaseBinomeNewton;

function facteurX(a: number): string {
  return a === 1 ? "x" : a === -1 ? "-x" : `${a}x`;
}

export function binomeLatex(a: number, b: number, n: number): string {
  return `(${facteurX(a)}${b < 0 ? "-" : "+"}${Math.abs(b)})^{${n}}`;
}

function puissanceX(e: number): string {
  return e === 0 ? "" : e === 1 ? "x" : `x^{${e}}`;
}

function monome(c: number, e: number, premier: boolean): string {
  const signe = c < 0 ? "-" : premier ? "" : "+";
  const abs = Math.abs(c);
  const coef = abs === 1 && e > 0 ? "" : milliers(abs);
  return `${signe}${coef}${puissanceX(e)}`;
}

export function polynomeLatex(termes: { coefficient: number; exposant: number }[]): string {
  const nonNuls = termes.filter((x) => x.coefficient !== 0);
  return nonNuls.map((x, i) => monome(x.coefficient, x.exposant, i === 0)).join("");
}

function par(x: number): string {
  return x < 0 ? `(${x})` : `${x}`;
}

function epsilonLatex(c: number): string {
  return decimalLatex(c / 100);
}
function baseLatex(c: number): string {
  return decimalLatex(1 + c / 100);
}

function ligneLatex(l: number[]): string {
  return l.map((x) => milliers(x)).join("\\;\\;\\;");
}

export const FORMAT_6GEN45: FormatCombinatoire<E, P> = {
  consigneGenerale(e) {
    switch (e.famille) {
      case "A":
        return f("Développe à l'aide de la formule du binôme : $(a+b)^n=\\displaystyle\\sum_{k=0}^{n}C_n^k\\,a^{n-k}\\,b^k$.");
      case "B":
        return f("Dans le développement ordonné selon les puissances décroissantes de $x$, le terme de rang $k+1$ est $T_{k+1}=C_n^k\\,a^{n-k}\\,b^k$.");
      case "C":
        return f("Pour $\\varepsilon$ proche de 0 et $n\\varepsilon$ petit, $(1+\\varepsilon)^n\\approx 1+n\\varepsilon$ : les termes suivants du binôme sont négligeables.");
      case "D":
        return f("Triangle de Pascal : chaque nombre est la somme des deux nombres situés au-dessus de lui, $C_{n+1}^{k}=C_n^{k-1}+C_n^{k}$.");
    }
  },
  donnees(e): FragmentConsigne[][] {
    switch (e.famille) {
      case "A":
        return [f(`On développe $${binomeLatex(e.a, e.b, e.n)}$.`)];
      case "B":
        return e.sousType === "rang"
          ? [f(`Dans le développement de $${binomeLatex(e.a, e.b, e.n)}$, on cherche le terme de rang ${e.rang}, $T_{${e.rang}}$.`)]
          : [f(`Dans le développement de $${binomeLatex(e.a, e.b, e.n)}$, on cherche le coefficient du terme en $${puissanceX(e.p)}$.`)];
      case "C":
        return [f(`On veut une valeur approchée de $(${baseLatex(e.epsilonCentiemes)})^{${e.n}}=(1${e.epsilonCentiemes < 0 ? "-" : "+"}${epsilonLatex(Math.abs(e.epsilonCentiemes))})^{${e.n}}$.`)];
      case "D":
        return [f(`Ligne $n=${e.n}$ du triangle de Pascal (de $C_{${e.n}}^{0}$ à $C_{${e.n}}^{${e.n}}$) :`), f(`$${ligneLatex(e.ligne)}$`)];
    }
  },
  consigneEcran(e, p) {
    switch (e.famille) {
      case "A":
        if (p === "aEcran1") return f(`Donne les coefficients $C_{${e.n}}^{k}$, pour $k$ de 0 à ${e.n}.`);
        if (p === "aEcran2") return [t("Donne le coefficient de chaque terme du développement (signe compris).")];
        return [t("Écris le polynôme développé et réduit.")];
      case "B":
        if (p === "bTrouverKEcran") return e.sousType === "rang" ? f(`Le terme cherché est $T_{${e.rang}}=T_{k+1}$ : quelle est la valeur de $k$ ?`) : f(`Quelle valeur de $k$ donne la puissance $${puissanceX(e.p)}$ ?`);
        if (p === "bPoserEcran") return [t("Calcule les trois facteurs du terme.")];
        return e.sousType === "rang" ? f(`Quel est le coefficient de $T_{${e.rang}}$ ?`) : f(`Quel est le coefficient du terme en $${puissanceX(e.p)}$ ?`);
      case "C":
        if (p === "cEcran1") return f("Calcule l'approximation $1+n\\varepsilon$.");
        if (p === "cEcran2") return f("Calcule le premier terme négligé, $C_n^2\\,\\varepsilon^2$ : il donne l'ordre de grandeur de l'erreur.");
        return f(`À la calculatrice, donne $(${baseLatex(e.epsilonCentiemes)})^{${e.n}}$ arrondi au dix-millième, et compare.`);
      case "D":
        if (p === "dEcran1") return f(`Complète la ligne $n=${e.n + 1}$ : donne les nombres demandés.`);
        return f(`Que vaut la somme de tous les nombres de la ligne $n=${e.n + 1}$ ?`);
    }
  },
  champs(e, p): ChampCombi[] {
    switch (e.famille) {
      case "A":
        if (p === "aEcran1") return e.termes.map((x) => ({ type: "texte", label: `$C_{${e.n}}^{${x.k}}$` }));
        if (p === "aEcran2") return e.termes.map((x) => ({ type: "texte", label: x.exposantX === 0 ? "Terme constant" : `Terme en $${puissanceX(x.exposantX)}$` }));
        return [{ type: "texte", label: "Polynôme développé", apercu: true, nature: "polynome" }];
      case "B":
        if (p === "bTrouverKEcran") return [{ type: "texte", label: "$k$" }];
        if (p === "bPoserEcran")
          return [
            { type: "texte", label: `$C_{${e.n}}^{${e.k}}$` },
            { type: "texte", label: `$${par(e.a)}^{${e.n - e.k}}$` },
            { type: "texte", label: `$${par(e.b)}^{${e.k}}$` },
          ];
        return [{ type: "texte", label: "Coefficient" }];
      case "C":
        if (p === "cEcran1") return [{ type: "texte", label: "$1+n\\varepsilon$" }];
        if (p === "cEcran2") return [{ type: "texte", label: "$C_n^2\\,\\varepsilon^2$" }];
        return [{ type: "texte", label: "Valeur arrondie" }];
      case "D":
        if (p === "dEcran1") return e.positions.map((k) => ({ type: "texte", label: `$C_{${e.n + 1}}^{${k}}$` }));
        return [{ type: "texte", label: "Somme de la ligne" }];
    }
  },
  aides(e, p) {
    switch (e.famille) {
      case "A":
        if (p === "aEcran1") return [{ texte: "Les coefficients $C_n^k$ forment la ligne $n$ du triangle de Pascal ; ils sont symétriques : $C_n^k=C_n^{n-k}$." }, { texte: `Commence et termine par 1 ; calcule $C_{${e.n}}^{1}$, $C_{${e.n}}^{2}$… (touche nCr).` }];
        if (p === "aEcran2") return [{ texte: "Coefficient du terme d'indice $k$ :", latex: "C_n^k\\times a^{n-k}\\times b^k" }, { texte: `Ici $a=${e.a}$ et $b=${e.b}$ ; attention au signe des puissances de ${e.b < 0 ? "$b$, négatif" : e.a < 0 ? "$a$, négatif" : "chaque facteur"}.` }];
        return [{ texte: "Écris chaque terme « coefficient × puissance de $x$ », du plus haut degré au terme constant." }, { texte: "Au clavier, une puissance s'écrit avec l'accent circonflexe, ou directement en exposant." }];
      case "B":
        if (p === "bTrouverKEcran") return e.sousType === "rang" ? [{ texte: "Le premier terme est $T_1$ (k = 0), le deuxième $T_2$ (k = 1)…" }, { texte: "Le rang dépasse $k$ de 1." }] : [{ texte: "Dans $C_n^k\\,(ax)^{n-k}\\,b^k$, la puissance de $x$ est $n-k$." }, { texte: `Résous $${e.n}-k=${e.p}$.` }];
        if (p === "bPoserEcran") return [{ texte: "Le terme $T_{k+1}$ contient $C_n^k$, $a^{n-k}$ et $b^k$." }, { texte: "Une puissance paire d'un nombre négatif est positive, une puissance impaire est négative." }];
        return [{ texte: "Le coefficient est le produit des trois facteurs." }, { texte: "Utilise les trois valeurs de l'écran précédent, avec leur signe." }];
      case "C":
        if (p === "cEcran1") return [{ texte: "On garde les deux premiers termes du binôme : $1+C_n^1\\,\\varepsilon=1+n\\varepsilon$." }, { texte: `Ici $n=${e.n}$ et $\\varepsilon=${epsilonLatex(e.epsilonCentiemes)}$.` }];
        if (p === "cEcran2") return [{ texte: "Le terme suivant du binôme est $C_n^2\\,\\varepsilon^2=\\dfrac{n(n-1)}{2}\\,\\varepsilon^2$." }, { texte: `Calcule $C_{${e.n}}^{2}$, puis $\\varepsilon^2=(${epsilonLatex(e.epsilonCentiemes)})^2$.` }];
        return [{ texte: "Tape la puissance à la calculatrice, puis arrondis au dix-millième (4 décimales)." }, { texte: "L'écart entre la valeur et l'approximation doit être proche du premier terme négligé." }];
      case "D":
        if (p === "dEcran1") return [{ texte: "Relation de Pascal :", latex: "C_{n+1}^{k}=C_n^{k-1}+C_n^{k}" }, { texte: "Additionne les deux nombres voisins de la ligne donnée, celui de gauche et celui de droite." }];
        return [{ texte: "La somme des nombres de la ligne $n$ vaut $2^n$ (c'est le développement de $(1+1)^n$)." }, { texte: `Applique-le à la ligne $n=${e.n + 1}$.` }];
    }
  },
  reponseAttendue(e, p) {
    switch (e.famille) {
      case "A":
        if (p === "aEcran1") return [e.termes.map((x) => milliers(x.coefficientBinomial)).join("\\;;\\;")];
        if (p === "aEcran2") return [e.termes.map((x) => milliers(x.coefficientFinal)).join("\\;;\\;")];
        return [polynomeLatex(e.termes.map((x) => ({ coefficient: x.coefficientFinal, exposant: x.exposantX })))];
      case "B":
        if (p === "bTrouverKEcran") return [`k=${e.k}`];
        if (p === "bPoserEcran") return [`C_{${e.n}}^{${e.k}}=${milliers(e.coefficientBinomial)}`, `${par(e.a)}^{${e.n - e.k}}=${milliers(e.aPuissance)}`, `${par(e.b)}^{${e.k}}=${milliers(e.bPuissance)}`];
        return [milliers(e.coefficientFinal)];
      case "C":
        if (p === "cEcran1") return [fractionDecimale(versNombre(approximationC(e)))];
        if (p === "cEcran2") return [fractionDecimale(versNombre(termeNegligeC(e)))];
        return [`\\approx ${arrondiLatex(versNombre(valeurExacteC(e)), 4)}`];
      case "D":
        if (p === "dEcran1") return [e.positions.map((k) => `C_{${e.n + 1}}^{${k}}=${milliers(Number(combinaisonBig(e.n + 1, k)))}`).join("\\;;\\;")];
        return [`2^{${e.n + 1}}=${milliers(2 ** (e.n + 1))}`];
    }
  },
  explication(e, p) {
    switch (e.famille) {
      case "A":
        if (p === "aEcran1") return [f(`Ligne ${e.n} du triangle de Pascal : $${e.termes.map((x) => x.coefficientBinomial).join("\\;;\\;")}$.`)];
        if (p === "aEcran2")
          return e.termes.map((x) => f(`$k=${x.k}$ : $${x.coefficientBinomial}\\times ${par(e.a)}^{${x.exposantX}}\\times ${par(e.b)}^{${x.k}}=${milliers(x.coefficientFinal)}$`));
        return [f(`$${binomeLatex(e.a, e.b, e.n)}=${polynomeLatex(e.termes.map((x) => ({ coefficient: x.coefficientFinal, exposant: x.exposantX })))}$`)];
      case "B":
        if (p === "bTrouverKEcran") return [f(e.sousType === "rang" ? `$T_{${e.rang}}=T_{k+1}$ donne $k=${e.rang}-1=${e.k}$.` : `$${e.n}-k=${e.p}$ donne $k=${e.k}$.`)];
        if (p === "bPoserEcran") return [f(`$C_{${e.n}}^{${e.k}}=${milliers(e.coefficientBinomial)}$, $${par(e.a)}^{${e.n - e.k}}=${milliers(e.aPuissance)}$, $${par(e.b)}^{${e.k}}=${milliers(e.bPuissance)}$.`)];
        return [f(`$${milliers(e.coefficientBinomial)}\\times ${par(e.aPuissance)}\\times ${par(e.bPuissance)}=${milliers(e.coefficientFinal)}$, donc ${e.sousType === "rang" ? `$T_{${e.rang}}=${monome(e.coefficientFinal, e.p, true)}$` : `le terme est $${monome(e.coefficientFinal, e.p, true)}$`}.`)];
      case "C": {
        const eps = epsilonLatex(e.epsilonCentiemes);
        if (p === "cEcran1") return [f(`$1+${e.n}\\times ${par(e.epsilonCentiemes) === `${e.epsilonCentiemes}` ? eps : `(${eps})`}=${fractionDecimale(versNombre(approximationC(e)))}$.`)];
        if (p === "cEcran2") return [f(`$C_{${e.n}}^{2}\\times (${eps})^2=${e.n * (e.n - 1) / 2}\\times ${decimalLatex((e.epsilonCentiemes / 100) ** 2)}=${fractionDecimale(versNombre(termeNegligeC(e)))}$.`)];
        const v = versNombre(valeurExacteC(e));
        const ecart = v - versNombre(approximationC(e));
        return [f(`$(${baseLatex(e.epsilonCentiemes)})^{${e.n}}\\approx ${arrondiLatex(v, 4)}$ ; l'écart avec l'approximation vaut environ $${arrondiLatex(ecart, 4)}$, proche du premier terme négligé.`)];
      }
      case "D":
        if (p === "dEcran1") return e.positions.map((k) => f(`$C_{${e.n + 1}}^{${k}}=${milliers(e.ligne[k - 1])}+${milliers(e.ligne[k])}=${milliers(e.ligne[k - 1] + e.ligne[k])}$`));
        return [f(`$2^{${e.n + 1}}=${milliers(2 ** (e.n + 1))}$ (double de la somme de la ligne ${e.n}, $2^{${e.n}}=${milliers(2 ** e.n)}$).`)];
    }
  },
  libellePhase(e, p) {
    switch (e.famille) {
      case "A":
        return p === "aEcran1" ? "Coefficients binomiaux" : p === "aEcran2" ? "Coefficients des termes" : "Polynôme développé";
      case "B":
        return p === "bTrouverKEcran" ? "Valeur de k" : p === "bPoserEcran" ? "Trois facteurs" : "Coefficient";
      case "C":
        return p === "cEcran1" ? "Approximation" : p === "cEcran2" ? "Terme négligé" : "Valeur et comparaison";
      case "D":
        return p === "dEcran1" ? "Ligne suivante" : "Somme de la ligne";
    }
  },
  messageCible(e, p, valeurs) {
    const v = valeurs[valeurs.length - 1] ?? "";
    switch (e.famille) {
      case "B":
        if (p === "bTrouverKEcran" && e.sousType === "rang" && vaut(v, e.rang)) return f(`Le terme $T_{k+1}$ a pour indice $k$ : le rang dépasse $k$ de 1.`);
        if (p === "bTrouverKEcran" && e.sousType === "puissance" && vaut(v, e.p)) return f("$k$ est l'exposant de $b$, pas celui de $x$.");
        if (p === "bCalculerEcran" && vaut(v, -e.coefficientFinal)) return [t("Vérifie le signe : une puissance impaire d'un nombre négatif est négative.")];
        return null;
      case "C":
        if (p === "cEcran1" && vaut(v, 1 + e.epsilonCentiemes / 100)) return f("N'oublie pas de multiplier $\\varepsilon$ par $n$.");
        return null;
      case "D":
        if (p === "dEcran2" && vaut(v, 2 ** e.n)) return [t("Cette somme est celle de la ligne donnée ; on demande celle de la ligne suivante.")];
        return null;
      default:
        return null;
    }
  },
};

/** Décimal exact en KaTeX (« 1{,}16 », « 0{,}0028 »). */
function fractionDecimale(x: number): string {
  return decimalLatex(x, 12);
}

