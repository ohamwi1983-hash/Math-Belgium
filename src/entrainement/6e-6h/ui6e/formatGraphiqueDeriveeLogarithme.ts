import type { CandidatDeriveeLogA, CandidatDeriveeLogB, CandidatDeriveeLogC, ExerciceGraphiqueDeriveeLogarithme } from "../core6e/graphiqueDeriveeLogarithme.types";
import { assurerAxesVisibles } from "../ui/mafsTransformation";

/**
 * Couche présentation (6e) — formatage LaTeX, évaluation des 4 candidats (pour le rendu Mafs) et
 * textes de consigne/aide pour `6gen20`. Consigne générale et bloc de données (f(x)) redondants
 * sur chaque écran. Chaque aide porteuse de formule utilise le motif `{texte, latex}` — jamais du
 * LaTeX brut mêlé au texte (convention établie ailleurs sur ce chantier, voir CLAUDE.md).
 */
export const CONSIGNE_GENERALE = "Voici l'expression et le graphique d'une fonction f.";

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

// ============================================================================
// Formatage LaTeX de f(x) — jamais de coefficient ±1 littéral affiché.
// ============================================================================

/** `""`/`"-"`/`"2"` — jamais un coefficient `±1` littéral, pour préfixer un corps de formule. */
function formatCoefLatex(k: number): string {
  if (k === 1) return "";
  if (k === -1) return "-";
  return `${k}`;
}

/** « + c » / « − 1 » / rien si c = 0. */
function formatConstante(c: number): string {
  if (c === 0) return "";
  return c > 0 ? ` + ${c}` : ` - ${-c}`;
}

/** e^{x} / e^{2x} — jamais « e^{1x} ». */
function formatExpAx(a: number): string {
  return a === 1 ? "e^{x}" : `e^{${a}x}`;
}

export function formatFonctionLatex(exercice: ExerciceGraphiqueDeriveeLogarithme): string {
  switch (exercice.famille) {
    case "A": {
      const logPart = exercice.baseEstE ? "\\ln(x)" : `\\log_{${exercice.base}}(x)`;
      return `f(x) = \\dfrac{${formatCoefLatex(exercice.k)}${logPart}}{x}${formatConstante(exercice.c)}`;
    }
    case "B":
      return `f(x) = ${formatCoefLatex(exercice.k)}\\,${formatExpAx(exercice.a)}\\ln(x)${formatConstante(exercice.c)}`;
    case "C": {
      const termeP = exercice.p === 0 ? "" : exercice.p > 0 ? ` + ${formatCoefLatex(exercice.p)}x` : ` - ${formatCoefLatex(-exercice.p)}x`;
      return `f(x) = ${formatCoefLatex(exercice.k)}\\,x\\ln(x)${termeP}${formatConstante(exercice.c)}`;
    }
  }
}

/** Évaluation de f ELLE-MÊME (graphique donné à l'écran "selection"). */
export function evaluerFonction(exercice: ExerciceGraphiqueDeriveeLogarithme, x: number): number | null {
  if (x <= 0) return null;
  switch (exercice.famille) {
    case "A":
      return (exercice.k * Math.log(x)) / (x * (exercice.baseEstE ? 1 : Math.log(exercice.base))) + exercice.c;
    case "B":
      return exercice.k * Math.exp(exercice.a * x) * Math.log(x) + exercice.c;
    case "C":
      return exercice.k * x * Math.log(x) + exercice.p * x + exercice.c;
  }
}

/** Formule CORRECTE de f'(x), utilisée par le récapitulatif final. Reconstruite directement depuis
 * les paramètres BRUTS de l'exercice (`k`/`base`/`baseEstE`) — même principe que
 * `moteur6e/verificationGraphiqueDeriveeLogarithme.ts::referenceXDerivee`, jamais depuis la réponse
 * élève. */
