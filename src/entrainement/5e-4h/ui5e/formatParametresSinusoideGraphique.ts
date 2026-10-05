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
import { additionnerRationnelPi, diviserParEntier, inverseRationnelPi, reduireRationnelPi } from "../generateurs5e/parametresSinusoide/rationnelPi";

const CONSIGNE_GENERALE = "Lis les paramètres de cette fonction sinusoïdale sur son graphique.";

export function consigneGenerale(): string {
  return CONSIGNE_GENERALE;
}

const CONSIGNES: Record<PhaseParametresSinusoideGraphique, string> = {
  decalage: "Quel est le décalage vertical b de cette fonction ? (arrondis au centième près)",
  amplitude: "Quelle est l'amplitude A de cette fonction ? (arrondis au centième près)",
  periode: "Quelle est la période T de cette fonction ? (arrondis au centième près)",
  frequence: "Quelle est la fréquence f de cette fonction ? (arrondis au centième près)",
  phi: "Quel est le décalage horizontal Φ de cette fonction ?",
};

export function consignePhase(phase: PhaseParametresSinusoideGraphique): string {
  return CONSIGNES[phase];
}

const LABELS: Record<PhaseParametresSinusoideGraphique, string> = { decalage: "b =", amplitude: "A =", periode: "T =", frequence: "f =", phi: "Φ =" };

export function labelPhase(phase: PhaseParametresSinusoideGraphique): string {
  return LABELS[phase];
}

const AIDES_NIVEAU1: Record<PhaseParametresSinusoideGraphique, string> = {
  decalage:
    "Le décalage vertical est la position de la ligne MÉDIANE de la courbe (à mi-chemin entre le maximum et le minimum) — attention, ce n'est PAS forcément l'axe des abscisses (y=0).",
  amplitude: "L'amplitude est la distance entre un sommet (maximum ou minimum) et la ligne médiane — la MOITIÉ de l'écart entre le maximum et le minimum, jamais l'écart complet.",
  periode: "La période est la distance horizontale entre DEUX MAXIMA CONSÉCUTIFS (ou deux minima consécutifs) — jamais entre un maximum et le minimum voisin, qui ne donne qu'une demi-période.",
  frequence: "La fréquence est l'inverse de la période : f = 1/T.",
  phi: "Le décalage horizontal est la position du PREMIER PASSAGE ASCENDANT par la ligne médiane — la courbe traverse la médiane EN MONTANT, jamais un passage descendant (décalé d'une demi-période).",
};

export function texteAideNiveau1(phase: PhaseParametresSinusoideGraphique): string {
  return AIDES_NIVEAU1[phase];
}

const AIDES_NIVEAU2: Record<PhaseParametresSinusoideGraphique, string> = {
  decalage: "Repère le sommet le plus haut (maximum) ET le sommet le plus bas (minimum) de la courbe — la médiane est exactement entre les deux.",
  amplitude: "Repère un sommet de la courbe (maximum ou minimum) et la ligne médiane déjà trouvée à l'écran précédent.",
  periode: "Repère deux sommets consécutifs de MÊME NATURE (deux maxima, ou deux minima) sur la courbe.",
  frequence: "Reprends la période T déjà trouvée à l'écran précédent.",
  phi: "Repère le point où la courbe traverse la ligne médiane EN MONTANT, juste après un minimum.",
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

function formatRationnelPiLatex(valeur: RationnelPi): string {
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

function formatMagnitudeAmplitudeLatex(A: AmplitudeSinusoide): string {
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
function formatPhiRetenuLatex(exercice: ExerciceParametresSinusoideGraphique): string {
  const phiRetenu = exercice.A.signe > 0 ? exercice.phi : additionnerRationnelPi(exercice.phi, diviserParEntier(exercice.T, 2));
  return formatRationnelPiLatex(phiRetenu);
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
    case "frequence":
      return `f = ${formatFrequenceLatex(exercice)}`;
    case "phi":
      return `\\Phi = ${formatPhiRetenuLatex(exercice)}`;
  }
}

/** "Bloc état actuel" — accumule les paramètres déjà CONFIRMÉS avant `phase` (ordre b, A, T, f, φ) ;
 * vide pour le premier écran (decalage), jamais affiché dans ce cas (voir le composant appelant). */
export function formatTermesEtatActuelParametresSinusoideGraphiqueLatex(exercice: ExerciceParametresSinusoideGraphique, phase: PhaseParametresSinusoideGraphique): string[] {
  const index = ORDRE_PHASES_SINUSOIDE_GRAPHIQUE.indexOf(phase);
  return ORDRE_PHASES_SINUSOIDE_GRAPHIQUE.slice(0, index).map((champ) => formatChampParametreGraphiqueLatex(exercice, champ));
}
