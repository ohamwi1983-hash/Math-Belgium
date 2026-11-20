import type {
  CandidatEtudeA,
  CandidatEtudeB,
  CandidatEtudeC,
  CandidatEtudeD,
  CibleAsymptote,
  ExerciceEtudeB,
  ExerciceEtudeFonctionExponentielle,
} from "../core6e/etudeFonctionExponentielle.types";
import type { CibleLimite } from "../core6e/limitesExponentielles.types";
import type { PhaseEtudeFonctionExponentielle } from "../moteur6e/typesEtudeFonctionExponentielle";
import { formatEnsembleReelLatex } from "./formatEnsembleReel";
import { assurerAxesVisibles } from "../ui/mafsTransformation";

/**
 * Couche présentation (6e) — formatage LaTeX, évaluation des 4 candidats (pour le rendu Mafs) et
 * textes de consigne/aide pour `6gen11`. Consigne générale et bloc de données (f(x)) redondants
 * sur chaque écran (spec explicite). Chaque aide porteuse de formule utilise le motif `{texte,
 * latex}` — jamais du LaTeX brut mêlé au texte (leçon retenue à plusieurs reprises sur ce chantier
 * — voir CLAUDE.md, sections 6gen2/6gen3/6gen4/6gen9).
 *
 * **Concavité — rappel de méthode EXPLICITE, sur CHAQUE instance** (décision de conception,
 * spec : "la première apparition doit rappeler la méthode en toutes lettres... pas juste invoquer
 * le nom") : `aideConcaviteNiveau1` énonce TOUJOURS la règle complète (signe de f'' : positif ⟹
 * convexe, négatif ⟹ concave, changement de signe ⟹ inflexion) — jamais seulement "la première
 * fois" d'une session (les familles étant tirées au hasard, un élève peut ne rencontrer qu'une
 * seule instance ; aucune aide de la plateforme ne dépend par ailleurs de l'historique des
 * exercices précédents, même principe déjà établi ailleurs — voir `formatLimitesExponentielles.ts`).
 *
 * **Asymptote oblique — méthode NOUVELLE, outillée explicitement (famille C)** :
 * `aideAsymptotesNiveau1`/`Niveau2` de la famille C expliquent le principe (`f(x)−(ax+b)→0`)
 * jamais rencontré avant ce générateur du chapitre — voir la spec, écran 3 famille C.
 */
export const CONSIGNE_GENERALE = "Étudie la fonction suivante :";

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

/** Texte brut mêlé à du LaTeX inline court — même contrat que `ui/formatEquationDroite.ts`
 * (dupliqué ici à dessein, convention CLAUDE.md), rendu via `components/RenduFragments.tsx`. */
export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

function texte(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}
function latex(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
}

// ============================================================================
// Petits helpers de formatage LOCAUX, dupliqués depuis le patron déjà établi ailleurs sur la
// plateforme (`formatSommeTermes`/`formatCoefFois`, ex. `ui6e/formatLimitesExponentielles.ts`,
// `ui6e/formatGraphiquesDeriveeExponentielles.ts`) — jamais un coefficient ±1 littéral, jamais un
// terme nul affiché.
// ============================================================================

interface TermeSigne {
  valeur: number;
  suffixe: string;
}

function formatSommeTermes(termes: TermeSigne[]): string {
  const nonNuls = termes.filter((t) => t.valeur !== 0);
  if (nonNuls.length === 0) return "0";
  return nonNuls
    .map((t, i) => {
      const abs = Math.abs(t.valeur);
      const corps = t.suffixe === "" ? `${abs}` : abs === 1 ? t.suffixe : `${abs}${t.suffixe}`;
      if (i === 0) return t.valeur < 0 ? `-${corps}` : corps;
      return `${t.valeur < 0 ? "-" : "+"} ${corps}`;
    })
    .join(" ");
}

function formatCoefFois(coef: number, corps: string): string {
  if (coef === 1) return corps;
  if (coef === -1) return `-${corps}`;
  return `${coef}${corps}`;
}

/** `x-p`/`x+|p|`/`x` — jamais `x-(-3)` (même piège déjà documenté pour gen47, 4e — voir
 * CLAUDE.md). */
function formatXMoinsP(p: number): string {
  if (p === 0) return "x";
  return p > 0 ? `x-${p}` : `x+${-p}`;
}

function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
}

/**
 * Coefficient `c` de la famille C, affiché SYMBOLIQUEMENT (`K·ln(base)`, K rationnel EXACT),
 * jamais approximé en décimal — `c` est en général irrationnel (`c = m·ln(base)·base^p`), voir
 * `core6e/etudeFonctionExponentielle.types.ts::ExerciceEtudeC.c` pour la justification complète de
 * ce choix. `K = m·base^p` — toujours un rationnel exact, potentiellement fractionnaire si p<0.
 */
