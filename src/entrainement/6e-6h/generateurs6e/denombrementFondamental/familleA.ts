import type {
  ExerciceDenombA_BorneSuperieure,
  ExerciceDenombA_ContientDeuxChiffres,
  ExerciceDenombA_ContientUnChiffre,
  ExerciceDenombA_Parite,
  ExerciceDenombA_PositionFixee,
  ExerciceDenombA_Total,
  ExerciceDenombrementA,
} from "../../core6e/denombrementFondamental.types";
import { tirerEntier, tirerParmi } from "./aleatoire";

/**
 * Couche A (6e) — génération, famille A ("Principe des cases juxtaposées") de `6gen43`. Nombres à
 * `n`∈{4,5} chiffres, TOUS DIFFÉRENTS, premier chiffre non nul (alphabet fixe : les 10 chiffres
 * 0-9). 6 sous-types, chacun construit via une variante du même principe de comptage
 * position-par-position (jamais de formule fermée type `coefficientBinomial`/`factorielle` — voir
 * mission : cette famille est entièrement affaire du PRINCIPE MULTIPLICATIF avec des contraintes
 * position par position, pas de combinatoire fermée).
 *
 * ============================================================================
 * **Constat clé, réutilisé par PLUSIEURS sous-types ci-dessous** : quel que soit l'ordre dans
 * lequel on choisit les positions d'un nombre à chiffres tous distincts, dès qu'UNE position a
 * consommé exactement 1 chiffre d'un pool de taille `p`, la position SUIVANTE (quelle qu'elle soit)
 * dispose toujours de `p-1` choix — peu importe LEQUEL des `p` chiffres a été consommé. C'est ce qui
 * rend le sous-type "parité/multiple" traitable malgré son branchement (0 vs non-nul au dernier
 * chiffre) : la séquence des positions DU MILIEU (ni la position fixée, ni le premier chiffre) est
 * IDENTIQUE dans les 2 branches, car dans les 2 cas exactement 2 chiffres ont été consommés avant
 * d'y arriver (le dernier chiffre, fixé ; le premier chiffre, dont le NOMBRE de choix diffère selon
 * la branche mais qui consomme toujours exactement 1 chiffre) — démonstration détaillée + preuve
 * croisée par force brute dans `familleA.test.ts`.
 */

const ALPHABET_SIZE = 10;
const VALEURS_N = [4, 5] as const;

function choixDecroissant(depart: number, longueur: number): number[] {
  return Array.from({ length: longueur }, (_, i) => depart - i);
}
function produit(valeurs: number[]): number {
  return valeurs.reduce((acc, v) => acc * v, 1);
}

/** Tire `count` chiffres DISTINCTS parmi 0-9 (en excluant `exclure`), le PREMIER tiré garanti non
 * nul (utile pour "les k premiers chiffres fixés" — le premier de la liste occupe la position 1). */
function tirerChiffresDistincts(count: number, exclure: number[] = []): number[] {
  const disponibles = Array.from({ length: ALPHABET_SIZE }, (_, i) => i).filter((d) => !exclure.includes(d));
  const resultat: number[] = [];
  // Premier chiffre : jamais 0 (position 1 du nombre).
  const premiersCandidats = disponibles.filter((d) => d !== 0);
  const premier = tirerParmi(premiersCandidats);
  resultat.push(premier);
  const reste = disponibles.filter((d) => d !== premier);
  while (resultat.length < count) {
    const suivant = tirerParmi(reste.filter((d) => !resultat.includes(d)));
    resultat.push(suivant);
  }
  return resultat;
}

// ============================================================================
// Total.
// ============================================================================

export function calculerTotal(n: number): { choixPosition1: number; choixPositionsRestantes: number[]; total: number } {
  const choixPosition1 = ALPHABET_SIZE - 1; // 9 : tous sauf 0
  const choixPositionsRestantes = choixDecroissant(ALPHABET_SIZE - 1, n - 1); // 9,8,7,...
  const total = choixPosition1 * produit(choixPositionsRestantes);
  return { choixPosition1, choixPositionsRestantes, total };
}

export function construireTotal(n: number = tirerParmi(VALEURS_N)): ExerciceDenombA_Total {
  const { choixPosition1, choixPositionsRestantes, total } = calculerTotal(n);
  return { famille: "A", sousType: "total", n, choixPosition1, choixPositionsRestantes, total };
}

// ============================================================================
// Position(s) fixée(s).
// ============================================================================

