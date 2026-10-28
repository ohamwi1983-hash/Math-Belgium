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

/** Un morceau d'ensemble sous forme numérique : bornes ±Infinity pour ±∞, `gFerme`/`dFerme` = crochet fermé. */
interface Plage {
  g: number;
  gFerme: boolean;
  d: number;
  dFerme: boolean;
}

const TOLERANCE = 1e-9;

function valeurBorne(borne: Borne): number {
  if (borne === "-inf") return -Infinity;
  if (borne === "+inf") return Infinity;
  return borne;
}

/** null si le morceau est mal formé (bornes inversées, ∞ fermé, [a ; a[ …) — jamais accepté. */
function plageDepuisMorceau(m: Morceau): Plage | null {
  const g = valeurBorne(m.borneGauche);
  const d = valeurBorne(m.borneDroite);
  const gFerme = m.crochetGauche === "[";
  const dFerme = m.crochetDroit === "]";
  if (!Number.isFinite(g) && gFerme) return null;
  if (!Number.isFinite(d) && dFerme) return null;
  if (g === Infinity || d === -Infinity) return null;
  if (g > d + TOLERANCE) return null;
  if (Math.abs(g - d) <= TOLERANCE && !(gFerme && dFerme)) return null;
  return { g, gFerme, d, dFerme };
}

function plagePoint(v: number): Plage {
  return { g: v, gFerme: true, d: v, dFerme: true };
}

/**
 * Forme canonique d'un ensemble-solution : plages triées, disjointes et non contiguës (deux plages
 * qui se touchent en un point inclus d'un côté au moins sont fusionnées) — un point isolé est une
 * plage [v ; v]. Deux écritures du même ensemble donnent la même forme canonique ; null si une partie
 * de la saisie est mal formée.
 */
export function formeCanoniqueEnsemble(solution: SolutionEnsembleProduit): Plage[] | null {
  let plages: (Plage | null)[];
  switch (solution.forme) {
    case "vide":
      plages = [];
      break;
    case "reel":
      plages = [{ g: -Infinity, gFerme: false, d: Infinity, dFerme: false }];
      break;
    case "point":
      plages = [plagePoint(solution.valeur)];
      break;
    case "reel_sauf_points": {
      const valeurs = [...new Set(solution.valeurs)].sort((a, b) => a - b);
      if (valeurs.length === 0) return null;
      const bornes = [-Infinity, ...valeurs, Infinity];
      plages = bornes.slice(0, -1).map((g, i) => ({ g, gFerme: false, d: bornes[i + 1], dFerme: false }));
      break;
    }
    case "intervalle":
      plages = [plageDepuisMorceau(solution.morceau)];
      break;
    case "union":
      plages = solution.morceaux.map(plageDepuisMorceau);
      break;
    case "mixte":
      plages = [...solution.morceaux.map(plageDepuisMorceau), ...solution.points.map(plagePoint)];
      break;
  }
  if (plages.some((p) => p === null || Number.isNaN(p.g) || Number.isNaN(p.d))) return null;

  const triees = (plages as Plage[]).sort((a, b) => a.g - b.g || Number(b.gFerme) - Number(a.gFerme));
  const fusion: Plage[] = [];
  for (const p of triees) {
    const derniere = fusion[fusion.length - 1];
    const touche =
      derniere !== undefined &&
      (p.g < derniere.d - TOLERANCE || (Math.abs(p.g - derniere.d) <= TOLERANCE && (derniere.dFerme || p.gFerme)));
    if (!derniere || !touche) {
      fusion.push({ ...p });
      continue;
    }
    if (Math.abs(p.g - derniere.g) <= TOLERANCE) derniere.gFerme = derniere.gFerme || p.gFerme;
    if (p.d > derniere.d + TOLERANCE) {
      derniere.d = p.d;
      derniere.dFerme = p.dFerme;
    } else if (Math.abs(p.d - derniere.d) <= TOLERANCE) {
      derniere.dFerme = derniere.dFerme || p.dFerme;
    }
  }
  return fusion;
}

function memeNombre(a: number, b: number): boolean {
  return a === b || Math.abs(a - b) <= TOLERANCE;
}

/** Égalité d'ENSEMBLES (forme canonique), jamais d'écriture : ordre libre, ]−∞;2[ ∪ ]2;+∞[ = ℝ∖{2}, etc. */
export function ensemblesSolutionEgaux(a: SolutionEnsembleProduit, b: SolutionEnsembleProduit): boolean {
  const ca = formeCanoniqueEnsemble(a);
  const cb = formeCanoniqueEnsemble(b);
  if (ca === null || cb === null || ca.length !== cb.length) return false;
  return ca.every(
    (p, i) => memeNombre(p.g, cb[i].g) && memeNombre(p.d, cb[i].d) && p.gFerme === cb[i].gFerme && p.dFerme === cb[i].dFerme,
  );
}

/**
 * Étape "intervalle" : compare l'ENSEMBLE saisi par l'élève à la solution calculée (audit gen5/gen6,
 * racines doubles) — par forme canonique (`ensemblesSolutionEgaux`), donc indépendamment de l'ordre
 * de saisie et de l'écriture choisie (une solution "mixte" ]−∞ ; 1] ∪ {3} saisie dans n'importe quel
 * ordre est acceptée ; un point isolé oublié ou ajouté à tort, un crochet fermé sur une valeur
 * interdite, un trou oublié sont refusés).
 */
export function verifierSolutionSignesProduit(saisie: SolutionEnsembleProduit, attendu: SolutionEnsembleProduit): boolean {
  return ensemblesSolutionEgaux(saisie, attendu);
}
