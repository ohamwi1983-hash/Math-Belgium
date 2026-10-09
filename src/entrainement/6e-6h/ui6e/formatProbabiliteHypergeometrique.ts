import type { ExerciceHypergeoA, ExerciceHypergeoB, ExerciceHypergeoC, ExerciceProbabiliteHypergeometrique } from "../core6e/probabiliteHypergeometrique.types";
import type { PhaseProbabiliteHypergeometrique, ResultatExerciceProbabiliteHypergeometrique } from "../moteur6e/typesProbabiliteHypergeometrique";
import { phasesPourExercice } from "../moteur6e/typesProbabiliteHypergeometrique";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage LaTeX pour `6gen47`. Dispatch sur
 * `exercice.famille` PUIS `phase`, mirroir `formatDenombrementFondamental.ts` (6gen43), jamais
 * importé par un autre générateur (chaque générateur reste indépendant — CLAUDE.md).
 *
 * **Vigilance signe orphelin / groupe LaTeX vide / texte français en mode maths** (bug déjà
 * rencontré et corrigé sur plusieurs générateurs 6e, documenté par CLAUDE.md) — toute clause en
 * français mêlée à du LaTeX passe TOUJOURS par `\text{...}`, jamais du texte brut en mode maths.
 * Couverture de régression : `formatProbabiliteHypergeometrique.test.ts`.
 */

export type TypeChamp = "texte" | "choix";

export interface OptionChoix {
  valeur: string;
  label: string;
}

export interface ChampDef {
  type: TypeChamp;
  label: string;
  placeholder?: string;
  options?: OptionChoix[];
}

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

const AUCUNE_AIDE: AideAvecLatex = { texte: "", latex: null };
const ANNONCE_TOLERANCE = "(forme exacte ou décimale arrondie au centième)";

function champTexte(label: string, placeholder: string): ChampDef {
  return { type: "texte", label, placeholder };
}

function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) [a, b] = [b, a % b];
  return a || 1;
}

/** Fraction irréductible LaTeX pour un rationnel EXACT num/den — jamais de décimal (CLAUDE.md),
 * mirroir `ui6e/formatProbabilitesEnsembles.ts` (6gen30) — fichier PROPRE à ce générateur (pas de
 * pgcd/fraction partagé documenté entre générateurs 6e, chacun garde le sien). */
export function formatFractionLatex(num: number, den: number): string {
  if (num === 0) return "0";
  const g = pgcd(num, den);
  const n = num / g;
  const d = den / g;
  return d === 1 ? `${n}` : `\\dfrac{${n}}{${d}}`;
}

// ============================================================================
// Famille A — Hypergéométrique de base.
// ============================================================================

export function consigneGeneraleA(): string {
  return "On tire au hasard, sans remise, un échantillon dans une population divisée en 2 catégories (succès/échecs). Calcule la probabilité d'obtenir exactement le nombre de succès demandé, à l'aide de la formule hypergéométrique.";
}

function descriptionK(e: ExerciceHypergeoA): string[] {
  if (e.sousType === "aucun") return [`k=0`, `\\text{(aucun succès parmi les ${e.n} tirages)}`];
  if (e.sousType === "tous") return [`k=n=${e.n}`, `\\text{(tous les tirages sont des succès)}`];
  return [`k=${e.k}`, `\\text{(exactement ${e.k} succès)}`];
}

/** Une DONNÉE (variable=valeur) par ligne, JAMAIS accolée à sa description française sur la même
 * ligne (convention `.equation-box-donnees`, `App.css` : "listant plusieurs DONNÉES DISTINCTES...
 * jamais côte à côte, toujours une par ligne") — `.equation-box .katex` est agrandi à `1.3em`, une
 * ligne mêlant `VAR=valeur` ET une parenthèse française dépasse largement un viewport mobile (piège
 * trouvé par inspection visuelle réelle — voir devlog). */
export function blocDonneesA(e: ExerciceHypergeoA): string[] {
  return [
    ...e.contexte.phraseContexte,
    `N=${e.N}`,
    `\\text{(nombre total de ${e.contexte.labelPopulation})}`,
    `K=${e.K}`,
    `\\text{(nombre de ${e.contexte.labelSucces})}`,
    `n=${e.n}`,
    `\\text{(nombre de ${e.contexte.labelTirage})}`,
    ...descriptionK(e),
  ];
}

