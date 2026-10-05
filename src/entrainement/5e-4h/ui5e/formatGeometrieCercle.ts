/**
 * Couche présentation (5e) — consignes/labels/aides pour 5gen12 ("Problèmes de géométrie du
 * cercle"). Les 17 écrans possibles (répartis sur 3 scénarios survivants — A2/A4 supprimés) ont
 * tous la même forme (un champ texte libre, une cible numérique) — ce module fournit donc, PAR
 * PHASE, un label court, une consigne, une aide niveau 1 (rappel de formule) et une aide niveau 2
 * (formule substituée avec les vraies valeurs de l'instance, jamais le résultat final calculé) —
 * absente pour les 3 écrans dont l'aide niveau 2 a été retirée (voir `PHASES_AIDE_MAX_1`,
 * `moteur5e/sessionGeometrieCercle.ts`).
 */
import type { ExerciceGeometrieCercle, ExerciceLentille, ExerciceSecteurBalaye, ExerciceSegmentCirculaire, ScenarioGeometrieCercle } from "../core5e/geometrieCercle.types";
import type { PhaseGeometrieCercle } from "../moteur5e/typesGeometrieCercle";

function arrondi2(v: number): number {
  return Math.round(v * 100) / 100;
}

// ============================================================================
// Consigne générale + bloc de données — par scénario.
// ============================================================================

export function consigneGenerale(exercice: ExerciceGeometrieCercle): string {
  switch (exercice.scenario) {
    case "secteurBalaye":
      return "Détermine l'aire du secteur balayé d'un angle θ entre les rayons r₁ et r₂.";
    case "segmentCirculaire":
      return "Détermine l'aire du segment circulaire délimité par la corde de longueur c et l'arc de rayon r.";
    case "lentille":
      return "Deux cercles de rayon r₁ et r₂ sécants partagent une corde commune c. Détermine l'aire de la lentille (la zone commune aux deux cercles).";
  }
}

/** Chaque donnée est un ITEM SÉPARÉ (jamais un unique bloc `\quad`-joint) — affiché un par ligne
 * (convention énoncé, `equation-box-donnees`), jamais côte à côte. */
function formatDonneesSecteurBalaye(ex: ExerciceSecteurBalaye): string[] {
  return [`\\theta=${ex.thetaDeg}°`, `r_1=${ex.r1}`, `r_2=${ex.r2}`];
}
function formatDonneesSegmentCirculaire(ex: ExerciceSegmentCirculaire): string[] {
  return [`r=${ex.r}`, `c=${arrondi2(ex.c)}`];
}
function formatDonneesLentille(ex: ExerciceLentille): string[] {
  return [`r_1=${ex.segment1.r}`, `r_2=${ex.segment2.r}`, `c=${arrondi2(ex.c)}`];
}

export function blocDonneesLatex(exercice: ExerciceGeometrieCercle): string[] {
  switch (exercice.scenario) {
    case "secteurBalaye":
      return formatDonneesSecteurBalaye(exercice);
    case "segmentCirculaire":
      return formatDonneesSegmentCirculaire(exercice);
    case "lentille":
      return formatDonneesLentille(exercice);
  }
}

// ============================================================================
// Label / consigne / aides — par phase.
// ============================================================================

const LABELS: Record<PhaseGeometrieCercle, string> = {
  conversionRad: "θ (rad) =",
  aireGrandSecteur: "A₁ =",
  airePetitSecteur: "A₂ =",
  aireBalayee: "A=",
  angleTheta: "θ (radians) =",
  aireSecteur: "Aire du secteur =",
  aireTriangle: "Aire du triangle =",
  aireSegment: "Aire du segment =",
  angle1: "θ (radians) =",
  secteur1: "Aire du secteur 1 =",
  triangle1: "Aire du triangle 1 =",
  segmentAire1: "Aire du segment 1 =",
  angle2: "θ (radians) =",
  secteur2: "Aire du secteur 2 =",
  triangle2: "Aire du triangle 2 =",
  segmentAire2: "Aire du segment 2 =",
  aireLentille: "Aire de la lentille =",
};

export function labelPhase(phase: PhaseGeometrieCercle): string {
  return LABELS[phase];
}

