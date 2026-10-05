import type { EnsembleReelGuide } from "./ensembleReel.types";
import type { CibleLimite } from "./limitesExponentielles.types";

/**
 * Couche core (6e) — contrat pour `6gen11` ("Étudier une fonction exponentielle — synthèse",
 * chapitre 2, DERNIER générateur de ce chapitre). 4 familles A-D STRUCTURELLEMENT DISJOINTES (union
 * discriminée par `famille`), TOUJOURS 6 écrans FIXES par famille, jamais de saut conditionnel —
 * contrairement à la plupart des générateurs récents du chantier, aucune variance de séquence à
 * modéliser ici (spec explicite : "chaque instance suit les 6 mêmes tâches, dans l'ordre").
 *
 * **Réutilisation directe** — `EnsembleReelGuide` (domaine, `./ensembleReel.types`, déjà partagé
 * par 6gen1/6gen3/6gen7) et `CibleLimite` (limites, `./limitesExponentielles.types`, déjà partagé
 * par 6gen6) sont importés TELS QUELS (core→core, même chantier — même principe déjà établi pour
 * `EnsembleReelGuide`) plutôt que redéfinis : les deux notions existent déjà, aucune raison d'en
 * créer une 3e version.
 *
 * **Nouveauté — `CibleAsymptote`** (asymptotes) : généralise le même principe que `CibleLimite`
 * (un statut catégoriel + une valeur numérique conditionnelle) à une équation de droite plutôt
 * qu'une simple constante — 4 formes possibles (horizontale `y=valeur`, verticale `x=p`, oblique
 * `y=ax+b`, ou aucune asymptote de ce côté). Écran 3 vérifié via une équation TEXTE LIBRE
 * (`y=...`/`x=...`), par équivalence NUMÉRIQUE (aucune bibliothèque d'algèbre symbolique installée
 * sur ce projet — voir `moteur6e/equivalenceExponentielle.ts`, déjà la convention établie par
 * 6gen6-6gen10) plutôt que les mécanismes ∅/ℝ/intervalle de `EnsembleReelGuide` (qui ne
 * représentent jamais une DROITE) — décision de conception explicite.
 *
 * **Nouveauté — `CibleCroissance`/`CibleConcavite`** : la concavité (dérivée seconde, signe, point
 * d'inflexion) n'a jamais été testée dans aucun générateur antérieur du chapitre — première
 * apparition sur la plateforme. Modélisée par le même principe catégoriel+position optionnelle que
 * la croissance (extremum ou monotonie constante) — voir `ui6e/formatEtudeFonctionExponentielle.ts`
 * pour le texte de rappel explicite de la méthode (signe de f'' : positif ⟹ convexe, négatif ⟹
 * concave, changement de signe ⟹ inflexion), affiché dès l'aide niveau 1 de CHAQUE instance
 * (jamais seulement "la première fois" — aucune aide de la plateforme ne dépend de l'historique des
 * exercices précédents, même principe déjà établi ailleurs, voir `formatLimitesExponentielles.ts`).
 *
 * **QCM graphique final** (écran 6) — même mécanique que 6gen5/6gen8 : `candidats`/`indexCorrect`
 * déjà MÉLANGÉS à la génération, chaque candidat une STRUCTURE DE DONNÉES PURE (jamais une closure)
 * — `ui6e/formatEtudeFonctionExponentielle.ts::evaluerCandidat` réimplémente la vraie f(x) ET les 3
 * distracteurs comme de VRAIES fonctions renvoyables, jamais une astuce de rendu déconnectée des
 * données. Chaque distracteur représente une VRAIE erreur nommée par la spec — voir l'en-tête de
 * chaque module `generateurs6e/etudeFonctionExponentielle/familles/*.ts` pour la construction
 * exacte et sa justification.
 */

export type FamilleEtudeFonctionExponentielle = "A" | "B" | "C" | "D";

// ============================================================================
// Asymptotes — généralisation de `CibleLimite` à une équation de droite.
// ============================================================================

export type CibleAsymptote =
  | { type: "horizontale"; valeur: number }
  | { type: "verticale"; p: number }
  | { type: "oblique"; a: number; b: number }
  | { type: "aucune" };

// ============================================================================
// Croissance / concavité — catégorie + position optionnelle de l'extremum/du point d'inflexion.
// ============================================================================

