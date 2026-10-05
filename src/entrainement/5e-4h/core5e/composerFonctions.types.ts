/**
 * Couche core (5e) — contrat propre à `5gen3` ("Composer f et g — expressions et domaines").
 * Indépendant de tout contrat 4e — voir CLAUDE.md, "Chantier 5e FWB (4h)".
 *
 * f et g sont chacune l'une des 4 familles "composables" de 5gen1 (rationnelle/irrationnelleSimple/
 * racineSurFraction/fractionSousRacine — jamais pasDeCE ni racineImpaireDenominateur, peu porteuses
 * ici). `FonctionComposable` porte UNIQUEMENT les données algébriques nécessaires à évaluer et à
 * composer f/g — un extrait, pas une réutilisation directe des types `ExerciceXxx` de 5gen1 (pensés
 * pour un exercice de CE autonome, pas pour la composition).
 *
 * REFONTE D.1-D.5 (`promptcorrectionsregroupees.md`, partie D) — remplace ENTIÈREMENT le modèle
 * d'origine (toujours f∘g ET g∘f, +15% variante bonus "g=f", écran "comparaison" fixe) :
 * - D.1 : 10 combinaisons de familles (4 mêmes-famille + 6 familles-différentes) × 3 sous-variantes
 *   de sens ÉQUIPONDÉRÉES (f∘g seul / g∘f seul / les deux) — jamais la variante bonus "g=f", retirée
 *   entièrement (`gEstF`/`domainesIdentiques` supprimés du contrat).
 * - D.2 : l'écran "comparaison" (dom(f∘g) et dom(g∘f) identiques ?) est supprimé ENTIÈREMENT, jamais
 *   seulement sauté conditionnellement.
 * - D.4 : chaque DIRECTION de composition (f∘g, g∘f) pilote son PROPRE pipeline d'écrans,
 *   INDÉPENDAMMENT de l'autre — la richesse du pipeline dépend UNIQUEMENT de la fonction INTÉRIEURE
 *   (celle appliquée en premier), jamais de l'extérieure : `CompositionDirigee.riche`.
 *
 *   Richesse = intérieure CONTIENT UNE RACINE, c'est-à-dire intérieure ∈ {irrationnelleSimple,
 *   racineSurFraction, fractionSousRacine} — jamais `rationnelle`, qui n'a aucune racine à isoler
 *   (`generateurs5e/composerFonctions/composition.ts::estRiche`). **Correctif**
 *   (`promptcorrections5gen3bugs.md`, bug 1) : la version d'origine de D.4 restreignait riche au
 *   seul cas `interieure === "irrationnelleSimple"` — un ÉCART ASSUMÉ documenté comme tel, mais qui
 *   s'est révélé être un vrai bug (les 2 autres familles à racine traitaient à tort le pipeline
 *   "simple", sautant les écrans B/C1/C2 qui auraient dû apparaître). La cible de l'écran C2
 *   (`domaineApresCarreDeConditions`, `composition.ts`) réutilise désormais DIRECTEMENT
 *   `resoudreConditionSeuil` (`solveur.ts`) — le solveur général déjà partagé par le pipeline
 *   "simple" (`xTelQueGDansDomF`/`domaineCompose`), déjà cross-vérifié pour les 4 familles
 *   (`solveur.test.ts`) — plutôt qu'une dérivation polynomiale valable pour `irrationnelleSimple`
 *   seule : `sqrt(U)/V ◇ seuil` (racineSurFraction) exige un branchement interne sur le signe de V,
 *   `sqrt(N/D) ◇ seuil` (fractionSousRacine) se ramène en interne à une inéquation RATIONNELLE
 *   `N/D ◇ seuil²` — les deux déjà gérés par `resoudreConditionSeuil`, jamais réimplémentés ici.
 *
 *   Séquence par direction :
 *   - simple (intérieure === rationnelle, la seule famille sans racine) : **A → D** (A = construire
 *     l'expression composée ; D = domaine final directement, comme avant la refonte).
 *   - riche (intérieure ∈ {irrationnelleSimple, racineSurFraction, fractionSousRacine}) :
 *     **A → B → C1 → C2 → D**
 *     - A = construire l'expression composée (inchangé).
 *     - B = poser la/les condition(s) `intérieure(x) ◇ seuil` imposées par le domaine de
 *       l'extérieure (1 condition si extérieure ∈ {rationnelle, irrationnelleSimple}, 2 si
 *       extérieure ∈ {racineSurFraction, fractionSousRacine} — voir `conditionsExterieurSurG`,
 *       `composition.ts`), TOUJOURS combinées par ET (jamais par OU — preuve : préimage d'une
 *       intersection = intersection des préimages, valable pour n'importe quelle fonction).
 *     - C1 = poser et résoudre la contrainte de validité qui accompagne toute élévation au carré
 *       d'une racine — le domaine PROPRE de l'intérieure elle-même (= `interieure.domaine`, déjà
 *       connu — la valeur PÉDAGOGIQUE de cet écran est de le faire réécrire/résoudre explicitement
 *       par l'élève, jamais de recalculer une nouvelle donnée). Une seule condition pour
 *       `irrationnelleSimple` (le radicande ≥ 0) ; deux conditions INDÉPENDANTES pour
 *       `racineSurFraction` (radicande ≥ 0 ET dénominateur ≠ 0) ; une condition RATIONNELLE pour
 *       `fractionSousRacine` (le quotient ≥ 0).
 *     - C2 = élever chaque condition de B au carré et résoudre, déjà combinées en UN SEUL
 *       `EnsembleReelGuide` (`domaineApresCarre`, précalculé via `resoudreConditionSeuil` — B ne
 *       pose jamais plus de 2 conditions et elles sont toujours combinées par ET, voir plus haut).
 *     - D = domaine final — intersection de C1 et C2 (mathématiquement IDENTIQUE à `domaine`,
 *       calculé une seule fois via `domaineCompose`, jamais recalculé séparément pour le riche —
 *       voir la preuve dans `composition.ts`).
 */
