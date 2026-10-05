/**
 * Couche core (5e) — contrat propre à `5gen5` ("Problèmes-contexte"). Contrairement à 5gen1-4, ce
 * générateur n'est PAS une famille paramétrée abstraite unique : un tirage aléatoire parmi 3
 * SCÉNARIOS FIXES ET DISTINCTS (A/B/C), chacun testant une compétence différente, chacun avec sa
 * propre séquence d'écrans — voir CLAUDE.md, section 5gen5, pour la justification de ce choix
 * (« ne pas unifier leur architecture »). Indépendant de tout contrat 4e.
 */

// ============================================================================
// Scénario A — intersection de 2 familles de fonctions f(x)=g(x), extremum de (f+g). 5 COMBOS
// possibles pour la nature de f/g — voir `generateurs5e/problemesContexte/scenarioA.ts`. Le combo
// de référence (`kInverseXAxCarre`, bidons cylindriques V=πr²h) garde son flux complet à 5 écrans
// (tableau → généralisation → égalité des aires → graphique → justification, seul combo avec une
// GRANDEUR LIÉE physique — le diamètre égale la hauteur au rayon optimal) ; les 4 autres combos
// utilisent un flux réduit à 3 écrans (généralisation → intersection → extremum, jamais de grandeur
// liée artificielle — voir CLAUDE.md section 5gen5).
// ============================================================================

export type ComboScenarioA = "kInverseXAxCarre" | "stockCommande" | "racineAffine" | "intensiteCable" | "deuxParaboles";

export interface LigneTableauScenarioA {
  r: number;
  hAttendu: number;
  aireBasesAttendue: number;
  aireLateraleAttendue: number;
}

/** Contexte narratif du combo de référence — un objet cylindrique concret (bassin de 10 entrées,
 * jamais partagé avec les 4 autres combos). `nomObjetIndefini`/`nomObjetDefini` PRÉ-ÉCRITS avec leur
 * article déjà accordé (ex. "une boîte de conserve" / "la boîte de conserve") — jamais d'accord
 * grammatical recalculé au runtime (convention transversale, voir CLAUDE.md). */
export interface ContexteConteneurA {
  id: string;
  nomObjetIndefini: string;
  nomObjetDefini: string;
}

/** Contexte narratif des 4 combos "réduits" (2-5) — un bassin de 10 entrées PAR combo (jamais
 * partagé entre eux). `intro` mentionne f et g en toutes lettres (jamais recomposée depuis des
 * fragments séparés) ; `labelF`/`labelG` sont des groupes nominaux courts réutilisés dans les
 * consignes/aides suivantes ; `unite` est l'unité de la variable x. */
export interface ContexteReduitA {
  id: string;
  intro: string;
  labelF: string;
  labelG: string;
  unite: string;
}

interface ExerciceScenarioABase {
  scenario: "A";
}

export interface ExerciceScenarioAConteneur extends ExerciceScenarioABase {
  combo: "kInverseXAxCarre";
  contexte: ContexteConteneurA;
  /** contenance de l'objet, en cm³ (V = πr²h) — TOUJOURS affichée explicitement (traçabilité). */
  volumeCm3: number;
  lignesTableau: LigneTableauScenarioA[];
  /** x tel que f(x)=g(x) (aire latérale = aire des bases) — PAS le rayon optimal, un calcul distinct. */
  xEgaliteAires: number;
  /** rayon qui minimise (f+g)(x) — calcul analytique (dérivée), jamais exigé de l'élève, sert
   * uniquement à évaluer sa lecture graphique à tolérance large. */
  xOptimal: number;
}

/** Combo 2 — f(x)=ax+b (coût de stockage, croissant) vs g(x)=k/x (coût de commande, décroissant) —
 * modèle classique de quantité économique de commande (EOQ), (f+g) admet un minimum unique par
 * construction (f affine croissante + g convexe décroissante). */
export interface ExerciceScenarioAStockCommande extends ExerciceScenarioABase {
  combo: "stockCommande";
  contexte: ContexteReduitA;
  a: number;
  b: number;
  k: number;
  xIntersection: number;
  xExtremum: number;
  /** borne supérieure du domaine affiché — calculée à la génération (voir
   * `generateurs5e/problemesContexte/scenarioA.ts`), jamais recalculée côté présentation. */
  xMax: number;
}

/** Combo 3 — f(x)=k√x (croissante, concave) vs g(x)=b-ax (décroissante affine) — (f+g) admet un
 * maximum unique par construction (concavité stricte). */
export interface ExerciceScenarioARacineAffine extends ExerciceScenarioABase {
  combo: "racineAffine";
  contexte: ContexteReduitA;
  k: number;
  a: number;
  b: number;
  xIntersection: number;
  xExtremum: number;
  xMax: number;
}

