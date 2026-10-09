/**
 * Couche core (6e) — contrat pour `6gen57` ("Problèmes de lieux : méthode des génératrices"),
 * générateur D'OUVERTURE du chapitre "Lieux géométriques" (aucun autre générateur du chapitre ne
 * partage de code avec celui-ci — chaque 6genX de ce chapitre reste indépendant, voir CLAUDE.md).
 *
 * **Décision de conception structurante (voir `docs/historique-6e.md`, section 6gen57)** : les 5
 * familles A à E partagent EXACTEMENT la même succession de 5 écrans (poser les génératrices →
 * éliminer α → factoriser → statut de chaque morceau → décrire le lieu propre) — seule l'ALGÈBRE
 * concrète change d'une famille à l'autre, jamais la structure. Plutôt que de dupliquer un contrat
 * par famille (`ExerciceGeneratricesA` / `...B` / ...) comme le reste du chantier le fait
 * habituellement quand la structure d'écran varie réellement d'une famille à l'autre, ce générateur
 * utilise UN SEUL contrat `ExerciceMethodeGeneratrices` : `donnees` porte les valeurs numériques
 * propres à la famille tirée (pour l'affichage du bloc données et des textes de consigne), tandis
 * que TOUT le reste — les 2 équations de génératrices, l'équation éliminée brute, sa forme
 * factorisée, le statut de chaque morceau, l'équation du lieu propre et les options de
 * restriction — est déjà entièrement pré-calculé par la Couche A sous une forme UNIFORME
 * (chaînes de texte LaTeX/algébriques déjà résolues, jamais de logique spécifique à une famille
 * dans `moteur6e/verificationMethodeGeneratrices.ts` ni dans `moteur6e/sessionMethodeGeneratrices.ts`
 * au-delà du texte affiché). Ce report intégral du savoir "quelle famille implique quelle algèbre"
 * dans `generateurs6e/methodeGeneratrices/familleX.ts` est ce qui permet à la Couche B de rester
 * un simple comparateur générique, y compris pour le nombre VARIABLE de morceaux à l'écran 4 (2
 * pour A/B/C, 1 seul pour D/E) et pour la restriction propre à l'écran 5.
 */

/** Statut d'un morceau de l'équation factorisée (écran 4) — patron réutilisable pour tout futur
 * générateur de lieux géométriques par élimination de paramètre (voir doc historique) :
 * - "singulier" : valeur de α pour laquelle les 2 génératrices COÏNCIDENT (apparaît d'un coup).
 * - "parasite" : solution algébrique ne correspondant à AUCUNE valeur admissible de α.
 * - "propre" : fait réellement partie du lieu cherché. */
export type StatutMorceauLieu = "singulier" | "parasite" | "propre";

export interface MorceauLieu {
  /** Étiquette texte (unicode simple, jamais rendue en KaTeX) de l'équation de ce morceau, valeurs
   * numériques déjà substituées — ex. "y = 0", "2x − 6 = 0". */
  label: string;
  statut: StatutMorceauLieu;
}

export interface OptionRestrictionLieu {
  id: string;
  label: string;
}

// ============================================================================
// Bloc "données" — propre à chaque famille, consommé UNIQUEMENT par `ui6e/formatMethodeGeneratrices`
// (jamais par `moteur6e/verificationMethodeGeneratrices`, qui n'en a pas besoin).
// ============================================================================

export interface DonneesGeneratricesA {
  famille: "A";
  b: number;
  d: number;
}

export interface DonneesGeneratricesB {
  famille: "B";
  a: number;
  c: number;
}

export interface DonneesGeneratricesC {
  famille: "C";
  k: number;
}

export interface DonneesGeneratricesD1 {
  famille: "D";
  sousCas: 1;
  c: number;
  h: number;
}

export interface DonneesGeneratricesD2 {
  famille: "D";
  sousCas: 2;
  b: number;
  c: number;
}

export type DonneesGeneratricesD = DonneesGeneratricesD1 | DonneesGeneratricesD2;

export interface DonneesGeneratricesE {
  famille: "E";
  p: number;
  r: number;
}

export type DonneesGeneratrices = DonneesGeneratricesA | DonneesGeneratricesB | DonneesGeneratricesC | DonneesGeneratricesD | DonneesGeneratricesE;

export type FamilleMethodeGeneratrices = DonneesGeneratrices["famille"];

// ============================================================================
// Contrat UNIQUE, partagé par les 5 familles.
// ============================================================================

export interface ExerciceMethodeGeneratrices {
  donnees: DonneesGeneratrices;

  /** Écran 1 — équations des 2 génératrices, en x, y ET alpha (forme "membre = membre",
   * ex. "alpha*x-b*y=0"), valeurs numériques déjà substituées. */
  generatrice1: string;
  generatrice2: string;

  /** Écran 2 — résultat BRUT de l'élimination de α (facteur constant non encore divisé), en x,y
   * uniquement, forme "expression=0". */
  elimineBrut: string;

  /** Écran 3 — même équation, complètement factorisée/simplifiée (forme "Résultat attendu (vérifié)"
   * du cahier des charges), en x,y uniquement. */
  elimineFactorise: string;

  /** Écran 4 — un statut par morceau de `elimineFactorise` (longueur 2 pour A/B/C, 1 pour D/E — ce
   * générateur n'a jamais plus de 2 morceaux). */
  morceaux: MorceauLieu[];

  /** Écran 5 — équation du lieu propre isolée (peut différer littéralement de son morceau dans
   * `elimineFactorise`, ex. "x=b/2" plutôt que "2x-b=0", tout en restant la MÊME équation). */
  equationLieuPropre: string;

  /** Écran 5 — options de restriction (mélangées), UNE seule correcte. */
  optionsRestriction: OptionRestrictionLieu[];
  idRestrictionCorrecte: string;
}
