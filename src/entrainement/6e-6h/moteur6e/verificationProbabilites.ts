import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerValeur } from "./equivalenceExponentielle";

/**
 * Couche B (6e) — module PARTAGÉ, chapitre 8 "Probabilités". Fondé par `6gen30` ("Probabilités et
 * ensembles", PREMIER générateur de ce chapitre — zéro infrastructure chapitre 8 avant ce fichier),
 * même rôle que `moteur6e/equivalenceExponentielle.ts` pour le chapitre 2 : la brique de
 * vérification VRAIMENT transversale au chapitre entier, distincte de `moteur6e/
 * verificationProbabilitesEnsembles.ts` (vérification propre à 6gen30 — tableau à double entrée,
 * cartes/dés — jamais réutilisée telle quelle par un autre générateur).
 *
 * ============================================================================
 * **CONTRAT DE RÉUTILISATION — 6gen31/6gen32/6gen33 (lire avant de modifier ce fichier)**
 * ============================================================================
 * `6gen32` réutilise EXPLICITEMENT (spec) "la vérification d'indépendance de 6gen30 famille B" —
 * c'est exactement `diagnostiquerIndependance` ci-dessous. `6gen31`/`6gen32` réutilisent aussi "le
 * statut de réponse (fraction/décimal)" de 6gen30 — c'est `diagnostiquerValeur`, réexportée
 * ci-dessous DEPUIS `equivalenceExponentielle.ts` (chapitre 2) plutôt que réimplémentée : elle est
 * déjà exactement ce qu'il faut pour un champ de probabilité en texte libre (voir juste en dessous),
 * donc AUCUN wrapper spécifique aux probabilités n'a été créé — un futur générateur du chapitre 8
 * doit importer `diagnostiquerValeur` directement depuis CE fichier (`moteur6e/
 * verificationProbabilites.ts`) plutôt que depuis `equivalenceExponentielle.ts` (chapitre 2) —
 * réexportée ici précisément pour que l'import "chapitre 8" reste dans le bon module, sans dupliquer
 * son code.
 *
 * ============================================================================
 * **Pourquoi `diagnostiquerValeur` est directement réutilisable pour une probabilité**
 * ============================================================================
 * Une probabilité est une simple VALEUR NUMÉRIQUE (jamais une fonction d'une variable) — exactement
 * le cas déjà couvert par `diagnostiquerValeur(texte, cible, tolerance)` : `texte` est évalué par
 * `evaluerExpressionExponentielle` (support natif de la division "/", donc une fraction comme
 * "3/8" s'évalue directement, aussi bien qu'un décimal "0,375" ou "0.375" — virgule ET point tous
 * les deux acceptés par le tokeniseur), comparé à `cible` à une TOLÉRANCE ABSOLUE près.
 *
 * **Tolérance retenue : 0,01 (le défaut déjà câblé dans `diagnostiquerValeur`, jamais resserré ni
 * élargi ici)** — annoncée à l'élève par la formule standard du projet, "(forme exacte ou décimale
 * arrondie au centième)" (`docs/conventions-transversales.md`, "Annonce de précision"). Choix
 * délibéré plutôt qu'une tolérance plus fine spécifique aux probabilités : les dénominateurs
 * effectivement rencontrés dans ce chapitre restent modestes (population d'une centaine max pour la
 * famille A, 52 pour un jeu de cartes, 16/36 pour deux dés à 4/6 faces) — l'écart minimal entre deux
 * valeurs de probabilité DISTINCTES generées reste donc toujours ≥ 1/100 = 0,01, jamais en dessous
 * (au pire égal à la tolérance, jamais accidentellement confondu par elle) ; resserrer casserait la
 * cohérence avec `diagnostiquerValeur` déjà utilisée sans wrapper ailleurs sur ce chantier (chapitres
 * 2-4), élargir risquerait de confondre deux fractions ADJACENTES de dénominateur 52 (écart ≈0,019,
 * strictement > 0,01 : encore résolu correctement).
 *
 * ============================================================================
 * **`diagnostiquerIndependance` — LA brique nouvelle et réutilisable de ce chapitre**
 * ============================================================================
 * Deux événements A, B sont indépendants ssi P(A∩B) = P(A)·P(B) (égalité NUMÉRIQUE, jamais une
 * intuition) — voir le piège documenté sur `6gen30` famille B écran 4 : "conclure à l'indépendance
 * par intuition... plutôt que par la vérification numérique explicite". `diagnostiquerIndependance`
 * calcule le membre de droite `pA*pB`, le compare à `pAetB` À LA MÊME TOLÉRANCE que
 * `diagnostiquerValeur` (0,01, cohérence transversale), en déduit le statut RÉEL
 * (`"independants"`/`"non_independants"`), puis le compare au statut RÉCLAMÉ par l'élève.
 *
 * **Convention d'appel — À RÉPLIQUER par tout générateur en aval** : l'appelant passe TOUJOURS les
 * probabilités DÉJÀ CONNUES ET CORRECTES `pA`, `pB`, `pAetB` (des `number` en [0,1], calculées par
 * l'appelant depuis SES propres effectifs/paramètres — ce module ne connaît et ne calcule jamais
 * lui-même d'effectif, de carte, de dé ou de contexte, volontairement générique), jamais un texte
 * brut ni un couple d'effectifs à diviser ici. Le statut réclamé par l'élève arrive lui aussi déjà
 * TYPÉ (`StatutIndependance`, choisi via un bouton `.btn.toggle-active` côté écran, JAMAIS un champ
 * texte libre — il n'y a donc structurellement aucun risque de `"parse_error"` sur ce statut : la
 * fonction retourne toujours `"correct"`/`"not_equivalent"`, le type `StatutVerification` étant
 * conservé uniquement pour rester consommable par les mêmes briques d'affichage génériques
 * (`ui/messageErreur.ts`) que le reste de la plateforme).
 */

