import type { ExerciceLongueurArc } from "../../core6e/longueurArc.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import type { CriteresDifficulte } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/fragmentsDocx";
import {
  blocDonnees,
  consigneEcran,
  consigneGenerale,
  formatReponseAttenduePhaseLatex,
} from "../../ui6e/formatLongueurArc";
import { CONSIGNE_PRECISION } from "../../ui6e/nombresExactsIntegrales";
import { phasesPourExercice } from "../../moteur6e/typesLongueurArc";
import type { PhaseLongueurArc } from "../../moteur6e/typesLongueurArc";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLongueurArc } from "./index";
import type { IdVarianteLongueurArc } from "./index";
import { donneesPapier, nettoyerConsigne } from "../calculAires/papierCommun";
import { LIBELLE_CAS_LONGUEUR_ARC, profilLongueurArc } from "./profilEvaluation";
import { correctionDetailleeLongueurArc, piegeLongueurArc } from "./corrigeDetaille";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceLongueurArc>` pour `6gen28` (Longueur d'un arc de
 * courbe) — feuille d'exercices et évaluation, méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - `construireEnonce` : une question par ÉCRAN (= une étape) ; consignes d'écran nettoyées des
 *   tournures propres à l'écran → titres « Étape n — … » du corrigé.
 * - `enoncePapier` : consigne globale (formule de L), données, UNE demande (la longueur). Famille B
 *   (pour aller plus loin) : la substitution est imposée, avec la valeur de k² écrite en clair.
 *   f′, simplification de la racine, bornes en t, primitive : étapes du corrigé.
 * - Résultats : `formatReponseAttenduePhaseLatex` (ceux de l'appli) ; figure (l'arc entre a et b) :
 *   `figureLongueurArcSvg`, la même qu'à l'écran, sous la dernière étape du corrigé.
 */

const LETTRES = "abcdefgh";
const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);

function reponse(exercice: ExerciceLongueurArc, phase: PhaseLongueurArc): FragmentConsigne[] {
  const prefixe = phase === "bEcran2" ? "\\text{fonction à intégrer : }" : phase === "bEcran3" || phase === "cEcran2" ? "\\text{primitive : }" : "";
  return [latex(prefixe + formatReponseAttenduePhaseLatex(exercice, phase).join(",\\quad "))];
}

function derniere(exercice: ExerciceLongueurArc): PhaseLongueurArc {
  const phases = phasesPourExercice(exercice);
  return phases[phases.length - 1];
}

// ============================================================================
// Énoncé interactif (étapes) et corrigé historique.
// ============================================================================

function entete(exercice: ExerciceLongueurArc): FragmentConsigne[] {
  return [...consigneGenerale(exercice), ...donneesPapier(blocDonnees(exercice))];
}

function construireEnonce(exercice: ExerciceLongueurArc): SectionExercice {
  return { enteteFragments: entete(exercice), questions: phasesPourExercice(exercice).map((phase) => ({ consigne: nettoyerConsigne(consigneEcran(exercice, phase)) })) };
}

function construireCorrection(exercice: ExerciceLongueurArc): BlocCorrection[] {
  return phasesPourExercice(exercice).map((phase, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponse(exercice, phase)] }));
}

// ============================================================================
// Énoncé papier : une seule demande.
// ============================================================================

function enoncePapier(exercice: ExerciceLongueurArc): EnoncePapier {
  const substitution: FragmentConsigne[] =
    exercice.famille === "B" ? [t(" Utilise la substitution "), f(`t=\\sqrt{x^2+${exercice.k * exercice.k}}`), t(".")] : [];
  return {
    section: { enteteFragments: [...entete(exercice), ...substitution, t(` Calcule la longueur de cet arc. ${CONSIGNE_PRECISION}`)], questions: [] },
    reponseBreve: reponse(exercice, derniere(exercice)),
  };
}

// ============================================================================
// Corrigé détaillé.
// ============================================================================

/** Critères du niveau de difficulté (grille commune, `export/niveauDifficulte.ts`) : méthode et
 * piège jugés par variante (analyse des cinq chapitres), étapes lues sur le corrigé détaillé. */
function criteresDifficulte(e: ExerciceLongueurArc): CriteresDifficulte {
  const b = e.famille === "B" ? 1 : 0;
  return { ...etapesDuCorrige(correctionDetailleeLongueurArc(e)), methode: b, piege: b };
}

function reponseBreve(exercice: ExerciceLongueurArc): FragmentConsigne[] {
  return reponse(exercice, derniere(exercice));
}

function poids(exercice: ExerciceLongueurArc): number[] {
  switch (exercice.famille) {
    case "A":
      return [1, 1.5, 1.5];
    case "B":
      return [1, 1, 1, 1];
    case "C":
      return [1.5, 1, 1.5];
  }
}

function bareme(exercice: ExerciceLongueurArc): BaremeExercice {
  const phases = phasesPourExercice(exercice);
  const w = poids(exercice);
  const erreurs: { description: FragmentConsigne[]; cout: string }[] = [];
  for (const phase of phases) {
    const piege = piegeLongueurArc(exercice, phase);
    if (piege) erreurs.push({ description: [t(piege)], cout: "−1" });
  }
  erreurs.push({ description: [t("Oublier le « 1 + » ou la racine dans la formule de la longueur")], cout: "−2" });
  return {
    reponseFinale: reponse(exercice, derniere(exercice)),
    criteres: phases.map((phase, i) => ({ sousQuestion: LETTRES[i], critere: reponse(exercice, phase), points: w[i] })),
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[t("Valeur exacte (fraction, ou fraction plus un logarithme) ou arrondie au centième")]],
  };
}

export const adaptateurEvaluationLongueurArc: AdaptateurFeuilleExercices<ExerciceLongueurArc> = {
  titreDocument: "Longueur d'un arc de courbe — Évaluation",
  nomFichierBase: "longueur-arc",
  genererInstance: genererExerciceLongueurArc,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteLongueurArc),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeLongueurArc,
  bareme,
  enoncePapier,
  profilInstance: profilLongueurArc,
  libelleCasParticulier: LIBELLE_CAS_LONGUEUR_ARC,
};
