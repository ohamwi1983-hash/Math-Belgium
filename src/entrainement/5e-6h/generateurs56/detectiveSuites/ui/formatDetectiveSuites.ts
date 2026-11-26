// Copie 5e (6h) de `5e-4h/ui5e/formatDetectiveSuites.ts` (56gen10 ← 5gen49, chantier D du 26/11/2026) — copiée pour que les deux années puissent diverger.
import type { FragmentConsigne } from "../../../../export/genererFeuilleExercices";
import type { DonneesDetectiveSuites, IdDescriptionSuites, ReponseDetectiveSuites } from "../core/detectiveSuites.types";
import { souderPonctuation } from "../../../../4e/ui/formatDetectiveVecteurs";
import { fractionQ, multiplierFractionQ } from "../../../../5e-4h/moteur5e/fractionQ";
import {
  CONTEXTES_POURCENTAGE,
  affineNLatex,
  anneeDemandee,
  calculArithmetique,
  calculPourcentage,
  copieEleve,
  degre,
  descriptionCorrecte,
  fractionLatex,
  indiceLigneFausse,
  nombreLatex,
  nombreLignes,
  par,
  polynomeLatex,
  pourcentLatex,
  puissanceN,
  raisonPourcentage,
  reponseAttendue,
  troisTermes,
  u2Geometrique,
} from "../moteur/modeleDetectiveSuites";

/**
 * Textes de 5gen49 « Détective d'erreurs : suites » (écran ET papier : une seule source). Formules
 * toujours en LaTeX, jamais au clavier ; notation du chapitre 3 de 5e (u₁ au rang 1, uₙ = u₁ + (n − 1)r,
 * uₙ = u₁·qⁿ⁻¹, n − p + 1 termes, S∞ = u₁/(1 − q) si |q| < 1, q = 1 ± t/100, P(n)/Q(n) divisé par la
 * plus haute puissance de n du dénominateur).
 */

const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

export { souderPonctuation };

export const TITRES_ECRANS = ["La ligne fausse", "L'erreur commise", "La correction"];

export const CONSIGNE_GENERALE = "Une ligne de cette résolution est fausse. Trouve-la, explique l'erreur et corrige la résolution.";

/** Pourcentage en texte brut (« 4 », « 2,5 »). */
function pourcentTexte(e: Extract<DonneesDetectiveSuites, { variante: "pourcentage" }>): string {
  return pourcentLatex(e).replace("{,}", ",");
}

/** Écriture de la somme demandée (`u_5 + u_6 + \ldots + u_{20}`). */
function sommeLatex(p: number, m: number): string {
  return `u_{${p}} + u_{${p + 1}} + \\ldots + u_{${m}}`;
}

// ---------------------------------------------------------------------------------------------
// Énoncé et copie
// ---------------------------------------------------------------------------------------------

export function enonceExercice(e: DonneesDetectiveSuites): FragmentConsigne[] {
  return souderPonctuation(enonceBrut(e));
}

function enonceBrut(e: DonneesDetectiveSuites): FragmentConsigne[] {
  switch (e.variante) {
    case "arithmetique":
      return [
        l("(u_n)"),
        t(" est une suite arithmétique de premier terme "),
        l(`u_1 = ${nombreLatex(e.u1)}`),
        t(" et de raison "),
        l(`r = ${nombreLatex(e.r)}`),
        t(". L'élève doit calculer la somme "),
        l(`S = ${sommeLatex(e.p, e.m)}`),
        t("."),
      ];
    case "geometrique":
      return [
        l("(u_n)"),
        t(" est une suite géométrique telle que "),
        l(`u_1 = ${nombreLatex(e.u1)}`),
        t(" et "),
        l(`u_2 = ${nombreLatex(u2Geometrique(e))}`),
        t(". L'élève doit calculer la somme "),
        l(`S = ${sommeLatex(e.p, e.m)}`),
        t("."),
      ];
    case "pourcentage": {
      const ctx = CONTEXTES_POURCENTAGE[e.contexte]!;
      return [
        t(`En ${e.annee1} (année de rang 1), ${ctx.sujet} ${ctx.verbe} `),
        l(nombreLatex(e.u1)),
        t(` ${ctx.unite}. ${ctx.evolution} ${e.t > 0 ? "augmente" : "diminue"} de ${pourcentTexte(e)} % par an. L'élève doit calculer ${ctx.grandeur} en ${anneeDemandee(e)}${e.mode === "calcul" ? " (résultat arrondi à l'unité)" : ""}.`),
      ];
    }
    case "convergence":
      if (e.support === "sommeInfinie") {
        const termes = troisTermes(e).map((v) => nombreLatex(v));
        return [
          t("Voici les premiers termes d'une suite géométrique : "),
          l(`${termes.join(" \\,;\\, ")} \\,;\\, \\ldots`),
          t(" L'élève doit calculer la somme infinie "),
          l("u_1 + u_2 + u_3 + \\ldots"),
          t(", si elle existe."),
        ];
      }
      return [t("On pose "), l(`u_n = \\dfrac{${polynomeLatex(e.P)}}{${polynomeLatex(e.Q)}}`), t(". L'élève doit déterminer "), l("\\lim_{n \\to +\\infty} u_n"), t(".")];
  }
}