export function consigneEcranA(phase: PhaseProbabiliteHypergeometrique): string {
  // Notation C(K,k)/C(N−K,n−k)/C(N,n) NON convertie en Unicode indice/exposant : K et N sont des
  // paramètres MAJUSCULES (convention hypergéométrique), or l'ensemble Unicode indice/exposant
  // disponible (voir CLAUDE.md/piège notation combinatoire) ne couvre QUE des lettres minuscules —
  // aucun équivalent Unicode n'existe pour un K ou un N en indice/exposant, contrairement à
  // `etatActuelA`/`aideNiveau2A` ci-dessous qui affichent la même formule en vrai KaTeX (sans cette
  // limite, `_{K}`/`^{k}` fonctionnent avec n'importe quelle casse).
  if (phase === "aEcran1") return "Pose la formule hypergéométrique P(k succès) = C(K,k)·C(N−K,n−k)/C(N,n) — calcule chaque coefficient binomial toi-même et utilise ses valeurs numériques dans l'expression (une fraction non réduite est acceptée, inutile de la simplifier).";
  return "Calcule la valeur de cette probabilité, à partir de la formule CORRECTE de l'étape précédente.";
}

export function etatActuelA(e: ExerciceHypergeoA, phase: PhaseProbabiliteHypergeometrique): string[] | null {
  if (phase !== "aEcran2") return null;
  // Formule et annotation "(confirmée)" séparées en 2 fragments plutôt que combinées en un seul —
  // une formule à fraction (`\dfrac`) est déjà large ; y coller une clause française pousse le
  // fragment total au-delà de la largeur d'un écran mobile (piège CLAUDE.md/6gen43).
  return [`P(k=${e.k})=\\dfrac{C_{${e.K}}^{${e.k}}\\cdot C_{${e.N - e.K}}^{${e.n - e.k}}}{C_{${e.N}}^{${e.n}}}`, "\\text{(formule confirmée)}"];
}

export function champsA(phase: PhaseProbabiliteHypergeometrique): ChampDef[] {
  if (phase === "aEcran1") return [champTexte("Formule (valeur numérique) =", "ex : 6*35/120")];
  return [champTexte("P(k succès) =", `ex : 0,3 ${ANNONCE_TOLERANCE}`)];
}

export function niveauAideMaxA(phase: PhaseProbabiliteHypergeometrique): number {
  return phase === "aEcran1" ? 2 : 0;
}

export function aideNiveau1A(): AideAvecLatex {
  return { texte: "Rappel de la structure de la formule : (façons de choisir les k succès parmi les K disponibles) × (façons de choisir les n−k échecs parmi les N−K disponibles), le tout divisé par (façons de choisir n éléments parmi N au total).", latex: null };
}

export function aideNiveau2A(e: ExerciceHypergeoA): AideAvecLatex {
  return { texte: "Numérateur (les deux facteurs), dénominateur non posé :", latex: `C_{${e.K}}^{${e.k}}\\cdot C_{${e.N - e.K}}^{${e.n - e.k}}` };
}

// ============================================================================
// Famille B — Contraste ordre vs composition.
// ============================================================================

function libelleCouleur(c: "c1" | "c2"): string {
  return c === "c1" ? "1" : "2";
}

const ORDINAL_TIRAGE = ["1ᵉʳ", "2ᵉ", "3ᵉ"];

export function consigneGeneraleB(): string {
  return "On tire successivement, sans remise, 3 boules d'une urne à 2 couleurs. Compare la probabilité d'une séquence précise (dans un ordre donné) à la probabilité de la même composition (mêmes couleurs), sans tenir compte de l'ordre.";
}

/** Une DONNÉE (variable=valeur) par ligne, jamais accolée à sa description française — même
 * convention que `blocDonneesA` (voir son commentaire) : `.equation-box .katex` agrandi à `1.3em`,
 * une ligne mêlant `VAR=valeur` et du texte français déborde largement un viewport mobile (piège
 * trouvé par inspection visuelle réelle — voir devlog). */