import type { EnsembleReelGuide, Polynome } from "./domaineDefinition.types";

export type FonctionComposable =
  | { type: "rationnelle"; numerateur: Polynome; denominateur: Polynome }
  | { type: "irrationnelleSimple"; radicande: Polynome }
  | { type: "racineSurFraction"; radicande: Polynome; denominateur: Polynome }
  | { type: "fractionSousRacine"; numerateur: Polynome; denominateur: Polynome };

export interface DonneeFonction {
  fonction: FonctionComposable;
  /** "f(x) = ..." (avec préfixe), pour affichage direct. */
  latex: string;
  /** UNIQUEMENT le membre de droite, en LaTeX — sert de brique de substitution pour composer une
   * fonction dans une autre (toujours réinjecté entre `\left(...\right)`, jamais tel quel : un
   * corps non parenthésé comme "x-5" substitué nu dans un terme "2·variable" donnerait à tort
   * "2x-5" au lieu de "2(x-5)"). */
  corpsLatex: string;
  /** UNIQUEMENT le membre de droite, syntaxe `evaluerExpressionGenerale` (4e, réutilisée
   * cross-chantier) — même principe de parenthésage que `corpsLatex` à la substitution. */
  formule: string;
  domaine: EnsembleReelGuide;
}

/** Comparateur de seuil (`x ◇ seuil`), même 6 valeurs que `solveur.ts::Comparateur` (dupliqué ici
 * plutôt qu'importé — `src/core5e/` ne dépend jamais de `src/generateurs5e/`, seule direction
 * autorisée par l'architecture). */
export type ComparateurSeuil = "eq" | "ne" | "ge" | "gt" | "le" | "lt";

/** Une condition posée sur `interieure(x)` par le domaine de la fonction EXTÉRIEURE (écran B,
 * riche uniquement) — "g(x) ◇ seuil", `seuil` TOUJOURS strictement positif par construction (voir
 * `composition.ts`, contrainte de génération qui garantit une élévation au carré non-triviale à
 * l'écran C2). */
export interface ConditionSurG {
  comparateur: ComparateurSeuil;
  seuil: number;
}

/**
 * Une seule DIRECTION de composition (f∘g OU g∘f) — porte tout ce qui pilote son PROPRE pipeline
 * d'écrans, INDÉPENDAMMENT de l'autre direction (D.4).
 */
export interface CompositionDirigee {
  /** fonction appliquée en PREMIER (celle dont la richesse dépend). */
  interieure: DonneeFonction;
  /** nom de l'intérieure ("f" pour g∘f, "g" pour f∘g) — évite de comparer des références d'objet
   * côté présentation. */
  nomInterieure: "f" | "g";
  /** fonction appliquée en DERNIER (dont le domaine impose les conditions de l'écran B). */
  exterieure: DonneeFonction;
  formule: string;
  latex: string;
  /** riche ssi l'intérieure contient une racine (`irrationnelleSimple`/`racineSurFraction`/
   * `fractionSousRacine`) — voir la note d'en-tête de ce fichier. */
  riche: boolean;
  /** Conditions posées par le domaine de l'extérieure sur `interieure(x)` (écran B) — TOUJOURS
   * combinées par ET. Tableau VIDE pour "simple" (écran B absent de la séquence). */
  conditions: ConditionSurG[];
  /** Cible de l'écran C2 (riche uniquement) — intersection des `conditions` déjà élevées au carré
   * (`U(x) ◇ seuil²` pour chacune). `null` pour "simple". */
  domaineApresCarre: EnsembleReelGuide | null;
  /** Domaine FINAL de la composition — `interieure.domaine ∩ {x : interieure(x) ∈
   * dom(exterieure)}`, déjà résolu (réutilise `domaineCompose`, jamais recalculé côté élève) —
   * cible de l'écran D, dans les 2 pipelines (simple et riche). */
  domaine: EnsembleReelGuide;
}

export type SensComposition = "fRondG" | "gRondF" | "lesDeux";

export interface ExerciceComposerFonctions {
  f: DonneeFonction;
  g: DonneeFonction;
  sens: SensComposition;
  /** f∘g — présent ssi `sens !== "gRondF"`. */
  fRondG: CompositionDirigee | null;
  /** g∘f — présent ssi `sens !== "fRondG"`. */
  gRondF: CompositionDirigee | null;
}

export type GenerateurExerciceComposerFonctions = () => ExerciceComposerFonctions;
