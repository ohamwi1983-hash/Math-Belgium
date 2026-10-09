import type { ExerciceEquationsCyclometriques } from "../../core6e/equationsCyclometriques.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../../export/genererFeuilleExercices";
import { formatEnsembleReelLatex } from "../../ui6e/formatEnsembleReel";
import { formatCandidatLatex, formatEquationNonCycloLatex, formatEquationOriginaleLatex, MAX_DEN } from "../../ui6e/formatEquationsCyclometriques";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEquationsCyclometriques } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceEquationsCyclometriques>` pour `6gen3` (Équations
 * avec fonctions cyclométriques) — feuille d'évaluation, voir
 * `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence.
 *
 * Même traitement "résolution rédigée hyper détaillée" que `generateurs/inequations/exportEvaluation.ts`
 * (chapitre 2 de 4e) : les 4 (ou 5, variante 4 avec l'écran intercalaire "condition") écrans guidés
 * côté interactif ne deviennent PAS 4 questions lettrées, mais une seule consigne ouverte suivie
 * d'une résolution rédigée en paragraphes continus (CE → équation non cyclométrique → candidats →
 * accepter/rejeter), en réutilisant directement le formatage LaTeX déjà écrit côté écran
 * (`ui6e/formatEquationsCyclometriques.ts`) — jamais recalculé indépendamment.
 *
 * `MAX_DEN` (300, voir sa doc dans `ui6e/formatEquationsCyclometriques.ts`) est passé explicitement
 * à chaque `formatEnsembleReelLatex(exercice.ce)`/`(exercice.conditionParasite)` — comme le font
 * déjà tous les composants écran (`ResultatPanelEquationsCyclometriques.tsx`,
 * `EtapeConditionEquationsCyclometriques.tsx`, `EtapeAccepterRejeterEquationsCyclometriques.tsx`).
 * Sans ce paramètre, le défaut de `formatEnsembleReelLatex` (12) est insuffisant pour la variante 4
 * (dénominateurs jusqu'à 260) et retombe sur son filet de sécurité flottant brut — bug trouvé par
 * vérification Playwright manuelle sur cette résolution rédigée (CE affichée en décimal, ex.
 * `[-0.089...]`), déjà présent avant cette consolidation en paragraphes (la version précédente,
 * question par question, appelait aussi `formatEnsembleReelLatex` sans ce paramètre).
 */

function nombreLignesReponse(nombreParagraphes: number): number {
  return Math.max(10, nombreParagraphes * 2 + 2);
}

function construireEnonceEquationsCyclometriques(exercice: ExerciceEquationsCyclometriques): SectionExercice {
  const nombreParagraphes = construireParagraphesResolution(exercice).length;
  return {
    enteteFragments: [texte("Résous l'équation suivante : "), latex(formatEquationOriginaleLatex(exercice))],
    questions: [
      { consigne: [texte("Développe ici ta résolution complète, étape par étape.")], reponse: { type: "lignes", nombre: nombreLignesReponse(nombreParagraphes) } },
    ],
  };
}

/**
 * Résolution rédigée et justifiée, un seul exercice ouvert sur la copie — jamais de sous-questions
 * a)/b)/c)/d) comme avant : chaque paragraphe reprend le même enchaînement logique (condition
 * d'existence → élimination des arcfonctions → résolution → acceptation/rejet des candidats),
 * justifié comme un manuel scolaire le ferait. Toutes les valeurs utilisées (`ce`,
 * `conditionParasite`, `candidats`) sont déjà connues et testées sur l'instance — jamais
 * recalculées indépendamment.
 */
function construireParagraphesResolution(exercice: ExerciceEquationsCyclometriques): FragmentConsigne[][] {
  const paragraphes: FragmentConsigne[][] = [];

  if (exercice.variante === "arcfonctionsDifferentes") {
    paragraphes.push([
      texte("On commence par poser la condition d'existence (CE), ainsi que la condition supplémentaire de compatibilité des codomaines des deux arcfonctions : "),
      latex(`\\text{CE} = ${formatEnsembleReelLatex(exercice.ce, MAX_DEN)}`),
      texte(", condition de compatibilité = "),
      latex(formatEnsembleReelLatex(exercice.conditionParasite, MAX_DEN)),
      texte("."),
    ]);
  } else {
    paragraphes.push([texte("On commence par poser la condition d'existence (CE) : "), latex(`\\text{CE} = ${formatEnsembleReelLatex(exercice.ce, MAX_DEN)}`), texte(".")]);
  }

  paragraphes.push([
    texte("On transforme ensuite l'équation en éliminant les arcfonctions, ce qui donne l'équation non cyclométrique équivalente "),
    latex(formatEquationNonCycloLatex(exercice)),
    texte("."),
  ]);

  if (exercice.candidats.length === 0) {
    paragraphes.push([texte("Cette équation n'admet aucune solution réelle : l'ensemble final des solutions est donc vide, S = ∅.")]);
    return paragraphes;
  }

  const candidatsFragments = exercice.candidats.flatMap((c, i) => (i === 0 ? [latex(formatCandidatLatex(c.x))] : [texte(", "), latex(formatCandidatLatex(c.x))]));
  paragraphes.push([texte("En résolvant cette équation, on obtient le(s) candidat(s) solution(s) suivant(s) : "), ...candidatsFragments, texte(".")]);

  const accepterRejeterFragments = exercice.candidats.flatMap((c, i) => [
    ...(i === 0 ? [] : [texte(" ; ")]),
    latex(formatCandidatLatex(c.x)),
    texte(c.accepteAttendu ? " : accepté" : " : rejeté"),
  ]);
  const solutionsFinales = exercice.candidats.filter((c) => c.accepteAttendu);
  const raisonVerification =
    exercice.variante === "arcfonctionsDifferentes"
      ? "en vérifiant que chacun respecte la CE et la condition de compatibilité, et qu'il ne provient pas d'une solution parasite introduite par la mise au carré"
      : "en vérifiant que chacun respecte la CE";
  paragraphes.push([
    texte(`On accepte ou rejette chaque candidat ${raisonVerification} : `),
    ...accepterRejeterFragments,
    texte(". L'ensemble final des solutions est donc "),
    ...(solutionsFinales.length === 0
      ? [texte("vide : S = ∅.")]
      : [latex(`S = \\left\\{${solutionsFinales.map((c) => formatCandidatLatex(c.x).replace("x = ", "")).join("\\,;\\,")}\\right\\}`), texte(".")]),
  ]);

  return paragraphes;
}

function construireCorrectionEquationsCyclometriques(exercice: ExerciceEquationsCyclometriques): BlocCorrection[] {
  return construireParagraphesResolution(exercice).map((fragments) => ({ type: "paragraphe", fragments }));
}

export const adaptateurEvaluationEquationsCyclometriques: AdaptateurFeuilleExercices<ExerciceEquationsCyclometriques> = {
  titreDocument: "Équations avec fonctions cyclométriques — Évaluation",
  nomFichierBase: "equations-cyclometriques",
  genererInstance: genererExerciceEquationsCyclometriques,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceEquationsCyclometriques,
  construireCorrection: construireCorrectionEquationsCyclometriques,
};
