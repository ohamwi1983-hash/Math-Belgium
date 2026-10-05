/**
 * Couche présentation (5e) — consignes/libellés/formatage pour 5gen30 ("Lecture graphique —
 * dérivées et applications"). Pas de "bloc de données" KaTeX classique — la donnée EST le
 * graphique (`LectureGraphiqueDeriveesGraph`), affiché en tête de CHAQUE écran.
 */
import type { ExerciceLectureGraphiqueDerivees, ExtremumLectureGraphiqueDerivees, InflexionLectureGraphiqueDerivees } from "../core5e/lectureGraphiqueDerivees.types";
import type { EcranLectureGraphiqueDerivees } from "../moteur5e/typesLectureGraphiqueDerivees";
import { ordreEcransLectureGraphiqueDerivees } from "../moteur5e/typesLectureGraphiqueDerivees";
import { tableauFPrimeAttendu, tableauFSecondeAttendu, TOLERANCE_POSITION_INFLEXION, TOLERANCE_VALEUR_EXTREMUM } from "../moteur5e/verificationLectureGraphiqueDerivees";
import { listeAsymptotes } from "../moteur5e/typesLectureGraphiqueLimites";
import { formatCibleAsymptoteLatex, labelAsymptoteLatex } from "./formatLectureGraphiqueLimites";
import { libelleLigne2Tableau } from "./formatEtudeLocale";

export function consigneGenerale(): string {
  return "Lis les informations directement sur le graphique — aucun calcul n'est nécessaire.";
}

export function questionFinale(exercice: ExerciceLectureGraphiqueDerivees): string {
  const parties = ["les asymptotes"];
  parties.push("les variations de f");
  if (exercice.extrema.length > 0) parties.push("ses extrema");
  parties.push("la concavité de f");
  if (exercice.inflexions.length > 0) parties.push("ses points d'inflexion");
  return `Objectif : identifier ${parties.join(", ")} à partir du graphique.`;
}

export const LIBELLE_ECRAN_LECTURE_GRAPHIQUE_DERIVEES: Record<EcranLectureGraphiqueDerivees, string> = {
  asymptotes: "Asymptotes",
  tableauFPrime: "Signe de f' et variations",
  extremums: "Valeur des extrema",
  tableauFSeconde: "Signe de f'' et concavité",
  inflexions: "Abscisse des points d'inflexion",
};

export function consigneEcran(ecran: EcranLectureGraphiqueDerivees): string {
  switch (ecran) {
    case "asymptotes":
      return "Donne l'équation de chaque asymptote présente sur le graphique.";
    case "tableauFPrime":
      return "Complète le tableau de signes de f'(x), puis les variations de f qui en découlent — lis-les directement sur le graphique.";
    case "extremums":
      return "Pour CHAQUE extremum repéré sur le graphique, lis sa valeur (ordonnée) le plus précisément possible.";
    case "tableauFSeconde":
      return "Complète le tableau de signes de f''(x), puis la concavité de f qui en découle — lis-la directement sur le graphique.";
    case "inflexions":
      return "Pour CHAQUE point d'inflexion repéré sur le graphique, lis son abscisse le plus précisément possible.";
  }
}

/** Aide textuelle — UNIQUEMENT pour les écrans "tableauFPrime"/"tableauFSeconde" (repli textuel
 * documenté : le mécanisme de cellule active de `TableauEtudeLocaleBuilder` — générique, partagé
 * avec 5gen29 — n'expose aucun callback de focus, câbler un surlignage visuel dessus aurait exigé
 * de modifier ce composant partagé ; les écrans "asymptotes"/"extremums"/"inflexions" restent, eux,
 * en aide PUREMENT visuelle — surlignage du graphique, voir `zoneSurlignageEcran` ci-dessous — un
 * seul niveau, cohérent avec `NIVEAU_AIDE_MAX_LECTURE_GRAPHIQUE_DERIVEES=1`). */
export function texteAideNiveau1(ecran: "tableauFPrime" | "tableauFSeconde"): string {
  if (ecran === "tableauFPrime")
    return "f' est positive là où la courbe MONTE (↗), négative là où elle DESCEND (↘) — un extremum est le point où la courbe change de sens.";
  return "f'' est positive là où la courbe est concave vers le HAUT (∪, comme un bol), négative là où elle est concave vers le BAS (∩, comme une colline) — un point d'inflexion est où la concavité change.";
}

// ============================================================================
// Labels — extrema/inflexions, ordinaux (gauche→droite, jamais l'abscisse exacte : c'est
// précisément ce que l'élève doit estimer visuellement, jamais une donnée fournie).
// ============================================================================

function ordinalFr(n: number): string {
  return n === 1 ? "1er" : `${n}e`;
}

export function labelsChampsExtremums(extrema: ExtremumLectureGraphiqueDerivees[]): string[] {
  return extrema.map((_, i) => `y_{${ordinalFr(i + 1)}}=`);
}
export function labelsChampsInflexions(inflexions: InflexionLectureGraphiqueDerivees[]): string[] {
  return inflexions.map((_, i) => `x_{${ordinalFr(i + 1)}}=`);
}

