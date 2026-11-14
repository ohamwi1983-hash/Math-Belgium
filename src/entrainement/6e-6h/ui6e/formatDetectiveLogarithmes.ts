import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { ExerciceDetectiveLogarithmes, IdDescriptionLogarithmes, TypeErreurLogarithmes, ValeurLog } from "../core6e/detectiveLogarithmes.types";
import { souderPonctuation } from "../../4e/ui/formatDetectiveVecteurs";
import { rat, ratLatex } from "../moteur6e/modeleDetectiveIntegrales";
import {
  BASES_B2,
  SCENARIOS,
  TABLE_B1,
  TABLE_D1,
  TABLE_K1,
  TABLE_K2,
  affine,
  copieEleve,
  descriptionCorrecte,
  ePuissance,
  indiceLigneFausse,
  latexValeurComplete,
  logBase,
  signe,
  typeErreur,
  valeursAttendues,
} from "../moteur6e/modeleDetectiveLogarithmes";

/**
 * Textes de 6gen88 (écran ET papier : une seule source). Formules toujours en LaTeX, jamais au
 * clavier ; notation du chapitre 3 (`\ln(x)`, `\log_a(x)`, `\log(x)` en base 10, CE, `\ln|x|`,
 * `(\ln(x))^2`, changement de base `\log_a(x) = \dfrac{\ln(x)}{\ln(a)}`).
 */

const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

export { souderPonctuation };

export const TITRES_ECRANS = ["La ligne fausse", "L'erreur commise", "La correction"];

export const CONSIGNE_GENERALE = "Une ligne de cette résolution est fausse. Trouve-la, explique l'erreur et corrige la résolution.";

const eP = (k: number) => ePuissance(rat(k));

// ---------------------------------------------------------------------------------------------
// Énoncé et copie
// ---------------------------------------------------------------------------------------------

/** L'équation, l'inéquation ou la fonction de l'exercice support, en LaTeX. */
function donneeLatex(e: ExerciceDetectiveLogarithmes): string {
  const d = e.donnees;
  switch (e.scenario) {
    case "S1":
      return `\\ln(x + ${d.a}) = ${d.b}`;
    case "S2":
      return `\\ln(${eP(d.k!)}x) = ${d.m}`;
    case "C1":
      return `\\ln(x^2) = \\ln(${d.a! * d.a!})`;
    case "C2":
      return `\\ln(x^2) ${signe(d.s!, "<")} ${2 * d.k!}`;
    case "D1": {
      const { base, q, r, s } = TABLE_D1[d.i!]!;
      const lg = logBase(base);
      return `${lg}(x) + ${lg}(x - ${r - s}) = ${q}`;
    }
    case "D2":
      return `2\\ln(x) = \\ln(x + ${d.r! * (d.r! - 1)})`;
    case "B1": {
      const { d: den, n } = TABLE_B1[d.i!]!;
      return `\\log_{1/${den}}(x - ${d.p}) ${signe(d.s!, ">")} -${n}`;
    }
    case "B2": {
      const base = `\\log_{${BASES_B2[d.j!]}}`;
      return `${base}(${affine(2, -d.b!)}) ${signe(d.s!, "<")} ${base}(x + ${d.c})`;
    }
    case "P1":
      return `(\\ln(x))^2 = ${d.m! * d.m!}`;
    case "P2":
      return "f(x) = (\\ln(x))^2";
    case "Q1":
      return `\\dfrac{\\ln(x)}{\\ln(${d.a})} = ${d.q}`;
    case "Q2":
      return `\\dfrac{\\log_2(${2 ** (d.n! + 1)})}{\\log_2(${2 ** d.n!})}`;
    case "V1":
      return `f(x) = \\ln(x^2 + ${d.c})`;
    case "V2":
      return `f(x) = \\ln(${affine(d.a!, 1 - d.a! * d.x0!)})`;
    case "K1": {
      const [a, b] = TABLE_K1[d.i!]!;
      return `${a}^x = ${b}`;
    }
    case "K2": {
      const { c, p, q } = TABLE_K2[d.i!]!;
      return `\\log_{${c ** p}}(${c ** q})`;
    }
  }
}

/** Ce que l'élève fictif devait faire. */
export function enonceExercice(e: ExerciceDetectiveLogarithmes): FragmentConsigne[] {
  return souderPonctuation(enonceBrut(e));
}

function enonceBrut(e: ExerciceDetectiveLogarithmes): FragmentConsigne[] {
  const d = e.donnees;
  const x = l(donneeLatex(e));
  switch (typeErreur(e)) {
    case "base":
      return [t("L'élève doit résoudre l'inéquation "), x, t(".")];
    case "derivee":
      if (e.scenario === "V1") return [t("On pose "), x, t(". L'élève doit calculer "), l(`f'(${d.x0})`), t(".")];
      return [t("On pose "), x, t(". L'élève doit déterminer une équation de la tangente à la courbe de "), l("f"), t(" au point d'abscisse "), l(`${d.x0}`), t(".")];
    default:
      break;
  }
  switch (e.scenario) {
    case "C2":
      return [t("L'élève doit résoudre l'inéquation "), x, t(".")];
    case "P2":
      return [t("On pose "), x, t(". L'élève doit calculer "), l(`f'(${eP(d.k!)})`), t(".")];
    case "Q2":
    case "K2":
      return [t("L'élève doit calculer "), x, t(" sans calculatrice.")];
    default:
      return [t("L'élève doit résoudre l'équation "), x, t(".")];
  }
}

