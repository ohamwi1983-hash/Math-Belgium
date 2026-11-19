import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { ExerciceMethodeNombreSolutions, IdAffirmation, MethodeRapide } from "../core/methodeNombreSolutions.types";
import { enonceLatex, nombreSolutions, racineEvidente, solutions } from "../moteur/modeleMethodeNombreSolutions";
import { lineaire, q } from "./corrigeChapitre3";
import { souderPonctuation } from "./formatDetectiveVecteurs";

/**
 * Textes de gen113 « Reconnaître la méthode et le nombre de solutions » (écran ET papier : une seule
 * source). Vocabulaire du tableau « Reconnaître la technique » du cours (§ 1) et du rappel « Racine
 * évidente ».
 */

type E = ExerciceMethodeNombreSolutions;
const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

export { souderPonctuation };

export const CONSIGNE_GENERALE = "Sans tout calculer, reconnais la méthode la plus rapide et le nombre de solutions de cette équation ; donne ses solutions quand elles sont évidentes.";

export const TITRES_ECRANS = ["La méthode", "Le nombre de solutions", "Les solutions"];

/** Les six méthodes, dans l'ordre du tableau du cours (texte brut : boutons, fiches). */
export const METHODES: { id: MethodeRapide; libelle: string; detail: string }[] = [
  { id: "miseEnEvidence", libelle: "Mise en évidence", detail: "c = 0 : x en facteur" },
  { id: "differenceCarres", libelle: "Différence de deux carrés", detail: "b = 0, a et c de signes opposés" },
  { id: "aucuneSolution", libelle: "Aucune solution, sans calcul", detail: "b = 0, a et c de même signe" },
  { id: "carreParfait", libelle: "Carré parfait", detail: "b² = 4ac, donc Δ = 0" },
  { id: "racineEvidente", libelle: "Racine évidente", detail: "a + b + c = 0 ou a − b + c = 0" },
  { id: "discriminant", libelle: "Discriminant", detail: "aucun raccourci : cas général" },
];

export function libelleMethode(m: MethodeRapide): string {
  return METHODES.find((x) => x.id === m)!.libelle;
}

export function enonceFragments(e: E): FragmentConsigne[] {
  return [t("Équation : "), l(enonceLatex(e)), t(".")];
}

export function consignesEcrans(): FragmentConsigne[][] {
  return [
    [t("Quelle est la méthode la plus rapide pour résoudre cette équation ?")],
    [t("Combien de solutions a-t-elle ? Choisis la seule affirmation vraie.")],
    [t("Donne les solutions de l'équation.")],
  ];
}

/** Texte d'une affirmation de l'écran 2. */
export function affirmationFragments(id: IdAffirmation): FragmentConsigne[] {
  switch (id) {
    case "facteurX":
      return [t("Deux solutions, car "), l("c=0"), t(" : "), l("x"), t(" se met en évidence et l'une d'elles est "), l("0"), t(".")];
    case "moinsCaPositif":
      return [t("Deux solutions, car "), l("b=0"), t(" et "), l("x^2=-\\dfrac{c}{a}"), t(" est un nombre positif.")];
    case "moinsCaNegatif":
      return [t("Aucune solution, car "), l("b=0"), t(" et "), l("x^2=-\\dfrac{c}{a}"), t(" est un nombre négatif.")];
    case "deltaNul":
      return [t("Une seule solution (racine double), car "), l("\\Delta=0"), t(".")];
    case "deltaPositif":
      return [t("Deux solutions, car "), l("\\Delta>0"), t(".")];
    case "deltaNegatif":
      return [t("Aucune solution, car "), l("\\Delta<0"), t(".")];
    case "racineEvidente1":
      return [t("Deux solutions, car "), l("a+b+c=0"), t(" : "), l("1"), t(" est racine, et le produit "), l("P=\\dfrac{c}{a}"), t(" donne l'autre.")];
    case "racineEvidenteMoins1":
      return [t("Deux solutions, car "), l("a-b+c=0"), t(" : "), l("-1"), t(" est racine, et le produit "), l("P=\\dfrac{c}{a}"), t(" donne l'autre.")];
    case "produitNegatif":
      return [t("Deux solutions de signes opposés, car "), l("P=\\dfrac{c}{a}<0"), t(".")];
  }
}

