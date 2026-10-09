import type {
  CandidatEtudeLogA,
  CandidatEtudeLogB,
  CandidatEtudeLogC,
  CandidatEtudeLogD,
  CibleAsymptote,
  CibleConcaviteLog,
  ExerciceEtudeFonctionLogarithme,
  ExerciceEtudeLogE,
  ExerciceEtudeLogNonE,
} from "../core6e/etudeFonctionLogarithme.types";
import type { CibleLimite } from "../core6e/limitesExponentielles.types";
import type { DetailPhaseEtudeFonctionLogarithme, PhaseEtudeFonctionLogarithme, ResultatExerciceEtudeFonctionLogarithme } from "../moteur6e/typesEtudeFonctionLogarithme";
import { nombreEcrans } from "../moteur6e/typesEtudeFonctionLogarithme";
import { formatEnsembleReelLatex } from "./formatEnsembleReel";
import { assurerAxesVisibles } from "../ui/mafsTransformation";

/**
 * Couche présentation (6e) — formatage LaTeX, évaluation des candidats (rendu Mafs) et textes de
 * consigne/aide pour `6gen21`. Consigne générale et bloc de données (f(x)) redondants sur chaque
 * écran (spec explicite), même principe que `formatEtudeFonctionExponentielle.ts` (`6gen11`).
 */
export const CONSIGNE_GENERALE = "Étudie la fonction suivante :";

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

// ============================================================================
// f(x) — un helper par famille.
// ============================================================================

export function formatFonctionLatex(exercice: ExerciceEtudeFonctionLogarithme): string {
  switch (exercice.famille) {
    case "A":
      return `f(x) = x^{${exercice.a}x}`;
    case "B":
      return `f(x) = x^{\\frac{${exercice.k}}{x}}`;
    case "C":
      return `f(x) = \\ln\\left|${exercice.k}^2 - x^2\\right|`;
    case "D":
      return `f(x) = x + ${exercice.c === 1 ? "" : exercice.c}e^{-x}`;
    case "E":
      return `f(x) = e^{${exercice.a}x}${exercice.trig === "sin" ? "\\sin(x)" : "\\cos(x)"}`;
  }
}

// ============================================================================
// Évaluation des candidats — chaque distracteur est une VRAIE fonction renvoyable (voir le core
// pour la justification de chaque distracteur). Familles A/B ont un domaine restreint (x>0) —
// `evaluerCandidat` renvoie `null` hors domaine, jamais NaN propagé sans contrôle.
// ============================================================================

function evaluerCandidatA(c: CandidatEtudeLogA, x: number): number | null {
  if (x <= 0) return null;
  if (c.type === "reel") return Math.pow(x, c.a * x);
  if (c.type === "minimumMalPlace") return Math.pow(x, c.a * x + c.decalageExposant);
  if (c.type === "limiteZeroIncorrecte") return c.facteurLimite * Math.pow(x, c.a * x);
  return 1 + 6 / (1 + Math.exp(-4 * (x - 1 / Math.E)));
}

function evaluerCandidatB(c: CandidatEtudeLogB, x: number): number | null {
  if (x <= 0) return null;
  if (c.type === "reel") return Math.pow(x, c.k / x);
  if (c.type === "extremumMalPlace") return Math.pow(x, c.k / x + c.decalageExposant);
  if (c.type === "sansAsymptoteHorizontale") return Math.pow(x, c.k / x) + 0.06 * x;
  return Math.pow(x, -c.k / x);
}

function evaluerCandidatC(c: CandidatEtudeLogC, x: number): number | null {
  if (c.type === "reel") {
    const v = c.k * c.k - x * x;
    return v === 0 ? null : Math.log(Math.abs(v));
  }
  if (c.type === "domaineRestreint") {
    const v = c.k * c.k - x * x;
    return v > 0 ? Math.log(v) : null;
  }
  if (c.type === "asymptotesMalPlacees") {
    const kp = c.k + c.decalage;
    const v = kp * kp - x * x;
    return v === 0 ? null : Math.log(Math.abs(v));
  }
  // asymetrieIncorrecte
  const u = x - c.decalage;
  const v = c.k * c.k - u * u;
  return v === 0 ? null : Math.log(Math.abs(v));
}