export function lignesCopie(e: ExerciceDetectiveLogarithmes): FragmentConsigne[][] {
  return copieEleve(e).map(souderPonctuation);
}

// ---------------------------------------------------------------------------------------------
// Valeurs (écran 3, fiche, corrigé)
// ---------------------------------------------------------------------------------------------

/** Une valeur, telle qu'on l'écrit dans une réponse (« S = {4} », « f'(x) = … »). */
export function valeurFragments(v: ValeurLog): FragmentConsigne[] {
  return [l(latexValeurComplete(v))];
}

/** Libellé de chaque valeur demandée à l'écran 3. */
export function libellesValeurs(e: ExerciceDetectiveLogarithmes): FragmentConsigne[][] {
  return valeursAttendues(e).map((v) => [t(v.libelle)]);
}

/** Message de l'écran 3 quand une valeur est fausse. */
export function messagesARevoir(e: ExerciceDetectiveLogarithmes): string[] {
  return valeursAttendues(e).map((v) => {
    const ligne = /^Ligne (\d+)/.exec(v.libelle);
    if (ligne) return v.libelle.includes("CE") ? `La CE corrigée (ligne ${ligne[1]}) est à revoir.` : `La ligne ${ligne[1]} corrigée est à revoir.`;
    if (v.libelle.startsWith("La dérivée")) return "La dérivée corrigée est à revoir.";
    return "Le résultat final est à revoir.";
  });
}

/** Rappel de saisie (texte brut : la syntaxe clavier est précisément ce qu'il faut taper). */
export function aideSaisie(e: ExerciceDetectiveLogarithmes): string {
  const genres = new Set(valeursAttendues(e).map((v) => v.genre));
  const morceaux = ["Écris des valeurs exactes : fraction (7/2), e, e^2, e^(1/2), ln(5), log2(8)."];
  if (genres.has("ensemble")) morceaux.push("Ensemble de solutions : les valeurs séparées par « ; », par exemple -3 ; 3 (∅ s'il n'y en a pas).");
  if (genres.has("fonction")) morceaux.push("Une fonction s'écrit avec x, par exemple 2x/(x^2+1) ou 3 + ln(x).");
  if (genres.has("intervalle")) morceaux.push("Un intervalle se construit avec les crochets et les bornes (e^2, 7/2…).");
  return morceaux.join(" ");
}

// ---------------------------------------------------------------------------------------------
// Consignes des écrans
// ---------------------------------------------------------------------------------------------

export function consignesEcrans(e: ExerciceDetectiveLogarithmes): FragmentConsigne[][] {
  const n = indiceLigneFausse(e) + 1;
  const valeurs = valeursAttendues(e);
  const correctionC =
    valeurs.length > 1
      ? valeurs[0]!.libelle.startsWith("La dérivée")
        ? [t(`Corrige la copie : donne la bonne dérivée, puis le résultat final correct (valeurs exactes).`)]
        : [t(`Corrige la copie : donne la bonne valeur de la ligne ${n}, puis le résultat final correct (valeurs exactes).`)]
      : [t(`Corrige la copie : reprends la résolution à partir de la ligne ${n} et donne le résultat final correct (valeur exacte).`)];
  return [[t("Quelle ligne de la copie est fausse ?")], [t(`Quelle erreur l'élève a-t-il commise à la ligne ${n} ?`)], correctionC];
}

// ---------------------------------------------------------------------------------------------
// Descriptions d'erreur (écran 2)
// ---------------------------------------------------------------------------------------------

export function descriptionFragments(id: IdDescriptionLogarithmes, e: ExerciceDetectiveLogarithmes): FragmentConsigne[] {
  return souderPonctuation(descriptionBrute(id, e));
}

/** Base du logarithme d'un scénario d'inéquation (B1, B2), en LaTeX. */
function baseInequation(e: ExerciceDetectiveLogarithmes): string {
  return e.scenario === "B1" ? `\\frac{1}{${TABLE_B1[e.donnees.i!]!.d}}` : BASES_B2[e.donnees.j!]!;
}

/** Le logarithme de cette base, écrit comme dans la copie (`\log_{1/2}`, `\log_{0{,}5}`). */
function logInequation(e: ExerciceDetectiveLogarithmes): string {
  return e.scenario === "B1" ? `\\log_{1/${TABLE_B1[e.donnees.i!]!.d}}` : `\\log_{${BASES_B2[e.donnees.j!]}}`;
}