export function blocDonneesB(e: ExerciceHypergeoB): string[] {
  return [
    "\\text{Une urne contient des boules de 2 couleurs,}",
    "\\text{tirées successivement, sans remise.}",
    `n_1=${e.n1}`,
    "\\text{(boules de couleur 1)}",
    `n_2=${e.n2}`,
    "\\text{(boules de couleur 2)}",
    `N=${e.N}`,
    "\\text{(boules au total)}",
    "\\text{Séquence exacte tirée :}",
    ...e.sequence.map((c, i) => `\\text{${ORDINAL_TIRAGE[i]} tirage : couleur ${libelleCouleur(c)}}`),
  ];
}

export function consigneEcranB(phase: PhaseProbabiliteHypergeometrique): string {
  if (phase === "bEcran1") return "Calcule la probabilité d'obtenir EXACTEMENT cette séquence, dans cet ordre précis (produit de fractions qui diminuent à chaque tirage, tirage après tirage).";
  if (phase === "bEcran2") return "Calcule la probabilité d'obtenir cette même composition (mêmes couleurs, dans n'importe quel ordre) — formule hypergéométrique.";
  return "Le rapport entre les 2 valeurs CONFIRMÉES des étapes précédentes est exactement égal au nombre d'arrangements distincts de cette séquence. Calcule ce rapport, puis ce nombre d'arrangements (indépendamment, par le calcul combinatoire).";
}

export function etatActuelB(e: ExerciceHypergeoB, phase: PhaseProbabiliteHypergeometrique): string[] | null {
  // Formule et "(confirmé)" séparés en 2 fragments — même raison que `etatActuelA` (voir son
  // commentaire) : `P(...)=` + une fraction est déjà large en `1.3em`.
  if (phase === "bEcran2") return [`P(\\text{séq.})=${formatFractionLatex(e.numerateurSequence, e.denominateurSequence)}`, "\\text{(confirmé)}"];
  if (phase === "bEcran3") {
    return [`P(\\text{séq.})=${formatFractionLatex(e.numerateurSequence, e.denominateurSequence)}`, `P(\\text{comp.})=${formatFractionLatex(e.numerateurComposition, e.denominateurComposition)}`, "\\text{(2 valeurs confirmées)}"];
  }
  return null;
}

export function champsB(phase: PhaseProbabiliteHypergeometrique): ChampDef[] {
  if (phase === "bEcran1") return [champTexte("P(séquence exacte) =", `ex : 0,08 ${ANNONCE_TOLERANCE}`)];
  if (phase === "bEcran2") return [champTexte("P(composition) =", `ex : 0,4 ${ANNONCE_TOLERANCE}`)];
  return [champTexte("Rapport (composition/séquence) =", "ex : 3"), champTexte("Nombre d'arrangements de la séquence =", "ex : 3")];
}

export function niveauAideMaxB(phase: PhaseProbabiliteHypergeometrique): number {
  return phase === "bEcran3" ? 2 : 0;
}

export function aideNiveau1B(): AideAvecLatex {
  return { texte: "Un tirage sans remise donne EXACTEMENT la même probabilité à chaque ordre spécifique d'une même composition. La probabilité de la composition est donc la SOMME de ces probabilités toutes égales, c'est-à-dire le nombre d'arrangements fois la probabilité d'un seul ordre.", latex: null };
}

export function aideNiveau2B(e: ExerciceHypergeoB): AideAvecLatex {
  return { texte: "Nombre d'arrangements distincts de cette composition (calcul combinatoire) — le lien avec le rapport des 2 étapes précédentes reste à faire :", latex: `${e.nombreArrangements}` };
}

// ============================================================================
// Famille C — Hypergéométrique à 2 catégories croisées (loto + bonus).
// ============================================================================

export function consigneGeneraleC(): string {
  return "Un tirage de loto sélectionne des numéros principaux ET, indépendamment, des numéros bonus. Calcule la probabilité d'avoir exactement le nombre demandé de bons numéros dans CHAQUE catégorie, puis combine les 2 résultats.";
}

/** Une DONNÉE (variable=valeur) par ligne — même convention que `blocDonneesA` (voir son
 * commentaire) : jamais 2 variables ni une variable+parenthèse française sur la même ligne. */
export function blocDonneesC(e: ExerciceHypergeoC): string[] {
  return [
    "\\text{Un tirage de loto sélectionne des numéros}",
    "\\text{principaux ET des numéros bonus,}",
    "\\text{indépendamment l'un de l'autre.}",
    `N_1=${e.principal.N}`,
    `K_1=${e.principal.K}`,
    "\\text{(principaux cochés)}",
    `n_1=${e.principal.n}`,
    `k_1=${e.principal.k}`,
    `N_2=${e.bonus.N}`,
    `K_2=${e.bonus.K}`,
    "\\text{(bonus cochés)}",
    `n_2=${e.bonus.n}`,
    `k_2=${e.bonus.k}`,
  ];
}

