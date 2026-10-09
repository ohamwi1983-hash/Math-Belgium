import type { ExerciceAireExcentriciteConique, ExerciceFamilleA, ExerciceFamilleB, FractionExacte } from "../core6e/aireExcentriciteConique.types";
import type { PhaseAireExcentriciteConique, ResultatExerciceAireExcentriciteConique } from "../moteur6e/typesAireExcentriciteConique";
import { phasesPourExercice } from "../moteur6e/typesAireExcentriciteConique";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage LaTeX pour `6gen60`. Dispatch sur
 * `exercice.famille` PUIS `phase` (famille B, en plus, sur `sousType`) — mirroir
 * `formatEquationConiqueCaracteristiques.ts` (6gen59), jamais importé par un autre générateur
 * (chaque générateur reste indépendant — CLAUDE.md).
 *
 * **`\approx` (macro LaTeX), jamais le caractère Unicode "≈"** — dans ET hors `\text{...}` : reste
 * cohérent avec le reste du fichier, tous les symboles mathématiques passant par leur macro KaTeX
 * dédiée plutôt qu'un caractère brut.
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
  minuscule?: boolean;
}

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

const AUCUNE_AIDE: AideAvecLatex = { texte: "", latex: null };

function champTexte(label: string, placeholder: string, minuscule = false): ChampDef {
  return { type: "texte", label, placeholder, minuscule };
}

// ============================================================================
// Petits formateurs numériques/LaTeX partagés.
// ============================================================================

function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

function afficherFraction(num: number, den: number): string {
  const g = pgcd(num, den);
  const n = num / g;
  const d = den / g;
  if (d === 1) return `${n}`;
  return n < 0 ? `-\\frac{${-n}}{${d}}` : `\\frac{${n}}{${d}}`;
}

function afficherFractionExacte(f: FractionExacte): string {
  return afficherFraction(f.num, f.den);
}

// ============================================================================
// Famille A — Aire du triangle foyer-point-foyer.
// ============================================================================

export function consigneGeneraleA(): string {
  return "On donne une ellipse et un point P de cette ellipse tel que |PF|=k·|PF'| (F,F' les foyers, k≠1 donné). Détermine les 2 rayons focaux, l'angle FPF', puis l'aire du triangle FPF'.";
}

export function blocDonneesA(e: ExerciceFamilleA): string[] {
  return [`\\frac{x^2}{${e.a * e.a}}+\\frac{y^2}{${e.b * e.b}}=1`, `|PF|=${afficherFractionExacte(e.k)}\\cdot|PF'|`];
}

export function consigneEcranA(_e: ExerciceFamilleA, phase: PhaseAireExcentriciteConique): string {
  if (phase === "aEcran1") return "Utilise la propriété |PF|+|PF'|=2a de l'ellipse, combinée au rapport k donné, pour trouver |PF| et |PF'| individuellement.";
  if (phase === "aEcran2") return "Calcule c²=a²-b², puis applique la loi des cosinus dans le triangle FPF' (avec |FF'|=2c) pour trouver cos(angle FPF').";
  return "Déduis sin(angle FPF') à partir de cos(angle FPF') CONFIRMÉ (l'angle est nécessairement dans ]0°;180°[), puis calcule l'aire du triangle FPF'.";
}

/** ACCUMULE les écrans déjà confirmés (correctif transversal — voir CLAUDE.md/`docs/historique-
 * 6e.md`, même bug déjà corrigé sur `formatIdentificationConiques.ts`, 6gen58) : `aEcran3` ne
 * montrait QUE l'info de `aEcran2`, jamais celle de `aEcran1`. Plus ancien en premier. */
export function etatActuelA(e: ExerciceFamilleA, phase: PhaseAireExcentriciteConique): string[] | null {
  const lignes: string[] = [];
  if (phase === "aEcran2" || phase === "aEcran3") {
    lignes.push(`|PF|=${afficherFractionExacte(e.pf)}\\text{, }|PF'|=${afficherFractionExacte(e.pfPrime)}\\text{ (confirmés, étape 1)}`);
  }
  if (phase === "aEcran3") lignes.push(`\\cos(\\widehat{FPF'})=${afficherFractionExacte(e.cosAngle)}\\text{ (confirmé, étape 2)}`);
  return lignes.length > 0 ? lignes : null;
}