function descriptionBrute(id: IdDescriptionLogarithmes, e: ExerciceDetectiveLogarithmes): FragmentConsigne[] {
  const d = e.donnees;
  switch (id) {
    case "somme":
      return [
        t("Le logarithme d'une somme n'est pas la somme des logarithmes : la propriété du cours porte sur un produit, "),
        l("\\ln(xy) = \\ln(x) + \\ln(y)"),
        t(". Il fallait revenir à la définition : "),
        l(`\\ln(x + ${d.a}) = ${d.b} \\iff x + ${d.a} = ${eP(d.b!)}`),
        t("."),
      ];
    case "produit":
      return [t("Le logarithme d'un produit est la somme des logarithmes, et non leur produit : "), l(`\\ln(${eP(d.k!)}x) = \\ln(${eP(d.k!)}) + \\ln(x)`), t(".")];
    case "valeurAbsolue":
      return [
        t("La valeur absolue est oubliée : "),
        l("\\ln(x^2) = 2\\ln|x|"),
        t(", car "),
        l("\\ln(x^2)"),
        t(" existe pour tout "),
        l("x \\neq 0"),
        t(" alors que "),
        l("\\ln(x)"),
        t(" exige "),
        l("x > 0"),
        t(e.scenario === "C1" ? " : la solution négative a été perdue." : " : les solutions négatives ont été perdues."),
      ];
    case "ceRegroupee": {
      const { r, s, base } = TABLE_D1[d.i!]!;
      const lg = logBase(base);
      return [
        t("La CE est calculée sur l'équation regroupée au lieu de l'équation de départ : "),
        l(`${lg}(x)`),
        t(" et "),
        l(`${lg}(x - ${r - s})`),
        t(" exigent "),
        l("x > 0"),
        t(" et "),
        l(`x - ${r - s} > 0`),
        t(" ; regrouper les logarithmes a élargi le domaine."),
      ];
    }
    case "solutionParasite":
      return [
        t("La CE de l'équation de départ n'est pas vérifiée : "),
        l("2\\ln(x)"),
        t(" n'existe que pour "),
        l("x > 0"),
        t(", donc "),
        l(`x = -${d.r! - 1}`),
        t(" est une solution parasite, apparue en passant à "),
        l("\\ln(x^2)"),
        t(", défini aussi pour "),
        l("x < 0"),
        t("."),
      ];
    case "sensBase":
      return [t("Le sens n'est pas inversé : la base "), l(baseInequation(e)), t(" est comprise entre 0 et 1, donc "), l(logInequation(e)), t(" est décroissante et l'inégalité change de sens.")];
    case "carreLn":
      return e.scenario === "P1"
        ? [l("(\\ln(x))^2"), t(" est le carré de "), l("\\ln(x)"), t(" ; il ne faut pas le confondre avec "), l("\\ln(x^2) = 2\\ln(x)"), t(". Il fallait poser "), l("t = \\ln(x)"), t(" et résoudre "), l(`t^2 = ${d.m! * d.m!}`), t(".")]
        : [l("(\\ln(x))^2"), t(" est le carré de "), l("\\ln(x)"), t(" ; il ne faut pas le confondre avec "), l("\\ln(x^2) = 2\\ln(x)"), t(". Il fallait dériver le carré "), l("u^2"), t(" avec "), l("u = \\ln(x)"), t(".")];
    case "quotient":
      return e.scenario === "Q1"
        ? [t("Un quotient de logarithmes n'est pas le logarithme d'une différence : c'est la différence qui donne un quotient, "), l("\\ln(x) - \\ln(a) = \\ln\\left(\\dfrac{x}{a}\\right)"), t(". Ici, "), l(`\\dfrac{\\ln(x)}{\\ln(${d.a})} = \\log_{${d.a}}(x)`), t(" (changement de base).")]
        : [t("Un quotient de logarithmes n'est pas le logarithme d'une différence (c'est la différence de deux logarithmes qui donne le logarithme d'un quotient) : il fallait calculer chaque logarithme, puis diviser.")];
    case "deriveeCompose":
      return [t("La dérivée intérieure est oubliée : "), l("(\\ln(u))' = \\dfrac{u'}{u}"), t(", et non "), l("\\dfrac{1}{u}"), t(" ; ici "), l(e.scenario === "V1" ? "u'(x) = 2x" : `u'(x) = ${d.a}`), t(".")];
    case "changementBase":
      return [t("Le changement de base est inversé : "), l("\\log_a(x) = \\dfrac{\\ln(x)}{\\ln(a)}"), t(" — le logarithme de l'argument au numérateur, celui de la base au dénominateur.")];
    // --- leurres (toujours faux pour la ligne visée) ---
    case "produitSomme":
      return [t("Il fallait écrire "), l(`\\ln(x + ${d.a}) = \\ln(x) \\cdot \\ln(${d.a})`), t(" : le logarithme transforme une somme en produit.")];
    case "puissanceSomme":
      return [t("Il fallait écrire "), l(`\\ln(x + ${d.a}) = ${d.a}\\ln(x)`), t(" : le nombre "), l(`${d.a}`), t(" sort du logarithme comme un exposant.")];
    case "ceSomme":
      return [t("L'égalité écrite est juste, mais seulement pour "), l(`x > ${d.a}`), t(" : il fallait corriger la CE.")];
    case "puissanceProduit":
      return [t("Il fallait écrire "), l(`\\ln(${eP(d.k!)}x) = ${d.k}x`), t(" : le logarithme et l'exponentielle se simplifient sur tout le produit.")];
    case "diviserK":
      return [t("Il fallait écrire "), l(`\\ln(${eP(d.k!)}x) = \\dfrac{\\ln(x)}{${d.k}}`), t(" : l'exposant de "), l("e"), t(" divise le logarithme.")];
    case "ceProduit":
      return [t("L'égalité est juste, mais elle n'est valable que pour "), l(`x > ${eP(d.k!)}`), t(" : il fallait corriger la CE.")];
    case "carreDouble":
      return [t("Il fallait écrire "), l("\\ln(x^2) = (\\ln(x))^2"), t(" : l'exposant s'applique au logarithme.")];
    case "carreRacine":
      return [t("Il fallait écrire "), l("\\ln(x^2) = \\dfrac{1}{2}\\ln(x)"), t(" : l'exposant 2 donne une racine carrée.")];
    case "ceCarre":
      return [t("L'égalité est juste, car "), l("\\ln(x^2)"), t(" n'existe que pour "), l("x > 0"), t(".")];
    case "sensCarre":
      return [t("Il fallait inverser le sens de l'inégalité en divisant les deux membres par 2.")];
    case "ceInegalite":
      return [t("Le signe de "), l(`x(x - ${TABLE_D1[d.i!]!.r - TABLE_D1[d.i!]!.s})`), t(" est mal étudié : ce produit est strictement positif seulement pour "), l(`0 < x < ${TABLE_D1[d.i!]!.r - TABLE_D1[d.i!]!.s}`), t(".")];
    case "ceInutile":
      return [t("Aucune CE n'est nécessaire, puisque les deux logarithmes ont été regroupés en un seul.")];
    case "ceNonNul":
      return [t("La CE devait être "), l(`x(x - ${TABLE_D1[d.i!]!.r - TABLE_D1[d.i!]!.s}) \\neq 0`), t(" : un logarithme existe dès que son argument est non nul.")];
    case "injectiviteFausse":
      return [t("La fonction ln n'est pas injective : on ne peut pas passer de "), l(`\\ln(x^2) = \\ln(x + ${d.r! * (d.r! - 1)})`), t(" à "), l(`x^2 = x + ${d.r! * (d.r! - 1)}`), t(".")];
    case "rejeterR":
      return [t("Il fallait rejeter "), l(`x = ${d.r}`), t(", qui ne vérifie pas "), l(`x + ${d.r! * (d.r! - 1)} > 0`), t(".")];
    case "deuxSolutionsAbs":
      return [t("Il manque des solutions : comme "), l("x^2"), t(" apparaît, "), l(`x = -${d.r}`), t(" et "), l(`x = ${d.r! - 1}`), t(" sont aussi solutions.")];
    case "puissanceSigne": {
      const { d: den, n } = TABLE_B1[d.i!]!;
      return [t("La puissance est mal calculée : "), l(`\\left(\\frac{1}{${den}}\\right)^{-${n}} = -${den ** n}`), t(".")];
    }
    case "ceBase":
      return [t("La CE est fausse : un logarithme de base "), l(baseInequation(e)), t(" exige un argument plus grand que 1, donc "), l(`x - ${d.p} > 1`), t(".")];
    case "baseConserve":
      return [t("Il fallait remplacer la base "), l(baseInequation(e)), t(" par "), l(`${TABLE_B1[d.i!]!.d}`), t(" sans rien changer d'autre, car "), l(`\\log_{1/${TABLE_B1[d.i!]!.d}}(y) = \\log_{${TABLE_B1[d.i!]!.d}}(y)`), t(".")];
    case "simplifierLog":
      return [t("On ne peut jamais supprimer deux logarithmes de part et d'autre d'une inégalité : il fallait d'abord tout réécrire avec ln.")];
    case "ceIntersection":
      return [t("La CE est fausse : il fallait garder "), l(`x > -${d.c}`), t(", la condition la moins restrictive.")];
    case "sensMembre":
      return [t("Le sens ne s'inverse que si l'on multiplie par un nombre négatif : ici, la ligne est juste.")];
    case "carreLnCarre":
      return e.scenario === "P1"
        ? [t("Il fallait écrire "), l("(\\ln(x))^2 = 2\\ln|x|"), t(" : la valeur absolue est oubliée.")]
        : [t("Il fallait écrire "), l("f(x) = 2\\ln|x|"), t(" : la valeur absolue est oubliée.")];
    case "carreExp":
      return [t("Il fallait écrire "), l("(\\ln(x))^2 = \\ln(2x)"), t(" : l'exposant 2 devient un facteur dans le logarithme.")];
    case "carreCE":
      return [t("L'égalité est juste, mais seulement pour "), l("x > 1"), t(" : il fallait restreindre le domaine.")];
    case "quotientDiff":
      return e.scenario === "Q1"
        ? [t("Il fallait écrire "), l(`\\dfrac{\\ln(x)}{\\ln(${d.a})} = \\ln(x) - \\ln(${d.a})`), t(".")]
        : [t("Il fallait écrire "), l(`\\dfrac{\\log_2(${2 ** (d.n! + 1)})}{\\log_2(${2 ** d.n!})} = \\log_2(${2 ** (d.n! + 1)}) - \\log_2(${2 ** d.n!})`), t(".")];
    case "quotientSimplifier":
      return e.scenario === "Q1"
        ? [t("Il fallait simplifier par ln : "), l(`\\dfrac{\\ln(x)}{\\ln(${d.a})} = \\dfrac{x}{${d.a}}`), t(".")]
        : [t("Il fallait simplifier par "), l("\\log_2"), t(" : "), l(`\\dfrac{\\log_2(${2 ** (d.n! + 1)})}{\\log_2(${2 ** d.n!})} = \\dfrac{${2 ** (d.n! + 1)}}{${2 ** d.n!}}`), t(".")];
    case "quotientCE":
      return [t("L'égalité est juste, mais la CE devient "), l(`x > ${d.a}`), t(".")];
    case "quotientLogQuotient":
      return [t("Il fallait écrire "), l(`\\dfrac{\\log_2(${2 ** (d.n! + 1)})}{\\log_2(${2 ** d.n!})} = \\log_2\\left(\\dfrac{${2 ** (d.n! + 1)}}{${2 ** d.n!}}\\right)`), t(".")];
    case "deriveeUSurU2":
      return [t("La dérivée de "), l("\\ln(u)"), t(" est "), l("-\\dfrac{u'}{u^2}"), t(".")];
    case "deriveeLnPrime":
      return [t("La dérivée de "), l("\\ln(u)"), t(" est "), l("\\ln(u')"), t(".")];
    case "deriveeDomaine":
      return [t("La dérivée est juste, mais seulement pour "), l("x > 0"), t(", le domaine de ln.")];
    case "baseProduit":
      return [t("Il fallait écrire "), l("\\log_a(x) = \\ln(a) \\cdot \\ln(x)"), t(".")];
    case "baseDifference":
      return [t("Il fallait écrire "), l("\\log_a(x) = \\ln(x) - \\ln(a)"), t(".")];
    case "baseLog10":
      return [t("Le changement de base ne s'applique qu'avec "), l("\\log"), t(" (base 10), jamais avec ln.")];
  }
}

