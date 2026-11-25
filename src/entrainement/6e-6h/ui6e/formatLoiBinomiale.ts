import type { ExerciceLoiBinomiale } from "../core6e/loiBinomiale.types";
import { LIBELLES_CONDITION } from "../generateurs6e/loiBinomiale/contextes";
import { loiBinomialeExacte, probabiliteBinomiale } from "../generateurs6e/loiBinomiale/familleB";
import { frontiereC, uniteC } from "../generateurs6e/loiBinomiale/familleC";
import { esperanceEtVariance, referenceC } from "../moteur6e/verificationLoiBinomiale";
import type { PhaseLoiBinomiale } from "../moteur6e/typesLoiBinomiale";
import { combinaisonBig, versNombre } from "../moteur6e/saisieCombinatoire";
import type { Rationnel } from "../moteur6e/saisieCombinatoire";
import { inequationInverse, vautEnviron } from "../moteur6e/saisieVariablesAleatoires";
import { arrondiLatex, decimalLatex, f, fractionLatex, m, t } from "./fragmentsCombinatoire";
import type { ChampCombi, FormatCombinatoire, FragmentConsigne } from "./fragmentsCombinatoire";

/**
 * Textes de `6gen50` (6e ch. 8, § 2) — audit, lots B et C : notation 𝓑(n ; p) calligraphique
 * (décision 4), Cₙᵏ, virgule décimale, X défini dans chaque texte, aucun exemple de champ (avant :
 * « ex : 1-(1-1/10)^n > 9/10 », la réponse dans 100 % des C), aides qui ne donnent ni la stratégie ni
 * « n ≈ 21,854 ».
 */

type E = ExerciceLoiBinomiale;
type P = PhaseLoiBinomiale;

export const BINOMIALE = (n: string | number, p: string) => `\\mathcal{B}(${n}\\,;\\,${p})`;

function pLatex(num: number, den: number): string {
  if (den === 10 || den === 100) return decimalLatex(num / den);
  return `\\dfrac{${num}}{${den}}`;
}

function probaLatex(r: Rationnel): string {
  const x = versNombre(r);
  if (Math.abs(Number(x.toFixed(8)) - x) < 1e-14) return decimalLatex(x, 8);
  return `${fractionLatex(r)}\\approx ${arrondiLatex(x, 4)}`;
}

function termeLatex(n: number, p: number, k: number): string {
  return `C_{${n}}^{${k}}\\times ${decimalLatex(p)}^{${k}}\\times ${decimalLatex(1 - p)}^{${n - k}}`;
}

function frontiereLatex(e: E & { famille: "C" }): string {
  return `\\dfrac{\\ln(${decimalLatex(1 - e.seuil)})}{\\ln(${decimalLatex(1 - e.p)})}`;
}

