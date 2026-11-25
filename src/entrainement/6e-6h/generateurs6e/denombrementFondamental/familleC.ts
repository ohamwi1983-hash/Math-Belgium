import { arrangements, coefficientBinomial, factorielle } from "../combinatoire";
import type { ExerciceDenombrementC, FormuleC } from "../../core6e/denombrementFondamental.types";
import { MOTS_LETTRES_DISTINCTES } from "./familleD";
import { melanger, tirerEntier, tirerParmi } from "./aleatoire";

/**
 * Famille C de `6gen43` — reconnaître le groupement parmi les quatre du cours qui n'ont pas de
 * répétition à compter (permutation P, arrangement A, arrangement avec répétition B, combinaison C),
 * puis calculer (audit 6e ch. 7, lot C). Le contexte ne nomme JAMAIS la structure (avant : « répétition
 * autorisée → puissance », « jeu de 52 cartes → combinaison », 100 % devinable), et la formule
 * attendue est tirée AVANT le contexte, à parts égales (`construireFamilleC`).
 */

const PERSONNES = ["coureurs", "nageuses", "élèves", "candidats", "musiciens"];

export function construireCartesContraintes(): ExerciceDenombrementC {
  const N = tirerParmi([32, 52] as const);
  const k = tirerEntier(3, 5);
  const m = tirerEntier(1, 2);
  const inclues = Math.random() < 0.5;
  const cartes = m === 1 ? "l'as de cœur" : "l'as de cœur et l'as de pique";
  const contexte = inclues
    ? `On tire au hasard une main de ${k} cartes dans un jeu de ${N} cartes. On ne garde que les mains qui contiennent ${cartes}.`
    : `Avant la donne, on retire ${cartes} d'un jeu de ${N} cartes. On tire ensuite une main de ${k} cartes parmi les cartes restantes.`;
  const n = N - m;
  const p = inclues ? k - m : k;
  return { famille: "C", sousType: "cartesContraintes", formule: "combinaison", contexte, question: "Combien de mains différentes peut-on obtenir ?", n, p, resultat: coefficientBinomial(n, p) };
}

export function construireMotsLettresDistinctes(): ExerciceDenombrementC {
  const mot = tirerParmi(MOTS_LETTRES_DISTINCTES.filter((x) => x.length <= 7));
  const n = mot.length;
  return {
    famille: "C",
    sousType: "motsLettresDistinctes",
    formule: "permutation",
    contexte: `On écrit des « mots » (qui n'ont pas besoin d'avoir un sens) en utilisant une fois et une seule chacune des lettres du mot ${mot}.`,
    question: "Combien de mots différents peut-on écrire ?",
    n,
    p: n,
    resultat: factorielle(n),
  };
}

export function construireMotsPositionFixee(): ExerciceDenombrementC {
  const mot = tirerParmi(MOTS_LETTRES_DISTINCTES.filter((x) => x.length >= 5));
  const lettres = melanger(mot.split(""));
  const deux = Math.random() < 0.5;
  const contrainte = deux ? `qui commencent par ${lettres[0]} et finissent par ${lettres[1]}` : `qui commencent par ${lettres[0]}`;
  const n = mot.length - (deux ? 2 : 1);
  return {
    famille: "C",
    sousType: "motsPositionFixee",
    formule: "permutation",
    contexte: `On écrit des « mots » (qui n'ont pas besoin d'avoir un sens) en utilisant une fois et une seule chacune des lettres du mot ${mot}. On ne garde que les mots ${contrainte}.`,
    question: "Combien de mots différents peut-on écrire ?",
    n,
    p: n,
    resultat: factorielle(n),
  };
}

export function construireMotsRepetition(): ExerciceDenombrementC {
  const forme = tirerParmi(["cadenas", "symboles", "lettres"] as const);
  if (forme === "cadenas") {
    const k = tirerEntier(3, 5);
    return {
      famille: "C",
      sousType: "motsRepetition",
      formule: "arrangementRepetition",
      contexte: `Un cadenas possède ${k} molettes ; chaque molette affiche un des chiffres de 0 à 9, et un même chiffre peut apparaître sur plusieurs molettes.`,
      question: "Combien de codes différents peut-on former ?",
      n: 10,
      p: k,
      resultat: 10 ** k,
    };
  }
  const n = tirerEntier(3, 7);
  const k = tirerEntier(2, n <= 4 ? 5 : 4);
  const contexte =
    forme === "symboles"
      ? `Un message est une suite de ${k} signaux ; chaque signal est choisi parmi ${n} couleurs de lampe, et une même couleur peut être utilisée plusieurs fois.`
      : `On écrit des « mots » de ${k} lettres avec les ${n} premières lettres de l'alphabet ; une lettre peut être écrite plusieurs fois.`;
  return { famille: "C", sousType: "motsRepetition", formule: "arrangementRepetition", contexte, question: forme === "symboles" ? "Combien de messages différents peut-on envoyer ?" : "Combien de mots différents peut-on écrire ?", n, p: k, resultat: n ** k };
}

export function construireArrangement(): ExerciceDenombrementC {
  const forme = tirerParmi(["podium", "bureau", "tierce"] as const);
  if (forme === "bureau") {
    const n = tirerEntier(8, 25);
    return {
      famille: "C",
      sousType: "arrangement",
      formule: "arrangement",
      contexte: `Une association de ${n} membres élit un président, un secrétaire et un trésorier ; une même personne ne peut occuper qu'un seul poste.`,
      question: "Combien de bureaux différents peut-on former ?",
      n,
      p: 3,
      resultat: arrangements(n, 3),
    };
  }
  if (forme === "tierce") {
    const n = tirerEntier(10, 18);
    return {
      famille: "C",
      sousType: "arrangement",
      formule: "arrangement",
      contexte: `${n} chevaux prennent le départ d'une course. Un parieur doit annoncer le premier, le deuxième et le troisième à l'arrivée.`,
      question: "Combien de pronostics différents peut-il faire ?",
      n,
      p: 3,
      resultat: arrangements(n, 3),
    };
  }
  const n = tirerEntier(6, 15);
  const p = tirerParmi([2, 3, 4] as const);
  const qui = tirerParmi(PERSONNES);
  return {
    famille: "C",
    sousType: "arrangement",
    formule: "arrangement",
    contexte: `${n} ${qui} participent à une épreuve. On récompense les ${p} premiers par ${p === 2 ? "une médaille d'or et une d'argent" : p === 3 ? "une médaille d'or, une d'argent et une de bronze" : "quatre prix différents"}.`,
    question: "Combien de classements des récompensés sont possibles ?",
    n,
    p,
    resultat: arrangements(n, p),
  };
}

const PAR_FORMULE: Record<FormuleC, (() => ExerciceDenombrementC)[]> = {
  permutation: [construireMotsLettresDistinctes, construireMotsPositionFixee],
  arrangement: [construireArrangement],
  arrangementRepetition: [construireMotsRepetition],
  combinaison: [construireCartesContraintes],
};

/** Formule attendue tirée d'abord, à parts égales (verdict équilibré), puis le contexte. */
export function construireFamilleC(): ExerciceDenombrementC {
  const formule = tirerParmi(["permutation", "arrangement", "arrangementRepetition", "combinaison"] as const);
  return tirerParmi(PAR_FORMULE[formule])();
}