const NOMS_COURTS: Partial<Record<IdDescriptionLogarithmes, string>> = {
  somme: "ln(x + a) remplacé par ln(x) + ln(a)",
  produit: "ln(xy) remplacé par ln(x) · ln(y)",
  valeurAbsolue: "valeur absolue oubliée dans ln(x²) = 2 ln|x|",
  ceRegroupee: "CE calculée sur l'équation regroupée",
  solutionParasite: "CE non vérifiée, solution parasite gardée",
  sensBase: "sens non inversé pour une base comprise entre 0 et 1",
  carreLn: "(ln x)² confondu avec ln(x²)",
  quotient: "quotient de logarithmes écrit comme le logarithme d'une différence",
  deriveeCompose: "dérivée de ln(u) écrite 1/u au lieu de u′/u",
  changementBase: "changement de base inversé",
};

export function nomErreur(e: ExerciceDetectiveLogarithmes): string {
  return NOMS_COURTS[descriptionCorrecte(e)] ?? "";
}

// ---------------------------------------------------------------------------------------------
// Aides (jamais la réponse finale : il reste toujours au moins un calcul)
// ---------------------------------------------------------------------------------------------

function aidesLigne(e: ExerciceDetectiveLogarithmes): FragmentConsigne[][] {
  const i = indiceLigneFausse(e);
  const n = SCENARIOS[e.scenario].nombreLignes;
  const [p, q] = i % 2 === 0 ? (i + 1 < n ? [i, i + 1] : [i - 1, i]) : [i - 1, i];
  return [
    [t("Refais la résolution à partir des données, ligne par ligne, en comparant chaque propriété utilisée à celle du cours : la première ligne qui ne redonne pas le même résultat est la ligne fausse.")],
    [t(`L'erreur se trouve à la ligne ${p + 1} ou à la ligne ${q + 1}.`)],
  ];
}

