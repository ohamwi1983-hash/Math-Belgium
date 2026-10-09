/**
 * Couche core (6e) — contrat pour `6gen53` ("Loi de Poisson"), chapitre "Variables aléatoires et
 * lois de probabilités". PREMIÈRE apparition de la loi de Poisson sur la plateforme — P(X=k) =
 * e^(−λ)·λᵏ/k! — aucune infrastructure préexistante pour la FORMULE elle-même (voir
 * `generateurs6e/loiPoisson/poisson.ts`), mais les STRATÉGIES de calcul (terme unique/somme/
 * complément) sont réutilisées de `6gen48`/`6gen50`, adaptées à cette formule.
 *
 * 2 familles, tirage ÉQUIPROBABLE — voir `generateurs6e/loiPoisson/index.ts`.
 *
 * **Famille A — Approximation binomiale → Poisson (3 écrans FIXES)** : B(n,p) DONNÉ (n≥30, p≤0,1,
 * n·p≤15 GARANTIS par construction Couche A — contrairement à `6gen50` famille A, `n`/`p` ne sont
 * PAS à identifier, ils sont directement dans le bloc de données). Écran 1 = checklist à 3
 * conditions (mirroir la checklist à 4 conditions de `6gen50` famille A — voir
 * `components6e/EtapeChampsLoiPoisson.tsx`) ; écran 2 = calculer λ=n·p ; écran 3 = calculer P(X=k)
 * via la formule de Poisson, `k` et la probabilité CORRECTE PRÉ-CALCULÉS.
 *
 * **Famille B — Application directe (2 OU 3 écrans SELON LA STRATÉGIE)** — décision de conception
 * documentée dans `docs/historique-6e.md` (section "Création — 6gen53") : λ n'est JAMAIS donné
 * directement, il doit être ADAPTÉ À L'ÉCHELLE de la question (piège central, voir en-tête
 * `generateurs6e/loiPoisson/familleB.ts`). Écran 1 = déterminer λ (TOUJOURS, quelle que soit la
 * stratégie). Puis :
 *   - `strategie==="termeUnique"` ("exactement k") : identification ET calcul FUSIONNÉS en un seul
 *     écran final (2 écrans au total avec λ) — il n'y a rien à décomposer pour un terme unique, le
 *     mirroir exact serait redondant (contrairement à `6gen48`/`6gen50`, qui séparent quand même
 *     "identifier" et "calculer" même pour `termeUnique` — ICI la fusion est un choix délibéré,
 *     documenté, PAS un oubli).
 *   - `strategie==="somme"` ("entre a et b" ou "au plus k") ou `"complement"` ("au moins k") :
 *     écran d'identification (stratégie + terme(s) à calculer) SÉPARÉ de l'écran de calcul final (3
 *     écrans au total avec λ).
 * Voir `moteur6e/typesLoiPoisson.ts` pour le détail des noms de phase.
 */

// ============================================================================
// Famille A — Approximation binomiale → Poisson.
// ============================================================================

export interface ContextePoissonA {
  id: string;
  /** Texte narratif GÉNÉRIQUE (ne mentionne jamais `n`/`p`, mirroir `ContexteBinomialeA` de
   * `6gen48`/`6gen50`) : `n`/`p` restent des DONNÉES affichées séparément (`n=`, `p=`), jamais à
   * identifier depuis la phrase — contrairement à `ContexteLoiBinomialeA` de `6gen50`, où l'élève
   * doit encore les en extraire. */
  texte: string;
}

export interface ExerciceLoiPoissonA {
  famille: "A";
  contexte: ContextePoissonA;
  n: number;
  p: number;
  /** λ=n·p, PRÉ-CALCULÉ par la Couche A — jamais recalculé côté Couche B (`moteur6e/` n'importe
   * jamais `generateurs6e/`, CLAUDE.md). */
  lambda: number;
  /** Nombre d'occurrences demandé à l'écran 3. */
  k: number;
  /** P(X=k) CORRECTE, PRÉ-CALCULÉE. */
  probabilite: number;
}

// ============================================================================
// Famille B — Application directe.
// ============================================================================

export type TypeQuestionPoissonB = "exactement" | "entreAetB" | "auPlus" | "auMoins";
export type StrategiePoissonB = "termeUnique" | "somme" | "complement";

export interface ContextePoissonB {
  id: string;
  /** `"temporel"` — taux par unité de temps (minute/semaine/mois) à ajuster à une DURÉE demandée
   * différente (facteur multiplicatif direct) ; `"effectif"` — taux "pour N unités" (ex. "pour
   * 1000") à ajuster à un EFFECTIF demandé différent (facteur = effectifDemandé/effectifRéférence).
   */
  type: "temporel" | "effectif";
  /** N de référence du taux de base pour `"effectif"` (ex. 1000, 100, 10000) — sans objet pour
   * `"temporel"` (référence implicite = 1 unité de temps). */
  effectifReference: number | null;
  /** Phrase narrative embarquant le taux de base (ex. "5 par minute", "3 pour 1000"). */
  texteTauxBase: (tauxBase: number) => string;
  /** Phrase narrative posant la cible à atteindre (durée ou effectif demandé). */
  texteCible: (valeurCible: number) => string;
}

export interface ExerciceLoiPoissonB {
  famille: "B";
  contexte: ContextePoissonB;
  tauxBase: number;
  valeurCible: number;
  /** Facteur d'échelle CORRECT — `valeurCible` pour `"temporel"`, `valeurCible/effectifReference`
   * pour `"effectif"`. Piège central : oublier ce facteur et recopier `tauxBase` tel quel comme λ. */
  facteurEchelle: number;
  /** λ CORRECT = tauxBase*facteurEchelle, PRÉ-CALCULÉ. */
  lambda: number;
  typeQuestion: TypeQuestionPoissonB;
  strategie: StrategiePoissonB;
  /** Borne basse (ou valeur unique pour "exactement"/"auPlus"/"auMoins"). */
  k: number;
  /** Borne haute — UNIQUEMENT pour `typeQuestion==="entreAetB"`, `null` sinon. */
  kSecondaire: number | null;
  /** Nombres d'occurrences i dont P(X=i) doit être calculée, ORDRE croissant — longueur 1 si
   * `strategie==="termeUnique"`, longueur ≥1 si `"complement"` (le morceau à retrancher de 1,
   * potentiellement plusieurs termes pour "au moins k" avec k>1), longueur ≥2 si `"somme"`. */
  termesACalculer: number[];
  /** Valeurs CORRECTES de chaque terme, même ordre/longueur que `termesACalculer`. */
  valeursTermes: number[];
  /** Probabilité CORRECTE demandée par l'énoncé — `valeursTermes[0]` si `termeUnique`, somme de
   * `valeursTermes` si `somme`, `1 − somme(valeursTermes)` si `complement`. */
  resultatFinal: number;
}

// ============================================================================
// Union globale.
// ============================================================================

export type ExerciceLoiPoisson = ExerciceLoiPoissonA | ExerciceLoiPoissonB;
export type FamilleLoiPoisson = ExerciceLoiPoisson["famille"];
