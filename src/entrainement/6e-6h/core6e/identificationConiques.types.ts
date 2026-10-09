/**
 * Couche core (6e) — contrat pour `6gen58` ("Identification d'une conique et de ses éléments
 * caractéristiques"), générateur D'OUVERTURE du chapitre "Les coniques" (voir `docs/historique-6e.md`).
 *
 * ============================================================================
 * `NatureConique` — LE TYPE FONDATEUR DE TOUT LE CHAPITRE. `6gen59` à `6gen63` (à construire après
 * ce générateur) réutiliseront ce type et les fonctions de classification pures de
 * `generateurs6e/identificationConiques/classification.ts` TELS QUELS — jamais un type parallèle
 * redéfini localement. Les 13 identifiants couverts (`IdentifiantNature`) correspondent exactement
 * au "statut structuré commun aux 3 familles" de la mission : ellipse (axe horizontal/vertical),
 * hyperbole (axe horizontal/vertical), cercle, parabole (4 orientations), ∅, point, 2 droites
 * parallèles, 2 droites sécantes.
 * ============================================================================
 */

export interface Point {
  x: number;
  y: number;
}

export type AxeConique = "horizontal" | "vertical";
export type OrientationParabole = "droite" | "gauche" | "haut" | "bas";

/**
 * Statut structuré de classification d'une conique — JAMAIS de texte libre (CLAUDE.md, "statut
 * structuré à 3 valeurs"... ici à 10 branches). Un discriminant `type` unique, cohérent avec le
 * reste de la plateforme (ex. `ExerciceDenombrementFondamental`, discriminé par `famille`).
 *
 * - `"droitesParalleles"` : dégénérescence de la famille A sous-type 2 (`Av²+Dv=0`, même variable
 *   au carré et au linéaire) — 2 droites `variable=valeurs[0]` et `variable=valeurs[1]`.
 * - `"droitesSecantes"` : dégénérescence de `Ax²+By²=0` (A,B de signes opposés) — 2 droites
 *   passant par `centre`, de pentes `±pente`.
 */
export type NatureConique =
  | { type: "ellipse"; axe: AxeConique }
  | { type: "hyperbole"; axe: AxeConique }
  | { type: "cercle" }
  | { type: "parabole"; orientation: OrientationParabole }
  | { type: "vide" }
  | { type: "point"; centre: Point }
  | { type: "droitesParalleles"; variable: "x" | "y"; valeurs: [number, number] }
  | { type: "droitesSecantes"; centre: Point; pente: number };

/** Identifiant plat (string), UNIQUE PAR CATÉGORIE — utilisé comme `valeur` des boutons de choix
 * `.btn.toggle-active` (jamais une saisie libre pour ce champ, voir CLAUDE.md) et comme clé de
 * comparaison de statut. `natureVersId`/`LIBELLE_NATURE` (`classification.ts`) sont la SEULE source
 * de vérité pour cette correspondance — jamais un mapping dupliqué ailleurs. */
export type IdentifiantNature =
  | "ellipseHorizontal"
  | "ellipseVertical"
  | "hyperboleHorizontal"
  | "hyperboleVertical"
  | "cercle"
  | "paraboleDroite"
  | "paraboleGauche"
  | "paraboleHaut"
  | "paraboleBas"
  | "vide"
  | "point"
  | "droitesParalleles"
  | "droitesSecantes";

/** Éléments caractéristiques numériques d'une conique NON DÉGÉNÉRÉE — champs présents selon
 * `nature.type` uniquement (voir `elementsConiqueCentree`/`elementsParabole`,
 * `generateurs6e/identificationConiques/classification.ts`) :
 * - `cercle` → `rayon` seul.
 * - `ellipse`/`hyperbole` → `a` (demi-axe associé à l'axe focal), `b` (demi-axe perpendiculaire),
 *   `c` (distance focale) ; `pente` (pente des asymptotes) EN PLUS pour `hyperbole` seulement.
 * - `parabole` → traité séparément (`foyer`/`directrice`/`p`, voir `ExerciceConiqueA2`), jamais via
 *   cette interface (les formules `a`/`b`/`c` ne s'appliquent qu'aux coniques à centre).
 */