const AIDES_ERREUR: Record<TypeErreurLogarithmes, FragmentConsigne[][]> = {
  somme: [
    [t("Rappel du cours :"), l("\\ln(xy) = \\ln(x) + \\ln(y)")],
    [t("Teste l'égalité écrite à cette ligne avec "), l("x = 1"), t(" : les deux membres sont-ils égaux ?")],
  ],
  carre: [
    [t("Rappel du cours, pour tout "), l("x"), t(" non nul :"), l("\\ln(x^2) = 2\\ln|x|")],
    [t("Compare le domaine de chacun des deux membres de l'égalité utilisée :"), l("\\ln(x^2) \\qquad 2\\ln(x)")],
  ],
  domaine: [
    [t("Rappel du cours : la CE se lit sur l'équation de départ, avant toute transformation ; chaque logarithme exige un argument strictement positif.")],
    [t("Remplace chaque valeur trouvée dans l'équation de départ : chaque logarithme existe-t-il ?")],
  ],
  base: [
    [t("Pour "), l("0 < a < 1"), t(", la fonction "), l("\\log_a"), t(" est décroissante :"), l("A < B \\iff \\log_a(A) > \\log_a(B)")],
    [t("Regarde la base du logarithme : est-elle plus grande ou plus petite que 1 ?")],
  ],
  puissance: [
    [t("Attention à la place de l'exposant :"), l("(\\ln(x))^2 = \\ln(x) \\cdot \\ln(x) \\qquad \\ln(x^2) = 2\\ln(x) \\quad (x > 0)")],
    [t("Teste l'égalité écrite par l'élève avec "), l("x = e"), t(" : les deux membres sont-ils égaux ?")],
  ],
  quotient: [
    [t("Rappel du cours :"), l("\\log_a(x) - \\log_a(y) = \\log_a\\left(\\dfrac{x}{y}\\right) \\qquad \\dfrac{\\ln(x)}{\\ln(a)} = \\log_a(x)")],
    [t("Un quotient de deux logarithmes est-il le logarithme d'une différence ?")],
  ],
  derivee: [
    [t("Rappel du cours :"), l("(\\ln(u))' = \\dfrac{u'}{u}")],
    [t("Identifie "), l("u"), t(", puis calcule "), l("u'"), t(" : apparaît-il dans la dérivée écrite par l'élève ?")],
  ],
  changementBase: [
    [t("Rappel du cours :"), l("\\log_a(x) = \\dfrac{\\ln(x)}{\\ln(a)}")],
    [t("Vérifie la formule de l'élève sur un cas connu, par exemple :"), l("\\log_2(8) = 3")],
  ],
};

