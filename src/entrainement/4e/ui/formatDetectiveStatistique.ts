import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { DonneesDetectiveStatistique, IdDescriptionStatistique, TableauStat } from "../core/detectiveStatistique.types";
import { souderPonctuation } from "./formatDetectiveVecteurs";
import type { TableauDonnees } from "./formatValeurManquante";
import {
  calculCumules,
  calculDispersion,
  calculGroupes,
  calculMoyenne,
  contexteDe,
  copieEleve,
  descriptionCorrecte,
  effectifTotal,
  indiceLigneFausse,
  nombreLatex,
  nombreLignes,
  nombreTexte,
  quantite,
  reponseAttendue,
  sommeValeurs,
  uniteAccordee,
  uniteCourte,
} from "../moteur/modeleDetectiveStatistique";

/**
 * Textes de gen112 « Détective d'erreurs : statistique » (écran ET papier : une seule source).
 * Formules toujours en LaTeX, jamais au clavier ; notation du chapitre 4 de 4e (xᵢ, nᵢ, n, x̄,
 * effectifs cumulés, règle du seuil, V, σ, Q1, Q3, écart interquartile).
 */

const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

export { souderPonctuation };

export const TITRES_ECRANS = ["La ligne fausse", "L'erreur commise", "La correction"];

export const CONSIGNE_GENERALE = "Une ligne de cette résolution est fausse. Trouve-la, explique l'erreur et corrige la résolution.";

// ---------------------------------------------------------------------------------------------
// Énoncé : récit, tableau éventuel, tâche de l'élève fictif
// ---------------------------------------------------------------------------------------------

/** Le tableau de données (variantes à tableau), `null` pour la série brute. */
export function tableauDonnees(e: DonneesDetectiveStatistique): TableauDonnees | null {
  if (e.variante === "position") return null;
  const c = contexteDe(e);
  const T: TableauStat = e.tableau;
  return {
    legende: e.variante === "groupes" ? `Groupe A : les ${effectifTotal(T)} ${c.individus} ${c.groupes[0]}` : "La série",
    entetes: [c.enTeteValeur, c.enTeteEffectif],
    lignes: T.valeurs.map((x, i) => [nombreTexte(x), `${T.effectifs[i]}`]),
  };
}

/** Phrases AVANT le tableau (ou la série brute). */
export function recitAvant(e: DonneesDetectiveStatistique): FragmentConsigne[] {
  const c = contexteDe(e);
  switch (e.variante) {
    case "position":
      return [t(`${c.releve(e.serie.length)} Les valeurs, dans l'ordre du relevé : ${e.serie.map((x) => nombreTexte(x)).join(" ; ")}.`)];
    case "groupes":
      return [t(`On compare deux groupes. Pour les ${effectifTotal(e.tableau)} ${c.individus} ${c.groupes[0]} (groupe A), on a relevé ${c.caractere} : voir le tableau.`)];
    default:
      return [t(c.releve(effectifTotal(e.tableau)))];
  }
}

/** Phrases APRÈS le tableau : la tâche de l'élève fictif. */
export function recitApres(e: DonneesDetectiveStatistique): FragmentConsigne[] {
  const c = contexteDe(e);
  switch (e.variante) {
    case "moyenne":
      return souderPonctuation([t("L'élève doit calculer la moyenne "), l("\\bar{x}"), t(` de la série, puis le pourcentage des ${c.individus} dont la valeur dépasse `), l("\\bar{x}"), t(".")]);
    case "position":
      return souderPonctuation([t("L'élève doit déterminer la médiane, "), l("Q_1"), t(" et "), l("Q_3"), t(" par la règle du seuil, puis l'écart interquartile.")]);
    case "dispersion":
      return souderPonctuation([
        t("L'élève doit calculer la moyenne "),
        l("\\bar{x}"),
        t(", la variance "),
        l("V"),
        t(" (arrondie à 2 décimales), puis l'écart-type "),
        l("\\sigma"),
        t(" (arrondi au centième, à partir de la variance arrondie)."),
      ]);
    case "cumules":
      return souderPonctuation([t("L'élève doit déterminer "), l("Q_1"), t(" et "), l("Q_3"), t(` par la règle du seuil, puis le pourcentage des ${c.individus} dont la valeur est comprise entre `), l("Q_1"), t(" et "), l("Q_3"), t(", bornes comprises.")]);
    case "groupes": {
      const N = effectifTotal(e.tableau) + e.nB;
      return [t(`Pour les ${e.nB} ${c.individus} ${c.groupes[1]} (groupe B), on sait seulement que la moyenne vaut ${quantite(c, e.moyenneB)}. L'élève doit calculer la moyenne des ${N} ${c.individus} des deux groupes réunis.`)];
    }
  }
}

