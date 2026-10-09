import type { ExerciceBinomeA, ExerciceBinomeB, ExerciceBinomeC, ExerciceBinomeNewton, FamilleBinomeNewton } from "../core6e/binomeNewton.types";
import type { PhaseBinomeNewton, ResultatExerciceBinomeNewton } from "../moteur6e/typesBinomeNewton";
import { phasesPourExercice } from "../moteur6e/typesBinomeNewton";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage LaTeX pour `6gen45`. Dispatch sur
 * `exercice.famille` PUIS `phase`, mirroir `formatDenombrementFondamental.ts` (6gen43), jamais
 * importé par un autre générateur (chaque générateur reste indépendant — CLAUDE.md).
 *
 * **Vigilance signe orphelin / groupe LaTeX vide / texte français en mode maths** — toute clause en
 * français mêlée à du LaTeX passe TOUJOURS par `\text{...}`, jamais du texte brut en mode maths ;
 * `consigneGenerale`/`consigneEcran`/`aide.texte` sont, eux, du texte BRUT (rendus hors KaTeX par
 * `EtapeChampsBinomeNewton.tsx`, `<p className="prompt-text">`), jamais besoin de `\text{}`.
 * Couverture de régression : `formatBinomeNewton.test.ts`, scan sur de nombreux tirages aléatoires
 * à la recherche d'un `++`/`+-`/`--`/groupe `{}` vide.
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

function champTexte(label: string, placeholder: string): ChampDef {
  return { type: "texte", label, placeholder };
}

const CHIFFRES_INDICE: Record<string, string> = { "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄", "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉" };
const CHIFFRES_EXPOSANT: Record<string, string> = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };

function versIndice(valeur: number): string {
  return String(valeur)
    .split("")
    .map((c) => CHIFFRES_INDICE[c] ?? c)
    .join("");
}

/** `Cₙᵏ` en Unicode indice/exposant (jamais de vrai KaTeX ici, label de champ rendu en texte BRUT —
 * voir en-tête de fichier) — approximation valable UNIQUEMENT pour des valeurs NUMÉRIQUES CONCRÈTES
 * (tous les chiffres 0-9 ont un équivalent Unicode indice/exposant), utilisée par `champsEcranA`/
 * `champsEcranC` où `e.n`/`t.k` sont déjà résolus en nombres concrets. */
function labelCombinaison(n: number, k: number): string {
  const exposant = String(k)
    .split("")
    .map((c) => CHIFFRES_EXPOSANT[c] ?? c)
    .join("");
  return `C${versIndice(n)}${exposant}`;
}

/** Variante de `labelCombinaison` où le 2ᵉ paramètre reste la lettre GÉNÉRIQUE littérale "k" (dans
 * l'ensemble Unicode exposant disponible, voir CLAUDE.md/piège notation combinatoire) — utilisée par
 * `champsEcranB` (`bPoserEcran`) où seul `n` est déjà résolu numériquement. */
function labelCoefficientNK(n: number): string {
  return `C${versIndice(n)}ᵏ`;
}

// ============================================================================
// Petits formateurs LaTeX partagés par les 3 familles.
// ============================================================================

/** `ax` avec coefficient implicite ±1 omis ("x"/"-x"), mirroir des conventions déjà en place
 * ailleurs sur le chantier (jamais "1x"/"−1x"). */
function formatCoeffX(a: number): string {
  if (a === 1) return "x";
  if (a === -1) return "-x";
  return `${a}x`;
}

/** Second terme d'un binôme, signe toujours explicite ("+3" ou "-5" — jamais "+-5"). */
function formatSigneTerme(b: number): string {
  return b >= 0 ? `+${b}` : `${b}`;
}

function formatBinomeBase(a: number, b: number, n: number): string {
  return `\\left(${formatCoeffX(a)}${formatSigneTerme(b)}\\right)^{${n}}`;
}

/** Liste d'entiers séparés par des virgules — mirroir `champsPositions`/listes de
 * `formatDenombrementFondamental.ts`. Utilisée pour `blocDonnees`/`etatActuel` (1 seul fragment
 * `<Katex block>`, jamais besoin de retour à la ligne interne à cet endroit). */