function aidesCorrection(e: ExerciceDetectiveLogarithmes): FragmentConsigne[][] {
  const d = e.donnees;
  switch (e.scenario) {
    case "S1":
      return [
        [t("Reviens à la définition du logarithme :"), l("\\ln(A) = b \\iff A = e^{b}")],
        [t("Isole ensuite "), l("x"), t(", puis vérifie la CE :"), l(`x + ${d.a} = ${eP(d.b!)}`)],
      ];
    case "S2":
      return [
        [t("Logarithme d'un produit :"), l(`\\ln(${eP(d.k!)}x) = \\ln(${eP(d.k!)}) + \\ln(x)`)],
        [t("Puis, avec "), l(`\\ln(${eP(d.k!)}) = ${d.k}`), t(", résous :"), l(`${d.k} + \\ln(x) = ${d.m}`)],
      ];
    case "C1":
      return [
        [t("Pour tout "), l("x"), t(" non nul :"), l("\\ln(x^2) = 2\\ln|x|")],
        [t("Résous ensuite, sans oublier les deux signes possibles :"), l(`\\ln|x| = \\ln(${d.a})`)],
      ];
    case "C2":
      return [
        [t("Pour tout "), l("x"), t(" non nul :"), l("\\ln(x^2) = 2\\ln|x|")],
        [t("Résous ensuite, en excluant 0 :"), l(`\\ln|x| ${signe(d.s!, "<")} ${d.k}`)],
      ];
    case "D1": {
      const { r, s } = TABLE_D1[d.i!]!;
      return [
        [t("La CE se lit sur l'équation de départ ; chaque argument doit être strictement positif :"), l(`x > 0 \\qquad x - ${r - s} > 0`)],
        [t("Garde ensuite seulement les valeurs qui vérifient cette CE parmi :"), l(`x = ${r} \\qquad x = -${s}`)],
      ];
    }
    case "D2":
      return [
        [t("La CE de l'équation de départ :"), l(`x > 0 \\qquad x + ${d.r! * (d.r! - 1)} > 0`)],
        [t("Teste chaque valeur trouvée dans l'équation de départ :"), l(donneeLatex(e))],
      ];
    case "B1": {
      const { d: den, n } = TABLE_B1[d.i!]!;
      return [
        [t("La base est comprise entre 0 et 1, donc le sens s'inverse :"), l(`\\log_{1/${den}}(A) ${signe(d.s!, ">")} -${n} \\iff A ${signe(d.s!, "<")} \\left(\\frac{1}{${den}}\\right)^{-${n}}`)],
        [t("Résous, puis combine avec la CE :"), l(`x > ${d.p}`)],
      ];
    }
    case "B2": {
      const base = `\\log_{${BASES_B2[d.j!]}}`;
      return [
        [t("La base est comprise entre 0 et 1, donc le sens s'inverse :"), l(`${base}(A) ${signe(d.s!, "<")} ${base}(B) \\iff A ${signe(d.s!, ">")} B`)],
        [t("Résous, puis combine avec la CE :"), l(`x > ${ratLatex(rat(d.b!, 2))}`)],
      ];
    }
    case "P1":
      return [
        [t("Pose "), l("t = \\ln(x)"), t(" : l'équation devient :"), l(`t^2 = ${d.m! * d.m!}`)],
        [t("Cette équation a deux solutions ; reviens ensuite à "), l("x"), t(" avec :"), l("x = e^{t}")],
      ];
    case "P2":
      return [
        [l("f"), t(" est le carré de "), l("u = \\ln(x)"), t(" :"), l("(u^2)' = 2u \\cdot u'")],
        [t("Calcule ensuite, avec "), l(`\\ln(${eP(d.k!)}) = ${d.k}`), t(" :"), l(`f'(${eP(d.k!)})`)],
      ];
    case "Q1":
      return [
        [t("Changement de base :"), l(`\\dfrac{\\ln(x)}{\\ln(${d.a})} = \\log_{${d.a}}(x)`)],
        [t("Résous ensuite, par définition du logarithme :"), l(`\\log_{${d.a}}(x) = ${d.q}`)],
      ];
    case "Q2":
      return [
        [t("Calcule chaque logarithme séparément, par exemple :"), l(`\\log_2(${2 ** d.n!}) = ${d.n}`)],
        [t("Puis divise :"), l(donneeLatex(e))],
      ];
    case "V1":
      return [
        [t("Ici "), l(`u(x) = x^2 + ${d.c}`), t(" ; calcule "), l("u'(x)"), t(", puis :"), l("f'(x) = \\dfrac{u'(x)}{u(x)}")],
        [t("Remplace ensuite "), l("x"), t(" par "), l(`${d.x0}`), t(" dans la dérivée corrigée :"), l(`f'(${d.x0})`)],
      ];
    case "V2":
      return [
        [t("Ici "), l(`u(x) = ${affine(d.a!, 1 - d.a! * d.x0!)}`), t(" :"), l("f'(x) = \\dfrac{u'(x)}{u(x)}")],
        [t("Tangente au point d'abscisse "), l("x_0"), t(" :"), l("y = f'(x_0)(x - x_0) + f(x_0)")],
      ];
    case "K1": {
      const [a, b] = TABLE_K1[d.i!]!;
      return [
        [t("Changement de base :"), l("\\log_a(x) = \\dfrac{\\ln(x)}{\\ln(a)}")],
        [t("Contrôle : la solution doit dépasser 1, car :"), l(`${a}^{1} = ${a} < ${b}`)],
      ];
    }
    case "K2": {
      const { c, p, q } = TABLE_K2[d.i!]!;
      return [
        [t("Changement de base :"), l("\\log_a(x) = \\dfrac{\\ln(x)}{\\ln(a)}")],
        [t("Écris ensuite les deux nombres comme des puissances de "), l(`${c}`), t(" :"), l(`${c ** p} = ${c}^{${p}} \\qquad ${c ** q} = ${c}^{${q}}`)],
      ];
    }
  }
}

