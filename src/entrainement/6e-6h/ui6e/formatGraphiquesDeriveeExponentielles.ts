import type {
  CandidatDeriveeA,
  CandidatDeriveeB,
  CandidatDeriveeC,
  CandidatDeriveeD,
  ExerciceGraphiqueDeriveeExponentielle,
} from "../core6e/graphiquesDeriveeExponentielles.types";
import type { PhaseGraphiqueDeriveeExponentielle, ResultatExerciceGraphiqueDeriveeExponentielle } from "../moteur6e/typesGraphiquesDeriveeExponentielles";
import { assurerAxesVisibles } from "../ui/mafsTransformation";

/**
 * Couche présentation (6e) — formatage LaTeX, évaluation des 4 candidats (pour le rendu Mafs) et
 * textes de consigne/aide pour `6gen8`. Consigne générale et bloc de données (f(x)) redondants sur
 * chaque écran. Chaque aide porteuse de formule utilise le motif `{texte, latex}` — jamais du
 * LaTeX brut mêlé au texte (leçon déjà retenue à plusieurs reprises sur ce chantier — voir
 * CLAUDE.md, sections 6gen2/6gen3/6gen4/6gen9).
 */
export const CONSIGNE_GENERALE = "Voici l'expression d'une fonction f.";

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

// ============================================================================
// Formatage LaTeX de f(x) — un helper par famille, jamais de coefficient ±1 littéral affiché.
// ============================================================================

/** Fraction exacte pour une base non entière (`0,5→1/2`, `0,25→1/4`, `0,2→1/5`) — jamais de
 * notation décimale pour une valeur GÉNÉRÉE par la plateforme (convention transversale). */
function formatBaseLatex(base: number): string {
  if (Number.isInteger(base)) return String(base);
  for (let den = 2; den <= 10; den++) {
    const num = Math.round(base * den);
    if (Math.abs(num / den - base) < 1e-9) return `\\dfrac{${num}}{${den}}`;
  }
  return base.toFixed(2);
}

/** `${coef}${corps}` sans jamais afficher un coefficient `±1` littéral. */
function formatCoefFois(coef: number, corps: string): string {
  if (coef === 1) return corps;
  if (coef === -1) return `-${corps}`;
  return `${coef}${corps}`;
}

/** `kx` ou `-x`/`x` pour `k=±1` — coefficient entier de x dans un exposant. */
function formatCoeffX(k: number): string {
  if (k === 1) return "x";
  if (k === -1) return "-x";
  return `${k}x`;
}

export function formatFonctionLatex(exercice: ExerciceGraphiqueDeriveeExponentielle): string {
  switch (exercice.famille) {
    case "A": {
      const corpsSigne = exercice.a < 0 ? `-${formatCoefFois(-exercice.a, "x")}` : formatCoefFois(exercice.a, "x");
      return `f(x) = ${corpsSigne}\\,e^{x}`;
    }
    case "B": {
      const b = formatBaseLatex(exercice.base);
      return `f(x) = \\dfrac{${b}^{x}}{${b}^{x}+1}`;
    }
    case "C": {
      const kx = formatCoeffX(exercice.k);
      const kxNeg = formatCoeffX(-exercice.k);
      return `f(x) = \\dfrac{e^{${kx}}+e^{${kxNeg}}}{2}`;
    }
    case "D": {
      const kx = formatCoeffX(exercice.k);
      return `f(x) = \\dfrac{1}{e^{${kx}}-1}`;
    }
  }
}

// ============================================================================
// Évaluation des candidats — utilisée pour le tracé Mafs de chacune des 4 options. Chaque
// distracteur est une VRAIE fonction renvoyable, jamais une astuce de rendu déconnectée des
// données (voir l'en-tête de `core6e/graphiquesDeriveeExponentielles.types.ts` pour le détail de
// construction de chaque distracteur).
// ============================================================================

export function evaluerCandidatA(c: CandidatDeriveeA, x: number): number {
  if (c.monotone) return c.a * Math.exp(x);
  return c.a * Math.exp(x) * (1 + x + c.decalageExtremum);
}