export function formatCoefficientCLatex(m: number, base: number, p: number): string {
  let num: number;
  let den: number;
  if (p >= 0) {
    num = m * Math.pow(base, p);
    den = 1;
  } else {
    num = m;
    den = Math.pow(base, -p);
  }
  const g = pgcd(num, den) || 1;
  num /= g;
  den /= g;
  const lnPart = `\\ln(${base})`;
  if (den === 1) {
    if (num === 1) return lnPart;
    return `${num}${lnPart}`;
  }
  return `\\dfrac{${num}}{${den}}${lnPart}`;
}

/** Position (abscisse) en LaTeX : entier, ou demi-entier écrit en décimal à virgule (« -1{,}5 »). */
export function positionLatex(v: number): string {
  return String(Math.round(v * 1000) / 1000).replace(".", "{,}");
}

/** Exposant affine `mx+n` (familles A et C). */
export function exposantAffineLatex(m: number, n: number): string {
  return formatSommeTermes([
    { valeur: m, suffixe: "x" },
    { valeur: n, suffixe: "" },
  ]);
}

/** `m\ln(base)` (« \ln(2) » si m = 1, « 2\ln(3) » sinon) — facteur de la dérivée de la famille C. */
export function mLnBaseLatex(m: number, base: number): string {
  return m === 1 ? `\\ln(${base})` : `${m}\\ln(${base})`;
}

/** Coefficient devant une exponentielle (« 2e^{x} », « -e^{x} »). */
export function coefExpLatex(a: number, corps: string): string {
  return formatCoefFois(a, corps);
}

// ============================================================================
// f(x) — un helper par famille.
// ============================================================================

export function formatFonctionLatex(exercice: ExerciceEtudeFonctionExponentielle): string {
  switch (exercice.famille) {
    case "A": {
      const exposant = formatSommeTermes([
        { valeur: exercice.m, suffixe: "x" },
        { valeur: exercice.n, suffixe: "" },
      ]);
      return `f(x) = e^{${exposant}}`;
    }
    case "B": {
      const denom = formatXMoinsP(exercice.p);
      return `f(x) = e^{\\frac{${exercice.k}}{${denom}}}`;
    }
    case "C": {
      const exposant = formatSommeTermes([
        { valeur: exercice.m, suffixe: "x" },
        { valeur: exercice.n, suffixe: "" },
      ]);
      const cLatex = formatCoefficientCLatex(exercice.m, exercice.base, exercice.p);
      return `f(x) = ${exercice.base}^{${exposant}} - ${cLatex}\\,x`;
    }
    case "D": {
      const corps = formatCoefFois(exercice.a, "x");
      return `f(x) = ${corps}\\,e^{x}`;
    }
  }
}

// ============================================================================
// Évaluation des candidats — chaque distracteur est une VRAIE fonction renvoyable, jamais une
// astuce de rendu déconnectée des données (voir le core pour la justification de chaque
// distracteur). Famille B seule a une VRAIE singularité (x=p, partagée par les 4 candidats) —
// marge d'exclusion pour éviter la cascade d'erreurs NaN déjà documentée ailleurs sur ce chantier
// (voir CLAUDE.md, section 6gen8, "Bug 1 — cascade d'erreurs NaN dans le SVG").
// ============================================================================

const AMPLITUDE_LOGISTIQUE_A = 5;
const AMPLITUDE_LOGISTIQUE_C = 6;
const MARGE_ASYMPTOTE_B = 0.12;

function evaluerCandidatA(c: CandidatEtudeA, x: number): number {
  if (c.type === "reel") return Math.exp(c.m * x + c.n);
  if (c.type === "sensInverse") return Math.exp(-c.m * x + c.n);
  if (c.type === "mauvaisNiveau") return Math.exp(c.m * x + c.n) + c.decalage;
  return AMPLITUDE_LOGISTIQUE_A / (1 + Math.exp(-(c.m * x + c.n)));
}

function evaluerCandidatB(c: CandidatEtudeB, x: number): number | null {
  const u = x - c.p;
  if (Math.abs(u) < MARGE_ASYMPTOTE_B) return null;
  if (c.type === "reel") return Math.exp(c.k / u);
  if (c.type === "symetrique") return Math.exp(Math.abs(c.k) / Math.abs(u));
  if (c.type === "sansInflexion") return 1 + c.k / u;
  return Math.exp(c.k / u) + c.decalage;
}

function evaluerCandidatC(c: CandidatEtudeC, x: number): number {
  if (c.type === "reel") return Math.pow(c.base, c.m * x + c.n) - c.c * x;
  if (c.type === "sansAsymptote") return Math.pow(c.base, c.m * x + c.n) - c.c * x * x;
  if (c.type === "minimumMalPlace") return Math.pow(c.base, c.m * x + c.n + c.decalageMin) - c.c * x;
  return AMPLITUDE_LOGISTIQUE_C / (1 + Math.exp(-(c.m * x + c.n))) - c.c * x;
}

