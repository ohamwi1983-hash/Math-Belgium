/**
 * Couche présentation (5e) — consignes/labels/formules pour 5gen6 ("Arcs et secteurs"). Peut
 * dépendre de `src/moteur5e/` (seule `src/moteur5e/` ne peut jamais dépendre de
 * `src/generateurs5e/`) — réutilise `quantitesManquantes` (`moteur5e/typesArcsSecteurs.ts`).
 *
 * Simplification assumée pour cette livraison (signalée explicitement, voir CLAUDE.md section
 * 5gen6) : l'aide niveau 2 substitue la PREMIÈRE formule disponible compte tenu des quantités
 * déjà connues à cet écran (préférence fixe par quantité cible, voir `FORMULES` ci-dessous) —
 * jamais un raisonnement en plusieurs étapes ; dans le cas rare où AUCUNE formule candidate n'est
 * entièrement satisfaite par les quantités connues (ex. θ° demandé avant θ_rad, quand θ° et θ_rad
 * sont tous deux manquants), on retombe sur la formule générale non substituée plutôt que de ne
 * rien afficher.
 */
import { ORDRE_QUANTITES_ARC_SECTEUR } from "../core5e/arcsSecteurs.types";
import type { ExerciceModeConversion, ExerciceModeDeuxVersTrois, QuantiteArcSecteur } from "../core5e/arcsSecteurs.types";
import { quantitesManquantes } from "../moteur5e/typesArcsSecteurs";

function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

function formatMultipleDePiLatex(numerateur: number, denominateur: number): string {
  const signe = numerateur < 0 ? "-" : "";
  let n = Math.abs(numerateur);
  let d = denominateur;
  const g = pgcd(n, d);
  n /= g;
  d /= g;
  const piNumerateur = n === 1 ? "\\pi" : `${n}\\pi`;
  if (d === 1) return `${signe}${piNumerateur}`;
  return `${signe}\\dfrac{${piNumerateur}}{${d}}`;
}

export function fractionPiThetaRad(thetaDeg: number): string {
  return formatMultipleDePiLatex(thetaDeg / 5, 36);
}
export function fractionPiL(r: number, thetaDeg: number): string {
  return formatMultipleDePiLatex(r * (thetaDeg / 5), 36);
}
export function fractionPiA(r: number, thetaDeg: number): string {
  return formatMultipleDePiLatex(r * r * (thetaDeg / 5), 72);
}

export function formatValeurQuantiteLatex(quantite: QuantiteArcSecteur, exercice: ExerciceModeDeuxVersTrois): string {
  const { r, thetaDeg } = exercice.valeurs;
  switch (quantite) {
    case "thetaDeg":
      return `${thetaDeg}^\\circ`;
    case "thetaRad":
      return fractionPiThetaRad(thetaDeg);
    case "r":
      return `${r}`;
    case "l":
      return fractionPiL(r, thetaDeg);
    case "A":
      return fractionPiA(r, thetaDeg);
  }
}

export const LABELS: Record<QuantiteArcSecteur, string> = { thetaDeg: "θ (degrés)", thetaRad: "θ (radians)", r: "r", l: "l", A: "A" };

export function labelQuantite(quantite: QuantiteArcSecteur): string {
  return `${LABELS[quantite]} =`;
}

const CONSIGNES: Record<QuantiteArcSecteur, string> = {
  thetaDeg: "Calcule la mesure de l'angle θ, en degrés (arrondis au centième près).",
  thetaRad: "Calcule la mesure de l'angle θ, en radians (arrondis au centième près).",
  r: "Calcule le rayon r du cercle (arrondis au centième près).",
  l: "Calcule la longueur l de l'arc (arrondis au centième près).",
  A: "Calcule l'aire A du secteur (arrondis au centième près).",
};

export function consigneQuantite(quantite: QuantiteArcSecteur): string {
  return CONSIGNES[quantite];
}

/** Les quantités déjà affichables à cet écran : les 2 données de départ, plus toute quantité
 * manquante déjà résolue (celles qui précèdent `phase` dans l'ordre de résolution). */
export function quantitesConnuesJusqua(exercice: ExerciceModeDeuxVersTrois, phase: QuantiteArcSecteur): QuantiteArcSecteur[] {
  const manquantes = quantitesManquantes(exercice);
  const indexPhase = manquantes.indexOf(phase);
  const dejaResolues = manquantes.slice(0, indexPhase);
  return ORDRE_QUANTITES_ARC_SECTEUR.filter((q) => exercice.connues.includes(q) || dejaResolues.includes(q));
}

export function segmentsDonneesConnues(exercice: ExerciceModeDeuxVersTrois, connues: QuantiteArcSecteur[]): string[] {
  return ORDRE_QUANTITES_ARC_SECTEUR.filter((q) => connues.includes(q)).map((q) => `${LABELS[q]} = ${formatValeurQuantiteLatex(q, exercice)}`);
}