function formatListeEntiers(valeurs: number[]): string {
  return valeurs.map((v) => `${v}`).join(",\\,");
}

/** Version FRAGMENTÉE (1 élément par valeur, virgule collée SAUF le dernier) de
 * `formatListeEntiers` — pour le récapitulatif final (`formatReponseAttenduePhaseLatex`), rendu en
 * KaTeX INLINE dans `.equation-box-termes` (`display:flex;flex-wrap:wrap`, conçu précisément pour
 * accueillir plusieurs fragments courts qui s'enroulent proprement sur mobile étroit — jamais 1
 * seule formule KaTeX longue et insécable, qui déborderait sans retour à la ligne possible : bug
 * d'overflow trouvé par inspection visuelle réelle du récapitulatif, `n=5/6` coupait la fin de la
 * liste sans aucun indice visuel). */
function fragmentsListeEntiers(valeurs: number[]): string[] {
  return valeurs.map((v, i) => `${v}${i < valeurs.length - 1 ? "," : ""}`);
}

/** Équivalent décimal de `fragmentsListeEntiers`, même raison. */
function fragmentsListeDecimaux(valeurs: number[]): string[] {
  return valeurs.map((v, i) => `${formatDecimalFrancaisLatex(v)}${i < valeurs.length - 1 ? "," : ""}`);
}

/** Décimal FRANÇAIS (virgule, `{,}` LaTeX) — même convention que `formatEquationsExponentielles.ts`
 * (chapitre 2, 6e), dupliquée localement (chaque générateur reste indépendant). `toFixed` (jamais
 * `String(valeur)`) : un très petit terme de la famille C (ex. `1e-10`) s'afficherait en notation
 * scientifique JS ("1e-10") via `String`, illisible/invalide en LaTeX — `toFixed(12)` couvre toutes
 * les magnitudes rencontrées ici (ε a au plus 2 décimales, k≤5 ⟹ au plus 10 décimales), les zéros de
 * fin sont ensuite retirés. */
function formatDecimalFrancaisLatex(valeur: number): string {
  const brut = valeur.toFixed(12).replace(/0+$/, "").replace(/\.$/, "");
  const nettoye = brut === "" || brut === "-" ? "0" : brut;
  return nettoye.replace(".", "{,}");
}

/** Monôme `coefAbs·x^{exp}` (SANS signe — le signe est géré par l'appelant, voir
 * `formatPolynomeLatex`), coefficient `1` omis, exposant `0`/`1` simplifiés ("x" jamais "x^{1}",
 * nombre nu jamais "x^{0}"). */
function formatMonome(coefAbs: number, exposant: number): string {
  if (exposant === 0) return `${coefAbs}`;
  const partieX = exposant === 1 ? "x" : `x^{${exposant}}`;
  const coeffAffiche = coefAbs === 1 ? "" : `${coefAbs}`;
  return `${coeffAffiche}${partieX}`;
}

/** Polynôme final assemblé, ordonné par puissances décroissantes (déjà l'ordre naturel de
 * `termes`, k=0 donnant l'exposant le plus élevé — voir `core6e/binomeNewton.types.ts`) — signe de
 * CHAQUE terme géré indépendamment (jamais une simple alternance, cohérent avec le piège de la
 * mission). */
function formatPolynomeLatex(termes: { coefficientFinal: number; exposantX: number }[]): string {
  return termes.map((t, i) => `${t.coefficientFinal < 0 ? "-" : i === 0 ? "" : "+"}${formatMonome(Math.abs(t.coefficientFinal), t.exposantX)}`).join("");
}

// ============================================================================
// Famille A — Développement complet de (ax+b)ⁿ.
// ============================================================================

function consigneGeneraleA(): string {
  return "On développe (ax+b)ⁿ à l'aide du binôme de Newton : (ax+b)ⁿ = Σ Cₙᵏ·(ax)^(n-k)·bᵏ pour k=0,...,n. Détermine, étape par étape, les coefficients binomiaux, puis chaque terme du développement, puis le polynôme final.";
}

