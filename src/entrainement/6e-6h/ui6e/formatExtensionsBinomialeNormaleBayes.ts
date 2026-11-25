import type { ExerciceExtA, ExerciceExtensionsBinomialeNormaleBayes } from "../core6e/extensionsBinomialeNormaleBayes.types";
import { frontiereA } from "../generateurs6e/extensionsBinomialeNormaleBayes/familles";
import { bayesD, esperanceF, intersectionD, pA, probabilitesF, referenceA, totaleD, totalF } from "../moteur6e/verificationExtensionsBinomialeNormaleBayes";
import type { PhaseExtensionsBinomialeNormaleBayes } from "../moteur6e/typesExtensionsBinomialeNormaleBayes";
import { versNombre } from "../moteur6e/saisieCombinatoire";
import type { Rationnel } from "../moteur6e/saisieCombinatoire";
import { inequationInverse, vautEnviron } from "../moteur6e/saisieVariablesAleatoires";
import { arrondiLatex, decimalLatex, f, fractionLatex, m, milliersTexte, t } from "./fragmentsCombinatoire";
import type { ChampCombi, FormatCombinatoire, FragmentConsigne } from "./fragmentsCombinatoire";

/**
 * Textes de `6gen52` (6e ch. 8, § 7, Transférer) — audit, lot C : X et S toujours définis, données en
 * prose (pourcentages écrits comme dans un énoncé), notation P(A|B) du ch. 6, virgule décimale, aucun
 * exemple de champ (avant : « ex : (1-0.06)^n < 0.09999999999999998 », la réponse en notation clavier),
 * aides qui ne donnent plus « n ≈ 9.903 ».
 */

type E = ExerciceExtensionsBinomialeNormaleBayes;
type P = PhaseExtensionsBinomialeNormaleBayes;

/** p (ou 1 − p) en KaTeX : fraction irréductible, ou décimal si le dénominateur est 100. */
function pLatexDe(num: number, den: number): string {
  if (den === 100 || den === 10) return decimalLatex(num / den);
  return `\\dfrac{${num}}{${den}}`;
}
function pLatex(e: ExerciceExtA): string {
  return pLatexDe(e.pNum, e.pDen);
}
function unMoinsPLatex(e: ExerciceExtA): string {
  return pLatexDe(e.pDen - e.pNum, e.pDen);
}
function qLatex(e: ExerciceExtA): string {
  const q = unMoinsPLatex(e);
  return q.startsWith("\\dfrac") ? `\\left(${q}\\right)` : q;
}

function probaLatex(r: Rationnel): string {
  const x = versNombre(r);
  if (Math.abs(Number(x.toFixed(6)) - x) < 1e-12) return decimalLatex(x);
  return `${fractionLatex(r)}\\approx ${arrondiLatex(x, 3)}`;
}

const C = (i: number) => `C_{${i + 1}}`;

