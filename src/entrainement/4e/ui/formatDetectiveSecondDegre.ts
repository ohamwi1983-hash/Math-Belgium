import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { DonneesDetectiveSecondDegre, IdDescriptionSecondDegre, TypeErreurSecondDegre } from "../core/detectiveSecondDegre.types";
import { coefsInequation, deltaEcrit, ensembleSolutionLatex, enonceLatex, estInequation, indiceLigneFausse, numerateurIR, solutionCorrecte, symboleInverse, symboleLatex } from "../moteur/modeleDetectiveSecondDegre";
import { lineaire, moinsH, polynome, q } from "./corrigeChapitre3";
import { souderPonctuation } from "./formatDetectiveVecteurs";

/**
 * Textes de gen121 « Détective d'erreurs : second degré » (écran ET papier : une seule source).
 * Formules toujours en LaTeX, jamais au clavier ; notation du chapitre 2 de 4e (Δ, x₁, x₂, CE,
 * crochets inversés, S).
 */

type E = DonneesDetectiveSecondDegre;
const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

export { souderPonctuation };

export const TITRES_ECRANS = ["La ligne fausse", "L'erreur commise", "La correction"];

export const CONSIGNE_GENERALE = "Une ligne de cette résolution est fausse. Trouve-la, explique l'erreur et corrige la résolution.";

/** Ce que l'élève fictif devait faire. */
export function recit(e: E): FragmentConsigne[] {
  return [t("Un élève devait résoudre dans "), l("\\mathbb{R}"), t(estInequation(e) ? " l'inéquation " : " l'équation "), l(enonceLatex(e)), t(". Voici sa copie.")];
}

export function consignesEcrans(e: E): FragmentConsigne[][] {
  const n = indiceLigneFausse(e) + 1;
  return [[t("Quelle ligne de la copie est fausse ?")], [t(`Quelle erreur l'élève a-t-il commise à la ligne ${n} ?`)], [t("Corrige la résolution : quel est l'ensemble-solution "), l("S"), t(" ?")]];
}

export function reponseFragments(e: E): FragmentConsigne[] {
  return [l(`S=${ensembleSolutionLatex(solutionCorrecte(e))}`)];
}

function nb(x: number): string {
  return q(x);
}

/** Facteur commun de la variante « mise en évidence ». */
export function facteurCommun(e: Extract<E, { variante: "miseEnEvidence" }>): string {
  return e.forme === "x" ? "x" : moinsH(-e.p);
}

// ---------------------------------------------------------------------------------------------
// Descriptions de l'écran 2
// ---------------------------------------------------------------------------------------------

export function descriptionFragments(id: IdDescriptionSecondDegre, e: E): FragmentConsigne[] {
  return souderPonctuation(descriptionBrute(id, e));
}

