/**
 * Couche présentation (5e) — consignes/labels/aides/LaTeX pour 5gen35 ("Vitesse et position").
 * Dépend librement des couches inférieures (jamais l'inverse) : réutilise `valeurPosition`/
 * `valeurVitesseExacte` (`generateurs5e/vitessePosition/index.ts`), même patron que
 * `formatTangentes.ts` réutilisant les évaluateurs de la Couche A.
 */
import type { ExerciceVitessePosition } from "../core5e/vitessePosition.types";
import { valeurPosition, valeurVitesseExacte } from "../generateurs5e/vitessePosition/index";
import type { EcranVitessePosition } from "../moteur5e/typesVitessePosition";
import { ordreEcransVitessePosition } from "../moteur5e/typesVitessePosition";
import type { SegmentTexte } from "../components/SegmentsInline";

// ============================================================================
// Fragments LaTeX de bas niveau.
// ============================================================================

/** e(t) = (a/2)t² + b·t, jamais un coefficient "1" superflu (a=2 → a/2=1 → "t²", pas "1t²") ni un
 * terme "+0t" — a∈{1,2} garantit a/2 ∈ {0,5 ; 1}, jamais de division moins simple. */
export function formatPositionLatex(a: number, b: number): string {
  const termeT2 = a === 2 ? "t^2" : "\\dfrac{1}{2}t^2";
  const termeT = b === 0 ? "" : b === 1 ? "+t" : `+${b}t`;
  return `e(t)=${termeT2}${termeT}`;
}

/** v(t) = a·t + b — jamais de coefficient "1" superflu ni de terme "+0" (b toujours ≥0 par
 * construction : jamais de signe négatif à gérer, contrairement à `formatPolynomeVarLatex`,
 * `formatTangentes.ts`). */
export function formatVitesseLatex(a: number, b: number): string {
  const termeT = a === 1 ? "t" : `${a}t`;
  return b === 0 ? termeT : `${termeT}+${b}`;
}

function formatVDeTLatex(exercice: ExerciceVitessePosition): string {
  return `v(t)=${formatVitesseLatex(exercice.a, exercice.b)}`;
}

// ============================================================================
// Énoncé narratif — "prose + fragments KaTeX courts" (jamais un unique bloc `\text{...}`) : réplique
// locale du motif `segmentsPhraseEnonce` (`ui/formatOptimisation.ts`, 4e) — jamais importée telle
// quelle depuis un fichier 4e (réplication délibérée, même esprit que les évaluateurs numériques
// répliqués entre générateurs/moteur sur ce chantier). `SegmentsInline`/`Katex` (`src/components/`)
// restent, eux, réutilisés directement : infrastructure de présentation générique déjà partagée
// entre les 3 chantiers (aucune logique domaine-spécifique).
// ============================================================================
const REGEX_DOLLAR = /\$([^$]+)\$/g;

export function segmentsEnonce(phrase: string): SegmentTexte[] {
  const segments: SegmentTexte[] = [];
  let dernierIndex = 0;
  let match: RegExpExecArray | null;
  REGEX_DOLLAR.lastIndex = 0;
  while ((match = REGEX_DOLLAR.exec(phrase)) !== null) {
    if (match.index > dernierIndex) segments.push({ type: "texte", valeur: phrase.slice(dernierIndex, match.index) });
    segments.push({ type: "katex", valeur: match[1] });
    dernierIndex = match.index + match[0].length;
  }
  if (dernierIndex < phrase.length) segments.push({ type: "texte", valeur: phrase.slice(dernierIndex) });
  return segments;
}

/** Phrase narrative complète (contexte + e(t) + distance(s)) — persistante sur tous les écrans de
 * l'exercice. */
export function phraseEnonce(exercice: ExerciceVitessePosition): string {
  const eLatex = formatPositionLatex(exercice.a, exercice.b);
  return exercice.variante === "A" ? exercice.contexte.phraseA(eLatex, exercice.D) : exercice.contexte.phraseB(eLatex, exercice.distanceCible, exercice.D);
}

/** Bloc de données structuré — chaque donnée sur sa propre ligne (convention CLAUDE.md,
 * "plusieurs données distinctes → chacune sur sa propre ligne"). */
export function formatTermesDonneesLatex(exercice: ExerciceVitessePosition): string[] {
  const eLatex = formatPositionLatex(exercice.a, exercice.b);
  const termes = [eLatex];
  if (exercice.variante === "A") {
    termes.push(`D=${exercice.D}\\text{ m}`);
  } else {
    termes.push(`D_1=${exercice.distanceCible}\\text{ m}`, `D=${exercice.D}\\text{ m}`);
  }
  termes.push(`t_0=${exercice.t0}\\text{ s}`);
  return termes;
}

export function questionFinale(exercice: ExerciceVitessePosition): string {
  return exercice.variante === "A"
    ? "Trouve le temps total de la course, puis la vitesse d'arrivée (en km/h)."
    : "Trouve le temps total du parcours complet (les 2 segments).";
}

