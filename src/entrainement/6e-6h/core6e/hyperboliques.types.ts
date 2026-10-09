/**
 * Couche core (6e) — contrat pour `6gen19` ("Sinus et cosinus hyperboliques (sh, ch)", chapitre 3
 * "Fonctions logarithmes"). sh(x)=(e^x−e^(−x))/2 et ch(x)=(e^x+e^(−x))/2 sont des fonctions FIXES
 * et NOMMÉES, rappelées dans la consigne générale de CHAQUE écran (jamais un paramètre
 * d'exercice) — seule la COMBINAISON construite à partir d'elles varie, dispatchée par `famille`
 * (union discriminée A-D, structurellement disjointes — architecture calquée sur `6gen16`/`6gen7`).
 *
 * **Famille B — x0 toujours CACHÉ** : jamais un champ de l'exercice, seul `k` (=sh(x0) ou ch(x0),
 * connu de l'énoncé) est stocké — "cible d'abord", même principe que `domaine` précalculé sur
 * `6gen7`/`6gen16`.
 *
 * **2 statuts LOCAUX, jamais une extension d'un enum partagé** — convention déjà établie sur ce
 * chantier (voir `IssueSimplificationG`, `core6e/equationsExpLog.types.ts`) : un statut à issues
 * fixes propre à UN générateur reste un petit type local, jamais une extension de
 * `StatutVerification` ni d'un type importé d'un autre générateur (6gen6/6gen17 ne sont jamais
 * importés ici, seule leur FORME de statut est reprise à l'identique) :
 * - `StatutPariteHyperbolique` (famille A) — parité d'une combinaison sh/ch, comparée par égalité
 *   stricte (ce n'est PAS un champ de texte libre : 3 boutons, jamais de parsing).
 * - `SigneLimiteHyperbolique` (famille D) — signe de la limite à chaque infini. Toujours ±∞ ici,
 *   JAMAIS une valeur finie ou nulle : la génération exclut délibérément a+b=0 et a=b (voir
 *   `ExerciceHyperboliquesD`), donc les deux coefficients (a+b) et (b−a) qui pilotent le signe de
 *   chaque limite sont garantis non nuls.
 */

export type StatutPariteHyperbolique = "paire" | "impaire" | "aucune";
export type SigneLimiteHyperbolique = "plus_infini" | "moins_infini";

// ============================================================================
// Famille A — Parité de combinaisons (1 écran unique). 7 types de combinaison, `k` UNIQUEMENT
// pertinent pour "shKx"/"chKx" (k∈{1,2,3}) — absent du contrat pour les 5 autres types plutôt
// qu'un champ `k` inutilisé (union discriminée sur la présence du paramètre, pas seulement sur
// `type`, même esprit que les sous-types A/B/C de `6gen16`).
//
// Piège central (documenté dans le contrat, jamais seulement dans la spec source) : "shCarre"
// (sh(x)²) est PAIRE — le carré d'une fonction impaire est toujours pair — alors que sh elle-même
// est impaire. "shPlusCh"/"shMoinsCh" ne sont NI paires NI impaires (se simplifient en e^x /
// −e^(−x), aucune symétrie).
// ============================================================================

export type TypeCombinaisonA = "shKx" | "chKx" | "shChProduit" | "shCarre" | "chCarre" | "shPlusCh" | "shMoinsCh";

export interface ExerciceHyperboliquesAAvecK {
  famille: "A";
  type: "shKx" | "chKx";
  k: number;
}

export interface ExerciceHyperboliquesASansK {
  famille: "A";
  type: "shChProduit" | "shCarre" | "chCarre" | "shPlusCh" | "shMoinsCh";
}

export type ExerciceHyperboliquesA = ExerciceHyperboliquesAAvecK | ExerciceHyperboliquesASansK;

// ============================================================================
// Famille B — Utiliser ch²(x0)−sh²(x0)=1 (2 écrans : isoler symboliquement, calculer). x0 caché.
// ============================================================================

/** "donné sh, trouver ch" : k=sh(x0) (peut être négatif ou nul). Réponse UNIQUE, ch(x0)=√(1+k²)
 * (toujours positif, car ch(x)≥1 pour tout x — jamais d'ambiguïté de signe ici). */
export interface ExerciceHyperboliquesBTrouverCh {
  famille: "B";
  sousType: "trouverCh";
  k: number;
}

/** "donné ch, trouver sh" : k=ch(x0)>1 strictement. `signeX0` précise le signe de x0 QUAND il est
 * donné dans l'énoncé (une seule des deux valeurs ±√(k²−1) est alors correcte) ; `null` sinon (les
 * 2 valeurs sont possibles — piège central : oublier que sh peut être positive ou négative). */
export interface ExerciceHyperboliquesBTrouverSh {
  famille: "B";
  sousType: "trouverSh";
  k: number;
  signeX0: 1 | -1 | null;
}

export type ExerciceHyperboliquesB = ExerciceHyperboliquesBTrouverCh | ExerciceHyperboliquesBTrouverSh;

// ============================================================================
// Famille C — f(x) = a·sh(kx) + b·ch(kx) (3 écrans : f', f'', relation f''=k²·f).
// a,b∈{-3,...,-1,1,...,3} (jamais 0 — combinaison dégénérée sinon), k∈{1,2,3}.
// ============================================================================

export interface ExerciceHyperboliquesC {
  famille: "C";
  a: number;
  b: number;
  k: number;
}

// ============================================================================
// Famille D — f(x) = a·sh(x) + b·ch(x) = [(a+b)e^x + (b−a)e^(−x)]/2 (2 écrans : réécriture en
// e^x/e^(−x), conclusion du signe de la limite à chaque infini). a,b∈{-3,...,-1,1,...,3}, en
// EXCLUANT a+b=0 et a=b (cas limites non génériques, spec explicite) — garantit que (a+b) et
// (b−a) sont tous deux non nuls, donc que chaque limite est bien ±∞ (jamais une forme finie).
// ============================================================================

export interface ExerciceHyperboliquesD {
  famille: "D";
  a: number;
  b: number;
}

export type ExerciceHyperboliques = ExerciceHyperboliquesA | ExerciceHyperboliquesB | ExerciceHyperboliquesC | ExerciceHyperboliquesD;

export type FamilleHyperboliques = ExerciceHyperboliques["famille"];

export type GenerateurExerciceHyperboliques = () => ExerciceHyperboliques;
