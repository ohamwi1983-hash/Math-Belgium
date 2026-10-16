/**
 * Couche core — "Équations/inéquations du second degré en contexte" (position 57). SANS AUCUNE
 * dépendance vers gen55 ("Problèmes d'optimisation") ou `core/optimisation.types.ts`.
 *
 * **4 architectures distinctes** (demande explicite : ne pas se limiter à "f(x) donnée, pose
 * f(x)=k, résous" avec simplement un habillage narratif différent — un vrai type de problème
 * différent, pas un skin) :
 * - **A — "fonction donnée"** (`jetEau`/`consommationCarburant`/`populationPoissons`) : `f(x)`
 *   DIRECTEMENT révélée dans l'énoncé (formule développée visible). Séquence à 4 écrans :
 *   `poserEquationInequation → resoudre → validation → interpretation`.
 * - **B — "construction géométrique"** (`rectanglePerimetre`/`enclosAdosseMur`) : AUCUNE formule
 *   révélée — seulement les données géométriques (périmètre/longueur de clôture fixés) et le seuil
 *   visé. L'élève doit construire lui-même `f(x)` avant de poser l'équation/l'inéquation. Mêmes 4
 *   écrans que A (réutilisés tels quels — seule la quantité d'information révélée dans l'énoncé
 *   change, pas le mécanisme de vérification).
 * - **C — "problèmes de nombres classiques"** (`produitEntiersConsecutifs`/`carreMoinsNombre`) :
 *   aucun contexte physique, une relation verbale entre un entier naturel et lui-même (produit de 2
 *   entiers consécutifs, carré diminué du nombre...). Construction DIFFÉRENTE de A/B (pas de sommet
 *   positif confortable — le "sommet" de ces équations est toujours proche de 0 ou négatif, une
 *   seule racine est physiquement valable, voir `generateurs/.../problemeNombre.ts`) mais mêmes 4
 *   écrans.
 * - **D — "système à 2 inconnues réduit par substitution"** (`sommeProduit`/`perimetreAire`) :
 *   l'énoncé donne littéralement 2 relations entre 2 grandeurs (x et y) — l'élève pose le système,
 *   PUIS isole une variable et substitue pour obtenir une équation à une inconnue, PUIS résout comme
 *   A/B/C. Séquence à 6 écrans : `poserSysteme → isolerSubstituer → resoudre → validation →
 *   interpretation`. `voieSysteme`/`systeme` non `null` ssi cette architecture (voir
 *   `generateurs/.../systemeSubstitution.ts`).
 *
 * Toutes les 9 familles supportent les 2 variantes (`equation`/`inequation`), tirées aléatoirement.
 */

export type VarianteEquationInequationSecondDegre = "equation" | "inequation";

export type FamilleEquationInequationSecondDegre =
  // A — fonction donnée
  | "jetEau"
  | "consommationCarburant"
  | "populationPoissons"
  // B — construction géométrique
  | "rectanglePerimetre"
  | "enclosAdosseMur"
  // C — problèmes de nombres classiques
  | "produitEntiersConsecutifs"
  | "carreMoinsNombre"
  // D — système à 2 inconnues réduit par substitution
  | "sommeProduit"
  | "perimetreAire";

export interface IntervalleBorne {
  inf: number;
  sup: number;
}

/** `f(x) = a·x² + b·x + c` — coefficients développés, jamais la forme sommet (celle-ci ne sert
 * qu'à la CONSTRUCTION, voir `generateurs/equationInequationSecondDegre/vertexForm.ts`). Type
 * local minimal, délibérément dupliqué depuis `core/optimisation.types.ts::CoefficientsQuadratiques`
 * (structure triviale à 3 champs, trop petite pour justifier un couplage inter-générateurs — même
 * principe que `generateurs/.../aleatoire.ts`, "dupliqué, pas partagé"). */
export interface CoefficientsQuadratiques {
  a: number;
  b: number;
  c: number;
}

export type GenreGrandeur = "masculin" | "feminin";

/** Croquis SVG purement illustratif (architecture B/D uniquement — voir
 * `components/CroquisEquationInequationSecondDegre.tsx`) : coordonnées FIXES par variante, jamais
 * recalculées depuis l'instance réelle (même principe que `CroquisOptimisation.tsx`, gen55 —
 * composant INDÉPENDANT, jamais réutilisé depuis ce générateur, cohérent avec "SANS AUCUNE
 * dépendance vers gen55" en tête de ce fichier). `undefined` pour les familles sans figure
 * géométrique naturelle (A "fonction donnée", C "nombres", D `sommeProduit`). */
