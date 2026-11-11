import type { ExerciceCalculPrimitives } from "../core6e/calculPrimitives.types";
import type { ExerciceIntegraleMoyenne, ExerciceIntegraleParametre, ExerciceIntegraleSimple, ExerciceIntegralesDefinies } from "../core6e/integralesDefinies.types";
import type { PhaseIntegralesDefinies } from "../moteur6e/typesIntegralesDefinies";
import type { PhaseCalculPrimitives } from "../moteur6e/typesCalculPrimitives";
import { phasesPourExercice as phasesPourExercicePrimitive } from "../moteur6e/typesCalculPrimitives";
import type { AideAvecLatex, ChampDef, FragmentConsigne } from "./formatCalculPrimitives";
import { coefDevant, decimalLatex, egalExactPuisApproche, valeurExacteLatex } from "./formatMonome";
import {
  aideNiveau1 as aideNiveau1Primitive,
  aideNiveau2 as aideNiveau2Primitive,
  blocDonnees as blocDonneesPrimitive,
  champsEcran as champsEcranPrimitive,
  consigneEcran as consigneEcranPrimitive,
  etatActuel as etatActuelPrimitive,
  formatReponseAttenduePhaseLatex as formatReponseAttenduePhaseLatexPrimitive,
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
  return valeurExacteLatex(x) ?? decimalLatex(x, 2);
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

/** Texte brut mêlé à du LaTeX inline court — mêmes fragments que `formatCalculPrimitives.ts`
 * (importés en tant que type seulement ; `texte`/`latex` restent dupliqués ici à dessein,
 * convention CLAUDE.md). */
function texte(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}
function latex(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
}

// ============================================================================
// Dispatch commun.
// ============================================================================

/** Audit P17 : la précision attendue n'était annoncée nulle part. */
const PRECISION: FragmentConsigne[] = [texte(" Donne chaque résultat sous forme exacte ou arrondi au centième.")];
const RAPPEL_CONSTANTE: FragmentConsigne[] = [texte(" La constante "), latex("+C"), texte(" est facultative dans la primitive.")];

export function consigneGenerale(exercice: ExerciceIntegralesDefinies): FragmentConsigne[] {
  if (exercice.scenario === "simple") return [texte("Calcule une primitive F de f, puis évalue l'intégrale définie ci-dessous."), ...RAPPEL_CONSTANTE, ...PRECISION];
  if (exercice.scenario === "moyenne") return [texte("Calcule une primitive F de f, évalue l'intégrale définie, puis la valeur moyenne de f sur cet intervalle."), ...RAPPEL_CONSTANTE, ...PRECISION];
  return [texte("Calcule une primitive F de f, puis détermine la ou les valeurs du paramètre m pour lesquelles l'intégrale définie ci-dessous vaut la valeur indiquée."), ...RAPPEL_CONSTANTE, ...PRECISION];
}

export function blocDonnees(exercice: ExerciceIntegralesDefinies): string[] {
  return [...blocDonneesPrimitive(exercice.primitive), ligneIntegraleLatex(exercice)];
}

export function consigneEcran(exercice: ExerciceIntegralesDefinies, phase: PhaseIntegralesDefinies): FragmentConsigne[] {
  if (estPhaseEmpruntee(exercice, phase)) return consigneEcranPrimitive(exercice.primitive, phase);
  if (phase === "finalIntegrale") {
    const [a, b] = bornesLatex(exercice);
    return [texte("Évalue l'intégrale définie en calculant "), latex(`F(${b})-F(${a})`), texte(" avec la primitive trouvée à l'étape précédente.")];
  }
  if (phase === "valeurMoyenne") {
    const [a, b] = bornesLatex(exercice);
    return [texte("Divise l'intégrale trouvée par la longueur de l'intervalle "), latex(`\\left[${a}\\,;${b}\\right]`), texte(" pour obtenir la valeur moyenne de f sur cet intervalle.")];
  }
  if (phase === "poserEquationM") {
    return [texte("Exprime l'intégrale définie ci-dessus en fonction de m à l'aide de la primitive trouvée, puis pose l'équation égale à la valeur cible indiquée dans les données.")];
  }
  // "resoudreM"
  const exerciceP = exercice as ExerciceIntegraleParametre;
  const restriction = exerciceP.domaineMTexte ? ` (${exerciceP.domaineMTexte})` : "";
  return [texte(`Résous l'équation posée à l'étape précédente pour m${restriction}.`)];
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
    const [a, b] = bornesLatex(exercice);
    return [...cheminEmprunte, fPrimitive, `\\displaystyle\\int_{${a}}^{${b}} f(x)\\,dx ${egalExactPuisApproche(valeur, 2)}`];
  }
  // "resoudreM"
  const exerciceP = exercice as ExerciceIntegraleParametre;
  const [gauche, droite] = exerciceP.mEstBorneSuperieure ? ["F(m)", `F(${exerciceP.borneFixeLatex})`] : [`F(${exerciceP.borneFixeLatex})`, "F(m)"];
  return [...cheminEmprunte, fPrimitive, `${gauche}-${droite}=${exerciceP.cible.latex}`];
}

