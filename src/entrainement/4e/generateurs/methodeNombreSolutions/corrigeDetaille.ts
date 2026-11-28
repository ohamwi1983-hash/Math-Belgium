import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import type { ExerciceMethodeNombreSolutions } from "../../core/methodeNombreSolutions.types";
import { affirmationAttendue, aEcranSolutions, delta, enonceLatex, racineEvidente, trinomeLatex } from "../../moteur/modeleMethodeNombreSolutions";
import { affirmationFragments, libelleMethode, reponseSolutionsFragments } from "../../ui/formatMethodeNombreSolutions";
import { lineaire, moinsH, nombreTexte, q, qp, racineCarreeLatex, sansDoublons } from "../../ui/corrigeChapitre3";

/**
 * Corrigé détaillé « comme au tableau » de gen113 — règle `.claude/rules/feuilles-evaluations.md`.
 * Une lettre par écran : a) la méthode (les tests du tableau du cours, dans l'ordre), b) le nombre de
 * solutions (le calcul qui justifie l'affirmation vraie), c) les solutions quand elles sont évidentes.
 * Partagé par l'adaptateur papier et l'appli.
 */

type E = ExerciceMethodeNombreSolutions;
const lat = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });
const COURS = "(cours, point 1)";

function ligneReduction(e: E): LigneCalcul[] {
  if (e.presentation === "reduite") return [];
  return [ligne(`${enonceLatex(e)}\\iff ${trinomeLatex(e)}=0`, "on passe tout dans le membre de gauche")];
}

function lignesCoefficients(e: E): LigneCalcul[] {
  return [ligne(`a=${e.a}`), ligne(`b=${e.b}`), ligne(`c=${e.c}`)];
}

function lignesMethode(e: E): LigneCalcul[] {
  const { a, b, c } = e;
  const l = [...ligneReduction(e), ...lignesCoefficients(e)];
  switch (e.methode) {
    case "miseEnEvidence":
      return [...l, ligne("c=0", "pas de terme constant : x se met en évidence")];
    case "differenceCarres":
      return [...l, ligne("b=0", "pas de terme en x"), ligne(`-\\dfrac{c}{a}=${q(-c / a)}>0`, "a et c de signes opposés")];
    case "aucuneSolution":
      return [...l, ligne("b=0", "pas de terme en x"), ligne(`-\\dfrac{c}{a}=${q(-c / a)}<0`, "a et c de même signe")];
    case "carreParfait":
      return [...l, ligne(`b^2=${qp(b)}^2=${b * b}`), ligne(`4ac=4\\cdot ${qp(a)}\\cdot ${qp(c)}=${4 * a * c}`), ligne("b^2=4ac", "carré parfait")];
    case "racineEvidente": {
      const r = racineEvidente(e);
      return r === 1
        ? [...l, ligne(`b^2-4ac=${b * b - 4 * a * c}\\neq 0`, "pas un carré parfait"), ligne(`a+b+c=${a}${b < 0 ? "" : "+"}${b}${c < 0 ? "" : "+"}${c}=0`, "1 est racine évidente")]
        : [...l, ligne(`b^2-4ac=${b * b - 4 * a * c}\\neq 0`, "pas un carré parfait"), ligne(`a+b+c=${a + b + c}\\neq 0`), ligne(`a-b+c=${a}${-b < 0 ? "" : "+"}${-b}${c < 0 ? "" : "+"}${c}=0`, "−1 est racine évidente")];
    }
    case "discriminant":
      return [...l, ligne(`b^2-4ac=${b * b - 4 * a * c}\\neq 0`, "pas un carré parfait"), ligne(`a+b+c=${a + b + c}\\neq 0`), ligne(`a-b+c=${a - b + c}\\neq 0`, "aucune racine évidente")];
  }
}

function lignesNombre(e: E): LigneCalcul[] {
  const { a, b, c } = e;
  switch (e.methode) {
    case "miseEnEvidence":
      return [ligne(`${trinomeLatex(e)}=x(${lineaire(a, b)})`, "x en facteur"), ligne("x=0", "le premier facteur s'annule : une solution"), ligne(`${lineaire(a, b)}=0`, "le second facteur donne l'autre, non nulle")];
    case "differenceCarres":
    case "aucuneSolution":
      return [ligne(`${a === 1 ? "" : a === -1 ? "-" : a}x^2=${q(-c)}`, "on isole le terme en x²"), ligne(`x^2=${q(-c / a)}`, `on divise par ${nombreTexte(a)}`)];
    case "carreParfait":
      return [ligne(`\\Delta=b^2-4ac`), ligne(`=${b * b}-${4 * a * c}`), ligne("=0")];
    case "racineEvidente": {
      const r = racineEvidente(e)!;
      const P = c / a;
      return [ligne(`x_1=${r}`, r === 1 ? "car a + b + c = 0" : "car a − b + c = 0"), ligne(`P=\\dfrac{c}{a}=${q(P)}`, "produit des racines"), ligne(`x_2=\\dfrac{P}{x_1}\\neq x_1`, "car P ≠ 1 : deux racines distinctes")];
    }
    case "discriminant": {
      const d = delta(e);
      return [ligne(`\\Delta=${qp(b)}^2-4\\cdot ${qp(a)}\\cdot ${qp(c)}`), ligne(`=${b * b}${-4 * a * c < 0 ? "-" : "+"}${Math.abs(4 * a * c)}`), ligne(`=${d}`), ligne(d > 0 ? `${d}>0` : `${d}<0`, d > 0 ? "deux solutions" : "aucune solution réelle")];
    }
  }
}

