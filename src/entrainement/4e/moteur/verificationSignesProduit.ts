import type { Categorie } from "../core/generateur.types";
import type { Borne, Morceau, SigneA } from "../core/inequation.types";
import type { FacteurQuadratiqueIrreductible, FacteurSignesProduit, Grille, SolutionEnsembleProduit } from "../core/signesProduit.types";

/** Étape "signe irréductible" : compare au signe réel du facteur (constant, garanti par Δ<0). */
export function verifierSigneIrreductible(saisie: SigneA, facteur: FacteurQuadratiqueIrreductible): boolean {
  return saisie === facteur.signe;
}

/**
 * Étape "méthode" (promptgenerateur5signesProduit.md, point 9) : chaque facteur QUADRATIQUE de la
 * séquence (factorisable ou irréductible) propose désormais un 5ème choix "irreductible" ("Non
 * factorisable") à côté des 4 méthodes historiques — jamais demandé pour un facteur linéaire (rien
 * à factoriser, voir "racineLineaire" ci-dessous). La bonne réponse est toujours dérivée de la VRAIE
 * nature du facteur (jamais du choix de l'élève, même principe que le reste du projet) : la
 * catégorie réelle pour un facteur factorisable, "irreductible" pour un facteur réellement
 * irréductible.
 */
export function bonneReponseMethode(facteur: FacteurSignesProduit): Categorie {
  return facteur.type === "quadratique_factorisable" ? facteur.exercice.categorie : "irreductible";
}

export function verifierMethodeFacteur(choix: Categorie, facteur: FacteurSignesProduit): boolean {
  return choix === bonneReponseMethode(facteur);
}

/**
 * Étape "racine (facteur linéaire)" (promptgenerateur5signesProduit.md, point 10) : compare
 * directement à la racine réelle du facteur k(x-p) — un simple champ numérique, jamais une
 * expression à tokeniser (hors périmètre "parse_error", comme les autres champs purement
 * numériques du projet — voir AUDIT-comparaison-reponses.md).
 */
export function verifierRacineLineaire(saisie: number, facteur: Extract<FacteurSignesProduit, { type: "lineaire" }>): boolean {
  return saisie === facteur.polynome.p;
}

/**
 * Étape "grille" : comparaison structurelle cellule par cellule, notée en un seul essai global
 * (section 3 de la spec — "une réussite/échec global par tentative, pas cellule par cellule").
 * Ne connaît rien de la signification des lignes (voir src/generateurs/signesProduit/grille.ts::
 * ordreLignesGrille pour l'ordre canonique, construit une fois côté génération et respecté tel
 * quel par la présentation lors de la soumission) — une simple égalité de tableaux suffit.
 */
export function verifierGrille(saisie: Grille, attendu: Grille): boolean {
  if (saisie.lignes.length !== attendu.lignes.length) return false;
  if (saisie.produit.length !== attendu.produit.length) return false;

  const lignesEgales = saisie.lignes.every(
    (ligne, i) => ligne.length === attendu.lignes[i].length && ligne.every((signe, j) => signe === attendu.lignes[i][j]),
  );
  const produitEgal = saisie.produit.every((signe, i) => signe === attendu.produit[i]);
  return lignesEgales && produitEgal;
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

/** Clé de tri d'un morceau par sa borne gauche (-∞ toujours en premier, +∞ toujours en dernier). */
function cleTriBorne(borne: Borne): number {
  if (borne === "-inf") return -Infinity;
  if (borne === "+inf") return Infinity;
  return borne;
}

/**
 * Étape "intervalle" : compare la structure saisie par l'élève à la solution calculée
 * (SolutionEnsembleProduit, prompt-corrections-tableau-signes-3points.md point 2) — même principe
 * que verifierSolutionInequation (exercice "tableau de signes"), mais généralisé à un nombre
 * variable de morceaux ("union") et de valeurs exclues ("reel_sauf_points"), comparés
 * indépendamment de l'ordre de saisie (triés par borne gauche / valeur croissante avant
 * comparaison terme à terme).
 */
export function verifierSolutionSignesProduit(saisie: SolutionEnsembleProduit, attendu: SolutionEnsembleProduit): boolean {
  if (saisie.forme !== attendu.forme) return false;

  switch (saisie.forme) {
    case "vide":
    case "reel":
      return true;
    case "point":
      return saisie.valeur === (attendu as typeof saisie).valeur;
    case "reel_sauf_points": {
      const a = [...saisie.valeurs].sort((x, y) => x - y);
      const b = [...(attendu as typeof saisie).valeurs].sort((x, y) => x - y);
      return a.length === b.length && a.every((v, i) => v === b[i]);
    }
    case "intervalle":
      return morceauEgal(saisie.morceau, (attendu as typeof saisie).morceau);
    case "union": {
      const morceauxAttendus = (attendu as typeof saisie).morceaux;
      if (saisie.morceaux.length !== morceauxAttendus.length) return false;
      const s = [...saisie.morceaux].sort((x, y) => cleTriBorne(x.borneGauche) - cleTriBorne(y.borneGauche));
      const t = [...morceauxAttendus].sort((x, y) => cleTriBorne(x.borneGauche) - cleTriBorne(y.borneGauche));
      return s.every((m, i) => morceauEgal(m, t[i]));
    }
  }
}