/** Tout l'énoncé en fragments (sans le tableau) — pour une ligne de récapitulatif. */
export function enonceExercice(e: DonneesDetectiveStatistique): FragmentConsigne[] {
  return [...recitAvant(e), t(" "), ...recitApres(e)];
}

export function lignesCopie(e: DonneesDetectiveStatistique): FragmentConsigne[][] {
  return copieEleve(e).map(souderPonctuation);
}

// ---------------------------------------------------------------------------------------------
// Réponse (écran 3, fiche, corrigé)
// ---------------------------------------------------------------------------------------------

/** Préfixe LaTeX du champ de l'écran 3 (`null` : aucun). */
export function prefixeChamp(e: DonneesDetectiveStatistique): string | null {
  switch (e.variante) {
    case "position":
      return "Q_3 - Q_1 =";
    case "dispersion":
      return "\\sigma \\approx";
    case "groupes":
      return "\\bar{x} =";
    default:
      return null;
  }
}

export function libelleChamp(e: DonneesDetectiveStatistique): FragmentConsigne[] {
  switch (e.variante) {
    case "moyenne":
      return [t("Pourcentage corrigé :")];
    case "position":
      return [t("Écart interquartile corrigé :")];
    case "dispersion":
      return [t("Écart-type corrigé (arrondi au centième) :")];
    case "cumules":
      return [t("Pourcentage corrigé :")];
    case "groupes":
      return [t("Moyenne corrigée des deux groupes réunis :")];
  }
}

export function uniteChamp(e: DonneesDetectiveStatistique): string {
  return e.variante === "moyenne" || e.variante === "cumules" ? "%" : uniteCourte(contexteDe(e));
}

/** Rappel de saisie (texte brut : c'est précisément ce qu'il faut taper). */
export function aideSaisie(e: DonneesDetectiveStatistique): string {
  if (e.variante === "dispersion") return "Écris un nombre décimal arrondi au centième, par exemple 3,31.";
  if (e.variante === "moyenne" || e.variante === "cumules") return "Écris le pourcentage, par exemple 35 ou 37,5 (le signe % est facultatif).";
  return "Écris la valeur exacte, par exemple 6 ou 7,25.";
}

/** La réponse, telle qu'on l'écrit dans un corrigé. */
export function reponseFragments(e: DonneesDetectiveStatistique): FragmentConsigne[] {
  const c = contexteDe(e);
  const v = reponseAttendue(e).valeur;
  switch (e.variante) {
    case "moyenne":
      return [l(`${nombreLatex(v)}\\,\\%`), t(` des ${c.individus} dépassent la moyenne `), l(`\\bar{x} = ${nombreLatex(calculMoyenne(e, false).moyenne)}`), t(".")];
    case "position":
      return [t("Écart interquartile : "), l(`Q_3 - Q_1 = ${nombreLatex(v)}`), t(` ${uniteAccordee(c, v)}.`)];
    case "dispersion":
      return [t("Écart-type : "), l(`\\sigma \\approx ${nombreLatex(v)}`), t(` ${uniteAccordee(c, v)}.`)];
    case "cumules":
      return [l(`${nombreLatex(v)}\\,\\%`), t(` des ${c.individus} ont une valeur comprise entre `), l("Q_1"), t(" et "), l("Q_3"), t(".")];
    case "groupes":
      return [t("Moyenne des deux groupes réunis : "), l(`\\bar{x} = ${nombreLatex(v)}`), t(` ${uniteAccordee(c, v)}.`)];
  }
}

