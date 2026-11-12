/**
 * Couche présentation (5e) — consignes, libellés et formatage pour 5gen30 ("Lecture graphique —
 * dérivées et applications"). La donnée EST le graphique (`LectureGraphiqueDeriveesGraph`), affiché
 * en tête de chaque écran.
 */
import type { ExerciceLectureGraphiqueDerivees } from "../core5e/lectureGraphiqueDerivees.types";
import type { EcranLectureGraphiqueDerivees } from "../moteur5e/typesLectureGraphiqueDerivees";
import { ORDRE_ECRANS_LECTURE_GRAPHIQUE_DERIVEES, ecranSansObjet } from "../moteur5e/typesLectureGraphiqueDerivees";
import type { CibleAsymptote, SlotAsymptote } from "../moteur5e/typesLectureGraphiqueLimites";
import { listeAsymptotes } from "../moteur5e/typesLectureGraphiqueLimites";
import {
  pointsTangenteHorizontale,
  TOLERANCE_POSITION_INFLEXION,
  TOLERANCE_POSITION_TANGENTE,
  TOLERANCE_VALEUR_EXTREMUM,
} from "../moteur5e/verificationLectureGraphiqueDerivees";
import { labelAsymptoteLatex } from "./formatLectureGraphiqueLimites";

export function consigneGenerale(): string {
  return "Lis les informations directement sur le graphique de f : aucun calcul n'est nécessaire.";
}

/** Toujours la même phrase, quelle que soit la courbe (elle ne doit rien révéler). */
export function questionFinale(_exercice?: ExerciceLectureGraphiqueDerivees): string {
  return "Objectif : lire sur le graphique les asymptotes, les variations et les extremums de f, sa concavité et ses points d'inflexion.";
}

export const LIBELLE_ECRAN_LECTURE_GRAPHIQUE_DERIVEES: Record<EcranLectureGraphiqueDerivees, string> = {
  asymptotes: "Asymptotes",
  zerosFPrime: "Tangentes horizontales",
  tableauFPrime: "Signe de f' et variations",
  extremums: "Valeur des extremums",
  inflexions: "Points d'inflexion",
  tableauFSeconde: "Signe de f'' et concavité",
};

export function consigneEcran(ecran: EcranLectureGraphiqueDerivees): string {
  switch (ecran) {
    case "asymptotes":
      return "Nomme chaque asymptote du graphique (verticale, horizontale ou oblique) et donne son équation. S'il n'y en a aucune, coche « Aucune asymptote ».";
    case "zerosFPrime":
      return "Donne l'abscisse de chaque point où la tangente à la courbe est horizontale (f'(x) = 0). S'il n'y en a aucun, coche « Aucun point ».";
    case "tableauFPrime":
      return "Complète le tableau de signes de f'(x), puis les variations de f.";
    case "extremums":
      return "Lis la valeur de f en chaque extremum.";
    case "inflexions":
      return "Donne l'abscisse de chaque point d'inflexion de la courbe. S'il n'y en a aucun, coche « Aucun point ».";
    case "tableauFSeconde":
      return "Complète le tableau de signes de f''(x), puis la concavité de f.";
  }
}

/** Aide de niveau 1 — texte (les écrans « liste d'abscisses » n'ont pas d'aide visuelle : elle
 * montrerait la réponse). */
export function texteAideNiveau1(ecran: EcranLectureGraphiqueDerivees): string {
  switch (ecran) {
    case "asymptotes":
      return "Les asymptotes sont tracées en pointillés. Une droite verticale a une équation x = …, une droite horizontale y = …, une droite oblique y = ax + b (lis deux de ses points pour trouver sa pente).";
    case "zerosFPrime":
      return "La tangente est horizontale au sommet d'une bosse, au fond d'un creux, et aussi là où la courbe s'aplatit un instant sans changer de sens (un palier).";
    case "tableauFPrime":
      return "f' est positive là où la courbe monte (↗), négative là où elle descend (↘). En un point où f' s'annule : maximum si la courbe passe de ↗ à ↘, minimum si elle passe de ↘ à ↗, ni l'un ni l'autre si elle garde le même sens.";
    case "extremums":
      return "La valeur d'un extremum est l'ordonnée du sommet (ou du fond) : lis-la sur l'axe vertical, à hauteur du point.";
    case "inflexions":
      return "Un point d'inflexion est un point où la courbe passe de ∪ (en forme de bol) à ∩ (en forme de colline), ou l'inverse. Entre une bosse et un creux voisins, il y en a toujours un.";
    case "tableauFSeconde":
      return "f'' est positive là où la courbe est tournée vers le haut (∪), négative là où elle est tournée vers le bas (∩). Chaque point d'inflexion sépare deux zones de signes contraires.";
  }
}

// ============================================================================
// Nombres et libellés.
// ============================================================================

/** Arrondi au dixième, virgule décimale, moins typographique (LaTeX). */
export function formatNombreLatex(v: number): string {
  const r = Math.round(v * 10) / 10;
  const s = (Object.is(r, -0) ? 0 : r).toString().replace(".", "{,}");
  return s;
}

function formatNombreTexte(v: number): string {
  return formatNombreLatex(v).replace("{,}", ",").replace("-", "−");
}