export function evaluerCandidatB(c: CandidatDeriveeB, x: number): number {
  const lnBase = Math.log(c.base);
  switch (c.type) {
    case "reel": {
      const u = Math.pow(c.base, x);
      return (u * lnBase) / ((u + 1) * (u + 1));
    }
    case "signeInverse": {
      const u = Math.pow(c.base, x);
      return -(u * lnBase) / ((u + 1) * (u + 1));
    }
    case "traverseZero": {
      const u = Math.pow(c.base, x);
      return (u * lnBase * (u - 1)) / ((u + 1) * (u + 1));
    }
    case "positionDecalee": {
      const u = Math.pow(c.base, x - c.decalage);
      return (u * lnBase) / ((u + 1) * (u + 1));
    }
  }
}

export function evaluerCandidatC(c: CandidatDeriveeC, x: number): number {
  switch (c.type) {
    case "reel":
      return (c.k * (Math.exp(c.k * x) - Math.exp(-c.k * x))) / 2;
    case "paire":
      return (c.k * (Math.exp(c.k * x) + Math.exp(-c.k * x))) / 2;
    case "bornee":
      return c.k * Math.tanh(x);
    case "echelle":
      return (c.facteurAffiche * (Math.exp(c.k * x) - Math.exp(-c.k * x))) / 2;
  }
}

/** Marge d'exclusion AUTOUR de x=0 (le pôle réel, quel que soit k) — le candidat "continu" n'y est
 * jamais soumis (aucune singularité pour lui). Sans cette marge, un échantillonnage Mafs pourrait
 * tomber exactement sur x=0 (division par zéro exacte → `Infinity`), risquant la même cascade
 * d'erreurs `NaN` déjà rencontrée sur un graphe similaire ailleurs sur la plateforme — voir
 * CLAUDE.md. */
const MARGE_ASYMPTOTE_D = 0.12;

export function evaluerCandidatD(c: CandidatDeriveeD, x: number): number | null {
  if (c.type === "continu") return -c.k * Math.exp(-c.k * x);
  if (Math.abs(x) < MARGE_ASYMPTOTE_D) return null;
  const u = Math.exp(c.k * x);
  if (c.type === "signeInverse") return (c.k * u) / ((u - 1) * (u - 1));
  if (c.type === "sansCarre") return (-c.k * u) / (u - 1);
  return (-c.k * u) / ((u - 1) * (u - 1));
}