function descriptionBrute(id: IdDescriptionSecondDegre, e: E): FragmentConsigne[] {
  switch (id) {
    case "carreNegatif": {
      const b = e.variante === "discriminant" ? e.b : -1;
      return [t("Le carré de "), l("b"), t(" est faux : "), l(`(${b})^2=${b * b}`), t(", pas "), l(`-${b * b}`), t(" (sans parenthèses, on n'élève au carré que "), l(String(Math.abs(b))), t(").")];
    }
    case "leurre4ac":
      return [t("Le produit "), l("4ac"), t(" est mal calculé.")];
    case "leurreDeltaPlus":
      return [t("Le discriminant se calcule avec "), l("b^2+4ac"), t(".")];
    case "leurreSigneC":
      return [t("Le signe de "), l("c"), t(" a été oublié dans le produit "), l("4ac"), t(".")];
    case "moinsB": {
      const b = e.variante === "discriminant" ? e.b : -1;
      return [t("La formule commence par "), l("-b"), t(" : avec "), l(`b=${b}`), t(", le numérateur commence par "), l(nb(-b)), t(", pas par "), l(nb(b)), t(".")];
    }
    case "leurreDenominateurA":
      return [t("Le dénominateur de la formule est "), l("a"), t(", pas "), l("2a"), t(".")];
    case "leurreRacineDenominateur":
      return [t("La racine "), l("\\sqrt{\\Delta}"), t(" doit être au dénominateur de la formule.")];
    case "leurreSansRacine":
      return [t("La formule utilise "), l("\\Delta"), t(" et non "), l("\\sqrt{\\Delta}"), t(".")];
    case "divisionFacteur": {
      if (e.variante !== "miseEnEvidence") return [];
      const f = facteurCommun(e);
      const perdue = e.forme === "x" ? 0 : -e.p;
      return [t("On a divisé les deux membres par "), l(f), t(", qui peut être nul : la solution "), l(`x=${nb(perdue)}`), t(" est perdue. Il faut tout passer dans un membre et mettre "), l(f), t(" en évidence.")];
    }
    case "leurreMiseEnEvidence":
      return [t("Le facteur commun a été mal mis en évidence.")];
    case "leurreDevelopper":
      return [t("Il fallait d'abord tout développer : on ne peut résoudre qu'une équation développée.")];
    case "leurreDiviserCoefficient":
      return [t("On ne peut diviser les deux membres d'une équation que par un nombre positif.")];
    case "signesRacines": {
      if (e.variante !== "miseEnEvidence") return [];
      if (e.forme === "x") {
        return [t("Un facteur est nul quand "), l(`${lineaire(e.k, -e.m)}=0`), t(", c'est-à-dire "), l(`x=${nb(e.m / e.k)}`), t(", pas "), l(`x=${nb(-e.m / e.k)}`), t(" : le signe de la solution est inversé.")];
      }
      return [t("Le facteur "), l(moinsH(-e.p)), t(" est nul quand "), l(`x=${nb(-e.p)}`), t(" et le facteur "), l(moinsH(e.m - e.p)), t(" quand "), l(`x=${nb(e.m - e.p)}`), t(" : les signes des solutions sont inversés.")];
    }
    case "leurreDeuxFacteursNuls":
      return [t("Un produit est nul seulement quand ses deux facteurs sont nuls en même temps.")];
    case "leurreSolutionManquante":
      return [t("Il manque une solution : une équation du second degré en a toujours deux.")];
    case "signe4ac": {
      if (e.variante !== "sansSolution") return [];
      const p = 4 * e.a * e.c;
      return [t("Le terme "), l("-4ac"), t(" est mal signé : "), l(`-4\\cdot ${e.a}\\cdot ${e.c}=${-p}`), t(", donc "), l(`\\Delta=${e.b * e.b}-${p}`), t(", pas "), l(`${e.b * e.b}+${p}`), t(".")];
    }
    case "leurreCarre":
      return [t("Le carré de "), l("b"), t(" est mal calculé.")];
    case "leurreDeuxOpposees":
      return [t("Les deux solutions d'une équation du second degré sont toujours opposées.")];
    case "deltaNegatifUneSolution":
      return [t("Quand "), l("\\Delta<0"), t(", l'équation n'a aucune solution réelle ; une racine double, c'est quand "), l("\\Delta=0"), t(".")];
    case "leurreDeltaFaux":
      return [t("Le discriminant "), l("\\Delta"), t(" est mal calculé.")];
    case "leurreDoubleSigne":
      return [t("La racine double vaut "), l("\\dfrac{b}{2a}"), t(", pas "), l("-\\dfrac{b}{2a}"), t(".")];
    case "sensNonInverse": {
      if (e.variante !== "inequation") return [];
      return [t("En divisant les deux membres par "), l(String(e.k)), t(", un nombre négatif, il faut changer le sens de l'inégalité : "), l(`{${symboleLatex(e.symbole)}}`), t(" devient "), l(`{${symboleLatex(symboleInverse(e.symbole))}}`), t(".")];
    }
    case "leurrePasDiviser":
      return [t("On n'a pas le droit de diviser les deux membres d'une inéquation par un nombre.")];
    case "leurreCoefficientsDivision": {
      const k = e.variante === "inequation" ? e.k : -1;
      return [t("La division par "), l(String(k)), t(" est mal faite : les coefficients du trinôme sont faux.")];
    }
    case "leurreDiviserPositif": {
      const k = e.variante === "inequation" ? e.k : -1;
      return [t("Il fallait diviser par "), l(String(Math.abs(k))), t(" et non par "), l(String(k)), t(".")];
    }
    case "signeEntre":
      return [t("Un trinôme est du signe de "), l("a"), t(" à l'extérieur des racines, et du signe contraire entre elles : la copie a inversé les deux zones.")];
    case "leurreRacinesFausses":
      return [t("Les racines "), l("x_1"), t(" et "), l("x_2"), t(" sont mal calculées.")];
    case "leurreSigneA":
      return [t("Le signe de "), l("a"), t(" est mal lu : ici, "), l("a<0"), t(".")];
    case "leurreToujoursSigneA":
      return [t("Le trinôme est toujours du signe de "), l("a"), t(" : il ne change jamais de signe.")];
    case "ceFausse": {
      if (e.variante !== "rationnelle") return [];
      return [t("La condition d'existence est fausse : "), l(`${moinsH(e.p)}\\neq 0`), t(" donne "), l(`x\\neq ${nb(e.p)}`), t(", pas "), l(`x\\neq ${nb(-e.p)}`), t(" ; la valeur "), l(nb(e.p)), t(" n'est donc pas rejetée.")];
    }
    case "leurrePasDeCE":
      return [t("Une équation rationnelle n'a pas de condition d'existence : on peut multiplier par le dénominateur sans précaution.")];
    case "leurreCENumerateur":
      return [t("La condition d'existence doit aussi exclure les valeurs qui annulent le numérateur "), l("x^2"), t(".")];
    case "leurreCEZero":
      return [t("La condition d'existence est "), l("x\\neq 0"), t(".")];
    case "racineEtrangere": {
      const p = e.variante === "rationnelle" ? e.p : 0;
      return [t("La valeur "), l(`x=${nb(p)}`), t(" annule le dénominateur : elle est exclue par la condition d'existence et doit être rejetée.")];
    }
    case "leurreCEFausse":
      return [t("La condition d'existence est mal calculée.")];
    case "leurreMultiplication": {
      const p = e.variante === "rationnelle" ? e.p : 0;
      return [t("On n'a pas le droit de multiplier les deux membres par "), l(moinsH(p)), t(".")];
    }
    case "produitEnCroix": {
      const p = e.variante === "inequationRationnelle" ? e.p : 0;
      return [
        t("On ne peut pas multiplier une inéquation par "),
        l(moinsH(p)),
        t(" : son signe dépend de "),
        l("x"),
        t(" (le sens changerait quand "),
        l(`${moinsH(p)}<0`),
        t("). Il faut tout passer dans un membre et étudier le signe du quotient."),
      ];
    }
    case "leurreToujoursChanger": {
      const p = e.variante === "inequationRationnelle" ? e.p : 0;
      return [t("En multipliant par "), l(moinsH(p)), t(", il fallait changer le sens de l'inégalité.")];
    }
    case "leurreNumerateur":
      return [t("Le numérateur a été mal recopié.")];
    case "valeurCEIncluse": {
      if (e.variante !== "inequationRationnelle") return [];
      return [t("La valeur "), l(nb(e.p)), t(" annule le dénominateur : elle est toujours exclue de "), l("S"), t(", même avec "), l(`{${symboleLatex(e.symbole)}}`), t(" (crochet ouvert).")];
    }
    case "leurreZeroExclu": {
      const z = e.variante === "inequationRationnelle" ? e.z : 0;
      return [t("La valeur "), l(nb(z)), t(", qui annule le numérateur, doit être exclue de "), l("S"), t(".")];
    }
    case "leurreTableauFaux": {
      const z = e.variante === "inequationRationnelle" ? e.z : 0;
      const p = e.variante === "inequationRationnelle" ? e.p : 0;
      return [t("Le signe du quotient est mal lu : il est négatif à l'extérieur de "), l(nb(z)), t(" et "), l(nb(p)), t(".")];
    }
  }
}