export function champsA(_e: ExerciceFamilleA, phase: PhaseAireExcentriciteConique): ChampDef[] {
  if (phase === "aEcran1") return [champTexte("|PF| =", "ex : 20/3"), champTexte("|PF'| =", "ex : 10/3")];
  if (phase === "aEcran2") return [champTexte("cos(angle FPF') =", "ex : 11/25")];
  return [champTexte("Aire du triangle FPF' =", "ex : 9.98")];
}

export function niveauAideMaxA(phase: PhaseAireExcentriciteConique): number {
  return phase === "aEcran1" ? 2 : 0;
}

export function aideNiveau1A(): AideAvecLatex {
  return { texte: "Rappel : pour TOUT point P de l'ellipse, |PF|+|PF'|=2a. Combine cette relation avec le rapport k donné pour former un système à 2 équations, 2 inconnues.", latex: null };
}

export function aideNiveau2A(e: ExerciceFamilleA): AideAvecLatex {
  return { texte: "Système posé (résolution non faite) :", latex: `\\begin{cases}|PF|+|PF'|=${2 * e.a}\\\\|PF|=${afficherFractionExacte(e.k)}\\cdot|PF'|\\end{cases}` };
}

// ============================================================================
// Famille B — Excentricité depuis une condition géométrique.
// ============================================================================

/** Prose FRANÇAISE (rendue dans un `<p>`, jamais passée à KaTeX — voir `blocDonneesB` ci-dessous
 * pour la contrainte inverse) : c'est ICI, et seulement ici, qu'est explicitée en toutes lettres la
 * condition géométrique complète de chaque sous-type — `blocDonneesB` n'en garde qu'un recap
 * SYMBOLIQUE terse (contrainte de largeur mobile 375px, un `\text{...}` KaTeX ne s'enroulant
 * jamais). Un `<p>` s'enroule normalement quelle que soit sa longueur, donc aucune limite ici. */
export function consigneGeneraleB(e: ExerciceFamilleB): string {
  if (e.sousType === "abscisseFoyerParallele") {
    return "On donne un point P de l'ellipse ayant la même abscisse qu'un foyer F, tel que la droite (OP) soit parallèle à la droite joignant un sommet principal à un sommet secondaire. Traduis ces 2 conditions en une équation reliant a,b,c (ou directement e), puis résous pour l'excentricité e.";
  }
  if (e.sousType === "angleDroitSommetSecondaire") {
    return "On donne B, un sommet de l'axe secondaire d'une ellipse (foyers F,F'), tel que l'angle FBF' soit droit. Traduis cette condition en une équation reliant a,b,c (ou directement e), puis résous pour l'excentricité e.";
  }
  return "On donne une ellipse dont la distance entre les 2 directrices vaut k fois la distance entre les 2 foyers (k donné). Traduis cette condition en une équation reliant a,b,c (ou directement e), puis résous pour l'excentricité e.";
}

/** Recap SYMBOLIQUE terse — voir en-tête `consigneGeneraleB` ci-dessus pour la répartition
 * prose/symbolique. Phrases volontairement COURTES : un `\text{...}` KaTeX ne se scinde jamais sur
 * plusieurs lignes, une phrase trop longue déborde silencieusement du cadre mobile (375px), un
 * conteneur interne `overflow-x:auto` absorbant le débordement SANS jamais faire remonter
 * `document.body.scrollWidth` (piège trouvé par inspection visuelle d'une capture 375px, même
 * piège que `blocDonneesC`/`blocDonneesD`, 6gen59 — voir CLAUDE.md). */
export function blocDonneesB(e: ExerciceFamilleB): string[] {
  if (e.sousType === "abscisseFoyerParallele") return [`x_P=x_F\\text{ (même abscisse)}`, `OP\\parallel(\\text{sommets ppal/sec})`];
  if (e.sousType === "angleDroitSommetSecondaire") return [`B(0;b)\\text{ (sommet sec.)}`, `\\widehat{FBF'}=90°`];
  return [`D(\\text{directrices})=k\\cdot D(\\text{foyers})`, `k=${e.k}`];
}