export interface ElementsConiqueCentree {
  /** `a`,`b` sont TOUJOURS des entiers exacts par construction (voir
   * `generateurs6e/identificationConiques/classification.ts`, `elementsConiqueCentree`) — jamais
   * besoin d'affichage radical pour eux. */
  a?: number;
  b?: number;
  /** Distance focale — PEUT être irrationnelle (`\sqrt{cCarre}`, jamais un décimal affiché — voir
   * `cCarre`, toujours un entier exact lui, même quand `c` ne l'est pas). */
  c?: number;
  /** `a²±b²` (entier exact) — LA seule quantité de cette interface pour laquelle l'affichage
   * (`ui6e/formatIdentificationConiques.ts`) doit passer par `\sqrt{...}` plutôt que par la valeur
   * numérique brute, `c` pouvant être irrationnel. */
  cCarre?: number;
  /** Pente des asymptotes (hyperbole seulement) — toujours un RATIONNEL exact (rapport de 2 entiers
   * `a`,`b`), jamais irrationnel. */
  pente?: number;
  rayon?: number;
}

// ============================================================================
// Famille A — sous-type 1 : Ax²+By²+C=0 (2 carrés présents), centrée à l'origine.
// ============================================================================

export type CategorieProbable = "ellipseCercleVidePoint" | "hyperboleDroitesSecantes";

/** Écran 1 → `categorieProbable` (choix). Écran 2 → `nature` (choix, restreint à la catégorie
 * CONFIRMÉE de l'écran 1). Écran 3 (si `nature.type` ∈ {cercle,ellipse,hyperbole}) → `elements`. */
export interface ExerciceConiqueA1 {
  famille: "A";
  sousType: "centree2Carres";
  A: number;
  B: number;
  C: number;
  categorieProbable: CategorieProbable;
  nature: NatureConique;
  elements: ElementsConiqueCentree;
}

// ============================================================================
// Famille A — sous-type 2 : un seul carré + un terme linéaire (Av²+Dv=0 ou Av²+Dw=0).
// ============================================================================

/** Écran 1 → `memeVariable` (choix). Écran 2 → selon le cas CONFIRMÉ de l'écran 1 : si même
 * variable, les 2 racines (`nature.valeurs`, `droitesParalleles`) ; si autre variable, le
 * coefficient `4p` signé (`quatrePSigne`) + l'orientation (`nature.orientation`, `parabole`).
 * Écran 3 (si parabole) → `foyer`/`directrice`. */
export interface ExerciceConiqueA2 {
  famille: "A";
  sousType: "unCarreUnLineaire";
  coeffCarre: number;
  variableCarre: "x" | "y";
  coeffLineaire: number;
  memeVariable: boolean;
  /** `-coeffLineaire/coeffCarre` — présent uniquement si `memeVariable` (2ᵉ racine, la 1ʳᵉ étant
   * toujours 0 — `x(Ax+D)=0`). */
  autreRacine?: number;
  /** `-4·coeffLineaire/coeffCarre` — présent uniquement si `!memeVariable` (coefficient signé de la
   * forme standard `v²=4p·w`). */
  quatrePSigne?: number;
  /** Distance focale (magnitude, toujours positive) — présent uniquement si `!memeVariable`. */
  p?: number;
  foyer?: Point;
  /** Valeur signée de la coordonnée constante de la directrice (ex. `y=directrice`). */
  directrice?: number;
  nature: NatureConique;
}

export type ExerciceConiqueA = ExerciceConiqueA1 | ExerciceConiqueA2;

// ============================================================================
// Famille B — Ax²+By²+Dx+Ey+F=0, décentrée (D≠0 et/ou E≠0).
// ============================================================================