/** Nom court de l'erreur (réponse brève, barème). */
export const NOMS_ERREURS: Record<TypeErreurSecondDegre, string> = {
  carreNegatif: "carré d'un nombre négatif écrit sans parenthèses",
  moinsB: "b au lieu de −b dans la formule",
  divisionFacteur: "division par un facteur qui peut être nul",
  signesRacines: "signes des solutions inversés",
  signe4ac: "terme −4ac mal signé",
  deltaNegatifUneSolution: "Δ < 0 lu comme une racine double",
  sensNonInverse: "sens non changé en divisant par un nombre négatif",
  signeEntre: "signe de a lu entre les racines",
  ceFausse: "condition d'existence fausse",
  racineEtrangere: "valeur interdite gardée",
  produitEnCroix: "multiplication par un dénominateur de signe inconnu",
  valeurCEIncluse: "valeur interdite incluse dans S",
};

export function nomErreur(e: E): string {
  return NOMS_ERREURS[e.type];
}

// ---------------------------------------------------------------------------------------------
// Ligne fausse corrigée, aides
// ---------------------------------------------------------------------------------------------

/** La ligne fausse, écrite correctement (aide de l'écran 2, première aide de l'écran 3). */
export function ligneCorrigee(e: E): FragmentConsigne[] {
  switch (e.type) {
    case "carreNegatif": {
      if (e.variante !== "discriminant") return [];
      const d = e.b * e.b - 4 * e.a * e.c;
      return [l(`\\Delta=${deltaEcrit(e.a, e.b, e.c)}=${e.b * e.b}+${-4 * e.a * e.c}=${d}`)];
    }
    case "moinsB": {
      if (e.variante !== "discriminant") return [];
      const s = Math.round(Math.sqrt(e.b * e.b - 4 * e.a * e.c));
      return [l(`x=\\dfrac{-b\\pm\\sqrt{\\Delta}}{2a}=\\dfrac{${nb(-e.b)}\\pm ${s}}{${2 * e.a}}`)];
    }
    case "divisionFacteur": {
      if (e.variante !== "miseEnEvidence") return [];
      return e.forme === "x" ? [l(`${polynome([e.k, -e.m, 0])}=0`), t(" (on passe tout dans le membre de gauche)")] : [l(`(${moinsH(-e.p)})^2${e.m > 0 ? "-" : "+"}${Math.abs(e.m) === 1 ? "" : Math.abs(e.m)}(${moinsH(-e.p)})=0`), t(" (on passe tout dans le membre de gauche)")];
    }
    case "signesRacines": {
      if (e.variante !== "miseEnEvidence") return [];
      return e.forme === "x" ? [l("x=0"), t(" ou "), l(`x=${nb(e.m / e.k)}`)] : [l(`x=${nb(-e.p)}`), t(" ou "), l(`x=${nb(e.m - e.p)}`)];
    }
    case "signe4ac": {
      if (e.variante !== "sansSolution") return [];
      return [l(`\\Delta=${deltaEcrit(e.a, e.b, e.c)}=${e.b * e.b}-${4 * e.a * e.c}=${e.b * e.b - 4 * e.a * e.c}`)];
    }
    case "deltaNegatifUneSolution":
      return [l("\\Delta<0"), t(" : aucune solution réelle.")];
    case "sensNonInverse": {
      if (e.variante !== "inequation") return [];
      return [l(`${polynome([1, -(e.r1 + e.r2), e.r1 * e.r2])}${symboleLatex(symboleInverse(e.symbole))}0`), t(" (on divise par "), l(String(e.k)), t(" : le sens change)")];
    }
    case "signeEntre":
      return [l("a=1>0"), t(" : le trinôme est positif à l'extérieur des racines et négatif entre elles.")];
    case "ceFausse": {
      if (e.variante !== "rationnelle") return [];
      return [t("CE : "), l(`${moinsH(e.p)}\\neq 0`), t(", donc "), l(`x\\neq ${nb(e.p)}`)];
    }
    case "racineEtrangere": {
      if (e.variante !== "rationnelle") return [];
      return [l(`x=${nb(e.p)}`), t(" annule le dénominateur : cette valeur est exclue par la CE.")];
    }
    case "produitEnCroix": {
      if (e.variante !== "inequationRationnelle") return [];
      return [l(`\\dfrac{${numerateurIR(e)}}{${moinsH(e.p)}}-1${symboleLatex(e.symbole)}0`), t(" (on passe tout dans le membre de gauche)")];
    }
    case "valeurCEIncluse": {
      if (e.variante !== "inequationRationnelle") return [];
      return [t("La valeur interdite "), l(nb(e.p)), t(" reste exclue : crochet ouvert de son côté.")];
    }
  }
}