function blocDonneesA(e: ExerciceBinomeA): string[] {
  // La formule générale abstraite `(ax+b)^n=\sum...` (déjà donnée en toutes lettres dans
  // `consigneGeneraleA`) a été RETIRÉE d'ici — trop large pour tenir dans `.equation-box` sur un
  // écran mobile 375px (bug trouvé par inspection visuelle réelle, jamais par `scrollWidth` seul :
  // le fragment se centrait et se faisait couper des DEUX côtés sans aucun indice visuel de
  // troncature). Seules les données concrètes de CET exercice restent affichées ici, toutes
  // courtes.
  return [formatBinomeBase(e.a, e.b, e.n), `n=${e.n}`];
}

function consigneEcranA(phase: PhaseBinomeNewton): string {
  if (phase === "aEcran1") return "Identifie les n+1 coefficients binomiaux Cₙᵏ du développement, pour k=0 jusqu'à n.";
  if (phase === "aEcran2") return "Calcule chaque terme du développement (coefficient binomial × puissance de a × puissance de b). Attention au signe : b élevé à la puissance k doit être recalculé pour CHAQUE terme, jamais déduit par simple alternance.";
  return "Assemble le polynôme final en ordonnant les termes par puissances décroissantes de x.";
}

// Chaque `etatActuel*` renvoie l'étiquette et la liste de valeurs comme 2 fragments SÉPARÉS
// (jamais 1 seul long fragment `\text{...}: valeurs` — bug d'overflow mobile trouvé par inspection
// visuelle réelle : pour n=5/6 (6-7 valeurs), le fragment combiné dépasse `.equation-box` en
// 375px, centré et coupé des 2 côtés sans indice visuel de troncature — voir aussi `blocDonnees*`
// plus haut, même correction déjà appliquée là pour la même raison).
function etatActuelA(e: ExerciceBinomeA, phase: PhaseBinomeNewton): string[] | null {
  if (phase === "aEcran1") return null;
  if (phase === "aEcran2") return [`\\text{Coefficients confirmés :}`, formatListeEntiers(e.termes.map((t) => t.coefficientBinomial))];
  return [
    `\\text{Coefficients confirmés :}`,
    formatListeEntiers(e.termes.map((t) => t.coefficientBinomial)),
    `\\text{Termes confirmés (k=0 à n) :}`,
    formatListeEntiers(e.termes.map((t) => t.coefficientFinal)),
  ];
}

function champsEcranA(e: ExerciceBinomeA, phase: PhaseBinomeNewton): ChampDef[] {
  if (phase === "aEcran1") return e.termes.map((t) => champTexte(`${labelCombinaison(e.n, t.k)} =`, "ex : 6"));
  if (phase === "aEcran2") return e.termes.map((t) => champTexte(`Terme k=${t.k} (coefficient) =`, "ex : -96"));
  return [champTexte("Polynôme final =", "ex : 16x^4-96x^3+216x^2-216x+81")];
}

function niveauAideMaxA(phase: PhaseBinomeNewton): number {
  return phase === "aEcran2" ? 2 : 0;
}

function aideNiveau1A(): AideAvecLatex {
  return { texte: "Rappel : chaque terme vaut Cₙᵏ·(ax)^{n-k}·b^k. Fais bien attention au signe de b élevé à la puissance k (négatif si b<0 ET k impair).", latex: "C_n^{k}\\cdot(ax)^{n-k}\\cdot b^{k}" };
}

function aideNiveau2A(e: ExerciceBinomeA): AideAvecLatex {
  const deuxPremiers = e.termes.slice(0, 2);
  return { texte: "Les 2 premiers termes sont déjà calculés ci-dessous ; les suivants restent à calculer.", latex: `${formatListeEntiers(deuxPremiers.map((t) => t.coefficientFinal))}\\text{, puis }\\ldots` };
}

function reponseAttendueA(e: ExerciceBinomeA, phase: PhaseBinomeNewton): string[] {
  if (phase === "aEcran1") return fragmentsListeEntiers(e.termes.map((t) => t.coefficientBinomial));
  if (phase === "aEcran2") return fragmentsListeEntiers(e.termes.map((t) => t.coefficientFinal));
  return [formatPolynomeLatex(e.termes)];
}

