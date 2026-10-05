/**
 * Couche core (6e) — contrat pour `6gen8` ("Graphique de la fonction dérivée", fonctions
 * exponentielles, chapitre 2). RECONSTRUCTION COMPLÈTE depuis la vraie spec — la précédente
 * implémentation (4 familles génériques `base^(mx+n)`, sans lien avec les 4 formules ci-dessous)
 * avait été inventée faute d'avoir trouvé le bon fichier de spec au moment de sa création, et ne
 * correspondait à AUCUNE des 4 familles réelles.
 *
 * 4 familles STRUCTURELLEMENT DISJOINTES (union discriminée par `famille`), chacune une formule
 * FIXE — jamais de réutilisation de `6gen7` (décision explicite de la spec : "combine deux
 * compétences déjà construites" au sens PÉDAGOGIQUE seulement, pas au sens d'un import de code —
 * les 4 formules de ce générateur sont propres, aucune ne recoupe celles de `6gen7`).
 *
 * **Écrans variables par famille** (décision confirmée par la spec) : familles A/C (règle simple,
 * calcul mental raisonnable) → 1 écran, QCM direct. Familles B/D (règle du quotient / réciproque,
 * plus sujettes à erreur) → 2 écrans : calcul symbolique de `f'(x)` en TEXTE LIBRE d'abord (vérifié
 * par équivalence NUMÉRIQUE — aucune bibliothèque d'algèbre symbolique n'est installée sur ce
 * projet, "Algebrite/mathjs" de la spec source désigne en réalité la convention déjà en place
 * partout ailleurs sur la plateforme, voir `moteur6e/equivalenceExponentielle.ts`), PUIS le QCM à
 * partir de la dérivée **correcte** (indépendamment de ce que l'élève a soumis à l'écran 1 — le
 * QCM est fixé à la génération, jamais dérivé de la réponse élève).
 *
 * `candidats`/`indexCorrect` (les 4 familles) : même mécanisme que `6gen5` — 4 candidats déjà
 * MÉLANGÉS à la génération (`indexCorrect` pointe vers celui qui est mathématiquement correct,
 * jamais toujours en position 0), chaque candidat une STRUCTURE DE DONNÉES PURE (jamais une
 * closure) — `ui6e/formatGraphiquesDeriveeExponentielles.ts::evaluerCandidat` réimplémente la
 * vraie f'(x) ET les 3 distracteurs comme de VRAIES fonctions renvoyables, jamais une astuce de
 * rendu déconnectée des données — voir l'en-tête de ce module pour la construction de chaque
 * distracteur, choisie pour représenter fidèlement l'erreur de calcul nommée par la spec (jamais
 * un graphique "dessiné à la main" pour ressembler vaguement à une erreur).
 */

// ============================================================================
// Famille A — f(x) = a·x·e^x, a∈{-3,-2,-1,1,2,3}. f'(x) = a·e^x·(1+x). L'EXTREMUM DE LA COURBE
// f'(x) ELLE-MÊME (pas de f !) est toujours en x=-2, quel que soit a — preuve : d/dx[f'(x)] =
// a·e^x·(2+x), nul en x=-2. Le signe de a décide si c'est un minimum ou un maximum de f'.
// ============================================================================

export interface CandidatDeriveeA {
  a: number;
  /** Décalage additif dans `(1+x+decalageExtremum)` — `0` pour le candidat réel (extremum
   * toujours en x=-2) ; non-nul UNIQUEMENT pour le distracteur "extremum mal placé" — décale
   * l'extremum de la courbe f' à `x=-2-decalageExtremum` (preuve : même dérivation, `2+x+decalage`
   * s'annule à `x=-2-decalage`), jamais `0` pour ce distracteur (sinon il coïnciderait avec le
   * réel). */
  decalageExtremum: number;
  /** `true` UNIQUEMENT pour le distracteur "version monotone" — ignore le facteur
   * `(1+x+decalageExtremum)` entièrement, trace `a·e^x` seul (`decalageExtremum` alors ignoré). */
  monotone: boolean;
}

export interface ExerciceGraphiqueDeriveeA {
  famille: "A";
  a: number;
  candidats: CandidatDeriveeA[];
  indexCorrect: number;
}

// ============================================================================
// Famille B — f(x) = base^x/(base^x+1), base∈{2,3,4} (>1) ou {0,5;0,25;0,2} (<1). f'(x) =
// base^x·ln(base)/(base^x+1)². Signe de f' CONSTANT sur tout ℝ (déterminé uniquement par le signe
// de ln(base)), jamais de changement de signe — une courbe en "bosse" (bump), pic en x=0 (où
// base^x=1).
// ============================================================================

export type TypeCandidatDeriveeB = "reel" | "signeInverse" | "traverseZero" | "positionDecalee";