export type TypeCroissance = "croissante_partout" | "decroissante_partout" | "minimum" | "maximum";

export interface CibleCroissance {
  type: TypeCroissance;
  /** Position de l'extremum — non-null SSI `type` ∈ {"minimum","maximum"}. */
  position: number | null;
}

export type TypeConcavite = "convexe_partout" | "concave_partout" | "inflexion";

export interface CibleConcavite {
  type: TypeConcavite;
  /** Position du point d'inflexion — non-null SSI `type === "inflexion"`. */
  position: number | null;
}

// ============================================================================
// Famille A — f(x) = e^(mx+n), m≠0. Cas le plus simple : domaine ℝ, TOUJOURS monotone (f' ne
// s'annule jamais), TOUJOURS convexe (f''=m²·e^(mx+n)>0 toujours) — jamais de point d'inflexion.
// Une seule asymptote horizontale y=0, du côté où mx+n→−∞ ; aucune asymptote de l'autre côté.
// ============================================================================

export interface CandidatEtudeA {
  /** "reel" — la vraie fonction. "sensInverse" — signe de m inversé (e^(-mx+n), spec distracteur 1,
   * "sens de variation inversé"). "mauvaisNiveau" — asymptote décalée verticalement d'une constante
   * non nulle (e^(mx+n)+décalage, spec distracteur 2, "asymptote au mauvais niveau/mauvais côté").
   * "inflexionInventee" — une VRAIE courbe logistique (en S), qui a un authentique point
   * d'inflexion contrairement à la réelle (spec distracteur 3, "courbe avec un point d'inflexion
   * inventé — cette famille n'en a jamais"). */
  type: "reel" | "sensInverse" | "mauvaisNiveau" | "inflexionInventee";
  m: number;
  n: number;
  /** décalage vertical additif — non nul UNIQUEMENT pour "mauvaisNiveau". */
  decalage: number;
}

export interface ExerciceEtudeA {
  famille: "A";
  m: number;
  n: number;
  domaine: EnsembleReelGuide;
  limitePlusInfini: CibleLimite;
  limiteMoinsInfini: CibleLimite;
  asymptotePlusInfini: CibleAsymptote;
  asymptoteMoinsInfini: CibleAsymptote;
  croissance: CibleCroissance;
  concavite: CibleConcavite;
  candidats: CandidatEtudeA[];
  indexCorrect: number;
}

// ============================================================================
// Famille B — f(x) = e^(k/(x−p)), k≠0. La famille la plus riche : domaine ℝ\{p}, asymptote
// verticale ASYMÉTRIQUE en x=p (un seul côté explose vers +∞, l'autre tend vers la valeur FINIE 0)
// ; asymptote horizontale y=1 des deux côtés (±∞) ; monotone sur chaque branche séparément, MÊME
// sens (signe de f' constant, déterminé par le signe de −k) ; TOUJOURS un point d'inflexion, en
// x=p−k/2.
// ============================================================================

export interface CandidatEtudeB {
  /** "reel" — la vraie fonction. "symetrique" — asymptote verticale RENDUE symétrique des deux
   * côtés (e^(|k|/|x-p|), explose vers +∞ des DEUX côtés — spec distracteur 1, piège central de
   * cette famille). "sansInflexion" — l'erreur classique "approximation e^u≈1+u au lieu de
   * calculer e^u" (1+k/(x-p) — une VRAIE fonction, mêmes asymptotes verticale ET horizontale que la
   * réelle, mais dont la concavité reste CONSTANTE sur chaque branche, aucun point d'inflexion —
   * spec distracteur 2). "mauvaisNiveau" — asymptote horizontale décalée d'une constante non nulle
   * (e^(k/(x-p))+décalage, garde la même asymétrie verticale et le même point d'inflexion — spec
   * distracteur 3, "mauvaise asymptote horizontale"). */
  type: "reel" | "symetrique" | "sansInflexion" | "mauvaisNiveau";
  k: number;
  p: number;
  /** décalage additif au niveau horizontal — non nul UNIQUEMENT pour "mauvaisNiveau". */
  decalage: number;
}

