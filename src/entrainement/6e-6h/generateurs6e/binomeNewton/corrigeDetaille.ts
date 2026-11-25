import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import type { ExerciceBinomeA, ExerciceBinomeB, ExerciceBinomeC, ExerciceBinomeD, ExerciceBinomeNewton } from "../../core6e/binomeNewton.types";
import { approximationC, termeNegligeC, valeurExacteC } from "../../moteur6e/verificationBinomeNewton";
import { combinaisonBig, rationnel, versNombre } from "../../moteur6e/saisieCombinatoire";
import { arrondiLatex, milliers } from "../../ui6e/fragmentsCombinatoire";
import { baseLatex45, binomeLatex, epsilonLatex45, monome45, par45, puissanceX45 } from "../../ui6e/formatBinomeNewton";
import { CC, COURS_BINOME, par, calcul, decimalExact, finaliserCombinatoire, fx, latex, ligne, lignesCombinaison, piege, resultat, texte, utiliseCours, verification } from "../../ui6e/corrigeCombinatoire";

/**
 * Corrigé détaillé « comme au tableau » de `6gen45` (6e ch. 7, § 3), une lettre par écran — MÊME source
 * pour l'écran révélé et pour le papier : A) coefficients binomiaux (symétrie), coefficients des termes,
 * polynôme ; B) k (rang k + 1 ou puissance n − k), les trois facteurs, le coefficient ; C) 1 + nε, terme
 * négligé, valeur et écart ; D) relation de Pascal, somme 2ⁿ.
 */

type E = ExerciceBinomeNewton;

/** Polynôme en morceaux insécables d'au plus trois termes (une formule longue ne se coupe jamais). */
function polynomeEnMorceaux(gauche: string, termes: { coefficient: number; exposant: number }[]): FragmentConsigne[] {
  const r: FragmentConsigne[] = [];
  const nonNuls = termes.filter((x) => x.coefficient !== 0);
  for (let i = 0; i < nonNuls.length; i += 3) {
    const morceau = nonNuls
      .slice(i, i + 3)
      .map((x, j) => monome45(x.coefficient, x.exposant, i === 0 && j === 0))
      .join("");
    if (i > 0) r.push(texte(" "));
    r.push(latex(`{${i === 0 ? `${gauche}=` : "{}"}${morceau}}`));
  }
  return r;
}

function dec(r: ReturnType<typeof rationnel>): string {
  return decimalExact(r)?.latex ?? arrondiLatex(versNombre(r), 6);
}

function corrigeA(e: ExerciceBinomeA): EtapeCorrection[] {
  const lignesA: LigneCalcul[] = [];
  for (let k = 0; k <= Math.floor(e.n / 2); k++) {
    const v = milliers(combinaisonBig(e.n, k));
    lignesA.push(ligne(k === e.n - k ? `${CC(e.n, k)}=${v}` : `${CC(e.n, k)}=${CC(e.n, e.n - k)}=${v}`, k === 0 ? "un seul choix" : k === 1 ? `${e.n} choix` : fx(`$\\dfrac{${Array.from({ length: k }, (_, i) => e.n - i).join("\\times ")}}{${k}!}$`)));
  }
  const termes = e.termes.map((x) => ({ coefficient: x.coefficientFinal, exposant: x.exposantX }));
  const binome = binomeLatex(e.a, e.b, e.n);
  return [
    utiliseCours("a", fx("Les coefficients binomiaux $C_n^k$ forment la ligne $n$ du triangle de Pascal ; ils sont symétriques, $C_n^k=C_n^{n-k}$"), COURS_BINOME),
    calcul("a", lignesA),
    resultat("a", fx(`Ligne ${e.n} : $${e.termes.map((x) => milliers(x.coefficientBinomial)).join("\\;;\\;")}$`)),
    utiliseCours("b", fx(`Binôme de Newton : le terme d'indice $k$ est $C_n^k\\,(ax)^{n-k}\\,b^k$, de coefficient $C_n^k\\,a^{n-k}\\,b^k$ ; ici $a=${e.a}$ et $b=${e.b}$`), COURS_BINOME),
    calcul("b", e.termes.map((x) => ligne(`c_{${x.k}}=${milliers(x.coefficientBinomial)}\\times ${par45(e.a)}^{${x.exposantX}}\\times ${par45(e.b)}^{${x.k}}=${milliers(x.coefficientFinal)}`, x.exposantX === 0 ? "terme constant" : fx(`terme en $${puissanceX45(x.exposantX)}$`)))),
    resultat("b", fx(`Coefficients : $${e.termes.map((x) => milliers(x.coefficientFinal)).join("\\;;\\;")}$`)),
    utiliseCours("c", fx("On écrit chaque terme « coefficient × puissance de $x$ », du plus haut degré au terme constant"), COURS_BINOME),
    resultat("c", polynomeEnMorceaux(binome, termes)),
    verification("c", fx(`Pour $x=1$, le polynôme vaut la somme de ses coefficients, $${milliers(termes.reduce((s, x) => s + x.coefficient, 0))}$, et $(${e.a}${e.b < 0 ? "" : "+"}${e.b})^{${e.n}}=${milliers((e.a + e.b) ** e.n)}$.`)),
    piege("b", fx(e.a < 0 || e.b < 0 ? "Oublier le signe : une puissance impaire d'un nombre négatif est négative." : "Oublier la puissance du coefficient de $x$ : $(ax)^{n-k}=a^{n-k}x^{n-k}$.")),
  ];
}

