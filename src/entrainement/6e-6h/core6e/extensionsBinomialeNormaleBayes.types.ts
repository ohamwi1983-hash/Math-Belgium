import type { ContexteBinomialeA, StrategieBinomialeA, TypeQuestionBinomialeA } from "./binomialeSequenceOrdonnee.types";
import type { ExerciceLoiNormaleD } from "./loiNormale.types";

/**
 * Couche core (6e) — contrat pour `6gen52` ("Extensions binomiale, normale et Bayes (problèmes)"),
 * générateur DE CLÔTURE du chapitre "Variables aléatoires et lois de probabilités" (après `6gen49`
 * "Variables aléatoires discrètes et espérance", `6gen50` "Loi binomiale", `6gen51` "Loi normale").
 * 6 familles (A à F), tirage ÉQUIPROBABLE de la famille — voir `generateurs6e/
 * extensionsBinomialeNormaleBayes/index.ts`.
 *
 * Contrairement aux autres générateurs DE CLÔTURE du chantier (6gen29, 6gen33, 6gen42, 6gen46),
 * celui-ci réutilise SIMULTANÉMENT du contenu Couche A de PLUSIEURS générateurs déjà construits
 * (`6gen48`/`6gen50` famille B, `6gen50` famille C, `6gen51` famille D) EN PLUS d'étendre une
 * philosophie de vérification existante (`6gen32` famille C, Bayes) — voir en-tête de chaque
 * interface ci-dessous pour le détail exact du point de réutilisation, et `docs/historique-6e.md`
 * (section "Création — 6gen52") pour la synthèse des 5 points de réutilisation exigés par la
 * mission.
 *
 * **Convention transversale à ce contrat** (identique à tous les générateurs 6e précédents) :
 * chaque variante porte déjà, PRÉ-CALCULÉES par la Couche A (jamais recalculées côté Couche B —
 * `moteur6e/` n'importe jamais `generateurs6e/`, CLAUDE.md), toutes les valeurs numériques
 * nécessaires à la vérification — sauf les quantités explicitement dérivables à chaque appel
 * (`r3` famille D, `pourcentage3` famille F...), jamais stockées, toujours recalculées depuis les
 * champs bruts (convention "vérification par cohérence interne", CLAUDE.md).
 */

// ============================================================================
// Famille A — Indépendance composée + trouver n via logarithme (3-4 écrans, 2 sous-types).
// ============================================================================

export type SousTypeExtA = "compose" | "direct";

/** Sous-type "composé" (ex. jeu télévisé à 2 épreuves indépendantes) : le succès global est la
 * réussite des DEUX épreuves (`p1`/`p2` présents, `p=p1·p2`, écran supplémentaire par rapport au
 * sous-type "direct"). Sous-type "direct" (ex. tirer une carte précise) : `p` déjà donné
 * directement pour une seule épreuve, `p1`/`p2` absents, écran 1 ("composé") SAUTÉ.
 *
 * `valeurN` — nombre minimal de répétitions CORRECT pour dépasser `seuil` sur "au moins 1 succès",
 * PRÉ-CALCULÉ par la Couche A via `calculerNMinimalC` (`generateurs6e/loiBinomiale/familleC.ts`,
 * `6gen50` famille C) — RÉUTILISATION DIRECTE, jamais recalculé côté Couche B ni réimplémenté ici. */
export interface ExerciceExtA {
  famille: "A";
  sousType: SousTypeExtA;
  /** Phrase(s) narrative(s) EN TEXTE BRUT (jamais de `\text{...}` manuel ici — la Couche ui
   * (`ui6e/formatExtensionsBinomialeNormaleBayes.ts::decouperEnFragmentsTexte`) découpe ce texte en
   * plusieurs fragments KaTeX COURTS au moment de l'affichage, évitant tout débordement horizontal
   * — bug rencontré et corrigé en vérification Playwright, voir `docs/historique-6e.md`). */
  contexteTexte: string;
  p1?: number;
  p2?: number;
  p: number;
  seuil: number;
  valeurN: number;
}

// ============================================================================
// Famille B — Binomial classique étendu (2-3 écrans) — RÉUTILISE INTÉGRALEMENT `construireAvecTypeQuestion`
// de `generateurs6e/binomialeSequenceOrdonnee/familleA.ts` (6gen48/6gen50).
// ============================================================================

/** `contexte` PROPRE à `6gen52` (banque distincte : équipe sportive, personnel hospitalier) —
 * MÊME FORME `ContexteBinomialeA` que `6gen48`/`6gen50`, réutilisée telle quelle (jamais dupliquée).
 * Tous les autres champs proviennent tels quels de `construireAvecTypeQuestion` (RIEN de recalculé
 * ni réimplémenté ici) — voir en-tête `generateurs6e/extensionsBinomialeNormaleBayes/familleB.ts`. */