/**
 * Bloc "état actuel" (screens 2/3 du mode "deuxVersTrois" uniquement) — rappelle les quantités
 * DÉJÀ RÉSOLUES aux écrans précédents de CETTE séquence, jamais les 2 données de départ (déjà
 * affichées séparément dans le bloc de données fixe, `segmentsDonneesConnues(exercice,
 * exercice.connues)`) — vide au 1er écran (rien n'a encore été résolu), même principe que
 * `formatTermesEtatActuelCELatex` (5gen1) : dérivé PUREMENT de `exercice`, jamais de la saisie
 * brute de l'élève. Réutilise `segmentsDonneesConnues`, jamais une seconde implémentation.
 */
export function segmentsEtatActuelArcSecteur(exercice: ExerciceModeDeuxVersTrois, phase: QuantiteArcSecteur): string[] {
  const manquantes = quantitesManquantes(exercice);
  const indexPhase = manquantes.indexOf(phase);
  const dejaResolues = manquantes.slice(0, indexPhase);
  return segmentsDonneesConnues(exercice, dejaResolues);
}

interface FormuleArcSecteur {
  requiert: QuantiteArcSecteur[];
  latexGeneral: string;
  latexSubstitue: (exercice: ExerciceModeDeuxVersTrois) => string;
}

const FORMULES: Record<QuantiteArcSecteur, FormuleArcSecteur[]> = {
  thetaDeg: [{ requiert: ["thetaRad"], latexGeneral: "\\theta° = \\theta_{rad} \\times \\dfrac{180}{\\pi}", latexSubstitue: (ex) => `\\theta° = ${formatValeurQuantiteLatex("thetaRad", ex)} \\times \\dfrac{180}{\\pi}` }],
  thetaRad: [
    { requiert: ["thetaDeg"], latexGeneral: "\\theta_{rad} = \\theta° \\times \\dfrac{\\pi}{180}", latexSubstitue: (ex) => `\\theta_{rad} = ${formatValeurQuantiteLatex("thetaDeg", ex)} \\times \\dfrac{\\pi}{180}` },
    { requiert: ["r", "l"], latexGeneral: "\\theta_{rad} = \\dfrac{l}{r}", latexSubstitue: (ex) => `\\theta_{rad} = \\dfrac{${formatValeurQuantiteLatex("l", ex)}}{${formatValeurQuantiteLatex("r", ex)}}` },
    { requiert: ["r", "A"], latexGeneral: "\\theta_{rad} = \\dfrac{2A}{r^2}", latexSubstitue: (ex) => `\\theta_{rad} = \\dfrac{2 \\times ${formatValeurQuantiteLatex("A", ex)}}{${ex.valeurs.r}^2}` },
  ],
  r: [
    { requiert: ["thetaRad", "l"], latexGeneral: "r = \\dfrac{l}{\\theta_{rad}}", latexSubstitue: (ex) => `r = \\dfrac{${formatValeurQuantiteLatex("l", ex)}}{${formatValeurQuantiteLatex("thetaRad", ex)}}` },
    { requiert: ["thetaRad", "A"], latexGeneral: "r = \\sqrt{\\dfrac{2A}{\\theta_{rad}}}", latexSubstitue: (ex) => `r = \\sqrt{\\dfrac{2 \\times ${formatValeurQuantiteLatex("A", ex)}}{${formatValeurQuantiteLatex("thetaRad", ex)}}}` },
    { requiert: ["l", "A"], latexGeneral: "r = \\dfrac{2A}{l}", latexSubstitue: (ex) => `r = \\dfrac{2 \\times ${formatValeurQuantiteLatex("A", ex)}}{${formatValeurQuantiteLatex("l", ex)}}` },
  ],
  l: [
    { requiert: ["r", "thetaRad"], latexGeneral: "l = r \\times \\theta_{rad}", latexSubstitue: (ex) => `l = ${ex.valeurs.r} \\times ${formatValeurQuantiteLatex("thetaRad", ex)}` },
    { requiert: ["r", "A"], latexGeneral: "l = \\dfrac{2A}{r}", latexSubstitue: (ex) => `l = \\dfrac{2 \\times ${formatValeurQuantiteLatex("A", ex)}}{${ex.valeurs.r}}` },
  ],
  A: [
    { requiert: ["r", "thetaRad"], latexGeneral: "A = \\dfrac{1}{2} r^2 \\theta_{rad}", latexSubstitue: (ex) => `A = \\dfrac{1}{2} \\times ${ex.valeurs.r}^2 \\times ${formatValeurQuantiteLatex("thetaRad", ex)}` },
    { requiert: ["r", "l"], latexGeneral: "A = \\dfrac{1}{2} \\times r \\times l", latexSubstitue: (ex) => `A = \\dfrac{1}{2} \\times ${ex.valeurs.r} \\times ${formatValeurQuantiteLatex("l", ex)}` },
  ],
};

