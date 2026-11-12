import type { CouleurTirage, ExerciceFamilleD } from "../../core6e/tiragesArbres.types";

/**
 * Couche A (6e) — génération famille D (« arbre pondéré ») pour `6gen31` — ajoutée par l'audit
 * 6e ch. 6 (décision D) : le cœur du §2 du chapitre (arbres pondérés) n'était exercé nulle part.
 *
 * Urne à 2 couleurs (n1, n2 ∈ {2..6}), 2 tirages successifs avec ou sans remise. Écrans :
 * 1. compléter les 6 branches de l'arbre affiché (2 au 1er niveau, 4 au 2e) ;
 * 2. probabilité d'un chemin (règle du produit) ;
 * 3. « exactement une boule de telle couleur » (somme de 2 chemins) ;
 * 4. « au moins une boule de telle couleur » (événement contraire : 1 − un chemin).
 * n1, n2 ≥ 2 : sans remise, aucune branche du 2e niveau ne vaut 0.
 */

const EFFECTIFS_D: readonly number[] = [2, 3, 4, 5, 6];

/** Couleurs à initiales distinctes (l'arbre porte les initiales). */
const COULEURS_D: readonly { label1: string; initiale1: string; label2: string; initiale2: string }[] = [
  { label1: "rouges", initiale1: "R", label2: "bleues", initiale2: "B" },
  { label1: "vertes", initiale1: "V", label2: "jaunes", initiale2: "J" },
  { label1: "noires", initiale1: "N", label2: "blanches", initiale2: "B" },
  { label1: "rouges", initiale1: "R", label2: "vertes", initiale2: "V" },
  { label1: "blanches", initiale1: "B", label2: "grises", initiale2: "G" },
];

function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}

function tirerCouleur(): CouleurTirage {
  return Math.random() < 0.5 ? 0 : 1;
}

/** Construction avec le mode de tirage imposé (catalogue de variantes), le reste tiré au hasard. */
export function construireFamilleD(avecRemise: boolean): ExerciceFamilleD {
  const n1 = tirerParmi(EFFECTIFS_D);
  let n2 = tirerParmi(EFFECTIFS_D);
  while (n2 === n1 && Math.random() < 0.7) n2 = tirerParmi(EFFECTIFS_D);
  const c = tirerParmi(COULEURS_D);
  return {
    famille: "D",
    n1,
    n2,
    labelCouleur1: c.label1,
    labelCouleur2: c.label2,
    initiale1: c.initiale1,
    initiale2: c.initiale2,
    avecRemise,
    chemin: [tirerCouleur(), tirerCouleur()],
    couleurCible: tirerCouleur(),
  };
}

export function genererFamilleD(): ExerciceFamilleD {
  return construireFamilleD(Math.random() < 0.5);
}