function aidesLigne(e: E): FragmentConsigne[][] {
  const premiere = [t("Refais la résolution toi-même à partir de l'énoncé, ligne par ligne : la première ligne qui ne redonne pas ce que tu trouves est la ligne fausse.")];
  switch (e.variante) {
    case "discriminant":
      return [premiere, [t("Contrôle le calcul de "), l("\\Delta"), t(" (le carré d'un nombre négatif est positif), puis la formule des racines :"), l("x=\\dfrac{-b\\pm\\sqrt{\\Delta}}{2a}")]];
    case "miseEnEvidence":
      return [premiere, [t("Un facteur commun se met en évidence : on ne divise jamais par une expression qui peut être nulle. Puis un produit est nul quand un de ses facteurs est nul.")]];
    case "sansSolution":
      return [premiere, [t("Contrôle le calcul de "), l("\\Delta"), t(", en particulier le signe du terme "), l("-4ac"), t(", puis ce que le signe de "), l("\\Delta"), t(" dit du nombre de solutions.")]];
    case "inequation":
      return [premiere, [t("Diviser par un nombre négatif change le sens de l'inégalité, et un trinôme est du signe de "), l("a"), t(" à l'extérieur de ses racines. Contrôle chaque ligne avec ces deux règles.")]];
    case "rationnelle":
      return [premiere, [t("Contrôle la condition d'existence (un dénominateur n'est jamais nul), puis vérifie que chaque valeur trouvée la respecte.")]];
    case "inequationRationnelle":
      return [premiere, [t("Dans une inéquation, on ne multiplie jamais par une expression dont le signe dépend de "), l("x"), t(", et une valeur interdite n'est jamais dans "), l("S"), t(".")]];
  }
}

