import { coefficientBinomial } from "../combinatoire";
import type { ExerciceDenombCombB } from "../../core6e/denombrementCombine.types";
import { tirerEntier, tirerParmi } from "./aleatoire";

/**
 * Famille B de `6gen44` — reconnaître la structure d'une sélection (rôle distingué, deux choix
 * indépendants, l'un ou l'autre groupe, un seul choix qui fixe le reste), puis calculer. Le contexte
 * ne nomme plus la structure (avant : « 1 rôle distingué », « les 2 choix sont indépendants »,
 * « TOUTES du même groupe »).
 */

const vide = { n: 0, k: 0, n1: 0, k1: 0, n2: 0, k2: 0 };

export function construireRoleDistingue(): ExerciceDenombCombB {
  const n = tirerEntier(10, 25);
  const k = tirerEntier(2, 4);
  const contexte = tirerParmi([
    `Dans un club de ${n} membres, on désigne un capitaine, puis ${k} autres membres qui l'accompagneront au tournoi (sans rôle particulier).`,
    `Parmi ${n} élèves, on choisit le porte-parole de la classe, puis ${k} autres élèves pour former avec lui le comité (les membres du comité n'ont pas de rôle particulier).`,
  ]);
  return { famille: "B", sousType: "roleDistingue", contexte, ...vide, n, k, resultat: n * coefficientBinomial(n - 1, k) };
}

export function construirePoolsSepares(): ExerciceDenombCombB {
  const n1 = tirerEntier(8, 18);
  const n2 = tirerEntier(8, 18);
  const k1 = tirerEntier(2, 3);
  const k2 = tirerEntier(2, 3);
  const contexte = tirerParmi([
    `Une délégation est formée de ${k1} élèves choisis parmi les ${n1} élèves de la classe A et de ${k2} élèves choisis parmi les ${n2} de la classe B.`,
    `Un menu comprend ${k1} entrées différentes choisies parmi ${n1} et ${k2} desserts différents choisis parmi ${n2}.`,
  ]);
  return { famille: "B", sousType: "poolsSepares", contexte, ...vide, n1, k1, n2, k2, resultat: coefficientBinomial(n1, k1) * coefficientBinomial(n2, k2) };
}

export function construireMemeContrainte(): ExerciceDenombCombB {
  const n1 = tirerEntier(8, 18);
  let n2 = tirerEntier(8, 18);
  while (n2 === n1) n2 = tirerEntier(8, 18);
  const k = tirerEntier(2, 4);
  const contexte = tirerParmi([
    `On forme une équipe de ${k} personnes, toutes membres du même club : le club de tennis compte ${n1} membres, le club de natation ${n2} (personne n'est dans les deux).`,
    `On choisit ${k} livres d'une même étagère : la première porte ${n1} romans, la seconde ${n2} bandes dessinées ; on ne mélange pas les deux étagères.`,
  ]);
  return { famille: "B", sousType: "memeContrainte", contexte, ...vide, n1, n2, k, resultat: coefficientBinomial(n1, k) + coefficientBinomial(n2, k) };
}

export function construirePartitionComplementaire(): ExerciceDenombCombB {
  const n = tirerEntier(10, 22);
  const k = tirerEntier(3, Math.min(7, n - 3));
  const contexte = tirerParmi([
    `On partage ${n} élèves en deux groupes : ${k} partent en excursion, les ${n - k} autres restent en classe.`,
    `${n} coureurs sont répartis en deux vagues de départ : ${k} dans la première, les ${n - k} autres dans la seconde.`,
  ]);
  return { famille: "B", sousType: "partitionComplementaire", contexte, ...vide, n, k, resultat: coefficientBinomial(n, k) };
}