export const FORMAT_6GEN52: FormatCombinatoire<E, P> = {
  consigneGenerale(e) {
    if (e.famille === "A") return [t("Trouve le plus petit nombre de répétitions qui convient, à l'aide du logarithme.")];
    if (e.famille === "D") return [t("Probabilités exactes, ou arrondies au millième.")];
    return [t("On note "), m("X"), t(` ${e.definitionX}. Probabilités exactes ; espérance exacte.`)];
  },
  donnees(e): FragmentConsigne[][] {
    if (e.famille === "A") return [[t(e.texte)], [t(`Combien de ${e.unite} faut-il au minimum pour que la probabilité qu'${e.evenement} dépasse `), m(decimalLatex(e.seuil)), t(" ?")]];
    if (e.famille === "D") {
      const c = e.contexte;
      return [
        [t(`${c.intro} : `), m(C(0)), t(` (${c.categories[0]}) pour ${e.q[0]} %, `), m(C(1)), t(` (${c.categories[1]}) pour ${e.q[1]} % et `), m(C(2)), t(` (${c.categories[2]}) pour le reste.`)],
        [t("On note "), m("S"), t(` l'événement « ${c.critere} ». Dans la catégorie `), m(C(0)), t(", "), m("S"), t(` est réalisé dans ${e.r[0]} % des cas ; dans `), m(C(1)), t(`, ${e.r[1]} % ; dans `), m(C(2)), t(`, ${e.r[2]} %.`)],
        [t(`On choisit au hasard ${c.individu} et l'on constate que `), m("S"), t(" est réalisé. Quelle est la probabilité qu'il s'agisse de la catégorie "), m(C(e.j)), t(` (${c.categories[e.j]}) ?`)],
      ];
    }
    return [
      [t(`${e.texte} : ${e.labels[0]} (${e.valeurs[0]} €), ${e.labels[1]} (${e.valeurs[1]} €) et ${e.labels[2]} (${e.valeurs[2]} €).`)],
      [t(`${e.pourcentage1} % des ${e.individus} ont choisi ${e.labels[0]}, ${e.pourcentage2} % ${e.labels[1]}, et les autres ${e.labels[2]}.`)],
      [t(`On compte ${milliersTexte(e.population)} ${e.individus}.`)],
    ];
  },
  consigneEcran(e, p) {
    switch (p) {
      case "aP":
        return [t("Quelle est la probabilité "), m("p"), t(" de succès à chaque répétition ?")];
      case "aInequation":
        return [t("Écris l'inéquation en "), m("n"), t(" qui traduit la condition.")];
      case "aIsole":
        return [t("Résous l'inéquation : isole "), m("n"), t(".")];
      case "aN":
        return e.famille === "A" ? [t(`Quel est le plus petit nombre de ${e.unite} qui convient ?`)] : [];
      case "dTotale":
        return [t("Calcule "), m("P(S)"), t(".")];
      case "dIntersection":
        return e.famille === "D" ? [t("Calcule "), m(`P(${C(e.j)}\\cap S)`), t(".")] : [];
      case "dBayes":
        return e.famille === "D" ? [t("Déduis-en "), m(`P(${C(e.j)}\\mid S)`), t(".")] : [];
      case "fLoi":
        return [t("Donne la loi de "), m("X"), t(" : la probabilité de chaque montant.")];
      case "fEsperance":
        return [t("Calcule l'espérance "), m("E(X)"), t(".")];
      case "fTotal":
        return e.famille === "F" ? [t(`Quel montant total, en euros, peut-on attendre chaque mois des ${milliersTexte(e.population)} ${e.individus} ?`)] : [];
    }
  },
  champs(e, p): ChampCombi[] {
    switch (p) {
      case "aP":
        return [{ type: "texte", label: "$p$" }];
      case "aInequation":
        return [{ type: "texte", label: "Inéquation en $n$", placeholder: "inéquation en n" }];
      case "aIsole":
        return [{ type: "texte", label: "$n$ isolé", placeholder: "n seul d'un côté" }];
      case "aN":
        return [{ type: "texte", label: "$n$" }];
      case "dTotale":
        return [{ type: "texte", label: "$P(S)$" }];
      case "dIntersection":
        return e.famille === "D" ? [{ type: "texte", label: `$P(${C(e.j)}\\cap S)$` }] : [];
      case "dBayes":
        return e.famille === "D" ? [{ type: "texte", label: `$P(${C(e.j)}\\mid S)$` }] : [];
      case "fLoi":
        return e.famille === "F" ? e.valeurs.map((v) => ({ type: "texte" as const, label: `$P(X=${v})$` })) : [];
      case "fEsperance":
        return [{ type: "texte", label: "$E(X)$" }];
      case "fTotal":
        return [{ type: "texte", label: "Total (en €)" }];
    }
  },
  aides(e, p) {
    switch (p) {
      case "aP":
        return e.famille === "A" && e.sousType === "compose"
          ? [{ texte: "Pour deux événements indépendants, la probabilité qu'ils se réalisent tous les deux est le produit :", latex: "P(A\\cap B)=P(A)\\times P(B)" }, { texte: "Repère les deux événements qui doivent se produire ensemble, et la probabilité de chacun." }]
          : [{ texte: "Issues équiprobables : nombre de cas favorables divisé par le nombre de cas possibles (ou probabilité donnée par le texte)." }, { texte: "Compte les issues qui font gagner une répétition (une fraction ou un pourcentage conviennent)." }];
      case "aInequation":
        return [
          { texte: "« Au moins un succès » est le contraire de « aucun succès » ; sur $n$ répétitions :", latex: "P(\\text{au moins un succès})=1-(1-p)^n" },
          { texte: "Remplace $p$ par la valeur de l'écran précédent ; la probabilité doit dépasser le seuil." },
        ];
      case "aIsole":
        return [
          { texte: "Isole la puissance, puis prends le logarithme des deux membres :", latex: "\\ln\\left(a^n\\right)=n\\ln a" },
          { texte: "Le logarithme d'un nombre entre 0 et 1 est négatif : diviser par un nombre négatif change le sens de l'inégalité." },
        ];
      case "aN":
        return [{ texte: "$n$ est un nombre entier : prends le premier entier qui vérifie l'inéquation." }, { texte: "Contrôle à la calculatrice : la probabilité doit dépasser le seuil pour ce nombre, et pas pour le précédent." }];
      case "dTotale":
        return e.famille === "D"
          ? [
              { texte: "Probabilités totales : les trois catégories se partagent la population, donc :", latex: "P(S)=\\sum_{i=1}^{3}P(C_i)\\times P(S\\mid C_i)" },
              { texte: `Traduis les pourcentages : $P(C_1)=${decimalLatex(e.q[0] / 100)}$, $P(S\\mid C_1)=${decimalLatex(e.r[0] / 100)}$, et de même pour $C_2$ et $C_3$ (la part de $C_3$ est le reste).` },
            ]
          : [];
      case "dIntersection":
        return e.famille === "D" ? [{ texte: "Probabilité d'un « et » le long d'une branche de l'arbre :", latex: `P(${C(e.j)}\\cap S)=P(${C(e.j)})\\times P(S\\mid ${C(e.j)})` }, { texte: `Utilise les données de la catégorie $${C(e.j)}$.` }] : [];
      case "dBayes":
        return e.famille === "D" ? [{ texte: "Formule de Bayes : on sait que $S$ est réalisé, on remonte à la catégorie :", latex: `P(${C(e.j)}\\mid S)=\\dfrac{P(${C(e.j)}\\cap S)}{P(S)}` }, { texte: "Divise le résultat de l'écran précédent par $P(S)$ du premier écran." }] : [];
      case "fLoi":
        return [{ texte: "La probabilité d'un montant est la proportion des personnes qui l'ont choisi ; les trois probabilités ont pour somme 1." }, { texte: "La troisième option rassemble « les autres » : retrouve sa part par différence." }];
      case "fEsperance":
        return [{ texte: "Moyenne des montants pondérée par leurs probabilités :", latex: "E(X)=\\sum x_i\\,P(X=x_i)" }, { texte: "Utilise la loi de l'écran précédent." }];
      case "fTotal":
        return [{ texte: "En moyenne, chaque personne paie $E(X)$ : le total attendu est la taille de la population multipliée par $E(X)$." }, { texte: "Utilise l'espérance de l'écran précédent." }];
    }
  },
  reponseAttendue(e, p) {
    if (e.famille === "A") {
      const fr = frontiereA(pA(e), e.seuil);
      if (p === "aP") return [e.facteurs ? `p=${e.facteurs.join("\\times ")}=${pLatex(e)}` : `p=${pLatex(e)}`];
      if (p === "aInequation") return [`1-${qLatex(e)}^{n}>${decimalLatex(e.seuil)}`];
      if (p === "aIsole") return [`n>\\dfrac{\\ln(${decimalLatex(1 - e.seuil)})}{\\ln${unMoinsPLatex(e).startsWith("\\dfrac") ? `\\left(${unMoinsPLatex(e)}\\right)` : `(${unMoinsPLatex(e)})`}}\\approx ${arrondiLatex(fr, 2)}`];
      return [`n=${e.valeurN}`];
    }
    if (e.famille === "D") {
      if (p === "dTotale") return [`P(S)=${probaLatex(totaleD(e))}`];
      if (p === "dIntersection") return [`P(${C(e.j)}\\cap S)=${probaLatex(intersectionD(e))}`];
      return [`P(${C(e.j)}\\mid S)=${probaLatex(bayesD(e))}`];
    }
    if (p === "fLoi") return probabilitesF(e).map((x, i) => `P(X=${e.valeurs[i]})=${decimalLatex(x)}`);
    if (p === "fEsperance") return [`E(X)=${decimalLatex(esperanceF(e))}`];
    return [`${decimalLatex(totalF(e))}\\text{ euros}`];
  },
  explication(e, p) {
    if (e.famille === "A") {
      const q = qLatex(e);
      const fr = frontiereA(pA(e), e.seuil);
      if (p === "aP") return [f(e.facteurs ? `Les deux événements sont indépendants : $p=${e.facteurs.join("\\times ")}=${pLatex(e)}$.` : `$p=${pLatex(e)}$.`)];
      if (p === "aInequation") return [f(`« Au moins un succès » : $1-${q}^{n}$. Il faut $1-${q}^{n}>${decimalLatex(e.seuil)}$.`)];
      if (p === "aIsole") return [f(`$${q}^{n}<${decimalLatex(1 - e.seuil)}$, donc $n\\ln${q.startsWith("\\left") ? q : `(${q})`}<\\ln(${decimalLatex(1 - e.seuil)})$ ; ce logarithme est négatif, le sens change : $n>${arrondiLatex(fr, 2)}$ (environ).`)];
      const n = e.valeurN;
      const pp = pA(e);
      return [f(`Premier entier au-delà de $${arrondiLatex(fr, 2)}$ : $n=${n}$. Contrôle : $1-${q}^{${n - 1}}\\approx ${arrondiLatex(1 - (1 - pp) ** (n - 1), 4)}$ et $1-${q}^{${n}}\\approx ${arrondiLatex(1 - (1 - pp) ** n, 4)}$.`)];
    }
    if (e.famille === "D") {
      const termes = [0, 1, 2].map((i) => `${decimalLatex(e.q[i] / 100)}\\times ${decimalLatex(e.r[i] / 100)}`);
      if (p === "dTotale") return [f(`$P(S)=${termes.join("+")}=${probaLatex(totaleD(e))}$.`)];
      if (p === "dIntersection") return [f(`$P(${C(e.j)}\\cap S)=${termes[e.j]}=${probaLatex(intersectionD(e))}$.`)];
      return [f(`$P(${C(e.j)}\\mid S)=\\dfrac{${decimalLatex(versNombre(intersectionD(e)))}}{${decimalLatex(versNombre(totaleD(e)))}}=${probaLatex(bayesD(e))}$ : sachant S, la part de $${C(e.j)}$ passe de $${decimalLatex(e.q[e.j] / 100)}$ à environ $${arrondiLatex(versNombre(bayesD(e)), 3)}$.`)];
    }
    const pr = probabilitesF(e);
    if (p === "fLoi") return [f(`$P(X=${e.valeurs[0]})=${decimalLatex(pr[0])}$, $P(X=${e.valeurs[1]})=${decimalLatex(pr[1])}$ et, par différence, $P(X=${e.valeurs[2]})=1-${decimalLatex(pr[0])}-${decimalLatex(pr[1])}=${decimalLatex(pr[2])}$.`)];
    if (p === "fEsperance") return [f(`$E(X)=${e.valeurs.map((v, i) => `${v}\\times ${decimalLatex(pr[i])}`).join("+")}=${decimalLatex(esperanceF(e))}$ €.`)];
    return [f(`$${milliersTexte(e.population).replace(/ /g, "\\,")}\\times ${decimalLatex(esperanceF(e))}=${decimalLatex(totalF(e))}$ €.`)];
  },
  libellePhase(_e, p) {
    const l: Record<P, string> = {
      aP: "Probabilité p",
      aInequation: "Inéquation",
      aIsole: "n isolé",
      aN: "n minimal",
      dTotale: "P(S)",
      dIntersection: "Intersection",
      dBayes: "Bayes",
      fLoi: "Loi de X",
      fEsperance: "Espérance",
      fTotal: "Total attendu",
    };
    return l[p];
  },
  messageCible(e, p, valeurs) {
    const v = valeurs[0] ?? "";
    if (e.famille === "A") {
      if ((p === "aInequation" || p === "aIsole") && inequationInverse(v, referenceA(e), frontiereA(pA(e), e.seuil)))
        return p === "aIsole" ? f("Le sens est inversé : $\\ln(1-p)$ est négatif, et diviser par un nombre négatif change le sens de l'inégalité.") : [t("Le sens est inversé : la probabilité doit dépasser le seuil.")];
      if (p === "aN" && v.replace(/\D/g, "") === String(e.valeurN - 1)) return [t("Pour ce nombre, la probabilité ne dépasse pas encore le seuil : prends l'entier suivant.")];
      return null;
    }
    if (e.famille === "D") {
      if (p === "dBayes") {
        if (vautEnviron(v, e.q[e.j] / 100)) return [t("C'est la part de la catégorie dans toute la population : ici, on sait déjà que S est réalisé.")];
        if (vautEnviron(v, e.r[e.j] / 100)) return [t("C'est la probabilité de S dans la catégorie : le conditionnement est inversé.")];
        if (vautEnviron(v, versNombre(intersectionD(e)))) return [t("C'est la probabilité de l'intersection : divise-la par P(S).")];
      }
      if (p === "dTotale" && vautEnviron(v, (e.r[0] + e.r[1] + e.r[2]) / 300)) return [t("C'est la moyenne simple des trois pourcentages : pondère chacun par la part de sa catégorie.")];
      return null;
    }
    if (p === "fEsperance" && vautEnviron(v, (e.valeurs[0] + e.valeurs[1] + e.valeurs[2]) / 3)) return [t("C'est la moyenne simple des montants : pondère chacun par sa probabilité.")];
    if (p === "fTotal" && vautEnviron(v, esperanceF(e))) return [t("C'est le montant moyen d'une personne : multiplie par la taille de la population.")];
    return null;
  },
};
