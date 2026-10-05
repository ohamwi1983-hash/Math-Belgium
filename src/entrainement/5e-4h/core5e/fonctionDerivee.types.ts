/**
 * Couche core (5e) — contrat pour 5gen27 ("Fonction dérivée"), 3e générateur du chapitre "Dérivées
 * et applications", à la suite de 5gen26. Type pur, aucune logique.
 *
 * `AtomeDerivable` est le bloc de construction UNIQUE des 4 familles : un monôme/racine/trig,
 * optionnellement composé avec une fonction intérieure LINÉAIRE (`interieurA*x+interieurB`,
 * `interieurA=1,interieurB=0` ⟺ pas de composition, l'intérieure est x lui-même). Valeur en x :
 * u=interieurA*x+interieurB ; monome(n) → coeff*u^n ; racine → coeff*sqrt(u) ; trig(sin) →
 * coeff*sin(u) ; trig(cos) → coeff*cos(u).
 */
export type NoyauDerivable = { type: "monome"; exposant: number } | { type: "racine" } | { type: "trig"; fonction: "sin" | "cos" };

export interface AtomeDerivable {
  noyau: NoyauDerivable;
  /** Coefficient multiplicatif, jamais nul. */
  coeff: number;
  /** interieurA=1 ET interieurB=0 ⟺ pas de composition (l'intérieure est x lui-même). */
  interieurA: number;
  interieurB: number;
}

/** Les 4 lectures structurelles possibles d'une dérivée — un exercice peut en accepter PLUSIEURS
 * à la fois (voir `typesAcceptes` ci-dessous, cas ambigu quotient-ou-composée). */
export type TypeDerivee = "reglebase" | "produit" | "quotient" | "composee";

/** Décomposition attendue pour un type donné — LaTeX pur, jamais de logique de vérification ici
 * (la vérification recalcule ses propres cibles numériques depuis les champs de l'exercice,
 * jamais en reparsant ce LaTeX). `tolereEchangeUV` : true UNIQUEMENT pour "produit" (u·v=v·u,
 * commutatif) — "quotient" reste toujours sensible à l'ordre (`tolereEchangeUV=false`). */
export type DecompositionAttendue =
  | { type: "produitOuQuotient"; uLatex: string; vLatex: string; tolereEchangeUV: boolean }
  | { type: "composee"; interieurLatex: string; exterieurLatexEnU: string };

interface ExerciceFonctionDeriveeBase {
  /** Types acceptés comme réponse correcte à l'écran "reconnaissance" — longueur 1 pour
   * "reglebase"/"produit"/"composee" et pour un "quotient" NON ambigu, longueur 2
   * (`["quotient","composee"]`) pour le cas ambigu délibéré f(x)=1/(trig(ax+b))². */
  typesAcceptes: TypeDerivee[];
  /** Une entrée par type de `typesAcceptes` — vide pour "reglebase" (écran "decomposer" alors
   * entièrement sauté), une entrée pour les 3 autres familles non ambiguës, DEUX entrées
   * ("quotient" ET "composee") pour le cas ambigu. */
  decompositions: Partial<Record<TypeDerivee, DecompositionAttendue>>;
}

/** Famille 1 — somme de 2-3 `AtomeDerivable`, TOUS avec intérieure triviale (interieurA=1,
 * interieurB=0) : jamais de règle de chaîne ici, chaque terme se dérive indépendamment via les
 * dérivées connues (xⁿ/√x/1/xⁿ/sin x/cos x). `typesAcceptes` toujours `["reglebase"]`,
 * `decompositions` toujours `{}`. */
export interface ExerciceFonctionDeriveeReglebase extends ExerciceFonctionDeriveeBase {
  famille: "reglebase";
  atomes: AtomeDerivable[];
}

/** Famille 2 — f(x)=atome1(x)·atome2(x), deux `AtomeDerivable` INDÉPENDANTS. `typesAcceptes`
 * toujours `["produit"]`. */
export interface ExerciceFonctionDeriveeProduit extends ExerciceFonctionDeriveeBase {
  famille: "produit";
  atome1: AtomeDerivable;
  atome2: AtomeDerivable;
}

/** Famille 3 — f(x)=atome1(x)/atome2(x) (ordre significatif, u/v jamais commutatif) OU, cas
 * ambigu délibéré (`ambigu:true`), f(x)=1/(trig(ax+b))² — admet DEUX lectures structurelles
 * valides (`quotient` : u=1, v=trig(ax+b)² ; `composee` : extérieure u↦u⁻², intérieure
 * x↦trig(ax+b)), `typesAcceptes` alors `["quotient","composee"]` et `decompositions` porte les
 * DEUX entrées correspondantes. */
export type ExerciceFonctionDeriveeQuotient =
  | (ExerciceFonctionDeriveeBase & { famille: "quotient"; ambigu: false; atome1: AtomeDerivable; atome2: AtomeDerivable })
  | (ExerciceFonctionDeriveeBase & { famille: "quotient"; ambigu: true; trig: "sin" | "cos"; a: number; b: number });

/** Famille 4 — f(x)=UN SEUL `AtomeDerivable`, intérieure OBLIGATOIREMENT non triviale
 * (interieurA≠1 OU interieurB≠0) : cette famille exige toujours la règle de chaîne, déjà
 * intégrée dans la formule de dérivée fermée de `AtomeDerivable` (voir `generateurs5e/
 * fonctionDerivee/index.ts`). `typesAcceptes` toujours `["composee"]`. */
export interface ExerciceFonctionDeriveeComposee extends ExerciceFonctionDeriveeBase {
  famille: "composee";
  atome: AtomeDerivable;
}

export type ExerciceFonctionDerivee = ExerciceFonctionDeriveeReglebase | ExerciceFonctionDeriveeProduit | ExerciceFonctionDeriveeQuotient | ExerciceFonctionDeriveeComposee;

export type GenerateurExerciceFonctionDerivee = () => ExerciceFonctionDerivee;