export function aidesEcran(e: ExerciceDetectiveLogarithmes, ecran: number): FragmentConsigne[][] {
  if (ecran === 0) return aidesLigne(e);
  if (ecran === 1) return AIDES_ERREUR[typeErreur(e)];
  return aidesCorrection(e).map(souderPonctuation);
}

// ---------------------------------------------------------------------------------------------
// Corrigé : comment repérer la ligne fausse, piège
// ---------------------------------------------------------------------------------------------

export function constat(e: ExerciceDetectiveLogarithmes): FragmentConsigne[] {
  return souderPonctuation(constatBrut(e));
}

function constatBrut(e: ExerciceDetectiveLogarithmes): FragmentConsigne[] {
  const d = e.donnees;
  const n = indiceLigneFausse(e) + 1;
  switch (e.scenario) {
    case "S1":
      return [t(`À la ligne ${n}, l'égalité est fausse : pour `), l("x = 1"), t(", "), l(`\\ln(1 + ${d.a}) = \\ln(${1 + d.a!})`), t(" alors que "), l(`\\ln(1) + \\ln(${d.a}) = \\ln(${d.a})`), t(".")];
    case "S2":
      return [t(`À la ligne ${n}, l'égalité est fausse : pour `), l("x = 1"), t(", "), l(`\\ln(${eP(d.k!)}) = ${d.k}`), t(" alors que "), l(`${d.k}\\ln(1) = 0`), t(".")];
    case "C1":
      return [t(`À la ligne ${n}, `), l("2\\ln(x)"), t(" n'existe que pour "), l("x > 0"), t(", alors que "), l(`x = -${d.a}`), t(" vérifie aussi l'équation de départ : "), l(`\\ln\\left((-${d.a})^2\\right) = \\ln(${d.a! * d.a!})`), t(".")];
    case "C2":
      return [t(`À la ligne ${n}, `), l("2\\ln(x)"), t(" n'existe que pour "), l("x > 0"), t(", alors que "), l("x = -1"), t(" vérifie aussi l'inéquation de départ : "), l(`\\ln\\left((-1)^2\\right) = 0 ${signe(d.s!, "<")} ${2 * d.k!}`), t(".")];
    case "D1": {
      const { r, s, base } = TABLE_D1[d.i!]!;
      return [t(`À la ligne ${n}, la CE est lue sur l'équation regroupée : pour `), l(`x = -${s}`), t(", "), l(`${logBase(base)}(-${s})`), t(" n'existe pas dans l'équation de départ, même si "), l(`(-${s})(-${s} - ${r - s}) > 0`), t(".")];
    }
    case "D2":
      return [t(`À la ligne ${n}, la conclusion garde `), l(`x = -${d.r! - 1}`), t(", alors que "), l(`\\ln(-${d.r! - 1})`), t(" n'existe pas : cette valeur ne vérifie pas l'équation de départ.")];
    case "B1":
    case "B2":
      return [t(`À la ligne ${n}, les logarithmes sont supprimés sans changer le sens, alors que la base `), l(baseInequation(e)), t(" est comprise entre 0 et 1 : "), l(logInequation(e)), t(" est décroissante.")];
    case "P1":
      return [t(`À la ligne ${n}, l'égalité est fausse : pour `), l("x = e"), t(", "), l("(\\ln(e))^2 = 1"), t(" alors que "), l("2\\ln(e) = 2"), t(".")];
    case "P2":
      return [t(`À la ligne ${n}, l'égalité est fausse : pour `), l("x = e"), t(", "), l("f(e) = (\\ln(e))^2 = 1"), t(" alors que "), l("2\\ln(e) = 2"), t(".")];
    case "Q1":
      return [t(`À la ligne ${n}, l'égalité est fausse : pour `), l(`x = ${d.a}`), t(", le quotient vaut "), l(`\\dfrac{\\ln(${d.a})}{\\ln(${d.a})} = 1`), t(" alors que "), l(`\\ln(${d.a} - ${d.a}) = \\ln(0)`), t(" n'existe pas.")];
    case "Q2": {
      const X = 2 ** (d.n! + 1);
      const Y = 2 ** d.n!;
      return [t(`À la ligne ${n}, l'égalité est fausse : `), l(`\\log_2(${X}) = ${d.n! + 1}`), t(" et "), l(`\\log_2(${Y}) = ${d.n}`), t(", donc le quotient vaut "), l(`\\dfrac{${d.n! + 1}}{${d.n}}`), t(" et non "), l(`\\log_2(${X - Y}) = ${d.n}`), t(".")];
    }
    case "V1":
      return [t(`À la ligne ${n}, la dérivée de `), l(`u(x) = x^2 + ${d.c}`), t(" n'apparaît pas : "), l(`u'(x) = 2x`), t(".")];
    case "V2":
      return [t(`À la ligne ${n}, la dérivée de `), l(`u(x) = ${affine(d.a!, 1 - d.a! * d.x0!)}`), t(" n'apparaît pas : "), l(`u'(x) = ${d.a}`), t(".")];
    case "K1": {
      const [a, b] = TABLE_K1[d.i!]!;
      return [t(`À la ligne ${n}, comme `), l(`${a} < ${b}`), t(", "), l(`\\ln(${a}) < \\ln(${b})`), t(" : le quotient de la copie est plus petit que 1, alors que "), l(`${a}^{1} = ${a} < ${b}`), t(" impose "), l("x > 1"), t(".")];
    }
    case "K2": {
      const { c, p, q } = TABLE_K2[d.i!]!;
      const B = c ** p;
      const A = c ** q;
      return [
        t(`À la ligne ${n}, la formule est retournée. Par définition, `),
        l(`\\log_{${B}}(${A}) = r \\iff ${B}^{r} = ${A} \\iff ${c}^{${p}r} = ${c}^{${q}}`),
        t(", donc "),
        l(`r = ${ratLatex(rat(q, p))}`),
        t(" et non "),
        l(ratLatex(rat(p, q))),
        t("."),
      ];
    }
  }
}