/** Combo 4 — f(x)=k/x² (intensité, décroissante convexe) vs g(x)=ax (coût de câble, croissant) —
 * (f+g) admet un minimum unique par construction. */
export interface ExerciceScenarioAIntensiteCable extends ExerciceScenarioABase {
  combo: "intensiteCable";
  contexte: ContexteReduitA;
  k: number;
  a: number;
  xIntersection: number;
  xExtremum: number;
  xMax: number;
}

/** Combo 5 — 2 paraboles f(x)=a1x²+b1x+c1, g(x)=a2x²+b2x+c2 (a1,a2>0, même sens d'ouverture) —
 * (f+g) est elle-même une parabole (a1+a2>0), extremum = son sommet. */
export interface ExerciceScenarioADeuxParaboles extends ExerciceScenarioABase {
  combo: "deuxParaboles";
  contexte: ContexteReduitA;
  a1: number;
  b1: number;
  c1: number;
  a2: number;
  b2: number;
  c2: number;
  xIntersection: number;
  xExtremum: number;
  xMax: number;
}

export type ExerciceScenarioA =
  | ExerciceScenarioAConteneur
  | ExerciceScenarioAStockCommande
  | ExerciceScenarioARacineAffine
  | ExerciceScenarioAIntensiteCable
  | ExerciceScenarioADeuxParaboles;

// ============================================================================
// Scénario B — Coût unitaire de production (cu(x)·x = F(x), système à 2 points). 5 MODÈLES
// possibles pour la forme de cu(x)/F(x) — voir `generateurs5e/problemesContexte/scenarioB.ts`
// (`coeffA`/`coeffB`) pour la généralisation qui les couvre tous d'un seul bloc de code.
// ============================================================================

export type ModeleCoutUnitaire = "B1" | "B2" | "B3" | "B4" | "B5";

/** Contexte narratif propre au scénario B — un bassin de 10 entrées PAR modèle (jamais un bassin
 * partagé entre les 5 modèles, voir `generateurs5e/problemesContexte/contextesScenarioB.ts`).
 * `sujet` est un groupe nominal complet ("la production de widgets"), jamais recomposé au runtime. */
export interface ContexteScenarioB {
  id: string;
  sujet: string;
  /** Nom court de la grandeur produite/vendue (ex. "objets", "puces", "litres") — pluriel, utilisé
   * après un nombre ("120 objets"). */
  unite: string;
}

export interface PointRevele {
  x: number;
  /** coût unitaire (déjà arrondi à l'entier, bruit réaliste du tableau source). */
  coutUnitaire: number;
}

export interface ExerciceScenarioB {
  scenario: "B";
  modele: ModeleCoutUnitaire;
  contexte: ContexteScenarioB;
  point1: PointRevele;
  point2: PointRevele;
  /** a/b "vrais" (tirés à la génération — jamais montrés à l'élève, la donnée visible reste les 2
   * points révélés + les valeurs qu'il calcule lui-même). */
  aVrai: number;
  bVrai: number;
  /** a/b arrondis attendus — dérivés de la résolution du système à partir des 2 points RÉVÉLÉS
   * (donc potentiellement différents de aVrai/bVrai, bruit de l'arrondi du tableau source). */
  aArrondiAttendu: number;
  bArrondiAttendu: number;
  /** 2 valeurs d'évaluation finale (écran 4), différentes de point1.x/point2.x. */
  xEval1: number;
  xEval2: number;
}

// ============================================================================
// Scénario C — Coûts d'une entreprise (CF, CV(x), CP=mx, CT, CA(x)). 2 dimensions tirées
// indépendamment : CV parmi 4 formes (racineCarree/racineCubique/carre/cube), CA parmi 3 formes
// (affine/racineCarree/racineCubique) — 12 combinaisons, voir `generateurs5e/problemesContexte/scenarioC.ts`.
// ============================================================================

export type FormeCoutVariableC = "racineCarree" | "racineCubique" | "carre" | "cube";
export type FormeChiffreAffairesC = "affine" | "racineCarree" | "racineCubique";

export interface ExerciceScenarioC {
  scenario: "C";
  formeCV: FormeCoutVariableC;
  formeCA: FormeChiffreAffairesC;
  cf: number;
  k: number;
  m: number;
  p: number;
  /** borne supérieure du domaine affiché (quantité maximale représentée sur le graphe). */
  xMax: number;
  /** quantité interrogée à l'écran 1 (lecture CF/CV/CP/CT). */
  xLecture: number;
  /** quantité interrogée à l'écran 4 (bénéfice). */
  xBenefice: number;
  /** seuil de rentabilité CA(x)=CT(x) — racine positive, calculée analytiquement. */
  xSeuil: number;
}

export type ExerciceProblemeContexte = ExerciceScenarioA | ExerciceScenarioB | ExerciceScenarioC;

export type GenerateurExerciceProblemeContexte = () => ExerciceProblemeContexte;
