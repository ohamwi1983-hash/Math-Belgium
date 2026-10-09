import type { ExerciceCalculPrimitives } from "../core6e/calculPrimitives.types";
import type { ExerciceIntegraleMoyenne, ExerciceIntegraleParametre, ExerciceIntegraleSimple, ExerciceIntegralesDefinies } from "../core6e/integralesDefinies.types";
import type { PhaseIntegralesDefinies, ResultatExerciceIntegralesDefinies } from "../moteur6e/typesIntegralesDefinies";
import { phasesPourExercice } from "../moteur6e/typesIntegralesDefinies";
import type { PhaseCalculPrimitives } from "../moteur6e/typesCalculPrimitives";
import { phasesPourExercice as phasesPourExercicePrimitive } from "../moteur6e/typesCalculPrimitives";
import type { AideAvecLatex, ChampDef } from "./formatCalculPrimitives";
import {
  aideNiveau1 as aideNiveau1Primitive,
  aideNiveau2 as aideNiveau2Primitive,
  blocDonnees as blocDonneesPrimitive,
  champsEcran as champsEcranPrimitive,
  consigneEcran as consigneEcranPrimitive,
  etatActuel as etatActuelPrimitive,
  formatFractionLatex,
  LIBELLE_PHASE as LIBELLE_PHASE_PRIMITIVE,
  primitiveLatexA,
  primitiveLatexB,
  primitiveLatexC,
  primitiveLatexG,
} from "./formatCalculPrimitives";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage LaTeX pour `6gen25`. **Écrans EMPRUNTÉS**
 * (calcul de la primitive) : délégués TELS QUELS à `ui6e/formatCalculPrimitives.ts` (réutilisation
 * ui↔ui, même principe que la réutilisation Couche A↔A/B↔B déjà établie ailleurs — CLAUDE.md
 * n'interdit QUE moteur6e↔generateurs6e) — jamais un texte dupliqué. **Écrans PROPRES** à
 * 6gen25 (`finalIntegrale`/`valeurMoyenne`/`poserEquationM`/`resoudreM`) : textes nouveaux
 * ci-dessous.
 *
 * **Régression "signe orphelin"** (point 9 du prompt d'origine, bug réellement rencontré sur
 * 6gen23 : un helper de signe utilisé SANS accoler la magnitude ensuite) — ce fichier n'introduit
 * qu'UN SEUL point d'assemblage de signe (`combinerCibleLatex`, dans `generateurs6e/
 * integralesDefinies/parametre.ts` — jamais un helper "signe seul" séparé) ; voir
 * `formatIntegralesDefinies.test.ts` pour le test de régression dédié, dès le premier jet.
 */

function primitiveLatexEmpruntee(primitive: ExerciceCalculPrimitives): string {
  switch (primitive.famille) {
    case "A":
      return primitiveLatexA(primitive);
    case "B":
      return primitiveLatexB(primitive);
    case "C":
      return primitiveLatexC(primitive);
    case "G":
      return primitiveLatexG(primitive);
    default:
      // D/E/F jamais tirés par 6gen25 (voir core6e/integralesDefinies.types.ts, en-tête).
      return "";
  }
}

function formatBorneLatex(x: number): string {
  return formatFractionLatex(Math.round(x * 4), 4);
}

function bornesLatex(exercice: ExerciceIntegralesDefinies): [string, string] {
  if (exercice.scenario === "parametre") {
    return exercice.mEstBorneSuperieure ? [exercice.borneFixeLatex, "m"] : ["m", exercice.borneFixeLatex];
  }
  return [formatBorneLatex(exercice.a), formatBorneLatex(exercice.b)];
}

/** Ligne d'intégrale définie, TOUJOURS affichée (bloc données redondant, spec) — inclut la valeur
 * cible pour le scénario `parametre` (donnée dès le premier écran). */
function ligneIntegraleLatex(exercice: ExerciceIntegralesDefinies): string {
  const [lower, upper] = bornesLatex(exercice);
  const base = `\\displaystyle\\int_{${lower}}^{${upper}} f(x)\\,dx`;
  return exercice.scenario === "parametre" ? `${base} = ${exercice.cible.latex}` : base;
}

function valeurIntegrale(exercice: ExerciceIntegraleSimple | ExerciceIntegraleMoyenne): number {
  return exercice.primitive.primitiveReference(exercice.b) - exercice.primitive.primitiveReference(exercice.a);
}

function estPhaseEmpruntee(exercice: ExerciceIntegralesDefinies, phase: PhaseIntegralesDefinies): phase is PhaseCalculPrimitives {
  return phasesPourExercicePrimitive(exercice.primitive).includes(phase as PhaseCalculPrimitives);
}

// ============================================================================
// Dispatch commun.
// ============================================================================

export function consigneGenerale(exercice: ExerciceIntegralesDefinies): string {
  if (exercice.scenario === "simple") return "Calcule une primitive F de f, puis évalue l'intégrale définie ci-dessous.";
  if (exercice.scenario === "moyenne") return "Calcule une primitive F de f, évalue l'intégrale définie, puis la valeur moyenne de f sur cet intervalle.";
  return "Calcule une primitive F de f, puis détermine la ou les valeurs du paramètre m pour lesquelles l'intégrale définie ci-dessous vaut la valeur indiquée.";
}

export function blocDonnees(exercice: ExerciceIntegralesDefinies): string[] {
  return [...blocDonneesPrimitive(exercice.primitive), ligneIntegraleLatex(exercice)];
}

export function consigneEcran(exercice: ExerciceIntegralesDefinies, phase: PhaseIntegralesDefinies): string {
  if (estPhaseEmpruntee(exercice, phase)) return consigneEcranPrimitive(exercice.primitive, phase);
  if (phase === "finalIntegrale") return "Évalue l'intégrale définie F(b)−F(a), à partir de la primitive trouvée à l'étape précédente.";
  if (phase === "valeurMoyenne") return "Divise l'intégrale définie trouvée par (b−a) pour obtenir la valeur moyenne de f sur cet intervalle.";
  if (phase === "poserEquationM") {
    return "Exprime l'intégrale définie ci-dessus en fonction de m à l'aide de la primitive trouvée, puis pose l'équation égale à la valeur cible indiquée dans les données.";
  }
  // "resoudreM"
  const exerciceP = exercice as ExerciceIntegraleParametre;
  const restriction = exerciceP.domaineMTexte ? ` (${exerciceP.domaineMTexte})` : "";
  return `Résous l'équation posée à l'étape précédente pour m${restriction}.`;
}

/** Toutes les lignes "état actuel" confirmées par la chaîne EMPRUNTÉE (calcul de primitive),
 * jusqu'à son tout dernier écran INCLUS (même principe que `formatQuellePrimitive.ts`,
 * `etatActuelChaineEmpruntee` — sa réponse, la primitive de base, est ajoutée séparément par
 * l'appelant via `primitiveLatexEmpruntee`). Réutilisée pour que chaque écran PROPRE à 6gen25
 * rappelle TOUTES les réponses validées de la chaîne empruntée, pas seulement le résultat de son
 * tout dernier écran — audit transversal chapitre 4, bloc "état actuel" cumulatif. */
function etatActuelChaineEmpruntee(primitive: ExerciceCalculPrimitives): string[] {
  const phases = phasesPourExercicePrimitive(primitive);
  const derniere = phases[phases.length - 1];
  if (!derniere) return [];
  return etatActuelPrimitive(primitive, derniere) ?? [];
}

export function etatActuel(exercice: ExerciceIntegralesDefinies, phase: PhaseIntegralesDefinies): string[] | null {
  if (estPhaseEmpruntee(exercice, phase)) return etatActuelPrimitive(exercice.primitive, phase);
  const cheminEmprunte = etatActuelChaineEmpruntee(exercice.primitive);
  const fPrimitive = `F(x)=${primitiveLatexEmpruntee(exercice.primitive)}`;
  if (phase === "finalIntegrale" || phase === "poserEquationM") {
    return [...cheminEmprunte, fPrimitive];
  }
  if (phase === "valeurMoyenne") {
    const valeur = valeurIntegrale(exercice as ExerciceIntegraleMoyenne);
    return [...cheminEmprunte, fPrimitive, `\\displaystyle\\int f(x)\\,dx \\approx ${Math.round(valeur * 1000) / 1000}`];
  }
  // "resoudreM"
  return [...cheminEmprunte, fPrimitive, `\\text{(équation posée à l'étape précédente)}`];
}

export function champsEcran(exercice: ExerciceIntegralesDefinies, phase: PhaseIntegralesDefinies): ChampDef[] {
  if (estPhaseEmpruntee(exercice, phase)) return champsEcranPrimitive(exercice.primitive, phase);
  if (phase === "finalIntegrale") return [{ label: "F(b)−F(a) =", placeholder: "ex : 12 ou e^2-1" }];
  if (phase === "valeurMoyenne") return [{ label: "Valeur moyenne =", placeholder: "ex : 4" }];
  if (phase === "poserEquationM") return [{ label: "Équation en m =", placeholder: "ex : k*e^m-k*e^2=7" }];
  return [{ label: "m =", placeholder: "ex : ln(5) ou 2" }]; // "resoudreM" (rendu par le composant add-as-needed dédié)
}

export function aideNiveau1(exercice: ExerciceIntegralesDefinies, phase: PhaseIntegralesDefinies): AideAvecLatex {
  if (estPhaseEmpruntee(exercice, phase)) return aideNiveau1Primitive(exercice.primitive, phase);
  if (phase === "finalIntegrale") return { texte: "F(b)−F(a) s'obtient en évaluant la primitive trouvée aux 2 bornes, puis en soustrayant (borne supérieure moins borne inférieure).", latex: null };
  if (phase === "valeurMoyenne") return { texte: "Valeur moyenne de f sur [a;b] :", latex: "\\bar f = \\dfrac{1}{b-a}\\displaystyle\\int_a^b f(x)\\,dx" };
  if (phase === "poserEquationM") return { texte: "Identifie précisément quelle borne est FIXE (donnée) et laquelle est m (inconnue) avant d'écrire la différence F(...)−F(...).", latex: null };
  const technique = (exercice as ExerciceIntegraleParametre).technique;
  const texte =
    technique === "polynomiale"
      ? "Ramène l'équation à la forme Ax²+Bx+C=0 (second degré) et résous-la."
      : technique === "exponentielle"
        ? "Isole le terme en eᵐ, puis applique le logarithme népérien aux 2 membres."
        : "Isole sin(m) ou cos(m), puis applique arcsin ou arccos (selon le cas) pour revenir à m.";
  return { texte, latex: null };
}

export function aideNiveau2(exercice: ExerciceIntegralesDefinies, phase: PhaseIntegralesDefinies): AideAvecLatex {
  if (estPhaseEmpruntee(exercice, phase)) return aideNiveau2Primitive(exercice.primitive, phase);
  if (phase === "valeurMoyenne") {
    const exerciceM = exercice as ExerciceIntegraleMoyenne;
    const valeur = Math.round(valeurIntegrale(exerciceM) * 1000) / 1000;
    const largeur = formatBorneLatex(exerciceM.b - exerciceM.a);
    return { texte: "Intégrale déjà trouvée, à diviser par (b−a) — division non encore faite :", latex: `\\dfrac{${valeur}}{${largeur}}` };
  }
  if (phase === "poserEquationM") {
    const exerciceP = exercice as ExerciceIntegraleParametre;
    return { texte: "Primitive évaluée à la borne fixe (le terme en m reste à écrire, ainsi que la mise en équation avec la valeur cible) :", latex: `F(${exerciceP.borneFixeLatex})` };
  }
  return { texte: "Continue le calcul à partir de l'étape précédente.", latex: null };
}

export const LIBELLE_PHASE: Record<PhaseIntegralesDefinies, string> = {
  ...LIBELLE_PHASE_PRIMITIVE,
  finalIntegrale: "Intégrale définie",
  valeurMoyenne: "Valeur moyenne",
  poserEquationM: "Équation en m",
  resoudreM: "Résolution (m)",
};

/** Réponse CORRECTE affichée au récapitulatif final — jamais recalculée depuis la saisie élève
 * (CLAUDE.md). Pour les écrans empruntés d'un calcul de primitive en cours (pas encore le dernier),
 * affiche juste le libellé de phase (même convention que 6gen23, `formatReponseAttenduePhaseLatex`)
 * ; pour les 4 écrans propres à 6gen25, une valeur/LaTeX exacte connue par construction. Un libellé
 * TEXTE (ici, `poserEquationM` ci-dessous) est toujours enveloppé en `\text{...}` — jamais passé nu
 * à `<Katex>` (corrigé lors de l'audit transversal chapitre 4, même défaut que 6gen23 ci-dessus). */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceIntegralesDefinies, phase: PhaseIntegralesDefinies): string[] {
  if (estPhaseEmpruntee(exercice, phase)) {
    const phasesFinalesEmpruntees: PhaseCalculPrimitives[] = ["aEcranDirect", "aEcran2", "bEcran3", "cEcran4", "gEcran4"];
    if (phasesFinalesEmpruntees.includes(phase)) return [`F(x)=${primitiveLatexEmpruntee(exercice.primitive)}+C`];
    return [`\\text{${LIBELLE_PHASE_PRIMITIVE[phase]}}`];
  }
  if (phase === "finalIntegrale") {
    const valeur = valeurIntegrale(exercice as ExerciceIntegraleSimple | ExerciceIntegraleMoyenne);
    return [`\\displaystyle\\int f(x)\\,dx = ${Math.round(valeur * 1000) / 1000}`];
  }
  if (phase === "valeurMoyenne") {
    const exerciceM = exercice as ExerciceIntegraleMoyenne;
    const moyenne = valeurIntegrale(exerciceM) / (exerciceM.b - exerciceM.a);
    return [`\\bar f = ${Math.round(moyenne * 1000) / 1000}`];
  }
  const exerciceP = exercice as ExerciceIntegraleParametre;
  if (phase === "poserEquationM") return [`\\text{${LIBELLE_PHASE.poserEquationM}}`];
  return [exerciceP.solutionsM.map((m) => `m=${Math.round(m * 1000) / 1000}`).join(" \\text{ ou } ")];
}

/** Total points du récapitulatif final — maximum VARIABLE (100 × nombre d'écrans réellement
 * traversés par CET exercice, écrans empruntés + écrans propres). */
export function calculerTotalPointsIntegralesDefinies(resultat: ResultatExerciceIntegralesDefinies): { total: number; maximum: number } {
  const phases = phasesPourExercice(resultat.exercice);
  const total = phases.reduce((acc, phase) => acc + (resultat.scores[phase] ?? 0), 0);
  return { total, maximum: phases.length * 100 };
}

export const LIBELLE_SCENARIO: Record<ExerciceIntegralesDefinies["scenario"], string> = {
  simple: "Intégrale définie",
  parametre: "Paramètre inconnu",
  moyenne: "Valeur moyenne",
};

export type { ChampDef, AideAvecLatex };