export function consigneEcranC(phase: PhaseProbabiliteHypergeometrique): string {
  if (phase === "cEcran1") return "Calcule l'hypergéométrique de la catégorie PRINCIPALE : P(k₁ bons numéros parmi les n₁ tirés).";
  if (phase === "cEcran2") return "Calcule l'hypergéométrique de la catégorie BONUS, INDÉPENDAMMENT de la première : P(k₂ bons numéros bonus parmi les n₂ tirés).";
  return "Multiplie les 2 résultats CONFIRMÉS des étapes précédentes pour obtenir la probabilité combinée (les 2 tirages sont indépendants).";
}

export function etatActuelC(e: ExerciceHypergeoC, phase: PhaseProbabiliteHypergeometrique): string[] | null {
  // Formule et "(confirmé)" séparés en 2 fragments — même raison que `etatActuelA` (voir son
  // commentaire).
  if (phase === "cEcran2") return [`P_1=${formatFractionLatex(e.principal.numerateur, e.principal.denominateur)}`, "\\text{(confirmé)}"];
  if (phase === "cEcran3") {
    return [`P_1=${formatFractionLatex(e.principal.numerateur, e.principal.denominateur)}`, `P_2=${formatFractionLatex(e.bonus.numerateur, e.bonus.denominateur)}`, "\\text{(2 valeurs confirmées)}"];
  }
  return null;
}

export function champsC(phase: PhaseProbabiliteHypergeometrique): ChampDef[] {
  if (phase === "cEcran1") return [champTexte("P₁(k₁ numéros principaux) =", `ex : 0,2 ${ANNONCE_TOLERANCE}`)];
  if (phase === "cEcran2") return [champTexte("P₂(k₂ numéros bonus) =", `ex : 0,3 ${ANNONCE_TOLERANCE}`)];
  return [champTexte("P(combinée) =", `ex : 0,06 ${ANNONCE_TOLERANCE}`)];
}

export function niveauAideMaxC(phase: PhaseProbabiliteHypergeometrique): number {
  return phase === "cEcran3" ? 2 : 0;
}

export function aideNiveau1C(): AideAvecLatex {
  return { texte: "2 tirages INDÉPENDANTS se combinent en MULTIPLIANT leurs probabilités (jamais en les additionnant).", latex: null };
}

export function aideNiveau2C(e: ExerciceHypergeoC): AideAvecLatex {
  return { texte: "Les 2 valeurs confirmées, produit non fait :", latex: `${formatFractionLatex(e.principal.numerateur, e.principal.denominateur)}\\cdot ${formatFractionLatex(e.bonus.numerateur, e.bonus.denominateur)}` };
}

// ============================================================================
// Dispatch commun.
// ============================================================================

export function consigneGenerale(exercice: ExerciceProbabiliteHypergeometrique): string {
  switch (exercice.famille) {
    case "A":
      return consigneGeneraleA();
    case "B":
      return consigneGeneraleB();
    case "C":
      return consigneGeneraleC();
  }
}

export function blocDonnees(exercice: ExerciceProbabiliteHypergeometrique): string[] {
  switch (exercice.famille) {
    case "A":
      return blocDonneesA(exercice);
    case "B":
      return blocDonneesB(exercice);
    case "C":
      return blocDonneesC(exercice);
  }
}

export function consigneEcran(exercice: ExerciceProbabiliteHypergeometrique, phase: PhaseProbabiliteHypergeometrique): string {
  switch (exercice.famille) {
    case "A":
      return consigneEcranA(phase);
    case "B":
      return consigneEcranB(phase);
    case "C":
      return consigneEcranC(phase);
  }
}

export function etatActuel(exercice: ExerciceProbabiliteHypergeometrique, phase: PhaseProbabiliteHypergeometrique): string[] | null {
  switch (exercice.famille) {
    case "A":
      return etatActuelA(exercice, phase);
    case "B":
      return etatActuelB(exercice, phase);
    case "C":
      return etatActuelC(exercice, phase);
  }
}