export function evaluerCandidat(exercice: ExerciceGraphiqueDeriveeExponentielle, index: number, x: number): number | null {
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
// Fenêtre d'affichage commune aux 4 options — MÊME échelle sur les 4 (contrainte impérative,
// jamais dérivée du domaine du seul candidat réel, qui peut différer d'un distracteur à l'autre).
// La largeur en x est bornée PAR FAMILLE pour garder des magnitudes Y raisonnables (voir
// CLAUDE.md, familles A/C — croissance exponentielle non bornée — et D — pôle en x=0).
// ============================================================================

export interface ViewBoxGraphiqueDeriveeExpo {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

function fenetreX(exercice: ExerciceGraphiqueDeriveeExponentielle): [number, number] {
  switch (exercice.famille) {
    case "A":
      // Extremum toujours en x=-2 ; f' décroît vite vers 0 à gauche, explose vite à droite
      // (facteur e^x). La fenêtre reste large (le plafond `PLAFOND_STATS`, ci-dessous, borne
      // l'échelle Y — voir sa note) pour que le comportement croissant reste visible avant de
      // sortir du cadre.
      return [-6, 2];
    case "B":
      // Bosse toujours centrée en x=0 (±decalage≤2) — décroissance très rapide (double
      // exponentielle) de part et d'autre, une fenêtre large reste sûre (déjà BORNÉE par
      // construction, aucun plafond nécessaire).
      return [-6, 6];
    case "C": {
      // Croissance exponentielle en e^(k·x) des deux côtés (fonction impaire, non bornée) —
      // fenêtre INVERSEMENT proportionnelle à k, en PLUS du plafond générique ci-dessous (double
      // garde, k=3 croît trop vite pour ne compter que sur l'un des deux mécanismes seul).
      const xBound = Math.min(3, 3.5 / exercice.k);
      return [-xBound, xBound];
    }
    case "D":
      // Pôle toujours en x=0 (indépendant de k) — fenêtre symétrique fixe, la marge
      // `MARGE_ASYMPTOTE_D` empêche déjà toute valeur infinie/NaN.
      return [-3, 3];
  }
}

/**
 * Plafond de magnitude Y utilisé pour le calcul d'ÉCHELLE, PAR FAMILLE — une valeur qui le dépasse
 * est ignorée du calcul d'étendue Y (elle reste TRACÉE, `Plot.OfX` la porte simplement hors du
 * cadre visible ; seule sa contribution au calcul d'échelle est exclue). `B` n'a pas d'entrée : sa
 * courbe est déjà BORNÉE par construction (décroissance à 0 aux deux infinis), aucun plafond
 * nécessaire.
 *
 * **Bug trouvé par vérification Playwright, corrigé** — la première version de ce module ne
 * plafonnait QUE la famille D (seule source de pôle) ; en pratique, la famille A (croissance
 * `e^x` non bornée, jusqu'à un facteur `a·(1+x+décalage)` avec `|a|≤3` et `décalage` jusqu'à ±3)
 * produisait elle aussi des magnitudes de plusieurs centaines en bord de fenêtre, écrasant les 4
 * graphiques du QCM en 4 traits quasi verticaux indiscernables (capture confirmée avant correctif)
 * — même classe de défaut que celle déjà documentée sur un graphe similaire ailleurs sur la
 * plateforme. Étendu à A et C par le même mécanisme plutôt qu'un correctif ponctuel. Un simple
 * seuil de DISTANCE (plutôt que de VALEUR) s'est révélé insuffisant lors d'un correctif antérieur
 * similaire (voir la note historique sur ce projet) — un plafond sur la valeur elle-même reste
 * donc le seul mécanisme retenu, ici comme pour D.
 */
const PLAFOND_STATS: Partial<Record<ExerciceGraphiqueDeriveeExponentielle["famille"], number>> = {
  A: 30,
  C: 25,
  D: 60,
};

/** Densité de grille cible, partagée avec `GrapheOptionDeriveeExpo.tsx` (`GrilleAdaptative`) — voir
 * `CIBLE_NOMBRE_LIGNES_QCM` de `ui6e/formatGraphiquesCyclometriques.ts` (même rôle, même précaution
 * de synchronisation) pour la justification complète. */
export const CIBLE_NOMBRE_LIGNES_QCM = 6;

/** Composition finale du viewBox — voir `finaliserViewBox` de
 * `ui6e/formatGraphiquesCyclometriques.ts` pour la justification complète (`ratio=1` : conteneur
 * CARRÉ, jamais `RATIO_GRAPHE`). */
function finaliserViewBox(x: [number, number], y: [number, number]): ViewBoxGraphiqueDeriveeExpo {
  const { x: xFinal, y: yFinal } = assurerAxesVisibles({ x, y });
  return { xMin: xFinal[0], xMax: xFinal[1], yMin: yFinal[0], yMax: yFinal[1] };
}

/** Calcule la fenêtre d'affichage commune aux 4 candidats d'une instance — même échelle imposée
 * (contrainte de la spec). */
export function calculerViewBoxGraphique(exercice: ExerciceGraphiqueDeriveeExponentielle): ViewBoxGraphiqueDeriveeExpo {
  const [xMin, xMax] = fenetreX(exercice);
  const plafond = PLAFOND_STATS[exercice.famille];
  const valeurs: number[] = [];
  for (let index = 0; index < exercice.candidats.length; index++) {
    for (let i = 0; i <= 80; i++) {
      const x = xMin + ((xMax - xMin) * i) / 80;
      const y = evaluerCandidat(exercice, index, x);
      if (y === null || !Number.isFinite(y)) continue;
      if (plafond !== undefined && Math.abs(y) > plafond) continue;
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
// Consignes/aides — 2 niveaux par écran, spec explicite pour chaque famille.
// ============================================================================

export function consigneEcranDerivee(): string {
  return "Calcule f'(x).";
}

/** Rappel du domaine — UNIQUEMENT pour la famille D (point exclu x=0, quel que soit k), toujours
 * affiché (jamais gagné par une aide) — spec explicite : "Domaine rappelé : x≠0". */
export function rappelDomaineDerivee(exercice: ExerciceGraphiqueDeriveeExponentielle): string | null {
  return exercice.famille === "D" ? "Rappel : le domaine de f exclut x=0." : null;
}

export function consigneEcranSelection(): string {
  return "Sélectionne le graphique qui représente la dérivée f'(x).";
}

export function placeholderDerivee(exercice: ExerciceGraphiqueDeriveeExponentielle): string {
  return exercice.famille === "D" ? "ex : -1*e^(2*x)/(e^(2*x)-1)^2" : "ex : 2^x*ln(2)/(2^x+1)^2";
}

function formatValeurEnMoins2A(a: number): string {
  // f'(-2) = a·e^{-2}·(1+(-2)) = -a·e^{-2}
  const coef = -a;
  if (coef === 1) return "e^{-2}";
  if (coef === -1) return "-e^{-2}";
  return `${coef}e^{-2}`;
}

export function aideDeriveeNiveau1(exercice: ExerciceGraphiqueDeriveeExponentielle): AideAvecLatex {
  switch (exercice.famille) {
    case "B":
      return { texte: "Rappel de la règle de dérivation d'un quotient :", latex: "\\left(\\dfrac{u}{v}\\right)' = \\dfrac{u'v-uv'}{v^2}" };
    case "D":
      return { texte: "Rappel de la règle de dérivation de 1/u :", latex: "\\left(\\dfrac{1}{u}\\right)' = -\\dfrac{u'}{u^2}" };
    default:
      return { texte: "", latex: null };
  }
}

export function aideDeriveeNiveau2(exercice: ExerciceGraphiqueDeriveeExponentielle): AideAvecLatex {
  switch (exercice.famille) {
    case "B": {
      const b = formatBaseLatex(exercice.base);
      return {
        texte: "Numérateur du quotient, AVANT simplification (u=base^x, v=base^x+1, u'=v'=ln(base)·base^x) :",
        latex: `u'v-uv' = \\ln(${b})\\,${b}^{x}\\left(${b}^{x}+1\\right) - ${b}^{x}\\cdot\\ln(${b})\\,${b}^{x}`,
      };
    }
    case "D": {
      const kx = formatCoeffX(exercice.k);
      const uPrimeCoef = exercice.k === 1 ? `e^{${kx}}` : exercice.k === -1 ? `-e^{${kx}}` : `${exercice.k}\\,e^{${kx}}`;
      return { texte: "u et u', séparément — non encore assemblés :", latex: `u = e^{${kx}}-1, \\quad u' = ${uPrimeCoef}` };
    }
    default:
      return { texte: "", latex: null };
  }
}

/**
 * Formule CORRECTE de f'(x), utilisée par le récapitulatif final (`ResultatPanelGraphiqueDeriveeExponentielle.tsx`)
 * — familles B/D uniquement (A/C n'ont jamais d'écran "derivee", `scoreDerivee` reste `null` pour
 * elles, jamais appelée dans ce cas). Reconstruite directement depuis les paramètres BRUTS de
 * l'exercice (`base`/`k`), même principe que `moteur6e/verificationGraphiquesDeriveeExponentielles.ts::referenceBDerivee/referenceDDerivee`
 * — jamais depuis la réponse élève.
 */
export function formatDeriveeCorrecteLatex(exercice: ExerciceGraphiqueDeriveeExponentielle): string | null {
  switch (exercice.famille) {
    case "B": {
      const b = formatBaseLatex(exercice.base);
      return `f'(x) = \\dfrac{\\ln(${b})\\,${b}^{x}}{\\left(${b}^{x}+1\\right)^2}`;
    }
    case "D": {
      const kx = formatCoeffX(exercice.k);
      return `f'(x) = \\dfrac{${formatCoefFois(-exercice.k, `e^{${kx}}`)}}{\\left(e^{${kx}}-1\\right)^2}`;
    }
    default:
      return null;
  }
}

/**
 * Bloc "état actuel" (audit état actuel cumulatif, ch.2) — séquence DÉPENDANTE de la famille (voir
 * `moteur6e/typesGraphiquesDeriveeExponentielles.ts`) : familles A/C n'ont QU'UN écran ("selection"
 * est alors le PREMIER écran de leur séquence, rien à rappeler) ; familles B/D ont 2 écrans
 * ("derivee" TOUJOURS premier de sa famille, rien à rappeler non plus, puis "selection" qui SUIT
 * "derivee" — rappelle alors la dérivée CORRECTE déjà confirmée, jamais la saisie brute de l'élève,
 * conformément à `formatDeriveeCorrecteLatex` ci-dessus, déjà utilisée pour le même besoin sur le
 * récapitulatif final). Un seul écran précédent possible ici (séquence à 2 écrans maximum) —
 * jamais besoin d'accumuler plusieurs fragments comme sur `formatExponentiellesProblemes.ts`.
 */
export function etatActuel(exercice: ExerciceGraphiqueDeriveeExponentielle, phase: PhaseGraphiqueDeriveeExponentielle): string[] | null {
  if (phase !== "selection") return null;
  const derivee = formatDeriveeCorrecteLatex(exercice);
  if (derivee === null) return null;
  return [`\\text{Dérivée confirmée : } ${derivee}`];
}

/**
 * Total points du récapitulatif final — complément AJOUTÉ à côté de la liste `LigneRecap` colorée
 * (jamais à sa place, voir `ResultatPanelGraphiqueDeriveeExponentielle.tsx`). Somme les scores DÉJÀ
 * calculés par `sessionGraphiquesDeriveeExponentielles.ts` (pénalité par tentative + par niveau
 * d'aide déjà appliquée, forcé à 0 sur révélation) pour les seuls écrans RÉELLEMENT traversés —
 * `scoreDerivee===null` pour les familles A/C (pas d'écran "derivee"), donc `maximum=100` pour
 * elles contre `200` pour B/D (2 écrans). Volontairement PAS aligné sur le statut vert/orange/rouge
 * de `LigneRecap` : un écran vert (résolu sans aide, éventuellement après un essai raté) peut très
 * bien contribuer moins que 100/100 — décision explicite de l'utilisateur, voir `docs/historique-6e.md`.
 */
export function calculerTotalRecapGraphiqueDeriveeExponentielle(resultat: ResultatExerciceGraphiqueDeriveeExponentielle): { total: number; maximum: number } {
  if (resultat.scoreDerivee === null) {
    return { total: resultat.scoreSelection, maximum: 100 };
  }
  return { total: resultat.scoreDerivee + resultat.scoreSelection, maximum: 200 };
}

export function aideSelectionNiveau1(exercice: ExerciceGraphiqueDeriveeExponentielle): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return { texte: "Dériver un produit crée un terme supplémentaire qui peut introduire un extremum absent de l'exponentielle seule.", latex: null };
    case "B":
      return { texte: "Le signe de f' est déterminé UNIQUEMENT par le signe de ln(base) — il ne change jamais.", latex: null };
    case "C":
      return { texte: "Dériver une somme de deux exponentielles symétriques inverse la parité : une fonction PAIRE (f) donne une dérivée IMPAIRE (f').", latex: null };
    case "D":
      return { texte: "Le graphique doit présenter DEUX branches distinctes, séparées par une asymptote verticale en x=0 — jamais une courbe continue à cet endroit.", latex: null };
  }
}

export function aideSelectionNiveau2(exercice: ExerciceGraphiqueDeriveeExponentielle): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return { texte: "Valeur de f'(-2) — le signe indique un minimum ou un maximum, pas laquelle :", latex: `f'(-2) = ${formatValeurEnMoins2A(exercice.a)}` };
    case "B": {
      const b = formatBaseLatex(exercice.base);
      return { texte: "Valeur de f' en x=0 :", latex: `f'(0) = \\dfrac{\\ln(${b})}{4}` };
    }
    case "C":
      return { texte: "Valeur de f'(0) et pente de f' à l'origine (c'est-à-dire f''(0)) :", latex: `f'(0) = 0, \\quad f''(0) = ${exercice.k * exercice.k}` };
    case "D":
      return { texte: "Signe de f' (déterminé par -k) :", latex: `\\text{signe de } f'(x) = \\text{signe de } (${-exercice.k})` };
  }
}