function lignesSolutions(e: E): LigneCalcul[] {
  const { a, b, c } = e;
  switch (e.methode) {
    case "miseEnEvidence":
      return sansDoublons([ligne(`x(${lineaire(a, b)})=0`), ligne("x=0", "premier facteur nul"), ligne(`${lineaire(a, b)}=0`, "second facteur nul"), ligne(`x=${q(-b / a)}`, `on isole x`)]);
    case "differenceCarres": {
      const k = -c / a;
      return [ligne(`x^2=${q(k)}`), ligne(`x=\\pm\\sqrt{${q(k)}}`, "deux solutions opposées"), ligne(`=\\pm ${racineCarreeLatex(k)}`)];
    }
    case "carreParfait": {
      const r = -b / (2 * a);
      return [ligne(`${trinomeLatex(e)}=${a === 1 ? "" : a === -1 ? "-" : a}(${moinsH(r)})^2`, "carré parfait"), ligne(`x=-\\dfrac{b}{2a}=${q(r)}`, "racine double")];
    }
    case "racineEvidente": {
      const r = racineEvidente(e)!;
      return [ligne(`x_1=${r}`), ligne(`x_2=\\dfrac{c}{a}\\cdot\\dfrac{1}{x_1}=\\dfrac{${c}}{${a}}\\cdot\\dfrac{1}{${r}}`, "produit des racines : x₁·x₂ = c/a"), ligne(`=${q(c / a / r)}`)];
    }
    default:
      return [];
  }
}

function piegeMethode(e: E): FragmentConsigne[] {
  switch (e.methode) {
    case "miseEnEvidence":
      return [texte("Ne divise jamais par x : la solution x = 0 serait perdue.")];
    case "differenceCarres":
      return [texte("Un carré égal à un nombre positif donne deux solutions opposées, pas une seule.")];
    case "aucuneSolution":
      return [texte("Inutile de calculer Δ : un carré n'est jamais négatif.")];
    case "carreParfait":
      return [texte("Teste b² = 4ac avant de calculer Δ : la racine double se lit alors directement.")];
    case "racineEvidente":
      return [texte("Le discriminant marche aussi, mais tester a + b + c et a − b + c ne coûte qu'un calcul mental.")];
    case "discriminant":
      return [texte("Teste toujours les raccourcis avant de calculer Δ : ici, aucun ne s'applique.")];
  }
}

export function correctionDetailleeMethodeNombreSolutions(e: E): EtapeCorrection[] {
  const etapes: EtapeCorrection[] = [
    utilise("a", [texte(`Le tableau « Reconnaître la technique avant de calculer quoi que ce soit » ${COURS}, puis la racine évidente (a + b + c = 0 ou a − b + c = 0) avant le cas général.`)]),
    calcul("a", lignesMethode(e)),
    resultat("a", [texte(e.methode === "racineEvidente" ? `${libelleMethode(e.methode)} (le discriminant marche aussi, mais il est plus long).` : `${libelleMethode(e.methode)}.`)]),
    piege("a", piegeMethode(e)),
    utilise("b", e.b !== 0 && e.c !== 0 && e.methode !== "racineEvidente" ? [texte("Le signe de "), lat("\\Delta=b^2-4ac"), texte(" donne le nombre de solutions " + COURS + ".")] : e.methode === "racineEvidente" ? [texte("Relations de Viète " + COURS + " : "), lat("x_1\\cdot x_2=\\dfrac{c}{a}"), texte(".")] : [texte("Le raccourci reconnu à l'étape 1 donne directement le nombre de solutions " + COURS + ".")]),
    calcul("b", lignesNombre(e)),
    resultat("b", affirmationFragments(affirmationAttendue(e))),
  ];
  if (aEcranSolutions(e)) {
    etapes.push(utilise("c", [texte(`On termine avec la méthode de l'étape 1 ${COURS}.`)]), calcul("c", lignesSolutions(e)), resultat("c", reponseSolutionsFragments(e)));
  }
  return etapes;
}
