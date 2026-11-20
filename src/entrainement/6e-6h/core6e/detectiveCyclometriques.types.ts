/**
 * Couche core — `6gen152` « Le détective d'erreurs : réciproques et arcfonctions » (6e ch. 1, § 1 à
 * 5, processus 3 TRANSFÉRER). Même mécanique que 6gen88 / 6gen144 : la résolution d'un élève fictif
 * (3 à 5 lignes) contient UNE ligne fausse, la suite en découle. Trois écrans : 1. quelle ligne ?
 * (choix fermé, une tentative) ; 2. quelle erreur ? (quatre descriptions, une tentative) ;
 * 3. corriger (valeurs exactes, trois tentatives).
 *
 * Neuf types d'erreur (= variantes), tirés des erreurs typiques relevées par l'audit du chapitre :
 * - `inverse`     : f⁻¹ confondue avec 1/f ;
 * - `arcsinSin`   : arcsin(sin θ) = θ (ou arccos(cos θ) = θ) avec θ hors de l'image ;
 * - `signeArccos` : signe « − » oublié dans la dérivée de arccos u ;
 * - `uprime`      : facteur u′ oublié dans la dérivée de arctan u ;
 * - `carre`       : (kx)² écrit kx² dans la dérivée de arcsin(kx) ;
 * - `ce`          : candidat hors de la condition d'existence gardé (arcsin A = arcsin B) ;
 * - `sens`        : sens de l'inégalité non inversé en divisant par −k (domaine de arcsin(a − kx)) ;
 * - `arctan`      : ±π/2 « atteints » par arctan (image fermée) ;
 * - `injectivite` : injectivité affirmée sur une réunion d'intervalles.
 */

export type VarianteDetectiveCyclo = "inverse" | "arcsinSin" | "signeArccos" | "uprime" | "carre" | "ce" | "sens" | "arctan" | "injectivite";

export interface ExerciceDetectiveCyclo {
  variante: VarianteDetectiveCyclo;
  /** Paramètres entiers du scénario (noms propres à chaque scénario, voir le modèle). */
  donnees: Record<string, number>;
  /** Les quatre descriptions de l'écran 2, dans l'ordre d'affichage (tiré à la génération). */
  options: string[];
}
