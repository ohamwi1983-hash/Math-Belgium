/**
 * Couche présentation (5e) — consignes/labels/aides pour 5gen9 ("Paramètres d'une fonction
 * sinusoïdale — lecture graphique"). Même notation canonique que 5gen8 (A/T/φ/f/b), aides à 2
 * niveaux : (1) rappel de la définition du paramètre ; (2) désignation des points à repérer sur le
 * graphique — JAMAIS leurs coordonnées (spec explicite), contrairement à 5gen8 dont l'aide niveau 2
 * substitue une formule avec de vraies valeurs.
 */
import type { AmplitudeSinusoide, RationnelPi } from "../core5e/parametresSinusoide.types";
import type { ExerciceParametresSinusoideGraphique } from "../core5e/parametresSinusoideGraphique.types";
import { ORDRE_PHASES_SINUSOIDE_GRAPHIQUE, type PhaseParametresSinusoideGraphique } from "../moteur5e/typesParametresSinusoideGraphique";
import { additionnerRationnelPi, diviserParEntier, inverseRationnelPi, multiplierRationnelPi, negatifRationnelPi, reduireRationnelPi } from "../generateurs5e/parametresSinusoide/rationnelPi";

const CONSIGNE_GENERALE = "Lis les paramètres de cette fonction sinusoïdale sur son graphique.";

export function consigneGenerale(): string {
  return CONSIGNE_GENERALE;
}

const PRECISION = " (valeur exacte, ou arrondie au centième)";

const CONSIGNES: Record<PhaseParametresSinusoideGraphique, string> = {
  decalage: "Quel est le décalage vertical b de cette fonction ?",
  amplitude: "Quelle est l'amplitude de cette fonction ?",
  periode: `Quelle est la période T de cette fonction ?${PRECISION}`,
  pulsation: `Quelle est la pulsation ω de cette fonction ?${PRECISION}`,
  frequence: `Quelle est la fréquence de cette fonction ?${PRECISION}`,
  phi: `Quel est le décalage horizontal Φ de cette fonction, c'est-à-dire l'abscisse x₀ d'un point où la courbe traverse sa ligne médiane en montant ?${PRECISION}`,
  dephasage: `Quelle est la phase φ de cette fonction ?${PRECISION}`,
};

export function consignePhase(phase: PhaseParametresSinusoideGraphique): string {
  return CONSIGNES[phase];
}

const LABELS: Record<PhaseParametresSinusoideGraphique, string> = {
  decalage: "b =",
  amplitude: "Amplitude =",
  periode: "T =",
  pulsation: "ω =",
  frequence: "Fréquence =",
  phi: "Φ =",
  dephasage: "φ =",
};

export function labelPhase(phase: PhaseParametresSinusoideGraphique): string {
  return LABELS[phase];
}

/** Exemple affiché dans le champ — HORS de l'espace des tirages (aucun dénominateur 7 : T ∈ {kπ, k ∈
 * {1,2,3,4,6,8}} ∪ {2,…,12}\{7, 9, 11}, Φ de dénominateur 1, 2, 3, 4 ou 6 ; |A| ≤ 4,5 ; b entier),
 * virgule décimale. */
const PLACEHOLDERS: Record<PhaseParametresSinusoideGraphique, string> = {
  decalage: "ex : -7,5",
  amplitude: "ex : 7/3",
  periode: "ex : 7pi",
  pulsation: "ex : 5pi/7",
  frequence: "ex : 2/7",
  phi: "ex : 5pi/7",
  dephasage: "ex : -5pi/7",
};

export function placeholderPhase(phase: PhaseParametresSinusoideGraphique): string {
  return PLACEHOLDERS[phase];
}

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

