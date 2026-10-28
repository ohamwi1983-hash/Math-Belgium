/**
 * Couche A — "Tableau de fréquences". N'importe que la banque de contextes déjà partagée pour
 * "Inégalité de Bienaymé-Tchebychev" (`generateurs/bienaymeTchebychev/contextes.ts`, import
 * générateur→générateur, explicitement autorisé — voir CLAUDE.md) ; sinon totalement indépendant.
 */
import type { ExerciceTableauFrequences, LigneFrequence } from "../../core/tableauFrequences.types";
import { CONTEXTES } from "../bienaymeTchebychev/contextes";
import { tirerEchelle, valeurEchelle, valeursRealistes } from "../bienaymeTchebychev/echelleContexte";
import { randomInt, trierAleatoirement } from "./aleatoire";

/**
 * `n` toujours de la forme `2^a·5^b` — garantit que `effectif/n*100` a toujours une écriture
 * décimale finie (jamais périodique), quel que soit l'effectif entier tiré. Voir le contrat
 * (`core/tableauFrequences.types.ts`) pour la justification mathématique complète.
 */
export const CANDIDATS_N: readonly number[] = [10, 16, 20, 25];

const NOMBRE_VALEURS_MIN = 4;
const NOMBRE_VALEURS_MAX = 6;

/** Nombre d'unités de la grille de tirage des valeurs (0..LARGEUR_UNITES) — mise à l'échelle du
 * contexte par `tirerEchelle` (audit chapitre 4 : plus jamais 100 m en 6 s ni 0 h de sommeil). */
const LARGEUR_UNITES = 14;
const MAX_TENTATIVES = 500;

/** Tire `k` valeurs distinctes, triées croissant, dans `[min,max]` — jamais un tirage-puis-filtrage
 * a posteriori du nombre réel de distinctes, `k` est fixé d'abord et le tirage réessaie jusqu'à
 * l'atteindre. */
function tirerValeursDistinctes(k: number, min: number, max: number): number[] {
  const valeurs = new Set<number>();
  while (valeurs.size < k) {
    valeurs.add(randomInt(min, max));
  }
  return [...valeurs].sort((a, b) => a - b);
}

/** Répartit `n` en `k` parts strictement positives (chaque valeur distincte apparaît au moins une
 * fois) : chaque part démarre à 1, le reste (`n-k`) est distribué un à un sur un index tiré au
 * hasard — jamais une répartition uniforme prévisible. */
function tirerEffectifs(n: number, k: number): number[] {
  const effectifs = new Array(k).fill(1) as number[];
  let reste = n - k;
  while (reste > 0) {
    effectifs[randomInt(0, k - 1)] += 1;
    reste -= 1;
  }
  return effectifs;
}

function construireLignes(valeurs: number[], effectifs: number[], n: number): LigneFrequence[] {
  let cumule = 0;
  return valeurs.map((valeur, i) => {
    const effectif = effectifs[i];
    cumule += effectif;
    return {
      valeur,
      effectif,
      frequencePourcent: (effectif * 100) / n,
      effectifCumule: cumule,
      frequenceCumulee: (cumule * 100) / n,
    };
  });
}

/** Reconstruit la liste brute depuis les lignes (chaque valeur répétée `effectif` fois), puis la
 * mélange — jamais déjà triée, l'élève doit reconnaître lui-même les valeurs distinctes et leur
 * ordre croissant. */
function construireDonneesBrutes(lignes: LigneFrequence[]): number[] {
  const brutes: number[] = [];
  for (const ligne of lignes) {
    for (let i = 0; i < ligne.effectif; i++) brutes.push(ligne.valeur);
  }
  return trierAleatoirement(brutes);
}

export function genererExerciceTableauFrequences(): ExerciceTableauFrequences {
  let contexte = CONTEXTES[randomInt(0, CONTEXTES.length - 1)];
  let valeurs: number[] = [];
  for (let tentative = 0; tentative < MAX_TENTATIVES; tentative++) {
    contexte = CONTEXTES[randomInt(0, CONTEXTES.length - 1)];
    const echelle = tirerEchelle(contexte, LARGEUR_UNITES);
    if (echelle === null) continue;
    const k = randomInt(NOMBRE_VALEURS_MIN, NOMBRE_VALEURS_MAX);
    valeurs = tirerValeursDistinctes(k, 0, LARGEUR_UNITES).map((j) => valeurEchelle(echelle, j));
    if (valeursRealistes(contexte, valeurs)) break;
  }
  const n = CANDIDATS_N[randomInt(0, CANDIDATS_N.length - 1)];
  const k = valeurs.length;
  const effectifs = tirerEffectifs(n, k);
  const lignes = construireLignes(valeurs, effectifs, n);
  const donneesBrutes = construireDonneesBrutes(lignes);
  return { contexte, donneesBrutes, n, lignes };
}