export function construirePositionFixeeDernier(n: number = tirerParmi(VALEURS_N)): ExerciceDenombA_PositionFixee {
  const dernier = tirerEntier(1, 9); // NON NUL délibérément (voir en-tête core6e : distinct du sous-type "parité")
  const choixPosition1 = ALPHABET_SIZE - 1 - 1; // exclut 0 ET le chiffre fixé (non nul, donc distinct de 0)
  const choixPositionsRestantes = choixDecroissant(ALPHABET_SIZE - 2, n - 2); // pool après 2 chiffres consommés
  const total = 1 * choixPosition1 * produit(choixPositionsRestantes);
  return {
    famille: "A",
    sousType: "positionFixee",
    variante: "dernier",
    n,
    chiffresFixes: [{ position: n, valeur: dernier }],
    choixPositionsFixees: [1],
    choixPosition1,
    choixPositionsRestantes,
    total,
  };
}

export function construirePositionFixeePremiers(n: number = tirerParmi(VALEURS_N), k: 1 | 2 = tirerParmi([1, 2] as const)): ExerciceDenombA_PositionFixee {
  const chiffres = tirerChiffresDistincts(k);
  const choixPositionsRestantes = choixDecroissant(ALPHABET_SIZE - k, n - k);
  const total = produit(choixPositionsRestantes); // les k positions fixées valent chacune 1
  return {
    famille: "A",
    sousType: "positionFixee",
    variante: "premiers",
    n,
    chiffresFixes: chiffres.map((valeur, i) => ({ position: i + 1, valeur })),
    choixPositionsFixees: chiffres.map(() => 1),
    choixPosition1: null,
    choixPositionsRestantes,
    total,
  };
}

export function construirePositionFixee(n?: number): ExerciceDenombA_PositionFixee {
  return tirerParmi([construirePositionFixeeDernier, construirePositionFixeePremiers] as const)(n);
}

// ============================================================================
// Contient un chiffre donné (complément).
// ============================================================================

/** Compte "sans le chiffre `d`" — alphabet de taille 9 (0-9 privé de `d`). Si `d===0`, le pool ne
 * contenait déjà pas 0 (position 1 inchangée, 9 choix) ; sinon 0 y est toujours, position 1 doit
 * encore l'exclure (8 choix). Dans LES DEUX CAS, la position 1 consomme exactement 1 chiffre du
 * pool de 9 : les positions suivantes décroissent donc TOUJOURS depuis 8 (voir en-tête de fichier).
 */
export function calculerSansChiffre(n: number, d: number): { choixPosition1: number; choixPositionsRestantes: number[]; sans: number } {
  const choixPosition1 = d === 0 ? ALPHABET_SIZE - 1 : ALPHABET_SIZE - 2;
  const choixPositionsRestantes = choixDecroissant(ALPHABET_SIZE - 2, n - 1);
  const sans = choixPosition1 * produit(choixPositionsRestantes);
  return { choixPosition1, choixPositionsRestantes, sans };
}

export function construireContientUnChiffre(n: number = tirerParmi(VALEURS_N)): ExerciceDenombA_ContientUnChiffre {
  const chiffre = tirerEntier(0, 9);
  const { total } = calculerTotal(n);
  const { choixPosition1: choixPosition1SansD, choixPositionsRestantes: choixPositionsRestantesSansD, sans: sansD } = calculerSansChiffre(n, chiffre);
  return { famille: "A", sousType: "contientUnChiffre", n, chiffre, total, choixPosition1SansD, choixPositionsRestantesSansD, sansD, resultatFinal: total - sansD };
}

// ============================================================================
// Contient deux chiffres donnés (inclusion-exclusion).
// ============================================================================

/** Compte "sans NI `d1` NI `d2`" — alphabet de taille 8. Si 0∈{d1,d2}, le pool de 8 ne contient déjà
 * pas 0 (position 1 inchangée, 8 choix) ; sinon 0 y est toujours (position 1 l'exclut, 7 choix).
 * Position 1 consomme toujours 1 chiffre d'un pool de 8 → positions suivantes décroissent depuis 7
 * dans LES DEUX CAS (même argument que `calculerSansChiffre`). */
export function calculerSansLesDeuxChiffres(n: number, d1: number, d2: number): { choixPosition1: number; choixPositionsRestantes: number[]; sansLesDeux: number } {
  const zeroExclu = d1 === 0 || d2 === 0;
  const choixPosition1 = zeroExclu ? ALPHABET_SIZE - 2 : ALPHABET_SIZE - 3;
  const choixPositionsRestantes = choixDecroissant(ALPHABET_SIZE - 3, n - 1);
  const sansLesDeux = choixPosition1 * produit(choixPositionsRestantes);
  return { choixPosition1, choixPositionsRestantes, sansLesDeux };
}