// ---------------------------------------------------------------------------------------------
// Consignes des écrans
// ---------------------------------------------------------------------------------------------

export function consignesEcrans(e: DonneesDetectiveStatistique): FragmentConsigne[][] {
  const n = indiceLigneFausse(e) + 1;
  const precision = e.variante === "dispersion" ? " (arrondi au centième)." : " (valeur exacte).";
  return [
    [t("Quelle ligne de la copie est fausse ?")],
    [t(`Quelle erreur l'élève a-t-il commise à la ligne ${n} ?`)],
    [t(`Corrige la copie : reprends la résolution à partir de la ligne ${n} et donne le résultat final correct${precision}`)],
  ];
}

// ---------------------------------------------------------------------------------------------
// Descriptions d'erreur (écran 2)
// ---------------------------------------------------------------------------------------------

/** Données utiles aux descriptions (valeurs de la RÉSOLUTION CORRECTE, sauf mention). */
function tableauDe(e: DonneesDetectiveStatistique): TableauStat | null {
  return e.variante === "position" ? null : e.tableau;
}

export function descriptionFragments(id: IdDescriptionStatistique, e: DonneesDetectiveStatistique): FragmentConsigne[] {
  return souderPonctuation(descriptionBrute(id, e));
}

function descriptionBrute(id: IdDescriptionStatistique, e: DonneesDetectiveStatistique): FragmentConsigne[] {
  const T = tableauDe(e);
  const k = T ? T.valeurs.length : 0;
  const n = T ? effectifTotal(T) : e.variante === "position" ? e.serie.length : 0;
  switch (id) {
    case "moyenneNonPonderee": {
      if (!T) return [];
      const nom = e.variante === "groupes" ? "\\bar{x}_A" : "\\bar{x}";
      const nn = e.variante === "groupes" ? "n_A" : "n";
      return [
        t("La moyenne ne tient pas compte des effectifs : chaque valeur doit être multipliée par son effectif, et la somme divisée par l'effectif total, "),
        l(`${nom} = \\dfrac{\\Sigma (x_i \\cdot n_i)}{${nn}}`),
        t(", et non "),
        l(`\\dfrac{${T.valeurs.map((x) => nombreLatex(x)).join(" + ")}}{${k}}`),
        t("."),
      ];
    }
    case "cumulMalLu": {
      if (e.variante === "moyenne") {
        const cm = calculMoyenne(e, false);
        const xAvant = e.tableau.valeurs[cm.iAvant]!;
        const xApres = e.tableau.valeurs[cm.iAvant + 1]!;
        return [
          t("Les valeurs supérieures à "),
          l(`\\bar{x} = ${nombreLatex(cm.moyenne)}`),
          t(` se comptent en retirant de n l'effectif cumulé de la DERNIÈRE valeur inférieure à `),
          l("\\bar{x}"),
          t(` (valeur ${nombreTexte(xAvant)}, cumulé ${cm.cumules[cm.iAvant]}), et non celui de ${nombreTexte(xApres)}, qui retire aussi les ${contexteDe(e).individus} de la valeur ${nombreTexte(xApres)}.`),
        ];
      }
      if (e.variante === "cumules") {
        const cc = calculCumules(e, false);
        const q1 = e.tableau.valeurs[cc.iQ1]!;
        return [
          t("Pour compter les valeurs de "),
          l("Q_1"),
          t(" à "),
          l("Q_3"),
          t(` bornes comprises, on retire l'effectif cumulé de la valeur qui PRÉCÈDE `),
          l("Q_1"),
          t(` (valeur ${nombreTexte(e.tableau.valeurs[cc.iQ1 - 1]!)}, cumulé ${cc.cumules[cc.iQ1 - 1]}), et non celui de `),
          l(`Q_1 = ${nombreLatex(q1)}`),
          t(` (cumulé ${cc.cumules[cc.iQ1]}), qui retire aussi les ${contexteDe(e).individus} de la valeur `),
          l("Q_1"),
          t("."),
        ];
      }
      return [];
    }
    case "medianeNonTriee":
      return [t("La série n'a pas été rangée : la ligne 1 recopie les valeurs dans l'ordre du relevé. La médiane et les quartiles se lisent sur la série rangée dans l'ordre croissant.")];
    case "q1MalPlace":
      if (e.variante === "position") {
        return [
          t(`Le rang ${n / 4} est égal au seuil `),
          l(`\\dfrac{n}{4} = ${n / 4}`),
          t(" sans le dépasser : "),
          l("Q_1"),
          t(` est la première valeur de rang STRICTEMENT supérieur à ${n / 4} : la ${n / 4 + 1}e.`),
        ];
      }
      return [
        t(`L'effectif cumulé ${n / 4} est égal au seuil `),
        l(`\\dfrac{n}{4} = ${n / 4}`),
        t(" sans le dépasser : "),
        l("Q_1"),
        t(` est la première valeur dont l'effectif cumulé est STRICTEMENT supérieur à ${n / 4}.`),
      ];
    case "sansRacine":
      return [t("L'écart-type est la racine carrée de la variance : "), l("\\sigma = \\sqrt{V}"), t(", et non "), l("V"), t(" lui-même.")];
    case "varianceSansN": {
      if (e.variante !== "dispersion") return [];
      const S = nombreLatex(calculDispersion(e, false).sommeCarres, 4);
      return [t("La somme des carrés des écarts doit être divisée par l'effectif total : "), l(`V = \\dfrac{${S}}{${n}}`), t(", et non "), l(`V = ${S}`), t(".")];
    }
    case "moyenneDesMoyennes": {
      if (e.variante !== "groupes") return [];
      return [
        t("Les deux groupes n'ont pas le même effectif : on ne fait pas la moyenne des deux moyennes. Chaque moyenne compte autant de fois que son groupe a de membres : "),
        l("\\bar{x} = \\dfrac{n_A \\cdot \\bar{x}_A + n_B \\cdot \\bar{x}_B}{n_A + n_B}"),
        t("."),
      ];
    }
    // --- leurres (toujours faux pour la ligne visée) ---
    case "moyenneMilieu":
      return [t("La moyenne est la valeur du milieu de la série rangée : il fallait prendre la médiane.")];
    case "moyenneExtremes":
      if (!T) return [];
      return [t("La moyenne est la demi-somme de la plus petite et de la plus grande valeur : "), l(`\\dfrac{${nombreLatex(T.valeurs[0]!)} + ${nombreLatex(T.valeurs[k - 1]!)}}{2}`), t(".")];
    case "moyenneCumules":
      return [t("Chaque valeur devait être multipliée par son effectif cumulé, et non par son effectif.")];
    case "cumulDirect":
      if (e.variante === "moyenne") {
        const cm = calculMoyenne(e, false);
        return [t(`Le nombre cherché est directement l'effectif cumulé de ${nombreTexte(e.tableau.valeurs[cm.iAvant + 1]!)} : ${cm.cumules[cm.iAvant + 1]}.`)];
      }
      if (e.variante === "cumules") {
        const cc = calculCumules(e, false);
        return [t("Le nombre cherché est directement l'effectif cumulé de "), l("Q_3"), t(` : ${cc.cumules[cc.iQ3]}.`)];
      }
      return [];
    case "cumulAdditionner":
      return [t("Il fallait additionner les deux effectifs cumulés au lieu de les soustraire.")];
    case "cumulDiviserK":
      return [t(`Il fallait diviser l'effectif total par le nombre de valeurs distinctes (${k}).`)];
    case "medianeMoyenne":
      return [t("La médiane est la moyenne de toutes les valeurs de la série.")];
    case "medianeDoublons":
      return [t("Avant de ranger la série, il fallait supprimer les valeurs répétées.")];
    case "medianeRangSeuil":
      return [t(`La médiane est la ${n / 2}e valeur : son rang est exactement `), l(`\\dfrac{n}{2} = ${n / 2}`), t(".")];
    case "q1MoitieSuperieure":
      return [l("Q_1"), t(" est la médiane des valeurs supérieures à la médiane.")];
    case "q1SeuilMoitie":
      return [t("Le seuil de "), l("Q_1"), t(" est "), l("\\dfrac{n}{2}"), t(", et non "), l("\\dfrac{n}{4}"), t(".")];
    case "q1MoitieMediane":
      return [l("Q_1"), t(" vaut la moitié de la médiane.")];
    case "nMoinsUn":
      return [t("La somme des carrés des écarts doit être divisée par "), l("n - 1"), t(` (ici ${n - 1}) et non par `), l("n"), t(".")];
    case "ecartMoitie":
      return [t("L'écart-type est la moitié de la variance : "), l("\\sigma = \\dfrac{V}{2}"), t(".")];
    case "ecartCarre":
      return [t("L'écart-type est le carré de la variance : "), l("\\sigma = V^2"), t(".")];
    case "sansCarre":
      return [t("Les écarts à la moyenne ne doivent pas être élevés au carré.")];
    case "diviserK":
      return [t(`La somme des carrés des écarts doit être divisée par le nombre de valeurs distinctes (${k}), et non par l'effectif total.`)];
    case "sommeMoyennes":
      if (e.variante !== "groupes") return [];
      return [t("La moyenne des deux groupes réunis est la somme des deux moyennes : "), l(`${nombreLatex(calculGroupes(e, false).moyenneA)} + ${nombreLatex(e.moyenneB)}`), t(".")];
    case "ponderationInversee":
      if (e.variante !== "groupes") return [];
      return [t("Chaque moyenne doit être multipliée par l'effectif de l'AUTRE groupe : "), l(`\\dfrac{${e.nB} \\cdot \\bar{x}_A + ${effectifTotal(e.tableau)} \\cdot \\bar{x}_B}{${effectifTotal(e.tableau) + e.nB}}`), t(".")];
    case "plusGrandeMoyenne":
      return [t("La moyenne des deux groupes réunis est la plus grande des deux moyennes.")];
  }
}

