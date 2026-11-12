/**
 * Couche core (5e) — contrat propre à `5gen5` ("Problèmes-contexte"). Contrairement à 5gen1-4, ce
 * générateur n'est PAS une famille paramétrée abstraite unique : un tirage aléatoire parmi 3
 * SCÉNARIOS FIXES ET DISTINCTS (A/B/C), chacun testant une compétence différente, chacun avec sa
 * propre séquence d'écrans — voir CLAUDE.md, section 5gen5, pour la justification de ce choix
 * (« ne pas unifier leur architecture »). Indépendant de tout contrat 4e.
 */

// ============================================================================
// Scénario A — intersection de 2 familles de fonctions f(x)=g(x), extremum de (f+g). 2 COMBOS
// (audit 5e ch. 1, décision I : les combos k√x/b−ax, k/x²/ax et « deux paraboles » ont été RETIRÉS —
// leurs contextes additionnaient des grandeurs de nature différente, (f+g) n'y avait aucun sens).
// Le combo de référence (`kInverseXAxCarre`, bidons cylindriques V=πr²h) garde son flux complet à
// 5 écrans ; `stockCommande` utilise un flux réduit à 3 écrans (généralisation → intersection →
// extremum), avec un tableau de relevés chiffrés qui permet d'écrire f et g.
// ============================================================================

export type ComboScenarioA = "kInverseXAxCarre" | "stockCommande";

export interface LigneTableauScenarioA {
  r: number;
  hAttendu: number;
  aireBasesAttendue: number;
  aireLateraleAttendue: number;
}

/** Contexte narratif du combo de référence — un objet cylindrique concret (bassin de 10 entrées,
 * jamais partagé avec l'autre combo). `nomObjetIndefini`/`nomObjetDefini` PRÉ-ÉCRITS avec leur
 * article déjà accordé (ex. "une boîte de conserve" / "la boîte de conserve") — jamais d'accord
 * grammatical recalculé au runtime (convention transversale, voir CLAUDE.md). */
export interface ContexteConteneurA {
  id: string;
  nomObjetIndefini: string;
  nomObjetDefini: string;
}

/** Contexte narratif du combo réduit `stockCommande` — bassin de 10 entrées. `intro` mentionne f et
 * g en toutes lettres (jamais recomposée depuis des fragments séparés) ; `labelF`/`labelG` sont des
 * groupes nominaux courts réutilisés dans les consignes/aides suivantes ; `unite` est l'unité de la
 * variable x. */
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
  /** 2 relevés chiffrés (x, f(x), g(x)) affichés à l'élève — SEULE source pour écrire f et g (audit
   * 5e ch. 1 : l'écran demandait f(x) et g(x) sans aucun nombre). x ≠ xIntersection (sinon le
   * relevé donnerait directement la réponse de l'écran suivant), valeurs entières. */
  releves: { x: number; f: number; g: number }[];
  xIntersection: number;
  xExtremum: number;
  /** borne supérieure du domaine affiché — calculée à la génération (voir
   * `generateurs5e/problemesContexte/scenarioA.ts`), jamais recalculée côté présentation. */
  xMax: number;
}

export type ExerciceScenarioA = ExerciceScenarioAConteneur | ExerciceScenarioAStockCommande;

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
  /** coût unitaire EXACT (au plus 2 décimales — audit 5e ch. 1 : l'ancien arrondi à l'entier
   * faisait résoudre le système vers des a/b faux, parfois négatifs ou nuls). */
  coutUnitaire: number;
}

export interface ExerciceScenarioB {
  scenario: "B";
  modele: ModeleCoutUnitaire;
  contexte: ContexteScenarioB;
  point1: PointRevele;
  point2: PointRevele;
  /** a/b tirés à la génération (entiers strictement positifs) — jamais montrés à l'élève. */
  aVrai: number;
  bVrai: number;
  /** a/b attendus — les points révélés étant EXACTS, le système redonne exactement aVrai/bVrai
   * (champs conservés sous ce nom pour l'écran « résolution » et la feuille papier). */
  aArrondiAttendu: number;
  bArrondiAttendu: number;
  /** 2 valeurs d'évaluation finale (écran 4), différentes de point1.x/point2.x. */
  xEval1: number;
  xEval2: number;
}

// ============================================================================
// Scénario C — Coûts d'une entreprise (CF, CV(x), CP=mx, CT, CA(x)). Les données chiffrées viennent
// d'un TABLEAU de valeurs ; le graphe ne sert plus qu'à reconnaître l'allure de CV/CP et à lire le
// seuil de rentabilité (seule vraie lecture graphique). 2 dimensions tirées
// indépendamment : CV parmi 4 formes (racineCarree/racineCubique/carre/cube), CA parmi 3 formes
// (affine/racineCarree/racineCubique) — 12 combinaisons, voir `generateurs5e/problemesContexte/scenarioC.ts`.
// ============================================================================

export type FormeCoutVariableC = "racineCarree" | "racineCubique" | "carre" | "cube";
export type FormeChiffreAffairesC = "affine" | "racineCarree" | "racineCubique";

/** Une ligne du tableau de valeurs du scénario C (milliers d'euros, valeurs ARRONDIES au centième
 * telles qu'affichées — elles font foi pour la vérification, audit 5e ch. 1 : plus de lectures
 * graphiques au demi-millier près). */
export interface LigneTableauC {
  x: number;
  cv: number;
  cp: number;
  ca: number;
}

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
  /** Tableau de valeurs affiché (x = 1, xLecture, xBenefice, triés) — CF n'y figure pas (constant,
   * donné à part). */
  tableau: LigneTableauC[];
}

export type ExerciceProblemeContexte = ExerciceScenarioA | ExerciceScenarioB | ExerciceScenarioC;

export type GenerateurExerciceProblemeContexte = () => ExerciceProblemeContexte;