/** Équation d'asymptote (virgule décimale : pente ±0,5 possible). */
export function formatCibleAsymptoteLatex(cible: CibleAsymptote): string {
  if (cible.kind === "verticale") return formatNombreLatex(cible.x);
  if (cible.kind === "horizontale") return formatNombreLatex(cible.y);
  const p = cible.pente;
  const terme = p === 1 ? "x" : p === -1 ? "-x" : `${formatNombreLatex(p)}x`;
  const o = cible.ordonnee;
  return o === 0 ? terme : `${terme}${o > 0 ? "+" : "-"}${formatNombreLatex(Math.abs(o))}`;
}

function equationsAsymptotesLatex(slots: SlotAsymptote[]): string[] {
  return slots.map((s) => `${labelAsymptoteLatex(slots, s.id)}${formatCibleAsymptoteLatex(s.cible)}`);
}

/** Libellé du champ de valeur d'un extremum : « f(−2) ≈ » (la position est connue depuis le tableau). */
export function labelsChampsExtremums(exercice: ExerciceLectureGraphiqueDerivees): string[] {
  return exercice.extrema.map((e) => `f(${formatNombreLatex(e.position)})\\approx`);
}

export function precisionAnnonceeExtremum(): string {
  return `Une lecture à ${formatNombreTexte(TOLERANCE_VALEUR_EXTREMUM)} près est acceptée.`;
}
export function precisionAnnoncee(ecran: "zerosFPrime" | "inflexions"): string {
  const t = ecran === "zerosFPrime" ? TOLERANCE_POSITION_TANGENTE : TOLERANCE_POSITION_INFLEXION;
  return `Une lecture à ${formatNombreTexte(t)} près est acceptée.`;
}

/** En-têtes des colonnes des tableaux : position de chaque point (déjà validée à l'écran précédent)
 * ou de chaque AV. */
export function formatEnteteColonnesTableauFPrime(exercice: ExerciceLectureGraphiqueDerivees, colonnes: { type: "zone" | "racine" | "exclusion"; index: number }[]): string[] {
  const points = pointsTangenteHorizontale(exercice);
  return colonnes.map((col) => {
    if (col.type === "racine") return formatNombreLatex(points[col.index].position);
    if (col.type === "exclusion") return formatNombreLatex(exercice.asymptotique.vas[col.index].position);
    return "";
  });
}
export function formatEnteteColonnesTableauFSeconde(exercice: ExerciceLectureGraphiqueDerivees, colonnes: { type: "zone" | "racine" | "exclusion"; index: number }[]): string[] {
  return colonnes.map((col) => {
    if (col.type === "racine") return formatNombreLatex(exercice.inflexions[col.index].position);
    if (col.type === "exclusion") return formatNombreLatex(exercice.asymptotique.vas[col.index].position);
    return "";
  });
}

const NATURE_TEXTE = { max: "maximum", min: "minimum", ni_lun_ni_lautre: "palier (ni max ni min)" } as const;

// ============================================================================
// Réponse ATTENDUE d'un écran (validation, récapitulatif, corrigé papier).
// ============================================================================

export function formatReponseAttenduePhaseLatex(exercice: ExerciceLectureGraphiqueDerivees, ecran: EcranLectureGraphiqueDerivees): string[] {
  switch (ecran) {
    case "asymptotes": {
      const slots = listeAsymptotes(exercice.asymptotique);
      return slots.length === 0 ? ["\\text{aucune asymptote}"] : equationsAsymptotesLatex(slots);
    }
    case "zerosFPrime": {
      const points = pointsTangenteHorizontale(exercice);
      return points.length === 0 ? ["\\text{aucun point}"] : [`x\\approx ${points.map((p) => formatNombreLatex(p.position)).join("\\ ;\\ ")}`];
    }
    case "tableauFPrime": {
      const points = pointsTangenteHorizontale(exercice);
      if (points.length === 0) return ["\\text{f' ne s'annule pas : f est monotone sur chaque intervalle}"];
      return points.map((p) => `x\\approx ${formatNombreLatex(p.position)}\\ :\\ \\text{${NATURE_TEXTE[p.classification]}}`);
    }
    case "extremums":
      return exercice.extrema.map((e) => `f(${formatNombreLatex(e.position)})\\approx ${formatNombreLatex(e.valeur)}\\ \\text{(${e.classification === "max" ? "maximum" : "minimum"})}`);
    case "inflexions":
      return exercice.inflexions.length === 0 ? ["\\text{aucun point d'inflexion}"] : [`x\\approx ${exercice.inflexions.map((p) => formatNombreLatex(p.position)).join("\\ ;\\ ")}`];
    case "tableauFSeconde":
      if (exercice.inflexions.length === 0) return ["\\text{f'' ne s'annule pas : la concavité ne change pas sur chaque intervalle}"];
      return exercice.inflexions.map((p) => `x\\approx ${formatNombreLatex(p.position)}\\ :\\ \\text{point d'inflexion}`);
  }
}

/** « Ce qu'on sait déjà » : termes des écrans déjà parcourus avant `phase` (écrans sans objet exclus). */
export function formatTermesParEcran(exercice: ExerciceLectureGraphiqueDerivees, phase: EcranLectureGraphiqueDerivees | "termine"): { ecran: EcranLectureGraphiqueDerivees; termes: string[] }[] {
  const ordre = ORDRE_ECRANS_LECTURE_GRAPHIQUE_DERIVEES;
  const fin = phase === "termine" ? ordre.length : ordre.indexOf(phase);
  return ordre
    .slice(0, fin)
    .filter((e) => !ecranSansObjet(exercice, e))
    .map((ecran) => ({ ecran, termes: formatReponseAttenduePhaseLatex(exercice, ecran) }));
}