export function consigneEcranB(_e: ExerciceFamilleB, phase: PhaseAireExcentriciteConique): string {
  if (phase === "bEcran1") return "Traduis la condition géométrique donnée en une équation reliant a, b, c (ou directement e).";
  return "Résous l'équation CONFIRMÉE de l'étape précédente pour l'excentricité e.";
}

function formatEquationRelationLatex(e: ExerciceFamilleB): string {
  if (e.sousType === "abscisseFoyerParallele") return "b=c";
  if (e.sousType === "angleDroitSommetSecondaire") return "a^2=2c^2";
  return `\\frac{2a}{e}=${e.k}\\cdot 2ae`;
}

export function etatActuelB(e: ExerciceFamilleB, phase: PhaseAireExcentriciteConique): string[] | null {
  if (phase === "bEcran2") return [`${formatEquationRelationLatex(e)}\\text{ (confirmée)}`];
  return null;
}

export function champsB(_e: ExerciceFamilleB, phase: PhaseAireExcentriciteConique): ChampDef[] {
  if (phase === "bEcran1") return [champTexte("Équation posée =", "ex : b=c")];
  return [champTexte("e =", "ex : 0.71")];
}

export function niveauAideMaxB(e: ExerciceFamilleB, phase: PhaseAireExcentriciteConique): number {
  if (phase !== "bEcran1") return 0;
  return e.sousType === "abscisseFoyerParallele" ? 0 : 2;
}

export function aideNiveau1B(e: ExerciceFamilleB): AideAvecLatex {
  if (e.sousType === "angleDroitSommetSecondaire") {
    return { texte: "Rappel : tout sommet de l'axe secondaire est à distance a de chaque foyer — propriété caractéristique de l'ellipse, à utiliser directement, sans recalcul.", latex: null };
  }
  if (e.sousType === "distanceDirectrices") {
    return { texte: `Rappel des formules : distance entre les directrices=2a/e ; distance entre les foyers=2ae — à relier via le rapport donné (k=${e.k}).`, latex: null };
  }
  return AUCUNE_AIDE;
}

export function aideNiveau2B(e: ExerciceFamilleB): AideAvecLatex {
  if (e.sousType === "angleDroitSommetSecondaire") {
    return { texte: "Triangle rectangle isocèle identifié (les 2 côtés égaux valent a), relation de Pythagore non posée :", latex: "|BF|=|BF'|=a" };
  }
  if (e.sousType === "distanceDirectrices") {
    // Les 2 formules restent en PROSE (`texte`, s'enroule normalement) plutôt qu'en KaTeX combiné
    // sur une ligne — un `\text{...}` KaTeX ne s'enroule jamais, débordement silencieux garanti au
    //-delà d'une certaine longueur sur mobile 375px (même piège que `blocDonneesB` ci-dessus). Une
    // seule formule COURTE en `latex` (`D(directrices)=2a/e`), l'autre restant textuelle.
    return { texte: "Rappelées séparément (équation combinée non posée) : distance directrices=2a/e, distance foyers=2ae.", latex: "D(\\text{directrices})=\\frac{2a}{e}" };
  }
  return AUCUNE_AIDE;
}

// ============================================================================
// Dispatch commun.
// ============================================================================

export function consigneGenerale(exercice: ExerciceAireExcentriciteConique): string {
  return exercice.famille === "A" ? consigneGeneraleA() : consigneGeneraleB(exercice);
}

export function blocDonnees(exercice: ExerciceAireExcentriciteConique): string[] {
  return exercice.famille === "A" ? blocDonneesA(exercice) : blocDonneesB(exercice);
}

export function consigneEcran(exercice: ExerciceAireExcentriciteConique, phase: PhaseAireExcentriciteConique): string {
  return exercice.famille === "A" ? consigneEcranA(exercice, phase) : consigneEcranB(exercice, phase);
}

export function etatActuel(exercice: ExerciceAireExcentriciteConique, phase: PhaseAireExcentriciteConique): string[] | null {
  return exercice.famille === "A" ? etatActuelA(exercice, phase) : etatActuelB(exercice, phase);
}