export function champsEcran(exercice: ExerciceProbabiliteHypergeometrique, phase: PhaseProbabiliteHypergeometrique): ChampDef[] {
  switch (exercice.famille) {
    case "A":
      return champsA(phase);
    case "B":
      return champsB(phase);
    case "C":
      return champsC(phase);
  }
}

export function niveauAideMaxEcran(exercice: ExerciceProbabiliteHypergeometrique, phase: PhaseProbabiliteHypergeometrique): number {
  switch (exercice.famille) {
    case "A":
      return niveauAideMaxA(phase);
    case "B":
      return niveauAideMaxB(phase);
    case "C":
      return niveauAideMaxC(phase);
  }
}

export function aideNiveau1(exercice: ExerciceProbabiliteHypergeometrique, phase: PhaseProbabiliteHypergeometrique): AideAvecLatex {
  if (niveauAideMaxEcran(exercice, phase) === 0) return AUCUNE_AIDE;
  switch (exercice.famille) {
    case "A":
      return aideNiveau1A();
    case "B":
      return aideNiveau1B();
    case "C":
      return aideNiveau1C();
  }
}

export function aideNiveau2(exercice: ExerciceProbabiliteHypergeometrique, phase: PhaseProbabiliteHypergeometrique): AideAvecLatex {
  if (niveauAideMaxEcran(exercice, phase) === 0) return AUCUNE_AIDE;
  switch (exercice.famille) {
    case "A":
      return aideNiveau2A(exercice);
    case "B":
      return aideNiveau2B(exercice);
    case "C":
      return aideNiveau2C(exercice);
  }
}

export const LIBELLE_PHASE: Record<PhaseProbabiliteHypergeometrique, string> = {
  aEcran1: "Étape 1 (formule posée)",
  aEcran2: "Étape 2 (calcul)",
  bEcran1: "Étape 1 (probabilité de la séquence exacte)",
  bEcran2: "Étape 2 (probabilité de la composition)",
  bEcran3: "Étape 3 (rapport et arrangements)",
  cEcran1: "Étape 1 (catégorie principale)",
  cEcran2: "Étape 2 (catégorie bonus)",
  cEcran3: "Étape 3 (probabilité combinée)",
};

export const LIBELLE_FAMILLE: Record<ExerciceProbabiliteHypergeometrique["famille"], string> = {
  A: "A — Hypergéométrique de base",
  B: "B — Ordre vs composition",
  C: "C — Catégories croisées (loto + bonus)",
};

/** Récapitulatif final : affiche toujours la réponse CORRECTE connue de l'exercice, en fraction
 * exacte — jamais recalculée depuis la saisie élève, jamais de décimal (CLAUDE.md). */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceProbabiliteHypergeometrique, phase: PhaseProbabiliteHypergeometrique): string[] {
  if (exercice.famille === "A") {
    return [formatFractionLatex(exercice.numerateurFacteur1 * exercice.numerateurFacteur2, exercice.denominateur)];
  }
  if (exercice.famille === "B") {
    if (phase === "bEcran1") return [formatFractionLatex(exercice.numerateurSequence, exercice.denominateurSequence)];
    if (phase === "bEcran2") return [formatFractionLatex(exercice.numerateurComposition, exercice.denominateurComposition)];
    return [`${exercice.nombreArrangements}\\text{ (rapport et nombre d'arrangements)}`];
  }
  // famille C
  if (phase === "cEcran1") return [formatFractionLatex(exercice.principal.numerateur, exercice.principal.denominateur)];
  if (phase === "cEcran2") return [formatFractionLatex(exercice.bonus.numerateur, exercice.bonus.denominateur)];
  return [formatFractionLatex(exercice.numerateurCombine, exercice.denominateurCombine)];
}

/** Total points du récapitulatif final — maximum VARIABLE (100 × nombre d'écrans réellement
 * traversés par CET exercice) — mirroir `calculerTotalPointsDenombrementFondamental` (6gen43). */
export function calculerTotalPointsProbabiliteHypergeometrique(resultat: ResultatExerciceProbabiliteHypergeometrique): { total: number; maximum: number } {
  const phases = phasesPourExercice(resultat.exercice);
  const total = phases.reduce((acc, phase) => acc + (resultat.scores[phase] ?? 0), 0);
  return { total, maximum: phases.length * 100 };
}