export interface CandidatDeriveeB {
  base: number;
  /** "reel" — la vraie dérivée. "signeInverse" — dérivée niée (confond base>1/base<1, spec
   * distracteur 1). "traverseZero" — numérateur du quotient non entièrement simplifié
   * (`u'·(u-1)` au lieu de `u'` seul après simplification du quotient, laisse un facteur qui
   * change de signe en x=0, spec distracteur 2 "traverse zéro"). "positionDecalee" — même bosse,
   * pic déplacé horizontalement (spec distracteur 3, "mauvaise position/largeur du pic"). */
  type: TypeCandidatDeriveeB;
  /** Décalage horizontal appliqué UNIQUEMENT au type "positionDecalee" (toujours non nul pour ce
   * type — sinon il coïnciderait avec le réel). */
  decalage: number;
}

export interface ExerciceGraphiqueDeriveeB {
  famille: "B";
  base: number;
  candidats: CandidatDeriveeB[];
  indexCorrect: number;
}

// ============================================================================
// Famille C — f(x) = (e^(kx)+e^(-kx))/2, k∈{1,2,3}. f'(x) = k·(e^(kx)-e^(-kx))/2. f' est IMPAIRE,
// strictement croissante, NON BORNÉE dans les deux directions, passe par (0,0).
// ============================================================================

export type TypeCandidatDeriveeC = "reel" | "paire" | "bornee" | "echelle";

export interface CandidatDeriveeC {
  k: number;
  /** "reel" — la vraie dérivée (impaire, non bornée). "paire" — signe du second terme oublié
   * (`k·(e^(kx)+e^(-kx))/2`, littéralement `k·f(x)` — erreur de signe classique sur la dérivée de
   * `e^(-kx)`, produit une courbe PAIRE au lieu d'impaire, spec distracteur 1). "bornee" —
   * `k·tanh(x)`, une VRAIE fonction bornée qui plafonne (même pente à l'origine `k` que le réel,
   * mais sature aux deux infinis plutôt que diverger — spec distracteur 2). "echelle" — bon signe/
   * bonne forme (impaire, non bornée), mais facteur d'échelle `facteurAffiche≠k` en façade (spec
   * distracteur 3, "facteur k oublié ou mal appliqué"). */
  type: TypeCandidatDeriveeC;
  /** Facteur RÉELLEMENT appliqué devant `(e^(kx)-e^(-kx))/2` — utilisé UNIQUEMENT par le type
   * "echelle" (toujours ≠k pour ce type ; vaut `k` pour les 3 autres types, ignoré). */
  facteurAffiche: number;
}

export interface ExerciceGraphiqueDeriveeC {
  famille: "C";
  k: number;
  candidats: CandidatDeriveeC[];
  indexCorrect: number;
}

// ============================================================================
// Famille D — f(x) = 1/(e^(kx)-1), k∈{-2,-1,1,2}. f'(x) = -k·e^(kx)/(e^(kx)-1)². Domaine x≠0
// (point exclu, quel que soit k). Signe de f' CONSTANT (déterminé par -k), deux branches qui
// divergent vers ±∞ près de x=0 et tendent vers 0 aux deux infinis.
// ============================================================================

export type TypeCandidatDeriveeD = "reel" | "signeInverse" | "continu" | "sansCarre";

export interface CandidatDeriveeD {
  k: number;
  /** "reel" — la vraie dérivée (2 branches, pôle en x=0, tend vers 0 aux deux infinis).
   * "signeInverse" — signe global oublié (confond k>0/k<0, spec distracteur 1) — conserve le
   * pôle. "continu" — la "-1" du dénominateur `e^(kx)-1` a été oubliée avant de dériver
   * (`u=e^(kx)` au lieu de `u=e^(kx)-1`), donnant `-k·e^(-kx)` : une VRAIE fonction, continue
   * PARTOUT, aucune singularité en x=0 (spec distracteur 2, "domaine continu"). "sansCarre" —
   * dénominateur non élevé au carré (`-k·e^(kx)/(e^(kx)-1)` au lieu de `.../(e^(kx)-1)²`) : garde
   * un pôle en x=0, mais ne tend PLUS vers 0 à l'infini du côté où `e^(kx)→∞` (plafonne à `-k`
   * plutôt que 0 — spec distracteur 3, "mauvaise décroissance asymptotique"). */
  type: TypeCandidatDeriveeD;
}

export interface ExerciceGraphiqueDeriveeD {
  famille: "D";
  k: number;
  candidats: CandidatDeriveeD[];
  indexCorrect: number;
}

export type ExerciceGraphiqueDeriveeExponentielle =
  | ExerciceGraphiqueDeriveeA
  | ExerciceGraphiqueDeriveeB
  | ExerciceGraphiqueDeriveeC
  | ExerciceGraphiqueDeriveeD;

export type FamilleGraphiqueDeriveeExponentielle = ExerciceGraphiqueDeriveeExponentielle["famille"];