export interface ExerciceExtB {
  famille: "B";
  contexte: ContexteBinomialeA;
  n: number;
  p: number;
  k: number;
  typeQuestion: TypeQuestionBinomialeA;
  strategie: StrategieBinomialeA;
  termesACalculer: number[];
  valeursTermes: number[];
  resultatFinal: number;
}

// ============================================================================
// Famille C — Loi normale inverse en contexte (3 écrans) — RÉUTILISE INTÉGRALEMENT la famille D de
// `6gen51` (`ExerciceLoiNormaleD`, `valeurCibleTableD`/`valeurZD`/`destandardiserD`).
// ============================================================================

/** `base` — l'exercice `6gen51` famille D COMPLET, généré tel quel (`construireFamilleD`, jamais
 * réimplémenté) — seul un habillage narratif "contexte de classement" (`contexteTexte`) est ajouté
 * par-dessus, propre à `6gen52`. */
export interface ExerciceExtC {
  famille: "C";
  base: ExerciceLoiNormaleD;
  contexteTexte: string;
}

// ============================================================================
// Famille D — Théorème de Bayes à 3 catégories (4 écrans) — EXTENSION de la philosophie `6gen32`
// famille C (2 catégories → 3 catégories), jamais un import direct (le nombre de catégories diffère
// structurellement, voir `docs/historique-6e.md`).
// ============================================================================

export interface ContexteExtD {
  id: string;
  texte: string;
  labelCategorie1: string;
  labelCategorie2: string;
  labelCategorie3: string;
  labelCritere: string;
}

/** `q1`+`q2`+`q3`=1 (probabilités d'appartenance aux 3 catégories) ; `r1`=P(critère|catégorie1),
 * `r2`=P(critère|catégorie2) CONNUES ; `pTotal`=P(critère), toutes catégories confondues, DONNÉE —
 * permet de déduire par différence `P(critère∩catégorie3)=pTotal-q1·r1-q2·r2` (écran 3) puis
 * `r3=P(critère|catégorie3)` (écran 4). `r3` n'est JAMAIS stocké (dérivable, convention CLAUDE.md
 * "vérification par cohérence interne") — voir `moteur6e/verificationExtensionsBinomialeNormaleBayes.ts`. */
export interface ExerciceExtD {
  famille: "D";
  contexte: ContexteExtD;
  q1: number;
  q2: number;
  q3: number;
  r1: number;
  r2: number;
  pTotal: number;
}

// ============================================================================
// Famille E — Loi uniforme continue (2 écrans) — NOUVEAUTÉ (aucun générateur précédent du chantier
// ne couvrait la loi uniforme continue).
// ============================================================================

export interface ContexteExtE {
  id: string;
  texte: string;
  variable: string;
  unite: string;
}

/** X~Uniforme([a,b]). `a≤c<d≤b` — calculer P(c≤X≤d)=(d-c)/(b-a). */
export interface ExerciceExtE {
  famille: "E";
  contexte: ContexteExtE;
  a: number;
  b: number;
  c: number;
  d: number;
}

// ============================================================================
// Famille F — Reconstruire une loi depuis des % croisés + espérance appliquée (4 écrans) —
// RÉUTILISE la RAISONNEMENT de `6gen32` famille B (déduire une case manquante par différence,
// écran 1) et de `6gen49` famille B (construire une loi + calculer E(X), écrans 2-3).
// ============================================================================

/** 3 options tarifaires, `valeurs[i]` = montant/valeur associée à l'option i (DÉJÀ connu, affiché
 * en données). `pourcentage1`/`pourcentage2` (% de la population ayant choisi les options 1/2)
 * DONNÉS ; `pourcentage3=100-pourcentage1-pourcentage2` déduit PAR DIFFÉRENCE (écran 1, jamais
 * stocké — voir `moteur6e/verificationExtensionsBinomialeNormaleBayes.ts`). */
export interface ExerciceExtF {
  famille: "F";
  contexte: { texte: string };
  labels: [string, string, string];
  valeurs: [number, number, number];
  pourcentage1: number;
  pourcentage2: number;
  population: number;
}

// ============================================================================
// Union globale.
// ============================================================================

export type ExerciceExtensionsBinomialeNormaleBayes = ExerciceExtA | ExerciceExtB | ExerciceExtC | ExerciceExtD | ExerciceExtE | ExerciceExtF;

export type FamilleExtensionsBinomialeNormaleBayes = ExerciceExtensionsBinomialeNormaleBayes["famille"];