export function champsEcran(exercice: ExerciceIntegralesDefinies, phase: PhaseIntegralesDefinies): ChampDef[] {
  if (estPhaseEmpruntee(exercice, phase)) return champsEcranPrimitive(exercice.primitive, phase);
  if (phase === "finalIntegrale") return [{ label: "Valeur de l'intégrale =", placeholder: "ex : 7−ln(9) ou 0,57" }];
  if (phase === "valeurMoyenne") return [{ label: "Valeur moyenne =", placeholder: "ex : 7/9" }];
  if (phase === "poserEquationM") return [{ label: "Équation en m =", placeholder: "ex : 7(m^2−9)=8" }];
  return [{ label: "m =", placeholder: "ex : ln(9)" }]; // "resoudreM" (rendu par le composant add-as-needed dédié)
}

export function aideNiveau1(exercice: ExerciceIntegralesDefinies, phase: PhaseIntegralesDefinies): AideAvecLatex {
  if (estPhaseEmpruntee(exercice, phase)) return aideNiveau1Primitive(exercice.primitive, phase);
  if (phase === "finalIntegrale") return { texte: "Évalue la primitive à la borne supérieure, puis à la borne inférieure, et soustrais :", latex: "\\displaystyle\\int_a^b f(x)\\,dx=F(b)-F(a)" };
  if (phase === "valeurMoyenne") return { texte: "Valeur moyenne de f sur [a ; b] :", latex: "\\dfrac{1}{b-a}\\displaystyle\\int_a^b f(x)\\,dx" };
  if (phase === "poserEquationM") return { texte: "Repère quelle borne est donnée et laquelle est m, puis écris la différence dans le bon ordre (borne supérieure moins borne inférieure) :", latex: "\\displaystyle\\int_a^b f(x)\\,dx=F(b)-F(a)" };
  const technique = (exercice as ExerciceIntegraleParametre).technique;
  const texte =
    technique === "polynomiale"
      ? "Ramène l'équation à une équation du second degré, puis résous-la :"
      : technique === "exponentielle"
        ? "Isole le terme exponentiel, puis applique le logarithme népérien aux deux membres :"
        : "Isole le sinus ou le cosinus de m, puis reviens à m dans l'intervalle indiqué :";
  const latex = technique === "polynomiale" ? "am^{2}+bm+c=0" : technique === "exponentielle" ? "e^{m}=A\\iff m=\\ln(A)\\quad(A>0)" : "\\sin(m)=v\\iff m=\\arcsin(v),\\qquad\\cos(m)=v\\iff m=\\arccos(v)";
  return { texte, latex };
}