const CONSIGNES: Record<PhaseGeometrieCercle, string> = {
  conversionRad: "Convertis θ en radians (arrondis au dixième de radian près).",
  aireGrandSecteur: "Calcule l'aire A₁ du grand secteur (arrondis à l'unité près).",
  airePetitSecteur: "Calcule l'aire A₂ du petit secteur (arrondis à l'unité près).",
  aireBalayee: "Calcule l'aire balayée A (arrondis à l'unité près).",
  angleTheta: "Utilise la loi des cosinus sur le triangle isocèle rayon-rayon-corde pour trouver θ, EN RADIANS (arrondis au dixième de radian près).",
  aireSecteur: "Calcule l'aire du secteur correspondant (arrondis à l'unité près).",
  aireTriangle: "Calcule l'aire du triangle isocèle formé par les 2 rayons et la corde (arrondis à l'unité près).",
  aireSegment: "Calcule l'aire du segment circulaire (arrondis à l'unité près) :",
  angle1: "Loi des cosinus sur le premier cercle (rayon r₁) : trouve θ₁, EN RADIANS (arrondis au dixième de radian près).",
  secteur1: "Aire du secteur du premier cercle (arrondis à l'unité près).",
  triangle1: "Aire du triangle isocèle du premier cercle (arrondis à l'unité près).",
  segmentAire1: "Calcule l'aire du segment circulaire (arrondis à l'unité près) :",
  angle2: "Loi des cosinus sur le second cercle (rayon r₂) : trouve θ₂, EN RADIANS (arrondis au dixième de radian près).",
  secteur2: "Aire du secteur du second cercle (arrondis à l'unité près).",
  triangle2: "Aire du triangle isocèle du second cercle (arrondis à l'unité près).",
  segmentAire2: "Calcule l'aire du segment circulaire (arrondis à l'unité près) :",
  aireLentille: "Aire de la lentille : segment 1 + segment 2 (arrondis à l'unité près).",
};

export function consignePhase(_exercice: ExerciceGeometrieCercle, phase: PhaseGeometrieCercle): string {
  return CONSIGNES[phase];
}

const AIDES_NIVEAU1: Record<PhaseGeometrieCercle, string> = {
  conversionRad: "θ(rad) = θ(°) × π/180.",
  aireGrandSecteur: "Aire d'un secteur circulaire : A=½r²θ, avec θ en RADIANS.",
  airePetitSecteur: "Aire d'un secteur circulaire : A=½r²θ, avec θ en RADIANS.",
  aireBalayee: "L'aire balayée est la différence entre les 2 secteurs déjà calculés.",
  angleTheta: "Loi des cosinus : cos θ=(2r²−c²)/(2r²), puis θ=acos(...).",
  aireSecteur: "Aire d'un secteur circulaire : A=½r²θ, avec θ en RADIANS.",
  aireTriangle: "A=½r²sin θ, avec θ en RADIANS.",
  aireSegment: "Le segment circulaire = secteur − triangle (le triangle est TOUJOURS à l'intérieur du secteur).",
  angle1: "Loi des cosinus : cos θ₁=(2r₁²−c²)/(2r₁²), puis θ₁=acos(...).",
  secteur1: "Aire d'un secteur circulaire : A=½r₁²θ₁, avec θ₁ en RADIANS.",
  triangle1: "A=½r₁²sin θ₁, avec θ₁ en RADIANS.",
  segmentAire1: "Le segment = secteur − triangle.",
  angle2: "Loi des cosinus : cos θ₂=(2r₂²−c²)/(2r₂²), puis θ₂=acos(...).",
  secteur2: "Aire d'un secteur circulaire : A=½r₂²θ₂, avec θ₂ en RADIANS.",
  triangle2: "A=½r₂²sin θ₂, avec θ₂ en RADIANS.",
  segmentAire2: "Le segment = secteur − triangle.",
  aireLentille: "La lentille est la réunion des 2 segments circulaires, un par cercle.",
};

export function texteAideNiveau1(phase: PhaseGeometrieCercle): string {
  return AIDES_NIVEAU1[phase];
}

/** Aide niveau 2 — formule substituée avec les VRAIES valeurs de l'instance, jamais le résultat
 * final calculé (même convention que le reste de la plateforme). */
// ============================================================================
// Bloc "état actuel" (écran, à partir du 2e de chaque scénario) + récapitulatif final (chaque
// écran réellement traversé) — les deux réutilisent la MÊME primitive `formatValeurPhaseLatex`
// (un fragment "symbole = valeur" par phase, dérivé PUREMENT de `exercice`, jamais de la saisie
// brute de l'élève — même convention que le reste de la plateforme : un écran n'est atteint qu'une
// fois l'écran précédent réellement résolu, correctement ou par révélation, donc `exercice.xxx` est
// toujours la vraie valeur canonique), la seule différence étant la TRANCHE de phases considérée
// (état actuel : celles strictement avant la phase courante ; récapitulatif : toutes celles du
// scénario). `PHASES_PAR_SCENARIO` réplique volontairement `ORDRE_PHASES`
// (`moteur5e/typesGeometrieCercle.ts`, non exportée) plutôt que de l'importer — même principe de
// duplication déjà établi ailleurs sur la plateforme pour ce type de petite table réutilisée
// uniquement côté présentation (ex. la "convention arrondie" répliquée localement dans plusieurs
// moteurs).
// ============================================================================