function corrigeB(e: ExerciceBinomeB): EtapeCorrection[] {
  const rang = e.sousType === "rang";
  const lignesA: LigneCalcul[] = rang ? [ligne(`k+1=${e.rang}`, fx(`$T_{${e.rang}}=T_{k+1}$`)), ligne(`k=${e.k}`)] : [ligne(`${e.n}-k=${e.p}`, "l'exposant de x est n − k"), ligne(`k=${e.k}`)];
  return [
    utiliseCours("a", fx(rang ? "Le terme de rang $k+1$ est $T_{k+1}=C_n^k\\,(ax)^{n-k}\\,b^k$ : le premier terme correspond à $k=0$" : "Dans $C_n^k\\,(ax)^{n-k}\\,b^k$, l'exposant de $x$ est $n-k$"), COURS_BINOME),
    calcul("a", lignesA),
    resultat("a", fx(`$k=${e.k}$`)),
    utiliseCours("b", fx(`Le terme contient $C_n^k$, $a^{n-k}$ et $b^k$, avec $n=${e.n}$, $a=${e.a}$, $b=${e.b}$`), COURS_BINOME),
    calcul("b", [...lignesCombinaison(e.n, e.k), ligne(`${par45(e.a)}^{${e.n - e.k}}=${milliers(e.aPuissance)}`), ligne(`${par45(e.b)}^{${e.k}}=${milliers(e.bPuissance)}`)]),
    resultat("b", fx(`$${CC(e.n, e.k)}=${milliers(e.coefficientBinomial)}$ ; $${par45(e.a)}^{${e.n - e.k}}=${milliers(e.aPuissance)}$ ; $${par45(e.b)}^{${e.k}}=${milliers(e.bPuissance)}$`)),
    utiliseCours("c", fx("Le coefficient est le produit des trois facteurs"), COURS_BINOME),
    calcul("c", [ligne(`c=${milliers(e.coefficientBinomial)}\\times ${par(e.aPuissance)}\\times ${par(e.bPuissance)}`), ligne(`=${milliers(e.coefficientFinal)}`)]),
    resultat("c", fx(rang ? `$T_{${e.rang}}=${monome45(e.coefficientFinal, e.p, true)}$` : `Le coefficient du terme en $${puissanceX45(e.p)}$ est $${milliers(e.coefficientFinal)}$.`)),
    piege("a", fx(rang ? `Prendre $k=${e.rang}$ : le terme de rang ${e.rang} a pour indice $k=${e.rang}-1$.` : `Prendre $k=${e.p}$ : $k$ est l'exposant de $b$, celui de $x$ vaut $n-k$.`)),
  ];
}