const AIDES_NIVEAU1: Record<PhaseParametresSinusoideGraphique, AideAvecLatex> = {
  decalage: {
    texte: "Le décalage vertical est la position de la ligne MÉDIANE de la courbe, à mi-chemin entre le maximum et le minimum — attention, ce n'est PAS forcément l'axe des abscisses :",
    latex: "b = \\dfrac{\\max + \\min}{2}",
  },
  amplitude: {
    texte: "L'amplitude est la distance entre un sommet et la ligne médiane — la MOITIÉ de l'écart entre le maximum et le minimum, jamais l'écart complet :",
    latex: "\\text{amplitude} = \\dfrac{\\max - \\min}{2}",
  },
  periode: {
    texte: "La période est la distance horizontale entre DEUX MAXIMUMS CONSÉCUTIFS (ou deux minimums consécutifs) — jamais entre un maximum et le minimum voisin, qui ne donne qu'une demi-période.",
    latex: null,
  },
  pulsation: { texte: "La pulsation se déduit de la période :", latex: "\\omega = \\dfrac{2\\pi}{T}" },
  frequence: { texte: "La fréquence est l'inverse de la période :", latex: "f_{req} = \\dfrac{1}{T}" },
  phi: {
    texte: "Le décalage horizontal est l'abscisse x₀ d'un passage de la courbe par la ligne médiane EN MONTANT — jamais un passage en descendant, décalé d'une demi-période.",
    latex: null,
  },
  dephasage: { texte: "La phase se déduit de la pulsation et du passage ascendant x₀ (méthode du cours) :", latex: "\\varphi = -\\omega \\cdot x_0" },
};

export function aideNiveau1(phase: PhaseParametresSinusoideGraphique): AideAvecLatex {
  return AIDES_NIVEAU1[phase];
}

const AIDES_NIVEAU2: Record<PhaseParametresSinusoideGraphique, string> = {
  decalage: "Repère le sommet le plus haut (maximum) ET le sommet le plus bas (minimum) de la courbe — la médiane est exactement entre les deux.",
  amplitude: "Repère un sommet de la courbe (maximum ou minimum) et la ligne médiane déjà trouvée à l'écran précédent.",
  periode: "Repère deux sommets consécutifs de MÊME NATURE (deux maximums, ou deux minimums) sur la courbe.",
  pulsation: "Reprends la période T déjà trouvée à l'écran précédent.",
  frequence: "Reprends la période T déjà trouvée.",
  phi: "Repère le point où la courbe traverse la ligne médiane EN MONTANT, juste après un minimum.",
  dephasage: "Reprends la pulsation ω et l'abscisse x₀ du passage ascendant déjà trouvées (une autre abscisse x₀ + T donne la même phase, à 2π près).",
};

export function texteAideNiveau2(phase: PhaseParametresSinusoideGraphique): string {
  return AIDES_NIVEAU2[phase];
}

// ============================================================================
// Bloc "état actuel" / récapitulatif final — fragments "label = valeur", TOUJOURS dérivés de
// `exercice` (jamais de la saisie de l'élève), même convention que le reste de la plateforme (voir
// CLAUDE.md, section 5gen1). Formatage LaTeX exact DUPLIQUÉ depuis `formatParametresSinusoide.ts`
// (5gen8) — jamais partagé entre les deux générateurs malgré la ressemblance, même principe déjà
// établi partout ailleurs sur ce chantier (voir CLAUDE.md, "Motifs partagés entre plusieurs
// exercices").
// ============================================================================

function formatMagnitudeRationnelleLatex(numerateur: number, denominateur: number): string {
  return denominateur === 1 ? `${numerateur}` : `\\dfrac{${numerateur}}{${denominateur}}`;
}

export function formatRationnelPiLatex(valeur: RationnelPi): string {
  const v = reduireRationnelPi(valeur);
  if (v.numerateur === 0) return "0";
  const signe = v.numerateur < 0 ? "-" : "";
  const n = Math.abs(v.numerateur);
  const d = v.denominateur;
  if (v.degrePi === 0) return `${signe}${formatMagnitudeRationnelleLatex(n, d)}`;
  if (v.degrePi === 1) {
    const piNum = n === 1 ? "\\pi" : `${n}\\pi`;
    return d === 1 ? `${signe}${piNum}` : `${signe}\\dfrac{${piNum}}{${d}}`;
  }
  // degrePi === -1 : π au dénominateur.
  const denomAvecPi = d === 1 ? "\\pi" : `${d}\\pi`;
  return `${signe}\\dfrac{${n}}{${denomAvecPi}}`;
}

export function formatMagnitudeAmplitudeLatex(A: AmplitudeSinusoide): string {
  if (A.radicande !== null) return `\\sqrt{${A.radicande}}`;
  const r = A.rationnelle!;
  return formatMagnitudeRationnelleLatex(r.numerateur, r.denominateur);
}