export function lignesCopie(e: DonneesDetectiveSuites): FragmentConsigne[][] {
  return copieEleve(e).map(souderPonctuation);
}

// ---------------------------------------------------------------------------------------------
// Réponse (écran 3, fiche, corrigé)
// ---------------------------------------------------------------------------------------------

/** Préfixe LaTeX du champ de l'écran 3 (`null` : libellé texte seul). */
export function prefixeChamp(e: DonneesDetectiveSuites): string | null {
  switch (e.variante) {
    case "arithmetique":
    case "geometrique":
      return "S =";
    case "pourcentage":
      return `u_{${e.rang}} ${e.mode === "calcul" ? "\\approx" : "="}`;
    case "convergence":
      return e.support === "limite" ? "\\lim_{n \\to +\\infty} u_n =" : null;
  }
}

export function libelleChamp(e: DonneesDetectiveSuites): FragmentConsigne[] {
  switch (e.variante) {
    case "arithmetique":
    case "geometrique":
      return [t("Résultat final corrigé :")];
    case "pourcentage": {
      const ctx = CONTEXTES_POURCENTAGE[e.contexte]!;
      return [t(`${ctx.grandeur.charAt(0).toUpperCase()}${ctx.grandeur.slice(1)} en ${anneeDemandee(e)}${e.mode === "calcul" ? " (arrondi à l'unité)" : ""} :`)];
    }
    case "convergence":
      return e.support === "limite" ? [t("Limite corrigée :")] : [t("Somme infinie corrigée (ou « n'existe pas ») :")];
  }
}

export function uniteChamp(e: DonneesDetectiveSuites): string | null {
  return e.variante === "pourcentage" ? CONTEXTES_POURCENTAGE[e.contexte]!.unite : null;
}

/** Raccourcis de saisie (boutons qui remplissent le champ) — jamais une restriction de frappe. */
export function raccourcisChamp(e: DonneesDetectiveSuites): string[] {
  if (e.variante !== "convergence") return [];
  return e.support === "limite" ? ["+∞", "−∞"] : ["n'existe pas"];
}

/** Rappel de saisie (texte brut : c'est précisément ce qu'il faut taper). */
export function aideSaisie(e: DonneesDetectiveSuites): string {
  if (e.variante === "pourcentage" && e.mode === "calcul") return "Écris un nombre entier (arrondi à l'unité), par exemple 15 791.";
  if (e.variante === "convergence" && e.support === "limite") return "Écris un nombre exact (fraction 3/2, entier), ou +∞ / −∞ avec les boutons.";
  if (e.variante === "convergence") return "Écris une valeur exacte (fraction 16/3, entier), ou « n'existe pas » avec le bouton.";
  return "Écris une valeur exacte : un entier, un décimal (331,5) ou une fraction (45/32).";
}