export function formulesDisponibles(quantite: QuantiteArcSecteur, connues: QuantiteArcSecteur[]): FormuleArcSecteur[] {
  const candidats = FORMULES[quantite];
  const satisfaites = candidats.filter((f) => f.requiert.every((r) => connues.includes(r)));
  return satisfaites.length > 0 ? satisfaites : candidats;
}

export function texteAideNiveau1ArcSecteur(quantite: QuantiteArcSecteur, connues: QuantiteArcSecteur[]): string[] {
  return formulesDisponibles(quantite, connues).map((f) => f.latexGeneral);
}

export function latexAideNiveau2ArcSecteur(exercice: ExerciceModeDeuxVersTrois, quantite: QuantiteArcSecteur, connues: QuantiteArcSecteur[]): string {
  const top = formulesDisponibles(quantite, connues)[0];
  const satisfaite = top.requiert.every((r) => connues.includes(r));
  // Si aucun candidat n'est satisfait par les quantités déjà connues (ex. θ° demandé avant θ_rad),
  // ne JAMAIS substituer avec la valeur réelle de la quantité manquante : celle-ci n'est pas
  // encore "connue" côté élève et serait donnée en avance sur l'écran qui la demande ensuite.
  // Repli sur la formule générale non substituée, conformément à l'intention documentée en tête
  // de ce fichier.
  return satisfaite ? top.latexSubstitue(exercice) : top.latexGeneral;
}

// ============================================================================
// Mode conversion pure
// ============================================================================

export function consigneConversion(exercice: ExerciceModeConversion): string {
  return exercice.direction === "degVersRad" ? "Convertis cette mesure d'angle en radians (arrondis au centième près)." : "Convertis cette mesure d'angle en degrés (arrondis au centième près).";
}

export function labelDepartConversion(exercice: ExerciceModeConversion): string {
  return exercice.direction === "degVersRad" ? "θ (degrés) =" : "θ (radians) =";
}

export function labelReponseConversion(exercice: ExerciceModeConversion): string {
  return exercice.direction === "degVersRad" ? "θ (radians) =" : "θ (degrés) =";
}

/** Reconstruit la fraction exacte kπ/36 depuis `valeurDepart` (mode "exacte" + radVersDeg
 * uniquement) — `valeurDepart` a été calculée exactement comme `k*Math.PI/36` à la génération, la
 * division/l'arrondi ci-dessous la retrouve donc sans perte. */
function formatValeurDepartConversionLatex(exercice: ExerciceModeConversion): string {
  if (exercice.direction === "degVersRad") return `${exercice.valeurDepart}^\\circ`;
  if (exercice.type === "exacte") {
    const k = Math.round(exercice.valeurDepart / (Math.PI / 36));
    return formatMultipleDePiLatex(k, 36);
  }
  return `${exercice.valeurDepart}`;
}

export function latexEnonceConversion(exercice: ExerciceModeConversion): string {
  return `${labelDepartConversion(exercice)} ${formatValeurDepartConversionLatex(exercice)}`;
}

export const TEXTE_AIDE_CONVERSION_NIVEAU1 = "\\theta_{rad} = \\theta° \\times \\dfrac{\\pi}{180} \\qquad \\theta° = \\theta_{rad} \\times \\dfrac{180}{\\pi}";

export function latexAideConversionNiveau2(exercice: ExerciceModeConversion): string {
  const depart = formatValeurDepartConversionLatex(exercice);
  return exercice.direction === "degVersRad" ? `\\theta_{rad} = ${depart} \\times \\dfrac{\\pi}{180}` : `\\theta° = ${depart} \\times \\dfrac{180}{\\pi}`;
}

/** LaTeX de la valeur cible attendue (récapitulatif final uniquement — jamais consommée par
 * `diagnostiquerValeurArcSecteur`, la vérification restant en tolérance ±0.01 côté texte libre) —
 * réutilise `fractionPiThetaRad` (même fraction kπ/36 que la donnée de départ, θ°=k·5) quand
 * direction=degVersRad+exacte ; sinon arrondi au centième (même granularité que
 * `decimaleDeuxChiffres` côté génération), suffixé "°" uniquement pour une cible en degrés. */
export function formatValeurCibleConversionLatex(exercice: ExerciceModeConversion): string {
  if (exercice.direction === "degVersRad") {
    if (exercice.type === "exacte") return fractionPiThetaRad(exercice.valeurDepart);
    return `${Math.round(exercice.valeurCible * 100) / 100}`;
  }
  const deg = exercice.type === "exacte" ? exercice.valeurCible : Math.round(exercice.valeurCible * 100) / 100;
  return `${deg}^\\circ`;
}