/** f = 1/T, calculé EXACTEMENT (jamais un flottant approché). */
function formatFrequenceLatex(exercice: ExerciceParametresSinusoideGraphique): string {
  return formatRationnelPiLatex(inverseRationnelPi(exercice.T));
}

/** φ "tel que confirmé/révélé" — la valeur RETENUE par la vérification (`cibleAscendantPrincipal`,
 * `moteur5e/verificationParametresSinusoideGraphique.ts`), reproduite ici en arithmétique EXACTE
 * (Couche A, jamais en flottant) : φ lui-même si A>0, φ+T/2 si A<0. Jamais géré la classe
 * d'équivalence complète (φ+k·T) dans le récapitulatif/l'état actuel — seule cette valeur
 * canonique unique est affichée (voir la tâche : "juste la valeur retenue"). */
export function phiRetenu(exercice: ExerciceParametresSinusoideGraphique): RationnelPi {
  return exercice.A.signe > 0 ? exercice.phi : additionnerRationnelPi(exercice.phi, diviserParEntier(exercice.T, 2));
}

function formatPhiRetenuLatex(exercice: ExerciceParametresSinusoideGraphique): string {
  return formatRationnelPiLatex(phiRetenu(exercice));
}

const DEUX_PI: RationnelPi = { numerateur: 2, denominateur: 1, degrePi: 1 };

/** φ = −ω·x₀ (x₀ = passage ascendant retenu), réduit dans ]−π ; π] — la valeur la plus simple parmi
 * celles acceptées à 2π près (`cibleDephasageGraphique`). Toujours un multiple rationnel de π (ω et x₀
 * ont des degrés de π opposés, voir `rationnelPi.ts`). */
export function phaseRetenue(exercice: ExerciceParametresSinusoideGraphique): RationnelPi {
  const omega = multiplierRationnelPi(DEUX_PI, inverseRationnelPi(exercice.T));
  const brut = negatifRationnelPi(multiplierRationnelPi(omega, phiRetenu(exercice)));
  // brut est de degré 1 : n/d·π. Réduction dans ]−π ; π] : n/d dans ]−1 ; 1].
  let n = brut.numerateur;
  const d = brut.denominateur;
  while (n > d) n -= 2 * d;
  while (n <= -d) n += 2 * d;
  return reduireRationnelPi({ numerateur: n, denominateur: d, degrePi: 1 });
}

/** Fragment "label = valeur" pour UN paramètre déjà résolu — b, |A|, T, f, φ. Réutilisé à la fois
 * par le bloc "état actuel" (paramètres déjà confirmés) et par le récapitulatif final (les 5,
 * toujours). */
export function formatChampParametreGraphiqueLatex(exercice: ExerciceParametresSinusoideGraphique, champ: PhaseParametresSinusoideGraphique): string {
  switch (champ) {
    case "decalage":
      return `b = ${exercice.b}`;
    case "amplitude":
      return `|A| = ${formatMagnitudeAmplitudeLatex(exercice.A)}`;
    case "periode":
      return `T = ${formatRationnelPiLatex(exercice.T)}`;
    case "pulsation":
      return `\\omega = ${formatRationnelPiLatex(multiplierRationnelPi(DEUX_PI, inverseRationnelPi(exercice.T)))}`;
    case "frequence":
      return `f_{req} = ${formatFrequenceLatex(exercice)}`;
    case "phi":
      return `\\Phi = ${formatPhiRetenuLatex(exercice)}`;
    case "dephasage":
      return `\\varphi = ${formatRationnelPiLatex(phaseRetenue(exercice))}`;
  }
}

/** "Bloc état actuel" — accumule les paramètres déjà CONFIRMÉS avant `phase` (ordre b, A, T, f, φ) ;
 * vide pour le premier écran (decalage), jamais affiché dans ce cas (voir le composant appelant). */
export function formatTermesEtatActuelParametresSinusoideGraphiqueLatex(exercice: ExerciceParametresSinusoideGraphique, phase: PhaseParametresSinusoideGraphique): string[] {
  const index = ORDRE_PHASES_SINUSOIDE_GRAPHIQUE.indexOf(phase);
  return ORDRE_PHASES_SINUSOIDE_GRAPHIQUE.slice(0, index).map((champ) => formatChampParametreGraphiqueLatex(exercice, champ));
}