// ---------------------------------------------------------------------------------------------
// Aides
// ---------------------------------------------------------------------------------------------

function aidesLigne(e: DonneesDetectiveStatistique): FragmentConsigne[][] {
  const i = indiceLigneFausse(e);
  const n = nombreLignes(e);
  const [a, b] = i % 2 === 0 ? (i + 1 < n ? [i, i + 1] : [i - 1, i]) : [i - 1, i];
  return [
    [t("Refais la résolution à partir des données, ligne par ligne, en comparant chaque formule ou chaque lecture à celle du cours : la première ligne qui ne redonne pas le même résultat est la ligne fausse.")],
    [t(`L'erreur se trouve à la ligne ${a + 1} ou à la ligne ${b + 1}.`)],
  ];
}

function aidesErreur(e: DonneesDetectiveStatistique): FragmentConsigne[][] {
  switch (descriptionCorrecte(e)) {
    case "moyenneNonPonderee":
      return [
        [t("Rappel du cours :"), l("\\bar{x} = \\dfrac{\\Sigma (x_i \\cdot n_i)}{\\Sigma n_i}")],
        [t("Une valeur qui revient souvent doit-elle compter autant qu'une valeur qui revient rarement ?")],
      ];
    case "cumulMalLu":
      return e.variante === "moyenne"
        ? [
            [t("Les individus qui dépassent la moyenne sont ceux des lignes situées APRÈS la dernière valeur inférieure à la moyenne. On calcule :"), l("n - (\\text{effectif cumulé de cette dernière valeur})")],
            [t("Vérifie sur le tableau : les individus de la première valeur supérieure à la moyenne sont-ils comptés par la copie ?")],
          ]
        : [
            [t("Les individus de "), l("Q_1"), t(" à "), l("Q_3"), t(" sont ceux des lignes de "), l("Q_1"), t(" à "), l("Q_3"), t(". On calcule :"), l("(\\text{cumulé de } Q_3) - (\\text{cumulé de la ligne avant } Q_1)")],
            [t("Vérifie : les individus dont la valeur vaut exactement "), l("Q_1"), t(" sont-ils comptés par la copie ?")],
          ];
    case "medianeNonTriee":
      return [[t("Rappel du cours : la médiane et les quartiles se repèrent par leur RANG dans la série rangée dans l'ordre croissant.")], [t("Les valeurs de la ligne 1 sont-elles dans l'ordre croissant ?")]];
    case "q1MalPlace":
      return [
        [t("Rappel du cours (règle du seuil) : "), l("Q_1"), t(e.variante === "position" ? " est la première valeur dont le rang dépasse STRICTEMENT le seuil :" : " est la première valeur dont l'effectif cumulé dépasse STRICTEMENT le seuil :"), l("\\dfrac{n}{4}")],
        [t(e.variante === "position" ? "Le rang retenu par la copie est-il strictement supérieur au seuil, ou seulement égal ?" : "L'effectif cumulé retenu par la copie est-il strictement supérieur au seuil, ou seulement égal ?")],
      ];
    case "sansRacine":
      return [[t("Rappel du cours :"), l("\\sigma = \\sqrt{V}")], [t("Compare les unités : la variance est en unité au carré, l'écart-type dans l'unité des données.")]];
    case "varianceSansN":
      return [[t("Rappel du cours :"), l("V = \\dfrac{\\Sigma (x_i - \\bar{x})^2 \\cdot n_i}{n}")], [t("La variance est une MOYENNE des carrés des écarts : la valeur de la copie est-elle plausible pour ces données ?")]];
    case "moyenneDesMoyennes":
      return [
        [t("Rappel du cours :"), l("\\bar{x} = \\dfrac{n_A \\cdot \\bar{x}_A + n_B \\cdot \\bar{x}_B}{n_A + n_B}")],
        [t("Les deux groupes ont-ils le même effectif ? Lequel doit peser le plus dans la moyenne ?")],
      ];
    default:
      return [];
  }
}