const PHASES_PAR_SCENARIO: Record<ScenarioGeometrieCercle, PhaseGeometrieCercle[]> = {
  secteurBalaye: ["conversionRad", "aireGrandSecteur", "airePetitSecteur", "aireBalayee"],
  segmentCirculaire: ["angleTheta", "aireSecteur", "aireTriangle", "aireSegment"],
  lentille: ["angle1", "secteur1", "triangle1", "segmentAire1", "angle2", "secteur2", "triangle2", "segmentAire2", "aireLentille"],
};

/** Liste ordonnée des phases d'un scénario donné — consommée par le récapitulatif final (une ligne
 * par phase) et, en interne, par `formatTermesEtatActuelGeometrieCercle`. */
export function phasesDuScenario(scenario: ScenarioGeometrieCercle): PhaseGeometrieCercle[] {
  return PHASES_PAR_SCENARIO[scenario];
}

/** Fragment KaTeX "symbole = valeur" pour UNE phase donnée — même notation que `blocDonneesLatex`/
 * `texteAideNiveau2` (θ en `\theta`, degré en `°` littéral, sous-scripts `_1`/`_{secteur}`...).
 * Consommé à la fois pour l'état actuel (phases déjà confirmées) et pour le récapitulatif final
 * (n'importe quelle phase du scénario, y compris la dernière). θ affiché EN RADIANS pour
 * `angleTheta`/`angle1`/`angle2` (jamais en degrés — cohérent avec la cible directe en radians de
 * ces 3 écrans, C.3/C.4). */
export function formatValeurPhaseLatex(exercice: ExerciceGeometrieCercle, phase: PhaseGeometrieCercle): string {
  switch (exercice.scenario) {
    case "secteurBalaye":
      switch (phase) {
        case "conversionRad":
          return `\\theta_{rad} = ${arrondi2(exercice.thetaRad)}`;
        case "aireGrandSecteur":
          return `A_1 = ${arrondi2(exercice.aireGrandSecteur)}`;
        case "airePetitSecteur":
          return `A_2 = ${arrondi2(exercice.airePetitSecteur)}`;
        case "aireBalayee":
          return `A_1-A_2 = ${arrondi2(exercice.aireBalayee)}`;
        default:
          return "";
      }
    case "segmentCirculaire":
      switch (phase) {
        case "angleTheta":
          return `\\theta = ${arrondi2(exercice.thetaRad)}`;
        case "aireSecteur":
          return `A_{secteur} = ${arrondi2(exercice.aireSecteur)}`;
        case "aireTriangle":
          return `A_{triangle} = ${arrondi2(exercice.aireTriangle)}`;
        case "aireSegment":
          return `A_{segment} = ${arrondi2(exercice.aireSegment)}`;
        default:
          return "";
      }
    case "lentille":
      switch (phase) {
        case "angle1":
          return `\\theta_1 = ${arrondi2(exercice.segment1.thetaRad)}`;
        case "secteur1":
          return `A_{secteur,1} = ${arrondi2(exercice.segment1.aireSecteur)}`;
        case "triangle1":
          return `A_{triangle,1} = ${arrondi2(exercice.segment1.aireTriangle)}`;
        case "segmentAire1":
          return `A_{segment,1} = ${arrondi2(exercice.segment1.aireSegment)}`;
        case "angle2":
          return `\\theta_2 = ${arrondi2(exercice.segment2.thetaRad)}`;
        case "secteur2":
          return `A_{secteur,2} = ${arrondi2(exercice.segment2.aireSecteur)}`;
        case "triangle2":
          return `A_{triangle,2} = ${arrondi2(exercice.segment2.aireTriangle)}`;
        case "segmentAire2":
          return `A_{segment,2} = ${arrondi2(exercice.segment2.aireSegment)}`;
        case "aireLentille":
          return `A_{lentille} = ${arrondi2(exercice.aireLentille)}`;
        default:
          return "";
      }
  }
}