function evaluerCandidatD(c: CandidatEtudeLogD, x: number): number {
  if (c.type === "reel") return x + c.c * Math.exp(-x);
  if (c.type === "pasAsymptoteOblique") return x + c.c * Math.sqrt(Math.abs(x));
  if (c.type === "minimumMalPlace") return x + c.c * Math.exp(-(x - c.decalageMin));
  return x + c.c * (2 / (1 + Math.exp(-x)) - 1);
}

/** Magnitude au-delà de laquelle un point est traité comme HORS RENDU (retourné `null` plutôt que
 * la valeur brute) — nécessaire ici au-delà du simple rôle de `PLAFOND_STATS` (qui ne filtre que le
 * calcul d'ÉCHELLE, jamais le tracé lui-même, suffisant pour `6gen11`) : la famille B a une VRAIE
 * singularité en x=0 (k/x→±∞), et ses distracteurs (`extremumMalPlace`, exposant `k/x+décalage`)
 * peuvent y atteindre des magnitudes ASTRONOMIQUES (jusqu'à ~1e80 mesuré près de x=0,05 pour
 * k=-3) — bug trouvé par vérification Playwright : un `Plot.OfX` de Mafs alimenté avec une valeur
 * pareille produit un attribut SVG `d` dont la formatation numérique du navigateur échoue
 * silencieusement en erreur console ("Expected number"), sans planter le rendu mais sans jamais y
 * placer le trait non plus. Filtrer ICI (au niveau de l'évaluation brute, pas seulement du calcul
 * de viewBox) élimine le problème à la source pour toute famille future ayant le même risque.
 */
const PLAFOND_RENDU = 1e6;

export function evaluerCandidat(exercice: ExerciceEtudeLogNonE, index: number, x: number): number | null {
  const v = (() => {
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
  })();
  if (v === null || !Number.isFinite(v) || Math.abs(v) > PLAFOND_RENDU) return null;
  return v;
}

// ============================================================================
// Fenêtre d'affichage commune aux candidats — même principe que `6gen11`, plafond de magnitude Y
// par famille pour éviter des tracés dominés par une explosion locale.
// ============================================================================