function aidesCorrection(e: DonneesDetectiveStatistique): FragmentConsigne[][] {
  switch (e.variante) {
    case "moyenne":
      return [
        [t("La moyenne :"), l("\\bar{x} = \\dfrac{\\Sigma (x_i \\cdot n_i)}{n}")],
        [t("Les individus au-dessus de la moyenne, puis le pourcentage :"), l("n - (\\text{cumulé de la dernière valeur} < \\bar{x}) \\qquad \\dfrac{\\text{effectif}}{n} \\times 100")],
      ];
    case "position": {
      const n = e.serie.length;
      return [
        [t("Range la série dans l'ordre croissant, puis applique la règle du seuil (rang STRICTEMENT supérieur) :"), l(`\\dfrac{n}{4} = ${n / 4} \\qquad \\dfrac{3n}{4} = ${(3 * n) / 4}`)],
        [t("Écart interquartile :"), l("Q_3 - Q_1")],
      ];
    }
    case "dispersion":
      return [
        [t("La moyenne, puis la variance arrondie à 2 décimales :"), l("\\bar{x} = \\dfrac{\\Sigma (x_i \\cdot n_i)}{n} \\qquad V = \\dfrac{\\Sigma (x_i - \\bar{x})^2 \\cdot n_i}{n}")],
        [t("L'écart-type, à partir de la variance ARRONDIE :"), l("\\sigma = \\sqrt{V}")],
      ];
    case "cumules": {
      const n = effectifTotal(e.tableau);
      return [
        [t("Seuils de "), l("Q_1"), t(" et "), l("Q_3"), t(" : premier effectif cumulé STRICTEMENT supérieur à :"), l(`\\dfrac{n}{4} = ${n / 4} \\qquad \\dfrac{3n}{4} = ${(3 * n) / 4}`)],
        [t("Effectif de "), l("Q_1"), t(" à "), l("Q_3"), t(", puis le pourcentage :"), l("(\\text{cumulé de } Q_3) - (\\text{cumulé avant } Q_1) \\qquad \\dfrac{\\text{effectif}}{n} \\times 100")],
      ];
    }
    case "groupes":
      return [
        [t("La moyenne du groupe A :"), l("\\bar{x}_A = \\dfrac{\\Sigma (x_i \\cdot n_i)}{n_A}")],
        [t("La moyenne des deux groupes réunis :"), l("\\bar{x} = \\dfrac{n_A \\cdot \\bar{x}_A + n_B \\cdot \\bar{x}_B}{n_A + n_B}")],
      ];
  }
}