/** La réponse, telle qu'on l'écrit dans un corrigé (« S = 1 512 », « la somme n'existe pas »). */
export function reponseFragments(e: DonneesDetectiveSuites, r: ReponseDetectiveSuites = reponseAttendue(e)): FragmentConsigne[] {
  if (r.genre === "nexistePas") return [t("La somme infinie n'existe pas.")];
  if (r.genre === "infini") return [l(`\\lim_{n \\to +\\infty} u_n = ${r.signe > 0 ? "+" : "-"}\\infty`)];
  switch (e.variante) {
    case "arithmetique":
    case "geometrique":
      return [l(`S = ${r.latex}`)];
    case "pourcentage":
      return [l(`u_{${e.rang}} ${e.mode === "calcul" ? "\\approx" : "="} ${r.latex}`), t(` ${CONTEXTES_POURCENTAGE[e.contexte]!.unite} en ${anneeDemandee(e)}`)];
    case "convergence":
      return e.support === "limite" ? [l(`\\lim_{n \\to +\\infty} u_n = ${r.latex}`)] : [l(`S_\\infty = ${r.latex}`)];
  }
}

// ---------------------------------------------------------------------------------------------
// Consignes des écrans
// ---------------------------------------------------------------------------------------------

export function consignesEcrans(e: DonneesDetectiveSuites): FragmentConsigne[][] {
  const n = indiceLigneFausse(e) + 1;
  let precision = " (valeur exacte).";
  if (e.variante === "pourcentage" && e.mode === "calcul") precision = " (arrondi à l'unité).";
  else if (e.variante === "convergence" && e.support === "sommeInfinie") precision = " (valeur exacte, ou « n'existe pas »).";
  else if (e.variante === "convergence") precision = " (un nombre exact, ou une limite infinie).";
  return [
    [t("Quelle ligne de la copie est fausse ?")],
    [t(`Quelle erreur l'élève a-t-il commise à la ligne ${n} ?`)],
    [t(`Corrige la copie : reprends la résolution à partir de la ligne ${n} et donne le résultat final correct${precision}`)],
  ];
}

// ---------------------------------------------------------------------------------------------
// Descriptions d'erreur (écran 2)
// ---------------------------------------------------------------------------------------------

export function descriptionFragments(id: IdDescriptionSuites, e: DonneesDetectiveSuites): FragmentConsigne[] {
  return souderPonctuation(descriptionBrute(id, e));
}

/** Rangs de la somme (variantes arithmétique et géométrique). */
function rangsSomme(e: DonneesDetectiveSuites): { p: number; m: number } {
  return e.variante === "arithmetique" || e.variante === "geometrique" ? { p: e.p, m: e.m } : { p: 1, m: 1 };
}

/** Rang k du terme calculé avec qⁿ⁻¹ (géométrique : u_p ; pourcentage : rang de l'année). */
function rangTerme(e: DonneesDetectiveSuites): number {
  return e.variante === "geometrique" ? e.p : e.variante === "pourcentage" ? e.rang : 1;
}

function deuxTermes(e: DonneesDetectiveSuites): [number, number] {
  if (e.variante === "geometrique") return [e.u1, u2Geometrique(e)];
  if (e.variante === "convergence" && e.support === "sommeInfinie") {
    const [a, b] = troisTermes(e);
    return [a!, b!];
  }
  return [0, 0];
}