export interface ExerciceEtudeB {
  famille: "B";
  k: number;
  p: number;
  domaine: EnsembleReelGuide;
  limitePointPlus: CibleLimite;
  limitePointMoins: CibleLimite;
  /** Toujours `{type:"valeur",valeur:1}` — mêmes deux infinis. */
  limitePlusInfini: CibleLimite;
  limiteMoinsInfini: CibleLimite;
  /** Côté qui explose vers +∞ (l'autre tend vers 0, valeur finie — voir la note de conception du
   * fichier pour la preuve). */
  coteAsymptoteVerticale: "plus" | "moins";
  /** `{type:"verticale", p}` — l'équation de l'asymptote verticale, sur le côté qui explose. */
  asymptoteVerticale: CibleAsymptote;
  /** `{type:"horizontale", valeur:1}` — commune aux deux infinis. */
  asymptoteHorizontale: CibleAsymptote;
  /** Toujours "croissante_partout" ou "decroissante_partout" (jamais d'extremum, position
   * toujours `null`) — "partout" signifie ici "sur chaque intervalle de son domaine séparément",
   * jamais une comparaison à travers le point exclu p. */
  croissance: CibleCroissance;
  /** Toujours "inflexion", en x=p−k/2. */
  concavite: CibleConcavite;
  candidats: CandidatEtudeB[];
  indexCorrect: number;
}

// ============================================================================
// Famille C — f(x) = base^(mx+n) − c·x, base∈{2,3,5}, m>0, c>0 (dérivé, voir en-tête du
// générateur pour la preuve). Nouveauté : ASYMPTOTE OBLIQUE, jamais testée avant ce générateur.
// Domaine ℝ ; les deux limites (±∞) valent +∞ ; asymptote oblique y=−c·x en −∞ (le terme
// exponentiel s'annule) ; aucune asymptote en +∞ (l'exponentielle domine) ; exactement UN minimum,
// en x=(p−n)/m ; TOUJOURS convexe, jamais d'inflexion (f''=m²·ln(base)²·base^(mx+n)·... reste
// toujours celle du terme exponentiel seul, toujours positive — le terme linéaire −c·x a une
// dérivée seconde nulle, n'affecte jamais le signe de f'').
// ============================================================================

export interface CandidatEtudeC {
  /** "reel" — la vraie fonction. "sansAsymptote" — le terme linéaire −c·x est remplacé par un
   * terme QUADRATIQUE −c·x², qui diverge plus vite que le terme exponentiel côté −∞ : la courbe
   * s'ÉLOIGNE de toute droite au lieu de s'en rapprocher (spec distracteur 1, piège central).
   * "minimumMalPlace" — même formule mais l'exposant est décalé d'une constante non nulle
   * (base^(mx+n+décalage)−c·x), déplace l'extremum sans changer sa NATURE (toujours un minimum
   * unique — preuve dans l'en-tête du générateur) — spec distracteur 2. "inflexionInventee" — une
   * courbe logistique (authentique point d'inflexion) moins le terme linéaire, distincte de la
   * réelle (toujours convexe) — spec distracteur 3. */
  type: "reel" | "sansAsymptote" | "minimumMalPlace" | "inflexionInventee";
  base: number;
  m: number;
  n: number;
  c: number;
  /** décalage de l'exposant — non nul UNIQUEMENT pour "minimumMalPlace". */
  decalageMin: number;
}

export interface ExerciceEtudeC {
  famille: "C";
  base: number;
  m: number;
  n: number;
  /** Exposant cible de l'extremum (mx+n=p) — voir en-tête du générateur pour la construction
   * "cible d'abord". */
  p: number;
  /** = m·ln(base)·base^p — dérivé pour garantir f'(x)=0 exactement en x=(p−n)/m. Exact
   * (irrationnel en général, jamais approximé en décimal pour l'affichage — voir
   * `ui6e/formatEtudeFonctionExponentielle.ts::formatCoefficientCLatex`, qui l'affiche sous forme
   * symbolique `K·ln(base)`, K rationnel EXACT). */
  c: number;
  domaine: EnsembleReelGuide;
  /** Toujours `{type:"plus_infini"}` — les DEUX limites valent +∞ (piège explicite de la spec :
   * ne pas conclure "pas d'asymptote" par réflexe). */
  limitePlusInfini: CibleLimite;
  limiteMoinsInfini: CibleLimite;
  /** Toujours `{type:"aucune"}` — l'exponentielle domine, aucune asymptote en +∞. */
  asymptotePlusInfini: CibleAsymptote;
  /** Toujours `{type:"oblique", a:-c, b:0}` — y=−c·x. */
  asymptoteMoinsInfini: CibleAsymptote;
  /** Toujours "minimum", position=(p−n)/m. */
  croissance: CibleCroissance;
  /** Toujours "convexe_partout". */
  concavite: CibleConcavite;
  candidats: CandidatEtudeC[];
  indexCorrect: number;
}

