import type { ExerciceLogarithmesProblemes } from "../../core6e/logarithmesProblemes.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EtapeAmenagee,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { PhaseLogarithmesProblemes } from "../../moteur6e/typesLogarithmesProblemes";
import { aideNiveau1, aideNiveau2, blocDonnees, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex, LIBELLE_PHASE, phasesPourExercice } from "../../ui6e/formatLogarithmesProblemes";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLogarithmesProblemes } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceLogarithmesProblemes>` pour `6gen22`
 * (Logarithmes : problèmes) — feuille d'évaluation.
 *
 * 5 familles (A, B, C, E, F), chacune 3 à 4 écrans guidés côté interactif — condensés ici en autant de
 * questions écrites (une question par écran RÉELLEMENT traversé par l'instance tirée, voir
 * `phasesPourExercice` : nombre d'écrans fixe par famille SAUF la famille E, variable PAR INSTANCE
 * selon `deduireAB`, jamais une simple table par famille comme `PHASES_PAR_FAMILLE` de 6gen12).
 * Le corrigé de chaque question lit la réponse déjà établie via `formatReponseAttenduePhaseLatex` —
 * la MÊME fonction qui alimente déjà `ResultatPanelLogarithmesProblemes.tsx`, jamais recalculée
 * indépendamment.
 *
 * Catalogue branché : `CATALOGUE_VARIANTES`/`construireAvecVarianteId` (axe FIN — 16
 * familles/sous-types/contextes, D et G retirés), pas `CATALOGUE_FAMILLES`/`construireAvecFamilleId` (axe
 * grossier, 7 familles équiprobables, jamais utilisé pour un contrôle dev/prof) : c'est l'axe
 * effectivement branché sur le sélecteur dev de `App6gen22.tsx` (`SelecteurVarianteDev
 * options={CATALOGUE_VARIANTES}`), donc celui qu'un professeur reconnaît et attend ici.
 */

function construireEnonceLogarithmesProblemes(exercice: ExerciceLogarithmesProblemes): SectionExercice {
  const phases = phasesPourExercice(exercice);
  const donnees = blocDonnees(exercice);
  return {
    enteteFragments: [...consigneGenerale(exercice), ...(donnees.length > 0 ? [latex(donnees.join(",\\quad "))] : [])],
    questions: phases.map((phase) => ({
      consigne: [texte(`${LIBELLE_PHASE[phase]} — `), ...consigneEcran(exercice, phase)],
      reponse: { type: "lignes" as const, nombre: 3 },
    })),
  };
}

/** Corrigé avec démarche : pour chaque étape, l'équation posée ou substituée (celle de l'aide de
 * niveau 2, quand elle en a une), puis le résultat. */
function construireCorrectionLogarithmesProblemes(exercice: ExerciceLogarithmesProblemes): BlocCorrection[] {
  const phases = phasesPourExercice(exercice);
  return phases.flatMap((phase): BlocCorrection[] => {
    const demarche = aideNiveau2(exercice, phase);
    const blocs: BlocCorrection[] = [];
    if (demarche.latex !== null) blocs.push({ type: "paragraphe", fragments: [texte(`${LIBELLE_PHASE[phase]} — démarche : `), latex(demarche.latex)] });
    blocs.push({ type: "paragraphe", fragments: [texte(`${LIBELLE_PHASE[phase]} — résultat : `), latex(formatReponseAttenduePhaseLatex(exercice, phase).join(",\\quad "))] });
    return blocs;
  });
}

// ============================================================================
// Feuille d'exercices / évaluation enrichies — difficulté, réponse brève, corrigé détaillé, barème,
// version aménagée. Résultats : `formatReponseAttenduePhaseLatex` (ceux de l'appli) ; méthodes :
// aides de niveau 1 ; calculs intermédiaires : LaTeX des aides de niveau 2 (jamais leur texte, qui
// s'adresse à l'élève en cours de résolution).
// ============================================================================

const LETTRES = "abcd";

/** Nombre décimal en LaTeX, virgule décimale, arrondi à `decimales` chiffres. */
function decimalLatex(v: number, decimales: number): string {
  const f = Math.pow(10, decimales);
  return String(Math.round(v * f) / f).replace(".", "{,}");
}

/** Écran « principal » (2 points sur 4) des familles à 3 écrans : la résolution proprement dite. */
const ECRAN_PRINCIPAL: Partial<Record<PhaseLogarithmesProblemes, true>> = { aEcran3: true, cEcran2: true, eEcran3: true, fEcran2: true };

/** Poids de chaque écran traversé — total 4 (1 par écran à 4 écrans, 2 + 1 + 1 à 3 écrans, 2 + 2 à 2). */
function poidsPhases(exercice: ExerciceLogarithmesProblemes): number[] {
  const phases = phasesPourExercice(exercice);
  if (phases.length >= 4) return phases.map(() => 1);
  if (phases.length === 2) return [2, 2];
  return phases.map((ph) => (ECRAN_PRINCIPAL[ph] ? 2 : 1));
}

function fragmentsReponse(exercice: ExerciceLogarithmesProblemes, phase: PhaseLogarithmesProblemes): FragmentConsigne[] {
  return [latex(formatReponseAttenduePhaseLatex(exercice, phase).join(",\\quad "))];
}

function fragmentsAide1(exercice: ExerciceLogarithmesProblemes, phase: PhaseLogarithmesProblemes): FragmentConsigne[] {
  const aide = aideNiveau1(exercice, phase);
  return aide.latex === null ? [texte(aide.texte)] : [texte(`${aide.texte} `), latex(aide.latex)];
}

/** Passage au logarithme de la famille A (résoudre pour t) : t ≥ ln(q)/ln(r), en renversant
 * l'inégalité quand ln(r) < 0. */
function passageLogA(exercice: ExerciceLogarithmesProblemes): string | null {
  if (exercice.famille !== "A" || exercice.sousType !== "resoudreT") return null;
  const geq = (exercice.sens === ">=") === exercice.r > 1;
  const rel = geq ? "\\geq" : "\\leq";
  const r = decimalLatex(exercice.r, 4);
  const ligne = (cible: number, exact: number, indice: string) =>
    `t${indice} ${rel} \\dfrac{\\ln\\left(${decimalLatex(cible / exercice.Q0, 4)}\\right)}{\\ln\\left(${r}\\right)} \\approx ${decimalLatex(exact, 2)}`;
  if (exercice.variante === "simple") return ligne(exercice.cible1Affiche, exercice.t1Exact, "");
  return `${ligne(exercice.cible1Affiche, exercice.t1Exact, "_1")} \\qquad ${ligne(exercice.cible2Affiche, exercice.t2Exact, "_2")}`;
}

interface PiegeLog {
  phase: PhaseLogarithmesProblemes;
  texte: string;
  cout: string;
}

function pieges(exercice: ExerciceLogarithmesProblemes): PiegeLog[] {
  switch (exercice.famille) {
    case "A":
      if (exercice.sousType === "resoudreT") {
        const liste: PiegeLog[] = [{ phase: "aEcran3", texte: "Arrondir t à l'entier SUPÉRIEUR : une période entamée ne suffit pas à atteindre le seuil.", cout: "−0,5" }];
        if (exercice.r < 1) liste.unshift({ phase: "aEcran3", texte: "ln(r) < 0 car r < 1 : diviser par ln(r) renverse le sens de l'inégalité.", cout: "−1" });
        return liste;
      }
      if (exercice.sousType === "resoudreTaux") return [{ phase: "aEcran3", texte: "L'inconnue i est dans la base (1 + i) : on prend une racine n-ième, pas un logarithme.", cout: "−1" }];
      return [{ phase: "aEcran3", texte: "ln(fraction) < 0 : en divisant par −h, on obtient k > 0 (attention au signe).", cout: "−1" }];
    case "B":
      return [{ phase: "bEcran1", texte: "L'exposant est 1/Δt avec Δt = t₂ − t₁, pas 1/t₂.", cout: "−1" }];
    case "C":
      return [{ phase: "cEcran3", texte: "Le facteur correctif est T₂/T₁ (nouvelle valeur sur ancienne), pas T₁/T₂.", cout: "−1" }];
    case "E": {
      const liste: PiegeLog[] = [{ phase: "eEcran3", texte: "Un facteur multiplicatif sur X est un écart ADDITIF sur L : ΔL = a·log₁₀(k).", cout: "−1" }];
      if (exercice.avecEcran4) liste.push({ phase: "eEcran4", texte: "Les niveaux L ne s'additionnent pas : ce sont les intensités X qu'on additionne.", cout: "−1" });
      return liste;
    }
    case "F":
      return [{ phase: "fEcran2", texte: "La croissance est maximale pour y(t) = k/2 (moitié de la capacité), pas pour y(t) = k.", cout: "−1" }];
  }
}

function difficulteLogarithmesProblemes(exercice: ExerciceLogarithmesProblemes): 1 | 2 | 3 {
  switch (exercice.famille) {
    case "A":
      return exercice.sousType === "resoudreT" && exercice.variante === "simple" ? 1 : 2;
    case "B":
      return 3;
    case "C":
    case "F":
      return 2;
    case "E":
      return exercice.deduireAB || exercice.avecEcran4 ? 3 : 2;
  }
}

function reponseBreveLogarithmesProblemes(exercice: ExerciceLogarithmesProblemes): FragmentConsigne[] {
  return phasesPourExercice(exercice).flatMap((phase, i) => [texte(`${i === 0 ? "" : " ; "}${LETTRES[i]}) `), ...fragmentsReponse(exercice, phase)]);
}

function correctionDetailleeLogarithmesProblemes(exercice: ExerciceLogarithmesProblemes): EtapeCorrection[] {
  const listePieges = pieges(exercice);
  return phasesPourExercice(exercice).flatMap((phase, i) => {
    const sousQuestion = LETTRES[i];
    const etapes: EtapeCorrection[] = [{ label: "Méthode", sousQuestion, fragments: fragmentsAide1(exercice, phase) }];
    const calcul = aideNiveau2(exercice, phase).latex;
    if (calcul !== null) etapes.push({ label: "Calcul", sousQuestion, fragments: [latex(calcul)] });
    const passage = phase === "aEcran3" ? passageLogA(exercice) : null;
    if (passage !== null) etapes.push({ label: "Calcul", sousQuestion, fragments: [latex(passage)] });
    for (const piege of listePieges) if (piege.phase === phase) etapes.push({ label: "Piège", sousQuestion, fragments: [texte(piege.texte)] });
    etapes.push({ label: "Conclusion", sousQuestion, fragments: fragmentsReponse(exercice, phase) });
    return etapes;
  });
}

function baremeLogarithmesProblemes(exercice: ExerciceLogarithmesProblemes): BaremeExercice {
  const phases = phasesPourExercice(exercice);
  const poids = poidsPhases(exercice);
  const acceptees: FragmentConsigne[][] = [[texte("Valeur arrondie à la précision demandée ; un écart dû à l'arrondi d'une étape intermédiaire est toléré")]];
  if (exercice.famille === "A" && exercice.sousType === "resoudreTaux") acceptees.push([texte("i en décimal ou en pourcentage")]);
  return {
    reponseFinale: fragmentsReponse(exercice, phases[phases.length - 1]),
    criteres: phases.map((phase, i) => ({ sousQuestion: LETTRES[i], critere: [texte(`${LIBELLE_PHASE[phase]} : `), ...fragmentsReponse(exercice, phase)], points: poids[i] })),
    erreursFrequentes: [
      ...pieges(exercice).map((p) => ({ description: [texte(p.texte)], cout: p.cout })),
      { description: [texte("Arrondir trop tôt une valeur intermédiaire (garder la valeur complète jusqu'au résultat)")], cout: "−0,5" },
    ],
    reponsesAcceptees: acceptees,
  };
}

function enonceAmenageLogarithmesProblemes(exercice: ExerciceLogarithmesProblemes): EtapeAmenagee[] {
  const poids = poidsPhases(exercice);
  return phasesPourExercice(exercice).map((phase, i) => ({ consigne: consigneEcran(exercice, phase), rappel: fragmentsAide1(exercice, phase), points: poids[i] }));
}

export const adaptateurEvaluationLogarithmesProblemes: AdaptateurFeuilleExercices<ExerciceLogarithmesProblemes> = {
  titreDocument: "Logarithmes : problèmes — Évaluation",
  nomFichierBase: "logarithmes-problemes",
  genererInstance: genererExerciceLogarithmesProblemes,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  construireEnonce: construireEnonceLogarithmesProblemes,
  construireCorrection: construireCorrectionLogarithmesProblemes,
  difficulte: difficulteLogarithmesProblemes,
  reponseBreve: reponseBreveLogarithmesProblemes,
  correctionDetaillee: correctionDetailleeLogarithmesProblemes,
  bareme: baremeLogarithmesProblemes,
  enonceAmenage: enonceAmenageLogarithmesProblemes,
  dureeMinutes: 12,
};
