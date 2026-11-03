/**
 * Couche core (6e) — contrat pour `6gen20` ("Graphique de la fonction dérivée", fonctions
 * logarithmes, chapitre 3). 3 familles STRUCTURELLEMENT DISJOINTES (union discriminée par
 * `famille`), chacune une formule FIXE — combine deux compétences déjà construites au sens
 * PÉDAGOGIQUE seulement (calculer une dérivée logarithmique, 6gen16 ; choisir le bon graphique
 * parmi des distracteurs ciblés, 6gen5/6gen8), jamais un import de code : les 3 formules de ce
 * générateur sont propres, aucune ne réutilise celles de 6gen16/6gen8 (règle du chantier : pas de
 * moteur/contrat partagé entre générateurs, sauf les 2 fichiers explicitement partagés — voir
 * CLAUDE.md).
 *
 * **Toutes les familles suivent exactement 2 écrans** : "selection" (le GRAPHIQUE de f est donné,
 * l'élève choisit celui de f' en lisant les variations, les extremums et les pentes de f — la
 * compétence annoncée par la carte du cours), PUIS "derivee" (calcul de f'(x), qui confirme le
 * choix). L'ordre inverse (calcul d'abord, formule de f' affichée pendant le choix) faisait du
 * choix graphique une simple évaluation de formule.
 *
 * **Constante `c`** (les 3 familles) : f(x) + c a la MÊME dérivée — décale le graphique de f
 * verticalement (aucune mémorisation d'une image possible) sans rien changer à f'.
 *
 * `candidats`/`indexCorrect` (les 3 familles) : même mécanisme que `6gen8`/`6gen5` — 4 candidats
 * déjà MÉLANGÉS à la génération (`indexCorrect` pointe vers celui qui est mathématiquement
 * correct, jamais toujours en position 0), chaque candidat une STRUCTURE DE DONNÉES PURE (jamais
 * une closure) — `ui6e/formatGraphiqueDeriveeLogarithme.ts::evaluerCandidat` réimplémente la vraie
 * f'(x) ET les 3 distracteurs comme de vraies fonctions renvoyables. Voir l'en-tête de ce module
 * pour la construction de chaque distracteur.
 */

// ============================================================================
// Famille A — f(x) = k·log_base(x)/x + c, base∈{2,3,5,7}∪{e}, k∈{-3,-2,-1,1,2,3}, c∈{-1,0,1}.
// f'(x) = k·[1−ln(x)]/(x²·ln(base)) (ou sans le ln(base) si base=e).
//
// **Propriété structurelle** : le zéro de f' est TOUJOURS en x=e, quels que soient k et base — la
// courbe n'est PAS monotone (pic : valeur élevée près de 0, décroissance, zéro en x=e, tend vers 0
// par valeurs négatives ensuite).
// ============================================================================

export type TypeCandidatDeriveeLogA = "reel" | "signeInverse" | "zeroMalPlace" | "monotone";

export interface CandidatDeriveeLogA {
  k: number;
  base: number;
  baseEstE: boolean;
  /** "reel" — la vraie dérivée (pic, zéro exact en x=e). "signeInverse" — dérivée niée (confond le
   * signe de k, spec distracteur 1). "zeroMalPlace" — même forme en pic, mais zéro déplacé à
   * x=e^constanteNumerateur ≠ e (spec distracteur 2). "monotone" — ignore le facteur 1/x² du
   * quotient (erreur de calcul plausible : dérive log_base(x) seul, oublie la division par x issue
   * de la règle du quotient), donnant une courbe MONOTONE au lieu du pic caractéristique — confond
   * avec la signature de la famille C (spec distracteur 3). */
  type: TypeCandidatDeriveeLogA;
  /** Constante dans `(constanteNumerateur − ln(x))` — `1` pour "reel" (cohérent avec `1−ln(x)`,
   * zéro exact en x=e) ; UNIQUEMENT ≠1 pour "zeroMalPlace" (sinon ce distracteur coïnciderait avec
   * le réel) ; ignorée (vaut `1`, jamais lue) par "signeInverse"/"monotone". */
  constanteNumerateur: number;
}

export interface ExerciceGraphiqueDeriveeLogA {
  famille: "A";
  k: number;
  base: number;
  baseEstE: boolean;
  c: number;
  candidats: CandidatDeriveeLogA[];
  indexCorrect: number;
}