export function construireContientDeuxChiffres(n: number = tirerParmi(VALEURS_N)): ExerciceDenombA_ContientDeuxChiffres {
  const [chiffre1, chiffre2] = tirerChiffresDistinctsQuelconques(2);
  const { total } = calculerTotal(n);
  const { sans: sansChiffre1 } = calculerSansChiffre(n, chiffre1);
  const { sans: sansChiffre2 } = calculerSansChiffre(n, chiffre2);
  const { choixPosition1: choixPosition1SansLesDeux, choixPositionsRestantes: choixPositionsRestantesSansLesDeux, sansLesDeux } = calculerSansLesDeuxChiffres(n, chiffre1, chiffre2);
  const resultatFinal = total - sansChiffre1 - sansChiffre2 + sansLesDeux;
  return {
    famille: "A",
    sousType: "contientDeuxChiffres",
    n,
    chiffre1,
    chiffre2,
    total,
    sansChiffre1,
    sansChiffre2,
    choixPosition1SansLesDeux,
    choixPositionsRestantesSansLesDeux,
    sansLesDeux,
    resultatFinal,
  };
}

/** 2 chiffres distincts tirés parmi 0-9, SANS contrainte "premier non nul" (contrairement à
 * `tirerChiffresDistincts` — ici on tire juste 2 valeurs quelconques du 0-9, pas des positions d'un
 * nombre). */
function tirerChiffresDistinctsQuelconques(count: number): number[] {
  const disponibles = Array.from({ length: ALPHABET_SIZE }, (_, i) => i);
  const resultat: number[] = [];
  while (resultat.length < count) {
    const c = tirerParmi(disponibles.filter((d) => !resultat.includes(d)));
    resultat.push(c);
  }
  return resultat;
}

// ============================================================================
// Borne supérieure (premier chiffre restreint).
// ============================================================================

const BORNES_POSSIBLES = [4, 5, 6, 7, 8] as const;

export function construireBorneSuperieure(n: number = tirerParmi(VALEURS_N)): ExerciceDenombA_BorneSuperieure {
  const borne = tirerParmi(BORNES_POSSIBLES);
  const choixPosition1 = borne - 1; // chiffres non nuls strictement inférieurs à `borne` : {1,...,borne-1}
  const choixPositionsRestantes = choixDecroissant(ALPHABET_SIZE - 1, n - 1);
  const total = choixPosition1 * produit(choixPositionsRestantes);
  return { famille: "A", sousType: "borneSuperieure", n, borne, choixPosition1, choixPositionsRestantes, total };
}

// ============================================================================
// Parité ou multiple de m — PIÈGE CENTRAL de la famille.
// ============================================================================

// `label` accordé au SINGULIER — inséré tel quel dans "Le dernier chiffre doit être ⬚"
// (`ui6e/formatDenombrementFondamental.ts`, `blocDonneesA_Parite`) : "pairs"/"multiples de 5" y
// donneraient un accord grammatical faux ("être pairs" au lieu de "être pair") — bug trouvé par
// inspection visuelle réelle de l'écran rendu (convention CLAUDE.md, piège 6gen40 déjà rencontré).
const ENSEMBLES_DERNIER_CHIFFRE: { valeurs: number[]; label: string }[] = [
  { valeurs: [0, 2, 4, 6, 8], label: "pair" },
  { valeurs: [0, 5], label: "un multiple de 5" },
];

/** `choixPremierSiDernierZero`/`choixPremierSiDernierNonZero` sont des CONSTANTES (9 et 8) —
 * n'importe quel chiffre non nul spécifique choisi pour le dernier chiffre laisse le même nombre de
 * choix au premier chiffre (8), et 0 en laisse 9. La séquence des positions du milieu est, elle
 * aussi, indépendante du cas (voir en-tête de fichier) — SEUL le nombre de valeurs non nulles
 * disponibles pour le dernier chiffre (`ensembleDernierChiffre.length - 1`) fait varier le résultat
 * final d'un tirage à l'autre. */
export function construireParite(n: number = tirerParmi(VALEURS_N)): ExerciceDenombA_Parite {
  const { valeurs: ensembleDernierChiffre, label: labelEnsemble } = tirerParmi(ENSEMBLES_DERNIER_CHIFFRE);
  const choixPremierSiDernierZero = ALPHABET_SIZE - 1; // 9
  const choixPremierSiDernierNonZero = ALPHABET_SIZE - 2; // 8
  const choixPositionsMilieu = choixDecroissant(ALPHABET_SIZE - 2, n - 2);
  const middleProduit = produit(choixPositionsMilieu);
  const nombreNonNuls = ensembleDernierChiffre.length - 1;
  const resultatFinal = middleProduit * (choixPremierSiDernierZero + nombreNonNuls * choixPremierSiDernierNonZero);
  return { famille: "A", sousType: "parite", n, ensembleDernierChiffre, labelEnsemble, choixPremierSiDernierZero, choixPremierSiDernierNonZero, choixPositionsMilieu, resultatFinal };
}

// ============================================================================
// Dispatch — sous-types équiprobables.
// ============================================================================

const CONSTRUCTEURS_A: (() => ExerciceDenombrementA)[] = [construireTotal, construirePositionFixee, construireContientUnChiffre, construireContientDeuxChiffres, construireBorneSuperieure, construireParite];

export function construireFamilleA(): ExerciceDenombrementA {
  return tirerParmi(CONSTRUCTEURS_A)();
}