function descriptionBrute(id: IdDescriptionSuites, e: DonneesDetectiveSuites): FragmentConsigne[] {
  const { p, m } = rangsSomme(e);
  const k = rangTerme(e);
  const [ua, ub] = deuxTermes(e);
  switch (id) {
    case "rangFormule":
      return [t("La formule générale est fausse : pour atteindre le rang "), l("n"), t(", on ajoute "), l("n - 1"), t(" fois la raison, donc "), l("u_n = u_1 + (n - 1)r"), t(", et non "), l("u_1 + n\\,r"), t(".")];
    case "nombreTermes":
      return [t("Le nombre de termes est faux : de "), l(`u_{${p}}`), t(" à "), l(`u_{${m}}`), t(", il y a "), l(`${m} - ${p} + 1`), t(" termes, et non "), l(`${m} - ${p}`), t(" : les deux extrémités comptent.")];
    case "rangAnnee": {
      if (e.variante !== "pourcentage") return [];
      const Y = anneeDemandee(e);
      return [t(`Le rang de l'année est faux : ${e.annee1} a le rang 1, donc ${Y} a le rang `), l(`${Y} - ${e.annee1} + 1`), t(", et non "), l(`${Y} - ${e.annee1}`), t(".")];
    }
    case "exposant":
      return [t("L'exposant est faux : "), l("u_n = u_1 \\times q^{n-1}"), t(", donc "), l(`u_{${k}} = u_1 \\times q^{${k - 1}}`), t(", et non "), l(`u_1 \\times q^{${k}}`), t(" : de "), l("u_1"), t(" à "), l(`u_{${k}}`), t(`, on multiplie ${k - 1} fois par `), l("q"), t(".")];
    case "sommeInfinie":
      return [t("La condition d'existence de la somme infinie est "), l("|q| < 1"), t(" (c'est-à-dire "), l("-1 < q < 1"), t("), et non "), l("q < 1"), t(" : une raison négative peut avoir une valeur absolue supérieure ou égale à 1.")];
    case "taux": {
      if (e.variante !== "pourcentage") return [];
      const tl = pourcentLatex(e);
      const hausse = e.t > 0;
      return [
        t(`Une ${hausse ? "hausse" : "baisse"} de ${pourcentTexte(e)} % multiplie chaque valeur par `),
        l(`1 ${hausse ? "+" : "-"} \\dfrac{${tl}}{100} = ${nombreLatex(raisonPourcentage(e), 4)}`),
        t(", et non par "),
        l(`\\dfrac{${tl}}{100}`),
        t(` : ce nombre ne donne que ${hausse ? "l'augmentation" : "la diminution"}.`),
      ];
    }
    case "puissance": {
      if (e.variante !== "convergence" || e.support !== "limite") return [];
      return [
        t("Le numérateur et le dénominateur doivent être divisés par la MÊME puissance de "),
        l("n"),
        t(", la plus haute du dénominateur ("),
        l(puissanceN(degre(e.Q))),
        t(") : diviser par "),
        l(puissanceN(degre(e.P))),
        t(" en haut et par "),
        l(puissanceN(degre(e.Q))),
        t(" en bas change la valeur de "),
        l("u_n"),
        t("."),
      ];
    }
    case "raisonInversee":
      return [t("La raison est inversée : "), l("q = \\dfrac{u_2}{u_1}"), t(" (un terme divisé par le précédent), et non "), l("\\dfrac{u_1}{u_2}"), t(".")];
    // --- leurres (toujours faux pour la ligne visée) ---
    case "formuleGeometrique":
      return e.variante === "arithmetique" ? [t("La suite est géométrique : il fallait écrire "), l(`u_n = ${nombreLatex(e.u1)} \\times ${par(nombreLatex(e.r))}^{n-1}`), t(".")] : [];
    case "raisonRetranchee":
      return [t("La raison se retranche : il fallait écrire "), l("u_n = u_1 - (n - 1)r"), t(".")];
    case "premierTermeOublie":
      return [t("Le premier terme ne doit pas apparaître : il fallait écrire "), l("u_n = (n - 1)r"), t(".")];
    case "termesDernierRang":
      return [t("Il y a "), l(`${m}`), t(" termes, puisque le dernier terme de la somme est "), l(`u_{${m}}`), t(".")];
    case "termesSansExtremites":
      return [t("Il y a "), l(`${m} - ${p} - 1`), t(" termes : on ne compte ni "), l(`u_{${p}}`), t(" ni "), l(`u_{${m}}`), t(".")];
    case "termesDiviserRaison":
      return [t("Le nombre de termes s'obtient en divisant "), l(`${m} - ${p}`), t(" par la raison.")];
    case "rangSansExtremites": {
      if (e.variante !== "pourcentage") return [];
      const Y = anneeDemandee(e);
      return [t(`Le rang de ${Y} est `), l(`${Y} - ${e.annee1} - 1`), t(" : on ne compte ni l'année de départ ni l'année demandée.")];
    }
    case "rangAnneeBrute": {
      if (e.variante !== "pourcentage") return [];
      return [t("Le rang est l'année elle-même : il fallait calculer "), l(`u_{${anneeDemandee(e)}}`), t(".")];
    }
    case "rangDouble": {
      if (e.variante !== "pourcentage") return [];
      const Y = anneeDemandee(e);
      return [t(`Le rang de ${Y} est `), l(`${Y} - ${e.annee1} + 2`), t(" : il faut ajouter 1 pour l'année de départ et 1 pour l'année demandée.")];
    }
    case "exposantProduit":
      return [t("L'exposant porte sur tout le produit : il fallait écrire "), l(`(u_1 \\times q)^{${k - 1}}`), t(".")];
    case "exposantAddition":
      return [t("Il fallait ajouter la raison au lieu de multiplier : "), l(`u_{${k}} = u_1 + ${k - 1} \\times q`), t(".")];
    case "exposantPlusUn":
      return [t("L'exposant est trop petit : il fallait "), l(`u_1 \\times q^{${k + 1}}`), t(", car la suite commence à "), l("u_0"), t(".")];
    case "sommeFormulePlus":
      return [t("La formule de la somme infinie est "), l("S_\\infty = \\dfrac{u_1}{1 + q}"), t(" : il fallait changer le signe de "), l("q"), t(".")];
    case "sommeFormuleQMoinsUn":
      return [t("Pour une raison négative, la formule devient "), l("S_\\infty = \\dfrac{u_1}{q - 1}"), t(".")];
    case "sommeToujours":
      return [t("Une somme infinie n'existe que si "), l("q > 0"), t(" : c'est le signe de la raison qu'il fallait contrôler.")];
    case "tauxEntier":
      return e.variante === "pourcentage" ? [t("Il fallait "), l(`q = ${pourcentLatex(e)}`), t(" : on multiplie chaque année par le pourcentage lui-même.")] : [];
    case "tauxArithmetique":
      return e.variante === "pourcentage" ? [t("La suite est arithmétique : il fallait ajouter "), l(`r = ${pourcentLatex(e)}`), t(" chaque année.")] : [];
    case "tauxSensInverse":
      if (e.variante !== "pourcentage") return [];
      return e.t > 0
        ? [t("Il fallait "), l(`q = 1 - \\dfrac{${pourcentLatex(e)}}{100}`), t(" : une hausse se traduit par une soustraction.")]
        : [t("Il fallait "), l(`q = 1 + \\dfrac{${pourcentLatex(e)}}{100}`), t(" : une baisse se traduit par une addition.")];
    case "puissanceN":
      return [t("Il fallait diviser par "), l("n"), t(" seulement : on ne divise jamais par une puissance de "), l("n"), t(" plus grande que 1.")];
    case "puissanceVersUn":
      return [t("Les termes en "), l("\\frac{1}{n}"), t(" tendent vers 1, et non vers 0, quand "), l("n \\to +\\infty"), t(".")];
    case "puissanceNumerateurSeul":
      return e.variante === "convergence" && e.support === "limite"
        ? [t("Il fallait diviser seulement le numérateur par "), l(puissanceN(degre(e.P))), t(", sans toucher au dénominateur.")]
        : [];
    case "raisonDifference":
      return [t("La raison est la différence de deux termes consécutifs : "), l(`q = u_2 - u_1 = ${nombreLatex(ub - ua)}`), t(".")];
    case "raisonProduit":
      return [t("La raison est le produit des deux premiers termes : "), l(`q = u_1 \\times u_2 = ${nombreLatex(ua * ub)}`), t(".")];
    case "raisonTaux":
      return [t("La raison est "), l("q = \\dfrac{u_2}{u_1} - 1"), t(" : c'est le taux d'évolution d'un terme au suivant.")];
  }
}