export type CroquisEquationInequationSecondDegre = { type: "rectanglePerimetre" } | { type: "enclosAdosseMur" } | { type: "perimetreAire" };

/** Toutes les données narratives — `phraseEnonce` NE révèle PAS toujours `f(x)` développée
 * (architectures B/C/D, voir en-tête de fichier) : seules les données nécessaires à sa
 * CONSTRUCTION par l'élève y figurent. `questionFinale` reste `null` ici (toujours une chaîne
 * vide) : la VRAIE question finale est `ExerciceEquationInequationCommun.questionFinale`
 * ci-dessous, affichée séparément et en permanence (`components/QuestionFinale.tsx`). */
export interface ContexteEquationInequationSecondDegre {
  phraseEnonce: string;
  labelVariable: string;
  nomVariable: string;
  nomGrandeur: string;
  genreGrandeur: GenreGrandeur;
  uniteVariable: string;
  uniteGrandeur: string;
  uniteGrandeurFautive: string;
  questionFinale: null;
  croquis?: CroquisEquationInequationSecondDegre;
}

export interface BaseEquationInequationSecondDegre {
  contexte: ContexteEquationInequationSecondDegre;
  fonction: CoefficientsQuadratiques;
  domaine: IntervalleBorne;
}

export interface OptionInterpretationEquationInequation {
  texte: string;
  correcte: boolean;
}

/** Architecture D uniquement (`voieSysteme`) — les 2 relations littérales entre `x` et `y` que
 * l'élève doit poser à l'écran "poserSysteme", vérifiées via `diagnostiquerEquivalenceQuadratiqueXY`
 * (moteur→moteur, `verificationEquationCercle.ts`) ancrée au point `(x0,y0)` — une solution réelle
 * du système, qui satisfait les 2 relations par construction. `cible1`/`cible2` sont les fonctions
 * `(x,y) => 0` correspondant à chaque relation (ex. `(x,y) => x+y-S` pour "la somme vaut S"). */
export interface SystemeEquationInequation {
  label1: string;
  label2: string;
  x0: number;
  y0: number;
  cible1: (x: number, y: number) => number;
  cible2: (x: number, y: number) => number;
}

interface ExerciceEquationInequationCommun {
  famille: FamilleEquationInequationSecondDegre;
  base: BaseEquationInequationSecondDegre;
  /** Seuil introduit à l'écran "poserEquationInequation"/"isolerSubstituer". */
  k: number;
  /** `true` ssi architecture D (`sommeProduit`/`perimetreAire`) — voir en-tête de fichier. */
  voieSysteme: boolean;
  /** Non `null` ssi `voieSysteme`. */
  systeme: SystemeEquationInequation | null;
  optionsInterpretation: OptionInterpretationEquationInequation[];
  /** Question finale de l'exercice (ex. "Pour quelle valeur de x le bénéfice vaut-il exactement
   * 450 € ?"), affichée PERSISTANTE sur tous les écrans — toujours une chaîne réelle. */
  questionFinale: string;
}

/** `variante: "equation"` — `racinesCandidates` a TOUJOURS exactement 2 éléments triés croissant
 * (discriminant strictement positif par construction) ; `racinesValides` = le sous-ensemble (0, 1
 * ou 2) qui tombe dans `base.domaine`. */
export interface ExerciceEquationSecondDegre extends ExerciceEquationInequationCommun {
  variante: "equation";
  racinesCandidates: [number, number];
  racinesValides: number[];
}

/** `variante: "inequation"` — `sens` fixé PAR FAMILLE (cohérent avec l'orientation de la parabole,
 * jamais tiré aléatoirement) : `"gt"` pour une parabole concave (f(x)>k = intervalle borné entre
 * les racines), `"lt"` pour une parabole convexe (f(x)<k = intervalle borné entre les racines).
 * `intervalleBrut` = solution de l'inéquation sur R (toujours un intervalle BORNÉ par
 * construction) ; `intervalleValide` = intersection avec `base.domaine`, TOUJOURS non vide par
 * construction. */
export interface ExerciceInequationSecondDegre extends ExerciceEquationInequationCommun {
  variante: "inequation";
  sens: "gt" | "lt";
  intervalleBrut: IntervalleBorne;
  intervalleValide: IntervalleBorne;
}

export type ExerciceEquationInequationSecondDegre = ExerciceEquationSecondDegre | ExerciceInequationSecondDegre;

export type GenerateurExerciceEquationInequationSecondDegre = () => ExerciceEquationInequationSecondDegre;