export function aidesEcran(e: DonneesDetectiveStatistique, ecran: number): FragmentConsigne[][] {
  if (ecran === 0) return aidesLigne(e);
  if (ecran === 1) return aidesErreur(e).map(souderPonctuation);
  return aidesCorrection(e).map(souderPonctuation);
}

// ---------------------------------------------------------------------------------------------
// Corrigé : comment repérer la ligne fausse, piège, nom court de l'erreur
// ---------------------------------------------------------------------------------------------

export function constat(e: DonneesDetectiveStatistique): FragmentConsigne[] {
  return souderPonctuation(constatBrut(e));
}

function constatBrut(e: DonneesDetectiveStatistique): FragmentConsigne[] {
  const n = indiceLigneFausse(e) + 1;
  const c = contexteDe(e);
  switch (descriptionCorrecte(e)) {
    case "moyenneNonPonderee": {
      if (e.variante === "position") return [];
      const T = e.tableau;
      const nn = effectifTotal(T);
      return [t(`À la ligne ${n}, la copie divise la somme des ${T.valeurs.length} valeurs distinctes (`), l(nombreLatex(sommeValeurs(T))), t(`) par ${T.valeurs.length} : les effectifs (${T.effectifs.join(", ")}) n'interviennent pas, alors qu'il y a ${nn} ${c.individus}.`)];
    }
    case "cumulMalLu": {
      if (e.variante === "moyenne") {
        const cm = calculMoyenne(e, false);
        const x = e.tableau.valeurs[cm.iAvant + 1]!;
        return [t(`À la ligne ${n}, `), l(`${cm.n} - ${cm.cumules[cm.iAvant + 1]}`), t(` retire aussi les ${e.tableau.effectifs[cm.iAvant + 1]} ${c.individus} de la valeur ${nombreTexte(x)}, alors que ${nombreTexte(x)} dépasse la moyenne `), l(nombreLatex(cm.moyenne)), t(".")];
      }
      if (e.variante === "cumules") {
        const cc = calculCumules(e, false);
        return [
          t(`À la ligne ${n}, `),
          l(`${cc.cumules[cc.iQ3]} - ${cc.cumules[cc.iQ1]}`),
          t(` retire aussi les ${e.tableau.effectifs[cc.iQ1]} ${c.individus} dont la valeur est `),
          l(`Q_1 = ${nombreLatex(e.tableau.valeurs[cc.iQ1]!)}`),
          t(" : or les bornes sont comprises."),
        ];
      }
      return [];
    }
    case "medianeNonTriee":
      return [t(`À la ligne ${n}, les valeurs ne sont pas dans l'ordre croissant : ce sont celles de l'énoncé, dans l'ordre du relevé.`)];
    case "q1MalPlace":
      if (e.variante === "position") {
        const m = e.serie.length / 4;
        return [t(`À la ligne ${n}, le rang ${m} est égal au seuil `), l(`\\dfrac{n}{4} = ${m}`), t(" : il ne le dépasse pas strictement.")];
      }
      if (e.variante === "cumules") {
        const m = effectifTotal(e.tableau) / 4;
        return [t(`À la ligne ${n}, l'effectif cumulé ${m} est égal au seuil `), l(`\\dfrac{n}{4} = ${m}`), t(" : il ne le dépasse pas strictement.")];
      }
      return [];
    case "sansRacine":
      return [t(`À la ligne ${n}, la variance est recopiée comme écart-type : la racine carrée manque (l'écart-type serait dans une unité au carré).`)];
    case "varianceSansN": {
      if (e.variante !== "dispersion") return [];
      const S = calculDispersion(e, false).sommeCarres;
      const T = e.tableau;
      return [t(`À la ligne ${n}, la somme `), l(nombreLatex(S, 4)), t(" n'est pas divisée par "), l(`n = ${effectifTotal(T)}`), t(` : une variance aussi grande est impossible pour des valeurs comprises entre ${nombreTexte(T.valeurs[0]!)} et ${nombreTexte(T.valeurs[T.valeurs.length - 1]!)}.`)];
    }
    case "moyenneDesMoyennes": {
      if (e.variante !== "groupes") return [];
      return [t(`À la ligne ${n}, la copie fait la moyenne des deux moyennes comme si les groupes avaient le même effectif, alors que `), l(`n_A = ${effectifTotal(e.tableau)}`), t(" et "), l(`n_B = ${e.nB}`), t(".")];
    }
    default:
      return [];
  }
}