// ---------------------------------------------------------------------------------------------
// Aides
// ---------------------------------------------------------------------------------------------

function aidesLigne(e: DonneesDetectiveSuites): FragmentConsigne[][] {
  const i = indiceLigneFausse(e);
  const n = nombreLignes(e);
  const [a, b] = i % 2 === 0 ? (i + 1 < n ? [i, i + 1] : [i - 1, i]) : [i - 1, i];
  return [
    [t("Refais la résolution à partir des données, ligne par ligne, en comparant chaque formule utilisée à celle du cours : la première ligne qui ne redonne pas le même résultat est la ligne fausse.")],
    [t(`L'erreur se trouve à la ligne ${a + 1} ou à la ligne ${b + 1}.`)],
  ];
}

function aidesErreur(e: DonneesDetectiveSuites): FragmentConsigne[][] {
  switch (descriptionCorrecte(e)) {
    case "rangFormule":
      return [
        [t("Rappel du cours :"), l("u_n = u_1 + (n - 1)r")],
        [t("Teste la formule de la copie avec "), l("n = 1"), t(" : redonne-t-elle "), l("u_1"), t(" ?")],
      ];
    case "nombreTermes":
      return [
        [t("Rappel du cours : de "), l("u_p"), t(" à "), l("u_n"), t(", le nombre de termes est :"), l("n - p + 1")],
        [t("Vérifie sur un petit cas : de "), l("u_2"), t(" à "), l("u_4"), t(", combien y a-t-il de termes ?")],
      ];
    case "rangAnnee":
      return [
        [t("Rappel du cours : si l'année A a le rang 1, l'année B a le rang :"), l("n = B - A + 1")],
        [t("Vérifie avec l'année de départ : quel rang lui donne la formule de la copie ?")],
      ];
    case "exposant":
      return [
        [t("Rappel du cours :"), l("u_n = u_1 \\times q^{n-1}")],
        [t("Teste la formule avec "), l("n = 1"), t(" : quel exposant de "), l("q"), t(" faut-il pour retrouver "), l("u_1"), t(" ?")],
      ];
    case "sommeInfinie":
      return [
        [t("Rappel du cours : la somme infinie existe seulement si :"), l("|q| < 1")],
        [t("Regarde la valeur absolue de la raison, pas seulement son signe.")],
      ];
    case "taux": {
      const hausse = e.variante === "pourcentage" && e.t > 0;
      return [
        [t(`Rappel du cours : une ${hausse ? "hausse" : "baisse"} de t % par an multiplie chaque année par :`), l(`q = 1 ${hausse ? "+" : "-"} \\dfrac{t}{100}`)],
        [t("Teste sur une seule année : que devient la valeur de départ si on la multiplie par la raison de la copie ?")],
      ];
    }
    case "puissance":
      return [
        [t("Rappel du cours : on divise le numérateur ET le dénominateur par la plus haute puissance de "), l("n"), t(" du dénominateur.")],
        [t("Diviser le haut et le bas d'une fraction par deux nombres différents garde-t-il sa valeur ? Par exemple :"), l("\\dfrac{6}{4} \\quad \\text{et} \\quad \\dfrac{6 \\div 2}{4 \\div 4}")],
      ];
    case "raisonInversee":
      return [
        [t("Rappel du cours : la raison d'une suite géométrique est le quotient d'un terme par le précédent :"), l("q = \\dfrac{u_{n+1}}{u_n}")],
        [t("Vérifie : en multipliant "), l("u_1"), t(" par la raison de la copie, retrouve-t-on "), l("u_2"), t(" ?")],
      ];
    default:
      return [];
  }
}