// ============================================================================
// Famille B — Terme spécifique sans développement complet.
// ============================================================================

function consigneGeneraleB(): string {
  return "On cherche UN SEUL terme du développement de (ax+b)ⁿ, sans écrire tout le développement — isole directement ce terme grâce au binôme de Newton.";
}

function blocDonneesB(e: ExerciceBinomeB): string[] {
  // Fragment "cible" scindé en 2 lignes COURTES (jamais 1 seule phrase française longue en mode
  // maths — bug d'overflow mobile trouvé par inspection visuelle réelle sur le sous-type
  // "puissance", dont la formulation complète dépassait `.equation-box` en 375px, centrée et
  // coupée des deux côtés sans indice visuel).
  const cible = e.sousType === "rang" ? [`\\text{Terme demandé : rang}`, `k=${e.k}`] : [`\\text{Terme demandé : exposant}`, `p=${e.p}`];
  return [formatBinomeBase(e.a, e.b, e.n), `n=${e.n}`, ...cible];
}

function consigneEcranB(phase: PhaseBinomeNewton): string {
  if (phase === "bTrouverKEcran") return "Détermine k tel que l'exposant de x dans le terme général vaille p (résous n-k=p).";
  if (phase === "bPoserEcran") return "Pose le terme général : donne le coefficient binomial Cₙᵏ et la valeur de b^k, SANS calculer le terme complet (ni la puissance de a, ni le produit final).";
  return "Calcule la valeur du coefficient final de ce terme (n'oublie pas la puissance de a).";
}

// Fragments scindés (étiquette / valeurs), même raison que `etatActuelA` (overflow mobile).
function etatActuelB(e: ExerciceBinomeB, phase: PhaseBinomeNewton): string[] | null {
  if (phase === "bTrouverKEcran") return null;
  if (phase === "bPoserEcran") return e.sousType === "puissance" ? [`\\text{Valeur de }k\\text{ confirmée :}`, `k=${e.k}`] : null;
  if (e.sousType === "puissance") {
    return [
      `\\text{Valeur de }k\\text{ confirmée :}`,
      `k=${e.k}`,
      `\\text{Confirmé :}`,
      `C_{${e.n}}^{${e.k}}=${e.coefficientBinomial},\\ b^{${e.k}}=${e.bPuissanceK}`,
    ];
  }
  return [`\\text{Confirmé :}`, `C_{${e.n}}^{${e.k}}=${e.coefficientBinomial},\\ b^{${e.k}}=${e.bPuissanceK}`];
}

function champsEcranB(e: ExerciceBinomeB, phase: PhaseBinomeNewton): ChampDef[] {
  if (phase === "bTrouverKEcran") return [champTexte("k =", "ex : 2")];
  if (phase === "bPoserEcran") return [champTexte(`${labelCoefficientNK(e.n)} =`, "ex : 6"), champTexte("b^k =", "ex : 9")];
  return [champTexte("Coefficient final =", "ex : -96")];
}

function niveauAideMaxB(phase: PhaseBinomeNewton): number {
  return phase === "bTrouverKEcran" ? 2 : 0;
}

function aideNiveau1B(): AideAvecLatex {
  return { texte: "Rappel : dans le terme général Cₙᵏ(ax)^{n-k}b^k, l'exposant de x vaut n-k. Pose n-k=p et résous pour k.", latex: "n-k=p" };
}

function aideNiveau2B(e: ExerciceBinomeB): AideAvecLatex {
  return { texte: "Voici l'équation à résoudre (résolution non faite) :", latex: `${e.n}-k=${e.p}` };
}

function reponseAttendueB(e: ExerciceBinomeB, phase: PhaseBinomeNewton): string[] {
  if (phase === "bTrouverKEcran") return [`k=${e.k}`];
  if (phase === "bPoserEcran") return [`C_{${e.n}}^{${e.k}}=${e.coefficientBinomial},\\ b^{${e.k}}=${e.bPuissanceK}`];
  return [`${e.coefficientFinal}`];
}

// ============================================================================
// Famille C — Approximation décimale via développement binomial.
// ============================================================================