export const FORMAT_6GEN50: FormatCombinatoire<E, P> = {
  consigneGenerale(e) {
    if (e.famille === "A") return [t("Lis la situation, puis décide si "), m("X"), t(" suit une loi binomiale.")];
    if (e.famille === "B") return [m("X"), t(" suit une loi binomiale. Probabilités : fraction ou décimal exact, ou arrondi au millième.")];
    return [t("Trouve le plus petit nombre d'épreuves qui convient, à l'aide du logarithme.")];
  },
  donnees(e): FragmentConsigne[][] {
    if (e.famille === "A" || e.famille === "B") return [f(e.texte)];
    return [f(e.texte), [t(`Combien de ${uniteC(e)} faut-il au minimum pour que la probabilité qu'${e.evenement} dépasse `), m(decimalLatex(e.seuil)), t(" ?")]];
  },
  consigneEcran(e, p) {
    switch (p) {
      case "aVerdict":
        return [t("La variable "), m("X"), t(" suit-elle une loi binomiale ?")];
      case "aParametres":
        return [t("Donne les paramètres de la loi : "), m(BINOMIALE("n", "p")), t(".")];
      case "aCondition":
        return [t("Quelle condition du schéma de Bernoulli n'est pas respectée ?")];
      case "bLoi":
        return [t("Complète la loi de "), m("X"), t(" : calcule "), m("P(X=k)"), t(" pour chaque valeur de "), m("k"), t(".")];
      case "bDiagramme":
        return [t("Lequel de ces diagrammes en barres représente la loi de "), m("X"), t(" ?")];
      case "bEV":
        return [t("Calcule l'espérance "), m("E(X)"), t(" et la variance "), m("V(X)"), t(" (valeurs exactes).")];
      case "bSigma":
        return [t("Calcule l'écart-type "), m("\\sigma(X)"), t(", arrondi au centième.")];
      case "cInequation":
        return [t("Écris l'inéquation en "), m("n"), t(" qui traduit la condition.")];
      case "cIsole":
        return [t("Résous l'inéquation : isole "), m("n"), t(".")];
      case "cN":
        return e.famille === "C" ? [t(`Quel est le plus petit nombre de ${uniteC(e)} qui convient ?`)] : [];
    }
  },
  champs(e, p): ChampCombi[] {
    switch (p) {
      case "aVerdict":
        return [
          {
            type: "choix",
            label: "",
            options: [
              { valeur: "oui", label: "Oui, c'est une loi binomiale" },
              { valeur: "non", label: "Non, ce n'est pas une loi binomiale" },
            ],
          },
        ];
      case "aParametres":
        return [
          { type: "texte", label: "$n$" },
          { type: "texte", label: "$p$" },
        ];
      case "aCondition":
        return [{ type: "choix", label: "", options: (Object.keys(LIBELLES_CONDITION) as (keyof typeof LIBELLES_CONDITION)[]).map((c) => ({ valeur: c, label: LIBELLES_CONDITION[c] })) }];
      case "bLoi":
        return e.famille === "B" ? Array.from({ length: e.n + 1 }, (_, k) => ({ type: "texte" as const, label: `$P(X=${k})$` })) : [];
      case "bDiagramme":
        return [{ type: "choix", label: "", options: [1, 2, 3].map((i) => ({ valeur: String(i), label: `Diagramme ${i}` })) }];
      case "bEV":
        return [
          { type: "texte", label: "$E(X)$" },
          { type: "texte", label: "$V(X)$" },
        ];
      case "bSigma":
        return [{ type: "texte", label: "$\\sigma(X)$" }];
      case "cInequation":
        return [{ type: "texte", label: "Inéquation en $n$", placeholder: "inéquation en n" }];
      case "cIsole":
        return [{ type: "texte", label: "$n$ isolé", placeholder: "n seul d'un côté" }];
      case "cN":
        return [{ type: "texte", label: "$n$" }];
    }
  },
  aides(e, p) {
    switch (p) {
      case "aVerdict":
      case "aCondition":
        return [
          { texte: "Loi binomiale : un nombre $n$ d'épreuves fixé à l'avance, indépendantes, à deux issues (succès ou échec), de même probabilité de succès $p$ ; $X$ compte les succès." },
          { texte: "Pose-toi les questions dans l'ordre : sait-on à l'avance combien d'épreuves on fait ? Le résultat d'une épreuve change-t-il les suivantes ? Que compte $X$ : des succès, ou autre chose ?" },
        ];
      case "aParametres":
        return [{ texte: "$n$ est le nombre d'épreuves ; $p$ est la probabilité d'un succès à une épreuve." }, { texte: "Repère combien de fois l'épreuve est répétée, et ce qui compte comme succès pour $X$ (une fraction ou un pourcentage conviennent pour $p$)." }];
      case "bLoi":
        return e.famille === "B"
          ? [
              { texte: "Pour chaque $k$ de $0$ à $n$ :", latex: "P(X=k)=C_n^k\\,p^k\\,(1-p)^{n-k}" },
              { texte: `Ici $n=${e.n}$, $p=${decimalLatex(e.p)}$ et $1-p=${decimalLatex(1 - e.p)}$. À la fin, la somme des probabilités doit valoir 1.` },
            ]
          : [];
      case "bDiagramme":
        return [{ texte: "Le sommet du diagramme est la valeur de $k$ la plus probable ; elle est proche de $n\\times p$." }, { texte: "Compare avec ta loi : quelle valeur a la plus grande probabilité, et de quel côté le diagramme s'étire-t-il ?" }];
      case "bEV":
        return e.famille === "B" ? [{ texte: "Pour une loi binomiale :", latex: "E(X)=n\\,p\\qquad V(X)=n\\,p\\,(1-p)" }, { texte: `Ici $n=${e.n}$ et $p=${decimalLatex(e.p)}$.` }] : [];
      case "bSigma":
        return [{ texte: "L'écart-type est la racine carrée de la variance :", latex: "\\sigma(X)=\\sqrt{V(X)}" }, { texte: "Utilise la variance de l'écran précédent." }];
      case "cInequation":
        return e.famille === "C"
          ? [
              { texte: "« Au moins un succès » est le contraire de « aucun succès » ; sur $n$ épreuves :", latex: "P(\\text{au moins un succès})=1-(1-p)^n" },
              { texte: `Ici $p=${decimalLatex(e.p)}$ et la probabilité doit dépasser $${decimalLatex(e.seuil)}$.` },
            ]
          : [];
      case "cIsole":
        return [
          { texte: "Isole la puissance, puis prends le logarithme des deux membres :", latex: "\\ln\\left(a^n\\right)=n\\ln a" },
          { texte: "Le logarithme d'un nombre entre 0 et 1 est négatif : diviser par un nombre négatif change le sens de l'inégalité." },
        ];
      case "cN":
        return [{ texte: "$n$ est un nombre entier : prends le premier entier qui vérifie l'inéquation." }, { texte: "Contrôle à la calculatrice : la probabilité doit dépasser le seuil pour ce nombre, et pas pour le précédent." }];
    }
  },
  reponseAttendue(e, p) {
    if (e.famille === "A") {
      if (p === "aVerdict") return [e.binomiale ? "\\text{oui}" : "\\text{non}"];
      if (p === "aParametres") return [`${BINOMIALE(e.n, pLatex(e.pNum, e.pDen))}`];
      return [`\\text{${e.condition ? LIBELLES_CONDITION[e.condition] : ""}}`];
    }
    if (e.famille === "B") {
      if (p === "bLoi") return loiBinomialeExacte(e.n, e.p).map((r, k) => `P(X=${k})=${probaLatex(r)}`);
      if (p === "bDiagramme") return [`\\text{Diagramme ${e.ordreDiagrammes.indexOf("juste") + 1}}`];
      const { E, V } = esperanceEtVariance(e.n, e.p);
      if (p === "bEV") return [`E(X)=${decimalLatex(E)}`, `V(X)=${decimalLatex(V)}`];
      return [`\\sigma(X)=\\sqrt{${decimalLatex(V)}}\\approx ${arrondiLatex(Math.sqrt(V), 2)}`];
    }
    if (p === "cInequation") return [`1-${decimalLatex(1 - e.p)}^{n}>${decimalLatex(e.seuil)}`];
    if (p === "cIsole") return [`n>${frontiereLatex(e)}\\approx ${arrondiLatex(frontiereC(e.p, e.seuil), 2)}`];
    return [`n=${e.valeurN}`];
  },
  explication(e, p) {
    if (e.famille === "A") {
      if (p === "aVerdict" && e.binomiale) return [f(`Nombre d'épreuves fixé ($n=${e.n}$), épreuves indépendantes à deux issues, même probabilité de succès $p=${pLatex(e.pNum, e.pDen)}$, et $X$ compte les succès : $X\\sim${BINOMIALE(e.n, pLatex(e.pNum, e.pDen))}$.`)];
      if (p === "aParametres") return [f(`$n=${e.n}$ épreuves, probabilité de succès $p=${pLatex(e.pNum, e.pDen)}$ : $X\\sim${BINOMIALE(e.n, pLatex(e.pNum, e.pDen))}$.`)];
      const pourquoi =
        e.condition === "nombre"
          ? "On s'arrête quand un résultat se produit : on ne sait pas à l'avance combien d'épreuves on fera."
          : e.condition === "independance"
            ? "Le résultat d'une épreuve (ou le rang de l'épreuve) modifie la probabilité de succès : les épreuves ne sont pas identiques et indépendantes."
            : "$X$ additionne des valeurs qui ne sont pas des succès (plus de deux issues par épreuve) : elle ne compte pas des succès.";
      return [f(`${pourquoi} Ce n'est donc pas une loi binomiale.`)];
    }
    if (e.famille === "B") {
      if (p === "bLoi") return loiBinomialeExacte(e.n, e.p).map((r, k) => f(`$P(X=${k})=${termeLatex(e.n, e.p, k)}=${probaLatex(r)}$`));
      if (p === "bDiagramme") {
        const loi = loiBinomialeExacte(e.n, e.p).map(versNombre);
        const mode = loi.indexOf(Math.max(...loi));
        return [f(`La valeur la plus probable est $k=${mode}$ (proche de $n\\times p=${decimalLatex(e.n * e.p)}$) ; ${e.p < 0.5 ? "le sommet est décalé à gauche et la queue s'étire à droite" : "le sommet est décalé à droite et la queue s'étire à gauche"}.`)];
      }
      const { E, V } = esperanceEtVariance(e.n, e.p);
      if (p === "bEV") return [f(`$E(X)=${e.n}\\times ${decimalLatex(e.p)}=${decimalLatex(E)}$ ; $V(X)=${e.n}\\times ${decimalLatex(e.p)}\\times ${decimalLatex(1 - e.p)}=${decimalLatex(V)}$.`)];
      return [f(`$\\sigma(X)=\\sqrt{${decimalLatex(V)}}\\approx ${arrondiLatex(Math.sqrt(V), 2)}$.`)];
    }
    const q = decimalLatex(1 - e.p);
    if (p === "cInequation") return [f(`« Au moins un succès » : $1-${q}^{n}$. Il faut $1-${q}^{n}>${decimalLatex(e.seuil)}$.`)];
    if (p === "cIsole")
      return [
        f(`$${q}^{n}<${decimalLatex(1 - e.seuil)}$, donc $n\\ln(${q})<\\ln(${decimalLatex(1 - e.seuil)})$.`),
        f(`$\\ln(${q})<0$ : en divisant, le sens change, $n>${frontiereLatex(e)}\\approx ${arrondiLatex(frontiereC(e.p, e.seuil), 2)}$.`),
      ];
    const n = e.valeurN;
    return [f(`Premier entier au-delà de $${arrondiLatex(frontiereC(e.p, e.seuil), 2)}$ : $n=${n}$. Contrôle : $1-${q}^{${n - 1}}\\approx ${arrondiLatex(1 - (1 - e.p) ** (n - 1), 4)}$ et $1-${q}^{${n}}\\approx ${arrondiLatex(1 - (1 - e.p) ** n, 4)}$.`)];
  },
  libellePhase(_e, p) {
    const l: Record<P, string> = {
      aVerdict: "Loi binomiale ?",
      aParametres: "Paramètres n et p",
      aCondition: "Condition non respectée",
      bLoi: "Loi de X",
      bDiagramme: "Diagramme",
      bEV: "E(X) et V(X)",
      bSigma: "Écart-type",
      cInequation: "Inéquation",
      cIsole: "n isolé",
      cN: "n minimal",
    };
    return l[p];
  },
  messageCible(e, p, valeurs) {
    if (e.famille === "B" && p === "bLoi") {
      for (let k = 1; k < e.n; k++) {
        const sansC = versNombre(probabiliteBinomiale(e.n, e.p, k)) / Number(combinaisonBig(e.n, k));
        if (vautEnviron(valeurs[k] ?? "", sansC)) return f("Il manque le coefficient $C_n^k$ : il compte les ordres possibles des succès.");
      }
      return null;
    }
    if (e.famille === "B" && p === "bEV") {
      const { E } = esperanceEtVariance(e.n, e.p);
      if (vautEnviron(valeurs[1] ?? "", E)) return f("$V(X)$ n'est pas égale à $E(X)$ : $V(X)=n\\,p\\,(1-p)$.");
      return null;
    }
    if (e.famille === "B" && p === "bSigma") {
      const { V } = esperanceEtVariance(e.n, e.p);
      if (vautEnviron(valeurs[0] ?? "", V) || vautEnviron(valeurs[0] ?? "", V * V)) return [t("L'écart-type est la racine carrée de la variance.")];
      return null;
    }
    if (e.famille === "C" && (p === "cInequation" || p === "cIsole")) {
      if (inequationInverse(valeurs[0] ?? "", referenceC(e), frontiereC(e.p, e.seuil))) return p === "cIsole" ? f("Le sens est inversé : $\\ln(1-p)$ est négatif, et diviser par un nombre négatif change le sens de l'inégalité.") : [t("Le sens est inversé : la probabilité doit dépasser le seuil.")];
      return null;
    }
    if (e.famille === "C" && p === "cN" && (valeurs[0] ?? "").replace(/\D/g, "") === String(e.valeurN - 1)) return [t("Pour ce nombre, la probabilité ne dépasse pas encore le seuil : prends l'entier suivant.")];
    return null;
  },
};

