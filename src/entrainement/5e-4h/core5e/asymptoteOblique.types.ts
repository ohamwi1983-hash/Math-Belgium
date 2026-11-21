/**
 * Couche core (5e) — contrat pour `5gen21` ("Asymptote oblique", chapitre "Limites et asymptotes",
 * à la suite de 5gen20). UN SEUL modèle de génération sous-jacent — `variante` ne change QUE la
 * technique de résolution demandée à l'élève, jamais les nombres générés.
 *
 * f(x)=P(x)/D(x), D(x) MONIC de degré 1 (P2/P1) ou 2 (P3/P2) — quotient Q(x)=ax+b et reste
 * (constante c) TOUJOURS choisis EN PREMIER (construction "à l'envers"), P(x) TOUJOURS dérivé
 * ensuite par expansion algébrique exacte de Q(x)*D(x)+c — jamais de rejet/régénération, le
 * résultat est par construction toujours propre.
 */

export type VarianteAsymptoteOblique = "divisionEuclidienne" | "viaLimites";

export interface ExerciceAsymptoteOblique {
  variante: VarianteAsymptoteOblique;
  /** Coefficient dominant du quotient Q(x)=ax+b — jamais nul. */
  a: number;
  b: number;
  /** Reste de la division — jamais nul (sinon l'asymptote serait atteinte exactement, cas dégénéré
   * hors périmètre de cet exercice). TOUJOURS une constante, quel que soit le degré de D(x) (son
   * degré 0 reste strictement inférieur à celui de D(x), 1 ou 2 — condition suffisante pour que la
   * fraction c/D(x) tende vers 0 à l'infini). */
  c: number;
  /** D(x) MONIC (coefficient dominant toujours 1) — `coeffsD[i]` = coefficient de x^i. Longueur 2
   * (degré 1, D(x)=x-k, P2/P1) ou 3 (degré 2, D(x)=x²+px+q, P3/P2 — `q` TOUJOURS strictement
   * supérieur à `p²/4` par construction, discriminant négatif garanti, donc AUCUNE racine réelle à
   * exclure lors de l'échantillonnage de vérification, contrairement au degré 1 où x=k doit l'être). */
  coeffsD: number[];
  /** P(x)=Q(x)*D(x)+c développé, TOUJOURS dérivé de a/b/c/coeffsD — `coeffsP[i]` = coefficient de
   * x^i, longueur `coeffsD.length+1` (degré = degré de D(x) + 1, l'écart caractéristique de
   * l'asymptote oblique). */
  coeffsP: number[];
}

export type GenerateurExerciceAsymptoteOblique = () => ExerciceAsymptoteOblique;

/**
 * Famille « position de la courbe par rapport à son asymptote » (5e ch. 4, lots B–D, validée par
 * l'utilisateur). La droite d (AO y = ax + b, ou AH y = b avec a = 0) est DONNÉE ; D(x) = x² + px + q
 * sans racine réelle (Δ < 0, donc D(x) > 0 partout) ; le reste R(x) = rx + s de la division donne
 * f(x) − (ax + b) = R(x)/D(x), dont le signe est celui de R :
 * - `dessus` : R = s > 0 (r = 0) — la courbe est au-dessus de d sur ℝ ;
 * - `dessous` : R = s < 0 (r = 0) — en dessous sur ℝ ;
 * - `recoupe` : r ≠ 0, R s'annule en x₀ = −s/r (entier) — la courbe recoupe d en (x₀ ; ax₀ + b) et
 *   passe d'un côté à l'autre.
 * Le verdict est tiré à parts égales (un tiers chacun) : jamais un cas particulier, jamais dans la
 * `forme` du profil ; les quatre écrans sont les mêmes pour les trois verdicts.
 */
export type VerdictPosition = "dessus" | "dessous" | "recoupe";

export interface ExercicePositionAsymptote {
  variante: "position";
  asymptote: "oblique" | "horizontale";
  /** Pente de d (0 pour une AH). */
  a: number;
  /** Ordonnée à l'origine de d (valeur k de l'AH y = k). */
  b: number;
  /** Reste R(x) = rx + s (r = 0 : reste constant non nul). */
  r: number;
  s: number;
  /** D(x) = x² + px + q, `coeffsD[i]` = coefficient de xⁱ, Δ < 0. */
  coeffsD: number[];
  /** P(x) = (ax + b)·D(x) + R(x), `coeffsP[i]` = coefficient de xⁱ. */
  coeffsP: number[];
  verdict: VerdictPosition;
}

/** Tout exercice de 5gen21 : asymptote oblique (division ou limites) ou position. */
export type ExerciceGen21 = ExerciceAsymptoteOblique | ExercicePositionAsymptote;

export function estPosition(e: ExerciceGen21): e is ExercicePositionAsymptote {
  return e.variante === "position";
}