function consigneGeneraleC(): string {
  return "On calcule (1+ε)ⁿ EXACTEMENT à l'aide du développement binomial, plutôt que par un calcul direct de puissance.";
}

function blocDonneesC(e: ExerciceBinomeC): string[] {
  // Fragment "à écrire sous la forme..." scindé en 3 lignes COURTES (jamais 1 seule phrase
  // française longue en mode maths — bug d'overflow mobile trouvé par inspection visuelle réelle,
  // la version à 1 fragment dépassait `.equation-box` en 375px, centrée et coupée des 2 côtés).
  return [`${formatDecimalFrancaisLatex(e.base)}^{${e.n}}`, `\\text{À écrire } (1+\\varepsilon)^{n}`, `\\varepsilon=${formatDecimalFrancaisLatex(e.epsilon)},\\ n=${e.n}`];
}

function consigneEcranC(phase: PhaseBinomeNewton): string {
  if (phase === "cEcran1") return "Identifie les n+1 coefficients binomiaux Cₙᵏ du développement de (1+ε)ⁿ.";
  if (phase === "cEcran2") return "Calcule chaque terme Cₙᵏ·ε^k du développement.";
  return "Somme tous les termes pour obtenir la valeur exacte de (1+ε)ⁿ.";
}

// Voir commentaire de `etatActuelA` — mêmes fragments SÉPARÉS (étiquette / liste) pour la même
// raison (overflow mobile).
function etatActuelC(e: ExerciceBinomeC, phase: PhaseBinomeNewton): string[] | null {
  if (phase === "cEcran1") return null;
  if (phase === "cEcran2") return [`\\text{Coefficients confirmés :}`, formatListeEntiers(e.termes.map((t) => t.coefficientBinomial))];
  // Liste DÉCIMALE (pas juste entière) : fragmentée en 1 valeur par ligne — bug d'overflow mobile
  // trouvé par inspection visuelle réelle, une liste de décimaux (ex. "0,001, -0,00001,
  // 0,00000005, -0,0000000001") est bien plus large qu'une liste d'entiers de même longueur et
  // dépassait `.etat-actuel-box` (n=5/6) même après avoir isolé l'étiquette sur sa propre ligne.
  return [
    `\\text{Coefficients confirmés :}`,
    formatListeEntiers(e.termes.map((t) => t.coefficientBinomial)),
    `\\text{Termes confirmés :}`,
    ...fragmentsListeDecimaux(e.termes.map((t) => t.valeurTerme)),
  ];
}

function champsEcranC(e: ExerciceBinomeC, phase: PhaseBinomeNewton): ChampDef[] {
  if (phase === "cEcran1") return e.termes.map((t) => champTexte(`${labelCombinaison(e.n, t.k)} =`, "ex : 10"));
  if (phase === "cEcran2") return e.termes.map((t) => champTexte(`Terme k=${t.k} =`, "ex : 0,001"));
  return [champTexte("Valeur finale =", "ex : 1,05101")];
}

function niveauAideMaxC(phase: PhaseBinomeNewton): number {
  return phase === "cEcran1" ? 2 : 0;
}

function aideNiveau1C(): AideAvecLatex {
  return { texte: "Rappel : tout décimal proche de 1 peut s'écrire 1+ε avec ε petit, ce qui permet d'utiliser le développement binomial plutôt qu'un calcul direct de puissance.", latex: "(1+\\varepsilon)^{n}" };
}

function aideNiveau2C(e: ExerciceBinomeC): AideAvecLatex {
  return { texte: "La valeur de ε est déjà identifiée ci-dessous ; le développement (les coefficients) reste à poser.", latex: `\\varepsilon=${formatDecimalFrancaisLatex(e.epsilon)}` };
}

function reponseAttendueC(e: ExerciceBinomeC, phase: PhaseBinomeNewton): string[] {
  if (phase === "cEcran1") return fragmentsListeEntiers(e.termes.map((t) => t.coefficientBinomial));
  if (phase === "cEcran2") return fragmentsListeDecimaux(e.termes.map((t) => t.valeurTerme));
  return [formatDecimalFrancaisLatex(e.valeurFinale)];
}

