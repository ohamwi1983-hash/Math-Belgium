import type { EtatPuceProgression } from "../../components/ProgressionPuces";
import type { ExerciceEncadrerIntegrales } from "../core6e/encadrerIntegrales.types";
import type { EtatSessionEncadrerIntegrales, PhaseEncadrerIntegrales } from "../moteur6e/typesEncadrerIntegrales";
import { estPhaseChoix, phasesExercice } from "../moteur6e/typesEncadrerIntegrales";
import { optionCorrecte } from "../moteur6e/verificationEncadrerIntegrales";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatReponseAttendueLatex, libellePhase } from "./formatEncadrerIntegrales";

/**
 * « Ce qu'on sait déjà » de `6gen79` : réponse confirmée de chaque écran clos (choix fermé : son
 * énoncé court en LaTeX ; champs : les valeurs attendues), ✓ ou ✗ selon qu'elle a été trouvée.
 */

/** Résumé LaTeX d'un verdict (écran à choix fermé). */
function resumeVerdict(e: ExerciceEncadrerIntegrales, phase: PhaseEncadrerIntegrales): string {
  if (!estPhaseChoix(phase)) return "";
  const id = optionCorrecte(e, phase);
  switch (phase) {
    case "signeF":
      return id === "positif" ? "f(x)\\ge 0" : "f(x)\\le 0";
    case "signeOrdonne":
      return e.variante === "signe" ? `\\int_{${e.p.latex.replace(/\\dfrac/g, "\\frac")}}^{${e.q.latex.replace(/\\dfrac/g, "\\frac")}} f(x)\\,dx${id === "positif" ? "\\ge" : "\\le"} 0` : "";
    case "conclusionSigne":
      return id === "positif" ? "I\\ge 0" : "I\\le 0";
    case "inegalite":
      return id === "fInfG" ? "f(x)\\le g(x)" : id === "fSupG" ? "f(x)\\ge g(x)" : "";
    case "conclusionComparaison":
      return id === "inf" ? "I\\le J" : id === "sup" ? "I\\ge J" : "";
  }
}

function texteVerdict(e: ExerciceEncadrerIntegrales, phase: PhaseEncadrerIntegrales): string | null {
  if (phase === "inegalite" && e.variante === "comparer" && e.issue === "change") return "f − g change de signe sur l'intervalle";
  if (phase === "conclusionComparaison" && e.variante === "comparer" && e.issue === "change") return "on ne peut pas conclure sans calcul";
  return null;
}

export function calculerRecapitulatifEncadrerIntegrales(etat: EtatSessionEncadrerIntegrales): EntreeRecapitulatif[] {
  const e = etat.exerciceCourant;
  const phases = phasesExercice(e);
  const index = phases.indexOf(etat.phase);
  const entrees: EntreeRecapitulatif[] = [];
  for (const phase of phases.slice(0, index)) {
    const revele = etat.revelesPartiels[phase] ?? false;
    const libelle = libellePhase(e, phase);
    if (estPhaseChoix(phase)) {
      const texte = texteVerdict(e, phase);
      entrees.push(texte ? { libelle, valeur: texte, estLatex: false, revele } : { libelle, valeur: resumeVerdict(e, phase), estLatex: true, revele });
    } else {
      const formules = formatReponseAttendueLatex(e, phase);
      entrees.push({ libelle, valeur: "", estLatex: true, revele, valeurs: formules.map((x, i) => (i < formules.length - 1 ? `${x}\\qquad` : x)) });
    }
  }
  return entrees;
}

/** Une puce par écran de la chaîne de cet exercice. */
export function calculerSegmentsProgressionEncadrerIntegrales(etat: EtatSessionEncadrerIntegrales, aideParPhase: Partial<Record<string, boolean>>): EtatPuceProgression[] {
  const phases = phasesExercice(etat.exerciceCourant);
  const index = etat.terminee ? phases.length : phases.indexOf(etat.phase);
  return phases.map((phase, i) => {
    if (i > index) return "a-venir";
    if (i === index) return "courante";
    if (etat.revelesPartiels[phase]) return "revele";
    return aideParPhase[phase] ? "aide" : "correcte";
  });
}