export function piege(e: DonneesDetectiveStatistique): FragmentConsigne[] {
  return souderPonctuation(piegeBrut(e));
}

function piegeBrut(e: DonneesDetectiveStatistique): FragmentConsigne[] {
  switch (descriptionCorrecte(e)) {
    case "moyenneNonPonderee":
      return [t("Une moyenne pondérée multiplie chaque valeur par son effectif et divise par l'effectif TOTAL : la moyenne des seules valeurs distinctes est fausse dès que les effectifs diffèrent.")];
    case "cumulMalLu":
      return [t("L'effectif cumulé d'une ligne compte cette ligne ET toutes celles d'avant : pour garder une valeur dans le compte, on retire le cumulé de la ligne qui la PRÉCÈDE.")];
    case "medianeNonTriee":
      return [t("La médiane et les quartiles sont des paramètres de RANG : on range toujours la série dans l'ordre croissant avant de compter.")];
    case "q1MalPlace":
      return [t("Règle du seuil : STRICTEMENT supérieur, jamais « supérieur ou égal ». Un rang (ou un effectif cumulé) égal au seuil n'y est pas encore : on prend la valeur suivante.")];
    case "sansRacine":
      return [t("La variance est en unité au carré ; l'écart-type, dans l'unité des données, est sa racine carrée : "), l("\\sigma = \\sqrt{V}"), t(".")];
    case "varianceSansN":
      return [t("La variance est la MOYENNE des carrés des écarts : la somme se divise toujours par l'effectif total "), l("n"), t(" (jamais par "), l("n - 1"), t(" sur cette plateforme).")];
    case "moyenneDesMoyennes":
      return [t("Pour réunir deux groupes d'effectifs différents, on ne fait jamais la moyenne des deux moyennes : le groupe le plus nombreux pèse davantage.")];
    default:
      return [];
  }
}

/** Nom court de l'erreur (réponse brève). */
export function nomErreur(e: DonneesDetectiveStatistique): string {
  switch (descriptionCorrecte(e)) {
    case "moyenneNonPonderee":
      return "moyenne calculée sans les effectifs";
    case "cumulMalLu":
      return "mauvaise ligne d'effectif cumulé retirée";
    case "medianeNonTriee":
      return "médiane et quartiles lus sur la série non rangée";
    case "q1MalPlace":
      return "Q₁ pris au seuil atteint au lieu de strictement dépassé";
    case "sansRacine":
      return "racine carrée de la variance oubliée";
    case "varianceSansN":
      return "variance non divisée par l'effectif total";
    case "moyenneDesMoyennes":
      return "moyenne des deux moyennes au lieu de la moyenne pondérée";
    default:
      return "";
  }
}