// ============================================================================
// Dispatchers génériques — point d'entrée consommé par `App6gen45.tsx`/`EtapeChampsBinomeNewton.tsx`.
// ============================================================================

export function consigneGenerale(exercice: ExerciceBinomeNewton): string {
  switch (exercice.famille) {
    case "A":
      return consigneGeneraleA();
    case "B":
      return consigneGeneraleB();
    case "C":
      return consigneGeneraleC();
  }
}

export function blocDonnees(exercice: ExerciceBinomeNewton): string[] {
  switch (exercice.famille) {
    case "A":
      return blocDonneesA(exercice);
    case "B":
      return blocDonneesB(exercice);
    case "C":
      return blocDonneesC(exercice);
  }
}

export function consigneEcran(exercice: ExerciceBinomeNewton, phase: PhaseBinomeNewton): string {
  switch (exercice.famille) {
    case "A":
      return consigneEcranA(phase);
    case "B":
      return consigneEcranB(phase);
    case "C":
      return consigneEcranC(phase);
  }
}

export function etatActuel(exercice: ExerciceBinomeNewton, phase: PhaseBinomeNewton): string[] | null {
  switch (exercice.famille) {
    case "A":
      return etatActuelA(exercice, phase);
    case "B":
      return etatActuelB(exercice, phase);
    case "C":
      return etatActuelC(exercice, phase);
  }
}

export function champsEcran(exercice: ExerciceBinomeNewton, phase: PhaseBinomeNewton): ChampDef[] {
  switch (exercice.famille) {
    case "A":
      return champsEcranA(exercice, phase);
    case "B":
      return champsEcranB(exercice, phase);
    case "C":
      return champsEcranC(exercice, phase);
  }
}

export function niveauAideMaxEcran(exercice: ExerciceBinomeNewton, phase: PhaseBinomeNewton): number {
  switch (exercice.famille) {
    case "A":
      return niveauAideMaxA(phase);
    case "B":
      return niveauAideMaxB(phase);
    case "C":
      return niveauAideMaxC(phase);
  }
}

export function aideNiveau1(exercice: ExerciceBinomeNewton, phase: PhaseBinomeNewton): AideAvecLatex {
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

export function aideNiveau2(exercice: ExerciceBinomeNewton, phase: PhaseBinomeNewton): AideAvecLatex {
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

export const LIBELLE_PHASE: Record<PhaseBinomeNewton, string> = {
  aEcran1: "Étape 1 (coefficients binomiaux)",
  aEcran2: "Étape 2 (termes calculés)",
  aEcran3: "Étape 3 (polynôme final)",
  bTrouverKEcran: "Étape 1 (trouver k)",
  bPoserEcran: "Étape 2 (terme posé)",
  bCalculerEcran: "Étape 3 (terme calculé)",
  cEcran1: "Étape 1 (coefficients binomiaux)",
  cEcran2: "Étape 2 (termes calculés)",
  cEcran3: "Étape 3 (valeur finale)",
};

export const LIBELLE_FAMILLE: Record<FamilleBinomeNewton, string> = {
  A: "A — Développement complet de (ax+b)ⁿ",
  B: "B — Terme spécifique",
  C: "C — Approximation décimale (1+ε)ⁿ",
};

/** Récapitulatif final : affiche toujours la réponse CORRECTE connue de l'exercice — jamais
 * recalculée depuis la saisie élève. */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceBinomeNewton, phase: PhaseBinomeNewton): string[] {
  switch (exercice.famille) {
    case "A":
      return reponseAttendueA(exercice, phase);
    case "B":
      return reponseAttendueB(exercice, phase);
    case "C":
      return reponseAttendueC(exercice, phase);
  }
}

/** Total points du récapitulatif final — maximum VARIABLE (100 × nombre d'écrans réellement
 * traversés par CET exercice). */
export function calculerTotalPointsBinomeNewton(resultat: ResultatExerciceBinomeNewton): { total: number; maximum: number } {
  const phases = phasesPourExercice(resultat.exercice);
  const total = phases.reduce((acc, phase) => acc + (resultat.scores[phase] ?? 0), 0);
  return { total, maximum: phases.length * 100 };
}