function evaluerCandidatD(c: CandidatEtudeD, x: number): number {
  if (c.type === "reel") return c.a * x * Math.exp(x);
  if (c.type === "extremumInverse") return -c.a * x * Math.exp(x);
  if (c.type === "asymptoteMalPlacee") return c.a * x * Math.exp(-x);
  return -c.a * x * Math.exp(-x);
}

export function evaluerCandidat(exercice: ExerciceEtudeFonctionExponentielle, index: number, x: number): number | null {
  switch (exercice.famille) {
    case "A":
      return evaluerCandidatA(exercice.candidats[index], x);
    case "B":
      return evaluerCandidatB(exercice.candidats[index], x);
    case "C":
      return evaluerCandidatC(exercice.candidats[index], x);
    case "D":
      return evaluerCandidatD(exercice.candidats[index], x);
  }
}

// ============================================================================
// Fenêtre d'affichage commune aux 4 options — MÊME échelle sur les 4 (contrainte impérative, voir
// CLAUDE.md/6gen8). `preserveAspectRatio={false}` reste de la responsabilité du composant Mafs
// (`GrapheOptionEtudeFonction.tsx`), jamais de cette fonction — mais la fenêtre elle-même doit
// déjà être RAISONNABLE (plafond de magnitude Y, marge X bornée par famille) pour éviter le piège
// "4 traits quasi verticaux indiscernables" déjà rencontré et corrigé sur 6gen8.
// ============================================================================