export function champsEcran(exercice: ExerciceAireExcentriciteConique, phase: PhaseAireExcentriciteConique): ChampDef[] {
  return exercice.famille === "A" ? champsA(exercice, phase) : champsB(exercice, phase);
}

export function niveauAideMaxEcran(exercice: ExerciceAireExcentriciteConique, phase: PhaseAireExcentriciteConique): number {
  return exercice.famille === "A" ? niveauAideMaxA(phase) : niveauAideMaxB(exercice, phase);
}

export function aideNiveau1(exercice: ExerciceAireExcentriciteConique, phase: PhaseAireExcentriciteConique): AideAvecLatex {
  if (niveauAideMaxEcran(exercice, phase) === 0) return AUCUNE_AIDE;
  return exercice.famille === "A" ? aideNiveau1A() : aideNiveau1B(exercice);
}

export function aideNiveau2(exercice: ExerciceAireExcentriciteConique, phase: PhaseAireExcentriciteConique): AideAvecLatex {
  if (niveauAideMaxEcran(exercice, phase) === 0) return AUCUNE_AIDE;
  return exercice.famille === "A" ? aideNiveau2A(exercice) : aideNiveau2B(exercice);
}

export const LIBELLE_PHASE: Record<PhaseAireExcentriciteConique, string> = {
  aEcran1: "Étape 1 (rayons focaux |PF|,|PF'|)",
  aEcran2: "Étape 2 (cos de l'angle FPF')",
  aEcran3: "Étape 3 (aire du triangle)",
  bEcran1: "Étape 1 (équation posée)",
  bEcran2: "Étape 2 (excentricité e)",
};

export const LIBELLE_FAMILLE: Record<ExerciceAireExcentriciteConique["famille"], string> = {
  A: "A — Aire du triangle foyer-point-foyer",
  B: "B — Excentricité depuis une condition géométrique",
};

/** Excentricité, en LaTeX — fraction exacte quand `k` (sous-type `distanceDirectrices`) est un
 * carré parfait (`e=1/√k` alors rationnel), décimal approché (`\approx`) sinon — mirroir la
 * distinction déjà actée en Couche core (`excentricite` reste un `number` générique, jamais forcé
 * en fraction, voir en-tête `core6e/aireExcentriciteConique.types.ts`). */
function formatExcentriciteLatex(e: ExerciceFamilleB): string {
  if (e.sousType !== "distanceDirectrices") return `e=\\frac{\\sqrt{2}}{2}\\approx${e.excentricite.toFixed(4)}`;
  const k = e.k as number;
  const racine = Math.sqrt(k);
  if (Number.isInteger(racine)) return `e=${afficherFraction(1, racine)}`;
  return `e=\\frac{1}{\\sqrt{${k}}}\\approx${e.excentricite.toFixed(4)}`;
}

/** Récapitulatif final : affiche toujours la réponse CORRECTE connue de l'exercice — jamais
 * recalculée depuis la saisie élève. */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceAireExcentriciteConique, phase: PhaseAireExcentriciteConique): string[] {
  if (exercice.famille === "A") {
    if (phase === "aEcran1") return [`|PF|=${afficherFractionExacte(exercice.pf)}\\text{, }|PF'|=${afficherFractionExacte(exercice.pfPrime)}`];
    if (phase === "aEcran2") return [`\\cos(\\widehat{FPF'})=${afficherFractionExacte(exercice.cosAngle)}`];
    return [`\\text{Aire}\\approx${exercice.aire.toFixed(2)}`];
  }
  if (phase === "bEcran1") return [formatEquationRelationLatex(exercice)];
  return [formatExcentriciteLatex(exercice)];
}

/** Total points du récapitulatif final — maximum VARIABLE (100 × nombre d'écrans réellement
 * traversés par CET exercice). */
export function calculerTotalPointsAireExcentriciteConique(resultat: ResultatExerciceAireExcentriciteConique): { total: number; maximum: number } {
  const phases = phasesPourExercice(resultat.exercice);
  const total = phases.reduce((acc, phase) => acc + (resultat.scores[phase] ?? 0), 0);
  return { total, maximum: phases.length * 100 };
}
