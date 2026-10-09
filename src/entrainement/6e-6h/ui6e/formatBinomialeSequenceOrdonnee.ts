import type { ExerciceBinomialeA, ExerciceBinomialeB, ExerciceBinomialeSequenceOrdonnee, StrategieBinomialeA } from "../core6e/binomialeSequenceOrdonnee.types";
import { coefficientBinomial } from "../generateurs6e/combinatoire";
import type { PhaseBinomialeSequenceOrdonnee, ResultatExerciceBinomialeSequenceOrdonnee } from "../moteur6e/typesBinomialeSequenceOrdonnee";
import { phasesPourExercice } from "../moteur6e/typesBinomialeSequenceOrdonnee";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage LaTeX pour `6gen48`. Dispatch sur
 * `exercice.famille` PUIS `phase`, mirroir `formatDenombrementFondamental.ts` (6gen43), jamais
 * importé par un autre générateur (chaque générateur reste indépendant — CLAUDE.md).
 *
 * **Vigilance signe orphelin / groupe LaTeX vide / texte français en mode maths** — toute clause en
 * français mêlée à du LaTeX passe TOUJOURS par `\text{...}`, jamais du texte brut en mode maths.
 * Couverture de régression : `formatBinomialeSequenceOrdonnee.test.ts`, scan sur de nombreux
 * tirages aléatoires à la recherche d'un `++`/`+-`/`--`/groupe `{}` vide.
 *
 * `p` (famille A) est toujours DÉCIMAL en interne (`0.2`...`0.8`) mais toujours AFFICHÉ sous forme
 * de FRACTION irréductible (convention transversale CLAUDE.md, "jamais de décimal pour toute valeur
 * générée par la plateforme") — voir `FRACTIONS_P` ci-dessous, table statique car `p` est toujours
 * tiré d'un ensemble FIXE de candidats (`generateurs6e/binomialeSequenceOrdonnee/familleA.ts`).
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

/** Annonce de tolérance pour tout champ de PROBABILITÉ décimale de la famille A (`diagnostiquerValeur`,
 * `moteur6e/verificationProbabilites.ts`, tolérance `0,01`) — même texte standard que
 * `formatProbabiliteHypergeometrique.ts` (6gen47, même chapitre) et le reste du chapitre 8
 * (6gen30/33) : annonce la tolérance RÉELLEMENT vérifiée côté `diagnostiquerXxx` (convention
 * transversale CLAUDE.md, "Annonce de précision"), jamais utilisée pour la famille B (fractions
 * EXACTES, `diagnostiquerProduitFinal`) ni pour les champs entiers (k, dénominateurs). */
const ANNONCE_TOLERANCE = "(forme exacte ou décimale arrondie au centième)";

function champTexte(label: string, placeholder: string): ChampDef {
  return { type: "texte", label, placeholder };
}

/** Vérifié empiriquement par capture d'écran Playwright à 375px (mobile) — pas seulement par
 * comptage de caractères : la leçon `docs/historique-6e.md` héritée de 6gen43 ("la cinquantaine de
 * caractères") documentait un débordement mesuré sur desktop ; à 375px, une entrée de 50 caractères
 * en `\text{}` (police KaTeX ~1.3em) déborde ENCORE de `.equation-box`, tronquée symétriquement des
 * 2 côtés (texte centré + `overflow-x:auto`, la position de scroll par défaut reste centrée sur
 * mobile plutôt que ramenée au bord gauche — ni "Un footba" ni "e succès" ne restaient visibles).
 * Seuil resserré à 28 caractères après ce constat, revérifié capture à l'appui (0 débordement). */
const LONGUEUR_MAX_LIGNE = 28;

/** Découpe un texte français long en PLUSIEURS entrées `string[]` — piège documenté CLAUDE.md/
 * 6gen43 : un fragment KaTeX est rendu en `white-space: nowrap` (interne à KaTeX, indépendant de
 * `\text{...}`), donc UNE SEULE entrée du tableau `blocDonnees` déborde `.equation-box` au-delà
 * d'un certain nombre de caractères (voir `LONGUEUR_MAX_LIGNE` ci-dessus) — même en répartissant
 * plusieurs `\text{...}` DANS la même entrée, ça ne change rien : le rendu reste sur UNE seule ligne
 * tant que c'est le même appel KaTeX. Seule une répartition sur PLUSIEURS entrées de tableau
 * (chacune son propre appel KaTeX, `.equation-box-donnees` étant déjà en `flex-direction: column`)
 * évite le débordement. Découpe aux frontières de MOTS uniquement (jamais au milieu d'un mot). Les
 * contextes narratifs de `generateurs6e/binomialeSequenceOrdonnee/familleA.ts`/`familleB.ts`
 * dépassent tous ce seuil — ce découpage s'applique donc systématiquement à `contexte.texte` dans
 * `blocDonneesA`/`blocDonneesB` ci-dessous. */
function decouperEnFragmentsTexte(texte: string): string[] {
  const mots = texte.split(" ");
  const lignes: string[] = [];
  let courante = "";
  for (const mot of mots) {
    const candidate = courante === "" ? mot : `${courante} ${mot}`;
    if (candidate.length > LONGUEUR_MAX_LIGNE && courante !== "") {
      lignes.push(courante);
      courante = mot;
    } else {
      courante = candidate;
    }
  }
  if (courante !== "") lignes.push(courante);
  return lignes.map((ligne) => `\\text{${ligne}}`);
}

const FRACTIONS_P: Record<string, string> = {
  "0.5": "\\dfrac{1}{2}",
  "0.2": "\\dfrac{1}{5}",
  "0.3": "\\dfrac{3}{10}",
  "0.4": "\\dfrac{2}{5}",
  "0.6": "\\dfrac{3}{5}",
  "0.7": "\\dfrac{7}{10}",
  "0.8": "\\dfrac{4}{5}",
};
function formatP(p: number): string {
  return FRACTIONS_P[`${p}`] ?? `${p}`;
}

/** Décimal EXACT (jamais arrondi de façon trompeuse — `p` a toujours un dénominateur divisant 10,
 * donc `p^k(1-p)^{n-k}` a toujours une écriture décimale FINIE en au plus `n` décimales). */
function formatDecimalExact(v: number): string {
  const s = v.toFixed(10).replace(/0+$/, "").replace(/\.$/, "");
  return s === "" || s === "-" ? "0" : s;
}

const LIBELLE_STRATEGIE: Record<StrategieBinomialeA, string> = {
  termeUnique: "un seul terme",
  somme: "une somme de plusieurs termes",
  complement: "un complément (1 moins un terme)",
};

function estEcran1A(phase: PhaseBinomialeSequenceOrdonnee): boolean {
  return phase === "aTermeUniqueEcran1" || phase === "aSommeEcran1" || phase === "aComplementEcran1";
}
function estEcran2A(phase: PhaseBinomialeSequenceOrdonnee): boolean {
  return phase === "aTermeUniqueEcran2" || phase === "aSommeEcran2" || phase === "aComplementEcran2";
}

// ============================================================================
// Famille A — Probabilité binomiale.
// ============================================================================

export function consigneGeneraleA(): string {
  return "n épreuves indépendantes sont répétées, chacune avec la même probabilité de succès p. Identifie la stratégie de calcul adaptée à la question, puis calcule la probabilité demandée.";
}

/** Notation mathématique de la question — reste COURTE (mode maths pur, jamais de `\text{}`
 * français mêlé) pour ne jamais s'approcher du seuil de débordement (voir `decouperEnFragmentsTexte`
 * ci-dessus) ; le qualificatif français associé est un fragment SÉPARÉ (`formatQuestionQualificatifA`,
 * sa propre entrée du tableau `blocDonnees`). */
function formatQuestionMathA(e: ExerciceBinomialeA): string {
  switch (e.typeQuestion) {
    case "exactement":
      return `P(X=${e.k})`;
    case "auMoins":
      return `P(X\\geq ${e.k})`;
    case "auPlus":
      return `P(X\\leq ${e.k})`;
    case "aucun":
      return "P(X=0)";
    case "tous":
      return `P(X=${e.n})`;
  }
}

function formatQuestionQualificatifA(e: ExerciceBinomialeA): string {
  switch (e.typeQuestion) {
    case "exactement":
      return `(exactement ${e.k} succès)`;
    case "auMoins":
      return `(au moins ${e.k} succès)`;
    case "auPlus":
      return `(au plus ${e.k} succès)`;
    case "aucun":
      return "(aucun succès)";
    case "tous":
      return "(tous des succès)";
  }
}

export function blocDonneesA(e: ExerciceBinomialeA): string[] {
  return [...decouperEnFragmentsTexte(e.contexte.texte), `n=${e.n}`, `p=${formatP(e.p)}`, `\\text{Demandé : }${formatQuestionMathA(e)}`, ...decouperEnFragmentsTexte(formatQuestionQualificatifA(e))];
}

export function consigneEcranA(e: ExerciceBinomialeA, phase: PhaseBinomialeSequenceOrdonnee): string {
  if (estEcran1A(phase)) return "Identifie la stratégie de calcul (un seul terme, une somme de plusieurs termes, ou un complément), puis indique le(s) nombre(s) de succès k pour lesquels il faut calculer P(X=k).";
  if (estEcran2A(phase)) return "Calcule la valeur de chaque terme P(X=k) identifié à l'étape précédente, à l'aide de la formule Cₙᵏ·p^k·(1-p)^(n-k).";
  return e.strategie === "somme" ? "Additionne les termes CONFIRMÉS de l'étape précédente pour obtenir la probabilité demandée." : "Calcule 1 moins le terme CONFIRMÉ de l'étape précédente pour obtenir la probabilité demandée.";
}

export function etatActuelA(e: ExerciceBinomialeA, phase: PhaseBinomialeSequenceOrdonnee): string[] | null {
  if (estEcran2A(phase)) {
    const termes = e.termesACalculer.map((k) => `P(X=${k})`).join(",\\ ");
    return [...decouperEnFragmentsTexte(`Stratégie : ${LIBELLE_STRATEGIE[e.strategie]}`), `\\text{Termes : }${termes}`];
  }
  if (phase === "aSommeEcran3" || phase === "aComplementEcran3") {
    const termes = e.termesACalculer.map((k) => `P(X=${k})`).join(",\\ ");
    return [
      ...decouperEnFragmentsTexte(`Stratégie : ${LIBELLE_STRATEGIE[e.strategie]}`),
      `\\text{Termes : }${termes}`,
      ...e.termesACalculer.map((k, i) => `P(X=${k})=${formatDecimalExact(e.valeursTermes[i])}\\text{ (confirmé)}`),
    ];
  }
  return null;
}

export function champsA(e: ExerciceBinomialeA, phase: PhaseBinomialeSequenceOrdonnee): ChampDef[] {
  if (estEcran1A(phase)) {
    return [
      {
        type: "choix",
        label: "Stratégie =",
        options: [
          { valeur: "termeUnique", label: "Un seul terme" },
          { valeur: "somme", label: "Une somme de plusieurs termes" },
          { valeur: "complement", label: "Un complément (1 moins un terme)" },
        ],
      },
      champTexte("Nombre(s) de succès k à calculer (séparés par une virgule) =", "ex : 3"),
    ];
  }
  if (estEcran2A(phase)) {
    return e.termesACalculer.map((k) => champTexte(`P(X=${k}) =`, `ex : 0,22 ${ANNONCE_TOLERANCE}`));
  }
  return [champTexte("Résultat final (probabilité demandée) =", `ex : 0,5 ${ANNONCE_TOLERANCE}`)];
}

export function niveauAideMaxA(phase: PhaseBinomialeSequenceOrdonnee): number {
  return estEcran1A(phase) || estEcran2A(phase) ? 2 : 0;
}

export function aideNiveau1A(phase: PhaseBinomialeSequenceOrdonnee): AideAvecLatex {
  if (estEcran1A(phase)) {
    return {
      texte: "3 stratégies possibles selon la formulation de la question : un seul terme (« exactement »/« aucun »/« tous »), une somme de plusieurs termes (« au plus »/« au moins », en sommant directement quand il y a peu de termes), ou un complément (1 moins un terme extrême, ex. « au moins 1 » = 1 − P(X=0)).",
      latex: null,
    };
  }
  if (estEcran2A(phase)) {
    return { texte: "Rappel de la formule :", latex: "P(X=k)=C_n^{k}\\cdot p^k\\cdot(1-p)^{n-k}" };
  }
  return AUCUNE_AIDE;
}

export function aideNiveau2A(e: ExerciceBinomialeA, phase: PhaseBinomialeSequenceOrdonnee): AideAvecLatex {
  if (estEcran1A(phase)) {
    const strategie = LIBELLE_STRATEGIE[e.strategie];
    if (e.strategie === "termeUnique") return { texte: `La stratégie identifiée dans l'énoncé est : ${strategie}.`, latex: `P(X=${e.k})` };
    if (e.strategie === "complement") return { texte: `La stratégie identifiée dans l'énoncé est : ${strategie}.`, latex: `1-P(X=${e.termesACalculer[0]})` };
    const somme = e.termesACalculer.map((k) => `P(X=${k})`).join("+");
    return { texte: `La stratégie identifiée dans l'énoncé est : ${strategie}.`, latex: somme };
  }
  if (estEcran2A(phase)) {
    const premierK = e.termesACalculer[0];
    const coefficient = coefficientBinomial(e.n, premierK);
    return { texte: `Coefficient binomial déjà calculé pour le premier terme (les puissances de p et 1−p restent à substituer) :`, latex: `C_{${e.n}}^{${premierK}}=${coefficient}` };
  }
  return AUCUNE_AIDE;
}

// ============================================================================
// Famille B — Probabilité d'une séquence exacte, sans remise.
// ============================================================================

export function consigneGeneraleB(): string {
  return "On tire k éléments l'un après l'autre, SANS REMISE, parmi n éléments tous distincts. Détermine la probabilité d'obtenir un ordre précis donné, une position à la fois.";
}

export function blocDonneesB(e: ExerciceBinomialeB): string[] {
  return [...decouperEnFragmentsTexte(e.contexte.texte), `n=${e.n}`, `k=${e.k}`, ...decouperEnFragmentsTexte("Probabilité d'obtenir l'ordre exact demandé, tirage après tirage")];
}

export function consigneEcranB(phase: PhaseBinomialeSequenceOrdonnee): string {
  if (phase === "bEcran1") return "Pose, SANS LE CALCULER, le produit des fractions correspondant à chaque tirage successif : donne le dénominateur de chaque fraction (le numérateur vaut toujours 1).";
  return "Calcule la valeur finale du produit CONFIRMÉ à l'étape précédente.";
}

/** Notation COMPACTE (`1/12` en ligne, jamais `\dfrac{1}{12}` empilée) — un produit de `k`∈{3,4,5}
 * fractions en `\dfrac` empilées serait visuellement bien plus large qu'un simple compte de
 * caractères ne le suggère (chaque `\dfrac` a sa propre largeur de colonne) ; la notation en ligne
 * reste largement assez claire pour une simple CONFIRMATION déjà validée à l'écran précédent
 * (jamais un champ de saisie, seulement `etatActuelB` ci-dessous). */
function formatProduitLatex(denominateurs: number[]): string {
  return denominateurs.map((d) => `1/${d}`).join("\\times ");
}

export function etatActuelB(e: ExerciceBinomialeB, phase: PhaseBinomialeSequenceOrdonnee): string[] | null {
  if (phase === "bEcran2") return [`${formatProduitLatex(e.denominateurs)}\\text{ (confirmé)}`];
  return null;
}

export function champsB(e: ExerciceBinomialeB, phase: PhaseBinomialeSequenceOrdonnee): ChampDef[] {
  if (phase === "bEcran1") {
    return e.denominateurs.map((_, i) => champTexte(`Position ${i + 1} — dénominateur (1/⬚) =`, `ex : ${e.n - i}`));
  }
  return [champTexte("Valeur finale =", `ex : 1/${e.denominateurs.reduce((a, b) => a * b, 1)}`)];
}

export function niveauAideMaxB(phase: PhaseBinomialeSequenceOrdonnee): number {
  return phase === "bEcran1" ? 2 : 0;
}

export function aideNiveau1B(phase: PhaseBinomialeSequenceOrdonnee): AideAvecLatex {
  if (phase !== "bEcran1") return AUCUNE_AIDE;
  return { texte: "À chaque tirage successif sans remise, un seul élément parmi ceux qui restent correspond exactement à la position demandée — la probabilité de cette étape est donc 1/(nombre d'éléments restants à ce moment).", latex: null };
}

export function aideNiveau2B(e: ExerciceBinomialeB, phase: PhaseBinomialeSequenceOrdonnee): AideAvecLatex {
  if (phase !== "bEcran1") return AUCUNE_AIDE;
  const [d0, d1] = e.denominateurs;
  return { texte: "Les deux premières fractions sont déjà posées, les suivantes restent à déterminer :", latex: `\\dfrac{1}{${d0}}\\times\\dfrac{1}{${d1}}` };
}

// ============================================================================
// Dispatch commun.
// ============================================================================

export function consigneGenerale(exercice: ExerciceBinomialeSequenceOrdonnee): string {
  return exercice.famille === "A" ? consigneGeneraleA() : consigneGeneraleB();
}

export function blocDonnees(exercice: ExerciceBinomialeSequenceOrdonnee): string[] {
  return exercice.famille === "A" ? blocDonneesA(exercice) : blocDonneesB(exercice);
}

export function consigneEcran(exercice: ExerciceBinomialeSequenceOrdonnee, phase: PhaseBinomialeSequenceOrdonnee): string {
  return exercice.famille === "A" ? consigneEcranA(exercice, phase) : consigneEcranB(phase);
}

export function etatActuel(exercice: ExerciceBinomialeSequenceOrdonnee, phase: PhaseBinomialeSequenceOrdonnee): string[] | null {
  return exercice.famille === "A" ? etatActuelA(exercice, phase) : etatActuelB(exercice, phase);
}

export function champsEcran(exercice: ExerciceBinomialeSequenceOrdonnee, phase: PhaseBinomialeSequenceOrdonnee): ChampDef[] {
  return exercice.famille === "A" ? champsA(exercice, phase) : champsB(exercice, phase);
}

export function niveauAideMaxEcran(exercice: ExerciceBinomialeSequenceOrdonnee, phase: PhaseBinomialeSequenceOrdonnee): number {
  return exercice.famille === "A" ? niveauAideMaxA(phase) : niveauAideMaxB(phase);
}

export function aideNiveau1(exercice: ExerciceBinomialeSequenceOrdonnee, phase: PhaseBinomialeSequenceOrdonnee): AideAvecLatex {
  return exercice.famille === "A" ? aideNiveau1A(phase) : aideNiveau1B(phase);
}

export function aideNiveau2(exercice: ExerciceBinomialeSequenceOrdonnee, phase: PhaseBinomialeSequenceOrdonnee): AideAvecLatex {
  return exercice.famille === "A" ? aideNiveau2A(exercice, phase) : aideNiveau2B(exercice, phase);
}

export const LIBELLE_PHASE: Record<PhaseBinomialeSequenceOrdonnee, string> = {
  aTermeUniqueEcran1: "Étape 1 (stratégie + terme à calculer)",
  aTermeUniqueEcran2: "Étape 2 (calcul du terme)",
  aSommeEcran1: "Étape 1 (stratégie + termes à calculer)",
  aSommeEcran2: "Étape 2 (calcul des termes)",
  aSommeEcran3: "Étape 3 (somme des termes)",
  aComplementEcran1: "Étape 1 (stratégie + terme à calculer)",
  aComplementEcran2: "Étape 2 (calcul du terme)",
  aComplementEcran3: "Étape 3 (complément)",
  bEcran1: "Étape 1 (produit posé)",
  bEcran2: "Étape 2 (valeur finale)",
};

export const LIBELLE_FAMILLE: Record<ExerciceBinomialeSequenceOrdonnee["famille"], string> = {
  A: "A — Probabilité binomiale",
  B: "B — Séquence exacte, sans remise",
};

/** Récapitulatif final : affiche toujours la réponse CORRECTE connue de l'exercice — jamais
 * recalculée depuis la saisie élève. */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceBinomialeSequenceOrdonnee, phase: PhaseBinomialeSequenceOrdonnee): string[] {
  if (exercice.famille === "A") {
    if (estEcran1A(phase)) {
      const termes = exercice.termesACalculer.map((k) => `k=${k}`).join(",\\ ");
      return [...decouperEnFragmentsTexte(LIBELLE_STRATEGIE[exercice.strategie]), termes];
    }
    if (estEcran2A(phase)) {
      return exercice.termesACalculer.map((k, i) => `P(X=${k})=${formatDecimalExact(exercice.valeursTermes[i])}`);
    }
    return [formatDecimalExact(exercice.resultatFinal)];
  }
  if (phase === "bEcran1") return [exercice.denominateurs.join(",\\ ")];
  const produit = exercice.denominateurs.reduce((a, b) => a * b, 1);
  return [`\\dfrac{1}{${produit}}\\approx ${formatDecimalExact(exercice.produitFinal)}`];
}

/** Total points du récapitulatif final — maximum VARIABLE (100 × nombre d'écrans réellement
 * traversés par CET exercice). */
export function calculerTotalPointsBinomialeSequenceOrdonnee(resultat: ResultatExerciceBinomialeSequenceOrdonnee): { total: number; maximum: number } {
  const phases = phasesPourExercice(resultat.exercice);
  const total = phases.reduce((acc, phase) => acc + (resultat.scores[phase] ?? 0), 0);
  return { total, maximum: phases.length * 100 };
}