// ============================================================================
// Libellés/consignes par écran.
// ============================================================================

export const LIBELLE_ECRAN: Record<EcranVitessePosition, string> = {
  derivee: "v(t)=e'(t)",
  evaluerV0: "v(t₀)",
  resoudre: "Résoudre l'équation (racines + justification)",
  vitessePointe: "Vitesse de pointe",
  conversion: "Conversion en km/h",
  segmentConstant: "Temps du second segment",
  tempsTotal: "Temps total du parcours",
};

export function consigneEcran(exercice: ExerciceVitessePosition, ecran: EcranVitessePosition): string {
  switch (ecran) {
    case "derivee":
      return "Dérive e(t) pour obtenir la fonction vitesse v(t)=e'(t).";
    case "evaluerV0":
      return "Évalue v(t₀) : remplace t par t₀ dans v(t).";
    case "resoudre": {
      const cible = exercice.variante === "A" ? "D" : "D₁";
      return `Résous l'équation e(t)=${cible} — c'est une équation du SECOND DEGRÉ, elle admet DEUX solutions mathématiques. Indique les deux, puis choisis la bonne justification pour le rejet de l'une d'elles.`;
    }
    case "vitessePointe":
      return "Calcule la vitesse de pointe : évalue v (PAS e) au temps que tu viens de trouver — une valeur PONCTUELLE, pas une moyenne.";
    case "conversion":
      return "Convertis cette vitesse de m/s en km/h (×3,6) — (une valeur approchée est acceptée, à environ 1 % près).";
    case "segmentConstant":
      return "CHANGEMENT DE MODÈLE : sur le segment restant, la vitesse reste CONSTANTE, égale à la vitesse de pointe calculée à l'écran précédent — e(t) ne s'applique plus ici. Calcule le temps t₂=D₂/v (une valeur approchée est acceptée, à environ 1 % près).";
    case "tempsTotal":
      return "Additionne le temps du premier segment (trouvé à l'écran « Résoudre ») et le temps du second segment t₂ pour obtenir le temps total du parcours (une valeur approchée est acceptée, à environ 1 % près).";
  }
}

// ============================================================================
// Aides — niveau 1 (technique/piège), niveau 2 (exemple proche, jamais la réponse).
// ============================================================================

export function texteAideNiveau1(ecran: EcranVitessePosition): string {
  switch (ecran) {
    case "derivee":
      return "e(t) est un simple polynôme du second degré en t — dérive terme à terme avec la règle de puissance (tⁿ)'=n·tⁿ⁻¹, exactement comme pour une fonction en x.";
    case "evaluerV0":
      return "v(t) est la formule que tu viens de trouver à l'écran précédent — remplace SEULEMENT t par t₀, aucun autre calcul.";
    case "resoudre":
      return "Une équation du second degré a en général DEUX solutions. Ici, une seule a un sens PHYSIQUE (un temps ne peut pas être négatif) — il faut l'identifier et REJETER l'autre EXPLICITEMENT, jamais l'ignorer silencieusement en ne donnant que la bonne réponse.";
    case "vitessePointe":
      return "Piège fréquent : confondre la vitesse de pointe (une valeur de v(t) en un instant précis) avec une vitesse MOYENNE sur tout le trajet (distance totale ÷ temps total) — ce n'est PAS ce qui est demandé ici.";
    case "conversion":
      return "1 m/s = 3,6 km/h (3600 s dans une heure, 1000 m dans un km : 3600/1000=3,6) — multiplie la vitesse en m/s par 3,6.";
    case "segmentConstant":
      return "Sur ce segment, le mobile n'accélère plus : sa vitesse est CONSTANTE, donc distance = vitesse × temps, soit t₂=D₂/v — e(t) et sa dérivée n'ont plus aucun rôle ici, c'est un changement de modèle, pas seulement un nouveau calcul.";
    case "tempsTotal":
      return "Le temps total est simplement la SOMME des durées des 2 segments — pas besoin de recalculer quoi que ce soit d'autre.";
  }
}

export function texteAideNiveau2(ecran: EcranVitessePosition): string {
  switch (ecran) {
    case "derivee":
      return "Exemple : e(t)=t²+3t → v(t)=e'(t)=2t+3.";
    case "evaluerV0":
      return "Exemple : v(t)=2t+3, t₀=2 → v(2)=2·2+3=7.";
    case "resoudre":
      return "Exemple : t²+3t=40 ⟺ t²+3t-40=0 ⟹ t=5 ou t=-8. Seul t=5 est retenu (temps positif).";
    case "vitessePointe":
      return "Exemple : v(t)=2t+3, temps retenu t=5 → v(5)=2·5+3=13 (m/s).";
    case "conversion":
      return "Exemple : 13 m/s × 3,6 = 46,8 km/h.";
    case "segmentConstant":
      return "Exemple : D₂=44 m, v=6 m/s → t₂=44/6≈7,33 s.";
    case "tempsTotal":
      return "Exemple : t₁=4 s, t₂≈7,33 s → temps total ≈11,33 s.";
  }
}