function aidesCorrection(e: DonneesDetectiveSuites): FragmentConsigne[][] {
  switch (e.variante) {
    case "arithmetique": {
      const c = calculArithmetique(e, false);
      return [
        [t("Formule générale correcte :"), l(`u_n = ${nombreLatex(e.u1)} + (n - 1) \\times ${par(nombreLatex(e.r))} = ${affineNLatex(c.a, c.b)}`)],
        [t("Compte les termes, puis applique :"), l(`N = ${e.m} - ${e.p} + 1 \\qquad S = N \\times \\dfrac{u_{${e.p}} + u_{${e.m}}}{2}`)],
      ];
    }
    case "geometrique":
      return [
        [t("La raison et le premier terme de la somme :"), l(`q = \\dfrac{u_2}{u_1} \\qquad u_{${e.p}} = u_1 \\times q^{${e.p - 1}}`)],
        [t("Compte les termes, puis applique :"), l(`N = ${e.m} - ${e.p} + 1 \\qquad S = u_{${e.p}} \\times \\dfrac{1 - q^{N}}{1 - q}`)],
      ];
    case "pourcentage":
      return [
        [t("La raison :"), l(`q = 1 ${e.t > 0 ? "+" : "-"} \\dfrac{${pourcentLatex(e)}}{100}`)],
        [t("Le rang de l'année, puis le terme :"), l(`n = ${anneeDemandee(e)} - ${e.annee1} + 1 \\qquad u_n = u_1 \\times q^{n-1}`)],
      ];
    case "convergence":
      if (e.support === "sommeInfinie") {
        return [
          [t("Calcule la raison, puis compare sa valeur absolue à 1 :"), l("q = \\dfrac{u_2}{u_1}")],
          [t("La formule ne s'applique que si "), l("|q| < 1"), t(" :"), l("S_\\infty = \\dfrac{u_1}{1 - q}")],
        ];
      }
      return [
        [t("Divise le numérateur ET le dénominateur par la plus haute puissance de "), l("n"), t(" du dénominateur :"), l(puissanceN(degre(e.Q)))],
        [t("Méthode — comparaison des degrés :"), l("\\deg P < \\deg Q \\Rightarrow \\lim u_n = 0 \\qquad \\deg P > \\deg Q \\Rightarrow \\lim u_n = \\pm\\infty")],
      ];
  }
}

