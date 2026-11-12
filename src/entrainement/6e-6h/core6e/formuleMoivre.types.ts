/**
 * Couche core (6e) — contrat pour `6gen38` ("Formule de Moivre : développer cos(nx) et sin(nx)",
 * chapitre 7 "Nombres complexes", générateur suivant `6gen34`). UNE SEULE famille (contrairement à
 * `nombresComplexes.types.ts`, 7 familles A-G) — seul paramètre de génération : `n∈{3,4,5,6}`.
 *
 * ============================================================================
 * **`termes` : précalculé à la génération (Couche A), jamais recalculé côté Couche B/ui**
 * ============================================================================
 * `(cos x + i sin x)^n` développé par le binôme de Newton donne n+1 termes, k=0..n. Pour CHAQUE
 * terme, `generateurs6e/formuleMoivre/index.ts` calcule une fois pour toutes :
 * - `coefBinomial` = C(n,k) (entier, technique algébrique déjà maîtrisée — aucune brique externe).
 * - `puissanceCos` = n-k (exposant de cos(x) dans ce terme).
 * - `reI`/`imI` = partie réelle/imaginaire de i^k, calculée via `puissanceDeI` (`generateurs6e/
 *   nombresComplexes/familleG.ts`, brique établie par `6gen34`, RÉUTILISÉE ici — jamais réimplémentée).
 * Stocker `reI`/`imI` (plutôt que de rappeler `puissanceDeI` depuis la Couche B) est ce qui permet à
 * `moteur6e/verificationFormuleMoivre.ts` de construire ses fonctions de référence SANS jamais
 * importer `generateurs6e/` — règle non négociable de l'architecture (CLAUDE.md) : `puissanceDeI`
 * n'est appelée QU'UNE FOIS, à la génération, côté Couche A ; sa valeur traverse ensuite les couches
 * comme une donnée pure du contrat, jamais comme un appel de fonction cross-couche.
 */

/** Un terme C(n,k)·cos^(n−k)(x)·(i·sin(x))^k du développement binomial de (cos x + i sin x)^n. */
export interface TermeDeveloppementMoivre {
  /** Indice du terme dans le développement, 0..n. */
  k: number;
  /** C(n,k), entier positif. */
  coefBinomial: number;
  /** Exposant de cos(x) dans ce terme (= n-k). */
  puissanceCos: number;
  /** Partie réelle de i^k (0, 1 ou -1) — voir en-tête de fichier. */
  reI: number;
  /** Partie imaginaire de i^k (0, 1 ou -1) — voir en-tête de fichier. */
  imI: number;
}

/**
 * Ce que demande l'écran 3 (audit 6e ch. 5, point 34/J — 4 exercices distincts seulement avant) :
 * - `standard` : cos(nx) ET sin(nx), polynômes en cos(x) et sin(x) ;
 * - `cosSeul` : cos(nx) en fonction de cos(x) SEULEMENT (sin²(x) = 1 − cos²(x)) ;
 * - `sinSurSin` : sin(nx)/sin(x) en fonction de cos(x) SEULEMENT.
 */
export type CibleFormuleMoivre = "standard" | "cosSeul" | "sinSurSin";

export interface ExerciceFormuleMoivre {
  n: 3 | 4 | 5 | 6;
  /** Longueur n+1, k=0..n dans l'ordre — voir en-tête de fichier. */
  termes: TermeDeveloppementMoivre[];
  cible: CibleFormuleMoivre;
  /** Coefficients (indice = puissance de cos(x)) du polynôme en cos(x) attendu à l'écran 3 pour
   * `cosSeul` (cos(nx)) et `sinSurSin` (sin(nx)/sin(x)) ; vide pour `standard`. Précalculés à la
   * génération, comme `termes`. */
  polynomeCos: number[];
}