/** Bloc "état actuel" — `[]` sur le premier écran de chaque scénario (rien rendu, même principe que
 * `EtatActuelPanel` partout ailleurs sur la plateforme), sinon un fragment par phase déjà confirmée
 * dans CETTE séquence. */
export function formatTermesEtatActuelGeometrieCercle(exercice: ExerciceGeometrieCercle, phase: PhaseGeometrieCercle): string[] {
  const phases = PHASES_PAR_SCENARIO[exercice.scenario];
  const index = phases.indexOf(phase);
  return phases.slice(0, index).map((p) => formatValeurPhaseLatex(exercice, p));
}

/** Label court pour une ligne du récapitulatif final — dérive de `labelPhase` (label de champ, ex.
 * "θ (rad) =") en retirant le "=" final (le récapitulatif n'a jamais de champ à remplir, seulement
 * une catégorie à nommer, comme "CE"/"domf" côté 5gen1). */
export function labelRecapPhase(phase: PhaseGeometrieCercle): string {
  return LABELS[phase].replace(/\s*=\s*$/, "");
}

/** Aide niveau 2 — absente (retourne "") pour `aireSegment`/`segmentAire1`/`segmentAire2` : l'aide
 * niveau 2 de ces 3 écrans a été retirée (voir `PHASES_AIDE_MAX_1`,
 * `moteur5e/sessionGeometrieCercle.ts`) car elle ne faisait que reposer la soustraction déjà donnée
 * par l'aide niveau 1 ("secteur − triangle"), sans rien ajouter — jamais atteinte en pratique
 * (`niveauAideMaxGeometrieCercle` plafonne ces écrans à 1), retirée du switch par cohérence. */
export function texteAideNiveau2(exercice: ExerciceGeometrieCercle, phase: PhaseGeometrieCercle): string {
  switch (exercice.scenario) {
    case "secteurBalaye":
      switch (phase) {
        case "conversionRad":
          return `\\theta = ${exercice.thetaDeg} \\times \\dfrac{\\pi}{180}`;
        case "aireGrandSecteur":
          return `A_1 = \\dfrac{1}{2} \\times ${exercice.r1}^2 \\times \\theta`;
        case "airePetitSecteur":
          return `A_2 = \\dfrac{1}{2} \\times ${exercice.r2}^2 \\times \\theta`;
        case "aireBalayee":
          return `A_1 - A_2 = ${arrondi2(exercice.aireGrandSecteur)} - ${arrondi2(exercice.airePetitSecteur)}`;
        default:
          return "";
      }
    case "segmentCirculaire":
      switch (phase) {
        case "angleTheta":
          return `\\cos\\theta = \\dfrac{2\\times${exercice.r}^2 - ${arrondi2(exercice.c)}^2}{2\\times${exercice.r}^2}`;
        case "aireSecteur":
          return `A = \\dfrac{1}{2} \\times ${exercice.r}^2 \\times \\theta_{rad}`;
        case "aireTriangle":
          return `A = \\dfrac{1}{2} \\times ${exercice.r}^2 \\times \\sin(${arrondi2(exercice.thetaRad)})`;
        default:
          return "";
      }
    case "lentille":
      switch (phase) {
        case "angle1":
          return `\\cos\\theta_1 = \\dfrac{2\\times${exercice.segment1.r}^2 - ${arrondi2(exercice.c)}^2}{2\\times${exercice.segment1.r}^2}`;
        case "secteur1":
          return `A = \\dfrac{1}{2} \\times ${exercice.segment1.r}^2 \\times \\theta_{1,rad}`;
        case "triangle1":
          return `A = \\dfrac{1}{2} \\times ${exercice.segment1.r}^2 \\times \\sin(${arrondi2(exercice.segment1.thetaRad)})`;
        case "angle2":
          return `\\cos\\theta_2 = \\dfrac{2\\times${exercice.segment2.r}^2 - ${arrondi2(exercice.c)}^2}{2\\times${exercice.segment2.r}^2}`;
        case "secteur2":
          return `A = \\dfrac{1}{2} \\times ${exercice.segment2.r}^2 \\times \\theta_{2,rad}`;
        case "triangle2":
          return `A = \\dfrac{1}{2} \\times ${exercice.segment2.r}^2 \\times \\sin(${arrondi2(exercice.segment2.thetaRad)})`;
        case "aireLentille":
          return `${arrondi2(exercice.segment1.aireSegment)} + ${arrondi2(exercice.segment2.aireSegment)}`;
        default:
          return "";
      }
  }
}