export function piege(e: ExerciceDetectiveLogarithmes): FragmentConsigne[] {
  return souderPonctuation(piegeBrut(e));
}

function piegeBrut(e: ExerciceDetectiveLogarithmes): FragmentConsigne[] {
  switch (typeErreur(e)) {
    case "somme":
      return [t("Le logarithme transforme un produit en somme ("), l("\\ln(xy) = \\ln(x) + \\ln(y)"), t(") ; il n'existe aucune règle pour "), l("\\ln(x + y)"), t(".")];
    case "carre":
      return [l("\\ln(x^2) = 2\\ln|x|"), t(" pour tout "), l("x \\neq 0"), t(" : sans la valeur absolue, le domaine se réduit et des solutions disparaissent.")];
    case "domaine":
      return [t("La CE se lit sur l'équation de départ, avant de regrouper les logarithmes ; chaque solution trouvée doit la vérifier.")];
    case "base":
      return [t("Pour une base "), l("0 < a < 1"), t(", "), l("\\log_a"), t(" est décroissante : supprimer les logarithmes inverse le sens de l'inégalité.")];
    case "puissance":
      return [l("(\\ln(x))^2 = \\ln(x) \\cdot \\ln(x)"), t(" : l'exposant porte sur le logarithme, il ne sort pas devant comme dans "), l("\\ln(x^2) = 2\\ln(x)"), t(".")];
    case "quotient":
      return [t("Seule la différence de deux logarithmes donne le logarithme d'un quotient : "), l("\\log_a(x) - \\log_a(y) = \\log_a\\left(\\dfrac{x}{y}\\right)"), t(" ; un quotient de logarithmes est un changement de base.")];
    case "derivee":
      return [l("(\\ln(u))' = \\dfrac{u'}{u}"), t(" : n'oublie jamais la dérivée de l'argument.")];
    case "changementBase":
      return [l("\\log_a(x) = \\dfrac{\\ln(x)}{\\ln(a)}"), t(" : contrôle sur un cas connu, comme "), l("\\log_2(8) = 3"), t(".")];
  }
}