export function aideNiveau2(exercice: ExerciceIntegralesDefinies, phase: PhaseIntegralesDefinies): AideAvecLatex {
  if (estPhaseEmpruntee(exercice, phase)) return aideNiveau2Primitive(exercice.primitive, phase);
  if (phase === "finalIntegrale") {
    const exerciceS = exercice as ExerciceIntegraleSimple | ExerciceIntegraleMoyenne;
    const [a, b] = bornesLatex(exercice);
    const fb = exerciceS.primitive.primitiveReference(exerciceS.b);
    const fa = exerciceS.primitive.primitiveReference(exerciceS.a);
    const val = (v: number) => valeurExacteLatex(v) ?? decimalLatex(v, 2);
    return { texte: "Valeurs de la primitive (sans C) aux deux bornes — il reste à soustraire :", latex: `F(${b})=${val(fb)},\\qquad F(${a})=${val(fa)}` };
  }
  if (phase === "valeurMoyenne") {
    const exerciceM = exercice as ExerciceIntegraleMoyenne;
    const [a, b] = bornesLatex(exercice);
    const valeur = valeurIntegrale(exerciceM);
    const valeurLatex = valeurExacteLatex(valeur) ?? decimalLatex(valeur, 2);
    const largeur = formatBorneLatex(exerciceM.b - exerciceM.a);
    return { texte: "Intégrale déjà trouvée et longueur de l'intervalle — division non encore faite :", latex: `\\displaystyle\\int_{${a}}^{${b}} f(x)\\,dx=${valeurLatex},\\qquad b-a=${largeur}` };
  }
  if (phase === "poserEquationM") {
    const exerciceP = exercice as ExerciceIntegraleParametre;
    const [gauche, droite] = exerciceP.mEstBorneSuperieure ? ["F(m)", `F(${exerciceP.borneFixeLatex})`] : [`F(${exerciceP.borneFixeLatex})`, "F(m)"];
    return { texte: "Différence à écrire avec la primitive trouvée, puis à égaler à la valeur donnée :", latex: `${gauche}-${droite}=${exerciceP.cible.latex}` };
  }
  const exerciceP = exercice as ExerciceIntegraleParametre;
  if (exerciceP.technique === "polynomiale") return { texte: "Les solutions d'une équation du second degré :", latex: "m=\\dfrac{-b\\pm\\sqrt{b^2-4ac}}{2a}" };
  if (exerciceP.technique === "exponentielle") {
    const k = coefDevant(exerciceP.primitive.famille === "B" ? exerciceP.primitive.k : 1);
    const e0 = `e^{${exerciceP.borneFixeLatex}}`;
    const difference = exerciceP.mEstBorneSuperieure ? `e^{m}-${e0}` : `${e0}-e^{m}`;
    return { texte: "Équation posée, à résoudre en isolant l'exponentielle :", latex: `${k}\\left(${difference}\\right)=${exerciceP.cible.latex}` };
  }
  return { texte: "Valeurs remarquables utiles :", latex: "\\sin\\dfrac{\\pi}{6}=\\cos\\dfrac{\\pi}{3}=\\dfrac{1}{2},\\quad\\sin\\dfrac{\\pi}{4}=\\cos\\dfrac{\\pi}{4}=\\dfrac{\\sqrt{2}}{2},\\quad\\sin\\dfrac{\\pi}{3}=\\cos\\dfrac{\\pi}{6}=\\dfrac{\\sqrt{3}}{2}" };
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
  // Écrans empruntés : la VRAIE réponse de l'étape (6gen23), plus seulement son libellé.
  if (estPhaseEmpruntee(exercice, phase)) return formatReponseAttenduePhaseLatexPrimitive(exercice.primitive, phase);
  if (phase === "finalIntegrale") {
    const exerciceS = exercice as ExerciceIntegraleSimple | ExerciceIntegraleMoyenne;
    const [a, b] = bornesLatex(exercice);
    return [`\\displaystyle\\int_{${a}}^{${b}} f(x)\\,dx ${egalExactPuisApproche(valeurIntegrale(exerciceS), 2)}`];
  }
  if (phase === "valeurMoyenne") {
    const exerciceM = exercice as ExerciceIntegraleMoyenne;
    const [a, b] = bornesLatex(exercice);
    const moyenne = valeurIntegrale(exerciceM) / (exerciceM.b - exerciceM.a);
    // Notation du cours (pas \bar f, absente du cours) : la formule elle-même, bornes numériques.
    const inverse = valeurExacteLatex(1 / (exerciceM.b - exerciceM.a)) ?? `\\dfrac{1}{b-a}`;
    return [`${inverse === "1" ? "" : inverse}\\displaystyle\\int_{${a}}^{${b}} f(x)\\,dx ${egalExactPuisApproche(moyenne, 2)}`];
  }
  const exerciceP = exercice as ExerciceIntegraleParametre;
  if (phase === "poserEquationM") {
    const [gauche, droite] = exerciceP.mEstBorneSuperieure ? ["F(m)", `F(${exerciceP.borneFixeLatex})`] : [`F(${exerciceP.borneFixeLatex})`, "F(m)"];
    return [`${gauche}-${droite}=${exerciceP.cible.latex}`, `F(x)=${primitiveLatexEmpruntee(exerciceP.primitive)}`];
  }
  return [
    exerciceP.solutionsM
      .map((m, i) => {
        const exacte = exerciceP.solutionsMLatex?.[i];
        if (!exacte) return `m ${egalExactPuisApproche(m, 2)}`;
        const approche = decimalLatex(m, 2);
        return exacte === approche || /^-?\d+$/.test(exacte) ? `m=${exacte}` : `m=${exacte}\\approx ${approche}`;
      })
      .join("\\quad\\text{ou}\\quad "),
  ];
}

export const LIBELLE_SCENARIO: Record<ExerciceIntegralesDefinies["scenario"], string> = {
  simple: "Intégrale définie",
  parametre: "Paramètre inconnu",
  moyenne: "Valeur moyenne",
};

export type { ChampDef, AideAvecLatex, FragmentConsigne };