// ============================================================================
// Famille D — f(x) = a·x·e^x, a∈{-3,-2,-1,1,2,3}. RÉUTILISE DIRECTEMENT les formules déjà établies
// et vérifiées par 6gen8 famille A (`generateurs6e/graphiquesDeriveeExponentielles/familles/A.ts`) :
// f'(x)=a·e^x(1+x), f''(x)=a·e^x(2+x) — jamais re-dérivées depuis zéro, seulement étendues avec
// limites/asymptotes/concavité. Domaine ℝ ; limite 0 en −∞ (asymptote horizontale y=0), limite ±∞
// en +∞ (signe de a) ; extremum TOUJOURS en x=−1 (min si a>0, max si a<0) ; point d'inflexion
// TOUJOURS en x=−2, quel que soit a.
// ============================================================================

export interface CandidatEtudeD {
  /** "reel" — la vraie fonction. "extremumInverse" — signe de a inversé (−a·x·e^x), échange
   * min/max ET la branche +∞ — spec distracteur 1 ("extremum et inflexion inversés", lecture
   * retenue : "max au lieu de min"). "asymptoteMalPlacee" — exposant inversé (a·x·e^(−x)), déplace
   * l'asymptote horizontale de −∞ vers +∞ (spec distracteur 2, "asymptote absente ou mal placée").
   * "branchesEchangees" — négation du précédent (−a·x·e^(−x)), les deux branches +∞/−∞ sont
   * échangées par rapport à la réelle — spec distracteur 3 ("signe de a mal reflété, mauvaise
   * branche +∞/−∞"), lecture retenue distincte de "extremumInverse". La spec offre 2 lectures pour
   * son distracteur 1 ("max au lieu de min", OU "inflexion avant l'extremum au lieu d'après") ;
   * seule la première est retenue ici ("extremumInverse", −a·x·e^x) — la seconde impliquerait un
   * distracteur structurellement différent des 3 autres (tous de simples inversions de signe sur
   * a et/ou l'exposant), puisque l'ordre extremum(x=−1)/inflexion(x=−2) est un invariant
   * STRUCTUREL de cette famille (l'inflexion précède toujours l'extremum, quel que soit a) —
   * l'inverser demanderait un repositionnement arbitraire, pas une vraie fonction de la famille. */
  type: "reel" | "extremumInverse" | "asymptoteMalPlacee" | "branchesEchangees";
  a: number;
}

export interface ExerciceEtudeD {
  famille: "D";
  a: number;
  domaine: EnsembleReelGuide;
  /** Signe de a — `plus_infini` si a>0, `moins_infini` si a<0. */
  limitePlusInfini: CibleLimite;
  /** Toujours `{type:"zero"}`. */
  limiteMoinsInfini: CibleLimite;
  /** Toujours `{type:"aucune"}` — l'exponentielle diverge en +∞. */
  asymptotePlusInfini: CibleAsymptote;
  /** Toujours `{type:"horizontale", valeur:0}`. */
  asymptoteMoinsInfini: CibleAsymptote;
  /** "minimum" si a>0, "maximum" si a<0, position toujours −1. */
  croissance: CibleCroissance;
  /** Toujours "inflexion", position toujours −2. */
  concavite: CibleConcavite;
  candidats: CandidatEtudeD[];
  indexCorrect: number;
}

export type ExerciceEtudeFonctionExponentielle = ExerciceEtudeA | ExerciceEtudeB | ExerciceEtudeC | ExerciceEtudeD;

export type CandidatEtudeFonctionExponentielle = CandidatEtudeA | CandidatEtudeB | CandidatEtudeC | CandidatEtudeD;

export type GenerateurExerciceEtudeFonctionExponentielle = () => ExerciceEtudeFonctionExponentielle;