/** Écran 1 → `formeIntermediaire` (texte libre, garde structurelle — voir
 * `moteur6e/verificationIdentificationConiques.ts`, `diagnostiquerFormeIntermediaireB`). Écran 2 →
 * 3 signes (`signeA`/`signeB`/`signeM`, choix). Écran 3 → `nature` (choix, restreint à la
 * combinaison de signes CONFIRMÉE). Écran 4 (si non dégénérée) → `elements`. */
export interface ExerciceConiqueB {
  famille: "B";
  A: number;
  B: number;
  D: number;
  E: number;
  F: number;
  centre: Point;
  /** Constante finale après complétion du carré : `A(x-h)²+B(y-k)²=M`. */
  M: number;
  nature: NatureConique;
  elements: ElementsConiqueCentree;
}

// ============================================================================
// Famille C — forme "racine isolée" : v_isolee = k ± m·√(a2·v_racine² + a1·v_racine + a0).
// ============================================================================

/** Écran 1 → `equationAuCarre` (texte libre, équivalence seule). Écran 2 → `formeCompletee` (texte
 * libre, garde structurelle légère — un seul carré parfait explicite en `variableRacine`). Écran 3
 * → `nature` (choix, restreint à {ellipse,hyperbole}×{horizontal,vertical}) + `formeStandard`
 * (texte libre, équivalence seule). Écran 4 → `elements`. */
export interface ExerciceConiqueC {
  famille: "C";
  variableRacine: "x" | "y";
  variableIsolee: "x" | "y";
  /** Constante isolée à gauche (`v_isolee = k ± m·√(...)`). */
  k: number;
  /** Coefficient devant la racine — toujours strictement positif, JAMAIS égal à 1 (sinon la
   * branche ellipse dégénérerait en cercle, hors du choix {ellipse,hyperbole} de l'écran 3).
   * Toujours une fraction simple `mNum/mDen` (affichage — jamais un décimal, CLAUDE.md). */
  m: number;
  mNum: number;
  mDen: number;
  /** `+1` : signe "+" devant la racine dans l'énoncé ; `-1` : signe "-". N'affecte jamais la
   * classification (disparaît à l'élévation au carré) — porté uniquement pour l'affichage fidèle
   * de l'énoncé. */
  signeRacine: 1 | -1;
  /** Centre de la variable sous la racine (`v_racine - h`, au carré une fois complété). */
  h: number;
  /** `-1` : expression sous la racine `r²-(v-h)²` (ellipse) ; `+1` : `(v-h)²-r²` (hyperbole) — LE
   * seul élément qui distingue les 2 natures (voir mission, piège central famille C). */
  s: -1 | 1;
  r: number;
  /** Expression sous la racine développée (avant complétion) : `a2·v²+a1·v+a0`, `a2=s`. */
  a2: number;
  a1: number;
  a0: number;
  /** Constante résiduelle après complétion du carré sur `variableRacine` : `a0-a2·h²` — vaut
   * exactement `r²` (ellipse, `s=-1`) ou `-r²` (hyperbole, `s=+1`) par construction. */
  c0: number;
  centre: Point;
  /** Forme canonique assemblée pour l'écran 3 ("forme standard") : `coeffX(x-h')²+coeffY(y-k')²=M`
   * — PRÉ-CALCULÉE ici (jamais recalculée côté `moteur6e/`, convention transversale du contrat, voir
   * en-tête de fichier) à partir de `variableRacine`/`m`/`s`/`c0`, réordonnée en x/y selon
   * `variableRacine`. Alimente directement `classifierConiqueCentree`/`elementsConiqueCentree`
   * (`generateurs6e/identificationConiques/classification.ts`) pour produire `nature`/`elements`
   * ci-dessous — la MÊME fonction de classification que les familles A/B, voir son en-tête. */
  coeffX: number;
  coeffY: number;
  M: number;
  nature: NatureConique;
  elements: ElementsConiqueCentree;
}

export type ExerciceIdentificationConiques = ExerciceConiqueA | ExerciceConiqueB | ExerciceConiqueC;
export type FamilleIdentificationConiques = ExerciceIdentificationConiques["famille"];
