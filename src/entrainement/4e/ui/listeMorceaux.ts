import type { Borne, Crochet, Morceau } from "../core/inequation.types";
import type { EtatMorceau } from "./morceauIntervalle";
import { construireMorceau, etatMorceauInitial } from "./morceauIntervalle";

/**
 * Généralisation de "union de deux intervalles" (tableau de signes) à une LISTE de N morceaux
 * (refonte points 1 et 5, prompt-refonte-caracteristiques-fonction.md) : un état par morceau,
 * ajout/retrait libres (bouton "+"/"×"), jamais fixé à 2. Réutilise `EtatMorceau`/`MorceauIntervalleInput`
 * tels quels pour chaque ligne — seule la gestion du NOMBRE de lignes est nouvelle ici.
 */
export type EtatListeMorceaux = EtatMorceau[];

/** Toujours une seule ligne vide au départ — l'élève ajoute au besoin. */
export function etatListeInitiale(): EtatListeMorceaux {
  return [etatMorceauInitial()];
}

export function ajouterMorceau(etat: EtatListeMorceaux): EtatListeMorceaux {
  return [...etat, etatMorceauInitial()];
}

/** Ne retire jamais la dernière ligne restante — toujours au moins un morceau à l'écran. */
export function retirerMorceau(etat: EtatListeMorceaux, index: number): EtatListeMorceaux {
  if (etat.length <= 1) return etat;
  return etat.filter((_, i) => i !== index);
}

export function remplacerMorceau(etat: EtatListeMorceaux, index: number, nouveauMorceau: EtatMorceau): EtatListeMorceaux {
  return etat.map((m, i) => (i === index ? nouveauMorceau : m));
}

/** null tant qu'au moins un morceau de la liste est incomplet. */
export function construireListe(etat: EtatListeMorceaux): Morceau[] | null {
  const morceaux = etat.map(construireMorceau);
  if (morceaux.some((m) => m === null)) return null;
  return morceaux as Morceau[];
}

function borneEgale(a: Borne, b: Borne): boolean {
  return a === b;
}

function morceauEgal(a: Morceau, b: Morceau): boolean {
  return (
    a.crochetGauche === b.crochetGauche &&
    a.crochetDroit === b.crochetDroit &&
    borneEgale(a.borneGauche, b.borneGauche) &&
    borneEgale(a.borneDroite, b.borneDroite)
  );
}

/**
 * Comparaison en MULTI-ENSEMBLE (ordre non significatif, comme l'union à 2 morceaux de "tableau
 * de signes" généralisée à N) : chaque morceau attendu doit être apparié exactement une fois à un
 * morceau saisi, et réciproquement — donc aussi un rejet si le nombre de morceaux diffère.
 */
export function verifierListeMorceaux(saisie: Morceau[], attendu: Morceau[]): boolean {
  if (saisie.length !== attendu.length) return false;
  const restants = [...attendu];
  for (const m of saisie) {
    const index = restants.findIndex((a) => morceauEgal(a, m));
    if (index === -1) return false;
    restants.splice(index, 1);
  }
  return true;
}

/** Un morceau à bornes égales (fermées des deux côtés) représente un point isolé exclu — pas de type dédié. */
export function morceauPoint(valeur: number): Morceau {
  return { crochetGauche: "[" as Crochet, borneGauche: valeur, crochetDroit: "]" as Crochet, borneDroite: valeur };
}