export interface ViewBoxEtudeFonction {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

function fenetreX(exercice: ExerciceEtudeFonctionExponentielle): [number, number] {
  switch (exercice.famille) {
    case "A":
      // Asymptote d'un côté (valeur 0), croissance/décroissance exponentielle de l'autre — fenêtre
      // symétrique bornée par |m| pour garder des magnitudes raisonnables.
      return [-Math.min(4, 6 / Math.abs(exercice.m)), Math.min(4, 6 / Math.abs(exercice.m))];
    case "B":
      // Centrée sur le point exclu p — la marge `MARGE_ASYMPTOTE_B` empêche déjà tout NaN/Infinity.
      return [exercice.p - 4, exercice.p + 4];
    case "C": {
      // Centrée sur le minimum réel, fenêtre bornée par la vitesse de croissance de l'exponentielle
      // (m·ln(base)) pour rester dans des magnitudes affichables.
      const position = (exercice.p - exercice.n) / exercice.m;
      const vitesse = exercice.m * Math.log(exercice.base);
      const demiLargeur = Math.min(4, 6 / vitesse);
      return [position - demiLargeur - 1, position + demiLargeur];
    }
    case "D":
      // Extremum en -1, inflexion en -2, asymptote en -∞ — fenêtre asymétrique (plus de recul côté
      // négatif pour montrer l'aplatissement vers 0, moins côté +∞ où la croissance est rapide).
      return [-5, 2.5];
  }
}

/** Plafond de magnitude Y utilisé pour le calcul d'ÉCHELLE, PAR FAMILLE — une valeur qui le
 * dépasse est ignorée du calcul d'étendue Y (elle reste TRACÉE, `Plot.OfX` la porte simplement
 * hors du cadre visible ; seule sa contribution au calcul d'échelle est exclue). Même mécanisme
 * que `PLAFOND_STATS` de `ui6e/formatGraphiquesDeriveeExponentielles.ts` (6gen8) — bug déjà trouvé
 * et corrigé là-bas pour la croissance exponentielle non bornée, appliqué ici DÈS LA CONCEPTION. */
const PLAFOND_STATS: Record<ExerciceEtudeFonctionExponentielle["famille"], number> = {
  A: 30,
  B: 5,
  C: 60,
  D: 30,
};

/** Densité de grille cible, partagée avec `GrapheOptionEtudeFonction.tsx` (`GrilleAdaptative`) —
 * voir `CIBLE_NOMBRE_LIGNES_QCM` de `ui6e/formatGraphiquesCyclometriques.ts` (même rôle, même
 * précaution de synchronisation) pour la justification complète. */
export const CIBLE_NOMBRE_LIGNES_QCM = 6;

/** Composition finale du viewBox — voir `finaliserViewBox` de
 * `ui6e/formatGraphiquesCyclometriques.ts` pour la justification complète (`ratio=1` : conteneur
 * CARRÉ, jamais `RATIO_GRAPHE`). */
function finaliserViewBox(x: [number, number], y: [number, number]): ViewBoxEtudeFonction {
  const { x: xFinal, y: yFinal } = assurerAxesVisibles({ x, y });
  return { xMin: xFinal[0], xMax: xFinal[1], yMin: yFinal[0], yMax: yFinal[1] };
}

export function calculerViewBox(exercice: ExerciceEtudeFonctionExponentielle): ViewBoxEtudeFonction {
  const [xMin, xMax] = fenetreX(exercice);
  const plafond = PLAFOND_STATS[exercice.famille];
  const valeurs: number[] = [];
  for (let index = 0; index < exercice.candidats.length; index++) {
    for (let i = 0; i <= 80; i++) {
      const x = xMin + ((xMax - xMin) * i) / 80;
      const y = evaluerCandidat(exercice, index, x);
      if (y === null || !Number.isFinite(y)) continue;
      if (Math.abs(y) > plafond) continue;
      valeurs.push(y);
    }
  }
  if (valeurs.length === 0) return finaliserViewBox([xMin, xMax], [-1, 1]);
  const yMinBrut = Math.min(...valeurs);
  const yMaxBrut = Math.max(...valeurs);
  const marge = Math.max(0.4, (yMaxBrut - yMinBrut) * 0.15);
  return finaliserViewBox([xMin, xMax], [yMinBrut - marge, yMaxBrut + marge]);
}

// ============================================================================
// Équation d'une asymptote (révélation/aide) — `CibleAsymptote` → LaTeX.
// ============================================================================

export function formatEquationAsymptoteLatex(cible: CibleAsymptote): string {
  if (cible.type === "horizontale") return `y=${cible.valeur}`;
  if (cible.type === "verticale") return `x=${cible.p}`;
  if (cible.type === "oblique") {
    const droite = formatSommeTermes([
      { valeur: cible.a, suffixe: "x" },
      { valeur: cible.b, suffixe: "" },
    ]);
    return `y=${droite}`;
  }
  return "\\text{aucune asymptote}";
}

// ============================================================================
// Labels de direction (limites/asymptotes) — 2 entrées (A/C/D : x→+∞/x→−∞) ou 4 (B : x→p⁺/x→p⁻/
// x→+∞/x→−∞, l'écran le plus dense du générateur, voir décision de conception explicite).
// ============================================================================

export interface DirectionLabel {
  id: string;
  latex: string;
}

export function directionLabels(exercice: ExerciceEtudeFonctionExponentielle): DirectionLabel[] {
  if (exercice.famille === "B") {
    return [
      { id: "pointPlus", latex: `x \\to ${exercice.p}^+` },
      { id: "pointMoins", latex: `x \\to ${exercice.p}^-` },
      { id: "plusInfini", latex: "x \\to +\\infty" },
      { id: "moinsInfini", latex: "x \\to -\\infty" },
    ];
  }
  return [
    { id: "plusInfini", latex: "x \\to +\\infty" },
    { id: "moinsInfini", latex: "x \\to -\\infty" },
  ];
}

// ============================================================================
// Consignes — un texte par écran, communes aux 4 familles (le bloc de données f(x) + le domaine/
// point exclu déjà affichés portent l'information propre à la famille).
// ============================================================================

export function consigneDomaine(): FragmentConsigne[] {
  return [texte("Détermine le domaine de définition de f.")];
}

export function consigneLimites(exercice: ExerciceEtudeFonctionExponentielle): FragmentConsigne[] {
  return exercice.famille === "B"
    ? [texte("Détermine les 4 limites suivantes (attention : les deux côtés du point exclu ne sont pas forcément identiques).")]
    : [texte("Détermine les limites de f aux deux bornes de son domaine.")];
}

export function consigneAsymptotes(exercice: ExerciceEtudeFonctionExponentielle): FragmentConsigne[] {
  if (exercice.famille === "C") return [texte("À partir des limites CORRECTES précédentes, détermine l'asymptote de f (horizontale, verticale ou oblique) dans chaque direction — ou l'absence d'asymptote.")];
  return [texte("À partir des limites CORRECTES précédentes, détermine l'asymptote de f dans chaque direction — ou l'absence d'asymptote.")];
}

export function consigneAsymptotesB(p: number): FragmentConsigne[] {
  return [texte("L'asymptote verticale "), latex(`x=${p}`), texte(" n'existe que d'un seul côté : lequel ? Et quelle est l'équation de l'asymptote horizontale (commune aux deux infinis) ?")];
}

export function consigneCroissance(): FragmentConsigne[] {
  return [texte("Étudie le signe de "), latex("f'"), texte(" et conclus sur la croissance de f (monotonie constante, ou extremum et sa position).")];
}

export function consigneConcavite(): FragmentConsigne[] {
  return [texte("Étudie le signe de "), latex("f''"), texte(" et conclus sur la concavité de f (convexe, concave, ou point d'inflexion et sa position).")];
}

export function consigneGraphique(): FragmentConsigne[] {
  return [texte("Sélectionne le graphique qui représente f.")];
}

// ============================================================================
// Aides — 2 niveaux par écran. Motif `{texte, latex}` partout (jamais du LaTeX brut dans `.texte`).
// ============================================================================

function texteFamilleAsymptoteC(): string {
  return "La droite d'équation y = ax + b est une asymptote oblique si la différence entre f(x) et ax + b tend vers 0 : cherche quelle partie de f(x) tend vers 0.";
}

export function aideDomaineNiveau1(exercice: ExerciceEtudeFonctionExponentielle): AideAvecLatex {
  if (exercice.famille === "B") return { texte: "Une exponentielle est définie dès que son exposant l'est : repère la valeur qui annule le dénominateur de l'exposant.", latex: null };
  return { texte: "Une exponentielle est définie quel que soit son exposant : cherche seulement une racine, un dénominateur ou un logarithme dans l'expression.", latex: null };
}

export function aideDomaineNiveau2(exercice: ExerciceEtudeFonctionExponentielle): AideAvecLatex {
  if (exercice.famille === "B") return { texte: "L'exposant s'écrit sous forme d'une fraction :", latex: `\\dfrac{${exercice.k}}{${formatXMoinsP(exercice.p)}}` };
  return { texte: "Ici, l'expression ne contient ni racine, ni dénominateur, ni logarithme.", latex: null };
}

export function aideLimitesNiveau1(exercice: ExerciceEtudeFonctionExponentielle): AideAvecLatex {
  if (exercice.famille === "A") return { texte: "Étudie d'abord la limite de l'exposant dans chaque direction, puis utilise les limites de référence de l'exponentielle :", latex: "e^{u}\\to+\\infty \\text{ si } u\\to+\\infty, \\quad e^{u}\\to 0 \\text{ si } u\\to-\\infty" };
  if (exercice.famille === "B") return { texte: "Près de la valeur exclue, distingue les deux côtés : l'exposant n'y a pas le même signe. Aux deux infinis, l'exposant tend vers 0. L'exposant est :", latex: `\\dfrac{${exercice.k}}{${formatXMoinsP(exercice.p)}}` };
  if (exercice.famille === "C") return { texte: "Calcule chaque limite séparément : regarde ce que devient le terme exponentiel, puis le terme en x.", latex: null };
  return { texte: "En −∞, l'exponentielle l'emporte sur toute puissance de x (croissances comparées) :", latex: "\\lim_{x\\to-\\infty}x^{n}e^{x}=0" };
}

export function aideLimitesNiveau2(exercice: ExerciceEtudeFonctionExponentielle): AideAvecLatex {
  if (exercice.famille === "A") return { texte: "Ici, l'exposant a pour coefficient de x :", latex: `m=${exercice.m}` };
  if (exercice.famille === "B") return { texte: "Ici, le signe de k décide de quel côté l'exposant tend vers l'infini :", latex: `k=${exercice.k},\\quad p=${exercice.p}` };
  if (exercice.famille === "C") {
    const exposant = formatSommeTermes([
      { valeur: exercice.m, suffixe: "x" },
      { valeur: exercice.n, suffixe: "" },
    ]);
    return { texte: "Ici, en −∞, le terme exponentiel tend vers 0 :", latex: `${exercice.base}^{${exposant}} \\to 0 \\text{ quand } x\\to-\\infty` };
  }
  return { texte: "Ici, le coefficient a vaut :", latex: `a=${exercice.a}` };
}

export function aideAsymptotesNiveau1(exercice: ExerciceEtudeFonctionExponentielle): AideAvecLatex {
  if (exercice.famille === "C") return { texte: texteFamilleAsymptoteC(), latex: "y=ax+b \\quad\\text{si}\\quad f(x)-(ax+b)\\to 0" };
  if (exercice.famille === "A" || exercice.famille === "D") return { texte: "Une limite finie à l'infini donne une asymptote horizontale ; une limite infinie n'en donne aucune de ce côté.", latex: "\\lim_{x\\to+\\infty}f(x)=L\\ \\Rightarrow\\ y=L" };
  return { texte: "", latex: null };
}

/** Dédiée aux familles A/C/D (2 directions) — la famille B a son propre écran/ses propres aides
 * dédiées (`aideAsymptotesBNiveau1`/`2`), jamais routée vers cette fonction par `App6gen11.tsx` ;
 * garde défensive `famille==="B"` ci-dessous pour ne jamais planter si appelée par erreur (même
 * principe que les gardes de `sessionEtudeFonctionExponentielle.ts`). */
export function aideAsymptotesNiveau2(exercice: ExerciceEtudeFonctionExponentielle): AideAvecLatex {
  if (exercice.famille === "B") return { texte: "", latex: null };
  if (exercice.famille === "C") return { texte: "Ici, en −∞, le terme exponentiel tend vers 0 : il ne reste que le terme en x, qui donne la droite.", latex: null };
  return { texte: "Ici, une seule des deux limites à l'infini est finie : sa valeur donne l'asymptote horizontale, de ce côté seulement.", latex: null };
}

export function aideAsymptotesBNiveau1(): AideAvecLatex {
  return { texte: "Une asymptote verticale demande une limite infinie : si la limite n'est infinie que d'un côté de la valeur exclue, l'asymptote ne vaut que de ce côté.", latex: null };
}

export function aideAsymptotesBNiveau2(exercice: ExerciceEtudeB): AideAvecLatex {
  return {
    texte: "Les deux limites en p, côte à côte (une finie, une infinie — sans dire laquelle est laquelle) :",
    latex: `\\begin{gathered} x\\to ${exercice.p}^+ \\\\ x\\to ${exercice.p}^- \\end{gathered}`,
  };
}

export function aideCroissanceNiveau1(exercice: ExerciceEtudeFonctionExponentielle): AideAvecLatex {
  if (exercice.famille === "B") return { texte: "Calcule f′(x) : le carré du dénominateur et l'exponentielle sont positifs, le signe de f′ est celui du facteur restant.", latex: "\\left(e^{u}\\right)'=u'\\,e^{u}" };
  if (exercice.famille === "C") return { texte: "Cherche où f′ s'annule, puis étudie son signe de part et d'autre :", latex: "f'(x)=0" };
  return { texte: "Calcule f′(x), puis étudie son signe sur tout le domaine.", latex: null };
}

export function aideCroissanceNiveau2(exercice: ExerciceEtudeFonctionExponentielle): AideAvecLatex {
  if (exercice.famille === "A") return { texte: "Ici, la dérivée est le produit d'un nombre par une exponentielle, toujours positive :", latex: `f'(x)=${formatCoefFois(exercice.m, `e^{${exposantAffineLatex(exercice.m, exercice.n)}}`)}` };
  if (exercice.famille === "B") return { texte: "Ici :", latex: `f'(x)=e^{\\frac{${exercice.k}}{${formatXMoinsP(exercice.p)}}}\\cdot\\dfrac{${-exercice.k}}{(${formatXMoinsP(exercice.p)})^{2}}` };
  if (exercice.famille === "C") {
    const mln = mLnBaseLatex(exercice.m, exercice.base);
    return {
      texte: "Ici, résous l'équation f′(x) = 0 (les deux membres seront des puissances de même base) :",
      latex: `f'(x)=${mln}\\cdot ${exercice.base}^{${exposantAffineLatex(exercice.m, exercice.n)}}-${formatCoefficientCLatex(exercice.m, exercice.base, exercice.p)}`,
    };
  }
  return { texte: "Ici, la dérivée se factorise :", latex: `f'(x)=${formatCoefFois(exercice.a, "e^{x}")}(1+x)` };
}

/** Rappel EXPLICITE de la méthode de concavité — voir la note de conception en tête de fichier :
 * TOUJOURS énoncé, sur chaque instance de chaque famille, jamais seulement "la première fois". */
export function aideConcaviteNiveau1(_exercice: ExerciceEtudeFonctionExponentielle): AideAvecLatex {
  return {
    texte: "Étudie le signe de la dérivée seconde : positive, f est convexe ; négative, f est concave ; si elle change de signe en un point, c'est un point d'inflexion :",
    latex: "f''(x)>0\\ \\Rightarrow\\ \\text{convexe}\\qquad f''(x)<0\\ \\Rightarrow\\ \\text{concave}",
  };
}

export function aideConcaviteNiveau2(exercice: ExerciceEtudeFonctionExponentielle): AideAvecLatex {
  if (exercice.famille === "A") return { texte: "Ici, la dérivée seconde est un nombre positif multiplié par une exponentielle :", latex: `f''(x)=${formatCoefFois(exercice.m * exercice.m, `e^{${exposantAffineLatex(exercice.m, exercice.n)}}`)}` };
  if (exercice.famille === "B") {
    const k = exercice.k;
    const xp = formatXMoinsP(exercice.p);
    return { texte: "Ici, la dérivée seconde a le signe de son dernier facteur du numérateur : cherche où il s'annule.", latex: `f''(x)=e^{\\frac{${k}}{${xp}}}\\cdot\\dfrac{${k}\\left(2(${xp})${k > 0 ? "+" : "-"}${Math.abs(k)}\\right)}{(${xp})^{4}}` };
  }
  if (exercice.famille === "C") {
    return {
      texte: "Ici, le terme en x disparaît à la dérivée seconde ; il reste un carré multiplié par une exponentielle :",
      latex: `f''(x)=\\left(${mLnBaseLatex(exercice.m, exercice.base)}\\right)^{2}\\cdot ${exercice.base}^{${exposantAffineLatex(exercice.m, exercice.n)}}`,
    };
  }
  return { texte: "Ici, la dérivée seconde se factorise :", latex: `f''(x)=${formatCoefFois(exercice.a, "e^{x}")}(2+x)` };
}

export function aideGraphiqueNiveau1(exercice: ExerciceEtudeFonctionExponentielle): AideAvecLatex {
  if (exercice.famille === "A") return { texte: "Compare chaque graphique à ton étude : sens de variation, concavité (sans point d'inflexion ici) et asymptote.", latex: null };
  if (exercice.famille === "B") return { texte: "Compare chaque graphique à ton étude : l'asymptote verticale n'existe que d'un seul côté de la valeur exclue.", latex: null };
  if (exercice.famille === "C") return { texte: "Compare chaque graphique à ton étude : la courbe se rapproche d'une droite oblique en −∞ et n'a qu'un seul minimum.", latex: null };
  return { texte: "Compare chaque graphique à ton étude : l'extremum et le point d'inflexion doivent être aux bonnes abscisses, dans le bon ordre.", latex: null };
}

export function aideGraphiqueNiveau2(exercice: ExerciceEtudeFonctionExponentielle): AideAvecLatex {
  if (exercice.famille === "A") return { texte: "Sens de variation attendu :", latex: exercice.croissance.type === "croissante_partout" ? "\\nearrow" : "\\searrow" };
  if (exercice.famille === "B") return { texte: "Côté de l'asymptote verticale :", latex: `x \\to ${exercice.p}^{${exercice.coteAsymptoteVerticale === "plus" ? "+" : "-"}}` };
  if (exercice.famille === "C") return { texte: "Position du minimum :", latex: `x=${positionLatex(exercice.croissance.position ?? 0)}` };
  return { texte: exercice.a > 0 ? "Ici, f a un minimum en −1." : "Ici, f a un maximum en −1.", latex: null };
}

export { formatXMoinsP };

// ============================================================================
// Récapitulatif final (`ResultatPanelEtudeFonctionExponentielle.tsx`) — un libellé + un contenu
// PAR ÉCRAN (toujours les 6 mêmes, séquence FIXE — voir `moteur6e/typesEtudeFonctionExponentielle.ts`),
// jamais un score fractionnaire `X/100` (voir CLAUDE.md, "Récapitulatif final à plat, coloré").
// ============================================================================

export const LIBELLE_PHASE_ETUDE: Record<PhaseEtudeFonctionExponentielle, string> = {
  domaine: "Domaine",
  limites: "Limites",
  asymptotes: "Asymptotes",
  croissance: "Croissance",
  concavite: "Concavité",
  graphique: "Graphique",
};

export interface ContenuRecap {
  texte: string | null;
  latex: string | null;
}

function formatCibleLimiteLatex(cible: CibleLimite): string {
  if (cible.type === "plus_infini") return "+\\infty";
  if (cible.type === "moins_infini") return "-\\infty";
  if (cible.type === "zero") return "0";
  return String(cible.valeur);
}

function formatLimitesRecapLatex(exercice: ExerciceEtudeFonctionExponentielle): string {
  const labels = directionLabels(exercice);
  const valeurs: CibleLimite[] =
    exercice.famille === "B"
      ? [exercice.limitePointPlus, exercice.limitePointMoins, exercice.limitePlusInfini, exercice.limiteMoinsInfini]
      : [exercice.limitePlusInfini, exercice.limiteMoinsInfini];
  const lignes = labels.map((l, i) => `\\lim\\limits_{${l.latex}}f(x)=${formatCibleLimiteLatex(valeurs[i])}`);
  return `\\begin{gathered} ${lignes.join(" \\\\ ")} \\end{gathered}`;
}

function formatAsymptotesRecapLatex(exercice: ExerciceEtudeFonctionExponentielle): string {
  if (exercice.famille === "B") {
    const cote = exercice.coteAsymptoteVerticale === "plus" ? "+" : "-";
    return `\\begin{gathered} \\text{Verticale (}x\\to ${exercice.p}^{${cote}}\\text{)} : ${formatEquationAsymptoteLatex(exercice.asymptoteVerticale)} \\\\ \\text{Horizontale} : ${formatEquationAsymptoteLatex(exercice.asymptoteHorizontale)} \\end{gathered}`;
  }
  const labels = directionLabels(exercice);
  // Famille C : coefficient de l'asymptote oblique écrit SYMBOLIQUEMENT (« -2\ln(2)\,x »), jamais
  // le flottant `cible.a` (« y=-1.386…x » s'affichait dans la réponse attendue et le récapitulatif).
  const equation = (cible: CibleAsymptote) =>
    exercice.famille === "C" && cible.type === "oblique" ? `y=-${formatCoefficientCLatex(exercice.m, exercice.base, exercice.p)}\\,x` : formatEquationAsymptoteLatex(cible);
  return `\\begin{gathered} ${labels[0].latex} : ${equation(exercice.asymptotePlusInfini)} \\\\ ${labels[1].latex} : ${equation(exercice.asymptoteMoinsInfini)} \\end{gathered}`;
}

/** Contenu affiché par la `LigneRecap` d'un écran donné — LA RÉPONSE RÉELLEMENT ATTENDUE de cet
 * écran, jamais recalculée depuis un score (voir CLAUDE.md), dérivée uniquement des champs déjà
 * figés à la génération. */
export function contenuRecapPhase(exercice: ExerciceEtudeFonctionExponentielle, phase: PhaseEtudeFonctionExponentielle): ContenuRecap {
  switch (phase) {
    case "domaine":
      return { texte: null, latex: formatEnsembleReelLatex(exercice.domaine) };
    case "limites":
      return { texte: null, latex: formatLimitesRecapLatex(exercice) };
    case "asymptotes":
      return { texte: null, latex: formatAsymptotesRecapLatex(exercice) };
    case "croissance": {
      const c = exercice.croissance;
      // Famille B : monotone sur CHAQUE intervalle du domaine, pas « partout » (f n'est pas monotone sur
      // ℝ \ {p} : elle repart de +∞ ou de 0 de l'autre côté du point exclu).
      const ou = exercice.famille === "B" ? "sur chaque intervalle du domaine" : "sur ℝ";
      if (c.type === "croissante_partout") return { texte: `Croissante ${ou}`, latex: null };
      if (c.type === "decroissante_partout") return { texte: `Décroissante ${ou}`, latex: null };
      return { texte: null, latex: `\\text{${c.type === "minimum" ? "Minimum" : "Maximum"} en } x=${positionLatex(c.position ?? 0)}` };
    }
    case "concavite": {
      const c = exercice.concavite;
      if (c.type === "convexe_partout") return { texte: exercice.famille === "B" ? "Convexe sur chaque intervalle du domaine" : "Convexe sur ℝ", latex: null };
      if (c.type === "concave_partout") return { texte: exercice.famille === "B" ? "Concave sur chaque intervalle du domaine" : "Concave sur ℝ", latex: null };
      return { texte: null, latex: `\\text{Point d'inflexion en } x=${positionLatex(c.position ?? 0)}` };
    }
    case "graphique":
      // Lettre des graphiques de l'écran (`EtapeSelectionGraphiqueQCM` : A, B, C, D) et du papier.
      return { texte: `Graphique ${"ABCD"[exercice.indexCorrect] ?? exercice.indexCorrect + 1}`, latex: null };
  }
}

// ============================================================================
// Bloc "état actuel" — CORRECTIF AUDIT (voir CLAUDE.md, "audit état actuel cumulatif" : le chapitre
// 2 entier avait été raté, aucun écran de 6gen11 ne rappelait quoi que ce soit). Séquence à 6
// écrans FIXES, TOUJOURS la même pour les 4 familles (`moteur6e/typesEtudeFonctionExponentielle.ts`)
// — `etatActuel` ACCUMULE un fragment par écran DÉJÀ CONFIRMÉ, du tout premier (domaine) jusqu'à
// celui qui précède immédiatement `phase` (jamais seulement ce dernier), réutilisant TEL QUEL le
// contenu déjà calculé par `contenuRecapPhase` (LA réponse réellement attendue de cet écran, jamais
// recalculée) — un seul et même calcul alimente donc le récapitulatif final ET ce rappel progressif.
// `null` sur le tout premier écran (domaine), rien à rappeler.
// ============================================================================

const ORDRE_PHASES_ETAT: PhaseEtudeFonctionExponentielle[] = ["domaine", "limites", "asymptotes", "croissance", "concavite", "graphique"];

/** Libellé accordé (genre/nombre) pour la ligne de rappel — distinct de `LIBELLE_PHASE_ETUDE`
 * (libellés courts, non accordés, du récapitulatif final). */
const LIBELLE_ETAT_PHASE: Record<PhaseEtudeFonctionExponentielle, string> = {
  domaine: "Domaine confirmé",
  limites: "Limites confirmées",
  asymptotes: "Asymptotes confirmées",
  croissance: "Croissance confirmée",
  concavite: "Concavité confirmée",
  graphique: "Graphique confirmé",
};

function ligneEtatPhase(exercice: ExerciceEtudeFonctionExponentielle, phase: PhaseEtudeFonctionExponentielle): string {
  const { texte, latex } = contenuRecapPhase(exercice, phase);
  const contenu = latex ?? `\\text{${texte}}`;
  return `\\text{${LIBELLE_ETAT_PHASE[phase]} : } ${contenu}`;
}

/** Bloc "état actuel" — un fragment LaTeX par écran DÉJÀ CONFIRMÉ, ACCUMULÉS depuis le tout premier
 * écran (`domaine`), jamais seulement l'écran immédiatement précédent (voir CLAUDE.md,
 * "Structure d'écran... bloc état actuel..."). `null` sur `domaine` (rien à rappeler). */
export function etatActuel(exercice: ExerciceEtudeFonctionExponentielle, phase: PhaseEtudeFonctionExponentielle): string[] | null {
  const index = ORDRE_PHASES_ETAT.indexOf(phase);
  if (index <= 0) return null;
  return ORDRE_PHASES_ETAT.slice(0, index).map((p) => ligneEtatPhase(exercice, p));
}