export function aidesEcran(e: DonneesDetectiveSuites, ecran: number): FragmentConsigne[][] {
  if (ecran === 0) return aidesLigne(e);
  if (ecran === 1) return aidesErreur(e).map(souderPonctuation);
  return aidesCorrection(e).map(souderPonctuation);
}

// ---------------------------------------------------------------------------------------------
// Corrigé : comment repérer la ligne fausse, piège, nom court de l'erreur
// ---------------------------------------------------------------------------------------------

export function constat(e: DonneesDetectiveSuites): FragmentConsigne[] {
  return souderPonctuation(constatBrut(e));
}

function constatBrut(e: DonneesDetectiveSuites): FragmentConsigne[] {
  const n = indiceLigneFausse(e) + 1;
  switch (descriptionCorrecte(e)) {
    case "rangFormule": {
      if (e.variante !== "arithmetique") return [];
      return [t(`À la ligne ${n}, la formule donne pour `), l("n = 1"), t(" : "), l(`${nombreLatex(e.u1)} + 1 \\times ${par(nombreLatex(e.r))} = ${nombreLatex(e.u1 + e.r)}`), t(", alors que "), l(`u_1 = ${nombreLatex(e.u1)}`), t(".")];
    }
    case "nombreTermes": {
      const { p, m } = rangsSomme(e);
      return [t(`À la ligne ${n}, le compte est faux : les rangs `), l(`${p}, ${p + 1}, \\ldots, ${m}`), t(" sont au nombre de "), l(`${m - p + 1}`), t(", pas "), l(`${m - p}`), t(".")];
    }
    case "rangAnnee":
      return e.variante === "pourcentage" ? [t(`À la ligne ${n}, la formule de la copie donnerait le rang `), l("0"), t(` à l'année ${e.annee1}, qui a pourtant le rang 1.`)] : [];
    case "exposant":
      return [t(`À la ligne ${n}, pour `), l("n = 1"), t(" la formule utilisée donnerait "), l("u_1 \\times q"), t(" au lieu de "), l("u_1"), t(".")];
    case "sommeInfinie": {
      if (e.variante !== "convergence" || e.support !== "sommeInfinie") return [];
      const absq = fractionQ(Math.abs(e.q.num), e.q.den);
      return [t(`À la ligne ${n}, `), l(`|q| = ${fractionLatex(absq)} \\geq 1`), t(" : la condition "), l("|q| < 1"), t(" n'est pas vérifiée, même si "), l(`q = ${fractionLatex(e.q)} < 1`), t(".")];
    }
    case "taux": {
      if (e.variante !== "pourcentage") return [];
      const c = calculPourcentage(e, true);
      const apres = e.u1 * c.q;
      return [
        t(`À la ligne ${n}, multiplier par `),
        l(nombreLatex(c.q, 4)),
        t(` ne garde que ${pourcentTexte(e)} % de la valeur : après un an, `),
        l(`${nombreLatex(e.u1)} \\times ${nombreLatex(c.q, 4)} = ${nombreLatex(apres, 2)}`),
        t(e.t > 0 ? " : la valeur s'effondre au lieu d'augmenter." : " : une chute bien plus forte que la baisse annoncée."),
      ];
    }
    case "puissance": {
      if (e.variante !== "convergence" || e.support !== "limite") return [];
      return [
        t(`À la ligne ${n}, diviser le numérateur par `),
        l(puissanceN(degre(e.P))),
        t(" et le dénominateur par "),
        l(puissanceN(degre(e.Q))),
        t(" revient à multiplier "),
        l("u_n"),
        t(" par "),
        l(`\\dfrac{${puissanceN(degre(e.Q))}}{${puissanceN(degre(e.P))}}`),
        t(" : l'égalité écrite est fausse."),
      ];
    }
    case "raisonInversee": {
      const [ua, ub] = deuxTermes(e);
      const raisonCopie = e.variante === "geometrique" || (e.variante === "convergence" && e.support === "sommeInfinie") ? fractionQ(e.q.den, e.q.num) : fractionQ(1, 1);
      const produit = multiplierFractionQ(fractionQ(ua, 1), raisonCopie);
      return [t(`À la ligne ${n}, `), l(`u_1 \\times q = ${nombreLatex(ua)} \\times ${par(fractionLatex(raisonCopie))} = ${fractionLatex(produit)}`), t(" ne redonne pas "), l(`u_2 = ${nombreLatex(ub)}`), t(".")];
    }
    default:
      return [];
  }
}