// ============================================================================
// QCM justification — libellé de la consigne (l'écran affiche `exercice.optionsRejetRacine`
// directement, ordre déjà mélangé à la construction).
// ============================================================================

/** JAMAIS de valeur numérique de `racineRejetee` dans ce texte — l'élève doit encore la TROUVER
 * lui-même dans les 2 champs juste au-dessus ; la révéler ici court-circuiterait cette étape. */
export function consigneJustification(): string {
  return "Une des deux solutions que tu viens de trouver est négative. Pourquoi la rejette-t-on ?";
}

// ============================================================================
// Valeurs CONFIRMÉES — formes canoniques (état actuel + récapitulatif).
// ============================================================================

function formatV0ConfirmeLatex(exercice: ExerciceVitessePosition): string {
  return `v(t_0)=${valeurVitesseExacte(exercice, exercice.t0)}`;
}

function formatRacineRetenueConfirmeeLatex(exercice: ExerciceVitessePosition): string {
  return `t=${exercice.tCible}\\text{ s (retenue)}`;
}

function formatRacineRejeteeConfirmeeLatex(exercice: ExerciceVitessePosition): string {
  return `t=${exercice.racineRejetee}\\text{ (rejetée)}`;
}

function formatVitessePointeConfirmeeLatex(exercice: ExerciceVitessePosition): string {
  return `v(${exercice.tCible})=${valeurVitesseExacte(exercice, exercice.tCible)}\\text{ m/s}`;
}

function vAtCible(exercice: ExerciceVitessePosition): number {
  return valeurVitesseExacte(exercice, exercice.tCible);
}

function formatConversionConfirmeeLatex(exercice: ExerciceVitessePosition): string {
  const kmh = vAtCible(exercice) * 3.6;
  return `\\approx ${kmh.toFixed(2)}\\text{ km/h}`;
}

function t2Exact(exercice: ExerciceVitessePosition): number {
  if (exercice.variante !== "B") throw new Error("t2Exact : exercice hors variante B");
  return exercice.D2 / vAtCible(exercice);
}

function formatSegmentConstantConfirmeLatex(exercice: ExerciceVitessePosition): string {
  return `t_2\\approx ${t2Exact(exercice).toFixed(2)}\\text{ s}`;
}

function formatTempsTotalConfirmeLatex(exercice: ExerciceVitessePosition): string {
  return `t_{total}\\approx ${(exercice.tCible + t2Exact(exercice)).toFixed(2)}\\text{ s}`;
}

/** Bloc "état actuel" — rappelle les valeurs CONFIRMÉES des écrans déjà traversés pour CET
 * exercice (jamais dérivé de la saisie brute de l'élève), `null` sur le premier écran. */
export function formatTermesEtatActuelLatex(exercice: ExerciceVitessePosition, ecran: EcranVitessePosition): string[] | null {
  const ordre = ordreEcransVitessePosition(exercice);
  const index = ordre.indexOf(ecran);
  if (index <= 0) return null;

  const termes = [formatVDeTLatex(exercice)];
  if (index >= 2) termes.push(formatV0ConfirmeLatex(exercice));
  if (index >= 3) termes.push(formatRacineRetenueConfirmeeLatex(exercice), formatRacineRejeteeConfirmeeLatex(exercice));
  if (index >= 4) termes.push(formatVitessePointeConfirmeeLatex(exercice));
  // Variante A s'arrête à l'écran "conversion" (index 4, dernier écran) : rien à afficher après —
  // aucun écran suivant n'existe pour montrer une conversion déjà confirmée. Variante B continue
  // avec "tempsTotal" (index 5), qui doit voir le temps du 2e segment déjà confirmé.
  if (exercice.variante === "B" && index >= 5) termes.push(formatSegmentConstantConfirmeLatex(exercice));
  return termes;
}

// ============================================================================
// Récapitulatif final — réponse ATTENDUE, par écran RÉELLEMENT traversé.
// ============================================================================

export function formatReponseAttenduePhaseLatex(exercice: ExerciceVitessePosition, ecran: EcranVitessePosition): string[] {
  switch (ecran) {
    case "derivee":
      return [formatVDeTLatex(exercice)];
    case "evaluerV0":
      return [formatV0ConfirmeLatex(exercice)];
    case "resoudre":
      return [formatRacineRetenueConfirmeeLatex(exercice), formatRacineRejeteeConfirmeeLatex(exercice)];
    case "vitessePointe":
      return [formatVitessePointeConfirmeeLatex(exercice)];
    case "conversion":
      return [formatConversionConfirmeeLatex(exercice)];
    case "segmentConstant":
      return [formatSegmentConstantConfirmeLatex(exercice)];
    case "tempsTotal":
      return [formatTempsTotalConfirmeLatex(exercice)];
  }
}

// ============================================================================
// Réexport pratique — `valeurPosition` sert au débogage/tests de la couche présentation, jamais
// utilisée pour VÉRIFIER une réponse élève ici (ça, c'est `moteur5e/verificationVitessePosition.ts`).
// ============================================================================
export { valeurPosition };