export function formatDeriveeCorrecteLatex(exercice: ExerciceGraphiqueDeriveeLogarithme): string {
  switch (exercice.famille) {
    case "A": {
      const numerateur = `${formatCoefLatex(exercice.k)}\\left(1-\\ln(x)\\right)`;
      const denominateur = exercice.baseEstE ? "x^{2}" : `x^{2}\\ln(${exercice.base})`;
      return `f'(x) = \\dfrac{${numerateur}}{${denominateur}}`;
    }
    case "B": {
      const termeLn = exercice.a === 1 ? "\\ln(x)" : `${exercice.a}\\ln(x)`;
      return `f'(x) = ${formatCoefLatex(exercice.k)}\\,${formatExpAx(exercice.a)}\\left(${termeLn}+\\dfrac{1}{x}\\right)`;
    }
    case "C": {
      const constante = exercice.k + exercice.p;
      return `f'(x) = ${formatCoefLatex(exercice.k)}\\ln(x)${formatConstante(constante)}`;
    }
  }
}

// ============================================================================
// Évaluation des candidats — utilisée pour le tracé Mafs de chacune des 4 options. Chaque
// distracteur est une VRAIE fonction renvoyable, jamais une astuce de rendu déconnectée des
// données (voir l'en-tête de `core6e/graphiqueDeriveeLogarithme.types.ts` pour le détail de
// construction de chaque distracteur). Réimplémentation INDÉPENDANTE des références de
// `moteur6e/verificationGraphiqueDeriveeLogarithme.ts` (même formule "reel", jamais importée —
// même principe que `6gen8`).
// ============================================================================

export function evaluerCandidatA(c: CandidatDeriveeLogA, x: number): number | null {
  if (x <= 0) return null;
  const div = c.baseEstE ? 1 : Math.log(c.base);
  switch (c.type) {
    case "reel":
      return (c.k * (1 - Math.log(x))) / (x * x * div);
    case "signeInverse":
      return -(c.k * (1 - Math.log(x))) / (x * x * div);
    case "zeroMalPlace":
      return (c.k * (c.constanteNumerateur - Math.log(x))) / (x * x * div);
    case "monotone":
      return (c.k * (Math.log(x) - 1)) / div;
  }
}

export function evaluerCandidatB(c: CandidatDeriveeLogB, x: number): number | null {
  if (x <= 0) return null;
  const e = Math.exp(c.a * x);
  switch (c.type) {
    case "reel":
      return c.k * e * (c.a * Math.log(x) + 1 / x);
    case "signeInverse":
      return -c.k * e * (c.a * Math.log(x) + 1 / x);
    case "traverseZero":
      return c.k * c.a * e * Math.log(x);
    case "borneMauvaise":
      return c.k * (c.a * Math.log(x) + 1 / x);
  }
}

export function evaluerCandidatC(c: CandidatDeriveeLogC, x: number): number | null {
  if (x <= 0) return null;
  switch (c.type) {
    case "reel":
      return c.k * (Math.log(x) + c.constanteAdditive);
    case "signeInverse":
      return -c.k * (Math.log(x) + c.constanteAdditive);
    case "zeroMalPlace":
      return c.k * (Math.log(x) + c.constanteAdditive);
    case "formeEnPic":
      return (c.k * (1 - Math.log(x))) / (x * x);
  }
}

export function evaluerCandidat(exercice: ExerciceGraphiqueDeriveeLogarithme, index: number, x: number): number | null {
  switch (exercice.famille) {
    case "A":
      return evaluerCandidatA(exercice.candidats[index], x);
    case "B":
      return evaluerCandidatB(exercice.candidats[index], x);
    case "C":
      return evaluerCandidatC(exercice.candidats[index], x);
  }
}

// ============================================================================
// Fenêtre d'affichage commune aux 4 options — MÊME échelle sur les 4 (contrainte impérative,
// jamais dérivée du domaine du seul candidat réel, qui peut différer d'un distracteur à l'autre).
// Domaine mathématique x>0 pour les 3 familles — fenêtre toujours strictement à droite de 0.
// ============================================================================