function corrigeC(e: ExerciceBinomeC): EtapeCorrection[] {
  const eps = epsilonLatex45(e.epsilonCentiemes);
  const epsPar = e.epsilonCentiemes < 0 ? `(${eps})` : eps;
  const approx = approximationC(e);
  const neglige = termeNegligeC(e);
  const v = versNombre(valeurExacteC(e));
  const ecart = v - versNombre(approx);
  return [
    utiliseCours("a", fx("Pour $\\varepsilon$ proche de 0 et $n\\varepsilon$ petit, on garde les deux premiers termes du binôme : $(1+\\varepsilon)^n\\approx 1+n\\varepsilon$"), COURS_BINOME),
    calcul("a", [ligne(`n=${e.n}`), ligne(`\\varepsilon=${eps}`), ligne(`1+n\\varepsilon=1+${e.n}\\times ${epsPar}`), ligne(`=${dec(approx)}`)]),
    resultat("a", fx(`$(${baseLatex45(e.epsilonCentiemes)})^{${e.n}}\\approx ${dec(approx)}$`)),
    utiliseCours("b", fx("Le terme suivant du binôme est $C_n^2\\,\\varepsilon^2$ : il donne l'ordre de grandeur de l'erreur"), COURS_BINOME),
    calcul("b", [ligne(`C_{${e.n}}^{2}\\,\\varepsilon^2=${milliers(combinaisonBig(e.n, 2))}\\times ${epsPar}^{2}`), ligne(`=${milliers(combinaisonBig(e.n, 2))}\\times ${dec(rationnel(e.epsilonCentiemes * e.epsilonCentiemes, 10000))}`), ligne(`=${dec(neglige)}`)]),
    resultat("b", fx(`Terme négligé : $${dec(neglige)}$`)),
    utiliseCours("c", fx("À la calculatrice, puis on compare l'écart avec le terme négligé"), COURS_BINOME),
    calcul("c", [ligne(`(${baseLatex45(e.epsilonCentiemes)})^{${e.n}}\\approx ${arrondiLatex(v, 4)}`, "calculatrice, au dix-millième"), ligne(`\\text{écart}\\approx ${arrondiLatex(v, 4)}-${dec(approx)}`), ligne(`\\approx ${arrondiLatex(ecart, 4)}`)]),
    resultat("c", fx(`L'écart (environ $${arrondiLatex(ecart, 4)}$) est proche du terme négligé ($${dec(neglige)}$) : l'approximation est bonne.`)),
    piege("a", fx("Oublier de multiplier $\\varepsilon$ par $n$ : $(1+\\varepsilon)^n$ n'est pas proche de $1+\\varepsilon$.")),
  ];
}

function corrigeD(e: ExerciceBinomeD): EtapeCorrection[] {
  return [
    utiliseCours("a", fx("Relation de Pascal : chaque nombre est la somme des deux nombres situés au-dessus de lui, $C_{n+1}^{k}=C_n^{k-1}+C_n^{k}$"), COURS_BINOME),
    calcul("a", e.positions.map((k) => ligne(`C_{${e.n + 1}}^{${k}}=${milliers(e.ligne[k - 1])}+${milliers(e.ligne[k])}=${milliers(e.ligne[k - 1] + e.ligne[k])}`, fx(`$${CC(e.n, k - 1)}+${CC(e.n, k)}$`)))),
    resultat("a", fx(e.positions.map((k) => `$C_{${e.n + 1}}^{${k}}=${milliers(e.ligne[k - 1] + e.ligne[k])}$`).join(" ; "))),
    utiliseCours("b", fx("La somme des nombres de la ligne $n$ vaut $2^n$ : c'est le développement de $(1+1)^n$"), COURS_BINOME),
    calcul("b", [ligne(`\\text{somme}=2^{${e.n + 1}}`), ligne(`=${milliers(2 ** (e.n + 1))}`)]),
    resultat("b", fx(`La somme de la ligne ${e.n + 1} vaut $${milliers(2 ** (e.n + 1))}$.`)),
    verification("b", fx(`Elle double celle de la ligne ${e.n} : $2\\times ${milliers(2 ** e.n)}=${milliers(2 ** (e.n + 1))}$.`)),
    piege("a", fx("Additionner deux nombres qui ne sont pas voisins : on additionne le nombre juste au-dessus à gauche et celui juste au-dessus à droite.")),
  ];
}

export function correctionDetailleeBinomeNewton(e: E): EtapeCorrection[] {
  switch (e.famille) {
    case "A":
      return finaliserCombinatoire(corrigeA(e));
    case "B":
      return finaliserCombinatoire(corrigeB(e));
    case "C":
      return finaliserCombinatoire(corrigeC(e));
    case "D":
      return finaliserCombinatoire(corrigeD(e));
  }
}