export interface ViewBoxEtudeFonctionLog {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

function fenetreX(exercice: ExerciceEtudeLogNonE): [number, number] {
  switch (exercice.famille) {
    case "A":
      return [0.05, 3];
    case "B":
      return [0.05, 7];
    case "C":
      return [-exercice.k - 3, exercice.k + 3];
    case "D":
      return [-3, 4];
  }
}

const PLAFOND_STATS: Record<ExerciceEtudeLogNonE["famille"], number> = {
  A: 15,
  B: 15,
  C: 8,
  D: 12,
};

/** Densité de grille cible, partagée avec `GrapheOptionEtudeFonctionLog.tsx` (`GrilleAdaptative`) —
 * voir `CIBLE_NOMBRE_LIGNES_QCM` de `ui6e/formatGraphiquesCyclometriques.ts` (même rôle, même
 * précaution de synchronisation) pour la justification complète. */
export const CIBLE_NOMBRE_LIGNES_QCM = 6;

/** Composition finale du viewBox — voir `finaliserViewBox` de
 * `ui6e/formatGraphiquesCyclometriques.ts` pour la justification complète (`ratio=1` : conteneur
 * CARRÉ, jamais `RATIO_GRAPHE`). */
function finaliserViewBox(x: [number, number], y: [number, number]): ViewBoxEtudeFonctionLog {
  const { x: xFinal, y: yFinal } = assurerAxesVisibles({ x, y });
  return { xMin: xFinal[0], xMax: xFinal[1], yMin: yFinal[0], yMax: yFinal[1] };
}

export function calculerViewBox(exercice: ExerciceEtudeLogNonE): ViewBoxEtudeFonctionLog {
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

function formatSommeTermes(termes: { valeur: number; suffixe: string }[]): string {
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
// Labels de direction — arité variable (2 pour A/B/D, 6 pour C, 1 pour les asymptotes de B).
// ============================================================================

export interface DirectionLabel {
  id: string;
  latex: string;
}

export function directionLabelsLimites(exercice: ExerciceEtudeLogNonE): DirectionLabel[] {
  switch (exercice.famille) {
    case "A":
    case "B":
      return [
        { id: "zeroPlus", latex: "x \\to 0^+" },
        { id: "plusInfini", latex: "x \\to +\\infty" },
      ];
    case "C": {
      const k = exercice.k;
      return [
        { id: "moinsInfini", latex: "x \\to -\\infty" },
        { id: "moinsKMoins", latex: `x \\to (-${k})^-` },
        { id: "moinsKPlus", latex: `x \\to (-${k})^+` },
        { id: "kMoins", latex: `x \\to ${k}^-` },
        { id: "kPlus", latex: `x \\to ${k}^+` },
        { id: "plusInfini", latex: "x \\to +\\infty" },
      ];
    }
    case "D":
      return [
        { id: "moinsInfini", latex: "x \\to -\\infty" },
        { id: "plusInfini", latex: "x \\to +\\infty" },
      ];
  }
}

export function directionLabelsAsymptotes(exercice: ExerciceEtudeLogNonE): DirectionLabel[] {
  switch (exercice.famille) {
    case "A":
      return [
        { id: "zeroPlus", latex: "x \\to 0^+" },
        { id: "plusInfini", latex: "x \\to +\\infty" },
      ];
    case "B":
      return [{ id: "plusInfini", latex: "x \\to +\\infty" }];
    case "C":
      return [
        { id: "gauche", latex: `x = -${exercice.k}` },
        { id: "droite", latex: `x = ${exercice.k}` },
      ];
    case "D":
      return [
        { id: "moinsInfini", latex: "x \\to -\\infty" },
        { id: "plusInfini", latex: "x \\to +\\infty" },
      ];
  }
}

// ============================================================================
// Consignes — un texte par écran.
// ============================================================================

export function consigneDomaine(exercice: ExerciceEtudeFonctionLogarithme): string {
  if (exercice.famille === "C") return "Détermine le domaine de définition de f — attention à la valeur absolue.";
  return "Détermine le domaine de définition de f.";
}

export function consigneLimites(exercice: ExerciceEtudeLogNonE): string {
  if (exercice.famille === "C") return "Détermine les 6 limites suivantes (aux deux infinis, puis aux 4 approches des valeurs exclues).";
  return "Détermine les limites de f aux bornes de son domaine.";
}

export function consigneAsymptotes(exercice: ExerciceEtudeLogNonE): string {
  if (exercice.famille === "B") return "À partir des limites CORRECTES précédentes, détermine l'équation de l'asymptote horizontale de f.";
  if (exercice.famille === "C") return "À partir des limites CORRECTES précédentes, détermine les 2 asymptotes verticales de f.";
  return "À partir des limites CORRECTES précédentes, détermine l'asymptote de f dans chaque direction — ou l'absence d'asymptote.";
}

export function consigneCroissance(exercice: ExerciceEtudeLogNonE): string {
  if (exercice.famille === "C") return "Étudie le signe de f' sur chacun des 4 intervalles délimités par -k, 0 et k, et conclus sur le maximum local.";
  return "Étudie le signe de f' et conclus sur la croissance de f (monotonie constante, ou extremum et sa position).";
}

export function consigneConcavite(): string {
  return "Étudie le signe de f'' et conclus sur la concavité de f (convexe, concave, ou point(s) d'inflexion et leur(s) position(s)).";
}

export function consigneGraphique(): string {
  return "Sélectionne le graphique qui représente f.";
}

export function consigneComportementInfiniE(): string {
  return "Détermine le comportement de f dans chaque direction — une limite existe-t-elle (et vaut 0), ou n'existe-t-elle pas ?";
}

// ============================================================================
// Aides — 2 niveaux par écran, motif `{texte, latex}` partout.
// ============================================================================

export function aideDomaineNiveau1(exercice: ExerciceEtudeFonctionLogarithme): AideAvecLatex {
  if (exercice.famille === "A" || exercice.famille === "B") return { texte: "Une puissance x^u n'est définie (au sens réel général) que pour une base x STRICTEMENT POSITIVE.", latex: null };
  if (exercice.famille === "C") return { texte: "Rappel : |u|>0 dès que u≠0, quel que soit le signe de u — le domaine de ln|u| est donc plus large que celui de ln(u) seul.", latex: null };
  return { texte: "Une somme/produit d'une exponentielle et d'un polynôme (ou d'une fonction trigonométrique) est toujours défini sur tout ℝ.", latex: null };
}

export function aideDomaineNiveau2(exercice: ExerciceEtudeFonctionLogarithme): AideAvecLatex {
  if (exercice.famille === "A" || exercice.famille === "B") return { texte: "Aucune autre restriction à chercher pour cette famille.", latex: null };
  if (exercice.famille === "C") {
    const k = exercice.k;
    return { texte: "Les deux cas séparés (union non faite) :", latex: `\\begin{gathered} ${k}^2-x^2>0 \\\\ ${k}^2-x^2<0 \\end{gathered}` };
  }
  return { texte: "Aucune restriction à chercher pour cette famille.", latex: null };
}

export function aideLimitesNiveau1(exercice: ExerciceEtudeLogNonE): AideAvecLatex {
  if (exercice.famille === "A") return { texte: "Croissances comparées : x·ln(x) → 0 quand x→0⁺ (résultat déjà connu). En +∞, la base et l'exposant grandissent tous les deux.", latex: null };
  if (exercice.famille === "B") return { texte: "Croissances comparées : ln(x)/x → 0 quand x→+∞ (résultat déjà connu). En 0⁺, distingue le signe de k.", latex: null };
  if (exercice.famille === "C") return { texte: "Aux points exclus, |k²-x²| → 0⁺ (valeur qui s'annule mais reste positive) — le logarithme d'une quantité qui tend vers 0⁺ tend vers -∞.", latex: null };
  return { texte: "Piège : les deux limites sont infinies, mais cela ne signifie pas 'pas d'asymptote' — regarde l'étape suivante avant de conclure.", latex: null };
}

export function aideLimitesNiveau2(exercice: ExerciceEtudeLogNonE): AideAvecLatex {
  if (exercice.famille === "A") return { texte: "Exposant a :", latex: `a=${exercice.a}` };
  if (exercice.famille === "B") return { texte: "Signe de k (détermine le comportement en 0⁺) :", latex: `k=${exercice.k}` };
  if (exercice.famille === "C") return { texte: "Valeur de k :", latex: `k=${exercice.k}` };
  return { texte: "En -∞, l'exponentielle domine totalement le terme linéaire.", latex: `c\\,e^{-x} \\to +\\infty \\text{ quand } x\\to-\\infty` };
}

export function aideAsymptotesNiveau1(exercice: ExerciceEtudeLogNonE): AideAvecLatex {
  if (exercice.famille === "A") return { texte: "Une limite finie non nulle en une borne FINIE du domaine (ici x=0) n'est PAS une asymptote — l'asymptote horizontale exige une limite en ±∞.", latex: null };
  if (exercice.famille === "B") return { texte: "L'asymptote horizontale existe si la limite en +∞ est une valeur FINIE.", latex: null };
  if (exercice.famille === "C") return { texte: "Une asymptote verticale x=p existe quand la limite en p (d'un côté au moins) est infinie.", latex: null };
  return { texte: "Une limite finie (0 ou une valeur) donne une asymptote HORIZONTALE ; une asymptote OBLIQUE y=ax+b existe si f(x)-(ax+b)→0. Une limite infinie sans cette propriété ne donne AUCUNE asymptote.", latex: null };
}

export function aideAsymptotesNiveau2(exercice: ExerciceEtudeLogNonE): AideAvecLatex {
  if (exercice.famille === "A") return { texte: "Aucune des deux directions n'a d'asymptote pour cette famille.", latex: null };
  if (exercice.famille === "B") return { texte: "Équation attendue :", latex: "y=1" };
  if (exercice.famille === "C") return { texte: "Les 2 valeurs exclues du domaine :", latex: `x=-${exercice.k} \\text{ et } x=${exercice.k}` };
  return { texte: "En +∞, x+c·e^(-x) - x = c·e^(-x) → 0 : c'est la définition d'une asymptote oblique y=x. En -∞, cette même différence diverge — aucune asymptote de ce côté.", latex: null };
}

export function aideCroissanceNiveau1(exercice: ExerciceEtudeLogNonE): AideAvecLatex {
  if (exercice.famille === "A") return { texte: "Dérivation logarithmique : pose ln(f)=ax·ln(x), dérive les deux membres pour obtenir f'/f, puis étudie son signe (f>0 toujours).", latex: null };
  if (exercice.famille === "B") return { texte: "Dérivation logarithmique : pose ln(f)=(k/x)·ln(x), dérive les deux membres pour obtenir f'/f, puis étudie son signe.", latex: null };
  if (exercice.famille === "C") return { texte: "f'(x)=2x/(x²-k²) — étudie séparément le signe du numérateur et du dénominateur sur chacun des 4 intervalles.", latex: null };
  return { texte: "f'(x) = 1 - c·e^(-x), nul en une seule valeur — étudie son signe avant/après pour confirmer un minimum.", latex: null };
}

export function aideCroissanceNiveau2(exercice: ExerciceEtudeLogNonE): AideAvecLatex {
  if (exercice.famille === "A") return { texte: "f'/f = a(ln(x)+1), nul en ln(x)=-1 :", latex: "x = \\dfrac{1}{e}" };
  if (exercice.famille === "B") return { texte: "f'/f = k(1-ln(x))/x², nul en ln(x)=1 :", latex: "x = e" };
  if (exercice.famille === "C") return { texte: "Signe de x²-k² sur chaque intervalle (k=" + exercice.k + ") :", latex: `\\begin{gathered} x<-${exercice.k} : x^2-k^2>0 \\\\ -${exercice.k}<x<0 : x^2-k^2<0 \\\\ 0<x<${exercice.k} : x^2-k^2<0 \\\\ x>${exercice.k} : x^2-k^2>0 \\end{gathered}` };
  return { texte: "f'(x)=0 en :", latex: `x = \\ln(${exercice.c})` };
}

export function aideConcaviteNiveau1(_exercice: ExerciceEtudeLogNonE): AideAvecLatex {
  return {
    texte:
      "Étudie le signe de la dérivée SECONDE f'' : si f'' est POSITIVE, f est CONVEXE ; si f'' est NÉGATIVE, f est CONCAVE ; si f'' CHANGE DE SIGNE en un (ou plusieurs) point(s), ce(s) point(s) est/sont (un/des) POINT(S) D'INFLEXION.",
    latex: "f''(x) > 0 \\Rightarrow \\text{convexe} \\qquad f''(x) < 0 \\Rightarrow \\text{concave}",
  };
}

export function aideConcaviteNiveau2(exercice: ExerciceEtudeLogNonE): AideAvecLatex {
  if (exercice.famille === "A") return { texte: "f''(x) = f(x)·[a²(ln(x)+1)² + a/x] — une somme de deux termes toujours positifs (x>0, a>0).", latex: null };
  if (exercice.famille === "B") return { texte: "Résultat NON trivial pour cette famille : la position exacte des points d'inflexion n'a pas de forme simple — utilise ta calculatrice pour un balayage numérique du signe de f''.", latex: null };
  if (exercice.famille === "C") return { texte: "f''(x) = -2(x²+k²)/(k²-x²)² sur ]-k;k[, et une formule de même signe sur les 2 autres branches — toujours strictement négative.", latex: null };
  return { texte: "f''(x) = c·e^(-x) — toujours strictement positif (c>0).", latex: null };
}

export function aideGraphiqueNiveau1(exercice: ExerciceEtudeLogNonE): AideAvecLatex {
  if (exercice.famille === "A") return { texte: "Le graphique doit rester CONVEXE sur tout son domaine (x>0), avec un minimum unique en x=1/e ≈ 0,37, et une limite FINIE (1) en x→0⁺ — jamais une asymptote verticale à cet endroit.", latex: null };
  if (exercice.famille === "B") return { texte: "Le graphique doit présenter une asymptote HORIZONTALE y=1 en +∞ (jamais un tracé qui continue de s'écarter), et un seul extremum en x=e.", latex: null };
  if (exercice.famille === "C") return { texte: "Le graphique doit être SYMÉTRIQUE par rapport à l'axe des y, avec 2 asymptotes verticales bien placées en x=±k.", latex: null };
  return { texte: "Le graphique doit se RAPPROCHER de la droite y=x en +∞ (jamais s'en éloigner), et n'avoir qu'un seul minimum.", latex: null };
}

export function aideGraphiqueNiveau2(exercice: ExerciceEtudeLogNonE): AideAvecLatex {
  if (exercice.famille === "A") return { texte: "Position du minimum :", latex: "x=1/e \\approx 0{,}37" };
  if (exercice.famille === "B") return { texte: exercice.k > 0 ? "Un MAXIMUM (pas un minimum) en x=e." : "Un MINIMUM (pas un maximum) en x=e.", latex: null };
  if (exercice.famille === "C") return { texte: "Valeur du maximum local en x=0 :", latex: `\\ln(${exercice.k}^2) = 2\\ln(${exercice.k})` };
  return { texte: exercice.c > 0 ? "Position du minimum :" : "", latex: exercice.c > 0 ? `x=\\ln(${exercice.c})` : null };
}

export function aideComportementInfiniNiveau1(): AideAvecLatex {
  return {
    texte: "|f(x)| ≤ |e^(ax)| toujours (l'enveloppe encadre l'oscillation, |sin|/|cos| ≤ 1) — si l'enveloppe tend vers 0, f aussi (encadrement) ; si elle explose, f oscille indéfiniment SANS jamais se stabiliser.",
    latex: null,
  };
}

export function aideComportementInfiniNiveau2(exercice: ExerciceEtudeLogE): AideAvecLatex {
  const directionZero = exercice.a < 0 ? "x \\to +\\infty" : "x \\to -\\infty";
  return { texte: "La direction où l'enveloppe tend vers 0 (conclusion sur l'autre direction non donnée) :", latex: directionZero };
}

// ============================================================================
// Récapitulatif final — un libellé + un contenu par écran RÉELLEMENT visité par la famille de
// l'exercice (voir `moteur6e/typesEtudeFonctionLogarithme.ts::nombreEcrans` pour le maximum
// variable, 600 pour A-D, 200 pour E).
// ============================================================================

export const LIBELLE_PHASE_ETUDE_LOG: Record<PhaseEtudeFonctionLogarithme, string> = {
  domaine: "Domaine",
  limites: "Limites",
  asymptotes: "Asymptotes",
  croissance: "Croissance",
  concavite: "Concavité",
  graphique: "Graphique",
  comportementInfini: "Comportement à l'infini",
};

/** Ordre d'affichage des phases RÉELLEMENT visitées par une famille donnée. */
export function phasesVisitees(famille: ExerciceEtudeFonctionLogarithme["famille"]): PhaseEtudeFonctionLogarithme[] {
  if (famille === "E") return ["domaine", "comportementInfini"];
  return ["domaine", "limites", "asymptotes", "croissance", "concavite", "graphique"];
}

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

export function formatLimitesRecapLatex(exercice: ExerciceEtudeLogNonE): string {
  const labels = directionLabelsLimites(exercice);
  const lignes = labels.map((l, i) => `${l.latex} : ${formatCibleLimiteLatex(exercice.limites[i])}`);
  return `\\begin{gathered} ${lignes.join(" \\\\ ")} \\end{gathered}`;
}

function formatAsymptotesRecapLatex(exercice: ExerciceEtudeLogNonE): string {
  const labels = directionLabelsAsymptotes(exercice);
  const lignes = labels.map((l, i) => `${l.latex} : ${formatEquationAsymptoteLatex(exercice.asymptotes[i])}`);
  return `\\begin{gathered} ${lignes.join(" \\\\ ")} \\end{gathered}`;
}

function formatConcaviteRecap(concavite: CibleConcaviteLog): ContenuRecap {
  if (concavite.type === "convexe_partout") return { texte: "Convexe (partout)", latex: null };
  if (concavite.type === "concave_partout") return { texte: "Concave (partout)", latex: null };
  const label = concavite.positions.length > 1 ? "Points d'inflexion en x=" : "Point d'inflexion en x=";
  return { texte: `${label}${concavite.positions.map((p) => p.toFixed(3)).join(" et x=")}`, latex: null };
}

/** Contenu affiché par la `LigneRecap` d'un écran donné — LA RÉPONSE RÉELLEMENT attendue de cet
 * écran, jamais recalculée depuis un score. */
export function contenuRecapPhase(exercice: ExerciceEtudeFonctionLogarithme, phase: PhaseEtudeFonctionLogarithme): ContenuRecap {
  switch (phase) {
    case "domaine":
      return { texte: null, latex: formatEnsembleReelLatex(exercice.domaine) };
    case "limites":
      return exercice.famille === "E" ? { texte: null, latex: null } : { texte: null, latex: formatLimitesRecapLatex(exercice) };
    case "asymptotes":
      return exercice.famille === "E" ? { texte: null, latex: null } : { texte: null, latex: formatAsymptotesRecapLatex(exercice) };
    case "croissance": {
      if (exercice.famille === "E") return { texte: null, latex: null };
      if (exercice.famille === "C") {
        const c = exercice.croissance;
        return { texte: `Signes : ${c.signes.join(", ")} — maximum local en x=${c.positionMax}`, latex: null };
      }
      const c = exercice.croissance;
      if (c.type === "croissante_partout") return { texte: "Croissante (partout)", latex: null };
      if (c.type === "decroissante_partout") return { texte: "Décroissante (partout)", latex: null };
      return { texte: `${c.type === "minimum" ? "Minimum" : "Maximum"} en x=${typeof c.position === "number" ? c.position.toFixed(3) : c.position}`, latex: null };
    }
    case "concavite":
      return exercice.famille === "E" ? { texte: null, latex: null } : formatConcaviteRecap(exercice.concavite);
    case "graphique":
      return exercice.famille === "E" ? { texte: null, latex: null } : { texte: `Graphique n°${exercice.indexCorrect + 1}`, latex: null };
    case "comportementInfini": {
      if (exercice.famille !== "E") return { texte: null, latex: null };
      const fmt = (s: string) => (s === "zero" ? "0" : "n'existe pas");
      return { texte: null, latex: `\\begin{gathered} x\\to-\\infty : ${fmt(exercice.comportement.moinsInfini)} \\\\ x\\to+\\infty : ${fmt(exercice.comportement.plusInfini)} \\end{gathered}` };
    }
  }
}

/** Un fragment KaTeX unique `\text{label : } ...` à partir d'un `ContenuRecap` — `texte` seul est
 * enveloppé dans `\text{}` (croissance/concavité), `latex` seul est ajouté après le label (domaine/
 * limites/asymptotes/graphique), les deux combinés sinon. */
function fragmentDepuisContenuRecap(label: string, contenu: ContenuRecap): string {
  if (contenu.latex !== null) return `\\text{${label} : } ${contenu.latex}`;
  if (contenu.texte !== null) return `\\text{${label} : ${contenu.texte}}`;
  return `\\text{${label}}`;
}

/**
 * Bloc "état actuel" — écrans ≥2 UNIQUEMENT quand la tâche de l'écran s'appuie RÉELLEMENT sur un
 * fait confirmé d'un écran antérieur (CLAUDE.md : consigne générale → bloc données → bloc "état
 * actuel" → bloc de travail) — `null` quand la tâche est autonome (signe de f'/f'', recalculé
 * directement depuis f, indépendamment de tout écran précédent), même philosophie que `etatActuel`
 * de `formatDomaineDeriveeLogarithme.ts` (6gen16, "null sur tout écran dont la vérification ne
 * dépend pas d'un écran précédent"). Dérivé UNIQUEMENT de l'exercice via `contenuRecapPhase`
 * (jamais de la saisie brute de l'élève) :
 * - `limites` (consigne "aux bornes de son domaine") : rappelle le domaine confirmé.
 * - `asymptotes` (consigne explicite "à partir des limites CORRECTES précédentes") : rappelle les
 *   limites confirmées.
 * - `croissance` (consigne "étudie le signe de f' et conclus" — s'appuie implicitement sur le
 *   domaine/les limites/les asymptotes déjà établis pour situer la conclusion) : rappelle domaine +
 *   limites + asymptotes, dans cet ordre — familles A/B/D (forme "standard") ET famille C (forme
 *   "grilleC"), même rappel dans les deux cas.
 * - `concavite` (synthèse partielle avant le graphique) : rappelle domaine + limites + asymptotes +
 *   croissance, dans cet ordre.
 * - `graphique` (synthèse finale, doit choisir le graphique cohérent avec TOUS les faits établis) :
 *   rappelle domaine/limites/asymptotes/croissance/concavité, dans cet ordre.
 * - `comportementInfini` (famille E uniquement, chemin séparé domaine→comportementInfini) : rappelle
 *   le domaine déjà confirmé — seule phase où la famille E a quelque chose à rappeler.
 * - famille E : `null` partout SAUF `comportementInfini` (domaine toujours ℝ, sans incidence sur le
 *   comportement qualitatif ailleurs).
 */
export function etatActuel(phase: PhaseEtudeFonctionLogarithme, exercice: ExerciceEtudeFonctionLogarithme): string[] | null {
  if (exercice.famille === "E") {
    if (phase === "comportementInfini") return [fragmentDepuisContenuRecap("Domaine", contenuRecapPhase(exercice, "domaine"))];
    return null;
  }
  switch (phase) {
    case "limites":
      return [fragmentDepuisContenuRecap("Domaine", contenuRecapPhase(exercice, "domaine"))];
    case "asymptotes":
      return [fragmentDepuisContenuRecap("Limites", contenuRecapPhase(exercice, "limites"))];
    case "croissance":
      return (["domaine", "limites", "asymptotes"] as const).map((p) => fragmentDepuisContenuRecap(LIBELLE_PHASE_ETUDE_LOG[p], contenuRecapPhase(exercice, p)));
    case "concavite":
      return (["domaine", "limites", "asymptotes", "croissance"] as const).map((p) => fragmentDepuisContenuRecap(LIBELLE_PHASE_ETUDE_LOG[p], contenuRecapPhase(exercice, p)));
    case "graphique":
      return (["domaine", "limites", "asymptotes", "croissance", "concavite"] as const).map((p) => fragmentDepuisContenuRecap(LIBELLE_PHASE_ETUDE_LOG[p], contenuRecapPhase(exercice, p)));
    default:
      return null;
  }
}

// ============================================================================
// Total de points — maximum VARIABLE selon la famille (600 pour A-D, 200 pour E), même principe
// que `6gen14`/`6gen16` (voir CLAUDE.md, "Total-points summary convention") : somme des scores
// RÉELLEMENT applicables (`!== null`), jamais une formule à 3 paliers simplifiée.
// ============================================================================

export interface TotalRecap {
  total: number;
  maximum: number;
}

export function totalPointsRecap(resultat: ResultatExerciceEtudeFonctionLogarithme): TotalRecap {
  const scores = [
    resultat.scoreDomaine,
    resultat.scoreLimites,
    resultat.scoreAsymptotes,
    resultat.scoreCroissance,
    resultat.scoreConcavite,
    resultat.scoreGraphique,
    resultat.scoreComportementInfini,
  ].filter((s): s is number => s !== null);
  const total = scores.reduce((a, s) => a + s, 0);
  return { total, maximum: nombreEcrans(resultat.exercice.famille) * 100 };
}

export function detailPourPhase(details: Partial<Record<PhaseEtudeFonctionLogarithme, DetailPhaseEtudeFonctionLogarithme>>, phase: PhaseEtudeFonctionLogarithme): DetailPhaseEtudeFonctionLogarithme | undefined {
  return details[phase];
}
