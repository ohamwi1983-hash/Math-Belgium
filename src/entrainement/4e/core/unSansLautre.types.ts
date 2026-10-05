/**
 * Couche core — "L'un sans l'autre" (chapitre 3, remplace "Angles associés" en position 16 —
 * promptcreationgenerateur16unsanslautre.md). À partir d'une valeur connue de cosθ ou sinθ et d'un
 * intervalle sur θ déterminant un unique quadrant, l'élève retrouve l'autre valeur via l'identité
 * cos²θ+sin²θ=1, puis calcule tanθ=sinθ/cosθ. Portée limitée (section "Objectif pédagogique") :
 * jamais de résolution d'équation/inéquation trigonométrique générale, jamais d'autre identité,
 * jamais encore la variante où tanθ serait la valeur de départ (réservée à un développement
 * ultérieur séparé, explicitement exclue par la spec).
 */

export type FonctionConnue = "cos" | "sin";

/**
 * θ est toujours dans un intervalle OUVERT correspondant à un unique quadrant — jamais sur un axe.
 * Type local plutôt que le `Quadrant` partagé de `cercleTrigonometrique.types.ts` (qui inclut en
 * plus `"axeOx"`/`"axeOy"`, jamais produits ici) : cohérent avec le principe du projet de ne pas
 * réutiliser un type partagé quand il ne correspond pas exactement à ce qui est réellement généré
 * (voir CLAUDE.md, "Catalogue de variantes", motif "table de nommage... créer un id localement").
 */
export type QuadrantOuvert = "I" | "II" | "III" | "IV";

/**
 * "triplet" : le carré cible (1-valeurConnue²) est un carré parfait — racine rationnelle, résultat
 * exact sans radical (ex. cosθ=-3/5 → sinθ=4/5, triplet 3-4-5). "quelconque" : le carré cible n'est
 * pas un carré parfait — la racine doit être extraite puis simplifiée (ex. cosθ=1/3 →
 * sinθ=√8/3=2√2/3). Ne pilote que la CONSTRUCTION du tirage (voir `generateurs/unSansLautre/`),
 * jamais la vérification, qui reste purement numérique/structurelle et ignore ce champ.
 */
export type TypeValeurConnue = "triplet" | "quelconque";

export interface ExerciceUnSansLautre {
  fonctionConnue: FonctionConnue;
  fonctionCible: FonctionConnue;
  quadrant: QuadrantOuvert;
  /** Bornes de l'intervalle sur θ, en degrés — toujours celles du quadrant entier (ex. 90/180). */
  borneInf: number;
  borneSup: number;
  typeValeur: TypeValeurConnue;
  /** |numérateur|/dénominateur de la valeur donnée — coprimes, 0<p<q, q>0 — jamais recalculés
   * différemment côté vérification (voir `moteur/verificationUnSansLautre.ts`). */
  p: number;
  q: number;
  signeConnu: 1 | -1;
  /** = signeConnu * p/q — la valeur donnée à l'élève (cosθ ou sinθ selon `fonctionConnue`). */
  valeurConnue: number;
  /**
   * Réponse attendue de l'écran "Carré" : `carreCibleNum/carreCibleDen` = (q²-p²)/q² — toujours
   * DÉJÀ irréductible par construction (gcd(p,q)=1 ⟹ gcd(q²-p²,q²)=1, propriété vérifiée par
   * test) — l'élève peut néanmoins soumettre une forme équivalente non réduite (pénalité de
   * simplification, jamais un statut incorrect).
   */
  carreCibleNum: number;
  carreCibleDen: number;
  signeCible: 1 | -1;
  /** = signeCible * (√(carreCibleNum)/q) — la valeur signée attendue de `fonctionCible`. */
  valeurCible: number;
  sinValeur: number;
  cosValeur: number;
  tanValeur: number;
}

export type GenerateurExerciceUnSansLautre = () => ExerciceUnSansLautre;