export interface ViewBoxGraphiqueDeriveeLogarithme {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

function fenetreX(exercice: ExerciceGraphiqueDeriveeLogarithme): [number, number] {
  switch (exercice.famille) {
    case "A":
      // Zéro toujours en x=e≈2.72 ; "valeur élevée près de 0" (spec) visible dès 0.2, décroissance
      // franche visible jusqu'à x=7 (~2,6·e).
      return [0.2, 7];
    case "B":
      // ln(x)+1/x minimal en x=1 ; comportement aux 2 bornes (x→0+ ET x→+∞, tous deux vers +∞ en
      // magnitude, spec) visible sur une fenêtre resserrée (croissance/décroissance très rapide).
      return [0.08, 2.3];
    case "C": {
      // Fenêtre RELATIVE à l'extremum x0=e^(−s) ∈ [0,135 ; 1] : une fenêtre fixe [0,04 ; 2,6]
      // rendait le creux de f invisible pour x0≈0,135. Les zéros x0/e et x0·e du distracteur
      // "zeroMalPlace" restent dans [x0/5 ; 6·x0].
      const x0 = Math.exp(-(1 + exercice.p / exercice.k));
      return [Math.max(0.02, x0 / 5), 6 * x0];
    }
  }
}

/** Sous-intervalle X sur lequel l'ÉCHELLE Y est calculée (la courbe reste tracée sur toute la
 * fenêtre `fenetreX`). Famille A : la divergence en 1/x² près de 0 écrasait tout le reste — le
 * zéro de f' en x=e (et l'extremum de f) devenait invisible, deux candidats paraissaient
 * identiques. L'échelle est donc prise sur [1 ; 7], la partie proche de 0 sort du cadre. */
function fenetreEchelleX(exercice: ExerciceGraphiqueDeriveeLogarithme): [number, number] {
  switch (exercice.famille) {
    case "A":
      return [1, 7];
    case "B":
      return [0.3, 2.3];
    case "C": {
      const x0 = Math.exp(-(1 + exercice.p / exercice.k));
      return [x0 / 3, 6 * x0];
    }
  }
}

/**
 * Plafond de magnitude Y utilisé pour le calcul d'ÉCHELLE, PAR FAMILLE — une valeur qui le dépasse
 * est ignorée du calcul d'étendue Y (elle reste TRACÉE, `Plot.OfX` la porte simplement hors du
 * cadre visible ; seule sa contribution au calcul d'échelle est exclue). Même mécanisme que
 * `formatGraphiquesDeriveeExponentielles.ts` (6gen8) — un plafond sur la VALEUR (jamais sur une
 * distance) s'est révélé le seul mécanisme fiable là-bas pour éviter qu'une poignée de valeurs
 * extrêmes (ici : près de x→0⁺, où 1/x²/1/x divergent) n'écrase visuellement toute la fenêtre.
 */
const PLAFOND_STATS: Record<ExerciceGraphiqueDeriveeLogarithme["famille"], number> = {
  A: 20,
  B: 40,
  // 6 (et non 10) : le pic du distracteur "formeEnPic" près de 0 écrasait l'échelle, rendant le
  // décalage d'une unité du distracteur "zeroMalPlace" (k=±1) à peine visible.
  C: 6,
};

/** Densité de grille cible, partagée avec `GrapheOptionDeriveeLogarithme.tsx` (`GrilleAdaptative`)
 * — voir `CIBLE_NOMBRE_LIGNES_QCM` de `ui6e/formatGraphiquesCyclometriques.ts` (même rôle, même
 * précaution de synchronisation) pour la justification complète. */
export const CIBLE_NOMBRE_LIGNES_QCM = 6;

/** Composition finale du viewBox — voir `finaliserViewBox` de
 * `ui6e/formatGraphiquesCyclometriques.ts` pour la justification complète (`ratio=1` : conteneur
 * CARRÉ, jamais `RATIO_GRAPHE`). */
function finaliserViewBox(x: [number, number], y: [number, number]): ViewBoxGraphiqueDeriveeLogarithme {
  const { x: xFinal, y: yFinal } = assurerAxesVisibles({ x, y });
  return { xMin: xFinal[0], xMax: xFinal[1], yMin: yFinal[0], yMax: yFinal[1] };
}

/** Calcule la fenêtre d'affichage commune aux 4 candidats d'une instance — même échelle imposée
 * (contrainte de la spec). */
export function calculerViewBoxGraphique(exercice: ExerciceGraphiqueDeriveeLogarithme): ViewBoxGraphiqueDeriveeLogarithme {
  const [xMin, xMax] = fenetreX(exercice);
  const [eMin, eMax] = fenetreEchelleX(exercice);
  const plafond = PLAFOND_STATS[exercice.famille];
  const valeurs: number[] = [];
  for (let index = 0; index < exercice.candidats.length; index++) {
    for (let i = 0; i <= 80; i++) {
      const x = eMin + ((eMax - eMin) * i) / 80;
      const y = evaluerCandidat(exercice, index, x);
      if (y === null || !Number.isFinite(y)) continue;
      if (Math.abs(y) > plafond) continue;
      valeurs.push(y);
    }
  }
  if (valeurs.length === 0) return finaliserViewBox([xMin, xMax], [-1, 1]);
  const yMinBrut = Math.min(...valeurs);
  const yMaxBrut = Math.max(...valeurs);
  const marge = Math.max(0.05, (yMaxBrut - yMinBrut) * 0.15);
  return finaliserViewBox([xMin, xMax], [yMinBrut - marge, yMaxBrut + marge]);
}

/** Plafond de magnitude Y pour le graphique de f lui-même (même mécanisme que `PLAFOND_STATS`). */
const PLAFOND_FONCTION: Record<ExerciceGraphiqueDeriveeLogarithme["famille"], number> = {
  A: 12,
  B: 40,
  C: 10,
};

/** Fenêtre du graphique de f — MÊME étendue X que les 4 candidats (lecture verticale directe de
 * l'abscisse d'un extremum), étendue Y propre à f. */
export function calculerViewBoxFonction(exercice: ExerciceGraphiqueDeriveeLogarithme): ViewBoxGraphiqueDeriveeLogarithme {
  const [xMin, xMax] = fenetreX(exercice);
  const [eMin, eMax] = fenetreEchelleX(exercice);
  const plafond = PLAFOND_FONCTION[exercice.famille];
  const valeurs: number[] = [];
  for (let i = 0; i <= 120; i++) {
    const x = eMin + ((eMax - eMin) * i) / 120;
    const y = evaluerFonction(exercice, x);
    if (y === null || !Number.isFinite(y) || Math.abs(y) > plafond) continue;
    valeurs.push(y);
  }
  if (valeurs.length === 0) return finaliserViewBox([xMin, xMax], [-1, 1]);
  const yMinBrut = Math.min(...valeurs);
  const yMaxBrut = Math.max(...valeurs);
  const marge = Math.max(0.05, (yMaxBrut - yMinBrut) * 0.15);
  return finaliserViewBox([xMin, xMax], [yMinBrut - marge, yMaxBrut + marge]);
}

// ============================================================================
// Consignes/aides — 2 niveaux par écran, spec explicite pour chaque famille.
// ============================================================================

function formatNombreFr(v: number, decimales = 2): string {
  return Number(v.toFixed(decimales)).toString().replace(".", ",");
}

export function consigneEcranDerivee(): string {
  return "Calcule f'(x) — elle doit confirmer le graphique choisi à l'étape précédente.";
}

export function consigneEcranSelection(): string {
  return "En lisant le graphique de f (variations, extremums, pentes), sélectionne le graphique qui représente f'(x).";
}

/** Exemple de saisie SANS rapport avec les formes attendues (jamais une réponse, jamais un gabarit
 * dont il suffirait de changer un coefficient). */
export function placeholderDerivee(): string {
  return "ex : 4*x*ln(x)-1/x";
}

export function aideDeriveeNiveau1(exercice: ExerciceGraphiqueDeriveeLogarithme): AideAvecLatex {
  const rappelC = "La dérivée d'une constante est nulle.";
  switch (exercice.famille) {
    case "A":
      return {
        texte: `Règle du quotient, appliquée à ln(x)/x — divise ensuite le tout par ln(base) (sauf si base=e). ${rappelC}`,
        latex: "\\left(\\dfrac{u}{v}\\right)' = \\dfrac{u'v-uv'}{v^2}, \\quad u=\\ln(x),\\ v=x",
      };
    case "B":
      return {
        texte: `Règle du produit, avec la dérivée de e^(ax) et celle de ln(x). ${rappelC}`,
        latex: "(uv)' = u'v+uv', \\quad u=e^{ax},\\ u'=a\\,e^{ax},\\ v=\\ln(x),\\ v'=\\dfrac{1}{x}",
      };
    case "C":
      return {
        texte: `Règle du produit pour x·ln(x) ; le terme p·x se dérive en p. ${rappelC}`,
        latex: "(uv)' = u'v+uv', \\quad u=x,\\ v=\\ln(x)",
      };
  }
}

export function aideDeriveeNiveau2(exercice: ExerciceGraphiqueDeriveeLogarithme): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return {
        texte: "Numérateur de la règle du quotient pour ln(x)/x, AVANT simplification (u=ln(x), v=x) :",
        latex: "u'v - uv' = \\dfrac{1}{x}\\cdot x - \\ln(x)\\cdot 1",
      };
    case "B": {
      const ea = formatExpAx(exercice.a);
      const da = exercice.a === 1 ? "" : `${exercice.a}`;
      return {
        texte: "Les deux termes de la règle du produit pour e^(ax)·ln(x), séparément — non encore combinés :",
        latex: `u'v = ${da}${ea}\\ln(x), \\quad uv' = ${ea}\\cdot\\dfrac{1}{x}`,
      };
    }
    case "C":
      return {
        texte: "Les deux termes de la règle du produit pour x·ln(x), affichés — simplification non faite :",
        latex: "u'v = 1\\cdot\\ln(x), \\quad uv' = x\\cdot\\dfrac{1}{x}",
      };
  }
}