const TOLERANCE_PROBABILITE = 0.01;

/** Statut d'indépendance réclamé par l'élève (bouton `.btn.toggle-active`, jamais un champ texte
 * libre — voir en-tête de fichier). Nouveau statut introduit par ce chapitre, destiné à être
 * réutilisé tel quel par `6gen31`/`6gen32`/`6gen33` (spec : "à réutiliser dans les générateurs
 * suivants du chapitre"). */
export type StatutIndependance = "independants" | "non_independants";

/** Vérité terrain — A et B sont indépendants ssi P(A∩B) = P(A)·P(B), à `tolerance` près (défaut
 * `TOLERANCE_PROBABILITE`, voir en-tête). Exportée séparément de `diagnostiquerIndependance` pour un
 * appelant qui aurait seulement besoin du FAIT (ex. pour choisir un libellé d'aide), sans vouloir
 * comparer à une réponse élève. */
export function sontIndependants(pA: number, pB: number, pAetB: number, tolerance: number = TOLERANCE_PROBABILITE): boolean {
  return Math.abs(pAetB - pA * pB) <= tolerance;
}

/** LA brique réutilisable de ce chapitre — voir en-tête de fichier pour le contrat d'appel complet.
 * Compare le statut RÉCLAMÉ par l'élève (`reponseElève`) au statut RÉEL déduit numériquement de
 * `pA`, `pB`, `pAetB`. */
export function diagnostiquerIndependance(pA: number, pB: number, pAetB: number, reponseElève: StatutIndependance, tolerance: number = TOLERANCE_PROBABILITE): StatutVerification {
  const reel: StatutIndependance = sontIndependants(pA, pB, pAetB, tolerance) ? "independants" : "non_independants";
  return reel === reponseElève ? "correct" : "not_equivalent";
}

/** Variante booléenne de `diagnostiquerIndependance` — pour un appelant qui a besoin d'un
 * `verifier: (reponse) => boolean` brut (ex. le callback consommé par `moteur/etapeTentatives.ts`),
 * plutôt que de comparer lui-même `=== "correct"` à chaque site d'appel. */
export function verifierIndependance(pA: number, pB: number, pAetB: number, reponseElève: StatutIndependance, tolerance: number = TOLERANCE_PROBABILITE): boolean {
  return diagnostiquerIndependance(pA, pB, pAetB, reponseElève, tolerance) === "correct";
}

// Réexport direct — voir en-tête ("aucun wrapper spécifique aux probabilités n'a été créé").
export { diagnostiquerValeur };