export function piege(e: DonneesDetectiveSuites): FragmentConsigne[] {
  return souderPonctuation(piegeBrut(e));
}

function piegeBrut(e: DonneesDetectiveSuites): FragmentConsigne[] {
  switch (descriptionCorrecte(e)) {
    case "rangFormule":
      return [t("Le premier terme est "), l("u_1"), t(" : pour atteindre "), l("u_n"), t(", on ajoute la raison "), l("n - 1"), t(" fois, pas "), l("n"), t(" fois — contrôle toujours la formule avec "), l("n = 1"), t(".")];
    case "nombreTermes":
      return [t("De "), l("u_p"), t(" à "), l("u_n"), t(", il y a "), l("n - p + 1"), t(" termes (comme 16 piquets pour 15 intervalles).")];
    case "rangAnnee":
      return [t("L'année de rang 1 compte : le rang d'une année est l'écart entre les années plus 1.")];
    case "exposant":
      return [l("u_n = u_1 \\times q^{n-1}"), t(" : l'exposant est le rang moins 1, car "), l("u_1"), t(" lui-même ne contient aucun facteur "), l("q"), t(".")];
    case "sommeInfinie":
      return [t("La somme infinie existe seulement si "), l("|q| < 1"), t(" : une raison comme "), l("-2"), t(" est bien plus petite que 1, mais sa valeur absolue ne l'est pas.")];
    case "taux":
      return [t("Évoluer de t % revient à multiplier par "), l("1 + \\dfrac{t}{100}"), t(" (hausse) ou "), l("1 - \\dfrac{t}{100}"), t(" (baisse) : "), l("\\dfrac{t}{100}"), t(" seul n'est que la variation.")];
    case "puissance":
      return [t("Une fraction garde sa valeur seulement si l'on divise son numérateur ET son dénominateur par le MÊME nombre : ici la plus haute puissance de "), l("n"), t(" du dénominateur.")];
    case "raisonInversee":
      return [l("q = \\dfrac{u_2}{u_1}"), t(" : on divise un terme par celui qui le PRÉCÈDE. Contrôle : "), l("u_1 \\times q"), t(" doit redonner "), l("u_2"), t(".")];
    default:
      return [];
  }
}

/** Nom court de l'erreur (réponse brève). */
export function nomErreur(e: DonneesDetectiveSuites): string {
  switch (descriptionCorrecte(e)) {
    case "rangFormule":
      return "n au lieu de n − 1 dans la formule générale";
    case "nombreTermes":
      return "nombre de termes sans le + 1";
    case "rangAnnee":
      return "rang de l'année sans le + 1";
    case "exposant":
      return "qⁿ au lieu de qⁿ⁻¹";
    case "sommeInfinie":
      return "somme infinie calculée alors que |q| ≥ 1";
    case "taux":
      return "raison t/100 au lieu de 1 ± t/100";
    case "puissance":
      return "numérateur et dénominateur divisés par des puissances différentes";
    case "raisonInversee":
      return "raison inversée u₁/u₂";
    default:
      return "";
  }
}