/** Abscisse de l'extremum de f (zéro de f'), `null` pour la famille B (aucun extremum). */
export function abscisseExtremum(exercice: ExerciceGraphiqueDeriveeLogarithme): number | null {
  if (exercice.famille === "A") return Math.E;
  if (exercice.famille === "C") return Math.exp(-(1 + exercice.p / exercice.k));
  return null;
}

export function aideSelectionNiveau1(): AideAvecLatex {
  return {
    texte: "Lis les variations de f sur son graphique : là où f croît, f'(x) > 0 (au-dessus de l'axe) ; là où f décroît, f'(x) < 0 ; à un maximum ou un minimum de f, f'(x) = 0. Élimine les graphiques qui ne respectent pas ces signes.",
    latex: null,
  };
}

export function aideSelectionNiveau2(exercice: ExerciceGraphiqueDeriveeLogarithme): AideAvecLatex {
  const xe = abscisseExtremum(exercice);
  if (xe !== null) {
    return {
      texte: `Repère l'abscisse de l'extremum de f sur son graphique (x ≈ ${formatNombreFr(xe)}) : le graphique de f' doit couper l'axe des x EXACTEMENT à cette abscisse — vérifie ensuite son signe de part et d'autre.`,
      latex: null,
    };
  }
  return {
    texte: "f n'a ni maximum ni minimum : f' ne s'annule jamais. Pour départager les graphiques restants, estime la pente de la tangente à f en x = 1 et compare-la à la valeur lue en x = 1 sur chaque graphique.",
    latex: null,
  };
}