/** Règle du cours en jeu (aide 1 de l'écran 2, « Ce qu'on utilise » du corrigé b). */
export function regle(e: E): FragmentConsigne[] {
  switch (e.type) {
    case "carreNegatif":
      return [t("Le carré d'un nombre négatif est positif ; il s'écrit avec des parenthèses :"), l("(-3)^2=9")];
    case "moinsB":
      return [t("Formule des racines quand "), l("\\Delta>0"), t(" :"), l("x=\\dfrac{-b\\pm\\sqrt{\\Delta}}{2a}")];
    case "divisionFacteur":
      return [t("On ne divise jamais les deux membres par une expression qui peut être nulle : on passe tout dans un membre et on met le facteur commun en évidence (cours, point 1).")];
    case "signesRacines":
      return [t("Un produit est nul quand un de ses facteurs est nul ; chaque facteur donne une équation du premier degré :"), l("x-a=0\\iff x=a")];
    case "signe4ac":
      return [t("Le discriminant est "), l("\\Delta=b^2-4ac"), t(" ; quand "), l("a"), t(" et "), l("c"), t(" sont de même signe, le terme "), l("-4ac"), t(" est négatif.")];
    case "deltaNegatifUneSolution":
      return [t("Le signe de "), l("\\Delta"), t(" donne le nombre de solutions : deux si "), l("\\Delta>0"), t(", une (racine double) si "), l("\\Delta=0"), t(", aucune si "), l("\\Delta<0"), t(".")];
    case "sensNonInverse":
      return [t("Multiplier ou diviser les deux membres d'une inéquation par un nombre négatif change le sens de l'inégalité.")];
    case "signeEntre":
      return [t("Un trinôme qui a deux racines est du signe de "), l("a"), t(" à l'extérieur des racines et du signe contraire entre elles (cours, point 2).")];
    case "ceFausse":
      return [t("Condition d'existence : le dénominateur ne peut pas être nul (cours, point 5) :"), l("x-p\\neq 0\\iff x\\neq p")];
    case "racineEtrangere":
      return [t("Une valeur trouvée qui annule un dénominateur est rejetée : elle ne respecte pas la condition d'existence (cours, point 5).")];
    case "produitEnCroix":
      return [t("Dans une inéquation rationnelle, on ne fait jamais de produit en croix : on passe tout dans un membre, on réduit au même dénominateur et on étudie le signe du quotient (cours, point 6).")];
    case "valeurCEIncluse":
      return [t("Une valeur interdite n'appartient jamais à l'ensemble-solution, même quand le symbole est large (cours, point 6).")];
  }
}

function aidesErreur(e: E): FragmentConsigne[][] {
  const n = indiceLigneFausse(e) + 1;
  return [regle(e), [t(`La ligne ${n} correcte s'écrit : `), ...ligneCorrigee(e)]];
}