export function precisionAnnonceeExtremum(): string {
  return `(valeur approximative — toute lecture à environ ${TOLERANCE_VALEUR_EXTREMUM} près est acceptée)`;
}
export function precisionAnnonceeInflexion(): string {
  return `(abscisse approximative — toute estimation à environ ${TOLERANCE_POSITION_INFLEXION} près est acceptée, une lecture précise de point d'inflexion étant intrinsèquement difficile)`;
}

// ============================================================================
// Tableau étendu — en-têtes de colonnes ("racine" → position lue, pas de forme exacte puisque lue
// sur un graphique ; "exclusion" → position de l'AV).
// ============================================================================

function formatNombreAxeLatex(v: number): string {
  return `${Math.round(v * 10) / 10}`;
}

export function formatEnteteColonnesTableauFPrime(exercice: ExerciceLectureGraphiqueDerivees, colonnes: { type: "zone" | "racine" | "exclusion"; index: number }[]): string[] {
  return colonnes.map((col) => {
    if (col.type === "racine") return formatNombreAxeLatex(exercice.extrema[col.index].position);
    if (col.type === "exclusion") return formatNombreAxeLatex(exercice.asymptotique.vas[col.index].position);
    return "";
  });
}
export function formatEnteteColonnesTableauFSeconde(exercice: ExerciceLectureGraphiqueDerivees, colonnes: { type: "zone" | "racine" | "exclusion"; index: number }[]): string[] {
  return colonnes.map((col) => {
    if (col.type === "racine") return formatNombreAxeLatex(exercice.inflexions[col.index].position);
    if (col.type === "exclusion") return formatNombreAxeLatex(exercice.asymptotique.vas[col.index].position);
    return "";
  });
}

// ============================================================================
// Bloc "état actuel" — accumule les faits CONFIRMÉS des écrans déjà traversés pour CET exercice.
// ============================================================================

export function formatTermesEtatActuelLatex(exercice: ExerciceLectureGraphiqueDerivees, phase: EcranLectureGraphiqueDerivees): string[] | null {
  const ordre = ordreEcransLectureGraphiqueDerivees(exercice);
  const index = ordre.indexOf(phase);
  if (index <= 0) return null;

  const termes: string[] = [];
  for (let i = 0; i < index; i++) {
    switch (ordre[i]) {
      case "asymptotes": {
        const slots = listeAsymptotes(exercice.asymptotique);
        termes.push(...slots.map((s) => `${labelAsymptoteLatex(slots, s.id)}${formatCibleAsymptoteLatex(s.cible)}`));
        break;
      }
      case "tableauFPrime": {
        const attendu = tableauFPrimeAttendu(exercice);
        attendu.colonnes.forEach((col, j) => {
          if (col.type === "racine") termes.push(`x=${formatNombreAxeLatex(exercice.extrema[col.index].position)} \\Rightarrow \\text{${libelleLigne2Tableau(attendu.ligne2[j])}}`);
        });
        break;
      }
      case "extremums":
        termes.push(...exercice.extrema.map((e, k) => `y_{${ordinalFr(k + 1)}}=${formatNombreAxeLatex(e.valeur)}`));
        break;
      case "tableauFSeconde": {
        const attendu = tableauFSecondeAttendu(exercice);
        attendu.colonnes.forEach((col) => {
          if (col.type === "racine") termes.push(`x=${formatNombreAxeLatex(exercice.inflexions[col.index].position)} \\Rightarrow \\text{PI}`);
        });
        break;
      }
      case "inflexions":
        termes.push(...exercice.inflexions.map((p, k) => `x_{${ordinalFr(k + 1)}}=${formatNombreAxeLatex(p.position)}`));
        break;
    }
  }
  return termes.length === 0 ? null : termes;
}

// ============================================================================
// Récapitulatif final — réponse ATTENDUE, par écran RÉELLEMENT traversé.
// ============================================================================

export function formatReponseAttenduePhaseLatex(exercice: ExerciceLectureGraphiqueDerivees, ecran: EcranLectureGraphiqueDerivees): string[] {
  switch (ecran) {
    case "asymptotes": {
      const slots = listeAsymptotes(exercice.asymptotique);
      return slots.map((s) => `${labelAsymptoteLatex(slots, s.id)}${formatCibleAsymptoteLatex(s.cible)}`);
    }
    case "tableauFPrime":
      return exercice.extrema.map((e, i) => `${ordinalFr(i + 1)}\\text{ extremum : }x\\approx${formatNombreAxeLatex(e.position)} \\Rightarrow \\text{${e.classification === "max" ? "MAX" : "min"}}`);
    case "extremums":
      return exercice.extrema.map((e, i) => `y_{${ordinalFr(i + 1)}}\\approx${formatNombreAxeLatex(e.valeur)}`);
    case "tableauFSeconde":
      return exercice.inflexions.map((p, i) => `${ordinalFr(i + 1)}\\text{ PI : }x\\approx${formatNombreAxeLatex(p.position)}`);
    case "inflexions":
      return exercice.inflexions.map((p, i) => `x_{${ordinalFr(i + 1)}}\\approx${formatNombreAxeLatex(p.position)}`);
  }
}