export function solutionsLatex(e: E): string {
  const s = solutions(e);
  return s.length === 0 ? "S=\\varnothing" : `S=\\left\\{${s.map(q).join("\\,;\\,")}\\right\\}`;
}

export function reponseSolutionsFragments(e: E): FragmentConsigne[] {
  return [l(solutionsLatex(e))];
}

export function nombreSolutionsTexte(e: E): string {
  const n = nombreSolutions(e);
  return n === 0 ? "aucune solution" : n === 1 ? "une seule solution (racine double)" : "deux solutions";
}

// ---------------------------------------------------------------------------------------------
// Aides (jamais la réponse : il reste toujours un test ou un calcul à faire)
// ---------------------------------------------------------------------------------------------

function aidesMethode(e: E): FragmentConsigne[][] {
  const premiere: FragmentConsigne[] = [t("Écris d'abord l'équation sous la forme "), l("ax^2+bx+c=0"), t(" et repère "), l("a"), t(", "), l("b"), t(" et "), l("c"), t(".")];
  if (e.b === 0 || e.c === 0) {
    return [premiere, [t("Un coefficient est nul : "), l("c=0"), t(" se règle par une mise en évidence ; "), l("b=0"), t(" se règle en isolant "), l("x^2=-\\dfrac{c}{a}"), t(", et le signe de ce nombre décide.")]];
  }
  return [premiere, [t("Teste les raccourcis dans l'ordre : "), l("b^2=4ac"), t(" (carré parfait), puis "), l("a+b+c"), t(" et "), l("a-b+c"), t(" (racine évidente) ; si aucun ne marche, c'est le cas général.")]];
}

function aidesNombre(e: E): FragmentConsigne[][] {
  return [
    [t("Une affirmation est vraie quand sa raison est vraie pour cette équation : teste chaque raison sur "), l("a"), t(", "), l("b"), t(" et "), l("c"), t(".")],
    e.b !== 0 && e.c !== 0
      ? [t("Calcule le discriminant :"), l("\\Delta=b^2-4ac")]
      : e.b === 0
        ? [t("Calcule le nombre :"), l("-\\dfrac{c}{a}")]
        : [t("Mets "), l("x"), t(" en évidence : un produit est nul quand un de ses facteurs est nul.")],
  ];
}

function aidesSolutions(e: E): FragmentConsigne[][] {
  switch (e.methode) {
    case "miseEnEvidence":
      return [[t("Mets "), l("x"), t(" en évidence, puis annule chaque facteur.")], [t("Le second facteur donne une équation du premier degré :"), l(`${lineaire(e.a, e.b)}=0`)]];
    case "differenceCarres":
      return [[t("Isole le carré :"), l(`x^2=${q(-e.c / e.a)}`)], [t("Un carré égal à un nombre positif k donne deux solutions opposées :"), l("x=\\pm\\sqrt{k}")]];
    case "carreParfait":
      return [[t("Le trinôme est un carré parfait : écris-le sous la forme "), l("a(x-r)^2"), t(".")], [t("La racine double vaut :"), l("x=-\\dfrac{b}{2a}")]];
    case "racineEvidente": {
      const r = racineEvidente(e) ?? 1;
      return [[t("Une racine est "), l(String(r)), t(" ; le produit des racines donne l'autre :"), l("x_1\\cdot x_2=\\dfrac{c}{a}")], [t("Divise "), l("\\dfrac{c}{a}"), t(" par "), l(String(r)), t(" pour obtenir la seconde racine.")]];
    }
    default:
      return [[t("Pas de solution évidente ici.")]];
  }
}

export function aidesEcran(e: E, ecran: number): FragmentConsigne[][] {
  const a = ecran === 0 ? aidesMethode(e) : ecran === 1 ? aidesNombre(e) : aidesSolutions(e);
  return a.map(souderPonctuation);
}

export const AIDE_SAISIE = "Écris les solutions séparées par « ; » (par exemple −2 ; 3/4) ; fractions et racines acceptées.";