// ============================================================================
// Famille B — f(x) = k·e^(ax)·ln(x) + c, k∈{-3,-2,-1,1,2,3}, a∈{1,2}, c∈{-1,0,1}.
// f'(x) = k·e^(ax)·[a·ln(x)+1/x].
//
// **Propriété structurelle** : a·ln(x)+1/x > 0 pour tout x>0 quand a∈{1,2} (minimum en x=1/a,
// valant a·(1−ln a) > 0) — le signe de f' est donc entièrement déterminé par le signe de k,
// JAMAIS nul : f n'a aucun extremum.
// ============================================================================

export type TypeCandidatDeriveeLogB = "reel" | "signeInverse" | "traverseZero" | "borneMauvaise";

export interface CandidatDeriveeLogB {
  k: number;
  a: number;
  /** "reel" — la vraie dérivée (jamais nulle, même signe que k partout). "signeInverse" — dérivée
   * niée (confond le signe de k, spec distracteur 1). "traverseZero" — oublie le terme `e^x/x` de
   * la règle du produit (erreur plausible : dérive seulement le facteur `e^x`, oublie `v'=1/x`),
   * donnant littéralement `k·e^x·ln(x)` (= f(x) lui-même) — CHANGE de signe en x=1 (spec
   * distracteur 2, "traverse zéro"). "borneMauvaise" — oublie le facteur `e^x` (traite l'exponentielle
   * comme une constante), donnant `k·(ln(x)+1/x)` : garde le bon signe (jamais nul, comme le
   * réel), mais ne reproduit PAS la tendance vers +∞ des deux côtés (croissance seulement
   * logarithmique en +∞ au lieu d'exponentielle — spec distracteur 3). */
  type: TypeCandidatDeriveeLogB;
}

export interface ExerciceGraphiqueDeriveeLogB {
  famille: "B";
  k: number;
  a: number;
  c: number;
  candidats: CandidatDeriveeLogB[];
  indexCorrect: number;
}

// ============================================================================
// Famille C — f(x) = k·x·ln(x) + p·x + c, k∈{-3,-2,-1,1,2,3}, p∈{-1,0,1}, c∈{-1,0,1}.
// f'(x) = k·(ln(x)+1) + p = k·(ln(x)+s) avec s = 1 + p/k.
//
// **Propriété structurelle** : le zéro de f' (l'extremum de f) est en x = e^(−s) — x=1/e quand
// p=0 — et cette dérivée est ELLE-MÊME monotone (croissante si k>0, décroissante si k<0).
// ============================================================================

export type TypeCandidatDeriveeLogC = "reel" | "signeInverse" | "zeroMalPlace" | "formeEnPic";

export interface CandidatDeriveeLogC {
  k: number;
  /** "reel" — la vraie dérivée (droite monotone, zéro exact en x=1/e). "signeInverse" — dérivée
   * niée (confond le signe de k, spec distracteur 1). "zeroMalPlace" — même forme monotone, mais
   * zéro déplacé à x=e^(-constanteAdditive) ≠ 1/e (spec distracteur 2). "formeEnPic" — reprend
   * littéralement la FORME de la famille A (`k·(1−ln(x))/x²`, un pic non monotone) plutôt que la
   * droite monotone attendue ici — confond avec la signature de la famille A (spec distracteur 3). */
  type: TypeCandidatDeriveeLogC;
  /** Constante additive s dans `k·(ln(x)+s)` — `1+p/k` pour "reel"/"signeInverse" (zéro en
   * x=e^(−s), l'extremum de f) ; décalée de ±1 pour "zeroMalPlace" ; ignorée par "formeEnPic". */
  constanteAdditive: number;
}

export interface ExerciceGraphiqueDeriveeLogC {
  famille: "C";
  k: number;
  p: number;
  c: number;
  candidats: CandidatDeriveeLogC[];
  indexCorrect: number;
}

export type ExerciceGraphiqueDeriveeLogarithme = ExerciceGraphiqueDeriveeLogA | ExerciceGraphiqueDeriveeLogB | ExerciceGraphiqueDeriveeLogC;

export type FamilleGraphiqueDeriveeLogarithme = ExerciceGraphiqueDeriveeLogarithme["famille"];