function aidesCorrection(e: E): FragmentConsigne[][] {
  const n = indiceLigneFausse(e) + 1;
  const premiere = [t(`Reprends la résolution à partir de la ligne ${n} corrigée : `), ...ligneCorrigee(e)];
  switch (e.variante) {
    case "discriminant": {
      const s = Math.round(Math.sqrt(e.b * e.b - 4 * e.a * e.c));
      return [premiere, [t("Calcule les deux valeurs séparément :"), l(`x_1=\\dfrac{${nb(-e.b)}-${s}}{${2 * e.a}}`), t(" et "), l(`x_2=\\dfrac{${nb(-e.b)}+${s}}{${2 * e.a}}`)]];
    }
    case "miseEnEvidence":
      return [premiere, [t("Un produit est nul quand un de ses facteurs est nul : écris les deux équations du premier degré et résous-les.")]];
    case "sansSolution":
      return [premiere, [t("Le signe de "), l("\\Delta"), t(" donne le nombre de solutions : deux si "), l("\\Delta>0"), t(", une si "), l("\\Delta=0"), t(", aucune si "), l("\\Delta<0"), t(".")]];
    case "inequation":
      return [premiere, [t("Le trinôme unitaire est positif à l'extérieur de "), l(nb(e.r1)), t(" et "), l(nb(e.r2)), t(", négatif entre elles : garde la zone demandée par le symbole, avec les bons crochets.")]];
    case "rationnelle":
      return [premiere, [t("Résous "), l(`${polynome([1, -(e.p + e.r), e.p * e.r])}=0`), t(", puis rejette la valeur interdite par la condition d'existence.")]];
    case "inequationRationnelle":
      return [premiere, [t("Le quotient "), l(`\\dfrac{${moinsH(e.z)}}{${moinsH(e.p)}}`), t(" change de signe en "), l(nb(e.z)), t(" et en "), l(nb(e.p)), t(" ; la valeur interdite a toujours un crochet ouvert.")]];
  }
}

export function aidesEcran(e: E, ecran: number): FragmentConsigne[][] {
  const aides = ecran === 0 ? aidesLigne(e) : ecran === 1 ? aidesErreur(e) : aidesCorrection(e);
  return aides.map(souderPonctuation);
}

/** Piège du corrigé (étape b). */
export function piege(e: E): FragmentConsigne[] {
  switch (e.type) {
    case "carreNegatif":
      return [t("Sur une calculatrice aussi, « −3² » donne −9 : tape toujours les parenthèses autour d'un nombre négatif qu'on élève au carré.")];
    case "moinsB":
      return [t("Quand "), l("b"), t(" est négatif, "), l("-b"), t(" est positif : écris la formule avec "), l("-b"), t(" avant de remplacer.")];
    case "divisionFacteur":
      return [t("La copie vérifie sa solution : elle est juste, mais une vérification ne montre jamais qu'il n'en manque pas.")];
    case "signesRacines":
      return [t("Lis chaque facteur comme une équation : on cherche la valeur qui l'annule, pas le nombre écrit dedans.")];
    case "signe4ac":
      return [t("Écris d'abord le produit "), l("4ac"), t(" avec ses signes, puis soustrais-le.")];
    case "deltaNegatifUneSolution":
      return [t("La racine double "), l("-\\dfrac{b}{2a}"), t(" n'existe que quand "), l("\\Delta=0"), t(".")];
    case "sensNonInverse":
      return [t("Diviser par un nombre négatif change aussi le sens : la ligne garde les bons coefficients mais pas le bon symbole.")];
    case "signeEntre":
      return [t("Retiens « signe de a à l'extérieur » : pense à la parabole qui part vers le haut quand "), l("a>0"), t(".")];
    case "ceFausse":
      return [t("Une condition d'existence se calcule comme une équation : "), l("x-p\\neq 0"), t(" donne "), l("x\\neq p"), t(".")];
    case "racineEtrangere":
      return [t("Après la résolution, compare toujours chaque valeur trouvée aux valeurs interdites.")];
    case "produitEnCroix":
      return [t("Le produit en croix est juste dans une équation, faux dans une inéquation.")];
    case "valeurCEIncluse":
      return [t("Un symbole large ne ferme que les crochets des valeurs qui annulent le numérateur.")];
  }
}

/** Description du symbole et des coefficients pour les aides de saisie (texte brut). */
export function aideSaisie(): string {
  return "Choisis l'allure de l'ensemble, puis complète-le : valeurs séparées par « ; », fractions acceptées (1/2), crochets à choisir.";
}

export { coefsInequation };
